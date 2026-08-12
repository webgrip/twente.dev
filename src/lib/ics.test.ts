import { strict as assert } from 'node:assert';
import { test, describe } from 'node:test';

import { buildIcsCalendar, escapeIcsText, foldLine, formatIcsDate } from './ics.ts';

describe('formatIcsDate', () => {
  test('emits basic-format UTC', () => {
    assert.equal(formatIcsDate(new Date('2026-09-10T19:00:00+02:00')), '20260910T170000Z');
  });
});

describe('escapeIcsText', () => {
  test('escapes commas and semicolons', () => {
    assert.equal(escapeIcsText('Enschede, Twente; NL'), 'Enschede\\, Twente\\; NL');
  });

  test('escapes newlines', () => {
    assert.equal(escapeIcsText('line one\nline two'), 'line one\\nline two');
  });

  test('escapes backslashes before they can be reintroduced', () => {
    // A naive implementation that escapes commas first would yield `a\\,b`.
    assert.equal(escapeIcsText('a\\b,c'), 'a\\\\b\\,c');
  });
});

describe('foldLine', () => {
  test('leaves short lines alone', () => {
    assert.equal(foldLine('SUMMARY:short'), 'SUMMARY:short');
  });

  test('folds long lines with a leading space on continuations', () => {
    const folded = foldLine(`SUMMARY:${'a'.repeat(200)}`);
    const parts = folded.split('\r\n');
    assert.ok(parts.length > 1, 'expected the line to be folded');
    assert.ok(parts[0]!.length <= 75);
    for (const part of parts.slice(1)) {
      assert.ok(part.startsWith(' '), 'continuation lines must start with a space');
    }
  });

  test('never splits a multi-byte codepoint', () => {
    // 'é' is two octets; a naive character-based fold corrupts it near the limit.
    const folded = foldLine(`SUMMARY:${'é'.repeat(80)}`);
    const rejoined = folded.split('\r\n ').join('');
    assert.equal(rejoined, `SUMMARY:${'é'.repeat(80)}`);
    assert.ok(!rejoined.includes('�'), 'no replacement characters');
  });

  test('keeps every folded segment within 75 octets', () => {
    const folded = foldLine(`DESCRIPTION:${'ä'.repeat(300)}`);
    for (const part of folded.split('\r\n')) {
      assert.ok(
        Buffer.from(part, 'utf8').length <= 75,
        `segment exceeded 75 octets: ${Buffer.from(part, 'utf8').length}`,
      );
    }
  });
});

describe('buildIcsCalendar', () => {
  const base = {
    name: 'twente.dev events',
    description: 'Meetups in Twente',
    domain: 'twente.dev',
  };

  const event = {
    uid: 'twente-go-meetup',
    start: new Date('2026-09-10T19:00:00+02:00'),
    end: new Date('2026-09-10T22:00:00+02:00'),
    summary: 'Twente Go Meetup',
    description: 'Two talks about Go',
    location: 'Enschede',
    url: 'https://twente.dev/nl/events/twente-go-meetup',
    cancelled: false,
  };

  test('produces a well-formed calendar', () => {
    const ics = buildIcsCalendar({ ...base, events: [event] });
    assert.ok(ics.startsWith('BEGIN:VCALENDAR\r\n'));
    assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
    assert.ok(ics.includes('BEGIN:VEVENT'));
    assert.ok(ics.includes('UID:twente-go-meetup@twente.dev'));
    assert.ok(ics.includes('DTSTART:20260910T170000Z'));
    assert.ok(ics.includes('DTEND:20260910T200000Z'));
    assert.ok(ics.includes('STATUS:CONFIRMED'));
  });

  test('uses CRLF throughout', () => {
    const ics = buildIcsCalendar({ ...base, events: [event] });
    const bareLineFeeds = ics.split('\n').filter((l) => !l.endsWith('\r') && l !== '');
    assert.equal(bareLineFeeds.length, 0, 'every line must end with CRLF');
  });

  test('marks cancelled events rather than dropping them', () => {
    const ics = buildIcsCalendar({ ...base, events: [{ ...event, cancelled: true }] });
    assert.ok(ics.includes('STATUS:CANCELLED'));
    assert.ok(ics.includes('UID:twente-go-meetup@twente.dev'));
  });

  test('omits DTEND when the event has no end', () => {
    const { end: _end, ...open } = event;
    const ics = buildIcsCalendar({ ...base, events: [open] });
    assert.ok(!ics.includes('DTEND'));
  });

  test('DTSTAMP falls back to the generation time, not DTSTART', () => {
    const ics = buildIcsCalendar({
      ...base,
      generatedAt: new Date('2026-08-11T12:00:00Z'),
      events: [event],
    });
    assert.ok(ics.includes('DTSTAMP:20260811T120000Z'));
  });

  test('emits SEQUENCE and LAST-MODIFIED from lastModified so edits propagate', () => {
    const lastModified = new Date('2026-09-01T08:00:00Z');
    const ics = buildIcsCalendar({
      ...base,
      events: [{ ...event, lastModified }],
    });
    assert.ok(ics.includes(`SEQUENCE:${Math.floor(lastModified.getTime() / 1000)}`));
    assert.ok(ics.includes('LAST-MODIFIED:20260901T080000Z'));
    assert.ok(ics.includes('DTSTAMP:20260901T080000Z'));
  });

  test('unedited events carry SEQUENCE:0', () => {
    const ics = buildIcsCalendar({ ...base, events: [event] });
    assert.ok(ics.includes('SEQUENCE:0'));
  });
});
