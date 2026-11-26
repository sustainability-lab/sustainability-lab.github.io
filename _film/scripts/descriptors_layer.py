# /// script
# requires-python = ">=3.11"
# ///
"""Signal Descriptors beat: one real 8-second window of wrist PPG and the descriptors computed on it.

    uv run _film/scripts/descriptors_layer.py

Source: the Signal Descriptors film's window (sustain-social/SignalDescriptorsFilm/data/window.json, made by its
scripts/window.py): PPG-DaLiA (Reiss et al., UCI ML Repository, CC BY 4.0), subject S5, sitting, 64 Hz, with the
chest-ECG heart rate for the same window. Descriptors were computed there with TSFEL 0.3.0. Writes data/ppg-window.json.
"""
import json, math, os
from pathlib import Path

SRC = Path(os.environ.get("SRC", Path.home() / "git")) / "sustain-social/SignalDescriptorsFilm/data/window.json"
OUT = Path(__file__).resolve().parent.parent / "data" / "ppg-window.json"

p = json.loads(SRC.read_text())["ppg"]
desc = {d["name"]: d["value"] for d in p["desc"]}
keep = [i for i, f in enumerate(p["spec_f"]) if f <= 5.0]
out = {
    "source": "PPG-DaLiA (CC BY 4.0), subject S5, sitting; descriptors with TSFEL 0.3.0",
    "fs": p["fs"], "hr_ecg": p["hr_ecg"],
    "x": [round(v, 2) for v in p["x"]],
    "mean": round(desc["mean"], 3), "sd": round(math.sqrt(desc["variance"]), 3),
    "crossings": p["zc"],
    "dominant_hz": desc["dominant frequency"],
    "spec_f": [round(p["spec_f"][i], 4) for i in keep], "spec": [round(p["spec"][i], 6) for i in keep],
}
OUT.write_text(json.dumps(out, separators=(",", ":")))
print(f"  {OUT.name}: {len(out['x'])} samples, mean {out['mean']}, sd {out['sd']}, "
      f"dominant {out['dominant_hz']} Hz = {out['dominant_hz'] * 60:.0f}/min (ECG {out['hr_ecg']})")
