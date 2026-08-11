# ADR 0008 – Launch scope follows the strategy playbook: community platform first, flagship event at the centre

- **Status**: Proposed
- **Deciders**: Ryan Grippeling
- **Date**: 2026-08-11
- **Tags**: Scope, Strategy, Brand, Product
- **Version**: 1.0.0

---

## Context and Problem Statement

The repo was scaffolded against the 10x plan (2026-08-03): community hub + blog + company
directory + job board. Six days later the founding pack arrived — a 100-page strategy playbook, a
37-template communication kit, a brand system and a launch tracker (all dated 2026-08-09) — which
defines a different product: **an independent, practitioner-led community platform** (shared
calendar, directory, archive/editorial, newsletter) built around **numbered flagship events**,
starting with twente.dev/001 — Reconnect on 7 October 2026.

The playbook actively warns against the earlier framing: "interviewees infer a job board" is
listed as a launch failure signal, recruitment-fair dynamics are an anti-goal, and elaborate web
features (accounts, profiles, chat) are explicitly postponed. The two documents cannot both be the
source of truth.

## Decision Drivers

| #   | Driver                                                                                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The playbook is the newer, more deliberate document and carries the launch                                                               |
| 2   | The launch tracker gives the site hard deadlines (landing page 24 Aug, partner page 31 Aug, trust pages before registration opens 2 Sep) |
| 3   | Community trust safeguards (no attendee data, no paid stage time) must be visible on the site itself                                     |
| 4   | Already-built sections (jobs, companies) are validated, fixture-only, and cheap to keep                                                  |

## Decision Outcome

### Chosen Option

**The playbook defines the public product.** Concretely:

- The homepage leads with the playbook's prescribed copy, the flagship edition and contribution
  routes; primary navigation is Events / Blog / Communities / Partners / Contribute.
- Flagship editions live at brand-form URLs (`/nl/001`, `/en/001`, with `/001` redirecting) and
  are the canonical listing for their events-collection entry (`canonicalRoute`).
- Partner events carry an `attribution` field and are credited "Listed by twente.dev" — never
  rebranded (the non-displacement commitment).
- Trust pages ship before registration opens: code of conduct, extended privacy notice,
  governance in the about page, partner safeguards on the partners page.
- Brand follows the pack: ink/signal-red/warm-paper/thread-grey tokens, one red signal per view,
  lowercase wordmark with the red dot, tagline "Build here. Share here." always paired with a
  literal explanation.
- The editorial pillars (Field Notes, People Who Build, Open Calls, Week in Twente Tech) exist as
  an optional `pillar` field on posts.

**The jobs and companies sections are kept but demoted**: they remain built, schema-validated and
reachable via the footer, and they stay unlaunched (fixtures only). Whether they relaunch later as
part of the platform, are reframed, or are removed is a separate decision — deferred until after
the /001 launch, when there is event data to argue from.

### Rejected options and why

- **Keep the 10x plan's job-board-forward framing** — directly contradicts the playbook's failure
  signals and anti-goals; the launch campaign (already scheduled, with dates) assumes the playbook
  product.
- **Delete the jobs/companies code now** — destroys working, tested code for no launch benefit;
  the sections are invisible to the launch narrative once removed from primary navigation, and
  git-reversible either way. The playbook's own suggestion is reframe-or-defer, not delete.

### Consequences

**Good**

- Site deliverables now map 1:1 to the launch tracker's workplan items (TD-041…TD-044) and the
  content calendar's website milestones.
- The safeguards that partner and press conversations depend on are publicly verifiable.

**Bad**

- The 10x plan document is now partially superseded and reads stale in places; it is kept as
  history, with `docs/plan/playbook-alignment.md` recording the deltas.
- Two dormant sections (jobs, companies) carry maintenance weight without a launch role.

## Confirmation

- Homepage hero copy matches the playbook's prescribed lines verbatim.
- `/nl/001` and `/en/001` render the full canonical event description with practical information
  on the same page.
- Jobs and companies appear in the footer only, not the header.

## Revision Log

| Date       | Version | Change           |
| ---------- | ------- | ---------------- |
| 2026-08-11 | 1.0.0   | Initial decision |
