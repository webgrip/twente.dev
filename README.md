# twente.dev

Twente's practitioner-led technology community — a shared calendar, directory, archive and
newsletter, built around numbered flagship events (first up: **twente.dev/001 — Reconnect**,
7 October 2026, Enschede). Bilingual NL/EN. _We build it. We run it. We share it._

A static Astro site on Cloudflare's free tier, built and deployed from Forgejo Actions. No backend,
no database, no cookies. Total recurring cost: one domain renewal.

- **Plan**: [`docs/plan/10x-plan.md`](docs/plan/10x-plan.md), updated by
  [`docs/plan/playbook-alignment.md`](docs/plan/playbook-alignment.md) (ADR 0008)
- **Decisions**: [`docs/adrs/`](docs/adrs/)
- **Contributing**: [`CONTRIBUTING.md`](CONTRIBUTING.md)

## Quick start

[mise](https://mise.jdx.dev) pins the toolchain, [just](https://just.systems) runs the tasks.

```bash
mise install      # Node 24 + just, per mise.toml
just setup        # corepack enable + pnpm install
just              # list every task
```

Then:

```bash
just dev          # http://localhost:4321, hot reload
just preview      # http://localhost:8080, the production image
just parity       # assert the container matches Cloudflare
just check        # every gate CI runs
```

No local Node at all? `just dev-docker` runs the dev server in a container.

pnpm is deliberately not pinned in `mise.toml` — its version is `packageManager`
in `package.json`, which corepack reads and which the Dockerfile and CI use too.
Pinning it twice is how a laptop and a container quietly end up on different
pnpm versions.

## Scripts

Every `just` recipe wraps a pnpm script, so both work. `just --list` is the
canonical index; the scripts themselves are:

| Command                     | What it does                                                           |
| --------------------------- | ---------------------------------------------------------------------- |
| `pnpm dev`                  | Dev server                                                             |
| `pnpm build`                | Static build into `dist/`, then the Pagefind search index              |
| `pnpm preview`              | Serve the built output locally                                         |
| `pnpm typecheck`            | `astro check` — also the i18n completeness gate (see below)            |
| `pnpm lint` / `pnpm format` | ESLint / Prettier                                                      |
| `pnpm test`                 | Unit tests for `src/lib`                                               |
| `pnpm validate:content`     | Cross-entry content checks (references, duplicate slugs, translations) |
| `pnpm expire:jobs`          | Read-only report of jobs about to lapse                                |

## How it fits together

**Two locales, explicit prefixes.** Everything lives under `/nl/…` or `/en/…`; `/` redirects. Route
_segments_ are localized too (`/nl/vacatures` ↔ `/en/jobs`), which is why URLs are always built with
`routePath()` from [`src/i18n/routes.ts`](src/i18n/routes.ts) and never by string-swapping a prefix.
`hreflang` alternates come from the same table, so they cannot point at a page that was never built.

**Missing translations are a compile error.** [`src/i18n/ui.ts`](src/i18n/ui.ts) types the English
dictionary as `Record<UIKey, string>` against the Dutch one. Add a key to `nl` and forget `en`, and
`pnpm typecheck` fails. There is no runtime fallback — an English page can never silently render
Dutch.

**Content is the contribution contract.** The five collections in
[`src/content.config.ts`](src/content.config.ts) are Zod-validated at build time, so a malformed
submission fails CI before a human reviews it. `pnpm validate:content` adds the cross-entry checks a
per-entry schema cannot see.

**Jobs and events expire by themselves.** `validThrough` is required on every job. Nothing deletes
files; the selectors in [`src/lib/content.ts`](src/lib/content.ts) filter on the current time and the
nightly rebuild re-runs them. That is the whole expiry mechanism.

**Structured data is the distribution channel.** [`src/lib/jsonld.ts`](src/lib/jsonld.ts) emits
`JobPosting` and `Event` JSON-LD so Google for Jobs and Google Events index the content directly.
It is the highest-leverage code here per line and the easiest to break silently — Google ignores
malformed entries rather than reporting them, so check changes against the Rich Results Test.

## Content

> ⚠️ The companies, jobs and events currently in `src/content/` are **fixtures** with fictional
> organisations. Delete them before launch — see [`src/content/README.md`](src/content/README.md).

Per the plan, the jobs section does not launch publicly until 15+ genuine listings are seeded. An
empty job board reads as abandoned and is hard to recover from.

## Local containers

The container is **not** the deploy target ([ADR 0007](docs/adrs/0007-container-for-dev-and-parity.md)).
It exists because `astro dev` and `astro preview` do not exercise any of Cloudflare's serving rules —
extensionless URLs, a real 404 status, cache policy, security headers — which leaves a class of bug
with no local signal at all.

| Path                                                                           | What                                                                  |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| [`ops/docker/web/Dockerfile`](ops/docker/web/Dockerfile)                       | Multi-stage build; nginx-unprivileged serves `dist/`                  |
| [`ops/docker/web/nginx.conf`](ops/docker/web/nginx.conf)                       | Mirrors `html_handling` and `not_found_handling` from `wrangler.toml` |
| [`ops/docker/web/security-headers.conf`](ops/docker/web/security-headers.conf) | Mirror of [`public/_headers`](public/_headers)                        |
| [`ops/local/docker-compose.yml`](ops/local/docker-compose.yml)                 | `dev` (hot reload) and `preview` (production image)                   |
| [`ops/local/parity-check.sh`](ops/local/parity-check.sh)                       | Asserts the mirroring over real HTTP                                  |

**The parity claim is a test, not a comment.** `just parity` checks routing, status codes, content
types and headers against the running container. Its first run caught a `types { }` block in
`nginx.conf` that replaced nginx's entire mime map — serving every page as `application/octet-stream`,
i.e. a site that downloads rather than renders. Nothing else in the toolchain would have caught it.

Two things worth knowing if you edit the serving config:

- **Response headers are defined twice**, in `public/_headers` (Cloudflare) and
  `security-headers.conf` (nginx). Change one, change both — the parity check fails if they drift.
- **`add_header` does not inherit** into an nginx location that declares its own. That is why every
  location `include`s the shared snippet rather than relying on the server block.

The main CSP is not in either file: Astro emits it as a `<meta>` element with per-page hashes for
every inline script and scoped style (`security.csp` in `astro.config.mjs`), so the policy travels
with the HTML and is identical under both servers — no `unsafe-inline` despite the inline theme
script. Only `frame-ancestors`, which meta-delivered CSP ignores, needs a real header.

## Deployment

Cloudflare Workers Static Assets, deployed with `wrangler` from Forgejo Actions. Cloudflare's native
git integration supports GitHub and GitLab only, so there is no "connect the repo" path for a Forgejo
consumer — [`wrangler.toml`](wrangler.toml) plus the CI job _is_ the deployment contract.

CI needs two Forgejo secrets: `CLOUDFLARE_API_TOKEN` (scoped to Workers Scripts: Edit + Account:
Read — not a global key) and `CLOUDFLARE_ACCOUNT_ID`.

Pushes to any branch get a preview URL; `main` deploys to production and runs a smoke test.

## Licence

Code MIT, content CC BY 4.0. See [`LICENSE`](LICENSE).
