# ADR 0021 – The code is Apache-2.0; the content stays CC BY 4.0

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-09-11
- **Tags**: Licensing, Governance, Supply chain
- **Version**: 1.0.0

---

## Context and Problem Statement

The code here was MIT and the content CC BY 4.0. Nobody had decided that split for the code half —
MIT arrived with the scaffold. Across the estate the same question was open: `de-vloer` and `ploeg`
were Apache-2.0, `webgrip.nl` and this repository were MIT, and none of the four had a reasoned
position on why.

The owner's rule is: give users the most freedom possible, and keep ownership.

## Decision

The code — everything outside `src/content/` — is **Apache-2.0**, matching the rest of the estate.
The community content in `src/content/` stays **CC BY 4.0**.

On freedom: MIT is the lighter obligation, but Apache-2.0 *grants* more. Its section 3 is an
express patent licence; MIT is silent on patents, so a redistributor's right to practise a patent
the code reads on is implied at best. Two lines of attribution paperwork is a smaller cost than
that uncertainty.

On ownership: section 5 settles inbound contributions without a CLA, section 6 reserves trade names
and marks — which is what the twente.dev wordmark and t.d mark rely on — and section 4(d) makes the
`NOTICE` file travel with every fork.

The content split survives the change. Apache-2.0 is a software licence and the wrong instrument
for event listings, job posts and articles; CC BY 4.0 is what those need, and contributors keep the
copyright in their own writing.

## Consequences

The express patent grant now covers contributions to the site's code. `NOTICE` and the licence
section in `CONTRIBUTING.md` state ownership and inbound terms in words rather than leaving them to
be inferred.

`pnpm run license:check` verifies the licence surface agrees with itself, `pnpm run license:reuse`
runs `reuse lint` against version 3.3 of the REUSE Specification, and `pnpm run licenses:bundle`
writes `dist/third-party-licenses.txt` at build time. That last one closed a real gap: the site
serves Inter and IBM Plex Mono, both SIL OFL-1.1, and was shipping the font files with no licence
text alongside them.

Build-time dependencies under MPL-2.0 (`lightningcss`) and LGPL-3.0-or-later (`sharp`'s libvips)
are in the production tree but never reach a visitor's browser. They are allowlisted as build-time
only; if either starts shipping in `dist/`, that is a new decision.
