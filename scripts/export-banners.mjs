// Export the social-banner masters from docs/brand/templates/banners.html.
// Each element with [data-export] is screenshotted at its native pixel size
// (the .art blocks are laid out at @2x) into public/brand/social/<name>.png.
//
// Usage: node scripts/export-banners.mjs
// Needs: the repo's playwright-core + a cached Chromium (the axe test setup).
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright-core';

const repo = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = `${repo}/public/brand/social`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 3100, height: 1400 } });
let total = 0;
for (const tpl of ['banners.html', 'cover-16x9.html']) {
  await page.goto(`file://${repo}/docs/brand/templates/${tpl}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const names = await page.$$eval('[data-export]', els => els.map(e => e.dataset.export));
  for (const name of names) {
    const el = page.locator(`[data-export="${name}"]`);
    const box = await el.boundingBox();
    await el.screenshot({ path: `${outDir}/${name}.png` });
    console.log(`exported ${name}.png  ${box.width}x${box.height}`);
    total += 1;
  }
}
await browser.close();
console.log(`${total} banners -> public/brand/social/`);
