# Business Rules — twente.dev

*Generated from `model.yaml` — do not edit by hand. Cite rules by id in specs.*

## Archief

### R12

Een Speaker kan de opname van de eigen Talk laten verwijderen uit het Archief. De tekstpagina van die Talk blijft staan.

**Why:** De site belooft dat wat verteld is blijft staan en vindbaar blijft. Die belofte gaat over het verhaal en niet over iemands gezicht op video, en omstandigheden veranderen: van werkgever wisselen is genoeg reden. Zo blijft het archief compleet zonder dat iemand aan een opname vastzit.

**Also applies to:** Speaker, Talk

## Community

### R7

Content die aan een echte regionale organisatie wordt toegeschreven, komt uit de contributiepijplijn en wordt nooit verzonnen.

**Why:** De directory is alleen iets waard als alles erin klopt.

### R11

twente.dev draait geen Release op de avond van een Community uit de directory, en benadert hun bestaande sponsors niet. Slaat niet op de eigen Kanalen, want die zijn van twente.dev zelf.

**Why:** Het staat zo in het partnercompact. Een directory die je concurrent blijkt te zijn, is een directory waar niemand meer in wil staan.

**Also applies to:** Release

## Host

### R4

Een Host krijgt logo, bedanking en hooguit twee minuten. Nooit een Talk-slot, de deelnemerslijst of inspraak op het programma.

**Why:** De gepubliceerde waarborgen gelden ook voor wie de zaal betaalt, anders zijn het geen waarborgen.

### R9

Een Host wordt publiek genoemd met een eindig aantal releases, en dat aantal is hoogstens wat er is toegezegd. Achter de schermen ligt voor dezelfde periode een uitwijklocatie klaar.

**Why:** Andere bedrijven moeten kunnen zien wanneer de zaal weer vrijkomt, anders is de open uitnodiging aan de regio een dode letter, en de site belooft dat releases door de regio rouleren. Minder toezeggen dan je hebt, geeft ook ruimte om te verhuizen zonder iets terug te nemen. De uitwijklocatie bestaat omdat een host die halverwege afhaakt anders het ritme breekt, en het ritme is de hele belofte.

## Newsletter

### R8

De nieuwsbrief is één lijst met één afmeldknop. Wie zijn adres achterlaat krijgt de Field Reports, de Open Calls en de aankondigingen rond een Release, en de opt-intekst noemt ze alle drie.

**Why:** Aparte lijsten per soort zijn administratie zonder opbrengst zolang er één afzender en een handvol verzendingen per kwartaal zijn. Wat wél moet: niet meer beloven dan je stuurt, en niet minder. Een lijst die naar één soort post is vernoemd, belooft minder dan hij levert.

**Also applies to:** Field Report

## Registration

### R13

Boven de capaciteit accepteren mag, met een overboekfactor, en wie daarboven komt staat op de Wachtlijst. De factor komt uit de Opkomst van de vorige Release; zolang die er niet is, is het een opgeschreven schatting die na de eerste meting vervalt.

**Why:** Een gratis avond heeft no-shows, dus precies op de capaciteit accepteren levert lege stoelen op die iemand had willen hebben. De factor hangt aan een meting zodat hij zichzelf corrigeert in plaats van een gevoel te blijven.

**Also applies to:** Opkomst, Wachtlijst

## Release

### R1

twente.dev wordt altijd met kleine letters geschreven, ook aan het begin van een zin.

**Why:** Het is een domeinnaam en de merkregel; een hoofdletter maakt er een bedrijfsnaam van.

### R2

De feiten van de huidige Release (datum, tijden, stad, venue, capaciteit, kosten) staan uitsluitend in src/config/site.ts. Geen enkele pagina herhaalt ze als letterlijke tekst.

**Why:** Herhaalde feiten lopen uiteen, en mensen boeken reizen op deze velden.

### R6

Zijn op T−4 weken niet beide Slots gevuld, dan schuift de Release op naar de volgende maand en reist het nummer mee. Een avond met een TBA-programma gaat niet door.

**Why:** Een leeg programma dat toch wordt aangekondigd kost meer vertrouwen dan een datum die opschuift met de reden erbij. Opschuiven kan omdat het ritme een belofte over de eerste woensdag is en niet over de nummerreeks.

**Also applies to:** Speaker

### R14

De avond heet een Release, het stuk dat erna verschijnt heet Release notes, en het overzicht van wat er buiten twente.dev speelt heet Upstream. De woorden in `retired` worden nergens meer gebruikt, ook niet in besluitregisters of werknotities.

**Why:** Het publiek bouwt technologie, dus het register waarin het al denkt is gratis leesbaarheid: een genummerde release met release notes vraagt geen uitleg. Elk publiek zelfstandig naamwoord kost bovendien twee keer op een tweetalige site, dus een woord dat in het Nederlands en het Engels hetzelfde is, is meer waard dan een woord dat alleen accuraat is. De prijs staat erbij: release klinkt naar software terwijl er ook maakindustrie, design en onderzoek in de zaal zit, en die afweging is gemaakt.

**Also applies to:** Release notes, Upstream

### R15

Een naam die vervalt gaat op `retired` met het woord dat ervoor in de plaats komt, en pas daarna wordt de repo opgeruimd. Niet andersom.

**Why:** Twee hernoemingen op rij bleven half liggen omdat het opruimen op geheugen dreef. De lijst is machineleesbaar en `claims.test.ts` faalt op elk voorkomen, dus de lijst met vindplaatsen ís de opruimlijst. De enige plek waar een vervallen woord nog staat, is de regel die hem verbiedt.

### R10

Een Release valt op de eerste woensdag van de maand. Verplaatsen mag, mits de reden erbij wordt gezegd, en de volgende datum staat op de site voordat de vorige Release voorbij is.

**Why:** Een datum die iedereen zelf kan uitrekenen breekt niet, en een pauze zonder aangekondigde terugkeer is hoe communities doodgaan.

## Speaker

### R5

Een Speaker verschijnt pas op de site nadat die persoon de datum bevestigd heeft.

**Why:** Een aangekondigde naam is een toezegging aan iemand die het vervolgens aan collega's vertelt. Terugtrekken kost die persoon meer dan ons.

## Talk

### R3

Spreektijd is niet te koop. Een Speaker wordt redactioneel geselecteerd.

**Why:** Het is een gepubliceerde waarborg en het onderscheidt de avond van een leverancierspodium.

**Also applies to:** Speaker, Partner
