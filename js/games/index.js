// Ball Race and Pixel Battle views. Both replay a pre-run simulation in real time, with the
// fair winner's name on the slot that came out on top. Nothing is steered during playback.
import { makeRng, assignSlots, MAX_PLAYERS, MAX_WINNERS, LENGTHS } from './rng.js';
import { RaceSim, preRunRace, WORLD_W } from './race-sim.js';
import { BattleSim, preRunBattle, BATTLE_DT, DODGE_TIME } from './battle-sim.js';
import { HorseSim, preRunHorse } from './horse-sim.js';
import { framesFor, paintArena, horseFrames } from './sprites.js';

export { MAX_PLAYERS, MAX_WINNERS, LENGTHS };

const BALL_COLORS = ['#ffd23f', '#ff5d73', '#2ec4b6', '#3a86ff', '#ff9f1c'];
const FOOT = { race: 'The locked draw decides. The race reveals it.', battle: 'The locked draw decides. The battle reveals it.' };
const COUNT_STEP = 0.8, GO_SECS = 0.95, SCENE_SECS = 3.4;
const STAGE = {
  race: { go: 'LET’S ROLL!', color: '#ffd23f' },
  horse: { go: 'AND THEY’RE OFF!', color: '#ffe9a0' },
  battle: { go: 'LET’S BATTLE!', color: '#ff5d73' },
};
const ordinal = n => { const t = n % 100; return n + (t > 10 && t < 14 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'); };

function plate(g, x, y, w, h, r, fill = 'rgba(15,16,19,.86)') {
  g.fillStyle = fill;
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  g.fill();
}

function ink(hex) {
  const n = parseInt(hex.slice(1), 16), l = 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
  return l > 150 ? '#14151a' : '#fdfcf7';
}

const initials = name => { const p = String(name).trim().split(/\s+/); return (p.length > 1 ? p[0][0] + p[p.length - 1][0] : String(name).slice(0, 2)).toUpperCase(); };

function fit(g, text, max) {
  if (g.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 1 && g.measureText(`${t}…`).width > max) t = t.slice(0, -1);
  return `${t}…`;
}

class View {
  constructor(canvas, theme) {
    this.canvas = canvas;
    this.g = canvas.getContext('2d');
    this.theme = theme;
    this.pool = [];
    this.sim = null;
    this.slots = [];
    this.playing = false;
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(canvas.parentElement);
    this.resize();
  }
  resize() {
    const r = this.canvas.parentElement.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
    if (w !== this.canvas.width || h !== this.canvas.height) { this.canvas.width = w; this.canvas.height = h; }
    this.px = this.canvas.width / Math.max(r.width, 1);
    if (!this.playing) this.paint();
  }
  // Whatever should be on screen when nothing is playing.
  paint() { if (this.scene) this.drawScene((performance.now() - this.scene.t0) / 1000); else this.draw(); }
  destroy() { this.ro.disconnect(); this.dead = true; }
  setTheme(theme) { this.theme = theme; if (!this.playing) this.paint(); }
  name(slot) { return this.pool[this.slots[slot]]?.name ?? ''; }

  // Advance the sim from the clock. A timer also ends the run, because rAF pauses in
  // background tabs and a host switching tabs must not leave the draw unrecorded.
  run(duration, onFrame) {
    this.playing = true;
    return new Promise(resolve => {
      const t0 = performance.now();
      let done = false, last = t0;
      const finish = () => {
        if (done) return;
        done = true;
        this.playing = false;
        if (!this.dead) onFrame(duration, 1);
        resolve();
      };
      const frame = now => {
        if (done || this.dead) return;
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        const t = (now - t0) / 1000;
        if (t >= duration) return finish();
        onFrame(t, dt);
        if (this.goText && t < GO_SECS) this.bigText(this.goText, t / GO_SECS, STAGE[this.mode].color, true);
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
      setTimeout(finish, (duration + 0.2) * 1000);
    });
  }

  // 3, 2, 1 over the waiting field, so everyone can find their name. Then the start word
  // rides over the first moments of the game itself.
  async countdown(sound) {
    this.goText = null;
    let shown = 0;
    await this.run(COUNT_STEP * 3, (time, dt) => {
      // A frame's timestamp can fall just before the start, which would briefly show a 4.
      const t = Math.max(0, time), left = Math.max(1, 3 - Math.floor(t / COUNT_STEP));
      if (left !== shown) { shown = left; sound?.beep?.(false); }
      this.drawField(Math.min(dt, 0.1));
      this.bigText(String(left), (t % COUNT_STEP) / COUNT_STEP, STAGE[this.mode].color, false);
    });
    if (this.dead) return;
    sound?.beep?.(true);
    sound?.startMusic?.(this.mode);
    this.goText = STAGE[this.mode].go;
  }

  bigText(text, u, color, fades) {
    const { g, canvas: c } = this, m = Math.min(c.width, c.height);
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = `rgba(13,14,18,${fades ? 0.34 * (1 - u) : 0.38})`;
    g.fillRect(0, 0, c.width, c.height);
    const pop = 1 + 0.55 * Math.max(0, 1 - u / 0.22) ** 2;
    let size = text.length > 1 ? m * 0.15 : m * 0.42;
    g.font = `800 ${size}px 'Geist', system-ui, sans-serif`;
    const w = g.measureText(text).width;
    if (w > c.width * 0.86) { size *= c.width * 0.86 / w; g.font = `800 ${size}px 'Geist', system-ui, sans-serif`; }
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.translate(c.width / 2, c.height / 2);
    g.scale(pop, pop);
    g.globalAlpha = Math.min(1, (fades ? 2.4 : 7) * (1 - u));
    g.lineJoin = 'round';
    g.lineWidth = size * 0.09;
    g.strokeStyle = '#0d0e12';
    g.strokeText(text, 0, 0);
    g.fillStyle = color;
    g.fillText(text, 0, 0);
    g.restore();
  }

  // The themed winner's scene. It plays out before the winner card, then keeps moving behind it
  // until the board changes.
  async celebrate(sound, winSlots) {
    const c = this.canvas;
    sound?.stopMusic?.();
    sound?.fanfare?.(this.mode);
    this.goText = null;
    const snap = document.createElement('canvas');
    snap.width = c.width; snap.height = c.height;
    snap.getContext('2d').drawImage(c, 0, 0);
    this.scene = { t0: performance.now(), snap, slots: winSlots };
    const scene = this.scene;
    await this.run(SCENE_SECS, t => this.drawScene(t));
    const loop = () => {
      if (this.dead || this.scene !== scene || this.playing) return;
      this.drawScene((performance.now() - scene.t0) / 1000);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  drawScene(t) {
    const { g, canvas: c, scene } = this;
    if (!scene) return;
    const m = Math.min(c.width, c.height);
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalAlpha = 1;
    g.imageSmoothingEnabled = false;
    g.drawImage(scene.snap, 0, 0, c.width, c.height);
    g.fillStyle = `rgba(13,14,18,${Math.min(0.88, t * 3)})`;
    g.fillRect(0, 0, c.width, c.height);
    const appear = Math.min(1, t / 0.3);
    g.globalAlpha = appear;
    this.sceneBack(t);
    g.globalAlpha = 1;

    const slots = scene.slots, shown = slots.slice(0, 5), extra = slots.length - shown.length;
    const colW = c.width / shown.length, size = Math.min(colW * 0.62, c.height * (shown.length > 1 ? 0.27 : 0.3));
    const baseY = c.height * 0.67, nameF = Math.max(11 * this.px, Math.min(colW * 0.105, m * (shown.length > 1 ? 0.05 : 0.075)));
    shown.forEach((slot, i) => {
      const drop = Math.max(0, 1 - (t - i * 0.08) / 0.32);
      const x = colW * (i + 0.5), y = baseY - drop * drop * c.height * 0.7;
      this.sceneActor(slot, x, y, size, t + i * 0.27, i);
      const label = (slots.length > 1 ? `${ordinal(i + 1)} · ` : '') + this.name(slot);
      g.font = `700 ${nameF}px 'Geist', system-ui, sans-serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      const text = fit(g, label, colW * 0.92), w = g.measureText(text).width + nameF;
      const ny = baseY + nameF * 1.1;
      plate(g, x - w / 2, ny - nameF * 0.8, w, nameF * 1.6, nameF * 0.3, '#ffd23f');
      g.fillStyle = '#14151a';
      g.fillText(text, x, ny + nameF * 0.04);
      const note = this.sceneNote?.(slot);
      if (note) {
        g.font = `600 ${nameF * 0.62}px 'Geist Mono', monospace`;
        g.fillStyle = '#f4f4f5';
        g.fillText(note, x, ny + nameF * 1.5);
      }
    });
    if (extra > 0) {
      g.font = `600 ${nameF * 0.8}px 'Geist', system-ui, sans-serif`;
      g.fillStyle = '#f4f4f5';
      g.textAlign = 'center';
      g.fillText(`and ${extra} more`, c.width / 2, baseY + nameF * 3.1);
    }
    const title = this.sceneTitle(slots.length), pop = 1 + 0.4 * Math.max(0, 1 - t / 0.25) ** 2;
    let tf = m * 0.085;
    g.font = `800 ${tf}px 'Geist', system-ui, sans-serif`;
    const tw = g.measureText(title).width;
    if (tw > c.width * 0.9) { tf *= c.width * 0.9 / tw; g.font = `800 ${tf}px 'Geist', system-ui, sans-serif`; }
    g.save();
    g.translate(c.width / 2, c.height * 0.17);
    g.scale(pop, pop);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineJoin = 'round'; g.lineWidth = tf * 0.14; g.strokeStyle = '#0d0e12';
    g.strokeText(title, 0, 0);
    g.fillStyle = STAGE[this.mode].color;
    g.fillText(title, 0, 0);
    g.restore();
    this.footer(this.mode === 'battle' ? FOOT.battle : FOOT.race);
  }

  // Who's-winning board shared by the two races. `left` > 0 gives it its own column.
  board(rank, left, progress, ready) {
    const { g, canvas: c, sim } = this;
    const f = Math.max(11, Math.min(c.width, c.height * 1.6) * 0.017), m = f * 0.8, rowH = f * 1.75;
    const w = left ? c.width - left - m * 2 : Math.max(c.width * 0.3, f * 13), x = c.width - w - m, y = m;
    g.textAlign = 'left'; g.textBaseline = 'middle';
    if (!this.live) {
      plate(g, x, y, w, f * 2.2, f * 0.6);
      g.font = `600 ${f * 0.9}px 'Geist', system-ui, sans-serif`;
      g.fillStyle = '#f4f4f5';
      g.fillText(ready, x + f * 0.8, y + f * 1.12);
      return;
    }
    const count = this.count ?? 1, done = sim.order.length, maxRows = left ? Math.floor((c.height - f * 5) / rowH) : 8;
    const rows = Math.min(sim.n, Math.max(5, Math.min(count, maxRows))), h = rowH * rows + f * 2.3;
    plate(g, x, y, w, h, f * 0.7);
    g.font = `600 ${f * 0.72}px 'Geist Mono', monospace`;
    g.fillStyle = '#a1a1aa';
    g.fillText(!done ? 'WHO’S WINNING' : count > 1 ? `${Math.min(done, count)} OF ${count} ACROSS` : 'FINISHED', x + f * 0.8, y + f * 1.05);
    rank.slice(0, rows).forEach((slot, i) => {
      const ry = y + f * 2.1 + i * rowH + rowH / 2 - f * 0.25, gold = i < count && (i === 0 || i < done);
      g.font = `600 ${f * 0.85}px 'Geist Mono', monospace`;
      g.fillStyle = gold ? '#ffd23f' : '#a1a1aa';
      g.fillText(String(i + 1), x + f * 0.8, ry);
      g.font = `600 ${f}px 'Geist', system-ui, sans-serif`;
      g.fillStyle = gold ? '#ffd23f' : '#f4f4f5';
      g.fillText(fit(g, this.name(slot), w - f * 3.2), x + f * 2.3, ry);
    });
    plate(g, x + f * 0.8, y + h - f * 0.55, w - f * 1.6, f * 0.22, f * 0.1, '#2a2e37');
    plate(g, x + f * 0.8, y + h - f * 0.55, Math.max(f * 0.3, (w - f * 1.6) * progress), f * 0.22, f * 0.1, '#ffd23f');
  }

  footer(text) {
    const { g, canvas: c } = this, f = Math.max(11, c.width * 0.0125);
    g.font = `500 ${f}px 'Geist', system-ui, sans-serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const w = g.measureText(text).width + f * 1.6;
    plate(g, (c.width - w) / 2, c.height - f * 2.4, w, f * 1.9, f * 0.5, 'rgba(15,16,19,.72)');
    g.fillStyle = '#d4d4d8';
    g.fillText(text, c.width / 2, c.height - f * 1.45);
  }
}

// ---------- Ball Race ----------
class RaceView extends View {
  setEntries(pool) {
    this.pool = pool;
    this.sim = pool.length ? new RaceSim(pool.length, 'idle', 'quick') : null;
    this.slots = pool.map((_, i) => i);
    this.cam = 0;
    this.live = false;
    this.scene = null;
    if (!this.playing) this.draw();
  }

  async play({ seed, winnerIdxs, length, onLeader, sound }) {
    const n = this.pool.length, pre = preRunRace(n, seed, length, winnerIdxs.length);
    this.sim = new RaceSim(n, seed, length);
    this.slots = assignSlots(n, winnerIdxs, pre.winSlots, makeRng(`${seed}|slots`));
    this.count = winnerIdxs.length;
    this.cam = 0;
    this.live = true;
    this.scene = null;
    await this.countdown(sound);
    if (this.dead) return;
    let lead = -1, leadTick = 0;
    await this.run(pre.finishAt + 1.4, (t, dt) => {
      while (this.sim.t < t) this.sim.step();
      const rank = this.sim.ranking();
      if (this.sim.t - leadTick > 0.25 && rank[0] !== lead) { lead = rank[0]; leadTick = this.sim.t; onLeader?.(this.name(lead)); sound?.tick(); }
      if (this.sim.b[rank[0]].y / this.sim.course.finishY > 0.75) sound?.tension?.();
      this.draw(dt, rank);
    });
    if (!this.dead) await this.celebrate(sound, pre.winSlots);
  }

  drawField(dt) { this.draw(dt, this.sim.ranking()); }

  sceneTitle(n) { return n > 1 ? `FIRST ${n} ACROSS THE LINE!` : 'FIRST ACROSS THE LINE!'; }

  sceneBack(t) {
    const { g, canvas: c } = this, sq = Math.max(8, Math.min(c.width, c.height) * 0.035), shift = (t * 90 * this.px) % (sq * 2);
    const colors = this.theme?.colors?.length ? this.theme.colors : BALL_COLORS;
    for (let i = 0; i < 26; i++) {                  // balls raining and bouncing off the floor
      const r = sq * (0.3 + (i % 3) * 0.14), x = (i + 0.5) / 26 * c.width;
      const period = 0.8 + (i % 5) * 0.14, u = ((t + i * 0.19) % period) / period;
      const y = c.height - sq * 2 - r - Math.abs(Math.sin(u * Math.PI)) * c.height * (0.28 + (i % 4) * 0.08);
      g.fillStyle = colors[i % colors.length];
      g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
    }
    for (const y of [0, c.height - sq * 2]) for (let row = 0; row < 2; row++) for (let x = -sq * 2; x < c.width + sq * 2; x += sq) {
      const k = Math.round((x + sq * 2) / sq) + row;
      g.fillStyle = k % 2 ? '#f4f4f5' : '#14151a';
      g.fillRect(x + shift, y + row * sq, sq + 1, sq + 1);
    }
  }

  sceneActor(slot, x, y, size, t) {
    const { g } = this, r = size / 2, colors = this.theme?.colors?.length ? this.theme.colors : BALL_COLORS;
    const hop = Math.abs(Math.sin(t * 5)), lift = hop * size * 0.34, squash = 1 + (1 - Math.min(1, hop * 4)) * 0.16;
    const col = colors[this.slots[slot] % colors.length];
    g.fillStyle = 'rgba(0,0,0,.4)';
    g.beginPath(); g.ellipse(x, y, r * (1 - hop * 0.3), r * 0.16, 0, 0, 6.2832); g.fill();
    g.save();
    g.translate(x, y - r * (2 - squash) * 1 - lift);
    g.scale(squash, 2 - squash);
    g.beginPath(); g.arc(0, 0, r, 0, 6.2832);
    g.fillStyle = col; g.fill();
    g.lineWidth = r * 0.12; g.strokeStyle = '#ffd23f'; g.stroke();
    g.font = `800 ${r * 0.72}px 'Geist', system-ui, sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = ink(col);
    g.fillText(initials(this.name(slot)), 0, r * 0.03);
    g.restore();
  }

  draw(dt = 1, rank) {
    const { g, canvas: c, sim } = this;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = '#0d0e12';
    g.fillRect(0, 0, c.width, c.height);
    if (!sim) return this.empty('Add names to race');
    rank ??= sim.ranking();
    const wide = c.width / c.height > 1.2;
    const s = Math.min((wide ? c.width * 0.74 : c.width) / WORLD_W, c.height / 760);
    const ox = wide ? 0 : (c.width - WORLD_W * s) / 2, viewH = c.height / s;
    // Follow the leader down; once someone finishes, hold on the line for the next ones.
    const leaderY = sim.order.length ? sim.course.finishY + viewH * 0.1 : sim.b[rank[0]].y;
    const want = Math.max(0, Math.min(sim.course.height - viewH, leaderY - viewH * 0.48));
    this.cam += (want - this.cam) * Math.min(1, 1 - Math.exp(-dt * 6));
    const cam = this.cam, top = cam - 60, bot = cam + viewH + 60;

    g.save();
    g.translate(ox, -cam * s);
    g.scale(s, s);
    g.fillStyle = '#171a21';
    g.fillRect(0, cam - 10, WORLD_W, viewH + 20);
    // subtle depth markers so motion reads even in empty stretches
    g.fillStyle = '#1d2129';
    for (let y = Math.floor(cam / 120) * 120; y < bot; y += 120) g.fillRect(0, y, WORLD_W, 2);

    g.lineCap = 'round';
    for (const o of sim.course.statics) {
      if (o.k === 'c') {
        if (o.y + o.r < top || o.y - o.r > bot) continue;
        g.beginPath(); g.arc(o.x, o.y, o.r, 0, 6.2832);
        if (o.kind === 'bumper') { g.fillStyle = '#ff5d73'; g.fill(); g.lineWidth = 6; g.strokeStyle = '#ffd23f'; g.stroke(); }
        else { g.fillStyle = '#6b7385'; g.fill(); }
      } else {
        if (Math.max(o.ay, o.by) < top || Math.min(o.ay, o.by) > bot) continue;
        g.beginPath(); g.moveTo(o.ax, o.ay); g.lineTo(o.bx, o.by); g.lineWidth = o.t * 2; g.strokeStyle = '#4a5162'; g.stroke();
      }
    }
    for (const m of sim.course.movers) {
      if (m.cy < top - 200 || m.cy > bot + 200) continue;
      const q = sim.moverSeg(m);
      g.beginPath(); g.moveTo(q.ax, q.ay); g.lineTo(q.bx, q.by); g.lineWidth = m.t * 2; g.strokeStyle = m.k === 'rot' ? '#2ec4b6' : '#3a86ff'; g.stroke();
      if (m.k === 'rot') { g.beginPath(); g.arc(m.cx, m.cy, 11, 0, 6.2832); g.fillStyle = '#e8e4d8'; g.fill(); }
    }
    // checkered finish
    const fy = sim.course.finishY;
    if (fy > top && fy < bot + 40) for (let i = 0; i < 2; i++) for (let x = 370; x < WORLD_W - 370; x += 20) {
      g.fillStyle = ((x - 370) / 20 + i) % 2 ? '#0f1013' : '#f4f4f5';
      g.fillRect(x, fy - 20 + i * 20, 20, 20);
    }

    const colors = this.theme?.colors?.length ? this.theme.colors : BALL_COLORS;
    const R = sim.R;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    for (let i = sim.n - 1; i >= 0; i--) {
      const p = sim.b[i];
      if (p.y < top || p.y > bot) continue;
      const col = colors[this.slots[i] % colors.length];
      g.beginPath(); g.arc(p.x, p.y, R, 0, 6.2832);
      g.fillStyle = col; g.fill();
      const leads = this.live && i === rank[0];
      g.lineWidth = leads ? 5 : 2.5;
      g.strokeStyle = leads ? '#ffffff' : '#0f1013';
      g.stroke();
      g.font = `700 ${R * 0.92}px 'Geist', system-ui, sans-serif`;
      g.fillStyle = ink(col);
      g.fillText(initials(this.name(i)), p.x, p.y + 1);
    }
    // Every ball keeps a name; labels shrink when it's crowded, and the leaders' go on top.
    const crowd = sim.n > 50 ? 0.66 : sim.n > 24 ? 0.8 : 1, nameF = Math.max(8.5 * this.px / s, Math.max(20, 15 / s) * crowd), nameH = nameF * 1.4;
    g.font = `600 ${nameF}px 'Geist', system-ui, sans-serif`;
    for (const i of rank.slice().reverse()) {
      const p = sim.b[i];
      if (p.y < top || p.y > bot) continue;
      const label = fit(g, this.name(i), nameF * 12), w = g.measureText(label).width + nameF * 0.8;
      const lx = Math.max(w / 2 + 4, Math.min(WORLD_W - w / 2 - 4, p.x));   // keep labels on the course
      plate(g, lx - w / 2, p.y - R - nameH - 4, w, nameH, nameF * 0.3);
      g.fillStyle = this.live && i === rank[0] ? '#ffd23f' : '#f4f4f5';
      g.fillText(label, lx, p.y - R - nameH / 2 - 3);
    }
    g.restore();

    this.board(rank, wide ? WORLD_W * s : 0, Math.min(1, sim.b[rank[0]].y / sim.course.finishY), `${sim.n} ball${sim.n === 1 ? '' : 's'} ready`);
    this.footer(FOOT.race);
  }

  empty(text) {
    const { g, canvas: c } = this;
    g.fillStyle = '#a1a1aa';
    g.font = `600 ${c.width * 0.025}px 'Geist', system-ui, sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(text, c.width / 2, c.height / 2);
  }
}

// ---------- Pixel Battle ----------
class BattleView extends View {
  setEntries(pool) {
    this.pool = pool;
    this.sim = pool.length ? new BattleSim(pool.length, 'idle', 'quick') : null;
    this.slots = pool.map((_, i) => i);
    this.arena = this.sim ? paintArena(this.sim.W, this.sim.H, makeRng(`arena|${this.sim.W}`)) : null;
    this.zoom = 1; this.fx = 0; this.fy = 0;
    this.live = false;
    this.scene = null;
    if (!this.playing) this.draw();
  }

  async play({ seed, winnerIdxs, length, onLeader, sound }) {
    const n = this.pool.length, count = winnerIdxs.length, pre = preRunBattle(n, seed, length, count);
    this.sim = new BattleSim(n, seed, length, count);
    this.slots = assignSlots(n, winnerIdxs, pre.winSlots, makeRng(`${seed}|slots`));
    this.arena = paintArena(this.sim.W, this.sim.H, makeRng(`arena|${seed}`));
    this.zoom = 1; this.fx = 0; this.fy = 0;
    this.live = true;
    let seen = 0, alive = n;
    onLeader?.(`${n} fighters`);
    this.scene = null;
    await this.countdown(sound);
    if (this.dead) return;
    await this.run(pre.finishAt + 1.8, (t, dt) => {
      while (this.sim.t < t && !this.sim.winners) this.sim.step();
      if (this.sim.alive !== alive) { alive = this.sim.alive; onLeader?.(this.sim.winners ? this.sim.winners.map(w => this.name(w)).join(', ') : `${alive} left standing`); }
      if ((alive <= count + 2 && alive < n) || this.sim.t > this.sim.target * 0.75) sound?.tension?.();
      const ev = this.sim.events;
      for (; seen < ev.length; seen++) if (ev[seen].type === 'ko' || ev[seen].type === 'zone') sound?.tick();
      if (seen > ev.length) seen = ev.length;
      this.draw(dt, t);
    });
    if (!this.dead) await this.celebrate(sound, pre.winSlots);
  }

  drawField(dt) { this.draw(dt); }

  sceneTitle(n) { return n > 1 ? `LAST ${n} STANDING!` : 'LAST ONE STANDING!'; }

  sceneNote(slot) { const k = this.sim.f[slot].kills; return `${k} KO${k === 1 ? '' : 's'}`; }

  sceneBack(t) {
    const { g, canvas: c } = this, cx = c.width / 2, cy = c.height * 0.5, R = Math.hypot(c.width, c.height);
    for (let i = 0; i < 14; i++) {                 // a slow sunburst behind the champion
      const a = t * 0.35 + i * Math.PI / 7;
      g.fillStyle = i % 2 ? 'rgba(255,93,115,.14)' : 'rgba(255,210,63,.13)';
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); g.lineTo(cx + Math.cos(a + 0.22) * R, cy + Math.sin(a + 0.22) * R); g.fill();
    }
    const px = Math.max(3, Math.min(c.width, c.height) * 0.012);
    for (let b = 0; b < 5; b++) {                  // pixel sparks bursting around the arena
      const period = 1.5 + b * 0.17, u = ((t + b * 0.43) % period) / period;
      const bx = c.width * (0.12 + ((b * 0.37) % 1) * 0.76), by = c.height * (0.2 + ((b * 0.61) % 1) * 0.5);
      g.globalAlpha = Math.max(0, 1 - u);
      g.fillStyle = ['#ffd23f', '#ff5d73', '#7dd3fc', '#4ade80', '#f4f4f5'][b];
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6 + b, d = u * Math.min(c.width, c.height) * 0.2;
        g.fillRect(Math.round((bx + Math.cos(a) * d) / px) * px, Math.round((by + Math.sin(a) * d + u * u * px * 6) / px) * px, px, px);
      }
    }
    g.globalAlpha = 1;
  }

  sceneActor(slot, x, y, size, t, place) {
    const { g } = this, fr = framesFor(this.name(slot)), s = size / 16, swing = Math.floor(t * 2.5) % 2 === 0;
    const hop = Math.abs(Math.sin(t * 5)) * size * 0.08, px = s;
    g.fillStyle = 'rgba(0,0,0,.4)';
    g.fillRect(x - size * 0.34, y - px, size * 0.68, px * 1.6);
    g.imageSmoothingEnabled = false;
    g.drawImage(swing ? fr.attack : fr.idle, x - size / 2, y - size - hop, size, size);
    if (place > 0 && this.sim.count > 1) return;   // the crown is for first place
    const by = y - size - hop - px * 2 + Math.sin(t * 6) * px * 0.6, cx = x - px * 0.5;
    g.fillStyle = '#ffd23f';
    g.fillRect(cx - px * 3, by, px * 7, px * 2);
    for (const d of [-3, 0, 3]) g.fillRect(cx + d * px, by - px * (d ? 1 : 2), px, px * (d ? 1 : 2));
    g.fillStyle = '#ff5d73';
    g.fillRect(cx, by + px * 0.5, px, px);
  }

  draw(dt = 1, clock) {
    const { g, canvas: c, sim } = this;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#0d0e12';
    g.fillRect(0, 0, c.width, c.height);
    if (!sim) {
      g.fillStyle = '#a1a1aa';
      g.font = `600 ${c.width * 0.025}px 'Geist', system-ui, sans-serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('Add names to battle', c.width / 2, c.height / 2);
      return;
    }
    const now = clock ?? sim.t;
    const base = Math.min(c.width / sim.W, c.height / sim.H);
    const living = sim.aliveList();
    // The sim ticks at 30Hz; draw between ticks so fast moves stay smooth at 60fps.
    const blend = clock == null ? 1 : Math.max(0, Math.min(1, 1 - (sim.t - clock) / BATTLE_DT));
    const drawX = p => p.px + (p.x - p.px) * blend, drawY = p => p.py + (p.y - p.py) * blend;

    // Zoom in on the last two (or the survivor), framed so the arena edge stays on screen.
    let tz = 1, tx = sim.W / 2, ty = sim.H / 2;
    if (living.length <= Math.max(2, sim.count + 1) && sim.n > living.length) {
      const xs = living.map(i => sim.f[i].x), ys = living.map(i => sim.f[i].y);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      tz = Math.max(1, Math.min(2.4, sim.W * 0.7 / (x1 - x0 + 70), sim.H * 0.7 / (y1 - y0 + 70)));
      tx = (x0 + x1) / 2;
      ty = (y0 + y1) / 2;
    }
    const lerp = Math.min(1, 1 - Math.exp(-dt * 2.5));
    this.zoom += (tz - this.zoom) * lerp;
    this.fx = (this.fx || tx) + (tx - (this.fx || tx)) * lerp;
    this.fy = (this.fy || ty) + (ty - (this.fy || ty)) * lerp;
    const s = base * this.zoom;
    const vw = c.width / s, vh = c.height / s;
    const cx = vw >= sim.W ? sim.W / 2 : Math.max(vw / 2, Math.min(sim.W - vw / 2, this.fx));
    const cy = vh >= sim.H ? sim.H / 2 : Math.max(vh / 2, Math.min(sim.H - vh / 2, this.fy));
    g.save();
    g.translate(c.width / 2 - cx * s, c.height / 2 - cy * s);
    g.scale(s, s);
    if (this.arena) g.drawImage(this.arena, 0, 0);

    // The shrinking zone: everything outside the ring is dimmed and hurts.
    const r = sim.zone();
    if (r < Math.hypot(sim.W, sim.H)) {
      g.save();
      g.beginPath(); g.rect(0, 0, sim.W, sim.H); g.clip();
      g.beginPath(); g.rect(0, 0, sim.W, sim.H); g.moveTo(sim.zx + r, sim.zy); g.arc(sim.zx, sim.zy, r, 0, 6.2832, true);
      g.fillStyle = 'rgba(120,20,40,.42)'; g.fill();
      g.beginPath(); g.arc(sim.zx, sim.zy, r, 0, 6.2832);
      g.lineWidth = 2; g.strokeStyle = '#ff5d73'; g.setLineDash([6, 4]); g.stroke(); g.setLineDash([]);
      g.restore();
    }

    const order = sim.f.map((_, i) => i).sort((a, b) => sim.f[a].y - sim.f[b].y || a - b);
    for (const i of order) {           // the fallen first, so they lie under the living
      const p = sim.f[i];
      if (!p.dead) continue;
      const age = sim.t - p.deadAt;
      if (age > 5) continue;
      g.globalAlpha = Math.max(0, 1 - age / 5);
      g.drawImage(framesFor(this.name(i)).dead, Math.round(p.x - 8), Math.round(p.y - 13));
      g.globalAlpha = 1;
    }
    const topKills = living.slice().sort((a, b) => sim.f[b].kills - sim.f[a].kills || a - b).slice(0, 5);
    for (const i of order) {
      const p = sim.f[i];
      if (p.dead) continue;
      const fr = framesFor(this.name(i));
      const swinging = sim.t - p.swing < 0.18, dodging = p.dodge > 0, windup = p.wind > 0;
      const img = swinging ? fr.attack : p.moving && !dodging ? (Math.floor(sim.t * (6 + Math.hypot(p.vx, p.vy) * 0.08) + i) % 2 ? fr.walk1 : fr.walk2) : fr.idle;
      const won = sim.winners?.includes(i);
      const bob = won ? Math.abs(Math.sin(now * 7)) * 5 : 0;
      const roll = dodging ? 1 - p.dodge / DODGE_TIME : 0, hop = dodging ? Math.sin(roll * Math.PI) * 5 : 0;
      const x = drawX(p), y = drawY(p);
      // shadow keeps fighters grounded when they hop or roll
      g.fillStyle = 'rgba(15,16,19,.28)';
      g.fillRect(x - 5 + hop * 0.4, y + 1, 10 - hop * 0.8, 2);
      if (dodging) {            // afterimages trail the roll
        for (let k = 2; k >= 1; k--) {
          g.globalAlpha = 0.3 / k;
          g.drawImage(img, x - p.vx * 0.035 * k - 8, y - p.vy * 0.035 * k - 14);
        }
        g.globalAlpha = 1;
      }
      g.save();
      g.translate(x, y - bob - hop);
      g.scale(p.face, 1);
      if (dodging) { g.translate(0, -6); g.rotate(roll * Math.PI * 2); g.translate(0, 6); }
      else if (windup) { g.translate(-1.5, 0); g.rotate(-0.24); }      // the tell: leaning back to swing
      else if (swinging) { g.translate(1.5, 0); g.rotate(0.16); }
      else if (p.stun > 0) g.translate(Math.sin(sim.t * 70) * 0.9, 0);
      else if (p.moving) g.rotate(Math.sin(sim.t * 13 + i) * 0.07);
      if (sim.t - p.hurt < 0.1) g.filter = 'brightness(2.2)';
      g.drawImage(img, -8, -14);
      g.restore();
      if (windup) {             // a glint on the weapon just before it comes down
        g.fillStyle = '#ffe9a0';
        g.fillRect(x - p.face * 3, y - 16 - bob, 2, 2);
      }
      if (swinging) {           // slash arc; grey when it cuts air
        g.globalAlpha = 1 - (sim.t - p.swing) / 0.18;
        g.lineWidth = 2;
        g.strokeStyle = p.whiff ? '#b8bcc6' : '#ffffff';
        g.beginPath(); g.arc(x, y - 6, 13, p.aim - 0.9, p.aim + 0.9); g.stroke();
        g.globalAlpha = 1;
      }
      if (p.guard > 0) {        // raised guard
        const a = p.face > 0 ? 0 : Math.PI;
        g.lineWidth = 1.5;
        g.strokeStyle = '#9ad8ff';
        g.beginPath(); g.arc(x, y - 6, 10, a - 0.85, a + 0.85); g.stroke();
      }
      // HP bar
      const w = 14, hp = Math.max(0, p.hp / p.max);
      const barH = Math.max(1.2, 2 / this.zoom), barY = y - 18 - bob;   // stays slim when zoomed in
      g.fillStyle = 'rgba(22,23,29,.55)'; g.fillRect(x - w / 2 - 0.5, barY - 0.5, w + 1, barH + 1);
      g.fillStyle = hp > 0.5 ? '#4ade80' : hp > 0.25 ? '#ffd23f' : '#ff5d73';
      g.fillRect(x - w / 2, barY, Math.max(hp > 0 ? 1 : 0, w * hp), barH);
    }
    g.restore();

    // Name labels, drawn in screen space so they stay readable at any scale.
    // Every fighter keeps a name; labels shrink as the arena gets crowded.
    const n = living.length, crowd = n > 50 ? 0.66 : n > 24 ? 0.8 : 1;
    const f = Math.round(Math.max(8.5 * this.px, Math.max(10.5 * this.px, Math.min(c.width, c.height * 1.6) * 0.0135) * crowd) * 2) / 2;
    g.font = `600 ${f}px 'Geist', system-ui, sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    this.labelCache ??= new Map();
    const labels = living.map(i => {
      const p = sim.f[i], name = this.name(i), key = `${f}|${name}`;
      let m = this.labelCache.get(key);
      if (!m) { const text = fit(g, name, f * 9); m = { text, tw: g.measureText(text).width }; this.labelCache.set(key, m); }
      return { i, text: m.text, w: m.tw + f * 0.8, sx: c.width / 2 + (drawX(p) - cx) * s, sy: c.height / 2 + (drawY(p) - 21 - (sim.winners?.includes(i) ? Math.abs(Math.sin(now * 7)) * 5 : 0) - cy) * s };
    }).sort((a, b) => b.sy - a.sy);
    // Stack labels that would collide, lowest first, so close fighters stay readable.
    // In a big crowd they stay on their fighters instead, lowest drawn on top.
    if (n <= 30) labels.forEach((l, k) => {
      for (let m = 0; m < k; m++) {
        const o = labels[m];
        if (Math.abs(l.sx - o.sx) < (l.w + o.w) / 2 && l.sy > o.sy - f * 1.45) l.sy = o.sy - f * 1.45;
      }
    });
    for (const { i, text, w, sx, sy } of labels.slice().reverse()) {
      plate(g, sx - w / 2, sy - f * 1.45, w, f * 1.35, f * 0.3, 'rgba(15,16,19,.78)');
      g.fillStyle = sim.winners?.includes(i) ? '#ffd23f' : topKills[0] === i && sim.f[i].kills ? '#ffb4bf' : '#f4f4f5';
      g.fillText(text, sx, sy - f * 0.75);
    }
    // Damage numbers and DODGE/BLOCK/MISS rise above the labels so they're never hidden.
    const WORDS = { dodge: ['DODGE', '#7dd3fc'], block: ['BLOCK', '#c7d2fe'], miss: ['MISS', '#b8bcc6'] };
    const pop = Math.max(5, 7 / this.zoom) * s;
    g.font = `700 ${pop}px 'Geist Mono', monospace`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    let shown = 0;
    for (let e = sim.events.length - 1; e >= 0 && shown < 12; e--) {
      const ev = sim.events[e], age = sim.t - ev.t;
      if (age > 0.55) break;
      if (ev.type === 'ko' || ev.type === 'zone') continue;
      shown++;
      const word = WORDS[ev.type], text = word ? word[0] : ev.dmg;
      const tx = c.width / 2 + (ev.x - cx) * s, ty = c.height / 2 + (ev.y - 26 - age * 22 - cy) * s;
      g.globalAlpha = 1 - age / 0.55;
      g.fillStyle = '#16171d'; g.fillText(text, tx + s * 0.7, ty + s * 0.7);
      g.fillStyle = word ? word[1] : '#ffd23f'; g.fillText(text, tx, ty);
      g.globalAlpha = 1;
    }
    this.hud(living, topKills, p => ({ x: c.width / 2 + (drawX(p) - cx) * s, y: c.height / 2 + (drawY(p) - 14 - cy) * s }), Math.min(dt, 0.1));
    this.footer(FOOT.battle);
  }

  // Deliberately slim, so it never hides the fight: one line each side of the top edge, which
  // fades away whenever a fighter is underneath it. The full story is in the match report.
  hud(living, topKills, toScreen, dt) {
    const { g, canvas: c, sim } = this, f = Math.max(11, Math.min(c.width, c.height * 1.6) * 0.0145), m = f * 0.6, h = f * 1.75;
    const label = !this.live ? `${sim.n} READY` : sim.winners ? (sim.count > 1 ? `LAST ${sim.count} STANDING` : 'LAST ONE STANDING') : living.length === sim.count + 1 && sim.n > living.length ? `FINAL ${living.length}` : `${living.length} ALIVE`;
    const big = `700 ${f}px 'Geist Mono', monospace`, small = `600 ${f * 0.82}px 'Geist', system-ui, sans-serif`, mono = `600 ${f * 0.72}px 'Geist Mono', monospace`;
    g.textBaseline = 'middle'; g.textAlign = 'left';
    g.font = big;
    const lw = g.measureText(label).width + f * 1.4;

    // Most KOs, plus the latest knockout for a moment when there's room.
    const leader = topKills.find(i => sim.f[i].kills);
    let latest = '';
    for (let e = sim.events.length - 1; e >= 0; e--) {
      const ev = sim.events[e];
      if (ev.type !== 'ko' && ev.type !== 'zone') continue;
      if (sim.t - ev.t < 2.5) latest = ev.type === 'ko' ? `${this.name(ev.a)} KO’d ${this.name(ev.b)}` : `The zone took ${this.name(ev.b)}`;
      break;
    }
    const room = c.width - lw - m * 3 - f * 1.4;
    const parts = [];
    g.font = small;
    if (leader != null) {
      const kills = String(sim.f[leader].kills);
      g.font = mono; const tag = g.measureText('MOST KOs').width;
      g.font = small; const kw = g.measureText(kills).width;
      const name = fit(g, this.name(leader), Math.min(f * 9, room - tag - kw - f * 1.4));
      parts.push({ tag, name, nw: g.measureText(name).width, kills, kw });
    }
    const used = parts[0] ? parts[0].tag + parts[0].nw + parts[0].kw + f * 1.4 : 0;
    const left = room - used - (parts[0] ? f * 1.2 : 0);
    let tail = '';
    if (latest && left > f * 8) tail = fit(g, latest, left);
    const tw = tail ? g.measureText(tail).width : 0;
    const w = used + tw + (parts[0] && tail ? f * 1.2 : 0) + (used || tail ? f * 1.4 : 0);
    const x = c.width - m - w;

    // Fade out while anyone is under either plate.
    const under = (x0, x1) => living.some(i => { const p = toScreen(sim.f[i]); return p.x > x0 && p.x < x1 && p.y > 0 && p.y < m + h + f * 2.5; });
    const lerp = Math.min(1, dt * 7);
    this.hudL = (this.hudL ?? 1) + ((under(m, m + lw) ? 0.28 : 0.9) - (this.hudL ?? 1)) * lerp;
    this.hudR = (this.hudR ?? 1) + ((under(x, x + w) ? 0.18 : 0.8) - (this.hudR ?? 1)) * lerp;

    g.globalAlpha = this.hudL;
    plate(g, m, m, lw, h, f * 0.45, 'rgba(15,16,19,.72)');
    g.font = big;
    g.fillStyle = this.live && (sim.winners || living.length === sim.count + 1) ? '#ffd23f' : '#f4f4f5';
    g.fillText(label, m + f * 0.7, m + h / 2 + f * 0.04);
    if (w > 0 && (parts[0] || tail)) {
      g.globalAlpha = this.hudR;
      plate(g, x, m, w, h, f * 0.45, 'rgba(15,16,19,.72)');
      let tx = x + f * 0.7;
      const y = m + h / 2 + f * 0.04;
      if (parts[0]) {
        const { tag, name, nw, kills, kw } = parts[0];
        g.font = mono; g.fillStyle = '#a1a1aa'; g.fillText('MOST KOs', tx, y); tx += tag + f * 0.5;
        g.font = small; g.fillStyle = '#f4f4f5'; g.fillText(name, tx, y); tx += nw + f * 0.4;
        g.fillStyle = '#ffd23f'; g.fillText(kills, tx, y); tx += kw;
      }
      if (tail) {
        if (parts[0]) tx += f * 1.2;
        g.font = small; g.fillStyle = '#d4d4d8'; g.fillText(tail, tx, y);
      }
    }
    g.globalAlpha = 1;
  }
}

// ---------- Horse Race ----------
const TRACK_TOP = 104, TRACK_BOTTOM = 284, VIEW_H = 300;

class HorseView extends View {
  setEntries(pool) {
    this.pool = pool;
    this.sim = pool.length ? new HorseSim(pool.length, 'idle', 'quick') : null;
    this.slots = pool.map((_, i) => i);
    this.cam = null;
    this.live = false;
    this.scene = null;
    if (!this.playing) this.draw();
  }

  async play({ seed, winnerIdxs, length, onLeader, sound }) {
    const n = this.pool.length, pre = preRunHorse(n, seed, length, winnerIdxs.length);
    this.sim = new HorseSim(n, seed, length);
    this.slots = assignSlots(n, winnerIdxs, pre.winSlots, makeRng(`${seed}|slots`));
    this.count = winnerIdxs.length;
    this.cam = null;
    this.live = true;
    this.scene = null;
    await this.countdown(sound);
    if (this.dead) return;
    let lead = -1, tick = 0;
    await this.run(pre.finishAt + 1.6, (t, dt) => {
      while (this.sim.t < t) this.sim.step();
      const rank = this.sim.ranking();
      if (this.sim.t - tick > 0.4 && rank[0] !== lead) { lead = rank[0]; tick = this.sim.t; onLeader?.(this.name(lead)); sound?.tick(); }
      if (this.sim.h[rank[0]].x / this.sim.finishX > 0.75) sound?.tension?.();
      this.draw(dt, rank);
    });
    if (!this.dead) await this.celebrate(sound, pre.winSlots);
  }

  drawField(dt) { this.draw(dt, this.sim.ranking()); }

  sceneTitle() { return 'WINNER’S CIRCLE!'; }

  sceneBack(t) {
    const { g, canvas: c } = this, turf = c.height * 0.56, post = Math.max(12, c.width * 0.05);
    g.fillStyle = '#3f7d3a';
    g.fillRect(0, turf, c.width, c.height - turf);
    g.fillStyle = 'rgba(255,255,255,.06)';
    for (let x = 0; x < c.width; x += post * 3) g.fillRect(x, turf, post * 1.5, c.height - turf);
    const railH = Math.max(3, c.height * 0.012);
    g.fillStyle = '#f4f4f5';
    g.fillRect(0, turf, c.width, railH);
    for (let x = post / 2; x < c.width; x += post) g.fillRect(x, turf, railH, c.height * 0.045);
    for (let i = 0; i < 9; i++) {                  // camera flashes from the stands
      const on = ((t * 3 + i * 0.37) * 7) % 5 < 0.5;
      if (!on) continue;
      const x = (i + 0.5) / 9 * c.width, y = turf * (0.32 + ((i * 0.53) % 1) * 0.6), r = Math.min(c.width, c.height) * 0.018;
      g.fillStyle = 'rgba(255,255,255,.9)';
      g.fillRect(x - r, y - r * 0.2, r * 2, r * 0.4);
      g.fillRect(x - r * 0.2, y - r, r * 0.4, r * 2);
    }
    const petal = Math.max(3, Math.min(c.width, c.height) * 0.012);
    for (let i = 0; i < 34; i++) {                 // falling rose petals
      const period = 2.2 + (i % 5) * 0.3, u = ((t + i * 0.27) % period) / period;
      g.fillStyle = i % 3 ? '#e11d48' : '#fb7185';
      g.fillRect((i + 0.5) / 34 * c.width + Math.sin(t * 2 + i) * petal * 3, u * c.height, petal, petal * (i % 2 ? 1 : 0.6));
    }
  }

  sceneActor(slot, x, y, size, t, place) {
    const { g } = this, frames = horseFrames(this.name(slot)), w = size * 1.4, h = w * 20 / 28, px = w / 28;
    const hop = Math.abs(Math.sin(t * 9)) * px * 1.2;
    g.fillStyle = 'rgba(0,0,0,.28)';
    g.fillRect(x - w * 0.4, y - px, w * 0.8, px * 1.6);
    g.imageSmoothingEnabled = false;
    g.drawImage(frames[Math.floor(t * 9) % frames.length], x - w / 2, y - h - hop, w, h);
    // winner's rosette on the horse's shoulder
    const rx = x + px * 5, ry = y - h * 0.5 - hop, r = px * 2.6;
    g.fillStyle = place === 0 ? '#e11d48' : '#3a86ff';
    g.fillRect(rx - r * 0.7, ry, r * 0.5, r * 1.8);
    g.fillRect(rx + r * 0.2, ry, r * 0.5, r * 1.8);
    g.fillStyle = '#ffd23f';
    g.beginPath(); g.arc(rx, ry, r, 0, 6.2832); g.fill();
    g.fillStyle = '#14151a';
    g.font = `800 ${r * 1.1}px 'Geist Mono', monospace`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(String(place + 1), rx, ry + r * 0.05);
  }

  crowdTile() {
    if (this.crowd) return this.crowd;
    const cv = document.createElement('canvas');
    cv.width = 320; cv.height = 44;
    const g = cv.getContext('2d'), rng = makeRng('crowd');
    g.fillStyle = '#5b6170'; g.fillRect(0, 0, 320, 44);
    g.fillStyle = '#e8e4d8'; g.fillRect(0, 0, 320, 5);
    g.fillStyle = '#c0392b';
    for (let x = 0; x < 320; x += 16) g.fillRect(x, 0, 8, 5);
    const shirts = ['#e63946', '#3a86ff', '#ffd23f', '#2ec4b6', '#f4f1e8', '#ff9f1c', '#9b5de5', '#43aa3b'], skins = ['#ffd9b3', '#d9a06b', '#8a5a34'];
    for (let y = 9; y < 42; y += 7) for (let x = 2 + (y % 2) * 3; x < 318; x += 5) {
      g.fillStyle = shirts[Math.floor(rng() * shirts.length)]; g.fillRect(x, y + 2, 3, 3);
      g.fillStyle = skins[Math.floor(rng() * skins.length)]; g.fillRect(x + 1, y, 2, 2);
    }
    return (this.crowd = cv);
  }

  draw(dt = 1, rank) {
    const { g, canvas: c, sim } = this;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#8fc7ea';
    g.fillRect(0, 0, c.width, c.height);
    if (!sim) {
      g.fillStyle = '#16171d';
      g.font = `600 ${c.width * 0.025}px 'Geist', system-ui, sans-serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('Add names to race', c.width / 2, c.height / 2);
      return;
    }
    rank ??= sim.ranking();
    const s = Math.min(c.height / VIEW_H, c.width / 340), viewW = c.width / s, oy = Math.round((c.height - VIEW_H * s) * 0.55);
    g.fillStyle = '#3f7d34';
    g.fillRect(0, oy + 96 * s, c.width, c.height);
    // The camera runs with the leader, then waits at the post for the next finishers.
    const lead = sim.h[rank[0]].x;
    const want = Math.min(lead - viewW * 0.66, sim.finishX - viewW * 0.48);
    this.cam = this.cam == null ? want : this.cam + (want - this.cam) * Math.min(1, 1 - Math.exp(-dt * 5));
    const cam = this.cam;

    g.save();
    g.translate(0, oy);
    g.scale(s, s);
    // Far hills drift slowly; the stands and the rail move faster, so speed reads clearly.
    g.fillStyle = '#6fa85a';
    for (let x = -4; x < viewW + 8; x += 4) { const wx = x + cam * 0.15; g.fillRect(x, 44 + Math.sin(wx * 0.021) * 8 + Math.sin(wx * 0.007) * 10, 4, 50); }
    const tile = this.crowdTile(), off = ((cam * 0.55) % 320 + 320) % 320;
    for (let x = -off; x < viewW; x += 320) g.drawImage(tile, Math.round(x), 52);
    g.fillStyle = '#3f7d34';
    g.fillRect(0, 96, viewW, VIEW_H - 96);
    // mown stripes on the turf
    const stripe = 90, first = Math.floor(cam / stripe) * stripe;
    for (let wx = first - stripe; wx < cam + viewW + stripe; wx += stripe) {
      g.fillStyle = Math.round(wx / stripe) % 2 ? '#4f8a3c' : '#47803a';
      g.fillRect(wx - cam, TRACK_TOP, stripe, TRACK_BOTTOM - TRACK_TOP);
    }
    // white rails with posts
    for (const y of [TRACK_TOP - 8, TRACK_BOTTOM + 2]) {
      g.fillStyle = '#f4f1e8'; g.fillRect(0, y, viewW, 2);
      for (let wx = Math.floor(cam / 36) * 36; wx < cam + viewW + 36; wx += 36) g.fillRect(wx - cam, y, 2, 8);
    }
    // starting stalls
    if (cam < 40) {
      g.fillStyle = '#c0392b'; g.fillRect(-cam + 2, TRACK_TOP - 14, 4, TRACK_BOTTOM - TRACK_TOP + 18);
      g.fillStyle = '#f4f1e8'; g.fillRect(-cam + 3, TRACK_TOP - 14, 2, TRACK_BOTTOM - TRACK_TOP + 18);
    }
    // finish: checkered line and post
    const fx = sim.finishX - cam;
    if (fx > -30 && fx < viewW + 30) {
      for (let y = TRACK_TOP; y < TRACK_BOTTOM; y += 6) for (let i = 0; i < 2; i++) { g.fillStyle = (Math.floor(y / 6) + i) % 2 ? '#16171d' : '#f4f1e8'; g.fillRect(fx + i * 6, y, 6, 6); }
      g.fillStyle = '#16171d'; g.fillRect(fx + 4, TRACK_TOP - 44, 4, 44);
      g.fillStyle = '#ffd23f'; g.fillRect(fx - 20, TRACK_TOP - 58, 52, 16);
      g.fillStyle = '#16171d'; g.font = `700 10px 'Geist', system-ui, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText('FINISH', fx + 6, TRACK_TOP - 49.5);
    }

    const n = sim.n, gap = n > 1 ? Math.min(32, (TRACK_BOTTOM - TRACK_TOP - 34) / (n - 1)) : 0, mid = (TRACK_TOP + TRACK_BOTTOM + 16) / 2;
    const laneY = lane => mid + (lane - (n - 1) / 2) * gap;
    const order = sim.h.map((_, i) => i).sort((a, b) => sim.h[a].lane - sim.h[b].lane);
    const visible = [];
    for (const i of order) {
      const p = sim.h[i], x = p.x - cam, y = laneY(p.lane);
      if (x < -40 || x > viewW + 40) continue;
      visible.push(i);
      const frames = horseFrames(this.name(i)), fr = Math.floor(p.phase) % 4, moving = p.v > 1;
      const img = frames[moving ? fr : 0], hop = moving && fr === 3 ? 1 : 0;
      g.fillStyle = 'rgba(15,16,19,.22)'; g.fillRect(Math.round(x - 21), Math.round(y - 2), 26, 3);
      if (moving && p.v > 30) { g.fillStyle = 'rgba(214,190,140,.55)'; g.fillRect(Math.round(x - 30 - fr * 2), Math.round(y - 4 - fr), 3, 2); }
      g.drawImage(img, Math.round(x - 24), Math.round(y - 20 - hop));
    }
    g.restore();

    // Every horse keeps a name, trailing behind it.
    const crowded = n > 40 ? 0.66 : n > 20 ? 0.8 : 1;
    const f = Math.round(Math.max(8.5 * this.px, Math.max(10.5 * this.px, Math.min(c.width, c.height * 1.6) * 0.0135) * crowded) * 2) / 2;
    g.font = `600 ${f}px 'Geist', system-ui, sans-serif`;
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const places = new Map(sim.order.slice(0, this.count ?? 1).map((slot, k) => [slot, k + 1]));
    // Back of the field first, so the leaders' names stay on top in a crowd.
    const seen = new Set(visible);
    for (const i of rank.slice().reverse()) {
      if (!seen.has(i)) continue;
      const p = sim.h[i], place = places.get(i), text = (place ? `${ordinal(place)} · ` : '') + fit(g, this.name(i), f * 9);
      const w = g.measureText(text).width + f * 0.8, sx = (p.x - cam - 25) * s - w / 2, sy = oy + (laneY(p.lane) - 8) * s;
      plate(g, sx - w / 2, sy - f * 0.68, w, f * 1.36, f * 0.3, 'rgba(15,16,19,.8)');
      g.fillStyle = place ? '#ffd23f' : this.live && i === rank[0] ? '#ffe9a0' : '#f4f4f5';
      g.fillText(text, sx, sy);
    }
    this.board(rank, 0, Math.min(1, lead / sim.finishX), `${n} horse${n === 1 ? '' : 's'} ready`);
    this.footer(FOOT.race);
  }
}

export function createGame(mode, canvas, theme) {
  const View = mode === 'battle' ? BattleView : mode === 'horse' ? HorseView : RaceView;
  const view = new View(canvas, theme);
  view.mode = mode === 'battle' || mode === 'horse' ? mode : 'race';
  return view;
}
