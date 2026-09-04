# Social profile copy

Bios, descriptions and about-texts for every platform twente.dev might register.
Companion to the visual kit in `public/brand/social/`. Paste-ready; character counts
are checked against each platform's current limits.

> **Rewritten 2026-08-30.** The previous version advertised a job board across fourteen
> places, including a Mastodon metadata link pointing at `twente.dev/en/jobs`, which
> returns **404**. The job board was deleted by [ADR-0009](../adrs/0009-lean-launch-remove-job-board.md)
> and the companies directory is still a placeholder. Every claim below is checked against
> what the site actually serves today. **Do not reintroduce a feature to a bio before it
> exists on the site.** A profile is the one surface nobody re-reads after pasting.

## House rules (apply everywhere)

- **twente.dev is always lowercase**, also at the start of a sentence and in display names.
- **"We build it. We run it. We share it." never stands alone.** It always follows
  a literal description of what the site is.
- No emoji, no exclamation marks, no superlatives. British spelling in English
  (organised, programme). Informal `je` in Dutch, never `u`.
- English is the default for platforms with an international dev audience
  (Bluesky, Mastodon, GitHub, Medium, Substack). Dutch for the local-first ones
  (Instagram, Facebook). LinkedIn gets both.
- **The edition city is RIJSSEN, not Enschede.** Code14 hosts /001 at Hogepad 81, Rijssen.
  Everything said Enschede until 2026-08-30, the plan's placeholder from before a venue
  existed. Still Twente; the region is not one city.
- **Never state a capacity.** It lives in `src/config/site.ts` and is mid-change
  (VIK-673). Say "free" and link; the page carries the number.
- **Launch vs evergreen**: where a bio mentions twente.dev/001, swap that line out
  after the event, the same split as the launch/evergreen banners in the kit.
- Avatar: `avatar-1024.png` everywhere. Banners per platform from `public/brand/social/`.

### What you may claim today

| Claim                                       | Status                                                            |
| ------------------------------------------- | ----------------------------------------------------------------- |
| Events calendar you can subscribe to (ICS)  | ✅ live                                                           |
| Field reports and articles by practitioners | ✅ live                                                           |
| Numbered editions, starting with /001       | ✅ live                                                           |
| Partner compact, published terms            | ✅ live                                                           |
| No cookies, no tracking, everything in git  | ✅ live                                                           |
| Community directory                         | ⚠️ page live, listings **not yet published**: say "in the making" |
| Company directory                           | ⚠️ placeholder: do not claim                                      |
| Job board                                   | ❌ **deleted**: never mention                                     |
| Newsletter                                  | ⚠️ not open yet: do not promise a signup                          |

Launch line to append where a field has room (drop after 4 Nov 2026):

> EN: `twente.dev/001: Reconnect. 4 November 2026, Rijssen. Free.`
> NL: `twente.dev/001: Reconnect. 4 november 2026, Rijssen. Gratis.`

---

## Reusable blurbs by length

Pick the longest that fits the field. These are the source; the per-platform sections
below are these, trimmed to each limit.

**One-liner (EN, 79):**

> The independent tech community for Twente. We build it. We run it. We share it.

**One-liner (NL, 63):**

> De onafhankelijke techcommunity van Twente. Van in heel Twente.

**Short (EN, 118):**

> Independent, practitioner-led tech community for Twente. Local people, events and
> practical knowledge, easier to find.

**Short (NL, 116):**

> Onafhankelijke, practitioner-led techcommunity voor Twente. Lokale mensen, events en
> praktijkkennis, beter vindbaar.

**Medium (EN, 235):**

> Independent, practitioner-led technology community for Twente. We make local people,
> events and practical knowledge easier to find across Twente, and a few
> times a year we bring different disciplines together for one useful evening.

**The ten-second explanation** (quote verbatim, matches `/en/press`):

> twente.dev is an independent, practitioner-led technology community for Twente. We make
> local people, events and practical knowledge easier to find, and we bring different
> disciplines together a few times a year.

**The three things we will not do**, for any field with room:

> No paid speaking slots. No attendee data for anyone. No product pitches disguised as
> education.

---

## X: bio 160 chars

**EN (152):**

> Independent, practitioner-led tech community for Twente. Events, field reports and a shared calendar, across Twente. We build it. We run it. We share it.

**NL (141):**

> Practitioner-led techcommunity voor Twente. Events, field reports en een gedeelde agenda, in heel Twente. We build it. We run it. We share it.

Location: `Twente, NL` · Website: `https://twente.dev` · Banner: `banner-x-bluesky-1500x500@2x.png`

## Bluesky: bio 256 chars

Claim the handle **@twente.dev**. Bluesky verifies a custom domain via a DNS TXT
record (`_atproto.twente.dev`), which makes the domain itself the handle. Better
than any @twentedev variant.

**EN (235):**

> Independent, practitioner-led tech community for Twente. We make local people, events and practical knowledge easier to find across Twente. No tracking, no recruiters, no product pitches on stage. We build it. We run it. We share it.

## Mastodon: bio 500 chars + 4 metadata fields

Add `rel="me"` links on twente.dev pointing at the Mastodon profile so the
metadata fields show as verified.

**EN:**

> Independent, practitioner-led tech community for Twente. We make local people, events and practical knowledge easier to find across Twente.
>
> No tracking on the site, no product pitches on stage, no attendee data for anyone.
>
> First edition: twente.dev/001: Reconnect. 4 November 2026, Rijssen. Free.
>
> We build it. We run it. We share it.

Metadata fields, **all four checked 2026-08-30**. Three serve 200; `https://twente.dev`
answers 302, which is the deliberate locale redirect to `/nl` or `/en`, not a fault:

| Label    | Value                                            |
| -------- | ------------------------------------------------ |
| Website  | `https://twente.dev`                             |
| Events   | `https://twente.dev/en/events`                   |
| Partners | `https://twente.dev/en/partners`                 |
| Code     | `https://forgejo.webgrip.dev/webgrip/twente.dev` |

## LinkedIn company page

**Tagline EN (100/120):**

> Twente's practitioner-led tech community. Events, field reports and a shared calendar, across Twente.

**Tagline NL (106/120):**

> De practitioner-led techcommunity van Twente. Events, field reports en een gedeelde agenda, in heel Twente.

**About (EN first, NL below; well under the 2,000-char limit):**

> twente.dev is an independent, practitioner-led technology community for Twente. We make local people, events and practical knowledge easier to find across Twente, and a few times a year we bring software, hardware, data, design and product people together for one useful evening.
>
> On the site: an events calendar you can subscribe to, field reports written by people who did the work, and a directory of the region's communities, which we are building with those communities, not about them.
>
> What we hold ourselves to: independent over corporate (businesses fund and host, but never own). Practitioner over policy (talks from people who built the thing, not slideware about it). And no exceptions: no paid speaking slots, no attendee data for anyone, no product pitches disguised as education.
>
> Existing meetups keep their own identity, their own list and their own stage. We make them easier to find and always link to the source. Our terms with them are published at twente.dev/en/partners.
>
> First edition: twente.dev/001: Reconnect. Wednesday 4 November 2026, Rijssen. Free.
>
> Funded by its founder through Webgrip, with time and a small budget from Code14. Everything (site, content, process) lives in git.
>
> We build it. We run it. We share it.
>
> //
>
> twente.dev is de onafhankelijke, practitioner-led techcommunity van Twente. We maken lokale mensen, events en praktijkkennis beter vindbaar in heel Twente, en brengen een paar keer per jaar disciplines bij elkaar voor één nuttige avond. Geen recruiters, geen tracking, geen productpitches. Eerst Twente, en dan goed.

Banners: `banner-linkedin-page-1128x191@2x.png` (page) · `banner-linkedin-1584x396@2x.png` (personal profiles).

## Instagram: bio 150 chars

**NL (139):**

> Techcommunity voor Twente. Events, field reports en een gedeelde agenda, in heel Twente. Geen tracking. We build it. We run it. We share it.

Website field: `https://twente.dev`

## Threads: bio 500 chars

Reuse the Bluesky EN bio; append the launch line while /001 is upcoming.

## Facebook page

**Intro EN/NL mix (96/101):**

> Practitioner-led techcommunity voor Twente. Events, field reports, gedeelde agenda. Geen tracking.

**About (NL):**

> twente.dev is een onafhankelijke, practitioner-led techcommunity voor Twente. We maken lokale mensen, events en praktijkkennis beter vindbaar in heel Twente, en brengen een paar keer per jaar makers uit software, hardware, data, design en product bij elkaar voor één nuttige avond.
>
> Op de site: een events-kalender waarop je je kunt abonneren, field reports van mensen die het werk zelf deden, en een gids van de community's in de regio, die we mét die community's bouwen, niet over ze heen.
>
> Bestaande meetups houden hun eigen identiteit, hun eigen lijst en hun eigen podium. Wij maken ze beter vindbaar en verwijzen altijd door naar de bron. Wat we met ze afspreken staat op twente.dev/nl/partners.
>
> We build it. We run it. We share it.

## GitHub organisation: bio 160 chars

**EN (124):**

> Independent, practitioner-led tech community for Twente. The site and its content live in git: code MIT, content CC BY 4.0.

Website: `https://twente.dev`. Pin a README that links the canonical repo on
`forgejo.webgrip.dev` if GitHub is a mirror.

## YouTube: channel description 1,000 chars

**EN:**

> twente.dev is an independent, practitioner-led technology community for Twente. This channel carries recordings from our editions: half-hour talks from people who built and ran real systems in the region, plus the occasional introduction worth keeping.
>
> What you will not find here: product pitches disguised as talks, recruiter content, or speakers presenting work they did not do themselves.
>
> Editions run a few times a year, across Twente. The calendar and the field reports live at https://twente.dev. No cookies, no tracking.
>
> We build it. We run it. We share it.

## Substack: publication description

Note: the playbook settles the newsletter on Brevo (double opt-in, open tracking
off), and it is **not open yet**, so do not link a signup until it is. If a Substack
presence exists anyway, it mirrors the field-note framing:

**Short description:**

> One concrete lesson from a local system, what is coming up in Twente and one open call. Reply-friendly, opt-in, no tracking.

**About page:**

> The field report of twente.dev, the independent, practitioner-led tech community for Twente. Every issue: one concrete lesson from a system someone in the region actually built and ran, what is coming up, and one open call.
>
> Written by practitioners, not marketers. Replies go to a person, not a funnel.
>
> We build it. We run it. We share it.

## Medium: bio 160 chars

**EN (126):**

> Independent tech community for Twente. Field reports, builder profiles and open calls, written by practitioners, not marketers.

Syndicated posts always carry the canonical URL back to twente.dev.

## Meetup: group, cover photos and event listings

**Group name:** `twente.dev`, lowercase, nothing appended. Meetup prints the name beside
the cover photo, which is why the cover does not repeat it.
**URL:** claim `meetup.com/twente-dev` (Meetup slugs are lowercase-hyphen; the dot is not
available). **Location:** Enschede, Netherlands. **Topics:** pick the practitioner ones
(software development, DevOps, data, embedded, product, UX), not "networking" or "careers".

### Group description

**EN:**

> twente.dev is an independent, practitioner-led tech community for Twente. A few times a year we bring software, hardware, data, design and product people together for one useful evening: two half-hour talks from people who did the work, and enough time to actually meet each other. One useful idea, one useful introduction, one reason to return.
>
> This group is only for our own editions. Twente already has good meetups. They keep their own identity, their own list and their own stage. Our terms with them are published at twente.dev/en/partners, including the part where we do not run events on their nights and do not approach their sponsors.
>
> What we hold ourselves to: no paid speaking slots, no attendee data for anyone, no product pitches disguised as education.
>
> First edition: twente.dev/001: Reconnect. Wednesday 4 November 2026, Rijssen. Doors and food at 18:00, programme at 18:45, hard finish at 21:30. Free.
>
> We build it. We run it. We share it.

### Photos

Meetup refuses any cover below **1200 × 675** and crops it differently on every surface, so
both files are 2× that floor with all type inside the middle band. Upload as-is; do not let
an editor resize them down.

| Slot        | File                                       | Pixels      |
| ----------- | ------------------------------------------ | ----------- |
| Group photo | `social/avatar-1024.png` (1:1)             | 1024 × 1024 |
| Group cover | `social/banner-meetup-1200x675@2x.png`     | 2400 × 1350 |
| Event cover | `social/banner-meetup-001-1200x675@2x.png` | 2400 × 1350 |

The event cover carries the date, so it is **per edition**: re-cut it from
[`templates/cover-16x9.html`](templates/cover-16x9.html) for 002 rather than reusing 001's.

### Event listing: twente.dev/001

The title is the canonical one, **`twente.dev/001: Reconnect`**, matching
`src/content/events/twente-dev-001-reconnect.yml` and the /001 pages. The playbook rule
holds here too: one canonical description everywhere.

**Description EN:**

> A practitioner-led evening for everyone building technology in and around Twente: software, infrastructure, embedded systems, manufacturing, data, security, design, product, research and technical education. Two roughly half-hour talks by people who did the work themselves, and then an unhurried network hour to actually meet each other. This is not a recruitment fair or vendor stage.
>
> 18:00 doors and food · 18:45 programme · 21:30 hard finish. Free.
>
> Full description, the calendar you can subscribe to, and our terms with the region's other communities: twente.dev/en/001
>
> We build it. We run it. We share it.

Set the RSVP limit from `src/config/site.ts` at the time of publishing. **Never** copy a
capacity into this file. Link the listing back to `twente.dev/en/001`; the site page, not
Meetup, is canonical.

## Discord server: description 120 chars

**EN (93):**

> Independent tech community for Twente. Talk, ask, share what you're building, across Twente.

Welcome-channel blurb:

> This is the twente.dev server, the independent, practitioner-led tech community for Twente. Say who you are and what you build. Ask for help, offer help, post what you learned. No recruiters and no product pitches; this is not a place to advertise vacancies.

## Small fields, if ever needed

- **TikTok (61/80):** `Techcommunity voor Twente. Events, field reports, gedeelde agenda.`
- **WhatsApp channel:** `Events en open calls uit de Twentse techcommunity. Van in heel Twente, geen tracking.`
- **Reddit community description:** `The independent, practitioner-led tech community for Twente. Events and field reports: twente.dev.`

---

## Wiring checklist once accounts exist

- Add the profile URLs to a `sameAs` array in `organisationSchema()` (`src/lib/jsonld.ts`).
- Set `twitter:site` in `src/components/BaseHead.astro` once the X handle exists.
- Add `rel="me"` links (footer or press page) for Mastodon verification.
- Add the handles to both press pages so journalists find them.
- **Re-check every claim before pasting.** Run the link check below; a bio is the one
  surface nobody revisits, so a dead link there outlives every other kind.

```bash
# Every URL this file hands to a profile field must serve 200.
for u in / /en/events /en/partners /en/about /en/press /nl/partners; do
  printf "%-18s " "$u"; curl -sS -o /dev/null -w "%{http_code}\n" "https://twente.dev$u"
done
```
