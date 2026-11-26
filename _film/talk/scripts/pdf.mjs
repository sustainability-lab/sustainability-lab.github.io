// The talk as a PDF: one page per slide, each slide fully built, as vector pages (text stays text).
// Rendered from the same Talk composition as the video (the last frame of each slide), then joined.
//   node talk/scripts/pdf.mjs            → out/talk/lab-talk-december-2026.pdf
import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { talkWebpack } from "../webpack.mjs";

const FILM = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const PAGES = path.join(FILM, "out/talk/pdf");
const OUT = path.join(FILM, "out/talk/lab-talk-december-2026.pdf");
fs.rmSync(PAGES, { recursive: true, force: true });
fs.mkdirSync(PAGES, { recursive: true });

const serveUrl = await bundle({ entryPoint: path.join(FILM, "src/index.ts"), webpackOverride: talkWebpack(FILM) });
const browser = await openBrowser("chrome");
const inputProps = { music: false };
const talk = await selectComposition({ serveUrl, id: "Talk", inputProps, puppeteerInstance: browser });
const files = [];
for (const [i, s] of talk.props.timeline.slides.entries()) {
  const output = path.join(PAGES, `${String(i + 1).padStart(2, "0")}-${s.id}.pdf`);
  await renderStill({ composition: talk, serveUrl, frame: s.start + s.frames - 1, output, imageFormat: "pdf", inputProps, puppeteerInstance: browser, overwrite: true });
  files.push(output);
  console.log(`${i + 1}. ${s.id}`);
}
await browser.close({ silent: true });
execFileSync("uv", ["run", "--quiet", "--with", "pypdf", "python3", "-c", `
import sys
from pypdf import PdfWriter
w = PdfWriter()
for f in sys.argv[2:]:
    w.append(f)
w.write(sys.argv[1])
`, OUT, ...files], { stdio: "inherit" });
console.log(`${files.length} pages → ${path.relative(process.cwd(), OUT)}`);
