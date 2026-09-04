import type { Locale } from '../../i18n/config.ts';
import { en as uiEn, nl as uiNl } from '../../i18n/ui.ts';

export interface MailCopy {
  kickerAnnouncement: string;
  kickerCancelled: string;
  kickerSpeaker: string;
  kickerFieldReport: string;
  kickerReleaseNotes: string;
  kickerUpstream: string;
  kickerPost: string;
  ctaRegister: string;
  ctaReadPost: string;
  ctaViewRelease: string;
  factDate: string;
  factTime: string;
  factAuthor: string;
  factPublished: string;
  factVenue: string;
  factLanguage: string;
  factAdmission: string;
  factTalk: string;
  admissionFree: string;
  languageNl: string;
  languageEn: string;
  languageBoth: string;
  venueOnline: string;
  venueUnknown: string;
  replyLead: string;
  replyRest: string;
  reasonSubscriber: string;
  unsubscribe: string;
  privacy: string;
  speakerSubject: (name: string, release: string) => string;
  speakerLead: (name: string, release: string) => string;
  speakerLeadWithAffiliation: (name: string, affiliation: string, release: string) => string;
  cancelledLead: string;
}

export const MAIL_COPY: Record<Locale, MailCopy> = {
  nl: {
    kickerAnnouncement: 'Aankondiging',
    kickerCancelled: 'Afgelast',
    kickerSpeaker: 'Spreker',
    kickerFieldReport: uiNl['pillar.field-reports'],
    kickerReleaseNotes: uiNl['pillar.release-notes'],
    kickerUpstream: uiNl['pillar.upstream'],
    kickerPost: 'Nieuw op twente.dev',
    ctaRegister: 'Meld je aan',
    ctaReadPost: 'Lees het stuk',
    ctaViewRelease: 'Bekijk de editie',
    factDate: 'Datum',
    factTime: 'Tijd',
    factAuthor: 'Door',
    factPublished: 'Verschenen',
    factVenue: 'Locatie',
    factLanguage: 'Taal',
    factAdmission: 'Toegang',
    factTalk: 'Talk',
    admissionFree: uiNl['release.free'],
    languageNl: 'Nederlands',
    languageEn: 'Engels',
    languageBoth: 'Nederlands en Engels',
    venueOnline: 'Online',
    venueUnknown: uiNl['release.venueTba'],
    replyLead: 'Antwoorden mag.',
    replyRest: 'Deze mail komt bij een mens binnen.',
    reasonSubscriber:
      'Je krijgt dit omdat je je op twente.dev hebt aangemeld en die aanmelding vanuit je eigen inbox hebt bevestigd.',
    unsubscribe: 'Afmelden',
    privacy: 'Privacy',
    speakerSubject: (name, release) => `${name} spreekt op ${release}`,
    speakerLead: (name, release) => `${name} staat op het programma van ${release}.`,
    speakerLeadWithAffiliation: (name, affiliation, release) =>
      `${name} van ${affiliation} staat op het programma van ${release}.`,
    cancelledLead: 'Deze avond gaat niet door.',
  },
  en: {
    kickerAnnouncement: 'Announcement',
    kickerCancelled: 'Cancelled',
    kickerSpeaker: 'Speaker',
    kickerFieldReport: uiEn['pillar.field-reports'],
    kickerReleaseNotes: uiEn['pillar.release-notes'],
    kickerUpstream: uiNl['pillar.upstream'],
    kickerPost: 'New on twente.dev',
    ctaRegister: 'Register',
    ctaReadPost: 'Read the piece',
    ctaViewRelease: 'See the release',
    factDate: 'Date',
    factTime: 'Time',
    factAuthor: 'By',
    factPublished: 'Published',
    factVenue: 'Venue',
    factLanguage: 'Language',
    factAdmission: 'Admission',
    factTalk: 'Talk',
    admissionFree: uiEn['release.free'],
    languageNl: 'Dutch',
    languageEn: 'English',
    languageBoth: 'Dutch and English',
    venueOnline: 'Online',
    venueUnknown: uiEn['release.venueTba'],
    replyLead: 'Replies are welcome.',
    replyRest: 'This mail reaches a human.',
    reasonSubscriber:
      'You are getting this because you signed up on twente.dev and confirmed that signup from your own inbox.',
    unsubscribe: 'Unsubscribe',
    privacy: 'Privacy',
    speakerSubject: (name, release) => `${name} speaks at ${release}`,
    speakerLead: (name, release) => `${name} is on the programme of ${release}.`,
    speakerLeadWithAffiliation: (name, affiliation, release) =>
      `${name} of ${affiliation} is on the programme of ${release}.`,
    cancelledLead: 'This evening is not going ahead.',
  },
};
