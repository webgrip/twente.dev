# ADR 0009 – Lean launch: remove the job board, hold the directory as a placeholder

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-08-13
- **Tags**: Scope, Product, Content
- **Version**: 1.0.0

---

## Context and Problem Statement

[ADR 0008](0008-playbook-first-launch-scope.md) settled that the strategy playbook defines the
public product, and disposed of the two sections inherited from the 10x plan by **keeping them but
demoting them**: jobs and companies would "remain built, schema-validated and reachable via the
footer", staying unlaunched with fixture data. It explicitly rejected deleting them, on the grounds
that doing so "destroys working, tested code for no launch benefit".

A day later, commit `ea4a550` deleted the jobs section outright — pages, content collection,
`JobCard`, `JobPosting` JSON-LD, the UI strings, `scripts/expire-jobs.ts` and the submit-job issue
form — and reduced the companies and communities pages to short placeholders that route interest to
email. Its own message acknowledged the divergence: "Goes further than ADR-0008's keep-but-demote
for jobs/companies."

So the decision record and the repository disagreed, and ADR 0008 sat at **Proposed** — a reader
could not tell which of the two was the real intent. This record closes that gap.

## Decision Drivers

| #   | Driver                                                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | The playbook lists "interviewees infer a job board" as a launch **failure signal**; a footer link is still a signal                  |
| 2   | Fixture-only sections carry real maintenance weight — schema, validator branches, an issue form, placeholder routes, Lighthouse URLs |
| 3   | The empty-directory problem: a directory with three fictional entries reads as abandoned, which is worse than absent                 |
| 4   | Every section kept is a surface that must be correct before 7 October; attention is the scarce resource, not code                    |

## Decision Outcome

### Chosen Option

**Delete the job board; keep the companies and communities collections as placeholders pending a
post-launch decision.** Concretely, as shipped:

- The jobs collection, routes, card component, `JobPosting` structured data, expiry script and issue
  template are gone. `src/i18n/routes.ts` has no jobs entry, so no locale can resolve one.
- `/nl/bedrijven` and `/en/companies` render a short placeholder stating what is coming and routing
  interest to `hello@twente.dev`. Detail routes and listing templates are removed.
- The `companies` collection stays defined in `src/content.config.ts` with zero entries — valid, and
  cheaper to refill than to reconstruct.
- Nothing in the navigation, guidelines, privacy copy, README or CONTRIBUTING promises a job board.

Whether the directory returns with real data, is reframed, or is removed entirely is deferred to a
separate decision once there is event data to argue from — tracked on the board, not here.

### Rejected options and why

- **Keep-but-demote, as ADR 0008 decided.** A footer link is still a promise, and the sections could
  only be reached with fixture data behind them. The maintenance was real and the launch benefit was
  zero.
- **Delete the companies collection too.** The directory is one of the four jobs the playbook gives
  the site ("discover regional activity"), so removing the model would be a decision about the
  product, not about launch scope. Holding an empty collection costs nearly nothing.

### Consequences

**Good**

- The launch surface matches the playbook's narrative with nothing to explain away.
- `pnpm validate:content` runs clean with `REQUIRE_REAL_CONTENT=1`, so no fictional organisation can
  reach `main`.

**Bad**

- The `JobPosting` JSON-LD work (10x plan lever L1) is discarded; reinstating it means rewriting it.
- The `submit-company` issue form still invites contributions into a placeholder — a loose end this
  record does not close.

## Confirmation

- `grep -rn "vacature\|/en/jobs" src/ .forgejo/` returns nothing outside explanatory comments.
- `src/i18n/routes.ts` contains no jobs route key.
- `REQUIRE_REAL_CONTENT=1 pnpm validate:content` exits 0 with no fixture warnings.
- `/nl/bedrijven` and `/en/companies` build and render placeholder copy, not a listing.

## Revision Log

| Date       | Version | Change                                                          |
| ---------- | ------- | --------------------------------------------------------------- |
| 2026-08-13 | 1.0.0   | Records the lean-launch scope enacted in `ea4a550` (2026-08-12) |

## More Information

- 2026-08-11 — [ADR 0008](0008-playbook-first-launch-scope.md) decides keep-but-demote for jobs and
  companies
- 2026-08-12 — `ea4a550` deletes the job board and reduces the directory pages to placeholders,
  going beyond that decision
- 2026-08-13 — this record supersedes the jobs/companies disposition in ADR 0008; the rest of
  ADR 0008 (playbook-first product, brand, trust pages, release routing) stands
