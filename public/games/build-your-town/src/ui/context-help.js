(() => {
  const topics = window.__townHelpTopics;
  const text = (pair) => pair[document.documentElement.lang === "fr" ? 1 : 0];
  const rules = [
    ["#panel-budget > .head > span", "budget"], ["#panel-journal > .head > span", "journal"],
    ["#panel-cities > .head > span", "cities"], ["#panel-building-finances .head h2", "finance"],
    ["#panel-industry .head h2", "industry"], ["#panel-missions .head", "missions"],
    ["#modal-scenarios .head h2, #modal-scenarios h2", "missions"], ["#query-title", "query"],
    ["#view-settings h2, #home-settings-title", "settings"], ["#cheats-title", "cheats"],
    ["#panel-cheats label:has(#cheat-season), #panel-cheats label:has(#cheat-weather)", "weather"], ["#welcome h2", "newCity"],
    ["#journal-range-label, #journal-pop-title, #journal-money-title", "journal"],
    ["#query .query-location, #query .query-description", "query"],
    ["#query .query-range-note", "coverage"],
    ["#query .industry-query > h3", "industry"],
    ["#query .industry-query > p", "industry"],
    ["#flyout > .head", "tools"], ["#maps-menu [data-map]", "maps"],
    ["#demand-pop", "demand"], ["#welcome label", "newCity"], [".query-growth-heading", "growth"],
    ["#topbar .stat.money", "funds"], ["#topbar .stat.pop", "population"],
    ["#topbar .stat.rci", "demand"], ["#topbar .stat.power", "electricity"],
    ["#topbar .stat.water", "cov-water"], ["#minimap .head > span:first-child", "maps"], ["#topbar .stat.date", "clock"],
    ["label[for='game-ui-scale'], label[for='home-ui-scale']", "scale"],
    ["label[for='graphics-quality']", "graphics"], ["label[for='graphics-resolution']", "resolution"],
    ["label[for='graphics-fps']", "fps"], ["label[for='graphics-effects']", "effects"],
    [".view-rotation-toggle:has(#enable-map-rotation), label[for='home-map-rotation']", "rotation"],
    [".view-rotation-toggle:has(#enable-manual-disasters), label[for='home-manual-disasters']", "disasters"],
    [".view-rotation-toggle:has(#enable-random-encounters), label[for='encounter-frequency'], label[for='home-encounters'], label[for='home-encounter-frequency']", "encounters"],
    ["label[for='home-sound']", "sound"], ["label[for='home-language']", "language"],
    ["label[for='home-background-motion']", "background"],
    [".industry-ledger dt", "exports"], [".industry-controls", "deposits"],
    [".finance-controls label", "finance"], [".query-facts dt", "query"],
    ["#panel-building-finances th:nth-child(2)", "buildingIncome"], ["#panel-building-finances th:nth-child(3)", "savings"],
    ["#panel-building-finances th:nth-child(4)", "upkeep"], ["#panel-building-finances th:nth-child(5)", "finance"],
    ["#budget-body .row:has(#industry-trade) > span:first-child", "industry-trade"], ["#budget-body .row:has(#industry-upkeep) > span:first-child", "industry-upkeep"],
  ];
  const selector = "[data-town-help]," + rules.map(([match]) => match).join(",");
  let popup, heading, body, closeButton, trigger;
  function close(focus = false) {
    const previous = trigger;
    trigger = null;
    previous?.setAttribute("aria-expanded", "false");
    if (popup?.matches(":popover-open")) popup.hidePopover();
    if (popup) popup.hidden = true;
    if (focus && previous?.isConnected && !previous.closest("[hidden]")) previous.focus({ preventScroll: true });
  }
  function position() {
    if (!trigger) return;
    const anchor = trigger.getBoundingClientRect(), rect = popup.getBoundingClientRect();
    const scale = Number(getComputedStyle(popup).zoom) || 1;
    const left = Math.max(8, Math.min(anchor.left, innerWidth - rect.width - 8));
    let top = anchor.bottom + 8;
    if (top + rect.height > innerHeight - 8) top = anchor.top - rect.height - 8;
    popup.style.left = `${left / scale}px`;
    popup.style.top = `${Math.max(8, Math.min(top, innerHeight - rect.height - 8)) / scale}px`;
  }
  function open(button) {
    if (trigger === button) { close(true); return; }
    trigger?.setAttribute("aria-expanded", "false");
    trigger = button;
    const itemTool = button.dataset.helpTopic.startsWith("item:") ? button.dataset.helpTopic.slice(5) : null;
    popup.classList.toggle("item-help-expanded", !!itemTool);
    body.replaceChildren();
    if (itemTool) renderItem(itemTool);
    else {
      const topic = topics[button.dataset.helpTopic];
      heading.textContent = text(topic.title);
      const paragraph = document.createElement("p"); paragraph.textContent = text(topic.body); body.append(paragraph);
    }
    popup.scrollTop = 0;
    closeButton.setAttribute("aria-label", document.documentElement.lang === "fr" ? "Fermer l’explication" : "Close explanation");
    button.setAttribute("aria-expanded", "true");
    popup.hidden = false;
    if (!popup.matches(":popover-open")) popup.showPopover();
    position(); closeButton.focus({ preventScroll: true });
  }
  function renderItem(tool) {
    const item = window.__townItemHelp.get(tool);
    const copy = (en, fr) => document.documentElement.lang === "fr" ? fr : en;
    const element = (tag, text, className) => {
      const node = document.createElement(tag);
      if (text) node.textContent = text;
      if (className) node.className = className;
      return node;
    };
    heading.textContent = item.title;
    const preview = window.__townItemHelp.preview(tool);
    if (preview) {
      const figure = element("figure", undefined, "item-help-preview");
      preview.setAttribute("role", "img"); preview.setAttribute("aria-label", item.title);
      figure.append(preview); body.append(figure);
    }
    if (item.description) body.append(element("p", item.description));
    body.append(element("p", item.guide));
    const figures = element("dl", undefined, "item-help-facts");
    for (const [label, value] of item.facts) figures.append(element("dt", label), element("dd", value));
    body.append(figures);
    if (item.requirements.length) {
      body.append(element("h3", copy("Placement & operation", "Placement et activité")));
      const list = element("ul"); for (const requirement of item.requirements) list.append(element("li", requirement)); body.append(list);
    }
    body.append(element("h3", copy("Planning tips", "Conseils")), element("p", item.tips));
    if (item.companions.length) {
      body.append(element("h3", copy("Works well with", "À combiner avec")));
      for (const companion of item.companions) {
        const row = element("section", undefined, "item-help-companion");
        const image = window.__townItemHelp.preview(companion.tool, 68);
        if (image) { image.setAttribute("aria-hidden", "true"); row.append(image); }
        const description = element("div"); description.append(element("strong", companion.name), element("p", companion.reason));
        if (companion.locked) description.append(element("span", copy("Unlocks later", "À débloquer"), "item-help-lock"));
        row.append(description); body.append(row);
      }
    }
  }
  function enhance(root) {
    if (root.closest?.("#town-context-help, .context-help-button")) return;
    const elements = root.matches?.(selector) ? [root] : [];
    elements.push(...root.querySelectorAll(selector));
    for (const target of elements) {
      if (target.closest("#town-context-help") || target.matches(".context-help-button") || target.querySelector(":scope > .context-help-button, :scope > span > .context-help-button")) continue;
      if (target.matches("button") && target.parentElement.classList.contains("context-help-action")) continue;
      const mapTopics = { none: "maps", pollution: "pollution", crime: "crime", landValue: "lv", traffic: "traffic",
        power: "electricity", water: "cov-water", police: "cov-police", fire: "cov-fire", education: "cov-education", health: "cov-health" };
      const id = target.dataset.townHelp || mapTopics[target.dataset.map] || rules.find(([match]) => target.matches(match))?.[1];
      if (!topics[id]) continue;
      const button = document.createElement("button");
      button.type = "button"; button.className = "context-help-button";
      button.dataset.helpTopic = id;
      button.setAttribute("aria-controls", "town-context-help"); button.setAttribute("aria-expanded", "false");
      button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.8-2.5 2-2.5 4m0 3h.01"/></svg>';
      button.setAttribute("aria-label", `${document.documentElement.lang === "fr" ? "À propos : " : "About: "}${text(topics[id].title)}`);
      button.addEventListener("pointerdown", event => event.stopPropagation());
      button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); open(button); });
      if (target.matches("button")) {
        const row = document.createElement("div"); row.className = target.classList.contains("tool") ? "context-help-action context-help-tool" : "context-help-action";
        target.before(row); row.append(target, button);
      } else if (target.matches("#welcome label.field")) {
        target.querySelector(".lbl").append(button);
      } else if (target.matches("#home-settings .home-setting-row label")) {
        target.querySelector(":scope > span").append(button);
      } else target.append(button);
    }
  }
  document.addEventListener("DOMContentLoaded", () => {
    popup = document.createElement("section"); popup.id = "town-context-help";
    popup.setAttribute("popover", "auto"); popup.hidden = true;
    popup.setAttribute("role", "dialog"); popup.setAttribute("aria-labelledby", "town-context-help-title");
    popup.setAttribute("aria-describedby", "town-context-help-body");
    const header = document.createElement("div");
    heading = document.createElement("h2"); heading.id = "town-context-help-title";
    closeButton = document.createElement("button"); closeButton.type = "button";
    closeButton.textContent = "×"; closeButton.addEventListener("click", () => close(true));
    body = document.createElement("article"); body.id = "town-context-help-body";
    header.append(heading, closeButton); popup.append(header, body); document.body.append(popup);
    popup.addEventListener("pointerdown", event => event.stopPropagation());
    document.addEventListener("focusin", event => {
      if (trigger && !popup.contains(event.target) && event.target !== trigger) close();
    });
    popup.addEventListener("keydown", event => event.stopPropagation());
    popup.addEventListener("toggle", () => {
      if (!popup.matches(":popover-open") && trigger) close();
    });
    document.addEventListener("keydown", event => {
      if (!trigger) return;
      if (event.key === "Escape") { event.preventDefault(); event.stopImmediatePropagation(); close(true); }
      else if (!popup.contains(event.target) && !trigger.contains(event.target)) close();
    }, true);
    document.addEventListener("pointerdown", event => {
      if (!trigger || popup.contains(event.target) || event.target.closest(".context-help-button")) return;
      event.preventDefault(); event.stopPropagation(); close();
    }, true);
    document.addEventListener("scroll", event => { if (trigger && !popup.contains(event.target)) close(); }, true);
    window.addEventListener("resize", () => close());
    window.visualViewport?.addEventListener("resize", () => close());
    enhance(document.body);
    // Inspect added subtrees only; simulation text updates never trigger a full-document scan.
    new MutationObserver(records => {
      if (trigger && (!trigger.isConnected || trigger.closest("[hidden]"))) close();
      const roots = new Set();
      for (const record of records) {
        if (record.removedNodes.length && record.target.matches?.(selector)) roots.add(record.target);
        for (const node of record.addedNodes) if (node.nodeType === 1 && !node.matches(".context-help-button, #town-context-help") && !node.closest("#town-context-help")) roots.add(node);
      }
      for (const root of roots) if (root.isConnected && ![...roots].some(parent => parent !== root && parent.contains(root))) enhance(root);
    }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden"] });
    new MutationObserver(() => {
      close();
      for (const button of document.querySelectorAll(".context-help-button")) {
        button.setAttribute("aria-label", `${document.documentElement.lang === "fr" ? "À propos : " : "About: "}${text(topics[button.dataset.helpTopic].title)}`);
      }
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  });
})();
