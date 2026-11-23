// The verify page for a bingo game: rebuild the call order from the revealed seed and check
// every winning card at the moment it won.
import * as B from './core.js';
import { linkExpiresAt } from '../fair.js';
import { renderMiniCard } from './ui.js';

const $ = s => document.querySelector(s);
const el = (tag, text, cls) => { const e = document.createElement(tag); if (text != null) e.textContent = text; if (cls) e.className = cls; return e; };

export async function renderBingo(p, fromLink) {
  const type = p.t, code = p.g;
  if (!B.validType(type) || !B.validCode(code) || !/^[0-9a-f]{64}$/.test(p.seed) || !(p.n >= 0)) throw new Error('bad bingo link');
  const salt = typeof p.salt === 'string' ? p.salt : '';
  const roster = Array.isArray(p.r) ? p.r.map(x => String(x)) : null;
  const commit = await B.bingoCommit(p.seed, type, code, roster ? await B.rosterHash(roster) : '');
  const order = await B.callOrder(p.seed, type, code, salt);
  const n = Math.min(p.n, order.length), calls = order.slice(0, n);
  const winners = (Array.isArray(p.w) ? p.w : []).map(([card, pattern, at]) => {
    const c = B.makeCard(code, card, type);
    let res = B.TYPES[type].patterns.includes(pattern) && at >= 1 && at <= n ? B.checkCard(c, calls.slice(0, at), pattern) : { won: false, detail: 'invalid' };
    // With one card per person, a winning card must belong to someone on the locked list.
    const owner = roster ? roster[card - 1] ?? null : null;
    if (roster && !owner) res = { won: false, detail: 'not on the player list' };
    return { card, pattern, at, c, res, owner };
  });

  document.title = `Verify: bingo game ${code} · SpinDraw`;
  $('#title').textContent = `Bingo game ${code}`;
  let meta = `${B.TYPES[type].label}${roster ? ` · one card per person (${roster.length} players)` : ''} · locked ${new Date(p.lockedAt).toLocaleString()} · ${n} number${n === 1 ? '' : 's'} called · ${winners.length} winner${winners.length === 1 ? '' : 's'}`;
  const expires = fromLink ? linkExpiresAt(p) : null;
  if (expires) meta += ` · This link works until ${new Date(expires).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}`;
  $('#meta').textContent = meta;

  const ok = winners.every(w => w.res.won);
  const v = $('#verdict');
  v.hidden = false;
  v.className = `verdict ${ok ? 'ok' : 'bad'}`;
  v.innerHTML = '';
  v.append(winners.length ? (ok ? `✓ All ${winners.length} winning card${winners.length === 1 ? '' : 's'} check out` : '✗ Some winning cards do not match') : '✓ The call order checks out');
  v.append(el('small', ok
    ? 'Your browser rebuilt the call order from the revealed seed and checked each winning card against the numbers called before it won.'
    : 'At least one winning card doesn’t have the pattern with the numbers called before it was confirmed.'));

  $('#facts').hidden = $('#compareSec').hidden = false;
  $('#fHash').previousElementSibling.textContent = 'Game code';
  $('#fCommit').textContent = commit;
  $('#fHash').textContent = code;
  $('#fSeed').textContent = p.seed;
  $('#fSalt').textContent = salt ? `"${salt}"` : '(none)';
  $('#compare').addEventListener('input', e => {
    const typed = e.target.value.toLowerCase().replace(/[^0-9a-f]/g, '');
    const out = $('#compareResult');
    if (typed.length < 8) { out.textContent = ''; return; }
    const match = commit.startsWith(typed);
    out.textContent = match ? `✓ Matches the first ${typed.length} characters of the commitment` : '✗ Doesn’t match. This seed or game differs from what was locked before the first call.';
    out.style.color = match ? 'var(--ok)' : 'var(--coral)';
  });

  if (winners.length) {
    $('#drawsSec').hidden = false;
    $('#drawsSec h2').textContent = 'Winners';
    const head = $('#drawsSec thead tr');
    head.innerHTML = '';
    ['#', 'Prize', 'Card', 'Won on', 'Check'].forEach(h => head.append(el('th', h)));
    const tb = $('#draws');
    winners.forEach((w, k) => {
      const tr = document.createElement('tr');
      [k + 1, B.PATTERN_NAMES[w.pattern] ?? w.pattern, `${B.cardLabel(w.card)}${w.owner ? ` · ${w.owner}` : ''}`, `call ${w.at}${w.res.won ? ` (${w.res.detail})` : ''}`, w.res.won ? '✓' : '✗'].forEach((c, i) => {
        const td = el('td', c);
        if (i === 4) td.className = w.res.won ? 'ok' : 'bad';
        tr.append(td);
      });
      tb.append(tr);
    });
  }

  const sec = $('#matchesSec');
  sec.hidden = false;
  sec.querySelector('h2').textContent = 'Numbers called, in order';
  $('#matchesNote').textContent = 'Rebuilt in your browser from the revealed seed, the game code and the public word.';
  const box = $('#matches');
  box.innerHTML = '';
  const list = el('ol', null, 'bingo-calls');
  calls.forEach(x => list.append(el('li', B.ballLabel(x, type))));
  box.append(list);
  winners.forEach(w => {
    const fig = el('figure', null, 'bingo-proof');
    const mc = el('div', null, 'mini-card');
    renderMiniCard(mc, w.c, new Set(calls.slice(0, w.at)));
 fig.append(mc, el('figcaption', `${B.cardLabel(w.card)}${w.owner ? ` (${w.owner})` : ''} · ${B.PATTERN_NAMES[w.pattern] ?? w.pattern} on call ${w.at}`));
    box.append(fig);
  });
}
