# Entities — twente.dev

*Generated from `model.yaml` — do not edit by hand.*

## Release
*Context: Editie*

Eén genummerde avond, van datumbesluit tot gepubliceerd verslag.

| Attribute | Type | Required | Description |
|---|---|---|---|
| `number` | `string` | yes | Drie cijfers, permanent. Vormt de URL en de naam. |
| `theme` | `string` | yes | Eén woord dat de avond typeert, bijvoorbeeld Reconnect. |
| `date` | `datetime` | yes | Doorgaans de eerste woensdag van de maand. Let op de winter/zomertijdovergang. |
| `capacity` | `int` | yes | Wat de zaal echt kan, niet wat we hopen. |
| `venue` | `Venue` | yes | De zaal van deze avond. Kan per Release wisselen. |
| `slots` | `Slot[]` | yes | Er zijn er altijd twee. Gevuld of leeg, nooit meer of minder. |

**Relationships**
- has_many **Talk** — Twee bij een volwaardige Release, nul bij een lichte avond.
- references **Host** — De organisatie die de zaal levert.

**Lifecycle**

```mermaid
stateDiagram-v2
    [*] --> Gepland : Datum en zaal vastgelegd, collision-check gedraaid
    Gepland --> Aangekondigd : Datum en venue publiek op de site
    Aangekondigd --> Aanmelden_open : Registration-kanaal live gezet
    Aanmelden_open --> Programma_rond : Twee Speakers bevestigd (R6)
    Programma_rond --> Gehouden : De avond zelf
    Gehouden --> Gearchiveerd : Release notes gepubliceerd, binnen tien werkdagen
```

## Talk
*Context: Editie*

Ongeveer een halfuur gesproken, één claim, één voorbeeld, één vraag.

| Attribute | Type | Required | Description |
|---|---|---|---|
| `claim` | `string` | yes | Een precieze stelling, geen onderwerplabel. |
| `example` | `string` | yes | Het besluit, de mislukking of het resultaat dat de claim toetsbaar maakt. |
| `question` | `string` | yes | Het onopgeloste deel waar de zaal bij kan helpen. |

**Relationships**
- belongs_to **Speaker** — Precies één Speaker per Talk.
- belongs_to **Release**

## Host
*Context: Editie*

De organisatie die de zaal levert, onder de waarborgen van R4.

| Attribute | Type | Required | Description |
|---|---|---|---|
| `organisation` | `string` | yes |  |
| `editionsCommitted` | `int` |  | Het aantal edities dat publiek is toegezegd. Eindig, en hoogstens wat de host werkelijk heeft toegezegd. |

**Relationships**
- has_many **Release** — Een Host kan meerdere Releases achter elkaar leveren.
- has_one **Venue** — De ruimte die de Host beschikbaar stelt.

## Venue
*Context: Editie*

De ruimte waar een Release gehouden wordt.

| Attribute | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes | Hoe de plek heet in de zaal en op de kaart. |
| `address` | `string` | yes | Staat op de editiepagina, want mensen boeken er reizen op. |
| `city` | `string` | yes | Een van de gemeenten uit Twente. |

**Relationships**
- has_many **Release** — Een Venue kan meerdere Releases herbergen.

## Slot
*Context: Editie*

Een van de twee programmaplaatsen van een Release.

| Attribute | Type | Required | Description |
|---|---|---|---|
| `position` | `int` | yes | 1 of 2. Bepaalt de volgorde op de avond. |
| `talk` | `Talk` |  | Leeg tot een Speaker de datum bevestigd heeft. |

**Relationships**
- has_one **Talk** — Een gevuld Slot draagt precies een Talk.

## Speaker
*Context: Editie*

Degene die een Talk geeft.

| Attribute | Type | Required | Description |
|---|---|---|---|
| `name` | `string` | yes |  |
| `affiliation` | `string` |  | Waar iemand bouwt. Een bedrijf, lab of school, geen functietitel. |
| `confirmedAt` | `datetime` |  | Leeg betekent niet publiceren (R5). |

**Relationships**
- has_one **Talk**
