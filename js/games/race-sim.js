// Ball Race simulation: fixed-step circle physics down an obstacle course. No DOM, so it
// can be pre-run to find the first finisher and tested in Node. Nothing steers any ball.
import { makeRng, LENGTHS } from './rng.js';

export const WORLD_W = 1000;
const DT = 1 / 120, GRAVITY = 1000, MAX_SPEED = 1300, BAND = 400;
const AVG_DESCENT = 240;                 // px/s the leaders average; sets course length

function buildCourse(rng, target, n) {
  const statics = [], movers = [];
  const seg = (ax, ay, bx, by, t = 7, e = 0.5) => statics.push({ k: 's', ax, ay, bx, by, t, e });
  const circ = (x, y, r, e = 0.6, kind = 'peg') => statics.push({ k: 'c', x, y, r, e, kind });

  const pegs = y => {
    const rows = 5 + Math.floor(rng() * 3);
    for (let r = 0; r < rows; r++) for (let x = r % 2 ? 110 : 60; x < WORLD_W; x += 100) circ(x, y + 80 + r * 100, 10);
    return y + 120 + rows * 100;
  };
  const spinners = y => {
    const dir = rng() < 0.5 ? 1 : -1;
    [[260, 200, 1], [740, 200, -1], [500, 520, 1]].forEach(([cx, dy, s]) => movers.push({ k: 'rot', cx, cy: y + dy, len: 170, w: dir * s * (1.5 + rng() * 0.8), a0: rng() * 6.28, t: 8, e: 0.55 }));
    return y + 760;
  };
  const sliders = y => {
    for (let i = 0; i < 3; i++) {
      const dy = 130 + i * 190, tilt = i % 2 ? 26 : -26;
      movers.push({ k: 'slide', cx: 500, cy: y + dy, half: 230, tilt, amp: 270, w: 0.9 + rng() * 0.6, a0: rng() * 6.28, t: 8, e: 0.45 });
    }
    return y + 720;
  };
  const bumpers = y => {
    const rows = 3;
    for (let r = 0; r < rows; r++) for (let c = 0; c < 3 + (r % 2); c++) {
      const x = (r % 2 ? 125 : 250) + c * 250;
      circ(x, y + 120 + r * 210, 44, 1.15, 'bumper');
    }
    return y + 120 + rows * 210;
  };
  const ramps = y => {
    for (let i = 0; i < 4; i++) {
      const dy = 100 + i * 190;
      if (i % 2) seg(WORLD_W, y + dy, 260, y + dy + 110); else seg(0, y + dy, WORLD_W - 260, y + dy + 110);
    }
    return y + 960;
  };

  // Entry funnel (mixes the pack), then shuffled sections, then the final chute.
  let y = 620;
  seg(0, y - 200, 340, y); seg(WORLD_W, y - 200, WORLD_W - 340, y);
  y += 60;
  // Big packs split up and produce fast leaders, so small fields get a shorter course.
  const height = Math.max(2400, target * AVG_DESCENT * (n <= 5 ? 0.68 : n <= 12 ? 0.76 : n <= 40 ? 0.9 : 1));
  const kinds = [pegs, spinners, ramps, bumpers, sliders];
  let bag = [];
  while (y < height) {
    if (!bag.length) { bag = kinds.slice(); for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; } }
    y = bag.pop()(y) + 40;
  }
  const chuteTop = y + 60, chuteEnd = chuteTop + 340;
  seg(0, chuteTop, 370, chuteEnd); seg(WORLD_W, chuteTop, WORLD_W - 370, chuteEnd);
  const finishY = chuteEnd + 220, floorY = finishY + 260;
  seg(370, chuteEnd, 370, floorY); seg(WORLD_W - 370, chuteEnd, WORLD_W - 370, floorY);
  seg(370, floorY, WORLD_W - 370, floorY, 8, 0.2);

  // Bucket statics and movers into vertical bands so each ball checks only what's near it.
  const bands = new Map();
  const add = (o, y0, y1) => { for (let b = Math.floor(y0 / BAND); b <= Math.floor(y1 / BAND); b++) { if (!bands.has(b)) bands.set(b, []); bands.get(b).push(o); } };
  const margin = 40;
  for (const o of statics) o.k === 's' ? add(o, Math.min(o.ay, o.by) - margin, Math.max(o.ay, o.by) + margin) : add(o, o.y - o.r - margin, o.y + o.r + margin);
  for (const m of movers) { const ext = m.k === 'rot' ? m.len : Math.abs(m.tilt); add(m, m.cy - ext - margin, m.cy + ext + margin); }
  return { statics, movers, bands, finishY, floorY, height: floorY + 40 };
}

export class RaceSim {
  constructor(n, seed, length = 'normal') {
    const rng = this.rng = makeRng(`race|${seed}`);
    this.n = n;
    this.target = LENGTHS[length] ?? LENGTHS.normal;
    this.course = buildCourse(rng, this.target, n);
    this.R = n <= 12 ? 20 : n <= 40 ? 16 : 13;
    this.t = 0;
    const cols = Math.max(1, Math.min(n, Math.floor(760 / (this.R * 2.6))));
    this.b = Array.from({ length: n }, (_, i) => ({
      x: 120 + (i % cols + 0.5) * (760 / cols) + (rng() - 0.5) * 6,
      y: 40 + Math.floor(i / cols) * this.R * 2.4 + (rng() - 0.5) * 6,
      vx: (rng() - 0.5) * 60, vy: 0, done: false, lastY: 0, still: 0,
    }));
    // Shuffle start spots so slot number says nothing about grid position.
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const a = this.b[i], c = this.b[j]; [a.x, c.x] = [c.x, a.x]; [a.y, c.y] = [c.y, a.y]; }
    this.first = -1;
    this.firstAt = 0;
    this.order = [];
    this.limit = this.target * 2.2;
    this.steps = 0;
  }

  moverSeg(m) {
    if (m.k === 'rot') {
      const a = m.a0 + m.w * this.t, c = Math.cos(a) * m.len, s = Math.sin(a) * m.len;
      return { ax: m.cx - c, ay: m.cy - s, bx: m.cx + c, by: m.cy + s };
    }
    const dx = Math.sin(m.a0 + m.w * this.t) * m.amp;
    return { ax: m.cx + dx - m.half, ay: m.cy - m.tilt, bx: m.cx + dx + m.half, by: m.cy + m.tilt };
  }

  collideSeg(b, s, t, e, vsx, vsy) {
    const R = this.R, abx = s.bx - s.ax, aby = s.by - s.ay;
    const u = Math.max(0, Math.min(1, ((b.x - s.ax) * abx + (b.y - s.ay) * aby) / (abx * abx + aby * aby)));
    const px = s.ax + abx * u, py = s.ay + aby * u, dx = b.x - px, dy = b.y - py, d2 = dx * dx + dy * dy, min = R + t;
    if (d2 >= min * min || d2 === 0) return;
    const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
    b.x = px + nx * min; b.y = py + ny * min;
    let sx = vsx, sy = vsy;
    if (typeof vsx === 'function') [sx, sy] = vsx(px, py);
    const rvx = b.vx - sx, rvy = b.vy - sy, vn = rvx * nx + rvy * ny;
    if (vn < 0) { b.vx -= (1 + e) * vn * nx; b.vy -= (1 + e) * vn * ny; }
  }

  step() {
    const { b, R, course } = this;
    this.t += DT;
    this.steps++;
    const segs = new Map();
    const segOf = m => { let s = segs.get(m); if (!s) { s = this.moverSeg(m); segs.set(m, s); } return s; };
    for (const p of b) {
      p.vy += GRAVITY * DT;
      p.vx *= 0.9995;
      const sp2 = p.vx * p.vx + p.vy * p.vy;
      if (sp2 > MAX_SPEED * MAX_SPEED) { const k = MAX_SPEED / Math.sqrt(sp2); p.vx *= k; p.vy *= k; }
      p.x += p.vx * DT; p.y += p.vy * DT;
      if (p.x < R) { p.x = R; p.vx = Math.abs(p.vx) * 0.6; }
      if (p.x > WORLD_W - R) { p.x = WORLD_W - R; p.vx = -Math.abs(p.vx) * 0.6; }
      const list = course.bands.get(Math.floor(p.y / BAND));
      if (list) for (const o of list) {
        if (o.k === 'c') {
          const dx = p.x - o.x, dy = p.y - o.y, min = R + o.r, d2 = dx * dx + dy * dy;
          if (d2 < min * min && d2 > 0) {
            const d = Math.sqrt(d2), nx = dx / d, ny = dy / d;
            p.x = o.x + nx * min; p.y = o.y + ny * min;
            const vn = p.vx * nx + p.vy * ny;
            if (vn < 0) { p.vx -= (1 + o.e) * vn * nx; p.vy -= (1 + o.e) * vn * ny; }
          }
        } else if (o.k === 's') {
          this.collideSeg(p, o, o.t, o.e, 0, 0);
        } else {
          const s = segOf(o);
          if (o.k === 'rot') this.collideSeg(p, s, o.t, o.e, (px, py) => [-o.w * (py - o.cy), o.w * (px - o.cx)]);
          else this.collideSeg(p, s, o.t, o.e, Math.cos(o.a0 + o.w * this.t) * o.amp * o.w, 0);
        }
      }
    }
    this.collideBalls();
    for (let i = 0; i < b.length; i++) {
      const p = b[i];
      if (!p.done && p.y >= course.finishY) {
        p.done = true;
        this.order.push(i);
        if (this.first < 0) { this.first = i; this.firstAt = this.t; }
      }
    }
    if (this.steps % 120 === 0) this.unstick();
    if (this.first < 0 && this.t >= this.limit) {   // hard stop: furthest ball takes it
      let best = 0;
      for (let i = 1; i < b.length; i++) if (b[i].y > b[best].y) best = i;
      this.first = best; this.firstAt = this.t;
    }
  }

  collideBalls() {
    const { b, R } = this, cell = R * 2.2, grid = new Map(), min = R * 2, min2 = min * min;
    for (let i = 0; i < b.length; i++) {
      const cx = Math.floor(b[i].x / cell), cy = Math.floor(b[i].y / cell);
      for (let gx = cx - 1; gx <= cx + 1; gx++) for (let gy = cy - 1; gy <= cy + 1; gy++) {
        const list = grid.get(gx * 100003 + gy);
        if (!list) continue;
        for (const j of list) {
          const p = b[i], q = b[j], dx = p.x - q.x, dy = p.y - q.y, d2 = dx * dx + dy * dy;
          if (d2 >= min2 || d2 === 0) continue;
          const d = Math.sqrt(d2), nx = dx / d, ny = dy / d, push = (min - d) / 2;
          p.x += nx * push; p.y += ny * push; q.x -= nx * push; q.y -= ny * push;
          const vn = (p.vx - q.vx) * nx + (p.vy - q.vy) * ny;
          if (vn < 0) { const im = -(1 + 0.6) * vn / 2; p.vx += im * nx; p.vy += im * ny; q.vx -= im * nx; q.vy -= im * ny; }
        }
      }
      const key = cx * 100003 + cy;
      if (!grid.has(key)) grid.set(key, []);
      grid.get(key).push(i);
    }
  }

  // A ball that hasn't dropped for 3s gets a seeded kick, so nothing can jam forever.
  unstick() {
    for (const p of this.b) {
      if (p.done) continue;
      if (Math.abs(p.y - p.lastY) < 8) p.still++; else p.still = 0;
      p.lastY = p.y;
      if (p.still >= 3) { p.vy = -320 - this.rng() * 220; p.vx = (this.rng() - 0.5) * 620; p.still = 0; }
    }
  }

  // Slots ordered by who's ahead: finishers in finish order, then lowest on the course.
  ranking() {
    const rest = [];
    for (let i = 0; i < this.b.length; i++) if (!this.b[i].done) rest.push(i);
    rest.sort((x, y) => this.b[y].y - this.b[x].y || x - y);
    return [...this.order, ...rest];
  }
}

// Pre-run a race to find the winning slot and when it finished.
export function preRunRace(n, seed, length) {
  const sim = new RaceSim(n, seed, length);
  while (sim.first < 0) sim.step();
  return { winSlot: sim.first, finishAt: sim.firstAt };
}
