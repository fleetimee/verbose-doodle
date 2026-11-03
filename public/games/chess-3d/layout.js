(() => {
  const sidebar = document.querySelector("aside");
  const main = document.querySelector("main");
  sidebar.id = "chess-sidebar";
  let collapsed = false;
  let copy = { hideSidebar: "Hide sidebar", showSidebar: "Show sidebar" };
  try { collapsed = localStorage.getItem("atelier-chess-sidebar") === "hidden"; } catch {}
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "sidebar-toggle";
  toggle.setAttribute("aria-controls", sidebar.id);
  const updateToggle = () => {
    toggle.setAttribute("aria-expanded", String(!collapsed));
    toggle.setAttribute("aria-label", collapsed ? copy.showSidebar : copy.hideSidebar);
    toggle.title = toggle.getAttribute("aria-label");
    toggle.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16m${collapsed ? '5-11-3 3 3 3' : '-3-11 3 3-3 3'}"/></svg>`;
  };
  const stage = document.getElementById("stage");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let sidebarAnimation = null;
  let boardAnimation = null;
  let toggleAnimation = null;
  const clearOverlay = () => {
    sidebar.style.position = "";
    sidebar.style.inset = "";
    sidebar.style.width = "";
    sidebar.style.zIndex = "";
  };
  const settle = () => {
    sidebarAnimation?.cancel();
    boardAnimation?.cancel();
    toggleAnimation?.cancel();
    sidebarAnimation = null;
    boardAnimation = null;
    toggleAnimation = null;
    clearOverlay();
    sidebar.hidden = collapsed;
  };
  toggle.addEventListener("click", () => {
    const boardBefore = stage.getBoundingClientRect();
    const toggleBefore = toggle.getBoundingClientRect();
    const wasVisible = !sidebar.hidden;
    const sidebarWidth = sidebar.getBoundingClientRect().width;
    const visual = getComputedStyle(sidebar);
    const fromTransform = wasVisible ? visual.transform : "translateX(100%)";
    const fromOpacity = wasVisible ? visual.opacity : "0";
    collapsed = !collapsed;
    settle();
    main.dataset.sidebarHidden = String(collapsed);
    sidebar.hidden = false;
    sidebar.inert = collapsed;
    updateToggle();
    if (collapsed) {
      sidebar.style.position = "absolute";
      sidebar.style.inset = "0 0 0 auto";
      sidebar.style.width = `${sidebarWidth}px`;
      sidebar.style.zIndex = "6";
    }
    const options = { duration: reduced.matches ? 125 : 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" };
    sidebarAnimation = sidebar.animate(reduced.matches ? [
      { opacity: fromOpacity }, { opacity: collapsed ? 0 : 1 },
    ] : [
      { transform: fromTransform, opacity: fromOpacity },
      { transform: collapsed ? "translateX(100%)" : "translateX(0)", opacity: collapsed ? 0 : 1 },
    ], { ...options, fill: "forwards" });
    sidebarAnimation.onfinish = settle;
    if (!reduced.matches) {
      const boardAfter = stage.getBoundingClientRect();
      const dx = boardBefore.x + boardBefore.width / 2 - boardAfter.x - boardAfter.width / 2;
      boardAnimation = stage.animate([
        { transform: `translateX(${dx}px)` }, { transform: "translateX(0)" },
      ], { duration: 200, easing: "cubic-bezier(0.77, 0, 0.175, 1)" });
      const toggleAfter = toggle.getBoundingClientRect();
      toggleAnimation = toggle.animate([
        { transform: `translateX(${toggleBefore.x - toggleAfter.x}px)` }, { transform: "translateX(0)" },
      ], options);
    }
    try { localStorage.setItem("atelier-chess-sidebar", collapsed ? "hidden" : "visible"); } catch {}
  });
  reduced.addEventListener("change", settle);
  window.addEventListener("pagehide", settle);
  window.addEventListener("resize", settle);
  document.querySelector(".arena").appendChild(toggle);
  main.dataset.sidebarHidden = String(collapsed);
  sidebar.hidden = collapsed;
  sidebar.inert = collapsed;
  updateToggle();
  window.addEventListener("message", event => {
    if (event.source !== parent || event.origin !== location.origin || event.data?.type !== "chess:copy") return;
    copy = event.data.copy;
    updateToggle();
  });
  const appearance = document.getElementById("theme");
  document.querySelector(".view-controls").appendChild(appearance);
  const buttons = document.querySelectorAll("[data-panel-target]");
  for (const button of buttons) {
    button.addEventListener("click", () => {
      sidebar.dataset.panel = button.dataset.panelTarget;
      for (const item of buttons) {
        item.setAttribute("aria-pressed", String(item === button));
      }
    });
  }
})();
