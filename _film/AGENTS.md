# _film: the lab film and the lab talk

This folder is both a Remotion project and an open-slide workspace, with one theme (`src/theme.ts`) and one `node_modules`:

- **The film** (`src/Film.tsx`, `src/scenes/`, words in `film.yml`, staged into `public/film.json` by `scripts/prep.py`): the homepage film. See `README.md`.
- **The talk** (`slides/lab-talk/index.tsx`): editable slides, presented with open-slide; the talk's video (`src/Talk.tsx`) and PDF are rendered from the same slides. See `talk/README.md`.

Rules for the talk, which differ from open-slide's defaults:

- Every slide is in `slides/lab-talk/index.tsx`. open-slide's editor only edits that file, locating elements by line and column, and only lowercase elements written in it. Do not split the deck into more modules.
- Every word on a slide is plain text in an element written in `index.tsx` (`<h2>`, `<p>`, `<span>`, `<b>`). Never pass words to a component as a prop or string, and never build them from data.
- Pictures are `<img>` elements importing files from `slides/lab-talk/assets/<part>/`. Drawings made from data are components in `src/talk/visuals/` and hold no words.
- Animate with the kit (`src/talk/kit.tsx`), which runs on a clock (`useT`) so open-slide and the video match. No CSS transitions or keyframes: they do not render in the video. Builds are `<Steps><Step>…</Step></Steps>`.
- Each slide's time in the video is its `page(id, Slide, [seconds…])` line. After changing slides, check the video with `node talk/scripts/stills.mjs --list <id>@<seconds>`.
- Write words plainly, as the lab does, with exact numbers and their sources. Keep under-review work labelled as it is now.
- `package.json` is shared with the film: add dependencies only when both need them.
