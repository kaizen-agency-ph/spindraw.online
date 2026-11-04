// Ball Race and Pixel Battle views. Both replay a pre-run simulation in real time, with the
// fair winner's name on the slot that came out on top. Nothing is steered during playback.
import { makeRng, assignSlots, MAX_PLAYERS, LENGTHS } from './rng.js';
import { RaceSim, preRunRace, WORLD_W } from './race-sim.js';
import { BattleSim, preRunBattle } from './battle-sim.js';
import { framesFor, paintArena } from './sprites.js';

export { MAX_PLAYERS, LENGTHS };

const FOOT = { race: 'The locked draw decides. The race reveals it.', battle: 'The locked draw decides. The battle reveals it.' };

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
    if (!this.playing) this.draw();
  }
  destroy() { this.ro.disconnect(); this.dead = true; }
  setTheme(theme) { this.theme = theme; if (!this.playing) this.draw(); }
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
        onFrame(duration, 1);
        resolve();
      };
      const frame = now => {
        if (done || this.dead) return;
        const dt = Math.min(0.1, (now - last) / 1000);
        last = now;
        const t = (now - t0) / 1000;
        if (t >= duration) return finish();
        onFrame(t, dt);
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
      setTimeout(finish, (duration + 0.2) * 1000);
    });
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
    if (!this.playing) this.draw();
  }

  async play({ seed, winnerIdx, length, onLeader, sound }) {
    const n = this.pool.length, pre = preRunRace(n, seed, length);
    this.sim = new RaceSim(n, seed, length);
    this.slots = assignSlots(n, winnerIdx, pre.winSlot, makeRng(`${seed}|slots`));
    this.cam = 0;
    this.live = true;
    let lead = -1, leadTick = 0;
    await this.run(pre.finishAt + 1.4, (t, dt) => {
      while (this.sim.t < t) this.sim.step();
      const rank = this.sim.ranking();
      if (this.sim.t - leadTick > 0.25 && rank[0] !== lead) { lead = rank[0]; leadTick = this.sim.t; onLeader?.(this.name(lead)); sound?.tick(); }
      this.draw(dt, rank);
    });
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
    const leaderY = sim.b[rank[0]].y;
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

    const colors = this.theme?.colors?.length ? this.theme.colors : ['#ffd23f', '#ff5d73', '#2ec4b6', '#3a86ff', '#ff9f1c'];
    // Names on the front-runners; everyone when the field is small and there's room.
    const roomy = sim.n <= 12 && c.width / this.px >= 600;
    const R = sim.R, topSet = new Set(this.live || roomy ? rank.slice(0, roomy ? sim.n : 3) : []);
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
    g.font = `600 ${Math.max(20, 15 / s)}px 'Geist', system-ui, sans-serif`;
    for (const i of topSet) {
      const p = sim.b[i];
      if (p.y < top || p.y > bot) continue;
      const label = fit(g, this.name(i), 260), w = g.measureText(label).width + 18, h = Math.max(30, 22 / s);
      const lx = Math.max(w / 2 + 4, Math.min(WORLD_W - w / 2 - 4, p.x));   // keep labels on the course
      plate(g, lx - w / 2, p.y - R - h - 6, w, h, 8);
      g.fillStyle = i === rank[0] ? '#ffd23f' : '#f4f4f5';
      g.fillText(label, lx, p.y - R - h / 2 - 5);
    }
    g.restore();

    this.board(rank, wide ? WORLD_W * s : 0);
    this.footer(FOOT.race);
  }

  board(rank, left) {
    const { g, canvas: c, sim } = this;
    const f = Math.max(11, Math.min(c.width, c.height * 1.6) * 0.017), m = f * 0.8, rowH = f * 1.75;
    const w = left ? c.width - left - m * 2 : Math.max(c.width * 0.42, f * 13), x = c.width - w - m, y = m;
    g.textAlign = 'left'; g.textBaseline = 'middle';
    if (!this.live) {
      plate(g, x, y, w, f * 2.2, f * 0.6);
      g.font = `600 ${f * 0.9}px 'Geist', system-ui, sans-serif`;
      g.fillStyle = '#f4f4f5';
      g.fillText(`${sim.n} ball${sim.n === 1 ? '' : 's'} ready`, x + f * 0.8, y + f * 1.12);
      return;
    }
    const rows = Math.min(5, sim.n), h = rowH * rows + f * 2.3;
    plate(g, x, y, w, h, f * 0.7);
    g.font = `600 ${f * 0.72}px 'Geist Mono', monospace`;
    g.fillStyle = '#a1a1aa';
    g.fillText(sim.first >= 0 ? 'FINISHED' : 'WHO’S WINNING', x + f * 0.8, y + f * 1.05);
    rank.slice(0, rows).forEach((slot, i) => {
      const ry = y + f * 2.1 + i * rowH + rowH / 2 - f * 0.25;
      g.font = `600 ${f * 0.85}px 'Geist Mono', monospace`;
      g.fillStyle = i === 0 ? '#ffd23f' : '#a1a1aa';
      g.fillText(String(i + 1), x + f * 0.8, ry);
      g.font = `600 ${f}px 'Geist', system-ui, sans-serif`;
      g.fillStyle = i === 0 ? '#ffd23f' : '#f4f4f5';
      g.fillText(fit(g, this.name(slot), w - f * 3), x + f * 2.1, ry);
    });
    // progress of the leader down the course
    const u = Math.min(1, sim.b[rank[0]].y / sim.course.finishY);
    plate(g, x + f * 0.8, y + h - f * 0.55, w - f * 1.6, f * 0.22, f * 0.1, '#2a2e37');
    plate(g, x + f * 0.8, y + h - f * 0.55, Math.max(f * 0.3, (w - f * 1.6) * u), f * 0.22, f * 0.1, '#ffd23f');
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
    if (!this.playing) this.draw();
  }

  async play({ seed, winnerIdx, length, onLeader, sound }) {
    const n = this.pool.length, pre = preRunBattle(n, seed, length);
    this.sim = new BattleSim(n, seed, length);
    this.slots = assignSlots(n, winnerIdx, pre.winSlot, makeRng(`${seed}|slots`));
    this.arena = paintArena(this.sim.W, this.sim.H, makeRng(`arena|${seed}`));
    this.zoom = 1; this.fx = 0; this.fy = 0;
    this.live = true;
    let seen = 0, alive = n;
    onLeader?.(`${n} fighters`);
    await this.run(pre.finishAt + 1.8, (t, dt) => {
      while (this.sim.t < t && this.sim.winner < 0) this.sim.step();
      if (this.sim.alive !== alive) { alive = this.sim.alive; onLeader?.(alive > 1 ? `${alive} left standing` : this.name(this.sim.winner)); }
      const ev = this.sim.events;
      for (; seen < ev.length; seen++) if (ev[seen].type !== 'hit') sound?.tick();
      if (seen > ev.length) seen = ev.length;
      this.draw(dt, t);
    });
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

    // Zoom in on the last two (or the survivor), framed so the arena edge stays on screen.
    let tz = 1, tx = sim.W / 2, ty = sim.H / 2;
    if (living.length <= 2 && sim.n > 2) {
      tz = Math.min(2.4, (sim.W * 0.8) / Math.max(90, sim.W * 0.22));
      tx = living.reduce((a, i) => a + sim.f[i].x, 0) / living.length;
      ty = living.reduce((a, i) => a + sim.f[i].y, 0) / living.length;
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
      const swinging = sim.t - p.swing < 0.18;
      const img = swinging ? fr.attack : p.moving ? (Math.floor(sim.t * 7 + i) % 2 ? fr.walk1 : fr.walk2) : fr.idle;
      const won = sim.winner === i;
      const bob = won ? Math.abs(Math.sin(now * 7)) * 5 : 0;
      g.save();
      g.translate(Math.round(p.x), Math.round(p.y - bob));
      g.scale(p.face, 1);
      if (sim.t - p.hurt < 0.1) g.filter = 'brightness(2.2)';
      g.drawImage(img, -8, -14);
      g.restore();
      if (swinging) { g.fillStyle = '#ffffff'; g.fillRect(Math.round(p.x + p.face * 11), Math.round(p.y - 8), 2, 6); }
      // HP bar
      const w = 14, hp = Math.max(0, p.hp / p.max);
      const barH = Math.max(1.2, 2 / this.zoom), barY = p.y - 18 - bob;   // stays slim when zoomed in
      g.fillStyle = 'rgba(22,23,29,.55)'; g.fillRect(p.x - w / 2 - 0.5, barY - 0.5, w + 1, barH + 1);
      g.fillStyle = hp > 0.5 ? '#4ade80' : hp > 0.25 ? '#ffd23f' : '#ff5d73';
      g.fillRect(p.x - w / 2, barY, Math.max(hp > 0 ? 1 : 0, w * hp), barH);
    }
    // damage numbers rising from recent hits
    g.textAlign = 'center'; g.textBaseline = 'middle';
    const dmgFont = Math.max(5, 7 / this.zoom);
    g.font = `700 ${dmgFont}px 'Geist Mono', monospace`;
    let shown = 0;
    for (let e = sim.events.length - 1; e >= 0 && shown < 10; e--) {
      const ev = sim.events[e], age = sim.t - ev.t;
      if (age > 0.55) break;
      if (ev.type !== 'hit') continue;
      shown++;
      g.globalAlpha = 1 - age / 0.55;
      g.fillStyle = '#16171d'; g.fillText(ev.dmg, ev.x + 1, ev.y - 22 - age * 22 + 1);
      g.fillStyle = '#ffd23f'; g.fillText(ev.dmg, ev.x, ev.y - 22 - age * 22);
      g.globalAlpha = 1;
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
      return { i, text: m.text, w: m.tw + f * 0.8, sx: c.width / 2 + (p.x - cx) * s, sy: c.height / 2 + (p.y - 21 - (sim.winner === i ? Math.abs(Math.sin(now * 7)) * 5 : 0) - cy) * s };
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
      g.fillStyle = sim.winner === i ? '#ffd23f' : topKills[0] === i && sim.f[i].kills ? '#ffb4bf' : '#f4f4f5';
      g.fillText(text, sx, sy - f * 0.75);
    }
    this.hud(living, topKills);
    this.footer(FOOT.battle);
  }

  hud(living, topKills) {
    const { g, canvas: c, sim } = this, f = Math.max(11, Math.min(c.width, c.height * 1.6) * 0.017), m = f * 0.8;
    // alive counter
    const label = !this.live ? `${sim.n} READY` : sim.winner >= 0 ? 'LAST ONE STANDING' : living.length === 2 && sim.n > 2 ? 'FINAL 2' : `${living.length} ALIVE`;
    g.font = `700 ${f * 1.25}px 'Geist Mono', monospace`;
    g.textAlign = 'left'; g.textBaseline = 'middle';
    const lw = g.measureText(label).width + f * 1.6;
    plate(g, m, m, lw, f * 2.2, f * 0.6);
    g.fillStyle = this.live && (sim.winner >= 0 || living.length === 2) ? '#ffd23f' : '#f4f4f5';
    g.fillText(label, m + f * 0.8, m + f * 1.12);

    // kill feed + top fighters on the right
    const w = Math.max(c.width * 0.26, f * 13), x = c.width - w - m;
    const feed = [];
    for (let e = sim.events.length - 1; e >= 0 && feed.length < 3; e--) if (sim.events[e].type !== 'hit') feed.push(sim.events[e]);
    const rows = Math.min(3, topKills.filter(i => sim.f[i].kills).length);
    const h = f * 1.6 * (feed.length + rows) + (rows ? f * 2 : 0) + (feed.length ? f * 0.9 : 0);
    if (h > 0) {
      plate(g, x, m, w, h, f * 0.6);
      let y = m + f * 1.1;
      g.textAlign = 'left';
      if (rows) {
        g.font = `600 ${f * 0.7}px 'Geist Mono', monospace`;
        g.fillStyle = '#a1a1aa';
        g.fillText('MOST KOs', x + f * 0.7, y);
        y += f * 1.45;
        for (const i of topKills.slice(0, rows)) {
          g.font = `600 ${f * 0.88}px 'Geist', system-ui, sans-serif`;
          g.fillStyle = '#f4f4f5';
          g.fillText(fit(g, this.name(i), w - f * 3.4), x + f * 0.7, y);
          g.textAlign = 'right';
          g.fillStyle = '#ffd23f';
          g.fillText(String(sim.f[i].kills), x + w - f * 0.7, y);
          g.textAlign = 'left';
          y += f * 1.6;
        }
      }
      g.font = `500 ${f * 0.78}px 'Geist', system-ui, sans-serif`;
      for (const ev of feed) {
        const line = ev.type === 'ko' ? `${this.name(ev.a)} KO’d ${this.name(ev.b)}` : `The zone took ${this.name(ev.b)}`;
        g.fillStyle = '#d4d4d8';
        g.fillText(fit(g, line, w - f * 1.4), x + f * 0.7, y);
        y += f * 1.6;
      }
    }
  }
}

export function createGame(mode, canvas, theme) {
  return mode === 'battle' ? new BattleView(canvas, theme) : new RaceView(canvas, theme);
}
