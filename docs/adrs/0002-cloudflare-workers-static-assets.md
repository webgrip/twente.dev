# ADR 0002 – Cloudflare Workers Static Assets over Cloudflare Pages

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-08-03
- **Tags**: Infrastructure::Hosting, Cost, CI
- **Version**: 1.0.0

---

## Context and Problem Statement

The site must be hosted for free, on a CDN, with a custom domain, and deployed from CI. Cloudflare
offers two products that fit: Pages and Workers Static Assets. They are close enough in capability
that the usual comparison (build minutes, bandwidth, custom domains) does not separate them for a
site this size.

What separates them is how the deploy is triggered — and that interacts with ADR 0003.

## Decision Drivers

| #   | Driver                                               |
| --- | ---------------------------------------------------- |
| 1   | €0 recurring hosting cost                            |
| 2   | Deployable from Forgejo Actions (see ADR 0003)       |
| 3   | Per-branch preview URLs for content review           |
| 4   | Room to add edge behaviour later without a migration |
| 5   | Migration to another static host must stay cheap     |

## Considered Options

1. **Cloudflare Workers Static Assets** — assets-only Worker, deployed with `wrangler`
2. **Cloudflare Pages** — deployed with `wrangler pages deploy`, or via git integration
3. **Static host on the existing homelab-cluster** — full control

## Decision Outcome

### Chosen Option

**Cloudflare Workers Static Assets**, deployed with `wrangler` from Forgejo Actions.

The decisive fact: **Cloudflare's native git integration supports GitHub and GitLab only — not
Forgejo.** Since CI runs on Forgejo (ADR 0003), we must push builds with `wrangler` regardless of
which product we target. That removes Pages' principal advantage — git-connected auto-deploys — and
with the products otherwise comparable, Workers Static Assets is the better remaining choice: it is
where Cloudflare directs new projects, and it leaves room to put a Worker in front of the assets
later (driver 4) without migrating.

Concretely, driver 4 already has a known consumer: `Accept-Language` negotiation at `/` is impossible
in a purely static build and is deferred to Phase 3, when a Worker can do it.

### Rejected options and why

- **Pages** — a fine choice, and the fallback if a Workers limit bites. Its git integration, the one
  thing that would have decided this, is unavailable to us.
- **Homelab-cluster** — contradicts driver 1 in spirit (someone pays for and operates that cluster)
  and adds an operational dependency to a site whose entire premise is that there is nothing to
  operate.

### Consequences

**Good**

- Static asset requests are not metered as Worker invocations.
- Deployment is one `wrangler deploy`, identical from CI and from a laptop.
- `wrangler versions upload` gives preview URLs without extra infrastructure (driver 3).

**Bad**

- No dashboard "connect your repo" path; `wrangler.toml` plus the CI job _is_ the contract, and it
  must be kept correct by hand.
- Free-tier limits (asset count, file size) are Cloudflare's to change. Mitigated by driver 5: the
  build output is a plain `dist/` directory, so moving to Pages or any other static host is a
  same-day migration.

## Confirmation

- `pnpm build && pnpm dlx wrangler deploy` publishes the site.
- The production deploy job smoke-tests `/nl`, `/en`, both job list URLs, `/events.ics` and
  `/robots.txt` for HTTP 200.

## Revision Log

| Date       | Version | Change           |
| ---------- | ------- | ---------------- |
| 2026-08-03 | 1.0.0   | Initial decision |
