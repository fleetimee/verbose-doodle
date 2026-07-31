import { motion, useReducedMotion, type Variants } from "motion/react";
import { useState } from "react";
import {
  AnimatedTooltip,
  type AnimatedTooltipItem,
} from "@/components/ui/animated-tooltip";
import { AboutVersionFooter } from "@/features/about/components/about-version-footer";
import { ArchitectureDiagram } from "@/features/about/components/architecture-diagram";
import { SimulatorDemoPreview } from "@/features/about/components/simulator-demo-preview";
import {
  TeamMemberModal,
  type TeamMemberProfile,
} from "@/features/about/components/team-member-modal";
import { TechStackGrid } from "@/features/about/components/tech-stack-grid";
import { type AppLocale, getActiveLocale, getMessages } from "@/lib/i18n";

const teamMembers: AnimatedTooltipItem[] = [
  {
    bio: "Technical Writer & Frontend Developer specializing in developer documentation, UI component guidelines, and user experience for billing workflow simulators.",
    contributions: [
      "Auth Flow & Session Guidelines",
      "Component Accessibility Specs",
      "Error Handling Seam Documentation",
    ],
    designation: "Technical Writer & Frontend Developer",
    githubUsername: "nashira-oksani",
    height: 56,
    id: 1,
    image: "/assets/teams/103569160-1x.webp",
    imageWebp1x: "/assets/teams/103569160-1x.webp",
    imageWebp2x: "/assets/teams/103569160-2x.webp",
    name: "Nashira Oksani Ardine Santosa",
    roles: [
      "Technical Documentation",
      "Frontend Architecture",
      "UI Guidelines",
    ],
    socials: {
      github: "https://github.com/nashira-oksani",
    },
    width: 56,
  },
  {
    bio: "Senior Backend Engineer focusing on high-concurrency billing microservices, protocol state machine engines, and socket relay infrastructure.",
    contributions: [
      "SocketBridgeEngine State Machine",
      "TCP/UDP Protocol Parser",
      "JSON Scenario Schema Validation",
    ],
    designation: "Backend Developer",
    githubUsername: "novianto-eb",
    height: 56,
    id: 2,
    image: "/assets/teams/15899547-1x.webp",
    imageWebp1x: "/assets/teams/15899547-1x.webp",
    imageWebp2x: "/assets/teams/15899547-2x.webp",
    name: "Novianto Eko Budiman",
    roles: [
      "Backend Engineering",
      "Socket Bridge Architecture",
      "API Endpoints",
    ],
    socials: {
      github: "https://github.com/novianto-eb",
    },
    width: 56,
  },
  {
    bio: "Backend Developer expert in transaction processing systems, database optimization, and ISO-8583 message parsing.",
    contributions: [
      "Transaction Query Seams",
      "Biller Endpoint Execution Engine",
      "Batch Settlement Reconciliation",
    ],
    designation: "Backend Developer",
    githubUsername: "bacharuddin-ap",
    height: 56,
    id: 3,
    image: "/assets/teams/22101214-1x.webp",
    imageWebp1x: "/assets/teams/22101214-1x.webp",
    imageWebp2x: "/assets/teams/22101214-2x.webp",
    name: "Bacharuddin Adieb Pratama",
    roles: ["Database Systems", "Transaction Engine", "ISO-8583 Seams"],
    socials: {
      github: "https://github.com/bacharuddin-ap",
    },
    width: 56,
  },
  {
    bio: "Lead Frontend Developer & System Architect driving React 19 architecture, Base UI design systems, and token-optimized developer tools.",
    contributions: [
      "React 19 & Base UI Seam Architecture",
      "Unified Developer Tools Module",
      "i18n Multilingual Engine",
    ],
    designation: "Frontend Developer",
    githubUsername: "fleetime",
    height: 56,
    id: 4,
    image: "/assets/teams/45744788-1x.webp",
    imageWebp1x: "/assets/teams/45744788-1x.webp",
    imageWebp2x: "/assets/teams/45744788-2x.webp",
    name: "Novian Andika",
    roles: ["Frontend Architecture", "Base UI Systems", "State Seams"],
    socials: {
      github: "https://github.com/fleetime",
    },
    width: 56,
  },
  {
    bio: "Full-stack engineer & Technical Writer specializing in REST API schemas, user management access control, and integration test harnesses.",
    contributions: [
      "User Administration Seams",
      "JSON Schema Validator Tool",
      "Security Access Controls",
    ],
    designation: "Technical Writer & Backend Developer",
    githubUsername: "rosinta-a",
    height: 56,
    id: 5,
    image: "/assets/teams/48322786-1x.webp",
    imageWebp1x: "/assets/teams/48322786-1x.webp",
    imageWebp2x: "/assets/teams/48322786-2x.webp",
    name: "Rosinta Anggraini",
    roles: ["Full-stack Engineering", "API Schema Design", "Security Audit"],
    socials: {
      github: "https://github.com/rosinta-a",
    },
    width: 56,
  },
  {
    bio: "Frontend Developer focused on dynamic animations, responsive UI layouts, interactive previews, and real-time dashboard visualizers.",
    contributions: [
      "Interactive Simulator Preview Component",
      "Theme Transition Engine",
      "Sidebar Keyboard Navigation",
    ],
    designation: "Frontend Developer",
    githubUsername: "aulia-ariobimo",
    height: 56,
    id: 6,
    image: "/assets/teams/57403869-1x.webp",
    imageWebp1x: "/assets/teams/57403869-1x.webp",
    imageWebp2x: "/assets/teams/57403869-2x.webp",
    name: "Aulia Ariobimo",
    roles: ["UI Engineering", "Framer Motion", "Realtime Dashboard"],
    socials: {
      github: "https://github.com/aulia-ariobimo",
    },
    width: 56,
  },
];

export type AboutContentProps = {
  locale?: AppLocale;
};

export function AboutContent({ locale }: AboutContentProps) {
  const activeMessages = getMessages(locale || getActiveLocale());
  const shouldReduceMotion = useReducedMotion();
  const [selectedMember, setSelectedMember] =
    useState<TeamMemberProfile | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelectMember = (item: AnimatedTooltipItem) => {
    setSelectedMember(item as TeamMemberProfile);
    setModalOpen(true);
  };

  const contentContainerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : {
            delayChildren: 0.1,
            staggerChildren: 0.1,
          },
    },
  };

  const sectionVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.45, ease: "easeOut" },
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
            staggerChildren: 0.06,
          },
    },
  };

  const listItemVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 },
    visible: {
      opacity: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.35, ease: "easeOut" },
      x: 0,
    },
  };

  return (
    <>
      <motion.section
        animate="visible"
        aria-label="About page content"
        className="flex flex-col gap-8 text-pretty leading-relaxed transition-colors duration-300 ease-in-out"
        initial="hidden"
        variants={contentContainerVariants}
      >
        <motion.div
          aria-labelledby="section-what-is-this"
          className="flex flex-col gap-4"
          role="region"
          variants={sectionVariants}
        >
          <h2
            className="font-semibold text-2xl text-foreground transition-colors duration-300"
            id="section-what-is-this"
          >
            {activeMessages.about.whatIsThisTitle}
          </h2>
          <p className="text-muted-foreground transition-colors duration-300">
            {activeMessages.about.whatIsThisDescription}
          </p>
        </motion.div>

        <motion.div className="flex flex-col gap-4" variants={sectionVariants}>
          <SimulatorDemoPreview locale={locale} />
        </motion.div>

        <motion.div
          aria-labelledby="section-system-architecture"
          className="flex flex-col gap-4"
          role="region"
          variants={sectionVariants}
        >
          <h2
            className="font-semibold text-2xl text-foreground transition-colors duration-300"
            id="section-system-architecture"
          >
            {activeMessages.about.systemArchitectureTitle}
          </h2>
          <p className="text-muted-foreground transition-colors duration-300">
            {activeMessages.about.systemArchitectureDescription}
          </p>
          <ArchitectureDiagram />
        </motion.div>

        <motion.div
          aria-labelledby="section-key-features"
          className="flex flex-col gap-4"
          role="region"
          variants={sectionVariants}
        >
          <h2
            className="font-semibold text-2xl text-foreground transition-colors duration-300"
            id="section-key-features"
          >
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
            ].map((feature) => (
              <motion.li
                className="transition-colors duration-300"
                key={feature.title}
                variants={listItemVariants}
              >
                <strong className="text-foreground">{feature.title}</strong>{" "}
                <span className="text-muted-foreground">{feature.desc}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        <motion.div
          aria-labelledby="section-our-team"
          className="flex flex-col gap-4"
          role="region"
          variants={sectionVariants}
        >
          <h2
            className="font-semibold text-2xl text-foreground transition-colors duration-300"
            id="section-our-team"
          >
            {activeMessages.about.ourTeamTitle}
          </h2>
          <fieldset
            aria-label={`${activeMessages.about.ourTeamTitle} — click an avatar to view profile`}
            className="flex flex-row items-center justify-center border-0 p-0"
          >
            <AnimatedTooltip
              items={teamMembers}
              onSelect={handleSelectMember}
            />
          </fieldset>
        </motion.div>

        <motion.div
          aria-labelledby="section-technology"
          className="flex flex-col gap-4"
          role="region"
          variants={sectionVariants}
        >
          <h2
            className="font-semibold text-2xl text-foreground transition-colors duration-300"
            id="section-technology"
          >
            {activeMessages.about.technologyTitle}
          </h2>
          <TechStackGrid />
        </motion.div>

        <motion.div variants={sectionVariants}>
          <AboutVersionFooter />
        </motion.div>
      </motion.section>

      <TeamMemberModal
        member={selectedMember}
        onOpenChange={setModalOpen}
        open={modalOpen}
      />
    </>
  );
}
