import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright-core';

import { mkdir } from 'node:fs/promises';

const repo = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const socialDir = `${repo}/public/brand/social`;

const destinationFor = (name, edition) =>
  edition && name.includes(`-${edition}-`)
    ? `${socialDir}/meetup/${edition}`
    : socialDir;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 3100, height: 1400 } });
let total = 0;
let edition = null;
for (const tpl of ['banners.html', 'cover-16x9.html']) {
  await page.goto(`file://${repo}/docs/brand/templates/${tpl}`, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  edition ??= await page.evaluate(() => (typeof EDITIE === 'undefined' ? null : EDITIE.nr));
  const names = await page.$$eval('[data-export]', (els) => els.map((e) => e.dataset.export));
  for (const name of names) {
    const el = page.locator(`[data-export="${name}"]`);
    const box = await el.boundingBox();
    const dir = destinationFor(name, edition);
    await mkdir(dir, { recursive: true });
    await el.screenshot({ path: `${dir}/${name}.png` });
    console.log(`exported ${dir.replace(repo + '/', '')}/${name}.png  ${box.width}x${box.height}`);
    total += 1;
  }
}
await browser.close();
console.log(`${total} banners exported; editie-specifieke set in public/brand/social/meetup/${edition ?? '?'}/`);
