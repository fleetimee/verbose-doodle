(() => {
  const impactDelay = 140;
  const impactDuration = 125;
  const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";

  window.createChessCaptureFeedback = ({ pieces, addGhost, view, createEffect }) => {
    let context = null;
    let muted = false;
    let copy = { muteSound: "Mute game sounds", enableSound: "Enable game sounds" };
    const timers = new Set();
    let frame = 0;
    let effectTimer = 0;
    let effectFrame = 0;
    let effect = null;
    let cleanup = () => {};
    const sources = new Set();
    try { muted = localStorage.getItem("atelier-chess-muted") === "1"; } catch {}

    const button = document.createElement("button");
    button.type = "button";
    button.dataset.gameSound = "";
    const updateButton = () => {
      button.setAttribute("aria-label", muted ? copy.enableSound : copy.muteSound);
      button.title = button.getAttribute("aria-label");
      button.setAttribute("aria-pressed", String(!muted));
      button.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4Z"/>${muted ? '<path d="m16 9 6 6m0-6-6 6"/>' : '<path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>'}</svg>`;
    };
    updateButton();
    document.querySelector(".panel-nav").appendChild(button);
    window.addEventListener("message", event => {
      if (event.source !== parent || event.origin !== location.origin || event.data?.type !== "chess:copy") return;
      copy = event.data.copy;
      updateButton();
    });

    const unlock = () => {
      if (muted || !window.AudioContext) return;
      try {
        context ??= new AudioContext();
        if (context.state === "suspended") void context.resume().catch(() => {});
      } catch { /* Visual feedback remains available when audio is blocked. */ }
    };
    document.addEventListener("pointerdown", unlock, true);
    document.addEventListener("keydown", unlock, true);
    const stopSound = () => {
      for (const source of sources) source.stop();
      sources.clear();
    };
    button.addEventListener("click", () => {
      muted = !muted;
      if (muted) stopSound(); else unlock();
      try { localStorage.setItem("atelier-chess-muted", muted ? "1" : "0"); } catch {}
      updateButton();
    });
    if (!window.AudioContext) button.disabled = true;

    const sound = capture => {
      if (muted || context?.state !== "running") return;
      const now = context.currentTime;
      const tone = context.createOscillator();
      const gain = context.createGain();
      tone.type = "triangle";
      tone.frequency.setValueAtTime(capture ? 240 : 420, now);
      tone.frequency.exponentialRampToValueAtTime(capture ? 80 : 180, now + 0.08);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(capture ? 0.12 : 0.055, now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
      tone.connect(gain).connect(context.destination);
      const voices = [[tone, [gain], 0.125]];
      if (capture) {
        const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * 0.08), context.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let index = 0; index < samples.length; index++) samples[index] = Math.random() * 2 - 1;
        const noise = context.createBufferSource();
        noise.buffer = buffer;
        const filter = context.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 1800;
        const noiseGain = context.createGain();
        noiseGain.gain.setValueAtTime(0.05, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        noise.connect(filter).connect(noiseGain).connect(context.destination);
        voices.push([noise, [filter, noiseGain], 0.08]);
      }
      for (const [source, nodes, length] of voices) {
        sources.add(source);
        source.onended = () => {
          sources.delete(source);
          source.disconnect();
          for (const node of nodes) node.disconnect();
        };
        source.start(now);
        source.stop(now + length);
      }
    };

    const disposeModel = model => {
      model.removeFromParent();
      model.traverse(mesh => {
        if (!mesh.isMesh) return;
        mesh.geometry.dispose();
        for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) material.dispose();
      });
    };
    return {
      stop(stopAudio = true) {
        clearTimeout(effectTimer);
        cancelAnimationFrame(effectFrame);
        effect?.dispose();
        effect = null;
        if (stopAudio) {
          for (const timer of timers) clearTimeout(timer);
          timers.clear();
          stopSound();
        }
        cancelAnimationFrame(frame);
        cleanup();
        cleanup = () => {};
      },
      prepare(move) {
        const square = move.flags.includes("e") ? move.to[0] + move.from[1] : move.to;
        if (view() === "2d") {
          const piece = document.querySelector(`[data-square="${square}"] .flat-piece`);
          if (!piece) return null;
          return { flat: piece.cloneNode(true), rect: piece.getBoundingClientRect() };
        }
        const original = pieces().find(piece => piece.userData.square === square);
        if (!original) return null;
        const model = original.clone(true);
        model.userData.motionGhost = true;
        model.traverse(mesh => {
          if (!mesh.isMesh) return;
          mesh.raycast = () => {};
          mesh.geometry = mesh.geometry.clone();
          const clone = material => {
            const result = material.clone();
            result.transparent = true;
            result.depthWrite = false;
            return result;
          };
          mesh.material = Array.isArray(mesh.material) ? mesh.material.map(clone) : clone(mesh.material);
        });
        return { model };
      },
      discard(capture) {
        if (capture?.model) disposeModel(capture.model);
      },
      play(capture, move, gentle, timing = {impact: impactDelay, shot: null, moveDuration: 200}) {
        const timer = setTimeout(() => {
          timers.delete(timer);
          sound(Boolean(move.captured));
        }, gentle ? 0 : move.captured ? timing.impact : timing.moveDuration);
        timers.add(timer);
        if (!gentle && move.captured && view() === "3d") {
          effectTimer = setTimeout(() => {
            effect = createEffect(move.piece, move.from, move.to);
            const start = performance.now();
            const length = 150;
            const tick = now => {
              const progress = Math.min(1, (now - start) / length);
              effect.update(progress);
              if (progress < 1) effectFrame = requestAnimationFrame(tick);
              else { effect.dispose(); effect = null; }
            };
            effectFrame = requestAnimationFrame(tick);
          }, timing.shot ?? timing.impact);
        }
        if (!capture) return;
        const dx = Math.sign(move.to.charCodeAt(0) - move.from.charCodeAt(0));
        const dz = Math.sign(Number(move.from[1]) - Number(move.to[1]));
        if (capture.flat) {
          const from = document.querySelector(`[data-square="${move.from}"]`).getBoundingClientRect();
          const to = document.querySelector(`[data-square="${move.to}"]`).getBoundingClientRect();
          const screenX = Math.sign(to.x - from.x);
          const screenY = Math.sign(to.y - from.y);
          const layer = document.getElementById("flat-view");
          const bounds = layer.getBoundingClientRect();
          const ghost = capture.flat;
          ghost.classList.add("capture-ghost");
          ghost.style.cssText = `position:absolute;left:${capture.rect.x - bounds.x}px;top:${capture.rect.y - bounds.y}px;width:${capture.rect.width}px;height:${capture.rect.height}px;z-index:4;pointer-events:none`;
          layer.appendChild(ghost);
          const animation = ghost.animate([
            { opacity: 1, transform: "translate(0, 0) rotate(0deg) scale(1)" },
            { opacity: 0, transform: `translate(${screenX * 12}px, ${screenY * 12}px) rotate(${screenX < 0 ? -12 : 12}deg) scale(0.95)` },
          ], { delay: timing.impact, duration: impactDuration, easing: easeOut, fill: "forwards" });
          cleanup = () => { animation.cancel(); ghost.remove(); };
          animation.onfinish = cleanup;
          return;
        }
        const model = capture.model;
        addGhost(model);
        const start = performance.now() + timing.impact;
        const origin = model.position.clone();
        let disposed = false;
        cleanup = () => { if (!disposed) { disposed = true; disposeModel(model); } };
        const tick = now => {
          const progress = Math.max(0, Math.min(1, (now - start) / impactDuration));
          const knockback = move.piece === "r" ? 0.45 : move.piece === "n" ? 0.3 : 0.18;
          model.position.set(origin.x + dx * knockback * progress, origin.y, origin.z + dz * knockback * progress);
          model.rotation.x = dz * 0.22 * progress;
          model.rotation.z = -dx * 0.22 * progress;
          model.traverse(mesh => {
            if (!mesh.isMesh) return;
            for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) material.opacity = 1 - progress;
          });
          if (progress < 1) frame = requestAnimationFrame(tick);
          else cleanup();
        };
        frame = requestAnimationFrame(tick);
      },
    };
  };
})();
