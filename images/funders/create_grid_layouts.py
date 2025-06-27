#!/usr/bin/env python3
from PIL import Image
import os
import glob

def create_grid_layout(logos, rows, cols, output_filename, logo_width=200, logo_height=100, padding=20):
    """
    Create a grid layout of logos for slides
    
    Args:
        logos: List of logo filenames
        rows: Number of rows
        cols: Number of columns
        output_filename: Output filename
        logo_width: Width of each logo in pixels
        logo_height: Height of each logo in pixels
        padding: Padding between logos in pixels
    """
    
    # Calculate canvas dimensions
    canvas_width = cols * logo_width + (cols - 1) * padding
    canvas_height = rows * logo_height + (rows - 1) * padding
    
    # Create white canvas
    canvas = Image.new('RGBA', (canvas_width, canvas_height), (255, 255, 255, 255))
    
    # Load and place logos
    logo_index = 0
    for row in range(rows):
        for col in range(cols):
            if logo_index >= len(logos):
                break
                
            logo_path = logos[logo_index]
            if not os.path.exists(logo_path):
                print(f"Warning: {logo_path} not found, skipping")
                logo_index += 1
                continue
                
            try:
                # Load and resize logo
                logo = Image.open(logo_path)
                if logo.mode != 'RGBA':
                    logo = logo.convert('RGBA')
                
                # Calculate scaling to fit within target dimensions
                width_ratio = logo_width / logo.width
                height_ratio = logo_height / logo.height
                scale_ratio = min(width_ratio, height_ratio)
                
                new_width = int(logo.width * scale_ratio)
                new_height = int(logo.height * scale_ratio)
                
                logo_resized = logo.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                # Calculate position
                x = col * (logo_width + padding) + (logo_width - new_width) // 2
                y = row * (logo_height + padding) + (logo_height - new_height) // 2
                
                # Paste logo onto canvas
                canvas.paste(logo_resized, (x, y), logo_resized)
                
                print(f"Placed {logo_path} at position ({row}, {col})")
                
            except Exception as e:
                print(f"Error processing {logo_path}: {e}")
            
            logo_index += 1
        
        if logo_index >= len(logos):
            break
    
    # Save the grid
    canvas.save(output_filename, 'PNG')
    print(f"Created grid layout: {output_filename} ({canvas_width}x{canvas_height})")

def main():
    # Get all logo files (excluding any scripts)
    logo_extensions = ['*.png', '*.jpg', '*.jpeg', '*.svg']
    all_logos = []
    for ext in logo_extensions:
        all_logos.extend(glob.glob(ext))
    
    # Remove script files
    logos = [f for f in all_logos if not f.endswith('.py')]
    logos.sort()
    
    print(f"Found {len(logos)} logo files:")
    for i, logo in enumerate(logos):
        print(f"  {i+1}. {logo}")
    
    print("\nCreating different grid layouts...")
    
    # 2 rows x 6 columns (as requested)
    create_grid_layout(logos, 2, 6, "funders_grid_2x6.png", logo_width=180, logo_height=90, padding=15)
    
    # Other useful layouts
    create_grid_layout(logos, 3, 4, "funders_grid_3x4.png", logo_width=200, logo_height=100, padding=20)
    create_grid_layout(logos, 1, 12, "funders_grid_1x12.png", logo_width=150, logo_height=75, padding=10)
    create_grid_layout(logos, 4, 3, "funders_grid_4x3.png", logo_width=220, logo_height=110, padding=25)
    
    print("\nGrid layouts created successfully!")
    print("Available layouts:")
    print("  - funders_grid_2x6.png (2 rows, 6 columns)")
    print("  - funders_grid_3x4.png (3 rows, 4 columns)")
    print("  - funders_grid_1x12.png (1 row, 12 columns)")
    print("  - funders_grid_4x3.png (4 rows, 3 columns)")

if __name__ == "__main__":
    main()