# _film: the lab film and the lab talk, one source

This folder is both a Remotion project (the film, `src/`) and an open-slide workspace (the talk, `slides/`). They share one theme (`src/theme.ts`), one set of words and numbers (`film.yml`, staged into `public/film.json` by `scripts/prep.py`), and one `node_modules`. Read `README.md` for the film and `talk/README.md` for the talk before changing either.

Rules that differ from open-slide's defaults:

- The deck `slides/lab-talk/` is three modules on purpose. `index.tsx` is the open-slide entry. `live.tsx` holds the film slides, which run `src/Film.tsx` in a Remotion player. `pages.tsx` holds the plain pages. The video (`src/Talk.tsx`) imports `pages.tsx`, so keep plain pages there and keep Vite-only code (`import.meta.glob`, `import.meta.env`) out of it.
- The slide list is `talk/cues.mjs`, not the order in `index.tsx`. After editing it, run `node talk/scripts/deck.mjs`.
- Animate plain pages with `<Steps>`/`<Step>` or with time-driven components (`src/lib/motion.tsx`). CSS transitions and keyframes do not render in the video.
- Write words plainly, as the lab does, with exact numbers and their sources. Keep under-review work labelled as in `film.yml`.
- `package.json` is shared with the film: add dependencies only when both outputs need them.
