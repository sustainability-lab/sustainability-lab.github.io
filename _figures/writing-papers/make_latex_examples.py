"""LaTeX-rendered before/after examples for handbook/writing-papers.qmd.

Run from the repository root (needs pdflatex, pdfcrop and pdftocairo):
    uv run --with matplotlib --with git+https://github.com/sustainability-lab/latexify.git \
        python _figures/writing-papers/make_latex_examples.py

1. latexify-before-after.svg: the same plot set in a two-column paper twice, once as a default
   matplotlib PNG shrunk to the column and once made with LaTeXify at the column width.
2. table-<paper>.svg: each paper's table from the page's Tables section, typeset twice: a common
   first draft (vertical rules, \\hline everywhere, caption below) and the booktabs version.
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


def first_draft(table):
    """Turn a booktabs table into the version most first drafts have."""
    t = table.replace(r"\rowcolor{gray!12} ", "")
    t = re.sub(r"\\begin\{tabular\}\{(\w+)\}", lambda m: r"\begin{tabular}{|" + "|".join(m.group(1)) + "|}", t)
    t = re.sub(r"\\cmidrule\([^)]*\)\{[^}]*\}", "", t)
    t = re.sub(r"^\s*\n", "", t, flags=re.M)
    t = t.replace(r"\toprule", r"\hline\hline").replace(r"\midrule", r"\hline").replace(r"\bottomrule", r"\hline")
    t = re.sub(r"\\\\\n(\s+)(?!\\hline)", r"\\\\ \\hline\n\1", t)  # a rule under every row
    t = re.sub(r"\\multicolumn\{(\d+)\}\{c\}", r"\\multicolumn{\1}{c|}", t)
    cap = re.search(r"\\caption\{.*?\}\n\s*\\label", t, re.S)
    if cap:
        t = t.replace(cap.group(0), r"\label")
    return t.replace(r"\end{tabular}", r"\end{tabular}" + "\n  \\caption{Results of different methods.}")


NAMES = {"gemello": "Gemello", "thermeval": "ThermEval", "jouleseye": "JoulesEye", "gdmi": "GD-MI", "kestrel": "Kestrel"}


def table_examples(tmp):
    for paper, after in tables().items():
        before = first_draft(after)
        label = r"{\sffamily\footnotesize\color{gray}\textbf{%s}: %s}\par"
        body = (label % ("BEFORE", "vertical rules, a line under every row, caption below") + before
                + r"\vspace{14pt}\setcounter{table}{0}" + label % ("AFTER", "booktabs, the message first in the caption") + after)
        body = body.replace(r"\begin{table}[t]", r"\begin{table}[h!]")
        pre = (r"\newcommand{\method}{%s\xspace}\usepackage{xspace}\usepackage{caption}"
               r"\captionsetup{font=small,labelfont=bf}") % NAMES[paper]
        compile_to_svg(tmp, f"table-{paper}", body, pre, width=5.6)


if __name__ == "__main__":
    tmp = Path(tempfile.mkdtemp())
    try:
        latexify_example(tmp)
        table_examples(tmp)
    finally:
        shutil.rmtree(tmp)
