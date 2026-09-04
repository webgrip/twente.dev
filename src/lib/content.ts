import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

import type { Locale } from '../i18n/config.ts';

export type EventEntry = CollectionEntry<'events'>;
export type CompanyEntry = CollectionEntry<'companies'>;
export type PostEntry = CollectionEntry<'posts'>;
export type CommunityEntry = CollectionEntry<'communities'>;

export function now(): Date {
  return new Date();
}

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

export async function getAllEvents(): Promise<EventEntry[]> {
  const events = await getCollection('events');
  return events.sort((a, b) => a.data.start.getTime() - b.data.start.getTime());
}

export async function getCompanies(): Promise<CompanyEntry[]> {
  const companies = await getCollection('companies');
  return companies.sort((a, b) => a.data.name.localeCompare(b.data.name, 'nl'));
}

export async function getCompany(id: string): Promise<CompanyEntry | undefined> {
  return getEntry('companies', id);
}

export async function getPosts(locale: Locale): Promise<PostEntry[]> {
  const posts = await getCollection(
    'posts',
    ({ data }) => data.locale === locale && data.draft !== true,
  );
  return posts.sort((a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime());
}

export function postSlug(post: PostEntry): string {
  return post.id.replace(/^(nl|en)\//, '');
}

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

export async function getCommunities(): Promise<CommunityEntry[]> {
  const communities = await getCollection('communities', (c) => c.data.consent.granted);
  return communities.sort((a, b) => a.data.name.localeCompare(b.data.name, 'nl'));
}

export async function countCommunitiesAwaitingConsent(): Promise<number> {
  const pending = await getCollection('communities', (c) => !c.data.consent.granted);
  return pending.length;
}

export function communityTopics(communities: CommunityEntry[]): string[] {
  const topics = new Set(communities.flatMap((c) => c.data.focus));
  return [...topics].sort((a, b) => a.localeCompare(b, 'nl'));
}

export function summarize(text: string, max = 160): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max).replace(/[\s.,;:—-]+$/, '')}…`;
}

export function readingTimeMinutes(body: string | undefined): number {
  if (!body) return 1;
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 220));
}
