#!/usr/bin/env python3
"""
Remove emojis from text files using regex.

Usage:
    # Preview changes (dry run)
    python scripts/remove_emojis.py <file_path>

    # Apply changes and create backup
    python scripts/remove_emojis.py <file_path> --apply

    # Apply without backup
    python scripts/remove_emojis.py <file_path> --apply --no-backup

Examples:
    python scripts/remove_emojis.py scripts/audit_photo_sizes.py
    python scripts/remove_emojis.py news.qmd --apply
"""

import re
import sys
import argparse
import shutil
from pathlib import Path
from datetime import datetime


def get_emoji_pattern():
    """
    Create a comprehensive regex pattern to match emojis.

    Covers:
    - Emoticons
    - Dingbats
    - Transport & map symbols
    - Enclosed characters
    - Flags
    - Emoji modifiers (skin tones, etc.)
    """
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags (iOS)
        "\U00002702-\U000027B0"  # dingbats
        "\U000024C2-\U0001F251"  # enclosed characters
        "\U0001F900-\U0001F9FF"  # supplemental symbols
        "\U0001FA00-\U0001FA6F"  # extended symbols
        "\U00002600-\U000026FF"  # miscellaneous symbols
        "\U00002700-\U000027BF"  # dingbats (extended)
        "\U0001F018-\U0001F270"  # various symbols
        "\uFE00-\uFE0F"          # variation selectors
        "]+",
        flags=re.UNICODE
    )
    return emoji_pattern


def remove_emojis(text):
    """Remove all emojis from text."""
    pattern = get_emoji_pattern()
    # Remove emojis
    cleaned = pattern.sub('', text)
    # Clean up extra spaces that might result from emoji removal
    cleaned = re.sub(r' +', ' ', cleaned)
    # Clean up spaces before punctuation
    cleaned = re.sub(r' ([.,;:!?])', r'\1', cleaned)
    return cleaned


def count_emojis(text):
    """Count number of emojis in text."""
    pattern = get_emoji_pattern()
    return len(pattern.findall(text))


def preview_changes(file_path):
    """Show preview of changes without modifying the file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        original = f.read()

    cleaned = remove_emojis(original)
    emoji_count = count_emojis(original)

    if emoji_count == 0:
        print(f"\n[OK] No emojis found in {file_path}")
        return False

    print(f"\n=== Emoji Removal Preview ===")
    print(f"{'=' * 60}")
    print(f"File: {file_path}")
    print(f"Emojis found: {emoji_count}")
    print(f"Original size: {len(original)} chars")
    print(f"Cleaned size: {len(cleaned)} chars")
    print(f"{'=' * 60}\n")

    # Show diff of lines that changed
    original_lines = original.splitlines()
    cleaned_lines = cleaned.splitlines()

    changes_found = False
    for i, (orig, clean) in enumerate(zip(original_lines, cleaned_lines), 1):
        if orig != clean:
            if not changes_found:
                print("Changed lines:")
                changes_found = True
            print(f"\nLine {i}:")
            print(f"  - {orig}")
            print(f"  + {clean}")

    if not changes_found:
        print("No visible changes (emojis might be in whitespace)")

    return True


def apply_changes(file_path, create_backup=True):
    """Apply emoji removal and optionally create backup."""
    with open(file_path, 'r', encoding='utf-8') as f:
        original = f.read()

    cleaned = remove_emojis(original)
    emoji_count = count_emojis(original)

    if emoji_count == 0:
        print(f"\n[OK] No emojis found in {file_path}")
        return

    # Create backup
    if create_backup:
        backup_dir = Path(file_path).parent.parent / 'backup_emoji_removed'
        backup_dir.mkdir(exist_ok=True)

        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_name = f"{Path(file_path).stem}_{timestamp}{Path(file_path).suffix}"
        backup_path = backup_dir / backup_name

        shutil.copy2(file_path, backup_path)
        print(f"\n[BACKUP] Backup created: {backup_path}")

    # Write cleaned content
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(cleaned)

    print(f"\n[OK] Removed {emoji_count} emojis from {file_path}")
    print(f"   Original: {len(original)} chars")
    print(f"   Cleaned: {len(cleaned)} chars")
    print(f"   Saved: {len(original) - len(cleaned)} chars")


def main():
    parser = argparse.ArgumentParser(
        description='Remove emojis from text files',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Preview changes
  python scripts/remove_emojis.py news.qmd

  # Apply changes with backup
  python scripts/remove_emojis.py news.qmd --apply

  # Apply changes without backup
  python scripts/remove_emojis.py news.qmd --apply --no-backup
        """
    )
    parser.add_argument(
        'file_path',
        type=str,
        help='Path to the file to process'
    )
    parser.add_argument(
        '--apply', '-a',
        action='store_true',
        help='Apply changes (default is dry run/preview)'
    )
    parser.add_argument(
        '--no-backup',
        action='store_true',
        help='Do not create backup when applying changes'
    )

    args = parser.parse_args()

    # Validate file exists
    file_path = Path(args.file_path)
    if not file_path.exists():
        print(f"[ERROR] File not found: {file_path}")
        sys.exit(1)

    if not file_path.is_file():
        print(f"[ERROR] Not a file: {file_path}")
        sys.exit(1)

    # Process file
    if args.apply:
        apply_changes(file_path, create_backup=not args.no_backup)
    else:
        has_emojis = preview_changes(file_path)
        if has_emojis:
            print("\n[TIP] Run with --apply to remove emojis")
            print("   (Original file will be backed up)")


if __name__ == '__main__':
    main()
