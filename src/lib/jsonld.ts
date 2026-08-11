import { SITE_URL, TIMEZONE } from '../i18n/config.ts';
import type { Locale } from '../i18n/config.ts';
import { absoluteUrl } from '../i18n/utils.ts';
import { routePath } from '../i18n/routes.ts';
import { postSlug } from './content.ts';
import type { CompanyEntry, EventEntry, JobEntry, PostEntry } from './content.ts';

/**
 * schema.org JSON-LD.
 *
 * This module is plan lever L1 and L2: correct `JobPosting` and `Event` markup
 * is what puts a *static* site into Google for Jobs and Google Events. It is
 * the highest-leverage code in the repository per line, and also the easiest
 * to get subtly wrong — Google silently ignores malformed entries rather than
 * reporting an error, so changes here should be checked against the Rich
 * Results Test before merging.
 */

type JsonLd = Record<string, unknown>;

const ORGANISATION_ID = `${SITE_URL}/#organisation`;

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

export function websiteSchema(locale: Locale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: 'twente.dev',
    inLanguage: locale,
    publisher: { '@id': ORGANISATION_ID },
  };
}

/**
 * `JobPosting` — the Google for Jobs contract.
 *
 * Notes on the fields Google actually cares about:
 *  - `validThrough` is required by our schema precisely so this is never absent.
 *  - `hiringOrganization` must resolve to a real company with a real URL.
 *  - `jobLocationType: TELECOMMUTE` is only valid for fully remote roles, and
 *    Google requires `applicantLocationRequirements` alongside it.
 *  - `baseSalary` is omitted entirely when undisclosed. An invented or
 *    zero-value salary is worse than none — it poisons the listing's quality.
 */
export function jobPostingSchema(job: JobEntry, company: CompanyEntry, locale: Locale): JsonLd {
  const isRemote = job.data.workplace === 'remote';

  const schema: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.data.title[locale],
    description: job.data.description[locale],
    inLanguage: locale,
    datePosted: job.data.postedAt.toISOString(),
    validThrough: job.data.validThrough.toISOString(),
    employmentType: employmentTypeToSchema(job.data.employmentType),
    url: absoluteUrl(routePath('jobs', locale, job.id)),
    directApply: false,
    hiringOrganization: {
      '@type': 'Organization',
      name: company.data.name,
      sameAs: company.data.website,
      url: company.data.website,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.data.city,
        addressRegion: 'Overijssel',
        addressCountry: 'NL',
      },
    },
    skills: job.data.stack.join(', '),
  };

  if (isRemote) {
    schema.jobLocationType = 'TELECOMMUTE';
    schema.applicantLocationRequirements = { '@type': 'Country', name: 'Netherlands' };
  }

  if (job.data.salary) {
    schema.baseSalary = {
      '@type': 'MonetaryAmount',
      currency: job.data.salary.currency,
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.data.salary.min,
        maxValue: job.data.salary.max,
        unitText: job.data.salary.period,
      },
    };
  }

  return schema;
}

function employmentTypeToSchema(type: JobEntry['data']['employmentType']): string {
  switch (type) {
    case 'full-time':
      return 'FULL_TIME';
    case 'part-time':
      return 'PART_TIME';
    case 'contract':
      return 'CONTRACTOR';
    case 'internship':
      return 'INTERN';
    case 'temporary':
      return 'TEMPORARY';
  }
}

/**
 * `Event` — the Google Events contract.
 *
 * `eventStatus` must flip to `EventCancelled` rather than the entry being
 * deleted: subscribers who already added it to their calendar need the update
 * to propagate, which only happens if the event keeps existing.
 */
export function eventSchema(event: EventEntry, locale: Locale): JsonLd {
  const online = event.data.venue.online;

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.data.title[locale],
    description: event.data.description[locale],
    inLanguage: event.data.language === 'both' ? locale : event.data.language,
    startDate: event.data.start.toISOString(),
    ...(event.data.end ? { endDate: event.data.end.toISOString() } : {}),
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
          name: event.data.venue.name,
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
    offers: {
      '@type': 'Offer',
      price: event.data.costEur,
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
      url: event.data.url,
      validFrom: new Date().toISOString(),
    },
    isAccessibleForFree: event.data.costEur === 0,
  };
}

export function articleSchema(post: PostEntry, locale: Locale): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.data.title,
    description: post.data.description,
    inLanguage: locale,
    datePublished: post.data.publishedAt.toISOString(),
    ...(post.data.updatedAt ? { dateModified: post.data.updatedAt.toISOString() } : {}),
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
