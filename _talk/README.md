# Lab talk, December 2026

The talk is the lab film (`_film/`), cut where the film pauses. Each → plays the next moment of the film and stops on it; arriving at a slide going forward plays the film's own transition into it. Played end to end, the 31 slides are the film, frame for frame: 65 rest points and 64 segments covering all 297 seconds. One slide per beat of `film.yml`, plus the film's first frame (a deck opens on its first slide fully built, so the opening needs a slide before it), the title, the place, the four chapter cards and the lab at the end. Every slide has speaker notes with the numbers, sources and caveats (the `NOTES` in `slides/lab-talk/index.tsx`, keyed by slide id).

Built with [open-slide](https://github.com/open-slide/open-slide): each page is a React component on a 1920 × 1080 canvas.

## Present

```bash
cd _talk
npm install      # first time only
npm run dev      # prints the local URL; open the "Sustainability Lab" deck
```

Press **F** (or Present) for full screen and **P** for the presenter view, which shows the notes, the next slide and a timer. → or space plays on to the next rest, then moves to the next slide; ← steps back. A slide you jump to or come back to shows its last rest. The film plays muted.

No dev server on the day? `npm run build`, then `npm run preview` serves the same deck from `dist/` with no network needed. `out/lab-talk-december-2026.pdf` (30 pages: the last rest of each slide at 3840 × 2160, without the dark first frame) works on any laptop.

## How the film becomes slides

- `cues.mjs` is the one list to edit: for each slide, the frames it rests on. A cue is the last frame before the film's next motion, written as `<scene>@<seconds>`, for example `air@st+3.95`. Beat keys (`st`, `fi`, `ad`, …) come from the scene's `const T` table in `_film/src/scenes/*.tsx`, so a cue moves with its beat when the film is retimed.
- `node _talk/scripts/deck.mjs --check` resolves every cue against the film (scene list in `_film/src/Film.tsx`, clock in `timing.ts`), lists each slide's rests in film time, checks that they run in order and cover the whole film, and names any `film.yml` beat without a slide.
- `node _talk/scripts/deck.mjs` renders, from the `LabFilm` composition itself, a still at every rest (`frames/f01234.jpg`, named by film frame) and a muted clip from each rest to the next (`clips/f01100-f01234.mp4`), and writes `slides/lab-talk/assets/deck.json`. Only missing pieces are rendered, so moving one cue or regrouping slides takes seconds; `deck.json` keeps a fingerprint of the film's source and images, and when the film changes everything is rendered again (about five minutes). It uses the film's own `node_modules` (run `npm install` in `_film/` first) and writes only inside `_talk/`.
- `uv run _talk/scripts/verify.py` checks that every cue lands on a pause: it measures how much the picture still moves at the end of each clip and names any cue that stops the film mid-animation. Slides marked `holds: false` in `cues.mjs` (the photo montage, which never stops moving) are cut on purpose.
- `PDF=1 node _talk/scripts/deck.mjs`, then `uv run _talk/scripts/pdf.py`, makes the PDF.

When the film changes, re-run `deck.mjs`. If a beat gains or loses a step (a new finding, a new build), add or move its cue in `cues.mjs` and give a new slide a note in `index.tsx`.

The stills and clips (about 45 MB) are not in git, like `out/`, `dist/` and `node_modules/`: after a fresh checkout, run `deck.mjs` once to render them.

## On the lab site

The deck is live at [sustainability-lab.github.io/talk](https://sustainability-lab.github.io/talk/), linked under the film on the homepage. That copy has no speaker notes. The site serves the committed `talk/` folder on `main` as it is (`_quarto.yml` → `resources`). To publish a new version:

```bash
git worktree add /tmp/site-main main                 # a clean checkout of main
bash _talk/scripts/publish.sh /tmp/site-main         # builds into /tmp/site-main/talk
cd /tmp/site-main && git add talk && git commit -m "Update the lab talk" && git push
git worktree remove /tmp/site-main
```

Pushing to `main` redeploys the site in about four minutes.

## Before showing it outside the lab

- FiLMeR is in review. Confirm its numbers (281 minutes of WRF vs 6.5 seconds, 1.7 °C error) with Balbir or Deena.
- Interpretable sleep staging is in review and double-blind: no venue or paper title, and no MESA or NSRR data.
- Aperture is a 2026 preprint. The FlowSat images are generated, and the slide says so.
- The JoulesEye, SpiroMask, ThermEval and ApneaEye slides show exactly what the film shows: figures with thermal views of faces, and photos with faces blurred. The breathing trace on the JoulesEye slide is illustrative, not a recording.
