import { strict as assert } from 'node:assert';
import { test, describe } from 'node:test';

import { MAIL_COPY } from './copy.ts';
import type { MailDocument } from './document.ts';
import { renderMail } from './render.ts';

const base: MailDocument = {
  locale: 'nl',
  kind: 'post',
  key: 'example',
  subject: 'Een onderwerp',
  preheader: 'Een preheader',
  kicker: 'Field Report',
  headline: 'Een kop',
  lead: 'Een lead.',
  facts: [{ label: 'Door', value: 'Ryan Grippeling' }],
  callToAction: { label: 'Lees het stuk', href: 'https://twente.dev/nl/blog/voorbeeld' },
  reason: 'Je krijgt dit omdat je je hebt aangemeld.',
};

describe('renderMail with the twente.dev theme', () => {
  test('keeps the Brevo unsubscribe tag intact', () => {
    assert.match(renderMail(base), /href="\{\{ unsubscribe \}\}"/);
  });

  test('links privacy in the mail its own locale', () => {
    assert.match(renderMail({ ...base, locale: 'en' }), /https:\/\/twente\.dev\/en\/privacy/);
    assert.match(renderMail(base), /https:\/\/twente\.dev\/nl\/privacy/);
  });

  test('carries the lockup and the footer copy of the locale', () => {
    const html = renderMail({ ...base, locale: 'en' });
    assert.match(html, /brand\/png\/lockup-horizontal-512\.png/);
    assert.match(html, new RegExp(MAIL_COPY.en.replyLead));
  });
});

describe('MAIL_COPY', () => {
  test('nl and en carry the same keys', () => {
    assert.deepEqual(Object.keys(MAIL_COPY.nl).sort(), Object.keys(MAIL_COPY.en).sort());
  });

  test('no locale leaves a string empty', () => {
    for (const [locale, copy] of Object.entries(MAIL_COPY)) {
      for (const [key, value] of Object.entries(copy)) {
        if (typeof value === 'string') {
          assert.notEqual(value.trim(), '', `${locale}.${key} is empty`);
        }
      }
    }
  });
});
