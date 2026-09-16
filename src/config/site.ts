export const CONTACT_EMAIL = 'hello@twente.dev';
export const CONDUCT_EMAIL = 'conduct@twente.dev';
export const PRESS_EMAIL = 'press@twente.dev';

export const REPO_URL = 'https://forgejo.webgrip.dev/webgrip/twente.dev';

export const NEWSLETTER_SENDER = {
  name: 'twente.dev',
  email: 'post@send.twente.dev',
} as const;

export const REGISTRATION_URL: string | null = null;

export const MEETUP_GROUP_URL: string | null = 'https://www.meetup.com/twente-dev/';

export const NEWSLETTER_FORM_ACTION: string | null =
  'https://899818df.sibforms.com/serve/MUIFAMxMHBIlTMswbpylu2AIgloiyvkCUzu6McDz6p44KoZ8RYsFLKa-wfDpX4xkcyO-9qzDEpB3AvTFSLeMz8LbHJmz0CEADPRZlpO1oMSmo57-QsqjD6h19vKgv9uHleXdtJnnR4tMJYE51Ayrd9jKgOyb2TIbUipan1VGSdoQIDaT2GUMR8e6ATRwbfDuVwMJHOv5nNMAFsxGSQ==';

export const NEWSLETTER_FORM_FIELDS: Readonly<Record<string, string>> = {
  html_type: 'simple',
};

export const NEWSLETTER_LIST_ID: number | null = 3;

export const PRETALX_CFP_URL: string | null = null;

export const ANALYTICS_TOKEN: string | null = null;

export const REGISTRATION_OPENS = new Date('2026-09-14T09:00:00+02:00');

export const CURRENT_RELEASE = '001';

export function releaseName(number: string): string {
  return `twente.dev/${number}`;
}

export const TELEMETRY_URL: string | null = 'https://telemetry.webgrip.dev/collect';
