/**
 * axe-core accessibility gate (10x-plan §6.6 item 5).
 *
 * Lighthouse already asserts `categories:accessibility` at 1.0, but that score
 * is a sampling heuristic — it misses most ARIA and focus-order defects. This
 * runs the real axe rule set and fails on serious/critical violations.
 *
 * The page list is READ FROM `lighthouserc.json` rather than duplicated, so the
 * two gates cannot drift apart. A handful of extra pages are appended here: the
 * 404 and the English search page matter for accessibility but are not worth a
 * performance budget, so they do not belong in the Lighthouse list.
 *
 * Browser: `playwright-core`, not `playwright` — core skips the ~150MB browser
 * download at install time, and every environment that runs this already has
 * Chrome (CI runs inside `cypress/browsers`, the same container the Lighthouse
 * job uses). Point CHROME_PATH somewhere else to override.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import type { AddressInfo } from 'node:net';

const DIST = 'dist';
const CHROME = process.env.CHROME_PATH ?? '/usr/bin/google-chrome';

/**
 * Pages axe should cover that carry no Lighthouse budget.
 *
 * The press pages earn their place: journalists are sent there, they carry the
 * whole downloadable brand kit, and the 2026-08-30 brand reconciliation rewrote
 * both of them — a change neither gate would have caught, because press is in
 * no Lighthouse URL set either. The partners pages matter for the same reason
 * in reverse: their content is a promise to community organisers, guarded by
 * validate-commitments, and an unusable page keeps its promises to nobody.
 */
const A11Y_ONLY_PAGES = [
  '/404.html',
  '/en/search.html',
  '/en/partners.html',
  '/nl/partners.html',
  '/en/press.html',
  '/nl/pers.html',
  // The contribute pages carry the site's only form controls (ADR-0010) —
  // labels, required markers and a script that swaps a fallback for a form.
  // Nothing else on the site exercises those rules, so if they are not here
  // they are covered by no gate at all.
  '/nl/bijdragen.html',
  '/en/contribute.html',
];

/** Anything at or above these impacts fails the build. */
const BLOCKING_IMPACTS = new Set(['serious', 'critical']);

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

async function pageList(): Promise<string[]> {
  const rc = JSON.parse(await readFile('lighthouserc.json', 'utf8')) as {
    ci?: { collect?: { url?: string[] } };
  };
  const shared = (rc.ci?.collect?.url ?? []).map((u) => new URL(u).pathname);
  if (shared.length === 0) {
    throw new Error('lighthouserc.json lists no URLs — the shared page list is the point');
  }
  return [...new Set([...shared, ...A11Y_ONLY_PAGES])];
}

/**
 * Serves `dist/` so axe sees the built output, not `astro dev`. Pagefind's
 * index and the hashed asset bundles only exist after a real build, and the
 * search page is precisely where the interesting violations live.
 */
function serveDist() {
  return createServer((req, res) => {
    // normalize() collapses any ../ before it can escape dist/.
    const path = normalize(decodeURIComponent((req.url ?? '/').split('?')[0] ?? '/'));
    const file = join(DIST, path.endsWith('/') ? `${path}index.html` : path);
    readFile(file)
      .then((body) => {
        res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
        res.end(body);
      })
      .catch(() => {
        res.writeHead(404, { 'content-type': 'text/plain' });
        res.end('not found');
      });
  });
}

const pages = await pageList();
const server = serveDist();
await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address() as AddressInfo;

const { chromium } = await import('playwright-core');
const { default: AxeBuilder } = await import('@axe-core/playwright');

const browser = await chromium.launch({
  executablePath: CHROME,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const context = await browser.newContext();

let blocking = 0;
let advisory = 0;

for (const path of pages) {
  const page = await context.newPage();
  try {
    const response = await page.goto(`http://127.0.0.1:${port}${path}`, {
      waitUntil: 'load',
      timeout: 20_000,
    });
    if (!response?.ok()) {
      console.error(`✗ ${path} — HTTP ${response?.status() ?? 'no response'}`);
      blocking += 1;
      continue;
    }
    const { violations } = await new AxeBuilder({ page }).analyze();
    const bad = violations.filter((v) => BLOCKING_IMPACTS.has(v.impact ?? ''));
    advisory += violations.length - bad.length;
    blocking += bad.length;

    if (violations.length === 0) {
      console.log(`✓ ${path}`);
    } else {
      console.log(`${bad.length > 0 ? '✗' : '!'} ${path}`);
      for (const v of violations) {
        const mark = BLOCKING_IMPACTS.has(v.impact ?? '') ? '✗' : '!';
        console.log(`    ${mark} [${v.impact}] ${v.id}: ${v.help}`);
        for (const node of v.nodes.slice(0, 3)) {
          console.log(`        ${node.target.join(' ')}`);
        }
        console.log(`        ${v.helpUrl}`);
      }
    }
  } finally {
    await page.close();
  }
}

await browser.close();
await new Promise<void>((resolve) => server.close(() => resolve()));

console.log(
  `\naxe: ${pages.length} page(s) · ${blocking} blocking (serious/critical) · ${advisory} advisory`,
);

if (blocking > 0) {
  console.error(
    '\nSerious or critical accessibility violations. Fix them in the component, ' +
      'not by editing page markup to silence the rule.',
  );
  process.exit(1);
}
