# The lab talk: lecture and video from one source

Everything lives in `_film/`, one workspace with one theme and one set of packages. From it come two things: the **lecture**, presented with [open-slide](https://github.com/open-slide/open-slide), and the **video**, rendered with Remotion. Both read the same slide list, `talk/cues.mjs`, and the same components, so a change in one place shows up in both. Nothing is a screenshot: slides draw the film's components live in the browser, and the video renders the same components frame by frame.

The slide list mixes two kinds of slide:

- **Film slides** are a stretch of the lab film (`src/scenes/*`, words and numbers in `film.yml`), stopping where `cues.mjs` says. In open-slide each → plays the film to the next stop. In the video they play straight through, with the music.
- **Plain pages** are ordinary open-slide pages (`slides/lab-talk/pages.tsx`), in the film's look and using its data. In open-slide they behave like any open-slide page, with `<Steps>` builds. In the video, a stand-in for open-slide (`src/talk/open-slide.tsx`) renders them frame by frame, revealing each build at the time `cues.mjs` gives it, with optional narration.

The December 2026 deck has 32 slides: the cover, the opening, the title, the place, an agenda (a plain page), the four chapter cards, one slide per beat of `film.yml`, and the lab at the end.

## Set up, present

```bash
cd _film
npm install                          # once
uv run scripts/prep.py               # once, and after film.yml or the site's data change (writes public/)
node talk/scripts/deck.mjs           # the slide list and the thumbnails' stills
npm run talk                         # prints the local URL; open the "Sustainability Lab" deck
```

Press **F** (or Present) for full screen and **P** for the presenter view, which shows the notes, the next slide and a timer. → or space plays on to the next stop or build, then moves to the next slide; ← steps back. A slide you jump to or come back to shows its last stop. The film plays silent in the lecture. The fonts come from Google Fonts, so present online or open the deck once while online beforehand.

## Make the video and the PDF

```bash
cd _film
npx remotion render src/index.ts Talk out/talk/talk.mp4                      # the slides as a video, with the music
npx remotion render src/index.ts Talk out/talk/talk.mp4 --props='{"hold":2}' # rest 2 s on each stop of a film slide
PDF=1 node talk/scripts/deck.mjs && uv run talk/scripts/pdf.py               # out/talk/lab-talk-december-2026.pdf
```

`Talk` (`src/Talk.tsx`) lays the slide list out in time: film slides as their stretches of the film, plain pages for the seconds `cues.mjs` gives them. With no plain pages and no hold it is the lab film, frame for frame. The PDF is the last frame of each slide in that same video, at 3840 × 2160.

## Write

- **A change to the film** (a word, a number, a scene): edit `film.yml` or `src/scenes/*`, run `uv run scripts/prep.py` if `film.yml` changed, then `node talk/scripts/deck.mjs`. The open deck updates as you save.
- **A new film beat:** add its stops to `talk/cues.mjs`, written as `<scene>@<seconds>`, for example `air@st+3.95`. Beat keys (`st`, `fi`, `ad`, …) come from the scene's `const T` table, so stops move with their beat when the film is retimed. `node talk/scripts/deck.mjs --check` lists every stop in film time and names any `film.yml` beat without a slide.
- **A new plain page:** write it in `slides/lab-talk/pages.tsx` (take colours and fonts from `src/theme.ts` and words from `F` in `src/data.ts`). Add it to `PLAIN`, and list it in `cues.mjs`: `{ id, title, page: true, steps: [3, 2, 2] }`, with the seconds for the page and then for each build. Use `<Steps>` and `<Step>` for builds. CSS transitions and keyframes do not render frame by frame, so for real motion write a time-driven component like the film's scenes.
- **Narration:** put `audio/narration/<id>.mp3` in the workspace, run `uv run scripts/prep.py`, and add `audio: "audio/narration/<id>.mp3"` to the page in `cues.mjs`. The page then lasts at least as long as its narration in the video. The lecture never plays it.
- **Speaker notes:** the `NOTES` in `slides/lab-talk/index.tsx`, by slide id.
- **Checks:** `node talk/scripts/deck.mjs --clips`, then `uv run talk/scripts/verify.py`, confirms that every stop lands on a pause in the film. The photo montage is marked `holds: false` because it never stops moving.

## How it is built

| Part | Where | What it does |
|---|---|---|
| Slide list | `talk/cues.mjs` → `slides/lab-talk/assets/deck.json` | `talk/scripts/deck.mjs` resolves every stop to a film frame, reading the film's clock, scene list and beat tables from `src/`, and renders a still of each stop for thumbnails. The stills are cached by a fingerprint of the film's source. |
| Lecture | `slides/lab-talk/index.tsx`, `live.tsx`, `pages.tsx` | `live.tsx` runs `src/Film.tsx` in a Remotion `<Player>` inside each film slide and plays it from stop to stop. `pages.tsx` holds the plain pages. `index.tsx` puts the list together with the notes. |
| Video | `src/Talk.tsx`, `src/talk/open-slide.tsx`, `talk/webpack.mjs` | Remotion renders the same list. Webpack points the pages' `@open-slide/core` at the stand-in, which supports `Steps`, `Step`, the page hooks and the design variables. |
| Site copy | `talk/scripts/publish.sh` | Builds the deck with base `/talk/`, without speaker notes, and copies the film's images to `talk/film/`. |

In a player, music and sound effects are off (`flag()` in `src/lib/env.ts`), so the lecture is silent and loads no audio.

## On the lab site

The deck is live at [sustainability-lab.github.io/talk](https://sustainability-lab.github.io/talk/), linked under the film on the homepage. The site serves the committed `talk/` folder on `main` as it is. To publish a new version:

```bash
git worktree add /tmp/site-main main                 # a clean checkout of main
bash _film/talk/scripts/publish.sh /tmp/site-main    # builds into /tmp/site-main/talk
cd /tmp/site-main && git add talk && git commit -m "Update the lab talk" && git push
git worktree remove /tmp/site-main
```

Pushing to `main` redeploys the site in about four minutes.

## Before showing it outside the lab

- FiLMeR is in review. Confirm its numbers (281 minutes of WRF vs 6.5 seconds, 1.7 °C error) with Balbir or Deena.
- Interpretable sleep staging is in review and double-blind: no venue or paper title, and no MESA or NSRR data.
- Aperture is a 2026 preprint. The FlowSat images are generated, and the slide says so.
- Samachar and Vartalaap: the numbers are checked against the papers (Samachar Tables 3–4; Vartalaap §5.2.1 and Fig. 10). The tweets are about Delhi only.
- The JoulesEye, SpiroMask, ThermEval and ApneaEye slides show exactly what the film shows: figures with thermal views of faces, and photos with faces blurred. The breathing trace on the JoulesEye slide is illustrative, not a recording.
