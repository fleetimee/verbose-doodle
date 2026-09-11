import { LockPasswordIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { SCREEN_LOCK_STORAGE_KEY, useAuth } from "@/features/auth/context";
import { MacOsLogin } from "@/features/login/components/macos-login";
import { messages } from "@/lib/i18n";

export const IDLE_LOCK_TIMEOUT_MS = 2.5 * 60 * 1000; // 2.5 minutes (150,000 ms)
const ACTIVITY_THROTTLE_MS = 1000;

const LockContext = createContext<(() => void) | null>(null);

export function ScreenLockProvider({ children }: { children: ReactNode }) {
  const { snapshot } = useAuth();
  const [account, setAccount] = useState(() =>
    sessionStorage.getItem(SCREEN_LOCK_STORAGE_KEY)
  );

  const lock = useCallback(() => {
    if (!snapshot.user) {
      return;
    }
    sessionStorage.setItem(SCREEN_LOCK_STORAGE_KEY, snapshot.user.username);
    setAccount(snapshot.user.username);
  }, [snapshot.user]);

  const unlock = useCallback(() => {
    sessionStorage.removeItem(SCREEN_LOCK_STORAGE_KEY);
    setAccount(null);
  }, []);

  useEffect(() => {
    if (!snapshot.user || account !== null) {
      return;
    }

    let timer: number | undefined;
    let lastActivity = Date.now();

    const scheduleTimer = (delayMs: number) => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
      timer = window.setTimeout(lock, delayMs);
    };

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivity < ACTIVITY_THROTTLE_MS) {
        return;
      }
      lastActivity = now;
      scheduleTimer(IDLE_LOCK_TIMEOUT_MS);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const elapsed = Date.now() - lastActivity;
        if (elapsed >= IDLE_LOCK_TIMEOUT_MS) {
          lock();
        } else {
          scheduleTimer(IDLE_LOCK_TIMEOUT_MS - elapsed);
        }
      }
    };

    scheduleTimer(IDLE_LOCK_TIMEOUT_MS);

    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "wheel",
    ] as const;

    for (const event of activityEvents) {
      window.addEventListener(event, handleActivity, { passive: true });
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
      for (const event of activityEvents) {
        window.removeEventListener(event, handleActivity);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [snapshot.user, account, lock]);

  return (
    <LockContext.Provider value={lock}>
      {children}
      {account !== null && <LockScreen account={account} onUnlocked={unlock} />}
    </LockContext.Provider>
  );
}

export function LockScreenButton() {
  const lock = useContext(LockContext);
  return (
    <Button
      aria-label={messages.auth.lockScreen}
      onClick={() => lock?.()}
      size="icon"
      title={messages.auth.lockScreen}
      variant="ghost"
    >
      <HugeiconsIcon
        aria-hidden="true"
        className="size-4"
        icon={LockPasswordIcon}
      />
    </Button>
  );
}

function LockScreen({
  account,
  onUnlocked,
}: {
  account: string;
  onUnlocked: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpening, setIsOpening] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  useEffect(() => {
    if (!isOpening) {
      return;
    }
    const timer = window.setTimeout(onUnlocked, 450);
    return () => window.clearTimeout(timer);
  }, [isOpening, onUnlocked]);

  const handleUnlock = useCallback(() => {
    setIsOpening(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleUnlock();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleUnlock]);

  return (
    <dialog
      aria-label={messages.auth.lockScreen}
      className="workspace-lock-dialog"
      data-state={isOpening ? "opening" : "locked"}
      onCancel={(event) => event.preventDefault()}
      ref={dialogRef}
    >
      <MacOsLogin
        isComplete={false}
        mode="lock"
        onTransitionComplete={() => undefined}
        onUnlock={handleUnlock}
        progress={0}
        username={account}
      />
    </dialog>
  );
}
