# Nu te doen — Ryan

Alles wat op jou wacht, in de volgorde waarin het elkaar deblokkeert. Vink af
terwijl je gaat. Wat hier niet staat, staat op mijn stapel.

> Dit is een werklijst en geen archief. Streep af wat klaar is en gooi de sectie
> weg als hij leeg is; hij hoeft niet te groeien tot een logboek.

## Vandaag: de Meetup live zetten

Dit blokkeert het meeste. Zolang er geen event is, staat de site te beloven dat
aanmelden op 14 september opent zonder dat er iets achter zit.

- [ ] **Groep aanmaken op locatie Enschede**, niet Rijssen. Meetup bepaalt de
      vindradius met die locatie, en de zaal wisselt per editie terwijl de
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
- [ ] Zeg erbij dat we publiek drie edities noemen en niet twaalf. Dat is geen
      terugtrekking; het houdt de rotatiebelofte op de perspagina overeind en
      geeft jullie allebei ruimte.

## Deze week: de Workspace-verhuizing

Volledige procedure met volgorde, verificatie en terugweg staat in
[`runbooks/email-authentication.md`](../runbooks/email-authentication.md),
sectie "Plan: van domain alias naar secondary domain". Doe hem in één zitting.

- [ ] Noteer vooraf het huidige DKIM-record en al je Cloudflare Email
      Routing-regels voor twente.dev. Dat is je weg terug.
- [ ] Loop de elf stappen af.
- [ ] Klaar is pas klaar als een testmail vanaf `ryan@twente.dev` **beide**
      DMARC-benen laat slagen: `dkim=pass header.d=twente.dev` én
      `spf=pass smtp.mailfrom=twente.dev`.
- [ ] En als een mail van buiten naar `conduct@twente.dev` bij **elk** lid
      aankomt. Dat adres staat op de gedragscodepagina.

## Deze week: gratis en zo gedaan

- [ ] **Google Postmaster Tools** voor twente.dev en webgrip.nl, op
      [postmaster.google.com](https://postmaster.google.com). Per domein een
      TXT-record in Cloudflare op de apex, dan Verify. De grafieken blijven leeg
      tot je een paar honderd berichten naar Gmail-adressen hebt gestuurd, en
      dat is precies de reden om het nu aan te zetten en niet straks.

## Wanneer het zover is

- [ ] **T−8, dinsdag 9 september**: collision-check opnieuw draaien voor
      4 november. De vorige is van 30 augustus en lokale groepen publiceren maar
      twee tot acht weken vooruit.
- [ ] **14 september**: aanmelden opent. Dit staat al zo op de site.
- [ ] **T−6, dinsdag 23 september**: open call live en de persoonlijke
      sprekervragen de deur uit. Sprekers komen uit de asks, niet uit de call.
- [ ] **T−4, dinsdag 7 oktober**: beide sprekers bevestigd, anders schuift de
      editie een maand op. Dit is de regel die /001 al een keer heeft verzet; hem
      negeren kost meer dan hem volgen.
- [ ] **T−2, dinsdag 21 oktober**: OV-tijden opnieuw verifiëren voordat ze op de
      editiepagina komen. De cijfers in het playbook zijn gecontroleerd tegen
      7 oktober en die avond bestaat niet meer.

## Twee dingen die je moet beslissen

- [ ] **De rotatiebelofte.** De perspagina zegt dat edities door de regio
      rouleren. Met Code14 als host voor de eerste drie klopt dat nog; noem je er
      publiek meer, dan moet die zin mee veranderen.
- [ ] **Wanneer heet dit community-supported?** Nu betaalt Webgrip en wordt een
      deel gesponsord. Dat is een prima startpunt en het is niet wat "door de
      community gedragen" betekent. Zeg het pas als het waar is.
