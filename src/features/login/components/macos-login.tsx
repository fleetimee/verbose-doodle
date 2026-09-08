import { type CSSProperties, useEffect, useState } from "react";
import { CheckCircle2 } from "@/components/hugeicons";
import { Logo } from "@/components/ui/logo";
import { Progress } from "@/components/ui/progress";
import { messages } from "@/lib/i18n";

const PASSWORD_DOTS = Array.from({ length: 11 }, (_, index) => `dot-${index}`);
const GLASS_FRAGMENTS = Array.from(
  { length: 8 },
  (_, index) => `glass-${index}`
);
const PASSWORD_TYPING_DURATION_MS = 2250;
const GLASS_TRANSITION_DURATION_MS = 560;

type MacOsLoginProps = {
  isComplete: boolean;
  onTransitionComplete: () => void;
  progress: number;
};

export function MacOsLogin({
  isComplete,
  onTransitionComplete,
  progress,
}: MacOsLoginProps) {
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const now = new Date();
  const date = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    weekday: "short",
  }).format(now);
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(now);
  const status = isComplete
    ? messages.auth.sessionReadyRedirecting
    : messages.auth.creatingSecureSession;
  const isTransitionReady = isComplete && isTypingComplete;

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
        src="/brand/biller-operator-mascot-lockscreen.webp"
        width={1024}
      />
      <div className="macos-lock-clock">
        <p>{date}</p>
        <time>{time}</time>
      </div>

      <div className="macos-lock-account">
        <div className="macos-login-avatar">
          <Logo size="lg" variant="icon" />
        </div>
        <h1>{messages.common.appName}</h1>

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
      </div>

      <div aria-hidden="true" className="macos-glass-break">
        {GLASS_FRAGMENTS.map((fragment) => (
          <span key={fragment} />
        ))}
      </div>
    </section>
  );
}
