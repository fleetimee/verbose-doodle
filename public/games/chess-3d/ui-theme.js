(() => {
  const root = document.documentElement;
  const embedded = parent !== window && parent.location.origin === location.origin;
  const source = embedded ? parent.document.documentElement : root;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const rgb = value => {
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = value;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  };
  const colors = {
    "--cp-bg": "--background",
    "--cp-bg-elevated": "--card",
    "--cp-surface": "--card",
    "--cp-surface-soft": "--secondary",
    "--cp-border": "--border",
    "--cp-border-strong": "--muted-foreground",
    "--cp-text": "--foreground",
    "--cp-text-muted": "--muted-foreground",
    "--cp-text-soft": "--muted-foreground",
    "--cp-accent": "--primary",
    "--cp-accent-fg": "--primary-foreground",
    "--cp-danger": "--destructive",
    "--cp-warning": "--warning",
  };
  const sync = () => {
    const style = getComputedStyle(source);
    const dark = embedded ? source.classList.contains("dark") : root.dataset.theme === "dark";
    if (embedded) root.dataset.theme = dark ? "dark" : "light";
    for (const [target, token] of Object.entries(colors)) root.style.setProperty(target, rgb(style.getPropertyValue(token).trim()));
    root.style.setProperty("--radius", style.getPropertyValue("--radius").trim());
    root.style.setProperty("--mono", style.getPropertyValue("--font-mono").trim() || '"Geist Mono", monospace');
    root.style.setProperty("--chess-piece-white", rgb("oklch(0.95 0.006 185)"));
    root.style.setProperty("--chess-piece-black", rgb(dark ? "oklch(0.37 0.012 230)" : "oklch(0.29 0.012 230)"));
    root.style.setProperty("--chess-board-light", rgb(dark ? "oklch(0.68 0.018 195)" : "oklch(0.87 0.014 185)"));
    root.style.setProperty("--chess-board-dark", rgb(dark ? "oklch(0.38 0.025 215)" : "oklch(0.61 0.035 190)"));
    root.style.setProperty("--cp-accent-soft", `color-mix(in srgb, ${rgb(style.getPropertyValue("--primary"))} 12%, transparent)`);
    root.style.setProperty("--cp-accent-hover", `color-mix(in srgb, ${rgb(style.getPropertyValue("--primary"))} 88%, ${rgb(style.getPropertyValue("--foreground"))})`);
    root.style.setProperty("--cp-overlay", `color-mix(in srgb, ${rgb(style.getPropertyValue("--background"))} 88%, transparent)`);
    window.dispatchEvent(new Event("chess:theme"));
  };
  if (embedded) {
    root.classList.add("frontend-theme");
    for (const face of parent.document.fonts) {
      if (/Mona Sans|Geist Mono/.test(face.family)) document.fonts.add(face);
    }
  }
  sync();
  const observer = new MutationObserver(sync);
  observer.observe(source, { attributes: true, attributeFilter: embedded ? ["class", "style"] : ["data-theme"] });
})();
