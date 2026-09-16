import { motion, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import type { AppLocale } from "@/lib/i18n";
import { MOTION_DURATION } from "@/lib/motion";
import { cn } from "@/lib/utils";

const languages: ReadonlyArray<{
  key: AppLocale;
  label: string;
}> = [
  {
    key: "en-US",
    label: "EN",
  },
  {
    key: "id-ID",
    label: "ID",
  },
];

export type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, messages, setLocale } = useI18n();
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const handleLanguageClick = useCallback(
    (targetLocale: AppLocale) => {
      if (targetLocale === locale) {
        return;
      }
      setLocale(targetLocale);
    },
    [locale, setLocale]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className={cn(
        "relative isolate flex h-8 items-center rounded-full bg-background p-1 ring-1 ring-border",
        className
      )}
    >
      {languages.map(({ key, label }) => {
        const isActive = locale === key;
        const title =
          key === "en-US"
            ? messages.common.languageEnglish
            : messages.common.languageIndonesian;

        return (
          <motion.button
            aria-label={title}
            aria-pressed={isActive}
            className="relative flex h-6 w-7 items-center justify-center rounded-full font-medium text-xs transition-colors"
            key={key}
            onClick={() => handleLanguageClick(key)}
            title={title}
            type="button"
            whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-secondary shadow-xs"
                layoutId={shouldReduceMotion ? undefined : "activeLanguage"}
                transition={
                  shouldReduceMotion
                    ? { duration: MOTION_DURATION.instant }
                    : { damping: 30, stiffness: 300, type: "spring" }
                }
              />
            )}
            <span
              className={cn(
                "relative z-10 select-none transition-colors duration-200",
                isActive
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
