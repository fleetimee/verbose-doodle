(() => {
  const leisure = new Set(["park", "bigpark", "botanicalgarden", "grandmuseum", "stadium", "shoppingmall", "beachcarnival", "volleyballcourt", "soccerfield"]);
  const mix = value => Math.imul(value ^ (value >>> 16), 0x45d9f3b) >>> 0;
  function routine(city, person) {
    const hour = ((city.dayTime ?? 8) + (person.seed % 4) * 0.25) % 24;
    if (hour < 7 || hour >= 21) return "home";
    if (hour < 9) return "shop";
    if (hour < 17) return "work";
    if (hour < 19) return "shop";
    return "leisure";
  }
  function prepare(city, state) {
    if (state.lifeRefresh === state.refreshed) return;
    state.lifeRefresh = state.refreshed;
    const places = new Map();
    const entrances = new Map();
    for (const road of state.roads) {
      const kinds = new Set();
      const entries = new Map();
      const add = (kind, dx, dy) => {
        kinds.add(kind);
        const distance = Math.abs(dx) + Math.abs(dy);
        if (distance && (!entries.has(kind) || distance < entries.get(kind).distance)) {
          entries.set(kind, { u: dx ? dx > 0 ? 0.98 : 0.02 : 0.5, v: dy ? dy > 0 ? 0.98 : 0.02 : 0.5, distance });
        }
      };
      const x = road % city.size, y = Math.floor(road / city.size);
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        if (Math.abs(dx) + Math.abs(dy) > 2 || !city.inBounds(x + dx, y + dy)) continue;
        const i = city.idx(x + dx, y + dy);
        if (city.fire[i] || city.flood[i]) continue;
        const zone = city.overlay[i];
        if (city.level[i] > 0) {
          if (zone === 3) add("home", dx, dy);
          if (zone === 4) { add("shop", dx, dy); add("work", dx, dy); }
          if (zone === 5) add("work", dx, dy);
        }
        if (zone === 6 && leisure.has(city.structAt(i)?.type)) add("leisure", dx, dy);
      }
      if (kinds.size) { places.set(road, kinds); entrances.set(road, entries); }
    }
    state.places = places;
    state.entrances = entrances;
    state.plans = 0;
  }
  function plan(state, person, kind) {
    const city = state.city;
    const previous = new Map([[person.index, null]]), queue = [person.index];
    let goal = null, rank = Infinity;
    for (let cursor = 0; cursor < queue.length && cursor < 512; cursor++) {
      const index = queue[cursor];
      if (state.places.get(index)?.has(kind)) {
        const score = mix(index ^ person.seed ^ (kind === "work" ? 731 : kind === "home" ? 317 : 991));
        if (score < rank) { goal = index; rank = score; }
      }
      const x = index % city.size, y = Math.floor(index / city.size);
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (!city.inBounds(nx, ny)) continue;
        const next = city.idx(nx, ny);
        if (!state.roads.has(next) || previous.has(next) || city.base(nx, ny) !== city.base(x, y)) continue;
        previous.set(next, index); queue.push(next);
      }
    }
    if (person.arrival) {
      person.departure = { ...person.arrival, since: state.clock };
      person.arrival = null;
    }
    person.route = [];
    person.goal = goal;
    if (goal !== null) for (let index = goal; index !== person.index; index = previous.get(index)) person.route.unshift(index);
    person.routine = kind;
    person.plannedAt = state.clock;
  }
  function resting(city, state, person) {
    const kind = routine(city, person);
    const invalid = person.route?.some(index => !state.roads.has(index));
    if ((person.routine !== kind || invalid || person.goal === null && state.clock - person.plannedAt > 20) && state.plans < 4 && !person.crossing) {
      state.plans++; plan(state, person, kind);
    }
    if (person.route?.[0] === person.index) person.route.shift();
    const atEntrance = !person.crossing && person.goal === person.index && person.routine === kind && (kind === "home" || kind === "work" || kind === "shop");
    if (atEntrance && !person.arrival && !person.departure) {
      const entry = state.entrances?.get(person.index)?.get(kind);
      if (entry) person.arrival = { since: state.clock,
        fromU: person.axis === "x" ? person.position : person.side,
        fromV: person.axis === "y" ? person.position : person.side, u: entry.u, v: entry.v };
    }
    const transition = person.departure ?? person.arrival;
    person.opacity = 1;
    person.visualU = undefined; person.visualV = undefined;
    person.entering = false;
    if (transition) {
      const progress = Math.min(1, Math.max(0, (state.clock - transition.since) / 1.2));
      const travel = person.departure ? 1 - progress : progress;
      person.visualU = transition.fromU + (transition.u - transition.fromU) * travel;
      person.visualV = transition.fromV + (transition.v - transition.fromV) * travel;
      person.opacity = Math.min(1, (1 - travel) * 4);
      person.entering = progress < 1;
      if (person.departure && progress >= 1) {
        person.departure = null;
        person.visualU = undefined; person.visualV = undefined;
      }
    }
    person.indoors = !!person.arrival && !person.departure && !person.entering;
    person.talking = state.clock < (person.chatUntil ?? 0);
    person.resting = !person.crossing && (person.entering || person.indoors || person.goal === person.index || person.goal == null || state.clock < (person.chatUntil ?? 0));
    return person.resting;
  }
  function steer(state, person) {
    const next = person.route?.[0];
    if (next === undefined) return;
    const difference = next - person.index;
    person.axis = Math.abs(difference) === 1 ? "x" : "y";
    person.direction = difference > 0 ? 1 : -1;
  }
  function socialize(state) {
    if (!(state.delta > 0)) return;
    const city = state.city;
    city.residentSocial ??= {};
    for (const people of state.tiles.values()) {
      for (let i = 0; i < people.length; i++) {
        const a = people[i];
        if (a.arrival || a.departure || a.indoors || a.crossing || state.clock < (a.socialAfter ?? 0)) continue;
        const b = people.slice(i + 1).find(other => !other.arrival && !other.departure && !other.indoors && !other.crossing && other.axis === a.axis && Math.abs(other.side - a.side) < 0.2 && Math.abs(other.position - a.position) < 0.3 && state.clock >= (other.socialAfter ?? 0));
        if (!b) continue;
        const key = `${Math.min(a.id, b.id)}:${Math.max(a.id, b.id)}`;
        const meetings = city.residentSocial[key] ?? 0;
        if (meetings || Object.keys(city.residentSocial).length < 512) city.residentSocial[key] = Math.min(99, meetings + 1);
        const until = state.clock + 2.5 + (a.seed % 3);
        for (const person of [a, b]) {
          person.chatUntil = until;
          person.socialAfter = until + 15 + person.seed % 15;
          person.friendly = meetings > 1;
          person.resting = true;
        }
        break;
      }
    }
  }
  function draw(ctx, person, x, y, scale) {
    if (!person.resting || person.indoors || !(person.chatUntil > 0)) return;
    if (!person.talking) return;
    ctx.fillStyle = person.friendly ? "#7ed957" : "#f3ecd8";
    ctx.beginPath(); ctx.ellipse(x, y - 13 * scale, 4 * scale, 2.5 * scale, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#1d2538";
    for (const offset of [-1.5, 0, 1.5]) ctx.fillRect(x + offset * scale, y - 13.5 * scale, scale * 0.7, scale);
  }
  window.__residentLife = { prepare, resting, steer, socialize, draw };
})();
