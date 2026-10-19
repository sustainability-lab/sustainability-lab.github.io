# Lab flyer

The two-page A3 flyer at <https://sustainability-lab.github.io/flyer.pdf> is generated from the
site's own data, so it stays in step with the website. (The `_` prefix keeps Quarto from rendering
this folder.)

```
data/publications.yml ─┐
data/members.yml ──────┼─▶ build.py ─▶ template.html + flyer.css ─▶ Chrome ─▶ build/flyer.pdf ─▶ /flyer.pdf
data/alumni.yml ───────┤
_flyer/flyer.yml ──────┘   (curation: which projects, awards, logos, press)
```

## Build

Needs [uv](https://docs.astral.sh/uv/) and Google Chrome. Nothing else to install.

```bash
make -C _flyer            # build/<design>/flyer.pdf + page PNGs
make -C _flyer publish    # ...then copy it to /flyer.pdf (commit that file)
make -C _flyer open       # build and open the PDF
make -C _flyer all        # build every design (see below)
make -C _flyer open DESIGN=night   # any design
```

## Designs

One template, five looks. Each look is a small CSS file that restyles the Swiss base
(`flyer.css`); the content is identical across all of them.

| Design | File | Good for |
|---|---|---|
| `swiss` | `flyer.css` (base) | default; matches the website |
| `editorial` | `variants/editorial.css` | serif research-magazine look, cream paper |
| `night` | `variants/night.css` | screens, lobby displays, slides (too much ink for office printers) |
| `blocks` | `variants/blocks.css` | one colour per research theme, bold and poster-like |
| `mono` | `variants/mono.css` | technical data sheet: dot grid, boxed cells, monospace labels |

```bash
uv run _flyer/build.py --all              # build every design into build/<design>/ + build/gallery.html
uv run _flyer/build.py --variant blocks   # build one
```

`--all` also writes `build/gallery.html`: one self-contained page (≈4 MB, images embedded) to
flip through every design with keys 1–5 or ←/→. It can be emailed on its own; its PDF links
only work next to the build folder.

`design:` in `flyer.yml` picks the one that `publish` copies to `/flyer.pdf`. To add a look,
drop a new `variants/<name>.css`; it is picked up automatically. Every design has to pass the
same layout checks.

## What updates by itself

| On the flyer | Comes from |
|---|---|
| Venue, year, figure and award badge on each project tile | `data/publications.yml` |
| "Recent papers" list | newest entries in `data/publications.yml` (workshops/arXiv skipped) |
| Publication, member and alumni counts | `data/*.yml` |
| PhD graduates and where they are now | `data/alumni.yml` |
| QR codes | `join_url` and `url` in `flyer.yml` |

So adding a paper or a member to the site and re-running `make -C _flyer publish` refreshes the flyer.

## Common edits (all in `flyer.yml`)

- **Swap a featured project:** change `paper:` to any text that appears in exactly one publication
  title. Give it a one-line `blurb` (≤ 95 characters) and, if the title is long, a short `name`.
- **Project without a paper yet:** give `name`, `venue` and `image` instead of `paper`
  (see ApneaEye).
- **Better figure than the paper thumbnail:** add `image:`; `/path` is from the site root and
  `assets/...` is this folder. Use a real figure from the paper.
- **New award:** add a `[year, title, detail]` row under `recognition`.
- **Venue shows oddly:** add a `[text in venue, short label]` pair to `venue_aliases`. Order
  matters: the first match wins.

## Guard rails

The build stops with a readable message, and no PDF, when:

- a `paper:` matches zero or several publications
- an image is missing or fails to load
- a blurb or name is too long
- any text overflows its box, or a page overflows A3
- the smallest text drops below 6.5 pt

If a page overflows after you add content, shorten a blurb or remove an item. Don't shrink the type.

## Files

- `flyer.yml`: the curation (edit this)
- `template.html`, `flyer.css`: the layout (Swiss red, same tokens as `theme/light.scss`)
- `build.py`: data → HTML → PDF/PNG, plus the checks (a self-contained `uv` script)
- `assets/`: images the site doesn't already have (alumni logos, press clippings, headshot)
- `build/`: output, git-ignored
