import { useEffect, useState } from "react";

export function useServerSessionExit(
  active: boolean,
  onDisconnect: () => void,
  onLeave: () => void
) {
  const [action, setAction] = useState<"disconnect" | "leave" | null>(null);

  useEffect(() => {
    if (!active) {
      setAction(null);
      return;
    }
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = true;
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [active]);

  return {
    action,
    cancel: () => setAction(null),
    confirm: () => {
      setAction(null);
      if (action === "disconnect") {
        onDisconnect();
      } else if (action === "leave") {
        onLeave();
      }
    },
    requestDisconnect: () => {
      if (active) {
        setAction("disconnect");
      } else {
        onDisconnect();
      }
    },
    requestLeave: () => {
      if (active) {
        setAction("leave");
      } else {
        onLeave();
      }
    },
  };
}
