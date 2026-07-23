import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { Navigate, useSearchParams } from "react-router";
import { KeyRoundIcon, ShieldCheckIcon } from "@/components/hugeicons";
import SlicedText from "@/components/kokonutui/sliced-text";
import { useTheme } from "@/components/theme-provider";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Highlighter } from "@/components/ui/highlighter";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";
import { Logo } from "@/components/ui/logo";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/features/auth/context";
import { hasManualLogout } from "@/features/auth/manual-logout";
import { LoginForm } from "@/features/login/components/login-form";
import { useLogin } from "@/features/login/hooks/use-login";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { getErrorMessage } from "@/lib/error-handler";
import { messages } from "@/lib/i18n";

const GRID_SQUARES_HORIZONTAL = 50;
const GRID_SQUARES_VERTICAL = 50;

const EXPIRATION_MESSAGES = {
  "expired-while-active": messages.auth.expiredWhileActive,
  "expired-while-away": messages.auth.expiredWhileAway,
  "expired-during-request": messages.auth.expiredWhileActive,
};

const AUTO_LOGIN_CREDENTIALS = {
  username: "admin",
  password: "password123",
  captchaVerified: true,
};

const REDIRECT_DELAY_MS = 700;
const AUTO_LOGIN_PROGRESS_INTERVAL_MS = 120;
const AUTO_LOGIN_PROGRESS_STEP = 7;
const AUTO_LOGIN_MAX_PENDING_PROGRESS = 86;

export const Login = () => {
  const { snapshot } = useAuth();
  const isManualLogout = hasManualLogout();
  const { theme, setTheme } = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [expirationMessage, setExpirationMessage] = useState<string | null>(
    null
  );
  const [redirectReady, setRedirectReady] = useState(snapshot.isAuthenticated);
  const [autoLoginProgress, setAutoLoginProgress] = useState(14);
  const [isAutoLoginComplete, setIsAutoLoginComplete] = useState(false);
  const hasAttemptedLogin = useRef(false);

  useDocumentMeta({
    title: messages.auth.loginDocumentTitle,
    description: messages.auth.loginDocumentDescription,
    keywords: ["login", "sign in", "authentication"],
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
      window.setTimeout(() => setRedirectReady(true), REDIRECT_DELAY_MS);
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

  // Redirect to dashboard if already authenticated
  if (snapshot.isAuthenticated && redirectReady) {
    return <Navigate replace to="/dashboard" />;
  }

  if (isManualLogout) {
    return <Navigate replace to="/logged-out" />;
  }

  // Filter theme to only pass valid values to ThemeSwitcher (light or dark)
  const themeSwitcherValue =
    theme === "light" || theme === "dark" ? theme : undefined;

  // Determine error state for login form
  // Only show expiration message if user hasn't attempted to login yet
  let loginError: { message: string; description?: string } | null = null;
  if (isError) {
    loginError = {
      message: messages.auth.loginFailedTitle,
      description: getErrorMessage(error),
    };
  } else if (expirationMessage && !hasAttemptedLogin.current) {
    loginError = {
      message: messages.auth.sessionExpiredTitle,
      description: expirationMessage,
    };
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Interactive Grid Pattern Background */}
      <InteractiveGridPattern
        className="absolute inset-x-0 inset-y-[-30%] h-[200%] w-full skew-y-12 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
        squares={[GRID_SQUARES_HORIZONTAL, GRID_SQUARES_VERTICAL]}
      />

      {/* Theme Switcher - Top Right */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeSwitcher onChange={setTheme} value={themeSwitcherValue} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo or Brand */}
        <div className="mb-8 text-center">
          <div className="mb-3 flex justify-center">
            <Logo size="md" theme="auto" variant="icon" />
          </div>
          <div className="mb-2">
            <SlicedText
              className="font-bold text-3xl text-foreground tracking-tight"
              splitSpacing={3}
              text={messages.common.appName}
            />
          </div>
          <p className="text-muted-foreground text-sm">
            <Highlighter action="underline" color="#FFA726" isView={true}>
              {messages.auth.heroCreate}
            </Highlighter>
            {messages.auth.heroConnector}
            {messages.auth.heroManage}
            <Highlighter action="highlight" color="#42A5F5" isView={true}>
              <span className="text-white">
                {messages.auth.heroBillingScenarios}
              </span>
            </Highlighter>
            {messages.auth.heroSuffix}
          </p>
        </div>

        {isError ? (
          <LoginForm
            error={loginError}
            isLoading={isPending}
            onSubmit={handleLogin}
          />
        ) : (
          <Card className="relative w-full max-w-md border-border/40 shadow-xl">
            <CardHeader className="gap-4">
              <div className="flex items-center justify-between gap-3">
                <Badge variant="secondary">
                  <ShieldCheckIcon />
                  {messages.auth.demoAccess}
                </Badge>
                {isAutoLoginComplete ? (
                  <HugeiconsIcon
                    className="text-primary"
                    icon={CheckmarkCircle02Icon}
                    strokeWidth={2}
                  />
                ) : (
                  <Spinner />
                )}
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle className="font-bold text-2xl tracking-tight">
                  {messages.auth.openingWorkspace}
                </CardTitle>
                <CardDescription>
                  {messages.auth.openingWorkspaceDescription}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <Progress
                aria-label={messages.auth.preparingDemoSessionAriaLabel}
                value={autoLoginProgress}
              />
              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <KeyRoundIcon className="text-primary" />
                  <span>{messages.auth.validatingDemoCredentials}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <ShieldCheckIcon className="text-primary" />
                  <span>
                    {isAutoLoginComplete
                      ? messages.auth.sessionReadyRedirecting
                      : messages.auth.creatingSecureSession}
                  </span>
                </div>
              </div>
              {expirationMessage && (
                <p className="text-muted-foreground text-sm">
                  {expirationMessage}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
