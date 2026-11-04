// Pixel Battle simulation. Each fighter thinks for itself: it picks a target, circles, presses
// or backs off, telegraphs its attacks, and dodges, blocks or counters what comes at it, while a
// zone shrinks. No DOM, so it can be pre-run to find the survivor and tested in Node.
// Temperaments belong to anonymous slots and nobody is steered: the locked draw picks the
// winner, and their name goes on whichever slot comes out on top.
import { makeRng, LENGTHS } from './rng.js';

export const BATTLE_DT = 1 / 30;
export const DODGE_TIME = 0.24;
const DT = BATTLE_DT, RANGE = 15, REACH = RANGE + 5, SIGHT = 34;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export class BattleSim {
  constructor(n, seed, length = 'normal', count = 1) {
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
    this.count = Math.max(1, Math.min(count, n));
    this.winners = null;    // survivors once only `count` are left

    // HP scales with game length and shrinks a little with lobby size (crowds gang up), calibrated
    // to the fighters' real hit rate so KOs decide most of the fight, not the zone.
    const hp = 4.6 * this.target * Math.pow(Math.max(n, 2), -0.3);

    const cols = Math.ceil(Math.sqrt(n * (this.W / this.H))), rows = Math.ceil(n / cols);
    const spots = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) spots.push([(c + 0.5) / cols, (r + 0.5) / rows]);
    for (let i = spots.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [spots[i], spots[j]] = [spots[j], spots[i]]; }
    this.f = Array.from({ length: n }, (_, i) => {
      const x = 28 + spots[i][0] * (this.W - 56) + (rng() - 0.5) * 8;
      const y = 28 + spots[i][1] * (this.H - 56) + (rng() - 0.5) * 8;
      return {
        x, y, px: x, py: y, vx: 0, vy: 0,
        hp, max: hp, atk: 8 + rng() * 6, cd: rng() * 0.9, cool: 0.7 + rng() * 0.4, speed: 34 + rng() * 14,
        kills: 0, dead: false, deadAt: 0, face: rng() < 0.5 ? 1 : -1, tgt: -1, moving: false, swing: -9, hurt: -9, whiff: false, aim: 0,
        // temperament
        aggro: 0.35 + rng() * 0.6, caution: 0.2 + rng() * 0.7, reflex: 0.25 + rng() * 0.45, poise: 0.15 + rng() * 0.35, nerve: 0.4 + rng() * 0.6,
        // what it's doing right now
        plan: 'press', strafe: rng() < 0.5 ? 1 : -1, think: rng() * 0.5,
        wind: 0, windBy: -1, stun: 0, dodge: 0, dodgeCd: rng() * 1.5, guard: 0, react: -1, reactFrom: -1,
      };
    });

    this.zx = this.W / 2 + (rng() - 0.5) * this.W * 0.14;
    this.zy = this.H / 2 + (rng() - 0.5) * this.H * 0.14;
    this.z0 = Math.hypot(this.W, this.H) * 0.62;
    this.z1 = 26;
    this.zStart = this.target * 0.2;
    this.zEnd = this.target * 0.92;
    if (this.alive <= this.count) this.finish();
  }

  // Survivors, best fight first: most KOs, then most health left.
  finish() {
    this.winners = this.aliveList().sort((a, b) => this.f[b].kills - this.f[a].kills || this.f[b].hp / this.f[b].max - this.f[a].hp / this.f[a].max || a - b);
  }

  zone() {
    const u = Math.max(0, Math.min(1, (this.t - this.zStart) / (this.zEnd - this.zStart)));
    return this.z0 + (this.z1 - this.z0) * u;
  }

  // A moment of thought: who to fight, and how. Called a few times a second per fighter.
  decide(i) {
    const { f, rng } = this, a = f[i];
    a.think = 0.3 + rng() * 0.4;
    let best = -1, bs = Infinity, threats = 0;
    for (let j = 0; j < this.n; j++) {
      const b = f[j];
      if (j === i || b.dead) continue;
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      if (d < SIGHT) threats++;
      // Nearest, but drawn to the wounded and a little loyal to the current opponent.
      const score = d - (1 - b.hp / b.max) * 26 * a.aggro - (j === a.tgt ? 12 : 0);
      if (score < bs) { bs = score; best = j; }
    }
    a.tgt = best;
    if (best < 0) return;
    const t = f[best], d = Math.hypot(t.x - a.x, t.y - a.y), mine = a.hp / a.max, theirs = t.hp / t.max;
    if (mine < 0.35 && mine < theirs && rng() < a.caution) a.plan = 'backoff';
    else if (threats >= 3 && rng() < a.caution * 0.7) a.plan = 'backoff';
    else if (d > RANGE * 1.7) a.plan = 'press';
    else a.plan = rng() < a.aggro ? 'press' : 'circle';
    if (rng() < 0.35) a.strafe = -a.strafe;
  }

  // Someone just started swinging at `i`: read it and maybe react.
  warn(i, by) {
    const { f, rng } = this, t = f[i];
    if (t.dead || t.dodge > 0 || t.stun > 0 || t.wind > 0) return;
    if (t.dodgeCd <= 0 && rng() < t.reflex) { t.react = 0.04 + rng() * 0.1; t.reactFrom = by; }
    else if (rng() < t.poise) t.guard = 0.42;
  }

  startDodge(i) {
    const { f, rng } = this, a = f[i], by = f[a.reactFrom];
    a.react = -1;
    if (!by || by.dead) return;
    const dx = a.x - by.x, dy = a.y - by.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    // Roll sideways and a little back, choosing the side that stays closer to the zone's centre.
    const side = (x, y) => Math.hypot(a.x + x * 30 - this.zx, a.y + y * 30 - this.zy);
    const s = side(-uy, ux) < side(uy, -ux) ? 1 : -1, mix = rng() < 0.2 ? -s : s;
    const speed = 125 + rng() * 25;
    a.vx = (-uy * mix * 0.9 + ux * 0.45) * speed;
    a.vy = (ux * mix * 0.9 + uy * 0.45) * speed;
    a.dodge = DODGE_TIME;
    a.dodgeCd = 1.3 + rng() * 1.3;
    a.guard = 0;
  }

  // The telegraphed attack lands now, if the target is still there.
  strike(i) {
    const { f, rng } = this, a = f[i], t = f[a.tgt];
    if (!t || t.dead) { a.cd = 0.2; return; }
    const dx = t.x - a.x, dy = t.y - a.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    const lunge = clamp((d - 10) * 10, 0, 90);
    a.vx += ux * lunge; a.vy += uy * lunge;
    a.swing = this.t; a.aim = Math.atan2(dy, dx);
    a.cd = a.cool * (0.85 + rng() * 0.3);
    a.whiff = false;
    if (t.dodge > 0 || d > REACH) {
      a.whiff = true;
      a.cd += 0.25;              // overcommitted
      this.events.push({ t: this.t, type: t.dodge > 0 ? 'dodge' : 'miss', a: i, b: a.tgt, x: t.x, y: t.y });
      if (t.dodge > 0) { t.cd = Math.min(t.cd, 0.12); t.tgt = i; t.plan = 'press'; t.think = 0.8; }   // counter
      return;
    }
    let dmg = a.atk * (0.7 + rng() * 0.6);
    if (t.guard > 0) {
      dmg *= 0.3;
      t.vx += ux * 45; t.vy += uy * 45;
      a.stun = 0.16;             // bounced off the guard
      t.cd = Math.min(t.cd, 0.1);
      t.hp -= dmg;
      this.events.push({ t: this.t, type: 'block', a: i, b: a.tgt, x: t.x, y: t.y });
    } else {
      t.vx += ux * 95; t.vy += uy * 95;
      t.stun = 0.14; t.wind = 0; t.react = -1;   // a clean hit interrupts whatever they were doing
      t.hurt = this.t;
      t.hp -= dmg;
      this.events.push({ t: this.t, type: 'hit', a: i, b: a.tgt, dmg: Math.round(dmg), x: t.x, y: t.y });
    }
    if (t.hp <= 0) this.kill(a.tgt, i);
  }

  kill(i, by) {
    const v = this.f[i];
    if (v.dead || this.winners) return;
    v.dead = true; v.deadAt = this.t; v.hp = 0;
    this.alive--;
    if (by >= 0) this.f[by].kills++;
    this.events.push({ t: this.t, type: by >= 0 ? 'ko' : 'zone', a: by, b: i, x: v.x, y: v.y });
    if (this.alive <= this.count) this.finish();
  }

  step() {
    if (this.winners) return;
    const { f, rng } = this;
    this.t += DT;
    this.steps++;
    const r = this.zone();
    for (const a of f) { a.px = a.x; a.py = a.y; }
    for (let i = 0; i < this.n && !this.winners; i++) {
      const a = f[i];
      if (a.dead) continue;
      a.cd -= DT; a.dodgeCd -= DT; a.think -= DT;
      if (a.stun > 0) a.stun -= DT;
      if (a.dodge > 0) a.dodge -= DT;
      if (a.guard > 0) a.guard -= DT;
      if (a.tgt < 0 || f[a.tgt].dead) { a.wind = 0; this.decide(i); } else if (a.think <= 0 && a.wind <= 0) this.decide(i);
      if (a.tgt < 0) continue;
      if (a.react >= 0) { a.react -= DT; if (a.react < 0 && a.stun <= 0) this.startDodge(i); }

      const t = f[a.tgt], dx = t.x - a.x, dy = t.y - a.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      const zd = Math.hypot(a.x - this.zx, a.y - this.zy);
      const free = a.stun <= 0 && a.dodge <= 0;

      if (a.wind > 0 && free) {
        a.wind -= DT;
        if (a.wind <= 0) { a.wind = 0; this.strike(i); if (this.winners) break; }
      } else if (free && a.cd <= 0 && a.wind <= 0 && d <= RANGE && (a.plan !== 'backoff' || d < RANGE * 0.7)) {
        a.wind = 0.18 + this.rng() * 0.1;     // the wind-up is what the other fighter gets to read
        a.aim = Math.atan2(dy, dx);
        this.warn(a.tgt, i);
      }

      if (a.dodge > 0) {
        // mid-roll: momentum only
      } else if (a.stun > 0 || a.wind > 0) {
        a.vx *= 0.78; a.vy *= 0.78;
      } else {
        const tx = -uy * a.strafe, ty = ux * a.strafe;
        let mx, my, pace;
        if (a.plan === 'backoff') { mx = -ux + tx * 0.5; my = -uy + ty * 0.5; pace = 1.1; }
        else if (a.plan === 'circle') {
          const radial = clamp((d - RANGE * 0.9) / RANGE, -1, 1);
          mx = ux * radial + tx; my = uy * radial + ty; pace = 0.72 * a.nerve + 0.28;
        } else { mx = ux + tx * 0.32; my = uy + ty * 0.32; pace = 1; }
        // Mind the zone and the walls.
        if (zd > r - 6) { mx = this.zx - a.x; my = this.zy - a.y; pace = 1.15; }
        else if (zd > r - 22) { const zm = zd || 1; mx += (this.zx - a.x) / zm * 0.9; my += (this.zy - a.y) / zm * 0.9; }
        if (a.x < 22) mx += 0.8; else if (a.x > this.W - 22) mx -= 0.8;
        if (a.y < 24) my += 0.8; else if (a.y > this.H - 20) my -= 0.8;
        const m = Math.hypot(mx, my) || 1;
        a.vx += (mx / m * a.speed * pace - a.vx) * 0.32;
        a.vy += (my / m * a.speed * pace - a.vy) * 0.32;
      }
      a.x += a.vx * DT;
      a.y += a.vy * DT;
      a.moving = Math.hypot(a.vx, a.vy) > 7;
      if (dx) a.face = dx > 0 ? 1 : -1;
      if (zd > r) {
        const over = (this.t - this.zStart) / Math.max(1, this.zEnd - this.zStart);
        a.hp -= a.max * (0.06 + over * 0.34) * DT;
        if (a.hp <= 0) this.kill(i, -1);
      }
    }
    if (this.winners) return;
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

// Pre-run a battle to find the surviving slots and when it ended.
export function preRunBattle(n, seed, length, count = 1) {
  const sim = new BattleSim(n, seed, length, count);
  while (!sim.winners) sim.step();
  return { winSlots: sim.winners, finishAt: sim.t };
}
