#!/usr/bin/env bash
# Remove emojis from text files using sed
#
# Usage:
#   # Preview changes (dry run)
#   bash scripts/remove_emojis.sh <file_path>
#
#   # Apply changes and create backup
#   bash scripts/remove_emojis.sh <file_path> --apply
#
#   # Apply without backup
#   bash scripts/remove_emojis.sh <file_path> --apply --no-backup
#
# Examples:
#   bash scripts/remove_emojis.sh news.qmd
#   bash scripts/remove_emojis.sh news.qmd --apply
#   bash scripts/remove_emojis.sh scripts/audit_photo_sizes.py --apply --no-backup

set -e

FILE_PATH="$1"
APPLY_MODE="$2"
NO_BACKUP="$3"

# Validate file exists
if [ -z "$FILE_PATH" ]; then
    echo "Error: No file path provided"
    echo "Usage: bash scripts/remove_emojis.sh <file_path> [--apply] [--no-backup]"
    exit 1
fi

if [ ! -f "$FILE_PATH" ]; then
    echo "Error: File not found: $FILE_PATH"
    exit 1
fi

# Comprehensive emoji removal pattern
# This uses POSIX character classes and Unicode ranges that work with GNU sed
EMOJI_PATTERN='s/[😀-🙏🌀-🗿🚀-🛿⚀-⛿✀-➿Ⓐ-🅯🅰-🆯]+//g'

# Alternative: Simple pattern that catches most common emojis
# Uncomment this if the above doesn't work on your system
# EMOJI_PATTERN='s/[\x{1F300}-\x{1FAF8}]//g'

# For macOS sed (BSD sed), use a simpler pattern
if [[ "$OSTYPE" == "darwin"* ]]; then
    # BSD sed pattern - catches most emojis
    EMOJI_PATTERN='s/[[:cntrl:][:emoji:]]//g'
    # Fallback pattern if emoji class not supported
    if ! echo "test" | sed "$EMOJI_PATTERN" 2>/dev/null; then
        # Use hex codes for common emoji ranges
        EMOJI_PATTERN='s/[\xF0\x9F\x98-\xF0\x9F\x99][\x80-\xBF][\x80-\xBF]//g'
    fi
fi

# Count emojis before processing
count_emojis() {
    local file="$1"
    # This is approximate - counts emoji-like Unicode characters
    if command -v python3 &> /dev/null; then
        python3 -c "
import re
with open('$file', 'r', encoding='utf-8') as f:
    text = f.read()
pattern = re.compile('[😀-🙏🌀-🗿🚀-🛿⚀-⛿✀-➿Ⓐ-🅯🅰-🆯]+', re.UNICODE)
print(len(pattern.findall(text)))
"
    else
        # Fallback: rough estimate using grep
        grep -o '[😀-🙏🌀-🗿🚀-🛿⚀-⛿✀-➿]' "$file" 2>/dev/null | wc -l || echo "0"
    fi
}

# Preview mode (dry run)
if [ "$APPLY_MODE" != "--apply" ]; then
    echo "=========================================="
    echo "Emoji Removal Preview"
    echo "=========================================="
    echo "File: $FILE_PATH"

    EMOJI_COUNT=$(count_emojis "$FILE_PATH")
    echo "Approximate emojis found: $EMOJI_COUNT"

    if [ "$EMOJI_COUNT" -eq 0 ]; then
        echo "No emojis found in file"
        exit 0
    fi

    echo ""
    echo "Preview of changes:"
    echo "------------------------------------------"

    # Show diff
    sed "$EMOJI_PATTERN" "$FILE_PATH" > /tmp/emoji_preview_$$
    diff -u "$FILE_PATH" /tmp/emoji_preview_$$ || true
    rm -f /tmp/emoji_preview_$$

    echo ""
    echo "Tip: Run with --apply to remove emojis"
    echo "      (Original file will be backed up unless --no-backup is used)"
    exit 0
fi

# Apply mode
EMOJI_COUNT=$(count_emojis "$FILE_PATH")

if [ "$EMOJI_COUNT" -eq 0 ]; then
    echo "No emojis found in $FILE_PATH"
    exit 0
fi

# Create backup if requested
if [ "$NO_BACKUP" != "--no-backup" ]; then
    BACKUP_DIR="backup_emoji_removed"
    mkdir -p "$BACKUP_DIR"

    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BASENAME=$(basename "$FILE_PATH")
    BACKUP_PATH="$BACKUP_DIR/${BASENAME%.* }_${TIMESTAMP}.${BASENAME##*.}"

    cp "$FILE_PATH" "$BACKUP_PATH"
    echo "Backup created: $BACKUP_PATH"
fi

# Apply emoji removal
ORIG_SIZE=$(wc -c < "$FILE_PATH")
sed -i.tmp "$EMOJI_PATTERN" "$FILE_PATH"

# Clean up extra spaces
sed -i.tmp2 's/  */ /g' "$FILE_PATH"
sed -i.tmp3 's/ \([.,;:!?]\)/\1/g' "$FILE_PATH"

# Remove temp files
rm -f "${FILE_PATH}.tmp" "${FILE_PATH}.tmp2" "${FILE_PATH}.tmp3"

NEW_SIZE=$(wc -c < "$FILE_PATH")
SAVED=$((ORIG_SIZE - NEW_SIZE))

echo "=========================================="
echo "Emoji Removal Complete"
echo "=========================================="
echo "Removed approximately $EMOJI_COUNT emojis from $FILE_PATH"
echo "Original: $ORIG_SIZE bytes"
echo "Cleaned: $NEW_SIZE bytes"
echo "Saved: $SAVED bytes"
