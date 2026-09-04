import rss from '@astrojs/rss';

import { SITE_URL } from '../i18n/config.ts';
import type { Locale } from '../i18n/config.ts';
import { absoluteUrl, useTranslations } from '../i18n/utils.ts';
import { routePath } from '../i18n/routes.ts';
import { getAllEvents, getPosts, postSlug } from './content.ts';
import { buildIcsCalendar } from './ics.ts';
import type { IcsEvent } from './ics.ts';

export async function buildRssFeed(locale: Locale): Promise<Response> {
  const t = useTranslations(locale);
  const posts = await getPosts(locale);
  const selfUrl = `${SITE_URL}/${locale}/rss.xml`;

  return rss({
    title: `${t('site.name')} // ${t('blog.title')}`,
    description: t('blog.description'),
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
      customData: `<dc:creator><![CDATA[${post.data.author.name}]]></dc:creator>`,
    })),
    customData: `<language>${locale}</language><atom:link href="${selfUrl}" rel="self" type="application/rss+xml"/>`,
  });
}

export async function buildEventsIcs(locale: Locale = 'nl'): Promise<Response> {
  const t = useTranslations(locale);
  const events = await getAllEvents();

  const icsEvents: IcsEvent[] = events.map((event) => {
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
    name: `${t('site.name')} // ${t('events.title')}`,
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
