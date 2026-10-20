// Canvas wheel. Slice size follows entry weight; the pointer sits at the top.
// The slices are pre-rendered once to an offscreen canvas and rotated per frame,
// so thousands of entries still animate smoothly.

export const PALETTES = {
  stream: ['#ffd23f', '#ff5d73', '#2ec4b6', '#3a86ff', '#ff9f1c', '#f4f1e8'],
  fiesta: ['#e63946', '#f1c453', '#2a9d8f', '#264653', '#f4a261', '#fdfcf7'],
  candy: ['#ff8fab', '#ffd6e0', '#a0e7e5', '#b4f8c8', '#fbe7c6', '#cdb4db'],
  mono: ['#f3f1ea', '#bdbab1', '#7d7a73', '#2a2e37', '#4a4e57', '#e2ded2'],
};

const TAU = Math.PI * 2;
const POINTER = Math.PI * 1.5; // canvas angle of the pointer (top)
const mod = (a, n) => ((a % n) + n) % n;
const ease = t => 1 - Math.pow(1 - t, 4);

function inkFor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.35 ? '#14151a' : '#fdfcf7';
}

export class Wheel {
  constructor(canvas, { palette = 'stream' } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.entries = [];
    this.segs = [];
    this.rotation = 0;
    this.palette = PALETTES[palette] ?? PALETTES.stream;
    this.cache = null;
    this.size = 0;
    new ResizeObserver(() => this.resize()).observe(canvas.parentElement);
    this.resize();
  }

  resize() {
    const box = this.canvas.parentElement.getBoundingClientRect();
    const css = Math.max(60, Math.floor(Math.min(box.width, box.height || box.width)));
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (Math.round(css * dpr) === this.size) return;
    this.canvas.style.width = this.canvas.style.height = `${css}px`;
    this.size = this.canvas.width = this.canvas.height = Math.round(css * dpr);
    this.cache = null;
    this.draw();
  }

  setPalette(name) {
    this.palette = PALETTES[name] ?? PALETTES.stream;
    this.cache = null;
    this.draw();
  }

  setEntries(entries) {
    this.entries = entries;
    const total = entries.reduce((s, e) => s + e.weight, 0);
    let a = 0;
    this.segs = entries.map((e, i) => {
      const start = a;
      a += (e.weight / total) * TAU;
      let c = i % this.palette.length;
      if (i === entries.length - 1 && i > 0 && c === 0) c = 1;
      return { start, end: a, entry: e, c };
    });
    this.cache = null;
    this.draw();
  }

  get radius() { return this.size * 0.47; }

  renderCache() {
    const s = this.size, R = this.radius;
    const off = document.createElement('canvas');
    off.width = off.height = s;
    const g = off.getContext('2d');
    g.translate(s / 2, s / 2);
    const lines = this.segs.length <= 400;
    for (const seg of this.segs) {
      g.beginPath();
      g.moveTo(0, 0);
      g.arc(0, 0, R, seg.start, seg.end);
      g.closePath();
      g.fillStyle = this.palette[seg.c];
      g.fill();
      if (lines && this.segs.length > 1) {
        g.strokeStyle = 'rgba(15,16,19,.35)';
        g.lineWidth = Math.max(1, s / 900);
        g.stroke();
      }
    }
    for (const seg of this.segs) {
      const arc = (seg.end - seg.start) * R * 0.8;
      const minFont = s * 0.016;
      let font = Math.min(s * 0.042, arc * 0.62, R * 0.1);
      if (font < minFont) continue;
      g.save();
      g.rotate((seg.start + seg.end) / 2);
      const setFont = () => { g.font = `600 ${font}px 'Bricolage Grotesque', system-ui, sans-serif`; };
      setFont();
      g.fillStyle = inkFor(this.palette[seg.c]);
      g.textAlign = 'right';
      g.textBaseline = 'middle';
      let label = seg.entry.name;
      const max = R * 0.74;
      // Shrink to fit before truncating, so long names stay readable.
      const wide = g.measureText(label).width;
      if (wide > max) { font = Math.max(minFont, font * max / wide); setFont(); }
      if (g.measureText(label).width > max) {
        while (label.length > 1 && g.measureText(`${label}…`).width > max) label = label.slice(0, -1);
        label += '…';
      }
      g.fillText(label, R * 0.92, 0);
      g.restore();
    }
    g.beginPath();
    g.arc(0, 0, R, 0, TAU);
    g.lineWidth = s * 0.018;
    g.strokeStyle = '#0f1013';
    g.stroke();
    this.cache = off;
  }

  draw() {
    const { ctx: c, size: s } = this;
    if (!s) return;
    const R = this.radius;
    c.clearRect(0, 0, s, s);
    if (!this.segs.length) {
      c.beginPath();
      c.arc(s / 2, s / 2, R, 0, TAU);
      c.fillStyle = '#1e2128';
      c.fill();
      c.lineWidth = s * 0.018;
      c.strokeStyle = '#0f1013';
      c.stroke();
      c.fillStyle = '#9a9ca3';
      c.font = `600 ${s * 0.045}px 'Bricolage Grotesque', system-ui, sans-serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('Add entries to spin', s / 2, s * 0.7);
    } else {
      if (!this.cache) this.renderCache();
      c.save();
      c.translate(s / 2, s / 2);
      c.rotate(this.rotation);
      c.drawImage(this.cache, -s / 2, -s / 2);
      c.restore();
    }
    // Hub
    c.beginPath();
    c.arc(s / 2, s / 2, R * 0.14, 0, TAU);
    c.fillStyle = '#0f1013';
    c.fill();
    c.beginPath();
    c.arc(s / 2, s / 2, R * 0.07, 0, TAU);
    c.fillStyle = '#ffd23f';
    c.fill();
    // Pointer
    const w = R * 0.075, top = s / 2 - R - s * 0.012, h = R * 0.16;
    c.beginPath();
    c.moveTo(s / 2 - w, top);
    c.lineTo(s / 2 + w, top);
    c.lineTo(s / 2, top + h);
    c.closePath();
    c.fillStyle = '#ffd23f';
    c.fill();
    c.lineJoin = 'round';
    c.lineWidth = s * 0.008;
    c.strokeStyle = '#0f1013';
    c.stroke();
  }

  indexAt(rotation = this.rotation) {
    const t = mod(POINTER - rotation, TAU);
    let lo = 0, hi = this.segs.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.segs[mid].end <= t) lo = mid + 1; else hi = mid;
    }
    return lo;
  }

  // Rotation that stops the pointer somewhere inside slice `index` after several full turns.
  planSpin(index, seconds) {
    const seg = this.segs[index];
    const theta = seg.start + (0.15 + Math.random() * 0.7) * (seg.end - seg.start);
    const from = mod(this.rotation, TAU);
    const base = POINTER - theta;
    const turns = Math.max(4, Math.round(seconds * 0.9));
    const to = base + TAU * Math.ceil((from + turns * TAU - base) / TAU);
    return { from, to };
  }

  // rAF pauses in background tabs, so a timer also ends the spin; the host
  // switching tabs mid-spin must not leave the draw unrecorded.
  animate(from, to, ms, onTick = () => {}) {
    return new Promise(resolve => {
      const t0 = performance.now();
      let last = -1, done = false;
      const step = t => {
        if (done) return;
        this.rotation = from + (to - from) * ease(t);
        this.draw();
        if (this.segs.length) {
          const i = this.indexAt();
          if (i !== last) { last = i; onTick(this.entries[i]); }
        }
        if (t >= 1) { done = true; resolve(); }
      };
      const frame = now => {
        step(Math.min(1, (now - t0) / ms));
        if (!done) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
      setTimeout(() => step(1), ms + 100);
    });
  }
}
