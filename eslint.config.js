import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default defineConfig([
  globalIgnores(['dist/**', '.astro/**', 'node_modules/**', '.wrangler/**']),
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // Node-side scripts legitimately write to stdout.
    files: ['scripts/**/*.ts', 'scripts/**/*.mjs'],
    rules: { 'no-console': 'off' },
  },
  {
    // Plain-JS config files and Node-side scripts run in Node. typescript-eslint
    // already disables `no-undef` for .ts files (the compiler covers it), but not
    // for these. The glob needs both halves: `*.mjs` matches only the repo root.
    files: ['*.js', '*.mjs', 'scripts/**/*.mjs'],
    languageOptions: {
      globals: {
        Buffer: 'readonly',
        URL: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        process: 'readonly',
      },
    },
  },
  {
    // The banner exporter passes callbacks to playwright, which serialises them
    // and runs them inside the page — so `document` is a browser global here,
    // not a Node one.
    files: ['scripts/export-banners.mjs'],
    languageOptions: { globals: { document: 'readonly' } },
  },
]);
