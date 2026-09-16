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

describe('checkMail with the twente.dev routes', () => {
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

  test('names the document it is complaining about', () => {
    const problems = checkMail({ ...sound, subject: '' }, renderMail({ ...sound, subject: '' }));
    assert.equal(problems[0]?.document, 'post/example.nl');
  });
});
