# BibTeX Management for Publications

This directory contains scripts and files for managing BibTeX references for all Sustainability Lab publications.

## Files

- `bibtex/` - Directory containing individual .bib files for each publication
- `bibtex/all_publications.bib` - Comprehensive bibliography with all publications
- `aggregate_bibtex_simple.py` - Script to automatically generate the comprehensive bibliography

## Usage

### To update the comprehensive bibliography:

```bash
cd papers/
python aggregate_bibtex_simple.py
```

This will:
1. Read all individual .bib files from the `bibtex/` directory
2. Sort them by year (newest first)
3. Generate a new `bibtex/all_publications.bib` file with all publications

### To add a new publication:

1. Create a new `.bib` file in the `bibtex/` directory with the citation
2. Add the download link to `index.qmd` (see existing examples)
3. Run the aggregation script to update the comprehensive bibliography

### Download formats available:

- **Individual .bib files**: For specific publications
- **Comprehensive .bib file**: All publications in one file (`bibtex/all_publications.bib`)

## Automation

You can set up a git hook or CI/CD pipeline to automatically run the aggregation script when new .bib files are added:

```bash
# Add to .git/hooks/pre-commit
#!/bin/bash
cd papers/
python aggregate_bibtex_simple.py
git add bibtex/all_publications.bib
```

## File naming convention

Individual .bib files should follow the pattern: `{keyword}{year}.bib`

Examples:
- `space2policy2025.bib`
- `jouleseye2024.bib` 
- `vartalaap2021.bib`