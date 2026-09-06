import { brevoDraftCli } from '@webgrip/astro-site-toolkit/mail';

import { NEWSLETTER_LIST_ID, NEWSLETTER_SENDER } from '../src/config/site.ts';
import { isLocale } from '../src/i18n/config.ts';
import { checkMail } from '../src/lib/mail/check.ts';
import type { MailDocument } from '../src/lib/mail/document.ts';
import { renderMail } from '../src/lib/mail/render.ts';
import { collectTargets } from './mail-targets.ts';

const campaignName = (document: MailDocument): string =>
  `twente.dev // ${document.kind}/${document.key} // ${document.locale}`;

process.exit(
  await brevoDraftCli({
    targets: await collectTargets(),
    isLocale,
    render: renderMail,
    check: checkMail,
    sender: NEWSLETTER_SENDER,
    listId: NEWSLETTER_LIST_ID,
    campaignName,
  }),
);
