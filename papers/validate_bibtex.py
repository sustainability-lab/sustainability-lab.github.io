#!/usr/bin/env python3
"""
Simple BibTeX validation script
Run before committing to catch common errors
"""

import sys
from pathlib import Path


def validate_bibtex_file(filepath):
    """Validate a single BibTeX file for common issues"""
    errors = []
    warnings = []

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        return [f"Cannot read file: {e}"], []

    # Check 1: File should start with @
    if not content.strip().startswith('@'):
        errors.append("File doesn't start with '@' - not a valid BibTeX entry")

    # Check 2: Balanced braces
    open_braces = content.count('{')
    close_braces = content.count('}')
    if open_braces != close_braces:
        errors.append(f"Unbalanced braces: {open_braces} opening, {close_braces} closing")

    # Check 3: Should have a year field
    if 'year' not in content.lower() and 'date' not in content.lower():
        warnings.append("No 'year' or 'date' field found")

    # Check 4: Should have a title
    if 'title' not in content.lower():
        errors.append("No 'title' field found")

    # Check 5: Should have author(s)
    if 'author' not in content.lower():
        warnings.append("No 'author' field found")

    # Check 6: Check for common typos in entry types
    entry_type_match = content.strip().split('{')[0].lower()
    valid_types = ['@article', '@inproceedings', '@proceedings', '@book',
                   '@inbook', '@incollection', '@manual', '@mastersthesis',
                   '@phdthesis', '@techreport', '@misc', '@unpublished']

    if not any(entry_type_match.startswith(t) for t in valid_types):
        warnings.append(f"Unusual entry type: {entry_type_match}")

    return errors, warnings


def main():
    if len(sys.argv) < 2:
        print("Usage: python validate_bibtex.py <file1.bib> [file2.bib ...]")
        sys.exit(1)

    all_valid = True

    for filepath in sys.argv[1:]:
        path = Path(filepath)

        # Skip all_publications.bib
        if path.name == 'all_publications.bib':
            continue

        if not path.exists():
            print(f"❌ {filepath}: File not found")
            all_valid = False
            continue

        errors, warnings = validate_bibtex_file(filepath)

        if errors:
            print(f"❌ {filepath}:")
            for error in errors:
                print(f"   ERROR: {error}")
            all_valid = False

        if warnings:
            print(f"⚠️  {filepath}:")
            for warning in warnings:
                print(f"   WARNING: {warning}")

        if not errors and not warnings:
            print(f"✅ {filepath}: Valid")

    if not all_valid:
        print("\n❌ Validation failed! Please fix errors before committing.")
        sys.exit(1)
    else:
        print("\n✅ All BibTeX files validated successfully!")
        sys.exit(0)


if __name__ == '__main__':
    main()
