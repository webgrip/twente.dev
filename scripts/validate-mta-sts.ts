import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const POLICY = resolve('public/.well-known/mta-sts.txt');
const ZONE = resolve('ops/dns/dnsconfig.js');
const POLICY_MX = /^mx:\s*(\S+)\s*$/gm;
const ZONE_MX = /MX\(\s*'@',\s*\d+,\s*'([^']+)'\s*\)/g;

function covers(pattern: string, host: string): boolean {
  if (pattern === host) return true;
  if (!pattern.startsWith('*.')) return false;
  const suffix = pattern.slice(1);
  return host.endsWith(suffix) && host.length > suffix.length;
}

const policy = readFileSync(POLICY, 'utf8');
const zone = readFileSync(ZONE, 'utf8');

const patterns = [...policy.matchAll(POLICY_MX)].map(([, host]) => host ?? '');
const hosts = [...zone.matchAll(ZONE_MX)].map(([, host]) => (host ?? '').replace(/\.$/, ''));
const uncovered = hosts.filter((host) => !patterns.some((pattern) => covers(pattern, host)));

if (hosts.length === 0) {
  process.stderr.write(
    'mta-sts: de zone declareert geen enkele MX, terwijl het beleid verzenders naar een MX dwingt\n',
  );
  process.exitCode = 1;
} else if (uncovered.length) {
  process.stderr.write(
    `mta-sts: ${uncovered.length} MX uit de zone staat niet in het beleid\n` +
      uncovered.map((host) => `  ${host}`).join('\n') +
      `\nOnder mode: enforce weigert een verzender te bezorgen bij een MX die niet in ${POLICY} staat.\n`,
  );
  process.exitCode = 1;
} else {
  process.stdout.write(`mta-sts: elke MX uit de zone staat in het beleid (${hosts.join(', ')})\n`);
}
