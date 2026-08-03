/**
 * Locale configuration — the single source of truth, imported by both
 * `astro.config.mjs` and application code so the two can never drift.
 *
 * ADR-0004: both locales carry an explicit URL prefix (`/nl/…`, `/en/…`).
 * Dutch is the default because region-intent queries ("developer vacatures
 * Twente", "meetup Enschede") are the highest-conversion entry point, but
 * English is a peer language, not a translation afterthought.
 */

export const LOCALES = ['nl', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'nl';

export const SITE_URL = 'https://twente.dev';

/** BCP 47 tags for `hreflang`, `<html lang>` and `Intl` formatting. */
export const LOCALE_TAGS: Record<Locale, string> = {
  nl: 'nl-NL',
  en: 'en-GB',
};

/** Names shown in the locale switcher, each written in its own language. */
export const LOCALE_NAMES: Record<Locale, string> = {
  nl: 'Nederlands',
  en: 'English',
};

export const TIMEZONE = 'Europe/Amsterdam';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}
