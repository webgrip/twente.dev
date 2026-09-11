# ADR 0020 – CI critical path: one verification stage on a runner that caches per node

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-09-05
- **Tags**: Delivery::CI, Operations, Developer-Experience
- **Version**: 1.0.0

---

## Context and Problem Statement

A push to `development` took about sixteen minutes to turn green, and almost none of it was
work. Run 275 (2026-09-05), the last green run of the old shape, measured per job:

| Job                | Set up job | Install | Actual work        |
| ------------------ | ---------- | ------- | ------------------ |
| Static analysis    | 1m42s      | 7s      | 21s                |
| Unit tests         | 2m13s      | 22s     | 3s                 |
| Content validation | 2m08s      | 21s     | 2s                 |
| Mail validation    | 2m04s      | 19s     | 1s                 |
| Build site         | 1m51s      | 17s     | 11s                |
| Container parity   | 1m16s      | –       | 22s                |
| Lighthouse budgets | 55s        | 18s     | 6m07s (24 audits)  |
| Accessibility      | 1m12s      | 15s     | 1m02s              |
| Deploy preview     | 1m00s      | 7s      | 12s                |

Three causes, all outside the tests themselves:

1. **Every `uses:` is a bare clone of a large mirrored repository, per job.** The runner keeps
   its action cache under the pod's `$HOME`, and each pod runs one job and dies. `actions/setup-node`
   is 144 MB and `actions/cache` 88 MB on the local mirror; the runner spends 30 to 50 seconds
   on each, before a single step runs, and clones them again in the next job. A job with four
   actions pays two minutes of setup for three seconds of tests.
2. **The pipeline was five stages deep** (static analysis → tests → build → lighthouse, axe,
   preview → release), and every stage boundary is another pod, another setup, another install.
   Lighthouse and axe build their own `dist/` anyway, so waiting for the build job bought nothing.
3. **Every push ran the pipeline twice.** The workflow triggered on `push` and on `pull_request`
   against `main`. Since [ADR 0019](0019-release-driven-deploys.md) a promotion PR from
   `development` is open almost permanently, so each push to `development` also fired a
   synchronize event on that PR: twenty more jobs competing for the same six runner slots.

The `actions/cache` step in the shared node lanes was also caching `~/.pnpm-store`, the store
location of pnpm 6. pnpm 11 writes to `~/.local/share/pnpm/store`, so the step had been storing
nothing for months while costing its clone.

## Decision Drivers

| #   | Driver (why this matters)                                                                  |
| --- | ------------------------------------------------------------------------------------------ |
| 1   | Push-to-green in minutes, so sessions and Renovate get feedback while the change is warm   |
| 2   | Runner slots are shared by every repository on the instance; waste here starves the others |
| 3   | No gate gets weaker: Lighthouse, axe, parity and content validation stay as they are       |
| 4   | Fix the cause once, in the estate's shared machinery, instead of working around it here    |

## Considered Options

1. **Per-node caches on the runner, a flat verification stage, push-only trigger** (chosen).
2. Per-node caches only; keep the five-stage chain and the pull_request trigger.
3. One job that does everything: static analysis, tests, validations and build in a single lane call.
4. Fewer Lighthouse runs (`numberOfRuns: 1`) or fewer pages to shorten the long pole.

## Decision Outcome

### Chosen Option

**Option 1.**

### Rationale

The clone cost is a property of the runner, not of this repository, so it is fixed there:
[homelab ADR-0056](https://forgejo.webgrip.dev/webgrip/homelab-cluster/src/branch/main/docs/techdocs/docs/adr/adr-0056-per-node-ci-cache.md)
moves the runner's action cache, tool cache, workspace and the pnpm, npm and corepack stores to
a hostPath that outlives the pod. A job then fetches into an existing bare clone instead of
cloning, `setup-node` finds its tarball in the tool cache, and `pnpm install` hardlinks
`node_modules` out of a store on the same filesystem. The shared node lanes drop their
`actions/cache` step (webgrip/workflows v2.5.2), which removes one clone per job and a false
promise.

With setup down to seconds, the chain no longer earns its keep. `on_source_change.yml` now runs
five independent jobs from the first minute:

- **Static Analysis** and **Tests & Build**: the two node lanes, the second one running the unit
  tests, both validations and the build in one call, because their combined work is under half a
  minute and a second install per check is more than the check.
- **Container Parity**, **Lighthouse Budgets** and **Accessibility (axe-core)**: independent from
  the start. The two audits build their own `dist/`, as they always did.
- **Deploy Preview** waits for Tests & Build; **Release** waits for all five.

The critical path is now Lighthouse alone, about six and a half minutes, and everything else is
green inside two. Option 3 would save one install but hide which check failed behind one step
name and serialise work that runs in parallel for free. Option 4 shortens the long pole by
weakening a gate; that stays a separate decision, recorded in [`lighthouserc.json`](../../lighthouserc.json)
when someone takes it.

The `pull_request` trigger goes. Work lands by push, on `development` or on a branch in this
repository, and the promotion PR carries a commit that the push run already verified. The only
thing the trigger did since ADR 0019 was double the load.

### Positive Consequences

- A push to `development` is fully green in the time Lighthouse takes, and every other job
  reports within two minutes.
- Half the jobs per push, and each of them a fraction of the runner-seconds; other repositories
  get their slots back.
- Node lanes and the runner improve for every consumer, not only this site.

### Negative Consequences / Trade-offs

- A pull request from a fork gets no CI until a maintainer pushes the branch into this
  repository, which is already the contribution flow in `CONTRIBUTING.md`.
- Lighthouse and axe start before the cheap checks have passed, so a push that fails lint still
  spends the audit's runner time.
- Jobs on the same node share one action cache and one package store; a job can in principle
  poison what the next job on that node reads. The runner already shared a Docker daemon per
  node on the same single-tenant reasoning.

### Risks & Mitigations

- **The first job on a cold node still clones.** The runner pod warms the mirrored action set
  under a node-wide lock before it registers, so the race between two first clones cannot happen
  and the cost is paid once per node.
- **Leaked workspaces fill the node disk** when a pod is killed mid-job. The dind prune sidecar
  reaps job directories and action worktrees older than three hours; bare clones and stores stay.
- **Flux reconciles the runner change on its own cadence.** Until the new pods roll in, the
  pipeline runs with the new shape and the old setup cost, which is still fewer jobs than before.

## Validation

- **Immediate proof** – the first run after this change: `Set up job` per node-lane job drops
  from two minutes to seconds, and its log shows `git fetch … # ref=…` without a preceding
  `git clone`. Read it with the log endpoint documented in [`CLAUDE.md`](../../CLAUDE.md).
- **Ongoing guardrails** – a `Set up job` that climbs back above a minute on a warm node is the
  signal; the pipeline view on the Actions page shows five jobs in the first stage and none of
  the old chain.

## Compliance, Security & Privacy Impact

No data leaves the cluster that did not before. The per-node cache is a trust boundary change
inside a single-tenant homelab, recorded in the homelab ADR; this repository's secrets and
tokens are unaffected.

## Notes

- **Related Decisions**: [ADR 0003](0003-forgejo-as-ci-and-release-authority.md),
  [ADR 0019](0019-release-driven-deploys.md), homelab ADR-0056.
- **Supersedes / Amends**: amends the pipeline shape described in ADR 0019 (verification on push
  only, one stage).
- **Follow-ups / TODOs**: decide on Lighthouse `numberOfRuns` if six minutes is still too long;
  webgrip.nl inherits the lane and runner changes and can flatten its own workflow the same way.

---

### Revision Log

| Version | Date       | Author           | Change           |
| ------- | ---------- | ---------------- | ---------------- |
| 1.0.0   | 2026-09-05 | Ryan Grippeling  | Initial creation |
