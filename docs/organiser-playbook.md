# Organisator-playbook

Hoe je een twente.dev-editie draait, van venue tot verslag — geschreven voor een
organisatie van precies één persoon. Dit is het draaiboek, niet de strategie: waarom
twente.dev bestaat staat in de [ADRs](adrs/README.md) en het positioneringsdeck; hoe je
een woensdagavond overeind krijgt staat hier.

> **Werkregel voor alles hieronder**: niets wordt op de site beloofd voordat het in dit
> draaiboek een werkend antwoord heeft. De duurste les van de aanloop naar /001 was
> gepubliceerde beloftes (pretix, twee vertrouwenspersonen, een stichting) die de operatie
> vooruitliepen — die zijn op 2026-08-30 allemaal teruggebracht naar wat één persoon echt
> kan waarmaken.

## Het ritme

**Iedere eerste woensdag van de maand.** Dat is de hele cadans-belofte: geen jaarkalender
die kan breken, wel een datum die iedereen kan uitrekenen. /001 valt erop (woensdag 4
november 2026); /002 is woensdag 2 december 2026, /003 woensdag 6 januari 2027.

/001 stond tot 2026-09-04 op woensdag 7 oktober. Verzet omdat de twee sprekersplekken niet
op tijd rond kwamen, en de T−4-regel dan zegt: lichte avond of opschuiven. Het werd
opschuiven, precies één slot, zodat de cadans-belofte heel blijft. De twee botsingen die
de check verderop op 4 november vond zijn daarbij bewust geaccepteerd. Lees ze wel, want
ze bepalen wie er die avond niet is.

- De volgende datum staat op de site **vóór** de vorige editie voorbij is — een pauze
  zonder aangekondigde terugkeer is hoe Tech Nottingham stierf.
- Niet elke eerste woensdag hoeft een volwaardige editie te zijn. Een lichte avond
  (borrel, dev-lunch-model: geen sprekers, geen sponsor, alleen de zaal) telt ook en kost
  bijna niets — het ritme is heiliger dan het programma.
- Valt de eerste woensdag in een vakantie of op een botsend event, verplaats dan binnen
  dezelfde week en zeg erbij waarom. De collision-check hieronder is daarvoor.

## Een nieuwe editie draaien (T-min-checklist)

| Wanneer        | Wat                                                                                                                                                                          | Af voor /002? |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| T−8 weken      | Venue bevestigd (checklist hieronder); datum collision-gecheckt; editienummer + thema vastgelegd in `src/config/site.ts` en een events-entry                                 |               |
| T−6 weken      | Open call gepubliceerd én de persoonlijke sprekervragen verstuurd (sprekers komen uit de asks, niet uit de call)                                                             |               |
| T−4 weken      | **Beide sprekers bevestigd** — Ryans eigen minimum: minimaal een maand van tevoren. Geen twee sprekers op T−4? Dan wordt het een lichte avond, geen editie met TBA-programma |               |
| T−3 weken      | Redactiegesprek per spreker (claim, voorbeeld, vraag aan de zaal); slidetemplate gedeeld                                                                                     |               |
| T−2 weken      | Toegankelijkheids- en OV-informatie op de editiepagina (site-belofte); reminder in agenda-feed en LinkedIn                                                                   |               |
| T−1 week       | Technische rehearsal (mag remote); bevestigingsmail naar aanmeldingen met de annuleer-één-antwoord-regel; wachtlijst bijgewerkt                                              |               |
| T−1 dag        | Reminder aan deelnemers ("kun je niet, antwoord nu — er is een wachtlijst"); AV-check op locatie of foto's van de zaal opgevraagd                                            |               |
| Dag zelf       | Runbook hieronder                                                                                                                                                            |               |
| T+3 dagen      | Bedankmail sprekers met wat de zaal zei; opname + slides naar het archief                                                                                                    |               |
| T+10 werkdagen | Openbaar verslag, inclusief wat niet werkte (site-belofte, tracker-milestone)                                                                                                |               |

Banners en announce-graphics horen bij dit ritme: werk bij T−8 (datum + stad
vast) het `EDITIE`-blok in `docs/brand/templates/banners.html` bij en exporteer
de generieke set; het announce-statusbord met beide sprekers volgt bij T−4.
Volledige procedure, inclusief het chassis-plus-wisselstuk-principe voor een
unieke graphic per editie: [runbooks/editie-banners.md](runbooks/editie-banners.md).

## Venue regelen

Waar je op let voordat je een zaal toezegt — geleerd van de /001-onderhandeling met Code14
(afspraken in `docs/plan/code14-call-briefing.md`):

1. **Zaal**: capaciteit zittend (het getal in `site.ts` is wat de zaal echt kan, niet wat
   je hoopt), opstelling (theater voor talks, statafels voor het netwerkuur), en een
   tweede ruimte of hoek als stilteplek.
2. **AV**: beamer/scherm + HDMI én USB-C, geluid dat achterin verstaanbaar is, en bij >30
   mensen een microfoon. Test met je eigen laptop, niet die van de host.
3. **Eten**: wie bestelt, wie betaalt (factuur van de leverancier rechtstreeks naar de
   sponsor — er loopt geen geld door twente.dev), dieetwensen doorgeefbaar tot T−3 dagen.
4. **Toegankelijkheid**: drempelvrije route van straat tot zaal, toilet, en de stille
   ruimte. Dit staat als belofte op de site — check het fysiek, niet telefonisch.
5. **Bereikbaarheid**: OV-route en late terugreis (sectie hieronder), fietsenstalling,
   parkeren. Publiceer het op de editiepagina.
6. **Huisregels host**: maximaal 2 minuten welkomstwoord, geen recruiting door de host op
   de avond, geen toegang tot de deelnemerslijst, logo-credit "mede mogelijk gemaakt
   door" — nooit co-branding. Dit zijn de gepubliceerde waarborgen; een venue die dit niet
   wil, is geen venue.
7. **Logistiek**: sleutel/toegang vanaf 16:30, opruimtijd tot 22:30, wifi-code, wie er van
   de host aanwezig blijft, en wie je belt als iets kapot is.
8. **Aansprakelijkheid**: vraag of de locatie-verzekering evenementen van derden dekt; zo
   niet, weet dat je daar zelf het risico draagt en houd de avond navenant simpel.

Meer stoelen dan 40 is pas aan de orde als de wachtlijst dat twee edities op rij bewijst —
animo eerst, zaal daarna.

## Sprekers regelen

De methode is de personal ask; een open call vult op deze schaal nul stoelen op het
podium. Zo werkt de pijplijn:

1. **Scouten**: houd een lijst bij (in `media/`, niet in de publieke repo) van Twentse
   engineers met zichtbaar werk — engineeringblogs van regionale werkgevers,
   conferentiesprekers uit de regio, open-source-maintainers, en vanaf /001: iedereen die
   in de zaal iets interessants zei tijdens het community-vragenrondje. De belangrijkste
   output van editie N is de sprekerslijst van editie N+1.
2. **Vragen**: persoonlijk, over iets concreets dat diegene bouwde. Niet "wil je een keer
   spreken" maar "jij hebt X gedaan — wil je daar 12 minuten over vertellen: één claim,
   één echt voorbeeld, één vraag aan de zaal". Eén mail, één herinnering, daarna klaar
   (dezelfde twee-touch-regel als alle outreach). **Versturen doet Ryan zelf, altijd.**
3. **Vormen**: redactiegesprek van een half uur, slidetemplate, en een rehearsal in de
   week voor het event. First-timers krijgen expliciet te horen dat de zaal klein en
   vriendelijk is en dat de moderator de Q&A bewaakt.
4. **Op de avond**: zichtbaar tijdsignaal, moderator kapt om 12 minuten af (dat is een
   belofte aan de spreker, geen sanctie), Q&A via de moderator.
5. **Erna**: binnen drie dagen een bedankje mét wat de zaal zei, de opname en slides op
   een permanente URL, en de vraag wie zij de volgende keer op dat podium willen zien.
6. **Ervaren sprekers** zijn net zo welkom als first-timers — dezelfde voorwaarden
   (redactionele selectie, geen betaalde spreektijd), hetzelfde format.

Reiskosten binnen de regio zijn zelden aan de orde; als een spreker van buiten komt,
spreek het bedrag vooraf af en laat de sponsor de factuur direct betalen.

## Talk → archief (het "We share it"-deel)

Elke talk laat drie artefacten na, en dat wordt de sprekers vooraf beloofd:

1. **Video**: opname op YouTube (kanaalbeschrijving staat klaar in
   `docs/brand/social-profile-copy.md`). Minimale opstelling: één camera of zelfs een
   telefoon op statief plus de slides — begin lelijk, begin wel.
   **Consent eerst**: opnemen botst met het toestemmingsgebaseerde fotografiebeleid, dus
   de regel is: het podium wordt opgenomen, de zaal niet; sprekers tekenen er bij
   acceptatie voor, zaalvragen worden niet uitgezonden of worden geparafraseerd door de
   moderator.
2. **Slides + verslag**: slides als PDF plus een korte schriftelijke samenvatting als
   field note op de site — de permanente, citeerbare URL voor cv en LinkedIn.
3. **Badge**: een "sprak op twente.dev/001"-beeldje (uit de brand-templates te snijden)
   dat de spreker op LinkedIn kan zetten. Klein gebaar, grote kans dat het de volgende
   spreker aantrekt.

## Registratie per e-mail (geen pretix)

Besloten 2026-08-30: op deze schaal is een ticketingplatform overhead. Het hele systeem:

- **Aanmelden** = mailtje naar `hello@twente.dev` (de site zet op 2 september een
  mailto-link met voorgevuld onderwerp in `REGISTRATION_URL`).
  **Voorwaarde nul**: hello@ moet aantoonbaar ontvangen — stuur vandaag een testmail.
- **De lijst** = één spreadsheet buiten de repo: naam, e-mail, dieet, toegankelijkheid,
  optioneel "wat bouw je", en hoe ze van het event hoorden (het attributie-instrument uit
  `docs/brand/utm-convention.md`). Verwijderen binnen drie maanden na het event
  (privacybelofte).
- **Bevestigen** = persoonlijk antwoord van een mens. Afmelden = één antwoord op die
  mail; de plek gaat naar de wachtlijst.
- **Overboeken**: bevestig tot ~15% boven capaciteit (46 bij 40 stoelen). Gratis events
  kennen no-shows; de reminder op T−1 met "antwoord nu als je niet kunt" drukt dat, maar
  rekent het niet weg.
- **Vol is vol**: daarna wachtlijst in volgorde van aanmelding, en dat ook zeggen.

## Dag-van-het-event-runbook

16:30 opbouw en AV-check · 17:45 eten klaar, naamstickers en de fotografie-signalen bij
de deur · 18:00 inloop · 18:40 sprekersbriefing van twee minuten · 18:45 welkom: wie je
bent, de gedragscode en het aanspreekpunt, de fotoregel, max 2 minuten host · 19:00
field reports · 19:30 pauze + kennismakingen in tweetallen · 19:45 begeleid gesprek ·
20:25 community-vragen ("wat moet Twente weten over wat jij bouwt?" — dit is de
sprekersscouting voor de volgende editie, schrijf mee) · 20:35 netwerkuur · 21:25
afronding en de datum van de volgende editie · 21:30 harde eindtijd · 22:00 opgeruimd.

Neem mee: verlengsnoer, HDMI/USB-C-adapters, clicker, tape, naamstickers + stiften, de
deelnemerslijst op papier, en de exitvragen (hieronder).

## Meten: wanneer was het goed?

De lat voor /001 (vastgelegd 2026-08-30): **20+ gevulde stoelen**, zichtbare reacties op
LinkedIn, en een ingevulde feedback-enquête. Het instrument is een exitvraag van drie
regels — papier bij de deur of een QR:

1. Welk idee neem je mee? (vrije tekst)
2. Met wie heb je kennisgemaakt die je wilt terugzien? (vrije tekst, mag leeg)
3. Kom je naar /002 op 2 december? (ja / waarschijnlijk / nee)

Vraag 3 is het "repeat intent"-cijfer dat de perspagina belooft. De uitkomsten gaan
geanonimiseerd in het openbare verslag.

## De interviewserie (People Who Build)

Ryans idee (2026-08-30): wekelijks een gesprek met iemand uit de regio — de ene week een
CTO, de andere een junior. Het bestaande editorial-pillar `People Who Build` is hiervoor
de plek.

- **Format**: zes vaste vragen per mail of een half uur bellen; Ryan schrijft het uit tot
  een field note van ±500 woorden; de geïnterviewde leest mee voor publicatie.
- **Pijplijn**: dezelfde scoutinglijst als voor sprekers — en elk interview eindigt met
  "wie moet ik hierna spreken?", zodat de serie zichzelf vult. Een interview is ook de
  zachtste sprekerswerving die er bestaat.
- **Eerlijke waarschuwing**: wekelijks is de zwaarste terugkerende verplichting naast de
  nieuwsbrief. Begin tweewekelijks; opschalen naar wekelijks kan altijd, terugschalen is
  een gebroken ritme. Het ritme dat je aankondigt, is het ritme dat je haalt.

## Gedragscode, in je eentje

De site zegt het nu eerlijk: meldingen komen bij de organisator, die aan het begin van
elke avond wordt voorgesteld. Gaat een melding over de organisator zelf, dan wijst de
site naar de gastheer van de avond of iemand die de melder vertrouwt. Log elke melding
(wat, wanneer, wat besloten) in een privébestand — consistentie is het enige dat een
eenpersoonsproces geloofwaardig houdt. Zodra er een tweede vaste vrijwilliger is, is een
tweede aanspreekpunt de eerste rol die je weggeeft.

## OV en bereikbaarheid Rijssen

> **Verlopen verificatie, opnieuw draaien.** De tijden hieronder zijn gecontroleerd voor
> woensdag 7 oktober 2026, en die avond bestaat niet meer. Het lijnpatroon (Sprinter 7000,
> twee keer per uur, ook 's avonds) verandert zelden, dus de conclusie over lopen en de
> laatste bus houdt waarschijnlijk stand. De exacte vertrektijden staan hier als
> geverifieerd en zijn dat voor woensdag 4 november 2026 niet. Draai de check opnieuw
> vóórdat deze cijfers op de editiepagina komen te staan (T−2 in de checklist hierboven).

Geverifieerd 2026-08-30 tegen de gepubliceerde dienstregeling voor woensdag 7 oktober
2026 zelf (officiële Nederlandse GTFS-feed via `api.transitous.org`, gecontroleerd tegen
het lijnpatroon op secundaire bronnen). Herchecken op `ns.nl` in de week van het event —
werkzaamheden kunnen avondtreinen vervangen door bussen.

**De conclusie voor de editiepagina**: Code14 ligt op 780 m / 10 minuten lopen van
station Rijssen en is daarmee een van de makkelijkst autoloos bereikbare venues van
Twente — mits mensen weten dat de terugreis per tréin is: **de laatste bus vertrekt om
exact 21:30**, precies de eindtijd.

- **Lijn**: NS Sprinter 7000 (Apeldoorn–Deventer–Holten–Rijssen–Wierden–Almelo; in de
  spits doorgaand naar Hengelo/Enschede). Twee keer per uur per richting, ook 's avonds.
- **Heen vanuit Enschede**: in de spits rijdt de Sprinter door — 16:51 → Rijssen 17:33
  (geverifieerd), ruim voor de deuren van 18:00; 10 minuten lopen (Prinses
  Maximatunnel-kant, het venue ligt vrijwel pal zuid van het station).
- **Terug na de harde eindtijd van 21:30** (om ±21:42 op het station):
  - **Almelo** direct: 21:56, 22:27, 22:56, 23:27, 23:56; laatste 00:27.
  - **Hengelo** via Almelo (±40 min): 21:56 → 22:36; daarna elk half uur; laatste ±01:06.
  - **Enschede** via Almelo (±47 min): 21:56 → 22:44, 22:27 → 23:14, 22:56 → 23:44;
    allerlaatste 00:27 → aankomst 01:14.
  - **Deventer** direct: 22:04, 22:34, 23:04, 23:34; laatste 00:16.
  - **Zwolle** via Wierden (krappe maar geverifieerde 4-min-overstap op Blauwnet RS23):
    21:56 → 22:39; laatste praktische 23:56 → 00:39.
- **Fiets/auto**: gratis P+R en fietsenstalling + OV-fiets op het station;
  parkeerterrein Hogepad ligt op dezelfde straat (capaciteit onverifieerd — vraag Code14
  naar eigen bezoekersplekken); parkeren rond Hogepad lijkt gratis maar is niet hard
  bevestigd.
- **Toegankelijkheid**: station heeft lift, geleidelijnen en NS Reisassistentie
  (Wikipedia-geverifieerd; de NS-stationspagina zelf was niet machinaal leesbaar). De
  loper van 780 m is nog niet fysiek geschouwd op stoepranden — doe dat vóór de
  toegankelijkheidsinformatie op de site gaat (belofte: uiterlijk 23 sep).

## Collision-check (procedure)

Voor elke nieuwe datum, in deze volgorde: de eigen events-feed en de partnerkalender
(zodra die gevuld is) · meetup.com-agenda's van Agile Meetup Twente, Flutter
Twente/Baseflow en de Zwolse groepen · TkkrLab · activiteitenagenda's van Inter-Actief,
Proto en Syntaxis · Novel-T/Kennispark en `zwinc.nl` · landelijke dev-conferenties (J-Fall,
TEQnation, PyCon NL, Devoxx) · het UT-kwartielrooster (tentamenweken) · schoolvakanties
en feestdagen. Botst het, verplaats en zeg waarom. Lokale groepen publiceren maar 2–8
weken vooruit, dus **herhaal de check ±5 weken voor elke editie**.

Uitkomst van de check op 2026-08-30 (bronnen: het vakantieoverzicht van de rijksoverheid,
de UT-jaarkalender 2026–2027, `zwinc.nl`, `jfall.nl`, `devoxx.be` en `meetup.com`):

- **Wo 7 okt 2026 (/001 tot 2026-09-04) — schoon.** Geen lokale, regionale of landelijke botsing op de
  datum zelf. Enige aftrek: Devoxx België (5–9 okt, Antwerpen) houdt een deel van de
  Java-hoek die week weg. Herfstvakantie regio Noord begint pas 10 okt; UT zit in een
  gewone collegeweek.
- **Wo 4 nov 2026 (sinds 2026-09-04 /001) — conflict, twee keer.** (1) ZWINC "AI Connect" staat
  exact die avond in Zwolle (deels overlappend publiek, zelfde sponsorvijver). (2) Het is
  midden in de UT-tentamenweken van kwartiel 1 (26 okt–6 nov) — de studenten uit de
  brugambitie zijn er dan niet. Structureel: de eerste woensdag van november valt vaker
  in de UT-tentamenweek. Alternatief binnen het ritme-met-uitleg: wo 18 nov (11–12 nov is
  J-Fall, dus niet de tweede woensdag). Besluit is aan Ryan; leg het vast vóór /001, want
  de /002-datum wordt op /001 aangekondigd.
- **Wo 2 dec 2026 (sinds 2026-09-04 /002) — kan, maar druk.** DevPulse #7 is de avond erna (do 3
  dec, Zwolle, gratis met diner, deels zelfde publiek), en het is Sinterklaasweek
  (pakjesavond za 5 dec) — reken op dunnere opkomst bij ouders. UT zit in een gewone
  collegeweek.

Besluit op 2026-09-04, nadat /001 van 7 oktober naar 4 november is verzet:

- **De twee botsingen op 4 november zijn geaccepteerd, niet opgelost.** Ryans afweging:
  sprekersruimte woog zwaarder. Ze gelden dus nog steeds, en de campagne moet erop
  aangepast worden. (1) Reken het Zwolse deel van de zaal niet mee, want ZWINC "AI Connect"
  is diezelfde avond; stem partner- en sponsorvragen daarop af. (2) De UT-tentamenweken van
  kwartiel 1 lopen tot en met 6 november, dus de studenten uit de brugambitie zijn er
  grotendeels niet. Mik /001 op de werkende praktijk en tel studentenbereik pas mee vanaf
  /002.
- **De structurele les blijft staan**: de eerste woensdag van november valt vaker in de
  UT-tentamenweek. Voor volgende jaren is dat een reden om november standaard naar de derde
  woensdag te zetten. Niet de tweede, want 11 en 12 november is J-Fall.
- **Wo 2 dec 2026 is nu /002**, met dezelfde uitkomst als hierboven (kan, maar druk). Leg
  die datum vast vóór /001, want /002 wordt op /001 aangekondigd.
- **Wo 6 jan 2027 (beoogd /003) — nog niet gecheckt.** Eerste woensdag van januari; de
  kerstvakantie loopt in de meeste regio's tot en met zondag 3 januari.
- **Herhaal de volledige ronde langs de bronnen hierboven** in de week van 30 september
  (±5 weken voor 4 november).

Niet verifieerbaar op 2026-08-30 (opnieuw checken ±5 weken vooraf): agenda's van Agile
Meetup Twente, Flutter Twente/Baseflow, DevSessions Zwolle (alle drie 0 aankomende
events gepubliceerd), Novel-T/Kennispark na eind sep, TkkrLab (DNS stuk; open avonden
zijn di/vr volgens secundaire bronnen), Proto en Syntaxis (sites onbereikbaar).
