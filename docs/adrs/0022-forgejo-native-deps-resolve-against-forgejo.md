# ADR 0022 – Forgejo-native dependencies resolve against Forgejo, not against a GitHub twin

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-09-18
- **Tags**: Delivery::CI, Operations, Supply-Chain
- **Version**: 1.0.0

---

## Context and Problem Statement

Every `uses:` in this repository's workflows is pinned to a commit with the version in a trailing
comment, the shape [`CLAUDE.md`](https://forgejo.webgrip.dev/webgrip/twente.dev/src/branch/main/CLAUDE.md)
requires so Renovate can resolve a digest back to a version:

```yaml
uses: webgrip/workflows/.forgejo/workflows/node-application-tests.yml@43f4088df6df3f225a07ab66b9f2b4c4d23cf579 # v2.7.1
```

The comments made the dependency visible. They did not make it resolvable. On 2026-09-18 the
Dependency Dashboard carried seven lookup failures, one per distinct pin:

> Renovate failed to look up the following dependencies: `Can't find version matching v2.6.1 for
github-tags package webgrip/workflows`, `… v2.1.0 …`, `… v2.7.1 …`, `… v1.6.0 …`, `… v2.5.2 …`,
> `… v2.4.1 …`, `… v2.7.2 …`

Meanwhile the lanes had drifted badly: `on_docs_change.yml` sat on v1.6.0 and `link-check.yml` on
v2.1.0 while `webgrip/workflows` had shipped v2.7.2. No PR had ever been proposed for any of them,
and no error surfaced anywhere except this one collapsed warning box.

The cause is a split between two axes that look like one:

- **Platform.** Renovate runs against Forgejo. `webgrip-forgejo.yaml` sets `provider.name: forgejo`
  with an in-cluster endpoint, and `webgrip/workflows` is in its `discoveryFilters`.
- **Datasource.** Renovate's `github-actions` manager assigns `datasource: github-tags` at
  extraction time, unconditionally. Its own documentation says the manager "can also be used for
  Gitea and Forgejo Actions workflows as such are compatible with GitHub Actions workflows" — it
  parses the _syntax_ and then resolves against `api.github.com`. There is no `registryUrls` or
  datasource override for a manager-assigned datasource.

For `actions/checkout` that is correct: GitHub is where the upstream publishes, which is exactly
what [homelab ADR-0031](https://forgejo.webgrip.dev/webgrip/homelab-cluster/src/branch/main/docs/techdocs/docs/adr/adr-0031-github-as-renovate-data-oracle.md)
ratified when it kept GitHub as a read-only version oracle.

For `webgrip/workflows` it is wrong, and it fails in the worst possible way. `github.com/webgrip/workflows`
**exists** — it is the distribution twin — but its `tags.atom` feed is empty, because
`github-distribute.yml` does not run on that repository. So Renovate finds a real repository with
zero tags and reports "can't find version" rather than "not found". A missing repository would have
been a loud, obvious error. An untagged twin is a silent freeze.

## Decision Drivers

- A pinned CI dependency that can never be updated is worse than an unpinned one: it looks governed.
- The failure must be impossible to reintroduce silently — a lane that stops updating has to
  produce a signal, not a collapsed warning box that reads as noise.
- `webgrip/workflows` is Forgejo-authoritative. Making its updatability depend on a GitHub mirror
  inverts the direction ADR-0029 and ADR-0031 set for the estate.
- Whatever replaces the lookup must update the digest **and** the version comment together. A pin
  where the two disagree is a lie, and the estate has already been bitten twice by replacements
  that silently fail to apply ("Digest is not updated" aborting a whole branch).

## Considered Options

1. **A `customManagers` regex entry with the `gitea-tags` datasource, pointed at Forgejo** (chosen)
2. Run `github-distribute.yml` on `webgrip/workflows` so the twin carries tags
3. Override `registryUrls` on the existing `github-tags` dependency

## Decision Outcome

### Chosen Option

A custom regex manager in [`renovate.json`](../../renovate.json) claims every `webgrip/*` job-level
`uses:` in `.forgejo/workflows/`, resolves it through `gitea-tags` against
`https://forgejo.webgrip.dev`, and the `github-actions` manager is disabled for `webgrip/**` so the
two cannot both claim the same dependency.

### Rationale

`gitea-tags` reads the authoritative tag list — the same one `/api/v1/repos/webgrip/workflows/tags`
serves — and, unlike most datasources, it implements `getDigest`. Given a `newValue` it resolves
that tag to its commit, so both halves of the pin move together. Verified against the live instance
before the rule was written:

```text
GET /api/v1/repos/webgrip/workflows/tags/v2.7.2  →  cd0550751c9e0414c8dc32d62ff099ff38c7a284
pin in on_source_change.yml                      →  cd0550751c9e0414c8dc32d62ff099ff38c7a284
```

`custom.regex` is already in the Forgejo job's `enabledManagers`, so this needs no admin change.

Option 2 was rejected on direction, not on mechanics — it works, and it is one lane rather than a
rule per repository. But it makes a Forgejo-authoritative repository updatable only because a
GitHub mirror exists, which is precisely the coupling ADR-0031 set exit ramps for. It also leaves
the failure mode intact for the next Forgejo-native `uses:` in any other repository.

Option 3 does not work at all. Forgejo's API is Gitea-shaped (`/api/v1`); the `github-tags`
datasource speaks the GitHub API. Pointing it at Forgejo produces a different failure, not a fix.

The same commit closed three further holes found while confirming the first, all of the same
species — a pin that no manager reads:

- `ops/docker/web/Dockerfile` declares both base images as `ARG X_IMAGE=${REGISTRY_DOCKERHUB}/…`.
  The nested variable defeats the dockerfile manager's ARG resolution, so it reported exactly one
  dependency for that file — `docker/dockerfile 1`, from the syntax directive — and
  `nginxinc/nginx-unprivileged` had never been offered an update by anything.
- `license:reuse` pins `reuse==6.2.0` inside an npm script, resolved from PyPI by `uvx` at run time.
- The `lhci` recipe pins `@lhci/cli@0.15.1` through `pnpm dlx`, which is not in any manifest.

### Positive Consequences

- The seven lookup failures go away and the drifted lanes become updatable for the first time.
- The digest and the version comment are updated by the same operation, so they cannot disagree.
- `nginx-unprivileged`, `reuse` and `@lhci/cli` enter the update stream at all.
- The rule is a worked example for any other repository with a Forgejo-native `uses:`.

### Negative Consequences / Trade-offs

- A regex manager is more brittle than a real one. A `uses:` written in a shape the pattern does not
  match is silently unmanaged again — the same failure class this ADR exists to remove.
- The rule is repository-local. Every other webgrip repository with `webgrip/*` reusable workflows
  still has the original problem until this moves into `webgrip/renovate-config`.
- `registryUrlTemplate` hardcodes the public host. The Renovate job reaches Forgejo in-cluster for
  platform calls specifically because the Cloudflare-fronted host mangles `%2F` in branch-ref paths;
  tag paths have no such segment, so this is safe today but is a second address for one instance.

### Risks & Mitigations

- **The regex stops matching after a workflow is reformatted.** Mitigated by the Validation check
  below: the detected-dependency count is the signal, and it is on the dashboard every run.
- **`gitea-tags` and `github-actions` both claim a dep and fight.** Mitigated by the explicit
  `matchManagers: ["github-actions"] + matchPackageNames: ["webgrip/**"] → enabled: false` rule.
- **`pinDigests` aborts the branch.** The org preset sets `pinDigests: true` globally; a custom
  manager that captures no digest makes the replacement unapplicable, which has twice aborted an
  entire branch elsewhere in the estate. Mitigated by `matchManagers: ["custom.regex"] →
pinDigests: false`.

## Validation

- **Immediate proof** — after the first run following this change, the Dependency Dashboard's
  Repository Problems section no longer lists `Package lookup failures` for `webgrip/workflows`, and
  the Detected Dependencies section gains a `custom.regex` group listing all fifteen `webgrip/workflows`
  pins. Updates toward v2.7.2 appear for the lanes on v1.6.0 and v2.1.0.
- **Ongoing guardrail** — the detected-dependency counts are the check. `custom.regex` must report
  fifteen `webgrip/workflows` entries plus `library/node`, `nginxinc/nginx-unprivileged`, `reuse` and
  `@lhci/cli`. A count that drops means a pin was rewritten into a shape the regex no longer reads.
  Locally, `just renovate-coverage` replays every `matchStrings` pattern against the working tree
  and prints what each custom manager would claim.

- **Config validity** — `npx --package renovate@43 -- renovate-config-validator --strict renovate.json`.

## Compliance, Security & Privacy Impact

Strictly positive. Three dependencies that no tool was watching — one of them a web server image —
enter the update stream, and the `actions/*` pins moved from floating tags to immutable digests
(`data.forgejo.org` serves the same commits as github.com, verified per tag, so this froze what was
already running rather than bumping it). No credential or endpoint is added: `webgrip/workflows` is
publicly readable and the tag lookup is anonymous.

## Notes

- **Related Decisions**: [ADR 0003](0003-forgejo-as-ci-and-release-authority.md),
  [ADR 0020](0020-ci-critical-path.md),
  [homelab ADR-0031](https://forgejo.webgrip.dev/webgrip/homelab-cluster/src/branch/main/docs/techdocs/docs/adr/adr-0031-github-as-renovate-data-oracle.md)
  (which this refines rather than contradicts: GitHub stays the oracle for upstream OSS, and stops
  being it for our own repositories).
- **Supersedes / Amends**: amends the claim in `CLAUDE.md` that the `# vX.Y.Z` comment is what
  unfroze the lanes. The comment fixed detection; resolution stayed broken until this ADR.
- **Follow-ups / TODOs**: lift the custom manager into `webgrip/renovate-config` so every repository
  with a Forgejo-native `uses:` inherits it — this repository is the pilot, not the intended home.

---

### Revision Log

| Version | Date       | Author          | Change           |
| ------- | ---------- | --------------- | ---------------- |
| 1.0.0   | 2026-09-18 | Ryan Grippeling | Initial creation |
