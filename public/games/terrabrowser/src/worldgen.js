// Seeded world generation. Runs as a sequence of async passes so the loading screen can report progress.
import { CFG } from './config.js';
import { makeRng, makeNoise } from './rng.js';
import { T, W, SOLID } from './tiles.js';
import { createWorld, computeSkyTop, placeFurn } from './world.js';
import { chestLoot } from './items.js';

const Z = { OCEAN: 0, FOREST: 1, SNOW: 2, BLIGHT: 3, DESERT: 4, JUNGLE: 5 };
export const ZONES = Z;
const wait = () => new Promise(r => setTimeout(r, 0));
const smooth = t => t * t * (3 - 2 * t);

export async function generateWorld(seed, name, progress) {
  const WW = CFG.WORLD_W, H = CFG.WORLD_H;
  const wd = createWorld(WW, H);
  wd.seed = seed; wd.name = name;
  const rng = makeRng(seed), nz = makeNoise(seed);
  const tile = wd.tile, wall = wd.wall, surf = wd.surf;
  const zone = new Uint8Array(WW);
  wd.zone = zone;
  const inb = (x, y) => x >= 0 && y >= 0 && x < WW && y < H;
  const get = (x, y) => inb(x, y) ? tile[y * WW + x] : T.STONE;
  const set = (x, y, t) => { if (inb(x, y)) { tile[y * WW + x] = t; wd.meta[y * WW + x] = 0; if (SOLID[t]) wd.liq[y * WW + x] = 0; } };
  const setW = (x, y, w) => { if (inb(x, y)) wall[y * WW + x] = w; };
  const solid = (x, y) => SOLID[get(x, y)] === 1;
  const flip = rng.chance(0.5);
  const fx = x => flip ? WW - 1 - x : x;
  let hellLine = H - 80;
  const cryptMask = new Uint8Array(WW * H);
  const chestAt = (ox, oy, kind) => {
    placeFurn(wd, ox, oy, T.CHEST);
    const arr = wd.chests.get(ox + ',' + oy);
    chestLoot(kind, rng).forEach((it, i) => { if (i < 40) arr[i] = it; });
  };
  const floorAt = (x, y0, y1) => { for (let y = y0; y < y1; y++) if (!solid(x, y) && solid(x, y + 1)) return y; return -1; };

  // ---------------------------------------------------------------- passes
  function zones() {
    const j = () => rng.int(-15, 15);
    const b = [[0, Z.OCEAN], [95 + j(), Z.FOREST], [115 + j(), Z.SNOW], [300 + j(), Z.FOREST], [430 + j(), Z.BLIGHT], [545 + j(), Z.FOREST],
      [1005 + j(), Z.DESERT], [1135 + j(), Z.FOREST], [1180 + j(), Z.JUNGLE], [1420 + j(), Z.FOREST], [1510, Z.OCEAN]];
    for (let x = 0; x < WW; x++) {
      let z = Z.FOREST;
      for (const [s, k] of b) if (x >= s) z = k;
      zone[fx(x)] = z;
    }
    let b0 = WW, b1 = 0;
    for (let x = 0; x < WW; x++) if (zone[x] === Z.BLIGHT) { b0 = Math.min(b0, x); b1 = Math.max(b1, x); }
    wd.blightX = [b0, b1];
    wd.cryptX = fx(1462);
  }

  function terrain() {
    for (let x = 0; x < WW; x++) {
      const z = zone[x];
      let h = 184 + nz.fbm1(x * 0.007, 3) * 14 + nz.fbm1(x * 0.045, 2) * 4;
      if (z === Z.JUNGLE) h += nz.fbm1(x * 0.03 + 40, 2) * 9;
      if (z === Z.DESERT) h = 188 + nz.fbm1(x * 0.012, 2) * 5;
      if (z === Z.SNOW) h -= Math.abs(nz.fbm1(x * 0.018 + 90, 3)) * 18;
      const ds = Math.abs(x - 800);
      if (ds < 30) h = h * (ds / 30) + 186 * (1 - ds / 30);
      const de = Math.min(x, WW - 1 - x);
      if (de < 100) { const t = smooth(Math.max(0, (de - 10) / 90)); h = 212 * (1 - t) + h * t; }
      surf[x] = Math.round(h);
    }
    let mx = 0;
    for (let x = 0; x < WW; x++) mx = Math.max(mx, surf[x]);
    wd.surfaceLine = mx + 3;
    wd.rockLine = wd.surfaceLine + 75;
    wd.hellLine = hellLine;
    const rock = wd.rockLine;
    for (let x = 0; x < WW; x++) {
      const rl = rock + Math.round(nz.fbm1(x * 0.05 + 300, 2) * 6);
      for (let y = surf[x]; y < H; y++) {
        let t = y < rl ? T.DIRT : T.STONE;
        if (t === T.DIRT && y > surf[x] + 5 && nz.fbm2(x * 0.08, y * 0.08, 2) > 0.38) t = T.STONE;
        if (t === T.STONE && nz.fbm2(x * 0.07 + 100, y * 0.07, 2) > 0.45) t = T.DIRT;
        set(x, y, t);
        if (y > surf[x] + 3 && y < rl) setW(x, y, W.DIRT);
      }
    }
  }

  function biomes() {
    const sl = wd.surfaceLine, rock = wd.rockLine;
    for (let x = 0; x < WW; x++) {
      for (let y = surf[x]; y < hellLine - 20; y++) {
        const i = y * WW + x;
        const off = Math.round(nz.fbm2(x * 0.05, y * 0.05, 2) * 10 + (y - surf[x]) * 0.08);
        const zx = Math.max(0, Math.min(WW - 1, x + off));
        const z = zone[zx], t = tile[i];
        if (z === Z.DESERT && y < rock + 40) {
          if (t) tile[i] = y < surf[x] + 14 + nz.fbm1(x * 0.1, 1) * 3 ? T.SAND : T.SANDSTONE;
          if (wall[i]) wall[i] = y < surf[x] + 14 ? W.SAND : W.SANDSTONE;
        } else if (z === Z.SNOW && y < rock + 70) {
          if (t === T.DIRT) tile[i] = T.SNOW;
          else if (t === T.STONE) tile[i] = y > sl && nz.fbm2(x * 0.06, y * 0.06, 2) > 0 ? T.ICE : T.STONE;
          if (wall[i]) wall[i] = W.SNOW;
        } else if (z === Z.JUNGLE) {
          if (t === T.DIRT) tile[i] = T.MUD;
          else if (t === T.STONE && nz.fbm2(x * 0.04 + 7, y * 0.04, 2) > -0.25) tile[i] = T.MUD;
          if (wall[i]) wall[i] = W.MUD;
        } else if (z === Z.OCEAN && y < surf[x] + 14) {
          if (t) tile[i] = T.SAND;
          wall[i] = 0;
        }
      }
    }
  }

  function carve(cx, cy, r, keepWall) {
    const r2 = r * r;
    for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
      if (!inb(x, y) || (x - cx) ** 2 + (y - cy) ** 2 > r2) continue;
      if (cryptMask[y * WW + x]) continue;
      set(x, y, T.AIR);
      if (!keepWall) setW(x, y, 0);
    }
  }

  function caves() {
    const sl = wd.surfaceLine;
    for (let x = 0; x < WW; x++) {
      const top = surf[x] + 8;
      for (let y = top; y < hellLine - 4; y++) {
        const f = Math.max(0, Math.min(1, (y - sl) / (hellLine - sl)));
        const a = nz.fbm2(x * 0.03, y * 0.045, 3);
        if (Math.abs(a) < 0.045 + 0.03 * f) { set(x, y, T.AIR); continue; }
        const b = nz.fbm2(x * 0.018 + 500, y * 0.028, 3);
        if (b > 0.44 - 0.14 * f) { set(x, y, T.AIR); if (y > sl) setW(x, y, 0); }
      }
    }
    // surface entrance tunnels
    for (let k = 0; k < 14; k++) {
      let x = rng.int(120, WW - 120);
      if (zone[x] === Z.OCEAN || Math.abs(x - 800) < 70) continue;
      let y = surf[x] - 1, dir = rng.chance(0.5) ? 1 : -1;
      const len = rng.int(40, 90);
      for (let s = 0; s < len; s++) {
        carve(x, y, 1.6 + rng.next(), s < 6);
        x += dir * rng.range(0.3, 1.2); y += rng.range(0.6, 1.3);
        if (rng.chance(0.05)) dir = -dir;
      }
    }
    // underground worm tunnels
    for (let k = 0; k < 80; k++) {
      let x = rng.int(50, WW - 50), y = rng.int(sl + 10, hellLine - 30);
      let a = rng.range(0, Math.PI * 2);
      const len = rng.int(30, 90);
      for (let s = 0; s < len; s++) {
        carve(x, y, 1.3 + rng.next() * 1.2, false);
        a += rng.range(-0.35, 0.35);
        x += Math.cos(a) * 1.2; y += Math.sin(a) * 0.8;
      }
    }
  }

  function blob(x, y, t, size, replace) {
    for (let s = 0; s < size; s++) {
      const i = Math.round(y) * WW + Math.round(x);
      if (inb(Math.round(x), Math.round(y)) && replace(tile[i])) tile[i] = t;
      x += rng.int(-1, 1); y += rng.int(-1, 1);
    }
  }
  function ores() {
    const sl = wd.surfaceLine, rock = wd.rockLine;
    const natural = t => t === T.STONE || t === T.DIRT || t === T.SAND || t === T.SANDSTONE || t === T.MUD || t === T.ICE || t === T.SNOW;
    const spec = [[T.ORE1, 340, sl - 20, rock + 70, 7], [T.ORE2, 280, sl + 20, rock + 150, 7], [T.ORE3, 220, rock, hellLine - 50, 6], [T.ORE4, 160, rock + 70, hellLine - 15, 6]];
    for (const [t, n, y0, y1, sz] of spec) for (let k = 0; k < n; k++) blob(rng.int(20, WW - 20), rng.int(y0, y1), t, rng.int(sz, sz * 2), natural);
    // stone clumps at the surface for the classic look
    for (let k = 0; k < 160; k++) { const x = rng.int(100, WW - 100); blob(x, surf[x] + rng.int(2, 12), T.STONE, rng.int(8, 22), t => t === T.DIRT); }
  }

  function underworld() {
    for (let x = 0; x < WW; x++) {
      const ceil = hellLine + 10 + Math.round(nz.fbm1(x * 0.02 + 70, 3) * 7);
      const floor = H - 26 + Math.round(nz.fbm1(x * 0.015 + 50, 3) * 10);
      for (let y = hellLine - 12; y < H; y++) {
        const i = y * WW + x;
        wall[i] = 0;
        if (y < hellLine) { if (tile[i] && nz.fbm2(x * 0.1, y * 0.1, 1) > (hellLine - y) / 12 - 0.4) tile[i] = T.ASH; continue; }
        if (y < ceil || y > floor) tile[i] = T.ASH;
        else tile[i] = nz.fbm2(x * 0.03, y * 0.05 + 30, 3) > 0.42 ? T.ASH : T.AIR;
        if (!tile[i] && y >= H - 30) { wd.liq[i] = 255; wd.ltype[i] = 1; }
      }
    }
    for (let k = 0; k < 110; k++) blob(rng.int(10, WW - 10), rng.int(hellLine + 4, H - 4), T.ORE5, rng.int(6, 14), t => t === T.ASH);
    // ruined emberbrick houses
    let placed = 0, forges = 0;
    for (let k = 0; k < 60 && placed < 8; k++) {
      const x0 = rng.int(40, WW - 60), w = rng.int(12, 16), h = 8;
      let fy = floorAt(x0 + (w >> 1), hellLine + 5, H - 20);
      if (fy < 0 || fy >= H - 32) continue;
      const y1 = fy, y0 = y1 - h + 1;
      for (let x = x0; x < x0 + w; x++) for (let y = y0; y <= y1 + 1; y++) {
        const edge = x === x0 || x === x0 + w - 1 || y === y0 || y === y1 + 1;
        if (edge) { if (!(y > y1 - 3 && y <= y1 && (x === x0 || x === x0 + w - 1)) && rng.chance(0.92)) set(x, y, T.EMBER); else set(x, y, T.AIR); }
        else { set(x, y, T.AIR); setW(x, y, W.EMBER); wd.liq[y * WW + x] = 0; }
      }
      if (forges < 3) { placeFurn(wd, x0 + 2, y1 - 1, T.FORGE); forges++; }
      chestAt(x0 + w - 4, y1 - 1, 'hell');
      placed++;
    }
  }

  function blight() {
    const [b0, b1] = wd.blightX, rock = wd.rockLine;
    for (let x = b0; x <= b1; x++) for (let y = surf[x]; y < rock + 40; y++) {
      const i = y * WW + x;
      const edge = Math.min(x - b0, b1 - x);
      if (edge < 8 && nz.fbm2(x * 0.2, y * 0.2, 1) > edge / 8 - 0.5) continue;
      if (tile[i] === T.STONE || (tile[i] === T.DIRT && rng.chance(0.25))) tile[i] = T.BLIGHT;
      if (wall[i]) wall[i] = W.BLIGHT;
    }
    const n = Math.max(3, Math.floor((b1 - b0) / 30));
    let orbs = 0;
    for (let c = 0; c < n; c++) {
      let x = b0 + 12 + ((b1 - b0 - 24) * (c + 0.5)) / n, y = surf[Math.round(x)] - 3;
      const depth = rng.int(55, 85);
      for (let s = 0; s < depth; s++) {
        const r = 2 + nz.n1(s * 0.2 + c * 10) * 0.8;
        for (let yy = Math.floor(y - r - 3); yy <= y + r + 3; yy++) for (let xx = Math.floor(x - r - 3); xx <= x + r + 3; xx++) {
          if (!inb(xx, yy)) continue;
          const d = Math.hypot(xx - x, yy - y), i = yy * WW + xx;
          if (d <= r) { tile[i] = T.AIR; if (yy > surf[xx] + 2) wall[i] = W.BLIGHT; }
          else if (d <= r + 3 && tile[i]) tile[i] = T.BLIGHT;
        }
        x += rng.range(-0.6, 0.6); y += 1;
      }
      // orb pocket to the side
      const px = Math.round(x + (rng.chance(0.5) ? 7 : -7)), py = Math.round(y - 3);
      for (let yy = py - 4; yy <= py + 4; yy++) for (let xx = px - 5; xx <= px + 5; xx++) {
        if (!inb(xx, yy)) continue;
        const d = Math.hypot((xx - px) * 0.9, yy - py), i = yy * WW + xx;
        if (d <= 3.5) { tile[i] = T.AIR; wall[i] = W.BLIGHT; } else if (d <= 5.5) tile[i] = T.BLIGHT;
      }
      for (let s = 0; s < 8; s++) { const tx = Math.round(x + (px - x) * s / 8); for (let yy = py - 1; yy <= py + 1; yy++) { set(tx, yy, T.AIR); setW(tx, yy, W.BLIGHT); } }
      placeFurn(wd, px - 1, py - 1, T.ORB);
      orbs++;
    }
    wd.orbCount = orbs;
    // demonite veins through the deeper blightstone
    const veins = Math.max(30, Math.floor((b1 - b0) * 0.8));
    for (let k = 0; k < veins; k++) blob(rng.int(b0 + 6, b1 - 6), rng.int(wd.surfaceLine + 12, rock + 36), T.ORE6, rng.int(6, 12), t => t === T.BLIGHT);
  }

  function crypt() {
    const cx = wd.cryptX, sy = surf[cx];
    const towardCenter = cx < WW / 2 ? 1 : -1;
    const rooms = [], path = [];
    let x = cx, y = sy + 2;
    for (let s = 0; s < 30; s++) path.push([x, y + s, 'v']);
    y += 30;
    let dir = rng.chance(0.5) ? 1 : -1;
    for (let seg = 0; seg < 12; seg++) {
      if (seg % 2 === 0) {
        const len = rng.int(18, 36);
        for (let s = 0; s < len; s++) { x += dir; path.push([x, y, 'h']); }
        if (x < cx - 90 || x > cx + 90) dir = -dir;
        if (rng.chance(0.3)) dir = -dir;
      } else {
        const len = rng.int(14, 24);
        for (let s = 0; s < len; s++) { y++; path.push([x, y, 'v']); }
      }
      if (rng.chance(0.7)) rooms.push([x, y]);
    }
    rooms.push([x, y]);
    const mark = (x0, y0, x1, y1) => { for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) if (inb(xx, yy)) cryptMask[yy * WW + xx] = 1; };
    for (const [px, py] of path) mark(px - 6, py - 6, px + 6, py + 6);
    for (const [rx, ry] of rooms) mark(rx - 11, ry - 9, rx + 11, ry + 5);
    const bx0 = cx - 9, bx1 = cx + 9, by0 = sy - 13;
    mark(bx0, by0, bx1, sy + 2);
    for (let i = 0; i < WW * H; i++) if (cryptMask[i]) { tile[i] = T.CRYPT; wall[i] = W.CRYPT; wd.liq[i] = 0; }
    // hollow interiors
    const hollow = (x0, y0, x1, y1) => { for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) if (inb(xx, yy)) tile[yy * WW + xx] = T.AIR; };
    for (const [px, py, k] of path) { if (k === 'h') hollow(px - 1, py - 2, px + 1, py + 2); else hollow(px - 2, py - 1, px + 2, py + 1); }
    for (const [rx, ry] of rooms) hollow(rx - 8, ry - 6, rx + 8, ry + 2);
    hollow(bx0 + 2, by0 + 2, bx1 - 2, sy - 1);
    // platforms across vertical shafts
    for (const [px, py, k] of path) if (k === 'v' && py % 6 === 0 && py > sy + 2) for (let xx = px - 2; xx <= px + 2; xx++) if (get(xx, py) === T.AIR) set(xx, py, T.PLATFORM);
    // shaft opening in the tower floor
    hollow(cx - 2, sy - 1, cx + 2, sy + 3);
    // entrance door facing the world center
    const dx = towardCenter > 0 ? bx1 : bx0;
    for (let yy = sy - 3; yy <= sy - 1; yy++) { set(dx, yy, T.AIR); set(dx - towardCenter, yy, T.AIR); }
    for (let xx = Math.min(dx, dx + towardCenter * 6); xx <= Math.max(dx, dx + towardCenter * 6); xx++) {
      if (xx === dx) continue;
      for (let yy = sy - 6; yy < sy; yy++) if (!cryptMask[yy * WW + xx]) { set(xx, yy, T.AIR); setW(xx, yy, 0); }
      for (let yy = sy; yy < sy + 3; yy++) if (!solid(xx, yy)) set(xx, yy, T.DIRT);
    }
    placeFurn(wd, dx, sy - 3, T.CRYPT_DOOR);
    placeFurn(wd, dx + towardCenter * 4, sy - 2, T.BELL);
    wd.cryptY = sy; wd.cryptDoor = [dx, sy - 3];
    // loot + lights
    let chests = 0;
    for (const [rx, ry] of rooms) {
      const fy = ry + 2;
      if (chests < 8 && get(rx - 4, fy) === T.AIR && get(rx - 3, fy) === T.AIR) { chestAt(rx - 4, fy - 1, 'crypt'); chests++; }
      if (get(rx + 3, fy) === T.AIR && get(rx + 4, fy) === T.AIR && get(rx + 3, fy - 1) === T.AIR) placeFurn(wd, rx + 3, fy - 1, T.POT);
      set(rx, ry - 5, T.TORCH);
    }
    wd.cryptBox = [cx - 110, sy - 14, cx + 110, y + 20];
  }

  function cabins() {
    const sl = wd.surfaceLine;
    let n = 0;
    for (let k = 0; k < 200 && n < 16; k++) {
      const x0 = rng.int(60, WW - 80), y0 = rng.int(sl + 15, hellLine - 60);
      const w = rng.int(11, 15), h = 7;
      let bad = false;
      for (let y = y0 - 1; y <= y0 + h + 1 && !bad; y++) for (let x = x0 - 1; x <= x0 + w + 1; x++) if (cryptMask[y * WW + x]) { bad = true; break; }
      if (bad || (x0 > wd.blightX[0] - 20 && x0 < wd.blightX[1] + 5)) continue;
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) {
        const edge = y === y0 || y === y0 + h - 1 || x === x0 || x === x0 + w - 1;
        if (edge) set(x, y, T.WOOD); else { set(x, y, T.AIR); wd.liq[y * WW + x] = 0; }
        setW(x, y, W.WOOD);
      }
      for (let y = y0 + h - 4; y < y0 + h - 1; y++) { set(x0, y, T.AIR); set(x0 + w - 1, y, T.AIR); }
      const fy = y0 + h - 2;
      chestAt(x0 + 2, fy - 1, y0 > wd.rockLine ? 'cavern' : 'surface');
      set(x0 + (w >> 1), y0 + 2, T.TORCH);
      if (rng.chance(0.5)) placeFurn(wd, x0 + w - 5, fy - 1, T.TABLE);
      n++;
    }
  }

  function decor() {
    const sl = wd.surfaceLine;
    const spot2 = (x, y) => get(x, y) === T.AIR && get(x + 1, y) === T.AIR && get(x, y - 1) === T.AIR && get(x + 1, y - 1) === T.AIR && solid(x, y + 1) && solid(x + 1, y + 1) && !wd.liq[y * WW + x];
    let pots = 0, crystals = 0;
    for (let k = 0; k < 40000 && (pots < 650 || crystals < 45); k++) {
      const x = rng.int(10, WW - 12), y = rng.int(sl, H - 6);
      if (!spot2(x, y) || cryptMask[y * WW + x]) continue;
      if (crystals < 45 && y > sl + 30 && y < hellLine && rng.chance(0.07)) { placeFurn(wd, x, y - 1, T.CRYSTAL); crystals++; }
      else if (pots < 650) { placeFurn(wd, x, y - 1, T.POT, rng.int(0, 1)); pots++; }
    }
  }

  function islands() {
    for (const cxf of [0.3, 0.7]) {
      const cx = Math.round(WW * cxf + rng.int(-40, 40)), cy = rng.int(55, 75), hw = 22;
      for (let dx = -hw - 4; dx <= hw + 4; dx++) {
        const f = 1 - (dx / (hw + 4)) ** 2;
        const th = Math.max(1, Math.round(f * 13));
        const top = cy - Math.round(f * 2 + nz.n1(dx * 0.3) * 1);
        for (let y = top; y < top + th; y++) {
          const x = cx + dx;
          if (Math.abs(dx) > hw || y > top + th - 3) set(x, y, T.CLOUD);
          else { set(x, y, T.DIRT); if (y > top + 2) setW(x, y, W.DIRT); }
        }
      }
      // house
      const x0 = cx - 5, w = 11, h = 7, fy = cy - 3;
      let base = fy;
      while (base < cy + 5 && !solid(cx, base + 1)) base++;
      const y0 = base - h + 1;
      for (let y = y0; y <= base; y++) for (let x = x0; x < x0 + w; x++) {
        const edge = y === y0 || x === x0 || x === x0 + w - 1;
        if (edge && !(y > base - 3 && (x === x0 || x === x0 + w - 1))) set(x, y, T.WOOD); else set(x, y, T.AIR);
        setW(x, y, W.WOOD);
      }
      for (let x = x0; x < x0 + w; x++) if (!solid(x, base + 1)) set(x, base + 1, T.WOOD);
      chestAt(x0 + 2, base - 1, 'sky');
      set(x0 + 5, y0 + 2, T.TORCH);
    }
  }

  function fillBasin(x, y, lava, limit) {
    const seen = new Set(), stack = [[x, y]], level = y - (lava ? 1 : 2);
    while (stack.length) {
      const [cx, cy] = stack.pop();
      const k = cy * WW + cx;
      if (seen.has(k) || !inb(cx, cy) || cy < level || solid(cx, cy) || tile[k] || cryptMask[k]) continue;
      seen.add(k);
      if (seen.size > limit) return false;
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }
    for (const k of seen) { wd.liq[k] = 255; wd.ltype[k] = lava ? 1 : 0; }
    return true;
  }
  function oceans() {
    const sea = 194;
    for (let x = 0; x < WW; x++) {
      if (zone[x] !== Z.OCEAN && Math.min(x, WW - 1 - x) > 110) continue;
      for (let y = sea; y < surf[x]; y++) { const i = y * WW + x; if (!tile[i]) { wd.liq[i] = 255; wd.ltype[i] = 0; } }
    }
    const sl = wd.surfaceLine;
    for (let k = 0; k < 400; k++) {
      const x = rng.int(20, WW - 20), y = rng.int(sl + 5, hellLine - 30);
      const fy = floorAt(x, y, y + 30);
      if (fy > 0) fillBasin(x, fy, y > wd.rockLine + 120 && rng.chance(0.5), 260);
    }
  }

  function grow() {
    const sl = wd.surfaceLine, [b0, b1] = wd.blightX;
    for (let x = 0; x < WW; x++) for (let y = 1; y < H - 1; y++) {
      const i = y * WW + x, t = tile[i];
      if (t !== T.DIRT && t !== T.MUD) continue;
      const exposed = !tile[i - WW] || !tile[i + WW] || !tile[i - 1] || !tile[i + 1];
      if (!exposed) continue;
      if (t === T.MUD) { if (zone[x] === Z.JUNGLE && (y < sl || rng.chance(0.85))) tile[i] = T.JGRASS; continue; }
      if (y < sl) tile[i] = x >= b0 && x <= b1 ? T.BGRASS : T.GRASS;
    }
    // plants, glowcaps, vines
    for (let x = 1; x < WW - 1; x++) for (let y = 2; y < H - 12; y++) {
      const i = y * WW + x, t = tile[i];
      if (t === T.GRASS || t === T.JGRASS || t === T.BGRASS) {
        if (!tile[i - WW] && !wd.liq[i - WW]) {
          const r = rng.next();
          if (r < 0.03 && t !== T.BGRASS) tile[i - WW] = T.GLOWCAP;
          else if (r < 0.5) { tile[i - WW] = T.PLANT; wd.meta[i - WW] = rng.int(0, 5); }
        }
        if (!tile[i + WW] && rng.chance(t === T.JGRASS ? 0.5 : 0.25)) {
          const len = rng.int(2, t === T.JGRASS ? 9 : 5);
          for (let k = 1; k <= len && !tile[i + WW * k]; k++) tile[i + WW * k] = T.VINE;
        }
      } else if (t === T.STONE && y > wd.rockLine && !tile[i - WW] && rng.chance(0.012)) tile[i - WW] = T.GLOWCAP;
    }
    // trees + cacti
    let x = 20;
    while (x < WW - 20) {
      const z = zone[x];
      let y = 0;
      while (y < H - 1 && !solid(x, y)) y++;
      const g = get(x, y);
      const kind = g === T.GRASS ? 0 : g === T.SNOW ? 1 : g === T.JGRASS ? 2 : g === T.BGRASS ? 3 : -1;
      if (z === Z.DESERT && g === T.SAND && rng.chance(0.35)) {
        const h = rng.int(3, 6);
        for (let k = 1; k <= h; k++) { const m = (k === h ? 4 : 0) | (k > 1 && k < h && rng.chance(0.3) ? (rng.chance(0.5) ? 1 : 2) : 0); set(x, y - k, T.CACTUS); wd.meta[(y - k) * WW + x] = m; }
        x += rng.int(8, 18);
        continue;
      }
      if (kind >= 0 && !wd.liq[(y - 1) * WW + x] && Math.abs(x - wd.cryptX) > 14) {
        const h = rng.int(kind === 2 ? 12 : 8, kind === 2 ? 22 : 17);
        let ok = true;
        for (let k = 1; k <= h + 3 && ok; k++) for (let dx = -1; dx <= 1; dx++) { const tt = get(x + dx, y - k); if (tt && tt !== T.PLANT && tt !== T.VINE) ok = false; }
        if (ok && solid(x - 1, y) && solid(x + 1, y)) {
          for (let k = 1; k <= h; k++) {
            let m = kind << 4;
            if (k === 1) m |= 8;
            if (k === h) m |= 4;
            else if (k > 3 && k < h - 2 && rng.chance(0.18)) m |= rng.chance(0.5) ? 1 : 2;
            set(x, y - k, T.TREE);
            wd.meta[(y - k) * WW + x] = m;
          }
          x += rng.int(kind === 2 ? 3 : 4, kind === 1 ? 10 : 9);
          continue;
        }
      }
      x += 1;
    }
  }

  function spawn() {
    const x = 800;
    let y = 0;
    while (y < H && !solid(x, y)) y++;
    wd.spawnX = x; wd.spawnY = y;
    computeSkyTop(wd);
  }

  const passes = [
    ['Laying out biomes', zones], ['Generating terrain', terrain], ['Shaping biomes', biomes], ['Carving caves', caves],
    ['Seeding ores', ores], ['Igniting the underworld', underworld], ['Spreading the Blight', blight], ['Raising the Old Crypt', crypt],
    ['Building cabins', cabins], ['Placing pots and life crystals', decor], ['Lifting floating islands', islands],
    ['Filling oceans and pools', oceans], ['Growing grass and trees', grow], ['Choosing a spawn point', spawn],
  ];
  for (let k = 0; k < passes.length; k++) {
    progress(passes[k][0], k / passes.length);
    await wait();
    passes[k][1]();
  }
  progress('Done', 1);
  wd.dirty.clear();
  wd.mapDirty.length = 0;
  return wd;
}
