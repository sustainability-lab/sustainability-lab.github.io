# BibTeX Management for Publications

This directory contains scripts and files for managing BibTeX references for all Sustainability Lab publications.

##  Quick Start: Adding a New Paper

**See [ADDING_PAPERS.md](ADDING_PAPERS.md) for the complete step-by-step guide.**

The workflow is simple:
1. Add your `.bib` file to `bibtex/`
2. Update `index.qmd` with the paper entry
3. Push to GitHub
4. **Everything else is automated!** 

##  Files & Directories

- `bibtex/` - Individual .bib files for each publication (44 papers)
- `bibtex/all_publications.bib` - Aggregated bibliography (auto-generated)
- `exports/` - Export formats: TXT, CSV, Markdown, DOCX (auto-generated)
- `aggregate_bibtex_simple.py` - BibTeX aggregation script (auto-run)
- `generate_exports.py` - Export format generator (auto-run)
- `validate_bibtex.py` - Optional validation tool (manual)
- `index.qmd` - Main publications page
- `ADDING_PAPERS.md` - Complete guide for adding papers

##  Automation

**GitHub Actions handles everything automatically:**

When you push a new `.bib` file, the workflow:
1. Aggregates all BibTeX files → `all_publications.bib`
2. Generates export formats → `exports/*.{txt,csv,md,docx}`
3. Updates publication count in `index.qmd`
4. Commits and pushes changes back

**You don't need to run scripts manually!**

See workflow: [`.github/workflows/update-publications.yml`](../.github/workflows/update-publications.yml)

##  Optional: Manual Validation

To check your BibTeX file before pushing:

```bash
cd papers/
python validate_bibtex.py bibtex/yourpaper2025.bib
```

##  Manual Scripts (Optional)

If you want to test locally:

```bash
# Aggregate BibTeX files
cd papers/
python aggregate_bibtex_simple.py

# Generate export formats
python generate_exports.py

# Validate all .bib files
python validate_bibtex.py bibtex/*.bib
```

##  Download Formats Available

- **Individual .bib files**: Each paper has its own file
- **all_publications.bib**: All publications in one file
- **all_publications.txt**: Plain text format
- **all_publications.csv**: Spreadsheet format
- **all_publications.md**: Markdown format
- **all_publications.docx**: Word document

##  File Naming Convention

Individual .bib files follow: `{keyword}{year}.bib`

Examples:
- `vayubuddy2024.bib`
- `space2policy2025.bib`
- `jouleseye2024.bib`

##  Current Stats

- **Total Publications**: 44 papers (auto-updated)
- **Years Covered**: 2012-2025
- **Export Formats**: 4 (TXT, CSV, Markdown, DOCX)