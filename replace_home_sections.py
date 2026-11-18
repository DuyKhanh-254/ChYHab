# -*- coding: utf-8 -*-
"""
Replace 'Tiếp tục học' and 'Trợ lý AI ChYHab' on Home Screen with 'Chi tiết từng ngày'
"""
with open(r'd:\duan\chyhab-app\index.html', 'r', encoding='utf-8') as f:
    content = f.read()

target_to_replace = '''                <!-- Tiếp tục học dải nổi bật (PDF Trang 3) -->
                <section class="continue-strip" onclick="showScreen('screen-vocabulary')">
                  <div class="continue-strip-icon">
                    <img src="assets/icons/study_vocabulary.png" alt="Vocab" />
                  </div>
                  <div class="continue-strip-info">
                    <span class="continue-tag">Tiếp tục học</span>
                    <strong>Daily routines · Từ vựng</strong>
                    <div class="mini-progress-wrap">
                      <div class="mini-progress-bar"><div class="mini-progress-fill" style="width: 60%;"></div></div>
                      <span class="mini-progress-text">6/10</span>
                    </div>
                  </div>
                  <button class="btn-play-orange">Học tiếp ▶</button>
                </section>

                <!-- Các tính năng AI Độc Quyền (PDF Trang 1) -->
                <section class="home-block">
                  <div class="block-header">
                    <h3>✨ Trợ lý AI ChYHab</h3>
                    <span class="ai-badge-chip">Cá nhân hóa</span>
                  </div>
                  <div class="ai-features-grid">
                    <div class="ai-feat-card" onclick="openModal('modal-syllabus')">
                      <div class="ai-feat-icon icon-orange-bg">
                        <img src="assets/icons/ai_learning_path.png" alt="Syllabus AI" />
                      </div>
                      <strong>Tải Đề Cương Lớp</strong>
                      <p>AI bám sát môn Đọc-Viết trường bạn</p>
                    </div>
                    <div class="ai-feat-card" onclick="openModal('modal-ocr')">
                      <div class="ai-feat-icon icon-blue-bg">
                        <img src="assets/icons/study_read.png" alt="Camera OCR" />
                      </div>
                      <strong>Nhận Diện Từ Ảnh</strong>
                      <p>Chụp trang sách để AI tạo bài tập</p>
                    </div>
                    <div class="ai-feat-card" onclick="openModal('modal-mistakes')">
                      <div class="ai-feat-icon icon-red-bg">
                        <img src="assets/icons/ai_mistake_analysis.png" alt="Mistake AI" />
                      </div>
                      <strong>Phân Tích Lỗi Sai</strong>
                      <p>Luyện tập thích ứng HTĐ vs HTTD</p>
                    </div>
                    <div class="ai-feat-card" onclick="openModal('modal-microtask')">
                      <div class="ai-feat-icon icon-green-bg">
                        <img src="assets/icons/reward_streak.png" alt="Micro task" />
                      </div>
                      <strong>Micro-task 60s</strong>
                      <p>Ôn từ vựng siêu tốc lúc rảnh</p>
                    </div>
                  </div>
                </section>'''

replacement_daily_breakdown = '''                <!-- CARD 3: CHI TIẾT TỪNG NGÀY (EXACT MOCKUP FROM USER IMAGE) -->
                <section class="card-mockup daily-breakdown-mockup">
                  <div class="breakdown-header-title">
                    <span class="breakdown-icon">📋</span>
                    <h3>Chi tiết từng ngày</h3>
                  </div>

                  <!-- Thứ 2 · 02/11: 5 phút -->
                  <div class="day-breakdown-block">
                    <div class="day-title-row">
                      <strong>Thứ 2 · 02/11</strong>
                      <span class="day-total-badge">5 phút</span>
                    </div>
                    <div class="skills-two-columns">
                      <div class="col-skill-left">
                        <div class="skill-line"><span class="sk-name">Từ vựng:</span> <span class="sk-val active-val">5 phút</span></div>
                        <div class="skill-line"><span class="sk-name">Nghe:</span> <span class="sk-val">0 phút</span></div>
                        <div class="skill-line"><span class="sk-name">Đọc:</span> <span class="sk-val">0 phút</span></div>
                      </div>
                      <div class="col-skill-right">
                        <div class="skill-line"><span class="sk-name">Ngữ pháp:</span> <span class="sk-val">0 phút</span></div>
                        <div class="skill-line"><span class="sk-name">Nói:</span> <span class="sk-val">0 phút</span></div>
                        <div class="skill-line"><span class="sk-name">Viết:</span> <span class="sk-val">0 phút</span></div>
                      </div>
                    </div>
                  </div>

                  <!-- Thứ 3 · 03/11: 15 phút -->
                  <div class="day-breakdown-block">
                    <div class="day-title-row">
                      <strong>Thứ 3 · 03/11</strong>
                      <span class="day-total-badge">15 phút</span>
                    </div>
                    <div class="skills-two-columns">
                      <div class="col-skill-left">
                        <div class="skill-line"><span class="sk-name">Từ vựng:</span> <span class="sk-val active-val">10 phút</span></div>
                        <div class="skill-line"><span class="sk-name">Nghe:</span> <span class="sk-val">0 phút</span></div>
                        <div class="skill-line"><span class="sk-name">Đọc:</span> <span class="sk-val">0 phút</span></div>
                      </div>
                      <div class="col-skill-right">
                        <div class="skill-line"><span class="sk-name">Ngữ pháp:</span> <span class="sk-val active-val">5 phút</span></div>
                        <div class="skill-line"><span class="sk-name">Nói:</span> <span class="sk-val">0 phút</span></div>
                        <div class="skill-line"><span class="sk-name">Viết:</span> <span class="sk-val">0 phút</span></div>
                      </div>
                    </div>
                  </div>

                  <!-- Thứ 4 · 04/11: 25 phút -->
                  <div class="day-breakdown-block">
                    <div class="day-title-row">
                      <strong>Thứ 4 · 04/11</strong>
                      <span class="day-total-badge">25 phút</span>
                    </div>
                    <div class="skills-two-columns">
                      <div class="col-skill-left">
                        <div class="skill-line"><span class="sk-name">Từ vựng:</span> <span class="sk-val active-val">5 phút</span></div>
                        <div class="skill-line"><span class="sk-name">Nghe:</span> <span class="sk-val active-val">5 phút</span></div>
                        <div class="skill-line"><span class="sk-name">Đọc:</span> <span class="sk-val active-val">5 phút</span></div>
                      </div>
                      <div class="col-skill-right">
                        <div class="skill-line"><span class="sk-name">Ngữ pháp:</span> <span class="sk-val">0 phút</span></div>
                        <div class="skill-line"><span class="sk-name">Nói:</span> <span class="sk-val active-val">5 phút</span></div>
                        <div class="skill-line"><span class="sk-name">Viết:</span> <span class="sk-val active-val">5 phút</span></div>
                      </div>
                    </div>
                  </div>

                  <!-- Thứ 5 · 05/11: 60 phút -->
                  <div class="day-breakdown-block">
                    <div class="day-title-row">
                      <strong>Thứ 5 · 05/11</strong>
                      <span class="day-total-badge">60 phút</span>
                    </div>
                    <div class="skills-two-columns">
                      <div class="col-skill-left">
                        <div class="skill-line"><span class="sk-name">Từ vựng:</span> <span class="sk-val active-val">10 phút</span></div>
                        <div class="skill-line"><span class="sk-name">Nghe:</span> <span class="sk-val active-val">10 phút</span></div>
                        <div class="skill-line"><span class="sk-name">Đọc:</span> <span class="sk-val active-val">10 phút</span></div>
                      </div>
                      <div class="col-skill-right">
                        <div class="skill-line"><span class="sk-name">Ngữ pháp:</span> <span class="sk-val active-val">10 phút</span></div>
                        <div class="skill-line"><span class="sk-name">Nói:</span> <span class="sk-val active-val">10 phút</span></div>
                        <div class="skill-line"><span class="sk-name">Viết:</span> <span class="sk-val active-val">10 phút</span></div>
                      </div>
                    </div>
                  </div>
                </section>'''

if target_to_replace in content:
    content = content.replace(target_to_replace, replacement_daily_breakdown)
    with open(r'd:\duan\chyhab-app\index.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Replaced successfully!")
else:
    print("Target string not found, let's use regex.")
    import re
    p = re.compile(r'<!-- Tiếp tục học dải nổi bật.*?<!-- Các tính năng AI Độc Quyền.*?<\/section>', re.DOTALL)
    if p.search(content):
        content = p.sub(replacement_daily_breakdown, content)
        with open(r'd:\duan\chyhab-app\index.html', 'w', encoding='utf-8') as f:
            f.write(content)
        print("Replaced via regex successfully!")
    else:
        print("Regex also failed to match.")
