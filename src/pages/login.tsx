import { Navigate } from "react-router";
import SlicedText from "@/components/kokonutui/sliced-text";
import { useTheme } from "@/components/theme-provider";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Highlighter } from "@/components/ui/highlighter";
import { InteractiveGridPattern } from "@/components/ui/interactive-grid-pattern";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/features/auth/context";
import { LoginForm } from "@/features/login/components/login-form";
import { useLogin } from "@/features/login/hooks/use-login";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { getErrorMessage } from "@/lib/error-handler";

const GRID_SQUARES_HORIZONTAL = 50;
const GRID_SQUARES_VERTICAL = 50;

export const Login = () => {
  const { authState } = useAuth();
  const { theme, setTheme } = useTheme();

  useDocumentMeta({
    title: "Login",
    description: "Sign in to your billing simulator account",
    keywords: ["login", "sign in", "authentication"],
  });

  const { mutate: login, isPending, error, isError } = useLogin();

  // Redirect to dashboard if already authenticated
  if (authState.isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  // Filter theme to only pass valid values to ThemeSwitcher (light or dark)
  const themeSwitcherValue =
    theme === "light" || theme === "dark" ? theme : undefined;

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
              text="Biller Simulator JSON"
            />
          </div>
          <p className="text-muted-foreground text-sm">
            <Highlighter action="underline" color="#FFA726" isView={true}>
              Create
            </Highlighter>
            {" and "}
            {" manage                "}
            <Highlighter action="highlight" color="#42A5F5" isView={true}>
              <span className="text-white"> billing scenarios</span>
            </Highlighter>
            {" effortlessly."}
          </p>
        </div>

        {/* Login Form */}
        <LoginForm
          error={
            isError
              ? {
                  message: "Login Failed",
                  description: getErrorMessage(error),
                }
              : null
          }
          isLoading={isPending}
          onSubmit={login}
        />
      </div>
    </div>
  );
};
