# /// script
# requires-python = ">=3.11"
# dependencies = ["numpy", "scipy", "soundfile"]
# ///
"""Synthesise the film's small sound-effects kit into _film/public/sfx/ (48 kHz stereo WAV).

    uv run _film/scripts/sfx.py

Everything is generated from noise and sine partials, so there are no licensing questions.
The scenes place these with <Sfx> at the moment the picture moves; levels are set there.
"""
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
OUT = Path(__file__).resolve().parent.parent / "public" / "sfx"   # generated, not committed
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(11)


def t_(dur):
    return np.arange(int(dur * SR)) / SR


def bp(x, lo, hi, order=4):
    return sosfilt(butter(order, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f, order=4):
    return sosfilt(butter(order, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f, order=4):
    return sosfilt(butter(order, f, btype="high", fs=SR, output="sos"), x)


def reverb(x, dur=1.6, mix=0.25, damp=5000):
    """Stereo convolution with decorrelated, exponentially decaying noise."""
    n = int(dur * SR)
    tt = np.arange(n) / SR
    env = np.exp(-tt * 6.0 / dur)
    irs = [lp(rng.standard_normal(n), damp) * env for _ in range(2)]
    irs = [ir / np.sqrt((ir ** 2).sum()) for ir in irs]
    dry = x if x.ndim == 2 else np.stack([x, x], 1)
    wet = np.stack([fftconvolve(dry[:, c], irs[c])[: len(dry) + n] for c in range(2)], 1)
    out = np.zeros_like(wet)
    out[: len(dry)] += dry * (1 - mix)
    out += wet * mix
    return out


def pan(x, p):
    """p in [-1, 1], equal power; p may be an array."""
    a = (np.asarray(p) + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], 1)


def save(name, x, peak=0.8):
    x = x if x.ndim == 2 else np.stack([x, x], 1)
    fade = min(len(x), int(0.004 * SR))
    x[-fade:] *= np.linspace(1, 0, fade)[:, None]
    x = x / (np.abs(x).max() + 1e-9) * peak
    sf.write(OUT / f"{name}.wav", x.astype(np.float32), SR, subtype="PCM_16")
    print(f"  {name:12s} {len(x) / SR:5.2f} s")


# tick: a tiny glassy transient for words and grid cells
tt = t_(0.09)
tick = (np.sin(2 * np.pi * 3100 * tt) * 0.6 + np.sin(2 * np.pi * 5300 * tt) * 0.25) * np.exp(-tt * 70)
tick += hp(rng.standard_normal(len(tt)), 4000) * np.exp(-tt * 400) * 0.3
save("tick", reverb(tick, 0.5, 0.18), 0.6)

# soft ping: two sine partials with a slow decay, for map pins and arrivals
tt = t_(1.2)
ping = (np.sin(2 * np.pi * 1568 * tt) + 0.35 * np.sin(2 * np.pi * 2349 * tt) + 0.12 * np.sin(2 * np.pi * 3136 * tt)) * np.exp(-tt * 5.5)
ping *= np.minimum(1, tt / 0.003)
save("ping", reverb(ping, 1.4, 0.3), 0.55)

# thump: a felt low hit for the chapter cards
tt = t_(0.9)
f = 46 + 80 * np.exp(-tt * 18)
thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 6)
thump += lp(rng.standard_normal(len(tt)), 900) * np.exp(-tt * 60) * 0.5
save("thump", reverb(lp(thump, 2500), 0.8, 0.12), 0.9)

# whoosh: band-passed noise whose centre rises, panned left to right
dur = 0.75
tt = t_(dur)
noise = rng.standard_normal(len(tt))
env = np.sin(np.pi * np.clip(tt / dur, 0, 1)) ** 2.2
seg = np.zeros_like(noise)
for k, c in enumerate(np.geomspace(500, 5000, 12)):
    w = np.exp(-((tt / dur - k / 11) ** 2) / 0.02)
    seg += bp(noise, c * 0.7, c * 1.4, 2) * w
whoosh = pan(seg * env, np.linspace(-0.7, 0.7, len(tt)))
save("whoosh", reverb(whoosh, 0.9, 0.2), 0.7)

# swell: a 1.8 s rise that ends on the cue (place it 1.8 s early)
dur = 1.8
tt = t_(dur)
sw = sum(np.sin(2 * np.pi * f0 * tt + rng.uniform(0, 6)) for f0 in [220, 277.2, 329.6, 440, 659.3]) * 0.2
sw += bp(rng.standard_normal(len(tt)), 2000, 9000, 2) * 0.25
sw *= (tt / dur) ** 2.5
save("swell", reverb(sw, 1.2, 0.35), 0.6)

# data rain: a cloud of tiny ticks whose density follows the reveal (kilns, stations)
for name, dur, n in [("rain_long", 3.8, 1400), ("rain_short", 2.6, 520)]:
    tt = t_(dur + 0.6)
    x = np.zeros((len(tt), 2))
    times = np.sort(rng.uniform(0, dur, n) ** 0.85 * dur ** 0.15)
    g = t_(0.012)
    for s0 in times:
        f0 = rng.uniform(2500, 7500)
        grain = np.sin(2 * np.pi * f0 * g) * np.exp(-g * 500) * rng.uniform(0.3, 1)
        i = int(s0 * SR)
        x[i : i + len(g)] += pan(grain, rng.uniform(-0.8, 0.8))
    save(name, reverb(x, 0.7, 0.25), 0.95)

# typing: soft key clicks at the on-screen typing speed
for name, cps, dur in [("typing", 50, 1.0), ("typing_fast", 130, 0.5)]:
    tt = t_(dur + 0.2)
    x = np.zeros(len(tt))
    g = t_(0.02)
    for k in range(int(dur * cps)):
        i = int((k / cps + rng.normal(0, 0.003)) * SR)
        if i < 0:
            continue
        click = bp(rng.standard_normal(len(g)), 1800, 6000, 2) * np.exp(-g * 350) * rng.uniform(0.5, 1)
        x[i : i + len(g)] += click[: len(x) - i]
    save(name, reverb(x, 0.4, 0.12), 0.9)

# blip: a two-note answer chime
tt = t_(0.5)
b = np.sin(2 * np.pi * 1318.5 * tt) * (tt < 0.09) + np.sin(2 * np.pi * 1975.5 * tt) * (tt >= 0.09)
b *= np.exp(-(tt % 0.09 if False else tt) * 9) * np.minimum(1, tt / 0.002)
save("blip", reverb(b, 0.9, 0.3), 0.5)

# zip: a short downward sweep as an appliance separates from the meter's line
tt = t_(0.35)
f = 2600 * np.exp(-tt * 9) + 300
z = bp(rng.standard_normal(len(tt)), 300, 6000, 2) * 0.4 + np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.6
z *= np.sin(np.pi * tt / 0.35) ** 2
save("zip", reverb(z, 0.6, 0.2), 0.5)

# shimmer: a soft chime cluster for the logo and the end card
tt = t_(2.4)
sh = np.zeros(len(tt))
for k, f0 in enumerate([1046.5, 1318.5, 1568.0, 2093.0, 2637.0]):
    d = k * 0.06
    m = tt >= d
    sh[m] += np.sin(2 * np.pi * f0 * (tt[m] - d)) * np.exp(-(tt[m] - d) * 2.4) * (0.9 - k * 0.12)
save("shimmer", reverb(sh, 2.0, 0.45), 0.5)
print("->", OUT)
