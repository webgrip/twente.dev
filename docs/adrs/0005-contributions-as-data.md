# ADR 0005 – Community contributions are versioned data, reviewed as code

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-08-03
- **Tags**: Content, Moderation, Community
- **Version**: 1.0.0

---

## Context and Problem Statement

The site's value comes from jobs, events and company profiles staying current. If the only person who
can add them is the maintainer, the site grows at the speed of one person's evenings and dies when
that person gets busy — the standard failure mode for regional community sites.

Accepting submissions from strangers, with no backend and no moderation team, needs a mechanism that
is spam-resistant, auditable, and cheap to review.

## Decision Drivers

| #   | Driver                                                |
| --- | ----------------------------------------------------- |
| 1   | Growth decoupled from maintainer availability         |
| 2   | No database, no always-on service                     |
| 3   | Malformed submissions must not reach production       |
| 4   | Moderation decisions must be auditable after the fact |
| 5   | Contributors should not need a Forgejo account        |

## Considered Options

1. **Headless CMS** (Sanity, Contentful, Decap)
2. **Google Form → manual entry**
3. **Files in the repository, submitted via issue forms and pull requests**
4. **Small backend with a submission queue**

## Decision Outcome

### Chosen Option

**Option 3 — all community content lives as versioned files in this repository.**

Rolled out in two stages:

- **Phase 2 (zero infrastructure)**: Forgejo issue forms for jobs, events and companies. A maintainer
  converts the issue into a pull request. Satisfies drivers 2, 4 and 5 immediately.
- **Phase 3 (self-service)**: a Cloudflare Worker form protected by Turnstile posts to the Forgejo API
  and opens the issue directly. This is the step that actually delivers driver 1 — until it exists,
  the maintainer is still in the loop for every submission.

Driver 3 is handled by the Zod schemas in `src/content.config.ts` running during `astro build`, plus
`scripts/validate-content.ts` for the cross-entry checks a per-entry schema cannot see (dangling
company references, duplicate slugs, translation keys pairing the wrong things). A malformed
submission fails CI **before** a human reads it, which is what makes reviewing strangers' PRs cheap.

### Rejected options and why

- **Headless CMS** — adds a hosted dependency and a second source of truth, contradicting driver 2.
  Free tiers also tend to move.
- **Google Form → manual entry** — maximises maintainer load, exactly the failure mode being avoided.
- **Small backend** — a database to run, back up and secure, for data that changes a few times a
  week. Not proportionate.

### Consequences

**Good**

- Full history: who added what, when, and what changed since. Moderation is auditable by design.
- Content review is a normal PR review against published guidelines.
- Zero marginal cost per submission.

**Bad**

- Until Phase 3, every submission still needs a maintainer to convert it. Driver 1 is only partly met
  in Phase 2 — worth naming plainly rather than pretending the issue forms alone solve it.
- Contributors editing YAML by hand will get it wrong; CI catches it, but the error message is a
  schema failure rather than friendly guidance.
- All submitted content is public and permanent, including revisions. Stated explicitly on the
  privacy page.

## Confirmation

- `pnpm validate:content` exits non-zero on a dangling company reference (verified).
- `pnpm build` fails on a schema violation.
- Issue forms exist for all three submission types.

## Revision Log

| Date       | Version | Change           |
| ---------- | ------- | ---------------- |
| 2026-08-03 | 1.0.0   | Initial decision |
