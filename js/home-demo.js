// Homepage hero: the real wheel and game views running on sample names. Nothing here is a real draw.
import { Wheel } from '/js/wheel.js';

const NAMES = ['Maria Santos', 'Juan Dela Cruz', 'Alex Reyes', 'Priya Patel', 'Sam Lee', 'Chris Tan', 'Jordan Kim', 'Aisha Bello', 'Leo Cruz', 'Bea Ramos', 'Noah Garcia', 'Mika Lim'];
const pool = NAMES.map(name => ({ name, weight: 1 }));
const MODES = ['wheel', 'race', 'horse', 'battle'];
const STILL = mode => `/media/game-${mode}.jpg`;
const RESULT_MS = 2600;

const product = document.getElementById('heroDemo');
const box = document.getElementById('demoBox');
const wheelCanvas = document.getElementById('demo');
const gameCanvas = document.getElementById('demoGame');
const still = document.getElementById('demoStill');
const status = document.getElementById('demoStatus');
const tabs = [...product.querySelectorAll('[data-demo]')];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

let mode = 'race', auto = true, onScreen = true, run = 0, game = null, wheel = null, wheelBusy = Promise.resolve();

const pickWinner = () => Math.floor(Math.random() * NAMES.length);
const pause = ms => new Promise(r => setTimeout(r, ms));
const canRun = () => onScreen && !document.hidden && !reduced;
const say = text => { status.textContent = text; };

function select(next) {
  mode = next;
  tabs.forEach(t => t.setAttribute('aria-pressed', String(t.dataset.demo === mode)));
  box.dataset.mode = mode;
}

function stop() {
  run++;
  if (game) { game.destroy(); game = null; }
}

function showStill() {
  still.src = STILL(mode);
  still.hidden = false;
  wheelCanvas.hidden = gameCanvas.hidden = true;
  say('Sample names. Add your own in the app.');
}

async function playWheel(id) {
  await wheelBusy;
  if (id !== run) return null;
  wheel ??= new Wheel(wheelCanvas);
  wheel.setEntries(pool);
  await document.fonts?.ready;
  wheel.cache = null;
  still.hidden = true;
  const i = pickWinner(), { from, to } = wheel.planSpin(i, 5);
  say('Spinning…');
  wheelBusy = wheel.animate(from, to, 5000);
  await wheelBusy;
  return NAMES[i];
}

async function playGame(id) {
  const { createGame } = await import('/js/games/index.js');
  if (id !== run) return null;
  game = createGame(mode, gameCanvas);
  game.setEntries(pool);
  still.hidden = true;
  const i = pickWinner(), current = game;
  say('Get ready…');
  await current.play({
    seed: `home-${Date.now()}-${Math.random()}`,
    winnerIdxs: [i],
    length: 'quick',
    onLeader: text => { if (id === run) say(mode === 'battle' ? text : `${text} is leading`); },
  });
  return NAMES[i];
}

async function start() {
  stop();
  const id = run;
  if (!canRun()) { showStill(); return; }
  const isWheel = mode === 'wheel';
  wheelCanvas.hidden = !isWheel;
  gameCanvas.hidden = isWheel;
  const winner = await (isWheel ? playWheel(id) : playGame(id));
  if (id !== run || winner == null) return;
  say(`Winner: ${winner}`);
  await pause(RESULT_MS);
  if (id !== run) return;
  if (auto) select(MODES[(MODES.indexOf(mode) + 1) % MODES.length]);
  start();
}

tabs.forEach(t => t.addEventListener('click', () => {
  auto = false;
  select(t.dataset.demo);
  start();
}));

new IntersectionObserver(([e]) => {
  if (e.isIntersecting === onScreen) return;
  onScreen = e.isIntersecting;
  if (onScreen) start(); else stop();
}, { threshold: 0.25 }).observe(product);

document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else if (onScreen) start(); });

select(mode);
showStill();
if (document.readyState === 'complete') start(); else addEventListener('load', start, { once: true });

// Explainer: play muted while on screen, pause when scrolled away (never autoplay with reduced motion).
const video = document.getElementById('explainer');
if (video && !reduced) {
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { video.preload = 'auto'; video.play().catch(() => {}); } else video.pause();
  }, { threshold: 0.5 }).observe(video);
}
