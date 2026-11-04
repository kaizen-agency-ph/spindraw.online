// Rebuilds what happened in a game from its seed, for the verify page. No DOM. It runs the same
// simulation and name assignment as playback, so nothing about a match has to be stored in the link.
import { makeRng, assignSlots } from './rng.js';
import { RaceSim } from './race-sim.js';
import { HorseSim } from './horse-sim.js';
import { BattleSim } from './battle-sim.js';

function raceReport(Sim, { seed, length, count, pool, winnerIdxs }) {
  const n = pool.length, want = Math.min(count, n), sim = new Sim(n, seed, length);
  const finishedAt = new Map(), front = new Map();
  let lead = -1, changes = 0, tick = 0, seen = 0;
  while (!sim.decided(want)) {
    sim.step();
    for (; seen < sim.order.length; seen++) finishedAt.set(sim.order[seen], sim.t);
    if (sim.t - tick >= 0.25) {
      const top = sim.ranking()[0];
      front.set(top, (front.get(top) ?? 0) + (sim.t - tick));
      tick = sim.t;
      if (top !== lead) { if (lead >= 0) changes++; lead = top; }
    }
  }
  const rank = sim.ranking(), winSlots = rank.slice(0, want);
  const slots = assignSlots(n, winnerIdxs, winSlots, makeRng(`${seed}|slots`));
  const name = slot => pool[slots[slot]].name;
  const [leader, seconds] = [...front].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0] ?? [winSlots[0], 0];
  return {
    kind: 'race', players: n, duration: sim.t, winSlots, leadChanges: changes,
    frontRunner: { name: name(leader), seconds },
    standings: rank.map((slot, i) => ({ place: i + 1, name: name(slot), time: finishedAt.get(slot) ?? null, won: i < want })),
  };
}

function battleReport({ seed, length, count, pool, winnerIdxs }) {
  const n = pool.length, want = Math.min(count, n), sim = new BattleSim(n, seed, length, want);
  const tally = { hit: 0, dodge: 0, block: 0, miss: 0 }, falls = [];
  while (!sim.winners) {
    sim.step();
    for (const e of sim.events) {
      if (e.type in tally) tally[e.type]++;
      else falls.push(e);
    }
    sim.events = [];
  }
  const winSlots = sim.winners;
  const slots = assignSlots(n, winnerIdxs, winSlots, makeRng(`${seed}|slots`));
  const name = slot => pool[slots[slot]].name;
  const kos = falls.filter(e => e.type === 'ko').length;
  return {
    kind: 'battle', players: n, duration: sim.t, winSlots, ...tally, kos, zoneOuts: falls.length - kos,
    survivors: winSlots.map(s => ({ name: name(s), kills: sim.f[s].kills, health: Math.max(1, Math.round(sim.f[s].hp / sim.f[s].max * 100)) })),
    topKos: sim.f.map((f, s) => ({ name: name(s), kills: f.kills })).filter(x => x.kills).sort((a, b) => b.kills - a.kills || a.name.localeCompare(b.name)).slice(0, 5),
    falls: falls.map(e => ({ t: e.t, name: name(e.b), by: e.type === 'ko' ? name(e.a) : null })),
  };
}

export function matchReport(match) {
  if (match.mode === 'battle') return battleReport(match);
  return raceReport(match.mode === 'horse' ? HorseSim : RaceSim, match);
}
