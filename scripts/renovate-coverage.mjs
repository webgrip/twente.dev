import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const EXPECTED = {
  'gitea-tags': 15,
  docker: 2,
  pypi: 1,
  npm: 1,
};

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
for (const [datasource, expected] of Object.entries(EXPECTED)) {
  const actual = counts[datasource] ?? 0;
  const ok = actual === expected;
  if (!ok) failed = true;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${datasource.padEnd(12)} ${actual}/${expected}`);
}

if (failed) {
  console.error(
    '\nA count changed. Either a pin was rewritten into a shape the regex no longer reads' +
      ' (it is now silently unmanaged — see ADR 0022), or a dependency was legitimately added or' +
      ' removed and EXPECTED in this script needs updating with it.',
  );
  process.exit(1);
}
