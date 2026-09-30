// Rendering: sky, parallax, cached 32x32 tile chunks, entities, RGB light composite, particles, damage text.
import { CFG } from './config.js';
import { T, TILE, SOLID } from './tiles.js';
import { ITEMS } from './items.js';
import { drawHumanoid, mk, mix, PAL } from './sprites.js';
import { HUMAN } from './enemies.js';
import { computeLighting } from './lighting.js';
import { hash2 } from './rng.js';

const TS = 16, CH = CFG.CHUNK, CPX = CH * TS;

export function createRenderer(canvas, S) {
  const R = { canvas, ctx: canvas.getContext('2d'), S, chunks: new Map(), pool: [], W: 0, H: 0 };
  R.scene = mk(1, 1); R.sctx = R.scene.getContext('2d');
  R.mask = mk(1, 1); R.mctx = R.mask.getContext('2d');
  R.light = mk(1, 1); R.lctx = R.light.getContext('2d');
  R.resize = () => {
    R.W = canvas.width = Math.max(320, window.innerWidth);
    R.H = canvas.height = Math.max(240, window.innerHeight);
    R.ctx.imageSmoothingEnabled = false;
  };
  R.resize();
  window.addEventListener('resize', R.resize);
  return R;
}
export function clearChunks(R) { for (const c of R.chunks.values()) R.pool.push(c.cv); R.chunks.clear(); }

// ------------------------------------------------------------------ fx helpers (attached to G.fx by main)
export function makeFx(G) {
  return {
    particles(x, y, n, col, o = {}) {
      const sp = o.spread || 1.5;
      for (let i = 0; i < n; i++) {
        if (G.particles.length > 1500) G.particles.shift();
        const life = (o.life || 35) * (0.6 + Math.random() * 0.6);
        G.particles.push({ x, y, px: x, py: y, vx: (Math.random() - 0.5) * sp * 2, vy: (Math.random() - 0.7) * sp * 2, life, max: life, col, grav: o.grav != null ? o.grav : 0.12, glow: !!o.glow, size: o.size || (1.5 + Math.random() * 1.5) });
      }
    },
    text(x, y, v, col, crit = false, label = false) {
      G.texts.push({ x: x + (Math.random() - 0.5) * 10, y, vy: label ? -0.6 : -1.6, txt: String(v), col, crit, label, life: label ? 90 : 60, max: label ? 90 : 60 });
      if (G.texts.length > 80) G.texts.shift();
    },
    shake(n) { G.cam.shake = Math.max(G.cam.shake, n * (G.settings.shake === false ? 0 : 1)); },
  };
}
export function updateFx(G) {
  for (const p of G.particles) { p.px = p.x; p.py = p.y; p.x += p.vx; p.y += p.vy; p.vy += p.grav; p.vx *= 0.97; p.life--; }
  if (G.particles.length) G.particles = G.particles.filter(p => p.life > 0);
  for (const t of G.texts) { t.y += t.vy; t.vy *= 0.94; t.life--; }
  if (G.texts.length) G.texts = G.texts.filter(t => t.life > 0);
}

export function updateCamera(G, R) {
  const c = G.cam, p = G.player, wd = G.world, z = G.settings.zoom;
  c.px = c.x; c.py = c.y;
  const vw = R.W / z, vh = R.H / z;
  const tx = Math.max(0, Math.min(wd.w * TS - vw, p.x + 10 - vw / 2));
  const ty = Math.max(0, Math.min(wd.h * TS - vh, p.y + 21 - vh / 2));
  if (c.snap) { c.x = c.px = tx; c.y = c.py = ty; c.snap = false; }
  else { c.x += (tx - c.x) * 0.14; c.y += (ty - c.y) * 0.14; }
  if (c.shake > 0) c.shake = Math.max(0, c.shake - 0.4);
  const gy = wd.surf[Math.max(0, Math.min(wd.w - 1, Math.floor((p.x + 10) / 16)))] * 16;
  G.bg.groundY += (gy - G.bg.groundY) * 0.05;
}

// ------------------------------------------------------------------ chunks
function neighborMask(wd, x, y) {
  const W = wd.w, H = wd.h, t = wd.tile;
  const s = (xx, yy) => xx < 0 || yy < 0 || xx >= W || yy >= H ? 1 : SOLID[t[yy * W + xx]];
  return (s(x, y - 1) ? 1 : 0) | (s(x + 1, y) ? 2 : 0) | (s(x, y + 1) ? 4 : 0) | (s(x - 1, y) ? 8 : 0);
}
function grassKind(wd, x, y) {
  for (let k = 1; k < 14; k++) {
    const t = wd.tile[(y - k) * wd.w + x];
    if (t === T.VINE) continue;
    return t === T.JGRASS ? 1 : t === T.BGRASS ? 2 : 0;
  }
  return 0;
}
function drawChunk(R, wd, cx, cy, cv) {
  const S = R.S, x = cv.getContext('2d');
  x.imageSmoothingEnabled = false;
  x.clearRect(0, 0, CPX, CPX);
  const W = wd.w, tx0 = cx * CH, ty0 = cy * CH;
  const tx1 = Math.min(W, tx0 + CH), ty1 = Math.min(wd.h, ty0 + CH);
  for (let ty = ty0; ty < ty1; ty++) for (let tx = tx0; tx < tx1; tx++) {
    const wl = wd.wall[ty * W + tx];
    if (wl && S.walls[wl]) x.drawImage(S.walls[wl], ((hash2(tx, ty, 1) * 3) | 0) * 16, 0, 16, 16, (tx - tx0) * 16, (ty - ty0) * 16, 16, 16);
  }
  for (let ty = ty0; ty < ty1; ty++) for (let tx = tx0; tx < tx1; tx++) {
    const i = ty * W + tx, t = wd.tile[i];
    if (!t) continue;
    const lx = (tx - tx0) * 16, ly = (ty - ty0) * 16, m = wd.meta[i], d = TILE[t];
    if (S.tiles[t]) {
      x.drawImage(S.tiles[t], neighborMask(wd, tx, ty) * 16, ((hash2(tx, ty, 2) * 3) | 0) * 16, 16, 16, lx, ly, 16, 16);
    } else if (d.furn) {
      const dx = m & 3, dy = (m >> 2) & 3, fl = (m >> 4) & 1;
      const src = fl ? S.furnFlip[t] : S.furn[t];
      if (src) x.drawImage(src, (fl ? d.furn.w - 1 - dx : dx) * 16, dy * 16, 16, 16, lx, ly, 16, 16);
    } else switch (t) {
      case T.PLATFORM: {
        const l = wd.tile[i - 1], r = wd.tile[i + 1];
        const k = ((l === T.PLATFORM || SOLID[l]) ? 1 : 0) | ((r === T.PLATFORM || SOLID[r]) ? 2 : 0);
        x.drawImage(S.deco.platform[k], lx, ly); break;
      }
      case T.TORCH: x.drawImage(S.deco.torch, lx, ly); break;
      case T.TREE: {
        const kind = (m >> 4) & 3, fr = m & 8 ? 3 : m & 4 ? 4 : (hash2(tx, ty, 3) * 3) | 0;
        x.drawImage(S.trees[kind].trunk, fr * 16, 0, 16, 16, lx, ly, 16, 16); break;
      }
      case T.CACTUS: x.drawImage(S.deco.cactus[m & 4 ? 1 : 0], lx, ly); break;
      case T.VINE: x.drawImage(S.deco.vines[grassKind(wd, tx, ty)][(tx + ty) & 1], lx, ly); break;
      case T.PLANT: { const b = wd.tile[i + W]; const k = b === T.JGRASS ? 1 : b === T.BGRASS ? 2 : 0; x.drawImage(S.deco.plants[k][m % 6], lx, ly); break; }
      case T.GLOWCAP: x.drawImage(S.deco.glowcap, lx, ly); break;
      case T.SAPLING: x.drawImage(S.deco.sapling, lx, ly); break;
    }
  }
}
function getChunk(R, wd, cx, cy) {
  const key = cy * 1000 + cx;
  let c = R.chunks.get(key);
  if (c && !c.dirty) { R.chunks.delete(key); R.chunks.set(key, c); return c.cv; }
  if (!c) {
    const cv = R.pool.pop() || mk(CPX, CPX);
    c = { cv, dirty: true };
    R.chunks.set(key, c);
    if (R.chunks.size > 140) { const old = R.chunks.keys().next().value; R.pool.push(R.chunks.get(old).cv); R.chunks.delete(old); }
  }
  drawChunk(R, wd, cx, cy, c.cv);
  c.dirty = false;
  return c.cv;
}

// ------------------------------------------------------------------ background
function drawSky(G, R, cx) {
  const ctx = R.ctx, W = R.W, H = R.H, sk = G.sky;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, sk.top); g.addColorStop(1, sk.bottom);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (sk.stars > 0.02) {
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 160; i++) {
      const x = ((hash2(i, 1, 9) * W * 2 - cx * 0.02) % W + W) % W, y = hash2(i, 2, 9) * H * 0.75;
      ctx.globalAlpha = sk.stars * (0.45 + 0.55 * Math.abs(Math.sin(G.tick * 0.02 + i)));
      const s = hash2(i, 3, 9) < 0.15 ? 3 : 2;
      ctx.fillRect(x | 0, y | 0, s, s);
    }
    ctx.globalAlpha = 1;
  }
  const arcPos = f => [W * (0.08 + 0.84 * f), H * 0.62 - Math.sin(f * Math.PI) * H * 0.52];
  if (sk.sunF >= 0) {
    const [x, y] = arcPos(sk.sunF);
    const rg = ctx.createRadialGradient(x, y, 10, x, y, 110);
    rg.addColorStop(0, 'rgba(255,250,200,0.55)'); rg.addColorStop(1, 'rgba(255,250,200,0)');
    ctx.fillStyle = rg; ctx.fillRect(x - 110, y - 110, 220, 220);
    ctx.fillStyle = '#fff4a0'; ctx.beginPath(); ctx.arc(x, y, 30, 0, 7); ctx.fill();
    ctx.fillStyle = '#ffffe0'; ctx.beginPath(); ctx.arc(x - 6, y - 6, 16, 0, 7); ctx.fill();
  }
  if (sk.moonF >= 0) {
    const [x, y] = arcPos(sk.moonF);
    ctx.fillStyle = G.time.bloodMoon ? '#ff6050' : '#e8ecf8'; ctx.beginPath(); ctx.arc(x, y, 24, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(150,160,190,0.6)';
    for (const [ox, oy, r] of [[-8, -5, 5], [7, 6, 4], [2, -10, 3]]) { ctx.beginPath(); ctx.arc(x + ox, y + oy, r, 0, 7); ctx.fill(); }
    const ph = sk.phase;
    if (ph !== 4) { ctx.fillStyle = sk.top; ctx.beginPath(); ctx.arc(x + (ph < 4 ? -1 : 1) * (8 + Math.abs(4 - ph) * 5), y, 24, 0, 7); ctx.fill(); }
  }
  // clouds
  const ca = 0.25 + 0.6 * sk.bright;
  for (let i = 0; i < 9; i++) {
    const spd = 0.15 + (i % 3) * 0.1;
    const x = (((i * 397 + G.tick * spd - cx * 0.06) % (W + 400)) + W + 400) % (W + 400) - 200;
    const y = 50 + ((i * 97) % 220);
    ctx.globalAlpha = ca * (0.6 + (i % 3) * 0.15);
    ctx.fillStyle = G.time.rain > 0.2 ? '#b8c0c8' : '#ffffff';
    const s = 1 + (i % 3) * 0.4;
    for (const [ox, oy, r] of [[0, 0, 26], [30, -10, 32], [62, 0, 24], [30, 8, 26]]) { ctx.beginPath(); ctx.arc(x + ox * s, y + oy * s, r * s, 0, 7); ctx.fill(); }
  }
  ctx.globalAlpha = 1;
}
function drawParallax(G, R, cx, cy, z) {
  const ctx = R.ctx, W = R.W, H = R.H, S = R.S, bright = G.sky.bright;
  const gy = (G.bg.groundY - cy) * z;
  const dark = Math.min(0.9, (1 - bright) * 0.95);
  const entries = Object.entries(G.bg.w).filter(e => e[1] > 0.01).sort((a, b) => b[1] - a[1]);
  for (let L = 0; L < 3; L++) {
    for (const [name, wgt] of entries) {
      const layer = S.par[name][L], s = z * 1.1, lw = layer.img.width * s;
      const f = [0.2, 0.35, 0.55][L], sp = [0.08, 0.16, 0.3][L];
      const yb = H / 2 + (gy - H / 2) * f - [70, 40, 10][L] * z;
      const dy = Math.round(yb - layer.base * s);
      let ox = -(((cx * z * sp) % lw) + lw) % lw;
      ctx.globalAlpha = wgt;
      for (let x = ox; x < W; x += lw) {
        ctx.drawImage(layer.img, Math.round(x), dy, Math.ceil(lw) + 1, Math.round(layer.img.height * s));
        if (dark > 0.01) { ctx.globalAlpha = wgt * dark; ctx.drawImage(layer.sil, Math.round(x), dy, Math.ceil(lw) + 1, Math.round(layer.img.height * s)); ctx.globalAlpha = wgt; }
      }
      const bottom = dy + layer.img.height * s;
      if (bottom < H) { ctx.fillStyle = mix(layer.fill, '#060818', dark); ctx.fillRect(0, Math.floor(bottom) - 1, W, H - bottom + 2); }
    }
  }
  ctx.globalAlpha = 1;
}

// ------------------------------------------------------------------ entities
const lerp = (a, b, t) => a + (b - a) * t;
function drawRot(ctx, img, x, y, rot, flip = false, sx = 1) {
  ctx.save(); ctx.translate(Math.round(x), Math.round(y)); ctx.rotate(rot); if (flip) ctx.scale(-1, 1);
  ctx.drawImage(img, -img.width / 2 * sx, -img.height / 2 * sx, img.width * sx, img.height * sx); ctx.restore();
}
function drawBone(ctx, img, x0, y0, x1, y1) {
  const len = Math.hypot(x1 - x0, y1 - y0);
  ctx.save(); ctx.translate(Math.round(x0), Math.round(y0)); ctx.rotate(Math.atan2(y1 - y0, x1 - x0));
  ctx.drawImage(img, -4, -img.height / 2, len + 8, img.height); ctx.restore();
}
function drawEnemy(G, R, ctx, e, a) {
  const S = R.S, d = e.d, x = lerp(e.px, e.x, a), y = lerp(e.py, e.y, a), cx = x + e.w / 2, cy = y + e.h / 2;
  if (e.flash > 0 && (e.flash & 2)) ctx.globalAlpha = 0.55;
  if (e.fade != null && e.fade < 1) ctx.globalAlpha *= Math.max(0, e.fade);
  if (d.human) drawHumanoid(ctx, x, y, HUMAN[d.human], { dir: e.dir, walk: e.anim, air: !e.onGround, style: d.style });
  else if (d.worm) {
    const sp = S.en[d.worm.spr];
    for (let i = e.segs.length - 1; i >= 0; i--) { const s = e.segs[i]; drawRot(ctx, i === e.segs.length - 1 ? sp.tail : sp.body, lerp(s.px, s.x, a), lerp(s.py, s.y, a), s.rot || 0); }
    drawRot(ctx, sp.head, cx, cy, e.rot);
  } else if (d.ai === 'omni') drawRot(ctx, (e.p2 ? S.boss.eye2 : S.boss.eye1)[(e.t >> 3) & 1], cx, cy, e.rot);
  else if (d.ai === 'warden') {
    // bone arms from the skull's shoulders to each hand (upper arm + forearm with a simple elbow bend)
    for (const h of e.hands || []) {
      if (h.dead) continue;
      const sx = cx + h.side * 22, sy = cy + 26, hx = lerp(h.px, h.x, a) + h.w / 2, hy = lerp(h.py, h.y, a) + h.h / 2 + 10;
      const dx = hx - sx, dy = hy - sy, dist = Math.hypot(dx, dy) || 1, L = 78;
      const bend = dist < L * 2 ? Math.sqrt(L * L - (dist / 2) * (dist / 2)) : 0;
      let nx = -dy / dist, ny = dx / dist;
      if (nx * h.side < 0) { nx = -nx; ny = -ny; }
      const ex = sx + dx / 2 + nx * bend, ey = sy + dy / 2 + ny * bend;
      drawBone(ctx, S.boss.armBone, sx, sy, ex, ey); drawBone(ctx, S.boss.armBone, ex, ey, hx, hy);
    }
    drawRot(ctx, S.boss.skull, cx, cy, e.rot);
  } else if (d.ai === 'hand') drawRot(ctx, S.boss.hand, cx, cy, e.rot, e.side < 0);
  else if (d.ai === 'wall') {
    const tex = S.boss.wallTex, fl = e.mdir < 0;
    for (let yy = y - (y % 64); yy < y + e.h; yy += 64) for (let xx = 0; xx < e.w; xx += 64) ctx.drawImage(tex, 0, 0, Math.min(64, e.w - xx), 64, x + xx, yy, Math.min(64, e.w - xx), 64);
    const rim = S.boss.wallRim, fx = fl ? x : x + e.w;
    for (let yy = y - (y % 64); yy < y + e.h; yy += 64) {
      ctx.save(); ctx.translate(Math.round(fx), Math.round(yy)); if (fl) ctx.scale(-1, 1); ctx.drawImage(rim, -6, 0); ctx.restore();
    }
    // the eyes turn to follow the player
    const p = G.player, ex = fl ? x - 2 : x + e.w + 2;
    for (const oy of [-190, 190]) {
      const rel = Math.max(-0.75, Math.min(0.75, Math.atan2(p.y + 21 - (cy + oy), (p.x + 10 - ex) * e.mdir)));
      drawRot(ctx, S.boss.wallEye, ex, cy + oy, fl ? -rel : rel, fl, 1.4);
    }
    drawRot(ctx, S.boss.wallMouth, ex, cy, 0, fl, 1.4);
  } else if (d.ai === 'hungry') {
    ctx.strokeStyle = '#5e1624'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(e.ax, e.ay);
    ctx.quadraticCurveTo((e.ax + cx) / 2, (e.ay + cy) / 2 + 18, cx, cy); ctx.stroke();
    ctx.strokeStyle = '#a83a4c'; ctx.lineWidth = 2; ctx.stroke();
    drawRot(ctx, S.boss.hungry[e.frame || 0], cx, cy, e.rot);
  } else if (d.ai === 'monarch') {
    const img = S.boss.monarch, s = e.scale || 1, sq = e.squash || 0;
    ctx.save(); ctx.translate(Math.round(cx), Math.round(y + e.h)); ctx.scale(s * (1 + sq), s * (1 - sq));
    ctx.drawImage(img, -img.width / 2, -img.height); ctx.restore();
  } else if (d.ai === 'rimehorn') {
    const img = S.boss.rime[e.frame || 0];
    ctx.save(); ctx.translate(Math.round(cx), Math.round(y + e.h)); if (e.dir < 0) ctx.scale(-1, 1);
    ctx.drawImage(img, -img.width / 2 + 4, -img.height + 2); ctx.restore();
  } else if (d.ai === 'shadowhand') {
    const img = S.boss.shadowHand[e.frame || 0];
    ctx.globalAlpha *= 0.9; drawRot(ctx, img, cx, y + e.h - img.height / 2, 0, e.dir < 0);
  } else if (d.ai === 'tether') {
    ctx.strokeStyle = '#2e7a1a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(e.ax, e.ay); ctx.lineTo(cx, cy); ctx.stroke();
    ctx.strokeStyle = '#4aa02a'; ctx.lineWidth = 2; ctx.stroke();
    drawRot(ctx, S.en.snapvine[e.frame || 0], cx, cy, e.rot);
  } else {
    const fr = S.en[d.spr];
    const img = fr[(e.frame || 0) % fr.length];
    const rotates = d.ai === 'flyer' || d.ai === 'homing';
    if (rotates) drawRot(ctx, img, cx, cy, e.rot);
    else drawRot(ctx, img, cx, y + e.h - img.height / 2, 0, e.dir < 0);
  }
  ctx.globalAlpha = 1;
}
function drawPlayer(G, R, ctx, a) {
  const p = G.player, S = R.S;
  if (p.dead) return;
  const x = lerp(p.px, p.x, a), y = lerp(p.py, p.y, a) + p.stepOff;
  const st = { dir: p.dir, walk: p.walk, air: !p.onGround, armor: p.armor.map(it => it && PAL[ITEMS[it.id].spr.pal]) };
  if (p.iframes > 0 && (p.iframes & 4)) st.alpha = 0.45;
  const d = p.useItem && ITEMS[p.useItem];
  if (p.useKind && d) {
    const spr = S.items[p.useItem];
    if (p.useKind === 'swing' && p.swing) {
      st.arm = p.swing.cur - Math.PI / 2; st.itemSpr = spr; st.itemRot = Math.PI * 0.75; st.itemScale = (d.len || 30) / 19;
    } else if (p.useKind === 'place' || p.useKind === 'use') {
      const k = 1 - p.useT / p.useMax, phi = p.useKind === 'use' ? -1.9 : -1.3 + 1.9 * k;
      st.arm = phi - Math.PI / 2; st.itemSpr = spr; st.itemRot = Math.PI * 0.75; st.itemScale = 0.8;
    } else if (p.useKind === 'point') {
      let phi = p.dir > 0 ? p.useAngle : Math.PI - p.useAngle;
      if (phi > Math.PI) phi -= Math.PI * 2;
      st.arm = phi - Math.PI / 2;
      if (!d.throwBoom) {
        const tpl = d.spr.tpl;
        st.itemSpr = spr;
        if (tpl === 'gun') { st.itemRot = Math.PI / 2; st.grip = [4, 9]; }
        else if (tpl === 'bow') { st.itemRot = Math.PI / 2; st.grip = [8, 8]; }
        else { st.itemRot = Math.PI * 0.75; st.grip = [2, 13]; }
      }
    }
  } else {
    const held = p.inv[p.sel];
    if (held && ITEMS[held.id].light && !G.ui.cursor) { st.arm = -0.9; st.itemSpr = S.items[held.id]; st.itemRot = 0.9; st.grip = [8, 14]; st.itemScale = 0.9; }
  }
  drawHumanoid(ctx, x, y, p.look, st);
  if (p.breath < CFG.player.breath) {
    const n = Math.ceil(p.breath / CFG.player.breath * 10);
    for (let i = 0; i < n; i++) ctx.drawImage(S.bubble, x - 18 + i * 6, y - 14, 6, 6);
  }
}
function drawProj(R, ctx, pr, a) {
  const S = R.S, d = pr.d, x = lerp(pr.px, pr.x, a) + pr.w / 2, y = lerp(pr.py, pr.y, a) + pr.h / 2;
  switch (d.draw) {
    case 'arrow': drawRot(ctx, S.items[pr.type === 'flame_arrow' ? 'flaming_arrow' : 'wooden_arrow'], x, y, pr.rot + Math.PI / 4); break;
    case 'bullet': ctx.save(); ctx.translate(x, y); ctx.rotate(pr.rot); ctx.fillStyle = 'rgba(255,230,150,0.5)'; ctx.fillRect(-10, -1, 10, 2); ctx.fillStyle = d.col; ctx.fillRect(-2, -1.5, 5, 3); ctx.restore(); break;
    case 'star': drawRot(ctx, S.items.fallen_star, x, y, pr.t * 0.3); break;
    case 'bone': drawRot(ctx, S.items.bone, x, y, pr.t * 0.3); break;
    case 'boomer': drawRot(ctx, S.items.gyre_boomerang, x, y, pr.rot); break;
    case 'spike': {
      // telegraph: frost cracks the ground, then the spike bursts up and sinks again
      const gy = pr.gy, grow = pr.t < pr.delay ? 0 : Math.min(1, (pr.t - pr.delay) / 5) * Math.min(1, (pr.life - pr.t) / 10);
      if (pr.t < pr.delay) { ctx.fillStyle = (pr.t >> 1) & 1 ? '#bfe8ff' : '#6aa8d8'; ctx.fillRect(x - 7, gy - 2, 14, 2); }
      const img = S.boss.iceSpike, h = img.height * grow;
      if (h > 1) ctx.drawImage(img, 0, 0, img.width, img.height, Math.round(x - img.width / 2), Math.round(gy - h), img.width, Math.round(h));
      break;
    }
    case 'laser': ctx.save(); ctx.translate(x, y); ctx.rotate(pr.rot); ctx.fillStyle = d.col; ctx.fillRect(-14, -2.5, 28, 5); ctx.fillStyle = '#fff0d0'; ctx.fillRect(-12, -1, 24, 2); ctx.restore(); break;
    default:
      ctx.fillStyle = d.col; ctx.beginPath(); ctx.arc(x, y, pr.w / 2, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(x - 1, y - 1, pr.w / 5, 0, 7); ctx.fill();
  }
}

// ------------------------------------------------------------------ liquids
const LIQ = [[40, 110, 230, 0.58], [255, 106, 20, 0.95]];
function drawLiquids(G, ctx, tx0, ty0, tx1, ty1) {
  const wd = G.world, L = G.light;
  for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
    const i = ty * wd.w + tx, l = wd.liq[i];
    if (!l || SOLID[wd.tile[i]]) continue;
    const type = wd.ltype[i], c = LIQ[type];
    const above = ty > 0 && wd.liq[i - wd.w] > 0;
    const h = above ? 16 : Math.max(1, Math.round(l / 255 * 16));
    const k = (ty - L.y0) * L.w + tx - L.x0;
    const lr = type ? 1 : Math.min(1, L.r[k] * 1.05), lg = type ? 1 : Math.min(1, L.g[k] * 1.05), lb = type ? 1 : Math.min(1, L.b[k] * 1.05);
    ctx.fillStyle = `rgba(${(c[0] * lr) | 0},${(c[1] * lg) | 0},${(c[2] * lb) | 0},${c[3]})`;
    ctx.fillRect(tx * TS, ty * TS + 16 - h, 16, h);
    if (!above) {
      ctx.fillStyle = type ? '#ffd060' : `rgba(${(170 * lr) | 0},${(215 * lg) | 0},${(255 * lb) | 0},0.75)`;
      ctx.fillRect(tx * TS, ty * TS + 16 - h, 16, 1);
    }
  }
}

// ------------------------------------------------------------------ main render
export function renderGame(G, R, a) {
  const ctx = R.ctx, sctx = R.sctx, S = R.S, wd = G.world, W = R.W, H = R.H, z = G.settings.zoom;
  const c = G.cam;
  let cx = lerp(c.px, c.x, a), cy = lerp(c.py, c.y, a);
  if (c.shake > 0) { cx += (Math.random() - 0.5) * c.shake; cy += (Math.random() - 0.5) * c.shake; }
  R.cx = cx; R.cy = cy; R.z = z;
  // the scene is rendered at native pixel-art resolution (1 world px = 1 px) and upscaled once
  const fx = Math.floor(cx), fy = Math.floor(cy);
  const sw = Math.ceil(W / z) + 2, sh = Math.ceil(H / z) + 2;
  if (R.scene.width !== sw || R.scene.height !== sh) {
    R.scene.width = R.mask.width = sw; R.scene.height = R.mask.height = sh;
    sctx.imageSmoothingEnabled = false; R.mctx.imageSmoothingEnabled = false;
  }
  const vw = W / z, vh = H / z;
  const tx0 = Math.max(0, Math.floor(cx / TS) - 1), ty0 = Math.max(0, Math.floor(cy / TS) - 1);
  const tx1 = Math.min(wd.w - 1, Math.ceil((cx + vw) / TS) + 1), ty1 = Math.min(wd.h - 1, Math.ceil((cy + vh) / TS) + 1);
  computeLighting(G, tx0, ty0, tx1, ty1);
  // dirty chunks
  for (const k of wd.dirty) { const ch = R.chunks.get(k); if (ch) ch.dirty = true; }
  wd.dirty.clear();

  drawSky(G, R, cx);
  drawParallax(G, R, cx, cy, z);

  sctx.setTransform(1, 0, 0, 1, 0, 0);
  sctx.clearRect(0, 0, sw, sh);
  sctx.setTransform(1, 0, 0, 1, -fx, -fy);
  sctx.imageSmoothingEnabled = false;
  // underground backdrop
  const bands = [[wd.surfaceLine, wd.rockLine, S.bd.dirt], [wd.rockLine, wd.hellLine, S.bd.stone], [wd.hellLine, wd.h, S.bd.hell]];
  for (const [y0, y1, img] of bands) {
    const top = Math.max(y0 * TS, cy), bot = Math.min(y1 * TS, cy + vh);
    if (bot <= top) continue;
    if (!img.pat) img.pat = sctx.createPattern(img, 'repeat');
    sctx.fillStyle = img.pat; sctx.fillRect(cx, top, vw + 1, bot - top);
    if (y0 === wd.surfaceLine && top === y0 * TS) { sctx.fillStyle = '#2a1d14'; sctx.fillRect(cx, top, vw + 1, 3); }
  }
  // columns whose local surface sits above the global surface line get the dirt backdrop too (dug pits, shallow caves)
  if (!S.bd.dirt.pat) S.bd.dirt.pat = sctx.createPattern(S.bd.dirt, 'repeat');
  sctx.fillStyle = S.bd.dirt.pat;
  for (let tx = tx0; tx <= tx1; tx++) {
    const top = Math.max((wd.surf[tx] + 3) * TS, cy), bot = Math.min(wd.surfaceLine * TS, cy + vh);
    if (bot > top) sctx.fillRect(tx * TS, top, TS, bot - top);
  }
  // chunks
  for (let cyc = Math.floor(ty0 / CH); cyc <= Math.floor(ty1 / CH); cyc++) for (let cxc = Math.floor(tx0 / CH); cxc <= Math.floor(tx1 / CH); cxc++) sctx.drawImage(getChunk(R, wd, cxc, cyc), cxc * CPX, cyc * CPX);
  // trees, branches, cactus arms
  for (let ty = Math.max(0, ty0 - 1); ty <= Math.min(wd.h - 1, ty1 + 6); ty++) for (let tx = Math.max(0, tx0 - 4); tx <= Math.min(wd.w - 1, tx1 + 4); tx++) {
    const i = ty * wd.w + tx, t = wd.tile[i];
    if (t !== T.TREE && t !== T.CACTUS) continue;
    const m = wd.meta[i], X = tx * TS, Y = ty * TS;
    if (t === T.TREE) {
      const tr = S.trees[(m >> 4) & 3];
      if (m & 1) sctx.drawImage(tr.branchL, X - 20, Y - 4);
      if (m & 2) sctx.drawImage(tr.branchR, X + 12, Y - 4);
      if (m & 4) sctx.drawImage(tr.canopy, X + 8 - (tr.cw >> 1), Y + 12 - tr.ch);
    } else {
      if (m & 1) sctx.drawImage(S.deco.cactusArmL, X - 12, Y);
      if (m & 2) sctx.drawImage(S.deco.cactusArm, X + 12, Y);
    }
  }
  // crack overlays
  for (const [i, e] of wd.dmg) {
    const tx = i % wd.w, ty = (i / wd.w) | 0;
    if (tx < tx0 || tx > tx1 || ty < ty0 || ty > ty1) continue;
    const hp = TILE[wd.tile[i]].hp;
    sctx.drawImage(S.crack[Math.min(3, Math.floor(e.d / hp * 4))], tx * TS, ty * TS);
  }
  // dropped items
  for (const it of G.items) {
    const x = lerp(it.px, it.x, a), y = lerp(it.py, it.y, a) + Math.sin((G.tick + x) * 0.05) * 1.5;
    if (x < cx - 32 || x > cx + vw + 32 || y < cy - 32 || y > cy + vh + 32) continue;
    sctx.drawImage(S.items[it.id], Math.round(x) - 2, Math.round(y) - 4);
  }
  // NPCs
  for (const n of G.npcs) drawHumanoid(sctx, lerp(n.px, n.x, a) - 1, lerp(n.py, n.y, a) - 2, n.d.look, { dir: n.dir, walk: n.walk, air: !n.onGround });
  // enemies
  for (const e of G.enemies) {
    if (e.x > cx + vw + 200 || e.x + e.w < cx - 200 || (e.y > cy + vh + 200 && !e.segs) || (e.y + e.h < cy - 200 && !e.segs)) continue;
    drawEnemy(G, R, sctx, e, a);
  }
  drawPlayer(G, R, sctx, a);
  // grappling hook chain
  const hk = G.player.hook;
  if (hk && !G.player.dead) {
    const px = lerp(G.player.px, G.player.x, a) + 10, py = lerp(G.player.py, G.player.y, a) + 16;
    const hx = lerp(hk.px, hk.x, a), hy = lerp(hk.py, hk.y, a), d = Math.hypot(hx - px, hy - py), n = Math.floor(d / 6);
    sctx.fillStyle = '#8a8a94';
    for (let k = 0; k < n; k++) sctx.fillRect(px + (hx - px) * k / n - 1.5, py + (hy - py) * k / n - 1.5, 3, 3);
    drawRot(sctx, S.items.grappling_hook, hx, hy, Math.atan2(hy - py, hx - px) + Math.PI / 4);
  }
  for (const pr of G.projectiles) drawProj(R, sctx, pr, a);
  for (const p of G.particles) if (!p.glow) { const sz = Math.max(1, p.size * Math.min(1, p.life / p.max * 1.6)); sctx.fillStyle = p.col; sctx.fillRect(p.x - sz / 2, p.y - sz / 2, sz, sz); }

  // ---- lighting composite
  const L = G.light;
  if (R.light.width !== L.w || R.light.height !== L.h) { R.light.width = L.w; R.light.height = L.h; R.limg = R.lctx.createImageData(L.w, L.h); }
  const px = R.limg.data, n = L.w * L.h;
  for (let k = 0; k < n; k++) {
    const o = k * 4;
    px[o] = Math.min(255, L.r[k] * 270); px[o + 1] = Math.min(255, L.g[k] * 270); px[o + 2] = Math.min(255, L.b[k] * 270); px[o + 3] = 255;
  }
  R.lctx.putImageData(R.limg, 0, 0);
  const mctx = R.mctx;
  mctx.setTransform(1, 0, 0, 1, 0, 0); mctx.clearRect(0, 0, sw, sh); mctx.drawImage(R.scene, 0, 0);
  sctx.globalCompositeOperation = 'multiply';
  sctx.imageSmoothingEnabled = true;
  sctx.drawImage(R.light, L.x0 * TS, L.y0 * TS, L.w * TS, L.h * TS);
  sctx.imageSmoothingEnabled = false;
  sctx.setTransform(1, 0, 0, 1, 0, 0);
  sctx.globalCompositeOperation = 'destination-in';
  sctx.drawImage(R.mask, 0, 0);
  sctx.globalCompositeOperation = 'source-over';
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(R.scene, 0, 0, sw, sh, Math.round(-(cx - fx) * z), Math.round(-(cy - fy) * z), sw * z, sh * z);

  // ---- liquids (drawn after the light composite so translucency stays correct), tinted by per-cell light
  ctx.save();
  ctx.setTransform(z, 0, 0, z, -cx * z, -cy * z);
  drawLiquids(G, ctx, tx0, ty0, tx1, ty1);
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalCompositeOperation = 'lighter';
  for (const p of G.particles) if (p.glow) { ctx.globalAlpha = p.life / p.max; ctx.fillStyle = p.col; ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size); }
  for (const pr of G.projectiles) if (pr.d.light) {
    const x = lerp(pr.px, pr.x, a) + pr.w / 2, y = lerp(pr.py, pr.y, a) + pr.h / 2;
    ctx.globalAlpha = 0.35; ctx.fillStyle = pr.d.col; ctx.beginPath(); ctx.arc(x, y, pr.w, 0, 7); ctx.fill();
  }
  for (const s of G.stars) {
    const x = lerp(s.px, s.x, a), y = lerp(s.py, s.y, a);
    ctx.globalAlpha = 1; ctx.drawImage(S.items.fallen_star, x - 8, y - 8);
    ctx.globalAlpha = 0.3; ctx.fillStyle = '#ffe070'; ctx.beginPath(); ctx.arc(x, y, 12, 0, 7); ctx.fill();
  }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  // housing overlay
  const hv = G.ui.housingView;
  if (hv && hv.t > 0) {
    ctx.fillStyle = hv.ok ? 'rgba(60,255,90,0.28)' : 'rgba(255,60,60,0.28)';
    for (const i of hv.cells) ctx.fillRect((i % wd.w) * TS, ((i / wd.w) | 0) * TS, TS, TS);
  }
  // tile cursor highlight
  const tc = G.ui.tileCursor;
  if (tc) { ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 1 / z * 2; ctx.strokeRect(tc[0] * TS + 0.5, tc[1] * TS + 0.5, TS - 1, TS - 1); }
  ctx.restore();
  drawDread(G, R, ctx, cx, cy, z, a);
  // damage text (screen space)
  ctx.textAlign = 'center';
  for (const t of G.texts) {
    const sx = (t.x - cx) * z, sy = (t.y - cy) * z;
    ctx.globalAlpha = Math.min(1, t.life / t.max * 2);
    ctx.font = t.label ? 'bold 15px Trebuchet MS, sans-serif' : `bold ${t.crit ? 22 : 17}px Trebuchet MS, sans-serif`;
    ctx.lineWidth = 3; ctx.strokeStyle = '#000'; ctx.strokeText(t.txt, sx, sy);
    ctx.fillStyle = t.col; ctx.fillText(t.txt, sx, sy);
  }
  ctx.globalAlpha = 1;
  // rain
  if (G.time.rain > 0.02 && G.player.y / 16 < wd.surfaceLine + 10) {
    ctx.strokeStyle = 'rgba(170,195,235,0.45)'; ctx.lineWidth = 1.5;
    ctx.beginPath();
    const nR = Math.floor(260 * G.time.rain);
    for (let i = 0; i < nR; i++) {
      const x = ((hash2(i, 5, 1) * (W + 200) + G.tick * 3 - cx * z * 0.5) % (W + 200) + W + 200) % (W + 200) - 100;
      const y = ((hash2(i, 6, 1) * H + G.tick * (14 + hash2(i, 7, 1) * 6)) % H);
      ctx.moveTo(x, y); ctx.lineTo(x - 4, y + 16);
    }
    ctx.stroke();
  }
}

function drawDread(G, R, ctx, cx, cy, z, a) {
  const p = G.player, b = p.buffs.find(q => q.id === 'dread');
  if (!b || p.dead) return;
  const px = (lerp(p.px, p.x, a) + 10 - cx) * z, py = (lerp(p.py, p.y, a) + 21 - cy) * z;
  const k = Math.min(1, b.t / 60), r0 = 70 * z, r1 = 190 * z;
  const gr = ctx.createRadialGradient(px, py, r0, px, py, r1);
  gr.addColorStop(0, 'rgba(4,2,10,0)'); gr.addColorStop(1, `rgba(4,2,10,${(0.94 * k).toFixed(3)})`);
  ctx.fillStyle = gr; ctx.fillRect(0, 0, R.W, R.H);
}

// ------------------------------------------------------------------ title background
export function renderTitleBg(G, R) {
  const t = G.tick;
  const ctx = R.ctx, W = R.W, H = R.H, S = R.S;
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#3a78d8'); g.addColorStop(1, '#a8d4ff');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 7; i++) {
    const x = (((i * 397 + t * (0.3 + (i % 3) * 0.15)) % (W + 400)) + W + 400) % (W + 400) - 200, y = 60 + ((i * 97) % 200);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (const [ox, oy, r] of [[0, 0, 26], [30, -10, 32], [62, 0, 24], [30, 8, 26]]) { ctx.beginPath(); ctx.arc(x + ox, y + oy, r, 0, 7); ctx.fill(); }
  }
  const z = Math.max(1.5, H / 480);
  for (let L = 0; L < 3; L++) {
    const layer = S.par.forest[L], s = z * 1.1, lw = layer.img.width * s;
    const sp = [0.3, 0.6, 1.1][L];
    const dy = Math.round(H * 0.72 - [70, 40, 10][L] * z - layer.base * s);
    let ox = -((t * sp) % lw);
    for (let x = ox; x < W; x += lw) ctx.drawImage(layer.img, Math.round(x), dy, Math.ceil(lw) + 1, Math.round(layer.img.height * s));
    const bottom = dy + layer.img.height * s;
    ctx.fillStyle = layer.fill; ctx.fillRect(0, bottom - 1, W, H - bottom + 2);
  }
  // grassy ground strip
  const gs = z * 2, ts = 16 * gs, gy = Math.round(H * 0.86);
  for (let x = -((t * 1.6) % ts); x < W; x += ts) {
    ctx.drawImage(S.tiles[T.GRASS], 14 * 16, 0, 16, 16, Math.round(x), gy, ts + 1, ts);
    for (let k = 1; k < 4; k++) ctx.drawImage(S.tiles[T.DIRT], 15 * 16, ((k + Math.floor(x)) & 1) * 16, 16, 16, Math.round(x), gy + k * ts, ts + 1, ts);
  }
}
