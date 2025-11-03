import { useTheme } from "@/components/theme-provider";

export function AboutHeader() {
  const { theme } = useTheme();

  // Determine the actual theme (resolve 'system' to 'light' or 'dark')
  let resolvedTheme = theme;
  if (theme === "system") {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    resolvedTheme = isDark ? "dark" : "light";
  }

  const logoSrc =
    resolvedTheme === "dark" ? "/logo-dark.svg" : "/logo-icon.svg";

  return (
    <header className="flex w-full flex-col items-center gap-8 text-center">
      <img
        alt="Biller JSON Simulator"
        className="h-32 w-32 md:h-40 md:w-40"
        height="200"
        src={logoSrc}
        width="200"
      />
      <div className="flex flex-col gap-3">
        <h1 className="font-semibold text-4xl tracking-tight md:text-5xl">
          About This Project
        </h1>
        <p className="text-pretty text-lg text-muted-foreground">
          The biller simulator helps teams prototype billing journeys using
          configurable JSON scenarios and reusable interface components.
        </p>
      </div>
    </header>
  );
}
