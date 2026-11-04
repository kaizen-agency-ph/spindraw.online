// Hand-authored 16×16 pixel fighters, composed from layers (body, legs, hat, weapon) and
// coloured from a hash of the name, so a lobby of 100 reads as 100 different people.
// Keys: k outline · s skin · c/C cloth · b boots · h/H hat · m/M metal · w wood · y gold

const HEAD = [[2, '.....kkkkkk.....'], [3, '....kssssssk....'], [4, '....kssssssk....'], [5, '....kssskskk....'], [6, '....kssssssk....'], [7, '.....kkkkkk.....']];
const TORSO = [[8, '....kcccccck....'], [9, '...kscccccCsk...'], [10, '...kscccccCsk...'], [11, '....kCCCCCCk....']];
const LEGS = {
  idle: [[12, '....kccckcck....'], [13, '....kCCkkCCk....'], [14, '....kbbkkbbk....'], [15, '....kkkkkkkk....']],
  walk1: [[12, '....kcckccck....'], [13, '...kCCk.kCCk....'], [14, '...kbbk.kbbk....'], [15, '...kkkk.kkkk....']],
  walk2: [[12, '....kccckcck....'], [13, '.....kCCkCCk....'], [14, '.....kbbkbbk....'], [15, '.....kkkkkkk....']],
};
const DEAD = [[10, '..kkkkkkkkkkkk..'], [11, '.kssskccccccbbk.'], [12, '.kskskCCCCCCbbk.'], [13, '..kkkkkkkkkkkk..']];

const HATS = [
  [[1, '.....kkkkkk.....'], [2, '....kmmmmmmk....'], [3, '...kmmmmmmmmk...'], [4, '...kMMMMMMMMk...']],     // helmet
  [[1, '.....kkkkkk.....'], [2, '....khhhhhhk....'], [3, '...khhhhhhhhk...'], [4, '...khhHsssshk...']],     // hood
  [[0, '.......kk.......'], [1, '......khhk......'], [2, '.....khhhhk.....'], [3, '...kkkkkkkkkk...'], [4, '...kyyyyyyyyk...']], // wizard
  [[1, '....ky.yy.yk....'], [2, '....kyyyyyyk....']],                                                        // crown
  [[1, '....k.kk.kk.....'], [2, '....khhhhhhk....'], [3, '....khhhhhhk....']],                               // spiky hair
  [[2, '.....khhhhk.....'], [3, '....khhhhhhkkk..']],                                                        // cap
];

const WEAPONS = [
  { // sword
    idle: [[4, '.............k..'], [5, '............kmk.'], [6, '............kmk.'], [7, '............kmk.'], [8, '...........kyyyk'], [9, '............kwk.'], [10, '............kwk.']],
    attack: [[8, '...........kkkkk'], [9, '..........kymmmm'], [10, '...........kkkkk']],
  },
  { // axe
    idle: [[4, '...........kkkk.'], [5, '..........kmmmk.'], [6, '..........kmmMk.'], [7, '...........kwkk.'], [8, '............kwk.'], [9, '............kwk.'], [10, '............kwk.']],
    attack: [[7, '...........kkkk.'], [8, '...........kmmmk'], [9, '..........kwkmmk'], [10, '..........kkkkk.']],
  },
  { // staff
    idle: [[3, '............kyyk'], [4, '............kyyk'], [5, '.............kw.'], [6, '.............kw.'], [7, '.............kw.'], [8, '.............kw.'], [9, '.............kw.'], [10, '.............kw.']],
    attack: [[7, '............kkkk'], [8, '............kyyy'], [9, '..........kwwkyy'], [10, '............kkkk']],
  },
];

// Exported so the tests can check every row is exactly 16 pixels wide.
export const ALL_GRIDS = [HEAD, TORSO, DEAD, ...Object.values(LEGS), ...HATS, ...WEAPONS.flatMap(w => [w.idle, w.attack])];

const SKIN = ['#ffd9b3', '#f2c094', '#d9a06b', '#b5794a', '#8a5a34', '#5e3d24'];
const CLOTH = [['#e63946', '#a4202c'], ['#3a86ff', '#1f57b3'], ['#2ec4b6', '#178a7f'], ['#ff9f1c', '#b86e08'], ['#9b5de5', '#6b37ab'], ['#43aa3b', '#2a7524'], ['#f15bb5', '#a83480'], ['#577590', '#37506a'], ['#f4f1e8', '#b9b5a6'], ['#3d3d46', '#24242b']];
const HAIR = [['#2b1b12', '#160d08'], ['#6b4226', '#472a17'], ['#d9a441', '#a5772a'], ['#c0392b', '#872619'], ['#e8e4d8', '#a9a598'], ['#3a86ff', '#1f57b3'], ['#2f9e44', '#1f6d2f']];

export function hashName(name) {
  let h = 0x811c9dc5;
  for (const ch of String(name)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}

const cache = new Map();

// Returns { idle, walk1, walk2, attack, dead } canvases (16×16) for one name.
export function framesFor(name) {
  const h = hashName(name);
  const hat = h % HATS.length, weapon = (h >>> 3) % WEAPONS.length;
  const skin = SKIN[(h >>> 5) % SKIN.length], [c, C] = CLOTH[(h >>> 8) % CLOTH.length], [hc, HC] = HAIR[(h >>> 12) % HAIR.length];
  const key = [hat, weapon, skin, c, hc].join();
  if (cache.has(key)) return cache.get(key);
  const pal = { k: '#16171d', s: skin, c, C, b: '#3b2a20', h: hc, H: HC, m: '#cfd6df', M: '#8c95a3', w: '#8a5a2b', y: '#ffd23f' };
  const paint = rows => {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 16;
    const g = cv.getContext('2d');
    for (const layer of rows) for (const [y, line] of layer) for (let x = 0; x < 16; x++) {
      const ch = line[x];
      if (ch !== '.') { g.fillStyle = pal[ch]; g.fillRect(x, y, 1, 1); }
    }
    return cv;
  };
  const up = (legs, w) => [TORSO, LEGS[legs], HEAD, HATS[hat], w];
  const set = {
    idle: paint(up('idle', WEAPONS[weapon].idle)),
    walk1: paint(up('walk1', WEAPONS[weapon].idle)),
    walk2: paint(up('walk2', WEAPONS[weapon].idle)),
    attack: paint(up('idle', WEAPONS[weapon].attack)),
    dead: paint([DEAD]),
  };
  cache.set(key, set);
  return set;
}

// Grass, dirt patches, stones and a water border, drawn once per arena size.
export function paintArena(W, H, rng) {
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const g = cv.getContext('2d');
  const T = 16;
  for (let y = 0; y < H; y += T) for (let x = 0; x < W; x += T) {
    g.fillStyle = (x / T + y / T) % 2 ? '#4f8a3c' : '#4a8338';
    g.fillRect(x, y, T, T);
    for (let i = 0; i < 3; i++) { g.fillStyle = rng() < 0.5 ? '#5c9a47' : '#42762f'; g.fillRect(x + Math.floor(rng() * 15), y + Math.floor(rng() * 15), 1, 2); }
  }
  const patches = Math.round(W * H / 26000);
  for (let p = 0; p < patches; p++) {
    const px = Math.floor(rng() * W / T) * T, py = Math.floor(rng() * H / T) * T, n = 3 + Math.floor(rng() * 5);
    for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? '#9c7a4a' : '#8f6f42'; g.fillRect(px + Math.floor(rng() * 3) * T, py + Math.floor(rng() * 3) * T, T, T); }
  }
  const stones = Math.round(W * H / 5000);
  for (let s = 0; s < stones; s++) {
    const x = Math.floor(rng() * W), y = Math.floor(rng() * H);
    g.fillStyle = '#8a8f98'; g.fillRect(x, y, 3, 2);
    g.fillStyle = '#b4b9c1'; g.fillRect(x, y, 2, 1);
  }
  for (let x = 0; x < W; x += 2) { for (const y of [0, H - 8]) { g.fillStyle = (x + y) % 4 ? '#2f6fb0' : '#3a83c9'; g.fillRect(x, y, 2, 8); } }
  for (let y = 0; y < H; y += 2) { for (const x of [0, W - 8]) { g.fillStyle = (x + y) % 4 ? '#2f6fb0' : '#3a83c9'; g.fillRect(x, y, 8, 2); } }
  return cv;
}
