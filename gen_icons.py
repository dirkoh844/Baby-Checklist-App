"""One icon source for the whole app. 24px box, 1.75 stroke, round caps and joins.
Run: python3 gen_icons.py"""
import os, re, tempfile, urllib.parse

def safe_write(p, c):
    fd, t = tempfile.mkstemp(dir='.'); os.write(fd, c.encode()); os.close(fd); os.replace(t, p)

W = '1.75'                       # the one stroke weight
A = f'stroke="currentColor" stroke-width="{W}" stroke-linecap="round" stroke-linejoin="round"'
def svg(body, cls=''):
    c = f' class="{cls}"' if cls else ''
    return f'<svg{c} viewBox="0 0 24 24" fill="none">{body}</svg>'

# ---------------------------------------------------------------- navigation destination icons
NAV = {
 # rounded frame + tick, optically centred
 'index': svg(f'<rect x="3.9" y="3.9" width="16.2" height="16.2" rx="4.6" {A}/>'
              f'<path d="M8.3 12.15l2.55 2.55 4.85-5.35" {A}/>'),
 # heart with a contraction trace across it
 'labor': svg(f'<path d="M12 20.4S4.6 15.8 4.6 10A4.2 4.2 0 0 1 12 7.5a4.2 4.2 0 0 1 7.4 2.5c0 5.8-7.4 10.4-7.4 10.4z" {A}/>'
              f'<path d="M7.7 11.7h2.1l1.15-2.1 1.55 3.9 1-1.8h2.75" {A}/>'),
 # clipboard, and what it is a plan for
 'birthplan': svg(f'<rect x="8.7" y="3.3" width="6.6" height="3.5" rx="1.2" {A}/>'
                  f'<path d="M8.7 5.05H7.05A1.65 1.65 0 0 0 5.4 6.7v11.65A1.65 1.65 0 0 0 7.05 20h9.9a1.65 1.65 0 0 0 1.65-1.65V6.7a1.65 1.65 0 0 0-1.65-1.65H15.3" {A}/>'
                  f'<path d="M12 16.9s-3.05-1.85-3.05-4a1.75 1.75 0 0 1 3.05-1.2 1.75 1.75 0 0 1 3.05 1.2c0 2.15-3.05 4-3.05 4z" {A}/>'),
 # counts, which is what the page is
 'tracker': svg(f'<path d="M4.4 19.6h15.2" {A}/>'
                f'<path d="M8 16.4V12M12 16.4V6.9M16 16.4v-6.6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>'),
 # sprout
 'upbringing': svg(f'<path d="M12 20.5v-6.7" {A}/>'
                   f'<path d="M12 13.8c0-3.95-2.8-6.25-6.85-6.25 0 3.95 2.8 6.25 6.85 6.25z" {A}/>'
                   f'<path d="M12 12.1c0-3.2 2.4-5.1 5.75-5.1 0 3.2-2.4 5.1-5.75 5.1z" {A}/>'),
 # bell
 'reminders': svg(f'<path d="M6.35 10.3a5.65 5.65 0 0 1 11.3 0c0 4.65 1.9 5.6 1.9 5.6H4.45s1.9-.95 1.9-5.6z" {A}/>'
                  f'<path d="M9.9 18.6a2.25 2.25 0 0 0 4.2 0" {A}/>'),
 # six-tooth gear: fewer, longer teeth survive 18px
 'settings': svg(f'<circle cx="12" cy="12" r="3.2" {A}/>'
                 f'<path d="M16.6 12h2.6M14.3 16l1.3 2.25M9.7 16l-1.3 2.25M7.4 12H4.8M9.7 8L8.4 5.75M14.3 8l1.3-2.25" {A}/>'),
}

# ---------------------------------------------------------------- checklist categories (8) + utility (3)
ICONS = {
 'clothing': svg(f'<path d="M8.6 4.2L4.5 6.6l1.7 3.1 2.4-1.25V19.4a.6.6 0 0 0 .6.6h5.6a.6.6 0 0 0 .6-.6V8.45l2.4 1.25 1.7-3.1-4.1-2.4a3.4 3.4 0 0 1-6.8 0z" {A}/>'
                 f'<path d="M10.6 17.2h2.8" {A}/>'),
 'feeding': svg(f'<path d="M10.5 2.9h3v2.1h-3z" {A}/>'
                f'<rect x="9.1" y="5" width="5.8" height="2.2" rx="1" {A}/>'
                f'<path d="M9.7 7.2h4.6a2.1 2.1 0 0 1 2.1 2.1v9.6a2.1 2.1 0 0 1-2.1 2.1H9.7a2.1 2.1 0 0 1-2.1-2.1V9.3a2.1 2.1 0 0 1 2.1-2.1z" {A}/>'
                f'<path d="M10.2 11.4h2M10.2 14.4h2" {A}/>'),
 # fastening wings, or it just reads as a bowl
 'diapering': svg(f'<path d="M3.5 8.4l2.6-2.2h11.8l2.6 2.2v2.4a8.5 8.5 0 0 1-8.5 8.5 8.5 8.5 0 0 1-8.5-8.5V8.4z" {A}/>'
                  f'<path d="M3.5 8.4h17M8.4 6.2l1.2 2.2M15.6 6.2l-1.2 2.2" {A}/>'),
 'sleep': svg(f'<path d="M4.6 18.6v-3.2M19.4 18.6v-3.2" {A}/>'
              f'<path d="M4.6 15.4h14.8" {A}/>'
              f'<path d="M6.9 15.4V8.2M9.9 15.4V8.2M14.1 15.4V8.2M17.1 15.4V8.2" {A}/>'
              f'<path d="M4.6 8.2h14.8" {A}/>'),
 'bath': svg(f'<path d="M4 12.2h16v1.9a4.9 4.9 0 0 1-4.9 4.9H8.9A4.9 4.9 0 0 1 4 14.1v-1.9z" {A}/>'
             f'<path d="M7.2 12.2V6.4a1.9 1.9 0 0 1 3.8 0" {A}/>'
             f'<path d="M6.6 19v1.4M17.4 19v1.4" {A}/>'),
 'health': svg(f'<path d="M12 3.6l6.6 2.5v5.1c0 4.1-2.8 7.4-6.6 8.6-3.8-1.2-6.6-4.5-6.6-8.6V6.1z" {A}/>'
               f'<path d="M12 9.1v5M9.5 11.6h5" {A}/>'),
 'bag': svg(f'<rect x="3.9" y="8.1" width="16.2" height="11.3" rx="2.2" {A}/>'
            f'<path d="M8.9 8.1V6.4a1.8 1.8 0 0 1 1.8-1.8h2.6a1.8 1.8 0 0 1 1.8 1.8v1.7" {A}/>'
            f'<path d="M3.9 12.6h16.2" {A}/>'),
 # person and heart, side by side, nothing overlapping
 'parent': svg(f'<circle cx="9.4" cy="7.6" r="3" {A}/>'
               f'<path d="M3.6 19.9a5.8 5.8 0 0 1 11.6 0" {A}/>'
               f'<path d="M17.6 12.9s-3.2-1.9-3.2-4.1a1.85 1.85 0 0 1 3.2-1.25 1.85 1.85 0 0 1 3.2 1.25c0 2.2-3.2 4.1-3.2 4.1z" {A}/>'),
 # renders at ~13px on a checkbox, so it carries deliberate extra weight
 'check': svg('<path d="M5.2 12.6l4.3 4.4L18.8 7.2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>'),
 'trash': svg(f'<path d="M4.8 6.9h14.4" {A}/>'
              f'<path d="M9.4 6.9V5.4a1.4 1.4 0 0 1 1.4-1.4h2.4a1.4 1.4 0 0 1 1.4 1.4v1.5" {A}/>'
              f'<path d="M6.6 6.9l.9 12a1.5 1.5 0 0 0 1.5 1.4h6a1.5 1.5 0 0 0 1.5-1.4l.9-12" {A}/>'
              f'<path d="M10.3 10.6v6M13.7 10.6v6" {A}/>'),
 'info': svg(f'<circle cx="12" cy="12" r="8.4" {A}/>'
             f'<path d="M12 11.2v4.9" {A}/>'
             f'<circle cx="12" cy="8.3" r="1.05" fill="currentColor" stroke="none"/>'),
}

# ---------------------------------------------------------------- header buttons
SUN = svg(f'<circle cx="12" cy="12" r="4.4" {A}/>'
          f'<path d="M12 3.2v2.1M12 18.7v2.1M3.2 12h2.1M18.7 12h2.1M5.8 5.8l1.5 1.5M16.7 16.7l1.5 1.5M18.2 5.8l-1.5 1.5M7.3 16.7l-1.5 1.5" {A}/>', 'w-4 h-4')
MOON = svg(f'<path d="M20.1 13.7A7.6 7.6 0 0 1 10.3 3.9 8.4 8.4 0 1 0 20.1 13.7z" {A}/>', 'w-4 h-4')
NIGHT = svg(f'<path d="M20.4 14.2A7.3 7.3 0 0 1 9.8 4.6 8.1 8.1 0 1 0 20.4 14.2z" {A}/>'
            f'<path d="M17.4 3.1l.75 1.85 1.85.75-1.85.75-.75 1.85-.75-1.85L14.8 5.7l1.85-.75z" {A}/>', 'w-4 h-4')
SOS_SVG = svg(f'<path d="M10.3 4.05L2.7 17.5A2 2 0 0 0 4.4 20.5h15.2a2 2 0 0 0 1.7-3L13.7 4.05a2 2 0 0 0-3.4 0z" {A}/>'
              f'<path d="M12 9.3v4.1" {A}/>'
              f'<circle cx="12" cy="16.75" r="1.15" fill="currentColor" stroke="none"/>', 'w-4 h-4')

# ---------------------------------------------------------------- app mark
# gold crescent cradling a teal check. Geometry lives here once; the favicon and
# every PNG are the same drawing, so they cannot drift.
MOON_OUT = (300, 256, 150)      # cx, cy, r
MOON_CUT = (215, 205, 140)
CHECK = [(140, 220), (190, 270), (285, 165)]
CHECK_W = 44
BG, GOLD, TEAL = '#10141F', '#EBC77C', '#7BC8B3'

def mark_svg(bleed=False, scale=1.0):
    ox, oy, orr = MOON_OUT; cx, cy, cr = MOON_CUT
    pts = ' '.join(f'{x} {y}' for x, y in CHECK)
    bg = (f'<rect width="512" height="512" fill="{BG}"/>' if bleed
          else f'<rect width="512" height="512" rx="112" fill="{BG}"/>')
    g0 = f'<g transform="translate(256 256) scale({scale}) translate(-256 -256)">' if scale != 1.0 else '<g>'
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">'
            + bg
            + '<mask id="c">'
              f'<rect width="512" height="512" fill="#000"/>'
              f'<circle cx="{ox}" cy="{oy}" r="{orr}" fill="#fff"/>'
              f'<circle cx="{cx}" cy="{cy}" r="{cr}" fill="#000"/>'
              '</mask>'
            + g0
            + f'<rect width="512" height="512" fill="{GOLD}" mask="url(#c)"/>'
            + f'<polyline points="{pts}" fill="none" stroke="{TEAL}" stroke-width="{CHECK_W}" stroke-linecap="round" stroke-linejoin="round"/>'
            + '</g></svg>')

FAVICON = 'data:image/svg+xml,' + urllib.parse.quote(mark_svg(), safe='')

# ================================================================ reusable icon source ends

# ================================================================ PNGs
from PIL import Image, ImageDraw
SS = 2048
def render(size, bleed, scale, out):
    k = SS / 512.0
    img = Image.new('RGBA', (SS, SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    if bleed: d.rectangle([0, 0, SS, SS], fill=BG)
    else: d.rounded_rectangle([0, 0, SS - 1, SS - 1], radius=int(SS * 0.22), fill=BG)

    layer = Image.new('RGBA', (SS, SS), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    mask = Image.new('L', (SS, SS), 0)
    md = ImageDraw.Draw(mask)
    ox, oy, orr = MOON_OUT; cx, cy, cr = MOON_CUT
    md.ellipse([(ox - orr) * k, (oy - orr) * k, (ox + orr) * k, (oy + orr) * k], fill=255)
    md.ellipse([(cx - cr) * k, (cy - cr) * k, (cx + cr) * k, (cy + cr) * k], fill=0)
    layer.paste(Image.new('RGBA', (SS, SS), GOLD), (0, 0), mask)

    pts = [(x * k, y * k) for x, y in CHECK]
    w = int(CHECK_W * k)
    ld.line(pts, fill=TEAL, width=w, joint='curve')
    for x, y in pts:                                  # round caps
        ld.ellipse([x - w / 2, y - w / 2, x + w / 2, y + w / 2], fill=TEAL)

    if scale != 1.0:
        s = int(SS * scale)
        layer = layer.resize((s, s), Image.LANCZOS)
        pad = Image.new('RGBA', (SS, SS), (0, 0, 0, 0))
        pad.paste(layer, ((SS - s) // 2, (SS - s) // 2), layer)
        layer = pad
    img = Image.alpha_composite(img, layer)
    img.resize((size, size), Image.LANCZOS).convert('RGB').save(out)
    print('  ', out, f'{size}x{size}')

render(192, False, 1.0, 'icon-192.png')
render(512, False, 1.0, 'icon-512.png')
render(512, True, 0.88, 'icon-maskable-512.png')   # 0.88 keeps the mark inside the 80% safe circle
render(180, True, 1.0, 'apple-touch-icon.png')
