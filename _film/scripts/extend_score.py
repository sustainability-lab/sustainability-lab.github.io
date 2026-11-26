# /// script
# dependencies = ["numpy", "soundfile"]
# ///
"""Lengthen the score by repeating whole phrases at bar lines (120 BPM, bar 0 at 0.08 s).
Each repeat inserts bars [a, b] again right after bar b, with a short equal-power crossfade at both joints.

    uv run _film/scripts/extend_score.py _film/audio/score.mp3 /tmp/score-dec.wav
    ffmpeg -i /tmp/score-dec.wav -c:a libmp3lame -b:a 256k _film/audio/score-dec.mp3
"""
import subprocess, sys, numpy as np, soundfile as sf
src, out = sys.argv[1], sys.argv[2]
SR, B0, BAR, XF = 48000, 0.08, 2.0, 0.025
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
x = np.frombuffer(pcm, dtype=np.float32).reshape(-1, 2).copy()
t = lambda k: int(round((B0 + k * BAR) * SR))
# air, earth, health: phrases whose last beat matches the beat before their first (chroma ≥ 0.93, within 1 dB),
# so the joint b → a sounds like the original b → b+1
REPEATS = [(17, 20), (26, 29), (34, 37)]
# the playlist of [start, end) sample ranges
cuts, pos = [], 0
for a, b in REPEATS:
    cuts.append((pos, t(b + 1)))
    pos = t(a)
    cuts.append((pos, t(b + 1)))
    pos = t(b + 1)
cuts.append((pos, len(x)))
n = int(XF * SR)
fade_in = np.sin(np.linspace(0, np.pi / 2, n))[:, None] ** 2
fade_out = 1 - fade_in
y = x[cuts[0][0]:cuts[0][1] + n // 2].copy()
for s, e in cuts[1:]:
    seg = x[max(0, s - n // 2):e + n // 2]
    # overlap the last n samples of y with the first n of seg
    y[-n:] = y[-n:] * fade_out + seg[:n] * fade_in
    y = np.concatenate([y, seg[n:]])
sf.write(out, y, SR, subtype="PCM_24")
print(f"in {len(x)/SR:.2f}s → out {len(y)/SR:.2f}s (+{(len(y)-len(x))/SR:.2f}s = {(len(y)-len(x))/SR/BAR:.1f} bars)")
