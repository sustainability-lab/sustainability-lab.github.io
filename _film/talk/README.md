# The lab talk: editable slides, and a video made from them

The talk is one file of slides, `slides/lab-talk/index.tsx`, presented and edited with [open-slide](https://github.com/open-slide/open-slide). The talk's video and its PDF are rendered from the same slides with Remotion. Edit a slide once, in open-slide's editor or in the file, and the lecture, the video and the PDF all change.

Everything on a slide is one of three things, and each has one place:

| What | Where | How to change it |
|---|---|---|
| **Words** (titles, lines, numbers, captions, sources) | written as plain text in `slides/lab-talk/index.tsx` | click it in open-slide's editor and type, or edit the file |
| **Pictures** (photos, paper figures, logos) | image files in `slides/lab-talk/assets/<part>/`, imported at the top of `index.tsx` | swap the file, or pick another in the editor |
| **Drawings from data** (maps, charts, signals) | components in `src/talk/visuals/<part>.tsx`, drawn from `data/` | edit the component or its data |

Layout and motion come from the kit, `src/talk/kit.tsx`: the film's look (Swiss red, DM Sans, Arial headings) and its animations, written so they play the same in open-slide and in the video.

## Present and edit

```bash
cd _film
npm install          # once
npm run talk         # prints the local URL; open the lab talk
```

- **Present:** Present (or F) for full screen, P for the presenter view with notes, the next slide and a timer. → plays the next build, then moves on; ← steps back. A slide you arrive at going forward animates in; a slide you jump to or come back to is shown finished.
- **Edit:** click any word on a slide. The Format panel shows it as text: change the words in Content (or double-click on the slide), the font, size or colour, then Save. open-slide writes the change into `index.tsx`.
- **Notes:** the `NOTES` at the bottom of `index.tsx`, by slide id. The public copy leaves them out.

The fonts come from Google Fonts, so present online, or open the deck once while online beforehand.

## Make the video and the PDF

```bash
cd _film
node talk/scripts/video.mjs                                   # out/talk/talk.mp4 (1080p) and talk-720p.mp4
node talk/scripts/video.mjs --4k                              # also out/talk/talk-4k.mp4, the master for YouTube
node talk/scripts/pdf.mjs                                     # out/talk/lab-talk-december-2026.pdf
node talk/scripts/stills.mjs --list stations@0.5 field@12     # a few frames, to check a slide
```

Each slide is in the video for the seconds its `page(id, Slide, [seconds…])` line gives: the first number is the slide before any build, then one number per build. Builds are revealed at those times, and every animation plays exactly as it does when presenting. The PDF has one page per slide, fully built, with real text.

The film's score plays under the video. It is shorter than the talk, so it is laid in crossfaded pieces that each start on a bar (`src/talk/score.ts`): the score from its start to the breakdown under the film's venue wall, then movement two's piano for as long as needed, then the score's last 49 seconds, so the final chord comes on the Join slide and dies away over the closing card. When slides are added or retimed, the pieces move with them; `node talk/scripts/check.mjs` tests this for talks from 1 second to 20 minutes.

`video.mjs` makes the video safe to publish without watching every second of it:

- **The render stops** on a missing score, on a slide whose builds and times disagree (it names the slide), and waits for every picture to load before drawing a frame.
- **The loudness is set** to YouTube's standard, −14 LUFS with true peaks under −1 dBTP, in two passes; only the sound is re-encoded.
- **The result is checked:** picture and sound as long as the talk, no dropouts (no silence over a second except where the score ends quietly), and the loudness on target. A failed check keeps the file aside as `*.unchecked.mp4`, makes no copies and exits with an error. The checks are in `out/talk/talk.report.json`; `node talk/scripts/video.mjs --check FILE` runs them on any video.

## Write a slide

Copy a slide like it from `index.tsx` and change it. A slide looks like this:

```tsx
const Stations: Page = () => (
  <Frame>
    <Head n={1} done={1 / 6}>
      <span>Clean Air</span>
      <p>Most Indian cities have few air monitors.</p>
    </Head>
    <AirMap draw={0} dots={0.3} />
    <Col>
      <Words at={0.2}>
        <h2 style={{ ...S.title }}>535 government monitors cover 277 cities.</h2>
      </Words>
      <Rise at={0.7}>
        <Tag>
          <p>CPCB continuous monitoring stations</p>
        </Tag>
      </Rise>
    </Col>
    <Steps>
      <Step>
        <Finding>
          <p style={{ ...S.kicker }}>FINDING</p>
          <p style={{ ...S.line }}>215 of India's 271 bulletin cities have just one station.</p>
          <p style={{ ...S.note }}>Small monitoring networks are unreliable · SIM-air 2024</p>
        </Finding>
      </Step>
    </Steps>
  </Frame>
);
```

then add it to the running order: `page('stations', Stations, [6, 5])`.

The rules that keep it editable and renderable:

- **Words go in plain elements written in `index.tsx`**: `<h2>`, `<p>`, `<span>`, `<b>`. open-slide's editor can only change text written there. Never pass words to a component as a prop or string, or build them from data.
- **Pictures are `<img>` elements** with a file imported from `./assets/`. Wrap one in `<Reveal>` to place and animate it.
- **Animate with the kit**: `Words` (titles), `Rise`, `Appear`, `TypeIn`, `Count`, `Reveal`, `Finding`, `Bars`/`Bar`, and `<Steps><Step>…</Step></Steps>` for builds. Times are seconds from the start of the slide, or of the build the element is in. CSS transitions and keyframes do not render in the video.
- **Drawings** go in `src/talk/visuals/` and hold no words: write their labels and sources in the slide.

## How it is built

| Part | Where | What it does |
|---|---|---|
| Slides | `slides/lab-talk/index.tsx`, `assets/` | every slide, its words, pictures, builds, timing and notes |
| Kit | `src/talk/kit.tsx`, `src/talk/clock.tsx` | layout and motion in the film's look. Motion runs on a clock: in open-slide it starts when you arrive on a slide going forward, and for a build when → reveals it |
| Drawings | `src/talk/visuals/*.tsx` | maps, charts and signals from `data/`, shared with the film's helpers in `src/lib/` |
| Video | `src/Talk.tsx`, `src/talk/open-slide.tsx`, `src/talk/score.ts`, `talk/webpack.mjs`, `talk/scripts/video.mjs` | Remotion renders the same slides frame by frame; webpack points `@open-slide/core` at a stand-in that sets the clock from the frame and reveals builds on time; the score is laid under it in pieces; `video.mjs` sets the loudness and checks the result |
| PDF | `talk/scripts/pdf.mjs` | the last frame of each slide, as vector PDF pages |
| Checks | `talk/scripts/check.mjs`, `editable.mjs`, `editor-shots.mjs`, `stills.mjs` | the score layout; that every word can be clicked in the editor; open-slide's render of each slide, to compare with the video; frames of the video |
| Site copy | `talk/scripts/publish.sh` | builds the deck for `/talk/` without speaker notes |

The lab film (`src/Film.tsx`, `src/scenes/`, words in `film.yml`) is separate: it is the homepage film, cut to its score. The talk began as the film's slides and uses the film's look and drawings, but its words now live in the slides, so a change to one does not change the other.

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
