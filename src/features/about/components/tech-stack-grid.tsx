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

// ---------------------------------------------------------------------------
// Custom Fallback Icons for React Hook Form and Base UI
// ---------------------------------------------------------------------------

function ReactHookFormIcon({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
        fill="none"
        stroke="#EC4899"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function BaseUiIcon({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8L18.5 8 12 11.2 5.5 8 12 4.8zM4 9.6l7 3.5v6.9l-7-3.5V9.6zm9 10.4v-6.9l7-3.5v6.9l-7 3.5z"
        fill="#0066FF"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Category = "All" | "Core" | "UI & Styling" | "Tooling & State";

interface TechItem {
  category: Exclude<Category, "All">;
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
    category: "Core",
    description:
      "UI library with the new compiler for automatic memoization and concurrent rendering.",
    docsUrl: "https://react.dev",
    icon: React,
    name: "React 19",
  },
  {
    category: "Core",
    description:
      "Typed superset of JavaScript that compiles to plain JS; catches bugs at compile time.",
    docsUrl: "https://www.typescriptlang.org",
    icon: TypeScript,
    name: "TypeScript",
  },
  {
    category: "Core",
    description:
      "Lightning-fast build tool powered by native ES modules with instant HMR.",
    docsUrl: "https://vitejs.dev",
    icon: ViteJS,
    name: "Vite",
  },
  {
    category: "Core",
    description:
      "All-in-one JavaScript runtime & toolkit: fast package manager, bundler, and test runner.",
    docsUrl: "https://bun.sh",
    icon: BunJs,
    name: "Bun",
  },
  {
    category: "UI & Styling",
    description:
      "Utility-first CSS framework with CSS-native configuration and zero-runtime overhead.",
    docsUrl: "https://tailwindcss.com",
    icon: TailwindCSS,
    name: "Tailwind CSS v4",
  },
  {
    category: "UI & Styling",
    description:
      "Unstyled, accessible UI primitives by MUI for building modern React design systems.",
    docsUrl: "https://base-ui.com",
    icon: BaseUiIcon,
    name: "Base UI",
  },
  {
    category: "UI & Styling",
    description:
      "Production-ready animation library for React with declarative, physics-based animations.",
    docsUrl: "https://motion.dev",
    icon: FramerDark,
    name: "Motion",
  },
  {
    category: "Tooling & State",
    description:
      "Powerful async state management with automatic caching, background refetching, and stale-while-revalidate.",
    docsUrl: "https://tanstack.com/query",
    icon: ReactQuery,
    name: "TanStack Query",
  },
  {
    category: "Tooling & State",
    description:
      "Performant, flexible form management with minimal re-renders and built-in validation.",
    docsUrl: "https://react-hook-form.com",
    icon: ReactHookFormIcon,
    name: "React Hook Form",
  },
  {
    category: "Tooling & State",
    description:
      "Declarative client-side routing for React with nested routes and loader patterns.",
    docsUrl: "https://reactrouter.com",
    icon: ReactRouter,
    name: "React Router v7",
  },
];

const CATEGORIES: Category[] = [
  "All",
  "Core",
  "UI & Styling",
  "Tooling & State",
];

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const tabIndicatorVariants = {
  animate: { opacity: 1, scaleX: 1 },
  exit: { opacity: 0, scaleX: 0 },
  initial: { opacity: 0, scaleX: 0 },
};

const cardVariants = {
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.2 } },
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const },
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
      className="relative flex cursor-pointer flex-col gap-3 rounded-xl border border-border/60 bg-card/60 p-4 backdrop-blur-sm transition-all duration-300 hover:border-border hover:bg-card hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:bg-card/40 dark:hover:bg-card/80"
      custom={index}
      exit="exit"
      href={item.docsUrl}
      initial="hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      rel="noopener noreferrer"
      target="_blank"
      variants={cardVariants}
    >
      {/* Icon */}
      <motion.div
        animate={{ rotate: hovered ? 8 : 0, scale: hovered ? 1.08 : 1 }}
        className="flex size-8 shrink-0 items-center justify-center"
        transition={{ damping: 20, stiffness: 300, type: "spring" }}
      >
        <IconComponent size={32} />
      </motion.div>

      {/* Name */}
      <p className="font-semibold text-sm leading-snug">{item.name}</p>

      {/* Tooltip description on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.p
            animate={{ opacity: 1, y: 0 }}
            className="text-muted-foreground text-xs leading-relaxed"
            exit={{ opacity: 0, y: 4 }}
            initial={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.2 }}
          >
            {item.description}
          </motion.p>
        )}
      </AnimatePresence>

      {/* External link hint */}
      <motion.span
        animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -4 }}
        aria-hidden="true"
        className="absolute top-3 right-3 text-muted-foreground/60 text-xs"
        transition={{ duration: 0.2 }}
      >
        ↗
      </motion.span>
    </motion.a>
  );
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function TechStackGrid() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const filtered =
    activeCategory === "All"
      ? TECH_STACK
      : TECH_STACK.filter((t) => t.category === activeCategory);

  return (
    <div className="flex flex-col gap-5">
      {/* Category filter tabs */}
      <div
        aria-label="Filter by technology category"
        className="flex flex-wrap gap-2"
        role="tablist"
      >
        {CATEGORIES.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <button
              aria-selected={isActive}
              className={`relative rounded-full px-4 py-1.5 font-medium text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              key={cat}
              onClick={() => setActiveCategory(cat)}
              role="tab"
              type="button"
            >
              {cat}
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
      <motion.div className="grid grid-cols-2 gap-3 sm:grid-cols-3" layout>
        {filtered.map((item, i) => (
          <TechCard index={i} item={item} key={item.name} />
        ))}
      </motion.div>

      <p className="text-center text-muted-foreground text-xs">
        Click any badge to open official documentation ↗
      </p>
    </div>
  );
}
