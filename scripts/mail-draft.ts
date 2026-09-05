import { NEWSLETTER_LIST_ID, NEWSLETTER_SENDER } from '../src/config/site.ts';
import { isLocale } from '../src/i18n/config.ts';
import { checkMail } from '../src/lib/mail/check.ts';
import type { MailDocument } from '../src/lib/mail/document.ts';
import { renderMail } from '../src/lib/mail/render.ts';
import { collectTargets, die } from './mail-targets.ts';

const API = 'https://api.brevo.com/v3';
const CAMPAIGNS_URL = 'https://app.brevo.com/marketing/campaigns';
const DRY_RUN = process.argv.includes('--dry-run');

interface BrevoCampaign {
  id: number;
  name: string;
}

function campaignName(document: MailDocument): string {
  return `twente.dev // ${document.kind}/${document.key} // ${document.locale}`;
}

function apiKey(): string {
  const key = process.env.BREVO_API_KEY;
  if (!key) {
    die(
      'BREVO_API_KEY staat niet in de omgeving. Zet hem net als VIKUNJA_API_TOKEN uit de ' +
        'Keychain in je shell; hij hoort niet in een bestand en niet in de Forgejo-secrets.',
    );
  }
  return key;
}

async function brevo(path: string, init: RequestInit = {}): Promise<unknown> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'api-key': apiKey(),
      ...init.headers,
    },
  });

  const body = response.status === 204 ? null : await response.text();

  if (!response.ok) {
    die(`Brevo ${init.method ?? 'GET'} ${path} gaf ${response.status}: ${body ?? ''}`);
  }

  return body ? JSON.parse(body) : null;
}

async function listId(): Promise<number> {
  if (NEWSLETTER_LIST_ID !== null) return NEWSLETTER_LIST_ID;

  const lists = (await brevo('/contacts/lists?limit=50')) as {
    lists?: Array<{ id: number; name: string; totalSubscribers: number }>;
  };

  console.error('NEWSLETTER_LIST_ID is null in src/config/site.ts. Beschikbare lijsten:\n');
  for (const list of lists.lists ?? []) {
    console.error(`  ${String(list.id).padEnd(6)} ${list.name} (${list.totalSubscribers})`);
  }
  return die(
    '\nZet het id van de lijst die deze mail moet krijgen in NEWSLETTER_LIST_ID. Het is geen ' +
      'secret: het identificeert een lijst en geeft er geen toegang toe.',
  );
}

async function findCampaign(name: string): Promise<BrevoCampaign | undefined> {
  const page = (await brevo('/emailCampaigns?limit=100&sort=desc')) as {
    campaigns?: BrevoCampaign[];
  };
  return (page.campaigns ?? []).find((campaign) => campaign.name === name);
}

async function draft(document: MailDocument): Promise<void> {
  const html = renderMail(document);
  const problems = checkMail(document, html);

  for (const problem of problems) {
    console.error(`mail-draft: ${problem.document}: ${problem.message}`);
  }
  if (problems.length > 0) {
    die(`${problems.length} problemen in ${campaignName(document)}; niets naar Brevo gestuurd`);
  }

  const name = campaignName(document);

  if (DRY_RUN) {
    console.log(`\n${name}`);
    console.log(`  onderwerp    ${document.subject}`);
    console.log(`  previewText  ${document.preheader}`);
    console.log(`  afzender     ${NEWSLETTER_SENDER.name} <${NEWSLETTER_SENDER.email}>`);
    console.log(`  htmlContent  ${html.length} tekens`);
    console.log('  --dry-run, dus er is niets naar Brevo gestuurd');
    return;
  }

  const payload = {
    name,
    subject: document.subject,
    previewText: document.preheader,
    sender: { name: NEWSLETTER_SENDER.name, email: NEWSLETTER_SENDER.email },
    type: 'classic',
    htmlContent: html,
    recipients: { listIds: [await listId()] },
  };

  const existing = await findCampaign(name);

  if (existing) {
    await brevo(`/emailCampaigns/${existing.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    console.log(`\n${name}\n  draft ${existing.id} bijgewerkt\n  ${CAMPAIGNS_URL}`);
    return;
  }

  const created = (await brevo('/emailCampaigns', {
    method: 'POST',
    body: JSON.stringify(payload),
  })) as { id: number };

  console.log(`\n${name}\n  draft ${created.id} aangemaakt\n  ${CAMPAIGNS_URL}`);
}

const args = process.argv.slice(2).filter((arg) => arg !== '--dry-run');
const targets = await collectTargets();

if (args.length === 0) {
  console.log('mail-draft: geef een id, en optioneel een taal\n');
  for (const target of targets) {
    console.log(`  ${target.id.padEnd(40)} ${target.documents.map((d) => d.locale).join(', ')}`);
  }
  process.exit(0);
}

const wanted = targets.filter((target) => args.includes(target.id));

if (wanted.length === 0) {
  die(`geen doel gevonden voor ${args.join(' ')}; draai zonder argumenten voor de lijst`);
}

const localeFilter = args.filter(isLocale);

for (const target of wanted) {
  const documents =
    localeFilter.length === 0
      ? target.documents
      : target.documents.filter((document) => localeFilter.includes(document.locale));
  for (const document of documents) {
    await draft(document);
  }
}
