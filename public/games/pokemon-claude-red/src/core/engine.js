// Main loop, scene stack and coroutine scheduler.
// Scenes: { update(), draw(surf), opaque?:bool, done?:bool }.
// Coroutines are generator functions; `yield` waits one frame.
(function (G) {
  'use strict';
  const scenes = [];
  const tasks = [];
  let frame = 0;

  function push(scene) { scene.bornFrame = frame; scenes.push(scene); if (scene.enter) scene.enter(); return scene; }
  function pop(scene) {
    const i = scene ? scenes.lastIndexOf(scene) : scenes.length - 1;
    if (i >= 0) { const s = scenes.splice(i, 1)[0]; if (s.exit) s.exit(); return s; }
  }
  function top() { return scenes[scenes.length - 1]; }
  // Start a coroutine; returns a handle { done, value }
  function spawn(gen, name) {
    const t = { gen, done: false, value: undefined, name: name || '' };
    tasks.push(t);
    return t;
  }
  // Push a scene and wait until it finishes; returns scene.result
  function* run(scene) {
    push(scene);
    while (!scene.done) yield;
    pop(scene);
    return scene.result;
  }
  function* wait(frames) { for (let i = 0; i < frames; i++) yield; }
  function* waitFor(pred) { while (!pred()) yield; }
  // Run several generators concurrently until all finish
  function* all(gens) {
    const live = gens.map(g => ({ g, done: false }));
    for (;;) {
      let any = false;
      for (const l of live) if (!l.done) { const r = l.g.next(); if (r.done) l.done = true; else any = true; }
      if (!any) return;
      yield;
    }
  }

  function step() {
    frame++;
    G.frame = frame;
    G.input.update();
    if (G.preStep) G.preStep();
    // tasks first (scripts), then the top scene receives input; a modal scene on top pauses the scripts
    const modal = scenes.length && scenes[scenes.length - 1].modal;
    for (let i = 0; i < tasks.length && !modal; i++) {
      const t = tasks[i];
      if (t.done) continue;
      try {
        const r = t.gen.next();
        if (r.done) { t.done = true; t.value = r.value; }
      } catch (e) {
        t.done = true;
        console.error('task error', t.name, e);
        if (G.onError) G.onError(e);
      }
    }
    for (let i = tasks.length - 1; i >= 0; i--) if (tasks[i].done) tasks.splice(i, 1);
    // update scenes: top scene gets focus; scenes below with `background` get ticked too
    for (let i = 0; i < scenes.length; i++) {
      const s = scenes[i];
      const focused = i === scenes.length - 1;
      // a scene opened this frame waits a frame for input: the press that opened it (read by a script or the
      // scene below) must not also pick in it
      if (focused) { if (s.update) s.update(s.bornFrame !== frame); }
      else if (s.tickBehind && s.update) s.update(false);
    }
    G.input.pointerFallback();
  }

  function draw(surf) {
    let start = 0;
    for (let i = scenes.length - 1; i >= 0; i--) if (scenes[i].opaque) { start = i; break; }
    for (let i = start; i < scenes.length; i++) if (scenes[i].draw) scenes[i].draw(surf);
    if (G.postDraw) G.postDraw(surf);
  }

  // Browser runner: fixed 60Hz timestep, integer scaled canvas
  function startBrowser(canvas) {
    const surf = G.gfx.screen;
    const ctx = canvas.getContext('2d');
    canvas.width = G.gfx.W; canvas.height = G.gfx.H;
    const img = ctx.createImageData(G.gfx.W, G.gfx.H);
    const view = new Uint32Array(img.data.buffer);
    function resize() {
      if (G.pageLayout && G.pageLayout(canvas)) return; // touch devices: the page lays out screen + controller (src/game/touchpad.js)
      const top = G.pageBar ? G.pageBar.inset() : 0; // the Levy St. bar above the game (src/game/topbar.js)
      const s = Math.max(1, Math.floor(Math.min(window.innerWidth / G.gfx.W, (window.innerHeight - top) / G.gfx.H)));
      canvas.style.width = (G.gfx.W * s) + 'px'; canvas.style.height = (G.gfx.H * s) + 'px';
    }
    window.addEventListener('resize', resize); resize(); G.relayout = resize;
    let last = performance.now(), acc = 0;
    const STEP = 1000 / 60;
    function loop(now) {
      acc += Math.min(100, now - last); last = now;
      let n = 0;
      while (acc >= STEP && n < 4) { step(); acc -= STEP; n++; }
      if (n) { draw(surf); view.set(surf.data); ctx.putImageData(img, 0, 0); }
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }

  G.engine = { push, pop, top, spawn, run, wait, waitFor, all, step, draw, startBrowser, scenes, tasks };
  G.frame = 0;
})(window.G);
