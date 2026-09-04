import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { EDITION_001, EDITION_001_SPEAKERS } from '../src/config/site.ts';

const repo = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = `${repo}/docs/brand/templates/editie.js`;

const COORDS = {
  Rijssen: { lat: 52.3078, lon: 6.517 },
  Enschede: { lat: 52.2215, lon: 6.8937 },
  Hengelo: { lat: 52.2659, lon: 6.7931 },
  Almelo: { lat: 52.3564, lon: 6.6626 },
};

const amsterdam = (opts) =>
  new Intl.DateTimeFormat('nl-NL', { timeZone: 'Europe/Amsterdam', ...opts }).format(
    EDITION_001.doors,
  );

const coords = COORDS[EDITION_001.city];
if (!coords) {
  throw new Error(
    `Geen coordinaten voor ${EDITION_001.city}. Vul ze aan in COORDS in scripts/sync-editie.mjs; ` +
      'de omloopkaart tekent de knoop op echte geografie en kan er geen verzinnen.',
  );
}

const sprekers =
  EDITION_001_SPEAKERS.length > 0
    ? EDITION_001_SPEAKERS.map((s) => s.name)
    : ['[ spreker een ]', '[ spreker twee ]'];

const tz = amsterdam({ timeZoneName: 'short' }).split(' ').at(-1);

const EDITIE = {
  nr: EDITION_001.number,
  thema: EDITION_001.theme.toLowerCase(),
  stad: EDITION_001.city.toLowerCase(),
  venue: (EDITION_001.venue ?? '').split(',')[0].toLowerCase(),
  datumNL: amsterdam({ weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    .replaceAll('.', '')
    .replace(/^(\w{2})\w*/, '$1'),
  datumCompact: amsterdam({ day: '2-digit', month: '2-digit' }).replace('-', '.'),
  tijd: amsterdam({ hour: '2-digit', minute: '2-digit' }),
  tz: tz === 'CET' || tz === 'CEST' ? tz : 'CET',
  seats: EDITION_001.capacity,
  sprekers,
  knotLabelNL: EDITION_001.city.toUpperCase(),
  knotLat: coords.lat,
  knotLon: coords.lon,
};

await writeFile(
  out,
  `window.EDITIE = ${JSON.stringify(EDITIE, null, 2)};\n`,
  'utf8',
);
console.log(`editie.js <- site.ts   ${EDITIE.nr} // ${EDITIE.datumNL} // ${EDITIE.stad}`);
