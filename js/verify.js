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
  run(p);
}

async function run(p) {
  $('#verdict').hidden = true;

  const entries = p.entries.map(([name, weight]) => ({ name, weight }));
  const { eHash, commit, results } = await fair.replay({ entries, seed: p.seed, salt: p.salt ?? '', removeWinners: p.removeWinners, draws: p.draws });
  const nameOf = i => entries[i]?.name ?? '(none)';

  document.title = `Verify: ${p.title} · SpinDraw`;
  $('#title').textContent = p.title;
  const tickets = entries.reduce((s, e) => s + e.weight, 0);
  $('#meta').textContent = `Locked ${new Date(p.lockedAt).toLocaleString()} · ${entries.length} people · ${tickets} entries · winners ${p.removeWinners ? 'removed' : 'kept'} after each draw`;

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
    out.textContent = match ? `✓ Matches the first ${typed.length} characters of the commitment` : '✗ Doesn’t match. This list or seed differs from what was locked on stream.';
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

  const winners = new Set(results.filter(r => r.status !== 'noshow').map(r => nameOf(r.winner)));
  $('#entriesSec').hidden = false;
  $('#entryCount').textContent = `(${entries.length})`;
  renderEntries(entries, winners);
  $('#find').addEventListener('input', e => renderEntries(entries, winners, e.target.value));
}

main();
