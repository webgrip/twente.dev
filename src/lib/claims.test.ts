import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

import { RELEASE_001 } from '../config/site.ts';
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
const EXTENSIONS = new Set(['.astro', '.md', '.mdx', '.yml', '.yaml', '.html']);

interface Rule {
  name: string;
  pattern: RegExp;
  rationale: string;
  active: boolean;
  scope?: RegExp;
}

const escape = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const EDITION_LITERALS = [
  formatDate(RELEASE_001.doors, 'nl'),
  formatDate(RELEASE_001.doors, 'en'),
  formatTimeRange(RELEASE_001.doors, RELEASE_001.end),
  RELEASE_001.city,
  RELEASE_001.venueAddress,
].filter((value): value is string => Boolean(value));

const FORBIDDEN: Rule[] = [
  {
    name: 'em dash in copy',
    pattern: /—/,
    rationale: 'house style 2026-09-02: geen em dashes in site copy — rewrite the sentence',
    active: true,
  },
  {
    name: 'single slash as separator',
    pattern: / \/ /,
    rationale: 'the separator is always //, never a single / (brand copy rule)',
    active: true,
  },
  {
    name: 'niet-X-maar-Y template',
    pattern: /\b(?:niet|geen)\s+[^.;:]{1,60}?\bmaar\b/i,
    rationale: 'house style 2026-09-02: the contrastive niet-X-maar-Y frame is banned in copy',
    active: true,
  },
  {
    name: 'wrong venue city',
    pattern: /Code14[^.\n]{0,50}Enschede|Enschede[^.\n]{0,50}Hogepad/i,
    rationale:
      'the /001 venue is in RIJSSEN; Enschede was the placeholder that shipped on a banner once — people book travel off this',
    active: true,
  },
  {
    name: 'literal release fact',
    pattern: new RegExp(EDITION_LITERALS.map(escape).join('|')),
    rationale:
      'the date, hours, city and address of the current release render from RELEASE_001; a page that spells them out goes stale the moment the edition moves. The venue NAME stays out of this pattern: Code14 is also the employer in the funding disclosure, where it is not an edition fact',
    active: true,
    scope: /^src\/(?:pages|templates|i18n)\//,
  },
  {
    name: 'hardcoded capacity',
    pattern: /\b(?:capaciteit|capacity)\b\D{0,12}\d+/i,
    rationale:
      'capacity shipped as 100 while the room seats 40 — the number renders from RELEASE_001.capacity, never as a literal',
    active: true,
  },
];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return files(path);
    if (entry === 'README.md') return [];
    return EXTENSIONS.has(path.slice(path.lastIndexOf('.'))) ? [path] : [];
  });
}

function copyOf(path: string, raw: string): string {
  let s = raw;
  if (path.endsWith('.astro')) {
    s = s.replace(/^---\n[\s\S]*?\n---\n/, (m) => m.replace(/[^\n]/g, ' '));
    s = s.replace(/<(style|script)[^>]*>[\s\S]*?<\/\1>/g, (m) => m.replace(/[^\n]/g, ' '));
    s = s.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '));
    s = s.replace(/\{\/\*[\s\S]*?\*\/\}/g, (m) => m.replace(/[^\n]/g, ' '));
    s = s.replace(/\{[A-Za-z_$][^{}\n]*\}/g, (m) => ' '.repeat(m.length));
  } else if (path.endsWith('.ts')) {
    s = s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
    s = s.replace(/^\s*\/\/.*$/gm, (m) => m.replace(/[^\n]/g, ' '));
  } else if (path.endsWith('.md') || path.endsWith('.mdx')) {
    s = s.replace(/^```[\s\S]*?^```/gm, (m) => m.replace(/[^\n]/g, ' '));
  } else if (path.endsWith('.html')) {
    s = s.replace(/<(style|script)[^>]*>[\s\S]*?<\/\1>/g, (m) => m.replace(/[^\n]/g, ' '));
  } else if (path.endsWith('.yml') || path.endsWith('.yaml')) {
    s = s.replace(/^\s*#.*$/gm, (m) => m.replace(/[^\n]/g, ' '));
  }
  return s;
}

test('source copy carries no banned variants', () => {
  const targets = [...ROOTS.flatMap(files), ...EXTRA_FILES];
  const violations: string[] = [];
  for (const path of targets) {
    const lines = copyOf(path, readFileSync(path, 'utf8')).split('\n');
    lines.forEach((line, i) => {
      if (line.includes('claims-allow')) return;
      const testable = line.replaceAll(' // ', '    ');
      for (const rule of FORBIDDEN) {
        if (!rule.active) continue;
        if (rule.scope && !rule.scope.test(path)) continue;
        if (rule.pattern.test(testable)) {
          violations.push(
            `${path}:${i + 1}  [${rule.name}]  ${line.trim().slice(0, 90)}\n      ${rule.rationale}`,
          );
        }
      }
    });
  }
  assert.equal(
    violations.length,
    0,
    `banned copy variants found:\n\n${violations.join('\n')}\n\n(${violations.length} total)`,
  );
});

test('the events entry agrees with RELEASE_001', () => {
  const entry = parse(readFileSync('src/content/events/twente-dev-001-reconnect.yml', 'utf8')) as {
    start: Date | string;
    end: Date | string;
    venue: { name?: string; city: string; address?: string };
  };
  const at = (value: Date | string): number => new Date(value).getTime();

  assert.equal(
    at(entry.start),
    RELEASE_001.doors.getTime(),
    'start differs from RELEASE_001.doors',
  );
  assert.equal(at(entry.end), RELEASE_001.end.getTime(), 'end differs from RELEASE_001.end');
  assert.equal(entry.venue.city, RELEASE_001.city, 'venue city differs from RELEASE_001.city');
  assert.equal(entry.venue.name, RELEASE_001.venueName, 'venue name differs from RELEASE_001');
  assert.ok(
    RELEASE_001.venueAddress && entry.venue.address?.startsWith(RELEASE_001.venueAddress),
    'venue address does not start with RELEASE_001.venueAddress',
  );
});

test('every rule matches its own canonical violation (mutation guard)', () => {
  const canonical: Record<string, string> = {
    'em dash in copy': 'een zin — met kastlijntje',
    'single slash as separator': 'datum / locatie',
    'niet-X-maar-Y template': 'het is niet activiteit maar zicht',
    'wrong venue city': 'Code14, kantoor in Enschede',
    'hardcoded capacity': 'capaciteit: 100 plekken',
    'literal release fact': `de avond is op ${formatDate(RELEASE_001.doors, 'nl')}`,
  };
  for (const rule of FORBIDDEN) {
    assert.ok(
      rule.pattern.test(canonical[rule.name] ?? ''),
      `rule "${rule.name}" no longer matches its canonical violation`,
    );
  }
});
