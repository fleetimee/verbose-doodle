// RGB light propagation over the visible region (+ margin). Multi-directional sweeps
// approximate a flood fill cheaply and produce smooth falloff.
import { CFG } from './config.js';
import { SOLID, EMIT } from './tiles.js';

const DEC_AIR = 0.87, DEC_SOLID = 0.6, DEC_WATER = 0.9;

export function computeLighting(G, vx0, vy0, vx1, vy1) {
  const wd = G.world, M = CFG.lightMargin;
  const x0 = Math.max(0, vx0 - M), y0 = Math.max(0, vy0 - M);
  const x1 = Math.min(wd.w - 1, vx1 + M), y1 = Math.min(wd.h - 1, vy1 + M);
  const w = x1 - x0 + 1, h = y1 - y0 + 1, n = w * h;
  let L = G.light;
  if (!L || L.cap < n) {
    L = G.light = { cap: n * 1.3 | 0, r: null, g: null, b: null, d: null };
    L.r = new Float32Array(L.cap); L.g = new Float32Array(L.cap); L.b = new Float32Array(L.cap); L.d = new Float32Array(L.cap);
  }
  L.x0 = x0; L.y0 = y0; L.w = w; L.h = h;
  const R = L.r, Gc = L.g, B = L.b, D = L.d;
  const sky = G.sky.light, W = wd.w, hell = wd.hellLine;
  const tile = wd.tile, liq = wd.liq, ltype = wd.ltype, skyTop = wd.skyTop;
  for (let y = y0; y < y0 + h; y++) {
    const row = (y - y0) * w;
    for (let x = x0; x < x0 + w; x++) {
      const k = row + x - x0, i = y * W + x, t = tile[i];
      let r = 0, g = 0, b = 0;
      if (y < skyTop[x] && y < wd.hellLine && liq[i] < 60) { r = sky[0]; g = sky[1]; b = sky[2]; }
      const e = EMIT[t];
      if (e) { if (e[0] > r) r = e[0]; if (e[1] > g) g = e[1]; if (e[2] > b) b = e[2]; }
      if (liq[i] > 20 && ltype[i] === 1) { if (r < 1) r = 1; if (g < 0.55) g = 0.55; if (b < 0.2) b = 0.2; }
      if (y >= hell) { if (r < 0.42) r = 0.42; if (g < 0.17) g = 0.17; if (b < 0.1) b = 0.1; }
      R[k] = r; Gc[k] = g; B[k] = b;
      D[k] = SOLID[t] ? DEC_SOLID : (liq[i] > 60 && !ltype[i] ? DEC_WATER : DEC_AIR);
    }
  }
  // dynamic lights
  for (const l of G.lights) {
    const lx = Math.floor(l.x / 16) - x0, ly = Math.floor(l.y / 16) - y0;
    if (lx < 0 || ly < 0 || lx >= w || ly >= h) continue;
    const k = ly * w + lx;
    if (l.r > R[k]) R[k] = l.r; if (l.g > Gc[k]) Gc[k] = l.g; if (l.b > B[k]) B[k] = l.b;
  }
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < h; y++) {
      const row = y * w;
      for (let x = 1; x < w; x++) { const k = row + x, d = D[k]; let v = R[k - 1] * d; if (v > R[k]) R[k] = v; v = Gc[k - 1] * d; if (v > Gc[k]) Gc[k] = v; v = B[k - 1] * d; if (v > B[k]) B[k] = v; }
      for (let x = w - 2; x >= 0; x--) { const k = row + x, d = D[k]; let v = R[k + 1] * d; if (v > R[k]) R[k] = v; v = Gc[k + 1] * d; if (v > Gc[k]) Gc[k] = v; v = B[k + 1] * d; if (v > B[k]) B[k] = v; }
    }
    for (let x = 0; x < w; x++) {
      for (let y = 1; y < h; y++) { const k = y * w + x, d = D[k], p = k - w; let v = R[p] * d; if (v > R[k]) R[k] = v; v = Gc[p] * d; if (v > Gc[k]) Gc[k] = v; v = B[p] * d; if (v > B[k]) B[k] = v; }
      for (let y = h - 2; y >= 0; y--) { const k = y * w + x, d = D[k], p = k + w; let v = R[p] * d; if (v > R[k]) R[k] = v; v = Gc[p] * d; if (v > Gc[k]) Gc[k] = v; v = B[p] * d; if (v > B[k]) B[k] = v; }
    }
  }
  // fog of war: reveal lit tiles in view
  const ex = wd.explored;
  for (let y = Math.max(vy0, y0); y <= Math.min(vy1, y1); y++) for (let x = Math.max(vx0, x0); x <= Math.min(vx1, x1); x++) {
    const i = y * W + x;
    if (ex[i]) continue;
    const k = (y - y0) * w + x - x0;
    if (R[k] + Gc[k] + B[k] > 0.25) { ex[i] = 1; wd.mapDirty.push(i); }
  }
}

export function lightAt(G, tx, ty) {
  const L = G.light;
  if (!L) return 1;
  const x = tx - L.x0, y = ty - L.y0;
  if (x < 0 || y < 0 || x >= L.w || y >= L.h) return 0;
  const k = y * L.w + x;
  return Math.max(L.r[k], L.g[k], L.b[k]);
}
