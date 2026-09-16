import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from 'yaml';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist/third-party-licenses.txt');

const distributed = new Set([
  'MIT',
  'ISC',
  'Apache-2.0',
  'BSD-2-Clause',
  'BSD-3-Clause',
  '0BSD',
  'BlueOak-1.0.0',
  'CC0-1.0',
  'Python-2.0',
  'OFL-1.1',
  'Unlicense',
]);
const buildTimeOnly = new Set(['MPL-2.0', 'LGPL-3.0-or-later']);

const lockfile = parse(readFileSync(resolve(root, 'pnpm-lock.yaml'), 'utf8'));

function plain(reference) {
  const withoutPeers = reference.replace(/\(.*\)$/, '');
  const at = withoutPeers.lastIndexOf('@');
  return at > 0 ? `${withoutPeers.slice(0, at)}@${withoutPeers.slice(at + 1)}` : withoutPeers;
}

function snapshotKeys(name, reference) {
  const spec = reference.startsWith('/') ? reference.slice(1) : reference;
  return spec.includes('@', 1) && spec.startsWith(name) ? [spec] : [`${name}@${spec}`];
}

const snapshots = lockfile.snapshots ?? {};
const conveyed = new Set();
const walk = (key) => {
  if (conveyed.has(key)) return;
  conveyed.add(key);
  const snapshot = snapshots[key];
  if (!snapshot) return;
  for (const group of [snapshot.dependencies, snapshot.optionalDependencies]) {
    for (const [name, reference] of Object.entries(group ?? {})) {
      for (const child of snapshotKeys(name, reference)) walk(child);
    }
  }
};
for (const [name, entry] of Object.entries(lockfile.importers?.['.']?.dependencies ?? {})) {
  for (const key of snapshotKeys(name, entry.version)) walk(key);
}

const virtualStore = resolve(root, 'node_modules/.pnpm');
const onDisk = new Map();
if (existsSync(virtualStore)) {
  for (const directory of readdirSync(virtualStore)) {
    const modules = resolve(virtualStore, directory, 'node_modules');
    if (!existsSync(modules)) continue;
    for (const entry of readdirSync(modules)) {
      const candidates = entry.startsWith('@')
        ? readdirSync(resolve(modules, entry)).map((scoped) => `${entry}/${scoped}`)
        : [entry];
      for (const name of candidates) {
        const manifestPath = resolve(modules, name, 'package.json');
        if (!existsSync(manifestPath)) continue;
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
        if (manifest.name !== name) continue;
        onDisk.set(`${name}@${manifest.version}`, { directory: resolve(modules, name), manifest });
      }
    }
  }
}

function declaredLicence(manifest) {
  if (typeof manifest.license === 'string') return manifest.license;
  if (manifest.license?.type) return manifest.license.type;
  if (Array.isArray(manifest.licenses))
    return manifest.licenses.map((entry) => entry.type ?? entry).join(' OR ');
  return 'UNKNOWN';
}

function authorName(manifest) {
  if (typeof manifest.author === 'string') return manifest.author;
  return manifest.author?.name ?? null;
}

const failures = [];
const notInstalled = [];
const byNameAndLicence = new Map();
for (const reference of [...conveyed].map(plain).sort()) {
  const found = onDisk.get(reference);
  if (!found) {
    notInstalled.push(reference);
    continue;
  }
  const { directory, manifest } = found;
  const licence = declaredLicence(manifest);
  const key = `${manifest.name}\u0000${licence}`;
  const existing = byNameAndLicence.get(key);
  if (existing) {
    existing.versions.push(manifest.version);
    existing.paths.push(directory);
    continue;
  }
  byNameAndLicence.set(key, {
    name: manifest.name,
    licence,
    homepage: manifest.homepage ?? null,
    author: authorName(manifest),
    versions: [manifest.version],
    paths: [directory],
  });
}

const packages = [...byNameAndLicence.values()];
for (const licence of new Set(packages.map((entry) => entry.licence))) {
  if (distributed.has(licence) || buildTimeOnly.has(licence)) continue;
  const names = packages.filter((entry) => entry.licence === licence).map((entry) => entry.name);
  failures.push(
    `${licence} is not on the allowlist (${names.join(', ')}); add it to docs/licence-policy.md deliberately, or remove the dependency`,
  );
}
packages.sort((a, b) => a.name.localeCompare(b.name));

const licenceFileNames = /^(licen[cs]e|copying|ofl)(\.|$)/i;
function licenceText(entry) {
  for (const directory of entry.paths ?? []) {
    if (!existsSync(directory)) continue;
    const file = readdirSync(directory).find((name) => licenceFileNames.test(name));
    if (file) return readFileSync(resolve(directory, file), 'utf8').trim();
  }
  return null;
}

const declaredOnly = [];
const blocks = [];
for (const entry of packages) {
  const text = licenceText(entry);
  if (!text) {
    declaredOnly.push(entry);
    continue;
  }
  blocks.push(
    `${'='.repeat(78)}\n${entry.name} ${entry.versions.join(', ')}\n${entry.licence}${entry.homepage ? ` · ${entry.homepage}` : ''}\n${'='.repeat(78)}\n\n${text}\n`,
  );
}

const distDirectory = resolve(root, 'dist');
if (existsSync(distDirectory)) {
  const shipped = [];
  const walk = (directory) => {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = resolve(directory, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (
        /\.(node|dylib|so|dll)$/.test(entry.name) ||
        /libvips|lightningcss/i.test(entry.name)
      )
        shipped.push(path.slice(distDirectory.length + 1));
    }
  };
  walk(distDirectory);
  if (shipped.length) {
    failures.push(
      `build-time-only dependencies reached dist/: ${shipped.join(', ')}. ${[...buildTimeOnly].join(' and ')} are allowlisted only because they are never conveyed; if they ship, the exception in docs/licence-policy.md no longer applies.`,
    );
  }
}

if (failures.length) {
  process.stderr.write(
    'Third-party licences\n' + failures.map((line) => `  ${line}`).join('\n') + '\n',
  );
  process.exitCode = 1;
} else {
  mkdirSync(resolve(root, 'dist'), { recursive: true });
  const summary = packages
    .map((entry) => `  ${entry.licence.padEnd(18)} ${entry.name} ${entry.versions.join(', ')}`)
    .join('\n');
  const declared = declaredOnly.length
    ? `\n${'-'.repeat(78)}\nDeclared licence, no licence file in the published package\n${'-'.repeat(78)}\n\nThese packages name their licence in package.json but ship no licence text. The\nstandard text of the named licence applies; the authors are credited here.\n\n${declaredOnly.map((entry) => `  ${entry.licence.padEnd(18)} ${entry.name} ${entry.versions.join(', ')}${entry.author ? ` — ${entry.author}` : ''}`).join('\n')}\n`
    : '';
  const skipped = notInstalled.length
    ? `\n${'-'.repeat(78)}\nIn the dependency graph, not installed on this platform\n${'-'.repeat(78)}\n\npnpm skips optional packages built for another platform. These are in the lockfile\nand not in this build, so nothing of them can reach dist/.\n\n${notInstalled.map((reference) => `  ${reference}`).join('\n')}\n`
    : '';
  writeFileSync(
    output,
    `Third-party licences bundled with this site
${'-'.repeat(78)}

This file lists every production dependency and reproduces its licence. The web
fonts are the part that reaches a visitor's browser, and the SIL Open Font
Licence requires its text to travel with them; it is below.

Generated by scripts/third-party-licenses.mjs. Do not edit by hand.

${summary}
${declared}${skipped}
${blocks.join('\n')}`,
  );
  process.stdout.write(
    `Third-party licences: ${packages.length} production packages, ${new Set(packages.map((p) => p.licence)).size} distinct licences, ${blocks.length} licence texts reproduced, ${declaredOnly.length} declared without text, ${notInstalled.length} in the graph but not installed here; written to dist/third-party-licenses.txt\n`,
  );
}
