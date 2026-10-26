# ADR 0023 – The TypeScript 7 route runs off `astro check` onto the content mapper

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-10-11
- **Tags**: Developer-Experience, Delivery::CI, Toolchain
- **Version**: 1.0.0

---

## Context and Problem Statement

TypeScript 7.0 is the npm `latest` tag and this repository is on 6.0.3. It cannot move to 7.0, and
the usual answer — wait for the tools to catch up — is the wrong frame, because the shape of the
destination changed while the tools were catching up.

TS 7.0 shipped **without a programmatic compiler API**. Everything that embeds `tsc` is stuck behind
that one gap: `typescript-eslint` 8.70.1 still peers `>=4.8.4 <6.1.0`, its tracking issue
[10940](https://github.com/typescript-eslint/typescript-eslint/issues/10940) is locked with "there
is currently no stable JS API", and the native backend is still a draft
([PR 12803](https://github.com/typescript-eslint/typescript-eslint/pull/12803)).

Astro committed to a different destination. [PR 18053](https://github.com/withastro/astro/pull/18053)
(merged 2026-09-17) puts **"astro check will be deprecated in a future Astro release"** into the CLI
text, and [PR 17835](https://github.com/withastro/astro/pull/17835) ships
`@astrojs/ts-content-mapper` as the TS 7.1+ path where plain `tsc` checks `.astro` files. So
`pnpm typecheck` — `astro check` — is on a deprecation path, and nobody had decided what replaces it.

The two facts that make this a decision and not a wait:

1. **`astro check` is going away.** The replacement is the content mapper, which needs TS 7.1's
   compiler API — the same API typescript-eslint needs. One upstream unlock releases both, and the
   release is scheduled.
2. **The current gate is stronger than the replacement in one dimension and weaker in none.** `astro
check` is also the i18n completeness gate ([ADR 0004](0004-locale-strategy.md), driver 4): the
   English UI dictionary is typed against the Dutch one in [`src/i18n/ui.ts`](../../src/i18n/ui.ts),
   so a missing translation is a compile error. The route has to keep that property, not just keep
   type errors visible.

## Decision Drivers

| #   | Driver (why this matters)                                                                 |
| --- | ----------------------------------------------------------------------------------------- |
| 1   | `pnpm typecheck` is the i18n completeness gate; the replacement must preserve that        |
| 2   | The upgrade should be an execution task with a trigger, not an open question re-litigated |
| 3   | Stay on the newest TS both peers accept today rather than freezing below it               |
| 4   | No gate weakens during the transition, and CI keeps one `run-typecheck` lane, not two     |
| 5   | Do nothing before the upstream API is stable enough to spike against                      |

## Considered Options

1. **Stay on TS 6.0.3 and `astro check`, revisit at the 7.1 beta, adopt 7.1 when both blockers clear
   — replacing `astro check` with `tsc` plus `@astrojs/ts-content-mapper`** (chosen).
2. Jump to TS 7.0 now and drop `astro check` / `typescript-eslint` until they catch up.
3. Stay on TS 5.9.3 and treat 6.0 as part of the same future migration.
4. Adopt TS 7.0 alongside TS 6.0.3 (`typescript` and a second copy) and keep `astro check` on 6.0.

## Decision Outcome

### Chosen Option

**Option 1.** Stay on **TypeScript 6.0.3** and `astro check` today. Revisit after the **TS 7.1 beta
on 2026-10-06**; adopt **TS 7.1 stable (2026-11-24)** when both blockers below clear, and swap
`astro check` for **plain `tsc` driven by `@astrojs/ts-content-mapper`** in the same change.

**Current state, measured on this branch (2026-10-11).** `package.json` pins `typescript` `6.0.3`,
`typescript-eslint` `8.70.1`, `@astrojs/check` `0.9.10`. The committed `pnpm-lock.yaml` records the
peer ranges: typescript-eslint and its parser/typescript-estree peer `>=4.8.4 <6.1.0`, and
`@astrojs/check` peers `^5.0.0 || ^6.0.0`. `pnpm typecheck` is `astro check`; it runs in `just check`
and in CI through `node-application-static-analysis.yml` with `run-typecheck: true`. There are 66
`.astro` files and 94 `.ts`/`.astro` files under `src/`.

**The two blocking upstreams, each with the condition that clears it.**

| Blocker                                     | Condition that clears it                                                                                      |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `typescript-eslint` cannot peer TS 7        | Its peer range becomes `^7` (issue 10940 unlocked, or the native backend in PR 12803 ships)                   |
| `@astrojs/ts-content-mapper` is unpublished | It leaves `0.0.0` (a real version is published and it typechecks this repo's `.astro` files — see Validation) |

**The route, dated.**

- **Now → 2026-10-06.** Nothing moves. TS 7.0 has no programmatic compiler API; there is nothing to
  spike against.
- **2026-10-06 (TS 7.1 beta) → 2026-11-24.** Spike the content mapper against a real branch: TS
  7.1.x plus `@astrojs/ts-content-mapper`, a deliberately broken `.astro` file, and an error-count
  comparison against `astro check` (the procedure is in Validation). This is the first point the
  API is stable enough to test.
- **2026-11-24 (TS 7.1 stable), both blockers clear.** One change: bump `typescript` to 7.1,
  replace the `typecheck` script body (`astro check`) with `tsc --noEmit` wired through the content
  mapper, and retire `@astrojs/check`. The script keeps the name `typecheck`, so `just check` and the
  CI lane's `run-typecheck: true` do not change shape.
- **If the mapper cannot yet check this repo.** Keep `astro check` pinned and wait; do not adopt TS 7
  without a working `.astro` type check, because that silently drops the i18n gate and 66 files from
  verification.

**TypeScript 6.0.3 is taken, not deferred.** It landed in `73351ca` (`v0.4.0-rc.1`): both peers allow
`^6`, `astro check` reports 0 errors over 119 files, and the TS 6 removals (`outFile`, AMD/UMD,
`moduleResolution: node`, `baseUrl`, `types` defaulting to `[]`) have no exposure here because
`tsconfig.json` chains through `@webgrip/tsconfig` to `astro/tsconfigs/strict`, which sets `target`,
`module`, `moduleResolution` and `esModuleInterop` explicitly, and there are no `@types/*`
dependencies. 6.0.3 is the documented side-by-side companion for TS 7, so taking it now is the
bridge, not a detour.

### Rationale

The decision is forced by the destination, not by impatience. `astro check` is deprecated upstream
and the content mapper is the named successor, so the real question is only _when_ — and the answer
is the date the API stabilises (7.1), because the mapper is the same content mapper API the 7.1
iteration plan lists first ("Stabilize API: Content Mapper API, Emit API, Language Service API").
Option 2 buys a `latest` tag at the cost of both the type check and the i18n gate. Option 3 keeps a
version both peers accept today and gains nothing. Option 4 keeps two TypeScript copies, which is
exactly the split the repo already refuses for zod ([ADR 0001](0001-astro-as-site-framework.md)): a
second copy makes the two disagree. Option 1 moves the moment it is safe and moves both pieces
together, so the gate never has a window where it checks fewer files than today.

### Positive Consequences

- The upgrade is a dated execution task: 7.1 stable, both blockers named, the diff sketched.
- `pnpm typecheck` keeps its name and its position in `just check` and the CI lane, so the swap is
  invisible to everything downstream.
- The i18n completeness gate is explicitly a condition of the route, so it cannot be dropped by
  accident when `astro check` goes.
- Renovate already never automerges a TypeScript major, so no unattended PR can pull the upgrade
  early.

### Negative Consequences / Trade-offs

- The repo sits on 6.0.3 for a scheduled window rather than tracking `latest`; that is the point,
  but it reads as being behind.
- The content mapper's output shape is unproven here until the spike runs, so "same error count" is a
  target, not a measurement, until then.
- Adopting TS 7.1 couples this repo to an Astro integration that is itself new; a mapper bug can
  block the upgrade even after both blockers clear.

### Risks & Mitigations

- **The spike shows the mapper misses a class of error `astro check` catches.** The route then stays
  on `astro check` for that release and the finding is recorded here; a type checker that checks
  fewer files is a weaker gate, not a newer one.
- **`astro check` breaks against TS 6 before 7.1 arrives.** 6.0.3 is already green and `@astrojs/check`
  peers `^6`, so this is a future-bump risk only; Renovate's no-automerge rule on TypeScript majors
  and the Astro group keeps it a reviewed change.
- **The i18n gate quietly stops working.** `src/i18n/ui.ts` types `en` as `Record<UIKey, string>`
  against `nl`; that is a plain type error any checker sees, so any replacement that typechecks the
  repo preserves it — the guard is to assert it in the spike, not to trust it.

## Validation

- **Immediate proof (this decision).** This ADR exists and is registered in
  [`README.md`](README.md) and [`mkdocs.yml`](../../mkdocs.yml). The state above is read from the
  committed `package.json` and `pnpm-lock.yaml`, not asserted.
- **Spike procedure (run at the 7.1 beta, on a real branch).** On a branch from `main`: bump
  `typescript` to 7.1.x, add `@astrojs/ts-content-mapper`, wire `tsconfig.json` to the mapper's
  `.astro` types, introduce one deliberate type error in a `.astro` file, and run the two paths
  (`astro check` and `tsc --noEmit`) on the same tree. The spike passes when both report the same
  error count, and the mapper also reports it on a clean tree after the error is removed. The result
  — pass, or the reason it cannot yet — is recorded in this ADR's revision log.
- **Ongoing guardrails.** `just typecheck` and the `run-typecheck` lane are the signal; a
  `typecheck` script that no longer runs on `.astro` files shows up as a drop in the checked-file
  count. `renovate.json` keeps TypeScript majors off automerge.

## Compliance, Security & Privacy Impact

None. The change is a devDependency and a type checker; no runtime code, data or credential is
touched. `@astrojs/ts-content-mapper` is an Astro-official package, so it enters the existing
supply-chain review the way any `@astrojs/*` dependency does.

## Notes

- **Related Decisions**: [ADR 0001](0001-astro-as-site-framework.md) (Astro, and the single-copy
  rule for a shared type dependency), [ADR 0004](0004-locale-strategy.md) (the i18n gate this route
  must preserve), [ADR 0020](0020-ci-critical-path.md) (the CI lane that carries `typecheck`).
- **Supersedes / Amends**: amends the closing note of `73351ca` ("7.x blijft geblokkeerd … tot 7.1")
  by naming the 7.1 dates and the replacement for `astro check`.
- **Follow-ups / TODOs**: run the spike at the 7.1 beta (2026-10-06); revisit this ADR at 7.1
  stable (2026-11-24). Upstream: typescript-eslint 10940 and 12803, Astro roadmap 1321, Astro 17268
  (the closed get-TS7-to-work tracker).

---

### Revision Log

| Version | Date       | Author          | Change           |
| ------- | ---------- | --------------- | ---------------- |
| 1.0.0   | 2026-10-11 | Ryan Grippeling | Initial creation |
