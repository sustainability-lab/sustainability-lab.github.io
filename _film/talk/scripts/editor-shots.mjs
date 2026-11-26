// Screenshots of every slide as open-slide draws it (its /preview route, fully built), at 1920 × 1080, for
// comparing with the video. Needs the dev server (npm run talk) on port 5190.
//   node talk/scripts/editor-shots.mjs            → out/talk/editor/01.png …
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const FILM = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(FILM, "out/talk/editor");
const BASE = process.env.TALK_URL ?? "http://localhost:5190/s/lab-talk";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = Number(process.env.PORT ?? 9333);
// the preview route draws the slide at 92% of the window; this window makes that exactly 1920 × 1080
const VW = 2088, VH = 1174;
fs.mkdirSync(OUT, { recursive: true });

const profile = fs.mkdtempSync(path.join(FILM, "out/.chrome-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  await sleep(200);
  target = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json()).then((l) => l.find((t) => t.type === "page")).catch(() => undefined);
}
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const waiting = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && waiting.has(m.id)) (waiting.get(m.id))(m), waiting.delete(m.id);
});
const send = (method, params = {}) => new Promise((resolve) => { const i = ++id; waiting.set(i, resolve); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;

await send("Emulation.setDeviceMetricsOverride", { width: VW, height: VH, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: `${BASE}/preview?p=1` });
let total = 0;
for (let i = 0; i < 300 && !total; i++) { await sleep(200); total = Number(await evaluate(`document.querySelector('[data-osd-preview]')?.getAttribute('data-osd-preview-total') ?? 0`)); }
const FROM = Number(process.env.FROM ?? 1); // start at a later slide
for (let n = FROM; n <= total; n++) {
  await send("Page.navigate", { url: `${BASE}/preview?p=${n}` });
  let state = "";
  for (let i = 0; i < 300 && state !== "ready" && state !== "error"; i++) {
    await sleep(200);
    state = await evaluate(`(() => { const r = document.querySelector('[data-osd-preview]'); if (!r || r.getAttribute('data-osd-preview-page') !== '${n}') return ''; const imgs = [...document.images].every((i) => i.complete); return imgs ? r.getAttribute('data-osd-preview') : 'images'; })()`);
  }
  await sleep(300);
  // the whole window at 1:1; the slide is the 1920 × 1080 box in its middle (cropped when comparing)
  const shot = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: VW, height: VH, scale: 1 } });
  fs.writeFileSync(path.join(OUT, `${String(n).padStart(2, "0")}.png`), Buffer.from(shot.result.data, "base64"));
  console.log(n, state);
}
ws.close();
chrome.kill();
await sleep(500);
try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5 }); } catch {}
