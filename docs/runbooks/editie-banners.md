# Editie-banners maken (en waarom ze zichzelf vernieuwen)

Elke editie krijgt social-graphics uit één template:
[`docs/brand/templates/banners.html`](../brand/templates/banners.html), geëxporteerd
met `node scripts/export-banners.mjs` naar `public/brand/social/`. Geen losse
Figma-bestanden, geen versies op iemands laptop — het template is de bron en de
export is reproduceerbaar.

## Het principe: chassis + wisselstuk

- **Het chassis is constant**: randbalk, lockup, mono-onderregel, palet. Daardoor
  is elke banner herkenbaar als twente.dev, ook als de graphic per editie wisselt.
- **Het wisselstuk is per editie uniek**: één grafisch blok dat verandert. Voor
  /001 is dat het statusbord (systemd-register, met de sprekers). Voor /002 kies
  of bouw je een nieuw blok — de behandelcatalogi (Vaandels-designdocumenten)
  zijn de onderdelenbak, en een nieuw idee is één extra `.art`-blok in het
  template.
- **De vaste set vernieuwt zichzelf**: de omloopkaart (noaberschap-kaart) en het
  statusbord lezen álles uit het `EDITIE`-blok bovenin het template — nummer,
  thema, stad, venue, datum, sprekers, plekken én de kaartcoördinaten van de
  editie-stad. De rode knoop verspringt dus vanzelf naar de nieuwe stad; de
  generieke banner is daarmee ook stille campagne voor de actuele editie.

## De set

| Bestand                               | Wat                                                                                                                    | Wanneer verversen                                                   |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `banner-omloop-{nacht,dag}-{nl,en}-…` | generieke headers: echte geografie, draden tussen de twentse kernen, gestippelde noaberdraden naar de NL-buren (klein) | bij elke nieuwe editie (knoop verspringt)                           |
| `banner-commitlog-…`                  | generieke header: echt-saaie commits, één eerlijke echte hash                                                          | zelden — alleen als de log-inhoud veroudert                         |
| `banner-NNN-statusbord-…`             | de editie-announce: `systemctl status editie@NNN` met beide sprekers                                                   | zodra beide sprekers bevestigd zijn (T−4)                           |
| `banner-meetup[-NNN][-nacht]-…`       | de covers uit `cover-16x9.html`, in licht én nacht                                                                     | per editie: tekst in de template bijwerken (contenteditable-velden) |
| `banner-vertrekbord[-nacht]-…`        | LinkedIn-bedrijfspagina: ticker met de waarborgen en de rode editie-regel                                              | bij elke nieuwe editie (regel verspringt mee)                       |

## Wat upload je waar

| Platform                       | Bestand                                        | Opmerking                                                                                                                                                                                                                     |
| ------------------------------ | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| X — header                     | `banner-omloop-nacht-nl-1500x500@2x.png`       | of `-en` / `-dag` naar smaak; één 3:1-bestand dient X, Bluesky én Mastodon                                                                                                                                                    |
| Bluesky — banner               | zelfde 3:1-bestand                             | avatar overlapt linksonder — daarom is die hoek leeg                                                                                                                                                                          |
| Mastodon — header              | zelfde 3:1-bestand                             |                                                                                                                                                                                                                               |
| LinkedIn — persoonlijk profiel | `banner-omloop-{dag,nacht}-nl-1584x396@2x.png` | 4:1; compositie rechts omdat je profielfoto links staat                                                                                                                                                                       |
| LinkedIn — bedrijfspagina      | `banner-vertrekbord[-nacht]-1128x191@2x.png`   | 5.9:1 vertrekbord-ticker; de rode regel (editie + registratie) komt uit het `EDITIE`-blok. Linksonder blijft leeg: het paginalogo overlapt daar de banner (x ≈ 60–290 van het 1128-ontwerp) — lockup staat daarom rechtsonder |
| Meetup — groepsfoto            | `banner-omloop-dag-nl-1200x675@2x.png`         | de event-cover per editie is `banner-meetup-NNN[-nacht]-…` (licht en donker beschikbaar)                                                                                                                                      |
| Discord — serverbanner         | `banner-omloop-nacht-nl-1200x675@2x.png`       | 16:9                                                                                                                                                                                                                          |
| Facebook — paginacover         | `banner-omloop-dag-nl-820x462@2x.png`          | alles wezenlijks staat in het mobiel-veilige midden                                                                                                                                                                           |
| YouTube — kanaalkunst          | — nog te bouwen                                | 2560×1440 met veilige strook; ontwerp wacht op keuze                                                                                                                                                                          |
| Announce-post (alle kanalen)   | `banner-NNN-statusbord-…`                      | geen header maar een post-afbeelding: 16:9 voor feeds, 4:1 voor LinkedIn, 3:1 als tijdelijke header in campagnetijd                                                                                                           |

## Nieuwe editie, stap voor stap

1. Open `docs/brand/templates/banners.html` en werk het `EDITIE`-blok bij:
   nummer, thema, stad, venue, datum, tijd, plekken, sprekers en
   `knotLat`/`knotLon` van de editie-stad. Sprekers nog niet rond? Laat de
   placeholders staan en exporteer het statusbord pas bij T−4 — een announce
   met TBA is geen announce.
2. Kies of bouw het wisselstuk voor deze editie (nieuw `.art`-blok; geef het een
   `data-export`-naam met het editienummer erin).
3. `node scripts/export-banners.mjs` — exporteert álle banners (banners.html
   én de meetup-covers uit cover-16x9.html); de bestanden landen in
   `public/brand/social/` onder de bestaande naamconventie
   (`banner-…-1500x500@2x.png` voor 3:1, `…-1200x675@2x.png` voor 16:9).
4. Controleer de kaart even op labelbotsingen (steden staan op echte
   coördinaten en mogen nooit verschoven worden; alleen label-offsets in de
   `TOWNS`-tabel zijn instelbaar).
5. Zet de nieuwe statusbord-banner op de kanalen waar de editie aangekondigd
   wordt; de omloopkaart-set is de rustige standaard voor de profielheaders
   (NL en EN naar gelang het kanaal).

Huisregels blijven gelden: rood alleen voor verbindingen, data en acties (de
knoop, de editieregel, de cursor); wordmark nooit opnieuw zetten (het template
gebruikt de outlines); geen uitroeptekens; twente.dev met kleine letters. Twee
compositieregels uit de review van 2026-09-01: op terminal-banners staat de
lockup gróót rechtsonder met de titelregel erboven, en de separator in
footer-regels is altijd `//`, nooit een enkele `/` — dus
`twente.dev // we build it. we run it. we share it.`
