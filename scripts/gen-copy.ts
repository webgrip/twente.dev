import { readFile, writeFile } from 'node:fs/promises';

import { CURRENT_RELEASE } from '../src/config/site.ts';
import type { Locale } from '../src/i18n/config.ts';
import type { ResolvedRelease } from '../src/lib/release.ts';
import {
  datumVanMoment,
  feitenVoor,
  kanaalVan,
  programmaTabel,
  readCopyConfig,
  vul,
  type CopyConfig,
  type Feiten,
} from './copy-config.ts';
import { readReleases } from './read-releases.ts';

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
  return ['```', zonderVet(inhoud), '```'].join('\n');
}

function zonderVet(tekst: string): string {
  return tekst.replace(/\*\*(.+?)\*\*/g, '$1');
}

function htmlTekst(waarde: string): string {
  return waarde
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
}

function naarHtml(titel: string, inhoud: string): string {
  const alineas = inhoud
    .split('\n\n')
    .map((blok) => `<p>${blok.split('\n').map(htmlTekst).join('<br />')}</p>`)
    .join('\n');
  return [
    '<!doctype html>',
    '<html lang="nl">',
    '<head>',
    '<meta charset="utf-8" />',
    `<title>${htmlTekst(titel)}</title>`,
    '<style>body{font:16px/1.5 system-ui,sans-serif;max-width:46rem;margin:2rem auto;padding:0 1rem}</style>',
    '</head>',
    '<body>',
    alineas,
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

async function feitenMetPraktisch(
  config: CopyConfig,
  release: ResolvedRelease,
  locale: Locale,
): Promise<Feiten> {
  const feiten = feitenVoor(release, locale);
  const regels = config.praktisch[locale].map((regel) => vul(regel, feiten));
  const met = { ...feiten, praktisch: regels.join('\n') };
  return { ...met, programma: programmaTabel(config, release, locale) };
}

function steiger(release: ResolvedRelease): string {
  const secties = (['nl', 'en'] as Locale[]).map((locale) => {
    const kop = locale === 'nl' ? 'Nederlands' : 'English';
    return [
      `## ${kop}`,
      '',
      '**Titel**',
      '',
      `<!-- BEGIN generated: titel-${locale} -->`,
      `<!-- END generated: titel-${locale} -->`,
      '',
      '**Beschrijving**',
      '',
      `<!-- BEGIN generated: beschrijving-${locale} -->`,
      `<!-- END generated: beschrijving-${locale} -->`,
    ].join('\n');
  });
  return [
    `# Meetup-beschrijving voor twente.dev/${release.number}`,
    '',
    'Kopieer de blokken hieronder naar meetup.com. De feiten komen uit',
    '`src/content/events/` en worden door `pnpm copy` ingevuld; het proza staat in',
    '`meetup.<taal>.tmpl`. Schrijf boven deze regel wat er bewust weggelaten is en',
    'waarom de volgorde is zoals hij is.',
    '',
    '---',
    '',
    secties.join('\n\n---\n\n'),
    '',
  ].join('\n');
}

async function templateVoor(nummer: string, locale: Locale): Promise<string> {
  const eigen = `${COPY_DIR}/meetup-${nummer}.${locale}.tmpl`;
  const gedeeld = `${COPY_DIR}/meetup.${locale}.tmpl`;
  return (await readFile(eigen, 'utf8').catch(() => null)) ?? (await readFile(gedeeld, 'utf8'));
}

async function meetupDoc(config: CopyConfig, release: ResolvedRelease): Promise<[string, string]> {
  const pad = `${COPY_DIR}/meetup-${release.number}.md`;
  let doc = (await readFile(pad, 'utf8').catch(() => null)) ?? steiger(release);
  for (const locale of ['nl', 'en'] as Locale[]) {
    const feiten = await feitenMetPraktisch(config, release, locale);
    const template = await templateVoor(release.number, locale);
    const gevuld = vul(template.trimEnd(), feiten);
    doc = splice(doc, `titel-${locale}`, fence(feiten.titel as string), pad);
    doc = splice(doc, `beschrijving-${locale}`, fence(gevuld), pad);
    extraHtml.push([
      `${COPY_DIR}/meetup-${release.number}.${locale}.html`,
      naarHtml(feiten.titel as string, gevuld),
    ]);
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
    'Gegenereerd door `pnpm copy`. Wijzigingen horen in',
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

function groepSteiger(): string {
  const secties = (['nl', 'en'] as Locale[]).map((locale) => {
    const kop = locale === 'nl' ? 'Nederlands' : 'English';
    return [
      `## ${kop}`,
      '',
      `<!-- BEGIN generated: beschrijving-${locale} -->`,
      `<!-- END generated: beschrijving-${locale} -->`,
    ].join('\n');
  });
  return [
    '# Groepsbeschrijving voor meetup.com',
    '',
    'De tekst van de groep zelf, niet van een losse avond. Gegenereerd door `pnpm copy`',
    'uit `meetup-groep.<taal>.tmpl`; de feiten komen uit de release die in',
    '`src/config/site.ts` als `CURRENT_RELEASE` staat.',
    '',
    '---',
    '',
    secties.join('\n\n---\n\n'),
    '',
  ].join('\n');
}

async function groepDoc(config: CopyConfig, release: ResolvedRelease): Promise<[string, string]> {
  const pad = `${COPY_DIR}/meetup-groep.md`;
  let doc = (await readFile(pad, 'utf8').catch(() => null)) ?? groepSteiger();
  for (const locale of ['nl', 'en'] as Locale[]) {
    const feiten = await feitenMetPraktisch(config, release, locale);
    const template = await readFile(`${COPY_DIR}/meetup-groep.${locale}.tmpl`, 'utf8');
    const gevuld = vul(template.trimEnd(), feiten);
    doc = splice(doc, `beschrijving-${locale}`, fence(gevuld), pad);
    extraHtml.push([`${COPY_DIR}/meetup-groep.${locale}.html`, naarHtml('meetup.com groep', gevuld)]);
  }
  return [pad, doc];
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
const releases = await readReleases('src/content');
const drift: string[] = [];
const extraHtml: Array<[string, string]> = [];

for (const release of releases) {
  for (const maker of [meetupDoc, postsDoc]) {
    const [pad, inhoud] = await maker(config, release);
    await emit(pad, inhoud, drift);
  }
}

const huidige = releases.find((r) => r.number === CURRENT_RELEASE);
if (!huidige) throw new Error(`geen events-entry voor CURRENT_RELEASE ${CURRENT_RELEASE}`);
const [groepPad, groepInhoud] = await groepDoc(config, huidige);
await emit(groepPad, groepInhoud, drift);

for (const [pad, inhoud] of extraHtml) await emit(pad, inhoud, drift);

if (drift.length > 0) {
  console.error(`\ngen-copy: ${drift.length} afgeleid bestand niet actueel:\n`);
  for (const regel of drift) console.error(`  ${regel}`);
  process.exit(1);
}
