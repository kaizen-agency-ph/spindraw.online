// Elimination Bracket: names face off one on one until a champion is left. No DOM, so it can be
// pre-run and tested in Node. Every match is decided by the seed alone and nothing is steered:
// the fair draw's winners are put on the slots that come out on top afterwards, so byes and
// bracket position never change anyone's odds.
import { makeRng, LENGTHS } from './rng.js';

export const BRACKET_MAX = 64;
export const BRACKET_WINNERS = 4;

const MOVES = ['hit', 'hit', 'dodge', 'block'];

export class BracketSim {
  constructor(n, seed, length = 'normal', count = 1) {
    const rng = this.rng = makeRng(`bracket|${seed}`);
    this.n = n;
    this.count = Math.max(1, Math.min(count, BRACKET_WINNERS, n));
    this.target = LENGTHS[length] ?? LENGTHS.normal;
    let size = 2;
    while (size < n) size *= 2;
    this.size = size;
    this.roundCount = Math.log2(size);

    // First round: shuffle the slots, and give the byes to randomly chosen matches.
    const order = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const pairs = size / 2, byes = size - n, byeMatch = new Set();
    const idx = Array.from({ length: pairs }, (_, i) => i);
    for (let i = pairs - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    idx.slice(0, byes).forEach(i => byeMatch.add(i));
    let k = 0;
    const first = [];
    for (let m = 0; m < pairs; m++) first.push(byeMatch.has(m) ? [order[k++], -1] : [order[k++], order[k++]]);

    // Play every round. A bye is a walkover with no duel.
    this.rounds = [];
    this.out = new Map();           // slot -> round it was knocked out in
    let current = first;
    for (let r = 0; r < this.roundCount; r++) {
      const matches = current.map(([a, b]) => this.match(a, b, r));
      this.rounds.push(matches);
      const winners = matches.map(m => m.winner);
      current = [];
      for (let i = 0; i < winners.length; i += 2) current.push([winners[i], winners[i + 1]]);
    }
    const final = this.rounds.at(-1)[0];
    this.champion = final.winner;
    this.runnerUp = final.loser;

    // Third-place match between the two losing semi-finalists, when there are two.
    this.third = null;
    if (this.roundCount >= 2) {
      const semiLosers = this.rounds.at(-2).map(m => m.loser).filter(s => s >= 0);
      if (semiLosers.length === 2) this.third = this.match(semiLosers[0], semiLosers[1], this.roundCount - 1, true);
      else if (semiLosers.length === 1) this.third = { a: semiLosers[0], b: -1, winner: semiLosers[0], loser: -1, bye: true, round: this.roundCount - 1, third: true, script: [] };
    }
    this.schedule();
    this.winSlots = this.ranking().slice(0, this.count);
  }

  // One duel: a coin flip decides it, and a short seeded script of moves shows it.
  match(a, b, round, third = false) {
    if (b < 0) return { a, b, winner: a, loser: -1, bye: true, round, third, script: [] };
    const aWins = this.rng() < 0.5, winner = aWins ? a : b, loser = aWins ? b : a;
    const script = [];
    let hpW = 3, hpL = 3;
    while (hpL > 0) {
      const byWinner = hpW <= 1 ? true : this.rng() < 0.6;
      const move = MOVES[Math.floor(this.rng() * MOVES.length)];
      const by = byWinner ? 'w' : 'l';
      if (move === 'hit') { if (byWinner) hpL--; else hpW--; }
      script.push({ by, move });
      if (script.length > 12) { script.push({ by: 'w', move: 'hit' }); hpL = 0; }
    }
    if (!script.length || script.at(-1).by !== 'w' || script.at(-1).move !== 'hit') script.push({ by: 'w', move: 'hit' });
    if (this.out) this.out.set(loser, round);
    return { a, b, winner, loser, bye: false, round, third, script };
  }

  // Early rounds play side by side, then the semi-finals, third-place match and final each get
  // the whole screen. Times are planned up front so the game always fits its length.
  schedule() {
    const R = this.roundCount, steps = [];
    const featuredRounds = Math.min(2, R);
    const early = R - featuredRounds;
    const featured = [];
    for (let r = early; r < R; r++) for (const m of this.rounds[r]) if (!m.bye) featured.push(m);
    // Put the third-place match just before the final.
    if (this.third && !this.third.bye) featured.splice(featured.length - 1, 0, this.third);
    const usable = this.target * 0.95;
    const earlyShare = early ? Math.min(0.45, 0.12 * early) : 0;
    const roundTime = early ? Math.max(2.2, Math.min(6, usable * earlyShare / early)) : 0;
    const duelTime = featured.length ? Math.max(2.6, Math.min(12, (usable - roundTime * early) / featured.length)) : 0;
    let t = 0;
    for (let r = 0; r < early; r++) { steps.push({ kind: 'round', round: r, start: t, end: t + roundTime }); t += roundTime; }
    for (const m of featured) { steps.push({ kind: 'duel', match: m, start: t, end: t + duelTime }); t += duelTime; }
    if (!steps.length) steps.push({ kind: 'round', round: 0, start: 0, end: 2.5 });
    this.steps = steps;
    this.finishAt = Math.max(t, steps.at(-1).end);
  }

  // Slots in final standing: champion, runner-up, third, fourth, then by how far they got.
  ranking() {
    const top = [this.champion, this.runnerUp];
    if (this.third) { top.push(this.third.winner); if (this.third.loser >= 0) top.push(this.third.loser); }
    const placed = new Set(top.filter(s => s >= 0));
    const rest = [];
    for (let s = 0; s < this.n; s++) if (!placed.has(s)) rest.push(s);
    rest.sort((x, y) => (this.out.get(y) ?? -1) - (this.out.get(x) ?? -1) || x - y);
    return [...top.filter(s => s >= 0), ...rest];
  }
}

export function preRunBracket(n, seed, length, count = 1) {
  const sim = new BracketSim(n, seed, length, count);
  return { winSlots: sim.winSlots, finishAt: sim.finishAt };
}
