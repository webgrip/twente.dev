# twente.dev

The homepage for software developers in Twente — meetups, jobs, companies and community writing, in
Dutch and English.

A static Astro site on Cloudflare's free tier, built and deployed from Forgejo Actions. No backend,
no database, no cookies. Total recurring cost: one domain renewal.

- **Plan**: [`docs/plan/10x-plan.md`](docs/plan/10x-plan.md)
- **Decisions**: [`docs/adrs/`](docs/adrs/)
- **Contributing**: [`CONTRIBUTING.md`](CONTRIBUTING.md)

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:4321 — redirects to /nl
```

Requires Node `^22.14.0 || >=24.10.0` and pnpm.

## Scripts

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

## Deployment

Cloudflare Workers Static Assets, deployed with `wrangler` from Forgejo Actions. Cloudflare's native
git integration supports GitHub and GitLab only, so there is no "connect the repo" path for a Forgejo
consumer — [`wrangler.toml`](wrangler.toml) plus the CI job _is_ the deployment contract.

CI needs two Forgejo secrets: `CLOUDFLARE_API_TOKEN` (scoped to Workers Scripts: Edit + Account:
Read — not a global key) and `CLOUDFLARE_ACCOUNT_ID`.

Pushes to any branch get a preview URL; `main` deploys to production and runs a smoke test.

## Licence

Code MIT, content CC BY 4.0. See [`LICENSE`](LICENSE).
