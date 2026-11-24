// node tests/run.js — checks the fairness engine and the comment parser.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { jsVersions, importMapTag } from '../scripts/js-versions.mjs';
import * as fair from '../js/fair.js';
import { parseText, buildEntries, csvToItems, sheetCsvUrl } from '../js/intake.js';
import { makeRng, assignSlots } from '../js/games/rng.js';
import { RaceSim, preRunRace, SECTION_KINDS } from '../js/games/race-sim.js';
import { BattleSim, preRunBattle } from '../js/games/battle-sim.js';
import { HorseSim, preRunHorse } from '../js/games/horse-sim.js';
import { BracketSim, preRunBracket, BRACKET_WINNERS } from '../js/games/bracket-sim.js';
import { matchReport } from '../js/games/match-report.js';
import * as BINGO from '../js/bingo/core.js';
import { SEASONS, SEASON_IDS, SPRITE_PAL, SEASON_FIGHTER_GRIDS, SEASON_HORSE_GRIDS, seasonOf, withSeason } from '../js/games/seasons.js';
import { SONGS, CHORDS, songBars } from '../js/games/music.js';
import { ALL_GRIDS, HORSE_GRIDS } from '../js/games/sprites.js';

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

// ---------- game modes ----------
const SIZES = [1, 2, 3, 10, 100];
const LEN_LIMIT = { quick: 20, normal: 35, epic: 60 };

await test('assignSlots puts each winner on their slot and everyone exactly once', () => {
  for (let s = 0; s < 300; s++) {
    const rng = makeRng(`a${s}`), size = 1 + Math.floor(rng() * 100), count = 1 + Math.floor(rng() * Math.min(size, 10));
    const pick = () => { const a = Array.from({ length: size }, (_, i) => i); for (let i = size - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a.slice(0, count); };
    const winners = pick(), winSlots = pick(), slots = assignSlots(size, winners, winSlots, rng);
    winSlots.forEach((slot, j) => assert.equal(slots[slot], winners[j]));
    assert.deepEqual([...slots].sort((x, y) => x - y), Array.from({ length: size }, (_, i) => i));
  }
});

await test('assignSlots gives non-winners no favoured slot', () => {
  const hits = new Array(5).fill(0);
  for (let s = 0; s < 20000; s++) hits[assignSlots(6, [5], [5], makeRng(`u${s}`)).indexOf(0)]++;
  for (const h of hits) assert.ok(h > 3600 && h < 4400, `slot hits ${hits}`);
});

await test('sprite grids are the right width on valid rows', () => {
  for (const [grids, width, height] of [[ALL_GRIDS, 16, 16], [HORSE_GRIDS, 28, 20]]) for (const grid of grids) for (const [y, line] of grid) {
    assert.equal(line.length, width, `row ${y}: "${line}"`);
    assert.ok(y >= 0 && y < height);
  }
});

for (const [label, pre, Sim, slotsOf] of [
  ['race', preRunRace, RaceSim, (sim, c) => { while (!sim.decided(c)) sim.step(); return sim.ranking().slice(0, c); }],
  ['horse', preRunHorse, HorseSim, (sim, c) => { while (!sim.decided(c)) sim.step(); return sim.ranking().slice(0, c); }],
  ['battle', preRunBattle, BattleSim, sim => { while (!sim.winners) sim.step(); return sim.winners; }],
]) {
  await test(`${label}: same seed replays identically, and pre-run matches playback`, () => {
    for (const size of SIZES) for (const c of [1, 3]) {
      const count = Math.min(c, size), a = pre(size, 'det', 'quick', count);
      assert.deepEqual(a, pre(size, 'det', 'quick', count));
      assert.deepEqual(slotsOf(new Sim(size, 'det', 'quick', count), count), a.winSlots);
    }
  });

  await test(`${label}: always ends on time with the right number of different winners`, () => {
    for (const [len, secs] of Object.entries(LEN_LIMIT)) for (const size of SIZES) for (const c of [1, 2, 5, 50]) for (let s = 0; s < (size === 100 ? 2 : 4); s++) {
      const r = pre(size, `${label}${s}`, len, c), want = Math.min(c, size);
      assert.equal(r.winSlots.length, want, `${size} ${len} x${c}`);
      assert.equal(new Set(r.winSlots).size, want);
      for (const w of r.winSlots) assert.ok(w >= 0 && w < size);
      assert.ok(r.finishAt <= secs * 2.3, `${size} ${len} x${c} seed ${s}: ${r.finishAt.toFixed(1)}s`);
    }
  });

  await test(`${label}: any slot can come out on top`, () => {
    const seen = new Set();
    for (let s = 0; s < 120; s++) seen.add(pre(4, `any${s}`, 'quick', 1).winSlots[0]);
    assert.equal(seen.size, 4);
  });
}

await test('battle: fighters really fight, with dodges, blocks and mostly KOs', () => {
  const seen = { hit: 0, block: 0, dodge: 0, ko: 0, zone: 0 };
  let backedOff = false, circled = false;
  for (let s = 0; s < 4; s++) {
    const sim = new BattleSim(30, `fight${s}`, 'quick'), counted = new Set();
    while (!sim.winners) {
      sim.step();
      for (const e of sim.events) if (!counted.has(e)) { counted.add(e); if (e.type in seen) seen[e.type]++; }
      backedOff ||= sim.f.some(f => !f.dead && f.plan === 'backoff');
      circled ||= sim.f.some(f => !f.dead && f.plan === 'circle');
    }
  }
  assert.ok(seen.dodge > 20 && seen.block > 20, JSON.stringify(seen));
  assert.ok(seen.ko > seen.zone * 2, JSON.stringify(seen));
  assert.ok(backedOff && circled);
});

await test('battle: fighters stay out of the circle instead of dodging to their deaths', () => {
  let dodges = 0, outside = 0, zone = 0, falls = 0;
  for (const n of [8, 30, 100]) for (let run = 0; run < 4; run++) {
    const sim = new BattleSim(n, `zone${run}`, 'quick'), was = new Array(n).fill(false);
    while (!sim.winners) {
      sim.step();
      const r = sim.zone();
      sim.f.forEach((f, i) => {
        if (f.dead) return;
        const rolling = f.dodge > 0;
        if (rolling && !was[i]) dodges++;
        if (!rolling && was[i] && Math.hypot(f.x - sim.zx, f.y - sim.zy) > r) outside++;
        was[i] = rolling;
      });
      for (const e of sim.events) { if (e.type === 'zone') { zone++; falls++; } else if (e.type === 'ko') falls++; }
      sim.events = [];
    }
  }
  assert.ok(dodges > 200, `only ${dodges} dodges`);
  assert.ok(outside / dodges < 0.01, `${outside} of ${dodges} dodges ended outside`);
  assert.ok(zone / falls < 0.02, `${zone} of ${falls} deaths were to the circle`);
});

await test('race: every draw gets its own course, rebuilt the same from its seed', () => {
  const shape = sim => JSON.stringify([sim.course.sections.map(q => [q.kind, q.variant, q.flip]), sim.course.statics.length, sim.course.movers.length, sim.course.chuteL, sim.course.palette]);
  const seen = new Set(), kinds = new Set(), variants = new Set();
  for (let s = 0; s < 200; s++) {
    const a = new RaceSim(12, `course${s}`, 'normal');
    assert.equal(shape(a), shape(new RaceSim(12, `course${s}`, 'normal')));
    seen.add(shape(a));
    for (const q of a.course.sections) { kinds.add(q.kind); variants.add(`${q.kind}:${String(q.variant).replace(/^\d+[ x]?\d* ?/, '')}`); }
  }
  assert.ok(seen.size >= 195, `only ${seen.size} different courses in 200`);
  assert.deepEqual([...kinds].sort(), [...SECTION_KINDS].sort());
  for (const v of ['pegs:grid', 'pegs:diamond', 'pegs:plinko', 'spinners:pair', 'spinners:trio', 'spinners:quad', 'spinners:giant', 'bumpers:rows', 'bumpers:triangle', 'bumpers:scatter']) assert.ok(variants.has(v), `never saw ${v}`);
});

await test('race: no course traps the field', () => {
  for (const n of [2, 12, 40, 100]) for (let s = 0; s < (n === 100 ? 6 : 20); s++) {
    const sim = new RaceSim(n, `trap${s}`, 'quick');
    while (!sim.decided(1)) sim.step();
    assert.ok(sim.order.length > 0, `${n} balls, seed ${s}: nobody finished before the time limit`);
  }
});

await test('match reports rebuild the same winners as the game', () => {
  const pool = Array.from({ length: 24 }, (_, i) => ({ name: `P${i}`, weight: 1, i }));
  for (const [mode, pre] of [['race', preRunRace], ['horse', preRunHorse], ['battle', preRunBattle]]) for (const count of [1, 3]) for (let s = 0; s < 3; s++) {
    const seed = `rep${s}`, winnerIdxs = [5, 11, 2].slice(0, count);
    const r = matchReport({ mode, length: 'quick', count, seed, pool, winnerIdxs });
    assert.deepEqual(r.winSlots, pre(24, seed, 'quick', count).winSlots);
    const winners = winnerIdxs.map(i => `P${i}`);
    if (r.kind === 'battle') {
      assert.deepEqual(r.survivors.map(x => x.name), winners);
      assert.equal(r.falls.length, 24 - count);
      assert.equal(r.kos + r.zoneOuts, r.falls.length);
    } else {
      assert.deepEqual(r.standings.slice(0, count).map(x => x.name), winners);
      assert.equal(new Set(r.standings.map(x => x.name)).size, 24);
    }
  }
});

await test('verify links expire at exactly 7 days, including older links', () => {
  const day = 86400000, t = 1800000000000;
  assert.equal(fair.linkExpired({ made: t }, t + 7 * day - 1), false);
  assert.equal(fair.linkExpired({ made: t }, t + 7 * day), true);
  assert.equal(fair.linkExpired({ lockedAt: t - 9 * day, draws: [{ at: t }, { at: t - day }] }, t + 6 * day), false);
  assert.equal(fair.linkExpired({ lockedAt: t, draws: [] }, t + 7 * day), true);
  assert.equal(fair.linkExpired({}, t), false);
});

await test('music: every bar is the right length and the melody fits its chords', () => {
  for (const [mode, song] of Object.entries(SONGS)) {
    const steps = song.stepsPerBeat * 4;
    for (const [chord, line] of songBars(song)) {
      assert.ok(CHORDS[chord], `${mode}: unknown chord ${chord}`);
      const t = line.trim().split(/\s+/);
      assert.equal(t.length, steps, `${mode}: ${line}`);
      assert.ok(!/^[.]/.test(t[0]), `${mode}: bar starts on a hold: ${line}`);
      t.forEach((tok, i) => {
        if (tok === '.' && t[i - 1] === '-') assert.fail(`${mode}: hold after a rest: ${line}`);
        if (tok !== '.' && tok !== '-') assert.match(tok, /^[A-G]#?[3-7]$/);
      });
      for (const beat of [0, steps / 2]) {           // the strongest beats land on chord tones
        const tok = t[beat];
        if (tok === '.' || tok === '-') continue;
        assert.ok(CHORDS[chord].includes(tok.replace(/\d/, '')), `${mode}: ${tok} on a strong beat over ${chord}: ${line}`);
      }
    }
  }
});

await test('every page loads the current fingerprint of the code', () => {
  const root = new URL('..', import.meta.url).pathname, v = jsVersions(root);
  for (const page of ['app.html', 'overlay.html', 'verify.html', 'privacy.html', 'index.html', 'patch-notes/index.html']) {
    const html = readFileSync(root + page, 'utf8');
    assert.ok(html.includes(importMapTag(v)), `${page} has an out-of-date import map. Run: node scripts/build-pages.mjs`);
    const first = html.indexOf('type="importmap"'), mod = html.indexOf('type="module"');
    assert.ok(first > -1 && first < mod, `${page}: the import map must come before module scripts`);
    for (const [, file, ver] of html.matchAll(/type="module" src="\/?(js\/[\w-]+\.js)(?:\?v=(\w+))?"/g)) assert.equal(ver, v[file], `${page}: ${file}`);
  }
});

await test('seasonal themes: every sprite row fits and every colour exists', () => {
  const fighter = new Set(Object.keys(SPRITE_PAL).concat(['k', 's', 'c', 'C', 'b', 'h', 'H', 'm', 'M', 'w', 'y', '.']));
  for (const grid of SEASON_FIGHTER_GRIDS) for (const [y, line] of grid) {
    assert.equal(line.length, 16, line);
    assert.ok(y >= 0 && y < 16, String(y));
    for (const ch of line) assert.ok(fighter.has(ch), `unknown colour ${ch} in ${line}`);
  }
  const horse = new Set(Object.keys(SPRITE_PAL).concat(['k', '.']));
  for (const grid of SEASON_HORSE_GRIDS) for (const [y, line] of grid) {
    assert.equal(line.length, 28, line);
    assert.ok(y >= 0 && y < 20, String(y));
    for (const ch of line) assert.ok(horse.has(ch), `unknown colour ${ch} in ${line}`);
  }
  assert.equal(seasonOf('nonsense'), seasonOf('none'));
  const hex = /^(#[0-9a-f]{6}|rgba\(.+\))$/i;
  const check = (v, where) => {
    if (typeof v === 'string' && (v.startsWith('#') || v.startsWith('rgba'))) assert.match(v, hex, where);
    else if (Array.isArray(v)) v.forEach(x => check(x, where));
  };
  const base = SEASONS.none;
  for (const id of SEASON_IDS) {
    const s = SEASONS[id];
    assert.ok(s.label && s.accent, id);
    for (const part of ['race', 'horse', 'arena']) for (const key of Object.keys(base[part])) {
      if (key !== 'feature') assert.ok(s[part][key] !== undefined, `${id}.${part}.${key} is missing`);
      check(s[part][key], `${id}.${part}.${key}`);
    }
    if (id === 'none') continue;
    assert.ok(s.colors.length >= 3 && s.wheel.rim && s.wheel.pointer && s.wheel.hub, id);
    assert.ok(s.battle.hats.length && s.battle.weapons.length && s.battle.skin.length && s.battle.cloth.length && s.battle.hair.length, id);
    assert.ok(s.horse.coats.length && s.horse.silks.length && s.horse.overlay.length, id);
    for (const c of [...s.horse.coats, ...s.horse.silks]) assert.equal(c.length, 3, id);
    for (const c of s.battle.cloth) assert.equal(c.length, 2, id);
  }
  // Keeping the wheel's themed colours separate means switching off restores the host's own.
  const mine = { colors: ['#111111'], season: 'christmas' };
  assert.deepEqual(withSeason(mine).colors, SEASONS.christmas.colors);
  assert.deepEqual(mine.colors, ['#111111']);
  assert.deepEqual(withSeason({ ...mine, season: 'none' }).colors, ['#111111']);
});

await test('seasonal themes can never reach a simulation', () => {
  for (const file of ['race-sim', 'horse-sim', 'battle-sim', 'bracket-sim', 'rng', 'match-report']) {
    const src = readFileSync(new URL(`../js/games/${file}.js`, import.meta.url), 'utf8');
    assert.ok(!/season/i.test(src), `${file}.js mentions seasons`);
  }
  assert.ok(!/season/i.test(readFileSync(new URL('../js/fair.js', import.meta.url), 'utf8')));
});

await test('bracket: same seed replays identically, every size works, and winners are distinct', () => {
  for (const n of [2, 3, 4, 5, 7, 8, 13, 16, 31, 33, 64]) for (const len of ['quick', 'normal', 'epic']) for (const c of [1, 2, 3, 4]) {
    const a = preRunBracket(n, `br${n}`, len, c), want = Math.min(c, n, BRACKET_WINNERS);
    assert.deepEqual(a, preRunBracket(n, `br${n}`, len, c));
    assert.equal(a.winSlots.length, want, `${n} ${len} x${c}`);
    assert.equal(new Set(a.winSlots).size, want);
    for (const w of a.winSlots) assert.ok(w >= 0 && w < n);
    const sim = new BracketSim(n, `br${n}`, len, c);
    assert.deepEqual([...sim.ranking()].sort((x, y) => x - y), Array.from({ length: n }, (_, i) => i));
    assert.ok(a.finishAt <= LEN_LIMIT[len] * 1.3, `${n} ${len}: ${a.finishAt.toFixed(1)}s`);
    for (const m of sim.rounds.flat()) if (!m.bye) { assert.equal(m.script.at(-1).by, 'w'); assert.equal(m.script.at(-1).move, 'hit'); }
  }
});

await test('bracket: any slot can become champion, byes included', () => {
  const seen = new Set();
  for (let s = 0; s < 400; s++) seen.add(preRunBracket(5, `any${s}`, 'quick', 1).winSlots[0]);
  assert.equal(seen.size, 5);
});

await test('bracket: the match report rebuilds the drawn winners in order', () => {
  const pool = Array.from({ length: 20 }, (_, i) => ({ name: `P${i}`, weight: 1, i }));
  const r = matchReport({ mode: 'bracket', length: 'quick', count: 3, seed: 'rep', pool, winnerIdxs: [4, 9, 2] });
  assert.deepEqual(r.standings, ['P4', 'P9', 'P2']);
  assert.equal(r.rounds.flat().length, r.rounds.length);
});

await test('bingo: call order is a deterministic permutation, and the salt and code change it', async () => {
  const seed = 'c'.repeat(64);
  for (const t of [75, 90]) {
    const o = await BINGO.callOrder(seed, t, 'K7QM', 'mango');
    assert.deepEqual([...o].sort((a, b) => a - b), Array.from({ length: t }, (_, i) => i + 1));
    assert.deepEqual(o, await BINGO.callOrder(seed, t, 'K7QM', 'mango'));
    assert.notDeepEqual(o, await BINGO.callOrder(seed, t, 'K7QM', 'apple'));
    assert.notDeepEqual(o, await BINGO.callOrder(seed, t, 'K7QN', 'mango'));
  }
  await assert.rejects(BINGO.callOrder('xyz', 75, 'K7QM'));
});

await test('bingo: first calls are spread evenly', async () => {
  const counts = Array(76).fill(0), N = 3000;
  for (let i = 0; i < N; i++) counts[(await BINGO.callOrder(fair.newSeed(), 75, 'K7QM'))[0]]++;
  const exp = N / 75, chi = counts.slice(1).reduce((s, c) => s + (c - exp) ** 2 / exp, 0);
  assert.ok(chi < 130, `chi-square ${chi.toFixed(1)}`); // df 74, p ≈ 0.0001
});

await test('bingo: every card is valid for its type', () => {
  for (const code of ['K7QM', 'ZZZZ', '2345']) for (let n = 1; n <= 1500; n++) {
    const c = BINGO.makeCard(code, n, 75), nums = BINGO.cardNumbers(c);
    assert.equal(nums.length, 24); assert.equal(new Set(nums).size, 24); assert.equal(c.rows[2][2], 0);
    c.rows.forEach(r => r.forEach((v, col) => v && assert.ok(v >= col * 15 + 1 && v <= col * 15 + 15)));
    const t = BINGO.makeCard(code, n, 90), tn = BINGO.cardNumbers(t);
    assert.equal(tn.length, 15); assert.equal(new Set(tn).size, 15);
    t.rows.forEach(r => assert.equal(r.filter(Boolean).length, 5));
    for (let col = 0; col < 9; col++) {
      const vs = t.rows.map(r => r[col]).filter(Boolean), lo = col === 0 ? 1 : col * 10, hi = col === 8 ? 90 : col * 10 + 9;
      assert.ok(vs.length >= 1 && vs.length <= 3);
      vs.forEach((v, i) => { assert.ok(v >= lo && v <= hi); if (i) assert.ok(v > vs[i - 1]); });
    }
  }
});

await test('bingo: cards are rebuilt from the game code alone', () => {
  assert.deepEqual(BINGO.makeCard('K7QM', 42, 75), BINGO.makeCard('K7QM', 42, 75));
  assert.notDeepEqual(BINGO.makeCard('K7QM', 42, 75).rows, BINGO.makeCard('K7QN', 42, 75).rows);
  assert.notDeepEqual(BINGO.makeCard('K7QM', 42, 75).rows, BINGO.makeCard('K7QM', 43, 75).rows);
  assert.ok(BINGO.validCode(BINGO.newCode()));
  assert.equal(BINGO.cardLabel(42), '#0042');
  assert.equal(BINGO.ballLabel(12, 75), 'B 12');
  assert.equal(BINGO.ballLabel(75, 75), 'O 75');
});

await test('bingo: cards are identical on every engine (pinned fingerprint)', async () => {
  // Chrome, Safari and Node must deal the same card for the same code and number, or printed
  // cards, phone cards and the host's check would disagree. This fingerprint was checked in all three.
  const out = [];
  for (const n of [1, 42, 777, 9999]) out.push(JSON.stringify(BINGO.makeCard('K7QM', n, 90).rows), JSON.stringify(BINGO.makeCard('K7QM', n, 75).rows));
  assert.equal((await BINGO.sha256(out.join('|'))).slice(0, 16), '04826cae55b6630b');
});

await test('bingo: the player list is part of the commitment, and lists are cleaned', async () => {
  const seed = 'd'.repeat(64);
  const plain = await BINGO.bingoCommit(seed, 75, 'K7QM');
  assert.equal(plain, await BINGO.sha256(`spindraw-bingo-v1|${seed}|75|K7QM`)); // unchanged for games without a list
  const a = await BINGO.bingoCommit(seed, 75, 'K7QM', await BINGO.rosterHash(['Ana', 'Ben']));
  const b = await BINGO.bingoCommit(seed, 75, 'K7QM', await BINGO.rosterHash(['Ben', 'Ana']));
  assert.notEqual(a, plain); assert.notEqual(a, b);
  assert.deepEqual(BINGO.cleanRoster(' Ana \n\nana\n Ben   Cruz\nBEN CRUZ\nCara'), ['Ana', 'Ben Cruz', 'Cara']);
});

await test('bingo: custom 75-ball patterns', () => {
  const c = BINGO.makeCard('K7QM', 9, 75), R = c.rows;
  const T = BINGO.customPattern(BINGO.cellsMask([[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 2], [2, 2], [3, 2], [4, 2]]));
  assert.ok(BINGO.validCustom(T) && BINGO.validPattern(75, T) && !BINGO.validPattern(90, T));
  const nums = [...R[0], R[1][2], R[3][2], R[4][2]]; // the centre is free
  assert.ok(BINGO.checkCard(c, nums, T).won);
  assert.equal(BINGO.checkCard(c, nums.slice(1), T).missing, 1);
  assert.ok(!BINGO.validCustom('c:4096'));                     // only the free centre
  assert.ok(!BINGO.validCustom('c:99999999') && !BINGO.validCustom('c:-1') && !BINGO.validCustom('line'));
  assert.deepEqual(BINGO.maskCells(BINGO.customMask(T)).length, 9);
  assert.equal(BINGO.patternName(T, 'Letter T'), 'Letter T');
  assert.equal(BINGO.patternName(T), 'Custom pattern');
  assert.equal(BINGO.patternName('corners'), 'Four corners');
});

await test('bingo: checkCard gets every pattern right', () => {
  const c = BINGO.makeCard('K7QM', 7, 75), R = c.rows;
  assert.ok(BINGO.checkCard(c, R[0], 'line').won);
  assert.ok(BINGO.checkCard(c, R.map(r => r[1]), 'line').won);
  assert.ok(BINGO.checkCard(c, [R[0][0], R[1][1], R[3][3], R[4][4]], 'line').won); // diagonal through the free centre
  assert.equal(BINGO.checkCard(c, R[0].slice(0, 4), 'line').missing, 1);
  assert.ok(BINGO.checkCard(c, [R[0][0], R[0][4], R[4][0], R[4][4]], 'corners').won);
  assert.ok(!BINGO.checkCard(c, [R[0][0], R[0][4], R[4][0]], 'corners').won);
  const x = [0, 1, 3, 4].flatMap(k => [R[k][k], R[k][4 - k]]);
  assert.ok(BINGO.checkCard(c, x, 'x').won);
  assert.equal(BINGO.checkCard(c, x.slice(1), 'x').missing, 1);
  assert.ok(BINGO.checkCard(c, BINGO.cardNumbers(c), 'blackout').won);
  assert.equal(BINGO.checkCard(c, [], 'blackout').missing, 24);
  const t = BINGO.makeCard('K7QM', 7, 90), T = t.rows.map(r => r.filter(Boolean));
  assert.deepEqual(BINGO.checkCard(t, T[1], 'one'), { won: true, detail: 'row 2', missing: 0 });
  assert.ok(!BINGO.checkCard(t, T[1], 'two').won);
  assert.ok(BINGO.checkCard(t, [...T[0], ...T[2]], 'two').won);
  assert.ok(!BINGO.checkCard(t, [...T[0], ...T[2]], 'full').won);
  assert.ok(BINGO.checkCard(t, BINGO.cardNumbers(t), 'full').won);
  assert.throws(() => BINGO.checkCard(c, [], 'full'));
});

await test('gameSeed is stable, varies per draw, and does not contain the seed', async () => {
  const seed = fair.newSeed(), h = await fair.entriesHash(entries);
  const a = await fair.gameSeed(seed, h, 'salt', 0);
  assert.equal(a, await fair.gameSeed(seed, h, 'salt', 0));
  assert.notEqual(a, await fair.gameSeed(seed, h, 'salt', 1));
  assert.ok(!a.includes(seed));
});

console.log(`\n${n} tests passed`);
