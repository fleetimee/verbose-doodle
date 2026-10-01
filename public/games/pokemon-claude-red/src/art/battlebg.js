// Procedural battle backgrounds (320x132) and platforms per environment.
(function (G) {
  'use strict';
  const { Surface, hex, mix, shade, bayer, hash2, rgb } = G.gfx;
  const P = G.PAL, N = G.noise;
  const cache = {};

  function vgrad(s, y0, y1, c0, c1, steps) {
    for (let y = y0; y < y1; y++) {
      const t = (y - y0) / Math.max(1, y1 - y0 - 1);
      for (let x = 0; x < s.w; x++) {
        const q = Math.floor(t * steps + bayer(x, y) * 0.999) / steps;
        s.pset(x, y, mix(c0, c1, Math.min(1, q)));
      }
    }
  }
  function clouds(s, y0, y1, seed, col, shadowCol) {
    for (let k = 0; k < 6; k++) {
      const cx = hash2(k, 1, seed) * 360 - 20, cy = y0 + hash2(k, 2, seed) * (y1 - y0), w = 22 + hash2(k, 3, seed) * 30;
      for (let b = 0; b < 5; b++) {
        const bx = cx + (b - 2) * w * 0.28, by = cy - Math.sin(b / 4 * Math.PI) * w * 0.18, r = w * (0.22 + 0.1 * Math.sin(b / 4 * Math.PI));
        for (let y = Math.floor(by - r); y <= by + r * 0.6; y++) for (let x = Math.floor(bx - r); x <= bx + r; x++) {
          const d = ((x - bx) ** 2 + (y - by) ** 2) / (r * r); if (d > 1) continue;
          s.pset(x, y, (y - by) > r * 0.25 ? shadowCol : col);
        }
      }
    }
  }
  function hills(s, base, amp, freq, seed, col, colHi) {
    for (let x = 0; x < s.w; x++) {
      const h = base - amp * (0.5 + 0.5 * Math.sin(x * freq + seed) * 0.6 + 0.4 * (N.big.at(x * 0.7 + seed * 10, seed) - 0.5));
      for (let y = Math.floor(h); y < s.h; y++) s.pset(x, y, y < h + 2 ? colHi : col);
    }
  }
  function treeLine(s, base, seed, cols) {
    for (let k = -2; k < 26; k++) {
      const cx = k * 14 + hash2(k, 0, seed) * 8, r = 8 + hash2(k, 1, seed) * 5, cy = base - r * 0.6 - hash2(k, 2, seed) * 6;
      for (let y = Math.floor(cy - r); y < s.h; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) {
        if (y < cy) { const d = ((x - cx) ** 2 + (y - cy) ** 2) / (r * r); if (d > 1) continue; }
        else if (Math.abs(x - cx) > r) continue;
        const lit = (x - cx) / r * -0.6 + (y - cy) / r * -0.8;
        s.pset(x, y, lit > 0.35 ? cols[2] : lit > -0.2 ? cols[1] : cols[0]);
      }
    }
  }
  function ground(s, y0, cA, cB, cC, stripe) {
    for (let y = y0; y < s.h; y++) {
      const t = (y - y0) / (s.h - y0);
      for (let x = 0; x < s.w; x++) {
        const band = Math.floor(Math.pow(t, 0.7) * stripe + (N.mid.at(x, y * 2) - 0.5) * 0.8);
        let c = band % 2 ? cA : cB;
        if (N.fine.at(x * 2, y * 3) > 0.83 && bayer(x, y) > 0.5) c = cC;
        s.pset(x, y, c);
      }
    }
  }
  // platform: textured ellipse with rim & drop shadow
  function platform(rx, ry, cols, kind) {
    const w = rx * 2 + 4, h = ry * 2 + 8;
    const s = new Surface(w, h);
    const cx = w / 2, cy = ry + 2;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry, d = dx * dx + dy * dy;
      if (d <= 1) {
        let c = cols[2];
        if (d > 0.82) c = dy > 0 ? cols[0] : cols[3];
        else if (d > 0.6) c = dy > 0 ? cols[1] : cols[2];
        else {
          if (kind === 'grass') { if (hash2(x, y, 5) < 0.12) c = cols[3]; else if (hash2(x, y, 6) < 0.1) c = cols[1]; }
          else if (kind === 'rock') { if (N.mid.at(x * 3, y * 5) > 0.65) c = cols[1]; else if (hash2(x, y, 7) < 0.06) c = cols[3]; }
          else if (kind === 'water') { if (Math.abs(Math.sin(d * 18)) < 0.25) c = cols[3]; }
          else if (kind === 'floor') { if ((x + y * 2) % 12 === 0) c = cols[1]; }
          else if (kind === 'ice') { if ((x - y * 2) % 17 === 0) c = cols[3]; else if (hash2(x, y, 10) < 0.05) c = cols[1]; }
          else if (kind === 'sand') { if (hash2(x, y, 8) < 0.08) c = cols[3]; else if (hash2(x, y, 9) < 0.08) c = cols[1]; }
        }
        s.pset(x, y, c);
      } else {
        // side thickness below the ellipse
        const dy2 = (y + 0.5 - cy - 4) / ry;
        if (dx * dx + dy2 * dy2 <= 1 && y > cy) s.pset(x, y, kind === 'water' ? cols[0] : shade(cols[0], -0.25));
      }
    }
    return s;
  }

  const THEMES = {
    grass: () => {
      const s = new Surface(320, 132);
      vgrad(s, 0, 60, hex('#6cb0f0'), hex('#d8f0ff'), 6);
      clouds(s, 8, 36, 3, hex('#ffffff'), hex('#d8e4f4'));
      hills(s, 56, 16, 0.02, 1, hex('#8cb8b8'), hex('#a8d0c8'));
      hills(s, 64, 10, 0.035, 4, hex('#5a9a70'), hex('#78b880'));
      treeLine(s, 76, 9, [hex('#1f5a3a'), hex('#2f7a44'), hex('#4c9a4c')]);
      ground(s, 74, hex('#7cc05a'), hex('#6cb050'), hex('#9ad870'), 7);
      return { s, ep: platform(62, 14, [hex('#3a7a3a'), hex('#4c9a44'), hex('#62b452'), hex('#8ad466')], 'grass'), pp: platform(76, 16, [hex('#3a7a3a'), hex('#4c9a44'), hex('#62b452'), hex('#8ad466')], 'grass') };
    },
    forest: () => {
      const s = new Surface(320, 132);
      vgrad(s, 0, 132, hex('#1c3a2e'), hex('#2e5a3a'), 6);
      treeLine(s, 40, 2, [hex('#0f2a22'), hex('#163a2a'), hex('#1f4e32')]);
      treeLine(s, 62, 5, [hex('#15382a'), hex('#1f5034'), hex('#2c6a3e')]);
      treeLine(s, 80, 7, [hex('#1a4830'), hex('#27663c'), hex('#3a8446')]);
      ground(s, 80, hex('#3c7a3e'), hex('#346e38'), hex('#58964c'), 6);
      // light shafts
      for (let k = 0; k < 4; k++) { const x0 = 40 + k * 80; for (let y = 0; y < 132; y++) for (let x = x0 + y * 0.4; x < x0 + y * 0.4 + 10; x++) if (bayer(x | 0, y) < 0.3) s.pblend(x, y, hex('#e8f8b0'), 0.25); }
      return { s, ep: platform(62, 14, [hex('#28502c'), hex('#346a36'), hex('#468a44'), hex('#62a852')], 'grass'), pp: platform(76, 16, [hex('#28502c'), hex('#346a36'), hex('#468a44'), hex('#62a852')], 'grass') };
    },
    cave: () => {
      const s = new Surface(320, 132);
      vgrad(s, 0, 132, hex('#16121c'), hex('#3a2e30'), 5);
      for (let y = 0; y < 132; y++) for (let x = 0; x < 320; x++) {
        const n = N.mid.at(x * 1.5, y * 2.5), m = N.big.at(x, y);
        if (y < 70 && n > 0.55 - y / 300) s.pset(x, y, mix(hex('#2a2230'), hex('#4a3c3c'), m * 0.8));
      }
      // stalactites
      for (let k = 0; k < 18; k++) { const x = hash2(k, 1, 4) * 320, l = 8 + hash2(k, 2, 4) * 26, w = 3 + hash2(k, 3, 4) * 4; for (let y = 0; y < l; y++) for (let i = -w * (1 - y / l); i <= w * (1 - y / l); i++) s.pset(x + i, y, i < 0 ? hex('#5a4a44') : hex('#3a302e')); }
      ground(s, 82, hex('#5a4a42'), hex('#4e4038'), hex('#6e5c50'), 5);
      return { s, ep: platform(62, 14, [hex('#3a2e2a'), hex('#54443a'), hex('#6a5848'), hex('#88745e')], 'rock'), pp: platform(76, 16, [hex('#3a2e2a'), hex('#54443a'), hex('#6a5848'), hex('#88745e')], 'rock') };
    },
    water: () => {
      const s = new Surface(320, 132);
      vgrad(s, 0, 58, hex('#58a0e8'), hex('#d0ecff'), 6);
      clouds(s, 6, 34, 11, hex('#ffffff'), hex('#d0dcf0'));
      for (let y = 58; y < 132; y++) for (let x = 0; x < 320; x++) {
        const t = (y - 58) / 74;
        let c = mix(hex('#3a78c8'), hex('#1e4a98'), t);
        const w = Math.sin(x * 0.08 + y * 0.9 + Math.sin(y * 0.3) * 2);
        if (w > 0.9 - t * 0.2) c = hex('#8ac8f8'); else if (w > 0.75) c = mix(c, hex('#6aa8e8'), 0.6);
        s.pset(x, y, c);
      }
      for (let x = 0; x < 320; x++) s.pset(x, 58, hex('#e8f8ff'));
      return { s, ep: platform(60, 12, [hex('#2858a8'), hex('#3a78c8'), hex('#5a98e0'), hex('#a8dcff')], 'water'), pp: platform(74, 14, [hex('#2858a8'), hex('#3a78c8'), hex('#5a98e0'), hex('#a8dcff')], 'water') };
    },
    indoor: () => {
      const s = new Surface(320, 132);
      for (let y = 0; y < 70; y++) for (let x = 0; x < 320; x++) {
        let c = hex('#d8d0c0'); if (y > 60) c = hex('#b8ae9c'); if (x % 40 === 0) c = hex('#c4bca8'); if (y % 20 === 0 && y < 60) c = hex('#e4dccc');
        s.pset(x, y, c);
      }
      for (let y = 70; y < 132; y++) { const t = (y - 70) / 62; for (let x = 0; x < 320; x++) { const px = (x - 160) / (0.4 + t) + 160; const tile = (Math.floor(px / 24) + Math.floor((y - 70) / (6 + t * 10))) % 2; s.pset(x, y, tile ? hex('#a8b8c8') : hex('#98a8b8')); } }
      return { s, ep: platform(62, 14, [hex('#6a7888'), hex('#8898a8'), hex('#a8b8c8'), hex('#d0dce8')], 'floor'), pp: platform(76, 16, [hex('#6a7888'), hex('#8898a8'), hex('#a8b8c8'), hex('#d0dce8')], 'floor') };
    },
    gym: () => {
      const t = THEMES.indoor();
      const s = t.s;
      for (let y = 0; y < 60; y++) for (let x = 0; x < 320; x++) if ((x + y) % 32 < 2) s.pset(x, y, hex('#c0a878'));
      return t;
    },
    tower: () => {
      const s = new Surface(320, 132);
      vgrad(s, 0, 132, hex('#1e1630'), hex('#4a3a5a'), 6);
      for (let y = 0; y < 132; y++) for (let x = 0; x < 320; x++) { const f = N.big.at(x * 0.6 + 40, y * 1.2); if (f > 0.6) s.pblend(x, y, hex('#9a8ab8'), (f - 0.6) * 0.8); }
      ground(s, 84, hex('#4a3e5a'), hex('#40364e'), hex('#5e5070'), 5);
      return { s, ep: platform(62, 14, [hex('#2e2440'), hex('#403456'), hex('#54486a'), hex('#7a6c94')], 'floor'), pp: platform(76, 16, [hex('#2e2440'), hex('#403456'), hex('#54486a'), hex('#7a6c94')], 'floor') };
    },
    mountain: () => {
      const s = new Surface(320, 132);
      vgrad(s, 0, 60, hex('#78a8e0'), hex('#e0eef8'), 6);
      hills(s, 50, 30, 0.03, 7, hex('#8a7a70'), hex('#b0a090'));
      hills(s, 68, 18, 0.05, 2, hex('#a08a70'), hex('#c8b090'));
      ground(s, 78, hex('#c0a882'), hex('#b09a76'), hex('#d8c4a0'), 6);
      return { s, ep: platform(62, 14, [hex('#7a6450'), hex('#96806a'), hex('#b09a80'), hex('#d4c0a0')], 'sand'), pp: platform(76, 16, [hex('#7a6450'), hex('#96806a'), hex('#b09a80'), hex('#d4c0a0')], 'sand') };
    },
    beach: () => {
      const t = THEMES.water();
      ground(t.s, 96, hex('#f0dca0'), hex('#e8d090'), hex('#fff0c0'), 4);
      return { s: t.s, ep: t.ep, pp: platform(76, 16, [hex('#b89860'), hex('#d0b078'), hex('#e8cc90'), hex('#fbeec0')], 'sand') };
    },
    ice: () => {
      const s = new Surface(320, 132);
      vgrad(s, 0, 132, hex('#0e2038'), hex('#2e5e8e'), 6);
      // crystalline back wall
      for (let y = 0; y < 80; y++) for (let x = 0; x < 320; x++) {
        const n = N.mid.at(x * 1.4 + 17, y * 2.2), m = N.big.at(x * 0.8 + 30, y);
        if (n > 0.5 - y / 260) s.pset(x, y, mix(hex('#24507e'), hex('#5e96c4'), Math.floor(m * 4) / 4));
        if (n > 0.5 - y / 260 && n < 0.53 - y / 260) s.pset(x, y, hex('#9ccbe8'));
      }
      // icicles with a bright leading edge
      for (let k = 0; k < 22; k++) {
        const x = hash2(k, 1, 14) * 320, l = 10 + hash2(k, 2, 14) * 30, w = 2.5 + hash2(k, 3, 14) * 4;
        for (let y = 0; y < l; y++) { const hw = w * (1 - y / l); for (let i = Math.round(-hw); i <= Math.round(hw); i++) s.pset(x + i, y, i === Math.round(-hw) ? hex('#f0fbff') : i < 0 ? hex('#a8d8f4') : hex('#5a96c6')); }
      }
      ground(s, 82, hex('#b4d8ee'), hex('#a4cce6'), hex('#eef9ff'), 5);
      for (let k = 0; k < 60; k++) { const x = hash2(k, 5, 15) * 320 | 0, y = hash2(k, 6, 15) * 132 | 0; s.pset(x, y, hex('#ffffff')); if (k % 3 === 0) { s.pset(x - 1, y, hex('#c8ecff')); s.pset(x + 1, y, hex('#c8ecff')); s.pset(x, y - 1, hex('#c8ecff')); s.pset(x, y + 1, hex('#c8ecff')); } }
      const pc = [hex('#4e86b0'), hex('#7eb4d8'), hex('#aad8f0'), hex('#eaf8ff')];
      return { s, ep: platform(62, 14, pc, 'ice'), pp: platform(76, 16, pc, 'ice') };
    },
    cavewater: (arg) => {
      const ice = arg === 'ice';
      const s = (ice ? THEMES.ice() : THEMES.cave()).s;
      const c0 = hex(ice ? '#3a7ab0' : '#24485a'), c1 = hex(ice ? '#143866' : '#0c1c28'), hl = hex(ice ? '#b0e4ff' : '#5a8ca0');
      for (let y = 70; y < 132; y++) for (let x = 0; x < 320; x++) {
        const t = (y - 70) / 62;
        let c = mix(c0, c1, Math.floor(t * 5 + bayer(x, y)) / 5);
        const w = Math.sin(x * 0.08 + y * 0.9 + Math.sin(y * 0.3) * 2);
        if (w > 0.92 - t * 0.2) c = hl; else if (w > 0.78) c = mix(c, hl, 0.35);
        s.pset(x, y, c);
      }
      for (let x = 0; x < 320; x++) s.pset(x, 70, hl);
      const pc = ice ? [hex('#1e4a86'), hex('#3a7ab0'), hex('#62a4d4'), hex('#c0ecff')] : [hex('#0e2a38'), hex('#1e4a5a'), hex('#34707e'), hex('#7ab4c0')];
      return { s, ep: platform(60, 12, pc, 'water'), pp: platform(74, 14, pc, 'water') };
    },
    power: () => {
      const s = new Surface(320, 132);
      for (let y = 0; y < 80; y++) for (let x = 0; x < 320; x++) {
        const px = x % 40, py = y % 26;
        let c = hex('#343c48');
        if (px === 0 || py === 0) c = hex('#1c2029'); else if (px === 1 || py === 1) c = hex('#4c5664');
        else if ((px === 4 || px === 35) && (py === 4 || py === 21)) c = hex('#7a8494');
        else if (N.fine.at(x * 2, y * 3) > 0.8) c = hex('#3a4250');
        s.pset(x, y, c);
      }
      for (const [y0, r, lit, mid, dk] of [[18, 3, '#d8a860', '#a87838', '#5a3e1e'], [50, 2, '#9aa8b8', '#6a7888', '#3a4450']]) {
        for (let x = 0; x < 320; x++) for (let dy = -r; dy <= r; dy++) s.pset(x, y0 + dy, hex(dy < -r + 1 ? lit : dy < 1 ? mid : dk));
        for (let x = 12; x < 320; x += 48) for (let dy = -r - 1; dy <= r + 1; dy++) { s.pset(x, y0 + dy, hex(dk)); s.pset(x + 1, y0 + dy, hex(lit)); }
      }
      for (let y = 74; y < 80; y++) for (let x = 0; x < 320; x++) s.pset(x, y, ((x + y) >> 2) & 1 ? hex('#e8c020') : hex('#1a1a1c'));
      // arcing electricity between conduits
      for (let k = 0; k < 3; k++) {
        let x = 50 + k * 110, y = 22;
        while (y < 47) { const nx = x + ((hash2(k, y, 21) * 5) | 0) - 2; for (let i = 0; i < 3; i++) { s.pblend(x - 1, y + i, hex('#58b8ff'), 0.5); s.pblend(x + 1, y + i, hex('#58b8ff'), 0.5); s.pset(x, y + i, hex('#e8f8ff')); } x = nx; y += 3; }
      }
      ground(s, 80, hex('#4a525e'), hex('#424954'), hex('#6a7482'), 5);
      for (let y = 80; y < 132; y++) for (let x = 0; x < 320; x++) if ((x + (y - 80) * 3) % 64 === 0 || (y - 80) % 14 === 0) s.pset(x, y, hex('#363c46'));
      const pc = [hex('#262c34'), hex('#3c4450'), hex('#56606e'), hex('#8a96a6')];
      return { s, ep: platform(62, 14, pc, 'floor'), pp: platform(76, 16, pc, 'floor') };
    },
    mansion: () => {
      const s = new Surface(320, 132);
      for (let y = 0; y < 84; y++) for (let x = 0; x < 320; x++) {
        let c = (x >> 3) & 1 ? hex('#6a3a3c') : hex('#5c3236');
        if (x % 16 === 4 && y % 12 === 6) c = hex('#8a5a4a');
        if (y >= 62) c = y === 62 ? hex('#a07a52') : y === 63 ? hex('#2a1c14') : (x % 24 === 0 ? hex('#3a281c') : hex('#4e3624'));
        const burn = N.big.at(x * 0.9 + 11, y * 1.4);
        if (burn > 0.6) c = mix(c, hex('#1a1210'), Math.min(1, Math.floor((burn - 0.6) * 10) / 4));
        s.pset(x, y, c);
      }
      // cracks
      for (let k = 0; k < 7; k++) { let x = hash2(k, 1, 31) * 320, y = hash2(k, 2, 31) * 40; for (let i = 0; i < 18; i++) { s.pset(x, y, hex('#1a1210')); x += hash2(k, i, 32) < 0.5 ? 1 : 0; y += 1; } }
      ground(s, 84, hex('#6a4e38'), hex('#5e4430'), hex('#8a6a4a'), 6);
      for (let y = 84; y < 132; y++) for (let x = 0; x < 320; x++) if ((y - 84) % 9 === 0) s.pset(x, y, hex('#46321f'));
      const pc = [hex('#3a2a1e'), hex('#56402c'), hex('#6e5438'), hex('#94744e')];
      return { s, ep: platform(62, 14, pc, 'floor'), pp: platform(76, 16, pc, 'floor') };
    },
    elite: (tint) => {
      const s = new Surface(320, 132);
      const c = hex(tint || '#6a4a9a');
      vgrad(s, 0, 132, shade(c, -0.55), shade(c, -0.1), 6);
      for (let k = 0; k < 8; k++) { const x0 = k * 44 + 10; for (let y = 0; y < 90; y++) { s.pset(x0, y, shade(c, 0.2)); s.pset(x0 + 1, y, shade(c, 0.35)); s.pset(x0 + 2, y, shade(c, -0.3)); } }
      ground(s, 86, shade(c, -0.35), shade(c, -0.42), shade(c, -0.15), 5);
      const pc = [shade(c, -0.6), shade(c, -0.4), shade(c, -0.2), shade(c, 0.1)];
      return { s, ep: platform(62, 14, pc, 'floor'), pp: platform(76, 16, pc, 'floor') };
    },
  };
  G.battleBg = function (name) {
    if (cache[name]) return cache[name];
    const [base, arg] = String(name).split(':');
    const f = THEMES[base] || THEMES.grass;
    return (cache[name] = f(arg));
  };
})(window.G);
