// Canvas wheel. Slice size follows entry weight; the pointer sits at the top.
// The slices are pre-rendered once to an offscreen canvas and rotated per frame,
// so thousands of entries still animate smoothly.

export const PALETTES = {
  stream: ['#ffd23f', '#ff5d73', '#2ec4b6', '#3a86ff', '#ff9f1c', '#f4f1e8'],
  fiesta: ['#e63946', '#f1c453', '#2a9d8f', '#264653', '#f4a261', '#fdfcf7'],
  candy: ['#ff8fab', '#ffd6e0', '#a0e7e5', '#b4f8c8', '#fbe7c6', '#cdb4db'],
  mono: ['#f3f1ea', '#bdbab1', '#7d7a73', '#2a2e37', '#4a4e57', '#e2ded2'],
};

// text: 'auto' picks dark/light per slice. wheelOpacity applies to the wheel image.
export const DEFAULT_THEME = {
  preset: 'stream',
  colors: PALETTES.stream,
  text: 'auto',
  rim: '#0f1013',
  pointer: '#ffd23f',
  hub: '#0f1013',
  wheelOpacity: 0.5,
  bgDim: 0.35,
};

const TAU = Math.PI * 2;
const POINTER = Math.PI * 1.5; // canvas angle of the pointer (top)
const mod = (a, n) => ((a % n) + n) % n;
const ease = t => 1 - Math.pow(1 - t, 4);
const LIGHT = '#fdfcf7', DARK = '#14151a';

function inkFor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.35 ? DARK : LIGHT;
}

// Draw `img` scaled to cover the square (x, y, size), cropping the overflow.
function drawCover(g, img, x, y, size) {
  const k = Math.max(size / img.width, size / img.height);
  const w = img.width * k, h = img.height * k;
  g.drawImage(img, x + (size - w) / 2, y + (size - h) / 2, w, h);
}

export class Wheel {
  constructor(canvas, theme = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.entries = [];
    this.segs = [];
    this.rotation = 0;
    this.theme = { ...DEFAULT_THEME, ...theme };
    this.images = {};
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

  setTheme(theme) {
    this.theme = { ...DEFAULT_THEME, ...theme };
    if (!this.theme.colors?.length) this.theme.colors = DEFAULT_THEME.colors;
    this.setEntries(this.entries);
  }

  setPalette(name) {
    this.setTheme({ ...this.theme, preset: name, colors: PALETTES[name] ?? PALETTES.stream });
  }

  // { center, wheel }: loaded HTMLImageElements or null.
  setImages(images) {
    this.images = images ?? {};
    this.cache = null;
    this.draw();
  }

  setEntries(entries) {
    this.entries = entries;
    const total = entries.reduce((s, e) => s + e.weight, 0);
    const n = this.theme.colors.length;
    let a = 0;
    this.segs = entries.map((e, i) => {
      const start = a;
      a += (e.weight / total) * TAU;
      let c = i % n;
      // Avoid the last slice matching the first one it touches.
      if (i === entries.length - 1 && i > 0 && c === 0 && n > 2) c = 1;
      return { start, end: a, entry: e, c };
    });
    this.cache = null;
    this.draw();
  }

  get radius() { return this.size * 0.47; }
  get hubRadius() { return this.radius * (this.images.center ? 0.22 : 0.14); }

  renderCache() {
    const s = this.size, R = this.radius, th = this.theme, img = this.images.wheel;
    const off = document.createElement('canvas');
    off.width = off.height = s;
    const g = off.getContext('2d');
    g.translate(s / 2, s / 2);
    const lines = this.segs.length > 1 && this.segs.length <= 400;
    const separators = alpha => {
      if (!lines) return;
      g.strokeStyle = `rgba(15,16,19,${alpha})`;
      g.lineWidth = Math.max(1, s / 900);
      for (const seg of this.segs) {
        g.beginPath();
        g.moveTo(0, 0);
        g.lineTo(Math.cos(seg.start) * R, Math.sin(seg.start) * R);
        g.stroke();
      }
    };
    for (const seg of this.segs) {
      g.beginPath();
      g.moveTo(0, 0);
      g.arc(0, 0, R, seg.start, seg.end);
      g.closePath();
      g.fillStyle = th.colors[seg.c];
      g.fill();
    }
    if (img) {
      g.save();
      g.beginPath();
      g.arc(0, 0, R, 0, TAU);
      g.clip();
      g.globalAlpha = th.wheelOpacity;
      drawCover(g, img, -R, -R, R * 2);
      g.restore();
    }
    separators(img ? 0.5 : 0.35);

    const maxW = R * 0.92 - this.hubRadius - R * 0.04;
    for (const seg of this.segs) {
      const arc = (seg.end - seg.start) * R * 0.8;
      const minFont = s * 0.016;
      let font = Math.min(s * 0.042, arc * 0.62, R * 0.1);
      if (font < minFont) continue;
      g.save();
      g.rotate((seg.start + seg.end) / 2);
      const setFont = () => { g.font = `600 ${font}px 'Geist', system-ui, sans-serif`; };
      setFont();
      const ink = th.text === 'light' ? LIGHT : th.text === 'dark' ? DARK : inkFor(th.colors[seg.c]);
      g.textAlign = 'right';
      g.textBaseline = 'middle';
      let label = seg.entry.name;
      // Shrink to fit before truncating, so long names stay readable.
      const wide = g.measureText(label).width;
      // Long names shrink only to a readable floor, then get truncated with …
      if (wide > maxW) { font = Math.max(Math.min(font, s * 0.024), font * maxW / wide); setFont(); }
      if (g.measureText(label).width > maxW) {
        while (label.length > 1 && g.measureText(`${label}…`).width > maxW) label = label.slice(0, -1);
        label += '…';
      }
      // An image under the text needs an outline to stay legible.
      if (img) {
        g.lineJoin = 'round';
        g.lineWidth = font * 0.22;
        g.strokeStyle = ink === LIGHT ? 'rgba(0,0,0,.6)' : 'rgba(255,255,255,.65)';
        g.strokeText(label, R * 0.92, 0);
      }
      g.fillStyle = ink;
      g.fillText(label, R * 0.92, 0);
      g.restore();
    }
    g.beginPath();
    g.arc(0, 0, R, 0, TAU);
    g.lineWidth = s * 0.018;
    g.strokeStyle = th.rim;
    g.stroke();
    this.cache = off;
  }

  draw() {
    const { ctx: c, size: s, theme: th } = this;
    if (!s) return;
    const R = this.radius, cx = s / 2;
    c.clearRect(0, 0, s, s);
    if (!this.segs.length) {
      // Empty state follows the page theme (CSS tokens); the overlay has none, so dark fallbacks.
      const css = getComputedStyle(this.canvas);
      const tok = (name, fallback) => css.getPropertyValue(name).trim() || fallback;
      c.beginPath();
      c.arc(cx, cx, R, 0, TAU);
      c.fillStyle = tok('--panel-2', '#1e2128');
      c.fill();
      c.setLineDash([s * 0.02, s * 0.015]);
      c.lineWidth = s * 0.006;
      c.strokeStyle = tok('--line-strong', '#363a43');
      c.stroke();
      c.setLineDash([]);
      c.fillStyle = tok('--muted', '#9a9ca3');
      c.font = `600 ${s * 0.045}px 'Geist', system-ui, sans-serif`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('Add entries to spin', cx, s * 0.7);
    } else {
      if (!this.cache) this.renderCache();
      c.save();
      c.translate(cx, cx);
      c.rotate(this.rotation);
      c.drawImage(this.cache, -cx, -cx);
      c.restore();
    }
    // Hub: a logo if one is set (it stays upright), otherwise a dot.
    const hr = this.hubRadius;
    c.beginPath();
    c.arc(cx, cx, hr, 0, TAU);
    c.fillStyle = th.hub;
    c.fill();
    if (this.images.center) {
      c.save();
      c.beginPath();
      c.arc(cx, cx, hr * 0.92, 0, TAU);
      c.clip();
      drawCover(c, this.images.center, cx - hr * 0.92, cx - hr * 0.92, hr * 1.84);
      c.restore();
      c.beginPath();
      c.arc(cx, cx, hr, 0, TAU);
      c.lineWidth = s * 0.008;
      c.strokeStyle = th.pointer;
      c.stroke();
    } else {
      c.beginPath();
      c.arc(cx, cx, hr * 0.5, 0, TAU);
      c.fillStyle = th.pointer;
      c.fill();
    }
    // Pointer
    const w = R * 0.075, top = cx - R - s * 0.012, h = R * 0.16;
    c.beginPath();
    c.moveTo(cx - w, top);
    c.lineTo(cx + w, top);
    c.lineTo(cx, top + h);
    c.closePath();
    c.fillStyle = th.pointer;
    c.fill();
    c.lineJoin = 'round';
    c.lineWidth = s * 0.008;
    c.strokeStyle = th.rim;
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
