// Interior & dungeon renderer: floors, walls and furniture drawn procedurally from semantic labels.
(function (G) {
  'use strict';
  const { Surface, hex, shade, mix, hash2, rgb, bayer } = G.gfx;
  const P = G.PAL, N = G.noise;
  const SHADOW = rgb(150, 150, 185);
  const H = s => hex(s);

  // building themes by map name
  function themeFor(name, ts) {
    const t = { wall: '#efe4cc', wall2: '#dccfae', trim: '#8a5a3a', floor: 'wood', carpet: '#c85a4a', accent: '#c05040', stone: '#b8b4a8', dark: false };
    if (/SocialZone/.test(name)) Object.assign(t, { wall: '#2c2a52', wall2: '#221e44', trim: '#58d8f0', carpet: '#5a3aa0', accent: '#f058b8', tile: '#3e3c6a', tile2: '#36325e' });
    else if (/LancesRoom/.test(name)) Object.assign(t, { wall: '#5a2a38', wall2: '#46202c', trim: '#c8a048', carpet: '#8a2436', tile: '#b09078', tile2: '#98785e' });
    else if (/ChampionsRoom|HallOfFame/.test(name)) Object.assign(t, { wall: '#f4ecd8', wall2: '#e4d4b0', trim: '#c89830', carpet: '#c8a040', tile: '#f0e8d0', tile2: '#e0d4b4' });
    else if (/LoreleisRoom/.test(name)) Object.assign(t, { wall: '#e0f0ff', wall2: '#c0dcf4', trim: '#4a80c0', carpet: '#6aa0d8', tile: '#e8f4ff', tile2: '#d0e4f8' });
    else if (/BrunosRoom/.test(name)) Object.assign(t, { wall: '#c8b8a0', wall2: '#b0a088', trim: '#6a5040', carpet: '#8a6a4a', tile: '#c0b4a0', tile2: '#a89c88' });
    else if (/AgathasRoom/.test(name)) Object.assign(t, { wall: '#5a4a6a', wall2: '#483a58', trim: '#9a7ab8', carpet: '#6a4a8a', tile: '#8a7c98', tile2: '#76688a', dark: true });
    else if (/CeladonMart|Dept/.test(name)) Object.assign(t, { wall: '#f4f0e8', wall2: '#e0d8c8', trim: '#3a8a5a', carpet: '#b85a5a', tile: '#eee8dc', tile2: '#dcd4c4' });
    else if (/Pokecenter/.test(name)) Object.assign(t, { wall: '#f8f0f0', wall2: '#f0d8dc', trim: '#d05868', carpet: '#e07888', accent: '#e04860', tile: '#f4ece4', tile2: '#e4d8d0' });
    else if (/Mart/.test(name)) Object.assign(t, { wall: '#f0f4f8', wall2: '#d8e4f0', trim: '#4870b8', carpet: '#5a88d0', accent: '#4870c0', tile: '#eceef4', tile2: '#d4d8e4' });
    else if (/Gym/.test(name)) Object.assign(t, { wall: '#d8d0c0', wall2: '#c0b6a0', trim: '#6a5a4a', carpet: '#a8484a', tile: '#c8c0b0', tile2: '#b0a894' });
    else if (/Lab/.test(name)) Object.assign(t, { wall: '#f4f8f8', wall2: '#dcecec', trim: '#3a8a8a', carpet: '#58a8a0', tile: '#eef2f2', tile2: '#d6e0e0' });
    else if (/SilphCo|Elevator/.test(name)) Object.assign(t, { wall: '#e8ecf4', wall2: '#cdd4e4', trim: '#5a6a8a', carpet: '#7a8ab0', tile: '#e0e4ec', tile2: '#c8cede' });
    else if (/GameCorner|Club/.test(name)) Object.assign(t, { wall: '#3a2a4a', wall2: '#2a1e38', trim: '#e8c048', carpet: '#b83848', tile: '#8a2838', tile2: '#6a1e2e' });
    else if (/Mansion/.test(name)) Object.assign(t, { wall: '#c8b8a0', wall2: '#a8987e', trim: '#5a4030', carpet: '#8a4a4a', tile: '#b0a28a', tile2: '#968870', worn: true });
    else if (/SSAnne/.test(name)) Object.assign(t, { wall: '#f4f0e4', wall2: '#dcd4bc', trim: '#3a5a9a', carpet: '#4a6ab8', tile: '#e8e0c8', tile2: '#d4c8a8' });
    else if (/Museum/.test(name)) Object.assign(t, { wall: '#e8e4dc', wall2: '#d4cec0', trim: '#7a6a5a', carpet: '#9a4a3a', tile: '#e0dcd4', tile2: '#ccc6ba' });
    else if (/PokemonTower/.test(name)) Object.assign(t, { wall: '#6a5a7a', wall2: '#54466a', trim: '#3a2e4a', carpet: '#7a4a7a', tile: '#8a7c98', tile2: '#76688a', dark: true });
    else if (/CeladonMart|Dept/.test(name)) Object.assign(t, { wall: '#f4f0e8', wall2: '#e0d8c8', trim: '#3a8a5a', carpet: '#4aa070', tile: '#eee8dc', tile2: '#dcd4c4' });
    else if (/Hideout|PowerPlant|Facility/.test(name) || ts === 'facility') Object.assign(t, { wall: '#9aa0b0', wall2: '#80869a', trim: '#4a5064', carpet: '#6a7088', tile: '#a8acb8', tile2: '#9296a4' });
    else if (/Lobby|Gate|Plateau/.test(name)) Object.assign(t, { wall: '#e8e4d8', wall2: '#d4cebe', trim: '#6a5a4a', carpet: '#b85a4a', tile: '#e4dfd2', tile2: '#d0c9b8' });
    else if (/Dojo/.test(name)) Object.assign(t, { wall: '#e8dcc0', wall2: '#d0c09c', trim: '#6a4a2a', carpet: '#b89a5a' });
    // house wallpaper variety
    if (t.floor === 'wood' && !t.tile) {
      const k = Math.floor(hash2(name.length, name.charCodeAt(0), 3) * 4);
      t.wall = ['#efe4cc', '#e8eef0', '#f0e4e4', '#e8f0dc'][k]; t.wall2 = shade(H(t.wall), -0.12);
      t.carpet = ['#c85a4a', '#4a78b8', '#8a5aa0', '#4a9a6a'][k];
    }
    return t;
  }

  // ---------------- floor painters ----------------
  function floorPixel(kind, gx, gy, th) {
    switch (kind) {
      case 'grass': { // indoor lawn: soft mottled greens with bright blades
        const g = P.grass, n = N.mid.at(gx, gy), f = N.fine.at(gx * 2, gy * 2);
        return f > 0.82 ? g[5] : n > 0.62 ? g[4] : n < 0.3 ? g[2] : g[3];
      }
      case 'floor': { // long wooden planks with subtle grain
        const row = Math.floor(gy / 6), off = Math.floor(hash2(row, 7, 21) * 40), bx = Math.floor((gx + off) / 40);
        const ly = gy % 6, lx = (gx + off) % 40;
        const tone = hash2(bx, row, 21);
        const base = tone < 0.33 ? H('#c89a64') : tone < 0.66 ? H('#d2a46c') : H('#c29260');
        if (ly === 5) return H('#8a6040');
        if (lx === 0) return H('#9a6e48');
        if (ly === 0) return shade(base, 0.12);
        const grain = N.fine.at(gx >> 1, gy * 3);
        if (grain > 0.78) return shade(base, -0.08);
        return th.worn && hash2(gx, gy, 5) < 0.04 ? P.wood[2] : base;
      }
      case 'floor_tile': case 'floor_stone': case 'floor_tower': {
        const sz = kind === 'floor_stone' ? 16 : 8;
        const tx = Math.floor(gx / sz), ty = Math.floor(gy / sz), lx = gx % sz, ly = gy % sz;
        let a = H(th.tile || '#e8e4dc'), b = H(th.tile2 || '#d8d2c6');
        if (kind === 'floor_stone') { a = H('#c4bcae'); b = H('#b2aa9a'); }
        if (kind === 'floor_tower') { a = H('#8a7c98'); b = H('#7a6c8a'); }
        let c = (tx + ty) % 2 ? a : b;
        if (kind === 'floor_stone') c = hash2(tx, ty, 9) < 0.5 ? a : b;
        if (lx === 0 || ly === 0) c = shade(c, -0.18);
        else if (lx === 1 || ly === 1) c = shade(c, 0.12);
        if (kind !== 'floor_stone' && lx === sz - 2 && ly === 2) c = shade(c, 0.3);
        return c;
      }
      case 'floor_carpet': { // woven diamond pattern
        const c = H(th.carpet);
        const a = (gx + gy) & 7, b = (gx - gy) & 7;
        if (a === 0 || b === 0) return shade(c, -0.12);
        if (a === 4 && b === 4) return shade(c, 0.18);
        return (a + b) % 4 === 1 ? shade(c, 0.05) : c;
      }
      case 'floor_dojo': {
        const mx = Math.floor(gx / 32), my = Math.floor(gy / 16), lx = gx % 32, ly = gy % 16;
        if (lx === 0 || ly === 0) return H('#5a4a2a');
        const c = H('#c8b878');
        return (lx + ly * 3) % 5 === 0 ? shade(c, -0.08) : c;
      }
      case 'ship_floor': case 'deck': {
        const row = Math.floor(gy / 4), off = (row * 5) % 24, lx = (gx + off) % 24;
        if (gy % 4 === 3) return H('#8a6a48');
        if (lx === 0) return H('#9a7a54');
        return hash2(Math.floor((gx + off) / 24), row, 3) < 0.5 ? H('#d8b888') : H('#ccac7c');
      }
      case 'cave_floor': case 'cave_floor2': case 'cave_high': {
        const R = kind === 'cave_high' ? [H('#8a7462'), H('#9c8672'), H('#b09a84')] : kind === 'cave_floor2' ? [H('#4e4038'), H('#5a4a40'), H('#685648')] : [H('#6a5a4c'), H('#7a685a'), H('#8c7a6a')];
        const n = N.mid.at(gx, gy), f = N.fine.at(gx * 2, gy * 2);
        let c = n < 0.35 ? R[0] : n > 0.7 ? R[2] : R[1];
        if (f > 0.86) c = shade(c, 0.15);
        return c;
      }
    }
    return H('#808080');
  }
  const FLOORS = new Set(['floor', 'floor_tile', 'floor_carpet', 'floor_stone', 'floor_dojo', 'floor_tower', 'ship_floor', 'deck', 'cave_floor', 'cave_floor2', 'cave_high', 'grass']);

  // ---------------- builder ----------------
  function build(map) {
    const MX = G.mapRender.MX, MY = G.mapRender.MY;
    const cw = map.w + MX * 2, ch = map.h + MY * 2, W = cw * 16, Hh = ch * 16;
    const s = new Surface(W, Hh), up = new Surface(W, Hh);
    s.clear(P.black);
    const th = themeFor(map.name, map.tsFile);
    const L = (x, y) => map.inside(x, y) ? map.label(x, y) : 'void';
    // infer floor under objects: nearest floor label among neighbours
    const floorAt = (x, y) => {
      const l = L(x, y); if (FLOORS.has(l)) return l;
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, 1]]) { const k = L(x + dx, y + dy); if (FLOORS.has(k)) return k; }
      return map.tsFile === 'cavern' ? 'cave_floor' : map.tsFile === 'ship' ? 'ship_floor' : th.tile ? 'floor_tile' : 'floor';
    };
    const ox = MX * 16, oy = MY * 16;
    const anim = [];
    // pass 1: floors everywhere that isn't wall/void
    for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) {
      const l = L(x, y);
      if (l === 'void' || l === 'unknown') continue;
      if (isWallish(l) && !FLOORS.has(l)) continue;
      const fk = floorAt(x, y);
      const px = ox + x * 16, py = oy + y * 16;
      for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) s.pset(px + xx, py + yy, floorPixel(fk, x * 16 + xx, y * 16 + yy, th));
      // carpet borders
      if (fk === 'floor_carpet') carpetEdges(s, px, py, x, y, L, th);
    }
    G.mapRender.elevationEdges(s, map, ox, oy);
    // pass 2: walls, then objects top-to-bottom
    for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) {
      const l = L(x, y), px = ox + x * 16, py = oy + y * 16;
      const P2 = PAINT[l];
      if (P2) P2(s, up, px, py, x, y, L, th, anim, map);
      else if (G.terrain && OUTDOOR.has(l)) { /* outdoor-style labels inside (forest) handled by outdoor renderer */ }
    }
    // contact shadows under furniture onto floor
    for (let y = 0; y < map.h; y++) for (let x = 0; x < map.w; x++) {
      const l = L(x, y);
      if (!FURN.has(l)) continue;
      if (FLOORS.has(L(x, y + 1)) || L(x, y + 1) === 'mat') for (let xx = 1; xx < 16; xx++) { s.pmul(ox + x * 16 + xx, oy + (y + 1) * 16, SHADOW); if (xx % 2) s.pmul(ox + x * 16 + xx, oy + (y + 1) * 16 + 1, SHADOW); }
      if (FLOORS.has(L(x + 1, y))) for (let yy = 2; yy < 16; yy++) s.pmul(ox + (x + 1) * 16, oy + y * 16 + yy, SHADOW);
    }
    const R = { map, s, up, W, H: Hh, mx: MX, my: MY, anim: [], wmask: new Uint8Array(W * Hh), wdist: new Uint8Array(W * Hh), wx0: 0, wy0: 0, gcell: {}, interiorAnim: anim, interior: true };
    return R;
  }
  const OUTDOOR = new Set(['grass', 'tall_grass', 'tree', 'tree2', 'path', 'path_tufts', 'sand', 'water', 'fence', 'sign', 'flowers', 'cut_tree']);
  const FURN = new Set(['table', 'chair', 'bed', 'tv', 'tv_woc', 'laptop', 'pc_claude', 'console', 'pc', 'bookshelf', 'shelf', 'cabinet', 'plant', 'counter', 'heal_machine', 'display', 'desk', 'sink', 'stove', 'fridge', 'machine', 'statue', 'gym_statue', 'trash', 'crate', 'barrel', 'board', 'vending', 'slots', 'lamp', 'bench', 'fossil', 'grave', 'cave_rock']);
  function indoorTree(s, up, px, py, x, y, kind) {
    const T = G.terrain, spr = T.treeSprite(kind, Math.floor(hash2(x, y, 3) * 6)), top = py + 16 - spr.h;
    T.drawShadowEllipse(s, px + 9, py + 14, 7, 2.5, 0.8);
    s.blit(spr, px, top + 10, { sy: 10, sh: spr.h - 10 }); up.blit(spr, px, top, { sh: 10 });
  }
  function isWallish(l) { return l === 'wall' || l === 'levy_sign' || l === 'wall_surf' || l === 'wall_window' || l === 'wall_deco' || l === 'void' || l === 'cave_wall' || l === 'ship_wall' || l === 'porthole' || l === 'window_big' || l === 'pillar'; }

  function carpetEdges(s, px, py, x, y, L, th) {
    const c = H(th.carpet), e = shade(c, -0.3), hi = shade(c, 0.25);
    const not = (dx, dy) => { const k = L(x + dx, y + dy); return k !== 'floor_carpet' && k !== 'mat'; };
    if (not(0, -1)) for (let i = 0; i < 16; i++) { s.pset(px + i, py, e); s.pset(px + i, py + 1, hi); }
    if (not(0, 1)) for (let i = 0; i < 16; i++) { s.pset(px + i, py + 15, e); s.pset(px + i, py + 14, shade(c, -0.12)); }
    if (not(-1, 0)) for (let i = 0; i < 16; i++) { s.pset(px, py + i, e); s.pset(px + 1, py + i, hi); }
    if (not(1, 0)) for (let i = 0; i < 16; i++) s.pset(px + 15, py + i, e);
  }
  // ---------------- wall & object painters ----------------
  function wallPaper(s, px, py, x, y, L, th) {
    const w = H(th.wall), w2 = H(th.wall2), trim = H(th.trim);
    const below = L(x, y + 1), above = L(x, y - 1);
    const bottom = !isWallish(below) || below === 'pillar';
    for (let yy = 0; yy < 16; yy++) for (let xx = 0; xx < 16; xx++) {
      const gx = x * 16 + xx;
      let c = (gx % 8 < 4) ? w : mix(w, w2, 0.5);
      if (th.worn && N.mid.at(gx * 2, (y * 16 + yy) * 2) > 0.72) c = shade(c, -0.15);
      if (yy === 3 && isWallish(above)) c = shade(w, -0.1);
      if (bottom && yy >= 12) c = yy === 12 ? shade(trim, 0.25) : yy === 15 ? shade(trim, -0.35) : trim;
      s.pset(px + xx, py + yy, c);
    }
    if (!isWallish(above)) for (let xx = 0; xx < 16; xx++) { s.pset(px + xx, py, shade(w2, -0.4)); s.pset(px + xx, py + 1, shade(w2, -0.15)); }
  }
  function drawBox(s, x, y, w, h, top, front, depth) { // top surface + front face, outlined
    depth = depth === undefined ? 4 : depth;
    const t = H(top), f = H(front);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      let c = j < h - depth ? t : f;
      if (j === 0 || i === 0 || i === w - 1 || j === h - 1) c = P.outline;
      else if (j === 1) c = shade(t, 0.2);
      else if (j === h - depth) c = shade(f, 0.25);
      else if (i === w - 2) c = shade(c, -0.15);
      s.pset(x + i, y + j, c);
    }
  }
  const PAINT = {
    void: () => {},
    wall: (s, up, px, py, x, y, L, th) => wallPaper(s, px, py, x, y, L, th),
    wall_deco: (s, up, px, py, x, y, L, th) => {
      wallPaper(s, px, py, x, y, L, th);
      const k = Math.floor(hash2(x, y, 7) * 3);
      if (k === 0) { // framed picture
        drawBox(s, px + 3, py + 2, 10, 9, '#6a4a2a', '#6a4a2a', 0);
        for (let j = 0; j < 5; j++) for (let i = 0; i < 6; i++) s.pset(px + 5 + i, py + 4 + j, j < 2 ? H('#88c0f0') : j < 3 ? H('#6aa860') : H('#4a8850'));
      } else if (k === 1) { // poster
        drawBox(s, px + 4, py + 1, 8, 11, '#f8f0d8', '#f8f0d8', 0);
        s.disc(px + 8, py + 5, 2, H('#e04848')); s.hline(px + 6, px + 10, py + 9, H('#5a5a7a'));
      } else { // clock
        s.disc(px + 8, py + 6, 4.5, P.outline); s.disc(px + 8, py + 6, 3.6, H('#f8f4e8'));
        s.vline(px + 8, py + 3, py + 6, P.outline); s.hline(px + 8, px + 10, py + 6, P.outline);
      }
    },
    wall_window: (s, up, px, py, x, y, L, th) => {
      wallPaper(s, px, py, x, y, L, th);
      drawBox(s, px + 2, py + 2, 12, 10, '#f8f8f8', '#f8f8f8', 0);
      for (let j = 0; j < 6; j++) for (let i = 0; i < 8; i++) s.pset(px + 4 + i, py + 4 + j, (i - j + 8) % 6 < 2 ? H('#d8f0ff') : j < 3 ? H('#88c8f8') : H('#6ab0e8'));
      s.vline(px + 8, py + 4, py + 9, H('#f8f8f8'));
      // curtains
      for (let j = 3; j < 11; j++) { s.pset(px + 3, py + j, H(th.carpet)); s.pset(px + 12, py + j, H(th.carpet)); }
    },
    window_big: (s, up, px, py, x, y, L, th) => {
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) s.pset(px + i, py + j, (i + j * 2 + x * 16) % 20 < 3 ? H('#e0f4ff') : j < 8 ? H('#90c8f0') : H('#70b0e0'));
      for (let i = 0; i < 16; i++) { s.pset(px + i, py, P.outline); s.pset(px + i, py + 15, H(th.trim)); }
      s.vline(px, py, py + 15, H('#c8c8d0'));
    },
    pillar: (s, up, px, py, x, y, L, th) => {
      for (let j = 0; j < 16; j++) for (let i = 2; i < 14; i++) s.pset(px + i, py + j, i < 5 ? H('#f4f0e8') : i > 11 ? H('#a8a498') : H('#dcd8cc'));
      for (let i = 2; i < 14; i++) { s.pset(px + i, py, P.outline); }
      s.vline(px + 1, py, py + 15, P.outline); s.vline(px + 14, py, py + 15, P.outline);
    },
    railing: (s, up, px, py, x, y, L) => {
      const horiz = L(x - 1, y) === 'railing' || L(x + 1, y) === 'railing';
      if (horiz) { for (let i = 0; i < 16; i++) { s.pset(px + i, py + 6, H('#c8a878')); s.pset(px + i, py + 7, H('#8a6a48')); } for (const i of [2, 10]) for (let j = 6; j < 15; j++) { s.pset(px + i, py + j, H('#8a6a48')); s.pset(px + i + 1, py + j, H('#6a4a30')); } }
      else { for (let j = 0; j < 16; j++) { s.pset(px + 7, py + j, H('#c8a878')); s.pset(px + 8, py + j, H('#8a6a48')); } }
    },
    door: (s, up, px, py, x, y, L, th) => {
      if (isWallish(L(x, y - 1)) || true) wallPaper(s, px, py, x, y, L, th);
      drawBox(s, px + 2, py + 1, 12, 15, '#9a6a40', '#7a5030', 0);
      s.pset(px + 11, py + 9, H('#f0d040'));
    },
    mat: (s, up, px, py, x, y, L, th) => {
      const c = H(th.accent || '#b04848');
      for (let j = 3; j < 14; j++) for (let i = 1; i < 15; i++) s.pset(px + i, py + j, (j === 3 || j === 13) ? shade(c, -0.35) : ((i + j) % 4 === 0 ? shade(c, 0.15) : c));
      for (let i = 1; i < 15; i += 2) { s.pset(px + i, py + 14, H('#f0e0c0')); s.pset(px + i, py + 2, H('#f0e0c0')); }
    },
    stairs_up: (s, up, px, py) => { for (let j = 0; j < 16; j++) for (let i = 1; i < 15; i++) { const st = j % 4; s.pset(px + i, py + j, st === 0 ? H('#e8d8b8') : st === 3 ? H('#8a7050') : H('#c8b090')); } s.vline(px, py, py + 15, P.outline); s.vline(px + 15, py, py + 15, P.outline); },
    stairs_down: (s, up, px, py) => { for (let j = 0; j < 16; j++) for (let i = 1; i < 15; i++) { const st = j % 4; const dk = j / 16; s.pset(px + i, py + j, mix(st === 0 ? H('#c8b898') : H('#8a7a60'), P.black, dk * 0.7)); } s.vline(px, py, py + 15, P.outline); s.vline(px + 15, py, py + 15, P.outline); },
    ladder_up: (s, up, px, py) => { for (let j = 0; j < 16; j++) { s.pset(px + 4, py + j, H('#8a5a30')); s.pset(px + 11, py + j, H('#8a5a30')); } for (let j = 2; j < 16; j += 4) for (let i = 4; i < 12; i++) s.pset(px + i, py + j, H('#c89060')); },
    ladder_down: (s, up, px, py) => { s.ellipse(px + 8, py + 9, 7, 6, P.black); s.ellipse(px + 8, py + 8, 6, 5, H('#1a1418')); for (let j = 5; j < 15; j++) { s.pset(px + 5, py + j, H('#8a5a30')); s.pset(px + 10, py + j, H('#8a5a30')); } for (let j = 6; j < 15; j += 3) for (let i = 5; i < 11; i++) s.pset(px + i, py + j, H('#b88050')); },
    hole: (s, up, px, py) => { s.ellipse(px + 8, py + 9, 7.5, 6, H('#1a1210')); s.ellipse(px + 8, py + 10, 6, 4.5, P.black); for (let i = 1; i < 15; i++) s.pset(px + i, py + 3 + Math.round(Math.abs(i - 7.5) * 0.4), H('#9a8470')); },
    table: (s, up, px, py, x, y, L) => {
      const l = L(x - 1, y) === 'table', r = L(x + 1, y) === 'table', t = L(x, y - 1) === 'table', b = L(x, y + 1) === 'table';
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
        let c = (j + x * 3) % 6 === 0 ? P.wood[4] : P.wood[5];
        if (!b && j >= 11) c = j === 15 ? P.outline : P.wood[2];
        if (!t && j === 0) c = P.outline; if (!l && i === 0) c = P.outline; if (!r && i === 15) c = P.outline;
        if (!t && j === 1) c = P.wood[6];
        s.pset(px + i, py + j, c);
      }
    },
    desk: (s, up, px, py, x, y, L) => { PAINT.table(s, up, px, py, x, y, (a, b) => L(a, b) === 'desk' ? 'table' : L(a, b)); drawBox(s, px + 3, py + 2, 7, 6, '#f8f8f0', '#c8c8c0', 1); },
    chair: (s, up, px, py) => { drawBox(s, px + 3, py + 4, 10, 10, '#d88a4a', '#a0602a', 4); },
    bench: (s, up, px, py, x, y, L) => { drawBox(s, px + (L(x - 1, y) === 'bench' ? 0 : 2), py + 5, L(x + 1, y) === 'bench' ? 16 : 14 - (L(x - 1, y) === 'bench' ? 0 : 2), 9, '#c8905a', '#8a5a30', 4); },
    bed: (s, up, px, py, x, y, L, th) => {
      const top = L(x, y - 1) !== 'bed', bot = L(x, y + 1) !== 'bed';
      for (let j = 0; j < 16; j++) for (let i = 1; i < 15; i++) {
        let c = H(th.carpet);
        if (top && j < 7) c = j < 1 ? P.outline : H('#f8f8f8');
        if (top && j === 7) c = shade(H(th.carpet), 0.3);
        if ((j + i) % 5 === 0 && !(top && j < 7)) c = shade(c, -0.1);
        if (bot && j >= 13) c = j === 15 ? P.outline : H('#8a5a30');
        if (i === 1 || i === 14) c = P.outline;
        s.pset(px + i, py + j, c);
      }
      if (top) { s.ellipse(px + 8, py + 4, 5, 2.4, H('#ffffff')); s.pset(px + 5, py + 3, H('#e0e0ea')); }
    },
    tv: (s, up, px, py, x, y, L, th, anim) => {
      drawBox(s, px + 1, py + 2, 14, 13, '#4a4a58', '#2a2a36', 3);
      for (let j = 0; j < 7; j++) for (let i = 0; i < 10; i++) s.pset(px + 3 + i, py + 4 + j, (i + j) % 5 === 0 ? H('#c8f0ff') : H('#6ab8e8'));
      anim.push({ kind: 'screen', x: px + 3, y: py + 4, w: 10, h: 7 });
    },
    // Red's MacBook Pro, a Claude terminal open on it (the SNES in Red)
    laptop: (s, up, px, py, x, y, L, th, anim) => {
      s.ellipseBlend(px + 8, py + 14, 7, 1.6, H('#000000'), 0.3);
      s.rect(px + 2, py + 1, 12, 9, H('#1c1d22')); s.rect(px + 7, py + 1, 2, 1, H('#050506')); // lid + notch
      s.rect(px + 3, py + 2, 10, 7, H('#1a1714'));
      s.rect(px + 1, py + 10, 14, 3, H('#c9ccd3')); s.hline(px + 1, px + 14, py + 10, H('#e6e8ec')); s.hline(px + 2, px + 13, py + 13, H('#80848e'));
      for (let i = 0; i < 6; i++) { s.pset(px + 3 + i * 2, py + 11, H('#8e929c')); s.pset(px + 4 + i * 2, py + 12, H('#9a9ea8')); }
      s.rect(px + 6, py + 12, 4, 1, H('#dcdfe4'));
      anim.push({ kind: 'terminal', x: px + 3, y: py + 2, w: 10, h: 7 });
    },
    // the TV in Red's room: WORLD OF CLAUDECRAFT on screen
    tv_woc: (s, up, px, py, x, y, L, th, anim) => {
      drawBox(s, px + 1, py + 2, 14, 13, '#4a4a58', '#2a2a36', 3);
      const a = { kind: 'woc', x: px + 3, y: py + 4, w: 10, h: 7 }; wocFrame(s, a, 3); anim.push(a);
    },
    console: (s, up, px, py) => { drawBox(s, px + 3, py + 7, 10, 6, '#c8c8d0', '#9898a8', 2); s.pset(px + 5, py + 9, H('#d84040')); s.pset(px + 7, py + 9, H('#3a3a4a')); s.line(px + 8, py + 12, px + 12, py + 15, P.outline); },
    pc: (s, up, px, py, x, y, L, th, anim) => {
      drawBox(s, px + 1, py + 1, 14, 14, '#e8e8f0', '#b8b8c8', 4);
      for (let j = 0; j < 6; j++) for (let i = 0; i < 10; i++) s.pset(px + 3 + i, py + 3 + j, j === 0 ? H('#a8f0c8') : H('#3ab880'));
      s.hline(px + 4, px + 11, py + 12, H('#8888a0'));
      anim.push({ kind: 'pc', x: px + 3, y: py + 3, w: 10, h: 6 });
    },
    // the Levy St. office (Celadon Mansion 3F): every monitor runs Claude, a surfboard leans on the wall
    pc_claude: (s, up, px, py, x, y, L, th, anim) => {
      drawBox(s, px + 1, py + 1, 14, 14, '#2a2c34', '#1a1b20', 4);
      s.rect(px + 3, py + 3, 10, 7, H('#1a1714'));
      s.hline(px + 4, px + 11, py + 12, H('#4a4c56'));
      anim.push({ kind: 'terminal', x: px + 3, y: py + 3, w: 10, h: 7 });
    },
    levy_sign: (s, up, px, py, x, y, L, th) => {
      wallPaper(s, px, py, x, y, L, th);
      s.rect(px + 2, py + 1, 12, 12, H('#141a2e')); s.hline(px + 2, px + 13, py + 12, H('#0a0e1a'));
      const mk = G.LEVY_LOGO && G.LEVY_LOGO.mark;
      if (mk) for (let j = 0; j < 10; j++) for (let i = 0; i < 10; i++) {
        const a = +mk[Math.floor((j + 0.5) * mk.length / 10)][Math.floor((i + 0.5) * mk[0].length / 10)];
        if (a >= 5) s.pset(px + 3 + i, py + 2 + j, H('#f3f0e9'));
      }
    },
    wall_surf: (s, up, px, py, x, y, L, th) => {
      wallPaper(s, px, py, x, y, L, th);
      for (let j = 0; j < 15; j++) { const w = j < 2 || j > 12 ? 2 : 4, x0 = px + 8 - (w >> 1) + (j >> 3); s.rect(x0, py + j, w, 1, j % 5 === 2 ? H('#d97757') : H('#e8f4f8')); s.pset(x0 - 1, py + j, P.outline); s.pset(x0 + w, py + j, P.outline); }
      s.pset(px + 9, py + 6, H('#1a4a8a'));
    },
    bookshelf: (s, up, px, py, x, y, L) => {
      const topRow = L(x, y - 1) !== 'bookshelf';
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
        let c = P.wood[2];
        if (i === 0 || i === 15) c = P.wood[1];
        if (topRow && j < 2) c = j === 0 ? P.outline : P.wood[4];
        const shelfY = j % 8;
        if (shelfY === 7) c = P.wood[3];
        else if (i > 1 && i < 14 && shelfY > (topRow && j < 8 ? 2 : 0)) {
          const book = Math.floor((i - 2 + x * 5 + Math.floor(j / 8) * 3) / 2);
          const cols = ['#c84848', '#4870c8', '#48a868', '#e8b840', '#8a58b0', '#e8e0d0'];
          const h = 3 + Math.floor(hash2(book, y * 2 + Math.floor(j / 8), 13) * 4);
          if (shelfY >= 7 - h) c = H(cols[Math.floor(hash2(book, j >> 3, 17) * cols.length)]);
          if ((i - 2 + x * 5) % 2 === 1 && shelfY >= 7 - h) c = shade(c, -0.25);
        }
        s.pset(px + i, py + j, c);
      }
      s.vline(px, py, py + 15, P.outline); s.vline(px + 15, py, py + 15, P.outline);
    },
    shelf: (s, up, px, py, x, y, L) => {
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
        let c = H('#d8d8e0'); if (j % 6 === 5) c = H('#8a8aa0'); if (i === 0 || i === 15) c = H('#6a6a80');
        s.pset(px + i, py + j, c);
      }
      for (let r = 0; r < 3; r++) for (let k = 0; k < 4; k++) { const cc = ['#e05050', '#50a0e0', '#f0c040', '#60c070', '#c070d0'][Math.floor(hash2(x * 4 + k, y * 3 + r, 3) * 5)]; drawBox(s, px + 1 + k * 3.6, py + r * 6 + 1, 3, 4, cc, shade(H(cc), -0.3), 1); }
    },
    cabinet: (s, up, px, py) => { drawBox(s, px + 1, py + 1, 14, 15, '#c8905a', '#a06a3a', 12); s.hline(px + 3, px + 12, py + 8, P.wood[1]); s.pset(px + 7, py + 5, H('#f0d040')); s.pset(px + 7, py + 11, H('#f0d040')); },
    plant: (s, up, px, py, x, y) => {
      drawBox(s, px + 4, py + 10, 8, 6, '#c86a3a', '#a04a2a', 3);
      const spr = G.terrain.cached('iplant', () => { const t = new Surface(16, 14); G.terrain.foliage(t, [{ x: 8, y: 7, r: 5.5 }, { x: 4.5, y: 9, r: 3.5 }, { x: 11.5, y: 9, r: 3.5 }, { x: 8, y: 3.5, r: 3.2, lit: 0.1 }], P.leaf.slice(0), 911); return t; });
      s.blit(spr, px, py - 2, { sy: 2 }); up.blit(spr, px, py - 2, { sh: 2 });
    },
    counter: (s, up, px, py, x, y, L, th) => {
      const l = L(x - 1, y) === 'counter', r = L(x + 1, y) === 'counter';
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
        let c = j < 7 ? H('#f4f0e4') : H(th.trim);
        if (j === 0) c = P.outline; if (j === 1) c = H('#ffffff'); if (j === 7) c = shade(H(th.trim), 0.3); if (j === 15) c = shade(H(th.trim), -0.4);
        if (j > 7 && (i + x * 16) % 16 === 8) c = shade(H(th.trim), -0.2);
        if ((!l && i === 0) || (!r && i === 15)) c = P.outline;
        s.pset(px + i, py + j, c);
      }
    },
    heal_machine: (s, up, px, py, x, y, L, th, anim) => {
      drawBox(s, px + 1, py + 1, 14, 14, '#e8e8f0', '#c8c8d8', 5);
      for (let k = 0; k < 6; k++) { const bx = px + 3 + (k % 2) * 5, by = py + 3 + Math.floor(k / 2) * 3; s.disc(bx + 1.5, by + 1, 1.6, H('#a8a8b8')); }
      s.rect(px + 4, py + 11, 8, 2, H('#58d080'));
      anim.push({ kind: 'blink', x: px + 12, y: py + 12, c: '#f05050' });
    },
    display: (s, up, px, py, x, y, L) => {
      drawBox(s, px, py + 3, 16, 13, '#d8e8f4', '#8a7a6a', 5);
      for (let j = 4; j < 10; j++) for (let i = 1; i < 15; i++) if ((i + j) % 7 === 0) s.pset(px + i, py + j, H('#ffffff'));
      s.disc(px + 8, py + 7, 2.5, H('#c8a060'));
    },
    fossil: (s, up, px, py) => { drawBox(s, px, py + 2, 16, 14, '#e8dcc8', '#b8a890', 4); for (let i = 2; i < 14; i += 2) s.vline(px + i, py + 5, py + 9, H('#8a7a62')); s.hline(px + 2, px + 13, py + 7, H('#8a7a62')); },
    sink: (s, up, px, py) => { drawBox(s, px + 1, py + 2, 14, 14, '#e8e8f0', '#b8b8c8', 5); s.ellipse(px + 8, py + 7, 4.5, 2.5, H('#8ab8e0')); s.pset(px + 8, py + 3, H('#b0b0c0')); },
    stove: (s, up, px, py) => { drawBox(s, px + 1, py + 1, 14, 15, '#e8e8e8', '#b8b8c0', 7); s.circle(px + 5, py + 5, 2, P.outline); s.circle(px + 11, py + 5, 2, P.outline); s.rect(px + 4, py + 11, 8, 3, H('#3a3a44')); },
    fridge: (s, up, px, py) => { drawBox(s, px + 2, py, 12, 16, '#f0f4f8', '#d0d8e0', 10); s.hline(px + 3, px + 12, py + 6, H('#a8b0c0')); s.vline(px + 11, py + 2, py + 4, H('#8890a0')); },
    machine: (s, up, px, py, x, y, L, th, anim) => {
      drawBox(s, px + 1, py + 1, 14, 15, '#9aa4b8', '#6a7488', 5);
      for (let k = 0; k < 3; k++) s.rect(px + 3 + k * 4, py + 4, 2, 2, H(['#e05050', '#50e070', '#f0d040'][k]));
      for (let j = 7; j < 10; j++) s.hline(px + 3, px + 12, py + j, j === 8 ? H('#3a4458') : H('#58627a'));
      anim.push({ kind: 'blink', x: px + 3 + Math.floor(hash2(x, y, 4) * 3) * 4, y: py + 4, c: '#ffffff' });
    },
    statue: (s, up, px, py, x, y, L, th, anim, map) => { const n = G.terrain.statueTop(L, x, y, 'statue'); if (!n) return; G.terrain.paintStatueAt(s, up, px, py, n, G.terrain.statueSpecies(map && map.name, x, y), { overhang: L(x, y - 1) === 'statue' || L(x, y + 2) === 'statue' ? 0 : 10 }); },
    gym_statue: (s, up, px, py, x, y, L, th, anim, map) => { const n = G.terrain.statueTop(L, x, y, 'gym_statue'); if (!n) return; G.terrain.paintStatueAt(s, up, px, py, n, map && map.name === 'LancesRoom' ? 'DRAGONITE' : 'RHYDON', { overhang: L(x, y - 1) === 'gym_statue' || L(x, y + 2) === 'gym_statue' ? 0 : 10 }); },
    trash: (s, up, px, py) => { drawBox(s, px + 4, py + 5, 8, 11, '#8a9aa8', '#6a7a88', 8); s.hline(px + 4, px + 11, py + 5, P.outline); for (let j = 7; j < 14; j += 2) s.hline(px + 5, px + 10, py + j, H('#58687a')); },
    crate: (s, up, px, py) => { drawBox(s, px + 1, py + 2, 14, 14, '#c89a60', '#9a6a3a', 5); s.line(px + 2, py + 3, px + 13, py + 10, P.wood[2]); s.line(px + 13, py + 3, px + 2, py + 10, P.wood[2]); },
    barrel: (s, up, px, py) => { s.ellipse(px + 8, py + 9, 6, 7, P.wood[3]); s.ellipse(px + 7, py + 8, 4, 5.5, P.wood[4]); s.hline(px + 2, px + 13, py + 6, H('#6a6a72')); s.hline(px + 2, px + 13, py + 12, H('#6a6a72')); s.ellipse(px + 8, py + 3, 5.5, 2, P.wood[5]); },
    board: (s, up, px, py, x, y, L, th) => { wallPaper(s, px, py, x, y, L, th); drawBox(s, px + 1, py + 2, 14, 10, '#2e5a3e', '#2e5a3e', 0); s.hline(px + 3, px + 9, py + 5, H('#e8e8e0')); s.hline(px + 3, px + 11, py + 8, H('#c8d0c8')); },
    vending: (s, up, px, py, x, y, L, th, anim) => { drawBox(s, px + 1, py, 14, 16, '#e05050', '#b03838', 5); for (let k = 0; k < 3; k++) s.rect(px + 3 + k * 4, py + 3, 3, 4, H(['#68b8f0', '#f0d048', '#f0f0f0'][k])); s.rect(px + 4, py + 9, 8, 2, P.outline); },
    slots: (s, up, px, py, x, y, L, th, anim) => {
      drawBox(s, px + 1, py, 14, 16, '#e8c048', '#b08a28', 5);
      for (let k = 0; k < 3; k++) { s.rect(px + 3 + k * 4, py + 3, 3, 5, H('#fff8e8')); s.pset(px + 4 + k * 4, py + 5, H(['#e04040', '#4070e0', '#40b060'][k])); }
      anim.push({ kind: 'lights', x: px + 2, y: py + 1, w: 12 });
    },
    lamp: (s, up, px, py) => { s.vline(px + 8, py + 4, py + 14, H('#6a6a72')); s.ellipse(px + 8, py + 4, 5, 3, H('#f8e8a0')); s.ellipseBlend(px + 8, py + 6, 9, 7, H('#fff4c0'), 0.25); drawBox(s, px + 5, py + 13, 6, 3, '#6a6a72', '#4a4a52', 1); },
    grave: (s, up, px, py, x, y) => {
      const k = Math.floor(hash2(x, y, 3) * 2);
      if (k) { drawBox(s, px + 3, py + 3, 10, 13, '#9a90a8', '#6a6078', 4); s.hline(px + 5, px + 10, py + 6, H('#5a5068')); }
      else { s.ellipse(px + 8, py + 7, 5, 5, H('#9a90a8')); drawBox(s, px + 3, py + 7, 10, 9, '#9a90a8', '#6a6078', 4); s.vline(px + 8, py + 3, py + 9, H('#5a5068')); s.hline(px + 6, px + 10, py + 5, H('#5a5068')); }
    },
    // mechanics
    spinner_up: (s, up, px, py) => spinner(s, px, py, 'up'), spinner_down: (s, up, px, py) => spinner(s, px, py, 'down'),
    spinner_left: (s, up, px, py) => spinner(s, px, py, 'left'), spinner_right: (s, up, px, py) => spinner(s, px, py, 'right'),
    spinner_stop: (s, up, px, py) => { s.disc(px + 8, py + 8, 6, H('#d04848')); s.disc(px + 8, py + 8, 4.5, H('#f07070')); s.rect(px + 5, py + 7, 7, 3, H('#ffffff')); },
    teleport: (s, up, px, py, x, y, L, th, anim) => { s.ellipse(px + 8, py + 9, 7, 5, H('#3a4a78')); s.ellipse(px + 8, py + 9, 5.5, 3.8, H('#6a8ad0')); s.ellipse(px + 8, py + 9, 3, 2, H('#c0e0ff')); anim.push({ kind: 'teleport', x: px + 8, y: py + 9 }); },
    barrier: (s, up, px, py, x, y, L, th, anim) => { anim.push({ kind: 'barrier', x: px, y: py }); },
    water: (s, up, px, py, x, y) => { for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) s.pset(px + i, py + j, G.terrain.waterColor(x * 16 + i, y * 16 + j, 6, 0)); },
    // outdoor-style objects inside (Celadon Gym's garden maze, Silph Co's lobby planters, cave signs)
    tree: (s, up, px, py, x, y, L) => indoorTree(s, up, px, py, x, y, L(x, y)),
    tree2: (s, up, px, py, x, y, L) => indoorTree(s, up, px, py, x, y, L(x, y)),
    cut_tree: (s, up, px, py, x, y) => {
      const T = G.terrain; T.drawShadowEllipse(s, px + 9, py + 14, 6, 2, 0.7);
      const spr = T.cutTreeSprite(Math.floor(hash2(x, y, 5) * 3)); s.blit(spr, px, py - 2, { sy: 2 }); up.blit(spr, px, py - 2, { sh: 2 });
    },
    sign: (s, up, px, py) => G.terrain.paintSign(s, px, py),
    flowers: (s, up, px, py, x, y, L) => { // planter box of flowers
      const rim = H('#8a8478'), rimHi = H('#b8b2a4'), rimLo = H('#5c574e'), soil = H('#5a3c26');
      const same = (dx, dy) => L(x + dx, y + dy) === 'flowers';
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
        const edgeT = !same(0, -1) && j < 2, edgeB = !same(0, 1) && j > 13, edgeL = !same(-1, 0) && i < 2, edgeR = !same(1, 0) && i > 13;
        s.pset(px + i, py + j, edgeT ? rimHi : edgeB ? rimLo : edgeL || edgeR ? rim : soil);
      }
      s.blit(G.terrain.flowerSprite(['red', 'yellow', 'pink', 'white'][Math.floor(hash2(x, y, 8) * 4)], 0), px, py - 1);
    },
    glass: (s, up, px, py, x, y, L) => { // Koga's "invisible" walls, drawn as faint glass panes
      const tint = H('#cfeeff'), edge = H('#ffffff'), dark = H('#5a7890');
      const same = (dx, dy) => L(x + dx, y + dy) === 'glass';
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
        const k = (py + j) * s.w + px + i;
        let a = 0.16;
        if (!same(0, -1) && j === 0) a = 0.7; else if (!same(-1, 0) && i === 0) a = 0.45;
        if ((i + j === 12 || i + j === 13 || i + j === 17) && i > 2 && i < 14) a = 0.42; // sheen
        s.data[k] = mix(s.data[k], a > 0.6 ? edge : tint, a);
        if ((!same(0, 1) && j === 15) || (!same(1, 0) && i === 15)) s.data[k] = mix(s.data[k], dark, 0.45);
      }
    },
    // caves
    cave_wall: (s, up, px, py, x, y, L) => {
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
        const gx = x * 16 + i + 2048, gy = y * 16 + j + 2048;
        s.pset(px + i, py + j, G.terrain.rockPixel ? G.terrain.rockPixel(gx, gy, CAVEROCK, 0) : CAVEROCK[3]);
      }
      if (!isWallish(L(x, y + 1)) && L(x, y + 1) !== 'void') for (let i = 0; i < 16; i++) { s.pset(px + i, py + 15, CAVEROCK[0]); s.pmul(px + i, py + 16, SHADOW); s.pmul(px + i, py + 17, SHADOW); }
    },
    cave_rock: (s, up, px, py, x, y) => { s.ellipse(px + 8, py + 10, 7, 5.5, CAVEROCK[1]); s.ellipse(px + 7, py + 9, 5.5, 4.5, CAVEROCK[3]); s.ellipse(px + 6, py + 7, 2.5, 1.8, CAVEROCK[5]); },
    cave_ledge: (s, up, px, py, x, y, L) => { for (let i = 0; i < 16; i++) { s.pset(px + i, py + 11, H('#c8b098')); s.pset(px + i, py + 12, H('#9a8270')); for (let j = 13; j < 16; j++) s.pset(px + i, py + j, H('#5a4a3c')); } },
    ship_wall: (s, up, px, py, x, y, L, th) => wallPaper(s, px, py, x, y, L, Object.assign({}, th, { wall: '#f0ece0', wall2: '#dcd6c4', trim: '#3a5a9a' })),
    porthole: (s, up, px, py, x, y, L, th) => { PAINT.ship_wall(s, up, px, py, x, y, L, th); s.disc(px + 8, py + 7, 5, H('#b8a060')); s.disc(px + 8, py + 7, 3.8, H('#5aa0e0')); s.pset(px + 6, py + 5, H('#e0f4ff')); },
  };
  const CAVEROCK = ['#241c20', '#3e3230', '#5a4a44', '#76645a', '#927e70', '#ae9a88', '#c8b6a2'].map(H);
  function spinner(s, px, py, dir) {
    s.disc(px + 8, py + 8, 6.5, H('#3a4a78')); s.disc(px + 8, py + 8, 5.5, H('#5a78c0'));
    const pts = { up: [8, 3, 3, 9, 13, 9], down: [8, 13, 3, 7, 13, 7], left: [3, 8, 9, 3, 9, 13], right: [13, 8, 7, 3, 7, 13] }[dir];
    s.poly([px + pts[0], py + pts[1], px + pts[2], py + pts[3], px + pts[4], py + pts[5]], H('#f0f4ff'));
  }

  // WORLD OF CLAUDECRAFT on Red's TV: sky, hills, a castle, an adventurer marching by
  function wocFrame(s, a, step) {
    for (let j = 0; j < a.h; j++) for (let i = 0; i < a.w; i++) s.pset(a.x + i, a.y + j, j < 3 ? H(j ? '#6a8ae0' : '#3a4ab0') : j < 5 ? H('#4a9a4a') : H('#2e6a36'));
    s.pset(a.x + 8, a.y, H('#f0a060'));
    s.rect(a.x + 6, a.y + 2, 3, 3, H('#8a8ea0')); s.pset(a.x + 6, a.y + 1, H('#8a8ea0')); s.pset(a.x + 8, a.y + 1, H('#8a8ea0')); s.pset(a.x + 7, a.y + 4, H('#2a2a36'));
    const hx = a.x + (step % 12) - 1; if (hx >= a.x && hx < a.x + a.w) { s.pset(hx, a.y + 4, H('#d97757')); s.pset(hx, a.y + 5, H('#3a3a8a')); }
    if (step % 12 > 8) s.pset(a.x + 5, a.y + 3, H('#ffe060'));
  }
  // per-frame interior animation (screens, blinking lights, teleporters, barriers)
  function animate(R, t, vx, vy) {
    if (!R.interiorAnim) return;
    for (const a of R.interiorAnim) {
      if (a.kind === 'screen' && t % 8 === 0) { for (let j = 0; j < a.h; j++) for (let i = 0; i < a.w; i++) R.s.pset(a.x + i, a.y + j, ((i + j + (t >> 3)) % 6 === 0) ? H('#e0f8ff') : (j + (t >> 4)) % 3 === 0 ? H('#78c8f0') : H('#5aa8e0')); }
      if (a.kind === 'terminal' && t % 6 === 0) { // prompt, streaming reply, blinking cursor
        const step = t / 6 | 0, bg = H('#1a1714'), cols = [H('#e8e2d6'), H('#d97757'), H('#8a8478'), H('#7ac8a0')];
        for (let j = 0; j < a.h; j++) for (let i = 0; i < a.w; i++) R.s.pset(a.x + i, a.y + j, bg);
        R.s.pset(a.x, a.y, H('#d97757')); R.s.pset(a.x + 1, a.y + 1, H('#d97757')); R.s.pset(a.x, a.y + 1, H('#f0a080')); R.s.pset(a.x + 1, a.y, H('#f0a080'));
        for (let row = 0; row < 3; row++) {
          const line = step - 3 + row, len = 3 + ((line * 7 + 3) % 6), shown = row === 2 ? Math.min(len, step % 8) : len;
          for (let i = 0; i < shown; i++) if ((i * 5 + line) % 4) R.s.pset(a.x + 1 + i, a.y + 2 + row * 2, cols[(line + (i > 3 ? 1 : 0)) % 4 === 1 ? 1 : (line % 3 === 0 ? 3 : 0)]);
          if (row === 2 && (step >> 1) % 2) R.s.pset(a.x + 1 + shown, a.y + 6, H('#ffffff'));
        }
      }
      if (a.kind === 'woc' && t % 5 === 0) wocFrame(R.s, a, t / 5 | 0);
      if (a.kind === 'pc' && t % 30 === 0) { const on = (t / 30) % 2; for (let i = 0; i < a.w; i++) R.s.pset(a.x + i, a.y + 3, on ? H('#a8f0c8') : H('#3ab880')); }
      if (a.kind === 'blink' && t % 20 === 0) R.s.pset(a.x, a.y, (t / 20) % 2 ? H(a.c) : H('#3a3a44'));
      if (a.kind === 'lights' && t % 6 === 0) for (let i = 0; i < a.w; i += 2) R.s.pset(a.x + i, a.y, ((i >> 1) + (t / 6)) % 3 === 0 ? H('#ffffff') : H('#e04848'));
    }
  }
  function drawOverlay(s, R, t, cx, cy, mx, my) {
    if (!R.interiorAnim) return;
    for (const a of R.interiorAnim) {
      if (a.kind === 'teleport') { const x = a.x - cx - mx, y = a.y - cy - my; const r = 3 + (t % 30) / 5; s.ellipseBlend(x, y - 2, r * 1.3, r, H('#c0e8ff'), 0.25 * (1 - (t % 30) / 30)); }
      if (a.kind === 'barrier') { const x = a.x - cx - mx, y = a.y - cy - my; for (let k = 0; k < 3; k++) { const yy = y + 2 + ((t * 2 + k * 5) % 14); let xx = x; for (let i = 0; i < 16; i += 2) { const ny = yy + (Math.random() < 0.5 ? -1 : 1); s.line(xx, yy, xx + 2, ny, H('#f8f080')); xx += 2; } } }
    }
  }

  G.interior = { build, themeFor, animate, drawOverlay, PAINT, floorPixel };
})(window.G);
