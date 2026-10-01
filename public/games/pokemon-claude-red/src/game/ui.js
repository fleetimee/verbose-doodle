// UI primitives: window frames, typewriter text box, choice menus, emotes.
(function (G) {
  'use strict';
  const { hex, rgb, mix } = G.gfx;
  const P = G.PAL, F = G.font;
  const INK = hex('#3a3a4c'), INK_SH = hex('#d6d4cc'), PAPER = hex('#fbfaf4'), PAPER2 = hex('#f1efe4');
  const THEMES = {
    blue: [hex('#1b1a2e'), hex('#3b4f96'), hex('#5c7fd0'), hex('#9fbff0'), hex('#dfeaff')],
    red: [hex('#1b1a2e'), hex('#8a2a3a'), hex('#d04a4a'), hex('#f09a8a'), hex('#ffe4dc')],
    green: [hex('#1b1a2e'), hex('#2a6a4a'), hex('#4aa06a'), hex('#9ad8a0'), hex('#e0f8e0')],
    gray: [hex('#1b1a2e'), hex('#4a4e62'), hex('#7a7f96'), hex('#b8bccc'), hex('#eceef4')],
    dark: [hex('#0d0c16'), hex('#2a2a40'), hex('#3a3a58'), hex('#5a5a80'), hex('#8a8ab0')],
  };
  let theme = 'blue';

  function frame(s, x, y, w, h, th, fill) {
    const T = THEMES[th || theme];
    // rounded outer outline
    for (let i = 2; i < w - 2; i++) { s.pset(x + i, y, T[0]); s.pset(x + i, y + h - 1, T[0]); }
    for (let j = 2; j < h - 2; j++) { s.pset(x, y + j, T[0]); s.pset(x + w - 1, y + j, T[0]); }
    s.pset(x + 1, y + 1, T[0]); s.pset(x + w - 2, y + 1, T[0]); s.pset(x + 1, y + h - 2, T[0]); s.pset(x + w - 2, y + h - 2, T[0]);
    // colored border band (3px) with light top-left bevel
    for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) {
      const edge = Math.min(i - 1, j - 1, w - 2 - i, h - 2 - j);
      if ((i === 1 || i === w - 2) && (j === 1 || j === h - 2)) continue;
      if (edge < 3) {
        let c = T[2];
        if (edge === 0) c = (i === 1 || j === 1) ? T[3] : T[1];
        else if (edge === 2) c = T[1];
        s.pset(x + i, y + j, c);
      }
    }
    // inner fill
    const f = fill === undefined ? PAPER : fill;
    if (f !== null) for (let j = 4; j < h - 4; j++) for (let i = 4; i < w - 4; i++) s.pset(x + i, y + j, (j === 4 || i === 4) ? PAPER2 : f);
    // corner rivets
    s.pset(x + 2, y + 2, T[4]); s.pset(x + w - 3, y + 2, T[3]); s.pset(x + 2, y + h - 3, T[3]); s.pset(x + w - 3, y + h - 3, T[1]);
  }
  function text(s, str, x, y, color, shadow) { return F.draw(s, str, x, y, color === undefined ? INK : color, shadow === undefined ? INK_SH : shadow); }
  function cursor(s, x, y, t) { F.draw(s, '▶', x + ((Math.floor((t || G.frame) / 16) % 2) ? 1 : 0), y, INK, INK_SH); }

  // ---------------- Text box ----------------
  const BOX = { x: 6, y: 128, w: 308, h: 48 };
  const LINE_H = 15, TEXT_W = BOX.w - 24;
  function paginate(str) {
    const pages = [];
    for (const chunk of String(str).split('\f')) {
      const lines = F.wrap(chunk, TEXT_W);
      for (let i = 0; i < lines.length; i += 2) pages.push(lines.slice(i, i + 2));
    }
    return pages;
  }
  class TextBox {
    constructor(str, opts) {
      opts = opts || {};
      this.pages = paginate(G.fmt ? G.fmt(str) : str);
      this.page = 0; this.chars = 0; this.done = false; this.opts = opts;
      this.noWait = !!opts.noWait; this.keep = !!opts.keep;
      this.speed = opts.speed || G.textSpeed || 2;
      this.t = 0; this.closing = false;
    }
    total() { return this.pages[this.page].join('\n').length; }
    update(focused) {
      if (!focused) return;
      this.t++;
      const I = G.input;
      const tot = this.total();
      if (this.chars < tot) {
        this.chars = Math.min(tot, this.chars + (I.down.a || I.down.b ? 4 : this.speed));
        if (this.chars >= tot && this.noWait && this.page === this.pages.length - 1) this.done = true;
        return;
      }
      if (this.noWait && this.page === this.pages.length - 1) { this.done = true; return; }
      if (I.pressed.a || I.pressed.b) {
        if (G.sfx) G.sfx('blip');
        if (this.page < this.pages.length - 1) { this.page++; this.chars = 0; }
        else this.done = true;
      }
    }
    draw(s) {
      frame(s, BOX.x, BOX.y, BOX.w, BOX.h, this.opts.theme);
      let left = this.chars, y = BOX.y + 10;
      for (const ln of this.pages[this.page]) {
        const part = ln.slice(0, Math.max(0, left));
        text(s, part, BOX.x + 12, y);
        left -= ln.length + 1; y += LINE_H;
      }
      if (this.chars >= this.total() && !this.noWait && (Math.floor(this.t / 20) % 2 === 0)) {
        const last = this.page === this.pages.length - 1;
        F.draw(s, last ? '▼' : '▼', BOX.x + BOX.w - 18, BOX.y + BOX.h - 13 + (Math.floor(this.t / 10) % 2), hex('#d04a4a'), INK_SH);
      }
    }
  }
  // Persistent box left on screen under a menu (e.g. question text)
  class StaticBox { constructor(str) { this.tb = new TextBox(str); this.tb.chars = 9999; this.tb.page = this.tb.pages.length - 1; this.tickBehind = false; } update() {} draw(s) { this.tb.draw(s); } }

  // ---------------- Choice menu ----------------
  class Menu {
    constructor(items, opts) {
      opts = opts || {};
      this.items = items; this.sel = opts.sel || 0; this.opts = opts;
      const w = opts.w || Math.max(...items.map(i => F.measure(String(i)))) + 30;
      // long lists scroll: show as many rows as fit on screen (below a given y, or above the text box)
      const room = opts.y !== undefined ? 178 - opts.y : BOX.y - 4;
      this.rows = Math.max(1, Math.min(items.length, opts.rows || Math.floor((room - 12) / 15)));
      const h = this.rows * 15 + 12;
      this.w = w; this.h = h;
      this.x = opts.x !== undefined ? opts.x : 320 - w - 6;
      this.y = opts.y !== undefined ? opts.y : BOX.y - h - 2;
      this.top = 0; this.follow();
      this.done = false; this.result = -1;
    }
    follow() { this.top = Math.max(0, Math.min(this.top, this.sel, this.items.length - this.rows), this.sel - this.rows + 1); }
    update(focused) {
      if (!focused) return;
      const I = G.input;
      if (I.repeat('up')) { this.sel = (this.sel + this.items.length - 1) % this.items.length; if (G.sfx) G.sfx('cursor'); }
      if (I.repeat('down')) { this.sel = (this.sel + 1) % this.items.length; if (G.sfx) G.sfx('cursor'); }
      // mouse/touch: hover or tap picks the row (the click itself arrives as A); clicks outside are ignored,
      // right click cancels (it arrives as B); the wheel scrolls (it arrives as up/down)
      const Pt = G.pointer;
      if (Pt && (Pt.moved || Pt.pressed) && Pt.inside) {
        let i = -1;
        for (let k = 0; k < this.rows; k++) if (Pt.in(this.x + 4, this.y + 5 + k * 15, this.w - 8, 15)) i = this.top + k;
        if (i >= 0 && i !== this.sel) { this.sel = i; if (Pt.moved && !Pt.pressed && G.sfx) G.sfx('cursor'); }
        if (Pt.pressed && i < 0) Pt.consume();
      }
      this.follow();
      if (I.pressed.a) { this.result = this.sel; this.done = true; if (G.sfx) G.sfx('select'); }
      else if (I.pressed.b && !this.opts.noCancel) { this.result = -1; this.done = true; }
      if (this.opts.onMove) this.opts.onMove(this.sel);
    }
    draw(s) {
      frame(s, this.x, this.y, this.w, this.h, this.opts.theme);
      for (let k = 0; k < this.rows; k++) {
        const i = this.top + k;
        text(s, String(this.items[i]), this.x + 18, this.y + 8 + k * 15);
        if (i === this.sel) cursor(s, this.x + 8, this.y + 8 + k * 15);
      }
      const ax = this.x + this.w - 14, blink = Math.floor(G.frame / 20) % 2;
      if (this.top > 0) F.draw(s, '▲', ax, this.y + 3 + blink, hex('#d04a4a'));
      if (this.top + this.rows < this.items.length) F.draw(s, '▼', ax, this.y + this.h - 13 - blink, hex('#d04a4a'));
    }
  }

  function* say(str, opts) {
    const tb = new TextBox(str, opts);
    yield* G.engine.run(tb);
  }
  function* choose(items, opts) {
    const m = new Menu(items, opts);
    return yield* G.engine.run(m);
  }
  // Show a question then a YES/NO menu (question stays visible). Returns true for YES.
  function* ask(str, opts) {
    yield* say(str, { noWait: true });
    const bg = new StaticBox(str);
    G.engine.push(bg);
    const r = yield* choose(['YES', 'NO'], Object.assign({ x: 320 - 58, y: BOX.y - 44, w: 52 }, opts || {}));
    G.engine.pop(bg);
    return r === 0;
  }

  G.ui = { frame, text, cursor, TextBox, Menu, StaticBox, say, choose, ask, BOX, INK, INK_SH, PAPER, THEMES, setTheme: t => { theme = t; } };
  G.say = say; G.ask = ask; G.choose = choose;
})(window.G);
