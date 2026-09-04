import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CURRENT_RELEASE } from '../src/config/site.ts';
import { readRelease } from './read-releases.ts';

const repo = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const out = `${repo}/docs/brand/templates/release.js`;
const release = await readRelease(`${repo}/src/content`, CURRENT_RELEASE);

const COORDS = {
  Rijssen: { lat: 52.3078, lon: 6.517 },
  Enschede: { lat: 52.2215, lon: 6.8937 },
  Hengelo: { lat: 52.2659, lon: 6.7931 },
  Almelo: { lat: 52.3564, lon: 6.6626 },
};

const amsterdam = (opts) =>
  new Intl.DateTimeFormat('nl-NL', { timeZone: 'Europe/Amsterdam', ...opts }).format(release.doors);

const coords = COORDS[release.city];
if (!coords) {
  throw new Error(
    `Geen coordinaten voor ${release.city}. Vul ze aan in COORDS in scripts/sync-release.mjs; ` +
      'de omloopkaart tekent de knoop op echte geografie en kan er geen verzinnen.',
  );
}

const namen = release.speakers.map((s) => s.name);
const sprekers = {
  nl: namen.length > 0 ? namen : ['[ spreker een ]', '[ spreker twee ]'],
  en: namen.length > 0 ? namen : ['[ speaker one ]', '[ speaker two ]'],
};

const tz = amsterdam({ timeZoneName: 'short' }).split(' ').at(-1);

const RELEASE = {
  nr: release.number,
  thema: release.theme.toLowerCase(),
  stad: release.city.toLowerCase(),
  venue: (release.venue ?? '').split(',')[0].toLowerCase(),
  datumNL: amsterdam({ weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    .replaceAll('.', '')
    .replace(/^(\w{2})\w*/, '$1'),
  datumEN: new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Amsterdam',
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
    .format(release.doors)
    .replaceAll(',', '')
    .toLowerCase(),
  datumCompact: amsterdam({ day: '2-digit', month: '2-digit' }).replace('-', '.'),
  tijd: amsterdam({ hour: '2-digit', minute: '2-digit' }),
  tz: tz === 'CET' || tz === 'CEST' ? tz : 'CET',
  seats: release.capacity,
  sprekers,
  knotLabelNL: release.city.toUpperCase(),
  knotLat: coords.lat,
  knotLon: coords.lon,
};

await writeFile(out, `window.RELEASE = ${JSON.stringify(RELEASE, null, 2)};\n`, 'utf8');
console.log(`release.js <- site.ts   ${RELEASE.nr} // ${RELEASE.datumNL} // ${RELEASE.stad}`);
