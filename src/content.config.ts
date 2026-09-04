import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'zod';

import { LOCALES } from './i18n/config.ts';

const i18nString = z.object({
  nl: z.string().min(1),
  en: z.string().min(1),
});

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

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1).max(120),
      description: z.string().min(1).max(300),
      locale: z.enum(LOCALES),
      translationKey: z.string().min(1),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      author: z.object({
        name: z.string().min(1),
        url: z.url().optional(),
      }),
      tags: z.array(z.string().min(1)).default([]),
      pillar: z.enum(['field-reports', 'release-notes', 'upstream']).optional(),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

const events = defineCollection({
  loader: glob({ pattern: '**/*.yml', base: './src/content/events' }),
  schema: z
    .object({
      title: i18nString,
      description: i18nString,
      start: z.coerce.date(),
      end: z.coerce.date().optional(),
      venue: z.object({
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
      costEur: z.number().min(0).default(0),
      language: z.enum(['nl', 'en', 'both']),
      tags: z.array(z.string().min(1)).default([]),
      cancelled: z.boolean().default(false),
      updatedAt: z.coerce.date().optional(),
      attribution: z.enum(['own', 'listed', 'collaboration']).default('listed'),
      release: z
        .object({
          number: z.string().regex(/^\d{3}$/),
          theme: z.string().min(1),
          programmeStart: z.coerce.date(),
          capacity: z.number().int().positive(),
          venueLogo: z.string().min(1).optional(),
          speakers: z
            .array(
              z.object({
                name: z.string().min(1),
                affiliation: z.string().min(1).optional(),
                talk: i18nString.optional(),
              }),
            )
            .default([]),
        })
        .optional(),
      fixture,
    })
    .refine((e) => !e.end || e.end >= e.start, {
      message: 'end must not be before start',
      path: ['end'],
    })
    .refine((e) => !e.release || e.release.programmeStart >= e.start, {
      message: 'release.programmeStart must not be before the doors time in start',
      path: ['release', 'programmeStart'],
    })
    .refine((e) => !e.release || !e.end || e.release.programmeStart <= e.end, {
      message: 'release.programmeStart must not be after end',
      path: ['release', 'programmeStart'],
    }),
});

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
      tier: z.enum(['community', 'partner']).default('community'),
      socials,
      fixture,
    }),
});

const communities = defineCollection({
  loader: file('./src/content/communities.yml'),
  schema: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    description: i18nString,
    url: z.url(),
    platform: z.enum(['discord', 'slack', 'matrix', 'telegram', 'meetup', 'forum', 'other']),
    language: z.enum(['nl', 'en', 'both']),
    ours: z.boolean().default(false),
    focus: z.array(z.string().min(1)).default([]),
    consent: z
      .object({
        granted: z.boolean().default(false),
        evidence: z.string().min(1).optional(),
        at: z.coerce.date().optional(),
      })
      .refine((c) => !c.granted || (Boolean(c.evidence) && c.at !== undefined), {
        message: 'consent.granted requires consent.evidence and consent.at',
      })
      .default({ granted: false }),
  }),
});

export const collections = { posts, events, companies, communities };
