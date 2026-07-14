"use client";

import { useControlled } from "@base-ui/utils/useControlled";
import { Moon, Sun } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { messages } from "@/lib/i18n";
import { MOTION_DURATION } from "@/lib/motion";
import { cn } from "@/lib/utils";

const themes = [
  {
    key: "light",
    icon: Sun,
    label: messages.theme.lightTheme,
  },
  {
    key: "dark",
    icon: Moon,
    label: messages.theme.darkTheme,
  },
];

export type ThemeSwitcherProps = {
  value?: "light" | "dark";
  onChange?: (theme: "light" | "dark") => void;
  defaultValue?: "light" | "dark";
  className?: string;
};

export const ThemeSwitcher = ({
  value,
  onChange,
  defaultValue = "light",
  className,
}: ThemeSwitcherProps) => {
  const [theme, setThemeState] = useControlled({
    controlled: value,
    default: defaultValue,
    name: "ThemeSwitcher",
  });
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const setTheme = useCallback(
    (themeKey: "light" | "dark") => {
      setThemeState(themeKey);
      onChange?.(themeKey);
    },
    [onChange, setThemeState]
  );

  const handleThemeClick = useCallback(
    (themeKey: "light" | "dark") => {
      if (shouldReduceMotion || !document.startViewTransition) {
        setTheme(themeKey);
        return;
      }

      document.startViewTransition(() => {
        setTheme(themeKey);
      });
    },
    [setTheme, shouldReduceMotion]
  );

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative isolate flex h-8 rounded-full bg-background p-1 ring-1 ring-border",
        className
      )}
    >
      {themes.map(({ key, icon: Icon, label }) => {
        const isActive = theme === key;

        return (
          <motion.button
            aria-label={label}
            className="relative h-6 w-6 rounded-full"
            key={key}
            onClick={() => handleThemeClick(key as "light" | "dark")}
            type="button"
            whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-secondary"
                layoutId={shouldReduceMotion ? undefined : "activeTheme"}
                transition={
                  shouldReduceMotion
                    ? { duration: MOTION_DURATION.instant }
                    : { type: "spring", stiffness: 300, damping: 30 }
                }
              />
            )}
            <div
              className={cn(
                "transition-[opacity,transform] duration-200 ease-[var(--ease-in-out)] motion-reduce:transition-none",
                isActive ? "scale-110 opacity-100" : "scale-100 opacity-60"
              )}
            >
              <Icon
                className={cn(
                  "relative z-10 m-auto h-4 w-4",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              />
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};
