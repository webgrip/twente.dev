# Glossary — twente.dev

*Generated from `model.yaml` — do not edit by hand.*

## Community

Een bestaande groep in de regio die in de directory staat. twente.dev concurreert niet met een Community en draait geen eigen avond op hun avond.

**Examples:** TkkrLab; Agile Meetup Twente  

## Edition
*Context: Editie*

Eén genummerde avond, geschreven als twente.dev/001. Onderscheidt zich van een gewone meetup doordat het nummer permanent is en de avond een archief achterlaat. Iedere eerste woensdag van de maand, met verplaatsing alleen met opgegeven reden.

**Also known as:** editie, flagship  
**Do not use:** meetup, event night  
**Examples:** twente.dev/001 — Reconnect; twente.dev/002  
**See also:** [Talk](#talk), [Registration](#registration), [Host](#host)  

## Field Note
*Context: Publicatie*

Eén concrete les uit de praktijk, in de eerste persoon opgeschreven door degene die hem geleerd heeft. Ook Ryans eigen lessen uit het organiseren vallen hieronder. Het onderscheid met People Who Build is wie de pen vasthoudt: bij een Field Note schrijft de betrokkene zelf, bij People Who Build interviewen wij.

**Also known as:** veldnotitie  
**Do not use:** field report  
**See also:** [People Who Build](#people-who-build), [Newsletter](#newsletter)  

## Host
*Context: Editie*

De organisatie die de zaal levert voor een Edition. Krijgt logo, bedanking bij de opening en hooguit twee minuten welkomstwoord. Krijgt nadrukkelijk geen Talk-slot, geen deelnemerslijst en geen inspraak op het programma.

**Also known as:** gastheer  
**Do not use:** eigenaar, organisator  
**Examples:** Code14  
**See also:** [Partner](#partner), [Edition](#edition)  

## Newsletter
*Context: Publicatie*

De opt-in maillijst waarop lezers zich abonneren, met dubbele opt-in via Brevo. Verstuurt de Publicatie-stukken en de aankondigingen rond een Edition. Geen wekelijkse cadans; er gaat een mail uit als er iets te melden is.

**Also known as:** nieuwsbrief  
**Do not use:** de field note  
**See also:** [People Who Build](#people-who-build), [Field Note](#field-note)  

## Open Call
*Context: Publicatie*

Een gepubliceerde oproep om iets bij te dragen, meestal een Talk voor de eerstvolgende Edition. Staat open zolang de plekken niet gevuld zijn.

**Also known as:** open call, oproep  
**See also:** [Talk](#talk), [Speaker](#speaker)  

## Partner

Een organisatie die twente.dev steunt onder het gepubliceerde partnercompact. Onderscheidt zich van een Host doordat een Partner geen zaal hoeft te leveren en een Host geen bijdrage hoeft te doen.

**See also:** [Host](#host)  

## People Who Build
*Context: Publicatie*

Een interview met iemand die in de regio bouwt, opgebouwd uit vaste vragen. Wij stellen de vragen, zij geven de antwoorden. Onderscheidt zich van een Field Note doordat iemand anders de pen vasthoudt, en van een Talk doordat het geschreven is en niet aan een Edition hangt.

**Also known as:** portret, interview  
**Do not use:** field report, veldverslag  
**See also:** [Field Note](#field-note), [Newsletter](#newsletter)  

## Registration
*Context: Editie*

De RSVP van één persoon voor één Edition, sinds 2026-09-02 afgehandeld op meetup.com. De site blijft het verslag van de avond; Meetup draagt alleen de aanmelding.

**Also known as:** aanmelding, RSVP  
**Do not use:** ticket, kaartje  
**See also:** [Edition](#edition)  

## Speaker
*Context: Editie*

Iemand die een Talk geeft op een Edition. Wordt redactioneel geselecteerd en bevestigt zelf de datum voordat de naam ergens verschijnt.

**Also known as:** spreker  
**See also:** [Talk](#talk), [Open Call](#open-call)  

## Talk
*Context: Editie*

Een gesproken bijdrage van twaalf minuten op een Edition, met één claim, één echt voorbeeld en één vraag aan de zaal. Gegeven door iemand die het werk zelf deed, niet door een vertegenwoordiger ervan.

**Also known as:** talk, praatje  
**Do not use:** field report, veldverslag, keynote, presentatie, sessie  
**See also:** [Speaker](#speaker), [Open Call](#open-call), [Edition](#edition)  

## Week in Twente Tech
*Context: Publicatie*

Een periodiek overzicht van wat er in de regio speelt, samengesteld uit de agenda en de Communities. Onderscheidt zich van de andere pillars doordat het niets nieuws beweert, alleen verzamelt.


---

## Example dialogues

Short exchanges showing the terms used precisely at concept boundaries.

### Talk tegenover Field Note

> **Ryan:** Kan iemand een **Field Note** komen geven op /001?
> **Redactie:** Nee. Op een **Edition** geef je een **Talk**, twaalf minuten gesproken. Een **Field Note** is geschreven en staat op de site.
> **Ryan:** En als iemand zijn Talk daarna opschrijft?
> **Redactie:** Dan is dat een tweede ding, geen omzetting. De **Talk** blijft in het archief van die **Edition** staan, en het geschreven stuk krijgt een eigen pillar.

### Host tegenover Partner

> **Ryan:** Code14 betaalt nu ook zes maanden mee. Zijn ze dan Partner geworden?
> **Redactie:** Ze zijn allebei. **Host** gaat over de zaal, **Partner** over de bijdrage. Wat niet verandert is R4: geen **Talk**-slot, geen deelnemerslijst, geen inspraak op het programma.

---

## ⚠ Flagged ambiguities

### field note

Drie betekenissen tegelijk in gebruik. (1) De pillar field-notes in content.config.ts, gedefinieerd als "één concrete les uit een lokaal systeem". (2) De naam van de nieuwsbrief op de homepage, "De field note", die alle pillars verstuurt en dus meer dekt dan de pillar. (3) Ryans uitspraak op 2026-09-04 dat field notes "echt de interviews met developers zijn", wat de betekenis van People Who Build is.

**Options:** Field Note = de pillar "één concrete les"; de nieuwsbrief krijgt een eigen naam, Field Note = koepel voor alles wat geschreven en gemaild wordt; de pillar "één concrete les" krijgt een nieuwe naam, Field Note = de interviews; People Who Build vervalt als aparte naam  
**Recommendation:** Optie 1. Het laat de vier pillars staan zoals ze zijn gebouwd en verzonden, en repareert de enige echte overlap: een nieuwsbrief die naar één van zijn vier pillars is vernoemd, belooft abonnees minder dan hij levert. Optie 3 valt af omdat Ryan People Who Build juist wil houden, en dan zijn het twee namen voor één ding.  

## Resolved ambiguities

- **field report** — Talk (Ryan, 2026-09-04, "de talks zijn talks, geen field reports"). Voorkomt in elf plekken in de site-copy en moet daar vervangen worden.
