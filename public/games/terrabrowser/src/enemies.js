// Enemies, bosses, projectiles and combat (damage to/from the player).
import { CFG } from './config.js';
import { T, W } from './tiles.js';
import { moveBody, rectSolid, overlaps, liquidAt } from './physics.js';
import { solidAt, setTile, tileAt, wallAt } from './world.js';
import { BOSS_LOOT, coinsToItems, dropItem, addBuff, totalCoins, setCoins } from './items.js';
import { lightAt } from './lighting.js';

export const HUMAN = {
  shambler: { skin: '#7fae62', shirt: '#5d5a7a', pants: '#3b3b4a', shoes: '#2a2a2a', hair: 0, hairColor: '#3a3020', eyes: '#c02020' },
  ossling: { skin: '#e4dfc8', shirt: '#e4dfc8', pants: '#cfc8b0', shoes: '#b8b098', hair: -1, hairColor: '#000' },
};

// ai: behavior key; spr: key into S.en; flags for spawning/despawn behavior
export const EN = {
  gelhopper: { name: 'Gelhopper', w: 24, h: 18, ai: 'hop', spr: 'gel_green', drops: [['gel', 1, 3, 1]], blood: '#4ec24a' },
  dunegel: { name: 'Dune Gelhopper', w: 24, h: 18, ai: 'hop', spr: 'gel_sand', drops: [['gel', 2, 4, 1]], blood: '#d8b060' },
  cavegel: { name: 'Cave Gelhopper', w: 24, h: 18, ai: 'hop', spr: 'gel_blue', drops: [['gel', 2, 5, 1]], blood: '#4a8ce8' },
  shambler: { name: 'Shambler', w: 20, h: 42, ai: 'walker', human: 'shambler', style: 'zombie', speed: 0.9, kbRes: 0.4, night: true },
  peeper: { name: 'Peeper', w: 26, h: 18, ai: 'flyer', spr: 'peeper', drops: [['lens', 1, 1, 0.4]], kbRes: 0.2, noGrav: true, night: true, blood: '#c03030' },
  flitter: { name: 'Cave Flitter', w: 22, h: 14, ai: 'bat', spr: 'flitter', noGrav: true },
  magmabat: { name: 'Magma Flitter', w: 22, h: 14, ai: 'bat', spr: 'flitter_hell', noGrav: true, inflict: ['fire', 180] },
  grub: { name: 'Tunnel Grub', w: 14, h: 14, ai: 'worm', worm: { len: 6, seg: 12, spr: 'grub', speed: 4.2, accel: 0.12 }, noGrav: true, noCollide: true, kbRes: 1 },
  ossling: { name: 'Ossling', w: 20, h: 42, ai: 'walker', human: 'ossling', style: 'skeleton', speed: 1.1, throws: 'bone', drops: [['bone', 1, 3, 0.5]], kbRes: 0.3, blood: '#e4dfc8' },
  scuttler: { name: 'Dune Scuttler', w: 26, h: 14, ai: 'turret', spr: 'scuttler', shot: 'sandball', blood: '#c8a060' },
  frostimp: { name: 'Frost Imp', w: 18, h: 24, ai: 'caster', spr: 'frostimp', shot: 'icicle', blood: '#78b8e8' },
  snapvine: { name: 'Snapvine', w: 22, h: 22, ai: 'tether', spr: 'snapvine', inflict: ['poison', 300], kbRes: 1, noGrav: true, noCollide: true, blood: '#4aa02a' },
  rotflier: { name: 'Rot Flier', w: 22, h: 18, ai: 'homing', spr: 'rotflier', drops: [['rotten_chunk', 1, 2, 0.5]], noGrav: true, speed: 3.2, accel: 0.1, blood: '#6a4a7a' },
  caster: { name: 'Crypt Caster', w: 20, h: 34, ai: 'caster', spr: 'caster', shot: 'shadowbolt', drops: [['bone', 1, 2, 0.5], ['tidecaller_staff', 1, 1, 0.02]], blood: '#2a3a7a' },
  emberimp: { name: 'Ember Imp', w: 18, h: 24, ai: 'caster', spr: 'emberimp', shot: 'fireball', inflict: ['fire', 180], blood: '#d84a2a' },
  servant: { name: 'Servant of the Omnivisor', w: 18, h: 14, ai: 'homing', spr: 'servant', noGrav: true, noCollide: true, speed: 4, accel: 0.15, minion: true, blood: '#c03030' },
  leech: { name: 'Cinder Leech', w: 12, h: 12, ai: 'worm', worm: { len: 5, seg: 9, spr: 'leech', speed: 6, accel: 0.25, air: true }, noGrav: true, noCollide: true, minion: true, kbRes: 1, blood: '#c83848' },
  hungry: { name: 'The Hungry', w: 26, h: 26, ai: 'hungry', noGrav: true, noCollide: true, minion: true, kbRes: 0.6, blood: '#a83a4c' },
  shadowhand: { name: 'Shadow Hand', w: 26, h: 16, ai: 'shadowhand', minion: true, stepUp: true, kbRes: 0.5, inflict: ['chill', 180], blood: '#3a2050' },
  // bosses
  monarch: { name: 'Gel Monarch', boss: true, w: 116, h: 84, ai: 'monarch', kbRes: 1, blood: '#4a8ce8' },
  rimehorn: { name: 'Rimehorn', boss: true, w: 60, h: 128, ai: 'rimehorn', kbRes: 1, stepUp: true, blood: '#a8acb8' },
  omni: { name: 'Omnivisor', boss: true, w: 80, h: 80, ai: 'omni', noGrav: true, noCollide: true, kbRes: 1, blood: '#c03030' },
  rotmaw: { name: 'Rotmaw Devourer', boss: true, w: 30, h: 30, ai: 'worm', worm: { len: 26, seg: 22, spr: 'rotmaw', speed: CFG.bosses.rotmaw.speed, accel: CFG.bosses.rotmaw.accel, bodyDmg: CFG.bosses.rotmaw.bodyDmg }, noGrav: true, noCollide: true, kbRes: 1, blood: '#6a3a8a' },
  warden: { name: 'Ossuary Warden', boss: true, w: 64, h: 64, ai: 'warden', noGrav: true, noCollide: true, kbRes: 1, blood: '#e4dfc8' },
  hand: { name: 'Warden Hand', w: 36, h: 36, ai: 'hand', noGrav: true, noCollide: true, kbRes: 1, minion: true, blood: '#e4dfc8' },
  wall: { name: 'The Cinder Wall', boss: true, w: 120, h: 680, ai: 'wall', noGrav: true, noCollide: true, kbRes: 1, blood: '#ff6020' },
};
for (const k in EN) { Object.assign(EN[k], CFG.enemies[k]); EN[k].key = k; }
const BK = CFG.bosses;
// difficulty helpers
const D = G => G.diff || CFG.difficulty.normal;
const cd = (G, n) => Math.max(1, Math.round(n * D(G).cooldown));
const sp = (G, v) => v * D(G).speed;

export const PROJ = {
  arrow: { w: 6, h: 6, grav: 0.12, life: 400, draw: 'arrow', col: '#c8a070' },
  flame_arrow: { w: 6, h: 6, grav: 0.12, life: 400, draw: 'arrow', col: '#ff8a20', light: [1, 0.6, 0.2], inflict: ['fire', 180] },
  bullet: { w: 4, h: 4, grav: 0, life: 150, draw: 'bullet', col: '#fff0a0' },
  spark: { w: 8, h: 8, grav: 0, life: 70, draw: 'orb', col: '#ffb040', light: [1, 0.6, 0.2], inflict: ['fire', 120] },
  starbolt: { w: 10, h: 10, grav: 0, life: 90, draw: 'star', col: '#80ffc0', light: [0.3, 1, 0.7], pierce: 2 },
  tide: { w: 10, h: 10, grav: 0, life: 160, draw: 'orb', col: '#40a0ff', light: [0.2, 0.5, 1], bounce: 3, pierce: 3 },
  boneshard: { w: 6, h: 6, grav: 0.03, life: 80, draw: 'bone', col: '#e8e0c8' },
  boomerang: { w: 18, h: 18, grav: 0, life: 600, draw: 'boomer', ret: true, pierce: 99 },
  bone: { w: 10, h: 10, grav: 0.2, life: 240, draw: 'bone', col: '#e8e0c8' },
  sandball: { w: 10, h: 10, grav: 0.15, life: 240, draw: 'orb', col: '#d8b870' },
  icicle: { w: 8, h: 8, grav: 0.04, life: 160, draw: 'orb', col: '#a0e0ff', light: [0.3, 0.5, 0.8], inflict: ['chill', 240] },
  fireball: { w: 12, h: 12, grav: 0, life: 200, draw: 'orb', col: '#ff6020', light: [1, 0.5, 0.1], inflict: ['fire', 240] },
  shadowbolt: { w: 10, h: 10, grav: 0, life: 160, draw: 'orb', col: '#9050ff', light: [0.5, 0.2, 1], noTiles: true },
  laser: { w: 14, h: 4, grav: 0, life: 150, draw: 'laser', col: '#ff5020', light: [1, 0.3, 0.1], noTiles: true },
  rotglob: { w: 10, h: 10, grav: 0.1, life: 200, draw: 'orb', col: '#9ac040', noTiles: true },
  icespike: { w: 12, h: 40, grav: 0, life: 44, draw: 'spike', noTiles: true, hazard: true, inflict: ['chill', 180] },
  debris: { w: 12, h: 12, grav: 0.22, life: 220, draw: 'orb', col: '#8a8a96' },
  skullbolt: { w: 14, h: 14, grav: 0, life: 220, draw: 'orb', col: '#40e0ff', light: [0.2, 0.7, 1], home: 0.08, noTiles: true },
};

let UID = 1;
const rnd = (a, b) => a + Math.random() * (b - a);
const sign = v => (v < 0 ? -1 : 1);
const cxOf = e => e.x + e.w / 2, cyOf = e => e.y + e.h / 2;

// ------------------------------------------------------------------ creation
export function spawnEnemy(G, key, x, y, o = {}) {
  const d = EN[key];
  const hp = Math.round(d.hp * (d.boss ? D(G).bossHp : D(G).enemyHp));
  const e = Object.assign({
    uid: UID++, key, d, x: x - d.w / 2, y: y - d.h, w: d.w, h: d.h, vx: 0, vy: 0, hp, maxHp: hp,
    dir: 1, t: 0, a: 0, b: 0, c: 0, st: 0, onGround: false, flash: 0, rot: 0, anim: 0, burn: 0,
    noGrav: !!d.noGrav, noCollide: !!d.noCollide, stepUp: d.ai === 'walker' || !!d.stepUp, dead: false,
  }, o);
  e.px = e.x; e.py = e.y;
  if (d.worm) { e.segs = []; for (let i = 0; i < d.worm.len; i++) e.segs.push({ x: cxOf(e), y: cyOf(e) + i * 2, px: cxOf(e), py: cyOf(e) }); }
  if (d.ai === 'tether') { e.ax = x; e.ay = y; }
  G.enemies.push(e);
  return e;
}

export function makeProj(G, type, x, y, vx, vy, o = {}) {
  const d = PROJ[type];
  const p = Object.assign({ type, d, x: x - d.w / 2, y: y - d.h / 2, w: d.w, h: d.h, vx, vy, dmg: 0, kb: 0, crit: 0, friendly: false, t: 0, life: d.life, pierce: d.pierce || 1, bounce: d.bounce || 0, hit: new Set(), rot: Math.atan2(vy, vx), dead: false }, o);
  p.px = p.x; p.py = p.y;
  G.projectiles.push(p);
  return p;
}

export function hitboxes(e) {
  if (!e.segs) return [e];
  const s = e.d.worm.seg, out = [e];
  for (const g of e.segs) out.push({ x: g.x - s / 2, y: g.y - s / 2, w: s, h: s, seg: true });
  return out;
}

// ------------------------------------------------------------------ player damage
export function hurtPlayer(G, dmg, dir, cause) {
  const p = G.player;
  if (p.dead || p.iframes > 0 || G.state !== 'play') return false;
  const real = Math.max(1, Math.round(dmg * rnd(0.9, 1.1) - p.stats.def / 2));
  p.hp -= real; p.iframes = CFG.player.iframes; p.regenT = 0;
  G.fx.text(p.x + 10, p.y, real, '#ff4646');
  G.fx.particles(p.x + 10, p.y + 20, 6, '#c02020', { spread: 2.5 });
  G.sfx('hurt'); G.fx.shake(3);
  if (dir && !p.stats.kbImmune) { const k = D(G).kb; p.vx = dir * 4.5 * k; p.vy = -3.5 * k; p.jumpT = 0; }
  if (p.hp <= 0) killPlayer(G, cause || 'was slain');
  return true;
}
export function killPlayer(G, cause) {
  const p = G.player;
  if (p.dead) return;
  p.hp = 0; p.dead = true; p.respawnT = CFG.player.respawn + (G.boss ? 180 : 0);
  p.hook = null; p.useT = 0; p.swing = null;
  const coins = totalCoins(p), half = Math.floor(coins / 2);
  if (half > 0) { setCoins(p, coins - half); for (const c of coinsToItems(half)) dropItem(G, c.id, c.n, p.x + 10, p.y + 20); }
  G.msg(p.name + ' ' + cause + '.', '#e85050');
  G.fx.particles(p.x + 10, p.y + 20, 30, '#b01818', { spread: 4, life: 60 });
  G.sfx('death');
}

// ------------------------------------------------------------------ enemy damage
export function damageEnemy(G, e, base, kb, dir, crit, inflict) {
  if (e.dead) return;
  const def = e.d.def * (e.defMul || 1);
  let dmg = Math.max(1, Math.round(base * rnd(0.85, 1.15) - def / 2));
  if (crit) dmg *= 2;
  e.hp -= dmg; e.flash = 8;
  G.fx.text(cxOf(e), e.y, dmg, crit ? '#ff8c1a' : '#ffd24a', crit);
  const kr = e.d.kbRes || 0;
  if (kr < 1 && kb) { e.vx = dir * kb * (1 - kr) * 0.9; if (!e.noGrav) e.vy = -Math.max(2, kb * 0.6) * (1 - kr); else e.vy -= kb * 0.2 * (1 - kr); }
  if (inflict) e.burn = Math.max(e.burn, inflict[1]);
  G.fx.particles(cxOf(e), cyOf(e), 4, e.d.blood || '#c03030', { spread: 2 });
  G.sfx(e.d.boss ? 'bosshit' : 'hit');
  if (e.hp <= 0) killEnemy(G, e);
}

export function killEnemy(G, e, silent) {
  if (e.dead) return;
  e.dead = true;
  if (silent) return;
  const d = e.d, cx = cxOf(e), cy = cyOf(e);
  for (const [id, a, b, ch] of d.drops || []) if (Math.random() < ch) dropItem(G, id, a + Math.floor(Math.random() * (b - a + 1)), cx, cy);
  if (d.coin) for (const c of coinsToItems(d.coin * D(G).coins * rnd(0.8, 1.2))) dropItem(G, c.id, c.n, cx, cy);
  const p = G.player;
  const heartChance = d.key === 'servant' ? 0.3 : d.minion || d.boss ? 0 : 0.09;
  if (p.hp < p.lifeMax && Math.random() < heartChance) dropItem(G, 'heart_pickup', 1, cx, cy);
  const pts = e.segs ? [{ x: cx, y: cy }, ...e.segs] : [{ x: cx, y: cy }];
  for (const s of pts) G.fx.particles(s.x, s.y, d.boss ? 14 : 10, d.blood || '#c03030', { spread: 3, life: 45 });
  G.sfx(d.boss ? 'roar' : 'kill');
  if (d.key === 'warden' && e.hands) for (const h of e.hands) killEnemy(G, h, true);
  if (d.boss) bossDefeated(G, e);
}

function bossDefeated(G, e) {
  const d = e.d, F = G.flags;
  if (G.boss === e) G.boss = null;
  F.bosses[d.key] = true;
  G.msg(d.name + ' has been defeated!', CFG.bossColor);
  for (let roll = 0; roll <= D(G).extraLoot; roll++) for (const [id, a, b, ch] of BOSS_LOOT[d.key] || []) if (Math.random() < ch) dropItem(G, id, a + Math.floor(Math.random() * (b - a + 1)), cxOf(e), Math.min(cyOf(e), G.player.y));
  if (d.key === 'warden') {
    F.cryptOpen = true;
    const wd = G.world, [dx, dy] = wd.cryptDoor || [0, 0];
    for (let k = 0; k < 3; k++) if (tileAt(wd, dx, dy + k) === T.CRYPT_DOOR) setTile(wd, dx, dy + k, T.DOOR, k << 2);
    G.msg('The seal on the Old Crypt crumbles away...', '#50ff96');
  }
  if (d.key === 'wall') G.msg('The ancient flames are quelled. You have conquered this world!', '#ffd040');
  G.fx.shake(10);
}

// ------------------------------------------------------------------ bosses
export function summonBoss(G, key, at) {
  const p = G.player, wd = G.world;
  if (G.boss) { G.msg('Something is already hunting you...', '#c8c8c8'); return false; }
  const px = p.x + 10, py = p.y + 21;
  let e;
  if (key === 'omni') {
    if (G.time.isDay) { G.msg('Nothing happens. Perhaps at night...', '#c8c8c8'); return false; }
    e = spawnEnemy(G, 'omni', px + (Math.random() < 0.5 ? -700 : 700), py - 500 + 80);
  } else if (key === 'rotmaw') {
    if (at !== 'orb' && !G.zone.blight) { G.msg('The bait only works in the Blight.', '#c8c8c8'); return false; }
    e = spawnEnemy(G, 'rotmaw', px + rnd(-200, 200), py + 520);
    e.vy = -6;
  } else if (key === 'warden') {
    const [bx, by] = at;
    e = spawnEnemy(G, 'warden', bx * 16, by * 16 - 180);
    e.hands = [-1, 1].map(s => spawnEnemy(G, 'hand', bx * 16 + s * 90, by * 16 - 120, { side: s, parent: e, st: 0 }));
  } else if (key === 'wall') {
    if (py / 16 < wd.hellLine) { G.msg('The effigy smolders. It must be used in the underworld.', '#c8c8c8'); return false; }
    const dir = px < wd.w * 8 ? 1 : -1;
    e = spawnEnemy(G, 'wall', px - dir * 760, py + 340, { mdir: dir });
    const front = dir > 0 ? e.x + e.w : e.x;
    [-270, -120, 120, 270].slice(0, BK.wall.hungries).forEach(off => spawnEnemy(G, 'hungry', front + dir * 60, cyOf(e) + off + 13, { parent: e, off }));
  } else if (key === 'monarch') {
    if (py / 16 > wd.surfaceLine + 12) { G.msg('The crown glistens, but nothing answers down here.', '#c8c8c8'); return false; }
    e = spawnEnemy(G, 'monarch', px + (Math.random() < 0.5 ? -1 : 1) * rnd(240, 380), py - 380, { scale: 1, squash: 0, fade: 1 });
  } else if (key === 'rimehorn') {
    if (!G.zone.snow) { G.msg('The idol only stirs in the snow.', '#c8c8c8'); return false; }
    const spot = standSpot(G, Math.floor(px / 16), Math.floor(py / 16), 34, 3, 9) || standSpot(G, Math.floor(px / 16), Math.floor(py / 16), 12, 3, 9);
    const [sx, sy] = spot || [Math.floor(px / 16), Math.floor(py / 16) + 1];
    e = spawnEnemy(G, 'rimehorn', sx * 16 + 8, (sy + 1) * 16 - 0.01, { fade: 1 });
  }
  G.boss = e;
  G.msg(e.d.name + ' has awoken!', CFG.bossColor);
  G.sfx('roar'); G.fx.shake(8);
  return true;
}

export function onOrbBroken(G) {
  const F = G.flags;
  F.orbs = (F.orbs || 0) + 1;
  const k = F.orbs % 3;
  if (k === 1) G.msg('A horrible chill goes down your spine...', '#50ff96');
  else if (k === 2) G.msg('Screams echo around you...', '#50ff96');
  else if (!summonBoss(G, 'rotmaw', 'orb')) F.orbs--;
}

// ------------------------------------------------------------------ AI
function toward(e, tx, ty, acc, max) {
  const dx = tx - cxOf(e), dy = ty - cyOf(e), d = Math.hypot(dx, dy) || 1;
  e.vx += dx / d * acc; e.vy += dy / d * acc;
  const s = Math.hypot(e.vx, e.vy);
  if (s > max) { e.vx *= max / s; e.vy *= max / s; }
}
function findFloorNear(G, tx, ty, range) {
  const wd = G.world;
  for (let k = 0; k < 20; k++) {
    const x = tx + Math.round(rnd(-range, range));
    for (let y = ty - 10; y < ty + 10; y++) {
      if (solidAt(wd, x, y + 1) && !solidAt(wd, x, y) && !solidAt(wd, x, y - 1) && !solidAt(wd, x, y - 2) && Math.abs(x - tx) > 4) return [x, y];
    }
  }
  return null;
}

// a floor tile near (tx,ty), preferring ~dist tiles away horizontally, with room for a body wT wide and hT tall
function standSpot(G, tx, ty, dist, wT, hT) {
  const wd = G.world;
  for (let k = 0; k < 40; k++) {
    const x = tx + (Math.random() < 0.5 ? -1 : 1) * Math.round(dist * rnd(0.7, 1.2));
    for (let y = ty - 16; y < ty + 16; y++) {
      if (!solidAt(wd, x, y + 1)) continue;
      let ok = true;
      for (let yy = y; yy > y - hT && ok; yy--) for (let xx = x - wT; xx <= x + wT; xx++) if (solidAt(wd, xx, yy)) { ok = false; break; }
      if (ok) return [x, y];
    }
  }
  return null;
}

const AI = {
  hop(G, e) {
    const p = G.player;
    if (e.onGround) {
      e.vx *= 0.8; e.t++;
      if (e.t > e.a) {
        e.t = 0; e.a = rnd(40, 100);
        e.dir = p.dead ? (Math.random() < 0.5 ? 1 : -1) : sign(p.x - e.x);
        const big = Math.random() < 0.33;
        e.vy = big ? -7.5 : -5.4; e.vx = e.dir * (big ? 2.2 : 3.2);
      }
    }
    e.frame = e.onGround ? 0 : 1;
  },
  walker(G, e) {
    const p = G.player, d = e.d;
    const dx = p.x - e.x;
    if (!p.dead && Math.abs(dx) > 6) e.dir = sign(dx);
    if (p.dead || (d.night && G.time.isDay)) e.dir = e.dir || 1;
    e.vx += e.dir * 0.07;
    if (Math.abs(e.vx) > sp(G, d.speed)) e.vx *= 0.9;
    if (e.onGround && e.hitX) e.vy = -6.4;
    e.anim += Math.abs(e.vx) * 0.12;
    if (d.throws && !p.dead) {
      e.b++;
      const dist = Math.hypot(dx, p.y - e.y);
      if (e.b > cd(G, 140) && dist < 420) {
        e.b = rnd(-30, 0);
        const t = Math.max(20, dist / 6);
        makeProj(G, d.throws, cxOf(e), e.y + 12, (p.x + 10 - cxOf(e)) / t, (p.y + 12 - e.y - 12) / t - 0.5 * 0.2 * t, { dmg: d.dmg * 0.8, src: d.name });
      }
    }
  },
  flyer(G, e) {
    const p = G.player;
    if (G.time.isDay || p.dead) { e.vy -= 0.08; e.vx += e.dir * 0.03; }
    else {
      const dx = p.x + 10 - cxOf(e), dy = p.y + 20 - cyOf(e);
      e.vx += sign(dx) * 0.07; e.vy += sign(dy) * 0.05;
      e.dir = sign(dx);
    }
    const fx = sp(G, 2.6), fy = sp(G, 1.8);
    e.vx = Math.max(-fx, Math.min(fx, e.vx)); e.vy = Math.max(-fy, Math.min(fy, e.vy));
    e.rot = Math.atan2(e.vy, e.vx);
  },
  bat(G, e) {
    const p = G.player;
    e.t++;
    if (e.t % 40 === 1) { e.tx = rnd(-90, 90); e.ty = rnd(-70, 40); }
    toward(e, p.x + 10 + (e.tx || 0), p.y + 10 + (e.ty || 0), 0.18, sp(G, 3.2));
    e.frame = (e.t >> 3) & 1; e.dir = sign(e.vx);
  },
  worm(G, e) {
    const p = G.player, Wm = e.d.worm, wd = G.world;
    const hx = cxOf(e), hy = cyOf(e);
    const inT = Wm.air || solidAt(wd, Math.floor(hx / 16), Math.floor(hy / 16)) || wd.wall[Math.floor(hy / 16) * wd.w + Math.floor(hx / 16)] > 0;
    const phase2 = e.d.boss && e.hp < e.maxHp * D(G).phase2;
    const spd = sp(G, Wm.speed * (phase2 ? BK.rotmaw.p2Speed : 1));
    if (p.dead) { e.vy += 0.3; }
    else if (inT) toward(e, p.x + 10, p.y + 21, Wm.accel, spd);
    else {
      e.vy = Math.min(e.vy + 0.25, 10); e.vx *= 0.995;
      // bosses keep curving toward the player while airborne
      if (e.d.boss) { const ax = Math.sign(p.x + 10 - hx) * Wm.accel * BK.rotmaw.airSteer; e.vx += ax; if (p.y + 21 < hy) e.vy -= Wm.accel * BK.rotmaw.airSteer * 0.6; }
    }
    if (inT && !Wm.air && Math.random() < 0.15) G.fx.particles(hx, hy, 1, '#6b4a33', { spread: 1.5 });
    e.x += e.vx; e.y += e.vy;
    e.rot = Math.atan2(e.vy, e.vx);
    let prev = { x: cxOf(e), y: cyOf(e) };
    const gap = Wm.seg * 0.85;
    for (const s of e.segs) {
      s.px = s.x; s.py = s.y;
      const dx = prev.x - s.x, dy = prev.y - s.y, d = Math.hypot(dx, dy) || 1;
      if (d > gap) { s.x = prev.x - dx / d * gap; s.y = prev.y - dy / d * gap; }
      s.rot = Math.atan2(dy, dx);
      prev = s;
    }
    if (phase2 && ++e.b > cd(G, BK.rotmaw.spitEvery)) {
      e.b = 0;
      const s = e.segs[Math.floor(Math.random() * e.segs.length)];
      const dx = p.x + 10 - s.x, dy = p.y + 20 - s.y, dd = Math.hypot(dx, dy) || 1;
      makeProj(G, 'rotglob', s.x, s.y, dx / dd * 5, dy / dd * 5, { dmg: BK.rotmaw.spitDmg, src: e.d.name, boss: true });
    }
  },
  turret(G, e) {
    const p = G.player;
    const dx = p.x + 10 - cxOf(e), dy = p.y + 20 - cyOf(e), dist = Math.hypot(dx, dy);
    e.dir = sign(dx);
    if (e.onGround) e.vx = dist < 500 ? e.dir * 0.4 : 0;
    e.anim += Math.abs(e.vx) * 0.2;
    if (!p.dead && dist < 480 && ++e.a > cd(G, 120)) {
      e.a = 0;
      const t = 50;
      makeProj(G, e.d.shot, cxOf(e), e.y + 2, dx / t, dy / t - 0.5 * 0.15 * t, { dmg: e.d.dmg, src: e.d.name });
    }
  },
  caster(G, e) {
    const p = G.player;
    e.t++;
    e.dir = sign(p.x - e.x);
    const cyc = cd(G, 260), k = e.t % cyc;
    if (k === 1 && !p.dead) {
      const spot = findFloorNear(G, Math.floor((p.x + 10) / 16), Math.floor((p.y + 20) / 16), 16);
      if (spot) {
        G.fx.particles(cxOf(e), cyOf(e), 12, e.d.blood, { spread: 2, grav: -0.05 });
        e.x = spot[0] * 16 + 8 - e.w / 2; e.y = (spot[1] + 1) * 16 - e.h - 0.01; e.vx = e.vy = 0;
        G.fx.particles(cxOf(e), cyOf(e), 12, e.d.blood, { spread: 2, grav: -0.05 });
      }
    }
    if (!p.dead && (k === Math.round(cyc * 0.27) || k === Math.round(cyc * 0.46) || k === Math.round(cyc * 0.65))) {
      const dx = p.x + 10 - cxOf(e), dy = p.y + 20 - cyOf(e), d = Math.hypot(dx, dy) || 1;
      if (d < 700) { makeProj(G, e.d.shot, cxOf(e), cyOf(e) - 4, dx / d * 5, dy / d * 5, { dmg: e.d.dmg * 0.8, src: e.d.name }); G.sfx('magic'); }
    }
    if (e.onGround) e.vx *= 0.8;
    e.frame = (e.t >> 4) & 1;
  },
  tether(G, e) {
    const p = G.player;
    const pdx = p.x + 10 - e.ax, pdy = p.y + 20 - e.ay;
    const near = !p.dead && Math.hypot(pdx, pdy) < 190;
    toward(e, near ? p.x + 10 : e.ax, near ? p.y + 20 : e.ay - 40, near ? 0.3 : 0.1, near ? sp(G, 3.5) : 1.5);
    const dx = cxOf(e) - e.ax, dy = cyOf(e) - e.ay, d = Math.hypot(dx, dy);
    if (d > 120) { e.x -= dx / d * (d - 120); e.y -= dy / d * (d - 120); e.vx *= 0.5; e.vy *= 0.5; }
    e.x += e.vx; e.y += e.vy;
    e.rot = Math.atan2(cyOf(e) - e.ay, cxOf(e) - e.ax);
    e.frame = near ? 1 : 0;
  },
  homing(G, e) {
    const p = G.player, d = e.d;
    e.t++;
    if (p.dead) e.vy -= 0.1;
    else toward(e, p.x + 10, p.y + 18, d.accel || 0.1, sp(G, d.speed || 3));
    e.vy += Math.sin(e.t * 0.08) * 0.04;
    e.rot = Math.atan2(e.vy, e.vx); e.dir = sign(e.vx);
    e.frame = (e.t >> 3) & 1;
  },
  omni(G, e) {
    const p = G.player, px = p.x + 10, py = p.y + 21;
    e.t++;
    if (G.time.isDay || p.dead) {
      e.vy -= 0.25; e.vx *= 0.98; e.x += e.vx; e.y += e.vy;
      if (Math.abs(cyOf(e) - py) > 1400) { G.msg('The Omnivisor has fled!', CFG.bossColor); killEnemy(G, e, true); G.boss = null; }
      return;
    }
    const K = BK.omni;
    if (!e.p2 && e.hp < e.maxHp * D(G).phase2 && e.st !== 2) { e.st = 2; e.a = 0; G.sfx('roar'); }
    const aim = Math.atan2(py - cyOf(e), px - cxOf(e));
    if (e.st === 0) {
      const tx = px, ty = py - 220;
      const dx = tx - cxOf(e), dy = ty - cyOf(e), d = Math.hypot(dx, dy) || 1, spd = Math.min(d * 0.05, sp(G, e.p2 ? 8 : 6));
      e.vx += (dx / d * spd - e.vx) * 0.08; e.vy += (dy / d * spd - e.vy) * 0.08;
      e.rot += (aim - e.rot) * 0.2;
      e.a++;
      if (!e.p2 && e.a % cd(G, K.servantEvery) === 0 && G.enemies.filter(q => q.key === 'servant' && !q.dead).length < K.maxServants) spawnEnemy(G, 'servant', cxOf(e), cyOf(e) + 10);
      if (e.a > cd(G, e.p2 ? K.hoverP2 : K.hover)) { e.st = 1; e.b = e.p2 ? K.chargesP2 : K.charges; e.c = 0; }
    } else if (e.st === 1) {
      const dur = e.p2 ? K.chargeDurP2 : K.chargeDur, rest = cd(G, 18);
      if (e.c === 0) { const s = sp(G, e.p2 ? K.chargeSpdP2 : K.chargeSpd); e.vx = Math.cos(aim) * s; e.vy = Math.sin(aim) * s; e.rot = aim; G.sfx('dash'); }
      e.c++;
      if (e.c > dur) { e.vx *= 0.9; e.vy *= 0.9; e.rot += (aim - e.rot) * 0.2; }
      if (e.c > dur + rest) { e.c = 0; if (--e.b <= 0) { e.st = 0; e.a = 0; } }
    } else if (e.st === 2) {
      e.a++; e.vx *= 0.9; e.vy *= 0.9;
      e.rot += 0.45 * (1 - e.a / 100);
      if (e.a % 6 === 0) G.fx.particles(cxOf(e), cyOf(e), 4, '#c03030', { spread: 3 });
      if (e.a === 50) { e.p2 = true; e.dmgMul = K.p2DmgMul; e.defMul = 0; G.fx.particles(cxOf(e), cyOf(e), 30, '#e8d0d0', { spread: 5 }); }
      if (e.a > 100) { e.st = 0; e.a = 0; }
    }
    e.x += e.vx; e.y += e.vy;
  },
  warden(G, e) {
    const p = G.player, px = p.x + 10, py = p.y + 21;
    e.t++;
    const handsAlive = e.hands && e.hands.some(h => !h.dead);
    const K = BK.warden;
    const p2 = !handsAlive || e.hp < e.maxHp * D(G).phase2;
    const rage = G.time.isDay ? 2.5 : 1;
    e.dmgMul = G.time.isDay ? 3 : 1;
    if (p.dead) { e.vy -= 0.3; e.x += e.vx; e.y += e.vy; if (Math.abs(cyOf(e) - py) > 1500) { G.msg('The Ossuary Warden has returned to its slumber.', CFG.bossColor); if (e.hands) e.hands.forEach(h => killEnemy(G, h, true)); killEnemy(G, e, true); G.boss = null; } return; }
    if (e.st === 0) {
      e.defMul = 1;
      const tx = px, ty = py - 200, dx = tx - cxOf(e), dy = ty - cyOf(e), d = Math.hypot(dx, dy) || 1;
      const spd = Math.min(d * 0.04, sp(G, p2 ? K.floatSpdP2 : K.floatSpd) * rage);
      e.vx += (dx / d * spd - e.vx) * 0.06; e.vy += (dy / d * spd - e.vy) * 0.06;
      e.rot = Math.sin(e.t * 0.04) * 0.15;
      e.a++;
      if (p2 && e.a % cd(G, K.boltEvery) === 0) {
        const ang = Math.atan2(py - cyOf(e), px - cxOf(e));
        makeProj(G, 'skullbolt', cxOf(e), cyOf(e) + 20, Math.cos(ang) * 4, Math.sin(ang) * 4, { dmg: K.boltDmg, src: e.d.name, boss: true });
      }
      if (e.a > cd(G, p2 ? K.spinEveryP2 : K.spinEvery)) { e.st = 1; e.a = 0; G.sfx('roar'); }
    } else {
      e.defMul = K.spinDefMul;
      e.rot += 0.35;
      toward(e, px, py, 0.3, sp(G, p2 ? K.spinSpdP2 : K.spinSpd) * rage);
      if (++e.a > K.spinDur) { e.st = 0; e.a = 0; }
    }
    e.x += e.vx; e.y += e.vy;
  },
  hand(G, e) {
    const s = e.parent, p = G.player;
    if (!s || s.dead) { killEnemy(G, e, true); return; }
    e.t++;
    const hx = cxOf(s) + e.side * 95, hy = cyOf(s) + 40 + Math.sin(e.t * 0.05 + e.side) * 12;
    if (e.st === 0) {
      e.vx += (hx - cxOf(e)) * 0.02 - e.vx * 0.15; e.vy += (hy - cyOf(e)) * 0.02 - e.vy * 0.15;
      const every = cd(G, BK.warden.handEvery);
      if (!p.dead && s.st === 0 && (e.t + (e.side > 0 ? every >> 1 : 0)) % every === 0) {
        e.st = 1; e.a = 0;
        const dx = p.x + 10 - cxOf(e), dy = p.y + 20 - cyOf(e), d = Math.hypot(dx, dy) || 1;
        const hs = sp(G, BK.warden.handSpd);
        e.vx = dx / d * hs; e.vy = dy / d * hs;
      }
    } else if (e.st === 1) { if (++e.a > 26) e.st = 2; }
    else { toward(e, hx, hy, 0.6, 9); if (Math.hypot(hx - cxOf(e), hy - cyOf(e)) < 20) e.st = 0; }
    e.rot = e.side * 0.3 + Math.sin(e.t * 0.1) * 0.1;
    e.x += e.vx; e.y += e.vy;
  },
  wall(G, e) {
    const p = G.player, wd = G.world;
    const f = 1 - e.hp / e.maxHp;
    const K = BK.wall, p2f = 1 - D(G).phase2;
    const phase = f > p2f + (1 - p2f) / 2 ? 3 : f > p2f ? 2 : 1;
    e.x += e.mdir * sp(G, K.baseSpd + f * K.hurtSpd + (phase - 1) * 0.3);
    const py = p.y + 21;
    const ty = Math.max((wd.hellLine - 20) * 16, Math.min(wd.h * 16 - e.h, py - e.h / 2));
    e.y += (ty - e.y) * 0.05;
    e.t++; e.a++; e.b++;
    const front = e.mdir > 0 ? e.x + e.w : e.x, cy = cyOf(e);
    if (!p.dead && e.a > cd(G, K.laserEvery[phase - 1])) {
      e.a = 0; e.eye = (e.eye || 0) ^ 1;
      const ey = cy + (e.eye ? -180 : 180), dx = p.x + 10 - front, dy = py - ey, d = Math.hypot(dx, dy) || 1;
      makeProj(G, 'laser', front, ey, dx / d * K.laserSpd, dy / d * K.laserSpd, { dmg: K.laserDmg, src: e.d.name, boss: true });
      G.sfx('laser');
    }
    if (!p.dead && e.b > cd(G, phase === 3 ? K.leechEveryP3 : K.leechEvery) && G.enemies.filter(q => q.key === 'leech' && !q.dead).length < K.maxLeeches) {
      e.b = 0;
      const l = spawnEnemy(G, 'leech', front, cy + 10);
      l.vx = e.mdir * 5;
    }
    const pcx = p.x + 10;
    if (!p.dead && ((e.mdir > 0 && pcx < e.x - 30) || (e.mdir < 0 && pcx > e.x + e.w + 30))) {
      p.vx += front > pcx ? 0.6 : -0.6;
      hurtPlayer(G, K.behindDmg * D(G).bossDmg, e.mdir, 'was consumed by The Cinder Wall');
    }
    if (e.x < -e.w || e.x > wd.w * 16) {
      if (!p.dead) killPlayer(G, 'was consumed by The Cinder Wall');
      killEnemy(G, e, true); G.boss = null;
    }
    if (p.dead && e.t > 60 && !e.leaving) { e.leaving = true; }
    if (e.leaving) { e.y += 8; if (e.y > wd.h * 16) { killEnemy(G, e, true); G.boss = null; G.msg('The Cinder Wall sinks back into the depths.', CFG.bossColor); } }
    for (let k = 0; k < 3; k++) G.lights.push({ x: front, y: cy + (k - 1) * 200, r: 1, g: 0.45, b: 0.15 });
  },
  hungry(G, e) {
    const w = e.parent, p = G.player;
    if (!w || w.dead) { killEnemy(G, e, true); return; }
    e.t++;
    const front = w.mdir > 0 ? w.x + w.w : w.x;
    e.ax = front; e.ay = cyOf(w) + e.off;
    toward(e, p.dead ? e.ax + w.mdir * 80 : p.x + 10, p.dead ? e.ay : p.y + 20, 0.25, sp(G, BK.wall.hungrySpd));
    e.x += e.vx; e.y += e.vy;
    const dx = cxOf(e) - e.ax, dy = cyOf(e) - e.ay, d = Math.hypot(dx, dy) || 1, L = BK.wall.hungryLeash;
    if (d > L) { e.x -= dx / d * (d - L); e.y -= dy / d * (d - L); e.vx *= 0.6; e.vy *= 0.6; }
    if ((cxOf(e) - front) * w.mdir < 24) e.x += w.mdir * 4;
    e.rot = Math.atan2(cyOf(e) - e.ay, cxOf(e) - e.ax);
    e.frame = (e.t >> 3) & 1;
  },
  shadowhand(G, e) {
    const p = G.player;
    e.t++;
    e.dir = sign(p.x + 10 - cxOf(e));
    e.vx += (e.dir * sp(G, 1.6) - e.vx) * 0.1;
    if (e.onGround && e.hitX) e.vy = -5;
    e.frame = (e.t >> 3) & 1;
    if (e.t > 900) killEnemy(G, e, true);
  },
  monarch(G, e) {
    const p = G.player, K = BK.monarch, px = p.x + 10, py = p.y + 21;
    e.t++;
    // shrinks as it loses health (feet stay planted)
    const sc = K.minScale + (1 - K.minScale) * Math.max(0, e.hp / e.maxHp);
    if (Math.abs(sc - e.scale) > 0.01) { const mx = cxOf(e), by = e.y + e.h; e.scale = sc; e.w = Math.round(e.d.w * sc); e.h = Math.round(e.d.h * sc); e.x = mx - e.w / 2; e.y = by - e.h; }
    // chunks of gel break off into slimes
    if (e.split == null) e.split = e.maxHp * (1 - K.split);
    while (e.hp > 0 && e.hp < e.split) {
      e.split -= e.maxHp * K.split;
      if (G.enemies.filter(q => q.d.ai === 'hop' && !q.dead).length < K.maxSlimes) {
        const q = spawnEnemy(G, Math.random() < 0.6 ? 'cavegel' : 'gelhopper', cxOf(e) + rnd(-20, 20), cyOf(e));
        q.vy = -rnd(3, 6); q.vx = rnd(-3, 3);
      }
    }
    e.intangible = e.st !== 0;
    if (p.dead) {
      e.fade = Math.max(0, e.fade - 0.02); e.vx *= 0.9;
      if (e.fade <= 0) { G.msg('The Gel Monarch has departed.', CFG.bossColor); killEnemy(G, e, true); G.boss = null; }
      return;
    }
    const far = Math.abs(cxOf(e) - px) > K.teleFar * 16 || Math.abs(cyOf(e) - py) > 22 * 16;
    if (e.st === 0) {
      e.c++;
      e.airT = e.onGround ? 0 : (e.airT || 0) + 1;
      if (e.airT > 180) { e.st = 1; e.b = 0; e.c = 0; e.airT = 0; }
      else if (e.onGround) {
        if (!e.landed) { e.landed = true; e.squash = 0.22; G.fx.shake(e.big ? 6 : 2); G.fx.particles(cxOf(e), e.y + e.h, 10, '#4a8ce8', { spread: 3 }); }
        e.vx *= 0.75; e.a++;
        const wait = cd(G, K.wait);
        e.squash += ((e.a > wait - 12 ? 0.14 : 0) - e.squash) * 0.25;
        if (far || e.c > cd(G, K.teleEvery)) { e.st = 1; e.b = 0; e.c = 0; G.sfx('magic'); }
        else if (e.a > wait) {
          e.a = 0; e.jumps = (e.jumps || 0) + 1; e.landed = false;
          e.dir = sign(px - cxOf(e));
          e.big = e.jumps % K.bigEvery === 0;
          e.vy = -(e.big ? K.bigVy : K.hopVy); e.vx = e.dir * sp(G, e.big ? K.big : K.hop);
          e.squash = -0.18;
        }
      } else { e.squash += (-0.06 - e.squash) * 0.15; e.vx += (e.dir * sp(G, e.big ? K.big : K.hop) - e.vx) * 0.05; }
    } else if (e.st === 1) {
      // squish down into a puddle, then reappear next to the player
      e.b++; e.vx = 0; e.fade = Math.max(0, 1 - e.b / 40); e.squash = 0.4 * (1 - e.fade);
      if (e.b % 3 === 0) G.fx.particles(cxOf(e), e.y + e.h * 0.7, 3, '#6aa8ff', { spread: 2.5, grav: -0.02 });
      if (e.b >= 40) {
        const tx = Math.floor(px / 16), ty = Math.floor(py / 16), hw = Math.ceil(e.w / 32), ht = Math.ceil(e.h / 16) + 1;
        const spot = standSpot(G, tx, ty, 10, hw, ht) || standSpot(G, tx, ty, 5, hw, ht) || standSpot(G, tx, ty, 22, hw, ht) || standSpot(G, tx, ty, 34, hw, ht);
        if (spot) { e.x = spot[0] * 16 + 8 - e.w / 2; e.y = (spot[1] + 1) * 16 - e.h - 0.01; e.vy = 0; }
        e.st = 2; e.b = 0; e.landed = true;
      }
    } else {
      e.b++; e.fade = Math.min(1, e.b / 30); e.squash = 0.4 * (1 - e.fade);
      if (e.b % 3 === 0) G.fx.particles(cxOf(e), e.y + e.h * 0.7, 3, '#6aa8ff', { spread: 2.5, grav: -0.02 });
      if (e.b >= 30) { e.st = 0; e.a = 0; e.fade = 1; }
    }
  },
  rimehorn(G, e) {
    const p = G.player, K = BK.rimehorn, px = p.x + 10, py = p.y + 21, wd = G.world;
    e.t++;
    e.intangible = e.fade < 0.5;
    if (p.dead) {
      e.vx = e.dir * 1.2; e.anim += 0.08; e.frame = Math.floor(e.anim) & 1; e.fade = Math.max(0, e.fade - 0.006);
      if (e.fade <= 0) { G.msg('The Rimehorn wanders back into the blizzard.', CFG.bossColor); killEnemy(G, e, true); G.boss = null; }
      return;
    }
    const p2 = e.hp < e.maxHp * D(G).phase2;
    if (p2 && !e.p2) { e.p2 = true; e.st = 2; e.b = 0; }
    const foot = e.y + e.h;
    if (e.st === 0) {
      e.dir = sign(px - cxOf(e));
      const spd = sp(G, p2 ? K.walkP2 : K.walk);
      if (Math.abs(px - cxOf(e)) > 40) e.vx += (e.dir * spd - e.vx) * 0.15; else e.vx *= 0.8;
      if (e.onGround && e.hitX) e.vy = -8.5;
      e.anim += Math.abs(e.vx) * 0.05; e.frame = Math.floor(e.anim) & 1;
      const far = Math.abs(px - cxOf(e)) > 45 * 16 || Math.abs(py - (foot - 40)) > 18 * 16;
      e.farT = far ? (e.farT || 0) + 1 : 0;
      if (e.farT > 120) { e.st = 3; e.b = 0; e.farT = 0; return; }
      if (++e.a > cd(G, p2 ? K.attackEveryP2 : K.attackEvery) && e.onGround) { e.a = 0; e.b = 0; e.atk = ((e.atk || 0) + 1) % 3; e.st = e.atk === 2 ? 2 : 1; }
      if (p2 && ++e.c > cd(G, K.handsEvery)) {
        e.c = 0;
        for (let k = G.enemies.filter(q => q.key === 'shadowhand' && !q.dead).length; k < K.maxHands; k++) {
          const s = findFloorNear(G, Math.floor(px / 16), Math.floor(py / 16), 14);
          if (s) { spawnEnemy(G, 'shadowhand', s[0] * 16 + 8, (s[1] + 1) * 16 - 0.01); G.fx.particles(s[0] * 16 + 8, s[1] * 16, 8, '#3a2050', { spread: 2, grav: -0.03 }); }
        }
      }
    } else if (e.st === 1) {
      // ice spike wave: rear up, slam, and a line of spikes races along the ground
      e.vx *= 0.7; e.b++; e.frame = e.b < 26 ? 2 : 0;
      const len = p2 ? K.spikeLenP2 : K.spikeLen, step = K.spikeStep;
      if (e.b === 26) {
        G.sfx('roar'); G.fx.shake(8); G.fx.particles(cxOf(e), foot, 16, '#d8f0ff', { spread: 3.5 });
        e.waves = (p2 ? [-1, 1] : [sign(px - cxOf(e))]).map(dd => ({ d: dd, k: 1 }));
      }
      if (e.b > 26 && e.waves && (e.b - 26) % step === 0) {
        for (const w of e.waves) {
          if (w.k > len) continue;
          const tx = Math.floor((cxOf(e) + w.d * (e.w / 2 + w.k * 16)) / 16), fy = Math.floor((foot - 1) / 16);
          for (let y = fy - 5; y <= fy + 8; y++) {
            if (solidAt(wd, tx, y + 1) && !solidAt(wd, tx, y)) {
              const gy = (y + 1) * 16;
              makeProj(G, 'icespike', tx * 16 + 8, gy - 20, 0, 0, { dmg: K.spikeDmg, src: e.d.name, boss: true, gy, delay: K.spikeDelay, life: K.spikeDelay + 26 });
              break;
            }
          }
          w.k++;
        }
      }
      if (e.b > 26 + len * step + 24) { e.st = 0; e.waves = null; }
    } else if (e.st === 2) {
      // roar: darkness falls; in phase 2 the cave shakes debris loose
      e.vx *= 0.7; e.b++; e.frame = 2;
      if (e.b === 30) {
        G.sfx('roar'); G.fx.shake(14);
        const dist = Math.hypot(px - cxOf(e), py - cyOf(e));
        if (dist < K.roarRange) addBuff(p, 'dread', K.dread);
        if (dist < 170) hurtPlayer(G, K.roarDmg * D(G).bossDmg, sign(px - cxOf(e)), 'was flattened by the Rimehorn\'s roar');
        if (p2) for (let k = 0; k < K.debris; k++) makeProj(G, 'debris', px + rnd(-280, 280), py - rnd(300, 420), rnd(-0.4, 0.4), 0, { dmg: K.debrisDmg, src: e.d.name, boss: true });
      }
      if (e.b > 64) e.st = 0;
    } else {
      // burrow into the snow and resurface near the player
      e.b++; e.vx = 0;
      if (e.b <= 40) e.fade = 1 - e.b / 40;
      if (e.b % 3 === 0) G.fx.particles(cxOf(e), foot - 4, 4, '#e8f4ff', { spread: 3, grav: 0.05 });
      if (e.b === 40) { const s2 = standSpot(G, Math.floor(px / 16), Math.floor(py / 16), 16, 2, 9); if (s2) { e.x = s2[0] * 16 + 8 - e.w / 2; e.y = (s2[1] + 1) * 16 - e.h - 0.01; e.vy = 0; } }
      if (e.b > 40) e.fade = Math.min(1, (e.b - 40) / 30);
      if (e.b > 70) { e.st = 0; e.fade = 1; }
    }
  },
};

// ------------------------------------------------------------------ main update
const SELF_MOVE = new Set(['worm', 'tether', 'omni', 'warden', 'hand', 'wall', 'hungry']);
export function updateEnemies(G) {
  const p = G.player, wd = G.world;
  const pcx = p.x + 10, pcy = p.y + 21;
  const sw = p.swing;
  for (const e of G.enemies) {
    if (e.dead) continue;
    e.px = e.x; e.py = e.y;
    if (e.flash > 0) e.flash--;
    const d = e.d;
    AI[d.ai](G, e);
    if (d.boss || d.key === 'hand') G.lights.push({ x: cxOf(e), y: cyOf(e), r: 0.45, g: 0.3, b: 0.35 });
    if (e.dead) continue;
    if (!e.noGrav) { e.vy = Math.min(e.vy + 0.3, 10); }
    if (e.noCollide) { if (!SELF_MOVE.has(d.ai)) { e.x += e.vx; e.y += e.vy; } }
    else {
      const ovx = e.vx, ovy = e.vy;
      moveBody(wd, e);
      if (d.ai === 'flyer' || d.ai === 'bat' || d.ai === 'homing') { if (e.hitX) e.vx = -ovx * 0.7; if (e.hitY) e.vy = -ovy * 0.7; }
      const lq = liquidAt(wd, cxOf(e), cyOf(e));
      if (lq && !e.noGrav) { e.vx *= 0.9; e.vy *= 0.9; }
    }
    if (e.burn > 0) {
      e.burn--;
      if (e.burn % 20 === 0) { damageEnemyRaw(G, e, 4); }
      if (Math.random() < 0.3) G.fx.particles(cxOf(e), cyOf(e), 1, '#ff8020', { spread: 1, grav: -0.08, glow: true });
      if (e.dead) continue;
    }
    // despawn
    const far = Math.abs(cxOf(e) - pcx) > CFG.spawn.despawn * 16 || Math.abs(cyOf(e) - pcy) > CFG.spawn.despawn * 12;
    if (!d.boss && !d.minion && far) { e.dead = true; continue; }
    if (d.minion && !G.boss) { killEnemy(G, e, true); continue; }
    if (p.dead) continue;
    // contact damage
    const boxes = hitboxes(e);
    const harmless = e.intangible || (d.ai === 'hop' && p.stats.slimeFriend);
    for (let i = 0; i < boxes.length && !harmless; i++) {
      if (overlaps(boxes[i], p)) {
        const dmg = ((i > 0 && d.worm && d.worm.bodyDmg) ? d.worm.bodyDmg : d.dmg * (e.dmgMul || 1)) * (d.boss || d.minion ? D(G).bossDmg : D(G).dmg);
        const side = sign(pcx - (boxes[i].x + boxes[i].w / 2));
        if (hurtPlayer(G, dmg, side, 'was slain by ' + (d.boss ? 'the ' : 'a ') + d.name)) {
          if (d.inflict) addBuff(p, d.inflict[0], d.inflict[1]);
          // small flyers bounce off after landing a hit
          if (d.ai === 'flyer' || d.ai === 'bat') { e.vx = -side * 3.5; e.vy = -2.5; }
        }
        break;
      }
    }
    // melee swing
    if (sw && sw.active && !sw.hit.has(e.uid)) {
      for (const b of boxes) {
        if (swingHits(p, sw, b)) {
          sw.hit.add(e.uid);
          const crit = Math.random() * 100 < sw.crit;
          damageEnemy(G, e, sw.dmg, sw.kb, p.dir, crit, sw.inflict);
          break;
        }
      }
    }
  }
  G.enemies = G.enemies.filter(e => !e.dead);
}
function damageEnemyRaw(G, e, n) {
  e.hp -= n;
  G.fx.text(cxOf(e), e.y, n, '#ff9030');
  if (e.hp <= 0) killEnemy(G, e);
}
function swingHits(p, sw, b) {
  const sx = p.x + 10, sy = p.y + 15;
  const nx = Math.max(b.x, Math.min(sx, b.x + b.w)), ny = Math.max(b.y, Math.min(sy, b.y + b.h));
  const dist = Math.hypot(nx - sx, ny - sy);
  if (dist > sw.len + 4) return false;
  if (dist < 12) return true;
  const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
  const a = Math.atan2(cy - sy, (cx - sx) * p.dir);
  return a >= sw.a0 - 0.45 && a <= sw.cur + 0.45;
}

export function updateProjectiles(G) {
  const wd = G.world, p = G.player;
  for (const pr of G.projectiles) {
    if (pr.dead) continue;
    pr.px = pr.x; pr.py = pr.y;
    const d = pr.d;
    if (++pr.t > pr.life) { pr.dead = true; continue; }
    if (d.ret) {
      if (pr.t > 28) pr.returning = true;
      if (pr.returning) {
        const dx = p.x + 10 - (pr.x + pr.w / 2), dy = p.y + 20 - (pr.y + pr.h / 2), dd = Math.hypot(dx, dy) || 1;
        pr.vx += (dx / dd * 11 - pr.vx) * 0.15; pr.vy += (dy / dd * 11 - pr.vy) * 0.15;
        if (dd < 20 || p.dead) { pr.dead = true; continue; }
      }
      pr.rot += 0.45;
    } else if (d.home && !p.dead) {
      const dx = p.x + 10 - pr.x, dy = p.y + 20 - pr.y, dd = Math.hypot(dx, dy) || 1, s = Math.hypot(pr.vx, pr.vy);
      pr.vx += dx / dd * d.home; pr.vy += dy / dd * d.home;
      const s2 = Math.hypot(pr.vx, pr.vy); pr.vx *= s / s2; pr.vy *= s / s2;
    }
    pr.vy += d.grav;
    if (d.noTiles || (d.ret && pr.returning)) { pr.x += pr.vx; pr.y += pr.vy; }
    else {
      pr.x += pr.vx;
      if (rectSolid(wd, pr.x, pr.y, pr.w, pr.h)) {
        if (pr.bounce > 0) { pr.x -= pr.vx; pr.vx = -pr.vx; pr.bounce--; }
        else if (d.ret) { pr.x -= pr.vx; pr.returning = true; }
        else { pr.dead = true; G.fx.particles(pr.x + pr.w / 2, pr.y + pr.h / 2, 4, d.col || '#c8a070', { spread: 1.5 }); continue; }
      }
      pr.y += pr.vy;
      if (rectSolid(wd, pr.x, pr.y, pr.w, pr.h)) {
        if (pr.bounce > 0) { pr.y -= pr.vy; pr.vy = -pr.vy; pr.bounce--; }
        else if (d.ret) { pr.y -= pr.vy; pr.returning = true; }
        else { pr.dead = true; G.fx.particles(pr.x + pr.w / 2, pr.y + pr.h / 2, 4, d.col || '#c8a070', { spread: 1.5 }); continue; }
      }
    }
    if (!d.ret) pr.rot = Math.atan2(pr.vy, pr.vx);
    if (d.light) G.lights.push({ x: pr.x + pr.w / 2, y: pr.y + pr.h / 2, r: d.light[0], g: d.light[1], b: d.light[2] });
    if (pr.friendly) {
      for (const e of G.enemies) {
        if (e.dead || pr.hit.has(e.uid)) continue;
        let hit = false;
        for (const b of hitboxes(e)) if (overlaps(pr, b)) { hit = true; break; }
        if (!hit) continue;
        pr.hit.add(e.uid);
        damageEnemy(G, e, pr.dmg, pr.kb, sign(pr.vx), Math.random() * 100 < pr.crit, d.inflict);
        if (d.ret) pr.returning = true;
        if (--pr.pierce <= 0) { pr.dead = true; break; }
      }
    } else if (d.hazard) {
      // ground hazards stay put and only hurt while fully erupted
      if (!p.dead && pr.t >= pr.delay && pr.t < pr.life - 8 && overlaps(pr, p) && hurtPlayer(G, pr.dmg * D(G).bossDmg, 0, 'was impaled by ' + (pr.src || 'ice')) && d.inflict) addBuff(p, d.inflict[0], d.inflict[1]);
    } else if (!p.dead && overlaps(pr, p)) {
      if (hurtPlayer(G, pr.dmg * (pr.boss ? D(G).bossDmg : D(G).dmg), sign(pr.vx), 'was slain by ' + (pr.src || 'a projectile')) && d.inflict) addBuff(p, d.inflict[0], d.inflict[1]);
      pr.dead = true;
    }
    if (Math.abs(pr.x - p.x) > 2400 || Math.abs(pr.y - p.y) > 1600) pr.dead = true;
  }
  G.projectiles = G.projectiles.filter(q => !q.dead);
}

// ------------------------------------------------------------------ spawning
function pickWeighted(list) {
  let tot = 0;
  for (const [, w] of list) tot += w;
  let r = Math.random() * tot;
  for (const [k, w] of list) { r -= w; if (r <= 0) return k; }
  return list[0][0];
}
export function trySpawn(G) {
  const p = G.player, wd = G.world, z = G.zone, C = CFG.spawn;
  if (p.dead) return;
  const tx = Math.floor((p.x + 10) / 16), ty = Math.floor((p.y + 21) / 16);
  let ctx, cfg;
  if (ty >= wd.hellLine) { ctx = 'hell'; cfg = C.hell; }
  else if (z.crypt && ty > wd.surfaceLine - 25) { ctx = 'crypt'; cfg = C.crypt; }
  else if (ty > wd.rockLine) { ctx = 'cavern'; cfg = C.under; }
  else if (ty > wd.surfaceLine) { ctx = 'under'; cfg = C.under; }
  else { ctx = G.time.isDay ? 'day' : 'night'; cfg = G.time.isDay ? C.day : C.night; }
  let rate = cfg.rate / D(G).spawnRate, cap = Math.round(cfg.cap * D(G).spawnCap);
  if (ctx === 'night' && G.time.bloodMoon) { rate /= C.bloodRate; cap *= C.bloodCap; }
  if ((ctx === 'day' || ctx === 'night') && G.townNPCs >= 2) cap = Math.max(1, Math.floor(cap * C.townCap));
  if (G.boss) { cap = Math.ceil(cap * C.bossCap); rate *= C.bossRate; }
  let n = 0;
  for (const e of G.enemies) if (!e.d.boss && !e.d.minion) n++;
  if (n >= cap || Math.random() * rate > 1) return;
  let list;
  const bio = z.blight ? 'blight' : z.jungle ? 'jungle' : z.snow ? 'snow' : z.desert ? 'desert' : 'forest';
  switch (ctx) {
    case 'hell': list = [['emberimp', 6], ['magmabat', 4]]; break;
    case 'crypt': list = [['caster', 5], ['ossling', 5]]; break;
    case 'day': list = { blight: [['rotflier', 7], ['gelhopper', 3]], jungle: [['snapvine', 4], ['gelhopper', 6]], snow: [['frostimp', 3], ['gelhopper', 7]], desert: [['scuttler', 5], ['dunegel', 5]], forest: [['gelhopper', 1]] }[bio]; break;
    case 'night': list = [['shambler', 5], ['peeper', 5]].concat({ blight: [['rotflier', 5]], jungle: [['snapvine', 3]], snow: [['frostimp', 3]], desert: [['scuttler', 3]], forest: [] }[bio]); break;
    case 'under': list = [['flitter', 35], ['grub', 20], ['cavegel', 45]].concat({ blight: [['rotflier', 40]], jungle: [['snapvine', 35]], snow: [['frostimp', 35]], desert: [['scuttler', 35]], forest: [] }[bio]); break;
    default: list = [['ossling', 35], ['flitter', 25], ['grub', 15], ['cavegel', 25]].concat({ blight: [['rotflier', 40]], jungle: [['snapvine', 40]], snow: [['frostimp', 40]], desert: [['scuttler', 30]], forest: [] }[bio]);
  }
  const key = pickWeighted(list), d = EN[key];
  const fly = d.noGrav && d.ai !== 'tether';
  for (let k = 0; k < 16; k++) {
    const sx = tx + (Math.random() < 0.5 ? -1 : 1) * Math.round(rnd(C.minDist, C.maxDist));
    let sy = ty + Math.round(rnd(-22, 22));
    if (sx < 2 || sx >= wd.w - 2 || sy < 2 || sy >= wd.h - 3) continue;
    if (fly) {
      if (solidAt(wd, sx, sy) || solidAt(wd, sx + 1, sy) || solidAt(wd, sx, sy + 1)) continue;
      if (d.worm && !solidAt(wd, sx, sy + 3)) { if (!solidAt(wd, sx, sy + 2)) continue; }
    } else {
      let found = false;
      for (let j = 0; j < 24; j++, sy++) {
        if (sy >= wd.h - 2) break;
        if (!solidAt(wd, sx, sy) && !solidAt(wd, sx, sy - 1) && !solidAt(wd, sx, sy - 2) && solidAt(wd, sx, sy + 1)) { found = true; break; }
      }
      if (!found) continue;
    }
    if (d.worm && !d.worm.air) { if (!solidAt(wd, sx, sy + 3)) continue; sy += 3; }
    if (wd.liq[sy * wd.w + sx] > 100 && key !== 'flitter') continue;
    const wl = wallAt(wd, sx, sy);
    if (wl === W.WOOD || wl === W.STONEB) continue;
    if (ctx === 'day' || ctx === 'night') { if (sy > wd.skyTop[sx] + 1) continue; }
    else if (lightAt(G, sx, sy) > 0.45) continue;
    spawnEnemy(G, key, sx * 16 + 8, (sy + 1) * 16 - 0.01);
    return;
  }
}
