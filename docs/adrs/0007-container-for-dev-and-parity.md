# ADR 0007 – A container for local development and production parity, not for deployment

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-08-04
- **Tags**: DevEx, Infrastructure::Local, CI
- **Version**: 1.0.0

---

## Context and Problem Statement

Production is Cloudflare Workers Static Assets (ADR 0002). Cloudflare applies routing and header
rules that live in `wrangler.toml` and `public/_headers` — extensionless URLs, a real 404 status,
cache policy, security headers — and **none of those rules are exercised by `astro dev` or
`astro preview`**.

That leaves a class of defect with no local signal at all: a redirect that loops, a 404 served with a
200, a cache header on the wrong path, a missing `X-Content-Type-Options`. The only place to discover
them would be production.

Separately, contributors need a way to run the site without matching the host toolchain by hand.

## Decision Drivers

| #   | Driver                                                                    |
| --- | ------------------------------------------------------------------------- |
| 1   | Exercise Cloudflare's serving rules locally, before they reach production |
| 2   | One-command dev environment for contributors                              |
| 3   | Do not create a second deployment path to keep in sync                    |
| 4   | Do not duplicate the quality gates the shared CI library already runs     |

## Considered Options

1. **Container for dev and parity only**; Cloudflare stays the sole deploy target
2. **Container as an additional deployable artifact** — push to the registry, self-host as a mirror
3. **Replace Cloudflare with the homelab cluster**, matching the erfbeeld Helm pattern
4. **No container** — rely on `astro preview` and find serving bugs in production

## Decision Outcome

### Chosen Option

**Option 1.** `ops/docker/web/` builds the site and serves `dist/` with nginx, configured to mirror
Cloudflare. `ops/local/docker-compose.yml` provides a hot-reloading `dev` service and a
production-parity `preview` service. Cloudflare remains the only deploy target.

The mirroring is enforced by `ops/local/parity-check.sh` (`just parity`), which asserts the routing,
status codes, content types and headers over real HTTP. **The parity claim is a test, not a
comment** — an unverified claim of parity is worse than no container, because it invites trust it has
not earned.

That was not hypothetical. The first run of the check caught a server-level `types { }` block in
`nginx.conf` that _replaced_ nginx's entire mime map rather than extending it, serving every page and
stylesheet as `application/octet-stream` — a site that downloads instead of renders. Nothing else in
the toolchain would have flagged it.

### Rejected options and why

- **Option 2** — a published image implies someone may run it, which means a second serving path to
  keep in sync with Cloudflare for no current benefit (driver 3). Cheap to add later if a fallback is
  ever wanted; the Dockerfile already produces the artifact.
- **Option 3** — supersedes ADR 0002, whose entire basis was €0 hosting, and adds a cluster to
  operate for a static site. Not proportionate.
- **Option 4** — leaves driver 1 unmet, which is the whole reason this ADR exists.

### Consequences

**Good**

- Serving behaviour is verifiable locally and asserted in CI.
- `public/_headers` and `ops/docker/web/security-headers.conf` are a declared mirrored pair; the
  parity check fails if they drift.
- Contributors get `just dev-docker` without installing Node or pnpm.
- CSP is emitted by Astro with per-page hashes (`security.csp`), so the policy travels with the HTML
  and is identical under both servers — no `unsafe-inline` despite an inline theme script.

**Bad**

- Two places define response headers. Mitigated by the parity check, but it is real duplication and
  the mirroring is by convention, not by generation.
- The container's fidelity is only as good as the assertions. It reproduces Cloudflare's documented
  behaviour, not Cloudflare.
- The CI parity job assumes the forgejo-runner can build images and reach a published port. The org
  builds images with `runs-on: docker` elsewhere, but this is unverified here — hence the job is
  **not** a dependency of the deploy jobs.

**Explicitly out of scope**

- No image push, no registry, no Helm chart (driver 3).
- No containerized CI runner; the shared `node-application-*` workflows keep running the gates
  (driver 4).

## Confirmation

- `just parity` passes all checks against the built image.
- `just dev-docker` serves the site with working hot reload through the bind mount.
- The `container-parity` CI job builds the image and runs the same script.

## Revision Log

| Date       | Version | Change           |
| ---------- | ------- | ---------------- |
| 2026-08-04 | 1.0.0   | Initial decision |
