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

describe('renderMail', () => {
  test('keeps the Brevo unsubscribe tag intact', () => {
    assert.match(renderMail(base), /href="\{\{ unsubscribe \}\}"/);
  });

  test('sets the html lang attribute from the locale', () => {
    assert.match(renderMail({ ...base, locale: 'en' }), /<html lang="en">/);
  });

  test('links privacy in the mail its own locale', () => {
    assert.match(renderMail({ ...base, locale: 'en' }), /https:\/\/twente\.dev\/en\/privacy/);
    assert.match(renderMail(base), /https:\/\/twente\.dev\/nl\/privacy/);
  });

  test('escapes markup that arrives from content', () => {
    const html = renderMail({ ...base, headline: 'Kop met <script> & "aanhalingstekens"' });
    assert.ok(!html.includes('<script>'));
    assert.match(html, /Kop met &lt;script&gt; &amp; &quot;aanhalingstekens&quot;/);
  });

  test('refuses to emit a placeholder glyph, which Brevo turns into a 404 tracking link', () => {
    assert.throws(() => renderMail({ ...base, lead: '⟦Vul hier de tekst in⟧' }), /placeholder/);
  });

  test('renders every fact as a label and a value', () => {
    const html = renderMail({
      ...base,
      facts: [
        { label: 'Datum', value: 'woensdag 4 november 2026' },
        { label: 'Locatie', value: 'Code14, Rijssen' },
      ],
    });
    assert.match(html, /Datum/);
    assert.match(html, /woensdag 4 november 2026/);
    assert.match(html, /Code14, Rijssen/);
  });

  test('omits the fact block when there are no facts', () => {
    assert.ok(!renderMail({ ...base, facts: [] }).includes('border-left: 3px solid'));
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
