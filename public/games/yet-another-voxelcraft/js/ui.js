import * as B from './blocks.js';

const $ = (id) => document.getElementById(id);
function patURL(rows, pal, outline = true) {
  const h = rows.length, w = rows[0].length, S = 3, cv = document.createElement('canvas'); cv.width = (w + 2) * S; cv.height = (h + 2) * S; const c = cv.getContext('2d');
  const at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? '.' : rows[y][x];
  for (let y = -1; y <= h; y++) for (let x = -1; x <= w; x++) {
    const ch = at(x, y);
    if (ch !== '.') c.fillStyle = pal[ch];
    else if (outline && (at(x + 1, y) !== '.' || at(x - 1, y) !== '.' || at(x, y + 1) !== '.' || at(x, y - 1) !== '.')) c.fillStyle = '#000'; else continue;
    c.fillRect((x + 1) * S, (y + 1) * S, S, S);
  }
  return cv.toDataURL();
}
const HEART = ['.11...11.', '122.1.221', '122111111', '111111111', '.1111111.', '..11111..', '...111...', '....1....'];
const HEART_HALF = ['.11...33.', '122.3.333', '122133333', '111133333', '.1113333.', '..11333..', '...133...', '....3....'];
const HEART_EMPTY = HEART.map((r) => r.replace(/[12]/g, '3'));
const FOOD = ['....111..', '...12221.', '..122221.', '..111111.', '...1111..', '..44.1...', '.44......', '.4.......'];
const FOOD_HALF = ['....333..', '...32221.'.replace('3', '3'), '..322221.', '..311111.', '...3111..', '..44.1...', '.44......', '.4.......'];
const FOOD_EMPTY = FOOD.map((r) => r.replace(/[12]/g, '3'));
const BUBBLE = ['..111..', '.12.11.', '1.....1', '1.....1', '1.....1', '.11.11.', '..111..'];
const ARM = ['.11...11.', '122.1.221', '122111111', '.1111111.', '.1111111.', '.1111111.', '..11.11..'];
const ARM_HALF = ['.11...33.', '122.3.333', '122133333', '.1113333.', '.1113333.', '.1113333.', '..11.33..'];
const ARM_EMPTY = ARM.map((r) => r.replace(/[12]/g, '3'));
export const IMG = {
  a1: patURL(ARM, { 1: '#c4c8d4', 2: '#f4f6ff', 3: '#33343c' }), a05: patURL(ARM_HALF, { 1: '#c4c8d4', 2: '#f4f6ff', 3: '#33343c' }), a0: patURL(ARM_EMPTY, { 1: '#c4c8d4', 2: '#f4f6ff', 3: '#33343c' }),
  h1: patURL(HEART, { 1: '#d61f1f', 2: '#ff9a9a', 3: '#3b1212' }), h05: patURL(HEART_HALF, { 1: '#d61f1f', 2: '#ff9a9a', 3: '#3b1212' }), h0: patURL(HEART_EMPTY, { 1: '#d61f1f', 2: '#ff9a9a', 3: '#3b1212' }),
  f1: patURL(FOOD, { 1: '#b8652a', 2: '#e8a866', 3: '#3a2a1a', 4: '#eee' }), f05: patURL(FOOD_HALF, { 1: '#b8652a', 2: '#e8a866', 3: '#3a2a1a', 4: '#eee' }), f0: patURL(FOOD_EMPTY, { 1: '#b8652a', 2: '#e8a866', 3: '#3a2a1a', 4: '#eee' }),
  air: patURL(BUBBLE, { 1: '#7ab8ff', 2: '#fff' }),
};

export class UI {
  constructor(game) {
    this.game = game; this.dirtyInv = true; this.scr = null; this.cursor = null; this.containers = new Map();
    this.hb = $('hotbar'); this.hbEls = [];
    for (let i = 0; i < 9; i++) { const d = document.createElement('div'); d.className = 'slot'; this.hb.appendChild(d); this.hbEls.push(d); }
    this.hoverSlot = null; this.lastSel = -1; this.sig = '';
    const panel = $('panel');
    panel.addEventListener('mousedown', (e) => this.onDown(e));
    panel.addEventListener('mouseover', (e) => this.onOver(e));
    panel.addEventListener('mouseout', () => { $('tip').style.display = 'none'; this.hoverSlot = null; });
    panel.addEventListener('contextmenu', (e) => e.preventDefault());
    $('screen').addEventListener('mousedown', (e) => { if (e.target === $('screen') && this.cursor) { this.game.spawnItem(this.cursor.id, this.cursor.n, this.game.player.x, this.game.player.eyeY - 0.3, this.game.player.z, this.cursor.d, this.dirVel()); this.cursor = null; this.renderCursor(); } });
    document.addEventListener('mousemove', (e) => { const c = $('cursor'); c.style.left = e.clientX - 20 + 'px'; c.style.top = e.clientY - 20 + 'px'; const t = $('tip'); t.style.left = e.clientX + 14 + 'px'; t.style.top = e.clientY - 34 + 'px'; });
    document.addEventListener('keydown', (e) => { if (e.target && e.target.tagName === 'INPUT') return; if (this.scr && /^[1-9]$/.test(e.key) && this.hoverSlot) this.hotSwap(this.hoverSlot, +e.key - 1); });
    this.namePop = 0;
  }
  dirVel() { const p = this.game.player, cp = Math.cos(p.pitch); return [-Math.sin(p.yaw) * cp * 4, Math.sin(p.pitch) * 4 + 1.5, -Math.cos(p.yaw) * cp * 4]; }
  get isOpen() { return !!this.scr; }
  toast(msg) { const d = document.createElement('div'); d.textContent = msg; $('toasts').appendChild(d); setTimeout(() => d.remove(), 3600); if ($('toasts').children.length > 4) $('toasts').firstChild.remove(); }

  // -------------------------------------------------------------- HUD
  slotHTML(s, big) {
    if (!s) return '';
    const it = B.ITEMS[s.id]; let h = `<img class="pix" src="${B.iconURL(s.id)}" draggable="false">`;
    if (s.n > 1) h += `<span class="n">${s.n}</span>`;
    if (it && it.tool && s.d !== undefined && s.d < it.tool.dur) { const f = s.d / it.tool.dur; h += `<div class="d"><i style="width:${f * 100}%;background:hsl(${f * 120},90%,50%)"></i></div>`; }
    return h;
  }
  updateHud(dt) {
    const p = this.game.player;
    if (this.dirtyInv || this.lastSel !== p.sel) {
      for (let i = 0; i < 9; i++) { this.hbEls[i].innerHTML = this.slotHTML(p.inv[i]); this.hbEls[i].classList.toggle('sel', i === p.sel); }
      if (this.lastSel !== p.sel || this.lastHeldId !== (p.inv[p.sel] && p.inv[p.sel].id)) {
        const s = p.inv[p.sel], el = $('itemname'); if (s) { el.textContent = B.itemName(s.id); el.style.opacity = 1; this.namePop = 2.2; } else el.style.opacity = 0;
      }
      this.lastSel = p.sel; this.lastHeldId = p.inv[p.sel] && p.inv[p.sel].id; this.dirtyInv = false;
    }
    if (this.namePop > 0) { this.namePop -= dt; if (this.namePop <= 0) $('itemname').style.opacity = 0; }
    const sig = `${Math.ceil(p.health)}|${p.hunger}|${Math.ceil(p.air)}|${p.creative}|${p.headWater}`;
    if (sig !== this.sig) {
      this.sig = sig;
      $('bars').style.display = p.creative ? 'none' : 'flex';
      let h = '', f = '';
      const hp = Math.ceil(p.health);
      for (let i = 0; i < 10; i++) { const v = hp - i * 2; h += `<img class="pix" src="${v >= 2 ? IMG.h1 : v === 1 ? IMG.h05 : IMG.h0}">`; const fv = p.hunger - i * 2; f += `<img class="pix" src="${fv >= 2 ? IMG.f1 : fv === 1 ? IMG.f05 : IMG.f0}">`; }
      $('hearts').innerHTML = h; $('food').innerHTML = f;
      let a = ''; if (p.headWater && !p.creative) for (let i = 0; i < Math.ceil(p.air); i++) a += `<img class="pix" src="${IMG.air}">`;
      $('air').innerHTML = a;
    }
    const pts = p.armorPts(), asig = pts + '|' + p.creative;
    if (asig !== this.armorSig) { this.armorSig = asig; let a = ''; if (pts > 0 && !p.creative) for (let i = 0; i < 10; i++) { const v = pts - i * 2; a += `<img class="pix" src="${v >= 2 ? IMG.a1 : v === 1 ? IMG.a05 : IMG.a0}">`; } $('armorbar').innerHTML = a; }
    $('dmg').style.opacity = Math.min(1, p.hurtFlash * 2);
    $('underwater').style.opacity = p.headWater ? 1 : 0;
    $('fire').style.opacity = p.fireT > 0 ? 0.8 : 0;
    const eat = $('eat'); if (p.eatT > 0) { eat.style.display = 'block'; eat.firstChild.style.width = (p.eatT / 1.6 * 100) + '%'; } else eat.style.display = 'none';
    const mi = $('mineinfo'); if (p.target && !p.creative && p.mineProgress > 0) mi.textContent = '';
  }
  // -------------------------------------------------------------- screens
  openInventory() { this.scr = { type: 'inv', craft: new Array(4).fill(null), w: 2, h: 2 }; this.show(); }
  openContainer(block, x, y, z) {
    if (block === B.CHEST && this.game.achieve) this.game.achieve('treasure');
    if (block === B.CRAFTING) this.scr = { type: 'table', craft: new Array(9).fill(null), w: 3, h: 3 };
    else {
      const k = x + ',' + y + ',' + z; let c = this.containers.get(k);
      if (!c) { c = block === B.FURNACE ? { type: 'furnace', s: [null, null, null], burn: 0, burnMax: 1, prog: 0 } : { type: 'chest', slots: new Array(27).fill(null) }; this.containers.set(k, c); }
      this.scr = { type: c.type, cont: c, craft: [], w: 0, h: 0 };
    }
    this.game.sound.play('click'); this.show();
  }
  show() {
    this.lastToggle = performance.now(); $('screen').style.display = 'flex'; this.game.releasePointer(); this.cursor = null; this.render(); this.game.paused = false;
  }
  close() {
    if (!this.scr) return;
    const g = this.game, p = g.player;
    for (const s of this.scr.craft) if (s) { const left = p.addItem(s.id, s.n, s.d); if (left > 0) g.spawnItem(s.id, left, p.x, p.eyeY - 0.3, p.z, s.d, this.dirVel()); }
    if (this.cursor) { const s = this.cursor, left = p.addItem(s.id, s.n, s.d); if (left > 0) g.spawnItem(s.id, left, p.x, p.eyeY - 0.3, p.z, s.d, this.dirVel()); this.cursor = null; }
    this.lastToggle = performance.now(); this.scr = null; this.renderCursor(); $('screen').style.display = 'none'; $('tip').style.display = 'none'; this.dirtyInv = true;
    g.requestPointer();
  }
  dropContainer(x, y, z, b) {
    const k = x + ',' + y + ',' + z, c = this.containers.get(k); if (!c) return;
    const list = c.type === 'chest' ? c.slots : c.s;
    for (const s of list) if (s) this.game.spawnItem(s.id, s.n, x + 0.5, y + 0.5, z + 0.5, s.d);
    this.containers.delete(k);
  }
  paletteIds() {
    if (this._pal) return this._pal;
    const ids = Object.keys(B.ITEMS).map(Number).filter((id) => id !== B.BEDROCK && (id < 256 || id >= 256)).sort((a, b) => a - b);
    return (this._pal = ids);
  }
  slotEl(g, i, s, cls = '') { return `<div class="slot big ${cls}" data-g="${g}" data-i="${i}">${this.slotHTML(s)}</div>`; }
  palList() {
    const q = (this.palQuery || '').toLowerCase(), tab = this.palTab || 'all';
    return this.paletteIds().filter((id) => {
      const it = B.ITEMS[id]; const kind = id < 256 ? 'blocks' : (it.tool || it.armor || it.bow) ? 'tools' : 'items';
      return (tab === 'all' || tab === kind) && (!q || it.name.toLowerCase().includes(q));
    });
  }
  palHTML() { return this.palList().map((id) => `<div class="slot big" data-g="pal" data-i="${id}"><img class="pix" src="${B.iconURL(id)}" draggable="false"></div>`).join(''); }
  recipeList() {
    const sc = this.scr, out = [], seen = new Set();
    for (let i = 0; i < B.RECIPES.length; i++) {
      const r = B.RECIPES[i]; if (!r.id || !B.ITEMS[r.id] || seen.has(r.id)) continue;
      seen.add(r.id); out.push(i);
    }
    return out;
  }
  recipeNeeds(r) {
    const need = new Map(); const ids = r.shaped ? r.grid.filter(Boolean) : r.list;
    for (const id of ids) need.set(id, (need.get(id) || 0) + 1); return need;
  }
  haveCount(id) { let c = this.game.player.countItem(id); for (const s of this.scr.craft) if (s && s.id === id) c += s.n; return c; }
  fits(r) { const sc = this.scr; return r.shaped ? (r.w <= sc.w && r.h <= sc.h) : r.list.length <= sc.w * sc.h; }
  canCraft(r) {
    if (!this.fits(r)) return false; for (const [id, n] of this.recipeNeeds(r)) if (this.haveCount(id) < n) return false; return true; }
  fillRecipe(r) {
    const sc = this.scr, p = this.game.player;
    if (!this.fits(r)) { this.toast('Needs a crafting table'); return; }
    if (!this.canCraft(r)) { this.toast('Missing ingredients'); return; }
    for (let i = 0; i < sc.craft.length; i++) if (sc.craft[i]) { const s = sc.craft[i]; const left = p.addItem(s.id, s.n, s.d); if (left > 0) this.game.spawnItem(s.id, left, p.x, p.eyeY - 0.3, p.z, s.d, this.dirVel()); sc.craft[i] = null; }
    if (r.shaped) { for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) { const id = r.grid[y * r.w + x]; if (id && p.takeItem(id)) sc.craft[y * sc.w + x] = { id, n: 1 }; } }
    else { let k = 0; for (const id of r.list) if (p.takeItem(id)) sc.craft[k++] = { id, n: 1 }; }
    this.dirtyInv = true;
  }
  recipeTip(r) {
    const need = this.recipeNeeds(r); const parts = []; for (const [id, n] of need) parts.push(`${n}x ${B.itemName(id)}`);
    return `${B.itemName(r.id)}${r.n > 1 ? ' x' + r.n : ''}  =  ${parts.join(' + ')}${this.fits(r) ? '' : '  (needs crafting table)'}`;
  }
  bookHTMLList() {
    const q = (this.bookQuery || '').toLowerCase();
    const list = this.recipeList().map((i) => ({ i, ok: this.canCraft(B.RECIPES[i]) })).filter((e) => (this.bookTab !== 'craft' || e.ok) && (!q || B.itemName(B.RECIPES[e.i].id).toLowerCase().includes(q))).sort((a, b) => (b.ok - a.ok));
    if (!list.length) return '<div style="grid-column:1/-1;font:12px monospace;padding:6px;color:#555">Nothing here yet.</div>';
    return list.map((e) => `<div class="slot big rb ${e.ok ? '' : 'dim'}" data-g="rec" data-i="${e.i}" style="width:44px;height:44px"><img class="pix" src="${B.iconURL(B.RECIPES[e.i].id)}" draggable="false" style="width:32px;height:32px"></div>`).join('');
  }
  render() {
    const sc = this.scr; if (!sc) return; const p = this.game.player; const inv = p.inv;
    let h = '';
    const title = { inv: p.creative ? 'Creative Inventory' : 'Inventory', table: 'Crafting Table', furnace: 'Furnace', chest: 'Chest' }[sc.type];
    const book = (sc.type === 'inv' && !p.creative) || sc.type === 'table';
    let bookHTML = '';
    if (book) {
      bookHTML = `<div id="book"><h3>Recipes</h3><div class="tabs" style="flex-wrap:wrap"><span data-btab="all" class="${this.bookTab !== 'craft' ? 'on' : ''}">all</span><span data-btab="craft" class="${this.bookTab === 'craft' ? 'on' : ''}">craftable</span><input id="bsearch" placeholder="search..." value="${(this.bookQuery || '').replace(/"/g, '')}" style="width:100%;margin:4px 0 0"></div><div class="grid" id="bookgrid" style="grid-template-columns:repeat(4,44px)">${this.bookHTMLList()}</div></div>`;
    }
    h += `<div style="display:flex;gap:14px;align-items:flex-start">${bookHTML}<div>`;
    h += `<h3>${title}</h3>`;
    if (sc.type === 'inv' && p.creative) {
      const tabs = ['all', 'blocks', 'items', 'tools'];
      h += `<div class="tabs">${tabs.map((t) => `<span data-tab="${t}" class="${(this.palTab || 'all') === t ? 'on' : ''}">${t}</span>`).join('')}<input id="psearch" placeholder="search..." value="${(this.palQuery || '').replace(/"/g, '')}"></div>`;
      h += `<div id="creative"><div class="grid" id="palgrid" style="grid-template-columns:repeat(9,46px)">${this.palHTML()}</div></div>`;
    } else if (sc.type === 'inv' || sc.type === 'table') {
      this.updateCraft(); const w = sc.w;
      h += `<div class="row" style="margin-bottom:10px">`;
      if (sc.type === 'inv') { h += `<div class="grid" style="grid-template-columns:46px">`; for (let i = 0; i < 4; i++) h += this.slotEl('armor', i, p.armor[i], 'armorslot'); h += `</div>`; }
      h += `<div class="grid" style="grid-template-columns:repeat(${w},46px)">`;
      for (let i = 0; i < sc.craft.length; i++) h += this.slotEl('craft', i, sc.craft[i]);
      h += `</div><div class="arrow"></div>${this.slotEl('out', 0, this.craftOut, 'out')}</div>`;
    } else if (sc.type === 'furnace') {
      const c = sc.cont;
      h += `<div class="row" style="margin-bottom:10px"><div><div>${this.slotEl('fur', 0, c.s[0])}</div><div class="flame" id="flame" style="margin:6px 10px"></div><div>${this.slotEl('fur', 1, c.s[1])}</div></div><div class="arrow prog" id="farrow"></div>${this.slotEl('fur', 2, c.s[2], 'out')}</div>`;
    } else if (sc.type === 'chest') {
      h += `<div class="grid" style="grid-template-columns:repeat(9,46px);margin-bottom:10px">`; for (let i = 0; i < 27; i++) h += this.slotEl('chest', i, sc.cont.slots[i]); h += '</div>';
    }
    h += `<div class="grid" style="grid-template-columns:repeat(9,46px)">`;
    for (let i = 9; i < 36; i++) h += this.slotEl('inv', i, inv[i]);
    h += '</div><div class="sep"></div><div class="grid" style="grid-template-columns:repeat(9,46px)">';
    for (let i = 0; i < 9; i++) h += this.slotEl('inv', i, inv[i]);
    h += '</div></div></div>';
    $('panel').innerHTML = h; this.renderCursor();
    { const pn = $('panel'); pn.style.zoom = 1; const k = Math.min(1, (innerWidth - 12) / (pn.offsetWidth + 8), (innerHeight - 12) / (pn.offsetHeight + 8)); pn.style.zoom = k < 1 ? k : 1; }
    const bs = $('bsearch'); if (bs) bs.oninput = (e) => { this.bookQuery = e.target.value; $('bookgrid').innerHTML = this.bookHTMLList(); };
    const ps = $('psearch'); if (ps) ps.oninput = (e) => { this.palQuery = e.target.value; $('palgrid').innerHTML = this.palHTML(); };
    this.tickScreen();
  }
  tickScreen() {
    const sc = this.scr; if (!sc || sc.type !== 'furnace') return; const c = sc.cont;
    const fl = $('flame'), ar = $('farrow'); if (fl) fl.style.setProperty('--p', (c.burn > 0 ? Math.min(100, c.burn / c.burnMax * 100) : 0) + '%'); if (ar) ar.style.setProperty('--p', (c.prog / 5 * 100) + '%');
  }
  renderCursor() {
    const c = $('cursor'); if (!this.cursor) { c.style.display = 'none'; return; }
    c.style.display = 'block'; c.innerHTML = `<img class="pix" src="${B.iconURL(this.cursor.id)}">${this.cursor.n > 1 ? `<span class="n">${this.cursor.n}</span>` : ''}`;
  }
  arr(g) {
    const p = this.game.player, sc = this.scr;
    if (g === 'inv') return p.inv; if (g === 'armor') return p.armor; if (g === 'craft') return sc.craft; if (g === 'chest') return sc.cont.slots; if (g === 'fur') return sc.cont.s; return null;
  }
  updateCraft() {
    const sc = this.scr; if (!sc || !sc.w) { this.craftOut = null; return; }
    const r = B.matchRecipe(sc.craft.map((s) => (s ? s.id : 0)), sc.w, sc.h);
    this.craftOut = r ? { id: r.id, n: r.n } : null;
  }
  onOver(e) {
    const el = e.target.closest('.slot'); if (!el) return; const g = el.dataset.g, i = +el.dataset.i;
    if (g === 'rec') { const tip = $('tip'); tip.textContent = this.recipeTip(B.RECIPES[i]); tip.style.display = 'block'; return; }
    this.hoverSlot = { g, i };
    let s = g === 'pal' ? { id: i } : g === 'out' ? this.craftOut : this.arr(g) && this.arr(g)[i];
    const tip = $('tip'); if (s) { let t = B.itemName(s.id); if (s.d !== undefined && B.ITEMS[s.id].tool) t += ` (${s.d}/${B.ITEMS[s.id].tool.dur})`; tip.textContent = t; tip.style.display = 'block'; } else tip.style.display = 'none';
  }
  hotSwap(hs, n) {
    const p = this.game.player; if (hs.g === 'pal') { p.inv[n] = { id: hs.i, n: B.ITEMS[hs.i].stack }; if (B.ITEMS[hs.i].tool) p.inv[n].d = B.ITEMS[hs.i].tool.dur; }
    else if (hs.g === 'inv' || hs.g === 'chest') { const a = this.arr(hs.g); const t = a[hs.i]; a[hs.i] = p.inv[n]; p.inv[n] = t; }
    this.dirtyInv = true; this.render();
  }
  onDown(e) {
    const tb = e.target.closest('[data-tab]'); if (tb) { this.palTab = tb.dataset.tab; this.render(); return; }
    const bt = e.target.closest('[data-btab]'); if (bt) { this.bookTab = bt.dataset.btab; this.render(); return; }
    const el = e.target.closest('.slot'); if (!el) return; e.preventDefault();
    if (el.dataset.g === 'rec') { const r = B.RECIPES[+el.dataset.i]; this.fillRecipe(r); this.game.sound.play('click', { vol: 0.5 }); this.render(); return; }
    this.click(el.dataset.g, +el.dataset.i, e.button, e.shiftKey);
    this.game.sound.play('click', { vol: 0.5 });
    this.dirtyInv = true; this.render(); this.onOver({ target: document.elementFromPoint(e.clientX, e.clientY) || el });
  }
  stackMax(id) { return (B.ITEMS[id] && B.ITEMS[id].stack) || 64; }
  moveTo(list, s, ranges) { // merge/place stack s into list within ranges [[a,b]..]; returns leftover
    const ms = this.stackMax(s.id);
    for (const [a, b] of ranges) for (let i = a; i < b && s.n > 0; i++) { const t = list[i]; if (t && t.id === s.id && ms > 1 && t.n < ms) { const m = Math.min(s.n, ms - t.n); t.n += m; s.n -= m; } }
    for (const [a, b] of ranges) for (let i = a; i < b && s.n > 0; i++) if (!list[i]) { list[i] = { id: s.id, n: Math.min(ms, s.n) }; if (s.d !== undefined) list[i].d = s.d; s.n -= list[i].n; }
    return s.n;
  }
  craftOnce(p) {
    const sc = this.scr, r = this.craftOut; if (!r) return false;
    const ms = this.stackMax(r.id);
    return { r, ms };
  }
  consumeCraft() { const sc = this.scr; for (let i = 0; i < sc.craft.length; i++) if (sc.craft[i]) { sc.craft[i].n--; if (sc.craft[i].n <= 0) sc.craft[i] = null; } this.updateCraft(); }
  click(g, i, btn, shift) {
    const p = this.game.player, sc = this.scr;
    if (g === 'pal') {
      const it = B.ITEMS[i]; if (this.cursor && this.cursor.id === i) { this.cursor = null; return; }
      if (shift) { this.moveTo(p.inv, { id: i, n: it.stack, d: it.tool ? it.tool.dur : undefined }, [[0, 36]]); return; }
      this.cursor = { id: i, n: btn === 2 ? 1 : it.stack }; if (it.tool) this.cursor.d = it.tool.dur; return;
    }
    if (g === 'out') {
      const r = this.craftOut; if (!r) return;
      if (shift) { let n = 0; while (this.craftOut && n < 64) { if (this.game.onCraft) this.game.onCraft(this.craftOut.id); const s = { id: this.craftOut.id, n: this.craftOut.n }; const left = this.moveTo(p.inv, s, [[0, 36]]); if (left > 0) break; this.consumeCraft(); n++; } this.game.sound.play('craft'); return; }
      if (this.game.onCraft) this.game.onCraft(r.id);
      if (!this.cursor) this.cursor = { id: r.id, n: r.n };
      else if (this.cursor.id === r.id && this.cursor.n + r.n <= this.stackMax(r.id)) this.cursor.n += r.n; else return;
      this.consumeCraft(); this.game.sound.play('craft'); return;
    }
    const a = this.arr(g); if (!a) return; const s = a[i];
    if (g === 'armor') {
      if (shift) { if (s) { const left = this.moveTo(p.inv, s, [[0, 36]]); if (left <= 0) a[i] = null; } return; }
      if (!this.cursor) { if (s) { this.cursor = s; a[i] = null; } return; }
      const it = B.ITEMS[this.cursor.id]; if (!it || !it.armor || it.armor.slot !== i) return;
      a[i] = this.cursor; this.cursor = s; this.game.sound.play('craft'); this.game.onEquip && this.game.onEquip(); return;
    }
    if (shift && s && g === 'inv' && B.ITEMS[s.id].armor && !p.armor[B.ITEMS[s.id].armor.slot]) { p.armor[B.ITEMS[s.id].armor.slot] = s; a[i] = null; this.game.sound.play('craft'); this.game.onEquip && this.game.onEquip(); return; }
    if (g === 'fur' && i === 2) {
      if (!s) return;
      if (shift) { const left = this.moveTo(p.inv, s, [[0, 36]]); if (left <= 0) a[i] = null; return; }
      if (!this.cursor) { this.cursor = s; a[i] = null; } else if (this.cursor.id === s.id && this.cursor.n + s.n <= this.stackMax(s.id)) { this.cursor.n += s.n; a[i] = null; }
      return;
    }
    if (shift && s) {
      if (g === 'inv') {
        let list = null, ranges = null;
        if (sc.type === 'chest') { list = sc.cont.slots; ranges = [[0, 27]]; }
        else if (sc.type === 'furnace') { const f = sc.cont.s; if (B.SMELT.has(s.id)) { list = f; ranges = [[0, 1]]; } else if (B.ITEMS[s.id].fuel) { list = f; ranges = [[1, 2]]; } }
        if (!list) { list = p.inv; ranges = i < 9 ? [[9, 36]] : [[0, 9]]; }
        const left = this.moveTo(list, s, ranges); if (left <= 0) a[i] = null;
      } else { const left = this.moveTo(p.inv, s, [[0, 9], [9, 36]]); if (left <= 0) a[i] = null; }
      return;
    }
    const ms = s ? this.stackMax(s.id) : 64;
    if (btn === 2) { // right
      if (!this.cursor) { if (s) { const half = Math.ceil(s.n / 2); this.cursor = { id: s.id, n: half }; if (s.d !== undefined) this.cursor.d = s.d; s.n -= half; if (s.n <= 0) a[i] = null; } }
      else if (!s) { if (g === 'fur' && i === 2) return; a[i] = { id: this.cursor.id, n: 1 }; if (this.cursor.d !== undefined) a[i].d = this.cursor.d; this.cursor.n--; if (this.cursor.n <= 0) this.cursor = null; }
      else if (s.id === this.cursor.id && s.n < ms) { s.n++; this.cursor.n--; if (this.cursor.n <= 0) this.cursor = null; }
      else { a[i] = this.cursor; this.cursor = s; }
    } else {
      if (!this.cursor) { if (s) { this.cursor = s; a[i] = null; } }
      else if (!s) { a[i] = this.cursor; this.cursor = null; }
      else if (s.id === this.cursor.id && ms > 1) { const m = Math.min(this.cursor.n, ms - s.n); s.n += m; this.cursor.n -= m; if (this.cursor.n <= 0) this.cursor = null; }
      else { a[i] = this.cursor; this.cursor = s; }
    }
  }
  // -------------------------------------------------------------- furnaces
  tickFurnaces(dt) {
    for (const c of this.containers.values()) {
      if (c.type !== 'furnace') continue;
      const inp = c.s[0], fuel = c.s[1], out = c.s[2];
      if (c.burn > 0) c.burn -= dt;
      const res = inp ? B.SMELT.get(inp.id) : undefined;
      const can = res !== undefined && (!out || (out.id === res && out.n < 64));
      if (c.burn <= 0 && can && fuel && B.ITEMS[fuel.id] && B.ITEMS[fuel.id].fuel) { c.burn = c.burnMax = B.ITEMS[fuel.id].fuel; fuel.n--; if (fuel.n <= 0) c.s[1] = null; this.mark(c); }
      if (c.burn > 0 && can) {
        c.prog += dt;
        if (c.prog >= 5) { c.prog = 0; if (out) out.n++; else c.s[2] = { id: res, n: 1 }; inp.n--; if (inp.n <= 0) c.s[0] = null; this.mark(c); }
      } else c.prog = Math.max(0, c.prog - dt * 2);
    }
    if (this.scr && this.scr.type === 'furnace') { this.tickScreen(); if (this.needRender) { this.needRender = false; const keep = this.cursor; this.render(); } }
  }
  mark(c) { if (this.scr && this.scr.cont === c) this.needRender = true; }
  serialize() {
    const out = [];
    for (const [k, c] of this.containers) out.push([k, c]);
    return out;
  }
  restore(list) { this.containers = new Map(list || []); }
}
