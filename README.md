# Sustainability Lab Website

Source for <https://sustainability-lab.github.io>, the website of the Sustainability Lab at IIT Gandhinagar (Prof. Nipun Batra). Built with [Quarto](https://quarto.org); light and dark mode are built in.

## Common tasks

| I want to… | Edit |
|---|---|
| Add myself as a new member | `data/members.yml` + a square photo in `images/members/` |
| Move someone to alumni | remove from `data/members.yml`, add to `data/alumni.yml` |
| Add news, an award, a talk, an event or press coverage | `data/news.yml` (photos: `images/awards/`, `images/media/`) |
| Add a paper | top of `data/publications.yml` + figure/PDF in `papers/<year>/` + `.bib` in `papers/bibtex/` (see `papers/README.md`) |
| Add a student story | new file in `experiences/<firstname>.qmd` (copy an existing one) |
| Add lab photos | `data/photos.yml` + images in `images/memories/` |
| Update openings | `join.qmd` |
| Update handbook pages | `handbook/*.qmd` |

Each data file has a comment at the top listing its fields.

## Layout

```
index.qmd  research.qmd  people.qmd  join.qmd  news.qmd   main pages
papers/            publications page, PDFs and figures by year, BibTeX
handbook/          lab handbook (onboarding, culture, writing, compute, ...)
data/              members, alumni, news (incl. awards, press, events), publications, photos, quotes (YAML)
_templates/        how the YAML is turned into HTML (EJS listing templates)
theme/             light.scss / dark.scss (colour tokens), site.scss, legacy.scss
images/            brand/, illustrations/, members/, memories/, awards/, media/, funders/
experiences/       alumni stories     events/   ACM Summer School 2025 site
slides/            talk and poster PDFs (Keynote/PowerPoint sources are in the
                   "slide-sources" GitHub release)
```

Pages that were renamed keep their old URLs through `aliases:` redirects (e.g. `openings.html` → `join.html`, `members.html` → `people.html`). Awards, Media and Events are filtered views of News (`awards.html` → `news.html?type=award`).

## Preview and deploy

```bash
quarto preview
```

Pushing to `main` runs `.github/workflows/publish.yml`, which renders the site and publishes it to the `gh-pages` branch. `docs/` is a local build folder and is not committed.

## Design

Matches [nipunbatra.github.io](https://nipunbatra.github.io): DM Sans body, Arial headings, warm red accent (`#b52d24` light, `#f1a399` dark), flat rules, no shadows. Colours live only in `theme/light.scss` and `theme/dark.scss`.
