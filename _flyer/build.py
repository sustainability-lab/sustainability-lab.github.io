#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["pyyaml", "jinja2", "playwright", "segno", "pillow"]
# ///
"""Build the two-page A3 lab flyer from the site's data files.

    uv run _flyer/build.py                     # build the chosen design into _flyer/build/<design>/
    uv run _flyer/build.py --all               # build every design + build/gallery.html to compare them
    uv run _flyer/build.py --variant night     # build one design
    uv run _flyer/build.py --publish           # build the chosen design and copy it to /flyer.pdf

Content: _flyer/flyer.yml (what to show) + data/*.yml (the facts).
Layout:  _flyer/template.html + _flyer/flyer.css (the Swiss base design),
         optionally restyled by one of _flyer/variants/<name>.css.
The build fails on unknown papers, missing images, overlong text, or anything
that overflows its box, so a bad edit never ships a broken PDF.
"""
from __future__ import annotations

import argparse
import html
import re
import shutil
import sys
from collections import Counter
from pathlib import Path

import segno
import yaml
from jinja2 import Environment, FileSystemLoader, StrictUndefined
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
BUILD = HERE / "build"
CACHE = BUILD / "img"
MAX_PX = 1400  # longest side for embedded rasters; >300 dpi at tile size
BLURB_MAX, NAME_MAX = 95, 28

errors: list[str] = []


def fail(msg: str) -> None:
    errors.append(msg)


def load(path: Path):
    try:
        with open(path, encoding="utf-8") as f:
            return yaml.safe_load(f)
    except yaml.YAMLError as e:
        mark = getattr(e, "problem_mark", None)
        where = f" line {mark.line + 1}" if mark else ""
        sys.exit(f"{path.relative_to(ROOT)}{where}: not valid YAML ({getattr(e, 'problem', e)}). "
                 "Text containing ': ' must be wrapped in quotes.")


# ---------- images ----------

def resolve_image(ref: str, where: str) -> str:
    """'/x/y.png' is relative to the site root, 'assets/...' to _flyer/. Returns a file URI."""
    src = ROOT / ref.lstrip("/") if ref.startswith("/") else HERE / ref
    if not src.is_file():
        fail(f"{where}: image not found: {ref}")
        return ""
    if src.suffix.lower() == ".svg":
        return src.as_uri()
    CACHE.mkdir(parents=True, exist_ok=True)
    # Every image is drawn with mix-blend-mode: multiply, so white == transparent:
    # flatten onto white and store as JPEG to keep the PDF small.
    out = CACHE / (re.sub(r"[^\w.-]", "_", ref.strip("/")) + ".jpg")
    if not out.exists() or out.stat().st_mtime < src.stat().st_mtime:
        with Image.open(src) as im:
            im = im.convert("RGBA")
            im.thumbnail((MAX_PX, MAX_PX))
            flat = Image.new("RGB", im.size, "white")
            flat.paste(im, mask=im.getchannel("A"))
            flat.save(out, quality=88, optimize=True)
    return out.as_uri()


def qr_svg(url: str) -> str:
    svg = segno.make(url, error="m").svg_inline(scale=1, border=0, dark="#222522", omitsize=True)
    return svg.replace("<svg ", '<svg class="qr" preserveAspectRatio="xMidYMid meet" ', 1)


# ---------- data ----------

def short_venue(venue: str, aliases) -> str:
    for needle, label in aliases:
        if needle.lower() in venue.lower():
            return label
    return re.split(r"[,(]", venue)[0].strip()[:24]


def strip_tags(s: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", s))


def find_paper(pubs, needle: str, where: str):
    hits = [p for p in pubs if needle.lower() in p["title"].lower()]
    if len(hits) != 1:
        fail(f"{where}: paper '{needle}' matches {len(hits)} publications in data/publications.yml (need exactly 1)")
        return None
    return hits[0]


def build_context(cfg, pubs, alumni):
    aliases = cfg["venue_aliases"]
    themes, tiles_all = [], []
    for t_i, theme in enumerate(cfg["themes"], 1):
        tiles = []
        for p_i, proj in enumerate(theme["projects"], 1):
            where = f"themes[{theme['key']}].projects[{p_i}]"
            tile = {"badge": proj.get("badge", ""), "blurb": proj.get("blurb", "")}
            if "paper" in proj:
                pub = find_paper(pubs, proj["paper"], where)
                if pub is None:
                    continue
                tile["name"] = proj.get("name") or pub["title"].split(":")[0].strip()
                tile["venue"] = proj.get("venue") or f"{short_venue(pub['venue'], aliases)} {pub['year']}"
                tile["badge"] = tile["badge"] or pub.get("award", "")
                tiles_all.append(pub)
                img = proj.get("image") or pub.get("figure")
            else:
                for k in ("name", "venue", "image"):
                    if k not in proj:
                        fail(f"{where}: a project without 'paper' needs '{k}'")
                tile["name"], tile["venue"] = proj.get("name", "?"), proj.get("venue", "")
                img = proj.get("image")
            if not img:
                fail(f"{where}: no figure in data and no 'image' override")
            tile["img"] = resolve_image(img, where) if img else ""
            if not tile["blurb"]:
                fail(f"{where}: blurb is required")
            if len(tile["blurb"]) > BLURB_MAX:
                fail(f"{where}: blurb is {len(tile['blurb'])} chars (max {BLURB_MAX}): {tile['blurb']}")
            if len(tile["name"]) > NAME_MAX:
                fail(f"{where}: name '{tile['name']}' is longer than {NAME_MAX} chars; add a short 'name:'")
            tiles.append(tile)
        themes.append({**theme, "num": f"{t_i:02d}", "tiles": tiles})

    featured_titles = {t["title"] for t in tiles_all}
    sel = cfg["selected_papers"]
    skip = [s.lower() for s in sel["skip"]]
    tier = {v: i for i, v in enumerate(sel["venues"])}
    pool = []
    for p in pubs:
        label = short_venue(p["venue"], aliases)
        text = (p["title"] + " " + p["venue"]).lower()
        if label in tier and p["title"] not in featured_titles and not any(s in text for s in skip):
            pool.append((tier[label], -p["year"], p, label))
    picked = sorted(pool, key=lambda x: x[:2])[: sel["count"]]
    picked.sort(key=lambda x: -x[2]["year"])
    selected = [{"title": p["title"], "venue": label, "year": p["year"], "award": p.get("award", "")}
                for _, _, p, label in picked]
    if len(selected) < sel["count"]:
        fail(f"selected_papers: only {len(selected)} papers match the venue list (want {sel['count']})")

    c = cfg["compute"]
    compute = {
        "note": c["note"],
        "stats": [(f"{g['count']}×", f"{g['model']} · {g['memory']}") for g in c["gpus"]]
                 + [(c["ram"], "RAM"), (c["cores"], "CPU cores")],
    }

    groups = Counter(a["group"] for a in alumni)
    phd_grads = [a for a in alumni if a["group"] == "PhD"]

    pi = dict(cfg["pi"])
    pi["photo"] = resolve_image(pi["photo"], "pi.photo")
    for side in ("lab", "students"):
        for row in cfg["recognition"][side]:
            if len(row) != 3:
                fail(f"recognition.{side}: each row is [year, title, detail], got {row}")

    for m in cfg["methods"]:
        if len(m["examples"]) > 70:
            fail(f"methods[{m['name']}]: examples is {len(m['examples'])} chars (max 70)")

    headline = html.escape(cfg["headline"])
    headline = re.sub(r"\*(.+?)\*", r"<em>\1</em>", headline)

    return {
        **cfg,
        "headline_html": headline,
        "themes": themes,
        "selected": selected,
        "compute": compute,
        "alumni_groups": [(groups.get(g, 0), g) for g in cfg["alumni_counts"]],
        "phd_grads": phd_grads,
        "pi": pi,
        "alumni_logos": [resolve_image(x, "alumni_logos") for x in cfg["alumni_logos"]],
        "funder_logos": [resolve_image(x, "funder_logos") for x in cfg["funder_logos"]],
        "press": [{**p, "image": resolve_image(p["image"], "press")} for p in cfg["press"]],
        "logo": (ROOT / "images/brand/logo-light.svg").as_uri(),
        "logo_dark": (ROOT / "images/brand/logo-dark.svg").as_uri(),
        "seal": resolve_image("assets/iitgn-seal.png", "seal"),
        "qr_join": qr_svg(cfg["join_url"]),
        "qr_site": qr_svg("https://" + cfg["url"]),
        "css": (HERE / "flyer.css").as_uri(),
    }


# ---------- render ----------

AUDIT_JS = """
() => {
  const out = {overflow: [], broken: [], pages: [], minFont: 99};
  document.querySelectorAll('.page').forEach((p, i) => {
    const over = p.scrollHeight - p.clientHeight;
    out.pages.push({page: i + 1, spare_mm: +(-Math.max(over, 0) / 3.7795).toFixed(1)});
  });
  document.querySelectorAll('[data-fit]').forEach(el => {
    if (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)
      out.overflow.push((el.dataset.fit || el.className) + ': ' + el.textContent.trim().slice(0, 60));
  });
  document.querySelectorAll('img').forEach(img => {
    if (!img.complete || img.naturalWidth === 0) out.broken.push(img.getAttribute('src'));
  });
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (!n.textContent.trim()) continue;
    const px = parseFloat(getComputedStyle(n.parentElement).fontSize);
    out.minFont = Math.min(out.minFont, px * 0.75);  // px -> pt
  }
  return out;
}
"""


def variants() -> list[str]:
    return ["swiss"] + sorted(p.stem for p in (HERE / "variants").glob("*.css"))


def render(jobs: list[tuple[Path, Path]]) -> list[dict]:
    from playwright.sync_api import sync_playwright

    audits = []
    with sync_playwright() as pw:
        try:
            browser = pw.chromium.launch(channel="chrome")
        except Exception:
            browser = pw.chromium.launch()  # falls back to `playwright install chromium`
        page = browser.new_page(viewport={"width": 1123, "height": 1587}, device_scale_factor=1.6)
        for html_path, pdf_path in jobs:
            page.goto(html_path.as_uri(), wait_until="networkidle")
            page.evaluate("document.fonts.ready")
            audits.append(page.evaluate(AUDIT_JS))
            page.pdf(path=str(pdf_path), prefer_css_page_size=True, print_background=True)
            for i, el in enumerate(page.query_selector_all(".page"), 1):
                el.screenshot(path=str(pdf_path.parent / f"page-{i}.png"))
        browser.close()
    return audits


def design_blurb(name: str) -> str:
    """The text after the em dash in the CSS file's opening comment."""
    css = (HERE / ("flyer.css" if name == "swiss" else f"variants/{name}.css")).read_text(encoding="utf-8")
    m = re.match(r"\s*/\*(.*?)\*/", css, re.S)
    text = " ".join(m.group(1).split()) if m else ""
    text = text.split("—", 1)[-1].strip()
    keep = [s for s in re.split(r"(?<=\.)\s+", text) if ".css" not in s and "variants/" not in s]
    text = " ".join(keep)
    return text[:1].upper() + text[1:]


def write_gallery(env, names: list[str], failed: set[str], current: str, updated: str) -> Path:
    """One self-contained HTML page showing every design (page images embedded as JPEG)."""
    import base64
    import io

    designs = []
    for n in names:
        pages, thumbs = [], []
        for i in (1, 2):
            with Image.open(BUILD / n / f"page-{i}.png") as im:
                im = im.convert("RGB")
                for size, q, dest in ((1300, 78, pages), (300, 72, thumbs)):
                    small = im.copy()
                    small.thumbnail((size, size * 1.42))
                    buf = io.BytesIO()
                    small.save(buf, "JPEG", quality=q, optimize=True, progressive=True)
                    dest.append("data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode())
        designs.append({"name": n, "blurb": design_blurb(n), "pages": pages, "thumbs": thumbs,
                        "failed": n in failed})
    out = BUILD / "gallery.html"
    out.write_text(env.get_template("gallery.html").render(designs=designs, current=current, updated=updated),
                   encoding="utf-8")
    return out


def check(audit: dict) -> list[str]:
    problems = [f"page {p['page']} overflows by {-p['spare_mm']} mm" for p in audit["pages"] if p["spare_mm"] < 0]
    problems += [f"text overflows its box — {o}" for o in audit["overflow"]]
    problems += [f"image failed to load — {b}" for b in audit["broken"]]
    if len(audit["pages"]) != 2:
        problems.append(f"expected 2 pages, got {len(audit['pages'])}")
    if audit["minFont"] < 6.5:
        problems.append(f"smallest text is {audit['minFont']:.1f} pt (min 6.5 pt)")
    return problems


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--variant", help=f"design to build (default: 'design' in flyer.yml); one of {variants()}")
    ap.add_argument("--all", action="store_true", help="build every design variant")
    ap.add_argument("--publish", action="store_true", help="copy the PDF to the site root as flyer.pdf")
    ap.add_argument("--html-only", action="store_true", help="write the HTML and stop")
    args = ap.parse_args()

    cfg = load(HERE / "flyer.yml")
    names = variants() if args.all else [args.variant or cfg.get("design", "swiss")]
    for n in names:
        if n not in variants():
            print(f"unknown variant '{n}'; choose from {variants()}", file=sys.stderr)
            return 1
    if args.publish and len(names) != 1:
        print("--publish needs a single variant", file=sys.stderr)
        return 1

    ctx = build_context(cfg, load(ROOT / "data/publications.yml"), load(ROOT / "data/alumni.yml"))
    if errors:
        print("flyer.yml has problems:\n  - " + "\n  - ".join(errors), file=sys.stderr)
        return 1

    env = Environment(loader=FileSystemLoader(HERE), undefined=StrictUndefined, autoescape=True)
    jobs = []
    for n in names:
        out = BUILD / n
        out.mkdir(parents=True, exist_ok=True)
        variant_css = (HERE / "variants" / f"{n}.css").as_uri() if n != "swiss" else ""
        html_path = out / "flyer.html"
        html_path.write_text(env.get_template("template.html").render(**ctx, variant=n, variant_css=variant_css),
                             encoding="utf-8")
        jobs.append((html_path, out / "flyer.pdf"))
    if args.html_only:
        print("wrote " + ", ".join(str(h.relative_to(ROOT)) for h, _ in jobs))
        return 0

    failed = set()
    for (html_path, pdf_path), audit in zip(jobs, render(jobs)):
        problems = check(audit)
        status = "FAILED" if problems else "ok"
        print(f"{pdf_path.parent.name:>10}: {status} · smallest text {audit['minFont']:.1f} pt · "
              f"{pdf_path.stat().st_size / 1e6:.1f} MB · {pdf_path.relative_to(ROOT)}")
        for p in problems:
            print(f"            - {p}")
        if problems:
            failed.add(pdf_path.parent.name)
    if args.all:
        g = write_gallery(env, names, failed, cfg.get("design", "swiss"), cfg["updated"])
        print(f"   gallery: {g.relative_to(ROOT)} ({g.stat().st_size / 1e6:.1f} MB, self-contained)")
    if failed:
        return 1
    if args.publish:
        shutil.copy(jobs[0][1], ROOT / "flyer.pdf")
        print(f"published {names[0]} to flyer.pdf")
    return 0


if __name__ == "__main__":
    sys.exit(main())
