import rss from '@astrojs/rss';

import { SITE_URL } from '../i18n/config.ts';
import type { Locale } from '../i18n/config.ts';
import { absoluteUrl, useTranslations } from '../i18n/utils.ts';
import { routePath } from '../i18n/routes.ts';
import { getAllEvents, getPosts, postSlug } from './content.ts';
import { buildIcsCalendar } from './ics.ts';
import type { IcsEvent } from './ics.ts';

/** Per-locale RSS feed. Each locale gets its own — a mixed-language feed serves nobody. */
export async function buildRssFeed(locale: Locale): Promise<Response> {
  const t = useTranslations(locale);
  const posts = await getPosts(locale);

  return rss({
    title: `${t('site.name')} — ${t('blog.title')}`,
    description: t('blog.description'),
    site: SITE_URL,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: absoluteUrl(routePath('blog', locale, postSlug(post))),
      categories: post.data.tags,
      author: post.data.author.name,
    })),
    customData: `<language>${locale}</language>`,
  });
}

/**
 * The public calendar feed (plan lever L2).
 *
 * One feed for both locales rather than one per language: a calendar
 * subscription is long-lived, and asking someone to re-subscribe because they
 * switched the site language would be a poor trade. Summaries use Dutch, the
 * default locale, with the venue city carrying the rest.
 */
export async function buildEventsIcs(locale: Locale = 'nl'): Promise<Response> {
  const t = useTranslations(locale);
  const events = await getAllEvents();

  const icsEvents: IcsEvent[] = events.map((event) => ({
    uid: event.id,
    start: event.data.start,
    end: event.data.end,
    summary: event.data.title[locale],
    description: `${event.data.description[locale]}\n\n${absoluteUrl(
      routePath('events', locale, event.id),
    )}`,
    location: event.data.venue.online
      ? 'Online'
      : [event.data.venue.name, event.data.venue.address, event.data.venue.city]
          .filter(Boolean)
          .join(', '),
    url: absoluteUrl(routePath('events', locale, event.id)),
    cancelled: event.data.cancelled,
  }));

  const body = buildIcsCalendar({
    name: `${t('site.name')} — ${t('events.title')}`,
    description: t('events.description'),
    domain: 'twente.dev',
    events: icsEvents,
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="twente-dev-events.ics"',
    },
  });
}
