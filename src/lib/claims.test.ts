import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import {
  bannedCopyViolations,
  retiredVocabularyViolations,
  rulesWithoutProof,
} from '@webgrip/astro-site-toolkit/claims';
import type { ClaimRule } from '@webgrip/astro-site-toolkit/claims';

import { CURRENT_RELEASE } from '../config/site.ts';
import { resolveRelease } from './release.ts';
import type { ReleaseEntryData } from './release.ts';
import { formatDate, formatTimeRange } from '../i18n/utils.ts';

const ROOTS = ['src/pages/nl', 'src/pages/en', 'src/templates', 'src/content', 'docs/brand'];
const EXTRA_FILES = [
  'src/i18n/ui.ts',
  'src/components/BaseHead.astro',
  'src/components/EventCard.astro',
  'src/lib/feeds.ts',
  'src/pages/llms.txt.ts',
  'src/pages/styleguide.astro',
];
const escape = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function currentRelease(): ReturnType<typeof resolveRelease> {
  const dir = 'src/content/events';
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.yml') && !file.endsWith('.yaml')) continue;
    const data = parse(readFileSync(join(dir, file), 'utf8')) as ReleaseEntryData & {
      release?: { number: string; programmeStart: Date | string };
    };
    if (data.release?.number !== CURRENT_RELEASE) continue;
    return resolveRelease({
      ...data,
      start: new Date(data.start),
      end: data.end === undefined ? undefined : new Date(data.end),
      release: { ...data.release, programmeStart: new Date(data.release.programmeStart) },
    });
  }
  throw new Error(`no events entry carries release ${CURRENT_RELEASE}`);
}

const RELEASE = currentRelease();

const RELEASE_LITERALS = [
  formatDate(RELEASE.doors, 'nl'),
  formatDate(RELEASE.doors, 'en'),
  formatTimeRange(RELEASE.doors, RELEASE.end),
  RELEASE.city,
  RELEASE.venueAddress,
].filter((value): value is string => Boolean(value));

const FORBIDDEN: ClaimRule[] = [
  {
    name: 'em dash in copy',
    canonical: 'een zin — met kastlijntje',
    pattern: /—/,
    rationale: 'house style 2026-09-02: geen em dashes in site copy — rewrite the sentence',
  },
  {
    name: 'single slash as separator',
    canonical: 'datum / locatie',
    pattern: / \/ /,
    rationale: 'the separator is always //, never a single / (brand copy rule)',
  },
  {
    name: 'niet-X-maar-Y template',
    canonical: 'het is niet activiteit maar zicht',
    pattern: /\b(?:niet|geen)\s+[^.;:]{1,60}?\bmaar\b/i,
    rationale: 'house style 2026-09-02: the contrastive niet-X-maar-Y frame is banned in copy',
  },
  {
    name: 'wrong venue city',
    canonical: 'Code14, kantoor in Enschede',
    pattern: /Code14[^.\n]{0,50}Enschede|Enschede[^.\n]{0,50}Hogepad/i,
    rationale:
      'the /001 venue is in RIJSSEN; Enschede was the placeholder that shipped on a banner once — people book travel off this',
  },
  {
    name: 'literal release fact',
    canonical: `de avond is op ${formatDate(RELEASE.doors, 'nl')}`,
    pattern: new RegExp(RELEASE_LITERALS.map(escape).join('|')),
    rationale:
      'the date, hours, city and address of the current release render from the events entry; a page that spells them out goes stale the moment the release moves. The venue NAME stays out of this pattern: Code14 is also the employer in the funding disclosure, where it is not an release fact',
    scope: /^src\/(?:pages|templates|i18n)\//,
  },
  {
    name: 'hardcoded capacity',
    canonical: 'capaciteit: 100 plekken',
    pattern: /\b(?:capaciteit|capacity)\b\D{0,12}\d+/i,
    rationale:
      'capacity shipped as 100 while the room seats 40 — the number renders from the release block in the events entry, never as a literal in copy',
    scope: /^src\/(?:pages|templates|i18n)\//,
  },
];

test('source copy carries no banned variants', () => {
  const violations = bannedCopyViolations(FORBIDDEN, {
    roots: ROOTS,
    extraFiles: EXTRA_FILES,
    ignore: /(^|\/)(README|copy-voice)\.md$/,
  });
  assert.equal(
    violations.length,
    0,
    `banned copy variants found:\n\n${violations.join('\n')}\n\n(${violations.length} total)`,
  );
});

test('no retired vocabulary outside the decision record', () => {
  const { retired, violations } = retiredVocabularyViolations({
    modelPath: 'docs/domain/model.yaml',
    exempt: ['docs/domain'],
  });
  assert.ok(retired > 0, 'docs/domain/model.yaml declares no retired vocabulary');
  assert.equal(
    violations.length,
    0,
    `retired vocabulary still in the tree:\n\n${violations.join('\n')}\n\n(${violations.length} total)`,
  );
});

test('every rule matches its own canonical violation (mutation guard)', () => {
  assert.deepEqual(rulesWithoutProof(FORBIDDEN), []);
});
