// Ambient environmental effects drawn over the overworld: cloud shadows, wildlife, leaves, mist, dust, sparks.
(function (G) {
  'use strict';
  const { hex, mix, rgb, bayer } = G.gfx;
  const P = G.PAL, N = G.noise;
  let state = { map: null, parts: [] };
  const CLOUD = rgb(196, 204, 232);

  function env(map) {
    const n = map.name;
    if (/^PokemonTower/.test(n)) return 'tower';
    if (/^Lavender/.test(n)) return 'lavender';
    if (/Seafoam/.test(n)) return 'ice';
    if (/PowerPlant/.test(n)) return 'power';
    if (/MtMoon|RockTunnel|Cave|VictoryRoad|Diglett/.test(n)) return 'cave';
    if (/ViridianForest/.test(n)) return 'forest';
    if (/SafariZone/.test(n)) return 'safari';
    if (/Mansion/.test(n)) return 'mansion';
    if (map.outdoor) return 'outdoor';
    return 'indoor';
  }
  const rand = (a, b) => a + Math.random() * (b - a);

  // ---- day / night ----
  G.timeOfDay = function () {
    const opt = G.state && G.state.options; if (opt && opt.dayNight === false) return { night: 0, dusk: 0 };
    let h = G.forceHour !== undefined ? G.forceHour : (() => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; })();
    const night = h >= 20 || h < 5 ? 1 : h >= 18 ? (h - 18) / 2 : h < 7 ? 1 - (h - 5) / 2 : 0;
    const dusk = h >= 16.5 && h < 20 ? Math.sin(Math.min(1, (h - 16.5) / 3) * Math.PI) : h >= 5 && h < 7.5 ? Math.sin(((h - 5) / 2.5) * Math.PI) * 0.7 : 0;
    return { night: Math.max(0, Math.min(1, night)), dusk };
  };
  function dayNight(s, ow, cx, cy) {
    if (!ow.map.outdoor && ow.map.tsFile !== 'forest') return;
    const td = G.timeOfDay(); if (td.night <= 0.01 && td.dusk <= 0.01) return;
    const d = s.data;
    const n = td.night * 0.8, du = td.dusk * 0.4;
    // multiplicative grade toward cool moonlit night / warm dusk
    const mr = Math.round(255 * (1 - n * 0.68) * (1 - du * 0.02)), mg = Math.round(255 * (1 - n * 0.6) * (1 - du * 0.2)), mb = Math.round(255 * (1 - n * 0.3) * (1 - du * 0.45));
    for (let i = 0; i < d.length; i++) {
      const c = d[i];
      d[i] = (0xff000000 | ((((c >>> 16) & 255) * mb) >> 8) << 16 | ((((c >>> 8) & 255) * mg) >> 8) << 8 | (((c & 255) * mr) >> 8)) >>> 0;
    }
    if (td.night > 0.3) {
      const R = ow.render, a = Math.min(1, (td.night - 0.3) * 1.6);
      // light pools: max-combined radial falloff in a light buffer, quantised to 4 dithered steps (no stacked rings)
      let any = false; LY0 = 180; LY1 = -1; LX0 = 320; LX1 = -1;
      const collect = (L, ox, oy) => {
        for (const l of L) {
          const x = l.x - ox, y = l.y - oy; if (x < -34 || y < -30 || x > 354 || y > 210) continue;
          any = true;
          if (l.k === 'fire') splat(x, y + 8, 30, 18, 0.95 + 0.05 * Math.sin(ow.t * 0.23 + l.x), LIGHT_COL.fire);
          else splat(x, y + 6, 20, 12, 0.8, LIGHT_COL[l.k] || LIGHT_COL.def);
          if (l.k === 'window') s.rectBlend(x - 4, y - 3, 9, 6, hex('#ffe8a8'), 0.75 * a);
        }
      };
      const mx = G.mapRender.MX * 16, my = G.mapRender.MY * 16;
      if (R && R.lights) collect(R.lights, cx + mx, cy + my);
      for (const nb of ow.neighbors || []) if (nb.R && nb.R.lights) collect(nb.R.lights, cx - nb.c.ox * 16 + mx, cy - nb.c.oy * 16 + my);
      if (any) {
        const T = Math.round(0.62 * a * 64); // per-step blend weight (/256), 4 steps
        for (let y = LY0; y <= LY1; y++) {
          const row = y * 320, br = (y & 3) * 4;
          for (let x = LX0; x <= LX1; x++) {
            const i = row + x, v = LBUF[i]; if (v === 0) continue; LBUF[i] = 0;
            let q = (v * 4 + BAY[br + (x & 3)]) | 0; if (q <= 0) continue; if (q > 4) q = 4;
            const t = q * T, c = d[i], L = LCOL[i];
            const r = c & 255, g = (c >>> 8) & 255, b = (c >>> 16) & 255;
            const sr = 255 - (((255 - r) * (255 - (L & 255))) >> 8), sg = 255 - (((255 - g) * (255 - ((L >>> 8) & 255))) >> 8), sb = 255 - (((255 - b) * (255 - ((L >>> 16) & 255))) >> 8);
            d[i] = (0xff000000 | ((b + (((sb - b) * t) >> 8)) << 16) | ((g + (((sg - g) * t) >> 8)) << 8) | (r + (((sr - r) * t) >> 8))) >>> 0;
          }
        }
      }
    }
  }
  const LBUF = new Float32Array(320 * 180), LCOL = new Uint32Array(320 * 180); let LY0 = 180, LY1 = -1, LX0 = 320, LX1 = -1;
  const BAY = new Float32Array(16); for (let k = 0; k < 16; k++) BAY[k] = bayer(k & 3, k >> 2);
  const LIGHT_COL = { sign_poke: hex('#ff9a9a'), sign_mart: hex('#a8c8ff'), fire: hex('#ff9a48'), def: hex('#ffd48a') };
  function splat(x0, y0, rx, ry, k, col) {
    const xa = Math.max(0, Math.floor(x0 - rx)), xb = Math.min(319, Math.ceil(x0 + rx)), ya = Math.max(0, Math.floor(y0 - ry)), yb = Math.min(179, Math.ceil(y0 + ry));
    if (ya < LY0) LY0 = ya; if (yb > LY1) LY1 = yb; if (xa < LX0) LX0 = xa; if (xb > LX1) LX1 = xb;
    for (let y = ya; y <= yb; y++) {
      const dy = (y + 0.5 - y0) / ry, dy2 = dy * dy; if (dy2 >= 1) continue;
      for (let x = xa; x <= xb; x++) {
        const dx = (x + 0.5 - x0) / rx, dd = dx * dx + dy2; if (dd >= 1) continue;
        const v = k * (1 - dd) * (1 - dd), i = y * 320 + x;
        if (v > LBUF[i]) { LBUF[i] = v; LCOL[i] = col; }
      }
    }
  }
  G.ambient = function (s, ow, cx, cy) {
    G.ambientInner(s, ow, cx, cy);
    dayNight(s, ow, cx, cy);
    for (const p of state.parts) if (p.kind === 'firefly') {
      const sx = Math.round(p.x - cx), sy = Math.round(p.y - cy), glow = 0.5 + 0.5 * Math.sin(p.age * 0.12 + p.ph);
      const fade = Math.min(1, p.age / 30, (p.life - p.age) / 30);
      s.ellipseBlend(sx, sy, 4, 4, hex('#d8ff70'), 0.18 * glow * fade); s.pblend(sx, sy, hex('#f8ffc0'), glow * fade);
    }
  };
  G.ambientInner = function (s, ow, cx, cy) {
    const m = ow.map, e = env(m), t = ow.t;
    if (state.map !== m.name) { state = { map: m.name, parts: [], env: e }; }
    const d = s.data;
    // --- cloud shadows (outdoors) ---
    if ((e === 'outdoor' || e === 'safari' || e === 'lavender') && G.timeOfDay().night < 0.5) {
      const ox = Math.floor(t * 0.18), oy = Math.floor(t * 0.07);
      const nd = N.big.data, nm = N.big.mask, ns = N.big.size;
      for (let y = 0; y < 180; y++) {
        const row = ((((cy + y) >> 2) + oy) & nm) * ns;
        for (let x = 0; x < 320; x++) {
          const v = nd[row + ((((cx + x) >> 2) + ox) & nm)];
          if (v > 0.68 || (v > 0.665 && ((x + y) & 1))) {
            const i = y * 320 + x, c = d[i];
            d[i] = (0xff000000 | (((((c >>> 16) & 255) * 232) >> 8) << 16) | (((((c >>> 8) & 255) * 204) >> 8) << 8) | (((c & 255) * 196) >> 8)) >>> 0;
          }
        }
      }
    }
    // --- particles per environment ---
    const parts = state.parts;
    const spawn = (o) => parts.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, life: 200, age: 0 }, o));
    const nightNow = G.timeOfDay().night;
    if ((e === 'outdoor' || e === 'safari' || e === 'forest') && nightNow > 0.5 && parts.length < 14 && t % 20 === 0) {
      spawn({ kind: 'firefly', x: cx + rand(0, 320), y: cy + rand(0, 180), life: 360, ph: rand(0, 6) });
    } else if ((e === 'outdoor' || e === 'safari') && nightNow < 0.5 && parts.length < 6 && t % 40 === 0 && Math.random() < 0.6) {
      // butterflies near flowers/grass
      spawn({ kind: 'fly', x: cx + rand(20, 300), y: cy + rand(20, 160), life: 400, c: [hex('#f8f8f8'), hex('#f8d850'), hex('#f898c8')][Math.floor(rand(0, 3))], ph: rand(0, 6) });
    }
    if (e === 'forest' || e === 'safari') {
      if (t % 14 === 0 && parts.length < 30) spawn({ kind: 'leaf', x: cx + rand(-20, 340), y: cy - 10, vx: rand(0.1, 0.5), vy: rand(0.25, 0.55), life: 500, ph: rand(0, 6), c: [P.leaf[5], P.leaf[6], hex('#d8b048')][Math.floor(rand(0, 3))] });
    }
    if (e === 'cave' || e === 'mansion') {
      if (t % 10 === 0 && parts.length < 40) spawn({ kind: 'dust', x: cx + rand(0, 320), y: cy + rand(0, 180), vx: rand(-0.1, 0.1), vy: rand(-0.12, -0.02), life: 240, c: hex('#e8d8b8') });
    }
    if (e === 'ice') { if (t % 6 === 0 && parts.length < 50) spawn({ kind: 'snow', x: cx + rand(-20, 340), y: cy - 6, vx: rand(-0.3, 0.1), vy: rand(0.3, 0.7), life: 400, ph: rand(0, 6), c: hex('#f4faff') }); }
    if (e === 'tower' || e === 'lavender') { if (t % 30 === 0 && parts.length < 10) spawn({ kind: 'wisp', x: cx + rand(0, 320), y: cy + rand(40, 180), vx: rand(-0.15, 0.15), vy: rand(-0.35, -0.15), life: 260, ph: rand(0, 6), c: hex('#c8b0f8') }); }
    if (e === 'power') { if (t % 25 === 0 && Math.random() < 0.6) spawn({ kind: 'spark', x: cx + rand(0, 320), y: cy + rand(0, 180), life: 10, c: hex('#fff8a0') }); }
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.age++;
      if (p.age > p.life) { parts.splice(i, 1); continue; }
      const sx = Math.round(p.x - cx), sy = Math.round(p.y - cy);
      if (p.kind === 'fly') {
        p.x += Math.sin(p.age * 0.05 + p.ph) * 0.6 + 0.15; p.y += Math.cos(p.age * 0.07 + p.ph) * 0.4;
        const flap = Math.floor(p.age / 4) % 2;
        s.pset(sx, sy, P.outline);
        if (flap) { s.pset(sx - 1, sy - 1, p.c); s.pset(sx + 1, sy - 1, p.c); } else { s.pset(sx - 1, sy, p.c); s.pset(sx + 1, sy, p.c); }
        s.pmul(sx + 1, sy + 6, rgb(170, 170, 200));
      } else if (p.kind === 'leaf') {
        p.x += p.vx + Math.sin(p.age * 0.05 + p.ph) * 0.4; p.y += p.vy;
        const fl = Math.floor(p.age / 8) % 2;
        s.pset(sx, sy, p.c); s.pset(sx + (fl ? 1 : -1), sy, G.gfx.shade(p.c, -0.3));
      } else if (p.kind === 'dust') {
        p.x += p.vx; p.y += p.vy;
        const a = Math.sin(p.age / p.life * Math.PI) * 0.5;
        s.pblend(sx, sy, p.c, a);
      } else if (p.kind === 'snow') {
        p.x += p.vx + Math.sin(p.age * 0.04 + p.ph) * 0.3; p.y += p.vy;
        s.pset(sx, sy, p.c); if (p.age % 30 < 15) s.pblend(sx + 1, sy, p.c, 0.5);
      } else if (p.kind === 'wisp') {
        p.x += p.vx + Math.sin(p.age * 0.03 + p.ph) * 0.3; p.y += p.vy;
        const a = Math.sin(p.age / p.life * Math.PI);
        s.ellipseBlend(sx, sy, 3, 3, p.c, 0.25 * a); s.pblend(sx, sy, hex('#ffffff'), 0.7 * a);
      } else if (p.kind === 'firefly') {
        p.x += Math.sin(p.age * 0.03 + p.ph) * 0.35; p.y += Math.cos(p.age * 0.041 + p.ph) * 0.25;
        const glow = 0.5 + 0.5 * Math.sin(p.age * 0.12 + p.ph);
        p.late = true; // drawn after night grading
      } else if (p.kind === 'spark') {
        if (p.age % 3 !== 2) { s.line(sx, sy, sx + rand(-6, 6), sy + rand(-6, 6), p.c); s.pset(sx, sy, hex('#ffffff')); }
      }
    }
    // --- full-screen grading ---
    if (e === 'lavender' || e === 'tower') {
      const tr = e === 'tower' ? 190 : 225, tg = e === 'tower' ? 175 : 215, tb = e === 'tower' ? 225 : 240;
      const fr = 0xb8, fg = 0xa8, fb = 0xd0;
      const nd = N.big.data, nm = N.big.mask, ns = N.big.size;
      const tx = t >> 2, ty = t >> 3;
      for (let y = 0; y < 180; y++) {
        const ny = ((((cy + y) >> 1) + ty) & nm) * ns;
        for (let x = 0; x < 320; x++) {
          const i = y * 320 + x, c = d[i];
          let r = ((c & 255) * tr) >> 8, g = (((c >>> 8) & 255) * tg) >> 8, b = (((c >>> 16) & 255) * tb) >> 8;
          const f = nd[ny + ((((cx + x) >> 1) + tx) & nm)];
          if (f > 0.55) { const k = Math.min(0.35, (f - 0.55) * 1.4); r = (r + (fr - r) * k) | 0; g = (g + (fg - g) * k) | 0; b = (b + (fb - b) * k) | 0; }
          d[i] = (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;
        }
      }
    }
    if (e === 'cave' || e === 'tower' || e === 'mansion' || e === 'ice') {
      // soft vignette
      const cxp = 160, cyp = 90, strength = e === 'tower' ? 0.75 : 0.5, dark = e === 'ice' ? hex('#20304a') : hex('#0d0a12');
      const dr = dark & 255, dg = (dark >>> 8) & 255, db = (dark >>> 16) & 255;
      for (let y = 0; y < 180; y++) {
        const yy = (y - cyp) / 120;
        for (let x = 0; x < 320; x++) {
          const xx = (x - cxp) / 190, r2 = xx * xx + yy * yy;
          if (r2 < 0.3844) continue;
          const k = Math.min(1, (Math.sqrt(r2) - 0.62) * 1.6) * strength;
          const i = y * 320 + x, c = d[i];
          const r = c & 255, g = (c >>> 8) & 255, b = (c >>> 16) & 255;
          d[i] = (0xff000000 | (((b + (db - b) * k) | 0) << 16) | (((g + (dg - g) * k) | 0) << 8) | ((r + (dr - r) * k) | 0)) >>> 0;
        }
      }
    }
    if (e === 'ice') { for (let i = 0; i < d.length; i += 1) d[i] = mix(d[i], hex('#dceeff'), 0.08); }
  };
})(window.G);
