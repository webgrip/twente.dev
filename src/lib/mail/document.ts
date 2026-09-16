import type { MailDocument as SharedMailDocument } from '@webgrip/astro-site-toolkit/mail';
import type { Locale } from '../../i18n/config.ts';

export type { MailFact, MailCallToAction } from '@webgrip/astro-site-toolkit/mail';
export { mailFilename } from '@webgrip/astro-site-toolkit/mail';

export const MAIL_KINDS = ['announcement', 'speaker', 'post'] as const;

export type MailKind = (typeof MAIL_KINDS)[number];

export type MailDocument = SharedMailDocument<MailKind, Locale>;
