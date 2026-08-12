import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

import type { Locale } from '../i18n/config.ts';

/**
 * Content selectors.
 *
 * All time-based filtering funnels through `now()` so the nightly rebuild
 * (plan lever L9) is the only thing needed to make expired jobs and past
 * events disappear — no cron job mutating files, no manual pruning.
 */

export type JobEntry = CollectionEntry<'jobs'>;
export type EventEntry = CollectionEntry<'events'>;
export type CompanyEntry = CollectionEntry<'companies'>;
export type PostEntry = CollectionEntry<'posts'>;
export type CommunityEntry = CollectionEntry<'communities'>;

/** Single clock for the whole build, so one build is internally consistent. */
export function now(): Date {
  return new Date();
}

/* ---- jobs ---------------------------------------------------------------- */

/** Live jobs, soonest-to-expire last, newest first. */
export async function getOpenJobs(at: Date = now()): Promise<JobEntry[]> {
  const jobs = await getCollection('jobs', ({ data }) => data.validThrough > at);
  return jobs.sort((a, b) => b.data.postedAt.getTime() - a.data.postedAt.getTime());
}

export async function getExpiredJobs(at: Date = now()): Promise<JobEntry[]> {
  return getCollection('jobs', ({ data }) => data.validThrough <= at);
}

/* ---- events -------------------------------------------------------------- */

/**
 * An event counts as upcoming until its *end*, so a meetup that started an
 * hour ago is still shown to someone deciding whether to head over.
 */
function eventEndsAt(entry: EventEntry): Date {
  return entry.data.end ?? entry.data.start;
}

export async function getUpcomingEvents(at: Date = now()): Promise<EventEntry[]> {
  const events = await getCollection('events', (e) => eventEndsAt(e) >= at);
  return events.sort((a, b) => a.data.start.getTime() - b.data.start.getTime());
}

export async function getPastEvents(at: Date = now()): Promise<EventEntry[]> {
  const events = await getCollection('events', (e) => eventEndsAt(e) < at);
  return events.sort((a, b) => b.data.start.getTime() - a.data.start.getTime());
}

/** Every event, for the ICS feed — subscribers want history too. */
export async function getAllEvents(): Promise<EventEntry[]> {
  const events = await getCollection('events');
  return events.sort((a, b) => a.data.start.getTime() - b.data.start.getTime());
}

/* ---- companies ----------------------------------------------------------- */

export async function getCompanies(): Promise<CompanyEntry[]> {
  const companies = await getCollection('companies');
  return companies.sort((a, b) => a.data.name.localeCompare(b.data.name, 'nl'));
}

export async function getCompany(id: string): Promise<CompanyEntry | undefined> {
  return getEntry('companies', id);
}

/** Open jobs per company id — powers the "N open jobs" badge in the directory. */
export async function getOpenJobCountByCompany(at: Date = now()): Promise<Map<string, number>> {
  const jobs = await getOpenJobs(at);
  const counts = new Map<string, number>();
  for (const job of jobs) {
    const id = job.data.company.id;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  return counts;
}

/* ---- posts --------------------------------------------------------------- */

/** Published posts for one locale, newest first. Drafts never ship. */
export async function getPosts(locale: Locale): Promise<PostEntry[]> {
  const posts = await getCollection(
    'posts',
    ({ data }) => data.locale === locale && data.draft !== true,
  );
  return posts.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

/**
 * URL slug for a post.
 *
 * Posts live in `posts/{nl,en}/…`, so the loader's `id` carries the locale
 * directory (`en/why-twente-dev-exists`). That slash cannot go into a `[slug]`
 * route param, and the locale is already in the URL prefix, so it is stripped.
 *
 * Two translations may deliberately end up with the same slug — they live in
 * different locale trees (`/nl/blog/foo`, `/en/blog/foo`), so that is a feature
 * rather than a collision.
 */
export function postSlug(post: PostEntry): string {
  return post.id.replace(/^(nl|en)\//, '');
}

/**
 * Finds the sibling translation of a post, if one exists.
 *
 * Returns `undefined` when the article was only written in one language —
 * the caller then renders an honest notice rather than a machine translation
 * (plan ADR-0004).
 */
export async function getTranslation(
  post: PostEntry,
  target: Locale,
): Promise<PostEntry | undefined> {
  const candidates = await getCollection(
    'posts',
    ({ data }) => data.locale === target && data.translationKey === post.data.translationKey,
  );
  return candidates[0];
}

/* ---- communities --------------------------------------------------------- */

export async function getCommunities(): Promise<CommunityEntry[]> {
  const communities = await getCollection('communities');
  return communities.sort((a, b) => a.data.name.localeCompare(b.data.name, 'nl'));
}

/* ---- misc ---------------------------------------------------------------- */

/**
 * Meta-description truncation. Cuts at a word boundary and appends an
 * ellipsis — a hard `slice(200)` ends descriptions mid-word ("…Ervarin"),
 * and the same string feeds og:description and twitter:description.
 * 160 keeps the whole line visible in a search snippet.
 */
export function summarize(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).replace(/[\s.,;:—-]+$/, '')}…`;
}

/** Rough reading time. Dutch and English are close enough to share a WPM. */
export function readingTimeMinutes(body: string | undefined): number {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
