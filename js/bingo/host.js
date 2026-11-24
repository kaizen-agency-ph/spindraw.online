// Online Bingo host: the caller screen, setup, checking cards and the verify link.
import * as B from './core.js';
import { sound, confetti } from '../fx.js';
import { encodePayload, newSeed } from '../fair.js';
import { renderMiniCard } from './ui.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const KEY = 'spindraw:bingo';
const COLS = ['#3a86ff', '#e63946', '#9b5de5', '#2f9e44', '#ffd23f'];

// ---------- state ----------
function fresh(type = 75) {
  return { v: 1, type, code: B.newCode(), seed: null, commit: null, salt: '', lockedAt: null, n: 0, pattern: B.TYPES[type].patterns[0], winners: [], finished: false, made: null, rosterOn: false, roster: [], customNames: {} };
}
let S;
try { S = JSON.parse(localStorage.getItem(KEY)); } catch {}
if (!S || S.v !== 1 || !B.validType(S.type) || !B.validCode(S.code)) S = fresh();
if (!Array.isArray(S.roster)) { S.roster = []; S.rosterOn = false; }
if (!S.customNames || typeof S.customNames !== 'object') S.customNames = {};
if (!B.validPattern(S.type, S.pattern)) S.pattern = B.TYPES[S.type].patterns[0];
let prefs = { auto: false, autoSec: 10, voice: true, sfx: true, lastMask: 0 };
try { prefs = { ...prefs, ...JSON.parse(localStorage.getItem(`${KEY}:prefs`)) }; } catch {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); localStorage.setItem(`${KEY}:prefs`, JSON.stringify(prefs)); } catch {} };

let order = null;             // the full call order, known once the game is locked
const called = () => (order ? order.slice(0, S.n) : []);
sound.enabled = prefs.sfx;

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 2600);
}

// ---------- links ----------
// One card per person: the host's list gives each name its own card, #1 for the first name and so
// on, so nobody shares a card or holds two. Only those cards can win.
const assigned = () => (S.rosterOn ? S.roster : null);
const cardLink = () => new URL(`/online-bingo/card/#g=${S.code}&t=${S.type}`, location.origin).href;
const personalLink = k => new URL(`/online-bingo/card/#g=${S.code}&t=${S.type}&n=${k + 1}&p=${encodeURIComponent(S.roster[k])}`, location.origin).href;
const ownerOf = num => (assigned() ? S.roster[num - 1] ?? null : null);
function drawQr() {
  const box = $('#joinQr');
  box.innerHTML = '';
  if (!window.qrcode) return;
  const q = window.qrcode(0, 'M');
  q.addData(cardLink());
  q.make();
  box.innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
}

// ---------- custom patterns (75-ball) ----------
const sq = (...cells) => B.cellsMask(cells);
const row = r => [0, 1, 2, 3, 4].map(c => [r, c]), col = c => [0, 1, 2, 3, 4].map(r => [r, c]);
const PRESETS = [
  ['Letter T', sq(...row(0), ...col(2))],
  ['Letter L', sq(...col(0), ...row(4))],
  ['Plus', sq(...row(2), ...col(2))],
  ['Frame', sq(...row(0), ...row(4), ...col(0), ...col(4))],
  ['Diamond', sq([0, 2], [1, 1], [1, 3], [2, 0], [2, 4], [3, 1], [3, 3], [4, 2])],
  ['Postage stamp', sq([0, 3], [0, 4], [1, 3], [1, 4])],
];
const nameOf = p => B.patternName(p, B.isCustom(p) ? S.customNames[B.customMask(p)] : '');
function setCustom(mask, name) {
  S.pattern = B.customPattern(mask);
  if (name !== undefined) { if (name) S.customNames[mask >>> 0] = name; else delete S.customNames[mask >>> 0]; }
  prefs.lastMask = mask >>> 0;
  save(); render();
  if (!$('#checkOut').hidden) checkCard();
}
function renderCustom() {
  const custom = S.type === 75 && B.isCustom(S.pattern), mask = B.customMask(S.pattern);
  $('#customArea').hidden = !custom;
  const grid = $('#patGrid');
  grid.innerHTML = '';
  for (let i = 0; i < 25; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    const free = i === 12, on = free || ((mask >>> i) & 1) === 1;
    b.className = 'pat-sq' + (on ? ' on' : '') + (free ? ' free' : '');
    b.textContent = free ? '★' : '';
    b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', free ? 'Free centre (always marked)' : `${'BINGO'[i % 5]} column, row ${Math.floor(i / 5) + 1}`);
    b.disabled = free || S.finished;
    if (!free) b.addEventListener('click', () => setCustom((mask ^ (1 << i)) >>> 0, S.customNames[mask] ?? ''));
    grid.append(b);
  }
  $('#patName').disabled = S.finished;
  if (document.activeElement !== $('#patName')) $('#patName').value = custom ? S.customNames[mask] ?? '' : '';
  // Show the shape on the big screen so players know what they're going for.
  const prev = $('#sPatGrid');
  prev.hidden = !custom;
  prev.innerHTML = custom ? Array.from({ length: 25 }, (_, i) => `<i class="${i === 12 || (mask >>> i) & 1 ? 'on' : ''}"></i>`).join('') : '';
}

// ---------- rendering ----------
function renderBoard() {
  const board = $('#board'), type = S.type, set = new Set(called()), last = S.n ? order[S.n - 1] : 0;
  board.dataset.type = type;
  board.innerHTML = '';
  if (type === 75) {
    for (let c = 0; c < 5; c++) {
      const row = document.createElement('div');
      row.className = 'board-row';
      const head = document.createElement('span');
      head.className = 'board-head';
      head.textContent = 'BINGO'[c];
      head.style.setProperty('--col', COLS[c]);
      row.append(head);
      for (let k = 1; k <= 15; k++) row.append(cell(c * 15 + k));
      board.append(row);
    }
  } else {
    for (let r = 0; r < 9; r++) {
      const row = document.createElement('div');
      row.className = 'board-row';
      for (let k = 0; k < 10; k++) { const n = r * 10 + k + 1; row.append(cell(n)); }
      board.append(row);
    }
  }
  function cell(n) {
    const s = document.createElement('span');
    s.className = 'board-cell' + (set.has(n) ? ' on' : '') + (n === last ? ' last' : '');
    s.textContent = n;
    return s;
  }
}

function showBall(n, animate) {
  const ball = $('#ball');
  if (!n) { ball.dataset.col = '0'; $('#ballLetter').textContent = ''; $('#ballNum').textContent = '?'; return; }
  const col = S.type === 75 ? Math.floor((n - 1) / 15) : Math.min(8, Math.floor(n / 10)) % 5;
  ball.dataset.col = String(col);
  $('#ballLetter').textContent = S.type === 75 ? 'BINGO'[Math.floor((n - 1) / 15)] : '';
  $('#ballNum').textContent = n;
  if (animate) { ball.classList.remove('drop'); void ball.offsetWidth; ball.classList.add('drop'); }
}

function render() {
  const T = B.TYPES[S.type], locked = !!S.seed;
  $('#sCode').textContent = S.code;
  $('#sType').textContent = T.label;
  $('#sPattern').textContent = `Playing for: ${nameOf(S.pattern)}`;
  const sc = $('#sCommit');
  sc.hidden = !S.commit;
  sc.textContent = S.commit ? (S.finished ? 'Seed revealed' : `Locked: ${S.commit.slice(0, 16)}`) : '';
  $$('[data-type]').forEach(b => { b.setAttribute('aria-pressed', String(+b.dataset.type === S.type)); b.disabled = locked; });
  const sel = $('#pattern');
  if (sel.dataset.type !== String(S.type)) { sel.innerHTML = T.patterns.map(p => `<option value="${p}">${B.PATTERN_NAMES[p]}</option>`).join('') + (S.type === 75 ? '<option value="custom">Custom pattern…</option>' : ''); sel.dataset.type = String(S.type); }
  sel.value = B.isCustom(S.pattern) ? 'custom' : S.pattern;
  renderCustom();
  sel.disabled = S.finished;
  $('#cardLink').value = cardLink();
  $('#joinUrl').textContent = cardLink().replace(/^https?:\/\//, '');
  renderRoster(locked);
  $('#lockBtn').disabled = locked;
  $('#lockBtn').textContent = locked ? 'Locked' : 'Lock game';
  $('#salt').disabled = !locked || S.n > 0;
  $('#salt').value = S.salt;
  const out = S.finished || S.n >= T.balls;
  $('#callBtn').disabled = out;
  $('#callBtn').firstChild.textContent = S.n ? 'Call next ' : 'Call first number ';
  $('#auto').checked = prefs.auto && !out;
  $('#autoSec').value = String(prefs.autoSec);
  $('#voice').checked = prefs.voice;
  $('#sfx').checked = prefs.sfx;
  $('#callCount').innerHTML = S.n ? `Call <b>${S.n}</b> of ${T.balls}` : 'Press <b>Call</b> to start';
  const recent = $('#recent');
  recent.innerHTML = '';
  called().slice(-6, -1).reverse().forEach(n => { const li = document.createElement('li'); li.textContent = B.ballLabel(n, S.type); recent.append(li); });
  showBall(S.n ? order[S.n - 1] : 0, false);
  renderBoard();
  const w = $('#winners');
  w.innerHTML = '';
  S.winners.forEach(([card, pattern, at, name]) => { const li = document.createElement('li'); li.textContent = `${B.cardLabel(card)}${name ? ` (${name})` : ''} · ${nameOf(pattern)} · on call ${at}`; w.append(li); });
  $('#finishBtn').disabled = !S.seed || S.finished;
  $('#verifyRow').hidden = !S.finished;
  if (S.finished) buildVerify();
  drawQr();
}

// ---------- locking and calling ----------
async function lock() {
  if (S.seed) return true;
  if (S.rosterOn && !S.roster.length) { toast('Add your players and click Assign cards first, or turn off One card per person.'); return false; }
  S.seed = newSeed();
  S.commit = await B.bingoCommit(S.seed, S.type, S.code, S.rosterOn ? await B.rosterHash(S.roster) : '');
  S.lockedAt = Date.now();
  save(); render();
  toast(S.rosterOn ? 'Locked. The code on screen commits to the call order and the player list.' : 'Locked. The code on screen commits to the call order.');
  return true;
}

let busy = false;
async function call() {
  if (busy || S.finished) return;
  sound.unlock();
  busy = true;
  try {
    if (!S.seed && !(await lock())) return;
    if (!order || S.n === 0) order = await B.callOrder(S.seed, S.type, S.code, S.salt);
    if (S.n >= order.length) return stopAuto();
    S.n++;
    save();
    const n = order[S.n - 1];
    render();
    showBall(n, true);
    if (prefs.sfx) sound.beep(true);
    say(n);
  } finally { busy = false; }
}

function say(n) {
  if (!prefs.voice || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const text = S.type === 75 ? `${'BINGO'[Math.floor((n - 1) / 15)]}. ${n}` : `${n}`;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    speechSynthesis.speak(u);
  } catch {}
}

let timer = null;
function startAuto() {
  stopAuto();
  prefs.auto = true; save();
  timer = setInterval(() => { if (!$('#winBanner').hidden) return; call(); }, prefs.autoSec * 1000);
}
function stopAuto() { clearInterval(timer); timer = null; if (prefs.auto) { prefs.auto = false; save(); } $('#auto').checked = false; }

// ---------- checking cards ----------
let checking = null;
function checkCard() {
  const num = parseInt($('#checkNum').value, 10);
  if (!(num >= 1 && num <= B.MAX_CARD)) return toast('Type a card number from 1 to 9999');
  if (!B.validPattern(S.type, S.pattern)) return toast('Add at least one square to your custom pattern');
  const card = B.makeCard(S.code, num, S.type), set = new Set(called());
  const res = B.checkCard(card, set, S.pattern), owner = ownerOf(num);
  const unassigned = !!assigned() && !owner;
  checking = { num, res, owner, unassigned };
  $('#checkOut').hidden = false;
  renderMiniCard($('#checkCard'), card, set, B.isCustom(S.pattern) ? B.maskCells(B.customMask(S.pattern)) : null);
  const v = $('#checkVerdict');
  v.className = `verdict-line ${res.won ? 'ok' : 'no'}`;
  const who = owner ? ` (${owner})` : '';
  if (unassigned) { v.className = 'verdict-line bad'; v.textContent = `${B.cardLabel(num)} isn’t assigned to anyone. With one card per person on, only cards #0001 to ${B.cardLabel(S.roster.length)} can win.`; }
  else v.textContent = res.won ? `BINGO! ${B.cardLabel(num)}${who}: ${B.isCustom(S.pattern) ? nameOf(S.pattern) : res.detail}` : `Not yet${who}: ${res.missing} number${res.missing === 1 ? '' : 's'} missing for ${nameOf(S.pattern).toLowerCase()}`;
  const dupe = S.winners.some(([c, p]) => c === num && p === S.pattern);
  $('#confirmWin').hidden = !res.won || unassigned || dupe || S.finished;
}


function confirmWin() {
  if (!checking?.res.won || checking.unassigned) return;
  stopAuto();
  S.winners.push(checking.owner ? [checking.num, S.pattern, S.n, checking.owner] : [checking.num, S.pattern, S.n]);
  // 90-ball prizes go one line, two lines, full house.
  if (S.type === 90) { const p = B.TYPES[90].patterns, i = p.indexOf(S.pattern); if (i < p.length - 1) S.pattern = p[i + 1]; }
  save();
  $('#winSub').textContent = `${checking.owner ? `${checking.owner} · ` : ''}${B.cardLabel(checking.num)} · ${B.isCustom(S.winners.at(-1)[1]) ? nameOf(S.winners.at(-1)[1]) : checking.res.detail}`;
  $('#winBanner').hidden = false;
  if (prefs.sfx) sound.tada();
  confetti(160);
  setTimeout(() => { $('#winBanner').hidden = true; }, 4200);
  $('#confirmWin').hidden = true;
  render();
}

// ---------- finish ----------
// Names of the custom patterns that were actually won, for the verify page.
function customNamesUsed() {
  const cn = {};
  S.winners.forEach(([, p]) => { if (B.isCustom(p) && S.customNames[B.customMask(p)]) cn[B.customMask(p)] = S.customNames[B.customMask(p)]; });
  return Object.keys(cn).length ? { cn } : {};
}
async function buildVerify() {
  const p = { k: 'bingo', t: S.type, g: S.code, seed: S.seed, salt: S.salt, n: S.n, w: S.winners, lockedAt: S.lockedAt, made: S.made, ...(S.rosterOn ? { r: S.roster } : {}), ...customNamesUsed() };
  $('#verifyUrl').value = new URL(`/verify.html#d=${await encodePayload(p)}`, location.origin).href;
}
async function finish() {
  if (!S.seed || S.finished) return;
  if (!confirm('Finish the game and reveal the seed? No more numbers can be called after this.')) return;
  stopAuto();
  S.finished = true;
  S.made = Date.now();
  save(); render();
  toast('Seed revealed. Share the verify link.');
}

function newGame() {
  if (S.n && !S.finished && !confirm('Start a new game? This one hasn’t been finished.')) return;
  stopAuto();
  const keep = { rosterOn: S.rosterOn, roster: S.roster, customNames: S.customNames }; // the same players and patterns often come back
  S = { ...fresh(S.type), ...keep };
  order = null;
  save(); render();
  $('#checkOut').hidden = true;
  toast(`New game ${S.code}. Share the new player link or print new cards.`);
}

// ---------- one card per person ----------
function renderRoster(locked) {
  const on = S.rosterOn;
  $('#rosterOn').checked = on;
  $('#rosterOn').disabled = locked;
  $('#rosterArea').hidden = !on;
  $('#openLinkField').hidden = on;
  $('#join').hidden = on;
  $('#printField').hidden = on;
  $('#rosterNames').disabled = $('#rosterSave').disabled = locked;
  if (document.activeElement !== $('#rosterNames')) $('#rosterNames').value = S.roster.join('\n');
  $('#rosterCount').textContent = S.roster.length ? `${S.roster.length} player${S.roster.length === 1 ? '' : 's'}, cards ${B.cardLabel(1)} to ${B.cardLabel(S.roster.length)}${locked ? ' · locked in' : ''}` : 'No players yet';
  const list = $('#rosterList');
  list.innerHTML = '';
  S.roster.forEach((name, k) => {
    const li = document.createElement('li');
    const label = document.createElement('span');
    label.textContent = `${B.cardLabel(k + 1)} ${name}`;
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'btn ghost tiny'; b.textContent = 'Copy link';
    b.addEventListener('click', () => navigator.clipboard?.writeText(personalLink(k)).then(() => toast(`Link for ${name} copied`)));
    li.append(label, b);
    list.append(li);
  });
  $('#rosterTools').hidden = !S.roster.length;
}

// ---------- wiring ----------
$('#rosterOn').addEventListener('change', e => { if (S.seed) return; S.rosterOn = e.target.checked; save(); render(); });
$('#rosterSave').addEventListener('click', () => {
  if (S.seed) return;
  const names = B.cleanRoster($('#rosterNames').value);
  if (!names.length) return toast('Type one name per line');
  S.roster = names;
  save(); render();
  toast(`${names.length} card${names.length === 1 ? '' : 's'} assigned. Send each player their own link.`);
});
$('#copyAll').addEventListener('click', () => navigator.clipboard?.writeText(S.roster.map((n, k) => `${n} (${B.cardLabel(k + 1)}): ${personalLink(k)}`).join('\n')).then(() => toast('All player links copied')));
$('#printNamed').addEventListener('click', () => window.open(`/online-bingo/print/#g=${S.code}&t=${S.type}&named=1`, '_blank', 'noopener'));
$$('[data-type]').forEach(b => b.addEventListener('click', () => {
  if (S.seed) return;
  const t = +b.dataset.type;
  if (t === S.type) return;
  S.type = t;
  S.pattern = B.TYPES[t].patterns[0];
  save(); render();
}));
$('#pattern').addEventListener('change', e => {
  if (e.target.value === 'custom') return prefs.lastMask && B.validCustom(B.customPattern(prefs.lastMask)) ? setCustom(prefs.lastMask) : setCustom(PRESETS[0][1], PRESETS[0][0]);
  S.pattern = e.target.value; save(); render(); if (!$('#checkOut').hidden) checkCard();
});
PRESETS.forEach(([name, mask]) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'btn ghost tiny'; b.textContent = name;
  b.addEventListener('click', () => setCustom(mask, name));
  $('#patPresets').append(b);
});
$('#patName').addEventListener('input', e => {
  const mask = B.customMask(S.pattern), name = e.target.value.replace(/\s+/g, ' ').trim().slice(0, 30);
  if (name) S.customNames[mask] = name; else delete S.customNames[mask];
  save();
  $('#sPattern').textContent = `Playing for: ${nameOf(S.pattern)}`;
});
$('#copyLink').addEventListener('click', () => navigator.clipboard?.writeText(cardLink()).then(() => toast('Player link copied')));
$('#printBtn').addEventListener('click', () => {
  const n = Math.max(1, Math.min(200, parseInt($('#printCount').value, 10) || 20));
  window.open(`/online-bingo/print/#g=${S.code}&t=${S.type}&from=1&to=${n}`, '_blank', 'noopener');
});
$('#newGame').addEventListener('click', newGame);
$('#lockBtn').addEventListener('click', () => { sound.unlock(); lock(); });
$('#salt').addEventListener('input', e => { S.salt = e.target.value.trim().slice(0, 40); save(); });
$('#callBtn').addEventListener('click', () => { call(); $('#callBtn').blur(); });
$('#auto').addEventListener('change', e => { sound.unlock(); if (e.target.checked) { call(); startAuto(); } else stopAuto(); });
$('#autoSec').addEventListener('change', e => { prefs.autoSec = +e.target.value; save(); if (timer) startAuto(); });
$('#voice').addEventListener('change', e => { prefs.voice = e.target.checked; save(); if (!prefs.voice) try { speechSynthesis.cancel(); } catch {} });
$('#sfx').addEventListener('change', e => { prefs.sfx = sound.enabled = e.target.checked; save(); });
$('#checkBtn').addEventListener('click', checkCard);
$('#checkNum').addEventListener('keydown', e => { if (e.key === 'Enter') checkCard(); });
$('#confirmWin').addEventListener('click', confirmWin);
$('#finishBtn').addEventListener('click', finish);
$('#copyVerify').addEventListener('click', () => navigator.clipboard?.writeText($('#verifyUrl').value).then(() => toast('Verify link copied')));
$('#presentBtn').addEventListener('click', () => {
  const st = $('#stage');
  if (document.fullscreenElement) document.exitFullscreen();
  else if (st.requestFullscreen) st.requestFullscreen().catch(() => st.classList.toggle('presenting'));
  else st.classList.toggle('presenting');
});
document.addEventListener('keydown', e => {
  if (e.target.closest('input, select, textarea, button') || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.code === 'Space') { e.preventDefault(); call(); }
  if (e.key === 'Escape') $('#stage').classList.remove('presenting');
});
window.addEventListener('load', drawQr);

(async () => {
  if (S.seed) order = await B.callOrder(S.seed, S.type, S.code, S.salt);
  // Auto-call never resumes on its own after a reload: the host restarts it with a click.
  if (prefs.auto) { prefs.auto = false; save(); }
  render();
})();
