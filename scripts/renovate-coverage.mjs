import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const EXPECTED = {
  docker: 2,
  pypi: 1,
};

const WORKFLOW_PIN_DIR = '.forgejo/workflows';

// The invariant, stated directly instead of inferred from whichever config declares the manager:
// a webgrip/* reusable-workflow `uses:` must be pinned to a commit AND carry a `# vX.Y.Z` comment.
// Renovate's gitea-tags customManager (org preset forgejo.json) only claims that exact shape, so
// anything else — a branch ref like `@main`, or a bare digest — is silently unmanaged. See ADR 0022.
const WORKFLOW_PIN_OK = /uses:\s+webgrip\/[\w.-]+\/[^@\s]+@[0-9a-f]{40}\s+#\s+v\d+\.\d+\.\d+/;
const WORKFLOW_PIN_ANY = /^\s*uses:\s+webgrip\/.*$/gm;

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

const unmanaged = [];
let pinTotal = 0;
for (const file of files.filter((f) => f.startsWith(WORKFLOW_PIN_DIR))) {
  for (const m of readFileSync(file, 'utf8').matchAll(WORKFLOW_PIN_ANY)) {
    pinTotal++;
    if (!WORKFLOW_PIN_OK.test(m[0])) unmanaged.push(`${file}: ${m[0].trim()}`);
  }
}
if (unmanaged.length) {
  failed = true;
  console.log(
    `FAIL workflow pins ${pinTotal - unmanaged.length}/${pinTotal}  webgrip/* reusable workflows`,
  );
  for (const u of unmanaged) console.log(`       ${u}`);
} else {
  console.log(`ok   workflow pins ${pinTotal}/${pinTotal}  webgrip/* reusable workflows`);
}

for (const [datasource, expected] of Object.entries(EXPECTED)) {
  const actual = counts[datasource] ?? 0;
  const ok = actual === expected;
  if (!ok) failed = true;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${datasource.padEnd(12)} ${actual}/${expected}`);
}

if (failed) {
  console.error(
    '\nA workflow pin is not in the shape Renovate claims (commit SHA + `# vX.Y.Z`), so it is' +
      ' silently unmanaged — see ADR 0022. Or a fixed-count dependency was added or removed and' +
      ' EXPECTED in this script needs updating with it.',
  );
  process.exit(1);
}
