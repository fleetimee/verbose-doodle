(() => {
  const states = new WeakMap();
  const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const length = train => [3, 4, 5, 5, 3][train.fleetVariant ?? 0] * 0.68;
  function railSignature(city) {
    let signature = 0;
    for (let index = 0; index < city.count; index++) if (city.rail[index]) signature = (signature + Math.imul(index + 1, index + 3 + (window.__railTransit?.kind(city, index) ?? 0))) | 0;
    return signature;
  }
  function network(city, signature = railSignature(city)) {
    const neighbors = new Map();
    for (let index = 0; index < city.count; index++) {
      if (!city.rail[index]) continue;
      const x = index % city.size, y = Math.floor(index / city.size);
      neighbors.set(index, directions.filter(([dx, dy]) => city.inBounds(x + dx, y + dy) && city.rail[city.idx(x + dx, y + dy)] &&
        (window.__doubleRail?.canStep(city, x, y, x + dx, y + dy) ?? true))
        .map(([dx, dy]) => city.idx(x + dx, y + dy)));
    }
    const blocks = new Map();
    let next = 0;
    for (const [index, links] of neighbors) {
      if (blocks.has(index)) continue;
      const block = next++;
      blocks.set(index, block);
      if (links.length > 2) continue;
      const pending = [index];
      while (pending.length) for (const tile of neighbors.get(pending.pop())) {
        if (blocks.has(tile) || neighbors.get(tile).length > 2) continue;
        blocks.set(tile, block);
        pending.push(tile);
      }
    }
    const signals = [];
    for (const [index, links] of neighbors) {
      if (links.length === 1) signals.push({ index, block: blocks.get(index) });
      if (links.length > 2) for (const tile of links) signals.push({ index: tile, block: blocks.get(index) });
    }
    return { city, signature, blocks, signals, intents: new Map(), owners: new Map() };
  }
  function stateFor(renderer, city) {
    let state = states.get(renderer);
    const signature = railSignature(city);
    if (!state || state.city !== city || state.signature !== signature) { state = network(city, signature); states.set(renderer, state); }
    return state;
  }
  function occupied(state, city, train) {
    const result = new Set();
    const mark = point => {
      const x = Math.floor(point.x), y = Math.floor(point.y);
      if (city.inBounds(x, y)) {
        const block = state.blocks.get(city.idx(x, y));
        if (block !== undefined) result.add(block);
      }
    };
    const head = { x: train.px + (train.x - train.px) * train.t + 0.5,
      y: train.py + (train.y - train.py) * train.t + 0.5 };
    mark(head);
    let remaining = length(train), previous = head;
    for (const point of train.hist) {
      const distance = Math.hypot(point.x - previous.x, point.y - previous.y);
      if (distance > remaining) {
        if (distance) mark({ x: previous.x + (point.x - previous.x) * remaining / distance,
          y: previous.y + (point.y - previous.y) * remaining / distance });
        break;
      }
      mark(point);
      remaining -= distance;
      previous = point;
    }
    return result;
  }
  function refreshOwners(renderer, city, state) {
    state.owners.clear();
    const trains = renderer.walkers.filter(train => train.kind === "train");
    for (const train of state.intents.keys()) if (!trains.includes(train)) state.intents.delete(train);
    for (const train of trains) for (const block of occupied(state, city, train)) state.owners.set(block, train);
    for (const [train, blocks] of state.intents) for (const block of blocks) if (!state.owners.has(block)) state.owners.set(block, train);
  }
  function canMove(renderer, city, train) {
    const state = stateFor(renderer, city);
    state.intents.delete(train);
    refreshOwners(renderer, city, state);
    const required = occupied(state, city, train);
    const probe = { ...train, signalTrain: train };
    for (let step = 0; step < 4; step++) {
      const block = state.blocks.get(city.idx(probe.x, probe.y));
      if (block !== undefined) required.add(block);
      if (!renderer.pickNext(city, probe, false)) {
        const dx = probe.x - probe.px, dy = probe.y - probe.py;
        if ([[dx, dy], [-dy, dx], [dy, -dx]].some(([x, y]) => renderer.walkable(city, "train", probe.x + x, probe.y + y) &&
            (window.__doubleRail?.canStep(city, probe.x, probe.y, probe.x + x, probe.y + y) ?? true))) return false;
        break;
      }
    }
    for (const block of required) {
      const owner = state.owners.get(block);
      if (owner && owner !== train) return false;
    }
    state.intents.set(train, required);
    for (const block of required) state.owners.set(block, train);
    return true;
  }
  function rightHandScore(city, x, y, dx, dy) {
    // Check if there is an adjacent parallel rail tile to the left or right of our travel vector
    // Vector pointing right: [dy, -dx], Vector pointing left: [-dy, dx]
    const leftX = x - dy, leftY = y + dx;
    const rightX = x + dy, rightY = y - dx;
    const hasLeftRail = city.inBounds(leftX, leftY) && city.rail[city.idx(leftX, leftY)];
    const hasRightRail = city.inBounds(rightX, rightY) && city.rail[city.idx(rightX, rightY)];
    // Standard right-hand running: if we have an adjacent track to our left, we are on the right track (+2 bonus).
    // If we have an adjacent track to our right and none to our left, we are on the wrong side (-2 penalty).
    if (hasLeftRail && !hasRightRail) return 2;
    if (hasRightRail && !hasLeftRail) return -2;
    return 0;
  }

  function bind(renderer) {
    const pick = renderer.pickNext.bind(renderer);
    renderer.pickNext = (city, train, initial) => {
      if (train.kind !== "train" || initial) return pick(city, train, initial);
      const state = states.get(renderer);
      if (!state || state.city !== city) return pick(city, train, initial);
      const dx = train.x - train.px, dy = train.y - train.py;
      const available = point => {
        const block = state.blocks.get(city.idx(point.x, point.y));
        const owner = state.owners.get(block);
        return !owner || owner === train || owner === train.signalTrain;
      };

      // Candidates in priority order: straight [dx, dy], right branch [dy, -dx], left branch [-dy, dx]
      const candidates = [[dx, dy], [dy, -dx], [-dy, dx]]
        .filter(([vx, vy]) => renderer.walkable(city, "train", train.x + vx, train.y + vy) &&
          (window.__doubleRail?.canStep(city, train.x, train.y, train.x + vx, train.y + vy) ?? true))
        .map(([vx, vy]) => {
          const next = { x: train.x + vx, y: train.y + vy, vx, vy };
          const free = available(next);
          const score = rightHandScore(city, next.x, next.y, vx, vy);
          const isStraight = vx === dx && vy === dy;
          return { next, free, score, isStraight };
        });

      if (!candidates.length) return false;

      // Sort candidate choices:
      // 1. Available/unblocked first
      // 2. Right-hand track corridor adherence score
      // 3. Forward straight momentum over unnecessary turns unless switching tracks
      candidates.sort((a, b) => {
        if (a.free !== b.free) return Number(b.free) - Number(a.free);
        if (a.score !== b.score) return b.score - a.score;
        return Number(b.isStraight) - Number(a.isStraight);
      });

      const choice = candidates[0];
      if (!choice || !choice.free) {
        // If preferred choices are blocked, check if any walkable option is available
        const fallback = candidates.find(c => c.free);
        if (!fallback) return false;
        train.px = train.x; train.py = train.y;
        train.x = fallback.next.x; train.y = fallback.next.y; train.t = 0;
        return true;
      }

      train.px = train.x; train.py = train.y;
      train.x = choice.next.x; train.y = choice.next.y; train.t = 0;
      return true;
    };
    const setup = renderer.setupWalkers.bind(renderer);
    renderer.setupWalkers = city => {
      const previous = new Set(renderer.walkers);
      setup(city);
      const state = network(city);
      states.set(renderer, state);
      const admitted = [], claimed = new Set();
      const trains = renderer.walkers.filter(train => train.kind === "train");
      trains.sort((a, b) => Number(previous.has(b)) - Number(previous.has(a)));
      for (const train of trains) {
        const blocks = occupied(state, city, train);
        if ([...blocks].some(block => claimed.has(block))) continue;
        for (const block of blocks) claimed.add(block);
        admitted.push(train);
      }
      renderer.walkers = renderer.walkers.filter(train => train.kind !== "train" || admitted.includes(train));
    };
  }
  function draw(renderer, city, originX, originY, halfWidth, halfHeight, heightScale, scale) {
    const state = stateFor(renderer, city), ctx = renderer.ctx;
    for (const signal of state.signals) {
      const point = { x: signal.index % city.size + 0.2, y: Math.floor(signal.index / city.size) + 0.2 };
      const { x, y } = window.__doubleRail?.position(city, point) ?? point;
      const px = originX + (x - y) * halfWidth;
      const elevation = window.__trainFleet.railHeight(renderer, city, { x, y }) ?? city.base(Math.floor(x), Math.floor(y));
      const py = originY + (x + y) * halfHeight - elevation * heightScale;
      if (px < -20 || py < 0 || px > renderer.canvas.width + 20 || py > renderer.canvas.height + 40) continue;
      const occupied = state.owners.has(signal.block);
      ctx.strokeStyle = "#606d79";
      ctx.lineWidth = 1.5 * scale;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - 12 * scale); ctx.stroke();
      ctx.fillStyle = "#202a35";
      ctx.fillRect(px - 2.5 * scale, py - 16 * scale, 5 * scale, 7 * scale);
      ctx.fillStyle = occupied ? "#ef675b" : "#7bcd87";
      ctx.beginPath(); ctx.arc(px, py - 12.5 * scale, 1.4 * scale, 0, Math.PI * 2); ctx.fill();
    }
  }
  window.__railSignals = { bind, canMove, draw };
})();
