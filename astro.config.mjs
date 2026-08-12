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
      /**
       * No `i18n` block on purpose. The integration derives alternates by
       * swapping locale prefixes, which cannot work for our localized path
       * segments (/nl/vacatures ↔ /en/jobs, per-locale blog slugs — see
       * src/i18n/routes.ts). It annotated only the 21 prefix-symmetric URLs,
       * with bare `nl`/`en` codes and no x-default, contradicting the
       * complete hreflang cluster BaseHead already emits on every page.
       * Partial sitemap annotations are worse than none; the on-page
       * hreflang is the single source of truth.
       */

      /**
       * Exclude everything that renders `noindex`: the root and /001
       * redirect stubs (ADR-0004), the 404, the styleguide (internal design
       * reference) and the search pages. A sitemap entry says "index me";
       * submitting a noindex page hands Search Console a contradiction.
       */
      filter: (page) => {
        const path = new URL(page).pathname.replace(/\/+$/, '');
        const noindexPaths = new Set(['', '/001', '/styleguide', '/nl/zoeken', '/en/search']);
        return !noindexPaths.has(path) && !path.endsWith('/404');
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
      /**
       * Pagefind's UI is a same-origin script that instantiates WebAssembly,
       * and its stylesheet is a same-origin file — neither is emitted by
       * Astro, so neither gets a hash. `'self'` admits them;
       * `'wasm-unsafe-eval'` permits WASM compilation only (NOT `eval()` —
       * this is the narrow variant). Astro appends its per-page hashes to
       * these sources.
       */
      scriptDirective: {
        resources: ["'self'", "'wasm-unsafe-eval'"],
      },
      styleDirective: {
        resources: ["'self'"],
      },
    },
  },
  markdown: {
    /**
     * Prism, not Shiki. Shiki emits inline `style=""` attributes, which the
     * hash-based CSP above cannot authorize (hashes cover elements, not
     * attributes) — the first blog post with a code fence would ship with its
     * highlighting stripped by the browser. Prism emits classes; the theme
     * lives in global.css, mapped onto the design tokens so code blocks
     * follow light/dark like everything else.
     */
    syntaxHighlight: 'prism',
  },
});
