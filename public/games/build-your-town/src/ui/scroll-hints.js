(() => {
  // Marks horizontally scrollable HUD rows: edge fades plus chevrons that brighten on hover and scroll on click.
  const selectors = ["#topbar-stats", "#toolbar"];
  const edge = 2;
  const width = 24;
  const chevron = (direction) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `scroll-hint-chevron scroll-hint-${direction}`;
    button.tabIndex = -1;
    button.hidden = true;
    button.setAttribute("aria-hidden", "true");
    button.textContent = direction === "start" ? "‹" : "›";
    document.body.append(button);
    return button;
  };
  const update = (element, start, end) => {
    const max = element.scrollWidth - element.clientWidth;
    const left = max > edge && element.scrollLeft > edge;
    const right = max > edge && element.scrollLeft < max - edge;
    element.dataset.scrollStart = left ? "more" : "";
    element.dataset.scrollEnd = right ? "more" : "";
    const rect = element.getBoundingClientRect();
    const shown = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight
      && rect.right > 0 && rect.left < window.innerWidth;
    for (const [button, visible, x] of [[start, left, rect.left], [end, right, rect.right - width]]) {
      button.hidden = !(shown && visible);
      if (button.hidden) continue;
      button.style.left = `${x}px`;
      button.style.top = `${rect.top}px`;
      button.style.height = `${rect.height}px`;
    }
  };
  const watch = (element) => {
    if (element.dataset.scrollHint) return;
    element.dataset.scrollHint = "1";
    const start = chevron("start");
    const end = chevron("end");
    const refresh = () => update(element, start, end);
    const scrollBy = (direction) => element.scrollBy({ left: direction * element.clientWidth * 0.7, behavior: "smooth" });
    start.addEventListener("click", () => scrollBy(-1));
    end.addEventListener("click", () => scrollBy(1));
    element.addEventListener("scroll", refresh, { passive: true });
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(refresh);
      observer.observe(element);
      for (const child of element.children) observer.observe(child);
      new MutationObserver(() => {
        for (const child of element.children) observer.observe(child);
        refresh();
      }).observe(element, { childList: true });
    }
    window.addEventListener("resize", refresh);
    refresh();
  };
  const init = () => {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) watch(element);
    }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
  window.addEventListener("load", init);
})();
