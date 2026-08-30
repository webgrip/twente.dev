# twente.dev — internal docs

The reference material behind [twente.dev](https://twente.dev): an independent,
practitioner-led technology community for Twente, built around numbered flagship events.
First edition — **twente.dev/001 — Reconnect**, Wednesday 7 October 2026, Enschede.

This is the working documentation, not the public site. Source lives in
[`webgrip/twente.dev`](https://forgejo.webgrip.dev/webgrip/twente.dev) on Forgejo; commits
carry `VIK-<id>` trailers back to the board.

## Where things are

| Section                                        | What it holds                                                                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **[Decision records](adrs/README.md)**         | Every architecture and scope decision, MADR 4.0.0, append-only. Start here to understand why the site is shaped the way it is. |
| **[Community agreements](partner-compact.md)** | The partner compact offered to listed communities, and the legitimate-interest assessment behind outreach.                     |
| **[Brand](brand/README.md)**                   | Mark construction, colour, type, lockups, and the tone-of-voice house rules that govern every surface.                         |
| **[Plan](plan/playbook-alignment.md)**         | What shipped against the launch tracker, and what is still open.                                                               |

## The facts every surface must agree on

Single source: `src/config/site.ts`. Do not restate these anywhere without reading them
from there.

- **twente.dev/001 — Reconnect** · Wednesday 7 October 2026 · doors and food 18:00,
  programme 18:45, hard finish 21:30 · Enschede · free.
- Tagline: **"We build it. We run it. We share it."** — always paired with a literal
  description of what the site is, never standing alone.
- twente.dev is **always lowercase**, including at the start of a sentence.
- Safeguards, published and non-negotiable: no attendee data for anyone, no paid speaking
  slots, no exclusivity, no editorial approval rights for sponsors.

## Two conventions that bite

**Everything under `docs/` publishes.** This repo puts `mkdocs.yml` at the root with
`docs_dir: docs`, rather than the estate's usual `docs/techdocs/` layout — see the comment
at the top of `mkdocs.yml` for why. The consequence is that there is no "unpublished"
corner of `docs/`. Anything that must not be public — outreach contact data in particular —
belongs in `media/`, which is gitignored.

**Never invent content.** Entries in `src/content/` attributed to real regional
organisations must come from the contribution pipeline. Publishing invented listings
attributed to real organisations would be both misleading and the fastest way to lose the
community's trust, which is the only asset this project has. CI enforces it via
`REQUIRE_REAL_CONTENT=1`.
