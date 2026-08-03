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
 */

export const nl = {
  'site.name': 'twente.dev',
  'site.tagline': 'De thuisbasis voor developers in Twente',
  'site.description':
    'Meetups, vacatures, bedrijven en verhalen uit de Twentse developer-community. Van Enschede tot Almelo.',

  'nav.home': 'Home',
  'nav.events': 'Events',
  'nav.jobs': 'Vacatures',
  'nav.companies': 'Bedrijven',
  'nav.blog': 'Blog',
  'nav.communities': 'Communities',
  'nav.about': 'Over ons',
  'nav.guidelines': 'Richtlijnen',
  'nav.skipToContent': 'Naar hoofdinhoud',
  'nav.menu': 'Menu',

  'locale.switch': 'Taal wijzigen',
  'locale.current': 'Huidige taal',

  'theme.toggle': 'Thema wisselen',
  'theme.light': 'Licht',
  'theme.dark': 'Donker',

  'home.hero.title': 'Developers in Twente',
  'home.hero.subtitle':
    'Eén plek voor alles wat er speelt in de Twentse tech-scene: meetups, vacatures, bedrijven en verhalen.',
  'home.hero.ctaEvents': 'Bekijk events',
  'home.hero.ctaJobs': 'Vind een baan',
  'home.events.title': 'Aankomende events',
  'home.events.all': 'Alle events',
  'home.jobs.title': 'Recente vacatures',
  'home.jobs.all': 'Alle vacatures',
  'home.companies.title': 'Bedrijven in de regio',
  'home.companies.all': 'Alle bedrijven',
  'home.posts.title': 'Uit de community',
  'home.posts.all': 'Alle artikelen',

  'events.title': 'Events',
  'events.description':
    'Meetups, conferenties en workshops voor developers in Twente. Abonneer je op de agenda en mis niets.',
  'events.upcoming': 'Aankomend',
  'events.past': 'Geweest',
  'events.empty': 'Nog geen events gepland. Ken je er een? Laat het ons weten.',
  'events.subscribe': 'Abonneer op de agenda',
  'events.subscribeHint': 'Voeg toe aan Google Agenda, Apple Calendar of Outlook',
  'events.free': 'Gratis',
  'events.cancelled': 'Geannuleerd',
  'events.organisedBy': 'Georganiseerd door',
  'events.moreInfo': 'Meer informatie',

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
  'jobs.submit': 'Plaats een vacature',

  'companies.title': 'Bedrijven',
  'companies.description':
    'Welke bedrijven in Twente bouwen software, en waarmee? Doorzoek de regio op techstack, locatie en omvang.',
  'companies.empty': 'Nog geen bedrijven in de directory.',
  'companies.hiring': 'Werft actief',
  'companies.stack': 'Techstack',
  'companies.size': 'Omvang',
  'companies.locations': 'Locaties',
  'companies.website': 'Website',
  'companies.openJobs': 'Open vacatures',
  'companies.submit': 'Voeg je bedrijf toe',

  'communities.title': 'Communities',
  'communities.description':
    'Discords, Slacks, user groups en andere plekken waar Twentse developers samenkomen.',
  'communities.empty': 'Nog geen communities toegevoegd.',
  'communities.join': 'Word lid',

  'blog.title': 'Blog',
  'blog.description': 'Artikelen en verhalen uit de Twentse developer-community.',
  'blog.empty': 'Nog geen artikelen.',
  'blog.readMore': 'Lees verder',
  'blog.readingTime': 'min leestijd',
  'blog.publishedOn': 'Gepubliceerd op',
  'blog.updatedOn': 'Bijgewerkt op',
  'blog.by': 'Door',
  'blog.onlyInOtherLocale': 'Dit artikel is alleen in het Engels beschikbaar.',

  'search.label': 'Zoeken',
  'search.placeholder': 'Zoek op de site…',
  'search.noResults': 'Geen resultaten gevonden.',

  'filter.all': 'Alles',
  'filter.clear': 'Filters wissen',
  'filter.results': 'resultaten',

  'footer.tagline': 'Gemaakt door en voor de developer-community in Twente.',
  'footer.contribute': 'Bijdragen',
  'footer.sourceCode': 'Broncode',
  'footer.rss': 'RSS',
  'footer.calendar': 'Agenda',
  'footer.privacy': 'Privacy',
  'footer.builtBy': 'Onderhouden door',

  'error.404.title': 'Pagina niet gevonden',
  'error.404.body': 'Deze pagina bestaat niet (meer). Misschien is de link verouderd.',
  'error.404.home': 'Terug naar home',

  'meta.updatedAt': 'Laatst bijgewerkt',
  'common.readMore': 'Lees verder',
  'common.viewAll': 'Bekijk alles',
  'common.optional': 'optioneel',
} as const;

export type UIKey = keyof typeof nl;

export const en: Record<UIKey, string> = {
  'site.name': 'twente.dev',
  'site.tagline': 'The home base for developers in Twente',
  'site.description':
    'Meetups, jobs, companies and stories from the developer community in Twente. From Enschede to Almelo.',

  'nav.home': 'Home',
  'nav.events': 'Events',
  'nav.jobs': 'Jobs',
  'nav.companies': 'Companies',
  'nav.blog': 'Blog',
  'nav.communities': 'Communities',
  'nav.about': 'About',
  'nav.guidelines': 'Guidelines',
  'nav.skipToContent': 'Skip to main content',
  'nav.menu': 'Menu',

  'locale.switch': 'Change language',
  'locale.current': 'Current language',

  'theme.toggle': 'Toggle theme',
  'theme.light': 'Light',
  'theme.dark': 'Dark',

  'home.hero.title': 'Developers in Twente',
  'home.hero.subtitle':
    'One place for everything happening in the Twente tech scene: meetups, jobs, companies and stories.',
  'home.hero.ctaEvents': 'Browse events',
  'home.hero.ctaJobs': 'Find a job',
  'home.events.title': 'Upcoming events',
  'home.events.all': 'All events',
  'home.jobs.title': 'Recent jobs',
  'home.jobs.all': 'All jobs',
  'home.companies.title': 'Companies in the region',
  'home.companies.all': 'All companies',
  'home.posts.title': 'From the community',
  'home.posts.all': 'All articles',

  'events.title': 'Events',
  'events.description':
    'Meetups, conferences and workshops for developers in Twente. Subscribe to the calendar and never miss one.',
  'events.upcoming': 'Upcoming',
  'events.past': 'Past',
  'events.empty': 'No events scheduled yet. Know of one? Let us know.',
  'events.subscribe': 'Subscribe to the calendar',
  'events.subscribeHint': 'Add to Google Calendar, Apple Calendar or Outlook',
  'events.free': 'Free',
  'events.cancelled': 'Cancelled',
  'events.organisedBy': 'Organised by',
  'events.moreInfo': 'More information',

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
  'jobs.submit': 'Post a job',

  'companies.title': 'Companies',
  'companies.description':
    'Which companies in Twente build software, and with what? Search the region by tech stack, location and size.',
  'companies.empty': 'No companies in the directory yet.',
  'companies.hiring': 'Actively hiring',
  'companies.stack': 'Tech stack',
  'companies.size': 'Size',
  'companies.locations': 'Locations',
  'companies.website': 'Website',
  'companies.openJobs': 'Open jobs',
  'companies.submit': 'Add your company',

  'communities.title': 'Communities',
  'communities.description':
    'Discords, Slacks, user groups and other places where developers in Twente gather.',
  'communities.empty': 'No communities added yet.',
  'communities.join': 'Join',

  'blog.title': 'Blog',
  'blog.description': 'Articles and stories from the developer community in Twente.',
  'blog.empty': 'No articles yet.',
  'blog.readMore': 'Read more',
  'blog.readingTime': 'min read',
  'blog.publishedOn': 'Published on',
  'blog.updatedOn': 'Updated on',
  'blog.by': 'By',
  'blog.onlyInOtherLocale': 'This article is only available in Dutch.',

  'search.label': 'Search',
  'search.placeholder': 'Search the site…',
  'search.noResults': 'No results found.',

  'filter.all': 'All',
  'filter.clear': 'Clear filters',
  'filter.results': 'results',

  'footer.tagline': 'Made by and for the developer community in Twente.',
  'footer.contribute': 'Contribute',
  'footer.sourceCode': 'Source code',
  'footer.rss': 'RSS',
  'footer.calendar': 'Calendar',
  'footer.privacy': 'Privacy',
  'footer.builtBy': 'Maintained by',

  'error.404.title': 'Page not found',
  'error.404.body': 'This page does not exist (any more). The link may be out of date.',
  'error.404.home': 'Back to home',

  'meta.updatedAt': 'Last updated',
  'common.readMore': 'Read more',
  'common.viewAll': 'View all',
  'common.optional': 'optional',
};

export const UI = { nl, en } as const;
