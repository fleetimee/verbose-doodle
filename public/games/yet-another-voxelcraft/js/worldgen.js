import { Noise, mulberry, hash3 } from './noise.js';
import * as B from './blocks.js';

export const CS = 16, CH = 96, SEA = 30;
export const BIOME = { PLAINS: 0, FOREST: 1, DESERT: 2, SNOWY: 3, MOUNTAIN: 4, OCEAN: 5, BEACH: 6 };
export const BIOME_NAMES = ['Plains', 'Forest', 'Desert', 'Snowy Tundra', 'Mountains', 'Ocean', 'Beach'];
// tint palettes: index 0 = none, 1..7 grass by biome, 9..15 foliage by biome
export const TINT_TABLE = (() => {
  const t = new Array(16).fill(0).map(() => [1, 1, 1]);
  const g = [[0.54, 0.78, 0.30], [0.42, 0.70, 0.24], [0.74, 0.76, 0.36], [0.50, 0.68, 0.48], [0.50, 0.72, 0.38], [0.52, 0.76, 0.34], [0.58, 0.78, 0.38]];
  const f = [[0.42, 0.68, 0.22], [0.32, 0.60, 0.20], [0.66, 0.68, 0.30], [0.36, 0.56, 0.42], [0.38, 0.62, 0.28], [0.42, 0.66, 0.22], [0.46, 0.68, 0.26]];
  for (let i = 0; i < 7; i++) { t[1 + i] = g[i]; t[9 + i] = f[i]; }
  return t;
})();
const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

export class Gen {
  constructor(seed) {
    this.seed = seed;
    this.nA = new Noise(seed); this.nB = new Noise(seed + 101); this.nC = new Noise(seed + 202);
    this.nT = new Noise(seed + 303); this.nH = new Noise(seed + 404); this.nR = new Noise(seed + 505);
    this.nCave = new Noise(seed + 606); this.nCave2 = new Noise(seed + 707); this.nCave3 = new Noise(seed + 808);
    this.col = { h: 0, biome: 0 };
  }
  column(x, z) {
    const cont = this.nA.fbm2(x * 0.0032, z * 0.0032, 4);
    const mask = smooth(0.02, 0.32, this.nB.fbm2(x * 0.0028 + 200, z * 0.0028 - 90, 3));
    const hills = this.nC.fbm2(x * 0.017, z * 0.017, 4) * 5.5;
    let h = 37 + cont * 26 + hills;
    let ridge = 1 - Math.abs(this.nB.fbm2(x * 0.0085 + 50, z * 0.0085 + 50, 4)); ridge = Math.pow(ridge, 2.4);
    h += mask * (ridge * 46 + 4);
    const rv = Math.abs(this.nR.fbm2(x * 0.0042, z * 0.0042 + 30, 2));
    const river = 1 - smooth(0.0, 0.05, rv);
    if (h > SEA - 4 && h < 60) h += (SEA - 2.4 - h) * river * (1 - mask) * 0.92;
    h = Math.max(4, Math.min(CH - 10, Math.floor(h)));
    const wx = x + this.nR.n2(x * 0.012 + 9, z * 0.012) * 22, wz = z + this.nR.n2(x * 0.012, z * 0.012 + 9) * 22;
    const temp = this.nT.fbm2(wx * 0.0021, wz * 0.0021, 3), hum = this.nH.fbm2(wx * 0.0021 + 300, wz * 0.0021 - 300, 3);
    let biome;
    if (h < SEA - 1) biome = BIOME.OCEAN;
    else if (h <= SEA + 1) biome = BIOME.BEACH;
    else if (h >= 66) biome = BIOME.MOUNTAIN;
    else if (temp < -0.2) biome = BIOME.SNOWY;
    else if (temp > 0.17 && hum < 0.08) biome = BIOME.DESERT;
    else if (hum > 0.03) biome = BIOME.FOREST;
    else biome = BIOME.PLAINS;
    const c = this.col; c.h = h; c.biome = biome; c.temp = temp; c.hum = hum;
    return c;
  }
  findSpawn() {
    for (let r = 0; r < 400; r += 4) for (let a = 0; a < 16; a++) {
      const x = Math.round(Math.cos(a * 0.3927) * r), z = Math.round(Math.sin(a * 0.3927) * r);
      const c = this.column(x, z);
      if (c.h > SEA + 2 && c.biome !== BIOME.MOUNTAIN && c.biome !== BIOME.OCEAN && c.biome !== BIOME.DESERT) return { x: x + 0.5, y: c.h + 1, z: z + 0.5 };
    }
    return { x: 0.5, y: 60, z: 0.5 };
  }

  treeCandidates(cx, cz) {
    const rng = mulberry(hash3(cx, cz, 77, this.seed) * 4294967296);
    const out = [];
    const center = this.column(cx * 16 + 8, cz * 16 + 8).biome;
    let attempts = 0, p = 0;
    if (center === BIOME.FOREST) { attempts = 10; p = 0.8; }
    else if (center === BIOME.PLAINS) { attempts = 3; p = 0.3; }
    else if (center === BIOME.SNOWY) { attempts = 6; p = 0.6; }
    else if (center === BIOME.DESERT) { attempts = 7; p = 0.5; }
    else if (center === BIOME.MOUNTAIN) { attempts = 4; p = 0.4; }
    else return out;
    for (let i = 0; i < attempts; i++) {
      const lx = Math.floor(rng() * 16), lz = Math.floor(rng() * 16), roll = rng(), hr = rng(), hr2 = rng();
      if (roll > p) continue;
      const wx = cx * 16 + lx, wz = cz * 16 + lz;
      const c = this.column(wx, wz);
      if (c.h <= SEA + 1 || c.biome === BIOME.OCEAN || c.biome === BIOME.BEACH) continue;
      let ok = true; for (const o of out) if (Math.abs(o.x - wx) < 3 && Math.abs(o.z - wz) < 3) { ok = false; break; }
      if (!ok) continue;
      let kind;
      if (c.biome === BIOME.DESERT) kind = 'cactus';
      else if (c.biome === BIOME.SNOWY) kind = 'spruce';
      else if (c.biome === BIOME.MOUNTAIN) { if (c.h > 74) continue; kind = 'spruce'; }
      else kind = (c.biome === BIOME.FOREST ? hr2 < 0.4 : hr2 < 0.12) ? 'birch' : 'oak';
      const ht = kind === 'oak' ? 4 + Math.floor(hr * 3) : kind === 'birch' ? 5 + Math.floor(hr * 3) : kind === 'spruce' ? 6 + Math.floor(hr * 4) : 1 + Math.floor(hr * 3);
      out.push({ x: wx, z: wz, y: c.h + 1, kind, ht, r: hr2 });
    }
    return out;
  }

  generate(chunk, edits) {
    const bl = chunk.blocks, ox = chunk.cx * 16, oz = chunk.cz * 16;
    const heights = new Int16Array(256), biomes = chunk.biome;
    const tops = new Uint8Array(256), fill = new Uint8Array(256);
    for (let lz = 0; lz < 16; lz++) for (let lx = 0; lx < 16; lx++) {
      const c = this.column(ox + lx, oz + lz);
      const i = lx + lz * 16; heights[i] = c.h; biomes[i] = c.biome;
    }
    // caves: coarse 3D noise grid
    const GX = 5, GY = CH / 4 + 1;
    const cheese = new Float32Array(GX * GX * GY), sp1 = new Float32Array(GX * GX * GY), sp2 = new Float32Array(GX * GX * GY);
    for (let gz = 0; gz < GX; gz++) for (let gx = 0; gx < GX; gx++) for (let gy = 0; gy < GY; gy++) {
      const x = ox + gx * 4, y = gy * 4, z = oz + gz * 4, i = (gz * GX + gx) * GY + gy;
      cheese[i] = this.nCave.fbm3(x * 0.026, y * 0.034, z * 0.026, 2);
      sp1[i] = this.nCave2.n3(x * 0.016, y * 0.026, z * 0.016);
      sp2[i] = this.nCave3.n3(x * 0.016 + 40, y * 0.026, z * 0.016 - 40);
    }
    const tri = (arr, fx, fy, fz, gx, gy, gz) => {
      const b = (gz * GX + gx) * GY + gy;
      const c00 = arr[b] * (1 - fy) + arr[b + 1] * fy, c10 = arr[b + GY] * (1 - fy) + arr[b + GY + 1] * fy;
      const c01 = arr[b + GX * GY] * (1 - fy) + arr[b + GX * GY + 1] * fy, c11 = arr[b + GX * GY + GY] * (1 - fy) + arr[b + GX * GY + GY + 1] * fy;
      const a = c00 * (1 - fx) + c10 * fx, bb = c01 * (1 - fx) + c11 * fx;
      return a * (1 - fz) + bb * fz;
    };
    const rng = mulberry(hash3(chunk.cx, chunk.cz, 5, this.seed) * 4294967296);
    for (let lz = 0; lz < 16; lz++) for (let lx = 0; lx < 16; lx++) {
      const i = lx + lz * 16, h = heights[i], biome = biomes[i];
      // layers
      let top, sub, subDepth = 3;
      if (biome === BIOME.DESERT) { top = B.SAND; sub = B.SAND; subDepth = 4; }
      else if (biome === BIOME.SNOWY) { top = this.nC.n2((ox + lx) * 0.05 + 7, (oz + lz) * 0.05) > 0.18 ? B.GRASS : B.SNOWGRASS; sub = B.DIRT; }
      else if (biome === BIOME.MOUNTAIN) { top = h > 76 ? B.SNOW : (h < 71 && this.nC.n2((ox + lx) * 0.07, (oz + lz) * 0.07) > -0.1 ? B.GRASS : B.STONE); sub = top === B.GRASS ? B.DIRT : B.STONE; }
      else if (biome === BIOME.OCEAN) { const n = this.nC.n2((ox + lx) * 0.05, (oz + lz) * 0.05); top = n > 0.2 ? B.GRAVEL : n < -0.25 ? B.DIRT : B.SAND; sub = top === B.GRAVEL ? B.GRAVEL : top === B.DIRT ? B.DIRT : B.SAND; }
      else if (biome === BIOME.BEACH) { top = B.SAND; sub = B.SAND; }
      else { top = B.GRASS; sub = B.DIRT; }
      const cx3 = lx / 4, cz3 = lz / 4, gx = Math.floor(cx3), gz = Math.floor(cz3), fx = cx3 - gx, fz = cz3 - gz;
      const land = h > SEA + 2;
      for (let y = 0; y <= h; y++) {
        let id;
        if (y === 0) id = B.BEDROCK;
        else if (y < 4 && rng() < 0.6 - y * 0.15) id = B.BEDROCK;
        else if (y === h) id = top;
        else if (y > h - 1 - subDepth && sub !== B.STONE) id = (biome === BIOME.DESERT && y < h - 3) ? B.SANDSTONE : sub;
        else if (biome === BIOME.DESERT && y > h - 8) id = B.SANDSTONE;
        else id = B.STONE;
        if (y > 3 && id !== B.BEDROCK) {
          // cave carving
          const carveTop = land ? h : h - 6;
          if (y <= carveTop) {
            const gy = Math.floor(y / 4), fy = y / 4 - gy;
            const c = tri(cheese, fx, fy, fz, gx, gy, gz);
            const depthN = h - y;
            const thr = 0.46 + (depthN < 9 ? (9 - depthN) * 0.05 : 0) + (y > 56 ? (y - 56) * 0.02 : 0) + (y < 12 ? -0.02 : 0);
            let carve = c > thr;
            if (!carve) {
              const s1 = tri(sp1, fx, fy, fz, gx, gy, gz), s2 = tri(sp2, fx, fy, fz, gx, gy, gz);
              const lim = depthN < 6 ? 0.0011 : 0.0021;
              carve = s1 * s1 + s2 * s2 < lim;
            }
            if (carve) id = (y <= 9) ? B.LAVA : B.AIR;
          }
        }
        bl[lx + (lz << 4) + (y << 8)] = id;
      }
      // water
      if (h < SEA) {
        for (let y = h + 1; y <= SEA; y++) bl[lx + (lz << 4) + (y << 8)] = B.WATER;
        if (biome === BIOME.OCEAN || biome === BIOME.BEACH) {
          const t = this.column(ox + lx, oz + lz); // temp
          if (t.temp < -0.3) bl[lx + (lz << 4) + (SEA << 8)] = B.ICE;
        }
      }
      fill[i] = top;
    }
    // ores and pockets
    const vein = (id, tries, ymin, ymax, size, host) => {
      for (let t = 0; t < tries; t++) {
        let x = Math.floor(rng() * 16), z = Math.floor(rng() * 16), y = ymin + Math.floor(rng() * (ymax - ymin));
        for (let s = 0; s < size; s++) {
          if (x >= 0 && x < 16 && z >= 0 && z < 16 && y > 0 && y < CH) {
            const k = x + (z << 4) + (y << 8);
            if (bl[k] === host && rng() < 0.75) bl[k] = id;
          }
          x += Math.floor(rng() * 3) - 1; y += Math.floor(rng() * 3) - 1; z += Math.floor(rng() * 3) - 1;
        }
      }
    };
    vein(B.COAL_ORE, 22, 4, 72, 10, B.STONE);
    vein(B.IRON_ORE, 16, 4, 56, 7, B.STONE);
    vein(B.GOLD_ORE, 4, 4, 28, 6, B.STONE);
    vein(B.DIAMOND_ORE, 3, 3, 16, 5, B.STONE);
    vein(B.GRAVEL, 6, 8, 60, 14, B.STONE);
    vein(B.DIRT, 8, 20, 70, 12, B.STONE);
    // trees & decoration
    for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
      const trees = this.treeCandidates(chunk.cx + dx, chunk.cz + dz);
      for (const t of trees) this.placeTree(chunk, t);
    }
    for (let lz = 0; lz < 16; lz++) for (let lx = 0; lx < 16; lx++) {
      const i = lx + lz * 16, h = heights[i], biome = biomes[i];
      if (h <= SEA || h >= CH - 3) continue;
      const k = lx + (lz << 4) + ((h + 1) << 8);
      const r = hash3(ox + lx, oz + lz, 9, this.seed);
      if (biome === BIOME.DESERT && bl[k] === B.AIR && bl[k - 256] === B.SAND && r < 0.025) { bl[k] = B.DEAD_BUSH; continue; }
      if (bl[k] !== B.AIR || (bl[k - 256] !== B.GRASS && bl[k - 256] !== B.SNOWGRASS)) continue;
      if (biome === BIOME.PLAINS) { if (r < 0.16) bl[k] = B.TALLGRASS; else if (r < 0.175) bl[k] = B.FLOWER_R; else if (r < 0.19) bl[k] = B.FLOWER_Y; }
      else if (biome === BIOME.FOREST) { if (r < 0.07) bl[k] = B.TALLGRASS; else if (r < 0.075) bl[k] = B.FLOWER_R; }
      else if (biome === BIOME.MOUNTAIN && r < 0.03) bl[k] = B.TALLGRASS;
      else if (biome === BIOME.SNOWY && r < 0.05) bl[k] = B.TALLGRASS;
    }
    // small cabins with loot
    chunk.loot = [];
    const cr = mulberry(hash3(chunk.cx, chunk.cz, 99, this.seed) * 4294967296);
    if (cr() < 0.11) {
      const variant = cr() < 0.5 ? 0 : 1;
      const W = variant ? 5 : 7, D = variant ? 5 : 6, ax = 2 + Math.floor(cr() * (variant ? 7 : 4)), az = 2 + Math.floor(cr() * (variant ? 7 : 4));
      let lo = 999, hi = 0, ok = true;
      for (let z = az; z < az + D; z++) for (let x = ax; x < ax + W; x++) { const h = heights[x + z * 16], bm = biomes[x + z * 16]; lo = Math.min(lo, h); hi = Math.max(hi, h); if (h <= SEA + 1 || bm === BIOME.OCEAN || bm === BIOME.BEACH || bm === BIOME.DESERT || bm === BIOME.MOUNTAIN) ok = false; }
      if (ok && hi - lo <= 4) {
        const gy = hi, snow = biomes[ax + az * 16] === BIOME.SNOWY;
        const W1 = snow ? B.SPRUCE_PLANKS : B.PLANKS, LG = snow ? B.SPRUCE_LOG : B.LOG;
        const set = (x, y, z, id) => { if (y >= 0 && y < CH) bl[x + (z << 4) + (y << 8)] = id; };
        for (let z = az; z < az + D; z++) for (let x = ax; x < ax + W; x++) {
          for (let y = heights[x + z * 16] + 1; y <= gy + 8; y++) set(x, y, z, B.AIR);
          for (let y = heights[x + z * 16]; y < gy; y++) set(x, y, z, B.COBBLE);
          set(x, gy, z, B.COBBLE);
          const edgeX = x === ax || x === ax + W - 1, edgeZ = z === az || z === az + D - 1;
          for (let y = gy + 1; y <= gy + 3; y++) {
            if (edgeX && edgeZ) set(x, y, z, LG);
            else if (edgeX || edgeZ) set(x, y, z, (y === gy + 2 && ((edgeZ && (x - ax) % 2 === 1 && x !== ax + 3) || (edgeX && (z - az) === 2))) ? B.GLASS : W1);
          }
          set(x, gy + 4, z, W1);
          if (!edgeX && !edgeZ) set(x, gy, z, W1);
        }
        const dx = ax + 3; set(dx, gy + 1, az, B.AIR); set(dx, gy + 2, az, B.AIR);
        set(ax + W - 2, gy + 1, az + D - 2, B.CHEST); set(ax + 1, gy + 1, az + D - 2, B.CRAFTING); set(ax + 1, gy + 1, az + 1, B.TORCH); set(ax + W - 2, gy + 1, az + 1, B.TORCH);
        set(ax + 3, gy + 1, az + 3, B.FURNACE);
        const items = [[B.COAL, 2, 6], [B.IRON_INGOT, 1, 4], [B.STICK, 2, 8], [B.APPLE, 1, 3], [B.PORK_COOKED, 1, 3], [B.STRING, 1, 3], [B.BONE, 1, 3], [B.TORCH, 3, 8], [B.ARROW, 4, 12], [B.GOLD_INGOT, 1, 3], [B.DIAMOND, 1, 1]];
        const chosen = []; const n = 4 + Math.floor(cr() * 3);
        for (let i = 0; i < n; i++) { const it = items[Math.min(items.length - 1, Math.floor(Math.pow(cr(), 1.6) * items.length))]; chosen.push({ id: it[0], n: it[1] + Math.floor(cr() * (it[2] - it[1] + 1)) }); }
        chunk.loot.push({ x: ox + ax + W - 2, y: gy + 1, z: oz + az + D - 2, items: chosen });
      }
    }
    // underground dungeon room with loot
    if (cr() < 0.09) {
      const ax = 2 + Math.floor(cr() * 6), az = 2 + Math.floor(cr() * 6), ay = 10 + Math.floor(cr() * 16);
      const hAt = heights[(ax + 3) + (az + 3) * 16];
      if (ay + 6 < hAt - 3) {
        for (let dy = -1; dy <= 4; dy++) for (let dz = 0; dz < 7; dz++) for (let dx = 0; dx < 7; dx++) {
          const shell = dy === -1 || dy === 4 || dx === 0 || dx === 6 || dz === 0 || dz === 6;
          const k = (ax + dx) + ((az + dz) << 4) + ((ay + dy) << 8);
          if (bl[k] === B.BEDROCK) continue;
          bl[k] = shell ? (cr() < 0.25 ? B.STONE_BRICKS : B.COBBLE) : B.AIR;
        }
        const set = (x, y, z, id) => { bl[(ax + x) + ((az + z) << 4) + ((ay + y) << 8)] = id; };
        set(1, 0, 1, B.CHEST); set(5, 0, 5, B.CHEST); set(1, 0, 5, B.TORCH); set(5, 0, 1, B.TORCH); set(3, 0, 3, B.WATER); set(3, 1, 3, B.WATER); set(3, 2, 3, B.WATER); set(3, 3, 3, B.WATER); set(2, 0, 1, B.TORCH);
        const rich = [[B.IRON_INGOT, 2, 6], [B.GOLD_INGOT, 1, 4], [B.DIAMOND, 1, 2], [B.COAL, 3, 9], [B.BONE, 2, 6], [B.STRING, 2, 5], [B.GUNPOWDER, 2, 5], [B.ARROW, 6, 16], [B.BREAD, 2, 4], [B.armorId(0, 0), 1, 1], [B.armorId(3, 0), 1, 1], [B.SEEDS, 3, 8], [B.toolId(0, 2), 1, 1]];
        // water shaft to the surface (safe drop) + stone-brick marker with torches
        const sx = ax + 3, sz = az + 3, top = heights[sx + sz * 16];
        for (let y = ay; y <= top; y++) bl[sx + (sz << 4) + (y << 8)] = B.WATER;
        for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) if (dx || dz) { const px = sx + dx, pz = sz + dz; if (px >= 0 && px < 16 && pz >= 0 && pz < 16) { const th = heights[px + pz * 16]; for (let y = th; y <= Math.max(th, top) + 1 && y < CH; y++) if (y >= top) bl[px + (pz << 4) + (y << 8)] = B.STONE_BRICKS; } }
        bl[(sx + 1) + (sz << 4) + ((top + 2) << 8)] = B.TORCH; bl[(sx - 1) + (sz << 4) + ((top + 2) << 8)] = B.TORCH;
        for (const [cx2, cz2] of [[1, 1], [5, 5]]) { const items = []; const n = 4 + Math.floor(cr() * 4); for (let i = 0; i < n; i++) { const it = rich[Math.floor(cr() * rich.length)]; items.push({ id: it[0], n: it[1] + Math.floor(cr() * (it[2] - it[1] + 1)) }); } chunk.loot.push({ x: ox + ax + cx2, y: ay, z: oz + az + cz2, items }); }
      }
    }
    // passive mob spawn points
    chunk.spawns = [];
    const sr = mulberry(hash3(chunk.cx, chunk.cz, 13, this.seed) * 4294967296);
    if (sr() < 0.85) {
      const lx = Math.floor(sr() * 12) + 2, lz = Math.floor(sr() * 12) + 2, i = lx + lz * 16;
      if ((biomes[i] === BIOME.PLAINS || biomes[i] === BIOME.FOREST) && heights[i] > SEA) {
        const kind = ['pig', 'cow', 'sheep'][Math.floor(sr() * 3)], n = 3 + Math.floor(sr() * 3);
        for (let q = 0; q < n; q++) {
          const x = Math.min(15, Math.max(0, lx + Math.floor(sr() * 5) - 2)), z = Math.min(15, Math.max(0, lz + Math.floor(sr() * 5) - 2));
          const hh = heights[x + z * 16];
          if (hh > SEA) chunk.spawns.push({ kind, x: ox + x + 0.5, y: hh + 1.1, z: oz + z + 0.5 });
        }
      }
    }
    if (edits) for (const [idx, id] of edits) bl[idx] = id;
  }

  placeTree(chunk, t) {
    const bl = chunk.blocks, ox = chunk.cx * 16, oz = chunk.cz * 16;
    const put = (wx, y, wz, id, onlyAir = true) => {
      const lx = wx - ox, lz = wz - oz;
      if (lx < 0 || lx > 15 || lz < 0 || lz > 15 || y < 1 || y >= CH) return;
      const k = lx + (lz << 4) + (y << 8);
      if (onlyAir) { const c = bl[k]; if (c !== B.AIR && c !== B.TALLGRASS && c !== B.FLOWER_R && c !== B.FLOWER_Y) return; }
      bl[k] = id;
    };
    const { x, z, y, ht } = t;
    if (t.kind === 'cactus') { for (let i = 0; i < ht; i++) put(x, y + i, z, B.CACTUS); return; }
    if (t.kind === 'oak' || t.kind === 'birch') {
      const LG = t.kind === 'birch' ? B.BIRCH_LOG : B.LOG;
      const top = y + ht;
      for (let ly = top - 2; ly <= top + 1; ly++) {
        const r = ly >= top ? (ly === top ? 1 : 1) : 2;
        for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
          if (ly > top) { if (Math.abs(dx) + Math.abs(dz) > 1) continue; }
          else if (Math.abs(dx) === r && Math.abs(dz) === r && (r === 2 || ly === top) && hash3(x + dx, ly + dz, z, this.seed) < 0.5) continue;
          put(x + dx, ly, z + dz, B.LEAVES);
        }
      }
      for (let i = 0; i < ht; i++) put(x, y + i, z, LG, false);
      put(x, top, z, LG, false);
    } else { // spruce
      const top = y + ht;
      for (let dy = 0; dy <= ht - 1; dy++) {
        const ly = top + 1 - dy;
        let r = Math.min(3, Math.ceil(dy / 2)); if (dy > 2 && dy % 2 === 0) r = Math.max(1, r - 1); if (dy === 0) r = 0;
        for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
          if (Math.abs(dx) + Math.abs(dz) > r + (r > 1 ? 1 : 0)) continue;
          put(x + dx, ly, z + dz, B.LEAVES);
        }
      }
      for (let i = 0; i < ht; i++) put(x, y + i, z, B.SPRUCE_LOG, false);
    }
  }
}
