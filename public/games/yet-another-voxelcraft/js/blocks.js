// Block + item registry, procedural texture atlas, icons, crafting recipes.
export const AIR = 0, STONE = 1, GRASS = 2, DIRT = 3, COBBLE = 4, SAND = 5, GRAVEL = 6, LOG = 7, LEAVES = 8,
  PLANKS = 9, WATER = 10, LAVA = 11, BEDROCK = 12, COAL_ORE = 13, IRON_ORE = 14, GOLD_ORE = 15, DIAMOND_ORE = 16,
  SNOW = 17, SANDSTONE = 18, GLASS = 19, CRAFTING = 20, FURNACE = 21, TORCH = 22, TALLGRASS = 23, FLOWER_R = 24,
  FLOWER_Y = 25, CACTUS = 26, BRICKS = 27, WOOL = 28, ICE = 29, SNOWGRASS = 30, CHEST = 31, TNT = 32,
  BIRCH_LOG = 33, SPRUCE_LOG = 34, STONE_BRICKS = 35, WOOL_RED = 36, WOOL_YELLOW = 37, SPRUCE_PLANKS = 38, BIRCH_PLANKS = 39,
  DEAD_BUSH = 40, WHEAT_1 = 47, WHEAT_2 = 48, WHEAT_3 = 49, WHEAT_4 = 50, FARMLAND = 51, STONE_SLAB = 41, COBBLE_SLAB = 42, PLANK_SLAB = 43, BRICK_SLAB = 44, SANDSTONE_SLAB = 45, STONEBRICK_SLAB = 46;

// Non-block items
export const STICK = 256, COAL = 257, IRON_INGOT = 258, GOLD_INGOT = 259, DIAMOND = 260, APPLE = 261,
  PORK_RAW = 262, PORK_COOKED = 263, BEEF_RAW = 264, BEEF_COOKED = 265, MUTTON_RAW = 266, MUTTON_COOKED = 267,
  ROTTEN_FLESH = 268, GUNPOWDER = 269, BONE = 270, ARROW = 271, STRING = 272, BOW = 273, SEEDS = 274, WHEAT = 275, BREAD = 276, FLINT_STEEL = 277, HOE_BASE = 320;
export const ARMOR_BASE = 300; // kind*2 + tier: helmet, chest, legs, boots; iron, diamond
export const ARMOR_KINDS = ['helmet', 'chestplate', 'leggings', 'boots'];
export const ARMOR_TIERS = [{ name: 'Iron', col: '#dcdcdc', dark: '#9a9a9a', pts: [2, 6, 5, 2], dur: [165, 240, 225, 195] }, { name: 'Diamond', col: '#4ee8e0', dark: '#1fa9b0', pts: [3, 8, 6, 3], dur: [363, 528, 495, 429] }];
export const armorId = (kind, tier) => ARMOR_BASE + kind * 2 + tier;
export const TOOL_BASE = 280; // pick(4) axe(4) shovel(4) sword(4)
export const TIERS = [
  { name: 'Wooden', tier: 1, speed: 2, dur: 60, mat: '#a58150', dark: '#6f5230', dmg: 0 },
  { name: 'Stone', tier: 2, speed: 4, dur: 132, mat: '#8d8d8d', dark: '#5d5d5d', dmg: 1 },
  { name: 'Iron', tier: 3, speed: 6, dur: 250, mat: '#dcdcdc', dark: '#9a9a9a', dmg: 2 },
  { name: 'Diamond', tier: 4, speed: 8, dur: 1560, mat: '#4ee8e0', dark: '#1fa9b0', dmg: 3 },
];
export const TOOL_KINDS = ['pickaxe', 'axe', 'shovel', 'sword'];
export const toolId = (kind, tier) => TOOL_BASE + kind * 4 + tier;

// ---------------------------------------------------------------- atlas
export const ATLAS = 256, TS = 16;
const tileNames = ['stone', 'dirt', 'grass_top', 'grass_side', 'cobble', 'sand', 'gravel', 'log_side', 'log_top',
  'leaves', 'planks', 'water', 'lava', 'bedrock', 'coal_ore', 'iron_ore', 'gold_ore', 'diamond_ore', 'snow',
  'snow_side', 'sandstone_top', 'sandstone_side', 'glass', 'crafting_top', 'crafting_side', 'furnace_side',
  'furnace_top', 'torch', 'tallgrass', 'flower_r', 'flower_y', 'cactus_side', 'cactus_top', 'bricks', 'wool',
  'ice', 'chest_top', 'chest_side', 'tnt_side', 'tnt_top', 'crafting_front', 'birch_side', 'birch_top', 'spruce_side',
  'spruce_top', 'stone_bricks', 'wool_red', 'wool_yellow', 'spruce_planks', 'birch_planks', 'deadbush', 'wheat_0', 'wheat_1', 'wheat_2', 'wheat_3', 'farmland'];
export const TILE = {};
tileNames.forEach((n, i) => (TILE[n] = i));
export const atlasData = new Uint8Array(ATLAS * ATLAS * 4);

function setPx(tile, x, y, r, g, b, a = 255) {
  const X = (tile & 15) * 16 + x, Yt = (tile >> 4) * 16 + y;
  const o = ((255 - Yt) * ATLAS + X) * 4;
  atlasData[o] = r; atlasData[o + 1] = g; atlasData[o + 2] = b; atlasData[o + 3] = a;
}
export function getPx(tile, x, y) {
  const X = (tile & 15) * 16 + x, Yt = (tile >> 4) * 16 + y;
  const o = ((255 - Yt) * ATLAS + X) * 4;
  return [atlasData[o], atlasData[o + 1], atlasData[o + 2], atlasData[o + 3]];
}
function rnd(x, y, s = 0) {
  let h = Math.imul(x + 1013, 374761393) ^ Math.imul(y + 7919, 668265263) ^ Math.imul(s + 31, 2147483647);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const cl = (v) => (v < 0 ? 0 : v > 255 ? 255 : v | 0);
function paint(name, f) {
  const t = TILE[name];
  for (let y = 0; y < 16; y++)
    for (let x = 0; x < 16; x++) {
      const c = f(x, y);
      if (c) setPx(t, x, y, cl(c[0]), cl(c[1]), cl(c[2]), c[3] === undefined ? 255 : c[3]);
      else setPx(t, x, y, 0, 0, 0, 0);
    }
}
const gray = (v, a = 255) => [v, v, v, a];
const mul = (c, k) => [c[0] * k, c[1] * k, c[2] * k, c[3]];
const TINT_A = 250; // alpha marker: pixel is biome-tinted

const stonePx = (x, y) => gray(128 + (rnd(x, y, 1) - 0.5) * 30 + (rnd(x >> 1, y >> 1, 2) - 0.5) * 26);
const dirtPx = (x, y) => {
  const n = rnd(x, y, 3), m = rnd(x >> 1, y >> 1, 4);
  const k = 0.85 + n * 0.25 + (m - 0.5) * 0.15;
  const c = [134 * k, 96 * k, 67 * k];
  if (rnd(x, y, 5) < 0.06) return [c[0] * 0.7, c[1] * 0.7, c[2] * 0.7];
  return c;
};
paint('stone', stonePx);
paint('dirt', dirtPx);
paint('grass_top', (x, y) => { const v = 190 + (rnd(x, y, 6) - 0.5) * 44; return [v, v, v, TINT_A]; });
paint('grass_side', (x, y) => {
  const h = 3 + (rnd(x, 0, 7) < 0.5 ? 1 : 0) + (rnd(x, 1, 7) < 0.25 ? 1 : 0);
  if (y < h) { const v = 190 + (rnd(x, y, 6) - 0.5) * 44; return [v, v, v, TINT_A]; }
  return dirtPx(x, y);
});
paint('snow', (x, y) => { const v = 244 + (rnd(x, y, 8) - 0.5) * 10; return [v, v + 2, v + 5]; });
paint('snow_side', (x, y) => {
  const h = 3 + (rnd(x, 0, 9) < 0.5 ? 1 : 0) + (rnd(x, 1, 9) < 0.3 ? 1 : 0);
  if (y < h) { const v = 244 + (rnd(x, y, 8) - 0.5) * 10; return [v, v + 2, v + 5]; }
  return dirtPx(x, y);
});
paint('cobble', (x, y) => {
  // voronoi-ish stones
  const cs = 5.3; let best = 1e9, second = 1e9, id = 0;
  const gx = Math.floor(x / cs), gy = Math.floor(y / cs);
  for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
    const cx = (gx + i + rnd(gx + i, gy + j, 11) * 0.8 + 0.1) * cs, cy = (gy + j + rnd(gx + i, gy + j, 12) * 0.8 + 0.1) * cs;
    // wrap so the tile repeats
    for (const ox of [-16, 0, 16]) for (const oy of [-16, 0, 16]) {
      const d = Math.hypot(x - (cx + ox), y - (cy + oy));
      if (d < best) { second = best; best = d; id = rnd(Math.floor(cx), Math.floor(cy), 13); } else if (d < second) second = d;
    }
  }
  if (second - best < 1.0) return gray(72 + rnd(x, y, 14) * 10);
  return gray(112 + id * 44 + (rnd(x, y, 15) - 0.5) * 12);
});
paint('sand', (x, y) => { const k = 0.93 + rnd(x, y, 16) * 0.12; return [221 * k, 208 * k, 160 * k]; });
paint('gravel', (x, y) => {
  const a = rnd(x >> 1, y >> 1, 17), b = rnd(x, y, 18);
  const v = 95 + a * 70 + (b - 0.5) * 24;
  return [v, v * 0.97, v * 0.95];
});
paint('log_side', (x, y) => { const k = 0.8 + rnd(x, 0, 19) * 0.35 + (rnd(x, y, 20) - 0.5) * 0.1; return [102 * k, 80 * k, 48 * k]; });
paint('log_top', (x, y) => {
  const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
  if (d > 6.2) { const k = 0.8 + rnd(x, y, 21) * 0.3; return [102 * k, 80 * k, 48 * k]; }
  const ring = Math.floor(d) % 2; const k = 0.95 + (rnd(x, y, 22) - 0.5) * 0.12;
  return ring ? [156 * k, 122 * k, 72 * k] : [184 * k, 148 * k, 92 * k];
});
paint('leaves', (x, y) => {
  if (rnd(x, y, 23) < 0.06 && rnd(x >> 1, y >> 1, 26) < 0.5) return null;
  const v = 150 + rnd(x, y, 24) * 44 + (rnd(x >> 2, y >> 2, 25) - 0.5) * 30; return [v, v, v, TINT_A];
});
const planksPx = (x, y) => {
  let k = 0.92 + rnd(x, y >> 2, 26) * 0.12 + (rnd(x, y, 27) - 0.5) * 0.06;
  if (y % 4 === 3) k *= 0.78;
  const seam = (y >> 2) % 2 ? 5 : 11; if (x === seam && y % 4 !== 3) k *= 0.82;
  return [168 * k, 132 * k, 82 * k];
};
paint('planks', planksPx);
paint('water', (x, y) => { const k = 0.92 + rnd(x >> 1, y >> 1, 28) * 0.12 + (Math.sin((x + y) * 0.9) * 0.03); return [48 * k, 100 * k, 214 * k]; });
paint('lava', (x, y) => {
  const n = rnd(x >> 1, y >> 1, 29) * 0.6 + rnd(x, y, 30) * 0.4;
  return [230 + n * 25, 70 + n * 130, 8 + n * 30];
});
paint('bedrock', (x, y) => gray(38 + rnd(x >> 1, y >> 1, 31) * 40 + rnd(x, y, 32) * 22));
function oreSpots(seed) {
  const s = new Set();
  for (let i = 0; i < 6; i++) {
    const cx = 2 + Math.floor(rnd(i, 0, seed) * 12), cy = 2 + Math.floor(rnd(i, 1, seed) * 12);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (Math.abs(dx) + Math.abs(dy) < 2 || rnd(cx + dx, cy + dy, seed + 9) < 0.6) s.add((cx + dx) + ',' + (cy + dy));
    }
  }
  return s;
}
function ore(name, seed, col, alt) {
  const sp = oreSpots(seed);
  paint(name, (x, y) => {
    if (sp.has(x + ',' + y)) { const k = 0.85 + rnd(x, y, seed + 3) * 0.3; const c = rnd(x, y, seed + 4) < 0.25 ? alt : col; return [c[0] * k, c[1] * k, c[2] * k]; }
    return stonePx(x, y);
  });
}
ore('coal_ore', 40, [28, 28, 30], [55, 55, 58]);
ore('iron_ore', 41, [214, 172, 146], [190, 140, 112]);
ore('gold_ore', 42, [250, 236, 70], [230, 190, 40]);
ore('diamond_ore', 43, [92, 226, 214], [150, 245, 240]);
paint('sandstone_top', (x, y) => { const k = 0.95 + rnd(x, y, 33) * 0.08; return [223 * k, 211 * k, 160 * k]; });
paint('sandstone_side', (x, y) => {
  let k = 0.95 + rnd(x, y, 34) * 0.08; if (y === 3 || y === 12) k *= 0.85; if (y === 4 || y === 11) k *= 0.93;
  return [221 * k, 207 * k, 156 * k];
});
paint('glass', (x, y) => {
  if (x === 0 || y === 0 || x === 15 || y === 15) return [200, 228, 236, 255];
  if ((x + y === 5 || x + y === 7 || x + y === 6 && x > 2) && x > 1 && y > 1 && x < 6) return [255, 255, 255, 255];
  return null;
});
paint('crafting_top', (x, y) => {
  const p = planksPx(x, y);
  if (x === 0 || y === 0 || x === 15 || y === 15) return mul(p, 0.62);
  if ((x - 1) % 4 === 2 || (y - 1) % 4 === 2) return mul(p, 0.7);
  return p;
});
const craftSide = (x, y) => {
  const p = planksPx(x, y);
  if (y < 3) return mul(p, 0.62);
  if (x === 0 || x === 15) return mul(p, 0.7);
  // little saw + hammer
  if (y >= 6 && y <= 12 && ((x >= 3 && x <= 5) || (x >= 9 && x <= 12 && y <= 8))) return [95, 95, 100];
  if (y >= 7 && y <= 13 && x === 4) return [70, 50, 30];
  if (y >= 9 && y <= 13 && x >= 9 && x <= 12) return [190, 190, 195];
  return p;
};
paint('crafting_side', craftSide);
paint('crafting_front', craftSide);
paint('furnace_side', (x, y) => {
  const c = stonePx(x, y);
  if (x >= 3 && x <= 12 && y >= 4 && y <= 12) {
    if (y === 4 || y === 12 || x === 3 || x === 12) return [55, 55, 58];
    if (y >= 9) return [26, 22, 22];
    return [40, 40, 44];
  }
  if (x >= 4 && x <= 11 && y === 8) return [24, 24, 24];
  return mul(c, 0.9);
});
paint('furnace_top', (x, y) => mul(stonePx(x, y), (x === 0 || y === 0 || x === 15 || y === 15) ? 0.7 : 1.0));
paint('torch', (x, y) => {
  if ((x === 7 || x === 8) && y >= 6) { const k = x === 7 ? 1 : 0.8; return [120 * k, 88 * k, 44 * k]; }
  if ((x === 7 || x === 8) && y >= 3 && y <= 5) return y === 3 ? [255, 236, 130] : [255, 190 - (y - 4) * 30, 40];
  if ((x === 6 || x === 9) && y >= 4 && y <= 5) return [255, 130, 20];
  return null;
});
paint('tallgrass', (x, y) => {
  const blades = [1, 3, 5, 7, 9, 11, 13, 14];
  for (const b of blades) {
    const hb = 5 + Math.floor(rnd(b, 2, 3) * 9);
    const lean = Math.sin(b * 1.7) * 0.9 * ((15 - y) / 15);
    if (Math.abs(x - (b + lean * 0.8)) < 0.6 && y >= 16 - hb) { const v = 140 + (y / 16) * 90 + rnd(x, y, 4) * 30; return [v, v, v, TINT_A]; }
  }
  return null;
});
function flower(name, petal, center) {
  paint(name, (x, y) => {
    if ((x === 7 || x === 8) && y >= 8) return [52, 140 + rnd(x, y, 2) * 30, 40];
    if (x === 9 && y >= 11 && y <= 12) return [60, 150, 45];
    if (x >= 5 && x <= 10 && y >= 3 && y <= 8) {
      if (x >= 7 && x <= 8 && y >= 5 && y <= 6) return center;
      if ((x === 5 || x === 10) && (y === 3 || y === 8)) return null;
      return petal;
    }
    return null;
  });
}
flower('flower_r', [216, 36, 40], [250, 220, 60]);
flower('flower_y', [252, 214, 40], [200, 120, 20]);
paint('cactus_side', (x, y) => {
  if (x === 0 || x === 15) return [22, 80, 30];
  let k = 0.9 + rnd(x, 0, 6) * 0.2; if (x % 4 === 2) k *= 0.85;
  if ((x + y * 2) % 7 === 0 && x > 1 && x < 14) return [225, 232, 170];
  return [44 * k, 132 * k, 50 * k];
});
paint('cactus_top', (x, y) => {
  const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
  return d > 6 ? [26, 92, 34] : [58 + (d < 3 ? 14 : 0), 150, 62];
});
paint('bricks', (x, y) => {
  const row = y >> 2, off = row % 2 ? 4 : 0;
  if (y % 4 === 3 || (x + off) % 8 === 7) return gray(172 + rnd(x, y, 35) * 14);
  const k = 0.88 + rnd((x + off) >> 3, row, 36) * 0.25 + (rnd(x, y, 37) - 0.5) * 0.08;
  return [152 * k, 72 * k, 58 * k];
});
paint('wool', (x, y) => { const v = 228 + (rnd(x, y, 38) - 0.5) * 22 + (rnd(x >> 1, y >> 1, 39) - 0.5) * 10; return [v, v, v]; });
paint('ice', (x, y) => {
  const k = 0.92 + rnd(x >> 2, y >> 2, 44) * 0.1; const st = ((x + y) % 9 === 0) ? 1.08 : 1;
  return [148 * k * st, 196 * k * st, 246 * k * st];
});
const chestWood = (x, y) => { const p = planksPx(x, y); return [p[0] * 0.85, p[1] * 0.72, p[2] * 0.6]; };
paint('chest_top', (x, y) => { const p = chestWood(x, y); return (x === 0 || y === 0 || x === 15 || y === 15) ? mul(p, 0.65) : p; });
paint('chest_side', (x, y) => {
  const p = chestWood(x, y);
  if (x === 0 || x === 15 || y === 0 || y === 15) return mul(p, 0.62);
  if (y === 6 || y === 7) return mul(p, 0.72);
  if (x >= 7 && x <= 8 && y >= 5 && y <= 9) return [200, 200, 205];
  return p;
});
paint('tnt_side', (x, y) => {
  if (y < 3 || y > 12) { const k = 0.9 + rnd(x, y, 45) * 0.1; return [214 * k, 200 * k, 176 * k]; }
  if (y >= 5 && y <= 10 && x >= 3 && x <= 12) return (x + y) % 2 === 0 && y > 6 && y < 9 ? [30, 30, 30] : [230, 226, 212];
  const k = 0.9 + rnd(x, y, 46) * 0.12; return [196 * k, 44 * k, 38 * k];
});
paint('tnt_top', (x, y) => {
  const d = Math.hypot(x - 7.5, y - 7.5); const k = 0.9 + rnd(x, y, 47) * 0.1;
  return d < 2.5 ? [60, 60, 60] : [206 * k, 190 * k, 160 * k];
});

paint('birch_side', (x, y) => {
  const k = 0.92 + rnd(x >> 1, y, 60) * 0.12;
  if (rnd(x, y >> 1, 61) < 0.16 && (x % 5 !== 0)) return [40 * k, 38 * k, 36 * k];
  return [228 * k, 226 * k, 214 * k];
});
paint('birch_top', (x, y) => {
  const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
  if (d > 6.2) return [224, 222, 210];
  const ring = Math.floor(d) % 2; const k = 0.95 + (rnd(x, y, 62) - 0.5) * 0.1;
  return ring ? [196 * k, 178 * k, 120 * k] : [214 * k, 196 * k, 136 * k];
});
paint('spruce_side', (x, y) => { const k = 0.75 + rnd(x, 0, 63) * 0.3 + (rnd(x, y, 64) - 0.5) * 0.08; return [66 * k, 48 * k, 28 * k]; });
paint('spruce_top', (x, y) => {
  const d = Math.max(Math.abs(x - 7.5), Math.abs(y - 7.5));
  if (d > 6.2) { const k = 0.75 + rnd(x, y, 65) * 0.3; return [66 * k, 48 * k, 28 * k]; }
  const ring = Math.floor(d) % 2; const k = 0.95 + (rnd(x, y, 66) - 0.5) * 0.1;
  return ring ? [112 * k, 82 * k, 48 * k] : [128 * k, 96 * k, 56 * k];
});
paint('stone_bricks', (x, y) => {
  const row = y >> 2, off = row % 2 ? 4 : 0;
  if (y % 4 === 3 || (x + off) % 8 === 7) return gray(84 + rnd(x, y, 67) * 10);
  return gray(122 + rnd((x + off) >> 3, row, 68) * 22 + (rnd(x, y, 69) - 0.5) * 10);
});
const woolPx = (c) => (x, y) => { const v = 0.9 + rnd(x, y, 70) * 0.16 + (rnd(x >> 1, y >> 1, 71) - 0.5) * 0.08; return [c[0] * v, c[1] * v, c[2] * v]; };
paint('wool_red', woolPx([176, 46, 38]));
paint('wool_yellow', woolPx([248, 197, 39]));
const plankTint = (c) => (x, y) => { const p = planksPx(x, y); const k = p[0] / 168; return [c[0] * k, c[1] * k, c[2] * k]; };
paint('deadbush', (x, y) => {
  const br = [[7, 15, 7, 9], [7, 9, 4, 5], [7, 10, 11, 6], [7, 12, 3, 9], [4, 5, 3, 3], [11, 6, 12, 4], [10, 8, 13, 8]];
  for (const b of br) { const n = Math.max(Math.abs(b[2] - b[0]), Math.abs(b[3] - b[1])) + 1; for (let i = 0; i <= n; i++) { const t = i / n; if (Math.round(b[0] + (b[2] - b[0]) * t) === x && Math.round(b[1] + (b[3] - b[1]) * t) === y) return [110 + rnd(x, y, 80) * 30, 76 + rnd(x, y, 81) * 20, 40]; } }
  return null;
});
paint('farmland', (x, y) => { const f = (x % 4 === 1 || x % 4 === 2) ? 0.78 : 1; const k = (0.85 + rnd(x, y, 95) * 0.2) * f; return [96 * k, 64 * k, 42 * k]; });
for (let st = 0; st < 4; st++) {
  paint('wheat_' + st, (x, y) => {
    const stalk = [1, 4, 7, 10, 13]; const hgt = 4 + st * 3;
    for (const sx of stalk) {
      const sway = Math.sin(sx * 2.1) * (st > 1 ? 0.8 : 0.3) * ((15 - y) / 15);
      if (Math.abs(x - (sx + sway)) < 0.7 && y >= 16 - hgt) {
        const top = y < 16 - hgt + 3 && st === 3;
        if (top) return [214 + rnd(x, y, 90) * 20, 176 + rnd(x, y, 91) * 20, 66];
        if (st === 3) return [176 + rnd(x, y, 92) * 20, 150 + rnd(x, y, 93) * 20, 60];
        return [70 + st * 26, 150 + rnd(x, y, 94) * 30 - st * 8, 44];
      }
    }
    return null;
  });
}
paint('spruce_planks', plankTint([114, 84, 48]));
paint('birch_planks', plankTint([196, 178, 122]));

// mipmaps (5 levels; tile aligned so no bleeding down to 16x16)
export function buildMipmaps() {
  const levels = [{ data: atlasData, width: ATLAS, height: ATLAS }];
  for (let l = 1; l <= 4; l++) {
    const p = levels[l - 1], w = p.width >> 1, out = new Uint8Array(w * w * 4);
    for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0, a = 0, wsum = 0;
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
        const o = ((y * 2 + j) * p.width + x * 2 + i) * 4; const al = p.data[o + 3];
        r += p.data[o] * al; g += p.data[o + 1] * al; b += p.data[o + 2] * al; a += al; wsum += al;
      }
      const o2 = (y * w + x) * 4;
      if (wsum > 0) { out[o2] = r / wsum; out[o2 + 1] = g / wsum; out[o2 + 2] = b / wsum; }
      out[o2 + 3] = a / 4;
    }
    levels.push({ data: out, width: w, height: w });
  }
  return levels;
}

// ---------------------------------------------------------------- block table
export const N_BLOCKS = 128;
export const STAIR_BASE = 52; // + mat*4 + facing
export const OPAQUE = new Uint8Array(N_BLOCKS);     // fully opaque cube (culls neighbours)
export const SOLID = new Uint8Array(N_BLOCKS);      // collides
export const LIGHT_OP = new Uint8Array(N_BLOCKS);   // light attenuation
export const EMIT = new Uint8Array(N_BLOCKS);       // light emission
export const SHAPE = new Uint8Array(N_BLOCKS);      // 0 cube 1 cross 2 torch 3 liquid 4 cactus
export const CULL_SAME = new Uint8Array(N_BLOCKS);
export const TARGETABLE = new Uint8Array(N_BLOCKS);
export const FALLS = new Uint8Array(N_BLOCKS);
export const BLOCKS = [];
export const TINT_GRASS = 1, TINT_FOLIAGE = 2;
function def(id, name, o) {
  const d = Object.assign({ id, name, top: 'stone', bottom: null, side: null, hardness: 1, tool: null, need: 0, opaque: true, solid: true, opacity: 15, emit: 0, shape: 0, sound: 'stone', drop: id, dropN: 1, cullSame: false, targetable: true, tintTop: 0, tintSide: 0, tintAll: 0 }, o);
  if (!d.bottom) d.bottom = d.top; if (!d.side) d.side = d.top;
  BLOCKS[id] = d;
  OPAQUE[id] = d.opaque ? 1 : 0; SOLID[id] = d.solid ? 1 : 0; LIGHT_OP[id] = d.opacity; EMIT[id] = d.emit; SHAPE[id] = d.shape;
  CULL_SAME[id] = d.cullSame ? 1 : 0; TARGETABLE[id] = d.targetable ? 1 : 0; FALLS[id] = d.falls ? 1 : 0;
  d.tiles = { top: TILE[d.top], bottom: TILE[d.bottom], side: TILE[d.side] };
}
def(AIR, 'Air', { opaque: false, solid: false, opacity: 0, targetable: false, drop: 0, hardness: 0 });
def(STONE, 'Stone', { top: 'stone', hardness: 1.5, tool: 'pickaxe', need: 1, drop: COBBLE });
def(GRASS, 'Grass Block', { top: 'grass_top', bottom: 'dirt', side: 'grass_side', hardness: 0.6, tool: 'shovel', sound: 'grass', drop: DIRT, tintTop: TINT_GRASS, tintSide: TINT_GRASS });
def(DIRT, 'Dirt', { top: 'dirt', hardness: 0.5, tool: 'shovel', sound: 'dirt' });
def(COBBLE, 'Cobblestone', { top: 'cobble', hardness: 2, tool: 'pickaxe', need: 1 });
def(SAND, 'Sand', { top: 'sand', hardness: 0.5, tool: 'shovel', sound: 'sand', falls: true });
def(GRAVEL, 'Gravel', { top: 'gravel', hardness: 0.6, tool: 'shovel', sound: 'gravel', falls: true });
def(LOG, 'Oak Log', { top: 'log_top', side: 'log_side', hardness: 2, tool: 'axe', sound: 'wood' });
def(LEAVES, 'Leaves', { top: 'leaves', hardness: 0.2, opaque: false, opacity: 1, sound: 'grass', cullSame: true, tintAll: TINT_FOLIAGE, drop: 0 });
def(PLANKS, 'Oak Planks', { top: 'planks', hardness: 2, tool: 'axe', sound: 'wood' });
def(WATER, 'Water', { top: 'water', hardness: 0, opaque: false, solid: false, opacity: 1, shape: 3, cullSame: true, targetable: false, drop: 0, sound: 'water' });
def(LAVA, 'Lava', { top: 'lava', hardness: 0, opaque: false, solid: false, opacity: 0, shape: 3, cullSame: true, targetable: false, drop: 0, emit: 15, sound: 'water' });
def(BEDROCK, 'Bedrock', { top: 'bedrock', hardness: 1e9 });
def(COAL_ORE, 'Coal Ore', { top: 'coal_ore', hardness: 3, tool: 'pickaxe', need: 1, drop: COAL });
def(IRON_ORE, 'Iron Ore', { top: 'iron_ore', hardness: 3, tool: 'pickaxe', need: 2 });
def(GOLD_ORE, 'Gold Ore', { top: 'gold_ore', hardness: 3, tool: 'pickaxe', need: 3 });
def(DIAMOND_ORE, 'Diamond Ore', { top: 'diamond_ore', hardness: 3, tool: 'pickaxe', need: 3, drop: DIAMOND });
def(SNOW, 'Snow', { top: 'snow', hardness: 0.2, tool: 'shovel', sound: 'snow' });
def(SANDSTONE, 'Sandstone', { top: 'sandstone_top', side: 'sandstone_side', hardness: 0.8, tool: 'pickaxe', need: 1 });
def(GLASS, 'Glass', { top: 'glass', hardness: 0.3, opaque: false, opacity: 0, cullSame: true, sound: 'glass', drop: 0 });
def(CRAFTING, 'Crafting Table', { top: 'crafting_top', bottom: 'planks', side: 'crafting_side', hardness: 2.5, tool: 'axe', sound: 'wood' });
def(FURNACE, 'Furnace', { top: 'furnace_top', side: 'furnace_side', hardness: 3.5, tool: 'pickaxe', need: 1, drop: FURNACE });
def(TORCH, 'Torch', { top: 'torch', hardness: 0, opaque: false, solid: false, opacity: 0, shape: 2, emit: 14, sound: 'wood' });
def(TALLGRASS, 'Tall Grass', { top: 'tallgrass', hardness: 0, opaque: false, solid: false, opacity: 0, shape: 1, sound: 'grass', drop: 0, tintAll: TINT_GRASS });
def(FLOWER_R, 'Poppy', { top: 'flower_r', hardness: 0, opaque: false, solid: false, opacity: 0, shape: 1, sound: 'grass' });
def(FLOWER_Y, 'Dandelion', { top: 'flower_y', hardness: 0, opaque: false, solid: false, opacity: 0, shape: 1, sound: 'grass' });
def(CACTUS, 'Cactus', { top: 'cactus_top', side: 'cactus_side', hardness: 0.4, opaque: false, opacity: 0, shape: 4, sound: 'grass' });
def(BRICKS, 'Bricks', { top: 'bricks', hardness: 2, tool: 'pickaxe', need: 1 });
def(WOOL, 'Wool', { top: 'wool', hardness: 0.8, sound: 'wool' });
def(ICE, 'Ice', { top: 'ice', hardness: 0.5, tool: 'pickaxe', sound: 'glass', drop: 0, opacity: 1 });
def(SNOWGRASS, 'Snowy Grass', { top: 'snow', bottom: 'dirt', side: 'snow_side', hardness: 0.6, tool: 'shovel', sound: 'snow', drop: DIRT });
def(CHEST, 'Chest', { top: 'chest_top', bottom: 'chest_top', side: 'chest_side', hardness: 2.5, tool: 'axe', sound: 'wood' });
def(TNT, 'TNT', { top: 'tnt_top', bottom: 'tnt_top', side: 'tnt_side', hardness: 0, sound: 'grass' });
def(BIRCH_LOG, 'Birch Log', { top: 'birch_top', side: 'birch_side', hardness: 2, tool: 'axe', sound: 'wood' });
def(SPRUCE_LOG, 'Spruce Log', { top: 'spruce_top', side: 'spruce_side', hardness: 2, tool: 'axe', sound: 'wood' });
def(STONE_BRICKS, 'Stone Bricks', { top: 'stone_bricks', hardness: 1.5, tool: 'pickaxe', need: 1 });
def(WOOL_RED, 'Red Wool', { top: 'wool_red', hardness: 0.8, sound: 'wool' });
def(WOOL_YELLOW, 'Yellow Wool', { top: 'wool_yellow', hardness: 0.8, sound: 'wool' });
def(SPRUCE_PLANKS, 'Spruce Planks', { top: 'spruce_planks', hardness: 2, tool: 'axe', sound: 'wood' });
def(BIRCH_PLANKS, 'Birch Planks', { top: 'birch_planks', hardness: 2, tool: 'axe', sound: 'wood' });
def(DEAD_BUSH, 'Dead Bush', { top: 'deadbush', hardness: 0, opaque: false, solid: false, opacity: 0, shape: 1, sound: 'grass', drop: STICK });
const slab = (id, name, tile, side, snd, tool) => def(id, name, { top: tile, side: side || tile, hardness: 1.8, tool: tool || 'pickaxe', need: tool === 'axe' ? 0 : 1, opaque: false, opacity: 0, shape: 5, sound: snd || 'stone' });
slab(STONE_SLAB, 'Stone Slab', 'stone'); slab(COBBLE_SLAB, 'Cobblestone Slab', 'cobble'); slab(PLANK_SLAB, 'Oak Slab', 'planks', null, 'wood', 'axe');
slab(BRICK_SLAB, 'Brick Slab', 'bricks'); slab(SANDSTONE_SLAB, 'Sandstone Slab', 'sandstone_top', 'sandstone_side'); slab(STONEBRICK_SLAB, 'Stone Brick Slab', 'stone_bricks');
for (let st = 0; st < 4; st++) def(WHEAT_1 + st, 'Wheat', { top: 'wheat_' + st, hardness: 0, opaque: false, solid: false, opacity: 0, shape: 1, sound: 'grass', drop: SEEDS });
def(FARMLAND, 'Farmland', { top: 'farmland', bottom: 'dirt', side: 'dirt', hardness: 0.6, tool: 'shovel', sound: 'dirt', drop: DIRT });
export const STAIR_MATS = [[COBBLE, 'Cobblestone', 'cobble'], [PLANKS, 'Oak', 'planks'], [STONE_BRICKS, 'Stone Brick', 'stone_bricks'], [BRICKS, 'Brick', 'bricks'], [SANDSTONE, 'Sandstone', 'sandstone_top']];
STAIR_MATS.forEach((m, mi) => { for (let f = 0; f < 4; f++) def(STAIR_BASE + mi * 4 + f, m[1] + ' Stairs', { top: m[2], side: m[2] === 'sandstone_top' ? 'sandstone_side' : m[2], hardness: 1.8, tool: m[0] === PLANKS ? 'axe' : 'pickaxe', need: m[0] === PLANKS ? 0 : 1, opaque: false, opacity: 0, shape: 6, sound: m[0] === PLANKS ? 'wood' : 'stone', drop: STAIR_BASE + mi * 4 }); });
BLOCKS[LEAVES].apple = true;

// ---------------------------------------------------------------- items
export const ITEMS = {}; // id -> {name, stack, tool?, food?, fuel?}
for (const b of BLOCKS) if (b && b.id && !(b.id >= STAIR_BASE && b.id < STAIR_BASE + 20 && (b.id - STAIR_BASE) % 4 !== 0) && b.id !== WATER && b.id !== LAVA && b.id !== BEDROCK && b.id !== TALLGRASS && b.id !== SNOWGRASS && !(b.id >= WHEAT_1 && b.id <= WHEAT_4))
  ITEMS[b.id] = { id: b.id, name: b.name, stack: 64, block: true };
ITEMS[BEDROCK] = { id: BEDROCK, name: 'Bedrock', stack: 64, block: true };
function item(id, name, o = {}) { ITEMS[id] = Object.assign({ id, name, stack: 64 }, o); }
item(STICK, 'Stick', { fuel: 5 });
item(COAL, 'Coal', { fuel: 80 });
item(IRON_INGOT, 'Iron Ingot'); item(GOLD_INGOT, 'Gold Ingot'); item(DIAMOND, 'Diamond');
item(APPLE, 'Apple', { food: 4 });
item(PORK_RAW, 'Raw Porkchop', { food: 3 }); item(PORK_COOKED, 'Cooked Porkchop', { food: 8 });
item(BEEF_RAW, 'Raw Beef', { food: 3 }); item(BEEF_COOKED, 'Steak', { food: 8 });
item(MUTTON_RAW, 'Raw Mutton', { food: 2 }); item(MUTTON_COOKED, 'Cooked Mutton', { food: 6 });
item(ROTTEN_FLESH, 'Rotten Flesh', { food: 2 });
item(GUNPOWDER, 'Gunpowder'); item(BONE, 'Bone'); item(ARROW, 'Arrow'); item(STRING, 'String');
item(BOW, 'Bow', { stack: 1, bow: true, dur: 384 });
item(FLINT_STEEL, 'Flint and Steel', { stack: 1, tool: { type: 'lighter', tier: 0, speed: 1, dur: 65, dmg: 1 }, kind: 5, tierIdx: 0 });
item(SEEDS, 'Wheat Seeds'); item(WHEAT, 'Wheat'); item(BREAD, 'Bread', { food: 5 });
for (let k = 0; k < 4; k++) for (let t = 0; t < 2; t++) {
  const T = ARMOR_TIERS[t];
  item(armorId(k, t), `${T.name} ${ARMOR_KINDS[k][0].toUpperCase() + ARMOR_KINDS[k].slice(1)}`, { stack: 1, armor: { slot: k, pts: T.pts[k], dur: T.dur[k], tier: t } });
}
for (const id of [LOG, BIRCH_LOG, SPRUCE_LOG, PLANKS, BIRCH_PLANKS, SPRUCE_PLANKS]) ITEMS[id].fuel = 15;
ITEMS[PLANKS].fuel = 15; ITEMS[CRAFTING].fuel = 15; ITEMS[CHEST].fuel = 15;
for (let t = 0; t < 4; t++) item(HOE_BASE + t, `${TIERS[t].name} Hoe`, { stack: 1, hoe: true, tool: { type: 'hoe', tier: TIERS[t].tier, speed: 1, dur: TIERS[t].dur, dmg: 1 }, kind: 4, tierIdx: t });
for (let k = 0; k < 4; k++) for (let t = 0; t < 4; t++) {
  const T = TIERS[t], kind = TOOL_KINDS[k];
  item(toolId(k, t), `${T.name} ${kind[0].toUpperCase() + kind.slice(1)}`, {
    stack: 1, tool: { type: kind, tier: T.tier, speed: T.speed, dur: T.dur,
      dmg: kind === 'sword' ? 4 + t : kind === 'axe' ? 3 + t : kind === 'pickaxe' ? 2 + t : 1.5 + t * 0.75 },
    kind: k, tierIdx: t,
  });
}
export const itemName = (id) => (ITEMS[id] ? ITEMS[id].name : '?');
export const SMELT = new Map([
  [IRON_ORE, IRON_INGOT], [GOLD_ORE, GOLD_INGOT], [SAND, GLASS], [COBBLE, STONE], [LOG, COAL], [BIRCH_LOG, COAL], [SPRUCE_LOG, COAL],
  [PORK_RAW, PORK_COOKED], [BEEF_RAW, BEEF_COOKED], [MUTTON_RAW, MUTTON_COOKED],
]);

// ---------------------------------------------------------------- recipes
export const RECIPES = [];
function shaped(rows, key, id, n = 1) {
  const h = rows.length, w = rows[0].length;
  const grid = []; for (const r of rows) for (const ch of r) grid.push(ch === ' ' ? 0 : key[ch]);
  RECIPES.push({ shaped: true, w, h, grid, id, n });
}
function shapeless(list, id, n = 1) { RECIPES.push({ shaped: false, list: list.slice().sort((a, b) => a - b), id, n }); }
shapeless([LOG], PLANKS, 4); shapeless([BIRCH_LOG], BIRCH_PLANKS, 4); shapeless([SPRUCE_LOG], SPRUCE_PLANKS, 4);
shapeless([WOOL, FLOWER_R], WOOL_RED, 1); shapeless([WOOL, FLOWER_Y], WOOL_YELLOW, 1);
shaped(['##', '##'], { '#': STONE }, STONE_BRICKS, 4);
STAIR_MATS.forEach((m, mi) => shaped(['#  ', '## ', '###'], { '#': m[0] }, STAIR_BASE + mi * 4, 4));
for (const [b, sl] of [[STONE, STONE_SLAB], [COBBLE, COBBLE_SLAB], [PLANKS, PLANK_SLAB], [BRICKS, BRICK_SLAB], [SANDSTONE, SANDSTONE_SLAB], [STONE_BRICKS, STONEBRICK_SLAB]]) shaped(['###'], { '#': b }, sl, 6);
shaped([' #S', '# S', ' #S'], { '#': STICK, S: STRING }, BOW, 1);
shaped(['B', 'S'], { B: BONE, S: STICK }, ARROW, 4);
shaped(['###'], { '#': WHEAT }, BREAD, 1);
shapeless([IRON_INGOT, COAL], FLINT_STEEL, 1);
for (const pl of [BIRCH_PLANKS, SPRUCE_PLANKS]) { shaped(['#', '#'], { '#': pl }, STICK, 4); shaped(['##', '##'], { '#': pl }, CRAFTING, 1); shaped(['###', '# #', '###'], { '#': pl }, CHEST, 1); }
shaped(['#', '#'], { '#': PLANKS }, STICK, 4);
shaped(['##', '##'], { '#': PLANKS }, CRAFTING, 1);
shaped(['C', 'S'], { C: COAL, S: STICK }, TORCH, 4);
shaped(['###', '# #', '###'], { '#': COBBLE }, FURNACE, 1);
shaped(['###', '# #', '###'], { '#': PLANKS }, CHEST, 1);
shaped(['##', '##'], { '#': SAND }, SANDSTONE, 1);
shaped(['##', '##'], { '#': WOOL }, WOOL, 1); // decorative no-op-ish
RECIPES.pop();
shaped(['GSG', 'SGS', 'GSG'], { G: GUNPOWDER, S: SAND }, TNT, 1);
shaped(['##', '##'], { '#': COBBLE }, BRICKS, 4);
shaped(['###', '###'], { '#': PLANKS }, GLASS, 0); RECIPES.pop();
const mats = [PLANKS, COBBLE, IRON_INGOT, DIAMOND];
for (let t = 0; t < 4; t++) {
  const m = mats[t];
  shaped(['MMM', ' S ', ' S '], { M: m, S: STICK }, toolId(0, t));
  shaped(['MM', 'MS', ' S'], { M: m, S: STICK }, toolId(1, t));
  shaped(['MM', 'SM', 'S '], { M: m, S: STICK }, toolId(1, t)); // mirrored handled below anyway
  shaped(['M', 'S', 'S'], { M: m, S: STICK }, toolId(2, t));
  shaped(['M', 'M', 'S'], { M: m, S: STICK }, toolId(3, t));
  shaped(['MM', ' S', ' S'], { M: m, S: STICK }, HOE_BASE + t);
}
for (let t = 0; t < 2; t++) {
  const m = t === 0 ? IRON_INGOT : DIAMOND;
  shaped(['MMM', 'M M'], { M: m }, armorId(0, t)); shaped(['M M', 'MMM', 'MMM'], { M: m }, armorId(1, t));
  shaped(['MMM', 'M M', 'M M'], { M: m }, armorId(2, t)); shaped(['M M', 'M M'], { M: m }, armorId(3, t));
}
export function matchRecipe(cells, w, h) {
  // cells: array of item ids (0 empty), w*h
  let minx = w, miny = h, maxx = -1, maxy = -1, count = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (cells[y * w + x]) {
    count++; minx = Math.min(minx, x); miny = Math.min(miny, y); maxx = Math.max(maxx, x); maxy = Math.max(maxy, y);
  }
  if (!count) return null;
  const bw = maxx - minx + 1, bh = maxy - miny + 1;
  const ids = []; for (let i = 0; i < cells.length; i++) if (cells[i]) ids.push(cells[i]);
  ids.sort((a, b) => a - b);
  for (const r of RECIPES) {
    if (!r.shaped) {
      if (r.list.length === ids.length && r.list.every((v, i) => v === ids[i])) return r;
    } else if (r.w === bw && r.h === bh) {
      let ok = true, okM = true;
      for (let y = 0; y < bh && (ok || okM); y++) for (let x = 0; x < bw; x++) {
        const c = cells[(miny + y) * w + minx + x];
        if (c !== r.grid[y * bw + x]) ok = false;
        if (c !== r.grid[y * bw + (bw - 1 - x)]) okM = false;
      }
      if (ok || okM) return r;
    }
  }
  return null;
}

// ---------------------------------------------------------------- icons
export function tileCanvas(tile, tint) {
  const c = document.createElement('canvas'); c.width = c.height = 16;
  const ctx = c.getContext('2d'); const im = ctx.createImageData(16, 16);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const p = getPx(tile, x, y); const o = (y * 16 + x) * 4;
    if (p[3] < 254.5 && p[3] > 0.5 && tint) { p[0] *= tint[0]; p[1] *= tint[1]; p[2] *= tint[2]; }
    im.data[o] = p[0]; im.data[o + 1] = p[1]; im.data[o + 2] = p[2]; im.data[o + 3] = p[3] > 0 ? 255 : 0;
  }
  ctx.putImageData(im, 0, 0); return c;
}
export const TINTS = { grass: [0.60, 0.84, 0.36], foliage: [0.42, 0.68, 0.22] };
export function tileAvg(tile, tint) {
  let r = 0, g = 0, b = 0, n = 0;
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const p = getPx(tile, x, y); if (p[3] < 10) continue;
    const t = p[3] < 254.5 && tint;
    r += p[0] * (t ? tint[0] : 1); g += p[1] * (t ? tint[1] : 1); b += p[2] * (t ? tint[2] : 1); n++;
  }
  n = n || 1; return [r / n, g / n, b / n];
}
const iconCache = new Map();
function tintFor(k) { return k === TINT_GRASS ? TINTS.grass : k === TINT_FOLIAGE ? TINTS.foliage : null; }
function blockIcon(b) {
  const S = 32, c = document.createElement('canvas'); c.width = c.height = S;
  const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false;
  if (b.shape === 1 || b.shape === 2 || b.id === GLASS) {
    ctx.drawImage(tileCanvas(b.tiles.top, tintFor(b.tintAll)), 2, 2, 28, 28);
    return c;
  }
  const topT = tintFor(b.tintTop || b.tintAll), sideT = tintFor(b.tintSide || b.tintAll);
  const top = tileCanvas(b.tiles.top, topT), side = tileCanvas(b.tiles.side, sideT);
  ctx.setTransform(14 / 16, 7 / 16, -14 / 16, 7 / 16, 16, 2); ctx.drawImage(top, 0, 0);
  ctx.setTransform(14 / 16, 7 / 16, 0, 14 / 16, 2, 9); ctx.drawImage(side, 0, 0);
  ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(0, 0, 16, 16);
  ctx.setTransform(14 / 16, -7 / 16, 0, 14 / 16, 16, 16); ctx.drawImage(side, 0, 0);
  ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(0, 0, 16, 16);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return c;
}
function newBuf() { return new Uint8ClampedArray(16 * 16 * 4); }
function bput(buf, x, y, col) {
  x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x > 15 || y > 15) return;
  const o = (y * 16 + x) * 4; buf[o] = col[0]; buf[o + 1] = col[1]; buf[o + 2] = col[2]; buf[o + 3] = 255;
}
function hex(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
function bline(buf, x0, y0, x1, y1, col, thick = 1) {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 2 + 1;
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
    bput(buf, x, y, col); if (thick > 1) { bput(buf, x + 1, y, col); }
  }
}
function bblob(buf, cx, cy, rx, ry, col, colDark) {
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
    if (d <= 1) bput(buf, x, y, (colDark && (x - cx) + (y - cy) > 1.5) ? colDark : col);
  }
}
function outlineBuf(buf) {
  const out = new Uint8ClampedArray(buf);
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    const o = (y * 16 + x) * 4; if (buf[o + 3]) continue;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx > 15 || ny > 15) continue;
      if (buf[(ny * 16 + nx) * 4 + 3]) { out[o] = 22; out[o + 1] = 18; out[o + 2] = 22; out[o + 3] = 255; break; }
    }
  }
  return out;
}
function drawToolBuf(k, t) {
  const buf = newBuf(), T = TIERS[t], m = hex(T.mat), d = hex(T.dark), h = hex('#7a5a2e'), hd = hex('#54391a');
  if (k === 3) { // sword
    bline(buf, 4, 11, 13, 2, m, 1); bline(buf, 3, 12, 12, 3, m, 1);
    bline(buf, 5, 12, 13, 4, d); // shading
    bline(buf, 4, 8, 8, 12, hd); bline(buf, 3, 9, 7, 13, h);
    bline(buf, 2, 14, 4, 12, h);
  } else {
    bline(buf, 2, 14, 11, 5, h); bline(buf, 3, 14, 12, 5, hd);
    if (k === 5) { for (let i = 0; i < 7; i++) { bput(buf, 3 + i, 12 - i, hex('#c8c8d0')); bput(buf, 4 + i, 12 - i, hex('#8e8e98')); } bblob(buf, 11, 5, 2.6, 2.6, hex('#3a3a40'), hex('#1e1e22')); bput(buf, 10, 4, hex('#6a6a72')); bput(buf, 12, 6, hex('#ff9a2a')); bput(buf, 13, 7, hex('#ffd24a')); bput(buf, 3, 13, hex('#a0a0a8')); }
    else if (k === 4) { bline(buf, 4, 3, 11, 3, m); bline(buf, 4, 4, 4, 6, d); bline(buf, 5, 4, 11, 4, d); }
    else if (k === 0) { // pickaxe: arc
      for (let i = 0; i <= 20; i++) {
        const u = i / 20, x = (1 - u) * (1 - u) * 3 + 2 * u * (1 - u) * 9 + u * u * 15, y = (1 - u) * (1 - u) * 8 + 2 * u * (1 - u) * 0 + u * u * 8 + 0;
        bput(buf, x, y + (u < 0.5 ? 1 - u : 1 - (1 - u)) - 1, m); bput(buf, x, y + 1 + (u < 0.5 ? 1 - u : 1 - (1 - u)) - 1, d);
      }
    } else if (k === 1) { // axe
      bblob(buf, 10, 5, 4, 3.4, m, d); bline(buf, 8, 3, 6, 8, m); bline(buf, 12, 8, 13, 11, d);
    } else if (k === 2) { // shovel
      bblob(buf, 11.5, 3.5, 2.6, 3.4, m, d);
    }
  }
  return outlineBuf(buf);
}
function drawArmorBuf(kind, tier) {
  const buf = newBuf(), T = ARMOR_TIERS[tier], m = hex(T.col), d = hex(T.dark);
  const R = (x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) bput(buf, x, y, c); };
  if (kind === 0) { R(3, 4, 12, 8, m); R(3, 9, 5, 12, m); R(10, 9, 12, 12, m); R(4, 4, 11, 5, hex('#f4f4f4')); R(5, 7, 10, 8, d); }
  else if (kind === 1) { R(2, 2, 5, 6, m); R(10, 2, 13, 6, m); R(4, 3, 11, 14, m); R(6, 3, 9, 5, d); R(4, 10, 11, 14, d); R(4, 6, 11, 9, m); }
  else if (kind === 2) { R(3, 2, 12, 5, m); R(3, 6, 6, 14, m); R(9, 6, 12, 14, m); R(7, 6, 8, 8, d); R(3, 12, 6, 14, d); R(9, 12, 12, 14, d); }
  else { R(2, 7, 6, 12, m); R(9, 7, 13, 12, m); R(1, 11, 6, 13, d); R(9, 11, 14, 13, d); R(2, 7, 6, 8, hex('#f4f4f4')); R(9, 7, 13, 8, hex('#f4f4f4')); }
  return outlineBuf(buf);
}
function drawItemBuf(id) {
  const buf = newBuf();
  if (id === SEEDS) { for (const [x, y] of [[5, 6], [8, 5], [10, 8], [6, 9], [9, 11], [4, 11], [11, 5]]) { bput(buf, x, y, hex('#5a7a2a')); bput(buf, x + 1, y, hex('#3f5a1c')); } return outlineBuf(buf); }
  if (id === WHEAT) { bline(buf, 5, 14, 11, 3, hex('#c9a63a')); bline(buf, 6, 14, 12, 3, hex('#a3822a')); for (const [x, y] of [[9, 3], [10, 4], [8, 5], [11, 5], [9, 6], [10, 7]]) bput(buf, x, y, hex('#e6c85a')); return outlineBuf(buf); }
  if (id === BREAD) { for (let y = 5; y < 12; y++) for (let x = 2; x < 14; x++) { const r = ((x - 8) / 6) ** 2 + ((y - 8.5) / 3.6) ** 2; if (r <= 1) bput(buf, x, y, y < 7 ? hex('#d9a85a') : r > 0.75 ? hex('#8e5a22') : hex('#c48a3e')); } for (const x of [5, 8, 11]) bput(buf, x, 7, hex('#e8c078')); return outlineBuf(buf); }
  if (id === STRING) { bline(buf, 3, 4, 12, 5, hex('#e8e8e8')); bline(buf, 12, 5, 4, 9, hex('#dcdcdc')); bline(buf, 4, 9, 11, 12, hex('#e8e8e8')); return outlineBuf(buf); }
  if (id === BOW) { const w = hex('#8b6a35'), wd = hex('#5c4220'); for (let i = 0; i <= 12; i++) { const t = i / 12, x = 4 + Math.sin(t * Math.PI) * 5, y = 2 + t * 12; bput(buf, x, y, w); bput(buf, x + 1, y, wd); } bline(buf, 4, 2, 4, 14, hex('#e8e8e8')); return outlineBuf(buf); }
  const P = (x, y, c) => bput(buf, x, y, hex(c));
  if (id === STICK) { bline(buf, 3, 13, 12, 4, hex('#8b6a35')); bline(buf, 4, 13, 12, 5, hex('#5c4220')); }
  else if (id === COAL) { bblob(buf, 8, 8, 5, 4.4, hex('#2a2a2e'), hex('#141416')); P(6, 6, '#5a5a62'); P(7, 6, '#4a4a52'); P(10, 9, '#3a3a40'); }
  else if (id === IRON_INGOT || id === GOLD_INGOT) {
    const c = id === IRON_INGOT ? ['#e8e8e8', '#b8b8b8', '#8a8a8a'] : ['#fbe25a', '#dcb230', '#a87f18'];
    for (let y = 5; y < 11; y++) for (let x = 2 + (10 - y) * 0.5; x < 12 + (10 - y) * 0.5; x++) bput(buf, x, y, hex(y < 7 ? c[0] : y < 10 ? c[1] : c[2]));
  } else if (id === DIAMOND) {
    const g = [['#b8fff8', 8, 3, 9], ['#6ff0e6', 6, 5, 11], ['#2fc4c0', 4, 8, 13]];
    for (let y = 3; y <= 13; y++) { const half = y < 6 ? 2 + (y - 3) * 1.2 : 5.6 - (y - 6) * 0.65; for (let x = 8 - half; x <= 8 + half; x++) bput(buf, x, y, hex(y < 6 ? '#a8fff6' : (x < 8 ? '#5fe6dc' : '#2db8b4'))); }
  } else if (id === APPLE) { bblob(buf, 8, 9, 5, 4.8, hex('#d02a24'), hex('#8e1610')); P(6, 7, '#f27a6c'); bline(buf, 8, 5, 9, 2, hex('#5a3a1a')); P(10, 3, '#4a9a2a'); P(11, 3, '#4a9a2a'); }
  else if (id === PORK_RAW || id === PORK_COOKED || id === BEEF_RAW || id === BEEF_COOKED || id === MUTTON_RAW || id === MUTTON_COOKED) {
    const cooked = id === PORK_COOKED || id === BEEF_COOKED || id === MUTTON_COOKED;
    const col = id <= PORK_COOKED ? (cooked ? ['#a5673a', '#6e3d1c'] : ['#f0a0a0', '#c86a6a']) : id <= BEEF_COOKED ? (cooked ? ['#7a4022', '#4a2010'] : ['#c83a3a', '#8a1c1c']) : (cooked ? ['#a26a44', '#6a3e22'] : ['#e08a7a', '#a8503f']);
    bblob(buf, 8, 8, 5.4, 4.2, hex(col[0]), hex(col[1])); P(6, 6, '#ffffff'); P(10, 10, col[1]);
    if (!cooked) { P(5, 8, '#f8e6e6'); P(11, 7, '#f8e6e6'); }
  } else if (id === ROTTEN_FLESH) { bblob(buf, 8, 8, 5.2, 4.2, hex('#8c6a3a'), hex('#5a4020')); P(6, 7, '#5a8a3a'); P(9, 9, '#4a7a30'); P(10, 6, '#6a9a44'); }
  else if (id === GUNPOWDER) { for (const [x, y] of [[5, 9], [6, 8], [7, 9], [8, 8], [9, 9], [10, 8], [6, 10], [8, 10], [9, 10], [7, 7], [8, 7]]) P(x, y, ((x + y) & 1) ? '#5a5a5a' : '#3a3a3a'); }
  else if (id === BONE) { bline(buf, 4, 12, 12, 4, hex('#e8e4d0'), 1); bline(buf, 5, 12, 12, 5, hex('#c0bca8')); bblob(buf, 3.5, 12.5, 1.6, 1.6, hex('#e8e4d0')); bblob(buf, 12.5, 3.5, 1.6, 1.6, hex('#e8e4d0')); }
  else if (id === ARROW) { bline(buf, 3, 13, 12, 4, hex('#8b6a35')); bline(buf, 11, 3, 13, 5, hex('#bdbdbd')); P(3, 12, '#eee'); P(4, 13, '#eee'); }
  return outlineBuf(buf);
}
export function itemIcon(id) {
  if (iconCache.has(id)) return iconCache.get(id);
  let canvas;
  const it = ITEMS[id];
  if (id < 256 && BLOCKS[id]) canvas = blockIcon(BLOCKS[id]);
  else {
    const c = document.createElement('canvas'); c.width = c.height = 16;
    const ctx = c.getContext('2d'); const im = ctx.createImageData(16, 16);
    const buf = it && it.tool ? drawToolBuf(it.kind, it.tierIdx) : it && it.armor ? drawArmorBuf(it.armor.slot, it.armor.tier) : drawItemBuf(id);
    im.data.set(buf); ctx.putImageData(im, 0, 0);
    canvas = document.createElement('canvas'); canvas.width = canvas.height = 32;
    const c2 = canvas.getContext('2d'); c2.imageSmoothingEnabled = false; c2.drawImage(c, 0, 0, 32, 32);
  }
  iconCache.set(id, canvas); return canvas;
}
export function iconURL(id) {
  const c = itemIcon(id); if (!c._url) c._url = c.toDataURL(); return c._url;
}
