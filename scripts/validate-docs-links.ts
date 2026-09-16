import { existsSync, readFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';

const DOCS = resolve('docs');
const LINK = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

async function markdownFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const found: string[] = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) found.push(...(await markdownFiles(path)));
    else if (entry.name.endsWith('.md')) found.push(path);
  }
  return found;
}

function offendingTarget(from: string, target: string): string | null {
  if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('#') || target.startsWith('/'))
    return null;
  const withoutAnchor = target.split('#')[0] ?? '';
  if (!withoutAnchor.endsWith('.md')) return null;
  const resolved = resolve(dirname(from), withoutAnchor);
  if (!resolved.startsWith(`${DOCS}/`))
    return 'wijst buiten docs/, dus de strict-build ziet een dode pagina';
  if (!existsSync(resolved)) return 'bestaat niet';
  return null;
}

const failures: string[] = [];
for (const file of await markdownFiles(DOCS)) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, index) => {
    for (const match of line.matchAll(LINK)) {
      const target = match[1];
      if (!target) continue;
      const reason = offendingTarget(file, target);
      if (reason)
        failures.push(`${relative(process.cwd(), file)}:${index + 1} → ${target} (${reason})`);
    }
  });
}

if (failures.length) {
  process.stderr.write(
    `docs-links: ${failures.length} markdownlink(s) die de docssite laten falen\n` +
      failures.map((line) => `  ${line}`).join('\n') +
      '\nGebruik voor een bestand buiten docs/ de volledige Forgejo-URL.\n',
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    'docs-links: elke relatieve markdownlink in docs/ wijst naar een bestaande pagina\n',
  );
}
