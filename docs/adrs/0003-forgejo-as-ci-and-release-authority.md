# ADR 0003 – Forgejo is the sole CI/CD and release authority

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-08-03
- **Tags**: CI::Workflows, Standardization, Forgejo
- **Version**: 1.0.0

---

## Context and Problem Statement

Webgrip is migrating from GitHub to self-hosted Forgejo at `forgejo.webgrip.dev`, which is already
the sole release authority for the organisation (see `@webgrip/semantic-release-config` and
`webgrip/workflows` ADR 0002). twente.dev is a new repository and can start on either platform.

Choosing GitHub would be swimming against the org migration. Choosing Forgejo means being the first
Cloudflare consumer in the org, with no existing workflow to copy.

## Decision Drivers

| #   | Driver                                                          |
| --- | --------------------------------------------------------------- |
| 1   | Consistency with the org-wide Forgejo migration                 |
| 2   | Reuse of the shared `webgrip/workflows` library                 |
| 3   | Public discoverability for a community project                  |
| 4   | Deploys must reach Cloudflare, which has no Forgejo integration |

## Considered Options

1. **Forgejo only**
2. **GitHub only** — reuse the frozen `.github/` tree of the shared library
3. **Forgejo primary with a GitHub read-only mirror**

## Decision Outcome

### Chosen Option

**Forgejo only**, for Phases 0–2. Revisit a public GitHub mirror in Phase 4 purely for contributor
discoverability (driver 3), once the contribution flow is proven.

The repository consumes the shared library's Forgejo-adapted tree by full URL:

```yaml
uses: https://forgejo.webgrip.dev/webgrip/workflows/.forgejo/workflows/<name>.yml@main
```

Forgejo jobs use `runs-on: docker`, and **`actions/checkout@v5`, never `@v6`** — v6 is broken on
non-GitHub runners, as documented in `webgrip/workflows` ADR 0002. Releases use
`@webgrip/semantic-release-config` from the Forgejo npm registry.

### Consequences

**Good**

- One platform, consistent with the rest of the org; no dual-CI drift.
- The full shared workflow library is available: `node-application-static-analysis.yml` and
  `node-application-tests.yml` cover static analysis, tests, content validation and the build gate.

**Bad**

- **Driver 4 has no precedent.** There is no Cloudflare or wrangler workflow anywhere in
  `webgrip/workflows` — this repository is the org's first Cloudflare consumer. The deploy is
  therefore inlined here rather than reused, and `wrangler` is invoked via `pnpm dlx` so nothing
  depends on how forgejo-runner resolves third-party actions. Phase 2 extracts it into
  `webgrip/workflows` as `cloudflare-deploy.yml` in **both** trees, per that repo's two-tree ADR.
- Contributors without a Forgejo account cannot open a pull request directly. Mitigated by the issue
  forms in Phase 2 and the Turnstile-protected web form in Phase 3.
- GitHub-only capabilities (GitHub App tokens, GitHub Models, GitHub Pages, Advanced Security) are
  unavailable. None are needed here.

## Confirmation

- `.forgejo/workflows/on_source_change.yml` runs green on a push.
- The production deploy publishes to Cloudflare and the smoke test passes.

## Revision Log

| Date       | Version | Change                                                                                                                                                                                                                                                                                                                                |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-08-03 | 1.0.0   | Initial decision                                                                                                                                                                                                                                                                                                                      |
| 2026-09-18 | 1.0.1   | The `@v6` claim in the body is disproven — a canary on the real runner ([homelab-cluster run 1710](https://forgejo.webgrip.dev/webgrip/homelab-cluster/actions/runs/1710)) shows checkout v6/v7 and setup-node v5/v6/v7 all pass. The v5 pin stays as a pin; the decision (Forgejo as CI and release authority) never depended on it. |
