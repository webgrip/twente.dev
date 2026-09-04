import { mkdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

import { LOCALES, isLocale } from '../src/i18n/config.ts';
import type { Locale } from '../src/i18n/config.ts';
import { checkMail } from '../src/lib/mail/check.ts';
import { mailFilename } from '../src/lib/mail/document.ts';
import { renderMail } from '../src/lib/mail/render.ts';
import { REPO, collectTargets, die } from './mail-targets.ts';
import type { Target } from './mail-targets.ts';

const OUT = join(REPO, 'build/mail');

function missingLocales(target: Target): Locale[] {
  const present = new Set(target.documents.map((d) => d.locale));
  return LOCALES.filter((locale) => !present.has(locale));
}

async function build(target: Target): Promise<void> {
  await mkdir(OUT, { recursive: true });
  console.log(`\n${target.id}`);
  for (const document of target.documents) {
    const path = join(OUT, mailFilename(document));
    await writeFile(path, renderMail(document), 'utf8');
    console.log(`  ${relative(REPO, path)}`);
    console.log(`    onderwerp  ${document.subject}`);
    console.log(`    preheader  ${document.preheader}`);
  }
  for (const locale of missingLocales(target)) {
    console.log(`    ${locale} overgeslagen: er is geen ${locale}-vertaling in src/content`);
  }
}

const args = process.argv.slice(2);
const targets = await collectTargets();

if (args.includes('--check')) {
  const problems = targets.flatMap((target) =>
    target.documents.flatMap((document) => checkMail(document, renderMail(document))),
  );
  const rendered = targets.reduce((total, target) => total + target.documents.length, 0);

  for (const problem of problems) {
    console.error(`mail: ${problem.document}: ${problem.message}`);
  }

  if (problems.length > 0) {
    console.error(`\nmail: ${problems.length} problemen in ${rendered} mails`);
    process.exit(1);
  }

  console.log(`mail: ${rendered} mails gecontroleerd, geen problemen`);
  process.exit(0);
}

if (args.length === 0) {
  console.log('mail: geef een id, of --all\n');
  for (const target of targets) {
    const locales = target.documents.map((d) => d.locale).join(', ');
    console.log(`  ${target.id.padEnd(40)} ${locales}`);
  }
  process.exit(0);
}

const wanted = args.includes('--all') ? targets : targets.filter((t) => args.includes(t.id));

if (wanted.length === 0) {
  die(`geen doel gevonden voor ${args.join(' ')}; draai zonder argumenten voor de lijst`);
}

const localeFilter = args.filter(isLocale);
for (const target of wanted) {
  const documents =
    localeFilter.length === 0
      ? target.documents
      : target.documents.filter((d) => localeFilter.includes(d.locale));
  await build({ ...target, documents });
}
