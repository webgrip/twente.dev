import { defineConfig } from 'eslint/config';
import webgrip from '@webgrip/eslint-config-astro';

export default defineConfig([
  ...webgrip,
  {
    files: ['scripts/export-banners.mjs'],
    languageOptions: { globals: { document: 'readonly', EDITIE: 'readonly' } },
  },
  {
    files: ['docs/brand/templates/**/*.js'],
    languageOptions: { globals: { window: 'readonly' } },
  },
]);
