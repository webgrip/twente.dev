import { releaseName } from '../../config/site.ts';
import { LOCALE_TAGS, SITE_URL, TIMEZONE } from '../../i18n/config.ts';
import type { Locale } from '../../i18n/config.ts';
import { routePath } from '../../i18n/routes.ts';
import type { ReleaseSpeaker, ResolvedRelease } from '../release.ts';
import { MAIL_COPY } from './copy.ts';
import type { MailDocument, MailFact } from './document.ts';

export type Pillar = 'field-reports' | 'release-notes' | 'upstream';

export interface PostSource {
  slug: string;
  locale: Locale;
  translationKey: string;
  title: string;
  description: string;
  publishedAt: Date;
  author: { name: string };
  pillar?: Pillar;
  draft: boolean;
}

export interface EventSource {
  slug: string;
  title: Record<Locale, string>;
  description: Record<Locale, string>;
  start: Date;
  end?: Date;
  venue: { name?: string; address?: string; city: string; online: boolean };
  url: string;
  costEur: number;
  language: 'nl' | 'en' | 'both';
  release?: { number: string };
  cancelled: boolean;
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    timeZone: TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatShortDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    timeZone: TIMEZONE,
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatTime(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(LOCALE_TAGS[locale], {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function pillarKicker(locale: Locale, pillar?: Pillar): string {
  const copy = MAIL_COPY[locale];
  if (pillar === 'field-reports') return copy.kickerFieldReport;
  if (pillar === 'release-notes') return copy.kickerReleaseNotes;
  if (pillar === 'upstream') return copy.kickerUpstream;
  return copy.kickerPost;
}

function languageLabel(locale: Locale, language: EventSource['language']): string {
  const copy = MAIL_COPY[locale];
  if (language === 'nl') return copy.languageNl;
  if (language === 'en') return copy.languageEn;
  return copy.languageBoth;
}

function admissionLabel(locale: Locale, costEur: number): string {
  if (costEur === 0) return MAIL_COPY[locale].admissionFree;
  return new Intl.NumberFormat(LOCALE_TAGS[locale], {
    style: 'currency',
    currency: 'EUR',
  }).format(costEur);
}

function venueLabel(locale: Locale, venue: EventSource['venue']): string {
  const copy = MAIL_COPY[locale];
  if (venue.online) return copy.venueOnline;
  if (!venue.name) return copy.venueUnknown;
  return [venue.name, venue.address, venue.city].filter(Boolean).join(', ');
}

function releaseVenueLabel(locale: Locale, release: ResolvedRelease): string {
  if (!release.venueName) return MAIL_COPY[locale].venueUnknown;
  return [release.venueName, release.venueAddress, release.city].filter(Boolean).join(', ');
}

export function postUrl(post: PostSource): string {
  return `${SITE_URL}${routePath('blog', post.locale, post.slug)}`;
}

export function eventUrl(event: EventSource, locale: Locale): string {
  if (event.release) return `${SITE_URL}${routePath('release', locale, event.release.number)}`;
  return event.url;
}

export function mailForPost(post: PostSource): MailDocument {
  const copy = MAIL_COPY[post.locale];
  const kicker = pillarKicker(post.locale, post.pillar);
  return {
    locale: post.locale,
    kind: 'post',
    key: post.translationKey,
    subject: post.title,
    preheader: `${kicker} // ${formatShortDate(post.publishedAt, post.locale)}`,
    kicker,
    headline: post.title,
    lead: post.description,
    facts: [
      { label: copy.factAuthor, value: post.author.name },
      { label: copy.factPublished, value: formatShortDate(post.publishedAt, post.locale) },
    ],
    callToAction: { label: copy.ctaReadPost, href: postUrl(post) },
    reason: copy.reasonSubscriber,
  };
}

export function mailForEvent(
  event: EventSource,
  locale: Locale,
  registrationUrl: string | null,
): MailDocument {
  const copy = MAIL_COPY[locale];
  const href = registrationUrl ?? eventUrl(event, locale);
  const time = event.end
    ? `${formatTime(event.start, locale)}–${formatTime(event.end, locale)}`
    : formatTime(event.start, locale);
  const venue = venueLabel(locale, event.venue);
  const facts: MailFact[] = [
    { label: copy.factDate, value: formatDate(event.start, locale) },
    { label: copy.factTime, value: time },
    { label: copy.factVenue, value: venue },
    { label: copy.factLanguage, value: languageLabel(locale, event.language) },
    { label: copy.factAdmission, value: admissionLabel(locale, event.costEur) },
  ];

  return {
    locale,
    kind: 'announcement',
    key: event.slug,
    subject: event.title[locale],
    preheader: `${formatShortDate(event.start, locale)} // ${venue}`,
    kicker: event.cancelled ? copy.kickerCancelled : copy.kickerAnnouncement,
    headline: event.title[locale],
    lead: event.cancelled ? copy.cancelledLead : event.description[locale],
    facts,
    callToAction: {
      label: registrationUrl ? copy.ctaRegister : copy.ctaViewRelease,
      href,
    },
    reason: copy.reasonSubscriber,
  };
}

export function mailForSpeaker(
  speaker: ReleaseSpeaker,
  release: ResolvedRelease,
  locale: Locale,
): MailDocument {
  const copy = MAIL_COPY[locale];
  const name = releaseName(release.number);
  const talk = speaker.talk?.[locale];
  const venue = releaseVenueLabel(locale, release);
  const facts: MailFact[] = [];

  if (talk) facts.push({ label: copy.factTalk, value: talk });
  facts.push({ label: copy.factDate, value: formatDate(release.doors, locale) });
  facts.push({ label: copy.factVenue, value: venue });

  return {
    locale,
    kind: 'speaker',
    key: `${release.number}-${slugify(speaker.name)}`,
    subject: copy.speakerSubject(speaker.name, name),
    preheader: talk ?? `${name} // ${formatShortDate(release.doors, locale)}`,
    kicker: `${name} // ${copy.kickerSpeaker}`,
    headline: speaker.name,
    lead: speaker.affiliation
      ? copy.speakerLeadWithAffiliation(speaker.name, speaker.affiliation, name)
      : copy.speakerLead(speaker.name, name),
    facts,
    callToAction: {
      label: copy.ctaViewRelease,
      href: `${SITE_URL}${routePath('release', locale, release.number)}`,
    },
    reason: copy.reasonSubscriber,
  };
}
