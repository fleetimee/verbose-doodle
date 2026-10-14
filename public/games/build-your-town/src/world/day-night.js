(() => {
  const text = (en, fr) => document.documentElement.lang === "fr" ? fr : en;
  const leisure = new Set(["park", "bigpark", "stadium", "shoppingmall", "beachcarnival", "grandmuseum"]);
  const masks = new WeakMap();
  const layers = new WeakMap();
  let daylight = false;
  let clock, phase, toggle;
  try { daylight = localStorage.getItem("citybuilder.daylightView") === "true"; } catch {}
  const smooth = value => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
  const hour = city => Number.isFinite(city.dayTime) ? city.dayTime : 8;
  const darkness = city => {
    const time = hour(city);
    return time < 6 ? 1 : time < 8 ? 1 - smooth((time - 6) / 2) : time < 18 ? 0 : time < 20 ? smooth((time - 18) / 2) : 1;
  };
  function sync(city) {
    if (!clock) return;
    const time = hour(city), minutes = Math.floor(time * 60);
    clock.textContent = `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
    phase.textContent = time < 6 || time >= 20 ? text("Night", "Nuit") : time < 8 ? text("Dawn", "Aube") : time < 18 ? text("Day", "Jour") : text("Dusk", "Crépuscule");
    toggle.textContent = daylight ? text("Daylight view", "Vue de jour") : text("Cycle view", "Vue cyclique");
    toggle.setAttribute("aria-pressed", String(daylight));
    toggle.title = text("Keep the map bright while the city clock continues", "Gardez la carte éclairée sans arrêter l’horloge");
  }
  function update(renderer, city) {
    sync(city);
    const date = window.__townCalendar.formatDate(city);
    for (const id of ["date", "date-mobile"]) {
      const element = document.getElementById(id);
      if (element && element.textContent !== date) element.textContent = date;
    }
    if (clock) clock.dateTime = `${String(city.year).padStart(4, "0")}-${String(city.month + 1).padStart(2, "0")}-${String(city.calendar.day).padStart(2, "0")}T${clock.textContent}`;
  }
  function windowMask(image) {
    if (masks.has(image)) return masks.get(image);
    const canvas = document.createElement("canvas");
    canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(image, 0, 0);
    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < pixels.data.length; i += 4) {
      const [r, g, b] = pixels.data.subarray(i, i + 3);
      const warm = r === 216 && g === 204 && b === 137 || r === 168 && g === 159 && b === 106;
      const cool = r === 217 && g === 230 && b === 242 || r === 34 && g === 59 && b === 95 || r === 26 && g === 46 && b === 74;
      if (!warm && !cool) { pixels.data[i + 3] = 0; continue; }
      pixels.data[i] = 255; pixels.data[i + 1] = 218; pixels.data[i + 2] = 132;
    }
    ctx.putImageData(pixels, 0, 0);
    masks.set(image, canvas);
    return canvas;
  }
  function draw(renderer, city, buildings, roofs, originX, originY, tileX, tileY, elevation, scale) {
    if (daylight || renderer.flat || renderer.dataMap !== "none") return;
    const night = darkness(city), time = hour(city);
    const twilight = time >= 6 && time < 8 || time >= 18 && time < 20 ? 4 * night * (1 - night) : 0;
    if (!night && !twilight) return;
    const ctx = renderer.ctx, width = renderer.canvas.width, height = renderer.canvas.height;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = `rgba(12,25,56,${night * 0.48})`; ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = `rgba(220,109,56,${twilight * 0.13})`; ctx.fillRect(0, 0, width, height);
    let layer = layers.get(renderer);
    if (!layer) { layer = document.createElement("canvas"); layers.set(renderer, layer); }
    if (layer.width !== width || layer.height !== height) { layer.width = width; layer.height = height; }
    const light = layer.getContext("2d"); light.clearRect(0, 0, width, height);
    for (const entry of buildings) {
      light.globalCompositeOperation = "destination-out";
      light.drawImage(entry.image, entry.x, entry.y);
      const index = entry.tile;
      if (!city.powered[index] || city.fire[index] || city.flood[index]) continue;
      const seed = (index * 37 + city.seed) >>> 0;
      const amount = smooth((night - (seed % 30) / 100) / 0.5);
      const zone = city.overlay[index];
      light.globalCompositeOperation = "source-over";
      light.globalAlpha = amount * (zone === 5 ? 0.35 : zone === 4 && time < 6 ? 0.45 : 0.85);
      light.drawImage(windowMask(entry.image), entry.x, entry.y);
      light.globalAlpha = 1;
    }
    light.globalCompositeOperation = "destination-out";
    for (const roof of roofs) light.drawImage(roof.image, roof.x, roof.y);
    light.globalCompositeOperation = "source-over";
    ctx.drawImage(layer, 0, 0);
    if (night > 0.1) {
      for (let index = 0; index < city.count; index++) {
        if (city.overlay[index] !== 2 || index % 7 || city.roadDist[index] === 255 || city.fire[index] || city.flood[index]) continue;
        const x = index % city.size, y = Math.floor(index / city.size);
        if (![[-1, 0], [1, 0], [0, -1], [0, 1]].some(([dx, dy]) => city.inBounds(x + dx, y + dy) && city.powered[city.idx(x + dx, y + dy)])) continue;
        const px = originX + (x - y) * tileX, py = originY + (x + y) * tileY - city.base(x, y) * elevation;
        if (px < 0 || px > width || py < 0 || py > height) continue;
        ctx.globalAlpha = night * 0.25; ctx.fillStyle = "#ffd991";
        ctx.beginPath(); ctx.ellipse(px, py + tileY * 0.8, 9 * scale, 4 * scale, 0, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = night; ctx.strokeStyle = "#758198"; ctx.lineWidth = scale;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - 10 * scale); ctx.stroke();
        ctx.fillStyle = "#ffe9b5"; ctx.fillRect(px - scale, py - 11 * scale, 3 * scale, 2 * scale);
      }
    }
    ctx.restore();
  }
  function activity(city, zone, type) {
    const night = darkness(city);
    return leisure.has(type) ? 1 + night * 0.35 : zone === 3 ? 1 - night * 0.45 : 1 - night * 0.75;
  }
  document.addEventListener("DOMContentLoaded", () => {
    const group = document.createElement("div"); group.id = "town-time";
    clock = document.createElement("time"); phase = document.createElement("span");
    const reading = document.createElement("span"); reading.className = "town-time-reading"; reading.append(clock, phase);
    toggle = document.createElement("button"); toggle.type = "button";
    toggle.addEventListener("click", () => {
      daylight = !daylight;
      try { localStorage.setItem("citybuilder.daylightView", String(daylight)); } catch {}
      sync(window.__city || { dayTime: 8 }); window.__townView?.redraw();
    });
    group.append(reading, toggle); document.getElementById("speed").before(group);
    sync({ dayTime: 8 });
    new MutationObserver(() => sync(window.__city || { dayTime: 8 })).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  });
  window.__dayNight = { update, draw, activity, darkness, traffic: city => 1 - darkness(city) * 0.6 };
})();
