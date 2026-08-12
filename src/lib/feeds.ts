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
  const selfUrl = `${SITE_URL}/${locale}/rss.xml`;

  return rss({
    title: `${t('site.name')} — ${t('blog.title')}`,
    description: t('blog.description'),
    // The channel <link> is this locale's blog index — not the bare domain,
    // which serves the noindex root redirect stub.
    site: absoluteUrl(routePath('blog', locale)),
    trailingSlash: false,
    xmlns: {
      dc: 'http://purl.org/dc/elements/1.1/',
      atom: 'http://www.w3.org/2005/Atom',
    },
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: absoluteUrl(routePath('blog', locale, postSlug(post))),
      categories: post.data.tags,
      // RSS 2.0's <author> is defined as an email address; a bare name fails
      // the W3C validator. Dublin Core's dc:creator is the name-shaped field.
      customData: `<dc:creator><![CDATA[${post.data.author.name}]]></dc:creator>`,
    })),
    customData: `<language>${locale}</language><atom:link href="${selfUrl}" rel="self" type="application/rss+xml"/>`,
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

  const icsEvents: IcsEvent[] = events.map((event) => {
    // Flagship editions have a bespoke canonical page instead of a generated
    // detail page; the feed must point subscribers at the real listing.
    const path = event.data.canonicalRoute
      ? routePath(event.data.canonicalRoute, locale)
      : routePath('events', locale, event.id);
    return {
      uid: event.id,
      start: event.data.start,
      end: event.data.end,
      summary: event.data.title[locale],
      description: `${event.data.description[locale]}\n\n${absoluteUrl(path)}`,
      location: event.data.venue.online
        ? 'Online'
        : [event.data.venue.name, event.data.venue.address, event.data.venue.city]
            .filter(Boolean)
            .join(', '),
      url: absoluteUrl(path),
      cancelled: event.data.cancelled,
      lastModified: event.data.updatedAt,
    };
  });

  const body = buildIcsCalendar({
    name: `${t('site.name')} — ${t('events.title')}`,
    description: t('events.description'),
    domain: 'twente.dev',
    events: icsEvents,
    generatedAt: new Date(),
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="twente-dev-events.ics"',
    },
  });
}
