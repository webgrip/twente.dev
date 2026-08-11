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
"elaborate web features". The job board of the original plan is **off-playbook** (kept but demoted
— see ADR 0008).

## Site milestones from the launch tracker

| Date        | Deliverable                                                       | Status                             |
| ----------- | ----------------------------------------------------------------- | ---------------------------------- |
| 24 Aug 2026 | Minimal landing page: proposition, date, contribution route       | ✅ built (this repo)               |
| 31 Aug 2026 | Partner/community page with non-displacement commitment           | ✅ built                           |
| 31 Aug 2026 | Code of conduct + email opt-in + save-the-date live               | ✅ CoC built; opt-in pending Brevo |
| 2 Sep 2026  | Registration opens (pretix) — trust pages must be live first      | Pages built; pretix pending        |
| 28 Sep 2026 | Full practical page: access, food, language, conduct, photography | Partially (structure on /001)      |
| 21 Oct 2026 | Public launch report                                              | After the event                    |

## Facts every surface must agree on (single source: `src/config/site.ts`)

- **twente.dev/001 — Reconnect** · Wednesday 7 October 2026 · doors/food 18:00, programme 18:45,
  hard finish 21:30 · Enschede, venue TBA · free · capacity 100 · primarily English, Dutch welcome.
- Tagline: **"Build here. Share here."** — always paired with a literal explanation.
- Ten-second explanation (quote verbatim, see `/en/press`).
- Safeguards: no attendee data, no paid speaking, no exclusivity, no editorial approval rights.

## Operational prerequisites not in this repo (owner: Ryan)

1. **Mailboxes** — the site now references `hello@`, `conduct@` and `press@twente.dev`. These must
   exist (or alias to a real inbox) before the branch deploys.
2. **pretix** — create the event, then set `REGISTRATION_URL` in `src/config/site.ts`.
3. **Brevo** — create the double-opt-in form, then set `NEWSLETTER_URL`. Open tracking off.
4. **Venue** — on contract, set `EDITION_001.venue` and add the address to the events entry.
5. **Sponsor pricing** — the playbook (€7,500 / €2,500 / €1,000) and the slide deck (€5,000 /
   €2,500 / €750) disagree; the partners page therefore names no amounts ("agreed per edition").
   Resolve in the partner brief, not on the site, until validated by discovery calls.
6. **Two trained code-of-conduct contacts** — required before registration opens (tracker TD-023,
   TD-074).
7. **Cloudflare Web Analytics + UTM naming convention** — tracker TD-044; the kit's ambassador and
   partner links need per-source attribution.

## Still deliberately unbuilt (playbook says wait)

- Self-service submission forms (Worker + Turnstile) — issue templates + email suffice for launch.
- Newsletter archive pages, event /002 interest list, public report page — post-event work.
- OG image generation, Meetup mirroring, accounts/profiles/chat — deferred or banned.
