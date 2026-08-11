# Social profile copy

Bios, descriptions and about-texts for every platform twente.dev might register.
Companion to the visual kit in `public/brand/social/`. Paste-ready; character counts
are checked against each platform's current limits.

## House rules (apply everywhere)

- **twente.dev is always lowercase**, also at the start of a sentence and in display names.
- **"We build it. We run it. We share it." never stands alone** — it always follows
  a literal description of what the site is.
- No emoji, no exclamation marks, no superlatives. British spelling in English
  (organised, programme). Informal `je` in Dutch, never `u`.
- English is the default for platforms with an international dev audience
  (Bluesky, Mastodon, GitHub, Medium, Substack). Dutch for the local-first ones
  (Instagram, Facebook). LinkedIn gets both.
- **Launch vs evergreen**: where a bio mentions twente.dev/001, swap that line out
  after the event — same split as the launch/evergreen banners in the kit.
- Avatar: `avatar-1024.png` everywhere. Banners per platform from `public/brand/social/`.

Launch line to append where a field has room (drop after 7 Oct 2026):

> EN: `twente.dev/001 — Reconnect. 7 October 2026, Enschede. Free.`
> NL: `twente.dev/001 — Reconnect. 7 oktober 2026, Enschede. Gratis.`

---

## X — bio 160 chars

**EN (159):**

> Practitioner-led tech community for Twente. Events, jobs, field notes — from Enschede to Almelo. Independent, no tracking. We build it. We run it. We share it.

**NL (153):**

> Practitioner-led techcommunity voor Twente. Events, vacatures, field notes — van Enschede tot Almelo. Onafhankelijk. We build it. We run it. We share it.

Location: `Twente, NL` · Website: `https://twente.dev` · Banner: `banner-x-bluesky-1500x500@2x.png`

## Bluesky — bio 256 chars

Claim the handle **@twente.dev** — Bluesky verifies a custom domain via a DNS TXT
record (`_atproto.twente.dev`), which makes the domain itself the handle. Better
than any @twentedev variant.

**EN (245):**

> Independent, practitioner-led tech community for Twente. We make local people, events and practical knowledge easier to find — from Enschede to Almelo. No recruiters, no tracking, no product pitches on stage. We build it. We run it. We share it.

## Mastodon — bio 500 chars + 4 metadata fields

Add `rel="me"` links on twente.dev pointing at the Mastodon profile so the
metadata fields show as verified.

**EN:**

> Independent, practitioner-led tech community for Twente. We make local people, events and practical knowledge easier to find — from Enschede to Almelo.
>
> No recruiters on the job board, no tracking on the site, no product pitches on stage.
>
> First edition: twente.dev/001 — Reconnect. 7 October 2026, Enschede. Free.
>
> We build it. We run it. We share it.

Metadata fields:

| Label   | Value                                            |
| ------- | ------------------------------------------------ |
| Website | `https://twente.dev`                             |
| Events  | `https://twente.dev/en/events`                   |
| Jobs    | `https://twente.dev/en/jobs`                     |
| Code    | `https://forgejo.webgrip.dev/webgrip/twente.dev` |

## LinkedIn company page

**Tagline EN (97/120):**

> Twente's practitioner-led tech community. Events, jobs and field notes — from Enschede to Almelo.

**Tagline NL (105/120):**

> De practitioner-led techcommunity van Twente. Events, vacatures en field notes — van Enschede tot Almelo.

**About (EN first, NL below — well under the 2,000-char limit):**

> twente.dev is an independent, practitioner-led technology community for Twente. We make local people, events and practical knowledge easier to find — from Enschede to Almelo — and a few times a year we bring software, hardware, data, design and product people together for one useful evening.
>
> On the site: an events calendar you can subscribe to, a job board with real employers from the region, a company directory, and field notes written by people who did the work.
>
> What we hold ourselves to: independent over corporate — businesses fund and host, but never own. Practitioner over policy — field reports from people who built the thing, not slideware about it. And no exceptions: no paid speaking slots, no attendee-list access for sponsors, no product pitches disguised as education.
>
> First edition: twente.dev/001 — Reconnect. Wednesday 7 October 2026, Enschede. Free, capacity 100.
>
> Maintained by Webgrip. Everything — site, content, process — lives in git.
>
> We build it. We run it. We share it.
>
> —
>
> twente.dev is de onafhankelijke, practitioner-led techcommunity van Twente. We maken lokale mensen, events en praktijkkennis beter vindbaar — van Enschede tot Almelo — en brengen een paar keer per jaar disciplines bij elkaar voor één nuttige avond. Geen recruiters, geen tracking, geen productpitches. Eerst Twente, en dan goed.

Banners: `banner-linkedin-page-1128x191@2x.png` (page) · `banner-linkedin-1584x396@2x.png` (personal profiles).

## Instagram — bio 150 chars

**NL (138):**

> Techcommunity voor Twente. Events, vacatures en field notes — van Enschede tot Almelo. Geen tracking. We build it. We run it. We share it.

Website field: `https://twente.dev`

## Threads — bio 500 chars

Reuse the Bluesky EN bio; append the launch line while /001 is upcoming.

## Facebook page

**Intro EN/NL mix (92/101):**

> Practitioner-led techcommunity voor Twente. Events, vacatures en field notes. Geen tracking.

**About (NL):**

> twente.dev is een onafhankelijke, practitioner-led techcommunity voor Twente. We maken lokale mensen, events en praktijkkennis beter vindbaar — van Enschede tot Almelo — en brengen een paar keer per jaar makers uit software, hardware, data, design en product bij elkaar voor één nuttige avond.
>
> Op de site: een events-kalender waarop je je kunt abonneren, vacatures van echte werkgevers uit de regio (geen recruiters, geen doorplaatsingen), een bedrijvengids en field notes van mensen die het werk zelf deden.
>
> Bestaande meetups houden hun eigen identiteit, hun eigen lijst en hun eigen podium — wij maken ze beter vindbaar en verwijzen altijd door naar de bron.
>
> We build it. We run it. We share it.

## GitHub organisation — bio 160 chars

**EN (124):**

> Independent, practitioner-led tech community for Twente. The site and its content live in git — code MIT, content CC BY 4.0.

Website: `https://twente.dev`. Pin a README that links the canonical repo on
`forgejo.webgrip.dev` if GitHub is a mirror.

## YouTube — channel description 1,000 chars

**EN:**

> twente.dev is an independent, practitioner-led technology community for Twente. This channel carries recordings from our editions: 12-minute field reports from people who built and ran real systems in the region, plus the occasional introduction worth keeping.
>
> What you will not find here: product pitches disguised as talks, recruiter content, or speakers presenting work they did not do themselves.
>
> Editions run a few times a year, from Enschede to Almelo. The calendar, job board and field notes live at https://twente.dev — no cookies, no tracking.
>
> We build it. We run it. We share it.

## Substack — publication description

Note: the playbook settles the newsletter on Brevo (double opt-in, open tracking
off). If a Substack presence exists anyway, it mirrors the field-note framing:

**Short description:**

> One concrete lesson from a local system, the coming week's events in Twente and one open call. Reply-friendly, opt-in, no tracking.

**About page:**

> The weekly field note of twente.dev, the independent, practitioner-led tech community for Twente. Every issue: one concrete lesson from a system someone in the region actually built and ran, the events of the coming week, and one open call.
>
> Written by practitioners, not marketers. Replies go to a person, not a funnel.
>
> We build it. We run it. We share it.

## Medium — bio 160 chars

**EN (126):**

> Independent tech community for Twente. Field notes, builder profiles and open calls — written by practitioners, not marketers.

Syndicated posts always carry the canonical URL back to twente.dev.

## Meetup — group description

**EN:**

> twente.dev is an independent, practitioner-led tech community for Twente. A few times a year we bring software, hardware, data, design and product people together for one useful evening: 12-minute field reports from people who did the work, and enough time to actually meet each other. One useful idea, one useful introduction, one reason to return.
>
> This group is only for our own editions. Twente already has good meetups — they keep their own identity, their own list and their own stage. We list them at twente.dev/en/communities and always link to the source.
>
> What we hold ourselves to: no paid speaking slots, no attendee-list access for sponsors, no product pitches disguised as education.
>
> First edition: twente.dev/001 — Reconnect. Wednesday 7 October 2026, Enschede. Doors and food at 18:00, programme at 18:45, hard finish at 21:30. Free, capacity 100.
>
> We build it. We run it. We share it.

## Discord server — description 120 chars

**EN (103):**

> Independent tech community for Twente. Talk, ask, share what you're building — from Enschede to Almelo.

Welcome-channel blurb:

> This is the twente.dev server — the independent, practitioner-led tech community for Twente. Say who you are and what you build. Ask for help, offer help, post what you learned. No recruiters, no product pitches; job listings go through twente.dev/en/jobs.

## Small fields, if ever needed

- **TikTok (58/80):** `Techcommunity voor Twente. Events, vacatures, field notes.`
- **WhatsApp channel:** `Events en open calls uit de Twentse techcommunity. Van Enschede tot Almelo, geen tracking.`
- **Reddit community description:** `The independent, practitioner-led tech community for Twente. Events, jobs and field notes — twente.dev.`

---

## Wiring checklist once accounts exist

- Add the profile URLs to a `sameAs` array in `organisationSchema()` (`src/lib/jsonld.ts`).
- Set `twitter:site` in `src/components/BaseHead.astro` once the X handle exists.
- Add `rel="me"` links (footer or press page) for Mastodon verification.
- Add the handles to both press pages so journalists find them.
