#!/usr/bin/env python3
"""
Audit and optimize image sizes for the Sustainability Lab website.

Usage:
 # Phase 1: Find large images (default threshold: 500KB)
 python scripts/audit_photo_sizes.py

 # Custom threshold
 python scripts/audit_photo_sizes.py --threshold 200

 # Phase 2: Optimize images (compress and backup originals)
 python scripts/audit_photo_sizes.py --optimize

 # Optimize with custom quality
 python scripts/audit_photo_sizes.py --optimize --quality 80
"""

import os
import sys
import argparse
import shutil
from pathlib import Path
from datetime import datetime

# Image extensions to check
IMAGE_EXTENSIONS = {'.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'}

# Directories to scan
SCAN_DIRS = ['images', 'papers', 'people', 'events', 'news']

# Default size threshold in KB
DEFAULT_THRESHOLD_KB = 500


def get_file_size_kb(file_path):
 """Get file size in KB."""
 return os.path.getsize(file_path) / 1024


def find_large_images(root_dir, threshold_kb):
 """Find all images larger than threshold."""
 large_images = []

 for scan_dir in SCAN_DIRS:
 dir_path = Path(root_dir) / scan_dir
 if not dir_path.exists():
 continue

 for file_path in dir_path.rglob('*'):
 if file_path.suffix.lower() in IMAGE_EXTENSIONS:
 size_kb = get_file_size_kb(file_path)
 if size_kb > threshold_kb:
 large_images.append({
 'path': file_path,
 'size_kb': size_kb,
 'relative': file_path.relative_to(root_dir)
 })

 # Sort by size (largest first)
 large_images.sort(key=lambda x: x['size_kb'], reverse=True)
 return large_images


def print_report(large_images, threshold_kb):
 """Print a report of large images."""
 if not large_images:
 print(f"\n No images found larger than {threshold_kb}KB")
 return

 total_size = sum(img['size_kb'] for img in large_images)

 print(f"\n Image Size Audit Report")
 print(f"{'=' * 60}")
 print(f"Threshold: {threshold_kb}KB")
 print(f"Found: {len(large_images)} large images")
 print(f"Total size: {total_size/1024:.2f}MB")
 print(f"{'=' * 60}\n")

 # Group by directory
 by_dir = {}
 for img in large_images:
 dir_name = img['relative'].parts[0]
 if dir_name not in by_dir:
 by_dir[dir_name] = []
 by_dir[dir_name].append(img)

 for dir_name, images in sorted(by_dir.items()):
 print(f" {dir_name}/")
 for img in images:
 size_str = f"{img['size_kb']:.0f}KB"
 if img['size_kb'] > 1024:
 size_str = f"{img['size_kb']/1024:.1f}MB"
 print(f" • {img['relative']} ({size_str})")
 print()


def optimize_images(root_dir, large_images, quality=85):
 """Compress images and backup originals."""
 try:
 from PIL import Image
 except ImportError:
 print("\n Error: Pillow is required for optimization")
 print(" Install with: pip install Pillow")
 return False

 # Create backup directory
 backup_dir = Path(root_dir) / 'backup_large_images' / datetime.now().strftime('%Y%m%d_%H%M%S')
 backup_dir.mkdir(parents=True, exist_ok=True)

 optimized_count = 0
 saved_kb = 0

 print(f"\n Optimizing images (quality={quality})")
 print(f" Backing up to: {backup_dir.relative_to(root_dir)}")
 print(f"{'=' * 60}\n")

 for img_info in large_images:
 file_path = img_info['path']
 relative_path = img_info['relative']
 original_size = img_info['size_kb']

 # Skip SVGs (can't optimize with PIL)
 if file_path.suffix.lower() == '.svg':
 print(f">> Skipping SVG: {relative_path}")
 continue

 try:
 # Backup original
 backup_path = backup_dir / relative_path
 backup_path.parent.mkdir(parents=True, exist_ok=True)
 shutil.copy2(file_path, backup_path)

 # Open and optimize
 with Image.open(file_path) as img:
 # Convert RGBA to RGB for JPEG
 if img.mode == 'RGBA' and file_path.suffix.lower() in ['.jpg', '.jpeg']:
 img = img.convert('RGB')

 # Save optimized
 if file_path.suffix.lower() == '.png':
 img.save(file_path, 'PNG', optimize=True)
 else:
 img.save(file_path, quality=quality, optimize=True)

 new_size = get_file_size_kb(file_path)
 saved = original_size - new_size

 if saved > 0:
 optimized_count += 1
 saved_kb += saved
 print(f" {relative_path}")
 print(f" {original_size:.0f}KB → {new_size:.0f}KB (saved {saved:.0f}KB)")
 else:
 # Restore original if no savings
 shutil.copy2(backup_path, file_path)
 print(f">> {relative_path} (already optimized)")

 except Exception as e:
 print(f" Error processing {relative_path}: {e}")

 print(f"\n{'=' * 60}")
 print(f" Optimization Summary")
 print(f" Optimized: {optimized_count} images")
 print(f" Total saved: {saved_kb/1024:.2f}MB")
 print(f" Backups in: {backup_dir.relative_to(root_dir)}")

 return True


def main():
 parser = argparse.ArgumentParser(
 description='Audit and optimize image sizes for the website'
 )
 parser.add_argument(
 '--threshold', '-t',
 type=int,
 default=DEFAULT_THRESHOLD_KB,
 help=f'Size threshold in KB (default: {DEFAULT_THRESHOLD_KB})'
 )
 parser.add_argument(
 '--optimize', '-o',
 action='store_true',
 help='Optimize large images (compress and backup originals)'
 )
 parser.add_argument(
 '--quality', '-q',
 type=int,
 default=85,
 help='JPEG quality for optimization (default: 85)'
 )

 args = parser.parse_args()

 # Find project root (assuming script is in scripts/)
 script_dir = Path(__file__).parent
 root_dir = script_dir.parent

 # Verify we're in the right directory
 if not (root_dir / '_quarto.yml').exists():
 print(" Error: Run from the website repository root")
 sys.exit(1)

 print(f" Scanning for images > {args.threshold}KB...")
 large_images = find_large_images(root_dir, args.threshold)

 print_report(large_images, args.threshold)

 if args.optimize and large_images:
 optimize_images(root_dir, large_images, args.quality)
 elif large_images and not args.optimize:
 print(" Tip: Run with --optimize to compress these images")
 print(" (Original files will be backed up)")


if __name__ == '__main__':
 main()
