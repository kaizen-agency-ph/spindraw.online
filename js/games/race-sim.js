// Ball Race simulation: fixed-step circle physics down an obstacle course. No DOM, so it
// can be pre-run to find the first finisher and tested in Node. Nothing steers any ball.
import { makeRng, LENGTHS } from './rng.js';

export const WORLD_W = 1000;
const DT = 1 / 120, GRAVITY = 1000, MAX_SPEED = 1300, BAND = 400;
// How fast the leaders get through each kind of section, measured in px/s. Sections differ a
// lot (ramps are slow, open spinner fields are fast), so the course is built to a time budget,
// not a height, which keeps every random course close to the chosen game length.
const PACE = {
  pegs: { grid: 273, diamond: 255, plinko: 478 },
  spinners: { pair: 781, trio: 605, quad: 513, giant: 401 },
  ramps: 82, sliders: 312, splitter: 412, pads: 337,
  bumpers: { rows: 400, triangle: 553, scatter: 474 },
  windmills: { 2: 530, 3: 332 },
};
const paceOf = (kind, variant) => { const p = PACE[kind]; return typeof p === 'number' ? p : p[variant] ?? p[String(variant)[0]]; };
const PACE_SCALE = 1.2;                 // tuned so median finishes match the length settings

// Every draw builds its own course from its seed: the sections come in a shuffled order and
// each one picks its own layout, size and speed, sometimes mirrored. All gaps stay wider than
// the biggest ball (radius 20), so nothing can trap the field.
export const SECTION_KINDS = ['pegs', 'spinners', 'ramps', 'bumpers', 'sliders', 'splitter', 'windmills', 'pads'];
export const COURSE_PALETTES = 4;

function buildCourse(rng, target, n) {
  const statics = [], movers = [], sections = [];
  const pick = list => list[Math.floor(rng() * list.length)];
  const between = (a, b) => a + rng() * (b - a);
  let flip = false;
  const X = x => (flip ? WORLD_W - x : x);
  const seg = (ax, ay, bx, by, t = 7, e = 0.5, kind) => statics.push({ k: 's', ax: X(ax), ay, bx: X(bx), by, t, e, kind });
  const circ = (x, y, r, e = 0.6, kind = 'peg') => statics.push({ k: 'c', x: X(x), y, r, e, kind });
  const rot = (cx, cy, len, w, t = 8) => movers.push({ k: 'rot', cx: X(cx), cy, len, w: flip ? -w : w, a0: rng() * 6.28, t, e: 0.55 });

  const SECTIONS = {
    pegs(y) {
      const variant = pick(['grid', 'diamond', 'plinko']), gap = Math.round(between(92, 118)), r = Math.round(between(8, 12));
      if (variant === 'plinko') {
        const rows = 6 + Math.floor(rng() * 2);
        for (let row = 0; row < rows; row++) {
          const count = row + 3, w = (count - 1) * gap;
          for (let c = 0; c < count; c++) { const x = 500 - w / 2 + c * gap; if (x > 30 && x < WORLD_W - 30) circ(x, y + 80 + row * gap, r); }
        }
        return [variant, y + 120 + rows * gap];
      }
      const rows = 5 + Math.floor(rng() * 3);
      for (let row = 0; row < rows; row++) {
        const off = variant === 'diamond' ? (row % 2 ? gap / 2 : 0) + ((row >> 1) % 2 ? gap / 4 : 0) : row % 2 ? gap / 2 : 0;
        for (let x = 50 + off; x < WORLD_W - 30; x += gap) if (variant !== 'diamond' || rng() > 0.12) circ(x, y + 80 + row * gap, r);
      }
      return [variant, y + 120 + rows * gap];
    },
    spinners(y) {
      const variant = pick(['pair', 'trio', 'quad', 'giant']), dir = rng() < 0.5 ? 1 : -1, sp = () => dir * (1.4 + rng() * 0.9);
      if (variant === 'pair') { rot(300, y + 200, 160, sp()); rot(700, y + 420, 160, -sp()); return [variant, y + 640]; }
      if (variant === 'quad') { for (const [cx, dy, k] of [[260, 180, 1], [740, 180, -1], [260, 500, -1], [740, 500, 1]]) rot(cx, y + dy, 140, k * sp()); return [variant, y + 720]; }
      if (variant === 'giant') { rot(500, y + 260, 250, sp(), 9); return [variant, y + 560]; }
      for (const [cx, dy, k] of [[260, 200, 1], [740, 200, -1], [500, 520, 1]]) rot(cx, y + dy, 150 + rng() * 30, k * sp());
      return [variant, y + 760];
    },
    ramps(y) {
      const count = 3 + Math.floor(rng() * 3), open = Math.round(between(210, 300)), drop = Math.round(between(90, 140)), step = drop + 80;
      for (let i = 0; i < count; i++) {
        const dy = 100 + i * step;
        if (i % 2) seg(WORLD_W, y + dy, open, y + dy + drop); else seg(0, y + dy, WORLD_W - open, y + dy + drop);
      }
      return [`${count} ramps`, y + 100 + count * step + 60];
    },
    bumpers(y) {
      const variant = pick(['rows', 'triangle', 'scatter']), r = Math.round(between(36, 48));
      if (variant === 'triangle') {
        for (let row = 0; row < 3; row++) for (let c = 0; c <= row; c++) circ(500 + (c - row / 2) * 230, y + 120 + row * 200, r, 1.15, 'bumper');
        return [variant, y + 560];
      }
      if (variant === 'scatter') {
        const spots = [];
        for (let tries = 0; spots.length < 7 && tries < 200; tries++) {
          const x = between(110, WORLD_W - 110), dy = between(110, 560);
          if (spots.every(([sx, sy]) => Math.hypot(sx - x, sy - dy) > r * 2 + 110)) spots.push([x, dy]);
        }
        for (const [x, dy] of spots) circ(x, y + dy, r, 1.15, 'bumper');
        return [variant, y + 680];
      }
      for (let row = 0; row < 3; row++) for (let c = 0; c < 3 + (row % 2); c++) circ((row % 2 ? 125 : 250) + c * 250, y + 120 + row * 210, r, 1.15, 'bumper');
      return [variant, y + 750];
    },
    sliders(y) {
      const count = 2 + Math.floor(rng() * 3), tilt = Math.round(between(12, 32));
      for (let i = 0; i < count; i++) {
        movers.push({ k: 'slide', cx: 500, cy: y + 130 + i * 190, half: Math.round(between(170, 240)), tilt: i % 2 ? tilt : -tilt, amp: Math.round(between(200, 280)), w: 0.9 + rng() * 0.6, a0: rng() * 6.28, t: 8, e: 0.45 });
      }
      return [`${count} gates`, y + 130 + count * 190 + 20];
    },
    // A wedge splits the pack into two chutes, which open out again underneath.
    splitter(y) {
      const open = Math.round(between(115, 160)), side = 200, depth = 200;
      seg(0, y + 60, side, y + 60 + depth);
      seg(WORLD_W, y + 60, WORLD_W - side, y + 60 + depth);
      seg(500, y + 40, side + open, y + 60 + depth);
      seg(500, y + 40, WORLD_W - side - open, y + 60 + depth);
      return ['wedge', y + 60 + depth + 160];
    },
    windmills(y) {
      const rows = 2 + Math.floor(rng() * 2), cols = 3 + Math.floor(rng() * 2), len = Math.round(between(58, 78)), colW = WORLD_W / cols;
      for (let row = 0; row < rows; row++) for (let c = 0; c < cols; c++) rot(colW * (c + 0.5) + (row % 2 ? colW / 4 : -colW / 4), y + 140 + row * 220, len, (rng() < 0.5 ? 1 : -1) * (1.8 + rng() * 1.4), 7);
      return [`${rows}x${cols}`, y + 140 + rows * 220];
    },
    // Short springy pads that kick balls sideways.
    pads(y) {
      const rows = 3 + Math.floor(rng() * 2), len = 120;
      for (let row = 0; row < rows; row++) for (let c = 0; c < 3; c++) {
        const cx = (row % 2 ? 330 : 170) + c * 330, a = (c + row) % 2 ? 0.42 : -0.42;
        if (cx > WORLD_W - 60) continue;
        seg(cx - Math.cos(a) * len / 2, y + 120 + row * 190 - Math.sin(a) * len / 2, cx + Math.cos(a) * len / 2, y + 120 + row * 190 + Math.sin(a) * len / 2, 9, 1.1, 'pad');
      }
      return [`${rows} rows`, y + 120 + rows * 190 + 40];
    },
  };

  // Entry funnel (mixes the pack). Its opening and angle vary.
  const lip = Math.round(between(310, 380)), fall = Math.round(between(170, 240));
  let y = 620;
  seg(0, y - fall, lip, y); seg(WORLD_W, y - fall, WORLD_W - lip, y);
  y += 60;
  // Big packs split up and produce fast leaders, so small fields get a shorter course.
  const budget = target * PACE_SCALE * (n <= 5 ? 0.62 : n <= 12 ? 0.76 : n <= 40 ? 0.9 : 1);
  let bag = [], spent = 0;
  while (spent < budget || sections.length < 3) {
    if (!bag.length) { bag = SECTION_KINDS.slice(); for (let i = bag.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]]; } }
    const kind = bag.pop();
    flip = rng() < 0.5;
    const [variant, next] = SECTIONS[kind](y);
    sections.push({ kind, variant, flip, y });
    spent += (next + 40 - y) / paceOf(kind, variant);
    flip = false;
    y = next + 40;
  }
  const chuteL = Math.round(between(345, 395) / 20) * 20, chuteR = WORLD_W - chuteL;
  const chuteTop = y + 60, chuteEnd = chuteTop + 340;
  seg(0, chuteTop, chuteL, chuteEnd); seg(WORLD_W, chuteTop, chuteR, chuteEnd);
  const finishY = chuteEnd + 220, floorY = finishY + 900;   // deep enough that a pile never reaches the line
  seg(chuteL, chuteEnd, chuteL, floorY); seg(chuteR, chuteEnd, chuteR, floorY);
  seg(chuteL, floorY, chuteR, floorY, 8, 0.2);
  const palette = Math.floor(rng() * COURSE_PALETTES);

  // Bucket statics and movers into vertical bands so each ball checks only what's near it.
  const bands = new Map();
  const add = (o, y0, y1) => { for (let b = Math.floor(y0 / BAND); b <= Math.floor(y1 / BAND); b++) { if (!bands.has(b)) bands.set(b, []); bands.get(b).push(o); } };
  const margin = 40;
  for (const o of statics) o.k === 's' ? add(o, Math.min(o.ay, o.by) - margin, Math.max(o.ay, o.by) + margin) : add(o, o.y - o.r - margin, o.y + o.r + margin);
  for (const m of movers) { const ext = m.k === 'rot' ? m.len : Math.abs(m.tilt); add(m, m.cy - ext - margin, m.cy + ext + margin); }
  return { statics, movers, bands, finishY, floorY, height: floorY + 40, sections, chuteL, chuteR, palette };
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
  }

  // Have enough balls finished? The time limit means a run always ends: whoever is
  // furthest down the course at that point fills the remaining places.
  decided(count) { return this.order.length >= Math.min(count, this.n) || this.t >= this.limit; }

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

// Pre-run a race to find the winning slots, in finishing order, and when the last one crossed.
export function preRunRace(n, seed, length, count = 1) {
  const sim = new RaceSim(n, seed, length);
  while (!sim.decided(count)) sim.step();
  return { winSlots: sim.ranking().slice(0, Math.min(count, n)), finishAt: sim.t };
}
