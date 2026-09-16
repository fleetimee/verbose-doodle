import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { CheckCircle2, UnlockIcon } from "@/components/hugeicons";
import { Logo } from "@/components/ui/logo";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import type { LoginFormData } from "@/features/login/schemas/login-schema";
import { messages } from "@/lib/i18n";

const PASSWORD_DOTS = Array.from({ length: 11 }, (_, index) => `dot-${index}`);
const GLASS_FRAGMENTS = Array.from(
  { length: 8 },
  (_, index) => `glass-${index}`
);
const PASSWORD_TYPING_DURATION_MS = 2250;
const GLASS_TRANSITION_DURATION_MS = 560;

export type MacOsLoginProps = {
  username?: string;
  mode?: "login" | "lock";
  error?: {
    message: string;
    description?: string;
  } | null;
  isComplete: boolean;
  isLoading?: boolean;
  onSubmit?: (data: LoginFormData) => void;
  onUnlock?: () => void;
  onTransitionComplete: () => void;
  progress: number;
};

export function MacOsLogin({
  username = "admin",
  mode = "login",
  error = null,
  isComplete,
  isLoading = false,
  onSubmit,
  onUnlock,
  onTransitionComplete,
  progress,
}: MacOsLoginProps) {
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isShaking, setIsShaking] = useState(Boolean(error));
  const [password, setPassword] = useState("");
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const prevErrorRef = useRef(error);

  const triggerShake = useCallback(() => {
    setIsShaking(false);
    // Use timeout so browser/dom resets animation
    setTimeout(() => {
      setIsShaking(true);
    }, 10);
  }, []);

  // When error arrives or changes, trigger the iconic macOS shake
  useEffect(() => {
    if (error && error !== prevErrorRef.current) {
      prevErrorRef.current = error;
      triggerShake();
      passwordInputRef.current?.focus();
      passwordInputRef.current?.select();
    } else if (!error) {
      prevErrorRef.current = null;
    }
  }, [error, triggerShake]);

  const { date, time } = useMacOsClock();

  const isInteractive = Boolean(error);
  const status = isComplete
    ? messages.auth.sessionReadyRedirecting
    : messages.auth.creatingSecureSession;
  const isTransitionReady =
    isComplete && (mode === "lock" || isInteractive || isTypingComplete);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setIsTypingComplete(true),
      PASSWORD_TYPING_DURATION_MS
    );

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isTransitionReady) {
      return;
    }

    const timer = window.setTimeout(
      onTransitionComplete,
      GLASS_TRANSITION_DURATION_MS
    );

    return () => window.clearTimeout(timer);
  }, [isTransitionReady, onTransitionComplete]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) {
      return;
    }
    if (!password.trim()) {
      triggerShake();
      passwordInputRef.current?.focus();
      return;
    }
    onSubmit?.({
      captchaVerified: true,
      password,
      username,
    });
  };

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (e.animationName === "macos-shake") {
      setIsShaking(false);
    }
  };

  let accountContent: ReactNode;
  if (mode === "lock") {
    accountContent = <LockUnlockButton onUnlock={onUnlock} />;
  } else if (isInteractive) {
    accountContent = (
      <form
        aria-label={messages.auth.signIn}
        className="macos-password-form"
        onSubmit={handleSubmit}
      >
        <div className="macos-input-pill">
          <input
            aria-label={messages.auth.passwordLabel}
            autoComplete="current-password"
            autoFocus
            className="macos-input-pill-field"
            id="macos-password-input"
            onChange={(e) => setPassword(e.target.value)}
            placeholder={messages.auth.passwordPlaceholder}
            ref={passwordInputRef}
            type="password"
            value={password}
          />
          <button
            aria-label={
              isLoading ? messages.auth.signingIn : messages.auth.signIn
            }
            className="macos-submit-button"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <Spinner size="sm" variant="white" />
            ) : (
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={16}
                strokeWidth={2.5}
              />
            )}
          </button>
        </div>

        {error && (
          <div aria-live="assertive" className="macos-error-badge" role="alert">
            <span>{error.description || error.message}</span>
          </div>
        )}
      </form>
    );
  } else {
    accountContent = (
      <DemoProgressStatus
        isComplete={isComplete}
        progress={progress}
        status={status}
      />
    );
  }

  return (
    <section
      className="macos-lock-screen text-white"
      data-state={isTransitionReady ? "complete" : "loading"}
    >
      <img
        alt=""
        aria-hidden="true"
        className="macos-lock-mascot"
        height={1536}
        src="/brand/biller-operator-mascot-login-seated.webp"
        width={1024}
      />
      <div className="macos-lock-clock">
        <p>{date}</p>
        <time>{time}</time>
      </div>

      <div className="macos-lock-account">
        <div
          className={`macos-account-card flex w-full flex-col items-center gap-2 ${
            isShaking ? "macos-shake" : ""
          }`}
          onAnimationEnd={handleAnimationEnd}
        >
          <div className="macos-login-avatar">
            <Logo size="lg" variant="icon" />
          </div>
          <h1>{mode === "lock" ? username : messages.common.appName}</h1>
          {mode === "lock" && (
            <p className="macos-lock-status">
              {messages.auth.unlockDescription}
            </p>
          )}

          {accountContent}
        </div>
      </div>

      <div aria-hidden="true" className="macos-glass-break">
        {GLASS_FRAGMENTS.map((fragment) => (
          <span key={fragment} />
        ))}
      </div>
    </section>
  );
}

function LockUnlockButton({ onUnlock }: { onUnlock?: () => void }) {
  return (
    <button
      aria-label={messages.auth.unlock}
      autoFocus
      className="macos-unlock-action"
      onClick={onUnlock}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onUnlock?.();
        }
      }}
      type="button"
    >
      <UnlockIcon aria-hidden="true" className="size-4" />
      {messages.auth.unlock}
    </button>
  );
}

function DemoProgressStatus({
  isComplete,
  progress,
  status,
}: {
  isComplete: boolean;
  progress: number;
  status: string;
}) {
  return (
    <>
      <div
        aria-label={messages.auth.validatingDemoCredentials}
        className="macos-password-status"
        role="img"
      >
        <span aria-hidden="true" className="macos-password-dots">
          {PASSWORD_DOTS.map((dot, index) => (
            <span
              className="macos-password-dot"
              key={dot}
              style={{ "--password-dot-index": index } as CSSProperties}
            />
          ))}
        </span>
        <span aria-hidden="true" className="macos-login-state">
          {isComplete && <CheckCircle2 />}
        </span>
      </div>

      <Progress
        aria-label={messages.auth.preparingDemoSessionAriaLabel}
        className="sr-only"
        value={progress}
      />
      <p aria-live="polite" className="macos-lock-status">
        {status}
      </p>
    </>
  );
}

function useMacOsClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const date = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    weekday: "short",
  }).format(now);

  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    hour12: false,
    minute: "2-digit",
  }).format(now);

  return { date, time };
}
