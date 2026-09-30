// Keyboard + mouse state. "pressed" flags are cleared after each fixed update tick.
const BLOCK = new Set(['Space', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Escape']);

export function createInput(canvas) {
  const inp = {
    down: new Set(), pressed: new Set(),
    mouse: { x: 0, y: 0, l: false, r: false, lp: false, rp: false, wheel: 0 },
    text: null, // optional handler(e) -> true if consumed (text fields)
    isDown: c => inp.down.has(c),
    hit: c => inp.pressed.has(c),
    shift: () => inp.down.has('ShiftLeft') || inp.down.has('ShiftRight'),
    endTick() { inp.pressed.clear(); inp.mouse.lp = false; inp.mouse.rp = false; inp.mouse.wheel = 0; },
  };
  addEventListener('keydown', e => {
    if (inp.text && inp.text(e)) { e.preventDefault(); return; }
    if (!inp.down.has(e.code)) inp.pressed.add(e.code);
    inp.down.add(e.code);
    if (BLOCK.has(e.code) || (e.ctrlKey && e.code === 'KeyS')) e.preventDefault();
  });
  addEventListener('keyup', e => { inp.down.delete(e.code); });
  addEventListener('blur', () => { inp.down.clear(); inp.mouse.l = inp.mouse.r = false; });
  const pos = e => {
    const r = canvas.getBoundingClientRect();
    inp.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
    inp.mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
  };
  canvas.addEventListener('mousemove', pos);
  canvas.addEventListener('mousedown', e => {
    canvas.focus({ preventScroll: true });
    pos(e);
    if (e.button === 0) { inp.mouse.l = true; inp.mouse.lp = true; }
    if (e.button === 2) { inp.mouse.r = true; inp.mouse.rp = true; }
    e.preventDefault();
  });
  addEventListener('mouseup', e => {
    if (e.button === 0) inp.mouse.l = false;
    if (e.button === 2) inp.mouse.r = false;
  });
  canvas.addEventListener('contextmenu', e => e.preventDefault());
  canvas.addEventListener('wheel', e => { inp.mouse.wheel += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
  return inp;
}
