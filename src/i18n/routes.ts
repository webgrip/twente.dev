import { LOCALES } from './config.ts';
import type { Locale } from './config.ts';

/**
 * Localized route segments.
 *
 * Dutch visitors search for "vacatures", not "jobs". Serving `/nl/vacatures`
 * and `/en/jobs` doubles the keyword surface for the same content, which is
 * the whole point of running bilingual (plan lever L3).
 *
 * The consequence: an `hreflang` alternate can NOT be derived by swapping the
 * locale prefix in a URL — `/nl/vacatures` and `/en/vacatures` are not the same
 * page, and the latter does not exist. Alternates are therefore always computed
 * from a `RouteKey` via `alternatesFor()`, never from a pathname.
 */
export const ROUTES = {
  home: { nl: '', en: '' },
  /** Flagship editions keep their brand form: twente.dev/001 → /nl/001, /en/001. */
  edition001: { nl: '001', en: '001' },
  events: { nl: 'events', en: 'events' },
  jobs: { nl: 'vacatures', en: 'jobs' },
  companies: { nl: 'bedrijven', en: 'companies' },
  communities: { nl: 'communities', en: 'communities' },
  blog: { nl: 'blog', en: 'blog' },
  about: { nl: 'over', en: 'about' },
  partners: { nl: 'partners', en: 'partners' },
  contribute: { nl: 'bijdragen', en: 'contribute' },
  press: { nl: 'pers', en: 'press' },
  guidelines: { nl: 'richtlijnen', en: 'guidelines' },
  conduct: { nl: 'gedragscode', en: 'code-of-conduct' },
  privacy: { nl: 'privacy', en: 'privacy' },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof ROUTES;

/**
 * Builds the locale-prefixed path for a route, optionally with a content slug.
 *
 * `routePath('jobs', 'nl')`            → `/nl/vacatures`
 * `routePath('jobs', 'en', 'foo-bar')` → `/en/jobs/foo-bar`
 * `routePath('home', 'nl')`            → `/nl`
 */
export function routePath(key: RouteKey, locale: Locale, slug?: string): string {
  const segment = ROUTES[key][locale];
  const parts = [locale, segment, slug].filter((p): p is string => Boolean(p));
  return `/${parts.join('/')}`;
}

/** Every locale's path for one logical page — the input to `hreflang`. */
export function alternatesFor(
  key: RouteKey,
  slug?: string,
): Array<{ locale: Locale; path: string }> {
  return LOCALES.map((locale) => ({ locale, path: routePath(key, locale, slug) }));
}
