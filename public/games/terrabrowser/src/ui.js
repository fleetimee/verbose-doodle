// UI: HUD, inventory/chests/crafting/equipment, tooltips, minimap + world map, chat, NPC dialogue/shops,
// housing query, pause/settings/death screens, and all pre-game menus. Immediate-mode: draw registers
// click regions, the next update tick resolves clicks against them.
import { CFG } from './config.js';
import { TILE, WALL } from './tiles.js';
import { ITEMS, RECIPES, BUFFS, STATION_NAMES, SET_BONUS, craftableList, canCraft, removeItem, addItem, countItem, totalCoins, payCoins, setCoins, coinText, dropItem, recipesFor } from './items.js';
import { drawHumanoid, HAIR_STYLES, mk } from './sprites.js';
import { recalcStats, inReach, interact } from './player.js';
import { checkRoom, roomOccupant, guideHint, shopFor, nurseCost } from './npcs.js';
import { renderTitleBg } from './renderer.js';
import { audio } from './audio.js';

const SL = 44, PITCH = 48, X0 = 20, Y0 = 26;
const FONT = '"Trebuchet MS", Verdana, sans-serif';

export function createUI() {
  return {
    inv: false, cursor: null, chest: null, talk: null, talkText: '', shop: false, guide: false, guideSlot: [null],
    map: false, mapZoom: 4, mapC: [800, 200], drag: null, pause: false, settings: false, slider: null,
    craftSel: 0, craftScroll: 0, craftList: [], craftT: 0, stations: new Set(),
    regs: [], overUI: false, consumed: false, wheelUsed: false, hover: null,
    housingMode: false, housingView: null, tileCursor: null, mini: { show: true, zoom: 2 }, typing: false, trash: [null],
  };
}

// ------------------------------------------------------------------ drawing helpers
export function text(ctx, s, x, y, col = '#fff', size = 16, align = 'left') {
  ctx.font = `bold ${size}px ${FONT}`; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2.5, size / 5); ctx.strokeStyle = 'rgba(0,0,0,0.92)';
  ctx.strokeText(s, x, y); ctx.fillStyle = col; ctx.fillText(s, x, y);
}
function rrect(ctx, x, y, w, h, r, fill, stroke, lw = 2) {
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw; ctx.stroke(); }
}
function panel(ctx, x, y, w, h) { rrect(ctx, x, y, w, h, 8, 'rgba(33,45,110,0.88)', '#101838', 3); }
function wrap(ctx, s, maxW, size) {
  ctx.font = `bold ${size}px ${FONT}`;
  const words = s.split(' '), lines = [];
  let cur = '';
  for (const w of words) { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t; }
  if (cur) lines.push(cur);
  return lines;
}
function reg(G, x, y, w, h, click, o = {}) { G.ui.regs.push(Object.assign({ x, y, w, h, click }, o)); }
const hov = (G, x, y, w, h) => { const m = G.input.mouse; return m.x >= x && m.x < x + w && m.y >= y && m.y < y + h; };

function drawSlot(G, ctx, x, y, it, o = {}) {
  const sel = o.sel, s = o.size || SL;
  rrect(ctx, x, y, s, s, 6, sel ? 'rgba(236,212,60,0.92)' : o.bg || 'rgba(56,72,160,0.8)', sel ? '#6a5a08' : '#141c46', 2);
  if (o.label && !it) { ctx.globalAlpha = 0.35; ctx.drawImage(G.S.items[o.label], x + s / 2 - 12, y + s / 2 - 12, 24, 24); ctx.globalAlpha = 1; }
  if (it) {
    const sc = s >= 40 ? 2 : 1.5;
    ctx.drawImage(G.S.items[it.id], Math.round(x + s / 2 - 8 * sc), Math.round(y + s / 2 - 8 * sc), 16 * sc, 16 * sc);
    if (it.n > 1) text(ctx, String(it.n), x + 5, y + s - 5, '#fff', s >= 40 ? 13 : 11);
  }
  if (o.num != null) text(ctx, String(o.num), x + 4, y + 13, sel ? '#fff' : '#d8d8e8', 11);
}

// ------------------------------------------------------------------ tooltips
const speedText = ut => ut <= 8 ? 'Insanely fast speed' : ut <= 20 ? 'Very fast speed' : ut <= 25 ? 'Fast speed' : ut <= 30 ? 'Average speed' : ut <= 35 ? 'Slow speed' : ut <= 45 ? 'Very slow speed' : 'Extremely slow speed';
const kbText = k => k <= 0 ? 'No knockback' : k <= 1.5 ? 'Extremely weak knockback' : k <= 3 ? 'Very weak knockback' : k <= 4 ? 'Weak knockback' : k <= 6 ? 'Average knockback' : k <= 7 ? 'Strong knockback' : k <= 9 ? 'Very strong knockback' : 'Extremely strong knockback';
function itemLines(G, it, extra) {
  const d = ITEMS[it.id], p = G.player, L = [];
  L.push([d.name + (it.n > 1 ? ' (' + it.n + ')' : ''), CFG.rarity[d.rar] || '#fff']);
  if (d.dmg && !d.ammoType) {
    const kind = d.melee ? 'melee' : d.ranged ? 'ranged' : 'magic';
    L.push([Math.round(d.dmg * (1 + p.stats.dmg)) + ' ' + kind + ' damage', '#fff']);
    L.push([(d.crit || 4) + p.stats.crit + '% critical strike chance', '#fff']);
    L.push([speedText(d.ut), '#fff']);
    L.push([kbText(d.kb || 0), '#fff']);
  }
  if (d.ammoType) { L.push([d.dmg + ' ranged damage', '#fff']); L.push(['Ammo', '#fff']); }
  if (d.pick) L.push([d.pick + '% pickaxe power', '#fff']);
  if (d.axe) L.push([d.axe * 5 + '% axe power', '#fff']);
  if (d.hammer) L.push([d.hammer + '% hammer power', '#fff']);
  if (d.mana) L.push(['Uses ' + d.mana + ' mana', '#fff']);
  if (d.def) L.push([d.def + ' defense', '#fff']);
  if (d.slot != null || d.acc) L.push(['Equipable', '#fff']);
  if (d.place != null || d.wall != null) L.push(['Can be placed', '#fff']);
  if (d.consume) L.push(['Consumable', '#fff']);
  if (d.heal) L.push(['Restores ' + d.heal + ' life', '#fff']);
  if (d.material) L.push(['Material', '#fff']);
  if (d.tip) L.push([d.tip, '#b4d2ff']);
  if (d.set) {
    const full = p.armor.every(a => a && ITEMS[a.id].set === d.set);
    if (full) L.push(['Set bonus: ' + SET_BONUS[d.set].text, '#96ff96']);
  }
  if (extra) for (const e of extra) L.push(e);
  else if (G.ui.shop && d.val && !d.coin) L.push(['Sell price: ' + coinText(Math.floor(d.val / 5) * it.n), '#e8c850']);
  return L;
}
function drawTooltip(G, ctx, lines) {
  const m = G.input.mouse;
  let w = 0;
  ctx.font = `bold 15px ${FONT}`;
  for (const [s] of lines) w = Math.max(w, ctx.measureText(s).width);
  let x = m.x + 20, y = m.y + 20;
  const h = lines.length * 19 + 10;
  if (x + w + 16 > G.R.W) x = m.x - w - 24;
  if (y + h > G.R.H) y = G.R.H - h - 4;
  rrect(ctx, x - 6, y - 4, w + 14, h, 6, 'rgba(20,24,50,0.8)', null);
  lines.forEach(([s, c], i) => text(ctx, s, x, y + 14 + i * 19, c, 15));
}

// ------------------------------------------------------------------ inventory logic
function accepts(G, kind, i, id) {
  const d = ITEMS[id];
  if (kind === 'armor') return d.slot === i;
  if (kind === 'acc') return !!d.acc && !G.player.acc.some((a, j) => a && j !== i && a.id === id);
  if (kind === 'coin') return !!d.coin;
  return true;
}
function moveInto(arr, it, from = 0, to = arr.length) {
  const ms = ITEMS[it.id].stack;
  for (let i = from; i < to && it.n > 0; i++) { const s = arr[i]; if (s && s.id === it.id && s.n < ms) { const k = Math.min(ms - s.n, it.n); s.n += k; it.n -= k; } }
  for (let i = from; i < to && it.n > 0; i++) if (!arr[i]) { arr[i] = { id: it.id, n: it.n }; it.n = 0; }
  return it.n;
}
function sellItem(G, arr, i) {
  const s = arr[i], d = ITEMS[s.id];
  if (d.coin) return;
  const v = Math.floor(d.val / 5) * s.n;
  arr[i] = null;
  setCoins(G.player, totalCoins(G.player) + v);
  G.sfx('coin');
}
function quickMove(G, arr, i, kind) {
  const U = G.ui, p = G.player, s = arr[i];
  if (kind === 'inv' && U.shop && U.talk) { sellItem(G, arr, i); return; }
  if (kind === 'inv' && U.chest) { const ch = G.world.chests.get(U.chest); if (ch) { const left = moveInto(ch, { ...s }); if (left < s.n) { s.n = left; if (!left) arr[i] = null; } } return; }
  if (kind === 'chest' || kind === 'armor' || kind === 'acc' || kind === 'trash' || kind === 'guide') { const c = { ...s }; const left = moveInto(p.inv, c, 0, 50); if (left < s.n) { s.n = left; if (!left) arr[i] = null; } if (kind !== 'chest') recalcStats(p); return; }
  if (kind === 'inv') {
    const d = ITEMS[s.id];
    if (d.slot != null || d.acc) { equip(G, i); return; }
    const c = { ...s }, left = i < 10 ? moveInto(p.inv, c, 10, 50) : moveInto(p.inv, c, 0, 10);
    if (left < s.n) { s.n = left; if (!left) arr[i] = null; }
  }
}
function equip(G, i) {
  const p = G.player, s = p.inv[i], d = ITEMS[s.id];
  if (d.slot != null) { p.inv[i] = p.armor[d.slot]; p.armor[d.slot] = s; }
  else if (d.acc) {
    if (p.acc.some(a => a && a.id === s.id)) return;
    let j = p.acc.findIndex(a => !a);
    if (j < 0) j = 0;
    p.inv[i] = p.acc[j]; p.acc[j] = s;
  }
  recalcStats(p); G.sfx('click');
}
function slotClick(G, arr, i, btn, shift, kind) {
  const U = G.ui, s = arr[i], c = U.cursor;
  if (btn === 0) {
    if (shift && s) { quickMove(G, arr, i, kind); G.sfx('click'); return; }
    if (!c) { if (s) { U.cursor = s; arr[i] = null; } }
    else if (!s) { if (accepts(G, kind, i, c.id)) { arr[i] = c; U.cursor = null; } }
    else if (s.id === c.id && ITEMS[s.id].stack > 1) { const k = Math.min(ITEMS[s.id].stack - s.n, c.n); s.n += k; c.n -= k; if (!c.n) U.cursor = null; }
    else if (accepts(G, kind, i, c.id)) { arr[i] = c; U.cursor = s; }
  } else {
    if (kind === 'inv' && s && !c && (ITEMS[s.id].slot != null || ITEMS[s.id].acc)) { equip(G, i); return; }
    if (!c && s) { const h = Math.ceil(s.n / 2); U.cursor = { id: s.id, n: h }; s.n -= h; if (!s.n) arr[i] = null; }
    else if (c && accepts(G, kind, i, c.id) && (!s || (s.id === c.id && s.n < ITEMS[s.id].stack))) { if (!s) arr[i] = { id: c.id, n: 1 }; else s.n++; if (--c.n <= 0) U.cursor = null; }
  }
  if (kind === 'armor' || kind === 'acc') recalcStats(G.player);
  G.sfx('click');
  U.craftT = 0;
}
function returnCursor(G) {
  const U = G.ui, c = U.cursor;
  if (!c) return;
  const left = addItem(G.player, c.id, c.n);
  if (left) dropItem(G, c.id, left, G.player.x + 10, G.player.y + 10, G.player.dir * 3, -2);
  U.cursor = null;
}
function nearbyStations(G) {
  const p = G.player, wd = G.world, set = new Set();
  const cx = Math.floor((p.x + 10) / 16), cy = Math.floor((p.y + 21) / 16);
  for (let y = cy - 4; y <= cy + 4; y++) for (let x = cx - 5; x <= cx + 5; x++) {
    if (x < 0 || y < 0 || x >= wd.w || y >= wd.h) continue;
    const d = TILE[wd.tile[y * wd.w + x]];
    if (d && d.station) { set.add(d.station); if (d.station === 'forge') set.add('furnace'); }
  }
  return set;
}
function craft(G, idx, toInv) {
  const U = G.ui, p = G.player, r = RECIPES[idx];
  if (!canCraft(p, r, U.stations)) return;
  const ms = ITEMS[r.out].stack;
  if (!toInv && U.cursor && (U.cursor.id !== r.out || U.cursor.n + r.n > ms)) return;
  for (const [id, n] of r.ing) removeItem(p, id, n);
  if (toInv) { const left = addItem(p, r.out, r.n); if (left) dropItem(G, r.out, left, p.x + 10, p.y + 10); }
  else if (U.cursor) U.cursor.n += r.n; else U.cursor = { id: r.out, n: r.n };
  G.sfx('craft');
  U.craftT = 0;
}

// ------------------------------------------------------------------ minimap / world map image
export function initMap(G) {
  const wd = G.world;
  G.mapCanvas = mk(wd.w, wd.h);
  G.mapCtx = G.mapCanvas.getContext('2d');
  G.mapImg = G.mapCtx.createImageData(wd.w, wd.h);
  const d = G.mapImg.data;
  for (let i = 0; i < wd.w * wd.h; i++) mapPixel(wd, i, d);
  G.mapCtx.putImageData(G.mapImg, 0, 0);
  wd.mapDirty.length = 0;
}
function mapPixel(wd, i, d) {
  const o = i * 4;
  if (!wd.explored[i]) { d[o] = 0; d[o + 1] = 0; d[o + 2] = 0; d[o + 3] = 255; return; }
  const y = (i / wd.w) | 0, t = wd.tile[i];
  let c;
  if (t && TILE[t]) c = TILE[t].map;
  else if (wd.liq[i] > 30) c = wd.ltype[i] ? [255, 100, 20] : [40, 90, 210];
  else if (wd.wall[i]) { const h = WALL[wd.wall[i]].col, n = parseInt(h.slice(1), 16); c = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  else if (y < wd.surfaceLine) c = [110 + y * 0.3, 160 + y * 0.2, 235];
  else if (y < wd.rockLine) c = [60, 44, 32];
  else if (y < wd.hellLine) c = [42, 42, 50];
  else c = [60, 22, 16];
  d[o] = c[0]; d[o + 1] = c[1]; d[o + 2] = c[2]; d[o + 3] = 255;
}
function flushMap(G) {
  const wd = G.world, q = wd.mapDirty;
  if (!q.length || !G.mapImg) return;
  const d = G.mapImg.data;
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  const n = Math.min(q.length, 30000);
  for (let k = 0; k < n; k++) {
    const i = q[k], x = i % wd.w, y = (i / wd.w) | 0;
    mapPixel(wd, i, d);
    if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
  }
  q.splice(0, n);
  G.mapCtx.putImageData(G.mapImg, 0, 0, x0, y0, x1 - x0 + 1, y1 - y0 + 1);
}
function drawHead(ctx, look, x, y, s) {
  ctx.fillStyle = '#000'; ctx.fillRect(x - 5 * s, y - 5 * s, 10 * s, 10 * s);
  ctx.fillStyle = look.skin; ctx.fillRect(x - 4 * s, y - 3 * s, 8 * s, 7 * s);
  ctx.fillStyle = look.hat ? '#6a4a2a' : (look.hair >= 0 ? look.hairColor : look.skin); ctx.fillRect(x - 4 * s, y - 4 * s, 8 * s, 3 * s);
  ctx.fillStyle = '#fff'; ctx.fillRect(x + 1 * s, y, 2 * s, 2 * s);
}
function drawMapView(G, ctx, x, y, w, h, zoom, ccx, ccy) {
  const wd = G.world;
  ctx.save();
  ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
  ctx.fillStyle = '#000'; ctx.fillRect(x, y, w, h);
  ctx.imageSmoothingEnabled = false;
  const sx = ccx - w / 2 / zoom, sy = ccy - h / 2 / zoom;
  ctx.drawImage(G.mapCanvas, 0, 0, wd.w, wd.h, x - sx * zoom, y - sy * zoom, wd.w * zoom, wd.h * zoom);
  const hs = Math.max(1, Math.min(2, zoom / 2));
  for (const n of G.npcs) drawHead(ctx, n.d.look, x + ((n.x + 9) / 16 - sx) * zoom, y + ((n.y + 10) / 16 - sy) * zoom, hs);
  const p = G.player;
  drawHead(ctx, p.look, x + ((p.x + 10) / 16 - sx) * zoom, y + ((p.y + 10) / 16 - sy) * zoom, hs * 1.2);
  ctx.restore();
}

// ------------------------------------------------------------------ update (play state)
export function uiUpdate(G) {
  const U = G.ui, I = G.input, m = I.mouse, p = G.player;
  U.consumed = false; U.wheelUsed = false;
  let hit = null;
  for (let i = U.regs.length - 1; i >= 0; i--) { const r = U.regs[i]; if (m.x >= r.x && m.x < r.x + r.w && m.y >= r.y && m.y < r.y + r.h) { hit = r; break; } }
  U.hover = hit;
  U.overUI = !!hit || U.pause || U.map;
  // sliders being dragged
  if (U.slider) { if (m.l) U.slider(m.x); else U.slider = null; U.consumed = true; }
  if (hit) {
    if (m.lp && hit.click) { hit.click(0, I.shift()); U.consumed = true; }
    else if (m.rp && hit.click) { hit.click(1, I.shift()); U.consumed = true; }
    if (m.wheel && hit.wheel) { hit.wheel(m.wheel); U.wheelUsed = true; }
  }
  // keys
  if (I.hit('Escape')) {
    if (U.map) U.map = false;
    else if (U.settings) U.settings = false;
    else if (U.pause) U.pause = false;
    else if (U.talk) { U.talk = null; U.shop = false; if (U.guide) { U.guide = false; returnGuide(G); } }
    else { U.inv = !U.inv; if (!U.inv) { U.chest = null; U.housingMode = false; returnCursor(G); } G.sfx('click'); }
  }
  if (I.hit('KeyM') && !U.pause) { U.map = !U.map; U.mapC = [(p.x + 10) / 16, (p.y + 20) / 16]; U.drag = null; }
  if (I.hit('KeyP')) { U.pause = !U.pause; U.settings = false; }
  if (U.map) {
    if (m.wheel) { U.mapZoom = Math.max(0.5, Math.min(8, U.mapZoom * (m.wheel < 0 ? 1.25 : 0.8))); U.wheelUsed = true; }
    if (m.l) { if (!U.drag) U.drag = [m.x, m.y, U.mapC[0], U.mapC[1]]; else U.mapC = [U.drag[2] - (m.x - U.drag[0]) / U.mapZoom, U.drag[3] - (m.y - U.drag[1]) / U.mapZoom]; }
    else U.drag = null;
    return;
  }
  if (U.pause) return;
  // world clicks while UI is up
  if (!hit && !U.consumed && !p.dead) {
    if (m.lp && U.cursor && U.inv) {
      const c = U.cursor, a = Math.atan2(G.mouseW.y - p.y - 20, G.mouseW.x - p.x - 10);
      const it = dropItem(G, c.id, c.n, p.x + 10, p.y + 16, Math.cos(a) * 4, Math.sin(a) * 4 - 1);
      if (it) it.t = -30;
      U.cursor = null; U.consumed = true;
    } else if (m.lp && U.housingMode) {
      const tx = Math.floor(G.mouseW.x / 16), ty = Math.floor(G.mouseW.y / 16);
      const r = checkRoom(G, tx, ty);
      const occ = r.ok ? roomOccupant(G, r) : null;
      U.housingView = { cells: r.cells.length <= 800 ? r.cells : [], ok: r.ok, t: 240 };
      G.msg(r.reason + (occ ? ' It is occupied by ' + occ.d.name + '.' : ''), r.ok ? '#96ff96' : '#ff9696');
      U.consumed = true;
    } else if (m.rp) { if (interact(G)) U.consumed = true; }
  }
  if (U.housingView && U.housingView.t > 0) U.housingView.t--;
  // chest / talk range
  if (U.chest) {
    const [cx, cy] = U.chest.split(',').map(Number);
    if (!G.world.chests.has(U.chest) || Math.abs(cx * 16 + 16 - p.x - 10) > 7 * 16 || Math.abs(cy * 16 + 16 - p.y - 21) > 6 * 16) U.chest = null;
  }
  if (!U.talk && U.shop) U.shop = false;
  if (!U.talk && U.guide) { U.guide = false; returnGuide(G); }
  // crafting list
  if (U.inv && --U.craftT <= 0) {
    U.craftT = 20;
    U.stations = nearbyStations(G);
    const prev = U.craftList[U.craftSel];
    U.craftList = craftableList(p, U.stations);
    const k = U.craftList.indexOf(prev);
    U.craftSel = k >= 0 ? k : Math.min(U.craftSel, Math.max(0, U.craftList.length - 1));
  }
  // tile cursor highlight
  const held = p.inv[p.sel];
  U.tileCursor = null;
  if (!hit && held && !U.cursor && !p.dead) {
    const d = ITEMS[held.id];
    if (d.pick || d.axe || d.hammer || d.place != null || d.wall != null) {
      const tx = Math.floor(G.mouseW.x / 16), ty = Math.floor(G.mouseW.y / 16);
      if (inReach(p, tx, ty)) U.tileCursor = [tx, ty];
    }
  }
}
function returnGuide(G) {
  const s = G.ui.guideSlot[0];
  if (s) { const left = addItem(G.player, s.id, s.n); if (left) dropItem(G, s.id, left, G.player.x + 10, G.player.y + 10); G.ui.guideSlot[0] = null; }
}

// ------------------------------------------------------------------ draw (play state)
export function uiDraw(G, ctx) {
  const U = G.ui, R = G.R, W = R.W, H = R.H, p = G.player;
  U.regs = [];
  flushMap(G);
  if (U.map) { drawWorldMap(G, ctx); drawCursor(G, ctx); return; }
  drawHotbarInv(G, ctx);
  drawBuffs(G, ctx);
  drawLife(G, ctx);
  drawMinimap(G, ctx);
  if (U.inv) { drawEquip(G, ctx); drawCrafting(G, ctx); drawSidePanel(G, ctx); }
  if (U.talk) drawDialogue(G, ctx);
  drawBossBar(G, ctx);
  drawChat(G, ctx);
  if (p.dead) {
    ctx.fillStyle = 'rgba(40,0,0,0.35)'; ctx.fillRect(0, 0, W, H);
    text(ctx, 'You were slain...', W / 2, H / 2 - 20, '#e84040', 44, 'center');
    text(ctx, String(Math.ceil(p.respawnT / 60)), W / 2, H / 2 + 30, '#fff', 30, 'center');
  }
  if (U.pause) drawPause(G, ctx);
  drawHoverInfo(G, ctx);
  drawCursor(G, ctx);
}

function drawHotbarInv(G, ctx) {
  const U = G.ui, p = G.player;
  const rows = U.inv ? 5 : 1;
  const selIt = p.inv[p.sel];
  if (!U.inv) text(ctx, selIt ? ITEMS[selIt.id].name : '', X0 + 5 * PITCH - 2, 18, selIt ? CFG.rarity[ITEMS[selIt.id].rar] : '#fff', 16, 'center');
  else text(ctx, 'Inventory', X0 + 2, 18, '#fff', 16);
  for (let r = 0; r < rows; r++) for (let c = 0; c < 10; c++) {
    const i = r * 10 + c, x = X0 + c * PITCH, y = Y0 + r * PITCH;
    const sel = i === p.sel && r === 0;
    drawSlot(G, ctx, x, y, p.inv[i], { sel, num: r === 0 ? (c + 1) % 10 : null });
    if (U.inv) reg(G, x, y, SL, SL, (b, sh) => slotClick(G, p.inv, i, b, sh, 'inv'), { item: () => p.inv[i] });
    else reg(G, x, y, SL, SL, b => { if (b === 0) p.sel = i; }, { item: () => p.inv[i] });
  }
  if (!U.inv) return;
  const cx = X0 + 10 * PITCH + 12;
  text(ctx, 'Coins', cx, Y0 + PITCH - 6, '#fff', 12);
  for (let k = 0; k < 4; k++) {
    const y = Y0 + PITCH + k * 40;
    drawSlot(G, ctx, cx, y, p.coins[3 - k], { size: 36, label: ['coin_star', 'coin_crown', 'coin_mark', 'coin_bit'][k] });
    reg(G, cx, y, 36, 36, (b, sh) => slotClick(G, p.coins, 3 - k, b, sh, 'coin'), { item: () => p.coins[3 - k] });
  }
  const ty = Y0 + PITCH + 4 * 40 + 6;
  text(ctx, 'Trash', cx, ty + 10, '#fff', 12);
  drawSlot(G, ctx, cx, ty + 14, U.trash[0], { size: 36, bg: 'rgba(120,50,60,0.8)' });
  reg(G, cx, ty + 14, 36, 36, (b, sh) => { if (b === 0 && U.cursor) { U.trash[0] = U.cursor; U.cursor = null; G.sfx('click'); } else slotClick(G, U.trash, 0, b, sh, 'trash'); }, { item: () => U.trash[0] });
  text(ctx, 'Total: ' + coinText(totalCoins(p)), X0, Y0 + 5 * PITCH + 14, '#e8c850', 13);
}

function drawBuffs(G, ctx) {
  const p = G.player, U = G.ui;
  const y = U.inv ? Y0 + 5 * PITCH + 26 : Y0 + PITCH + 8;
  const icon = { ironskin: 'ironskin_tonic', swift: 'swiftness_tonic', shine: 'shine_tonic', sick: 'healing_tonic', fire: 'torch', poison: 'rotten_chunk', chill: 'ice', dread: 'antler_idol' };
  p.buffs.forEach((b, k) => {
    const x = X0 + k * 40, B = BUFFS[b.id];
    rrect(ctx, x, y, 32, 32, 5, B.debuff ? 'rgba(110,30,30,0.85)' : 'rgba(40,80,50,0.85)', B.col, 2);
    const ic = G.S.items[icon[b.id]];
    if (ic) ctx.drawImage(ic, x, y, 32, 32);
    const s = Math.ceil(b.t / 60);
    text(ctx, s >= 60 ? Math.ceil(s / 60) + 'm' : s + 's', x + 16, y + 46, '#fff', 12, 'center');
    reg(G, x, y, 32, 32, bt => { if (bt === 1 && !B.debuff) { p.buffs = p.buffs.filter(q => q !== b); recalcStats(p); } }, { tip: () => [[B.name, B.debuff ? '#ff9696' : '#96ff96'], [B.desc, '#fff'], [B.debuff ? '' : 'Right-click to cancel', '#aaa']] });
  });
}

function drawLife(G, ctx) {
  const p = G.player, S = G.S, W = G.R.W;
  const hearts = Math.ceil(p.lifeMax / 20), perRow = 10, hs = 24;
  const x0 = W - 80 - perRow * hs;
  text(ctx, 'Life: ' + Math.max(0, Math.ceil(p.hp)) + '/' + p.lifeMax, x0 + perRow * hs / 2, 20, '#fff', 16, 'center');
  for (let i = 0; i < hearts; i++) {
    const x = x0 + (i % perRow) * hs, y = 26 + Math.floor(i / perRow) * hs;
    const f = Math.max(0, Math.min(1, (p.hp - i * 20) / 20));
    ctx.globalAlpha = 0.3; ctx.drawImage(S.heart, x, y, 22, 22);
    if (f > 0) { ctx.globalAlpha = 0.35 + 0.65 * f; const s = 12 + 10 * f; ctx.drawImage(S.heart, x + (22 - s) / 2, y + (22 - s) / 2, s, s); }
  }
  ctx.globalAlpha = 1;
  text(ctx, 'Mana', W - 32, 20, '#fff', 16, 'center');
  const stars = Math.ceil(p.maxMana / 20);
  for (let i = 0; i < stars; i++) {
    const f = Math.max(0, Math.min(1, (p.mana - i * 20) / 20)), y = 26 + i * 26;
    ctx.globalAlpha = 0.3; ctx.drawImage(S.star, W - 44, y, 24, 24);
    if (f > 0) { ctx.globalAlpha = 0.35 + 0.65 * f; const s = 12 + 12 * f; ctx.drawImage(S.star, W - 44 + (24 - s) / 2, y + (24 - s) / 2, s, s); }
  }
  ctx.globalAlpha = 1;
  reg(G, x0, 4, perRow * hs, 26 + Math.ceil(hearts / perRow) * hs, null, { tip: () => [[p.hp + '/' + p.lifeMax + ' life', '#fff']] });
  reg(G, W - 50, 4, 40, 26 + stars * 26, null, { tip: () => [[p.mana + '/' + p.maxMana + ' mana', '#fff']] });
}

function miniRect(G) {
  const W = G.R.W, rows = Math.ceil(G.player.lifeMax / 20) > 10 ? 2 : 1;
  const w = Math.min(300, Math.round(W * 0.16)), h = Math.round(w * 0.72);
  return [W - 60 - w, 30 + rows * 24 + 14, w, h];
}
function drawMinimap(G, ctx) {
  const U = G.ui, p = G.player;
  const [x, y, w, h] = miniRect(G);
  if (U.mini.show) {
    drawMapView(G, ctx, x, y, w, h, U.mini.zoom, (p.x + 10) / 16, (p.y + 20) / 16);
    rrect(ctx, x - 4, y - 4, w + 8, h + 8, 8, null, '#2c3a90', 5);
    rrect(ctx, x - 6, y - 6, w + 12, h + 12, 9, null, '#0c1030', 2);
    reg(G, x, y, w, h, null);
  }
  const by = U.mini.show ? y + h + 8 : y;
  const btns = [['=', () => { U.mini.show = !U.mini.show; }], ['-', () => { U.mini.zoom = Math.max(1, U.mini.zoom / 2); }], ['+', () => { U.mini.zoom = Math.min(8, U.mini.zoom * 2); }]];
  btns.forEach(([s, f], k) => {
    const bx = x + w - 3 * 30 + k * 30;
    rrect(ctx, bx, by, 26, 22, 5, hov(G, bx, by, 26, 22) ? 'rgba(90,110,220,0.95)' : 'rgba(44,58,144,0.9)', '#0c1030', 2);
    text(ctx, s, bx + 13, by + 17, '#fff', 16, 'center');
    reg(G, bx, by, 26, 22, b => { if (b === 0) { f(); G.sfx('click'); } });
  });
}

function drawEquip(G, ctx) {
  const U = G.ui, p = G.player, W = G.R.W, S = G.S;
  const [, my, , mh] = miniRect(G);
  const x = W - 60 - SL, y0 = my + (U.mini.show ? mh : 0) + 58;
  text(ctx, 'Equip', x + SL / 2, y0 - 6, '#fff', 13, 'center');
  const lab = ['gold_helm', 'gold_mail', 'gold_greaves'];
  for (let k = 0; k < 3; k++) {
    const y = y0 + k * PITCH;
    drawSlot(G, ctx, x, y, p.armor[k], { label: lab[k], bg: 'rgba(56,72,160,0.8)' });
    reg(G, x, y, SL, SL, (b, sh) => slotClick(G, p.armor, k, b, sh, 'armor'), { item: () => p.armor[k], tip: () => [[['Helmet', 'Chest', 'Legs'][k] + ' slot', '#aaa']] });
  }
  for (let k = 0; k < 3; k++) {
    const y = y0 + (3 + k) * PITCH + 6;
    drawSlot(G, ctx, x, y, p.acc[k], { label: 'band_of_vigor', bg: 'rgba(70,60,150,0.8)' });
    reg(G, x, y, SL, SL, (b, sh) => slotClick(G, p.acc, k, b, sh, 'acc'), { item: () => p.acc[k], tip: () => [['Accessory slot', '#aaa']] });
  }
  const dy = y0 + 6 * PITCH + 14;
  ctx.drawImage(S.defIcon, x + 6, dy, 32, 32);
  text(ctx, String(p.stats.def), x + 22, dy + 22, '#fff', 14, 'center');
  reg(G, x, dy, SL, 32, null, { tip: () => [[p.stats.def + ' defense', '#fff'], ...(p.setBonus ? [['Set bonus: ' + p.setBonus, '#96ff96']] : [])] });
  // housing button + npc list
  const hx = x - 60, hy = y0;
  rrect(ctx, hx, hy, SL, SL, 6, U.housingMode ? 'rgba(236,212,60,0.92)' : 'rgba(56,72,160,0.8)', '#141c46', 2);
  ctx.drawImage(S.houseIcon, hx + 6, hy + 6, 32, 32);
  reg(G, hx, hy, SL, SL, b => { if (b === 0) { U.housingMode = !U.housingMode; G.sfx('click'); } }, { tip: () => [['Housing', '#fff'], ['Click, then click inside a room to check it', '#b4d2ff']] });
  G.npcs.forEach((n, k) => {
    const ny = hy + PITCH + 6 + k * 34;
    rrect(ctx, hx + 6, ny, 32, 30, 5, 'rgba(56,72,160,0.7)', '#141c46', 2);
    drawHead(ctx, n.d.look, hx + 22, ny + 15, 2);
    reg(G, hx + 6, ny, 32, 30, null, { tip: () => [[n.d.name + ' ' + n.d.title, '#fff'], [n.home ? 'Has a home' : 'Homeless', n.home ? '#96ff96' : '#ff9696']] });
  });
  // menu button
  const bx = W - 130, by = G.R.H - 46;
  rrect(ctx, bx, by, 110, 34, 6, hov(G, bx, by, 110, 34) ? 'rgba(90,110,220,0.95)' : 'rgba(44,58,144,0.9)', '#0c1030', 2);
  text(ctx, 'Menu', bx + 55, by + 23, '#fff', 17, 'center');
  reg(G, bx, by, 110, 34, b => { if (b === 0) { U.pause = true; G.sfx('click'); } });
}

function sideTop(G) { return Y0 + 5 * PITCH + 64; }
function drawSidePanel(G, ctx) {
  const U = G.ui, p = G.player;
  const y0 = sideTop(G);
  if (U.chest) {
    const ch = G.world.chests.get(U.chest);
    if (!ch) return;
    text(ctx, 'Chest', X0 + 2, y0 - 6, '#fff', 15);
    for (let i = 0; i < 40; i++) {
      const x = X0 + (i % 10) * PITCH, y = y0 + Math.floor(i / 10) * PITCH;
      drawSlot(G, ctx, x, y, ch[i]);
      reg(G, x, y, SL, SL, (b, sh) => slotClick(G, ch, i, b, sh, 'chest'), { item: () => ch[i] });
    }
    const bx = X0 + 10 * PITCH + 12;
    [['Loot All', () => { for (let i = 0; i < 40; i++) if (ch[i]) { const left = addItem(p, ch[i].id, ch[i].n); if (left) ch[i].n = left; else ch[i] = null; } }],
      ['Deposit All', () => { for (let i = 10; i < 50; i++) if (p.inv[i] && !ITEMS[p.inv[i].id].coin) { const c = { ...p.inv[i] }; const left = moveInto(ch, c); if (left) p.inv[i].n = left; else p.inv[i] = null; } }],
    ].forEach(([s, f], k) => {
      const by = y0 + k * 34;
      const hv = hov(G, bx, by, 110, 28);
      text(ctx, s, bx, by + 20, hv ? '#ffe050' : '#fff', 16);
      reg(G, bx, by, 110, 28, b => { if (b === 0) { f(); G.sfx('click'); } });
    });
  } else if (U.shop && U.talk) {
    const items = shopFor(G, U.talk);
    text(ctx, U.talk.d.name + '\'s Shop', X0 + 2, y0 - 6, '#fff', 15);
    for (let i = 0; i < 40; i++) {
      const x = X0 + (i % 10) * PITCH, y = y0 + Math.floor(i / 10) * PITCH, s = items[i];
      drawSlot(G, ctx, x, y, s ? { id: s.id, n: 1 } : null, { bg: 'rgba(70,90,170,0.8)' });
      reg(G, x, y, SL, SL, () => {
        if (U.cursor) { const c = U.cursor; if (!ITEMS[c.id].coin) { setCoins(p, totalCoins(p) + Math.floor(ITEMS[c.id].val / 5) * c.n); U.cursor = null; G.sfx('coin'); } return; }
        if (!s) return;
        if (payCoins(p, s.price)) { const left = addItem(p, s.id, 1); if (left) dropItem(G, s.id, left, p.x + 10, p.y + 10); G.sfx('coin'); }
        else G.msg('You cannot afford that.', '#ff9696');
      }, { item: () => s && { id: s.id, n: 1 }, extra: () => s && [['Buy price: ' + coinText(s.price), '#e8c850']] });
    }
    text(ctx, 'Shift-click inventory items to sell', X0 + 2, y0 + 4 * PITCH + 16, '#b4d2ff', 12);
  } else if (U.guide && U.talk) {
    text(ctx, 'Place an item here to see its recipes:', X0 + 2, y0 - 6, '#fff', 15);
    drawSlot(G, ctx, X0, y0, U.guideSlot[0]);
    reg(G, X0, y0, SL, SL, (b, sh) => slotClick(G, U.guideSlot, 0, b, sh, 'guide'), { item: () => U.guideSlot[0] });
    const g = U.guideSlot[0];
    if (g) {
      const rs = recipesFor(g.id).slice(0, 5);
      if (!rs.length) text(ctx, 'No recipes use this item.', X0 + 60, y0 + 28, '#c8c8c8', 14);
      rs.forEach((r, k) => {
        const y = y0 + 52 + k * 36;
        drawSlot(G, ctx, X0, y, { id: r.out, n: r.n }, { size: 32 });
        reg(G, X0, y, 32, 32, null, { item: () => ({ id: r.out, n: r.n }) });
        r.ing.forEach(([id, n], j) => { const ix = X0 + 44 + j * 36; drawSlot(G, ctx, ix, y, { id, n }, { size: 32, bg: 'rgba(40,50,110,0.8)' }); reg(G, ix, y, 32, 32, null, { item: () => ({ id, n }) }); });
        text(ctx, r.st ? 'at ' + STATION_NAMES[r.st] : 'by hand', X0 + 48 + r.ing.length * 36, y + 21, '#b4d2ff', 13);
      });
    }
  }
}

function drawCrafting(G, ctx) {
  const U = G.ui, H = G.R.H;
  const side = U.chest || (U.talk && (U.shop || U.guide));
  const y0 = side ? sideTop(G) + 4 * PITCH + 62 : sideTop(G);
  text(ctx, 'Crafting', X0 + 2, y0 - 6, '#fff', 15);
  const list = U.craftList;
  if (!list.length) { text(ctx, 'Nothing craftable nearby', X0 + 2, y0 + 20, '#9aa0c0', 13); return; }
  const vis = Math.max(1, Math.floor((H - 120 - y0) / PITCH));
  U.craftScroll = Math.max(0, Math.min(U.craftScroll, list.length - vis));
  if (U.craftSel < U.craftScroll) U.craftScroll = U.craftSel;
  if (U.craftSel >= U.craftScroll + vis) U.craftScroll = U.craftSel - vis + 1;
  const wheel = w => { U.craftSel = Math.max(0, Math.min(list.length - 1, U.craftSel + Math.sign(w))); };
  for (let k = 0; k < vis && U.craftScroll + k < list.length; k++) {
    const li = U.craftScroll + k, ri = list[li], r = RECIPES[ri], y = y0 + k * PITCH, sel = li === U.craftSel;
    drawSlot(G, ctx, X0, y, { id: r.out, n: r.n }, { sel });
    reg(G, X0, y, SL, SL, (b, sh) => { if (b !== 0) return; if (sel) craft(G, ri, sh); else { U.craftSel = li; G.sfx('click'); } }, { item: () => ({ id: r.out, n: r.n }), wheel });
    if (sel) {
      r.ing.forEach(([id, n], j) => {
        const ix = X0 + PITCH + 8 + j * 40, has = countItem(G.player, id) >= n;
        drawSlot(G, ctx, ix, y + 4, { id, n }, { size: 36, bg: has ? 'rgba(40,50,110,0.85)' : 'rgba(110,40,40,0.85)' });
        reg(G, ix, y + 4, 36, 36, null, { item: () => ({ id, n }) });
      });
      if (r.st) text(ctx, 'Requires: ' + STATION_NAMES[r.st], X0 + PITCH + 8, y + 56, '#b4d2ff', 12);
    }
  }
  if (list.length > vis) text(ctx, (U.craftScroll + 1) + '-' + Math.min(list.length, U.craftScroll + vis) + ' of ' + list.length + ' (scroll)', X0 + 2, y0 + vis * PITCH + 14, '#9aa0c0', 12);
}

function drawDialogue(G, ctx) {
  const U = G.ui, n = U.talk, W = G.R.W, p = G.player;
  const w = Math.min(560, W - 40), x = W / 2 - w / 2, y = U.inv ? 300 : 110;
  const lines = wrap(ctx, U.talkText, w - 30, 16);
  const h = 44 + lines.length * 21 + 40;
  panel(ctx, x, y, w, h);
  text(ctx, n.d.name + ' ' + n.d.title, x + 14, y + 24, '#ffe050', 16);
  lines.forEach((l, i) => text(ctx, l, x + 14, y + 50 + i * 21, '#fff', 16));
  let bx = x + 14;
  const by = y + h - 16;
  const btns = [...n.d.buttons, 'Close'];
  for (const b of btns) {
    let label = b;
    if (b === 'Heal') { const c = nurseCost(G); label = c > 0 ? 'Heal (' + coinText(c) + ')' : 'Heal'; }
    ctx.font = `bold 17px ${FONT}`;
    const tw = ctx.measureText(label).width, hv = hov(G, bx, by - 18, tw, 24);
    text(ctx, label, bx, by, hv ? '#ffe050' : '#fff', 17);
    reg(G, bx, by - 18, tw, 24, bt => {
      if (bt !== 0) return;
      G.sfx('click');
      if (b === 'Close') { U.talk = null; U.shop = false; if (U.guide) { U.guide = false; returnGuide(G); } }
      else if (b === 'Shop') { U.shop = true; U.inv = true; U.chest = null; U.guide = false; }
      else if (b === 'Help') U.talkText = guideHint(G);
      else if (b === 'Crafting') { U.guide = true; U.inv = true; U.chest = null; U.shop = false; }
      else if (b === 'Heal') {
        const c = nurseCost(G);
        if (c <= 0) U.talkText = 'You look fine to me. Come back when you\'re hurt.';
        else if (payCoins(p, c)) { p.hp = p.lifeMax; p.buffs = p.buffs.filter(q => !['fire', 'poison', 'chill'].includes(q.id)); recalcStats(p); G.sfx('crystal'); U.talkText = 'There, all better. Try not to die out there.'; }
        else U.talkText = 'You can\'t afford my services. Come back with more coin.';
      }
    });
    bx += tw + 28;
  }
  reg(G, x, y, w, h - 26, null);
}

function drawBossBar(G, ctx) {
  const b = G.boss;
  if (!b || b.dead) return;
  const W = G.R.W, w = Math.min(480, W - 40), x = W / 2 - w / 2, y = W >= 1500 ? 16 : G.ui.inv ? G.R.H - 140 : 100;
  rrect(ctx, x, y, w, 28, 6, 'rgba(20,10,20,0.85)', '#000', 2);
  const f = Math.max(0, b.hp / b.maxHp);
  const g = ctx.createLinearGradient(0, y, 0, y + 28); g.addColorStop(0, '#ff6060'); g.addColorStop(1, '#a01818');
  rrect(ctx, x + 3, y + 3, (w - 6) * f, 22, 4, g, null);
  text(ctx, b.d.name + '  ' + Math.max(0, Math.ceil(b.hp)) + '/' + b.maxHp, W / 2, y + 20, '#fff', 15, 'center');
}

function drawChat(G, ctx) {
  const H = G.R.H, U = G.ui;
  if (U.inv) return;
  const lines = G.chat.slice(-10);
  lines.forEach((c, i) => {
    const age = G.tick - c.t, a = age > 600 ? Math.max(0, 1 - (age - 600) / 120) : 1;
    if (a <= 0) return;
    ctx.globalAlpha = a;
    text(ctx, c.text, 16, H - 22 - (lines.length - 1 - i) * 22, c.col, 16);
  });
  ctx.globalAlpha = 1;
}

function drawWorldMap(G, ctx) {
  const U = G.ui, W = G.R.W, H = G.R.H;
  ctx.fillStyle = 'rgba(0,0,0,0.9)'; ctx.fillRect(0, 0, W, H);
  drawMapView(G, ctx, 20, 50, W - 40, H - 80, U.mapZoom, U.mapC[0], U.mapC[1]);
  rrect(ctx, 16, 46, W - 32, H - 72, 8, null, '#2c3a90', 4);
  text(ctx, 'World Map  -  ' + G.world.name + (G.world.difficulty === 'hard' ? '  (Hard)' : ''), W / 2, 34, '#fff', 20, 'center');
  text(ctx, 'Scroll to zoom, drag to pan, M or Esc to close', W / 2, H - 8, '#b4d2ff', 14, 'center');
}

function drawPause(G, ctx) {
  const U = G.ui, W = G.R.W, H = G.R.H;
  ctx.fillStyle = 'rgba(0,0,10,0.55)'; ctx.fillRect(0, 0, W, H);
  if (U.settings) { drawSettings(G, ctx, () => { U.settings = false; }); return; }
  text(ctx, 'Paused', W / 2, H / 2 - 150, '#fff', 40, 'center');
  const opts = [['Resume', () => { U.pause = false; }], ['Save World', () => G.actions.save(false)], ['Settings', () => { U.settings = true; }], ['Save & Exit', () => G.actions.exitToTitle()]];
  opts.forEach(([s, f], k) => menuButton(G, ctx, s, W / 2, H / 2 - 70 + k * 56, f));
}

function drawSettings(G, ctx, back) {
  const W = G.R.W, H = G.R.H, st = G.settings;
  const pw = 460, px = W / 2 - pw / 2, py = H / 2 - 190;
  panel(ctx, px, py, pw, 380);
  text(ctx, 'Settings', W / 2, py + 40, '#fff', 28, 'center');
  const slider = (label, val, min, max, y, set, fmt) => {
    text(ctx, label + ': ' + fmt(val), px + 30, y, '#fff', 17);
    const sx = px + 30, sw = pw - 60, sy = y + 12;
    rrect(ctx, sx, sy, sw, 10, 5, 'rgba(10,15,40,0.9)', '#000', 1);
    const f = (val - min) / (max - min);
    rrect(ctx, sx, sy, sw * f, 10, 5, '#5a7ae0', null);
    ctx.fillStyle = '#ffe050'; ctx.fillRect(sx + sw * f - 5, sy - 5, 10, 20);
    const apply = mx => { set(Math.max(min, Math.min(max, min + (mx - sx) / sw * (max - min)))); };
    reg(G, sx - 8, sy - 10, sw + 16, 30, b => { if (b === 0) { apply(G.input.mouse.x); G.ui.slider = apply; } });
  };
  slider('Music', st.music, 0, 1, py + 90, v => { st.music = v; audio.setVolume(st.music, st.sfx); }, v => Math.round(v * 100) + '%');
  slider('Sound', st.sfx, 0, 1, py + 150, v => { st.sfx = v; audio.setVolume(st.music, st.sfx); }, v => Math.round(v * 100) + '%');
  slider('Zoom', st.zoom, 1, 3, py + 210, v => { st.zoom = Math.round(v * 4) / 4; }, v => v.toFixed(2) + 'x');
  const tog = (label, key, y) => {
    const on = st[key] !== false, hv = hov(G, px + 30, y - 20, 300, 26);
    text(ctx, label + ': ' + (on ? 'On' : 'Off'), px + 30, y, hv ? '#ffe050' : '#fff', 17);
    reg(G, px + 30, y - 20, 300, 26, b => { if (b === 0) { st[key] = !on; G.sfx('click'); } });
  };
  tog('Autosave', 'autosave', py + 270);
  tog('Screen shake', 'shake', py + 305);
  menuButton(G, ctx, 'Back', W / 2, py + 355, () => { G.actions.saveSettings(); back(); }, 22);
}

function drawHoverInfo(G, ctx) {
  const U = G.ui, h = U.hover;
  if (U.cursor) return;
  if (h) {
    if (h.item) { const it = h.item(); if (it) { drawTooltip(G, ctx, itemLines(G, it, h.extra && h.extra())); return; } }
    if (h.tip) { const t = h.tip().filter(l => l[0]); if (t.length) drawTooltip(G, ctx, t); }
    return;
  }
  if (U.pause || U.map) return;
  const m = G.mouseW;
  for (const n of G.npcs) if (m.x >= n.x && m.x <= n.x + n.w && m.y >= n.y && m.y <= n.y + n.h) { drawTooltip(G, ctx, [[n.d.name + ' ' + n.d.title, '#fff'], ['Right-click to talk', '#b4d2ff']]); return; }
  for (const e of G.enemies) {
    if (m.x >= e.x && m.x <= e.x + e.w && m.y >= e.y && m.y <= e.y + e.h) { drawTooltip(G, ctx, [[e.d.name + ': ' + Math.max(0, Math.ceil(e.hp)) + '/' + e.maxHp, '#fff']]); return; }
  }
}
function drawCursor(G, ctx) {
  const m = G.input.mouse, U = G.ui;
  ctx.fillStyle = U.housingMode ? '#60ff90' : '#ff7a30';
  ctx.strokeStyle = '#000'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x + 14, m.y + 6); ctx.lineTo(m.x + 6, m.y + 14); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (U.housingMode) text(ctx, '?', m.x + 16, m.y + 24, '#60ff90', 16);
  if (U.cursor) {
    ctx.drawImage(G.S.items[U.cursor.id], m.x + 10, m.y + 10, 32, 32);
    if (U.cursor.n > 1) text(ctx, String(U.cursor.n), m.x + 12, m.y + 42, '#fff', 13);
  }
}

// ------------------------------------------------------------------ menus
function menuButton(G, ctx, label, x, y, f, size = 30) {
  ctx.font = `bold ${size}px ${FONT}`;
  const w = ctx.measureText(label).width + 20, h = size + 10;
  const hv = hov(G, x - w / 2, y - size, w, h);
  text(ctx, label, x, y, hv ? '#ffe050' : '#f0f0f0', hv ? size + 2 : size, 'center');
  reg(G, x - w / 2, y - size, w, h, b => { if (b === 0) { G.sfx('click'); f(); } });
}
function textField(G, ctx, key, label, x, y, w, maxLen = 20) {
  const M = G.menu, focus = M.focus === key, val = M.fields[key] || '';
  text(ctx, label, x, y - 8, '#fff', 16);
  rrect(ctx, x, y, w, 36, 6, focus ? 'rgba(20,30,80,0.95)' : 'rgba(20,30,80,0.7)', focus ? '#ffe050' : '#0c1030', 2);
  text(ctx, val + (focus && (G.tick >> 5) & 1 ? '|' : ''), x + 10, y + 25, '#fff', 17);
  reg(G, x, y, w, 36, b => { if (b === 0) { M.focus = key; let fresh = true; G.input.text = e => {
    if (M.focus !== key) return false;
    // the first key typed after clicking a field replaces its prefilled text
    if (fresh && (e.key === 'Backspace' || e.key.length === 1)) { M.fields[key] = ''; fresh = false; }
    if (e.key === 'Backspace') M.fields[key] = (M.fields[key] || '').slice(0, -1);
    else if (e.key === 'Enter' || e.key === 'Tab' || e.key === 'Escape') { M.focus = null; G.input.text = null; }
    else if (e.key.length === 1 && (M.fields[key] || '').length < maxLen) M.fields[key] = (M.fields[key] || '') + e.key;
    else return false;
    return true;
  }; } });
}
const SWATCH = {
  hairColor: ['#2a1a10', '#6a4a2a', '#a8703a', '#e8c070', '#f0f0e0', '#c03020', '#e070a0', '#4060d0', '#40a050', '#8a8a8a'],
  skin: ['#fde0c8', '#f0c8a0', '#e8b890', '#d09a70', '#b07850', '#8a5a3a', '#6a4028', '#4a2a18', '#9ac890', '#b0a8e0'],
  eyes: ['#3060a0', '#3a6a3a', '#5a3a1a', '#6a3a8a', '#202020', '#a02020', '#40a0a0', '#8a6a20', '#5a5a8a', '#e0a020'],
  shirt: ['#c83030', '#3060c0', '#40a050', '#e0c040', '#8040a0', '#e07030', '#f0f0f0', '#303030', '#40b0c0', '#a06a3a'],
  pants: ['#3a3a5a', '#5a4a3a', '#2a2a2a', '#6a6a7a', '#3a5a3a', '#7a3a3a', '#c8b890', '#304070', '#5a3a6a', '#8a8a8a'],
  shoes: ['#4a3020', '#2a2a2a', '#6a5a4a', '#8a2a2a', '#3a3a5a', '#e0e0e0', '#5a4a1a', '#2a4a2a', '#704a30', '#101010'],
};
export function randomLook() {
  const r = a => a[Math.floor(Math.random() * a.length)];
  return { hair: Math.floor(Math.random() * HAIR_STYLES.length), hairColor: r(SWATCH.hairColor), skin: r(SWATCH.skin), eyes: r(SWATCH.eyes), shirt: r(SWATCH.shirt), pants: r(SWATCH.pants), shoes: r(SWATCH.shoes) };
}

export function menuUpdate(G) {
  const U = G.ui, I = G.input, m = I.mouse, M = G.menu;
  let hit = null;
  for (let i = U.regs.length - 1; i >= 0; i--) { const r = U.regs[i]; if (m.x >= r.x && m.x < r.x + r.w && m.y >= r.y && m.y < r.y + r.h) { hit = r; break; } }
  U.hover = hit;
  if (U.slider) { if (m.l) U.slider(m.x); else U.slider = null; }
  if (m.lp) {
    audio.init();
    // any click blurs the focused text field first (clicking a field re-focuses it), so a
    // half-typed name can never keep swallowing keys after a button starts the game
    if (M.focus) { M.focus = null; G.input.text = null; }
    if (hit && hit.click) hit.click(0, false);
  }
  if (m.wheel && hit && hit.wheel) hit.wheel(m.wheel);
  if (I.hit('Escape') && !M.focus && M.screen !== 'loading') {
    const back = { chars: 'title', create: 'chars', worlds: 'chars', newworld: 'worlds', settings: 'title' }[M.screen];
    if (back) M.screen = back;
  }
}

export function menuDraw(G, ctx) {
  const U = G.ui, M = G.menu, W = G.R.W, H = G.R.H;
  U.regs = [];
  renderTitleBg(G, G.R);
  const scr = M.screen;
  if (scr === 'title') {
    const bob = Math.sin(G.tick * 0.03) * 6;
    ctx.save();
    ctx.font = `bold ${Math.min(96, W / 10)}px ${FONT}`; ctx.textAlign = 'center';
    const g = ctx.createLinearGradient(0, H * 0.18, 0, H * 0.28);
    g.addColorStop(0, '#9ae05a'); g.addColorStop(0.55, '#4ab83a'); g.addColorStop(1, '#8a5a30');
    ctx.lineWidth = 10; ctx.strokeStyle = '#10200a'; ctx.lineJoin = 'round';
    ctx.strokeText('Terrabrowser', W / 2, H * 0.26 + bob); ctx.fillStyle = g; ctx.fillText('Terrabrowser', W / 2, H * 0.26 + bob);
    ctx.restore();
    text(ctx, 'dig, fight, explore, build', W / 2, H * 0.26 + 40 + bob, '#ffffff', 18, 'center');
    menuButton(G, ctx, 'Single Player', W / 2, H * 0.48, () => { G.actions.refreshLists(); M.screen = 'chars'; });
    menuButton(G, ctx, 'Settings', W / 2, H * 0.48 + 60, () => { M.screen = 'settings'; });
    text(ctx, 'v1.0  -  all art and audio generated in code', 10, H - 10, '#e0e0e0', 12);
  } else if (scr === 'settings') {
    drawSettings(G, ctx, () => { M.screen = 'title'; });
  } else if (scr === 'chars') {
    const pw = Math.min(620, W - 40), px = W / 2 - pw / 2, py = 90;
    text(ctx, 'Select Character', W / 2, 60, '#fff', 30, 'center');
    panel(ctx, px, py, pw, 380);
    M.chars.slice(0, 5).forEach((c, k) => {
      const y = py + 14 + k * 72, hv = hov(G, px + 10, y, pw - 20, 64);
      rrect(ctx, px + 10, y, pw - 20, 64, 6, hv ? 'rgba(80,100,200,0.9)' : 'rgba(56,72,160,0.8)', '#141c46', 2);
      drawHumanoid(ctx, px + 24, y + 11, c.look, { dir: 1, walk: -1 });
      text(ctx, c.name, px + 70, y + 30, '#fff', 20);
      text(ctx, c.maxHp + ' life, ' + c.maxMana + ' mana', px + 70, y + 52, '#b4d2ff', 13);
      reg(G, px + 10, y, pw - 110, 64, () => { M.char = c; G.actions.refreshLists(); M.screen = 'worlds'; });
      const dx = px + pw - 90, dh = hov(G, dx, y + 18, 70, 28);
      text(ctx, M.confirm === c.id ? 'Sure?' : 'Delete', dx, y + 38, dh ? '#ff6060' : '#e0a0a0', 16);
      reg(G, dx, y + 18, 70, 28, () => { if (M.confirm === c.id) { G.actions.deleteChar(c.id); M.confirm = null; } else M.confirm = c.id; });
    });
    if (!M.chars.length) text(ctx, 'No characters yet.', W / 2, py + 60, '#c8c8c8', 18, 'center');
    menuButton(G, ctx, 'New Character', W / 2 - 130, py + 440, () => { M.look = randomLook(); M.fields.cname = ''; M.screen = 'create'; });
    menuButton(G, ctx, 'Back', W / 2 + 150, py + 440, () => { M.screen = 'title'; });
  } else if (scr === 'create') {
    const pw = Math.min(760, W - 40), px = W / 2 - pw / 2, py = 70;
    text(ctx, 'Create Character', W / 2, 50, '#fff', 30, 'center');
    panel(ctx, px, py, pw, 470);
    ctx.save(); ctx.translate(px + 50, py + 70); ctx.scale(5, 5); ctx.imageSmoothingEnabled = false;
    drawHumanoid(ctx, 0, 0, M.look, { dir: 1, walk: (G.tick * 0.08) % (Math.PI * 2) });
    ctx.restore();
    const fx = px + 220;
    textField(G, ctx, 'cname', 'Name', fx, py + 40, pw - 250, 16);
    text(ctx, 'Hair: ' + HAIR_STYLES[M.look.hair], fx, py + 112, '#fff', 17);
    [['<', -1], ['>', 1]].forEach(([s, d], k) => {
      const bx = fx + 200 + k * 40;
      rrect(ctx, bx, py + 92, 32, 28, 5, hov(G, bx, py + 92, 32, 28) ? 'rgba(90,110,220,0.95)' : 'rgba(44,58,144,0.9)', '#0c1030', 2);
      text(ctx, s, bx + 16, py + 113, '#fff', 17, 'center');
      reg(G, bx, py + 92, 32, 28, () => { M.look.hair = (M.look.hair + d + HAIR_STYLES.length) % HAIR_STYLES.length; G.sfx('click'); });
    });
    const rows = [['Hair color', 'hairColor'], ['Skin', 'skin'], ['Eyes', 'eyes'], ['Shirt', 'shirt'], ['Pants', 'pants'], ['Shoes', 'shoes']];
    rows.forEach(([lab, key], r) => {
      const y = py + 140 + r * 44;
      text(ctx, lab, fx, y + 20, '#fff', 15);
      SWATCH[key].forEach((c, k) => {
        const sx = fx + 100 + k * 34;
        rrect(ctx, sx, y, 28, 28, 4, c, M.look[key] === c ? '#ffe050' : '#0c1030', M.look[key] === c ? 3 : 2);
        reg(G, sx, y, 28, 28, () => { M.look[key] = c; });
      });
    });
    menuButton(G, ctx, 'Randomize', px + 120, py + 440, () => { M.look = randomLook(); }, 22);
    menuButton(G, ctx, 'Create', W / 2 + 60, py + 440, () => {
      const nm = (M.fields.cname || '').trim();
      if (!nm) { M.err = 'Please enter a name.'; return; }
      M.err = null; G.actions.createChar(nm, { ...M.look });
    }, 26);
    menuButton(G, ctx, 'Back', px + pw - 90, py + 440, () => { M.screen = 'chars'; }, 22);
    if (M.err) text(ctx, M.err, W / 2, py + 400, '#ff8080', 16, 'center');
  } else if (scr === 'worlds') {
    const pw = Math.min(620, W - 40), px = W / 2 - pw / 2, py = 90;
    text(ctx, 'Select World  (' + (M.char ? M.char.name : '') + ')', W / 2, 60, '#fff', 30, 'center');
    panel(ctx, px, py, pw, 380);
    M.worlds.slice(0, 5).forEach((w, k) => {
      const y = py + 14 + k * 72, hv = hov(G, px + 10, y, pw - 20, 64);
      rrect(ctx, px + 10, y, pw - 20, 64, 6, hv ? 'rgba(80,100,200,0.9)' : 'rgba(56,72,160,0.8)', '#141c46', 2);
      text(ctx, w.name, px + 24, y + 30, '#fff', 20);
      if (w.difficulty === 'hard') { ctx.font = `bold 20px ${FONT}`; text(ctx, 'HARD', px + 34 + ctx.measureText(w.name).width, y + 30, '#ff4040', 14); }
      text(ctx, 'Seed: ' + w.seedText + '   Played: ' + new Date(w.played).toLocaleDateString(), px + 24, y + 52, '#b4d2ff', 13);
      reg(G, px + 10, y, pw - 110, 64, () => G.actions.playWorld(w));
      const dx = px + pw - 90, dh = hov(G, dx, y + 18, 70, 28);
      text(ctx, M.confirm === w.id ? 'Sure?' : 'Delete', dx, y + 38, dh ? '#ff6060' : '#e0a0a0', 16);
      reg(G, dx, y + 18, 70, 28, () => { if (M.confirm === w.id) { G.actions.deleteWorld(w.id); M.confirm = null; } else M.confirm = w.id; });
    });
    if (!M.worlds.length) text(ctx, 'No worlds yet.', W / 2, py + 60, '#c8c8c8', 18, 'center');
    menuButton(G, ctx, 'New World', W / 2 - 130, py + 440, () => { M.fields.wname = 'World ' + (M.worlds.length + 1); M.fields.seed = String(Math.floor(Math.random() * 1e9)); M.fields.diff = 'normal'; M.screen = 'newworld'; });
    menuButton(G, ctx, 'Back', W / 2 + 150, py + 440, () => { M.screen = 'chars'; });
  } else if (scr === 'newworld') {
    const pw = Math.min(520, W - 40), px = W / 2 - pw / 2, py = 110;
    text(ctx, 'Create World', W / 2, 70, '#fff', 30, 'center');
    panel(ctx, px, py, pw, 330);
    textField(G, ctx, 'wname', 'World name', px + 30, py + 50, pw - 60, 24);
    textField(G, ctx, 'seed', 'Seed (text or number)', px + 30, py + 130, pw - 190, 24);
    const bx = px + pw - 150;
    rrect(ctx, bx, py + 130, 120, 36, 6, hov(G, bx, py + 130, 120, 36) ? 'rgba(90,110,220,0.95)' : 'rgba(44,58,144,0.9)', '#0c1030', 2);
    text(ctx, 'Random', bx + 60, py + 155, '#fff', 16, 'center');
    reg(G, bx, py + 130, 120, 36, () => { M.fields.seed = String(Math.floor(Math.random() * 1e9)); });
    const diff = M.fields.diff || 'normal';
    text(ctx, 'Difficulty', px + 30, py + 202, '#fff', 16);
    [['normal', 'Normal', '#5ac040'], ['hard', 'Hard', '#e03030']].forEach(([key, label, col], k) => {
      const dbx = px + 30 + k * 140, dby = py + 212, on = diff === key;
      rrect(ctx, dbx, dby, 128, 36, 6, on ? col : hov(G, dbx, dby, 128, 36) ? 'rgba(90,110,220,0.95)' : 'rgba(44,58,144,0.9)', on ? '#fff' : '#0c1030', 2);
      text(ctx, label, dbx + 64, dby + 25, '#fff', 17, 'center');
      reg(G, dbx, dby, 128, 36, () => { M.fields.diff = key; });
    });
    text(ctx, diff === 'hard' ? 'Diabolical. Enemies hit twice as hard, bosses are brutal. Good luck.' : 'The classic experience.', px + 30, py + 272, diff === 'hard' ? '#ff6060' : '#b4d2ff', 14);
    text(ctx, 'Size: 1600 x 600 tiles', px + 30, py + 305, '#b4d2ff', 14);
    menuButton(G, ctx, 'Create', W / 2 - 90, py + 390, () => G.actions.createWorld((M.fields.wname || 'World').trim() || 'World', M.fields.seed || '0', diff));
    menuButton(G, ctx, 'Back', W / 2 + 110, py + 390, () => { M.screen = 'worlds'; });
  } else if (scr === 'loading') {
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, W, H);
    text(ctx, M.loading.title || 'Generating world', W / 2, H / 2 - 50, '#fff', 30, 'center');
    text(ctx, M.loading.text + '...', W / 2, H / 2 - 10, '#e0e0e0', 18, 'center');
    const bw = Math.min(500, W - 60);
    rrect(ctx, W / 2 - bw / 2, H / 2 + 10, bw, 22, 6, 'rgba(10,15,40,0.9)', '#000', 2);
    rrect(ctx, W / 2 - bw / 2 + 3, H / 2 + 13, (bw - 6) * M.loading.frac, 16, 4, '#5ac040', null);
  }
  drawCursor(G, ctx);
}
