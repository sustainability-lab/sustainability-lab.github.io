# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy"]
# ///
"""Check that every cue lands on a pause in the film, not in the middle of an animation.

    uv run _talk/scripts/verify.py

For each clip in deck.json it measures how much the picture still changes over the clip's last
0.2 s. A cue with high motion stops the film mid-animation: move it in _talk/cues.mjs to just
before the next motion starts (slow push-ins on photos and the chapter progress bar show up as low
motion, which is fine).
"""

import json
import subprocess
from pathlib import Path

import numpy as np

ASSETS = Path(__file__).resolve().parent.parent / "slides" / "lab-talk" / "assets"
W, H = 192, 108
LIMIT = 0.5  # mean grey-level change per frame, 0–255; holds measure well below this


def tail_motion(clip: Path) -> float:
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-sseof", "-0.25", "-i", str(clip), "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"],
        capture_output=True,
        check=True,
    ).stdout
    frames = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)[-6:]
    return float(np.abs(np.diff(frames, axis=0)).mean()) if len(frames) > 1 else 0.0


deck = json.loads((ASSETS / "deck.json").read_text())
bad = 0
for slide in deck["slides"]:
    for rest in slide["rests"]:
        if not rest["clip"]:
            continue
        m = tail_motion(ASSETS / "clips" / f"{rest['clip']}.mp4")
        flag = m > LIMIT and slide.get("holds", True)
        bad += flag
        note = "   <- still moving: move this cue" if flag else ("   (moving shots, cut here by design)" if not slide.get("holds", True) else "")
        print(f"{slide['id']:12} {rest['still']}  motion {m:5.2f}{note}")
print(f"\n{bad} cue(s) land mid-animation" if bad else "\nevery cue lands on a pause")
