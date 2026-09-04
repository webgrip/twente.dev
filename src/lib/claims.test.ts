import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Source-level copy-drift harness (pattern from webgrip.nl, VIK-815).
 *
 * This is deliberately a grep, not a templating system: the rules below are
 * cheap regexes over source copy, because an assertion that breaks on every
 * copy edit gets deleted the first time it is inconvenient. Each rule exists
 * because its violation shipped once, or is a standing house rule someone has
 * had to correct by hand.
 *
 * Scope is COPY, not code: frontmatter, code comments and fenced code blocks
 * are stripped before matching. A line that must violate a rule on purpose
 * carries the marker `claims-allow` plus a reason, and answers for it in
 * review. This harness complements scripts/validate-commitments.ts (built
 * promises in dist/); it guards the source the promises are written in.
 */

const ROOTS = ['src/pages/nl', 'src/pages/en', 'src/templates', 'src/content'];
const EXTRA_FILES = ['src/i18n/ui.ts'];
const EXTENSIONS = new Set(['.astro', '.md', '.mdx', '.yml', '.yaml']);

interface Rule {
  name: string;
  pattern: RegExp;
  rationale: string;
  /**
   * Inactive rules are seeded and mutation-proven but do not fail the build
   * yet: the existing copy corpus predates the 2026-09-02 house-style rules,
   * and switching them on is a copy-sweep decision (owner: Ryan, see VIK-815)
   * — roughly forty lines of page copy would need rewriting in one pass.
   */
  active: boolean;
}

const FORBIDDEN: Rule[] = [
  {
    name: 'em dash in copy',
    pattern: /—/,
    rationale: 'house style 2026-09-02: geen em dashes in site copy — rewrite the sentence',
    active: false, // pending the copy sweep — see the Rule doc above
  },
  {
    name: 'single slash as separator',
    pattern: / \/ /,
    rationale: 'the separator is always //, never a single / (brand copy rule)',
    active: true,
  },
  {
    name: 'niet-X-maar-Y template',
    pattern: /\bniet\s+[^.;:\n]{1,45}?\bmaar\b/i,
    rationale: 'house style 2026-09-02: the contrastive niet-X-maar-Y frame is banned in copy',
    active: false, // pending the copy sweep — one hit is load-bearing positioning prose
  },
  {
    name: 'wrong venue city',
    pattern: /Code14[^.\n]{0,50}Enschede|Enschede[^.\n]{0,50}Hogepad/i,
    rationale:
      'the /001 venue is in RIJSSEN; Enschede was the placeholder that shipped on a banner once — people book travel off this',
    active: true,
  },
  {
    name: 'hardcoded capacity',
    pattern: /\b(?:capaciteit|capacity)\b\D{0,12}\d+/i,
    rationale:
      'capacity shipped as 100 while the room seats 40 — the number renders from EDITION_001.capacity, never as a literal',
    active: true,
  },
];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return files(path);
    if (entry === 'README.md') return []; // contributor docs, not site copy
    return EXTENSIONS.has(path.slice(path.lastIndexOf('.'))) ? [path] : [];
  });
}

/** Strip everything that is code, not copy — comments never answer for copy rules. */
function copyOf(path: string, raw: string): string {
  let s = raw;
  if (path.endsWith('.astro')) {
    s = s.replace(/^---\n[\s\S]*?\n---\n/, (m) => m.replace(/[^\n]/g, ' '));
    // Styles and scripts are code, not copy.
    s = s.replace(/<(style|script)[^>]*>[\s\S]*?<\/\1>/g, (m) => m.replace(/[^\n]/g, ' '));
    s = s.replace(/<!--[\s\S]*?-->/g, (m) => m.replace(/[^\n]/g, ' '));
    s = s.replace(/\{\/\*[\s\S]*?\*\/\}/g, (m) => m.replace(/[^\n]/g, ' '));
    // Interpolated expressions are code, not copy ({EDITION_001.capacity} must
    // not trip the capacity rule) — but a string literal rendered into copy
    // ({' / '}) IS copy, so only identifier-led expressions are blanked.
    s = s.replace(/\{[A-Za-z_$][^{}\n]*\}/g, (m) => ' '.repeat(m.length));
  } else if (path.endsWith('.ts')) {
    s = s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
    s = s.replace(/^\s*\/\/.*$/gm, (m) => m.replace(/[^\n]/g, ' '));
  } else if (path.endsWith('.md') || path.endsWith('.mdx')) {
    s = s.replace(/^```[\s\S]*?^```/gm, (m) => m.replace(/[^\n]/g, ' '));
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
      if (line.includes('claims-allow')) return; // deliberate, answers for itself in review
      // Neutralize the legitimate double-slash separator before the single-slash rule runs.
      const testable = line.replaceAll(' // ', '    ');
      for (const rule of FORBIDDEN) {
        if (!rule.active) continue;
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

test('every rule matches its own canonical violation (mutation guard)', () => {
  const canonical: Record<string, string> = {
    'em dash in copy': 'een zin — met kastlijntje',
    'single slash as separator': 'datum / locatie',
    'niet-X-maar-Y template': 'het is niet activiteit maar zicht',
    'wrong venue city': 'Code14, kantoor in Enschede',
    'hardcoded capacity': 'capaciteit: 100 plekken',
  };
  for (const rule of FORBIDDEN) {
    assert.ok(
      rule.pattern.test(canonical[rule.name] ?? ''),
      `rule "${rule.name}" no longer matches its canonical violation`,
    );
  }
});
