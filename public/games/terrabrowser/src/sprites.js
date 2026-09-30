// All pixel art, generated procedurally at startup. No external images.
import { T, TILE, WALL } from './tiles.js';
import { ITEMS } from './items.js';
import { hash2 } from './rng.js';

// ------------------------------------------------------------------ color + canvas helpers
export function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
export function rgb(hex) { const n = parseInt(hex.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
export function shade(hex, f) {
  const [r, g, b] = rgb(hex);
  const k = v => Math.max(0, Math.min(255, Math.round(f >= 1 ? v + (255 - v) * (f - 1) : v * f)));
  return '#' + ((1 << 24) | (k(r) << 16) | (k(g) << 8) | k(b)).toString(16).slice(1);
}
export function mix(h1, h2, t) {
  const a = rgb(h1), b = rgb(h2);
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
  return '#' + ((1 << 24) | (c[0] << 16) | (c[1] << 8) | c[2]).toString(16).slice(1);
}

// Pixel grid with auto-outline, used for items, enemies and bosses.
function grid(w, h) {
  const px = new Array(w * h).fill(null);
  const g = {
    w, h, px,
    set(x, y, c) { x = Math.round(x); y = Math.round(y); if (c && x >= 0 && y >= 0 && x < w && y < h) px[y * w + x] = c; },
    get(x, y) { return x >= 0 && y >= 0 && x < w && y < h ? px[y * w + x] : null; },
    rect(x, y, rw, rh, c) { for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) g.set(x + i, y + j, c); },
    line(x0, y0, x1, y1, c, r = 0) {
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1) * 2;
      for (let k = 0; k <= n; k++) {
        const x = x0 + (x1 - x0) * k / n, y = y0 + (y1 - y0) * k / n;
        if (r) g.disc(x, y, r, c); else g.set(x, y, c);
      }
    },
    disc(cx, cy, r, c, fn) {
      for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
        const dx = x - cx, dy = y - cy;
        if (dx * dx + dy * dy <= r * r + 0.3) g.set(x, y, fn ? fn(x, y, dx, dy) : c);
      }
    },
    ell(cx, cy, rx, ry, c, fn) {
      for (let y = Math.floor(cy - ry); y <= cy + ry; y++) for (let x = Math.floor(cx - rx); x <= cx + rx; x++) {
        const dx = (x - cx) / rx, dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1.02) g.set(x, y, fn ? fn(x, y, dx, dy) : c);
      }
    },
    outline(c = '#140f0c') {
      const add = [];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (px[y * w + x]) continue;
        if (g.get(x - 1, y) || g.get(x + 1, y) || g.get(x, y - 1) || g.get(x, y + 1)) add.push(y * w + x);
      }
      for (const i of add) px[i] = c;
      return g;
    },
    canvas(alpha = 1) {
      const c = mk(w, h), ctx = c.getContext('2d'), im = ctx.createImageData(w, h);
      for (let i = 0; i < w * h; i++) {
        const col = px[i];
        if (!col) continue;
        const [r, gg, b] = rgb(col.slice(0, 7));
        im.data[i * 4] = r; im.data[i * 4 + 1] = gg; im.data[i * 4 + 2] = b;
        im.data[i * 4 + 3] = col.length > 7 ? parseInt(col.slice(7), 16) : Math.round(alpha * 255);
      }
      ctx.putImageData(im, 0, 0);
      return c;
    },
  };
  return g;
}
function flipCanvas(src) { const c = mk(src.width, src.height), x = c.getContext('2d'); x.translate(src.width, 0); x.scale(-1, 1); x.drawImage(src, 0, 0); return c; }

// ------------------------------------------------------------------ palettes for items
export const PAL = {
  wood: { a: '#d8a060', b: '#a8733f', c: '#6e4826', x: '#c8a070', y: '#8a5a30' },
  stone: { a: '#b8b8c0', b: '#8a8a94', c: '#5a5a64' },
  copper: { a: '#ffd2a0', b: '#e0904e', c: '#9a5426', x: '#ffe6c8' },
  iron: { a: '#dcd6cc', b: '#9e968a', c: '#5a534b', x: '#f2eee8' },
  silver: { a: '#f6f9ff', b: '#bcc7d6', c: '#6c7888', x: '#ffffff' },
  gold: { a: '#fff6b0', b: '#f2c844', c: '#a07818', x: '#ffffff' },
  platinum: { a: '#f0f6ff', b: '#a8c0d8', c: '#5a7088', x: '#ffffff' },
  demonite: { a: '#c8a8ff', b: '#7a4ac8', c: '#3a2070', x: '#e8d8ff' },
  hellstone: { a: '#ffb070', b: '#e0441a', c: '#6a1a0e', x: '#ffe060' },
  rot: { a: '#d8b0f0', b: '#9060c0', c: '#4e2a6e', x: '#b0e060' },
  crypt: { a: '#c8dcff', b: '#6a8ad8', c: '#34489a', x: '#e0ecff' },
  wall: { a: '#ffb080', b: '#d8502a', c: '#7a1e10', x: '#ffd040' },
  bone: { a: '#fffbe8', b: '#ddd4b8', c: '#9a9078', x: '#fff' },
  eye: { a: '#ffffff', b: '#e8d0d0', c: '#a02020', x: '#3060c0', y: '#c03030' },
  gel: { a: '#b8e8ff', b: '#4aa0e8', c: '#2a60a8' },
  lens: { a: '#f0f8ff', b: '#a0c8e8', c: '#506888' },
  star: { a: '#fffce0', b: '#ffd84a', c: '#c89018' },
  glow: { a: '#c8e8ff', b: '#5a8cff', c: '#2a4aa8', x: '#e8f4ff' },
  grass: { a: '#9ae05a', b: '#4ab83a', c: '#2a7a24' },
  torch: { a: '#fff4b0', b: '#ffa030', c: '#c05010' },
  spark: { a: '#fff0a0', b: '#ffb040', c: '#b06010' },
  tide: { a: '#b0e8ff', b: '#3a9ae0', c: '#1a4a90' },
  gun: { a: '#c8d0d8', b: '#7a8088', c: '#3a4048', x: '#8a5a30', y: '#5a3818' },
  fire: { a: '#ffe090', b: '#ff8a20', c: '#b04010' },
  water: { a: '#b0e0ff', b: '#3a8ae8', c: '#2050a0' },
  lava: { a: '#ffd060', b: '#ff6a1a', c: '#b03010' },
  cloud: { a: '#ffffff', b: '#d8e4f8', c: '#8aa0c8', x: '#c8e8ff' },
  boots: { a: '#e0aa78', b: '#9a6038', c: '#5a3418', x: '#80d8ff' },
  sky: { a: '#fffbe0', b: '#b8d8ff', c: '#5a7ab8', x: '#ffe060' },
  vigor: { a: '#b0ffb0', b: '#40c060', c: '#1a6a2a', x: '#ffd040' },
  ash: { a: '#c0b8c0', b: '#6a6070', c: '#3a3040', x: '#ff7030' },
  heart: { a: '#ffb8b8', b: '#f03848', c: '#8a1020' },
  mana: { a: '#b8dcff', b: '#3a70f0', c: '#1a3090' },
  heal: { a: '#ffb0b0', b: '#f03848', c: '#8a1020' },
  ironskin: { a: '#eef4fa', b: '#a8b6c6', c: '#5e6c7c' },
  royal: { a: '#d0e4ff', b: '#6a9af0', c: '#2a4aa0', x: '#ff5a8a' },
  ice: { a: '#f0faff', b: '#a8dcff', c: '#4a8ac8', x: '#ffffff' },
  antler: { a: '#e8d8b8', b: '#c8b490', c: '#8e7a58', x: '#f4f0c8' },
  swift: { a: '#c0ffe0', b: '#40d890', c: '#1a7a50' },
  shine: { a: '#fffcd0', b: '#ffe050', c: '#b09010' },
  glassb: { a: '#ffffff', b: '#d8f0ff', c: '#8ab0c8' },
};
const HANDLE = '#8a5a30', HANDLE_D = '#5a3818';

// ------------------------------------------------------------------ item drawers (16x16 grids)
const ITEM_DRAW = {
  sword(g, p) {
    g.line(5, 10, 14, 1, p.b); g.line(4, 10, 13, 1, p.a); g.line(6, 10, 14, 2, p.c); g.set(14, 1, p.a);
    g.line(2, 9, 6, 13, p.x || p.c); g.line(1, 14, 3, 12, HANDLE); g.set(1, 14, HANDLE_D); g.set(2, 13, HANDLE_D);
  },
  pick(g, p) {
    g.line(2, 13, 11, 4, HANDLE); g.line(3, 13, 11, 5, HANDLE_D);
    g.line(6, 1, 9, 1, p.a); g.line(9, 1, 12, 3, p.b); g.line(12, 3, 14, 6, p.b); g.line(14, 6, 14, 9, p.c);
    g.line(6, 2, 9, 2, p.b); g.line(10, 2, 13, 5, p.b); g.set(5, 2, p.c); g.set(13, 7, p.c); g.set(11, 3, p.a);
  },
  axe(g, p) {
    g.line(2, 13, 10, 5, HANDLE); g.line(3, 13, 10, 6, HANDLE_D);
    g.rect(9, 1, 3, 6, p.b); g.rect(12, 2, 2, 6, p.a); g.set(14, 3, p.a); g.set(14, 6, p.c); g.rect(9, 1, 3, 1, p.a); g.rect(9, 6, 3, 1, p.c);
  },
  hammer(g, p) {
    g.line(2, 13, 10, 5, HANDLE); g.line(3, 13, 10, 6, HANDLE_D);
    g.line(7, 3, 12, 8, p.b, 1.6); g.line(7, 2, 11, 6, p.a); g.line(9, 7, 13, 9, p.c);
  },
  bow(g, p) {
    for (let y = 1; y <= 14; y++) { const x = 4 + Math.round(Math.sin((y - 1) / 13 * Math.PI) * 6); g.set(x, y, p.b); g.set(x - 1, y, p.a); g.set(x + 1, y, p.c); }
    g.line(4, 1, 4, 14, '#e8e0d0'); g.rect(9, 7, 2, 2, HANDLE);
  },
  gun(g, p) {
    g.rect(3, 5, 11, 2, p.b); g.rect(3, 5, 11, 1, p.a); g.rect(12, 4, 2, 1, p.c);
    g.rect(3, 7, 5, 2, p.x); g.rect(3, 9, 3, 4, p.x); g.rect(3, 12, 3, 1, p.y); g.set(7, 9, p.c);
  },
  wand(g, p) { g.line(3, 13, 10, 6, HANDLE); g.line(4, 13, 10, 7, HANDLE_D); g.disc(11.5, 4.5, 2.4, p.b); g.set(11, 3, p.a); g.set(10, 4, p.a); g.set(13, 6, p.c); },
  staff(g, p) { g.line(1, 14, 11, 4, HANDLE); g.line(2, 14, 11, 5, HANDLE_D); g.disc(12.5, 3, 2.5, p.b); g.set(12, 2, p.a); g.set(11, 3, p.a); g.set(14, 4, p.c); },
  boomer(g, p) { g.line(2, 5, 8, 12, p.b, 1); g.line(8, 12, 14, 5, p.b, 1); g.line(2, 4, 8, 11, p.a); g.line(8, 11, 14, 4, p.a); },
  arrow(g, p) { g.line(2, 13, 12, 3, HANDLE); g.set(13, 2, '#c8c8d0'); g.set(14, 1, '#e8e8f0'); g.set(12, 2, '#a8a8b0'); g.set(13, 3, '#a8a8b0'); g.line(1, 12, 2, 11, p.b); g.line(3, 14, 4, 13, p.b); if (p.b !== PAL.wood.b) { g.set(14, 1, p.a); g.set(13, 1, p.b); } },
  bullet(g, p) { g.rect(5, 6, 6, 4, p.b); g.rect(5, 6, 6, 1, p.a); g.rect(10, 7, 2, 2, p.c); },
  helm(g, p) { g.ell(8, 8, 6, 6, p.b); g.rect(2, 8, 12, 5, p.b); g.rect(3, 3, 5, 2, p.a); g.rect(5, 9, 7, 2, '#1a1410'); g.rect(2, 12, 12, 1, p.c); },
  mail(g, p) { g.rect(3, 3, 10, 11, p.b); g.rect(1, 3, 3, 5, p.a); g.rect(12, 3, 3, 5, p.a); g.rect(6, 3, 4, 2, '#2a1f18'); g.rect(4, 6, 1, 7, p.a); g.rect(3, 12, 10, 2, p.c); },
  greaves(g, p) { g.rect(3, 2, 10, 3, p.c); g.rect(4, 5, 3, 7, p.b); g.rect(9, 5, 3, 7, p.b); g.rect(4, 5, 1, 7, p.a); g.rect(9, 5, 1, 7, p.a); g.rect(3, 12, 5, 2, p.c); g.rect(9, 12, 5, 2, p.c); },
  bar(g, p) { g.rect(4, 7, 9, 2, p.a); g.rect(3, 9, 10, 3, p.b); g.rect(13, 8, 1, 4, p.c); g.rect(3, 11, 10, 1, p.c); g.set(5, 7, p.x || p.a); },
  ore(g, p) { g.disc(8, 9, 5.5, '#7d7d86'); g.disc(7, 8, 3, '#9a9aa4'); for (const [x, y] of [[5, 6], [9, 9], [10, 5], [4, 10], [7, 12]]) { g.rect(x, y, 2, 2, p.b); g.set(x, y, p.a); g.set(x + 1, y + 1, p.c); } },
  chunk(g, p) { g.disc(8, 9, 5, p.b); g.disc(7, 8, 2.5, p.a); g.set(11, 12, p.c); },
  gel(g, p) { g.ell(8, 10, 6, 4, p.b); g.ell(6, 9, 2, 1.5, p.a); g.rect(4, 13, 8, 1, p.c); },
  lens(g, p) { g.disc(8, 8, 5, p.b); g.disc(7, 7, 3, p.a); g.set(6, 6, '#ffffff'); g.set(11, 10, p.c); },
  bone(g, p) { g.line(4, 11, 11, 4, p.b, 1); g.line(4, 10, 10, 4, p.a); g.disc(3, 12, 1.5, p.b); g.disc(12, 3, 1.5, p.b); g.disc(4, 13, 1, p.a); g.disc(13, 4, 1, p.a); },
  scale(g, p) { g.ell(8, 8, 5, 6, p.b); g.line(8, 3, 8, 13, p.c); g.line(5, 6, 8, 9, p.c); g.line(11, 6, 8, 9, p.c); g.set(6, 5, p.a); g.set(7, 4, p.a); },
  star(g, p) {
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      const dx = x - 7.5, dy = y - 8, a = Math.atan2(dy, dx), r = Math.hypot(dx, dy);
      const lim = 3 + 3.8 * Math.pow(Math.abs(Math.cos(2.5 * (a + Math.PI / 2))), 2.2);
      if (r <= lim) g.set(x, y, r < 2.5 ? p.a : p.b);
    }
  },
  mush(g, p) { g.ell(8, 7, 6, 4, p.b); g.rect(2, 7, 13, 2, p.b); g.set(5, 5, p.a); g.set(9, 4, p.a); g.set(11, 6, p.a); g.rect(7, 9, 3, 5, '#e8e0d0'); g.rect(2, 8, 13, 1, p.c); },
  acorn(g, p) { g.ell(8, 10, 4, 4, p.b); g.rect(4, 6, 9, 3, p.c); g.set(8, 4, p.c); g.set(8, 5, p.c); g.set(6, 9, p.a); },
  seeds(g, p) { g.ell(8, 10, 5, 4, '#c8a878'); g.rect(6, 5, 5, 2, '#8a6a48'); for (const [x, y] of [[6, 9], [9, 10], [7, 12], [10, 8]]) g.set(x, y, p.b); },
  potion(g, p) { g.rect(7, 2, 3, 3, '#d8f0ff'); g.rect(7, 1, 3, 1, '#a07040'); g.disc(8.5, 10, 4.5, '#d8f0ff'); g.ell(8.5, 11.5, 4, 3, p.b); g.set(7, 11, p.a); g.set(6, 8, '#ffffff'); g.set(6, 9, '#ffffff'); },
  heart(g, p) { g.disc(5.5, 6, 3.2, p.b); g.disc(10.5, 6, 3.2, p.b); for (let y = 6; y < 14; y++) for (let x = 2 + (y - 6); x <= 14 - (y - 6); x++) g.set(x, y, p.b); g.set(4, 5, p.a); g.set(5, 4, p.a); g.set(4, 4, p.a); g.set(11, 10, p.c); g.set(10, 11, p.c); },
  crystal(g, p) { for (let y = 2; y <= 14; y++) { const hw = y < 7 ? (y - 2) : Math.round((14 - y) * 5 / 7); for (let x = 8 - hw; x <= 8 + hw; x++) g.set(x, y, x < 8 ? p.a : p.b); } g.line(8, 2, 8, 14, p.c); },
  idol(g, p) { g.disc(8, 7, 5, p.a); g.disc(9, 7, 2.5, p.x || p.b); g.disc(9, 7, 1, '#101010'); g.line(4, 5, 6, 7, p.c); g.rect(5, 12, 7, 3, '#6a5a50'); g.rect(5, 12, 7, 1, '#8a7a70'); },
  bait(g, p) { g.ell(8, 10, 6, 4, p.b); g.ell(7, 9, 3, 2, p.a); g.line(10, 8, 13, 4, '#d0a0a0', 0); g.set(13, 3, '#d0a0a0'); },
  coin(g, p) { g.disc(8, 8, 5, p.b); g.disc(8, 8, 3.5, p.a); g.disc(8, 8, 2.5, p.b); g.set(6, 5, '#ffffff'); },
  torch(g, p) { g.line(8, 15, 8, 7, HANDLE); g.line(9, 15, 9, 7, HANDLE_D); g.disc(8.5, 5, 2.5, p.b); g.disc(8.5, 5.5, 1.3, p.a); g.set(8, 2, p.c); },
  platform(g, p) { g.rect(1, 6, 14, 3, p.b); g.rect(1, 6, 14, 1, p.a); g.rect(1, 8, 14, 1, p.c); g.rect(3, 9, 2, 3, p.c); g.rect(11, 9, 2, 3, p.c); },
  flask(g, p) { g.rect(7, 2, 3, 3, '#e0f4ff'); g.rect(7, 1, 3, 1, '#a07040'); g.disc(8.5, 10, 4.5, '#d8f0ff'); g.disc(8, 11, 2.5, '#ffffff'); g.disc(10, 10, 1.8, '#ffffff'); },
  boots(g, p) { g.rect(4, 2, 5, 9, p.b); g.rect(4, 10, 9, 4, p.b); g.rect(4, 13, 9, 1, p.c); g.rect(4, 2, 1, 9, p.a); g.line(9, 3, 12, 1, p.x); g.line(9, 5, 13, 3, p.x); },
  charm(g, p) { for (let a = 0; a <= Math.PI; a += 0.1) g.set(8 + Math.cos(a) * 5, 9 - Math.sin(a) * 6, p.b); for (let a = 0; a <= Math.PI; a += 0.1) g.set(8 + Math.cos(a) * 4, 9 - Math.sin(a) * 5, p.a); g.rect(3, 9, 2, 4, p.b); g.rect(11, 9, 2, 4, p.b); g.line(6, 12, 11, 6, p.x); },
  crown(g, p) { g.rect(3, 8, 11, 5, p.b); g.rect(3, 12, 11, 1, p.c); for (const x of [3, 8, 13]) g.line(x, 8, x, 3, p.a); g.set(3, 2, p.a); g.set(8, 2, p.a); g.set(13, 2, p.a); g.set(8, 10, '#e02040'); g.set(5, 10, '#40b0ff'); g.set(11, 10, '#40b0ff'); g.ell(8, 14, 6, 1.5, '#4aa0e8'); },
  antler(g, p) { g.line(8, 14, 8, 8, p.b); g.line(8, 8, 3, 3, p.b); g.line(8, 8, 13, 2, p.b); g.line(5, 5, 2, 6, p.a); g.line(11, 4, 14, 6, p.a); g.disc(8, 12, 2.5, p.c); g.set(8, 12, p.x); g.rect(5, 14, 7, 2, '#6a5a50'); },
  pendant(g, p) { g.line(3, 1, 8, 7, '#b8b8c0'); g.line(13, 1, 8, 7, '#b8b8c0'); g.disc(8, 10, 3.5, p.b); g.disc(7, 9, 1.5, p.a); },
  band(g, p) { for (let a = 0; a < Math.PI * 2; a += 0.05) { g.set(8 + Math.cos(a) * 5, 9 + Math.sin(a) * 4, p.b); g.set(8 + Math.cos(a) * 4, 9 + Math.sin(a) * 3, p.c); } g.disc(8, 4.5, 2, p.x); },
  shield(g, p) { g.rect(3, 2, 10, 7, p.b); for (let y = 9; y < 15; y++) for (let x = 3 + (y - 9); x <= 12 - (y - 9); x++) g.set(x, y, p.b); g.disc(8, 7, 2.5, '#ffffff'); g.disc(8.5, 7, 1.2, p.x); g.rect(3, 2, 10, 1, p.a); },
  emblem(g, p) { g.disc(8, 8, 6, p.b); g.disc(8, 8, 4.5, p.c); g.line(5, 11, 11, 5, p.x, 0.6); g.line(5, 5, 11, 11, p.x, 0.6); },
  hook(g, p) { g.line(2, 14, 9, 7, '#8a8a94'); for (let a = -0.5; a <= Math.PI * 1.1; a += 0.1) g.set(10 + Math.cos(a) * 3, 5 - Math.sin(a) * 3, p.b); g.set(13, 7, p.a); },
  bucket(g, p) { for (let y = 5; y < 14; y++) for (let x = 3 + ((y - 5) >> 2); x <= 12 - ((y - 5) >> 2); x++) g.set(x, y, '#8a96a4'); g.rect(4, 5, 8, 2, p.b); g.set(4, 5, p.a); for (let a = 0; a <= Math.PI; a += 0.1) g.set(8 + Math.cos(a) * 5, 5 - Math.sin(a) * 4, '#5e6c7c'); },
  cactus(g) { g.rect(6, 2, 4, 13, '#49aa30'); g.rect(6, 2, 1, 13, '#7ad050'); g.rect(2, 6, 4, 2, '#49aa30'); g.rect(2, 3, 2, 4, '#49aa30'); g.rect(10, 8, 4, 2, '#49aa30'); g.rect(12, 5, 2, 4, '#49aa30'); },
};

// ------------------------------------------------------------------ tile textures
function texPixel(tex, pal, x, y, v, tid) {
  const h = hash2(x + v * 17, y + tid * 31, 7), hb = hash2((x >> 1) + v * 7, (y >> 1) + tid * 13, 3);
  switch (tex) {
    case 'dirt': return hb < 0.12 ? pal[2] : hb > 0.9 ? pal[0] : h < 0.06 ? pal[3] : pal[1];
    case 'stone': { const n = hash2((x >> 2) + v * 5, (y >> 2) + tid, 11); return hb < 0.18 ? pal[2] : hb > 0.8 ? pal[0] : n < 0.25 ? pal[3] : pal[1]; }
    case 'sand': return h < 0.15 ? pal[2] : h > 0.85 ? pal[0] : pal[1];
    case 'ice': return ((x + y + v * 3) % 7 === 0) ? pal[0] : hb < 0.2 ? pal[2] : pal[1];
    case 'ore': {
      const cx = [4, 11, 7, 12, 3][v % 5], cy = [5, 4, 11, 12, 11][v % 5];
      const nug = [[cx, cy], [(cx + 7) % 14 + 1, (cy + 6) % 14 + 1], [(cx + 3) % 14 + 1, (cy + 10) % 14 + 1]];
      for (const [nx, ny] of nug) { const d = Math.abs(x - nx) + Math.abs(y - ny); if (d <= 1) return d === 0 || (x < nx) ? pal[3] : pal[4]; if (d === 2 && hash2(x, y, v) < 0.4) return pal[4]; }
      return hb < 0.18 ? pal[2] : hb > 0.82 ? pal[0] : pal[1];
    }
    case 'brick': {
      const row = y >> 2, off = (row & 1) * 4;
      if ((y & 3) === 3 || ((x + off) & 7) === 7) return pal[3];
      return (y & 3) === 0 ? pal[0] : h < 0.2 ? pal[2] : pal[1];
    }
    case 'plank': {
      if ((y & 3) === 3) return pal[3];
      if ((y & 3) === 0) return pal[0];
      if (((x + (y >> 2) * 5) % 16) === 0) return pal[2];
      return h < 0.1 ? pal[2] : pal[1];
    }
    case 'glass': return (x === 1 || y === 1) ? pal[0] : (x + y) % 9 === 0 ? pal[0] : pal[1];
    case 'cloud': return hb > 0.7 ? pal[0] : hb < 0.15 ? pal[2] : pal[1];
  }
  return pal[1];
}

function buildTileSheet(tid) {
  const d = TILE[tid], pal = d.pal, c = mk(256, 48), ctx = c.getContext('2d'), im = ctx.createImageData(256, 48);
  const out = shade(pal[2], 0.55);
  const gr = d.grass;
  for (let v = 0; v < 3; v++) for (let mask = 0; mask < 16; mask++) {
    const up = mask & 1, rt = mask & 2, dn = mask & 4, lf = mask & 8;
    const drip = [];
    for (let k = 0; k < 16; k++) drip.push(2 + Math.floor(hash2(k, v + tid, 5) * 3));
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
      // rounded exposed corners
      let clear = false;
      if (!up && !lf && x + y < 2) clear = true;
      if (!up && !rt && (15 - x) + y < 2) clear = true;
      if (!dn && !lf && x + (15 - y) < 2) clear = true;
      if (!dn && !rt && (15 - x) + (15 - y) < 2) clear = true;
      if (clear) continue;
      let col = texPixel(d.tex, pal, x, y, v, tid);
      let edge = (!up && y === 0) || (!dn && y === 15) || (!lf && x === 0) || (!rt && x === 15);
      if (!up && !lf && x + y === 2) edge = true;
      if (!up && !rt && (15 - x) + y === 2) edge = true;
      if (!dn && !lf && x + (15 - y) === 2) edge = true;
      if (!dn && !rt && (15 - x) + (15 - y) === 2) edge = true;
      if (edge) col = out;
      else {
        if (!up && y === 1) col = shade(col, 1.15);
        if (!dn && y === 14) col = shade(col, 0.8);
        if (!lf && x === 1) col = shade(col, 1.07);
        if (!rt && x === 14) col = shade(col, 0.88);
      }
      if (gr) {
        const inTop = !up && y < drip[x] + 1, inL = !lf && x < drip[y] - 1, inR = !rt && 15 - x < drip[15 - y] - 1, inB = !dn && 15 - y < 2;
        if (inTop || inL || inR || inB) {
          col = edge ? gr[2] : (inTop && y <= 1) || (inL && x <= 1) || (inR && x >= 14) ? gr[0] : gr[1];
          if (!edge && hash2(x, y, v + 99) < 0.15) col = gr[2];
        }
      }
      const [r, g, b] = rgb(col), o = ((v * 16 + y) * 256 + mask * 16 + x) * 4;
      im.data[o] = r; im.data[o + 1] = g; im.data[o + 2] = b; im.data[o + 3] = 255;
    }
  }
  ctx.putImageData(im, 0, 0);
  return c;
}

function buildWall(wid) {
  const d = WALL[wid], c = mk(48, 16), ctx = c.getContext('2d');
  const base = d.col, lt = shade(base, 1.18), dk = shade(base, 0.75);
  for (let v = 0; v < 3; v++) for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) {
    let col = base, a = 1;
    const h = hash2(x + v * 16, y + wid * 40, 4), hb = hash2((x >> 1) + v * 8, (y >> 1) + wid, 9);
    if (d.tex === 'rough') col = hb < 0.2 ? dk : hb > 0.85 ? lt : base;
    else if (d.tex === 'brick') { const off = ((y >> 3) & 1) * 8; col = (y & 7) === 7 || ((x + off) & 15) === 15 ? dk : (y & 7) === 0 ? lt : base; }
    else if (d.tex === 'plank') col = (y & 3) === 3 ? dk : (y & 3) === 0 ? lt : h < 0.1 ? dk : base;
    else if (d.tex === 'fence') {
      const post = (x & 7) < 3, rail = (y >= 3 && y <= 5) || (y >= 10 && y <= 12);
      if (!post && !rail) continue;
      col = post ? ((x & 7) === 0 ? lt : base) : dk;
    }
    ctx.fillStyle = col; ctx.globalAlpha = a; ctx.fillRect(v * 16 + x, y, 1, 1);
  }
  return c;
}

// ------------------------------------------------------------------ furniture & decorations
function furnGrid(t) {
  const f = TILE[t].furn, g = grid(f.w * 16, f.h * 16);
  const W1 = '#c48a52', W2 = '#a8733f', W3 = '#7a5230', W4 = '#4e3420';
  switch (t) {
    case T.WORKBENCH: g.rect(1, 3, 30, 4, W2); g.rect(1, 3, 30, 1, W1); g.rect(1, 6, 30, 1, W3); g.rect(3, 7, 3, 9, W3); g.rect(26, 7, 3, 9, W3); g.rect(6, 10, 20, 2, W3); break;
    case T.FURNACE: g.rect(4, 4, 40, 28, '#7d7d86'); for (let y = 4; y < 32; y += 4) g.rect(4, y, 40, 1, '#5a5a62'); for (let y = 4; y < 32; y += 8) for (let x = 4 + ((y >> 2) & 2) * 3; x < 44; x += 12) g.rect(x, y, 1, 4, '#5a5a62');
      g.rect(14, 14, 20, 14, '#2a1a10'); g.rect(16, 18, 16, 10, '#ff8020'); g.rect(18, 22, 12, 6, '#ffd060'); g.rect(4, 4, 40, 1, '#a3a3ad'); g.rect(30, 0, 8, 4, '#6a6a72'); break;
    case T.ANVIL: g.rect(4, 2, 24, 4, '#8a96a4'); g.rect(4, 2, 24, 1, '#c8d0dc'); g.rect(24, 3, 7, 2, '#8a96a4'); g.rect(11, 6, 10, 4, '#5e6c7c'); g.rect(7, 10, 18, 6, '#4e5a68'); g.rect(7, 10, 18, 1, '#6e7a88'); break;
    case T.ALEMBIC: g.rect(1, 14, 30, 3, W2); g.rect(1, 14, 30, 1, W1); g.rect(3, 17, 3, 15, W3); g.rect(26, 17, 3, 15, W3);
      g.disc(9, 8, 5, '#d8f0ff'); g.ell(9, 10, 4, 3, '#50d0a0'); g.rect(8, 1, 3, 3, '#d8f0ff'); g.disc(22, 10, 3.5, '#d8f0ff'); g.ell(22, 11, 3, 2, '#e05080'); g.line(11, 3, 20, 6, '#b8c8d8'); break;
    case T.FORGE: g.rect(2, 6, 44, 26, '#3a2a36'); for (let y = 6; y < 32; y += 5) g.rect(2, y, 44, 1, '#241a22'); g.rect(10, 12, 28, 14, '#1a0e0a'); g.rect(12, 16, 24, 10, '#ff5a10'); g.rect(15, 19, 18, 7, '#ffd040'); g.rect(2, 6, 44, 2, '#5a4050'); g.rect(6, 0, 6, 6, '#3a2a36'); g.rect(36, 0, 6, 6, '#3a2a36'); break;
    case T.CHEST: g.rect(2, 8, 28, 24, W2); g.rect(2, 8, 28, 8, W1); g.rect(2, 15, 28, 2, '#5a4030'); g.rect(2, 8, 2, 24, '#c8a040'); g.rect(28, 8, 2, 24, '#c8a040'); g.rect(13, 14, 6, 7, '#e8c050'); g.rect(15, 16, 2, 3, '#4a3010'); g.rect(4, 28, 24, 2, W3); break;
    case T.TABLE: g.rect(0, 12, 48, 4, W2); g.rect(0, 12, 48, 1, W1); g.rect(0, 15, 48, 1, W3); g.rect(3, 16, 3, 16, W3); g.rect(42, 16, 3, 16, W3); g.rect(6, 20, 36, 2, W4); break;
    case T.CHAIR: g.rect(3, 2, 3, 30, W3); g.rect(3, 2, 3, 1, W1); g.rect(3, 17, 11, 3, W2); g.rect(3, 17, 11, 1, W1); g.rect(11, 20, 3, 12, W3); g.rect(3, 8, 3, 2, W2); break;
    case T.BED: g.rect(2, 10, 60, 10, W2); g.rect(2, 4, 4, 28, W3); g.rect(58, 12, 4, 20, W3); g.rect(6, 12, 52, 7, '#3a5ab8'); g.rect(6, 12, 52, 2, '#5a7ae0'); g.rect(7, 9, 12, 5, '#e8e8f0'); g.rect(6, 20, 52, 3, W3); g.rect(2, 4, 4, 1, W1); break;
    case T.POT: g.ell(16, 20, 12, 11, '#a0604a'); g.ell(12, 16, 5, 6, '#c07a5a'); g.rect(10, 5, 12, 5, '#8a5040'); g.rect(9, 4, 14, 2, '#b07058'); g.rect(4, 20, 24, 2, '#6a3a2a'); break;
    case T.ORB: g.disc(16, 16, 13, null, (x, y, dx, dy) => { const r = Math.hypot(dx, dy); return r < 5 ? '#f0c0ff' : (hash2(x, y, 3) < 0.15 ? '#3a1050' : r < 9 ? '#b060e0' : '#7a30a8'); }); g.line(8, 10, 14, 16, '#3a1050'); g.line(22, 8, 18, 15, '#3a1050'); g.line(20, 24, 17, 18, '#3a1050'); break;
    case T.CRYSTAL: g.ell(16, 28, 12, 4, '#6a6a74'); for (let y = 4; y < 28; y++) { const hw = y < 14 ? (y - 4) * 0.8 : (28 - y) * 0.55; for (let x = Math.round(16 - hw); x <= 16 + hw; x++) g.set(x, y, x < 16 ? '#ff7088' : '#e02850'); } g.line(16, 4, 16, 27, '#a01030'); g.set(12, 10, '#ffd0d8'); g.set(13, 9, '#ffd0d8'); break;
    case T.DOOR: g.rect(2, 0, 12, 48, W2); g.rect(2, 0, 12, 1, W1); for (let y = 0; y < 48; y += 6) g.rect(3, y, 10, 1, W3); g.rect(2, 0, 2, 48, W3); g.rect(10, 22, 2, 3, '#e8c050'); break;
    case T.DOOR_OPEN: g.rect(0, 0, 3, 48, W3); g.rect(3, 0, 4, 48, W2); g.rect(3, 0, 4, 1, W1); for (let y = 0; y < 48; y += 6) g.rect(3, y, 4, 1, W3); break;
    case T.CRYPT_DOOR: g.rect(1, 0, 14, 48, '#2a3048'); for (let y = 4; y < 48; y += 10) g.rect(1, y, 14, 2, '#6a7488'); g.disc(8, 22, 4, '#d8d0b8'); g.rect(6, 21, 1, 2, '#101010'); g.rect(9, 21, 1, 2, '#101010'); g.rect(1, 0, 14, 1, '#4a5470'); break;
    case T.BELL: g.rect(7, 12, 2, 20, '#5a4a3a'); g.rect(2, 2, 12, 2, '#5a4a3a'); g.rect(2, 2, 2, 8, '#5a4a3a'); g.ell(9, 10, 4, 5, '#b8a060'); g.rect(5, 13, 9, 2, '#d8c080'); g.set(9, 16, '#5a4a3a'); g.rect(4, 30, 8, 2, '#4a3a2a'); break;
  }
  return g;
}

function buildDeco() {
  const D = {};
  const kinds = [['#6fdc52', '#33a83e', '#e05a8a', '#f0e060'], ['#a6e85e', '#6ec23c', '#ff6a3a', '#e0f060'], ['#c7a0ec', '#9a6fc8', '#e0e0ff', '#7ae080']];
  D.plants = kinds.map(([l, m, f1, f2]) => {
    const arr = [];
    for (let v = 0; v < 6; v++) {
      const g = grid(16, 16);
      const blades = 3 + (v % 3);
      for (let b = 0; b < blades; b++) { const x = 2 + Math.round(hash2(v, b, 1) * 11), h = 4 + Math.round(hash2(v, b, 2) * 8); g.line(x, 15, x + Math.round((hash2(v, b, 3) - 0.5) * 3), 15 - h, b & 1 ? l : m); }
      if (v >= 4) { const x = 4 + v, y = 6; g.disc(x, y, 1.5, v === 4 ? f1 : f2); g.set(x, y, '#ffffff'); }
      arr.push(g.canvas());
    }
    return arr;
  });
  D.vines = kinds.map(([l, m]) => [0, 1].map(v => { const g = grid(16, 16); for (let y = 0; y < 16; y++) { const x = 7 + Math.round(Math.sin((y + v * 4) * 0.5) * 2); g.set(x, y, m); if ((y + v) % 4 === 0) { g.set(x - 1, y, l); g.set(x + 1, y + 1, l); } } return g.canvas(); }));
  { const g = grid(16, 16); g.ell(8, 9, 5, 3, '#5a8cff'); g.rect(3, 9, 11, 2, '#5a8cff'); g.set(6, 7, '#c8e0ff'); g.set(9, 7, '#c8e0ff'); g.rect(7, 11, 3, 5, '#d8e8ff'); g.outline('#1a2a5a'); D.glowcap = g.canvas(); }
  { const g = grid(16, 16); g.line(8, 15, 8, 8, '#7a5230'); g.disc(6, 8, 2, '#4ab83a'); g.disc(10, 7, 2, '#33a83e'); g.outline('#1a3a14'); D.sapling = g.canvas(); }
  { const g = grid(16, 16); g.rect(7, 7, 2, 9, '#a8733f'); g.rect(7, 7, 1, 9, '#c48a52'); g.disc(7.5, 4.5, 2.5, '#ffa030'); g.disc(7.5, 5, 1.2, '#fff4b0'); g.outline('#3a2010'); D.torch = g.canvas(); }
  // platforms: frames by neighbor [none, left, right, both]
  D.platform = [0, 1, 2, 3].map(m => {
    const g = grid(16, 16);
    g.rect(0, 0, 16, 5, '#a8733f'); g.rect(0, 0, 16, 1, '#c48a52'); g.rect(0, 4, 16, 1, '#6e4826');
    if (!(m & 1)) { g.rect(0, 0, 2, 5, '#6e4826'); }
    if (!(m & 2)) { g.rect(14, 0, 2, 5, '#6e4826'); }
    g.rect(3, 5, 2, 3, '#6e4826'); g.rect(11, 5, 2, 3, '#6e4826');
    return g.canvas();
  });
  // cactus
  const cg = (arms, top) => { const g = grid(16, 16); g.rect(4, top ? 3 : 0, 8, top ? 13 : 16, '#49aa30'); g.rect(5, top ? 3 : 0, 2, top ? 13 : 16, '#7ad050'); g.rect(10, top ? 3 : 0, 2, top ? 13 : 16, '#2e7a20'); if (top) g.rect(5, 2, 6, 1, '#49aa30'); for (let y = 2; y < 16; y += 5) { g.set(4, y, '#e8f0c0'); g.set(11, y + 2, '#e8f0c0'); } return g; };
  D.cactus = [cg(0, false).outline('#1a3a10').canvas(), cg(0, true).outline('#1a3a10').canvas()];
  { const g = grid(16, 16); g.rect(0, 9, 10, 5, '#49aa30'); g.rect(8, 2, 5, 12, '#49aa30'); g.rect(9, 2, 1, 12, '#7ad050'); g.rect(0, 9, 10, 1, '#7ad050'); g.outline('#1a3a10'); D.cactusArm = g.canvas(); D.cactusArmL = flipCanvas(D.cactusArm); }
  return D;
}

// ------------------------------------------------------------------ trees
const TREE_COL = [
  { bark: ['#b08050', '#8a5a34', '#5e3a1e'], leaf: ['#7ad05a', '#3e9a3a', '#1f6a28', '#12401a'] },
  { bark: ['#a08068', '#76584a', '#4e3a30'], leaf: ['#5aa878', '#2e7a58', '#1a5040', '#0e3028'], snow: '#f0f6ff' },
  { bark: ['#8a5a44', '#6a4030', '#44261a'], leaf: ['#86d23a', '#4aa02a', '#2a6a1a', '#163e0e'] },
  { bark: ['#8a7a8a', '#5e5060', '#3e3040'], leaf: ['#b890d8', '#8058a8', '#583878', '#2e1a48'] },
];
function buildTrees() {
  const out = [];
  TREE_COL.forEach((tc, k) => {
    const [b0, b1, b2] = tc.bark;
    // trunk sheet: 0-2 mid variants, 3 base, 4 top
    const sheet = mk(80, 16), sc = sheet.getContext('2d');
    for (let f = 0; f < 5; f++) {
      const g = grid(16, 16);
      for (let y = 0; y < 16; y++) {
        let x0 = 4, x1 = 11;
        if (f === 3 && y > 10) { x0 -= (y - 10) >> 1; x1 += (y - 10) >> 1; }
        for (let x = x0; x <= x1; x++) {
          let c = x === x0 ? b2 : x === x1 ? b2 : x === x0 + 1 ? b0 : b1;
          if (x > x0 + 1 && x < x1 && hash2(x, y + f * 16, 9 + k) < 0.12) c = b2;
          if (x === 8 && ((y + f * 5) % 7) < 3) c = b2;
          g.set(x, y, c);
        }
      }
      if (f === 3) { g.rect(1, 14, 3, 2, b1); g.rect(12, 14, 3, 2, b1); }
      sc.drawImage(g.canvas(), f * 16, 0);
    }
    // canopy
    const [l0, l1, l2, l3] = tc.leaf;
    let cw = 80, ch = 80, g;
    if (k === 1) {
      cw = 56; ch = 88; g = grid(cw, ch);
      for (let tier = 0; tier < 5; tier++) {
        const top = 4 + tier * 15, hw0 = 6 + tier * 4;
        for (let y = 0; y < 22; y++) { const hw = Math.round(2 + (hw0 - 2) * y / 21); for (let x = 28 - hw; x <= 28 + hw; x++) g.set(x, top + y, x < 26 ? l1 : x > 30 ? l2 : l1); }
        for (let x = 28 - hw0; x <= 28 + hw0; x++) if (hash2(x, tier, 4) < 0.6) g.set(x, top + 21, l3);
        for (let x = 28 - hw0 + 2; x < 28; x++) if (hash2(x, tier, 8) < 0.7) g.set(x, top + 2 + ((28 - x) >> 1), tc.snow);
      }
      g.set(28, 3, l1);
    } else {
      if (k === 2) { cw = 96; ch = 64; }
      g = grid(cw, ch);
      const blobs = k === 2 ? [[48, 34, 26], [26, 38, 17], [70, 38, 17], [40, 20, 15], [60, 22, 14], [48, 44, 18]] : [[40, 44, 24], [24, 46, 15], [56, 46, 15], [32, 26, 15], [50, 26, 14], [40, 16, 12]];
      for (const [bx, by, r] of blobs) g.disc(bx, by, r, null, (x, y) => {
        const lx = (x - bx) / r, ly = (y - by) / r, sh = lx * 0.5 + ly * 0.8 + (hash2(x >> 1, y >> 1, 21 + k) - 0.5) * 0.7;
        return sh < -0.55 ? l0 : sh < 0.15 ? l1 : sh < 0.7 ? l2 : l3;
      });
      if (k === 2) for (let v = 0; v < 7; v++) { const x = 18 + v * 10, len = 6 + (v * 7) % 12; g.line(x, 44, x + 1, 44 + len, '#2a7a1a'); }
    }
    g.outline(shade(l3, 0.6));
    const branch = grid(24, 20);
    branch.line(12, 12, 23, 12, b1, 0.8);
    branch.disc(8, 9, 6, null, (x, y) => (x + y < 14 ? l0 : hash2(x, y, 5) < 0.3 ? l2 : l1));
    branch.outline(shade(l3, 0.6));
    const br = branch.canvas();
    out.push({ trunk: sheet, canopy: g.canvas(), cw, ch, branchL: br, branchR: flipCanvas(br) });
  });
  return out;
}

// ------------------------------------------------------------------ creatures
function buildEnemies() {
  const E = {};
  const gel = (col, lt, dk) => [0, 1].map(f => {
    const g = grid(28, 22);
    const rx = f ? 13 : 11, ry = f ? 7 : 9;
    for (let y = 0; y < 22; y++) for (let x = 0; x < 28; x++) {
      const dx = (x - 14) / rx, dy = (y - 21) / (ry * 2);
      if (dx * dx + dy * dy <= 1 && y <= 20) g.set(x, y, y < 21 - ry * 1.4 + 2 && Math.abs(x - 10) < 3 ? lt : col);
    }
    g.set(10, 21 - ry * 1.4 + 3, lt); g.rect(8, 21 - ry, 2, 2, '#101418'); g.rect(17, 21 - ry, 2, 2, '#101418'); g.rect(6, 20, 16, 1, dk);
    g.outline(shade(dk, 0.6));
    return g.canvas();
  });
  E.gel_green = gel('#4ec24a', '#b8f0a8', '#2a7a2a');
  E.gel_blue = gel('#4a8ce8', '#b8d8ff', '#2a4aa8');
  E.gel_sand = gel('#d8b060', '#fff0c0', '#8a6a30');
  const eye = (s, red) => {
    const g = grid(Math.round(26 * s), Math.round(18 * s)), cx = 16 * s, cy = 9 * s, r = 8 * s;
    for (let t = 0; t < 4; t++) g.line(cx - r, cy + (t - 1.5) * 3 * s, 1, cy + (t - 1.5) * 5 * s, red ? '#a01818' : '#c83030');
    g.disc(cx, cy, r, null, (x, y, dx, dy) => (hash2(x, y, 2) < 0.08 ? '#d03030' : dx * dx + dy * dy < (r * 0.6) ** 2 ? '#ffffff' : '#ecd8d8'));
    g.disc(cx + 3 * s, cy, 3.5 * s, red ? '#c02020' : '#3060c0'); g.disc(cx + 4 * s, cy, 1.6 * s, '#101010'); g.set(cx + 2 * s, cy - 2 * s, '#ffffff');
    return g.outline('#3a0a0a').canvas();
  };
  E.peeper = [eye(1, false)];
  E.servant = [eye(0.7, true)];
  const bat = (body, wing) => [0, 1].map(f => {
    const g = grid(24, 14);
    g.ell(12, 7, 3.5, 4, body);
    if (f === 0) { g.line(9, 6, 2, 1, wing, 0.8); g.line(15, 6, 22, 1, wing, 0.8); g.line(2, 1, 4, 7, wing); g.line(22, 1, 20, 7, wing); }
    else { g.line(9, 7, 2, 12, wing, 0.8); g.line(15, 7, 22, 12, wing, 0.8); }
    g.set(11, 6, '#ffe040'); g.set(13, 6, '#ffe040'); g.set(10, 3, body); g.set(14, 3, body);
    return g.outline('#140a10').canvas();
  });
  E.flitter = bat('#6a4a5a', '#8a5a6a');
  E.flitter_hell = bat('#8a2a1a', '#c8501a');
  const seg = (sz, c1, c2, head, mandible) => {
    const g = grid(sz + 4, sz + 4), c = (sz + 4) / 2;
    g.disc(c, c, sz / 2, null, (x, y, dx, dy) => (dx + dy < -2 ? c2 : (Math.abs(dx) < 1 ? shade(c1, 0.8) : c1)));
    if (head) { g.set(c + 2, c - 2, '#ffe040'); g.set(c + 2, c + 2, '#ffe040'); if (mandible) { g.line(c + sz / 2 - 1, c - 3, c + sz / 2 + 1, c - 1, '#e8d8b0'); g.line(c + sz / 2 - 1, c + 3, c + sz / 2 + 1, c + 1, '#e8d8b0'); } }
    return g.outline('#1a0a0a').canvas();
  };
  E.grub = { head: seg(12, '#c89080', '#e8b8a8', true, true), body: seg(12, '#b07868', '#d8a090'), tail: seg(9, '#a06858', '#c89080') };
  E.leech = { head: seg(10, '#c83848', '#f07080', true, true), body: seg(9, '#a02838', '#d05060'), tail: seg(7, '#902030', '#c04050') };
  { // Rotmaw Devourer: armored purple worm, hooked mandibles, spiked body plates (all drawn facing +x)
    const plate = (x, y, dx, dy) => (dy < -0.5 ? '#9a86b4' : dy > 0.55 ? '#3a2e4c' : hash2(x, y, 91) < 0.1 ? '#6a5484' : '#5c4a76');
    const hd = grid(58, 50), c = 25;
    hd.ell(22, c, 20, 19, null, plate);
    for (let k = 0; k < 4; k++) hd.line(8 + k * 7, c - 17 + Math.abs(k - 1.5), 8 + k * 7, c + 17 - Math.abs(k - 1.5), k % 2 ? '#4a3c60' : '#6e5c8c');
    hd.line(6, c - 14, 34, c - 12, '#b8a4cc'); hd.line(6, c + 15, 34, c + 13, '#2e2240');
    hd.ell(38, c, 6, 9, '#2a0812');
    for (let k = -2; k <= 2; k++) hd.set(36, c + k * 3, '#e8dcc0');
    // hooked mandibles curving forward and inward
    for (const sd of [-1, 1]) for (let k = 0; k <= 18; k++) {
      const x = 30 + k, y = c + sd * (16 - (k > 10 ? (k - 10) * 1.4 : 0) + Math.sin(k * 0.25) * 2);
      hd.disc(x, y, k < 12 ? 2.8 - k * 0.08 : 1.6 - (k - 12) * 0.12, k > 13 ? '#8a7858' : k < 3 ? '#b8a880' : '#dccca4');
    }
    for (const sd of [-1, 1]) { hd.disc(28, c + sd * 9, 2.8, '#140810'); hd.set(29, c + sd * 9, '#e03040'); }
    const body = (sz, tail) => {
      const W = sz + 20, g = grid(W, W), m = W / 2;
      for (const sd of [-1, 1]) for (const ox of tail ? [-2] : [-6, 3]) { g.line(m + ox, m + sd * sz * 0.45, m + ox - 5, m + sd * (sz * 0.55 + 7), '#2e2240', 1.3); g.set(m + ox - 5, m + sd * (sz * 0.55 + 7), '#8a76a4'); }
      if (tail) {
        g.ell(m + 3, m, sz * 0.5, sz * 0.46, null, plate);
        for (let k = 0; k < 12; k++) g.disc(m - sz * 0.42 - k, m, Math.max(0.6, sz * 0.34 * (1 - k / 12)), k > 8 ? '#2e2240' : '#5c4a76');
      } else {
        g.ell(m - sz * 0.36, m, sz * 0.22, sz * 0.4, '#a85a78');
        g.ell(m + 1, m, sz * 0.5, sz * 0.56, null, plate);
        g.line(m - 4, m - sz * 0.46, m - 4, m + sz * 0.46, '#4a3c60');
        g.line(m + 5, m - sz * 0.4, m + 5, m + sz * 0.4, '#6e5c8c');
        g.line(m + 1, m - sz * 0.54, m + 1, m - sz * 0.54 - 3, '#9a86b4', 0.8);
      }
      return g.outline('#140a18').canvas();
    };
    E.rotmaw = { head: hd.outline('#140a18').canvas(), body: body(28, false), tail: body(24, true) };
  }
  { // dune scuttler
    const mkS = f => { const g = grid(28, 16); g.ell(14, 9, 10, 5, '#c8a060'); g.ell(12, 7, 6, 3, '#e8c888'); for (let k = 0; k < 3; k++) { g.line(8 + k * 5, 12, 6 + k * 5 + (f ? 2 : 0), 15, '#8a6a3a'); } g.line(24, 8, 27, 5, '#6a4a2a'); g.line(24, 10, 27, 12, '#6a4a2a'); g.set(21, 7, '#101010'); return g.outline('#3a2a10').canvas(); };
    E.scuttler = [mkS(0), mkS(1)];
  }
  const imp = (skin, dark, wing) => [0, 1].map(f => {
    const g = grid(22, 26);
    g.line(4, 8, 1, f ? 2 : 12, wing, 1); g.line(4, 8, 7, 14, wing, 0.6);
    g.ell(12, 16, 5, 6, skin); g.disc(12, 7, 4.5, skin); g.line(9, 3, 7, 0, dark); g.line(15, 3, 17, 0, dark);
    g.set(13, 6, '#ffff60'); g.set(15, 6, '#ffff60'); g.rect(9, 21, 2, 5, dark); g.rect(13, 21, 2, 5, dark); g.line(16, 14, 19, 12, skin);
    return g.outline('#140808').canvas();
  });
  E.frostimp = imp('#78b8e8', '#3a6a98', '#b8e0ff');
  E.emberimp = imp('#d84a2a', '#7a1a0a', '#ff9a40');
  { const mkV = f => { const g = grid(24, 24); g.disc(12, 12, 9, '#4aa02a'); g.disc(10, 10, 5, '#7ad04a'); if (f) { g.ell(16, 12, 5, 4, '#a01830'); for (let k = 0; k < 4; k++) { g.set(13 + k * 2, 9, '#ffffff'); g.set(13 + k * 2, 15, '#ffffff'); } } else g.line(14, 12, 21, 12, '#a01830'); g.set(8, 7, '#e8f0a0'); return g.outline('#123a0a').canvas(); }; E.snapvine = [mkV(0), mkV(1)]; }
  { const mkR = f => { const g = grid(24, 20); g.ell(10, 10, 9, 6, '#6a4a7a'); g.ell(8, 8, 5, 3, '#8a6a9a'); g.disc(18, 10, 4, '#3a1a3a'); for (let k = 0; k < 3; k++) { g.set(17 + k, 7, '#e0e0c0'); g.set(17 + k, 13, '#e0e0c0'); } g.line(2, 10, 0, f ? 6 : 14, '#8ab040'); g.set(12, 6, '#c0f060'); return g.outline('#1a0a1a').canvas(); }; E.rotflier = [mkR(0), mkR(1)]; }
  { const mkC = f => { const g = grid(22, 36); for (let y = 8; y < 36; y++) { const hw = 3 + (y - 8) * 0.25; for (let x = Math.round(11 - hw); x <= 11 + hw; x++) g.set(x, y, x < 11 ? '#2a3a7a' : '#1a2a5a'); } g.disc(11, 7, 5, '#2a3a7a'); g.rect(9, 6, 5, 3, '#0a0a14'); g.set(10, 7, f ? '#80f0ff' : '#40c0ff'); g.set(13, 7, f ? '#80f0ff' : '#40c0ff'); g.line(18, 4, 18, 34, '#6a5a4a'); g.disc(18, 3, 2, f ? '#a0f8ff' : '#60d0ff'); return g.outline('#05050a').canvas(); }; E.caster = [mkC(0), mkC(1)]; }
  return E;
}

function buildBosses() {
  const B = {};
  const tooth = (g, x, y0, y1, w = 1.6, c = '#f2ead6') => { for (let k = -w; k <= w; k += 0.5) g.line(x + k, y0, x, y1, c); };

  // ---- Omnivisor: a huge bloodshot eye trailing optic nerves; phase 2 tears open into a toothed maw
  const eye = (mouth, fr) => {
    const cx = 90, cy = 50, r = 38, g = grid(cx * 2, 100);
    for (let t = 0; t < 6; t++) {
      const len = 42 + ((t * 7) % 3) * 8, y0 = cy + (t - 2.5) * 10;
      for (let s = 0; s <= len; s += 0.5) {
        const x = cx - r + 8 - s, y = y0 + (t - 2.5) * s * 0.16 + Math.sin(s * 0.16 + t * 1.9 + fr * 1.8) * 3.2 * Math.min(1, s / 12);
        g.disc(x, y, 0.6 + 2.2 * (1 - s / len), ((s / 5) | 0) % 2 ? '#7a121c' : '#b8262e');
      }
    }
    g.disc(cx, cy, r, null, (x, y, dx, dy) => {
      const d = Math.hypot(dx, dy);
      return d > r - 3 ? '#b89090' : d > r - 9 ? '#e6cfca' : dx + dy < -30 ? '#fffaf7' : '#f7ebe8';
    });
    // bloodshot veins creeping forward from the back of the eye
    for (let v = 0; v < 9; v++) {
      let x = cx - r + 2, y = cy + (v - 4) * 8, a = (v - 4) * 0.13;
      for (let s = 0; s < 34; s++) {
        a += Math.sin(s * 0.7 + v * 2.3) * 0.18;
        x += Math.cos(a) * 1.1; y += Math.sin(a) * 1.1;
        if (Math.hypot(x - cx, y - cy) < r - 1) g.set(x, y, s < 14 ? '#c42630' : '#de6a70');
        if (s === 12 && v % 2) {
          let bx = x, by = y, ba = a + (v % 4 ? 0.7 : -0.7);
          for (let q = 0; q < 12; q++) { bx += Math.cos(ba) * 1.1; by += Math.sin(ba) * 1.1; if (Math.hypot(bx - cx, by - cy) < r - 1) g.set(bx, by, '#e07a80'); }
        }
      }
    }
    if (!mouth) {
      g.disc(cx + 17, cy, 18, '#1e5aa8');
      g.disc(cx + 18, cy, 15, null, (x, y, dx, dy) => (Math.hypot(dx, dy) > 10 ? '#3a82d8' : '#5aa0ec'));
      g.disc(cx + 21, cy, 7.5, '#08080e'); g.disc(cx + 13, cy - 8, 3, '#ffffff'); g.set(cx + 25, cy + 5, '#bfe0ff');
    } else {
      g.ell(cx + 18, cy, 21, 28, '#b02c3c');
      g.ell(cx + 20, cy, 16, 23, '#4a0610');
      g.ell(cx + 23, cy, 10, 15, '#1c0206');
      for (let k = 0; k < 16; k++) {
        const a = k / 16 * Math.PI * 2, bx = cx + 20 + Math.cos(a) * 16, by = cy + Math.sin(a) * 23;
        const tx = cx + 20 + Math.cos(a) * 9, ty = cy + Math.sin(a) * 14;
        for (let w = -1.5; w <= 1.5; w += 0.5) g.line(bx - Math.sin(a) * w, by + Math.cos(a) * w, tx, ty, '#f2ead6');
      }
    }
    return g.outline('#2a0608').canvas();
  };
  B.eye1 = [eye(false, 0), eye(false, 1)]; B.eye2 = [eye(true, 0), eye(true, 1)];

  // ---- Ossuary Warden: a giant skull with bony hands on long arm bones
  {
    const g = grid(80, 84), c = 40;
    const bone = (x, y, dx, dy) => (dx + dy < -0.7 ? '#fffbe8' : dy > 0.55 || dx > 0.62 ? '#bdb59c' : '#e8e0c8');
    g.ell(c, 34, 32, 31, null, bone);
    g.ell(c - 22, 50, 9, 8, null, bone); g.ell(c + 22, 50, 9, 8, null, bone);
    g.ell(c, 71, 19, 9, null, (x, y, dx, dy) => (dy > 0.3 ? '#b0a88e' : '#dcd4bc'));
    g.rect(c - 17, 62, 34, 5, '#2a1c14');
    g.rect(c - 18, 50, 36, 12, '#e0d8c0');
    for (let k = 0; k < 8; k++) { g.rect(c - 16 + k * 4, 60, 3, 4, '#f4efdc'); g.rect(c - 16 + k * 4, 66, 3, 3, '#f4efdc'); }
    for (const s of [-1, 1]) {
      g.ell(c + s * 13, 38, 10, 11, '#180c0a'); g.ell(c + s * 13, 40, 7, 7, '#0a0404');
      g.disc(c + s * 13, 40, 2.2, '#ff3a30'); g.set(c + s * 13 - 1, 39, '#ffb0a0');
    }
    for (let y = 49; y < 57; y++) { const w = (y - 49) * 0.5; for (let x = Math.round(c - w); x <= c + w; x++) g.set(x, y, '#180c0a'); }
    g.line(c - 4, 4, c + 2, 14, '#8a8270'); g.line(c + 2, 14, c - 2, 22, '#8a8270'); g.line(c + 18, 10, c + 22, 18, '#8a8270');
    B.skull = g.outline('#1a140a').canvas();
    const bc = '#e8e0c8', bs = '#bdb59c', kn = '#fffbe8';
    const h = grid(52, 58);
    h.ell(26, 45, 9, 9, null, (x, y, dx, dy) => (dy > 0.4 ? bs : bc));
    for (const [tx, ty] of [[9, 8], [20, 2], [32, 2], [43, 8]]) {
      const mx = 26 + (tx - 26) * 0.45, my = 30;
      h.line(26 + (tx - 26) * 0.2, 42, mx, my, bc, 1.6); h.disc(mx, my, 2.4, kn);
      const jx = mx + (tx - mx) * 0.5, jy = my + (ty - my) * 0.5;
      h.line(mx, my, jx, jy, bc, 1.3); h.disc(jx, jy, 1.9, kn);
      h.line(jx, jy, tx, ty, bs, 1.1);
    }
    h.line(19, 44, 8, 34, bc, 1.6); h.disc(8, 34, 2.2, kn); h.line(8, 34, 3, 24, bs, 1.2);
    h.rect(22, 51, 8, 6, bs);
    B.hand = h.outline('#1a140a').canvas();
    const ab = grid(40, 12);
    ab.rect(5, 4, 30, 4, bc); ab.rect(5, 7, 30, 1, bs);
    for (const x of [4, 35]) { ab.disc(x, 3.5, 3, kn); ab.disc(x, 8, 3, bc); }
    B.armBone = ab.outline('#1a140a').canvas();
  }

  // ---- The Cinder Wall: a wall of scorched living flesh with two eyes, a maw and tethered Hungries
  {
    const P2 = Math.PI * 2 / 64;
    const g = grid(64, 64);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const n = hash2((x >> 3) & 7, (y >> 3) & 7, 31) * 0.6 + hash2((x >> 2) & 15, (y >> 2) & 15, 33) * 0.4, m = hash2(x, y, 32);
      const fold = Math.sin(y * P2 * 3 + Math.sin(x * P2 * 2) * 1.4);
      g.set(x, y, fold > 0.8 ? '#c45868' : fold < -0.85 ? '#5e1624' : n < 0.3 ? '#7c2232' : n > 0.75 ? '#aa3c4e' : m < 0.05 ? '#6a1a2a' : '#922e40');
    }
    for (let k = 0; k < 4; k++) {
      const x0 = 8 + k * 16, a = 3 + k;
      for (let y = 0; y < 64; y++) { const x = x0 + Math.sin(y * P2 * (k % 2 + 1) + k) * a; g.set(x, y, '#4a0c1a'); g.set(x + 1, y, k === 1 ? '#ff7a30' : '#6a1426'); }
    }
    B.wallTex = g.canvas();
    const rim = grid(30, 64);
    for (let y = 0; y < 64; y++) {
      const b = 12 + Math.sin(y * P2 * 2) * 6 + Math.sin(y * P2 * 5 + 1) * 3;
      for (let x = 0; x < b; x++) rim.set(x, y, x > b - 3 ? '#4e1020' : x > b - 8 ? '#b04a5a' : x > b - 11 ? '#9a3848' : '#8a2a3a');
    }
    B.wallRim = rim.canvas();
    const e = grid(64, 60);
    e.ell(32, 30, 30, 27, '#7a2030');
    e.ell(33, 31, 24, 21, null, (x, y, dx, dy) => (dx * dx + dy * dy > 0.75 ? '#d8bc98' : dx + dy < -0.5 ? '#fff4dc' : '#f4e6c8'));
    for (let v = 0; v < 6; v++) { let x = 12, y = 20 + v * 4, a = (v - 2.5) * 0.2; for (let s = 0; s < 14; s++) { a += Math.sin(s + v) * 0.3; x += Math.cos(a); y += Math.sin(a); e.set(x, y, '#c83030'); } }
    e.disc(39, 31, 12, '#7a0c0c'); e.disc(39, 31, 9.5, '#c02420'); e.disc(40, 31, 5, '#1a0202'); e.disc(35, 26, 2.2, '#ffffff');
    e.ell(32, 7, 29, 6, '#5e1624'); e.ell(32, 55, 27, 4, '#6a1a2a');
    B.wallEye = e.outline('#200404').canvas();
    const m = grid(76, 68);
    m.ell(38, 34, 35, 31, null, (x, y, dx, dy) => (dy < -0.6 ? '#b84658' : dy > 0.6 ? '#5e1624' : '#9a3246'));
    m.ell(41, 34, 26, 21, '#2a0408'); m.ell(44, 34, 17, 13, '#120102');
    for (let k = 0; k < 7; k++) { const x = 21 + k * 6.5; tooth(m, x, 14, 26); tooth(m, x + 2, 54, 42); }
    B.wallMouth = m.outline('#200404').canvas();
    B.hungry = [0, 1].map(f => {
      const hg = grid(34, 30);
      hg.disc(14, 15, 12, null, (x, y, dx, dy) => (dx + dy < -7 ? '#c45868' : dy > 6 ? '#5e1624' : '#922e40'));
      if (f) { hg.ell(24, 15, 8, 10, '#2a0408'); for (let k = 0; k < 3; k++) { tooth(hg, 20 + k * 4, 6, 11, 1); tooth(hg, 20 + k * 4, 24, 19, 1); } }
      else { hg.ell(24, 15, 7, 3, '#2a0408'); for (let k = 0; k < 3; k++) { tooth(hg, 20 + k * 4, 12, 15, 0.5); tooth(hg, 21 + k * 4, 18, 15, 0.5); } }
      hg.disc(9, 9, 3, '#f4e6c8'); hg.disc(10, 9, 1.5, '#7a0c0c');
      return hg.outline('#200404').canvas();
    });
  }

  // ---- Gel Monarch: an enormous crowned slime with an unlucky adventurer stuck inside
  {
    const W = 132, H = 118, cx = 66, base = H - 2, g = grid(W, H);
    for (let y = 34; y <= base; y++) for (let x = 0; x < W; x++) {
      const dx = (x - cx) / 62, dy = (y - base) / 80, d = dx * dx + dy * dy;
      if (d > 1) continue;
      const bottom = y > base - 4;
      g.set(x, y, d > 0.9 || bottom ? '#1e4ba0' : dx < -0.25 && dy < -0.55 ? '#8ec8ff' : dy < -0.45 ? '#4a8cf0' : '#3474dc');
    }
    // the trapped adventurer, tinted by the gel
    const t = (c) => mix(c, '#3474dc', 0.55);
    g.disc(cx - 6, 72, 7, t('#f0c8a0')); g.rect(cx - 12, 64, 13, 5, t('#6a4020'));
    g.rect(cx - 13, 79, 14, 16, t('#4a6a3a')); g.rect(cx - 12, 95, 5, 10, t('#3a3a5a')); g.rect(cx - 5, 95, 5, 10, t('#3a3a5a'));
    g.line(cx + 1, 82, cx + 12, 74, t('#c8c8d0'), 1); g.line(cx + 12, 74, cx + 22, 60, t('#e8e8f0'), 0.8);
    // shine
    for (let k = 0; k < 10; k++) g.set(cx - 38 + k, 58 - k * 0.8, '#d8ecff');
    g.disc(cx - 42, 70, 2.2, '#d8ecff');
    // crown
    g.rect(cx - 18, 24, 36, 12, '#e8b830'); g.rect(cx - 18, 33, 36, 3, '#a87818');
    for (let k = 0; k < 5; k++) { const x = cx - 18 + k * 9; for (let j = 0; j < 10; j++) for (let w = -Math.max(0, 4 - j * 0.45); w <= Math.max(0, 4 - j * 0.45); w++) g.set(x + w, 24 - j, j > 6 ? '#fff0a0' : '#e8b830'); }
    g.disc(cx, 29, 3.2, '#e02040'); g.set(cx - 1, 28, '#ff90a0'); g.disc(cx - 11, 29, 2.2, '#40b0ff'); g.disc(cx + 11, 29, 2.2, '#40b0ff');
    // face
    g.ell(cx - 16, 62, 4, 6, '#0e1c3a'); g.ell(cx + 16, 62, 4, 6, '#0e1c3a'); g.set(cx - 17, 59, '#ffffff'); g.set(cx + 15, 59, '#ffffff');
    B.monarch = g.outline('#0c2250').canvas();
  }

  // ---- Rimehorn: a towering, gangly, antlered one-eyed beast of the snow
  const rime = (fr) => {
    const W = 120, H = 156, g = grid(W, H), fy = H - 2;
    const fur = (base, lo, hi) => (x, y, dx, dy) => { const n = hash2(x >> 1, y >> 1, 77); return dy > 0.5 || dx > 0.6 ? lo : dx + dy < -0.8 || n < 0.1 ? hi : n > 0.85 ? lo : base; };
    const lo = fr === 1 ? 6 : fr === 0 ? -6 : 0;
    // long legs with backward-bent knees and dark hooves
    for (const [hx, c, sgn] of [[48, '#5a5662', 1], [60, '#7a7684', -1]]) {
      const kx = hx + 8 - lo * sgn * 0.3, ky = 124, fx = hx - lo * sgn;
      g.line(hx, 100, kx, ky, c, 5); g.line(kx, ky, fx, fy - 5, c, 3.5);
      g.rect(fx - 7, fy - 6, 14, 7, '#26222c');
    }
    const arm = (sx, sy, ex, ey, c) => { g.line(sx, sy, (sx + ex) / 2 + 4, (sy + ey) / 2, c, 4.5); g.line((sx + ex) / 2 + 4, (sy + ey) / 2, ex, ey, c, 3.5); for (let k = -1; k <= 1; k++) g.line(ex, ey, ex + 3 + k * 3, ey + 8, '#1e1a24', 0.9); };
    if (fr === 2) arm(46, 62, 34, 16, '#66626e'); else arm(46, 64, 42 - lo * 0.7, 132, '#66626e');
    // hunched shaggy torso
    g.ell(56, 78, 27, 34, null, fur('#9ea2ae', '#72768a', '#c8ccd6'));
    for (let k = 0; k < 18; k++) { const a = Math.PI * 0.45 + k / 18 * Math.PI * 1.1, rx = 56 + Math.cos(a) * 27, ry = 78 + Math.sin(a) * 34; g.line(rx, ry, rx + Math.cos(a) * 5, ry + Math.sin(a) * 5 + 3, k % 2 ? '#7c808e' : '#a8acb8', 0.8); }
    g.ell(64, 88, 13, 18, null, fur('#bcc0c8', '#9a9eaa', '#d8dbe2'));
    for (const [x, y, sz] of [[34, 56, 10], [40, 48, 13], [50, 44, 9]]) { g.line(x, y, x - 4, y - sz, '#bfe8ff', 1.6); g.line(x, y, x - 4, y - sz, '#7ec0f0', 0.5); g.set(x - 4, y - sz, '#ffffff'); }
    // neck and head thrust forward
    g.line(66, 56, 80, 44, '#8a8e9c', 7);
    g.ell(86, 42, 13, 14, null, fur('#8a8e9c', '#646876', '#aab0bc'));
    g.ell(92, 47, 9, 11, '#c8c4bc');
    const ant = [[82, 30, 72, 16], [72, 16, 64, 2], [72, 16, 63, 18], [67, 8, 72, 0], [90, 30, 100, 16], [100, 16, 110, 3], [100, 16, 110, 19], [106, 9, 101, 0]];
    for (const [x0, y0, x1, y1] of ant) g.line(x0, y0, x1, y1, '#c8b490', 1.8);
    for (const [x0, y0, x1, y1] of ant) g.line(x0 + 1, y0 + 1, x1 + 1, y1 + 1, '#8e7a58', 0.4);
    g.disc(93, 43, 6.5, '#f4f0c8'); g.disc(94, 43, 3.8, '#6a2a18'); g.disc(94, 43, 2, '#100808'); g.set(91, 40, '#ffffff');
    g.ell(93, 36, 7, 2, '#646876');
    g.rect(86, 53, 12, 3, '#2a1418');
    for (let k = 0; k < 3; k++) { g.set(87 + k * 4, 53, '#f0ead8'); g.set(88 + k * 4, 55, '#f0ead8'); }
    if (fr === 2) arm(66, 62, 88, 12, '#8e929e'); else arm(66, 64, 78 + lo * 0.7, 134, '#8e929e');
    return g.outline('#141018').canvas();
  };
  B.rime = [rime(0), rime(1), rime(2)];
  B.shadowHand = [0, 1].map(f => {
    const g = grid(34, 22);
    g.ell(12, 15, 10, 6, '#1a1024');
    for (let k = 0; k < 4; k++) { const x = 16 + k * 4, y = 12 - (f ? (k & 1) * 2 : ((k + 1) & 1) * 2); g.line(x - 2, 13, x + 4, y - 4, '#1a1024', 1.2); g.set(x + 4, y - 4, '#6a3aa0'); }
    g.line(2, 17, -2, 20, '#2a1a3a', 1.5); g.set(8, 12, '#b070ff');
    return g.outline('#0a0610').canvas();
  });
  const sp = grid(18, 44);
  for (let y = 0; y < 44; y++) { const w = y / 44 * 8; for (let x = Math.round(9 - w); x <= 9 + w; x++) sp.set(x, y, x < 9 - w * 0.3 ? '#e8f8ff' : x > 9 + w * 0.4 ? '#6aa8d8' : '#a8dcff'); }
  B.iceSpike = sp.outline('#1c4a78').canvas();
  return B;
}

// ------------------------------------------------------------------ humanoid (player, NPCs, zombies, skeletons)
export const HAIR_STYLES = ['Short', 'Long', 'Spiky', 'Ponytail', 'Mohawk', 'Bowl'];
function r(ctx, c, x, y, w, h) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }
function drawHair(ctx, style, col) {
  const d = shade(col, 0.75);
  switch (style) {
    case 0: r(ctx, col, 4, 0, 13, 4); r(ctx, col, 4, 3, 3, 7); r(ctx, d, 5, 6, 2, 4); r(ctx, col, 14, 3, 2, 2); break;
    case 1: r(ctx, col, 4, 0, 13, 4); r(ctx, col, 3, 2, 4, 17); r(ctx, d, 4, 9, 2, 10); r(ctx, col, 14, 3, 2, 3); break;
    case 2: r(ctx, col, 4, 1, 13, 3); r(ctx, col, 4, 3, 3, 6); r(ctx, col, 5, -1, 2, 2); r(ctx, col, 8, -2, 3, 3); r(ctx, col, 12, -1, 2, 2); r(ctx, col, 15, 0, 2, 3); r(ctx, col, 2, 2, 2, 2); break;
    case 3: r(ctx, col, 4, 0, 13, 4); r(ctx, col, 4, 3, 3, 5); r(ctx, col, 0, 4, 4, 3); r(ctx, d, -1, 6, 3, 8); break;
    case 4: r(ctx, col, 8, -3, 5, 7); r(ctx, d, 8, 2, 5, 2); r(ctx, shade(col, 0.5), 4, 3, 2, 5); break;
    case 5: r(ctx, col, 4, 0, 13, 5); r(ctx, col, 4, 4, 2, 6); r(ctx, d, 5, 4, 11, 1); break;
  }
}
function drawHat(ctx, hat) {
  switch (hat) {
    case 'wide': r(ctx, '#6a4a2a', 1, 2, 19, 2); r(ctx, '#7a5a3a', 5, -3, 11, 5); r(ctx, '#aa3030', 5, 0, 11, 1); break;
    case 'cap': r(ctx, '#3a7a3a', 4, -1, 13, 4); r(ctx, '#2a5a2a', 12, 2, 7, 2); break;
    case 'nurse': r(ctx, '#f8f8f8', 6, -2, 9, 4); r(ctx, '#e02020', 9, -1, 3, 1); r(ctx, '#e02020', 10, -2, 1, 3); break;
    case 'cowboy': r(ctx, '#3a2a1a', 0, 2, 21, 2); r(ctx, '#4a3422', 5, -3, 11, 5); break;
    case 'leaf': for (let k = 0; k < 5; k++) r(ctx, k & 1 ? '#3aa040' : '#6ad050', 3 + k * 3, -1 - (k & 1), 3, 3); break;
  }
}
// st: { dir, walk (phase or -1), air, arm (angle|null), itemSpr, itemRot, itemScale, grip, armor:[pal|null x3], style, alpha }
export function drawHumanoid(ctx, x, y, look, st) {
  ctx.save();
  ctx.translate(Math.round(x) + 10, Math.round(y));
  ctx.scale(st.dir < 0 ? -1 : 1, 1);
  ctx.translate(-10, 0);
  if (st.alpha != null) ctx.globalAlpha = st.alpha;
  const skin = look.skin, shirt = look.shirt, pants = look.pants, shoes = look.shoes || '#4a3020';
  const ar = st.armor || [];
  const shirtC = ar[1] ? ar[1].b : shirt, shirtD = ar[1] ? ar[1].c : shade(shirt, 0.72);
  const pantsC = ar[2] ? ar[2].b : pants, pantsD = ar[2] ? ar[2].c : shade(pants, 0.72);
  const ph = st.walk >= 0 ? st.walk : 0, sw = st.walk >= 0 ? Math.sin(ph) * 3 : (st.air ? 2 : 0);
  const lift = st.walk >= 0 ? Math.max(0, Math.cos(ph)) * 1.5 : 0;
  const armSwing = st.walk >= 0 ? -Math.sin(ph) * 0.6 : (st.air ? -0.6 : 0);
  const back = st.style === 'zombie' ? -1.35 : -armSwing;
  // back arm
  ctx.save(); ctx.translate(8, 14); ctx.rotate(back);
  r(ctx, shirtD, -2, -1, 4, 9); r(ctx, shade(skin, 0.8), -2, 8, 4, 3); ctx.restore();
  // legs
  if (st.style !== 'robe') {
    const bl = Math.round(6 - sw), fl = Math.round(10 + sw);
    r(ctx, pantsD, bl, 23, 4, 14); r(ctx, shade(shoes, 0.8), bl, 37 - lift, 5, 5);
    r(ctx, pantsC, fl, 23, 4, 14); r(ctx, shoes, fl, 37, 5, 5);
    if (ar[2]) r(ctx, ar[2].a, fl, 23, 1, 13);
  }
  // torso
  if (st.style === 'robe') {
    ctx.fillStyle = shirtC; ctx.beginPath(); ctx.moveTo(5, 12); ctx.lineTo(15, 12); ctx.lineTo(18, 42); ctx.lineTo(2, 42); ctx.fill();
    r(ctx, shirtD, 2, 39, 16, 3);
  } else {
    r(ctx, shirtC, 5, 12, 10, 11); r(ctx, shirtD, 5, 21, 10, 2);
    if (ar[1]) { r(ctx, ar[1].a, 5, 12, 10, 2); r(ctx, ar[1].a, 6, 14, 1, 6); }
    if (st.style === 'skeleton') for (let k = 0; k < 4; k++) r(ctx, '#3a3428', 6, 14 + k * 2, 8, 1);
    if (look.cross) { r(ctx, '#e02020', 9, 15, 3, 1); r(ctx, '#e02020', 10, 14, 1, 3); }
  }
  // head
  r(ctx, skin, 5, 2, 11, 10); r(ctx, shade(skin, 0.85), 5, 10, 11, 2);
  if (st.style === 'skeleton') { r(ctx, '#1a1410', 11, 5, 3, 3); r(ctx, '#1a1410', 9, 9, 5, 1); }
  else { r(ctx, '#ffffff', 12, 5, 3, 3); r(ctx, look.eyes || '#3060a0', 13, 5, 2, 3); r(ctx, shade(skin, 0.72), 12, 9, 3, 1); }
  if (look.beard) { r(ctx, look.beard, 7, 8, 9, 6); r(ctx, shade(look.beard, 0.85), 8, 13, 7, 2); }
  if (ar[0]) {
    r(ctx, ar[0].b, 4, 0, 13, 6); r(ctx, ar[0].a, 5, 0, 10, 1); r(ctx, ar[0].b, 4, 5, 3, 6); r(ctx, ar[0].c, 4, 5, 13, 1);
  } else {
    if (look.hair >= 0 && st.style !== 'skeleton') drawHair(ctx, look.hair, look.hairColor);
    if (look.hat) drawHat(ctx, look.hat);
  }
  // front arm + held item
  const armA = st.arm != null ? st.arm : (st.style === 'zombie' ? -1.45 : armSwing);
  ctx.save(); ctx.translate(12, 14); ctx.rotate(armA);
  if (st.itemSpr && st.itemBehind) drawHeld(ctx, st);
  r(ctx, shirtC, -2, -1, 4, 9); if (ar[1]) r(ctx, ar[1].a, -2, -1, 4, 2); r(ctx, skin, -2, 8, 4, 3);
  if (st.itemSpr && !st.itemBehind) drawHeld(ctx, st);
  ctx.restore();
  ctx.restore();
}
function drawHeld(ctx, st) {
  ctx.save();
  ctx.translate(0, 9);
  ctx.rotate(st.itemRot || 0);
  const s = st.itemScale || 1, g = st.grip || [2, 13];
  ctx.drawImage(st.itemSpr, -g[0] * s, -g[1] * s, 16 * s, 16 * s);
  ctx.restore();
}

// ------------------------------------------------------------------ backgrounds
const PAR_COL = {
  forest: ['#7fb8b0', '#5c9a8a', '#3e7f6e', '#2e6655'],
  desert: ['#e8d8b0', '#d8c690', '#c0a870', '#a88e58'],
  snow: ['#c8d8ea', '#a8bcd8', '#8fa8c8', '#6a88aa'],
  jungle: ['#6a9a6a', '#4a7a4a', '#336633', '#224d24'],
  blight: ['#8a7aa0', '#6a5a80', '#4e3f66', '#3a2d50'],
  ocean: ['#9ac8e0', '#7ab0d0', '#5a98c0', '#3a78a8'],
};
function buildParallax() {
  const P = {};
  const LW = 480, LH = 240;
  for (const [name, col] of Object.entries(PAR_COL)) {
    const layers = [];
    for (let L = 0; L < 3; L++) {
      const c = mk(LW, LH), x = c.getContext('2d');
      const base = [140, 165, 190][L];
      const fill = col[L + 1];
      x.fillStyle = fill;
      const f1 = [2, 3, 4][L], f2 = [5, 7, 9][L], seed = name.length * 3 + L;
      const hill = t => Math.sin(t * Math.PI * 2 * f1 / LW + seed) * [26, 14, 10][L] + Math.sin(t * Math.PI * 2 * f2 / LW + seed * 2) * [10, 6, 4][L];
      x.beginPath(); x.moveTo(0, LH);
      for (let i = 0; i <= LW; i += 2) {
        let h = hill(i);
        if (name === 'snow' && L === 0) h = Math.abs(((i + seed * 30) % 120) - 60) * -1.2 + 20;
        x.lineTo(i, base - 30 + h);
      }
      x.lineTo(LW, LH); x.fill();
      const trees = name === 'desert' ? 0 : [0, 14, 9][L];
      for (let k = 0; k < trees; k++) {
        const tx = (k + 0.5) * LW / trees + Math.sin(k * 7.3 + seed) * 12;
        const ty = base - 30 + hill(tx) + 6;
        const h = [0, 70, 100][L] + Math.sin(k * 3.1) * 18;
        for (const ox of [-LW, 0, LW]) {
          const X = tx + ox;
          if (X < -60 || X > LW + 60) continue;
          if (name === 'snow') {
            x.fillStyle = fill;
            for (let t = 0; t < 4; t++) { const w = 10 + t * 7, yy = ty - h + t * h / 4.5; x.beginPath(); x.moveTo(X, yy - 6); x.lineTo(X - w, yy + h / 4); x.lineTo(X + w, yy + h / 4); x.fill(); }
          } else if (name === 'blight') {
            x.strokeStyle = fill; x.lineWidth = 3; x.beginPath(); x.moveTo(X, ty); x.lineTo(X, ty - h); x.moveTo(X, ty - h * 0.6); x.lineTo(X - 16, ty - h * 0.85); x.moveTo(X, ty - h * 0.7); x.lineTo(X + 14, ty - h * 0.95); x.stroke();
            x.fillStyle = fill; x.beginPath(); x.arc(X, ty - h, 12, 0, 7); x.fill();
          } else if (name === 'ocean') {
            x.fillStyle = fill; x.fillRect(X - 1, ty - h * 0.6, 3, h * 0.6); x.beginPath(); x.ellipse(X, ty - h * 0.6, 16, 5, 0, 0, 7); x.fill();
          } else {
            x.fillStyle = fill;
            x.fillRect(X - 3, ty - h * 0.6, 6, h * 0.6);
            const rr = name === 'jungle' ? 26 : 20;
            x.beginPath(); x.arc(X, ty - h * 0.75, rr, 0, 7); x.arc(X - rr * 0.7, ty - h * 0.6, rr * 0.7, 0, 7); x.arc(X + rr * 0.7, ty - h * 0.62, rr * 0.7, 0, 7); x.fill();
            x.fillStyle = shade(fill, 1.08); x.beginPath(); x.arc(X - rr * 0.3, ty - h * 0.82, rr * 0.5, 0, 7); x.fill();
          }
        }
      }
      if (name === 'ocean' && L === 0) { x.fillStyle = '#4a88c0'; x.fillRect(0, base - 10, LW, LH); }
      // haze
      const hz = x.createLinearGradient(0, 0, 0, LH);
      hz.addColorStop(0, 'rgba(255,255,255,0)'); hz.addColorStop(1, 'rgba(255,255,255,' + [0.18, 0.1, 0.04][L] + ')');
      x.globalCompositeOperation = 'source-atop'; x.fillStyle = hz; x.fillRect(0, 0, LW, LH);
      const sil = mk(LW, LH), sx = sil.getContext('2d');
      sx.drawImage(c, 0, 0); sx.globalCompositeOperation = 'source-in'; sx.fillStyle = '#060818'; sx.fillRect(0, 0, LW, LH);
      layers.push({ img: c, sil, base, fill });
    }
    P[name] = layers;
  }
  return P;
}
function buildBackdrops() {
  const mkB = (a, b, c) => {
    const cv = mk(32, 32), x = cv.getContext('2d');
    for (let y = 0; y < 32; y++) for (let xx = 0; xx < 32; xx++) {
      const h = hash2(xx >> 2, y >> 2, a.length), k = hash2(xx, y, 3);
      x.fillStyle = h < 0.25 ? b : h > 0.8 ? c : k < 0.05 ? b : a; x.fillRect(xx, y, 1, 1);
    }
    return cv;
  };
  return { dirt: mkB('#3b2a1e', '#2c1f15', '#46331f'), stone: mkB('#2e2e36', '#24242a', '#3a3a42'), hell: mkB('#3a1612', '#2a0e0a', '#4e1c14') };
}

// ------------------------------------------------------------------ build everything
export function buildSprites() {
  const S = { tiles: [], walls: [], furn: [], furnFlip: [], items: {}, crack: [] };
  for (let t = 0; t < TILE.length; t++) if (TILE[t] && TILE[t].tex) S.tiles[t] = buildTileSheet(t);
  for (let w = 1; w < WALL.length; w++) S.walls[w] = buildWall(w);
  for (let t = 0; t < TILE.length; t++) if (TILE[t] && TILE[t].furn) { const g = furnGrid(t); g.outline('#1a120c'); S.furn[t] = g.canvas(); S.furnFlip[t] = flipCanvas(S.furn[t]); }
  S.deco = buildDeco();
  S.trees = buildTrees();
  S.en = buildEnemies();
  S.boss = buildBosses();
  S.par = buildParallax();
  S.bd = buildBackdrops();
  for (let k = 0; k < 4; k++) {
    const g = grid(16, 16), n = 2 + k * 2;
    for (let s = 0; s < n; s++) { let x = 8, y = 8; const a = s * 2.4; for (let j = 0; j < 3 + k; j++) { x += Math.cos(a + j * 0.5) * 1.5; y += Math.sin(a + j * 0.5) * 1.5; g.set(x, y, '#140c08'); } }
    S.crack.push(g.canvas(0.8));
  }
  // items
  for (const id in ITEMS) {
    const d = ITEMS[id], sp = d.spr;
    let c;
    if (sp.tile != null) {
      c = mk(16, 16); const x = c.getContext('2d');
      x.drawImage(S.tiles[sp.tile], 0, 0, 16, 16, 2, 2, 12, 12);
    } else if (sp.furn != null) {
      const f = S.furn[sp.furn]; c = mk(16, 16); const x = c.getContext('2d');
      const s = Math.min(16 / f.width, 16 / f.height, 1);
      x.drawImage(f, (16 - f.width * s) / 2, (16 - f.height * s) / 2, f.width * s, f.height * s);
    } else if (sp.wall != null) {
      c = mk(16, 16); const x = c.getContext('2d');
      x.fillStyle = '#140f0c'; x.fillRect(1, 1, 14, 14);
      x.drawImage(S.walls[sp.wall], 0, 0, 12, 12, 2, 2, 12, 12);
    } else {
      const g = grid(16, 16);
      (ITEM_DRAW[sp.tpl] || ITEM_DRAW.chunk)(g, PAL[sp.pal] || PAL.stone);
      g.outline();
      c = g.canvas(sp.tpl === 'gel' ? 0.85 : 1);
    }
    S.items[id] = c;
  }
  // UI sprites
  { const g = grid(16, 16); ITEM_DRAW.heart(g, PAL.heart); g.outline('#300808'); S.heart = g.canvas(); }
  { const g = grid(16, 16); ITEM_DRAW.star(g, { a: '#c8e8ff', b: '#3a78f0' }); g.outline('#0a1840'); S.star = g.canvas(); }
  { const g = grid(16, 16); g.rect(3, 2, 10, 8, '#8a96a4'); for (let yy = 10; yy < 15; yy++) for (let xx = 3 + (yy - 10); xx <= 12 - (yy - 10); xx++) g.set(xx, yy, '#8a96a4'); g.rect(4, 3, 4, 5, '#c8d0dc'); g.outline(); S.defIcon = g.canvas(); }
  { const g = grid(16, 16); g.rect(2, 7, 12, 8, '#a8733f'); for (let k = 0; k < 7; k++) g.rect(1 + k, 7 - k, 14 - k * 2, 1, '#c84a3a'); g.rect(7, 10, 3, 5, '#5a3818'); g.outline(); S.houseIcon = g.canvas(); }
  { const g = grid(16, 16); g.disc(8, 7, 5, '#ffffff'); g.rect(7, 12, 2, 3, '#ffffff'); g.outline(); S.bubble = g.canvas(0.8); }
  return S;
}
