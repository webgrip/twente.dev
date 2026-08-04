// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import { DEFAULT_LOCALE, LOCALES, SITE_URL } from './src/i18n/config.ts';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'never',
  build: {
    // Emit `/nl/events.html` rather than `/nl/events/index.html` so Cloudflare's
    // asset handler serves clean URLs without a trailing-slash redirect hop.
    format: 'file',
  },
  i18n: {
    locales: [...LOCALES],
    defaultLocale: DEFAULT_LOCALE,
    routing: {
      // ADR-0004: both locales carry an explicit prefix so canonical URLs and
      // hreflang alternates are never ambiguous.
      prefixDefaultLocale: true,
      // `/` is served by our own src/pages/index.astro, which carries a
      // canonical and `noindex`. Astro's generated redirect route would occupy
      // the same path and lose to it, emitting a build warning for a page that
      // never ships — so it stays off.
      redirectToDefaultLocale: false,
    },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: DEFAULT_LOCALE,
        locales: Object.fromEntries(LOCALES.map((l) => [l, l])),
      },
      /**
       * Exclude the bare root and the 404.
       *
       * `/` is a `noindex` redirect stub (ADR-0004). Left in, the sitemap
       * integration also treats it as a *third* locale variant of the
       * homepage and emits a duplicate `hreflang="nl"` alongside `/nl`,
       * which is exactly the alternate-set ambiguity the locale strategy
       * exists to avoid.
       */
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/+$/, '');
        return path !== '' && !path.endsWith('/404');
      },
    }),
  ],
  security: {
    /**
     * Astro hashes every inline script and scoped style it emits and writes
     * them into a `<meta http-equiv="content-security-policy">`. That means a
     * real CSP with **no `unsafe-inline`**, despite the pre-paint theme script
     * being inline by necessity.
     *
     * It also travels with the HTML, so the policy is byte-identical whether
     * the page is served by Cloudflare or by the nginx container in
     * ops/docker/web — which is the whole point of that container existing.
     *
     * Header-only directives (`frame-ancestors`) cannot go in a meta CSP and
     * live in `public/_headers` instead, mirrored in nginx.conf.
     */
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ],
    },
  },
  markdown: {
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: true,
    },
  },
});
