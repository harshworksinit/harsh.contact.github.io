# harsh.contact

Harsh Joshi’s portfolio for professional opportunities and photography inquiries.

The site is static HTML, CSS, and JavaScript, published by GitHub Pages from `main` at the repository root. There is no runtime framework or build requirement. Contact links open an email addressed to `harshjoshiofficial@gmail.com` with the appropriate subject.

## Photography

The opening selection contains six photographs. Visitors can filter the full collection by Automotive, Motorsport, People, and Explorations. Clicking a photograph opens a full-composition viewer with previous/next controls, keyboard navigation, Escape to close, and swipe support. Without JavaScript, all photographs remain available as links.

Web images use WebP, retain the photographer’s composition and watermarks, and contain no copied EXIF/GPS metadata. The original exports are not stored in this repository.

To update the collection:

1. Edit `scripts/photos.json` to set the filename, title, category, caption, and descriptive alt text. Set `selected` to `true` for the opening selection.
2. Place the original exports together in a local folder. Install Pillow in your Python environment if needed.
3. Run `python scripts/prepare_photos.py /path/to/exports`. The script creates the web images, updates the gallery HTML, and recalculates collection counts. It fails on an unreadable source by default; `--skip-invalid` deliberately omits such files and reports their names.
4. Commit the generated changes and publish through the usual pull-request flow.

`SamKProposal-053.jpg` was omitted from the first photography release because the supplied copy could not be decoded. Its catalog entry is retained so supplying the complete original and rerunning the script restores it.

## Review

`dev/responsive.html` is a no-index review page that displays the site at phone, tablet, and desktop widths. It is not linked from the portfolio.

For a local preview: `python -m http.server 8000` from the repository root. Review the gallery filters, image viewer, mobile menu, career disclosure, and both contact links. Respect reduced-motion preferences when adding new interactions.

Keep `CNAME` set to `harsh.contact`. See `DEPLOYMENT.md` for domain setup.
