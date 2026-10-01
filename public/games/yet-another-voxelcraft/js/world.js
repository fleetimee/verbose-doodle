import * as THREE from 'three';
import { Gen, CS, CH, SEA, BIOME } from './worldgen.js';
import * as B from './blocks.js';
import { meshChunk } from './mesher.js';

export { CS, CH, SEA };
const key = (cx, cz) => ((cx + 32768) * 65536) + (cz + 32768);
const QMASK = (1 << 18) - 1;
const qx = new Int32Array(QMASK + 1), qy = new Int32Array(QMASK + 1), qz = new Int32Array(QMASK + 1), ql = new Uint8Array(QMASK + 1);
const rx = new Int32Array(QMASK + 1), ry = new Int32Array(QMASK + 1), rz = new Int32Array(QMASK + 1), rl = new Uint8Array(QMASK + 1);
const DIRS = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];

export class Chunk {
  constructor(cx, cz) {
    this.cx = cx; this.cz = cz;
    this.blocks = new Uint8Array(CS * CS * CH);
    this.light = new Uint8Array(CS * CS * CH);
    this.biome = new Uint8Array(256);
    this.hm = new Int16Array(256);
    this.mesh = null; this.water = null;
    this.meshed = false; this.dirty = false; this.urgent = false; this.spawns = null;
  }
}

export class World {
  constructor(seed, scene, materials) {
    this.seed = seed; this.scene = scene; this.mats = materials;
    this.gen = new Gen(seed);
    this.chunks = new Map();
    this.edits = new Map();
    this.visited = new Set();
    this.radius = 6;
    this._lc = null; this._lk = -1;
    this.onFall = null; this.onChunkNew = null; this.pendingFall = [];
    this.stats = { gen: 0, mesh: 0 };
    this.torches = new Map(); this.crops = new Map();
    this.offsets = [];
    this.maxGen = 1; this.maxMesh = 2;
    this.setRadius(6);
  }
  setRadius(r) {
    this.radius = r;
    this.offsets = [];
    for (let dz = -r - 1; dz <= r + 1; dz++) for (let dx = -r - 1; dx <= r + 1; dx++) {
      const d = Math.hypot(dx, dz); if (d <= r + 1.2) this.offsets.push([dx, dz, d]);
    }
    this.offsets.sort((a, b) => a[2] - b[2]);
  }
  getChunk(cx, cz) {
    const k = key(cx, cz);
    if (k === this._lk) return this._lc;
    const c = this.chunks.get(k);
    if (c) { this._lk = k; this._lc = c; }
    return c;
  }
  getBlock(x, y, z) {
    if (y < 0) return B.BEDROCK; if (y >= CH) return 0;
    const c = this.getChunk(x >> 4, z >> 4); if (!c) return B.STONE;
    return c.blocks[(x & 15) + ((z & 15) << 4) + (y << 8)];
  }
  loaded(x, z) { return !!this.getChunk(x >> 4, z >> 4); }
  getLight(x, y, z) {
    if (y >= CH) return 0xF0; if (y < 0) return 0;
    const c = this.getChunk(x >> 4, z >> 4); if (!c) return 0xF0;
    return c.light[(x & 15) + ((z & 15) << 4) + (y << 8)];
  }
  isSolid(x, y, z) { return B.SOLID[this.getBlock(Math.floor(x), Math.floor(y), Math.floor(z))] === 1; }

  // ------------------------------------------------------------ streaming
  generate(cx, cz) {
    const c = new Chunk(cx, cz);
    const k = key(cx, cz);
    const ed = this.edits.get(k);
    this.gen.generate(c, ed);
    if (ed) for (const [idx, id] of ed) { if (id >= B.WHEAT_1 && id <= B.WHEAT_4) { const wx = cx * 16 + (idx & 15), wy = idx >> 8, wz = cz * 16 + ((idx >> 4) & 15); this.crops.set(wx + ',' + wy + ',' + wz, [wx, wy, wz]); } if (id === B.TORCH) { const wx = cx * 16 + (idx & 15), wy = idx >> 8, wz = cz * 16 + ((idx >> 4) & 15); this.torches.set(wx + ',' + wy + ',' + wz, [wx, wy, wz]); } }
    this.chunks.set(k, c);
    this._lk = -1;
    this.lightChunk(c);
    this.stats.gen++;
    if (!this.visited.has(k)) { this.visited.add(k); if (this.onChunkNew) this.onChunkNew(c); }
    return c;
  }
  update(px, pz, budgetMs) {
    const t0 = performance.now();
    const pcx = Math.floor(px / 16), pcz = Math.floor(pz / 16);
    const R = this.radius;
    // generation
    let genN = 0;
    for (const [dx, dz] of this.offsets) {
      if (performance.now() - t0 > budgetMs || genN >= (Math.hypot(dx, dz) <= 3.2 ? this.maxGen + 1 : this.maxGen)) break;
      if (!this.getChunk(pcx + dx, pcz + dz)) { this.generate(pcx + dx, pcz + dz); genN++; }
    }
    // meshing (nearest first)
    let meshedNow = 0;
    for (const [dx, dz, d] of this.offsets) {
      if (d > R + 0.5) break;
      if ((performance.now() - t0 > budgetMs * 1.6 || meshedNow >= this.maxMesh) && meshedNow > 0) break;
      const c = this.getChunk(pcx + dx, pcz + dz);
      if (!c || (c.meshed && !c.dirty)) continue;
      if (!this.hasNeighbors(c)) continue;
      this.buildMesh(c); meshedNow++;
    }
    // unload
    if ((this._frame = (this._frame || 0) + 1) % 45 === 0) {
      for (const [k, c] of this.chunks) {
        if (Math.hypot(c.cx - pcx, c.cz - pcz) > R + 3) this.unload(k, c);
      }
    }
  }
  flushUrgent(maxN = 8) {
    let n = 0;
    for (const c of this.chunks.values()) {
      if (c.urgent) { if (this.hasNeighbors(c)) { this.buildMesh(c); n++; } else c.urgent = false; if (n >= maxN) break; }
    }
  }
  hasNeighbors(c) {
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if ((dx || dz) && !this.getChunk(c.cx + dx, c.cz + dz)) return false;
    return true;
  }
  unload(k, c) {
    this.disposeMeshes(c);
    this.chunks.delete(k); this._lk = -1;
  }
  disposeMeshes(c) {
    if (c.mesh) { this.scene.remove(c.mesh); c.mesh.geometry.dispose(); c.mesh = null; }
    if (c.water) { this.scene.remove(c.water); c.water.geometry.dispose(); c.water = null; }
  }
  makeGeom(d) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(d.pos, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(d.uv, 2));
    g.setAttribute('aShade', new THREE.BufferAttribute(d.shade, 1));
    g.setAttribute('aLight', new THREE.BufferAttribute(d.light, 2));
    g.setAttribute('aTint', new THREE.BufferAttribute(d.tint, 3));
    g.setIndex(new THREE.BufferAttribute(d.idx, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(8, CH / 2, 8), 8 * 1.5 + CH / 2);
    g.boundingBox = new THREE.Box3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(16, CH, 16));
    return g;
  }
  buildMesh(c) {
    const r = meshChunk(this, c);
    this.disposeMeshes(c);
    if (r.opaque) {
      c.mesh = new THREE.Mesh(this.makeGeom(r.opaque), this.mats.opaque);
      c.mesh.position.set(c.cx * 16, 0, c.cz * 16); c.mesh.matrixAutoUpdate = false; c.mesh.updateMatrix(); this.scene.add(c.mesh);
    }
    if (r.water) {
      c.water = new THREE.Mesh(this.makeGeom(r.water), this.mats.water);
      c.water.position.set(c.cx * 16, 0, c.cz * 16); c.water.matrixAutoUpdate = false; c.water.updateMatrix();
      c.water.renderOrder = 2; this.scene.add(c.water);
    }
    c.meshed = true; c.dirty = false; c.urgent = false; this.stats.mesh++;
  }
  markDirty(c, lx, lz, urgent) {
    c.dirty = true; if (urgent) c.urgent = true;
    const ex = lx === 0 ? -1 : lx === 15 ? 1 : 0, ez = lz === 0 ? -1 : lz === 15 ? 1 : 0;
    if (ex) { const n = this.getChunk(c.cx + ex, c.cz); if (n) { n.dirty = true; if (urgent) n.urgent = true; } }
    if (ez) { const n = this.getChunk(c.cx, c.cz + ez); if (n) { n.dirty = true; if (urgent) n.urgent = true; } }
    if (ex && ez) { const n = this.getChunk(c.cx + ex, c.cz + ez); if (n) { n.dirty = true; if (urgent) n.urgent = true; } }
  }

  // ------------------------------------------------------------ lighting
  lightChunk(c) {
    const bl = c.blocks, lt = c.light, hm = c.hm;
    let tail = 0, tailB = 0;
    // sky columns
    for (let z = 0; z < 16; z++) for (let x = 0; x < 16; x++) {
      let lvl = 15, top = -1; const ci = x + (z << 4);
      for (let y = CH - 1; y >= 0; y--) {
        const op = B.LIGHT_OP[bl[ci + (y << 8)]];
        if (op > 0 && top < 0) top = y;
        lvl = lvl - op; if (lvl < 0) lvl = 0;
        lt[ci + (y << 8)] = lvl << 4;
        if (lvl === 0) { if (top < 0) top = y; break; }
      }
      hm[ci] = top < 0 ? 0 : top;
    }
    // block-light emitters
    const bq = []; // block queue coordinates
    for (let i = 0; i < bl.length; i++) {
      const e = B.EMIT[bl[i]]; if (e > 0) {
        lt[i] |= e; bq.push(c.cx * 16 + (i & 15), i >> 8, c.cz * 16 + ((i >> 4) & 15));
      }
    }
    // sky seeds (inside chunk)
    const ox = c.cx * 16, oz = c.cz * 16;
    const hmAt = (x, z) => {
      if (x >= 0 && x < 16 && z >= 0 && z < 16) return hm[x + (z << 4)];
      const n = this.getChunk(c.cx + (x < 0 ? -1 : x > 15 ? 1 : 0), c.cz + (z < 0 ? -1 : z > 15 ? 1 : 0));
      return n ? n.hm[(x & 15) + ((z & 15) << 4)] : -1;
    };
    for (let z = 0; z < 16; z++) for (let x = 0; x < 16; x++) {
      const h0 = hm[x + (z << 4)];
      let mh = Math.max(hmAt(x + 1, z), hmAt(x - 1, z), hmAt(x, z + 1), hmAt(x, z - 1));
      if (mh > CH - 2) mh = CH - 2;
      for (let y = h0; y <= mh; y++) {
        if ((lt[x + (z << 4) + (y << 8)] >> 4) > 1) { qx[tail & QMASK] = ox + x; qy[tail & QMASK] = y; qz[tail & QMASK] = oz + z; tail++; }
      }
    }
    // pull light from already-generated neighbour borders
    const pullQ = [], pullB = [];
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = this.getChunk(c.cx + dx, c.cz + dz); if (!n) continue;
      for (let i = 0; i < 16; i++) {
        const lx = dx === 1 ? 0 : dx === -1 ? 15 : i, lz = dz === 1 ? 0 : dz === -1 ? 15 : i;
        const wx = n.cx * 16 + lx, wz = n.cz * 16 + lz;
        for (let y = 0; y < CH; y++) {
          const v = n.light[lx + (lz << 4) + (y << 8)];
          if ((v >> 4) > 1) pullQ.push(wx, y, wz);
          if ((v & 15) > 1) pullB.push(wx, y, wz);
        }
      }
    }
    for (let i = 0; i < pullQ.length; i += 3) { qx[tail & QMASK] = pullQ[i]; qy[tail & QMASK] = pullQ[i + 1]; qz[tail & QMASK] = pullQ[i + 2]; tail++; }
    this.spread(true, 0, tail);
    for (let i = 0; i < bq.length; i += 3) { qx[tailB & QMASK] = bq[i]; qy[tailB & QMASK] = bq[i + 1]; qz[tailB & QMASK] = bq[i + 2]; tailB++; }
    for (let i = 0; i < pullB.length; i += 3) { qx[tailB & QMASK] = pullB[i]; qy[tailB & QMASK] = pullB[i + 1]; qz[tailB & QMASK] = pullB[i + 2]; tailB++; }
    this.spread(false, 0, tailB);
  }
  // BFS add: queue entries already in qx/qy/qz [head,tail)
  spread(sky, head, tail) {
    while (head < tail) {
      const x = qx[head & QMASK], y = qy[head & QMASK], z = qz[head & QMASK]; head++;
      const c0 = this.getChunk(x >> 4, z >> 4); if (!c0) continue;
      const i0 = (x & 15) + ((z & 15) << 4) + (y << 8);
      const v0 = c0.light[i0]; const L = sky ? v0 >> 4 : v0 & 15;
      if (L <= 1) continue;
      for (let d = 0; d < 6; d++) {
        const dd = DIRS[d]; const nx = x + dd[0], ny = y + dd[1], nz = z + dd[2];
        if (ny < 0 || ny >= CH) continue;
        const c = (nx >> 4 === c0.cx && nz >> 4 === c0.cz) ? c0 : this.getChunk(nx >> 4, nz >> 4); if (!c) continue;
        const ii = (nx & 15) + ((nz & 15) << 4) + (ny << 8);
        const op = B.LIGHT_OP[c.blocks[ii]]; if (op >= 15) continue;
        const nl = (sky && d === 3 && L === 15) ? 15 - op : L - 1 - op;
        const cur = c.light[ii];
        if (sky) { if (nl > (cur >> 4)) { c.light[ii] = (cur & 15) | (nl << 4); qx[tail & QMASK] = nx; qy[tail & QMASK] = ny; qz[tail & QMASK] = nz; tail++; this.markDirty(c, nx & 15, nz & 15, false); } }
        else if (nl > (cur & 15)) { c.light[ii] = (cur & 0xF0) | nl; qx[tail & QMASK] = nx; qy[tail & QMASK] = ny; qz[tail & QMASK] = nz; tail++; this.markDirty(c, nx & 15, nz & 15, false); }
      }
    }
  }
  removeLight(sky, x0, y0, z0) {
    const c0 = this.getChunk(x0 >> 4, z0 >> 4); if (!c0) return;
    const i0 = (x0 & 15) + ((z0 & 15) << 4) + (y0 << 8);
    const v = c0.light[i0]; const L0 = sky ? v >> 4 : v & 15; if (L0 === 0) return;
    c0.light[i0] = sky ? (v & 15) : (v & 0xF0);
    let rh = 0, rt = 0, at = 0;
    rx[rt & QMASK] = x0; ry[rt & QMASK] = y0; rz[rt & QMASK] = z0; rl[rt & QMASK] = L0; rt++;
    while (rh < rt) {
      const x = rx[rh & QMASK], y = ry[rh & QMASK], z = rz[rh & QMASK], L = rl[rh & QMASK]; rh++;
      for (let d = 0; d < 6; d++) {
        const dd = DIRS[d]; const nx = x + dd[0], ny = y + dd[1], nz = z + dd[2];
        if (ny < 0 || ny >= CH) continue;
        const c = this.getChunk(nx >> 4, nz >> 4); if (!c) continue;
        const ii = (nx & 15) + ((nz & 15) << 4) + (ny << 8);
        const cur = c.light[ii]; const n = sky ? cur >> 4 : cur & 15;
        if (n === 0) continue;
        this.markDirty(c, nx & 15, nz & 15, true);
        const em = B.EMIT[c.blocks[ii]];
        if (!sky && em > 0) { c.light[ii] = (cur & 0xF0) | em; qx[at & QMASK] = nx; qy[at & QMASK] = ny; qz[at & QMASK] = nz; at++; continue; }
        if (n < L || (sky && d === 3 && L === 15)) {
          c.light[ii] = sky ? (cur & 15) : (cur & 0xF0);
          rx[rt & QMASK] = nx; ry[rt & QMASK] = ny; rz[rt & QMASK] = nz; rl[rt & QMASK] = n; rt++;
        } else { qx[at & QMASK] = nx; qy[at & QMASK] = ny; qz[at & QMASK] = nz; at++; }
      }
    }
    this.spread(sky, 0, at);
  }

  // ------------------------------------------------------------ edits
  setBlock(x, y, z, id, record = true) {
    if (y < 0 || y >= CH) return false;
    const c = this.getChunk(x >> 4, z >> 4); if (!c) return false;
    const lx = x & 15, lz = z & 15, idx = lx + (lz << 4) + (y << 8);
    const old = c.blocks[idx]; if (old === id) return false;
    c.blocks[idx] = id;
    { const hi = lx + (lz << 4); const op = B.LIGHT_OP[id];
      if (op > 0 && y > c.hm[hi]) c.hm[hi] = y;
      else if (op === 0 && y === c.hm[hi]) { let yy = y - 1; while (yy > 0 && B.LIGHT_OP[c.blocks[lx + (lz << 4) + (yy << 8)]] === 0) yy--; c.hm[hi] = yy; } }
    if (id === B.TORCH) this.torches.set(x + ',' + y + ',' + z, [x, y, z]); else if (old === B.TORCH) this.torches.delete(x + ',' + y + ',' + z);
    if (id >= B.WHEAT_1 && id <= B.WHEAT_4) this.crops.set(x + ',' + y + ',' + z, [x, y, z]); else if (old >= B.WHEAT_1 && old <= B.WHEAT_4) this.crops.delete(x + ',' + y + ',' + z);
    if (record) {
      const k = key(c.cx, c.cz); let m = this.edits.get(k); if (!m) { m = new Map(); this.edits.set(k, m); }
      m.set(idx, id);
    }
    // lighting update
    this.removeLight(true, x, y, z); this.removeLight(false, x, y, z);
    const em = B.EMIT[id];
    if (em > 0) { c.light[idx] = (c.light[idx] & 0xF0) | em; qx[0] = x; qy[0] = y; qz[0] = z; this.spread(false, 0, 1); }
    if (B.LIGHT_OP[id] < 15) {
      // pull from neighbours
      let tS = 0;
      if (y + 1 >= CH || (this.getLight(x, y + 1, z) >> 4) === 15) {
        if (B.LIGHT_OP[id] === 0 || true) {
          const s0 = 15 - B.LIGHT_OP[id]; if (s0 > 0) { c.light[idx] = (c.light[idx] & 15) | (s0 << 4); qx[tS] = x; qy[tS] = y; qz[tS] = z; tS++; }
        }
      }
      for (let d = 0; d < 6; d++) {
        const dd = DIRS[d]; const nx = x + dd[0], ny = y + dd[1], nz = z + dd[2]; if (ny < 0 || ny >= CH) continue;
        qx[tS] = nx; qy[tS] = ny; qz[tS] = nz; tS++;
      }
      this.spread(true, 0, tS);
      let tB = 0;
      for (let d = 0; d < 6; d++) { const dd = DIRS[d]; const nx = x + dd[0], ny = y + dd[1], nz = z + dd[2]; if (ny < 0 || ny >= CH) continue; qx[tB] = nx; qy[tB] = ny; qz[tB] = nz; tB++; }
      this.spread(false, 0, tB);
    }
    this.markDirty(c, lx, lz, true);
    // heightmap approx
    // falling blocks
    if (this.onFall) { this.pendingFall.push(x, y, z); this.pendingFall.push(x, y + 1, z); }
    return true;
  }
  processFalls() {
    const q = this.pendingFall; this.pendingFall = [];
    for (let i = 0; i < q.length; i += 3) {
      const x = q[i], y = q[i + 1], z = q[i + 2];
      const b = this.getBlock(x, y, z);
      if (!B.FALLS[b]) continue;
      const below = this.getBlock(x, y - 1, z);
      if (y > 0 && (below === 0 || below === B.WATER || below === B.LAVA || B.SHAPE[below] === 1 || below === B.TORCH)) {
        this.setBlock(x, y, z, 0);
        if (this.onFall) this.onFall(x, y, z, b);
      }
    }
  }

  // ------------------------------------------------------------ raycast (voxel DDA)
  raycast(ox, oy, oz, dx, dy, dz, maxD, includeLiquid = false) {
    let x = Math.floor(ox), y = Math.floor(oy), z = Math.floor(oz);
    const sx = dx > 0 ? 1 : -1, sy = dy > 0 ? 1 : -1, sz = dz > 0 ? 1 : -1;
    const tdx = dx === 0 ? Infinity : Math.abs(1 / dx), tdy = dy === 0 ? Infinity : Math.abs(1 / dy), tdz = dz === 0 ? Infinity : Math.abs(1 / dz);
    let tmx = dx === 0 ? Infinity : ((dx > 0 ? x + 1 - ox : ox - x) * tdx);
    let tmy = dy === 0 ? Infinity : ((dy > 0 ? y + 1 - oy : oy - y) * tdy);
    let tmz = dz === 0 ? Infinity : ((dz > 0 ? z + 1 - oz : oz - z) * tdz);
    let nx = 0, ny = 0, nz = 0, t = 0;
    for (let i = 0; i < 200; i++) {
      const b = this.getBlock(x, y, z);
      if (b && (B.TARGETABLE[b] || (includeLiquid && (b === B.WATER || b === B.LAVA)))) return { x, y, z, block: b, nx, ny, nz, t };
      if (tmx < tmy && tmx < tmz) { t = tmx; if (t > maxD) return null; x += sx; tmx += tdx; nx = -sx; ny = 0; nz = 0; }
      else if (tmy < tmz) { t = tmy; if (t > maxD) return null; y += sy; tmy += tdy; nx = 0; ny = -sy; nz = 0; }
      else { t = tmz; if (t > maxD) return null; z += sz; tmz += tdz; nx = 0; ny = 0; nz = -sz; }
    }
    return null;
  }

  // AABB collision movement. e: {x,y,z (bottom centre), hw, h, vx,vy,vz, onGround}
  collides(x, y, z, hw, h) {
    const x0 = Math.floor(x - hw), x1 = Math.floor(x + hw), y0 = Math.floor(y), y1 = Math.floor(y + h - 0.0001), z0 = Math.floor(z - hw), z1 = Math.floor(z + hw);
    for (let yy = y0; yy <= y1; yy++) for (let zz = z0; zz <= z1; zz++) for (let xx = x0; xx <= x1; xx++) {
      const b = this.getBlock(xx, yy, zz);
      if (B.SOLID[b]) {
        const sh = B.SHAPE[b];
        if (sh === 5) { if (y < yy + 0.5 - 1e-6) return true; }
        else if (sh === 6) {
          if (y < yy + 0.5 - 1e-6) return true;
          const f = (b - B.STAIR_BASE) & 3; let bx0 = xx, bx1 = xx + 1, bz0 = zz, bz1 = zz + 1;
          if (f === 0) bz0 += 0.5; else if (f === 1) bz1 -= 0.5; else if (f === 2) bx0 += 0.5; else bx1 -= 0.5;
          if (x + hw > bx0 && x - hw < bx1 && z + hw > bz0 && z - hw < bz1) return true;
        } else return true;
      }
    }
    return false;
  }
  groundTop(x, y, z, hw) {
    const yy = Math.floor(y); let top = yy + 1;
    const x0 = Math.floor(x - hw), x1 = Math.floor(x + hw), z0 = Math.floor(z - hw), z1 = Math.floor(z + hw); let best = -1e9;
    for (let zz = z0; zz <= z1; zz++) for (let xx = x0; xx <= x1; xx++) { const b = this.getBlock(xx, yy, zz);
      if (B.SOLID[b]) {
        let top = B.SHAPE[b] === 5 ? 0.5 : 1;
        if (B.SHAPE[b] === 6) { const f = (b - B.STAIR_BASE) & 3; let bx0 = xx, bx1 = xx + 1, bz0 = zz, bz1 = zz + 1; if (f === 0) bz0 += 0.5; else if (f === 1) bz1 -= 0.5; else if (f === 2) bx0 += 0.5; else bx1 -= 0.5; top = (x + hw > bx0 && x - hw < bx1 && z + hw > bz0 && z - hw < bz1) ? 1 : 0.5; }
        best = Math.max(best, yy + top);
      } }
    return best > -1e8 ? best : top;
  }
  tryStep(e, nx, nz) {
    if (!e.onGroundPrev) return false;
    let r = 0.06; while (r <= 0.56 && this.collides(nx, e.y + r, nz, e.hw, e.h)) r += 0.05;
    if (r > 0.56) return false;
    e.y += r + 1e-3; e.x = nx; e.z = nz; return true;
  }
  moveEntity(e, dx, dy, dz) {
    e.onGroundPrev = e.onGround;
    e.hitX = e.hitZ = false; e.onGround = false;
    const st = (d) => Math.max(1, Math.ceil(Math.abs(d) / 0.3));
    let n = st(dy), s = dy / n;
    for (let i = 0; i < n && s !== 0; i++) {
      const ny = e.y + s;
      if (this.collides(e.x, ny, e.z, e.hw, e.h)) {
        if (s < 0) { e.y = this.groundTop(e.x, ny, e.z, e.hw) + 1e-4; e.onGround = true; } else e.y = Math.floor(ny + e.h) - e.h - 1e-4;
        e.vy = 0; break;
      } else e.y = ny;
    }
    n = st(dx); s = dx / n;
    for (let i = 0; i < n && s !== 0; i++) {
      const nx = e.x + s;
      if (this.collides(nx, e.y, e.z, e.hw, e.h)) { if (e.step && this.tryStep(e, nx, e.z)) continue; e.hitX = true; e.vx = 0; break; } else e.x = nx;
    }
    n = st(dz); s = dz / n;
    for (let i = 0; i < n && s !== 0; i++) {
      const nz = e.z + s;
      if (this.collides(e.x, e.y, nz, e.hw, e.h)) { if (e.step && this.tryStep(e, e.x, nz)) continue; e.hitZ = true; e.vz = 0; break; } else e.z = nz;
    }
  }
}
