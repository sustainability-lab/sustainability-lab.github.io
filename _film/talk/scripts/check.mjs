// Tests for how the score is laid under the talk (src/talk/score.ts), over talks from 1 s to 20 min:
// the pieces start at the talk's first frame, follow one another with no gap or overlap, end at its last
// frame, start on a bar, and never run past the end of the score.
//   node talk/scripts/check.mjs
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const FILM = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const out = await build({ entryPoints: [path.join(FILM, "src/talk/score.ts")], bundle: true, format: "esm", write: false, platform: "node" });
const { scoreParts, crossfade } = await import(`data:text/javascript;base64,${Buffer.from(out.outputFiles[0].text).toString("base64")}`);
const { bar } = await import(`data:text/javascript;base64,${Buffer.from((await build({ entryPoints: [path.join(FILM, "src/timing.ts")], bundle: true, format: "esm", write: false })).outputFiles[0].text).toString("base64")}`);

const FPS = 30;
const SCORE = Math.floor(297.0 * FPS); // the December 2026 score
const onBar = (f) => [0, 70, 119, 124].some((b) => f === Math.round(bar(b) * FPS)) || f === 0;
let failures = 0;
const fail = (talk, msg, parts) => (failures++, console.log(`FAIL ${(talk / FPS).toFixed(1)} s: ${msg}`, JSON.stringify(parts)));
for (let talk = FPS; talk <= 20 * 60 * FPS; talk += 7 * FPS + 11) {
  const parts = scoreParts(talk, SCORE, FPS);
  if (!parts.length) { fail(talk, "no music", parts); continue; }
  if (parts[0].at !== 0) fail(talk, "does not start at 0", parts);
  let at = 0;
  for (const p of parts) {
    if (p.at !== at) fail(talk, `gap or overlap at ${p.at}`, parts);
    if (p.len <= 0) fail(talk, "empty piece", parts);
    if (p.from + p.len > SCORE) fail(talk, "runs past the score", parts);
    if (!onBar(p.from) && p.from !== SCORE - p.len) fail(talk, `piece starts off a bar at ${p.from}`, parts);
    at = p.at + p.len;
  }
  if (at !== talk) fail(talk, `ends at ${at}, talk ends at ${talk}`, parts);
}
const now = scoreParts(10125, SCORE, FPS);
console.log("December talk (5:37.5):", now.map((p) => `${(p.at / FPS).toFixed(1)} s ← score ${(p.from / FPS).toFixed(1)} s for ${(p.len / FPS).toFixed(1)} s`).join("; "));
console.log(`crossfade ${crossfade(FPS)} frames; ${failures ? `${failures} failures` : "all talk lengths pass"}`);
process.exit(failures ? 1 : 0);
