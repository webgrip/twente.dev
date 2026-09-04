import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { parse } from 'yaml';

import { RELEASE_001, RELEASE_001_SPEAKERS, REGISTRATION_URL } from '../src/config/site.ts';
import { LOCALES, isLocale } from '../src/i18n/config.ts';
import type { Locale } from '../src/i18n/config.ts';
import { mailFilename } from '../src/lib/mail/document.ts';
import type { MailDocument } from '../src/lib/mail/document.ts';
import { renderMail } from '../src/lib/mail/render.ts';
import { mailForEvent, mailForPost, mailForSpeaker, slugify } from '../src/lib/mail/sources.ts';
import type { EventSource, Pillar, PostSource, ReleaseSource } from '../src/lib/mail/sources.ts';

const REPO = new URL('..', import.meta.url).pathname;
const CONTENT = join(REPO, 'src/content');
const OUT = join(REPO, 'build/mail');

const PILLARS = new Set<Pillar>(['field-reports', 'release-notes', 'upstream']);

const RELEASE: ReleaseSource = {
  number: RELEASE_001.number,
  theme: RELEASE_001.theme,
  doors: RELEASE_001.doors,
  city: RELEASE_001.city,
  venueName: RELEASE_001.venueName,
  venueAddress: RELEASE_001.venueAddress,
  route: 'release001',
};

function die(message: string): never {
  console.error(`build-mail: ${message}`);
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

async function readEvents(): Promise<EventSource[]> {
  const dir = join(CONTENT, 'events');
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
  } catch {
    return [];
  }
  const events: EventSource[] = [];
  for (const file of files) {
    const where = `events/${file}`;
    const data = parse(await readFile(join(dir, file), 'utf8')) as Record<string, unknown>;
    const venue = (data.venue ?? {}) as Record<string, unknown>;
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
      canonicalRoute: data.canonicalRoute as EventSource['canonicalRoute'],
      cancelled: data.cancelled === true,
    });
  }
  return events;
}

interface Target {
  id: string;
  documents: MailDocument[];
}

async function collectTargets(): Promise<Target[]> {
  const targets: Target[] = [];

  const posts = await readPosts();
  const byKey = new Map<string, PostSource[]>();
  for (const post of posts.filter((p) => !p.draft)) {
    byKey.set(post.translationKey, [...(byKey.get(post.translationKey) ?? []), post]);
  }
  for (const [key, group] of byKey) {
    targets.push({ id: `post:${key}`, documents: group.map(mailForPost) });
  }

  for (const event of await readEvents()) {
    targets.push({
      id: `event:${event.slug}`,
      documents: LOCALES.map((locale) => mailForEvent(event, locale, REGISTRATION_URL)),
    });
  }

  for (const speaker of RELEASE_001_SPEAKERS) {
    targets.push({
      id: `speaker:${slugify(speaker.name)}`,
      documents: LOCALES.map((locale) => mailForSpeaker(speaker, RELEASE, locale)),
    });
  }

  return targets.sort((a, b) => a.id.localeCompare(b.id));
}

function missingLocales(target: Target): Locale[] {
  const present = new Set(target.documents.map((d) => d.locale));
  return LOCALES.filter((locale) => !present.has(locale));
}

async function build(target: Target): Promise<void> {
  await mkdir(OUT, { recursive: true });
  console.log(`\n${target.id}`);
  for (const document of target.documents) {
    const path = join(OUT, mailFilename(document));
    await writeFile(path, renderMail(document), 'utf8');
    console.log(`  ${relative(REPO, path)}`);
    console.log(`    onderwerp  ${document.subject}`);
    console.log(`    preheader  ${document.preheader}`);
  }
  for (const locale of missingLocales(target)) {
    console.log(`    ${locale} overgeslagen: er is geen ${locale}-vertaling in src/content`);
  }
}

const args = process.argv.slice(2);
const targets = await collectTargets();

if (args.length === 0) {
  console.log('build-mail: geef een id, of --all\n');
  for (const target of targets) {
    const locales = target.documents.map((d) => d.locale).join(', ');
    console.log(`  ${target.id.padEnd(40)} ${locales}`);
  }
  process.exit(0);
}

const wanted = args.includes('--all') ? targets : targets.filter((t) => args.includes(t.id));

if (wanted.length === 0) {
  die(`geen doel gevonden voor ${args.join(' ')}; draai zonder argumenten voor de lijst`);
}

const localeFilter = args.filter(isLocale);
for (const target of wanted) {
  const documents =
    localeFilter.length === 0
      ? target.documents
      : target.documents.filter((d) => localeFilter.includes(d.locale));
  await build({ ...target, documents });
}
