import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/features/auth/context";
import { hasManualLogout } from "@/features/auth/manual-logout";
import { MacOsLogin } from "@/features/login/components/macos-login";
import { useLogin } from "@/features/login/hooks/use-login";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { getErrorMessage } from "@/lib/error-handler";
import { messages } from "@/lib/i18n";

const EXPIRATION_MESSAGES = {
  "expired-during-request": messages.auth.expiredWhileActive,
  "expired-while-active": messages.auth.expiredWhileActive,
  "expired-while-away": messages.auth.expiredWhileAway,
};

const AUTO_LOGIN_CREDENTIALS = {
  captchaVerified: true,
  password: "password123",
  username: "admin",
};

const AUTO_LOGIN_PROGRESS_INTERVAL_MS = 120;
const AUTO_LOGIN_PROGRESS_STEP = 7;
const AUTO_LOGIN_MAX_PENDING_PROGRESS = 86;

export const Login = () => {
  const { snapshot } = useAuth();
  const navigate = useNavigate();
  const isManualLogout = hasManualLogout();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expirationMessage, setExpirationMessage] = useState<string | null>(
    null
  );
  const wasInitiallyAuthenticated = useRef(snapshot.isAuthenticated).current;
  const [autoLoginProgress, setAutoLoginProgress] = useState(14);
  const [isAutoLoginComplete, setIsAutoLoginComplete] = useState(false);
  const hasAttemptedLogin = useRef(false);

  useDocumentMeta({
    description: messages.auth.loginDocumentDescription,
    keywords: ["login", "sign in", "authentication"],
    title: messages.auth.loginDocumentTitle,
  });

  const {
    mutate: login,
    isPending,
    error,
    isError,
  } = useLogin({
    navigateOnSuccess: false,
    onSuccess: () => {
      setAutoLoginProgress(100);
      setIsAutoLoginComplete(true);
    },
    showToast: false,
  });

  // Check for expiration reason from query params
  useEffect(() => {
    const reason = searchParams.get("reason");
    if (reason && reason in EXPIRATION_MESSAGES) {
      setExpirationMessage(
        EXPIRATION_MESSAGES[reason as keyof typeof EXPIRATION_MESSAGES]
      );
      // Clear the query param after reading it
      searchParams.delete("reason");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (isManualLogout) {
      return;
    }
    if (!(isPending || hasAttemptedLogin.current)) {
      hasAttemptedLogin.current = true;
      login(AUTO_LOGIN_CREDENTIALS);
    }
  }, [isManualLogout, login, isPending]);

  useEffect(() => {
    if (!(isPending && !isAutoLoginComplete)) {
      return;
    }

    const interval = window.setInterval(() => {
      setAutoLoginProgress((currentProgress) =>
        Math.min(
          currentProgress + AUTO_LOGIN_PROGRESS_STEP,
          AUTO_LOGIN_MAX_PENDING_PROGRESS
        )
      );
    }, AUTO_LOGIN_PROGRESS_INTERVAL_MS);

    return () => window.clearInterval(interval);
  }, [isAutoLoginComplete, isPending]);

  // Track when login attempt is made
  const handleLogin = (data: Parameters<typeof login>[0]) => {
    hasAttemptedLogin.current = true;
    setAutoLoginProgress(28);
    setIsAutoLoginComplete(false);
    login(data);
  };

  const handleLoginTransitionComplete = useCallback(() => {
    const openDashboard = () => navigate("/dashboard", { replace: true });
    const shouldReduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (shouldReduceMotion || !document.startViewTransition) {
      openDashboard();
      return;
    }

    document.documentElement.dataset.transition = "login-dashboard";
    const transition = document.startViewTransition(() => {
      flushSync(openDashboard);
    });

    transition.finished.finally(() => {
      delete document.documentElement.dataset.transition;
    });
  }, [navigate]);

  // Redirect to dashboard if already authenticated
  if (snapshot.isAuthenticated && wasInitiallyAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  if (isManualLogout) {
    return <Navigate replace to="/logged-out" />;
  }

  // Determine error state for login form
  // Only show expiration message if user hasn't attempted to login yet
  let loginError: { message: string; description?: string } | null = null;
  if (isError) {
    loginError = {
      description: getErrorMessage(error),
      message: messages.auth.loginFailedTitle,
    };
  } else if (expirationMessage && !hasAttemptedLogin.current) {
    loginError = {
      description: expirationMessage,
      message: messages.auth.sessionExpiredTitle,
    };
  }

  return (
    <MacOsLogin
      error={loginError}
      isComplete={isAutoLoginComplete}
      isLoading={isPending}
      onSubmit={handleLogin}
      onTransitionComplete={handleLoginTransitionComplete}
      progress={autoLoginProgress}
    />
  );
};
