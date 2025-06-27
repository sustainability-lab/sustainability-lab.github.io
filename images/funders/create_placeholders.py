#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

def create_placeholder(text, filename, width=300, height=120):
    # Create image with white background
    img = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(img)
    
    # Try to use a system font, fallback to default
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 20)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
        except:
            font = ImageFont.load_default()
    
    # Get text dimensions
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # Center the text
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    # Draw border
    draw.rectangle([2, 2, width-3, height-3], outline='#cccccc', width=2)
    
    # Draw text
    draw.text((x, y), text, fill='#333333', font=font)
    
    # Save image
    img.save(filename)
    print(f"Created {filename}")

# Create placeholders for organizations that don't have easily accessible logos
placeholders = [
    ("SERB", "serb.png"),
    ("MOES", "moes.png"), 
    ("DST", "dst.png"),
    ("STARS", "stars.png"),
    ("Government of Gujarat", "gujarat.png"),
    ("CoE in AI (MHRD)", "coe-ai-mhrd.png")
]

for text, filename in placeholders:
    create_placeholder(text, filename)