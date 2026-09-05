import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

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
const EXTENSIONS = new Set(['.astro', '.md', '.mdx', '.yml', '.yaml', '.html']);

interface Rule {
  name: string;
  pattern: RegExp;
  rationale: string;
  active: boolean;
  scope?: RegExp;
}

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
    pattern: new RegExp(RELEASE_LITERALS.map(escape).join('|')),
    rationale:
      'the date, hours, city and address of the current release render from the events entry; a page that spells them out goes stale the moment the release moves. The venue NAME stays out of this pattern: Code14 is also the employer in the funding disclosure, where it is not an release fact',
    active: true,
    scope: /^src\/(?:pages|templates|i18n)\//,
  },
  {
    name: 'hardcoded capacity',
    pattern: /\b(?:capaciteit|capacity)\b\D{0,12}\d+/i,
    rationale:
      'capacity shipped as 100 while the room seats 40 — the number renders from the release block in the events entry, never as a literal in copy',
    active: true,
    scope: /^src\/(?:pages|templates|i18n)\//,
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

interface RetiredWord {
  word: string;
  use: string;
}

const RETIRED_ROOTS = ['src', 'docs', '.forgejo', 'scripts'];
const RETIRED_FILES = [
  'README.md',
  'AGENTS.md',
  'mkdocs.yml',
  'catalog-info.yml',
  'package.json',
  'docs/index.md',
  'docs/kpis.md',
  'docs/organiser-playbook.md',
  'docs/partner-compact.md',
  'docs/deliberate-non-actions.md',
];
const RETIRED_EXTENSIONS = new Set([...EXTENSIONS, '.ts', '.mjs', '.js', '.json']);

const RETIRED_EXEMPT = 'docs/domain';

function retiredTargets(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (entry === 'node_modules' || entry === 'dist') return [];
    if (path === RETIRED_EXEMPT) return [];
    if (statSync(path).isDirectory()) return retiredTargets(path);
    return RETIRED_EXTENSIONS.has(path.slice(path.lastIndexOf('.'))) ? [path] : [];
  });
}

test('no retired vocabulary outside the decision record', () => {
  const model = parse(readFileSync('docs/domain/model.yaml', 'utf8')) as {
    retired?: RetiredWord[];
  };
  const retired = model.retired ?? [];
  assert.ok(retired.length > 0, 'docs/domain/model.yaml declares no retired vocabulary');

  const targets = [
    ...RETIRED_ROOTS.filter((d) => existsSync(d)).flatMap(retiredTargets),
    ...RETIRED_FILES.filter((f) => existsSync(f)),
  ];
  const violations: string[] = [];

  for (const { word, use } of retired) {
    const pattern = new RegExp(`(?<![a-z])${escape(word)}`, 'i');
    for (const path of targets) {
      readFileSync(path, 'utf8')
        .split('\n')
        .forEach((line, i) => {
          if (!pattern.test(line)) return;
          violations.push(
            `${path}:${i + 1}  "${word}" is retired, use ${use}\n      ${line.trim().slice(0, 90)}`,
          );
        });
    }
  }

  assert.equal(
    violations.length,
    0,
    `retired vocabulary still in the tree:\n\n${violations.join('\n')}\n\n(${violations.length} total)`,
  );
});

test('every rule matches its own canonical violation (mutation guard)', () => {
  const canonical: Record<string, string> = {
    'em dash in copy': 'een zin — met kastlijntje',
    'single slash as separator': 'datum / locatie',
    'niet-X-maar-Y template': 'het is niet activiteit maar zicht',
    'wrong venue city': 'Code14, kantoor in Enschede',
    'hardcoded capacity': 'capaciteit: 100 plekken',
    'literal release fact': `de avond is op ${formatDate(RELEASE.doors, 'nl')}`,
  };
  for (const rule of FORBIDDEN) {
    assert.ok(
      rule.pattern.test(canonical[rule.name] ?? ''),
      `rule "${rule.name}" no longer matches its canonical violation`,
    );
  }
});
