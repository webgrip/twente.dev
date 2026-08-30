# twente.dev — brand identity

Status: v2 · 2026-08-30 · all source files in this directory
(v2 replaces the constructed-t mark of 2026-08-11 with the t.d mark — §1)

A browsable version of this document is [brand-guide.html](brand-guide.html) — assets
inline, palette with measured contrast, type specimens and a reversible background.
Open it locally; it only needs Google Fonts and falls back to the system stack offline.

Print and presentation templates are in [templates/](templates/) — slides, letterhead
and an e-mail signature, each a self-contained HTML file that prints to PDF.
Paste-ready bios per platform are in [social-profile-copy.md](social-profile-copy.md).

The system is called the **shared thread**: independent communities, companies and
practitioners in one region, connected by a single visible thread. The thread's knot is
the red dot — the same dot that turns `twente` into a domain. Which gives the brand its
one load-bearing rule: **red marks connections, dates and actions — never decoration.**
Everything that is merely metadata stays in the grey ramp, so the red keeps its meaning.

---

## 1. The mark

**t.d** — the domain in three glyphs: the first letter of `twente`, the full stop,
the first letter of `dev`. The letters are the **wordmark's own** — IBM Plex Mono
Bold, converted to outlines — set warm paper on the ink badge, with the stop in
Signal Red doing exactly the job it does in the wordmark. Ratified as the official
mark on **2026-08-30**, superseding the constructed-t badge of 2026-08-11.

Why v1 went: the constructed t's equal arms read as a plus — and at a glance as a
cross — which this document then had to argue against; and a t glyph standing alone
reads as other brands' marks. In **t.d** the t stands inside a word, where a t is
just a letter. The mark cannot drift from the name, because it is made of the name.

### Construction

The mark is generated, not drawn: [`scripts/brand-assets.py`](../../scripts/brand-assets.py)
takes the three glyphs from the font outlines and places them. The placement values:

|             | Value                          | Derived from                                  |
| ----------- | ------------------------------ | --------------------------------------------- |
| Badge       | 160 × 160, corner radius 30    | radius unchanged from v1                      |
| Glyphs      | `t` `.` `d`, wordmark outlines | never re-set in a live font                   |
| Glyph scale | 0.8 × the wordmark x-height    | x-height 64 → 51.2 on the badge               |
| Kerning     | outline gaps of 9.6            | 12 wordmark-units — kerned, not mono-advanced |
| Baseline    | y 116                          | centres the ascender band on the badge        |
| Letter span | x 10.82–149.18 (width 138.37)  | derived, not judged — do not nudge            |

Decisions that are not accidental:

- **The badge is part of the mark.** The letters never appear loose on a page — the
  ink badge is their ground, which is why the mark works identically on paper, on
  ink and on photography. Where a badge cannot fit, use the wordmark instead.
- **The stop is the mark's only red**, as it is the wordmark's only red. It reads as
  the `.` of `.dev` — the thread's knot, now holding the name together.
- **The kerning is the design.** Set at the mono advance this is a terminal
  printout; kerned tight it is a mark. Regenerate with the script, never by eye.

### Round variant

`mark-round.svg` carries the same letters at 0.68 scale on a circle (baseline
y 109). It exists for **avatars and circular masks only** — every platform that
crops to a circle gets this file instead of a cropped square. The square badge
stays the master everywhere else.

### Single-colour mark

`mark-mono.svg` is one `fill-rule="evenodd"` path — badge, letters and stop as
subpaths, so they become **negative space** (the d's counter stays solid, as a
knockout should). For stamps, engraving, embossing, laser cutting and
single-colour badges. The `fill-rule` is load-bearing: without it the holes fill
in. `mark-black.svg` and `mark-white.svg` are fixed-colour copies of the same path.

### Favicon

`favicon.svg` is the master at exactly **1:5** on a 32-unit canvas, with one
compensation: the letters carry a 1-unit same-colour stroke — the heavier
small-size cut three glyphs need to hold at 16 px in a non-retina tab. The
deployed copy is `public/favicon.svg`.

---

## 2. Colour

Four brand colours and two derived cuts. The red is the region's own.

| Name            | Hex       | Role                                                     |
| --------------- | --------- | -------------------------------------------------------- |
| **Ink**         | `#111820` | authority — type on light ground, the dark ground itself |
| **Signal Red**  | `#C3291B` | the Twente flag's red — connections, dates, actions      |
| **Warm Paper**  | `#F7F3EA` | openness — the light ground                              |
| **Thread Grey** | `#D9DFDC` | structure — hairlines, rules, the grid; never text       |
| Red Dark        | `#A52114` | derived — hover/pressed on light ground                  |
| Red Light       | `#EA6250` | derived — red _text_ on ink                              |

Signal Red is RGB 195 41 27, adopted 2026-08-11 over the founding pack's `#E44734`
because it is the flag's actual red — with the happy side effect that it is text-safe
on Warm Paper, so the graphic red and the interactive red are one colour in light mode.

### Measured contrast (WCAG 2.1)

|             | on Paper                    | on Ink                    |
| ----------- | --------------------------- | ------------------------- |
| Ink         | 16.13:1 · AAA               | — (use Paper)             |
| Paper       | —                           | 16.13:1 · AAA             |
| Signal Red  | 5.19:1 · AA text            | 3.11:1 · **graphic only** |
| Red Light   | — (light-ground use is Red) | 5.41:1 · AA text          |
| Red Dark    | 6.71:1 · AA text (hover)    | —                         |
| White       | —                           | on Red fills: 5.75:1 · AA |
| Thread Grey | 1.22:1 · **hairlines only** | 13.22:1 · (rare on ink)   |

**Signal Red is not a text colour on ink.** 3.11:1 passes the graphic threshold (3:1)
but not the text one (4.5:1). Fills — buttons, dots, edges — stay the true flag red on
ink (white on it is 5.75:1); only red _text_ on ink takes the lightened cut. In light
mode no such split exists: the flag red is text-safe on paper.

The website's tokens in [`src/styles/tokens.css`](../../src/styles/tokens.css) encode
this switch (`--accent` vs `--accent-strong`) and remain **authoritative** — the
standalone [tokens.css](tokens.css) here and the Figma set in
[`docs/design/tokens.json`](../design/tokens.json) mirror it.

---

## 3. Typography

Two families, both SIL OFL 1.1, both on Google Fonts, both self-hosted on the site
via Fontsource.

### IBM Plex Mono — the voice of the wordmark

The wordmark is **`twente.dev` in IBM Plex Mono Bold, always lowercase**, with the
full stop in Signal Red. Lowercase also at the start of a sentence, also in display
names, also on a title slide. A domain name is the one thing that genuinely is
case-sensitive branding.

Beyond the wordmark, Plex Mono is the **technical texture**: labels, dates, indices
and metadata set small, uppercase, with +8 % tracking. That register is what makes a
page look like it was made by people who ship software.

### Inter — everything else

**Inter** (variable) carries interface and prose. The registers, mirrored from the
site tokens:

| Role             | Setting                                         |
| ---------------- | ----------------------------------------------- |
| Wordmark (fixed) | IBM Plex Mono 700, lowercase, red full stop     |
| Display          | Inter 830, tracking −3.5 %, leading 0.98        |
| Headings         | Inter 650, tracking −2 %, leading 1.15          |
| Interface        | Inter 550                                       |
| Body             | Inter 400, leading 1.65                         |
| Labels / meta    | IBM Plex Mono 500–700, uppercase, tracking +8 % |

Display size is earned, not default: **one statement per view** gets the display
register; body copy never does.

Fallback stacks: `"Inter", -apple-system, system-ui, sans-serif` and
`"IBM Plex Mono", ui-monospace, Menlo, Consolas, monospace`.

> The wordmark in `wordmark.svg` is **converted to outlines** (from IBM Plex Mono
> Bold). No font is needed to display it and it cannot shift when the font is
> missing. Never re-set the wordmark in a live font and call it the wordmark —
> use the file.

---

## 4. Lockups

| File                    | When                                         |
| ----------------------- | -------------------------------------------- |
| `lockup-horizontal.svg` | default: README, site, slides, letterhead    |
| `lockup-stacked.svg`    | square or narrow spaces                      |
| `wordmark.svg`          | running text contexts, site header, e-mail   |
| `mark.svg`              | next to an existing name, avatars, app icons |
| `favicon.svg`           | browser tab, 16–32 px                        |

### Proportions

- Wordmark x-height = **64** against a badge of 160 (40 %); the x-height band is
  vertically centred on the badge.
- Gap between badge and wordmark = **30** — the house spacing unit (v1's bar width, kept).
- Stacked: mark centred over the wordmark, the same 30 between them.

These are derived numbers, not visual judgements — do not re-space a lockup by eye.

### Clear space

Keep at least **one spacing unit** free around every lockup — 30 units on a badge of
160, i.e. 19 % of the mark's height. Nothing inside that margin.

### Minimum sizes

|                   | Minimum                           |
| ----------------- | --------------------------------- |
| Mark              | 24 px (below that: `favicon.svg`) |
| Horizontal lockup | 200 px wide                       |
| Stacked lockup    | 140 px wide                       |
| Wordmark alone    | 120 px wide                       |

---

## 5. What not to do

- **Use red as decoration.** Red is a signal: a connection, a date, an action, the
  dot. One red signal per surface is the norm — the site header carries exactly one.
- Recolour the dot, in the mark or in the wordmark. The dot is the brand.
- Take the letters off the badge. The badge is the mark's ground, not a container option.
- Use the round variant outside circular masks — the square badge is the master.
- Re-set the wordmark in another font, another weight, or — worst of all — uppercase.
  `twente.dev` is lowercase everywhere, including sentence starts and title slides.
- Re-kern, re-space or re-set the mark's letters — including in a live font.
  Scale the file, or regenerate it with the script.
- Put the mark in a gradient, drop shadow or outline, or rotate it.
- Set Signal Red text on ink — use Red Light (`#EA6250`) there. Fills stay flag red.
- Set text in Thread Grey (1.22:1 on paper — it is a hairline colour).
- Reintroduce the founding pack's pixel logo — a blocky T with red squares, a
  different mark entirely. It was deleted from the deployed kit on 2026-08-30
  (`/brand/twente-dev-logo.png` now 301s to the horizontal lockup); it survives
  only inside social assets published before that date, until those are redrawn.

---

## 6. Files

```
mark.svg                        colour master: "t.d" on the ink badge, red stop
mark-round.svg                  round variant — avatars and circular masks only
mark-mono.svg                   one even-odd path, currentColor, letters + stop knocked out
mark-black.svg / -white.svg     the same path, fixed colour
mark-currentcolor.svg           theme-following badge, the stop stays red (--twente-red)
favicon.svg                     the master at 1:5, letters carrying the heavier small-size cut
wordmark.svg / -white.svg       "twente.dev", IBM Plex Mono Bold as outlines
lockup-horizontal.svg / -white  mark + wordmark
lockup-stacked.svg / -white     mark over wordmark
tokens.css                      standalone brand tokens (site tokens are authoritative)
brand-guide.html                this document, browsable
templates/                      slides, letterhead, e-mail signature, speaker tile
png/                            transparent PNG exports, 512 and 1024 px high
social-profile-copy.md          paste-ready bios per platform
```

All SVGs have a `viewBox` and no fixed units beyond `width`/`height` — scale with CSS
or by removing those two attributes.

The PNGs are rendered from these SVGs with resvg (or the `resvg_py` package) —
every variant except `mark-mono.svg` and `mark-currentcolor.svg` (currentColor has
no colour outside CSS; use the black/white PNGs). Every size is rendered from
vector at that exact size, never downscaled from a bigger raster: all variants at
512, 1024 and 2048 px, and the two colour marks additionally at 32, 64, 128 and
256 px — the ≤128 px cuts carry a graded same-colour letter stroke so they stay
sharp where platforms would otherwise scale our 512 themselves. The script also
writes `public/favicon.ico` (true per-size 16/32/48 rasters of the small-size
cut) and `public/apple-touch-icon.png` (the mark at 180, flattened on ink), and
ends with a QA gate that verifies every raster's size, alpha and deployed copy.
Change an SVG, then re-render the PNGs with
[`scripts/brand-assets.py`](../../scripts/brand-assets.py) instead of editing them.
The PNGs exist for the places that do not take SVG: social platforms, slide software,
documents, e-mail.

### The deployed copy

The site serves this kit at `/brand/` — it is the press download set, and the source
of the `<img>` in every e-mail signature pasted from the template. `brand-assets.py`
writes that copy itself, under the **same filenames**, plus `public/favicon.svg`.

It used to be hand-synced under different names, and drifted: by 2026-08-30 the
deployed set held a superseded pixel logo linked from the press pages as the _primary_
logo, a mark PNG with white corners instead of alpha, and a third copy of `mark.svg`.
Do not edit anything under `public/brand/` — change the master here and re-run the
script. The exceptions are the campaign assets in `social/` and
`twente-dev-social-banner.png` (the site-wide `og:image`), which the script does not
draw. Most of those are hand-made PNGs with no master; the two Meetup covers are the
exception to the exception — they are exported from
[`templates/cover-16x9.html`](templates/cover-16x9.html), so their dates can be
changed by editing text.

---

## 7. Name and mark

The code in this repository is [MIT](../../LICENSE) and the community content is
CC BY 4.0. Neither licence says anything about trademarks, and that silence is
deliberate: **"twente.dev" and the mark identify this community**, and identifying
things is what they are for.

In short: reproducing the unaltered mark to refer to twente.dev — articles, talks,
event listings, link collections — is welcome without asking. What does need a yes
first: using the name or the mark for a different event or product, and any use that
suggests endorsement or affiliation. Ask via hello@twente.dev.

**Inter** (Rasmus Andersson) and **IBM Plex Mono** (IBM) are not ours: both
[SIL OFL 1.1](https://openfontlicense.org/). The site self-hosts them via Fontsource;
the OFL texts travel with those packages.
