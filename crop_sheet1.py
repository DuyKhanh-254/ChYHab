# -*- coding: utf-8 -*-
"""
Crop and process all 3D icons from both uploaded sheets
"""
import os
from PIL import Image
import numpy as np

out_dir = r'd:\duan\chyhab-app\assets\3d_icons'
os.makedirs(out_dir, exist_ok=True)

# ---------------------------------------------
# 1. PROCESS SHEET 1 (Transparent PNG)
# ---------------------------------------------
p1 = r'C:/Users/KengStore/.gemini/antigravity/brain/02fc3284-31b9-4233-8afe-b5b48a23ded5/.user_uploaded/media_1794903634837_dd391e9d.png'
im1 = Image.open(p1)
arr1 = np.array(im1)
alpha1 = arr1[:,:,3] > 10

def crop_transparent(x1, y1, x2, y2, filename):
    sub_mask = alpha1[y1:y2, x1:x2]
    if np.any(sub_mask):
        ys, xs = np.where(sub_mask)
        box = (x1 + np.min(xs), y1 + np.min(ys), x1 + np.max(xs) + 1, y1 + np.max(ys) + 1)
        cropped = im1.crop(box)
        cropped.save(os.path.join(out_dir, filename), 'PNG')
        print(f"Saved {filename}: {cropped.size}")

# Row 1 (Navigation icons)
crop_transparent(30, 90, 210, 260, 'nav_home_3d.png')
crop_transparent(230, 90, 420, 260, 'nav_study_3d.png')
crop_transparent(410, 90, 600, 260, 'nav_games_3d.png')
crop_transparent(600, 90, 790, 260, 'nav_shop_3d.png')
crop_transparent(820, 90, 970, 260, 'nav_profile_3d.png')

# Row 2 (Feature icons)
crop_transparent(30, 290, 210, 480, 'bell_3d.png')
crop_transparent(230, 290, 410, 480, 'trophy_3d.png')
crop_transparent(410, 290, 610, 480, 'chart_3d.png')
crop_transparent(620, 290, 800, 480, 'calendar_3d.png')
crop_transparent(810, 290, 1000, 480, 'checklist_3d.png')

# Row 3 (Indicators & Controls)
crop_transparent(40, 510, 210, 700, 'flame_3d.png')
crop_transparent(220, 560, 420, 660, 'three_hearts_3d.png')
crop_transparent(430, 520, 600, 690, 'arrow_left_3d.png')
crop_transparent(630, 520, 790, 690, 'arrow_right_3d.png')
crop_transparent(810, 510, 990, 700, 'calendar_active_3d.png')

print("Sheet 1 processed successfully!")
