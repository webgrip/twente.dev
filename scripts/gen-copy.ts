import { readFile, writeFile } from 'node:fs/promises';

import { CURRENT_RELEASE } from '../src/config/site.ts';
import type { Locale } from '../src/i18n/config.ts';
import type { ResolvedRelease } from '../src/lib/release.ts';
import {
  datumVanMoment,
  feitenVoor,
  kanaalVan,
  readCopyConfig,
  vul,
  type CopyConfig,
  type Feiten,
} from './copy-config.ts';
import { readRelease } from './read-releases.ts';

const CHECK = process.argv.includes('--check');
const COPY_DIR = 'docs/brand/copy';

function splice(doc: string, naam: string, inhoud: string, pad: string): string {
  const begin = `<!-- BEGIN generated: ${naam} -->`;
  const eind = `<!-- END generated: ${naam} -->`;
  const van = doc.indexOf(begin);
  const tot = doc.indexOf(eind);
  if (van === -1 || tot === -1 || tot < van) {
    throw new Error(`${pad} mist de markers ${begin} en ${eind}`);
  }
  return `${doc.slice(0, van)}${begin}\n\n${inhoud}\n\n${eind}${doc.slice(tot + eind.length)}`;
}

function fence(inhoud: string): string {
  return ['```', inhoud, '```'].join('\n');
}

async function feitenMetPraktisch(
  config: CopyConfig,
  release: ResolvedRelease,
  locale: Locale,
): Promise<Feiten> {
  const feiten = feitenVoor(release, locale);
  const regels = config.praktisch[locale].map((regel) => vul(regel, feiten));
  return { ...feiten, praktisch: regels.join('\n') };
}

async function meetupDoc(config: CopyConfig, release: ResolvedRelease): Promise<[string, string]> {
  const pad = `${COPY_DIR}/meetup-${release.number}.md`;
  let doc = await readFile(pad, 'utf8');
  for (const locale of ['nl', 'en'] as Locale[]) {
    const feiten = await feitenMetPraktisch(config, release, locale);
    const template = await readFile(`${COPY_DIR}/meetup-${release.number}.${locale}.tmpl`, 'utf8');
    doc = splice(doc, `titel-${locale}`, fence(feiten.titel as string), pad);
    doc = splice(doc, `beschrijving-${locale}`, fence(vul(template.trimEnd(), feiten)), pad);
  }
  return [pad, doc];
}

function postBlok(variant: 'lang' | 'kort', feiten: Feiten, schrijf: string, cta: string): string {
  const eerste = `[${schrijf}]`;
  const regels =
    variant === 'kort'
      ? [`${feiten.titel}, ${feiten.datum_kort}, ${feiten.stad}. ${feiten.kosten}.`]
      : [`${feiten.titel}`, `${feiten.datum_dag}, ${feiten.locatie_kort}. ${feiten.kosten}.`];
  return [eerste, '', ...regels, vul(cta, feiten)].join('\n');
}

async function postsDoc(config: CopyConfig, release: ResolvedRelease): Promise<[string, string]> {
  const pad = `${COPY_DIR}/posts-${release.number}.md`;
  const uit: string[] = [
    `# Posts voor twente.dev/${release.number}`,
    '',
    'Gegenereerd door `pnpm copy`. Bewerk niet dit bestand maar',
    `[\`copy.config.yml\`](copy.config.yml); de feiten komen uit \`src/content/events/\`.`,
    '',
    'Elk blok begint met een regel tussen blokhaken. Die vervang je door je eigen zin,',
    'de rest staat er goed in.',
    '',
  ];
  for (const moment of config.momenten) {
    const wanneer = datumVanMoment(release, moment.dagen);
    const label = moment.dagen === 0 ? 'de dag zelf' : `${moment.dagen} dagen`;
    uit.push(
      `## ${moment.id} (${label})`,
      '',
      `Plaatsen rond ${wanneer.toISOString().slice(0, 10)}.`,
      '',
    );
    for (const kanaalId of moment.kanalen) {
      const kanaal = kanaalVan(config, kanaalId);
      for (const locale of kanaal.locales) {
        const feiten = await feitenMetPraktisch(config, release, locale);
        const blok = postBlok(kanaal.variant, feiten, moment.schrijf[locale], moment.cta[locale]);
        uit.push(
          `<!-- kanaal: ${kanaal.id} | locale: ${locale} -->`,
          '',
          `**${kanaal.id} (${locale}, max ${kanaal.max_tekens})**`,
          '',
          fence(blok),
          '',
        );
      }
    }
  }
  return [pad, `${uit.join('\n').trimEnd()}\n`];
}

async function emit(pad: string, inhoud: string, drift: string[]): Promise<void> {
  const huidig = await readFile(pad, 'utf8').catch(() => null);
  if (huidig === inhoud) return;
  if (CHECK) {
    drift.push(`${pad} is verlopen, draai \`pnpm copy\` en commit het resultaat`);
    return;
  }
  await writeFile(pad, inhoud);
  console.log(`gen-copy: schreef ${pad}`);
}

const config = await readCopyConfig();
const release = await readRelease('src/content', CURRENT_RELEASE);
const drift: string[] = [];

for (const maker of [meetupDoc, postsDoc]) {
  const [pad, inhoud] = await maker(config, release);
  await emit(pad, inhoud, drift);
}

if (drift.length > 0) {
  console.error(`\ngen-copy: ${drift.length} afgeleid bestand niet actueel:\n`);
  for (const regel of drift) console.error(`  ${regel}`);
  process.exit(1);
}
