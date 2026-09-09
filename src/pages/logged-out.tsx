import { Link, Navigate } from "react-router";
import { LogInIcon } from "@/components/hugeicons";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/features/auth/context";
import { clearManualLogout } from "@/features/auth/manual-logout";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

export function LoggedOut() {
  const { snapshot } = useAuth();
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

  useDocumentMeta({
    description: messages.auth.loggedOutDocumentDescription,
    keywords: ["logout", "sign out", "authentication"],
    title: messages.auth.loggedOutTitle,
  });

  if (snapshot.isAuthenticated) {
    return <Navigate replace to="/dashboard/overview" />;
  }

  return (
    <main className="macos-lock-screen macos-logged-out-screen text-white">
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

      <section
        aria-labelledby="logged-out-heading"
        className="macos-lock-account"
      >
        <div className="macos-login-avatar macos-logged-out-avatar">
          <Logo size="lg" variant="icon" />
        </div>
        <h1>{messages.common.appName}</h1>
        <p className="macos-logged-out-message" id="logged-out-heading">
          {messages.auth.loggedOutHeading}
        </p>
        <p className="macos-lock-status">{messages.auth.localAccessCleared}</p>

        <Link
          className="macos-logged-out-action"
          onClick={clearManualLogout}
          to="/login"
        >
          <LogInIcon aria-hidden="true" />
          {messages.auth.loginAgain}
        </Link>
      </section>
    </main>
  );
}
