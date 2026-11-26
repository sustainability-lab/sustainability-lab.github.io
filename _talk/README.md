# Lab talk, December 2026

One source, two outputs. The lab's story is written once, as React components driven by time with one design system: the film's scenes in `_film/src/scenes/`, its words and numbers in `_film/film.yml`, its tokens in `_film/src/theme.ts`. This folder is the talk, built with [open-slide](https://github.com/open-slide/open-slide): the slides, their order, where each one stops, and the speaker notes. Remotion runs underneath both outputs. Its player draws every slide live in the browser, so text and charts are sharp at any size and nothing is a screenshot. Its renderer turns the same slide list into the video, with the music (`Talk` in `_film/src/Talk.tsx`). Edit a scene or a line in `film.yml` and both change.

The deck has 31 slides: one per beat of `film.yml`, plus the cover, the opening, the title, the place, the four chapter cards and the lab at the end. Each → plays the next moment of the film and stops; arriving at a slide going forward plays the film's own transition into it. Played end to end, the slides are the film, frame for frame. Every slide has speaker notes with the numbers, sources and caveats (`NOTES` in `slides/lab-talk/index.tsx`, keyed by slide id).

## Present

```bash
cd _talk
npm install                  # first time only (also run npm install in ../_film)
node scripts/player.mjs      # build the live film player into player-dist/
npm run dev                  # prints the local URL; open the "Sustainability Lab" deck
```

Press **F** (or Present) for full screen and **P** for the presenter view, which shows the notes, the next slide and a timer. → or space plays on to the next stop, then moves to the next slide; ← steps back. A slide you jump to or come back to shows its last stop. The film plays silent.

The fonts come from Google Fonts, so present with a network connection or once online beforehand. `npm run build`, then `npm run preview`, serves the same deck from `dist/`. `out/lab-talk-december-2026.pdf` (the last stop of each slide at 3840 × 2160) works on any laptop.

## How it fits together

- **Content:** `_film/src/scenes/*.tsx` and `_film/film.yml`. After changing `film.yml` or the site data, run `uv run _film/scripts/prep.py`.
- **Slides:** `cues.mjs` lists, for each slide, the moments it stops on, written as `<scene>@<seconds>`, for example `air@st+3.95`. Beat keys (`st`, `fi`, `ad`, …) come from the scene's `const T` table, so a stop moves with its beat when the film is retimed. A `cover` entry shows one frame outside the running order; `from` starts a slide's opening at a given moment.
- **`node scripts/deck.mjs`** resolves the stops against the film and writes `slides/lab-talk/assets/deck.json`, plus a still of every stop for thumbnails, the overview and the PDF. `--check` only lists the stops in film time and names any `film.yml` beat without a slide.
- **`node scripts/player.mjs`** bundles the film's own source with the film's own packages (one React, one Remotion) into `player-dist/`, the page each slide embeds.
- **`slides/lab-talk/index.tsx`** embeds the player in each slide and drives it from stop to stop with open-slide's step keys.
- **The video:** `_film/src/Talk.tsx` builds it from `deck.json`, each slide's stretch of the film in deck order. In `_film/`, `npx remotion render src/index.ts Talk out/talk.mp4` gives the film with its music; `--props='{"hold":2}'` rests 2 seconds at each stop, silent while resting.
- **Checks:** `node scripts/deck.mjs --clips`, then `uv run scripts/verify.py`, confirms that every stop lands on a pause in the film. The photo montage is marked `holds: false` because it never stops moving.
- **PDF:** `PDF=1 node scripts/deck.mjs`, then `uv run scripts/pdf.py`.

After a change: `node scripts/player.mjs` and `node scripts/deck.mjs`, and the dev deck picks them up. `player-dist/`, the stills, `out/`, `dist/` and `node_modules/` are not in git.

## On the lab site

The deck is live at [sustainability-lab.github.io/talk](https://sustainability-lab.github.io/talk/), linked under the film on the homepage. That copy has no speaker notes. The site serves the committed `talk/` folder on `main` as it is (`_quarto.yml` → `resources`), with the player in `talk/film/`. To publish a new version:

```bash
git worktree add /tmp/site-main main                 # a clean checkout of main
bash _talk/scripts/publish.sh /tmp/site-main         # builds the deck and copies the player into /tmp/site-main/talk
cd /tmp/site-main && git add talk && git commit -m "Update the lab talk" && git push
git worktree remove /tmp/site-main
```

Pushing to `main` redeploys the site in about four minutes.

## Next

Plain open-slide pages (text, figures, open-slide's own builds) can join the video through a small stand-in for open-slide's runtime inside Remotion, so a slide written only in open-slide also renders to video. Narration tracks per slide would set each slide's length in the video.

## Before showing it outside the lab

- FiLMeR is in review. Confirm its numbers (281 minutes of WRF vs 6.5 seconds, 1.7 °C error) with Balbir or Deena.
- Interpretable sleep staging is in review and double-blind: no venue or paper title, and no MESA or NSRR data.
- Aperture is a 2026 preprint. The FlowSat images are generated, and the slide says so.
- Samachar and Vartalaap: the numbers are checked against the papers (Samachar Tables 3–4; Vartalaap §5.2.1 and Fig. 10). The tweets are about Delhi only.
- The JoulesEye, SpiroMask, ThermEval and ApneaEye slides show exactly what the film shows: figures with thermal views of faces, and photos with faces blurred. The breathing trace on the JoulesEye slide is illustrative, not a recording.
