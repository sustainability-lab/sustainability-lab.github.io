// The lab film's timeline, read from its source, and the talk's cues resolved onto it.
// Used by deck.mjs. Reads _film/ and never writes there.

import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

export const FILM = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../_film");
const SRC = path.join(FILM, "src");
const read = (f) => fs.readFileSync(path.join(SRC, f), "utf8");

/** Scenes in film order with their frame spans and beat tables, exactly as Film.tsx lays them out. */
export function filmTimeline() {
  const timing = read("timing.ts");
  const BPM = Number(timing.match(/BPM = ([\d.]+)/)[1]);
  const OFFSET = Number(timing.match(/OFFSET = ([\d.]+)/)[1]);
  const BAR = (4 * 60) / BPM;
  const FPS = Number(read("theme.ts").match(/FPS = (\d+)/)[1]);
  const film = read("Film.tsx");
  const TAIL = Number(film.match(/FILM_FRAMES = .*\+ Math\.round\(([\d.]+) \* FPS\)/)[1]); // held after the last scene
  const scenes = [...film.matchAll(/\{\s*id:\s*"(\w+)",\s*bars:\s*(\d+),\s*C:\s*(\w+)\s*\}/g)].map((m) => ({
    id: m[1],
    bars: Number(m[2]),
    file: `scenes/${m[3]}.tsx`,
  }));
  const frameAt = (b) => Math.max(0, Math.round((OFFSET + b * BAR) * FPS));
  let bars = 0;
  for (const [i, s] of scenes.entries()) {
    s.from = frameAt(bars);
    bars += s.bars;
    s.to = frameAt(bars) + (i === scenes.length - 1 ? Math.round(TAIL * FPS) : 0); // exclusive
    const t = read(s.file).match(/const T = \{([^}]*)\}/);
    s.T = t ? Object.fromEntries([...t[1].matchAll(/(\w+):\s*([\d.]+)/g)].map((m) => [m[1], Number(m[2])])) : {};
  }
  return { FPS, frames: scenes.at(-1).to, scenes };
}

/** "air@st+3.95" → a frame on the film's timeline. */
export function resolveCue(cue, { FPS, scenes }) {
  const m = cue.match(/^(\w+)@(\w+|[\d.]+)\s*([+-]\s*[\d.]+)?$/);
  if (!m) throw new Error(`bad cue "${cue}"`);
  const s = scenes.find((x) => x.id === m[1]);
  if (!s) throw new Error(`cue "${cue}": no scene "${m[1]}" in Film.tsx`);
  const len = (s.to - s.from) / FPS;
  const base = /^[\d.]+$/.test(m[2]) ? Number(m[2]) : m[2] === "end" ? len : s.T[m[2]];
  if (base === undefined) throw new Error(`cue "${cue}": no beat "${m[2]}" in ${s.file} (it has ${Object.keys(s.T).join(", ")})`);
  const t = base + (m[3] ? Number(m[3].replace(/\s/g, "")) : 0);
  if (t < 0 || t > len) throw new Error(`cue "${cue}" = ${t.toFixed(2)} s is outside ${s.id} (0–${len} s)`);
  return Math.min(s.to - 1, s.from + Math.round(t * FPS));
}

const pad = (f) => `f${String(f).padStart(5, "0")}`;

/**
 * Slides with their rests. Each rest has a still (named by its film frame) and, except the very
 * first, a clip of the film from the previous rest (named by its two frames), so regrouping slides
 * or moving one cue only needs the changed segments rendered again.
 */
export function resolveDeck(deck, timeline) {
  const slides = [];
  let prev = null;
  for (const d of deck) {
    if (d.cover) {
      // one frame from anywhere in the film, outside the running order (the deck's title card)
      const frame = resolveCue(d.cover, timeline);
      slides.push({ id: d.id, title: d.title, pdf: d.pdf !== false, holds: true, rests: [{ cue: d.cover, frame, still: pad(frame), clip: null, from: null }] });
      continue;
    }
    if (d.from) prev = { cue: d.from, frame: resolveCue(d.from, timeline) }; // the opening segment starts here
    const rests = d.cues.map((cue) => {
      const frame = resolveCue(cue, timeline);
      if (prev && frame <= prev.frame) throw new Error(`cue ${cue} (slide ${d.id}) is not after ${prev.cue}`);
      const rest = { cue, frame, still: pad(frame), clip: prev ? `${pad(prev.frame)}-${pad(frame)}` : null, from: prev?.frame ?? null };
      prev = rest;
      return rest;
    });
    slides.push({ id: d.id, title: d.title, pdf: d.pdf !== false, holds: d.holds !== false, rests });
  }
  return slides;
}

/** A fingerprint of everything that decides what the film looks like, to know when renders are stale. */
export function filmHash() {
  const h = crypto.createHash("sha1");
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (!e.name.startsWith(".") && !/\.(mp3|wav)$/.test(e.name)) {
        h.update(path.relative(FILM, p));
        h.update(fs.readFileSync(p));
      }
    }
  };
  for (const d of ["src", "data", "public"]) walk(path.join(FILM, d));
  h.update(fs.readFileSync(path.join(FILM, "film.yml")));
  return h.digest("hex").slice(0, 16);
}
