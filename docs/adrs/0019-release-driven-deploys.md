# ADR 0019 – Deploys follow releases: development cuts rc to staging, main cuts stable to production

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-09-05
- **Tags**: Delivery::Release, Delivery::Environments, Security::Access, Operations
- **Version**: 1.1.0

---

## Context and Problem Statement

[ADR 0003](0003-forgejo-as-ci-and-release-authority.md) made Forgejo the release authority and
[ADR 0002](0002-cloudflare-workers-static-assets.md) put the site on a Cloudflare Worker deployed
by wrangler. What neither decided is _when_ a deploy happens. In practice it happened on every
green push to `main`, and a second time every night when `nightly-rebuild.yml` redeployed `main`
HEAD without the Lighthouse, axe and parity gates.

On 2026-09-05 that model failed visibly. Several sessions pushed to `main` eleven times in three
hours; the workflow's cancel-in-progress group cancelled each run before its deploy job, and
production stayed on a commit from the previous evening for 33 commits. Queueing runs on `main`
stopped the starvation, but the shape stayed wrong: there was no staging, no promotion step, no
version that names what is live, and no server-side rule about who may write to `main`.

The estate already has the answer. `@webgrip/semantic-release-config` defaults to `main` = stable
and `development` = `-rc.N`, with the merge of `development` into `main` as the promotion act.
`ploeg` and `infrastructure` deploy from `on: release: types: [published]`.
[homelab ADR-0050](https://forgejo.webgrip.dev/webgrip/homelab-cluster/src/branch/main/docs/techdocs/docs/adr/adr-0050-per-repo-delivery-contract.md)
defines the server-enforced delivery contract and `forgejo-sync.sh --only protect` applies it.

## Decision Drivers

| #   | Driver (why this matters)                                                                 |
| --- | ----------------------------------------------------------------------------------------- |
| 1   | A deploy must be the consequence of a named release, not of whichever push finished last  |
| 2   | Content and code must be seen on a real hostname before they reach twente.dev             |
| 3   | The staging hostname must not be public: Zero Trust in front, the site itself unchanged   |
| 4   | Parallel sessions must be able to land work without racing each other into production     |
| 5   | Reuse the estate's release and protection machinery instead of inventing a site-local one |
| 6   | An urgent fix must still be possible without a second branch model                        |

## Considered Options

1. **Keep push-to-deploy on `main`, only queue runs** (the 2026-09-05 stopgap).
2. **Release-driven deploys with `development` → rc → staging and `main` → stable → production**,
   protection per ADR-0050, owner keeps direct push on `main`.
3. **Option 2 plus `release/*` maintenance branches** for hotfixes.
4. **Environment branches** (`staging`, `production`) deployed on push.

## Decision Outcome

### Chosen Option

**Option 2.**

### Rationale

Option 1 leaves every driver but the fourth unmet. Option 4 duplicates what a tag already says and
has no place in the shared semantic-release config. Option 3 adds a branch model the site does not
need: the owner keeping direct push on `main` is the escape hatch, and a hotfix pushed there cuts a
stable release like any other commit. Option 2 is the estate default, so the release composite,
the Forgejo release event, the deploy lane and the protection script all exist; this repository
only wires them.

Concretely:

- `development` is where work lands, human and agent sessions alike. semantic-release cuts
  `vX.Y.Z-rc.N` there and `vX.Y.Z` on `main`. Releases are created with `WEBGRIP_CI_TOKEN`, the
  only token that fires a native release event.
- `on_release_published.yml` deploys the tag's checkout: a prerelease tag to the `staging`
  wrangler environment on `staging.twente.dev`, a stable tag to production, through the shared
  `cloudflare-deploy.yml` with `release-channel`. `on_source_change.yml` verifies and previews;
  it deploys nothing. The nightly rebuild redeploys the latest stable tag.
- `staging.twente.dev` is a proxied DNS record in the cloudflare repository
  ([ADR 0018](0018-account-and-zone-resources-in-opentofu.md)) with a Cloudflare Access
  application in front, Authentik as identity provider. The build for staging is the same build:
  canonical URLs keep pointing at twente.dev, so staging never competes in search and never
  reports telemetry (the RUM beacon checks the hostname).
- Commit types that release: `feat`, `fix`, `perf`, `refactor`, `revert` from the shared rules,
  plus `content` as a patch, because a copy or content change must be able to reach production
  on its own.
- Promotion is a PR `development → main`, opened and kept open by a workflow, merged with a merge
  commit or rebase, never squashed, so semantic-release sees the original commits.
- Server-side: `main` accepts direct pushes from `webgrip-ci` and `ryangr0` only, merges by the
  owner and Renovate; `development` accepts `webgrip-ci` and `ryangr0`. Renovate targets
  `development`.

### Positive Consequences

- Every production deploy has a version, a changelog entry and a release page.
- Staging shows the exact build that will be promoted, on a real hostname, behind login.
- Sessions can push to `development` at any cadence without touching production.
- webgrip.nl can adopt the same wiring by copying five files.

### Negative Consequences / Trade-offs

- Two steps instead of one to reach production: land on `development`, merge the promotion PR.
- A `docs:` or `chore:` commit on `main` releases nothing and therefore deploys nothing; that is
  the intent, and a content change has its own releasable type.
- The rc counter restarts on every stable release; rc numbers are not comparable across versions.

### Risks & Mitigations

- **Forgejo fires no release event when the release is created by the per-job token.** The
  release job passes `WEBGRIP_CI_TOKEN`; the first rc is verified end to end before protection is
  applied.
- **The prerelease flag on the Forgejo release may not be set by the Gitea plugin.** The deploy
  lane decides on the tag shape (`-` in the ref), not on the flag.
- **The tofu token cannot manage Access yet.** The Access resources land as a PR that applies only
  after the token is extended; staging is reachable without login until then and serves the same
  public content as twente.dev.
- **Protection locks the owner out** if the push whitelist is overwritten by a sync sweep; the
  homelab runbook step 3 restores it.

## Validation

- **Immediate proof** – the verification list in
  [`docs/plan/release-train.md`](../plan/release-train.md): rc → staging behind Access, promotion →
  production, nightly on the stable tag, rejected direct push, Renovate on `development`.
- **Ongoing guardrails** – the release page names what is live; the smoke test in the deploy lane
  fails the release run when the edge does not serve it; branch protection is converged by
  `forgejo-sync.sh` and drift shows up in its dry run.

## Compliance, Security & Privacy Impact

Staging carries the same public content as production, so no new data classification. Access
adds an authentication step in front of a hostname; identities come from Authentik, which the
homelab already operates. No new secret enters this repository: the deploy token stays an
org-level Forgejo secret, the Access client secret lives in OpenBao and the cloudflare repository.

## Notes

- **Related Decisions**: [ADR 0002](0002-cloudflare-workers-static-assets.md),
  [ADR 0003](0003-forgejo-as-ci-and-release-authority.md),
  [ADR 0018](0018-account-and-zone-resources-in-opentofu.md), homelab ADR-0050.
- **Supersedes / Amends**: amends ADR 0003 (deploy trigger).
- **Follow-ups / TODOs**: the human steps table in `docs/plan/release-train.md`; webgrip.nl
  parity after twente.dev has run the full loop.
- **Amendments**: 2026-09-05, v1.1.0: the promotion PR is opened by the `open-promotion-pr` job
  in `on_release_published.yml` when an rc is published, instead of by every push to
  `development` (`open_promotion_pr.yml` retired). The job records the staging deploy result and
  the live answer of `staging.twente.dev` in the PR body, and fails when an already open PR is not
  mergeable. The body above stays as decided; only the trigger moved, so a push that cuts no rc
  opens no PR.

---

### Revision Log

| Version | Date       | Author          | Change                                                                      |
| ------- | ---------- | --------------- | --------------------------------------------------------------------------- |
| 1.0.0   | 2026-09-05 | Ryan Grippeling | Initial creation                                                            |
| 1.1.0   | 2026-09-05 | Ryan Grippeling | Promotion PR opens on the rc release event, from `on_release_published.yml` |
