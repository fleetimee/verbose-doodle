import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { CheckCircle2 } from "@/components/hugeicons";
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
  defaultUsername?: string;
  error?: {
    message: string;
    description?: string;
  } | null;
  isComplete: boolean;
  isLoading?: boolean;
  onSubmit?: (data: LoginFormData) => void;
  onSwitchToClassic?: () => void;
  onTransitionComplete: () => void;
  progress: number;
};

export function MacOsLogin({
  defaultUsername = "admin",
  error = null,
  isComplete,
  isLoading = false,
  onSubmit,
  onSwitchToClassic,
  onTransitionComplete,
  progress,
}: MacOsLoginProps) {
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [isShaking, setIsShaking] = useState(Boolean(error));
  const [isSwitchingUser, setIsSwitchingUser] = useState(false);
  const [username, setUsername] = useState(defaultUsername);
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

  const now = new Date();
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

  const isInteractive = Boolean(error);
  const status = isComplete
    ? messages.auth.sessionReadyRedirecting
    : messages.auth.creatingSecureSession;
  const isTransitionReady = isComplete && (isInteractive || isTypingComplete);

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
      username: username.trim() || "admin",
    });
  };

  const handleAnimationEnd = (e: React.AnimationEvent) => {
    if (e.animationName === "macos-shake") {
      setIsShaking(false);
    }
  };

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
          <h1>
            {isSwitchingUser
              ? messages.auth.switchUser
              : messages.common.appName}
          </h1>

          {isInteractive ? (
            <form
              aria-label={messages.auth.signIn}
              className="macos-password-form"
              onSubmit={handleSubmit}
            >
              {isSwitchingUser && (
                <div className="macos-input-pill">
                  <input
                    aria-label={messages.auth.usernameLabel}
                    autoComplete="username"
                    className="macos-input-pill-field"
                    id="macos-username-input"
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={messages.auth.usernamePlaceholder}
                    type="text"
                    value={username}
                  />
                </div>
              )}

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
                    <Spinner className="size-3.5 text-white" />
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
                <div
                  aria-live="assertive"
                  className="macos-error-badge"
                  role="alert"
                >
                  <span>{error.description || error.message}</span>
                </div>
              )}

              <div className="macos-lock-actions">
                <button
                  className="macos-lock-subaction"
                  onClick={() => setIsSwitchingUser((prev) => !prev)}
                  type="button"
                >
                  {isSwitchingUser
                    ? messages.auth.cancelSwitchUser
                    : messages.auth.switchUser}
                </button>
                {onSwitchToClassic && (
                  <button
                    className="macos-lock-subaction"
                    onClick={onSwitchToClassic}
                    type="button"
                  >
                    {messages.auth.classicSignIn}
                  </button>
                )}
              </div>
            </form>
          ) : (
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
          )}
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
