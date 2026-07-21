"use client";

import {
  BunJs,
  FramerDark,
  RadixUI,
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
// Custom Fallback Icon for React Hook Form
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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Category = "All" | "Core" | "UI & Styling" | "Tooling & State";

interface TechItem {
  category: Exclude<Category, "All">;
  color: string;
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
    name: "React 19",
    category: "Core",
    description:
      "UI library with the new compiler for automatic memoization and concurrent rendering.",
    docsUrl: "https://react.dev",
    icon: React,
    color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
  },
  {
    name: "TypeScript",
    category: "Core",
    description:
      "Typed superset of JavaScript that compiles to plain JS; catches bugs at compile time.",
    docsUrl: "https://www.typescriptlang.org",
    icon: TypeScript,
    color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
  },
  {
    name: "Vite",
    category: "Core",
    description:
      "Lightning-fast build tool powered by native ES modules with instant HMR.",
    docsUrl: "https://vitejs.dev",
    icon: ViteJS,
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
  },
  {
    name: "Bun",
    category: "Core",
    description:
      "All-in-one JavaScript runtime & toolkit: fast package manager, bundler, and test runner.",
    docsUrl: "https://bun.sh",
    icon: BunJs,
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
  },
  {
    name: "Tailwind CSS v4",
    category: "UI & Styling",
    description:
      "Utility-first CSS framework with CSS-native configuration and zero-runtime overhead.",
    docsUrl: "https://tailwindcss.com",
    icon: TailwindCSS,
    color: "from-teal-500/20 to-cyan-500/20 border-teal-500/30",
  },
  {
    name: "Radix UI",
    category: "UI & Styling",
    description:
      "Unstyled, accessible UI primitives for building high-quality design systems.",
    docsUrl: "https://www.radix-ui.com",
    icon: RadixUI,
    color: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
  },
  {
    name: "Motion",
    category: "UI & Styling",
    description:
      "Production-ready animation library for React with declarative, physics-based animations.",
    docsUrl: "https://motion.dev",
    icon: FramerDark,
    color: "from-rose-500/20 to-pink-500/20 border-rose-500/30",
  },
  {
    name: "TanStack Query",
    category: "Tooling & State",
    description:
      "Powerful async state management with automatic caching, background refetching, and stale-while-revalidate.",
    docsUrl: "https://tanstack.com/query",
    icon: ReactQuery,
    color: "from-orange-500/20 to-red-500/20 border-orange-500/30",
  },
  {
    name: "React Hook Form",
    category: "Tooling & State",
    description:
      "Performant, flexible form management with minimal re-renders and built-in validation.",
    docsUrl: "https://react-hook-form.com",
    icon: ReactHookFormIcon,
    color: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
  },
  {
    name: "React Router v7",
    category: "Tooling & State",
    description:
      "Declarative client-side routing for React with nested routes and loader patterns.",
    docsUrl: "https://reactrouter.com",
    icon: ReactRouter,
    color: "from-red-500/20 to-orange-500/20 border-red-500/30",
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
  initial: { opacity: 0, scaleX: 0 },
  animate: { opacity: 1, scaleX: 1 },
  exit: { opacity: 0, scaleX: 0 },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.35, delay: i * 0.06, ease: "easeOut" as const },
  }),
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.2 } },
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
      className={`relative flex cursor-pointer flex-col gap-3 rounded-xl border bg-gradient-to-br p-4 transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${item.color} hover:shadow-black/10 hover:shadow-lg dark:hover:shadow-black/30`}
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
        animate={{ rotate: hovered ? 10 : 0, scale: hovered ? 1.1 : 1 }}
        className="flex size-8 shrink-0 items-center justify-center"
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
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
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  variants={tabIndicatorVariants}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Badge grid */}
      <motion.div className="grid grid-cols-2 gap-3 sm:grid-cols-3" layout>
        <AnimatePresence mode="popLayout">
          {filtered.map((item, i) => (
            <TechCard index={i} item={item} key={item.name} />
          ))}
        </AnimatePresence>
      </motion.div>

      <p className="text-center text-muted-foreground text-xs">
        Click any badge to open official documentation ↗
      </p>
    </div>
  );
}
