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
    for paper, (intuition, qs) in METHODS_TEXT.items():
        method(paper, intuition, qs)
    timeline()
    for paper, d in st.items():
        for k, (n, tot, med, mx) in d.items():
            print(f"{paper} {k}: {n} sentences, {tot} words, median {med}, longest {mx}")
