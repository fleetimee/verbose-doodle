import { useState } from "react";
import { type Variants, motion, useReducedMotion } from "motion/react";
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
    <motion.main
      animate="visible"
      className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-12 px-4 py-12 md:py-16 transition-colors duration-300 ease-in-out"
      exit="exit"
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
  );
}
