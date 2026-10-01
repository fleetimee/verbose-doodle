// On-screen touch controls: left joystick, right-side drag-look (tap = place/use, hold = mine), buttons, tappable hotbar.
const $ = (id) => document.getElementById(id);
export function initTouch(game, player, ui, hooks) {
  if (game.touchEl) return;
  document.body.classList.add('touch');
  const root = $('touch'); game.touchEl = root; root.style.display = 'block';
  const T = game.touch = { fwd: 0, strafe: 0, jump: false, left: false, right: false, rightPressed: false, sneak: false, sprint: false };
  const sens = () => 0.0052 * (hooks.settings.sens / 100);
  // ---- joystick
  const jz = $('joyzone'), base = $('joybase'), knob = $('joyknob'); let jid = null, ox = 0, oy = 0; const R = 52;
  const joyMove = (e) => {
    let dx = e.clientX - ox, dy = e.clientY - oy; const l = Math.hypot(dx, dy); if (l > R) { dx = dx / l * R; dy = dy / l * R; }
    T.strafe = dx / R; T.fwd = -dy / R; if (Math.abs(T.strafe) < 0.12) T.strafe = 0; if (Math.abs(T.fwd) < 0.12) T.fwd = 0;
    T.sprint = l > R * 1.55; knob.style.transform = `translate(${dx}px,${dy}px)`;
  };
  jz.addEventListener('pointerdown', (e) => { if (jid !== null) return; jid = e.pointerId; jz.setPointerCapture(jid); ox = e.clientX; oy = e.clientY; base.style.display = 'block'; base.style.left = ox - 70 + 'px'; base.style.top = oy - 70 + 'px'; knob.style.transform = 'translate(0,0)'; e.preventDefault(); });
  jz.addEventListener('pointermove', (e) => { if (e.pointerId === jid) joyMove(e); });
  const jend = (e) => { if (e.pointerId !== jid) return; jid = null; T.fwd = T.strafe = 0; T.sprint = false; base.style.display = 'none'; };
  jz.addEventListener('pointerup', jend); jz.addEventListener('pointercancel', jend);
  // ---- look zone
  const lz = $('lookzone'); let lid = null, lx = 0, ly = 0, t0 = 0, moved = 0, holdTimer = null;
  lz.addEventListener('pointerdown', (e) => {
    if (lid !== null) return; lid = e.pointerId; lz.setPointerCapture(lid); lx = e.clientX; ly = e.clientY; t0 = performance.now(); moved = 0;
    holdTimer = setTimeout(() => { if (moved < 12) T.left = true; }, 320); e.preventDefault();
  });
  lz.addEventListener('pointermove', (e) => {
    if (e.pointerId !== lid) return; const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
    if (game.paused || ui.isOpen || player.dead) return;
    player.yaw -= dx * sens(); player.pitch = Math.max(-1.5533, Math.min(1.5533, player.pitch - dy * sens()));
  });
  const lend = (e) => {
    if (e.pointerId !== lid) return; lid = null; clearTimeout(holdTimer);
    if (T.left) T.left = false; else if (performance.now() - t0 < 260 && moved < 14) { T.right = true; T.rightPressed = true; setTimeout(() => { T.right = false; }, 110); }
  };
  lz.addEventListener('pointerup', lend); lz.addEventListener('pointercancel', lend);
  // ---- buttons
  const hold = (id, on, off) => { const el = $(id); el.addEventListener('pointerdown', (e) => { e.preventDefault(); el.setPointerCapture(e.pointerId); el.classList.add('down'); on(); }); const up = () => { el.classList.remove('down'); if (off) off(); }; el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up); };
  hold('tbJump', () => { T.jump = true; const now = performance.now(); if (player.creative && now - (game._lastTapJump || 0) < 300) { player.flying = !player.flying; player.vy = 0; } game._lastTapJump = now; }, () => { T.jump = false; });
  hold('tbBreak', () => { T.left = true; }, () => { T.left = false; });
  hold('tbPlace', () => { T.right = true; T.rightPressed = true; }, () => { T.right = false; });
  const tap = (id, fn) => $(id).addEventListener('pointerdown', (e) => { e.preventDefault(); fn(e); });
  tap('tbSneak', () => { T.sneak = !T.sneak; $('tbSneak').classList.toggle('on', T.sneak); });
  tap('tbInv', () => ui.openInventory());
  tap('tbMenu', () => hooks.pause());
  tap('tbDrop', () => { const s = player.held(); if (!s) return; const cp = Math.cos(player.pitch); game.spawnItem(s.id, 1, player.x, player.eyeY - 0.3, player.z, s.d, [-Math.sin(player.yaw) * cp * 5, Math.sin(player.pitch) * 5 + 1.5, -Math.cos(player.yaw) * cp * 5]); s.n--; if (s.n <= 0) player.inv[player.sel] = null; ui.dirtyInv = true; });
  // ---- tappable hotbar (sits above the touch layer)
  const hb = $('hotbar'); hb.style.pointerEvents = 'auto'; hb.style.zIndex = 16;
  [...hb.children].forEach((el, i) => { el.style.pointerEvents = 'auto'; el.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); player.sel = i; }); });
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('touchmove', (e) => { if (e.target && e.target.closest && !e.target.closest('#panel,#creative,#book,#worldlist')) e.preventDefault(); }, { passive: false });
}
