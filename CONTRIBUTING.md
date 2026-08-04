# Contributing / Bijdragen

_English below / Nederlands eerst._

---

## Nederlands

twente.dev draait op bijdragen uit de community. Je hoeft geen developer te zijn om iets toe te
voegen — al helpt het wel, want alles staat in git.

### De makkelijke manier

Open een issue met een van de formulieren:

- **Vacature plaatsen** — alleen als werkgever, niet als bureau
- **Event aanmelden** — openbaar toegankelijk en relevant voor developers
- **Bedrijf toevoegen** — één vermelding per bedrijf

Een maintainer zet het om in een pull request. Lees eerst de
[richtlijnen](https://twente.dev/nl/richtlijnen).

### De snelle manier

Voeg zelf het bestand toe en open een pull request:

| Wat       | Waar                                       |
| --------- | ------------------------------------------ |
| Vacature  | `src/content/jobs/<bedrijf>-<functie>.yml` |
| Event     | `src/content/events/<slug>.yml`            |
| Bedrijf   | `src/content/companies/<slug>.yml`         |
| Community | een entry in `src/content/communities.yml` |
| Artikel   | `src/content/posts/nl/<slug>.md`           |

Kopieer een bestaand bestand als startpunt. De bestandsnaam is de slug in de URL.

**Alles wat tweetalig is, moet in beide talen.** Heb je maar één taal? Zet die tekst dan in beide
velden — een eerlijke duplicaat is beter dan een lege pagina, en het is zichtbaar in review.

**Datums krijgen altijd een expliciete offset**: `2026-09-10T19:00:00+02:00`, niet `2026-09-10 19:00`.

Draai voor het openen van je PR:

```bash
just content
just build
```

### Artikelen

Artikelen zijn taal-eigen: je schrijft in één taal. Een vertaling is een apart bestand in de andere
map met dezelfde `translationKey`. Bestaat een artikel maar in één taal, dan toont de site dat gewoon
— **machinevertalingen zonder review komen er niet in**.

---

## English

twente.dev runs on community contributions. You do not need to be a developer to add something —
though it helps, because everything lives in git.

### The easy way

Open an issue using one of the forms:

- **Submit a job** — as the employer only, not as an agency
- **Submit an event** — open to the public and relevant to developers
- **Add a company** — one entry per company

A maintainer converts it into a pull request. Read the
[guidelines](https://twente.dev/en/guidelines) first.

### The fast way

Add the file yourself and open a pull request:

| What      | Where                                     |
| --------- | ----------------------------------------- |
| Job       | `src/content/jobs/<company>-<role>.yml`   |
| Event     | `src/content/events/<slug>.yml`           |
| Company   | `src/content/companies/<slug>.yml`        |
| Community | an entry in `src/content/communities.yml` |
| Article   | `src/content/posts/en/<slug>.md`          |

Copy an existing file as a starting point. The filename becomes the URL slug.

**Anything bilingual needs both languages.** Only have one? Put that text in both fields — an honest
duplicate beats an empty page, and it is visible in review.

**Dates always carry an explicit offset**: `2026-09-10T19:00:00+02:00`, not `2026-09-10 19:00`.

Before opening your PR:

```bash
just content
just build
```

### Articles

Articles are locale-owned: you write in one language. A translation is a separate file in the other
directory sharing the same `translationKey`. If an article exists in only one language the site says
so plainly — **machine translations without human review are not accepted**.

---

## Code

Set up with [mise](https://mise.jdx.dev) and [just](https://just.systems):

```bash
mise install    # Node 24 + just
just setup      # corepack enable + pnpm install
just check      # the same gates CI runs
```

Conventional commits. CI runs format, lint, typecheck, knip, unit tests, content validation and a
build; all of them block on `main`. Every push gets a preview URL.

Note that `pnpm typecheck` is also the i18n gate: adding a UI string to `nl` without adding it to
`en` is a type error, by design.
