// Confetti + Web Audio sounds (no assets to load).

const COLORS = ['#ffd23f', '#ff5d73', '#2ec4b6', '#3a86ff', '#ff9f1c', '#f4f1e8'];

export function confetti(count = 180) {
  let cv = document.getElementById('confetti');
  if (!cv) {
    cv = Object.assign(document.createElement('canvas'), { id: 'confetti' });
    cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60';
    document.body.append(cv);
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = cv.width = innerWidth * dpr, H = cv.height = innerHeight * dpr;
  const g = cv.getContext('2d');
  const parts = Array.from({ length: count }, (_, i) => {
    const left = i % 2 === 0;
    const ang = (left ? -60 : -120) * Math.PI / 180 + (Math.random() - 0.5) * 0.9;
    const v = (14 + Math.random() * 14) * dpr;
    return {
      x: left ? 0 : W, y: H * 0.85,
      vx: Math.cos(ang) * v, vy: Math.sin(ang) * v,
      w: (6 + Math.random() * 8) * dpr, h: (4 + Math.random() * 6) * dpr,
      r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      c: COLORS[i % COLORS.length],
    };
  });
  const t0 = performance.now();
  const frame = now => {
    const t = (now - t0) / 1000;
    g.clearRect(0, 0, W, H);
    g.globalAlpha = Math.max(0, 1 - Math.max(0, t - 2.6) / 1.2);
    for (const p of parts) {
      p.vy += 0.45 * dpr;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      g.save();
      g.translate(p.x, p.y);
      g.rotate(p.r);
      g.fillStyle = p.c;
      g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)));
      g.restore();
    }
    if (t < 3.8) requestAnimationFrame(frame); else g.clearRect(0, 0, W, H);
  };
  requestAnimationFrame(frame);
}

let ac;
const audio = () => (ac ||= new (window.AudioContext || window.webkitAudioContext)());

function tone(freq, at, len, { type = 'triangle', vol = 0.12 } = {}) {
  const a = audio();
  const o = a.createOscillator(), g = a.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, a.currentTime + at);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + at + len);
  o.connect(g).connect(a.destination);
  o.start(a.currentTime + at);
  o.stop(a.currentTime + at + len + 0.02);
}

export const sound = {
  enabled: true,
  last: 0,
  unlock() { try { audio().resume(); } catch {} },
  tick() {
    if (!this.enabled) return;
    const now = performance.now();
    if (now - this.last < 40) return;
    this.last = now;
    try { tone(1500, 0, 0.03, { type: 'square', vol: 0.035 }); } catch {}
  },
  win() {
    if (!this.enabled) return;
    try {
      [523.25, 659.25, 783.99].forEach((f, i) => tone(f, i * 0.11, 0.18));
      tone(1046.5, 0.33, 0.7, { vol: 0.14 });
    } catch {}
  },
};
