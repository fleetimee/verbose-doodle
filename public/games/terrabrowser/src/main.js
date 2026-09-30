/*
 * Terrabrowser — boot, game states, fixed 60 UPS loop with interpolated rendering.
 *
 * MODULE INTERFACES
 * -----------------
 * Every system is a set of plain functions operating on one shared state object `G` built below.
 * Modules never hold hidden cross-module state; anything shared lives on G.
 *
 *   G = {
 *     state: 'menu' | 'play',  tick,  S (sprites),  R (renderer),  input,  settings,  rng,
 *     world    (world.js createWorld: typed arrays tile/wall/meta/liq/ltype/explored + chests, lines, spawn),
 *     player   (player.js createPlayer),  enemies[], projectiles[], npcs[], items[] (dropped), particles[], texts[], stars[],
 *     lights[] (dynamic lights pushed each tick, consumed by lighting.js),  light (lighting.js region buffers),
 *     cam {x,y,px,py,shake,snap},  time (events.js initTime),  sky (events.js skyState),  zone (biome flags),
 *     bg {w: weights per parallax biome, target, groundY},  flags {bosses:{}, cryptOpen, orbs},  boss (active boss enemy),
 *     ui (ui.js createUI),  menu (menu screen state),  mouseW {x,y} (mouse in world px),
 *     fx {particles(), text(), shake()} (renderer.js makeFx),  msg(text,color) -> chat,  sfx(name) -> audio,
 *     actions {refreshLists, createChar, deleteChar, createWorld, playWorld, deleteWorld, save, exitToTitle, saveSettings}
 *   }
 *
 *   config.js    CFG                                     all constants + balance tables
 *   rng.js       hashSeed, makeRng, hash2, makeNoise
 *   input.js     createInput(canvas)                     keys/mouse, pressed flags cleared per tick
 *   audio.js     audio.{init,sfx,music,setVolume}
 *   save.js      putData/getData/delData/listKeys, rleEncode/rleDecode, packWorld/unpackWorld
 *   tiles.js     T, W, TILE[], WALL[], SOLID, EMIT
 *   world.js     createWorld, setTile, setWall, tileAt, solidAt, furniture helpers
 *   worldgen.js  generateWorld(seed, name, progress) -> world   (async passes)
 *   liquids.js   updateLiquids(G)
 *   lighting.js  computeLighting(G, x0,y0,x1,y1), lightAt
 *   sprites.js   buildSprites() -> S, drawHumanoid, palette helpers
 *   renderer.js  createRenderer, renderGame(G,R,alpha), renderTitleBg, updateCamera, makeFx, updateFx
 *   physics.js   moveBody, rectSolid, liquidAt, overlaps
 *   player.js    newCharacter, createPlayer, charData, updatePlayer, updateDrops, placeAtSpawn, interact, breakTile
 *   enemies.js   EN, PROJ, spawnEnemy, trySpawn, updateEnemies, updateProjectiles, hurtPlayer, summonBoss
 *   npcs.js      NPC_DEFS, spawnNPC, updateNPCs, tryArrivals, checkRoom, npcTalk, shopFor, nurseCost
 *   items.js     ITEMS, RECIPES, loot tables, inventory helpers, dropItem, addBuff
 *   ui.js        createUI, uiUpdate/uiDraw (play), menuUpdate/menuDraw (menus), initMap
 *   events.js    initTime, updateTime, skyState, updateEvents (weather, stars, random ticks, zones, autosave)
 */
import { CFG } from './config.js';
import { hashSeed, makeRng } from './rng.js';
import { createInput } from './input.js';
import { audio } from './audio.js';
import { putData, getData, delData, listKeys, packWorld, unpackWorld } from './save.js';
import { generateWorld } from './worldgen.js';
import { buildSprites } from './sprites.js';
import { createRenderer, renderGame, updateCamera, makeFx, updateFx, clearChunks } from './renderer.js';
import { newCharacter, createPlayer, charData, updatePlayer, updateDrops, placeAtSpawn } from './player.js';
import { trySpawn, updateEnemies, updateProjectiles } from './enemies.js';
import { spawnNPC, updateNPCs, tryArrivals } from './npcs.js';
import { updateLiquids } from './liquids.js';
import { initTime, updateTime, updateEvents, skyState, detectZone } from './events.js';
import { createUI, uiUpdate, uiDraw, menuUpdate, menuDraw, initMap, randomLook } from './ui.js';
import { solidAt } from './world.js';
import { migrateChar } from './items.js';

const canvas = document.getElementById('game');
const input = createInput(canvas);
const S = buildSprites();
const R = createRenderer(canvas, S);

function loadSettings() {
  const def = { music: 0.45, sfx: 0.7, zoom: CFG.ZOOM, autosave: true, shake: true };
  try { return Object.assign(def, JSON.parse(localStorage.getItem('tb:settings') || '{}')); } catch (e) { return def; }
}
const settings = loadSettings();
audio.setVolume(settings.music, settings.sfx);

const BG0 = () => ({ w: { forest: 1, desert: 0, snow: 0, jungle: 0, blight: 0, ocean: 0 }, target: 'forest', groundY: 3000 });
const G = {
  state: 'menu', tick: 0, S, R, input, settings, rng: makeRng(Date.now() >>> 0),
  world: null, player: null, enemies: [], projectiles: [], npcs: [], items: [], particles: [], texts: [], stars: [], lights: [], chat: [],
  cam: { x: 0, y: 0, px: 0, py: 0, shake: 0, snap: true }, time: initTime(), sky: null, zone: {}, bg: BG0(),
  flags: { bosses: {}, cryptOpen: false, orbs: 0 }, boss: null, townNPCs: 0, mouseW: { x: 0, y: 0 },
  ui: createUI(),
  menu: { screen: 'title', chars: [], worlds: [], fields: {}, look: randomLook(), char: null, loading: { text: '', frac: 0 }, focus: null, confirm: null },
};
G.fx = makeFx(G);
G.msg = (text, col = '#ffffff') => { G.chat.push({ text, col, t: G.tick }); if (G.chat.length > 60) G.chat.shift(); };
G.sfx = n => audio.sfx(n);

// ------------------------------------------------------------------ game setup / persistence
function resetEntities() {
  G.enemies = []; G.projectiles = []; G.npcs = []; G.items = []; G.particles = []; G.texts = []; G.stars = []; G.lights = [];
  G.boss = null; G.chat = []; G.bg = BG0(); G.light = null;
}
function startPlay(wd, ch, meta, data) {
  resetEntities();
  // drop any menu text focus and stale key/mouse state so controls work from the first tick
  G.menu.focus = null; input.text = null;
  input.down.clear(); input.pressed.clear();
  Object.assign(input.mouse, { l: false, r: false, lp: false, rp: false, wheel: 0 });
  G.world = wd;
  G.worldMeta = meta;
  wd.difficulty = CFG.difficulty[wd.difficulty] ? wd.difficulty : 'normal';
  G.diff = CFG.difficulty[wd.difficulty];
  G.player = createPlayer(ch);
  G.flags = data && data.flags ? data.flags : { bosses: {}, cryptOpen: false, orbs: 0 };
  G.flags.bosses = G.flags.bosses || {};
  G.time = initTime();
  if (data && data.time) { G.time.t = data.time.t; G.time.day = data.time.day; G.time.isDay = G.time.t < CFG.day.dayTicks; }
  if (data && data.npcs) for (const n of data.npcs) { const o = spawnNPC(G, n.key, 0, 0); o.x = o.px = n.x; o.y = o.py = n.y; o.home = n.home; }
  else {
    const gx = wd.spawnX + 4;
    let gy = 0;
    while (gy < wd.h - 1 && !solidAt(wd, gx, gy + 1)) gy++;
    spawnNPC(G, 'guide', gx, gy);
  }
  placeAtSpawn(G);
  G.ui = createUI();
  G.cam.snap = true; G.cam.shake = 0;
  clearChunks(R);
  G.sky = skyState(G);
  detectZone(G);
  for (const k in G.bg.w) G.bg.w[k] = k === G.bg.target ? 1 : 0;
  G.bg.groundY = wd.surf[Math.floor((G.player.x + 10) / 16)] * 16;
  updateCamera(G, R);
  initMap(G);
  G.state = 'play';
  G.msg('Welcome to ' + wd.name + ', ' + G.player.name + '!', '#ffe050');
  if (wd.difficulty === 'hard') G.msg('This is a Hard world. Nothing here will go easy on you.', '#ff5050');
  G.msg('A/D move, Space jump, left-click to use, right-click to interact, Esc inventory, M map.', '#b4d2ff');
}

async function saveGame(auto) {
  if (G.state !== 'play') return;
  const wd = G.world, meta = G.worldMeta;
  if (auto) G.msg('Autosaving...', '#b4b4b4');
  meta.played = Date.now();
  const ok1 = await putData('world:' + wd.id, packWorld(G));
  const ok2 = await putData('wmeta:' + wd.id, meta);
  const ok3 = await putData('char:' + G.player.id, charData(G.player));
  G.msg(ok1 && ok2 && ok3 ? 'World saved.' : 'Saving failed (storage full or unavailable).', ok1 && ok2 && ok3 ? '#96ff96' : '#ff8080');
}

G.actions = {
  async refreshLists() {
    const M = G.menu;
    const ck = await listKeys('char:');
    M.chars = (await Promise.all(ck.map(k => getData(k)))).filter(Boolean).map(migrateChar).sort((a, b) => b.created - a.created);
    const wk = await listKeys('wmeta:');
    M.worlds = (await Promise.all(wk.map(k => getData(k)))).filter(Boolean).sort((a, b) => b.played - a.played);
    if (M.char) M.char = M.chars.find(c => c.id === M.char.id) || M.char;
  },
  async createChar(name, look) {
    const ch = newCharacter(name, look);
    await putData('char:' + ch.id, ch);
    G.menu.char = ch;
    await G.actions.refreshLists();
    G.menu.screen = 'worlds';
  },
  async deleteChar(id) { await delData('char:' + id); await G.actions.refreshLists(); },
  async deleteWorld(id) { await delData('world:' + id); await delData('wmeta:' + id); await G.actions.refreshLists(); },
  async createWorld(name, seedText, difficulty = 'normal') {
    const M = G.menu;
    if (!M.char) { M.screen = 'chars'; return; }
    M.screen = 'loading'; M.loading = { title: 'Generating ' + name, text: 'Starting', frac: 0 };
    const seed = hashSeed(seedText);
    const wd = await generateWorld(seed, name, (t, f) => { M.loading.text = t; M.loading.frac = f; });
    wd.id = 'w' + Date.now().toString(36);
    wd.difficulty = CFG.difficulty[difficulty] ? difficulty : 'normal';
    const meta = { id: wd.id, name, seedText: String(seedText), seed, difficulty: wd.difficulty, created: Date.now(), played: Date.now() };
    startPlay(wd, M.char, meta, null);
    await saveGame(false);
  },
  async playWorld(meta) {
    const M = G.menu;
    if (!M.char) { M.screen = 'chars'; return; }
    M.screen = 'loading'; M.loading = { title: 'Loading ' + meta.name, text: 'Reading save', frac: 0.3 };
    const data = await getData('world:' + meta.id);
    if (!data) { M.screen = 'worlds'; M.err = 'That world could not be loaded.'; return; }
    M.loading.text = 'Unpacking'; M.loading.frac = 0.7;
    await new Promise(r => setTimeout(r, 0));
    const wd = unpackWorld(data);
    const ch = migrateChar((await getData('char:' + M.char.id)) || M.char);
    startPlay(wd, ch, meta, data);
  },
  save(auto) { saveGame(auto); },
  async exitToTitle() {
    await saveGame(false);
    G.state = 'menu'; G.ui = createUI(); G.menu.screen = 'title'; G.world = null; G.player = null;
    resetEntities();
    await G.actions.refreshLists();
  },
  saveSettings() { try { localStorage.setItem('tb:settings', JSON.stringify(settings)); } catch (e) { /* storage unavailable */ } },
};

// ------------------------------------------------------------------ loop
function pickMusic() {
  const p = G.player, wd = G.world;
  if (G.boss) return 'boss';
  if (p.y / 16 > wd.surfaceLine + 4) return 'under';
  return G.time.isDay ? 'day' : 'night';
}
function tick() {
  G.tick++;
  if (G.onTick) G.onTick(G);
  if (G.state === 'play') {
    const z = settings.zoom;
    G.mouseW = { x: (R.cx != null ? R.cx : G.cam.x) + input.mouse.x / z, y: (R.cy != null ? R.cy : G.cam.y) + input.mouse.y / z };
    uiUpdate(G);
    if (G.state === 'play' && !G.ui.pause) {
      G.lights.length = 0;
      updateTime(G);
      updateEvents(G);
      updatePlayer(G);
      updateNPCs(G);
      if (G.tick % 600 === 0) tryArrivals(G);
      trySpawn(G);
      updateEnemies(G);
      updateProjectiles(G);
      updateDrops(G);
      updateLiquids(G);
      updateFx(G);
      updateCamera(G, R);
      audio.music(pickMusic());
    }
  } else {
    menuUpdate(G);
    audio.music('day');
  }
  input.endTick();
}
const perf = { frame: 0, render: 0, ui: 0, tick: 0, fps: 0, frames: 0, t0: 0, show: false };
G.perf = perf;
function render(alpha) {
  const ctx = R.ctx;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  if (G.state === 'play' && G.world) {
    const t0 = performance.now();
    renderGame(G, R, alpha);
    const t1 = performance.now();
    uiDraw(G, ctx);
    const t2 = performance.now();
    perf.render += (t1 - t0 - perf.render) * 0.1; perf.ui += (t2 - t1 - perf.ui) * 0.1;
    if (perf.show) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(R.W / 2 - 170, R.H - 30, 340, 24);
      ctx.fillStyle = '#fff'; ctx.font = '13px monospace'; ctx.textAlign = 'center';
      ctx.fillText(`${perf.fps} fps  render ${perf.render.toFixed(1)}ms  ui ${perf.ui.toFixed(1)}ms  tick ${perf.tick.toFixed(1)}ms`, R.W / 2, R.H - 13);
    }
  } else menuDraw(G, ctx);
  perf.frames++;
  const now = performance.now();
  if (now - perf.t0 > 1000) { perf.fps = perf.frames; perf.frames = 0; perf.t0 = now; }
}
let last = performance.now(), acc = 0;
function frame(now) {
  let dt = now - last;
  last = now;
  if (dt > 250) dt = 250;
  acc += dt * (G.timeScale || 1);
  let n = 0;
  const tt = performance.now();
  const maxSteps = 5 * (G.timeScale || 1);
  while (acc >= CFG.STEP && n < maxSteps) { tick(); acc -= CFG.STEP; n++; }
  if (n) perf.tick += ((performance.now() - tt) / n - perf.tick) * 0.1;
  if (n >= maxSteps) acc = 0;
  render(acc / CFG.STEP);
  requestAnimationFrame(frame);
}
addEventListener('mousedown', () => audio.init());
addEventListener('keydown', e => { audio.init(); if (e.code === 'F3') { perf.show = !perf.show; e.preventDefault(); } });
G.actions.refreshLists();
requestAnimationFrame(frame);
// console debug handle (e.g. inspect __G.player in devtools)
window.__G = G;
