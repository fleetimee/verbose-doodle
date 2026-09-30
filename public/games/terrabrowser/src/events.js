// Day/night clock, sky colors, weather, blood moon, falling stars, world random ticks, biome detection, autosave.
import { CFG } from './config.js';
import { T, W, SOLID } from './tiles.js';
import { setTile, tileAt, inB } from './world.js';
import { dropItem } from './items.js';
import { mix } from './sprites.js';

export function initTime() {
  return { t: CFG.day.start, day: 1, isDay: true, bloodMoon: false, rain: 0, rainTarget: 0, rainT: 0, saveT: 0 };
}

const KF = [
  [0.00, '#4a5a9a', '#f0a878', [0.55, 0.5, 0.5]],
  [0.05, '#3a78d8', '#a8d4ff', [1, 1, 1]],
  [0.54, '#3a78d8', '#a8d4ff', [1, 1, 1]],
  [0.60, '#3a3a7a', '#f08050', [0.62, 0.48, 0.45]],
  [0.65, '#060a1e', '#141c3c', [0.2, 0.22, 0.36]],
  [0.95, '#060a1e', '#141c3c', [0.2, 0.22, 0.36]],
  [1.00, '#4a5a9a', '#f0a878', [0.55, 0.5, 0.5]],
];
export function skyState(G) {
  const tm = G.time, D = CFG.day, total = D.dayTicks + D.nightTicks, f = tm.t / total;
  let i = 0;
  while (i < KF.length - 2 && KF[i + 1][0] <= f) i++;
  const a = KF[i], b = KF[i + 1], k = Math.max(0, Math.min(1, (f - a[0]) / (b[0] - a[0])));
  let top = mix(a[1], b[1], k), bottom = mix(a[2], b[2], k);
  let light = a[3].map((v, j) => v + (b[3][j] - v) * k);
  const nightAmt = f < 0.6 ? (f < 0.05 ? 1 - f / 0.05 : f > 0.55 ? (f - 0.55) / 0.05 : 0) : f < 0.95 ? 1 : 1 - (f - 0.95) / 0.05;
  if (tm.bloodMoon && !tm.isDay) {
    const n = Math.min(1, nightAmt);
    top = mix(top, '#2a0406', n); bottom = mix(bottom, '#5a0a0a', n);
    light = light.map((v, j) => v + ([0.4, 0.14, 0.14][j] - v) * n);
  }
  if (tm.rain > 0) {
    top = mix(top, '#4a5460', tm.rain * 0.6); bottom = mix(bottom, '#7a8490', tm.rain * 0.6);
    light = light.map(v => v * (1 - 0.3 * tm.rain));
  }
  const sunF = tm.isDay ? tm.t / D.dayTicks : -1;
  const moonF = tm.isDay ? -1 : (tm.t - D.dayTicks) / D.nightTicks;
  return { top, bottom, light, bright: Math.max(...light), sunF, moonF, stars: Math.min(1, nightAmt * 1.2), phase: tm.day % 8 };
}
export function clockText(G) {
  const hrs = (4.5 + (G.time.t / (CFG.day.dayTicks + CFG.day.nightTicks)) * 24) % 24;
  const h = Math.floor(hrs), m = Math.floor((hrs - h) * 60);
  return ((h + 11) % 12 + 1) + ':' + String(m).padStart(2, '0') + (h < 12 ? ' AM' : ' PM');
}

export function updateTime(G) {
  const tm = G.time, D = CFG.day, total = D.dayTicks + D.nightTicks;
  tm.t++;
  if (tm.t >= total) { tm.t = 0; tm.day++; }
  const wasDay = tm.isDay;
  tm.isDay = tm.t < D.dayTicks;
  if (wasDay && !tm.isDay) {
    tm.bloodMoon = G.player.maxHp >= 120 && Math.random() < 1 / 8;
    if (tm.bloodMoon) G.msg('The Blood Moon is rising...', '#ff3232');
  }
  if (!wasDay && tm.isDay) tm.bloodMoon = false;
  G.sky = skyState(G);
}

export function updateEvents(G) {
  const tm = G.time, p = G.player;
  // weather
  if (--tm.rainT <= 0) {
    if (tm.rainTarget > 0) { tm.rainTarget = 0; tm.rainT = 3600 + Math.random() * 7200; }
    else if (Math.random() < 0.25) { tm.rainTarget = 0.5 + Math.random() * 0.5; tm.rainT = 5400 + Math.random() * 10800; }
    else tm.rainT = 3600;
  }
  tm.rain += (tm.rainTarget - tm.rain) * 0.002;
  if (tm.rain < 0.005) tm.rain = 0;
  // falling stars
  if (!tm.isDay && Math.random() < 1 / 1100) {
    G.stars.push({ x: p.x + (Math.random() - 0.5) * 1800, y: Math.max(20, p.y - 750), vx: (Math.random() - 0.5) * 6, vy: 8, px: 0, py: 0 });
    G.stars[G.stars.length - 1].px = G.stars[G.stars.length - 1].x;
  }
  const wd = G.world;
  for (const s of G.stars) {
    s.px = s.x; s.py = s.y;
    s.x += s.vx; s.y += s.vy;
    G.lights.push({ x: s.x, y: s.y, r: 1, g: 0.9, b: 0.5 });
    if (Math.random() < 0.6) G.fx.particles(s.x, s.y, 1, '#ffe080', { spread: 0.5, life: 25, glow: true });
    const tx = Math.floor(s.x / 16), ty = Math.floor(s.y / 16);
    if (!inB(wd, tx, ty) || SOLID[tileAt(wd, tx, ty)] || wd.liq[ty * wd.w + tx] > 60 || tileAt(wd, tx, ty) === T.PLATFORM) {
      if (inB(wd, tx, ty)) { dropItem(G, 'fallen_star', 1, s.px, s.py - 8, 0, 0); G.fx.particles(s.px, s.py, 12, '#ffe070', { spread: 2.5, glow: true }); G.sfx('star'); }
      s.dead = true;
    }
  }
  if (G.stars.length) G.stars = G.stars.filter(s => !s.dead);
  randomTicks(G);
  if (G.tick % 30 === 0) detectZone(G);
  // parallax crossfade
  const bg = G.bg;
  for (const k in bg.w) bg.w[k] += ((k === bg.target ? 1 : 0) - bg.w[k]) * 0.02;
  // autosave
  if (++tm.saveT >= CFG.autosaveTicks) { tm.saveT = 0; if (G.settings.autosave !== false) G.actions.save(true); }
}

function randomTicks(G) {
  const wd = G.world, p = G.player;
  const cx = Math.floor((p.x + 10) / 16), cy = Math.floor((p.y + 20) / 16);
  for (let k = 0; k < 60; k++) {
    const x = cx + Math.floor((Math.random() - 0.5) * 240), y = cy + Math.floor((Math.random() - 0.5) * 140);
    if (x < 2 || y < 2 || x >= wd.w - 2 || y >= wd.h - 2) continue;
    const t = tileAt(wd, x, y);
    const up = tileAt(wd, x, y - 1), dn = tileAt(wd, x, y + 1);
    if (t === T.DIRT || t === T.MUD) {
      const exposed = up === T.AIR || dn === T.AIR || tileAt(wd, x - 1, y) === T.AIR || tileAt(wd, x + 1, y) === T.AIR;
      if (!exposed) continue;
      for (let j = 0; j < 4; j++) {
        const n = tileAt(wd, x + ((Math.random() * 3) | 0) - 1, y + ((Math.random() * 3) | 0) - 1);
        if (t === T.DIRT && (n === T.GRASS || n === T.BGRASS)) { setTile(wd, x, y, n); break; }
        if (t === T.MUD && n === T.JGRASS) { setTile(wd, x, y, T.JGRASS); break; }
      }
    } else if (t === T.BGRASS || t === T.BLIGHT) {
      if (Math.random() < 0.35) {
        const nx = x + ((Math.random() * 5) | 0) - 2, ny = y + ((Math.random() * 5) | 0) - 2, n = tileAt(wd, nx, ny);
        if (n === T.GRASS) setTile(wd, nx, ny, T.BGRASS);
        else if (n === T.STONE) setTile(wd, nx, ny, T.BLIGHT);
      }
      if (t === T.BGRASS && up === T.AIR && Math.random() < 0.02) setTile(wd, x, y - 1, T.PLANT, (Math.random() * 6) | 0);
    } else if (t === T.GRASS || t === T.JGRASS) {
      if (up === T.AIR && !wd.liq[(y - 1) * wd.w + x]) {
        const r = Math.random();
        if (r < 0.02) setTile(wd, x, y - 1, T.PLANT, (Math.random() * 6) | 0);
        else if (r < 0.022 && y < wd.surfaceLine) setTile(wd, x, y - 1, T.GLOWCAP);
      }
      if (dn === T.AIR && Math.random() < 0.01) setTile(wd, x, y + 1, T.VINE);
    } else if (t === T.VINE) {
      let len = 0;
      while (tileAt(wd, x, y - len - 1) === T.VINE && len < 12) len++;
      if (dn === T.AIR && len < 7 && Math.random() < 0.05) setTile(wd, x, y + 1, T.VINE);
    } else if (t === T.SAPLING && Math.random() < 0.08) {
      growTree(wd, x, y);
    }
  }
}
function growTree(wd, x, y) {
  const g = tileAt(wd, x, y + 1);
  const kind = g === T.GRASS ? 0 : g === T.SNOW ? 1 : g === T.JGRASS ? 2 : g === T.BGRASS ? 3 : 0;
  const h = 7 + ((Math.random() * 8) | 0);
  for (let k = 1; k <= h + 3; k++) { const t = tileAt(wd, x, y - k); if (t && t !== T.VINE && t !== T.PLANT) return; }
  for (let k = 0; k < h; k++) {
    let m = kind << 4;
    if (k === 0) m |= 8;
    if (k === h - 1) m |= 4;
    else if (k > 2 && k < h - 2 && Math.random() < 0.18) m |= Math.random() < 0.5 ? 1 : 2;
    setTile(wd, x, y - k, T.TREE, m);
  }
}

export function detectZone(G) {
  const wd = G.world, p = G.player;
  const cx = Math.floor((p.x + 10) / 16), cy = Math.floor((p.y + 20) / 16);
  let sand = 0, snow = 0, jungle = 0, blight = 0, crypt = 0;
  for (let y = cy - 25; y <= cy + 25; y += 1) for (let x = cx - 40; x <= cx + 40; x += 2) {
    if (!inB(wd, x, y)) continue;
    const t = wd.tile[y * wd.w + x], wl = wd.wall[y * wd.w + x];
    if (t === T.SAND || t === T.SANDSTONE) sand++;
    else if (t === T.SNOW || t === T.ICE) snow++;
    else if (t === T.MUD || t === T.JGRASS) jungle++;
    else if (t === T.BLIGHT || t === T.BGRASS) blight++;
    else if (t === T.CRYPT) crypt++;
    if (wl === W.CRYPT) crypt++;
    else if (wl === W.BLIGHT) blight++;
  }
  const z = {
    desert: sand > 250, snow: snow > 250, jungle: jungle > 250, blight: blight > 150, crypt: crypt > 200,
    ocean: (cx < 110 || cx > wd.w - 110) && cy < wd.surfaceLine,
    sky: cy < 110, under: cy > wd.surfaceLine, cavern: cy > wd.rockLine, hell: cy >= wd.hellLine,
  };
  G.zone = z;
  G.bg.target = z.ocean ? 'ocean' : z.blight ? 'blight' : z.jungle ? 'jungle' : z.snow ? 'snow' : z.desert ? 'desert' : 'forest';
}
