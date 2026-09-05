import type { APIRoute } from 'astro';

import { SITE_URL, TIMEZONE } from '../i18n/config.ts';
import { UI } from '../i18n/ui.ts';
import { getCurrentRelease } from '../lib/content.ts';
import {
  CONDUCT_EMAIL,
  CONTACT_EMAIL,
  MEETUP_GROUP_URL,
  PRESS_EMAIL,
  PRETALX_CFP_URL,
  REGISTRATION_URL,
  REPO_URL,
  releaseName,
} from '../config/site.ts';

export const prerender = true;

function ymd(date: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    timeZone: TIMEZONE,
  }).format(date);
}

function hm(date: Date): string {
  return new Intl.DateTimeFormat('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIMEZONE,
  }).format(date);
}

const e = await getCurrentRelease();
const releaseLines = [
  `- Datum: ${ymd(e.doors, 'nl-NL')}. Deuren en eten ${hm(e.doors)}, programma ${hm(e.start)}, einde ${hm(e.end)}`,
  `- Locatie: ${[e.venue, e.city].filter(Boolean).join(', ')}`,
  `- Capaciteit: ${e.capacity} plekken · ${e.costEur === 0 ? 'gratis' : `€${e.costEur}`}`,
  REGISTRATION_URL && `- Aanmelden: ${REGISTRATION_URL}`,
  MEETUP_GROUP_URL && `- Meetup: ${MEETUP_GROUP_URL}`,
  PRETALX_CFP_URL && `- Call for talks: ${PRETALX_CFP_URL}`,
  e.speakers.length > 0 && `- Programma: ${e.speakers.map((s) => s.name).join(', ')}`,
].filter(Boolean);

const body = `# twente.dev

> ${UI.nl['site.tagline']}

${UI.nl['site.description']}

## ${releaseName(e.number)}: ${e.theme}
${releaseLines.join('\n')}

## Feeds en bronnen
- Website: ${SITE_URL}/nl
- RSS (NL): ${SITE_URL}/nl/rss.xml
- RSS (EN): ${SITE_URL}/en/rss.xml
- Agenda (ICS): ${SITE_URL}/events.ics
- Broncode en bijdragen: ${REPO_URL}

## Contact
- Algemeen: ${CONTACT_EMAIL}
- Gedragscode en veiligheid: ${CONDUCT_EMAIL}
- Pers: ${PRESS_EMAIL}

## English
${UI.en['site.description']}
The site is fully bilingual; the English pages live under ${SITE_URL}/en and
carry the same facts as above. This file deliberately does not restate them.
`;

export const GET: APIRoute = () =>
  new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
