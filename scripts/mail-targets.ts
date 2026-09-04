import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'yaml';

import { REGISTRATION_URL } from '../src/config/site.ts';
import { DEFAULT_LOCALE, LOCALES } from '../src/i18n/config.ts';
import type { Locale } from '../src/i18n/config.ts';
import type { MailDocument } from '../src/lib/mail/document.ts';
import { mailForEvent, mailForPost, mailForSpeaker } from '../src/lib/mail/sources.ts';
import type { ResolvedRelease } from '../src/lib/release.ts';
import { releaseFromEntry } from './read-releases.ts';
import type { EventSource, Pillar, PostSource } from '../src/lib/mail/sources.ts';

export const REPO = new URL('..', import.meta.url).pathname;
const CONTENT = join(REPO, 'src/content');

const PILLARS = new Set<Pillar>(['field-reports', 'release-notes', 'upstream']);

export function die(message: string): never {
  console.error(`mail: ${message}`);
  process.exit(1);
}

function toDate(value: unknown, where: string): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return die(`${where} is not a usable date: ${String(value)}`);
}

function frontmatterOf(raw: string, where: string): Record<string, unknown> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match?.[1]) return die(`${where} has no frontmatter block`);
  return parse(match[1]) as Record<string, unknown>;
}

async function readPosts(): Promise<PostSource[]> {
  const posts: PostSource[] = [];
  for (const locale of LOCALES) {
    const dir = join(CONTENT, 'posts', locale);
    let files: string[];
    try {
      files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
    } catch {
      continue;
    }
    for (const file of files) {
      const where = `posts/${locale}/${file}`;
      const data = frontmatterOf(await readFile(join(dir, file), 'utf8'), where);
      const pillar = data.pillar;
      const author = data.author as { name?: string } | undefined;
      if (!author?.name) die(`${where} has no author.name`);
      posts.push({
        slug: file.replace(/\.md$/, ''),
        locale,
        translationKey: String(data.translationKey),
        title: String(data.title),
        description: String(data.description),
        publishedAt: toDate(data.publishedAt, `${where} publishedAt`),
        author: { name: author.name },
        pillar: PILLARS.has(pillar as Pillar) ? (pillar as Pillar) : undefined,
        draft: data.draft === true,
      });
    }
  }
  return posts;
}

function localePair(value: unknown, where: string): Record<Locale, string> {
  const raw = value as Record<string, unknown> | undefined;
  const pair = {} as Record<Locale, string>;
  for (const locale of LOCALES) {
    const text = raw?.[locale];
    if (typeof text !== 'string' || text.length === 0) die(`${where} has no ${locale} text`);
    pair[locale] = text;
  }
  return pair;
}

async function readEvents(): Promise<{ events: EventSource[]; releases: ResolvedRelease[] }> {
  const dir = join(CONTENT, 'events');
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
  } catch {
    return { events: [], releases: [] };
  }
  const events: EventSource[] = [];
  const releases: ResolvedRelease[] = [];
  for (const file of files) {
    const where = `events/${file}`;
    const data = parse(await readFile(join(dir, file), 'utf8')) as Record<string, unknown>;
    const venue = (data.venue ?? {}) as Record<string, unknown>;
    const release = releaseFromEntry(data);
    events.push({
      slug: file.replace(/\.(yml|yaml)$/, ''),
      title: localePair(data.title, `${where} title`),
      description: localePair(data.description, `${where} description`),
      start: toDate(data.start, `${where} start`),
      end: data.end === undefined ? undefined : toDate(data.end, `${where} end`),
      venue: {
        name: typeof venue.name === 'string' ? venue.name : undefined,
        address: typeof venue.address === 'string' ? venue.address : undefined,
        city: String(venue.city ?? ''),
        online: venue.online === true,
      },
      url: String(data.url ?? ''),
      costEur: typeof data.costEur === 'number' ? data.costEur : 0,
      language: (data.language as EventSource['language']) ?? 'both',
      release: release ? { number: release.number } : undefined,
      cancelled: data.cancelled === true,
    });
    if (release) releases.push(release);
  }
  return { events, releases };
}

export interface Target {
  id: string;
  documents: MailDocument[];
}

export async function collectTargets(): Promise<Target[]> {
  const targets: Target[] = [];

  const posts = await readPosts();
  const byKey = new Map<string, PostSource[]>();
  for (const post of posts.filter((p) => !p.draft)) {
    byKey.set(post.translationKey, [...(byKey.get(post.translationKey) ?? []), post]);
  }
  for (const [key, group] of byKey) {
    targets.push({ id: `post:${key}`, documents: group.map(mailForPost) });
  }

  const { events, releases } = await readEvents();

  for (const event of events) {
    targets.push({
      id: `event:${event.slug}`,
      documents: LOCALES.map((locale) => mailForEvent(event, locale, REGISTRATION_URL)),
    });
  }

  for (const release of releases) {
    for (const speaker of release.speakers) {
      targets.push({
        id: `speaker:${mailForSpeaker(speaker, release, DEFAULT_LOCALE).key}`,
        documents: LOCALES.map((locale) => mailForSpeaker(speaker, release, locale)),
      });
    }
  }

  return targets.sort((a, b) => a.id.localeCompare(b.id));
}
