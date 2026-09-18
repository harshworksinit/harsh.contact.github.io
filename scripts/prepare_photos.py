#!/usr/bin/env python3
"""Create web derivatives and static gallery markup from the photographer's exports.

Usage: python scripts/prepare_photos.py /path/to/original-exports
Requires Pillow. Originals are read only and are never added to the repository.
"""
from pathlib import Path
from html import escape
from io import BytesIO
import argparse
import json
import re
import os
from collections import Counter
from PIL import Image, ImageOps, ImageCms

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('source', type=Path)
parser.add_argument('--skip-invalid', action='store_true', help='Omit source files that cannot be decoded')
args = parser.parse_args()
photos = json.loads((ROOT / 'scripts/photos.json').read_text())
destination = ROOT / 'assets/photos'
destination.mkdir(parents=True, exist_ok=True)
def atomic_write(path, data):
    temporary = path.with_name(path.name + '.tmp')
    temporary.write_bytes(data)
    os.replace(temporary, path)

markup = []
total = 0
prepared = []
for photo in photos:
    source = args.source / photo['source']
    try:
        with Image.open(source) as check:
            check.load()
    except (OSError, ValueError) as exc:
        if not args.skip_invalid:
            raise
        print(f'Omitted {source.name}: {exc}')
        continue
    with Image.open(source) as original:
        oriented = ImageOps.exif_transpose(original)
        profile = original.info.get('icc_profile')
        if profile:
            try:
                oriented = ImageCms.profileToProfile(oriented, ImageCms.ImageCmsProfile(BytesIO(profile)), ImageCms.createProfile('sRGB'), outputMode='RGB')
            except (OSError, ValueError, ImageCms.PyCMSError) as exc:
                raise RuntimeError(f'Cannot convert the color profile in {source.name}') from exc
        image = oriented.convert('RGB')
        # Do not copy EXIF/GPS or export metadata to the web derivatives.
        clean = Image.new('RGB', image.size)
        clean.paste(image)
    sizes = {}
    for name, edge, quality in [('thumb', 960, 84), ('full', 2048, 88)]:
        copy = clean.copy()
        copy.thumbnail((edge, edge), Image.Resampling.LANCZOS)
        path = destination / f"{photo['slug']}-{name}.webp"
        encoded = BytesIO()
        copy.save(encoded, format='WEBP', quality=quality, method=6)
        atomic_write(path, encoded.getvalue())
        sizes[name] = copy.size
        total += path.stat().st_size
    if photo['slug'] == 'open-road':
        social = ImageOps.fit(clean, (1200, 630), method=Image.Resampling.LANCZOS, centering=(.5, .6))
        encoded = BytesIO()
        social.save(encoded, format='JPEG', quality=90, optimize=True)
        atomic_write(ROOT / 'assets/social.jpg', encoded.getvalue())
    width, height = sizes['thumb']
    title, caption, alt = (escape(photo[k], quote=True) for k in ['title','caption','alt'])
    slug = photo['slug']
    selected = 'true' if photo.get('selected') else 'false'
    category = escape(photo['category'], quote=True)
    markup.append(f'''        <figure class="photo-card" id="photo-{slug}" data-category="{category}" data-selected="{selected}">
          <a class="photo-link" href="assets/photos/{slug}-full.webp" data-title="{title}" data-caption="{caption}" aria-label="View {title} photograph">
            <img src="assets/photos/{slug}-thumb.webp" width="{width}" height="{height}" alt="{alt}" loading="lazy" decoding="async">
          </a>
          <figcaption class="photo-meta"><h3>{title}</h3><span>{category.capitalize()}</span></figcaption>
        </figure>''')
    prepared.append(photo)
html_path = ROOT / 'index.html'
html = html_path.read_text()
start, end = '<!-- GALLERY_START -->', '<!-- GALLERY_END -->'
before, remainder = html.split(start, 1)
_, after = remainder.split(end, 1)
html = before + start + '\n' + '\n'.join(markup) + '\n        ' + end + after
counts = Counter(photo['category'] for photo in prepared)
counts.update({'all': len(prepared), 'selected': sum(bool(photo.get('selected')) for photo in prepared)})
for category, count in counts.items():
    pattern = r'(data-filter="' + category + r'"[^>]*>[^<]*<span>)\d+(</span>)'
    html = re.sub(pattern, lambda match: match[1] + f'{count:02}' + match[2], html)
html = re.sub(r'All \d+ photographs are shown below', f'All {len(prepared)} photographs are shown below', html)
html = re.sub(r'>\d+ photographs · All work</p>', f'>{len(prepared)} photographs · All work</p>', html)
html_path.write_text(html)
print(f'Prepared {len(prepared)} photographs, {total / 1024 / 1024:.2f} MiB across all web derivatives.')
