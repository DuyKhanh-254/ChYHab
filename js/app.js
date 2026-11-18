/* =============================================
   ChYHab — Complete Application Controller
   Features:
   - Full 26 Screens navigation
   - Web Speech Synthesis (Phát âm thật giọng bản xứ)
   - Web Audio API (Hiệu ứng âm thanh Game Ting / Buzz)
   - 8 Chế độ học từ vựng chi tiết theo PDF
   - Modals AI: Đề cương, OCR Camera, Sửa lỗi thích ứng, Micro-task
   - Khung Device Preview (iPhone, Android, Responsive)
   ============================================= */

'use strict';

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

  if (currentScreen === targetScreen) return;

  if (currentScreen) {
    screenStack.push(currentScreen.id);
    currentScreen.classList.remove('active');
  }

  currentScreenId = targetId;
  targetScreen.classList.add('active');

  // Cuộn lên đầu màn hình mới
  const scrollArea = targetScreen.querySelector('.screen-scroll');
  if (scrollArea) scrollArea.scrollTop = 0;

  // Cập nhật trạng thái thanh Bottom Navigation
  syncBottomNav(targetId);
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
    'screen-study': 1,
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
    'screen-leaderboard': 0,
    'screen-settings': 4
  };

  const activeIndex = navMap[screenId];
  if (activeIndex !== undefined) {
    document.querySelectorAll('.bottom-nav').forEach(nav => {
      const btns = nav.querySelectorAll('.nav-btn');
      btns.forEach((btn, idx) => {
        if (idx === activeIndex) btn.classList.add('active');
        else btn.classList.remove('active');
      });
    });
  }
}

// =============================================
// 2. DEVICE PREVIEW VIEW SWITCHER (iPhone / Android / Responsive)
// =============================================
function setDeviceView(mode) {
  const container = document.getElementById('app-container');
  const buttons = document.querySelectorAll('.device-btn');

  buttons.forEach(btn => btn.classList.remove('active'));
  const activeBtn = Array.from(buttons).find(b => b.textContent.toLowerCase().includes(mode.toLowerCase()));
  if (activeBtn) activeBtn.classList.add('active');

  container.className = '';
  if (mode === 'iphone') {
    container.classList.add('view-iphone');
  } else if (mode === 'android') {
    container.classList.add('view-android');
  } else {
    container.classList.add('view-responsive');
  }
}

// =============================================
// 3. WEB SPEECH & AUDIO SOUND EFFECTS
// =============================================
// Web Speech Synthesis TTS (Phát âm giọng người bản ngữ thật sự)
function speakWord(word, rate = 1.0) {
  if (!('speechSynthesis' in window)) {
    console.log('Web Speech API not supported in this browser.');
    return;
  }
  window.speechSynthesis.cancel(); // Dừng câu trước đó nếu đang đọc

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = 'en-US';
  utterance.rate = rate;
  utterance.pitch = 1.0;

  // Ưu tiên chọn giọng tiếng Anh US tự nhiên
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha')));
  if (enVoice) utterance.voice = enVoice;

  window.speechSynthesis.speak(utterance);
}

// Web Audio API SFX (Hiệu ứng chuông ting khi đúng, buzz khi sai)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(type) {
  try {
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'correct') {
      // Âm thanh chúc mừng Ding-Ding vui nhộn
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.15); // G5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } else if (type === 'wrong') {
      // Âm thanh nhắc nhở nhẹ nhàng
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, audioCtx.currentTime);
      osc.frequency.setValueAtTime(220, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    }
  } catch (err) {
    // Silent fallback
  }
}

// XP Notification Toast
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
    font-size: 13px;
    font-weight: 800;
    padding: 8px 16px;
    border-radius: 999px;
    box-shadow: 0 4px 14px rgba(2,132,199,0.4);
    z-index: 99999;
    animation: toastPop 1.6s ease-out forwards;
    pointer-events: none;
    display: flex; align-items: center; gap: 6px;
  `;
  document.getElementById('phone-frame').appendChild(toast);
  setTimeout(() => toast.remove(), 1600);
}

// =============================================
// 4. ONBOARDING CONTROLLERS
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
  playSound('pop');
}

function finishOnboarding() {
  playSound('correct');
  showXpToast('+50 XP Bắt đầu học!');
  showScreen('screen-home');
}

// =============================================
// 5. FLASHCARD CONTROLLER (CHẾ ĐỘ 1 - PDF TRANG 4)
// =============================================
let isFlashcardFlipped = false;

function flipFlashcard() {
  const card = document.getElementById('fc-card');
  if (!card) return;
  isFlashcardFlipped = !isFlashcardFlipped;
  card.classList.toggle('flipped', isFlashcardFlipped);
  playSound('pop');
  if (!isFlashcardFlipped) {
    speakWord('book');
  }
}

function prevFlashcard() {
  showXpToast('Từ 2: weather');
  playSound('pop');
}

function nextCard(type) {
  const card = document.getElementById('fc-card');
  if (card) {
    card.classList.remove('flipped');
    isFlashcardFlipped = false;
  }

  if (type === 'correct') {
    playSound('correct');
    showXpToast('+15 XP Đã nhớ từ!');
  } else if (type === 'wrong') {
    playSound('wrong');
    showXpToast('Đã thêm vào danh sách Cần ôn tập');
  } else {
    playSound('pop');
  }

  // Chuyển sang chế độ tiếp theo: Phát âm
  setTimeout(() => {
    showScreen('screen-practice-pronunciation');
  }, 450);
}

function toggleBookmark(btn) {
  // Đồng bộ trạng thái bookmark giữa mặt trước & mặt sau của cùng 1 thẻ
  const card = btn.closest('.flashcard-container') || btn.closest('.screen');
  const siblingBtns = card ? card.querySelectorAll('.fc-bookmark-btn') : [btn];
  const willBeSaved = !btn.classList.contains('bookmarked');

  siblingBtns.forEach(b => {
    b.classList.toggle('bookmarked', willBeSaved);
    const img = b.querySelector('img');
    if (img) img.src = willBeSaved
      ? 'assets/icons/action_bookmark_filled.png'
      : 'assets/icons/action_bookmark.png';
  });

  playSound('pop');
  const word = document.querySelector('.card-word')?.textContent?.trim() || 'từ này';
  showXpToast(willBeSaved ? `Đã ghi chú từ "${word}" ✓` : 'Đã bỏ ghi chú');
}

// =============================================
// 6. PHÁT ÂM CONTROLLER (CHẾ ĐỘ 2 - PDF TRANG 5)
// =============================================
let currentSpeechSpeed = 1.0;
let isRecordingPron = false;

function changeSpeechSpeed(val) {
  currentSpeechSpeed = parseFloat(val);
  playSound('pop');
}

function startPronunciationCheck() {
  const micBtn = document.getElementById('pron-mic-btn');
  const waveform = document.getElementById('pron-waveform');
  const statusText = document.getElementById('mic-status-text');
  const resultBox = document.getElementById('pron-result-box');

  if (isRecordingPron) return;
  isRecordingPron = true;

  micBtn.classList.add('recording-active');
  waveform.classList.add('active');
  statusText.textContent = '🎙️ Đang lắng nghe bạn đọc "book"...';
  playSound('pop');

  // Mô phỏng nhận diện giọng nói 2.5 giây
  setTimeout(() => {
    isRecordingPron = false;
    micBtn.classList.remove('recording-active');
    waveform.classList.remove('active');
    statusText.textContent = 'Đã hoàn thành thu âm!';

    // Mặc định cho điểm Xuất sắc 92% như PDF Trang 5 State 2
    setPronResult(92);
  }, 2200);
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

  resultBox.classList.remove('hidden');
  pctVal.textContent = score + '%';
  ring.style.setProperty('--pct', score);

  function applyTier(color, bg, dot, label) {
    ring.style.setProperty('--ring-color', color);
    gradePill.style.setProperty('--ring-color', color);
    gradePill.style.setProperty('--grade-bg', bg);
    gradeDot.textContent = dot;
    gradeText.textContent = label;
  }

  if (score >= 90) {
    // Xuất sắc (PDF Trang 5 State 2)
    applyTier('#22C55E', '#F0FDF4', '✓', 'Xuất sắc');
    nextBtn.classList.remove('disabled');
    nextBtn.style.opacity = '1';
    nextBtn.style.pointerEvents = 'auto';
    lockNotice.classList.add('hidden');
    playSound('correct');
    showXpToast('+20 XP Phát âm xuất sắc!');
  } else if (score >= 80) {
    // Tốt (PDF Trang 5 State 3)
    applyTier('#F59E0B', '#FFFBEB', '✓', 'Tốt');
    nextBtn.classList.remove('disabled');
    nextBtn.style.opacity = '1';
    nextBtn.style.pointerEvents = 'auto';
    lockNotice.classList.add('hidden');
    playSound('correct');
    showXpToast('+15 XP Phát âm tốt!');
  } else if (score >= 70) {
    // Cần cải thiện (PDF Trang 5 State 4)
    applyTier('#EA580C', '#FFF7ED', '!', 'Cần cải thiện');
    nextBtn.style.opacity = '0.4';
    nextBtn.style.pointerEvents = 'none';
    lockNotice.classList.remove('hidden');
    playSound('wrong');
  } else {
    // Chưa đạt (PDF Trang 5 State 5)
    applyTier('#EF4444', '#FEF2F2', '✕', 'Chưa đạt');
    nextBtn.style.opacity = '0.4';
    nextBtn.style.pointerEvents = 'none';
    lockNotice.classList.remove('hidden');
    playSound('wrong');
  }
}

// =============================================
// 7. CHỌN NGHĨA & CHỌN TỪ CONTROLLER (CHẾ ĐỘ 3 - PDF TRANG 6)
// =============================================
let currentChooseSubmode = 'meaning';
let selectedOptionBtn = null;
let choiceAnswered = false; // đã chọn & chấm điểm cho câu hỏi hiện tại chưa
let choiceHadWrongAttempt = false;

function switchChooseMode(mode) {
  currentChooseSubmode = mode;
  document.getElementById('choose-screen-title').textContent = mode === 'meaning' ? 'Chọn nghĩa' : 'Chọn từ';

  document.getElementById('view-choose-meaning').classList.toggle('hidden', mode !== 'meaning');
  document.getElementById('view-choose-word').classList.toggle('hidden', mode !== 'word');

  resetChoiceSelection();
  playSound('pop');
}

// Bấm vào 1 đáp án -> chấm điểm ngay lập tức
function selectChoiceOption(btn, isCorrect, mode) {
  if (choiceAnswered) return; // khoá khi đã có kết quả, chờ bấm Thử lại / Tiếp tục

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
    // Đúng (PDF Trang 6: xanh lá nếu đúng ngay, vàng cam nếu sửa đúng sau khi sai)
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
    showXpToast('+15 XP Trả lời đúng!');
  } else {
    // Sai (PDF Trang 6 State 2: Chose B Cái bàn)
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

// Bấm nút "Thử lại" hoặc "Tiếp tục"
function choiceActionNext() {
  const wasCorrect = selectedOptionBtn && (selectedOptionBtn.classList.contains('correct-choice') || selectedOptionBtn.classList.contains('correct-fixed'));

  if (!wasCorrect) {
    // Thử lại: cho chọn lại, giữ lại trạng thái đã từng sai (để lần đúng sau tô vàng cam)
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

  // Tiếp tục
  choiceHadWrongAttempt = false;
  if (currentChooseSubmode === 'meaning') {
    switchChooseMode('word');
  } else {
    showScreen('screen-practice-typing');
  }
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
  document.getElementById('choose-result-banner').classList.add('hidden');
  document.getElementById('choose-action-wrap').classList.add('hidden');
}

// =============================================
// 8. GÕ TỪ CONTROLLER (CHẾ ĐỘ 4 - PDF TRANG 6 BOTTOM)
// =============================================
let typingActionState = 'check'; // 'check' | 'wrong' | 'correct'

function onTypingInputChange() {
  if (typingActionState !== 'check') return;
  const val = document.getElementById('typing-word-input').value.trim();
  const btn = document.getElementById('btn-typing-check');
  btn.classList.toggle('disabled', val.length === 0);
}

function checkTypingWord() {
  const input = document.getElementById('typing-word-input');
  const banner = document.getElementById('typing-result-banner');
  const mark = document.getElementById('typing-mark');
  const heading = document.getElementById('typing-feedback-heading');
  const sub = document.getElementById('typing-feedback-sub');
  const btn = document.getElementById('btn-typing-check');
  const inputBox = input.closest('.typing-input-box');

  // Nút đang ở trạng thái "Thử lại"
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

  // Nút đang ở trạng thái "Tiếp tục"
  if (typingActionState === 'correct') {
    showScreen('screen-practice-listen-write');
    return;
  }

  // Nút đang ở trạng thái "Kiểm tra"
  const val = input.value.trim().toLowerCase();
  if (!val) return;

  banner.classList.remove('hidden');

  if (val === 'book') {
    // Đúng (PDF Trang 6 State 3 & 4)
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
    showXpToast('+20 XP Gõ từ chính xác!');
  } else {
    // Sai (PDF Trang 6 State 2: gõ "bok")
    inputBox.classList.add('wrong-box');
    inputBox.classList.remove('correct-box');
    banner.classList.add('wrong-banner');
    mark.textContent = '✕';
    heading.textContent = 'Chưa chính xác!';
    sub.textContent = 'Hãy thử lại nhé!';
    sub.classList.remove('hidden');
    btn.textContent = '↻ Thử lại';
    btn.className = 'btn-check-main wrong-action';
    typingActionState = 'wrong';
    playSound('wrong');
  }
}

// =============================================
// 9. NGHE VIẾT CONTROLLER (CHẾ ĐỘ 5 - PDF TRANG 7 TOP)
// =============================================
let currentDictationSpeed = 1.0;
let dictationActionState = 'check'; // 'check' | 'wrong' | 'correct'
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

  // Nút đang ở trạng thái "Thử lại"
  if (dictationActionState === 'wrong') {
    input.value = '';
    input.focus();
    inputBox.classList.remove('wrong-box');
    inputIco.classList.add('hidden');
    banner.classList.add('hidden');
    actionBtn.textContent = 'Kiểm tra';
    actionBtn.className = 'btn-check-main disabled';
    dictationActionState = 'check';
    speakWord('book', currentDictationSpeed);
    return;
  }

  // Nút đang ở trạng thái "Tiếp tục"
  if (dictationActionState === 'correct') {
    dictationHadWrongAttempt = false;
    showScreen('screen-practice-complete');
    return;
  }

  // Nút đang ở trạng thái "Kiểm tra"
  const val = input.value.trim().toLowerCase();
  if (!val) return;

  banner.classList.remove('hidden');
  inputIco.classList.remove('hidden');

  if (val === 'book') {
    // Đúng (PDF Trang 7: xanh lá nếu đúng ngay, vàng cam nếu sửa đúng sau khi sai)
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
    showXpToast('+20 XP Nghe chép chính xác!');
  } else {
    // Sai (PDF Trang 7 State 2: gõ "buk")
    inputBox.classList.add('wrong-box');
    inputBox.classList.remove('correct-box', 'fixed-box');
    inputIco.className = 'opt-feedback-ico wrong-choice-ico';
    inputIco.textContent = '✕';
    banner.classList.add('wrong-banner');
    banner.classList.remove('fixed-banner');
    icon.textContent = '✕';
    title.textContent = 'Chưa chính xác!';
    desc.textContent = 'Hãy thử lại nhé!';
    desc.classList.remove('hidden');
    actionBtn.textContent = '↻ Thử lại';
    actionBtn.className = 'btn-check-main wrong-action';
    dictationActionState = 'wrong';
    dictationHadWrongAttempt = true;
    playSound('wrong');
  }
}

// =============================================
// 10. CHỌN TỪ HOÀN THÀNH CÂU (CHẾ ĐỘ 6 - PDF TRANG 7 BOTTOM)
// =============================================
let selectedCompleteBtn = null;
let selectedCompleteIsCorrect = false;
let completeActionState = 'check'; // 'check' | 'wrong' | 'correct'
let completeHadWrongAttempt = false;

function selectCompleteSentence(btn, isCorrect, word) {
  if (completeActionState !== 'check') return;

  document.querySelectorAll('#complete-sentence-options .opt-btn').forEach(b => {
    b.classList.remove('selected-choice');
  });
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

  // Nút đang ở trạng thái "Thử lại"
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

  // Nút đang ở trạng thái "Tiếp tục"
  if (completeActionState === 'correct') {
    completeHadWrongAttempt = false;
    showScreen('screen-practice-fill');
    return;
  }

  // Nút đang ở trạng thái "Kiểm tra"
  if (!selectedCompleteBtn) return;

  const banner = document.getElementById('complete-result-banner');
  const icon = document.getElementById('complete-icon');
  const title = document.getElementById('complete-title');
  const desc = document.getElementById('complete-desc');
  const ico = selectedCompleteBtn.querySelector('.opt-feedback-ico');

  banner.classList.remove('hidden');

  if (selectedCompleteIsCorrect) {
    // Đúng (xanh lá nếu đúng ngay, vàng cam nếu sửa đúng sau khi sai)
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
    showXpToast('+15 XP Hoàn thành câu đúng!');
  } else {
    // Sai (PDF Trang 7 State 2: chọn chair)
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

// =============================================
// 11. ĐIỀN TỪ VÀO ĐOẠN VĂN (CHẾ ĐỘ 7 - PDF TRANG 8)
// =============================================
const filledSlots = { 1: null, 2: null, 3: null };

function placeWordIntoBlank(word) {
  // Tìm ô trống đầu tiên chưa điền (1, 2, 3)
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

    // Đánh dấu chip đã dùng
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
  // Đoạn văn đúng: slot 1: school, slot 2: teacher, slot 3: book (PDF Trang 8)
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
    showXpToast('+30 XP Điền đoạn văn thành công!');
  } else {
    drawer.classList.add('wrong-drawer');
    icon.textContent = '✕';
    title.textContent = 'Chưa chính xác!';
    desc.textContent = 'Vui lòng kiểm tra lại thứ tự các từ (Gợi ý: nơi chốn → người dạy → vật đọc)';
    playSound('wrong');
  }
}

// =============================================
// 12. ĐẶT CÂU AI CHẤM (CHẾ ĐỘ 8 - PDF TRANG 9)
// =============================================
let currentSentenceLevel = 'A2';

function switchSentenceLevel(level) {
  currentSentenceLevel = level;
  document.getElementById('btn-level-a2').classList.toggle('active', level === 'A2');
  document.getElementById('btn-level-c2').classList.toggle('active', level === 'C2');

  const badge = document.getElementById('sentence-cefr-badge');
  const reqText = document.getElementById('sentence-req-text');
  const fillBtn = document.getElementById('btn-fill-sample');
  const resultCard = document.getElementById('ai-eval-result');
  resultCard.classList.add('hidden');

  if (level === 'A2') {
    badge.textContent = 'Level A2 (Cơ bản)';
    badge.className = 'badge-cefr a2';
    reqText.textContent = '"Viết một câu kể về một trải nghiệm trong quá khứ; sử dụng thì quá khứ đơn."';
    fillBtn.textContent = '📋 Điền câu mẫu Level A2';
    document.getElementById('user-sentence-input').value = '';
  } else {
    badge.textContent = 'Level C2 (Nâng cao)';
    badge.className = 'badge-cefr c2';
    reqText.textContent = '"Viết một câu thể hiện quan điểm sâu sắc về ảnh hưởng của trải nghiệm cá nhân đối với nhận thức con người."';
    fillBtn.textContent = '📋 Điền câu mẫu Level C2';
    document.getElementById('user-sentence-input').value = '';
  }
  playSound('pop');
}

function fillSampleSentence() {
  const input = document.getElementById('user-sentence-input');
  if (currentSentenceLevel === 'A2') {
    // Câu mẫu PDF Trang 9 Level A2
    input.value = "I had an interesting experience when I visited Hanoi last summer.";
  } else {
    // Câu mẫu PDF Trang 9 Level C2
    input.value = "Personal experience fundamentally shapes human perception, often influencing individual judgment more powerfully than abstract knowledge ever could.";
  }
  playSound('pop');
}

function evaluateSentenceWithAI() {
  const input = document.getElementById('user-sentence-input');
  const sentence = input.value.trim();

  if (sentence.length < 5) {
    alert('Vui lòng viết câu tiếng Anh của bạn trước khi nhờ AI chấm nhé!');
    return;
  }

  const resultCard = document.getElementById('ai-eval-result');
  const scoreBadge = document.getElementById('ai-eval-score');
  const levelMatch = document.getElementById('ai-level-match');
  const commentText = document.getElementById('ai-comment-text');
  const suggestionText = document.getElementById('ai-suggestion-text');

  resultCard.classList.remove('hidden');

  if (currentSentenceLevel === 'A2') {
    scoreBadge.textContent = '95/100';
    levelMatch.textContent = 'Chuẩn CEFR A2: Xuất sắc 🌟';
    commentText.textContent = 'Câu văn mạch lạc, sử dụng thì quá khứ đơn (had, visited) hoàn toàn chính xác. Vận dụng từ "experience" tự nhiên.';
    suggestionText.textContent = '"I had an unforgettable experience when I explored the historic streets of Hanoi last summer."';
  } else {
    scoreBadge.textContent = '98/100';
    levelMatch.textContent = 'Chuẩn CEFR C2: Đỉnh cao 💎';
    commentText.textContent = 'Tư duy học thuật xuất sắc! Cấu trúc câu phức tinh tế, vốn từ vựng nâng cao (fundamentally shapes, human perception, abstract knowledge).';
    suggestionText.textContent = '"Personal experience fundamentally refines human perception, exerting a far more profound influence on personal judgment than theoretical knowledge ever could."';
  }

  playSound('correct');
  showXpToast('+50 XP AI đã chấm bài xong!');
}

// =============================================
// 13. MODALS SYSTEM (CÁC TÍNH NĂNG ĐẶC BIỆT PDF TRANG 1)
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
  if (modal) {
    modal.classList.add('hidden');
  }
}

// Modal 1: Syllabus Upload
function handleFileUpload(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    alert(`Đã nhận tệp: "${file.name}". AI đang đọc đề cương và bóc tách các bài học...`);
    startAiSyllabusAnalysis();
  }
}

function selectSampleSyllabus(name) {
  alert(`Đã chọn đề cương: "${name}". AI bắt đầu bóc tách từ vựng học phần!`);
  startAiSyllabusAnalysis();
}

function startAiSyllabusAnalysis() {
  closeModal('modal-syllabus');
  showXpToast('⚡ AI đã tạo xong lộ trình học phần cho bạn!');
  showScreen('screen-vocab-library');
}

// Modal 2: Camera OCR
function simulateCameraCapture() {
  playSound('pop');
  const box = document.getElementById('camera-box');
  box.style.filter = 'brightness(2)';
  setTimeout(() => {
    box.style.filter = '';
    document.getElementById('ocr-result-detected').classList.remove('hidden');
    playSound('correct');
  }, 300);
}

function addOcrWordsToStudy() {
  closeModal('modal-ocr');
  showXpToast('+5 Từ vựng mới đã thêm vào kho học!');
  showScreen('screen-vocab-modes');
}

// Modal 3: Sửa lỗi thích ứng
function startAdaptiveRemedy() {
  closeModal('modal-mistakes');
  showXpToast('Bắt đầu bài tập luyện thì HTĐ thích ứng!');
  showScreen('screen-practice-choose');
}

// Modal 4: Micro-task
function answerMicroTask(isCorrect, btn) {
  if (isCorrect) {
    btn.style.background = '#22C55E';
    btn.style.color = 'white';
    playSound('correct');
    showXpToast('+10 XP Hoàn thành Micro-task!');
    setTimeout(() => closeModal('modal-microtask'), 900);
  } else {
    btn.style.background = '#EF4444';
    btn.style.color = 'white';
    playSound('wrong');
  }
}

// =============================================
// 14. TEXTBOOK LIBRARY FILTERING
// =============================================
function filterTextbookTab(btn, category) {
  document.querySelectorAll('.filter-tabs .filter-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const cards = document.querySelectorAll('#textbook-grid .book-card');
  cards.forEach(card => {
    const level = card.getAttribute('data-level');
    if (category === 'all' || level === category) {
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
  });
  playSound('pop');
}

function filterVocabBooks(query) {
  const q = query.toLowerCase().trim();
  const cards = document.querySelectorAll('#textbook-grid .book-card');
  cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(q) ? 'block' : 'none';
  });
}

// =============================================
// 15. INITIALIZATION
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  console.log('ChYHab App ready. Total 26 screens operational.');

  // Pre-load Web Speech Synthesis voices
  if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
  }

  // Hash direct navigation support (e.g. #home -> opens screen-home)
  if (window.location.hash) {
    const hashId = 'screen-' + window.location.hash.replace('#', '');
    if (document.getElementById(hashId)) {
      showScreen(hashId);
    } else {
      showScreen('screen-home');
    }
  } else {
    showScreen('screen-home');
  }

  // Keyboard Enter key listeners
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
