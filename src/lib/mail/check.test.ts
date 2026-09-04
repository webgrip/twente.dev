import { strict as assert } from 'node:assert';
import { test, describe } from 'node:test';

import { checkMail } from './check.ts';
import type { MailDocument } from './document.ts';
import { renderMail } from './render.ts';

const sound: MailDocument = {
  locale: 'nl',
  kind: 'post',
  key: 'example',
  subject: 'Een onderwerp',
  preheader: 'Een preheader',
  kicker: 'Field report',
  headline: 'Een kop',
  lead: 'Een lead.',
  facts: [{ label: 'Door', value: 'Ryan Grippeling' }],
  callToAction: { label: 'Lees het stuk', href: 'https://twente.dev/nl/blog/voorbeeld' },
  reason: 'Je krijgt dit omdat je je hebt aangemeld.',
};

const messages = (document: MailDocument): string[] =>
  checkMail(document, renderMail(document)).map((problem) => problem.message);

describe('checkMail', () => {
  test('a sound mail reports nothing', () => {
    assert.deepEqual(messages(sound), []);
  });

  test('catches a call to action that leaves the locale', () => {
    const strayed = {
      ...sound,
      callToAction: { ...sound.callToAction, href: 'https://twente.dev/en/blog/voorbeeld' },
    };
    assert.match(messages(strayed).join('\n'), /leaves the nl mail/);
  });

  test('catches a relative href, which no mail client resolves', () => {
    const relative = { ...sound, callToAction: { ...sound.callToAction, href: '/nl/blog/x' } };
    assert.match(messages(relative).join('\n'), /not absolute https/);
  });

  test('catches an empty preheader', () => {
    assert.match(messages({ ...sound, preheader: '   ' }).join('\n'), /empty preheader/);
  });

  test('catches a subject too long for an inbox', () => {
    assert.match(messages({ ...sound, subject: 'x'.repeat(91) }).join('\n'), /over the 90/);
  });

  test('catches a half empty fact', () => {
    const half = { ...sound, facts: [{ label: 'Datum', value: '' }] };
    assert.match(messages(half).join('\n'), /half empty/);
  });

  test('names the document it is complaining about', () => {
    const problems = checkMail({ ...sound, subject: '' }, renderMail({ ...sound, subject: '' }));
    assert.equal(problems[0]?.document, 'post/example.nl');
  });
});
