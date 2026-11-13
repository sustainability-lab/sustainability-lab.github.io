"""Writes handbook/method-figures.qmd from one table of examples.

Run from the repository root:
    python3 _figures/writing-papers/make_method_page.py

Edit the table below, not the .qmd: the cards, the tables and the counts all come from it.
Figure crops are in images/handbook/writing-papers/method/ (crop boxes: method_crops.json).
"""
from collections import OrderedDict
from pathlib import Path

GROUPS = OrderedDict([
    ("pipeline", ("What happens to one input?", "walk", "Your novelty is a new sequence of steps. Follow one example through all of them.")),
    ("architecture", ("What is it made of?", "parts", "Your novelty is a new model. Draw its parts, and mark the new ones.")),
    ("component", ("What is the new piece?", "piece", "Your novelty is one piece inside a known model. Draw only that piece.")),
    ("alternatives", ("How does it differ from what came before?", "diff", "Your novelty is a choice among known designs. Draw them side by side, yours last.")),
    ("training", ("How does it learn?", "learn", "Your novelty is how the model is trained. Draw what the objective compares.")),
    ("intuition", ("Why should it work?", "why", "Your idea needs an intuition first. Draw a toy case in two dimensions.")),
])
C = "© the authors"
# The page as a film (sustain-social/MethodFiguresFilm), embedded under the introduction.
FILM = '```{=html}\n<figure style="margin:1.4rem 0 1.8rem;max-width:760px">\n<div style="aspect-ratio:16/9;background:#151816"><iframe src="https://www.youtube-nocookie.com/embed/D62npQIxqWA?rel=0" title="Making Method Figures: the film" referrerpolicy="strict-origin-when-cross-origin" style="width:100%;height:100%;border:0;display:block" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen></iframe></div>\n<figcaption style="font-size:.86rem;color:var(--muted);margin-top:.45rem">This page as a short film (9 minutes) · <a href="https://youtu.be/D62npQIxqWA">open on YouTube</a></figcaption>\n</figure>\n```\n'
E = []
def add(key, group, name, venue, arxiv, fig, page, wide, real, why, borrow, alt, credit, watch=None, url=None):
    E.append(dict(key=key, group=group, name=name, venue=venue, url=url or f"https://arxiv.org/abs/{arxiv}", fig=fig, page=page, wide=wide,
                  real=real, why=why, borrow=borrow, alt=alt, credit=credit, watch=watch))

add("nerf", "pipeline", "NeRF", "ECCV 2020", "2003.08934", 2, 5, True, True,
    "One scene runs through four lettered panels, and the caption walks from (a) to (d) in the same order.",
    "Letter the stages, and reuse the letters in the caption and the text.",
    "Four panels lettered a to d: points sampled along camera rays through a scene, a small network giving colour and density, curves of density along two rays, and a loss against the true pixel.", f"Mildenhall et al. {C}")
add("yolo", "pipeline", "YOLO", "CVPR 2016", "1506.02640", 2, 2, False, True,
    "One photo becomes a grid, then boxes and a class map in parallel, then the final detections. Every stage is a picture of the data.",
    "Show the data at each stage, not the name of the stage.",
    "A photo of a dog and a bicycle with a grid on it; in parallel, the same photo with many boxes and a coloured class map; then the photo with three final boxes.", f"Redmon et al. {C}")
add("graphsage", "pipeline", "GraphSAGE", "NeurIPS 2017", "1706.02216", 1, 2, True, False,
    "Three numbered steps on the same small graph. Colour shows which nodes each step touches.",
    "Use one toy example, redrawn at every step.",
    "The same small graph three times: a neighbourhood is sampled around a red node, features flow inward along coloured edges, and the red node's label is predicted.", f"Hamilton et al. {C}")
add("gencast", "pipeline", "GenCast", "Nature 2024", "2312.15796", 1, 2, False, True,
    "Real weather states sit at every node. Noise is refined into a forecast, and that forecast feeds the next step. A blue box isolates one step.",
    "Shade one pass of a loop, then show it repeating.",
    "Columns of globes showing weather states. In each column a noisy globe is refined step by step into a forecast, which is passed along a time axis to the next column. The first column is shaded blue.", "Price et al. CC BY 4.0")

add("rag", "pipeline", "RAG", "NeurIPS 2020", "2005.11401", 1, 2, True, True,
    "Three real questions go in on the left and their answers come out on the right. Two rounded boxes group the retriever and the generator, and a dashed arrow on top shows what is trained end to end.",
    "Group the boxes into the two or three parts that your text names.",
    "Example questions on the left enter a query encoder; a retriever finds documents in an index; a generator reads them and produces the answers shown on the right. A dashed arrow across the top is labelled end-to-end backprop.", f"Lewis et al. {C}",
    "It is dense at print size.")

add("transformer", "architecture", "Transformer", "NeurIPS 2017", "1706.03762", 1, 3, False, False,
    "Colour means block type, and the same colour is the same block everywhere. \"N×\" replaces a stack of copies.",
    "Use one colour per kind of block, and a repeat mark in place of repeats.",
    "An encoder stack and a decoder stack of coloured blocks: attention in orange, feed-forward in blue, add and norm in yellow, each stack marked N times.", "Vaswani et al. Reproduced under the permission stated in the paper")
add("unet", "architecture", "U-Net", "MICCAI 2015", "1505.04597", 1, 2, True, False,
    "The layout is the idea: down one side, up the other, with skip arrows across. A legend gives each arrow colour one meaning.",
    "Give each arrow style one meaning, and say it in a legend.",
    "Blue boxes arranged in a U shape, with grey arrows crossing from the left arm to the right arm, and a legend of five arrow colours.", f"Ronneberger et al. {C}",
    "The size labels are tiny.")
add("vit", "architecture", "Vision Transformer", "ICLR 2021", "2010.11929", 1, 3, True, True,
    "The overview is on the left, with real image patches going in. The one block that needs detail is enlarged on the right.",
    "Give the overview first, then zoom into one block.",
    "Left: a photo cut into nine patches, which are embedded and fed to a transformer encoder and a classification head. Right: the encoder block drawn in detail.", f"Dosovitskiy et al. {C}")
add("sam", "architecture", "Segment Anything", "ICCV 2023", "2304.02643", 4, 5, True, True,
    "A real image goes in and real masks come out. The heavy encoder is drawn large and the light decoder small, which is the point of the design.",
    "Let the size of a box show its cost.",
    "A photo of scissors enters a large image-encoder box; a small prompt encoder takes points, a box or text; a small mask decoder gives three masks with scores.", "Kirillov et al. From the authors' repository, Apache 2.0 licence")
add("dit", "architecture", "Diffusion Transformer", "ICCV 2023", "2212.09748", 3, 3, True, False,
    "The chosen block is in full colour. The two variants that were tried are faded beside it.",
    "Fade the alternatives you tried, and keep yours in colour.",
    "Left: the overall model as a short stack. Centre: one block in full colour. Right: two alternative blocks drawn faded.", "Peebles and Xie. CC BY 4.0")
add("flamingo", "architecture", "Flamingo", "NeurIPS 2022", "2204.14198", 3, 4, True, True,
    "A two-colour key separates what is frozen from what is trained, and a real example of photos and text runs through the model.",
    "Mark the trained and the frozen parts, with a key.",
    "Two photos pass through blue vision encoders marked with snowflakes and purple resamplers into a stack of language-model blocks; a key says blue is pretrained and frozen, purple is trained from scratch.", f"Alayrac et al. {C}")

add("resnet-block", "component", "ResNet", "CVPR 2016", "1512.03385", 2, 2, False, False,
    "Two layers, one curved arrow, and symbols that match the equations. That is the whole contribution.",
    "If the novelty is one connection, draw one connection.",
    "Two weight layers in a column, with a curved arrow carrying the input x around them to an addition.", f"He et al. {C}")
add("controlnet", "component", "ControlNet", "ICCV 2023", "2302.05543", 2, 3, False, False,
    "Before and after, side by side. The original block is grey and locked, and everything that was added is blue.",
    "Draw \"before\" in grey, and add your part in one colour.",
    "Left, before: one grey network block. Right, after: the same block locked, beside a blue trainable copy joined by two zero-convolution layers.", f"Zhang et al. {C}")
add("lora", "component", "LoRA", "ICLR 2022", "2106.09685", 1, 1, False, False,
    "Blue is frozen and orange is trained. The orange shapes narrow to r, the low rank.",
    "Let a shape show the key quantity.",
    "A blue square of pretrained weights beside two orange trapezoids, A and B, that narrow to a small width r between them.", f"Hu et al. {C}")

add("dropout", "component", "Dropout", "JMLR 2014", None, 1, 2, True, False,
    "The same network twice: complete on the left, and with crossed-out units on the right. It needs no equation.",
    "Show the same thing before and after your change.",
    "Two small neural networks side by side. The left one is fully connected. In the right one several units are crossed out and their connections are gone.", f"Srivastava et al. {C}",
    url="https://jmlr.org/papers/v15/srivastava14a.html")

add("efficientnet-scaling", "alternatives", "EfficientNet", "ICML 2019", "1905.11946", 2, 2, True, False,
    "A baseline, three ways to scale one dimension, and then ours, all drawn with the same shapes.",
    "Line up the alternatives, and put yours last.",
    "Five network sketches: a baseline, a wider one, a deeper one, a higher-resolution one, and one scaled in all three ways.", f"Tan and Le. {C}")
add("fpn", "alternatives", "Feature Pyramid Networks", "CVPR 2017", "1612.03144", 1, 1, False, False,
    "Four pyramid designs in one drawing style. Thicker outlines mean stronger features, so the reader sees what each design lacks.",
    "Use one drawing style for every alternative, and one cue for quality.",
    "Four small diagrams of stacked feature maps with predict arrows, lettered a to d; the fourth, the paper's own, has thick outlines at every level.", f"Lin et al. {C}")
add("convnext", "alternatives", "ConvNeXt", "CVPR 2022", "2201.03545", 4, 5, False, False,
    "Three blocks side by side, with every layer and size written out. The reader can count the differences.",
    "For a change inside a block, put the blocks next to each other at one scale.",
    "Three block diagrams side by side, labelled Swin Transformer block, ResNet block and ConvNeXt block, each a column of layers with their sizes.", "Liu et al. CC BY 4.0")
add("timellm", "alternatives", "Time-LLM", "ICLR 2024", "2310.01728", 1, 3, True, False,
    "Three ways to adapt a model to time series, (a) to (c), with a flame on trained parts and a snowflake on frozen ones.",
    "Place your approach in a row with the existing ones.",
    "Three small panels: task-specific learning, model fine-tuning, and model reprogramming, with icons for frozen and fine-tuned parts and a list of benefits.", "Jin et al. CC BY 4.0",
    "Its icons and labels are small.")

add("tot", "alternatives", "Tree of Thoughts", "NeurIPS 2023", "2305.10601", 1, 2, True, False,
    "Four ways to prompt a language model, drawn with the same boxes, from one straight line to a tree. Ours is the last panel, and green marks the path that is kept.",
    "Draw the earlier methods as simpler versions of yours.",
    "Four panels from input to output: a single arrow, a chain of boxes, several chains with a majority vote, and a tree of boxes in which a green path leads to the output.", "Yao et al. CC BY 4.0")

add("cyclegan-model", "training", "CycleGAN", "ICCV 2017", "1703.10593", 3, 3, True, False,
    "(a) shows the two mappings. (b) and (c) show one sample going round the loop and landing near where it started.",
    "To explain a loss, draw what it compares.",
    "Three panels: two domains X and Y joined by mappings G and F; a sample sent from X to Y and back, with the gap marked as cycle-consistency loss; and the reverse.", f"Zhu et al. {C}")
add("simclr", "training", "SimCLR", "ICML 2020", "2002.05709", 2, 2, False, False,
    "One image, two views, two branches, and one arrow labelled \"Maximize agreement\". Every symbol is used in the text.",
    "Label the figure with the paper's own symbols.",
    "An image x is augmented into two views, each passed through an encoder f and a head g, with a double arrow between the two outputs labelled maximize agreement.", f"Chen et al. {C}")
add("bert", "training", "BERT", "NAACL 2019", "1810.04805", 1, 3, True, False,
    "Pre-training and fine-tuning are drawn as the same model twice, so the reader sees that only the inputs and outputs change.",
    "Draw the two phases side by side, with the same shapes.",
    "Two copies of the same model, labelled pre-training and fine-tuning, with different inputs below and different outputs above.", f"Devlin et al. {C}")
add("satclip", "training", "SatCLIP", "AAAI 2025", "2311.17179", 2, 4, True, True,
    "Pretraining is on the left and use is on the right, with real satellite tiles and coordinates. Each encoder keeps its colour across both halves.",
    "Show how it is trained and how it is used, in one figure.",
    "Left: a globe with satellite tiles and their coordinates feeding an image encoder and a location encoder with a contrastive objective. Right: the location encoder reused for a downstream task.", "Klemmer et al. CC BY 4.0")

add("lime-toy", "intuition", "LIME", "KDD 2016", "1602.04938", 3, 4, False, False,
    "A toy in two dimensions: a wiggly decision boundary, one point to explain, and a straight dashed line that fits only nearby.",
    "Draw the idea in two dimensions before the real pipeline.",
    "A pink and blue region with a wiggly boundary, a bold red cross for the point being explained, nearby samples sized by closeness, and a straight dashed line.", f"Ribeiro et al. {C}")
add("node2vec", "intuition", "node2vec", "KDD 2016", "1607.00653", 2, 4, False, False,
    "Five nodes are enough. The walk has just moved from t to v, and each possible next edge carries its bias.",
    "Use the smallest example that shows the rule.",
    "Five nodes: t, v and three neighbours of v. Each edge out of v is labelled with a weight: one over p, one, or one over q.", f"Grover and Leskovec. {C}")
add("maml", "intuition", "MAML", "ICML 2017", "1703.03400", 1, 2, False, False,
    "One curve and three dashed lines: the parameters move to a point from which each task's optimum is one short step away.",
    "A sketch of the geometry can explain an algorithm faster than its pseudocode.",
    "A thick curve labelled theta ends at a point. Three grey arrows show the gradients of three task losses, and three dashed lines lead from the point to three nearby optima. A key separates meta-learning from adaptation.", f"Finn et al. {C}")

add("scoresde", "intuition", "Score-based SDEs", "ICLR 2021", "2011.13456", 1, 2, True, True,
    "The equations and the picture are stacked. A photo dissolves into noise along the top arrow and comes back along the bottom one.",
    "Put the equation next to what it does.",
    "A forward equation above a strip of images in which a dog dissolves into noise, and a reverse equation below, with the score term boxed.", f"Song et al. {C}")

# Opening sentence of each figure's own caption, checked against the paper. "…" marks a cut.
CAP = {
 "nerf": "An overview of our neural radiance field scene representation and differentiable rendering procedure.",
 "yolo": "The Model.",
 "graphsage": "Visual illustration of the GraphSAGE sample and aggregate approach.",
 "gencast": "Schematic of how GenCast produces a forecast.",
 "rag": "Overview of our approach.",
 "transformer": "The Transformer - model architecture.",
 "unet": "U-net architecture (example for 32x32 pixels in the lowest resolution).",
 "vit": "Model overview.",
 "sam": "Segment Anything Model (SAM) overview.",
 "dit": "The Diffusion Transformer (DiT) architecture.",
 "flamingo": "Flamingo architecture overview.",
 "resnet-block": "Residual learning: a building block.",
 "controlnet": "A neural block takes a feature map x as input and outputs another feature map y, as shown in (a).",
 "lora": "Our reparametrization.",
 "dropout": "Dropout Neural Net Model.",
 "efficientnet-scaling": "Model Scaling.",
 "fpn": "(a) Using an image pyramid to build a feature pyramid.",
 "convnext": "Block designs for a ResNet, a Swin Transformer, and a ConvNeXt.",
 "timellm": "Schematic illustration of reprogramming large language models (LLMs) in comparison of (a) task-specific learning and (b) model fine-tuning.",
 "tot": "Schematic illustrating various approaches to problem solving with LLMs.",
 "cyclegan-model": "(a) Our model contains two mapping functions G: X → Y and F: Y → X, and associated adversarial discriminators …",
 "simclr": "A simple framework for contrastive learning of visual representations.",
 "bert": "Overall pre-training and fine-tuning procedures for BERT.",
 "satclip": "The SatCLIP pretraining and deployment pipeline.",
 "lime-toy": "Toy example to present intuition for LIME.",
 "node2vec": "Illustration of the random walk procedure in node2vec.",
 "maml": "Diagram of our model-agnostic meta-learning algorithm (MAML), which optimizes for a representation θ that can quickly adapt to new tasks.",
 "scoresde": "Solving a reverse-time SDE yields a score-based generative model.",
}
assert set(CAP) == {e["key"] for e in E}
labels = sum(len(CAP[e["key"]].split()) <= 5 for e in E)
N = len(E)
assert N == 28 and all(e["group"] in GROUPS for e in E)
FIELD = {"nerf": "vision", "yolo": "vision", "graphsage": "graphs", "gencast": "weather", "rag": "language models",
         "transformer": "language", "unet": "medical imaging", "vit": "vision", "sam": "vision", "dit": "image generation",
         "flamingo": "vision and language", "resnet-block": "vision", "controlnet": "image generation", "lora": "language models",
         "dropout": "classic ML", "efficientnet-scaling": "vision", "fpn": "vision", "convnext": "vision", "timellm": "time series",
         "tot": "language models", "cyclegan-model": "image generation", "simclr": "vision", "bert": "language",
         "satclip": "remote sensing", "lime-toy": "classic ML", "node2vec": "graphs", "maml": "classic ML", "scoresde": "generative models"}
assert set(FIELD) == {e["key"] for e in E}
fig1 = sum(e["fig"] == 1 for e in E)
fig12 = sum(e["fig"] <= 2 for e in E)
real = sum(e["real"] for e in E)
pages = sorted(e["page"] for e in E)
late = sum(2 <= e["page"] <= 5 for e in E)
link = lambda k: next(f"[{e['name']}](#{e['key']})" for e in E if e["key"] == k)
grp = lambda g: ", ".join(f"[{e['name']}](#{e['key']})" for e in E if e["group"] == g)
IMG = "../images/handbook/writing-papers/method/"

CSS = '''```{=html}
<style>
/* No child combinators here: Quarto escapes them inside page styles. */
.hf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px 20px; grid-auto-flow: dense; margin: 1rem 0 2.2rem; align-items: start; }
.hf { border-top: 3px solid var(--accent); padding-top: .6rem; min-width: 0; scroll-margin-top: 90px; }
.hf.wide { grid-column: 1 / -1; }
.hf p { margin: 0 0 .35rem; font-size: .93rem; line-height: 1.45; }
.hf .hd { font-size: 1rem; }
.hf .cap { display: block; font-size: .82rem; font-style: italic; color: var(--muted); margin: .1rem 0 .4rem; }
.hf .meta, .hf-note { font-size: .76rem; color: var(--muted); }
.hf img { display: block; width: 100%; max-height: 560px; object-fit: contain; background: #fff; border: 1px solid var(--rule); margin: .45rem 0 .5rem; }
/* Dark mode: never invert. The figures hold photos, and their colours carry meaning. Only soften the white. */
body.quarto-dark .hf img { filter: brightness(.88); }
.hf-scroll { overflow-x: auto; }
.hf-scroll table { font-size: .8rem; min-width: 620px; }
@media (max-width: 760px) { .hf-grid { grid-template-columns: 1fr; } }
</style>
```
'''

o = []
P = o.append
P(f"""---
title: "Making Method Figures"
description: "How to draw the figure that explains your method, with {N} method figures from top papers and what to borrow from each."
toc: true
---

{CSS}
The method figure is a separate figure from the [hero figure](hero-figures.qmd). The hero figure answers *why should I care?* The method figure answers ***how does it work?***

| | Hero figure | Method figure |
|--------|--------------------|--------------------|
| **Answers** | Why should I care? | How does it work? |
| **Sits** | On page 1 | Where the method section starts |
| **Shows** | Problem, idea, payoff | Steps, parts, and what is new |
| **Detail** | None | Enough to explain the idea back, not to rewrite the code |

A method figure can answer six different questions. Pick the one where your novelty lives. This page shows {N} method figures from NeurIPS, ICML, ICLR, CVPR, ICCV, ECCV, KDD, AAAI, NAACL, MICCAI, JMLR and Nature, grouped by that question. They cover vision, language models, graphs, time series, weather, remote sensing and classic machine learning.

{FILM}
## Choose the question

| Your novelty is | The figure answers | Draw | See |
|--------------|----------------|-------------------|-----------|
| A new sequence of steps | What happens to one input? | One example, shown at every step | {grp('pipeline')} |
| A new model | What is it made of? | The parts, with the new ones marked | {grp('architecture')} |
| One piece in a known model | What is the new piece? | Only that piece, before and after | {grp('component')} |
| A choice among known designs | How does it differ? | The alternatives side by side, yours last | {grp('alternatives')} |
| A new way to train | How does it learn? | What the objective compares | {grp('training')} |
| An idea that needs intuition | Why should it work? | A toy case in two dimensions | {grp('intuition')} |

**Our default for an applied paper:** one real example followed through every step, with the new step in colour and everything standard in grey. If the novelty is one block, add a second, small figure of only that block.
""")

for g, (title, _, when) in GROUPS.items():
    P(f"## {title}\n\n{when}\n\n::: {{.hf-grid}}")
    for e in [x for x in E if x["group"] == g]:
        wide = " .wide" if e["wide"] else ""
        col = "full width" if e["wide"] else "one column"
        data = "real data" if e["real"] else "schematic"
        watch = f" **Watch out:** {e['watch']}" if e["watch"] else ""
        P(f"::: {{.hf{wide} #{e['key']}}}")
        P(f"[**{e['name']}** · {e['venue']} · [paper]({e['url']})]{{.hd}}\n")
        P(f"![]({IMG}{e['key']}.webp){{fig-alt=\"{e['alt']}\" loading=\"lazy\"}}\n")
        P(f"[{FIELD[e['key']]} · Figure {e['fig']} · page {e['page']}, {col} · {data}]{{.meta}}\n")
        P(f"[Its caption opens: “{CAP[e['key']]}”]{{.cap}}\n")
        P(f"{e['why']}\n")
        P(f"**Borrow:** {e['borrow']}{watch}\n")
        P(f"[{e['credit']}.]{{.meta}}")
        P(":::")
    P(":::\n")

P(f"""## What the {N} have in common

- **It sits with the method.** {late} of {N} are on pages 2 to 5, where the method is first described.
- **It can double as the hero.** In {fig1} of {N} it is Figure 1: those papers have no separate hero figure. If your idea *is* the method, one figure can do both jobs.
- **It is a schematic.** Only {real} of {N} show real data, against 20 of 24 hero figures. The ones that do, such as NeRF, YOLO and Segment Anything, are the easiest to follow.
- **Colour and shape mean something.** Frozen against trained, old against new, one colour per kind of block. The best ones give each colour one meaning.
- **Its caption is often only a label.** {labels} of {N} open with a title such as "Model overview." A sentence that says what the method does, as ControlNet's and MAML's do, helps the reader more.
- **It leaves things out.** "N×" stands for a stack, a zoom stands for the detail, and the standard parts are small or grey.

::: {{.callout-note collapse="true"}}
## All {N} on the same axes

::: {{.hf-scroll}}
| Paper | Field | Answers | Figure | Page | Width | Shows |
|--------|------|----------------|--|--|------|------|""")
for e in E:
    P(f"| [{e['name']}](#{e['key']}) | {FIELD[e['key']]} | {GROUPS[e['group']][0]} | {e['fig']} | {e['page']} | {'full' if e['wide'] else 'column'} | {'real data' if e['real'] else 'schematic'} |")
P(""":::
:::

## Make your own

1. **Choose the question,** from the table above. One figure answers one question.
2. **Take the labels from your method section.** Use the same names and the same symbols as the text.
3. **Follow one example,** and show the data at each step, not only the name of the step.
4. **Keep one reading direction.** A solid arrow means "data flows". Use another line style for anything else, such as a loss or a gradient, and say so.
5. **Give colour one meaning:** grey for what exists, one colour for what is new. If parts are frozen and parts are trained, mark them.
6. **Letter the stages** (a), (b), (c), and reuse the letters in the caption and the section headings.
7. **Leave out what the reader knows.** Write "N×" for repeats. Put the full detail in a second figure or the appendix.
8. **Stop at about seven boxes.** If you need more, you need two figures.
9. **Build it at final width,** as a vector PDF, with text of at least 6 to 7 pt.
10. **Test it.** Give the figure and its caption to a labmate, without the method section, and ask them to explain the method back.

## Checklist

- [ ] The figure answers one question, and the caption says which.
- [ ] The new part is obvious at a glance.
- [ ] One example runs through it, and the data is visible at each step.
- [ ] Every arrow style, colour and shape has one meaning.
- [ ] Its names and symbols match the text and the equations.
- [ ] Its stages are lettered, and the caption follows the letters.
- [ ] It has about seven boxes or fewer at the top level.
- [ ] Every label is legible in the compiled PDF, and spelt correctly.

[The figures are reproduced from the cited papers for teaching and criticism only. Each belongs to its authors and publisher. If you are an author and would like a figure removed, please write to us.]{.hf-note}
""")

Path("handbook/method-figures.qmd").write_text("\n".join(o))
print("wrote handbook/method-figures.qmd:", N, "fig1", fig1, "fig<=2", fig12, "real", real, "pages 2-5", late, pages)
