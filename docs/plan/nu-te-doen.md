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

Gekozen op 4 september: de volledige overstap naar secondary domain, licentie
inbegrepen. Die lost twee dingen in één zitting op. `conduct@twente.dev` wordt
een echte groep met meer dan één lid, en de envelope verschuift van `webgrip.nl`
naar `twente.dev`, waarmee DMARC op twee benen komt te staan in plaats van op
één.

Volledige procedure met volgorde, verificatie en terugweg staat in
[`runbooks/email-authentication.md`](../runbooks/email-authentication.md),
sectie "Plan: van domain alias naar secondary domain".

**Wanneer.** Ruim voor 14 september, want dan opent aanmelden. Niet op
vrijdagmiddag. Stap 6 mint een nieuwe DKIM-sleutel, dus tussen die stap en een
geslaagde testmail staat DMARC even op nul benen. Dat is te overzien op een
rustige dag en het is de reden om het niet uit te stellen tot de week dat er
iets van afhangt.

- [x] Cloudflare Email Routing-regels opgeschreven, 4 september. Het zijn er
      geen. Er is precies één regel, een catch-all naar
      `ryan+twentedev@webgrip.nl`, en die is de enige reden dat `hello@`,
      `conduct@`, `press@` en `dmarc@` ergens aankomen. Je weg terug is dus die
      ene regel plus de DNS-stand in het runbook onder "Vooraf".
- [ ] **Welke adressen zijn echt in gebruik?** Activity Log op `Last 30 days`,
      unieke waarden in de kolom `Recipient`. Dit is de lijst die stap 5 moet
      dekken. De catch-all verbergt vandaag wat je gebruikt, en na stap 7
      bestaat alleen nog wat je expliciet hebt aangemaakt.
- [ ] **Waarom falen de DMARC-rapporten?** Activity Log, een rij met
      `Delivery failed` openklikken en de reden lezen. 27 van de 42 berichten
      van de afgelopen week zijn mislukt en het zijn allemaal Google-rapporten
      aan `dmarc@`. Waarschijnlijk lost de verhuizing dit op, omdat Google dan
      direct aflevert zonder doorstuurhop, en dat wil je weten voordat je erop
      rekent.
- [ ] Loop de acht stappen af in die volgorde. Stap 1 tot en met 6 raken je
      inbox niet. Stap 7 zet de MX om en dat is het onomkeerbare moment. Er is
      geen knop die een alias omzet naar een secondary domain; Workspace biedt
      alleen `Remove`, dus stap 1 en 2 zijn echt twee stappen.
- [ ] Stap 4 kost geld: `ryan@twente.dev` als echt account is een licentie. Dat
      is de stap die de envelope koopt. Sla je hem over, dan heb je de groepen
      en blijft de envelope op `webgrip.nl` staan.
- [ ] Stap 5 heeft een valkuil die geen foutmelding geeft: een nieuwe groep
      weigert externe afzenders standaard, en `hello@` en `conduct@` moeten
      juist van buiten kunnen ontvangen.
- [ ] Klaar is pas klaar als een testmail vanaf `ryan@twente.dev` **beide**
      DMARC-benen laat slagen: `dkim=pass header.d=twente.dev` én
      `spf=pass smtp.mailfrom=twente.dev`.
- [ ] En als een mail van buiten naar `conduct@twente.dev` bij **elk** lid
      aankomt. Dat adres staat op de gedragscodepagina.
- [ ] Bij stap 7 een besluit: Google heeft geen catch-all zoals Cloudflare, wel
      _Default routing_. Zet die op `ryan@twente.dev`, dan loopt een adres dat we
      vergeten stil door in plaats van hard te bouncen.
- [ ] Werk daarna het runbook bij: punt 3 afvinken, de tabel bovenin op de
      nieuwe MX en de nieuwe DKIM-staart zetten, en punt 7 (MTA-STS) is dan niet
      langer geblokkeerd.

**Loopt het uit tot na 12 september**, zet dan eerst route A uit het runbook neer
als tussenstap, zodat `conduct@` twee mensen bereikt voordat aanmelden opent: een
groep op webgrip.nl waar de bestaande Cloudflare-regel naar wijst. Een paar
minuten werk, in een paar minuten terug te draaien, en de verhuizing kan daarna
alsnog.

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
