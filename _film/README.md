# Lab intro film

A 2½-minute film about the lab, made from the site's own data, so a new edition each quarter is one command.

```
make -C _film            # → out/lab-film.mp4 (master), out/web/lab-film.mp4 (site), images/film/poster.jpg
make -C _film 4k         # → out/lab-film-4k.mp4, 3840×2160 for YouTube
make -C _film studio     # live preview: scrub the timeline, edit a scene, see it update
```

Needs Node 18+, `uv`, `ffmpeg`, and (for `layers` only) `pdfimages`/`pdftocairo` from poppler. A full render takes about a minute on an M-series Mac.

## Every quarter

1. Update the site as usual: `data/news.yml`, `data/alumni.yml`, `data/photos.yml`, `data/publications.yml`, `_flyer/flyer.yml`.
2. Give each new news item a short `film:` line (≤ 60 characters). Items from the last `quarter_months` months appear on the red **This quarter** card; without `film:` the first sentence is used, which is usually too long.
3. In `_film/film.yml`, change `edition:` (shown on the last frame), and check the chapter beats still describe current work. New projects go there, one line each.
4. `make -C _film`, then watch `out/lab-film.mp4` start to finish.
5. Publish (see below).

What updates on its own: station and kiln counts, This quarter, the selected-work wall (newest paper with a figure at each venue in `film.yml → work.venues`), alumni counts (PhD and MTech only), the PhD graduates, photos and funders.

## How it is made

| Part | Where | Notes |
|---|---|---|
| Picture | `src/` (Remotion 4, React) | One component per scene in `src/scenes/`; shared motion and the chapter shell in `src/lib/`. Same tokens as the site (`theme/light.scss`, `theme/dark.scss`): DM Sans, Arial headings, Swiss red `#b52d24`. |
| Words | `film.yml` | All on-screen wording that is not a fact from the site. |
| Facts | `scripts/prep.py` → `public/film.json` | Reads the site's data files and the flyer; copies the images it needs into `public/`. |
| Data layers | `data/*.json`, `assets/` (committed) | Built by `scripts/build_layers.py` from the lab's own datasets: CPCB stations and daily Delhi PM2.5 (VayuChat data), a GP PM2.5 field for 2024, 30,638 SentinelKilnDB kilns in five Indo-Gangetic states, Sentinel-2 tiles with their oriented boxes from the SentinelKilnDB figures, one iAWE day (28 July 2013), the Survey of India outline, and land dots for the globe and world map. |
| Score | `audio/score.mp3` | Composed with Google's Lyria 3 Pro (prompt and call in `scripts/score.py`), chosen from eight takes after a listening review. 120 BPM with bar 0 at 0.08 s; every scene starts on a downbeat (`src/timing.ts`, `src/Film.tsx`). |
| Sound effects | `scripts/sfx.py` → `public/sfx/` | Synthesised from noise and sine partials, so there is nothing to license. Cues sit in the scenes (`<Sfx at=…>`), next to the motion they accent. |
| Master | `scripts/master.sh` | −14 LUFS integrated, true peak ≤ −1.5 dBTP. |

Every line in the opening is real data except breathing, which is labelled illustrative: the lab's breathing recordings come from study participants and stay private.

Remotion is free for non-profit organisations under its licence (see `node_modules/remotion/LICENSE.md`). DM Sans and DM Mono are OFL fonts from Google Fonts.

## Changing things

- **Timing.** Scenes are measured in bars of the score (`SCENES` in `src/Film.tsx`; each scene's `*_LEN` must match). Inside a scene, the `T` object holds the beat times in seconds. Keep chapter starts on bar boundaries so the red card lands on the downbeat.
- **A new chapter beat.** Add it to `film.yml`, then place its title with `<BeatText>` and its picture with `<Reveal>` in the chapter's scene.
- **A different score.** Put the file in `audio/`, set `music:` in `film.yml`, run `uv run _film/scripts/analyze_music.py audio/<file> --png sheet.png`, and set `BPM`/`OFFSET` in `src/timing.ts` from its `grid` (check the offset against the section changes it lists).
- **Stems for mixing.** `npx remotion render src/index.ts LabFilm out/sfx.wav --codec=wav --props='{"music":false}'` (or `{"sfx":false}`).

## Publishing

The homepage poster (`images/film/poster.jpg`, about 100 KB) is committed. The film itself (about 18 MB) is too large for git, so it lives as an asset on the repository's `film` release; the publish workflow downloads it into `images/film/` before rendering, and GitHub Pages serves it like any other file. To publish a new edition:

```
gh release upload film _film/out/web/lab-film.mp4 --clobber      # replaces the live film
cp _film/out/web/lab-film.mp4 /tmp/lab-film-2027-01.mp4 && gh release upload film /tmp/lab-film-2027-01.mp4   # dated archive copy
```

then re-run the "Quarto Publish" workflow (`gh workflow run publish.yml`) or push any commit. The release was created on 2026-10-20 with the first edition; the 4K version is on the lab's YouTube channel.

`out/lab-film.mp4` is the 1080p master (about 40 MB) for presentations; `make -C _film 4k` makes the 3840×2160 version that goes to YouTube, with `out/web/thumbnail-1280.jpg` as its thumbnail. Canvas layers draw at the render's pixel ratio (`DPR` in `src/theme.ts`), so the dots stay sharp at 4K.
