# Wat buiten deze repo leeft

Niet alles van twente.dev staat in git. Decks, de outreach-administratie en een paar plannen
staan bewust elders, meestal omdat ze contactgegevens bevatten of omdat het binaire bestanden
zijn die niemand in een diff leest. Zonder dit overzicht zijn ze niet terug te vinden en niet
opnieuw te bouwen.

De regel die overal geldt: **wat hier staat is een deliverable, geen bron.** Pas het aan via
zijn generator, niet met de hand, anders is de volgende build je wijziging kwijt.

## Google Drive

Alles staat in `My Drive/twente.dev/` in het **ryan@webgrip.nl**-account. Let op: de
claude.ai Drive-connector hangt aan `r.grippeling@code14.nl` en ziet dat account dus niet. Wat
er ligt komt via desktop-sync binnen.

| Wat                                 | Bestanden                                                                                                                                                                                                                                                    | Bron                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| **Dekkenkit** (2026-08-30)          | vijf doeldecks, genummerd `twente-dev-01` tot `-05`: event-opening (EN), zelf een release hosten (NL), de onderwijsbrug (NL), het field-reportsjabloon (EN) en een korte intro (NL). Plus `themes/twente-dev-slide-library.pptx` (97 dia's, 10 hoofdstukken) | python-pptx-builder; merkregels zitten afgedwongen in `brandkit.py` |
| **Positioneringsdeck** (2026-08-30) | het deck bij het frame uit de sectie hieronder                                                                                                                                                                                                               | eigen builder                                                       |
| **Outreach-tracker**                | `twente-dev-outreach-tracker.xlsx`: Start · Keuzelijsten · Contacten (74 organisaties) · Sprekers (30) · Agenda · Bezwaar · Bronnen                                                                                                                          | met de hand bijgehouden                                             |

**De dekkenkit pas je aan door het contentbestand te bewerken en de builder opnieuw te draaien**,
niet door de pptx te verbouwen. De merkregels die de builder afdwingt: rood alleen voor
verbindingen, data en acties; Red Light voor rode tekst op inkt; het woordmerk alleen als PNG;
geen uitroeptekens; `twente.dev` in kleine letters. Merkassets komen uit
[`brand/png/`](brand/png/).

**De outreach-tracker is met opzet geen CRM.** Bij ongeveer 74 rijen wordt elk CRM een tweede
systeem dat niemand bijhoudt. De harde eis is niet functionaliteit maar _wissen_: iemand moet
echt verwijderd kunnen worden terwijl het bezwaaradres permanent blijft. Dat sluit opslag in git
uit, want git-historie maakt verwijdering onafdwingbaar — hetzelfde argument dat op de
privacypagina staat. De kolom "Mag ik mailen?" codeert de twee-touch-regel én de eis van een
bron-URL uit artikel 14(2)(f) AVG; rood betekent niet versturen. Het tabblad Bezwaar wordt nooit
geleegd. Sprekerbeheer verhuist vanaf /002 naar zelfgehoste
[pretalx](https://pretalx.com/) (Apache-2.0), niet naar dit bestand.

## In de repo, maar buiten git

`media/` staat in `.gitignore` en houdt de outreach-drafts en doelwitlijsten, inclusief namen en
routes. Contactdata hoort daar en nergens anders. De verzendregel staat bovenaan elk
draftbestand en is niet onderhandelbaar: de eigenaar verstuurt zelf, met de hand, op elk kanaal
met een verzendknop.

## Plannen die als artifact bestaan

Het LinkedIn-lanceerplan "De eerste veertig" (2026-09-02) staat als artifact op
[claude.ai](https://claude.ai/code/artifact/1ddb9da4-5de0-4355-abc6-6e601f90f33e) en bevat de
volgorde van de paginalancering plus kopieerbare postdrafts. Bij vervolgvragen over promotie
werk je dat artifact bij in plaats van een nieuw plan te maken.

Let op de spanning met [`kpis.md`](kpis.md): dat plan noemt veertig aanmeldingen als doel,
terwijl de geratificeerde norm voor /001 in K1 twintig gevulde stoelen van de veertig is. De
KPI is leidend; het lanceerplan is een middel.

## Positionering

Het frame, gekozen 2026-08-30 na een adversariële sessie: **"de enige stack-agnostische
developer-meetup in Twente"**. Onderbouwd met een geverifieerd kerkhof — elke stack-agnostische
Twentse dev-meetup ligt stil sinds uiterlijk februari 2024; wat leeft is single-company
(Baseflow), procesgericht (Agile Meetup) of maker (TkkrLab).

De propositie in vier delen: een neutrale operator die zelf senior engineer is, hart voor open
source, de brug naar studenten en onderwijsinstellingen, en een blijvend archief voor de regio.

**Wat je daarmee niet mag claimen.** "Dé community van Twente", met bepaald lidwoord, is in die
sessie afgewezen als de generieke faalvorm. "Eerste AI-meetup" en "eerste onafhankelijke
techinstelling" zijn bezet door Baseflow en TkkrLab. En de site belooft nooit meer dan één
persoon kan waarmaken. Leg nieuwe copy en pitches langs dit frame; de toon en de frasen staan in
[`brand/copy-voice.md`](brand/copy-voice.md).
