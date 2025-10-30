# Publications Workflow - Visual Guide

## ** One Simple Workflow (No Sync Issues!)

```
┌─────────────────────────────────────────────────────────────┐
│                     YOU (Local Machine)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Create: papers/bibtex/newpaper2025.bib                   │
│  2. Add image: papers/2025/newpaper.png                      │
│  3. Update: papers/index.qmd                                 │
│                                                               │
│  4. git add + git commit + git push                          │
│                                                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ push to GitHub
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  GITHUB ACTIONS (Automated)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│   Detects new .bib file in papers/bibtex/                 │
│   Runs: python aggregate_bibtex_simple.py                 │
│      → Generates: all_publications.bib                       │
│                                                               │
│   Runs: python generate_exports.py                        │
│      → Generates: exports/all_publications.txt               │
│      → Generates: exports/all_publications.csv               │
│      → Generates: exports/all_publications.md                │
│      → Generates: exports/all_publications.docx              │
│                                                               │
│   Counts publications & updates index.qmd                  │
│      "(41 publications)" → "(42 publications)"               │
│                                                               │
│   Commits changes back to repo                             │
│                                                               │
│   Triggers publish.yml workflow                            │
│      → Rebuilds website with Quarto                          │
│      → Publishes to gh-pages                                 │
│                                                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ website updated!
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   WEBSITE (Live)                             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│   New paper appears on publications page                   │
│   Download links include new paper                         │
│   Publication count updated                                │
│   All export formats contain new paper                     │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

##  What You Do vs What's Automated

###  Manual Steps (You)

| Step | Action | Time |
|------|--------|------|
| 1 | Create `.bib` file | 2 min |
| 2 | Add paper to `index.qmd` | 5 min |
| 3 | Add paper image | 1 min |
| 4 | Git push | 30 sec |

**Total time: ~8 minutes**

###  Automated Steps (GitHub Actions)

| Step | Action | Time |
|------|--------|------|
| 1 | Aggregate BibTeX files | 5 sec |
| 2 | Generate 4 export formats | 10 sec |
| 3 | Update publication count | 2 sec |
| 4 | Commit changes | 5 sec |
| 5 | Rebuild website | 30 sec |

**Total time: ~1 minute (fully automated)**

##  No Sync Issues!

### Why this approach eliminates sync problems:

 **Single source of truth**: GitHub repository
 **All automation server-side**: No local/remote conflicts
 **Idempotent**: Running twice produces same result
 **Pull before edit**: Simple git workflow
 **Atomic commits**: All changes together

### What you DON'T need to do:

 Run Python scripts manually
 Commit generated files
 Remember to update exports
 Count publications manually
 Install pre-commit hooks
 Set up local automation

##  Real Example: Adding VayuBuddy Paper

### Step 1: Local Work (8 minutes)

```bash
# 1. Create BibTeX file
echo '@inproceedings{acharya2024vayubuddy,
  title={VayuBench and VayuChat},
  author={Acharya, Vedant and others},
  booktitle={ACM IKDD CODS 2025},
  year={2025}
}' > papers/bibtex/vayubuddy2024.bib

# 2. Add image (already done)
# papers/2025/vayubuddy.png

# 3. Edit index.qmd
# (Add paper entry manually)

# 4. Commit and push
git add papers/bibtex/vayubuddy2024.bib \
        papers/index.qmd \
        papers/2025/vayubuddy.png
git commit -m "Add VayuBuddy paper (CODS 2025)"
git push origin main
```

### Step 2: GitHub Actions (1 minute, automatic)

```
✓ Workflow triggered
✓ Python dependencies installed
✓ aggregate_bibtex_simple.py executed
✓ generate_exports.py executed
✓ Publication count: 41 → 42
✓ Changes committed
✓ Website rebuild triggered
✓ Site published to gh-pages
```

### Step 3: Result (live on website!)

```
✓ Paper appears on publications page
✓ all_publications.bib includes VayuBuddy
✓ all_publications.txt includes VayuBuddy
✓ all_publications.csv includes VayuBuddy
✓ all_publications.md includes VayuBuddy
✓ all_publications.docx includes VayuBuddy
✓ Download section shows "(42 publications)"
```

##  Optional: Local Validation

If you want to catch errors before pushing:

```bash
# Validate your BibTeX file
python papers/validate_bibtex.py papers/bibtex/vayubuddy2024.bib

# Output:
#  papers/bibtex/vayubuddy2024.bib: Valid
```

##  File Flow Diagram

```
Individual .bib files              Aggregated files (auto)
────────────────────               ────────────────────────

papers/bibtex/
├── paper1.bib          ┐
├── paper2.bib          │
├── paper3.bib          ├──►  aggregate_bibtex_simple.py
├── ...                 │          │
└── paper44.bib         ┘          │
                                   ▼
                           all_publications.bib
                                   │
                                   ├──►  generate_exports.py
                                   │          │
                                   │          ▼
                           exports/
                           ├── all_publications.txt
                           ├── all_publications.csv
                           ├── all_publications.md
                           └── all_publications.docx
```

##  Workflow States

```
┌──────────────┐
│   You Edit   │  (Working on local machine)
└──────┬───────┘
       │
       │ git push
       ▼
┌──────────────┐
│  Git Push    │  (Changes sent to GitHub)
└──────┬───────┘
       │
       │ triggers
       ▼
┌──────────────┐
│  GH Actions  │  (Automation running)
│   Running    │
└──────┬───────┘
       │
       │ completes
       ▼
┌──────────────┐
│  Auto-commit │  (Bot commits generated files)
└──────┬───────┘
       │
       │ triggers
       ▼
┌──────────────┐
│   Publish    │  (Website rebuild)
│   Workflow   │
└──────┬───────┘
       │
       │ deploys
       ▼
┌──────────────┐
│   Website    │  (Live with new paper!)
│   Updated    │
└──────────────┘
```

##  Pro Tips

1. **Always pull before editing**
   ```bash
   git pull origin main
   # Then make your changes
   ```

2. **Check Actions tab** to monitor progress
   - Go to: https://github.com/sustainability-lab/sustainability-lab.github.io/actions
   - Look for "Update Publications" workflow

3. **Validate locally first** (optional but recommended)
   ```bash
   python papers/validate_bibtex.py papers/bibtex/yourpaper.bib
   ```

4. **Add multiple papers at once**
   - Create multiple `.bib` files
   - Update `index.qmd` with all entries
   - Push once → automation handles all

##  Documentation Files

- **[ADDING_PAPERS.md](ADDING_PAPERS.md)**: Complete step-by-step guide
- **[README_bibtex.md](README_bibtex.md)**: Quick reference
- **[WORKFLOW_DIAGRAM.md](WORKFLOW_DIAGRAM.md)**: This file (visual guide)

---

**Remember: The best workflow is the simplest one!** **
