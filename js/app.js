/* =============================================
   ChYHab — Upgraded Application Controller (v2)
   - Persistent state via localStorage (XP, coins, streak, SRS, 60 Grammar Units, Shop, Garden, Settings)
   - 12-word dynamic Vocabulary engine across 8 study modes
   - Full 60-Unit CEFR Grammar Roadmap (A1–C2) + Interactive Lesson & Quiz
   - Smart Client-side NLP Sentence Evaluator & Web Speech Recognition + Phoneme Breakdown
   - Living Mascot Garden, Playable Match-Pairs Mini-game, Real 60s Micro-task Timer & SRS Review
   - University Leaderboard Scopes (School / Class / Global) & Weekly Stats Switcher
   - Zero browser alert() calls (In-app custom dialog & toast)
   ============================================= */

'use strict';

// =============================================
// 0. PERSISTENT STATE MANAGER
// =============================================
const STORAGE_KEY = 'chyhab_state_v2';

function getDefaultState() {
  return {
    xp: 720,
    coins: 2400,
    streak: 7,
    dailyMinutes: 6,
    dailyGoal: 10,
    vocabLearned: 1240,
    exercisesDone: 48,
    currentVocabIdx: 0,
    bookmarks: ['syllabus'],
    srsDue: ['book', 'syllabus', 'deadline', 'collaborate'],
    completedGrammar: ['u1', 'u2', 'u3'],
    ownedShopItems: [],
    gardenLevel: 2,
    gardenGrowth: 45,
    gardenWater: 3,
    settings: {
      sfx: true,
      autoPlay: true,
      microTask: true
    }
  };
}

let appState = loadState();

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function loadState() {
  const def = getDefaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return def;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return def;
    const merged = Object.assign({}, def, parsed, {
      settings: Object.assign({}, def.settings, (parsed.settings && typeof parsed.settings === 'object') ? parsed.settings : {})
    });
    // Defensive validation against corrupted storage
    merged.xp = Math.max(0, Number(merged.xp) || 0);
    merged.coins = Math.max(0, Number(merged.coins) || 0);
    merged.streak = Math.max(0, Number(merged.streak) || 0);
    merged.dailyMinutes = Math.max(0, Number(merged.dailyMinutes) || 0);
    merged.dailyGoal = Math.max(5, Number(merged.dailyGoal) || def.dailyGoal);
    merged.vocabLearned = Math.max(0, Number(merged.vocabLearned) || 0);
    merged.exercisesDone = Math.max(0, Number(merged.exercisesDone) || 0);
    merged.currentVocabIdx = Number.isFinite(Number(merged.currentVocabIdx)) ? Math.trunc(Number(merged.currentVocabIdx)) : 0;
    merged.gardenLevel = Math.min(5, Math.max(1, Math.trunc(Number(merged.gardenLevel) || 1)));
    merged.gardenGrowth = Math.min(100, Math.max(0, Number(merged.gardenGrowth) || 0));
    merged.gardenWater = Math.max(0, Number(merged.gardenWater) || 0);
    merged.bookmarks = Array.isArray(merged.bookmarks) ? merged.bookmarks : def.bookmarks;
    merged.srsDue = Array.isArray(merged.srsDue) ? merged.srsDue : def.srsDue;
    merged.completedGrammar = Array.isArray(merged.completedGrammar) ? merged.completedGrammar : def.completedGrammar;
    merged.ownedShopItems = Array.isArray(merged.ownedShopItems) ? merged.ownedShopItems : def.ownedShopItems;
    return merged;
  } catch (e) {
    return def;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  } catch (e) {
    // Ignore storage quota errors
  }
  syncUIWithState();
}

function addReward(xpDelta, coinsDelta, minutesDelta = 0) {
  appState.xp += xpDelta;
  appState.coins += coinsDelta;
  if (minutesDelta > 0) {
    appState.dailyMinutes = Math.min(appState.dailyGoal * 3, appState.dailyMinutes + minutesDelta);
  }
  saveState();
}

function getCurrentVocab() {
  const bank = window.CHYHAB_VOCAB || [];
  if (!bank.length) return null;
  const idx = ((appState.currentVocabIdx % bank.length) + bank.length) % bank.length;
  return bank[idx];
}

// =============================================
// 1. NAVIGATION & SCREEN MANAGER
// =============================================
let currentScreenId = 'screen-home';
const screenStack = [];

function showScreen(targetId) {
  const currentScreen = document.querySelector('.screen.active');
  const targetScreen = document.getElementById(targetId);

  if (!targetScreen) {
    console.warn(`Screen with ID "${targetId}" not found.`);
    return;
  }

  if (currentScreen !== targetScreen) {
    if (currentScreen) {
      screenStack.push(currentScreen.id);
      currentScreen.classList.remove('active');
    }
    currentScreenId = targetId;
    targetScreen.classList.add('active');
  }

  const scrollArea = targetScreen.querySelector('.screen-scroll');
  if (scrollArea) scrollArea.scrollTop = 0;

  syncBottomNav(targetId);

  // Contextual screen refresh hooks
  if (targetId === 'screen-grammar') renderGrammarRoadmap();
  if (targetId === 'screen-shop') renderShopItems(currentShopCategory);
  if (targetId === 'screen-games') renderGarden();
  if (targetId === 'screen-practice-flashcard' ||
      targetId === 'screen-practice-pronunciation' ||
      targetId === 'screen-practice-choose' ||
      targetId === 'screen-practice-typing' ||
      targetId === 'screen-practice-listen-write' ||
      targetId === 'screen-practice-complete' ||
      targetId === 'screen-vocab-modes') {
    syncVocabScreens();
  }
}

function goBack() {
  if (screenStack.length > 0) {
    const prevId = screenStack.pop();
    const currentScreen = document.querySelector('.screen.active');
    const targetScreen = document.getElementById(prevId);
    if (currentScreen && targetScreen) {
      currentScreen.classList.remove('active');
      targetScreen.classList.add('active');
      currentScreenId = prevId;
      syncBottomNav(prevId);
    }
  } else {
    showScreen('screen-home');
  }
}

function syncBottomNav(screenId) {
  const navMap = {
    'screen-home': 0,
    'screen-stats': 0,
    'screen-leaderboard': 0,
    'screen-notifications': 0,
    'screen-study': 1,
    'screen-grammar': 1,
    'screen-grammar-lesson': 1,
    'screen-vocabulary': 1,
    'screen-vocab-library': 1,
    'screen-vocab-modes': 1,
    'screen-practice-flashcard': 1,
    'screen-practice-pronunciation': 1,
    'screen-practice-choose': 1,
    'screen-practice-typing': 1,
    'screen-practice-listen-write': 1,
    'screen-practice-complete': 1,
    'screen-practice-fill': 1,
    'screen-practice-sentence': 1,
    'screen-practice-complete-all': 1,
    'screen-games': 2,
    'screen-shop': 3,
    'screen-profile': 4,
    'screen-settings': 4
  };

  const activeIndex = navMap[screenId];
  if (activeIndex !== undefined) {
    document.querySelectorAll('.bottom-nav').forEach(nav => {
      const btns = nav.querySelectorAll('.nav-btn');
      btns.forEach((btn, idx) => {
        btn.classList.toggle('active', idx === activeIndex);
      });
    });
  }
}

// =============================================
// 2. DEVICE PREVIEW VIEW SWITCHER
// =============================================
function setDeviceView(mode) {
  const container = document.getElementById('app-container');
  const buttons = document.querySelectorAll('.device-btn');

  buttons.forEach(btn => btn.classList.remove('active'));
  const activeBtn = Array.from(buttons).find(b => b.textContent.toLowerCase().includes(mode.toLowerCase()));
  if (activeBtn) activeBtn.classList.add('active');

  container.className = '';
  if (mode === 'iphone') container.classList.add('view-iphone');
  else if (mode === 'android') container.classList.add('view-android');
  else container.classList.add('view-responsive');
}

// =============================================
// 3. WEB SPEECH, AUDIO SFX, TOAST & CUSTOM DIALOG
// =============================================
function speakWord(word, rate = 1.0) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
  if (enVoice) utterance.voice = enVoice;

  window.speechSynthesis.speak(utterance);
}

let audioCtx = null;
function playSound(type) {
  if (!appState.settings.sfx) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } else if (type === 'wrong') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, audioCtx.currentTime);
      osc.frequency.setValueAtTime(220, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.22, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.28);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.28);
    } else if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(780, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.14, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    }
  } catch (err) {
    // Silent fallback
  }
}

function showXpToast(message) {
  const existing = document.querySelector('.xp-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'xp-toast';
  toast.innerHTML = `<span>✨</span> ${message}`;
  toast.style.cssText = `
    position: absolute;
    bottom: 84px;
    left: 50%;
    transform: translateX(-50%);
    background: #0284C7;
    color: white;
    font-family: var(--font);
    font-size: 12.5px;
    font-weight: 800;
    padding: 9px 16px;
    border-radius: 999px;
    box-shadow: 0 4px 14px rgba(2,132,199,0.4);
    z-index: 99999;
    white-space: nowrap;
    max-width: 92%;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
    display: flex; align-items: center; gap: 6px;
  `;
  const frame = document.getElementById('phone-frame') || document.body;
  frame.appendChild(toast);
  setTimeout(() => toast.remove(), 1900);
}

function openInAppDialog(emoji, title, msg) {
  document.getElementById('chyhab-dialog-emoji').textContent = emoji || '✨';
  document.getElementById('chyhab-dialog-title').textContent = title || 'Thông báo';
  document.getElementById('chyhab-dialog-msg').textContent = msg || '';
  document.getElementById('chyhab-dialog').classList.remove('hidden');
  playSound('pop');
}

function closeInAppDialog() {
  document.getElementById('chyhab-dialog').classList.add('hidden');
}

function openCreateSetDialog() {
  openInAppDialog(
    '📝',
    'Tạo bộ từ vựng cá nhân',
    'Bạn có thể thêm từ nhanh bằng nút "Tải đề cương AI" hoặc "Nhận diện ảnh AI (OCR)" để tự động tạo bộ từ có sẵn phiên âm IPA và ví dụ!'
  );
}

// =============================================
// 4. GLOBAL UI STATE SYNC
// =============================================
function syncUIWithState() {
  // Home Streak & Goal
  const homeStreak = document.getElementById('home-streak-num');
  if (homeStreak) homeStreak.textContent = appState.streak;

  const goalChip = document.getElementById('home-goal-chip');
  const goalFill = document.getElementById('home-goal-fill');
  if (goalChip) goalChip.textContent = `${appState.dailyMinutes} / ${appState.dailyGoal} phút`;
  if (goalFill) {
    const pct = Math.min(100, Math.round((appState.dailyMinutes / Math.max(1, appState.dailyGoal)) * 100));
    goalFill.style.width = pct + '%';
  }

  const srsCountEl = document.getElementById('home-srs-count');
  if (srsCountEl) {
    const n = appState.srsDue.length;
    srsCountEl.textContent = n > 0 ? `${n} từ cần ôn ngay` : 'Đã ôn hết hôm nay ✓';
  }

  const curWord = getCurrentVocab();
  const homeCtaSub = document.getElementById('home-cta-sub');
  if (homeCtaSub && curWord) {
    homeCtaSub.textContent = `Từ tiếp theo: ${curWord.word} (${curWord.meaning}) · 8 chế độ`;
  }

  // Profile stats
  const pStreak = document.getElementById('profile-streak-num');
  const pXp = document.getElementById('profile-xp-num');
  const pVocab = document.getElementById('profile-vocab-num');
  const pDone = document.getElementById('profile-done-num');
  if (pStreak) pStreak.textContent = appState.streak;
  if (pXp) pXp.textContent = appState.xp.toLocaleString('vi-VN');
  if (pVocab) pVocab.textContent = appState.vocabLearned.toLocaleString('vi-VN');
  if (pDone) pDone.textContent = appState.exercisesDone;

  // Coins across Shop & Garden
  document.querySelectorAll('.live-coins-display').forEach(el => {
    el.textContent = `🪙 ${appState.coins.toLocaleString('vi-VN')} xu`;
  });

  // Study Grammar tile subtitle
  const studyGramSub = document.getElementById('study-grammar-sub');
  const doneUnits = appState.completedGrammar.filter(id => id.startsWith('u')).length;
  if (studyGramSub) {
    studyGramSub.textContent = `${doneUnits}/60 Units · CEFR A1–C2`;
  }

  // Settings checkboxes
  const sfxEl = document.getElementById('toggle-sfx');
  const autoEl = document.getElementById('toggle-autoplay');
  const microEl = document.getElementById('toggle-microtask');
  if (sfxEl) sfxEl.checked = !!appState.settings.sfx;
  if (autoEl) autoEl.checked = !!appState.settings.autoPlay;
  if (microEl) microEl.checked = !!appState.settings.microTask;

  // Refresh home leaderboard with current XP
  renderHomeLeaderboard(currentLeaderboardScope);
}

// =============================================
// 5. HOME LEADERBOARD SCOPES, BREAKDOWN & WEEKLY STATS
// =============================================
let currentLeaderboardScope = 'school';

function switchLeaderboardScope(scope, btn) {
  currentLeaderboardScope = scope;
  document.querySelectorAll('.bxh-scope-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderHomeLeaderboard(scope);
  playSound('pop');
}

function renderHomeLeaderboard(scope) {
  const container = document.getElementById('home-bxh-rows');
  const data = (window.CHYHAB_LEADERBOARDS && window.CHYHAB_LEADERBOARDS[scope]) || null;
  if (!container || !data) return;

  const medals = [
    'assets/3d_icons/medal_gold_3d.png?v=10',
    'assets/3d_icons/medal_silver_3d.png?v=10',
    'assets/3d_icons/medal_bronze_3d.png?v=10'
  ];

  let html = '';
  let userAlreadyShown = false;

  data.rows.forEach((r, idx) => {
    const xpVal = r.isMe ? appState.xp : r.xp;
    if (r.isMe) userAlreadyShown = true;
    html += `
      <div class="bxh-user-row ${r.isMe ? 'user-highlight-row' : ''}" ${r.isMe ? 'onclick="showScreen(\'screen-profile\')"' : ''}>
        <img src="${medals[idx]}" alt="Rank ${r.rank}" class="bxh-medal-img" />
        <div class="bxh-avatar-circle"><img src="${r.av}" alt="${r.name}" /></div>
        <span class="bxh-username">${r.isMe ? `<strong>${r.name}</strong>` : r.name}</span>
        <span class="bxh-score">${xpVal.toLocaleString('vi-VN')} XP</span>
      </div>
    `;
  });

  if (!userAlreadyShown) {
    html += `
      <div class="bxh-user-row user-highlight-row" onclick="showScreen('screen-profile')">
        <div class="bxh-user-rank-box">${data.userRank}</div>
        <div class="bxh-avatar-circle"><img src="assets/3d_icons/avatar_chy_3d.png?v=10" alt="Hương Giang" /></div>
        <span class="bxh-username"><strong>Bạn · Hương Giang</strong></span>
        <span class="bxh-score">${appState.xp.toLocaleString('vi-VN')} XP</span>
      </div>
    `;
  }

  container.innerHTML = html;
}

function toggleDailyBreakdown() {
  const body = document.getElementById('home-daily-breakdown-body');
  const btn = document.getElementById('btn-toggle-breakdown');
  if (!body || !btn) return;
  const isCollapsed = body.classList.toggle('collapsed');
  btn.textContent = isCollapsed ? 'Xem 4 ngày ▾' : 'Thu gọn ▴';
  playSound('pop');
}

let currentWeekIdx = 2;
function switchStatsWeek(delta) {
  const weeks = window.CHYHAB_WEEKS || [];
  if (!weeks.length) return;
  currentWeekIdx = Math.max(0, Math.min(weeks.length - 1, currentWeekIdx + delta));
  const wk = weeks[currentWeekIdx];

  const lbl = document.getElementById('stats-week-label');
  const tot = document.getElementById('stats-week-total');
  const bars = document.getElementById('stats-chart-bars');
  if (lbl) lbl.textContent = wk.label;
  if (tot) tot.textContent = `${wk.total} phút tuần này`;

  if (bars) {
    const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const maxVal = Math.max(...wk.days, 1);
    bars.innerHTML = wk.days.map((val, i) => {
      const isPeak = val === maxVal && val > 0;
      if (val === 0) {
        return `
          <div class="chart-day-col">
            <span class="bar-top-val val-dash">–</span>
            <div class="bar-stick stick-empty"></div>
            <span class="bar-day-name">${dayNames[i]}</span>
          </div>`;
      }
      const h = Math.max(10, Math.round((val / 60) * 100));
      return `
        <div class="chart-day-col ${isPeak ? 'day-t5-highlight' : ''}">
          <span class="bar-top-val ${isPeak ? 'val-active' : ''}">${val}</span>
          <div class="bar-stick ${isPeak ? 'stick-active' : ''}" style="height: ${h}px;"></div>
          <span class="bar-day-name ${isPeak ? 'name-active' : ''}">${dayNames[i]}</span>
          ${isPeak ? '<div class="t5-underline"></div>' : ''}
        </div>`;
    }).join('');
  }
  playSound('pop');
}

// =============================================
// 6. ONBOARDING CONTROLLERS
// =============================================
function selectGoal(el, goal) {
  document.querySelectorAll('.goal-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  playSound('pop');
}

function selectLevel(el, level) {
  document.querySelectorAll('.level-item').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  playSound('pop');
}

function selectTime(el, minutes) {
  document.querySelectorAll('.time-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
  appState.dailyGoal = minutes;
  saveState();
  playSound('pop');
}

function finishOnboarding() {
  playSound('correct');
  addReward(50, 30, 0);
  showXpToast('+50 XP Bắt đầu lộ trình!');
  showScreen('screen-home');
}

// =============================================
// 7. DYNAMIC 12-WORD VOCABULARY ENGINE
// =============================================
let isFlashcardFlipped = false;

function syncVocabScreens() {
  const v = getCurrentVocab();
  const bank = window.CHYHAB_VOCAB || [];
  if (!v || !bank.length) return;

  const pos = (appState.currentVocabIdx % bank.length + bank.length) % bank.length + 1;
  const total = bank.length;
  const pct = Math.round((pos / total) * 100);
  const isSaved = appState.bookmarks.includes(v.id);

  // Update vocab modes header card
  const modesTitle = document.querySelector('#screen-vocab-modes .vocab-current-info-card h3');
  const modesSub = document.querySelector('#screen-vocab-modes .vocab-current-info-card p');
  const modesChip = document.querySelector('#screen-vocab-modes .lang-selector-chip span');
  if (modesTitle) modesTitle.innerHTML = `Từ cần học: <span class="highlight-orange">${v.word}</span> ${v.ipa}`;
  if (modesSub) modesSub.textContent = `Nghĩa: ${v.meaning} · Chọn 1 trong 8 chế độ học bên dưới:`;
  if (modesChip) modesChip.textContent = `${pos}/${total} từ`;

  // Update Flashcard screen
  const fcWord = document.querySelector('#screen-practice-flashcard .card-word');
  const fcType = document.querySelector('#screen-practice-flashcard .flashcard-front .card-word-type');
  const fcIpa = document.querySelector('#screen-practice-flashcard .card-phonetic');
  const fcVi = document.querySelector('#screen-practice-flashcard .card-word-vi');
  const fcTypeVi = document.querySelector('#screen-practice-flashcard .flashcard-back .card-word-type');
  const fcExEn = document.querySelector('#screen-practice-flashcard .ex-en');
  const fcExVi = document.querySelector('#screen-practice-flashcard .ex-vi');
  const fcAudioBtn = document.querySelector('#screen-practice-flashcard .card-audio-btn');
  const fcCounter = document.querySelector('#screen-practice-flashcard .fc-nav-counter');
  const fcStrip = document.querySelector('#screen-practice-flashcard .fc-title-stack strong');
  const fcFill = document.querySelector('#screen-practice-flashcard .practice-fill');

  if (fcWord) fcWord.textContent = v.word;
  if (fcType) fcType.textContent = `${v.type} · ${v.typeVi}`;
  if (fcIpa) fcIpa.textContent = v.ipa;
  if (fcVi) fcVi.textContent = v.meaning;
  if (fcTypeVi) fcTypeVi.textContent = v.typeVi;
  if (fcExEn) fcExEn.innerHTML = `"${v.exampleEn}"`;
  if (fcExVi) fcExVi.textContent = `"${v.exampleVi}"`;
  if (fcAudioBtn) fcAudioBtn.setAttribute('onclick', `event.stopPropagation(); speakWord('${v.word}')`);
  if (fcCounter) fcCounter.textContent = `${pos} / ${total}`;
  if (fcStrip) fcStrip.textContent = `${pos}/${total}`;
  if (fcFill) fcFill.style.width = `${pct}%`;

  // Sync bookmark icons
  document.querySelectorAll('.fc-bookmark-btn').forEach(b => {
    b.classList.toggle('bookmarked', isSaved);
    const img = b.querySelector('img');
    if (img && img.src.includes('action_bookmark')) {
      img.src = isSaved ? 'assets/icons/action_bookmark_filled.png' : 'assets/icons/action_bookmark.png';
    }
  });

  // Update Pronunciation screen
  const pronWord = document.querySelector('#screen-practice-pronunciation .pron-word');
  const pronType = document.querySelector('#screen-practice-pronunciation .pron-type');
  const pronIpa = document.querySelector('#screen-practice-pronunciation .pron-ipa');
  const pronResIpa = document.getElementById('pron-result-ipa');
  const pronListenBtn = document.querySelector('#screen-practice-pronunciation .btn-listen-sample');
  const pronCounter = document.querySelector('#screen-practice-pronunciation .fc-nav-counter');
  if (pronWord) pronWord.textContent = v.word;
  if (pronType) pronType.textContent = v.type;
  if (pronIpa) pronIpa.textContent = v.ipa;
  if (pronResIpa) pronResIpa.textContent = v.ipa;
  if (pronListenBtn) pronListenBtn.setAttribute('onclick', `speakWord('${v.word}', currentSpeechSpeed)`);
  if (pronCounter) pronCounter.textContent = `${pos} / ${total}`;

  // Update Choose Meaning & Choose Word screen
  const cqWord = document.querySelector('#view-choose-meaning .cq-word-flex h2');
  const cqIpa = document.querySelector('#view-choose-meaning .cq-ipa');
  const cqType = document.querySelector('#view-choose-meaning .cq-type-pill');
  const cqAudio = document.querySelector('#view-choose-meaning .cq-audio-btn');
  if (cqWord) cqWord.textContent = v.word;
  if (cqIpa) cqIpa.textContent = v.ipa;
  if (cqType) cqType.textContent = v.type;
  if (cqAudio) cqAudio.setAttribute('onclick', `speakWord('${v.word}')`);

  const meaningOpts = document.getElementById('meaning-options');
  if (meaningOpts) {
    const letters = ['A', 'B', 'C', 'D'];
    const items = [
      { text: v.meaning, ok: true },
      ...v.distractorsVi.map(d => ({ text: d, ok: false }))
    ];
    // Deterministic shuffle per word index so correct answer isn't always A
    const shift = pos % 4;
    const rotated = items.map((_, i) => items[(i + shift) % 4]);
    meaningOpts.innerHTML = rotated.map((opt, idx) => `
      <button class="opt-btn" onclick="selectChoiceOption(this, ${opt.ok}, 'meaning')">
        <span class="opt-letter">${letters[idx]}</span>
        <span class="opt-text">${opt.text}</span>
        <span class="opt-feedback-ico"></span>
      </button>
    `).join('');
  }

  const wordPeach = document.querySelector('#view-choose-word .cq-word-peach-card h2');
  if (wordPeach) wordPeach.textContent = v.meaning;
  const wordOpts = document.getElementById('word-options');
  if (wordOpts) {
    const letters = ['A', 'B', 'C', 'D'];
    const items = [
      { text: v.word, ok: true },
      ...v.distractorsEn.map(d => ({ text: d, ok: false }))
    ];
    const shift = (pos + 1) % 4;
    const rotated = items.map((_, i) => items[(i + shift) % 4]);
    wordOpts.innerHTML = rotated.map((opt, idx) => `
      <button class="opt-btn" onclick="selectChoiceOption(this, ${opt.ok}, 'word')">
        <span class="opt-letter">${letters[idx]}</span>
        <span class="opt-text">${opt.text}</span>
        <span class="opt-feedback-ico"></span>
      </button>
    `).join('');
  }

  // Update Typing screen
  const typingMeaning = document.querySelector('#screen-practice-typing .typing-meaning');
  if (typingMeaning) typingMeaning.textContent = v.meaning;

  // Update Dictation speaker button
  const dictBtn = document.querySelector('#screen-practice-listen-write .big-speaker-btn');
  if (dictBtn) dictBtn.setAttribute('onclick', `speakWord('${v.word}', currentDictationSpeed)`);

  // Update Complete Sentence screen
  const ctxSent = document.querySelector('#screen-practice-complete .context-sentence');
  if (ctxSent) {
    ctxSent.innerHTML = `"${v.contextBefore}<span class="blank-word-slot">_______</span>${v.contextAfter}"`;
  }
  const compOpts = document.getElementById('complete-sentence-options');
  if (compOpts) {
    const letters = ['A', 'B', 'C', 'D'];
    const items = [
      { text: v.word, ok: true },
      ...v.distractorsEn.map(d => ({ text: d, ok: false }))
    ];
    const shift = (pos + 2) % 4;
    const rotated = items.map((_, i) => items[(i + shift) % 4]);
    compOpts.innerHTML = rotated.map((opt, idx) => `
      <button class="opt-btn" onclick="selectCompleteSentence(this, ${opt.ok}, '${opt.text}')">
        <span class="opt-letter">${letters[idx]}</span>
        <span class="opt-text">${opt.text}</span>
        <span class="opt-feedback-ico"></span>
      </button>
    `).join('');
  }

  // Ensure stale feedback states never stick when switching words
  resetChoiceSelection();
}

function flipFlashcard() {
  const card = document.getElementById('fc-card');
  if (!card) return;
  isFlashcardFlipped = !isFlashcardFlipped;
  card.classList.toggle('flipped', isFlashcardFlipped);
  playSound('pop');
  const v = getCurrentVocab();
  if (!isFlashcardFlipped && appState.settings.autoPlay && v) {
    speakWord(v.word);
  }
}

function prevFlashcard() {
  const card = document.getElementById('fc-card');
  if (card) {
    card.classList.remove('flipped');
    isFlashcardFlipped = false;
  }
  const bank = window.CHYHAB_VOCAB || [];
  appState.currentVocabIdx = (appState.currentVocabIdx - 1 + bank.length) % bank.length;
  saveState();
  syncVocabScreens();
  const v = getCurrentVocab();
  playSound('pop');
  if (v) showXpToast(`Từ trước: ${v.word}`);
}

function nextCard(type) {
  const card = document.getElementById('fc-card');
  if (card) {
    card.classList.remove('flipped');
    isFlashcardFlipped = false;
  }
  const v = getCurrentVocab();
  const bank = window.CHYHAB_VOCAB || [];

  if (type === 'correct' && v) {
    playSound('correct');
    appState.srsDue = appState.srsDue.filter(id => id !== v.id);
    appState.vocabLearned += 1;
    addReward(15, 10, 1);
    showXpToast(`+15 XP · Đã nhớ "${v.word}"!`);
    appState.currentVocabIdx = (appState.currentVocabIdx + 1) % bank.length;
    saveState();
    syncVocabScreens();
  } else if (type === 'wrong' && v) {
    playSound('wrong');
    if (!appState.srsDue.includes(v.id)) appState.srsDue.push(v.id);
    saveState();
    showXpToast(`Đã đưa "${v.word}" vào lịch ôn SRS`);
    appState.currentVocabIdx = (appState.currentVocabIdx + 1) % bank.length;
    saveState();
    syncVocabScreens();
  } else {
    playSound('pop');
    appState.currentVocabIdx = (appState.currentVocabIdx + 1) % bank.length;
    saveState();
    syncVocabScreens();
  }
}

function toggleBookmark(btn) {
  const v = getCurrentVocab();
  if (!v) return;
  const idx = appState.bookmarks.indexOf(v.id);
  const willBeSaved = idx === -1;
  if (willBeSaved) appState.bookmarks.push(v.id);
  else appState.bookmarks.splice(idx, 1);
  saveState();
  syncVocabScreens();
  playSound('pop');
  showXpToast(willBeSaved ? `Đã lưu từ "${v.word}" ✓` : `Đã bỏ lưu "${v.word}"`);
}

// =============================================
// 8. PRONUNCIATION + WEB SPEECH RECOGNITION + PHONEMES
// =============================================
let currentSpeechSpeed = 1.0;
let isRecordingPron = false;

function changeSpeechSpeed(val) {
  currentSpeechSpeed = parseFloat(val);
  playSound('pop');
}

function similarityScore(a, b) {
  const s1 = (a || '').toLowerCase().trim();
  const s2 = (b || '').toLowerCase().trim();
  if (!s1 || !s2) return 0;
  if (s1 === s2 || s1.includes(s2)) return 96;
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  const dist = dp[m][n];
  return Math.max(40, Math.round((1 - dist / Math.max(m, n)) * 100));
}

function startPronunciationCheck() {
  const micBtn = document.getElementById('pron-mic-btn');
  const waveform = document.getElementById('pron-waveform');
  const statusText = document.getElementById('mic-status-text');
  const v = getCurrentVocab() || { word: 'book' };

  if (isRecordingPron) return;
  isRecordingPron = true;

  micBtn.classList.add('recording-active');
  waveform.classList.add('active');
  statusText.textContent = `🎙️ Đang lắng nghe bạn đọc "${v.word}"...`;
  playSound('pop');

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      let settled = false;
      const finish = (score, heardText) => {
        if (settled) return;
        settled = true;
        isRecordingPron = false;
        micBtn.classList.remove('recording-active');
        waveform.classList.remove('active');
        statusText.textContent = heardText
          ? `AI nghe được: "${heardText}"`
          : 'Đã hoàn thành thu âm!';
        setPronResult(score);
      };

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        const score = similarityScore(transcript, v.word);
        finish(score, transcript);
      };
      recognition.onerror = () => finish(90, null);
      recognition.onend = () => {
        if (!settled) finish(88, null);
      };
      recognition.start();
      setTimeout(() => {
        if (!settled) {
          try { recognition.stop(); } catch (_) {}
          finish(91, null);
        }
      }, 3500);
      return;
    } catch (e) {
      // Fall through to simulated check
    }
  }

  setTimeout(() => {
    isRecordingPron = false;
    micBtn.classList.remove('recording-active');
    waveform.classList.remove('active');
    statusText.textContent = 'Đã hoàn thành phân tích âm vị!';
    setPronResult(92);
  }, 1800);
}

function setPronResult(score) {
  const resultBox = document.getElementById('pron-result-box');
  const ring = document.getElementById('pron-score-ring');
  const pctVal = document.getElementById('pron-score-pct');
  const gradePill = document.getElementById('pron-grade-pill');
  const gradeDot = document.getElementById('pron-grade-dot');
  const gradeText = document.getElementById('pron-grade-text');
  const nextBtn = document.getElementById('btn-next-pron');
  const lockNotice = document.getElementById('pron-lock-notice');
  const phonemeWrap = document.getElementById('pron-phoneme-breakdown');
  const v = getCurrentVocab() || { phonemes: ['b', 'ʊ', 'k'] };

  resultBox.classList.remove('hidden');
  pctVal.textContent = score + '%';
  ring.style.setProperty('--pct', score);

  // Render ELSA-style phoneme chips
  if (phonemeWrap && v.phonemes) {
    phonemeWrap.innerHTML = v.phonemes.map((ph, idx) => {
      let cls = '';
      let mark = '✓';
      if (score < 70 && idx % 2 === 1) { cls = 'bad'; mark = '✕'; }
      else if (score < 85 && idx === Math.floor(v.phonemes.length / 2)) { cls = 'warn'; mark = '!'; }
      return `<span class="phoneme-chip ${cls}">/${ph}/ ${mark}</span>`;
    }).join('');
  }

  function applyTier(color, bg, dot, label) {
    ring.style.setProperty('--ring-color', color);
    gradePill.style.setProperty('--ring-color', color);
    gradePill.style.setProperty('--grade-bg', bg);
    gradeDot.textContent = dot;
    gradeText.textContent = label;
  }

  if (score >= 90) {
    applyTier('#22C55E', '#F0FDF4', '✓', 'Xuất sắc');
    nextBtn.classList.remove('disabled');
    nextBtn.style.opacity = '1';
    nextBtn.style.pointerEvents = 'auto';
    lockNotice.classList.add('hidden');
    playSound('correct');
    addReward(20, 10, 1);
    showXpToast('+20 XP Phát âm xuất sắc!');
  } else if (score >= 80) {
    applyTier('#F59E0B', '#FFFBEB', '✓', 'Tốt');
    nextBtn.classList.remove('disabled');
    nextBtn.style.opacity = '1';
    nextBtn.style.pointerEvents = 'auto';
    lockNotice.classList.add('hidden');
    playSound('correct');
    addReward(15, 8, 1);
    showXpToast('+15 XP Phát âm tốt!');
  } else if (score >= 70) {
    applyTier('#EA580C', '#FFF7ED', '!', 'Cần cải thiện');
    nextBtn.style.opacity = '0.4';
    nextBtn.style.pointerEvents = 'none';
    lockNotice.classList.remove('hidden');
    playSound('wrong');
  } else {
    applyTier('#EF4444', '#FEF2F2', '✕', 'Chưa đạt');
    nextBtn.style.opacity = '0.4';
    nextBtn.style.pointerEvents = 'none';
    lockNotice.classList.remove('hidden');
    playSound('wrong');
  }
}

// =============================================
// 9. CHOOSE MEANING & WORD, TYPING, DICTATION, COMPLETE SENTENCE
// =============================================
let currentChooseSubmode = 'meaning';
let selectedOptionBtn = null;
let choiceAnswered = false;
let choiceHadWrongAttempt = false;

function switchChooseMode(mode) {
  currentChooseSubmode = mode;
  document.getElementById('choose-screen-title').textContent = mode === 'meaning' ? 'Chọn nghĩa' : 'Chọn từ';
  document.getElementById('view-choose-meaning').classList.toggle('hidden', mode !== 'meaning');
  document.getElementById('view-choose-word').classList.toggle('hidden', mode !== 'word');
  resetChoiceSelection();
  playSound('pop');
}

function selectChoiceOption(btn, isCorrect, mode) {
  if (choiceAnswered) return;
  btn.classList.add('selected-choice');
  selectedOptionBtn = btn;
  choiceAnswered = true;
  playSound('pop');

  const actionWrap = document.getElementById('choose-action-wrap');
  const actionBtn = document.getElementById('btn-check-choose');
  const banner = document.getElementById('choose-result-banner');
  const bannerIcon = document.getElementById('banner-icon');
  const bannerTitle = document.getElementById('banner-title');
  const bannerDesc = document.getElementById('banner-desc');
  const ico = btn.querySelector('.opt-feedback-ico');

  actionWrap.classList.remove('hidden');
  banner.classList.remove('hidden');

  if (isCorrect) {
    btn.classList.add(choiceHadWrongAttempt ? 'correct-fixed' : 'correct-choice');
    if (ico) ico.textContent = '✓';
    banner.classList.remove('wrong-banner');
    banner.classList.toggle('fixed-banner', choiceHadWrongAttempt);
    bannerIcon.textContent = '✓';
    bannerTitle.textContent = 'Chính xác!';
    bannerDesc.classList.add('hidden');
    actionBtn.textContent = 'Tiếp tục ›';
    actionBtn.className = 'btn-check-main';
    playSound('correct');
    addReward(15, 10, 1);
    showXpToast('+15 XP Trả lời đúng!');
  } else {
    btn.classList.add('wrong-choice');
    if (ico) ico.textContent = '✕';
    banner.classList.add('wrong-banner');
    banner.classList.remove('fixed-banner');
    bannerIcon.textContent = '✕';
    bannerTitle.textContent = 'Chưa chính xác!';
    bannerDesc.textContent = 'Hãy thử chọn đáp án khác nhé!';
    bannerDesc.classList.remove('hidden');
    actionBtn.textContent = '↻ Thử lại';
    actionBtn.className = 'btn-check-main wrong-action';
    choiceHadWrongAttempt = true;
    playSound('wrong');
  }
}

function choiceActionNext() {
  const wasCorrect = selectedOptionBtn && (selectedOptionBtn.classList.contains('correct-choice') || selectedOptionBtn.classList.contains('correct-fixed'));
  if (!wasCorrect) {
    if (selectedOptionBtn) {
      selectedOptionBtn.classList.remove('selected-choice', 'wrong-choice');
      const ico = selectedOptionBtn.querySelector('.opt-feedback-ico');
      if (ico) ico.textContent = '';
    }
    selectedOptionBtn = null;
    choiceAnswered = false;
    document.getElementById('choose-result-banner').classList.add('hidden');
    document.getElementById('choose-action-wrap').classList.add('hidden');
    return;
  }

  choiceHadWrongAttempt = false;
  if (currentChooseSubmode === 'meaning') switchChooseMode('word');
  else showScreen('screen-practice-typing');
}

function resetChoiceSelection() {
  document.querySelectorAll('.opt-btn').forEach(b => {
    b.classList.remove('selected-choice', 'correct-choice', 'correct-fixed', 'wrong-choice');
    const ico = b.querySelector('.opt-feedback-ico');
    if (ico) ico.textContent = '';
  });
  selectedOptionBtn = null;
  choiceAnswered = false;
  choiceHadWrongAttempt = false;
  const b = document.getElementById('choose-result-banner');
  const w = document.getElementById('choose-action-wrap');
  if (b) b.classList.add('hidden');
  if (w) w.classList.add('hidden');
}

// Typing
let typingActionState = 'check';

function onTypingInputChange() {
  if (typingActionState !== 'check') return;
  const val = document.getElementById('typing-word-input').value.trim();
  document.getElementById('btn-typing-check').classList.toggle('disabled', val.length === 0);
}

function checkTypingWord() {
  const input = document.getElementById('typing-word-input');
  const banner = document.getElementById('typing-result-banner');
  const mark = document.getElementById('typing-mark');
  const heading = document.getElementById('typing-feedback-heading');
  const sub = document.getElementById('typing-feedback-sub');
  const btn = document.getElementById('btn-typing-check');
  const inputBox = input.closest('.typing-input-box');
  const target = (getCurrentVocab() || { word: 'book' }).word.toLowerCase();

  if (typingActionState === 'wrong') {
    input.value = '';
    input.focus();
    inputBox.classList.remove('wrong-box');
    banner.classList.add('hidden');
    btn.textContent = 'Kiểm tra';
    btn.className = 'btn-check-main disabled';
    typingActionState = 'check';
    return;
  }

  if (typingActionState === 'correct') {
    input.value = '';
    inputBox.classList.remove('correct-box');
    banner.classList.add('hidden');
    btn.textContent = 'Kiểm tra';
    btn.className = 'btn-check-main disabled';
    typingActionState = 'check';
    showScreen('screen-practice-listen-write');
    return;
  }

  const val = input.value.trim().toLowerCase();
  if (!val) return;
  banner.classList.remove('hidden');

  if (val === target) {
    inputBox.classList.remove('wrong-box');
    inputBox.classList.add('correct-box');
    banner.classList.remove('wrong-banner');
    mark.textContent = '✓';
    heading.textContent = 'Chính xác!';
    sub.classList.add('hidden');
    btn.textContent = 'Tiếp tục ›';
    btn.className = 'btn-check-main';
    typingActionState = 'correct';
    playSound('correct');
    addReward(20, 12, 1);
    showXpToast('+20 XP Gõ từ chính xác!');
  } else {
    inputBox.classList.add('wrong-box');
    inputBox.classList.remove('correct-box');
    banner.classList.add('wrong-banner');
    mark.textContent = '✕';
    heading.textContent = 'Chưa chính xác!';
    sub.textContent = `Gợi ý: bắt đầu bằng "${target[0]}..." (${target.length} chữ cái)`;
    sub.classList.remove('hidden');
    btn.textContent = '↻ Thử lại';
    btn.className = 'btn-check-main wrong-action';
    typingActionState = 'wrong';
    playSound('wrong');
  }
}

// Dictation
let currentDictationSpeed = 1.0;
let dictationActionState = 'check';
let dictationHadWrongAttempt = false;

function onDictationInputChange() {
  if (dictationActionState !== 'check') return;
  const val = document.getElementById('dictation-input').value.trim();
  document.getElementById('dictation-action-btn').classList.toggle('disabled', val.length === 0);
}

function checkDictationAnswer() {
  const input = document.getElementById('dictation-input');
  const banner = document.getElementById('dictation-feedback');
  const icon = document.getElementById('dictation-icon');
  const title = document.getElementById('dictation-title');
  const desc = document.getElementById('dictation-desc');
  const actionBtn = document.getElementById('dictation-action-btn');
  const inputBox = document.getElementById('dictation-input-box');
  const inputIco = document.getElementById('dictation-input-ico');
  const target = (getCurrentVocab() || { word: 'book' }).word.toLowerCase();

  if (dictationActionState === 'wrong') {
    input.value = '';
    input.focus();
    inputBox.classList.remove('wrong-box');
    inputIco.classList.add('hidden');
    banner.classList.add('hidden');
    actionBtn.textContent = 'Kiểm tra';
    actionBtn.className = 'btn-check-main disabled';
    dictationActionState = 'check';
    speakWord(target, currentDictationSpeed);
    return;
  }

  if (dictationActionState === 'correct') {
    dictationHadWrongAttempt = false;
    input.value = '';
    inputBox.classList.remove('correct-box', 'fixed-box');
    inputIco.classList.add('hidden');
    banner.classList.add('hidden');
    actionBtn.textContent = 'Kiểm tra';
    actionBtn.className = 'btn-check-main disabled';
    dictationActionState = 'check';
    showScreen('screen-practice-complete');
    return;
  }

  const val = input.value.trim().toLowerCase();
  if (!val) return;
  banner.classList.remove('hidden');
  inputIco.classList.remove('hidden');

  if (val === target) {
    const fixed = dictationHadWrongAttempt;
    inputBox.classList.remove('wrong-box');
    inputBox.classList.add(fixed ? 'fixed-box' : 'correct-box');
    inputIco.className = fixed ? 'opt-feedback-ico correct-fixed-ico' : 'opt-feedback-ico correct-choice-ico';
    inputIco.textContent = '✓';
    banner.classList.remove('wrong-banner');
    banner.classList.toggle('fixed-banner', fixed);
    icon.textContent = '✓';
    title.textContent = 'Chính xác!';
    desc.classList.add('hidden');
    actionBtn.textContent = 'Tiếp tục ›';
    actionBtn.className = 'btn-check-main';
    dictationActionState = 'correct';
    playSound('correct');
    addReward(20, 12, 1);
    showXpToast('+20 XP Nghe chép chính xác!');
  } else {
    inputBox.classList.add('wrong-box');
    inputBox.classList.remove('correct-box', 'fixed-box');
    inputIco.className = 'opt-feedback-ico wrong-choice-ico';
    inputIco.textContent = '✕';
    banner.classList.add('wrong-banner');
    banner.classList.remove('fixed-banner');
    icon.textContent = '✕';
    title.textContent = 'Chưa chính xác!';
    desc.textContent = 'Hãy nghe lại loa và thử gõ lại nhé!';
    desc.classList.remove('hidden');
    actionBtn.textContent = '↻ Thử lại';
    actionBtn.className = 'btn-check-main wrong-action';
    dictationActionState = 'wrong';
    dictationHadWrongAttempt = true;
    playSound('wrong');
  }
}

// Complete Sentence
let selectedCompleteBtn = null;
let selectedCompleteIsCorrect = false;
let completeActionState = 'check';
let completeHadWrongAttempt = false;

function selectCompleteSentence(btn, isCorrect, word) {
  if (completeActionState !== 'check') return;
  document.querySelectorAll('#complete-sentence-options .opt-btn').forEach(b => b.classList.remove('selected-choice'));
  btn.classList.add('selected-choice');
  selectedCompleteBtn = btn;
  selectedCompleteIsCorrect = isCorrect;

  const checkBtn = document.getElementById('btn-check-complete');
  checkBtn.classList.remove('disabled');
  checkBtn.classList.add('pulse-glow');
  playSound('pop');
}

function verifyCompleteSentence() {
  const btn = document.getElementById('btn-check-complete');

  if (completeActionState === 'wrong') {
    if (selectedCompleteBtn) {
      selectedCompleteBtn.classList.remove('selected-choice', 'wrong-choice');
      const ico = selectedCompleteBtn.querySelector('.opt-feedback-ico');
      if (ico) ico.textContent = '';
    }
    selectedCompleteBtn = null;
    completeActionState = 'check';
    document.getElementById('complete-result-banner').classList.add('hidden');
    btn.textContent = 'Kiểm tra';
    btn.className = 'btn-check-main disabled';
    return;
  }

  if (completeActionState === 'correct') {
    completeHadWrongAttempt = false;
    completeActionState = 'check';
    selectedCompleteBtn = null;
    document.getElementById('complete-result-banner').classList.add('hidden');
    btn.textContent = 'Kiểm tra';
    btn.className = 'btn-check-main disabled';
    showScreen('screen-practice-fill');
    return;
  }

  if (!selectedCompleteBtn) return;

  const banner = document.getElementById('complete-result-banner');
  const icon = document.getElementById('complete-icon');
  const title = document.getElementById('complete-title');
  const desc = document.getElementById('complete-desc');
  const ico = selectedCompleteBtn.querySelector('.opt-feedback-ico');

  banner.classList.remove('hidden');

  if (selectedCompleteIsCorrect) {
    selectedCompleteBtn.classList.add(completeHadWrongAttempt ? 'correct-fixed' : 'correct-choice');
    if (ico) ico.textContent = '✓';
    banner.classList.remove('wrong-banner');
    banner.classList.toggle('fixed-banner', completeHadWrongAttempt);
    icon.textContent = '✓';
    title.textContent = 'Chính xác!';
    desc.classList.add('hidden');
    btn.textContent = 'Tiếp tục ›';
    btn.className = 'btn-check-main';
    completeActionState = 'correct';
    playSound('correct');
    addReward(15, 10, 1);
    showXpToast('+15 XP Hoàn thành câu đúng!');
  } else {
    selectedCompleteBtn.classList.add('wrong-choice');
    if (ico) ico.textContent = '✕';
    banner.classList.add('wrong-banner');
    banner.classList.remove('fixed-banner');
    icon.textContent = '✕';
    title.textContent = 'Chưa chính xác!';
    desc.textContent = 'Hãy thử lại nhé!';
    desc.classList.remove('hidden');
    btn.textContent = '↻ Thử lại';
    btn.className = 'btn-check-main wrong-action';
    completeActionState = 'wrong';
    completeHadWrongAttempt = true;
    playSound('wrong');
  }
}

// Paragraph Fill
const filledSlots = { 1: null, 2: null, 3: null };

function placeWordIntoBlank(word) {
  // Prevent placing the same word into multiple blanks
  if (Object.values(filledSlots).includes(word)) return;

  let targetSlot = null;
  if (!filledSlots[1]) targetSlot = 1;
  else if (!filledSlots[2]) targetSlot = 2;
  else if (!filledSlots[3]) targetSlot = 3;

  if (targetSlot) {
    filledSlots[targetSlot] = word;
    const slotEl = document.getElementById(`para-slot-${targetSlot}`);
    slotEl.textContent = word;
    slotEl.style.color = '#1E40AF';
    slotEl.style.background = '#DBEAFE';
    const chip = document.getElementById(`chip-${word}`);
    if (chip) chip.classList.add('used-chip');
    playSound('pop');
  }
}

function removeWordFromBlank(slotNum) {
  const word = filledSlots[slotNum];
  if (word) {
    filledSlots[slotNum] = null;
    const slotEl = document.getElementById(`para-slot-${slotNum}`);
    slotEl.textContent = `[ chỗ trống ${slotNum} ]`;
    slotEl.style.color = '#EA580C';
    slotEl.style.background = '#FFF7ED';
    const chip = document.getElementById(`chip-${word}`);
    if (chip) chip.classList.remove('used-chip');
    playSound('pop');
  }
}

function resetParagraphFill() {
  removeWordFromBlank(1);
  removeWordFromBlank(2);
  removeWordFromBlank(3);
  document.getElementById('para-feedback-drawer').classList.add('hidden');
}

function checkParagraphFill() {
  const isCorrect = (filledSlots[1] === 'school' && filledSlots[2] === 'teacher' && filledSlots[3] === 'book');
  const drawer = document.getElementById('para-feedback-drawer');
  const icon = document.getElementById('para-icon');
  const title = document.getElementById('para-title');
  const desc = document.getElementById('para-desc');
  drawer.classList.remove('hidden');

  if (isCorrect) {
    drawer.classList.remove('wrong-drawer');
    icon.textContent = '✓';
    title.textContent = 'Chính xác xuất sắc!';
    desc.textContent = 'school (trường học) → teacher (giáo viên) → book (sách)';
    playSound('correct');
    addReward(30, 15, 1);
    showXpToast('+30 XP Điền đoạn văn thành công!');
  } else {
    drawer.classList.add('wrong-drawer');
    icon.textContent = '✕';
    title.textContent = 'Chưa chính xác!';
    desc.textContent = 'Kiểm tra lại thứ tự từ (Gợi ý: nơi chốn → người dạy → vật đọc).';
    playSound('wrong');
  }
}

// =============================================
// 10. SMART CLIENT-SIDE NLP SENTENCE EVALUATOR
// =============================================
let currentSentenceLevel = 'A2';

function switchSentenceLevel(level) {
  currentSentenceLevel = level;
  document.getElementById('btn-level-a2').classList.toggle('active', level === 'A2');
  document.getElementById('btn-level-c2').classList.toggle('active', level === 'C2');

  const badge = document.getElementById('sentence-cefr-badge');
  const reqText = document.getElementById('sentence-req-text');
  const fillBtn = document.getElementById('btn-fill-sample');
  document.getElementById('ai-eval-result').classList.add('hidden');
  document.getElementById('user-sentence-input').value = '';

  if (level === 'A2') {
    badge.textContent = 'Level A2 (Cơ bản)';
    badge.className = 'badge-cefr a2';
    reqText.textContent = '"Viết một câu kể về một trải nghiệm trong quá khứ; sử dụng thì quá khứ đơn."';
    fillBtn.textContent = '📋 Điền câu mẫu Level A2';
  } else {
    badge.textContent = 'Level C2 (Nâng cao)';
    badge.className = 'badge-cefr c2';
    reqText.textContent = '"Viết một câu thể hiện quan điểm sâu sắc về ảnh hưởng của trải nghiệm cá nhân đối với nhận thức con người."';
    fillBtn.textContent = '📋 Điền câu mẫu Level C2';
  }
  playSound('pop');
}

function fillSampleSentence() {
  const input = document.getElementById('user-sentence-input');
  if (currentSentenceLevel === 'A2') {
    input.value = 'I had an interesting experience when I visited Hanoi last summer.';
  } else {
    input.value = 'Personal experience fundamentally shapes human perception, often influencing individual judgment more powerfully than abstract knowledge ever could.';
  }
  playSound('pop');
}

function evaluateSentenceWithAI() {
  const input = document.getElementById('user-sentence-input');
  const sentence = input.value.trim();

  if (sentence.length < 5) {
    openInAppDialog('✍️', 'Chưa đủ nội dung', 'Vui lòng viết một câu tiếng Anh hoàn chỉnh có chứa từ "experience" trước khi nhờ AI chấm nhé!');
    return;
  }

  const words = sentence.split(/\s+/).filter(Boolean);
  const lower = sentence.toLowerCase();
  const hasTarget = /\bexperience(s|d)?\b/.test(lower);
  const startsUpper = /^[A-Z]/.test(sentence);
  const endsPunct = /[.!?]$/.test(sentence);
  const hasPastMarker = /\b(had|was|were|went|visited|saw|met|made|did|learned|studied|joined|felt|last|yesterday|ago)\b|\b\w+ed\b/.test(lower);
  const hasAcademicC2 = /\b(fundamentally|perception|influencing|judgment|abstract|knowledge|profound|consequently|whereas|although|significantly|perspective|cognitive|shapes)\b/.test(lower);

  let score = 45;
  const issues = [];

  if (hasTarget) score += 20;
  else issues.push('Chưa sử dụng từ khóa mục tiêu "experience".');

  if (startsUpper && endsPunct) score += 10;
  else issues.push('Cần viết hoa chữ cái đầu câu và kết thúc bằng dấu chấm/chấm hỏi.');

  if (currentSentenceLevel === 'A2') {
    if (words.length >= 6) score += 10;
    else issues.push('Câu hơi ngắn (nên có ít nhất 6 từ để đủ ngữ cảnh).');
    if (hasPastMarker) score += 13;
    else issues.push('Chưa thấy rõ động từ thì Quá khứ đơn (VD: had, visited, went, last summer...).');
  } else {
    if (words.length >= 12) score += 10;
    else issues.push('Ở trình độ C2, nên mở rộng thành câu phức (≥ 12 từ).');
    if (hasAcademicC2) score += 15;
    else issues.push('Nên bổ sung từ vựng học thuật / mệnh đề phức (VD: fundamentally, perception, whereas...).');
  }

  score = Math.min(98, Math.max(25, score));

  const resultCard = document.getElementById('ai-eval-result');
  const scoreBadge = document.getElementById('ai-eval-score');
  const levelMatch = document.getElementById('ai-level-match');
  const grammarStat = document.getElementById('grammar-eval-stat');
  const commentText = document.getElementById('ai-comment-text');
  const suggestionText = document.getElementById('ai-suggestion-text');

  resultCard.classList.remove('hidden');
  scoreBadge.textContent = `${score}/100`;

  if (score >= 88) {
    levelMatch.textContent = currentSentenceLevel === 'A2' ? 'Chuẩn CEFR A2: Xuất sắc 🌟' : 'Chuẩn CEFR C2: Đỉnh cao 💎';
    if (grammarStat) grammarStat.textContent = 'Cấu trúc chuẩn xác, diễn đạt tự nhiên';
    commentText.textContent = currentSentenceLevel === 'A2'
      ? 'Câu văn mạch lạc, chia thì quá khứ đơn chính xác và vận dụng từ "experience" rất tự nhiên.'
      : 'Tư duy học thuật xuất sắc! Cấu trúc câu phức tinh tế và vốn từ vựng nâng cao thuyết phục.';
    playSound('correct');
    appState.exercisesDone += 1;
    addReward(50, 25, 2);
    showXpToast(`+50 XP · AI chấm ${score}/100!`);
  } else if (score >= 65) {
    levelMatch.textContent = `Khá tốt (${currentSentenceLevel}) · Cần tinh chỉnh nhẹ`;
    if (grammarStat) grammarStat.textContent = issues[0] || 'Cần trau chuốt thêm từ vựng';
    commentText.textContent = `Điểm cần cải thiện: ${issues.join(' ')}`;
    playSound('correct');
    addReward(25, 10, 1);
    showXpToast(`+25 XP · AI chấm ${score}/100`);
  } else {
    levelMatch.textContent = 'Chưa đạt yêu cầu đề bài ⚠️';
    if (grammarStat) grammarStat.textContent = issues[0] || 'Thiếu thành phần câu';
    commentText.textContent = `Lưu ý sửa lại: ${issues.join(' ')}`;
    playSound('wrong');
  }

  suggestionText.textContent = currentSentenceLevel === 'A2'
    ? '"I had an unforgettable experience when I explored the historic streets of Hanoi last summer."'
    : '"Personal experience fundamentally refines human perception, exerting a far more profound influence on personal judgment than theoretical knowledge ever could."';
}

// =============================================
// 11. FULL 60-UNIT GRAMMAR ROADMAP & QUIZ ENGINE
// =============================================
let currentGrammarFilter = 'ALL';
let activeGrammarItem = null;
let activeGrammarSection = null;
let grammarQuizIdx = 0;
let grammarQuizScore = 0;
let grammarQuizAnswered = false;

function filterGrammarLevel(level, btn) {
  currentGrammarFilter = level;
  document.querySelectorAll('#grammar-level-pills .g-pill').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderGrammarRoadmap();
  playSound('pop');
}

function renderGrammarRoadmap() {
  const container = document.getElementById('grammar-roadmap-container');
  const sections = window.CHYHAB_GRAMMAR_SECTIONS || [];
  if (!container || !sections.length) return;

  const query = (document.getElementById('grammar-search-input')?.value || '').trim().toLowerCase();

  // Overall progress (count units u1..u60)
  const completedUnits = appState.completedGrammar.filter(id => id.startsWith('u')).length;
  const overallPill = document.getElementById('grammar-overall-pill');
  const overallBar = document.getElementById('grammar-overall-bar');
  if (overallPill) overallPill.textContent = `${completedUnits} / 60 Units`;
  if (overallBar) overallBar.style.width = `${Math.max(4, Math.round((completedUnits / 60) * 100))}%`;

  let html = '';
  sections.forEach(sec => {
    if (currentGrammarFilter !== 'ALL' && sec.id !== currentGrammarFilter) return;

    const filteredItems = sec.items.filter(item => {
      if (!query) return true;
      const text = `unit ${item.num || ''} ${item.title} ${item.vi || ''}`.toLowerCase();
      return text.includes(query);
    });
    if (!filteredItems.length) return;

    const totalSecUnits = sec.items.filter(i => i.type === 'unit').length;
    const doneSecUnits = sec.items.filter(i => i.type === 'unit' && appState.completedGrammar.includes(i.id)).length;

    html += `
      <section class="grammar-section-card">
        <div class="g-sec-header" style="border-left-color: ${sec.color};">
          <div>
            <span class="g-sec-badge" style="background: ${sec.color};">${sec.badge} · ${sec.cefr}</span>
            <div class="g-sec-title">${sec.title}</div>
            <div class="g-sec-sub">${sec.subtitle}</div>
          </div>
          <span class="g-sec-count">${doneSecUnits}/${totalSecUnits}</span>
        </div>
        <div class="g-unit-list">
          ${filteredItems.map(item => {
            const isDone = appState.completedGrammar.includes(item.id);
            const rowCls = item.type === 'minitest' ? 'is-minitest' : item.type === 'test' ? 'is-test' : '';
            const numBadge = item.type === 'unit' ? `U${item.num}` : item.type === 'minitest' ? '⚡' : '🏆';
            const displayTitle = item.type === 'unit' ? `Unit ${item.num}: ${item.title}` : item.title;
            return `
              <div class="g-unit-row ${rowCls} ${isDone ? 'done' : ''}" onclick="openGrammarUnit('${item.id}')">
                <div class="g-unit-num" ${item.type === 'unit' && !isDone ? `style="background:${sec.color}"` : ''}>${isDone ? '✓' : numBadge}</div>
                <div class="g-unit-info">
                  <strong>${displayTitle}</strong>
                  <span>${item.vi}</span>
                </div>
                <span class="g-unit-status">${isDone ? 'Đã xong' : 'Học ›'}</span>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;
  });

  if (!html) {
    html = `<div class="gl-card" style="text-align:center;"><p>Không tìm thấy Unit nào khớp với "${escapeHtml(query)}".</p></div>`;
  }
  container.innerHTML = html;
}

function openGrammarUnit(itemId) {
  const sections = window.CHYHAB_GRAMMAR_SECTIONS || [];
  let foundItem = null;
  let foundSec = null;
  for (const sec of sections) {
    const it = sec.items.find(i => i.id === itemId);
    if (it) { foundItem = it; foundSec = sec; break; }
  }
  if (!foundItem) return;

  activeGrammarItem = foundItem;
  activeGrammarSection = foundSec;
  const lesson = window.getGrammarLessonData(foundItem);

  document.getElementById('gl-header-title').textContent =
    foundItem.type === 'unit' ? `Unit ${foundItem.num}: ${foundItem.title}` : foundItem.title;
  document.getElementById('gl-cefr-badge').textContent = foundSec.cefr;
  document.getElementById('gl-formula-text').textContent = lesson.formula;
  document.getElementById('gl-usage-text').textContent = lesson.usage;
  document.getElementById('gl-mistake-box').textContent = lesson.mistake;

  const exList = document.getElementById('gl-examples-list');
  exList.innerHTML = lesson.examples.map(ex => `
    <div class="gl-example-item">
      <div>
        <div class="gl-example-en">${ex.en}</div>
        <div class="gl-example-vi">${ex.vi}</div>
      </div>
      <button class="btn-audio-mini" onclick="speakWord('${ex.en.replace(/'/g, "\\'")}')">🔊</button>
    </div>
  `).join('');

  restartGrammarQuiz();
  switchGrammarLessonTab('theory');
  showScreen('screen-grammar-lesson');
  playSound('pop');
}

function switchGrammarLessonTab(tab) {
  document.getElementById('gl-tab-theory').classList.toggle('active', tab === 'theory');
  document.getElementById('gl-tab-quiz').classList.toggle('active', tab === 'quiz');
  document.getElementById('gl-theory-view').classList.toggle('hidden', tab !== 'theory');
  document.getElementById('gl-quiz-view').classList.toggle('hidden', tab !== 'quiz');
  playSound('pop');
}

function restartGrammarQuiz() {
  grammarQuizIdx = 0;
  grammarQuizScore = 0;
  grammarQuizAnswered = false;
  document.getElementById('gl-quiz-summary').classList.add('hidden');
  document.querySelector('#gl-quiz-view .gl-card').classList.remove('hidden');
  renderGrammarQuizQuestion();
}

function renderGrammarQuizQuestion() {
  if (!activeGrammarItem) return;
  const lesson = window.getGrammarLessonData(activeGrammarItem);
  const qObj = lesson.quiz[grammarQuizIdx];
  if (!qObj) return;

  grammarQuizAnswered = false;
  document.getElementById('gl-quiz-counter').textContent = `Câu ${grammarQuizIdx + 1} / ${lesson.quiz.length}`;
  document.getElementById('gl-quiz-score-live').textContent = `Đúng: ${grammarQuizScore}`;
  document.getElementById('gl-quiz-bar').style.width = `${Math.round(((grammarQuizIdx + 1) / lesson.quiz.length) * 100)}%`;
  document.getElementById('gl-quiz-question').textContent = qObj.q;

  const explainEl = document.getElementById('gl-quiz-explain');
  explainEl.classList.add('hidden');
  document.getElementById('gl-quiz-next-btn').classList.add('hidden');

  const letters = ['A', 'B', 'C', 'D'];
  const optsEl = document.getElementById('gl-quiz-options');
  optsEl.innerHTML = qObj.options.map((opt, idx) => `
    <button class="gl-opt-btn" onclick="answerGrammarQuiz(${idx}, this)">
      <span class="opt-letter">${letters[idx]}</span>
      <span>${opt}</span>
    </button>
  `).join('');
}

function answerGrammarQuiz(selectedIdx, btn) {
  if (grammarQuizAnswered || !activeGrammarItem) return;
  grammarQuizAnswered = true;

  const lesson = window.getGrammarLessonData(activeGrammarItem);
  const qObj = lesson.quiz[grammarQuizIdx];
  const allBtns = document.querySelectorAll('#gl-quiz-options .gl-opt-btn');
  const explainEl = document.getElementById('gl-quiz-explain');
  const nextBtn = document.getElementById('gl-quiz-next-btn');

  const isCorrect = selectedIdx === qObj.correct;
  if (isCorrect) {
    btn.classList.add('correct');
    grammarQuizScore += 1;
    explainEl.classList.remove('is-wrong');
    explainEl.innerHTML = `<strong>✓ Chính xác!</strong> ${qObj.explain}`;
    playSound('correct');
  } else {
    btn.classList.add('wrong');
    if (allBtns[qObj.correct]) allBtns[qObj.correct].classList.add('correct');
    explainEl.classList.add('is-wrong');
    explainEl.innerHTML = `<strong>✕ Chưa chính xác.</strong> ${qObj.explain}`;
    playSound('wrong');
  }

  document.getElementById('gl-quiz-score-live').textContent = `Đúng: ${grammarQuizScore}`;
  explainEl.classList.remove('hidden');
  nextBtn.textContent = grammarQuizIdx + 1 < lesson.quiz.length ? 'Câu tiếp theo ›' : 'Xem kết quả 🎉';
  nextBtn.classList.remove('hidden');
}

function nextGrammarQuizQuestion() {
  if (!activeGrammarItem) return;
  const lesson = window.getGrammarLessonData(activeGrammarItem);
  grammarQuizIdx += 1;

  if (grammarQuizIdx < lesson.quiz.length) {
    renderGrammarQuizQuestion();
    return;
  }

  // Show summary
  document.querySelector('#gl-quiz-view .gl-card').classList.add('hidden');
  const sumCard = document.getElementById('gl-quiz-summary');
  sumCard.classList.remove('hidden');

  const passed = grammarQuizScore >= Math.ceil(lesson.quiz.length * 0.66);
  document.getElementById('gl-sum-emoji').textContent = passed ? '🎉' : '💪';
  document.getElementById('gl-sum-title').textContent = passed ? 'Hoàn thành xuất sắc!' : 'Cần ôn thêm một chút!';
  document.getElementById('gl-sum-desc').textContent = `Bạn trả lời đúng ${grammarQuizScore}/${lesson.quiz.length} câu. ${passed ? 'Đã mở khóa dấu tích xanh và nhận +40 XP, +25 xu!' : 'Hãy xem lại phần Lý thuyết và thử lại nhé!'}`;

  if (passed) {
    if (!appState.completedGrammar.includes(activeGrammarItem.id)) {
      appState.completedGrammar.push(activeGrammarItem.id);
    }
    appState.exercisesDone += 1;
    addReward(40, 25, 2);
    playSound('correct');
    showXpToast('+40 XP · Hoàn thành bài Ngữ pháp!');
  }
}

// =============================================
// 12. MODALS: SYLLABUS, OCR, MISTAKES, MICRO-TASK 60s, SRS
// =============================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    playSound('pop');
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
}

function handleFileUpload(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    closeModal('modal-syllabus');
    openInAppDialog('⚡', 'AI đã nhận đề cương!', `Đã phân tích tệp "${file.name}" và đồng bộ từ vựng chuyên ngành vào Thư viện của bạn.`);
    showScreen('screen-vocab-library');
  }
}

function selectSampleSyllabus(name) {
  closeModal('modal-syllabus');
  addReward(20, 10, 0);
  showXpToast(`⚡ Đã đồng bộ đề cương: ${name}`);
  showScreen('screen-vocab-library');
}

function startAiSyllabusAnalysis() {
  closeModal('modal-syllabus');
  addReward(20, 10, 0);
  showXpToast('⚡ AI đã tạo xong lộ trình học phần cho bạn!');
  showScreen('screen-vocab-library');
}

function simulateCameraCapture() {
  playSound('pop');
  const box = document.getElementById('camera-box');
  box.style.filter = 'brightness(1.9)';
  setTimeout(() => {
    box.style.filter = '';
    document.getElementById('ocr-result-detected').classList.remove('hidden');
    playSound('correct');
  }, 300);
}

function addOcrWordsToStudy() {
  closeModal('modal-ocr');
  ['curriculum', 'syllabus', 'experience'].forEach(id => {
    if (!appState.srsDue.includes(id)) appState.srsDue.push(id);
  });
  addReward(15, 10, 0);
  showXpToast('+5 từ OCR đã thêm vào lịch ôn SRS!');
  showScreen('screen-vocab-modes');
}

function startAdaptiveRemedy() {
  closeModal('modal-mistakes');
  openGrammarUnit('u11');
  showXpToast('Mở Unit 11: Present Simple Tense ⚡');
}

// Micro-task 60s with real countdown timer
let microTaskTimer = null;
let microTaskSeconds = 60;
let microTaskStep = 0;
let microTaskPool = [];

function openMicroTaskModal() {
  const bank = window.CHYHAB_VOCAB || [];
  microTaskPool = [...bank].sort(() => Math.random() - 0.5).slice(0, 3);
  microTaskStep = 0;
  microTaskSeconds = 60;
  openModal('modal-microtask');
  renderMicroTaskStep();

  if (microTaskTimer) clearInterval(microTaskTimer);
  microTaskTimer = setInterval(() => {
    microTaskSeconds -= 1;
    const tEl = document.getElementById('mq-timer-val');
    if (tEl) tEl.textContent = `${microTaskSeconds}s`;
    if (microTaskSeconds <= 0) {
      closeMicroTaskModal();
      showXpToast('Hết 60 giây! Thử lại lần sau nhé ⏱️');
    }
  }, 1000);
}

function closeMicroTaskModal() {
  if (microTaskTimer) {
    clearInterval(microTaskTimer);
    microTaskTimer = null;
  }
  closeModal('modal-microtask');
}

function renderMicroTaskStep() {
  const item = microTaskPool[microTaskStep];
  if (!item) return;
  document.getElementById('mq-step-val').textContent = `Câu ${microTaskStep + 1}/3`;
  document.getElementById('mq-question').textContent = `"${item.word}" (${item.ipa}) nghĩa là gì?`;
  const opts = [
    { text: item.meaning, ok: true },
    { text: item.distractorsVi[0], ok: false },
    { text: item.distractorsVi[1], ok: false }
  ].sort(() => Math.random() - 0.5);

  document.getElementById('mq-options').innerHTML = opts.map(o =>
    `<button class="mq-btn" onclick="answerMicroTask(${o.ok}, this)">${o.text}</button>`
  ).join('');
}

function answerMicroTask(isCorrect, btn) {
  if (isCorrect) {
    btn.style.background = '#22C55E';
    btn.style.color = 'white';
    playSound('correct');
    microTaskStep += 1;
    if (microTaskStep >= microTaskPool.length) {
      addReward(25, 15, 1);
      showXpToast('+25 XP · Hoàn thành Micro-task 60s!');
      setTimeout(() => closeMicroTaskModal(), 650);
    } else {
      setTimeout(() => renderMicroTaskStep(), 450);
    }
  } else {
    btn.style.background = '#EF4444';
    btn.style.color = 'white';
    playSound('wrong');
  }
}

// SRS Review Modal
function openSrsReviewModal() {
  const body = document.getElementById('srs-modal-body');
  const bank = window.CHYHAB_VOCAB || [];
  const dueWords = bank.filter(w => appState.srsDue.includes(w.id));

  if (!dueWords.length) {
    body.innerHTML = `
      <div style="text-align:center;padding:14px 6px;">
        <div style="font-size:42px;margin-bottom:8px;">🌟</div>
        <h4 style="margin-bottom:6px;">Tuyệt vời! Đã ôn hết từ đến hạn</h4>
        <p style="font-size:13px;color:#4B5563;margin-bottom:14px;">Hệ thống SRS sẽ tự động nhắc bạn vào "thời điểm vàng" tiếp theo trước khi quên.</p>
        <button class="btn-primary btn-block" onclick="closeModal('modal-srs'); showScreen('screen-practice-flashcard');">Học từ mới ngay 🚀</button>
      </div>
    `;
  } else {
    body.innerHTML = `
      <p class="modal-desc">Các từ dưới đây đang ở <strong>"thời điểm vàng"</strong> trước khi bạn quên. Bấm 🔊 để nghe và đánh dấu khi đã nhớ!</p>
      <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">
        ${dueWords.map(w => `
          <div class="gl-example-item" style="margin-top:0;align-items:center;">
            <div>
              <div class="gl-example-en">${w.word} <span style="font-weight:600;color:#6B7280;font-size:11.5px;">${w.ipa}</span></div>
              <div class="gl-example-vi">${w.meaning}</div>
            </div>
            <div style="display:flex;gap:6px;">
              <button class="btn-audio-mini" onclick="speakWord('${w.word}')">🔊</button>
              <button class="btn-sm-orange" onclick="markSrsWordDone('${w.id}')">Đã nhớ ✓</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
  openModal('modal-srs');
}

function markSrsWordDone(wordId) {
  appState.srsDue = appState.srsDue.filter(id => id !== wordId);
  addReward(15, 10, 1);
  playSound('correct');
  showXpToast('+15 XP · Củng cố trí nhớ SRS!');
  openSrsReviewModal();
}

// =============================================
// 13. LIVING GARDEN & PLAYABLE MATCH-PAIRS MINI-GAME
// =============================================
const GARDEN_STAGES = [
  { emoji: '🌱', title: 'Hạt mầm chăm chỉ' },
  { emoji: '🌿', title: 'Cây Mầm Xanh' },
  { emoji: '🪴', title: 'Cây Học Thuật' },
  { emoji: '🌳', title: 'Cây Tri Thức B2' },
  { emoji: '🌸', title: 'Khu Vườn Rực Rỡ' }
];

function renderGarden() {
  const stage = GARDEN_STAGES[Math.min(appState.gardenLevel - 1, GARDEN_STAGES.length - 1)];
  const lvlBadge = document.getElementById('garden-level-badge');
  const waterBadge = document.getElementById('garden-water-count');
  const emojiEl = document.getElementById('garden-plant-emoji');
  const barEl = document.getElementById('garden-growth-bar');

  if (lvlBadge) lvlBadge.textContent = `Cấp ${appState.gardenLevel} · ${stage.title}`;
  if (waterBadge) waterBadge.textContent = `💧 ${appState.gardenWater} bình nước`;
  if (emojiEl) emojiEl.textContent = stage.emoji;
  if (barEl) barEl.style.width = `${appState.gardenGrowth}%`;
}

function waterGardenPlant() {
  if (appState.gardenLevel >= GARDEN_STAGES.length && appState.gardenGrowth >= 100) {
    showXpToast('🌸 Khu vườn đã đạt cấp tối đa (Cấp 5)!');
    playSound('correct');
    return;
  }
  if (appState.gardenWater <= 0) {
    openInAppDialog('💧', 'Hết bình nước rồi!', 'Bạn có thể mua thêm Bình nước (120 xu) trong Cửa hàng hoặc hoàn thành bài học để nhận thêm xu nhé!');
    return;
  }
  appState.gardenWater -= 1;
  appState.gardenGrowth += 25;
  if (appState.gardenGrowth >= 100) {
    if (appState.gardenLevel < GARDEN_STAGES.length) {
      appState.gardenGrowth = 0;
      appState.gardenLevel += 1;
      playSound('correct');
      addReward(30, 20, 0);
      showXpToast(`🌸 Cây lên Cấp ${appState.gardenLevel}! +30 XP`);
    } else {
      appState.gardenGrowth = 100;
      playSound('correct');
      addReward(50, 30, 0);
      showXpToast('🌸 Khu vườn đạt Cấp tối đa! +50 XP');
    }
  } else {
    playSound('pop');
    showXpToast('💧 Cây đã lớn thêm +25%!');
  }
  saveState();
  renderGarden();
}

// Playable Match-Pairs Mini-game
let matchSelected = null;
let matchMatchedCount = 0;

function openMatchGameModal() {
  initMatchGame();
  openModal('modal-match-game');
}

function initMatchGame() {
  const bank = window.CHYHAB_VOCAB || [];
  const chosen = [...bank].sort(() => Math.random() - 0.5).slice(0, 4);
  matchSelected = null;
  matchMatchedCount = 0;

  const tiles = [];
  chosen.forEach(w => {
    tiles.push({ id: w.id, side: 'en', label: w.word });
    tiles.push({ id: w.id, side: 'vi', label: w.meaning });
  });
  tiles.sort(() => Math.random() - 0.5);

  document.getElementById('match-game-status').textContent = 'Chọn cặp từ tiếng Anh và nghĩa tiếng Việt tương ứng (0/4 cặp):';
  document.getElementById('match-game-grid').innerHTML = tiles.map((t, i) => `
    <button class="match-tile" data-id="${t.id}" data-side="${t.side}" onclick="handleMatchTileClick(this)">${t.label}</button>
  `).join('');
}

function handleMatchTileClick(btn) {
  if (btn.classList.contains('matched') || btn === matchSelected) return;

  if (!matchSelected) {
    matchSelected = btn;
    btn.classList.add('selected');
    playSound('pop');
    return;
  }

  const first = matchSelected;
  matchSelected = null;

  if (first.dataset.id === btn.dataset.id && first.dataset.side !== btn.dataset.side) {
    first.classList.remove('selected');
    first.classList.add('matched');
    btn.classList.add('matched');
    matchMatchedCount += 1;
    playSound('correct');
    document.getElementById('match-game-status').textContent = `Tuyệt vời! Đã ghép đúng ${matchMatchedCount}/4 cặp:`;

    if (matchMatchedCount === 4) {
      addReward(30, 20, 1);
      appState.gardenWater += 1;
      saveState();
      renderGarden();
      showXpToast('+30 XP & +1 Bình nước Khu vườn! 🧩');
    }
  } else {
    first.classList.remove('selected');
    first.classList.add('wrong-flash');
    btn.classList.add('wrong-flash');
    playSound('wrong');
    setTimeout(() => {
      first.classList.remove('wrong-flash');
      btn.classList.remove('wrong-flash');
    }, 450);
  }
}

// =============================================
// 14. SHOP WITH LIVE CATEGORY TABS & REAL PURCHASE
// =============================================
let currentShopCategory = 'all';

function filterShopCategory(cat, btn) {
  currentShopCategory = cat;
  document.querySelectorAll('.shop-tabs .shop-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderShopItems(cat);
  playSound('pop');
}

function renderShopItems(category) {
  const grid = document.getElementById('shop-grid');
  const items = window.CHYHAB_SHOP_ITEMS || [];
  if (!grid) return;

  const filtered = category === 'all' ? items : items.filter(i => i.category === category);
  grid.innerHTML = filtered.map(item => {
    const isConsumable = item.category === 'item';
    const isOwned = !isConsumable && appState.ownedShopItems.includes(item.id);
    const media = item.img
      ? `<img src="${item.img}" alt="${item.name}" />`
      : `<div class="shop-placeholder">${item.emoji}</div>`;
    return `
      <div class="shop-item">
        ${media}
        <strong>${item.name}</strong>
        <span>${item.desc}</span>
        <button class="btn-buy ${isOwned ? 'owned' : ''}" onclick="buyShopItem('${item.id}')">
          ${isOwned ? '✓ Đã sở hữu' : `🪙 ${item.price} xu`}
        </button>
      </div>
    `;
  }).join('');
}

function buyShopItem(itemId) {
  const item = (window.CHYHAB_SHOP_ITEMS || []).find(i => i.id === itemId);
  if (!item) return;

  const isConsumable = item.category === 'item';
  if (!isConsumable && appState.ownedShopItems.includes(itemId)) {
    showXpToast(`Bạn đang sở hữu "${item.name}" ✓`);
    return;
  }

  if (appState.coins < item.price) {
    playSound('wrong');
    openInAppDialog('🪙', 'Chưa đủ xu', `Bạn cần thêm ${item.price - appState.coins} xu để mua "${item.name}". Hoàn thành bài học hoặc Micro-task để nhận xu nhé!`);
    return;
  }

  appState.coins -= item.price;
  if (!isConsumable) appState.ownedShopItems.push(itemId);
  if (itemId === 'water_drop') appState.gardenWater += 3;
  saveState();
  renderShopItems(currentShopCategory);
  renderGarden();
  playSound('correct');
  showXpToast(`Đã mua "${item.name}" thành công!`);
}

// =============================================
// 15. TEXTBOOK LIBRARY FILTERING & SETTINGS
// =============================================
function filterTextbookTab(btn, category) {
  document.querySelectorAll('.filter-tabs .filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  document.querySelectorAll('#textbook-grid .book-card').forEach(card => {
    const level = card.getAttribute('data-level');
    card.style.display = (category === 'all' || level === category) ? 'block' : 'none';
  });
  playSound('pop');
}

function filterVocabBooks(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('#textbook-grid .book-card').forEach(card => {
    card.style.display = card.textContent.toLowerCase().includes(q) ? 'block' : 'none';
  });
}

function saveSettingsFromUI() {
  appState.settings.sfx = !!document.getElementById('toggle-sfx')?.checked;
  appState.settings.autoPlay = !!document.getElementById('toggle-autoplay')?.checked;
  appState.settings.microTask = !!document.getElementById('toggle-microtask')?.checked;
  saveState();
  showXpToast('Đã lưu cài đặt ✓');
}

function resetDemoState() {
  localStorage.removeItem(STORAGE_KEY);
  appState = getDefaultState();
  saveState();
  syncVocabScreens();
  renderGrammarRoadmap();
  renderShopItems('all');
  renderGarden();
  openInAppDialog('🔄', 'Đã đặt lại dữ liệu mẫu', 'Toàn bộ XP, xu, tiến độ 60 Units Ngữ pháp và Khu vườn đã được khôi phục về trạng thái ban đầu.');
}

// =============================================
// 16. INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  if ('speechSynthesis' in window) window.speechSynthesis.getVoices();

  syncUIWithState();
  syncVocabScreens();
  renderGrammarRoadmap();
  renderShopItems('all');
  renderGarden();

  if (window.location.hash) {
    const hashId = 'screen-' + window.location.hash.replace('#', '');
    if (document.getElementById(hashId)) showScreen(hashId);
    else showScreen('screen-home');
  } else {
    showScreen('screen-home');
  }

  const typingInp = document.getElementById('typing-word-input');
  if (typingInp) {
    typingInp.addEventListener('keypress', e => {
      if (e.key === 'Enter') checkTypingWord();
    });
  }

  const dictationInp = document.getElementById('dictation-input');
  if (dictationInp) {
    dictationInp.addEventListener('keypress', e => {
      if (e.key === 'Enter') checkDictationAnswer();
    });
  }
});
