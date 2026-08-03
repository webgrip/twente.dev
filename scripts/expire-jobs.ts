/**
 * Content hygiene report.
 *
 * Deliberately read-only. Expired jobs already vanish from the site because
 * `getOpenJobs()` filters on `validThrough` at build time and the nightly
 * rebuild re-runs that filter — deleting files would add a bot that rewrites
 * the repository for no functional gain, and would destroy the record of what
 * was once posted.
 *
 * What this does instead: tell a human what is about to lapse, so they can
 * chase the employer for a renewal before the listing disappears.
 */
import { readdir, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parse } from 'yaml';

const JOBS = new URL('../src/content/jobs/', import.meta.url).pathname;
const EVENTS = new URL('../src/content/events/', import.meta.url).pathname;

const WARN_WINDOW_DAYS = 7;
const now = new Date();
const soon = new Date(now.getTime() + WARN_WINDOW_DAYS * 24 * 60 * 60 * 1000);

const expired: string[] = [];
const expiringSoon: string[] = [];

async function listJobFiles(): Promise<string[]> {
  try {
    return (await readdir(JOBS)).filter((f) => f.endsWith('.yml'));
  } catch {
    // No jobs directory yet — a fresh repo, not an error.
    return [];
  }
}

const jobFiles = await listJobFiles();

for (const file of jobFiles) {
  const data = parse(await readFile(join(JOBS, file), 'utf8')) as Record<string, unknown>;
  if (!data?.validThrough) continue;

  const validThrough = new Date(String(data.validThrough));
  const slug = basename(file, '.yml');

  if (validThrough <= now) {
    expired.push(`${slug} (lapsed ${validThrough.toISOString().slice(0, 10)})`);
  } else if (validThrough <= soon) {
    expiringSoon.push(`${slug} (lapses ${validThrough.toISOString().slice(0, 10)})`);
  }
}

let pastEvents = 0;
try {
  for (const file of (await readdir(EVENTS)).filter((f) => f.endsWith('.yml'))) {
    const data = parse(await readFile(join(EVENTS, file), 'utf8')) as Record<string, unknown>;
    const end = new Date(String(data.end ?? data.start));
    if (end < now) pastEvents++;
  }
} catch {
  /* no events yet */
}

console.log(`Content hygiene — ${now.toISOString().slice(0, 10)}\n`);

console.log(`jobs total:        ${jobFiles.length}`);
console.log(`jobs expired:      ${expired.length}  (already hidden from the site)`);
console.log(`jobs expiring <${WARN_WINDOW_DAYS}d: ${expiringSoon.length}`);
console.log(`events in the past: ${pastEvents}  (already moved to the archive)\n`);

if (expiringSoon.length > 0) {
  console.log('Expiring soon — worth asking the employer whether to renew:');
  for (const line of expiringSoon) console.log(`  - ${line}`);
  console.log('');
}

if (expired.length > 0) {
  console.log('Lapsed — safe to delete the file whenever you feel like tidying:');
  for (const line of expired) console.log(`  - ${line}`);
  console.log('');
}

if (expiringSoon.length === 0 && expired.length === 0) {
  console.log('Nothing needs attention.');
}
