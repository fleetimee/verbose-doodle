import {
  CheckCircle2Icon,
  DoorClosedIcon,
  LogInIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { Link, Navigate } from "react-router";
import SlicedText from "@/components/kokonutui/sliced-text";
import { useTheme } from "@/components/theme-provider";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useAuth } from "@/features/auth/context";
import { clearManualLogout } from "@/features/auth/utils";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { messages } from "@/lib/i18n";

const GRID_SQUARES_HORIZONTAL = 50;
const GRID_SQUARES_VERTICAL = 50;

export function LoggedOut() {
  const { authState } = useAuth();
  const { theme, setTheme } = useTheme();

  useDocumentMeta({
    title: messages.auth.loggedOutTitle,
    description: messages.auth.loggedOutDocumentDescription,
    keywords: ["logout", "sign out", "authentication"],
  });

  if (authState.isAuthenticated) {
    return <Navigate replace to="/dashboard/overview" />;
  }

  const themeSwitcherValue =
    theme === "light" || theme === "dark" ? theme : undefined;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <InteractiveGridPattern
        className="absolute inset-x-0 inset-y-[-30%] h-[200%] w-full skew-y-12 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
        squares={[GRID_SQUARES_HORIZONTAL, GRID_SQUARES_VERTICAL]}
      />

      <div className="fixed top-4 right-4 z-10">
        <ThemeSwitcher onChange={setTheme} value={themeSwitcherValue} />
      </div>

      <div className="relative z-10 w-full max-w-md">
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
              {messages.auth.sessionClosed}
            </Highlighter>
            {messages.auth.sessionClosedConnector}
            <Highlighter action="highlight" color="#42A5F5" isView={true}>
              <span className="text-white">
                {messages.auth.localAccessCleared}
              </span>
            </Highlighter>
            {"."}
          </p>
        </div>

        <Card className="relative w-full max-w-md border-border/40 shadow-xl">
          <CardHeader className="gap-4">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="secondary">
                <DoorClosedIcon />
                {messages.auth.signedOutBadge}
              </Badge>
              <CheckCircle2Icon className="text-primary" />
            </div>
            <div className="flex flex-col gap-1">
              <CardTitle className="font-bold text-2xl tracking-tight">
                {messages.auth.loggedOutHeading}
              </CardTitle>
              <CardDescription>
                {messages.auth.loggedOutDescription}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="grid gap-3 text-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <ShieldCheckIcon className="text-primary" />
                <span>{messages.auth.noActiveAccount}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <DoorClosedIcon className="text-primary" />
                <span>{messages.auth.demoLoginPaused}</span>
              </div>
            </div>
            <Button asChild className="w-full">
              <Link onClick={clearManualLogout} to="/login">
                <LogInIcon data-icon="inline-start" />
                {messages.auth.loginAgain}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
