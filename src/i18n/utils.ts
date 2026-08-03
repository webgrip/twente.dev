import { DEFAULT_LOCALE, LOCALES, LOCALE_TAGS, SITE_URL, TIMEZONE, isLocale } from './config.ts';
import type { Locale } from './config.ts';
import { UI } from './ui.ts';
import type { UIKey } from './ui.ts';
import { alternatesFor, routePath } from './routes.ts';
import type { RouteKey } from './routes.ts';

/**
 * Returns a translate function bound to a locale.
 *
 * There is deliberately no runtime fallback to the default locale: a missing
 * key is a type error at build time (see `ui.ts`), so silently rendering Dutch
 * inside an English page can never happen.
 */
export function useTranslations(locale: Locale) {
  const dict = UI[locale];
  return function t(key: UIKey): string {
    return dict[key];
  };
}

/** Extracts the locale from a URL, falling back to the default. */
export function getLocaleFromUrl(url: URL): Locale {
  const [, maybeLocale] = url.pathname.split('/');
  return isLocale(maybeLocale) ? maybeLocale : DEFAULT_LOCALE;
}

/** Absolute URL, for canonicals, JSON-LD, RSS and OG tags. */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href;
}

export interface Alternate {
  locale: Locale;
  /** BCP 47 tag for the `hreflang` attribute. */
  hreflang: string;
  href: string;
}

/**
 * A page's slug per locale. Most content shares one slug across locales, but
 * blog posts do not: `/nl/blog/waarom-twente-dev` and
 * `/en/blog/why-twente-dev-exists` are the same article under different slugs.
 */
export type SlugInput = string | Partial<Record<Locale, string>>;

/** The slug to use when rendering `locale`, or `undefined` if absent there. */
export function slugFor(slug: SlugInput | undefined, locale: Locale): string | undefined {
  if (slug === undefined) return undefined;
  return typeof slug === 'string' ? slug : slug[locale];
}

/**
 * Every locale variant of a page, plus `x-default`.
 *
 * Emitting a complete, self-referencing alternate set on every page is what
 * makes the bilingual strategy actually pay off in search (plan lever L3);
 * a partial set is worse than none.
 *
 * Derived from a `RouteKey` rather than the current pathname, because route
 * segments are themselves localized (`/nl/vacatures` ↔ `/en/jobs`).
 *
 * A locale with no slug is **omitted entirely**. Pointing `hreflang` at a page
 * that does not exist — which is what a shared-slug assumption would do for an
 * untranslated article — is worse than declaring no alternate at all.
 */
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

  // x-default points at the default locale when it exists, else the only
  // version there is — never at a URL we did not build.
  const defaultSlug = slugFor(slug, DEFAULT_LOCALE);
  const xDefault =
    slug === undefined || defaultSlug !== undefined
      ? absoluteUrl(routePath(key, DEFAULT_LOCALE, defaultSlug))
      : alternates[0]?.href;

  return { alternates, xDefault };
}

/** The other locales, for rendering a switcher. */
export function otherLocales(current: Locale): Locale[] {
  return LOCALES.filter((l) => l !== current);
}

/**
 * Picks the field for the current locale from a `{ nl, en }` translatable
 * value. Used by collections whose entries are one entity with translated
 * fields (events, jobs, companies) rather than per-locale documents.
 */
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

/** e.g. "12 september 2026" / "12 September 2026" */
export function formatDate(date: Date, locale: Locale): string {
  return formatter(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

/** e.g. "do 12 sep 2026, 19:30" — always rendered in Europe/Amsterdam. */
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

/** Machine-readable value for `<time datetime>` and JSON-LD. */
export function isoDate(date: Date): string {
  return date.toISOString();
}
