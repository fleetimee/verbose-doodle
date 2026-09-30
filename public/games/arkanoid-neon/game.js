/* Arkanoid Neon — byggt av Claude Opus 5.5 (claude-opus-5-5), Anthropic.
   Vanilla JS + Canvas 2D + Web Audio. Inga beroenden. */
'use strict';
(() => {
  // ---------- Konstanter ----------
  const W = 720, H = 900;
  const WALL = 22, TOP = 84;
  const FL = WALL, FR = W - WALL, FT = TOP;
  const COLS = 13, BW = (FR - FL) / COLS, BH = 28, BTOP = TOP + 44;
  const PY = H - 70, PH = 18;
  const PADDLE_W = 104, PADDLE_WIDE = 164;
  const BALL_R = 7.5;
  const SPR = 2; // upplösning för förrenderade sprites
  const DISPLAY = '"Orbitron","Avenir Next","Helvetica Neue",Arial,sans-serif';
  const BODY = '"Rajdhani","Avenir Next","Helvetica Neue",Arial,sans-serif';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rand = (a, b) => a + Math.random() * (b - a);
  const mf = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // ---------- Färger ----------
  function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function shade(h, f) {
    const [r, g, b] = hexRgb(h), t = f < 0 ? 0 : 255, p = Math.abs(f);
    return `rgb(${Math.round((t - r) * p + r)},${Math.round((t - g) * p + g)},${Math.round((t - b) * p + b)})`;
  }
  function rgba(h, a) { const [r, g, b] = hexRgb(h); return `rgba(${r},${g},${b},${a})`; }

  const BT = {
    w: { col: '#eef3ff', pts: 50 },  o: { col: '#ff9838', pts: 60 },
    c: { col: '#2ee6ff', pts: 70 },  g: { col: '#45f58a', pts: 80 },
    r: { col: '#ff3b5c', pts: 90 },  b: { col: '#3f7cff', pts: 100 },
    m: { col: '#ff4bd6', pts: 110 }, y: { col: '#ffe045', pts: 120 },
    S: { col: '#b8c2d8', silver: true }, G: { col: '#ffbf2e', gold: true },
  };

  const POW = {
    E: { col: '#3f7cff', name: 'EXTEND',   w: 18 },
    S: { col: '#ff9838', name: 'SLOW',     w: 16 },
    C: { col: '#45f58a', name: 'CATCH',     w: 14 },
    L: { col: '#ff3b5c', name: 'LASER',     w: 14 },
    D: { col: '#2ee6ff', name: 'TRIPLE', w: 16 },
    P: { col: '#c9d2e6', name: 'EXTRA LIFE',  w: 5 },
    B: { col: '#ff4bd6', name: 'PORTAL',    w: 4 },
  };

  // ---------- Banor (13 kolumner) ----------
  const LEVELS = [
    { name: 'RAINBOW', map: [
      '.............',
      'SSSSSSSSSSSSS',
      'rrrrrrrrrrrrr',
      'yyyyyyyyyyyyy',
      'bbbbbbbbbbbbb',
      'mmmmmmmmmmmmm',
      'ggggggggggggg',
    ] },
    { name: 'STAIRCASE', map: [
      'w............',
      'wo...........',
      'woc..........',
      'wocg.........',
      'wocgr........',
      'wocgrb.......',
      'wocgrbm......',
      'wocgrbmy.....',
      'wocgrbmyw....',
      'wocgrbmywo...',
      'wocgrbmywoc..',
      'wocgrbmywocg.',
      'SSSSSSSSSSSSr',
    ] },
    { name: 'GOLD WALL', map: [
      'ggggggggggggg',
      '.............',
      'wwwGGGGGGGGGG',
      '.............',
      'rrrrrrrrrrrrr',
      '.............',
      'GGGGGGGGGGbbb',
      '.............',
      'mmmmmmmmmmmmm',
      '.............',
      'ccccccGcccccc',
    ] },
    { name: 'INVADER', map: [
      '.............',
      '...g.....g...',
      '....g...g....',
      '...ggggggg...',
      '..ggcgggcgg..',
      '.ggggggggggg.',
      '.g.ggggggg.g.',
      '.g.g.....g.g.',
      '....gg.gg....',
      '.............',
      'SSS.SSSSS.SSS',
    ] },
    { name: 'PYRAMID', map: [
      '......y......',
      '.....yoy.....',
      '....yoGoy....',
      '...yoGrGoy...',
      '..yoGrmrGoy..',
      '.yoGrmbmrGoy.',
      'yoGrmbSbmrGoy',
    ] },
    { name: 'PILLAR HALL', map: [
      'b.r.g.y.m.c.w',
      'b.r.g.y.m.c.w',
      'b.r.g.y.m.c.w',
      'b.r.g.y.m.c.w',
      'b.r.g.y.m.c.w',
      'b.r.g.y.m.c.w',
      'S.S.S.S.S.S.S',
      '.............',
      'G...G...G...G',
    ] },
    { name: 'HEART', map: [
      '.............',
      '..rrr...rrr..',
      '.rmmmr.rmmmr.',
      'rmwwmmrmmmmmr',
      'rmwmmmmmmmmmr',
      'rmmmmmmmmmmmr',
      '.rmmmmmmmmmr.',
      '..rmmmmmmmr..',
      '...rmmmmmr...',
      '....rmmmr....',
      '.....rmr.....',
      '......r......',
      '.............',
      'GGG.......GGG',
    ] },
    { name: 'FORTRESS', map: [
      'SSSSSSSSSSSSS',
      'S...........S',
      'S.yyyyyyyyy.S',
      'S.y.......y.S',
      'S.y.bbbbb.y.S',
      'S.y.bGGGb.y.S',
      'S.y.bbbbb.y.S',
      'S.y.......y.S',
      'S.yyyyyyyyy.S',
      'S...........S',
      'SSSSSS.SSSSSS',
    ] },
  ];
  const HUES = [220, 275, 195, 150, 30, 250, 335, 205];

  // ---------- Canvas ----------
  const cv = document.getElementById('game');
  const ctx = cv.getContext('2d');
  let scale = 1;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const s = Math.min(innerWidth / W, innerHeight / H);
    const cw = Math.max(1, Math.floor(W * s)), ch = Math.max(1, Math.floor(H * s));
    cv.style.width = cw + 'px'; cv.style.height = ch + 'px';
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    scale = cv.width / W;
  }
  addEventListener('resize', resize);
  resize();

  function mk(w, h) {
    const c = document.createElement('canvas');
    c.width = Math.ceil(w * SPR); c.height = Math.ceil(h * SPR);
    const g = c.getContext('2d'); g.scale(SPR, SPR);
    return [c, g];
  }
  function rr(g, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  // ---------- Förrenderade sprites ----------
  const BPAD = 12;
  function brickSprite(col, metal) {
    const w = BW - 3, h = BH - 3;
    const [c, g] = mk(w + BPAD * 2, h + BPAD * 2);
    g.translate(BPAD, BPAD);
    g.shadowColor = rgba(col, metal ? 0.45 : 0.8);
    g.shadowBlur = metal ? 8 : 15;
    g.fillStyle = col; rr(g, 0, 0, w, h, 5); g.fill();
    g.shadowBlur = 0; g.shadowColor = 'transparent';
    const gr = g.createLinearGradient(0, 0, 0, h);
    if (metal) {
      gr.addColorStop(0, shade(col, 0.75)); gr.addColorStop(0.42, shade(col, 0.15));
      gr.addColorStop(0.5, shade(col, -0.3)); gr.addColorStop(1, shade(col, 0.05));
    } else {
      gr.addColorStop(0, shade(col, 0.5)); gr.addColorStop(0.45, col); gr.addColorStop(1, shade(col, -0.5));
    }
    g.fillStyle = gr; rr(g, 0, 0, w, h, 5); g.fill();
    g.save(); rr(g, 0, 0, w, h, 5); g.clip();
    if (metal) {
      g.globalAlpha = 0.3; g.fillStyle = '#fff';
      for (let i = -1; i < 4; i++) {
        const sx = i * 18;
        g.beginPath(); g.moveTo(sx, h); g.lineTo(sx + 10, 0); g.lineTo(sx + 15, 0); g.lineTo(sx + 5, h); g.fill();
      }
      g.globalAlpha = 1;
    }
    const hl = g.createLinearGradient(0, 0, 0, h * 0.55);
    hl.addColorStop(0, 'rgba(255,255,255,.75)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = hl; rr(g, 2.5, 1.5, w - 5, h * 0.45, 3.5); g.fill();
    g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(0, h - 4, w, 4);
    g.restore();
    g.lineWidth = 1;
    g.strokeStyle = 'rgba(255,255,255,.35)'; rr(g, 1, 1, w - 2, h - 2, 4); g.stroke();
    g.strokeStyle = shade(col, -0.65); rr(g, 0.5, 0.5, w - 1, h - 1, 5); g.stroke();
    return c;
  }
  const SPRITES = {};
  for (const k in BT) SPRITES[k] = brickSprite(BT[k].col, BT[k].silver || BT[k].gold);

  function glowSprite(col, r) {
    const [c, g] = mk(r * 2, r * 2);
    const gr = g.createRadialGradient(r, r, 0, r, r, r);
    gr.addColorStop(0, rgba(col, 0.9)); gr.addColorStop(0.22, rgba(col, 0.35)); gr.addColorStop(1, rgba(col, 0));
    g.fillStyle = gr; g.fillRect(0, 0, r * 2, r * 2);
    return c;
  }
  const GLOW_BALL = glowSprite('#7fe9ff', 34);
  const GLOW_RED = glowSprite('#ff4060', 14);

  function buildBackground(hue) {
    const [c, g] = mk(W, H);
    const gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, `hsl(${hue},55%,13%)`);
    gr.addColorStop(0.6, `hsl(${hue + 20},60%,6%)`);
    gr.addColorStop(1, `hsl(${hue + 40},70%,3%)`);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 6; i++) {
      const x = rand(0, W), y = rand(0, H * 0.75), r = rand(140, 320);
      const rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, `hsla(${hue + rand(-50, 70)},90%,55%,.14)`);
      rg.addColorStop(1, 'hsla(0,0%,0%,0)');
      g.fillStyle = rg; g.fillRect(0, 0, W, H);
    }
    // hexagonrutnät
    g.strokeStyle = `hsla(${hue},90%,70%,.07)`; g.lineWidth = 1;
    const s = 26, hh = s * Math.sqrt(3);
    for (let row = -1; (row * hh) / 2 < H + hh; row++) {
      for (let col = -1; col * s * 3 < W + s * 3; col++) {
        const cx = col * s * 3 + (row & 1 ? s * 1.5 : 0), cy = (row * hh) / 2;
        g.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (i * TAU) / 6;
          const px = cx + Math.cos(a) * s, py = cy + Math.sin(a) * s;
          i ? g.lineTo(px, py) : g.moveTo(px, py);
        }
        g.closePath(); g.stroke();
      }
    }
    // ljusare mot mitten, mörkare ner mot paddeln
    const fade = g.createLinearGradient(0, H * 0.55, 0, H);
    fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(1, 'rgba(0,0,0,.45)');
    g.fillStyle = fade; g.fillRect(0, 0, W, H);
    return c;
  }

  function buildFrame(hue) {
    const [c, g] = mk(W, H);
    const neon = `hsl(${hue},100%,65%)`;
    // HUD-panel
    const hp = g.createLinearGradient(0, 0, 0, FT - WALL);
    hp.addColorStop(0, '#05070f'); hp.addColorStop(1, '#0b1022');
    g.fillStyle = hp; g.fillRect(0, 0, W, FT - WALL);
    const metal = (x, y, w, h, vertical) => {
      const gr = vertical ? g.createLinearGradient(x, 0, x + w, 0) : g.createLinearGradient(0, y, 0, y + h);
      gr.addColorStop(0, '#20263b'); gr.addColorStop(0.3, '#9aa5bf'); gr.addColorStop(0.5, '#eef2fb');
      gr.addColorStop(0.7, '#6f7a96'); gr.addColorStop(1, '#161b2c');
      g.fillStyle = gr; g.fillRect(x, y, w, h);
    };
    metal(0, FT - WALL, WALL, H - (FT - WALL), true);
    metal(FR, FT - WALL, WALL, H - (FT - WALL), true);
    metal(0, FT - WALL, W, WALL, false);
    // skarvar med lysdioder
    const led = (x, y, w, h) => {
      g.fillStyle = '#0d1120'; g.fillRect(x, y, w, h);
      g.save(); g.shadowColor = neon; g.shadowBlur = 10; g.fillStyle = neon;
      if (w > h) g.fillRect(x + 3, y + h / 2 - 1.5, w - 6, 3); else g.fillRect(x + w / 2 - 1.5, y + 3, 3, h - 6);
      g.restore();
    };
    for (let y = FT + 60; y < H - 20; y += 110) { led(0, y, WALL, 14); led(FR, y, WALL, 14); }
    for (let x = 100; x < W - 60; x += 130) led(x, FT - WALL, 14, WALL);
    // hörn
    for (const x of [0, FR]) {
      const gr = g.createRadialGradient(x + WALL / 2, FT - WALL / 2, 1, x + WALL / 2, FT - WALL / 2, WALL);
      gr.addColorStop(0, '#fff'); gr.addColorStop(0.4, '#8f9ab5'); gr.addColorStop(1, '#1b2034');
      g.fillStyle = gr; g.fillRect(x, FT - WALL, WALL, WALL);
    }
    // inre neonkant
    g.save();
    g.shadowColor = neon; g.shadowBlur = 14;
    g.strokeStyle = `hsla(${hue},100%,78%,.95)`; g.lineWidth = 2;
    g.beginPath(); g.moveTo(FL + 1, H); g.lineTo(FL + 1, FT + 1); g.lineTo(FR - 1, FT + 1); g.lineTo(FR - 1, H); g.stroke();
    g.restore();
    // neonlinje under HUD
    g.fillStyle = `hsla(${hue},100%,70%,.5)`; g.fillRect(0, FT - WALL - 1, W, 1);
    return c;
  }

  function buildVignette() {
    const [c, g] = mk(W, H);
    const rg = g.createRadialGradient(W / 2, H * 0.45, H * 0.28, W / 2, H * 0.5, H * 0.85);
    rg.addColorStop(0, 'rgba(0,0,0,0)'); rg.addColorStop(1, 'rgba(0,0,0,.5)');
    g.fillStyle = rg; g.fillRect(0, 0, W, H);
    g.fillStyle = 'rgba(0,0,0,.07)';
    for (let y = 0; y < H; y += 3) g.fillRect(0, y, W, 1);
    return c;
  }
  const VIGNETTE = buildVignette();
  let bgCanvas = null, frameCanvas = null;

  const stars = Array.from({ length: 110 }, () => ({ x: rand(0, W), y: rand(0, H), z: rand(0.2, 1), tw: rand(0, TAU) }));

  // ---------- Ljud ----------
  const Snd = {
    ctx: null, out: null, sfx: null, mus: null, arpBus: null, noiseBuf: null,
    muted: false, musicOn: true, nextT: 0, step: 0,
    init() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const c = (this.ctx = new AC());
      const comp = c.createDynamicsCompressor();
      comp.threshold.value = -16; comp.ratio.value = 4;
      comp.connect(c.destination);
      this.out = c.createGain(); this.out.gain.value = this.muted ? 0 : 0.7; this.out.connect(comp);
      this.sfx = c.createGain(); this.sfx.gain.value = 0.9; this.sfx.connect(this.out);
      this.mus = c.createGain(); this.mus.gain.value = this.musicOn ? 0.3 : 0; this.mus.connect(this.out);
      // eko på arpeggiot
      this.arpBus = c.createGain(); this.arpBus.connect(this.mus);
      const d = c.createDelay(); d.delayTime.value = 0.375;
      const fb = c.createGain(); fb.gain.value = 0.35;
      const wet = c.createGain(); wet.gain.value = 0.45;
      this.arpBus.connect(d); d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(this.mus);
      const len = c.sampleRate;
      this.noiseBuf = c.createBuffer(1, len, c.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      this.nextT = c.currentTime + 0.1;
      setInterval(() => this.schedule(), 25);
    },
    tone(f, dur, o = {}) {
      const c = this.ctx, t = c.currentTime + (o.when || 0) + (o.at || 0);
      const osc = c.createOscillator(), g = c.createGain();
      osc.type = o.type || 'square';
      osc.frequency.setValueAtTime(f, t);
      if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
      const v = o.vol ?? 0.2;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(v, t + (o.attack || 0.004));
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      let node = osc;
      if (o.lp) {
        const fl = c.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = o.lp; fl.Q.value = o.q || 1;
        osc.connect(fl); node = fl;
      }
      node.connect(g); g.connect(o.dest || this.sfx);
      osc.start(t); osc.stop(t + dur + 0.05);
    },
    noise(dur, o = {}) {
      const c = this.ctx, t = c.currentTime + (o.when || 0) + (o.at || 0);
      const src = c.createBufferSource(); src.buffer = this.noiseBuf;
      const fl = c.createBiquadFilter(); fl.type = o.ft || 'bandpass'; fl.frequency.value = o.f || 2000; fl.Q.value = o.q || 0.8;
      const g = c.createGain();
      g.gain.setValueAtTime(o.vol ?? 0.2, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(fl); fl.connect(g); g.connect(o.dest || this.sfx);
      src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
    },
    play(name, arg) {
      if (!this.ctx || G.demo) return;
      const T = (f, d, o) => this.tone(f, d, o);
      switch (name) {
        case 'paddle': T(300, 0.09, { vol: 0.13, slide: 520 }); T(150, 0.14, { type: 'triangle', vol: 0.3 }); break;
        case 'wall': T(900, 0.035, { type: 'triangle', vol: 0.07 }); break;
        case 'brick': {
          const sc = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31];
          const m = 60 + sc[clamp(13 - (arg || 0), 0, 13)];
          T(mf(m), 0.12, { vol: 0.1, lp: 3500 }); T(mf(m + 12), 0.09, { type: 'triangle', vol: 0.12 });
          this.noise(0.06, { vol: 0.07, f: 3000 });
          break;
        }
        case 'silver': T(1480, 0.18, { type: 'sine', vol: 0.15 }); T(1975, 0.14, { type: 'sine', vol: 0.1 }); this.noise(0.04, { vol: 0.1, f: 6000, ft: 'highpass' }); break;
        case 'gold': T(2093, 0.32, { type: 'sine', vol: 0.14 }); T(3136, 0.22, { type: 'sine', vol: 0.08 }); T(1046, 0.12, { type: 'triangle', vol: 0.1 }); break;
        case 'launch': T(440, 0.15, { vol: 0.1, slide: 880 }); break;
        case 'catch': T(220, 0.12, { type: 'triangle', vol: 0.3, slide: 110 }); break;
        case 'laser': T(1700, 0.12, { type: 'sawtooth', vol: 0.06, slide: 260 }); break;
        case 'power': [0, 4, 7, 12, 16].forEach((s, i) => T(mf(72 + s), 0.12, { vol: 0.09, when: i * 0.05, lp: 4000 })); break;
        case 'life': [0, 4, 7, 12, 7, 12, 16, 19].forEach((s, i) => T(mf(72 + s), 0.14, { vol: 0.1, when: i * 0.07, lp: 4000 })); break;
        case 'lose': T(440, 1.0, { type: 'sawtooth', vol: 0.16, slide: 40, lp: 2000 }); T(220, 1.0, { vol: 0.08, slide: 30 }); this.noise(0.7, { vol: 0.35, f: 400, ft: 'lowpass' }); break;
        case 'clear': [0, 4, 7, 12, 7, 12, 16, 19, 24].forEach((s, i) => T(mf(64 + s), 0.2, { vol: 0.1, when: i * 0.09, lp: 4000 })); break;
        case 'start': [0, 7, 12, 19].forEach((s, i) => T(mf(60 + s), 0.16, { vol: 0.09, when: i * 0.08, lp: 3000 })); break;
        case 'over': [12, 7, 3, 0, -5].forEach((s, i) => T(mf(57 + s), 0.4, { type: 'triangle', vol: 0.22, when: i * 0.22 })); break;
        case 'warp': T(150, 0.9, { type: 'sawtooth', vol: 0.1, slide: 2400, lp: 5000 }); this.noise(0.9, { vol: 0.12, f: 1500 }); break;
        case 'ui': T(660, 0.05, { vol: 0.07 }); break;
      }
    },
    schedule() {
      const c = this.ctx;
      if (c.state !== 'running') return;
      if (this.nextT < c.currentTime - 0.2) this.nextT = c.currentTime + 0.05;
      const spb = 60 / 120 / 2; // åttondelar i 120 bpm
      while (this.nextT < c.currentTime + 0.15) {
        if (this.musicOn && !this.muted && G.state !== 'paused' && G.state !== 'over') this.musicStep(this.step, this.nextT - c.currentTime);
        this.nextT += spb; this.step++;
      }
    },
    musicStep(s, at) {
      const roots = [57, 53, 48, 55];            // Am  F  C  G
      const thirds = [3, 4, 4, 4];
      const bar = Math.floor(s / 8) % 4, i = s % 8;
      const root = roots[bar], third = thirds[bar];
      const chord = [0, third, 7, 12, 7 + 12, third + 12];
      // bas
      const bassNote = root - 12 + (i % 2 ? 12 : 0);
      this.tone(mf(bassNote), 0.22, { type: 'sawtooth', vol: 0.12, lp: 650, q: 4, dest: this.mus, at });
      // arpeggio
      const pat = [0, 1, 2, 3, 4, 3, 2, 5];
      this.tone(mf(root + 12 + chord[pat[i]]), 0.16, { type: 'triangle', vol: 0.07, dest: this.arpBus, at });
      // trummor
      if (i % 4 === 0) this.tone(150, 0.22, { type: 'sine', vol: 0.45, slide: 38, dest: this.mus, at });
      if (i % 4 === 2) this.noise(0.12, { vol: 0.12, f: 1800, dest: this.mus, at });
      if (i % 2 === 1) this.noise(0.03, { vol: 0.05, f: 9000, ft: 'highpass', dest: this.mus, at });
    },
    toggleMute() {
      this.muted = !this.muted;
      if (this.out) this.out.gain.value = this.muted ? 0 : 0.7;
      return !this.muted;
    },
    toggleMusic() {
      this.musicOn = !this.musicOn;
      if (this.mus) this.mus.gain.value = this.musicOn ? 0.3 : 0;
      return this.musicOn;
    },
  };

  // ---------- Speltillstånd ----------
  const G = {
    state: 'title', demo: true, score: 0, hi: 0, lives: 3, stage: 1, nextLife: 30000,
    bricks: [], balls: [], caps: [], lasers: [], parts: [], texts: [],
    shake: 0, flash: 0, t: 0, st: 0, levelT: 0, banner: 0, bannerMax: 1, hue: 220,
    power: null, speed: 400, gate: false, warped: false, newHi: false,
    mouseX: null, fireHeld: false, toast: null,
  };
  const paddle = { x: W / 2, w: PADDLE_W, tw: PADDLE_W, cd: 0, hit: 0 };
  try { G.hi = +localStorage.getItem('arkanoid-neon-hi') || 0; } catch (e) { /* ingen lagring */ }
  function saveHi() {
    if (G.score > G.hi) { G.hi = G.score; G.newHi = true; }
    try { localStorage.setItem('arkanoid-neon-hi', String(G.hi)); } catch (e) { /* ingen lagring */ }
  }

  const levelIndex = () => (G.stage - 1) % LEVELS.length;
  const loopNo = () => Math.floor((G.stage - 1) / LEVELS.length);
  const baseSpeed = () => Math.min(390 + (G.stage - 1) * 16, 640);
  const maxSpeed = () => baseSpeed() + 190;

  function loadLevel() {
    const L = LEVELS[levelIndex()];
    const silverHp = 2 + loopNo();
    G.bricks = [];
    L.map.forEach((row, r) => {
      for (let c = 0; c < COLS; c++) {
        const k = row[c], t = BT[k];
        if (!t) continue;
        const hp = t.gold ? Infinity : t.silver ? silverHp : 1;
        G.bricks.push({
          x: FL + c * BW, y: BTOP + r * BH, w: BW, h: BH, k, row: r, hp, max: hp,
          pts: t.silver ? 50 * G.stage : t.pts, gold: !!t.gold, silver: !!t.silver,
          flash: 0, dead: false, appear: r * 0.045 + Math.abs(c - 6) * 0.03,
        });
      }
    });
    G.hue = HUES[levelIndex()];
    bgCanvas = buildBackground(G.hue);
    frameCanvas = buildFrame(G.hue);
    G.levelT = 0;
  }

  function newBall() {
    return { x: paddle.x, y: PY - PH / 2 - BALL_R, dx: 0, dy: -1, stuck: true, off: (Math.random() < 0.5 ? -1 : 1) * 20, st: 0, trail: [] };
  }
  function serve() {
    G.balls = [newBall()];
    G.caps = []; G.lasers = [];
    G.power = null; G.gate = false;
    paddle.tw = PADDLE_W;
    G.speed = baseSpeed();
  }
  function startGame() {
    Snd.init();
    G.demo = false; G.score = 0; G.lives = 3; G.stage = 1; G.nextLife = 30000; G.newHi = false;
    G.parts = []; G.texts = [];
    beginStage();
  }
  function beginStage() {
    loadLevel();
    paddle.x = W / 2; paddle.w = paddle.tw = PADDLE_W;
    serve();
    G.state = 'play'; G.st = 0; G.banner = G.bannerMax = 2.4; G.warped = false;
    Snd.play('start');
  }
  function startDemo() {
    G.demo = true; G.score = 0;
    G.stage = 1 + Math.floor(Math.random() * LEVELS.length);
    G.parts = []; G.texts = [];
    loadLevel(); serve();
    G.state = 'title'; G.st = 0;
  }

  // ---------- Handlingar ----------
  function fire() {
    Snd.init();
    switch (G.state) {
      case 'title': startGame(); break;
      case 'over': if (G.st > 1) startGame(); break;
      case 'paused': togglePause(); break;
      case 'play': if (!release()) shoot(); break;
    }
  }
  function release() {
    if (!G.demo && G.banner > 1.1) return G.balls.some((b) => b.stuck);
    let any = false;
    for (const b of G.balls) {
      if (!b.stuck) continue;
      any = true; b.stuck = false;
      let a = clamp(b.off / (paddle.w / 2), -1, 1) * 1.0;
      if (Math.abs(a) < 0.15) a = 0.15 * (a < 0 ? -1 : 1);
      b.dx = Math.sin(a); b.dy = -Math.cos(a);
    }
    if (any) Snd.play('launch');
    return any;
  }
  function shoot() {
    if (G.power !== 'L' || paddle.cd > 0) return;
    paddle.cd = 0.25;
    const off = paddle.w / 2 - 12;
    G.lasers.push({ x: paddle.x - off, y: PY - PH / 2 - 4 }, { x: paddle.x + off, y: PY - PH / 2 - 4 });
    Snd.play('laser');
  }
  function togglePause() {
    if (G.state === 'play') { G.state = 'paused'; Snd.play('ui'); }
    else if (G.state === 'paused') { G.state = 'play'; Snd.play('ui'); }
  }
  function toast(text) { G.toast = { text, t: 1.6 }; }

  function addScore(p, x, y, col = '#fff') {
    if (G.demo) return;
    G.score += p;
    if (x !== undefined) G.texts.push({ x, y, text: String(p), life: 0.8, max: 0.8, col, size: 15 });
    if (G.score >= G.nextLife) {
      G.nextLife += 30000; G.lives++;
      G.texts.push({ x: W / 2, y: H * 0.62, text: 'EXTRA LIFE!', life: 1.6, max: 1.6, col: '#c9d2e6', size: 28 });
      Snd.play('life');
    }
  }

  function hitBrick(br) {
    br.flash = 1;
    const cx = br.x + br.w / 2, cy = br.y + br.h / 2;
    if (br.gold) { Snd.play('gold'); sparks(cx, cy, '#ffe7a0', 6); return; }
    br.hp--;
    if (br.hp > 0) { Snd.play('silver'); sparks(cx, cy, '#e6ecff', 8); return; }
    br.dead = true;
    const col = BT[br.k].col;
    addScore(br.pts, cx, cy, col);
    burst(cx, cy, col, 18);
    G.parts.push({ kind: 'ring', x: cx, y: cy, r: 6, vr: 170, life: 0.35, max: 0.35, col });
    Snd.play('brick', br.row);
    G.shake = Math.max(G.shake, 3);
    G.speed = Math.min(maxSpeed(), G.speed + 1.5);
    maybeDrop(br);
  }

  function maybeDrop(br) {
    if (G.balls.length > 1 || G.caps.length >= 2 || Math.random() > 0.17) return;
    let total = 0;
    for (const k in POW) total += POW[k].w;
    let r = Math.random() * total, type = 'E';
    for (const k in POW) { r -= POW[k].w; if (r <= 0) { type = k; break; } }
    G.caps.push({ x: br.x + br.w / 2, y: br.y + br.h / 2, type, t: 0 });
  }

  function applyPower(t, x) {
    const p = POW[t];
    addScore(1000, x, PY - 30, p.col);
    G.texts.push({ x: W / 2, y: H * 0.64, text: p.name, life: 1.2, max: 1.2, col: p.col, size: 30 });
    burst(x, PY - 10, p.col, 22, 320);
    if (t === 'E' || t === 'C' || t === 'L') {
      if (G.power === 'C' && t !== 'C') release();
      G.power = t;
      paddle.tw = t === 'E' ? PADDLE_WIDE : PADDLE_W;
    }
    if (t === 'S') G.speed = Math.max(baseSpeed() * 0.72, 300);
    if (t === 'D') {
      const src = G.balls.find((b) => !b.stuck) || G.balls[0];
      if (src) {
        if (src.stuck) release();
        const ang = Math.atan2(src.dx, Math.abs(src.dy)), sign = src.dy < 0 ? -1 : 1;
        for (const d of [-0.5, 0.5]) {
          const a = clamp(ang + d, -1.1, 1.1);
          G.balls.push({ x: src.x, y: src.y, dx: Math.sin(a), dy: Math.cos(a) * sign, stuck: false, off: 0, st: 0, trail: [] });
        }
      }
    }
    if (t === 'P') { G.lives++; Snd.play('life'); return; }
    if (t === 'B') G.gate = true;
    Snd.play('power');
  }

  function loseLife() {
    if (G.demo) { serve(); return; }
    G.lives--;
    G.state = 'dying'; G.st = 0; G.shake = 14; G.flash = 0.8;
    G.power = null; G.caps = []; G.lasers = []; G.gate = false;
    for (const col of ['#ff3b5c', '#b8c2d8', '#2ee6ff', '#ffffff']) burst(paddle.x, PY, col, 22, 420);
    G.parts.push({ kind: 'ring', x: paddle.x, y: PY, r: 10, vr: 420, life: 0.6, max: 0.6, col: '#ff6080' });
    Snd.play('lose');
  }
  function gameOver() {
    G.state = 'over'; G.st = 0;
    saveHi();
    Snd.play('over');
  }
  function stageClear() {
    G.state = 'clear'; G.st = 0;
    for (const b of G.balls) burst(b.x, b.y, '#7fe9ff', 20);
    G.balls = []; G.caps = []; G.lasers = [];
    saveHi();
    Snd.play('clear');
  }
  function warp() {
    G.warped = true;
    addScore(10000);
    Snd.play('warp');
    for (let i = 0; i < 40; i++) G.parts.push({ kind: 'spark', x: FR, y: PY + rand(-30, 30), vx: rand(-500, -80), vy: rand(-120, 120), life: rand(0.3, 0.8), max: 0.8, col: '#ff4bd6' });
    stageClear();
  }
  function checkClear() {
    if (G.bricks.some((b) => !b.gold)) return;
    if (G.demo) { G.stage = (G.stage % LEVELS.length) + 1; loadLevel(); serve(); return; }
    stageClear();
  }

  // ---------- Partiklar ----------
  function burst(x, y, col, n = 16, spd = 260) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), s = rand(spd * 0.25, spd), life = rand(0.4, 0.9);
      G.parts.push({ kind: 'sq', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, life, max: life, col, size: rand(2, 5) });
    }
  }
  function sparks(x, y, col, n = 8) {
    for (let i = 0; i < n; i++) {
      const a = rand(0, TAU), s = rand(120, 380), life = rand(0.15, 0.35);
      G.parts.push({ kind: 'spark', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life, max: life, col });
    }
  }
  function updateParts(dt) {
    for (const p of G.parts) {
      p.life -= dt;
      if (p.kind === 'ring') { p.r += p.vr * dt; continue; }
      p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.kind === 'sq') { p.vy += 520 * dt; p.vx *= 1 - 1.5 * dt; }
      else { p.vx *= 1 - 4 * dt; p.vy *= 1 - 4 * dt; }
    }
    G.parts = G.parts.filter((p) => p.life > 0);
    if (G.parts.length > 1500) G.parts.splice(0, G.parts.length - 1500);
    for (const t of G.texts) { t.life -= dt; t.y -= 38 * dt; }
    G.texts = G.texts.filter((t) => t.life > 0);
  }

  // ---------- Fysik ----------
  function brickAt(b) {
    for (const br of G.bricks) {
      if (br.dead) continue;
      const nx = clamp(b.x, br.x, br.x + br.w), ny = clamp(b.y, br.y, br.y + br.h);
      const dx = b.x - nx, dy = b.y - ny;
      if (dx * dx + dy * dy < BALL_R * BALL_R) return br;
    }
    return null;
  }

  function paddleHit(b) {
    const rel = clamp((b.x - paddle.x) / (paddle.w / 2), -1, 1);
    const a = rel * 1.05;
    b.dx = Math.sin(a); b.dy = -Math.cos(a);
    b.y = PY - PH / 2 - BALL_R;
    paddle.hit = 1;
    sparks(b.x, b.y + BALL_R, '#9ff3ff', 6);
    if (G.power === 'C' && !G.demo) {
      b.stuck = true; b.off = b.x - paddle.x; b.st = 0; b.trail = [];
      Snd.play('catch');
    } else Snd.play('paddle');
  }

  function updateBall(b, dt) {
    if (b.stuck) {
      b.st += dt;
      b.x = paddle.x + clamp(b.off, -paddle.w / 2 + 4, paddle.w / 2 - 4);
      b.y = PY - PH / 2 - BALL_R - 0.5;
      b.trail.length = 0;
      if (G.demo ? b.st > 0.9 : b.st > 6 && G.banner <= 0) release();
      return;
    }
    const dist = G.speed * dt;
    const steps = Math.max(1, Math.ceil(dist / (BALL_R * 0.5)));
    const step = dist / steps;
    for (let i = 0; i < steps; i++) {
      // x-axeln
      b.x += b.dx * step;
      if (b.x < FL + BALL_R) { b.x = FL + BALL_R; b.dx = Math.abs(b.dx); Snd.play('wall'); }
      else if (b.x > FR - BALL_R) { b.x = FR - BALL_R; b.dx = -Math.abs(b.dx); Snd.play('wall'); }
      else {
        const br = brickAt(b);
        if (br) { b.x -= b.dx * step; b.dx = -b.dx; hitBrick(br); }
      }
      // y-axeln
      b.y += b.dy * step;
      if (b.y < FT + BALL_R) { b.y = FT + BALL_R; b.dy = Math.abs(b.dy); Snd.play('wall'); }
      else {
        const br = brickAt(b);
        if (br) { b.y -= b.dy * step; b.dy = -b.dy; hitBrick(br); }
      }
      // paddeln
      if (b.dy > 0 && G.state !== 'dying') {
        const hw = paddle.w / 2, top = PY - PH / 2;
        if (b.y + BALL_R >= top && b.y < PY && b.x >= paddle.x - hw - BALL_R * 0.6 && b.x <= paddle.x + hw + BALL_R * 0.6) {
          paddleHit(b);
          if (b.stuck) return;
        }
      }
      if (b.y - BALL_R > H) { b.dead = true; return; }
    }
    b.trail.push({ x: b.x, y: b.y });
    if (b.trail.length > 12) b.trail.shift();
  }

  function clampPaddle() {
    const hw = paddle.w / 2;
    paddle.x = clamp(paddle.x, FL + hw, G.gate ? FR + hw : FR - hw);
  }
  function movePaddle(dt) {
    const dir = (keys.ArrowRight || keys.KeyD ? 1 : 0) - (keys.ArrowLeft || keys.KeyA ? 1 : 0);
    if (dir) { paddle.x += dir * 820 * dt; G.mouseX = null; }
    else if (G.mouseX != null) paddle.x = G.mouseX;
    clampPaddle();
  }
  function aiPaddle(dt) {
    let target = W / 2, best = null;
    for (const b of G.balls) if (!best || (b.dy > 0 && b.y > best.y)) best = b;
    if (best) target = best.x + Math.sin(G.t * 0.7) * paddle.w * 0.35;
    const maxv = 1100 * dt;
    paddle.x += clamp(target - paddle.x, -maxv, maxv);
    clampPaddle();
  }

  function simulate(dt) {
    paddle.w += (paddle.tw - paddle.w) * Math.min(1, dt * 12);
    paddle.cd -= dt;
    paddle.hit = Math.max(0, paddle.hit - dt * 6);
    if (G.state === 'play' && (G.fireHeld || keys.Space)) shoot();

    for (const b of G.balls) updateBall(b, dt);
    G.balls = G.balls.filter((b) => !b.dead);

    for (const c of G.caps) {
      c.y += 150 * dt; c.t += dt;
      if (c.y + 8 > PY - PH / 2 && c.y - 8 < PY + PH / 2 && Math.abs(c.x - paddle.x) < paddle.w / 2 + 16) {
        c.dead = true; applyPower(c.type, c.x);
      } else if (c.y > H + 20) c.dead = true;
    }
    G.caps = G.caps.filter((c) => !c.dead);

    for (const l of G.lasers) {
      const dist = 950 * dt, n = Math.ceil(dist / 10);
      for (let i = 0; i < n && !l.dead; i++) {
        l.y -= dist / n;
        if (l.y < FT) { l.dead = true; sparks(l.x, FT + 2, '#ff8090', 4); break; }
        for (const br of G.bricks) {
          if (!br.dead && l.x >= br.x && l.x <= br.x + br.w && l.y >= br.y && l.y <= br.y + br.h) {
            l.dead = true; hitBrick(br); break;
          }
        }
      }
    }
    G.lasers = G.lasers.filter((l) => !l.dead);
    G.bricks = G.bricks.filter((b) => !b.dead);

    G.speed = Math.min(maxSpeed(), G.speed + dt * 1.5);

    if (G.balls.length === 0) { loseLife(); return; }
    if (G.gate && G.state === 'play' && paddle.x + paddle.w / 2 > FR + 10) { warp(); return; }
    checkClear();
  }

  function update(dt) {
    G.t += dt; G.st += dt; G.levelT += dt;
    for (const s of stars) { s.y += s.z * 14 * dt; if (s.y > H) { s.y = 0; s.x = rand(0, W); } }
    updateParts(dt);
    G.shake = Math.max(0, G.shake - dt * 30);
    G.flash = Math.max(0, G.flash - dt * 2.5);
    if (G.toast) { G.toast.t -= dt; if (G.toast.t <= 0) G.toast = null; }
    cv.style.cursor = G.state === 'play' || G.state === 'clear' ? 'none' : 'default';
    if (G.state === 'paused') return;
    G.banner = Math.max(0, G.banner - dt);
    for (const b of G.bricks) if (b.flash > 0) b.flash = Math.max(0, b.flash - dt * 5);

    switch (G.state) {
      case 'title': aiPaddle(dt); simulate(dt); break;
      case 'play': movePaddle(dt); simulate(dt); break;
      case 'dying':
        if (G.st > 1.7) {
          if (G.lives <= 0) gameOver();
          else { serve(); paddle.w = paddle.tw; G.state = 'play'; G.st = 0; G.banner = G.bannerMax = 1.6; }
        }
        break;
      case 'clear':
        movePaddle(dt);
        if (Math.random() < dt * 7) {
          const cols = Object.values(BT).map((t) => t.col);
          const x = rand(90, W - 90), y = rand(160, 480), col = cols[(Math.random() * cols.length) | 0];
          burst(x, y, col, 26, 300);
          G.parts.push({ kind: 'ring', x, y, r: 4, vr: 220, life: 0.45, max: 0.45, col });
        }
        if (G.st > 2.8) { G.stage++; beginStage(); }
        break;
    }
  }

  // ---------- Rendering ----------
  function txt(str, x, y, o = {}) {
    ctx.save();
    ctx.font = `${o.weight || 700} ${o.size || 20}px ${o.font || DISPLAY}`;
    ctx.textAlign = o.align || 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = o.alpha ?? 1;
    if (o.spacing && 'letterSpacing' in ctx) ctx.letterSpacing = o.spacing + 'px';
    if (o.maxW) {
      const w = ctx.measureText(str).width;
      if (w > o.maxW) ctx.font = `${o.weight || 700} ${Math.floor((o.size || 20) * o.maxW / w)}px ${o.font || DISPLAY}`;
    }
    if (o.glow) { ctx.shadowColor = o.glow; ctx.shadowBlur = o.blur ?? 14; }
    ctx.fillStyle = o.color || '#fff';
    ctx.fillText(str, x, y);
    ctx.restore();
  }

  function drawStars() {
    ctx.fillStyle = '#fff';
    for (const s of stars) {
      ctx.globalAlpha = s.z * (0.45 + 0.35 * Math.sin(G.t * 2 + s.tw));
      const sz = s.z * 1.8;
      ctx.fillRect(s.x, s.y, sz, sz);
    }
    ctx.globalAlpha = 1;
  }

  function drawBricks() {
    for (const b of G.bricks) {
      const spr = SPRITES[b.k];
      let y = b.y, a = 1;
      const at = G.levelT - b.appear;
      if (at < 0.4) {
        if (at <= 0) continue;
        const k = at / 0.4;
        y -= (1 - k) * (1 - k) * 46; a = k;
      }
      ctx.globalAlpha = a;
      ctx.drawImage(spr, b.x + 1.5 - BPAD, y + 1.5 - BPAD, spr.width / SPR, spr.height / SPR);
      if (b.silver && b.hp < b.max) {
        ctx.strokeStyle = 'rgba(20,24,40,.75)'; ctx.lineWidth = 1.2;
        const cx = b.x + b.w * 0.5, cy = y + b.h * 0.5, dmg = b.max - b.hp;
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy - 2); ctx.lineTo(cx - 14, cy - 9); ctx.moveTo(cx - 4, cy - 2); ctx.lineTo(cx + 6, cy + 8);
        ctx.moveTo(cx - 4, cy - 2); ctx.lineTo(cx + 12, cy - 6);
        if (dmg > 1) { ctx.moveTo(cx + 6, cy + 8); ctx.lineTo(cx + 18, cy + 4); ctx.moveTo(cx - 14, cy - 9); ctx.lineTo(cx - 20, cy + 6); }
        ctx.stroke();
      }
      if (b.gold || b.silver) {
        const ph = (G.t * 0.45 + b.x / 900 + b.y / 1400) % (b.gold ? 1.8 : 3.2);
        if (ph < 1) {
          ctx.save();
          rr(ctx, b.x + 1.5, y + 1.5, b.w - 3, b.h - 3, 5); ctx.clip();
          const sx = b.x - 20 + ph * (b.w + 40);
          const gr = ctx.createLinearGradient(sx - 14, 0, sx + 14, 0);
          gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = gr; ctx.fillRect(b.x, y, b.w, b.h);
          ctx.restore();
        }
      }
      if (b.flash > 0) {
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = b.flash * 0.8;
        ctx.fillStyle = '#fff'; rr(ctx, b.x + 1.5, y + 1.5, b.w - 3, b.h - 3, 5); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
      }
      ctx.globalAlpha = 1;
    }
  }

  function drawCapsule(cx, cy, type, t, s = 1) {
    const col = POW[type].col, w = 38 * s, h = 16 * s, x = cx - w / 2, y = cy - h / 2;
    ctx.save();
    ctx.shadowColor = col; ctx.shadowBlur = 16;
    const gr = ctx.createLinearGradient(0, y, 0, y + h);
    gr.addColorStop(0, shade(col, 0.55)); gr.addColorStop(0.5, col); gr.addColorStop(1, shade(col, -0.55));
    ctx.fillStyle = gr; rr(ctx, x, y, w, h, h / 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.save(); rr(ctx, x, y, w, h, h / 2); ctx.clip();
    const ph = (t * 1.8) % 1, by = y - 6 + ph * (h + 12);
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.fillRect(x, by - 2.5, w, 5);
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(x, by + 5, w, 3);
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 1; rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, h / 2); ctx.stroke();
    ctx.font = `900 ${Math.round(12 * s)}px ${DISPLAY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillText(type, cx + 1, cy + 2);
    ctx.fillStyle = '#fff'; ctx.fillText(type, cx, cy + 1);
    ctx.restore();
  }

  function drawPaddle() {
    const w = paddle.w, h = PH, x = paddle.x - w / 2, y = PY - h / 2 + paddle.hit * 3;
    const glow = G.power === 'L' ? '#ff4060' : G.power === 'C' ? '#45f58a' : G.power === 'E' ? '#3f7cff' : '#2ee6ff';
    ctx.save();
    // skugga på golvet
    ctx.fillStyle = rgba(glow, 0.12);
    ctx.beginPath(); ctx.ellipse(paddle.x, PY + 26, w * 0.55, 6, 0, 0, TAU); ctx.fill();
    // laserkanoner
    if (G.power === 'L') {
      for (const sx of [x + 8, x + w - 16]) {
        const gr = ctx.createLinearGradient(sx, 0, sx + 8, 0);
        gr.addColorStop(0, '#5a1020'); gr.addColorStop(0.5, '#ff7088'); gr.addColorStop(1, '#5a1020');
        ctx.fillStyle = gr; ctx.fillRect(sx, y - 8, 8, 10);
        ctx.fillStyle = '#ffd0d8'; ctx.fillRect(sx + 2, y - 9, 4, 2);
      }
    }
    ctx.shadowColor = glow; ctx.shadowBlur = 22;
    const gr = ctx.createLinearGradient(0, y, 0, y + h);
    gr.addColorStop(0, '#f4f7ff'); gr.addColorStop(0.35, '#a3aec8'); gr.addColorStop(0.6, '#4a5470'); gr.addColorStop(1, '#c8d0e4');
    ctx.fillStyle = gr; rr(ctx, x, y, w, h, h / 2); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.save(); rr(ctx, x, y, w, h, h / 2); ctx.clip();
    const capW = 20;
    const rg = ctx.createLinearGradient(0, y, 0, y + h);
    rg.addColorStop(0, '#ffb3c0'); rg.addColorStop(0.4, '#ff2b4f'); rg.addColorStop(1, '#6a0a1e');
    ctx.fillStyle = rg; ctx.fillRect(x, y, capW, h); ctx.fillRect(x + w - capW, y, capW, h);
    ctx.fillStyle = 'rgba(10,14,28,.8)'; ctx.fillRect(x + capW, y, 2, h); ctx.fillRect(x + w - capW - 2, y, 2, h);
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(x, y + 2, w, 2);
    ctx.restore();
    // energiremsa
    const pulse = 0.6 + 0.4 * Math.sin(G.t * 8);
    ctx.shadowColor = glow; ctx.shadowBlur = 12;
    ctx.fillStyle = rgba(glow, 0.55 + 0.45 * pulse);
    rr(ctx, x + capW + 8, y + h / 2 - 1.5, w - capW * 2 - 16, 3, 1.5); ctx.fill();
    ctx.restore();
  }

  function drawBalls() {
    ctx.globalCompositeOperation = 'lighter';
    for (const b of G.balls) {
      const n = b.trail.length;
      for (let i = 0; i < n; i++) {
        const k = (i + 1) / n, p = b.trail[i];
        ctx.globalAlpha = k * 0.3; ctx.fillStyle = '#6fe3ff';
        ctx.beginPath(); ctx.arc(p.x, p.y, BALL_R * k * 0.95, 0, TAU); ctx.fill();
      }
      ctx.globalAlpha = 0.85;
      ctx.drawImage(GLOW_BALL, b.x - 34, b.y - 34, 68, 68);
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    for (const b of G.balls) {
      const gr = ctx.createRadialGradient(b.x - 2.5, b.y - 2.5, 0.5, b.x, b.y, BALL_R);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.6, '#dff8ff'); gr.addColorStop(1, '#6fc4ff');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(b.x, b.y, BALL_R, 0, TAU); ctx.fill();
    }
  }

  function drawLasers() {
    ctx.globalCompositeOperation = 'lighter';
    for (const l of G.lasers) {
      ctx.drawImage(GLOW_RED, l.x - 14, l.y - 6, 28, 28);
      ctx.strokeStyle = '#ff4a68'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(l.x, l.y); ctx.lineTo(l.x, l.y + 18); ctx.stroke();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(l.x, l.y + 1); ctx.lineTo(l.x, l.y + 16); ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  function drawGate() {
    const y0 = PY - 42, h = 84;
    ctx.save();
    ctx.fillStyle = '#050008'; ctx.fillRect(FR, y0, WALL, h);
    const pulse = 0.5 + 0.5 * Math.sin(G.t * 6);
    const gr = ctx.createLinearGradient(FR, 0, W, 0);
    gr.addColorStop(0, `rgba(255,75,214,${0.35 + 0.4 * pulse})`); gr.addColorStop(1, 'rgba(255,75,214,0)');
    ctx.fillStyle = gr; ctx.fillRect(FR, y0, WALL, h);
    ctx.shadowColor = '#ff4bd6'; ctx.shadowBlur = 18; ctx.strokeStyle = '#ff9ff0'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(FR, y0); ctx.lineTo(W, y0); ctx.moveTo(FR, y0 + h); ctx.lineTo(W, y0 + h); ctx.stroke();
    ctx.shadowBlur = 0;
    for (let i = 0; i < 3; i++) {
      const ph = (G.t * 1.5 + i / 3) % 1;
      txt('›', FR - 40 + ph * 50, PY, { size: 26, color: '#ff9ff0', alpha: Math.sin(ph * Math.PI), glow: '#ff4bd6', font: BODY });
    }
    ctx.restore();
  }

  function drawParts() {
    ctx.globalCompositeOperation = 'lighter';
    for (const p of G.parts) {
      const k = clamp(p.life / p.max, 0, 1);
      ctx.globalAlpha = k;
      if (p.kind === 'sq') {
        ctx.fillStyle = p.col;
        const s = p.size * (0.5 + k * 0.5);
        ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
      } else if (p.kind === 'spark') {
        ctx.strokeStyle = p.col; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04); ctx.stroke();
      } else {
        ctx.strokeStyle = p.col; ctx.lineWidth = 3 * k + 0.5;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.stroke();
      }
    }
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }

  function drawTexts() {
    for (const t of G.texts) {
      const k = clamp(t.life / t.max, 0, 1);
      const pop = t.size > 20 ? 1 + (1 - Math.min(1, (t.max - t.life) * 6)) * 0.4 : 1;
      txt(t.text, t.x, t.y, { size: t.size * pop, color: '#fff', glow: t.col, blur: 12, alpha: Math.min(1, k * 1.8), weight: 900 });
    }
  }

  function drawHUD() {
    const pad = (n) => String(n).padStart(7, '0');
    const hy = (FT - WALL) / 2;
    txt('SCORE', 36, hy - 12, { size: 11, align: 'left', color: `hsl(${G.hue},90%,75%)`, spacing: 3, font: BODY });
    txt(pad(G.score), 36, hy + 9, { size: 22, align: 'left', glow: `hsl(${G.hue},100%,60%)`, blur: 10 });
    txt('HIGH SCORE', W / 2, hy - 12, { size: 11, color: '#ffd76a', spacing: 3, font: BODY });
    txt(pad(Math.max(G.hi, G.score)), W / 2, hy + 9, { size: 22, color: '#fff3c4', glow: '#ffbf2e', blur: 10 });
    txt('ROUND', W - 36, hy - 12, { size: 11, align: 'right', color: `hsl(${G.hue},90%,75%)`, spacing: 3, font: BODY });
    txt(String(G.stage).padStart(2, '0'), W - 36, hy + 9, { size: 22, align: 'right', glow: `hsl(${G.hue},100%,60%)`, blur: 10 });
    if (G.demo) return;
    // liv som små paddlar
    const lives = Math.min(G.lives - 1, 8);
    for (let i = 0; i < lives; i++) {
      const x = FL + 12 + i * 34, y = H - 22;
      const gr = ctx.createLinearGradient(0, y - 4, 0, y + 4);
      gr.addColorStop(0, '#f4f7ff'); gr.addColorStop(1, '#5a6480');
      ctx.fillStyle = gr; rr(ctx, x, y - 4, 28, 8, 4); ctx.fill();
      ctx.fillStyle = '#ff2b4f'; ctx.fillRect(x + 1, y - 3, 5, 6); ctx.fillRect(x + 22, y - 3, 5, 6);
    }
    if (G.power) txt(POW[G.power].name, FR - 12, H - 22, { size: 14, align: 'right', color: POW[G.power].col, glow: POW[G.power].col, blur: 8, font: BODY, spacing: 2 });
  }

  function dim(a) { ctx.fillStyle = `rgba(3,5,14,${a})`; ctx.fillRect(0, 0, W, H); }

  function drawLogo(y) {
    const s = 'ARKANOID';
    ctx.save();
    ctx.font = `900 86px ${DISPLAY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(s).width;
    if (w > 640) ctx.font = `900 ${Math.floor(86 * 640 / w)}px ${DISPLAY}`;
    const wob = Math.sin(G.t * 1.3) * 2;
    ctx.shadowColor = '#ff4bd6'; ctx.shadowBlur = 34; ctx.fillStyle = '#ff4bd6';
    ctx.fillText(s, W / 2 + 4, y + 4 + wob);
    ctx.shadowColor = '#2ee6ff'; ctx.shadowBlur = 26;
    const gr = ctx.createLinearGradient(0, y - 44, 0, y + 44);
    gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.45, '#a8f5ff'); gr.addColorStop(0.52, '#2e7cff'); gr.addColorStop(1, '#e6f9ff');
    ctx.fillStyle = gr; ctx.fillText(s, W / 2, y + wob);
    ctx.shadowBlur = 0; ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.strokeText(s, W / 2, y + wob);
    // glans som sveper över loggan
    const ph = (G.t * 0.35) % 1.4;
    if (ph < 1) {
      ctx.globalCompositeOperation = 'source-atop';
      const sx = -100 + ph * (W + 200);
      const sg = ctx.createLinearGradient(sx - 60, 0, sx + 60, 0);
      sg.addColorStop(0, 'rgba(255,255,255,0)'); sg.addColorStop(0.5, 'rgba(255,255,255,.9)'); sg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = sg; ctx.fillText(s, W / 2, y + wob);
    }
    ctx.restore();
    txt('N E O N   E D I T I O N', W / 2, y + 66, { size: 17, color: '#ff9ff0', glow: '#ff4bd6', font: DISPLAY, weight: 700 });
  }

  function drawTitle() {
    dim(0.62);
    drawLogo(230);
    if ((G.t * 1.6) % 2 < 1.4) txt('CLICK OR PRESS SPACE', W / 2, 392, { size: 19, glow: '#2ee6ff', blur: 16 });
    txt(`HIGH SCORE  ${String(G.hi).padStart(7, '0')}`, W / 2, 436, { size: 15, color: '#ffd76a', glow: '#ffbf2e', blur: 8 });

    txt('POWER-UPS', W / 2, 505, { size: 12, color: '#8fa0c8', spacing: 4, font: BODY });
    const keysP = Object.keys(POW);
    keysP.forEach((k, i) => {
      const row = i < 4 ? 0 : 1, n = row ? 3 : 4, col = row ? i - 4 : i;
      const cx = W / 2 + (col - (n - 1) / 2) * 160, cy = 545 + row * 44;
      drawCapsule(cx - 44, cy, k, G.t + i * 0.13, 0.9);
      txt(POW[k].name, cx - 18, cy + 1, { size: 15, align: 'left', color: '#dfe7ff', font: BODY });
    });

    const ctl = [
      ['MOUSE / ← →', 'move'], ['CLICK / SPACE', 'launch · laser'],
      ['P / ESC', 'pause'], ['M · N · F', 'sound · music · fullscreen'],
    ];
    ctl.forEach(([k, v], i) => {
      const y = 660 + i * 26;
      txt(k, W / 2 - 10, y, { size: 13, align: 'right', color: '#9ff3ff', weight: 700 });
      txt(v, W / 2 + 10, y, { size: 16, align: 'left', color: '#c9d2e6', font: BODY, weight: 500 });
    });

    txt('Built by Claude Opus 5.5  ·  claude-opus-5-5  ·  Anthropic', W / 2, H - 34, { size: 14, color: '#8fa0c8', font: BODY, weight: 500, spacing: 1 });
  }

  function drawBanner() {
    const age = G.bannerMax - G.banner;
    const a = Math.min(1, age / 0.25, G.banner / 0.4);
    const L = LEVELS[levelIndex()];
    const y = 610;
    const slide = (1 - Math.min(1, age / 0.35)) * 40;
    txt(`ROUND ${G.stage}`, W / 2 - slide, y, { size: 44, weight: 900, glow: `hsl(${G.hue},100%,60%)`, blur: 22, alpha: a });
    txt(L.name + (loopNo() ? `  ·  CYCLE ${loopNo() + 1}` : ''), W / 2 + slide, y + 42, { size: 17, color: `hsl(${G.hue},90%,78%)`, alpha: a, font: DISPLAY, weight: 500, spacing: 3 });
    if (G.balls.some((b) => b.stuck) && G.banner < 1.2) {
      txt('CLICK TO LAUNCH', W / 2, y + 90, { size: 14, color: '#c9d2e6', alpha: a * (0.6 + 0.4 * Math.sin(G.t * 6)), font: BODY, spacing: 2 });
    }
  }

  function draw() {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = true;
    const sx = G.shake ? rand(-G.shake, G.shake) * 0.5 : 0, sy = G.shake ? rand(-G.shake, G.shake) * 0.5 : 0;
    ctx.save();
    ctx.translate(sx, sy);
    ctx.drawImage(bgCanvas, 0, 0, W, H);
    drawStars();
    ctx.drawImage(frameCanvas, 0, 0, W, H);
    if (G.gate) drawGate();
    drawBricks();
    for (const c of G.caps) drawCapsule(c.x, c.y, c.type, c.t);
    drawLasers();
    if (G.state !== 'dying' && G.state !== 'over') drawPaddle();
    drawBalls();
    drawParts();
    drawTexts();
    ctx.restore();
    if (G.flash > 0) { ctx.fillStyle = `rgba(255,80,110,${G.flash * 0.25})`; ctx.fillRect(0, 0, W, H); }
    ctx.drawImage(VIGNETTE, 0, 0, W, H);
    drawHUD();

    switch (G.state) {
      case 'title': drawTitle(); break;
      case 'play': if (G.banner > 0) drawBanner(); break;
      case 'paused':
        dim(0.6);
        txt('PAUSED', W / 2, H / 2 - 30, { size: 60, weight: 900, glow: '#2ee6ff', blur: 26 });
        txt('Click or press P to resume', W / 2, H / 2 + 30, { size: 18, color: '#c9d2e6', font: BODY, weight: 500 });
        txt('Q = back to menu', W / 2, H / 2 + 58, { size: 15, color: '#8fa0c8', font: BODY, weight: 500 });
        break;
      case 'clear': {
        const a = Math.min(1, G.st / 0.3);
        txt('ROUND CLEAR!', W / 2, 600, { size: 46, weight: 900, glow: '#45f58a', blur: 26, alpha: a });
        if (G.warped) txt('PORTAL BONUS  +10 000', W / 2, 650, { size: 18, color: '#ff9ff0', glow: '#ff4bd6', alpha: a });
        break;
      }
      case 'over': {
        dim(Math.min(0.7, G.st));
        const a = Math.min(1, G.st / 0.6);
        txt('GAME OVER', W / 2, H / 2 - 70, { size: 68, weight: 900, color: '#ffd0da', glow: '#ff3b5c', blur: 30, alpha: a });
        txt(`SCORE  ${String(G.score).padStart(7, '0')}`, W / 2, H / 2, { size: 24, alpha: a, glow: '#2ee6ff' });
        txt(`ROUND ${G.stage}`, W / 2, H / 2 + 34, { size: 15, alpha: a, color: '#8fa0c8' });
        if (G.newHi && (G.t * 2) % 1 < 0.7) txt('NEW HIGH SCORE!', W / 2, H / 2 + 80, { size: 26, weight: 900, color: '#fff3c4', glow: '#ffbf2e', blur: 18, alpha: a });
        if (G.st > 1) txt('Click to play again  ·  Esc for menu', W / 2, H / 2 + 140, { size: 18, color: '#c9d2e6', font: BODY, weight: 500 });
        break;
      }
    }
    if (G.toast) txt(G.toast.text, W / 2, H - 60, { size: 16, color: '#fff', glow: '#2ee6ff', alpha: Math.min(1, G.toast.t * 2), font: DISPLAY });
  }

  // ---------- Inmatning ----------
  const keys = {};
  function toGameX(clientX) { const r = cv.getBoundingClientRect(); return ((clientX - r.left) / r.width) * W; }
  addEventListener('keydown', (e) => {
    if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.code)) e.preventDefault();
    keys[e.code] = true;
    if (e.repeat) return;
    switch (e.code) {
      case 'Space': case 'Enter': case 'ArrowUp': fire(); break;
      case 'KeyP': togglePause(); break;
      case 'Escape':
        if (G.state === 'over') startDemo(); else togglePause();
        break;
      case 'KeyQ': if (G.state === 'paused' || G.state === 'over') { saveHi(); startDemo(); } break;
      case 'KeyM': Snd.init(); toast(Snd.toggleMute() ? 'SOUND ON' : 'SOUND OFF'); break;
      case 'KeyN': Snd.init(); toast(Snd.toggleMusic() ? 'MUSIC ON' : 'MUSIC OFF'); break;
      case 'KeyF':
        if (document.fullscreenElement) document.exitFullscreen?.();
        else document.documentElement.requestFullscreen?.().catch(() => {});
        break;
    }
  });
  addEventListener('keyup', (e) => { keys[e.code] = false; });
  addEventListener('mousemove', (e) => { G.mouseX = toGameX(e.clientX); });
  cv.addEventListener('mousedown', (e) => {
    e.preventDefault();
    G.mouseX = toGameX(e.clientX);
    G.fireHeld = true;
    fire();
  });
  addEventListener('mouseup', () => { G.fireHeld = false; });
  cv.addEventListener('touchstart', (e) => {
    e.preventDefault();
    G.mouseX = toGameX(e.touches[0].clientX);
    G.fireHeld = true;
    fire();
  }, { passive: false });
  cv.addEventListener('touchmove', (e) => { e.preventDefault(); G.mouseX = toGameX(e.touches[0].clientX); }, { passive: false });
  cv.addEventListener('touchend', () => { G.fireHeld = false; });
  cv.addEventListener('contextmenu', (e) => e.preventDefault());
  const autoPause = () => {
    for (const k in keys) keys[k] = false;
    G.fireHeld = false;
    if (G.state === 'play') togglePause();
  };
  addEventListener('blur', autoPause);
  document.addEventListener('visibilitychange', () => { if (document.hidden) autoPause(); });
  addEventListener('pagehide', () => { if (!G.demo) saveHi(); });

  // ---------- Huvudloop ----------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.033, Math.max(0, (now - last) / 1000));
    last = now;
    update(dt);
    draw();
    requestAnimationFrame(frame);
  }
  startDemo();
  requestAnimationFrame(frame);
  // test-krok (används inte av spelet självt)
  window.__arkanoid = { G, paddle, LEVELS };
})();
