(() => {
  const duration = 200;
  const easing = "cubic-bezier(0.77, 0, 0.175, 1)";
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  // Match the 2D WAAPI curve in Three.js world coordinates.
  function ease(progress, curve = "move") {
    const x1 = curve === "out" ? 0.23 : 0.77;
    const x2 = curve === "out" ? 0.32 : 0.175;
    const y1 = curve === "out" ? 1 : 0;
    let low = 0;
    let high = 1;
    let t = progress;
    for (let step = 0; step < 16; step++) {
      t = (low + high) / 2;
      const x = 3 * (1 - t) ** 2 * t * x1 + 3 * (1 - t) * t ** 2 * x2 + t ** 3;
      if (x < progress) low = t;
      else high = t;
    }
    return 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t ** 2 + t ** 3;
  }

  window.createChessMoveMotion = ({ history, pieces, addGhost, squarePosition, view, camera, controls, createEffect }) => {
    const captureFeedback = window.createChessCaptureFeedback({ pieces, addGhost, view, createEffect });
    let orbitFrame = 0;
    let restoreDamping = () => {};
    const cancelOrbit = () => {
      cancelAnimationFrame(orbitFrame);
      orbitFrame = 0;
      restoreDamping();
      restoreDamping = () => {};
    };
    controls?.addEventListener("start", cancelOrbit);
    let previous = [];
    let initialized = false;
    let frame = 0;
    let endsAt = 0;
    let pendingReply = null;
    const releaseReply = () => {
      const reply = pendingReply;
      pendingReply = null;
      if (reply) queueMicrotask(reply);
    };
    let animations = [];
    let cleanups = [];
    let settle = () => {};
    let keyboard = false;
    document.addEventListener("keydown", () => { keyboard = true; }, true);
    document.addEventListener("pointerdown", () => { keyboard = false; }, true);

    const stop = (stopAudio = true) => {
      captureFeedback.stop(stopAudio);
      cancelAnimationFrame(frame);
      frame = 0;
      endsAt = 0;
      settle();
      settle = () => {};
      for (const animation of animations) animation.cancel();
      animations = [];
      for (const cleanup of cleanups) cleanup();
      cleanups = [];
      releaseReply();
    };
    reducedMotion.addEventListener("change", () => { stop(); cancelOrbit(); });
    window.addEventListener("pagehide", () => { stop(); cancelOrbit(); });
    document.addEventListener("visibilitychange", () => { if (document.hidden) { stop(); cancelOrbit(); } });
    for (const id of ["view-2d", "view-3d", "rotate", "top", "reset-view"]) {
      document.getElementById(id).addEventListener("click", () => {
        if (id !== "rotate" || view() !== "2d") stop();
        cancelOrbit();
      }, true);
    }

    return {
      remaining: () => frame ? Math.max(0, endsAt - performance.now()) : 0,
      afterSettled(reply) { if (frame) pendingReply = reply; else reply(); },
      cancelPendingReply() { pendingReply = null; },
      flip2d(update) {
        const board = document.getElementById("flat-board");
        const transform = getComputedStyle(board).transform;
        const turning = animations.some(animation => animation.effect?.target === board && animation.playState === "running");
        const angle = transform === "none" ? 0 : Math.atan2(new DOMMatrixReadOnly(transform).b, new DOMMatrixReadOnly(transform).a) * 180 / Math.PI;
        stop();
        update();
        if (reducedMotion.matches || keyboard) { keyboard = false; return; }
        const from = turning ? angle + 180 : -180;
        const options = { duration: 250, easing };
        animations.push(board.animate([
          { transform: `rotate(${from}deg)` }, { transform: "rotate(0deg)" },
        ], options));
        for (const square of board.children) {
          animations.push(square.animate([
            { transform: `rotate(${-from}deg)` }, { transform: "rotate(0deg)" },
          ], options));
        }
      },
      rotate3d() {
        if (!controls) return;
        cancelOrbit();
        const origin = camera.position.clone().sub(controls.target);
        const start = performance.now();
        const damping = controls.enableDamping;
        controls.enableDamping = false;
        restoreDamping = () => { controls.enableDamping = damping; };
        const instant = reducedMotion.matches || keyboard;
        keyboard = false;
        const tick = now => {
          const progress = instant ? 1 : Math.min(1, (now - start) / 250);
          const angle = Math.PI * ease(progress);
          camera.position.set(
            controls.target.x + origin.x * Math.cos(angle) + origin.z * Math.sin(angle),
            controls.target.y + origin.y,
            controls.target.z - origin.x * Math.sin(angle) + origin.z * Math.cos(angle),
          );
          controls.update();
          if (progress < 1) orbitFrame = requestAnimationFrame(tick);
          else cancelOrbit();
        };
        tick(start);
      },
      reset() {
        stop();
        cancelOrbit();
        previous = [];
        initialized = false;
      },
      before() {
        const snapshot = {
          positions: new Map(pieces().map(piece => [piece.userData.square, piece.position.clone()])),
          rotations: new Map(pieces().map(piece => [piece.userData.square, piece.rotation.clone()])),
          flatPieces: new Map(Array.from(document.querySelectorAll("#flat-board .flat-piece"), piece => [piece.closest(".flat-square").dataset.square, piece.getBoundingClientRect()])),
        };
        stop(false);
        const moves = history();
        const forward = initialized && moves.length === previous.length + 1 && previous.every((move, index) => move === moves[index].from + moves[index].to + (moves[index].promotion || ""));
        const move = moves.at(-1);
        if (forward && move.captured && !reducedMotion.matches && !keyboard && !document.hidden) {
          snapshot.capture = captureFeedback.prepare(move);
        }
        return snapshot;
      },
      after(snapshot) {
        const moves = history();
        const next = moves.map(move => move.from + move.to + (move.promotion || ""));
        const forward = initialized && next.length === previous.length + 1 && previous.every((move, index) => move === next[index]);
        previous = next;
        initialized = true;
        const skipMovement = keyboard;
        keyboard = false;
        if (!forward || document.hidden) { captureFeedback.discard(snapshot.capture); captureFeedback.stop(); return; }
        const move = moves.at(-1);
        const capture3d = Boolean(move.captured) && view() === "3d";
        // Captures get a readable aim/strike/take sequence; ordinary UI remains fast.
        const moveDuration = view() === "2d" ? duration : capture3d ? ({p: 300, n: 450, b: 500, r: 400, q: 450, k: 400}[move.piece] || 300) : 250;
        let feedbackStarted = false;
        const startFeedback = () => {
          feedbackStarted = true;
          captureFeedback.play(snapshot.capture, move, reducedMotion.matches || skipMovement, {
            impact: capture3d ? move.piece === "b" ? 200 : Math.round(moveDuration * 0.7) : 140,
            shot: capture3d && move.piece === "b" ? 100 : null,
            moveDuration,
          });
        };
        if (view() === "2d" || reducedMotion.matches || skipMovement) startFeedback();
        const paths = [{ from: move.from, to: move.to }];
        if (move.flags.includes("k")) paths.push({ from: `h${move.from[1]}`, to: `f${move.from[1]}` });
        if (move.flags.includes("q")) paths.push({ from: `a${move.from[1]}`, to: `d${move.from[1]}` });

        if (reducedMotion.matches || skipMovement) {
          if (!skipMovement) {
            const square = document.querySelector(`[data-square="${move.to}"]`);
            animations.push(square.animate([{ opacity: 0.65 }, { opacity: 1 }], { duration, easing }));
          }
          return;
        }
        if (view() === "2d") {
          for (const target of document.querySelectorAll("#flat-board .flat-piece")) {
            const square = target.closest(".flat-square");
            const path = paths.find(path => path.to === square.dataset.square);
            const from = snapshot.flatPieces.get(path?.from || square.dataset.square);
            const to = target.getBoundingClientRect();
            if (!from || Math.abs(from.x - to.x) + Math.abs(from.y - to.y) < 0.5) continue;
            square.style.zIndex = "3";
            const cleanup = () => { square.style.zIndex = ""; };
            cleanups.push(cleanup);
            const animation = target.animate([
              { transform: `translate(${from.x - to.x}px, ${from.y - to.y}px)` },
              { transform: "translate(0, 0)" },
            ], { duration, easing });
            animation.onfinish = cleanup;
            animations.push(animation);
          }
          return;
        }
        const tracks = pieces().map(piece => {
          const path = paths.find(path => path.to === piece.userData.square);
          return {
            piece,
            from: snapshot.positions.get(path?.from || piece.userData.square),
            to: squarePosition(piece.userData.square),
            type: path ? path.to === move.to ? move.piece || piece.userData.piece : "r" : null,
            attacking: Boolean(path && path.to === move.to && move.captured),
            rotation: snapshot.rotations.get(path?.from || piece.userData.square),
          };
        }).filter(track => track.from && track.from.distanceToSquared(track.to) > 0.000001);
        if (!tracks.length) { captureFeedback.discard(snapshot.capture); return; }
        for (const track of tracks) {
          track.piece.position.copy(track.from);
          if (track.rotation) track.piece.rotation.copy(track.rotation);
        }
        settle = () => {
          if (!feedbackStarted) captureFeedback.discard(snapshot.capture);
          for (const track of tracks) {
            track.piece.position.copy(track.to);
            track.piece.rotation.set(0, 0, 0);
          }
        };
        let start = null;
        endsAt = performance.now() + moveDuration;
        const tick = now => {
          if (start === null) { start = now; endsAt = now + moveDuration; startFeedback(); }
          const progress = Math.max(0, Math.min(1, (now - start) / moveDuration));
          const amount = ease(progress);
          for (const track of tracks) {
            const aiming = track.attacking && (track.type === "b" || track.type === "r");
            const aimUntil = track.type === "b" ? 0.4 : 0.2;
            const travel = aiming ? progress < aimUntil ? 0 : ease((progress - aimUntil) / (1 - aimUntil), "out") : amount;
            track.piece.position.lerpVectors(track.from, track.to, travel);
            const arc = Math.sin(Math.PI * (aiming ? travel : progress));
            const direction = track.to.clone().sub(track.from);
            direction.y = 0;
            direction.normalize();
            let lift = 0;
            let lean = 0;
            let turn = 0;
            switch (track.type) {
              case "p": lift = 0.2 * arc; lean = 0.06 * arc; break;
              case "n": lift = (track.attacking ? 1.5 : 1.15) * arc; lean = 0.32 * Math.sin(2 * Math.PI * progress); break;
              case "b":
                lift = 0.08 * arc;
                lean = aiming && progress < 0.4 ? -0.22 * Math.sin(Math.PI * progress / 0.4) : 0.2 * arc;
                break;
              case "r":
                lean = track.attacking ? 0.15 * Math.sin(Math.PI * progress) : 0.04 * arc;
                if (aiming && progress < 0.2) track.piece.position.addScaledVector(direction, -0.12 * Math.sin(Math.PI * progress / 0.2));
                break;
              case "q":
                lift = 0.3 * arc; turn = (track.attacking ? 0.6 : 0.18) * arc;
                if (track.attacking) { track.piece.position.x += direction.z * 0.3 * arc; track.piece.position.z -= direction.x * 0.3 * arc; }
                break;
              case "k": lift = (track.attacking ? 0.2 : 0.1) * arc; lean = (track.attacking ? 0.18 : 0.1) * arc; break;
            }
            // Retarget an interrupted move from its current pose instead of replaying its leap.
            if (!track.type) {
              track.piece.rotation.set(
                (track.rotation?.x || 0) * (1 - amount),
                (track.rotation?.y || 0) * (1 - amount),
                (track.rotation?.z || 0) * (1 - amount),
              );
            } else {
              track.piece.position.y += lift;
              track.piece.rotation.set(direction.z * lean, turn, -direction.x * lean);
            }
          }
          if (progress < 1) frame = requestAnimationFrame(tick);
          else { settle(); settle = () => {}; frame = 0; endsAt = 0; releaseReply(); }
        };
        frame = requestAnimationFrame(tick);
      },
    };
  };
})();
