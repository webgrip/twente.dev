export interface IcsEvent {
  uid: string;
  start: Date;
  end?: Date;
  summary: string;
  description: string;
  location: string;
  url: string;
  cancelled: boolean;
  lastModified?: Date;
}

export function formatIcsDate(date: Date): string {
  return `${date.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
}

export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

export function foldLine(line: string): string {
  const bytes = Buffer.from(line, 'utf8');
  if (bytes.length <= 75) return line;

  const chunks: string[] = [];
  let offset = 0;
  let limit = 75;

  while (offset < bytes.length) {
    let end = Math.min(offset + limit, bytes.length);
    while (end < bytes.length && (bytes[end]! & 0b1100_0000) === 0b1000_0000) {
      end--;
    }
    chunks.push(bytes.subarray(offset, end).toString('utf8'));
    offset = end;
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
  domain: string;
  events: IcsEvent[];
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
      line('DTSTAMP', formatIcsDate(event.lastModified ?? generatedAt ?? event.start)),
      line('DTSTART', formatIcsDate(event.start)),
      ...(event.end ? [line('DTEND', formatIcsDate(event.end))] : []),
      `SEQUENCE:${event.lastModified ? Math.floor(event.lastModified.getTime() / 1000) : 0}`,
      ...(event.lastModified ? [line('LAST-MODIFIED', formatIcsDate(event.lastModified))] : []),
      line('SUMMARY', escapeIcsText(event.summary)),
      line('DESCRIPTION', escapeIcsText(event.description)),
      line('LOCATION', escapeIcsText(event.location)),
      line('URL', event.url),
      `STATUS:${event.cancelled ? 'CANCELLED' : 'CONFIRMED'}`,
      'END:VEVENT',
    );
  }

  lines.push('END:VCALENDAR');

  return `${lines.join('\r\n')}\r\n`;
}
