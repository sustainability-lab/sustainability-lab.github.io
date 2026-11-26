# /// script
# requires-python = ">=3.10"
# dependencies = ["img2pdf"]
# ///
"""Make the talk's PDF, one 16:9 page per slide in its final state (chapter slides also get their headline).

    PDF=1 node _talk/scripts/stills.mjs   # renders the pages at 3840 x 2160 into _talk/out/pdf/
    uv run _talk/scripts/pdf.py

The JPEGs go into the PDF unchanged (no re-compression). Writes _talk/out/lab-talk-december-2026.pdf.
"""

from pathlib import Path

import img2pdf

HERE = Path(__file__).resolve().parent
FRAMES = sorted((HERE.parent / "out" / "pdf").glob("*.jpg"))
OUT = HERE.parent / "out" / "lab-talk-december-2026.pdf"

OUT.parent.mkdir(exist_ok=True)
page = (img2pdf.in_to_pt(13.333), img2pdf.in_to_pt(7.5))  # PowerPoint's 16:9 page
OUT.write_bytes(
    img2pdf.convert(
        [str(f) for f in FRAMES],
        layout_fun=img2pdf.get_layout_fun(page),
        title="Sustainability Lab, IIT Gandhinagar (December 2026)",
        author="Sustainability Lab, IIT Gandhinagar",
    )
)
print(f"{OUT.relative_to(HERE.parent.parent)}: {len(FRAMES)} pages, {OUT.stat().st_size / 1e6:.1f} MB")
