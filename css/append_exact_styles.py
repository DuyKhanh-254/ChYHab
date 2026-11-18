# -*- coding: utf-8 -*-
"""
Append exact styles for the new Home and Detail screens to extra.css
"""

css_append = '''
/* ========================================================
   EXACT STYLES FOR HOME BANNER LANDSCAPE & MOCKUP CARDS
   (Matching ChatGPT Image Nov 17, 2026, 02_58_04 PM.png)
   ======================================================== */

.home-layout-clean {
  background: #F8FAFC !important;
}

.home-scroll-padding-fix {
  padding: 0 !important;
  background: #F8FAFC;
}

/* Landscape Hero Banner with the user's 3D image */
.home-hero-landscape {
  position: relative;
  width: 100%;
  min-height: 295px;
  background-image: url('../assets/home_banner_bg.png');
  background-size: cover;
  background-position: center bottom;
  background-repeat: no-repeat;
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}

/* Landscape Topbar */
.landscape-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  z-index: 10;
}
.brand-logo-svg-small {
  height: 32px;
  width: auto;
  object-fit: contain;
}
.landscape-bell-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}
.landscape-bell-btn img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.bell-alert-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 9px;
  height: 9px;
  background: #F97316;
  border-radius: 50%;
  border: 1.5px solid white;
}

/* Landscape Greeting Text */
.landscape-greeting-group {
  margin-top: 8px;
  z-index: 10;
}
.greeting-heading {
  font-size: 27px;
  font-weight: 900;
  color: #111827;
  margin: 0 0 2px 0;
  line-height: 1.15;
  letter-spacing: -0.5px;
}
.greeting-subtext {
  font-size: 13.5px;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

/* Landscape Stage (Mascot standing & Stats on right) */
.landscape-center-stage {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  position: relative;
  margin-top: 10px;
  z-index: 5;
}
.landscape-mascot-wrap {
  position: relative;
  display: flex;
  align-items: flex-end;
  margin-left: 20px;
}
.mascot-standing-img {
  height: 142px;
  width: auto;
  filter: drop-shadow(0 10px 18px rgba(0,0,0,0.18));
  transform: translateY(2px);
}

.landscape-stats-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-right: 36px;
  margin-bottom: 26px;
}
.streak-badge-large {
  display: flex;
  align-items: center;
  gap: 4px;
}
.flame-ico {
  font-size: 32px;
  line-height: 1;
  filter: drop-shadow(0 2px 6px rgba(249,115,22,0.3));
}
.streak-num-big {
  font-size: 32px;
  font-weight: 900;
  color: #EA580C;
  line-height: 1;
  letter-spacing: -0.5px;
}
.hearts-row-three {
  display: flex;
  align-items: center;
  gap: 4px;
}
.heart-item {
  font-size: 16px;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(239,68,68,0.3));
}

/* Cards Container below Landscape */
.home-cards-container {
  padding: 14px 14px 24px;
  background: #F8FAFC;
  border-radius: 20px 20px 0 0;
  margin-top: -12px;
  position: relative;
  z-index: 10;
}

/* Card Mockup Common */
.card-mockup {
  background: #FFFFFF;
  border-radius: 18px;
  border: 1.5px solid #E5E7EB;
  padding: 16px;
  margin-bottom: 14px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.03);
}
.card-mockup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.cm-title-left {
  display: flex;
  align-items: center;
  gap: 8px;
}
.cm-icon {
  font-size: 20px;
}
.cm-title-left h3 {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
  margin: 0;
}
.cm-dropdown-pill {
  background: #FFFFFF;
  border: 1.5px solid #E5E7EB;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
  color: #4B5563;
  cursor: pointer;
}

/* BXH Card Mockup */
.bxh-rows-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.bxh-user-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 12px;
  transition: background 0.15s;
}
.bxh-medal-tag {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 900;
  flex-shrink: 0;
}
.medal-1 {
  background: #FEF08A;
  color: #854D0E;
  border: 1.5px solid #FACC15;
}
.medal-2 {
  background: #F1F5F9;
  color: #475569;
  border: 1.5px solid #CBD5E1;
}
.medal-3 {
  background: #FFEDD5;
  color: #9A3412;
  border: 1.5px solid #FDBA74;
}

.bxh-avatar-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  overflow: hidden;
  background: #FFF7ED;
  border: 1.5px solid #FED7AA;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.bxh-avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.bxh-username {
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  color: #1F2937;
}
.bxh-score {
  font-size: 14px;
  font-weight: 800;
  color: #111827;
}

/* User Highlight Row (Rank 12) */
.user-highlight-row {
  background: #FFF7ED !important;
  border: 1.5px solid #FED7AA !important;
  cursor: pointer;
}
.bxh-user-rank-box {
  background: #FFFFFF;
  border: 1.5px solid #F97316;
  color: #EA580C;
  font-size: 12px;
  font-weight: 900;
  width: 26px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-mockup-footer {
  text-align: center;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #F3F4F6;
}
.btn-see-all-bxh {
  font-size: 13px;
  font-weight: 700;
  color: #F97316;
  text-decoration: none;
}
.btn-see-all-bxh:hover {
  text-decoration: underline;
}

/* Study Time Card Mockup */
.study-time-card-mockup {
  cursor: pointer;
  transition: all 0.2s;
}
.study-time-card-mockup:hover {
  border-color: #F97316;
  box-shadow: 0 4px 14px rgba(249,115,22,0.1);
}
.bar-icon-orange {
  color: #F97316;
}

.chart-info-subbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 12px;
}
.calendar-date-text {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #6B7280;
  font-weight: 600;
}
.total-week-pill {
  background: #FFF7ED;
  border: 1.5px solid #FED7AA;
  color: #EA580C;
  font-size: 11px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 999px;
}

/* Mockup Chart Container */
.mockup-chart-container {
  position: relative;
  height: 175px;
  margin-top: 8px;
  padding-left: 28px;
}
.chart-gridlines {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}
.gridline-row {
  display: flex;
  align-items: center;
  width: 100%;
}
.y-label {
  width: 24px;
  font-size: 11px;
  color: #9CA3AF;
  font-weight: 600;
  text-align: right;
  margin-right: 6px;
}
.y-label small {
  font-size: 9px;
}
.dash-line {
  flex: 1;
  border-top: 1px dashed #E5E7EB;
}
.line-solid {
  border-top: 1.5px solid #E5E7EB !important;
}

.chart-bars-row {
  position: relative;
  height: 100%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-right: 6px;
}
.chart-day-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  z-index: 2;
  height: 100%;
}
.bar-top-val {
  font-size: 11px;
  font-weight: 800;
  color: #9CA3AF;
  margin-bottom: 4px;
}
.bar-stick {
  width: 24px;
  border-radius: 4px 4px 0 0;
  background: #F97316;
  transition: height 0.4s;
}
.stick-active {
  background: #EA580C !important;
  box-shadow: 0 2px 8px rgba(234,88,12,0.3);
}
.stick-empty {
  height: 2px !important;
  width: 14px;
  background: #CBD5E1;
  border-radius: 1px;
}
.val-active {
  color: #EA580C !important;
  font-weight: 900;
}
.val-dash {
  color: #CBD5E1 !important;
}
.bar-day-name {
  font-size: 12px;
  font-weight: 700;
  color: #6B7280;
  margin-top: 6px;
}
.name-active {
  color: #111827;
  font-weight: 900;
}
.t5-underline {
  width: 20px;
  height: 2.5px;
  background: #EA580C;
  border-radius: 2px;
  margin-top: 1px;
}
.bar-bottom-min {
  font-size: 10px;
  color: #9CA3AF;
  font-weight: 600;
  margin-top: 3px;
  white-space: nowrap;
}

/* Detail Screen Topbar & Elements */
.stats-screen-topbar {
  height: 54px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: white;
  border-bottom: 1px solid #F3F4F6;
  flex-shrink: 0;
}
.calendar-nav-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4B5563;
  font-weight: 700;
  font-size: 12px;
}
.cal-arrow-btn {
  background: #F1F5F9;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  cursor: pointer;
  font-weight: 800;
  color: #64748B;
  display: flex;
  align-items: center;
  justify-content: center;
}
.breakdown-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}
.breakdown-header-title h3 {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
  margin: 0;
}
.breakdown-icon {
  font-size: 20px;
}
.day-breakdown-block {
  background: #F9FAFB;
  border: 1.5px solid #F3F4F6;
  border-radius: 14px;
  padding: 12px 14px;
  margin-bottom: 10px;
}
.day-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.day-title-row strong {
  font-size: 14px;
  color: #111827;
}
.day-total-badge {
  font-size: 13px;
  font-weight: 800;
  color: #EA580C;
}
.skills-two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.skill-line {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 2px 0;
}
.sk-name {
  color: #6B7280;
  font-weight: 600;
}
.sk-val {
  color: #9CA3AF;
  font-weight: 600;
}
.sk-val.active-val {
  color: #EA580C !important;
  font-weight: 800 !important;
}
'''

with open(r'd:\duan\chyhab-app\css\extra.css', 'a', encoding='utf-8') as f:
    f.write(css_append)

print("Appended exact Home and Detail styles to extra.css successfully!")
