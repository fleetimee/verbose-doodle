import * as THREE from 'three';
import * as B from './blocks.js';
import { Arrow } from './entities.js';

const REACH = 5.0;
export class Player {
  constructor(game) {
    this.game = game;
    this.x = 0; this.y = 80; this.z = 0; this.vx = this.vy = this.vz = 0; this.hw = 0.3; this.h = 1.8;
    this.yaw = 0; this.pitch = 0; this.onGround = false; this.flying = false; this.creative = false;
    this.health = 20; this.hunger = 20; this.sat = 5; this.exh = 0; this.air = 10; this.dead = false; this.invuln = 0;
    this.inv = new Array(36).fill(null); this.sel = 0; this.xp = 0; this.armor = [null, null, null, null]; this.drawT = 0;
    this.fallDist = 0; this.regenT = 0; this.starveT = 0; this.stepT = 0; this.bob = 0; this.hurtFlash = 0;
    this.mineT = 0; this.mineKey = ''; this.attackCd = 0; this.placeCd = 0; this.eatT = 0; this.swing = 0;
    this.target = null; this.mobTarget = null; this.jumpCd = 0; this.lastSpace = 0; this.inWater = false; this.headWater = false;
    this.spawn = { x: 0, y: 80, z: 0 }; this.kbx = 0; this.kbz = 0; this.step = true;
  }
  get eyeY() { return this.y + (this.sneaking ? 1.47 : 1.62); }
  held() { return this.inv[this.sel]; }
  // ------------------------------------------------------------ inventory
  maxStack(id) { return (B.ITEMS[id] && B.ITEMS[id].stack) || 64; }
  canAccept(id) {
    const ms = this.maxStack(id);
    for (const s of this.inv) if (!s || (s.id === id && s.n < ms)) return true; return false;
  }
  addItem(id, n, d) {
    const ms = this.maxStack(id);
    if (ms > 1) for (let i = 0; i < 36 && n > 0; i++) { const s = this.inv[i]; if (s && s.id === id && s.n < ms) { const t = Math.min(n, ms - s.n); s.n += t; n -= t; } }
    for (let i = 0; i < 36 && n > 0; i++) if (!this.inv[i]) { const t = Math.min(n, ms); this.inv[i] = { id, n: t }; if (d !== undefined) this.inv[i].d = d; n -= t; }
    this.game.ui.dirtyInv = true;
    if (this.game.onGet) this.game.onGet(id);
    return n;
  }
  countItem(id) { let c = 0; for (const s of this.inv) if (s && s.id === id) c += s.n; return c; }
  takeItem(id) { for (let i = 0; i < 36; i++) { const s = this.inv[i]; if (s && s.id === id) { s.n--; if (s.n <= 0) this.inv[i] = null; this.game.ui.dirtyInv = true; return true; } } return false; }
  armorPts() { let p = 0; for (const a of this.armor) if (a) p += B.ITEMS[a.id].armor.pts; return p; }
  useHeld(dur = 1) {
    const s = this.held(); if (!s || this.creative) return;
    const it = B.ITEMS[s.id]; if (!it || !it.tool) return;
    if (s.d === undefined) s.d = it.tool.dur;
    s.d -= dur;
    if (s.d <= 0) { this.inv[this.sel] = null; this.game.sound.play('break', { sound: 'wood', vol: 0.8 }); }
    this.game.ui.dirtyInv = true;
  }
  consumeHeld() { const s = this.held(); if (!s || this.creative) return; s.n--; if (s.n <= 0) this.inv[this.sel] = null; this.game.ui.dirtyInv = true; }
  // ------------------------------------------------------------ damage
  hurt(dmg, sx, sz) {
    if (this.dead || this.creative || this.invuln > 0) return;
    const pts = this.armorPts();
    if (pts > 0 && dmg > 0.5) { dmg *= 1 - Math.min(20, pts) * 0.04; for (let i = 0; i < 4; i++) { const a = this.armor[i]; if (a) { if (a.d === undefined) a.d = B.ITEMS[a.id].armor.dur; a.d--; if (a.d <= 0) { this.armor[i] = null; this.game.sound.play('break', { sound: 'stone', vol: 0.8 }); } } } this.game.ui.dirtyInv = true; this.game.ui.armorSig = ''; }
    this.health -= dmg; this.invuln = 0.5; this.hurtFlash = 0.5;
    if (sx !== undefined) { const dx = this.x - sx, dz = this.z - sz, d = Math.hypot(dx, dz) || 1; this.kbx = dx / d * 5.5; this.kbz = dz / d * 5.5; this.vy = Math.max(this.vy, 4.2); this.onGround = false; }
    this.game.sound.play('hurt'); this.exh += 0.1;
    if (this.health <= 0) { this.health = 0; this.die(); }
  }
  die() {
    this.dead = true;
    const g = this.game;
    for (let i = 0; i < 36; i++) { const s = this.inv[i]; if (s) { g.spawnItem(s.id, s.n, this.x, this.y + 1, this.z, s.d); this.inv[i] = null; } }
    for (let i = 0; i < 4; i++) { const s = this.armor[i]; if (s) { g.spawnItem(s.id, 1, this.x, this.y + 1, this.z, s.d); this.armor[i] = null; } }
    g.ui.dirtyInv = true; g.onPlayerDeath();
  }
  respawn() {
    this.dead = false; this.health = 20; this.hunger = 20; this.sat = 5; this.air = 10; this.vx = this.vy = this.vz = 0; this.kbx = this.kbz = 0; this.fireT = 0; this.fallDist = 0;
    this.x = this.spawn.x; this.y = this.spawn.y; this.z = this.spawn.z;
  }
  // ------------------------------------------------------------ physics
  update(dt, input) {
    const g = this.game, w = g.world;
    if (this.dead) return;
    this.invuln = Math.max(0, this.invuln - dt); this.hurtFlash = Math.max(0, this.hurtFlash - dt);
    this.attackCd = Math.max(0, this.attackCd - dt); this.placeCd = Math.max(0, this.placeCd - dt); this.jumpCd = Math.max(0, this.jumpCd - dt);
    this.swing = Math.max(0, this.swing - dt * 4.5);
    const bx = Math.floor(this.x), bz = Math.floor(this.z);
    this.inWater = w.getBlock(bx, Math.floor(this.y + 0.4), bz) === B.WATER;
    this.headWater = w.getBlock(bx, Math.floor(this.eyeY), bz) === B.WATER;
    const inLava = w.getBlock(bx, Math.floor(this.y + 0.3), bz) === B.LAVA || w.getBlock(bx, Math.floor(this.y + 1.2), bz) === B.LAVA;
    this.sneaking = input.sneak && !this.flying;
    this.sprinting = input.sprint && input.fwd > 0 && !this.sneaking && (this.hunger > 6 || this.creative);
    // wish direction
    let f = input.fwd, s = input.strafe; const l = Math.hypot(f, s); if (l > 1) { f /= l; s /= l; }
    const sy = Math.sin(this.yaw), cy = Math.cos(this.yaw);
    const wx = -sy * f + cy * s, wz = -cy * f - sy * s;
    let speed = 4.3;
    if (this.sprinting) speed = 5.7; if (this.sneaking) speed = 1.6;
    if (this.flying) speed = this.sprinting ? 20 : 10.5;
    if (this.inWater && !this.flying) speed *= 0.55;
    if (this.eatT > 0) speed *= 0.5;
    const tx = wx * speed, tz = wz * speed;
    const accel = this.flying ? 8 : this.onGround ? 14 : (this.inWater ? 5 : 2.6);
    const k = Math.min(1, accel * dt);
    this.vx += (tx - this.vx) * k; this.vz += (tz - this.vz) * k;
    this.vx += this.kbx * dt * 6; this.vz += this.kbz * dt * 6; this.kbx *= Math.max(0, 1 - dt * 8); this.kbz *= Math.max(0, 1 - dt * 8);
    // vertical
    if (this.flying) {
      const t = (input.jump ? 1 : 0) - (input.sneak ? 1 : 0);
      this.vy += (t * (this.sprinting ? 14 : 8) - this.vy) * Math.min(1, dt * 9);
    } else if (this.inWater || inLava) {
      this.vy -= (inLava ? 12 : 9) * dt; this.vy *= Math.pow(inLava ? 0.05 : 0.02, dt);
      if (input.jump) this.vy = Math.min(this.vy + 34 * dt, inLava ? 2.5 : 3.8);
      if (this.onGround && input.jump && this.inWater && !this.headWater) this.vy = Math.max(this.vy, 6.5);
    } else {
      this.vy -= 32 * dt; if (this.vy < -60) this.vy = -60;
      if (input.jump && this.onGround && this.jumpCd <= 0) {
        this.vy = 9.0; this.jumpCd = 0.25; this.exh += this.sprinting ? 0.2 : 0.05;
        if (this.sprinting) { this.vx += wx * 2.2; this.vz += wz * 2.2; }
      }
    }
    // move
    const px0 = this.x, pz0 = this.z, wasGround = this.onGround, py0 = this.y;
    if (this.sneaking && wasGround) {
      const ground = (x, z) => w.collides(x, this.y - 0.6, z, this.hw, 0.5);
      let sx0 = this.x; w.moveEntity(this, this.vx * dt, this.vy * dt, 0);
      if (!ground(this.x, this.z)) { this.x = sx0; this.vx = 0; }
      const sz0 = this.z; w.moveEntity(this, 0, 0, this.vz * dt);
      if (!ground(this.x, this.z)) { this.z = sz0; this.vz = 0; }
      if (!this.onGround && this.vy <= 0) { /* recheck ground */ this.onGround = w.collides(this.x, this.y - 0.05, this.z, this.hw, 0.02); }
    } else w.moveEntity(this, this.vx * dt, this.vy * dt, this.vz * dt);
    if (this.flying && this.onGround) this.flying = false;
    // fall damage
    if (!this.onGround && this.vy < 0 && !this.inWater && !this.flying) this.fallDist += py0 - this.y;
    if (this.onGround || this.inWater || this.flying) {
      if (this.fallDist > 3.2 && !this.creative && !this.inWater) { const dmg = Math.ceil(this.fallDist - 3); this.hurt(dmg); g.sound.play('hit'); }
      if (this.onGround && this.fallDist > 2.5) g.particles.burst(this.x, this.y + 0.1, this.z, [150, 140, 120], 6, 2.5);
      this.fallDist = 0;
    }
    if (this.y < -30) { this.hurt(4); this.x = this.spawn.x; this.y = this.spawn.y + 30; this.z = this.spawn.z; this.vy = 0; }
    // drowning + lava
    if (this.headWater && !this.creative) { this.air -= dt; if (this.air <= 0) { this.air = 0; this.drownT = (this.drownT || 0) + dt; if (this.drownT > 1) { this.drownT = 0; this.hurt(2); } } }
    else { this.air = Math.min(10, this.air + dt * 6); this.drownT = 0; }
    if (inLava) { this.lavaT = (this.lavaT || 0) + dt; this.fireT = 6; if (this.lavaT > 0.4) { this.lavaT = 0; this.hurt(4); } }
    if (this.fireT > 0) { this.fireT -= dt; if (this.inWater) this.fireT = 0; this.fireDmgT = (this.fireDmgT || 0) + dt; if (this.fireDmgT > 1) { this.fireDmgT = 0; this.hurt(1); } }
    // cactus
    for (const [ox, oz] of [[0.35, 0], [-0.35, 0], [0, 0.35], [0, -0.35]]) if (w.getBlock(Math.floor(this.x + ox), Math.floor(this.y + 0.5), Math.floor(this.z + oz)) === B.CACTUS) { this.cactusT = (this.cactusT || 0) + dt; if (this.cactusT > 0.5) { this.cactusT = 0; this.hurt(1, this.x + ox, this.z + oz); } }
    // hunger
    const moved = Math.hypot(this.x - px0, this.z - pz0);
    if (!this.creative) {
      this.exh += moved * (this.sprinting ? 0.1 : 0.0) ;
      if (this.exh > 4) { this.exh -= 4; if (this.sat > 0) this.sat = Math.max(0, this.sat - 1); else this.hunger = Math.max(0, this.hunger - 1); }
      if (this.hunger >= 18 && this.health < 20) { this.regenT += dt * (this.hunger >= 20 ? 2 : 1); if (this.regenT > 4) { this.regenT = 0; this.health = Math.min(20, this.health + 1); this.exh += 0.6; } }
      else if (this.hunger <= 0) { this.starveT += dt; if (this.starveT > 4) { this.starveT = 0; if (this.health > 1) this.hurt(1); } } else { this.regenT = 0; this.starveT = 0; }
    } else { this.health = 20; this.hunger = 20; }
    // footsteps + bobbing
    const hs = Math.hypot(this.vx, this.vz);
    if (this.onGround && hs > 0.5) { this.stepT += hs * dt; this.bob += hs * dt * 1.7; if (this.stepT > (this.sprinting ? 2.3 : 2.0)) { this.stepT = 0; const b = w.getBlock(Math.floor(this.x), Math.floor(this.y - 0.2), Math.floor(this.z)); g.sound.play('step', { sound: B.BLOCKS[b] ? B.BLOCKS[b].sound : 'stone' }); } }
    else this.bob += (Math.round(this.bob / Math.PI) * Math.PI - this.bob) * Math.min(1, dt * 8);
    if (!this.wasWater && this.inWater) { g.sound.play('splash'); g.particles.burst(this.x, this.y + 0.8, this.z, [120, 170, 240], 12, 3.5); }
    this.wasWater = this.inWater; if (!wasGround && this.onGround) this.landed = true;
  }
  // ------------------------------------------------------------ interaction
  breakTime(b) {
    const d = B.BLOCKS[b]; if (d.hardness >= 1e8) return Infinity; if (this.creative) return 0;
    const s = this.held(), it = s && B.ITEMS[s.id]; const tool = it && it.tool;
    const right = tool && tool.type === d.tool;
    const can = !d.need || (right && tool.tier >= d.need);
    let t = d.hardness * (can ? 1.5 : 5) / (right ? tool.speed : 1);
    if (this.inWater) t *= 3;
    return t;
  }
  canHarvest(b) {
    const d = B.BLOCKS[b]; if (!d.need) return true;
    const s = this.held(), it = s && B.ITEMS[s.id]; const tool = it && it.tool;
    return !!(tool && tool.type === d.tool && tool.tier >= d.need);
  }
  aim() {
    const g = this.game, w = g.world;
    const ex = this.x, ey = this.eyeY, ez = this.z;
    const cp = Math.cos(this.pitch), dx = -Math.sin(this.yaw) * cp, dy = Math.sin(this.pitch), dz = -Math.cos(this.yaw) * cp;
    this.dir = [dx, dy, dz];
    const reach = this.creative ? 6 : REACH;
    let hit = w.raycast(ex, ey, ez, dx, dy, dz, reach);
    let best = null;
    for (const m of g.mobs) {
      if (m.dead || m.deadT > 0) continue;
      const t = rayAABB(ex, ey, ez, dx, dy, dz, m.x - m.hw, m.y, m.z - m.hw, m.x + m.hw, m.y + m.h, m.z + m.hw);
      if (t !== null && t <= 3.8 && (!hit || t < hit.t) && (!best || t < best.t)) best = { m, t };
    }
    this.mobTarget = best ? best.m : null;
    this.target = this.mobTarget ? null : hit;
  }
  updateInteraction(dt, input) {
    const g = this.game, w = g.world;
    if (this.dead) return;
    this.aim();
    // left
    if (input.left) {
      if (this.mobTarget) {
        if (this.attackCd <= 0) this.attack(this.mobTarget);
        this.mineKey = '';
      } else if (this.target) {
        const t = this.target, key = t.x + ',' + t.y + ',' + t.z;
        if (key !== this.mineKey) { this.mineKey = key; this.mineT = 0; this.mineNeed = this.breakTime(t.block); this.digSnd = 0; }
        if (this.swing <= 0) this.swing = 1;
        this.mineT += dt; this.digSnd -= dt;
        if (this.digSnd <= 0 && this.mineNeed > 0) { this.digSnd = 0.22; g.sound.play('dig', { sound: B.BLOCKS[t.block].sound, pos: { x: t.x + 0.5, y: t.y + 0.5, z: t.z + 0.5 } }); const av = B.tileAvg(B.BLOCKS[t.block].tiles.side); g.particles.burst(t.x + 0.5 + t.nx * 0.5, t.y + 0.5 + t.ny * 0.5, t.z + 0.5 + t.nz * 0.5, av, 2, 2); }
        if (this.creative) { if (this.mineT >= 0.22 || this.mineNeed === 0 && this.mineT > 0.0) { if (!this.creativeCool || this.creativeCool <= 0) { this.breakBlock(t.x, t.y, t.z); this.creativeCool = 0.25; this.mineKey = ''; } } }
        else if (this.mineT >= this.mineNeed) { this.breakBlock(t.x, t.y, t.z); this.mineKey = ''; this.mineT = 0; }
      } else { this.mineKey = ''; this.mineT = 0; if (this.swing <= 0 && this.attackCd <= 0) { this.swing = 1; this.attackCd = 0.3; } }
    } else { this.mineKey = ''; this.mineT = 0; }
    if (this.creativeCool > 0) this.creativeCool -= dt;
    this.mineProgress = this.mineKey && this.mineNeed > 0 ? Math.min(1, this.mineT / this.mineNeed) : 0;
    // right
    const held = this.held(), it = held && B.ITEMS[held.id];
    if (it && it.bow) {
      if (input.right && (this.creative || this.countItem(B.ARROW) > 0)) { if (this.drawT === 0) g.sound.play('click', { vol: 0.4 }); this.drawT = Math.min(1.2, this.drawT + dt); }
      else { if (this.drawT > 0.25) this.shootBow(); this.drawT = 0; }
      this.eatT = 0; return;
    } else this.drawT = 0;
    if (input.right) {
      if (input.rightPressed) this.rightHandled = false;
      const food = it && it.food && (this.hunger < 20 || this.creative);
      if (food && !(this.target && this.isUsable(this.target.block) && !this.sneaking)) {
        this.eatT += dt; this.eatSnd = (this.eatSnd || 0) - dt;
        if (this.eatSnd <= 0) { this.eatSnd = 0.25; g.sound.play('eat'); g.particles.burst(this.x - Math.sin(this.yaw) * 0.5, this.eyeY - 0.3, this.z - Math.cos(this.yaw) * 0.5, [200, 150, 90], 3, 2); }
        if (this.eatT >= 1.6) { this.eatT = 0; this.hunger = Math.min(20, this.hunger + it.food); this.sat = Math.min(this.hunger, this.sat + it.food * 0.6); this.consumeHeld(); g.sound.play('levelup', { vol: 0.2 }); }
      } else {
        this.eatT = 0;
        if (this.placeCd <= 0 && (!this.rightHandled || (held && held.id < 256 && !(this.target && this.isUsable(this.target.block))))) { if (this.rightAction()) { this.placeCd = 0.2; this.swing = 1; } this.rightHandled = true; }
      }
    } else { this.eatT = 0; this.rightHandled = false; }
  }
  shootBow() {
    const g = this.game, pw = Math.min(1, this.drawT / 1.0), d = this.dir || [0, 0, -1];
    const sp = 14 + 26 * pw;
    g.projectiles.push(new Arrow(g, this.x + d[0] * 0.6, this.eyeY - 0.1 + d[1] * 0.6, this.z + d[2] * 0.6, d[0] * sp, d[1] * sp, d[2] * sp, false, 2 + pw * 7));
    if (!this.creative) { this.takeItem(B.ARROW); this.useHeld(1); }
    g.sound.play('bow', { vol: 0.9 }); this.swing = 0.6; g.shake = Math.max(g.shake || 0, 0.05);
  }
  isUsable(b) { return b === B.CRAFTING || b === B.FURNACE || b === B.CHEST; }
  rightAction() {
    const g = this.game, w = g.world, t = this.target; if (!t) return false;
    const held = this.held();
    if (!this.sneaking && this.isUsable(t.block)) { g.ui.openContainer(t.block, t.x, t.y, t.z); return true; }
    if (t.block === B.TNT && (!held || held.id >= 256)) { g.igniteTNT(t.x, t.y, t.z); if (held && held.id === B.FLINT_STEEL) this.useHeld(1); return true; }
    if (held && B.ITEMS[held.id] && B.ITEMS[held.id].hoe) {
      const b = t.block; if ((b === B.GRASS || b === B.DIRT || b === B.SNOWGRASS) && t.ny === 1 && w.getBlock(t.x, t.y + 1, t.z) === 0) { w.setBlock(t.x, t.y, t.z, B.FARMLAND); g.sound.play('dig', { sound: 'dirt', pos: { x: t.x + 0.5, y: t.y + 0.5, z: t.z + 0.5 } }); this.useHeld(1); return true; }
      return false;
    }
    if (held && held.id === B.SEEDS) {
      const below = t.block, above = w.getBlock(t.x, t.y + 1, t.z);
      if (below === B.FARMLAND && t.ny === 1 && above === 0) { w.setBlock(t.x, t.y + 1, t.z, B.WHEAT_1); g.sound.play('place', { sound: 'grass', pos: { x: t.x + 0.5, y: t.y + 1.5, z: t.z + 0.5 } }); this.consumeHeld(); return true; }
      return false;
    }
    if (!held || held.id >= 256 || !B.BLOCKS[held.id]) return false;
    const px = t.x + t.nx, py = t.y + t.ny, pz = t.z + t.nz;
    if (py < 0 || py >= 96) return false;
    const cur = w.getBlock(px, py, pz);
    if (!(cur === 0 || cur === B.WATER || cur === B.LAVA || B.SHAPE[cur] === 1)) return false;
    let id = held.id; const solid = B.SOLID[id];
    if (B.SHAPE[id] === 6) { const dxs = -Math.sin(this.yaw), dzs = -Math.cos(this.yaw); const f = Math.abs(dzs) > Math.abs(dxs) ? (dzs < 0 ? 1 : 0) : (dxs > 0 ? 2 : 3); id = B.STAIR_BASE + (((id - B.STAIR_BASE) >> 2) << 2) + f; }
    if (solid) {
      // not inside player
      if (px + 1 > this.x - this.hw && px < this.x + this.hw && pz + 1 > this.z - this.hw && pz < this.z + this.hw && py + 1 > this.y && py < this.y + this.h) return false;
      for (const m of g.mobs) if (!m.dead && px + 1 > m.x - m.hw && px < m.x + m.hw && pz + 1 > m.z - m.hw && pz < m.z + m.hw && py + 1 > m.y && py < m.y + m.h) return false;
    }
    if ((B.SHAPE[id] === 1 || id === B.TORCH) && !g.supported(px, py, pz, id)) return false;
    if (id === B.CACTUS && w.getBlock(px, py - 1, pz) !== B.SAND && w.getBlock(px, py - 1, pz) !== B.CACTUS) return false;
    w.setBlock(px, py, pz, id);
    g.sound.play('place', { sound: B.BLOCKS[id].sound, pos: { x: px + 0.5, y: py + 0.5, z: pz + 0.5 } });
    this.consumeHeld();
    return true;
  }
  breakBlock(x, y, z) {
    const g = this.game, w = g.world, b = w.getBlock(x, y, z); if (!b) return;
    const d = B.BLOCKS[b];
    const harvest = this.canHarvest(b);
    const av = B.tileAvg(d.tiles.side, b === B.LEAVES ? B.TINTS.foliage : b === B.GRASS ? B.TINTS.grass : null);
    g.particles.burst(x + 0.5, y + 0.5, z + 0.5, av, 14, 3.5);
    g.sound.play('break', { sound: d.sound, pos: { x: x + 0.5, y: y + 0.5, z: z + 0.5 } });
    if (!this.creative) {
      if (harvest) {
        let did = d.drop, n = d.dropN;
        if (b >= B.WHEAT_1 && b <= B.WHEAT_4) { did = B.SEEDS; n = 1; if (b === B.WHEAT_4) { g.spawnItem(B.WHEAT, 1, x + 0.5, y + 0.5, z + 0.5); n = 1 + Math.floor(Math.random() * 3); } }
        if (b === B.TALLGRASS) { if (Math.random() < 0.14) { did = B.SEEDS; n = 1; } }
        if (b === B.LEAVES) { const r = Math.random(); did = 0; if (r < 0.06) did = B.APPLE; else if (r < 0.14) did = B.STICK; n = 1; }
        if (did) g.spawnItem(did, n, x + 0.5, y + 0.5, z + 0.5);
      }
      const s = this.held(); const it = s && B.ITEMS[s.id]; if (it && it.tool) this.useHeld(it.tool.type === 'sword' ? 2 : 1);
      this.exh += 0.025;
    }
    if (b === B.CHEST || b === B.FURNACE) g.ui.dropContainer(x, y, z, b);
    w.setBlock(x, y, z, 0);
    // flood: water fills removed cell
    if (b !== B.WATER) {
      const nb = [[0, 1, 0], [1, 0, 0], [-1, 0, 0], [0, 0, 1], [0, 0, -1]].map(([a, bb, c]) => w.getBlock(x + a, y + bb, z + c));
      if (nb.includes(B.WATER)) w.setBlock(x, y, z, B.WATER); else if (nb.includes(B.LAVA)) w.setBlock(x, y, z, B.LAVA);
    }
    g.checkSupport(x, y + 1, z);
    for (const [a, c] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) g.checkSupport(x + a, y, z + c, true);
  }
  attack(m) {
    const g = this.game, s = this.held(), it = s && B.ITEMS[s.id];
    let dmg = 1; if (it && it.tool) dmg = it.tool.dmg;
    const crit = !this.onGround && this.vy < -0.5 && !this.inWater;
    if (crit) dmg *= 1.5;
    m.hurt(dmg, this.x, this.z, true);
    if (crit) g.particles.burst(m.x, m.y + m.h * 0.7, m.z, [255, 240, 180], 10, 4);
    this.attackCd = it && it.tool && it.tool.type === 'sword' ? 0.42 : 0.55; this.swing = 1; this.exh += 0.1;
    if (it && it.tool) this.useHeld(it.tool.type === 'sword' ? 1 : 2);
    g.particles.burst(m.x, m.y + m.h * 0.6, m.z, [200, 40, 40], 4, 2.5);
  }
}

export function rayAABB(ox, oy, oz, dx, dy, dz, x0, y0, z0, x1, y1, z1) {
  let tmin = 0, tmax = 1e9;
  for (const [o, d, lo, hi] of [[ox, dx, x0, x1], [oy, dy, y0, y1], [oz, dz, z0, z1]]) {
    if (Math.abs(d) < 1e-9) { if (o < lo || o > hi) return null; }
    else { let t1 = (lo - o) / d, t2 = (hi - o) / d; if (t1 > t2) { const t = t1; t1 = t2; t2 = t; } tmin = Math.max(tmin, t1); tmax = Math.min(tmax, t2); if (tmin > tmax) return null; }
  }
  return tmin;
}
