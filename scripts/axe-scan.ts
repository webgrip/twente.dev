import { runAxeScan } from '@webgrip/astro-site-toolkit/axe-engine';

const A11Y_ONLY_PAGES = [
  '/404.html',
  '/en/search.html',
  '/en/partners.html',
  '/nl/partners.html',
  '/en/press.html',
  '/nl/pers.html',
  '/nl/bijdragen.html',
  '/en/contribute.html',
];

const BLOCKING_IMPACTS = ['minor', 'moderate', 'serious', 'critical'];

await runAxeScan({ a11yOnlyPages: A11Y_ONLY_PAGES, blockingImpacts: BLOCKING_IMPACTS });
