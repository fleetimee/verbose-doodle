window.copyGameText = async (text) => {
  const fallback = () => {
    const active = document.activeElement;
    const field = document.createElement("textarea");
    field.value = text;
    field.readOnly = true;
    field.style.cssText =
      "position:fixed;top:0;left:0;opacity:0;pointer-events:none";
    document.body.appendChild(field);
    field.select();
    field.setSelectionRange(0, text.length);
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      field.remove();
      active?.focus({ preventScroll: true });
    }
  };
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return fallback();
    }
  }
  return fallback();
};
