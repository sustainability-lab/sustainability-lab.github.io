# Lab intro film

A 2½-minute film about the lab, made from the site's own data, so a new edition each quarter is one command.

```
make -C _film            # → out/lab-film.mp4 (1080p master), out/web/lab-film.mp4 (18 MB copy for talks), images/film/poster.jpg
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
| Score | `audio/score.mp3`, `audio/score-dec.mp3` | Composed with Google's Lyria 3 Pro (prompt and call in `scripts/score.py`), chosen from eight takes after a listening review. 120 BPM with bar 0 at 0.08 s; every scene starts on a downbeat (`src/timing.ts`, `src/Film.tsx`). The December 2026 edition plays `score-dec.mp3`: the same take with three four-bar phrases repeated (bars 17–20, 26–29, 34–37), chosen where the harmony and loudness on both sides of the joint match (`scripts/extend_score.py`), so Air, Earth and Health run 14 bars. |
| New beats, December 2026 | `data/`, `assets/aperture/` | **FiLMeR**: WRF's 2 m temperature and FiLMeR's emulation for one held-out morning, 1 Jan 2025 06 UTC, error recomputed from the arrays (`scripts/filmer_layer.py`, from `filmer-wasm-webgpu`); the 281-minute vs 6.5-second forecast cost is the paper's Table 14 (KDD 2026 submission); both to confirm with the authors before release. **Samachar**: weekly articles and PM2.5 for Delhi, recovered from the vector paths of the paper's Fig. 5 (`scripts/samachar_layer.py`). **Aperture**: the paper's coal-plant tile and zoom path (Fig. 3, arXiv 2609.38603), one 4096 px JPEG. **Signal Descriptors**: one real PPG-DaLiA window and its TSFEL descriptors, from the paper's own film (`scripts/descriptors_layer.py`). **Interpretable sleep staging**: concept names and the two Macro-F1 scores from the submission (double-blind, so no venue or title on screen). |
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

The homepage shows `images/film/poster.jpg` (committed) with a "Watch the lab film" button. The button opens the film from the lab's YouTube channel in a dialog; the YouTube player loads only when pressed (`index.qmd`, `data-youtube`). For a new edition:

1. `make -C _film 4k`, then upload `out/lab-film-4k.mp4` to the lab channel, private first:

   ```
   yt-lab upload _film/out/lab-film-4k.mp4 --title "Sustainability Lab, IIT Gandhinagar: AI for a sustainable future (January 2027)" \
     --description-file description.txt --category 27 --privacy private --synthetic --language en \
     --thumbnail _film/out/web/thumbnail-1280.jpg
   ```

   The description of the first edition (with chapter times) is a good template: `yt-lab status wi7nu7pTJqc --json`.
2. Watch it in YouTube Studio, then make it public: `yt-lab update <id> --privacy public`.
3. Put the new video ID in `index.qmd` (the `data-youtube` attribute and the "open on YouTube" link) and add a news item.

The first edition (October 2026) is https://youtu.be/wi7nu7pTJqc. `out/web/lab-film.mp4` (18 MB) is a lighter copy for talks and slides; the repository's `film` release keeps the October 2026 copy.
