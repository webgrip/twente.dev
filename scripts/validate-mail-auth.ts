import { readFileSync } from 'node:fs';
import { Resolver } from 'node:dns/promises';
import { parse } from 'yaml';

const INTENT_FILE = 'ops/mail-auth.intent.yml';
const SPF_DELIBERATELY_ABSENT = 'deliberately-absent';

interface DkimIntent {
  selector: string;
  keyCharacters?: number;
}

interface DomainIntent {
  mx: string[];
  spf: string;
  dkim: DkimIntent[];
  dmarcPolicy: string;
  dmarcReportsTo: string[];
}

interface MailAuthIntent {
  resolver: string;
  mtaSts: { policyInRepo: string; policyUrl: string; txtPublished: boolean };
  domains: Record<string, DomainIntent>;
}

const intent = parse(readFileSync(INTENT_FILE, 'utf8')) as MailAuthIntent;

const resolver = new Resolver();
resolver.setServers([intent.resolver]);

const failures: string[] = [];
const declaredPending: string[] = [];

async function txt(name: string): Promise<string[]> {
  try {
    return (await resolver.resolveTxt(name)).map((chunks) => chunks.join(''));
  } catch {
    return [];
  }
}

async function mxHosts(name: string): Promise<string[]> {
  try {
    return (await resolver.resolveMx(name)).map((r) => r.exchange.replace(/\.$/, '').toLowerCase());
  } catch {
    return [];
  }
}

function sameSet(actual: string[], expected: string[]): boolean {
  const a = [...actual].sort();
  const b = [...expected].sort();
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

for (const [domain, want] of Object.entries(intent.domains)) {
  const mx = await mxHosts(domain);
  if (!sameSet(mx, want.mx)) {
    failures.push(
      `${domain}: MX is [${mx.join(', ') || 'none'}], intent is [${want.mx.join(', ') || 'none'}]`,
    );
  }

  const spf = (await txt(domain)).filter((r) => r.toLowerCase().startsWith('v=spf1'));
  if (want.spf === SPF_DELIBERATELY_ABSENT) {
    if (spf.length > 0) {
      failures.push(
        `${domain}: an SPF record appeared where the decision was to publish none — ${spf[0]}`,
      );
    }
  } else if (spf.length !== 1) {
    failures.push(`${domain}: expected exactly one SPF record, found ${spf.length}`);
  } else if (spf[0] !== want.spf) {
    failures.push(`${domain}: SPF is "${spf[0]}", intent is "${want.spf}"`);
  }

  for (const dkim of want.dkim) {
    const key = (await txt(`${dkim.selector}._domainkey.${domain}`)).join('').replace(/\s/g, '');
    if (!key.includes('p=')) {
      failures.push(`${domain}: DKIM selector "${dkim.selector}" resolves to no key`);
    } else if (dkim.keyCharacters !== undefined && key.length !== dkim.keyCharacters) {
      failures.push(
        `${domain}: DKIM selector "${dkim.selector}" is ${key.length} characters, intent is ${dkim.keyCharacters}`,
      );
    }
  }

  const dmarc = (await txt(`_dmarc.${domain}`)).filter((r) =>
    r.toLowerCase().startsWith('v=dmarc1'),
  );
  const [dmarcRecord] = dmarc;
  if (dmarc.length !== 1 || dmarcRecord === undefined) {
    failures.push(
      `${domain}: found ${dmarc.length} DMARC records; RFC 7489 treats anything but one as no policy at all`,
    );
  } else {
    if (!dmarcRecord.includes(want.dmarcPolicy)) {
      failures.push(`${domain}: DMARC does not carry "${want.dmarcPolicy}" — ${dmarcRecord}`);
    }
    for (const address of want.dmarcReportsTo) {
      if (!dmarcRecord.includes(address)) {
        failures.push(`${domain}: DMARC no longer reports to ${address}`);
      }
    }
  }
}

const policyHost = new URL(intent.mtaSts.policyUrl).hostname.replace(/^mta-sts\./, '');
const stsTxt = (await txt(`_mta-sts.${policyHost}`)).filter((r) => r.startsWith('v=STSv1'));

if (intent.mtaSts.txtPublished) {
  if (stsTxt.length !== 1) {
    failures.push(
      `_mta-sts.${policyHost}: expected exactly one STSv1 record, found ${stsTxt.length}`,
    );
  }
  const tlsrpt = (await txt(`_smtp._tls.${policyHost}`)).filter((r) => r.startsWith('v=TLSRPTv1'));
  if (tlsrpt.length !== 1) {
    failures.push(
      `_smtp._tls.${policyHost}: expected exactly one TLSRPTv1 record, found ${tlsrpt.length}`,
    );
  }
} else if (stsTxt.length > 0) {
  failures.push(
    `_mta-sts.${policyHost} is published while ${INTENT_FILE} still says txtPublished: false`,
  );
} else {
  declaredPending.push('the _mta-sts TXT record is declared not yet published');
}

const policyInRepo = readFileSync(intent.mtaSts.policyInRepo, 'utf8').trim();
const served = await fetch(intent.mtaSts.policyUrl)
  .then(async (r) => ({
    ok: r.ok,
    type: r.headers.get('content-type') ?? '',
    body: (await r.text()).trim(),
  }))
  .catch(() => null);

if (served === null) {
  failures.push(`${intent.mtaSts.policyUrl} could not be fetched`);
} else if (!served.ok) {
  failures.push(`${intent.mtaSts.policyUrl} did not return 200`);
} else if (!served.type.startsWith('text/plain')) {
  failures.push(
    `${intent.mtaSts.policyUrl} serves ${served.type}; a policy that is not text/plain is ignored`,
  );
} else if (served.body !== policyInRepo) {
  failures.push(
    `${intent.mtaSts.policyUrl} does not match ${intent.mtaSts.policyInRepo}; the deploy is behind the repo`,
  );
}

if (failures.length > 0) {
  console.error(`\nmail-auth drift — ${failures.length} finding(s) against ${INTENT_FILE}:\n`);
  for (const f of failures) console.error(`  ${f}`);
  console.error('');
  process.exit(1);
}

for (const p of declaredPending) console.log(`mail-auth: ${p}`);
console.log(
  `mail-auth: ${Object.keys(intent.domains).length} domain(s) match ${INTENT_FILE}, MTA-STS policy served and identical to the repo`,
);
