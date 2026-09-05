# ADR 0014 – Releases run monthly, on the first Wednesday

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-09-05
- **Tags**: Product, Content, Operations
- **Version**: 2.0.0

---

## Context and Problem Statement

[ADR 0008](0008-playbook-first-launch-scope.md) built the launch scope around numbered
evenings and did not fix how often they run. The site filled that gap on its own with "een
paar keer per jaar", repeated across six surfaces in two languages, while
`docs/domain/model.yaml` already carried R10: one falls on the first Wednesday of the month.
The product therefore promised one cadence in its copy and a different one in its own model,
and nothing forced the two to agree.

`docs/plan/nu-te-doen.md` pushed a third number: tell the venue host that three are named
publicly, not twelve.

## Decision Drivers

- The public cadence and the domain model have to state the same thing, because the model is
  what the next contributor reads.
- A rhythm anyone can compute for themselves is a date they can keep free.
- Press boilerplate is copied verbatim, so a wrong number there outlives its correction.

## Considered Options

- Monthly, on the first Wednesday.
- Keep "a few times a year" and correct R10 in the model instead.
- Keep both: a monthly rhythm internally, "a few times a year" publicly.

## Decision Outcome

### Chosen Option

**Monthly, on the first Wednesday.** The site says so on the homepage hero, on /over, /pers
and /bedrijven, in both locales. The model already said it; the copy caught up rather than
the other way round.

The naming that came out of the same conversation is deliberately **not** recorded here. What
an evening is called is domain language, not architecture, so it lives in
[`docs/domain/model.yaml`](../domain/model.yaml) as R14 and R15, with the reasoning next to
the terms it governs and a machine-readable `retired` list that CI enforces.

### Rejected options and why

- **Keep "a few times a year" and correct the model.** Cheapest edit, wrong direction. The
  rhythm is the product: a date people can compute and keep free is what a regional community
  attaches to, and a vague frequency gives them nothing to hold.
- **Two cadences, one internal and one public.** Guarantees the split that caused this record.
  The next contributor reads the model, writes copy from it, and ships a claim the site
  contradicts two pages later.

### Consequences

- Good, because the model and the site state one cadence, and a reader can derive the next
  date without being told.
- Good, because the promises that survive are the ones anyone can point at.
- Bad, because twelve rooms a year is a materially larger ask of hosts than three, and
  /bedrijven now says so out loud. The host conversation was prepared on the opposite premise
  and has to be re-opened.
- Neutral, because R9 is unaffected: a host is still named for a finite number, and that
  number is whatever was actually committed.

## Confirmation

- `pnpm test` fails on any literal date, time span, city or address of the current release
  outside `src/config/site.ts` and the events entry, and on any disagreement between the two.
- The rendered hero on `/nl` and `/en` names the first Wednesday of the month.
- `docs/domain/model.yaml` R10 and the site copy agree, checked by reading both.

## More Information

- 2026-09-04 — cadence changed from "a few times a year" to monthly across six surfaces in
  both locales (`2b21ff6`).
- 2026-09-05 — this record was cut back to the cadence decision. Its first version also
  carried the naming decision, which is domain language and belongs in the model; that half
  now lives in `docs/domain/model.yaml` R14 and R15. The record had not left the repo in a
  form anyone had acted on, so it was corrected rather than superseded.
- Refines [ADR 0008](0008-playbook-first-launch-scope.md), which stays Accepted: the launch
  scope holds, this fixes only the cadence it left open.
- Constrains [ADR 0012](0012-meetup-for-registration.md): the Meetup group now carries a
  monthly series rather than an occasional one.
- `docs/plan/nu-te-doen.md` still instructs the host conversation to name three publicly.
  That instruction is contradicted by the site and needs a human decision.
