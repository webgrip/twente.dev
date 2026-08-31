/**
 * Site-wide launch configuration — the single place where the facts of the
 * current flagship edition and the (staged) external services live.
 *
 * The strategy playbook's rule is "one canonical event description,
 * synchronised everywhere". Every page that mentions the flagship reads
 * from here, so a venue confirmation or time change is a one-line edit.
 *
 * External services arrive on the campaign timeline, not all at once:
 * registration (e-mail RSVP) opens 2 September, the newsletter (Brevo) starts
 * with the first field note, the pretalx call opens when there is a programme
 * to fill. Until a URL is filled in, components render their honest pre-launch
 * state instead of a dead link.
 */

export const CONTACT_EMAIL = 'hello@twente.dev';
export const CONDUCT_EMAIL = 'conduct@twente.dev';
export const PRESS_EMAIL = 'press@twente.dev';

export const REPO_URL = 'https://forgejo.webgrip.dev/webgrip/twente.dev';

/**
 * Registration link. null = registration not yet open (opens 2 Sep 2026).
 * /001 registers by e-mail (no ticketing service at this size — decided
 * 2026-08-30): on 2 Sep, set this to a mailto:hello@twente.dev link with a
 * prefilled subject. The waitlist is the same mailbox, handled by a human.
 */
export const REGISTRATION_URL: string | null = null;

/** Brevo double-opt-in form URL. null = newsletter not yet live. */
export const NEWSLETTER_URL: string | null = null;

/**
 * Pretalx call-for-participation URL for the current edition.
 * null = the call is not open yet, and /bijdragen says so instead of linking
 * into a 404.
 *
 * Chosen over a home-grown form (2026-08-31): a talk submission needs speaker
 * details, a bio, a length and — the part a mail thread handles worst —
 * availability, and it needs to stay reviewable when there are more proposals
 * than slots. pretalx is the EU conference scene's default, GDPR-native, and
 * hosted pretalx.com is free until the event is made public, with a community
 * discount of up to 25% for volunteer-run non-profit events (which /001 is).
 * Self-hosting is possible and deliberately not done: this is one evening a
 * quarter, and an extra service to operate would cost more than the licence.
 *
 * Filling this in requires creating the event on pretalx.com and opening the
 * CfP; until then the open call runs by e-mail, which is honest at two slots.
 */
export const PRETALX_CFP_URL: string | null = null;

/**
 * Cloudflare Web Analytics token (ADR-0006). null = no beacon rendered.
 * Enabling also requires the CSP additions documented in BaseHead.astro.
 */
export const ANALYTICS_TOKEN: string | null = null;

/** ISO date registration opens, shown while REGISTRATION_URL is null. */
export const REGISTRATION_OPENS = new Date('2026-09-02T09:00:00+02:00');

/**
 * twente.dev/001 — Reconnect. Facts per the launch playbook and tracker:
 * Wed 7 Oct 2026, doors and food 18:00, programme 18:45, hard finish 21:30,
 * Rijssen, free, capacity 40.
 *
 * Capacity was 100 until 2026-08-30 — the original plan's number, carried over
 * from before a venue existed. Code14 hosts /001 and /002 at their Rijssen
 * office and the room seats 30–40. 40 is the agreed figure (Ryan, 2026-08-30):
 * offer the room's maximum; with typical free-event no-show rates that fills
 * the room without turning away people who would have come. A bigger venue is
 * an option for later editions if demand shows up — not a promise.
 *
 * The city is RIJSSEN, not Enschede. Everything said Enschede until 2026-08-30
 * — the plan's placeholder from before a venue existed. Code14's office is at
 * Hogepad 81, 7462 TB Rijssen (municipality Rijssen-Holten), roughly 25 km west
 * of Enschede with its own station. Still Twente, which is the point: the
 * region is Enschede, Hengelo, Almelo, Rijssen and the rest, not one city.
 * People book travel off this field — do not let it drift back.
 */
export const EDITION_001 = {
  number: '001',
  theme: 'Reconnect',
  /** Doors and food open. */
  doors: new Date('2026-10-07T18:00:00+02:00'),
  /** Programme starts. */
  start: new Date('2026-10-07T18:45:00+02:00'),
  /** Hard finish. */
  end: new Date('2026-10-07T21:30:00+02:00'),
  city: 'Rijssen',
  venue: 'Code14, Hogepad 81' as string | null,
  capacity: 40,
  costEur: 0,
} as const;

/** "twente.dev/001" — how an edition is written, everywhere, always lowercase. */
export function editionName(number: string): string {
  return `twente.dev/${number}`;
}
