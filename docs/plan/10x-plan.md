# twente.dev — 10x Plan

> **Status**: Draft for ratification · **Date**: 2026-08-03 · **Owner**: Ryan Grippeling (Webgrip)
> **Scope decisions locked**: community hub + content/blog + company directory + job board · Forgejo Actions · full program

---

## 0. The bet, in one paragraph

twente.dev becomes **the default homepage for software developers in Twente** — the place you check for what's happening this month, who's hiring, which companies actually do interesting engineering work, and what people in the region are writing about. It is a bilingual (NL/EN) static site, built with Astro, deployed to Cloudflare's free tier from Forgejo Actions, with zero recurring hosting cost and zero backend to operate. Every dynamic-feeling feature (jobs, events, search, submissions) is achieved through build-time generation plus scheduled rebuilds, so the operational surface stays at _one static bundle_.

**What makes this 10x rather than "a nice regional site"** is not the tech — it's three compounding distribution levers wired in from day one:

1. **Structured data as a distribution channel.** `JobPosting` and `Event` JSON-LD means Google for Jobs and Google Events index the content directly. A static site that ranks in Google for Jobs punches far above a job board with a backend that doesn't.
2. **Bilingual by construction, not by translation debt.** Twente's dev population is unusually split — Dutch professionals plus a large international cohort from the University of Twente. Serving both properly with correct `hreflang` doubles the addressable audience and doubles the indexed surface area.
3. **Contribution as the growth engine.** Companies, events, and jobs arrive as pull requests / issue forms, not as data entry by one person. The site scales with the community's participation rather than with the maintainer's evenings.

Everything below is in service of those three.

---

## 1. What "10x" means here — the levers, ranked

| #   | Lever                                                                       | Why it compounds                                                               | Phase |
| --- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----- |
| L1  | `JobPosting` JSON-LD → Google for Jobs                                      | Free, high-intent traffic. Nobody else in Twente does this well.               | 2     |
| L2  | `Event` JSON-LD + public ICS feed                                           | Meetup organisers link _to you_ because you give them a subscribable calendar. | 2     |
| L3  | NL/EN with real `hreflang` + per-locale sitemaps                            | 2× indexed pages, 2× audience, near-zero marginal cost                         | 1     |
| L4  | PR/issue-form contribution pipeline                                         | Content scales with community, not with maintainer time                        | 2–3   |
| L5  | Company directory with tech-stack facets                                    | The "who in Twente does Rust/Go/Elixir" query has no good answer today         | 3     |
| L6  | Per-locale RSS + newsletter                                                 | Owned audience; not rented from an algorithm                                   | 3     |
| L7  | Auto-generated OG images                                                    | Every share looks designed; measurably lifts CTR                               | 2     |
| L8  | Pagefind static search                                                      | Feels like an app, costs nothing, works offline of any backend                 | 3     |
| L9  | Scheduled rebuild (nightly)                                                 | Expired jobs/past events vanish without human action                           | 2     |
| L10 | Reusable Cloudflare deploy workflow contributed back to `webgrip/workflows` | Every future Webgrip static site inherits this for free                        | 2     |

L10 is the org-level 10x: this repo is Webgrip's **first** Cloudflare consumer (verified — no `cloudflare`/`wrangler` references exist anywhere in `webgrip/workflows` today). Whatever we build here becomes the org pattern.

---

## 2. Architecture decisions

These should be ratified as ADRs in `docs/adrs/` using MADR 4.0.0, matching the `webgrip/workflows` convention.

### ADR-0001 — Astro as the site framework

**Recommendation: Astro 5, `output: 'static'`.**

Astro is the right fit for a content-heavy, mostly-static, i18n site: content collections with Zod-validated schemas give us a typed content model (essential when contributions arrive as PRs from strangers), i18n routing is first-class, and the islands model means we ship ~zero JS on most pages. Alternatives considered: Hugo (fastest builds, but weak typed-content story and painful component authoring), Next.js static export (heavier, i18n static export is awkward), Eleventy (fine, but no schema validation or component islands out of the box).

### ADR-0002 — Cloudflare Workers Static Assets over Cloudflare Pages

**Recommendation: Workers Static Assets.**

The decisive factor: **Cloudflare's native git integration supports GitHub and GitLab only — not Forgejo.** Since we deploy from Forgejo Actions, we must push builds with `wrangler` regardless of target. That removes Pages' main advantage (git-connected auto-deploys), leaving Workers Static Assets as the forward-looking choice — it is where Cloudflare directs new projects, and it leaves the door open to a Worker for dynamic edges later (form handling, redirects, A/B) without a migration.

Free-tier characteristics to verify against current Cloudflare docs at implementation time (they change): static asset requests are not metered as Worker requests, custom domains are included, and bandwidth is unmetered. Budget check in Phase 0 before committing.

> **Fallback**: if a Workers Static Assets limit bites (asset count, file size), Pages via `wrangler pages deploy` is a same-day migration. Keep the build output framework-agnostic (`dist/`) so this stays cheap.

### ADR-0003 — Forgejo is the sole CI/CD and release authority

Consistent with `webgrip/workflows` ADR-0002 (Forgejo Actions Parity, two-tree layout) and the `@webgrip/semantic-release-config` posture ("Forgejo is the sole release authority"). Consumers reference workflows by **full URL**:

```yaml
uses: https://forgejo.webgrip.dev/webgrip/workflows/.forgejo/workflows/<name>.yml@main
```

Runners use `runs-on: docker`. No GitHub mirror in Phase 0–2; reconsider a read-only public mirror in Phase 4 purely for contributor discoverability.

### ADR-0004 — Locale strategy: explicit prefixes for both languages

**Recommendation: `/nl/…` and `/en/…`, both explicit; `/` redirects on `Accept-Language`.**

```js
// astro.config.mjs (sketch — verify against Astro 5 docs)
export default defineConfig({
  site: 'https://twente.dev',
  i18n: {
    locales: ['nl', 'en'],
    defaultLocale: 'nl',
    routing: { prefixDefaultLocale: true },
  },
});
```

Explicit prefixes for both locales avoid the classic bare-root/`hreflang` ambiguity, make canonical URLs unambiguous, and let each locale own a clean sitemap. `nl` is the default because region-intent Dutch queries ("developer vacatures Twente", "meetup Enschede") are the highest-conversion entry point; English is a peer, not an afterthought.

**Non-negotiable rule**: no machine-translated content ships without human review. A half-translated page is worse than an honest "this article is only available in Dutch" with a link to the NL version.

### ADR-0005 — Contributions as data, reviewed as code

All community content (companies, events, jobs) lives as versioned files in the repo. Submissions arrive via Forgejo issue forms in Phase 2, upgraded to a Turnstile-protected Worker form in Phase 3 that opens the issue via the Forgejo API. Review is a normal PR review with schema validation in CI. This makes moderation auditable and spam-resistant without a database.

### ADR-0006 — Privacy-first analytics, no cookie banner

**Recommendation: Cloudflare Web Analytics.** Cookieless, free, no consent banner required under GDPR/ePrivacy for aggregate non-identifying measurement. Alternative worth weighing: self-hosted Umami on the existing `homelab-cluster` — more control and richer funnels, but adds an operational dependency to a site whose entire premise is "nothing to operate." Start with Cloudflare; revisit if we need per-job-listing conversion tracking.

### Decisions still open (do not block Phase 0)

- Newsletter provider (Buttondown free tier vs. listmonk on homelab-cluster) — decide in Phase 3.
- Whether company profiles are free-forever or become a sponsorship tier — decide in Phase 5, but **design the data model as if sponsorship exists** (a `tier` field costs nothing now and is painful to retrofit).
- Domain registration status for `twente.dev` — **verify before Phase 0 completes**. Note: `.dev` is on the HSTS preload list TLD-wide, so HTTPS is enforced by browsers automatically; no HSTS rollout work needed.

---

## 3. Domain & content model

Five collections, each Zod-validated at build time. Validation failure = red CI = the PR cannot merge. This is what lets us accept contributions from people we've never met.

```
src/content/
  posts/       {nl,en}/*.md      — articles, guides, scene writing
  events/      *.yml             — meetups, conferences, workshops
  companies/   *.yml             — directory entries
  jobs/        *.yml             — vacancies (expiring)
  communities/ *.yml             — Discords, Slacks, user groups
```

**Locale handling differs per collection by design.** Posts are locale-owned (an article is written in one language; a translation is a sibling file linked by `translationKey`). Events, companies, jobs, and communities are single entities with translatable _fields_ (`title: {nl, en}`, `description: {nl, en}`) — because a job at Thales is one job, not two.

### Field sketches (illustrative, refine in Phase 1)

**`jobs/*.yml`** — the schema that feeds Google for Jobs, so it must carry every field `JobPosting` needs:
`slug`, `company` (ref → companies), `title{nl,en}`, `description{nl,en}`, `employmentType`, `location` (city + `remote|hybrid|onsite`), `salaryRange?`, `applyUrl`, `datePosted`, `validThrough` (**required** — drives auto-expiry), `stack[]`, `seniority`, `languageRequirement` (`dutch-required` | `english-ok` — a genuinely useful facet for the international cohort that no competitor exposes).

**`companies/*.yml`**: `slug`, `name`, `website`, `logo`, `size`, `locations[]`, `stack[]`, `description{nl,en}`, `hiring` (bool), `tier` (`community|partner`), `socials`.

**`events/*.yml`**: `slug`, `title{nl,en}`, `start`/`end` (with timezone), `venue`, `organiser`, `url`, `cost`, `language`, `recurring?`, `cancelled?`.

### Derived outputs (all build-time)

- `/nl/sitemap.xml`, `/en/sitemap.xml` + index, with `hreflang` alternates
- `/nl/rss.xml`, `/en/rss.xml`
- `/events.ics` — subscribable calendar feed (L2)
- Per-page JSON-LD: `JobPosting`, `Event`, `Organization`, `BreadcrumbList`, `Article`
- OG images per post/job/event via build-time generation
- Pagefind index, built per locale

---

## 4. Design system

A small, deliberate system — not a component library shopping trip.

- **Tokens first**: colour, type scale, spacing, radii as CSS custom properties. Light + dark from day one (dev audience; dark mode is table stakes).
- **Regional identity, not generic startup gradient.** Twente has real visual vocabulary to draw on: the red-white Twente flag palette, textile-industry heritage, the Enschede/Hengelo/Almelo triangle. Aim for something a local recognises instantly.
- **Type**: variable font, self-hosted, subset per locale, `font-display: swap`. No third-party font CDN (privacy + a render-blocking third party is a performance liability).
- **Components**: ~15 total. Card (job/event/company variants), Filter chip, Locale switcher, Nav, Footer, Prose, Callout, Tag, Pagination, Search, Badge, Empty state, Date/time (locale-aware), Avatar, Logo wall.
- **Zero-JS default.** JS islands only for: search, directory filtering, theme toggle. Everything else renders static.
- **Accessibility is a gate, not a goal**: WCAG 2.2 AA, keyboard-complete, `prefers-reduced-motion` honoured, verified by automated axe checks in CI (§6).

---

## 5. Repository structure

```
twente.dev/
├── .forgejo/workflows/       # CI/CD — see §6
├── docs/
│   ├── adrs/                 # MADR 4.0.0, per webgrip convention
│   ├── plan/10x-plan.md      # this document
│   └── techdocs/             # mkdocs, matching webgrip/workflows layout
├── src/
│   ├── content/              # the five collections (§3)
│   ├── content.config.ts     # Zod schemas — the contribution contract
│   ├── components/
│   ├── layouts/
│   ├── pages/{nl,en}/
│   ├── i18n/{nl,en}.json     # UI strings
│   └── lib/                  # jsonld, ics, og-image, filters
├── scripts/
│   ├── expire-jobs.ts        # nightly hygiene
│   └── validate-content.ts   # schema + link + logo checks
├── public/
├── astro.config.mjs
├── wrangler.toml
├── .releaserc.json           # @webgrip/semantic-release-config
├── renovate.json             # extends webgrip org preset
└── package.json
```

Package manager: **pnpm** (the shared workflows auto-detect it from `pnpm-lock.yaml`). Node 22 to match the org's `engines` floor.

---

## 6. CI/CD

This is the part with the most Forgejo-specific detail, because it's the part with no precedent to copy.

### 6.1 Pipeline shape

```
push (any branch)
  └─ static-analysis ──┐
                       ├─ build ── validate-content ──┬─ preview-deploy (PR)
  └─ content-lint ─────┘                              └─ (main) production-deploy → smoke → announce
```

### 6.2 `on_source_change.yml` — reusing the org library

```yaml
name: '[Workflow] On Source Change'

concurrency:
  group: push-${{ github.ref_name }}
  cancel-in-progress: true

on:
  workflow_dispatch:
  push:
    branches: ['**']

permissions:
  contents: read

jobs:
  static-analysis:
    name: 'Static Analysis'
    uses: https://forgejo.webgrip.dev/webgrip/workflows/.forgejo/workflows/node-application-static-analysis.yml@main
    with:
      node-version: '22'
      package-manager: pnpm
      run-format-check: true
      run-lint: true
      run-typecheck: true
      run-audit: true
      run-knip: true

  build:
    name: 'Build Site'
    needs: [static-analysis]
    uses: https://forgejo.webgrip.dev/webgrip/workflows/.forgejo/workflows/node-application-tests.yml@main
    with:
      node-version: '22'
      package-manager: pnpm
      test-command: pnpm build
```

The shared `node-application-static-analysis.yml` already exposes exactly the toggles we need (`run-format-check`, `run-lint`, `run-typecheck`, `run-audit`, `run-knip`) — verified against the current `.forgejo/` tree. `node-application-tests.yml` accepts a `test-command` override, which is how we reuse it as a build gate (the same trick the org's dotnet/node monorepo example uses for its frontend build).

### 6.3 The deploy job — new ground

No Cloudflare workflow exists in `webgrip/workflows`. Plan:

- **Phase 1**: an inline `deploy` job in this repo (fastest path to a live site).
- **Phase 2**: extract it into `webgrip/workflows` as `cloudflare-deploy.yml` in **both** trees (`.github/` and `.forgejo/`, per the two-tree ADR), then consume it from here. This is lever L10.

Sketch of the inline version:

```yaml
deploy-production:
  name: 'Deploy to Cloudflare'
  needs: [build]
  if: github.ref == 'refs/heads/main'
  runs-on: docker
  environment: production
  steps:
    - uses: actions/checkout@v5
    - run: corepack enable && pnpm install --frozen-lockfile
    - run: pnpm build
    - name: Deploy
      env:
        CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
      run: pnpm dlx wrangler deploy
```

Note `actions/checkout@v5`, not `@v6` — the org's Forgejo tree pins v5 because v6 is broken on non-GitHub runners (documented in `webgrip/workflows` ADR-0002). Consistency here is not optional.

**Preview deploys**: on PRs, `wrangler versions upload` produces a preview URL; post it as a PR comment via the Forgejo API. This is the single highest-value CI feature for a content site — reviewers see the rendered page, not the YAML diff.

### 6.4 Secrets

Two secrets, stored as Forgejo repo/org secrets: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. The token must be scoped to the minimum (Workers Scripts: Edit + Account: Read), **not** a global API key. Per the org's `guard-secrets` floor: never inline a token into a workflow, a config file, or a committed `.env`; anything that must live in the repo goes through SOPS. CI secrets belong in Forgejo's secret store, not SOPS — SOPS is for repo-resident config.

### 6.5 Scheduled workflows

| Workflow              | Cadence                      | Purpose                                                                                                  |
| --------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------- |
| `nightly-rebuild.yml` | daily 04:00 Europe/Amsterdam | Rebuild so expired jobs and past events drop off (L9)                                                    |
| `link-check.yml`      | weekly                       | `lychee` across built output; open an issue on breakage                                                  |
| `content-hygiene.yml` | weekly                       | Flag jobs within 7 days of `validThrough`, stale company entries, dead logos                             |
| Renovate              | per org preset               | Extends the Webgrip preset — already `:timezone(Europe/Amsterdam)`, pinned digests, graduated soak times |

Timezone note: the org Renovate preset already standardises on `Europe/Amsterdam`; use the same for all cron schedules so nothing fires at a surprising local hour.

### 6.6 Quality gates (all blocking on `main`)

1. Format (Prettier) · Lint (ESLint) · Typecheck (`astro check` + `tsc`) · Knip (dead deps)
2. **Content schema validation** — Zod parse of all five collections
3. Build succeeds with zero warnings
4. **Lighthouse CI budgets**: Performance ≥ 95, Accessibility = 100, Best Practices ≥ 95, SEO = 100. Budgets are committed as `lighthouserc.json`; regressions fail the build.
5. **axe-core accessibility scan** via Playwright across a representative page set
6. **Link check** on built output (internal links blocking, external links warning)
7. **i18n completeness**: every UI string key present in both `nl.json` and `en.json`; every route resolvable in both locales
8. Unit tests for `lib/` (JSON-LD generation, ICS generation, date/locale formatting) — `node --test`, matching the org's convention in `@webgrip/semantic-release-config`

### 6.7 Releases

`@webgrip/semantic-release-config` from the Forgejo npm registry (`https://forgejo.webgrip.dev/api/packages/webgrip/npm/`), conventional commits, Forgejo as sole release authority. For a website, releases are primarily a changelog and a deploy audit trail rather than a published artefact — still worth having, because "when did the site change and why" is exactly the question you ask during an incident.

---

## 7. Performance, SEO, and privacy targets

| Metric                      | Target             |
| --------------------------- | ------------------ |
| LCP (mobile, p75)           | < 1.2s             |
| CLS                         | < 0.05             |
| INP                         | < 100ms            |
| JS shipped, content pages   | < 10 KB            |
| Total page weight, homepage | < 150 KB           |
| Lighthouse Performance      | ≥ 95 (CI-enforced) |
| Lighthouse A11y             | 100 (CI-enforced)  |

SEO checklist wired into the base layout so it cannot be forgotten per-page: canonical URL, `hreflang` alternates (both locales + `x-default`), OG/Twitter cards, per-type JSON-LD, per-locale sitemap, `robots.txt`, breadcrumbs.

Privacy: no cookies, no third-party fonts, no third-party scripts beyond Cloudflare's cookieless analytics beacon. This is both an ethical position and a performance one — and it means no consent banner, which is itself a conversion advantage.

---

## 8. Contribution & moderation

**Phase 2 (zero infra)**: Forgejo issue form templates — "Submit a job", "Submit an event", "Add your company". A maintainer converts the issue to a PR; schema validation in CI catches malformed data before review.

**Phase 3 (self-service)**: a Cloudflare Worker form protected by Turnstile posts to the Forgejo API and opens the issue directly. Contributors never need a Forgejo account. This is the step that decouples growth from maintainer availability (L4).

**Moderation policy** (write it before you need it, publish it at `/nl/richtlijnen` and `/en/guidelines`): jobs must be at a Twente-based employer or explicitly Twente-remote; no recruitment agencies reposting; salary transparency encouraged and badged when present; companies get one entry, not one per product; events must be open to the public.

**`CONTRIBUTING.md` in both languages**, plus `CODEOWNERS` — matching the `renovate-config` repo's convention.

---

## 9. Phased roadmap

Sizing assumes evenings-and-weekends effort, one primary maintainer. Compress freely if that changes.

### Phase 0 — Foundations (week 1)

Verify `twente.dev` registration and move DNS to Cloudflare · confirm free-tier limits against current Cloudflare docs · scaffold Astro + pnpm + TypeScript strict · ADRs 0001–0006 written and accepted · Renovate extending the org preset · `.forgejo/workflows/on_source_change.yml` wired to the shared library.
**Exit**: CI green on an empty site; ADRs merged.

### Phase 1 — Bilingual skeleton live (weeks 2–3)

Design tokens + the ~15 components · i18n routing with both prefixes · homepage, about, guidelines in NL + EN · base layout with the full SEO head · Cloudflare deploy job + preview deploys on PRs · Lighthouse CI budgets enforced · analytics live.
**Exit**: **twente.dev is live and bilingual**, every PR gets a preview URL.

### Phase 2 — The three content engines (weeks 4–7)

Content collections + Zod schemas · events with `Event` JSON-LD and the ICS feed · jobs with `JobPosting` JSON-LD and `validThrough` auto-expiry · nightly rebuild · issue-form submissions · OG image generation · per-locale RSS · **extract `cloudflare-deploy.yml` into `webgrip/workflows` (L10)**.
**Exit**: 15+ real jobs, 10+ real events, Google for Jobs indexing confirmed in Search Console.

### Phase 3 — Directory, search, and self-service (weeks 8–11)

Company directory with stack/size/location facets · Pagefind search per locale · Worker + Turnstile submission form · communities page · newsletter (provider decided) · blog with 5 seed articles.
**Exit**: contributors submit without maintainer intervention; search works in both locales.

### Phase 4 — Community integration (weeks 12–15)

Meetup/Eventbrite ingestion into the events pipeline (scheduled workflow opens a PR, human merges — never auto-publish scraped data) · partnerships with UT, Novel-T, Saxion, local meetup organisers · "who's hiring" monthly thread · optional public GitHub mirror for contributor discoverability.
**Exit**: organisers submit events unprompted.

### Phase 5 — Sustainability (week 16+)

Sponsorship tier for company profiles (model already supports it) · annual "State of Dev in Twente" survey + report — the single highest-leverage content asset a regional site can own · job alert emails · governance so the site outlives any one maintainer.

---

## 10. Risks

| Risk                                                             | Impact  | Mitigation                                                                                                                   |
| ---------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Empty-directory problem** — a job board with 3 jobs looks dead | High    | Do not launch jobs publicly until 15+ real listings are seeded via direct outreach. Phase 2's exit criterion encodes this.   |
| Translation debt — EN lags NL, or vice versa                     | High    | CI gate on UI-string parity; explicit "only available in NL" UX for articles; never machine-translate silently               |
| Forgejo → Cloudflare has no precedent in the org                 | Medium  | Spike the deploy in Phase 0 before committing the rest of the plan to it. It's the one genuinely unproven link in the chain. |
| Cloudflare free-tier limits change                               | Medium  | Keep output as plain `dist/`; Pages and other static hosts are a same-day migration                                          |
| Spam once submissions are self-service                           | Medium  | Turnstile + PR review gate + published moderation policy                                                                     |
| Single-maintainer bus factor                                     | High    | Everything in git, ADRs explain _why_, `CODEOWNERS` + governance in Phase 5                                                  |
| Scraped event data creating legal/quality issues                 | Low–Med | Ingestion opens PRs for human review; never auto-publishes                                                                   |

---

## 11. Cost

| Item                                 | Cost                     |
| ------------------------------------ | ------------------------ |
| Cloudflare hosting + CDN + analytics | €0                       |
| CI/CD (self-hosted Forgejo runners)  | €0 marginal              |
| `twente.dev` domain                  | ~€10–15/yr               |
| Newsletter                           | €0 until ~1k subscribers |
| **Total**                            | **~€15/yr**              |

The entire recurring cost of this plan is one domain renewal. That is the point: nothing here can be killed by a budget review.

---

## 12. Immediate next actions

1. Confirm `twente.dev` is registered and under the right account.
2. Spike the Forgejo → Cloudflare deploy in isolation — this is the unproven link and everything else assumes it works.
3. Write and merge ADRs 0001–0006.
4. Scaffold Astro + pnpm + the `on_source_change.yml` above.
5. Start seeding job and event data by hand _now_, in parallel with the build — content lead time, not code, is what gates the Phase 2 launch.
