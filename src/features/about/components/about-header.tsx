import { motion } from "motion/react";
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
      <motion.img
        alt="Biller JSON Simulator"
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        className="h-32 w-32 md:h-40 md:w-40"
        height="200"
        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
        src={logoSrc}
        transition={{
          duration: 0.6,
          ease: [0.34, 1.56, 0.64, 1],
          delay: 0.1
        }}
        width="200"
      />
      <div className="flex flex-col gap-3">
        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="font-semibold text-4xl tracking-tight md:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
        >
          About This Project
        </motion.h1>
        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="text-pretty text-lg text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
        >
          The biller simulator helps teams prototype billing journeys using
          configurable JSON scenarios and reusable interface components.
        </motion.p>
      </div>
    </header>
  );
}
