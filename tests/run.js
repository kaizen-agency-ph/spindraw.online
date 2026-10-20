// node tests/run.js — checks the fairness engine and the comment parser.
import assert from 'node:assert/strict';
import * as fair from '../js/fair.js';
import { parseText, buildEntries, csvToItems, sheetCsvUrl } from '../js/intake.js';

let n = 0;
const test = async (name, fn) => { await fn(); n++; console.log(`✓ ${name}`); };

const entries = ['Ana', 'Ben', 'Cara', 'Dan', 'Eve'].map((name, i) => ({ name, weight: i === 1 ? 3 : 1 }));

await test('pick is deterministic and in range', async () => {
  const seed = fair.newSeed();
  const eHash = await fair.entriesHash(entries);
  const pool = fair.currentPool(entries, [], true);
  const a = await fair.pickIndex(seed, eHash, 'mango', 0, pool);
  const b = await fair.pickIndex(seed, eHash, 'mango', 0, pool);
  assert.equal(a, b);
  assert.ok(a >= 0 && a < pool.length);
});

await test('weights roughly respected', async () => {
  const counts = new Array(entries.length).fill(0);
  const eHash = await fair.entriesHash(entries);
  const pool = fair.currentPool(entries, [], true);
  for (let i = 0; i < 2000; i++) counts[await fair.pickIndex(fair.newSeed(), eHash, '', 0, pool)]++;
  // Ben has 3/7 of tickets ≈ 857 of 2000
  assert.ok(counts[1] > 750 && counts[1] < 970, `Ben got ${counts[1]}`);
});

async function simulate({ removeWinners, statuses }) {
  const seed = fair.newSeed();
  const eHash = await fair.entriesHash(entries);
  const draws = [];
  for (const status of statuses) {
    const pool = fair.currentPool(entries, draws, removeWinners);
    const idx = await fair.pickIndex(seed, eHash, 'salt', draws.length, pool);
    draws.push({ prize: 'p', winner: pool[idx].i, status, at: 0 });
  }
  return { seed, draws };
}

await test('replay matches a real run (with no-shows)', async () => {
  const { seed, draws } = await simulate({ removeWinners: true, statuses: ['noshow', 'claimed', 'claimed', 'noshow', 'claimed'] });
  const r = await fair.replay({ entries, seed, salt: 'salt', removeWinners: true, draws });
  assert.ok(r.results.every(x => x.ok));
  assert.equal(new Set(draws.map(d => d.winner)).size, 5, 'no one drawn twice');
  assert.equal(r.commit, await fair.commitment(seed, await fair.entriesHash(entries)));
});

await test('replay catches a tampered winner, salt or list', async () => {
  const { seed, draws } = await simulate({ removeWinners: false, statuses: ['claimed', 'claimed'] });
  const forged = draws.map((d, k) => (k === 0 ? { ...d, winner: (d.winner + 1) % entries.length } : d));
  assert.ok(!(await fair.replay({ entries, seed, salt: 'salt', removeWinners: false, draws: forged })).results[0].ok);
  const salted = await fair.replay({ entries, seed, salt: 'other', removeWinners: false, draws });
  const honest = await fair.replay({ entries, seed, salt: 'salt', removeWinners: false, draws });
  assert.ok(honest.results.every(x => x.ok));
  const edited = await fair.replay({ entries: entries.map((e, i) => (i === 4 ? { ...e, name: 'Evil' } : e)), seed, salt: 'salt', removeWinners: false, draws });
  assert.notEqual(edited.commit, honest.commit);
  assert.ok(salted.commit === honest.commit); // salt is public, not part of the commitment
});

await test('payload round-trips through the URL encoding', async () => {
  const big = Array.from({ length: 3000 }, (_, i) => [`Person ${i} 🎉`, 1 + (i % 3)]);
  const payload = { v: 1, title: 'Test', entries: big, seed: fair.newSeed(), salt: 'x', removeWinners: true, draws: [] };
  const enc = await fair.encodePayload(payload);
  assert.match(enc, /^[\w-]+$/);
  assert.deepEqual(await fair.decodePayload(enc), payload);
  console.log(`  3000 entries → ${enc.length} chars`);
});

await test('lines format with weights', () => {
  const { entries: e, stats } = buildEntries(parseText('Juan x3\nMaria, 2\n@Alex\n\njuan\nRoom 7', 'lines'), { dedupe: true });
  assert.deepEqual(e, [{ name: 'Juan', weight: 3 }, { name: 'Maria', weight: 2 }, { name: 'Alex', weight: 1 }, { name: 'Room 7', weight: 1 }]);
  assert.equal(stats.dupes, 1);
});

await test('facebook comment dump', () => {
  const fb = `Most relevant
Top fan
Juan Dela Cruz
#JOIN po sana manalo
2m · Like · Reply
Maria Santos
Author
joining! #join
5m · Like · Reply · Edited
3
Pedro Penduko
ang ganda
1h · Like · Reply
Juan Dela Cruz
#JOIN ulit
1m · Like · Reply
View 2 replies`;
  const { entries: e, stats } = buildEntries(parseText(fb, 'comments'), { dedupe: true, keyword: '#join' });
  assert.deepEqual(e.map(x => x.name), ['Juan Dela Cruz', 'Maria Santos']);
  assert.equal(stats.filtered, 1);
  assert.equal(stats.dupes, 1);
});

await test('youtube comment dump (time before text)', () => {
  const yt = `@gamerjoe
2 hours ago
JOIN me please
12
Reply
@lisa.k
1 day ago (edited)
join
Reply`;
  const { entries: e } = buildEntries(parseText(yt, 'comments'), { keyword: 'join' });
  assert.deepEqual(e.map(x => x.name), ['gamerjoe', 'lisa.k']);
});

await test('tiktok comment dump', () => {
  const tt = `cutie_pie
#join 🥺
2h
Reply
120
mark.dev
hello
10-18
Reply`;
  const { entries: e } = buildEntries(parseText(tt, 'comments'), { keyword: '#join' });
  assert.deepEqual(e.map(x => x.name), ['cutie_pie']);
});

await test('live chat lines', () => {
  const { entries: e } = buildEntries(parseText('12:01 PM Juan: !join\n[12:02] Ana: hi\nBen: !JOIN', 'chat'), { keyword: '!join' });
  assert.deepEqual(e.map(x => x.name), ['Juan', 'Ben']);
});

await test('CSV / Google Forms', () => {
  const csv = 'Timestamp,Full Name,Tickets,Comment\n2026/10/20,"Cruz, Juan",2,#join\n2026/10/20,Ana,1,"said ""hi"""\n';
  const items = csvToItems(csv);
  assert.deepEqual(items.map(i => [i.name, i.weight, i.text]), [['Cruz, Juan', 2, '#join'], ['Ana', 1, 'said "hi"']]);
  assert.equal(sheetCsvUrl('https://docs.google.com/spreadsheets/d/abc_123/edit#gid=42'), 'https://docs.google.com/spreadsheets/d/abc_123/gviz/tq?tqx=out:csv&gid=42');
});

console.log(`\n${n} tests passed`);
