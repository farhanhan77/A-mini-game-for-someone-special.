/* ============================================================
   SEMANGAT KERJA, SAYANG! ❤️  — Main App Script
============================================================ */
'use strict';

// ── Global state ──────────────────────────────────────────
const STATE = {
  energy: 0,          // 0–100
  loveEnergy: 0,
  chibiClicks: 0,
  musicPlaying: false,
  currentScreen: 'loading',
  dialogTimer: null,
};

const CHIBI_FACES = { 0: '🥱', 25: '🙂', 50: '😊', 75: '😍', 100: '🥰' };
const DIALOGS = [
  'Aku percaya kamu ❤️',
  'Semangat yaa...',
  'Kerja keras sekarang, nanti kita jalan-jalan 😘',
  'Aku bangga sama kamu.',
  'Jangan lupa minum yaa 💧',
  'Kamu pasti bisa! 💪',
  'Istirahat dulu kalau capek ya 🥺',
  'Aku selalu di sini buat kamu ❤️',
];

// ── Helper: show screen ───────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + id);
  if (el) {
    el.classList.add('active');
    STATE.currentScreen = id;
  }
}

// ── Custom cursor ─────────────────────────────────────────
(function initCursor() {
  const cursor = document.getElementById('cursor-heart');
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });
})();

// ── Theme by time of day ──────────────────────────────────
(function applyTheme() {
  const h = new Date().getHours();
  const body = document.body;
  if (h >= 5  && h < 11) body.classList.add('theme-morning');
  else if (h >= 11 && h < 16) body.classList.add('theme-afternoon');
  else if (h >= 16 && h < 20) body.classList.add('theme-evening');
  else body.classList.add('theme-night');
})();

// ── Floating particles ────────────────────────────────────
(function initParticles() {
  const container = document.getElementById('particles');
  const items = ['🌸','⭐','💫','✨','🌷','💕'];
  for (let i = 0; i < 8; i++) {  // reduced from 18 → 8
    const p = document.createElement('div');
    p.classList.add('particle');
    p.textContent = items[Math.floor(Math.random() * items.length)];
    p.style.left   = Math.random() * 100 + 'vw';
    p.style.animationDelay    = Math.random() * 6 + 's';
    p.style.animationDuration = (6 + Math.random() * 5) + 's';
    p.style.fontSize = (12 + Math.random() * 12) + 'px';
    container.appendChild(p);
  }
})();

// ── Loading screen ────────────────────────────────────────
(function runLoading() {
  const bar  = document.getElementById('loading-bar');
  const pct  = document.getElementById('loading-pct');
  let val = 0;
  const iv = setInterval(() => {
    val += Math.random() * 8 + 2;
    if (val >= 100) { val = 100; clearInterval(iv); setTimeout(() => showScreen('welcome'), 600); }
    bar.style.width = val + '%';
    pct.textContent = Math.floor(val) + '%';
  }, 120);
})();

// ── Update energy bar + chibi face ───────────────────────
function setEnergy(val) {
  STATE.energy = Math.min(100, Math.max(0, val));
  document.getElementById('energy-bar').style.width = STATE.energy + '%';
  document.getElementById('energy-pct-display').textContent = Math.floor(STATE.energy) + '%';
  // Update chibi face
  let face = '🥱';
  if (STATE.energy >= 100) face = CHIBI_FACES[100];
  else if (STATE.energy >= 75) face = CHIBI_FACES[75];
  else if (STATE.energy >= 50) face = CHIBI_FACES[50];
  else if (STATE.energy >= 25) face = CHIBI_FACES[25];
  const chibi = document.getElementById('chibi-main');
  if (chibi && chibi.textContent !== face) {
    chibi.textContent = face;
    chibi.classList.add('bounce');
    setTimeout(() => chibi.classList.remove('bounce'), 400);
  }
}

// ── Cycling dialog for chibi ──────────────────────────────
function startDialogCycle() {
  let i = 0;
  const el = document.getElementById('chibi-speech');
  if (STATE.dialogTimer) clearInterval(STATE.dialogTimer);
  STATE.dialogTimer = setInterval(() => {
    if (!el) return;
    el.style.opacity = 0;
    setTimeout(() => {
      i = (i + 1) % DIALOGS.length;
      el.textContent = DIALOGS[i];
      el.style.opacity = 1;
    }, 300);
  }, 4000);
}

// ── DOM Ready: wire up all event listeners ────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Chibi easter egg (click 20×)
  const chibi = document.getElementById('chibi-main');
  if (chibi) {
    chibi.addEventListener('click', () => {
      STATE.chibiClicks++;
      if (STATE.chibiClicks === 20) openEaster();
    });
  }
  // Start button
  document.getElementById('btn-start').addEventListener('click', () => {
    startGame1();
  });
  // Music toggle
  document.getElementById('btn-music').addEventListener('click', toggleMusic);
  // Reward button
  document.getElementById('btn-open-letter').addEventListener('click', openLetterModal);
  // Envelope click
  document.getElementById('envelope').addEventListener('click', openEnvelope);
  // Hug button
  const hugBtn = document.getElementById('btn-hug');
  if (hugBtn) {
    hugBtn.addEventListener('click', () => {
      document.getElementById('modal-letter').classList.add('hidden');
      document.getElementById('modal-hug').classList.remove('hidden');
      spawnFloatingHearts();
    });
  }
  // Init
  setEnergy(0);
  startDialogCycle();
});

// ── Music ─────────────────────────────────────────────────
function toggleMusic() {
  const audio = document.getElementById('bg-music');
  const btn   = document.getElementById('btn-music');
  if (STATE.musicPlaying) {
    audio.pause();
    btn.textContent = '🎵 Putar Musik';
    STATE.musicPlaying = false;
  } else {
    audio.play().catch(() => {});
    btn.textContent = '🔇 Pause Musik';
    STATE.musicPlaying = true;
  }
}

// ╔════════════════════════════════════════════════════════╗
// ║              MINI GAME 1 — TANGKAP BINTANG            ║
// ╚════════════════════════════════════════════════════════╝
let g1Count = 0, g1TimerVal = 30, g1Interval = null, g1SpawnInterval = null;

function startGame1() {
  showScreen('game1');
  g1Count = 0; g1TimerVal = 30;
  document.getElementById('g1-count').textContent = 0;
  document.getElementById('g1-timer').textContent = 30;
  document.getElementById('game1-arena').innerHTML = '';
  updateChibiG1();

  // Spawn stars
  g1SpawnInterval = setInterval(spawnStar, 900);
  // Countdown
  g1Interval = setInterval(() => {
    g1TimerVal--;
    document.getElementById('g1-timer').textContent = g1TimerVal;
    if (g1TimerVal <= 0) endGame1(false);
  }, 1000);
}

function spawnStar() {
  const arena = document.getElementById('game1-arena');
  if (!arena) return;
  const star = document.createElement('div');
  star.classList.add('star-item');
  const emojis = ['⭐','🌟','💫','✨'];
  star.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  star.style.left = Math.random() * (arena.offsetWidth  - 40) + 'px';
  star.style.top  = Math.random() * (arena.offsetHeight - 40) + 'px';
  star.addEventListener('click', () => catchStar(star, arena));
  arena.appendChild(star);
  // Auto-remove after 3s
  setTimeout(() => { if (star.parentNode) star.parentNode.removeChild(star); }, 3000);
}

function catchStar(star, arena) {
  star.classList.add('clicked');
  g1Count++;
  STATE.energy = Math.min(100, STATE.energy + 10);
  document.getElementById('g1-count').textContent = g1Count;
  showScorePopup(arena, star, '+10 Semangat! ⚡');
  updateChibiG1();
  setEnergy(STATE.energy);
  if (g1Count >= 10) endGame1(true);
}

function updateChibiG1() {
  const chibi   = document.getElementById('chibi-g1');
  const speech  = document.getElementById('speech-g1');
  if (g1Count === 0)       { chibi.textContent = '🥱'; speech.textContent = 'Ayo tangkap bintangnya!'; }
  else if (g1Count < 5)    { chibi.textContent = '🙂'; speech.textContent = 'Bagus! Lanjutkan! ⭐'; }
  else if (g1Count < 10)   { chibi.textContent = '😊'; speech.textContent = 'Wah hampir selesai! 💪'; }
  else                     { chibi.textContent = '😍'; speech.textContent = 'YESSS! Kamu keren! 🎉'; }
}

function endGame1(success) {
  clearInterval(g1Interval);
  clearInterval(g1SpawnInterval);
  const arena = document.getElementById('game1-arena');
  const msg = document.createElement('div');
  msg.classList.add('game-over-msg');
  if (success) {
    msg.innerHTML = '<div class="big">🎉</div><div>Yeay! 10 Bintang Tertangkap!</div><div style="font-size:.9rem;color:#7c3aed;margin-top:6px">+100 Energi Terkumpul! ⚡</div>';
    setEnergy(Math.min(100, STATE.energy + 20));
  } else {
    msg.innerHTML = '<div class="big">⏰</div><div>Waktu Habis! Kamu dapat ' + g1Count + ' bintang.</div><div style="font-size:.9rem;color:#7c3aed;margin-top:6px">Tetap semangat ya! 💕</div>';
  }
  arena.appendChild(msg);
  setTimeout(() => startGame2(), 2200);
}

// ╔════════════════════════════════════════════════════════╗
// ║         MINI GAME 2 — TOMBOL MAGER KABUR             ║
// ╚════════════════════════════════════════════════════════╝
let g2Count = 0, g2TimerVal = 20, g2Interval = null;

function startGame2() {
  showScreen('game2');
  g2Count = 0; g2TimerVal = 20;
  document.getElementById('g2-count').textContent = 0;
  document.getElementById('g2-timer').textContent = 20;
  updateChibiG2();

  // Mager button flee behavior
  const magerBtn = document.getElementById('btn-mager');
  magerBtn.addEventListener('mousemove', fleeMager);
  magerBtn.addEventListener('mouseover', fleeMager);

  g2Interval = setInterval(() => {
    g2TimerVal--;
    document.getElementById('g2-timer').textContent = g2TimerVal;
    if (g2TimerVal <= 0) endGame2();
  }, 1000);
}

function fleeMager() {
  const arena  = document.getElementById('game2-arena');
  const btn    = document.getElementById('btn-mager');
  const aW = arena.offsetWidth  - btn.offsetWidth  - 20;
  const aH = arena.offsetHeight - btn.offsetHeight - 20;
  const x = Math.random() * aW + 10;
  const y = Math.random() * aH + 10;
  btn.style.left = x + 'px';
  btn.style.top  = y + 'px';
}

function game2Click() {
  g2Count++;
  document.getElementById('g2-count').textContent = g2Count;
  updateChibiG2();
  setEnergy(Math.min(100, STATE.energy + 8));
  if (g2Count >= 5) endGame2(true);
}

function updateChibiG2() {
  const chibi  = document.getElementById('chibi-g2');
  const speech = document.getElementById('speech-g2');
  if (g2Count === 0)     { chibi.textContent = '🙂'; speech.textContent = 'Jangan klik yang kabur ya! 😄'; }
  else if (g2Count < 3)  { chibi.textContent = '😊'; speech.textContent = 'Hahaha tombolnya lari! 😂'; }
  else if (g2Count < 5)  { chibi.textContent = '😍'; speech.textContent = 'Hampir sampai! 💪'; }
  else                   { chibi.textContent = '🥰'; speech.textContent = 'Yay semangat itu menang! ❤️'; }
}

function endGame2(success) {
  clearInterval(g2Interval);
  document.getElementById('btn-mager').removeEventListener('mousemove', fleeMager);
  setEnergy(Math.min(100, STATE.energy + 15));
  setTimeout(() => startGame3(), 1200);
}

// ╔════════════════════════════════════════════════════════╗
// ║           MINI GAME 3 — KLIK HATI                    ║
// ╚════════════════════════════════════════════════════════╝
let g3Count = 0, g3TimerVal = 15, g3Interval = null, g3SpawnInterval = null;

function startGame3() {
  showScreen('game3');
  g3Count = 0; g3TimerVal = 15;
  document.getElementById('g3-count').textContent = 0;
  document.getElementById('g3-timer').textContent = 15;
  document.getElementById('game3-arena').innerHTML = '';
  updateChibiG3();

  g3SpawnInterval = setInterval(spawnHeart, 700);
  g3Interval = setInterval(() => {
    g3TimerVal--;
    document.getElementById('g3-timer').textContent = g3TimerVal;
    if (g3TimerVal <= 0) endGame3();
  }, 1000);
}

function spawnHeart() {
  const arena = document.getElementById('game3-arena');
  if (!arena) return;
  const heart = document.createElement('div');
  heart.classList.add('heart-item');
  const emojis = ['❤️','💕','💖','💗','💓','🩷'];
  heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
  heart.style.left = Math.random() * (arena.offsetWidth  - 44) + 'px';
  heart.style.top  = Math.random() * (arena.offsetHeight - 44) + 'px';
  heart.addEventListener('click', () => catchHeart(heart, arena));
  arena.appendChild(heart);
  setTimeout(() => { if (heart.parentNode) heart.parentNode.removeChild(heart); }, 2500);
}

function catchHeart(heart, arena) {
  heart.classList.add('clicked');
  g3Count++;
  STATE.loveEnergy++;
  document.getElementById('g3-count').textContent = g3Count;
  showScorePopup(arena, heart, '+1 ❤️');
  updateChibiG3();
}

function updateChibiG3() {
  const chibi  = document.getElementById('chibi-g3');
  const speech = document.getElementById('speech-g3');
  if (g3Count < 10)       { chibi.textContent = '😊'; speech.textContent = 'Klik semua hatinya! 💖'; }
  else if (g3Count < 30)  { chibi.textContent = '😍'; speech.textContent = 'Wah banyak banget! 🥺'; }
  else                    { chibi.textContent = '🥰'; speech.textContent = 'Love overload!! ❤️❤️'; }
}

function endGame3() {
  clearInterval(g3Interval);
  clearInterval(g3SpawnInterval);
  const arena = document.getElementById('game3-arena');
  arena.innerHTML = '';
  const msg = document.createElement('div');
  msg.classList.add('game-over-msg');
  msg.innerHTML = `
    <div class="big">💖</div>
    <div>Wow!! Kamu berhasil mengumpulkan</div>
    <div style="font-size:1.6rem;color:var(--pink);font-weight:900;margin:6px 0">${g3Count} Love Energy ❤️</div>
    <div style="font-size:.9rem;color:#7c3aed">Kamu penuh cinta! 🥰</div>
  `;
  arena.appendChild(msg);
  STATE.loveEnergy = g3Count;
  setEnergy(100);
  setTimeout(() => showReward(), 2500);
}

// ── Score popup helper ────────────────────────────────────
function showScorePopup(arena, el, text) {
  const popup = document.createElement('div');
  popup.classList.add('score-popup');
  popup.textContent = text;
  popup.style.left = (parseFloat(el.style.left) + 10) + 'px';
  popup.style.top  = (parseFloat(el.style.top) - 10) + 'px';
  arena.appendChild(popup);
  setTimeout(() => popup.remove(), 1000);
}

// ╔════════════════════════════════════════════════════════╗
// ║                    REWARD SCREEN                      ║
// ╚════════════════════════════════════════════════════════╝
function showReward() {
  showScreen('reward');
  document.getElementById('final-energy').textContent = Math.floor(STATE.energy) + '%';
  document.getElementById('final-love').textContent   = STATE.loveEnergy + ' 💕';
  document.getElementById('chibi-reward').textContent = '🥰';
  spawnConfetti();
}

function spawnConfetti() {
  const container = document.getElementById('confetti-container');
  const colors = ['#ff6b9d','#c084fc','#60a5fa','#fbbf24','#34d399','#f472b6','#a78bfa'];
  const shapes = ['❤️','⭐','🌸','💖','✨'];
  for (let i = 0; i < 35; i++) {  // reduced from 80 → 35
    const piece = document.createElement('div');
    piece.classList.add('confetti-piece');
    if (Math.random() > .5) {
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.borderRadius = Math.random() > .5 ? '50%' : '2px';
    } else {
      piece.textContent = shapes[Math.floor(Math.random() * shapes.length)];
      piece.style.background = 'transparent';
      piece.style.fontSize = '16px';
    }
    piece.style.left              = Math.random() * 100 + 'vw';
    piece.style.animationDuration = (3 + Math.random() * 4) + 's';
    piece.style.animationDelay    = Math.random() * 4 + 's';
    container.appendChild(piece);
  }
}

// ╔════════════════════════════════════════════════════════╗
// ║                   LETTER / ENVELOPE                   ║
// ╚════════════════════════════════════════════════════════╝
function openLetterModal() {
  document.getElementById('modal-letter').classList.remove('hidden');
}

function openEnvelope() {
  const env      = document.getElementById('envelope');
  const envWrap  = document.getElementById('envelope-wrap');
  const letWrap  = document.getElementById('letter-wrap');
  env.classList.add('open');
  setTimeout(() => {
    envWrap.classList.add('hidden');
    letWrap.classList.remove('hidden');
  }, 800);
}



function closeHug() {
  document.getElementById('modal-hug').classList.add('hidden');
}

// ── Floating hearts on hug ────────────────────────────────
function spawnFloatingHearts() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 8; i++) {  // reduced from 20 → 8
    const h = document.createElement('div');
    h.classList.add('particle');
    h.textContent = ['❤️','💕','💖','💗'][Math.floor(Math.random() * 4)];
    h.style.left   = Math.random() * 100 + 'vw';
    h.style.animationDuration = (2 + Math.random() * 3) + 's';
    h.style.animationDelay    = Math.random() * 1 + 's';
    h.style.fontSize = (18 + Math.random() * 16) + 'px';
    container.appendChild(h);
    setTimeout(() => h.remove(), 5000);
  }
}

// ╔════════════════════════════════════════════════════════╗
// ║                    EASTER EGG                         ║
// ╚════════════════════════════════════════════════════════╝
function openEaster() {
  document.getElementById('modal-easter').classList.remove('hidden');
}
function closeEaster() {
  document.getElementById('modal-easter').classList.add('hidden');
  STATE.chibiClicks = 0;
}

// ── Hearts follow mouse ────────────────────────────────────
(function trailHearts() {
  let last = 0;
  document.addEventListener('mousemove', e => {
    const now = Date.now();
    if (now - last < 250) return;  // throttle: 120ms → 250ms
    last = now;
    const h = document.createElement('div');
    h.style.cssText = `
      position:fixed;
      left:${e.clientX}px;
      top:${e.clientY}px;
      font-size:${10 + Math.random() * 10}px;
      pointer-events:none;
      z-index:9998;
      animation:floatUp 1.2s ease forwards;
      transform:translate(-50%,-50%);
    `;
    h.textContent = ['💖','💕','✨'][Math.floor(Math.random() * 3)];
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1200);
  });
})();


