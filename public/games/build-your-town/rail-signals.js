(() => {
  const states = new WeakMap();
  const directions = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  const length = train => [3, 4, 5][train.fleetVariant ?? 0] * 0.68;
  function railSignature(city) {
    let signature = 0;
    for (let index = 0; index < city.count; index++) if (city.rail[index]) signature = (signature + Math.imul(index + 1, index + 3)) | 0;
    return signature;
  }
  function network(city, signature = railSignature(city)) {
    const neighbors = new Map();
    for (let index = 0; index < city.count; index++) {
      if (!city.rail[index]) continue;
      const x = index % city.size, y = Math.floor(index / city.size);
      neighbors.set(index, directions.filter(([dx, dy]) => city.inBounds(x + dx, y + dy) && city.rail[city.idx(x + dx, y + dy)])
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
        if ([[dx, dy], [-dy, dx], [dy, -dx]].some(([x, y]) => renderer.walkable(city, "train", probe.x + x, probe.y + y))) return false;
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
  function bind(renderer) {
    const pick = renderer.pickNext.bind(renderer);
    renderer.pickNext = (city, train, initial) => {
      if (train.kind !== "train" || initial) return pick(city, train, initial);
      const state = states.get(renderer);
      if (!state || state.city !== city) return pick(city, train, initial);
      const preferred = { ...train };
      if (!pick(city, preferred, false)) return false;
      const available = point => {
        const block = state.blocks.get(city.idx(point.x, point.y));
        const owner = state.owners.get(block);
        return !owner || owner === train || owner === train.signalTrain;
      };
      if (available(preferred)) {
        Object.assign(train, { px: preferred.px, py: preferred.py, x: preferred.x, y: preferred.y, t: 0 });
        return true;
      }
      const dx = train.x - train.px, dy = train.y - train.py;
      for (const [x, y] of [[dx, dy], [-dy, dx], [dy, -dx]]) {
        const next = { x: train.x + x, y: train.y + y };
        if (!renderer.walkable(city, "train", next.x, next.y) || !available(next)) continue;
        train.px = train.x; train.py = train.y;
        train.x = next.x; train.y = next.y; train.t = 0;
        return true;
      }
      return false;
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
      const x = signal.index % city.size + 0.2, y = Math.floor(signal.index / city.size) + 0.2;
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
