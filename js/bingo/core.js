// Online Bingo: the parts with no DOM, so Node tests can check them.
//
// Two codes keep a game fair:
// - The public game code decides every card. Players see it, printouts carry it.
// - A secret 256-bit seed decides the call order. Only its commitment is shown before the
//   first call (with an optional public salt typed in after locking, so the host can't shop for
//   a seed that suits a card), and the seed is revealed when the game ends.
// Knowing your card tells you nothing about the calls.
import { makeRng } from '../games/rng.js';

const VERSION = 'spindraw-bingo-v1';
const enc = new TextEncoder();
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const fromHex = h => new Uint8Array(h.match(/../g).map(x => parseInt(x, 16)));

export const TYPES = {
  75: { balls: 75, label: '75-ball', patterns: ['line', 'corners', 'x', 'blackout'] },
  90: { balls: 90, label: '90-ball', patterns: ['one', 'two', 'full'] },
};
export const PATTERN_NAMES = {
  line: 'Any line', corners: 'Four corners', x: 'Letter X', blackout: 'Blackout (full card)',
  one: 'One line', two: 'Two lines', full: 'Full house',
};
export const MAX_CARD = 9999;

// Custom 75-ball patterns: "c:<mask>", where bit (row * 5 + col) marks a square of the 5 × 5 card.
// The free centre is always marked, so a pattern needs at least one other square.
const FREE_BIT = 12;
export const isCustom = p => typeof p === 'string' && /^c:\d{1,8}$/.test(p) && +p.slice(2) < 2 ** 25;
export const customMask = p => (isCustom(p) ? +p.slice(2) : 0);
export const maskCells = mask => Array.from({ length: 25 }, (_, i) => i).filter(i => (mask >>> i) & 1).map(i => [Math.floor(i / 5), i % 5]);
export const cellsMask = cells => cells.reduce((m, [r, c]) => (m | (1 << (r * 5 + c))) >>> 0, 0);
export const customPattern = mask => `c:${mask >>> 0}`;
export const validCustom = p => isCustom(p) && (customMask(p) & ~(1 << FREE_BIT)) !== 0;
export const validPattern = (type, p) => TYPES[type]?.patterns.includes(p) || (type === 75 && validCustom(p));
export const patternName = (p, customName = '') => (isCustom(p) ? (customName || 'Custom pattern') : PATTERN_NAMES[p] ?? p);
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O or 1/I, easy to read aloud

export function newCode() {
  const b = new Uint8Array(4);
  crypto.getRandomValues(b);
  return [...b].map(x => CODE_CHARS[x % CODE_CHARS.length]).join('');
}
export const validCode = c => typeof c === 'string' && new RegExp(`^[${CODE_CHARS}]{4}$`).test(c);
export const validType = t => t === 75 || t === 90;
export const cardLabel = n => `#${String(n).padStart(4, '0')}`;
export const ballLabel = (n, type) => (type === 75 ? `${'BINGO'[Math.floor((n - 1) / 15)]} ${n}` : String(n));

export async function sha256(str) {
  return hex(await crypto.subtle.digest('SHA-256', enc.encode(str)));
}
// With one card per person, the player list is part of the commitment, so after the first call
// nobody can be moved onto a card that's doing well.
export const rosterHash = names => sha256(JSON.stringify(names));
export const bingoCommit = (seed, type, code, rHash = '') => sha256(`${VERSION}|${seed}|${type}|${code}${rHash ? `|${rHash}` : ''}`);
// Names for the one-card-per-person list: trimmed, no blanks, no repeats (ignoring case).
export function cleanRoster(text) {
  const seen = new Set(), out = [];
  for (const raw of String(text).split(/\r?\n/)) {
    const name = raw.replace(/\s+/g, ' ').trim().slice(0, 60);
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    out.push(name);
    if (out.length >= MAX_CARD) break;
  }
  return out;
}

// The whole call order: a Fisher-Yates shuffle where step i takes its random number from
// HMAC-SHA256(seed, version|type|code|salt|i). 64 bits modulo at most 90 has negligible bias.
export async function callOrder(seed, type, code, salt = '') {
  if (!/^[0-9a-f]{64}$/.test(seed)) throw new Error('bad seed');
  const key = await crypto.subtle.importKey('raw', fromHex(seed), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const balls = Array.from({ length: TYPES[type].balls }, (_, i) => i + 1);
  for (let i = balls.length - 1; i > 0; i--) {
    const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(`${VERSION}|${type}|${code}|${salt}|${i}`)));
    let r = 0n;
    for (let k = 0; k < 8; k++) r = (r << 8n) | BigInt(mac[k]);
    const j = Number(r % BigInt(i + 1));
    [balls[i], balls[j]] = [balls[j], balls[i]];
  }
  return balls;
}

// ---------- cards ----------
// A card is { type, code, n, rows } where rows is a grid of numbers, 0 = blank (90-ball) or
// the free space (75-ball centre). Cards come from the public code, so anyone can rebuild one.
export function makeCard(code, n, type) {
  const rng = makeRng(`${VERSION}|card|${type}|${code}|${n}`);
  return { type, code, n, rows: type === 75 ? card75(rng) : ticket90(rng) };
}

function pick(rng, lo, hi, k) {
  const pool = Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, k);
}

function card75(rng) {
  const cols = [0, 1, 2, 3, 4].map(c => pick(rng, c * 15 + 1, c * 15 + 15, 5));
  const rows = [0, 1, 2, 3, 4].map(r => cols.map(col => col[r]));
  rows[2][2] = 0; // free space
  return rows;
}

// 90-ball ticket: 3 rows × 9 columns, 15 numbers, 5 in every row, at least one in every column.
// Column c holds 1-9, 10-19, …, 80-90. Numbers in a column run top to bottom.
function ticket90(rng) {
  const lo = c => (c === 0 ? 1 : c * 10), hi = c => (c === 8 ? 90 : c * 10 + 9);
  for (let attempt = 0; attempt < 500; attempt++) {
    const counts = Array(9).fill(1);
    let extra = 6;
    while (extra > 0) { const c = Math.floor(rng() * 9); if (counts[c] < 3) { counts[c]++; extra--; } }
    // Place each column's numbers on rows, busiest columns first, keeping rows at 5 or fewer.
    // Ties are broken by random keys drawn up front, never by rng() inside a sort comparator:
    // engines call comparators a different number of times, so that would give Chrome, Safari
    // and Node different tickets for the same card number.
    const grid = [Array(9).fill(0), Array(9).fill(0), Array(9).fill(0)], load = [0, 0, 0];
    const colKey = counts.map(() => rng());
    let ok = true;
    for (const c of [...counts.keys()].sort((a, b) => counts[b] - counts[a] || colKey[a] - colKey[b])) {
      const rowKey = [rng(), rng(), rng()];
      const rows = [0, 1, 2].filter(r => load[r] < 5).sort((a, b) => load[a] - load[b] || rowKey[a] - rowKey[b]).slice(0, counts[c]);
      if (rows.length < counts[c]) { ok = false; break; }
      rows.sort((a, b) => a - b);
      const nums = pick(rng, lo(c), hi(c), counts[c]).sort((a, b) => a - b);
      rows.forEach((r, k) => { grid[r][c] = nums[k]; load[r]++; });
    }
    if (ok && load.every(l => l === 5)) return grid;
  }
  throw new Error('could not build a 90-ball ticket');
}

export const cardNumbers = card => card.rows.flat().filter(Boolean);

// ---------- winning ----------
// Lines a pattern can be made of, as lists of [row, col] cells.
function lines75() {
  const L = [];
  for (let i = 0; i < 5; i++) { L.push({ name: `row ${i + 1}`, cells: [0, 1, 2, 3, 4].map(c => [i, c]) }); L.push({ name: `column ${'BINGO'[i]}`, cells: [0, 1, 2, 3, 4].map(r => [r, i]) }); }
  L.push({ name: 'diagonal', cells: [0, 1, 2, 3, 4].map(k => [k, k]) }, { name: 'diagonal', cells: [0, 1, 2, 3, 4].map(k => [k, 4 - k]) });
  return L;
}
const SHAPES75 = {
  corners: [{ name: 'four corners', cells: [[0, 0], [0, 4], [4, 0], [4, 4]] }],
  x: [{ name: 'letter X', cells: [0, 1, 2, 3, 4].flatMap(k => [[k, k], [k, 4 - k]]).filter(([r, c], i, a) => a.findIndex(([r2, c2]) => r2 === r && c2 === c) === i) }],
  blackout: [{ name: 'full card', cells: [0, 1, 2, 3, 4].flatMap(r => [0, 1, 2, 3, 4].map(c => [r, c])) }],
};

// How the card stands against the called numbers for a pattern.
// Returns { won, detail, missing } where missing is the fewest numbers still needed.
export function checkCard(card, called, pattern) {
  const has = called instanceof Set ? called : new Set(called);
  const marked = (r, c) => { const v = card.rows[r][c]; return v === 0 ? card.type === 75 : has.has(v); };
  if (card.type === 75) {
    const shapes = validCustom(pattern) ? [{ name: 'custom pattern', cells: maskCells(customMask(pattern)) }] : pattern === 'line' ? lines75() : SHAPES75[pattern];
    if (!shapes) throw new Error('bad pattern');
    let best = null;
    for (const s of shapes) {
      const missing = s.cells.filter(([r, c]) => !marked(r, c)).length;
      if (!best || missing < best.missing) best = { missing, name: s.name };
    }
    return { won: best.missing === 0, detail: best.name, missing: best.missing };
  }
  const need = { one: 1, two: 2, full: 3 }[pattern];
  if (!need) throw new Error('bad pattern');
  const perRow = card.rows.map((row, r) => ({ r, m: row.filter(v => v && !has.has(v)).length }));
  const best = [...perRow].sort((a, b) => a.m - b.m || a.r - b.r).slice(0, need);
  const missing = best.reduce((s, x) => s + x.m, 0);
  const rows = best.map(x => x.r + 1).sort((a, b) => a - b);
  const detail = pattern === 'full' ? 'full house' : need === 1 ? `row ${rows[0]}` : `rows ${rows[0]} and ${rows[1]}`;
  return { won: missing === 0, detail, missing };
}
