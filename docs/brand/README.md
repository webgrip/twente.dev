# twente.dev — brand identity

Status: v1 · 2026-08-27 · all source files in this directory

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

A lowercase **t** in warm paper on an ink badge, with the flag-red dot as the
connector — the `.` of `.dev`, sitting where the t's foot would end. Ratified as the
official mark on 2026-08-11.

The t is built from two overlapping bars, not drawn as a letter. That is deliberate:
it reads as a letter at reading distance and as a **plus** up close — a mark for a
community that adds people together.

### Construction

Everything derives from one measure: the bar width **b = 30** on a canvas of 160 × 160.

|                     | Value             | Derived from                            |
| ------------------- | ----------------- | --------------------------------------- |
| Bar width `b`       | 30                | the measure (18.75 % of the canvas)     |
| Badge corner radius | 30                | one bar width                           |
| Bar corner radius   | 5                 | b / 6                                   |
| Vertical bar        | x 65–95, y 25–135 | centred on x = 80                       |
| Horizontal bar      | x 25–135, y 50–80 | t spans 25–135 on both axes, concentric |
| Dot centre          | (120, 120)        | the ¾ point of the canvas, on both axes |
| Dot radius          | 17.5              | dot diameter 35 = b + 5                 |

```
badge   <rect width="160" height="160" rx="30"/>
t       <rect x="65" y="25" width="30" height="110" rx="5"/>
        <rect x="25" y="50" width="110" height="30" rx="5"/>
dot     <circle cx="120" cy="120" r="17.5"/>
```

Decisions that are not accidental:

- **The badge is part of the mark.** The t never appears loose on a page — the ink
  badge is its ground, which is why the mark works identically on paper, on ink and
  on photography. Where a badge cannot fit, use the wordmark instead.
- **The dot sits at the ¾ point** — (120, 120), on the diagonal. It reads as the
  full stop of `.dev` and as the period after the t. Its position is a coordinate,
  not a visual judgement; do not nudge it.
- **The crossbar sits high** (y 50–80 against a canvas centre of 80), so the shape
  keeps a t's proportions rather than a religious cross's.

### Single-colour mark

`mark-mono.svg` is one `fill-rule="evenodd"` path — badge, t and dot as subpaths,
so the t and the dot become **negative space**. For stamps, engraving, embossing,
laser cutting and single-colour badges. The `fill-rule` is load-bearing: without
it the holes fill in. `mark-black.svg` and `mark-white.svg` are fixed-colour
copies of the same path.

### Favicon

`favicon.svg` is the master at exactly **1:5** on a 32-unit canvas — bars of 6,
radius 6, dot at (24, 24). Every ratio is preserved; the bars at 18.75 % are heavy
enough that nothing needs compensating at 16 px. The deployed copy is
`public/favicon.svg`.

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
- Gap between badge and wordmark = **30**, exactly one bar width.
- Stacked: mark centred over the wordmark, the same 30 between them.

These are derived numbers, not visual judgements — do not re-space a lockup by eye.

### Clear space

Keep at least **one bar width** free around every lockup — 30 units on a badge of
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
- Take the t off its badge. The badge is the mark's ground, not a container option.
- Re-set the wordmark in another font, another weight, or — worst of all — uppercase.
  `twente.dev` is lowercase everywhere, including sentence starts and title slides.
- Move the dot, change the bar width or the corner radii. Scale the file.
- Put the mark in a gradient, drop shadow or outline, or rotate it.
- Set Signal Red text on ink — use Red Light (`#EA6250`) there. Fills stay flag red.
- Set text in Thread Grey (1.22:1 on paper — it is a hairline colour).
- Pair the ratified mark with the founding pack's pixel logo
  (`public/brand/twente-dev-logo.png`). That logo remains only in already-published
  social assets until those are regenerated.

---

## 6. Files

```
mark.svg                        colour master: paper t on ink badge, red dot
mark-mono.svg                   one even-odd path, currentColor, t + dot knocked out
mark-black.svg / -white.svg     the same path, fixed colour
mark-currentcolor.svg           theme-following badge, dot stays red (--twente-red)
favicon.svg                     the master at 1:5 on a 32-unit canvas
wordmark.svg / -white.svg       "twente.dev", IBM Plex Mono Bold as outlines
lockup-horizontal.svg / -white  mark + wordmark
lockup-stacked.svg / -white     mark over wordmark
tokens.css                      standalone brand tokens (site tokens are authoritative)
brand-guide.html                this document, browsable
templates/                      slides, letterhead, e-mail signature (HTML → PDF)
png/                            transparent PNG exports, 512 and 1024 px high
social-profile-copy.md          paste-ready bios per platform
```

All SVGs have a `viewBox` and no fixed units beyond `width`/`height` — scale with CSS
or by removing those two attributes.

The PNGs are rendered from these SVGs with resvg — every variant except
`mark-mono.svg` and `mark-currentcolor.svg` (currentColor has no colour outside CSS;
use the black/white PNGs). Change an SVG, then re-render the PNGs with
[`scripts/brand-assets.py`](../../scripts/brand-assets.py) instead of editing them.
The PNGs exist for the places that do not take SVG: social platforms, slide software,
documents, e-mail.

Deployed copies (kept in sync by hand, the masters live here):
`public/favicon.svg`, `public/brand/twente-dev-mark.svg`.

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
