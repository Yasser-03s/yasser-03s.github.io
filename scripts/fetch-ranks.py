#!/usr/bin/env python3
import os
import sys
import math
import urllib.request
from collections import deque

try:
    from PIL import Image
except ImportError:
    print('Pillow is required. Run: python -m pip install Pillow', file=sys.stderr)
    sys.exit(1)

OUT_DIR = os.path.join('assets', 'ranks')
os.makedirs(OUT_DIR, exist_ok=True)

URLS = {
  'iron1.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Iron_1_Rank.png/120px-Iron_1_Rank.png?a0496',
  'iron2.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Iron_2_Rank.png/120px-Iron_2_Rank.png?650b8',
  'iron3.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Iron_3_Rank.png/120px-Iron_3_Rank.png?14c95',
  'bronze1.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Bronze_1_Rank.png/120px-Bronze_1_Rank.png?f51a6',
  'bronze2.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Bronze_2_Rank.png/120px-Bronze_2_Rank.png?c31e6',
  'bronze3.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Bronze_3_Rank.png/120px-Bronze_3_Rank.png?00125',
  'silver1.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Silver_1_Rank.png/120px-Silver_1_Rank.png?ca291',
  'silver2.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Silver_2_Rank.png/120px-Silver_2_Rank.png?7e41e',
  'silver3.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Silver_3_Rank.png/120px-Silver_3_Rank.png?170a9',
  'gold1.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Gold_1_Rank.png/120px-Gold_1_Rank.png?170a9',
  'gold2.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Gold_2_Rank.png/120px-Gold_2_Rank.png?8410f',
  'gold3.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Gold_3_Rank.png/120px-Gold_3_Rank.png?7c41d',
  'platinum1.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Platinum_1_Rank.png/120px-Platinum_1_Rank.png?46430',
  'platinum2.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Platinum_2_Rank.png/120px-Platinum_2_Rank.png?8b8bd',
  'platinum3.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Platinum_3_Rank.png/120px-Platinum_3_Rank.png?b45e2',
  'diamond1.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Diamond_1_Rank.png/120px-Diamond_1_Rank.png?cd057',
  'diamond2.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Diamond_2_Rank.png/120px-Diamond_2_Rank.png?b23a8',
  'diamond3.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Diamond_3_Rank.png/120px-Diamond_3_Rank.png?e6893',
  'ascendant1.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Ascendant_1_Rank.png/120px-Ascendant_1_Rank.png?c818e',
  'ascendant2.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Ascendant_2_Rank.png/120px-Ascendant_2_Rank.png?8b3d6',
  'ascendant3.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Ascendant_3_Rank.png/120px-Ascendant_3_Rank.png?bc50e',
  'immortal1.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Immortal_1_Rank.png/120px-Immortal_1_Rank.png?d43a7',
  'immortal2.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Immortal_2_Rank.png/120px-Immortal_2_Rank.png?3db80',
  'immortal3.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Immortal_3_Rank.png/120px-Immortal_3_Rank.png?db712',
  'radiant.png': 'https://wiki.playvalorant.com/en-us/images/thumb/Radiant_Rank.png/120px-Radiant_Rank.png?3abd1',
}

USER_AGENT = 'Mozilla/5.0 (compatible; DUNK-RR asset builder/2.0)'
TOLERANCE = 22
MARGIN = 5

def close_rgb(a, b):
    return sum((a[i] - b[i]) ** 2 for i in range(3)) <= TOLERANCE ** 2

def remove_edge_background(img):
    img = img.convert('RGBA')
    w, h = img.size
    px = img.load()
    bg = px[0, 0][:3]
    visited = bytearray(w * h)
    q = deque()

    def add(x, y):
        p = y * w + x
        if visited[p]:
            return
        if not close_rgb(px[x, y], bg):
            return
        visited[p] = 1
        q.append((x, y))

    for x in range(w):
        add(x, 0); add(x, h - 1)
    for y in range(h):
        add(0, y); add(w - 1, y)

    while q:
        x, y = q.popleft()
        if x: add(x - 1, y)
        if x + 1 < w: add(x + 1, y)
        if y: add(x, y - 1)
        if y + 1 < h: add(x, y + 1)

    for p, is_bg in enumerate(visited):
        if is_bg:
            x, y = p % w, p // w
            r, g, b, _ = px[x, y]
            px[x, y] = (r, g, b, 0)

    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    img = img.resize((img.width, img.height))
    canvas = Image.new('RGBA', (img.width + MARGIN * 2, img.height + MARGIN * 2), (0, 0, 0, 0))
    canvas.alpha_composite(img, (MARGIN, MARGIN))
    return canvas

def download(url):
    req = urllib.request.Request(url, headers={'User-Agent': USER_AGENT})
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read()

for filename, url in URLS.items():
    print(f'Fetching {filename} ...')
    raw = download(url)
    tmp = os.path.join(OUT_DIR, f'.{filename}.source')
    with open(tmp, 'wb') as f:
        f.write(raw)
    try:
        from io import BytesIO
        src = Image.open(BytesIO(raw))
        cleaned = remove_edge_background(src)
        cleaned.save(os.path.join(OUT_DIR, filename), 'PNG', optimize=True)
    finally:
        try:
            os.remove(tmp)
        except FileNotFoundError:
            pass

print(f'Done: {len(URLS)} transparent rank PNGs written to {OUT_DIR}')
