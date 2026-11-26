import { bar } from "../timing";

// How the film's score is laid under the talk's video (src/Talk.tsx). Pure arithmetic, so it can be tested
// on its own: node talk/scripts/check.mjs.

/** One piece of the score under the talk: starts at talk frame `at`, plays the score from frame `from`, for `len` frames. */
export type ScorePart = { at: number; from: number; len: number };

/** Frames that consecutive pieces overlap, one fading out as the next fades in. */
export const crossfade = (fps: number) => Math.round(1.5 * fps);

/**
 * Where the score plays under a talk `talk` frames long, from a score `score` frames long. The score (two
 * movements, cut to the film) and the talk differ in length, so:
 *  · a talk no longer than the score plays it from the start and fades out with the talk;
 *  · a longer talk plays the score from its start to the breakdown under the film's venue wall (bar 119),
 *    fills the gap with movement two's piano (bars 70–119), repeated if the gap is long, and ends with the
 *    score's last part (from bar 124: the riser, the peak and the final chord), placed to end with the talk.
 * Every piece starts on a bar of the score, so each crossfade joins two phrases. The pieces cover the talk
 * from its first frame to its last, in order, and never run past the end of the score.
 */
export const scoreParts = (talk: number, score: number, fps: number): ScorePart[] => {
  if (talk <= 0 || score <= 0) return [];
  const f = (b: number) => Math.round(bar(b) * fps);
  if (talk <= score || score <= f(124)) return [{ at: 0, from: 0, len: Math.min(talk, score) }];
  const cut = f(119);
  const tail = score - f(124);
  if (talk <= cut + tail) return [{ at: 0, from: 0, len: talk - tail }, { at: talk - tail, from: score - tail, len: tail }];
  const parts: ScorePart[] = [{ at: 0, from: 0, len: cut }];
  const span = f(119) - f(70); // movement two's piano, before the build
  for (let at = cut; at < talk - tail; at += span) parts.push({ at, from: f(70), len: Math.min(span, talk - tail - at) });
  parts.push({ at: talk - tail, from: score - tail, len: tail });
  return parts;
};
