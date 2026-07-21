import { useState } from "react";
import { type Variants, motion, useReducedMotion } from "motion/react";
import { AnimatedTooltip, type AnimatedTooltipItem } from "@/components/ui/animated-tooltip";
import { AboutVersionFooter } from "@/features/about/components/about-version-footer";
import { ArchitectureDiagram } from "@/features/about/components/architecture-diagram";
import { SimulatorDemoPreview } from "@/features/about/components/simulator-demo-preview";
import { TeamMemberModal, type TeamMemberProfile } from "@/features/about/components/team-member-modal";
import { TechStackGrid } from "@/features/about/components/tech-stack-grid";
import { type AppLocale, getActiveLocale, getMessages } from "@/lib/i18n";

const teamMembers: AnimatedTooltipItem[] = [
  {
    id: 1,
    name: "Nashira Oksani Ardine Santosa",
    designation: "Technical Writer & Frontend Developer",
    image: "/assets/teams/103569160-1x.webp",
    imageWebp1x: "/assets/teams/103569160-1x.webp",
    imageWebp2x: "/assets/teams/103569160-2x.webp",
    width: 56,
    height: 56,
    bio: "Technical Writer & Frontend Developer specializing in developer documentation, UI component guidelines, and user experience for billing workflow simulators.",
    githubUsername: "nashira-oksani",
    roles: ["Technical Documentation", "Frontend Architecture", "UI Guidelines"],
    contributions: [
      "Auth Flow & Session Guidelines",
      "Component Accessibility Specs",
      "Error Handling Seam Documentation",
    ],
    socials: {
      github: "https://github.com/nashira-oksani",
    },
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
    bio: "Senior Backend Engineer focusing on high-concurrency billing microservices, protocol state machine engines, and socket relay infrastructure.",
    githubUsername: "novianto-eb",
    roles: ["Backend Engineering", "Socket Bridge Architecture", "API Endpoints"],
    contributions: [
      "SocketBridgeEngine State Machine",
      "TCP/UDP Protocol Parser",
      "JSON Scenario Schema Validation",
    ],
    socials: {
      github: "https://github.com/novianto-eb",
    },
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
    bio: "Backend Developer expert in transaction processing systems, database optimization, and ISO-8583 message parsing.",
    githubUsername: "bacharuddin-ap",
    roles: ["Database Systems", "Transaction Engine", "ISO-8583 Seams"],
    contributions: [
      "Transaction Query Seams",
      "Biller Endpoint Execution Engine",
      "Batch Settlement Reconciliation",
    ],
    socials: {
      github: "https://github.com/bacharuddin-ap",
    },
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
    bio: "Lead Frontend Developer & System Architect driving React 19 architecture, Base UI design systems, and token-optimized developer tools.",
    githubUsername: "fleetime",
    roles: ["Frontend Architecture", "Base UI Systems", "State Seams"],
    contributions: [
      "React 19 & Base UI Seam Architecture",
      "Unified Developer Tools Module",
      "i18n Multilingual Engine",
    ],
    socials: {
      github: "https://github.com/fleetime",
    },
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
    bio: "Full-stack engineer & Technical Writer specializing in REST API schemas, user management access control, and integration test harnesses.",
    githubUsername: "rosinta-a",
    roles: ["Full-stack Engineering", "API Schema Design", "Security Audit"],
    contributions: [
      "User Administration Seams",
      "JSON Schema Validator Tool",
      "Security Access Controls",
    ],
    socials: {
      github: "https://github.com/rosinta-a",
    },
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
    bio: "Frontend Developer focused on dynamic animations, responsive UI layouts, interactive previews, and real-time dashboard visualizers.",
    githubUsername: "aulia-ariobimo",
    roles: ["UI Engineering", "Framer Motion", "Realtime Dashboard"],
    contributions: [
      "Interactive Simulator Preview Component",
      "Theme Transition Engine",
      "Sidebar Keyboard Navigation",
    ],
    socials: {
      github: "https://github.com/aulia-ariobimo",
    },
  },
];

export type AboutContentProps = {
  locale?: AppLocale;
};

export function AboutContent({ locale }: AboutContentProps) {
  const activeMessages = getMessages(locale || getActiveLocale());
  const shouldReduceMotion = useReducedMotion();
  const [selectedMember, setSelectedMember] = useState<TeamMemberProfile | null>(null);
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
    <>
      <motion.section
        animate="visible"
        aria-label="About page content"
        className="flex flex-col gap-8 text-pretty leading-relaxed transition-colors duration-300 ease-in-out"
        initial="hidden"
        variants={contentContainerVariants}
      >
        <motion.div className="flex flex-col gap-4" variants={sectionVariants} role="region" aria-labelledby="section-what-is-this">
          <h2 id="section-what-is-this" className="font-semibold text-2xl text-foreground transition-colors duration-300">
            {activeMessages.about.whatIsThisTitle}
          </h2>
          <p className="text-muted-foreground transition-colors duration-300">
            {activeMessages.about.whatIsThisDescription}
          </p>
        </motion.div>

        <motion.div className="flex flex-col gap-4" variants={sectionVariants}>
          <SimulatorDemoPreview locale={locale} />
        </motion.div>

        <motion.div className="flex flex-col gap-4" variants={sectionVariants} role="region" aria-labelledby="section-system-architecture">
          <h2 id="section-system-architecture" className="font-semibold text-2xl text-foreground transition-colors duration-300">
            {activeMessages.about.systemArchitectureTitle}
          </h2>
          <p className="text-muted-foreground transition-colors duration-300">
            {activeMessages.about.systemArchitectureDescription}
          </p>
          <ArchitectureDiagram />
        </motion.div>

        <motion.div className="flex flex-col gap-4" variants={sectionVariants} role="region" aria-labelledby="section-key-features">
          <h2 id="section-key-features" className="font-semibold text-2xl text-foreground transition-colors duration-300">
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

        <motion.div className="flex flex-col gap-4" variants={sectionVariants} role="region" aria-labelledby="section-our-team">
          <h2 id="section-our-team" className="font-semibold text-2xl text-foreground transition-colors duration-300">
            {activeMessages.about.ourTeamTitle}
          </h2>
          <div
            aria-label={`${activeMessages.about.ourTeamTitle} — click an avatar to view profile`}
            className="flex flex-row items-center justify-center"
            role="group"
          >
            <AnimatedTooltip items={teamMembers} onSelect={handleSelectMember} />
          </div>
        </motion.div>

        <motion.div className="flex flex-col gap-4" variants={sectionVariants} role="region" aria-labelledby="section-technology">
          <h2 id="section-technology" className="font-semibold text-2xl text-foreground transition-colors duration-300">
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
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
