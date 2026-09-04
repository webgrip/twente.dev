# twente.dev — templates

Print and presentation formats. Each is **one self-contained HTML file** — no build
step, no slide software, no subscription. Copy the file, edit, print to PDF. Fonts
come from Google Fonts and fall back to the system stack offline; the visual rules
live in [`../README.md`](../README.md).

| File                          | What                               | Output                                                 |
| ----------------------------- | ---------------------------------- | ------------------------------------------------------ |
| `slides.html`                 | slide deck, 7 slide types          | present in browser, or PDF at exactly 16:9             |
| `letterhead.html`             | briefpapier, A4                    | PDF, or type directly in the browser (contenteditable) |
| `email-signature.html`        | signature block                    | copy-paste into any mail client                        |
| `email-base.html`             | lege basis voor een nieuw mailtype | kopieer dit als je een type mist                       |
| `email-doi.html`              | bevestiging dubbele opt-in         | Templates → tag `optin` is verplicht                   |
| `email-welcome.html`          | eerste mail na bevestiging         | Automations → contact toegevoegd aan lijst             |
| `email-001-aankondiging.html` | **gevulde** aankondiging /001      | Campaigns → "paste your code", klaar om te sturen      |
| `email-field-report.html`     | field report, campagne             | Brevo → Campaigns → "paste your code"                  |
| `email-announcement.html`     | één bericht, één knop              | Brevo → Campaigns → "paste your code"                  |
| `email-transactional.html`    | bevestiging of herinnering         | Brevo → **Transactional** → Templates                  |
| `speaker-tile.html`           | speaker announcement, 1:1          | PNG at exactly 1080×1080 (see below), or PDF           |
| `cover-16x9.html`             | Meetup group + event cover         | PNG at exactly 2400×1350 (see below), or PDF           |

## Mails die uit de content komen

Vier mailsoorten vul je niet meer met de hand. Je schrijft de post of het event in
[`src/content/`](../../../src/content/), en `pnpm mail` maakt er per taal een zelfstandig
HTML-bestand van dat je 1:1 in Brevo plakt onder "paste your code".

```
pnpm mail                                    # toont wat er te bouwen valt
pnpm mail --all                              # alles, NL en EN
pnpm mail post:open-call-001                 # een post, beide talen
pnpm mail event:twente-dev-001-reconnect nl  # alleen het Nederlandse bestand
```

De uitvoer belandt in `build/mail/`, buiten git. Het onderwerp en de preheader komen op de
terminal te staan, want die twee typ je in Brevo apart in.

| Bron                                                               | Mail         | Kicker                    |
| ------------------------------------------------------------------ | ------------ | ------------------------- |
| `posts/**` met `pillar: field-reports`                             | field report | Field report              |
| `posts/**` met `pillar: release-notes`                             | verslag      | Release notes             |
| `posts/**` met `pillar: upstream`                                  | signalering  | Upstream                  |
| `posts/**` zonder pillar                                           | nieuw stuk   | Nieuw op twente.dev       |
| `events/*.yml`                                                     | aankondiging | Aankondiging              |
| `RELEASE_001_SPEAKERS` in [`site.ts`](../../../src/config/site.ts) | spreker      | twente.dev/001 // Spreker |

Datum, tijd, locatie, taal en toegang komen uit de entry, dus die feiten staan nooit twee keer
in de wereld. Drie dingen bewaakt de generator zelf, en
[`sources.test.ts`](../../../src/lib/mail/sources.test.ts) houdt ze vast:

- **Elke URL loopt door `routePath()`.** De Engelse mail linkt naar
  `/en/blog/why-twente-dev-exists`, niet naar het Nederlandse slug met een `/en/` ervoor.
- **`{{ unsubscribe }}` blijft staan**, en de privacylink volgt de taal van de mail.
- **Een `⟦…⟧` in de uitvoer laat het script falen.** Brevo herschrijft zo'n href tot een
  trackinglink die 404't, wat op 4 september 2026 gebeurde met een campagne die uit
  `email-announcement.html` was geplakt.

De sprekersmail blijft leeg tot iemand de datum bevestigd heeft, want `RELEASE_001_SPEAKERS`
is leeg. Dat is de regel uit [`docs/domain/model.yaml`](../../domain/model.yaml), niet een
gat in de pijplijn.

De handgemaakte templates hieronder blijven de ontwerpmasters, en ze blijven de enige route
voor de mails die niet uit content komen: `email-doi.html`, `email-welcome.html` en
`email-transactional.html`.

## Exporting a PNG (speaker tile, 16:9 covers)

Social platforms want pixels, not a PDF. Fill the fields, then: **DevTools →
Elements → right-click the artboard node → "Capture node screenshot"**. That writes
a PNG at the artboard's true size — `<div class="tile">` gives 1080 × 1080, and each
`<div class="art">` in `cover-16x9.html` gives 2400 × 1350. Printing to PDF also
works and is the right output for anything that will be printed.

For the speaker tile, drop the portrait next to the file as `portrait.jpg` first;
until it exists the slot shows a labelled placeholder.

`cover-16x9.html` holds two artboards, which are the two photos Meetup asks for:
`#group` is the evergreen group cover and `#event` the per-edition event cover. The
artboard is 2× Meetup's 1200 × 675 floor — below that, Meetup refuses the upload —
and every word sits inside the middle band, because the crop differs on every
surface Meetup shows a cover on. The rendered pair lives at
`public/brand/social/banner-meetup-1200x675@2x.png` and `…-meetup-001-…@2x.png`;
re-cut the event one per edition rather than reusing 001's date card.

This template replaced a flat `speaker-tile.png` that shipped in `public/brand/`
until 2026-08-30 — a rendered mockup with `FIRSTNAME LASTNAME` burned into the
pixels, served at a public URL, linked from nothing, and fillable by nobody.

## Printing to PDF (all templates)

Chrome/Chromium: **Ctrl+P → destination "Save as PDF" → margins: none →
background graphics: ON**. The `@page` size is set in each file (16:9 for slides,
A4 for the letterhead, square for the speaker tile) — do not override it in the
dialog.

## Making a new deck

1. `cp slides.html slides-002-<theme>.html` — keep the original as the clean master.
2. Duplicate the `<section class="slide …">` blocks you need, delete the rest.
   The seven types: title, content, stats, two-column, quote, section divider
   (the red edge), closing.
3. The two house rules people break first: **one statement per view** at display
   size (if it needs two sentences, it is two slides), and **one red signal per
   slide** (a date, an action, the dot; never a heading that "needs some colour").

## What is deliberately missing

- A Word/Docs version of the letterhead. HTML+PDF keeps the typography and the
  tokens exact; a `.docx` drifts the moment someone opens it. If a partner needs
  an editable document, send them the PDF plus plain text.
- A PowerPoint/Keynote theme. Same reason. The PNG marks in
  [`../png/`](../png/) exist for the cases where a deck must be built in slide
  software anyway.
- An editable source for the six **channel** banners in `public/brand/social/`
  (X/Bluesky, evergreen, the two LinkedIn cuts). Those are hand-made PNGs with no
  master in this repo, which means the date on them cannot be changed without
  redrawing them. `cover-16x9.html` is the pattern to follow when edition 002
  needs its own set.

  They have already drifted off the palette, which is what having no source
  costs: the grid hairlines are `#dadcd4` where Thread Grey is `#d9dfdc`, and
  the subhead sits in `#46525c`, a slate that is in no token file. The ink and
  the red are correct in all six. Nothing is broken — the hairline contrast is
  1.25:1 against 1.22:1 for the real token, and the slate is 7.23:1 on paper —
  so this is worth fixing when they are redrawn, not before. The Meetup pair is
  already drawn from the tokens, so it carries neither drift.
