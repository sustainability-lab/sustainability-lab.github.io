// Render a few frames of the Talk video, to check slides without rendering the whole thing.
//   node talk/scripts/stills.mjs --list             (where each slide sits in the video, in frames)
//   node talk/scripts/stills.mjs 160 470 920        (frames; writes out/talk/stills/f00160.png …)
//   node talk/scripts/stills.mjs --ids              (the last frame of every slide, named by slide id)
//   node talk/scripts/stills.mjs stations@0.5       (slide id @ seconds into that slide)
//   TALK_DECK=draft-earth node talk/scripts/stills.mjs --ids     (another deck; stills go to out/talk/stills/draft-earth)
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { talkWebpack } from "../webpack.mjs";

const FILM = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(FILM, "out/talk/stills", process.env.TALK_DECK ?? "");
fs.mkdirSync(OUT, { recursive: true });

const args = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.join(FILM, "src/index.ts"), webpackOverride: talkWebpack(FILM) });
const browser = await openBrowser("chrome");
const talk = await selectComposition({ serveUrl, id: "Talk", inputProps: { music: false }, puppeteerInstance: browser });
const { slides } = talk.props.timeline;
if (args.includes("--list")) {
  for (const s of slides) console.log(`${s.id.padEnd(14)} frames ${s.start}–${s.start + s.frames - 1}  builds at +${s.starts.map((f) => (f / 30).toFixed(1)).join(", +")} s`);
}
const jobs = args.includes("--ids")
  ? slides.map((s) => ({ frame: s.start + s.frames - 1, name: s.id }))
  : args
      .filter((a) => !a.startsWith("--"))
      .map((a) => {
        const [id, sec] = a.split("@");
        if (sec === undefined) return { frame: Number(a), name: `f${a.padStart(5, "0")}` };
        const s = slides.find((x) => x.id === id);
        if (!s) throw new Error(`no slide "${id}"`);
        return { frame: Math.min(s.start + s.frames - 1, s.start + Math.round(Number(sec) * 30)), name: `${id}@${sec}` };
      });
for (const { frame, name } of jobs) {
  const output = path.join(OUT, `${name}.png`);
  await renderStill({ composition: talk, serveUrl, frame, output, puppeteerInstance: browser, inputProps: { music: false } });
  const s = slides.find((x) => frame >= x.start && frame < x.start + x.frames);
  console.log(`${name}: frame ${frame} (${s?.id} +${((frame - (s?.start ?? 0)) / 30).toFixed(2)} s)`);
}
await browser.close({ silent: true });
console.log(`${talk.durationInFrames} frames in all; stills in ${path.relative(process.cwd(), OUT)}`);
