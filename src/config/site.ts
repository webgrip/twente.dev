export const CONTACT_EMAIL = 'hello@twente.dev';
export const CONDUCT_EMAIL = 'conduct@twente.dev';
export const PRESS_EMAIL = 'press@twente.dev';

export const REPO_URL = 'https://forgejo.webgrip.dev/webgrip/twente.dev';

export const REGISTRATION_URL: string | null = null;

export const NEWSLETTER_FORM_ACTION: string | null =
  'https://899818df.sibforms.com/serve/MUIFAMxMHBIlTMswbpylu2AIgloiyvkCUzu6McDz6p44KoZ8RYsFLKa-wfDpX4xkcyO-9qzDEpB3AvTFSLeMz8LbHJmz0CEADPRZlpO1oMSmo57-QsqjD6h19vKgv9uHleXdtJnnR4tMJYE51Ayrd9jKgOyb2TIbUipan1VGSdoQIDaT2GUMR8e6ATRwbfDuVwMJHOv5nNMAFsxGSQ==';

export const NEWSLETTER_FORM_FIELDS: Readonly<Record<string, string>> = {
  html_type: 'simple',
};

export const PRETALX_CFP_URL: string | null = null;

export const ANALYTICS_TOKEN: string | null = null;

export const REGISTRATION_OPENS = new Date('2026-09-14T09:00:00+02:00');

const VENUE_NAME = 'Code14';
const VENUE_ADDRESS = 'Hogepad 81';

export const RELEASE_001 = {
  number: '001',
  theme: 'Reconnect',
  doors: new Date('2026-11-04T18:00:00+01:00'),
  start: new Date('2026-11-04T18:45:00+01:00'),
  end: new Date('2026-11-04T21:30:00+01:00'),
  city: 'Rijssen',
  venueName: VENUE_NAME as string | null,
  venueLogo: null as string | null,
  venueAddress: VENUE_ADDRESS as string | null,
  venue: `${VENUE_NAME}, ${VENUE_ADDRESS}` as string | null,
  capacity: 40,
  costEur: 0,
} as const;

export interface Speaker {
  name: string;
  affiliation?: string;
  talk?: { nl: string; en: string };
}

export const RELEASE_001_SPEAKERS: readonly Speaker[] = [];

export function releaseName(number: string): string {
  return `twente.dev/${number}`;
}

export const TELEMETRY_URL: string | null = 'https://telemetry.webgrip.dev/collect';
