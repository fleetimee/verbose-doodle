import { type Variants, motion, useReducedMotion } from "motion/react";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { AboutVersionFooter } from "@/features/about/components/about-version-footer";
import { SimulatorDemoPreview } from "@/features/about/components/simulator-demo-preview";
import { TechStackGrid } from "@/features/about/components/tech-stack-grid";
import { type AppLocale, getActiveLocale, getMessages } from "@/lib/i18n";

const teamMembers = [
  {
    id: 1,
    name: "Nashira Oksani Ardine Santosa",
    designation: "Technical Writer & Frontend Developer",
    image: "/assets/teams/103569160-1x.webp",
    imageWebp1x: "/assets/teams/103569160-1x.webp",
    imageWebp2x: "/assets/teams/103569160-2x.webp",
    width: 56,
    height: 56,
  },
  {
    id: 2,
    name: "Novianto Eko Budiman",
    designation: "Backend Developer",
    image: "/assets/teams/15899547-1x.webp",
    imageWebp1x: "/assets/teams/15899547-1x.webp",
    imageWebp2x: "/assets/teams/15899547-2x.webp",
    width: 56,
    height: 56,
  },
  {
    id: 3,
    name: "Bacharuddin Adieb Pratama",
    designation: "Backend Developer",
    image: "/assets/teams/22101214-1x.webp",
    imageWebp1x: "/assets/teams/22101214-1x.webp",
    imageWebp2x: "/assets/teams/22101214-2x.webp",
    width: 56,
    height: 56,
  },
  {
    id: 4,
    name: "Novian Andika",
    designation: "Frontend Developer",
    image: "/assets/teams/45744788-1x.webp",
    imageWebp1x: "/assets/teams/45744788-1x.webp",
    imageWebp2x: "/assets/teams/45744788-2x.webp",
    width: 56,
    height: 56,
  },
  {
    id: 5,
    name: "Rosinta Anggraini",
    designation: "Technical Writer & Backend Developer",
    image: "/assets/teams/48322786-1x.webp",
    imageWebp1x: "/assets/teams/48322786-1x.webp",
    imageWebp2x: "/assets/teams/48322786-2x.webp",
    width: 56,
    height: 56,
  },
  {
    id: 6,
    name: "Aulia Ariobimo",
    designation: "Frontend Developer",
    image: "/assets/teams/57403869-1x.webp",
    imageWebp1x: "/assets/teams/57403869-1x.webp",
    imageWebp2x: "/assets/teams/57403869-2x.webp",
    width: 56,
    height: 56,
  },
];

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
            staggerChildren: 0.1,
            delayChildren: 0.1,
          },
    },
  };

  const sectionVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.45, ease: "easeOut" },
    },
  };

  const listContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : {
            staggerChildren: 0.06,
          },
    },
  };

  const listItemVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 },
    visible: {
      opacity: 1,
      x: 0,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.35, ease: "easeOut" },
    },
  };

  return (
    <motion.section
      animate="visible"
      className="flex flex-col gap-8 text-pretty leading-relaxed transition-colors duration-300 ease-in-out"
      initial="hidden"
      variants={contentContainerVariants}
    >
      <motion.div className="flex flex-col gap-4" variants={sectionVariants}>
        <h2 className="font-semibold text-2xl text-foreground transition-colors duration-300">
          {activeMessages.about.whatIsThisTitle}
        </h2>
        <p className="text-muted-foreground transition-colors duration-300">
          {activeMessages.about.whatIsThisDescription}
        </p>
      </motion.div>

      <motion.div className="flex flex-col gap-4" variants={sectionVariants}>
        <SimulatorDemoPreview locale={locale} />
      </motion.div>

      <motion.div className="flex flex-col gap-4" variants={sectionVariants}>
        <h2 className="font-semibold text-2xl text-foreground transition-colors duration-300">
          {activeMessages.about.keyFeaturesTitle}
        </h2>
        <motion.ul
          animate="visible"
          className="ml-6 flex list-disc flex-col gap-2"
          initial="hidden"
          variants={listContainerVariants}
        >
          {[
            {
              title: activeMessages.about.endpointManagementTitle,
              desc: activeMessages.about.endpointManagementDescription,
            },
            {
              title: activeMessages.about.developerToolsTitle,
              desc: activeMessages.about.developerToolsDescription,
            },
            {
              title: activeMessages.about.socketTestingTitle,
              desc: activeMessages.about.socketTestingDescription,
            },
            {
              title: activeMessages.about.socksRelayTitle,
              desc: activeMessages.about.socksRelayDescription,
            },
            {
              title: activeMessages.about.userAdministrationTitle,
              desc: activeMessages.about.userAdministrationDescription,
            },
            {
              title: activeMessages.about.jsonDrivenTitle,
              desc: activeMessages.about.jsonDrivenDescription,
            },
            {
              title: activeMessages.about.modernStackTitle,
              desc: activeMessages.about.modernStackDescription,
            },
          ].map((feature) => (
            <motion.li
              key={feature.title}
              variants={listItemVariants}
              className="transition-colors duration-300"
            >
              <strong className="text-foreground">{feature.title}</strong>{" "}
              <span className="text-muted-foreground">{feature.desc}</span>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>

      <motion.div className="flex flex-col gap-4" variants={sectionVariants}>
        <h2 className="font-semibold text-2xl text-foreground transition-colors duration-300">
          {activeMessages.about.ourTeamTitle}
        </h2>
        <div className="flex flex-row items-center justify-center">
          <AnimatedTooltip items={teamMembers} />
        </div>
      </motion.div>

      <motion.div className="flex flex-col gap-4" variants={sectionVariants}>
        <h2 className="font-semibold text-2xl text-foreground transition-colors duration-300">
          {activeMessages.about.technologyTitle}
        </h2>
        <TechStackGrid />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <AboutVersionFooter />
      </motion.div>
    </motion.section>
  );
}
