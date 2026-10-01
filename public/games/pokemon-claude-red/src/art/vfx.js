// Battle visual effects: particles, beams, lightning, shockwaves and per-move animation recipes.
(function (G) {
  'use strict';
  const { hex, mix, shade, rgb } = G.gfx;
  const P = G.PAL;
  const W = G.engine.wait;
  const rand = (a, b) => a + Math.random() * (b - a);
  const C = s => hex(s);
  const WHITE = hex('#ffffff');

  function center(sc, k) { return k === 'e' ? { x: G.E_POS.x, y: G.E_POS.y - 28 } : { x: G.P_POS.x, y: G.P_POS.y - 34 }; }
  function other(k) { return k === 'e' ? 'p' : 'e'; }

  // ---------- particle system ----------
  function particle(sc, o) {
    const p = Object.assign({ x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0, drag: 1, life: 30, age: 0, size: 1, shape: 'dot', cols: [WHITE], spin: 0, rot: 0 }, o);
    sc.fx.push({
      layer: o.layer,
      draw(s) {
        if (p.delay > 0) { p.delay--; return true; }
        p.age++;
        if (p.age > p.life) return false;
        p.vx = (p.vx + p.ax) * p.drag; p.vy = (p.vy + p.ay) * p.drag; p.x += p.vx; p.y += p.vy; p.rot += p.spin;
        if (p.onUpdate) p.onUpdate(p);
        const t = p.age / p.life;
        const c = p.cols[Math.min(p.cols.length - 1, Math.floor(t * p.cols.length))];
        const gl = p.glow !== undefined ? p.glow : GLOWY[p.shape];
        if (gl) { const r = p.size * 1.8 + 2; s.ellipseBlend(p.x, p.y, r, r, c, gl * (1 - t * 0.5)); }
        drawShape(s, p.shape, p.x, p.y, p.size * (p.grow ? 1 + t * p.grow : 1) * (p.shrink ? 1 - t * p.shrink : 1), c, p.rot, t);
        return true;
      },
    });
    return p;
  }
  const GLOWY = { flame: 0.28, spark: 0.3, star: 0.25, bubble: 0.12, shard: 0.2, note: 0.15 };
  function drawShape(s, shape, x, y, sz, c, rot, t) {
    x = Math.round(x); y = Math.round(y);
    switch (shape) {
      case 'dot': if (sz <= 1) s.pset(x, y, c); else s.disc(x, y, sz / 2, c); break;
      case 'spark': s.pset(x, y, c); s.pset(x + 1, y, c); s.pset(x - 1, y, c); s.pset(x, y + 1, c); s.pset(x, y - 1, c); s.pset(x, y, WHITE); break;
      case 'star': { const r = Math.max(2, sz); for (let i = -r; i <= r; i++) { s.pset(x + i, y, c); s.pset(x, y + i, c); } for (let i = -r / 2; i <= r / 2; i++) { s.pset(x + i, y + i, c); s.pset(x + i, y - i, c); } s.pset(x, y, WHITE); break; }
      case 'ring': s.circle(x, y, Math.max(1, sz), c); break;
      case 'bubble': { const r = Math.max(1.5, sz); s.circle(x, y, r, c); s.pset(Math.round(x - r * 0.4), Math.round(y - r * 0.4), WHITE); break; }
      case 'flame': { const r = Math.max(1.5, sz); for (let j = -r * 1.6; j <= r; j++) for (let i = -r; i <= r; i++) { const k = j < 0 ? (i * i) / (r * r) + (j * j) / (r * r * 2.6) : (i * i + j * j) / (r * r); if (k <= 1) s.pset(x + i, y + j, k < 0.3 ? hex('#fff8c0') : k < 0.65 ? hex('#f8c030') : c); } break; }
      case 'leaf': { const a = rot, L = Math.max(3, Math.round(sz * 1.6)); for (let i = -L; i <= L; i++) { const w = Math.round((1 - Math.abs(i) / (L + 0.5)) * L * 0.5); for (let j = -w; j <= w; j++) { const px = x + Math.round(i * Math.cos(a) - j * Math.sin(a)), py = y + Math.round(i * Math.sin(a) + j * Math.cos(a)); s.pset(px, py, j === 0 ? shade(c, -0.35) : (j < 0 ? shade(c, 0.15) : c)); } } break; }
      case 'snow': { const r = Math.max(1, Math.round(sz)); for (let i = -r; i <= r; i++) { s.pset(x + i, y, c); s.pset(x, y + i, c); } if (r > 1) { s.pset(x - 1, y - 1, c); s.pset(x + 1, y + 1, c); s.pset(x + 1, y - 1, c); s.pset(x - 1, y + 1, c); } s.pset(x, y, WHITE); break; }
      case 'rock': { const r = Math.max(2, sz); for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const d = (i * i + j * j) / (r * r); if (d <= 1) s.pset(x + i, y + j, d > 0.6 ? shade(c, -0.35) : (i + j < -1 ? shade(c, 0.25) : c)); } break; }
      case 'note': { s.rect(x, y, 2, 2, c); s.vline(x + 1, y - 5, y, c); s.pset(x + 2, y - 5, c); s.pset(x + 3, y - 4, c); break; }
      case 'z': G.font.draw(s, 'Z', x, y, c, shade(c, -0.5)); break;
      case 'coin': s.disc(x, y, 2.5, hex('#f8d048')); s.pset(x - 1, y - 1, WHITE); s.pset(x + 1, y + 1, hex('#c89020')); break;
      case 'seed': s.disc(x, y, 1.6, hex('#8a5a2a')); s.pset(x - 1, y - 1, hex('#d8a060')); break;
      case 'needle': { const a = rot; for (let i = -3; i <= 3; i++) s.pset(x + Math.round(i * Math.cos(a)), y + Math.round(i * Math.sin(a)), i > 1 ? WHITE : c); break; }
      case 'bone': { const a = rot; for (let i = -4; i <= 4; i++) s.pset(x + Math.round(i * Math.cos(a)), y + Math.round(i * Math.sin(a)), hex('#f0e8d0')); for (const e of [-4, 4]) s.disc(x + Math.round(e * Math.cos(a)), y + Math.round(e * Math.sin(a)), 1.5, hex('#f0e8d0')); break; }
      case 'egg': s.ellipse(x, y, 3, 4, hex('#f8f0d8')); s.pset(x - 1, y - 2, WHITE); s.pset(x + 1, y + 1, hex('#d0c090')); break;
      case 'shard': { for (let j = -3; j <= 3; j++) { const w = 2 - Math.abs(j) * 0.6; for (let i = -w; i <= w; i++) s.pset(x + Math.round(i), y + j, j < 0 && i < 0 ? WHITE : c); } break; }
      case 'heart': ['.#.#.', '#####', '.###.', '..#..'].forEach((r, j) => { for (let i = 0; i < 5; i++) if (r[i] === '#') s.pset(x - 2 + i, y - 2 + j, c); }); break;
    }
  }

  // ---------- primitives ----------
  function burst(sc, x, y, kind) {
    const cols = kind === 'capture' ? [hex('#ffffff'), hex('#ffc0f0'), hex('#f080d0')] : [hex('#ffffff'), hex('#fff0a0'), hex('#f8c040')];
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, v = rand(1.2, 2.6); particle(sc, { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, drag: 0.9, life: 18, shape: i % 2 ? 'spark' : 'dot', size: 2, cols }); }
    particle(sc, { x, y, life: 14, shape: 'ring', size: 3, grow: 5, cols: [WHITE, cols[1]] });
  }
  function sparkle(s, x, y) { drawShape(s, 'star', x + rand(-8, 8), y + rand(-6, 6), 2, hex('#fff8a0')); }
  function* impact(sc, k, col, big) {
    const c = center(sc, k);
    const cc = col ? C(col) : hex('#ffffff');
    const x = c.x + rand(-6, 6), y = c.y + rand(-6, 6);
    sc.fx.push({ age: 0, draw(s) { this.age++; if (this.age > 8) return false; const r = (big ? 14 : 10) * (1 - Math.abs(this.age - 4) / 5); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + 0.3; const L = i % 2 ? r : r * 0.55; s.lineBlend(x, y, x + Math.cos(a) * L, y + Math.sin(a) * L, i % 2 ? cc : hex('#fff4b0'), 1); } s.disc(x, y, 2.5, WHITE); return true; } });
    for (let i = 0; i < 6; i++) { const a = rand(0, Math.PI * 2); particle(sc, { x, y, vx: Math.cos(a) * rand(1, 2.5), vy: Math.sin(a) * rand(1, 2.5), drag: 0.85, life: 12, shape: 'spark', cols: [WHITE, cc] }); }
    if (big) sc.shake = Math.max(sc.shake, 4);
    yield* W(8);
  }
  function* lunge(sc, k, dist) {
    dist = dist || 14; const d = k === 'p' ? 1 : -1;
    for (let i = 0; i < 5; i++) { sc.offs[k].x += d * dist / 5; sc.offs[k].y -= d * dist / 10; yield; }
    for (let i = 0; i < 5; i++) { sc.offs[k].x -= d * dist / 5; sc.offs[k].y += d * dist / 10; yield; }
    sc.offs[k].x = 0; sc.offs[k].y = 0;
  }
  function* projectile(sc, from, to, frames, shape, cols, opts) {
    opts = opts || {};
    const a = center(sc, from), b = center(sc, to);
    const n = opts.count || 1;
    for (let j = 0; j < n; j++) {
      const off = opts.spread ? [rand(-opts.spread, opts.spread), rand(-opts.spread, opts.spread)] : [0, 0];
      particle(sc, { delay: j * (opts.gap || 3), x: a.x, y: a.y, life: frames, shape, size: opts.size || 2, cols, rot: Math.atan2(b.y - a.y, b.x - a.x), spin: opts.spin || 0,
        onUpdate: p => { const t = p.age / frames; p.x = a.x + (b.x + off[0] - a.x) * t; p.y = a.y + (b.y + off[1] - a.y) * t - Math.sin(t * Math.PI) * (opts.arc || 0); if (opts.trail && p.age % 2 === 0) particle(sc, { x: p.x, y: p.y, life: 8, shape: 'dot', size: opts.trailSize || 2, cols: opts.trail }); } });
    }
    yield* W(frames + (n - 1) * (opts.gap || 3));
  }
  function* beam(sc, from, to, frames, cols, width, opts) {
    opts = opts || {};
    const a = center(sc, from), b = center(sc, to);
    const cs = cols.map(C);
    sc.fx.push({ age: 0, draw(s) {
      this.age++; if (this.age > frames) return false;
      const grow = Math.min(1, this.age / 6), fade = this.age > frames - 5 ? (frames - this.age) / 5 : 1;
      const ex = a.x + (b.x - a.x) * grow, ey = a.y + (b.y - a.y) * grow;
      const len = Math.hypot(ex - a.x, ey - a.y), nx = -(ey - a.y) / (len || 1), ny = (ex - a.x) / (len || 1);
      const wdt = width * fade;
      for (let t = 0; t <= len; t += 0.7) {
        const px = a.x + (ex - a.x) * t / len, py = a.y + (ey - a.y) * t / len;
        const wob = opts.wave ? Math.sin(t * 0.3 - this.age * 0.8) * opts.wave : 0;
        for (let w = -wdt; w <= wdt; w += 0.7) {
          const k = Math.abs(w) / (wdt || 1);
          const ci = opts.rainbow ? Math.floor((t * 0.2 + this.age * 0.5) % cs.length) : Math.min(cs.length - 1, Math.floor(k * cs.length));
          s.pset(Math.round(px + nx * (w + wob)), Math.round(py + ny * (w + wob)), k < 0.3 ? WHITE : cs[ci]);
        }
      }
      if (opts.sparks && this.age % 2 === 0) particle(sc, { x: ex + rand(-4, 4), y: ey + rand(-4, 4), vx: rand(-2, 2), vy: rand(-2, 2), life: 10, shape: opts.sparks, cols: cs });
      return true;
    } });
    yield* W(frames);
  }
  function bolt(s, x0, y0, x1, y1, col, depth) {
    const pts = [[x0, y0]];
    const n = 7; for (let i = 1; i < n; i++) { const t = i / n; pts.push([x0 + (x1 - x0) * t + rand(-7, 7), y0 + (y1 - y0) * t + rand(-3, 3)]); }
    pts.push([x1, y1]);
    for (let i = 0; i < pts.length - 1; i++) {
      s.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], WHITE);
      s.line(pts[i][0] + 1, pts[i][1], pts[i + 1][0] + 1, pts[i + 1][1], col);
      s.line(pts[i][0] - 1, pts[i][1], pts[i + 1][0] - 1, pts[i + 1][1], col);
      if (depth && Math.random() < 0.3) bolt(s, pts[i][0], pts[i][1], pts[i][0] + rand(-14, 14), pts[i][1] + rand(6, 16), col, 0);
    }
  }
  function* lightning(sc, x0, y0, x1, y1, frames, col) {
    const cc = C(col || '#f8e048');
    sc.fx.push({ age: 0, draw(s) { this.age++; if (this.age > frames) return false; if (this.age % 3 !== 2) bolt(s, x0, y0, x1, y1, cc, 1); return true; } });
    yield* W(frames);
  }
  function* ring(sc, k, frames, col, r0, r1, thick) {
    const c = center(sc, k), cc = C(col);
    sc.fx.push({ age: 0, draw(s) { this.age++; if (this.age > frames) return false; const r = r0 + (r1 - r0) * this.age / frames; for (let t = 0; t < (thick || 1); t++) s.circle(c.x, c.y, r - t, cc); return true; } });
    yield* W(frames);
  }
  function* flash(sc, col, amt) { sc.flash = amt || 0.8; sc.flashColor = C(col || '#ffffff'); yield* W(6); }
  function* tint(sc, k, col, frames) {
    const cc = C(col);
    for (let i = 0; i < frames; i++) { sc.tint[k] = [cc, 0.6 * Math.sin(i / frames * Math.PI)]; yield; }
    sc.tint[k] = null;
  }
  function* wave(sc, amp, frames) {
    let t = 0;
    const tmp = new Uint32Array(320);
    sc.screenFx = (s) => {
      t++;
      for (let y = 0; y < 132; y++) {
        const sh = Math.round(Math.sin(y * 0.18 + t * 0.35) * amp * Math.sin(Math.min(1, t / frames) * Math.PI));
        if (!sh) continue;
        const row = y * 320;
        for (let x = 0; x < 320; x++) tmp[x] = s.data[row + Math.max(0, Math.min(319, x - sh))];
        s.data.set(tmp, row);
      }
    };
    yield* W(frames);
    sc.screenFx = null;
  }
  function* darken(sc, frames, col, amt) {
    const cc = C(col || '#100818');
    sc.fx.push({ age: 0, layer: 'under', draw(s) { this.age++; if (this.age > frames) return false; const a = (amt || 0.6) * Math.sin(this.age / frames * Math.PI); const d = s.data; for (let i = 0; i < 320 * 132; i++) d[i] = mix(d[i], cc, a); return true; } });
    yield* W(frames);
  }
  function emit(sc, k, n, o) {
    const c = center(sc, k);
    for (let i = 0; i < n; i++) particle(sc, Object.assign({}, o, { x: c.x + rand(-(o.rx || 12), o.rx || 12), y: c.y + rand(-(o.ry || 10), o.ry || 10), vx: (o.vx || 0) + rand(-(o.jx || 0), o.jx || 0), vy: (o.vy || 0) + rand(-(o.jy || 0), o.jy || 0), delay: Math.floor(rand(0, o.spreadT || 0)) }));
  }
  function* screenRain(sc, n, frames, o) {
    for (let i = 0; i < n; i++) particle(sc, Object.assign({}, o, { x: rand(-20, 340), y: rand(-40, 0), delay: Math.floor(rand(0, frames * 0.6)), life: o.life || 40 }));
    yield* W(frames);
  }
  function* slash(sc, k, n, col) {
    const c = center(sc, k), cc = C(col || '#ffffff');
    for (let j = 0; j < n; j++) {
      const ox = (j - (n - 1) / 2) * 6;
      sc.fx.push({ age: 0, draw(s) { this.age++; if (this.age > 10) return false; const len = Math.min(1, this.age / 4) * 22; for (let t = 0; t < len; t++) { const x = c.x - 11 + ox + t, y = c.y - 11 + t; s.pset(x, y, WHITE); s.pset(x + 1, y, cc); s.pset(x - 1, y, cc); } return true; } });
      yield* W(3);
    }
    yield* W(8);
  }
  function* vortex(sc, k, frames, cols, shape) {
    const c = center(sc, k);
    for (let i = 0; i < 26; i++) {
      const a0 = rand(0, Math.PI * 2), r0 = rand(6, 22);
      particle(sc, { delay: Math.floor(rand(0, frames * 0.5)), life: 24, shape: shape || 'flame', size: 2.2, cols: cols.map(C), onUpdate: p => { const a = a0 + p.age * 0.35; const r = r0 * (1 - p.age / 40); p.x = c.x + Math.cos(a) * r; p.y = c.y + 8 - p.age * 0.9 + Math.sin(a) * r * 0.35; } });
    }
    yield* W(frames);
  }

  // ---------- recipes ----------
  const FIRE = ['#f86828', '#e83818', '#b82810'], WATER = ['#58a8f8', '#3878e0', '#2050b0'], ICE = ['#e8ffff', '#a8e8f8', '#58b8e8'], ELEC = ['#fff8a0', '#f8d830', '#e8a818'];
  const GRASS = ['#a8e060', '#58b040', '#2a7a30'], PSY = ['#ffb0e0', '#f070c0', '#b040a0'], POIS = ['#d898f0', '#a050c8', '#6a2a8a'], GHOST = ['#a888d8', '#6a4aa0', '#2a1a48'];
  const R = {
    hit: function* (sc, a, t) { yield* lunge(sc, a); yield* impact(sc, t); },
    bighit: function* (sc, a, t) { yield* lunge(sc, a, 22); yield* impact(sc, t, '#f8e060', true); },
    quick: function* (sc, a, t) { const c = center(sc, a); for (let i = 0; i < 6; i++) particle(sc, { x: c.x, y: c.y + rand(-10, 10), vx: a === 'p' ? 7 : -7, life: 12, shape: 'dot', size: 1, cols: [WHITE] }); yield* lunge(sc, a, 30); yield* impact(sc, t); },
    claw: function* (sc, a, t, n) { yield* slash(sc, t, n || 3); },
    cut: function* (sc, a, t) { yield* slash(sc, t, 1, '#c0e0ff'); yield* impact(sc, t); },
    bite: function* (sc, a, t) {
      const c = center(sc, t);
      sc.fx.push({ age: 0, draw(s) { this.age++; if (this.age > 14) return false; const g = Math.max(0, 12 - this.age * 1.4); for (let i = -10; i <= 10; i++) { const yy = Math.round(Math.abs(i) * 0.3); s.pset(c.x + i, c.y - g - 4 + yy, WHITE); s.pset(c.x + i, c.y + g + 4 - yy, WHITE); if (i % 4 === 0) { s.pset(c.x + i, c.y - g - 3 + yy, WHITE); s.pset(c.x + i, c.y + g + 3 - yy, WHITE); } } return true; } });
      yield* W(10); yield* impact(sc, t);
    },
    punch: function* (sc, a, t, el) {
      const c = center(sc, t);
      sc.fx.push({ age: 0, draw(s) { this.age++; if (this.age > 10) return false; const r = 3 + this.age; s.disc(c.x, c.y, r, hex('#f8d8b0')); s.circle(c.x, c.y, r, P.outline); return true; } });
      yield* W(8);
      if (el) yield* R[el](sc, a, t, true); else yield* impact(sc, t, null, true);
    },
    kick: function* (sc, a, t) { yield* lunge(sc, a, 18); yield* impact(sc, t, '#f8f0c0', true); },
    wrap: function* (sc, a, t) { const c = center(sc, t); for (let i = 0; i < 3; i++) { yield* ring(sc, t, 8, '#e8c080', 26, 8, 2); } yield* impact(sc, t); },
    needles: function* (sc, a, t, n) { yield* projectile(sc, a, t, 12, 'needle', [WHITE, hex('#d0d0d8')], { count: n || 2, gap: 4, spread: 6 }); yield* impact(sc, t); },
    poisonsting: function* (sc, a, t) { yield* projectile(sc, a, t, 12, 'needle', [hex('#c070e0')], { count: 1 }); yield* impact(sc, t, '#c070e0'); },
    ember: function* (sc, a, t) { yield* projectile(sc, a, t, 16, 'flame', FIRE.map(C), { count: 3, gap: 5, arc: 12, size: 5, trail: [C('#f8c040'), C('#e84818')], trailSize: 3 }); emit(sc, t, 18, { life: 26, shape: 'flame', size: 4, vy: -1, jx: 0.6, cols: FIRE.map(C), spreadT: 10, rx: 16, ry: 12 }); yield* flash(sc, '#f8a040', 0.25); yield* W(18); },
    flamethrower: function* (sc, a, t) {
      const A = center(sc, a), B = center(sc, t);
      for (let i = 0; i < 26; i++) particle(sc, { delay: i, life: 16, shape: 'flame', size: 2.5, grow: 0.8, cols: [C('#f8d048'), C(FIRE[0]), C(FIRE[1])], onUpdate: p => { const tt = p.age / 16; p.x = A.x + (B.x - A.x) * tt + Math.sin(p.age + i) * 2; p.y = A.y + (B.y - A.y) * tt + Math.cos(p.age * 1.3 + i) * 3; } });
      yield* W(36); yield* vortex(sc, t, 20, FIRE);
    },
    fireblast: function* (sc, a, t) {
      yield* projectile(sc, a, t, 18, 'flame', FIRE.map(C), { size: 6, trail: [C('#f8c040'), C('#e84818')], trailSize: 4 });
      const c = center(sc, t);
      const arms = [[0, -1], [0, 1], [-1, 0.2], [1, 0.2], [-0.7, 0.9], [0.7, 0.9]];
      for (const [dx, dy] of arms) for (let i = 0; i < 8; i++) particle(sc, { x: c.x, y: c.y, vx: dx * i * 0.9, vy: dy * i * 0.9, drag: 0.82, life: 34, shape: 'flame', size: 4.5, cols: FIRE.map(C) });
      sc.shake = 5; yield* flash(sc, '#f8a040', 0.5); yield* W(26);
    },
    firespin: function* (sc, a, t) { yield* vortex(sc, t, 34, FIRE); },
    watergun: function* (sc, a, t) {
      const A = center(sc, a), B = center(sc, t);
      for (let i = 0; i < 22; i++) particle(sc, { delay: i, life: 14, shape: 'dot', size: 4, cols: [C('#e8f8ff'), C('#78c0f8'), C('#3878e0')], onUpdate: p => { const tt = p.age / 14; p.x = A.x + (B.x - A.x) * tt; p.y = A.y + (B.y - A.y) * tt - Math.sin(tt * Math.PI) * 10 + Math.sin(p.age + i) ; } });
      yield* W(26); emit(sc, t, 18, { life: 20, shape: 'dot', size: 3, vy: -2.2, jy: 1, jx: 2, ay: 0.2, cols: [C('#e8f8ff'), C('#78c0f8')] }); yield* W(12);
    },
    bubble: function* (sc, a, t) { yield* projectile(sc, a, t, 22, 'bubble', [C('#d0f0ff'), C('#80c8f8')], { count: 6, gap: 4, size: 3, spread: 10, arc: 8 }); yield* W(8); },
    hydropump: function* (sc, a, t) { yield* beam(sc, a, t, 30, WATER, 6, { wave: 2 }); emit(sc, t, 20, { life: 20, shape: 'bubble', size: 2, vy: -2, jx: 2, ay: 0.12, cols: WATER.map(C) }); sc.shake = 4; yield* W(10); },
    surf: function* (sc, a, t) {
      sc.fx.push({ age: 0, draw(s) { this.age++; if (this.age > 50) return false; const top = 132 - Math.sin(this.age / 50 * Math.PI) * 100; for (let y = Math.max(0, Math.floor(top)); y < 132; y++) for (let x = 0; x < 320; x++) { const w = Math.sin(x * 0.08 + this.age * 0.3 + y * 0.1); s.pblend(x, y, y < top + 3 + w * 2 ? WHITE : (w > 0.7 ? C('#a8d8ff') : C('#3a80e0')), 0.75); } return true; } });
      sc.shake = 3; yield* W(50);
    },
    clamp: function* (sc, a, t) { yield* R.bite(sc, a, t); },
    thundershock: function* (sc, a, t) { const c = center(sc, t); yield* lightning(sc, c.x - 10, c.y - 30, c.x, c.y, 14, ELEC[1]); emit(sc, t, 10, { life: 14, shape: 'spark', cols: ELEC.map(C), jx: 2, jy: 2 }); yield* W(6); },
    thunderbolt: function* (sc, a, t) { const c = center(sc, t); for (let i = 0; i < 3; i++) { sc.flash = 0.4; sc.flashColor = C('#fff8c0'); yield* lightning(sc, c.x + rand(-30, 30), c.y - 40, c.x, c.y, 8, ELEC[1]); } emit(sc, t, 16, { life: 18, shape: 'spark', cols: ELEC.map(C), jx: 3, jy: 3 }); yield* W(10); },
    thunder: function* (sc, a, t) { const c = center(sc, t); yield* darken(sc, 12, '#000010', 0.5); sc.flash = 1; sc.flashColor = WHITE; yield* lightning(sc, c.x, 0, c.x, c.y + 10, 24, '#f8f090'); sc.shake = 6; emit(sc, t, 20, { life: 20, shape: 'spark', cols: ELEC.map(C), jx: 3, jy: 3 }); yield* W(10); },
    thunderwave: function* (sc, a, t) { for (let i = 0; i < 3; i++) yield* ring(sc, t, 8, ELEC[1], 2, 22); emit(sc, t, 8, { life: 12, shape: 'spark', cols: ELEC.map(C) }); yield* W(8); },
    vinewhip: function* (sc, a, t) { const c = center(sc, t); for (let k = 0; k < 2; k++) { sc.fx.push({ age: 0, draw(s) { this.age++; if (this.age > 10) return false; for (let i = 0; i < 24; i++) { const x = c.x - 12 + i, y = c.y - 10 + Math.sin(i * 0.4 + this.age) * 6 + k * 8; s.pset(x, y, C('#3a9a38')); s.pset(x, y + 1, C('#1e5a24')); } return true; } }); yield* W(6); } yield* impact(sc, t); },
    razorleaf: function* (sc, a, t) { yield* projectile(sc, a, t, 20, 'leaf', [C('#98e058'), C('#58b040')], { count: 10, gap: 2, spread: 14, arc: 18, spin: 0.45, size: 3 }); yield* slash(sc, t, 2, '#c8f0a0'); yield* impact(sc, t); },
    solarbeam: function* (sc, a, t) { yield* beam(sc, a, t, 34, ['#fff8c0', '#f8f070', '#a8e060'], 9, { sparks: 'star' }); sc.shake = 4; yield* W(6); },
    charge: function* (sc, a) { const c = center(sc, a); for (let i = 0; i < 20; i++) { const ang = rand(0, Math.PI * 2); particle(sc, { delay: i, life: 14, shape: 'spark', cols: [C('#fff8c0'), C('#f8e070')], onUpdate: p => { const r = 30 * (1 - p.age / 14); p.x = c.x + Math.cos(ang) * r; p.y = c.y + Math.sin(ang) * r; } }); } yield* tint(sc, a, '#ffffff', 30); },
    drain: function* (sc, a, t, col) {
      const A = center(sc, a), B = center(sc, t);
      const cols = (col || ['#c8f888', '#78d048']).map(C);
      for (let i = 0; i < 14; i++) { const off = rand(-10, 10); particle(sc, { delay: i * 2, life: 22, shape: 'dot', size: 3, cols, onUpdate: p => { const tt = p.age / 22; p.x = B.x + (A.x - B.x) * tt + Math.sin(tt * Math.PI) * off; p.y = B.y + (A.y - B.y) * tt - Math.sin(tt * Math.PI) * 20; } }); }
      yield* W(40); yield* tint(sc, a, col ? col[0] : '#c8f888', 12);
    },
    leechseed: function* (sc, a, t) { yield* projectile(sc, a, t, 20, 'seed', [0], { count: 3, gap: 3, arc: 22, spread: 8 }); emit(sc, t, 6, { life: 20, shape: 'leaf', cols: GRASS.map(C), vy: -0.4 }); yield* W(12); },
    seeddrain: function* (sc, a) { yield* R.drain(sc, other(a), a, ['#e8f898', '#a8d848']); },
    powder: function* (sc, a, t, col) { const c = center(sc, t); for (let i = 0; i < 30; i++) particle(sc, { x: c.x + rand(-18, 18), y: c.y - 34 + rand(-6, 6), vy: rand(0.6, 1.2), vx: rand(-0.3, 0.3), delay: Math.floor(rand(0, 18)), life: 30, shape: 'dot', size: 2, cols: [C(col), shade(C(col), 0.3)] }); yield* W(40); },
    petaldance: function* (sc, a, t) { yield* vortex(sc, t, 36, ['#ffb0d0', '#f880b0', '#ffe0f0'], 'leaf'); yield* impact(sc, t); },
    icebeam: function* (sc, a, t) { yield* beam(sc, a, t, 28, ICE, 5, { sparks: 'snow' }); emit(sc, t, 10, { life: 26, shape: 'shard', cols: ICE.map(C), jx: 1, jy: 1 }); yield* W(12); },
    blizzard: function* (sc, a, t) {
      sc.fx.push({ age: 0, layer: 'under', draw(s) { this.age++; if (this.age > 70) return false; const k = Math.sin(this.age / 70 * Math.PI) * 0.35; const d = s.data; for (let i = 0; i < 320 * 132; i++) d[i] = mix(d[i], 0xfffff0e8, k); return true; } });
      yield* screenRain(sc, 160, 56, { shape: 'snow', size: 2, vx: -4, vy: 2.6, cols: [WHITE, C('#c8f0ff')], life: 60 });
      emit(sc, t, 16, { life: 34, shape: 'shard', cols: ICE.map(C), rx: 18, ry: 14 }); sc.shake = 4; yield* W(14);
    },
    aurorabeam: function* (sc, a, t) { yield* beam(sc, a, t, 30, ['#ff8080', '#f8d860', '#80f080', '#80c0ff', '#c080ff'], 5, { rainbow: true }); yield* W(4); },
    mist: function* (sc, a, t, col) { emit(sc, t || a, 24, { life: 40, shape: 'dot', size: 5, grow: 1, rx: 26, ry: 16, vx: 0.3, cols: [C(col || '#e8f0ff'), C(col || '#c8d8f0')], spreadT: 10, layer: undefined }); yield* W(46); },
    psychic: function* (sc, a, t) { yield* ring(sc, t, 10, '#f070c0', 4, 30, 2); yield* wave(sc, 5, 40); yield* tint(sc, t, '#f890d0', 14); },
    confusion: function* (sc, a, t) { yield* tint(sc, t, '#f070c0', 10); yield* wave(sc, 3, 26); },
    psybeam: function* (sc, a, t) { const A = center(sc, a), B = center(sc, t); for (let i = 0; i < 10; i++) particle(sc, { delay: i * 2, life: 16, shape: 'ring', size: 4, cols: PSY.map(C), onUpdate: p => { const tt = p.age / 16; p.x = A.x + (B.x - A.x) * tt; p.y = A.y + (B.y - A.y) * tt; p.size = 3 + Math.sin(p.age) * 2; } }); yield* W(36); yield* wave(sc, 3, 16); },
    hypnosis: function* (sc, a, t) { for (let i = 0; i < 4; i++) { const A = center(sc, a), B = center(sc, t); particle(sc, { delay: i * 5, life: 22, shape: 'ring', size: 5, cols: [C('#f8a0e0')], onUpdate: p => { const tt = p.age / 22; p.x = A.x + (B.x - A.x) * tt; p.y = A.y + (B.y - A.y) * tt + Math.sin(p.age * 0.6) * 6; } }); } yield* W(40); },
    shield: function* (sc, a, t, col) { const c = center(sc, a); const cc = C(col || '#b8e0ff'); sc.fx.push({ age: 0, draw(s) { this.age++; if (this.age > 36) return false; const al = Math.sin(this.age / 36 * Math.PI) * 0.6; for (let y = -22; y <= 22; y++) for (let x = -22; x <= 22; x++) if ((Math.abs(x) + Math.abs(y * 0.9)) < 24 && (Math.abs(x) + Math.abs(y * 0.9)) > 20) s.pblend(c.x + x + (a === 'p' ? 18 : -18), c.y + y, cc, al + 0.3); else if ((Math.abs(x) + Math.abs(y * 0.9)) < 20 && (x + y + this.age) % 6 === 0) s.pblend(c.x + x + (a === 'p' ? 18 : -18), c.y + y, WHITE, al); return true; } }); yield* W(36); },
    heal: function* (sc, a) { emit(sc, a, 18, { life: 26, shape: 'star', size: 2, vy: -1, cols: [C('#f0ffc0'), C('#a8f0a0')], spreadT: 16 }); yield* tint(sc, a, '#c8ffb0', 30); },
    rest: function* (sc, a) { emit(sc, a, 4, { life: 40, shape: 'z', vy: -0.6, vx: 0.4, cols: [C('#e0e8ff')], spreadT: 24 }); yield* R.heal(sc, a); },
    rocks: function* (sc, a, t, n) {
      const c = center(sc, t); n = n || 4;
      for (let i = 0; i < n; i++) { const x0 = c.x + rand(-20, 20); particle(sc, { x: x0, y: c.y - 70, vy: 4, ay: 0.35, delay: i * 5, life: 17, shape: 'rock', size: rand(4, 6.5), cols: [C('#a08868')], onUpdate: p => { if (p.age === 16) { sc.shake = Math.max(sc.shake, 3); for (let k = 0; k < 5; k++) particle(sc, { x: p.x, y: p.y + 4, vx: rand(-1.5, 1.5), vy: rand(-2, -0.5), ay: 0.2, life: 14, shape: 'dot', size: 3, cols: [C('#d8c8a8'), C('#a89878')] }); } } }); }
      yield* W(18 + n * 5); yield* impact(sc, t, '#d0b890', true);
    },
    earthquake: function* (sc, a, t) {
      const c = center(sc, t);
      sc.fx.push({ age: 0, layer: 'under', draw(s) { this.age++; if (this.age > 44) return false; for (let k = 0; k < 3; k++) { const r = ((this.age * 3 + k * 20) % 60) * 2.2; for (let i = 0; i < 64; i++) { const an = i / 64 * Math.PI * 2; s.pblend(c.x + Math.cos(an) * r, c.y + 26 + Math.sin(an) * r * 0.25, C('#fff0c8'), 0.5 * (1 - r / 132)); } } return true; } });
      for (let i = 0; i < 4; i++) { sc.shake = 9; for (let k = 0; k < 10; k++) particle(sc, { x: rand(0, 320), y: rand(80, 128), vy: rand(-3.5, -1), vx: rand(-0.5, 0.5), ay: 0.25, life: 22, shape: 'rock', size: rand(2, 3.5), cols: [C('#b09070')] }); yield* W(11); }
    },
    fissure: function* (sc, a, t) { yield* darken(sc, 20, '#200c08', 0.5); yield* R.earthquake(sc, a, t); },
    dig: function* (sc, a, t) { emit(sc, t, 16, { life: 20, shape: 'rock', size: 1.8, vy: -3, jx: 2, ay: 0.3, cols: [C('#b08a60')] }); yield* R.bighit(sc, a, t); },
    sand: function* (sc, a, t) { yield* projectile(sc, a, t, 14, 'dot', [C('#e8d098'), C('#c8a870')], { count: 20, gap: 1, spread: 14, size: 2 }); yield* W(4); },
    poison: function* (sc, a, t) { yield* projectile(sc, a, t, 16, 'bubble', POIS.map(C), { count: 5, gap: 3, arc: 16, size: 3 }); emit(sc, t, 10, { life: 22, shape: 'bubble', size: 2, vy: -0.8, cols: POIS.map(C), spreadT: 10 }); yield* W(20); },
    gas: function* (sc, a, t, col) { yield* R.mist(sc, a, t, col || '#b080d0'); },
    lick: function* (sc, a, t) { const c = center(sc, t); sc.fx.push({ age: 0, draw(s) { this.age++; if (this.age > 16) return false; for (let y = 0; y < 16; y++) for (let x = -3; x <= 3; x++) if (x * x / 9 + ((y - 8) * (y - 8)) / 64 < 1) s.pset(c.x + x, c.y - 12 + y + (this.age - 8), C('#f07898')); return true; } }); yield* W(16); yield* impact(sc, t); },
    nightshade: function* (sc, a, t) { yield* darken(sc, 30, '#100020', 0.7); yield* tint(sc, t, '#402060', 16); },
    confuseray: function* (sc, a, t) { yield* projectile(sc, a, t, 30, 'dot', [C('#ffffa0'), C('#f8d048')], { size: 6, arc: 12, trail: [C('#f0e080')], trailSize: 3 }); yield* W(4); },
    dragonrage: function* (sc, a, t) { yield* vortex(sc, t, 36, ['#80a0ff', '#4060e0', '#b0c8ff']); sc.shake = 4; yield* W(6); },
    wind: function* (sc, a, t) { const c = center(sc, t); for (let i = 0; i < 20; i++) { const a0 = rand(0, Math.PI * 2); particle(sc, { delay: Math.floor(rand(0, 12)), life: 18, shape: 'dot', size: 1, cols: [WHITE, C('#d0e8ff')], onUpdate: p => { const r = 18 - p.age * 0.6, an = a0 + p.age * 0.5; p.x = c.x + Math.cos(an) * r; p.y = c.y + Math.sin(an) * r * 0.5; } }); } yield* W(26); yield* impact(sc, t); },
    wing: function* (sc, a, t) { yield* lunge(sc, a, 16); yield* slash(sc, t, 2, '#e0e8ff'); },
    sound: function* (sc, a, t, col) { const A = center(sc, a); const cc = C(col || '#ffffff'); for (let i = 0; i < 5; i++) { sc.fx.push({ age: 0, delay: i * 4, draw(s) { if (this.delay > 0) { this.delay--; return true; } this.age++; if (this.age > 16) return false; const r = 6 + this.age * 3; const dir = a === 'p' ? 0 : Math.PI; for (let k = -6; k <= 6; k++) { const an = dir + k * 0.08; s.pset(Math.round(A.x + Math.cos(an) * r), Math.round(A.y + Math.sin(an) * r), cc); } return true; } }); } yield* W(36); },
    sing: function* (sc, a, t) { yield* projectile(sc, a, t, 30, 'note', [C('#f8f8ff')], { count: 5, gap: 5, arc: 16, spread: 10 }); yield* W(6); },
    statup: function* (sc, a, t, col) { yield* stat(sc, a, true, col); },
    statdown: function* (sc, a, t, col) { yield* stat(sc, t, false, col); },
    swords: function* (sc, a) { const c = center(sc, a); for (let i = 0; i < 3; i++) { const a0 = i / 3 * Math.PI * 2; particle(sc, { life: 30, shape: 'needle', cols: [C('#e0e8f8')], onUpdate: p => { const an = a0 + p.age * 0.25; p.x = c.x + Math.cos(an) * 18; p.y = c.y + Math.sin(an) * 8; p.rot = Math.PI / 2; } }); } yield* W(30); yield* stat(sc, a, true); },
    glow: function* (sc, a, t, col) { yield* tint(sc, a, col || '#ffffff', 24); },
    doubleteam: function* (sc, a) { for (let i = 0; i < 20; i++) { sc.offs[a].x = (i % 4 < 2 ? -1 : 1) * 8; sc.vis[a] = i % 2 ? 0.5 : 1; yield; } sc.offs[a].x = 0; sc.vis[a] = 1; },
    minimize: function* (sc, a) { for (let i = 0; i < 12; i++) { sc.scale[a] = 1 - i / 24; yield; } yield* W(10); sc.scale[a] = 1; },
    explosion: function* (sc, a, t) { const c = center(sc, a); yield* flash(sc, '#ffffff', 1); for (let i = 0; i < 40; i++) { const an = rand(0, Math.PI * 2), v = rand(1, 5); particle(sc, { x: c.x, y: c.y, vx: Math.cos(an) * v, vy: Math.sin(an) * v, drag: 0.92, life: 30, shape: 'flame', size: 3, cols: FIRE.map(C) }); } sc.shake = 10; yield* W(30); yield* impact(sc, t, '#f8a040', true); },
    splash: function* (sc, a) { for (let k = 0; k < 3; k++) { for (let i = 0; i < 8; i++) { sc.offs[a].y = -Math.sin(i / 8 * Math.PI) * 10; yield; } } sc.offs[a].y = 0; emit(sc, a, 8, { life: 16, shape: 'dot', size: 2, vy: -2, jx: 2, ay: 0.25, ry: 2, cols: WATER.map(C) }); yield* W(8); },
    swift: function* (sc, a, t) { yield* projectile(sc, a, t, 16, 'star', [C('#fff8a0'), C('#f8d048')], { count: 5, gap: 3, spread: 12, arc: 10, size: 3 }); yield* impact(sc, t); },
    coins: function* (sc, a, t) { yield* R.hit(sc, a, t); emit(sc, t, 10, { life: 26, shape: 'coin', vy: -2.5, jx: 2, ay: 0.25, cols: [0] }); yield* W(16); },
    bone: function* (sc, a, t) { yield* projectile(sc, a, t, 16, 'bone', [0], { spin: 0.6, arc: 10 }); yield* impact(sc, t, null, true); },
    egg: function* (sc, a, t) { yield* projectile(sc, a, t, 18, 'egg', [0], { arc: 20 }); yield* R.explosionSmall(sc, a, t); },
    explosionSmall: function* (sc, a, t) { const c = center(sc, t); for (let i = 0; i < 14; i++) { const an = rand(0, Math.PI * 2); particle(sc, { x: c.x, y: c.y, vx: Math.cos(an) * 2, vy: Math.sin(an) * 2, drag: 0.9, life: 18, shape: 'flame', size: 2, cols: FIRE.map(C) }); } sc.shake = 4; yield* W(14); },
    triattack: function* (sc, a, t) { yield* R.ember(sc, a, t); yield* R.icebeam(sc, a, t); yield* R.thundershock(sc, a, t); },
    string: function* (sc, a, t) { yield* projectile(sc, a, t, 16, 'dot', [WHITE], { count: 10, gap: 1, spread: 8, trail: [C('#f0f0f0')], trailSize: 1 }); const c = center(sc, t); sc.fx.push({ age: 0, draw(s) { this.age++; if (this.age > 30) return false; for (let i = -16; i <= 16; i += 4) { s.line(c.x + i, c.y - 16, c.x - i, c.y + 16, WHITE); } return true; } }); yield* W(30); },
    metronome: function* (sc, a) { const c = center(sc, a); for (let i = 0; i < 24; i++) { sc.fx.push({ age: 0, draw(s) { this.age++; if (this.age > 1) return false; const an = Math.sin(i * 0.5) * 0.8 - Math.PI / 2; s.line(c.x, c.y - 10, c.x + Math.cos(an) * 10, c.y - 10 + Math.sin(an) * 10, WHITE); return true; } }); yield; } },
    transform: function* (sc, a) { yield* tint(sc, a, '#ffffff', 20); },
    teleport: function* (sc, a) { emit(sc, a, 16, { life: 20, shape: 'star', cols: [C('#fff8c0')], vy: -2 }); for (let i = 0; i < 12; i++) { sc.vis[a] = i % 2; yield; } sc.vis[a] = 0; yield* W(10); },
    disable: function* (sc, a, t) { yield* ring(sc, t, 14, '#e04040', 22, 10, 2); },
    rage: function* (sc, a, t) { yield* tint(sc, a, '#ff4040', 12); yield* R.hit(sc, a, t); },
    bide: function* (sc, a) { yield* tint(sc, a, '#ff8040', 20); },
    counter: function* (sc, a, t) { yield* lunge(sc, a, 24); yield* impact(sc, t, '#f86040', true); },
    focus: function* (sc, a) { emit(sc, a, 16, { life: 20, shape: 'dot', size: 1, vy: -3, cols: [C('#fff0a0'), C('#f8a040')], spreadT: 12, ry: 4 }); yield* tint(sc, a, '#f8c060', 20); },
    fly: function* (sc, a, t) { yield* lunge(sc, a, 30); yield* impact(sc, t, null, true); },
    skyattack: function* (sc, a, t) { yield* tint(sc, a, '#ffffff', 10); yield* lunge(sc, a, 34); yield* impact(sc, t, '#fff0a0', true); yield* flash(sc, '#ffffff', 0.6); },
    leer: function* (sc, a, t) { const c = center(sc, a); emit(sc, a, 2, { life: 20, shape: 'star', size: 3, rx: 6, ry: 4, cols: [C('#ffe0e0'), C('#f06060')] }); yield* W(20); yield* stat(sc, t, false); },
    tailwhip: function* (sc, a, t) { for (let i = 0; i < 16; i++) { sc.offs[a].x = Math.sin(i * 0.8) * 5; yield; } sc.offs[a].x = 0; yield* stat(sc, t, false); },
    haze: function* (sc, a) { yield* R.mist(sc, a, 'p', '#a0a0b0'); },
    conversion: function* (sc, a) { yield* tint(sc, a, '#80f0ff', 20); },
    mimic: function* (sc, a) { yield* tint(sc, a, '#f0f0ff', 16); },
    recharge: function* () { yield* W(10); },
    healitem: function* (sc, a) { yield* R.heal(sc, a); },
    safariRock: function* (sc, a, t) { yield* projectile(sc, 'p', 'e', 16, 'rock', [C('#a09078')], { arc: 20, size: 3 }); yield* impact(sc, 'e'); },
    fly_charge: function* (sc, a) { for (let i = 0; i < 14; i++) { sc.offs[a].y -= 5; yield; } sc.offs[a].y = 0; },
    dig_charge: function* (sc, a) { emit(sc, a, 14, { life: 18, shape: 'rock', size: 1.8, vy: -2, jx: 2, ay: 0.25, cols: [C('#b08a60')] }); for (let i = 0; i < 12; i++) { sc.clip[a] = 1 - i / 12; yield; } sc.clip[a] = 1; },
  };
  // move -> [recipe, arg]
  const MOVES = {
    POUND: ['hit'], KARATE_CHOP: ['cut'], DOUBLESLAP: ['hit'], COMET_PUNCH: ['punch'], MEGA_PUNCH: ['punch'], PAY_DAY: ['coins'],
    FIRE_PUNCH: ['punch', 'ember'], ICE_PUNCH: ['punch', 'icebeam'], THUNDERPUNCH: ['punch', 'thundershock'], SCRATCH: ['claw'], VICEGRIP: ['bite'],
    GUILLOTINE: ['bite'], RAZOR_WIND: ['wind'], SWORDS_DANCE: ['swords'], CUT: ['cut'], GUST: ['wind'], WING_ATTACK: ['wing'], WHIRLWIND: ['wind'],
    FLY: ['fly'], BIND: ['wrap'], SLAM: ['bighit'], VINE_WHIP: ['vinewhip'], STOMP: ['kick'], DOUBLE_KICK: ['kick'], MEGA_KICK: ['kick'], JUMP_KICK: ['kick'],
    ROLLING_KICK: ['kick'], SAND_ATTACK: ['sand'], HEADBUTT: ['bighit'], HORN_ATTACK: ['needles', 1], FURY_ATTACK: ['needles', 1], HORN_DRILL: ['needles', 3],
    TACKLE: ['hit'], BODY_SLAM: ['bighit'], WRAP: ['wrap'], TAKE_DOWN: ['bighit'], THRASH: ['bighit'], DOUBLE_EDGE: ['bighit'], TAIL_WHIP: ['tailwhip'],
    POISON_STING: ['poisonsting'], TWINEEDLE: ['needles', 2], PIN_MISSILE: ['needles', 3], LEER: ['leer'], BITE: ['bite'], GROWL: ['sound', '#ffffff'],
    ROAR: ['sound', '#ffe0a0'], SING: ['sing'], SUPERSONIC: ['sound', '#f0f0a0'], SONICBOOM: ['sound', '#ffffff'], DISABLE: ['disable'], ACID: ['poison'],
    EMBER: ['ember'], FLAMETHROWER: ['flamethrower'], MIST: ['mist'], WATER_GUN: ['watergun'], HYDRO_PUMP: ['hydropump'], SURF: ['surf'],
    ICE_BEAM: ['icebeam'], BLIZZARD: ['blizzard'], PSYBEAM: ['psybeam'], BUBBLEBEAM: ['bubble'], AURORA_BEAM: ['aurorabeam'], HYPER_BEAM: ['solarbeam'],
    PECK: ['needles', 1], DRILL_PECK: ['needles', 3], SUBMISSION: ['bighit'], LOW_KICK: ['kick'], COUNTER: ['counter'], SEISMIC_TOSS: ['bighit'],
    STRENGTH: ['bighit'], ABSORB: ['drain'], MEGA_DRAIN: ['drain'], LEECH_SEED: ['leechseed'], GROWTH: ['statup', '#a8e060'], RAZOR_LEAF: ['razorleaf'],
    SOLARBEAM: ['solarbeam'], POISONPOWDER: ['powder', '#b070d8'], STUN_SPORE: ['powder', '#f8e060'], SLEEP_POWDER: ['powder', '#80d8a0'],
    PETAL_DANCE: ['petaldance'], STRING_SHOT: ['string'], DRAGON_RAGE: ['dragonrage'], FIRE_SPIN: ['firespin'], THUNDERSHOCK: ['thundershock'],
    THUNDERBOLT: ['thunderbolt'], THUNDER_WAVE: ['thunderwave'], THUNDER: ['thunder'], ROCK_THROW: ['rocks', 2], EARTHQUAKE: ['earthquake'],
    FISSURE: ['fissure'], DIG: ['dig'], TOXIC: ['poison'], CONFUSION: ['confusion'], PSYCHIC_M: ['psychic'], HYPNOSIS: ['hypnosis'], MEDITATE: ['glow', '#f8a0d0'],
    AGILITY: ['doubleteam'], QUICK_ATTACK: ['quick'], RAGE: ['rage'], TELEPORT: ['teleport'], NIGHT_SHADE: ['nightshade'], MIMIC: ['mimic'],
    SCREECH: ['sound', '#f8f8f8'], DOUBLE_TEAM: ['doubleteam'], RECOVER: ['heal'], HARDEN: ['glow', '#ffffff'], MINIMIZE: ['minimize'],
    SMOKESCREEN: ['gas', '#404048'], CONFUSE_RAY: ['confuseray'], WITHDRAW: ['glow', '#b0d8ff'], DEFENSE_CURL: ['glow', '#ffffff'], BARRIER: ['shield', '#c0f0ff'],
    LIGHT_SCREEN: ['shield', '#f8f8a0'], HAZE: ['haze'], REFLECT: ['shield', '#c0d0ff'], FOCUS_ENERGY: ['focus'], BIDE: ['bide'], METRONOME: ['metronome'],
    MIRROR_MOVE: ['glow'], SELFDESTRUCT: ['explosion'], EGG_BOMB: ['egg'], LICK: ['lick'], SMOG: ['gas', '#8a7a9a'], SLUDGE: ['poison'], BONE_CLUB: ['bone'],
    FIRE_BLAST: ['fireblast'], WATERFALL: ['hydropump'], CLAMP: ['clamp'], SWIFT: ['swift'], SKULL_BASH: ['bighit'], SPIKE_CANNON: ['needles', 3],
    CONSTRICT: ['wrap'], AMNESIA: ['glow', '#c0c0ff'], KINESIS: ['glow', '#f8a0d0'], SOFTBOILED: ['heal'], HI_JUMP_KICK: ['kick'], GLARE: ['leer'],
    DREAM_EATER: ['drain', ['#ffb0e0', '#f070c0']], POISON_GAS: ['gas', '#b080d0'], BARRAGE: ['egg'], LEECH_LIFE: ['drain', ['#f8a0a0', '#e05050']],
    LOVELY_KISS: ['glow', '#ff90c0'], SKY_ATTACK: ['skyattack'], TRANSFORM: ['transform'], BUBBLE: ['bubble'], DIZZY_PUNCH: ['punch'], SPORE: ['powder', '#d8c080'],
    FLASH: ['glow', '#ffffff'], PSYWAVE: ['psychic'], SPLASH: ['splash'], ACID_ARMOR: ['glow', '#a0c0ff'], CRABHAMMER: ['punch', 'watergun'],
    EXPLOSION: ['explosion'], FURY_SWIPES: ['claw', 2], BONEMERANG: ['bone'], REST: ['rest'], ROCK_SLIDE: ['rocks', 6], HYPER_FANG: ['bite'],
    SHARPEN: ['glow', '#ffffff'], CONVERSION: ['conversion'], TRI_ATTACK: ['triattack'], SUPER_FANG: ['bite'], SLASH: ['claw', 3], SUBSTITUTE: ['glow'],
    STRUGGLE: ['hit'], CHARGE: ['charge'], DRAIN: ['drain'], LEECH_SEED_DRAIN: ['seeddrain'], HEAL_ITEM: ['healitem'], ROCK_THROW_SAFARI: ['safariRock'],
    FLY_CHARGE: ['fly_charge'], DIG_CHARGE: ['dig_charge'], BIDE_HIT: ['counter'], HORN: ['needles', 2],
  };

  function* move(sc, id, k, hit) {
    const m = MOVES[id] || ['hit'];
    const t = other(k);
    if (hit > 0 && !['needles', 'claw'].includes(m[0])) { yield* impact(sc, t); return; }
    const f = R[m[0]] || R.hit;
    const ar = m[1];
    if (m[0] === 'drain' && id === 'DRAIN') { yield* R.drain(sc, k, t); return; }
    yield* f(sc, k, t, ar);
    // make sure transient states are reset
    sc.offs[k].x = 0; sc.offs[k].y = 0;
  }
  function* status(sc, k, st) {
    switch (st) {
      case 'PSN': emit(sc, k, 10, { life: 24, shape: 'bubble', size: 2, vy: -0.8, cols: POIS.map(C), spreadT: 14 }); yield* tint(sc, k, '#b060d0', 24); break;
      case 'BRN': emit(sc, k, 10, { life: 20, shape: 'flame', size: 2, vy: -0.8, cols: FIRE.map(C), spreadT: 12 }); yield* tint(sc, k, '#f86030', 24); break;
      case 'PAR': emit(sc, k, 12, { life: 12, shape: 'spark', cols: ELEC.map(C), spreadT: 18 }); yield* tint(sc, k, '#f8e040', 24); break;
      case 'SLP': emit(sc, k, 3, { life: 36, shape: 'z', vy: -0.6, vx: 0.5, cols: [C('#e0e8ff')], spreadT: 20, rx: 4, ry: 4 }); yield* W(36); break;
      case 'FRZ': emit(sc, k, 10, { life: 24, shape: 'shard', cols: ICE.map(C), spreadT: 10 }); yield* tint(sc, k, '#a0e0ff', 24); break;
      case 'CONF': { const c = center(sc, k); for (let i = 0; i < 3; i++) { const a0 = i / 3 * Math.PI * 2; particle(sc, { life: 36, shape: 'star', size: 2, cols: [C('#fff8a0')], onUpdate: p => { const an = a0 + p.age * 0.25; p.x = c.x + Math.cos(an) * 14; p.y = c.y - 18 + Math.sin(an) * 4; } }); } yield* W(36); break; }
    }
  }
  function* stat(sc, k, up, col) {
    const c = center(sc, k);
    const cols = up ? [C(col || '#fff0a0'), C('#f8a040'), C('#e05030')] : [C('#c0e0ff'), C('#6090e0'), C('#3050a0')];
    for (let i = 0; i < 18; i++) particle(sc, { x: c.x + rand(-20, 20), y: c.y + (up ? 20 : -26) + rand(-6, 6), vy: up ? -2 : 2, delay: Math.floor(rand(0, 16)), life: 16, shape: 'dot', size: 1, cols,
      onUpdate: p => { /* streak */ } });
    for (let i = 0; i < 24; i++) { sc.tint[k] = [cols[1], 0.4 * Math.sin(i / 24 * Math.PI)]; yield; }
    sc.tint[k] = null;
  }
  G.vfx = { move, status, stat, burst, sparkle, particle, MOVES, R };
})(window.G);
