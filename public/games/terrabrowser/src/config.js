// All constants and balance numbers live here.
export const CFG = {
  TS: 16,                 // tile size in world pixels
  WORLD_W: 1600,
  WORLD_H: 600,
  CHUNK: 32,              // tiles per chunk side
  ZOOM: 2,
  STEP: 1000 / 60,

  phys: {
    grav: 0.4, maxFall: 10,
    accel: 0.08, airAccel: 0.05, maxRun: 3,
    friction: 0.2, airFriction: 0.03,
    jumpSpeed: 5.1, jumpHold: 15,
    waterGrav: 0.15, waterMaxFall: 3, waterMul: 0.5,
  },

  player: {
    w: 20, h: 42,
    hp: 100, hpCap: 400, crystalHp: 20,
    mana: 20, manaCap: 200, crystalMana: 20,
    iframes: 40, reachX: 5, reachY: 4,
    fallSafe: 25, fallDmgPerTile: 10,
    breath: 200, respawn: 360, grab: 84,
    potionSick: 3600,
  },

  // one full cycle = 15 minutes of real time
  day: { dayTicks: 32400, nightTicks: 21600, start: 2400 },

  spawn: {
    day: { rate: 450, cap: 4 },
    night: { rate: 540, cap: 5 },
    under: { rate: 300, cap: 6 },
    hell: { rate: 150, cap: 6 },
    crypt: { rate: 110, cap: 8 },
    bloodRate: 3, bloodCap: 2, townCap: 0.34, bossRate: 5, bossCap: 0.34,
    despawn: 90, minDist: 34, maxDist: 56,
  },

  autosaveTicks: 18000,
  lightMargin: 18,
  liquidRX: 70, liquidRY: 45,

  // Balance per ore tier. Each step is ~+30% melee DPS and a clear defense jump.
  tiers: [
    { id: 'copper', name: 'Copper', pal: 'copper', sword: { dmg: 9, ut: 22, kb: 5, len: 32 }, pick: { pow: 35, dmg: 5, ut: 19 }, axe: { pow: 9, dmg: 4, ut: 24 }, bow: null, armor: [1, 2, 1], setDef: 2, rar: 0, val: 150 },
    { id: 'iron', name: 'Iron', pal: 'iron', sword: { dmg: 12, ut: 21, kb: 5.5, len: 36 }, pick: { pow: 45, dmg: 6, ut: 18 }, axe: { pow: 11, dmg: 6, ut: 23 }, bow: { dmg: 8, ut: 27, vel: 8 }, armor: [2, 3, 2], setDef: 3, rar: 0, val: 300 },
    { id: 'silver', name: 'Silver', pal: 'silver', sword: { dmg: 15, ut: 20, kb: 6, len: 38 }, pick: { pow: 55, dmg: 8, ut: 17 }, axe: { pow: 13, dmg: 8, ut: 22 }, bow: null, armor: [3, 5, 3], setDef: 4, rar: 1, val: 600 },
    { id: 'gold', name: 'Gold', pal: 'gold', sword: { dmg: 19, ut: 19, kb: 6.5, len: 40 }, pick: { pow: 65, dmg: 10, ut: 16 }, axe: { pow: 15, dmg: 10, ut: 21 }, bow: { dmg: 13, ut: 25, vel: 9 }, armor: [5, 6, 5], setDef: 5, rar: 1, val: 1200 },
  ],
  molten: { armor: [7, 9, 7], dmgBonus: 0.12 },

  // Enemy + boss stats (merged into EN in enemies.js). coin is in bronze bits.
  enemies: {
    gelhopper: { hp: 14, dmg: 7, def: 0, coin: 20 },
    dunegel: { hp: 26, dmg: 12, def: 3, coin: 40 },
    cavegel: { hp: 36, dmg: 15, def: 5, coin: 60 },
    shambler: { hp: 45, dmg: 12, def: 6, coin: 60 },
    peeper: { hp: 60, dmg: 15, def: 2, coin: 75 },
    flitter: { hp: 18, dmg: 13, def: 2, coin: 40 },
    magmabat: { hp: 45, dmg: 30, def: 10, coin: 200 },
    grub: { hp: 40, dmg: 14, def: 4, coin: 80 },
    ossling: { hp: 70, dmg: 20, def: 8, coin: 120 },
    scuttler: { hp: 50, dmg: 12, def: 6, coin: 120 },
    frostimp: { hp: 55, dmg: 18, def: 6, coin: 130 },
    snapvine: { hp: 80, dmg: 26, def: 8, coin: 150 },
    rotflier: { hp: 45, dmg: 22, def: 8, coin: 120 },
    caster: { hp: 90, dmg: 30, def: 10, coin: 300 },
    emberimp: { hp: 90, dmg: 32, def: 14, coin: 400 },
    servant: { hp: 10, dmg: 8, def: 0, coin: 0 },
    leech: { hp: 40, dmg: 18, def: 6, coin: 0 },
    hungry: { hp: 90, dmg: 22, def: 8, coin: 0 },
    shadowhand: { hp: 30, dmg: 18, def: 0, coin: 0 },
    monarch: { hp: 1100, dmg: 12, def: 6, coin: 30000 },
    omni: { hp: 1500, dmg: 12, def: 6, coin: 50000 },
    rotmaw: { hp: 2600, dmg: 25, def: 4, coin: 80000 },
    warden: { hp: 2700, dmg: 22, def: 10, coin: 100000 },
    hand: { hp: 500, dmg: 18, def: 14, coin: 0 },
    rimehorn: { hp: 3000, dmg: 22, def: 12, coin: 90000 },
    wall: { hp: 4900, dmg: 50, def: 12, coin: 200000 },
  },
  // Boss behavior knobs. Cooldowns are in ticks (60 = 1 second), speeds in px/tick.
  bosses: {
    omni: { hover: 220, hoverP2: 110, charges: 3, chargesP2: 4, chargeSpd: 8.5, chargeSpdP2: 11.5, chargeDur: 46, chargeDurP2: 32, servantEvery: 110, maxServants: 2, p2DmgMul: 1.35 },
    rotmaw: { speed: 8.5, accel: 0.33, airSteer: 0.45, bodyDmg: 12, p2Speed: 1.25, spitEvery: 45, spitDmg: 22 },
    warden: { floatSpd: 3.5, floatSpdP2: 4.5, spinEvery: 600, spinEveryP2: 420, spinDur: 220, spinSpd: 3.8, spinSpdP2: 5, spinDefMul: 1.5, boltEvery: 70, boltDmg: 22, handEvery: 150, handSpd: 9 },
    wall: { baseSpd: 1.1, hurtSpd: 2.0, laserEvery: [110, 80, 55], laserDmg: 24, laserSpd: 11, leechEvery: 300, leechEveryP3: 200, maxLeeches: 3, behindDmg: 60, hungries: 4, hungryLeash: 230, hungrySpd: 4 },
    monarch: { wait: 36, hop: 3.2, hopVy: 6.2, big: 4.4, bigVy: 10.5, bigEvery: 3, teleEvery: 660, teleFar: 38, split: 0.05, maxSlimes: 8, minScale: 0.55 },
    rimehorn: { walk: 1.25, walkP2: 1.65, attackEvery: 160, attackEveryP2: 115, spikeDmg: 26, spikeLen: 14, spikeLenP2: 20, spikeStep: 3, spikeDelay: 16, roarRange: 700, roarDmg: 20, dread: 480, debris: 8, debrisDmg: 20, handsEvery: 420, maxHands: 3 },
  },
  // World difficulty presets, chosen at world creation.
  difficulty: {
    normal: { label: 'Normal', enemyHp: 1, bossHp: 1, dmg: 1, bossDmg: 1, speed: 1, cooldown: 1, phase2: 0.5, spawnRate: 1, spawnCap: 1, regen: 1, sick: 1, coins: 1, extraLoot: 0, kb: 1 },
    hard: { label: 'Hard', enemyHp: 1.8, bossHp: 1.8, dmg: 1.7, bossDmg: 1.4, speed: 1.1, cooldown: 0.7, phase2: 0.7, spawnRate: 2, spawnCap: 1.5, regen: 0.5, sick: 1.5, coins: 2.5, extraLoot: 1, kb: 1.3 },
  },

  // mining: each hit deals tool power; tile breaks when accumulated >= tile hp
  tileDecay: 300,
  rarity: ['#ffffff', '#9696ff', '#96ff96', '#ffc896', '#ff9696', '#ff96ff', '#d2a0ff'],
  bossColor: '#af4bff',
};
