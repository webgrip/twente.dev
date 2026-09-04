# KPI's

Wat we meten aan een release, en per cijfer het besluit dat het verandert. Een
getal dat geen besluit verandert staat hier niet in; dat is een tellertje en die
horen op een dashboard, niet in een set waarop je stuurt.

Vijf is het maximum. Meer dan dat kijkt niemand na, en dan sturen ze op geen van
alle.

## Waarom deze vijf en niet de vanzelfsprekende

De verleiding is om te tellen wat makkelijk telt: weergaven, volgers, reacties.
Die drie zijn samen één ding, ze zeggen iets over bereik en niets over de avond,
en ze veranderen geen besluit. Wat doe je anders bij 5000 weergaven dan bij 500?
Als het antwoord "niets" is, hoort het getal hier niet.

Elke volumemetriek heeft daarom een kwaliteitstegenhanger in dezelfde set. De
test is: hoe maak ik dit cijfer beter terwijl de avond slechter wordt? Bij
gevulde stoelen is dat antwoord "de zaal vullen met wie dan ook", dus de
tegenhanger meet of de mensen die er wáren er iets aan hadden.

## De set

### K1 · Gevulde stoelen

- **Formule** Opkomst gedeeld door capaciteit. Opkomst is een telling aan de
  deur, geen aantal aanmeldingen.
- **Bron** Handmatige telling op de avond, naast het RSVP-aantal op Meetup.
- **Frequentie** Per release · **Richting** omhoog
- **Nulmeting** Geen. /001 is de eerste meting.
- **Norm voor /001** 20 van de 40. Dat is de lat die op 2026-08-30 is
  vastgelegd, en het is een norm en geen voorspelling.
- **Eigenaar** Ryan · **Herzien** na /002
- **Besluit dat het verandert** Onder de 20: de vraag is niet het formaat maar
  het bereik, en /002 krijgt een ander kanaal in plaats van een ander programma.
  Boven de 35: een grotere zaal zoeken voor /003, want dan is Code14 de
  beperking geworden.

### K2 · Terugkeerintentie

De kwaliteitstegenhanger van K1.

- **Formule** Aandeel "ja" op exitvraag 3, van de ingevulde formulieren.
  "Waarschijnlijk" telt niet mee als ja.
- **Bron** Exit-enquête, papier bij de deur of QR.
- **Frequentie** Per release · **Richting** omhoog
- **Nulmeting** Geen · **Signaaldrempel** onder 60% is een probleem
- **Eigenaar** Ryan · **Herzien** na /002
- **Besluit dat het verandert** Onder de 60%: het formaat wordt herzien vóór
  /002, en dat gaat vóór groei. Een avond die mensen niet terug wil zien, moet
  je niet groter maken.

### K3 · Nuttige kennismaking

- **Formule** Aandeel ingevulde formulieren waar exitvraag 2 niet leeg is.
- **Bron** Exit-enquête.
- **Frequentie** Per release · **Richting** omhoog
- **Nulmeting** Geen · **Signaaldrempel** onder 50%
- **Eigenaar** Ryan · **Herzien** na /002
- **Besluit dat het verandert** Onder de 50%: het netwerkuur krijgt weer
  structuur. De gestructureerde kennismakingen in tweetallen zaten in het
  oorspronkelijke programma en zijn eruit gehaald; dit cijfer is precies wat
  meet of dat een goed idee was. De site belooft "één nuttige kennismaking", dus
  dit is een gepubliceerde belofte en geen wens.

### K4 · Nieuwe leden op de Meetup-groep

- **Formule** Aantal nieuwe leden in de periode tussen twee releases.
- **Bron** Meetup-dashboard.
- **Frequentie** Per release · **Richting** omhoog
- **Nulmeting** 0 bij de start · **Norm** nog niet te stellen
- **Eigenaar** Ryan · **Herzien** na /002
- **Besluit dat het verandert** Blijft de groei uit, dan is de 99 euro per jaar
  geen distributie maar alleen RSVP-afhandeling, en dan is een eigen formulier
  goedkoper. Dat besluit valt na /002.

### K5 · Aandeel van de opkomst dat via Meetup kwam

De kwaliteitstegenhanger van K4.

- **Formule** Aandeel van de opkomst dat bij de RSVP-vraag Meetup als kanaal
  noemt.
- **Bron** De RSVP-vraag, met de hand teruggelegd op de bronnen uit
  `brand/utm-convention.md`.
- **Frequentie** Per release · **Richting** omhoog
- **Nulmeting** Geen · **Signaaldrempel** onder 25% naast een groeiend ledental
- **Eigenaar** Ryan · **Herzien** na /002
- **Besluit dat het verandert** Groeien de leden wel maar komt er niemand
  vandaan, dan is Meetup een mailinglijst en geen trechter, en verhuist het
  budget naar het kanaal dat wel mensen levert.

## LinkedIn staat er bewust niet in

Weergaven, volgers en reacties zijn signalen die je bekijkt, geen KPI's waarop
je stuurt. Ze staan op geen enkel moment tussen jou en een besluit: je gaat niet
anders programmeren bij minder weergaven, en je gaat de avond niet afzeggen bij
minder volgers. Kijk ernaar in het verslag, stuur er niet op.

Dit verandert zodra er één beslissing aan hangt die je nu niet kunt nemen. Kun
je die formuleren, dan hoort het cijfer alsnog in de set en gaat er iets anders
uit.

## Twee dingen die eerst moeten

- **De exit-enquête is de bron van drie van de vijf.** Zonder ingevulde
  formulieren heb je K2 en K3 niet en is K1 een kaal getal. Papier bij de deur
  werkt beter dan een QR: mensen vullen het in terwijl ze op hun jas wachten.
- **De perspagina belooft een cijfer dat nergens vandaan komt.** Beide
  perspagina's zeggen geaggregeerde cijfers na afloop toe over aanmeldingen,
  **vertegenwoordigde organisaties** en herhaalintentie. Aanmeldingen en
  herhaalintentie heb je. Vertegenwoordigde organisaties vraag je nergens uit:
  niet bij de RSVP en niet in de exit-enquête. Dat moet je vragen of je moet de
  belofte intrekken.

## Wat hier niet aan de orde is

Metingen op persoonsniveau. twente.dev meet releases en kanalen, geen mensen. De
exit-enquête is anoniem en de uitkomsten gaan geanonimiseerd het openbare
verslag in.
