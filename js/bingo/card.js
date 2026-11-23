// A player's bingo card on their phone. The card comes from the game code alone, so this page
// needs no connection to the host: players mark numbers themselves and say their card number.
import * as B from './core.js';

const $ = s => document.querySelector(s);
const params = new URLSearchParams(location.hash.slice(1));
const code = (params.get('g') || '').toUpperCase(), type = +params.get('t');

function fail(msg) {
  $('#pErr').hidden = false;
  $('#pErr').textContent = msg;
  $('#pCard').hidden = true;
  $('.player-actions').hidden = true;
}

if (!B.validCode(code) || !B.validType(type)) {
  fail('This card link is incomplete. Ask the host for the player link again.');
} else {
  const KEY = `spindraw:bingo-card:${code}:${type}`;
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch {}
  // A number in the link (from the host) wins; otherwise keep this phone's card, or deal a new one.
  let n = parseInt(params.get('n'), 10);
  if (!(n >= 1 && n <= B.MAX_CARD)) n = saved.n >= 1 && saved.n <= B.MAX_CARD ? saved.n : 1 + (crypto.getRandomValues(new Uint32Array(1))[0] % B.MAX_CARD);
  if (saved.n !== n) saved = { n, marks: [] };
  const marks = new Set(saved.marks);
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ n, marks: [...marks] })); } catch {} };
  save();

  const card = B.makeCard(code, n, type);
  document.title = `Bingo card ${B.cardLabel(n)} | SpinDraw`;
  $('#pId').textContent = B.cardLabel(n);
  const owner = (params.get('p') || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  $('#pMeta').textContent = `${owner ? `${owner} · ` : ''}Game ${code} · ${B.TYPES[type].label}`;
  $('#shoutId').textContent = owner ? `${owner} · Card ${B.cardLabel(n)}` : `Card ${B.cardLabel(n)}`;

  const box = $('#pCard');
  box.dataset.type = type;
  function draw() {
    box.innerHTML = '';
    if (type === 75) for (let c = 0; c < 5; c++) { const h = document.createElement('span'); h.className = 'pc-head'; h.textContent = 'BINGO'[c]; box.append(h); }
    card.rows.flat().forEach(v => {
      if (v === 0 && type === 90) { const s = document.createElement('span'); s.className = 'pc-cell blank'; box.append(s); return; }
      const b = document.createElement('button');
      b.type = 'button';
      const free = v === 0;
      b.className = 'pc-cell' + (free || marks.has(v) ? ' on' : '') + (free ? ' free' : '');
      b.textContent = free ? 'FREE' : v;
      b.setAttribute('aria-pressed', String(free || marks.has(v)));
      if (!free) b.addEventListener('click', () => { marks.has(v) ? marks.delete(v) : marks.add(v); save(); draw(); });
      else b.disabled = true;
      box.append(b);
    });
  }
  draw();
  $('#clearBtn').addEventListener('click', () => { if (marks.size && confirm('Clear all your marks?')) { marks.clear(); save(); draw(); } });
  $('#bingoBtn').addEventListener('click', () => { $('#shout').hidden = false; });
  $('#shoutClose').addEventListener('click', () => { $('#shout').hidden = true; });
}
