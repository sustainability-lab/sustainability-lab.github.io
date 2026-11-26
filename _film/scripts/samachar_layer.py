# /// script
# requires-python = ">=3.11"
# ///
"""Media beat: Delhi's weekly air-quality news coverage against weekly PM2.5, 2009–2021.

    uv run _film/scripts/samachar_layer.py

The two series are recovered from the vector paths of Figure 5 in Samachar (COMPASS 2022), the lab's paper on
the site at papers/2022/compass22-samachaar.pdf, page 6, so the film redraws the paper's own data. The axes are
calibrated from the figure's tick marks: 13 x-ticks for Nov 2009 … Nov 2021, articles 0/50/100 on the left,
PM2.5 0/200/400 µg/m³ on the right. Needs pdftocairo (poppler). Writes data/samachar.json.
"""
import json, re, subprocess, tempfile
from pathlib import Path

SITE = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent.parent / "data"

with tempfile.TemporaryDirectory() as td:
    svg = Path(td) / "p6.svg"
    subprocess.run(["pdftocairo", "-svg", "-f", "6", "-l", "6", str(SITE / "papers/2022/compass22-samachaar.pdf"), str(svg)], check=True)
    s = svg.read_text()

def points(d):
    return [(float(x), float(y)) for _, x, y in re.findall(r"([ML])\s*([-\d.]+)\s+([-\d.]+)", d)]

series, xt, yl, yr = {}, [], [], []
for attrs in re.findall(r"<path ([^>]*)/>", s):
    d = re.search(r' d="([^"]+)"', attrs)
    if not d:
        continue
    P = points(d.group(1))
    if len(P) > 400:  # the two weekly series: solid green = articles, dashed red = PM2.5
        series["pm25" if "dasharray" in attrs else "articles"] = P
    elif len(P) == 2:
        (x0, y0), (x1, y1) = P
        if abs(x0 - x1) < 0.01 and 3 < abs(y0 - y1) < 4:
            xt.append(x0)                      # x ticks below the axis
        elif abs(y0 - y1) < 0.01 and 3 < abs(x0 - x1) < 4:
            (yl if x1 < x0 else yr).append(y0)  # left ticks point left, right ticks point right

xt, yl, yr = sorted(set(xt)), sorted(yl), sorted(yr)
assert len(xt) == 13 and len(yl) == 3 and len(yr) == 3, (xt, yl, yr)
year = lambda x: 2009 + 10 / 12 + (x - xt[0]) / ((xt[-1] - xt[0]) / 12)   # Nov 2009 → Nov 2021
articles = lambda y: (y - yl[0]) / ((yl[-1] - yl[0]) / 100)
pm25 = lambda y: (y - yr[0]) / ((yr[-1] - yr[0]) / 400)

out = {
    "source": "Samachar (COMPASS 2022), Figure 5: weekly air-quality articles (TOI and The Hindu) and weekly mean PM2.5, Delhi",
    "articles": [[round(year(x), 4), round(max(0.0, articles(y)), 1)] for x, y in series["articles"]],
    "pm25": [[round(year(x), 4), round(max(0.0, pm25(y)), 1)] for x, y in series["pm25"]],
    "limit": 60,
}
(OUT / "samachar.json").write_text(json.dumps(out, separators=(",", ":")))
a = [v for _, v in out["articles"]]; p = [v for _, v in out["pm25"]]
print(f"  articles: {len(a)} weeks, max {max(a):.0f}; pm2.5: {len(p)} weeks, {min(p):.0f}–{max(p):.0f} µg/m³")
print(f"  years {out['articles'][0][0]:.2f} → {out['articles'][-1][0]:.2f}")
