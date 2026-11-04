// Original chiptune tracks for the game modes, written for SpinDraw and synthesised live with
// the Web Audio API: two pulse channels, a triangle bass and noise drums, like an old console.
// No audio files, so nothing to download and nothing to license.

const NOTE = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
export const CHORDS = {
  C: ['C', 'E', 'G'], D: ['D', 'F#', 'A'], Dm: ['D', 'F', 'A'], E: ['E', 'G#', 'B'], F: ['F', 'A', 'C'], G: ['G', 'B', 'D'],
  A7: ['A', 'C#', 'E', 'G'], Am: ['A', 'C', 'E'], Bm: ['B', 'D', 'F#'],
};
const midi = name => { const m = name.match(/^([A-G]#?)(\d)$/); return NOTE[m[1]] + (Number(m[2]) + 1) * 12; };
const hz = n => 440 * 2 ** ((n - 69) / 12);

// Each bar: [chord, lead]. In the lead, a note starts, "." holds it and "-" is silence.
export const SONGS = {
  // Bright and bouncy, with a bass that hops between octaves.
  race: {
    bpm: 168, stepsPerBeat: 4, feel: 'bounce', order: ['A', 'A', 'B', 'A'],
    sections: {
      A: [
        ['C', 'E5 . G5 - C6 . G5 - E5 . G5 . G5 - A5 -'],
        ['G', 'B5 . G5 - D5 . G5 - B5 . D6 . B5 - G5 -'],
        ['Am', 'C6 . A5 - E5 . A5 - C6 . E6 . C6 - A5 -'],
        ['F', 'A5 . F5 - C5 . F5 - A5 . C6 . A5 - G5 -'],
        ['C', 'E5 . G5 - C6 . E6 - G6 . E6 . C6 - G5 -'],
        ['G', 'D6 . B5 - G5 . B5 - D6 . G6 . D6 - B5 -'],
        ['F', 'C6 . A5 - F5 . A5 - C6 . F6 . E6 - D6 -'],
        ['G', 'B5 . D6 . G6 . . . G6 - F6 - E6 - D6 -'],
      ],
      B: [
        ['Am', 'A5 - A5 - C6 - A5 - E6 . D6 . C6 . B5 .'],
        ['F', 'A5 - A5 - C6 - A5 - F6 . E6 . D6 . C6 .'],
        ['C', 'G5 - G5 - C6 - G5 - E6 . D6 . C6 . E6 .'],
        ['G', 'D6 . . . B5 . G5 . D6 - G6 - - - - -'],
        ['Am', 'C6 . E6 . A6 . E6 . C6 . E6 . A6 - G6 -'],
        ['F', 'A5 . C6 . F6 . C6 . A5 . C6 . F6 - E6 -'],
        ['Dm', 'D6 . F6 . A6 . F6 . D6 . F6 . A6 - G6 -'],
        ['G', 'G6 . F6 . D6 . B5 . G5 - B5 - D6 - F6 -'],
      ],
    },
  },
  // A gallop: everything rides a da-da-DUM rhythm, with a bugle-style fanfare in the middle.
  horse: {
    bpm: 168, stepsPerBeat: 3, feel: 'gallop', order: ['A', 'A', 'B', 'A'],
    sections: {
      A: [
        ['D', 'A5 . F#5 A5 . D6 F#6 . . D6 . A5'],
        ['A7', 'E6 . C#6 E6 . A6 G6 . . E6 . C#6'],
        ['Bm', 'D6 . B5 D6 . F#6 B6 . . F#6 . D6'],
        ['G', 'B5 . G5 B5 . D6 G6 . . D6 . B5'],
        ['D', 'F#6 . D6 F#6 . A6 D7 . . A6 . F#6'],
        ['A7', 'E6 . G6 E6 . C#6 A5 . . C#6 . E6'],
        ['G', 'D6 . B5 G5 . B5 D6 . . G6 . B5'],
        ['A7', 'A5 C#6 E6 A6 . . E6 C#6 A5 E6 . .'],
      ],
      B: [
        ['Bm', 'F#6 F#6 F#6 F#6 . . D6 D6 D6 D6 . .'],
        ['G', 'D6 D6 D6 D6 . . B5 B5 B5 B5 . .'],
        ['D', 'A5 A5 A5 A5 . . D6 D6 D6 F#6 . .'],
        ['A7', 'E6 E6 E6 E6 . . G6 . E6 C#6 . A5'],
        ['Bm', 'F#6 . E6 D6 . C#6 B5 . C#6 D6 . F#6'],
        ['G', 'G6 . F#6 E6 . D6 B5 . D6 G6 . B6'],
        ['D', 'A6 . F#6 D6 . F#6 A6 . F#6 D6 . A5'],
        ['A7', 'E6 . C#6 A5 . C#6 E6 . G6 A6 . .'],
      ],
    },
  },
  // Dark and driving: a minor key over a pumping bass, with hard stabs in the middle.
  battle: {
    bpm: 176, stepsPerBeat: 4, feel: 'drive', order: ['A', 'A', 'B', 'A'],
    sections: {
      A: [
        ['Am', 'A5 . . E5 A5 . C6 . E6 . . D6 C6 . B5 .'],
        ['F', 'A5 . . F5 A5 . C6 . F6 . . E6 C6 . A5 .'],
        ['G', 'G5 . . D5 G5 . B5 . D6 . . C6 B5 . G5 .'],
        ['E', 'G#5 . . E5 G#5 . B5 . E6 . . D6 B5 . G#5 .'],
        ['Am', 'A5 . . E5 A5 . C6 . E6 . . F6 E6 . C6 .'],
        ['F', 'C6 . . A5 C6 . F6 . A6 . . G6 F6 . C6 .'],
        ['Dm', 'D6 . . A5 D6 . F6 . A6 . . F6 D6 . A5 .'],
        ['E', 'E6 . D6 C6 B5 . G#5 . E5 . G#5 . B5 . E6 .'],
      ],
      B: [
        ['Am', 'A6 . - A6 - - E6 . A6 . - G6 - - E6 .'],
        ['F', 'F6 . - F6 - - C6 . F6 . - E6 - - C6 .'],
        ['C', 'G6 . - G6 - - E6 . G6 . - F6 - - E6 .'],
        ['G', 'D6 . - D6 - - B5 . G5 - B5 - D6 - F6 -'],
        ['Am', 'C6 E6 A6 E6 C6 E6 A6 E6 C6 E6 A6 E6 C6 E6 A6 E6'],
        ['F', 'C6 F6 A6 F6 C6 F6 A6 F6 C6 F6 A6 F6 C6 F6 A6 F6'],
        ['Dm', 'D6 F6 A6 F6 D6 F6 A6 F6 D6 F6 A6 F6 D6 F6 A6 F6'],
        ['E', 'E6 G#6 B6 G#6 E6 G#6 B6 G#6 E6 . . . E5 . . .'],
      ],
    },
  },
};

const pitch = (name, octave) => midi(`${name}${octave}`);

// Backing parts come from the chord, so they always fit the melody.
function backing(feel, chord, steps, intense) {
  const [root, third, fifth] = CHORDS[chord], tones = [root, third, fifth, third];
  const bass = [], arp = [], drums = [];
  for (let s = 0; s < steps; s++) {
    if (feel === 'bounce') {
      if (s % 2 === 0) bass.push([s, pitch(root, s % 4 === 0 ? 2 : 3), 1.6]);
      arp.push([s, pitch(tones[s % 4], 5), 0.8]);
      if (s % 8 === 0) drums.push([s, 'k']);
      if (s % 8 === 4) drums.push([s, 's']);
      if (s % 2 === (intense ? s % 2 : 0)) drums.push([s, 'h']);
    } else if (feel === 'gallop') {
      if (s % 3 !== 1) bass.push([s, pitch(s % 6 < 3 ? root : fifth, 2), s % 3 === 2 ? 1.6 : 0.9]);
      if (s % 3 === 2) arp.push([s, pitch(tones[(s - 2) / 3 % 4], 5), 1.4]);
      if (s % 6 === 0) drums.push([s, 'k']);
      if (s % 6 === 3) drums.push([s, 's']);
      if (s % 3 !== 1 || intense) drums.push([s, 'h']);
    } else {
      bass.push([s, pitch(root, s % 8 === 6 || s % 8 === 7 ? 3 : 2), 0.8]);
      arp.push([s, pitch(tones[s % 4], 4), 0.8]);
      if (s % 16 === 0 || s % 16 === 3 || s % 16 === 8 || s % 16 === 11) drums.push([s, 'k']);
      if (s % 8 === 4) drums.push([s, 's']);
      if (s % 2 === 0 || intense) drums.push([s, 'h']);
    }
  }
  return { bass, arp, drums };
}

function leadNotes(line) {
  const t = line.trim().split(/\s+/), out = [];
  t.forEach((tok, i) => {
    if (tok === '.' || tok === '-') return;
    let len = 1;
    while (t[i + len] === '.') len++;
    out.push([i, midi(tok), len]);
  });
  return { notes: out, steps: t.length };
}

const pulseWaves = new WeakMap();
function pulse(ctx, duty) {
  let set = pulseWaves.get(ctx);
  if (!set) pulseWaves.set(ctx, set = {});
  if (set[duty]) return set[duty];
  const real = new Float32Array(32), imag = new Float32Array(32);
  for (let n = 1; n < 32; n++) imag[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * duty);
  return (set[duty] = ctx.createPeriodicWave(real, imag));
}

const noises = new WeakMap();
function noise(ctx) {
  let b = noises.get(ctx);
  if (b) return b;
  b = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const d = b.getChannelData(0);
  let reg = 1, v = 1, hold = 0;
  for (let i = 0; i < d.length; i++) {           // the 1-bit shift register old consoles used
    if (hold-- <= 0) { const bit = (reg ^ (reg >> 1)) & 1; reg = (reg >> 1) | (bit << 14); v = bit ? 1 : -1; hold = 2; }
    d[i] = v;
  }
  noises.set(ctx, b);
  return b;
}

function voice(ctx, dest, wave, freq, at, len, vol) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  if (wave === 'triangle') o.type = 'triangle'; else o.setPeriodicWave(pulse(ctx, wave));
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, at);
  g.gain.linearRampToValueAtTime(vol, at + 0.004);
  g.gain.setValueAtTime(vol * 0.8, at + Math.max(0.01, len * 0.5));
  g.gain.linearRampToValueAtTime(0, at + len);
  o.connect(g).connect(dest);
  o.start(at);
  o.stop(at + len + 0.01);
}

function drum(ctx, dest, kind, at) {
  if (kind === 'k') {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.setValueAtTime(150, at);
    o.frequency.exponentialRampToValueAtTime(45, at + 0.09);
    g.gain.setValueAtTime(0.5, at);
    g.gain.linearRampToValueAtTime(0, at + 0.11);
    o.connect(g).connect(dest);
    o.start(at);
    o.stop(at + 0.12);
    return;
  }
  const s = ctx.createBufferSource(), g = ctx.createGain(), f = ctx.createBiquadFilter(), hat = kind === 'h', len = hat ? 0.035 : 0.12;
  s.buffer = noise(ctx);
  f.type = hat ? 'highpass' : 'bandpass';
  f.frequency.value = hat ? 7000 : 2200;
  g.gain.setValueAtTime(hat ? 0.09 : 0.26, at);
  g.gain.linearRampToValueAtTime(0, at + len);
  s.connect(f).connect(g).connect(dest);
  s.start(at);
  s.stop(at + len + 0.01);
}

// Schedules one bar and returns when the next one starts.
export function scheduleBar(ctx, dest, song, [chord, line], at, intense = false) {
  const lift = intense ? 2 : 0;                   // the finish goes up a step and a little faster
  const stepLen = 60 / (song.bpm * (intense ? 1.12 : 1)) / song.stepsPerBeat;
  const { notes, steps } = leadNotes(line);
  const { bass, arp, drums } = backing(song.feel, chord, steps, intense);
  const leadWave = song.feel === 'drive' ? 0.25 : 0.5;
  for (const [s, n, len] of notes) voice(ctx, dest, leadWave, hz(n + lift), at + s * stepLen, Math.max(0.05, len * stepLen * 0.92), 0.17);
  for (const [s, n, len] of arp) voice(ctx, dest, 0.125, hz(n + lift), at + s * stepLen, len * stepLen, intense ? 0.075 : 0.055);
  for (const [s, n, len] of bass) voice(ctx, dest, 'triangle', hz(n + lift), at + s * stepLen, len * stepLen, 0.36);
  for (const [s, kind] of drums) drum(ctx, dest, kind, at + s * stepLen);
  return at + steps * stepLen;
}

export const songBars = song => song.order.flatMap(name => song.sections[name]);

// A short winner's jingle for each game: a bouncy climb, a bugle call, a heroic sting.
const JINGLES = {
  race: { lead: 0.5, step: 0.075, notes: [['C5', 0, 1], ['E5', 1, 1], ['G5', 2, 1], ['C6', 3, 1], ['E6', 4, 1], ['G6', 5, 1], ['C7', 6, 2], ['G6', 8, 1], ['C7', 9, 7]], bass: [['C3', 0, 3], ['G3', 3, 3], ['C4', 6, 3], ['C3', 9, 7]] },
  horse: { lead: 0.25, step: 0.1, notes: [['G5', 0, 1], ['C6', 1, 1], ['E6', 2, 1], ['G6', 3, 2], ['E6', 5, 1], ['G6', 6, 8]], bass: [['C3', 0, 3], ['G3', 3, 3], ['C3', 6, 3], ['C4', 9, 5]] },
  battle: { lead: 0.25, step: 0.12, notes: [['A5', 0, 1], ['C6', 1, 1], ['E6', 2, 1], ['F6', 3, 2], ['G6', 5, 2], ['C7', 7, 7]], bass: [['A2', 0, 3], ['F2', 3, 2], ['G2', 5, 2], ['C3', 7, 7]] },
};

export function scheduleJingle(ctx, dest, mode, at) {
  const j = JINGLES[mode];
  if (!j) return at;
  let end = at;
  for (const [n, s, len] of j.notes) {
    voice(ctx, dest, j.lead, hz(midi(n)), at + s * j.step, len * j.step * 0.95, 0.2);
    voice(ctx, dest, 0.125, hz(midi(n) - 12), at + s * j.step, len * j.step * 0.95, 0.09);
    end = Math.max(end, at + (s + len) * j.step);
  }
  for (const [n, s, len] of j.bass) voice(ctx, dest, 'triangle', hz(midi(n)), at + s * j.step, len * j.step * 0.95, 0.36);
  drum(ctx, dest, 'k', at);
  drum(ctx, dest, 's', at + (j.notes.at(-1)[1]) * j.step);
  return end;
}

// Plays a mode's track on a loop until stopped. tension() moves it to its faster finish.
export function createMusicPlayer(getContext, volume = 0.55) {
  let run = null;
  return {
    get playing() { return !!run; },
    start(mode) {
      this.stop();
      const song = SONGS[mode];
      if (!song) return;
      const ctx = getContext(), master = ctx.createGain();
      master.gain.value = volume;
      master.connect(ctx.destination);
      const bars = songBars(song);
      const me = run = { ctx, master, intense: false, bar: 0, next: ctx.currentTime + 0.06 };
      const pump = () => {
        // Timers slow down in background tabs, so plan further ahead there.
        const ahead = document.hidden ? 1.6 : 0.3;
        while (me.next < ctx.currentTime + ahead) {
          me.next = scheduleBar(ctx, master, song, bars[me.bar % bars.length], me.next, me.intense);
          me.bar++;
        }
      };
      pump();
      me.timer = setInterval(pump, 60);
    },
    tension() { if (run) run.intense = true; },
    stop() {
      if (!run) return;
      const { ctx, master, timer } = run;
      clearInterval(timer);
      run = null;
      master.gain.cancelScheduledValues(ctx.currentTime);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.12);
      setTimeout(() => master.disconnect(), 200);
    },
  };
}
