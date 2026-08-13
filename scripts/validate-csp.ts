/**
 * Assert every executable inline script in the built site is authorised by that
 * page's own meta CSP.
 *
 * Why this exists: search shipped broken and nothing noticed. The Pagefind
 * initialiser used `define:vars`, which forces `is:inline`, and Astro's CSP
 * feature does not hash `is:inline` scripts — so the browser blocked the one
 * script that starts the search UI, and every page still built, tested and
 * deployed green. The failure was invisible to `astro build`, to the unit
 * tests, and to Lighthouse (the search page was not in its URL set).
 *
 * Runs as part of `pnpm build`, so a violation fails the build everywhere —
 * locally and in CI — rather than becoming a live bug someone finds later.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';

/** Script types the browser actually executes. Anything else (ld+json, importmap-as-data, templates) is inert. */
const EXECUTABLE_TYPES = new Set(['', 'module', 'text/javascript', 'application/javascript']);

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? htmlFiles(path) : path.endsWith('.html') ? [path] : [];
  });
}

/**
 * The CSP Astro emits as `<meta http-equiv="content-security-policy" content="…">`.
 *
 * Capture the quote character and backreference it. A naive `["']([^"']*)["']`
 * truncates at the first inner quote — and CSP values are full of them
 * (`'self'`, `'wasm-unsafe-eval'`, `'sha256-…'`), so it silently returns a
 * fragment and every legitimate script then looks unauthorised.
 */
function metaCsp(html: string): string | null {
  const match = html.match(
    /<meta[^>]+http-equiv=(["'])content-security-policy\1[^>]*content=(["'])([\s\S]*?)\2/i,
  );
  return match?.[3] ?? null;
}

/** Offset of the meta CSP element, or -1. A meta-delivered policy governs only what follows it. */
function metaCspOffset(html: string): number {
  return html.search(/<meta[^>]+http-equiv=["']content-security-policy["']/i);
}

/**
 * Inline scripts that the meta CSP actually governs.
 *
 * Document order is load-bearing, not a detail. Astro emits the pre-paint theme
 * script BEFORE the CSP meta on purpose — it has to run before first paint — and a
 * meta-delivered policy does not apply to markup above itself, so that script is
 * unhashed and executes fine. Checking it anyway reports a violation on every page
 * of the site while a real browser reports none (verified: nl.html scores
 * errors-in-console 1 and best-practices 1).
 */
function governedInlineScripts(
  html: string,
  cspOffset: number,
): Array<{ type: string; body: string }> {
  const scripts: Array<{ type: string; body: string }> = [];
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m.index < cspOffset) continue; // above the policy — not governed by it
    const attrs = m[1] ?? '';
    if (/\bsrc\s*=/.test(attrs)) continue; // external: admitted by 'self', never hashed
    scripts.push({
      type: (attrs.match(/\btype\s*=\s*["']([^"']*)["']/i)?.[1] ?? '').toLowerCase(),
      body: m[2] ?? '',
    });
  }
  return scripts;
}

const failures: string[] = [];
let checked = 0;
let scriptsChecked = 0;

for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8');
  const cspOffset = metaCspOffset(html);
  if (cspOffset === -1) continue; // no meta policy on this page: nothing to enforce
  const csp = metaCsp(html);
  const scripts = governedInlineScripts(html, cspOffset).filter((s) =>
    EXECUTABLE_TYPES.has(s.type),
  );
  if (scripts.length === 0) continue;
  checked++;

  if (csp === null) {
    failures.push(`${file}: has a meta CSP element whose content attribute could not be parsed`);
    continue;
  }

  const allowed = new Set(csp.match(/sha256-[A-Za-z0-9+/=]+/g) ?? []);
  for (const script of scripts) {
    scriptsChecked++;
    const hash = `sha256-${createHash('sha256').update(script.body, 'utf8').digest('base64')}`;
    if (!allowed.has(hash)) {
      const preview = script.body.trim().replace(/\s+/g, ' ').slice(0, 90);
      failures.push(
        `${file}: inline script not authorised by the page's own CSP\n` +
          `    computed ${hash}\n` +
          `    script   ${preview}…\n` +
          `    fix: drop \`is:inline\`/\`define:vars\` so Astro bundles and hashes it ` +
          `(pass data via a data- attribute instead)`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error(`\nCSP validation failed — ${failures.length} blocked inline script(s):\n`);
  for (const f of failures) console.error(`  ${f}\n`);
  process.exit(1);
}

console.log(
  `csp: ${scriptsChecked} inline script(s) across ${checked} page(s) — all hash-authorised`,
);
