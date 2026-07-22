import { motion, useReducedMotion, type Variants } from "motion/react";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { AboutContent } from "@/features/about/components/about-content";
import { AboutHeader } from "@/features/about/components/about-header";
import { type AppLocale, getActiveLocale, getMessages } from "@/lib/i18n";

export function AboutPage() {
  const [locale, setLocale] = useState<AppLocale>(() => getActiveLocale());
  const activeMessages = getMessages(locale);
  const shouldReduceMotion = useReducedMotion();

  const pageContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : {
            staggerChildren: 0.15,
            delayChildren: 0.05,
          },
    },
    exit: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
  };

  const footerItemVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <>
      {/* Skip navigation link for keyboard / screen-reader users */}
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:font-medium focus:text-foreground focus:text-sm focus:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
        href="#about-main-content"
      >
        Skip to main content
      </a>

      {/* Screen-reader live region for locale change announcements */}
      <span aria-atomic="true" aria-live="polite" className="sr-only">
        {activeMessages.about.documentTitle}
      </span>

      <motion.main
        animate="visible"
        aria-label={activeMessages.about.documentDescription}
        className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-12 px-4 py-12 transition-colors duration-300 ease-in-out md:py-16"
        exit="exit"
        id="about-main-content"
        initial="hidden"
        variants={pageContainerVariants}
      >
        <AboutHeader onLocaleChange={setLocale} />
        <AboutContent locale={locale} />
        <motion.div
          className="flex justify-center"
          variants={footerItemVariants}
        >
          <Button nativeButton={false} render={<Link to="/" />} variant="link">
            {activeMessages.about.returnHome}
          </Button>
        </motion.div>
      </motion.main>
    </>
  );
}
