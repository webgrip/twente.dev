# Domain Events — twente.dev

*Generated from `model.yaml` — do not edit by hand.*

## ReleaseAnnounced

Datum, stad en venue worden publiek.

**Concerns:** Release  
**Triggers:** De Open Call kan de deur uit en de persoonlijke sprekervragen worden verstuurd.  

## RegistrationOpened

Het aanmeldkanaal gaat open.

**Concerns:** Release  
**Triggers:** Het aanmeldgetal wordt het bewijsmateriaal in spreker- en partnervragen.  

## SpeakerConfirmed

Een Speaker bevestigt de datum.

**Concerns:** Speaker  
**Triggers:** De naam mag op de site (R5) en het is een eigen aankondigingsmoment.  

## ReleaseHeld

De avond heeft plaatsgevonden.

**Concerns:** Release  
**Triggers:** Bedankmail naar Speakers binnen drie dagen, verslag binnen tien werkdagen.  
