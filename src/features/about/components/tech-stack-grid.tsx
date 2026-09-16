"use client";

import {
  BunJs,
  FramerDark,
  React,
  ReactQuery,
  ReactRouter,
  TailwindCSS,
  TypeScript,
  ViteJS,
} from "developer-icons";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Custom Fallback Icons for React Hook Form and Base UI
// ---------------------------------------------------------------------------

function ReactHookFormIcon({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={cn("text-pink-500", className)}
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function BaseUiIcon({
  size = 24,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={cn("text-blue-600", className)}
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8L18.5 8 12 11.2 5.5 8 12 4.8zM4 9.6l7 3.5v6.9l-7-3.5V9.6zm9 10.4v-6.9l7-3.5v6.9l-7 3.5z"
        fill="currentColor"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Category = "all" | "core" | "uiStyling" | "toolingState";

interface TechItem {
  category: Exclude<Category, "all">;
  description: string;
  docsUrl: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  name: string;
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const TECH_STACK: TechItem[] = [
  {
    category: "core",
    get description() {
      return messages.about.techStack.descriptions.react;
    },
    docsUrl: "https://react.dev",
    icon: React,
    name: "React 19",
  },
  {
    category: "core",
    get description() {
      return messages.about.techStack.descriptions.typescript;
    },
    docsUrl: "https://www.typescriptlang.org",
    icon: TypeScript,
    name: "TypeScript",
  },
  {
    category: "core",
    get description() {
      return messages.about.techStack.descriptions.vite;
    },
    docsUrl: "https://vitejs.dev",
    icon: ViteJS,
    name: "Vite",
  },
  {
    category: "core",
    get description() {
      return messages.about.techStack.descriptions.bun;
    },
    docsUrl: "https://bun.sh",
    icon: BunJs,
    name: "Bun",
  },
  {
    category: "uiStyling",
    get description() {
      return messages.about.techStack.descriptions.tailwind;
    },
    docsUrl: "https://tailwindcss.com",
    icon: TailwindCSS,
    name: "Tailwind CSS v4",
  },
  {
    category: "uiStyling",
    get description() {
      return messages.about.techStack.descriptions.baseUi;
    },
    docsUrl: "https://base-ui.com",
    icon: BaseUiIcon,
    name: "Base UI",
  },
  {
    category: "uiStyling",
    get description() {
      return messages.about.techStack.descriptions.motion;
    },
    docsUrl: "https://motion.dev",
    icon: FramerDark,
    name: "Motion",
  },
  {
    category: "toolingState",
    get description() {
      return messages.about.techStack.descriptions.tanstackQuery;
    },
    docsUrl: "https://tanstack.com/query",
    icon: ReactQuery,
    name: "TanStack Query",
  },
  {
    category: "toolingState",
    get description() {
      return messages.about.techStack.descriptions.reactHookForm;
    },
    docsUrl: "https://react-hook-form.com",
    icon: ReactHookFormIcon,
    name: "React Hook Form",
  },
  {
    category: "toolingState",
    get description() {
      return messages.about.techStack.descriptions.reactRouter;
    },
    docsUrl: "https://reactrouter.com",
    icon: ReactRouter,
    name: "React Router v7",
  },
];

const CATEGORIES: Category[] = ["all", "core", "uiStyling", "toolingState"];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const tabIndicatorVariants = {
  animate: { opacity: 1, scaleX: 1 },
  exit: { opacity: 0, scaleX: 0 },
  initial: { opacity: 0, scaleX: 0 },
};

const cardVariants = {
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.04, duration: 0.25, ease: "easeOut" as const },
    y: 0,
  }),
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface TechCardProps {
  index: number;
  item: TechItem;
}

function TechCard({ item, index }: TechCardProps) {
  const [hovered, setHovered] = useState(false);
  const IconComponent = item.icon;

  return (
    <motion.a
      animate="visible"
      className="group relative flex cursor-pointer flex-col gap-2 rounded-xl border border-border/60 bg-card/60 p-3 backdrop-blur-sm transition-all duration-200 hover:border-border hover:bg-card hover:shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-card/40 dark:hover:bg-card/80"
      custom={index}
      exit="exit"
      href={item.docsUrl}
      initial="hidden"
      onBlur={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      rel="noopener noreferrer"
      target="_blank"
      variants={cardVariants}
    >
      {/* Icon & External Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex size-7 shrink-0 items-center justify-center transition-transform duration-200 group-hover:rotate-3 group-hover:scale-105">
          <IconComponent size={24} />
        </div>
        <span
          aria-hidden="true"
          className="text-muted-foreground/40 text-xs transition-colors duration-200 group-hover:text-foreground"
        >
          ↗
        </span>
      </div>

      {/* Name */}
      <p className="font-semibold text-foreground text-xs leading-snug">
        {item.name}
      </p>

      {/* Tooltip description on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground text-xs leading-relaxed"
            exit={{ opacity: 0, y: 2 }}
            initial={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.15 }}
          >
            {item.description}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.a>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function TechStackGrid() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const filtered =
    activeCategory === "all"
      ? TECH_STACK
      : TECH_STACK.filter((t) => t.category === activeCategory);

  return (
    <div className="flex flex-col gap-3.5">
      {/* Category filter tabs */}
      <div
        aria-label={messages.about.techStack.filterAria}
        className="flex flex-wrap gap-1.5"
        role="tablist"
      >
        {CATEGORIES.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <button
              aria-selected={isActive}
              className={`relative rounded-full px-3 py-1 font-medium text-xs transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              key={cat}
              onClick={() => setActiveCategory(cat)}
              role="tab"
              type="button"
            >
              {messages.about.techStack.categories[cat]}
              {isActive && (
                <motion.span
                  animate="animate"
                  className="absolute inset-0 rounded-full bg-primary/10"
                  exit="exit"
                  initial="initial"
                  layoutId="active-tab-ring"
                  transition={{ damping: 30, stiffness: 400, type: "spring" }}
                  variants={tabIndicatorVariants}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Badge grid */}
      <motion.div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" layout>
        {filtered.map((item, i) => (
          <TechCard index={i} item={item} key={item.name} />
        ))}
      </motion.div>

      <p className="text-center text-muted-foreground text-xs">
        {messages.about.techStack.docsHint}
      </p>
    </div>
  );
}
