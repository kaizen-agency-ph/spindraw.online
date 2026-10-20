// Provably-fair draws.
// 1. Lock: a secret 256-bit seed is generated and only its commitment
//    SHA-256("spindraw-v1|seed|entriesHash") is shown on stream.
// 2. Draw k picks from the current pool with HMAC-SHA256(seed, entriesHash|salt|k).
//    The salt is a public word from chat, typed in after locking, so the host
//    can't pre-pick a seed that favours someone.
// 3. Reveal: the seed is published inside a verify link; anyone can replay every draw.

const VERSION = 'spindraw-v1';
const enc = new TextEncoder();

export const toHex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
const fromHex = hex => new Uint8Array(hex.match(/../g).map(h => parseInt(h, 16)));

export async function sha256(str) {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(str)));
}

export function newSeed() {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return toHex(b);
}

export const canonicalEntries = entries => JSON.stringify(entries.map(e => [e.name, e.weight]));
export const entriesHash = entries => sha256(canonicalEntries(entries));
export const commitment = (seed, eHash) => sha256(`${VERSION}|${seed}|${eHash}`);

// Entries still in the wheel before the next draw. Winners leave the pool when
// removeWinners is on; no-shows always leave so a redraw can't hit them again.
export function currentPool(entries, draws, removeWinners) {
  const out = new Set(draws.filter(d => removeWinners || d.status === 'noshow').map(d => d.winner));
  return entries.map((e, i) => ({ ...e, i })).filter(e => !out.has(e.i));
}

// Weighted pick: index into `pool`.
export async function pickIndex(seed, eHash, salt, round, pool) {
  if (!/^[0-9a-f]{64}$/.test(seed)) throw new Error('bad seed');
  const key = await crypto.subtle.importKey('raw', fromHex(seed), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(`${VERSION}|${eHash}|${salt}|${round}`)));
  let r = 0n;
  for (let i = 0; i < 8; i++) r = (r << 8n) | BigInt(mac[i]);
  const total = pool.reduce((s, e) => s + e.weight, 0);
  let t = Number(r % BigInt(total));
  for (let i = 0; i < pool.length; i++) {
    t -= pool[i].weight;
    if (t < 0) return i;
  }
  return pool.length - 1;
}

// Re-run every draw from a revealed payload; each result says whether the recorded winner matches.
export async function replay({ entries, seed, salt, removeWinners, draws }) {
  const eHash = await entriesHash(entries);
  const commit = await commitment(seed, eHash);
  const results = [];
  for (let k = 0; k < draws.length; k++) {
    const pool = currentPool(entries, draws.slice(0, k), removeWinners);
    const expected = pool.length ? pool[await pickIndex(seed, eHash, salt, k, pool)].i : -1;
    results.push({ ...draws[k], expected, ok: expected === draws[k].winner });
  }
  return { eHash, commit, results };
}

function b64url(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function unb64url(str) {
  return Uint8Array.from(atob(str.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
}

const pipe = async (bytes, stream) => new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());

// Verify links carry the whole raffle in the URL hash, deflated, so no server is needed.
export async function encodePayload(obj) {
  return b64url(await pipe(enc.encode(JSON.stringify(obj)), new CompressionStream('deflate-raw')));
}

export async function decodePayload(str) {
  return JSON.parse(new TextDecoder().decode(await pipe(unb64url(str), new DecompressionStream('deflate-raw'))));
}
