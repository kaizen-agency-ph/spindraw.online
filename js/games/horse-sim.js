// Horse Race simulation: each horse has its own pace, stamina and finishing kick, plus
// changing form during the race. No DOM, so it can be pre-run and tested in Node. Horses
// slipstream the ones ahead, which keeps the field close, but nobody is steered to win.
import { makeRng, LENGTHS } from './rng.js';

const DT = 1 / 60, CRUISE = 62;     // world px per second

export class HorseSim {
  constructor(n, seed, length = 'normal') {
    const rng = this.rng = makeRng(`horse|${seed}`);
    this.n = n;
    this.target = LENGTHS[length] ?? LENGTHS.normal;
    this.finishX = this.target * CRUISE;
    this.t = 0;
    this.order = [];
    this.limit = this.target * 2.2;
    this.h = Array.from({ length: n }, (_, i) => ({
      x: 0, v: 0, form: (rng() - 0.5) * 0.1, formTarget: 0, formAt: 0,
      pace: 0.97 + rng() * 0.06, kick: 0.04 + rng() * 0.13, kickAt: 0.62 + rng() * 0.22, stamina: 0.82 + rng() * 0.16,
      phase: rng() * 4, done: false, doneAt: 0, lane: i,
    }));
    // Shuffle lanes so a slot number says nothing about where a horse runs.
    const lanes = this.h.map((_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [lanes[i], lanes[j]] = [lanes[j], lanes[i]]; }
    this.h.forEach((p, i) => { p.lane = lanes[i]; });
  }

  step() {
    const { h, rng, finishX } = this;
    this.t += DT;
    let lead = 0;
    for (const p of h) lead = Math.max(lead, p.x);
    for (let i = 0; i < this.n; i++) {
      const p = h[i], prog = p.x / finishX;
      if (this.t >= p.formAt) { p.formTarget = (rng() - 0.5) * 0.3; p.formAt = this.t + 1.2 + rng() * 2.4; }  // surges and lulls
      p.form += (p.formTarget - p.form) * Math.min(1, DT * 1.6);
      if (p.done) {           // eases up after the line
        p.v = Math.max(CRUISE * 0.25, p.v - CRUISE * 0.8 * DT);
        p.x += p.v * DT;
        p.phase += (p.v / CRUISE) * 10 * DT;
        continue;
      }
      const start = Math.min(1, this.t / 1.6);                                     // breaks from the gate
      const tired = prog > p.stamina ? (prog - p.stamina) * 0.8 : 0;
      const kick = prog > p.kickAt ? p.kick : 0;
      const draft = Math.min(0.1, (lead - p.x) * 0.0014);                          // slipstream
      p.v = CRUISE * start * (p.pace + p.form + kick + draft - tired);
      p.x += Math.max(0, p.v) * DT;
      p.phase += (p.v / CRUISE) * 10 * DT;
      if (p.x >= finishX) { p.done = true; p.doneAt = this.t; this.order.push(i); }
    }
  }

  decided(count) { return this.order.length >= Math.min(count, this.n) || this.t >= this.limit; }

  // Slots ordered by who's ahead: finishers in finish order, then furthest along the track.
  ranking() {
    const rest = [];
    for (let i = 0; i < this.n; i++) if (!this.h[i].done) rest.push(i);
    rest.sort((a, b) => this.h[b].x - this.h[a].x || a - b);
    return [...this.order, ...rest];
  }
}

export function preRunHorse(n, seed, length, count = 1) {
  const sim = new HorseSim(n, seed, length);
  while (!sim.decided(count)) sim.step();
  return { winSlots: sim.ranking().slice(0, Math.min(count, n)), finishAt: sim.t };
}
