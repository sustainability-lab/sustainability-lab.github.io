# Publications Management

Complete guide for managing publications on the Sustainability Lab website.

## Quick Start: Add a New Paper

**Step 1:** Create `.bib` file in `papers/bibtex/yourpaper2025.bib`

```bibtex
@inproceedings{author2025title,
  title={Your Paper Title},
  author={Author One and Author Two and Batra, Nipun},
  booktitle={Conference Name},
  year={2025},
  url={https://arxiv.org/abs/...}
}
```

**Step 2:** Add entry to `papers/index.qmd` (see existing entries for template)

**Step 3:** Add image to `papers/2025/yourpaper.png` (250x180px recommended)

**Step 4:** Push to GitHub

```bash
git add papers/bibtex/yourpaper2025.bib papers/index.qmd papers/2025/yourpaper.png
git commit -m "Add new paper: Your Title"
git push
```

**Done!** GitHub Actions automatically:
- Aggregates all `.bib` files → `bibtex/all_publications.bib`
- Generates exports → `exports/*.{txt,csv,md,docx}`
- Rebuilds website

## File Structure

```
papers/
├── bibtex/
│   ├── yourpaper2025.bib       # Individual .bib files (you add these)
│   └── all_publications.bib    # Auto-generated aggregate
├── exports/
│   ├── all_publications.txt    # Auto-generated
│   ├── all_publications.csv    # Auto-generated
│   ├── all_publications.md     # Auto-generated
│   └── all_publications.docx   # Auto-generated
├── 2025/
│   ├── yourpaper.png           # Paper thumbnails (you add these)
│   └── yourpaper.pdf           # Optional PDFs
├── index.qmd                   # Publications page (you edit this)
├── README.md                   # This file
└── Scripts (auto-run by GitHub Actions):
    ├── aggregate_bibtex_simple.py
    ├── generate_exports.py
    └── validate_bibtex.py (optional, run manually)
```

## Validation (Optional)

Check your `.bib` file before pushing:

```bash
python papers/validate_bibtex.py papers/bibtex/yourpaper2025.bib
```

## Naming Conventions

- **BibTeX files**: `{keyword}{year}.bib` (e.g., `vayubuddy2024.bib`)
- **Citation keys**: lowercase (e.g., `patel2024vayubuddy`)
- **Images**: matching paper name (e.g., `vayubuddy.png`)

## GitHub Actions Workflow

The automation workflow (`.github/workflows/update-publications.yml`) triggers when you modify any `.bib` file in `papers/bibtex/` and:

1. Aggregates all individual `.bib` files
2. Generates all export formats
3. Commits changes back
4. Triggers website rebuild

No manual script execution needed.

## Troubleshooting

**Q: Paper not in exports?**
A: Check that `.bib` file exists and has required fields (title, author, year)

**Q: GitHub Actions failed?**
A: Check [Actions tab](https://github.com/sustainability-lab/sustainability-lab.github.io/actions) for error logs

**Q: Need to update existing paper?**
A: Edit the `.bib` file and push - exports update automatically
