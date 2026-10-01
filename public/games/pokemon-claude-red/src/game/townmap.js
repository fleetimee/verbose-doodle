// Town Map: a Kanto minimap generated from the real terrain of every outdoor map. Also the Fly picker.
(function (G) {
  'use strict';
  const { Surface, hex, shade, mix, bayer } = G.gfx;
  const P = G.PAL, F = G.font;
  const TOWNS = ['PalletTown', 'ViridianCity', 'PewterCity', 'CeruleanCity', 'LavenderTown', 'VermilionCity', 'CeladonCity', 'FuchsiaCity', 'CinnabarIsland', 'IndigoPlateau', 'SaffronCity'];
  let cache = null;
  let SC = 2; // cells per map pixel (chosen so the map fits the screen at 1x)

  function build() {
    const outs = Object.keys(G.MAPDATA.maps).filter(n => ['overworld', 'plateau'].includes(G.MAPDATA.maps[n].ts)).map(n => G.maps.getMap(n)).filter(m => m.world);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const m of outs) { x0 = Math.min(x0, m.world.x); y0 = Math.min(y0, m.world.y); x1 = Math.max(x1, m.world.x + m.w); y1 = Math.max(y1, m.world.y + m.h); }
    SC = (y1 - y0) / 158;
    const W = Math.ceil((x1 - x0) / SC) + 8, H = Math.ceil((y1 - y0) / SC) + 8;
    const kind = new Uint8Array(W * H); // 0 none 1 water 2 tree 3 grass 4 path 5 town 6 rock
    const K = { water: 1, bridge: 1, tree: 2, tree2: 2, cut_tree: 2, grass: 3, tall_grass: 3, flowers: 3, path: 4, path_t: 4, path_tufts: 4, sand: 4, pavement: 4, curb: 4, stairs_wood: 4, fence: 4, sign: 4,
      roof_house: 5, roof_flat: 5, wall: 5, window: 5, door: 5, sign_poke: 5, sign_mart: 5, sign_gym: 5, cliff: 6, cliff_top: 6, ledge_d: 3, ledge_l: 3, ledge_r: 3, cave_door: 6, pillar: 5, statue: 5 };
    const where = {};
    for (const m of outs) {
      const votes = {};
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
        const k = K[m.label(x, y)] || 3;
        const mx = Math.floor((m.world.x + x - x0) / SC) + 4, my = Math.floor((m.world.y + y - y0) / SC) + 4;
        const key = mx + ',' + my;
        (votes[key] = votes[key] || [0, 0, 0, 0, 0, 0, 0])[k] += k === 5 ? 3 : 1;
      }
      for (const key in votes) {
        const [mx, my] = key.split(',').map(Number), v = votes[key];
        let best = 0; for (let k = 1; k < 7; k++) if (v[k] > v[best]) best = k;
        kind[my * W + mx] = best;
      }
      where[m.name] = { x: Math.floor((m.world.x + m.w / 2 - x0) / SC) + 4, y: Math.floor((m.world.y + m.h / 2 - y0) / SC) + 4, m };
    }
    // fill gaps between maps with the nearest terrain class (multi-source BFS): sea spreads from water routes
    const land = new Uint8Array(kind);
    const q = [];
    for (let i = 0; i < land.length; i++) if (land[i]) { q.push(i); if (land[i] !== 1) land[i] = land[i]; }
    const cls = new Uint8Array(W * H); for (let i = 0; i < land.length; i++) cls[i] = land[i] === 1 ? 1 : land[i] ? 7 : 0;
    for (let qi = 0; qi < q.length; qi++) {
      const i = q[qi], x = i % W, y = (i / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny * W + nx; if (cls[j]) continue;
        cls[j] = cls[i]; q.push(j);
      }
    }
    for (let i = 0; i < land.length; i++) if (!land[i]) land[i] = cls[i] || 1;
    const s = new Surface(W, H);
    const COL = [0, hex('#3c78c8'), hex('#2e6a3e'), hex('#62a852'), hex('#d8c08a'), hex('#e05a4a'), hex('#9a7a5a'), hex('#4e8a4a')];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const k = land[y * W + x];
      let c = COL[k];
      if (k === 1) { if ((x + y * 3) % 11 === 0) c = hex('#5a98e0'); }
      else { const up = land[(y - 1) * W + x] || 1; if (up === 1) c = shade(c, 0.2); }
      if (k !== 1) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { if ((land[(y + dy) * W + x + dx] || 1) === 1) { c = mix(c, hex('#f0e0b0'), 0.55); break; } }
      s.pset(x, y, c);
    }
    cache = { s, where, W, H };
    return cache;
  }

  G.townMapScreen = function* (o) {
    o = o || {};
    const tm = cache || build();
    const S = G.state;
    const cur = G.ow && G.ow.map.outdoor ? G.ow.map.name : S.lastOutdoor;
    let sel = o.fly ? Math.max(0, o.options.indexOf(cur)) : 0;
    const scale = 1;
    const scene = { opaque: true, t: 0, done: false, result: null, update(f) {
      this.t++; if (!f) return;
      const I = G.input;
      if (o.fly) {
        if (I.repeat('up') || I.repeat('left')) { sel = (sel + o.options.length - 1) % o.options.length; G.sfx && G.sfx('cursor'); }
        if (I.repeat('down') || I.repeat('right')) { sel = (sel + 1) % o.options.length; G.sfx && G.sfx('cursor'); }
        if (I.pressed.a) { this.result = o.options[sel]; this.done = true; }
      } else if (I.pressed.a) this.done = true;
      if (I.pressed.b) { this.result = null; this.done = true; }
    }, draw(s) {
      G.menuBg(s, '#3a5a8a', '#34527e', this.t);
      const mw = Math.round(tm.W * scale), mh = Math.round(tm.H * scale);
      const mx = 8, my = Math.round((180 - mh) / 2);
      G.ui.frame(s, mx - 6, my - 6, mw + 12, mh + 12, 'gray', null);
      s.blit(tm.s, mx, my);
      // town markers
      for (const n of TOWNS) {
        const w = tm.where[n]; if (!w) continue;
        const x = mx + Math.round(w.x * scale), y = my + Math.round(w.y * scale);
        const visited = S.visited && S.visited[n];
        s.rect(x - 2, y - 2, 5, 5, P.outline); s.rect(x - 1, y - 1, 3, 3, visited ? hex('#f8f0d0') : hex('#b0a890'));
      }
      // player marker / fly cursor
      const target = o.fly ? o.options[sel] : cur;
      const w = tm.where[target];
      if (w) {
        const x = mx + Math.round(w.x * scale), y = my + Math.round(w.y * scale);
        if (Math.floor(this.t / 12) % 2 === 0 || o.fly) {
          if (o.fly) { s.circle(x, y, 5 + (this.t >> 3) % 2, hex('#f8d048')); s.circle(x, y, 4, P.outline); }
          else { s.disc(x, y - 1, 3, hex('#e04848')); s.pset(x, y - 2, P.white); }
        }
      }
      // info panel
      const px = mx + mw + 14, pw = 320 - px - 6;
      G.ui.frame(s, px, 8, pw, 40);
      G.ui.text(s, o.fly ? 'FLY to where?' : 'TOWN MAP', px + 10, 14);
      const nm = target ? G.mapDisplayName(G.maps.getMap(target)) : '';
      G.ui.text(s, nm, px + 10, 30, hex('#c04040'));
      G.ui.frame(s, px, 52, pw, 120);
      const lines = F.wrap(o.fly ? 'Choose a town you have visited. A: fly  B: cancel' : 'KANTO region. Your location blinks in red.', pw - 20);
      lines.forEach((l, i) => G.ui.text(s, l, px + 10, 60 + i * 14));
    } };
    return yield* G.engine.run(scene);
  };
  G.showTownMap = function* () { yield* G.townMapScreen({}); };
})(window.G);
