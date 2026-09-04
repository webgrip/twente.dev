# ADR 0013 – Campaign attribution runs on Counterscale, reported from the Worker

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-09-04
- **Tags**: Analytics, Privacy, Edge, GDPR
- **Version**: 1.0.0

---

## Context and Problem Statement

[ADR 0006](0006-privacy-first-analytics.md) chose Cloudflare Web Analytics: cookieless,
no banner, no personal data. That decision holds and this record does not reverse it.

It has one gap that only became load-bearing once there was a campaign to run.
**Cloudflare Web Analytics does not log query strings**, deliberately, so `utm_source`
is invisible to it. The UTM convention in [`brand/utm-convention.md`](../brand/utm-convention.md)
is therefore write-only: links can be tagged and nothing reads the tags back. The
question the tagging exists to answer, which channel filled the room for
twente.dev/001, has no instrument behind it.

The obvious fix is a client-side beacon, and it is the wrong one here. The audience
is developers, and developers run blockers. That is not a guess: the site's own
Grafana Faro RUM beacon is blocked in the maintainer's browser, visibly, on the same
page load that this problem was diagnosed on. A measurement that fails precisely for
the people the site is for measures the wrong half of the room.

The same gap exists on webgrip.nl, which is built and deployed identically.

## Decision Drivers

| #   | Driver                                                                                     |
| --- | ------------------------------------------------------------------------------------------ |
| 1   | Query-string attribution has to work for visitors running blockers                         |
| 2   | No cookie, no banner, no personal data — ADR 0006 stays intact                             |
| 3   | Free tier, on both sites, with the cost model understood rather than hoped for             |
| 4   | Nothing extra to operate: one person, and the homelab must not be in the request path      |
| 5   | One implementation across twente.dev and webgrip.nl, not two that drift                    |
| 6   | Data has to be readable in the Grafana that already exists, not only in a vendor dashboard |

## Considered Options

Counterscale reporting server-side · Counterscale's browser snippet · a bespoke Worker
writing to Analytics Engine · self-hosted Umami on the homelab · leaving the gap open.

## Decision Outcome

### Chosen Option

**Counterscale, deployed once for both sites, reported to from each site's Worker
using Counterscale's server module.**

- **Counterscale is the collector and the dashboard.** MIT, self-hosted on Cloudflare
  Workers and Analytics Engine, cookieless by design. One deployment serves both sites;
  each reports with its own `siteId`.
- **Reporting happens server-side**, inside the request that serves the page, so there
  is no separate request for a blocker to stop. This is driver 1, and it is the whole
  reason the browser snippet was rejected.
- **`@webgrip/edge-analytics`** in the frontend-toolkit holds the ten lines both sites
  would otherwise duplicate: report the pageview, hand the request to the asset binding.
  Driver 5.
- **`ip` and `userAgent` are never sent**, though the tracker accepts them. Neither is
  needed to answer the question, and there is a test that fails if they come back.
- **`run_worker_first` is scoped to page paths.** This is the cost control and it is not
  optional: a pageview pulls one document and roughly a dozen assets, and every path not
  excluded turns a free static asset request into a metered Worker invocation. Scoped
  correctly the free tier covers 100,000 pageviews a day.
- **Grafana reads the same Analytics Engine dataset** over its SQL API, so the numbers
  can sit beside everything else already being watched. Driver 6.
- **The collector deploys from Forgejo like everything else** (ADR 0003), not from the
  interactive installer. `@counterscale/cli` scaffolds a `wrangler.json` and shells out to
  `wrangler deploy`; with the config checked in, the shared `cloudflare-deploy.yml` does
  the same job with the token in the secret store instead of on a laptop.

### Rejected options and why

- **Counterscale's browser snippet.** Same product, one line to install, and blocked for
  the audience that matters. Fails driver 1 on the evidence of our own blocked beacon.
- **A bespoke Worker writing to Analytics Engine.** This was built before checking whether
  anything existed, and Counterscale turned out to do the same job with a dashboard, a
  maintainer and a licence. Keeping it would have meant owning a product to avoid reading
  a README. The code became the adapter instead.
- **Self-hosted Umami on the homelab.** Reads query strings and would put the data
  entirely under our control. Rejected on driver 4: a collector on the homelab is in the
  request path for a public site, and an evening of downtime is data that never arrives.
  The homelab is the right place for the archive, not the intake.
- **Leaving the gap open.** Defensible until there was a campaign. From 14 September there
  is one, and the Meetup RSVP question alone cannot see who clicked without registering.

### Consequences

**Good**

- The UTM convention becomes readable instead of aspirational, and the tags already
  written into `utm-convention.md` start answering their question.
- Blockers cannot suppress it, so the measurement covers the whole room.
- Both sites get it from one package, and a fix lands in both at once.
- Counterscale also gives referrers, top paths and hostnames, which overlap Cloudflare
  Web Analytics but arrive in a dataset Grafana can query.

**Bad**

- **Every pageview now costs a Worker invocation**, where an assets-only Worker cost
  nothing. The free tier is wide enough by a large margin, and `run_worker_first` is a
  configuration line that can silently make it thirteen times worse.
- **Analytics Engine keeps ninety days**, and Counterscale answers that itself: its
  shipped config carries an R2 bucket and a nightly cron that rolls the day up before the
  window can close. R2 is a further binding to provision and a further thing that can
  silently stop, so the rollup is worth an alert rather than a hope.
- A second analytics system alongside Cloudflare Web Analytics, with overlapping
  coverage. Retiring one is a later decision, once there is data on which is read.
- The privacy pages have to change before this ships. They currently say the site does
  not track; that stays true in substance and stops being true as written.

## Confirmation

- `wrangler.toml` on both sites carries `main`, an `ASSETS` binding, and a
  `run_worker_first` list that excludes `/_astro/*`, `/brand/*`, `/pagefind/*` and
  `/fonts/*`.
- A tagged request to `/nl/001?utm_source=linkedin&utm_medium=social&utm_campaign=twente-dev-001`
  appears in Counterscale with all three values, and an untagged one appears without them.
- `pnpm -r test` in the frontend-toolkit passes the case asserting that neither `ip` nor
  `userAgent` is ever included in a pageview payload.
- Both privacy pages name Counterscale, and say what is measured and what is not.
- A Grafana panel returns rows from the Counterscale dataset over the SQL API.

## More Information

- 2026-08-30 — `utm-convention.md` records that Cloudflare Web Analytics does not log
  query strings, and that tagging is therefore write-only for now.
- 2026-09-04 — the RUM beacon on `telemetry.webgrip.dev` is observed blocked by the
  maintainer's own browser while debugging an unrelated form failure, which is what ruled
  out any client-side collector.
- 2026-09-04 — `@webgrip/edge-analytics@1.0.0` published; first written as its own
  collector, rewritten as a Counterscale adapter once Counterscale was found.
- 2026-09-04 — retention consequence corrected on the same day it was written. It claimed
  the ninety-day export did not exist; Counterscale ships an R2 rollup bucket and a nightly
  cron that already does it. The claim was wrong when made, not overtaken by events.
- Refines [ADR 0006](0006-privacy-first-analytics.md), which stays Accepted: Cloudflare
  Web Analytics remains the pageview instrument and this covers only the query-string gap.
- webgrip.nl adopts this decision rather than restating it; its own ADR set links here.
