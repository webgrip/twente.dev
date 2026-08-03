# ADR 0006 – Privacy-first analytics, no cookie banner

- **Status**: Accepted
- **Deciders**: Ryan Grippeling
- **Date**: 2026-08-03
- **Tags**: Privacy, Analytics, Performance, GDPR
- **Version**: 1.0.0

---

## Context and Problem Statement

We need to know whether the site is working: which pages get traffic, whether job listings are
viewed, where visitors arrive from. Standard analytics would mean cookies, a consent banner, and a
third-party script — all three of which cost performance and goodwill with an audience that is,
professionally, unusually aware of what tracking is.

## Decision Drivers

| #   | Driver                                             |
| --- | -------------------------------------------------- |
| 1   | Enough measurement to tell whether the site works  |
| 2   | No consent banner (GDPR/ePrivacy)                  |
| 3   | No third-party render-blocking or performance cost |
| 4   | Nothing to operate                                 |
| 5   | Credible with a developer audience                 |

## Considered Options

1. **Cloudflare Web Analytics** — cookieless, free, same vendor as hosting
2. **Self-hosted Umami** on the existing homelab-cluster
3. **Plausible / Fathom** — hosted, privacy-focused, paid
4. **No analytics at all**

## Decision Outcome

### Chosen Option

**Cloudflare Web Analytics.**

Cookieless and non-identifying, so no consent banner is required (driver 2) — which is itself a
conversion advantage, not merely a compliance outcome. Free, already in the hosting account, and
nothing to run (drivers 1 and 4).

The site sets **no cookies of any kind** and loads **no third-party fonts, scripts or images**. The
only client-side storage is a `localStorage` theme preference, which never leaves the browser.

### Rejected options and why

- **Self-hosted Umami** — more control and richer funnels, and worth revisiting if we ever need
  per-listing conversion tracking. Rejected for now because it adds an operational dependency to a
  site whose entire premise is that there is nothing to operate (driver 4).
- **Plausible / Fathom** — good products, but a recurring cost on a project whose total recurring
  cost is one domain renewal.
- **No analytics** — cannot answer whether the job board is worth the effort of seeding, which is the
  central question of Phase 2.

### Consequences

**Good**

- No consent banner, no cookie management, no third-party performance cost.
- Consistent with what the privacy page claims — the claim and the implementation cannot drift,
  because there is nothing to drift.
- Credible with the audience (driver 5).

**Bad**

- Aggregate only: no per-visitor funnels, no "which listings convert to applications". If that
  question becomes important, revisit Umami.
- Measurement depends on the hosting vendor, so switching hosts also means switching analytics.

## Confirmation

- Built pages contain no cookie-setting code and no third-party script tags.
- The privacy page's claims match what the site actually does.

## Revision Log

| Date       | Version | Change           |
| ---------- | ------- | ---------------- |
| 2026-08-03 | 1.0.0   | Initial decision |
