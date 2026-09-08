import { motion, useReducedMotion, type Variants } from "motion/react";
import { type AppLocale, getActiveLocale, getMessages } from "@/lib/i18n";

export type AboutContentProps = {
  locale?: AppLocale;
};

export function AboutContent({ locale }: AboutContentProps) {
  const activeMessages = getMessages(locale || getActiveLocale());
  const shouldReduceMotion = useReducedMotion();

  const contentContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : {
            delayChildren: 0.04,
            staggerChildren: 0.06,
          },
    },
  };

  const sectionVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.25, ease: "easeOut" },
      y: 0,
    },
  };

  const listContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : {
            staggerChildren: 0.02,
          },
    },
  };

  const listItemVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.2, ease: "easeOut" },
      y: 0,
    },
  };

  const features = [
    {
      desc: activeMessages.about.endpointManagementDescription,
      title: activeMessages.about.endpointManagementTitle,
    },
    {
      desc: activeMessages.about.developerToolsDescription,
      title: activeMessages.about.developerToolsTitle,
    },
    {
      desc: activeMessages.about.socketTestingDescription,
      title: activeMessages.about.socketTestingTitle,
    },
    {
      desc: activeMessages.about.socksRelayDescription,
      title: activeMessages.about.socksRelayTitle,
    },
    {
      desc: activeMessages.about.userAdministrationDescription,
      title: activeMessages.about.userAdministrationTitle,
    },
    {
      desc: activeMessages.about.jsonDrivenDescription,
      title: activeMessages.about.jsonDrivenTitle,
    },
    {
      desc: activeMessages.about.modernStackDescription,
      title: activeMessages.about.modernStackTitle,
    },
  ];

  return (
    <motion.section
      animate="visible"
      aria-label="About page content"
      className="flex flex-col gap-4 text-pretty transition-colors duration-300 ease-in-out sm:gap-5"
      initial="hidden"
      variants={contentContainerVariants}
    >
      {/* What is this? */}
      <motion.div
        aria-labelledby="section-what-is-this"
        className="flex flex-col gap-1"
        role="region"
        variants={sectionVariants}
      >
        <h2
          className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider"
          id="section-what-is-this"
        >
          {activeMessages.about.whatIsThisTitle}
        </h2>
        <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
          {activeMessages.about.whatIsThisDescription}
        </p>
      </motion.div>

      {/* Key Features (What It Does) */}
      <motion.div
        aria-labelledby="section-key-features"
        className="flex flex-col gap-1.5"
        role="region"
        variants={sectionVariants}
      >
        <h2
          className="font-medium text-[11px] text-muted-foreground uppercase tracking-wider"
          id="section-key-features"
        >
          {activeMessages.about.keyFeaturesTitle}
        </h2>
        <motion.ul
          animate="visible"
          className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2"
          initial="hidden"
          role="list"
          variants={listContainerVariants}
        >
          {features.map((feature, index) => (
            <motion.li
              className={`flex flex-col gap-0.5 ${
                index === features.length - 1 ? "sm:col-span-2" : ""
              }`}
              key={feature.title}
              variants={listItemVariants}
            >
              <span className="font-semibold text-foreground text-xs">
                {feature.title}
              </span>
              <span className="text-[11px] text-muted-foreground leading-snug sm:text-xs">
                {feature.desc}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </motion.section>
  );
}
