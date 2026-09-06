import type { MailTheme } from '@webgrip/astro-site-toolkit/mail';
import { SITE_URL } from '../../i18n/config.ts';
import type { Locale } from '../../i18n/config.ts';
import { routePath } from '../../i18n/routes.ts';
import { MAIL_COPY } from './copy.ts';

export const MAIL_THEME: MailTheme<Locale> = {
  siteUrl: SITE_URL,
  siteName: 'twente.dev',
  logo: {
    url: `${SITE_URL}/brand/png/lockup-horizontal-512.png`,
    alt: 'twente.dev',
    width: 180,
    height: 31,
  },
  palette: {
    paper: '#f7f3ea',
    ink: '#111820',
    accent: '#c3291b',
    muted: '#5d666e',
    footerInk: '#4a545c',
    rule: '#b6bfbb',
    buttonInk: '#ffffff',
  },
  fonts: {
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
    mono: "'IBM Plex Mono', ui-monospace, Menlo, Consolas, monospace",
  },
  footer: (locale) => ({
    replyLead: MAIL_COPY[locale].replyLead,
    replyRest: MAIL_COPY[locale].replyRest,
    unsubscribe: MAIL_COPY[locale].unsubscribe,
    privacy: MAIL_COPY[locale].privacy,
    privacyUrl: `${SITE_URL}${routePath('privacy', locale)}`,
  }),
};
