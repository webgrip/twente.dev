import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';

import type { Locale } from '../src/i18n/config.ts';
import { kanaalVan, readCopyConfig, type CopyConfig } from './copy-config.ts';
import { readReleases } from './read-releases.ts';

const LINKS = process.argv.includes('--links');
const COPY_DIR = 'docs/brand/copy';

const MAANDEN: Record<Locale, string[]> = {
  nl: [
    'januari',
    'februari',
    'maart',
    'april',
    'mei',
    'juni',
    'juli',
    'augustus',
    'september',
    'oktober',
    'november',
    'december',
  ],
  en: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
};

interface Blok {
  pad: string;
  regel: number;
  kanaal: string;
  locale: Locale;
  naam: string;
  tekst: string;
}

function lees(pad: string, doc: string, standaardKanaal: string | undefined): Blok[] {
  const blokken: Blok[] = [];
  const regels = doc.split('\n');
  let kanaal = standaardKanaal ?? 'onbekend';
  let locale: Locale = 'nl';
  let naam = '';
  let open: { start: number; buffer: string[] } | null = null;

  regels.forEach((regel, index) => {
    const kanaalMarker = regel.match(/^<!-- kanaal: ([\w-]+) \| locale: (nl|en) -->$/);
    if (kanaalMarker) {
      kanaal = kanaalMarker[1] as string;
      locale = kanaalMarker[2] as Locale;
      naam = `${kanaal}/${locale}`;
      return;
    }
    const kopMarker = regel.match(/^#{2,3}\s+(Nederlands|English)\s*$/);
    if (kopMarker) {
      locale = kopMarker[1] === 'Nederlands' ? 'nl' : 'en';
      naam = `${kanaal}/${locale}`;
      return;
    }
    const genMarker = regel.match(/^<!-- BEGIN generated: ([\w-]+)-(nl|en) -->$/);
    if (genMarker) {
      naam = `${genMarker[1]}-${genMarker[2]}`;
      locale = genMarker[2] as Locale;
      if (standaardKanaal) kanaal = standaardKanaal;
      return;
    }
    if (regel.trimEnd() === '```') {
      if (open) {
        blokken.push({
          pad,
          regel: open.start,
          kanaal,
          locale,
          naam,
          tekst: open.buffer.join('\n'),
        });
        open = null;
      } else {
        open = { start: index + 1, buffer: [] };
      }
      return;
    }
    if (open) open.buffer.push(regel);
  });
  return blokken;
}

function scanner(): string | null {
  const uitOmgeving = process.env.HUMANIZE_SCAN;
  if (uitOmgeving && existsSync(uitOmgeving)) return uitOmgeving;
  const standaard = join(homedir(), '.claude/skills/humanize/scripts/scan.py');
  return existsSync(standaard) ? standaard : null;
}

function toegestaan(config: CopyConfig, kanaal: string, id: string): boolean {
  return (config.toegestane_tells ?? []).some(
    (regel) => (regel.kanaal === '*' || regel.kanaal === kanaal) && regel.ids.includes(id),
  );
}

async function tellsIn(
  blok: Blok,
  pad: string,
  config: CopyConfig,
  fouten: string[],
): Promise<void> {
  const tijdelijk = join(tmpdir(), `copy-${blok.kanaal}-${blok.locale}-${blok.regel}.md`);
  await writeFile(tijdelijk, blok.tekst);
  let uitvoer: string;
  try {
    uitvoer = execFileSync(
      'python3',
      [pad, '--json', '--fail-on', 'never', '--lang', blok.locale, tijdelijk],
      { encoding: 'utf8' },
    );
  } catch {
    return;
  }
  const resultaat = JSON.parse(uitvoer)[0] as {
    findings: Array<{ id: string; severity: string; match?: string }>;
  };
  for (const vondst of resultaat.findings) {
    if (vondst.severity !== 'always') continue;
    if (toegestaan(config, blok.kanaal, vondst.id)) continue;
    fouten.push(
      `${blok.pad}:${blok.regel} ${blok.naam}: AI-tell ${vondst.id} — ${vondst.match ?? ''}`,
    );
  }
}

const config: CopyConfig = await readCopyConfig();
const releases = await readReleases('src/content');
const fouten: string[] = [];
const scanPad = scanner();

const bestanden = (await readdir(COPY_DIR)).filter((naam) => naam.endsWith('.md')).sort();
const bronnen = config.bronnen.flatMap((bron) =>
  bestanden
    .filter((naam) => naam.startsWith(`${bron.patroon}-`))
    .map((naam) => ({ pad: `${COPY_DIR}/${naam}`, kanaal: bron.kanaal })),
);
if (bronnen.length === 0) fouten.push(`geen plakbestanden gevonden in ${COPY_DIR}`);

for (const bron of bronnen) {
  const nummer = bron.pad.match(/-(\d{3})\.md$/)?.[1];
  const release = releases.find((r) => r.number === nummer);
  if (!release) {
    fouten.push(`${bron.pad}: geen events-entry voor release ${nummer ?? '(onbekend)'}`);
    continue;
  }
  const doc = await readFile(bron.pad, 'utf8');
  const blokken = lees(bron.pad, doc, bron.kanaal);
  if (blokken.length === 0) fouten.push(`${bron.pad}: geen plakblokken gevonden`);

  for (const blok of blokken) {
    const kanaal = kanaalVan(config, blok.kanaal);
    if (blok.tekst.length > kanaal.max_tekens) {
      fouten.push(
        `${blok.pad}:${blok.regel} ${blok.naam}: ${blok.tekst.length} tekens, max ${kanaal.max_tekens}`,
      );
    }

    const laag = blok.tekst.toLowerCase();
    for (const claim of config.verboden_claims) {
      for (const zin of claim[blok.locale]) {
        if (laag.includes(zin.toLowerCase())) {
          fouten.push(
            `${blok.pad}:${blok.regel} ${blok.naam}: verboden claim "${zin}" (${claim.reden})`,
          );
        }
      }
    }

    const juist = `${new Date(release.doors).getUTCDate()}`;
    const patroon = new RegExp(`(\\d{1,2})\\s+(${MAANDEN[blok.locale].join('|')})`, 'gi');
    for (const match of blok.tekst.matchAll(patroon)) {
      const dag = match[1] as string;
      const maand = (match[2] as string).toLowerCase();
      const juisteMaand = MAANDEN[blok.locale][new Date(release.doors).getUTCMonth()] as string;
      if (dag !== juist || maand !== juisteMaand.toLowerCase()) {
        fouten.push(
          `${blok.pad}:${blok.regel} ${blok.naam}: datum "${match[0]}" hoort niet bij release ${release.number}`,
        );
      }
    }

    if (LINKS) {
      for (const url of blok.tekst.matchAll(/https?:\/\/[^\s)]+/g)) {
        const doel = (url[0] as string).replace(/[.,]$/, '');
        try {
          const antwoord = await fetch(doel, { method: 'HEAD', redirect: 'follow' });
          if (!antwoord.ok)
            fouten.push(`${blok.pad}:${blok.regel}: ${doel} geeft ${antwoord.status}`);
        } catch (error) {
          fouten.push(`${blok.pad}:${blok.regel}: ${doel} onbereikbaar (${String(error)})`);
        }
      }
    }

    if (scanPad) await tellsIn(blok, scanPad, config, fouten);
  }
}

const blokkenTotaal = bronnen.length;
if (!scanPad) {
  console.log('validate-copy: scan.py niet gevonden, AI-tellpoort overgeslagen');
}
if (!LINKS) {
  console.log('validate-copy: linkcontrole staat uit, draai met --links om hem aan te zetten');
}

if (fouten.length > 0) {
  console.error(`\nvalidate-copy: ${fouten.length} probleem(en):\n`);
  for (const fout of fouten) console.error(`  ${fout}`);
  process.exit(1);
}
console.log(`validate-copy: ${blokkenTotaal} bron(nen) in orde`);
