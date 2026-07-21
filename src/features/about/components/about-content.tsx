import { motion } from "motion/react";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { AboutVersionFooter } from "@/features/about/components/about-version-footer";
import { TechStackGrid } from "@/features/about/components/tech-stack-grid";
import { type AppLocale, getActiveLocale, getMessages } from "@/lib/i18n";

// Animation timing constants
const FEATURE_LIST_BASE_DELAY = 0.7;
const FEATURE_LIST_STAGGER_DELAY = 0.1;

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

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const listItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export type AboutContentProps = {
  locale?: AppLocale;
};

export function AboutContent({ locale }: AboutContentProps) {
  const activeMessages = getMessages(locale || getActiveLocale());

  return (
    <section className="flex flex-col gap-6 text-pretty leading-relaxed">
      <motion.div
        animate="visible"
        className="flex flex-col gap-4"
        initial="hidden"
        transition={{ duration: 0.5, delay: 0.5 }}
        variants={sectionVariants}
      >
        <h2 className="font-semibold text-2xl">
          {activeMessages.about.whatIsThisTitle}
        </h2>
        <p>{activeMessages.about.whatIsThisDescription}</p>
      </motion.div>

      <motion.div
        animate="visible"
        className="flex flex-col gap-4"
        initial="hidden"
        transition={{ duration: 0.5, delay: 0.6 }}
        variants={sectionVariants}
      >
        <h2 className="font-semibold text-2xl">
          {activeMessages.about.keyFeaturesTitle}
        </h2>
        <ul className="ml-6 flex list-disc flex-col gap-2">
          {[
            {
              title: activeMessages.about.endpointManagementTitle,
              desc: activeMessages.about.endpointManagementDescription,
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
          ].map((feature, index) => (
            <motion.li
              animate="visible"
              initial="hidden"
              key={feature.title}
              transition={{
                duration: 0.4,
                delay:
                  FEATURE_LIST_BASE_DELAY + index * FEATURE_LIST_STAGGER_DELAY,
              }}
              variants={listItemVariants}
            >
              <strong>{feature.title}</strong> {feature.desc}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        animate="visible"
        className="flex flex-col gap-4"
        initial="hidden"
        transition={{ duration: 0.5, delay: 1.1 }}
        variants={sectionVariants}
      >
        <h2 className="font-semibold text-2xl">
          {activeMessages.about.ourTeamTitle}
        </h2>
        <div className="flex flex-row items-center justify-center">
          <AnimatedTooltip items={teamMembers} />
        </div>
      </motion.div>

      <motion.div
        animate="visible"
        className="flex flex-col gap-4"
        initial="hidden"
        transition={{ duration: 0.5, delay: 1.2 }}
        variants={sectionVariants}
      >
        <h2 className="font-semibold text-2xl">
          {activeMessages.about.technologyTitle}
        </h2>
        <TechStackGrid />
      </motion.div>

      <AboutVersionFooter />
    </section>
  );
}
