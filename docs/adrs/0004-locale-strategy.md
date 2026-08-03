# ADR 0004 – Explicit locale prefixes with localized route segments

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-08-03
- **Tags**: i18n, SEO, Content
- **Version**: 1.0.0

---

## Context and Problem Statement

Twente's developer population is genuinely split: Dutch professionals, plus a large international
cohort that arrived via the University of Twente and does not speak Dutch. A monolingual site
excludes one of those groups. Bilingual is therefore a requirement, not a nice-to-have.

Bilingual sites fail in two predictable ways: ambiguous canonical URLs (which language does `/jobs`
serve?), and translation debt (one language quietly rots, or gets machine-translated).

## Decision Drivers

| #   | Driver                                                              |
| --- | ------------------------------------------------------------------- |
| 1   | Unambiguous canonical URL and `hreflang` for every page             |
| 2   | Rank for Dutch region-intent queries ("developer vacatures Twente") |
| 3   | English must be a peer language, not an afterthought                |
| 4   | Translation gaps must be structurally visible, never silent         |

## Considered Options

1. **Bare default + prefixed alternate** — `/jobs` (NL) and `/en/jobs`
2. **Both prefixed, shared segments** — `/nl/jobs` and `/en/jobs`
3. **Both prefixed, localized segments** — `/nl/vacatures` and `/en/jobs`
4. **Subdomains** — `nl.twente.dev` / `en.twente.dev`

## Decision Outcome

### Chosen Option

**Option 3 — both locales prefixed, with localized route segments.** Dutch is the default locale;
`/` redirects to `/nl`.

Prefixing both locales removes the canonical ambiguity of option 1 (driver 1) and makes neither
language structurally subordinate (driver 3). Localizing the segments on top of that is what serves
driver 2: Dutch speakers search for "vacatures", not "jobs", so `/nl/vacatures` and `/en/jobs` cover
twice the keyword surface for the same content.

Dutch is the default because region-intent Dutch queries are the highest-conversion entry point, not
because English matters less.

### The consequence that matters

Localized segments mean **an `hreflang` alternate cannot be derived by swapping the locale prefix in
a URL**. `/nl/vacatures` and `/en/vacatures` are not the same page; the latter does not exist. All
URLs are therefore built through `routePath(routeKey, locale, slug)` in `src/i18n/routes.ts`, and
alternates through `getAlternates(routeKey, slug)`. The helper that built paths by string
concatenation was deliberately deleted so that mistake cannot be made.

Blog posts sharpen this further: translations have _different slugs_
(`waarom-twente-dev` ↔ `why-twente-dev-exists`), so alternates are built from the sibling entry that
actually exists. **A locale with no counterpart is omitted from `hreflang` entirely** — pointing at a
page that was never built is worse than declaring no alternate.

### Translation debt (driver 4)

Two mechanisms, both structural rather than procedural:

- **UI strings**: `src/i18n/ui.ts` types the English dictionary as `Record<UIKey, string>` derived
  from the Dutch one. A key added to `nl` and missing from `en` is a **compile error**. There is no
  runtime fallback, so an English page can never silently render Dutch.
- **Articles**: locale-owned documents paired by `translationKey`. An article with no sibling renders
  an explicit "only available in <other language>" notice. **Machine translation without human review
  is out of bounds** — a half-translated article is worse than an honest pointer.

### Consequences

**Good**

- Every page has one canonical URL and a complete, accurate alternate set.
- `pnpm typecheck` is the i18n completeness gate; no bespoke lint script needed.
- Twice the indexed surface for the same content.

**Bad**

- Route files are duplicated per locale (`src/pages/nl/vacatures/`, `src/pages/en/jobs/`). Thin
  wrappers over shared templates in `src/templates/`, but still two files per page type.
- `/` cannot negotiate `Accept-Language` in a static build; an English speaker lands on `/nl` and
  takes one click. Deferred to Phase 3, when a Worker can negotiate at the edge (ADR 0002, driver 4).
- Adding a third locale touches `ROUTES`, `ui.ts` and the `i18nString` schema. Acceptable: two
  locales is the actual requirement.

## Confirmation

- `pnpm typecheck` fails when a UI key exists in `nl` but not `en`.
- Built pages emit `hreflang` for both locales plus `x-default`, and blog posts cross-link their
  differing slugs.

## Revision Log

| Date       | Version | Change           |
| ---------- | ------- | ---------------- |
| 2026-08-03 | 1.0.0   | Initial decision |
