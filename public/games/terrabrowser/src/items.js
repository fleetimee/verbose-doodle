// Items, recipes, loot tables and inventory helpers.
import { CFG } from './config.js';
import { T, W } from './tiles.js';

export const ITEMS = {};
function add(id, o) { ITEMS[id] = Object.assign({ id, name: id, stack: 999, rar: 0, val: 0, spr: { tpl: 'chunk', pal: 'stone' } }, o); }

// ---------- blocks & materials
const blk = (id, name, tile, extra = {}) => add(id, Object.assign({ name, place: tile, spr: { tile }, val: 0, tip: '' }, extra));
blk('dirt', 'Dirt Block', T.DIRT);
blk('stone', 'Stone Block', T.STONE);
blk('wood', 'Wood', T.WOOD, { tip: 'A sturdy building material' });
blk('sand', 'Sand Block', T.SAND);
blk('snow', 'Snow Block', T.SNOW);
blk('ice', 'Ice Block', T.ICE);
blk('mud', 'Mud Block', T.MUD);
blk('ash', 'Ash Block', T.ASH);
blk('blightstone', 'Blightstone', T.BLIGHT);
blk('sandstone', 'Sandstone Block', T.SANDSTONE);
blk('glass', 'Glass', T.GLASS);
blk('scoria', 'Scoria', T.SCORIA, { tip: 'Forged where water meets fire', val: 20 });
blk('crypt_brick', 'Crypt Brick', T.CRYPT);
blk('emberbrick', 'Emberbrick', T.EMBER);
blk('cloud', 'Cloud', T.CLOUD);
add('cactus', { name: 'Cactus', spr: { tpl: 'cactus' }, val: 5, tip: 'Prickly' });
add('gel', { name: 'Gel', spr: { tpl: 'gel', pal: 'gel' }, val: 1, tip: 'Both tasty and flammable' });
add('lens', { name: 'Lens', spr: { tpl: 'lens', pal: 'lens' }, val: 100 });
add('bone', { name: 'Bone', spr: { tpl: 'bone', pal: 'bone' }, val: 50 });
add('rotten_chunk', { name: 'Rotten Chunk', spr: { tpl: 'gel', pal: 'rot' }, val: 10, tip: 'It smells awful' });
add('rot_scale', { name: 'Rot Scale', spr: { tpl: 'scale', pal: 'rot' }, rar: 1, val: 300, tip: 'Shed by the Rotmaw Devourer' });
add('fallen_star', { name: 'Fallen Star', spr: { tpl: 'star', pal: 'star' }, val: 500, rar: 1, tip: 'Disappears after the sunrise', light: [0.8, 0.8, 0.4] });
add('glowcap', { name: 'Glowcap', spr: { tpl: 'mush', pal: 'glow' }, val: 20, tip: 'A softly glowing mushroom' });
add('acorn', { name: 'Acorn', spr: { tpl: 'acorn', pal: 'wood' }, val: 0, place: T.SAPLING, tip: 'Plant it on grass' });
add('grass_seeds', { name: 'Grass Seeds', spr: { tpl: 'seeds', pal: 'grass' }, val: 20, seeds: true, tip: 'Plants grass on dirt' });
add('bottle', { name: 'Bottle', spr: { tpl: 'potion', pal: 'glassb' }, val: 20 });
add('heart_pickup', { name: 'Heart', spr: { tpl: 'heart', pal: 'heart' }, pickupHeal: 20 });

// ---------- ores & bars
// [id, name, value, tile, rarity]
const ORES = [['copper', 'Copper', 50, T.ORE1, 0], ['iron', 'Iron', 100, T.ORE2, 0], ['silver', 'Silver', 200, T.ORE3, 1], ['gold', 'Gold', 400, T.ORE4, 1], ['demonite', 'Demonite', 600, T.ORE6, 2], ['hellstone', 'Hellstone', 800, T.ORE5, 3]];
ORES.forEach(([id, nm, v, tile, rar]) => {
  add(id + '_ore', { name: nm + ' Ore', place: tile, spr: { tpl: 'ore', pal: id }, val: v, rar: rar > 1 ? rar : 0 });
  add(id + '_bar', { name: nm + ' Bar', spr: { tpl: 'bar', pal: id }, val: v * 3, rar });
});

// ---------- placeables
const fur = (id, name, tile, val, tip = '') => add(id, { name, place: tile, spr: { furn: tile }, val, tip, stack: 99 });
fur('workbench', 'Workbench', T.WORKBENCH, 30, 'Used for basic crafting');
fur('furnace', 'Furnace', T.FURNACE, 60, 'Used for smelting ore');
fur('anvil', 'Iron Anvil', T.ANVIL, 500, 'Used to craft items from metal bars');
fur('alembic', 'Alembic Table', T.ALEMBIC, 200, 'Used to brew tonics');
fur('hellforge', 'Hellforge', T.FORGE, 2000, 'Hot enough to smelt Hellstone');
fur('chest', 'Chest', T.CHEST, 100, 'Stores items');
fur('table', 'Table', T.TABLE, 60);
fur('chair', 'Chair', T.CHAIR, 30);
fur('bed', 'Bed', T.BED, 400, 'Right-click to set your spawn point');
fur('door', 'Door', T.DOOR, 40, 'Right-click to open or close');
add('torch', { name: 'Torch', place: T.TORCH, spr: { tpl: 'torch', pal: 'torch' }, val: 10, light: [1.0, 0.78, 0.5], tip: 'Provides light' });
add('platform', { name: 'Wood Platform', place: T.PLATFORM, spr: { tpl: 'platform', pal: 'wood' }, val: 1, tip: 'Hold Down to drop through' });
add('wood_wall', { name: 'Wood Wall', wall: W.WOOD, spr: { wall: W.WOOD }, val: 1 });
add('stone_wall', { name: 'Stone Brick Wall', wall: W.STONEB, spr: { wall: W.STONEB }, val: 1 });
add('fence', { name: 'Wood Fence', wall: W.FENCE, spr: { wall: W.FENCE }, val: 1 });

// ---------- tools & tier gear (generated from CFG.tiers)
CFG.tiers.forEach((tr, i) => {
  const r = tr.rar, v = tr.val;
  add(tr.id + '_sword', { name: tr.name + ' Broadsword', spr: { tpl: 'sword', pal: tr.pal }, stack: 1, rar: r, val: v * 8, melee: true, swing: true, auto: true, dmg: tr.sword.dmg, ut: tr.sword.ut, kb: tr.sword.kb, crit: 4, len: tr.sword.len });
  add(tr.id + '_pickaxe', { name: tr.name + ' Pickaxe', spr: { tpl: 'pick', pal: tr.pal }, stack: 1, rar: r, val: v * 12, melee: true, swing: true, auto: true, pick: tr.pick.pow, dmg: tr.pick.dmg, ut: tr.pick.ut, kb: 2, crit: 4, len: 30 });
  add(tr.id + '_axe', { name: tr.name + ' Axe', spr: { tpl: 'axe', pal: tr.pal }, stack: 1, rar: r, val: v * 9, melee: true, swing: true, auto: true, axe: tr.axe.pow, dmg: tr.axe.dmg, ut: tr.axe.ut, kb: 4.5, crit: 4, len: 30 });
  if (tr.bow) add(tr.id + '_bow', { name: tr.name + ' Bow', spr: { tpl: 'bow', pal: tr.pal }, stack: 1, rar: r, val: v * 7, ranged: true, ammo: 'arrow', dmg: tr.bow.dmg, ut: tr.bow.ut, kb: 1, crit: 4, vel: tr.bow.vel, auto: true });
  const ar = tr.armor;
  add(tr.id + '_helm', { name: tr.name + ' Helmet', spr: { tpl: 'helm', pal: tr.pal }, stack: 1, rar: r, val: v * 10, slot: 0, def: ar[0], set: tr.id });
  add(tr.id + '_mail', { name: tr.name + ' Chainmail', spr: { tpl: 'mail', pal: tr.pal }, stack: 1, rar: r, val: v * 16, slot: 1, def: ar[1], set: tr.id });
  add(tr.id + '_greaves', { name: tr.name + ' Greaves', spr: { tpl: 'greaves', pal: tr.pal }, stack: 1, rar: r, val: v * 12, slot: 2, def: ar[2], set: tr.id });
});
const ca = CFG.molten.armor;
add('molten_helm', { name: 'Molten Helmet', spr: { tpl: 'helm', pal: 'hellstone' }, stack: 1, rar: 3, val: 30000, slot: 0, def: ca[0], set: 'molten' });
add('molten_mail', { name: 'Molten Breastplate', spr: { tpl: 'mail', pal: 'hellstone' }, stack: 1, rar: 3, val: 40000, slot: 1, def: ca[1], set: 'molten' });
add('molten_greaves', { name: 'Molten Greaves', spr: { tpl: 'greaves', pal: 'hellstone' }, stack: 1, rar: 3, val: 35000, slot: 2, def: ca[2], set: 'molten' });

export const SET_BONUS = {
  copper: { def: CFG.tiers[0].setDef, text: '+2 defense' },
  iron: { def: CFG.tiers[1].setDef, text: '+3 defense' },
  silver: { def: CFG.tiers[2].setDef, crit: 5, text: '+4 defense, +5% critical chance' },
  gold: { def: CFG.tiers[3].setDef, dmg: 0.08, text: '+5 defense, +8% damage' },
  molten: { def: 6, dmg: CFG.molten.dmgBonus, fireImmune: 1, text: '+6 defense, +12% damage, immune to fire' },
};

add('wooden_sword', { name: 'Wooden Sword', spr: { tpl: 'sword', pal: 'wood' }, stack: 1, val: 100, melee: true, swing: true, auto: false, dmg: 7, ut: 25, kb: 5, crit: 4, len: 30 });
add('wooden_mallet', { name: 'Wooden Mallet', spr: { tpl: 'hammer', pal: 'wood' }, stack: 1, val: 100, melee: true, swing: true, auto: true, hammer: 25, dmg: 4, ut: 30, kb: 5.5, crit: 4, len: 30, tip: 'Breaks walls and Rot Orbs' });
add('rotfang_pickaxe', { name: 'Rotfang Pickaxe', spr: { tpl: 'pick', pal: 'rot' }, stack: 1, rar: 2, val: 18000, melee: true, swing: true, auto: true, pick: 100, dmg: 12, ut: 15, kb: 3, crit: 4, len: 32, tip: 'Able to mine Hellstone' });
add('rotfang_cleaver', { name: 'Rotfang Cleaver', spr: { tpl: 'sword', pal: 'rot' }, stack: 1, rar: 2, val: 20000, melee: true, swing: true, auto: true, dmg: 24, ut: 20, kb: 6, crit: 6, len: 44 });
add('cryptblade', { name: 'Cryptblade', spr: { tpl: 'sword', pal: 'crypt' }, stack: 1, rar: 2, val: 25000, melee: true, swing: true, auto: true, dmg: 17, ut: 12, kb: 3, crit: 8, len: 40, tip: 'Whispers of the old crypt' });
add('fiery_greatsword', { name: 'Fiery Greatsword', spr: { tpl: 'sword', pal: 'hellstone' }, stack: 1, rar: 3, val: 40000, melee: true, swing: true, auto: true, dmg: 32, ut: 22, kb: 6.5, crit: 6, len: 48, inflict: ['fire', 240], tip: 'Sets enemies ablaze' });
add('slimy_saber', { name: 'Slimy Saber', spr: { tpl: 'sword', pal: 'royal' }, stack: 1, rar: 1, val: 8000, melee: true, swing: true, auto: true, dmg: 14, ut: 19, kb: 5.5, crit: 6, len: 38, tip: 'Still a little sticky' });
add('frostbrand', { name: 'Frostbrand', spr: { tpl: 'sword', pal: 'ice' }, stack: 1, rar: 2, val: 24000, melee: true, swing: true, auto: true, dmg: 26, ut: 19, kb: 6, crit: 6, len: 46, tip: 'Carved from the Rimehorn\'s antler' });
add('wallbreaker', { name: 'Wallbreaker', spr: { tpl: 'sword', pal: 'wall' }, stack: 1, rar: 4, val: 80000, melee: true, swing: true, auto: true, dmg: 48, ut: 20, kb: 7, crit: 10, len: 56, inflict: ['fire', 300], tip: 'Carved from the heart of the Cinder Wall' });
add('wooden_bow', { name: 'Wooden Bow', spr: { tpl: 'bow', pal: 'wood' }, stack: 1, val: 100, ranged: true, ammo: 'arrow', dmg: 4, ut: 30, kb: 0, crit: 4, vel: 6.6, auto: false });
add('ocular_bow', { name: 'Ocular Bow', spr: { tpl: 'bow', pal: 'eye' }, stack: 1, rar: 2, val: 15000, ranged: true, ammo: 'arrow', dmg: 15, ut: 22, kb: 2, crit: 6, vel: 10, auto: true, tip: 'It keeps looking at you' });
add('flintlock_popper', { name: 'Flintlock Popper', spr: { tpl: 'gun', pal: 'gun' }, stack: 1, rar: 1, val: 20000, ranged: true, ammo: 'bullet', dmg: 12, ut: 22, kb: 1.5, crit: 8, vel: 12, auto: false });
add('gyre_boomerang', { name: 'Gyre Boomerang', spr: { tpl: 'boomer', pal: 'wood' }, stack: 1, rar: 1, val: 5000, melee: true, throwBoom: true, dmg: 10, ut: 18, kb: 6, crit: 4, vel: 9, tip: 'Comes back to you' });
add('spark_wand', { name: 'Spark Wand', spr: { tpl: 'wand', pal: 'spark' }, stack: 1, rar: 1, val: 3000, magic: true, mana: 4, shoot: 'spark', dmg: 9, ut: 22, kb: 2, crit: 4, vel: 7, auto: true });
add('starlight_wand', { name: 'Starlight Wand', spr: { tpl: 'wand', pal: 'silver' }, stack: 1, rar: 2, val: 12000, magic: true, mana: 6, shoot: 'starbolt', dmg: 16, ut: 20, kb: 3, crit: 4, vel: 9, auto: true });
add('tidecaller_staff', { name: 'Tidecaller Staff', spr: { tpl: 'staff', pal: 'tide' }, stack: 1, rar: 2, val: 20000, magic: true, mana: 6, shoot: 'tide', dmg: 20, ut: 18, kb: 3, crit: 4, vel: 7, auto: true, tip: 'Bolts bounce off walls' });
add('boneshard_staff', { name: 'Boneshard Staff', spr: { tpl: 'staff', pal: 'bone' }, stack: 1, rar: 3, val: 30000, magic: true, mana: 7, shoot: 'boneshard', dmg: 22, ut: 16, kb: 3, crit: 6, vel: 10, auto: true, multi: 3 });
add('wooden_arrow', { name: 'Wooden Arrow', spr: { tpl: 'arrow', pal: 'wood' }, val: 5, ammoType: 'arrow', dmg: 5, proj: 'arrow' });
add('flaming_arrow', { name: 'Flaming Arrow', spr: { tpl: 'arrow', pal: 'fire' }, val: 10, ammoType: 'arrow', dmg: 7, proj: 'flame_arrow', rar: 0 });
add('lead_shot', { name: 'Lead Shot', spr: { tpl: 'bullet', pal: 'silver' }, val: 7, ammoType: 'bullet', dmg: 7, proj: 'bullet' });
add('grappling_hook', { name: 'Grappling Hook', spr: { tpl: 'hook', pal: 'iron' }, stack: 1, val: 2000, hook: true, tip: 'Press E to grapple toward the cursor' });
add('empty_bucket', { name: 'Empty Bucket', spr: { tpl: 'bucket', pal: 'iron' }, stack: 99, val: 200, bucket: 0, tip: 'Scoop up liquids' });
add('water_bucket', { name: 'Water Bucket', spr: { tpl: 'bucket', pal: 'water' }, stack: 99, val: 200, bucket: 1 });
add('lava_bucket', { name: 'Lava Bucket', spr: { tpl: 'bucket', pal: 'lava' }, stack: 99, val: 200, bucket: 2 });

// ---------- accessories
const acc = (id, name, pal, tpl, eff, rar, val, tip) => add(id, { name, spr: { tpl, pal }, stack: 1, acc: eff, rar, val, tip });
acc('cloud_flask', 'Cloud in a Flask', 'cloud', 'flask', { doubleJump: 1 }, 1, 10000, 'Allows a double jump');
acc('swiftstep_boots', 'Swiftstep Boots', 'boots', 'boots', { speed: 0.35 }, 1, 10000, 'The wearer can run much faster');
acc('featherfall_charm', 'Featherfall Charm', 'sky', 'charm', { noFall: 1 }, 1, 10000, 'Negates fall damage');
acc('glowstone_pendant', 'Glowstone Pendant', 'glow', 'pendant', { light: 1 }, 1, 8000, 'Provides light around you');
acc('band_of_vigor', 'Band of Vigor', 'vigor', 'band', { regen: 1 }, 1, 10000, 'Slowly regenerates life');
acc('visor_shield', 'Visor Shield', 'eye', 'shield', { def: 3, kbImmune: 1 }, 2, 20000, 'Grants immunity to knockback');
acc('royal_gel', 'Royal Gel', 'royal', 'gel', { slimeFriend: 1 }, 1, 10000, 'Slimes become friendly');
acc('glacial_eye', 'Glacial Eye', 'ice', 'pendant', { def: 3, dreadImmune: 1, chillImmune: 1 }, 2, 20000, 'Immune to Dread and Chilled');
acc('emberheart', 'Emberheart', 'hellstone', 'heart', { maxHp: 20, regen: 1 }, 4, 50000, 'Its warmth keeps you going');
acc('ashen_emblem', 'Ashen Emblem', 'ash', 'emblem', { dmg: 0.15 }, 4, 50000, '15% increased damage');

// ---------- consumables
const con = (id, name, spr, o) => add(id, Object.assign({ name, spr, stack: 30, consume: true }, o));
con('healing_tonic', 'Healing Tonic', { tpl: 'potion', pal: 'heal' }, { heal: 60, val: 300, tip: 'Restores 60 life' });
con('mana_tonic', 'Mana Tonic', { tpl: 'potion', pal: 'mana' }, { manaRestore: 100, val: 250, tip: 'Restores 100 mana' });
con('ironskin_tonic', 'Ironskin Tonic', { tpl: 'potion', pal: 'ironskin' }, { buff: ['ironskin', 18000], val: 1000, rar: 1, tip: 'Increases defense by 8' });
con('swiftness_tonic', 'Swiftness Tonic', { tpl: 'potion', pal: 'swift' }, { buff: ['swift', 18000], val: 1000, rar: 1, tip: '25% increased movement speed' });
con('shine_tonic', 'Shine Tonic', { tpl: 'potion', pal: 'shine' }, { buff: ['shine', 18000], val: 1000, rar: 1, tip: 'Emits an aura of light' });
con('life_crystal', 'Life Crystal', { tpl: 'crystal', pal: 'heart' }, { maxHp: 20, val: 7500, rar: 2, stack: 99, tip: 'Permanently increases maximum life by 20' });
con('mana_crystal', 'Mana Crystal', { tpl: 'crystal', pal: 'mana' }, { maxMana: 20, val: 2500, rar: 2, stack: 99, tip: 'Permanently increases maximum mana by 20' });
con('gel_crown', 'Gel Crown', { tpl: 'crown', pal: 'gold' }, { summon: 'monarch', val: 2000, rar: 1, stack: 20, tip: 'Summons the Gel Monarch' });
con('antler_idol', 'Antler Idol', { tpl: 'antler', pal: 'antler' }, { summon: 'rimehorn', val: 3000, rar: 1, stack: 20, tip: 'Summons the Rimehorn in the snow' });
con('gazing_idol', 'Gazing Idol', { tpl: 'idol', pal: 'eye' }, { summon: 'omni', val: 2000, rar: 1, stack: 20, tip: 'Summons the Omnivisor at night' });
con('rotting_bait', 'Rotting Bait', { tpl: 'bait', pal: 'rot' }, { summon: 'rotmaw', val: 2000, rar: 1, stack: 20, tip: 'Summons the Rotmaw Devourer in the Blight' });
con('cinder_effigy', 'Cinder Effigy', { tpl: 'idol', pal: 'hellstone' }, { summon: 'wall', val: 5000, rar: 3, stack: 20, tip: 'Summons the Cinder Wall in the underworld' });

// ---------- coins
add('coin_bit', { name: 'Copper Coin', spr: { tpl: 'coin', pal: 'copper' }, stack: 100, coin: 1, val: 1 });
add('coin_mark', { name: 'Silver Coin', spr: { tpl: 'coin', pal: 'silver' }, stack: 100, coin: 100, val: 100 });
add('coin_crown', { name: 'Gold Coin', spr: { tpl: 'coin', pal: 'gold' }, stack: 100, coin: 10000, val: 10000 });
add('coin_star', { name: 'Platinum Coin', spr: { tpl: 'coin', pal: 'platinum' }, stack: 999, coin: 1000000, val: 1000000 });
export const COIN_IDS = ['coin_bit', 'coin_mark', 'coin_crown', 'coin_star'];

export const BUFFS = {
  ironskin: { name: 'Ironskin', desc: '+8 defense', col: '#b8c4d0' },
  swift: { name: 'Swiftness', desc: '25% increased movement speed', col: '#60e0a0' },
  shine: { name: 'Shine', desc: 'Emitting light', col: '#ffe070' },
  sick: { name: 'Tonic Sickness', desc: 'Cannot drink healing tonics', col: '#a05050', debuff: true },
  fire: { name: 'On Fire!', desc: 'Slowly losing life', col: '#ff7020', debuff: true },
  poison: { name: 'Poisoned', desc: 'Slowly losing life', col: '#70c040', debuff: true },
  chill: { name: 'Chilled', desc: 'Movement speed reduced', col: '#80c0ff', debuff: true },
  dread: { name: 'Dread', desc: 'The darkness closes in', col: '#6a3aa0', debuff: true },
};

// ---------- recipes
export const RECIPES = [];
const rc = (out, n, st, ing) => RECIPES.push({ out, n, st, ing });
rc('torch', 3, null, [['gel', 1], ['wood', 1]]);
rc('platform', 2, null, [['wood', 1]]);
rc('workbench', 1, null, [['wood', 10]]);
rc('mana_crystal', 1, null, [['fallen_star', 5]]);
rc('wooden_sword', 1, 'workbench', [['wood', 7]]);
rc('wooden_bow', 1, 'workbench', [['wood', 10]]);
rc('wooden_mallet', 1, 'workbench', [['wood', 8]]);
rc('wooden_arrow', 10, 'workbench', [['wood', 1], ['stone', 1]]);
rc('flaming_arrow', 10, 'workbench', [['wooden_arrow', 10], ['torch', 1]]);
rc('wood_wall', 4, 'workbench', [['wood', 1]]);
rc('fence', 4, 'workbench', [['wood', 1]]);
rc('stone_wall', 4, 'workbench', [['stone', 1]]);
rc('door', 1, 'workbench', [['wood', 6]]);
rc('chair', 1, 'workbench', [['wood', 4]]);
rc('table', 1, 'workbench', [['wood', 8]]);
rc('bed', 1, 'workbench', [['wood', 15], ['gel', 5]]);
rc('chest', 1, 'workbench', [['wood', 8], ['iron_bar', 2]]);
rc('furnace', 1, 'workbench', [['stone', 20], ['wood', 4], ['torch', 3]]);
rc('anvil', 1, 'workbench', [['iron_bar', 5]]);
rc('alembic', 1, 'workbench', [['glass', 4], ['wood', 8]]);
rc('rotting_bait', 1, 'workbench', [['rotten_chunk', 10]]);
rc('spark_wand', 1, 'workbench', [['wood', 10], ['fallen_star', 3], ['gel', 5]]);
rc('glass', 1, 'furnace', [['sand', 2]]);
rc('bottle', 2, 'furnace', [['glass', 1]]);
CFG.tiers.forEach(tr => {
  rc(tr.id + '_bar', 1, 'furnace', [[tr.id + '_ore', 3]]);
  rc(tr.id + '_sword', 1, 'anvil', [[tr.id + '_bar', 8]]);
  rc(tr.id + '_pickaxe', 1, 'anvil', [[tr.id + '_bar', 12], ['wood', 4]]);
  rc(tr.id + '_axe', 1, 'anvil', [[tr.id + '_bar', 9], ['wood', 3]]);
  if (tr.bow) rc(tr.id + '_bow', 1, 'anvil', [[tr.id + '_bar', 7]]);
  rc(tr.id + '_helm', 1, 'anvil', [[tr.id + '_bar', 10]]);
  rc(tr.id + '_mail', 1, 'anvil', [[tr.id + '_bar', 16]]);
  rc(tr.id + '_greaves', 1, 'anvil', [[tr.id + '_bar', 12]]);
});
rc('grappling_hook', 1, 'anvil', [['iron_bar', 5]]);
rc('empty_bucket', 1, 'anvil', [['iron_bar', 3]]);
rc('gazing_idol', 1, 'anvil', [['lens', 6], ['copper_bar', 2]]);
rc('gel_crown', 1, 'anvil', [['gel', 25], ['iron_bar', 4]]);
rc('antler_idol', 1, 'workbench', [['ice', 20], ['lens', 5], ['demonite_ore', 5]]);
rc('starlight_wand', 1, 'anvil', [['silver_bar', 10], ['fallen_star', 3]]);
rc('demonite_bar', 1, 'furnace', [['demonite_ore', 3]]);
rc('rotfang_pickaxe', 1, 'anvil', [['demonite_bar', 12], ['rot_scale', 6]]);
rc('rotfang_cleaver', 1, 'anvil', [['demonite_bar', 10], ['rot_scale', 5]]);
rc('hellforge', 1, 'anvil', [['furnace', 1], ['scoria', 10], ['hellstone_ore', 10]]);
rc('healing_tonic', 2, 'alembic', [['bottle', 1], ['gel', 2], ['glowcap', 1]]);
rc('mana_tonic', 2, 'alembic', [['bottle', 1], ['fallen_star', 1], ['glowcap', 1]]);
rc('ironskin_tonic', 1, 'alembic', [['bottle', 1], ['glowcap', 1], ['iron_ore', 1]]);
rc('swiftness_tonic', 1, 'alembic', [['bottle', 1], ['glowcap', 1], ['cactus', 1]]);
rc('shine_tonic', 1, 'alembic', [['bottle', 1], ['glowcap', 1], ['gel', 1]]);
rc('hellstone_bar', 1, 'forge', [['hellstone_ore', 3], ['scoria', 1]]);
rc('fiery_greatsword', 1, 'forge', [['hellstone_bar', 15]]);
rc('molten_helm', 1, 'forge', [['hellstone_bar', 10]]);
rc('molten_mail', 1, 'forge', [['hellstone_bar', 16]]);
rc('molten_greaves', 1, 'forge', [['hellstone_bar', 12]]);
rc('cinder_effigy', 1, 'forge', [['bone', 15], ['hellstone_bar', 3]]);
export const STATION_NAMES = { workbench: 'Workbench', furnace: 'Furnace', anvil: 'Anvil', alembic: 'Alembic Table', forge: 'Hellforge' };

// mark materials
for (const r of RECIPES) for (const [id] of r.ing) if (ITEMS[id]) ITEMS[id].material = true;

// ---------- loot tables
const CHEST_LOOT = {
  surface: { main: ['cloud_flask', 'swiftstep_boots', 'gyre_boomerang', 'glowstone_pendant', 'spark_wand'], bars: ['copper_bar', 'iron_bar'], coin: [30, 150] },
  cavern: { main: ['cloud_flask', 'swiftstep_boots', 'band_of_vigor', 'glowstone_pendant', 'gyre_boomerang'], bars: ['silver_bar', 'gold_bar'], coin: [150, 600] },
  sky: { main: ['featherfall_charm', 'cloud_flask', 'starlight_wand'], bars: ['gold_bar'], coin: [300, 800] },
  crypt: { main: ['cryptblade', 'tidecaller_staff', 'band_of_vigor', 'cloud_flask'], bars: ['gold_bar'], coin: [800, 2500] },
  hell: { main: ['swiftstep_boots', 'band_of_vigor', 'glowstone_pendant'], bars: ['hellstone_bar'], coin: [1500, 4000] },
};
export function chestLoot(kind, rng) {
  const L = CHEST_LOOT[kind], out = [];
  out.push({ id: rng.pick(L.main), n: 1 });
  if (rng.chance(0.6)) out.push({ id: rng.pick(L.bars), n: rng.int(4, 10) });
  if (rng.chance(0.7)) out.push({ id: 'torch', n: rng.int(8, 20) });
  if (rng.chance(0.6)) out.push({ id: 'healing_tonic', n: rng.int(1, 4) });
  if (rng.chance(0.5)) out.push({ id: rng.chance(0.5) ? 'wooden_arrow' : 'flaming_arrow', n: rng.int(20, 50) });
  if (rng.chance(0.25)) out.push({ id: 'lead_shot', n: rng.int(20, 40) });
  if (rng.chance(0.4)) out.push({ id: rng.pick(['ironskin_tonic', 'swiftness_tonic', 'shine_tonic']), n: rng.int(1, 2) });
  if (kind === 'sky' && rng.chance(0.8)) out.push({ id: 'fallen_star', n: rng.int(2, 5) });
  if (kind === 'crypt' && rng.chance(0.8)) out.push({ id: 'bone', n: rng.int(5, 12) });
  for (const c of coinsToItems(rng.int(L.coin[0], L.coin[1]))) out.push(c);
  return out;
}
export function potLoot(depth, rng) {
  // depth: 0 surface/underground, 1 cavern, 2 hell, 3 crypt
  const r = rng.next(), m = [1, 3, 6, 5][depth];
  if (r < 0.15) return [{ id: 'healing_tonic', n: 1 }];
  if (r < 0.35) return [{ id: 'torch', n: rng.int(3, 8) }];
  if (r < 0.5) return [{ id: depth > 0 ? 'flaming_arrow' : 'wooden_arrow', n: rng.int(10, 20) }];
  if (r < 0.55) return [{ id: 'heart_pickup', n: 1 }];
  return coinsToItems(Math.floor(rng.int(20, 200) * m));
}
export const BOSS_LOOT = {
  monarch: [['royal_gel', 1, 1, 1], ['slimy_saber', 1, 1, 0.66], ['gel', 30, 60, 1], ['healing_tonic', 3, 6, 1]],
  rimehorn: [['frostbrand', 1, 1, 1], ['glacial_eye', 1, 1, 0.66], ['ice', 30, 60, 1], ['healing_tonic', 5, 10, 1]],
  omni: [['demonite_ore', 30, 60, 1], ['visor_shield', 1, 1, 1], ['ocular_bow', 1, 1, 0.5], ['lens', 3, 6, 1], ['healing_tonic', 5, 10, 1]],
  rotmaw: [['rot_scale', 20, 30, 1], ['demonite_ore', 30, 60, 1], ['rotten_chunk', 10, 20, 1], ['healing_tonic', 5, 10, 1]],
  warden: [['boneshard_staff', 1, 1, 1], ['bone', 15, 30, 1], ['healing_tonic', 5, 10, 1]],
  wall: [['wallbreaker', 1, 1, 1], ['emberheart', 1, 1, 1], ['ashen_emblem', 1, 1, 1], ['healing_tonic', 10, 15, 1]],
};

// ---------- coins
export function coinsToItems(v) {
  v = Math.floor(v); const out = [];
  const s = Math.floor(v / 1000000); v -= s * 1000000;
  const g = Math.floor(v / 10000); v -= g * 10000;
  const m = Math.floor(v / 100); v -= m * 100;
  if (s) out.push({ id: 'coin_star', n: s });
  if (g) out.push({ id: 'coin_crown', n: g });
  if (m) out.push({ id: 'coin_mark', n: m });
  if (v) out.push({ id: 'coin_bit', n: v });
  return out;
}
export function coinText(v) {
  if (v <= 0) return 'nothing';
  const parts = [], names = [['Platinum', 1000000], ['Gold', 10000], ['Silver', 100], ['Copper', 1]];
  for (const [nm, u] of names) { const c = Math.floor(v / u); if (c) { parts.push(c + ' ' + nm); v -= c * u; } }
  return parts.join(' ');
}

// ---------- inventory helpers (player.inv: 50 slots, player.coins: 4 slots)
export function maxStack(id) { return ITEMS[id] ? ITEMS[id].stack : 999; }
export function totalCoins(p) {
  let v = 0;
  for (const s of p.coins) if (s) v += ITEMS[s.id].coin * s.n;
  for (const s of p.inv) if (s && ITEMS[s.id].coin) v += ITEMS[s.id].coin * s.n;
  return v;
}
export function setCoins(p, v) {
  for (let i = 0; i < p.inv.length; i++) if (p.inv[i] && ITEMS[p.inv[i].id].coin) p.inv[i] = null;
  p.coins = [null, null, null, null];
  const s = Math.floor(v / 1000000); v -= s * 1000000;
  const g = Math.floor(v / 10000); v -= g * 10000;
  const m = Math.floor(v / 100); v -= m * 100;
  if (v) p.coins[0] = { id: 'coin_bit', n: v };
  if (m) p.coins[1] = { id: 'coin_mark', n: m };
  if (g) p.coins[2] = { id: 'coin_crown', n: g };
  if (s) p.coins[3] = { id: 'coin_star', n: s };
}
export function payCoins(p, cost) {
  const t = totalCoins(p);
  if (t < cost) return false;
  setCoins(p, t - cost);
  return true;
}
// returns leftover count
export function addItem(p, id, n) {
  const d = ITEMS[id];
  if (!d) return 0;
  if (d.coin) { setCoins(p, totalCoins(p) + d.coin * n); return 0; }
  const ms = d.stack;
  for (let i = 0; i < 50 && n > 0; i++) {
    const s = p.inv[i];
    if (s && s.id === id && s.n < ms) { const k = Math.min(ms - s.n, n); s.n += k; n -= k; }
  }
  for (let i = 0; i < 50 && n > 0; i++) {
    if (!p.inv[i]) { const k = Math.min(ms, n); p.inv[i] = { id, n: k }; n -= k; }
  }
  return n;
}
export function canFit(p, id) {
  const d = ITEMS[id];
  if (!d) return false;
  if (d.coin) return true;
  for (let i = 0; i < 50; i++) { const s = p.inv[i]; if (!s || (s.id === id && s.n < d.stack)) return true; }
  return false;
}
export function countItem(p, id) {
  let c = 0;
  for (const s of p.inv) if (s && s.id === id) c += s.n;
  return c;
}
export function removeItem(p, id, n) {
  for (let i = 49; i >= 0 && n > 0; i--) {
    const s = p.inv[i];
    if (s && s.id === id) { const k = Math.min(s.n, n); s.n -= k; n -= k; if (!s.n) p.inv[i] = null; }
  }
  return n === 0;
}
export function canCraft(p, r, stations) {
  if (r.st && !stations.has(r.st)) return false;
  for (const [id, n] of r.ing) if (countItem(p, id) < n) return false;
  return true;
}
export function craftableList(p, stations) {
  const out = [];
  for (let i = 0; i < RECIPES.length; i++) if (canCraft(p, RECIPES[i], stations)) out.push(i);
  return out;
}
export function recipesFor(id) {
  return RECIPES.filter(r => r.out === id || r.ing.some(g => g[0] === id));
}

// ---------- save migration (ore tiers were renamed to their classic names)
const OLD_TIER = { brassine: 'copper', grelite: 'iron', veridium: 'silver', aurelium: 'gold' };
const OLD_IDS = { cindrite_ore: 'hellstone_ore', cindrite_bar: 'hellstone_bar', cindrite_helm: 'molten_helm', cindrite_mail: 'molten_mail', cindrite_greaves: 'molten_greaves', cindrite_blade: 'fiery_greatsword', cinder_forge: 'hellforge' };
export function migrateId(id) {
  if (ITEMS[id]) return id;
  if (OLD_IDS[id]) return OLD_IDS[id];
  const m = /^(brassine|grelite|veridium|aurelium)_(.+)$/.exec(id || '');
  const nid = m && OLD_TIER[m[1]] + '_' + m[2];
  return nid && ITEMS[nid] ? nid : null;
}
// renames old ids in place; slots holding unknown items are cleared so they can't crash lookups
export function migrateSlots(arr) {
  if (!arr) return arr;
  for (let i = 0; i < arr.length; i++) if (arr[i]) { const id = migrateId(arr[i].id); arr[i] = id ? Object.assign(arr[i], { id }) : null; }
  return arr;
}
export function migrateChar(ch) {
  if (ch) for (const k of ['inv', 'coins', 'armor', 'acc']) migrateSlots(ch[k]);
  return ch;
}

// ---------- world item drops + buffs
export function dropItem(G, id, n, x, y, vx, vy) {
  if (!n || !ITEMS[id]) return null;
  const it = { id, n, x: x - 6, y: y - 6, w: 12, h: 12, vx: vx != null ? vx : (Math.random() - 0.5) * 3, vy: vy != null ? vy : -2 - Math.random() * 2, t: 0, onGround: false, px: x - 6, py: y - 6 };
  G.items.push(it);
  return it;
}
export function addBuff(p, id, t) {
  const st = p.stats || {};
  if ((id === 'fire' && st.fireImmune) || (id === 'chill' && st.chillImmune) || (id === 'dread' && st.dreadImmune)) return;
  const b = p.buffs.find(q => q.id === id);
  if (b) b.t = Math.max(b.t, t); else p.buffs.push({ id, t });
}
