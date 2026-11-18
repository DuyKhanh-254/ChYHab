# -*- coding: utf-8 -*-
"""
Update index.html with newly cropped 3D icons
"""
import re

with open(r'd:\duan\chyhab-app\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Update Home Screen banner mascot, bell, flame, hearts
html = html.replace('src="assets/icons/nav_notifications.png" alt="Bell"', 'src="assets/3d_icons/bell_3d.png" alt="Bell"')
html = html.replace('src="assets/mascots/chy_waving.png" alt="ChY Mascot" class="mascot-standing-img"', 'src="assets/3d_icons/mascot_chy_standing_sheet2.png" alt="ChY Mascot" class="mascot-standing-img"')
html = html.replace('<span class="flame-ico">🔥</span>', '<img src="assets/3d_icons/flame_3d.png" alt="Streak" class="flame-ico-img" />')
html = html.replace('<div class="hearts-row-three">\n                      <span class="heart-item">❤️</span>\n                      <span class="heart-item">❤️</span>\n                      <span class="heart-item">❤️</span>\n                    </div>', '<img src="assets/3d_icons/three_hearts_3d.png" alt="Lives" class="three-hearts-img" />')
html = html.replace('<div class="hearts-row-three">\r\n                      <span class="heart-item">❤️</span>\r\n                      <span class="heart-item">❤️</span>\r\n                      <span class="heart-item">❤️</span>\r\n                    </div>', '<img src="assets/3d_icons/three_hearts_3d.png" alt="Lives" class="three-hearts-img" />')

# 2. Update BXH icons, medals, and avatars
html = html.replace('<span class="cm-icon">🏆</span>', '<img src="assets/3d_icons/trophy_3d.png" alt="Trophy" class="cm-icon-img" />')
html = html.replace('<div class="bxh-medal-tag medal-1">1</div>', '<img src="assets/3d_icons/medal_gold_3d.png" alt="Rank 1" class="bxh-medal-img" />')
html = html.replace('<div class="bxh-medal-tag medal-2">2</div>', '<img src="assets/3d_icons/medal_silver_3d.png" alt="Rank 2" class="bxh-medal-img" />')
html = html.replace('<div class="bxh-medal-tag medal-3">3</div>', '<img src="assets/3d_icons/medal_bronze_3d.png" alt="Rank 3" class="bxh-medal-img" />')

html = html.replace('src="assets/avatar_chy.png" alt="Minh Anh"', 'src="assets/3d_icons/avatar_chy_3d.png" alt="Minh Anh"')
html = html.replace('src="assets/avatar_habby.png" alt="Thu Hà"', 'src="assets/3d_icons/avatar_cat_3d.png" alt="Thu Hà"')
html = html.replace('src="assets/avatar_guru.png" alt="Quang Huy"', 'src="assets/3d_icons/avatar_bird_3d.png" alt="Quang Huy"')
html = html.replace('src="assets/avatar_chy.png" alt="Hương Giang"', 'src="assets/3d_icons/avatar_chy_3d.png" alt="Hương Giang"')

# 3. Update Thời gian học icons
html = html.replace('<span class="cm-icon bar-icon-orange">📊</span>', '<img src="assets/3d_icons/chart_3d.png" alt="Chart" class="cm-icon-img" />')
html = html.replace('<span class="cal-icon">📅</span>', '<img src="assets/3d_icons/calendar_3d.png" alt="Calendar" class="cal-icon-img" />')
html = html.replace('<span class="breakdown-icon">📋</span>', '<img src="assets/3d_icons/checklist_3d.png" alt="Chi tiết" class="cm-icon-img" />')

# 4. Update Bottom Nav on all screens to use new 3D icons
html = html.replace('src="assets/icons/nav_home.png" alt="Home"', 'src="assets/3d_icons/nav_home_3d.png" alt="Home"')
html = html.replace('src="assets/icons/nav_study.png" alt="Study"', 'src="assets/3d_icons/nav_study_3d.png" alt="Study"')
html = html.replace('src="assets/icons/nav_games.png" alt="Games"', 'src="assets/3d_icons/nav_games_3d.png" alt="Games"')
html = html.replace('src="assets/icons/nav_shop.png" alt="Shop"', 'src="assets/3d_icons/nav_shop_3d.png" alt="Shop"')
html = html.replace('src="assets/icons/nav_profile.png" alt="Profile"', 'src="assets/3d_icons/nav_profile_3d.png" alt="Profile"')

# Also for nav buttons without alt:
html = html.replace('src="assets/icons/nav_home.png"', 'src="assets/3d_icons/nav_home_3d.png"')
html = html.replace('src="assets/icons/nav_study.png"', 'src="assets/3d_icons/nav_study_3d.png"')
html = html.replace('src="assets/icons/nav_games.png"', 'src="assets/3d_icons/nav_games_3d.png"')
html = html.replace('src="assets/icons/nav_shop.png"', 'src="assets/3d_icons/nav_shop_3d.png"')
html = html.replace('src="assets/icons/nav_profile.png"', 'src="assets/3d_icons/nav_profile_3d.png"')

with open(r'd:\duan\chyhab-app\index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("index.html updated with 3D icons successfully!")
