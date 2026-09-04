#!/usr/bin/env python3
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
FONT = os.path.join(OUT, '.cache-plex-mono-bold.ttf')
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
UPM = font['head'].unitsPerEm
ADV = 600

XH = 516
S = 64 / XH

def glyph_path(ch, x, baseline, s=S):
    pen = SVGPathPen(glyphset, ntos=lambda v: f'{round(v, 2):g}')
    tpen = TransformPen(pen, Transform(s, 0, 0, -s, x, baseline))
    glyphset[cmap[ord(ch)]].draw(tpen)
    return pen.getCommands()

def glyph_bounds(ch):
    bp = BoundsPen(glyphset)
    glyphset[cmap[ord(ch)]].draw(bp)
    return bp.bounds

def word_paths(text, x0, baseline, s=S):
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
        b = glyph_bounds(ch)
        if b:
            gx0, gy0, gx1, gy1 = b
            xmin = min(xmin, x + gx0 * s); xmax = max(xmax, x + gx1 * s)
            ymin = min(ymin, baseline - gy1 * s); ymax = max(ymax, baseline - gy0 * s)
        x += ADV * s
    return xmin, ymin, xmax, ymax

TEXT = 'twente.dev'

BAR = 30
BADGE = 160
GAP = BAR

wx0, wy0, wx1, wy1 = bounds(TEXT, 0, 0)

BADGE_PATH = ('M30 0H130A30 30 0 0 1 160 30V130A30 30 0 0 1 130 160H30'
              'A30 30 0 0 1 0 130V30A30 30 0 0 1 30 0Z')

OPTICAL_NUDGE = -3.0

def td_paths(scale, cx, baseline, gap, nudge=0.0):
    chars = 't.d'
    boxes = [glyph_bounds(ch) for ch in chars]
    widths = [(b[2] - b[0]) * scale for b in boxes]
    total = sum(widths) + gap * (len(chars) - 1)
    x = cx - total / 2 + nudge
    paths = []
    for ch, b, w in zip(chars, boxes, widths):
        paths.append(glyph_path(ch, x - b[0] * scale, baseline, scale))
        x += w + gap
    return paths[0], paths[1], paths[2], total, cx - total / 2 + nudge

MS = 0.8 * S
M_T, M_DOT, M_D, M_W, M_X0 = td_paths(MS, 80, 116, 9.6, OPTICAL_NUDGE)
RS = 0.68 * S
R_T, R_DOT, R_D, R_W, _ = td_paths(RS, 80, 109, 8.16, OPTICAL_NUDGE * RS / MS)
FS = MS / 5
F_T, F_DOT, F_D, F_W, _ = td_paths(FS, 16, 23.2, 1.92, OPTICAL_NUDGE / 5)

def letters_body(t, dot, d, stroke=0.0):
    sl = f' stroke="{PAPER}" stroke-width="{stroke:g}"' if stroke else ''
    sd = f' stroke="{RED}" stroke-width="{stroke:g}"' if stroke else ''
    return (f'  <g fill="{PAPER}"{sl}>\n    <path d="{t}"/>\n    <path d="{d}"/>\n  </g>\n'
            f'  <path fill="{RED}"{sd} d="{dot}"/>')

MARK_LETTERS = letters_body(M_T, M_DOT, M_D)
MONO_PATH = f'{BADGE_PATH} {M_T} {M_DOT} {M_D}'
KNOCKOUT_PATH = f'{BADGE_PATH} {M_T} {M_D}'

def mark_svg_string(stroke=0.0):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">\n'
            f'  <rect width="160" height="160" rx="30" fill="{INK}"/>\n'
            f'{letters_body(M_T, M_DOT, M_D, stroke)}\n</svg>')

def round_svg_string(stroke=0.0):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160">\n'
            f'  <circle cx="80" cy="80" r="80" fill="{INK}"/>\n'
            f'{letters_body(R_T, R_DOT, R_D, stroke)}\n</svg>')

def svg(name, vb, body, title):
    w = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="twente.dev">
  <title>{title}</title>
{body}
</svg>
'''
    with open(os.path.join(OUT, name), 'w') as f:
        f.write(w)
    print('wrote', name, vb)

svg('mark.svg', '0 0 160 160', f'''  <!-- Vector master of the compact mark (ratified 2026-08-30, supersedes the
       constructed t of 2026-08-11): "t.d" in the wordmark's own IBM Plex Mono
       Bold outlines on the ink badge, the full stop in flag red. Corner
       radius is 30/160 of the size — keep the ratio when scaling. -->
  <rect width="160" height="160" rx="30" fill="{INK}"/>
{MARK_LETTERS}''', 'twente.dev — compact mark')

svg('mark-round.svg', '0 0 160 160', f'''  <!-- Round variant of the compact mark — for avatars and anywhere a circular
       mask is imposed. Same letters at 0.68 scale; the square badge stays the
       master everywhere else. -->
  <circle cx="80" cy="80" r="80" fill="{INK}"/>
  <g fill="{PAPER}">
    <path d="{R_T}"/>
    <path d="{R_D}"/>
  </g>
  <path fill="{RED}" d="{R_DOT}"/>''', 'twente.dev — compact mark, round')

svg('mark-mono.svg', '0 0 160 160', f'''  <!-- Single-colour mark: one even-odd path, the letters and the stop as
       negative space (the d's counter stays solid, as a knockout should).
       For stamps, engraving, embossing and single-colour badges.
       fill-rule="evenodd" is load-bearing — without it the holes fill in. -->
  <path fill="currentColor" fill-rule="evenodd" d="{MONO_PATH}"/>''',
    'twente.dev — mark, single colour')

svg('mark-black.svg', '0 0 160 160',
    f'  <path fill="{INK}" fill-rule="evenodd" d="{MONO_PATH}"/>',
    'twente.dev — mark, ink')

svg('mark-white.svg', '0 0 160 160',
    f'  <path fill="#ffffff" fill-rule="evenodd" d="{MONO_PATH}"/>',
    'twente.dev — mark, white')

svg('mark-currentcolor.svg', '0 0 160 160', f'''  <!-- Theme-following mark: badge in currentColor, t and d knocked out, the
       stop stays flag red (override with --twente-red). -->
  <path fill="currentColor" fill-rule="evenodd" d="{KNOCKOUT_PATH}"/>
  <path fill="var(--twente-red, {RED})" d="{M_DOT}"/>''',
    'twente.dev — mark, theme-following')

ink_d, red_d, _ = word_paths(TEXT, 0, 0)
vb = f'{wx0:g} {wy0:g} {wx1 - wx0:g} {wy1 - wy0:g}'
for name, fill, label in (('wordmark.svg', INK, 'ink'), ('wordmark-white.svg', '#ffffff', 'white')):
    svg(name, vb, f'''  <!-- "twente.dev", IBM Plex Mono Bold converted to outlines — no font
       needed, never re-set it in a live font. The full stop is the red
       connector. Always lowercase. -->
  <path fill="{fill}" d="{ink_d}"/>
  <path fill="{RED}" d="{red_d}"/>''', f'twente.dev — wordmark, {label}')

X0 = BADGE + GAP
LOCKUP_ALIGNMENTS = (
    ('', 112, 'x-height band centred on the badge'),
    ('-middle', 80 - (wy0 + wy1) / 2, 'tight box centred on the badge'),
    ('-bottom', BADGE - wy1, 'tight box flush with the badge bottom'),
)
for suffix, BASELINE, align_note in LOCKUP_ALIGNMENTS:
    ink_d, red_d, xend = word_paths(TEXT, X0, BASELINE)
    lx0, ly0, lx1, ly1 = bounds(TEXT, X0, BASELINE)
    W = lx1
    for name, wm_fill, mark in (
        (f'lockup-horizontal{suffix}.svg', INK, f'''  <rect width="160" height="160" rx="30" fill="{INK}"/>
{MARK_LETTERS}'''),
        (f'lockup-horizontal{suffix}-white.svg', '#ffffff', f'''  <path fill="#ffffff" fill-rule="evenodd" d="{KNOCKOUT_PATH}"/>
  <path fill="{RED}" d="{M_DOT}"/>'''),
    ):
        svg(name, f'0 0 {W:g} 160', f'''  <!-- Mark + wordmark. Gap = 30; alignment: {align_note}
       (baseline y {BASELINE:g}). Derived — do not re-space by eye. -->
{mark}
  <path fill="{wm_fill}" d="{ink_d}"/>
  <path fill="{RED}" d="{red_d}"/>''', 'twente.dev')

wm_w = wx1 - wx0
mark_x = (wm_w - BADGE) / 2
wm_top_gap = BADGE + GAP
baseline2 = wm_top_gap + (0 - wy0)
ink_d2, red_d2, _ = word_paths(TEXT, -wx0, baseline2)
sx0, sy0, sx1, sy1 = bounds(TEXT, -wx0, baseline2)
H = sy1
for name, wm_fill, mark in (
    ('lockup-stacked.svg', INK, f'''  <g transform="translate({mark_x:g} 0)">
    <rect width="160" height="160" rx="30" fill="{INK}"/>
{MARK_LETTERS}
  </g>'''),
    ('lockup-stacked-white.svg', '#ffffff', f'''  <g transform="translate({mark_x:g} 0)">
    <path fill="#ffffff" fill-rule="evenodd" d="{KNOCKOUT_PATH}"/>
    <path fill="{RED}" d="{M_DOT}"/>
  </g>'''),
):
    svg(name, f'0 0 {wm_w:g} {H:g}', f'''  <!-- Stacked: mark centred over the wordmark, gap one bar width (30). -->
{mark}
  <path fill="{wm_fill}" d="{ink_d2}"/>
  <path fill="{RED}" d="{red_d2}"/>''', 'twente.dev')

with open(os.path.join(OUT, 'favicon.svg'), 'w') as f:
    f.write(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" aria-label="twente.dev">
  <title>twente.dev</title>
  <!-- The master mark at exactly 1:5 on a 32-unit canvas, with a 1-unit
       same-colour stroke on the letters as the heavier small-size cut. -->
  <rect width="32" height="32" rx="6" fill="{INK}"/>
  <g fill="{PAPER}" stroke="{PAPER}" stroke-width="1">
    <path d="{F_T}"/>
    <path d="{F_D}"/>
  </g>
  <path fill="{RED}" stroke="{RED}" stroke-width="1" d="{F_DOT}"/>
</svg>
''')
print('wrote favicon.svg')
print(f'metrics: mark t.d width {M_W:g} (x {M_X0:g}..{M_X0 + M_W:g}), round width {R_W:g}')
print(f'metrics: wordmark tight box {wx0:g},{wy0:g} -> {wx1:g},{wy1:g} (w={wx1-wx0:g} h={wy1-wy0:g})')
print(f'horizontal lockup: {W:g} x 160; stacked: {wm_w:g} x {H:g}')

PNG_VARIANTS = ('mark', 'mark-round', 'mark-black', 'mark-white',
                'wordmark', 'wordmark-white',
                'lockup-horizontal', 'lockup-horizontal-white',
                'lockup-horizontal-middle', 'lockup-horizontal-middle-white',
                'lockup-horizontal-bottom', 'lockup-horizontal-bottom-white',
                'lockup-stacked', 'lockup-stacked-white')
LARGE_SIZES = (512, 1024, 2048)
SMALL_LADDER = ((32, 5.0), (64, 2.5), (128, 2.5), (256, 0.0))

resvg = shutil.which('resvg')
try:
    import resvg_py
except ImportError:
    resvg_py = None

def render_string(svg_string, png_file, h):
    if resvg_py:
        data = bytes(resvg_py.svg_to_bytes(svg_string=svg_string, height=h))
        with open(png_file, 'wb') as fh:
            fh.write(data)
    else:
        tmp = png_file + '.tmp.svg'
        with open(tmp, 'w') as fh:
            fh.write(svg_string)
        subprocess.run([resvg, tmp, png_file, '--height', str(h)], check=True)
        os.remove(tmp)

def render_png(svg_file, png_file, h):
    with open(svg_file) as fh:
        render_string(fh.read(), png_file, h)

if not resvg and not resvg_py:
    print('neither resvg nor resvg_py available — skipped png/ exports')
else:
    png_dir = os.path.join(OUT, 'png')
    os.makedirs(png_dir, exist_ok=True)
    for f in PNG_VARIANTS:
        for h in LARGE_SIZES:
            render_png(os.path.join(OUT, f'{f}.svg'),
                       os.path.join(png_dir, f'{f}-{h}.png'), h)
    for name, builder in (('mark', mark_svg_string), ('mark-round', round_svg_string)):
        for px, stroke in SMALL_LADDER:
            render_string(builder(stroke), os.path.join(png_dir, f'{name}-{px}.png'), px)
    print(f'rendered png/ at {", ".join(map(str, LARGE_SIZES))} px '
          f'(+ marks at {", ".join(str(p) for p, _ in SMALL_LADDER)} px, size-cut)')

if resvg or resvg_py:
    from PIL import Image
    import io as _io

    def _raster(svg_string, h):
        buf = _io.BytesIO()
        tmp = os.path.join(OUT, '.tmp-raster.png')
        render_string(svg_string, tmp, h)
        img = Image.open(tmp).convert('RGBA')
        img.load()
        os.remove(tmp)
        return img

    fav_svg = open(os.path.join(OUT, 'favicon.svg')).read()
    ico_imgs = {h: _raster(fav_svg, h) for h in (16, 32, 48)}
    ico_path = os.path.join(REPO, 'public', 'favicon.ico')
    ico_imgs[48].save(ico_path, format='ICO',
                      append_images=[ico_imgs[32], ico_imgs[16]],
                      sizes=[(48, 48), (32, 32), (16, 16)])
    touch = _raster(mark_svg_string(), 180)
    flat = Image.new('RGB', touch.size, INK.upper())
    flat.paste(touch, (0, 0), touch)
    flat.save(os.path.join(REPO, 'public', 'apple-touch-icon.png'))
    print('wrote public/favicon.ico (16/32/48) and public/apple-touch-icon.png (180)')

DEPLOY = os.path.join(REPO, 'public', 'brand')
SVG_DEPLOY = ('mark', 'mark-round', 'mark-white', 'mark-black', 'mark-mono',
              'mark-currentcolor', 'wordmark', 'wordmark-white',
              'lockup-horizontal', 'lockup-horizontal-white',
              'lockup-horizontal-middle', 'lockup-horizontal-middle-white',
              'lockup-horizontal-bottom', 'lockup-horizontal-bottom-white',
              'lockup-stacked', 'lockup-stacked-white')

PNG_FILES = ([f'{f}-{h}.png' for f in PNG_VARIANTS for h in LARGE_SIZES] +
             [f'{name}-{px}.png' for name in ('mark', 'mark-round')
              for px, _ in SMALL_LADDER])

os.makedirs(os.path.join(DEPLOY, 'png'), exist_ok=True)
for f in SVG_DEPLOY:
    shutil.copyfile(os.path.join(OUT, f'{f}.svg'), os.path.join(DEPLOY, f'{f}.svg'))
if resvg or resvg_py:
    for f in PNG_FILES:
        shutil.copyfile(os.path.join(OUT, 'png', f), os.path.join(DEPLOY, 'png', f))
shutil.copyfile(os.path.join(OUT, 'favicon.svg'), os.path.join(REPO, 'public', 'favicon.svg'))
print(f'deployed {len(SVG_DEPLOY)} svg + {len(PNG_FILES) if (resvg or resvg_py) else 0} png '
      'to public/brand/, favicon.svg to public/')

if resvg or resvg_py:
    from PIL import Image
    import re as _re
    fails = []
    for f in sorted(PNG_FILES):
        p = os.path.join(OUT, 'png', f)
        img = Image.open(p)
        h = int(_re.search(r'-(\d+)\.png$', f).group(1))
        ok_mode = img.mode == 'RGBA'
        ok_h = img.size[1] == h
        ok_corner = img.getpixel((0, 0))[3] == 0
        with open(p, 'rb') as a, open(os.path.join(DEPLOY, 'png', f), 'rb') as b:
            ok_same = a.read() == b.read()
        status = 'ok' if (ok_mode and ok_h and ok_corner and ok_same) else 'FAIL'
        if status == 'FAIL':
            fails.append(f)
        print(f'  qa {f:44s} {img.size[0]:5d}x{img.size[1]:<5d} {img.mode} '
              f'corner-a={img.getpixel((0, 0))[3]} deploy={"=" if ok_same else "≠"} {status}')
    ico = Image.open(os.path.join(REPO, 'public', 'favicon.ico'))
    print(f'  qa favicon.ico sizes: {sorted(ico.info.get("sizes", {(ico.size)}))}')
    assert not fails, f'QA failed: {fails}'
    print('qa: all rasters verified')
