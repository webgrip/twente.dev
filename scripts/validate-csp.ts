import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = 'dist';

const EXECUTABLE_TYPES = new Set(['', 'module', 'text/javascript', 'application/javascript']);

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? htmlFiles(path) : path.endsWith('.html') ? [path] : [];
  });
}

function metaCsp(html: string): string | null {
  const match = html.match(
    /<meta[^>]+http-equiv=(["'])content-security-policy\1[^>]*content=(["'])([\s\S]*?)\2/i,
  );
  return match?.[3] ?? null;
}

function metaCspOffset(html: string): number {
  return html.search(/<meta[^>]+http-equiv=["']content-security-policy["']/i);
}

function governedInlineScripts(
  html: string,
  cspOffset: number,
): Array<{ type: string; body: string }> {
  const scripts: Array<{ type: string; body: string }> = [];
  const re = /<script([^>]*)>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m.index < cspOffset) continue;
    const attrs = m[1] ?? '';
    if (/\bsrc\s*=/.test(attrs)) continue;
    scripts.push({
      type: (attrs.match(/\btype\s*=\s*["']([^"']*)["']/i)?.[1] ?? '').toLowerCase(),
      body: m[2] ?? '',
    });
  }
  return scripts;
}

function governedInlineStyles(html: string, cspOffset: number): string[] {
  const styles: string[] = [];
  const re = /<style(?:[^>]*)>([\s\S]*?)<\/style>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m.index < cspOffset) continue;
    styles.push(m[1] ?? '');
  }
  return styles;
}

function directiveHashes(csp: string, directive: string): Set<string> {
  const segment = csp
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith(`${directive} `) || s === directive);
  return new Set(segment?.match(/sha256-[A-Za-z0-9+/=]+/g) ?? []);
}

const failures: string[] = [];
let checked = 0;
let scriptsChecked = 0;
let stylesChecked = 0;

for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8');
  const cspOffset = metaCspOffset(html);
  if (cspOffset === -1) continue;
  const csp = metaCsp(html);
  const scripts = governedInlineScripts(html, cspOffset).filter((s) =>
    EXECUTABLE_TYPES.has(s.type),
  );
  const styles = governedInlineStyles(html, cspOffset);
  if (scripts.length === 0 && styles.length === 0) continue;
  checked++;

  if (csp === null) {
    failures.push(`${file}: has a meta CSP element whose content attribute could not be parsed`);
    continue;
  }

  const allowedScripts = directiveHashes(csp, 'script-src');
  for (const script of scripts) {
    scriptsChecked++;
    const hash = `sha256-${createHash('sha256').update(script.body, 'utf8').digest('base64')}`;
    if (!allowedScripts.has(hash)) {
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

  const allowedStyles = directiveHashes(csp, 'style-src');
  for (const style of styles) {
    stylesChecked++;
    const hash = `sha256-${createHash('sha256').update(style, 'utf8').digest('base64')}`;
    if (!allowedStyles.has(hash)) {
      const preview = style.trim().replace(/\s+/g, ' ').slice(0, 90);
      failures.push(
        `${file}: inline stylesheet not authorised by the page's own CSP\n` +
          `    computed ${hash}\n` +
          `    style    ${preview}…\n` +
          `    fix: let Astro emit the style (it hashes what it emits); ` +
          `a hand-written raw <style> in a layout/page body is never hashed`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error(`\nCSP validation failed — ${failures.length} blocked inline resource(s):\n`);
  for (const f of failures) console.error(`  ${f}\n`);
  process.exit(1);
}

console.log(
  `csp: ${scriptsChecked} inline script(s) + ${stylesChecked} inline style(s) across ` +
    `${checked} page(s) — all hash-authorised`,
);
