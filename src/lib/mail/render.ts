import { renderMail as render } from '@webgrip/astro-site-toolkit/mail';
import type { MailDocument } from './document.ts';
import { MAIL_THEME } from './theme.ts';

export function renderMail(document: MailDocument): string {
  return render(document, MAIL_THEME);
}
