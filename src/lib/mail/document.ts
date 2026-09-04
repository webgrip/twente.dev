import type { Locale } from '../../i18n/config.ts';

export interface MailFact {
  label: string;
  value: string;
}

export interface MailCallToAction {
  label: string;
  href: string;
}

export interface MailDocument {
  locale: Locale;
  kind: MailKind;
  key: string;
  subject: string;
  preheader: string;
  kicker: string;
  headline: string;
  lead: string;
  facts: MailFact[];
  callToAction: MailCallToAction;
  reason: string;
}

export const MAIL_KINDS = ['announcement', 'speaker', 'post'] as const;

export type MailKind = (typeof MAIL_KINDS)[number];

export function mailFilename(document: MailDocument): string {
  return `${document.kind}-${document.key}.${document.locale}.html`;
}
