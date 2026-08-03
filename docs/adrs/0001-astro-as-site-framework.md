# ADR 0001 – Astro as the site framework

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-08-03
- **Tags**: Frontend::Framework, Content, i18n
- **Version**: 1.0.0

---

## Context and Problem Statement

twente.dev is a bilingual (NL/EN) content site combining a community hub, blog, company directory and
job board. It must be fully static — the hosting budget is zero and there is no appetite to operate a
backend — while accepting community contributions from people we have never met.

That last constraint is the sharp one. Contributions arrive as files. If a malformed submission can
only be caught by a human reading a diff, review does not scale and bad data reaches production.

## Decision Drivers

| #   | Driver                                                                 |
| --- | ---------------------------------------------------------------------- |
| 1   | Fully static output; no server at runtime                              |
| 2   | Typed, schema-validated content so contributions fail CI, not review   |
| 3   | First-class i18n routing for two locales with localized URL segments   |
| 4   | Near-zero JavaScript on content pages (performance budget: <10 KB JS)  |
| 5   | Component authoring that a contributor can read without learning a DSL |

## Considered Options

1. **Astro** — islands architecture, content collections with Zod schemas, built-in i18n routing
2. **Hugo** — fastest builds, huge ecosystem, single binary
3. **Next.js (static export)** — familiar, large ecosystem
4. **Eleventy** — flexible, minimal, unopinionated

## Decision Outcome

### Chosen Option

**Astro 5+ with `output: 'static'`** (scaffolded on 7.1.6).

Astro is the only option that satisfies driver 2 out of the box. Content collections validate every
entry against a Zod schema at build time, which turns "is this submission well-formed?" from a review
question into a CI result. Combined with first-class i18n routing (driver 3) and zero-JS-by-default
rendering (driver 4), it fits the problem more precisely than the alternatives.

### Rejected options and why

- **Hugo** — fastest builds by a wide margin, but content validation is limited to what Go templates
  can assert at render time, and component authoring in Go templates raises the barrier for
  contributors. Driver 2 and driver 5 both lose.
- **Next.js static export** — heavier runtime, and static i18n export is awkward enough that we would
  be fighting the framework on driver 3. Ships far more JS than driver 4 allows without careful work.
- **Eleventy** — a reasonable fit and genuinely minimal, but has no schema validation or component
  islands without assembling both ourselves. That is exactly the work Astro already did.

### Consequences

**Good**

- Malformed content cannot merge; the schema is the contribution contract.
- Content pages ship no JavaScript at all. Only search, filtering and the theme toggle are islands.
- `astro check` doubles as the i18n completeness gate (see ADR 0004).

**Bad**

- Astro majors move quickly and have changed content/routing APIs before. Renovate is configured to
  never automerge Astro majors.
- Ties us to zod's major version, which Astro also depends on. Pinned deliberately; see
  `src/content.config.ts`.

## Confirmation

- `pnpm build` produces `dist/` with no server output.
- `pnpm typecheck` passes with zero errors and zero warnings.
- Content pages contain no `<script>` beyond the inline pre-paint theme snippet.

## Revision Log

| Date       | Version | Change                                      |
| ---------- | ------- | ------------------------------------------- |
| 2026-08-03 | 1.0.0   | Initial decision; scaffolded on Astro 7.1.6 |
