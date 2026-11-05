// Seasonal themes. Purely cosmetic data: nothing here (or in the simulations) lets a theme affect
// a result, because the sims never see it. Sprite rows are built by at(), which pads each one to
// the exact width, so a miscounted row can't shift a sprite.

const at = width => (y, x, pixels) => [y, '.'.repeat(x) + pixels + '.'.repeat(Math.max(0, width - x - pixels.length))];
const f = at(16), h = at(28);   // fighter rows, horse rows

// Extra colours shared by every seasonal sprite (on top of each sprite's own palette keys).
export const SPRITE_PAL = {
  W: '#f8f8f4', x: '#c9ccd1', r: '#d7263d', R: '#8f1626', g: '#2f9e44', G: '#1b5e2a', o: '#ff8c1a', O: '#b85c00',
  p: '#ff8fb1', P: '#d9487a', u: '#7b2cbf', U: '#4a1a78', t: '#b98a52', T: '#7a5730', l: '#a6e22e', e: '#ff2e2e', d: '#ffc72c', D: '#b98900', B: '#46b1ff',
};
const pals = {
  skin: ['#ffd9b3', '#f2c094', '#d9a06b', '#b5794a', '#8a5a34', '#5e3d24'],
  hair: [['#2b1b12', '#160d08'], ['#6b4226', '#472a17'], ['#d9a441', '#a5772a'], ['#c0392b', '#872619']],
};

// ---------- fighter pieces (16×16) ----------
const HAT = {
  witch: [f(0, 7, 'kk'), f(1, 6, 'kuuk'), f(2, 5, 'kuuuuk'), f(3, 3, 'kkkkkkkkkk'), f(4, 3, 'kUUUUUUUUk')],
  pumpkin: [f(1, 7, 'gg'), f(2, 5, 'kkkkkk'), f(3, 4, 'koooooOk'), f(4, 4, 'kokookOk'), f(5, 4, 'koooooOk'), f(6, 4, 'kokkkkOk'), f(7, 5, 'kkkkkk')],
  skull: [f(2, 5, 'kkkkkk'), f(3, 4, 'kWWWWWWk'), f(4, 4, 'kkkWkkWk'), f(5, 4, 'kkkWkkWk'), f(6, 4, 'kWWWWWWk'), f(7, 5, 'kWkWkk')],
  vampire: [f(1, 5, 'kkkkkk'), f(2, 4, 'kkkkkkkk'), f(3, 4, 'kkkkkkkk'), f(7, 5, 'kWkkWk')],
  santa: [f(0, 13, 'WW'), f(1, 7, 'kkkk'), f(1, 12, 'kWW'), f(2, 6, 'krrrrkkrk'), f(3, 4, 'kWWWWWWWWk')],
  elf: [f(0, 12, 'kdk'), f(1, 10, 'kgGk'), f(2, 5, 'kkkkgggk'), f(3, 4, 'kggggggGk'), f(4, 4, 'krrrrrrk')],
  antlers: [f(0, 3, 't.t....t.t'), f(1, 3, 'ttt....ttt'), f(2, 4, 't.kkkk.t'), f(3, 5, 't....t')],
  party: [f(0, 8, 'd'), f(1, 7, 'kpk'), f(2, 6, 'kdppk'), f(3, 5, 'kpddpk'), f(4, 4, 'kddddddk')],
  tophat: [f(0, 5, 'kkkkkk'), f(1, 5, 'kkkkkk'), f(2, 5, 'kddddk'), f(3, 3, 'kkkkkkkkkk')],
  tiara: [f(2, 5, 'd.dd.d'), f(3, 4, 'kddddddk')],
  heart: [f(0, 5, 'rr.rr'), f(1, 4, 'rrrrrrr'), f(2, 5, 'rrrrr'), f(3, 4, 'kPPrPPPk')],
  cupid: [f(1, 5, 'kddddk'), f(2, 4, 'kWWWWWWk'), f(3, 4, 'kWWWWWWk')],
  bow: [f(2, 3, 'pp.kkkk.pp'), f(3, 3, 'pPpPPPPpPp')],
  bunny: [f(0, 5, 'WW..WW'), f(1, 5, 'Wp..pW'), f(2, 5, 'Wp..pW'), f(3, 4, 'kWWWWWWk')],
  chick: [f(1, 6, 'kddk'), f(2, 5, 'kddddk'), f(3, 4, 'kddddddk'), f(4, 4, 'kddoodk')],
  flowers: [f(2, 4, 'p.d.p.d.'), f(3, 4, 'kgggggGk')],
  straw: [f(1, 5, 'kttttk'), f(2, 3, 'kkttttttkk'), f(3, 2, 'kttttttttttk'), f(4, 4, 'krrrrrrk')],
  shades: [f(4, 4, 'kkkkkkkk'), f(5, 4, 'kkkskkkk')],
  bandana: [f(2, 5, 'kBBBBk'), f(3, 4, 'kBBBBBBk'), f(4, 3, 'kkkkkkkkk')],
};
const swing = (a, b, c) => [f(8, 11, a), f(9, 10, b), f(10, 11, c)];
const WEAPON = {
  scythe: { idle: [f(3, 9, 'kkkkkk'), f(4, 9, 'kxxxxxk'), f(5, 13, 'kwk'), f(6, 13, 'kwk'), f(7, 13, 'kwk'), f(8, 13, 'kwk'), f(9, 13, 'kwk'), f(10, 13, 'kwk')], attack: swing('kkkkk', 'kwwxxx', 'kkkkk') },
  lantern: { idle: [f(3, 12, 'kk'), f(4, 11, 'koook'), f(5, 11, 'kokok'), f(6, 11, 'koook'), f(7, 12, 'kwk'), f(8, 12, 'kwk'), f(9, 12, 'kwk'), f(10, 12, 'kwk')], attack: swing('kkkkk', 'kwwooo', 'kkkkk') },
  candy: { idle: [f(3, 11, 'krWrk'), f(4, 11, 'kWkrk'), f(5, 11, 'krk'), f(6, 11, 'kWk'), f(7, 11, 'krk'), f(8, 11, 'kWk'), f(9, 11, 'krk'), f(10, 11, 'kWk')], attack: swing('kkkkk', 'krWrWr', 'kkkkk') },
  tree: { idle: [f(3, 12, 'kdk'), f(4, 11, 'kgGk'), f(5, 10, 'kgGgGk'), f(6, 11, 'kgGk'), f(7, 10, 'kgGgGk'), f(8, 12, 'kk'), f(9, 12, 'kw'), f(10, 12, 'kw')], attack: swing('kkkkk', 'kwwggg', 'kkkkk') },
  sparkler: { idle: [f(2, 11, 'd.d'), f(3, 12, 'W'), f(4, 11, 'd.d'), f(5, 12, 'x'), f(6, 12, 'x'), f(7, 12, 'x'), f(8, 12, 'x'), f(9, 12, 'x'), f(10, 12, 'x')], attack: swing('kxxxd', 'xxxxWd', 'kxxxd') },
  popper: { idle: [f(4, 11, 'p.d.B'), f(5, 12, 'kkk'), f(6, 12, 'kdk'), f(7, 12, 'kpk'), f(8, 12, 'kdk'), f(9, 12, 'kpk'), f(10, 12, 'kkk')], attack: swing('kkk.d', 'kdpdpB', 'kkk.p') },
  heartwand: { idle: [f(3, 11, 'r.r'), f(4, 10, 'rrrrr'), f(5, 11, 'rrr'), f(6, 12, 'r'), f(7, 12, 'kw'), f(8, 12, 'kw'), f(9, 12, 'kw'), f(10, 12, 'kw')], attack: swing('r.r.r', 'kwwrrr', 'r.r.r') },
  arrow: { idle: [f(3, 12, 'rk'), f(4, 12, 'kr'), f(5, 12, 'kW'), f(6, 12, 'kW'), f(7, 12, 'kW'), f(8, 12, 'kW'), f(9, 12, 'kW'), f(10, 11, 'pkp')], attack: swing('.....', 'pWWWWr', '.....') },
  carrot: { idle: [f(3, 11, 'g.g'), f(4, 12, 'g'), f(5, 11, 'kook'), f(6, 11, 'kOok'), f(7, 12, 'kok'), f(8, 12, 'kOk'), f(9, 13, 'o')], attack: swing('kkkkk', 'gkooOo', 'kkkkk') },
  eggwand: { idle: [f(3, 12, 'kk'), f(4, 11, 'kWWk'), f(5, 11, 'kpBk'), f(6, 11, 'kWWk'), f(7, 12, 'kk'), f(8, 12, 'kw'), f(9, 12, 'kw'), f(10, 12, 'kw')], attack: swing('kkkkk', 'kwwWpB', 'kkkkk') },
  surfboard: { idle: [f(1, 12, 'kk'), f(2, 11, 'kBBk'), f(3, 11, 'kBWk'), f(4, 11, 'kBWk'), f(5, 11, 'kBWk'), f(6, 11, 'kBWk'), f(7, 11, 'kBWk'), f(8, 11, 'kBBk'), f(9, 12, 'kk')], attack: swing('kkkkk', 'kBWBWB', 'kkkkk') },
  waterblaster: { idle: [f(6, 10, 'kkkkk'), f(7, 10, 'koooBk'), f(8, 10, 'kkkook'), f(9, 12, 'kok'), f(10, 12, 'kkk')], attack: swing('kkkkk', 'koooBB', 'kkkok') },
};

// ---------- horse pieces (28×20) ----------
const RIDER = {
  santa: [h(0, 8, 'W.rrrrrr'), h(1, 11, 'WWWWWW')],
  witch: [h(0, 11, 'kuuuuk'), h(1, 9, 'kkkkkkkkkk')],
  party: [h(0, 13, 'dpd'), h(1, 12, 'pdpdp')],
  heart: [h(0, 11, 'rr.rr'), h(1, 11, 'rrrrr')],
  bunny: [h(0, 12, 'W..W'), h(1, 11, 'kWWWWk')],
  straw: [h(0, 12, 'tttt'), h(1, 9, 'tttttttttt')],
};
const HORSE_OVERLAY = {
  // antlers above the ears and a shiny red nose
  christmas: [...RIDER.santa, h(0, 18, 't.t...t.t'), h(1, 18, 'ttt...ttt'), h(2, 19, 't.....t'), h(3, 19, 't'), h(3, 25, 't'), h(6, 25, 'r'), h(7, 25, 'rr')],
  // bare ribs and a glowing eye on a bone-white coat
  halloween: [...RIDER.witch, h(5, 21, 'e'), h(9, 15, 'k.k.k'), h(10, 15, 'k.k.k'), h(11, 15, 'k.k.k')],
  newyear: [...RIDER.party, h(4, 19, 'd.d.d'), h(9, 15, 'd.d.d'), h(13, 7, 'd...d...d')],
  valentines: [...RIDER.heart, h(10, 10, 'r.r'), h(11, 9, 'rrrrr'), h(12, 10, 'rrr')],
  easter: [...RIDER.bunny, h(0, 20, 'W.W'), h(1, 20, 'W.W'), h(2, 20, 'p.p'), h(3, 20, 'p.p')],
  summer: [...RIDER.straw, h(2, 13, 'kkk'), h(9, 17, 'p'), h(8, 18, 'd'), h(9, 19, 'B'), h(10, 18, 'p')],
};

const SEASON_LIST = {
  none: {
    label: 'Off',
    race: { bg: '#171a21', depth: '#1d2129', peg: '#6b7385', wall: '#4a5162', bump: '#ff5d73', ring: '#ffd23f', rot: '#2ec4b6', mover: '#3a86ff', pin: '#e8e4d8', ball: 'plain' },
    horse: { noun: 'horse', sky: '#8fc7ea', hill: '#6fa85a', turf: '#3f7d34', stripes: ['#4f8a3c', '#47803a'], rail: '#f4f1e8', stall: '#c0392b', dust: 'rgba(214,190,140,.55)', stand: '#5b6170', roof: ['#e8e4d8', '#c0392b'], shirts: ['#e63946', '#3a86ff', '#ffd23f', '#2ec4b6', '#f4f1e8', '#ff9f1c', '#9b5de5', '#43aa3b'], feature: null },
    arena: { ground: ['#4f8a3c', '#4a8338'], speck: ['#5c9a47', '#42762f'], patch: ['#9c7a4a', '#8f6f42'], stone: ['#8a8f98', '#b4b9c1'], border: ['#2f6fb0', '#3a83c9'], props: 'stones' },
    accent: '#ffd23f', weather: null,
  },
  halloween: {
    label: 'Halloween', accent: '#ff8c1a', weather: 'bats',
    colors: ['#ff7a1a', '#7b2cbf', '#ffb347', '#f2e8cf', '#c1121f', '#6e6a78'], wheel: { rim: '#1a1320', pointer: '#ff7a1a', hub: '#2b1b3d' },
    race: { bg: '#15101d', depth: '#1f1729', peg: '#7b6f8c', wall: '#4c3a63', bump: '#ff7a1a', ring: '#a6e22e', rot: '#a6e22e', mover: '#7b2cbf', pin: '#f2e8cf', ball: 'pumpkin' },
    horse: { noun: 'horse', sky: '#1d1433', hill: '#2d2144', turf: '#2c2b23', stripes: ['#38372b', '#32312a'], rail: '#8d8799', stall: '#ff7a1a', dust: 'rgba(166,226,46,.45)', stand: '#2a2433', roof: ['#ff7a1a', '#1a1320'], shirts: ['#ff7a1a', '#7b2cbf', '#a6e22e', '#f2e8cf', '#3a3540'], feature: 'moon',
      coats: [['#e9e4d4', '#b5ae98', '#3a3540'], ['#c9c4b8', '#8f8a7c', '#14101a'], ['#7f6aa8', '#5a4680', '#2d2a32']], silks: [['#7b2cbf', '#4a1a78', '#ff7a1a'], ['#ff7a1a', '#b85c00', '#16171d'], ['#16171d', '#000000', '#a6e22e']], overlay: HORSE_OVERLAY.halloween },
    arena: { ground: ['#3a3528', '#342f24'], speck: ['#4a4433', '#2a261c'], patch: ['#2b2533', '#241f2b'], stone: ['#6e6a78', '#a3a0ac'], border: ['#3e7a1e', '#5ea82a'], props: 'graves' },
    battle: { skin: ['#b8e986', '#e9e4d4', '#c5a5e8', '#ffd9b3'], cloth: [['#7b2cbf', '#4a1a78'], ['#2d2a32', '#1b1920'], ['#ff7a1a', '#b85c00'], ['#6e6a78', '#45424c']], hair: pals.hair, hats: [HAT.witch, HAT.pumpkin, HAT.skull, HAT.vampire], weapons: [WEAPON.scythe, WEAPON.lantern] },
  },
  christmas: {
    label: 'Christmas', accent: '#f4f1e8', weather: 'snow',
    colors: ['#c1121f', '#1f7a3d', '#f4f1e8', '#d4af37', '#0f5132', '#e63946'], wheel: { rim: '#0f3d24', pointer: '#d4af37', hub: '#8f1626' },
    race: { bg: '#10222c', depth: '#16303d', peg: '#c9dce6', wall: '#6d8fa0', bump: '#c1121f', ring: '#d4af37', rot: '#1f9d55', mover: '#e63946', pin: '#f4f1e8', ball: 'ornament' },
    horse: { noun: 'reindeer', sky: '#20344f', hill: '#e6eef3', turf: '#eef3f6', stripes: ['#f7fafc', '#e6edf2'], rail: '#c1121f', stall: '#1f7a3d', dust: 'rgba(255,255,255,.75)', stand: '#3a4a58', roof: ['#f4f1e8', '#c1121f'], shirts: ['#c1121f', '#1f7a3d', '#f4f1e8', '#d4af37'], feature: 'pines',
      coats: [['#8a5a34', '#5e3d24', '#3a2414'], ['#a06a3c', '#74492a', '#472a17'], ['#6b4226', '#472a17', '#2b1b12']], silks: [['#d7263d', '#8f1626', '#f4f1e8'], ['#2f9e44', '#1b5e2a', '#d7263d']], overlay: HORSE_OVERLAY.christmas },
    arena: { ground: ['#eef4f7', '#e4edf2'], speck: ['#ffffff', '#cfdde6'], patch: ['#cfe3ee', '#c2d9e6'], stone: ['#8fa3b0', '#c9d6de'], border: ['#6fb3d9', '#9ad0ec'], props: 'pines' },
    battle: { skin: pals.skin, cloth: [['#d7263d', '#8f1626'], ['#2f9e44', '#1b5e2a'], ['#f4f1e8', '#c9ccd1']], hair: pals.hair, hats: [HAT.santa, HAT.elf, HAT.antlers], weapons: [WEAPON.candy, WEAPON.tree] },
  },
  newyear: {
    label: 'New Year', accent: '#ffc72c', weather: 'confetti',
    colors: ['#ffc72c', '#1f2937', '#c0c7d1', '#7c3aed', '#f4f1e8', '#1d4ed8'], wheel: { rim: '#0b0f1e', pointer: '#ffc72c', hub: '#1f2937' },
    race: { bg: '#0b1024', depth: '#141a35', peg: '#c0c7d1', wall: '#47507a', bump: '#7c3aed', ring: '#ffc72c', rot: '#ffc72c', mover: '#60a5fa', pin: '#f4f1e8', ball: 'party' },
    horse: { noun: 'horse', sky: '#0b1024', hill: '#1a2145', turf: '#1b2a3a', stripes: ['#243546', '#1f2e3e'], rail: '#ffc72c', stall: '#7c3aed', dust: 'rgba(255,199,44,.65)', stand: '#232a46', roof: ['#ffc72c', '#1f2937'], shirts: ['#ffc72c', '#c0c7d1', '#7c3aed', '#f4f1e8', '#60a5fa'], feature: 'fireworks',
      coats: [['#d9b34a', '#a5832a', '#fff3c4'], ['#c0c7d1', '#8f97a3', '#f4f1e8'], ['#6f7da3', '#4d5a80', '#ffc72c']], silks: [['#7c3aed', '#4a1a78', '#ffc72c'], ['#16171d', '#000000', '#ffc72c'], ['#1d4ed8', '#123199', '#c0c7d1']], overlay: HORSE_OVERLAY.newyear },
    arena: { ground: ['#1b2238', '#171e32'], speck: ['#262e4a', '#131a2c'], patch: ['#2a3350', '#252d48'], stone: ['#8891a8', '#c0c7d1'], border: ['#ffc72c', '#b98900'], props: 'confetti' },
    battle: { skin: pals.skin, cloth: [['#16171d', '#000000'], ['#ffc72c', '#b98900'], ['#7c3aed', '#4a1a78'], ['#c0c7d1', '#8f97a3']], hair: pals.hair, hats: [HAT.party, HAT.tophat, HAT.tiara], weapons: [WEAPON.sparkler, WEAPON.popper] },
  },
  valentines: {
    label: 'Valentine’s', accent: '#ff8fb1', weather: 'hearts',
    colors: ['#e11d48', '#fb7185', '#fecdd3', '#be123c', '#fff1f2', '#f472b6'], wheel: { rim: '#4c0519', pointer: '#fecdd3', hub: '#9f1239' },
    race: { bg: '#2a0f1c', depth: '#381526', peg: '#f9a8c0', wall: '#8f3a5c', bump: '#e11d48', ring: '#fecdd3', rot: '#fb7185', mover: '#f472b6', pin: '#fff1f2', ball: 'heart' },
    horse: { noun: 'horse', sky: '#ffc2d4', hill: '#f58fb0', turf: '#c94f7c', stripes: ['#d65c88', '#c9507c'], rail: '#fff1f2', stall: '#e11d48', dust: 'rgba(255,241,242,.7)', stand: '#7a2a4c', roof: ['#fff1f2', '#e11d48'], shirts: ['#e11d48', '#fb7185', '#fff1f2', '#f472b6', '#be123c'], feature: null,
      coats: [['#fff1f2', '#f5c6d3', '#e11d48'], ['#fb7185', '#d9486a', '#7a1030'], ['#e85d8a', '#b83c66', '#fff1f2']], silks: [['#e11d48', '#9f1239', '#fff1f2'], ['#fff1f2', '#f5c6d3', '#e11d48']], overlay: HORSE_OVERLAY.valentines },
    arena: { ground: ['#f7b6cb', '#f3a7bf'], speck: ['#fcd2df', '#ea93af'], patch: ['#fce0e9', '#f9d3df'], stone: ['#d9487a', '#e11d48'], border: ['#c21e56', '#e11d48'], props: 'hearts' },
    battle: { skin: pals.skin, cloth: [['#e11d48', '#9f1239'], ['#ff8fb1', '#d9487a'], ['#fff1f2', '#f5c6d3']], hair: pals.hair, hats: [HAT.heart, HAT.cupid, HAT.bow], weapons: [WEAPON.heartwand, WEAPON.arrow] },
  },
  easter: {
    label: 'Easter', accent: '#fde68a', weather: 'petals',
    colors: ['#fde68a', '#bbf7d0', '#bae6fd', '#fbcfe8', '#ddd6fe', '#fed7aa'], wheel: { rim: '#6d5aa8', pointer: '#f472b6', hub: '#8b7ac9' },
    race: { bg: '#2a3350', depth: '#333d5e', peg: '#fbcfe8', wall: '#8b7ac9', bump: '#f472b6', ring: '#fde68a', rot: '#86efac', mover: '#7dd3fc', pin: '#fff7ed', ball: 'egg' },
    horse: { noun: 'horse', sky: '#cdeffd', hill: '#a7e3a0', turf: '#7cc96b', stripes: ['#8ed47c', '#82cc71'], rail: '#fff7ed', stall: '#f472b6', dust: 'rgba(253,230,138,.7)', stand: '#8b7ac9', roof: ['#fff7ed', '#f472b6'], shirts: ['#fde68a', '#bbf7d0', '#bae6fd', '#fbcfe8', '#ddd6fe'], feature: null,
      coats: [['#f7f4ea', '#d8d3c2', '#f9a8c0'], ['#d9b37a', '#b18e59', '#f0e6cf'], ['#c9c4b8', '#9c978b', '#f7f4ea']], silks: [['#bae6fd', '#7dd3fc', '#f472b6'], ['#fbcfe8', '#f472b6', '#fde68a'], ['#ddd6fe', '#a78bfa', '#bbf7d0']], overlay: HORSE_OVERLAY.easter },
    arena: { ground: ['#92d67f', '#89ce77'], speck: ['#a8e394', '#79bd67'], patch: ['#bdeba9', '#b1e49c'], stone: ['#f7f4ea', '#fde68a'], border: ['#7dd3fc', '#bae6fd'], props: 'eggs' },
    battle: { skin: pals.skin, cloth: [['#bae6fd', '#7dd3fc'], ['#fbcfe8', '#f472b6'], ['#ddd6fe', '#a78bfa'], ['#bbf7d0', '#6ee7a0']], hair: pals.hair, hats: [HAT.bunny, HAT.chick, HAT.flowers], weapons: [WEAPON.carrot, WEAPON.eggwand] },
  },
  summer: {
    label: 'Summer', accent: '#facc15', weather: 'sun',
    colors: ['#06b6d4', '#facc15', '#fb7185', '#34d399', '#f97316', '#f4f1e8'], wheel: { rim: '#0e4f63', pointer: '#f97316', hub: '#0e7490' },
    race: { bg: '#0b3a4a', depth: '#0f4659', peg: '#bff3fb', wall: '#2f8ca3', bump: '#f97316', ring: '#facc15', rot: '#34d399', mover: '#fb7185', pin: '#fff7d6', ball: 'beach' },
    horse: { noun: 'horse', sky: '#7fdcf5', hill: '#22b5d6', turf: '#efd9a0', stripes: ['#f5e2b0', '#ecd59a'], rail: '#f97316', stall: '#06b6d4', dust: 'rgba(255,240,200,.8)', stand: '#0e7490', roof: ['#fff7d6', '#f97316'], shirts: ['#06b6d4', '#facc15', '#fb7185', '#34d399', '#f97316'], feature: 'sun',
      coats: [['#d9a441', '#a5772a', '#fff3c4'], ['#a8682f', '#7f4d20', '#f0e6cf'], ['#f0e6cf', '#c9bfa6', '#d9a441']], silks: [['#06b6d4', '#0e7490', '#facc15'], ['#fb7185', '#d9486a', '#f4f1e8'], ['#34d399', '#10946a', '#f97316']], overlay: HORSE_OVERLAY.summer },
    arena: { ground: ['#efd9a0', '#ebd294'], speck: ['#f7e7bd', '#dcc384'], patch: ['#f7e7bd', '#f3e0ad'], stone: ['#f97316', '#fb7185'], border: ['#06b6d4', '#22d3ee'], props: 'shells' },
    battle: { skin: pals.skin, cloth: [['#06b6d4', '#0e7490'], ['#fb7185', '#d9486a'], ['#facc15', '#b98900'], ['#34d399', '#10946a']], hair: pals.hair, hats: [HAT.straw, HAT.shades, HAT.bandana], weapons: [WEAPON.surfboard, WEAPON.waterblaster] },
  },
};

export const SEASONS = SEASON_LIST;
export const SEASON_IDS = Object.keys(SEASON_LIST);
// Anything unknown (such as old saved settings) simply means no theme.
export const seasonOf = id => SEASON_LIST[id] ?? SEASON_LIST.none;
// The wheel's own colours while a theme is on. The host's own colours stay saved underneath.
export const withSeason = theme => {
  const s = seasonOf(theme?.season);
  return s.colors ? { ...theme, colors: s.colors, ...s.wheel } : theme;
};
export const SEASON_FIGHTER_GRIDS = Object.values(HAT).concat(Object.values(WEAPON).flatMap(w => [w.idle, w.attack]));
export const SEASON_HORSE_GRIDS = Object.values(HORSE_OVERLAY);
