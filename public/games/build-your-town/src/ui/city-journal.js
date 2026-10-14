(() => {
  const ranges = ["7d", "30d", "1y", "10y"];
  const storageKey = "citybuilder.journalRange";
  const dayMilliseconds = 86400000;
  let range = "7d";
  let activeCity, language = "en";
  try {
    const saved = localStorage.getItem(storageKey);
    if (ranges.includes(saved)) range = saved;
  } catch {}
  function dayNumber(year, month, day) {
    const date = new Date(0);
    date.setUTCFullYear(year, month, day);
    return Math.floor(date.getTime() / dayMilliseconds);
  }
  function today(city) {
    return dayNumber(city.year, city.month, window.__townCalendar.initialize(city).day);
  }
  function capture(city) {
    const history = city.journalDaily ??= [];
    const point = [today(city), city.stats.pop, city.money];
    const last = history.at(-1);
    if (last?.[0] === point[0]) {
      last[1] = point[1]; last[2] = point[2];
    } else {
      history.push(point);
      if (history.length > 366) history.splice(0, history.length - 366);
    }
  }
  function series(city, selected = range) {
    const end = today(city);
    const day = window.__townCalendar.initialize(city).day;
    const start = selected === "1y" ? dayNumber(city.year - 1, city.month, day)
      : selected === "10y" ? dayNumber(city.year - 10, city.month, day)
      : end - (selected === "30d" ? 29 : 6);
    const points = new Map();
    // Existing saves keep their monthly history. Long views combine it with
    // recent daily samples; short views never invent missing daily records.
    if (selected === "1y" || selected === "10y") {
      const population = city.history.pop, money = city.history.money;
      const length = Math.min(population.length, money.length);
      for (let index = 0; index < length; index++) {
        const time = dayNumber(city.year, city.month - length + index + 1, 0);
        if (time >= start && time <= end) points.set(time, [time, population[index], money[index]]);
      }
    }
    for (const point of city.journalDaily ?? []) if (point[0] >= start && point[0] <= end) points.set(point[0], point);
    return [...points.values()].sort((a, b) => a[0] - b[0]);
  }
  function chart(canvas, points, column, color, label) {
    const width = canvas.clientWidth || 316, height = 120;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.round(width * ratio)) canvas.width = Math.round(width * ratio);
    if (canvas.height !== Math.round(height * ratio)) canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const values = points.map(point => point[column]);
    const low = Math.min(0, ...values), high = Math.max(low + 1, ...values);
    const first = points[0][0], last = points.at(-1)[0];
    const x = time => points.length === 1 ? width - 12 : 12 + (time - first) / Math.max(1, last - first) * (width - 24);
    const y = value => height - 27 - (value - low) / (high - low) * (height - 50);
    const number = new Intl.NumberFormat(language === "fr" ? "fr" : "en");
    const date = time => new Intl.DateTimeFormat(language === "fr" ? "fr" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(time * dayMilliseconds));
    ctx.strokeStyle = "#354258";
    ctx.lineWidth = 1;
    for (const fraction of [0, 0.5, 1]) {
      const line = y(low + (high - low) * fraction);
      ctx.beginPath(); ctx.moveTo(10, line); ctx.lineTo(width - 10, line); ctx.stroke();
    }
    if (low < 0) {
      ctx.strokeStyle = "#899bb6";
      ctx.beginPath(); ctx.moveTo(10, y(0)); ctx.lineTo(width - 10, y(0)); ctx.stroke();
    }
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = "round";
    ctx.beginPath();
    points.forEach((point, index) => index === 0 ? ctx.moveTo(x(point[0]), y(point[column])) : ctx.lineTo(x(point[0]), y(point[column])));
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.beginPath(); ctx.arc(x(last), y(values.at(-1)), 3, 0, Math.PI * 2); ctx.fill();
    ctx.font = "11px system-ui, sans-serif"; ctx.fillStyle = "#bec6d5"; ctx.textAlign = "left";
    ctx.fillText(number.format(high), 10, 12);
    ctx.fillText(date(first), 10, height - 7);
    ctx.textAlign = "right";
    ctx.fillText(number.format(values.at(-1)), width - 10, 12);
    if (points.length > 1) ctx.fillText(date(last), width - 10, height - 7);
    canvas.setAttribute("aria-label", `${label}: ${number.format(values.at(-1))}. ${date(first)} – ${date(last)}.`);
  }
  function draw(city, lang = language) {
    activeCity = city; language = lang;
    capture(city);
    const fr = language === "fr", copy = (en, french) => fr ? french : en;
    const labels = { "7d": copy("Last 7 days", "7 derniers jours"), "30d": copy("Last 30 days", "30 derniers jours"), "1y": copy("Last year", "Dernière année"), "10y": copy("Last 10 years", "10 dernières années") };
    const select = document.getElementById("journal-range");
    select.value = range;
    document.getElementById("journal-range-label").textContent = copy("Time range", "Période");
    for (const option of select.options) option.textContent = labels[option.value];
    const population = copy("Population", "Population"), funds = copy("Funds", "Fonds");
    document.getElementById("journal-pop-title").textContent = `${population} · ${labels[range]}`;
    document.getElementById("journal-money-title").textContent = `${funds} · ${labels[range]}`;
    const points = series(city);
    chart(document.getElementById("chart-pop"), points, 1, "#7ed957", population);
    chart(document.getElementById("chart-money"), points, 2, "#f6b73c", funds);
    const count = points.length;
    document.getElementById("journal-history-note").textContent = count === 1
      ? copy("Recording daily history. The chart starts with your current city values.", "Historique quotidien en cours. Le graphique commence avec les valeurs actuelles de votre ville.")
      : copy(`${count} recorded snapshots shown. Daily history is kept for a year; longer views include monthly history.`,
        `${count} relevés affichés. L’historique quotidien est conservé un an ; les périodes plus longues incluent les relevés mensuels.`);
  }
  function install(City) {
    const save = City.prototype.toJSON, load = City.fromJSON;
    City.prototype.toJSON = function () { return { ...save.call(this), journalDaily: (this.journalDaily ?? []).map(point => point.slice()) }; };
    City.fromJSON = function (data) {
      const city = load.call(this, data);
      const points = new Map(), end = today(city);
      for (const point of Array.isArray(data.journalDaily) ? data.journalDaily.slice(-366) : []) {
        if (Array.isArray(point) && point.length === 3 && Number.isInteger(point[0]) &&
            point[0] <= end && point[0] >= end - 365 && Number.isFinite(point[1]) && point[1] >= 0 && Number.isFinite(point[2])) points.set(point[0], point.slice());
      }
      city.journalDaily = [...points.values()].sort((a, b) => a[0] - b[0]);
      return city;
    };
    const select = document.getElementById("journal-range");
    select.addEventListener("keydown", event => { if (event.key !== "Escape") event.stopPropagation(); });
    select.addEventListener("change", () => {
      if (!ranges.includes(select.value)) return;
      range = select.value;
      try { localStorage.setItem(storageKey, range); } catch {}
      if (activeCity) draw(activeCity);
    });
    window.addEventListener("resize", () => {
      if (activeCity && !document.getElementById("panel-journal").hidden) draw(activeCity);
    });
  }
  window.__townJournal = { capture, series, draw, install };
})();
