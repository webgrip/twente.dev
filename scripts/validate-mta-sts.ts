import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const POLICY = resolve('public/.well-known/mta-sts.txt');
const ZONE = resolve('ops/dns/dnsconfig.js');
const DECLARED_ID = /TXT\(\s*'_mta-sts',\s*'v=STSv1;\s*id=([A-Za-z0-9]{1,32})'\s*\)/;
const POLICY_MX = /^mx:\s*(\S+)\s*$/gm;
const ZONE_MX = /MX\(\s*'@',\s*\d+,\s*'([^']+)'\s*\)/g;

function fingerprint(contents: Buffer): string {
  return createHash('sha256').update(contents).digest('hex').slice(0, 32);
}

const policy = readFileSync(POLICY);
const zone = readFileSync(ZONE, 'utf8');
const failures: string[] = [];

const declared = zone.match(DECLARED_ID)?.[1];
const expected = fingerprint(policy);

if (!declared) {
  failures.push(`geen _mta-sts TXT met een id gevonden in ${ZONE}`);
} else if (declared !== expected) {
  failures.push(
    `het beleid is gewijzigd maar de id niet: DNS zegt id=${declared}, het bestand vraagt id=${expected}`,
  );
}

const policyHosts = [...policy.toString().matchAll(POLICY_MX)].map(([, host]) => host);
const zoneHosts = [...zone.matchAll(ZONE_MX)].map(([, host]) => host?.replace(/\.$/, ''));

for (const host of zoneHosts) {
  const covered = policyHosts.some(
    (pattern) =>
      pattern === host ||
      (pattern?.startsWith('*.') && host?.endsWith(pattern.slice(1)) && host !== pattern.slice(2)),
  );
  if (!covered) failures.push(`MX ${host} staat in de zone maar niet in het MTA-STS-beleid`);
}

if (failures.length) {
  process.stderr.write(
    `mta-sts: ${failures.length} probleem(en) tussen het beleid en de zone\n` +
      failures.map((line) => `  ${line}`).join('\n') +
      '\nDe id is de sha256 van het beleidsbestand, ingekort tot 32 tekens. Werk hem bij in ops/dns/dnsconfig.js.\n',
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    `mta-sts: het beleid en de zone horen bij elkaar (id=${expected}), en elke MX staat in het beleid\n`,
  );
}
