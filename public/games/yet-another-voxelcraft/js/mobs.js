import * as THREE from 'three';
import * as B from './blocks.js';
import { Arrow } from './entities.js';

const S = 1 / 16;
const rnd = (x, y, s) => { let h = Math.imul(x * 374761393 + y * 668265263 + s * 2147483647, 1274126177); h ^= h >>> 13; return ((h * 1274126177) >>> 0) / 4294967296; };

// per-face texture strip: 6 faces x 8px. faces order: +x -x +y -y +z(front) -z
function skin(base, o = {}) {
  const cv = document.createElement('canvas'); cv.width = 48; cv.height = 8; const c = cv.getContext('2d');
  const jit = o.jit === undefined ? 14 : o.jit;
  for (let f = 0; f < 6; f++) for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    let col = (o.faceCol && o.faceCol[f]) || base;
    if (o.pattern) col = o.pattern(f, x, y, col) || col;
    const k = (rnd(x + f * 8, y, o.seed || 1) - 0.5) * jit;
    c.fillStyle = `rgb(${Math.max(0, Math.min(255, col[0] + k)) | 0},${Math.max(0, Math.min(255, col[1] + k)) | 0},${Math.max(0, Math.min(255, col[2] + k)) | 0})`;
    c.fillRect(f * 8 + x, y, 1, 1);
  }
  if (o.front) o.front(c, 32); // draw on +z face at x offset 32
  if (o.top) o.top(c, 16);
  const t = new THREE.CanvasTexture(cv); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false;
  return t;
}
const px = (c, ox, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(ox + x, y, w, h); };

function makePart(group, parts, name, size, pos, off, tex, parent) {
  const g = new THREE.BoxGeometry(size[0] * S, size[1] * S, size[2] * S);
  const uv = g.attributes.uv;
  for (let f = 0; f < 6; f++) for (let v = 0; v < 4; v++) { const i = f * 4 + v; uv.setX(i, (f + uv.getX(i)) / 6); }
  g.translate(off[0] * S, off[1] * S, off[2] * S);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tex }));
  m.position.set(pos[0] * S, pos[1] * S, pos[2] * S);
  (parent || group).add(m); parts[name] = m; return m;
}

const SPEC = {
  pig: { hw: 0.42, h: 0.9, hp: 10, spd: 1.5, passive: true, snd: 'pig', drops: [[B.PORK_RAW, 1, 3]] },
  cow: { hw: 0.45, h: 1.4, hp: 10, spd: 1.4, passive: true, snd: 'cow', drops: [[B.BEEF_RAW, 1, 3]] },
  sheep: { hw: 0.45, h: 1.3, hp: 8, spd: 1.4, passive: true, snd: 'sheep', drops: [[B.WOOL, 1, 1], [B.MUTTON_RAW, 1, 2]] },
  zombie: { hw: 0.3, h: 1.95, hp: 20, spd: 2.0, snd: 'zombie', drops: [[B.ROTTEN_FLESH, 0, 2]], burns: true, dmg: 2, rare: [[B.IRON_INGOT, 0.03]] },
  skeleton: { hw: 0.3, h: 1.95, hp: 20, spd: 2.0, snd: 'skeleton', drops: [[B.BONE, 0, 2], [B.ARROW, 0, 2]], burns: true, ranged: true },
  creeper: { hw: 0.3, h: 1.65, hp: 20, spd: 2.1, snd: 'creeper', drops: [[B.GUNPOWDER, 0, 2]], creeper: true },
  spider: { hw: 0.6, h: 0.85, hp: 16, spd: 3.2, snd: 'spider', drops: [[B.STRING, 0, 2]], dmg: 1.5, spider: true },
};
export const MOB_KINDS = Object.keys(SPEC);

function humanoid(kind) {
  const parts = {}, group = new THREE.Group();
  const zombie = kind === 'zombie';
  const skinC = zombie ? [90, 140, 70] : [200, 200, 190], shirt = zombie ? [50, 100, 160] : [190, 190, 180], pants = zombie ? [60, 50, 120] : [170, 170, 160];
  const face = skin(skinC, { seed: 3, front: (c, o) => {
    if (zombie) { px(c, o, 1, 3, 2, 2, '#1c2a3a'); px(c, o, 5, 3, 2, 2, '#1c2a3a'); px(c, o, 3, 5, 2, 1, '#2a3a20'); px(c, o, 2, 6, 4, 1, '#4a2a2a'); }
    else { px(c, o, 1, 3, 2, 2, '#111'); px(c, o, 5, 3, 2, 2, '#111'); px(c, o, 3, 5, 2, 1, '#666'); px(c, o, 2, 6, 4, 1, '#222'); px(c, o, 3, 7, 2, 1, '#222'); }
  } });
  makePart(group, parts, 'head', [8, 8, 8], [0, 24, 0], [0, 4, 0], face);
  makePart(group, parts, 'body', [8, 12, 4], [0, 12, 0], [0, 6, 0], skin(shirt, { seed: 5, pattern: !zombie ? (f, x, y) => (y % 2 === 0 && f < 6 && x > 0 && x < 7 ? [90, 90, 84] : null) : null }));
  const armT = skin(zombie ? skinC : skinC, { seed: 6 });
  makePart(group, parts, 'armL', [4, 12, 4], [6, 22, 0], [0, -4, 0], zombie ? skin(shirt, { seed: 7, faceCol: [skinC, skinC, skinC, skinC, skinC, skinC].map((c, i) => (i === 3 ? skinC : (i === 2 ? shirt : shirt))) }) : armT);
  makePart(group, parts, 'armR', [4, 12, 4], [-6, 22, 0], [0, -4, 0], zombie ? skin(shirt, { seed: 8 }) : armT);
  makePart(group, parts, 'legL', [4, 12, 4], [2, 12, 0], [0, -6, 0], skin(pants, { seed: 9 }));
  makePart(group, parts, 'legR', [4, 12, 4], [-2, 12, 0], [0, -6, 0], skin(pants, { seed: 10 }));
  if (!zombie) { for (const n of ['armL', 'armR']) parts[n].scale.set(0.5, 1, 0.5); for (const n of ['legL', 'legR']) parts[n].scale.set(0.5, 1, 0.5); parts.body.scale.set(0.9, 1, 0.8); }
  return { group, parts };
}
function spider() {
  const parts = {}, group = new THREE.Group();
  const dk = [58, 50, 48];
  const face = skin(dk, { seed: 31, front: (c, o) => { px(c, o, 1, 2, 2, 2, '#d01818'); px(c, o, 5, 2, 2, 2, '#d01818'); px(c, o, 3, 3, 1, 1, '#b01010'); px(c, o, 4, 3, 1, 1, '#b01010'); px(c, o, 2, 5, 4, 1, '#c8c8c8'); } });
  makePart(group, parts, 'head', [8, 8, 8], [0, 7, 9], [0, 0, 0], face);
  makePart(group, parts, 'thorax', [6, 6, 6], [0, 7, 2], [0, 0, 0], skin([70, 60, 56], { seed: 32 }));
  makePart(group, parts, 'abdomen', [10, 8, 12], [0, 7, -8], [0, 0, 0], skin([50, 42, 40], { seed: 33, pattern: (f, x, y) => (f === 2 && (x + y) % 3 === 0 ? [120, 30, 30] : null) }));
  const lt = skin([40, 34, 34], { seed: 34 });
  for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) {
    const m = makePart(group, parts, (sd < 0 ? 'legL' : 'legR') + i, [16, 2, 2], [sd * 3, 7, 4.5 - i * 3], [sd * 8, 0, 0], lt);
    m.rotation.z = -sd * 0.55; m.rotation.y = sd * (i - 1.5) * 0.35; m.userData.base = [m.rotation.z, m.rotation.y];
  }
  return { group, parts };
}
function creeper() {
  const parts = {}, group = new THREE.Group();
  const cam = (f, x, y, c) => { const n = rnd(x + f * 8, y, 12); return n < 0.5 ? [c[0] * 0.8, c[1] * 0.85, c[2] * 0.8] : n < 0.75 ? [c[0] * 1.1, c[1] * 1.05, c[2]] : null; };
  const g = [70, 180, 70];
  const face = skin(g, { seed: 11, jit: 30, front: (c, o) => { px(c, o, 1, 2, 2, 2, '#0a1a0a'); px(c, o, 5, 2, 2, 2, '#0a1a0a'); px(c, o, 3, 4, 2, 2, '#0a1a0a'); px(c, o, 2, 5, 1, 2, '#0a1a0a'); px(c, o, 5, 5, 1, 2, '#0a1a0a'); } });
  makePart(group, parts, 'head', [8, 8, 8], [0, 18, 0], [0, 4, 0], face);
  makePart(group, parts, 'body', [8, 12, 4], [0, 6, 0], [0, 6, 0], skin(g, { seed: 12, jit: 30, pattern: cam }));
  const lt = skin(g, { seed: 13, jit: 30, pattern: cam });
  for (const [n, x, z] of [['legFL', 2, 4], ['legFR', -2, 4], ['legBL', 2, -4], ['legBR', -2, -4]]) makePart(group, parts, n, [4, 6, 4], [x, 6, z * 0.5 + (z > 0 ? 0 : 0)], [0, -3, 0], lt);
  parts.legFL.position.z = parts.legFR.position.z = 2 * S; parts.legBL.position.z = parts.legBR.position.z = -2 * S;
  return { group, parts };
}
function quad(kind) {
  const parts = {}, group = new THREE.Group();
  const cfg = {
    pig: { c: [240, 160, 160], body: [10, 8, 16], by: 10, leg: [4, 6, 4], lx: 3, lz: 5, headP: [0, 12, 8], head: [8, 8, 8], legY: 6 },
    cow: { c: [80, 56, 40], body: [12, 10, 18], by: 17, leg: [4, 12, 4], lx: 4, lz: 6, headP: [0, 20, 9], head: [8, 8, 6], legY: 12 },
    sheep: { c: [236, 236, 232], body: [10, 9, 16], by: 15, leg: [4, 12, 4], lx: 3, lz: 5, headP: [0, 18, 8], head: [6, 6, 8], legY: 12 },
  }[kind];
  const patch = kind === 'cow' ? (f, x, y, col) => (rnd(x + (f >> 1) * 3, y + (f & 1) * 5, 21) < 0.28 ? [232, 232, 226] : null) : null;
  makePart(group, parts, 'body', cfg.body, [0, cfg.by, 0], [0, 0, 0], skin(cfg.c, { seed: 22, pattern: patch, jit: kind === 'sheep' ? 26 : 14 }));
  const faceFn = (c, o) => {
    if (kind === 'pig') { px(c, o, 1, 3, 2, 2, '#fff'); px(c, o, 2, 3, 1, 2, '#222'); px(c, o, 5, 3, 2, 2, '#fff'); px(c, o, 5, 3, 1, 2, '#222'); px(c, o, 2, 5, 4, 3, '#f0a0a0'); px(c, o, 3, 6, 1, 1, '#a04848'); px(c, o, 5, 6, 1, 1, '#a04848'); }
    else if (kind === 'cow') { px(c, o, 1, 2, 2, 2, '#fff'); px(c, o, 1, 3, 1, 1, '#111'); px(c, o, 5, 2, 2, 2, '#fff'); px(c, o, 6, 3, 1, 1, '#111'); px(c, o, 2, 5, 4, 3, '#c9b39a'); px(c, o, 3, 6, 1, 1, '#4a3a2a'); px(c, o, 5, 6, 1, 1, '#4a3a2a'); }
    else { px(c, o, 1, 3, 2, 2, '#fff'); px(c, o, 2, 3, 1, 2, '#222'); px(c, o, 5, 3, 2, 2, '#fff'); px(c, o, 5, 3, 1, 2, '#222'); px(c, o, 3, 6, 2, 1, '#8a6a5a'); }
  };
  const headCol = kind === 'pig' ? [240, 160, 160] : kind === 'cow' ? [80, 56, 40] : [196, 170, 140];
  makePart(group, parts, 'head', cfg.head, cfg.headP, [0, 0, cfg.head[2] / 2 - 1], skin(headCol, { seed: 23, front: faceFn }));
  if (kind === 'pig') makePart(group, parts, 'snout', [4, 3, 1], [0, 10.5, 16.2], [0, 0, 0], skin([250, 180, 180], { seed: 24 }));
  if (kind === 'cow') { for (const s of [-1, 1]) makePart(group, parts, 'horn' + s, [1, 2, 1], [s * 4.4, 24.5, 9], [0, 0, 0], skin([230, 226, 210], {})); }
  const legC = kind === 'pig' ? [232, 150, 150] : kind === 'cow' ? [70, 50, 36] : [200, 186, 170];
  for (const [n, x, z] of [['legFL', 1, 1], ['legFR', -1, 1], ['legBL', 1, -1], ['legBR', -1, -1]])
    makePart(group, parts, n, cfg.leg, [x * cfg.lx * 0.9, cfg.legY, z * (cfg.lz - 1)], [0, -cfg.leg[1] / 2, 0], skin(legC, { seed: 25 }));
  return { group, parts };
}

const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };

export class Mob {
  constructor(game, kind, x, y, z) {
    const sp = SPEC[kind]; this.game = game; this.kind = kind; this.sp = sp;
    this.x = x; this.y = y; this.z = z; this.vx = this.vy = this.vz = 0; this.hw = sp.hw; this.h = sp.h;
    this.hp = sp.hp; this.yaw = Math.random() * 6.28; this.dead = false; this.deadT = 0; this.hurtT = 0; this.fleeT = 0;
    this.walk = 0; this.amp = 0; this.wanderT = 1 + Math.random() * 3; this.wanderDir = this.yaw; this.moving = false;
    this.cool = 0; this.fuse = -1; this.shootT = 1 + Math.random() * 2; this.fireT = 0; this.soundT = 3 + Math.random() * 8; this.age = 0; this.strafe = Math.random() < 0.5 ? 1 : -1;
    const m = kind === 'zombie' || kind === 'skeleton' ? humanoid(kind) : kind === 'creeper' ? creeper() : kind === 'spider' ? spider() : quad(kind);
    this.group = m.group; this.parts = m.parts; game.scene.add(this.group);
    this.mats = []; this.group.traverse((o) => { if (o.material) this.mats.push(o.material); });
    // blob shadow
    this.shadow = new THREE.Mesh(new THREE.CircleGeometry(sp.hw * 1.15, 12).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    game.scene.add(this.shadow);
    if (kind === 'sheep') this.wool = true;
  }
  remove() { this.dead = true; this.game.scene.remove(this.group); this.game.scene.remove(this.shadow); this.shadow.geometry.dispose(); this.shadow.material.dispose(); }
  hurt(dmg, sx, sz, byPlayer) {
    if (this.dead || this.deadT > 0) return;
    this.hp -= dmg; this.hurtT = 0.4;
    const dx = this.x - sx, dz = this.z - sz, d = Math.hypot(dx, dz) || 1;
    this.vx += dx / d * 6; this.vz += dz / d * 6; this.vy = 5;
    this.game.sound.play('hit', { pos: this });
    if (this.sp.passive) { this.fleeT = 5; this.fleeFrom = { x: sx, z: sz }; this.game.sound.play(this.sp.snd, { pos: this }); }
    if (this.sp.spider) this.angry = true;
    if (this.hp <= 0) this.die(byPlayer);
  }
  die(byPlayer) {
    this.deadT = 0.001; this.game.sound.play('death', { pos: this, vol: 0.6 });
    const g = this.game;
    for (const [id, lo, hi] of this.sp.drops) { const n = lo + Math.floor(Math.random() * (hi - lo + 1)); if (n > 0) g.spawnItem(id, n, this.x, this.y + 0.5, this.z); }
    if (this.sp.rare) for (const [id, p] of this.sp.rare) if (Math.random() < p) g.spawnItem(id, 1, this.x, this.y + 0.5, this.z);
    if (byPlayer && g.onKill) g.onKill(this.kind);
    if (this.sp.creeper && !this.exploded) { /* creepers drop only */ }
  }
  lightColor() { return this.game.lightAt(this.x, this.y + this.h * 0.6, this.z); }
  update(dt) {
    const g = this.game, w = g.world, p = g.player, sp = this.sp;
    this.age += dt;
    if (!w.loaded(this.x, this.z)) return;
    if (this.deadT > 0) { this.deadT += dt; this.group.rotation.z = Math.min(1, this.deadT * 4) * Math.PI / 2; this.group.position.set(this.x, this.y, this.z); this.setShadow(); if (this.deadT > 0.9) { g.particles.burst(this.x, this.y + 0.5, this.z, [220, 220, 220], 12, 2); this.remove(); } return; }
    // environment
    const inWater = w.getBlock(Math.floor(this.x), Math.floor(this.y + 0.4), Math.floor(this.z)) === B.WATER;
    const inLava = w.getBlock(Math.floor(this.x), Math.floor(this.y + 0.2), Math.floor(this.z)) === B.LAVA;
    if (inLava) { this.fireT = 6; this.hp -= 4 * dt; if (this.hp <= 0) this.die(false); }
    if (sp.burns && !inWater) {
      const lv = w.getLight(Math.floor(this.x), Math.floor(this.y + this.h), Math.floor(this.z));
      if (g.env.day > 0.75 && (lv >> 4) >= 14 && !g.raining) this.fireT = Math.max(this.fireT, 4);
    }
    if (inWater) this.fireT = 0;
    if (this.fireT > 0) {
      this.fireT -= dt; this.burnAcc = (this.burnAcc || 0) + dt; if (this.burnAcc > 1) { this.burnAcc = 0; this.hp -= 1.5; this.hurtT = 0.3; if (this.hp <= 0) { this.die(false); return; } }
      if (Math.random() < 0.5) g.particles.spawn(this.x + (Math.random() - 0.5) * 0.5, this.y + Math.random() * this.h, this.z + (Math.random() - 0.5) * 0.5, 0, 1.5, 0, Math.random() < 0.5 ? [255, 150, 30] : [255, 220, 80], 0.09, 0.5, -1);
    }
    // AI
    let wantX = 0, wantZ = 0, speed = 0, face = null;
    const dxp = p.x - this.x, dzp = p.z - this.z, dist = Math.hypot(dxp, dzp), dyp = p.y - this.y;
    const canSee = !p.dead && !p.creative;
    if (sp.passive) {
      if (this.fleeT > 0 && this.fleeFrom) { this.fleeT -= dt; const fx = this.x - this.fleeFrom.x, fz = this.z - this.fleeFrom.z; const d = Math.hypot(fx, fz) || 1; wantX = fx / d; wantZ = fz / d; speed = sp.spd * 2.4; }
      else {
        this.wanderT -= dt;
        if (this.wanderT <= 0) { if (this.moving) { this.moving = false; this.wanderT = 2 + Math.random() * 5; } else { this.moving = true; this.wanderT = 1.5 + Math.random() * 3.5; this.wanderDir = Math.random() * 6.283; } }
        if (this.moving) { wantX = Math.sin(this.wanderDir); wantZ = Math.cos(this.wanderDir); speed = sp.spd; }
      }
      // avoid deep water/cliffs ahead
      if (speed > 0) {
        const ax = this.x + wantX * 1.2, az = this.z + wantZ * 1.2;
        const ground = this.groundBelow(ax, this.y + 0.5, az, 3);
        if (ground === null || w.getBlock(Math.floor(ax), Math.floor(ground), Math.floor(az)) === B.WATER || w.getBlock(Math.floor(ax), Math.floor(ground), Math.floor(az)) === B.LAVA) { this.wanderDir += Math.PI * (0.6 + Math.random() * 0.8); wantX = wantZ = 0; speed = 0; }
      }
    } else {
      const detect = sp.ranged ? 18 : 22;
      const dusk = sp.spider ? (this.angry || this.game.lightAt(p.x, p.y + 1, p.z) < 0.42) : true;
      if (canSee && dusk && dist < detect && Math.abs(dyp) < 12) {
        if (sp.ranged) {
          face = Math.atan2(dxp, dzp);
          const los = dist < 16 && this.hasLOS(p);
          if (dist < 6) { wantX = -dxp / dist; wantZ = -dzp / dist; speed = sp.spd; }
          else if (dist > 11 || !los) { wantX = dxp / dist; wantZ = dzp / dist; speed = sp.spd; }
          else { wantX = -dzp / dist * this.strafe; wantZ = dxp / dist * this.strafe; speed = sp.spd * 0.6; }
          this.shootT -= dt;
          if (los && this.shootT <= 0) { this.shootT = 1.6 + Math.random(); this.shoot(p); }
          if (Math.random() < dt * 0.3) this.strafe *= -1;
        } else if (sp.creeper) {
          if (dist < 3.2 && Math.abs(dyp) < 2) {
            if (this.fuse < 0) { this.fuse = 0; g.sound.play('fuse', { pos: this }); }
            this.fuse += dt; speed = 0; face = Math.atan2(dxp, dzp);
            if (this.fuse > 1.5) { this.explode(); return; }
          } else {
            if (this.fuse >= 0) { this.fuse -= dt * 2; if (this.fuse < 0) this.fuse = -1; }
            wantX = dxp / dist; wantZ = dzp / dist; speed = sp.spd;
          }
        } else {
          wantX = dxp / dist; wantZ = dzp / dist; speed = dist < 1.15 ? 0 : sp.spd;
          this.cool -= dt;
          if (sp.spider && dist < 4 && dist > 1.6 && this.onGround && this.cool <= 0) { this.vy = 6.5; this.vx = wantX * 7; this.vz = wantZ * 7; this.cool = 1.2; }
          const inReach = dist < (sp.spider ? 1.45 : 1.3) && Math.abs(dyp) < 1.7;
          if (inReach && this.cool <= 0) { this.windup = (this.windup || 0) + dt; speed *= 0.3; this.armSwing = Math.max(this.armSwing || 0, 0.15); if (this.windup > 0.5) { this.windup = 0; this.cool = 1.1; p.hurt(sp.dmg * g.difficulty, this.x, this.z); this.armSwing = 0.3; } }
          else if (!inReach) this.windup = 0;
        }
      } else {
        this.wanderT -= dt;
        if (this.wanderT <= 0) { if (this.moving) { this.moving = false; this.wanderT = 2 + Math.random() * 4; } else { this.moving = true; this.wanderT = 1.5 + Math.random() * 3; this.wanderDir = Math.random() * 6.283; } }
        if (this.moving) { wantX = Math.sin(this.wanderDir); wantZ = Math.cos(this.wanderDir); speed = sp.spd * 0.5; }
      }
    }
    if (inWater) speed *= 0.6;
    // steer velocity
    const tvx = wantX * speed, tvz = wantZ * speed, k = Math.min(1, dt * (this.onGround ? 10 : 3));
    this.vx += (tvx - this.vx) * k; this.vz += (tvz - this.vz) * k;
    if (speed > 0.05) { const ty = face !== null ? face : Math.atan2(wantX, wantZ); const d = angDiff(this.yaw, ty); this.yaw += Math.max(-1, Math.min(1, d)) * Math.min(1, dt * 9) * (Math.abs(d) > 1 ? 1 : 1); }
    else if (face !== null) { const d = angDiff(this.yaw, face); this.yaw += d * Math.min(1, dt * 8); }
    // physics
    this.vy -= 28 * dt; if (this.vy < -45) this.vy = -45;
    if (inWater) { this.vy = Math.min(this.vy + 40 * dt, 1.8); this.vx *= 0.92; this.vz *= 0.92; }
    if (this.onGround && (this.hitX || this.hitZ) && speed > 0) this.vy = 8.6;
    else if (inWater && (this.hitX || this.hitZ)) this.vy = 4;
    w.moveEntity(this, this.vx * dt, this.vy * dt, this.vz * dt);
    if (this.y < -10) { this.remove(); return; }
    // animation
    const hs = Math.hypot(this.vx, this.vz); this.amp += ((hs > 0.2 ? Math.min(1, hs / 2) : 0) - this.amp) * Math.min(1, dt * 10); this.walk += hs * dt * 4.2;
    this.animate(dt);
    this.group.position.set(this.x, this.y, this.z); this.group.rotation.y = this.yaw;
    // lighting / hurt tint
    this.hurtT = Math.max(0, this.hurtT - dt);
    let l = this.lightColor(), r = l, gg = l, b = l;
    if (this.hurtT > 0) { gg *= 0.35; b *= 0.35; r = Math.min(1.4, r * 1.3); }
    if (this.fuse >= 0) { const f = Math.floor(this.fuse * 8) % 2 === 0 ? 1.8 : 1; r *= f; gg *= f; b *= f; }
    for (const m of this.mats) m.color.setRGB(r, gg, b);
    this.setShadow();
    // ambient sound
    this.soundT -= dt; if (this.soundT <= 0) { this.soundT = 6 + Math.random() * 12; if (dist < 18 && !(sp.creeper)) g.sound.play(sp.snd, { pos: this, vol: 0.9 }); }
  }
  setShadow() {
    const gr = this.groundBelow(this.x, this.y + 0.3, this.z, 6);
    if (gr === null) { this.shadow.visible = false; return; }
    this.shadow.visible = true; this.shadow.position.set(this.x, gr + 0.02, this.z);
    const dh = this.y - gr; this.shadow.material.opacity = Math.max(0, 0.34 - dh * 0.08);
  }
  groundBelow(x, y, z, maxD) {
    const w = this.game.world; const bx = Math.floor(x), bz = Math.floor(z);
    for (let yy = Math.floor(y); yy > y - maxD; yy--) { if (B.SOLID[w.getBlock(bx, yy, bz)] || w.getBlock(bx, yy, bz) === B.WATER) return yy + 1; }
    return null;
  }
  hasLOS(p) {
    const w = this.game.world, ex = this.x, ey = this.y + 1.6, ez = this.z, tx = p.x, ty = p.y + 1.4, tz = p.z;
    const dx = tx - ex, dy = ty - ey, dz = tz - ez, d = Math.hypot(dx, dy, dz);
    const hit = w.raycast(ex, ey, ez, dx / d, dy / d, dz / d, d);
    return !hit;
  }
  shoot(p) {
    const g = this.game, ex = this.x, ey = this.y + 1.55, ez = this.z;
    const tx = p.x + p.vx * 0.25, ty = p.y + 1.2, tz = p.z + p.vz * 0.25;
    const dx = tx - ex, dy = ty - ey, dz = tz - ez, d = Math.hypot(dx, dy, dz), sp = 22;
    const inacc = 0.06 * d / 10 + 0.03;
    g.projectiles.push(new Arrow(g, ex, ey, ez, dx / d * sp + (Math.random() - 0.5) * inacc * sp, dy / d * sp + d * 0.22 + (Math.random() - 0.5) * inacc * sp, dz / d * sp + (Math.random() - 0.5) * inacc * sp, true, 2 * g.difficulty));
    g.sound.play('bow', { pos: this }); this.armSwing = 0.25;
  }
  explode() {
    this.exploded = true; this.remove(); this.game.explode(this.x, this.y + 0.8, this.z, 3.2 + (this.game.difficulty > 1 ? 0.4 : 0));
  }
  animate(dt) {
    const P = this.parts, a = Math.sin(this.walk) * this.amp * 0.9, k = this.kind, t = this.age;
    if (k === 'zombie' || k === 'skeleton') {
      P.legL.rotation.x = a; P.legR.rotation.x = -a;
      this.armSwing = Math.max(0, (this.armSwing || 0) - dt);
      const raise = k === 'zombie' ? -1.45 : -0.2, sw = this.armSwing > 0 ? Math.sin(this.armSwing / 0.3 * Math.PI) * 0.9 : 0;
      P.armL.rotation.x = k === 'zombie' ? raise - sw + Math.sin(t * 1.5) * 0.05 : -a - 0.1; P.armR.rotation.x = k === 'zombie' ? raise - sw - Math.sin(t * 1.5) * 0.05 : a - 0.1 - sw;
      if (k === 'skeleton' && this.shootT < 0.5) { P.armL.rotation.x = -1.4; P.armR.rotation.x = -1.4; }
    } else if (k === 'spider') {
      for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) {
        const m = P[(sd < 0 ? 'legL' : 'legR') + i], b = m.userData.base, ph = this.walk * 1.6 + i * 1.6 + (sd > 0 ? Math.PI : 0);
        m.rotation.z = b[0] + Math.sin(ph) * 0.28 * this.amp * -sd; m.rotation.y = b[1] + Math.cos(ph) * 0.32 * this.amp;
      }
    } else if (k === 'creeper') {
      P.legFL.rotation.x = P.legBR.rotation.x = a; P.legFR.rotation.x = P.legBL.rotation.x = -a;
      if (this.fuse > 0) this.group.scale.setScalar(1 + Math.sin(this.fuse * 18) * 0.06 * this.fuse + this.fuse * 0.12); else this.group.scale.setScalar(1);
    } else {
      P.legFL.rotation.x = P.legBR.rotation.x = a; P.legFR.rotation.x = P.legBL.rotation.x = -a;
      if (P.head) { const pl = this.game.player; P.head.rotation.x = 0; P.head.rotation.y = 0; if (Math.hypot(pl.x - this.x, pl.z - this.z) < 6 && !this.fleeT) { const d = angDiff(this.yaw, Math.atan2(pl.x - this.x, pl.z - this.z)); P.head.rotation.y = Math.max(-0.7, Math.min(0.7, d)); } P.head.rotation.x = Math.sin(t * 0.7) * 0.05; }
    }
    if (k === 'zombie' || k === 'skeleton') { const pl = this.game.player; const d = angDiff(this.yaw, Math.atan2(pl.x - this.x, pl.z - this.z)); P.head.rotation.y = Math.abs(d) < 1.2 ? d * 0.7 : 0; }
  }
}
