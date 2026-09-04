// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import { DEFAULT_LOCALE, LOCALES, SITE_URL } from './src/i18n/config.ts';
import { NEWSLETTER_FORM_ACTION } from './src/config/site.ts';

const newsletterOrigin = NEWSLETTER_FORM_ACTION ? new URL(NEWSLETTER_FORM_ACTION).origin : null;

const formAction = ["'self'", ...(newsletterOrigin ? [newsletterOrigin] : [])].join(' ');

const connectSrc = [
  "'self'",
  'https://telemetry.webgrip.dev',
  ...(newsletterOrigin ? [newsletterOrigin] : []),
].join(' ');

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  compressHTML: false,
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
  i18n: {
    locales: [...LOCALES],
    defaultLocale: DEFAULT_LOCALE,
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/+$/, '');
        const noindexPaths = new Set([
          '',
          '/001',
          '/styleguide',
          '/nl/zoeken',
          '/en/search',
          '/nl/bedankt',
          '/en/thanks',
          '/nl/bevestigd',
          '/en/confirmed',
        ]);
        return !noindexPaths.has(path) && !path.endsWith('/404');
      },
    }),
  ],
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        `connect-src ${connectSrc}`,
        "base-uri 'self'",
        `form-action ${formAction}`,
        "object-src 'none'",
      ],
      scriptDirective: {
        resources: ["'self'", "'wasm-unsafe-eval'"],
      },
      styleDirective: {
        resources: ["'self'"],
      },
    },
  },
  markdown: {
    syntaxHighlight: 'prism',
  },
});
