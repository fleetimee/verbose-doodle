(() => {
  const key = "citybuilder.graphics";
  const mobile = matchMedia("(pointer: coarse) and (max-width: 1024px)").matches;
  const presets = {
    low: { resolution: 1, fps: 30, effects: 0 },
    medium: { resolution: mobile ? 1 : 1.5, fps: 30, effects: 1 },
    high: { resolution: 2, fps: 60, effects: 2 },
  };
  const tiers = ["low", "medium", "high"];
  const initialTier = () => (mobile || navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 ||
    navigator.deviceMemory && navigator.deviceMemory <= 4) ? "low" : "medium";
  let mode = "auto", tier = initialTier(), custom = { ...presets.medium };
  const clamp = (value, min, max, fallback) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
  const normalize = value => ({
    resolution: Math.round(clamp(value?.resolution, 0.75, 2, 1.5) * 4) / 4,
    fps: Math.round(clamp(value?.fps, 15, 60, 30) / 5) * 5,
    effects: Math.round(clamp(value?.effects, 0, 2, 1)),
  });
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && ["auto", "custom", ...tiers].includes(saved.mode)) mode = saved.mode;
    custom = normalize(saved?.custom);
  } catch {}
  let lastDraw = -Infinity, lastTick = 0, settleUntil = 0, windowStart = 0;
  let draws = 0, cost = 0, ticks = 0, late = 0, slowWindows = 0, fastWindows = 0;
  const config = () => mode === "custom" ? custom : presets[mode === "auto" ? tier : mode];
  const state = () => ({ mode, tier: mode === "auto" ? tier : mode, ...config() });
  function reset(now) {
    lastDraw = -Infinity; lastTick = 0; settleUntil = now + 3000;
    windowStart = 0; draws = cost = ticks = late = 0;
  }
  function changed() {
    reset(performance.now());
    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new CustomEvent("town-graphics-change", { detail: state() }));
    window.__townView?.redraw();
  }
  function setMode(value) {
    if (!["auto", "custom", ...tiers].includes(value)) return;
    if (value === "custom" && mode !== "custom") custom = { ...config() };
    mode = value;
    if (mode === "auto") tier = initialTier();
    slowWindows = fastWindows = 0;
    save(); changed();
  }
  function setCustom(patch) {
    custom = normalize({ ...config(), ...patch });
    mode = "custom";
    save(); changed();
  }
  function save() {
    try { localStorage.setItem(key, JSON.stringify({ mode, custom })); } catch {}
  }
  function tick(now, running) {
    if (mode !== "auto" || !running || document.hidden) {
      lastTick = 0; windowStart = 0; draws = cost = ticks = late = 0;
      slowWindows = fastWindows = 0;
      return;
    }
    const gap = lastTick ? now - lastTick : 0;
    lastTick = now;
    // Ignore startup, tab resumes, and long interruptions rather than rating them as slow frames.
    if (gap > 250) { reset(now); return; }
    if (now < settleUntil) return;
    if (!windowStart) windowStart = now;
    if (gap > 0) { ticks++; if (gap > 1000 / config().fps * 1.4) late++; }
    if (now - windowStart < 5000 || draws < 30) return;
    const average = cost / draws, index = tiers.indexOf(tier), budget = 1000 / config().fps;
    const slow = average > budget * 0.72 || ticks > 0 && late / ticks > 0.2;
    slowWindows = slow ? slowWindows + 1 : 0;
    const next = mobile && tier === "medium" ? null : presets[tiers[index + 1]];
    // Require spare capacity at the NEXT preset's resolution and frame rate before upgrading.
    const ratio = next ? Math.min(next.resolution, window.devicePixelRatio || 1) / Math.min(config().resolution, window.devicePixelRatio || 1) : 1;
    const fast = next && average * ratio * ratio < 1000 / next.fps * 0.5 && late / Math.max(1, ticks) < 0.03;
    fastWindows = fast && !slow ? fastWindows + 1 : 0;
    windowStart = now; draws = cost = ticks = late = 0;
    if (slowWindows >= 2 && index > 0 || fastWindows >= 3 && next) {
      tier = tiers[index + (slowWindows >= 2 ? -1 : 1)];
      slowWindows = fastWindows = 0;
      changed();
    }
  }
  window.__townGraphics = {
    state, setMode, setCustom, tick,
    pixelRatio: () => Math.min(config().resolution, window.devicePixelRatio || 1),
    effects: () => config().effects,
    beginFrame(now) {
      if (document.hidden || now - lastDraw < 1000 / config().fps - 0.5) return false;
      lastDraw = now;
      return true;
    },
    endFrame(milliseconds) {
      if (mode === "auto" && performance.now() >= settleUntil) { draws++; cost += milliseconds; }
    },
  };
  reset(performance.now());
})();
