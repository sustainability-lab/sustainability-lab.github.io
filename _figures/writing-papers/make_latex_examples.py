"""LaTeX-rendered before/after examples for handbook/writing-papers.qmd.

Run from the repository root (needs pdflatex, pdfcrop and pdftocairo):
    uv run --with matplotlib --with git+https://github.com/sustainability-lab/latexify.git \
        python _figures/writing-papers/make_latex_examples.py

1. latexify-before-after.svg: the same plot set in a two-column paper twice, once as a default
   matplotlib PNG shrunk to the column and once made with LaTeXify at the column width.
2. table-<paper>.svg: each paper's table (tables_data.py) built up in four steps: a first draft,
   booktabs rules, units in the header with numbers right-aligned at one precision, then organised.
   The organised LaTeX is also copied into the page's Tables section, so the two never drift.
"""
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

from tables_data import DRAFTS, FINALS

OUT = Path("images/handbook/writing-papers").resolve()
PAGE = Path("handbook/writing-papers.qmd")
COLUMN_IN = 3.33  # \columnwidth of a two-column ACM or IEEE paper, in inches (241 pt)

# ThermEval (KDD 2026), Table 4, Task 5 "Double": parameters in billions, accuracy.
THERMEVAL = [(0.3, .54), (2, .43), (3, .52), (3, .52), (3, .66), (4, .44), (4, .48), (7, .48), (7, .54),
             (8, .40), (8, .55), (8, .60), (8, .49), (8, .56), (8, .51), (11, .60), (15, .46), (33, .53),
             (38, .64), (235, .48)]


def scatter(ax):
    ax.scatter([p for p, _ in THERMEVAL], [a for _, a in THERMEVAL], s=14, color="#555555", zorder=3)
    ax.axhline(.84, color="#b52d24", lw=1)
    ax.axhline(.50, color="#888888", lw=1, ls="--")
    ax.set_xscale("log")
    ax.set_xlabel("Parameters (billions)")
    ax.set_ylabel("Accuracy")
    ax.set_ylim(.35, .9)


def plots(tmp):
    # Before: matplotlib's defaults (6.4 x 4.8 in, 10 pt sans), saved as a 100-dpi PNG.
    with plt.rc_context(matplotlib.rcParamsDefault):
        fig, ax = plt.subplots()
        scatter(ax)
        ax.text(0.35, .855, "people", color="#b52d24")
        ax.text(0.35, .515, "chance", color="#888888")
        ax.set_title("Accuracy vs model size")
        fig.savefig(tmp / "before.png", dpi=100)
        plt.close(fig)
    # After: LaTeXify at the column width, saved as a vector PDF.
    import latexify
    latexify.latexify(fig_width=COLUMN_IN)
    fig, ax = plt.subplots()
    scatter(ax)
    ax.text(0.35, .855, "people", color="#b52d24", fontsize=8)
    ax.text(0.35, .515, "chance", color="#888888", fontsize=8)
    latexify.format_axes(ax)
    latexify.save_fig(tmp / "after.pdf", fig)
    plt.close(fig)


def compile_to_svg(tmp, name, body, preamble="", width=8.5):
    tex = rf"""\documentclass{{article}}
\usepackage[paperwidth={width}in,paperheight=11in,margin=0.3in]{{geometry}}
\usepackage{{graphicx,booktabs,amsmath}}
\usepackage[table]{{xcolor}}
\pagestyle{{empty}}
\setlength{{\parindent}}{{0pt}}
{preamble}
\begin{{document}}
{body}
\end{{document}}
"""
    (tmp / f"{name}.tex").write_text(tex)
    subprocess.run(["pdflatex", "-interaction=nonstopmode", "-halt-on-error", f"{name}.tex"],
                   cwd=tmp, check=True, capture_output=True)
    subprocess.run(["pdfcrop", "--margins", "6", f"{name}.pdf", f"{name}-crop.pdf"], cwd=tmp, check=True, capture_output=True)
    subprocess.run(["pdftocairo", "-svg", f"{name}-crop.pdf", str(OUT / f"{name}.svg")], check=True, cwd=tmp)
    print("wrote", OUT / f"{name}.svg")


PARA = (r"Figure~1 plots each model's accuracy at telling which of two people is hotter against its "
        r"size. Open models from 0.3B to 235B parameters scatter around chance, and none reaches people.")


def column(heading, graphic, caption, natural=False):
    size = "" if natural else r"[width=\linewidth]"
    return rf"""\begin{{minipage}}[t]{{{COLUMN_IN}in}}
{{\sffamily\footnotesize\color{{gray}}{heading}}}\par\vspace{{6pt}}
{{\fontsize{{9}}{{11}}\selectfont {PARA}\par\vspace{{6pt}}
{{\centering\includegraphics{size}{{{graphic}}}\par}}\vspace{{4pt}}
{{\footnotesize\textbf{{Figure 1.}} {caption}}}\par}}
\end{{minipage}}"""


def latexify_example(tmp):
    plots(tmp)
    body = (column(r"\textsf{\textbf{BEFORE}}: matplotlib defaults, shrunk to the column",
                   "before.png", "Accuracy against model size.")
            + r"\hspace{0.33in}"
            + column(r"\textsf{\textbf{AFTER}}: LaTeXify at the column width",
                     "after.pdf", r"\textbf{Size does not buy thermal reasoning.} Grey: open models. "
                                  r"Red: people. Dashed: chance.", natural=True))
    compile_to_svg(tmp, "latexify-before-after", body)


UNITS = [("%", r" (\%)"), ("°C", r" ($^\circ$C)")]


def number(cell):
    """(value text, unit header) for a numeric draft cell, else None."""
    c = cell.strip()
    for u, head in UNITS:
        if c.endswith(u):
            c = c[: -len(u)].strip()
            break
    else:
        head = ""
    c = c.replace("-.", "-0.")
    return (c, head) if re.match(r"^-?\d+(\.\d+)?$", c) else None


def build_up(draft, final):
    """Four versions of one table, each fixing one more thing; the values never change."""
    header, rows = draft["header"], draft["rows"]
    n = len(header)
    numeric = [all(number(r[j]) for r in rows) for j in range(n)]

    def tab(spec, lines):
        return "\\begin{tabular}{%s}\n%s\n\\end{tabular}" % (spec, "\n".join(lines))

    def line(cs):
        return " & ".join(cs) + r" \\"

    raw = [[c.replace("%", r"\%") for c in r] for r in rows]
    step1 = tab("|" + "|".join("c" * n) + "|", [r"\hline", line(header), r"\hline"]
                + [x for r in raw for x in (line(r), r"\hline")])
    step2 = tab("c" * n, [r"\toprule", line(header), r"\midrule"] + [line(r) for r in raw] + [r"\bottomrule"])
    # 3. Units move to the header; numbers right-aligned at one precision per column.
    heads, cols = list(header), []
    for j in range(n):
        if not numeric[j]:
            cols.append([r[j] for r in rows])
            continue
        vals = [number(r[j]) for r in rows]
        unit = next((h for _, h in vals if h), "")
        heads[j] += unit
        # Trailing zeros a draft added ("5.80") are not real precision.
        places = max(len(v.split(".")[1].rstrip("0")) if "." in v else 0 for v, _ in vals)
        cols.append([f"{float(v):.{places}f}".replace("-", "$-$") for v, _ in vals])
    body3 = [line([cols[j][i] for j in range(n)]) for i in range(len(rows))]
    step3 = tab("".join("r" if numeric[j] else "l" for j in range(n)),
                [r"\toprule", line(heads), r"\midrule"] + body3 + [r"\bottomrule"])
    cap = re.search(r"\\caption\{(.*?)\}\n\s*\\label", final, re.S).group(1)
    step4 = final[final.index(r"\begin{tabular}"):final.index(r"\end{tabular}") + len(r"\end{tabular}")]
    return cap, [step1, step2, step3, step4]


def sync_page():
    """Put each paper's organised table on the page as its LaTeX snippet."""
    text = PAGE.read_text()
    a, b = text.index("\n## Tables"), text.index("\n## LaTeX hygiene")
    section = re.sub(r'(::: \{\.pv paper="(\w+)"\}\n```tex\n).*?(```\n:::)',
                     lambda m: m.group(1) + FINALS[m.group(2)] + m.group(3), text[a:b], flags=re.S)
    PAGE.write_text(text[:a] + section + text[b:])


NAMES = {"gemello": "Gemello", "thermeval": "ThermEval", "jouleseye": "JoulesEye", "gdmi": "GD-MI", "kestrel": "Kestrel"}

STEPS = [
    ("1. First draft", "a grid, everything centred, units in every cell, mixed precision, rows in the order they were run"),
    ("2. booktabs", "three horizontal rules and no vertical ones; the caption moves above"),
    ("3. Units in the header, numbers right-aligned at one precision", "digits line up, so values compare at a glance"),
    ("4. Organised", "rows grouped and sorted, columns grouped by question, reference rows apart, best in bold, the message in the caption"),
]


def table_examples(tmp):
    sync_page()
    for paper in DRAFTS:
        cap, steps = build_up(DRAFTS[paper], FINALS[paper])
        parts = []
        for k, ((title, why), t) in enumerate(zip(STEPS, steps)):
            parts.append(r"{\sffamily\footnotesize\textbf{%s}\quad\color{gray}%s}\par\vspace{5pt}" % (title, why))
            if k == 3:
                parts.append(r"\captionof{table}{%s}\vspace{2pt}" % cap)
            elif k > 0:
                parts.append(r"\captionof{table}{Results of different methods.}\vspace{2pt}")
            parts.append(r"{\small " + t + r"}\par")
            if k == 0:
                parts.append(r"\vspace{2pt}{\small\textbf{Table 1:} Results of different methods.}\par")
            parts.append(r"\vspace{16pt}\setcounter{table}{0}")
        pre = (r"\newcommand{\method}{%s\xspace}\usepackage{xspace}\usepackage{caption}"
               r"\captionsetup{font=small,labelfont=bf,skip=3pt,justification=raggedright,singlelinecheck=false}") % NAMES[paper]
        compile_to_svg(tmp, f"table-{paper}", "\n".join(parts), pre, width=6.6)


if __name__ == "__main__":
    tmp = Path(tempfile.mkdtemp())
    try:
        latexify_example(tmp)
        table_examples(tmp)
    finally:
        shutil.rmtree(tmp)
