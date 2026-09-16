## [0.2.0-rc.6](https://forgejo.webgrip.dev/webgrip/twente.dev/compare/v0.2.0-rc.5...v0.2.0-rc.6) (2026-09-11)

### Added

* **ops:** de dmarc-intentie voor twente.dev staat op p=quarantine ([0411e71](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/0411e71c60866316db72d5fd0ee65aabc45de10c))

### Fixed

* **ci:** stop the licence gate depending on a network tool install ([3ca8ac4](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/3ca8ac405e3ef7da908f8af4434c29f5dced826a))
* **docs:** de docssite struikelde over twee links naar CLAUDE.md ([c8f2e00](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/c8f2e004bf506a4c2701776dac2d803f017c2ea7))

## [0.2.0-rc.5](https://forgejo.webgrip.dev/webgrip/twente.dev/compare/v0.2.0-rc.4...v0.2.0-rc.5) (2026-09-11)

### Added

* **copy:** de groepstekst als eigen oppervlak, en het programma uit de events-entry ([2373cb6](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/2373cb61f2a255d639427fc9748855c60d97ff41)), references [#updates](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/updates)
* **copy:** de hoofdletterkoppen komen er vet uit ([45a373b](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/45a373b4c6c8211ae3b05d536ceac7e03b168f13))
* **copy:** één feitenbron voor alle copy, met poorten en een driftregister ([c206529](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/c2065299b23587cbd02536ffc0cb4f0cdf0af31a))

### Fixed

* **copy:** de plak-HTML houdt zijn regelafbrekingen ([f85d27f](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/f85d27f8a7a5c9c03e538431380c337363e54905))
* **copy:** een tweede release brak de bouw, nu steigert hij zichzelf ([858765b](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/858765b5f65c6899fbf79b3b29c9403ec5d82645))
* **licence:** de licentiebundel leest de lockfile, niet de pnpm-store ([3c72006](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/3c720061a8c15232e8853f38989b397a27f3df6d))
* **ops:** de mailbox staat niet meer in de dmarc-rapportintentie ([b92fd0f](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/b92fd0f44bc50d32cfe6c92bb53b306d77c08b20))

### CI

* de containerbuild ziet docs/brand/copy weer ([b2071da](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/b2071da83596f0a5fb4e571fa065cd1709f12070))

### Internal

* **ci:** record the critical-path decision and tighten the docker context ([6304f1f](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/6304f1f62ff23e5991372097d6672f8145f356ab))
* **format:** prettier over gen-copy.ts ([fc1ddd8](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/fc1ddd8ad12c4323c37ae9addb260698379e3240))
* **licence:** move the code to Apache-2.0 and ship third-party licences ([b0ab95a](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/b0ab95a5b0cbe7f184e72728f6ea6a42aef7f04d))

## [0.2.0-rc.4](https://forgejo.webgrip.dev/webgrip/twente.dev/compare/v0.2.0-rc.3...v0.2.0-rc.4) (2026-09-06)

### Fixed

* **ci:** de DNS-lane draait alleen nog op main en development, zonder PR-trigger ([09ce74f](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/09ce74fa78c2939b51845db0a4193bd81433a547))
* **dns:** de zone declareert nu ook wat Cloudflare zelf toevoegt ([047a121](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/047a121a4f248ba2a71da735cc366aecb7dd3f55))

## [0.2.0-rc.3](https://forgejo.webgrip.dev/webgrip/twente.dev/compare/v0.2.0-rc.2...v0.2.0-rc.3) (2026-09-06)

### Fixed

* **dns:** de DNSControl-lane op de fix voor de preview-stap (workflows d6d1ac4) ([faec1b9](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/faec1b973995629f6d5874e33f54cbe825f9c50f))
* **lint:** eslint kent de DNSControl-globals, zodat ops/dns de hele lane niet meer breekt ([bcd648b](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/bcd648b7f3c1585ab0a9107983aeba532c67b348))

### Changed

* **mail:** de pipeline draait op de toolkit, het thema en de bronnen blijven hier ([4dab2b0](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/4dab2b087472f538420e467cde978932253be280))

## [0.2.0-rc.2](https://forgejo.webgrip.dev/webgrip/twente.dev/compare/v0.2.0-rc.1...v0.2.0-rc.2) (2026-09-05)

### Added

* **dns:** de zone twente.dev woont in deze repo, via de gedeelde DNSControl-lane ([bd833d9](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/bd833d97de10559afea2bdc51f107008bebcd4c7))

### Docs

* **adr:** 0018 v1.2.0, de zone-records wonen per site-repo, de accountobjecten blijven gedeeld ([7eb1722](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/7eb17220aec36fcb0fff50e318e46485ebf0926d))

## [0.2.0-rc.1](https://forgejo.webgrip.dev/webgrip/twente.dev/compare/v0.1.0...v0.2.0-rc.1) (2026-09-05)

### Added

* **mail:** NEWSLETTER_LIST_ID is lijst 3, de dubbele-opt-in-lijst in Brevo ([ecd84de](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/ecd84defbd7ece66c20ae5022ed36dfcd1b856f8))
* **newsletter:** de bevestigingspagina is een aankomst en geen bijsluiter ([f3daac1](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/f3daac1d648a8dd43893be6cb18c9f79b748db8e))

### Fixed

* **release:** de promotie-PR opent pas als er een rc gesneden is, niet bij elke push ([5d06804](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/5d06804eab11feac80635081eb013f0eeba11c91)), references [#3](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/3)
* **release:** de releasejob installeert niets, een tag-only release heeft geen build nodig ([3a0ce8c](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/3a0ce8c6ee5c5e49e4c37ff940802fa7719c28dc))
* **release:** het kanaal van een release wordt op de runner bepaald en via needs doorgegeven ([260ea6f](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/260ea6fafc9b47fa0914c440e701959c9595b676))

### Changed

* **claims:** de motor komt uit de toolkit, de regels blijven hier ([49671e0](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/49671e068eeb6251975edc0649a4a22f4982cc6c))

### Docs

* **adr:** 0018 v1.1.0, de recordlaag is DNSControl, OpenTofu houdt de accountobjecten ([364a835](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/364a835454ead396a79950f28409f3b49e2ab8dd))
* **agents:** joblogs zijn zonder token leesbaar, en de commentaarregel linkt naar zijn nieuwe thuis ([0069697](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/0069697b771f130b22c3f5214bcb8507a75f6012))
* **brand:** de meetup-tekst voor /001 en de social-copy volgen weer de site ([d47f874](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/d47f874366f9a97d80dffa75c7efe9018e76dec8)), references [#updates-anker](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/updates-anker)
* **brand:** de openingsregel van de meetup-tekst zegt gewoon wat er gebeurt ([8586086](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/8586086cc259bb00b2ffe9a86393c73ba3cc63c3))
* cadans, field report en weekdagen gelijkgetrokken buiten de merkdocs ([e1a93f6](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/e1a93f6d6e5d7523a352e18e20aae4eb3d7cb523))
* **release:** Meetup-groep en parkeren bevestigd, de groep staat bij onze kanalen ([b301e21](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/b301e213f0addc28d8762dc6f5f539f420575ccd))
* **release:** staging.twente.dev staat, het record is via DNSControl gepusht ([7fb0851](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/7fb0851dea276cbbe7bc07214c1475e3d0cb0003))
* **release:** stand van de uitrol, de Authentik-blokkade en de staging-probe ([37a2551](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/37a255198524a81bcb2e49a9e4f2e1d627e71520))

### Tests

* **claims:** de gegenereerde changelog valt buiten de woordenlijst ([d98a67f](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/d98a67ff336a8bca7e79cac066895a5548632fa3))
* **claims:** de gegenereerde changelog valt buiten de woordenlijst ([8a0f9db](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/8a0f9dbf1444aae5566cac2dd641f53a4cab419e))

### Internal

* **git:** CHANGELOG.md merget als union, ook aan de basiskant van een promotie ([ad8b3a5](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/ad8b3a5120666d58184f92275bada12d3f694c9d))
* **git:** CHANGELOG.md merget als union, zodat een promotie niet meer op het changelog strandt ([e450e7f](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/e450e7f73378f04cc7cb482d185818139da0d119))
* **git:** main terug in development, claims.test.ts opgelost naar de development-versie ([a2b6469](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/a2b6469557467a94a9ac24fb5877f987df26d459)), references [#3](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/3)
* **release:** v0.1.0-rc.1 [skip ci] ([27a8ead](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/27a8eadd7aa4dbb830a58f9cc51e10f630e0715f))
* **release:** v0.1.0-rc.2 [skip ci] ([32d393a](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/32d393a7ad4dd3bb712873dbcb2297200aa38aa4))
* **release:** v0.1.0-rc.3 [skip ci] ([d8d2e55](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/d8d2e551b3d82f900cb72615b22af7e326c7df4b))

## [0.1.0-rc.3](https://forgejo.webgrip.dev/webgrip/twente.dev/compare/v0.1.0-rc.2...v0.1.0-rc.3) (2026-09-05)

### Added

* **mail:** NEWSLETTER_LIST_ID is lijst 3, de dubbele-opt-in-lijst in Brevo ([ecd84de](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/ecd84defbd7ece66c20ae5022ed36dfcd1b856f8))

### Docs

* **agents:** joblogs zijn zonder token leesbaar, en de commentaarregel linkt naar zijn nieuwe thuis ([0069697](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/0069697b771f130b22c3f5214bcb8507a75f6012))
* **brand:** de meetup-tekst voor /001 en de social-copy volgen weer de site ([d47f874](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/d47f874366f9a97d80dffa75c7efe9018e76dec8)), references [#updates-anker](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/updates-anker)
* cadans, field report en weekdagen gelijkgetrokken buiten de merkdocs ([e1a93f6](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/e1a93f6d6e5d7523a352e18e20aae4eb3d7cb523))

## [0.1.0-rc.2](https://forgejo.webgrip.dev/webgrip/twente.dev/compare/v0.1.0-rc.1...v0.1.0-rc.2) (2026-09-05)

### Added

* **newsletter:** de bevestigingspagina is een aankomst en geen bijsluiter ([f3daac1](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/f3daac1d648a8dd43893be6cb18c9f79b748db8e))

### Fixed

* **release:** het kanaal van een release wordt op de runner bepaald en via needs doorgegeven ([260ea6f](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/260ea6fafc9b47fa0914c440e701959c9595b676))

### Changed

* **claims:** de motor komt uit de toolkit, de regels blijven hier ([49671e0](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/49671e068eeb6251975edc0649a4a22f4982cc6c))

### Docs

* **release:** Meetup-groep en parkeren bevestigd, de groep staat bij onze kanalen ([b301e21](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/b301e213f0addc28d8762dc6f5f539f420575ccd))

### Tests

* **claims:** de gegenereerde changelog valt buiten de woordenlijst ([8a0f9db](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/8a0f9dbf1444aae5566cac2dd641f53a4cab419e))

## [0.1.0-rc.1](https://forgejo.webgrip.dev/webgrip/twente.dev/compare/v0.0.0...v0.1.0-rc.1) (2026-09-05)
## [0.1.0](https://forgejo.webgrip.dev/webgrip/twente.dev/compare/v0.0.0...v0.1.0) (2026-09-05)

### Dependencies

* **deps:** automerge aan voor het onderhoud dat geen oordeel vraagt ([db04b5f](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/db04b5fd23ca12c0f15e757e8f7f98788f783110))

### Added

* **001:** sprekers als TBA, en een route om op de hoogte te blijven ([ee52888](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/ee52888f9e333545c672c43aae013c072353752c)), references [nl/001#updates](https://forgejo.webgrip.dev/nl/001/issues/updates)
* **a11y:** axe-core gate in CI, and name the search input ([4a898c2](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/4a898c26f8483f9eca4522abd33e9fa525bee47a))
* **a11y:** cover the press and Dutch partners pages in the axe gate ([d1b5fb0](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/d1b5fb0d0703ece027d193fe610cf4a9af6fd0ce))
* align site with the founding pack — flagship /001, trust pages, brand system ([1258340](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/125834085dfe750106263dda919ef2d5b83289eb))
* **bedrijven:** de gastheer van 001 staat op de pagina ([0a6bdda](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/0a6bddaa5409cfd39bf3c82804562e1bed705edb))
* **bedrijven:** het logo van Code14 staat op de gastheerkaart ([60c8705](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/60c8705943110f098e920522dc15f365858998fe))
* **brand:** adopt the Twente flag red — RGB 195 41 27 ([#c3291b](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/c3291b)) ([666f114](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/666f114f0d543036ce4efe888f10612fb2379ef9)), references [#e44734](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/e44734) [#e85c48](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/e85c48) [#a52114](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/a52114) [#ef7361](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/ef7361)
* **brand:** alle taaldragende banners in NL en EN, en foto-en-video op de avond ([1f14d55](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/1f14d5545539cc278f574cfaad686ee63f2d84bf))
* **brand:** editie-bannerpijplijn — omloopkaart, commitlog en statusbord ([5419c75](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/5419c75bee92699ccfd6c0d8f1009c5082e5a15d))
* **brand:** één editiebron voor alle templates, en de banners kloppen weer ([77ad718](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/77ad71889f7e192e4ecbbb9a655aa76987a8d983))
* **brand:** land the deployed brand kit, superseding the pack's pixel logo ([16c0144](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/16c0144b0888284047c744e8db8fb7ca15ba0678))
* **brand:** put the lockup in the header and fit the grid to the screen ([e37296e](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/e37296e80dac17bfdfabd4bb817a1a218677b064))
* **brand:** ratify the badge glyph as the official compact mark, flag red throughout ([3ba41d8](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/3ba41d80ae022b2ab93c5fa242bd8c10caf66dea)), references [#c3291b](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/c3291b)
* **brand:** replace the constructed-t mark with t.d (v2) ([5438dd7](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/5438dd77a2ac6478616099ca7d754767051ba003))
* **brand:** social profile kit — vector mark, avatars, channel banners ([2b52101](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/2b52101a0fc4981c54fb1b3667541fd3d7ec3e8b))
* **brand:** statusbord uitgelijnd op één as, en in NL en EN ([671b2cb](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/671b2cb07668d96104b2fdf51d92c3422b617004))
* **brand:** the motto is now "We build it. We run it. We share it." ([4a10e3f](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/4a10e3fa097d5c83904f29c3b7814c1e25632639))
* **brand:** vertrekbord-banner voor de LinkedIn-bedrijfspagina ([1dfac34](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/1dfac3438a273a370c59a65fe4057dd66bf5f273))
* **cadans:** twente.dev is elke eerste woensdag van de maand ([2b21ff6](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/2b21ff60519e292288188a03367613a615e8f0ba))
* **ci:** assert the partner compact's commitments survive an edit ([9b26614](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/9b266141fc57573a777cd1e93a7198a59deaae4a))
* **ci:** gates en deploy via de gedeelde static-site-workflows ([d869f94](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/d869f94d1a243e978cfc5c0605d93756b06dec98)), references [#58](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/58)
* **ci:** pin de gedeelde workflows op v2.1.0 ([f8fafcb](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/f8fafcb284a9be11093e3edc34b54312978144ef)), references [#58](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/58)
* **communities:** de vraag staat bovenaan in plaats van onderaan ([278eeb4](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/278eeb4245940d3e430882e5c6943b7795fdd728))
* **content:** copy-drift-harnas op bronniveau met de huisregels ([972ee68](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/972ee6816d4bd05fd6bfb7161807cdc0bbbb0b41))
* **content:** delete the launch fixtures and arm the real-content gate ([3a26686](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/3a266861291f08eb44dcbe3b92fda6e622c5f15d))
* cookieloze self-hosted Web-Vitals RUM (Grafana Faro) ([0f83531](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/0f83531b855262d524313b7572e018b8353b3b6b))
* **design:** events as the thread — month timeline, flagship card variant, square tags, page-header kickers ([068d20e](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/068d20e759dbc5d3b2305f93f6b923a442ba079e))
* **design:** shared-thread design system — display type, thread grid, mono register, styleguide ([3b1b559](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/3b1b559fef65a7c47bb7b236c128713a95879ea3)), references [#bf3322](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/bf3322) [#e44734](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/e44734)
* **docs:** onboard onto the Zensical TechDocs estate ([250f395](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/250f3959f7ec0f2c20cbe50a207f33b10822bc1c))
* **domein:** het editieverslag krijgt een naam, de open call verliest een label ([a6373e0](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/a6373e04f608d33770100a4af3066d9d84561eb7))
* **domein:** het model draagt de taal, en de dode woorden zijn overal weg ([0f74962](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/0f74962cfd74c64e976fed62794de1f81e0d001e))
* **domein:** het model dwingt zijn eigen opruiming af ([6f1afe9](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/6f1afe94ab3b67bd284215fe4f97775f383d2acc))
* **domein:** Kanaal, Wachtlijst en Slot, en de directory is weer van anderen ([cd92ca0](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/cd92ca021bad6a87d7d3438b1d4c7817dcee19fe))
* **domein:** Venue is een eigen term, flagship is er geen meer ([6846d83](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/6846d83187be8754527f96a3adfdcb8e9187eb73))
* **editie:** de feiten staan naast het verhaal in plaats van erdoorheen ([b5f8ad7](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/b5f8ad7b8ca88076afe29483566615b6dc47f673))
* **editie:** het event staat vooraan en de feitenkaart loopt mee ([6066526](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/60665268a1d5b3a3c3642225bade454c28a947e6))
* **event:** /001 heeft een ander programma, en de site zegt dat nu ook ([839526e](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/839526e6b5e57e4d8375f77dfa26fcca9a3c6c9f))
* **event:** /001 verzet naar woensdag 4 november 2026 ([f4a0063](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/f4a0063098b2c8afb0f21bdaa283b9a4250c21d7))
* **event:** aanmelden opent 14 september, en de DKIM-vraag is beantwoord ([2134678](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/213467874985ed585c1dd5fc11701d60dc7aa764))
* **events:** de draad loopt door naar een open einde ([8770cee](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/8770ceed993aa493f2a2ef95cbf3d310797cb674))
* **feeds:** verversingshints in de agendafeed ([38dd3ee](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/38dd3eec7440868b6d50feba0e35431e52a46a0a))
* **home:** de nieuwsbrief staat in de hero en zegt waar we staan ([5478f82](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/5478f82aaff5ff26d0c95a085f0ab54701783137))
* **layout:** de streep onder de titel eindigt waar de tekst eindigt ([6e07db0](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/6e07db0a9cc781fecde11c6f70d8235e4becbe98))
* **mail:** de Brevo-sleutel leeft in de kluis en komt via de brug in CI ([fcb6bce](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/fcb6bceea647cb3060e6ada8c745a586c7028695))
* **mail:** het lijst-id is config, alleen de sleutel is een secret ([b390947](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/b3909474e21e4eaca7e471efb5243dae59fbac0e))
* **mail:** mail:draft zet de campagne als concept in Brevo klaar ([77cc509](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/77cc5096b15ce3468456ef4ef2d43bf7e1cd885c))
* **mail:** MTA-STS-policy vanaf de Worker, in testmodus ([af1f0ad](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/af1f0ad155a6619d688a650f81f38cbcccb7a1e5))
* **mail:** pnpm mail maakt de mails uit de content, in beide talen ([ae9f199](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/ae9f199f08c79558eee12e200605930bc1eca38e))
* **mail:** validate:mail houdt elke mail tegen voor hij in Brevo staat ([6e74336](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/6e7433635fc9166b65083491604ce013883a1db9))
* **newsletter:** aanmelden zonder de pagina te verlaten ([d90f005](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/d90f005c56974d27fd243a56656ac1887c7bf78b))
* **newsletter:** de bevestigingsmelding klinkt nu als de streek ([be04587](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/be04587d0a18874968573b03ba7a87232cf0e4eb))
* **newsletter:** een landingspagina voor na de bevestigingsklik ([d27596b](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/d27596bec07f66f85a90328fdcf8262f89660f04))
* **ops:** CAA en DNSSEC bewaakt op twente.dev, en de lookup is nu betrouwbaar ([8876cbb](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/8876cbb30495cb2e30274f093a5d76ecbbb89b2e))
* **ops:** containerize for local dev and Cloudflare serving parity ([37513fa](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/37513fa84faf252d0f49147997cc148771d25c8b))
* **ops:** mail-authenticatie bewaakt zichzelf tegen een vastgelegde intentie ([e8d426e](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/e8d426eef14aaaa08488be94a8cda666d50cdbf6))
* **ops:** MTA-STS is compleet, en de bewaking dekt nu ook CAA en DNSSEC ([98f1053](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/98f10535d3b699326a5f3aa65af47dbf2dc523cb))
* **ops:** nginx-spiegel afgeleid in plaats van gekopieerd (gen-ops) ([84e67b1](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/84e67b1bc27b2db3b259654b9c081e049b051ccc))
* **parity:** pariteitsronde met webgrip.nl, 14 gaps dicht ([040fbc6](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/040fbc6effaf719d595ee05d5694f31b91ad570d))
* **partners:** publish the partner compact, replacing the placeholder ([c54c199](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/c54c1995811d20b8cc02c13ebcab70ebebf11a89))
* **raster:** het draadraster ligt onder elke pagina, en het merk krimpt niet meer ([ba05499](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/ba054996c901e01f7e2e0b542e6dc6c3aeb97a7c))
* **release:** deploys volgen releases, development snijdt rc's naar staging (ADR 0019) ([cd20c36](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/cd20c36269e414a25af0db8ae6a3333b8bbd29b6))
* **release:** kaartje, Meetup-link en een kortere pagina voor /001 ([06f69ef](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/06f69efb0f8f6bd3387c3818c7cabde02c575c70))
* **scope:** lean launch — drop the job board, placeholder directory pages ([ea4a550](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/ea4a55059b95460e4978f24a273e7407754ba127))
* search, self-hosted fonts, brand assets, analytics slot, real community directory ([656e267](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/656e2673b1628816976993129ce774c1a7bc2346))
* **seo:** llms.txt gegenereerd uit site.ts en de i18n-woordenboeken ([fcbb434](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/fcbb4341617ef5ecbfa390793169d0017be10951))
* **site:** ask people to take part instead of listing them ([1596dcc](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/1596dcc340fcb1eb50451ba8a7dbd44161ab1796))
* **trust:** partner compact, outreach privacy notice, and who pays for this ([87cc0ee](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/87cc0ee687aa90e38d6a6671ef97ed01eebab351))
* **trust:** publish the postal address outreach legally requires ([a5174ea](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/a5174ea3ec86b9b655c6a0d57f44214ebc37cddd))
* **ux:** jobs in the nav, employer routes, localized data, working empty states ([08cf8e8](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/08cf8e87eb36bee523f115f028828e0475aca39e))

### Fixed

* **a11y:** drop tabindex from main — fragment navigation covers the skip link ([d847a10](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/d847a106ce390a50b353ea8ab2b7482ec8c1367d)), references [#main](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/main)
* **bijdragen:** de punt plakt weer aan het mailadres vast ([4e2a811](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/4e2a8117afb9818c0539bad279b8f9173e9c64d0))
* **brand:** banner-reviewronde — composities, nachtcovers en //-separator ([09ee372](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/09ee37241e7626c8ee3ea994f189c341a3f76348))
* **brand:** meetup-cover leesbaar op kaartformaat, vrij van Meetups eigen knoppen ([8340cad](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/8340cadfdad3ec3c1037e76c3f1d4fb3a8e5e5b0))
* **brand:** optically centre the t.d mark ([9113ddf](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/9113ddfc81a77eb47d6881cc06bbc3b2425ce7c2))
* **brand:** stop advertising the wrong town, and widen the region wording ([c88b3b0](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/c88b3b0a4f3eb412021e0d6b36cff498520a9ceb))
* **brand:** vertrekbord vrij van het LinkedIn-paginalogo ([6f62b8c](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/6f62b8cee02501e32698238550ac72f12d77b902))
* **brand:** vertrekbord-onderregel — kom d'r in // de tagline ([012373e](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/012373e02b6dde9df070e7efc32213d74124aa7c))
* **brand:** vertrekbord-tagline op de baseline van het woordmerk ([6b70d03](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/6b70d036b18fd0f7edcc621cd44ac059f6179ea2))
* **brand:** vertrekbord-tagline optisch gecentreerd op de x-hoogte ([80b85c0](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/80b85c029512b7ed7d4be74592ed68e9976b3a68))
* **brand:** vertrekbord-ticker zonder binnenjargon ([1a1147e](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/1a1147e0f4003ec737f47844959ce7ecb459cd27))
* **ci:** actually check the community directory links ([48743c6](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/48743c6a8b07d15ef17b776f000f5ad1a7bca020))
* **ci:** browsercontext-globals voor de banner-pijplijn, lint is weer groen ([21bfa27](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/21bfa278b8a6a686d1855294f06d6e50c996b712))
* **ci:** docker-sibling-aware parity and lighthouse jobs ([efa10df](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/efa10dff069a99444e3a2a80cc0e935e2dabe897))
* **ci:** give the axe container a minimal package.json, not the repo's ([24cc141](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/24cc1412a2be5ced4844d231dcfecc6ecfe2ef99))
* **ci:** pijplijn weer groen — prettier over de bannerbestanden, eslint-globs verbreed ([879393b](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/879393b52bc63a3a0bdfbbe4e081a9e7245e302f))
* **ci:** security floors for nanoid and undici so the audit gate passes ([d61e273](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/d61e273c7f5bf630dcde8d3e918e01a37ac21ec8))
* **ci:** shorthand uses: refs so Forgejo can resolve runner labels ([f7dd5ae](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/f7dd5aec1adf0f73846a966f50388d6278d42021))
* **ci:** unblock deploy, parity, and lighthouse jobs ([d308748](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/d30874857844ca564c5f27daf758855df973db63))
* **ci:** wait for the edge before smoke-testing, and assert the serving contracts ([861d0ed](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/861d0ed4a97061033497de9452b52e784baf0d8d))
* **content:** point CoderDojo Enschede at a link that actually opens ([2970834](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/2970834e69bd2071da3b659141a1afb70f1c5176))
* **content:** repair two directory links, and correct the link-check claim ([60a928b](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/60a928b5d7903daa559123d7a3206acfcd1c0c79)), references [#10](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/10)
* **copy:** bedrijven zei onzin, en de zwakke zinnen zijn herschreven ([25dcba6](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/25dcba619749fb915bc556284c7419047156bd0d))
* **deploy:** bind the worker to twente.dev — it was deploying to nothing ([cd0f3f8](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/cd0f3f8c7c2e77589c7710e758d5f01a3c0d3b41))
* **deploy:** use a route, not a custom domain, so the stale record stops mattering ([defa1cc](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/defa1cc3043479e4cdf19d2ca1a106a1cbba9e28))
* **design:** contrast-safe token values, one button recipe, styleguide catches up ([e5fd737](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/e5fd737f6cdc367822ea18b1db849740146a3c45)), references [#6e7880](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/6e7880) [#5d666e](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/5d666e) [#e85c48](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/e85c48) [#ea6250](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/ea6250)
* **design:** dark mode shows the true flag red on every red surface ([1f169c8](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/1f169c83a4182ef07db099e414d88046f043d514)), references [#c3291b](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/c3291b) [#e85c48](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/e85c48) [#a52114](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/a52114) [#d63a28](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/d63a28)
* **docs:** bucket is docs-twente.dev, matching how the estate derives it ([99d38f6](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/99d38f6328a8fb246378d534d6430f6c34145adc))
* **docs:** de docs-build brak op een link naar een bestand dat er niet is ([c905b01](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/c905b0140d740e68616d17398746f0781005affd))
* **docs:** geen link naar een pagina die de docs-site niet publiceert ([19c49c5](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/19c49c5350dc650c1c38f02e50c57f15de282a69))
* **domein:** de site houdt zich weer aan R2 en R8 ([c2dab7a](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/c2dab7a1522584b5a4805f28512d266c1efed6ed))
* **domein:** de wacht loopt over de getrackte bestanden ([5bc7ae1](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/5bc7ae13037c4f3aa88de56942975badb78438b4))
* **domein:** een field report is een interview dat wij afnemen ([860b981](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/860b981ce226b7c5dd69104e847fae8d28405a3b))
* **domein:** R2 en R12 nagekomen, en R2 wordt nu bewaakt ([4a7d16f](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/4a7d16fdb3fa01f19f9d66b0311db8bb64044382))
* **editie:** een sprong uit de inhoudsopgave landt onder de balk ([a4e7572](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/a4e7572d1327a53b9be0fc31498ff8e755a7584c))
* **event:** /001 is in Rijssen, not Enschede ([2f941ac](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/2f941ac2a86d27413b4f8d1255037962b2844e78))
* **event:** capacity 100 -> 35, and stop three surfaces repeating it ([b7bf05b](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/b7bf05b85ade495d7c8af8e4710c821ed31f8009))
* **events:** point calendar links at the page that offers a subscription ([e76c7c1](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/e76c7c1d3a52ca90a1ac65e6f4b449a645d9bcda))
* **events:** set updatedAt so the venue change reaches ICS subscribers ([5af29ac](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/5af29acec28c2af1dd20fccad84d499b579a3e28))
* **fonts:** [@imports](https://forgejo.webgrip.dev/imports) vóór de [@font-face-blokken](https://forgejo.webgrip.dev/font-face-blokken) — Plex Mono was stilletjes weg ([fb1e960](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/fb1e960c0613fd822c28432e41a129b2cad4766a))
* **header:** zoeken is een icoon en het menu past op mobiel op één regel ([a385f77](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/a385f772861b752a71d7e1c510532456c2b56313))
* **home:** editieblok als ticket, niet als kaart-in-een-kaart ([66aa8fb](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/66aa8fbd7c95806dd4a15f36128ed196b47c4421))
* **layout:** elke pagina staat in hetzelfde 72rem-frame ([2c0fa7f](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/2c0fa7f024b7fff156b6666660fe2aafd837acf0))
* **mail:** de intent verklaart ook de rua van Cloudflare DMARC Management ([2c2313d](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/2c2313d9c1b254ac9a2137f7a2e512d345578484))
* **newsletter:** een afwijzing van de provider is geen reden om opnieuw te posten ([dd7f0d1](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/dd7f0d1f8ef159b925c1180c1a0db8e272079b27))
* **newsletter:** geen doodlopend eind meer als de achtergrond-POST faalt ([1066f9a](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/1066f9a4d8bab46544412989ee1288f8f8f38d73))
* **ops:** CODEOWNERS wees naar een gebruiker die niet bestaat ([d2a058c](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/d2a058ce5ad661f4f92572736f1fc4df2ba71237))
* **ops:** gen-ops-markers hersteld na de commentaarstrip ([8a7566a](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/8a7566a8829e41cd7bcab738e3fc2e326172a68a))
* **ops:** nginx.conf bijgewerkt na de header voor de MTA-STS-policy ([7648df7](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/7648df7fc0b287796ac2b606890e0b545756a39d))
* **ops:** pagefind cache split, real front-door redirects, brand caching, Lighthouse gate ([ff82bee](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/ff82bee20a1da8dcca46998c6769225e14fdcc44))
* **parity:** de probes proberen opnieuw bij een transport-fout ([c02a982](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/c02a982288b82a1b28b0ce864d544c421df5b143))
* **raster:** het draadraster hangt aan de contentkolom, niet aan de viewport ([ab2befe](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/ab2befe1845e30820a034018da481a360484c971))
* **raster:** het raster hoort bij de kopband, niet bij de hele pagina ([bb1dea6](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/bb1dea6445836c35fb0c2cd37ccead5faf017c92))
* **release:** de releasejob installeert niets, een tag-only release heeft geen build nodig ([3a0ce8c](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/3a0ce8c6ee5c5e49e4c37ff940802fa7719c28dc))
* **search:** unblock the Pagefind initialiser, and guard the whole class in CI ([e261bc4](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/e261bc455b8a9628bc8b3b82e03b5795b8f87a0b))
* **seo:** honest 404 head, uncontradicted sitemap, richer structured data, valid feeds ([2eb1625](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/2eb1625b479ee88d5c5ce7751a9cd2b9e37fec5f))
* **site:** bedrijvenpagina inkorten tot negen zinnen ([e1da699](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/e1da699d2c2f9b1d95902fd95ed953c14991d032))
* **site:** homepage-import hersteld, aanmeldformulier op Brevo aangesloten ([a48e790](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/a48e7901bdd7b47c02d1738046496077571f1e53))
* **ui:** losse eindjes in raster, tijdlijn en tabpanelen ([0fad6dd](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/0fad6ddd7d2d9274d3b7ac42fd9679dfd6afb395))

### Performance

* **fonts:** Inter handgeschreven op latin + latin-ext, vijf dode subsets weg ([c40a71d](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/c40a71df7c40b6b2e194ebd33cdc0e38b466e784))

### Changed

* alle commentaren uit de repo, intentie hoort in de code ([c0fbb26](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/c0fbb26634caa009c45210a9a0420f73429299e2))
* **newsletter:** de uitzondering draagt nu zijn eigen naam ([0398fcc](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/0398fccc885274bb3abec265442de81d0e963621))
* **ops:** cache-tiers genereren in plaats van vergelijken ([bc19f3e](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/bc19f3ee041f5d17bde0550e5f5bc8d27162ab8c))
* **ops:** de mail-auth-check komt uit de toolkit, het intent-bestand blijft hier ([3009a7e](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/3009a7e4a223c2afd76349f9f36a95115b2500cb))
* **release:** een Release is een content-entry, geen constante ([b44aef8](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/b44aef8600692efeeb0fecdcb0f1fc138a16dc7a))
* **taal:** editie zat nog in bestandsnamen, in een globale variabele en in de mails ([385ad9d](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/385ad9d3f8722de6afdec7a5a7e67bdd1f8c0979))
* **taal:** een avond heet een Release, het verslag heet release notes ([98c56ed](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/98c56ed020f09ee5ea3ba8fe514147e224cc3268))
* **taal:** flagship is overal weg, en de gastheerkaart heeft een logoplek ([b54abd8](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/b54abd82e3f90b76fa7db3573d9e78d2ac10cabd))
* **toolchain:** twente.dev consumeert de gedeelde pakketten die uit twente.dev kwamen ([dcf5613](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/dcf5613f9fc8a3b848e674d2e0b8715687310021))

### Reverts

* **brand:** restore six assets 9b26614 deleted by accident ([2ae1c88](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/2ae1c88f210954f035132fbcf14809eadacec02d))

### Docs

* **001:** land the 2026-08-30 reality check across every surface ([575fa45](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/575fa45fdca7ead71bfa4faa5f185d8fe2bc768d))
* **adr:** 0011 noemde een DKIM-selector die er nooit was ([657546c](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/657546c44e19fe6af7e668ad325ab6fb75a7a07d))
* **adr:** 0013 had de bewaartermijn mis, Counterscale lost dat zelf op ([d5db8e6](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/d5db8e688ca1d69ce5925a577cd039aeace766d2))
* **adr:** 0013 legt campagne-attributie via Counterscale vast ([ca422e2](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/ca422e26a771113cea524612f0e174a79a56a3b9))
* **adr:** 0014 legt de maandelijkse cadans en het vervallen woord vast ([78c7c7f](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/78c7c7fb907d4fc0ca972b9df1ae51124a1009e7))
* **adr:** 0015 legt het releasevocabulaire vast ([f890609](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/f890609371baa56b53a6b54bd8069e41ace6287a))
* **adr:** 0016 en 0017 leggen de release-vorm en de knip bij draft vast ([e5fd06a](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/e5fd06a861eb1403ae14eebf960e574ab2429c8a))
* **adr:** 0018 legt de knip tussen OpenTofu en wrangler vast ([6c4388c](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/6c4388c5dbf3331d102ec3c4e5a5663019ec1b6b))
* **adr:** ADR 0016 linkt naar de echte bestandsnamen van 0014 en 0015 ([a8f4756](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/a8f47565f845b9c0b33650d7bea38ed22e8824eb))
* **agents:** add CLAUDE.md as a symlink to AGENTS.md ([ef3cd98](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/ef3cd98d750466e476c8ddd3987a1c21656c6480))
* **agents:** board contract and the rules that are load-bearing ([d283e89](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/d283e8910876b1a65970d10e53f14ad6c3300cab))
* **agents:** de commentaarregel noemt nu ook de doc-comment-vormen ([224db18](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/224db18a6bf81df10a4e5d43c1c56b7e090a2747))
* **agents:** het bord draagt zijn status nu in kanban-buckets ([beffd1c](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/beffd1c0d4edddb2a2df5bcabb0c71165e83ec7a))
* **agents:** how to actually read Forgejo Actions logs ([b637bf2](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/b637bf2fe500352138e76192684286ef947c06a9))
* **agents:** record the MCP client-auth change in the board contract ([2065425](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/206542558598478dab28e7e314d8f75acc0a396b))
* **brand:** complete brand book, logo masters and print templates ([6af5f92](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/6af5f92b2afdb94631c991212d110b8fb7088c71))
* **brand:** emoji in de meetup-beschrijving ([0045580](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/0045580ccb5dcd9e44fb23b6a855d57e733b4a6c))
* **brand:** meetup-beschrijving voor /001, NL en EN ([d393e5b](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/d393e5b077731f85db805e26d20ed0228f2a303e))
* **brand:** paste-ready profile copy for every social channel ([512dc5e](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/512dc5e2ca312bf452d65d88c767d99e600fa58c))
* **brand:** rewrite social copy — it advertised a deleted job board ([03e295e](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/03e295e9a3e99f9ffb5a92709420232d4101620d))
* **brand:** RSVP-vraag voor /001, drie dingen in één veld ([3829ae6](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/3829ae69627060f93b52a7b9c0c8f683ba9f3a82))
* campaign link convention, and stop inviting contributions into a void ([0bcec31](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/0bcec31cfd6ed70957ac560095d8fe975127327c))
* **catalog:** de omschrijving stotterde na de flagship-veegronde ([09df5ab](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/09df5abdaf7035130ee384e9874aefa18249f1ff))
* DNS voor twente.dev staat in webgrip/cloudflare, het dashboard is alleen-lezen ([c503334](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/c503334e86b64217ab64cb3195ab565d361fdaf4))
* **domain:** field note en People Who Build uit elkaar getrokken ([4978dc2](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/4978dc2ef5f724773362cdff2070d539a80109f0))
* **domain:** Field Report is de enige naam, en het geld loopt anders dan er stond ([a2cbbdf](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/a2cbbdf39c5a541a308d349e7932accd75d31d49))
* **domain:** grill verwerkt, en lichte avonden bestaan niet ([0411c8d](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/0411c8dd12f84c1dee0e3bbaa58dd8ace1589596))
* **domain:** het domeinmodel vastgelegd, en "field report" wordt "talk" ([b771612](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/b771612ff29549d4a18228e6e9b931daa172fc08))
* **domain:** het model draagt state, geen geschiedenis ([480b3d1](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/480b3d12aa8505148737191b5fe808d22fc9df22))
* **domain:** volle pas over het model, en field note is nu overal field report ([3a6a86d](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/3a6a86df4481bc8d80b842498c88d3d21c444846))
* **estate:** vijf van zeven auditpunten — ledger, register, verwijzingen ([1f71099](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/1f710992e1d89d758eb4d191d9d2e36ff556e2d9))
* **kpi:** de KPI-set voor een editie, met per cijfer het besluit dat het verandert ([5057ece](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/5057ece06ebf6474eb2890c78598b84421a8f610))
* **mail:** de plandocumenten liepen achter op wat er staat ([62afc67](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/62afc67377d0a75d5c512eee8ad5a8bb96174000))
* **mail:** de sprekersbron is het release-blok, niet meer een constante ([c35022a](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/c35022a67381b04cf23b8193430d594e288523d1))
* **newsletter:** de bevestigingspagina zegt nu wat je krijgt ([61515f2](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/61515f2f2db3b61d12cca343fdf6bc4824b4bf7a))
* **privacy:** de campagnemeting staat er voordat hij draait ([d10eaad](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/d10eaad7f8b790ddb8e0e278bd0440486aae03d4))
* reconcile the decision record and the status page with what shipped ([1f05ac6](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/1f05ac6a58a9edda82d22611f41bd52a58e7e30f)), references [#7](https://forgejo.webgrip.dev/webgrip/twente.dev/issues/7)
* **release:** ADR 0019 en het plan voor de release-trein ([fb0e270](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/fb0e27029ef8ff93aa8b3b371df10159662b4c2c))
* **release:** stand van de uitrol, de Authentik-blokkade en de staging-probe ([37a2551](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/37a255198524a81bcb2e49a9e4f2e1d627e71520))
* **runbook:** de verhuizing is gedaan, en drie dingen stonden er verkeerd in ([b4132d2](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/b4132d25b3255562c12511a6f79329891cca6108))
* **runbook:** exact steps to make twente.dev able to send mail ([57cb15b](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/57cb15b525dff9428a2339eab1d5f6f041dde535))
* **runbook:** het was nooit de alias, het is de Cloudflare-hop ([c707eb5](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/c707eb5034e775374bbf362943cb5367961ff80b))
* **runbook:** mail-authenticatie herschreven naar de gemeten stand van 1 sep ([9230933](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/923093345aab897bff8378f81ef6be49b0f3671d))
* **runbook:** registrar geverifieerd, DNSSEC staat half aan, en het postvak is gekozen ([7015e6b](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/7015e6b8b18d72ab4bfbef84d5ec1b4b18730598))
* **runbook:** stap-voor-stapplan voor alias naar secondary domain ([9e3fbd7](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/9e3fbd7077a6c8ad445dd769d3ba64ec3f268181))

### Build

* replace make with mise and just ([b0c965b](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/b0c965bcd18593ba7caf89388c3a712b63b60cca))

### CI

* **a11y:** axe-gate op de workflows-fix die de toolkit in de sidecar installeert ([22204c2](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/22204c25135adf8de7f0faa490e16280a2ef753b))
* audit-poort tijdelijk uit — npm's advisories-API antwoordt niet ([d9cebd1](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/d9cebd1a214d7c78c9ac2a2a600c788c41d9bb6b))
* banner-pijplijn door prettier, editie.js erbuiten ([74b14b5](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/74b14b56c751ec43bd1a2b68774cc33a65d9d0cb))
* gegenereerde domeindocs buiten prettier houden ([5265a70](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/5265a702db62d284fac063401608843b898e10b5))
* main groen maken na de security.txt-race in run 93 ([87fc65a](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/87fc65a1c9080c80e9070a224e2e0b9d0d32477c))
* pijplijn opnieuw draaien na een npm-advisories time-out ([fe57a08](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/fe57a087e56639d86206a3b1415cf4a30c966a40))
* **pipeline:** de vier testlanes heten naar wat ze draaien ([e727fc0](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/e727fc0228d714de14d9702a0e270d21ae0c75b1))
* **pipeline:** pushes naar main wachten op elkaar in plaats van elkaar te annuleren ([8b56f51](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/8b56f515263d72ad34f7809f7985cd31446c412c))

### Style

* **copy:** de em dash uit de teksten ([be745c1](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/be745c1ec6a3d066a0f3b40a05c263357d8b3703))
* **copy:** de laatste em dashes zaten buiten het bereik van de wacht ([be5554e](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/be5554efd1328aa13e92918814b0e44d34862d44))
* **merk:** de em dash uit de merkdocs, en de wacht staat aan ([06d604a](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/06d604a9721bcc786808388da33e44df1022bc6f))
* **merk:** de em dash uit de titels van de merk-SVG's ([9c9f6bd](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/9c9f6bd7c318c5dbc9232b8d08d44223eb7f512d))

### Internal

* **content:** lege companies-map — de glob-loader-warning bij elke build weg ([594558a](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/594558aab7e68bbbbae13ce5da1d4f639d02d877))
* **renovate:** geen major-bumps van actions/checkout ([a31c363](https://forgejo.webgrip.dev/webgrip/twente.dev/commit/a31c363db6381ee3ca70d7d27e815d2dcf1d6ace))
