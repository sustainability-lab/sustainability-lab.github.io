# /// script
# requires-python = ">=3.11"
# dependencies = ["librosa", "numpy", "matplotlib", "soundfile"]
# ///
"""Analyse a score: tempo, beat grid, loudness envelope and section changes.

    uv run _film/scripts/analyze_music.py score.mp3 [more.mp3 ...] [--png sheet.png] [--json beats.json]

Prints a summary per file, including "grid": the BPM and beat offset to put in src/timing.ts
(the first downbeat is the beat offset plus a whole number of beats; check it against the section
changes). --png draws spectrogram + loudness with the storyboard's section marks.
"""
import json, sys
from pathlib import Path

import librosa, librosa.display
import numpy as np

args = sys.argv[1:]
png = args[args.index("--png") + 1] if "--png" in args else None
out_json = args[args.index("--json") + 1] if "--json" in args else None
files = [a for a in args if a.endswith((".mp3", ".wav")) and a not in (png, out_json)]

MARKS = [16, 24, 44, 64, 84, 104, 120, 136, 144]   # storyboard section starts (s)
results = []
for f in files:
    y, sr = librosa.load(f, sr=22050, mono=True)
    dur = len(y) / sr
    onset = librosa.onset.onset_strength(y=y, sr=sr)
    tempo, beats = librosa.beat.beat_track(onset_envelope=onset, sr=sr, units="time", tightness=120)
    tempo = float(np.atleast_1d(tempo)[0])
    rms = librosa.feature.rms(y=y, frame_length=4096, hop_length=1024)[0]
    t_rms = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=1024)
    db = 20 * np.log10(np.maximum(rms, 1e-5))
    # section boundaries from a chroma+mfcc self-similarity novelty curve
    hop = 2048
    feat = np.vstack([librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop),
                      librosa.util.normalize(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13, hop_length=hop), axis=1)])
    bounds = librosa.segment.agglomerative(feat, 12)
    bt = librosa.frames_to_time(bounds, sr=sr, hop_length=hop)
    # beat grid: the tempo and phase that put the most strong onsets within 30 ms of a beat
    # (beat_track's own estimate is quantised and drifts; this is what the film is cut to)
    hop = 128
    env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    on_t = librosa.frames_to_time(np.arange(len(env)), sr=sr, hop_length=hop)
    pk = librosa.util.peak_pick(env, pre_max=10, post_max=10, pre_avg=30, post_avg=30, delta=0.6, wait=30)
    on, ow = on_t[pk], env[pk]
    strong = on[ow > np.percentile(ow, 70)]
    best = (0, 0, 0)
    for bpm in np.arange(round(tempo) - 4, round(tempo) + 4.001, 0.01):
        beat = 60 / bpm
        for off in np.arange(0, beat, 0.005):
            r = (strong - off) / beat
            score = np.mean(np.abs(r - np.round(r)) * beat < 0.03)
            if score > best[0]:
                best = (score, bpm, off)
    grid = {"bpm": round(float(best[1]), 3), "beat_offset": round(float(best[2]), 3), "fit": round(float(best[0]), 2)}
    # beat regularity
    ib = np.diff(beats)
    res = dict(file=Path(f).name, duration=round(dur, 2), tempo=round(tempo, 2), grid=grid,
               beat_period_median=round(float(np.median(ib)), 4), beat_period_std=round(float(np.std(ib)), 4),
               first_beat=round(float(beats[0]), 3), n_beats=len(beats),
               sections=[round(float(x), 1) for x in bt],
               loudness_by_8s=[round(float(np.mean(db[(t_rms >= a) & (t_rms < a + 8)])), 1) for a in range(0, int(dur), 8)])
    results.append(res)
    print(json.dumps(res))
    if out_json:
        Path(out_json).write_text(json.dumps({"file": Path(f).name, "duration": dur, "tempo": tempo, "grid": grid,
                                              "beats": [round(float(b), 4) for b in beats],
                                              "sections": [round(float(x), 2) for x in bt]}))

if png:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    fig, axes = plt.subplots(len(files), 1, figsize=(22, 3.6 * len(files)), squeeze=False)
    for ax, f, r in zip(axes[:, 0], files, results):
        y, sr = librosa.load(f, sr=22050, mono=True)
        S = librosa.amplitude_to_db(np.abs(librosa.stft(y, n_fft=2048, hop_length=512)), ref=np.max)
        librosa.display.specshow(S, sr=sr, hop_length=512, x_axis="time", y_axis="log", ax=ax, cmap="magma")
        for m in MARKS:
            ax.axvline(m, color="cyan", lw=1.2, alpha=.9)
        for s in r["sections"]:
            ax.axvline(s, color="white", lw=1, ls="--", alpha=.7)
        ax.set_title(f"{r['file']}  {r['duration']}s  {r['tempo']} BPM   cyan = storyboard, dashed = detected sections")
        ax.set_xticks(range(0, int(r["duration"]) + 1, 8))
    fig.tight_layout()
    fig.savefig(png, dpi=60)
