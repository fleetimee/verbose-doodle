import { motion } from "motion/react";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { TechStackGrid } from "@/features/about/components/tech-stack-grid";
import { messages } from "@/lib/i18n";

// Animation timing constants
const FEATURE_LIST_BASE_DELAY = 0.7;
const FEATURE_LIST_STAGGER_DELAY = 0.1;

const teamMembers = [
  {
    id: 1,
    name: "Nashira Oksani Ardine Santosa",
    designation: "Technical Writer & Frontend Developer",
    image: "/assets/teams/103569160.png",
  },
  {
    id: 2,
    name: "Novianto Eko Budiman",
    designation: "Backend Developer",
    image: "/assets/teams/15899547.jpeg",
  },
  {
    id: 3,
    name: "Bacharuddin Adieb Pratama",
    designation: "Backend Developer",
    image: "/assets/teams/22101214.jpeg",
  },
  {
    id: 4,
    name: "Novian Andika",
    designation: "Frontend Developer",
    image: "/assets/teams/45744788.jpeg",
  },
  {
    id: 5,
    name: "Rosinta Anggraini",
    designation: "Technical Writer & Backend Developer",
    image: "/assets/teams/48322786.png",
  },
  {
    id: 6,
    name: "Aulia Ariobimo",
    designation: "Frontend Developer",
    image: "/assets/teams/57403869.png",
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

export function AboutContent() {
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
          {messages.about.whatIsThisTitle}
        </h2>
        <p>{messages.about.whatIsThisDescription}</p>
      </motion.div>

      <motion.div
        animate="visible"
        className="flex flex-col gap-4"
        initial="hidden"
        transition={{ duration: 0.5, delay: 0.6 }}
        variants={sectionVariants}
      >
        <h2 className="font-semibold text-2xl">
          {messages.about.keyFeaturesTitle}
        </h2>
        <ul className="ml-6 flex list-disc flex-col gap-2">
          {[
            {
              title: messages.about.endpointManagementTitle,
              desc: messages.about.endpointManagementDescription,
            },
            {
              title: messages.about.userAdministrationTitle,
              desc: messages.about.userAdministrationDescription,
            },
            {
              title: messages.about.jsonDrivenTitle,
              desc: messages.about.jsonDrivenDescription,
            },
            {
              title: messages.about.modernStackTitle,
              desc: messages.about.modernStackDescription,
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
          {messages.about.ourTeamTitle}
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
          {messages.about.technologyTitle}
        </h2>
        <TechStackGrid />
      </motion.div>
    </section>
  );
}
