/**
 * UI strings.
 *
 * Dutch is the structural source of truth: `en` is typed as
 * `Record<UIKey, string>`, so a key added to `nl` and forgotten in `en` is a
 * **compile error**, not a runtime fallback. That makes `pnpm typecheck` the
 * i18n-completeness gate described in the plan (§6.6 item 7) — no bespoke
 * lint script required.
 *
 * Content strings (articles, job descriptions) do NOT live here; they live in
 * the content collections, which carry their own per-locale fields.
 *
 * The tagline "We build it. We run it. We share it." is the brand line and
 * stays verbatim in both locales — the rule is that it is always paired with
 * a literal explanation, never left to carry meaning alone. (Replaced the
 * founding pack's "Build here. Share here." on 2026-08-11.)
 */

export const nl = {
  'site.name': 'twente.dev',
  'site.tagline': 'We build it. We run it. We share it.',
  'site.description':
    'Onafhankelijke, practitioner-led techcommunity voor Twente. We maken lokale mensen, events en praktijkkennis beter vindbaar — van Enschede tot Almelo.',

  'nav.home': 'Home',
  'nav.events': 'Events',
  'nav.jobs': 'Vacatures',
  'nav.companies': 'Bedrijven',
  'nav.blog': 'Blog',
  'nav.communities': 'Communities',
  'nav.about': 'Over ons',
  'nav.partners': 'Partners',
  'nav.contribute': 'Bijdragen',
  'nav.press': 'Pers',
  'nav.guidelines': 'Richtlijnen',
  'nav.conduct': 'Gedragscode',
  'nav.skipToContent': 'Naar hoofdinhoud',
  'nav.menu': 'Menu',

  'theme.toggle': 'Thema wisselen',
  'theme.toDark': 'Schakel naar donker thema',
  'theme.toLight': 'Schakel naar licht thema',

  'home.hero.title':
    'Twente bouwt opmerkelijke technologie. Laten we de mensen erachter beter vindbaar maken.',
  'home.hero.subtitle':
    'twente.dev/001 brengt makers uit software, hardware, data, design en product samen voor één nuttige avond.',
  'home.hero.ctaReserve': 'Reserveer een plek',
  'home.hero.ctaContribute': 'Draag een verhaal, demo of introductie bij',
  'home.outcome.idea': 'Eén nuttig idee',
  'home.outcome.intro': 'Eén nuttige kennismaking',
  'home.outcome.return': 'Eén reden om terug te komen',
  'home.next.kicker': 'Binnenkort',
  'home.what.title': 'Wat is twente.dev?',
  'home.what.body':
    'twente.dev is een onafhankelijke, practitioner-led techcommunity voor Twente. We maken lokale mensen, events en praktijkkennis beter vindbaar — en brengen een paar keer per jaar disciplines en organisaties doelgericht bij elkaar.',
  'home.community.title': 'Bestaande communities houden het podium',
  'home.community.body':
    'Bestaande meetups houden hun eigen identiteit, hun eigen lijst en hun eigen podium. twente.dev maakt ze beter vindbaar en verwijst altijd door naar de bron.',
  'home.newsletter.title': 'De wekelijkse field note',
  'home.newsletter.body':
    'Eén concrete les uit een lokaal systeem, de events van komende week en één open call. Reply-vriendelijk, opt-in, geen tracking.',
  'home.events.title': 'Aankomende events',
  'home.events.all': 'Alle events',
  'home.posts.title': 'Uit de community',
  'home.posts.all': 'Alle artikelen',

  'edition.venueTba': 'Locatie volgt',
  'edition.language': 'Voertaal vooral Engels; Nederlands welkom',
  'edition.registrationOpens': 'Aanmelden opent',
  'edition.details': 'Alles over twente.dev/001',
  'edition.free': 'Gratis',

  'newsletter.subscribe': 'Aanmelden',
  'newsletter.mailFallback': 'Mail ons om aan te haken',

  'events.title': 'Events',
  'events.description':
    'Meetups, conferenties en workshops voor techmakers in Twente. Abonneer je op de agenda en mis niets.',
  'events.upcoming': 'Aankomend',
  'events.past': 'Geweest',
  'events.empty': 'Nog geen events gepland.',
  'events.emptyCta': 'Ken je er een? Meld het aan',
  'events.subscribe': 'Abonneer op de agenda',
  'events.subscribeHint':
    'Eén abonnement, altijd actueel — nieuwe en gewijzigde events verschijnen vanzelf in je agenda.',
  'events.subscribeGoogle': 'Google Agenda',
  'events.subscribeWebcal': 'Apple Calendar / Outlook',
  'events.subscribeDirect': 'Los .ics-bestand',
  'events.free': 'Gratis',
  'events.cancelled': 'Geannuleerd',
  'events.organisedBy': 'Georganiseerd door',
  'events.moreInfo': 'Meer informatie',
  'events.listedBy': 'Vermeld door twente.dev',
  'events.inCollaboration': 'In samenwerking met twente.dev',

  'jobs.title': 'Vacatures',
  'jobs.description':
    'Developer-vacatures bij bedrijven in Twente. Geen recruiters, geen doorplaatsingen — alleen echte werkgevers uit de regio.',
  'jobs.empty': 'Op dit moment geen open vacatures.',
  'jobs.apply': 'Solliciteer',
  'jobs.postedOn': 'Geplaatst op',
  'jobs.closesOn': 'Sluit op',
  'jobs.remote': 'Remote',
  'jobs.hybrid': 'Hybride',
  'jobs.onsite': 'Op locatie',
  'jobs.dutchRequired': 'Nederlands vereist',
  'jobs.englishOk': 'Engels volstaat',
  'jobs.salary': 'Salaris',
  'jobs.salaryUndisclosed': 'Niet vermeld',
  'jobs.salaryPerMonth': 'per maand',
  'jobs.salaryPerYear': 'per jaar',
  'jobs.seniority.junior': 'junior',
  'jobs.seniority.medior': 'medior',
  'jobs.seniority.senior': 'senior',
  'jobs.seniority.lead': 'lead',
  'jobs.seniority.any': 'alle niveaus',
  'jobs.employment.full-time': 'voltijd',
  'jobs.employment.part-time': 'deeltijd',
  'jobs.employment.contract': 'contract',
  'jobs.employment.internship': 'stage',
  'jobs.employment.temporary': 'tijdelijk',
  'jobs.count.one': 'vacature',
  'jobs.count.other': 'vacatures',
  'jobs.submit': 'Plaats een vacature',
  'jobs.submitHint': 'Gratis voor werkgevers uit de regio — lees eerst de richtlijnen.',

  'companies.title': 'Bedrijven',
  'companies.description': 'Welke bedrijven in Twente bouwen software, en waarmee?',
  'companies.empty': 'Nog geen bedrijven in de directory.',
  'companies.hiring': 'Werft actief',
  'companies.stack': 'Techstack',
  'companies.size': 'Omvang',
  'companies.locations': 'Locaties',
  'companies.website': 'Website',
  'companies.openJob': 'Open vacature',
  'companies.openJobs': 'Open vacatures',
  'companies.submit': 'Voeg je bedrijf toe',
  'companies.submitHint': 'Bouwt je bedrijf software in Twente? Een vermelding is gratis.',

  'communities.title': 'Communities',
  'communities.description':
    'Discords, Slacks, user groups en andere plekken waar Twentse techmakers samenkomen.',
  'communities.empty': 'Nog geen communities toegevoegd.',
  'communities.submit': 'Voeg je community toe',
  'communities.join': 'Word lid',

  'blog.title': 'Blog',
  'blog.description': 'Field notes, portretten en open calls uit de Twentse techcommunity.',
  'blog.empty': 'Nog geen artikelen.',
  'blog.emptyCta': 'Draag een verhaal bij',
  'blog.readingTime': 'min leestijd',
  'blog.publishedOn': 'Gepubliceerd op',
  'blog.updatedOn': 'Bijgewerkt op',
  'blog.by': 'Door',
  'blog.onlyInOtherLocale': 'Dit artikel is alleen in het Engels beschikbaar.',

  'pillar.field-notes': 'Field note',
  'pillar.people-who-build': 'People Who Build',
  'pillar.open-calls': 'Open call',
  'pillar.week-in-twente-tech': 'Week in Twente Tech',

  'search.label': 'Zoeken',
  'search.placeholder': 'Zoek op de site…',
  'search.noResults': 'Geen resultaten gevonden.',
  'search.description':
    'Doorzoek alles op twente.dev: events, communities, artikelen en pagina’s in het Nederlands.',
  'search.otherLocale': 'Engelstalige inhoud? Zoek in het Engels',
  'search.unavailable':
    'Zoeken vereist JavaScript. Bekijk anders de events, communities of het blog.',

  'footer.tagline': 'Een onafhankelijke, practitioner-led techcommunity voor Twente.',
  'footer.contribute': 'Bijdragen',
  'footer.sourceCode': 'Broncode',
  'footer.rss': 'RSS',
  'footer.calendar': 'Agenda',
  'footer.privacy': 'Privacy',
  'footer.conduct': 'Gedragscode',
  'footer.press': 'Pers',
  'footer.builtBy': 'Onderhouden door',
  'footer.explore': 'Verder op de site',

  'error.404.title': 'Pagina niet gevonden',
  'error.404.body': 'Deze pagina bestaat niet (meer). Misschien is de link verouderd.',
  'error.404.home': 'Terug naar home',

  'common.viewAll': 'Bekijk alles',
  'common.fixture': 'Voorbeelddata',
} as const;

export type UIKey = keyof typeof nl;

export const en: Record<UIKey, string> = {
  'site.name': 'twente.dev',
  'site.tagline': 'We build it. We run it. We share it.',
  'site.description':
    'An independent, practitioner-led technology community for Twente. We make local people, events and practical knowledge easier to find — from Enschede to Almelo.',

  'nav.home': 'Home',
  'nav.events': 'Events',
  'nav.jobs': 'Jobs',
  'nav.companies': 'Companies',
  'nav.blog': 'Blog',
  'nav.communities': 'Communities',
  'nav.about': 'About',
  'nav.partners': 'Partners',
  'nav.contribute': 'Contribute',
  'nav.press': 'Press',
  'nav.guidelines': 'Guidelines',
  'nav.conduct': 'Code of conduct',
  'nav.skipToContent': 'Skip to main content',
  'nav.menu': 'Menu',

  'theme.toggle': 'Toggle theme',
  'theme.toDark': 'Switch to dark theme',
  'theme.toLight': 'Switch to light theme',

  'home.hero.title':
    "Twente builds remarkable technology. Let's make the people behind it easier to find.",
  'home.hero.subtitle':
    'twente.dev/001 brings software, hardware, data, design and product practitioners together for one useful evening.',
  'home.hero.ctaReserve': 'Reserve a place',
  'home.hero.ctaContribute': 'Contribute a story, demo or introduction',
  'home.outcome.idea': 'One useful idea',
  'home.outcome.intro': 'One useful introduction',
  'home.outcome.return': 'One reason to return',
  'home.next.kicker': 'Next up',
  'home.what.title': 'What is twente.dev?',
  'home.what.body':
    'twente.dev is an independent, practitioner-led technology community for Twente. We make local people, events and practical knowledge easier to find — and we bring different disciplines together a few times a year.',
  'home.community.title': 'Existing communities keep the stage',
  'home.community.body':
    'Existing meetups keep their own identity, their own list and their own stage. twente.dev makes them easier to find and always links to the source.',
  'home.newsletter.title': 'The weekly field note',
  'home.newsletter.body':
    "One concrete lesson from a local system, the coming week's events and one open call. Reply-friendly, opt-in, no tracking.",
  'home.events.title': 'Upcoming events',
  'home.events.all': 'All events',
  'home.posts.title': 'From the community',
  'home.posts.all': 'All articles',

  'edition.venueTba': 'Venue to be announced',
  'edition.language': 'Primarily English; Dutch welcome',
  'edition.registrationOpens': 'Registration opens',
  'edition.details': 'Everything about twente.dev/001',
  'edition.free': 'Free',

  'newsletter.subscribe': 'Subscribe',
  'newsletter.mailFallback': 'Email us to be added',

  'events.title': 'Events',
  'events.description':
    'Meetups, conferences and workshops for people who build technology in Twente. Subscribe to the calendar and never miss one.',
  'events.upcoming': 'Upcoming',
  'events.past': 'Past',
  'events.empty': 'No events scheduled yet.',
  'events.emptyCta': 'Know of one? List it',
  'events.subscribe': 'Subscribe to the calendar',
  'events.subscribeHint':
    'One subscription, always current — new and changed events appear in your calendar by themselves.',
  'events.subscribeGoogle': 'Google Calendar',
  'events.subscribeWebcal': 'Apple Calendar / Outlook',
  'events.subscribeDirect': 'Plain .ics file',
  'events.free': 'Free',
  'events.cancelled': 'Cancelled',
  'events.organisedBy': 'Organised by',
  'events.moreInfo': 'More information',
  'events.listedBy': 'Listed by twente.dev',
  'events.inCollaboration': 'In collaboration with twente.dev',

  'jobs.title': 'Jobs',
  'jobs.description':
    'Developer jobs at companies in Twente. No recruiters, no reposts — only real employers from the region.',
  'jobs.empty': 'No open positions right now.',
  'jobs.apply': 'Apply',
  'jobs.postedOn': 'Posted on',
  'jobs.closesOn': 'Closes on',
  'jobs.remote': 'Remote',
  'jobs.hybrid': 'Hybrid',
  'jobs.onsite': 'On site',
  'jobs.dutchRequired': 'Dutch required',
  'jobs.englishOk': 'English is fine',
  'jobs.salary': 'Salary',
  'jobs.salaryUndisclosed': 'Not disclosed',
  'jobs.salaryPerMonth': 'per month',
  'jobs.salaryPerYear': 'per year',
  'jobs.seniority.junior': 'junior',
  'jobs.seniority.medior': 'mid-level',
  'jobs.seniority.senior': 'senior',
  'jobs.seniority.lead': 'lead',
  'jobs.seniority.any': 'any level',
  'jobs.employment.full-time': 'full-time',
  'jobs.employment.part-time': 'part-time',
  'jobs.employment.contract': 'contract',
  'jobs.employment.internship': 'internship',
  'jobs.employment.temporary': 'temporary',
  'jobs.count.one': 'job',
  'jobs.count.other': 'jobs',
  'jobs.submit': 'Post a job',
  'jobs.submitHint': 'Free for employers from the region — read the guidelines first.',

  'companies.title': 'Companies',
  'companies.description': 'Which companies in Twente build software, and with what?',
  'companies.empty': 'No companies in the directory yet.',
  'companies.hiring': 'Actively hiring',
  'companies.stack': 'Tech stack',
  'companies.size': 'Size',
  'companies.locations': 'Locations',
  'companies.website': 'Website',
  'companies.openJob': 'Open job',
  'companies.openJobs': 'Open jobs',
  'companies.submit': 'Add your company',
  'companies.submitHint': 'Does your company build software in Twente? A listing is free.',

  'communities.title': 'Communities',
  'communities.description':
    'Discords, Slacks, user groups and other places where people who build technology in Twente gather.',
  'communities.empty': 'No communities added yet.',
  'communities.submit': 'Add your community',
  'communities.join': 'Join',

  'blog.title': 'Blog',
  'blog.description':
    'Field notes, builder profiles and open calls from the Twente tech community.',
  'blog.empty': 'No articles yet.',
  'blog.emptyCta': 'Contribute a story',
  'blog.readingTime': 'min read',
  'blog.publishedOn': 'Published on',
  'blog.updatedOn': 'Updated on',
  'blog.by': 'By',
  'blog.onlyInOtherLocale': 'This article is only available in Dutch.',

  'pillar.field-notes': 'Field note',
  'pillar.people-who-build': 'People Who Build',
  'pillar.open-calls': 'Open call',
  'pillar.week-in-twente-tech': 'Week in Twente Tech',

  'search.label': 'Search',
  'search.placeholder': 'Search the site…',
  'search.noResults': 'No results found.',
  'search.description':
    'Search everything on twente.dev: events, communities, articles and pages in English.',
  'search.otherLocale': 'Dutch content? Search in Dutch',
  'search.unavailable':
    'Search requires JavaScript. Browse the events, communities or the blog instead.',

  'footer.tagline': 'An independent, practitioner-led technology community for Twente.',
  'footer.contribute': 'Contribute',
  'footer.sourceCode': 'Source code',
  'footer.rss': 'RSS',
  'footer.calendar': 'Calendar',
  'footer.privacy': 'Privacy',
  'footer.conduct': 'Code of conduct',
  'footer.press': 'Press',
  'footer.builtBy': 'Maintained by',
  'footer.explore': 'Elsewhere on the site',

  'error.404.title': 'Page not found',
  'error.404.body': 'This page does not exist (any more). The link may be out of date.',
  'error.404.home': 'Back to home',

  'common.viewAll': 'View all',
  'common.fixture': 'Example data',
};

export const UI = { nl, en } as const;
