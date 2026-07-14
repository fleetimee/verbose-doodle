import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import {
  DEVELOPER_TOOL_CATEGORIES,
  DEVELOPER_TOOL_COUNT,
  type DeveloperToolDefinition,
} from "@/features/developer-tools/catalog";
import { formatMessage, formatPluralMessage, messages } from "@/lib/i18n";

const parentVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const childVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 100, damping: 20 },
  },
};

function ToolCard({ tool }: { readonly tool: DeveloperToolDefinition }) {
  const Icon = tool.icon;

  return (
    <article className="group grid min-w-0 gap-5 border-y bg-background px-4 py-5 transition-colors hover:bg-muted/20 sm:px-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-7">
      <div className="flex size-11 items-center justify-center rounded-md border bg-muted/30 text-foreground transition-transform duration-200 group-hover:-translate-y-0.5">
        <Icon className="size-5" />
      </div>

      <div className="min-w-0">
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

      <div className="flex items-center justify-between gap-5 border-t pt-4 lg:min-w-44 lg:flex-col lg:items-end lg:border-t-0 lg:pt-0">
        <div className="grid gap-1 text-right font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          <div>{tool.runtime}</div>
          <div>{tool.limit}</div>
        </div>
        <Link
          aria-label={formatMessage(messages.developerTools.openTool, {
            tool: tool.name,
          })}
          className={buttonVariants({ size: "sm", variant: "outline" })}
          to={tool.href}
        >
          {messages.developerTools.openAction}
          <ArrowUpRight data-icon="inline-end" />
        </Link>
      </div>
    </article>
  );
}

export function DeveloperToolsCatalog() {
  const shouldReduceMotion = useReducedMotion();

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

      <div className="grid gap-12">
        {DEVELOPER_TOOL_CATEGORIES.map((category) => {
          const CategoryIcon = category.icon;
          return (
            <motion.section
              className="grid gap-5 md:grid-cols-[190px_minmax(0,1fr)] md:gap-8"
              key={category.name}
              variants={childVariants}
            >
              <header className="md:pt-5">
                <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em]">
                  <span>{category.index}</span>
                  <span aria-hidden="true">/</span>
                  <span>
                    {formatPluralMessage(
                      messages.developerTools.categoryCount,
                      category.tools.length
                    )}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <CategoryIcon className="size-4" />
                  <h2 className="font-semibold text-xl tracking-[-0.025em]">
                    {category.name}
                  </h2>
                </div>
                <p className="mt-3 text-muted-foreground text-xs leading-5">
                  {category.description}
                </p>
              </header>

              <div className="grid gap-3">
                {category.tools.map((tool) => (
                  <ToolCard key={tool.href} tool={tool} />
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>
    </motion.div>
  );
}
