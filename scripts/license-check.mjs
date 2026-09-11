import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const holder = 'Copyright 2026 Ryan Grippeling / WebGrip';
const failures = [];
const read = (path) =>
  existsSync(resolve(root, path)) ? readFileSync(resolve(root, path), 'utf8') : null;

const licence = read('LICENSE');
if (!licence) failures.push('LICENSE is missing');
else {
  if (!licence.includes('Apache License'))
    failures.push('LICENSE does not contain the Apache-2.0 text');
  if (/\[yyyy\]|\[name of copyright owner\]/.test(licence))
    failures.push(
      'LICENSE still carries the Apache appendix placeholders; name the year and the owner',
    );
  if (!licence.includes(holder))
    failures.push(`LICENSE does not carry the estate copyright line: ${holder}`);
}

const notice = read('NOTICE');
if (!notice)
  failures.push(
    'NOTICE is missing; Apache-2.0 section 4(d) is how attribution travels with a fork',
  );
else if (!notice.includes(holder)) failures.push('NOTICE does not carry the estate copyright line');

if (!read('CONTRIBUTING.md')?.includes('inbound'))
  failures.push('CONTRIBUTING.md does not state the inbound licence terms');

const manifest = JSON.parse(read('package.json') ?? '{}');
if (manifest.license !== 'Apache-2.0')
  failures.push(`package.json declares "${manifest.license}", expected "Apache-2.0"`);
if (!manifest.scripts?.build?.includes('licenses:bundle'))
  failures.push(
    'the build does not run licenses:bundle, so dist/ would ship fonts without their OFL text',
  );

for (const image of ['ops/docker/web/Dockerfile']) {
  const source = read(image);
  if (!source || !source.includes('org.opencontainers.image.licenses')) continue;
  if (!source.includes('org.opencontainers.image.licenses="Apache-2.0"'))
    failures.push(`${image} does not label the image Apache-2.0`);
}

if (failures.length) {
  process.stderr.write(
    'License consistency\n' + failures.map((line) => `  ${line}`).join('\n') + '\n',
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    'License consistency: Apache-2.0, copyright line present, NOTICE and inbound terms stated, build bundles third-party licences.\n',
  );
}
