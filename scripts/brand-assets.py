#!/usr/bin/env python3
"""Regenerate the twente.dev brand asset set into docs/brand/.

Wordmark glyphs are converted to outlines from IBM Plex Mono Bold (SIL OFL 1.1)
so no font is needed to display them. All geometry derives from the ratified
compact mark (160x160, bar width 30, corner radius 30, dot r 17.5 at 120,120).

Usage:  python3 scripts/brand-assets.py
Needs:  pip install fonttools    (the font downloads itself on first run)
        resvg on PATH for the png/ exports (skipped with a warning otherwise);
        https://github.com/linebender/resvg/releases
"""
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.misc.transform import Transform
import os
import shutil
import subprocess
import urllib.request

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(REPO, 'docs', 'brand')
FONT = os.path.join(OUT, '.cache-plex-mono-bold.ttf')  # gitignored cache
FONT_URL = 'https://github.com/google/fonts/raw/main/ofl/ibmplexmono/IBMPlexMono-Bold.ttf'
if not os.path.exists(FONT):
    print('downloading IBM Plex Mono Bold (SIL OFL 1.1) ...')
    urllib.request.urlretrieve(FONT_URL, FONT)

INK = '#111820'
PAPER = '#f7f3ea'
RED = '#c3291b'

font = TTFont(FONT)
glyphset = font.getGlyphSet()
cmap = font.getBestCmap()
UPM = font['head'].unitsPerEm  # 1000
ADV = 600                      # monospace advance

# Scale: wordmark x-height = 64 units against the 160-unit badge (40%).
XH = 516                       # Plex Mono x-height in font units
S = 64 / XH                    # font units -> mark units

def glyph_path(ch, x, baseline, s=S):
    """SVG path for ch, pen-baseline at (x, baseline), y flipped."""
    pen = SVGPathPen(glyphset, ntos=lambda v: f'{round(v, 2):g}')
    tpen = TransformPen(pen, Transform(s, 0, 0, -s, x, baseline))
    glyphset[cmap[ord(ch)]].draw(tpen)
    return pen.getCommands()

def word_paths(text, x0, baseline, s=S):
    """Returns (ink_path, red_path) — the '.' is the red one."""
    ink, red = [], []
    x = x0
    for ch in text:
        (red if ch == '.' else ink).append(glyph_path(ch, x, baseline, s))
        x += ADV * s
    return ' '.join(ink), ' '.join(red), x

def bounds(text, x0, baseline, s=S):
    xmin = ymin = 1e9; xmax = ymax = -1e9
    x = x0
    for ch in text:
        bp = BoundsPen(glyphset)
        glyphset[cmap[ord(ch)]].draw(bp)
        if bp.bounds:
            gx0, gy0, gx1, gy1 = bp.bounds
            xmin = min(xmin, x + gx0 * s); xmax = max(xmax, x + gx1 * s)
            ymin = min(ymin, baseline - gy1 * s); ymax = max(ymax, baseline - gy0 * s)
        x += ADV * s
    return xmin, ymin, xmax, ymax

TEXT = 'twente.dev'

# --- geometry shared by every file ------------------------------------------
BAR = 30          # bar width == gap unit == clear-space unit
BADGE = 160
GAP = BAR         # badge <-> wordmark

# Standalone wordmark: tight box.
wx0, wy0, wx1, wy1 = bounds(TEXT, 0, 0)

BADGE_PATH = ('M30 0H130A30 30 0 0 1 160 30V130A30 30 0 0 1 130 160H30'
              'A30 30 0 0 1 0 130V30A30 30 0 0 1 30 0Z')
# Union of the two bars: rounded outer corners (r5), sharp inner corners.
CROSS_PATH = ('M65 30A5 5 0 0 1 70 25H90A5 5 0 0 1 95 30V50H130'
              'A5 5 0 0 1 135 55V75A5 5 0 0 1 130 80H95V130'
              'A5 5 0 0 1 90 135H70A5 5 0 0 1 65 130V80H30'
              'A5 5 0 0 1 25 75V55A5 5 0 0 1 30 50H65Z')
DOT_PATH = 'M102.5 120a17.5 17.5 0 1 0 35 0a17.5 17.5 0 1 0-35 0Z'
MONO_PATH = f'{BADGE_PATH} {CROSS_PATH} {DOT_PATH}'

def svg(name, vb, body, title):
    w = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="twente.dev">
  <title>{title}</title>
{body}
</svg>
'''
    with open(os.path.join(OUT, name), 'w') as f:
        f.write(w)
    print('wrote', name, vb)

# --- mark variants -----------------------------------------------------------
svg('mark.svg', '0 0 160 160', f'''  <!-- Vector master of the compact mark (ratified 2026-08-11): warm-paper
       "t" on an ink badge, flag-red dot as the connector. Corner radius is
       30/160 of the size — keep the ratio when scaling. -->
  <rect width="160" height="160" rx="30" fill="{INK}"/>
  <g fill="{PAPER}">
    <rect x="65" y="25" width="30" height="110" rx="5"/>
    <rect x="25" y="50" width="110" height="30" rx="5"/>
  </g>
  <circle cx="120" cy="120" r="17.5" fill="{RED}"/>''', 'twente.dev — compact mark')

svg('mark-mono.svg', '0 0 160 160', f'''  <!-- Single-colour mark: one even-odd path, the t and the dot as negative
       space. For stamps, engraving, embossing and single-colour badges.
       fill-rule="evenodd" is load-bearing — without it the holes fill in. -->
  <path fill="currentColor" fill-rule="evenodd" d="{MONO_PATH}"/>''',
    'twente.dev — mark, single colour')

svg('mark-black.svg', '0 0 160 160',
    f'  <path fill="{INK}" fill-rule="evenodd" d="{MONO_PATH}"/>',
    'twente.dev — mark, ink')

svg('mark-white.svg', '0 0 160 160',
    f'  <path fill="#ffffff" fill-rule="evenodd" d="{MONO_PATH}"/>',
    'twente.dev — mark, white')

svg('mark-currentcolor.svg', '0 0 160 160', f'''  <!-- Theme-following mark: badge in currentColor, t knocked out, the dot
       stays flag red (override with --twente-red). -->
  <path fill="currentColor" fill-rule="evenodd" d="{BADGE_PATH} {CROSS_PATH}"/>
  <circle cx="120" cy="120" r="17.5" fill="var(--twente-red, {RED})"/>''',
    'twente.dev — mark, theme-following')

# --- wordmark ----------------------------------------------------------------
ink_d, red_d, _ = word_paths(TEXT, 0, 0)
vb = f'{wx0:g} {wy0:g} {wx1 - wx0:g} {wy1 - wy0:g}'
for name, fill, label in (('wordmark.svg', INK, 'ink'), ('wordmark-white.svg', '#ffffff', 'white')):
    svg(name, vb, f'''  <!-- "twente.dev", IBM Plex Mono Bold converted to outlines — no font
       needed, never re-set it in a live font. The full stop is the red
       connector. Always lowercase. -->
  <path fill="{fill}" d="{ink_d}"/>
  <path fill="{RED}" d="{red_d}"/>''', f'twente.dev — wordmark, {label}')

# --- horizontal lockup -------------------------------------------------------
# x-height band vertically centred on the badge: baseline at 80 + 32 = 112.
BASELINE = 112
X0 = BADGE + GAP
ink_d, red_d, xend = word_paths(TEXT, X0, BASELINE)
lx0, ly0, lx1, ly1 = bounds(TEXT, X0, BASELINE)
W = lx1  # right edge of the v
for name, wm_fill, mark in (
    ('lockup-horizontal.svg', INK, f'''  <rect width="160" height="160" rx="30" fill="{INK}"/>
  <g fill="{PAPER}">
    <rect x="65" y="25" width="30" height="110" rx="5"/>
    <rect x="25" y="50" width="110" height="30" rx="5"/>
  </g>
  <circle cx="120" cy="120" r="17.5" fill="{RED}"/>'''),
    ('lockup-horizontal-white.svg', '#ffffff', f'''  <path fill="#ffffff" fill-rule="evenodd" d="{BADGE_PATH} {CROSS_PATH}"/>
  <circle cx="120" cy="120" r="17.5" fill="{RED}"/>'''),
):
    svg(name, f'0 0 {W:g} 160', f'''  <!-- Mark + wordmark. Gap = 30 (one bar width); wordmark x-height = 64,
       band centred on the badge. Derived — do not re-space by eye. -->
{mark}
  <path fill="{wm_fill}" d="{ink_d}"/>
  <path fill="{RED}" d="{red_d}"/>''', 'twente.dev')

# --- stacked lockup ----------------------------------------------------------
# Mark centred above the wordmark, gap one bar width.
ink_d2, red_d2, _ = word_paths(TEXT, 0, 0)
wm_w = wx1 - wx0
mark_x = (wm_w - BADGE) / 2
wm_top_gap = BADGE + GAP  # baseline offset: place baseline so band top = BADGE+GAP
baseline2 = wm_top_gap + (0 - wy0)  # wy0 is negative (above baseline)
ink_d2, red_d2, _ = word_paths(TEXT, -wx0, baseline2)
sx0, sy0, sx1, sy1 = bounds(TEXT, -wx0, baseline2)
H = sy1
for name, wm_fill, mark in (
    ('lockup-stacked.svg', INK, f'''  <g transform="translate({mark_x:g} 0)">
    <rect width="160" height="160" rx="30" fill="{INK}"/>
    <g fill="{PAPER}">
      <rect x="65" y="25" width="30" height="110" rx="5"/>
      <rect x="25" y="50" width="110" height="30" rx="5"/>
    </g>
    <circle cx="120" cy="120" r="17.5" fill="{RED}"/>
  </g>'''),
    ('lockup-stacked-white.svg', '#ffffff', f'''  <g transform="translate({mark_x:g} 0)">
    <path fill="#ffffff" fill-rule="evenodd" d="{BADGE_PATH} {CROSS_PATH}"/>
    <circle cx="120" cy="120" r="17.5" fill="{RED}"/>
  </g>'''),
):
    svg(name, f'0 0 {wm_w:g} {H:g}', f'''  <!-- Stacked: mark centred over the wordmark, gap one bar width (30). -->
{mark}
  <path fill="{wm_fill}" d="{ink_d2}"/>
  <path fill="{RED}" d="{red_d2}"/>''', 'twente.dev')

# --- favicon (copy of the deployed one, canonical here) ----------------------
with open(os.path.join(OUT, 'favicon.svg'), 'w') as f:
    f.write(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="twente.dev">
  <title>twente.dev</title>
  <!-- The master mark at exactly 1:5 on a 32-unit canvas — every ratio
       (bars 6/32, radius 6/32, dot at the 3/4 point) is preserved.
       Deployed copy: public/favicon.svg. -->
  <rect width="32" height="32" rx="6" fill="{INK}"/>
  <g fill="{PAPER}">
    <rect x="13" y="5" width="6" height="22" rx="1"/>
    <rect x="5" y="10" width="22" height="6" rx="1"/>
  </g>
  <circle cx="24" cy="24" r="3.5" fill="{RED}"/>
</svg>
''')
print('wrote favicon.svg')
print(f'metrics: wordmark tight box {wx0:g},{wy0:g} -> {wx1:g},{wy1:g} (w={wx1-wx0:g} h={wy1-wy0:g})')
print(f'horizontal lockup: {W:g} x 160; stacked: {wm_w:g} x {H:g}')

# --- png exports -------------------------------------------------------------
# Every variant except the currentColor ones (no colour outside CSS).
resvg = shutil.which('resvg')
if not resvg:
    print('resvg not on PATH — skipped png/ exports')
else:
    png_dir = os.path.join(OUT, 'png')
    os.makedirs(png_dir, exist_ok=True)
    for f in ('mark', 'mark-black', 'mark-white', 'favicon', 'wordmark', 'wordmark-white',
              'lockup-horizontal', 'lockup-horizontal-white',
              'lockup-stacked', 'lockup-stacked-white'):
        for h in (512, 1024):
            subprocess.run([resvg, os.path.join(OUT, f'{f}.svg'),
                            os.path.join(png_dir, f'{f}-{h}.png'), '--height', str(h)],
                           check=True)
    print('rendered png/ at 512 and 1024 px')
