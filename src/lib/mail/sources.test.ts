import { strict as assert } from 'node:assert';
import { test, describe } from 'node:test';

import { mailForEvent, mailForPost, mailForSpeaker, slugify } from './sources.ts';
import type { ResolvedRelease } from '../release.ts';
import type { EventSource, PostSource } from './sources.ts';

const nlPost: PostSource = {
  slug: 'waarom-twente-dev',
  locale: 'nl',
  translationKey: 'why-twente-dev',
  title: 'Waarom twente.dev bestaat',
  description: 'Een beschrijving.',
  publishedAt: new Date('2026-08-03T00:00:00+02:00'),
  author: { name: 'Ryan Grippeling' },
  draft: false,
};

const enPost: PostSource = {
  ...nlPost,
  slug: 'why-twente-dev-exists',
  locale: 'en',
  title: 'Why twente.dev exists',
};

const event: EventSource = {
  slug: 'twente-dev-001-reconnect',
  title: { nl: 'twente.dev/001: Reconnect', en: 'twente.dev/001: Reconnect' },
  description: { nl: 'Een avond.', en: 'An evening.' },
  start: new Date('2026-11-04T18:00:00+01:00'),
  end: new Date('2026-11-04T21:30:00+01:00'),
  venue: { name: 'Code14', address: 'Hogepad 81', city: 'Rijssen', online: false },
  url: 'https://twente.dev/nl/001',
  costEur: 0,
  language: 'both',
  release: { number: '001' },
  cancelled: false,
};

const release: ResolvedRelease = {
  number: '001',
  theme: 'Reconnect',
  doors: new Date('2026-11-04T18:00:00+01:00'),
  start: new Date('2026-11-04T18:45:00+01:00'),
  end: new Date('2026-11-04T21:30:00+01:00'),
  city: 'Rijssen',
  venueName: 'Code14',
  venueLogo: 'code14.png',
  venueAddress: 'Hogepad 81',
  venuePostalAddress: 'Hogepad 81, 7462 TB',
  venueGeo: null,
  venueMap: null,
  venueDirections: null,
  venue: 'Code14, Hogepad 81',
  capacity: 40,
  costEur: 0,
  speakers: [],
};

describe('mailForPost', () => {
  test('links each locale to its own slug rather than a swapped prefix', () => {
    assert.equal(
      mailForPost(nlPost).callToAction.href,
      'https://twente.dev/nl/blog/waarom-twente-dev',
    );
    assert.equal(
      mailForPost(enPost).callToAction.href,
      'https://twente.dev/en/blog/why-twente-dev-exists',
    );
  });

  test('takes the kicker from the pillar', () => {
    assert.equal(mailForPost({ ...nlPost, pillar: 'field-reports' }).kicker, 'Field report');
    assert.equal(mailForPost({ ...nlPost, pillar: 'release-notes' }).kicker, 'Release notes');
    assert.equal(mailForPost(nlPost).kicker, 'Nieuw op twente.dev');
  });

  test('pairs both locales under one key so they land in one filename family', () => {
    assert.equal(mailForPost(nlPost).key, mailForPost(enPost).key);
  });

  test('the preheader adds facts instead of repeating the lead', () => {
    const mail = mailForPost(nlPost);
    assert.notEqual(mail.preheader, mail.lead);
    assert.match(mail.preheader, /3 augustus 2026/);
  });
});

describe('mailForEvent', () => {
  test('builds the release url per locale instead of reusing the nl url', () => {
    assert.equal(mailForEvent(event, 'en', null).callToAction.href, 'https://twente.dev/en/001');
    assert.equal(mailForEvent(event, 'nl', null).callToAction.href, 'https://twente.dev/nl/001');
  });

  test('falls back to the entry url when the event is not one of ours', () => {
    const external = { ...event, release: undefined, url: 'https://example.org/meetup' };
    assert.equal(
      mailForEvent(external, 'nl', null).callToAction.href,
      'https://example.org/meetup',
    );
  });

  test('prefers a registration url once one exists', () => {
    const mail = mailForEvent(event, 'nl', 'https://tickets.example/001');
    assert.equal(mail.callToAction.href, 'https://tickets.example/001');
    assert.equal(mail.callToAction.label, 'Meld je aan');
  });

  test('sends readers to the release page while registration is closed', () => {
    assert.equal(mailForEvent(event, 'nl', null).callToAction.label, 'Bekijk de release');
  });

  test('states free admission rather than a price of zero', () => {
    const admission = mailForEvent(event, 'nl', null).facts.find((f) => f.label === 'Toegang');
    assert.equal(admission?.value, 'Gratis');
  });

  test('prices a paid event in euros', () => {
    const mail = mailForEvent({ ...event, costEur: 12 }, 'nl', null);
    assert.match(mail.facts.find((f) => f.label === 'Toegang')?.value ?? '', /12/);
  });

  test('a cancelled event says so in the kicker and the lead', () => {
    const mail = mailForEvent({ ...event, cancelled: true }, 'nl', null);
    assert.equal(mail.kicker, 'Afgelast');
    assert.equal(mail.lead, 'Deze avond gaat niet door.');
  });

  test('an unnamed venue renders the localized placeholder, not a bare city', () => {
    const unknown = { ...event, venue: { city: 'Rijssen', online: false } };
    assert.equal(
      mailForEvent(unknown, 'nl', null).facts.find((f) => f.label === 'Locatie')?.value,
      'Locatie volgt',
    );
  });
});

describe('mailForSpeaker', () => {
  test('carries the talk title of the mail its own locale', () => {
    const speaker = {
      name: 'Iemand Anders',
      talk: { nl: 'Een migratie die tegenviel', en: 'A migration that went sideways' },
    };
    assert.equal(
      mailForSpeaker(speaker, release, 'en').facts[0]?.value,
      'A migration that went sideways',
    );
    assert.equal(
      mailForSpeaker(speaker, release, 'nl').facts[0]?.value,
      'Een migratie die tegenviel',
    );
  });

  test('works without a talk title, dropping the fact instead of emitting an empty one', () => {
    const mail = mailForSpeaker({ name: 'Iemand Anders' }, release, 'nl');
    assert.ok(!mail.facts.some((f) => f.label === 'Talk'));
    assert.match(mail.subject, /Iemand Anders spreekt op twente\.dev\/001/);
  });

  test('keys the mail by release, so two releases cannot collide on one speaker name', () => {
    const speaker = { name: 'Iemand Anders' };
    assert.equal(mailForSpeaker(speaker, release, 'nl').key, '001-iemand-anders');
    assert.equal(
      mailForSpeaker(speaker, { ...release, number: '002' }, 'nl').key,
      '002-iemand-anders',
    );
  });

  test('names the affiliation in the lead when there is one', () => {
    const mail = mailForSpeaker({ name: 'Iemand Anders', affiliation: 'Webgrip' }, release, 'nl');
    assert.match(mail.lead, /Webgrip/);
  });
});

describe('slugify', () => {
  test('folds diacritics and punctuation into a filename-safe key', () => {
    assert.equal(slugify('Renée O’Brien-Müller'), 'renee-o-brien-muller');
  });
});
