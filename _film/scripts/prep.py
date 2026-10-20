# /// script
# requires-python = ">=3.11"
# dependencies = ["pyyaml", "pillow", "segno"]
# ///
"""Collect everything the film shows into _film/public/ (film.json + images + audio).

    uv run _film/scripts/prep.py            # run from anywhere

Reads _film/film.yml (the film's wording), _flyer/flyer.yml (funders, join, venue aliases) and the
site's data files, so a quarterly rebuild picks up new news, alumni and papers automatically.
"""
import datetime as dt
import html, json, re, shutil
from pathlib import Path

import segno
import yaml
from PIL import Image

FILM = Path(__file__).resolve().parent.parent
SITE = FILM.parent
PUB = FILM / "public"
DATA = FILM / "data"

cfg = yaml.safe_load((FILM / "film.yml").read_text())
flyer = yaml.safe_load((SITE / "_flyer/flyer.yml").read_text())
news = yaml.safe_load((SITE / "data/news.yml").read_text())
alumni = yaml.safe_load((SITE / "data/alumni.yml").read_text())
photos = yaml.safe_load((SITE / "data/photos.yml").read_text())
pubs = yaml.safe_load((SITE / "data/publications.yml").read_text())

for sub in ["img/photos", "img/papers", "img/ch", "img/funders", "img/faces", "img/geo", "audio"]:
    (PUB / sub).mkdir(parents=True, exist_ok=True)


def site_path(p):
    p = str(p)
    return SITE / p.lstrip("/") if p.startswith("/") else SITE / "_flyer" / p


def put(src, sub, max_w=2200, name=None):
    """Copy an image into public/<sub>/, downsizing big rasters. Returns the public path."""
    src = Path(src)
    name = name or src.name
    dst = PUB / sub / name
    if src.suffix.lower() in (".svg", ".webp", ".gif"):
        shutil.copyfile(src, dst)
    else:
        im = Image.open(src)
        if im.width > max_w:
            im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
        if dst.suffix.lower() in (".jpg", ".jpeg"):
            im.convert("RGB").save(dst, quality=90)
        else:
            im.save(dst)
    return f"{sub}/{name}"


def plain(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", str(s)))).strip()


# ---------- facts computed from the data layers ----------
stations = json.loads((DATA / "stations.json").read_text())
kilns = json.loads((DATA / "kilns.json").read_text())
signals = json.loads((DATA / "signals.json").read_text())
facts = {"stations": len(stations["pts"]), "cities": stations["cities"], "kilns": f"{kilns['n']:,}"}


def fill(s):
    return s.format(**facts) if isinstance(s, str) else s


chapters = []
for ch in cfg["chapters"]:
    beats = [{k: fill(v) for k, v in b.items()} for b in ch["beats"]]
    chapters.append({**ch, "beats": beats})

# ---------- this quarter ----------
today = dt.date.today()
cut = (today.year * 12 + today.month - 1) - cfg.get("quarter_months", 4)
MONTHS = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()
quarter = []
for item in news:
    y, m = (str(item["when"]).split("-") + ["1"])[:2]
    if int(y) * 12 + int(m) - 1 < cut:
        continue
    text = item.get("film") or plain(item["text"])
    text = re.split(r"(?<=[.!])\s", text)[0].rstrip("!.")
    quarter.append({"when": f"{MONTHS[int(m) - 1]} {y}", "type": item["type"], "text": text})
quarter = cfg.get("quarter_lines") or quarter[:4]

# ---------- selected-work wall: newest paper with a figure at each venue ----------
aliases = flyer["venue_aliases"]


def venue_short(v):
    for key, short in aliases:
        if key.lower() in v.lower():
            return short
    return None


wall = []
for venue in cfg["work"]["venues"]:
    cands = [p for p in pubs if venue_short(p.get("venue", "")) == venue and p.get("figure")
             and not re.search(r"Workshop|Demo Abstract|Thesis", p["title"] + p.get("venue", ""))]
    cands.sort(key=lambda p: -int(p["year"]))
    for p in cands[:2]:
        src = SITE / p["figure"].lstrip("/")
        if src.exists():
            short = p.get("short") or re.split(r"[:—]", p["title"])[0].strip()
            wall.append({"venue": venue, "year": p["year"], "title": short,
                         "figure": put(src, "img/papers", 1200, f"{p['year']}-{src.name}")})

# ---------- people ----------
by_src = {Path(p["src"]).name: p for p in photos}
life = []
for name in cfg["people"]["photos"]:
    meta = by_src.get(name, {})
    life.append({"src": put(SITE / "images/memories" / name, "img/photos", 2400), "caption": meta.get("caption", ""), "year": meta.get("year")})

phd = [a for a in alumni if a.get("group") == "PhD"]
counts = {g: sum(1 for a in alumni if a.get("group") == g) for g in flyer.get("alumni_counts", ["PhD", "MTech"])}
featured = []
for f in cfg["alumni"]["featured"]:
    a = next((x for x in phd if x["name"] == f["name"]), {})
    featured.append({"name": f["name"], "now": a.get("now", ""), "note": a.get("note", ""), "year": a.get("year"),
                     "photo": put(FILM / "assets/faces" / f["photo"], "img/faces", 600)})

# ---------- chapter images: site figures and photos, plus a few extracted assets ----------
CH = {
    "airdelhi": "papers/2023/airdelhi.png", "bus": "_film/assets/air/bus.jpg", "vayuchat": "papers/2025/vayuchat_demo.png",
    "gdmi": "papers/2026/gdmi.jpg", "policy": "papers/2024/Space_to_policy.png", "flowsat": "papers/2026/flowsat-samples.webp",
    "je_phone": "papers/2024/jouleseye.png", "je_bike": "_film/assets/health/je_bike.jpg", "je_thermal": "_film/assets/health/je_thermal.png",
    "spiromask": "papers/2023/spiromask-hero.png", "spiro_device": "images/mainpage/ContRespiration.png",
    "thermeval": "papers/2026/thermeval-portraits.webp", "apneaeye": "_flyer/assets/apneaeye.png",
    "nilmtk": "papers/2014/nilmtk-pipeline.png", "testoftime": "images/awards/nipun-test-time.jpg",
    "nilmbench_award": "images/awards/nilmbench-buildsys2026-runnerup.jpg", "nilmbench_fig": "papers/2026/nilmbench2026-fig1.png",
}
ch_img = {k: put(SITE / v, "img/ch", 2000, f"{k}{Path(v).suffix}") for k, v in CH.items() if (SITE / v).exists()}
missing = [k for k, v in CH.items() if not (SITE / v).exists()]
for tile in sorted((FILM / "assets/kilns").glob("*.jpg")):
    ch_img[f"tile_{tile.stem}"] = put(tile, "img/geo", 1200)
put(DATA / "pm-field.png", "img/geo", 4000)

# FlowSat: cut the paper's sample sheet (2 rows × 4 generated tiles, labels underneath) into single tiles
sheet = Image.open(SITE / "papers/2026/flowsat-samples.webp").convert("RGB")
for k, name in enumerate(["airport", "container port", "stadium", "surface mine", "solar farm", "farmland", "interchange", "dam"]):
    r, c = divmod(k, 4)
    tile = sheet.crop((c * 256, r * 290, c * 256 + 256, r * 290 + 256)).resize((640, 640), Image.LANCZOS)
    key = "flowsat_" + name.replace(" ", "_")
    tile.save(PUB / "img/ch" / f"{key}.jpg", quality=92)
    ch_img[key] = f"img/ch/{key}.jpg"

# SpiroMask: two clean crops of the paper's figure (participant with SpiroMask; the sensor inside an N95)
spiro = Image.open(SITE / "papers/2023/spiromask-hero.png").convert("RGB")
spiro.crop((618, 33, 1076, 410)).save(PUB / "img/ch/spiro_use.jpg", quality=92)
spiro.crop((62, 538, 282, 744)).resize((440, 412), Image.LANCZOS).save(PUB / "img/ch/spiro_mask.jpg", quality=92)
ch_img["spiro_use"], ch_img["spiro_mask"] = "img/ch/spiro_use.jpg", "img/ch/spiro_mask.jpg"

funders = [put(site_path(p), "img/funders", 600) for p in flyer["funder_logos"]]

# ---------- join + QR ----------
segno.make(cfg["join_url"], error="m").save(str(PUB / "img/qr-join.svg"), scale=10, border=0, dark="#222522", light=None)

# ---------- music ----------
score = FILM / "audio" / cfg["music"]
if score.exists():
    shutil.copyfile(score, PUB / "audio" / score.name)
    beats = FILM / "audio" / (score.stem + ".beats.json")
    if beats.exists():
        shutil.copyfile(beats, PUB / "audio" / beats.name)

film = {
    "built": today.isoformat(), "edition": cfg["edition"], "url": cfg["url"], "join_url": cfg["join_url"],
    "music": f"audio/{score.name}" if score.exists() else None,
    "hook": cfg["hook"], "tagline": cfg["tagline"], "place": cfg["place"], "chapters": chapters,
    "work": {**cfg["work"], "wall": wall, "quarter": quarter},
    "people": {"title": cfg["people"]["title"], "photos": life,
               "quote": next((q for q in yaml.safe_load((SITE / "data/quotes.yml").read_text()) if q["name"] == cfg["people"].get("quote")), None)},
    "alumni": {**{k: v for k, v in cfg["alumni"].items() if k != "featured"}, "featured": featured, "counts": counts},
    "join": {**flyer["join"], **cfg["join"], "email": flyer.get("email")},
    "funders": funders, "img": ch_img, "facts": facts,
    "dec2024": signals.get("dec2024_top", []),
}
(PUB / "film.json").write_text(json.dumps(film, indent=1, ensure_ascii=False))
print(f"film.json: {len(chapters)} chapters, {len(wall)} wall papers, {len(quarter)} quarter items, "
      f"{len(life)} photos, {len(funders)} funders; facts {facts}")
if missing:
    print("missing chapter images:", missing)
