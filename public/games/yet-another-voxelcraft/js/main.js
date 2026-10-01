import * as THREE from 'three';
import * as B from './blocks.js';
import { World, CH, SEA } from './world.js';
import { BIOME_NAMES } from './worldgen.js';
import { createAtlasTexture, createMaterials, Sky, Particles, makeItemMesh, setItemLight } from './render.js';
import { Sound } from './audio.js';
import { Player } from './player.js';
import { UI } from './ui.js';
import { Mob } from './mobs.js';
import { ItemEntity, FallingBlock, PrimedTNT } from './entities.js';
import { Weather } from './weather.js';
import { initTouch } from './touch.js';

const $ = (id) => document.getElementById(id);
const SAVE_KEY = 'voxelcraft_save_v1', SET_KEY = 'voxelcraft_settings_v1';
const canvas = $('gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, (('ontouchstart' in window) || navigator.maxTouchPoints > 1) ? 1.25 : 1.75));
renderer.autoClear = false; renderer.info.autoReset = false;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 1, 0.05, 1800);
const handScene = new THREE.Scene(), handCam = new THREE.PerspectiveCamera(60, 1, 0.02, 10);
const atlas = createAtlasTexture();
const mats = createMaterials(atlas);
const sky = new Sky(scene);
const particles = new Particles(scene, 700);
const sound = new Sound();
const weather = new Weather(scene, null);

const touchMode = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window || navigator.maxTouchPoints > 1;
const settings = Object.assign({ render: touchMode ? 5 : 7, fov: 75, vol: 70, music: 1, sens: 100, mode: 's', diff: 1 }, (() => { try { return JSON.parse(localStorage.getItem(SET_KEY) || '{}'); } catch (e) { return {}; } })());
const saveSettings = () => { try { localStorage.setItem(SET_KEY, JSON.stringify(settings)); } catch (e) {} };

// ---------------------------------------------------------------- game object
const game = window.game = {
  tp(x, y, z, yaw, pitch) { player.x = x; player.y = y; player.z = z; if (yaw !== undefined) player.yaw = yaw; if (pitch !== undefined) player.pitch = pitch; player.vy = 0; },
  scene, camera, sound, particles, mobs: [], items: [], projectiles: [], falling: [], world: null, player: null, ui: null,
  env: { day: 1, tod: 0.08, dayLight: 1 }, difficulty: 1, raining: false, paused: false, state: 'menu', time: 0, settings,
  lightAt(x, y, z) {
    const v = this.world.getLight(Math.floor(x), Math.floor(y), Math.floor(z));
    const sk = Math.pow((v >> 4) / 15, 1.55) * this.env.dayLight, bk = Math.pow((v & 15) / 15, 1.7);
    return Math.min(1, 0.06 + Math.max(sk, bk) * 0.94);
  },
  spawnItem(id, n, x, y, z, d, vel) {
    if (!id || n <= 0) return;
    const v = vel || [(Math.random() - 0.5) * 2.4, 3 + Math.random() * 2, (Math.random() - 0.5) * 2.4];
    this.items.push(new ItemEntity(this, id, n, x, y, z, v[0], v[1], v[2], d));
    if (this.items.length > 260) this.items.shift().remove();
  },
  releasePointer() { if (document.pointerLockElement) document.exitPointerLock(); },
  requestPointer() { if (touchMode) return; setTimeout(() => { if (!locked() && game.state === 'play' && !ui.isOpen && !game.paused && !lockFail) { lockFail = true; ui.toast('Mouse capture blocked by this browser' + (window.isSecureContext ? '' : ' (page is not HTTPS)') + ': steer by moving the cursor left/right/up/down of screen centre'); } }, 700); try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) {} },
  supported(x, y, z, id) {
    const w = this.world;
    if (B.SOLID[w.getBlock(x, y - 1, z)]) return true;
    if (id === B.TORCH) for (const [a, c] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (B.SOLID[w.getBlock(x + a, y, z + c)]) return true;
    return false;
  },
  checkSupport(x, y, z, side) {
    const w = this.world, b = w.getBlock(x, y, z);
    if (B.SHAPE[b] === 1 || b === B.TORCH) {
      if (!this.supported(x, y, z, b)) {
        const d = B.BLOCKS[b]; w.setBlock(x, y, z, 0); if (d.drop && !this.player.creative) this.spawnItem(d.drop, 1, x + 0.5, y + 0.5, z + 0.5);
        particles.burst(x + 0.5, y + 0.5, z + 0.5, B.tileAvg(d.tiles.top), 6, 2); this.checkSupport(x, y + 1, z);
      }
    }
    if (b === B.CACTUS && !side) { const below = w.getBlock(x, y - 1, z); if (below !== B.SAND && below !== B.CACTUS) { w.setBlock(x, y, z, 0); this.spawnItem(B.CACTUS, 1, x + 0.5, y + 0.5, z + 0.5); this.checkSupport(x, y + 1, z); } }
  },
  igniteTNT(x, y, z, fuse) {
    if (this.world.getBlock(x, y, z) !== B.TNT) return;
    this.world.setBlock(x, y, z, 0); this.falling.push(new PrimedTNT(this, x, y, z, fuse || 3.2)); if (!fuse) this.achieve('boom');
  },
  explode(x, y, z, r) {
    const w = this.world; sound.play('explode', { pos: { x, y, z } });
    const R = Math.ceil(r + 1);
    for (let dy = -R; dy <= R; dy++) for (let dz = -R; dz <= R; dz++) for (let dx = -R; dx <= R; dx++) {
      const d = Math.hypot(dx, dy, dz); if (d > r * (0.8 + Math.random() * 0.4)) continue;
      const bx = Math.floor(x) + dx, by = Math.floor(y) + dy, bz = Math.floor(z) + dz;
      const b = w.getBlock(bx, by, bz); if (!b || b === B.BEDROCK || b === B.WATER) continue;
      if (b === B.TNT) { this.igniteTNT(bx, by, bz, 0.4 + Math.random() * 0.8); continue; }
      const def = B.BLOCKS[b];
      if (Math.random() < 0.28 && def.drop) this.spawnItem(def.drop, def.dropN, bx + 0.5, by + 0.5, bz + 0.5);
      if (b === B.CHEST || b === B.FURNACE) this.ui.dropContainer(bx, by, bz, b);
      w.setBlock(bx, by, bz, 0);
    }
    for (let i = 0; i < 60; i++) { const a = Math.random() * 6.28, e = (Math.random() - 0.3) * 2, s = 3 + Math.random() * 8; particles.spawn(x, y, z, Math.cos(a) * s * 0.5, e * s * 0.6, Math.sin(a) * s * 0.5, Math.random() < 0.5 ? [255, 160, 40] : [90, 90, 90], 0.25 + Math.random() * 0.2, 0.6 + Math.random() * 0.8, 6); }
    const hit = (e, isPlayer) => {
      const cx = e.x, cy = e.y + (e.h || 1.8) * 0.5, cz = e.z, d = Math.hypot(cx - x, cy - y, cz - z), rr = r * 2;
      if (d > rr) return; const f = 1 - d / rr, dmg = f * f * 28 + f * 4;
      if (isPlayer) { const p = e; p.hurt(dmg, x, z); const nx = (p.x - x) / (d || 1), nz = (p.z - z) / (d || 1); p.kbx += nx * f * 14; p.kbz += nz * f * 14; p.vy = Math.max(p.vy, f * 8); }
      else { e.hurt(dmg, x, z, false); e.vy += f * 6; }
    };
    hit(this.player, true); for (const m of this.mobs) if (!m.dead) hit(m, false);
    this.shake = Math.max(this.shake || 0, Math.max(0, 1 - Math.hypot(this.player.x - x, this.player.z - z) / 25));
  },
  onPlayerDeath() {
    $('deathmsg').textContent = ['You were slain.', 'That did not go well.', 'The world claimed you.', 'Ouch.'][Math.floor(Math.random() * 4)];
    setTimeout(() => { $('death').style.display = 'flex'; this.releasePointer(); }, 700);
  },
};
game.touchMode = touchMode; game.Mob = Mob; game.sky = sky; game.renderer = renderer; game.weather = weather; weather.game = game;
const player = game.player = new Player(game);
const ui = game.ui = new UI(game);
sound.musicOn = !!settings.music;

// ---------------------------------------------------------------- advancements
const ADV = {
  wood: ['Getting Wood', 'Punch a tree until a log pops out', B.LOG], bench: ['Benchmarking', 'Craft a crafting table', B.CRAFTING],
  pick: ['Time to Mine!', 'Craft a pickaxe', B.toolId(0, 0)], stone: ['Stone Age', 'Mine cobblestone', B.COBBLE], furnace: ['Hot Topic', 'Build a furnace', B.FURNACE],
  iron: ['Acquire Hardware', 'Smelt an iron ingot', B.IRON_INGOT], ironpick: ['Isn\'t It Iron Pick', 'Craft an iron pickaxe', B.toolId(0, 2)], diamond: ['DIAMONDS!', 'Find a diamond', B.DIAMOND],
  torch: ['Let There Be Light', 'Craft torches', B.TORCH], cook: ['Delicious', 'Cook some meat', B.BEEF_COOKED], bow: ['Take Aim', 'Craft a bow', B.BOW],
  suit: ['Suit Up', 'Equip a piece of armor', B.armorId(0, 0)], monster: ['Monster Hunter', 'Defeat a hostile creature', B.BONE], depth: ['Into the Depths', 'Descend below the world\'s surface', B.COAL_ORE],
  boom: ['Fire in the Hole', 'Light some TNT', B.TNT], treasure: ['Treasure Hunter', 'Open a cabin chest', B.CHEST],
};
game.adv = new Set();
game.achieve = (id) => {
  if (game.adv.has(id) || !ADV[id]) return; game.adv.add(id);
  const a = ADV[id]; const d = document.createElement('div'); d.className = 'advt';
  d.innerHTML = `<img src="${B.iconURL(a[2])}"><div><b>Advancement Made!</b>${a[0]}<div style="font-weight:normal;opacity:.75;font-size:11px">${a[1]}</div></div>`;
  $('adv').appendChild(d); setTimeout(() => d.remove(), 5200); sound.play('levelup');
};
game.onGet = (id) => {
  if (id === B.LOG || id === B.BIRCH_LOG || id === B.SPRUCE_LOG) game.achieve('wood'); else if (id === B.COBBLE) game.achieve('stone'); else if (id === B.IRON_INGOT) game.achieve('iron');
  else if (id === B.DIAMOND) game.achieve('diamond'); else if (id === B.PORK_COOKED || id === B.BEEF_COOKED || id === B.MUTTON_COOKED) game.achieve('cook');
};
game.onCraft = (id) => {
  if (id === B.CRAFTING) game.achieve('bench'); else if (id === B.TORCH) game.achieve('torch'); else if (id === B.FURNACE) game.achieve('furnace'); else if (id === B.BOW) game.achieve('bow');
  else if (id >= B.TOOL_BASE && id < B.TOOL_BASE + 4) game.achieve('pick'); else if (id === B.toolId(0, 2) || id === B.toolId(0, 3)) game.achieve('ironpick');
};
game.onKill = (kind) => { if (kind !== 'pig' && kind !== 'cow' && kind !== 'sheep') game.achieve('monster'); };
game.onEquip = () => game.achieve('suit');

// ---------------------------------------------------------------- input
const keys = {}; let mouseL = false, mouseR = false, rightPressed = false, lastSpace = 0;
let lockFail = false, dragging = false, everLocked = false, mouseX = 0, mouseY = 0, mouseIn = false;
document.documentElement.addEventListener('mouseleave', () => { mouseIn = false; });
const locked = () => document.pointerLockElement === canvas;
const controlOn = () => locked() || lockFail || touchMode;
document.addEventListener('pointerlockerror', () => { lockFail = true; });
document.addEventListener('pointerlockchange', () => {
  if (locked()) { everLocked = true; lockFail = false; }
  if (!locked() && everLocked && game.state === 'play' && !ui.isOpen && !player.dead && performance.now() - (ui.lastToggle || 0) > 500) showPause(true);
});
function showPause(v) { game.paused = v; $('pause').style.display = v ? 'flex' : 'none'; if (v) { $('pRender').value = settings.render; $('pRenderV').textContent = settings.render; } }
document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX; mouseY = e.clientY; mouseIn = true;
  if (!locked() || game.paused || ui.isOpen || player.dead) return;
  const s = 0.0022 * settings.sens / 100;
  player.yaw -= e.movementX * s; player.pitch -= e.movementY * s; player.pitch = Math.max(-1.5533, Math.min(1.5533, player.pitch));
});
document.addEventListener('mousedown', (e) => {
  if (game.state === 'play' && !game.paused && !ui.isOpen && !player.dead && !locked() && !touchMode && !(e.target && e.target.closest && e.target.closest('#pause,#screen,#death'))) { try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (err) {} }
  if (game.state !== 'play') return;
  if (game.paused || ui.isOpen || (e.target && e.target.closest && e.target.closest('#pause,#screen,#death,#touch'))) return;
  if (!controlOn()) return;
  if (lockFail && !touchMode) dragging = true;
  if (e.button === 0) mouseL = true; if (e.button === 2) { mouseR = true; rightPressed = true; }
  if (e.button === 1) { e.preventDefault(); pickBlock(); }
});
document.addEventListener('mouseup', (e) => { if (e.button === 0) mouseL = false; if (e.button === 2) mouseR = false; if (!e.buttons) dragging = false; });
document.addEventListener('contextmenu', (e) => e.preventDefault());
document.addEventListener('wheel', (e) => { if (!controlOn() || ui.isOpen) return; player.sel = (player.sel + (e.deltaY > 0 ? 1 : 8)) % 9; }, { passive: true });
window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; mouseL = mouseR = false; });
document.addEventListener('keydown', (e) => {
  if (e.target && e.target.tagName === 'INPUT') return;
  if (game.state !== 'play') return;
  if (e.code === 'F3') { e.preventDefault(); const d = $('debug'); d.style.display = d.style.display === 'block' ? 'none' : 'block'; return; }
  if (e.repeat && e.code !== 'KeyQ') { keys[e.code] = true; return; }
  keys[e.code] = true;
  if (e.code === 'Escape') { if (ui.isOpen) ui.close(); else if (game.paused) { showPause(false); game.requestPointer(); } else if (lockFail) showPause(true); return; }
  if (game.paused || player.dead) return;
  if (e.code === 'KeyE') { if (ui.isOpen) ui.close(); else ui.openInventory(); e.preventDefault(); return; }
  if (ui.isOpen) return;
  if (/^Digit[1-9]$/.test(e.code)) player.sel = +e.code[5] - 1;
  if (e.code === 'KeyQ') { const s = player.held(); if (s) { const n = e.ctrlKey ? s.n : 1; const p = player, cp = Math.cos(p.pitch); game.spawnItem(s.id, n, p.x, p.eyeY - 0.3, p.z, s.d, [-Math.sin(p.yaw) * cp * 5, Math.sin(p.pitch) * 5 + 1.5, -Math.cos(p.yaw) * cp * 5]); s.n -= n; if (s.n <= 0) p.inv[p.sel] = null; ui.dirtyInv = true; } }
  if (e.code === 'Space') {
    e.preventDefault(); const now = performance.now();
    if (player.creative && now - lastSpace < 300) { player.flying = !player.flying; player.vy = 0; ui.toast(player.flying ? 'Flying on' : 'Flying off'); }
    lastSpace = now;
  }
  if (e.code === 'Tab') e.preventDefault();
});
document.addEventListener('keyup', (e) => { keys[e.code] = false; });
function pickBlock() {
  const t = player.target; if (!t || player.dead) return; const id = t.block;
  for (let i = 0; i < 9; i++) if (player.inv[i] && player.inv[i].id === id) { player.sel = i; return; }
  if (player.creative && B.ITEMS[id]) { let slot = player.inv.findIndex((s, i) => i < 9 && !s); if (slot < 0) slot = player.sel; player.inv[slot] = { id, n: 64 }; player.sel = slot; ui.dirtyInv = true; }
}
canvas.addEventListener('click', () => { if (game.state === 'play' && !game.paused && !ui.isOpen && !player.dead && !locked() && !touchMode) { lockFail = false; game.requestPointer(); } });

// ---------------------------------------------------------------- selection + crack + hand
const selBox = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.004, 1.004, 1.004)), new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.85 }));
selBox.visible = false; scene.add(selBox);
const crackTex = [];
for (let s = 0; s < 10; s++) {
  const c = document.createElement('canvas'); c.width = c.height = 16; const x = c.getContext('2d');
  for (let py = 0; py < 16; py++) for (let px = 0; px < 16; px++) {
    let h = Math.imul(px * 7919 + py * 104729 + 13, 2654435761); h ^= h >>> 15; const r = ((h >>> 0) % 1000) / 1000;
    const dx = px - 7.5, dy = py - 7.5, d = Math.hypot(dx, dy) / 11;
    const line = (Math.abs(px - py) < 1 + s * 0.25) || (Math.abs(px + py - 15) < s * 0.25) || (Math.abs(px - 8) < s * 0.2 && py > 4);
    if ((r < (s + 1) * 0.06 && d < (s + 2) * 0.16) || (line && r < (s + 1) * 0.11 && d < 0.8)) { x.fillStyle = `rgba(0,0,0,${0.55 + r * 0.3})`; x.fillRect(px, py, 1, 1); }
  }
  const t = new THREE.CanvasTexture(c); t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; crackTex.push(t);
}
const crack = new THREE.Mesh(new THREE.BoxGeometry(1.006, 1.006, 1.006), new THREE.MeshBasicMaterial({ map: crackTex[0], transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 }));
crack.visible = false; scene.add(crack);

const hand = { group: new THREE.Group(), mesh: null, id: -2, equip: 1, bobT: 0 };
handScene.add(hand.group);
const armMat = new THREE.MeshBasicMaterial({ color: 0xc89670 });
const arm = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.6), armMat); arm.position.set(0.5, -0.5, -0.8); arm.rotation.set(0.25, -0.35, 0.05);
handScene.add(arm); arm.visible = false;
function updateHeldMesh() {
  const s = player.held(), id = s ? s.id : -1;
  if (id === hand.id) return; hand.id = id; hand.equip = 0.6;
  if (hand.mesh) { hand.group.remove(hand.mesh); hand.mesh = null; }
  if (id < 0) { arm.visible = true; return; }
  arm.visible = false;
  const isBlock = id < 256 && B.BLOCKS[id] && B.SHAPE[id] !== 1 && B.SHAPE[id] !== 2;
  const m = makeItemMesh(id, isBlock ? 0.42 : (id === B.BOW ? 0.42 : (B.ITEMS[id] && B.ITEMS[id].tool) ? 0.8 : 0.42));
  hand.isBlock = isBlock; hand.tool = !!(B.ITEMS[id] && B.ITEMS[id].tool); hand.bow = id === B.BOW;
  hand.mesh = m; hand.group.add(m);
}

// ---------------------------------------------------------------- settings UI
function bindSeg(el, key, cb) {
  el.addEventListener('click', (e) => { const s = e.target.closest('span'); if (!s) return; for (const c of el.children) c.classList.toggle('on', c === s); settings[key] = key === 'diff' ? +s.dataset.v : (key === 'music' ? +s.dataset.v : s.dataset.v); saveSettings(); if (cb) cb(); });
}
function initSeg(el, val) { for (const c of el.children) c.classList.toggle('on', c.dataset.v === String(val)); }
bindSeg($('mMode'), 'mode'); bindSeg($('mDiff'), 'diff', () => { game.difficulty = [0, 1, 1.5][settings.diff]; });
initSeg($('mMode'), settings.mode); initSeg($('mDiff'), settings.diff); initSeg($('pMusic'), settings.music);
bindSeg($('pMusic'), 'music', () => { sound.musicOn = !!settings.music; });
$('mRender').value = settings.render; $('mRenderV').textContent = settings.render;
$('mRender').oninput = (e) => { settings.render = +e.target.value; $('mRenderV').textContent = settings.render; saveSettings(); };
$('pRender').oninput = (e) => { settings.render = +e.target.value; $('pRenderV').textContent = settings.render; saveSettings(); if (game.world) game.world.setRadius(settings.render); };
$('pFov').value = settings.fov; $('pFovV').textContent = settings.fov;
$('pFov').oninput = (e) => { settings.fov = +e.target.value; $('pFovV').textContent = settings.fov; saveSettings(); };
$('pVol').value = settings.vol; $('pVol').oninput = (e) => { settings.vol = +e.target.value; sound.setVolume(settings.vol / 100); saveSettings(); };
$('pSens').value = settings.sens; $('pSens').oninput = (e) => { settings.sens = +e.target.value; saveSettings(); };
sound.volume = settings.vol / 100;
$('bResume').onclick = () => { showPause(false); game.requestPointer(); };
$('bSave').onclick = () => { saveGame(); ui.toast('World saved'); };
$('bQuit').onclick = () => { saveGame(); location.reload(); };
$('bRespawn').onclick = () => { $('death').style.display = 'none'; player.respawn(); ui.dirtyInv = true; game.requestPointer(); };
// ---- world list (multiple save slots)
const IDX_KEY = 'vc_index_v1'; let currentId = null;
function saveIndex(a) { try { localStorage.setItem(IDX_KEY, JSON.stringify(a)); } catch (e) {} }
function loadIndex() {
  let a = []; try { a = JSON.parse(localStorage.getItem(IDX_KEY) || '[]'); } catch (e) {}
  try { const old = localStorage.getItem(SAVE_KEY); if (old) { localStorage.setItem('vc_world_legacy', old); localStorage.removeItem(SAVE_KEY); if (!a.some((w) => w.id === 'legacy')) a.push({ id: 'legacy', name: 'Old World', date: Date.now(), mode: 's' }); saveIndex(a); } } catch (e) {}
  return a.filter((w) => localStorage.getItem('vc_world_' + w.id));
}
function renderWorlds() {
  const el = $('worldlist'), list = loadIndex().sort((a, b) => b.date - a.date);
  if (!list.length) { el.innerHTML = '<div class="hint">No saved worlds yet. Create a new one below.</div>'; return; }
  el.innerHTML = list.map((w) => `<div class="wrow"><div class="wi"><b>${w.name.replace(/</g, '')}</b><span>${w.mode === 'c' ? 'Creative' : 'Survival'} &middot; ${w.played ? Math.floor(w.played / 3600) + 'h ' + Math.floor(w.played % 3600 / 60) + 'm played &middot; ' : ''} ${new Date(w.date).toLocaleDateString()} ${new Date(w.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div><div class="wb play" data-id="${w.id}">Play</div><div class="wb del" data-id="${w.id}">&times;</div></div>`).join('');
}
$('worldlist').addEventListener('click', (e) => {
  const b = e.target.closest('.wb'); if (!b) return; const id = b.dataset.id;
  if (b.classList.contains('play')) { sound.init(); startGame(true, id); }
  else if (confirm('Delete this world permanently?')) { localStorage.removeItem('vc_world_' + id); saveIndex(loadIndex().filter((w) => w.id !== id)); renderWorlds(); }
});
renderWorlds();
$('bNew').onclick = () => { sound.init(); startGame(false); };

// ---------------------------------------------------------------- save / load
function saveGame() {
  if (!game.world || !currentId) return;
  try {
    const edits = {}; for (const [k, m] of game.world.edits) { const a = []; for (const [i, v] of m) a.push(i, v); edits[k] = a; }
    const data = {
      seed: game.world.seed, mode: settings.mode, diff: settings.diff, tod: game.env.tod, edits, containers: ui.serialize(),
      player: { x: player.x, y: player.y, z: player.z, yaw: player.yaw, pitch: player.pitch, health: player.health, hunger: player.hunger, sat: player.sat, inv: player.inv, sel: player.sel, spawn: player.spawn, flying: player.flying, armor: player.armor },
      adv: [...game.adv], played: basePlayed + game.time,
    };
    localStorage.setItem('vc_world_' + currentId, JSON.stringify(data));
    const idx = loadIndex().filter((w) => w.id !== currentId); idx.push({ id: currentId, name: currentName, date: Date.now(), mode: settings.mode, played: Math.round(basePlayed + game.time) }); saveIndex(idx);
  } catch (e) { ui.toast('Save failed (storage full?)'); }
}
setInterval(() => { if (game.state === 'play' && !player.dead) saveGame(); }, 30000);
window.addEventListener('beforeunload', () => { if (game.state === 'play') saveGame(); });

// ---------------------------------------------------------------- start
let currentName = 'World', basePlayed = 0;
function startGame(cont, id) {
  let save = null; if (cont) { try { save = JSON.parse(localStorage.getItem('vc_world_' + id)); } catch (e) {} }
  if (cont && !save) return;
  const seedStr = $('mSeed').value.trim();
  let seed = save ? save.seed : (seedStr ? (/^-?\d+$/.test(seedStr) ? parseInt(seedStr, 10) : [...seedStr].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) | 0, 7)) : Math.floor(Math.random() * 1e9));
  if (save) { settings.mode = save.mode; settings.diff = save.diff; currentId = id; basePlayed = save.played || 0; const m = loadIndex().find((w) => w.id === id); currentName = m ? m.name : 'World'; }
  else { basePlayed = 0; currentId = 'w' + Date.now().toString(36); const n = loadIndex().length + 1; currentName = seedStr ? 'Seed ' + seedStr.slice(0, 18) : 'World ' + n; }
  game.difficulty = [0, 1, 1.5][settings.diff];
  if (touchMode) { try { document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} }
  $('menu').style.display = 'none'; $('loading').style.display = 'flex'; game.state = 'loading'; disposeMenuWorld(); camera.fov = settings.fov; camera.updateProjectionMatrix();
  const world = game.world = new World(seed, scene, mats);
  world.setRadius(settings.render); world.maxGen = 40; world.maxMesh = 40;
  world.onFall = (x, y, z, id) => game.falling.push(new FallingBlock(game, id, x, y, z));
  world.onChunkNew = (c) => {
    if (c.loot) for (const l of c.loot) { const k = l.x + ',' + l.y + ',' + l.z; if (ui.containers.has(k)) continue; const slots = new Array(27).fill(null); for (const it of l.items) { let i = Math.floor(Math.random() * 27); while (slots[i]) i = (i + 1) % 27; slots[i] = { id: it.id, n: it.n }; } ui.containers.set(k, { type: 'chest', slots }); }
    if (!c.spawns) return; for (const s of c.spawns) if (game.mobs.length < 60) game.mobs.push(new Mob(game, s.kind, s.x, s.y, s.z)); };
  if (save) {
    for (const k in save.edits) { const a = save.edits[k], m = new Map(); for (let i = 0; i < a.length; i += 2) m.set(a[i], a[i + 1]); world.edits.set(+k, m); }
    ui.restore(save.containers); Object.assign(player, save.player); player.inv = save.player.inv; game.env.tod = save.tod; game.adv = new Set(save.adv || []);
  } else {
    const sp = world.gen.findSpawn(); player.x = sp.x; player.y = sp.y; player.z = sp.z; player.spawn = { x: sp.x, y: sp.y, z: sp.z };
    game.env.tod = 0.05;
  }
  player.creative = settings.mode === 'c'; player.flying = false;
  if (!save) { if (player.creative) ui.toast('Creative: double-tap Space to fly'); }
  const px = player.x, pz = player.z; const need = 3; let frames = 0;
  const prime = () => {
    world.update(px, pz, 40); world.flushUrgent();
    let ok = 0, total = 0;
    for (let dz = -need; dz <= need; dz++) for (let dx = -need; dx <= need; dx++) { if (Math.hypot(dx, dz) > need + 0.3) continue; total++; const c = world.getChunk(Math.floor(px / 16) + dx, Math.floor(pz / 16) + dz); if (c && c.meshed) ok++; }
    $('bar').firstChild.style.width = (ok / total * 100) + '%';
    if (ok < total && frames++ < 2000) { requestAnimationFrame(prime); return; }
    if (!save) {
      // find open ground: not under a tree canopy
      const cx0 = Math.floor(player.x), cz0 = Math.floor(player.z); let best = null;
      search: for (let r = 0; r < 14; r++) for (let dz = -r; dz <= r; dz++) for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
        const x = cx0 + dx, z = cz0 + dz; let y = CH - 1;
        while (y > 0 && !world.getBlock(x, y, z)) y--;
        const top = world.getBlock(x, y, z);
        if (top === B.LEAVES || top === B.LOG || top === B.WATER || top === B.ICE || top === B.CACTUS || y <= SEA + 1) continue;
        if (B.SHAPE[top] === 1) { y--; }
        let cramped = false; for (let ax = -2; ax <= 2 && !cramped; ax++) for (let az = -2; az <= 2 && !cramped; az++) for (let ay = 1; ay <= 4; ay++) { const nb = world.getBlock(x + ax, y + ay, z + az); if (nb === B.LEAVES || nb === B.LOG) { cramped = true; break; } }
        if (cramped) continue;
        best = { x: x + 0.5, y: y + 1, z: z + 0.5 }; break search;
      }
      if (best) { player.x = best.x; player.y = best.y; player.z = best.z; }
    }
    let guard = 0; while (world.collides(player.x, player.y, player.z, player.hw, player.h) && guard++ < 100) player.y += 1;
    if (!save) { player.spawn = { x: player.x, y: player.y, z: player.z }; }
    world.maxGen = 1; world.maxMesh = 2;
    $('loading').style.display = 'none'; $('hud').style.display = 'block'; game.state = 'play'; if (touchMode) initTouch(game, player, ui, { pause: () => showPause(true), settings }); last = performance.now();
    ui.dirtyInv = true; game.requestPointer();
    if (!save) ui.toast(player.creative ? 'Welcome to VoxelCraft (Creative)' : 'Survive. Punch a tree to begin.');
    if (!save && !player.creative) ui.toast('Press E for inventory & crafting');
  };
  requestAnimationFrame(prime);
}

// ---------------------------------------------------------------- hostile spawning
let spawnT = 0, cropT = 1;
function trySpawnHostile() {
  if (game.difficulty <= 0) return;
  const w = game.world; let n = 0; for (const m of game.mobs) if (!m.sp.passive && !m.dead) n++;
  if (n >= 8 * game.difficulty) return;
  for (let tries = 0; tries < 6; tries++) {
    const a = Math.random() * 6.283, d = 18 + Math.random() * 22, x = Math.floor(player.x + Math.cos(a) * d), z = Math.floor(player.z + Math.sin(a) * d);
    if (!w.loaded(x, z)) continue;
    let y = Math.min(CH - 3, Math.floor(player.y) + 14), found = -1;
    for (; y > Math.max(2, Math.floor(player.y) - 20); y--) if (B.SOLID[w.getBlock(x, y - 1, z)] && !B.SOLID[w.getBlock(x, y, z)] && !B.SOLID[w.getBlock(x, y + 1, z)] && w.getBlock(x, y, z) !== B.WATER) { found = y; break; }
    if (found < 0) continue;
    const lv = w.getLight(x, found, z), sk = Math.pow((lv >> 4) / 15, 1.55) * game.env.dayLight, bk = (lv & 15) / 15;
    if (Math.max(sk, bk * 0.9) > 0.22) continue;
    const r = Math.random(), kind = r < 0.36 ? 'zombie' : r < 0.58 ? 'skeleton' : r < 0.8 ? 'creeper' : 'spider';
    game.mobs.push(new Mob(game, kind, x + 0.5, found + 0.05, z + 0.5)); return;
  }
}

// ---------------------------------------------------------------- main loop
let last = performance.now(), fpsAcc = 0, fpsN = 0, fps = 0, camY = 1.62, fovNow = 75, rollNow = 0;
const input = { fwd: 0, strafe: 0, jump: false, sneak: false, sprint: false, left: false, right: false, rightPressed: false };
function resize() { const w = window.innerWidth, h = window.innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); handCam.aspect = w / h; handCam.updateProjectionMatrix(); }
window.addEventListener('resize', resize); resize();

let menuWorld = null, menuT = 2.2, menuPos = null;
function menuFrame(dt) {
  if (!menuWorld) { menuWorld = new World(777, scene, mats); menuWorld.setRadius(6); const sp = menuWorld.gen.findSpawn(); menuPos = { x: sp.x, y: sp.y + 24, z: sp.z }; }
  menuT += dt * 0.045;
  menuWorld.update(menuPos.x, menuPos.z, 9);
  camera.position.set(menuPos.x, menuPos.y, menuPos.z); camera.rotation.order = 'YXZ'; camera.rotation.set(-0.2, menuT, 0);
  if (camera.fov !== 68) { camera.fov = 68; camera.updateProjectionMatrix(); }
  mats.shared.uFogNear.value = 40; mats.shared.uFogFar.value = 92; mats.shared.uTime.value += dt;
  game.env.dayLight = 1; sky.update(camera, 0.29, dt, 0, mats.shared, false); mats.shared.uBright.value = 0;
  renderer.setClearColor(new THREE.Color(sky.fog[0], sky.fog[1], sky.fog[2]), 1);
  renderer.info.reset(); renderer.clear(); renderer.render(scene, camera);
}
function disposeMenuWorld() { if (menuWorld) { for (const [k, c] of [...menuWorld.chunks]) menuWorld.unload(k, c); menuWorld = null; } }
function frame(now) {
  requestAnimationFrame(frame);
  let dt = Math.min(0.05, (now - last) / 1000); last = now;
  fpsAcc += dt; fpsN++; if (fpsAcc > 0.5) { fps = fpsN / fpsAcc; fpsAcc = 0; fpsN = 0; }
  if (game.state === 'menu') { menuFrame(dt); return; }
  if (game.state !== 'play') { return; }
  const w = game.world;
  const active = !game.paused;
  game.time += dt; $('toasts').style.display = ui.isOpen ? 'none' : 'block';
  if (active) {
    const open = ui.isOpen || player.dead;
    input.fwd = open ? 0 : (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0); input.strafe = open ? 0 : (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0);
    input.jump = !open && !!keys.Space; input.sneak = !open && (!!keys.KeyC || !!keys.ControlLeft); input.sprint = !open && (!!keys.ShiftLeft || !!keys.ShiftRight);
    input.left = !open && mouseL && controlOn(); input.right = !open && mouseR && controlOn(); input.rightPressed = rightPressed && !open; rightPressed = false;
    if (!open && lockFail && !locked() && mouseIn && !game.touchMode) { const dz = (v) => { const a = Math.abs(v); return a < 0.12 ? 0 : Math.sign(v) * (a - 0.12) / 0.88; }; const nx = (mouseX - innerWidth / 2) / (innerWidth / 2), ny = (mouseY - innerHeight / 2) / (innerHeight / 2); player.yaw -= dz(nx) * 3.0 * dt * settings.sens / 100; player.pitch = Math.max(-1.55, Math.min(1.55, player.pitch - dz(ny) * 2.0 * dt * settings.sens / 100)); }
    if (!open && (keys.ArrowLeft || keys.ArrowRight || keys.ArrowUp || keys.ArrowDown)) { player.yaw += ((keys.ArrowLeft ? 1 : 0) - (keys.ArrowRight ? 1 : 0)) * 2 * dt; player.pitch = Math.max(-1.55, Math.min(1.55, player.pitch + ((keys.ArrowUp ? 1 : 0) - (keys.ArrowDown ? 1 : 0)) * 1.6 * dt)); }
    if (!open && game.touch) { const T = game.touch; input.fwd = Math.max(-1, Math.min(1, input.fwd + T.fwd)); input.strafe = Math.max(-1, Math.min(1, input.strafe + T.strafe)); input.jump = input.jump || T.jump; input.sneak = input.sneak || T.sneak; input.sprint = input.sprint || T.sprint; input.left = input.left || T.left; input.right = input.right || T.right; input.rightPressed = input.rightPressed || T.rightPressed; T.rightPressed = false; }
    if (game.force) Object.assign(input, game.force);
    player.update(dt, input); player.updateInteraction(dt, input);
    // world time
    game.env.tod = (game.env.tod + dt / 720) % 1;
    w.processFalls();
  }
  w.maxGen = 1; w.maxMesh = 2;
  if (game.touchEl) game.touchEl.style.display = (!ui.isOpen && !game.paused && !player.dead) ? 'block' : 'none';
  w.update(player.x, player.z, active ? 5 : 2); w.flushUrgent();
  if (active) {
    // entities
    for (const m of game.mobs) { if (Math.hypot(m.x - player.x, m.z - player.z) > 110) m.remove(); else m.update(dt); }
    game.mobs = game.mobs.filter((m) => !m.dead);
    for (let i = 0; i < game.mobs.length; i++) { const a = game.mobs[i]; if (a.deadT > 0) continue; for (let j = i + 1; j < game.mobs.length; j++) { const b2 = game.mobs[j]; if (b2.deadT > 0 || Math.abs(a.y - b2.y) > 1.2) continue; const dx = b2.x - a.x, dz = b2.z - a.z, r = a.hw + b2.hw, d2 = dx * dx + dz * dz; if (d2 < r * r && d2 > 1e-6) { const d = Math.sqrt(d2), push = (r - d) * 0.5; const nx = dx / d * push, nz = dz / d * push; if (!w.collides(a.x - nx, a.y, a.z - nz, a.hw, a.h)) { a.x -= nx; a.z -= nz; } if (!w.collides(b2.x + nx, b2.y, b2.z + nz, b2.hw, b2.h)) { b2.x += nx; b2.z += nz; } } } }
    for (const e of game.items) e.update(dt); game.items = game.items.filter((e) => !e.dead);
    for (const e of game.projectiles) e.update(dt); game.projectiles = game.projectiles.filter((e) => !e.dead);
    for (const e of game.falling) e.update(dt); game.falling = game.falling.filter((e) => !e.dead);
    spawnT -= dt; if (spawnT <= 0) { spawnT = 2.6; trySpawnHostile(); if (game.env.day > 0.8) for (const m of game.mobs) if (!m.sp.passive && m.sp.creeper && Math.random() < 0.05 && Math.hypot(m.x - player.x, m.z - player.z) > 30) m.remove(); }
    if (player.y < 16 && !player.dead) game.achieve('depth');
    cropT -= dt; if (cropT <= 0) { cropT = 1; for (const c of w.crops.values()) { if (!w.loaded(c[0], c[2])) continue; const b = w.getBlock(c[0], c[1], c[2]); if (b >= B.WHEAT_1 && b < B.WHEAT_4) { let wet = false; for (let dz = -4; dz <= 4 && !wet; dz++) for (let dx = -4; dx <= 4 && !wet; dx++) if (w.getBlock(c[0] + dx, c[1] - 1, c[2] + dz) === B.WATER) wet = true; if (Math.random() < (wet ? 0.09 : 0.03)) w.setBlock(c[0], c[1], c[2], b + 1); } } }
    ui.tickFurnaces(dt);
    // torch embers + flicker
    for (const t of w.torches.values()) { if (Math.abs(t[0] - player.x) > 24 || Math.abs(t[2] - player.z) > 24) continue; if (Math.random() < dt * 30) particles.spawn(t[0] + 0.5 + (Math.random() - 0.5) * 0.08, t[1] + 0.84, t[2] + 0.5 + (Math.random() - 0.5) * 0.08, 0, 0.25, 0, Math.random() < 0.5 ? [255, 210, 80] : [255, 150, 30], 0.07, 0.16, 0); }
    for (const t of w.torches.values()) { if (Math.abs(t[0] - player.x) > 24 || Math.abs(t[2] - player.z) > 24) continue; if (Math.random() < dt * 9) particles.spawn(t[0] + 0.5 + (Math.random() - 0.5) * 0.12, t[1] + 0.8, t[2] + 0.5 + (Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.3, 0.7 + Math.random() * 0.8, (Math.random() - 0.5) * 0.3, Math.random() < 0.6 ? [255, 190, 60] : [255, 110, 30], 0.045, 0.5 + Math.random() * 0.5, -0.5); }
    particles.update(dt, w, (x, y, z) => game.lightAt(x, y, z));
  }
  // ---- environment
  if (active) weather.update(dt, camera, player, w, sound); game.raining = weather.raining;
  const sunH = Math.sin(game.env.tod * Math.PI * 2), dayF = Math.min(1, Math.max(0, (sunH + 0.14) / 0.36));
  game.env.day = dayF * dayF * (3 - 2 * dayF); game.env.dayLight = (0.17 + 0.83 * game.env.day) * (1 - 0.28 * weather.intensity);
  const R = settings.render; mats.shared.uFogNear.value = Math.max(20, R * 16 * 0.6); mats.shared.uFogFar.value = (R * 16 - 6) * (1 - 0.35 * weather.intensity); mats.shared.uFogNear.value *= (1 - 0.5 * weather.intensity);
  // camera
  const eyeTarget = player.sneaking ? 1.47 : 1.62; camY += (eyeTarget - camY) * Math.min(1, dt * 14);
  const ampBob = player.onGround ? Math.min(1, Math.hypot(player.vx, player.vz) / 4.5) : 0;
  const bobY = Math.abs(Math.sin(player.bob)) * 0.05 * ampBob, bobX = Math.sin(player.bob) * 0.03 * ampBob;
  const sh = game.shake || 0; game.shake = Math.max(0, sh - dt * 1.5);
  camera.position.set(player.x, player.y + camY + bobY + (player.dead ? -1 : 0) + (Math.random() - 0.5) * sh * 0.25, player.z);
  const targetFov = settings.fov + (player.sprinting && Math.hypot(player.vx, player.vz) > 4 ? 8 : 0) + (player.flying && player.sprinting ? 12 : 0);
  fovNow += (targetFov - fovNow) * Math.min(1, dt * 8); if (Math.abs(camera.fov - fovNow) > 0.01) { camera.fov = fovNow; camera.updateProjectionMatrix(); }
  rollNow += (((player.hurtFlash > 0 ? Math.sin(player.hurtFlash * 30) * player.hurtFlash * 0.08 : 0) + (player.dead ? 0.6 : 0) + bobX * 0.4) - rollNow) * Math.min(1, dt * 12);
  camera.rotation.order = 'YXZ'; camera.rotation.set(player.pitch, player.yaw, rollNow);
  sound.listener.x = player.x; sound.listener.y = player.y; sound.listener.z = player.z;
  mats.shared.uTime.value += dt;
  sky.update(camera, game.env.tod, dt, weather.intensity, mats.shared, player.headWater);
  mats.shared.uBright.value = weather.flash * 0.55;
  // clear colour matches fog
  renderer.setClearColor(new THREE.Color(sky.fog[0], sky.fog[1], sky.fog[2]), 1);
  // selection & crack
  const t = player.target;
  if (t && !ui.isOpen && !player.dead) {
    selBox.visible = true; selBox.position.set(t.x + 0.5, t.y + 0.5, t.z + 0.5);
    const sh = B.SHAPE[t.block]; if (sh === 5 && false) {} else if (sh === 5) { selBox.scale.set(1, 0.5, 1); selBox.position.y = t.y + 0.25; } else if (sh === 2) { selBox.scale.set(0.18, 0.64, 0.18); selBox.position.y = t.y + 0.32; } else if (sh === 1) { selBox.scale.set(0.7, 0.9, 0.7); selBox.position.y = t.y + 0.45; } else selBox.scale.set(1, 1, 1);
    if (player.mineProgress > 0.02) { crack.visible = true; crack.position.copy(selBox.position); crack.scale.copy(selBox.scale); crack.material.map = crackTex[Math.min(9, Math.floor(player.mineProgress * 10))]; } else crack.visible = false;
  } else { selBox.visible = false; crack.visible = false; }
  // hand
  updateHeldMesh();
  { const swing = player.swing, sw = Math.sin(swing * Math.PI), hb = hand.bobT += dt * 0; hand.equip += (1 - hand.equip) * Math.min(1, dt * 9);
    const bob = ampBob * Math.sin(player.bob * 2) * 0.012, bobx = ampBob * Math.sin(player.bob) * 0.02;
    const lightv = game.lightAt(player.x, player.y + 1.5, player.z);
    if (hand.mesh) {
      if (hand.bow) { hand.mesh.position.set(0.48 + bobx, -0.36 + bob - (1 - hand.equip) * 0.6 - sw * 0.12, -0.75); hand.mesh.rotation.set(0.05, -0.55, 0.1); }
      else if (hand.isBlock) { hand.mesh.position.set(0.5 + bobx, -0.42 + bob - (1 - hand.equip) * 0.6 - sw * 0.18, -0.85 - sw * 0.25); hand.mesh.rotation.set(0.15 + sw * 0.5, -0.6 - sw * 0.35, 0); }
      else { hand.mesh.position.set(0.5 + bobx, -0.4 + bob - (1 - hand.equip) * 0.6 - sw * 0.14, -0.8 - sw * 0.2); hand.mesh.rotation.set(0.1 - sw * 0.9, hand.tool ? -1.15 : -0.9, hand.tool ? -0.35 + sw * 0.4 : -0.1); }
      if (player.drawT > 0) { const dw = Math.min(1, player.drawT); hand.mesh.position.x -= dw * 0.1; hand.mesh.position.z += dw * 0.12; hand.mesh.rotation.z += dw * 0.15; hand.mesh.position.x += Math.sin(game.time * 40) * 0.002 * dw; }
      setItemLight(hand.mesh, lightv);
    }
    arm.position.set(0.55 + bobx, -0.55 + bob - (1 - hand.equip) * 0.5 - sw * 0.1, -0.78 - sw * 0.3); arm.rotation.x = 0.25 - sw * 0.7; armMat.color.setRGB(0.78 * lightv, 0.59 * lightv, 0.44 * lightv);
  }
  // sound ambience
  const under = w.getLight(Math.floor(player.x), Math.floor(player.y + 1), Math.floor(player.z)) >> 4 < 4;
  sound.updateAmbient(game.time, !under, game.env.day < 0.3, under);
  // ---- render
  renderer.info.reset(); renderer.clear(); renderer.render(scene, camera); renderer.clearDepth(); if (!player.dead && !ui.isOpen) renderer.render(handScene, handCam);
  // ---- HUD
  ui.updateHud(dt);
  const tod = game.env.tod, hh = Math.floor(((tod * 24 + 6) % 24)), mm = Math.floor(((tod * 24 + 6) % 1) * 60);
  const biomeIdx = w.getChunk(Math.floor(player.x / 16), Math.floor(player.z / 16));
  const bn = biomeIdx ? BIOME_NAMES[biomeIdx.biome[(Math.floor(player.x) & 15) + ((Math.floor(player.z) & 15) << 4)]] : '';
  $('clock').textContent = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}  ${bn}`;
  if ($('debug').style.display === 'block') {
    const li = w.getLight(Math.floor(player.x), Math.floor(player.y), Math.floor(player.z));
    $('debug').textContent = `VoxelCraft  ${fps.toFixed(0)} fps  seed ${w.seed}\nXYZ ${player.x.toFixed(2)} ${player.y.toFixed(2)} ${player.z.toFixed(2)}\nChunk ${Math.floor(player.x / 16)},${Math.floor(player.z / 16)}  loaded ${w.chunks.size}\nBiome ${bn}  light sky ${li >> 4} blk ${li & 15}\nMobs ${game.mobs.length}  items ${game.items.length}\nDraw calls ${renderer.info.render.calls}  tris ${(renderer.info.render.triangles / 1000).toFixed(0)}k\nTarget ${t ? (B.BLOCKS[t.block].name + ' ' + t.x + ',' + t.y + ',' + t.z) : (player.mobTarget ? player.mobTarget.kind : '-')}`;
  }
}
requestAnimationFrame(frame);

// dev/test helper: ?auto=1&seed=123&mode=c&diff=0&rd=6
{
  const q = new URLSearchParams(location.search);
  if (q.get('auto')) {
    if (q.get('mode')) settings.mode = q.get('mode'); if (q.get('diff')) settings.diff = +q.get('diff'); if (q.get('rd')) settings.render = +q.get('rd');
    if (q.get('seed')) $('mSeed').value = q.get('seed');
    $('bNew').click();
  }
}
