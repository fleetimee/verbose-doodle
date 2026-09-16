import { ArrowUpRightIcon, Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import { Grid2X2 } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  DEVELOPER_TOOL_CATEGORIES,
  DEVELOPER_TOOL_COUNT,
  type DeveloperToolCategory,
  type DeveloperToolDefinition,
  getDeveloperToolHref,
} from "@/features/developer-tools/catalog";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { formatMessage, formatPluralMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type CatalogView = "grid" | "list";
type CatalogCategory = DeveloperToolCategory["id"] | typeof ALL_CATEGORIES;

type CatalogEntry = {
  readonly category: DeveloperToolCategory;
  readonly tool: DeveloperToolDefinition;
};

const ALL_CATEGORIES = "all" as const;
const catalogEntries: readonly CatalogEntry[] =
  DEVELOPER_TOOL_CATEGORIES.flatMap((category) =>
    category.tools.map((tool) => ({ category, tool }))
  );

const parentVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const childVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    transition: { bounce: 0.06, duration: 0.28, type: "spring" as const },
    y: 0,
  },
};

const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const cardEntranceVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    transition: { bounce: 0.06, duration: 0.28, type: "spring" as const },
    y: 0,
  },
};

function ToolCard({
  category,
  tool,
  view,
}: CatalogEntry & { readonly view: CatalogView }) {
  useI18n();
  const Icon = tool.icon;
  const CategoryIcon = category.icon;
  const isGrid = view === "grid";
  const shouldReduceMotion = useReducedMotion();

  if (!isGrid) {
    return (
      <motion.article
        className="group relative flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card/60 px-4 py-3 transition-all duration-200 hover:border-primary/40 hover:bg-card hover:shadow-xs"
        transition={{ damping: 30, stiffness: 400, type: "spring" }}
        variants={cardEntranceVariants}
        whileHover={shouldReduceMotion ? {} : { x: 2 }}
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-foreground transition-colors duration-200 group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary">
            <Icon className="size-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold text-foreground text-sm tracking-tight transition-colors group-hover:text-primary">
                {tool.name}
              </h3>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border/40 bg-muted/30 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                <CategoryIcon className="size-2.5" />
                {category.name}
              </span>
            </div>
            <p className="max-w-[75ch] truncate text-muted-foreground text-xs">
              {tool.searchDescription}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <div className="hidden font-mono text-[10px] text-muted-foreground/70 uppercase tracking-wider sm:block">
            {tool.runtime}
          </div>
          <div className="flex size-7 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-all duration-200 group-hover:border-border/60 group-hover:bg-muted/50 group-hover:text-foreground">
            <HugeiconsIcon
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              icon={ArrowUpRightIcon}
              strokeWidth={2}
            />
          </div>
        </div>

        <Link
          aria-label={formatMessage(messages.developerTools.openTool, {
            tool: tool.name,
          })}
          className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          to={getDeveloperToolHref(tool)}
        >
          <span className="sr-only">
            {formatMessage(messages.developerTools.openTool, {
              tool: tool.name,
            })}
          </span>
        </Link>
      </motion.article>
    );
  }

  return (
    <motion.article
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card/60 p-4 transition-all duration-200 hover:border-primary/40 hover:bg-card hover:shadow-md"
      transition={{ damping: 30, stiffness: 400, type: "spring" }}
      variants={cardEntranceVariants}
      whileHover={shouldReduceMotion ? {} : { scale: 1.012, y: -2 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-foreground transition-colors duration-200 group-hover:border-primary/30 group-hover:bg-primary/10 group-hover:text-primary">
            <Icon className="size-5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md border border-border/40 bg-muted/30 px-2 py-0.5 font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
              <CategoryIcon className="size-2.5" />
              {category.name}
            </span>
            <div className="flex size-7 items-center justify-center rounded-md border border-transparent text-muted-foreground/60 transition-all duration-200 group-hover:border-border/60 group-hover:bg-muted/50 group-hover:text-foreground">
              <HugeiconsIcon
                className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                icon={ArrowUpRightIcon}
                strokeWidth={2}
              />
            </div>
          </div>
        </div>

        <div className="mt-3.5">
          <h3 className="line-clamp-1 font-semibold text-[15px] text-foreground tracking-tight transition-colors group-hover:text-primary">
            {tool.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-relaxed">
            {tool.searchDescription}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-border/40 border-t pt-2.5 font-mono text-[10px] text-muted-foreground/70 uppercase tracking-wider">
        <span>{tool.runtime}</span>
        <span className="opacity-75">{tool.limit}</span>
      </div>

      <Link
        aria-label={formatMessage(messages.developerTools.openTool, {
          tool: tool.name,
        })}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        to={getDeveloperToolHref(tool)}
      >
        <span className="sr-only">
          {formatMessage(messages.developerTools.openTool, {
            tool: tool.name,
          })}
        </span>
      </Link>
    </motion.article>
  );
}

export function DeveloperToolsCatalog() {
  useI18n();
  const shouldReduceMotion = useReducedMotion();
  const [selectedCategory, setSelectedCategory] =
    useLocalStorage<CatalogCategory>(
      "developer-tools-category",
      ALL_CATEGORIES
    );
  const [view, setView] = useLocalStorage<CatalogView>(
    "developer-tools-view-mode",
    "grid"
  );
  const activeView: CatalogView = view === "list" ? "list" : "grid";
  const activeCategory =
    selectedCategory === ALL_CATEGORIES ||
    DEVELOPER_TOOL_CATEGORIES.some(
      (category) => category.id === selectedCategory
    )
      ? selectedCategory
      : ALL_CATEGORIES;
  const visibleEntries =
    activeCategory === ALL_CATEGORIES
      ? catalogEntries
      : catalogEntries.filter((entry) => entry.category.id === activeCategory);

  return (
    <motion.div
      animate="visible"
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 pb-8"
      initial={shouldReduceMotion ? "visible" : "hidden"}
      variants={parentVariants}
    >
      <motion.header
        className="flex flex-col gap-1.5 border-border/60 border-b pb-5"
        variants={childVariants}
      >
        <h1 className="font-semibold text-2xl tracking-[-0.03em] md:text-3xl">
          {messages.developerTools.pageTitle}
        </h1>
        <p className="text-muted-foreground text-sm">
          {messages.developerTools.description}
        </p>
      </motion.header>

      <motion.section
        aria-label={messages.developerTools.catalogControls}
        className="flex flex-col gap-3 rounded-lg border border-border/50 bg-muted/20 p-1.5 sm:flex-row sm:items-center sm:justify-between"
        variants={childVariants}
      >
        <div className="flex flex-wrap items-center gap-1">
          <Button
            aria-label={messages.developerTools.allTools}
            aria-pressed={activeCategory === ALL_CATEGORIES}
            onClick={() => setSelectedCategory(ALL_CATEGORIES)}
            size="tab-sm"
            type="button"
            variant={
              activeCategory === ALL_CATEGORIES ? "segment-active" : "ghost"
            }
          >
            {messages.developerTools.allTools}
            <span
              aria-hidden="true"
              className="ml-1 font-mono text-[10px] opacity-60"
            >
              {DEVELOPER_TOOL_COUNT}
            </span>
          </Button>
          {DEVELOPER_TOOL_CATEGORIES.map((category) => (
            <Button
              aria-label={category.name}
              aria-pressed={activeCategory === category.id}
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              size="tab-sm"
              type="button"
              variant={
                activeCategory === category.id ? "segment-active" : "ghost"
              }
            >
              {category.name}
              <span
                aria-hidden="true"
                className="ml-1 font-mono text-[10px] opacity-60"
              >
                {category.tools.length}
              </span>
            </Button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 px-1 sm:justify-end">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            {formatPluralMessage(
              messages.developerTools.showingCount,
              visibleEntries.length
            )}
          </span>
          <div className="flex items-center gap-0.5 border-border/50 border-l pl-2">
            <Button
              aria-label={messages.developerTools.gridView}
              aria-pressed={activeView === "grid"}
              onClick={() => setView("grid")}
              size="icon-7"
              type="button"
              variant={activeView === "grid" ? "segment-active" : "ghost"}
            >
              <Grid2X2 className="size-3.5" />
            </Button>
            <Button
              aria-label={messages.developerTools.listView}
              aria-pressed={activeView === "list"}
              onClick={() => setView("list")}
              size="icon-7"
              type="button"
              variant={activeView === "list" ? "segment-active" : "ghost"}
            >
              <HugeiconsIcon
                className="size-3.5"
                icon={Menu01Icon}
                strokeWidth={2}
              />
            </Button>
          </div>
        </div>
      </motion.section>

      <motion.div
        className={cn(
          "grid gap-3.5",
          activeView === "grid"
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
        )}
        key={`${activeCategory}-${activeView}`}
        variants={gridContainerVariants}
      >
        {visibleEntries.map((entry) => (
          <ToolCard
            category={entry.category}
            key={entry.tool.id}
            tool={entry.tool}
            view={activeView}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
