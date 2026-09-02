import { motion, useReducedMotion, type Variants } from "motion/react";
import { useState } from "react";
import { APP_ICON_SRC } from "@/components/ui/logo";
import { LanguageToggle } from "@/features/about/components/language-toggle";
import { type AppLocale, getActiveLocale, getMessages } from "@/lib/i18n";

// Animation easing curve for bounce effect (cubic-bezier control points)
const EASE_P1 = 0.34;
const EASE_P2 = 1.56;
const EASE_P3 = 0.64;
const EASE_P4 = 1;
const BOUNCE_EASE_CURVE = [EASE_P1, EASE_P2, EASE_P3, EASE_P4] as const;

export type AboutHeaderProps = {
  onLocaleChange?: (locale: AppLocale) => void;
};

export function AboutHeader({ onLocaleChange }: AboutHeaderProps) {
  const shouldReduceMotion = useReducedMotion();
  const [currentLocale, setCurrentLocale] = useState<AppLocale>(() =>
    getActiveLocale()
  );
  const activeMessages = getMessages(currentLocale);

  const handleLocaleChange = (locale: AppLocale) => {
    setCurrentLocale(locale);
    if (onLocaleChange) {
      onLocaleChange(locale);
    }
  };

  const headerContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : {
            delayChildren: 0.05,
            staggerChildren: 0.12,
          },
    },
  };

  const itemVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.5, ease: "easeOut" },
      y: 0,
    },
  };

  const logoVariants: Variants = {
    hidden: shouldReduceMotion
      ? { opacity: 1, rotate: 0, scale: 1 }
      : { opacity: 0, rotate: -8, scale: 0.8 },
    visible: {
      opacity: 1,
      rotate: 0,
      scale: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.6, ease: BOUNCE_EASE_CURVE },
    },
  };

  return (
    <motion.header
      animate="visible"
      aria-labelledby="about-page-title"
      className="flex w-full flex-col items-center gap-8 text-center transition-colors duration-300 ease-in-out"
      initial="hidden"
      variants={headerContainerVariants}
    >
      <div className="flex w-full items-center justify-end">
        <LanguageToggle onLocaleChange={handleLocaleChange} />
      </div>
      <motion.img
        alt={activeMessages.about.logoAlt}
        className="h-32 w-32 rounded-full transition-transform duration-300 md:h-40 md:w-40"
        height="200"
        src={APP_ICON_SRC}
        variants={logoVariants}
        width="200"
      />
      <motion.div className="flex flex-col gap-3" variants={itemVariants}>
        <motion.h1
          className="font-semibold text-4xl text-foreground tracking-tight transition-colors duration-300 md:text-5xl"
          id="about-page-title"
          variants={itemVariants}
        >
          {activeMessages.about.headerTitle}
        </motion.h1>
        <motion.p
          className="text-pretty text-lg text-muted-foreground transition-colors duration-300"
          variants={itemVariants}
        >
          {activeMessages.about.headerDescription}
        </motion.p>
      </motion.div>
    </motion.header>
  );
}
