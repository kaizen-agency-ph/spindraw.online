import * as fair from './fair.js';

const $ = s => document.querySelector(s);
const SHOW = 600;

function fail(msg) {
  $('#title').textContent = 'Can’t verify this link';
  const v = $('#verdict');
  v.hidden = false;
  v.className = 'verdict bad';
  v.textContent = msg;
}

function renderEntries(entries, winners, term = '') {
  const t = term.trim().toLowerCase();
  const list = t ? entries.filter(e => e.name.toLowerCase().includes(t)) : entries;
  const ul = $('#entries');
  ul.innerHTML = '';
  for (const e of list.slice(0, SHOW)) {
    const li = document.createElement('li');
    const name = document.createElement(winners.has(e.name) ? 'mark' : 'span');
    name.textContent = e.name;
    li.append(name);
    if (e.weight > 1) li.append(` ×${e.weight}`);
    ul.append(li);
  }
  $('#more').textContent = list.length > SHOW ? `…and ${list.length - SHOW} more. Search to find a name.` : t && !list.length ? 'No match.' : '';
}

const LABEL = { wheel: 'Wheel', race: 'Ball Race', horse: 'Horse Race', battle: 'Pixel Battle' };
const LENGTH = { quick: 'Quick', normal: 'Normal', epic: 'Epic' };
const clock = s => `${Math.floor(s / 60)}:${String(Math.round(s % 60) % 60).padStart(2, '0')}`;
const seconds = s => `${s.toFixed(1)}s`;

function el(tag, text, cls) {
  const e = document.createElement(tag);
  if (text != null) e.textContent = text;
  if (cls) e.className = cls;
  return e;
}

function stats(rows) {
  const dl = el('dl', null, 'stats');
  for (const [k, v] of rows) { const d = el('div'); d.append(el('dt', k), el('dd', String(v))); dl.append(d); }
  return dl;
}

function table(heads, rows, wonAt = -1) {
  const wrap = el('div', null, 'table-wrap'), t = el('table'), head = el('tr');
  heads.forEach(h => head.append(el('th', h)));
  const thead = el('thead'), body = el('tbody');
  thead.append(head);
  for (const row of rows) {
    const tr = el('tr');
    row.cells.forEach((c, i) => tr.append(el('td', c, row.won && i === wonAt ? 'won' : '')));
    body.append(tr);
  }
  t.append(thead, body);
  wrap.append(t);
  return wrap;
}

function fold(summary, node) {
  const d = el('details');
  d.append(el('summary', summary), node);
  return d;
}

function raceCard(card, r, word) {
  card.append(stats([
    [word === 'horse' ? 'Horses' : 'Balls', r.players], ['Length', clock(r.duration)], ['Lead changes', r.leadChanges],
    ['Most time in front', `${r.frontRunner.name} (${Math.round(r.frontRunner.seconds)}s)`],
  ]));
  const rows = r.standings.map(s => ({ won: s.won, cells: [s.place, s.name, s.time == null ? 'Still racing' : seconds(s.time)] }));
  const heads = ['Place', 'Name', 'Finish'], top = el('div');
  top.append(el('h4', 'Finishing order'), table(heads, rows.slice(0, 10), 1));
  card.append(top);
  if (rows.length > 10) card.append(fold(`See places 11 to ${rows.length}`, table(heads, rows.slice(10), 1)));
  card.append(el('p', 'The match ends when the winners cross the line, so anyone still racing is placed by how far along they were.', 'muted small'));
}

function battleCard(card, r) {
  card.append(stats([
    ['Fighters', r.players], ['Length', clock(r.duration)], ['Knockouts', r.kos], ['Lost to the zone', r.zoneOuts],
    ['Hits landed', r.hit], ['Dodges', r.dodge], ['Blocks', r.block], ['Missed swings', r.miss],
  ]));
  const standing = el('div');
  standing.append(el('h4', r.survivors.length > 1 ? 'Last ones standing' : 'Last one standing'), table(['Name', 'KOs', 'Health left'], r.survivors.map(s => ({ won: true, cells: [s.name, s.kills, `${s.health}%`] })), 0));
  card.append(standing);
  if (r.topKos.length) {
    const top = el('div');
    top.append(el('h4', 'Most KOs'), table(['Name', 'KOs'], r.topKos.map(x => ({ cells: [x.name, x.kills] }))));
    card.append(top);
  }
  card.append(fold(`See all ${r.falls.length} eliminations, in order`, table(['Time', 'Out', 'How'], r.falls.map(f => ({ cells: [clock(f.t), f.name, f.by ? `KO’d by ${f.by}` : 'Caught by the zone'] })))));
}

// Older links don't say which game was played, so they simply have no match details.
async function renderMatches(p, entries, eHash, results) {
  const runs = [];
  results.forEach((r, k) => {
    const last = runs.at(-1);
    if (Array.isArray(r.m)) runs.push({ mode: r.m[0], length: r.m[1], count: r.m[2], k, draws: [r] });
    else if (last && last.draws.length < last.count) last.draws.push(r);
  });
  if (!runs.length) return;
  $('#matchesSec').hidden = false;
  const box = $('#matches');
  for (let i = 0; i < runs.length; i++) {
    const run = runs[i], pool = fair.currentPool(entries, p.draws.slice(0, run.k), p.removeWinners);
    const card = el('article', null, 'match'), head = el('div'), names = run.draws.map(d => entries[d.winner]?.name ?? '(none)');
    const isWheel = run.mode === 'wheel';
    head.append(el('h3', `Match ${i + 1}: ${LABEL[run.mode] ?? run.mode}`));
    head.append(el('p', [isWheel ? null : `${LENGTH[run.length] ?? run.length} length`, `${run.draws.map(d => d.prize).join(', ')}`, `${names.length > 1 ? 'Winners' : 'Winner'}: ${names.join(', ')}`].filter(Boolean).join(' · '), 'match-sub'));
    card.append(head);
    box.append(card);
    if (!run.draws.every(d => d.ok)) { card.append(el('p', 'Details aren’t available because this draw doesn’t match the seed.', 'muted small')); continue; }
    if (isWheel) {
      const w = pool.find(e => e.i === run.draws[0].winner), tickets = pool.reduce((s, e) => s + e.weight, 0);
      card.append(stats([['Names on the wheel', pool.length], ['Total entries', tickets], ['Winner’s entries', w.weight], ['Winner’s chance', `${(w.weight / tickets * 100).toFixed(w.weight / tickets < 0.1 ? 2 : 1)}%`]]));
      continue;
    }
    try {
      const { matchReport } = await import('./games/match-report.js');
      const seed = await fair.gameSeed(p.seed, eHash, p.salt ?? '', run.k);
      const winnerIdxs = run.draws.map(d => pool.findIndex(e => e.i === d.winner));
      const r = matchReport({ mode: run.mode, length: run.length, count: run.count, seed, pool, winnerIdxs });
      if (r.kind === 'battle') battleCard(card, r); else raceCard(card, r, run.mode);
    } catch { card.append(el('p', 'Details for this match couldn’t be rebuilt.', 'muted small')); }
  }
}

function showFilePicker() {
  $('#fileSec').hidden = false;
  $('#proofFile').addEventListener('change', async e => {
    const f = e.target.files[0];
    if (!f) return;
    let p;
    try { p = JSON.parse(await f.text()); } catch { return fail('That file isn’t a SpinDraw proof file.'); }
    if (!Array.isArray(p?.entries) || !Array.isArray(p?.draws) || !/^[0-9a-f]{64}$/.test(p.seed)) return fail('That file isn’t a SpinDraw proof file.');
    $('#fileSec').hidden = true;
    run(p);
  });
}

async function main() {
  const m = location.hash.match(/d=([\w-]+)/);
  if (!m) {
    $('#title').textContent = 'Verify a raffle';
    $('#meta').textContent = 'Open the verify link the host posted, or load their proof file below.';
    return showFilePicker();
  }
  let p;
  try { p = await fair.decodePayload(m[1]); } catch { return fail('This link is damaged or cut off. Copy the whole link and try again.'); }
  // replace(): the old address, with its names, doesn't stay in this tab's back button.
  if (fair.linkExpired(p)) return location.replace(new URL('draw-expired/', location.href).href);
  run(p, true);
}

async function run(p, fromLink = false) {
  $('#verdict').hidden = true;

  const entries = p.entries.map(([name, weight]) => ({ name, weight }));
  const { eHash, commit, results } = await fair.replay({ entries, seed: p.seed, salt: p.salt ?? '', removeWinners: p.removeWinners, draws: p.draws });
  const nameOf = i => entries[i]?.name ?? '(none)';

  document.title = `Verify: ${p.title} · SpinDraw`;
  $('#title').textContent = p.title;
  const tickets = entries.reduce((s, e) => s + e.weight, 0);
  $('#meta').textContent = `Locked ${new Date(p.lockedAt).toLocaleString()} · ${entries.length} people · ${tickets} entries · winners ${p.removeWinners ? 'removed' : 'kept'} after each draw`;
  const expires = fromLink ? fair.linkExpiresAt(p) : null;
  if (expires) $('#meta').textContent += ` · This link works until ${new Date(expires).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}`;

  const ok = results.every(r => r.ok);
  const v = $('#verdict');
  v.hidden = false;
  v.className = `verdict ${ok ? 'ok' : 'bad'}`;
  v.innerHTML = '';
  v.append(ok ? `✓ All ${results.length} draw${results.length === 1 ? '' : 's'} check out` : '✗ Some draws do not match');
  const small = document.createElement('small');
  small.textContent = ok
    ? 'Your browser re-ran every draw from the revealed seed and got the same winners.'
    : 'Re-running the draws from the revealed seed gives different winners than the ones recorded.';
  v.append(small);

  $('#facts').hidden = $('#compareSec').hidden = false;
  $('#compare').addEventListener('input', e => {
    const typed = e.target.value.toLowerCase().replace(/[^0-9a-f]/g, '');
    const out = $('#compareResult');
    if (typed.length < 8) { out.textContent = ''; return; }
    const match = commit.startsWith(typed);
    out.textContent = match ? `✓ Matches the first ${typed.length} characters of the commitment` : '✗ Doesn’t match. This list or seed differs from what was locked before the draw.';
    out.style.color = match ? 'var(--ok)' : 'var(--coral)';
  });
  $('#fCommit').textContent = commit;
  $('#fHash').textContent = eHash;
  $('#fSeed').textContent = p.seed;
  $('#fSalt').textContent = p.salt ? `"${p.salt}"` : '(none)';

  $('#drawsSec').hidden = false;
  const tb = $('#draws');
  results.forEach((r, k) => {
    const tr = document.createElement('tr');
    const cells = [k + 1, r.prize, nameOf(r.winner), r.status === 'noshow' ? 'No-show, redrawn' : 'Winner', r.ok ? '✓' : `✗ expected ${nameOf(r.expected)}`];
    cells.forEach((c, i) => {
      const td = document.createElement('td');
      td.textContent = c;
      if (i === 4) td.className = r.ok ? 'ok' : 'bad';
      tr.append(td);
    });
    tb.append(tr);
  });

  renderMatches(p, entries, eHash, results);

  const winners = new Set(results.filter(r => r.status !== 'noshow').map(r => nameOf(r.winner)));
  $('#entriesSec').hidden = false;
  $('#entryCount').textContent = `(${entries.length})`;
  renderEntries(entries, winners);
  $('#find').addEventListener('input', e => renderEntries(entries, winners, e.target.value));
}

main();
