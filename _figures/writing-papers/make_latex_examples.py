"""LaTeX-rendered before/after examples for handbook/writing-papers.qmd.

Run from the repository root (needs pdflatex, pdfcrop and pdftocairo):
    uv run --with matplotlib --with git+https://github.com/sustainability-lab/latexify.git \
        python _figures/writing-papers/make_latex_examples.py

1. latexify-before-after.svg: the same plot set in a two-column paper twice, once as a default
   matplotlib PNG shrunk to the column and once made with LaTeXify at the column width.
2. table-<paper>.svg: each paper's table from the page's Tables section, built up in four steps:
   a first draft, booktabs rules, right-aligned numbers at one precision, then the organised table.
"""
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt

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


def tables():
    """Each paper's booktabs table from the page, as {paper: latex}."""
    text = PAGE.read_text()
    section = text[text.index("\n## Tables"):text.index("\n## LaTeX hygiene")]
    found = {}
    for paper, body in re.findall(r'::: \{\.pv paper="(\w+)"\}\n```tex\n(.*?)```\n:::', section, re.S):
        found[paper] = body
    return found


NUM = re.compile(r"^-?\d+(\.\d+)?$")


def bare(cell):
    """A cell's number without bold or math markup, or None for a text cell."""
    c = re.sub(r"\\(textbf|mathbf)\{(.*?)\}", r"\2", cell.strip()).replace("$", "").strip()
    return c if NUM.match(c) else None


def parse(table):
    """Split a booktabs table into caption, column spec, header lines and blocks of body rows."""
    cap = re.search(r"\\caption\{(.*?)\}\n\s*\\label", table, re.S).group(1)
    spec = re.search(r"\\begin\{tabular\}\{(\w+)\}", table).group(1)
    inner = table[table.index(r"\toprule") + len(r"\toprule"):table.index(r"\bottomrule")]
    head, body = inner.split(r"\midrule", 1)
    heads = [h.strip() for h in head.strip().split("\n")]
    blocks = [[r.strip() for r in blk.strip().split("\n") if r.strip()] for blk in body.split(r"\midrule")]
    return cap, spec, heads, blocks


def cells(row):
    shade = row.startswith(r"\rowcolor")
    row = re.sub(r"^\\rowcolor\{[^}]*\}\s*", "", row).rstrip("\\ ").rstrip()
    return shade, [c.strip() for c in row.split("&")]


def numeric_columns(blocks, ncol):
    rows = [cells(r)[1] for blk in blocks for r in blk]
    return [all(len(r) > j and bare(r[j]) is not None for r in rows) for j in range(ncol)]


def right_align(spec, numeric):
    return "".join("r" if numeric[j] else ch for j, ch in enumerate(spec))


def sloppy(cell, k):
    """The same value written at a different precision, as first drafts do."""
    n = bare(cell)
    if n is None:
        return cell
    if "." in n:
        return [n.rstrip("0").rstrip("."), n + "0", n][k % 3]
    return n + ".0" if k % 2 else n


def plain(cell):
    n = bare(cell)
    return n if n is not None else re.sub(r"\\textbf\{(.*?)\}", r"\1", cell)


def build_up(table):
    """Four versions of one table, each fixing one more thing; the values never change."""
    cap, spec, heads, blocks = parse(table)
    names = heads[-1]  # the row of column names; any rows above it group the columns
    ncol = len(cells(names)[1])
    numeric = numeric_columns(blocks, ncol)
    rows = [r for blk in blocks for r in blk]

    def tab(colspec, lines):
        return "\\begin{tabular}{%s}\n%s\n\\end{tabular}" % (colspec, "\n".join(lines))

    # 1. Grid, everything centred, mixed precision, no emphasis.
    l1 = [r"\hline", names, r"\hline"]
    for k, r in enumerate(rows):
        l1 += [" & ".join(sloppy(c, k + j) if numeric[j] else plain(c) for j, c in enumerate(cells(r)[1])) + r" \\", r"\hline"]
    step1 = tab("|" + "|".join("c" * len(spec)) + "|", l1)
    # 2. booktabs rules; still centred and mixed.
    l2 = [r"\toprule", names, r"\midrule"] + [l for l in l1[3:] if l != r"\hline"] + [r"\bottomrule"]
    step2 = tab("c" * len(spec), l2)
    # 3. Numbers right-aligned at the same precision.
    l3 = [r"\toprule", names, r"\midrule"] + [" & ".join(plain(c) for c in cells(r)[1]) + r" \\" for r in rows] + [r"\bottomrule"]
    step3 = tab(right_align("l" * len(spec), numeric), l3)
    # 4. Organised: the page's table as written.
    step4 = table[table.index(r"\begin{tabular}"):table.index(r"\end{tabular}") + len(r"\end{tabular}")]
    return cap, [step1, step2, step3, step4]


NAMES = {"gemello": "Gemello", "thermeval": "ThermEval", "jouleseye": "JoulesEye", "gdmi": "GD-MI", "kestrel": "Kestrel"}

STEPS = [
    ("1. First draft", "a grid of rules, every column centred, the same values at mixed precision, a caption below that says nothing"),
    ("2. booktabs", "three horizontal rules and no vertical ones; the caption moves above"),
    ("3. Numbers right-aligned, same precision", "digits line up, so you compare values at a glance"),
    ("4. Organised", "columns grouped by the question they answer, the best result in bold, our row shaded, the message in the caption"),
]


def table_examples(tmp):
    for paper, table in tables().items():
        cap, steps = build_up(table)
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
