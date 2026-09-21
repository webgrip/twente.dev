import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const EXPECTED = {
  docker: 2,
  pypi: 1,
};

const SELF_DERIVED = [
  {
    datasource: 'gitea-tags',
    label: 'webgrip/* reusable-workflow pins',
    dir: '.forgejo/workflows',
    // Every job-level `uses:` pointing at a webgrip repo must be claimed by the customManager.
    // Deriving the count from the files instead of hardcoding it means adding a lane cannot
    // silently go unmanaged, and removing one cannot make this fail for the wrong reason.
    present: (text) => [...text.matchAll(/^\s*uses:\s+webgrip\//gm)].length,
  },
];

const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.astro', '.wrangler', 'media']);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(relative(process.cwd(), full));
  }
  return out;
}

function globToRegExp(pattern) {
  const body = pattern.startsWith('/') && pattern.endsWith('/') ? pattern.slice(1, -1) : pattern;
  return new RegExp(body);
}

const config = JSON.parse(readFileSync('renovate.json', 'utf8'));
const files = walk(process.cwd());
const counts = {};
const rows = [];

for (const manager of config.customManagers ?? []) {
  const filePatterns = manager.managerFilePatterns.map(globToRegExp);
  const matched = files.filter((f) => filePatterns.some((re) => re.test(f)));
  if (matched.length === 0) {
    rows.push({
      file: manager.managerFilePatterns.join(','),
      datasource: '—',
      dep: 'NO FILE MATCHED',
      value: '',
    });
    continue;
  }
  for (const pattern of manager.matchStrings) {
    const re = new RegExp(pattern, 'g');
    for (const file of matched) {
      for (const m of readFileSync(file, 'utf8').matchAll(re)) {
        const { depName, currentValue, currentDigest } = m.groups ?? {};
        counts[manager.datasourceTemplate] = (counts[manager.datasourceTemplate] ?? 0) + 1;
        rows.push({
          file,
          datasource: manager.datasourceTemplate,
          dep: depName,
          value: currentValue + (currentDigest ? `  @${currentDigest.slice(0, 12)}` : ''),
        });
      }
    }
  }
}

for (const row of rows.sort(
  (a, b) => a.datasource.localeCompare(b.datasource) || a.file.localeCompare(b.file),
)) {
  console.log(
    `${row.datasource.padEnd(12)} ${row.dep.padEnd(32)} ${row.value.padEnd(24)} ${row.file}`,
  );
}

console.log('');
let failed = false;

for (const { datasource, label, dir, present } of SELF_DERIVED) {
  let expected = 0;
  for (const file of files.filter((f) => f.startsWith(dir))) {
    expected += present(readFileSync(file, 'utf8'));
  }
  const actual = counts[datasource] ?? 0;
  const ok = actual === expected;
  if (!ok) failed = true;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${datasource.padEnd(12)} ${actual}/${expected}  ${label}`);
}

for (const [datasource, expected] of Object.entries(EXPECTED)) {
  const actual = counts[datasource] ?? 0;
  const ok = actual === expected;
  if (!ok) failed = true;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${datasource.padEnd(12)} ${actual}/${expected}`);
}

if (failed) {
  console.error(
    '\nA count is off. For the self-derived rows a pin exists that the customManager does not' +
      ' claim — usually one pinned to a branch (`@main`) or without the `# vX.Y.Z` comment, so it' +
      ' is silently unmanaged (see ADR 0022). For the fixed rows a dependency was added or removed' +
      ' and EXPECTED in this script needs updating with it.',
  );
  process.exit(1);
}
