// World storage (typed arrays) + tile mutation helpers.
import { CFG } from './config.js';
import { T, TILE, SOLID } from './tiles.js';

export function createWorld(w, h) {
  return {
    w, h, seed: 0, name: '',
    tile: new Uint16Array(w * h),
    wall: new Uint8Array(w * h),
    meta: new Uint8Array(w * h),
    liq: new Uint8Array(w * h),
    ltype: new Uint8Array(w * h),       // 0 water, 1 lava
    explored: new Uint8Array(w * h),
    skyTop: new Int16Array(w),         // first sunlight-blocking row per column
    surf: new Int16Array(w),           // generated surface height
    chests: new Map(),                 // "x,y" -> Array(40)
    dmg: new Map(),                    // tile index -> {d, t}
    wdmg: new Map(),
    dirty: new Set(),                  // chunk keys
    mapDirty: [],
    surfaceLine: 200, rockLine: 290, hellLine: 520,
    spawnX: 0, spawnY: 0,
    blightX: [0, 0], cryptX: 0, cryptY: 0,
  };
}

export const inB = (wd, x, y) => x >= 0 && y >= 0 && x < wd.w && y < wd.h;
export function tileAt(wd, x, y) { return inB(wd, x, y) ? wd.tile[y * wd.w + x] : T.STONE; }
export function wallAt(wd, x, y) { return inB(wd, x, y) ? wd.wall[y * wd.w + x] : 0; }
export function solidAt(wd, x, y) {
  if (x < 0 || y < 0 || x >= wd.w || y >= wd.h) return true;
  return SOLID[wd.tile[y * wd.w + x]] === 1;
}

export function markDirty(wd, x, y) {
  const C = CFG.CHUNK, cx = (x / C) | 0, cy = (y / C) | 0;
  wd.dirty.add(cy * 1000 + cx);
  const lx = x % C, ly = y % C;
  if (lx === 0) wd.dirty.add(cy * 1000 + cx - 1);
  if (lx === C - 1) wd.dirty.add(cy * 1000 + cx + 1);
  if (ly === 0) wd.dirty.add((cy - 1) * 1000 + cx);
  if (ly === C - 1) wd.dirty.add((cy + 1) * 1000 + cx);
}

export function updateSkyTop(wd, x) {
  if (x < 0 || x >= wd.w) return;
  let y = 0;
  while (y < wd.h && !SOLID[wd.tile[y * wd.w + x]]) y++;
  wd.skyTop[x] = y;
}
export function computeSkyTop(wd) { for (let x = 0; x < wd.w; x++) updateSkyTop(wd, x); }

export function setTile(wd, x, y, t, meta = 0) {
  if (!inB(wd, x, y)) return;
  const i = y * wd.w + x;
  const was = wd.tile[i];
  wd.tile[i] = t; wd.meta[i] = meta;
  if (SOLID[t]) wd.liq[i] = 0;
  wd.dmg.delete(i);
  markDirty(wd, x, y);
  if (SOLID[t] !== SOLID[was]) updateSkyTop(wd, x);
  if (wd.explored[i]) wd.mapDirty.push(i);
}
export function setWall(wd, x, y, wl) {
  if (!inB(wd, x, y)) return;
  const i = y * wd.w + x;
  wd.wall[i] = wl;
  wd.wdmg.delete(i);
  markDirty(wd, x, y);
  if (wd.explored[i]) wd.mapDirty.push(i);
}

// ---- furniture (multi-tile) helpers. meta = dx | dy<<2 | flip<<4
export function furnOrigin(wd, x, y) {
  const m = wd.meta[y * wd.w + x];
  return [x - (m & 3), y - ((m >> 2) & 3)];
}
export function canPlaceFurn(wd, ox, oy, t) {
  const f = TILE[t].furn;
  for (let dy = 0; dy < f.h; dy++) for (let dx = 0; dx < f.w; dx++) {
    const x = ox + dx, y = oy + dy;
    if (!inB(wd, x, y)) return false;
    const c = wd.tile[y * wd.w + x];
    if (c !== T.AIR && c !== T.PLANT && c !== T.VINE) return false;
  }
  if (t === T.DOOR) return solidAt(wd, ox, oy - 1) && solidAt(wd, ox, oy + f.h);
  if (t === T.TORCH) return true;
  for (let dx = 0; dx < f.w; dx++) {
    const b = tileAt(wd, ox + dx, oy + f.h);
    if (!SOLID[b] && b !== T.PLATFORM && !(TILE[b] && TILE[b].table)) return false;
  }
  return true;
}
export function placeFurn(wd, ox, oy, t, flip = 0) {
  const f = TILE[t].furn;
  for (let dy = 0; dy < f.h; dy++) for (let dx = 0; dx < f.w; dx++) setTile(wd, ox + dx, oy + dy, t, dx | (dy << 2) | (flip << 4));
  if (t === T.CHEST) wd.chests.set(ox + ',' + oy, new Array(40).fill(null));
}
export function removeFurn(wd, ox, oy) {
  const t = wd.tile[oy * wd.w + ox];
  const f = TILE[t] && TILE[t].furn;
  if (!f) { setTile(wd, ox, oy, T.AIR); return; }
  for (let dy = 0; dy < f.h; dy++) for (let dx = 0; dx < f.w; dx++) {
    const x = ox + dx, y = oy + dy;
    if (inB(wd, x, y) && wd.tile[y * wd.w + x] === t) setTile(wd, x, y, T.AIR);
  }
  if (t === T.CHEST) wd.chests.delete(ox + ',' + oy);
}

// liquid helpers
export function liquidAtPx(wd, px, py) {
  const x = Math.floor(px / 16), y = Math.floor(py / 16);
  if (!inB(wd, x, y)) return 0;
  const i = y * wd.w + x;
  return wd.liq[i] ? (wd.ltype[i] ? -wd.liq[i] : wd.liq[i]) : 0; // negative = lava
}
