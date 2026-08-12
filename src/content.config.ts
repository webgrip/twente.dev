import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
// Imported directly rather than via the deprecated `astro:content` re-export.
// Pinned to the same zod major Astro itself uses.
import { z } from 'zod';

import { LOCALES } from './i18n/config.ts';
import { ROUTES } from './i18n/routes.ts';

const ROUTE_KEYS = Object.keys(ROUTES) as [keyof typeof ROUTES, ...(keyof typeof ROUTES)[]];

/**
 * Content collections — the contribution contract.
 *
 * Every community submission (a job, an event, a company) lands here as a
 * versioned file and is validated at build time. A malformed contribution
 * fails CI before a human reviews it, which is what makes it safe to accept
 * pull requests from people we have never met (plan ADR-0005).
 *
 * Two shapes are used deliberately:
 *
 *  - **Locale-owned documents** (`posts`): an article is *written* in one
 *    language. Translations are sibling files linked by `translationKey`.
 *  - **Translatable fields** (`events`, `jobs`, `companies`, `communities`):
 *    a job at one employer is one job, not two — only its prose is bilingual.
 */

/** A value that must exist in every locale. Adding a locale changes this shape. */
const i18nString = z.object({
  nl: z.string().min(1),
  en: z.string().min(1),
});

/**
 * Marks an entry as invented demo content. Rendered with a visible
 * "Voorbeelddata / Example data" tag, and `pnpm validate:content` fails when
 * one is present with FIXTURES_ALLOWED unset — so fixtures physically cannot
 * reach production. A source comment can't enforce "delete before launch";
 * this field can.
 */
const fixture = z.boolean().default(false);

const TWENTE_CITIES = [
  'Enschede',
  'Hengelo',
  'Almelo',
  'Oldenzaal',
  'Borne',
  'Rijssen',
  'Haaksbergen',
  'Losser',
  'Dinkelland',
  'Tubbergen',
  'Twenterand',
  'Wierden',
  'Hof van Twente',
  'Hellendoorn',
] as const;

const socials = z
  .object({
    website: z.url().optional(),
    github: z.url().optional(),
    linkedin: z.url().optional(),
    mastodon: z.url().optional(),
    bluesky: z.url().optional(),
    x: z.url().optional(),
    youtube: z.url().optional(),
  })
  .optional();

/* -------------------------------------------------------------------------- */
/* posts                                                                      */
/* -------------------------------------------------------------------------- */

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1).max(120),
      description: z.string().min(1).max(300),
      locale: z.enum(LOCALES),
      /**
       * Shared key linking translations of the same article. Two files with
       * the same `translationKey` are the NL and EN versions of one post; a
       * post with no sibling renders an honest "only available in <other
       * language>" notice rather than a machine translation.
       */
      translationKey: z.string().min(1),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      author: z.object({
        name: z.string().min(1),
        url: z.url().optional(),
      }),
      tags: z.array(z.string().min(1)).default([]),
      /**
       * Editorial pillar per the launch playbook: Field Notes (one concrete
       * lesson from a local system), People Who Build (five-question
       * practitioner profiles), Open Calls, and Week in Twente Tech.
       * Optional — general articles carry no pillar.
       */
      pillar: z
        .enum(['field-notes', 'people-who-build', 'open-calls', 'week-in-twente-tech'])
        .optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

/* -------------------------------------------------------------------------- */
/* events                                                                     */
/* -------------------------------------------------------------------------- */

const events = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/events' }),
  schema: z
    .object({
      title: i18nString,
      description: i18nString,
      /** Timezone-aware start. Always written with an explicit offset. */
      start: z.coerce.date(),
      end: z.coerce.date().optional(),
      venue: z.object({
        /**
         * Optional so "venue not yet known" is representable. Templates
         * render the localized "Locatie volgt" / "Venue to be announced"
         * string when absent — never store an English sentinel here, it
         * bypasses translation. Keep names to proper nouns (no descriptive
         * words like "kantoor"), since this field cannot be localized.
         */
        name: z.string().min(1).optional(),
        city: z.enum(TWENTE_CITIES).or(z.string().min(1)),
        address: z.string().optional(),
        online: z.boolean().default(false),
      }),
      organiser: z.object({
        name: z.string().min(1),
        url: z.url().optional(),
        company: reference('companies').optional(),
      }),
      url: z.url(),
      /** `0` renders as "free", which is a meaningful filter for students. */
      costEur: z.number().min(0).default(0),
      /** Spoken language at the event — the practical question for expats. */
      language: z.enum(['nl', 'en', 'both']),
      tags: z.array(z.string().min(1)).default([]),
      cancelled: z.boolean().default(false),
      /**
       * When the entry was last edited (time change, venue confirmation,
       * cancellation). Drives SEQUENCE and LAST-MODIFIED in the ICS feed —
       * without a bump, Outlook won't propagate the edit to subscribers.
       * Bump it whenever a fact changes.
       */
      updatedAt: z.coerce.date().optional(),
      /**
       * Who runs this event, and how we credit it. Partner events are
       * "listed" — they keep their identity and their own registration, and
       * we always link to the source (the playbook's non-displacement
       * commitment: never rebrand another community's event as our own).
       * `own` is reserved for twente.dev flagship editions.
       */
      attribution: z.enum(['own', 'listed', 'collaboration']).default('listed'),
      /**
       * Route key of a bespoke page that is this event's canonical home
       * (e.g. `edition001` → `/nl/001`, `/en/001`). When set, no generated
       * detail page exists for the entry and every card links there instead —
       * one canonical listing, synchronised everywhere.
       */
      canonicalRoute: z.enum(ROUTE_KEYS).optional(),
      fixture,
    })
    .refine((e) => !e.end || e.end >= e.start, {
      message: 'end must not be before start',
      path: ['end'],
    }),
});

/* -------------------------------------------------------------------------- */
/* jobs                                                                       */
/* -------------------------------------------------------------------------- */

const jobs = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/jobs' }),
  schema: z
    .object({
      title: i18nString,
      description: i18nString,
      company: reference('companies'),
      employmentType: z.enum(['full-time', 'part-time', 'contract', 'internship', 'temporary']),
      workplace: z.enum(['onsite', 'hybrid', 'remote']),
      city: z.enum(TWENTE_CITIES).or(z.string().min(1)),
      seniority: z.enum(['junior', 'medior', 'senior', 'lead', 'any']),
      stack: z.array(z.string().min(1)).min(1),
      /**
       * Whether Dutch is genuinely required. Twente has a large international
       * cohort from the University of Twente and no competing board exposes
       * this, so it is one of the highest-value facets on the site.
       */
      languageRequirement: z.enum(['dutch-required', 'english-ok']),
      salary: z
        .object({
          min: z.number().positive(),
          max: z.number().positive(),
          currency: z.literal('EUR').default('EUR'),
          period: z.enum(['MONTH', 'YEAR']).default('MONTH'),
        })
        .refine((s) => s.max >= s.min, { message: 'salary.max must be >= salary.min' })
        .optional(),
      applyUrl: z.url(),
      postedAt: z.coerce.date(),
      /**
       * Required, not optional. This drives the nightly auto-expiry that keeps
       * the board honest without anyone remembering to prune it, and Google
       * for Jobs treats a missing validThrough as a quality problem.
       */
      validThrough: z.coerce.date(),
      fixture,
    })
    .refine((j) => j.validThrough > j.postedAt, {
      message: 'validThrough must be after postedAt',
      path: ['validThrough'],
    }),
});

/* -------------------------------------------------------------------------- */
/* companies                                                                  */
/* -------------------------------------------------------------------------- */

const companies = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/companies' }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      description: i18nString,
      website: z.url(),
      logo: image().optional(),
      size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']),
      locations: z.array(z.enum(TWENTE_CITIES).or(z.string().min(1))).min(1),
      stack: z.array(z.string().min(1)).default([]),
      hiring: z.boolean().default(false),
      /**
       * Present from day one even though everything is `community` today.
       * A sponsorship tier is a Phase 5 question, but retrofitting the field
       * later would mean touching every entry.
       */
      tier: z.enum(['community', 'partner']).default('community'),
      socials,
      fixture,
    }),
});

/* -------------------------------------------------------------------------- */
/* communities                                                                */
/* -------------------------------------------------------------------------- */

const communities = defineCollection({
  loader: file('./src/content/communities.yml'),
  schema: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: i18nString,
    url: z.url(),
    platform: z.enum(['discord', 'slack', 'matrix', 'telegram', 'meetup', 'forum', 'other']),
    language: z.enum(['nl', 'en', 'both']),
    focus: z.array(z.string().min(1)).default([]),
  }),
});

export const collections = { posts, events, jobs, companies, communities };
