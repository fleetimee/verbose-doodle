"use client";

import { useControlled } from "@base-ui/utils/useControlled";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { Moon, Sun } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const { messages } = useI18n();
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

  const nextTheme = theme === "light" ? "dark" : "light";
  const label =
    nextTheme === "dark" ? messages.theme.darkTheme : messages.theme.lightTheme;
  const Icon = theme === "light" ? Sun : Moon;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={label}
            className={className}
            onClick={() => handleThemeClick(nextTheme)}
            size="icon-sm"
            variant="ghost"
          />
        }
      >
        <Icon className="size-4" />
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
};
