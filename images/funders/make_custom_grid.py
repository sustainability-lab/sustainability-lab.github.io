#!/usr/bin/env python3
"""
Custom Grid Layout Generator for Funder Logos
Usage: python3 make_custom_grid.py <rows> <cols> [output_name]
Example: python3 make_custom_grid.py 2 6 my_slide_layout.png
"""

import sys
from PIL import Image
import os
import glob
try:
    from cairosvg import svg2png
    SVG_SUPPORT = True
except ImportError:
    SVG_SUPPORT = False

def get_active_logos():
    """Get the logos that are currently used on the website (in index.qmd order)"""
    active_logos = [
        'google.png',
        'cisco.png', 
        'nvidia.png',
        'microsoft.png',
        'serb.png',
        'moes.jpeg',
        'dst.jpg',
        'stars.png',
        'gujcost.png',
        'coe-ai-mhrd.svg',  # As used in index.qmd
        'gfd.jpeg',
        'jio.png'
    ]
    
    # Filter to only include logos that actually exist
    existing_logos = []
    for logo in active_logos:
        if os.path.exists(logo):
            existing_logos.append(logo)
        else:
            print(f"Warning: {logo} not found")
    
    return existing_logos

def create_presentation_grid(logos, rows, cols, output_filename, style='clean'):
    """
    Create a clean presentation-ready grid layout
    """
    
    if style == 'clean':
        logo_width = 180
        logo_height = 90
        padding = 25
        bg_color = (255, 255, 255, 255)  # White background
    else:  # professional style
        logo_width = 200
        logo_height = 100
        padding = 30
        bg_color = (248, 249, 250, 255)  # Light gray background
    
    # Calculate canvas dimensions
    canvas_width = cols * logo_width + (cols - 1) * padding + 60  # Extra margins
    canvas_height = rows * logo_height + (rows - 1) * padding + 60
    
    # Create canvas
    canvas = Image.new('RGBA', (canvas_width, canvas_height), bg_color)
    
    # Calculate starting position to center the grid
    start_x = 30
    start_y = 30
    
    # Place logos
    placed_count = 0
    for row in range(rows):
        for col in range(cols):
            if placed_count >= len(logos):
                break
                
            logo_path = logos[placed_count]
            
            try:
                # Handle SVG files
                if logo_path.lower().endswith('.svg'):
                    if SVG_SUPPORT:
                        # Convert SVG to PNG in memory
                        png_data = svg2png(url=logo_path, output_width=logo_width*2, output_height=logo_height*2)
                        from io import BytesIO
                        logo = Image.open(BytesIO(png_data))
                    else:
                        # Fallback: try to convert using system command
                        temp_png = f"temp_{os.path.basename(logo_path)}.png"
                        os.system(f"rsvg-convert -w {logo_width*2} -h {logo_height*2} {logo_path} -o {temp_png}")
                        if os.path.exists(temp_png):
                            logo = Image.open(temp_png)
                            os.remove(temp_png)
                        else:
                            print(f"Cannot process SVG {logo_path}, skipping")
                            placed_count += 1
                            continue
                else:
                    logo = Image.open(logo_path)
                
                if logo.mode != 'RGBA':
                    logo = logo.convert('RGBA')
                
                # Scale to fit
                width_ratio = logo_width / logo.width
                height_ratio = logo_height / logo.height
                scale_ratio = min(width_ratio, height_ratio)
                
                new_width = int(logo.width * scale_ratio)
                new_height = int(logo.height * scale_ratio)
                
                logo_resized = logo.resize((new_width, new_height), Image.Resampling.LANCZOS)
                
                # Center within cell
                x = start_x + col * (logo_width + padding) + (logo_width - new_width) // 2
                y = start_y + row * (logo_height + padding) + (logo_height - new_height) // 2
                
                canvas.paste(logo_resized, (x, y), logo_resized)
                placed_count += 1
                
            except Exception as e:
                print(f"Error processing {logo_path}: {e}")
                placed_count += 1
        
        if placed_count >= len(logos):
            break
    
    canvas.save(output_filename, 'PNG')
    print(f"Created {output_filename} - {rows} rows x {cols} cols ({canvas_width}x{canvas_height})")
    return canvas_width, canvas_height

def main():
    if len(sys.argv) < 3:
        print("Usage: python3 make_custom_grid.py <rows> <cols> [output_name]")
        print("Example: python3 make_custom_grid.py 2 6 funders_slide.png")
        return
    
    try:
        rows = int(sys.argv[1])
        cols = int(sys.argv[2])
        output_name = sys.argv[3] if len(sys.argv) > 3 else f"funders_{rows}x{cols}.png"
        
        logos = get_active_logos()
        print(f"Using {len(logos)} logos for {rows}x{cols} grid")
        
        if len(logos) > rows * cols:
            print(f"Note: Only first {rows * cols} logos will be used")
            logos = logos[:rows * cols]
        
        width, height = create_presentation_grid(logos, rows, cols, output_name)
        print(f"Grid saved as {output_name}")
        print(f"Dimensions: {width}x{height} pixels")
        
    except ValueError:
        print("Error: Rows and columns must be numbers")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()