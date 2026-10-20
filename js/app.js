import { Wheel } from './wheel.js';
import * as fair from './fair.js';
import { parseText, buildEntries, csvToItems, sheetCsvUrl, toCSV } from './intake.js';
import { Channel } from './sync.js';
import { confetti, sound } from './fx.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const KEY = 'spindraw:v1';
const SAMPLE = 'Juan Dela Cruz\nMaria Santos x2\nAlex Reyes\nSam Lee\nPriya Patel\nChris Tan\nJordan Kim\nAisha Bello';

const defaults = () => ({
  room: Math.random().toString(36).slice(2, 10),
  tab: 'entries',
  title: 'Live Giveaway',
  format: 'lines', rawText: SAMPLE, keyword: '', dedupe: true,
  entries: [], stats: null,
  prizesText: '', removeWinners: true, claimSeconds: 60,
  spinSeconds: 7, sound: true, palette: 'stream', showCommit: true,
  ovLayout: 'wide', ovBg: 'transparent', ovSound: true,
  locked: null, salt: '', draws: [], revealed: false, verifyUrl: '',
  countdownEndsAt: 0, claimEndsAt: 0, log: [],
});

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s) return { ...defaults(), ...s };
  } catch {}
  return defaults();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }

const S = load();
let spinning = false;
const overlays = new Map(); // overlay id → last seen

const wheel = new Wheel($('#wheel'), { palette: S.palette });
let channel;
channel = new Channel(S.room, 'host', onMessage, renderSync);
sound.enabled = S.sound;

// ---------- derived state ----------
const pool = () => fair.currentPool(S.entries, S.draws, S.removeWinners);
// What the wheel shows: a pending winner keeps their slice until claimed / no-show.
const wheelPool = () => fair.currentPool(S.entries, S.draws.filter(d => d.status !== 'pending'), S.removeWinners);
const pending = () => S.draws.find(d => d.status === 'pending');
const prizes = () => S.prizesText.split('\n').map(p => p.trim()).filter(Boolean);
const wonCount = () => S.draws.filter(d => d.status !== 'noshow').length;
function nextPrize() {
  const n = wonCount(), list = prizes();
  if (list[n]) return list[n];
  return list.length ? `Bonus prize ${n - list.length + 1}` : `Winner #${n + 1}`;
}
const nameOf = i => S.entries[i]?.name ?? '?';
const lastWin = () => [...S.draws].reverse().find(d => d.status !== 'noshow');

function overlayState() {
  const p = pending();
  return {
    title: S.title,
    pool: wheelPool().map(e => [e.name, e.weight]),
    total: S.entries.length,
    palette: S.palette,
    commit: S.showCommit && S.locked ? S.locked.commit : '',
    salt: S.draws.length ? S.salt : '',
    prize: p ? p.prize : nextPrize(),
    winner: p ? nameOf(p.winner) : '',
    claimEndsAt: p ? S.claimEndsAt : 0,
    countdownEndsAt: S.countdownEndsAt,
    revealed: S.revealed,
  };
}

let bTimer;
function broadcast() {
  clearTimeout(bTimer);
  bTimer = setTimeout(() => channel.send('state', overlayState()), 120);
}

function update({ wheelEntries = false } = {}) {
  if (wheelEntries && !spinning) wheel.setEntries(wheelPool());
  save();
  render();
  broadcast();
}

function addLog(msg) {
  S.log.unshift({ t: Date.now(), msg });
  S.log.length = Math.min(S.log.length, 300);
}

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

// ---------- entries ----------
function applyEntries() {
  if (S.locked) return;
  const { entries, stats } = buildEntries(parseText(S.rawText, S.format), { dedupe: S.dedupe, keyword: S.keyword });
  S.entries = entries;
  S.stats = stats;
  update({ wheelEntries: true });
}

let applyTimer;
const applySoon = () => { clearTimeout(applyTimer); applyTimer = setTimeout(applyEntries, 300); };

function importItems(items, source) {
  const kws = S.keyword.split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
  const keep = items.filter(it => !kws.length || it.text === undefined || kws.some(k => it.text.toLowerCase().includes(k)));
  S.rawText = keep.map(it => (it.weight > 1 ? `${it.name} x${it.weight}` : it.name)).join('\n');
  S.format = 'lines';
  applyEntries();
  toast(`Imported ${keep.length} rows from ${source}`);
}

// ---------- draw flow ----------
async function lock() {
  if (S.locked) return true;
  if (!S.entries.length) { toast('Add entries first'); return false; }
  const seed = fair.newSeed();
  const eHash = await fair.entriesHash(S.entries);
  const commit = await fair.commitment(seed, eHash);
  S.locked = { seed, eHash, commit, at: Date.now() };
  const tickets = S.entries.reduce((s, e) => s + e.weight, 0);
  addLog(`Entries locked: ${S.entries.length} people, ${tickets} entries. Commitment ${commit}`);
  update();
  return true;
}

function unlock() {
  if (S.draws.length) return toast('A winner was already drawn. Start a new raffle instead.');
  if (!S.locked) return;
  S.locked = null;
  addLog('Entries unlocked. The old commitment is void.');
  update();
}

async function spin() {
  if (spinning || pending() || S.revealed) return;
  if (!(await lock())) return;
  const p = pool();
  if (!p.length) return toast('Nobody left in the wheel');
  sound.unlock();
  spinning = true;
  render();
  const k = S.draws.length;
  if (k === 0 && S.salt) addLog(`Public salt fixed: "${S.salt}"`);
  const idx = await fair.pickIndex(S.locked.seed, S.locked.eHash, S.salt, k, p);
  const winner = p[idx];
  const prize = nextPrize();
  wheel.setEntries(p);
  const ms = S.spinSeconds * 1000;
  const { from, to } = wheel.planSpin(idx, S.spinSeconds);
  channel.send('spin', { from, to, ms, pool: p.map(e => [e.name, e.weight]), winner: winner.name, prize });
  $('#winnerCard').hidden = true;
  await wheel.animate(from, to, ms, e => { $('#ticker').textContent = e.name; sound.tick(); });
  S.draws.push({ prize, winner: winner.i, status: 'pending', at: Date.now() });
  S.claimEndsAt = S.claimSeconds > 0 ? Date.now() + S.claimSeconds * 1000 : 0;
  addLog(`Draw #${k + 1} (${prize}): ${winner.name}`);
  spinning = false;
  sound.win();
  confetti();
  update();
}

function claimed() {
  const p = pending();
  if (!p || spinning) return;
  p.status = 'claimed';
  S.claimEndsAt = 0;
  addLog(`${nameOf(p.winner)} claimed ${p.prize}`);
  update({ wheelEntries: true });
}

function noShow() {
  const p = pending();
  if (!p || spinning) return;
  p.status = 'noshow';
  S.claimEndsAt = 0;
  addLog(`${nameOf(p.winner)} didn't claim ${p.prize}. Removed and redrawing`);
  update({ wheelEntries: true });
  spin();
}

async function reveal() {
  if (!S.draws.length) return toast('Draw at least one winner first');
  if (spinning) return;
  const p = pending();
  if (p) { p.status = 'claimed'; S.claimEndsAt = 0; addLog(`${nameOf(p.winner)} claimed ${p.prize}`); }
  if (!S.revealed) {
    S.revealed = true;
    addLog(`Raffle finished. Seed revealed: ${S.locked.seed}`);
  }
  S.verifyUrl = new URL(`verify.html#d=${await fair.encodePayload(proofPayload())}`, location.href).href;
  update();
}

// Everything verify.html needs. Only built after the seed is revealed.
const proofPayload = () => ({
  v: 1,
  title: S.title,
  lockedAt: S.locked.at,
  entries: S.entries.map(e => [e.name, e.weight]),
  seed: S.locked.seed,
  salt: S.salt,
  removeWinners: S.removeWinners,
  draws: S.draws.map(({ prize, winner, status, at }) => ({ prize, winner, status, at })),
});

function newRaffle() {
  if (S.draws.length && !S.revealed && !confirm('This raffle has winners but no verify link yet. Start over anyway?')) return;
  Object.assign(S, { locked: null, salt: '', draws: [], revealed: false, verifyUrl: '', claimEndsAt: 0, countdownEndsAt: 0, log: [] });
  addLog('New raffle started');
  applyEntries();
}

// ---------- downloads ----------
function download(name, blob) {
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const slug = () => S.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'raffle';

function downloadResults() {
  if (!S.draws.length) return toast('No draws yet');
  const rows = [['draw', 'prize', 'winner', 'status', 'time']];
  S.draws.forEach((d, k) => rows.push([k + 1, d.prize, nameOf(d.winner), d.status, new Date(d.at).toISOString()]));
  rows.push([], ['commitment', S.locked?.commit ?? ''], ['seed', S.revealed ? S.locked.seed : '(revealed after finish)'], ['salt', S.salt], ['verify', S.verifyUrl]);
  download(`${slug()}-results.csv`, new Blob([toCSV(rows)], { type: 'text/csv' }));
}

function downloadEntries() {
  if (!S.entries.length) return toast('No entries yet');
  const rows = [['name', 'entries'], ...S.entries.map(e => [e.name, e.weight])];
  download(`${slug()}-entries.csv`, new Blob([toCSV(rows)], { type: 'text/csv' }));
}

// For when the link is too long to post: viewers open this file on verify.html.
function downloadProof() {
  if (!S.revealed) return toast('Finish the raffle first');
  download(`${slug()}-proof.json`, new Blob([JSON.stringify(proofPayload())], { type: 'application/json' }));
}

function downloadCard() {
  const d = lastWin();
  if (!d) return toast('No winner yet');
  const c = document.createElement('canvas');
  c.width = 1200; c.height = 630;
  const g = c.getContext('2d');
  g.fillStyle = '#0f1013'; g.fillRect(0, 0, 1200, 630);
  g.fillStyle = '#ffd23f'; g.fillRect(0, 0, 1200, 14);
  const fit = (text, max, size, weight = 800) => {
    do g.font = `${weight} ${size}px 'Bricolage Grotesque', system-ui, sans-serif`;
    while (g.measureText(text).width > max && (size -= 4) > 20);
  };
  g.textAlign = 'left';
  g.fillStyle = '#9a9ca3'; fit(S.title.toUpperCase(), 1040, 30, 600); g.fillText(S.title.toUpperCase(), 80, 110);
  g.fillStyle = '#ffd23f'; fit('WINNER', 1040, 44); g.fillText('WINNER', 80, 220);
  g.fillStyle = '#f3f1ea'; fit(nameOf(d.winner), 1040, 120); g.fillText(nameOf(d.winner), 80, 340);
  g.fillStyle = '#f3f1ea'; fit(d.prize, 1040, 44, 600); g.fillText(d.prize, 80, 420);
  g.fillStyle = '#9a9ca3';
  g.font = `400 22px 'IBM Plex Mono', monospace`;
  g.fillText(`${new Date(d.at).toLocaleString()} · ${S.entries.length} entries`, 80, 520);
  g.fillText(`commitment ${S.locked.commit.slice(0, 32)}…`, 80, 556);
  g.fillStyle = '#ffd23f';
  g.font = `600 22px 'Bricolage Grotesque', system-ui, sans-serif`;
  g.textAlign = 'right';
  g.fillText('SpinDraw · provably fair', 1120, 556);
  c.toBlob(b => download(`${slug()}-winner.png`, b));
}

// ---------- overlay ----------
function overlayUrl() {
  const u = new URL('overlay.html', location.href);
  u.searchParams.set('room', S.room);
  if (S.ovLayout !== 'wide') u.searchParams.set('layout', S.ovLayout);
  if (S.ovBg !== 'transparent') u.searchParams.set('bg', S.ovBg);
  if (!S.ovSound) u.searchParams.set('sound', '0');
  return u.href;
}

function openOverlay() {
  const u = new URL(overlayUrl());
  if (S.ovBg === 'transparent') u.searchParams.set('bg', 'dark');
  const [w, h] = S.ovLayout === 'vertical' ? [405, 720] : [1280, 720];
  window.open(u.href, 'spindraw-overlay', `width=${w},height=${h}`);
}

function onMessage(type, data, from) {
  if (type === 'hello' || type === 'ping') {
    const fresh = !overlays.has(from);
    overlays.set(from, Date.now());
    if (type === 'hello' || fresh) channel.send('state', overlayState());
    renderSync();
  }
}

function renderSync() {
  const now = Date.now();
  for (const [id, t] of overlays) if (now - t > 12000) overlays.delete(id);
  const el = $('#syncStatus');
  if (!el) return;
  const n = overlays.size;
  el.textContent = n ? `Overlay connected${n > 1 ? ` ×${n}` : ''}` : channel?.relay === 'room in use' ? 'Room open in another tab' : 'Overlay: not connected';
  el.classList.toggle('live', n > 0);
}
setInterval(renderSync, 4000);

// ---------- render ----------
const fmt = ms => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

function renderTimers() {
  const now = Date.now();
  $('#cdText').textContent = S.countdownEndsAt ? (S.countdownEndsAt > now ? `${fmt(S.countdownEndsAt - now)} left` : 'Entries closed') : '—';
  const p = pending();
  if (p) {
    $('#wcTimer').textContent = S.claimEndsAt
      ? (S.claimEndsAt > now ? `Claim within ${fmt(S.claimEndsAt - now)}` : "Time's up: press R to redraw")
      : 'Waiting for the winner to claim';
  }
}
setInterval(renderTimers, 250);

function render() {
  const locked = !!S.locked, p = pending(), drawn = S.draws.length > 0;
  $$('.tabs button').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === S.tab)));
  $$('.tab-panel').forEach(el => { el.hidden = el.dataset.panel !== S.tab; });

  const set = (id, prop, v) => { const el = $(id); if (document.activeElement !== el) el[prop] = v; };
  set('#title', 'value', S.title);
  set('#format', 'value', S.format);
  set('#rawText', 'value', S.rawText);
  set('#keyword', 'value', S.keyword);
  set('#prizesText', 'value', S.prizesText);
  set('#claimSeconds', 'value', S.claimSeconds);
  set('#salt', 'value', S.salt);
  $('#dedupe').checked = S.dedupe;
  $('#removeWinners').checked = S.removeWinners;
  $('#showCommit').checked = S.showCommit;
  $('#soundOn').checked = S.sound;
  $('#ovSound').checked = S.ovSound;
  $('#spinSeconds').value = S.spinSeconds;
  $('#spinLabel').textContent = S.spinSeconds;
  $('#palette').value = S.palette;
  $('#ovLayout').value = S.ovLayout;
  $('#ovBg').value = S.ovBg;
  $('#ovSize').textContent = S.ovLayout === 'vertical' ? '1080×1920' : '1920×1080';
  $('#overlayUrl').value = overlayUrl();

  $('#keywordWrap').hidden = S.format === 'lines';
  ['#format', '#rawText', '#keyword', '#dedupe', '#csvFile', '#sheetUrl', '#sheetBtn', '#clearEntries'].forEach(id => { $(id).disabled = locked; });
  $('#lockedNote').hidden = !locked;
  $('#removeWinners').disabled = drawn;
  $('#salt').disabled = drawn || S.revealed;

  const st = S.stats;
  $('#entryStats').textContent = st
    ? `${st.kept} people · ${st.tickets} entries` + (st.dupes ? ` · ${st.dupes} duplicates removed` : '') + (st.filtered ? ` · ${st.filtered} without keyword skipped` : '')
    : '';
  const pl = pool();
  $('#poolCount').textContent = `${pl.length} in wheel`;

  $('#spinBtn').disabled = spinning || !!p || S.revealed || !pl.length;
  $('#claimBtn').disabled = spinning || !p;
  $('#redrawBtn').disabled = spinning || !p;
  $('#lockBtn').disabled = locked || !S.entries.length;
  $('#unlockBtn').disabled = !locked || drawn;
  $('#revealBtn').disabled = !drawn || spinning;
  $('#revealBtn').textContent = S.revealed ? 'Refresh verify link' : 'Finish & create verify link';

  $('#commitText').textContent = locked ? S.locked.commit : 'not locked yet';
  $('#saltText').textContent = S.salt ? `"${S.salt}"${drawn ? '' : ' (fixed at first spin)'}` : '—';

  const card = $('#winnerCard');
  if (p && !spinning) {
    card.hidden = false;
    $('#wcPrize').textContent = p.prize;
    $('#wcName').textContent = nameOf(p.winner);
  } else if (!spinning) card.hidden = true;
  renderTimers();

  $('#revealBox').hidden = !S.verifyUrl;
  $('#verifyUrl').value = S.verifyUrl;
  $('#openVerify').href = S.verifyUrl || '#';
  const len = S.verifyUrl.length;
  // YouTube live chat allows 200 characters, TikTok comments 150.
  $('#verifyLen').textContent = !len ? '' : len <= 150
    ? `${len} characters: short enough for any chat or comment.`
    : `${len} characters: too long for TikTok comments and YouTube live chat. Post it in a Facebook/YouTube comment, the video description or a pinned post, or share the proof file instead.`;

  const list = prizes();
  const done = S.draws.filter(d => d.status !== 'noshow');
  $('#prizeList').innerHTML = '';
  const total = Math.max(list.length, done.length);
  for (let i = 0; i < total; i++) {
    const li = document.createElement('li');
    const d = done[i];
    li.className = d ? 'done' : i === done.length ? 'next' : '';
    li.append(Object.assign(document.createElement('span'), { textContent: d ? d.prize : list[i] }));
    li.append(Object.assign(document.createElement('span'), { textContent: d ? nameOf(d.winner) : i === done.length ? 'next' : '' }));
    $('#prizeList').append(li);
  }

  $('#log').innerHTML = '';
  for (const l of S.log) {
    const li = document.createElement('li');
    li.append(Object.assign(document.createElement('time'), { textContent: new Date(l.t).toLocaleTimeString() }));
    li.append(Object.assign(document.createElement('span'), { textContent: l.msg }));
    $('#log').append(li);
  }
}

// ---------- events ----------
$$('.tabs button').forEach(b => b.addEventListener('click', () => { S.tab = b.dataset.tab; save(); render(); }));

$('#title').addEventListener('input', e => { S.title = e.target.value; save(); broadcast(); });
$('#format').addEventListener('change', e => { S.format = e.target.value; applyEntries(); });
$('#rawText').addEventListener('input', e => { S.rawText = e.target.value; save(); applySoon(); });
$('#keyword').addEventListener('input', e => { S.keyword = e.target.value; save(); applySoon(); });
$('#dedupe').addEventListener('change', e => { S.dedupe = e.target.checked; applyEntries(); });
$('#clearEntries').addEventListener('click', () => { S.rawText = ''; applyEntries(); });

$('#csvFile').addEventListener('change', async e => {
  const f = e.target.files[0];
  if (f) importItems(csvToItems(await f.text()), f.name);
  e.target.value = '';
});
$('#sheetBtn').addEventListener('click', async () => {
  const url = sheetCsvUrl($('#sheetUrl').value.trim());
  if (!url) return toast('That doesn’t look like a Google Sheets link');
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error(r.status);
    importItems(csvToItems(await r.text()), 'Google Sheets');
  } catch {
    toast('Couldn’t read the sheet. Set sharing to “Anyone with the link”.');
  }
});

$('#prizesText').addEventListener('input', e => { S.prizesText = e.target.value; update(); });
$('#removeWinners').addEventListener('change', e => { S.removeWinners = e.target.checked; update({ wheelEntries: true }); });
$('#claimSeconds').addEventListener('input', e => { S.claimSeconds = Math.max(0, parseInt(e.target.value, 10) || 0); save(); });

$('#lockBtn').addEventListener('click', lock);
$('#unlockBtn').addEventListener('click', unlock);
$('#salt').addEventListener('input', e => { S.salt = e.target.value.trim(); save(); render(); });
$('#spinBtn').addEventListener('click', spin);
$('#claimBtn').addEventListener('click', claimed);
$('#redrawBtn').addEventListener('click', noShow);
$('#revealBtn').addEventListener('click', reveal);
$('#newRaffle').addEventListener('click', newRaffle);
$('#copyVerify').addEventListener('click', () => navigator.clipboard.writeText(S.verifyUrl).then(() => toast('Verify link copied')));
$('#dlResults').addEventListener('click', downloadResults);
$('#dlEntries').addEventListener('click', downloadEntries);
$('#dlCard').addEventListener('click', downloadCard);
$('#dlProof').addEventListener('click', downloadProof);

$('#ovLayout').addEventListener('change', e => { S.ovLayout = e.target.value; save(); render(); });
$('#ovBg').addEventListener('change', e => { S.ovBg = e.target.value; save(); render(); });
$('#ovSound').addEventListener('change', e => { S.ovSound = e.target.checked; save(); render(); });
$('#copyOverlay').addEventListener('click', () => navigator.clipboard.writeText(overlayUrl()).then(() => toast('Overlay URL copied')));
$('#openOverlay').addEventListener('click', openOverlay);
$('#cdStart').addEventListener('click', () => {
  const m = parseFloat($('#cdMinutes').value) || 0;
  if (m <= 0) return;
  S.countdownEndsAt = Date.now() + m * 60000;
  addLog(`Countdown started: ${m} min`);
  update();
});
$('#cdStop').addEventListener('click', () => { S.countdownEndsAt = 0; update(); });
$('#showCommit').addEventListener('change', e => { S.showCommit = e.target.checked; update(); });

$('#spinSeconds').addEventListener('input', e => { S.spinSeconds = +e.target.value; save(); render(); });
$('#palette').addEventListener('change', e => { S.palette = e.target.value; wheel.setPalette(S.palette); update({ wheelEntries: true }); });
$('#soundOn').addEventListener('change', e => { S.sound = sound.enabled = e.target.checked; save(); });
$('#helpBtn').addEventListener('click', () => $('#helpDialog').showModal());

document.addEventListener('keydown', e => {
  if (e.target.closest('input, textarea, select') || e.metaKey || e.ctrlKey || e.altKey || $('#helpDialog').open) return;
  const k = e.key.toLowerCase();
  if (k === ' ') { e.preventDefault(); spin(); }
  else if (k === 'c') claimed();
  else if (k === 'r') noShow();
  else if (k === 'o') openOverlay();
});

// ---------- boot ----------
if (!S.log.length) addLog('Ready. Paste entries, then lock and spin.');
if (S.locked) wheel.setEntries(wheelPool()); else applyEntries();
render();
document.fonts?.ready.then(() => { wheel.cache = null; wheel.draw(); });
