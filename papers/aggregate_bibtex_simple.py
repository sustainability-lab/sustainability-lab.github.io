#!/usr/bin/env python3
"""
Simple BibTeX Aggregator for Sustainability Lab Publications

Usage: python aggregate_bibtex_simple.py
"""

import os
import re
import glob
from datetime import datetime

def extract_year_from_bibtex(content):
    """Extract year from BibTeX content."""
    match = re.search(r'year\s*=\s*[{\"]?(\d{4})[}\"]?', content, re.IGNORECASE)
    return int(match.group(1)) if match else 9999

def main():
    bibtex_dir = "bibtex"
    output_file = os.path.join(bibtex_dir, "all_publications.bib")
    
    print("Aggregating BibTeX files...")
    
    # Get all .bib files except the output file and large files
    bib_files = []
    for file in os.listdir(bibtex_dir):
        if (file.endswith('.bib') and 
            file != 'all_publications.bib' and 
            not file.startswith('all_publications_') and
            os.path.getsize(os.path.join(bibtex_dir, file)) < 10000):  # Skip large files
            bib_files.append(file)
    
    entries = []
    
    # Read all individual .bib files
    for filename in sorted(bib_files):
        filepath = os.path.join(bibtex_dir, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read().strip()
            
            if content:
                year = extract_year_from_bibtex(content)
                entries.append({
                    'year': year,
                    'filename': filename,
                    'content': content
                })
                print(f"  ✓ {filename} ({year})")
        except Exception as e:
            print(f"  ✗ Error reading {filename}: {e}")
    
    # Sort by year (newest first)
    entries.sort(key=lambda x: x['year'], reverse=True)
    
    # Generate output
    header = f"""% Comprehensive Bibliography - Sustainability Lab Publications
% IIT Gandhinagar
% Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
% Total publications: {len(entries)}

"""
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(header)
        
        current_year = None
        for entry in entries:
            if entry['year'] != current_year:
                current_year = entry['year']
                f.write(f"\n% ========== {current_year} ==========\n\n")
            
            f.write(entry['content'])
            f.write('\n\n')
    
    print(f"\n✓ Generated {output_file} with {len(entries)} publications")

if __name__ == "__main__":
    main()