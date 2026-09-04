import { LOCALES } from './config.ts';
import type { Locale } from './config.ts';

export const ROUTES = {
  home: { nl: '', en: '' },
  release001: { nl: '001', en: '001' },
  events: { nl: 'events', en: 'events' },
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
  thanks: { nl: 'bedankt', en: 'thanks' },
  confirmed: { nl: 'bevestigd', en: 'confirmed' },
  search: { nl: 'zoeken', en: 'search' },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof ROUTES;

export function routePath(key: RouteKey, locale: Locale, slug?: string): string {
  const segment = ROUTES[key][locale];
  const parts = [locale, segment, slug].filter((p): p is string => Boolean(p));
  return `/${parts.join('/')}`;
}

export function alternatesFor(
  key: RouteKey,
  slug?: string,
): Array<{ locale: Locale; path: string }> {
  return LOCALES.map((locale) => ({ locale, path: routePath(key, locale, slug) }));
}
