import { CS, CH } from './worldgen.js';
import * as B from './blocks.js';
import { TINT_TABLE } from './worldgen.js';

const PW = 18, LAY = PW * PW, PH = CH + 2;
const pb = new Uint8Array(LAY * PH), pl = new Uint8Array(LAY * PH);
const CAP = 150000;

class Buf {
  constructor() {
    this.pos = new Float32Array(CAP * 3); this.uv = new Float32Array(CAP * 2); this.shade = new Float32Array(CAP);
    this.light = new Float32Array(CAP * 2); this.tint = new Float32Array(CAP * 3); this.idx = new Uint32Array(CAP * 3);
    this.nv = 0; this.ni = 0;
  }
  reset() { this.nv = 0; this.ni = 0; }
  v(x, y, z, u, v, shade, sky, blk, tr, tg, tb) {
    const n = this.nv++;
    this.pos[n * 3] = x; this.pos[n * 3 + 1] = y; this.pos[n * 3 + 2] = z;
    this.uv[n * 2] = u; this.uv[n * 2 + 1] = v; this.shade[n] = shade;
    this.light[n * 2] = sky; this.light[n * 2 + 1] = blk; this.tint[n * 3] = tr; this.tint[n * 3 + 1] = tg; this.tint[n * 3 + 2] = tb;
  }
  quad(a, flip) {
    const i = this.ni;
    if (flip) { this.idx[i] = a + 1; this.idx[i + 1] = a + 2; this.idx[i + 2] = a + 3; this.idx[i + 3] = a + 1; this.idx[i + 4] = a + 3; this.idx[i + 5] = a; }
    else { this.idx[i] = a; this.idx[i + 1] = a + 1; this.idx[i + 2] = a + 2; this.idx[i + 3] = a; this.idx[i + 4] = a + 2; this.idx[i + 5] = a + 3; }
    this.ni += 6;
  }
  full() { return this.nv > CAP - 8; }
  finish() {
    if (!this.nv) return null;
    return { pos: this.pos.slice(0, this.nv * 3), uv: this.uv.slice(0, this.nv * 2), shade: this.shade.slice(0, this.nv),
      light: this.light.slice(0, this.nv * 2), tint: this.tint.slice(0, this.nv * 3), idx: this.idx.slice(0, this.ni), count: this.nv };
  }
}
const OPQ = new Buf(), WAT = new Buf();
const pbio = new Uint8Array(PW * PW);
const gGrass = new Float32Array(17 * 17 * 3), gFol = new Float32Array(17 * 17 * 3);
function buildTintGrids(world, chunk) {
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
    const nc = (dx || dz) ? world.getChunk(chunk.cx + dx, chunk.cz + dz) : chunk;
    const x0 = dx < 0 ? 15 : 0, x1 = dx === 0 ? 15 : x0, z0 = dz < 0 ? 15 : 0, z1 = dz === 0 ? 15 : z0;
    for (let z = z0; z <= z1; z++) for (let x = x0; x <= x1; x++) {
      const px = dx === 0 ? x + 1 : (dx < 0 ? 0 : 17), pz = dz === 0 ? z + 1 : (dz < 0 ? 0 : 17);
      pbio[px + pz * PW] = nc ? nc.biome[x + z * 16] : chunk.biome[0];
    }
  }
  // vertex (vx,vz) averages columns (vx-1,vz-1),(vx,vz-1),(vx-1,vz),(vx,vz) -> padded idx +1
  for (let vz = 0; vz <= 16; vz++) for (let vx = 0; vx <= 16; vx++) {
    let gr = 0, gg = 0, gb = 0, fr = 0, fg = 0, fb = 0;
    for (let k = 0; k < 4; k++) {
      const cx = vx - 1 + (k & 1), cz = vz - 1 + (k >> 1), b = pbio[(cx + 1) + (cz + 1) * PW];
      const g = TINT_TABLE[1 + b], f = TINT_TABLE[9 + b];
      gr += g[0]; gg += g[1]; gb += g[2]; fr += f[0]; fg += f[1]; fb += f[2];
    }
    const o = (vx + vz * 17) * 3;
    gGrass[o] = gr / 4; gGrass[o + 1] = gg / 4; gGrass[o + 2] = gb / 4; gFol[o] = fr / 4; gFol[o + 1] = fg / 4; gFol[o + 2] = fb / 4;
  }
}
const WHITE = [1, 1, 1];
function tintV(kind, vx, vz, out) {
  if (!kind) { out[0] = out[1] = out[2] = 1; return; }
  const g = kind === 1 ? gGrass : gFol, o = (Math.max(0, Math.min(16, Math.round(vx))) + Math.max(0, Math.min(16, Math.round(vz))) * 17) * 3;
  out[0] = g[o]; out[1] = g[o + 1]; out[2] = g[o + 2];
}
const TV = [1, 1, 1];

function fillPadded(world, chunk) {
  for (let dz = -1; dz <= 1; dz++) for (let dx = -1; dx <= 1; dx++) {
    const nc = (dx || dz) ? world.getChunk(chunk.cx + dx, chunk.cz + dz) : chunk;
    const x0 = dx < 0 ? 15 : 0, x1 = dx === 0 ? 15 : x0, z0 = dz < 0 ? 15 : 0, z1 = dz === 0 ? 15 : z0;
    for (let y = 0; y < CH; y++) for (let z = z0; z <= z1; z++) {
      const pz = dz === 0 ? z + 1 : (dz < 0 ? 0 : 17);
      const rowBase = pz * PW + (y + 1) * LAY;
      if (!nc) { for (let x = x0; x <= x1; x++) { const px = dx === 0 ? x + 1 : (dx < 0 ? 0 : 17); pb[px + rowBase] = 0; pl[px + rowBase] = 0; } continue; }
      const so = y * 256 + z * 16;
      if (dx === 0) { pb.set(nc.blocks.subarray(so, so + 16), 1 + rowBase); pl.set(nc.light.subarray(so, so + 16), 1 + rowBase); }
      else { const px = dx < 0 ? 0 : 17; pb[px + rowBase] = nc.blocks[so + x0]; pl[px + rowBase] = nc.light[so + x0]; }
    }
  }
  pb.fill(1, 0, LAY); pl.fill(0, 0, LAY);
  pb.fill(0, (CH + 1) * LAY, PH * LAY); pl.fill(0xF0, (CH + 1) * LAY, PH * LAY);
}

// faces: [axis, sign]
const FACES = [[0, 1], [0, -1], [1, 1], [1, -1], [2, 1], [2, -1]];
const STR = [1, LAY, PW]; // stride per axis (x, y, z)
const FSHADE = [0.82, 0.82, 1.0, 0.5, 0.68, 0.68];
const AO_T = [0.5, 0.7, 0.85, 1.0];
const CORNERS = [[0, 0], [1, 0], [1, 1], [0, 1]];
const TW = 1 / 16, EPS = 0.0004;

export function meshChunk(world, chunk) {
  fillPadded(world, chunk); buildTintGrids(world, chunk);
  OPQ.reset(); WAT.reset();
  const biome = chunk.biome;
  const P = [0, 0, 0];
  for (let y = 0; y < CH; y++) for (let z = 0; z < 16; z++) for (let x = 0; x < 16; x++) {
    const bi = (x + 1) + (z + 1) * PW + (y + 1) * LAY;
    const b = pb[bi]; if (!b) continue;
    if (OPQ.full()) break;
    const shape = B.SHAPE[b], def = B.BLOCKS[b], bio = biome[x + z * 16];
    P[0] = x; P[1] = y; P[2] = z;
    if (shape === 0) cubeBlock(bi, b, def, bio, P);
    else if (shape === 3) liquid(bi, b, def, P);
    else if (shape === 1) cross(bi, b, def, bio, P);
    else if (shape === 2) torch(bi, def, P);
    else if (shape === 4) cactus(bi, def, P);
    else if (shape === 5) slabBlock(bi, def, P);
    else if (shape === 6) stairBlock(bi, b, def, P);
  }
  return { opaque: OPQ.finish(), water: WAT.finish() };
}


function cubeBlock(bi, b, def, bio, P) {
  const cullSame = B.CULL_SAME[b];
  for (let f = 0; f < 6; f++) {
    const a = FACES[f][0], s = FACES[f][1];
    const dA = s * STR[a];
    const nb = pb[bi + dA];
    if (B.OPAQUE[nb] || (cullSame && nb === b)) continue;
    const bb = (a + 1) % 3, cc = (a + 2) % 3, dB = STR[bb], dC = STR[cc];
    const tile = f === 2 ? def.tiles.top : f === 3 ? def.tiles.bottom : def.tiles.side;
    const tk = f === 2 ? (def.tintTop || def.tintAll) : f === 3 ? def.tintAll : (def.tintSide || def.tintAll);
    const tu = (tile & 15) * TW, tv = (15 - (tile >> 4)) * TW;
    const base = OPQ.nv;
    const order = s > 0 ? CORNERS : [CORNERS[0], CORNERS[3], CORNERS[2], CORNERS[1]];
    const cen = pl[bi + dA];
    const cS = cen >> 4, cB = cen & 15;
    const aos = [0, 0, 0, 0];
    for (let k = 0; k < 4; k++) {
      const i = order[k][0], j = order[k][1];
      const sb = i ? dB : -dB, sc = j ? dC : -dC;
      const i1 = bi + dA + sb, i2 = bi + dA + sc, i3 = bi + dA + sb + sc;
      const o1 = B.OPAQUE[pb[i1]], o2 = B.OPAQUE[pb[i2]], o3 = (o1 && o2) ? 1 : B.OPAQUE[pb[i3]];
      const ao = (o1 && o2) ? 0 : 3 - (o1 + o2 + o3);
      const l1 = o1 ? cen : pl[i1], l2 = o2 ? cen : pl[i2], l3 = o3 ? cen : pl[i3];
      const sky = (cS + (l1 >> 4) + (l2 >> 4) + (l3 >> 4)) * 0.25 / 15;
      const blk = (cB + (l1 & 15) + (l2 & 15) + (l3 & 15)) * 0.25 / 15;
      aos[k] = ao;
      // uv
      let u, v;
      if (a === 0) { u = j; v = i; } else { u = i; v = j; }
      if (a === 1) { /* top/bottom */ }
      const px = P[0] + (a === 0 ? (s > 0 ? 1 : 0) : (a === 1 ? j : i));
      const py = P[1] + (a === 1 ? (s > 0 ? 1 : 0) : (a === 0 ? i : j));
      const pz = P[2] + (a === 2 ? (s > 0 ? 1 : 0) : (a === 1 ? i : j));
      tintV(tk, px, pz, TV);
      OPQ.v(px, py, pz, tu + (u * (1 - 2 * EPS) + EPS) * TW, tv + (v * (1 - 2 * EPS) + EPS) * TW, (f === 3 && !B.OPAQUE[b] ? 0.72 : FSHADE[f]) * AO_T[ao], sky, blk, TV[0], TV[1], TV[2]);
    }
    OPQ.quad(base, aos[0] + aos[2] < aos[1] + aos[3]);
  }
}

function liquid(bi, b, def, P) {
  const buf = b === B.WATER ? WAT : OPQ;
  const above = pb[bi + LAY];
  const topY = above === b ? 1 : 0.875;
  const tile = def.tiles.top, tu = (tile & 15) * TW, tv = (15 - (tile >> 4)) * TW;
  for (let f = 0; f < 6; f++) {
    const a = FACES[f][0], s = FACES[f][1];
    const nb = pb[bi + s * STR[a]];
    if (nb === b || B.OPAQUE[nb]) continue;
    if (f === 2 && above === b) continue;
    const lv = pl[bi + s * STR[a]];
    const sky = (lv >> 4) / 15, blk = (lv & 15) / 15;
    const base = buf.nv;
    const order = s > 0 ? CORNERS : [CORNERS[0], CORNERS[3], CORNERS[2], CORNERS[1]];
    for (let k = 0; k < 4; k++) {
      const i = order[k][0], j = order[k][1];
      const px = P[0] + (a === 0 ? (s > 0 ? 1 : 0) : (a === 1 ? j : i));
      let py = P[1] + (a === 1 ? (s > 0 ? topY : 0) : (a === 0 ? i : j));
      if (a !== 1 && (a === 0 ? i : j) === 1) py = P[1] + topY;
      const pz = P[2] + (a === 2 ? (s > 0 ? 1 : 0) : (a === 1 ? i : j));
      let u, v; if (a === 0) { u = j; v = i; } else { u = i; v = j; }
      buf.v(px, py, pz, tu + (u * (1 - 2 * EPS) + EPS) * TW, tv + (v * (1 - 2 * EPS) + EPS) * TW, FSHADE[f], sky, blk, 1, 1, 1);
    }
    buf.quad(base, false);
  }
}

function cross(bi, b, def, bio, P) {
  const lv = pl[bi], sky = (lv >> 4) / 15, blk = (lv & 15) / 15;
  const tile = def.tiles.top, tu = (tile & 15) * TW, tv = (15 - (tile >> 4)) * TW;
  const wx = P[0], wz = P[2];
  const ox = (((wx * 7 + wz * 13 + P[1]) % 5) - 2) * 0.04, oz = (((wx * 11 + wz * 5) % 5) - 2) * 0.04;
  const planes = [[0.1, 0.1, 0.9, 0.9], [0.9, 0.1, 0.1, 0.9]];
  for (const pl_ of planes) {
    for (let side = 0; side < 2; side++) {
      const base = OPQ.nv;
      const x0 = P[0] + pl_[0] + ox, z0 = P[2] + pl_[1] + oz, x1 = P[0] + pl_[2] + ox, z1 = P[2] + pl_[3] + oz;
      const y0 = P[1], y1 = P[1] + 1;
      const pts = side === 0 ? [[x0, y0, z0, 0, 0], [x1, y0, z1, 1, 0], [x1, y1, z1, 1, 1], [x0, y1, z0, 0, 1]]
        : [[x1, y0, z1, 0, 0], [x0, y0, z0, 1, 0], [x0, y1, z0, 1, 1], [x1, y1, z1, 0, 1]];
      for (const p of pts) { tintV(def.tintAll, p[0] < P[0] + 0.5 ? P[0] : P[0] + 1, p[2] < P[2] + 0.5 ? P[2] : P[2] + 1, TV); OPQ.v(p[0], p[1], p[2], tu + (p[3] * (1 - 2 * EPS) + EPS) * TW, tv + (p[4] * (1 - 2 * EPS) + EPS) * TW, 1, sky, blk, TV[0], TV[1], TV[2]); }
      OPQ.quad(base, false);
    }
  }
}

// axis-aligned box with per-face uv rectangles (used by torch/cactus)
function box(bi, P, x0, y0, z0, x1, y1, z1, tileSide, tileTop, uvSide, uvTop, sky, blk, skipBottom, checkNb) {
  for (let f = 0; f < 6; f++) {
    if (f === 3 && skipBottom) continue;
    const a = FACES[f][0], s = FACES[f][1];
    if (checkNb && B.OPAQUE[pb[bi + s * STR[a]]] && ((s > 0 && (a === 1 ? y1 : a === 0 ? x1 : z1) === 1) || (s < 0 && (a === 1 ? y0 : a === 0 ? x0 : z0) === 0))) continue;
    const tile = (f === 2 || f === 3) ? tileTop : tileSide, rect = (f === 2 || f === 3) ? uvTop : uvSide;
    const tu = (tile & 15) * TW, tv = (15 - (tile >> 4)) * TW;
    const base = OPQ.nv;
    const order = s > 0 ? CORNERS : [CORNERS[0], CORNERS[3], CORNERS[2], CORNERS[1]];
    const mn = [x0, y0, z0], mx = [x1, y1, z1];
    for (let k = 0; k < 4; k++) {
      const i = order[k][0], j = order[k][1];
      const p = [0, 0, 0];
      const bb = (a + 1) % 3, cc = (a + 2) % 3;
      p[a] = s > 0 ? mx[a] : mn[a]; p[bb] = i ? mx[bb] : mn[bb]; p[cc] = j ? mx[cc] : mn[cc];
      let u, v; if (a === 0) { u = j; v = i; } else { u = i; v = j; }
      OPQ.v(P[0] + p[0], P[1] + p[1], P[2] + p[2], tu + (rect[0] + 0.04 + (rect[2] - rect[0] - 0.08) * u) * TW / 16, tv + (rect[1] + 0.04 + (rect[3] - rect[1] - 0.08) * v) * TW / 16, f === 2 ? 1 : f === 3 ? 0.55 : FSHADE[f] * 0.95, sky, blk, 1, 1, 1);
    }
    OPQ.quad(base, false);
  }
}
function torch(bi, def, P) {
  const tile = def.tiles.top;
  box(bi, P, 7 / 16, 0, 7 / 16, 9 / 16, 13 / 16, 9 / 16, tile, tile, [7, 0, 9, 13], [7, 12, 9, 13], 0.0, 1.0, false, false);
}
function slabBlock(bi, def, P) {
  const lv = pl[bi], la = pl[bi + LAY], sky = Math.max(lv >> 4, la >> 4) / 15, blk = Math.max(lv & 15, la & 15) / 15;
  box(bi, P, 0, 0, 0, 1, 0.5, 1, def.tiles.side, def.tiles.top, [0, 0, 16, 8], [0, 0, 16, 16], sky, blk, false, true);
}
function stairBlock(bi, b, def, P) {
  const f = (b - B.STAIR_BASE) & 3;
  const lv = pl[bi], la = pl[bi + LAY], sky = Math.max(lv >> 4, la >> 4) / 15, blk = Math.max(lv & 15, la & 15) / 15;
  box(bi, P, 0, 0, 0, 1, 0.5, 1, def.tiles.side, def.tiles.top, [0, 0, 16, 8], [0, 0, 16, 16], sky, blk, false, true);
  let x0 = 0, x1 = 1, z0 = 0, z1 = 1;
  if (f === 0) z0 = 0.5; else if (f === 1) z1 = 0.5; else if (f === 2) x0 = 0.5; else x1 = 0.5;
  box(bi, P, x0, 0.5, z0, x1, 1, z1, def.tiles.side, def.tiles.top, [0, 8, 16, 16], [0, 0, 16, 16], sky, blk, false, true);
}
function cactus(bi, def, P) {
  const lv = pl[bi], sky = (lv >> 4) / 15, blk = (lv & 15) / 15;
  const side = def.tiles.side, top = def.tiles.top;
  const above = pb[bi + LAY];
  box(bi, P, 1 / 16, 0, 1 / 16, 15 / 16, 1, 15 / 16, side, top, [0, 0, 16, 16], [0, 0, 16, 16], Math.max(sky, (pl[bi + LAY] >> 4) / 15), blk, above === B.CACTUS, false);
}
