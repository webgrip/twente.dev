# Nu te doen — Ryan

Alles wat op jou wacht, in de volgorde waarin het elkaar deblokkeert. Vink af
terwijl je gaat. Wat hier niet staat, staat op mijn stapel.

> Dit is een werklijst en geen archief. Streep af wat klaar is en gooi de sectie
> weg als hij leeg is; hij hoeft niet te groeien tot een logboek.

## Vandaag: de Meetup live zetten

Dit blokkeert het meeste. Zolang er geen event is, staat de site te beloven dat
aanmelden op 14 september opent zonder dat er iets achter zit.

- [ ] **Groep aanmaken op locatie Enschede**, niet Rijssen. Meetup bepaalt de
      vindradius met die locatie, en de zaal wisselt per release terwijl de
      community regionaal is.
- [ ] **Event aanmaken**: woensdag 4 november 2026, 18:00 tot 21:30, Code14,
      Hogepad 81, 7462 TB Rijssen. Gratis.
- [ ] **Beschrijving linkt naar `https://twente.dev/nl/001`.** De site blijft het
      verslag; Meetup draagt alleen de aanmelding.
- [ ] **Banner uploaden** uit `public/brand/social/meetup/001/`. De
      `banner-meetup-001-1200x675@2x.png` is de standaard, de `-nacht-` variant
      als je de donkere wilt.
- [ ] **Wachtlijst aan**, en accepteren boven de veertig stoelen. Gratis avonden
      hebben veel no-shows.
- [ ] **RSVP-vraag 1: "Hoe hoorde je van twente.dev?"** Verplicht, met een korte
      lijst plus een vrij tekstveld: LinkedIn · Meetup zelf · een collega of
      vriend · een organisator van een andere meetup · Code14 · pers · anders.
      **Dit is niet optioneel.** Zonder deze vraag levert /001 geen enkele
      attributie op, hoe je de links ook tagt.
- [ ] **RSVP-vraag 2: dieetwensen.**
- [ ] **RSVP-vraag 3: toegankelijkheidsbehoeften.**
- [ ] **Code14 krijgt geen organiser-rol** op de groep.
- [ ] **Stuur mij de event-URL.** Dan zet ik `REGISTRATION_URL` en klopt de site
      weer intern.

## Vandaag: Code14 bevestigen

- [ ] Bevestig dat 2 december voor /002 staat. Die datum wordt op /001
      aangekondigd, dus hij moet vast liggen voordat /001 draait.
- [ ] Zeg erbij dat we publiek drie releases noemen en niet twaalf. Dat is geen
      terugtrekking; het houdt de rotatiebelofte op de perspagina overeind en
      geeft jullie allebei ruimte.

## Mail: de verhuizing is klaar, dit ligt er nog

De overstap naar secondary domain is op 4 september uitgevoerd, alle acht stappen.
`conduct@`, `hello@`, `press@` en `dmarc@` zijn Google Groups op twente.dev, en
externe post komt bij elk lid aan. Verzenden gaat vanaf `ryan@twente.dev` met
`hello@twente.dev` als afzender; dat is de enige opstelling waarin SPF en DKIM
allebei uitlijnen. MTA-STS staat live op `mode: testing`, met beide TXT-records
gepubliceerd. De gemeten stand staat bovenin
[`runbooks/email-authentication.md`](../runbooks/email-authentication.md).

Wat er nog ligt, in volgorde van moeite:

- [ ] **CAA-records** op `twente.dev` en `webgrip.nl`, negen per zone. Nu mag elke
      CA ter wereld een certificaat voor je domeinen uitgeven. De vier CA's van
      Cloudflare moeten er alle vier in, want ze rouleren.
- [ ] **DNSSEC afmaken.** `webgrip.nl` tekent al maar heeft geen DS bij Namecheap,
      dus niemand valideert het. Vier velden overtypen uit Cloudflare.
      `twente.dev` moet eerst aan in Cloudflare.
- [ ] **Google Postmaster Tools** voor twente.dev en webgrip.nl, op
      [postmaster.google.com](https://postmaster.google.com). Per domein een
      TXT-record in Cloudflare op de apex, dan Verify. De grafieken blijven leeg
      tot je een paar honderd berichten naar Gmail-adressen hebt gestuurd, en dat
      is precies de reden om het nu aan te zetten en niet straks.
- [ ] **De drie Brevo-instellingen** uit ADR 0011 die niets in deze repo kan
      afdwingen: Reply-To op `hello@`, open tracking uit, double opt-in aan.
- [ ] **Renovate aanzetten voor deze repo** in `webgrip/homelab-cluster`. De
      config staat klaar en gepind, maar de runner kent twente.dev niet, dus er
      gebeurt niets.
- [ ] **De catch-all testen.** `bestaatniet@twente.dev` kwam niet aan toen we het
      probeerden. Email Log Search zegt wat ermee gebeurde.

Dit wordt bewaakt: `pnpm validate:mail-auth` controleert de gemeten stand tegen
`ops/mail-auth.intent.yml`, en een nachtelijke workflow faalt bij afwijking. Wat
hierboven nog open staat, meldt hij als openstaande stap in plaats van als fout.

Op de kalender, niet nu:

- ~18 september DMARC naar `p=quarantine; pct=25`, ~1 oktober naar `pct=100`, en
  `p=reject; sp=reject` pas ná 4 november. Verscherpen rond een datum die telt is
  precies wat het runbook afraadt.
- Twee schone weken TLS-RPT, dan MTA-STS van `testing` naar `enforce` met een
  opgehoogd `id`.
- SPF van `~all` naar `-all` als allerlaatste.

## Wanneer het zover is

- [ ] **T−8, dinsdag 9 september**: collision-check opnieuw draaien voor
      4 november. De vorige is van 30 augustus en lokale groepen publiceren maar
      twee tot acht weken vooruit.
- [ ] **14 september**: aanmelden opent. Dit staat al zo op de site.
- [ ] **T−6, woensdag 23 september**: open call live en de persoonlijke
      sprekervragen de deur uit. Sprekers komen uit de asks, niet uit de call.
- [ ] **T−4, woensdag 7 oktober**: beide sprekers bevestigd, anders schuift de
      release een maand op. Dit is de regel die /001 al een keer heeft verzet; hem
      negeren kost meer dan hem volgen.
- [ ] **T−2, woensdag 21 oktober**: OV-tijden opnieuw verifiëren voordat ze op de
      releasepagina komen. De cijfers in het playbook zijn gecontroleerd tegen
      7 oktober en die avond bestaat niet meer.

## Uit de harvest van 2026-09-16

- [ ] **Een pre-commit hook die Prettier draait.** Drie keer in vijf dagen zette een commit
      zonder `pnpm format` de gedeelde Static Analysis-job op rood voor elke sessie. De
      storing en de bestanden staan in [de CI-runbook](../runbooks/ci-failures.md); de
      oplossing is een hook in `settings.json`, geen documentatie.
- [ ] **Beslis of /001 wordt opgenomen.** Het [organisator-playbook](../organiser-playbook.md)
      belooft een spreker drie artefacten waaronder video, maar er staat geen camera klaar.
      Neem je niet op, dan moet die belofte uit het playbook; neem je wel op, dan mag het
      woord "opname" in de sprekersmails en in de copy erbij.
- [ ] **Controleer of `email-welcome.html` al als Automation in Brevo staat.** Zo ja, dan moet
      hij opnieuw geplakt worden, want de oude versie beloofde hulp bij de opzet.
- [ ] **Kies de standaarduitlijning van het horizontale lockup.** `lockup-horizontal.svg`,
      `-middle` en `-bottom` staan alle drie in de kit. Na de keuze: de gekozen variant tot
      `lockup-horizontal.svg` maken in `scripts/brand-assets.py`, het script draaien, en daarna
      de banners en de dekkenkit opnieuw genereren.
- [ ] **Meet de capaciteit van de zaal bij Code14.** De repo zegt overal 40; er is één keer
      "30 tot 40" langsgekomen. Klopt 40 niet, dan verandert `capacity` in de events-entry en
      sijpelt het vanzelf door naar site, meetup-tekst en mail.

## Twee dingen die je moet beslissen

- [ ] **De rotatiebelofte.** De perspagina zegt dat releases door de regio
      rouleren. Met Code14 als host voor de eerste twee klopt dat nog; noem je er
      publiek meer, dan moet die zin mee veranderen.
- [ ] **Wanneer heet dit community-supported?** Nu betaalt Webgrip en wordt een
      deel gesponsord. Dat is een prima startpunt en het is niet wat "door de
      community gedragen" betekent. Zeg het pas als het waar is.
