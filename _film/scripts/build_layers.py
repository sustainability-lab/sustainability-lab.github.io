# /// script
# requires-python = ">=3.11"
# dependencies = ["numpy", "pandas", "shapely>=2", "global-land-mask", "scikit-learn", "pillow", "pyarrow"]
# ///
"""Build the film's data layers (maps, kilns, stations, signals) from the lab's own datasets.

These layers change rarely, so the output in _film/data/ is committed and the quarterly rebuild
does not need the source repositories. Re-run only to refresh a layer:

    uv run _film/scripts/build_layers.py            # sources default to ~/git

Sources (all lab data):
  india outline   filmer-wasm-webgpu/public/data/india-outline-soi.geojson   (Survey of India)
  stations        vayuchat-aqews/data/stations.csv + VayuChat/AQ_met_data.csv (CPCB CAAQMS)
  delhi pm2.5     vayuchat-ios/VayuChat/Resources/sample.csv                  (daily CPCB city means)
  kilns           emulator-pollution/static/data/kilns.json                   (SentinelKilnDB, 5 IGP states)
  power           nilmlite/data/iawe/building1.parquet                        (iAWE, a Delhi home, 2013)
"""
import json, math, os, sys
from pathlib import Path

import numpy as np
import pandas as pd
import shapely
from shapely.geometry import shape
from global_land_mask import globe

from PIL import Image

SRC = Path(os.environ.get("SRC", Path.home() / "git"))
OUT = Path(__file__).resolve().parent.parent / "data"
OUT.mkdir(exist_ok=True)


def dump(name, obj):
    path = OUT / name
    path.write_text(json.dumps(obj, separators=(",", ":")))
    print(f"  {name:22s} {path.stat().st_size / 1024:7.0f} KB")


# ---------- India (Survey of India outline) ----------
gj = json.loads((SRC / "filmer-wasm-webgpu/public/data/india-outline-soi.geojson").read_text())
india = shape(gj["features"][0]["geometry"]).buffer(0)
india_s = india.simplify(0.03, preserve_topology=True)
rings = []
for poly in getattr(india_s, "geoms", [india_s]):
    if poly.area < 0.02:          # drop tiny islets; keep Andaman & Nicobar / Lakshadweep groups
        continue
    rings.append([[round(x, 3), round(y, 3)] for x, y in poly.exterior.coords])
dump("india.json", {"bbox": [round(v, 2) for v in india.bounds], "rings": rings})

# ---------- globe dots: Fibonacci sphere, land only, India tagged ----------
N = 52000
i = np.arange(N) + 0.5
y = 1 - 2 * i / N
r = np.sqrt(1 - y * y)
th = math.pi * (3 - math.sqrt(5)) * i
lat = np.degrees(np.arcsin(y))
lon = np.degrees(np.arctan2(np.sin(th) * r, np.cos(th) * r))
land = globe.is_land(lat, lon)
lat, lon = lat[land], lon[land]
ind = shapely.contains_xy(india, lon, lat)
dump("globe-dots.json", [[round(a, 2), round(b, 2), int(c)] for a, b, c in zip(lat, lon, ind)])

# ---------- flat world dots: hex lattice in Equal Earth space (same formulas as d3.geoEqualEarth) ----------
A1, A2, A3, A4, M = 1.340264, -0.081106, 0.000893, 0.003796, math.sqrt(3) / 2


def ee_forward(lam, phi):
    l = np.arcsin(M * np.sin(phi)); l2 = l * l; l6 = l2 ** 3
    return (lam * np.cos(l) / (M * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2))),
            l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2)))


def ee_inverse(x, y):
    l = y.copy()
    for _ in range(12):
        l2 = l * l; l6 = l2 ** 3
        l -= (l * (A1 + A2 * l2 + l6 * (A3 + A4 * l2)) - y) / (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2))
    l2 = l * l; l6 = l2 ** 3
    lam = M * x * (A1 + 3 * A2 * l2 + l6 * (7 * A3 + 9 * A4 * l2)) / np.cos(l)
    return np.degrees(lam), np.degrees(np.arcsin(np.clip(np.sin(l) / M, -1, 1)))


xmax = float(ee_forward(np.pi, 0.0)[0])
ymax = float(ee_forward(0.0, np.pi / 2)[1])
step = 2 * xmax / 230
pts = []
for row, yy in enumerate(np.arange(-ymax, ymax, step * math.sqrt(3) / 2)):
    xs = np.arange(-xmax + (step / 2 if row % 2 else 0), xmax, step)
    lo, la = ee_inverse(xs, np.full_like(xs, yy))
    ok = np.isfinite(lo) & np.isfinite(la) & (np.abs(lo) <= 180)
    lo, la = lo[ok], la[ok]
    m = globe.is_land(la, lo) & (la > -58)
    pts += [[round(a, 2), round(b, 2)] for a, b in zip(la[m], lo[m])]
dump("world-dots.json", pts)

# ---------- CPCB stations ----------
st = pd.read_csv(SRC / "vayuchat-aqews/data/stations.csv")
aq = pd.read_csv(SRC / "VayuChat/AQ_met_data.csv", usecols=["Timestamp", "site_id", "PM2.5 (µg/m³)"])
aq25 = pd.read_csv(SRC / "vayuchat-aqews/data/AQ_met_data_2025.csv", usecols=["Timestamp", "site_id", "PM2.5 (µg/m³)"])
aq = pd.concat([aq, aq25]).dropna(subset=["PM2.5 (µg/m³)"])
aq["Timestamp"] = pd.to_datetime(aq["Timestamp"])
first = aq.groupby("site_id")["Timestamp"].min().dt.year
mean24 = aq[aq["Timestamp"].dt.year == 2024].groupby("site_id")["PM2.5 (µg/m³)"].mean()
st["first"] = st["site_id"].map(first)
st["pm"] = st["site_id"].map(mean24)
st = st.dropna(subset=["latitude", "longitude"])
stations = [[round(a, 3), round(b, 3), int(f) if f == f else 2025, round(p, 1) if p == p else None]
            for a, b, f, p in zip(st.latitude, st.longitude, st["first"], st["pm"])]
print("  stations by first year:", st["first"].value_counts().sort_index().to_dict())
dump("stations.json", {"cities": int(st.city.nunique()), "states": int(st.state.nunique()), "pts": stations})

# ---------- "fill the gaps": GP over 2024 station means, plus greedy max-variance sites ----------
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, WhiteKernel, ConstantKernel

g = st.dropna(subset=["pm"])
X = np.c_[g.longitude, g.latitude]
yv = np.log(g.pm.values)
# fixed, smooth kernel: a readable regional field rather than a station-by-station fit
gp = GaussianProcessRegressor(ConstantKernel(0.6, "fixed") * RBF(3.2, "fixed") + WhiteKernel(0.12, "fixed"),
                              normalize_y=True, optimizer=None, random_state=0)
gp.fit(X, yv)
print("  gp kernel:", gp.kernel_)
x0, y0, x1, y1 = 67.5, 6.0, 98.0, 37.5
res = 0.1
gx = np.arange(x0, x1, res) + res / 2
gy = np.arange(y1, y0, -res) - res / 2
GX, GY = np.meshgrid(gx, gy)
inside = shapely.contains_xy(india, GX.ravel(), GY.ravel())
pm = np.exp(gp.predict(np.c_[GX.ravel(), GY.ravel()])).reshape(GX.shape)   # unmasked; the film clips it to the outline

stops = [(0, (243, 238, 226)), (30, (240, 226, 206)), (48, (232, 190, 160)), (64, (218, 132, 104)),
         (82, (190, 66, 50)), (100, (150, 32, 26)), (140, (96, 18, 16))]
def colour(v):
    for (a, ca), (b, cb) in zip(stops, stops[1:]):
        if v <= b:
            t = max(0.0, (v - a) / (b - a))
            return [round(ca[k] + (cb[k] - ca[k]) * t) for k in range(3)]
    return list(stops[-1][1])
img = np.zeros((*pm.shape, 3), dtype=np.uint8)
for (yy, xx), v in np.ndenumerate(pm):
    img[yy, xx] = colour(v)
Image.fromarray(img).resize((img.shape[1] * 4, img.shape[0] * 4), Image.BICUBIC).save(OUT / "pm-field.png", optimize=True)
print("  field percentiles inside India (5/50/95):", np.percentile(pm.ravel()[inside], [5, 50, 95]).round(1))
print(f"  pm-field.png           {(OUT / 'pm-field.png').stat().st_size / 1024:7.0f} KB")

# greedy placement that maximises the drop in total posterior variance over India (close to the
# mutual-information criterion of the AAAI 2026 paper; max-variance alone just picks the borders)
allpts = np.c_[GX.ravel()[inside], GY.ravel()[inside]]
allpts = allpts[(allpts[:, 1] <= 31.5) & (allpts[:, 0] <= 93) & (allpts[:, 0] >= 70.5)]   # mainland, where people live
targets = allpts[::9]
cand = allpts[::23]
chosen, Xc = [], X.copy()
k = gp.kernel_.k1                      # signal part only; noise does not shrink with new sites
for _ in range(8):
    Kinv = np.linalg.inv(k(Xc, Xc) + 1e-3 * np.eye(len(Xc)))
    kTX, kCX = k(targets, Xc), k(cand, Xc)
    cov = k(targets, cand) - kTX @ Kinv @ kCX.T                 # posterior cov(target, cand)
    var_c = k.diag(cand) - np.einsum("ij,jk,ik->i", kCX, Kinv, kCX)
    gain = (cov ** 2).sum(0) / np.maximum(var_c, 1e-6)
    j = int(np.argmax(gain))
    chosen.append([round(cand[j, 1], 2), round(cand[j, 0], 2)])
    Xc = np.vstack([Xc, cand[j]])
dump("pm-field.json", {"bounds": [x0, y0, x1, y1], "year": 2024, "next_sites": chosen,
                       "max": round(float(pm.ravel()[inside].max()), 1), "min": round(float(pm.ravel()[inside].min()), 1),
                       "stops": [[v, "#%02x%02x%02x" % c] for v, c in stops]})

# ---------- kilns (SentinelKilnDB, five Indo-Gangetic states) ----------
kj = json.loads((SRC / "emulator-pollution/static/data/kilns.json").read_text())
kp = np.array([[p[0], p[1], p[2]] for p in kj["points"]])
rng = np.random.default_rng(7)
order = np.argsort(kp[:, 1] + rng.normal(0, 0.6, len(kp)))     # a west-to-east sweep, softened
kp = kp[order]
dump("kilns.json", {"classes": kj["classes"], "n": len(kp),
                    "pts": [[round(a, 3), round(b, 3), int(c)] for a, b, c in kp]})

# ---------- signals for the red line ----------
sig = {}
d = pd.read_csv(SRC / "vayuchat-ios/VayuChat/Resources/sample.csv", usecols=["date", "city", "pm25"])
d = d[d.city == "Delhi"].set_index("date").sort_index()
s = d.pm25.interpolate().rolling(7, center=True, min_periods=1).mean()
pk = d.pm25.idxmax()
print(f"  delhi: {len(d)} days, {d.index[0]}..{d.index[-1]}, peak {d.pm25.max():.0f} on {pk}")
sig["delhi_pm25"] = {"start": d.index[0], "end": d.index[-1], "values": [round(v, 1) for v in s.values]}

dec = aq[(aq.Timestamp.dt.year == 2024) & (aq.Timestamp.dt.month == 12)].merge(st[["site_id", "city"]], on="site_id")
rank = dec.groupby("city")["PM2.5 (µg/m³)"].agg(["mean", "count"])
rank = rank[rank["count"] >= 20].sort_values("mean", ascending=False).head(6)
sig["dec2024_top"] = [[c, round(v, 1)] for c, v in rank["mean"].items()]
print("  dec 2024 worst cities:", sig["dec2024_top"][:3])

day_str = "2013-07-28"                                  # AC, fridge, washing machine, TV and computer all run
pw = pd.read_parquet(SRC / "nilmlite/data/iawe/building1.parquet").set_index("timestamp").loc[day_str]
pw = pw.resample("60s").mean().interpolate(limit=30).fillna(0)
sig["iawe"] = {"date": day_str, "period_s": 60,
               **{k: [int(round(v)) for v in pw[k].values]
                  for k in ["mains", "air_conditioner", "fridge", "washing_machine", "television", "computer"]}}

hist, edges = np.histogram(kp[:, 1], bins=np.arange(73.5, 90.5, 0.1))
sig["kiln_profile"] = {"lon0": 73.5, "step": 0.1, "counts": hist.tolist()}
dump("signals.json", sig)
print("done ->", OUT)

# ---------- Sentinel-2 kiln tiles with their oriented boxes (SentinelKilnDB paper figures) ----------
import re, subprocess, tempfile
tiles = []
assets = OUT.parent / "assets" / "kilns"
assets.mkdir(parents=True, exist_ok=True)
for name in ["25.8467_80.6397", "27.7644_77.7249", "32.2541_74.1851", "23.6261_89.8530"]:
    pdf = SRC / f"sentinelkilndb/figures/{name}_obb.pdf"
    with tempfile.TemporaryDirectory() as td:
        subprocess.run(["pdfimages", "-png", str(pdf), f"{td}/img"], check=True)
        subprocess.run(["pdftocairo", "-svg", str(pdf), f"{td}/f.svg"], check=True)
        Image.open(f"{td}/img-000.png").convert("RGB").resize((960, 960), Image.LANCZOS).save(assets / f"{name}.jpg", quality=88)
        svg = Path(f"{td}/f.svg").read_text()
    side = float(re.search(r'viewBox="0 0 ([\d.]+)', svg).group(1))
    boxes = []
    for m in re.finditer(r'<path fill="none"[^>]*stroke="(rgb\([^)]*\))"[^>]*d="([^"]+)"[^>]*transform="matrix\(([^)]*)\)"', svg):
        nums = [float(v) for v in re.findall(r"-?[\d.]+", m.group(2))]
        a, _, _, d_, e, f = [float(v) for v in m.group(3).split(",")]
        pts = list(zip(nums[0::2], nums[1::2]))[:4]
        if len(pts) == 4:
            boxes.append([round(c, 4) for x, y in pts for c in ((a * x + e) / side, (d_ * y + f) / side)])
    lat_, lon_ = map(float, name.split("_"))
    tiles.append({"name": name, "lat": lat_, "lon": lon_, "boxes": boxes})
    print(f"  kiln tile {name}: {len(boxes)} boxes")
dump("kiln-tiles.json", tiles)
