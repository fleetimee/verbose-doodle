import { motion } from "motion/react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { AboutContent } from "@/features/about/components/about-content";
import { AboutHeader } from "@/features/about/components/about-header";
import { messages } from "@/lib/i18n";

export function AboutPage() {
  return (
    <motion.main
      animate={{ opacity: 1 }}
      className="mx-auto flex min-h-svh w-full max-w-3xl flex-col gap-12 px-4 py-12 md:py-16"
      exit={{ opacity: 0, y: 20 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <AboutHeader />
      <AboutContent />
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
        initial={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.5, delay: 1.3 }}
      >
        <Button nativeButton={false} render={<Link to="/" />} variant="link">
          {messages.about.returnHome}
        </Button>
      </motion.div>
    </motion.main>
  );
}
