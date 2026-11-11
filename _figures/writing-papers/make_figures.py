"""Diagrams for handbook/writing-papers.qmd.

Run from the repository root:
    uv run --with matplotlib python _figures/writing-papers/make_figures.py

Writes SVGs to images/handbook/writing-papers/. Every example uses Kestrel,
an invented paper; its numbers are made up for teaching.
"""
import re
import statistics
from pathlib import Path

import matplotlib

matplotlib.use("svg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, FancyBboxPatch, Rectangle

OUT = Path("images/handbook/writing-papers")
OUT.mkdir(parents=True, exist_ok=True)

# Site tokens (theme/light.scss) and Okabe-Ito for the semantic colour code.
PAPER, INK, MUTED, RULE, SOFT, ACCENT = "#fffefa", "#222522", "#60645e", "#d4d6ce", "#f0efe8", "#b52d24"
ORANGE, GREEN, BLUE, GREY = "#E69F00", "#009E73", "#0072B2", "#8a8a8a"
BRIDGE = "#2f7d4a"  # the site's --ok green: bridges here and on the page
PURPLE, YELLOW, SKY = "#CC79A7", "#F0E442", "#56B4E9"

plt.rcParams.update({
    "font.family": ["Arial", "Helvetica", "DejaVu Sans"],
    "font.size": 11,
    "svg.fonttype": "none",
    "figure.facecolor": PAPER,
    "axes.facecolor": PAPER,
    "axes.edgecolor": MUTED,
    "axes.labelcolor": INK,
    "xtick.color": MUTED,
    "ytick.color": MUTED,
    "text.color": INK,
})


def box(ax, x, y, w, h, fc=PAPER, ec=RULE, lw=1.2, ls="-", r=0.012):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle=f"round,pad=0,rounding_size={r}",
                                fc=fc, ec=ec, lw=lw, ls=ls))


def arrow(ax, p, q, color=ACCENT, lw=1.6, ls="-", rad=0.0, ms=12):
    ax.add_patch(FancyArrowPatch(p, q, arrowstyle="-|>", mutation_scale=ms, color=color,
                                 lw=lw, ls=ls, connectionstyle=f"arc3,rad={rad}",
                                 shrinkA=0, shrinkB=0))


def canvas(w, h):
    fig = plt.figure(figsize=(w, h))
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis("off")
    return fig, ax


def save(fig, name):
    fig.savefig(OUT / f"{name}.svg", facecolor=PAPER)
    plt.close(fig)
    print("wrote", OUT / f"{name}.svg")


# 1. The skeleton: one abstract line = one intro paragraph = one section ------------------
def skeleton():
    rows = [
        ("Context", "Where the field is now", "Background"),
        ("Motivation", "The problem, and who has it", "Problem setup"),
        ("Prior art", "Why existing work falls short", "Related work"),
        ("Insight (optional)", "What explains the gap", "Analysis"),
        ("Approach", "What we do", "Method"),
        ("Evaluation", "How we test it", "Evaluation: setup"),
        ("Results", "What we found, in numbers", "Evaluation: results"),
        ("Conclusion", "What it means, and its limits", "Limitations, conclusion"),
    ]
    fig, ax = canvas(10, 5.6)
    cols = [(0.03, 0.24), (0.36, 0.30), (0.75, 0.22)]
    heads = ["Abstract: one line each", "Introduction: one paragraph each", "Paper: one section each"]
    for (x, w), h in zip(cols, heads):
        ax.text(x, 0.955, h, fontsize=12.5, fontweight="bold", va="center")
    top, step, bh = 0.86, 0.105, 0.075
    for i, (a, b, c) in enumerate(rows):
        y = top - i * step
        opt = i == 3
        ls = (0, (4, 3)) if opt else "-"
        for (x, w), label, fc in zip(cols, (f"{i + 1}  {a}", f"¶{i + 1}  {b}", c), (SOFT, PAPER, PAPER)):
            box(ax, x, y - bh / 2, w, bh, fc=fc, ec=MUTED if not opt else GREY, ls=ls)
            ax.text(x + 0.012, y, label, va="center", fontsize=11, color=INK if not opt else MUTED)
        arrow(ax, (cols[0][0] + cols[0][1] + 0.01, y), (cols[1][0] - 0.01, y), ls=ls)
        arrow(ax, (cols[1][0] + cols[1][1] + 0.01, y), (cols[2][0] - 0.01, y), ls=ls)
    ax.text(0.03, 0.02, "Write the abstract first. Grow each line into a paragraph, and each paragraph into a section.",
            fontsize=10.5, color=MUTED, style="italic")
    save(fig, "skeleton")


# 2. Anatomy of a paragraph, for every example paper ---------------------------------------
# Lead, bridge and next lead match each paper's Introduction examples on the page.
PARAGRAPHS = {
    "gemello": ("Today's energy breakdowns need hardware in every home.",
                "So can we get a breakdown without installing anything?",
                "Yes, if we borrow it from similar homes already metered."),
    "thermeval": ("We do not know if VLMs can read a thermal image.",
                  "So can a model trained on photos read temperature at all?",
                  "We break thermal understanding into seven tasks."),
    "jouleseye": ("Smartwatch calorie estimates can be wrong by over 40%.",
                  "So what does the watch miss?",
                  "It misses breathing, which a thermal camera can see."),
    "gdmi": ("India has about 500 stations for 1.4 billion people.",
             "MI picks good sites, so why isn't it used at national scale?",
             "Because its cost grows with every candidate site it checks."),
    "kestrel": ("Existing bird classifiers fail on phone audio.",
                "So why does accuracy collapse on phones?",
                "We find that the microphone, not the bird, causes the drop."),
}


def paragraph(paper, lead, bridge, next_lead):
    fig, ax = canvas(10, 4.8)

    def para(y0, lead, bridge, nbody):
        x, w = 0.03, 0.57
        box(ax, x, y0, w, 0.40, fc=PAPER, ec=RULE)
        ax.add_patch(Rectangle((x, y0 + 0.31), 0.008, 0.075, color=ACCENT, lw=0))
        ax.text(x + 0.02, y0 + 0.347, lead, fontsize=11, fontweight="bold", va="center")
        for k in range(nbody):
            ww = [0.50, 0.47, 0.51, 0.33][k % 4]
            ax.add_patch(Rectangle((x + 0.02, y0 + 0.255 - k * 0.05), ww, 0.018, color=RULE, lw=0))
        if bridge:
            ax.text(x + 0.02, y0 + 0.045, bridge, fontsize=11, style="italic", va="center", color=BRIDGE)

    para(0.53, lead, bridge, 4)
    para(0.04, next_lead, None, 4)
    arrow(ax, (0.47, 0.575), (0.47, 0.445), color=BRIDGE, lw=1.8)
    notes = [
        (0.88, ACCENT, "Lead sentence", "States the point. Read alone,\nit gives the whole paragraph."),
        (0.70, MUTED, "Body", "Backs the point: a number,\nan example, a citation."),
        (0.555, BRIDGE, "Bridge sentence", "Raises the question that the\nnext paragraph answers."),
        (0.39, ACCENT, "Next lead", "Answers it at once."),
    ]
    for y, c, h, t in notes:
        ax.plot([0.62, 0.65], [y, y], color=c, lw=1.4)
        ax.text(0.665, y + 0.012, h, fontsize=11.5, fontweight="bold", color=c, va="bottom")
        ax.text(0.665, y - 0.005, t, fontsize=10.5, color=INK, va="top")
    save(fig, f"paragraph-{paper}")


# 3. Sentence lengths: the same abstract, before and after, for every example paper -------
# The abstracts are read from the page itself, so the figure always matches the text.
PAGE = Path("handbook/writing-papers.qmd")


def abstracts():
    """Yield (paper, before, after) for each paper's first-draft and rewritten abstract."""
    text = PAGE.read_text()
    section = text[text.index("\n## Abstract"):text.index("\n## Introduction")]
    for m in re.finditer(r'::: \{\.pv paper="(\w+)"\}(.*?)\n:::\n(?=\n::: \{\.pv|\n!\[)', section, re.S):
        paper, body = m.group(1), m.group(2)
        if "{.bad}" not in body:
            continue
        before = re.search(r"::: \{\.bad\}\n(.*?)\n:::", body, re.S).group(1)
        after = re.search(r"::: \{\.good\}\n(.*?)\n:::", body, re.S).group(1)
        yield paper, before, after


def sentence_lengths(text):
    sents = [s for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s]
    return [len(s.split()) for s in sents]


def lengths():
    stats = {}
    for paper, before, after in abstracts():
        b, a = sentence_lengths(before), sentence_lengths(after)
        fig, axes = plt.subplots(1, 2, figsize=(10, 3.8), sharey=True,
                                 gridspec_kw={"width_ratios": [len(b) + 2, len(a) + 2]})
        for ax, L, name, col in [(axes[0], b, "First draft", GREY), (axes[1], a, "Rewrite", ACCENT)]:
            ax.axhspan(10, 20, color=SOFT, zorder=0)
            ax.axhline(25, color=INK, lw=1.0, ls=(0, (4, 3)))
            ax.bar(range(1, len(L) + 1), L, color=col, width=0.7, zorder=2)
            n, tot, med, mx = len(L), sum(L), statistics.median(L), max(L)
            ax.set_title(f"{name}: {n} sentences, {tot} words\nmedian {med:g} words, longest {mx}",
                         fontsize=11.5, loc="left", color=INK)
            ax.set_xticks(range(1, len(L) + 1))
            ax.set_xlabel("Sentence")
            for sp in ("top", "right"):
                ax.spines[sp].set_visible(False)
        axes[0].set_ylabel("Words in sentence")
        axes[0].set_ylim(0, max(62, max(b) + 6))
        axes[1].text(len(a) + 0.6, 25.8, "upper limit (~25)", color=INK, fontsize=10, ha="right", va="bottom")
        axes[1].text(len(a) + 0.6, 15, "aim: 10–20", color=MUTED, fontsize=10, ha="right", va="center")
        fig.tight_layout()
        save(fig, f"sentence-lengths-{paper}")
        stats[paper] = {k: (len(L), sum(L), statistics.median(L), max(L)) for k, L in (("before", b), ("after", a))}
    return stats


# 4. Colour code: colours that mean something -------------------------------------------
def colour_code():
    fig, axes = plt.subplots(1, 2, figsize=(10, 4.2))
    for ax in axes:
        ax.set_xlim(0, 10)
        ax.set_ylim(0, 7.6)
        ax.axis("off")

    def scene(ax, start, ours, end, base, base_end, title, check):
        ax.text(0, 7.25, title, fontsize=12.5, fontweight="bold")
        ax.scatter([2], [3.6], s=420, color=start, zorder=3, ec=INK, lw=0.8)
        ax.text(2, 2.6, "input", ha="center", fontsize=10.5, color=MUTED)
        arrow(ax, (2.5, 4.0), (7.3, 5.4), color=ours, lw=2.4, rad=-0.15, ms=16)
        arrow(ax, (2.5, 3.2), (7.3, 1.9), color=base, lw=2.0, ls=(0, (4, 3)), rad=0.15, ms=14)
        ax.scatter([7.8], [5.5], s=420, color=end, zorder=3, ec=INK, lw=0.8)
        ax.scatter([7.8], [1.8], s=420, facecolor=base_end, zorder=3, ec=INK, lw=0.8)
        ax.text(4.6, 5.55, "our method", fontsize=10.5, color=INK, ha="center")
        ax.text(4.6, 1.45, "baseline", fontsize=10.5, color=INK, ha="center")
        if check:
            ax.text(8.5, 5.5, "✓", fontsize=18, color=GREEN, va="center", fontweight="bold")
            ax.text(8.5, 1.8, "✗", fontsize=18, color=ACCENT, va="center", fontweight="bold")

    scene(axes[0], PURPLE, ORANGE, SKY, YELLOW, GREEN, "Before: colours mean nothing", False)
    axes[0].text(0, 0.35, "The reader needs a legend to know what improved.", fontsize=10.5, color=MUTED, style="italic")
    scene(axes[1], ORANGE, BLUE, GREEN, GREY, PAPER, "After: one code for the whole paper", True)
    keys = [(ORANGE, "the problem"), (BLUE, "what we do"), (GREEN, "good outcome"), (GREY, "baseline")]
    for x, (c, t) in zip([0.0, 2.45, 4.9, 7.75], keys):
        axes[1].scatter([x + 0.2], [0.45], s=110, color=c, ec=INK, lw=0.6)
        axes[1].text(x + 0.5, 0.45, t, fontsize=10, va="center")
    fig.tight_layout(w_pad=3)
    save(fig, "colour-code")


# 5. One message per figure: the headline result ----------------------------------------
METHODS = [  # (name, accuracy on phone audio %, labelled calls per species)  invented
    ("Supervised CNN", 54, 200), ("CNN + augmentation", 57, 200), ("Denoise + CNN", 60, 200),
    ("Fine-tuned transformer", 61, 100), ("Few-shot prototypes", 49, 5), ("Domain adaptation", 58, 150),
]
OURS = ("Kestrel", 83, 5)


def headline():  # Kestrel: invented numbers
    fig, axes = plt.subplots(1, 2, figsize=(10, 4.3), gridspec_kw={"width_ratios": [1.05, 1]})
    ax = axes[0]
    allm = METHODS + [OURS]
    cols = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#a65628", "#f781bf"]
    for i, (n, acc, lab) in enumerate(allm):
        ax.bar(i - 0.2, acc, 0.4, color=cols[i])
        ax.bar(i + 0.2, lab / 2.5, 0.4, color=cols[i], hatch="///", ec=PAPER)
    ax.set_xticks(range(len(allm)))
    ax.set_xticklabels([f"M{i + 1}" for i in range(len(allm))])
    ax.set_title("Before: many bars, no message", fontsize=12.5, fontweight="bold", loc="left")
    ax.set_ylabel("Score")
    from matplotlib.patches import Patch
    handles = [Patch(color=cols[i], label=n) for i, (n, _, _) in enumerate(allm)]
    handles.append(Patch(fc="white", ec=MUTED, hatch="///", label="hatched: labels ÷ 2.5"))
    ax.legend(handles=handles, fontsize=9, ncol=2, loc="upper right", frameon=False)
    ax.set_ylim(0, 145)

    ax = axes[1]
    ax.add_patch(Rectangle((75, 3), 16, 9, color=SOFT, zorder=0))
    ax.text(90.5, 4.6, "goal", color=MUTED, fontsize=10, ha="right", style="italic")
    for n, acc, lab in METHODS:
        ax.scatter(acc, lab, s=60, color=GREY, zorder=3)
    ax.text(50.2, 5, "Few-shot prototypes", fontsize=9.5, color=MUTED, va="center")
    ax.text(62.2, 100, "Fine-tuned transformer\n(best baseline)", fontsize=9.5, color=MUTED, va="center")
    ax.text(61.5, 190, "Four CNN variants", fontsize=9.5, color=MUTED, va="center")
    ax.scatter(OURS[1], OURS[2], s=190, marker="*", color=ACCENT, zorder=4, ec=INK, lw=0.6)
    ax.text(OURS[1] - 1.2, OURS[2] * 1.35, "Kestrel", fontsize=11.5, fontweight="bold", color=ACCENT, ha="right")
    ax.set_yscale("log")
    ax.set_ylim(300, 3)  # fewer labels is better, so up is better
    ax.set_xlim(45, 92)
    ax.set_yticks([5, 10, 50, 100, 200])
    ax.set_yticklabels(["5", "10", "50", "100", "200"])
    ax.minorticks_off()
    ax.set_xlabel("Accuracy on phone audio (%)  →  better")
    ax.set_ylabel("Labelled calls per species  ↑ better")
    ax.set_title("After: ours alone in the good corner", fontsize=12.5, fontweight="bold", loc="left")
    for a in axes:
        for s in ("top", "right"):
            a.spines[s].set_visible(False)
    fig.tight_layout(w_pad=2.5)
    save(fig, "headline-kestrel")


# 5b. Headline figures for the lab papers: real numbers only, as stated in each paper -------
RAINBOW = ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#a65628", "#f781bf", "#999999"]


def two_panels():
    fig, axes = plt.subplots(1, 2, figsize=(10, 4.3), gridspec_kw={"width_ratios": [1, 1.1]})
    axes[0].set_title("Before: bars and a legend", fontsize=12.5, fontweight="bold", loc="left")
    return fig, axes


def tidy(fig, axes, name):
    for a in axes:
        for sp in ("top", "right"):
            a.spines[sp].set_visible(False)
    fig.tight_layout(w_pad=2.5)
    save(fig, name)


def legend_bars(ax, groups, series, values, ylabel, ylim):
    """A grouped bar chart that needs its legend: the 'before' panel."""
    from matplotlib.patches import Patch
    n = len(series)
    w = 0.8 / n
    for j, name in enumerate(series):
        for g in range(len(groups)):
            ax.bar(g - 0.4 + w * (j + 0.5), values[j][g], w, color=RAINBOW[j % len(RAINBOW)])
    ax.set_xticks(range(len(groups)))
    ax.set_xticklabels(groups)
    ax.set_ylabel(ylabel)
    ax.set_ylim(*ylim)
    ax.legend(handles=[Patch(color=RAINBOW[j % len(RAINBOW)], label=nm) for j, nm in enumerate(series)],
              fontsize=9, ncol=2, loc="upper right", frameon=False)


def dot_rows(ax, rows, ours, xlim, gap, fmt="{:g}"):
    """Rows of labelled dots; a label too close to its neighbour goes below the line."""
    for r, (label, vals) in enumerate(rows):
        y = len(rows) - 1 - r
        ax.plot(xlim, [y, y], color=RULE, lw=1, zorder=0)
        last_above = None
        for m, v in sorted(vals.items(), key=lambda kv: kv[1]):
            mine = m == ours
            c = ACCENT if mine else GREY
            ax.scatter(v, y, s=120 if mine else 60, color=c, zorder=3)
            above = last_above is None or v - last_above >= gap
            ax.text(v, y + (0.12 if above else -0.12), f"{m}\n{fmt.format(v)}" if above else f"{fmt.format(v)}\n{m}",
                    ha="center", va="bottom" if above else "top", fontsize=9.5,
                    color=ACCENT if mine else MUTED, fontweight="bold" if mine else "normal")
            if above:
                last_above = v
    ax.set_yticks(range(len(rows)))
    ax.set_yticklabels([lab for lab, _ in rows][::-1], fontsize=10)
    ax.tick_params(axis="y", length=0)
    ax.spines["left"].set_visible(False)
    ax.set_xlim(*xlim)
    ax.set_ylim(-0.75, len(rows) - 0.2)


def headline_gemello():
    # §4.5: energy accuracy (%) on HVAC and fridge; FHMM and LBM need 15-minute power from each home.
    acc = {"FHMM": (61, 39), "LBM": (56, 72), "Gemello": (76, 69)}
    fig, axes = two_panels()
    legend_bars(axes[0], ["HVAC", "Fridge"], list(acc), [acc[m] for m in acc], "Score", (0, 110))
    ax = axes[1]
    ax.set_title("After: one message, labels on the points", fontsize=12.5, fontweight="bold", loc="left")
    dot_rows(ax, [("Heating and\ncooling", {m: v[0] for m, v in acc.items()}),
                  ("Fridge", {m: v[1] for m, v in acc.items()})], "Gemello", (35, 82), 8, "{:g}%")
    ax.set_xlabel("Energy accuracy (%)  →  better")
    ax.text(82, 1.75, "Gemello: one reading a month\nothers: one every 15 minutes", fontsize=9.5,
            color=MUTED, ha="right", va="top", style="italic")
    tidy(fig, axes, "headline-gemello")


THERMEVAL_DOUBLE = [  # Table 4, Task 5 "Double": (model, parameters in billions, accuracy)
    ("SMOL-256M", 0.3, .54), ("Jina-VLM", 2, .43), ("ChartGemma", 3, .52), ("TinyCharts", 3, .52),
    ("PaliGemma-2", 3, .66), ("Phi-3", 4, .44), ("Phi-3.5", 4, .48), ("ChartInstruct", 7, .48),
    ("LLaVA-1.5", 7, .54), ("IDEFICS-3", 8, .40), ("Qwen-VL 2", 8, .55), ("Qwen-VL 2.5", 8, .60),
    ("Intern-VL 3", 8, .49), ("MiniCPM-V 2.6", 8, .56), ("BLIP-2", 8, .51), ("LLaMA-3.2", 11, .60),
    ("Intern-VL 3", 15, .46), ("Qwen-VL 2.5", 33, .53), ("Intern-VL 3", 38, .64), ("Qwen A22", 235, .48)]
THERMEVAL_CLOSED = [("Gemini 2.5 Flash", .54), ("Gemini 2.5 Pro", .57), ("Gemini 3 Flash", .55), ("Gemini 3 Pro", .74)]


def headline_thermeval():
    fig, axes = two_panels()
    ax = axes[0]
    names = [f"{m} {p:g}B" for m, p, _ in THERMEVAL_DOUBLE] + [m for m, _ in THERMEVAL_CLOSED]
    vals = [a for _, _, a in THERMEVAL_DOUBLE] + [a for _, a in THERMEVAL_CLOSED]
    order = sorted(range(len(names)), key=lambda i: names[i])
    cmap = plt.get_cmap("tab20")
    ax.bar(range(len(order)), [vals[i] for i in order], color=[cmap(k % 20) for k in range(len(order))])
    ax.set_xticks(range(len(order)))
    ax.set_xticklabels([names[i] for i in order], rotation=90, fontsize=6.5)
    ax.set_ylabel("Acc")
    ax.set_ylim(0, 1)
    ax.set_title("Before: 24 bars in alphabetical order", fontsize=12.5, fontweight="bold", loc="left")

    ax = axes[1]
    ax.set_title("After: size does not buy thermal reasoning", fontsize=12.5, fontweight="bold", loc="left")
    xs = [p for _, p, _ in THERMEVAL_DOUBLE]
    ax.scatter(xs, [a for _, _, a in THERMEVAL_DOUBLE], s=40, color=GREY, zorder=3)
    ax.axhline(.84, color=INK, lw=1.2)
    ax.text(0.28, .855, "people, 84%", fontsize=10, color=INK, va="bottom")
    ax.axhline(.50, color=MUTED, lw=1.0, ls=(0, (4, 3)))
    ax.text(0.28, .485, "chance, 50%", fontsize=10, color=MUTED, va="top")
    ax.text(235, .455, "Qwen 235B", fontsize=9, color=MUTED, ha="center", va="top")
    gx = 900  # a strip for models whose size is not disclosed
    ax.axvspan(500, 1600, color=SOFT, zorder=0)
    ax.text(gx, .36, "size not\ndisclosed", fontsize=8.5, color=MUTED, ha="center", va="bottom")
    for m, a in THERMEVAL_CLOSED:
        top = m == "Gemini 3 Pro"
        ax.scatter(gx, a, s=110 if top else 40, color=ACCENT if top else GREY, zorder=4)
    ax.text(gx * 0.8, .74, "best model\n74%", fontsize=9.5, color=ACCENT, fontweight="bold", ha="right", va="center")
    ax.set_xscale("log")
    ax.set_xlim(0.2, 1600)
    ax.set_ylim(.35, .92)
    ax.set_xticks([0.3, 1, 10, 100])
    ax.set_xticklabels(["0.3B", "1B", "10B", "100B"])
    ax.minorticks_off()
    ax.set_xlabel("Model size (parameters, log scale)")
    ax.set_ylabel("Which of two people is hotter? (accuracy)")
    tidy(fig, axes, "headline-thermeval")


def headline_jouleseye():
    # Figure 9: calorie error (MAPE %, lower is better) by input; the watch is the Apple Watch's own estimate.
    inputs = [("Smartwatch estimate", 37.6, "watch"), ("Heart rate (watch)", 12.0, "hr"), ("Heart rate (true)", 10.2, "hr"),
              ("Breathing (camera)", 5.8, "rr"), ("Breathing + heart rate", 5.5, "rr"),
              ("Breathing + heart rate + temperature", 5.2, "rr"), ("Breathing (true)", 5.0, "rr")]
    fig, axes = two_panels()
    ax = axes[0]
    ax.bar(range(len(inputs)), [v for _, v, _ in inputs], color=RAINBOW[:len(inputs)])
    ax.set_xticks(range(len(inputs)))
    ax.set_xticklabels([f"I{i + 1}" for i in range(len(inputs))])
    ax.set_ylabel("MAPE")
    from matplotlib.patches import Patch
    ax.legend(handles=[Patch(color=RAINBOW[i], label=f"I{i + 1}: {n}") for i, (n, _, _) in enumerate(inputs)],
              fontsize=8.5, loc="upper right", frameon=False)
    ax.set_ylim(0, 45)
    ax = axes[1]
    ax.set_title("After: with breathing, error stays under 6%", fontsize=12.5, fontweight="bold", loc="left")
    rows = sorted(inputs, key=lambda r: r[1])
    for y, (n, v, kind) in enumerate(rows):
        c = ACCENT if kind == "rr" else GREY
        ax.barh(y, v, color=c, height=0.62)
        ax.text(v + 0.6, y, f"{v:g}%", va="center", fontsize=10, color=c, fontweight="bold" if kind == "rr" else "normal")
        ax.text(-0.6, y, n, va="center", ha="right", fontsize=9.5, color=INK)
    ax.set_yticks([])
    ax.spines["left"].set_visible(False)
    ax.set_xlim(0, 44)
    ax.set_xlabel("Calorie error, MAPE (%)  ←  better")
    tidy(fig, axes, "headline-jouleseye")


def headline_gdmi():
    # Case study, Madhya Pradesh, nine new sensors: RMSE greedy MI 5.6, GD-MI 5.8, MaxVar 6.3 (text).
    # All of India, 100 new sensors: GD-MI 7.1, MaxVar 7.4 (text); greedy MI was not run at this scale.
    fig, axes = two_panels()
    legend_bars(axes[0], ["One state, 9 sensors", "All India, 100 sensors"], ["Greedy MI", "GD-MI", "MaxVar"],
                [(5.6, float("nan")), (5.8, 7.1), (6.3, 7.4)], "RMSE", (0, 10))
    ax = axes[1]
    ax.set_title("After: near greedy MI, and it scales to India", fontsize=12.5, fontweight="bold", loc="left")
    dot_rows(ax, [("One state,\n9 new sensors", {"Greedy MI": 5.6, "GD-MI": 5.8, "MaxVar": 6.3}),
                  ("All of India,\n100 new sensors", {"GD-MI": 7.1, "MaxVar": 7.4})], "GD-MI", (5.3, 7.7), 0.3)
    ax.text(5.6, 0, "greedy MI\nnot run here", fontsize=9, color=MUTED, ha="center", va="center", style="italic")
    ax.set_xlabel("Error, RMSE of PM2.5  ←  better")
    tidy(fig, axes, "headline-gdmi")


# 6. Method: intuition, then questions, then the same four beats per step, for every paper --
METHODS_TEXT = {
    "gemello": ("Similar homes use similar energy. For each appliance, we find a home's metered twins and average their use.",
                ["What describes a home?", "Which homes are its twins?", "How do we combine them?"]),
    "thermeval": ("Reading heat is a chain of steps. We test each link alone, so a failure shows where the chain breaks.",
                  ["Is it a thermal image?", "Can it read the colour bar?", "Can it reason about heat?"]),
    "jouleseye": ("Each breath warms and cools the nostrils. A thermal camera sees it, and the breathing rate predicts calories.",
                  ["Where are the nostrils?", "How fast is the breathing?", "How many calories is that?"]),
    "gdmi": ("Sensor coordinates are parameters. We move all of them at once, downhill on predicted uncertainty.",
             ["What would each sensor read?", "How uncertain is the map?", "Which way should it move?"]),
    "kestrel": ("Each phone colours the sound in its own way. We learn that colour and remove it.",
                ["What distorts the audio?", "How do we undo it?", "When do we trust it?"]),
}


def method(paper, intuition, qs):
    fig, ax = canvas(10, 5.0)
    box(ax, 0.03, 0.80, 0.94, 0.15, fc=SOFT, ec=MUTED)
    ax.text(0.05, 0.905, "Intuition first", fontsize=12, fontweight="bold", va="center")
    ax.text(0.05, 0.845, f"“{intuition}”", fontsize=10.5, va="center")
    for i, q in enumerate(qs):
        x = 0.03 + i * 0.32
        box(ax, x, 0.57, 0.30, 0.15, fc=PAPER, ec=MUTED)
        ax.text(x + 0.015, 0.685, f"Step {i + 1}", fontsize=9.5, color=MUTED, va="center")
        ax.text(x + 0.015, 0.615, q, fontsize=11, fontweight="bold", va="center")
        arrow(ax, (0.50, 0.80), (x + 0.15, 0.725), color=MUTED, lw=1.0, ms=9)
    ax.text(0.03, 0.50, "Inside every step, the same four beats:", fontsize=11, color=MUTED, style="italic")
    beats = [("Why", "one sentence on what\nthe step is for"),
             ("Toy example", "2–4 sentences with\nreal (small) numbers"),
             ("How", "short bullets and\none equation"),
             ("Guarantee", "one plain sentence;\nthe proof goes elsewhere")]
    for i, (h, t) in enumerate(beats):
        x = 0.03 + i * 0.24
        box(ax, x, 0.08, 0.21, 0.34, fc=PAPER, ec=ACCENT if i == 1 else MUTED, lw=1.6)
        ax.text(x + 0.105, 0.34, h, fontsize=12.5, fontweight="bold", ha="center", va="center")
        ax.text(x + 0.105, 0.19, t, fontsize=10.5, ha="center", va="center", linespacing=1.4)
        if i < 3:
            arrow(ax, (x + 0.215, 0.25), (x + 0.235, 0.25), color=MUTED, lw=1.2, ms=10)
    save(fig, f"method-steps-{paper}")


# 7. A paper timeline, planned backwards from the deadline -------------------------------
def timeline():
    tasks = [  # (label, start week, end week); 0 = deadline
        ("Abstract (7–8 lines) and title", -8, -7),
        ("Figure and table sketches", -8, -6),
        ("Experiments", -8, -3),
        ("Full first draft", -6, -3),
        ("Internal review: adviser + one peer", -3, -2),
        ("Revise; fill evidence gaps", -2, -1),
        ("Checklist: pages, anonymity, refs", -1, 0),
    ]
    fig, ax = plt.subplots(figsize=(10, 3.9))
    for i, (t, s, e) in enumerate(tasks):
        c = ACCENT if "review" in t or "Checklist" in t else (GREY if t == "Experiments" else INK)
        ax.barh(i, e - s, left=s, height=0.55, color=c, alpha=0.9 if c != INK else 0.75)
        ax.text(-8.25, i, t, ha="right", va="center", fontsize=10.5)
    ax.axvline(0, color=ACCENT, lw=2)
    ax.text(0.1, -0.85, "deadline", color=ACCENT, fontsize=10.5, fontweight="bold", va="center")
    ax.axvline(-3, color=MUTED, lw=1, ls=(0, (4, 3)))
    ax.text(-3.1, -0.85, "results frozen", color=MUTED, fontsize=10, va="center", ha="right")
    ax.set_yticks([])
    ax.set_ylim(len(tasks) - 0.2, -1.2)
    ax.set_xlim(-12.6, 0.9)
    ax.set_xticks(range(-8, 1))
    ax.set_xticklabels([f"{w}" if w else "0" for w in range(-8, 1)])
    ax.set_xlabel("Weeks before the deadline")
    for s in ("top", "right", "left"):
        ax.spines[s].set_visible(False)
    fig.tight_layout()
    save(fig, "timeline")


if __name__ == "__main__":
    skeleton()
    for paper, texts in PARAGRAPHS.items():
        paragraph(paper, *texts)
    st = lengths()
    colour_code()
    headline()
    for paper, (intuition, qs) in METHODS_TEXT.items():
        method(paper, intuition, qs)
    headline_gemello()
    headline_thermeval()
    headline_jouleseye()
    headline_gdmi()
    timeline()
    for paper, d in st.items():
        for k, (n, tot, med, mx) in d.items():
            print(f"{paper} {k}: {n} sentences, {tot} words, median {med}, longest {mx}")
