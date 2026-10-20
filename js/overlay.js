import { Wheel } from './wheel.js';
import { Channel } from './sync.js';
import { confetti, sound } from './fx.js';

const $ = s => document.querySelector(s);
const q = new URLSearchParams(location.search);
const room = q.get('room');
document.body.dataset.layout = q.get('layout') === 'vertical' ? 'vertical' : 'wide';
document.body.dataset.bg = ['green', 'dark'].includes(q.get('bg')) ? q.get('bg') : 'transparent';
sound.enabled = q.get('sound') !== '0';

const wheel = new Wheel($('#wheel'));
let state = null;
let animating = false;
let palette = 'stream';

const fmt = ms => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
const toEntries = pool => pool.map(([name, weight]) => ({ name, weight }));

function showWinner(name, prize) {
  $('#ovWinnerName').textContent = name;
  $('#ovWinnerPrize').textContent = prize;
  $('#ovWinner').hidden = false;
}

function apply(s) {
  state = s;
  $('#ovTitle').textContent = s.title;
  $('#ovCount').textContent = `${s.pool.length} in the wheel${s.total !== s.pool.length ? ` · ${s.total} entered` : ''}`;
  $('#ovPrize').textContent = s.prize;
  $('#ovCommit').textContent = s.commit ? `commitment ${s.commit.slice(0, 16)}…${s.salt ? ` · salt "${s.salt}"` : ''}${s.revealed ? ' · proof shared by host' : ''}` : '';
  if (s.palette !== palette) { palette = s.palette; wheel.setPalette(palette); }
  if (animating) return;
  wheel.setEntries(toEntries(s.pool));
  if (s.winner) showWinner(s.winner, s.prize);
  else $('#ovWinner').hidden = true;
}

async function onSpin({ from, to, ms, pool, winner, prize }) {
  animating = true;
  $('#ovWinner').hidden = true;
  wheel.setEntries(toEntries(pool));
  await wheel.animate(from, to, ms, e => { $('#ovTicker').textContent = e.name; sound.tick(); });
  animating = false;
  showWinner(winner, prize);
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
  });
  channel.send('hello');
  setInterval(() => channel.send('ping'), 4000);
  setInterval(tick, 250);
  document.fonts?.ready.then(() => { wheel.cache = null; wheel.draw(); });
}
