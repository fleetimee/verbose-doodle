// Town NPCs: housing validation, arrivals, wandering AI, dialogue and shops.
import { T, TILE, WALL, SOLID, EMIT } from './tiles.js';
import { tileAt, setTile, inB, furnOrigin } from './world.js';
import { moveBody, overlaps } from './physics.js';
import { totalCoins, countItem } from './items.js';

export const NPC_DEFS = {
  guide: {
    name: 'Rowan', title: 'the Pathfinder',
    look: { skin: '#e8b890', hair: 0, hairColor: '#6a4a2a', eyes: '#3a6a3a', shirt: '#6a8a3a', pants: '#5a4a3a', shoes: '#3a2a1a' },
    cond: () => true, buttons: ['Help', 'Crafting'],
    lines: [
      [null, 'Greetings, {p}. Is there something I can help you with?'],
      [null, 'A proper house needs a background wall, a door, a light, a table and a chair. Build one and settlers will come.'],
      [null, 'Ore gets rarer and tougher the deeper you dig: Copper, then Iron, Silver and Gold.'],
      [null, 'Gel and wood make torches. You will want a lot of torches.'],
      [G => !G.time.isDay, 'The dead walk at night. Stay near the light, or better yet, indoors.'],
      [G => G.time.bloodMoon, 'The moon is red tonight... keep your doors shut.'],
      [G => !G.flags.bosses.rotmaw, 'Break three Rot Orbs in the Blight and something ancient will come for you.'],
      [G => !G.flags.cryptOpen, 'An old warden guards the crypt by the sea. Ring its bell at night, if you dare.'],
      [G => G.flags.bosses.wall, 'You felled the Cinder Wall! This world will remember your name, {p}.'],
    ],
  },
  merchant: {
    name: 'Barnaby', title: 'the Peddler',
    look: { skin: '#f0c8a0', hair: 5, hairColor: '#e0e0e0', beard: '#e8e8e8', eyes: '#3a3a5a', shirt: '#8a6a3a', pants: '#5a4a3a', shoes: '#3a2a1a', hat: 'wide' },
    cond: G => totalCoins(G.player) >= 5000, buttons: ['Shop'],
    shop: [['torch', 50], ['wooden_arrow', 5], ['healing_tonic', 300], ['bottle', 20], ['glowcap', 100], ['empty_bucket', 1000], ['platform', 5]],
    lines: [
      [null, 'Buy low, sell... well, to me, at low.'],
      [null, 'Got coin? I have torches. And tonics. And more torches.'],
      [null, 'Treasures from Rot Orbs fetch a fine price, you know.'],
      [G => !G.time.isDay, 'Those shambling fellows never pay for anything.'],
    ],
  },
  nurse: {
    name: 'Maribel', title: 'the Medic',
    look: { skin: '#f8d0b0', hair: 1, hairColor: '#e070a0', eyes: '#5a3a8a', shirt: '#f4f4f4', pants: '#e8e8f0', shoes: '#f0f0f0', hat: 'nurse', cross: true },
    cond: G => G.player.maxHp > 100, buttons: ['Heal'],
    lines: [
      [null, 'Hold still, this won\'t hurt... much.'],
      [null, 'I charge for my services. Healing isn\'t cheap, you know.'],
      [G => G.player.hp < G.player.lifeMax * 0.4, 'You look terrible! Let me patch you up before you fall apart.'],
      [G => G.player.hp >= G.player.lifeMax, 'You\'re perfectly healthy. Come back when you\'ve done something reckless.'],
    ],
  },
  arms: {
    name: 'Dex', title: 'the Gunsmith',
    look: { skin: '#8a5a3a', hair: 0, hairColor: '#2a1a10', eyes: '#2a1a10', shirt: '#4a5a6a', pants: '#3a3a3a', shoes: '#2a2a2a', hat: 'cowboy' },
    cond: G => countItem(G.player, 'flintlock_popper') > 0 || countItem(G.player, 'lead_shot') > 0 || !!G.flags.bosses.omni, buttons: ['Shop'],
    shop: [['flintlock_popper', 20000], ['lead_shot', 7], ['flaming_arrow', 12]],
    lines: [
      [null, 'Lead shot, fresh from the mold. Want some?'],
      [null, 'A popper in hand is worth two in a chest.'],
      [G => G.time.bloodMoon, 'Perfect night for target practice.'],
      [null, 'Arrows are for folks who like waiting. Bullets are for folks who don\'t.'],
    ],
  },
  druid: {
    name: 'Fern', title: 'the Druid',
    look: { skin: '#f0d0a8', hair: 1, hairColor: '#4ab83a', eyes: '#2a6a2a', shirt: '#3a8a3a', pants: '#5a7a3a', shoes: '#4a3a1a', hat: 'leaf' },
    cond: G => Object.keys(G.flags.bosses).length > 0, buttons: ['Shop'],
    shop: [['acorn', 50], ['grass_seeds', 200], ['glowcap', 100], ['swiftness_tonic', 2000], ['ironskin_tonic', 2000]],
    lines: [
      [null, 'The trees whisper that the Blight is spreading.'],
      [null, 'Plant an acorn on grass and give it time. Patience is the forest\'s gift.'],
      [null, 'Nature has no love for the Cinder Wall that burns below.'],
      [G => G.flags.bosses.rotmaw, 'The Rotmaw is gone, yet the rot remains. Tend your land, {p}.'],
    ],
  },
};
export const NPC_ORDER = ['guide', 'merchant', 'nurse', 'arms', 'druid'];

// ------------------------------------------------------------------ housing
const blocks = t => SOLID[t] || t === T.PLATFORM || t === T.DOOR_OPEN;
const isDoorish = t => t === T.DOOR || t === T.DOOR_OPEN || t === T.PLATFORM;
export function checkRoom(G, sx, sy) {
  const wd = G.world;
  if (!inB(wd, sx, sy) || blocks(tileAt(wd, sx, sy))) return { ok: false, reason: 'This is not valid housing.', cells: [] };
  const seen = new Set(), stack = [sy * wd.w + sx], cells = [];
  let door = false, light = false, table = false, chair = false, badWall = false, open = false;
  while (stack.length) {
    const i = stack.pop();
    if (seen.has(i)) continue;
    seen.add(i);
    const x = i % wd.w, y = (i / wd.w) | 0;
    if (Math.abs(x - sx) > 40 || Math.abs(y - sy) > 30 || cells.length > 750) { open = true; break; }
    cells.push(i);
    const t = wd.tile[i], td = TILE[t];
    if (!WALL[wd.wall[i]] || !WALL[wd.wall[i]].house) badWall = true;
    if (EMIT[t]) light = true;
    if (td && td.table) table = true;
    if (td && td.chair) chair = true;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (!inB(wd, nx, ny)) { open = true; continue; }
      const j = ny * wd.w + nx, nt = wd.tile[j];
      if (blocks(nt)) { if (isDoorish(nt)) door = true; continue; }
      if (!seen.has(j)) stack.push(j);
    }
  }
  let reason = null;
  if (open) reason = 'This space is not enclosed.';
  else if (cells.length < 40) reason = 'This room is too small.';
  else if (badWall) reason = 'This room is missing a background wall.';
  else if (!door) reason = 'This room needs a door.';
  else if (!light) reason = 'This room needs a light source.';
  else if (!table) reason = 'This room needs a table.';
  else if (!chair) reason = 'This room needs a chair.';
  return { ok: !reason, reason: reason || 'This housing is suitable.', cells, key: Math.min(...cells.slice(0, 800)) };
}
function roomFloor(G, room) {
  const wd = G.world;
  let best = null, bd = 1e9;
  const cx = room.cells.reduce((a, i) => a + (i % wd.w), 0) / room.cells.length;
  for (const i of room.cells) {
    const x = i % wd.w, y = (i / wd.w) | 0, b = wd.tile[i + wd.w];
    if ((SOLID[b] || b === T.PLATFORM) && !blocks(wd.tile[i - wd.w]) && !blocks(wd.tile[i - 2 * wd.w])) {
      const d = Math.abs(x - cx);
      if (d < bd) { bd = d; best = [x, y]; }
    }
  }
  return best;
}
function occupant(G, room) {
  const wd = G.world, set = new Set(room.cells);
  return G.npcs.find(n => n.home && set.has(n.home[1] * wd.w + n.home[0])) || null;
}
export function roomOccupant(G, room) { return occupant(G, room); }

function vacantRooms(G) {
  const wd = G.world, p = G.player, out = [], keys = new Set();
  const cx = Math.floor((p.x + 10) / 16), cy = Math.floor((p.y + 20) / 16);
  for (let y = Math.max(1, cy - 50); y < Math.min(wd.h - 1, cy + 50); y++) for (let x = Math.max(1, cx - 90); x < Math.min(wd.w - 1, cx + 90); x++) {
    const t = wd.tile[y * wd.w + x];
    if ((t !== T.DOOR && t !== T.DOOR_OPEN) || ((wd.meta[y * wd.w + x] >> 2) & 3) !== 1) continue;
    for (const dx of [-1, 1]) {
      if (blocks(tileAt(wd, x + dx, y))) continue;
      const r = checkRoom(G, x + dx, y);
      if (!r.ok || keys.has(r.key) || occupant(G, r)) continue;
      keys.add(r.key);
      const f = roomFloor(G, r);
      if (f) { r.floor = f; out.push(r); }
    }
  }
  return out;
}

export function spawnNPC(G, key, tx, ty) {
  const n = { key, d: NPC_DEFS[key], x: tx * 16 + 8 - 9, y: (ty + 1) * 16 - 40 - 0.01, w: 18, h: 40, vx: 0, vy: 0, dir: 1, onGround: false, stepUp: true, drop: 0, t: 0, walk: -1, home: null, door: null, talking: 0 };
  n.px = n.x; n.py = n.y;
  G.npcs.push(n);
  return n;
}

export function tryArrivals(G) {
  for (const n of G.npcs) if (n.home) { const r = checkRoom(G, n.home[0], n.home[1]); if (!r.ok) { n.home = null; G.msg(n.d.name + ' ' + n.d.title + ' has lost their home.', '#c8c8c8'); } }
  const rooms = vacantRooms(G);
  if (!rooms.length) return;
  const homeless = G.npcs.find(n => !n.home);
  if (homeless) {
    const r = rooms.shift();
    homeless.home = r.floor;
    G.msg(homeless.d.name + ' ' + homeless.d.title + ' has moved in.', '#50ff96');
    if (Math.abs(homeless.x / 16 - r.floor[0]) > 40) { homeless.x = r.floor[0] * 16 + 8 - 9; homeless.y = (r.floor[1] + 1) * 16 - 40.01; homeless.px = homeless.x; homeless.py = homeless.y; }
    return;
  }
  for (const key of NPC_ORDER) {
    if (G.npcs.some(n => n.key === key)) continue;
    const d = NPC_DEFS[key];
    if (!d.cond(G)) continue;
    const r = rooms.shift();
    const n = spawnNPC(G, key, r.floor[0], r.floor[1]);
    n.home = r.floor;
    G.msg(d.name + ' ' + d.title + ' has arrived!', '#50ff96');
    return;
  }
}

// ------------------------------------------------------------------ AI
function setDoor(G, ox, oy, open, flip) {
  for (let k = 0; k < 3; k++) setTile(G.world, ox, oy + k, open ? T.DOOR_OPEN : T.DOOR, (k << 2) | (flip << 4));
}
export function updateNPCs(G) {
  const wd = G.world, p = G.player;
  let town = 0;
  for (const n of G.npcs) {
    n.px = n.x; n.py = n.y;
    if (n.home && Math.abs(n.home[0] * 16 - p.x) < 800 && Math.abs(n.home[1] * 16 - p.y) < 600) town++;
    const talking = G.ui.talk === n;
    if (talking) { n.dir = p.x > n.x ? 1 : -1; n.vx = 0; }
    else {
      if (--n.t <= 0) {
        if (Math.random() < 0.45) { n.vx = 0; n.t = 60 + Math.random() * 200; }
        else { n.dir = Math.random() < 0.5 ? -1 : 1; n.vx = n.dir * 0.8; n.t = 60 + Math.random() * 160; }
      }
      if (n.home) {
        const hx = n.home[0] * 16 + 8, range = G.time.isDay ? 14 * 16 : 3 * 16;
        if (Math.abs(n.x + 9 - hx) > range) { n.dir = hx > n.x ? 1 : -1; if (n.vx === 0) n.t = 0; n.vx = n.dir * 0.8; }
        const far = Math.abs(n.x - p.x) > 1200 || Math.abs(n.y - p.y) > 800;
        if (far && (Math.abs(n.x + 9 - hx) > 60 * 16 || !G.time.isDay)) { n.x = hx - 9; n.y = (n.home[1] + 1) * 16 - 40.01; n.vx = 0; n.vy = 0; }
      } else {
        const hx = wd.spawnX * 16;
        if (Math.abs(n.x - hx) > 20 * 16) { n.dir = hx > n.x ? 1 : -1; n.vx = n.dir * 0.8; }
      }
    }
    n.vy = Math.min(n.vy + 0.4, 10);
    const ovx = n.vx;
    moveBody(wd, n);
    if (n.hitX && ovx) {
      const fx = Math.floor((n.x + (ovx > 0 ? n.w + 2 : -2)) / 16), fy = Math.floor((n.y + n.h - 8) / 16);
      const t = tileAt(wd, fx, fy);
      if (t === T.DOOR) { const [ox, oy] = furnOrigin(wd, fx, fy); setDoor(G, ox, oy, true, ovx > 0 ? 0 : 1); n.door = [ox, oy, 90]; }
      else if (n.onGround) { n.dir = -n.dir; n.vx = n.dir * 0.8; }
      else n.vx = ovx;
    } else n.vx = ovx;
    if (n.door && --n.door[2] <= 0) {
      const [ox, oy] = n.door, r = { x: ox * 16, y: oy * 16, w: 16, h: 48 };
      if (tileAt(wd, ox, oy) === T.DOOR_OPEN && !overlaps(r, n) && !overlaps(r, p)) setDoor(G, ox, oy, false, 0);
      if (!overlaps(r, n)) n.door = null; else n.door[2] = 20;
    }
    n.walk = n.onGround && Math.abs(n.vx) > 0.1 ? (n.walk < 0 ? 0 : n.walk) + Math.abs(n.vx) * 0.17 : -1;
  }
  G.townNPCs = town;
  if (G.ui.talk && (Math.abs(G.ui.talk.x - p.x) > 220 || Math.abs(G.ui.talk.y - p.y) > 160 || p.dead)) G.ui.talk = null;
}

// ------------------------------------------------------------------ dialogue / services
export function npcTalk(G, n) {
  const opts = n.d.lines.filter(([c]) => !c || c(G));
  let s = opts[Math.floor(Math.random() * opts.length)][1];
  if (!n.home && Math.random() < 0.5) s = 'I could use a place to stay. Build me a house, would you?';
  return s.replace(/\{p\}/g, G.player.name);
}
export function guideHint(G) {
  const F = G.flags.bosses, p = G.player;
  if (!G.npcs.some(n => n.key === 'guide' && n.home)) return 'Build a house first! Surround a room with blocks, fill it with a background wall, then add a door, a torch, a table and a chair.';
  if (!F.monarch && !F.omni && p.maxHp >= 120) return 'Feeling brave? Craft a Gel Crown from 25 Gel and 4 Iron Bars at an anvil. The Gel Monarch will come bouncing.';
  if (!F.omni) {
    if (p.maxHp < 160) return 'Explore the caves for Life Crystals, and smelt ore into bars at a Furnace. An Iron Anvil lets you forge better gear.';
    return 'When you feel strong, craft a Gazing Idol from 6 Lenses and 2 Copper Bars, and use it at night to face the Omnivisor.';
  }
  if (!F.rotmaw) return 'Smash three Rot Orbs deep in the Blight\'s chasms with a hammer to summon the Rotmaw Devourer. Blightstone needs an Iron pickaxe or better.';
  if (!F.rimehorn && Math.random() < 0.5) return 'Something huge stalks the snowfields. An Antler Idol made from Ice, Lenses and Demonite Ore would call it out, if you dare. Keep a light handy.';
  if (!F.warden) return 'The Old Crypt stands near the sea. Ring the Grave Bell beside its door at night to challenge the Ossuary Warden.';
  if (!F.wall) return 'Forge a Rotfang Pickaxe from Demonite Bars and Rot Scales, mine Hellstone in the underworld, smelt it at a Hellforge, then craft a Cinder Effigy and use it down there.';
  return 'You have done it all. Build, explore, and enjoy your world!';
}
export function shopFor(G, n) {
  return (n.d.shop || []).map(([id, price]) => ({ id, price }));
}
export function nurseCost(G) {
  const p = G.player, miss = p.lifeMax - p.hp;
  const debuffs = p.buffs.filter(b => b.id === 'fire' || b.id === 'poison' || b.id === 'chill').length;
  const mult = 1 + Object.keys(G.flags.bosses).length * 0.5;
  return Math.ceil((miss * 12 + debuffs * 100) * mult);
}
