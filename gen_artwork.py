"""Everything that is not the app icon itself: launch screens, notification badge,
themed icon, shortcut tiles, favicon.ico, link preview. All from the one mark.
Run after gen_icons.py."""
import os, io, re, json, tempfile
import cairosvg
from PIL import Image, ImageDraw, ImageFont

def safe_write(p, c):
    fd, t = tempfile.mkstemp(dir='.'); os.write(fd, c.encode()); os.close(fd); os.replace(t, p)

# pull the mark and the icon set from the single source
src = open('gen_icons.py').read()
ns = {}
exec(src[:src.index('# ================================================================ rewrite pages')], ns)
NAV, ICONS = ns['NAV'], ns['ICONS']
SOS_SVG, BG, GOLD, TEAL = ns['SOS_SVG'], ns['BG'], ns['GOLD'], ns['TEAL']
MOON_OUT, MOON_CUT, CHECK, CHECK_W = ns['MOON_OUT'], ns['MOON_CUT'], ns['CHECK'], ns['CHECK_W']
INK = '#E8EDF5'

os.makedirs('splash', exist_ok=True)
os.makedirs('shortcuts', exist_ok=True)

# ---------------------------------------------------------------- the mark, any size, any colour
def mark(size, gold=GOLD, teal=TEAL, ss=4):
    """crescent + check on transparent"""
    S = size * ss
    k = S / 512.0
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    m = Image.new('L', (S, S), 0)
    md = ImageDraw.Draw(m)
    ox, oy, orr = MOON_OUT; cx, cy, cr = MOON_CUT
    md.ellipse([(ox - orr) * k, (oy - orr) * k, (ox + orr) * k, (oy + orr) * k], fill=255)
    md.ellipse([(cx - cr) * k, (cy - cr) * k, (cx + cr) * k, (cy + cr) * k], fill=0)
    img.paste(Image.new('RGBA', (S, S), gold), (0, 0), m)
    pts = [(x * k, y * k) for x, y in CHECK]
    w = int(CHECK_W * k)
    d.line(pts, fill=teal, width=w, joint='curve')
    for x, y in pts:
        d.ellipse([x - w / 2, y - w / 2, x + w / 2, y + w / 2], fill=teal)
    return img.resize((size, size), Image.LANCZOS)

def glyph(svg_str, size, color):
    s = svg_str.replace('currentColor', color).replace('class="w-4 h-4" ', '')
    png = cairosvg.svg2png(bytestring=s.encode(), output_width=size, output_height=size)
    return Image.open(io.BytesIO(png)).convert('RGBA')

# ---------------------------------------------------------------- wordmark font
FONT = None
try:
    from fontTools.ttLib import TTFont
    f = TTFont('assets/fonts/fraunces-latin-opsz-normal.woff2')
    f.flavor = None
    f.save('/tmp/fraunces.ttf')
    FONT = '/tmp/fraunces.ttf'
    print('wordmark: Fraunces available')
except Exception as e:
    print('wordmark: skipped, mark only (', e, ')')

# ---------------------------------------------------------------- 1. iOS launch screens
# Portrait. Without these iOS shows a white flash on every launch from the Home Screen.
DEVICES = [
    (375, 667, 2), (414, 736, 3), (375, 812, 3), (360, 780, 3), (414, 896, 2), (414, 896, 3),
    (390, 844, 3), (393, 852, 3), (428, 926, 3), (430, 932, 3), (402, 874, 3), (440, 956, 3),
    (768, 1024, 2), (834, 1194, 2), (1024, 1366, 2),
]
splash_files = []
for dw, dh, dpr in DEVICES:
    w, h = dw * dpr, dh * dpr
    img = Image.new('RGB', (w, h), BG)
    m = min(w, h)
    ms = int(m * 0.30)
    mk = mark(ms)
    img.paste(mk, ((w - ms) // 2, (h - ms) // 2 - int(m * 0.05)), mk)
    if FONT:
        d = ImageDraw.Draw(img)
        fs = int(m * 0.062)
        try:
            fnt = ImageFont.truetype(FONT, fs)
            t = 'Baby List'
            bb = d.textbbox((0, 0), t, font=fnt)
            d.text(((w - (bb[2] - bb[0])) // 2, (h + ms) // 2 - int(m * 0.05) + int(m * 0.045)),
                   t, font=fnt, fill=INK)
        except Exception:
            pass
    name = f'splash/apple-splash-{w}x{h}.png'
    img.save(name, optimize=True)
    splash_files.append((dw, dh, dpr, w, h, name))
print(f'launch screens: {len(splash_files)}')

# ---------------------------------------------------------------- 2. notification badge (alpha only)
# Android renders the badge as a silhouette. A colour icon with a solid background
# becomes a grey square, which is what the app was shipping.
for sz in (96, 72):
    b = mark(sz * 4, gold='#FFFFFF', teal='#FFFFFF').resize((sz, sz), Image.LANCZOS)
    pad = Image.new('RGBA', (sz, sz), (0, 0, 0, 0))
    inner = b.resize((int(sz * 0.82), int(sz * 0.82)), Image.LANCZOS)
    pad.paste(inner, (int(sz * 0.09), int(sz * 0.09)), inner)
    pad.save(f'badge-{sz}.png', optimize=True)
print('notification badge: badge-96.png, badge-72.png (white silhouette, transparent)')

# ---------------------------------------------------------------- 3. themed / monochrome icon
mono = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
mk = mark(512, gold='#FFFFFF', teal='#FFFFFF')
s = int(512 * 0.62)
mk = mk.resize((s, s), Image.LANCZOS)
mono.paste(mk, ((512 - s) // 2, (512 - s) // 2), mk)
mono.save('icon-mono-512.png', optimize=True)
print('themed icon: icon-mono-512.png')

# ---------------------------------------------------------------- 4. extra any-purpose sizes
base = Image.open('icon-512.png')
for sz in (96, 144, 256, 384):
    base.resize((sz, sz), Image.LANCZOS).save(f'icon-{sz}.png', optimize=True)
print('icon sizes: 96, 144, 256, 384')

# ---------------------------------------------------------------- 5. favicon.ico
Image.open('icon-512.png').save('favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)])
print('favicon.ico: 16/32/48')

# ---------------------------------------------------------------- 6. shortcut tiles
SHORTCUTS = [
    ('tracker',   'Log a feed',        './tracker.html',   'Feeds, diapers, sleep',        NAV['tracker'], TEAL),
    ('labor',     'Contraction timer', './labor.html',     'Time contractions, 5-1-1',     NAV['labor'],   '#FF8F7D'),
    ('emergency', 'Warning signs',     './emergency.html', 'When to call, and who',        SOS_SVG,        '#FF8F7D'),
    ('reminders', 'Reminders',         './reminders.html', 'Vitamins, water, appointments', NAV['reminders'], GOLD),
]
for key, _, _, _, g, col in SHORTCUTS:
    S = 96 * 4
    img = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, S - 1, S - 1], radius=int(S * 0.22), fill=BG)
    gs = int(S * 0.54)
    gl = glyph(g, gs, col)
    img.paste(gl, ((S - gs) // 2, (S - gs) // 2), gl)
    img.resize((96, 96), Image.LANCZOS).save(f'shortcuts/{key}-96.png', optimize=True)
print('shortcut tiles: 4, each with its own glyph')

# ---------------------------------------------------------------- 7. link preview
og = Image.new('RGB', (1200, 630), BG)
d = ImageDraw.Draw(og)
ms = 300
mk = mark(ms)
og.paste(mk, (110, (630 - ms) // 2), mk)
if FONT:
    try:
        d.text((470, 232), 'Baby List', font=ImageFont.truetype(FONT, 82), fill=INK)
        d.text((474, 336), 'Checklist · labor · birth plan · tracker',
               font=ImageFont.truetype(FONT, 33), fill='#7A879C')
    except Exception:
        pass
og.save('og-image.png', optimize=True)
print('link preview: og-image.png (1200x630)')

# ---------------------------------------------------------------- 8. manifest
mf = json.load(open('manifest.webmanifest'))
mf['description'] = ('Newborn checklist, contraction timer, birth plan, feed and diaper tracker, '
                     'and post-birth warning signs. Works offline, syncs between both parents.')
mf['icons'] = (
    [{'src': f'./icon-{s}.png', 'sizes': f'{s}x{s}', 'type': 'image/png', 'purpose': 'any'}
     for s in (96, 144, 192, 256, 384, 512)]
    + [{'src': './icon-maskable-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'maskable'},
       {'src': './icon-mono-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'monochrome'}]
)
mf['shortcuts'] = [
    {'name': n, 'short_name': n.split()[0], 'url': u, 'description': desc,
     'icons': [{'src': f'./shortcuts/{k}-96.png', 'sizes': '96x96', 'type': 'image/png'}]}
    for k, n, u, desc, _, _ in SHORTCUTS
]
safe_write('manifest.webmanifest', json.dumps(mf, indent=2) + '\n')
print('manifest: 6 sizes + maskable + monochrome, 4 distinct shortcuts')

# ---------------------------------------------------------------- 9. service worker
sw = open('sw.js').read()
old = "    icon: './icon-192.png', badge: './icon-192.png'"
assert old in sw, 'sw push payload'
sw = sw.replace(old, "    icon: './icon-192.png', badge: './badge-96.png'")
sw = sw.replace("const VERSION = 'babylist-v10';", "const VERSION = 'babylist-v11';")
sw = sw.replace("'./apple-touch-icon.png']", "'./apple-touch-icon.png', './badge-96.png', './icon-mono-512.png']")
safe_write('sw.js', sw)
print('sw: badge fixed, v11')

# ---------------------------------------------------------------- 10. page heads
PAGES = ['index.html', 'labor.html', 'birthplan.html', 'tracker.html', 'emergency.html',
         'upbringing.html', 'reminders.html', 'settings.html']
links = '\n'.join(
    f'<link rel="apple-touch-startup-image" media="screen and (device-width: {dw}px) and (device-height: {dh}px) '
    f'and (-webkit-device-pixel-ratio: {dpr}) and (orientation: portrait)" href="./{name}">'
    for dw, dh, dpr, w, h, name in splash_files)

for p in PAGES:
    s = open(p).read()
    s = re.sub(r'\n<link rel="apple-touch-startup-image".*?>(?=\n)', '', s, flags=re.S)
    s = re.sub(r'\n<meta property="og:.*?>|\n<meta name="twitter:.*?>', '', s)
    s = s.replace('<link rel="apple-touch-icon" href="./apple-touch-icon.png">',
                  '<link rel="apple-touch-icon" href="./apple-touch-icon.png">\n'
                  '<link rel="icon" href="./favicon.ico" sizes="48x48">\n'
                  '<meta property="og:type" content="website">\n'
                  '<meta property="og:title" content="Baby List">\n'
                  '<meta property="og:description" content="Checklist, labor timer, birth plan, tracker, warning signs.">\n'
                  '<meta property="og:image" content="./og-image.png">\n'
                  '<meta name="twitter:card" content="summary_large_image">\n'
                  + links)
    safe_write(p, s)
print('page heads:', len(PAGES), 'pages got', len(splash_files), 'launch-screen tags + link preview')
