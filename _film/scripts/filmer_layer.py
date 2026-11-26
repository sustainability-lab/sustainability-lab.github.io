# /// script
# requires-python = ">=3.11"
# dependencies = ["numpy", "pillow", "shapely>=2"]
# ///
"""FiLMeR beat: WRF's 2 m temperature and FiLMeR's emulation of it, for one held-out field.

    uv run _film/scripts/filmer_layer.py        # source defaults to ~/git/filmer-wasm-webgpu

Source: filmer-wasm-webgpu/public/data/validation/heldout-d01-20250101T0600-{wrf-target,python-prediction}.f32
(6 × 99 × 99 little-endian float32: T2 K, U10, V10, Q2, PSFC, precipitation) on the d01 grid
(grid-d01-{latitude,longitude}.f32; Mercator, constant-latitude rows, row 0 at the south edge).
Writes data/filmer-{wrf,pred}-t2.png (both on one colour scale) and data/filmer.json (bounds, metrics, scale).
The error is recomputed here from the two arrays; nothing is copied from a paper table.
"""
import json, os
from pathlib import Path

import numpy as np
import shapely
from PIL import Image
from shapely.geometry import shape

SRC = Path(os.environ.get("SRC", Path.home() / "git")) / "filmer-wasm-webgpu" / "public" / "data"
OUT = Path(__file__).resolve().parent.parent / "data"
N = 99
STAMP = "2025-01-01 06:00 UTC"

def f32(name, shape=(N, N)):
    return np.fromfile(SRC / name, dtype="<f4").reshape(shape)

wrf = f32("validation/heldout-d01-20250101T0600-wrf-target.f32", (6, N, N))
pred = f32("validation/heldout-d01-20250101T0600-python-prediction.f32", (6, N, N))
lat, lon = f32("static/grid-d01-latitude.f32"), f32("static/grid-d01-longitude.f32")
t_wrf, t_pred = wrf[0] - 273.15, pred[0] - 273.15

india = shapely.union_all([shape(f["geometry"]) for f in json.loads((SRC / "india-outline-soi.geojson").read_text())["features"]]).buffer(0)
inside = shapely.contains_xy(india, lon.ravel(), lat.ravel()).reshape(N, N)

def metrics(mask):
    e = (t_pred - t_wrf)[mask]
    a, b = t_wrf[mask], t_pred[mask]
    return {"rmse": round(float(np.sqrt((e ** 2).mean())), 2), "mae": round(float(np.abs(e).mean()), 2),
            "corr": round(float(np.corrcoef(a, b)[0, 1]), 3), "within2": round(float((np.abs(e) <= 2).mean()), 3), "cells": int(mask.sum())}

whole, india_only = metrics(np.ones_like(inside)), metrics(inside)

# rows have constant latitude (Mercator spacing); resample each column onto even latitude steps
lats, lons = lat[:, 0], lon[0, :]
assert np.all(np.diff(lats) > 0) and np.allclose(lat, lats[:, None]) and np.allclose(lon, lons[None, :])
R = 4 * N
even = np.linspace(lats[0], lats[-1], R)
def regrid(f):
    cols = np.stack([np.interp(even, lats, f[:, j]) for j in range(N)], axis=1)  # R × N, south → north
    return cols[::-1]                                                             # image rows run north → south

# one cool-to-warm ramp in the film's paper and red, shared by both images
stops = [(-20, (52, 84, 122)), (-5, (110, 146, 176)), (8, (200, 214, 218)), (16, (243, 238, 226)),
         (24, (232, 190, 160)), (30, (204, 104, 80)), (35, (150, 32, 26))]
xs = np.array([s[0] for s in stops], float)
cs = np.array([s[1] for s in stops], float)
def paint(f):
    g = regrid(f)
    rgb = np.stack([np.interp(g, xs, cs[:, k]) for k in range(3)], axis=-1).astype(np.uint8)
    return Image.fromarray(rgb).resize((4 * N * 2, R * 2), Image.BICUBIC)

for name, f in (("wrf", t_wrf), ("pred", t_pred)):
    path = OUT / f"filmer-{name}-t2.png"
    paint(f).save(path, optimize=True)
    print(f"  {path.name:22s} {path.stat().st_size / 1024:7.0f} KB")

dlon, dlat = (lons[-1] - lons[0]) / (N - 1), (lats[-1] - lats[0]) / (R - 1)
summary = {
    "stamp": STAMP,
    "bounds": [round(float(lons[0] - dlon / 2), 3), round(float(lats[0] - dlat / 2), 3), round(float(lons[-1] + dlon / 2), 3), round(float(lats[-1] + dlat / 2), 3)],
    "domain": whole, "india": india_only,
    "range_c": [round(float(t_wrf[inside].min()), 1), round(float(t_wrf[inside].max()), 1)],
    "stops": [[v, "#%02x%02x%02x" % c] for v, c in stops],
}
(OUT / "filmer.json").write_text(json.dumps(summary, separators=(",", ":")))
print("  domain:", whole)
print("  india: ", india_only)
print("  t2 inside India (°C):", summary["range_c"])
