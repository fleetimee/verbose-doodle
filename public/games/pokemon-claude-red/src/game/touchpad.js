// On-screen controller for touch devices, and the page layout around the canvas.
// Portrait lays the page out like a Game Boy: the screen sits at the top, with the D-pad, B/A and SELECT/START under it.
// Landscape splits it like a GBA: the D-pad and SELECT on the left of the screen, A/B and START on the right.
// Buttons feed G.input.touchSet(). Mouse-and-keyboard browsers keep the engine's integer-scaled layout.
// ?pad=1 / ?pad=0 forces the controller on or off.
(function (G) {
  'use strict';
  if (typeof document === 'undefined' || !document.getElementById) return;
  const pad = document.getElementById('pad'); if (!pad) return;
  const q = (location.search.match(/[?&]pad=([01])/) || [])[1];
  const coarse = !!(window.matchMedia && (matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints > 0 && matchMedia('(hover: none)').matches)));
  G.touchUI = q === '1' || (q !== '0' && coarse);
  if (G.touchUI) document.documentElement.classList.add('touch');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const el = n => pad.querySelector('[data-btn="' + n + '"]');
  const dpad = document.getElementById('dpad'), body = document.getElementById('pad-body');
  const disc = document.getElementById('disclaimer'), hits = document.getElementById('ls-hits');
  if (G.touchUI && hits) pad.appendChild(hits); // on phones the hit counter sits on the controller body, like a label on a Game Boy

  // iPhone notches and home bars: read env(safe-area-inset-*) through a hidden probe
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
  document.body.appendChild(probe);
  const insets = () => { const c = getComputedStyle(probe); return { t: parseFloat(c.paddingTop) || 0, r: parseFloat(c.paddingRight) || 0, b: parseFloat(c.paddingBottom) || 0, l: parseFloat(c.paddingLeft) || 0 }; };
  const sizeHits = k => { const w = Math.round((hits.width || 90) * k); hits.style.width = w + 'px'; hits.style.height = Math.round((hits.height || 15) * k) + 'px'; return w; };
  const put = (e, cx, cy, w, h) => { e.style.left = Math.round(cx - w / 2) + 'px'; e.style.top = Math.round(cy - h / 2) + 'px'; e.style.width = Math.round(w) + 'px'; e.style.height = Math.round(h) + 'px'; };

  // returns true when it placed the canvas itself (touch layouts); false leaves the desktop layout to the engine
  G.pageLayout = function (canvas) {
    pad.hidden = !G.touchUI;
    if (!G.touchUI) { canvas.style.position = ''; if (disc) disc.style.bottom = ''; return false; }
    // keep the layout still while the on-screen keyboard is up for the email / account boxes
    const ae = document.activeElement;
    if (ae && ae.tagName === 'INPUT' && canvas.style.position === 'fixed') return true;
    const vw = window.innerWidth, vh = window.innerHeight, sa = insets(), GW = G.gfx.W, GH = G.gfx.H;
    const portrait = vh >= vw;
    const barH = G.pageBar ? G.pageBar.touchMode(portrait ? 'bar' : 'pill') : 0;
    let x, y, w, h;
    pad.className = portrait ? 'portrait' : 'landscape';
    if (portrait) {
      const top = (barH || sa.t) + 6, need = 236; // the controller needs about this much height
      w = vw - 12 - sa.l - sa.r; h = w * GH / GW;
      if (top + h + need > vh - sa.b) { h = Math.max(GH, vh - sa.b - need - top); w = h * GW / GH; }
      x = (vw - w) / 2; y = top;
      const a0 = y + h + 12, a1 = vh - sa.b - 16, ah = a1 - a0;
      const D = clamp(Math.min(ah - 70, vw * 0.4), 96, 172), R = D * 0.38;
      const cy = a0 + Math.max(0, (ah - (D + 64)) * 0.42) + D / 2;
      put(dpad, sa.l + 14 + D / 2, cy, D, D);
      const ax = vw - sa.r - 16 - R * 0.62, ay = cy - R * 0.38;
      put(el('a'), ax, ay, R, R); put(el('b'), ax - R * 1.36, ay + R * 0.76, R, R);
      const py = cy + D / 2 + 34;
      put(el('select'), vw / 2 - 42, py, 62, 22); put(el('start'), vw / 2 + 42, py, 62, 22);
      body.style.cssText = `left:0;right:0;top:${Math.round(y + h + 4)}px;bottom:0`;
      if (hits) { sizeHits(2); hits.style.left = Math.round(sa.l + 16) + 'px'; hits.style.top = ''; hits.style.bottom = Math.round(sa.b + 34) + 'px'; hits.classList.toggle('cramped', vh - sa.b - 34 - 30 < py + 20); }
    } else {
      const side = clamp(vw * 0.2, 118, 210);
      const s = Math.min((vw - 2 * side - sa.l - sa.r) / GW, (vh - sa.t - sa.b - 8) / GH);
      w = GW * s; h = GH * s; x = (vw - w) / 2 + (sa.l - sa.r) / 2; y = (vh - h) / 2 + (sa.t - sa.b) / 2;
      const lx = (sa.l + x) / 2, rx = (x + w + vw - sa.r) / 2, col = x - sa.l;
      const D = clamp(Math.min(col * 0.84, vh * 0.46), 90, 168), R = D * 0.4, cy = vh * 0.5;
      put(dpad, lx, cy, D, D);
      put(el('a'), rx + R * 0.64, cy - R * 0.42, R, R); put(el('b'), rx - R * 0.64, cy + R * 0.42, R, R);
      const py = Math.min(vh - sa.b - 20, cy + D / 2 + 28);
      put(el('select'), lx, py, 62, 22); put(el('start'), rx, py, 62, 22);
      body.style.cssText = 'display:none';
      if (hits) { const hw = sizeHits(Math.min(2, (col - 16) / (hits.width || 90))); hits.style.left = Math.round(lx - hw / 2) + 'px'; hits.style.bottom = ''; hits.style.top = Math.round(sa.t + 12) + 'px'; hits.classList.toggle('cramped', cy - D / 2 < sa.t + 50); }
    }
    Object.assign(canvas.style, { position: 'fixed', left: Math.round(x) + 'px', top: Math.round(y) + 'px', width: Math.round(w) + 'px', height: Math.round(h) + 'px' });
    if (disc) disc.style.bottom = Math.round(sa.b + 2) + 'px';
    return true;
  };

  // ---- input: every finger is tracked on its own, so B can be held (run) while steering with the D-pad ----
  const held = new Map(); // pointerId -> button name
  function set(b, on) {
    G.input && G.input.touchSet(b, on);
    if (b === 'up' || b === 'down' || b === 'left' || b === 'right') dpad.classList.toggle(b, on); else el(b).classList.toggle('on', on);
    if (on && navigator.vibrate) try { navigator.vibrate(8); } catch (e) {}
  }
  function release(id) { const b = held.get(id); if (b) set(b, false); held.delete(id); }
  function dirAt(e) {
    const r = dpad.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    if (Math.hypot(dx, dy) < r.width * 0.1) return null; // dead zone in the middle
    return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
  }
  function steer(e) {
    const d = dirAt(e), cur = held.get(e.pointerId);
    if (d === cur) return;
    if (cur) set(cur, false);
    if (d) { held.set(e.pointerId, d); set(d, true); } else held.delete(e.pointerId);
  }
  dpad.addEventListener('pointerdown', e => { e.preventDefault(); try { dpad.setPointerCapture(e.pointerId); } catch (x) {} steer(e); });
  dpad.addEventListener('pointermove', e => { if (held.has(e.pointerId) || e.buttons) steer(e); });
  for (const b of ['a', 'b', 'start', 'select']) {
    const e0 = el(b);
    e0.addEventListener('pointerdown', e => { e.preventDefault(); try { e0.setPointerCapture(e.pointerId); } catch (x) {} held.set(e.pointerId, b); set(b, true); });
  }
  for (const t of [dpad, ...['a', 'b', 'start', 'select'].map(el)]) {
    for (const ev of ['pointerup', 'pointercancel', 'lostpointercapture']) t.addEventListener(ev, e => release(e.pointerId));
    t.addEventListener('contextmenu', e => e.preventDefault());
  }
  window.addEventListener('blur', () => { for (const id of [...held.keys()]) release(id); });

  // phones resize the viewport for toolbars and rotation without always firing 'resize'
  const relayout = () => G.relayout && G.relayout();
  window.addEventListener('orientationchange', () => setTimeout(relayout, 250));
  if (window.visualViewport) visualViewport.addEventListener('resize', relayout);
})(window.G);
