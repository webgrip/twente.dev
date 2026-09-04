import { DEFAULT_LOCALE, LOCALES, LOCALE_TAGS, SITE_URL, TIMEZONE, isLocale } from './config.ts';
import type { Locale } from './config.ts';
import { UI } from './ui.ts';
import type { UIKey } from './ui.ts';
import { alternatesFor, routePath } from './routes.ts';
import type { RouteKey } from './routes.ts';

export function useTranslations(locale: Locale) {
  const dict = UI[locale];
  return function t(key: UIKey): string {
    return dict[key];
  };
}

export function getLocaleFromUrl(url: URL): Locale {
  const [, maybeLocale] = url.pathname.split('/');
  return isLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href;
}

export interface Alternate {
  locale: Locale;
  hreflang: string;
  href: string;
}

export type SlugInput = string | Partial<Record<Locale, string>>;

export function slugFor(slug: SlugInput | undefined, locale: Locale): string | undefined {
  if (slug === undefined) return undefined;
  return typeof slug === 'string' ? slug : slug[locale];
}

export function getAlternates(
  key: RouteKey,
  slug?: SlugInput,
): { alternates: Alternate[]; xDefault: string | undefined } {
  const alternates = alternatesFor(key)
    .map(({ locale }) => {
      const localeSlug = slugFor(slug, locale);
      if (slug !== undefined && localeSlug === undefined) return undefined;
      return {
        locale,
        hreflang: LOCALE_TAGS[locale],
        href: absoluteUrl(routePath(key, locale, localeSlug)),
      };
    })
    .filter((alt): alt is Alternate => alt !== undefined);

  const defaultSlug = slugFor(slug, DEFAULT_LOCALE);
  const xDefault =
    slug === undefined || defaultSlug !== undefined
      ? absoluteUrl(routePath(key, DEFAULT_LOCALE, defaultSlug))
      : alternates[0]?.href;

  return { alternates, xDefault };
}

export function otherLocales(current: Locale): Locale[] {
  return LOCALES.filter((l) => l !== current);
}

export function pick<T>(value: Record<Locale, T>, locale: Locale): T {
  return value[locale];
}

const dateFormatters = new Map<string, Intl.DateTimeFormat>();

function formatter(locale: Locale, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}:${JSON.stringify(options)}`;
  let existing = dateFormatters.get(key);
  if (!existing) {
    existing = new Intl.DateTimeFormat(LOCALE_TAGS[locale], { timeZone: TIMEZONE, ...options });
    dateFormatters.set(key, existing);
  }
  return existing;
}

export function formatDate(date: Date, locale: Locale): string {
  return formatter(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

export function formatTime(date: Date): string {
  return formatter('nl', { hour: '2-digit', minute: '2-digit' }).format(date);
}

export function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)}–${formatTime(end)}`;
}

export function formatWeekday(date: Date, locale: Locale): string {
  return formatter(locale, { weekday: 'long' }).format(date);
}

export function formatDateTime(date: Date, locale: Locale): string {
  return formatter(locale, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function isoDate(date: Date): string {
  return date.toISOString();
}
