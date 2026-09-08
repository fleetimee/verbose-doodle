import { motion, useReducedMotion, type Variants } from "motion/react";
import { useState } from "react";
import { Link } from "react-router";
import { AboutContent } from "@/features/about/components/about-content";
import { AboutHeader } from "@/features/about/components/about-header";
import { type AppLocale, getActiveLocale, getMessages } from "@/lib/i18n";

export function AboutPage() {
  const [locale, setLocale] = useState<AppLocale>(() => getActiveLocale());
  const activeMessages = getMessages(locale);
  const shouldReduceMotion = useReducedMotion();

  const pageContainerVariants: Variants = {
    exit: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : {
            delayChildren: 0.02,
            staggerChildren: 0.05,
          },
    },
  };

  const footerItemVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.25, ease: "easeOut" },
      y: 0,
    },
  };

  return (
    <>
      <a
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        href="#about-main-content"
      >
        Skip to main content
      </a>
      <span aria-atomic="true" aria-live="polite" className="sr-only">
        About
      </span>
      <motion.main
        animate="visible"
        aria-label={activeMessages.about.documentDescription}
        className="mx-auto flex min-h-svh w-full max-w-2xl flex-col justify-between gap-3 px-4 py-4 transition-colors duration-300 ease-in-out sm:py-5 md:px-6"
        exit="exit"
        id="about-main-content"
        initial="hidden"
        variants={pageContainerVariants}
      >
        <AboutHeader onLocaleChange={setLocale} />
        <AboutContent locale={locale} />
        <motion.footer
          className="flex flex-col items-center gap-1.5 pt-1 pb-1"
          variants={footerItemVariants}
        >
          <Link
            className="font-normal text-[11px] text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground"
            to="/"
          >
            {activeMessages.about.returnHome}
          </Link>
          <span className="font-mono text-[10px] text-muted-foreground/40">
            v1.2.0 • Fleetime Labs
          </span>
        </motion.footer>
      </motion.main>
    </>
  );
}
