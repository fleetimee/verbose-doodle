(() => {
  const states = new WeakMap();
  const limit = 96;
  const styles = {
    solarfarm: { kind: "solar" },
    geothermal: { kind: "steam" },
    desalination: { kind: "water", tanks: [[2.25, 0.65, 9, 0.35], [2.25, 1.95, 9, 0.35], [0.75, 2.2, 9, 0.35]] },
    reservoir: { kind: "water", tanks: [[2.3, 2.6, 6.3, 0.7], [2.8, 1.4, 6.3, 0.45]] },
    university: { path: [2, 1.6, 2, 3.7] },
    medicalcenter: { path: [0.4, 3.8, 3.6, 3.8], facades: [[0.3, 0.3, 2.3, 2.3, 0, 42]] },
    policehq: { path: [0.3, 2.93, 2.7, 2.93], beacons: [[1.5, 0.8, 54, "#e47b65"], [2.3, 2.2, 17, "#62a7e2"]] },
    firecommand: { path: [2.6, 1.6, 2.8, 2.8], beacons: [[2.55, 0.55, 55, "#ef8065"]] },
    botanicalgarden: { kind: "garden", path: [1.8, 3.4, 3.6, 3.6] },
    grandmuseum: { path: [0.35, 2.85, 2.65, 2.85] },
    volleyballcourt: { kind: "volleyball" },
    soccerfield: { kind: "soccer" },
    shoppingmall: { kind: "mall", path: [0.3, 3.3, 3.7, 3.3] },
    beachcarnival: { kind: "carnival", path: [0.3, 2.7, 3.7, 2.7] },
    residentialtower: { facades: [[0.65, 0.65, 2.35, 2.35, 12, 58]], beacons: [[1.5, 1.5, 102, "#e47b65"]] },
    skylineapartments: { facades: [[0.6, 0.6, 1.75, 1.8, 12, 94], [2.1, 1.85, 3.45, 3.3, 12, 112]] },
    officeskyscraper: { facades: [[0.85, 0.85, 3.15, 3.15, 12, 105]], beacons: [[2, 2, 161, "#e47b65"]] },
    supertall: { facades: [[1, 1, 3, 3, 14, 104]], beacons: [[2, 2, 168, "#e47b65"]] },
    researchcampus: { path: [1.9, 3.7, 3.5, 3.7], facades: [[0.3, 0.3, 1.6, 3.5, 0, 24]], beacons: [[2.7, 2.7, 42, "#e47b65"]] },
  };

  function update(renderer, city, time, speed) {
    let state = states.get(renderer);
    if (!state || state.city !== city) {
      state = { city, records: new Map(), selected: new Set(), clock: 0, last: time, cleaned: time };
      states.set(renderer, state);
    }
    const delta = Math.min(0.12, Math.max(0, (time - state.last) / 1000));
    state.clock += delta * speed;
    if (!speed && state.speed) for (const record of state.records.values()) record.last = state.clock;
    state.speed = speed;
    state.last = time;
    if (time - state.cleaned >= 1000) {
      for (const [id, record] of state.records) {
        if (city.structs.get(id) !== record.building) state.records.delete(id);
      }
      state.cleaned = time;
    }
  }

  function setSpeed(renderer, speed) {
    const state = states.get(renderer);
    if (!state) return;
    state.speed = speed;
    state.last = performance.now();
    for (const record of state.records.values()) record.last = state.clock;
  }

  function beginFrame(renderer) {
    states.get(renderer)?.selected.clear();
  }

  function prepare(renderer, city, building, definition) {
    const style = styles[building.type] ?? (window.__industry?.byType[building.type] ? { kind: "industry", type: building.type } : null);
    const state = states.get(renderer);
    if (!style || !state || state.city !== city) return null;
    let record = state.records.get(building.id);
    if (state.selected.has(building.id)) return record;
    if (state.selected.size >= limit) return null;
    state.selected.add(building.id);
    if (!record) {
      if (state.records.size >= limit) {
        const unused = [...state.records.keys()].find(id => !state.selected.has(id));
        state.records.delete(unused);
      }
      const canvas = document.createElement("canvas");
      canvas.width = definition.size * 64;
      canvas.height = definition.size * 32 + 112;
      record = { building, canvas, clock: (building.x * 13 + building.y * 7) % 30,
        last: state.clock, frame: -1, active: false };
      state.records.set(building.id, record);
    }
    const active = !!((style.kind !== "industry" || window.__industry.operating(city, building)) && window.__recreation.operating(city, building, definition) &&
      (!definition.dept || definition.jobs || city.funding[definition.dept] > 0));
    const elapsed = state.clock - record.last;
    if (active && record.active && state.speed > 0 && elapsed <= 1) record.clock += elapsed * (window.__dayNight?.activity(city, 6, building.type) ?? 1);
    record.last = state.clock;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const detail = window.__townGraphics?.effects() ?? 2;
    const frame = reducedMotion || !detail ? 0 : Math.floor(record.clock * (detail === 1 ? 6 : 12)) * (detail === 1 ? 2 : 1);
    if (frame !== record.frame || active !== record.active) {
      record.frame = frame;
      record.active = !!active;
      const ctx = record.canvas.getContext("2d");
      ctx.clearRect(0, 0, record.canvas.width, record.canvas.height);
      const project = (u, v, z = 0) => [(u - v) * 32 + definition.size * 32, (u + v) * 16 + 112 - z];
      paint(ctx, project, style, frame / 12, record.active);
    }
    return record;
  }

  function draw(renderer, record, x, y, scale, columnX, columnY, size) {
    const ctx = renderer.ctx;
    ctx.save();
    ctx.beginPath();
    for (const [index, point] of [[-32, 16], [0, 32], [32, 16], [32, -96], [0, -112], [-32, -96]].entries()) {
      const px = x + point[0] * scale, py = y + point[1] * scale;
      if (index) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    }
    ctx.closePath(); ctx.clip();
    ctx.drawImage(record.canvas, x + (columnY - columnX - size) * 32 * scale,
      y - (112 + (columnX + columnY) * 16) * scale,
      record.canvas.width * scale, record.canvas.height * scale);
    ctx.restore();
  }

  function polygon(ctx, project, points, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    points.forEach((point, index) => index ? ctx.lineTo(...project(...point)) : ctx.moveTo(...project(...point)));
    ctx.closePath(); ctx.fill();
  }

  function line(ctx, project, points, color, width = 1) {
    ctx.strokeStyle = color; ctx.lineWidth = width;
    ctx.beginPath();
    points.forEach((point, index) => index ? ctx.lineTo(...project(...point)) : ctx.moveTo(...project(...point)));
    ctx.stroke();
  }

  function person(ctx, project, u, v, shirt, time, raised = false) {
    const [x, y] = project(u, v);
    const stride = Math.sin(time * 7) * 1.1;
    ctx.fillStyle = "rgba(20,24,34,0.22)";
    ctx.beginPath(); ctx.ellipse(x, y, 2, 0.9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#303748"; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(x, y - 3); ctx.lineTo(x - stride, y); ctx.moveTo(x, y - 3); ctx.lineTo(x + stride, y); ctx.stroke();
    ctx.strokeStyle = shirt; ctx.lineWidth = 2.3;
    ctx.beginPath(); ctx.moveTo(x, y - 6); ctx.lineTo(x, y - 3); ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x, y - 5); ctx.lineTo(x - 2, y - (raised ? 8 : 3.5)); ctx.moveTo(x, y - 5); ctx.lineTo(x + 2, y - (raised ? 8 : 3.5)); ctx.stroke();
    ctx.fillStyle = "#d7aa7c";
    ctx.beginPath(); ctx.arc(x, y - 7.3, 1.3, 0, Math.PI * 2); ctx.fill();
  }

  function ball(ctx, project, u, v, z) {
    const [x, ground] = project(u, v), [, y] = project(u, v, z);
    ctx.fillStyle = "rgba(20,24,34,0.2)";
    ctx.beginPath(); ctx.ellipse(x, ground, 2, 0.8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#faf1d8";
    ctx.beginPath(); ctx.arc(x, y - 1.5, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#607386"; ctx.fillRect(x - 0.5, y - 2, 1, 1);
  }

  function visitors(ctx, project, path, time) {
    for (let n = 0; n < 3; n++) {
      const phase = (time / 14 + n / 3) % 1;
      const t = phase < 0.5 ? phase * 2 : 2 - phase * 2;
      person(ctx, project, path[0] + (path[2] - path[0]) * t, path[1] + (path[3] - path[1]) * t,
        ["#d9975b", "#67a7b2", "#9a8eb7"][n], time + n);
    }
  }

  function windows(ctx, project, facade, time) {
    const [left, back, right, front, base, height] = facade;
    for (let side = 0; side < 2; side++) {
      const columns = Math.max(1, Math.round((side ? front - back : right - left) * 4));
      const rows = Math.floor((height - 4) / 9);
      for (let n = 0; n < Math.min(5, rows); n++) {
        const row = (n * 3 + side) % rows, col = (n * 5 + side * 2) % columns;
        const a = (col + 0.25) / columns, b = (col + 0.75) / columns, z = base + 4 + row * 9;
        const alpha = 0.18 + (Math.sin(time * Math.PI * 2 / 32 + n * 2 + side) + 1) * 0.22;
        const points = side ? [[right + 0.01, back + (front - back) * a, z], [right + 0.01, back + (front - back) * b, z],
          [right + 0.01, back + (front - back) * b, z + 5], [right + 0.01, back + (front - back) * a, z + 5]]
          : [[left + (right - left) * a, front + 0.01, z], [left + (right - left) * b, front + 0.01, z],
            [left + (right - left) * b, front + 0.01, z + 5], [left + (right - left) * a, front + 0.01, z + 5]];
        polygon(ctx, project, points, `rgba(255,227,138,${alpha})`);
      }
    }
  }

  function carnival(ctx, project, time) {
    const center = project(1.15, 1.45, 30);
    const rim = [];
    for (let n = 0; n <= 32; n++) {
      const angle = time * Math.PI * 2 / 24 + n * Math.PI / 16;
      rim.push(project(1.15 + Math.cos(angle) * 0.8, 1.45, 30 + Math.sin(angle) * 23));
    }
    ctx.strokeStyle = "#f6e6b9"; ctx.lineWidth = 1.8; ctx.beginPath();
    rim.forEach((p, n) => n ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.stroke();
    for (let n = 0; n < 32; n += 4) {
      ctx.beginPath(); ctx.moveTo(...center); ctx.lineTo(...rim[n]); ctx.stroke();
      ctx.fillStyle = ["#e16b57", "#53aeb4", "#efbd45", "#8b85bb"][n / 4 % 4];
      ctx.fillRect(rim[n][0] - 3, rim[n][1], 6, 5);
    }
    const riders = [];
    for (let n = 0; n < 8; n++) {
      const angle = time * Math.PI * 2 / 10 + n * Math.PI / 4;
      riders.push({ u: 2.85 + Math.cos(angle) * 0.5, v: 1.6 + Math.sin(angle) * 0.5,
        z: 7 + Math.sin(time * 2 + n) * 1.5, color: n % 2 ? "#f9e8b1" : "#a6d5cb" });
    }
    const drawRider = (rider) => {
      const [x, y] = project(rider.u, rider.v, rider.z);
      ctx.fillStyle = rider.color; ctx.fillRect(x - 2, y - 2, 4, 3);
      ctx.strokeStyle = "#c4ad79"; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(x, y + 1); ctx.lineTo(x, y + 5); ctx.stroke();
    };
    riders.filter(r => r.u + r.v < 4.45).forEach(drawRider);
    for (let n = 0; n < 8; n++) {
      const a = time * Math.PI * 2 / 10 + n * Math.PI / 4, b = a + Math.PI / 4;
      polygon(ctx, project, [[2.85, 1.6, 24], [2.85 + Math.cos(a) * 0.8, 1.6 + Math.sin(a) * 0.8, 17],
        [2.85 + Math.cos(b) * 0.8, 1.6 + Math.sin(b) * 0.8, 17]], n % 2 ? "#f9e8bc" : "#d95756");
    }
    riders.filter(r => r.u + r.v >= 4.45).forEach(drawRider);
  }

  function paint(ctx, project, style, time, active) {
    ctx.lineCap = "round";
    if (style.kind === "industry") { window.__industryModels.paint(ctx, project, style.type, time, active); return; }
    if (style.kind === "carnival") carnival(ctx, project, time);
    if (style.kind === "volleyball") {
      if (!active) { ball(ctx, project, 1.4, 1.6, 1); return; }
      for (let team = 0; team < 2; team++) for (let n = 0; n < 2; n++) {
        person(ctx, project, 0.55 + n * 0.85 + Math.sin(time * 2 + n) * 0.07, team ? 1.55 : 0.45,
          team ? "#df795d" : "#59a3bb", time + n, Math.sin(time * 2 + team * Math.PI) > 0.75);
      }
      const phase = time / 3 % 1, travel = phase < 0.5 ? phase * 2 : 2 - phase * 2;
      ball(ctx, project, 1 + Math.sin(time) * 0.22, 0.4 + travel * 1.2, 2 + Math.sin(travel * Math.PI) * 18);
    }
    if (style.kind === "soccer") {
      if (!active) { ball(ctx, project, 2.2, 2.1, 1); return; }
      for (let team = 0; team < 2; team++) for (let n = 0; n < 3; n++) {
        const keeper = n === 0;
        const u = keeper ? 2 + Math.sin(time + team) * 0.2 : 1.1 + (n - 1) * 1.6 + Math.sin(time * 0.8 + team * 2 + n) * 0.25;
        const v = keeper ? team ? 3.35 : 0.65 : 1.4 + team * 1.15 + Math.cos(time * 0.7 + n) * 0.25;
        person(ctx, project, u, v, team ? "#d96c59" : "#559ac0", time * 1.3 + n);
      }
      ball(ctx, project, 2 + Math.sin(time * 0.7) * 1.05, 2 + Math.sin(time * 1.1) * 1.05, 0.5 + Math.abs(Math.sin(time * 4)) * 0.8);
    }
    if (!active) return;
    if (style.path) visitors(ctx, project, style.path, time);
    for (const facade of style.facades || []) windows(ctx, project, facade, time);
    for (const [u, v, z, color] of style.beacons || []) {
      const [x, y] = project(u, v, z);
      ctx.globalAlpha = 0.35 + (Math.sin(time * Math.PI * 2 / 3.6) + 1) * 0.25;
      ctx.fillStyle = color; ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
    }
    if (style.kind === "solar") {
      const phase = time / 18 % 1;
      for (let y = 0.35; y < 2.8; y += 0.8) for (let x = 0.25; x < 2.7; x += 0.8) {
        const a = phase * 0.48, b = a + 0.05;
        polygon(ctx, project, [[x, y + a, 8.2 - a / 0.55 * 5], [x + 0.65, y + a, 8.2 - a / 0.55 * 5],
          [x + 0.65, y + b, 8.2 - b / 0.55 * 5], [x, y + b, 8.2 - b / 0.55 * 5]], "rgba(205,235,242,0.28)");
      }
    }
    if (style.kind === "steam") for (const v of [0.6, 1.7]) for (let n = 0; n < 3; n++) {
      const phase = (time / 5 + n / 3) % 1, [x, y] = project(2.35, v, 38 + phase * 18);
      ctx.fillStyle = `rgba(220,231,225,${(1 - phase) * 0.4})`;
      ctx.beginPath(); ctx.arc(x + phase * 5, y, 2 + phase * 3, 0, Math.PI * 2); ctx.fill();
    }
    if (style.kind === "water") for (const [u, v, z, radius] of style.tanks) for (let n = 0; n < 2; n++) {
      const phase = (time / 4 + n / 2) % 1, [x, y] = project(u, v, z), r = radius * (0.2 + phase * 0.8);
      ctx.strokeStyle = `rgba(215,240,241,${(1 - phase) * 0.65})`; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.ellipse(x, y, r * 32, r * 16, 0, 0, Math.PI * 2); ctx.stroke();
    }
    if (style.kind === "garden") for (let n = 0; n < 3; n++) {
      const [x, y] = project(1.8 + n * 0.35 + Math.sin(time + n) * 0.12, 0.4 + Math.cos(time * 0.7 + n) * 0.12, 4 + Math.sin(time + n));
      const wing = 0.5 + Math.abs(Math.sin(time * 8 + n));
      ctx.fillStyle = n % 2 ? "#e8bc63" : "#cca0bc";
      ctx.beginPath(); ctx.ellipse(x - 0.8, y, wing, 0.8, -0.4, 0, Math.PI * 2); ctx.ellipse(x + 0.8, y, wing, 0.8, 0.4, 0, Math.PI * 2); ctx.fill();
    }
    if (style.kind === "mall") {
      const opening = (Math.sin(time * Math.PI * 2 / 8) + 1) * 0.07;
      polygon(ctx, project, [[2.17, 3.205, 0], [2.58, 3.205, 0], [2.58, 3.205, 11], [2.17, 3.205, 11]], "#28465a");
      polygon(ctx, project, [[2.17, 3.21, 0], [2.375 - opening, 3.21, 0], [2.375 - opening, 3.21, 11], [2.17, 3.21, 11]], "#9fc4cd");
      polygon(ctx, project, [[2.375 + opening, 3.21, 0], [2.58, 3.21, 0], [2.58, 3.21, 11], [2.375 + opening, 3.21, 11]], "#9fc4cd");
    }
  }

  window.__buildingActivity = { update, setSpeed, beginFrame, prepare, draw, has: type => !!styles[type] || !!window.__industry?.byType[type] };
})();
