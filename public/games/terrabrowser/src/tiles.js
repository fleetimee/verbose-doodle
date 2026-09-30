// Tile + wall definitions. Tile ids are indexes into TILE.
export const T = {
  AIR: 0, DIRT: 1, GRASS: 2, STONE: 3, SAND: 4, SNOW: 5, ICE: 6, MUD: 7, JGRASS: 8, ASH: 9,
  BLIGHT: 10, BGRASS: 11, ORE1: 12, ORE2: 13, ORE3: 14, ORE4: 15, ORE5: 16, SCORIA: 17, CRYPT: 18,
  WOOD: 19, PLATFORM: 20, TORCH: 21, TREE: 22, CACTUS: 23, DOOR: 24, DOOR_OPEN: 25, WORKBENCH: 26,
  FURNACE: 27, ANVIL: 28, ALEMBIC: 29, FORGE: 30, CHEST: 31, TABLE: 32, CHAIR: 33, BED: 34, POT: 35,
  ORB: 36, CRYSTAL: 37, VINE: 38, PLANT: 39, GLOWCAP: 40, SAPLING: 41, GLASS: 42, CRYPT_DOOR: 43,
  BELL: 44, CLOUD: 45, EMBER: 46, SANDSTONE: 47, ORE6: 48,
};

// tex: procedural texture style; pal: [light, mid, dark, accent]
const D = [];
function def(id, o) {
  D[id] = Object.assign({
    name: '', solid: false, hp: 50, minPick: 0, tool: 'pick', drop: null, light: null,
    map: [0, 0, 0], tex: null, pal: null, grass: null, furn: null, instant: false, sound: 'dig',
  }, o);
}
def(T.AIR, { name: 'Air' });
def(T.DIRT, { name: 'Dirt', solid: true, hp: 50, drop: 'dirt', map: [151, 107, 75], tex: 'dirt', pal: ['#b88a64', '#976b4b', '#6b4a33', '#5a3d2a'] });
def(T.GRASS, { name: 'Grass', solid: true, hp: 50, drop: 'dirt', map: [40, 176, 60], tex: 'dirt', pal: ['#b88a64', '#976b4b', '#6b4a33', '#5a3d2a'], grass: ['#6fdc52', '#33a83e', '#1f6b2a'] });
def(T.STONE, { name: 'Stone', solid: true, hp: 100, drop: 'stone', map: [128, 128, 136], tex: 'stone', pal: ['#a3a3ad', '#7d7d86', '#55555e', '#44444c'], sound: 'stone' });
def(T.SAND, { name: 'Sand', solid: true, hp: 50, drop: 'sand', map: [211, 192, 131], tex: 'sand', pal: ['#ecdca4', '#d3c083', '#b09a5c', '#9a8450'] });
def(T.SNOW, { name: 'Snow', solid: true, hp: 50, drop: 'snow', map: [232, 240, 248], tex: 'sand', pal: ['#ffffff', '#e4edf6', '#b8c8dc', '#a0b4cc'] });
def(T.ICE, { name: 'Ice', solid: true, hp: 80, drop: 'ice', map: [159, 211, 242], tex: 'ice', pal: ['#dff4fe', '#9fd3f2', '#6aa8d8', '#4f8cc0'], sound: 'stone' });
def(T.MUD, { name: 'Mud', solid: true, hp: 50, drop: 'mud', map: [92, 69, 53], tex: 'dirt', pal: ['#7a5d4c', '#5c4535', '#3e2e24', '#33251c'] });
def(T.JGRASS, { name: 'Jungle Grass', solid: true, hp: 50, drop: 'mud', map: [110, 194, 60], tex: 'dirt', pal: ['#7a5d4c', '#5c4535', '#3e2e24', '#33251c'], grass: ['#a6e85e', '#6ec23c', '#3f8a24'] });
def(T.ASH, { name: 'Ash', solid: true, hp: 60, drop: 'ash', map: [90, 81, 87], tex: 'sand', pal: ['#786e76', '#5a5157', '#3c3539', '#2e282b'] });
def(T.BLIGHT, { name: 'Blightstone', solid: true, hp: 150, minPick: 45, drop: 'blightstone', map: [110, 90, 134], tex: 'stone', pal: ['#8d77a8', '#6e5a86', '#4a3a5e', '#3a2c4c'], sound: 'stone' });
def(T.BGRASS, { name: 'Blightgrass', solid: true, hp: 50, drop: 'dirt', map: [154, 111, 200], tex: 'dirt', pal: ['#b88a64', '#976b4b', '#6b4a33', '#5a3d2a'], grass: ['#c7a0ec', '#9a6fc8', '#6a46a0'] });
def(T.ORE1, { name: 'Copper Ore', solid: true, hp: 150, minPick: 0, drop: 'copper_ore', map: [224, 144, 78], tex: 'ore', pal: ['#a3a3ad', '#7d7d86', '#55555e', '#f0a060', '#c06a30'], sound: 'stone' });
def(T.ORE2, { name: 'Iron Ore', solid: true, hp: 170, minPick: 35, drop: 'iron_ore', map: [160, 136, 114], tex: 'ore', pal: ['#a3a3ad', '#7d7d86', '#55555e', '#d6bea4', '#8a6c52'], sound: 'stone' });
def(T.ORE3, { name: 'Silver Ore', solid: true, hp: 200, minPick: 45, drop: 'silver_ore', map: [196, 206, 222], tex: 'ore', pal: ['#a3a3ad', '#7d7d86', '#55555e', '#f4f8ff', '#a4b0c2'], sound: 'stone' });
def(T.ORE4, { name: 'Gold Ore', solid: true, hp: 230, minPick: 55, drop: 'gold_ore', map: [240, 204, 72], tex: 'ore', pal: ['#a3a3ad', '#7d7d86', '#55555e', '#ffe878', '#d0a020'], sound: 'stone' });
def(T.ORE5, { name: 'Hellstone', solid: true, hp: 250, minPick: 100, drop: 'hellstone_ore', map: [255, 96, 40], tex: 'ore', pal: ['#5a4a4a', '#3c3032', '#261e20', '#ff8a3a', '#c8341a'], light: [0.7, 0.28, 0.1], sound: 'stone' });
def(T.SCORIA, { name: 'Scoria', solid: true, hp: 250, minPick: 55, drop: 'scoria', map: [46, 34, 56], tex: 'stone', pal: ['#4a3a5a', '#2e2238', '#1a1222', '#140e1a'], sound: 'stone' });
def(T.CRYPT, { name: 'Crypt Brick', solid: true, hp: 200, minPick: 65, drop: 'crypt_brick', map: [79, 95, 138], tex: 'brick', pal: ['#6d7fae', '#4f5f8a', '#333f60', '#252e48'], sound: 'stone', locked: true });
def(T.WOOD, { name: 'Wood', solid: true, hp: 80, drop: 'wood', map: [168, 115, 63], tex: 'plank', pal: ['#c48a52', '#a8733f', '#7a5230', '#5e3e24'], sound: 'wood' });
def(T.PLATFORM, { name: 'Platform', platform: true, hp: 30, drop: 'platform', map: [168, 115, 63], sound: 'wood' });
def(T.TORCH, { name: 'Torch', hp: 1, instant: true, drop: 'torch', map: [253, 221, 3], light: [1.0, 0.78, 0.5], tool: 'any', sound: 'wood' });
def(T.TREE, { name: 'Tree', hp: 100, tool: 'axe', drop: 'wood', map: [151, 107, 75], sound: 'wood' });
def(T.CACTUS, { name: 'Cactus', hp: 60, tool: 'axe', drop: 'cactus', map: [73, 170, 48], sound: 'wood' });
def(T.DOOR, { name: 'Door', solid: true, hp: 60, tool: 'any', drop: 'door', furn: { w: 1, h: 3 }, map: [119, 105, 79], door: true, sound: 'wood' });
def(T.DOOR_OPEN, { name: 'Door', hp: 60, tool: 'any', drop: 'door', furn: { w: 1, h: 3 }, map: [119, 105, 79], door: true, sound: 'wood' });
def(T.WORKBENCH, { name: 'Workbench', hp: 40, tool: 'any', drop: 'workbench', furn: { w: 2, h: 1 }, map: [191, 142, 111], station: 'workbench', table: true, sound: 'wood' });
def(T.FURNACE, { name: 'Furnace', hp: 60, tool: 'any', drop: 'furnace', furn: { w: 3, h: 2 }, map: [140, 140, 140], station: 'furnace', light: [0.8, 0.45, 0.2], sound: 'stone' });
def(T.ANVIL, { name: 'Anvil', hp: 60, tool: 'any', drop: 'anvil', furn: { w: 2, h: 1 }, map: [120, 130, 140], station: 'anvil', sound: 'stone' });
def(T.ALEMBIC, { name: 'Alembic Table', hp: 40, tool: 'any', drop: 'alembic', furn: { w: 2, h: 2 }, map: [191, 142, 111], station: 'alembic', table: true, sound: 'wood' });
def(T.FORGE, { name: 'Hellforge', hp: 80, tool: 'any', drop: 'hellforge', furn: { w: 3, h: 2 }, map: [180, 70, 40], station: 'forge', light: [1.0, 0.45, 0.2], sound: 'stone' });
def(T.CHEST, { name: 'Chest', hp: 40, tool: 'any', drop: 'chest', furn: { w: 2, h: 2 }, map: [174, 129, 80], sound: 'wood' });
def(T.TABLE, { name: 'Table', hp: 40, tool: 'any', drop: 'table', furn: { w: 3, h: 2 }, map: [191, 142, 111], table: true, sound: 'wood' });
def(T.CHAIR, { name: 'Chair', hp: 40, tool: 'any', drop: 'chair', furn: { w: 1, h: 2 }, map: [191, 142, 111], chair: true, sound: 'wood' });
def(T.BED, { name: 'Bed', hp: 40, tool: 'any', drop: 'bed', furn: { w: 4, h: 2 }, map: [191, 142, 111], chair: true, sound: 'wood' });
def(T.POT, { name: 'Pot', hp: 1, tool: 'any', furn: { w: 2, h: 2 }, map: [150, 110, 90], sound: 'pot' });
def(T.ORB, { name: 'Rot Orb', hp: 1, tool: 'hammer', furn: { w: 2, h: 2 }, map: [180, 90, 220], light: [0.6, 0.25, 0.85], sound: 'orb' });
def(T.CRYSTAL, { name: 'Life Crystal', hp: 60, tool: 'pick', drop: 'life_crystal', furn: { w: 2, h: 2 }, map: [240, 60, 90], light: [0.6, 0.15, 0.25], sound: 'glass' });
def(T.VINE, { name: 'Vine', hp: 1, instant: true, tool: 'any', map: [30, 140, 40] });
def(T.PLANT, { name: 'Plant', hp: 1, instant: true, tool: 'any', map: [40, 176, 60] });
def(T.GLOWCAP, { name: 'Glowcap', hp: 1, instant: true, tool: 'any', drop: 'glowcap', map: [90, 140, 255], light: [0.15, 0.3, 0.7] });
def(T.SAPLING, { name: 'Sapling', hp: 1, instant: true, tool: 'any', drop: 'acorn', map: [40, 176, 60] });
def(T.GLASS, { name: 'Glass', solid: true, hp: 30, drop: 'glass', map: [190, 230, 245], tex: 'glass', pal: ['#f4fcff', '#bfe6f5', '#7fb8d0', '#5a98b4'], sound: 'glass' });
def(T.CRYPT_DOOR, { name: 'Sealed Crypt Door', solid: true, hp: 999, tool: 'none', furn: { w: 1, h: 3 }, map: [60, 70, 100], sound: 'stone', locked: true });
def(T.BELL, { name: 'Grave Bell', hp: 999, tool: 'none', furn: { w: 1, h: 2 }, map: [150, 150, 120], sound: 'stone' });
def(T.CLOUD, { name: 'Cloud', solid: true, hp: 30, drop: 'cloud', map: [230, 236, 250], tex: 'cloud', pal: ['#ffffff', '#eef2fc', '#c8d4ea', '#aab8d4'] });
def(T.EMBER, { name: 'Emberbrick', solid: true, hp: 200, minPick: 65, drop: 'emberbrick', map: [122, 58, 42], tex: 'brick', pal: ['#9a5038', '#7a3a2a', '#4e2218', '#3a180f'], sound: 'stone' });
def(T.ORE6, { name: 'Demonite Ore', solid: true, hp: 240, minPick: 60, drop: 'demonite_ore', map: [112, 88, 176], tex: 'ore', pal: ['#8d77a8', '#6e5a86', '#4a3a5e', '#b88cff', '#5a2aa8'], sound: 'stone' });
def(T.SANDSTONE, { name: 'Sandstone', solid: true, hp: 100, drop: 'sandstone', map: [201, 162, 102], tex: 'stone', pal: ['#dcb880', '#c9a266', '#9a7a48', '#846638'], sound: 'stone' });
export const TILE = D;

export const SOLID = new Uint8Array(64);
export const PLATFORM_T = T.PLATFORM;
for (let i = 0; i < D.length; i++) if (D[i] && D[i].solid) SOLID[i] = 1;

export const isSolid = t => SOLID[t] === 1;
export const isFurn = t => !!(D[t] && D[t].furn);
export const isGrass = t => t === T.GRASS || t === T.JGRASS || t === T.BGRASS;
// decorative tiles removed when their support disappears
export const NEEDS_GROUND = new Set([T.PLANT, T.GLOWCAP, T.SAPLING]);

export const W = {
  NONE: 0, DIRT: 1, STONE: 2, MUD: 3, SNOW: 4, SAND: 5, BLIGHT: 6, CRYPT: 7, ASH: 8,
  WOOD: 9, STONEB: 10, FENCE: 11, EMBER: 12, SANDSTONE: 13,
};
const WD = [];
function wdef(id, o) { WD[id] = Object.assign({ name: '', natural: true, drop: null, house: false, col: '#000', tex: 'rough' }, o); }
wdef(W.NONE, { name: 'None' });
wdef(W.DIRT, { name: 'Dirt Wall', col: '#4a3424' });
wdef(W.STONE, { name: 'Stone Wall', col: '#3a3a40' });
wdef(W.MUD, { name: 'Mud Wall', col: '#33261d' });
wdef(W.SNOW, { name: 'Snow Wall', col: '#6f7f95' });
wdef(W.SAND, { name: 'Sand Wall', col: '#7a6a45' });
wdef(W.BLIGHT, { name: 'Blight Wall', col: '#352a45' });
wdef(W.CRYPT, { name: 'Crypt Wall', col: '#232b44', tex: 'brick' });
wdef(W.ASH, { name: 'Ash Wall', col: '#2a2427' });
wdef(W.WOOD, { name: 'Wood Wall', natural: false, drop: 'wood_wall', house: true, col: '#5e4028', tex: 'plank' });
wdef(W.STONEB, { name: 'Stone Brick Wall', natural: false, drop: 'stone_wall', house: true, col: '#44444c', tex: 'brick' });
wdef(W.FENCE, { name: 'Wood Fence', natural: false, drop: 'fence', house: false, col: '#7a5230', tex: 'fence' });
wdef(W.EMBER, { name: 'Ember Wall', col: '#3a1a12', tex: 'brick' });
wdef(W.SANDSTONE, { name: 'Sandstone Wall', col: '#6e5634' });
export const WALL = WD;

// light emission table for fast lookup
export const EMIT = D.map(d => d && d.light ? d.light : null);
