// Opening sequence, parodying Red's: a shooting star brings in the "LEVY ST. GAMES presents" card, then a
// letterboxed battle of the two logos, CLAUDE vs CHATGPT, where Red had NIDORINO vs GENGAR, ending on their clash.
// No text in the battle itself. Any button skips (the first press
// while the browser still has sound locked just turns the sound on).
(function (G) {
  'use strict';
  const { Surface, hex, mix, hash2 } = G.gfx;
  const F = G.font;
  const NAVY = hex('#141a2e'), IVORY = hex('#f3f0e9'), ORANGE = hex('#d97757'), BLACK = hex('#000000'), WHITE = hex('#ffffff');
  const ease = t => t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;
  const PRESENTS = 330, BATTLE = 366; // the battle ends on the white of the clash

  // ---------- sprites (all drawn pixel by pixel, cached per pose) ----------
  const cache = {};
  function cached(k, f) { return cache[k] || (cache[k] = f()); }
  // alpha 0-9 mask → ivory on navy, one antialias step
  function maskSurface(rows) {
    const w = rows[0].length, h = rows.length, s = new Surface(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const a = +rows[y][x];
      if (a >= 6) s.data[y * w + x] = IVORY; else if (a >= 3) s.data[y * w + x] = mix(NAVY, IVORY, 0.5);
    }
    return s;
  }
  // 1px outline around filled pixels, then a bevel: lit up-left edges, shaded down-right ones
  function finish(s, line, lite, dark) {
    const w = s.w, h = s.h, d = s.data, src = d.slice();
    const filled = (x, y) => x >= 0 && y >= 0 && x < w && y < h && (src[y * w + x] >>> 24) !== 0;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (filled(x, y)) {
        if (!filled(x - 1, y - 1) || !filled(x, y - 1)) d[y * w + x] = lite;
        else if (!filled(x + 1, y + 1) || !filled(x, y + 1)) d[y * w + x] = dark;
      } else if (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)) d[y * w + x] = line;
    }
    return s;
  }
  // CLAUDE: the terracotta spark, as a little creature with a face in the middle
  const RAYS = [0, 31, 58, 92, 118, 149, 178, 212, 238, 269, 297, 328].map((a, i) => ({ a: a * Math.PI / 180, l: [1, 0.8, 0.96, 0.72, 0.9, 0.84, 1, 0.76, 0.94, 0.7, 0.9, 0.8][i] }));
  function claudeSprite(R, spinStep, face) {
    return cached('cl' + R + ',' + spinStep + face, () => {
      const S = Math.ceil(R * 2 + 4), c = S / 2, s = new Surface(S, S), spin = spinStep * Math.PI / 24;
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const dx = x + 0.5 - c, dy = y + 0.5 - c;
        let hit = dx * dx + dy * dy < (R * 0.31) * (R * 0.31);
        for (let k = 0; !hit && k < RAYS.length; k++) {
          const ray = RAYS[k], a = ray.a + spin, ux = Math.cos(a), uy = Math.sin(a), len = ray.l * R;
          const t = Math.max(0, Math.min(len, dx * ux + dy * uy)), px = dx - ux * t, py = dy - uy * t, w = R * (0.125 - 0.035 * t / len);
          hit = px * px + py * py < w * w;
        }
        if (hit) s.data[y * S + x] = ORANGE;
      }
      finish(s, hex('#5a2414'), hex('#f2a888'), hex('#aa4e34'));
      const cx = Math.floor(c), cy = Math.floor(c) + 1, ink = hex('#2a1208');
      if (face === 'squint') for (const ex of [cx - 4, cx + 2]) { s.rect(ex, cy, 3, 1, ink); s.pset(ex + (ex < cx ? 2 : 0), cy - 1, ink); }
      else for (const ex of [cx - 4, cx + 2]) { s.rect(ex, cy - 2, 2, 4, ink); s.pset(ex, cy - 2, WHITE); }
      s.pset(cx - 5, cy + 3, hex('#f0907a')); s.pset(cx + 4, cy + 3, hex('#f0907a'));
      return s;
    });
  }
  // CHATGPT: the six-link knot (white on a teal glow), eyes glinting in the hole in the middle
  function gptSprite(R, rotStep, eyes) {
    return cached('gp' + R + ',' + rotStep + eyes, () => {
      const S = Math.ceil(R * 2 + 6), c = S / 2, s = new Surface(S, S), rot = rotStep * Math.PI / 36, TAU = Math.PI * 2;
      const body = hex('#e4e7ec'), band = hex('#ffffff'), seam = hex('#4a525c');
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const dx = x + 0.5 - c, dy = y + 0.5 - c, r = Math.hypot(dx, dy), th = Math.atan2(dy, dx) - rot;
        const sec = ((th % (Math.PI / 3)) + Math.PI / 3) % (Math.PI / 3) - Math.PI / 6;
        const rout = R * (0.8 + 0.2 * Math.cos(sec * 3)), rin = R * 0.3 / Math.cos(sec);
        if (r >= rout || r <= rin) continue;
        let col = body;
        // pinwheel seams: each link curls from the hole out to the rim, lying over the next one
        for (let k = 0; k < 6; k++) {
          const ang = rot + k * Math.PI / 3 + 0.35 + (r - R * 0.3) / (R * 0.7) * 0.95;
          let d = Math.atan2(dy, dx) - ang; d = ((d % TAU) + TAU + Math.PI) % TAU - Math.PI;
          const px = d * r;
          if (Math.abs(px) < 0.75) { col = seam; break; }
          if (px > 0.75 && px < 2.2) col = band;
        }
        s.data[y * S + x] = col;
      }
      finish(s, hex('#10141a'), WHITE, hex('#9aa2ae'));
      const cx = Math.floor(c), cy = Math.floor(c), glow = hex('#10a37f'), eye = hex('#c8fff0');
      for (const ex of [cx - 3, cx + 2]) {
        if (eyes === 'mad') { s.rect(ex, cy, 2, 1, eye); s.pset(ex + (ex < cx ? 1 : 0), cy - 1, glow); }
        else { s.rect(ex, cy - 1, 2, 2, eye); s.pset(ex - 1, cy, glow); s.pset(ex + 2, cy, glow); }
      }
      return s;
    });
  }
  // a four-point twinkle
  function sparkle(s, x, y, r, c) {
    x = Math.round(x); y = Math.round(y);
    s.pset(x, y, c);
    for (let i = 1; i <= r; i++) { const k = i === r ? 0.45 : 0.85; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) s.pblend(x + dx * i, y + dy * i, c, k); }
  }

  // ---------- the scene ----------
  class Intro {
    constructor() { this.opaque = true; this.t = 0; this.done = false; this.parts = []; this.shake = 0; this.soundAsked = false; }
    audioOn() { const d = G.audio && G.audio._dbg && G.audio._dbg(); return !!(d && d.ctx && d.ctx.state === 'running'); }
    update(f) {
      const t = ++this.t, bt = t - PRESENTS;
      // skipping: a key or click; the first one while sound is still locked only unlocks it
      const I = G.input, pressed = I.pressed.a || I.pressed.b || I.pressed.start || (G.pointer && G.pointer.pressed);
      if (f && pressed && t > 8) {
        if (!this.wasOn && !this.soundAsked) { this.soundAsked = true; if (bt >= 0) G.music && G.music('IntroBattle'); }
        else { this.done = true; return; }
      }
      this.wasOn = this.audioOn();
      if (t === 12) G.sfx && G.sfx('teleport');
      if (bt === 0) G.music && G.music('IntroBattle');
      if (bt === 72 || bt === 100) G.sfx && G.sfx('jump');
      if (bt === 190) G.sfx && G.sfx('jump');
      if (bt === 262) G.sfx && G.sfx('hit');
      if (bt === 296) G.sfx && G.sfx('jump');
      if (bt === 352) { G.sfx && G.sfx('hit_super'); this.shake = 12; }
      if (this.shake > 0) this.shake--;
      if (t >= PRESENTS + BATTLE) this.done = true;
      for (const p of this.parts) { p.x += p.vx; p.y += p.vy; p.vy += p.g || 0; p.life--; }
      this.parts = this.parts.filter(p => p.life > 0);
    }
    draw(s) {
      if (this.t < PRESENTS) this.drawPresents(s, this.t); else this.drawBattle(s, this.t - PRESENTS);
    }

    // ----- LEVY ST. GAMES presents -----
    drawPresents(s, t) {
      const LAND = 62, fadeOut = Math.max(0, (t - (PRESENTS - 24)) / 24);
      const bgK = ease((t - LAND) / 30);
      s.clear(mix(BLACK, NAVY, bgK));
      // backdrop stars drift in once the card is up
      for (let i = 0; i < 46; i++) {
        const x = (hash2(i, 1, 3) * 320) | 0, y = (hash2(i, 2, 3) * 180) | 0, tw = (t + i * 13) % 80;
        if (bgK > 0 && tw < 60) s.pblend(x, y, IVORY, 0.25 * bgK + (tw < 6 ? 0.3 : 0));
      }
      // the shooting star: in from the top right, trailing sparks, landing where the mark will be
      const k = Math.min(1, Math.max(0, (t - 12) / (LAND - 12)));
      const sx = lerp(360, 160, ease(k)), sy = lerp(-20, 58, ease(k));
      if (t >= 12 && t < LAND) {
        for (let i = 0; i < 26; i++) {
          const kk = Math.max(0, k - i * 0.012);
          const tx = lerp(360, 160, ease(kk)), ty = lerp(-20, 58, ease(kk));
          s.pblend(tx, ty, i < 4 ? WHITE : i % 3 ? IVORY : ORANGE, 1 - i / 26);
        }
        sparkle(s, sx, sy, 3, WHITE);
        if (t % 2 === 0) this.parts.push({ x: sx, y: sy, vx: (hash2(t, 1, 9) - 0.2) * 1.2, vy: hash2(t, 2, 9) * 0.8, g: 0.03, life: 26, c: t % 4 ? IVORY : ORANGE });
      }
      for (const p of this.parts) if (p.life > 0) s.pblend(p.x, p.y, p.c, Math.min(1, p.life / 14));
      // impact ring
      if (t >= LAND && t < LAND + 18) { const r = (t - LAND) * 3; s.circle(160, 58, r, mix(NAVY, WHITE, 1 - (t - LAND) / 18)); }
      const L = G.LEVY_LOGO;
      if (L && t >= LAND) {
        const mark = cached('levy_mark', () => maskSurface(L.mark)), word = cached('levy_word', () => maskSurface(L.word));
        // the round mark blooms out of the landing star
        const g = ease((t - LAND) / 14), mw = Math.max(1, Math.round(mark.w * g)), mh = Math.max(1, Math.round(mark.h * g));
        s.blitScaled(mark, 160 - (mw >> 1), 58 - (mh >> 1), mw, mh);
        // the wordmark wipes in beneath, then GAMES and "presents"
        const wipe = Math.round(word.w * ease((t - LAND - 16) / 26));
        if (wipe > 0) s.blit(word, 160 - (word.w >> 1), 84, { sw: wipe });
        const spaced = 'G  A  M  E  S', gk = ease((t - LAND - 44) / 18);
        if (gk > 0) F.drawSmall(s, spaced, 160 - (F.measureSmall(spaced) >> 1), 117, mix(NAVY, IVORY, gk * 0.85));
        const pk = ease((t - LAND - 70) / 20);
        if (pk > 0) F.draw(s, 'presents', 160 - (F.measure('presents') >> 1), 128, mix(NAVY, IVORY, pk));
        const vk = ease((t - LAND - 110) / 24), vibe = 'VIBE CODED WITH CLAUDE OPUS 5.5';
        if (vk > 0) {
          const vw = F.measureSmall(vibe), vx = 160 - (vw >> 1) + 5;
          F.drawSmall(s, vibe, vx, 164, mix(NAVY, ORANGE, vk));
          const spark = claudeSprite(4, 0, 'eyes');
          s.blit(spark, vx - 12, 161, { alpha: vk });
        }
        // a few glints around the mark
        for (let i = 0; i < 3; i++) { const ph = (t + i * 37) % 90; if (ph < 16) sparkle(s, 160 + [-26, 24, 18][i], 58 + [-16, -12, 18][i], ph < 8 ? 2 : 1, IVORY); }
      }
      if (!this.noHints && !this.wasOn && !this.soundAsked && t > 20) F.drawSmall(s, (G.touchUI ? 'TAP FOR SOUND' : 'PRESS ANY KEY FOR SOUND'), 320 - F.measureSmall((G.touchUI ? 'TAP FOR SOUND' : 'PRESS ANY KEY FOR SOUND')) - 6, 8, hex('#5a6280'));
      if (fadeOut > 0) for (let i = 0; i < s.data.length; i++) s.data[i] = mix(s.data[i], BLACK, fadeOut);
    }

    // ----- CLAUDE vs CHATGPT -----
    drawBattle(s, bt) {
      const TOP = 22, BOT = 150, pan = Math.round(lerp(150, 0, ease(bt / 70)));
      const shx = this.shake ? ((this.shake % 2) * 2 - 1) * Math.ceil(this.shake / 4) : 0;
      // sky
      for (let y = TOP; y < BOT; y++) {
        const k = (y - TOP) / (BOT - TOP), c = k < 0.7 ? mix(hex('#0a0e2a'), hex('#2c1d58'), k / 0.7) : mix(hex('#2c1d58'), hex('#6a3a6a'), (k - 0.7) / 0.3);
        for (let x = 0; x < 320; x++) s.data[y * 320 + x] = c;
      }
      for (let i = 0; i < 60; i++) {
        const x = ((hash2(i, 5, 1) * 480 - pan * 0.15) % 320 + 320) % 320, y = TOP + hash2(i, 6, 1) * 60;
        if ((bt + i * 11) % 70 > 8) s.pset(x, y, i % 7 ? hex('#c8d0ff') : WHITE);
      }
      s.disc(62 - pan * 0.1 + shx, 44, 9, hex('#f4ecd0')); s.disc(66 - pan * 0.1 + shx, 41, 8, hex('#0e1230'));
      // data-center skyline, blinking server lights
      const SKY0 = 104;
      for (let b = 0; b < 14; b++) {
        const w = 22 + ((hash2(b, 1, 7) * 26) | 0), h = 18 + ((hash2(b, 2, 7) * 34) | 0), x0 = Math.round(b * 34 - pan * 0.45 + shx) - 20, y0 = SKY0 - h;
        s.rect(x0, y0, w, h + 20, hex('#161634'));
        s.rect(x0, y0, w, 1, hex('#2a2a5a'));
        for (let ry = y0 + 4; ry < SKY0 + 6; ry += 5) for (let rx = x0 + 3; rx < x0 + w - 3; rx += 3) {
          const on = hash2(rx + b, ry, (bt >> 3) + b) > 0.55;
          s.pset(rx, ry, on ? (hash2(rx, ry, b) > 0.8 ? hex('#ff6a5a') : hex('#58f0b0')) : hex('#23234a'));
        }
        if (b % 4 === 1) { const cx = x0 + (w >> 1); for (let k = 0; k < 4; k++) s.pblend(cx + Math.sin((bt + k * 20) / 14) * 3, y0 - 4 - ((bt + k * 12) % 26), hex('#9aa4c8'), 0.35); } // cooling steam
      }
      // ground
      for (let y = 112; y < BOT; y++) {
        const k = (y - 112) / (BOT - 112);
        for (let x = 0; x < 320; x++) {
          const stripe = ((x + pan + ((y * 3) >> 1)) >> 3) % 2;
          s.data[y * 320 + x] = mix(hex('#1c3c2c'), hex('#2e6a3e'), k * 0.8 + (stripe ? 0.08 : 0));
        }
      }
      s.rect(0, 112, 320, 1, hex('#4a8a5a'));
      // actors
      const X = x => Math.round(x + pan + shx);
      let gx = 96, gy = 132, gScale = 1, gRot = Math.floor(bt / 5), gEyes = 'eyes';
      let cx = 236, cy = 134, cSpin = 0, cFace = 'eyes';
      const hop = (t0, t1, h) => bt >= t0 && bt < t1 ? -Math.sin((bt - t0) / (t1 - t0) * Math.PI) * h : 0;
      cy += hop(72, 96, 10) + hop(100, 124, 10);
      if (bt >= 130) { gScale = 1 + 0.12 * ease((bt - 130) / 30); gRot = Math.floor(bt / 2); gEyes = 'mad'; } // winding up
      if (bt >= 190) { const k = ease((bt - 190) / 24); cx += 30 * k; cy += -Math.sin(Math.min(1, (bt - 190) / 24) * Math.PI) * 14; } // dodge back
      if (bt >= 244) { const k = ease((bt - 244) / 20); gx = lerp(96, 176, k * k); } // lunge
      if (bt >= 290) { // the leap: up over the lunge, spinning, then down onto it
        const k = Math.min(1, (bt - 290) / 62);
        cx = lerp(266, gx + 4, k); cy = lerp(134, 124, k) - Math.sin(k * Math.PI) * 78;
        cSpin = Math.floor(bt * 1.5); cFace = 'squint';
      }
      if (bt >= 352) cy = 124; // the clash: both stand their ground as it whites out
      // shadows
      s.ellipseBlend(X(gx), 134, 18 * gScale, 3, BLACK, 0.35);
      s.ellipseBlend(X(cx), 136, 11, 2, BLACK, 0.35 * (1 - Math.min(1, (134 - cy) / 90)));
      // CHATGPT's teal aura, and itself
      const R = Math.round(24 * gScale), gp = gptSprite(R, gRot % 12, gEyes);
      if (bt >= 130 && bt < 352) { const pulse = 0.18 + 0.12 * Math.sin(bt / 3); s.ellipseBlend(X(gx), gy - R, R + 6, R + 6, hex('#10a37f'), pulse); }
      s.blit(gp, X(gx) - (gp.w >> 1), Math.round(gy - R - gp.h / 2 + 2));
      // CHATGPT's energy shots arc toward where CLAUDE was standing
      if (bt >= 160 && bt < 240) for (let i = 0; i < 5; i++) {
        const k = (bt - 160 - i * 9) / 30; if (k < 0 || k > 1) continue;
        const px = lerp(gx + 20, 238, k), py = lerp(110, 124, k) - Math.sin(k * Math.PI) * 18;
        s.disc(X(px), Math.round(py), 2.5, hex('#10a37f')); sparkle(s, X(px), Math.round(py), 2, i % 2 ? hex('#b8ffe8') : WHITE);
      }
      // CHATGPT's lunge: a slash where CLAUDE used to be
      if (bt >= 262 && bt < 276) for (let i = 0; i < 3; i++) s.lineBlend(X(226 + i * 6), 104, X(246 + i * 6), 134, WHITE, 1 - (bt - 262) / 14);
      // CLAUDE
      const cs = claudeSprite(18, cSpin % 48, cFace);
      s.blit(cs, X(cx) - (cs.w >> 1), Math.round(cy - 18 - cs.h / 2 + 2));
      if (bt >= 290 && bt < 352 && bt % 3 === 0) this.parts.push({ x: cx + (hash2(bt, 3, 1) - 0.5) * 20, y: cy - 18, vx: 0, vy: 0.4, life: 16, c: ORANGE, battle: true });
      for (const p of this.parts) if (p.battle) sparkle(s, X(p.x), p.y, p.life > 8 ? 2 : 1, p.c);
      // impact: orange rays burst out, then white
      if (bt >= 352) {
        const k = (bt - 352) / 24;
        for (let i = 0; i < 16; i++) { const a = i * Math.PI / 8 + 0.2, r0 = 10 + k * 60, r1 = 30 + k * 170; s.lineBlend(X(gx) + Math.cos(a) * r0, 110 + Math.sin(a) * r0, X(gx) + Math.cos(a) * r1, 110 + Math.sin(a) * r1, i % 2 ? ORANGE : IVORY, Math.max(0, 1 - k * 0.6)); }
        const w = bt < 364 ? 1 : Math.max(0, 1 - (bt - 364) / 50);
        if (bt >= 356) for (let i = 0; i < s.data.length; i++) s.data[i] = mix(s.data[i], WHITE, bt < 364 ? (bt - 356) / 8 : w);
      }
      // letterbox
      s.rect(0, 0, 320, TOP, BLACK); s.rect(0, BOT, 320, 180 - BOT, BLACK);
      if (this.noHints) { /* attract mode: no prompts */ }
      else if (!this.wasOn && !this.soundAsked) F.drawSmall(s, (G.touchUI ? 'TAP FOR SOUND' : 'PRESS ANY KEY FOR SOUND'), 320 - F.measureSmall((G.touchUI ? 'TAP FOR SOUND' : 'PRESS ANY KEY FOR SOUND')) - 6, 8, hex('#8a90a8'));
      else if (bt < 200) F.drawSmall(s, (G.touchUI ? 'TAP TO SKIP' : 'PRESS ANY KEY TO SKIP'), 320 - F.measureSmall((G.touchUI ? 'TAP TO SKIP' : 'PRESS ANY KEY TO SKIP')) - 6, 8, hex('#5a6078'));
      // a fade from black as it opens
      if (bt < 16) for (let i = 0; i < s.data.length; i++) s.data[i] = mix(BLACK, s.data[i], bt / 16);
    }
  }

  // boot: the intro, then the title (skipped straight to the title by any button)
  G.playIntro = function () {
    G.spawnScript((function* () {
      yield* G.engine.run(new Intro());
      G.input.clear();
      G.titleScreen();
    })(), 'intro');
  };
  G.Intro = Intro;
  G.__introSprites = { gpt: gptSprite, claude: claudeSprite };
})(window.G);
