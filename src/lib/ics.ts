/**
 * RFC 5545 iCalendar feed generation.
 *
 * This is plan lever L2: a subscribable calendar is the thing that makes
 * meetup organisers link *to us* rather than the other way round.
 *
 * Calendar feeds fail in boring, specific ways — unescaped commas, lines over
 * 75 octets, CRLF vs LF — and the failure mode is "Outlook silently imports
 * nothing". Hence the unit tests in `ics.test.ts`.
 */

export interface IcsEvent {
  uid: string;
  start: Date;
  end?: Date;
  summary: string;
  description: string;
  location: string;
  url: string;
  cancelled: boolean;
  /** Drives SEQUENCE so subscribers pick up edits. */
  lastModified?: Date;
}

/** `20260910T170000Z` — UTC form, which every client understands. */
export function formatIcsDate(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

/**
 * Escapes text per RFC 5545 §3.3.11.
 * Order matters: backslashes must be escaped before anything that introduces one.
 */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/**
 * Folds a content line to 75 octets per RFC 5545 §3.1.
 *
 * The limit is octets, not characters, so folding is done over UTF-8 bytes —
 * splitting mid-codepoint would corrupt any event with an accented character,
 * which in Dutch is most of them.
 */
export function foldLine(line: string): string {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;

  const chunks: string[] = [];
  let offset = 0;
  let limit = 75;

  while (offset < bytes.length) {
    let end = Math.min(offset + limit, bytes.length);
    // Never split a multi-byte codepoint: back off to a leading byte.
    while (end < bytes.length && (bytes[end]! & 0b1100_0000) === 0b1000_0000) {
      end--;
    }
    chunks.push(bytes.subarray(offset, end).toString('utf8'));
    offset = end;
    // Continuation lines start with a space, which costs one of the 75 octets.
    limit = 74;
  }

  return chunks.join('\r\n ');
}

function line(name: string, value: string): string {
  return foldLine(`${name}:${value}`);
}

export interface IcsCalendarOptions {
  name: string;
  description: string;
  /** Stable per-deployment; clients use it to dedupe. */
  domain: string;
  events: IcsEvent[];
  /**
   * When this calendar object was generated — DTSTAMP for events without their
   * own modification time. Injectable so tests stay deterministic.
   */
  generatedAt?: Date;
}

export function buildIcsCalendar({
  name,
  description,
  domain,
  events,
  generatedAt,
}: IcsCalendarOptions): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${domain}//Events//NL`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    line('X-WR-CALNAME', escapeIcsText(name)),
    line('X-WR-CALDESC', escapeIcsText(description)),
    'X-WR-TIMEZONE:Europe/Amsterdam',
  ];

  for (const event of events) {
    lines.push(
      'BEGIN:VEVENT',
      line('UID', `${event.uid}@${domain}`),
      // DTSTAMP is "when this iCalendar object was created" — the event's own
      // modification time when known, otherwise the feed's generation time.
      // Falling back to DTSTART would tell clients nothing ever changed.
      line('DTSTAMP', formatIcsDate(event.lastModified ?? generatedAt ?? event.start)),
      line('DTSTART', formatIcsDate(event.start)),
      ...(event.end ? [line('DTEND', formatIcsDate(event.end))] : []),
      // SEQUENCE must increase on edits or Outlook won't propagate them —
      // including the STATUS:CANCELLED flip below. Deriving it from the
      // modification timestamp makes it monotonic without extra bookkeeping.
      `SEQUENCE:${event.lastModified ? Math.floor(event.lastModified.getTime() / 1000) : 0}`,
      ...(event.lastModified ? [line('LAST-MODIFIED', formatIcsDate(event.lastModified))] : []),
      line('SUMMARY', escapeIcsText(event.summary)),
      line('DESCRIPTION', escapeIcsText(event.description)),
      line('LOCATION', escapeIcsText(event.location)),
      line('URL', event.url),
      // A cancelled event stays in the feed so the cancellation actually
      // reaches people who already subscribed. Deleting it would not.
      `STATUS:${event.cancelled ? 'CANCELLED' : 'CONFIRMED'}`,
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');

  // RFC 5545 requires CRLF line endings and a trailing break.
  return `${lines.join('\r\n')}\r\n`;
}
