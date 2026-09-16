import { checkMail as check } from '@webgrip/astro-site-toolkit/mail';
import type { MailProblem } from '@webgrip/astro-site-toolkit/mail';
import { SITE_URL } from '../../i18n/config.ts';
import { routePath } from '../../i18n/routes.ts';
import type { MailDocument } from './document.ts';

export type { MailProblem };

export function checkMail(document: MailDocument, html: string): MailProblem[] {
  return check(document, html, {
    siteUrl: SITE_URL,
    privacyUrl: (locale) => `${SITE_URL}${routePath('privacy', locale)}`,
    localePath: (locale) => `/${locale}/`,
  });
}
