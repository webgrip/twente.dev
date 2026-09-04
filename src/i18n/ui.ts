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
    'Onafhankelijke, practitioner-led techcommunity voor Twente. We maken lokale mensen, events en praktijkkennis beter vindbaar — in heel Twente.',

  'nav.home': 'Home',
  'nav.events': 'Events',
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

  'home.hero.title': 'Kom een avond je eigen vakgebied uit.',
  'home.hero.subtitle':
    'Eén avond in Rijssen met mensen die technologie bouwen in Twente — met welke techniek dan ook. Twee korte verhalen uit de praktijk, en verder vooral elkaar.',
  'home.hero.ctaReserve': 'Reserveer een plek',
  'home.hero.ctaContribute': 'Meld een verhaal aan',
  // The three things twente.dev actually runs. They replaced a promised-outcome
  // trio ("één nuttig idee, één nuttige kennismaking, één reden om terug te
  // komen") — outcomes we cannot deliver on anyone's behalf, and which said
  // nothing about what the site is. These describe the product instead, and
  // each one is a claim the site can be checked against.
  'home.does.calendar.title': 'De gedeelde agenda',
  'home.does.calendar.body':
    'Tech-events uit de regio in één agenda waarop je je kunt abonneren — die van anderen net zo goed, altijd met een link naar de bron.',
  'home.does.evening.title': 'De avond zonder vakgebied',
  'home.does.evening.body':
    'Een paar keer per jaar één avond die niet om één taal, framework of branche draait. Dat is precies wat er nog niet was.',
  'home.does.archive.title': 'Het archief',
  'home.does.archive.body':
    'Field notes uit de praktijk, geschreven door mensen die hier werken. Wat verteld is blijft staan en blijft vindbaar.',
  'home.next.kicker': 'Binnenkort',
  'home.next.cta': 'Alles over de avond',
  'home.what.title': 'Wat is twente.dev?',
  'home.what.body':
    'twente.dev is een onafhankelijke, practitioner-led techcommunity voor Twente. We maken lokale mensen, events en praktijkkennis beter vindbaar — en brengen een paar keer per jaar disciplines en organisaties doelgericht bij elkaar.',
  'home.community.title': 'Bestaande communities houden het podium',
  'home.community.body':
    'Bestaande meetups houden hun eigen identiteit, hun eigen lijst en hun eigen podium. twente.dev maakt ze beter vindbaar en verwijst altijd door naar de bron.',
  'home.newsletter.title': 'De field note',
  'home.newsletter.body':
    'Eén concrete les uit een lokaal systeem — geschreven door iemand die hier werkt, niet door ons. Plus wat eraan komt en één open call. Je hoort van ons als er iets te melden is, niet omdat het dinsdag is. Reply-vriendelijk, opt-in, geen tracking.',
  'home.newsletter.write': 'Schrijf er zelf een',
  'home.agenda.empty': 'Verder staat er nog niets in de gedeelde agenda.',
  'home.posts.all': 'Alle artikelen',

  'edition.venueTba': 'Locatie volgt',
  'edition.language': 'Nederlands; Engels zodra er internationale deelnemers zijn',
  'edition.registrationOpens': 'Aanmelden opent',
  'edition.details': 'Alles over twente.dev/001',
  'edition.free': 'Gratis',

  'newsletter.subscribe': 'Aanmelden',
  'newsletter.mailFallback': 'Mail ons om aan te haken',
  'newsletter.emailLabel': 'E-mailadres',
  'newsletter.pendingNote':
    'Het aanmeldformulier staat er nog niet — we versturen liever niets dan iets dat in je spamfilter belandt.',
  'newsletter.consentNote':
    'Je krijgt eerst een bevestigingsmail; pas als je daarop klikt sta je op de lijst. Afmelden kan onderaan elke mail. We delen je adres met niemand en meten niet of je de mail opent.',
  'newsletter.sending': 'Versturen…',
  'newsletter.success':
    'Gelukt. Er staat nu een mail voor je klaar met een bevestigingsknop erin. Pas na die klik sta je op de lijst. Niets gezien? Kijk even in je spam.',
  // Loopt bewust door in het adres: NewsletterForm plakt CONTACT_EMAIL eraan
  // vast, zodat dat adres op één plek in de repo staat.
  'newsletter.error': 'Er ging iets mis bij het versturen. Probeer het zo nog eens, of mail',
  'newsletter.privacyLink': 'Wat we bewaren',

  'events.title': 'Events',
  'events.description':
    'Meetups, conferenties en workshops voor techmakers in Twente. Abonneer je op de agenda en mis niets.',
  'events.upcoming': 'Aankomend',
  'events.past': 'Geweest',
  'events.empty': 'Nog geen events gepland.',
  'events.emptyCta': 'Ken je er een? Meld het aan',
  'events.subscribe': 'Abonneer op de agenda',
  // Only the first two links produce a *subscription* that keeps refreshing.
  // The plain file is a one-off copy: a later venue change or cancellation
  // never reaches it. So the promise is attached to subscribing, and the file
  // says on the tin that it is a snapshot — an unqualified "always current"
  // above all three would be a promise we cannot keep for the third.
  'events.subscribeHint':
    'Abonneer je één keer — daarna verschijnen nieuwe events en wijzigingen vanzelf in je agenda.',
  'events.subscribeGoogle': 'Google Agenda',
  'events.subscribeWebcal': 'Apple Calendar // Outlook',
  'events.subscribeDirect': 'Los .ics-bestand (eenmalige import)',
  'events.free': 'Gratis',
  'events.cancelled': 'Geannuleerd',
  'events.organisedBy': 'Georganiseerd door',
  'events.moreInfo': 'Meer informatie',
  'events.listedBy': 'Vermeld door twente.dev',
  'events.inCollaboration': 'In samenwerking met twente.dev',

  // Communities directory. Entries render only with recorded consent
  // (content.config.ts) — the partner compact promises we ask first, so the
  // page has to be able to be honest about a short list.
  'communities.description':
    'Discords, Slacks, user groups en meetups waar Twentse techmakers samenkomen. Elke community houdt het eigen podium — wij maken ze alleen beter vindbaar en verwijzen altijd naar de bron.',
  'communities.searchLabel': 'Zoeken',
  'communities.searchPlaceholder': 'Naam, onderwerp of platform…',
  'communities.filterTopic': 'Onderwerp',
  'communities.filterAll': 'Alles',
  'communities.results': 'vermeld',
  'communities.noResults': 'Geen community die hierop past.',
  'communities.empty': 'Nog niets te tonen — en dat is een keuze.',
  'communities.emptyBody':
    'We kennen de groepen in de regio wel, maar we vermelden niemand zonder het te vragen. Zodra een community ja zegt, staat die hier.',
  'communities.consentNote': 'Vermeld met toestemming. Eén bericht en we halen je er weer af.',
  'communities.suggest': 'Run je een community in Twente?',
  'communities.awaiting': 'groepen in de regio staan onderzocht klaar en wachten op hun ja.',
  'communities.terms': "Onze afspraken met community's",

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
    'An independent, practitioner-led technology community for Twente. We make local people, events and practical knowledge easier to find — across Twente.',

  'nav.home': 'Home',
  'nav.events': 'Events',
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

  'home.hero.title': 'Spend one evening outside your own field.',
  'home.hero.subtitle':
    'One evening in Rijssen with people who build technology in Twente — whatever they build it with. Two short field reports, and mostly each other.',
  'home.hero.ctaReserve': 'Reserve a place',
  'home.hero.ctaContribute': 'Propose a story',
  'home.does.calendar.title': 'The shared calendar',
  'home.does.calendar.body':
    "Tech events from across the region in one calendar you can subscribe to — other people's just as much as ours, always linking back to the source.",
  'home.does.evening.title': 'The evening with no field',
  'home.does.evening.body':
    'A few times a year, one evening that does not revolve around a single language, framework or industry. That is the part that did not exist yet.',
  'home.does.archive.title': 'The archive',
  'home.does.archive.body':
    'Field notes from practice, written by people who work here. What gets told stays up, and stays findable.',
  'home.next.kicker': 'Next up',
  'home.next.cta': 'All about the evening',
  'home.what.title': 'What is twente.dev?',
  'home.what.body':
    'twente.dev is an independent, practitioner-led technology community for Twente. We make local people, events and practical knowledge easier to find — and we bring different disciplines together a few times a year.',
  'home.community.title': 'Existing communities keep the stage',
  'home.community.body':
    'Existing meetups keep their own identity, their own list and their own stage. twente.dev makes them easier to find and always links to the source.',
  'home.newsletter.title': 'The field note',
  'home.newsletter.body':
    'One concrete lesson from a local system — written by someone who works here, not by us. Plus what is coming up and one open call. You hear from us when there is something worth saying, not because it is Tuesday. Reply-friendly, opt-in, no tracking.',
  'home.newsletter.write': 'Write one yourself',
  'home.agenda.empty': 'Nothing else is in the shared calendar yet.',
  'home.posts.all': 'All articles',

  'edition.venueTba': 'Venue to be announced',
  'edition.language': 'Dutch by default; English whenever internationals join',
  'edition.registrationOpens': 'Registration opens',
  'edition.details': 'Everything about twente.dev/001',
  'edition.free': 'Free',

  'newsletter.subscribe': 'Subscribe',
  'newsletter.mailFallback': 'Email us to be added',
  'newsletter.emailLabel': 'Email address',
  'newsletter.pendingNote':
    'The signup form is not up yet — we would rather send nothing than something that lands in your spam folder.',
  'newsletter.consentNote':
    'You get a confirmation email first; you are on the list only once you click it. Every email carries an unsubscribe link. We share your address with no one and do not measure whether you open anything.',
  'newsletter.sending': 'Sending…',
  'newsletter.success':
    'Done. There is an email waiting for you with a confirmation button in it. You are on the list only after that click. Nothing there? Have a look in your spam folder.',
  'newsletter.error': 'Something went wrong while sending. Try again in a moment, or email',
  'newsletter.privacyLink': 'What we keep',

  'events.title': 'Events',
  'events.description':
    'Meetups, conferences and workshops for people who build technology in Twente. Subscribe to the calendar and never miss one.',
  'events.upcoming': 'Upcoming',
  'events.past': 'Past',
  'events.empty': 'No events scheduled yet.',
  'events.emptyCta': 'Know of one? List it',
  'events.subscribe': 'Subscribe to the calendar',
  'events.subscribeHint':
    'Subscribe once — new events and changes then appear in your calendar by themselves.',
  'events.subscribeGoogle': 'Google Calendar',
  'events.subscribeWebcal': 'Apple Calendar // Outlook',
  'events.subscribeDirect': 'Plain .ics file (one-off import)',
  'events.free': 'Free',
  'events.cancelled': 'Cancelled',
  'events.organisedBy': 'Organised by',
  'events.moreInfo': 'More information',
  'events.listedBy': 'Listed by twente.dev',
  'events.inCollaboration': 'In collaboration with twente.dev',

  'communities.description':
    'Discords, Slacks, user groups and meetups where people who build technology in Twente gather. Every community keeps its own stage — we only make them easier to find, and always link to the source.',
  'communities.searchLabel': 'Search',
  'communities.searchPlaceholder': 'Name, topic or platform…',
  'communities.filterTopic': 'Topic',
  'communities.filterAll': 'All',
  'communities.results': 'listed',
  'communities.noResults': 'No community matches that.',
  'communities.empty': 'Nothing to show yet — and that is a choice.',
  'communities.emptyBody':
    'We know the groups in the region, but we do not list anyone without asking. The moment a community says yes, it appears here.',
  'communities.consentNote': 'Listed with consent. One message and we take you off again.',
  'communities.suggest': 'Do you run a community in Twente?',
  'communities.awaiting': 'groups in the region are researched and waiting on their yes.',
  'communities.terms': 'Our terms with communities',

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
