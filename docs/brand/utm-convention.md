# Campaign link convention (UTM)

How every link we hand out is tagged, so that after an edition we can say which channel
actually filled the room — the single most useful thing to learn from twente.dev/001.

Companion to [`social-profile-copy.md`](social-profile-copy.md). Tracker item TD-044.

> ## ⚠️ Read this before relying on UTMs
>
> **Cloudflare Web Analytics does not log query strings.** That is deliberate on their
> side — it avoids collecting potentially sensitive data — and it means
> `utm_source` is **invisible** to our analytics. Checked against Cloudflare's own
> [Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/), 2026-08-30.
>
> So tagging links does not, on its own, answer "which channel filled the room". The
> fallback below does. Tag anyway — the tags cost nothing, a partner's own analytics can
> read them, and they make the answer available if we ever move off Cloudflare
> (ADR-0006 names self-hosted Umami as the revisit option).

## What actually attributes, today

| Question                           | Where the answer comes from                                                                                                                                                                                                                                                                               |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Which **websites** send us traffic | Cloudflare Web Analytics → Referers. Works for any link clicked from a page: partner sites, community pages, press.                                                                                                                                                                                       |
| Which channel **filled the room**  | **A question in the registration exchange** (pretix was dropped 2026-08-30; registration is by e-mail, so the confirmation reply asks it). This is the real instrument — it is the only one that covers email, QR codes, print, word of mouth and "an organiser told me", none of which leave a referrer. |
| Which **page** people land on      | Cloudflare → Top Paths. Note a 301 through a vanity path does not help: the beacon fires on the destination, so `/go/x → /en/001` records only `/en/001`.                                                                                                                                                 |

**Therefore: the registration question is not optional.** Without it, edition 001 produces no
attribution data at all, tagged links or not. One question, optional, free text plus a
short list — see VIK-675.

## The scheme

```text
?utm_source=<source>&utm_medium=<medium>&utm_campaign=<campaign>
```

All values **lowercase-kebab**, no spaces, no capitals, no diacritics. Enumerable on
purpose: a value not on these lists is a mistake, not a new category.

### utm_campaign — the edition

| Value            | When                                                 |
| ---------------- | ---------------------------------------------------- |
| `twente-dev-001` | Everything promoting the first edition               |
| `twente-dev-002` | The next one; bump per edition                       |
| `evergreen`      | Links in bios and signatures that outlive an edition |

### utm_medium — how it was delivered

| Value      | When                                                   |
| ---------- | ------------------------------------------------------ |
| `social`   | A post on one of our own social accounts               |
| `email`    | Newsletter, and 1:1 outreach sent by Ryan              |
| `referral` | Someone else's website links to us                     |
| `chat`     | Shared into a Discord, Slack, WhatsApp or Signal group |
| `print`    | Flyer, poster, badge — pair with a QR code             |
| `talk`     | A slide, a spoken mention, an event listing elsewhere  |

### utm_source — who or what carried it

Prefixed and enumerable, so the list stays readable at 40+ values:

| Pattern             | Example                                                             | For                                                                |
| ------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------ |
| the platform name   | `linkedin`, `mastodon`, `bluesky`, `instagram`, `meetup`, `discord` | our own social accounts                                            |
| `ambassador-<name>` | `ambassador-sanne`                                                  | the founding circle — first name, or `firstname-l` if two collide  |
| `partner-<org>`     | `partner-code14`, `partner-kennispark`                              | an organisation sharing it                                         |
| `community-<slug>`  | `community-tkkrlab`                                                 | a listed community sharing it — **slug matches `communities.yml`** |
| `press-<outlet>`    | `press-tubantia`, `press-utoday`                                    | a media mention                                                    |
| `newsletter`        | —                                                                   | our own newsletter                                                 |
| `signature`         | —                                                                   | Ryan's email signature                                             |

Two rules that keep this useful rather than decorative:

1. **Never invent a source at paste time.** If it is not on the list, add it here first —
   an un-enumerable source column is the blob this convention exists to prevent.
2. **`community-<slug>` must match the id in `src/content/communities.yml`**, so the
   analytics join back to the directory without a translation table.

## Worked examples

```text
LinkedIn post about /001
  https://twente.dev/en/001?utm_source=linkedin&utm_medium=social&utm_campaign=twente-dev-001

An ambassador sharing it in a Discord
  https://twente.dev/en/001?utm_source=ambassador-sanne&utm_medium=chat&utm_campaign=twente-dev-001

Code14 linking from their site
  https://twente.dev/en/001?utm_source=partner-code14&utm_medium=referral&utm_campaign=twente-dev-001

TkkrLab sharing it to their members
  https://twente.dev/en/001?utm_source=community-tkkrlab&utm_medium=chat&utm_campaign=twente-dev-001

Ryan's email signature, no edition
  https://twente.dev/?utm_source=signature&utm_medium=email&utm_campaign=evergreen
```

## Rules for handing links out

- **Tag the destination people should land on**, not the homepage. For /001 promotion that
  is `/en/001` or `/nl/001` — send Dutch-language audiences to the Dutch page.
- **One link per source.** Do not reuse an ambassador's link for a partner; the whole point
  is that they are distinguishable.
- **Never tag an internal link.** A UTM on a link between our own pages restarts the
  session attribution in most tools and pollutes the data for no gain.
- **Do not tag the canonical URL anywhere it could be indexed** — not in `sameAs`, not in
  JSON-LD, not in a sitemap. Tagged URLs are for sharing, never for crawling.
- **Outreach email**: `utm_medium=email`, `utm_source` naming the recipient's organisation
  where it is a partner or community, otherwise `signature`.

## Open

- Cloudflare Web Analytics is still switched off (`ANALYTICS_TOKEN` is `null`, VIK-677), so
  even the referrer half is not being recorded yet. That is a prerequisite for learning
  anything from edition 001, tagged links or not.
- Revisit if we move to self-hosted Umami: it does read query strings, at which point the
  tags above start answering the question directly rather than only via pretix.
