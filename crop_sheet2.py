# -*- coding: utf-8 -*-
"""
Crop and process Sheet 2 (Black bg) with smooth alpha transparency
"""
import os
from PIL import Image, ImageDraw
import numpy as np

out_dir = r'd:\duan\chyhab-app\assets\3d_icons'
p2 = r'C:/Users/KengStore/.gemini/antigravity/brain/02fc3284-31b9-4233-8afe-b5b48a23ded5/.user_uploaded/media_1794903641218_24ba594d.jpg'
im2 = Image.open(p2).convert('RGB')
arr2 = np.array(im2, dtype=np.float32)

def key_out_dark_bg(crop_box, threshold=30, soft=20):
    """Crops a region from im2 and keys out the dark background with smooth alpha."""
    x1, y1, x2, y2 = crop_box
    sub = arr2[y1:y2, x1:x2]
    # Max color component
    max_c = np.max(sub, axis=2)
    # Alpha calculation
    alpha = np.clip((max_c - threshold) / float(soft), 0.0, 1.0) * 255.0
    
    # Unmultiply / prevent dark fringe on edges
    rgb = sub.copy()
    # Where alpha is low, brighten slightly to avoid dark halo
    
    rgba = np.dstack([rgb.astype(np.uint8), alpha.astype(np.uint8)])
    return Image.fromarray(rgba, 'RGBA')

def crop_circle_avatar(center_x, center_y, radius, filename):
    """Crops a circular avatar with smooth anti-aliased edge."""
    # 4x supersampling for ultra smooth circle
    scale = 4
    box = (center_x - radius - 2, center_y - radius - 2, center_x + radius + 2, center_y + radius + 2)
    sub = im2.crop(box)
    
    w, h = sub.size
    sub_large = sub.resize((w * scale, h * scale), Image.LANCZOS)
    
    mask = Image.new('L', (w * scale, h * scale), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((2 * scale, 2 * scale, (w - 2) * scale, (h - 2) * scale), fill=255)
    
    mask_smooth = mask.resize((w, h), Image.LANCZOS)
    sub.putalpha(mask_smooth)
    sub.save(os.path.join(out_dir, filename), 'PNG')
    print(f"Saved circular avatar {filename}: {sub.size}")

# 1. Standing ChY Mascot
mascot_img = key_out_dark_bg((65, 5, 238, 240), threshold=22, soft=16)
# Auto crop whitespace/transparent
bbox = mascot_img.getbbox()
if bbox: mascot_img = mascot_img.crop(bbox)
mascot_img.save(os.path.join(out_dir, 'mascot_chy_standing_sheet2.png'), 'PNG')
print("Saved mascot_chy_standing_sheet2.png:", mascot_img.size)

# 2. 4 Circular Avatars
crop_circle_avatar(348, 140, 72, 'avatar_chy_3d.png')
crop_circle_avatar(513, 140, 72, 'avatar_bunny_3d.png')
crop_circle_avatar(678, 140, 72, 'avatar_cat_3d.png')
crop_circle_avatar(843, 140, 72, 'avatar_bird_3d.png')

# 3. Medals (Gold, Silver, Bronze)
for name, box in [
    ('medal_gold_3d.png', (48, 238, 148, 380)),
    ('medal_silver_3d.png', (170, 238, 272, 380)),
    ('medal_bronze_3d.png', (292, 238, 396, 380)),
    ('capsule_badge_3d.png', (410, 255, 655, 375)),
    ('star_3d.png', (830, 245, 955, 370)),
    ('dropdown_chevron_3d.png', (105, 592, 202, 688)),
    ('chart_bars_orange_3d.png', (410, 580, 532, 682))
]:
    img = key_out_dark_bg(box, threshold=20, soft=15)
    b = img.getbbox()
    if b: img = img.crop(b)
    img.save(os.path.join(out_dir, name), 'PNG')
    print(f"Saved {name}: {img.size}")

print("Sheet 2 processed successfully!")
