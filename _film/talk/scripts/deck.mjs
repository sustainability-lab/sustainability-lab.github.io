// Make the talk from the lab film: a still at every rest and a clip of the film between rests, cut
// from the film's own timeline (the LabFilm composition), plus deck.json for the slides.
//
//   node _film/talk/scripts/deck.mjs --check  # resolve the cues in _film/talk/cues.mjs against the film
//   node _film/talk/scripts/deck.mjs          # render the stills that are missing or stale (about a minute)
//   node _film/talk/scripts/deck.mjs --clips  # also a clip of every segment, for verify.py (about 5 minutes)
//   PDF=1 node _film/talk/scripts/deck.mjs    # also each slide's last rest at 3840 x 2160 in _film/out/talk/pdf/
//
// Stills are named by film frame (f01234.jpg) and clips by their two frames (f01100-f01234.mp4), so
// moving one cue or regrouping slides renders only what changed. deck.json records a fingerprint of
// the film's source and images; when the film itself changes, everything is rendered again.
// It renders with the film's own node_modules and writes only into slides/lab-talk/assets/ and out/.

import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { DECK } from "../cues.mjs";
import { FILM, filmHash, filmTimeline, resolveDeck } from "./film.mjs";
import { talkWebpack } from "../webpack.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.resolve(HERE, "../../slides/lab-talk/assets");
const FRAMES = path.join(ASSETS, "frames");
const CLIPS = path.join(ASSETS, "clips");
const MANIFEST = path.join(ASSETS, "deck.json");
const PDF_DIR = path.resolve(HERE, "../../out/talk/pdf");
const CLIPS_TOO = process.argv.includes("--clips"); // video clips of each segment, for verify.py

const timeline = filmTimeline();
const { FPS } = timeline;
const slides = resolveDeck(DECK, timeline);
const rests = slides.flatMap((s) => s.rests);
const sec = (f) => `${(f / FPS).toFixed(2)}s`;
const played = rests.filter((r) => r.clip); // the running order, without the cover
const covered = played.reduce((n, r) => n + r.frame - r.from, 1) / timeline.frames;
console.log(`${slides.length} slides, ${rests.length} rests, ${rests.length - 1} segments; covering ${(covered * 100).toFixed(1)}% of the film (${(timeline.frames / FPS).toFixed(1)} s)`);
const beats = [...fs.readFileSync(path.join(FILM, "film.yml"), "utf8").matchAll(/^\s+- id: (\w+)/gm)].map((m) => m[1]);
const missing = beats.filter((b) => !slides.some((s) => s.id === b));
if (missing.length) console.log(`  film.yml beats without a slide of their own: ${missing.join(", ")}`);
if (process.argv.includes("--check")) {
  for (const s of slides) console.log(`  ${s.id.padEnd(12)} ${s.page ? `page, ${s.page.steps.length} parts, ${s.page.steps.reduce((a, b) => a + b, 0)} s in the video` : s.rests.map((r) => sec(r.frame)).join("  ")}`);
  process.exit(0);
}

// ---------- what to render ----------
const hash = filmHash();
const old = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : null;
const fresh = old?.film?.hash !== hash || process.argv.includes("--force");
for (const dir of [FRAMES, CLIPS]) {
  if (fresh) fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}
const openings = rests.filter((r) => r.from !== null).map((r) => ({ ...r, still: `f${String(r.from).padStart(5, "0")}`, frame: r.from, clip: null }));
const want = {
  stills: new Set([...rests, ...openings].map((r) => `${r.still}.jpg`)),
  clips: new Set(CLIPS_TOO ? rests.filter((r) => r.clip).map((r) => `${r.clip}.mp4`) : []),
};
for (const [dir, keep] of [[FRAMES, want.stills], [CLIPS, want.clips]]) {
  for (const f of fs.readdirSync(dir)) if (!keep.has(f)) fs.rmSync(path.join(dir, f)); // no longer used
}
const byStill = new Map([...openings, ...rests].map((r) => [r.still, r])); // one still per frame, the rest's clip kept
const todo = [...byStill.values()].filter((r) => !fs.existsSync(path.join(FRAMES, `${r.still}.jpg`)) || (CLIPS_TOO && r.clip && !fs.existsSync(path.join(CLIPS, `${r.clip}.mp4`))));
console.log(fresh ? "film changed (or first run): rendering everything" : `${todo.length} of ${rests.length} rests to render`);

if (todo.length || process.env.PDF) {
  const require = createRequire(path.join(FILM, "package.json"));
  const { bundle } = require("@remotion/bundler");
  const { openBrowser, renderMedia, renderStill, selectComposition } = require("@remotion/renderer");
  console.log(`bundling ${FILM}/src …`);
  const serveUrl = await bundle({ entryPoint: path.join(FILM, "src/index.ts"), rootDir: FILM, publicDir: path.join(FILM, "public"), enableCaching: false, webpackOverride: talkWebpack(FILM) });
  const chromiumOptions = { gl: "angle" };
  const browser = await openBrowser("chrome", { chromiumOptions });
  const composition = await selectComposition({ serveUrl, id: "LabFilm", puppeteerInstance: browser });
  if (composition.durationInFrames !== timeline.frames) throw new Error(`LabFilm is ${composition.durationInFrames} frames but Film.tsx reads as ${timeline.frames}; check film.mjs`);

  const still = (frame, output, scale = 1) =>
    renderStill({ composition, serveUrl, output, frame, imageFormat: "jpeg", jpegQuality: 88, scale, puppeteerInstance: browser, chromiumOptions, overwrite: true });
  const clip = async (from, to, output) => {
    const raw = output.replace(/\.mp4$/, ".raw.mp4");
    await renderMedia({
      composition, serveUrl, codec: "h264", outputLocation: raw, frameRange: [from, to], muted: true, crf: 21,
      imageFormat: "jpeg", jpegQuality: 92, puppeteerInstance: browser, chromiumOptions, overwrite: true, logLevel: "error",
    });
    // moov atom first, so a browser can start playing before the whole clip has arrived
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", raw, "-c", "copy", "-movflags", "+faststart", output]);
    fs.rmSync(raw);
  };

  for (const r of todo) {
    const s = path.join(FRAMES, `${r.still}.jpg`);
    if (!fs.existsSync(s)) await still(r.frame, s);
    const c = CLIPS_TOO && r.clip && path.join(CLIPS, `${r.clip}.mp4`);
    if (c && !fs.existsSync(c)) await clip(r.from, r.frame, c);
    console.log(`  ${r.cue.padEnd(18)} ${sec(r.frame)}`);
  }
  if (process.env.PDF) {
    // the PDF comes from the video's own render path: each slide's last frame in the Talk composition
    // (src/Talk.tsx), so plain open-slide pages and film slides print the same way
    const talk = await selectComposition({ serveUrl, id: "Talk", puppeteerInstance: browser });
    const ends = new Map(talk.props.timeline.slides.map((s) => [s.id, s.end - 1]));
    fs.rmSync(PDF_DIR, { recursive: true, force: true });
    fs.mkdirSync(PDF_DIR, { recursive: true });
    const pages = slides.filter((s) => s.pdf && (ends.has(s.id) || !s.page));
    for (const [i, s] of pages.entries()) {
      const output = path.join(PDF_DIR, `${String(i + 1).padStart(2, "0")}-${s.id}.jpg`);
      if (ends.has(s.id)) {
        await renderStill({ composition: talk, serveUrl, output, frame: ends.get(s.id), imageFormat: "jpeg", jpegQuality: 88, scale: 2, puppeteerInstance: browser, chromiumOptions, overwrite: true });
      } else {
        await still(s.rests.at(-1).frame, output, 2); // the cover: a frame outside the running order
      }
    }
    console.log(`  ${pages.length} PDF pages in ${path.relative(process.cwd(), PDF_DIR)}`);
  }
  await browser.close({ silent: true });
}

const edition = (fs.readFileSync(path.join(FILM, "film.yml"), "utf8").match(/^edition: (.+?)\s+#/m) ?? [])[1] ?? null;
const manifest = {
  film: { fps: FPS, frames: timeline.frames, hash, edition },
  slides: slides.map((s) =>
    s.page
      ? { id: s.id, title: s.title, pdf: s.pdf, page: s.page } // a plain open-slide page (slides/lab-talk/pages.tsx)
      : {
          id: s.id,
          title: s.title,
          pdf: s.pdf,
          holds: s.holds, // false: the film never pauses here (cuts between moving shots)
          // the film plays from `from` to each rest; `open` is the frame it starts from on arrival
          open: s.rests[0].from === null ? null : `f${String(s.rests[0].from).padStart(5, "0")}`,
          rests: s.rests.map((r) => ({ still: r.still, from: r.from === null ? null : `f${String(r.from).padStart(5, "0")}` })),
        },
  ),
};
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + "\n");
const size = (dir) => fs.readdirSync(dir).reduce((n, f) => n + fs.statSync(path.join(dir, f)).size, 0) / 1e6;
console.log(`deck.json written; stills ${size(FRAMES).toFixed(1)} MB, clips ${size(CLIPS).toFixed(1)} MB`);
