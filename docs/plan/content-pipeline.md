# Contentpijplijn — één feitenbron, gegenereerde copy, bewaakte drift

> Werkdocument. Doel: elke tekst die twente.dev naar buiten stuurt komt uit deze repo,
> feiten worden nergens overgetypt, en een verschoven feit levert een to-dolijst op in
> plaats van een stille afwijking.

## Wat er al staat

| Oppervlak               | Waar                                                                                                                   | Hoe                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Releasefeiten           | [`src/content/events/*.yml`](../../src/content/events/), [`src/config/site.ts`](../../src/config/site.ts)              | **de bron**                                                          |
| Sitecopy NL/EN          | [`src/content/posts/`](../../src/content/posts/), [`src/i18n/ui.ts`](../../src/i18n/ui.ts)                             | handgeschreven, in repo                                              |
| Meetup.com-beschrijving | [`docs/brand/copy/meetup-001.md`](../brand/copy/meetup-001.md)                                                         | handgeschreven, **feiten handmatig gesynct**                         |
| Profielteksten          | [`docs/brand/social-profile-copy.md`](../brand/social-profile-copy.md)                                                 | handgeschreven, met claimpoort en tekentellingen                     |
| Banners                 | [`templates/banners.html`](../brand/templates/banners.html) + [`export-banners.mjs`](../../scripts/export-banners.mjs) | gegenereerd                                                          |
| Slides, brief, e-mail   | [`docs/brand/templates/`](../brand/templates/) + [`release.js`](../brand/templates/release.js)                         | gegenereerd via [`sync-release.mjs`](../../scripts/sync-release.mjs) |
| Zaalkaart               | [`render-venue-map.mjs`](../../scripts/render-venue-map.mjs)                                                           | gegenereerd                                                          |
| E-mailverzending        | `pnpm mail:draft`                                                                                                      | **alleen concept, nooit versturen**                                  |

Twee patronen zijn dus al bewezen en dit plan voegt geen derde toe: `sync-release.mjs`
leest de feiten en schrijft een afgeleide, `gen-ops.ts --check` bewaakt met
`BEGIN/END`-markers of een afgeleide is verlopen.

## Wat ontbreekt

1. **Losse socialposts.** Er zijn profielteksten en banners, maar geen berichten per
   release en per moment. Die worden nu per keer opnieuw bedacht.
2. **Feitensync naar `meetup-001.md`.** De kop van dat bestand zegt zelf dat de feiten uit
   de yml komen en dat je ze bij een wijziging moet nalopen. Dat is precies de stap die
   op 2026-09-05 een oudere tekst met 7 oktober liet staan.
3. **Register van externe plakplekken.** Niemand weet welke tekst waar buiten de repo
   staat en hoe oud die is.
4. **Poorten.** Tekenlimieten, de claimtabel en AI-tells worden met het oog gecontroleerd.

## Architectuur

```
src/content/events/*.yml  +  src/config/site.ts        ← feiten, met de hand
        │
        │ readRelease()                                 ← bestaat al
        ▼
scripts/gen-copy.ts  ──────────────────────────────►  BEGIN/END-blokken in
        │                                              docs/brand/copy/*.md
        │ --check                                      (feitregels, praktisch,
        ▼                                               links, tekentellingen)
   CI faalt bij drift

docs/brand/copy/plakplekken.yml  ──►  pnpm copy:drift  ──►  "deze 6 plekken zijn verlopen"
```

Drie regels die de vorm bepalen:

- **Feiten worden gegenereerd, proza wordt geschreven.** Alles tussen de markers is
  machinewerk. De verhalende alinea's blijven van jou, want daar zit de stem.
- **Niets plaatst zichzelf.** Dezelfde regel als bij mail: de pijplijn levert plakklare
  blokken en een afvinklijst, jij drukt op knoppen. Dat houdt de toon en de timing bij een
  mens en voorkomt dat een fout zich vermenigvuldigt.
- **De humanize-skill is een poort, geen schrijver.** Zes seeds blind gemeten: als
  herschrijver is hij gelijkwaardig aan een gewone agent en hij vult een geschrapte
  vaagheid soms op met een verzonnen concreetheid. In `detect` is hij deterministisch en
  gratis. Dus scannen, niet laten schrijven.

## Wat er nu staat

Alle vier de fases zijn gebouwd. De commando's:

| Commando                     | Doet                                                               |
| ---------------------------- | ------------------------------------------------------------------ |
| `pnpm copy`                  | rendert de feiten in `meetup-001.md` en genereert `posts-001.md`   |
| `pnpm copy:check`            | faalt als een afgeleide verlopen is; zit in `pnpm build`           |
| `pnpm validate:copy`         | tekenlimiet, claimpoort, datumpoort, AI-tells; zit in `pnpm build` |
| `pnpm validate:copy --links` | idem plus een HEAD op elke URL, staat standaard uit                |
| `pnpm copy:drift`            | welke externe plakplek opnieuw geplakt moet                        |

De bestanden:

- [`copy.config.yml`](../brand/copy/copy.config.yml) is het manifest: kanalen met hun
  tekenlimiet, de praktisch-regels per taal, zeven momenten, de verboden claims en de
  toegestane tells met reden.
- [`meetup-001.nl.tmpl`](../brand/copy/meetup-001.nl.tmpl) en `.en.tmpl` dragen het proza
  met plaatshouders. De feiten staan er niet in.
- [`meetup-001.md`](../brand/copy/meetup-001.md) houdt zijn handgeschreven kop en krijgt
  de plakblokken tussen `BEGIN/END generated`-markers.
- [`posts-001.md`](../brand/copy/posts-001.md) is volledig gegenereerd: 34 blokken over
  zeven momenten, elk met een regel tussen blokhaken die jij vervangt.
- [`plakplekken.yml`](../brand/copy/plakplekken.yml) is het register.

De poorten zijn stuk voor stuk getest door ze expres te laten falen: een te lang
bluesky-blok, het woord "vacaturebank", een datum "7 October", een 404-link. Alle vier
vielen om, en de AI-tellpoort vlagde de meetup-tekst tot de uitzonderingen erin stonden.

## Beslissingen die tijdens het bouwen vielen

- **De routeregel in de meetup-tekst is veranderd.** Twee losse regels (`🚗 Gratis
parkeren`, `🚶 Ongeveer 10 minuten lopen`) zijn één `🚶`-regel geworden met de
  `directions`-prozatekst uit de yml. Anders staan die feiten twee keer opgeschreven en
  loopt de listing weg bij een andere zaal. Wil je de korte vorm terug, dan zet je ze als
  constanten in `praktisch:` en verliest de listing de koppeling met de zaal.
- **Drie tells zijn toegestaan op het meetup-kanaal**, met reden in het manifest: emoji
  zijn daar de conventie, "We build it. We run it. We share it." is een geratificeerd
  merkasset, en de sectie "wat dit niet is" is een standpunt.
- **`abrupt-cutoff` is overal toegestaan.** Hij vuurt vals op hard afgebroken regels.
- **De AI-tellpoort slaat zichzelf over als `scan.py` ontbreekt**, want de humanize-skill
  staat niet in deze repo. Lokaal draait hij, in CI meldt hij dat hij overgeslagen is.
  Zet `HUMANIZE_SCAN` om er een ander pad aan te wijzen.
- **De linkcontrole staat standaard uit**, zodat de bouw offline blijft werken.

## Wat er nog open staat

- De event-URL van meetup.com ontbreekt in `plakplekken.yml`; vul hem in zodra het event
  er staat.
- Vier profielen hebben nog geen account, dus `copy-drift` telt ze apart.
- `social-profile-copy.md` staat nog niet als bron in het manifest. De claimtabel daarin
  is met de hand overgezet naar `verboden_claims`; die twee kunnen uit elkaar lopen tot de
  tabel zelf data wordt.

## Een nieuwe release

Er is niets te doen. Zet de events-entry in `src/content/events/` en draai `pnpm copy`.

- Het proza staat in `meetup.nl.tmpl` en `meetup.en.tmpl` en is release-onafhankelijk. Wil
  je voor één release andere tekst, zet dan `meetup-<nr>.<taal>.tmpl` ernaast; die wint.
- Ontbreekt `meetup-<nr>.md`, dan schrijft de generator een steiger met de markers erin.
  De kop erboven is van jou: schrijf daar wat je bewust weglaat en waarom de volgorde is
  zoals hij is.
- `posts-<nr>.md` wordt volledig gegenereerd.
- De generator loopt over **alle** releases, niet alleen `CURRENT_RELEASE`, en de
  validator meet elk bestand tegen de release in zijn eigen bestandsnaam. Een oude
  meetup-tekst blijft dus geldig met zijn eigen datum in plaats van te vallen op de datum
  van de nieuwe release.

Dat laatste was een echte val. Voordat dit erin zat, brak `pnpm build` op het moment dat
`CURRENT_RELEASE` naar 002 ging: `pnpm copy` liep stuk op een ontbrekende `meetup-002.md`,
en de datumpoort verwierp elke datum in de 001-bestanden. Beide zijn nagespeeld met een
echte 002-entry en daarna gerepareerd.

## Wat bewust niet geautomatiseerd is

- **De verhalende alinea's.** Gemeten, niet gevoeld: generatie levert daar geen betere
  tekst en wel het risico op een verzonnen belofte waar een bezoeker je aan houdt. Elk
  gegenereerd blok begint daarom met een lege regel tussen blokhaken.
- **Het plaatsen zelf.** Geen API-koppelingen naar LinkedIn of Meetup. De winst zit in
  voorbereiding en controle, niet in de laatste klik.
- **De beschrijvingen van andere organisaties** in `communities.yml`. Die horen via de
  contributiepijplijn te lopen, per [CLAUDE.md](../../CLAUDE.md).
