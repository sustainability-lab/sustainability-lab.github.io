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


# 2. Anatomy of a paragraph ---------------------------------------------------------------
def paragraph():
    fig, ax = canvas(10, 4.8)

    def para(y0, lead, bridge, nbody):
        x, w = 0.03, 0.56
        box(ax, x, y0, w, 0.40, fc=PAPER, ec=RULE)
        ax.add_patch(Rectangle((x, y0 + 0.31), 0.008, 0.075, color=ACCENT, lw=0))
        ax.text(x + 0.02, y0 + 0.347, lead, fontsize=11.5, fontweight="bold", va="center")
        for k in range(nbody):
            ww = [0.50, 0.47, 0.51, 0.33][k % 4]
            ax.add_patch(Rectangle((x + 0.02, y0 + 0.255 - k * 0.05), ww, 0.018, color=RULE, lw=0))
        if bridge:
            ax.text(x + 0.02, y0 + 0.045, bridge, fontsize=11.5, style="italic", va="center", color=BLUE)
        return x, w

    x, w = para(0.53, "Existing bird classifiers fail on phone audio.", "So why does accuracy collapse on phones?", 4)
    para(0.04, "We find that the microphone, not the bird, causes the drop.", None, 4)
    arrow(ax, (0.47, 0.575), (0.47, 0.445), color=BLUE, lw=1.8)

    notes = [
        (0.88, ACCENT, "Lead sentence", "States the point. Read alone,\nit gives the whole paragraph."),
        (0.70, MUTED, "Body", "Backs the point: a number,\nan example, a citation."),
        (0.555, BLUE, "Bridge sentence", "Raises the question that the\nnext paragraph answers."),
        (0.39, ACCENT, "Next lead", "Answers it at once."),
    ]
    for y, c, h, t in notes:
        ax.plot([0.61, 0.64], [y, y], color=c, lw=1.4)
        ax.text(0.655, y + 0.012, h, fontsize=11.5, fontweight="bold", color=c, va="bottom")
        ax.text(0.655, y - 0.005, t, fontsize=10.5, color=INK, va="top")
    save(fig, "paragraph")


# 3. Sentence lengths: the same abstract, before and after -------------------------------
BEFORE = (
    "Bird population monitoring is an important problem in ecology which has received a lot of attention, "
    "and with the proliferation of low-cost smartphones it has become possible for large numbers of volunteers "
    "to record bird vocalisations, although the resulting recordings are noisy and labelled data for most species is scarce. "
    "Existing approaches, which are mostly based on deep convolutional networks trained on curated recordings, "
    "have been shown to perform well on clean audio, but it is observed that their accuracy degrades significantly "
    "when they are applied to recordings collected using phones. "
    "In this paper, a novel framework called Kestrel is proposed, in which the frequency response of each device "
    "is estimated and compensated before classification is performed, and a few-shot learning strategy is employed "
    "so that new species can be added with only a small number of labelled examples. "
    "Extensive experiments were conducted on a large dataset and it is shown that Kestrel significantly outperforms "
    "state-of-the-art baselines, which demonstrates the effectiveness of the proposed approach."
)
AFTER = (
    "Bird counts tell ecologists how habitats change. "
    "Volunteers now record birdsong on cheap phones, at a scale no survey team can match. "
    "But phone audio is noisy, and most species have only a handful of labelled calls. "
    "Existing classifiers need hundreds of clean calls per species. "
    "On phone audio, their accuracy drops from 91% to 54%. "
    "We find that the phone's microphone, not the bird, causes most of this drop. "
    "We present Kestrel, which learns to undo each phone's microphone before it classifies a call. "
    "Kestrel needs only five labelled calls to add a new species. "
    "We test it on 12,000 clips from 40 phone models and 150 species, against six baselines. "
    "Kestrel reaches 83% accuracy on phone audio, against 61% for the best baseline. "
    "That baseline needs a hundred labelled calls per species; Kestrel needs five. "
    "Cheap phones can thus support bird surveys at scale. "
    "Kestrel still fails on overlapping calls, which we leave to future work."
)


def sentence_lengths(text):
    sents = [s for s in re.split(r"(?<=[.!?])\s+", text.strip()) if s]
    return [len(s.split()) for s in sents]


def lengths():
    b, a = sentence_lengths(BEFORE), sentence_lengths(AFTER)
    stats = {"before": (len(b), sum(b), statistics.median(b), max(b)),
             "after": (len(a), sum(a), statistics.median(a), max(a))}
    fig, axes = plt.subplots(1, 2, figsize=(10, 3.8), sharey=True,
                             gridspec_kw={"width_ratios": [len(b) + 2, len(a) + 2]})
    for ax, L, name, col in [(axes[0], b, "Before", GREY), (axes[1], a, "After", BLUE)]:
        ax.axhspan(10, 20, color=SOFT, zorder=0)
        ax.axhline(25, color=ACCENT, lw=1.2, ls=(0, (4, 3)))
        ax.bar(range(1, len(L) + 1), L, color=col, width=0.7, zorder=2)
        n, tot, med, mx = len(L), sum(L), statistics.median(L), max(L)
        ax.set_title(f"{name}: {n} sentences, {tot} words\nmedian {med:g} words, longest {mx}",
                     fontsize=11.5, loc="left", color=INK)
        ax.set_xticks(range(1, len(L) + 1))
        ax.set_xlabel("Sentence")
        for s in ("top", "right"):
            ax.spines[s].set_visible(False)
    axes[0].set_ylabel("Words in sentence")
    axes[0].set_ylim(0, 62)
    axes[1].text(len(a) + 0.6, 25.8, "upper limit (~25)", color=ACCENT, fontsize=10, ha="right", va="bottom")
    axes[1].text(len(a) + 0.6, 15, "aim: 10–20", color=MUTED, fontsize=10, ha="right", va="center")
    fig.tight_layout()
    save(fig, "sentence-lengths")
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


def headline():
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
    ax.scatter(OURS[1], OURS[2], s=190, marker="*", color=BLUE, zorder=4, ec=INK, lw=0.6)
    ax.text(OURS[1] - 1.2, OURS[2] * 1.35, "Kestrel", fontsize=11.5, fontweight="bold", color=BLUE, ha="right")
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
    save(fig, "headline")


# 6. Method: intuition, then questions, then the same four beats per step ---------------
def method():
    fig, ax = canvas(10, 5.0)
    box(ax, 0.03, 0.80, 0.94, 0.15, fc=SOFT, ec=MUTED)
    ax.text(0.05, 0.905, "Intuition first", fontsize=12, fontweight="bold", va="center")
    ax.text(0.05, 0.845, "One picture in 3–5 sentences: “Each phone colours the sound in its own way. "
            "We learn that colour and remove it.”", fontsize=10.5, va="center")
    qs = ["What distorts the audio?", "How do we undo it?", "When do we trust it?"]
    for i, q in enumerate(qs):
        x = 0.03 + i * 0.32
        box(ax, x, 0.58, 0.30, 0.13, fc=PAPER, ec=MUTED)
        ax.text(x + 0.015, 0.645, f"Step {i + 1}", fontsize=10, color=MUTED, va="center")
        ax.text(x + 0.085, 0.645, q, fontsize=11, fontweight="bold", va="center")
        arrow(ax, (0.50, 0.80), (x + 0.15, 0.715), color=MUTED, lw=1.0, ms=9)
    ax.text(0.03, 0.50, "Inside every step, the same four beats:", fontsize=11, color=MUTED, style="italic")
    beats = [("Why", "one sentence on what\nthe step is for", ORANGE),
             ("Toy example", "2–4 sentences with\nreal (small) numbers", PURPLE),
             ("How", "short bullets and\none equation", BLUE),
             ("Guarantee", "one plain sentence;\nthe proof goes elsewhere", GREEN)]
    for i, (h, t, c) in enumerate(beats):
        x = 0.03 + i * 0.24
        box(ax, x, 0.08, 0.21, 0.34, fc=PAPER, ec=c, lw=2.0)
        ax.text(x + 0.105, 0.34, h, fontsize=12.5, fontweight="bold", ha="center", va="center")
        ax.text(x + 0.105, 0.19, t, fontsize=10.5, ha="center", va="center", linespacing=1.4)
        if i < 3:
            arrow(ax, (x + 0.215, 0.25), (x + 0.235, 0.25), color=MUTED, lw=1.2, ms=10)
    save(fig, "method-steps")


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
        c = BLUE if "review" in t or "Checklist" in t else (GREY if t == "Experiments" else INK)
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
    paragraph()
    st = lengths()
    colour_code()
    headline()
    method()
    timeline()
    for k, (n, tot, med, mx) in st.items():
        print(f"{k}: {n} sentences, {tot} words, median {med}, longest {mx}")
