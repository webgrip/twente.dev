# Contributing / Bijdragen

_English below / Nederlands eerst._

---

## Nederlands

twente.dev draait op bijdragen uit de community. Je hoeft geen developer te zijn om iets toe te
voegen — al helpt het wel, want alles staat in git.

### De makkelijke manier

Open een issue met een van de formulieren:

- **Event aanmelden** — openbaar toegankelijk en relevant voor developers · _verschijnt direct op de site_
- **Bedrijf toevoegen** — één vermelding per bedrijf · **wordt bewaard, nog niet gepubliceerd**

Wil je een verhaal, een field report of een zaal aanbieden? Dat loopt via de formulieren op
[bijdragen](https://twente.dev/nl/bijdragen), en niet via een issue.

Een maintainer zet het om in een pull request. Lees eerst de
[richtlijnen](https://twente.dev/nl/richtlijnen).

### De snelle manier

Voeg zelf het bestand toe en open een pull request:

| Wat       | Waar                                       | Status                     |
| --------- | ------------------------------------------ | -------------------------- |
| Event     | `src/content/events/<slug>.yml`            | live                       |
| Bedrijf   | `src/content/companies/<slug>.yml`         | **nog geen pagina**        |
| Community | een entry in `src/content/communities.yml` | **alleen met toestemming** |
| Artikel   | `src/content/posts/nl/<slug>.md`           | live                       |

Kopieer een bestaand bestand als startpunt. De bestandsnaam is de slug in de URL.

**Een community verschijnt pas als ze ja hebben gezegd.** `consent.granted` staat standaard op
`false`, dus een nieuwe entry is onzichtbaar tot iemand toestemming heeft vastgelegd — inclusief
`evidence` en `at`, zodat een ander het na kan lopen. Dat is geen formaliteit: op
[partners](https://twente.dev/nl/partners) staat zwart op wit dat we niemand zonder te vragen
vermelden. Meld bij voorkeur je eigen groep aan.

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

- **Submit an event** — open to the public and relevant to developers · _appears on the site straight away_
- **Add a company** — one entry per company · **queued, not yet published**

Want to offer a talk, a field report or a room? That goes through the forms on
[contribute](https://twente.dev/en/contribute), and not through an issue.

A maintainer converts it into a pull request. Read the
[guidelines](https://twente.dev/en/guidelines) first.

### The fast way

Add the file yourself and open a pull request:

| What      | Where                                     | Status                |
| --------- | ----------------------------------------- | --------------------- |
| Event     | `src/content/events/<slug>.yml`           | live                  |
| Company   | `src/content/companies/<slug>.yml`        | **no page yet**       |
| Community | an entry in `src/content/communities.yml` | **only with consent** |
| Article   | `src/content/posts/en/<slug>.md`          | live                  |

Copy an existing file as a starting point. The filename becomes the URL slug.

**A community appears only once it has said yes.** `consent.granted` defaults to `false`, so a new
entry is invisible until someone records consent — with `evidence` and `at` alongside it, so anyone
else can check the claim. This is not a formality: [partners](https://twente.dev/en/partners) states
in writing that we do not list anyone without asking. Preferably submit your own group.

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

---

## Licensing of what you send

Two licences apply here, and which one covers your contribution depends on where it lands.

**Code** — everything outside `src/content/` — is [Apache-2.0](LICENSE). Contributions come in
under the same terms, **inbound equals outbound**, which is what section 5 of that licence says by
default: anything you intentionally submit for inclusion is under this licence unless you
explicitly state otherwise. There is **no CLA to sign** and no copyright assignment. You keep the
copyright in what you wrote; what you grant is the Apache-2.0 licence over it, including the patent
grant.

**Content** in `src/content/` — events, jobs, company profiles, articles — is
[CC BY 4.0](LICENSE). By submitting it you agree to it being published under that licence, and you
keep the copyright in your own articles. Apache-2.0 is a software licence and the wrong instrument
for editorial prose, which is why the split exists.

Neither covers the **twente.dev name or marks**: section 6 of the Apache License grants no rights
in trade names or marks, deliberately, and the terms are in
[docs/brand/README.md](docs/brand/README.md) section 7.

Do not paste in work owned by an employer or another project unless its licence permits it and you
say which licence it came under. If you need different terms for a contribution, say so in the pull
request before it is reviewed.
