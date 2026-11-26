# /// script
# dependencies = ["numpy", "soundfile"]
# ///
"""The December 2026 score: two Lyria movements made in the Gemini app, joined on a bar line.

    uv run _film/scripts/two_movements.py            # writes audio/score-two.mp3

audio/movement-1.mp3 ("Patterns Beneath the Surface", 2:20) and audio/movement-2.mp3 ("The Calculus of Breathing",
2:28) came out at exactly 124 BPM (onset autocorrelation) although the prompts asked for 120, so both are stretched
by 124/120 with Rubber Band (R3 engine, pitch kept), which gives the film more time and keeps src/timing.ts
(120 BPM, bar 0 at 0.08 s). Movement two's bar 0 (0.078 s into its stretched file) lands on film bar 70, where
movement one has decayed to below −45 dB. Its final hit (its bar 72, film bar 142, "Join us.") gets a wet reverb
tail so the end card is not left in silence. Needs ffmpeg, rubberband and sox.
"""
import subprocess, tempfile
from pathlib import Path
import numpy as np, soundfile as sf

A = Path(__file__).resolve().parent.parent / "audio"
SR, OFFSET, BAR = 48000, 0.08, 2.0
RATIO = 124 / 120
P2_BAR0 = 0.078                 # movement two's bar 0 after stretching
JOIN_BAR, END_BAR = 142, 148    # film bars: the final hit, the end of the last scene

def run(*a): subprocess.run(a, check=True)
with tempfile.TemporaryDirectory() as td:
    td = Path(td)
    st = []
    for i in (1, 2):
        run("ffmpeg", "-v", "error", "-y", "-i", str(A / f"movement-{i}.mp3"), "-ar", str(SR), "-c:a", "pcm_f32le", str(td / f"m{i}.wav"))
        run("rubberband", "-q", "--fine", "-t", f"{RATIO:.10f}", str(td / f"m{i}.wav"), str(td / f"m{i}s.wav"))
        st.append(sf.read(td / f"m{i}s.wav", dtype="float32")[0])
    m1, m2 = st
    # Movement one's bars 36–37 (film 1:12–1:16) carry a voice-like sound (heard by Nipun near 1:15; the bars' 6 kHz+
    # band is 3–5 dB above their neighbours'). Bars 44–45, the same place in the next eight-bar phrase (chroma match
    # 0.95 and 0.93), replace them, with 25 ms equal-power crossfades on both bar lines.
    bar1 = lambda k: int(round((OFFSET * RATIO + k * BAR) * SR))   # movement one's bar 0 is at 0.083 s after stretching
    x = int(0.025 * SR)
    a0, a1 = bar1(36) - x // 2, bar1(38) + x // 2
    s0 = bar1(44) - x // 2
    rep = m1[s0 : s0 + (a1 - a0)].copy()
    ramp = (np.sin(np.linspace(0, np.pi / 2, x)) ** 2)[:, None]
    rep[:x] = m1[a0 : a0 + x] * (1 - ramp) + rep[:x] * ramp
    rep[-x:] = rep[-x:] * (1 - ramp) + m1[a1 - x : a1] * ramp
    m1 = m1.copy()
    m1[a0:a1] = rep
    n = int((OFFSET + END_BAR * BAR + 1.5) * SR)
    y = np.zeros((n, 2), np.float32)
    y[: min(n, len(m1))] += m1[:n]
    s2 = int(round((OFFSET + 70 * BAR - P2_BAR0) * SR))
    y[s2 : s2 + len(m2)] += m2[: n - s2]
    # reverb tail on the final hit
    hit = OFFSET + JOIN_BAR * BAR
    a = int((hit - 0.05) * SR) - s2
    sf.write(td / "hit.wav", m2[a : a + int(4 * SR)], SR, subtype="FLOAT")
    run("sox", str(td / "hit.wav"), str(td / "tail.wav"), "reverb", "-w", "95", "40", "100", "100", "40", "0", "pad", "0", "12")
    tail = sf.read(td / "tail.wav", dtype="float32")[0] * 0.55
    b = int((hit - 0.05) * SR)
    k = min(len(tail), n - b)
    y[b : b + k] += tail[:k]
    sf.write(td / "score.wav", y, SR, subtype="FLOAT")
    run("ffmpeg", "-v", "error", "-y", "-i", str(td / "score.wav"), "-c:a", "libmp3lame", "-b:a", "256k", str(A / "score-two.mp3"))
print(f"score-two.mp3: {n / SR:.2f} s; movement two starts at {s2 / SR:.3f} s")
