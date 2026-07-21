"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Category = "All" | "Core" | "UI & Styling" | "Tooling & State";

interface TechItem {
  category: Exclude<Category, "All">;
  color: string;
  description: string;
  docsUrl: string;
  /** Inline SVG path data – keeps the bundle self-contained */
  icon: string;
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
    icon: "M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a7 7 0 110 14A7 7 0 0112 5zm0 1.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM12 9a3 3 0 110 6 3 3 0 010-6z",
    color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30",
  },
  {
    name: "TypeScript",
    category: "Core",
    description:
      "Typed superset of JavaScript that compiles to plain JS; catches bugs at compile time.",
    docsUrl: "https://www.typescriptlang.org",
    icon: "M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z",
    color: "from-blue-500/20 to-indigo-500/20 border-blue-500/30",
  },
  {
    name: "Vite",
    category: "Core",
    description:
      "Lightning-fast build tool powered by native ES modules with instant HMR.",
    docsUrl: "https://vitejs.dev",
    icon: "M12 0L1.605 21.6h3.308L12 6.43l7.087 15.17h3.308L12 0zm0 9.217L6.428 21.6H12V9.217z",
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
  },
  {
    name: "Bun",
    category: "Core",
    description:
      "All-in-one JavaScript runtime & toolkit: fast package manager, bundler, and test runner.",
    docsUrl: "https://bun.sh",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z",
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/30",
  },
  {
    name: "Tailwind CSS v4",
    category: "UI & Styling",
    description:
      "Utility-first CSS framework with CSS-native configuration and zero-runtime overhead.",
    docsUrl: "https://tailwindcss.com",
    icon: "M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z",
    color: "from-teal-500/20 to-cyan-500/20 border-teal-500/30",
  },
  {
    name: "Radix UI",
    category: "UI & Styling",
    description:
      "Unstyled, accessible UI primitives for building high-quality design systems.",
    docsUrl: "https://www.radix-ui.com",
    icon: "M11.5 2.25a9.25 9.25 0 100 18.5 9.25 9.25 0 000-18.5zM2 11.5a9.5 9.5 0 1119 0 9.5 9.5 0 01-19 0zm9-4.25a4.25 4.25 0 100 8.5h.25V7.25H11z",
    color: "from-violet-500/20 to-purple-500/20 border-violet-500/30",
  },
  {
    name: "Motion",
    category: "UI & Styling",
    description:
      "Production-ready animation library for React with declarative, physics-based animations.",
    docsUrl: "https://motion.dev",
    icon: "M12 2a10 10 0 110 20A10 10 0 0112 2zm0 2a8 8 0 100 16A8 8 0 0012 4zm-1 3h2v6.586l3.707 3.707-1.414 1.414L11 14.414V7z",
    color: "from-rose-500/20 to-pink-500/20 border-rose-500/30",
  },
  {
    name: "TanStack Query",
    category: "Tooling & State",
    description:
      "Powerful async state management with automatic caching, background refetching, and stale-while-revalidate.",
    docsUrl: "https://tanstack.com/query",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
    color: "from-orange-500/20 to-red-500/20 border-orange-500/30",
  },
  {
    name: "React Hook Form",
    category: "Tooling & State",
    description:
      "Performant, flexible form management with minimal re-renders and built-in validation.",
    docsUrl: "https://react-hook-form.com",
    icon: "M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z",
    color: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
  },
  {
    name: "React Router v7",
    category: "Tooling & State",
    description:
      "Declarative client-side routing for React with nested routes and loader patterns.",
    docsUrl: "https://reactrouter.com",
    icon: "M12 2a10 10 0 110 20A10 10 0 0112 2zm0 2a8 8 0 100 16A8 8 0 0012 4zm-2 4l6 4-6 4V8z",
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
        className="size-8 shrink-0"
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <svg
          aria-hidden="true"
          className="size-full text-foreground/80"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d={item.icon} />
        </svg>
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
