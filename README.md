# Pedal Mafia Men's department prototype

Coded prototype of the Pedal Mafia Men's department page: one section per category, built on the
live US catalog. Forked from the Men's Jerseys PLP prototype (`pm-plp-prototype`).

Live at https://christopher-tds.github.io/pm-department-prototype/ (GitHub Pages from `main`).

**Design source:** Figma `[PM] Templates & Pages`, frame "C3 · Desktop · category sections · 12 max,
3 rows · real products" (`261:8208`). The card is Card A2 from the PLP prototype (name, price,
colorway, swatches).

## What it does

- **Header:** "Men" with the men's collection count, then a horizontal scroller of category cards
  (4:5, on-figure photo, name bottom left), one per section, each jumping to it. 3.25 cards show on
  desktop, 3.5 on tablet and 2.25 on mobile. Arrows (desktop) and a progress bar appear only when the
  row overflows (C14). Most photos are the section's first on-figure shot; `COVERS` in `app.js`
  overrides the ones that aren't really on-model.
- **12 category sections** in Figma order: Jerseys, Bibs, Base layers, Vests, Jackets, Socks, Shirts
  and sweatshirts, Shorts, Headwear, Warmers, Gloves, Cycling caps. Each has a title with its product
  count as a superscript (as on the category page), one line of copy naming the franchises in it, and
  a "Shop all" link to the live collection.
- **Grid:** the collection's first products in merch order, sold out last. 8 on desktop (2 rows of
  4) and tablet (4 rows of 2), 6 on mobile (3 rows of 2). Bundles stay out of Jerseys and Bibs.
- **Cards:** same as the PLP prototype. Tapping a swatch swaps the tile in place; hovering previews
  the colorway with the rack focus and the colorway fade-up. Swatches cover every colorway in the
  collection, not just the ones on screen. Sold out and On sale badges per PM-10.
- **Second shot:** on desktop, hovering a card photo brings in the on-figure shot with the rack
  focus. On tablet and mobile, the photo swipes between the flat lay and the on-figure shot, with a
  2px bar 4px under it (Taylor Stitch pattern). Products without an on-figure shot keep one image.
- **Rack focus + fade up:** cards resolve into focus as they scroll into view, staggered across each
  row. Off with reduced motion.
- **Review tools:** viewport switcher (Desktop / Tablet 820 × 1180 / Mobile 393 × 852), the
  transitions tuner, and a temporary **Cards** panel (`cards-tuner.js`) that sets the category
  cards' count in view, height ratio, gap and label inset per viewport, with a live size readout and
  Copy CSS. All top right. `?clean=1` hides both. Settings are stored separately from the PLP
  prototype's.

## Run locally

```bash
python3 serve.py
```

Then open http://localhost:5181. The server live-reloads on file changes.

## Refresh the product data

```bash
python3 tools/build_data.py
```

It fetches each category collection's `products.json` and writes `data.js`. Section titles, copy and
collection handles live in `SECTIONS` at the top of the script. Needs Pillow (`pip install pillow`).

## Notes

- Inter stands in for ABC Whyte, the brand font, which is licensed and not bundled here.
- Product images load from Shopify's CDN; nothing is copied into the repo.
- Products with no white-background flat lay get a gray placeholder swatch (`#BBBDC0`).
- The share image (`assets/og-image.jpg`, 1200 × 630) is a capture of the page top with `?clean=1`.
