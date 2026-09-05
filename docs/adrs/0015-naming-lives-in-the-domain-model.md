# ADR 0015 – Naming decisions live in the domain model, not in this register

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-09-05
- **Tags**: Domain language, Documentation
- **Version**: 2.0.0

---

## Context and Problem Statement

The first version of this record argued a naming decision at length: what one evening is
called, what the write-up after it is called, and what the round-up of the wider region is
called. That was a category error. A decision register answers "why is it built this way";
a vocabulary answers "what do we call this". They rot differently, they are read by different
people at different moments, and only one of them can be enforced by a machine.

The practical cost showed up twice in a day. Two renames each left leftovers, because the
words lived in prose that nothing could check while `docs/domain/model.yaml` carried
`avoid` lists that nothing read.

## Considered Options

- Naming lives in the domain model; this register carries only architecture.
- Naming lives in the register, and the model mirrors it.
- Naming lives in both, kept in sync by hand.

## Decision Outcome

### Chosen Option

**The domain model owns the vocabulary.** `docs/domain/model.yaml` carries the terms, the
per-term `avoid` lists, a `retired` list of words that are gone everywhere with the word that
replaces them and the reason, and rules R14 and R15 stating the naming and the procedure. The
generated glossary renders it for humans; `claims.test.ts` reads the same file and fails CI on
any surviving use.

This register keeps decisions with an architectural blast radius: a cadence that changes what
CI checks and what hosts are asked for, a platform choice, a deploy target.

### Rejected options and why

- **Naming in the register.** A register is append-only by design, so a vocabulary kept there
  can only grow a trail of superseded words. That is the opposite of what a glossary is for.
- **Both, synced by hand.** Two sources of truth for the same words, which is the failure this
  decision exists to end.

### Consequences

- Good, because the vocabulary now has one home, and that home is machine-readable.
- Good, because a retired word is enforced rather than remembered: put it on the list, CI
  hands you the cleanup.
- Bad, because the reasoning behind a name is now further from the reader who only browses
  the register. The glossary carries it instead.
- Neutral, because the number of records does not change; the content moved.

## Confirmation

- `docs/domain/model.yaml` contains R14 (the names) and R15 (retire first, then clean), and a
  `retired` list where every entry carries `use` and `because`.
- `pnpm test` fails when a retired word appears anywhere outside that list.
- No record in `docs/adrs/` argues a naming decision.

## More Information

- 2026-09-04 — the naming was first argued here, then moved.
- 2026-09-05 — this record was rewritten to state where naming belongs. Its first version had
  not left the repo in a form anyone had acted on, so it was corrected rather than superseded.
- Refines [ADR 0014](0014-monthly-releases.md), which keeps the cadence decision.
