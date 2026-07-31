import { ArrowUpRightIcon, Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import { Grid2X2 } from "@/components/hugeicons";
import { Button, buttonVariants } from "@/components/ui/button";
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
  visible: { transition: { staggerChildren: 0.08 } },
};

const childVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    transition: { bounce: 0.08, duration: 0.32, type: "spring" as const },
    y: 0,
  },
};

const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
    },
  },
};

const cardEntranceVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    transition: { bounce: 0.08, duration: 0.32, type: "spring" as const },
    y: 0,
  },
};

function ToolCard({
  category,
  tool,
  view,
}: CatalogEntry & { readonly view: CatalogView }) {
  const Icon = tool.icon;
  const CategoryIcon = category.icon;
  const isGrid = view === "grid";
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      className={cn(
        "group min-w-0 gap-5 bg-background transition-colors hover:bg-muted/20",
        isGrid
          ? "flex h-full flex-col border p-5"
          : "grid border-y px-4 py-5 sm:px-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-7"
      )}
      transition={{ damping: 30, stiffness: 400, type: "spring" }}
      variants={cardEntranceVariants}
      whileHover={shouldReduceMotion ? {} : { scale: 1.012, y: -2 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.985 }}
    >
      <div
        className={cn(
          "flex items-center",
          isGrid ? "justify-between" : "gap-3 lg:flex-col lg:items-start"
        )}
      >
        <div className="flex size-11 items-center justify-center rounded-md border bg-muted/30 text-foreground transition-transform duration-200 group-hover:-translate-y-0.5">
          <Icon className="size-5" />
        </div>
        <span className="inline-flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
          <CategoryIcon className="size-3" />
          {category.name}
        </span>
      </div>

      <div className={cn("min-w-0", isGrid && "flex-1")}>
        <h3 className="font-semibold text-lg tracking-[-0.02em]">
          {tool.name}
        </h3>
        <p className="mt-2 max-w-[68ch] text-muted-foreground text-sm leading-6">
          {tool.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tool.tags.map((tag) => (
            <span
              className="border px-2 py-1 font-mono text-[9px] text-muted-foreground uppercase tracking-wider"
              key={tag}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "flex items-center justify-between gap-5 border-t pt-4",
          !isGrid &&
            "lg:min-w-44 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0"
        )}
      >
        <div className="grid gap-1 text-right font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          <div>{tool.runtime}</div>
          <div>{tool.limit}</div>
        </div>
        <Link
          aria-label={formatMessage(messages.developerTools.openTool, {
            tool: tool.name,
          })}
          className={buttonVariants({ size: "sm", variant: "outline" })}
          to={getDeveloperToolHref(tool)}
        >
          {messages.developerTools.openAction}
          <HugeiconsIcon
            data-icon="inline-end"
            icon={ArrowUpRightIcon}
            strokeWidth={2}
          />
        </Link>
      </div>
    </motion.article>
  );
}

export function DeveloperToolsCatalog() {
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
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-10 pb-10"
      initial={shouldReduceMotion ? "visible" : "hidden"}
      variants={parentVariants}
    >
      <motion.header
        className="grid gap-6 border-border/70 border-b pb-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end"
        variants={childVariants}
      >
        <div>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.24em]">
            {formatPluralMessage(
              messages.developerTools.eyebrow,
              DEVELOPER_TOOL_COUNT
            )}
          </p>
          <h1 className="mt-4 font-semibold text-4xl tracking-[-0.045em] md:text-5xl">
            {messages.developerTools.pageTitle}
          </h1>
          <p className="mt-4 max-w-[62ch] text-muted-foreground text-sm leading-6 md:text-base">
            {messages.developerTools.description}
          </p>
        </div>

        <dl className="grid min-w-64 grid-cols-2 border-y text-xs">
          <div className="border-r py-3 pr-4">
            <dt className="text-muted-foreground">
              {messages.developerTools.accessLabel}
            </dt>
            <dd className="mt-1 font-mono">
              {messages.developerTools.accessValue}
            </dd>
          </div>
          <div className="py-3 pl-4">
            <dt className="text-muted-foreground">
              {messages.developerTools.filesLabel}
            </dt>
            <dd className="mt-1 font-mono">
              {messages.developerTools.filesValue}
            </dd>
          </div>
        </dl>
      </motion.header>

      <motion.section
        aria-label={messages.developerTools.catalogControls}
        className="flex flex-col gap-3 border-y py-3 sm:flex-row sm:items-center sm:justify-between"
        variants={childVariants}
      >
        <div className="flex flex-wrap gap-1.5">
          <Button
            aria-label={messages.developerTools.allTools}
            aria-pressed={activeCategory === ALL_CATEGORIES}
            onClick={() => setSelectedCategory(ALL_CATEGORIES)}
            size="sm"
            type="button"
            variant={activeCategory === ALL_CATEGORIES ? "secondary" : "ghost"}
          >
            {messages.developerTools.allTools}
            <span
              aria-hidden="true"
              className="font-mono text-[10px] opacity-60"
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
              size="sm"
              type="button"
              variant={activeCategory === category.id ? "secondary" : "ghost"}
            >
              {category.name}
              <span
                aria-hidden="true"
                className="font-mono text-[10px] opacity-60"
              >
                {category.tools.length}
              </span>
            </Button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            {formatPluralMessage(
              messages.developerTools.showingCount,
              visibleEntries.length
            )}
          </span>
          <div className="flex gap-1 border-l pl-3">
            <Button
              aria-label={messages.developerTools.gridView}
              aria-pressed={activeView === "grid"}
              onClick={() => setView("grid")}
              size="icon-sm"
              type="button"
              variant={activeView === "grid" ? "secondary" : "ghost"}
            >
              <Grid2X2 />
            </Button>
            <Button
              aria-label={messages.developerTools.listView}
              aria-pressed={activeView === "list"}
              onClick={() => setView("list")}
              size="icon-sm"
              type="button"
              variant={activeView === "list" ? "secondary" : "ghost"}
            >
              <HugeiconsIcon icon={Menu01Icon} strokeWidth={2} />
            </Button>
          </div>
        </div>
      </motion.section>

      <motion.div
        className={cn("grid gap-4", activeView === "grid" && "md:grid-cols-2")}
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
