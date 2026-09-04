# ADR 0014 – Editions are monthly, and the vocabulary drops "flagship"

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-09-04
- **Tags**: Product, Domain language, Content
- **Version**: 1.0.0

---

## Context and Problem Statement

[ADR 0008](0008-playbook-first-launch-scope.md) built the launch scope around numbered
flagship events and did not fix how often they run. The site filled that gap with
"een paar keer per jaar", repeated on six surfaces in two languages, while the domain
model already carried R10: an Edition falls on the first Wednesday of the month. The
product therefore promised one cadence in its copy and a different one in its own
model, and nobody had to reconcile them because neither was enforced.

The word "flagship" made that worse. It only means something next to a lesser tier,
and there is no lesser tier: there is one kind of evening. As long as the site ran a
handful a year the word was merely imprecise. At twelve a year it is wrong, and it
was load-bearing in the press boilerplate that journalists copy verbatim.

Two smaller promises hung off the same thread and were never delivered: an edition
report with a financial summary, promised in the partner compact and on /over in both
languages, and a Host logo promised by R4 with nowhere on the site to render one.

## Decision Drivers

- The public cadence and the domain model must state the same thing, because the model
  is what the next contributor reads.
- Press boilerplate is copied verbatim; a wrong word there outlives its correction.
- A promise nobody can point at is worse than no promise, on a site whose only asset is
  being checkable.
- `docs/plan/nu-te-doen.md` records the opposite intent toward the venue host: name three
  editions publicly, not twelve.

## Considered Options

- Monthly, first Wednesday, and drop "flagship" from the vocabulary.
- Keep "a few times a year" and correct R10 in the model instead.
- Keep both cadences: monthly rhythm internally, "a few times a year" publicly.

## Decision Outcome

### Chosen Option

**Monthly, on the first Wednesday, and "flagship" leaves the vocabulary.** The site now
says so on the homepage hero, on /over, /pers and /bedrijven, and in both locales. The
model already said it; the copy caught up rather than the other way round.

"flagship" moved from a synonym of Edition to its `avoid` list, and out of every live
surface: the press pages, the two open calls, the partner compact, the README, the
brand and plan docs, the tag on the events entry, and the code identifiers
(`isFlagship` became `isOwnEdition`). ADRs 0008, 0009 and 0010 keep the word, because a
decision register that is rewritten to match the present is no longer a register.

Three consequences of monthly were settled in the same pass and live in
`docs/domain/model.yaml`:

- **The number travels.** If R6 moves an Edition to the next month, the number moves
  with it and the sequence stays unbroken. A skipped number would leave a hole in the
  Archief that nobody could explain a year later.
- **Venue split from Host.** Code14 is currently both the organisation and the room.
  Monthly rotation guarantees they come apart, so a Host is an organisation that gets
  named and a Venue is a room with a name, an address and a city.
- **Slot became a term.** The evening has two Slots; a Talk exists only once a Speaker
  has confirmed. R6 now counts filled Slots.

The financial summary is withdrawn. The public report after each edition stays, including
what did not work; the money line does not. It is removed from the partner compact and
from all four pages that carried it. R4's logo promise is now renderable:
`EDITION_001.venueLogo` points at a file under `public/brand/hosts/`, and stays `null`
until the file exists.

### Rejected options and why

- **Keep "a few times a year" and correct R10.** Cheapest edit, wrong direction. The
  rhythm is the product: a date people can compute themselves and keep free is the thing
  a regional community can attach to, and "a few times a year" gives them nothing to hold.
- **Two cadences, one internal and one public.** Guarantees the split that caused this
  ADR. The next contributor reads the model, writes copy from it, and ships a claim the
  site contradicts two pages later.

### Consequences

- Good, because the model and the site now state one cadence, and a reader can derive the
  next date without being told.
- Good, because press boilerplate no longer carries a word that implies a tier that does
  not exist.
- Good, because the promises that survive are the ones that can be pointed at.
- Bad, because twelve rooms a year is a materially larger ask of hosts than three, and
  /bedrijven now says so out loud. The host conversation with Code14 was prepared on the
  opposite premise and has to be re-opened.
- Bad, because withdrawing the financial summary removes the one number that made "na te
  rekenen" literally true. What remains is a qualitative report.
- Neutral, because R9 is unaffected: a host is still named for a finite number of
  editions, and that number is whatever was actually committed.

## Confirmation

- `pnpm test` fails on any literal edition date, time span, city or address outside
  `src/config/site.ts` in `src/pages`, `src/templates` or `src/i18n` (rule
  `literal edition fact` in `src/lib/claims.test.ts`), and on any disagreement between
  `src/content/events/twente-dev-001-reconnect.yml` and `EDITION_001`.
- `grep -rn flagship src docs README.md` returns hits only under `docs/adrs/`.
- `python3 .../domain-language/scripts/health_check.py docs/domain/model.yaml` reports
  the Edition term with `flagship` under `avoid`, and terms Venue, Slot, Kanaal and
  Wachtlijst present.
- The rendered hero on `/nl` and `/en` names the first Wednesday of the month.

## More Information

- 2026-09-04 — cadence changed from "a few times a year" to monthly across six surfaces
  in both locales (`2b21ff6`).
- 2026-09-04 — R2 and R8 audited against the model and repaired; the literal-fact guard
  and the events-entry agreement test added (`c2dab7a`, `4a7d16f`).
- 2026-09-04 — Venue promoted to its own term, `flagship` moved to `avoid`, the number
  confirmed to travel with a moved Edition (`6846d83`).
- 2026-09-04 — `flagship` removed from live copy, docs and code identifiers; the host
  logo slot added (`b54abd8`).
- 2026-09-04 — Kanaal, Wachtlijst and Slot added; the community directory now excludes
  twente.dev's own channels (`cd92ca0`).
- Refines [ADR 0008](0008-playbook-first-launch-scope.md), which stays Accepted: the
  launch scope holds, this fixes only the cadence it left open and the word it used.
- Constrains [ADR 0012](0012-meetup-for-registration.md): the Meetup group now carries a
  monthly series rather than an occasional one.
- `docs/plan/nu-te-doen.md` still instructs the host conversation to name three editions
  publicly. That instruction is now contradicted by the site and needs a human decision.
