// The score sets the clock: audio/score.mp3 is exactly 120 BPM with bar 0 at 0.08 s
// (scripts/analyze_music.py → "grid"; checked against the piano phrases and every section change).
// Every scene starts on a downbeat.
export const BPM = 120;
export const OFFSET = 0.08; // seconds to bar 0
export const BEAT = 60 / BPM;
export const BAR = 4 * BEAT;

/** Time in seconds of bar `n` (0-based, fractional allowed). */
export const bar = (n: number) => OFFSET + n * BAR;
