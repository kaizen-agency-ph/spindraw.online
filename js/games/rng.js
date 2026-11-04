// Small seeded PRNG (sfc32) so a game replays identically from the same seed string.
export function makeRng(seed) {
  let h = 0x811c9dc5;
  for (const ch of String(seed)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193); }
  let a = h >>> 0, b = Math.imul(h, 31) >>> 0, c = Math.imul(h, 131) >>> 0, d = 1;
  const next = () => {
    const t = (((a + b) | 0) + d) | 0;
    d = (d + 1) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
  for (let i = 0; i < 16; i++) next();
  return next;
}

// Which entry each simulation slot shows: the fair winner sits on the slot that came
// out on top; everyone else is shuffled over the remaining slots.
export function assignSlots(n, winnerIdx, winSlot, rng) {
  const others = [];
  for (let i = 0; i < n; i++) if (i !== winnerIdx) others.push(i);
  for (let i = others.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [others[i], others[j]] = [others[j], others[i]];
  }
  const slots = new Array(n);
  slots[winSlot] = winnerIdx;
  let k = 0;
  for (let s = 0; s < n; s++) if (s !== winSlot) slots[s] = others[k++];
  return slots;
}

export const LENGTHS = { quick: 20, normal: 35, epic: 60 };
export const MAX_PLAYERS = 100;
