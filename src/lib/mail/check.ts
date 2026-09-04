import { SITE_URL } from '../../i18n/config.ts';
import type { MailDocument } from './document.ts';

const SUBJECT_MAX = 90;
const PREHEADER_MAX = 130;
const UNSUBSCRIBE_TAG = '{{ unsubscribe }}';

export interface MailProblem {
  document: string;
  message: string;
}

function hrefsIn(html: string): string[] {
  return [...html.matchAll(/href="([^"]*)"/g)].map((match) => match[1] ?? '');
}

function nameOf(document: MailDocument): string {
  return `${document.kind}/${document.key}.${document.locale}`;
}

export function checkMail(document: MailDocument, html: string): MailProblem[] {
  const problems: MailProblem[] = [];
  const name = nameOf(document);
  const fail = (message: string) => problems.push({ document: name, message });

  const hrefs = hrefsIn(html);
  const unsubscribes = hrefs.filter((href) => href === UNSUBSCRIBE_TAG);

  if (unsubscribes.length !== 1) {
    fail(`expected exactly one ${UNSUBSCRIBE_TAG} link, found ${unsubscribes.length}`);
  }

  for (const href of hrefs) {
    if (href === UNSUBSCRIBE_TAG) continue;
    if (!href.startsWith('https://')) {
      fail(`href "${href}" is not absolute https, which breaks outside a browser`);
      continue;
    }
    if (!href.startsWith(`${SITE_URL}/`)) continue;
    const path = href.slice(SITE_URL.length);
    if (!path.startsWith(`/${document.locale}/`)) {
      fail(
        `href "${href}" leaves the ${document.locale} mail, so a reader lands in the other locale`,
      );
    }
  }

  if (
    !hrefs.some(
      (href) => href.startsWith(`${SITE_URL}/${document.locale}/`) && href.endsWith('privacy'),
    )
  ) {
    fail('no privacy link, which the double opt-in footer promises');
  }

  if (document.subject.trim() === '') fail('empty subject');
  if (document.subject.length > SUBJECT_MAX) {
    fail(
      `subject is ${document.subject.length} characters, over the ${SUBJECT_MAX} an inbox shows`,
    );
  }

  if (document.preheader.trim() === '')
    fail('empty preheader, so the client reads the first line aloud');
  if (document.preheader.length > PREHEADER_MAX) {
    fail(`preheader is ${document.preheader.length} characters, over ${PREHEADER_MAX}`);
  }

  if (document.headline.trim() === '') fail('empty headline');
  if (document.lead.trim() === '') fail('empty lead');

  if (/[⟦⟧]/.test(html)) {
    fail('a ⟦…⟧ placeholder survived, and Brevo rewrites that into a tracking link that 404s');
  }

  if (/<img(?![^>]*\salt=")/.test(html)) fail('an image carries no alt attribute');

  for (const fact of document.facts) {
    if (fact.label.trim() === '' || fact.value.trim() === '') {
      fail(`fact "${fact.label}" is half empty`);
    }
  }

  return problems;
}
