// Pixel Battle simulation: fighters seek the nearest enemy and melee while a zone shrinks.
// No DOM, so it can be pre-run to find the survivor and tested in Node. Nobody is steered.
import { makeRng, LENGTHS } from './rng.js';

const DT = 1 / 30, RANGE = 15;

export class BattleSim {
  constructor(n, seed, length = 'normal') {
    const rng = this.rng = makeRng(`battle|${seed}`);
    this.n = n;
    this.target = LENGTHS[length] ?? LENGTHS.normal;
    const k = Math.sqrt(Math.max(n, 6) / 100);
    this.W = Math.round(640 * Math.max(k, 0.36));
    this.H = Math.round(360 * Math.max(k, 0.36));
    this.t = 0;
    this.steps = 0;
    this.alive = n;
    this.events = [];       // { t, type: 'hit'|'ko'|'zone', a, b, dmg, x, y }
    this.winner = n === 1 ? 0 : -1;

    // HP scales with game length and shrinks with lobby size (crowds gang up), calibrated
    // so fights fill the target time and the zone only has to finish the last few.
    const hp = 13 * this.target * 1.35 * Math.pow(Math.max(n, 2), -0.31);

    const cols = Math.ceil(Math.sqrt(n * (this.W / this.H))), rows = Math.ceil(n / cols);
    const spots = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) spots.push([(c + 0.5) / cols, (r + 0.5) / rows]);
    for (let i = spots.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [spots[i], spots[j]] = [spots[j], spots[i]]; }
    this.f = Array.from({ length: n }, (_, i) => ({
      x: 28 + spots[i][0] * (this.W - 56) + (rng() - 0.5) * 8,
      y: 28 + spots[i][1] * (this.H - 56) + (rng() - 0.5) * 8,
      hp, max: hp, atk: 8 + rng() * 6, cd: rng() * 0.9, cool: 0.7 + rng() * 0.4, speed: 34 + rng() * 14,
      kills: 0, dead: false, deadAt: 0, face: rng() < 0.5 ? 1 : -1, tgt: -1, moving: false, swing: -9, hurt: -9,
    }));

    this.zx = this.W / 2 + (rng() - 0.5) * this.W * 0.14;
    this.zy = this.H / 2 + (rng() - 0.5) * this.H * 0.14;
    this.z0 = Math.hypot(this.W, this.H) * 0.62;
    this.z1 = 16;
    this.zStart = this.target * 0.2;
    this.zEnd = this.target * 0.92;
  }

  zone() {
    const u = Math.max(0, Math.min(1, (this.t - this.zStart) / (this.zEnd - this.zStart)));
    return this.z0 + (this.z1 - this.z0) * u;
  }

  retarget(i) {
    const a = this.f[i];
    let best = -1, bd = Infinity;
    for (let j = 0; j < this.n; j++) {
      if (j === i || this.f[j].dead) continue;
      const dx = this.f[j].x - a.x, dy = this.f[j].y - a.y, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = j; }
    }
    a.tgt = best;
  }

  kill(i, by) {
    const v = this.f[i];
    if (v.dead || this.alive <= 1) return;
    v.dead = true; v.deadAt = this.t; v.hp = 0;
    this.alive--;
    if (by >= 0) this.f[by].kills++;
    this.events.push({ t: this.t, type: by >= 0 ? 'ko' : 'zone', a: by, b: i, x: v.x, y: v.y });
    if (this.alive === 1) this.winner = this.f.findIndex(p => !p.dead);
  }

  step() {
    if (this.winner >= 0) return;
    const { f, rng } = this;
    this.t += DT;
    this.steps++;
    const r = this.zone();
    for (let i = 0; i < this.n && this.winner < 0; i++) {
      const a = f[i];
      if (a.dead) continue;
      a.cd -= DT;
      if (this.steps % 12 === i % 12 || a.tgt < 0 || f[a.tgt].dead) this.retarget(i);
      const zd = Math.hypot(a.x - this.zx, a.y - this.zy);
      const t = f[a.tgt];
      let mx = 0, my = 0;
      if (zd > r - 6) { mx = this.zx - a.x; my = this.zy - a.y; }     // get back inside first
      const dx = t.x - a.x, dy = t.y - a.y, d = Math.hypot(dx, dy);
      if (d > RANGE) { if (!mx && !my) { mx = dx; my = dy; } } else if (a.cd <= 0) {
        const dmg = a.atk * (0.7 + rng() * 0.6);
        t.hp -= dmg; t.hurt = this.t; a.swing = this.t;
        a.cd = a.cool;
        this.events.push({ t: this.t, type: 'hit', a: i, b: a.tgt, dmg: Math.round(dmg), x: t.x, y: t.y });
        if (t.hp <= 0) this.kill(a.tgt, i);
        if (this.winner >= 0) break;
      }
      const m = Math.hypot(mx, my);
      a.moving = m > 0;
      if (m > 0) { a.x += (mx / m) * a.speed * DT; a.y += (my / m) * a.speed * DT; }
      if (dx) a.face = dx > 0 ? 1 : -1;
      if (zd > r) {
        const over = (this.t - this.zStart) / Math.max(1, this.zEnd - this.zStart);
        a.hp -= a.max * (0.12 + over * 0.5) * DT;
        if (a.hp <= 0) this.kill(i, -1);
      }
    }
    if (this.winner >= 0) return;
    // Keep fighters from stacking on one pixel, and inside the arena.
    for (let i = 0; i < this.n; i++) {
      const a = f[i];
      if (a.dead) continue;
      for (let j = i + 1; j < this.n; j++) {
        const b = f[j];
        if (b.dead) continue;
        const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < 100 && d2 > 0) { const d = Math.sqrt(d2), p = (10 - d) * 0.5 / d; a.x += dx * p; a.y += dy * p; b.x -= dx * p; b.y -= dy * p; }
      }
      a.x = Math.max(10, Math.min(this.W - 10, a.x));
      a.y = Math.max(12, Math.min(this.H - 8, a.y));
    }
    if (this.events.length > 400) this.events.splice(0, 200);
  }

  aliveList() {
    const out = [];
    for (let i = 0; i < this.n; i++) if (!this.f[i].dead) out.push(i);
    return out;
  }
}

// Pre-run a battle to find the survivor and when it ended.
export function preRunBattle(n, seed, length) {
  const sim = new BattleSim(n, seed, length);
  while (sim.winner < 0) sim.step();
  return { winSlot: sim.winner, finishAt: sim.t };
}
