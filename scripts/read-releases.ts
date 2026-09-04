import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parse } from 'yaml';

import { resolveRelease } from '../src/lib/release.ts';
import type { ResolvedRelease } from '../src/lib/release.ts';

type Venue = { name?: string; address?: string; city: string; online: boolean };

function asDate(value: unknown, where: string): Date {
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) throw new Error(`${where} is not a usable date: ${value}`);
  return date;
}

export function releaseFromEntry(data: Record<string, unknown>): ResolvedRelease | undefined {
  const block = data.release as Record<string, unknown> | undefined;
  if (!block) return undefined;

  return resolveRelease({
    start: asDate(data.start, 'start'),
    end: data.end === undefined ? undefined : asDate(data.end, 'end'),
    venue: (data.venue ?? {}) as Venue,
    costEur: typeof data.costEur === 'number' ? data.costEur : 0,
    release: {
      number: String(block.number),
      theme: String(block.theme),
      programmeStart: asDate(block.programmeStart, 'release.programmeStart'),
      capacity: Number(block.capacity),
      venueLogo: typeof block.venueLogo === 'string' ? block.venueLogo : undefined,
      speakers: (block.speakers ?? []) as ResolvedRelease['speakers'],
    },
  });
}

export async function readReleases(contentDir: string): Promise<ResolvedRelease[]> {
  const dir = join(contentDir, 'events');
  let files: string[];
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
  } catch {
    return [];
  }

  const releases: ResolvedRelease[] = [];
  for (const file of files) {
    const data = parse(await readFile(join(dir, file), 'utf8')) as Record<string, unknown>;
    const release = releaseFromEntry(data);
    if (release) releases.push(release);
  }
  return releases.sort((a, b) => a.number.localeCompare(b.number));
}

export async function readRelease(contentDir: string, number: string): Promise<ResolvedRelease> {
  const release = (await readReleases(contentDir)).find((r) => r.number === number);
  if (!release) throw new Error(`no events entry in ${contentDir} carries release ${number}`);
  return release;
}
