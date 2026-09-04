# ADR 0015 – The evening is a Release, and the vocabulary moves into the release register

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-09-04
- **Tags**: Domain language, Brand, Content
- **Version**: 1.0.0

---

## Context and Problem Statement

[ADR 0014](0014-monthly-editions-and-the-language-that-follows.md) fixed the cadence at one
evening on the first Wednesday of every month and cleaned "flagship" out of the vocabulary.
It left the nouns themselves untouched, and those nouns were the weak part.

"Edition" said only that another one follows, which is exactly what a number already says.
It carried no meaning that `twente.dev/001` did not already carry, and it forced a
translation seam: _editie_ in Dutch, _edition_ in English, two labels for one concept on a
site whose i18n is typed so that every key exists twice.

Two dependent names were worse. The write-up after an evening had just been named
_Editieverslag_, a compound that explains itself and does nothing else. And the regional
round-up was called _Week in Twente Tech_, a name that promises a weekly cadence nobody has
committed to, on a site whose newsletter explicitly promises no fixed cadence.

## Decision Drivers

- The audience builds technology; the register they already think in is free legibility.
- Every public noun costs twice on a bilingual site, so a word that is identical in Dutch and
  English is worth more than a word that is merely accurate.
- A name must not promise a frequency the project has not committed to.
- The code should speak the same words as the site, which is why `isFlagship` became
  `isOwnRelease` in 0014.

## Considered Options

- Release / Release notes / Upstream, and carry it into the code.
- Uitgave–Issue with Verslag–Report: the periodical frame.
- Avond–Evening with Log: the plainest option, using the word the site already used.
- Keep Edition and rename only the write-up.

## Decision Outcome

### Chosen Option

**Release.** `twente.dev/001` is a Release. The first Wednesday of the month is a release
train. "We build it. We run it. We share it." lands on it without explanation, and the word
is spelled the same in both languages.

**Release notes** is what appears afterwards: the slides, the photos, what worked and what
did not. **Upstream** replaces Week in Twente Tech: it collects what is happening around
twente.dev, it names no frequency, and it is accurate about the direction of the
relationship, since twente.dev branches off the existing communities rather than the other
way round.

Carried into the code, because the code speaks the site's words: `EDITION_001` is
`RELEASE_001`, `editionName` is `releaseName`, `EditionPage.astro` is `ReleasePage.astro`,
the route key `edition001` is `release001`, the i18n keys `edition.*` are `release.*`, and
the pillar slugs are `field-reports`, `release-notes` and `upstream`. The public URLs
`/nl/001` and `/en/001` do not change.

One occurrence was deliberately not renamed. On the privacy pages "elke editie" meant every
newsletter issue, not every evening. With Release in play that word would carry two
meanings, so it now reads "elke mail" and "every email".

### Rejected options and why

- **Uitgave / Issue.** Discipline-neutral and correct, but it needs two different words in
  the two locales, and a periodical frame invites the frequency question this ADR is trying
  to close.
- **Avond / Evening with Log.** Warmest and plainest, and the site already used "de avond".
  Rejected because a common noun cannot be searched for, quoted or defended: "come to our
  evening" has no edges, "twente.dev/001 is our first release" does.
- **Keep Edition, rename only the write-up.** Cheapest, and it leaves the weakest word at the
  centre of the vocabulary.

### Consequences

- Good, because one word covers both locales, so a label no longer has to be invented twice.
- Good, because Upstream names a real relationship instead of a schedule, which removes a
  promise the project never made.
- Good, because the code and the copy now use the same nouns, so a contributor reading either
  one arrives at the same vocabulary.
- Bad, because "release" is software-flavoured on an evening that deliberately includes
  manufacturing, design, research and education. It was chosen with that objection on the
  table.
- Bad, because ADR 0014, written the same day, uses "Edition" throughout and now reads in an
  older vocabulary. It stays as written.
- Neutral, because the public URLs are unchanged, so nothing that has been shared breaks.

## Confirmation

- `grep -rn "\bedition\b\|editie" src` returns only the mail pipeline's own internal
  identifiers, and nothing in `src/pages`, `src/templates` or `src/i18n`.
- `pnpm typecheck` passes, which proves the route key rename reached every caller, since
  `RouteKey` is a union of the keys in `src/i18n/routes.ts`.
- `pnpm test` passes, including the claims guard whose `literal release fact` rule builds its
  pattern from `RELEASE_001`.
- `docs/domain/model.yaml` carries Release, Release notes and Upstream, with `editie`,
  `edition`, `editieverslag` and `week in twente tech` on the matching `avoid` lists.

## More Information

- 2026-09-04 — cadence and "flagship" settled in [ADR 0014](0014-monthly-editions-and-the-language-that-follows.md).
- 2026-09-04 — Field Report corrected to what it is: an interview twente.dev conducts and
  writes up, which removed a contribution route that invited people to write their own
  (`860b981`).
- 2026-09-04 — Open Call dropped as a pillar and the edition write-up first named
  (`a6373e0`), then renamed with the rest of the vocabulary (`98c56ed`).
- 2026-09-04 — vocabulary carried into the model, the copy and the code (`98c56ed`).
- Refines [ADR 0014](0014-monthly-editions-and-the-language-that-follows.md), which stays
  Accepted: the cadence decision holds, only the nouns change.
