export const LOCALES = ['nl', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'nl';

export const SITE_URL = 'https://twente.dev';

export const LOCALE_TAGS: Record<Locale, string> = {
  nl: 'nl-NL',
  en: 'en-GB',
};

export const LOCALE_NAMES: Record<Locale, string> = {
  nl: 'Nederlands',
  en: 'English',
};

export const TIMEZONE = 'Europe/Amsterdam';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}
