import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';

import { SITE_URL, TIMEZONE } from '../src/i18n/config.ts';
import type { Locale } from '../src/i18n/config.ts';
import type { ResolvedRelease } from '../src/lib/release.ts';

export const CONFIG_PATH = 'docs/brand/copy/copy.config.yml';

export interface Kanaal {
  id: string;
  max_tekens: number;
  locales: Locale[];
  variant: 'lang' | 'kort';
}

export interface Moment {
  id: string;
  dagen: number;
  kanalen: string[];
  schrijf: Record<Locale, string>;
  cta: Record<Locale, string>;
}

export interface VerbodenClaim {
  id: string;
  reden: string;
  nl: string[];
  en: string[];
}

export interface Bron {
  patroon?: string;
  bestand?: string;
  kanaal?: string;
}

export interface ToegestaneTell {
  kanaal: string;
  ids: string[];
  reden: string;
}

export interface CopyConfig {
  kanalen: Kanaal[];
  praktisch: Record<Locale, string[]>;
  programma: Record<Locale, Record<string, string>>;
  momenten: Moment[];
  verboden_claims: VerbodenClaim[];
  toegestane_tells?: ToegestaneTell[];
  bronnen: Bron[];
}

export type Feiten = Record<string, string>;

export async function readCopyConfig(path: string = CONFIG_PATH): Promise<CopyConfig> {
  return parse(await readFile(path, 'utf8')) as CopyConfig;
}

export function kanaalVan(config: CopyConfig, id: string): Kanaal {
  const kanaal = config.kanalen.find((k) => k.id === id);
  if (!kanaal) throw new Error(`kanaal ${id} staat niet in ${CONFIG_PATH}`);
  return kanaal;
}

const tag = (locale: Locale): string => (locale === 'nl' ? 'nl-NL' : 'en-GB');

const hoofdletter = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

function tijd(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function datum(date: Date, locale: Locale, kort: boolean): string {
  const opts: Intl.DateTimeFormatOptions = kort
    ? { timeZone: TIMEZONE, day: 'numeric', month: 'long' }
    : { timeZone: TIMEZONE, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return hoofdletter(new Intl.DateTimeFormat(tag(locale), opts).format(date)).replace(
    /^(\S+),\s/,
    '$1 ',
  );
}

function dagEnDatum(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(tag(locale), {
    timeZone: TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
    .format(date)
    .replace(/^(\S+),\s/, '$1 ');
}

function minuten(van: string, tot: string): number {
  const naarMinuten = (waarde: string): number => {
    const [uur, minuut] = waarde.split(':').map(Number);
    return (uur ?? 0) * 60 + (minuut ?? 0);
  };
  return naarMinuten(tot) - naarMinuten(van);
}

function talkduurVan(release: ResolvedRelease): string {
  const index = release.programme.findIndex((slot) => /^talk-\d+$/.test(slot.id));
  const eerste = release.programme[index];
  const volgende = release.programme[index + 1];
  if (!eerste || !volgende) return '';
  return String(minuten(eerste.time, volgende.time));
}

export function feitenVoor(release: ResolvedRelease, locale: Locale): Feiten {
  const straat = [release.venuePostalAddress, release.city]
    .filter((part): part is string => Boolean(part))
    .join(' ');
  const delen: string[] = [];
  if (release.venueName) delen.push(release.venueName);
  if (straat.length > 0) delen.push(straat);
  const adres = delen.join(', ');
  const geenSprekers = release.speakers.length === 0;
  return {
    titel: `twente.dev/${release.number}: ${release.theme}`,
    nummer: release.number,
    datum: datum(release.doors, locale, false),
    datum_kort: datum(release.doors, locale, true),
    datum_dag: dagEnDatum(release.doors, locale),
    deuren: tijd(release.doors, locale),
    programma: tijd(release.start, locale),
    einde: tijd(release.end, locale),
    locatie: adres,
    locatie_kort: [release.venueName, release.city].filter(Boolean).join(', '),
    stad: release.city,
    route: release.venueDirections?.[locale] ?? '',
    parkeren: release.venueParking?.[locale] ?? '',
    kosten: release.costEur === 0 ? (locale === 'nl' ? 'Gratis' : 'Free') : `€${release.costEur}`,
    capaciteit: String(release.capacity),
    talkduur: talkduurVan(release),
    url: `${SITE_URL}/${locale}/${release.number}`,
    sprekers_kort: geenSprekers ? 'TBA' : release.speakers.map((s) => s.name).join(', '),
    sprekers: geenSprekers
      ? locale === 'nl'
        ? 'allebei nog TBA'
        : 'both still TBA'
      : release.speakers.map((s) => s.name).join(', '),
  };
}

export function programmaTabel(
  config: CopyConfig,
  release: ResolvedRelease,
  locale: Locale,
): string {
  const labels = config.programma[locale];
  const klok = (date: Date): string =>
    new Intl.DateTimeFormat(tag(locale), {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  const regels: Array<[string, string]> = [
    [klok(release.doors), labels.doors as string],
    [klok(release.start), labels.welcome as string],
  ];
  for (const slot of release.programme) {
    const positie = slot.id.match(/^talk-(\d+)$/);
    if (positie) {
      const index = Number(positie[1]) - 1;
      const spreker = release.speakers[index]?.name ?? (labels.talk_tba as string);
      regels.push([slot.time, vul(labels.talk as string, { n: String(index + 1), spreker })]);
    } else {
      regels.push([slot.time, (labels[slot.id] ?? slot.id) as string]);
    }
  }
  regels.push([klok(release.end), labels.finish as string]);
  return regels.map(([tijdstip, item]) => `${tijdstip} · ${item}`).join('\n');
}

export function vul(template: string, feiten: Feiten): string {
  return template.replace(/\{(\w+)\}/g, (heel, sleutel: string) => feiten[sleutel] ?? heel);
}

export function datumVanMoment(release: ResolvedRelease, dagen: number): Date {
  const date = new Date(release.doors);
  date.setUTCDate(date.getUTCDate() + dagen);
  return date;
}
