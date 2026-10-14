(() => {
  const tips = [
    ["Start small. Leave room for your town to grow.", "Commencez petit. Gardez de la place pour agrandir votre ville."],
    ["Connect your neighborhoods with roads before expanding them.", "Reliez vos quartiers par des routes avant de les agrandir."],
    ["Check power and water coverage when a neighborhood stops growing.", "Vérifiez la couverture en électricité et en eau quand un quartier ne grandit plus."],
    ["Watch your monthly budget. New services also bring running costs.", "Surveillez votre budget mensuel. Les nouveaux services ont aussi des frais de fonctionnement."],
    ["Keep polluting industry away from residential neighborhoods.", "Éloignez les industries polluantes des quartiers résidentiels."],
    ["Use the demand bars to decide which zones to build next.", "Utilisez les barres de demande pour choisir les prochaines zones à construire."],
    ["Pause the simulation when you need time to plan your next expansion.", "Mettez la simulation en pause pour planifier votre prochaine extension."],
    ["Export a backup of your favorite city from the Cities panel.", "Exportez une sauvegarde de votre ville préférée depuis le panneau Villes."],
  ];
  let timer, pending = false, previousFocus;
  let tip = Math.floor(Math.random() * tips.length);
  const text = (en, fr) => document.documentElement.lang === "fr" ? fr : en;
  function updateTip() {
    document.getElementById("town-loading-tip").textContent = text(...tips[tip]);
    tip = (tip + 1) % tips.length;
  }
  function show() {
    const screen = document.getElementById("town-loading");
    previousFocus = document.activeElement;
    screen.hidden = false;
    screen.setAttribute("aria-label", text("Loading Build Your Town", "Chargement de Build Your Town"));
    document.getElementById("town-loading-status").textContent = text("Preparing your town…", "Préparation de votre ville…");
    document.getElementById("town-loading-tip-title").textContent = text("Mayor's tip", "Conseil au maire");
    document.body.classList.add("town-is-loading");
    updateTip();
    clearInterval(timer);
    timer = setInterval(updateTip, 5000);
  }
  function finish() {
    clearInterval(timer);
    document.getElementById("town-loading").hidden = true;
    document.body.classList.remove("town-is-loading");
    pending = false;
    if (previousFocus?.isConnected) previousFocus.focus();
  }
  function run(action) {
    if (pending) return;
    pending = true;
    show();
    // Paint the loading screen before synchronous map generation starts.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      try { action(); }
      finally { requestAnimationFrame(() => requestAnimationFrame(finish)); }
    }));
  }
  window.__townLoading = { run, finish };
  document.addEventListener("DOMContentLoaded", () => {
    show();
    if (new URLSearchParams(location.search).has("demo")) finish();
  }, { once: true });
  let launchingScenario = false;
  document.addEventListener("click", event => {
    const button = event.target.closest?.(".sc-launch-btn:not(:disabled)");
    if (!button || launchingScenario) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    run(() => {
      launchingScenario = true;
      try { button.click(); }
      finally { launchingScenario = false; }
    });
  }, true);
  document.addEventListener("keydown", event => {
    if (!document.body.classList.contains("town-is-loading")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  }, true);
})();
