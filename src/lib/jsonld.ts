import { SITE_URL, TIMEZONE } from '../i18n/config.ts';
import type { Locale } from '../i18n/config.ts';
import { absoluteUrl } from '../i18n/utils.ts';
import { routePath } from '../i18n/routes.ts';
import { REGISTRATION_OPENS, REGISTRATION_URL } from '../config/site.ts';
import { postSlug } from './content.ts';
import type { CompanyEntry, EventEntry, PostEntry } from './content.ts';

type JsonLd = Record<string, unknown>;

const ORGANISATION_ID = `${SITE_URL}/#organisation`;

const DEFAULT_SCHEMA_IMAGE = '/brand/social/banner-meetup-1200x675@2x.png';

function toAmsterdamIso(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZoneName: 'longOffset',
  }).formatToParts(date);

  const get = (type: string): string => parts.find((p) => p.type === type)?.value ?? '';
  const offset = get('timeZoneName').replace('GMT', '') || '+00:00';
  const hour = get('hour') === '24' ? '00' : get('hour');

  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}:${get('second')}${offset}`;
}

export function organisationSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORGANISATION_ID,
    name: 'twente.dev',
    url: SITE_URL,
    description: "Twente's practitioner-led technology community.",
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Twente',
      containedInPlace: { '@type': 'Country', name: 'Netherlands' },
    },
  };
}

export function websiteSchema(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'twente.dev',
    inLanguage: ['nl', 'en'],
    publisher: { '@id': ORGANISATION_ID },
  };
}

export function eventSchema(event: EventEntry, locale: Locale): JsonLd {
  const online = event.data.venue.online;
  const isOwnEdition = event.data.canonicalRoute === 'edition001';

  const offers: JsonLd = {
    '@type': 'Offer',
    price: event.data.costEur,
    priceCurrency: 'EUR',
    availability:
      isOwnEdition && !REGISTRATION_URL
        ? 'https://schema.org/PreOrder'
        : 'https://schema.org/InStock',
    url: event.data.url,
    ...(isOwnEdition ? { validFrom: toAmsterdamIso(REGISTRATION_OPENS) } : {}),
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.data.title[locale],
    description: event.data.description[locale],
    image: [absoluteUrl(DEFAULT_SCHEMA_IMAGE)],
    inLanguage: event.data.language === 'both' ? locale : event.data.language,
    startDate: toAmsterdamIso(event.data.start),
    ...(event.data.end ? { endDate: toAmsterdamIso(event.data.end) } : {}),
    eventStatus: event.data.cancelled
      ? 'https://schema.org/EventCancelled'
      : 'https://schema.org/EventScheduled',
    eventAttendanceMode: online
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    location: online
      ? { '@type': 'VirtualLocation', url: event.data.url }
      : {
          '@type': 'Place',
          name: event.data.venue.name ?? event.data.venue.city,
          address: {
            '@type': 'PostalAddress',
            ...(event.data.venue.address ? { streetAddress: event.data.venue.address } : {}),
            addressLocality: event.data.venue.city,
            addressRegion: 'Overijssel',
            addressCountry: 'NL',
          },
        },
    organizer: {
      '@type': 'Organization',
      name: event.data.organiser.name,
      ...(event.data.organiser.url ? { url: event.data.organiser.url } : {}),
    },
    url: absoluteUrl(
      event.data.canonicalRoute
        ? routePath(event.data.canonicalRoute, locale)
        : routePath('events', locale, event.id),
    ),
    offers,
    isAccessibleForFree: event.data.costEur === 0,
  };
}

export function articleSchema(post: PostEntry, locale: Locale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.data.title,
    description: post.data.description,
    image: [absoluteUrl(DEFAULT_SCHEMA_IMAGE)],
    inLanguage: locale,
    datePublished: toAmsterdamIso(post.data.publishedAt),
    ...(post.data.updatedAt ? { dateModified: toAmsterdamIso(post.data.updatedAt) } : {}),
    author: {
      '@type': 'Person',
      name: post.data.author.name,
      ...(post.data.author.url ? { url: post.data.author.url } : {}),
    },
    publisher: { '@id': ORGANISATION_ID },
    url: absoluteUrl(routePath('blog', locale, postSlug(post))),
    mainEntityOfPage: absoluteUrl(routePath('blog', locale, postSlug(post))),
    keywords: post.data.tags.join(', '),
  };
}

export function organizationSchemaForCompany(company: CompanyEntry, locale: Locale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: company.data.name,
    url: company.data.website,
    description: company.data.description[locale],
    address: company.data.locations.map((city) => ({
      '@type': 'PostalAddress',
      addressLocality: city,
      addressRegion: 'Overijssel',
      addressCountry: 'NL',
    })),
    ...(company.data.socials
      ? { sameAs: Object.values(company.data.socials).filter(Boolean) }
      : {}),
  };
}

export interface Crumb {
  name: string;
  path: string;
}

export function breadcrumbSchema(crumbs: Crumb[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export { TIMEZONE };
