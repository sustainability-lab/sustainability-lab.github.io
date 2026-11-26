// Can every word be clicked in open-slide's editor? For each slide, fully built, this finds every element of
// the slide file that holds text and checks that a click on its middle lands on it (open-slide's editor picks
// the topmost element under the pointer). Words covered by a later build are listed separately: reach them by
// stepping to their build. Needs the dev server (npm run talk) on port 5190.
//   node talk/scripts/editable.mjs
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const FILM = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BASE = process.env.TALK_URL ?? "http://localhost:5190/s/lab-talk";
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9334;
fs.mkdirSync(path.join(FILM, "out"), { recursive: true });
const profile = fs.mkdtempSync(path.join(FILM, "out/.chrome-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
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
await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });

const CHECK = `(() => {
  const visible = (e) => { for (let x = e; x; x = x.parentElement) { const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden' || Number(s.opacity) < 0.05) return false; } return true; };
  const out = { ok: 0, hidden: [], covered: [] };
  for (const e of document.querySelectorAll('[data-slide-loc]')) {
    if (![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const text = e.textContent.trim().replace(/\\s+/g, ' ').slice(0, 48);
    const r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1 || !visible(e)) { out.hidden.push(text); continue; }
    const x = r.left + Math.min(r.width / 2, 12), y = r.top + r.height / 2;
    // like open-slide's editor, look only inside the slide (the preview route lays a clear overlay on top)
    const canvas = e.closest('[style*="width: 1920px"]');
    const top = document.elementsFromPoint(x, y).find((el) => el instanceof HTMLElement && canvas?.contains(el));
    if (top === e || e.contains(top)) out.ok += 1;
    else out.covered.push(text + '  ← under ' + (top ? top.tagName.toLowerCase() + (top.getAttribute('data-slide-loc') ? ' @' + top.getAttribute('data-slide-loc') : ' (kit)') : 'nothing'));
  }
  return out;
})()`;

await send("Page.navigate", { url: `${BASE}/preview?p=1` });
let total = 0;
for (let i = 0; i < 300 && !total; i++) { await sleep(200); total = Number(await evaluate(`document.querySelector('[data-osd-preview]')?.getAttribute('data-osd-preview-total') ?? 0`)); }
let ok = 0;
for (let n = 1; n <= total; n++) {
  await send("Page.navigate", { url: `${BASE}/preview?p=${n}` });
  let state = "";
  for (let i = 0; i < 300 && state !== "ready" && state !== "error"; i++) {
    await sleep(150);
    state = await evaluate(`(() => { const r = document.querySelector('[data-osd-preview]'); return r && r.getAttribute('data-osd-preview-page') === '${n}' ? r.getAttribute('data-osd-preview') : ''; })()`);
  }
  await sleep(200);
  const r = await evaluate(CHECK);
  ok += r.ok;
  console.log(`${String(n).padStart(2)}  ${r.ok} clickable` + (r.covered.length ? `, ${r.covered.length} covered` : "") + (r.hidden.length ? `, ${r.hidden.length} hidden when built` : ""));
  for (const c of r.covered) console.log(`      covered: ${c}`);
  for (const h of r.hidden) console.log(`      hidden:  ${h}`);
}
console.log(`${ok} text elements clickable in all`);
ws.close();
chrome.kill();
await sleep(500);
try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 5 }); } catch {}
