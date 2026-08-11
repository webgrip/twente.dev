/**
 * Site-wide launch configuration — the single place where the facts of the
 * current flagship edition and the (staged) external services live.
 *
 * The strategy playbook's rule is "one canonical event description,
 * synchronised everywhere". Every page that mentions the flagship reads
 * from here, so a venue confirmation or time change is a one-line edit.
 *
 * External services arrive on the campaign timeline, not all at once:
 * registration (pretix) opens 2 September, the newsletter (Brevo) starts
 * with the first field note. Until a URL is filled in, components render
 * their honest pre-launch state instead of a dead link.
 */

export const CONTACT_EMAIL = 'hello@twente.dev';
export const CONDUCT_EMAIL = 'conduct@twente.dev';
export const PRESS_EMAIL = 'press@twente.dev';

export const REPO_URL = 'https://forgejo.webgrip.dev/webgrip/twente.dev';

/** pretix event URL. null = registration not yet open (opens 2 Sep 2026). */
export const REGISTRATION_URL: string | null = null;

/** Brevo double-opt-in form URL. null = newsletter not yet live. */
export const NEWSLETTER_URL: string | null = null;

/** ISO date registration opens, shown while REGISTRATION_URL is null. */
export const REGISTRATION_OPENS = new Date('2026-09-02T09:00:00+02:00');

/**
 * twente.dev/001 — Reconnect. Facts per the launch playbook and tracker:
 * Wed 7 Oct 2026, doors and food 18:00, programme 18:45, hard finish 21:30,
 * Enschede, free, capacity 100. Venue is under offer — null until contracted.
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
  city: 'Enschede',
  venue: null as string | null,
  capacity: 100,
  costEur: 0,
} as const;

/** "twente.dev/001" — how an edition is written, everywhere, always lowercase. */
export function editionName(number: string): string {
  return `twente.dev/${number}`;
}
