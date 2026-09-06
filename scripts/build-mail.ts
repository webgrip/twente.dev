import { join } from 'node:path';
import { mailBuildCli } from '@webgrip/astro-site-toolkit/mail';

import { LOCALES, isLocale } from '../src/i18n/config.ts';
import { checkMail } from '../src/lib/mail/check.ts';
import { renderMail } from '../src/lib/mail/render.ts';
import { REPO, collectTargets } from './mail-targets.ts';

process.exit(
  await mailBuildCli({
    targets: await collectTargets(),
    locales: LOCALES,
    isLocale,
    outDir: join(REPO, 'build/mail'),
    root: REPO,
    render: renderMail,
    check: checkMail,
  }),
);
