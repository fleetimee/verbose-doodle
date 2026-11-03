(() => {
  window.createChessTitleCards = () => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const layer = document.createElement("div");
    layer.className = "chess-title-layer";
    layer.hidden = true;
    layer.setAttribute("role", "status");
    layer.setAttribute("aria-live", "polite");
    layer.setAttribute("aria-atomic", "true");
    const card = document.createElement("div");
    card.className = "chess-title-card";
    const title = document.createElement("strong");
    const detail = document.createElement("span");
    card.append(title, detail);
    layer.append(card);
    document.getElementById("stage").append(layer);
    const notice = document.createElement("div");
    notice.className = "chess-check-notice";
    notice.hidden = true;
    notice.setAttribute("role", "status");
    document.querySelector(".arena").insertBefore(notice, document.querySelector(".view-controls"));
    const noticeFull = document.createElement("span");
    const noticeCompact = document.createElement("span");
    noticeCompact.className = "check-notice-compact";
    noticeFull.className = "check-notice-full";
    notice.append(noticeFull, noticeCompact);
    let inCheck = false;
    let copy = {
      fightCard: "PLAY!", checkCard: "CHECK!", knockoutCard: "K.O.",
      gameOverCard: "GAME OVER", drawCard: "DRAW", yourTurnCard: "YOUR TURN", opponentTurnCard: "OPPONENT’S TURN",
      checkNoticeCompact: "In check: move, block, or capture.",
      checkNotice: "In check: move your king, block the attack, or capture the checking piece.",
      win: "You won.", loss: "You lost.", draw: "Draw.",
    };
    let previous = null;
    let active = null;
    let animation = null;
    let timer = 0;
    let keyboard = false;
    document.addEventListener("keydown", () => { keyboard = true; }, true);
    document.addEventListener("pointerdown", () => { keyboard = false; }, true);
    const renderText = () => {
      noticeFull.textContent = copy.checkNotice;
      noticeCompact.textContent = copy.checkNoticeCompact;
      notice.setAttribute("aria-label", copy.checkNotice);
      notice.title = copy.checkNotice;
      notice.hidden = !inCheck;
      if (!active) return;
      title.textContent = copy[active.title];
      detail.textContent = active.detail ? copy[active.detail] : "";
      detail.hidden = !active.detail;
    };
    const hide = () => {
      clearTimeout(timer);
      animation?.cancel();
      animation = null;
      layer.hidden = true;
      active = null;
    };
    const show = (kind, titleKey, detailKey, hold) => {
      hide();
      active = { title: titleKey, detail: detailKey };
      layer.dataset.kind = kind;
      renderText();
      layer.hidden = false;
      const gentle = reduced.matches || keyboard;
      animation = card.animate(gentle ? [
        { opacity: 0 }, { opacity: 1 },
      ] : [
        { opacity: 0, transform: "translateX(-12%) scale(0.95)" },
        { opacity: 1, transform: "translateX(0) scale(1)" },
      ], { duration: kind === "turn" ? 125 : 200, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
      timer = setTimeout(() => {
        animation = card.animate(gentle ? [
          { opacity: 1 }, { opacity: 0 },
        ] : [
          { opacity: 1, transform: "translateX(0) scale(1)" },
          { opacity: 0, transform: "translateX(-12%) scale(0.95)" },
        ], { duration: 150, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "forwards" });
        animation.onfinish = hide;
      }, hold);
    };
    window.addEventListener("message", event => {
      if (event.source !== parent || event.origin !== location.origin || event.data?.type !== "chess:copy") return;
      copy = event.data.copy;
      renderText();
    });
    reduced.addEventListener("change", hide);
    document.addEventListener("visibilitychange", () => { if (document.hidden) hide(); });
    window.addEventListener("pagehide", hide);

    return {
      reset() { hide(); previous = null; inCheck = false; notice.hidden = true; },
      update(state) {
        const old = previous;
        previous = state;
        inCheck = state.status === "playing" && state.check && state.yourTurn;
        renderText();
        if (document.hidden) return;
        const sameGame = old?.mode === state.mode && old?.room === state.room;
        const changed = !sameGame || old.moves !== state.moves || old.status !== state.status;
        if (!changed) return;
        const oneMove = sameGame && state.ply === old.ply + 1;
        const started = state.status === "playing" && (
          (!old && state.mode === "solo" && state.ply === 0) ||
          (sameGame && old.status === "waiting") ||
          (!old && state.mode === "online" && state.ply === 0)
        );
        if (state.status === "finished" && (oneMove || (sameGame && old.status === "playing"))) {
          show("finish", state.result === "draw" ? "drawCard" : state.knockout ? "knockoutCard" : "gameOverCard", state.result === "draw" ? null : state.result, 1800);
        } else if (state.status === "playing" && state.check && oneMove) {
          show("check", "checkCard", null, 1000);
        } else if (started) {
          show("start", "fightCard", state.yourTurn ? "yourTurnCard" : state.mode === "online" ? "opponentTurnCard" : null, 850);
        } else if (state.status === "playing" && (state.yourTurn || state.mode === "online") && oneMove) {
          show("turn", state.yourTurn ? "yourTurnCard" : "opponentTurnCard", null, 650);
        } else {
          hide();
        }
      },
    };
  };
})();
