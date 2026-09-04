# Domain Events — twente.dev

*Generated from `model.yaml` — do not edit by hand.*

## EditionAnnounced

Datum, stad en venue worden publiek.

**Concerns:** Edition  
**Triggers:** De Open Call kan de deur uit en de persoonlijke sprekervragen worden verstuurd.  

## RegistrationOpened

Het aanmeldkanaal gaat open.

**Concerns:** Edition  
**Triggers:** Het aanmeldgetal wordt het bewijsmateriaal in spreker- en partnervragen.  

## SpeakerConfirmed

Een Speaker bevestigt de datum.

**Concerns:** Speaker  
**Triggers:** De naam mag op de site (R5) en het is een eigen aankondigingsmoment.  

## EditionHeld

De avond heeft plaatsgevonden.

**Concerns:** Edition  
**Triggers:** Bedankmail naar Speakers binnen drie dagen, verslag binnen tien werkdagen.  
