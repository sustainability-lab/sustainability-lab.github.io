// The talk's video, end to end: render the slides, set the loudness, check the result, make the copies.
//
//   node talk/scripts/video.mjs              → out/talk/talk.mp4 (1080p) and talk-720p.mp4
//   node talk/scripts/video.mjs --4k         → out/talk/talk-4k.mp4 (the master for YouTube), talk.mp4, talk-720p.mp4
//   node talk/scripts/video.mjs --check FILE → only the checks, on a video already made
//   … --reuse   keep the picture already rendered at this size (out/talk/.picture-*.mp4) and redo only the sound
//
// The picture and the sound are rendered separately: the picture as H.264, the sound as lossless WAV. The sound
// is measured and corrected on the WAV, then encoded once as AAC and cut to the picture's exact length.
//
// Every run ends with out/talk/talk.report.json and a summary. It exits with an error, and keeps the
// unchecked file aside, if a check fails:
//   · picture and sound are as long as the talk (to a frame), and the sound has no dropouts
//     (no silence longer than 1 s, except where the score itself ends quietly, at the very end);
//   · loudness is YouTube's: −14 LUFS integrated (±1), true peak at or below −1 dBTP.
// The render itself stops on a missing score, a slide whose builds and times disagree, or a picture that
// will not load (src/Talk.tsx, src/talk/open-slide.tsx).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const FILM = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = path.join(FILM, "out/talk");
const LUFS = -14, PEAK = -1, SILENT_DB = -50, SILENT_S = 1.0;
// correct to 1 dB under the limit: encoding to AAC afterwards lifts true peaks by up to about 0.6 dB
const PEAK_TARGET = -2;
// how far the sound may run past the picture (AAC pads its last block)
const SYNC_S = 0.05;
const args = process.argv.slice(2);
const K4 = args.includes("--4k");
const REUSE = args.includes("--reuse");
fs.mkdirSync(OUT, { recursive: true });

const ffErr = (argv) => {
  try {
    execFileSync("ffmpeg", ["-hide_banner", "-nostdin", ...argv], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 1 << 26 });
    return "";
  } catch (e) {
    throw new Error(String(e.stderr).slice(-2000));
  }
};
const stderrOf = (argv) => {
  const r = execFileSync("bash", ["-c", `ffmpeg -hide_banner -nostdin ${argv.map((a) => `'${a.replace(/'/g, "'\\''")}'`).join(" ")} 2>&1 >/dev/null`], { encoding: "utf8", maxBuffer: 1 << 26 });
  return r;
};
const probe = (file, entries) => JSON.parse(execFileSync("ffprobe", ["-v", "error", "-print_format", "json", ...entries, file], { encoding: "utf8" }));
const duration = (file, stream) => {
  const p = probe(file, ["-show_entries", "stream=codec_type,duration,width,height,r_frame_rate:format=duration"]);
  const s = p.streams.find((x) => x.codec_type === stream);
  return s ? { seconds: Number(s.duration ?? p.format.duration), width: s.width, height: s.height, rate: s.r_frame_rate } : null;
};

/** Measured loudness of a file (EBU R128, ffmpeg's loudnorm in measure mode). */
const loudness = (file, tp = PEAK) => {
  const log = stderrOf(["-i", file, "-af", `loudnorm=I=${LUFS}:TP=${tp}:LRA=11:print_format=json`, "-f", "null", "-"]);
  const json = log.slice(log.lastIndexOf("{"), log.lastIndexOf("}") + 1);
  return JSON.parse(json);
};

/** Silent stretches longer than SILENT_S, in seconds. */
const silences = (file) => {
  const log = stderrOf(["-i", file, "-af", `silencedetect=noise=${SILENT_DB}dB:d=${SILENT_S}`, "-f", "null", "-"]);
  const out = [];
  let start = null;
  for (const line of log.split("\n")) {
    const a = line.match(/silence_start: ([\d.]+)/);
    const b = line.match(/silence_end: ([\d.]+)/);
    if (a) start = Number(a[1]);
    if (b && start !== null) (out.push([start, Number(b[1])]), (start = null));
  }
  if (start !== null) out.push([start, Infinity]);
  return out;
};

/** How long the score itself is quiet at its end (its final chord dies away): allowed at the end of the video. */
const scoreQuietEnd = () => {
  const film = JSON.parse(fs.readFileSync(path.join(FILM, "public/film.json"), "utf8"));
  const score = film.music ? path.join(FILM, "public", film.music) : null;
  if (!score || !fs.existsSync(score)) return 0;
  const len = duration(score, "audio")?.seconds ?? 0;
  const last = silences(score).filter(([, b]) => b === Infinity || b >= len - 0.05).pop();
  return last ? len - last[0] : 0;
};

function check(file, expectSeconds) {
  const v = duration(file, "video");
  const a = duration(file, "audio");
  const fps = v ? (([n, d]) => n / d)(v.rate.split("/").map(Number)) : 30;
  const frame = 1 / fps;
  const results = [];
  const ok = (name, pass, detail) => results.push({ name, pass, detail });
  ok("picture", !!v, v ? `${v.width}×${v.height}, ${v.seconds.toFixed(3)} s` : "no video stream");
  if (expectSeconds) ok("length", !!v && Math.abs(v.seconds - expectSeconds) <= 2 * frame, `${v?.seconds.toFixed(3)} s, talk is ${expectSeconds.toFixed(3)} s`);
  ok("sound", !!a, a ? `${a.seconds.toFixed(3)} s` : "no audio stream");
  if (v && a) ok("sound as long as picture", Math.abs(a.seconds - v.seconds) <= SYNC_S, `${(a.seconds - v.seconds).toFixed(3)} s apart`);
  if (a) {
    const L = loudness(file);
    const I = Number(L.input_i), TP = Number(L.input_tp);
    ok("loudness", Math.abs(I - LUFS) <= 1, `${I.toFixed(1)} LUFS (target ${LUFS})`);
    ok("true peak", TP <= PEAK + 0.1, `${TP.toFixed(1)} dBTP (limit ${PEAK})`);
    const allowed = scoreQuietEnd() + 2.5; // and the talk's own 2 s fade-out
    const end = v?.seconds ?? a.seconds;
    const gaps = silences(file).filter(([s]) => s < end - allowed);
    ok("no dropouts", gaps.length === 0, gaps.length ? gaps.map(([s, e]) => `silent ${s.toFixed(1)}–${Number.isFinite(e) ? e.toFixed(1) : "end"} s`).join("; ") : `quiet only in the last ${allowed.toFixed(1)} s, where the score ends`);
  }
  return results;
}

function report(file, results, extra = {}) {
  const failed = results.filter((r) => !r.pass);
  fs.writeFileSync(path.join(OUT, "talk.report.json"), JSON.stringify({ file: path.relative(FILM, file), when: new Date().toISOString(), ...extra, checks: results }, null, 2));
  for (const r of results) console.log(`${r.pass ? "  ok " : "FAIL "} ${r.name}: ${r.detail}`);
  return failed.length === 0;
}

// ---------------------------------------------------------------------------------------------------------- checks only
if (args.includes("--check")) {
  const file = path.resolve(args[args.indexOf("--check") + 1]);
  process.exit(report(file, check(file)) ? 0 : 1);
}

// ---------------------------------------------------------------------------------------------------------- render
const { bundle } = await import("@remotion/bundler");
const { renderMedia, selectComposition } = await import("@remotion/renderer");
const { talkWebpack } = await import("../webpack.mjs");

const serveUrl = await bundle({ entryPoint: path.join(FILM, "src/index.ts"), webpackOverride: talkWebpack(FILM) });
const inputProps = { music: true };
const talk = await selectComposition({ serveUrl, id: "Talk", inputProps });
const seconds = talk.durationInFrames / talk.fps;
console.log(`${talk.props.timeline.slides.length} slides, ${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}, rendering at ${K4 ? "3840×2160" : "1920×1080"}…`);
const picture = path.join(OUT, `.picture-${K4 ? "4k" : "1080p"}.mp4`);
const sound = path.join(OUT, ".sound.wav");
const progress = (label) => {
  let last = -1;
  return ({ progress: p }) => {
    const k = Math.floor(p * 10);
    if (k !== last) (last = k), console.log(`  ${label} ${k * 10}%`);
  };
};
if (REUSE && fs.existsSync(picture) && Math.abs((duration(picture, "video")?.seconds ?? 0) - seconds) <= 2 / talk.fps) {
  console.log(`  reusing ${path.relative(process.cwd(), picture)}`);
} else {
  await renderMedia({ composition: talk, serveUrl, codec: "h264", crf: 18, muted: true, scale: K4 ? 2 : 1, inputProps, outputLocation: picture, overwrite: true, onProgress: progress("picture") });
}
await renderMedia({ composition: talk, serveUrl, codec: "wav", inputProps, outputLocation: sound, overwrite: true, onProgress: progress("sound") });

// ---------------------------------------------------------------------------------------------------------- loudness
// Two passes of EBU R128 normalisation on the lossless sound: measure, then correct to −14 LUFS with true peaks
// under the limit (linearly when the music allows it). Then one AAC encode, cut to the picture's length, and
// the picture copied as rendered.
const m = loudness(sound, PEAK_TARGET);
const master = path.join(OUT, K4 ? "talk-4k.mp4" : "talk.mp4");
const pending = master.replace(/\.mp4$/, ".unchecked.mp4");
ffErr([
  "-y", "-i", picture, "-i", sound,
  "-map", "0:v:0", "-map", "1:a:0",
  "-af", `loudnorm=I=${LUFS}:TP=${PEAK_TARGET}:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true,aresample=48000`,
  "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-t", seconds.toFixed(3), "-movflags", "+faststart", pending,
]);

// ---------------------------------------------------------------------------------------------------------- checks
const results = check(pending, seconds);
const passed = report(pending, results, { slides: talk.props.timeline.slides.map((s) => s.id), loudnessBefore: { I: Number(m.input_i), TP: Number(m.input_tp) } });
if (!passed) {
  console.error(`Checks failed: the video is kept as ${path.relative(process.cwd(), pending)} and nothing else was made.`);
  process.exit(1);
}
fs.renameSync(pending, master);
fs.rmSync(picture, { force: true });
fs.rmSync(sound, { force: true });

// ---------------------------------------------------------------------------------------------------------- copies
if (K4) ffErr(["-y", "-i", master, "-vf", "scale=1920:1080:flags=lanczos", "-c:v", "libx264", "-crf", "18", "-preset", "slow", "-c:a", "copy", "-movflags", "+faststart", path.join(OUT, "talk.mp4")]);
ffErr(["-y", "-i", master, "-vf", "scale=1280:720:flags=lanczos", "-c:v", "libx264", "-crf", "26", "-preset", "medium", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", path.join(OUT, "talk-720p.mp4")]);
for (const f of [master, ...(K4 ? [path.join(OUT, "talk.mp4")] : []), path.join(OUT, "talk-720p.mp4")]) {
  console.log(`  ${path.relative(process.cwd(), f)}  ${(fs.statSync(f).size / 2 ** 20).toFixed(1)} MiB`);
}
