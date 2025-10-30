# How to Add a New Paper to the Publications Page

This guide explains the **simple, automated workflow** for adding new publications to the website.

## ** The Simple Workflow

Adding a new paper requires **just 3 manual steps**. Everything else is automated!

### Step 1: Add the BibTeX File

Create a new `.bib` file in `papers/bibtex/` following the naming convention:

**Naming:** `{keyword}{year}.bib`

**Example:** `papers/bibtex/vayubuddy2024.bib`

```bibtex
@inproceedings{acharya2024vayubuddy,
  title={VayuBench and VayuChat: LLM-Powered Air Quality Chatbot for India},
  author={Acharya, Vedant and Pisharodi, Abhay and others},
  booktitle={ACM IKDD CODS 2025},
  year={2025},
  url={https://arxiv.org/abs/2501.00000}
}
```

**Tips:**
- Use lowercase for the citation key (e.g., `acharya2024vayubuddy`)
- Include essential fields: `title`, `author`, `year`, `venue/journal`
- Add `url` field for paper link if available
- Add `doi` field if available

### Step 2: Add the Paper Entry to index.qmd

Open `papers/index.qmd` and add your paper under the appropriate year section.

**Template:**

```html
<div class="paper">
<img src="2025/yourpaper.png" alt="Paper thumbnail" class="paper-image">
<div class="paper-details">
<div class="research-tags" style="margin-bottom: 8px;">
  <span class="tag" style="background-color: #e0f2fe; color: #0369a1;">Air Quality</span>
  <span class="tag" style="background-color: #fef3c7; color: #92400e;">Large Language Models</span>
</div>
<p class="paper-title">Your Paper Title Here</p>
<p>FirstAuthor LastName, SecondAuthor LastName, <a href="https://nipunbatra.github.io">Nipun Batra</a></p>
<p><i>Conference/Journal Name Year</i></p>
<a href="papers/2025/yourpaper.pdf" class="paper-button" target="_blank">PDF</a>
<a href="bibtex/yourpaper2025.bib" class="paper-button bibtex-btn" download>BibTeX</a>
<a href="https://github.com/yourusername/yourrepo" class="paper-button github-btn" target="_blank">GitHub</a>
<button class="toggle-bibtex-btn paper-button" data-target="bibtex-yourpaper2025">Show BibTeX</button>
<div id="bibtex-yourpaper2025" class="bibtex-display" style="display: none;">
<pre>@inproceedings{yourkey2025,
  title={Your Paper Title},
  author={Authors Here},
  booktitle={Venue},
  year={2025}
}</pre>
</div>
</div>
</div>
```

**Available Research Tags:** (use matching colors from existing papers)
- Air Quality (#e0f2fe / #0369a1)
- Machine Learning (#fef3c7 / #92400e)
- Computer Vision (#dbeafe / #1e40af)
- Health (#dcfce7 / #166534)
- NILM (#ede9fe / #6b21a8)
- IoT (#fce7f3 / #9f1239)
- NLP (#e0e7ff / #3730a3)
- Sustainability (#d1fae5 / #065f46)
- Dataset (#fef08a / #854d0e)
- Earth Observation (#ccfbf1 / #115e59)

**Available Buttons:**
- PDF (paper link)
- BibTeX (download .bib file)
- GitHub (code repository)
- HuggingFace (models/datasets)
- YouTube (video presentation)
- Project Page (dedicated website)
- ArXiv (preprint)
- DOI (publisher link)

### Step 3: Add Paper Image

Add a thumbnail image for your paper:

**Location:** `papers/{year}/{imagename}.png`

**Example:** `papers/2025/vayubuddy.png`

**Specifications:**
- Dimensions: 250px width × 180px height (or similar aspect ratio)
- Format: PNG or JPG
- Size: Keep under 200KB for fast loading

### Step 4: Push to GitHub

```bash
git add papers/bibtex/yourpaper2025.bib
git add papers/index.qmd
git add papers/2025/yourpaper.png
git commit -m "Add new paper: Your Paper Title"
git push origin main
```

##  What Happens Automatically

After you push, GitHub Actions automatically:

1.  Detects your new `.bib` file
2.  Runs `aggregate_bibtex_simple.py` to update `all_publications.bib`
3.  Runs `generate_exports.py` to create:
   - `exports/all_publications.txt`
   - `exports/all_publications.csv`
   - `exports/all_publications.md`
   - `exports/all_publications.docx`
4.  Commits these changes back to the repository
5.  Triggers the website rebuild (via `publish.yml`)

**You don't need to run any scripts manually!**

##  Optional: Validate Before Pushing

If you want to catch errors early, you can validate your BibTeX file locally:

```bash
cd papers
python validate_bibtex.py bibtex/yourpaper2025.bib
```

This will check for:
- Balanced braces `{}`
- Required fields (title, author, year)
- Valid BibTeX entry type
- Common syntax errors

##  File Structure Overview

```
papers/
├── bibtex/
│   ├── yourpaper2025.bib          ← You add this
│   ├── all_publications.bib        ← Auto-generated 
│   └── ... (other papers)
├── exports/
│   ├── all_publications.txt        ← Auto-generated 
│   ├── all_publications.csv        ← Auto-generated 
│   ├── all_publications.md         ← Auto-generated 
│   └── all_publications.docx       ← Auto-generated 
├── 2025/
│   ├── yourpaper.png               ← You add this
│   └── yourpaper.pdf               ← You add this (optional)
├── index.qmd                       ← You edit this
├── aggregate_bibtex_simple.py      ← Auto-run by GitHub Actions 
├── generate_exports.py             ← Auto-run by GitHub Actions 
└── validate_bibtex.py              ← Optional: run manually
```

##  Quick Checklist

Before pushing, verify:

- [ ] `.bib` file created in `papers/bibtex/`
- [ ] Citation key uses lowercase
- [ ] Paper entry added to `papers/index.qmd` under correct year
- [ ] Paper image added to `papers/{year}/`
- [ ] BibTeX citation block in `index.qmd` matches `.bib` file
- [ ] All links work (PDF, GitHub, etc.)
- [ ] Research tags are appropriate

##  Manual Scripts (Optional)

If you prefer to test locally before pushing:

```bash
# Test BibTeX aggregation
cd papers
python aggregate_bibtex_simple.py

# Test export generation
cd papers
python generate_exports.py

# Validate a specific .bib file
cd papers
python validate_bibtex.py bibtex/yourpaper2025.bib

# Validate all .bib files
cd papers
python validate_bibtex.py bibtex/*.bib
```

##  FAQ

### Q: What if I forget to add the paper to index.qmd?
A: The `.bib` file will be included in exports, but the paper won't appear on the website. Just add it to `index.qmd` and push again.

### Q: Can I add multiple papers at once?
A: Yes! Add all `.bib` files and update `index.qmd` with all entries, then push once.

### Q: What if I make a mistake in the .bib file?
A: Just fix it and push again. GitHub Actions will regenerate everything.

### Q: How long does automation take?
A: Usually 1-2 minutes for the publication update workflow to complete.

### Q: Can I see the automation in action?
A: Yes! Check the "Actions" tab on GitHub after pushing. Look for "Update Publications" workflow.

##  Example: Adding VayuBuddy Paper

Here's a complete real example:

**1. Create `papers/bibtex/vayubuddy2024.bib`:**
```bibtex
@inproceedings{acharya2024vayubuddy,
  title={VayuBench and VayuChat: LLM-Powered Air Quality Chatbot for India},
  author={Acharya, Vedant and Pisharodi, Abhay and Mondal, Rishabh and Batra, Nipun},
  booktitle={ACM IKDD CODS 2025},
  year={2025},
  url={https://arxiv.org/abs/2501.00000}
}
```

**2. Add to `papers/index.qmd` under "2025" section**

**3. Add image:** `papers/2025/vayubuddy.png`

**4. Push:**
```bash
git add papers/bibtex/vayubuddy2024.bib papers/index.qmd papers/2025/vayubuddy.png
git commit -m "Add VayuBuddy paper (CODS 2025)"
git push origin main
```

**5. Wait 1-2 minutes** - Done! 

---

##  Need Help?

- Check [README_bibtex.md](README_bibtex.md) for BibTeX format details
- See existing papers in `index.qmd` for formatting examples
- Run `python validate_bibtex.py` to catch common errors
- Check GitHub Actions logs if automation fails
