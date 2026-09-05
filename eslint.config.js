import { defineConfig } from 'eslint/config';
import webgrip from '@webgrip/eslint-config-astro';

export default defineConfig([
  ...webgrip,
  {
    files: ['scripts/export-banners.mjs'],
    languageOptions: { globals: { document: 'readonly', RELEASE: 'readonly' } },
  },
  {
    files: ['docs/brand/templates/**/*.js'],
    languageOptions: { globals: { window: 'readonly' } },
  },
  {
    files: ['.releaserc.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { require: 'readonly', module: 'writable' },
    },
    rules: { '@typescript-eslint/no-require-imports': 'off' },
  },
]);
