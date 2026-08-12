/**
 * Cross-cutting content checks.
 *
 * The Zod schemas in `src/content.config.ts` validate each entry in isolation
 * and run during `astro build`. This script covers what a per-entry schema
 * structurally cannot see:
 *
 *   - references that point at a company file which does not exist
 *   - duplicate slugs within a collection
 *   - translation keys that pair more than two posts, or pair a locale to itself
 *   - fixture content still present (blocks a real launch, warns otherwise)
 *
 * Run by CI as a separate gate so a broken cross-reference is reported as a
 * content problem rather than as a mysterious build failure.
 */
import { readdir, readFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { parse } from 'yaml';

const CONTENT = new URL('../src/content/', import.meta.url).pathname;

interface Problem {
  file: string;
  message: string;
}

const errors: Problem[] = [];
const warnings: Problem[] = [];

const fail = (file: string, message: string) => errors.push({ file, message });
const warn = (file: string, message: string) => warnings.push({ file, message });

async function listYaml(dir: string): Promise<string[]> {
  try {
    const entries = await readdir(join(CONTENT, dir));
    return entries.filter((f) => f.endsWith('.yml') || f.endsWith('.yaml'));
  } catch {
    return [];
  }
}

async function readYaml(path: string): Promise<unknown> {
  return parse(await readFile(join(CONTENT, path), 'utf8'));
}

function slugOf(filename: string): string {
  return basename(filename).replace(/\.(yml|yaml|md)$/, '');
}

/* ---- companies ------------------------------------------------------------ */

const companyFiles = await listYaml('companies');
const companySlugs = new Set(companyFiles.map(slugOf));

if (companySlugs.size !== companyFiles.length) {
  fail('companies/', 'duplicate company slugs');
}

/* ---- events --------------------------------------------------------------- */

for (const file of await listYaml('events')) {
  const path = `events/${file}`;
  const data = (await readYaml(path)) as Record<string, unknown>;
  const organiser = data.organiser as Record<string, unknown> | undefined;
  const ref = organiser?.company;

  if (typeof ref === 'string' && !companySlugs.has(ref)) {
    fail(path, `organiser.company "${ref}" has no matching file in companies/`);
  }
}

/* ---- posts ---------------------------------------------------------------- */

const postsByKey = new Map<string, { file: string; locale: string }[]>();

async function listPosts(locale: string): Promise<string[]> {
  try {
    return (await readdir(join(CONTENT, 'posts', locale))).filter((f) => f.endsWith('.md'));
  } catch {
    // No posts for this locale yet.
    return [];
  }
}

for (const locale of ['nl', 'en']) {
  for (const file of await listPosts(locale)) {
    const path = `posts/${locale}/${file}`;
    const raw = await readFile(join(CONTENT, path), 'utf8');
    const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw);
    if (!match?.[1]) {
      fail(path, 'missing frontmatter');
      continue;
    }

    const front = parse(match[1]) as Record<string, unknown>;

    if (front.locale !== locale) {
      fail(
        path,
        `frontmatter locale "${String(front.locale)}" does not match directory "${locale}"`,
      );
    }

    const key = front.translationKey;
    if (typeof key !== 'string' || key.length === 0) {
      fail(path, 'translationKey is required');
      continue;
    }

    const group = postsByKey.get(key) ?? [];
    group.push({ file: path, locale });
    postsByKey.set(key, group);
  }
}

for (const [key, group] of postsByKey) {
  const locales = group.map((g) => g.locale);
  if (new Set(locales).size !== locales.length) {
    fail(
      group.map((g) => g.file).join(', '),
      `translationKey "${key}" is used twice in the same locale`,
    );
  }
  if (group.length > 2) {
    fail(
      group.map((g) => g.file).join(', '),
      `translationKey "${key}" links ${group.length} posts; expected at most one per locale`,
    );
  }
}

/* ---- fixtures ------------------------------------------------------------- */

const fixtureFiles: string[] = [];
for (const [dir, files] of [
  ['companies', companyFiles],
  ['events', await listYaml('events')],
] as const) {
  for (const file of files) {
    const raw = await readFile(join(CONTENT, dir, file), 'utf8');
    const data = parse(raw) as Record<string, unknown> | null;
    // The schema field is the source of truth (comments don't survive into
    // the data pipeline, and templates render a visible "Voorbeelddata" tag
    // from it); the FIXTURE comment scan stays as a belt-and-braces check
    // for an entry that was invented but never flagged.
    if (data?.fixture === true || raw.includes('FIXTURE')) {
      fixtureFiles.push(`${dir}/${file}`);
      if (data?.fixture !== true && raw.includes('FIXTURE')) {
        fail(`${dir}/${file}`, 'FIXTURE comment without `fixture: true` — add the schema field');
      }
    }
  }
}

if (fixtureFiles.length > 0) {
  const message = `${fixtureFiles.length} fixture file(s) still present — delete before launch`;
  // In CI on main this is a warning; a human decides when launch happens.
  // `REQUIRE_REAL_CONTENT=1` turns it into a hard gate for the launch commit.
  if (process.env.REQUIRE_REAL_CONTENT === '1') {
    fail(fixtureFiles.join(', '), message);
  } else {
    warn(fixtureFiles.join(', '), message);
  }
}

/* ---- report --------------------------------------------------------------- */

for (const { file, message } of warnings) {
  console.warn(`warning  ${file}: ${message}`);
}

for (const { file, message } of errors) {
  console.error(`error    ${file}: ${message}`);
}

console.log(
  `\nchecked ${companyFiles.length} companies, ` +
    `${postsByKey.size} translation groups — ` +
    `${errors.length} error(s), ${warnings.length} warning(s)`,
);

if (errors.length > 0) process.exit(1);
