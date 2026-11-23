// Printable cards for a game: card numbers from..to, laid out to fit a page.
import * as B from './core.js';

const $ = s => document.querySelector(s);
const p = new URLSearchParams(location.hash.slice(1));
const code = (p.get('g') || '').toUpperCase(), type = +p.get('t');
// Named cards come from the host's player list in this browser, which only the host has.
let names = null;
if (p.get('named') === '1') {
  try { const st = JSON.parse(localStorage.getItem('spindraw:bingo')); if (st?.code === code && st.rosterOn && Array.isArray(st.roster)) names = st.roster; } catch {}
}
const from = names ? 1 : Math.max(1, parseInt(p.get('from'), 10) || 1);
const to = names ? Math.min(names.length, 400) : Math.min(B.MAX_CARD, from + 199, Math.max(from, parseInt(p.get('to'), 10) || from + 19));

if (p.get('named') === '1' && !names && B.validCode(code)) {
  $('#pTitle').textContent = 'No player list found';
  $('#pInfo').textContent = 'Open this from the host’s bingo page, on the same browser, after assigning cards.';
  $('#printNow').hidden = true;
} else if (!B.validCode(code) || !B.validType(type)) {
  $('#pTitle').textContent = 'This print link is incomplete';
  $('#printNow').hidden = true;
} else {
  $('#pTitle').textContent = `Bingo cards for game ${code}`;
  $('#pInfo').textContent = `${B.TYPES[type].label} · ${names ? `${names.length} named cards` : `cards ${B.cardLabel(from)} to ${B.cardLabel(to)}`} · ${type === 75 ? '2 cards' : '6 tickets'} per page`;
  const sheet = $('#sheet');
  sheet.dataset.type = type;
  for (let n = from; n <= to; n++) {
    const card = B.makeCard(code, n, type);
    const el = document.createElement('section');
    el.className = 'print-card';
    const head = document.createElement('div');
    head.className = 'print-card-head';
    head.innerHTML = `<b>${B.cardLabel(n)}</b><span>Game ${code} · ${B.TYPES[type].label}</span>`;

    const grid = document.createElement('div');
    grid.className = 'print-grid';
    grid.dataset.type = type;
    if (type === 75) for (let c = 0; c < 5; c++) { const h = document.createElement('span'); h.className = 'pg-head'; h.textContent = 'BINGO'[c]; grid.append(h); }
    card.rows.flat().forEach(v => {
      const s = document.createElement('span');
      s.className = 'pg-cell' + (v === 0 ? (type === 75 ? ' free' : ' blank') : '');
      s.textContent = v === 0 ? (type === 75 ? 'FREE' : '') : v;
      grid.append(s);
    });
    const foot = document.createElement('p');
    foot.className = 'print-card-foot';
    foot.textContent = 'spindraw.online/online-bingo';
    const parts = [head];
    if (names) { const who = document.createElement('p'); who.className = 'print-card-name'; who.textContent = names[n - 1]; parts.push(who); }
    el.append(...parts, grid, foot);
    sheet.append(el);
  }
  $('#printNow').addEventListener('click', () => window.print());
}
