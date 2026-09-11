import type { Locale } from '../i18n/config.ts';

export interface ReleaseSpeaker {
  name: string;
  affiliation?: string;
  talk?: Record<Locale, string>;
}

export interface ProgrammeSlot {
  id: string;
  time: string;
}

export interface ReleaseBlock {
  number: string;
  theme: string;
  programmeStart: Date;
  capacity: number;
  venueLogo?: string;
  programme?: ProgrammeSlot[];
  speakers: ReleaseSpeaker[];
}

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface ReleaseEntryData {
  start: Date;
  end?: Date;
  venue: {
    name?: string;
    address?: string;
    city: string;
    online: boolean;
    geo?: GeoPoint;
    map?: string;
    directions?: Record<Locale, string>;
    parking?: Record<Locale, string>;
  };
  costEur: number;
  release?: ReleaseBlock;
}

export interface ResolvedRelease {
  number: string;
  theme: string;
  doors: Date;
  start: Date;
  end: Date;
  city: string;
  venueName: string | null;
  venueLogo: string | null;
  venueAddress: string | null;
  venuePostalAddress: string | null;
  venueGeo: GeoPoint | null;
  venueMap: string | null;
  venueDirections: Record<Locale, string> | null;
  venueParking: Record<Locale, string> | null;
  venue: string | null;
  capacity: number;
  costEur: number;
  programme: ProgrammeSlot[];
  speakers: ReleaseSpeaker[];
}

export function isReleaseEntry(data: ReleaseEntryData): boolean {
  return data.release !== undefined;
}

function streetOf(address: string | undefined): string | null {
  if (!address) return null;
  const street = address.split(',')[0]?.trim();
  return street && street.length > 0 ? street : null;
}

export function resolveRelease(data: ReleaseEntryData): ResolvedRelease {
  const block = data.release;
  if (!block) {
    throw new Error('resolveRelease called on an events entry without a release block');
  }

  const venueName = data.venue.name ?? null;
  const venueAddress = streetOf(data.venue.address);

  return {
    number: block.number,
    theme: block.theme,
    doors: data.start,
    start: block.programmeStart,
    end: data.end ?? block.programmeStart,
    city: data.venue.city,
    venueName,
    venueLogo: block.venueLogo ?? null,
    venueAddress,
    venuePostalAddress: data.venue.address ?? null,
    venueGeo: data.venue.geo ?? null,
    venueMap: data.venue.map ?? null,
    venueDirections: data.venue.directions ?? null,
    venueParking: data.venue.parking ?? null,
    venue: venueName && venueAddress ? `${venueName}, ${venueAddress}` : venueName,
    capacity: block.capacity,
    costEur: data.costEur,
    programme: block.programme ?? [],
    speakers: block.speakers,
  };
}

export function releaseByNumber(
  releases: ResolvedRelease[],
  number: string,
): ResolvedRelease | undefined {
  return releases.find((release) => release.number === number);
}
