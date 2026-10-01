import * as THREE from 'three';
import * as B from './blocks.js';
import { makeItemMesh, setItemLight, blockMaterials } from './render.js';

const GRAV = 26;

export class ItemEntity {
  constructor(game, id, n, x, y, z, vx = 0, vy = 3, vz = 0, d) {
    this.game = game; this.id = id; this.n = n; this.d = d;
    this.x = x; this.y = y; this.z = z; this.vx = vx; this.vy = vy; this.vz = vz; this.hw = 0.13; this.h = 0.26;
    this.age = 0; this.dead = false; this.spin = Math.random() * 6;
    const isBlock = id < 256 && B.BLOCKS[id] && B.SHAPE[id] !== 1 && B.SHAPE[id] !== 2;
    this.mesh = makeItemMesh(id, isBlock ? 0.26 : 0.5);
    game.scene.add(this.mesh);
  }
  update(dt) {
    const g = this.game, w = g.world, p = g.player;
    this.age += dt; this.spin += dt * 2;
    if (this.age > 300) return this.remove();
    if (!w.loaded(this.x, this.z)) { this.mesh.visible = false; return; } this.mesh.visible = true;
    this.vy -= GRAV * dt; if (this.vy < -40) this.vy = -40;
    const inWater = w.getBlock(Math.floor(this.x), Math.floor(this.y + 0.1), Math.floor(this.z)) === B.WATER;
    if (inWater) { this.vy = Math.min(this.vy + 40 * dt, 1.5); this.vx *= 0.9; this.vz *= 0.9; }
    // magnet
    const dx = p.x - this.x, dy = p.y + 0.8 - this.y, dz = p.z - this.z, dist = Math.hypot(dx, dy, dz);
    if (!p.dead && this.age > 0.5 && dist < 2.6 && p.canAccept(this.id)) {
      const s = 9 / Math.max(dist, 0.3); this.vx += dx * s * dt * 3; this.vy += dy * s * dt * 3; this.vz += dz * s * dt * 3;
    }
    w.moveEntity(this, this.vx * dt, this.vy * dt, this.vz * dt);
    if (this.onGround) { this.vx *= 0.7; this.vz *= 0.7; }
    if (!p.dead && this.age > 0.5 && dist < 1.25) {
      const left = p.addItem(this.id, this.n, this.d);
      if (left < this.n) g.sound.play('pickup', { pos: this });
      this.n = left; if (left <= 0) return this.remove();
    }
    const bob = this.onGround ? Math.sin(this.age * 3 + this.spin) * 0.04 + 0.14 : 0.12;
    this.mesh.position.set(this.x, this.y + bob, this.z); this.mesh.rotation.y = this.spin;
    setItemLight(this.mesh, g.lightAt(this.x, this.y + 0.3, this.z));
  }
  remove() { this.dead = true; this.game.scene.remove(this.mesh); }
}

export class FallingBlock {
  constructor(game, id, x, y, z) {
    this.game = game; this.id = id; this.x = x + 0.5; this.y = y; this.z = z + 0.5; this.vx = this.vz = 0; this.vy = 0; this.hw = 0.49; this.h = 0.98; this.dead = false;
    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.98, 0.98), blockMaterials(id).map((m) => m.clone()));
    game.scene.add(this.mesh);
  }
  update(dt) {
    const w = this.game.world; this.vy -= GRAV * dt;
    w.moveEntity(this, 0, this.vy * dt, 0);
    this.mesh.position.set(this.x, this.y + 0.5, this.z);
    setItemLight(this.mesh, this.game.lightAt(this.x, this.y + 1, this.z));
    if (this.onGround || this.y < 0) {
      this.dead = true; this.game.scene.remove(this.mesh);
      const bx = Math.floor(this.x), by = Math.floor(this.y + 0.3), bz = Math.floor(this.z);
      const cur = w.getBlock(bx, by, bz);
      if (cur === 0 || cur === B.WATER || cur === B.LAVA || B.SHAPE[cur] === 1) { w.setBlock(bx, by, bz, this.id); this.game.sound.play('place', { pos: this, sound: B.BLOCKS[this.id].sound }); }
      else this.game.spawnItem(this.id, 1, this.x, this.y + 0.5, this.z);
    }
  }
}

export class PrimedTNT {
  constructor(game, x, y, z, fuse = 3.2) {
    this.game = game; this.x = x + 0.5; this.y = y; this.z = z + 0.5; this.vx = (Math.random() - 0.5) * 1.2; this.vz = (Math.random() - 0.5) * 1.2; this.vy = 4; this.hw = 0.49; this.h = 0.98;
    this.fuse = fuse; this.dead = false;
    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.98, 0.98), blockMaterials(B.TNT).map((m) => m.clone()));
    game.scene.add(this.mesh); game.sound.play('fuse', { pos: this, vol: 0.7 });
  }
  update(dt) {
    const g = this.game; this.fuse -= dt; this.vy -= GRAV * dt;
    g.world.moveEntity(this, this.vx * dt, this.vy * dt, this.vz * dt); if (this.onGround) { this.vx *= 0.8; this.vz *= 0.8; }
    this.mesh.position.set(this.x, this.y + 0.5, this.z);
    const flash = Math.floor(this.fuse * 5) % 2 === 0, k = flash ? 2.2 : g.lightAt(this.x, this.y + 1, this.z);
    setItemLight(this.mesh, k);
    const s = 1 + Math.max(0, 0.4 - this.fuse) * 0.6 * (flash ? 1 : 0.5); this.mesh.scale.setScalar(s);
    if (Math.random() < 0.3) g.particles.spawn(this.x, this.y + 1.2, this.z, (Math.random() - 0.5), 1.5, (Math.random() - 0.5), [80, 80, 80], 0.08, 0.5, 0);
    if (this.fuse <= 0) { this.dead = true; g.scene.remove(this.mesh); g.explode(this.x, this.y + 0.5, this.z, 4.2); }
  }
}

export class Arrow {
  constructor(game, x, y, z, vx, vy, vz, hostile, dmg = 3) {
    this.game = game; this.x = x; this.y = y; this.z = z; this.vx = vx; this.vy = vy; this.vz = vz; this.hostile = hostile; this.dmg = dmg;
    this.life = 8; this.stuck = false; this.dead = false;
    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.7), new THREE.MeshBasicMaterial({ color: 0x9a7a4a }));
    const tip = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.1), new THREE.MeshBasicMaterial({ color: 0xcfcfcf })); tip.position.z = 0.36; this.mesh.add(tip);
    const fl = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.02, 0.14), new THREE.MeshBasicMaterial({ color: 0xeeeeee })); fl.position.z = -0.32; this.mesh.add(fl);
    game.scene.add(this.mesh);
  }
  update(dt) {
    const g = this.game, w = g.world;
    if (this.stuck) { this.life -= dt * 2; if (this.life <= 0) { this.dead = true; g.scene.remove(this.mesh); } return; }
    this.life -= dt; if (this.life <= 0) { this.dead = true; g.scene.remove(this.mesh); return; }
    this.vy -= 12 * dt;
    const nx = this.x + this.vx * dt, ny = this.y + this.vy * dt, nz = this.z + this.vz * dt;
    // collide with blocks
    const b = w.getBlock(Math.floor(nx), Math.floor(ny), Math.floor(nz));
    if (B.SOLID[b]) { this.stuck = true; this.life = 6; g.sound.play('dig', { pos: this, sound: 'wood', vol: 0.6 }); if (b === B.TNT) g.igniteTNT(Math.floor(nx), Math.floor(ny), Math.floor(nz)); }
    else { this.x = nx; this.y = ny; this.z = nz; }
    // entities
    const p = g.player;
    if (this.hostile && !p.dead && Math.abs(this.x - p.x) < 0.5 && Math.abs(this.z - p.z) < 0.5 && this.y > p.y - 0.1 && this.y < p.y + 1.9) {
      p.hurt(this.dmg, this.x - this.vx, this.z - this.vz); this.dead = true; g.scene.remove(this.mesh); return;
    }
    if (!this.hostile) for (const m of g.mobs) {
      if (m.dead) continue;
      if (Math.abs(this.x - m.x) < m.hw + 0.1 && Math.abs(this.z - m.z) < m.hw + 0.1 && this.y > m.y && this.y < m.y + m.h) { m.hurt(this.dmg, this.x - this.vx, this.z - this.vz, true); this.dead = true; g.scene.remove(this.mesh); return; }
    }
    this.mesh.position.set(this.x, this.y, this.z);
    if (!this.stuck) this.mesh.lookAt(this.x + this.vx, this.y + this.vy, this.z + this.vz);
  }
}
