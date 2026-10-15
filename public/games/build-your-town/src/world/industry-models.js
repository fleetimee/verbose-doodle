(() => {
  // Continue the bundled game's small, shaded isometric model language.
  const colors = { steel: "#657584", roof: "#9caab5", yellow: "#d8ad4b", coal: "#363d47", ore: "#a76d52", copper: "#619e90" };
  function draw(type, scene, project, polygon, { animatedBase = false } = {}) {
    const def = window.__industry.byType[type];
    if (!def) return false;
    const { steel, roof, yellow, coal, ore, copper } = colors;
    const box = (x, y, w, d, h, wall = steel, top = roof, z = 0) => scene.box(x, y, x + w, y + d, h, wall, top, { z0: z });
    const line = (points, color, width = 1) => scene.custom(55, ctx => {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath();
      points.forEach((point, n) => n ? ctx.lineTo(...project(...point)) : ctx.moveTo(...project(...point))); ctx.stroke();
    });
    const pile = (x, y, color, height = 12) => {
      scene.custom(20 + x + y, ctx => {
        polygon(ctx, [[x - 0.4, y - 0.3, 1], [x + 0.35, y - 0.3, 1], [x, y, height]].map(p => project(...p)), color);
        polygon(ctx, [[x + 0.35, y - 0.3, 1], [x + 0.45, y + 0.3, 1], [x - 0.4, y + 0.3, 1], [x - 0.4, y - 0.3, 1], [x, y, height]].map(p => project(...p)), "#71665a");
      });
    };
    const shed = (x, y, w, d, h, wall, top) => {
      box(x, y, w, d, h, wall, top);
      for (let n = 0.15; n < w; n += 0.25) line([[x + n, y, h + 0.2], [x + n, y + d, h + 0.2]], "#c1c8c5", 0.5);
      box(x + 0.15, y + d + 0.005, w * 0.35, 0.03, Math.min(10, h - 2), "#293c49", "#293c49");
    };
    const conveyor = (x, y, length, z, color) => {
      box(x, y, length, 0.22, 2, steel, color, z);
      for (let u = x + 0.1; u < x + length; u += 0.4) box(u, y + 0.03, 0.06, 0.16, z, steel, roof);
    };
    box(0.08, 0.08, def.size - 0.16, def.size - 0.16, 1, "#7d7b70", "#999688");
    for (let n = 0.3; n < def.size - 0.2; n += 0.45) {
      box(n, def.size - 0.2, 0.23, 0.06, 0.3, yellow, yellow, 1);
    }
    if (type === "coalmine") {
      box(0.3, 0.3, 1.1, 1.1, 2, "#3b434a", "#222b32");
      for (const [x, y] of [[0.4, 0.4], [1.2, 0.4], [0.4, 1.2], [1.2, 1.2]]) box(x, y, 0.1, 0.1, 38, steel, roof);
      box(0.3, 0.35, 1.05, 0.25, 4, yellow, "#f1cb64", 35);
      line([[0.45, 1.25, 4], [1.25, 1.25, 34], [0.45, 1.25, 34], [1.25, 1.25, 4]], "#bbc0b7", 1.5);
      shed(1.65, 0.3, 1, 0.9, 17, "#776b5b", "#a6a498");
      conveyor(0.65, 1.7, 1.65, 6, coal);
      pile(2.1, 2.25, coal, 14);
      box(0.25, 2.2, 0.65, 0.4, 5, yellow, yellow);
    } else if (type === "ironmine") {
      for (let n = 0; n < 3; n++) box(0.25 + n * 0.2, 0.2 + n * 0.2, 1.55 - n * 0.4, 1.55 - n * 0.4, 1.3, "#957459", ["#b49572", "#846951", "#514c47"][n], 1 + n * 1.5);
      shed(1.9, 0.25, 0.8, 0.9, 16, "#926c54", "#c0ad8d");
      conveyor(0.8, 1.85, 1.7, 9, ore);
      pile(2.25, 2.3, ore);
      box(0.35, 1.35, 0.6, 0.35, 4, "#555b5e", "#4c5359");
      box(0.42, 1.4, 0.45, 0.25, 7, yellow, "#f1c969", 4);
    } else if (type === "coppermine") {
      box(0.25, 0.25, 1.25, 1.25, 3, "#647c70", "#485e58");
      shed(1.75, 0.2, 0.9, 1, 23, "#6b8c80", "#adc0b1");
      scene.cylinder(0.85, 0.85, 0.38, 17, "#83a594", "#b6c9b6");
      conveyor(0.5, 1.75, 1.8, 7, copper);
      pile(2.15, 2.25, copper, 10);
      scene.cylinder(0.5, 2.4, 0.24, 10, "#799b91", "#b3c9ba");
    } else if (type === "steelmill") {
      shed(0.3, 0.3, 1.65, 1.7, 25, "#865b4e", "#a49a86");
      box(0.6, 0.65, 0.27, 0.27, 45, "#665e56", "#b9a68c", 25);
      box(1.25, 0.65, 0.27, 0.27, 36, "#665e56", "#b9a68c", 25);
      scene.cylinder(2.65, 0.85, 0.5, 30, "#7a6757", "#c4aa81");
      scene.cylinder(2.65, 0.85, 0.3, 13, "#9f7d57", "#d2b379", { z0: 30 });
      box(2.25, 1.65, 1.1, 0.5, 10, "#4f5d65", "#8d9b9c");
      box(2.35, 1.74, 0.9, 0.22, 1, "#dc8050", "#f6b45e", 10);
      conveyor(0.4, 2.5, 2.6, 5, "#909fa6");
      for (let n = 0; n < 3; n++) box(2.7, 2.6 + n * 0.22, 0.9, 0.12, 3 + n, "#687f8c", "#b3c7ca");
    } else if (type === "goodsfactory") {
      shed(0.3, 0.3, 2.3, 1.8, 26, "#788f8d", "#bac7bc");
      for (let n = 0; n < 3; n++) box(0.45 + n * 0.65, 0.55, 0.4, 1.25, 3, "#75868c", "#9fc6d0", 26);
      box(2.9, 0.4, 0.65, 1.3, 18, "#a5ad9e", "#d0d2bf");
      conveyor(0.4, 2.55, 2.1, 5, "#667b7d");
      for (let n = 0; n < 4; n++) box(2.8 + n % 2 * 0.35, 2.4 + Math.floor(n / 2) * 0.38, 0.3, 0.3, 6, "#ab8957", "#d9bb7e");
      box(0.5, 2.13, 1.8, 0.05, 3, "#8fbcca", "#aacdd3", 16);
    } else {
      shed(0.25, 0.25, 1.15, 1.1, 17, "#76858e", "#afbbb9");
      for (let n = 0; n < 4; n++) box(1.65, 0.3 + n * 0.38, 0.95, 0.3, 7, n % 2 ? "#6b9094" : "#ae7455", n % 2 ? "#9ab6b2" : "#d09c76");
      for (const x of [0.35, 2.55]) box(x, 1.95, 0.12, 0.12, 32, yellow, "#edca72");
      box(0.25, 1.9, 2.5, 0.25, 4, yellow, "#edca72", 31);
      line([[0.3, 2, 27], [2.65, 2, 27]], "#777b77", 1);
    }
    if (!animatedBase) scene.custom(90, ctx => paint(ctx, project, type, 0, false));
    return true;
  }
  function paint(ctx, project, type, time, active) {
    const line = (points, color, width = 1) => {
      ctx.strokeStyle = color; ctx.lineWidth = width; ctx.beginPath();
      points.forEach((p, n) => n ? ctx.lineTo(...project(...p)) : ctx.moveTo(...project(...p))); ctx.stroke();
    };
    const face = (points, color) => {
      ctx.fillStyle = color; ctx.beginPath();
      points.forEach((p, n) => n ? ctx.lineTo(...project(...p)) : ctx.moveTo(...project(...p))); ctx.closePath(); ctx.fill();
    };
    const t = active ? time : 0;
    if (type === "coalmine") {
      const [x, y] = project(0.8, 0.55, 41);
      ctx.strokeStyle = "#e2bc5c"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.stroke();
      for (let n = 0; n < 6; n++) {
        const angle = t * Math.PI / 3 + n * Math.PI / 3;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(angle) * 7, y + Math.sin(angle) * 7); ctx.stroke();
      }
      line([[0.8, 0.55, 34], [0.8, 0.55, 8 + Math.sin(t * 0.6) * 4]], "#373e44", 1.5);
    }
    if (type === "ironmine") {
      const reach = 0.5 + Math.sin(t * 0.8) * 0.18;
      line([[0.65, 1.5, 10], [1.1, 1.1, 25], [1.1 + reach, 0.65, 12], [1.25 + reach, 0.65, 6]], "#e4b64e", 4);
      face([[1.15 + reach, 0.5, 7], [1.45 + reach, 0.5, 7], [1.4 + reach, 0.8, 3], [1.15 + reach, 0.8, 3]], "#5d635d");
    }
    if (type === "coppermine") {
      const [x, y] = project(0.85, 0.85, 21);
      ctx.strokeStyle = "#e2c884"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(x, y, 10, 5, 0, 0, Math.PI * 2); ctx.stroke();
      const angle = t * Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(x - Math.cos(angle) * 10, y - Math.sin(angle) * 5); ctx.lineTo(x + Math.cos(angle) * 10, y + Math.sin(angle) * 5); ctx.stroke();
    }
    if (["coalmine", "ironmine", "coppermine", "steelmill", "goodsfactory"].includes(type)) {
      const y = type === "coalmine" ? 1.8 : type === "ironmine" ? 1.95 : type === "coppermine" ? 1.85 : 2.65;
      const z = type === "ironmine" ? 12 : type === "coppermine" ? 10 : type === "coalmine" ? 9 : 8;
      for (let n = 0; n < 4; n++) {
        const u = 0.8 + (n * 0.4 + t * 0.15) % 1.6;
        face([[u, y, z], [u + 0.12, y, z + 2], [u + 0.18, y + 0.1, z], [u, y + 0.1, z]], type === "coalmine" ? "#323842" : type === "ironmine" ? "#ce9570" : type === "coppermine" ? "#97c5a9" : "#d0c5a2");
      }
    }
    if (type === "steelmill" && active) {
      for (let n = 0; n < 4; n++) {
        const phase = (t / 6 + n / 4) % 1, [x, y] = project(0.73, 0.78, 71 + phase * 20);
        ctx.fillStyle = `rgba(181,170,152,${(1 - phase) * 0.4})`;
        ctx.beginPath(); ctx.arc(x + phase * 8, y, 3 + phase * 5, 0, Math.PI * 2); ctx.fill();
        const p = (t * 1.5 + n / 4) % 1;
        line([[2.8, 1.9, 12], [2.8 + p * 0.2, 1.9 + n * 0.04, 12 + Math.sin(p * Math.PI) * 9]], "#f9c36b", 0.8);
      }
    }
    if (type === "freightterminal") {
      const u = 0.55 + (Math.sin(t * Math.PI / 12) + 1) * 0.85;
      const z = 12 + (Math.sin(t * Math.PI / 6) + 1) * 5;
      line([[u, 2.05, 31], [u, 2.05, z]], "#444e54", 1.2);
      face([[u - 0.2, 1.85, z], [u + 0.35, 1.85, z], [u + 0.35, 2.2, z], [u - 0.2, 2.2, z]], "#c19a65");
      face([[u - 0.2, 2.2, z], [u + 0.35, 2.2, z], [u + 0.35, 2.2, z - 5], [u - 0.2, 2.2, z - 5]], "#99754d");
    }
    if (type === "goodsfactory") {
      const u = 0.6 + (Math.sin(t * Math.PI / 10) + 1) * 0.9, v = 3.35;
      face([[u, v, 1], [u + 0.4, v, 1], [u + 0.4, v, 7], [u, v, 7]], "#dcb450");
      face([[u + 0.05, v, 7], [u + 0.28, v, 7], [u + 0.28, v, 12], [u + 0.05, v, 12]], "#647b86");
      line([[u + 0.4, v, 1], [u + 0.4, v, 12]], "#4c5960", 1.5);
      for (const offset of [0.05, 0.32]) { const [x, y] = project(u + offset, v, 1); ctx.fillStyle = "#343e44"; ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill(); }
    }
  }
  window.__industryModels = { draw, paint };
})();
