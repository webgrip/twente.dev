# Playbook alignment — what changed on 2026-08-11 and what is still open

> The founding pack (strategy playbook, communication kit, brand & slide system, launch tracker —
> all v1.0, 2026-08-09) supersedes parts of [`10x-plan.md`](10x-plan.md). [ADR
> 0008](../adrs/0008-playbook-first-launch-scope.md) records the decision; this document records
> the working deltas and the launch checklist the site depends on. The pack itself lives outside
> the repo (`media/` is gitignored).

## The product, per the playbook

An independent, practitioner-led community platform: **shared calendar + directory + archive/
editorial + newsletter + numbered flagship events**. The site's four jobs: understand the
proposition, attend the next event, discover regional activity, contribute — with RSVP or
contribute reachable in two clicks. Explicitly deferred: accounts, profiles, chat, merchandise,
"elaborate web features". The job board of the original plan is **off-playbook and now deleted
outright** — ADR 0008 decided keep-but-demote, `ea4a550` went further and removed it, and
[ADR 0009](../adrs/0009-lean-launch-remove-job-board.md) records what actually shipped. The
companies and communities pages are placeholders pending a post-launch decision.

## Site milestones from the launch tracker

| Date        | Deliverable                                                       | Status                            |
| ----------- | ----------------------------------------------------------------- | --------------------------------- |
| 24 Aug 2026 | Minimal landing page: proposition, date, contribution route       | ✅ **live** at twente.dev         |
| 31 Aug 2026 | Partner/community page with non-displacement commitment           | ✅ live                           |
| 31 Aug 2026 | Code of conduct + email opt-in + save-the-date live               | ✅ CoC live; opt-in pending Brevo |
| 2 Sep 2026  | Registration opens (pretix) — trust pages must be live first      | Trust pages live; pretix pending  |
| 28 Sep 2026 | Full practical page: access, food, language, conduct, photography | Partially (structure on /001)     |
| 21 Oct 2026 | Public launch report                                              | After the event                   |

**twente.dev went live on 2026-08-13**, ahead of the 24 August deadline. Until then the statuses
above read "built", which was true of the repository and misleading about the world: the worker was
uploading cleanly but bound to no hostname (`wrangler.toml` carried no `routes` block while
`workers_dev = false`), so every path returned Cloudflare 522. Deploying is what the tracker dates
mean, so this table now tracks _live_, not _built_.

## Facts every surface must agree on (single source: `src/config/site.ts`)

- **twente.dev/001 — Reconnect** · Wednesday 7 October 2026 · doors/food 18:00, programme 18:45,
  hard finish 21:30 · Enschede, venue TBA · free · capacity 100 · primarily English, Dutch welcome.
- Tagline: **"We build it. We run it. We share it."** — always paired with a literal explanation.
  (Replaced the pack's "Build here. Share here." on 2026-08-11; ADR 0008 revision log records it.)
- Ten-second explanation (quote verbatim, see `/en/press`).
- Safeguards: no attendee data, no paid speaking, no exclusivity, no editorial approval rights.

## Operational prerequisites not in this repo (owner: Ryan)

1. **Mailboxes** — the site references `hello@`, `conduct@` and `press@twente.dev`. These must exist
   (or alias to a real inbox). **Overdue as of 2026-08-13**: this said "before the branch deploys",
   and the branch has deployed — the addresses are published on a live code-of-conduct page, so a
   report has nowhere to land until they resolve.
2. **pretix** — create the event, then set `REGISTRATION_URL` in `src/config/site.ts`.
3. **Brevo** — create the double-opt-in form, then set `NEWSLETTER_URL`. Open tracking off.
4. **Venue** — on contract, set `EDITION_001.venue` and add the address to the events entry.
5. **Sponsor pricing** — the playbook (€7,500 / €2,500 / €1,000) and the slide deck (€5,000 /
   €2,500 / €750) disagree; the partners page therefore names no amounts ("agreed per edition").
   Resolve in the partner brief, not on the site, until validated by discovery calls.
6. **Two trained code-of-conduct contacts** — required before registration opens (tracker TD-023,
   TD-074).
7. **Cloudflare Web Analytics + UTM naming convention** — tracker TD-044; the kit's ambassador and
   partner links need per-source attribution. The beacon is already wired: set `ANALYTICS_TOKEN`
   in `src/config/site.ts` and widen the CSP as documented in `BaseHead.astro`.

## Built beyond the minimum (10x levers, 2026-08-11)

- **Search (L8)**: Pagefind UI at `/nl/zoeken` and `/en/search`, themed to the tokens, locale-aware;
  CSP admits the same-origin script/styles and WASM (`'wasm-unsafe-eval'`, the narrow variant).
- **Fonts**: Inter Variable + IBM Plex Mono self-hosted via Fontsource — no font CDN.
- **Brand assets**: the ratified kit — mark, wordmark and both lockups, in SVG plus transparent
  PNG at 512 and 1024 px — is deployed to `public/brand/` straight from the masters in
  `docs/brand/` by `scripts/brand-assets.py`, under the same filenames. The full set is linked
  from the press pages. The 1200×627 banner is the site-wide `og:image` (it carries the /001
  campaign lockup — replace after the event).

  Reconciled 2026-08-30: the deployed set had drifted off the masters and shipped the founding
  pack's pixel logo as the press pages' _primary_ logo — a different mark the brand guide
  forbids pairing with the ratified one — plus a mark PNG with white corners instead of alpha and
  a duplicate of `mark.svg`. All three are gone and 301 to their successors. The speaker tile was
  a flat placeholder mockup at a public URL and is now a fillable template in
  `docs/brand/templates/`.

- **Editorial**: pillar label renders on post cards; first Open Calls post published in both
  languages (`open-call-001`).
- **Design system formalised**: art-direction pass from the brand pack (display type, thread-grid
  texture, red edge frame, mono label register, near-square radii, AA-safe interactive red); living
  styleguide at `/styleguide` (noindex); Figma-importable tokens at `docs/design/tokens.json`
  (Tokens Studio format). Calendar subscribe links (Google / webcal / .ics) on the events pages.
- **Regional directory seeded (TD-016)**: 12 real, verified communities in
  `src/content/communities.yml` — meetups, hackerspace, data/AI network, UT and Saxon study
  associations, CoderDojo. Dormant groups (Twente.js, PHP Twente, Docker Enschede, …) deliberately
  excluded — re-checked 2026-08-13 for revival, none found. All 12 links re-verified the same day:
  eleven returned 200 unchanged; CoderDojo Enschede then pointed at the official Code Club listing
  because its own host served a certificate for `server97.icehosting.nl`, so every visitor
  got a browser security warning.

  Corrected 2026-08-30: this used to end "The weekly `link-check.yml` covers this from now on."
  **It does not, and never did.** `link-check.yml` runs lychee over `dist/**/*.html`, but
  `getCommunities()` (`src/lib/content.ts:107`) is defined and never called, so no community URL
  is rendered into any page — `grep` over `dist/` finds zero of them. The directory links are
  therefore entirely unchecked by CI, and will stay so until the collection is actually rendered.
  External links are also `continue-on-error: true`, so they warn rather than block even when seen.

  Manual re-check 2026-08-30 found two of the twelve had drifted: **tkkrlab.nl** now returns
  SERVFAIL on Google Public DNS (their nameservers at `nicolai.cloud` are not answering
  authoritatively; not DNSSEC — there is no DS record and `+cd` does not help), so the entry moved
  to `tkkrlab.com`; and **coderdojo-enschede.nl** now serves a valid certificate, so that entry
  moved back to the club's own site. **Space Society Twente** is flagged in the YAML as
  needs-verification: no events scheduled and no news since 2023, but Board #10 (Sep 2025 – Sep 2026) is seated. Both facts are recorded in the file rather than resolved by guessing.

## Still deliberately unbuilt (playbook says wait)

- Self-service submission forms (Worker + Turnstile) — issue templates + email suffice for launch.
- Newsletter archive pages, event /002 interest list, public report page — post-event work.
- Per-page OG image generation (L7 — a static brand banner is wired instead), Meetup mirroring,
  accounts/profiles/chat — deferred or banned.
- ~~**axe-in-CI** (plan §6.6 item 5) — the only §6.6 gate still missing.~~ **Shipped
  2026-08-30.** `scripts/axe-scan.ts` runs the axe rule set over the built output in an
  `accessibility` job, failing on serious/critical. The page list is read from
  `lighthouserc.json` rather than duplicated, plus three a11y-only pages (404, `/en/search`,
  `/en/partners`) that carry no performance budget. `playwright-core`, not `playwright` —
  core skips the ~150MB browser download and the `cypress/browsers` image already has Chrome.

  Triage result: the site was already clean on 16 of 17 pages. The one violation was
  `label-title-only` on the Pagefind search input, which ships with a `title` and no label —
  a tooltip is not an accessible name. Fixed in `SearchPage.astro` by naming the input after
  Pagefind mounts it, rather than adding it to an exception list.

  Corrected 2026-08-13: this bullet used to also claim Lighthouse CI had "no runner job … needs a
  Chrome-capable Forgejo runner; verify before wiring". Both halves were stale. The `lighthouse`
  job has run on `runs-on: docker` since `ff82bee`, and it proves the runner is Chrome-capable —
  so that blocker does not apply to axe either.
