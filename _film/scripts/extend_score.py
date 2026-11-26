# /// script
# dependencies = ["numpy", "soundfile", "librosa"]
# ///
"""Lengthen the score by replaying whole phrases at bar lines (120 BPM, bar 0 at 0.08 s).

    uv run _film/scripts/extend_score.py _film/audio/score.mp3 /tmp/score-long.wav
    ffmpeg -i /tmp/score-long.wav -c:a libmp3lame -b:a 256k _film/audio/score-long.mp3

The new score is a playlist of the original bars. Wherever it jumps (bar b followed by bar a ≠ b+1), the joint is
crossfaded over 25 ms, and it was chosen where the end of bar b matches the end of bar a−1 in harmony, timbre and
loudness, so the jump sounds like the original b → b+1. The script prints each joint's match (1 = identical).
"""
import subprocess, sys
import numpy as np, soundfile as sf, librosa

SR, B0, BAR, XF = 48000, 0.08, 2.0, 0.025
r = lambda a, b: list(range(a, b + 1))

# film sections (original bar numbers); the comments give each section's length in the new score
PLAYLIST = (
    r(0, 7)                                                                                  # hook       8
    + r(8, 11)                                                                               # place      4
    + r(12, 14) + r(13, 14) * 4 + r(15, 20) + r(17, 20) * 2 + r(17, 19) + r(18, 21)          # air       32
    + r(22, 29) + r(26, 29) + r(26, 30) + r(25, 30) + r(27, 30) + r(29, 31)                  # earth     30
    + r(32, 37) + r(34, 37) + r(34, 37) + r(34, 40) + r(33, 41)                              # health    30
    + r(42, 55)                                                                              # energy    14 (build into the climax)
    + r(56, 63) + r(56, 63)                                                                  # work      16
    + r(64, 67) + r(60, 63)                                                                  # people     8
    + r(64, 67) + r(60, 67)                                                                  # alumni    12
    + r(68, 74)                                                                              # join       7, then the fade
)

src, out = sys.argv[1], sys.argv[2]
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", src, "-f", "f32le", "-ac", "2", "-ar", str(SR), "-"], capture_output=True, check=True).stdout
x = np.frombuffer(pcm, dtype=np.float32).reshape(-1, 2).copy()
t = lambda k: int(round((B0 + k * BAR) * SR))
last = int((len(x) / SR - B0) // BAR)  # final (partial) bar index

# contiguous runs of the playlist → sample ranges; the first run keeps the 0.08 s lead-in, the last runs to the end of the file
runs, start = [], PLAYLIST[0]
for prev, cur in zip(PLAYLIST, PLAYLIST[1:] + [None]):
    if cur != prev + 1:
        runs.append((start, prev))
        start = cur
ranges = [(0 if a == 0 else t(a), len(x) if b == last else t(b + 1)) for a, b in runs]

# joint quality, as in the analysis that chose the loops
y_, sr_ = librosa.load(src, sr=22050, mono=True)
hop = 512
C = librosa.feature.chroma_cqt(y=y_, sr=sr_, hop_length=hop)
M = librosa.feature.mfcc(y=y_, sr=sr_, hop_length=hop, n_mfcc=13)
R = librosa.feature.rms(y=y_, hop_length=hop)[0]
tt = librosa.frames_to_time(np.arange(C.shape[1]), sr=sr_, hop_length=hop)
def tail(k):
    m = (tt >= B0 + (k + 1) * BAR - 0.5) & (tt < B0 + (k + 1) * BAR)
    c = C[:, m].mean(1); c /= np.linalg.norm(c) + 1e-9
    return c, M[:, m].mean(1), 20 * np.log10(R[m].mean() + 1e-9)
for (a0, b0), (a1, b1) in zip(runs, runs[1:]):
    c1, m1, r1 = tail(b0); c0, m0, r0 = tail(a1 - 1)
    print(f"  joint bar {b0} → {a1}: harmony {float(c1 @ c0):.2f}, timbre distance {np.linalg.norm(m1 - m0):5.1f}, loudness {abs(r1 - r0):.1f} dB")

n = int(XF * SR)
fade_in = np.sin(np.linspace(0, np.pi / 2, n))[:, None] ** 2
fade_out = 1 - fade_in
s0, e0 = ranges[0]
y = x[s0:e0 + n // 2].copy()
for s, e in ranges[1:]:
    seg = x[max(0, s - n // 2):e + (n // 2 if e < len(x) else 0)]
    y[-n:] = y[-n:] * fade_out + seg[:n] * fade_in
    y = np.concatenate([y, seg[n:]])
sf.write(out, y, SR, subtype="PCM_24")
print(f"{len(PLAYLIST)} bars: {len(x) / SR:.2f} s → {len(y) / SR:.2f} s")
