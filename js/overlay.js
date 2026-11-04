import { Wheel } from './wheel.js';
import { Channel } from './sync.js';
import { confetti, sound } from './fx.js';
import { loadAll } from './images.js';
import { createGame } from './games/index.js';

const $ = s => document.querySelector(s);
const q = new URLSearchParams(location.search);
const room = q.get('room');
document.body.dataset.layout = q.get('layout') === 'vertical' ? 'vertical' : 'wide';
document.body.dataset.bg = ['green', 'dark'].includes(q.get('bg')) ? q.get('bg') : 'transparent';
sound.enabled = q.get('sound') !== '0';

const wheel = new Wheel($('#wheel'));
let state = null;
let animating = false;
let game = null, gameMode = 'wheel', poolKey = '';
let themeKey = '';
let bgSrc = '';

const fmt = ms => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
const toEntries = pool => pool.map(([name, weight]) => ({ name, weight }));

const MAX_ROWS = 12;

function showWinners(list) {
  const many = list.length > 1;
  $('#ovWinner').classList.toggle('many', many);
  $('#ovWinnerK').textContent = many ? `${list.length} winners` : 'Winner';
  $('#ovWinnerName').textContent = many ? '' : list[0].name;
  $('#ovWinnerPrize').textContent = many ? '' : list[0].prize;
  const box = $('#ovWinnerList');
  box.innerHTML = '';
  for (const w of many ? list.slice(0, MAX_ROWS) : []) {
    const li = document.createElement('li');
    li.append(Object.assign(document.createElement('b'), { textContent: w.name }), Object.assign(document.createElement('span'), { textContent: w.prize }));
    box.append(li);
  }
  if (list.length > MAX_ROWS) box.append(Object.assign(document.createElement('li'), { textContent: `+${list.length - MAX_ROWS} more` }));
  $('#ovWinner').hidden = false;
}

function apply(s) {
  state = s;
  $('#ovTitle').textContent = s.title;
  $('#ovCount').textContent = `${s.pool.length} in the ${(s.mode || 'wheel') === 'wheel' ? 'wheel' : 'draw'}${s.total !== s.pool.length ? ` · ${s.total} entered` : ''}`;
  $('#ovPrize').textContent = s.prize;
  $('#ovCommit').textContent = s.commit ? `commitment ${s.commit.slice(0, 16)}…${s.salt ? ` · salt "${s.salt}"` : ''}${s.revealed ? ' · proof shared by host' : ''}` : '';
  const key = JSON.stringify(s.theme);
  if (s.theme && key !== themeKey) {
    themeKey = key;
    wheel.setTheme(s.theme);
    game?.setTheme(s.theme);
    document.body.style.setProperty('--bg-dim', s.theme.bgDim);
  }
  if (!animating) setMode(s.mode || 'wheel');
  if (animating) return;
  wheel.setEntries(toEntries(s.pool));
  const pk = JSON.stringify(s.pool);
  if (game && pk !== poolKey) { poolKey = pk; game.setEntries(toEntries(s.pool)); }
  if (s.winners?.length) showWinners(s.winners);
  else $('#ovWinner').hidden = true;
}

function setMode(mode) {
  if (mode === gameMode) return;
  gameMode = mode;
  document.body.dataset.mode = mode;
  if (game) { game.destroy(); game = null; }
  poolKey = '';
  if (mode !== 'wheel') {
    game = createGame(mode, $('#game'), state?.theme);
    if (state) { poolKey = JSON.stringify(state.pool); game.setEntries(toEntries(state.pool)); }
  }
}

async function applyImages(srcs) {
  const imgs = await loadAll(srcs);
  wheel.setImages({ center: imgs.center, wheel: imgs.wheel });
  bgSrc = srcs.bg || '';
  $('#ovBg').style.backgroundImage = bgSrc ? `url(${bgSrc})` : '';
  $('#ovBg').hidden = !bgSrc;
}

async function onSpin({ mode = 'wheel', from, to, ms, seed, winnerIdxs, length, pool, winners }) {
  setMode(mode);
  animating = true;
  $('#ovWinner').hidden = true;
  if (mode === 'wheel') {
    wheel.setEntries(toEntries(pool));
    await wheel.animate(from, to, ms, e => { $('#ovTicker').textContent = e.name; sound.tick(); });
  } else {
    poolKey = JSON.stringify(pool);
    game.setEntries(toEntries(pool));
    sound.startMusic(mode);
    try {
      await game.play({ seed, winnerIdxs, length, sound, onLeader: text => { $('#ovTicker').textContent = text; } });
    } finally { sound.stopMusic(); }
  }
  animating = false;
  showWinners(winners);
  sound.win();
  confetti();
}

function tick() {
  if (!state) return;
  const now = Date.now();
  const cd = $('#ovCountdown');
  cd.hidden = !state.countdownEndsAt;
  if (state.countdownEndsAt) {
    const open = state.countdownEndsAt > now;
    cd.classList.toggle('closed', !open);
    cd.querySelector('.k').textContent = open ? 'Entries close in' : 'Entries';
    $('#ovCdValue').textContent = open ? fmt(state.countdownEndsAt - now) : 'Closed!';
  }
  $('#ovClaim').textContent = state.winner && state.claimEndsAt
    ? (state.claimEndsAt > now ? `Claim in chat within ${fmt(state.claimEndsAt - now)}` : 'Time’s up!')
    : '';
}

if (!room) {
  $('#ov').hidden = true;
  $('#ovEmpty').hidden = false;
} else {
  const channel = new Channel(room, 'overlay', (type, data) => {
    if (type === 'state') apply(data);
    else if (type === 'spin') onSpin(data);
    else if (type === 'images') applyImages(data);
    else if (type === 'notice' && !animating) $('#ovTicker').textContent = data.text;
  });
  channel.send('hello');
  setInterval(() => channel.send('ping'), 4000);
  setInterval(tick, 250);
  document.fonts?.ready.then(() => { wheel.cache = null; wheel.draw(); game?.draw(); });
}
