(() => {
  const text = (en, fr) => document.documentElement.lang === "fr" ? fr : en;
  function show(title, message, destructive = false, confirmLabel = null) {
    const previous = document.activeElement;
    const dialog = document.createElement("dialog");
    dialog.id = "town-confirmation";
    dialog.setAttribute("aria-labelledby", "town-confirmation-title");
    dialog.setAttribute("aria-describedby", "town-confirmation-message");
    const heading = document.createElement("h2");
    heading.id = "town-confirmation-title";
    heading.textContent = title;
    const body = document.createElement("p");
    body.id = "town-confirmation-message";
    body.textContent = message;
    const form = document.createElement("form");
    form.method = "dialog";
    const cancel = document.createElement("button");
    cancel.type = "submit";
    cancel.value = "cancel";
    cancel.textContent = destructive ? text("Cancel", "Annuler") : text("Close", "Fermer");
    form.append(cancel);
    if (destructive) {
      const confirm = document.createElement("button");
      confirm.type = "submit";
      confirm.value = "confirm";
      confirm.className = confirmLabel ? "primary" : "dialog-destructive";
      confirm.textContent = confirmLabel || text("Delete city", "Supprimer la ville");
      form.append(confirm);
    }
    dialog.append(heading, body, form);
    dialog.addEventListener("keydown", event => event.stopPropagation());
    document.body.append(dialog);
    return new Promise(resolve => {
      dialog.addEventListener("close", () => {
        const confirmed = dialog.returnValue === "confirm";
        dialog.remove();
        if (previous?.isConnected) previous.focus();
        resolve(confirmed);
      }, { once: true });
      dialog.showModal();
      cancel.focus();
    });
  }
  window.__townDialogs = {
    confirmDeleteCity: name => show(text("Delete city?", "Supprimer la ville ?"),
      text(`Permanently delete "${name}"? This removes its saved city and recovery backup. Export it first if you want to keep a copy.`,
        `Supprimer définitivement « ${name} » et sa sauvegarde de récupération ? Exportez la ville pour conserver une copie.`), true),
    confirmReturnHome: () => show(
      text("Return to main menu?", "Retourner au menu principal ?"),
      text("Your progress will be saved automatically.", "Votre progression sera sauvegardée automatiquement."),
      true,
      text("Main menu", "Menu principal")
    ),
    notice: message => show(text("Build Your Town", "Build Your Town"), message),
  };
})();
