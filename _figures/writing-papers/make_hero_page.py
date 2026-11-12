"""Writes handbook/hero-figures.qmd from one table of examples.

Run from the repository root:
    python3 _figures/writing-papers/make_hero_page.py

Edit the table below, not the .qmd: the cards, the two tables and the counts all come from it.
Figure crops are in images/handbook/writing-papers/hero/ (crop boxes: hero_crops.json).
"""
from collections import Counter, OrderedDict
from pathlib import Path

Q = {"clarity": "clarity", "problem": "problem framing", "novelty": "novelty", "examples": "real examples",
     "evidence": "evidence", "hierarchy": "hierarchy", "readable": "readable in print", "independence": "stands alone"}
CLS = {"problem": "prob", "idea": "idea", "payoff": "pay", "scope": "scope"}
GROUPS = OrderedDict([
    ("problem", ("Lead with the problem", "Use this when the gap itself is your news.")),
    ("idea", ("Lead with the idea", "Use this when one idea carries the paper.")),
    ("payoff", ("Lead with the payoff", "Use this when the result speaks for itself: a new ability, or a clear win.")),
    ("scope", ("Lead with the scope", "Use this for datasets, benchmarks and papers with several contributions.")),
])

E = []
def add(key, name, venue, arxiv, layout, page, wide, real, number, q, flow, why, borrow, alt, credit, watch=None):
    E.append(dict(key=key, name=name, venue=venue, arxiv=arxiv, layout=layout, page=page, wide=wide, real=real,
                  number=number, q=q, flow=flow, leads=flow[0] if key not in LEADS else LEADS[key], why=why,
                  borrow=borrow, alt=alt, credit=credit, watch=watch))

LEADS = {"swin": "idea", "3dgs": "payoff", "anysat": "idea", "lime": "idea", "satlas": "scope", "chexpert": "scope", "swebench": "scope"}
C = "© the authors"

add("informer", "Informer", "AAAI 2021", "2012.07436", "plot", 1, False, "yes", "result", ["problem", "evidence"], ["problem"],
    "It measures an existing model breaking as the forecast gets longer. The new method is not even shown.",
    "If a reader may doubt the gap, plot the baseline failing.",
    "Two small plots: a short and a long forecast of one series, and an LSTM whose error rises and speed falls as the forecast lengthens.", f"Zhou et al. {C}")
add("resnet", "ResNet", "CVPR 2016", "1512.03385", "plot", 1, False, "yes", "result", ["clarity", "problem", "readable"], ["problem"],
    "Two lines per plot, named on the lines. The deeper network is worse, which nobody expects.",
    "A surprising measurement is a complete Figure 1.",
    "Two plots of error against training iterations. In both, the 56-layer curve lies above the 20-layer curve.", f"He et al. {C}")
add("cot", "Chain-of-Thought", "NeurIPS 2022", "2201.11903", "contrast pair", 1, True, "yes", "none", ["clarity", "novelty", "examples"], ["problem", "idea", "payoff"],
    "The two columns are identical except for the highlighted text, so the eye lands on the idea. ✗ becomes ✓.",
    "Hold everything fixed except your idea, and colour only that.",
    "Two columns. Standard prompting gives a wrong answer with a red cross. Chain-of-thought prompting, with highlighted reasoning, gives the right answer with a tick.", "Wei et al. CC BY 4.0")

add("clip", "CLIP", "ICML 2021", "2103.00020", "strip", 2, True, "partly", "none", ["novelty", "hierarchy", "independence"], ["idea", "payoff"],
    "Three numbered panels show how the model is trained, and then how it is used.",
    "Number the panels, and end on the use.",
    "Three numbered panels: contrastive pre-training on a grid of images against captions, building a classifier from class names, and zero-shot prediction on a photo of a dog.", "Radford et al. From the authors' repository, MIT licence")
add("mae", "MAE", "CVPR 2022", "2111.06377", "strip", 1, False, "yes", "none", ["novelty", "readable", "clarity"], ["idea", "payoff"],
    "An architecture with five elements and one real image. The big encoder takes few patches; the small decoder takes all.",
    "Draw only what is new, and let size mean something.",
    "A flamingo photo with most patches masked; the visible patches enter a large encoder; a small decoder rebuilds the full image.", "He et al. CC BY 4.0")
add("lime", "LIME", "KDD 2016", "1602.04938", "strip", 2, True, "no", "none", ["clarity", "hierarchy"], ["problem", "idea", "payoff"],
    "One patient tells the whole method, and the figure ends at the doctor who decides.",
    "End at the person who uses the output.",
    "A model predicts flu from a patient's symptoms; a magnifying glass labelled LIME highlights sneeze and headache; a doctor makes the decision.", f"Ribeiro et al. {C}",
    "Generic icons. Use a real case today.")
add("gid", "Generative Image Dynamics", "CVPR 2024", "2309.07906", "strip", 1, True, "yes", "none", ["hierarchy", "novelty"], ["idea", "payoff"],
    "The middle panel shows what the new representation looks like, where most papers put a labelled box.",
    "Replace boxes with pictures of what is inside them.",
    "A photo of a rose, then colourful motion maps at several frequencies, then a looping video and interactive dynamics shown as time slices.", f"Li et al. {C}")
add("anysat", "AnySat", "CVPR 2025", "2412.14123", "funnel", 1, False, "yes", "none", ["examples", "clarity"], ["problem", "idea", "payoff"],
    "Many real inputs, one model, many real outputs. The shape is the claim.",
    "For generality, draw the funnel and fill both ends with real samples.",
    "Five satellite datasets with different sensors and resolutions flow into one box labelled AnySat, which feeds five tasks with real output maps.", "Astruc et al. CC BY 4.0")
add("swin", "Swin Transformer", "ICCV 2021", "2103.14030", "contrast pair", 1, False, "no", "none", ["novelty", "problem", "readable"], ["idea", "problem"],
    "Ours and the nearest baseline are drawn with the same shapes, so the only difference is the contribution.",
    "Draw the baseline the same way as your method.",
    "Two stacks of feature maps. Swin has three scales and serves classification, detection and segmentation. ViT has one scale and serves classification only.", "Liu et al. CC BY 4.0")
add("yolo", "YOLO", "CVPR 2016", "1506.02640", "strip", 1, False, "yes", "none", ["clarity", "novelty"], ["idea", "payoff"],
    "The claim is simplicity, and the figure is one photo, one network and three steps.",
    "If simplicity is the point, stop at three parts.",
    "A photo of a person, a dog and a horse; one network; the same photo with a labelled box on each. Three steps are listed.", f"Redmon et al. {C}",
    "Tiny in print.")
add("llmtime", "LLMTime", "NeurIPS 2023", "2310.07820", "strip", 2, True, "yes", "result", ["novelty", "evidence", "examples"], ["idea", "payoff"],
    "Text above, numbers below, the same model between. The analogy is the idea, and two small plots pay it off.",
    "For \"treat X as Y\", draw X and Y in parallel.",
    "A language model completes a sentence and, below it, a string of numbers that is a forecast. Two small plots on the right show results.", f"Gruver et al. {C}")

add("3dgs", "3D Gaussian Splatting", "SIGGRAPH 2023", "2308.04079", "comparison row", 1, True, "yes", "result", ["evidence", "independence", "problem"], ["problem", "payoff"],
    "One scene for every method, with speed, training time and quality printed on each image.",
    "Put the numbers on the picture, and include the ground truth.",
    "Six crops of one bicycle wheel: three earlier methods, the paper's method twice, and ground truth. Each carries its frame rate, training time and PSNR.", "Kerbl et al. CC BY 4.0")
add("efficientnet", "EfficientNet", "ICML 2019", "1905.11946", "plot", 1, False, "yes", "result", ["evidence", "clarity", "readable"], ["payoff"],
    "The claim is a trade-off, so the figure is the trade-off: one red line above every named rival.",
    "Plot accuracy against cost, and label the points directly.",
    "Accuracy against number of parameters. A red line of EfficientNet models rises above dashed lines of other named models.", "Tan and Le. From the authors' repository, Apache 2.0 licence")
add("cyclegan", "CycleGAN", "ICCV 2017", "1703.10593", "gallery", 1, True, "yes", "none", ["examples", "clarity"], ["payoff"],
    "Examples anyone can judge in a second, and a two-way arrow for the method's key property.",
    "Choose examples a stranger can judge.",
    "Image pairs translated both ways: Monet and photos, zebras and horses, summer and winter. Below, one photo in four painters' styles.", f"Zhu et al. {C}")
add("pix2pix", "pix2pix", "CVPR 2017", "1611.07004", "gallery", 1, True, "yes", "none", ["examples", "hierarchy", "independence"], ["payoff"],
    "Six problems solved the same way, each as an input and an output under a two-word title.",
    "For breadth, repeat one small unit.",
    "Six input and output pairs: labels to street scene, labels to facade, black-and-white to colour, aerial to map, day to night, edges to photo.", f"Isola et al. {C}")
add("dino", "DINO", "ICCV 2021", "2104.14294", "gallery", 1, True, "yes", "none", ["independence", "examples"], ["payoff"],
    "The finding is a surprise, so the figure shows only the surprise: objects light up without any labels.",
    "Show the unexpected behaviour on many inputs.",
    "Eight photos, each beside an attention map in which the main object glows.", "Caron et al. CC BY 4.0")
add("imagebind", "ImageBind", "CVPR 2023", "2305.05665", "gallery", 1, True, "yes", "none", ["examples", "hierarchy"], ["payoff"],
    "Three new abilities in three numbered boxes, shown before the model is explained.",
    "Give each new ability a box and a three-word title.",
    "Three numbered boxes: a sound retrieves images, depth and text; a bird photo plus wave sounds gives birds in water; sounds generate images.", f"Girdhar et al. {C}")
add("geochat", "GeoChat", "CVPR 2024", "2311.15826", "hub", 1, False, "yes", "none", ["examples", "independence"], ["payoff"],
    "One aerial image with six tasks around it. Colours tie each answer to its region.",
    "Hold the input fixed, and vary the question.",
    "One aerial image in the centre with six dialogue boxes around it, each a different task.", "Kuckreja et al. CC BY 4.0",
    "Dense at column width.")

add("sam", "Segment Anything", "ICCV 2023", "2304.02643", "triptych", 1, True, "partly", "counts", ["hierarchy", "independence"], ["scope"],
    "Three contributions, three panels, and the same three names as the introduction.",
    "Give each contribution a panel, with matching words.",
    "Three panels labelled task, model and data: promptable segmentation, the model's three parts, and a data loop giving one billion masks.", f"Kirillov et al. {C}")
add("satlas", "SatlasPretrain", "ICCV 2023", "2211.15660", "hub", 1, True, "yes", "counts", ["examples", "evidence"], ["scope", "payoff"],
    "A globe for coverage, real tiles named by their use, and the counts in one box.",
    "For a dataset: real samples, real uses, three or four counts.",
    "A globe with arrows to real satellite tiles for deforestation, wind turbines, floods, vessels and more, and a box of key statistics.", "Bastani et al. CC BY 4.0")
add("swebench", "SWE-bench", "ICLR 2024", "2310.06770", "strip", 1, True, "yes", "none", ["examples", "clarity"], ["scope", "payoff"],
    "It follows one real issue from input to score, so the task and the metric are learnt together.",
    "For a benchmark, show one item end to end.",
    "A GitHub issue and codebase, a language model that writes a pull request, and unit tests that fail before and pass after.", "Jimenez et al. CC BY 4.0")
add("sustainbench", "SustainBench", "NeurIPS 2021", "2111.04724", "gallery", 2, False, "yes", "counts", ["hierarchy", "examples"], ["scope"],
    "Fifteen tasks, grouped and coloured by the goal each serves, each with its input, output and size.",
    "Group many items by something the reader cares about.",
    "Coloured blocks, one per Sustainable Development Goal, each listing tasks with an input image, an output image and a count of examples.", f"Yeh et al. {C}",
    "Near the limit for one figure.")
add("chexpert", "CheXpert", "AAAI 2019", "1901.07031", "strip", 1, False, "yes", "none", ["clarity", "examples"], ["scope", "payoff"],
    "One real case defines the task: these X-rays in, these fourteen probabilities out.",
    "Show one real input and its full output.",
    "Two chest X-rays feed a model, which gives a probability for each of 14 findings.", "Irvin et al. CC BY 4.0")
add("blink", "BLINK", "ECCV 2024", "2404.12390", "hub", 1, True, "yes", "none", ["examples", "hierarchy"], ["scope"],
    "Each task is an image and a question that the reader can try, which shows they are easy for people.",
    "Let the reader attempt a sample.",
    "Ten sample tasks around the BLINK logo, each an image with marked points and a one-line question.", "Fu et al. CC BY-NC-SA 4.0",
    "Very small in print.")

# Opening sentence of each figure's own caption, checked against the paper. "…" marks a cut.
CAP = {
 "informer": "(a) LSTF can cover an extended period than the short sequence predictions, making vital distinction in policy-planning and investment-protecting.",
 "resnet": "Training error (left) and test error (right) on CIFAR-10 with 20-layer and 56-layer “plain” networks.",
 "cot": "Chain-of-thought prompting enables large language models to tackle complex arithmetic, commonsense, and symbolic reasoning tasks.",
 "clip": "Summary of our approach.",
 "mae": "Our MAE architecture.",
 "lime": "Explaining individual predictions.",
 "gid": "We model a generative image-space prior on scene motion: from a single RGB image, our method generates a spectral volume …",
 "anysat": "Multi-Dataset Training.",
 "swin": "(a) The proposed Swin Transformer builds hierarchical feature maps by merging image patches (shown in gray) in deeper layers …",
 "yolo": "The YOLO Detection System.",
 "llmtime": "We propose LLMTime, a method for time series forecasting with large language models (LLMs) by encoding numbers as text and sampling possible extrapolations as text completions.",
 "3dgs": "Our method achieves real-time rendering of radiance fields with quality that equals the previous method with the best quality …",
 "efficientnet": "Model Size vs. ImageNet Accuracy.",
 "cyclegan": "Given any two unordered image collections X and Y, our algorithm learns to automatically “translate” an image from one into the other and vice versa …",
 "pix2pix": "Many problems in image processing, graphics, and vision involve translating an input image into a corresponding output image.",
 "dino": "Self-attention from a Vision Transformer with 8 × 8 patches trained with no supervision.",
 "imagebind": "ImageBind’s joint embedding space enables novel multimodal capabilities.",
 "geochat": "GeoChat can accomplish multiple tasks for remote-sensing (RS) image comprehension in a unified framework.",
 "sam": "We aim to build a foundation model for segmentation by introducing three interconnected components …",
 "satlas": "SatlasPretrain is a large-scale remote sensing dataset.",
 "swebench": "SWE-bench sources task instances from real-world Python repositories by connecting GitHub issues to merged pull request solutions that resolve related tests.",
 "sustainbench": "Datasets and tasks included in SustainBench ranging from poverty prediction to land cover classification …",
 "chexpert": "The CheXpert task is to predict the probability of different observations from multi-view chest radiographs.",
 "blink": "The Blink Benchmark.",
}
assert set(CAP) == {e["key"] for e in E}
labels = sum(len(CAP[e["key"]].split()) <= 5 for e in E)
N = len(E)
assert N == 24
order = list(GROUPS)
E.sort(key=lambda e: order.index(e["leads"]))
lead_n = Counter(e["leads"] for e in E)
page1 = sum(e["page"] == 1 for e in E)
real = sum(e["real"] == "yes" for e in E)
result = sum(e["number"] == "result" for e in E)
link = lambda k: next(f"[{e['name']}](#{e['key']})" for e in E if e["key"] == k)
links = lambda ks: ", ".join(link(k) for k in ks)
chip = lambda r: f"[{r}]{{.k .{CLS[r]}}}"
IMG = "../images/handbook/writing-papers/hero/"

CSS = '''```{=html}
<style>
/* No child combinators here: Quarto escapes them inside page styles. */
.k { font-weight: 700; font-size: .7rem; letter-spacing: .06em; text-transform: uppercase; }
.k.prob { color: var(--muted); } .k.idea { color: var(--accent); } .k.pay { color: var(--ok); } .k.scope { color: var(--ink); }
.hf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px 20px; grid-auto-flow: dense; margin: 1rem 0 2.2rem; align-items: start; }
.hf { border-top: 3px solid var(--rule); padding-top: .6rem; min-width: 0; scroll-margin-top: 90px; }
.hf.wide { grid-column: 1 / -1; }
.hf.prob { border-color: var(--muted); } .hf.idea { border-color: var(--accent); } .hf.pay { border-color: var(--ok); } .hf.scope { border-color: var(--ink); }
.hf p { margin: 0 0 .35rem; font-size: .93rem; line-height: 1.45; }
.hf .hd { font-size: 1rem; }
.hf .cap { display: block; font-size: .82rem; font-style: italic; color: var(--muted); margin: .1rem 0 .4rem; }
.hf .meta, .hf-note { font-size: .76rem; color: var(--muted); }
.hf img { display: block; width: 100%; background: #fff; border: 1px solid var(--rule); margin: .45rem 0 .5rem; }
/* Dark mode: never invert. The figures hold photos, and their colours carry meaning. Only soften the white. */
body.quarto-dark .hf img { filter: brightness(.88); }
.hf-scroll { overflow-x: auto; }
.hf-scroll table { font-size: .8rem; min-width: 640px; }
@media (max-width: 760px) { .hf-grid { grid-template-columns: 1fr; } }
</style>
```
'''

o = []
P = o.append
P(f"""---
title: "Making Hero Figures"
description: "What Figure 1 should show, with {N} first figures from top papers and what to borrow from each."
toc: true
---

{CSS}
The hero figure is Figure 1: the picture a reviewer sees before reading the introduction. In about **ten seconds** it should answer three questions.

1. [Problem]{{.k .prob}} What is hard or missing today?
2. [Idea]{{.k .idea}} What is the one thing that changes that?
3. [Payoff]{{.k .pay}} What becomes possible, and by how much?

It is a visual abstract, not the architecture diagram: for that, see [Making method figures](method-figures.qmd). This page shows {N} first figures from ICML, NeurIPS, ICLR, CVPR, ICCV, ECCV, KDD, AAAI and SIGGRAPH, and what to borrow from each. It is part of [Writing Papers](writing-papers.qmd#hero-figures).

## Choose what leads

Ask which sentence of the abstract a reviewer should repeat to the other reviewers. Draw that sentence.

| Your main claim | Lead with | Layout | See |
|----------------|-------|-----------------|----------|
| "Everyone has missed problem X." | {chip('problem')} | A plot of the failure | {links(['informer', 'resnet'])} |
| "A small change to a known method matters." | {chip('idea')} | Old and new, side by side | {links(['cot', 'swin'])} |
| "One simple idea solves X." | {chip('idea')} | One example in, the idea, the result out | {links(['clip', 'mae', 'lime', 'llmtime'])} |
| "One method handles many settings." | {chip('idea')} | Many inputs, one model, many outputs | {links(['anysat', 'pix2pix'])} |
| "We do X better, faster or cheaper." | {chip('payoff')} | Methods side by side, numbers on the picture | {links(['3dgs', 'efficientnet'])} |
| "We can now do X, which nobody could." | {chip('payoff')} | A gallery of real outputs | {links(['cyclegan', 'imagebind', 'geochat'])} |
| "Here is a dataset or a benchmark." | {chip('scope')} | Real samples and counts, or one item from input to score | {links(['satlas', 'swebench', 'chexpert'])} |
| "We make several contributions." | {chip('scope')} | One panel per contribution | {links(['sam'])} |

**Our default for an applied paper:** three panels, problem then idea then payoff, on *one real example*, with *one number*. Give the most space to your strongest panel.
""")

for g, (title, when) in GROUPS.items():
    P(f"## {title}\n\n{when}\n\n::: {{.hf-grid}}")
    for e in [x for x in E if x["leads"] == g]:
        wide = " .wide" if e["wide"] else ""
        flow = " → ".join(chip(r) for r in e["flow"])
        col = "full width" if e["wide"] else "one column"
        watch = f" **Watch out:** {e['watch']}" if e["watch"] else ""
        P(f"::: {{.hf .{CLS[g]}{wide} #{e['key']}}}")
        P(f"[**{e['name']}** · {e['venue']} · [paper](https://arxiv.org/abs/{e['arxiv']})]{{.hd}}\n")
        P(f"![]({IMG}{e['key']}.webp){{fig-alt=\"{e['alt']}\" loading=\"lazy\"}}\n")
        P(f"{flow} [· {e['layout']} · page {e['page']}, {col}]{{.meta}}\n")
        P(f"[Its caption opens: “{CAP[e['key']]}”]{{.cap}}\n")
        P(f"{e['why']}\n")
        P(f"**Borrow:** {e['borrow']}{watch}\n")
        P(f"[Figure 1, {e['credit']}.]{{.meta}}")
        P(":::")
    P(":::\n")

P(f"""## What the {N} have in common

- **Page 1.** {page1} of {N} put Figure 1 on the first page. The other {N - page1} put it on the second.
- **Real data.** {real} of {N} are built from real images, series or text, not icons.
- **Few parts.** Most have two to four groups. A gallery repeats one small unit.
- **Rarely an architecture.** Only MAE calls itself one, and it has five elements.
- **Captions differ.** {labels} of {N} open with a label, such as "Our MAE architecture." The strongest open with the claim itself, as Chain-of-Thought, DINO and ImageBind do.
- **Few numbers.** Only {result} carry a measured result. The rest show outputs that anyone can judge by eye. A forecast or a temperature cannot be judged by eye, so **our figures need the number**.

::: {{.callout-note collapse="true"}}
## All {N} on the same axes

::: {{.hf-scroll}}
| Paper | Leads with | Layout | Page | Real data | Number | Strongest on |
|--------|------|-------|--|----|-----|-------------|""")
for e in E:
    P(f"| [{e['name']}](#{e['key']}) | {chip(e['leads'])} | {e['layout']} | {e['page']} | {e['real']} | {e['number']} | {', '.join(Q[x] for x in e['q'])} |")
P(""":::

*Number*: the figure carries a measured result, only counts of data, or no number.
:::

## Make your own

1. **Write the sentence.** "Today, [problem]. We [idea]. Now, [payoff with a number]."
2. **Choose what leads,** from the table above.
3. **Follow one real example** through every panel. Pick a typical case, not the best of fifty.
4. **Sketch on paper first,** in week one, with three or four groups and one reading direction.
5. **Replace boxes with pictures.** A box that says "Encoder" shows nothing.
6. **Put one number on it,** with the baseline beside it.
7. **Colour only what is new.** Everything else is grey.
8. **Build it at final width,** as a vector PDF, with text of at least 6 to 7 pt. Put it on page 1.
9. **Open the caption with the claim,** and use the abstract's words on the figure.
10. **Test it for ten seconds** on someone outside the project. Redraw what they miss.

[Writing Papers](writing-papers.qmd#hero-figures) works through these steps for five papers.

## Checklist

- [ ] The claim is clear in ten seconds.
- [ ] The reader can see what existing methods cannot do.
- [ ] The new part stands out, and is not buried in a pipeline.
- [ ] Real inputs and outputs replace icons.
- [ ] A number or a comparison supports the claim.
- [ ] It has three or four groups and one reading direction.
- [ ] Every label is legible in the compiled PDF, and spelt correctly.
- [ ] The figure and its caption stand alone.
- [ ] It is on page 1, and its words match the abstract's.

[The figures are reproduced from the cited papers for teaching and criticism only. Each belongs to its authors and publisher. If you are an author and would like a figure removed, please write to us.]{.hf-note}
""")

Path("handbook/hero-figures.qmd").write_text("\n".join(o))
print("wrote handbook/hero-figures.qmd:", N, dict(lead_n), "page1", page1, "real", real, "result", result, "words", len(" ".join(o).split()))
