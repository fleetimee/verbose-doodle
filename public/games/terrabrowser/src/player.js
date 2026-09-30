// Player: creation, movement, item use, mining/building, interaction, pickups, death/respawn.
import { CFG } from './config.js';
import { T, W, TILE, WALL, SOLID, NEEDS_GROUND, isGrass } from './tiles.js';
import { tileAt, wallAt, setTile, setWall, solidAt, inB, furnOrigin, canPlaceFurn, placeFurn, removeFurn } from './world.js';
import { moveBody, rectSolid, liquidAt, overlaps } from './physics.js';
import { ITEMS, SET_BONUS, addItem, canFit, potLoot, coinsToItems, dropItem, addBuff } from './items.js';
import { makeProj, hurtPlayer, killPlayer, summonBoss, onOrbBroken } from './enemies.js';
import { npcTalk } from './npcs.js';

const P = CFG.phys, PC = CFG.player;

export function newCharacter(name, look) {
  const inv = new Array(50).fill(null);
  inv[0] = { id: 'copper_sword', n: 1 };
  inv[1] = { id: 'copper_pickaxe', n: 1 };
  inv[2] = { id: 'copper_axe', n: 1 };
  return { id: 'c' + Date.now().toString(36), name, look, inv, coins: [null, null, null, null], armor: [null, null, null], acc: [null, null, null], maxHp: PC.hp, maxMana: PC.mana, created: Date.now() };
}
export function charData(p) {
  return { id: p.id, name: p.name, look: p.look, inv: p.inv, coins: p.coins, armor: p.armor, acc: p.acc, maxHp: p.maxHp, maxMana: p.maxMana, created: p.created, spawns: p.spawns || {} };
}
export function createPlayer(ch) {
  const p = {
    id: ch.id, name: ch.name, look: ch.look, created: ch.created,
    inv: ch.inv.map(s => s && { ...s }), coins: ch.coins.map(s => s && { ...s }), armor: ch.armor.slice(), acc: ch.acc.slice(),
    maxHp: ch.maxHp, maxMana: ch.maxMana, spawns: ch.spawns || {},
    x: 0, y: 0, px: 0, py: 0, w: PC.w, h: PC.h, vx: 0, vy: 0, dir: 1, onGround: false, stepUp: true, stepOff: 0, drop: 0,
    hp: ch.maxHp, mana: ch.maxMana, iframes: 0, dead: false, respawnT: 0, jumpT: 0, djUsed: false,
    sel: 0, useT: 0, useMax: 1, useKind: null, useAngle: 0, useItem: null, swing: null, hook: null,
    buffs: [], breath: PC.breath, fallY: null, regenT: 0, manaT: 0, walk: -1, wet: false, trash: null,
    stats: null, lifeMax: ch.maxHp,
  };
  recalcStats(p);
  return p;
}

export function recalcStats(p) {
  const s = { def: 0, speed: 0, dmg: 0, crit: 0, doubleJump: 0, noFall: 0, light: 0, kbImmune: 0, regen: 0, fireImmune: 0, maxHp: 0, slimeFriend: 0, dreadImmune: 0, chillImmune: 0 };
  for (const a of p.armor) if (a) s.def += ITEMS[a.id].def || 0;
  p.setBonus = null;
  const sets = p.armor.map(a => a && ITEMS[a.id].set);
  if (sets[0] && sets[0] === sets[1] && sets[1] === sets[2]) {
    const b = SET_BONUS[sets[0]];
    p.setBonus = b.text;
    for (const k in b) if (k !== 'text') s[k] += b[k];
  }
  for (const a of p.acc) if (a) { const e = ITEMS[a.id].acc; for (const k in e) s[k] += e[k]; }
  for (const b of p.buffs) {
    if (b.id === 'ironskin') s.def += 8;
    if (b.id === 'swift') s.speed += 0.25;
    if (b.id === 'shine') s.light = 1;
    if (b.id === 'chill') s.speed -= 0.4;
  }
  p.stats = s;
  p.lifeMax = Math.min(PC.hpCap + 20, p.maxHp + s.maxHp);
  if (p.hp > p.lifeMax) p.hp = p.lifeMax;
}

export function inReach(p, tx, ty, extra = 0) {
  const x0 = Math.floor(p.x / 16), x1 = Math.floor((p.x + p.w) / 16), y0 = Math.floor(p.y / 16), y1 = Math.floor((p.y + p.h) / 16);
  const dx = tx < x0 ? x0 - tx : tx > x1 ? tx - x1 : 0, dy = ty < y0 ? y0 - ty : ty > y1 ? ty - y1 : 0;
  return dx <= PC.reachX + extra && dy <= PC.reachY + extra;
}

// ------------------------------------------------------------------ respawn
export function placeAtSpawn(G) {
  const p = G.player, wd = G.world;
  let sx = wd.spawnX, sy = wd.spawnY;
  const bed = p.spawns[wd.id];
  if (bed && tileAt(wd, bed[0], bed[1]) === T.BED) { sx = bed[0] + 2; sy = bed[1] + 2; }
  else if (bed) { delete p.spawns[wd.id]; G.msg('Your bed is missing or obstructed.', '#ffd040'); }
  p.x = sx * 16 + 8 - p.w / 2; p.y = sy * 16 - p.h - 0.01;
  let k = 0;
  while (rectSolid(wd, p.x, p.y, p.w, p.h) && k++ < 200) p.y -= 16;
  p.px = p.x; p.py = p.y; p.vx = p.vy = 0; p.fallY = null;
}
function respawn(G) {
  const p = G.player;
  p.dead = false; p.hp = p.lifeMax; p.mana = p.maxMana; p.iframes = 120; p.breath = PC.breath;
  p.buffs = p.buffs.filter(b => b.id !== 'fire' && b.id !== 'poison' && b.id !== 'chill');
  placeAtSpawn(G);
  G.cam.snap = true;
}

// ------------------------------------------------------------------ main update
export function updatePlayer(G) {
  const p = G.player, I = G.input, wd = G.world;
  p.px = p.x; p.py = p.y;
  if (p.dead) { if (--p.respawnT <= 0) respawn(G); return; }
  if (G.tick % 15 === 0) recalcStats(p);
  if (p.iframes > 0) p.iframes--;
  for (const b of p.buffs) b.t--;
  if (p.buffs.some(b => b.t <= 0)) { p.buffs = p.buffs.filter(b => b.t > 0); recalcStats(p); }
  const free = !G.ui.typing && !G.ui.map;
  const left = free && (I.isDown('KeyA') || I.isDown('ArrowLeft'));
  const right = free && (I.isDown('KeyD') || I.isDown('ArrowRight'));
  const down = free && (I.isDown('KeyS') || I.isDown('ArrowDown'));
  const jumpHit = free && (I.hit('Space') || I.hit('KeyW') || I.hit('ArrowUp'));
  const jumpHeld = free && (I.isDown('Space') || I.isDown('KeyW') || I.isDown('ArrowUp'));
  // hotbar
  if (free) {
    for (let k = 0; k < 10; k++) if (I.hit('Digit' + ((k + 1) % 10))) p.sel = k;
    if (I.mouse.wheel && !G.ui.wheelUsed && p.useT === 0) p.sel = (p.sel + Math.sign(I.mouse.wheel) + 10) % 10;
    if (I.hit('KeyE')) fireHook(G);
    if (I.hit('KeyH')) quickHeal(G);
  }
  // liquids
  const lq = liquidAt(wd, p.x + 10, p.y + 30);
  const head = liquidAt(wd, p.x + 10, p.y + 6);
  const wet = !!lq && !lq.lava;
  if (wet && !p.wet) { G.sfx('splash'); G.fx.particles(p.x + 10, p.y + 30, 10, '#6ab0ff', { spread: 2.5 }); }
  p.wet = wet;
  if (lq && lq.lava && !p.stats.fireImmune) { if (hurtPlayer(G, 40, 0, 'tried to swim in lava')) addBuff(p, 'fire', 420); }
  const s = Math.max(0.3, 1 + p.stats.speed);
  const maxRun = P.maxRun * s * (wet ? P.waterMul : 1);
  const latched = p.hook && p.hook.st === 'latched';
  if (latched) {
    const dx = p.hook.x - (p.x + 10), dy = p.hook.y - (p.y + 15), d = Math.hypot(dx, dy);
    if (d > 20) { p.vx = dx / d * 10; p.vy = dy / d * 10; } else { p.vx *= 0.5; p.vy = 0; }
    if (left) p.vx -= 1; if (right) p.vx += 1;
    p.fallY = null; p.djUsed = false;
    if (left) p.dir = -1; else if (right) p.dir = 1;
  } else {
    const acc = p.onGround ? P.accel * s : P.airAccel * s;
    if (left && !right) {
      if (p.vx > -maxRun) p.vx = Math.max(-maxRun, p.vx - acc - (p.vx > 0 && p.onGround ? P.friction : 0));
      p.dir = -1;
    } else if (right && !left) {
      if (p.vx < maxRun) p.vx = Math.min(maxRun, p.vx + acc + (p.vx < 0 && p.onGround ? P.friction : 0));
      p.dir = 1;
    } else {
      const f = p.onGround ? P.friction : P.airFriction;
      p.vx = Math.abs(p.vx) <= f ? 0 : p.vx - Math.sign(p.vx) * f;
    }
    if (Math.abs(p.vx) > maxRun + 0.01) p.vx *= p.onGround ? 0.92 : 0.985;
  }
  if (p.onGround) p.djUsed = false;
  if (jumpHit) {
    if (latched) { p.hook = null; p.vy = -P.jumpSpeed; p.jumpT = P.jumpHold; }
    else if (p.onGround || wet) { p.vy = -P.jumpSpeed * (wet ? 0.75 : 1); p.jumpT = wet ? 8 : P.jumpHold; if (!wet) G.sfx('jump'); }
    else if (p.stats.doubleJump && !p.djUsed) {
      p.djUsed = true; p.vy = -P.jumpSpeed; p.jumpT = (P.jumpHold * 0.7) | 0; p.fallY = null;
      G.fx.particles(p.x + 10, p.y + 40, 12, '#e8f0ff', { spread: 2, grav: 0.02, life: 30 }); G.sfx('jump');
    }
  }
  if (p.jumpT > 0) { if (jumpHeld && !latched) { p.vy = -P.jumpSpeed * (wet ? 0.75 : 1); p.jumpT--; } else p.jumpT = 0; }
  if (!latched && p.jumpT === 0) { p.vy += wet ? P.waterGrav : P.grav; p.vy = Math.min(p.vy, wet ? P.waterMaxFall : P.maxFall); }
  if (down && p.onGround) p.drop = 8;
  const wasGround = p.onGround;
  moveBody(wd, p);
  p.stepOff *= 0.6; if (p.stepOff < 0.2) p.stepOff = 0;
  // fall damage
  if (wet || latched) p.fallY = null;
  else if (!p.onGround) { if (p.vy > 0 && p.fallY == null) p.fallY = p.y; if (p.vy < 0) p.fallY = null; }
  if (p.onGround && p.fallY != null) {
    const tiles = (p.y - p.fallY) / 16;
    if (tiles > PC.fallSafe && !p.stats.noFall) { p.iframes = 0; hurtPlayer(G, Math.round((tiles - PC.fallSafe) * PC.fallDmgPerTile), 0, 'fell to their death'); }
    if (!wasGround && tiles > 3) G.fx.particles(p.x + 10, p.y + 42, 4, '#9a8a70', { spread: 1.2, grav: 0.05 });
    p.fallY = null;
  }
  // breath
  if (head && !head.lava) {
    if (--p.breath < 0) { p.breath = 0; if (G.tick % 7 === 0) { p.hp -= 2; G.fx.text(p.x + 10, p.y, 2, '#ff4646'); if (p.hp <= 0) killPlayer(G, 'drowned'); } }
  } else p.breath = Math.min(PC.breath, p.breath + 3);
  // debuffs + regen
  const hasB = id => p.buffs.some(b => b.id === id);
  if (hasB('fire') && G.tick % 20 === 0) { dot(G, 3, 'burned to death'); G.fx.particles(p.x + 10, p.y + 20, 3, '#ff8020', { spread: 1, grav: -0.08, glow: true }); }
  if (hasB('poison') && G.tick % 30 === 0) dot(G, 2, 'succumbed to poison');
  p.regenT++;
  if (!hasB('fire') && !hasB('poison') && G.tick % 60 === 0 && !p.dead) {
    const rate = (p.regenT > 900 ? 2 : p.regenT > 360 ? 1 : 0) + p.stats.regen * 2;
    p.regenAcc = (p.regenAcc || 0) + rate * (G.diff ? G.diff.regen : 1);
    const heal = Math.floor(p.regenAcc);
    p.regenAcc -= heal;
    p.hp = Math.min(p.lifeMax, p.hp + heal);
  }
  p.manaT++;
  if (p.manaT > 50 && p.mana < p.maxMana && G.tick % (Math.abs(p.vx) < 0.1 ? 3 : 6) === 0) p.mana++;
  // tile damage decay
  if (G.tick % 30 === 0) for (const [i, e] of wd.dmg) if (G.tick - e.t > CFG.tileDecay) wd.dmg.delete(i);
  updateHook(G);
  useItems(G);
  // lights
  const held = p.inv[p.sel];
  if (held && ITEMS[held.id].light) { const l = ITEMS[held.id].light; G.lights.push({ x: p.x + 10 + p.dir * 10, y: p.y + 18, r: l[0], g: l[1], b: l[2] }); }
  if (p.stats.light) G.lights.push({ x: p.x + 10, y: p.y + 12, r: 0.85, g: 0.85, b: 0.7 });
  // animation
  p.walk = p.onGround && Math.abs(p.vx) > 0.15 ? (p.walk < 0 ? 0 : p.walk) + Math.abs(p.vx) * 0.17 : -1;
}
function dot(G, n, cause) {
  const p = G.player;
  p.hp -= n; p.regenT = 0;
  G.fx.text(p.x + 10, p.y, n, '#ff7030');
  if (p.hp <= 0) killPlayer(G, cause);
}
function quickHeal(G) {
  const p = G.player;
  for (let i = 0; i < 50; i++) {
    const s = p.inv[i];
    if (s && ITEMS[s.id].heal) { consume(G, s.id, i); return; }
  }
}

// ------------------------------------------------------------------ grappling hook
function fireHook(G) {
  const p = G.player;
  if (p.hook || p.dead) return;
  if (!p.inv.some(s => s && ITEMS[s.id].hook)) return;
  const m = G.mouseW, a = Math.atan2(m.y - (p.y + 15), m.x - (p.x + 10));
  p.hook = { x: p.x + 10, y: p.y + 15, vx: Math.cos(a) * 15, vy: Math.sin(a) * 15, st: 'fly', px: p.x + 10, py: p.y + 15 };
  G.sfx('hook');
}
function updateHook(G) {
  const p = G.player, h = p.hook, wd = G.world;
  if (!h) return;
  h.px = h.x; h.py = h.y;
  if (h.st === 'fly') {
    for (let k = 0; k < 3; k++) {
      h.x += h.vx / 3; h.y += h.vy / 3;
      const tx = Math.floor(h.x / 16), ty = Math.floor(h.y / 16), t = tileAt(wd, tx, ty);
      if (SOLID[t] || t === T.PLATFORM || t === T.TREE) { h.st = 'latched'; h.tx = tx; h.ty = ty; G.sfx('place'); p.jumpT = 0; return; }
    }
    if (Math.hypot(h.x - p.x - 10, h.y - p.y - 15) > 340) h.st = 'back';
  } else if (h.st === 'back') {
    const dx = p.x + 10 - h.x, dy = p.y + 15 - h.y, d = Math.hypot(dx, dy);
    if (d < 20) { p.hook = null; return; }
    h.x += dx / d * 20; h.y += dy / d * 20;
  } else {
    const t = tileAt(wd, h.tx, h.ty);
    if (!(SOLID[t] || t === T.PLATFORM || t === T.TREE)) p.hook = null;
    else if (G.input.isDown('KeyS')) p.hook = null;
  }
}

// ------------------------------------------------------------------ item use
function consumeSlot(p, idx) {
  const s = p.inv[idx];
  if (!s) return;
  if (--s.n <= 0) p.inv[idx] = null;
}
function useItems(G) {
  const p = G.player, I = G.input;
  if (p.useT > 0) {
    p.useT--;
    if (p.swing) {
      const k = 1 - p.useT / p.useMax;
      p.swing.cur = p.swing.a0 + (p.swing.a1 - p.swing.a0) * k;
      if (p.useT === 0) p.swing = null;
    }
    if (p.useT === 0) p.useKind = null;
    return;
  }
  const it = p.inv[p.sel];
  if (!it || !(I.mouse.l || I.mouse.lp) || G.ui.overUI || G.ui.cursor || G.ui.map || G.ui.consumed || G.ui.housingMode) return;
  const d = ITEMS[it.id];
  const auto = d.auto || d.place != null || d.wall != null || d.pick || d.axe || d.hammer;
  if (!auto && !I.mouse.lp) return;
  startUse(G, it, d);
}

function startUse(G, it, d) {
  const p = G.player, m = G.mouseW, wd = G.world;
  const tx = Math.floor(m.x / 16), ty = Math.floor(m.y / 16);
  const reach = inReach(p, tx, ty);
  const cx = p.x + 10, cy = p.y + 15;
  const ang = Math.atan2(m.y - cy, m.x - cx);
  p.dir = m.x < cx ? -1 : 1;
  p.useAngle = ang;
  p.useItem = it.id;
  const dmgMul = 1 + p.stats.dmg;
  const setUse = (ut, kind) => { p.useT = ut; p.useMax = ut; p.useKind = kind; };
  if (d.swing) {
    setUse(d.ut, 'swing');
    p.swing = { active: true, a0: -1.95, a1: 1.05, cur: -1.95, len: (d.len || 30) + 6, dmg: d.dmg * dmgMul, kb: d.kb, crit: (d.crit || 4) + p.stats.crit, hit: new Set(), inflict: d.inflict };
    G.sfx('swing');
    if ((d.pick || d.axe || d.hammer) && reach) toolHit(G, tx, ty, d);
    return;
  }
  const idx = p.sel;
  if (d.throwBoom) {
    if (G.projectiles.some(q => q.type === 'boomerang' && q.friendly)) return;
    setUse(d.ut, 'point');
    makeProj(G, 'boomerang', cx, cy, Math.cos(ang) * d.vel, Math.sin(ang) * d.vel, { dmg: d.dmg * dmgMul, kb: d.kb, crit: d.crit + p.stats.crit, friendly: true });
    G.sfx('swing');
    return;
  }
  if (d.ranged) {
    let ai = -1;
    for (let i = 0; i < 50; i++) { const s = p.inv[i]; if (s && ITEMS[s.id].ammoType === d.ammo) { ai = i; break; } }
    if (ai < 0) return;
    const ad = ITEMS[p.inv[ai].id];
    consumeSlot(p, ai);
    setUse(d.ut, 'point');
    makeProj(G, ad.proj, cx + Math.cos(ang) * 12, cy + Math.sin(ang) * 12, Math.cos(ang) * d.vel, Math.sin(ang) * d.vel, { dmg: (d.dmg + ad.dmg) * dmgMul, kb: d.kb, crit: d.crit + p.stats.crit, friendly: true });
    G.sfx(d.ammo === 'bullet' ? 'shoot' : 'bow');
    return;
  }
  if (d.magic) {
    if (p.mana < d.mana) return;
    p.mana -= d.mana; p.manaT = 0;
    setUse(d.ut, 'point');
    const n = d.multi || 1;
    for (let k = 0; k < n; k++) {
      const a = ang + (k - (n - 1) / 2) * 0.12;
      makeProj(G, d.shoot, cx + Math.cos(a) * 16, cy + Math.sin(a) * 16, Math.cos(a) * d.vel, Math.sin(a) * d.vel, { dmg: d.dmg * dmgMul, kb: d.kb, crit: d.crit + p.stats.crit, friendly: true });
    }
    G.sfx('magic');
    return;
  }
  if (d.place != null) {
    if (!reach) return;
    if (placeTile(G, tx, ty, d.place)) { consumeSlot(p, idx); setUse(12, 'place'); }
    return;
  }
  if (d.wall != null) {
    if (!reach) return;
    if (placeWall(G, tx, ty, d.wall)) { consumeSlot(p, idx); setUse(8, 'place'); }
    return;
  }
  if (d.seeds) {
    if (!reach) return;
    if (tileAt(wd, tx, ty) === T.DIRT && (!solidAt(wd, tx, ty - 1) || !solidAt(wd, tx - 1, ty) || !solidAt(wd, tx + 1, ty))) { setTile(wd, tx, ty, T.GRASS); consumeSlot(p, idx); setUse(12, 'place'); G.sfx('place'); }
    return;
  }
  if (d.bucket != null) {
    if (!reach || !inB(wd, tx, ty)) return;
    const i = ty * wd.w + tx;
    if (d.bucket === 0) {
      if (wd.liq[i] > 30) {
        const lava = wd.ltype[i] === 1;
        wd.liq[i] = 0; consumeSlot(p, idx);
        const left = addItem(p, lava ? 'lava_bucket' : 'water_bucket', 1);
        if (left) dropItem(G, lava ? 'lava_bucket' : 'water_bucket', 1, p.x + 10, p.y + 10);
        setUse(15, 'place'); G.sfx('splash');
      }
    } else if (!SOLID[wd.tile[i]] && wd.liq[i] < 40) {
      wd.liq[i] = 255; wd.ltype[i] = d.bucket === 2 ? 1 : 0;
      consumeSlot(p, idx); addItem(p, 'empty_bucket', 1) && dropItem(G, 'empty_bucket', 1, p.x + 10, p.y + 10);
      setUse(15, 'place'); G.sfx('splash');
    }
    return;
  }
  if (d.consume) { consume(G, it.id, idx); return; }
  if (d.hook) fireHook(G);
}

function consume(G, id, idx) {
  const p = G.player, d = ITEMS[id];
  if (d.heal) {
    if (p.buffs.some(b => b.id === 'sick')) return;
    const h = Math.min(d.heal, p.lifeMax - p.hp);
    p.hp += h; addBuff(p, 'sick', Math.round(PC.potionSick * (G.diff ? G.diff.sick : 1)));
    G.fx.text(p.x + 10, p.y - 4, h, '#50ff78');
  }
  if (d.manaRestore) { const m = Math.min(d.manaRestore, p.maxMana - p.mana); p.mana += m; G.fx.text(p.x + 10, p.y - 4, m, '#5080ff'); }
  if (d.buff) { addBuff(p, d.buff[0], d.buff[1]); recalcStats(p); }
  if (d.maxHp) {
    if (p.maxHp >= PC.hpCap) { G.msg('You already have maximum life.', '#c8c8c8'); return; }
    p.maxHp += d.maxHp; recalcStats(p); p.hp += d.maxHp;
    G.fx.text(p.x + 10, p.y - 4, d.maxHp, '#50ff78'); G.fx.particles(p.x + 10, p.y + 20, 20, '#ff5070', { spread: 3, glow: true });
  }
  if (d.maxMana) {
    if (p.maxMana >= PC.manaCap) { G.msg('You already have maximum mana.', '#c8c8c8'); return; }
    p.maxMana += d.maxMana; p.mana += d.maxMana;
    G.fx.particles(p.x + 10, p.y + 20, 20, '#5080ff', { spread: 3, glow: true });
  }
  if (d.summon && !summonBoss(G, d.summon)) return;
  consumeSlot(p, idx);
  p.useT = p.useMax = 17; p.useKind = 'use';
  G.sfx(d.summon ? 'roar' : d.maxHp || d.maxMana ? 'crystal' : 'drink');
}

// ------------------------------------------------------------------ mining + building
let lastWarn = 0;
function warn(G, text) { if (G.tick - lastWarn > 90) { lastWarn = G.tick; G.msg(text, '#c8c8c8'); } }

export function toolHit(G, tx, ty, d) {
  const wd = G.world, t = tileAt(wd, tx, ty);
  if (!inB(wd, tx, ty)) return;
  const td = TILE[t];
  if (t === T.AIR || (!SOLID[t] && td.tool !== 'any' && !d.axe && !d.pick && !d.hammer)) { if (t === T.AIR && d.hammer) hammerWall(G, tx, ty, d.hammer); return; }
  let pow = 0;
  if (td.tool === 'axe') pow = d.axe ? d.axe * 5 : 0;
  else if (td.tool === 'hammer') pow = d.hammer || 0;
  else if (td.tool === 'any') pow = Math.max(d.pick || 0, d.axe ? d.axe * 5 : 0, d.hammer || 0);
  else if (td.tool === 'pick') pow = d.pick || 0;
  if (!pow) { if (d.hammer && !SOLID[t]) hammerWall(G, tx, ty, d.hammer); return; }
  if (td.locked && !G.flags.cryptOpen) { G.sfx('tink'); warn(G, 'The crypt resists your efforts. Something guards this place...'); return; }
  if (td.tool === 'pick' && d.pick < td.minPick) { G.sfx('tink'); warn(G, 'You need a stronger pickaxe to mine ' + td.name + '.'); return; }
  const above = tileAt(wd, tx, ty - 1);
  if (SOLID[t] && (above === T.TREE || above === T.CACTUS)) { G.sfx('tink'); return; }
  const i = ty * wd.w + tx;
  const e = wd.dmg.get(i) || { d: 0, t: 0 };
  e.d += pow; e.t = G.tick;
  if (e.d >= td.hp || td.instant) { wd.dmg.delete(i); breakTile(G, tx, ty); }
  else {
    wd.dmg.set(i, e);
    const c = td.map;
    G.fx.particles(tx * 16 + 8, ty * 16 + 8, 3, `rgb(${c[0]},${c[1]},${c[2]})`, { spread: 1.5 });
    G.sfx(td.sound === 'stone' ? 'stone' : td.sound === 'wood' ? 'wood' : 'dig');
  }
}

function hammerWall(G, tx, ty, pow) {
  const wd = G.world, wl = wallAt(wd, tx, ty);
  if (!wl) return;
  const i = ty * wd.w + tx;
  const e = wd.wdmg.get(i) || { d: 0 };
  e.d += pow;
  const hp = WALL[wl].natural ? 50 : 30;
  const c = WALL[wl].col;
  G.fx.particles(tx * 16 + 8, ty * 16 + 8, 3, c, { spread: 1.5 });
  G.sfx('dig');
  if (e.d >= hp) {
    setWall(wd, tx, ty, W.NONE);
    if (WALL[wl].drop) dropItem(G, WALL[wl].drop, 1, tx * 16 + 8, ty * 16 + 8);
  } else wd.wdmg.set(i, e);
}

export function breakTile(G, x, y, depth = 0) {
  const wd = G.world, t = tileAt(wd, x, y);
  if (!t || !inB(wd, x, y) || depth > 40) return false;
  const td = TILE[t], c = td.map, col = `rgb(${c[0]},${c[1]},${c[2]})`;
  if (td.furn) {
    const [ox, oy] = furnOrigin(wd, x, y), f = td.furn;
    if (t === T.CHEST) {
      const key = ox + ',' + oy, ch = wd.chests.get(key);
      if (ch && ch.some(Boolean)) { warn(G, 'The chest must be empty first.'); return false; }
      if (G.ui.chest === key) G.ui.chest = null;
    }
    removeFurn(wd, ox, oy);
    const mx = (ox + f.w / 2) * 16, my = (oy + f.h / 2) * 16;
    if (td.drop) dropItem(G, td.drop, 1, mx, my);
    if (t === T.POT) {
      const depth2 = oy >= wd.hellLine ? 2 : G.zone.crypt ? 3 : oy > wd.rockLine ? 1 : 0;
      for (const it of potLoot(depth2, G.rng)) dropItem(G, it.id, it.n, mx, my);
      G.fx.particles(mx, my, 14, '#a0604a', { spread: 2.5 }); G.sfx('pot');
    } else if (t === T.ORB) {
      G.fx.particles(mx, my, 24, '#b060e0', { spread: 3, glow: true }); G.sfx('orb');
      for (const it of coinsToItems(200 + Math.random() * 300)) dropItem(G, it.id, it.n, mx, my);
      if (Math.random() < 0.3) dropItem(G, 'flintlock_popper', 1, mx, my);
      dropItem(G, 'lead_shot', 40 + Math.floor(Math.random() * 40), mx, my);
      onOrbBroken(G);
    } else G.fx.particles(mx, my, 10, col, { spread: 2 });
    for (let dx = 0; dx < f.w; dx++) supportCheck(G, ox + dx, oy - 1, depth);
    if (t !== T.POT && t !== T.ORB) G.sfx(td.sound === 'stone' ? 'stone' : 'wood');
    return true;
  }
  if (t === T.TREE || t === T.CACTUS) {
    let yy = y, n = 0;
    while (tileAt(wd, x, yy) === t) {
      const m = wd.meta[yy * wd.w + x];
      setTile(wd, x, yy, T.AIR);
      n++;
      if (t === T.TREE && (m & 4)) { dropItem(G, 'wood', 2 + Math.floor(Math.random() * 3), x * 16 + 8, yy * 16); if (Math.random() < 0.7) dropItem(G, 'acorn', 1 + (Math.random() < 0.3 ? 1 : 0), x * 16 + 8, yy * 16); G.fx.particles(x * 16 + 8, yy * 16 - 24, 20, '#3e9a3a', { spread: 3, life: 50 }); }
      yy--;
    }
    dropItem(G, t === T.TREE ? 'wood' : 'cactus', n, x * 16 + 8, y * 16);
    G.fx.particles(x * 16 + 8, y * 16 + 8, 8, col, { spread: 2 });
    G.sfx('wood');
    return true;
  }
  setTile(wd, x, y, T.AIR);
  if (td.drop) dropItem(G, td.drop, 1, x * 16 + 8, y * 16 + 8);
  G.fx.particles(x * 16 + 8, y * 16 + 8, 8, col, { spread: 2 });
  G.sfx(td.sound === 'stone' ? 'stone' : td.sound === 'wood' ? 'wood' : td.sound === 'glass' ? 'glass' : 'dig');
  supportCheck(G, x, y - 1, depth);
  // hanging vines below
  let vy = y + 1;
  while (tileAt(wd, x, vy) === T.VINE) { setTile(wd, x, vy, T.AIR); vy++; }
  // unsupported torches around
  for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1]]) {
    const ax = x + dx, ay = y + dy;
    if (tileAt(wd, ax, ay) === T.TORCH && !wallAt(wd, ax, ay) && !solidAt(wd, ax - 1, ay) && !solidAt(wd, ax + 1, ay) && !solidAt(wd, ax, ay + 1)) breakTile(G, ax, ay, depth + 1);
  }
  return true;
}
function supportCheck(G, x, y, depth) {
  const wd = G.world, t = tileAt(wd, x, y);
  if (!t || !inB(wd, x, y)) return;
  if (NEEDS_GROUND.has(t) || t === T.TREE || t === T.CACTUS) { if (t === T.TREE && tileAt(wd, x, y + 1) === T.TREE) return; breakTile(G, x, y, depth + 1); return; }
  const td = TILE[t];
  if (td.furn && t !== T.TORCH) {
    const [ox, oy] = furnOrigin(wd, x, y);
    if (t === T.DOOR || t === T.DOOR_OPEN) { if (!solidAt(wd, ox, oy - 1) || !solidAt(wd, ox, oy + 3)) breakTile(G, x, y, depth + 1); return; }
    if (oy + td.furn.h - 1 === y && t !== T.ORB && t !== T.CRYPT_DOOR && t !== T.BELL) breakTile(G, x, y, depth + 1);
  }
}

export function placeTile(G, tx, ty, t) {
  const wd = G.world, p = G.player;
  if (!inB(wd, tx, ty)) return false;
  const td = TILE[t];
  if (td.furn) {
    const f = td.furn;
    const ox = tx - ((f.w - 1) >> 1), oy = t === T.DOOR ? ty - 1 : ty - (f.h - 1);
    if (!canPlaceFurn(wd, ox, oy, t)) return false;
    if (t === T.DOOR && overlaps({ x: ox * 16, y: oy * 16, w: 16, h: 48 }, p)) return false;
    placeFurn(wd, ox, oy, t, p.dir < 0 ? 1 : 0);
    G.sfx('place');
    return true;
  }
  const cur = tileAt(wd, tx, ty);
  if (cur !== T.AIR && cur !== T.PLANT && cur !== T.VINE) return false;
  const i = ty * wd.w + tx;
  if (t === T.TORCH) {
    if (wd.liq[i] > 20) return false;
    if (!wallAt(wd, tx, ty) && !solidAt(wd, tx - 1, ty) && !solidAt(wd, tx + 1, ty) && !solidAt(wd, tx, ty + 1)) return false;
  } else if (t === T.SAPLING) {
    if (!isGrass(tileAt(wd, tx, ty + 1)) || tileAt(wd, tx, ty - 1) !== T.AIR) return false;
  } else {
    const anchored = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const n = tileAt(wd, tx + dx, ty + dy); return n && n !== T.VINE && n !== T.PLANT; }) || wallAt(wd, tx, ty);
    if (!anchored) return false;
    if (SOLID[t]) {
      const r = { x: tx * 16, y: ty * 16, w: 16, h: 16 };
      if (overlaps(r, p)) return false;
      for (const e of G.enemies) if (!e.noCollide && overlaps(r, e)) return false;
      for (const n of G.npcs) if (overlaps(r, n)) return false;
    }
  }
  setTile(wd, tx, ty, t);
  G.fx.particles(tx * 16 + 8, ty * 16 + 8, 3, `rgb(${td.map.join(',')})`, { spread: 1 });
  G.sfx('place');
  return true;
}
function placeWall(G, tx, ty, wl) {
  const wd = G.world;
  if (!inB(wd, tx, ty) || wallAt(wd, tx, ty)) return false;
  const ok = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => wallAt(wd, tx + dx, ty + dy) || solidAt(wd, tx + dx, ty + dy)) || solidAt(wd, tx, ty);
  if (!ok) return false;
  setWall(wd, tx, ty, wl);
  G.sfx('place');
  return true;
}

// ------------------------------------------------------------------ right-click interactions
export function interact(G) {
  const p = G.player, m = G.mouseW, wd = G.world;
  if (p.dead) return false;
  for (const n of G.npcs) {
    if (m.x >= n.x - 4 && m.x <= n.x + n.w + 4 && m.y >= n.y && m.y <= n.y + n.h && Math.abs(n.x - p.x) < 180 && Math.abs(n.y - p.y) < 140) {
      G.ui.talk = n; G.ui.talkText = npcTalk(G, n); G.ui.shop = null; G.ui.chest = null; G.ui.guide = false;
      n.talking = 1; G.sfx('click');
      return true;
    }
  }
  const tx = Math.floor(m.x / 16), ty = Math.floor(m.y / 16);
  if (!inReach(p, tx, ty, 1)) return false;
  const t = tileAt(wd, tx, ty);
  if (t === T.CHEST) {
    const [ox, oy] = furnOrigin(wd, tx, ty), key = ox + ',' + oy;
    if (!wd.chests.has(key)) wd.chests.set(key, new Array(40).fill(null));
    G.ui.chest = G.ui.chest === key ? null : key; G.ui.inv = true; G.ui.talk = null; G.ui.shop = null;
    G.sfx('open');
    return true;
  }
  if (t === T.DOOR || t === T.DOOR_OPEN) {
    const [ox, oy] = furnOrigin(wd, tx, ty);
    toggleDoor(G, ox, oy, t === T.DOOR, p.x + 10 > ox * 16 + 8 ? 1 : 0);
    return true;
  }
  if (t === T.BED) {
    const [ox, oy] = furnOrigin(wd, tx, ty);
    p.spawns[wd.id] = [ox, oy];
    G.msg('Spawn point set!', '#ffd040');
    return true;
  }
  if (t === T.BELL) {
    const [ox, oy] = furnOrigin(wd, tx, ty);
    if (G.flags.cryptOpen) G.msg('The bell is silent now.', '#c8c8c8');
    else if (G.time.isDay) G.msg('The bell tolls, but nothing answers. Perhaps at night...', '#c8c8c8');
    else summonBoss(G, 'warden', [ox, oy]);
    G.sfx('bell');
    return true;
  }
  if (t === T.CRYPT_DOOR) { G.msg('The door is sealed tight. Ring the Grave Bell at night...', '#c8c8c8'); return true; }
  return false;
}
export function toggleDoor(G, ox, oy, open, flip) {
  const wd = G.world;
  if (!open) {
    const r = { x: ox * 16, y: oy * 16, w: 16, h: 48 };
    if (overlaps(r, G.player) || G.npcs.some(n => overlaps(r, n))) return false;
  }
  for (let k = 0; k < 3; k++) setTile(wd, ox, oy + k, open ? T.DOOR_OPEN : T.DOOR, (k << 2) | (flip << 4));
  G.sfx('door');
  return true;
}

// ------------------------------------------------------------------ dropped items
export function updateDrops(G) {
  const p = G.player, wd = G.world;
  const pcx = p.x + 10, pcy = p.y + 21;
  let removed = false;
  for (const it of G.items) {
    it.px = it.x; it.py = it.y; it.t++;
    const d = ITEMS[it.id];
    if (it.id === 'fallen_star') {
      G.lights.push({ x: it.x + 6, y: it.y + 6, r: 0.8, g: 0.8, b: 0.4 });
      if (G.time.isDay) { it.n = 0; G.fx.particles(it.x + 6, it.y + 6, 8, '#ffe070', { spread: 2, glow: true }); removed = true; continue; }
    }
    const dx = pcx - (it.x + 6), dy = pcy - (it.y + 6), dist = Math.hypot(dx, dy);
    const want = !p.dead && it.t > 20 && (d.pickupHeal ? true : canFit(p, it.id));
    if (want && dist < PC.grab + (d.coin ? 60 : 0)) {
      const s = Math.min(8, 2 + (PC.grab - dist) * 0.1);
      it.vx += (dx / dist * s - it.vx) * 0.2; it.vy += (dy / dist * s - it.vy) * 0.2;
      it.x += it.vx; it.y += it.vy;
      if (dist < 18) {
        if (d.pickupHeal) { const h = Math.min(d.pickupHeal, p.lifeMax - p.hp); p.hp += h; G.fx.text(pcx, p.y - 4, h, '#50ff78'); G.sfx('pickup'); it.n = 0; removed = true; continue; }
        const left = addItem(p, it.id, it.n);
        if (left < it.n) {
          G.fx.text(pcx, p.y - 10, d.name + (it.n - left > 1 ? ' (' + (it.n - left) + ')' : ''), CFG.rarity[d.rar] || '#fff', false, true);
          G.sfx(d.coin ? 'coin' : 'pickup');
        }
        it.n = left;
        if (!left) { removed = true; continue; }
      }
    } else {
      it.vy = Math.min(it.vy + 0.2, 5);
      moveBody(wd, it);
      if (it.onGround) it.vx *= 0.8;
      const lq = liquidAt(wd, it.x + 6, it.y + 6);
      if (lq) { it.vy *= 0.8; if (lq.lava && !d.coin && it.t > 30 && it.id !== 'cinder_effigy') { it.n = 0; removed = true; G.fx.particles(it.x + 6, it.y + 6, 5, '#ff6020', { grav: -0.1 }); } }
    }
    if (it.t > 36000 && !d.coin) { it.n = 0; removed = true; }
  }
  if (G.tick % 60 === 0) {
    for (let i = 0; i < G.items.length; i++) {
      const a = G.items[i];
      if (!a.n) continue;
      for (let j = i + 1; j < G.items.length; j++) {
        const b = G.items[j];
        if (b.n && b.id === a.id && Math.abs(a.x - b.x) < 24 && Math.abs(a.y - b.y) < 24 && a.n + b.n <= ITEMS[a.id].stack) { a.n += b.n; b.n = 0; removed = true; }
      }
    }
  }
  if (removed) G.items = G.items.filter(i => i.n > 0);
  if (G.items.length > 400) G.items.splice(0, G.items.length - 400);
}
