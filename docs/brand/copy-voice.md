# Schrijfwijzer — de stem van twente.dev

Wat we wel en niet schrijven, en waarom. Dit gaat over woorden; het beeldmerk, de kleuren en
de typografie staan in [`README.md`](README.md), de kanaalbio's in
[`social-profile-copy.md`](social-profile-copy.md), en hoe copy gegenereerd en bewaakt wordt in
[`../plan/content-pipeline.md`](../plan/content-pipeline.md).

Dit bestand is uitgezonderd van de banned-copy-scan in `src/lib/claims.test.ts`, om dezelfde
reden als een README dat is: het citeert wat het verbiedt. Elders in `docs/brand/` faalt de test
op deze frasen, en dat hoort zo.

Deze regels stonden tot 2026-09-16 in het geheugen van één machine. Daar waren ze onzichtbaar
voor iedereen behalve die ene sessie, en niemand kon ze nakijken of tegenspreken. Ze horen hier.

## 1. Wat we een spreker niet beloven

Geen redactiegesprek, geen technische repetitie, geen "we vormen het verhaal samen". Die
gesprekken vinden niet plaats, dus de site mag ze niet aanbieden. Er is ook geen voorgeschreven
talkformat: het sjabloon "één claim, één echt voorbeeld, één vraag aan de zaal" is op
2026-09-11 overal geschrapt, tot in de verplichte velden van de `Talk`-entiteit in
[`../domain/model.yaml`](../domain/model.yaml).

Wat wel gezegd mag worden, omdat het waar is: een halfuur inclusief vragen, een kleine
vriendelijke zaal, een zichtbaar tijdsignaal, de slides plus een geschreven verslag op een
permanente URL, en reiskosten die vooraf worden afgesproken. Dat laatste rijtje is precies wat
het [organisator-playbook](../organiser-playbook.md) een spreker toezegt; wijkt de copy daarvan
af, dan is een van de twee fout.

**Een belofte die vervalt, verdwijnt zwijgend.** Je vervangt hem niet door een zin die zegt dat
we het niet doen. Een eerste herschrijving zette "we nemen je verhaal vooraf niet met je door"
en een opsomming van non-beloftes terug op de plek van de oude tekst; dat leest net zo
ongemakkelijk als de belofte zelf en vestigt er juist aandacht op. De sectie houdt zijn vorm en
noemt alleen nog wat er wel is.

## 2. Frasen die niet mogen

Deze copy moet klinken als iemand uit de regio, niet als een taalmodel. De hele familie tics,
in elke taal:

- **Het contrastbinair**, in al zijn vormen: "het is niet X, het is Y", "niet omdat X maar
  omdat Y", "X, geen Y", "Geen X. Geen Y. Gewoon Z.", "Snel. Simpel."
- **De dubbelepunt-onthulling**: aanloop, dubbele punt, clou.
- **De drieslag** die compleet moet klinken: "sneller, goedkoper, slimmer".
- **Keelschrapers en spanningshaakjes**: "Here's the thing", "het eerlijke antwoord", "wat
  niemand je vertelt".
- **De aforistische slotzin en de zelfbeoordeling**: "En dat is belangrijk.", "Dat is het deel
  dat iedereen mist", "kortom".
- **Holle versterkers**: "genuinely", "actually", "echt", "gewoon" als vulling.
- **Meta-bewegwijzering**: "Dit is belangrijk omdat", "Vier kanttekeningen vooraf".
- **Em dashes.** Punten en komma's doen het werk.

Het slogannetje als openingsregel is dezelfde tic in korte vorm. "Eén avond, geen
verkooppraatje." boven de meetup-tekst werd afgekeurd met "Dit is niks. Even normaal maken aub.
Niet zo AI." Een opener zegt gewoon wat er gebeurt; wat het níét is hoort in een eigen blok
verderop, nooit in de kop.

**Eén geratificeerde uitzondering.** De goedgekeurde banners dragen em dashes in datavorm
(`/001 — 7 OKT`, `KOM D'R IN — EVERYONE'S WELCOME`). Die zijn visueel vastgesteld en gaan
alleen om als daar expliciet om gevraagd wordt.

Dit geldt ook voor de berichten die een agent áán de eigenaar schrijft, niet alleen voor de
copy op de site.

## 3. Hoe je een oproep kadert

Vier regels, elk uit een afgekeurde versie van de lanceringspost van september 2026.

**Positief, en volledig.** De zaak wordt niet gebouwd op wat er misging of op wat andere
meetups missen. Een versie die begon met groepen die corona niet overleefden werd afgekeurd:
"blijf bij het positieve, volledig". Dat sluit ook aan op het
[partnercompact](../partner-compact.md), dat verbiedt te doen alsof bestaande meetups gefaald
hebben.

**Niet openen met cijfers.** Een opener op spin-offstatistieken werd afgekeurd als
"number-heavy". Een herkenbare observatie doet meer dan een getal. Cijfers blijven staan waar
iemand ze nodig heeft om te komen of ja te zeggen: datum, tijd, capaciteit, spreekduur.

**Eén vraag per bericht.** Vier vragen achter elkaar leest als leuren; de term die viel was
"hijgerig". De rest van wat je wil, staat er als mededeling.

**Geen expliciete waardepropositie.** Een blok "wat heb jij eraan" leest transactioneel. Wat
iemand eraan heeft, staat er als feit over hoe het werkt, in één bijzin, of het staat er niet.

Feestelijk mag, gehaast niet. Het verschil zit in warmte en vooruitkijken, niet in urgentie.

## 4. Een field report is een interview

Een field report is een gesprek dat wordt gevoerd en opgetekend, niet een stuk dat iemand zelf
inlevert. De site vraagt er dus nooit om er zelf een te schrijven, en een agent schrijft er
geen, want dat zou verzonnen content zijn (zie de regel "Never invent content" in `CLAUDE.md`).

In copy dus altijd "gesprek", "interview", "optekenen". Nooit "schrijf een field report". De
definitie staat in [`../domain/glossary.md`](../domain/glossary.md).

## 5. Eén beschrijving, overal dezelfde

Elk feit dat buiten de repo staat, is een kopie die iemand met de hand geplakt heeft. Drift is
daarom de standaardtoestand, niet de uitzondering. Op 2026-09-05 stond op meetup.com nog
7 oktober, locatie TBA, 35 plekken, talks van twintig minuten en een dood `#updates`-anker,
terwijl de site al 4 november, Code14 Rijssen, 40 plekken en een halfuur zei.

Verschuift een releasefeit, doe dan in dezelfde beurt de hele ronde:

1. Grep op het oude feit in `docs/brand/`, [`../partner-compact.md`](../partner-compact.md),
   `docs/plan/`, `CONTRIBUTING.md` en de mailtemplates.
2. Draai `pnpm copy` en `pnpm copy:check`, want de meetup-teksten zijn gegenereerd.
3. Lever de lijst externe plakplekken op uit
   [`copy/plakplekken.yml`](copy/plakplekken.yml), en werk `laatst_gesynct` bij zodra ze
   opnieuw geplakt zijn.

De bron voor de meetup-listing is uitsluitend
[`copy/meetup-001.md`](copy/meetup-001.md); de "hoor het zodra het gebeurt"-link wijst naar
`#aanmelden`, want een `#updates`-anker bestaat niet.

## 6. De separator

Tussen frasen staat altijd een dubbele slash: `twente.dev // we build it. we run it. we share
it.` en `twente.dev/001 // reconnect the region // free`. Nooit een enkele `/`, want die botst
visueel met de editiepaden. URL-paden houden uiteraard hun enkele slash. Zie ook
[`../runbooks/release-banners.md`](../runbooks/release-banners.md).

In lopende LinkedIn-tekst doet `· · ·` het werk van een scheidingsregel, omdat de editor daar
witregels opeet. Dat staat uitgelegd in sectie 8.

## 7. Feiten die vaak fout gaan

| Het klopt zo                                                                                                  | Niet                              |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| **Webgrip** is de eigen eenmanszaak van de eigenaar en financiert twente.dev                                  | niet "mijn werkgever"             |
| **Code14** is de werkgever, en levert tijd, een klein marketingbudget en de zaal voor de eerste twee releases | niet "de eerste drie"             |
| Capaciteit is **40**                                                                                          | niet "30 tot 40"                  |
| Een talk duurt **ongeveer een halfuur**, inclusief vragen                                                     | niet twintig minuten, niet twaalf |
| De cadans is **de eerste woensdag van de maand**                                                              | 4 november 2026 is die woensdag   |

De volledige verantwoording van wie betaalt en wat dat wel en niet koopt, staat op de
overpagina (`src/pages/nl/over.astro`). Die pagina is de bron; wijkt copy ervan af, dan is de
copy fout.

## 8. Per kanaal

**LinkedIn.** De mechanica van bereik, opmaak en toegankelijkheid verandert per jaar en geldt
voor de hele estate, dus die staat in de skill `linkedin-post` in `webgrip/ai-skills` en niet
hier. Wat twente.dev-specifiek is: posten gebeurt onder de eigen naam van de eigenaar, met een
vermelding van de bedrijfspagina
([linkedin.com/company/twente-dev](https://www.linkedin.com/company/twente-dev/)); de
bedrijfspagina krijgt dezelfde inhoud als eigen post en nooit als repost; en de scheidingsregel
is `· · ·`, omdat de editor witregels opeet bij plakken.

**Meetup.** Gegenereerd, niet met de hand geschreven. Zie
[`../plan/content-pipeline.md`](../plan/content-pipeline.md).

**Mail.** Zie [`../runbooks/mail-drafts.md`](../runbooks/mail-drafts.md). Verzenden doet de
eigenaar zelf, altijd, op elk kanaal met een verzendknop.
