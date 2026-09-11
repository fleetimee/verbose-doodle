import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { Link, useInRouterContext } from "react-router";
import { Eraser, RotateCcw } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import { messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function CategoryBreadcrumb({
  className,
  href,
  label,
}: {
  readonly className: string;
  readonly href: string;
  readonly label: string;
}) {
  const inRouter = useInRouterContext();
  const content = (
    <span className="inline-flex items-center gap-1.5">
      <HugeiconsIcon
        className="size-3.5 transition-transform duration-200 group-hover:-translate-x-0.5"
        icon={ArrowLeft02Icon}
        strokeWidth={2}
      />
      <span>{label}</span>
    </span>
  );

  if (inRouter) {
    return (
      <Link className={className} to={href}>
        {content}
      </Link>
    );
  }
  return (
    <a className={className} href={href}>
      {content}
    </a>
  );
}

export type DeveloperToolLayoutVariant = "sidebar" | "top-header";

export type DeveloperToolLayoutProps = {
  readonly categoryHref?: string;
  readonly categoryLabel?: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly clearLabel?: string;
  readonly description?: ReactNode;
  readonly extraActions?: ReactNode;
  readonly headerExtra?: ReactNode;
  readonly mainClassName?: string;
  readonly onClear?: () => void;
  readonly onReset?: () => void;
  readonly resetLabel?: string;
  readonly title: string;
  readonly tour?: ReactNode;
  readonly variant?: DeveloperToolLayoutVariant;
};

export const developerToolParentVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

export const developerToolChildVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    transition: { bounce: 0.08, duration: 0.32, type: "spring" as const },
    y: 0,
  },
};

type ActionButtonsProps = {
  readonly clearLabel?: string;
  readonly extraActions?: ReactNode;
  readonly onClear?: () => void;
  readonly onReset?: () => void;
  readonly resetLabel?: string;
  readonly tour?: ReactNode;
  readonly variant?: "sidebar" | "top-header";
};

function ActionButtons({
  clearLabel,
  extraActions,
  onClear,
  onReset,
  resetLabel,
  tour,
  variant = "top-header",
}: ActionButtonsProps) {
  const hasActions = Boolean(
    tour || (onReset && resetLabel) || (onClear && clearLabel) || extraActions
  );

  if (!hasActions) {
    return null;
  }

  const isHeader = variant === "top-header";

  return (
    <>
      {tour}
      {onReset && resetLabel ? (
        <Button
          className={cn(
            "h-8 gap-2 font-normal text-muted-foreground text-xs transition-colors hover:text-foreground",
            isHeader ? "px-3" : "w-full justify-start px-2.5"
          )}
          onClick={onReset}
          size="sm"
          type="button"
          variant={isHeader ? "outline" : "ghost"}
        >
          <RotateCcw className="size-3.5 text-muted-foreground/70" />
          <span>{resetLabel}</span>
        </Button>
      ) : null}
      {extraActions}
      {onClear && clearLabel ? (
        <Button
          className={cn(
            "h-8 gap-2 font-normal text-muted-foreground text-xs transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive",
            isHeader ? "px-3" : "w-full justify-start px-2.5"
          )}
          onClick={onClear}
          size="sm"
          type="button"
          variant={isHeader ? "outline" : "ghost"}
        >
          <Eraser className="size-3.5 text-muted-foreground/70" />
          <span>{clearLabel}</span>
        </Button>
      ) : null}
    </>
  );
}

function TopHeaderLayout({
  actionProps,
  categoryHref,
  categoryLabel,
  children,
  className,
  description,
  headerExtra,
  mainClassName,
  shouldReduceMotion,
  title,
}: {
  readonly actionProps: ActionButtonsProps;
  readonly categoryHref: string;
  readonly categoryLabel: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly description?: ReactNode;
  readonly headerExtra?: ReactNode;
  readonly mainClassName?: string;
  readonly shouldReduceMotion: boolean | null;
  readonly title: string;
}) {
  return (
    <motion.div
      animate="visible"
      className={cn(
        "mx-auto flex w-full min-w-0 max-w-[1400px] flex-col gap-6 overflow-x-clip pb-12",
        className
      )}
      initial={shouldReduceMotion ? "visible" : "hidden"}
      variants={developerToolParentVariants}
    >
      <motion.header
        className="flex flex-col gap-5 border-border/40 border-b pb-6 lg:flex-row lg:items-end lg:justify-between"
        variants={developerToolChildVariants}
      >
        <div className="max-w-2xl">
          <CategoryBreadcrumb
            className="group inline-flex items-center gap-1.5 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground"
            href={categoryHref}
            label={categoryLabel}
          />
          <h1 className="mt-3 font-semibold text-2xl text-foreground tracking-tight sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2.5 max-w-[65ch] text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {headerExtra}
          <ActionButtons {...actionProps} variant="top-header" />
        </div>
      </motion.header>

      <main className={cn("min-w-0", mainClassName)}>{children}</main>
    </motion.div>
  );
}

function SidebarLayout({
  actionProps,
  categoryHref,
  categoryLabel,
  children,
  className,
  description,
  headerExtra,
  mainClassName,
  shouldReduceMotion,
  title,
}: {
  readonly actionProps: ActionButtonsProps;
  readonly categoryHref: string;
  readonly categoryLabel: string;
  readonly children: ReactNode;
  readonly className?: string;
  readonly description?: ReactNode;
  readonly headerExtra?: ReactNode;
  readonly mainClassName?: string;
  readonly shouldReduceMotion: boolean | null;
  readonly title: string;
}) {
  return (
    <motion.div
      animate="visible"
      className={cn(
        "mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 pb-12 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12",
        className
      )}
      initial={shouldReduceMotion ? "visible" : "hidden"}
      variants={developerToolParentVariants}
    >
      <motion.aside
        className="md:sticky md:top-6 md:self-start md:border-border/40 md:border-r md:pr-6 lg:pr-8"
        variants={developerToolChildVariants}
      >
        <CategoryBreadcrumb
          className="group inline-flex items-center gap-1.5 font-medium text-muted-foreground text-xs transition-colors hover:text-foreground"
          href={categoryHref}
          label={categoryLabel}
        />
        <h1 className="mt-3 font-semibold text-2xl text-foreground tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2.5 text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        ) : null}

        {headerExtra}

        <div className="mt-6 flex flex-col gap-1.5 border-border/40 border-t pt-4">
          <ActionButtons {...actionProps} variant="sidebar" />
        </div>
      </motion.aside>

      <main className={cn("min-w-0", mainClassName)}>{children}</main>
    </motion.div>
  );
}

export function DeveloperToolLayout({
  categoryHref = "/dashboard/developer-tools",
  categoryLabel = messages.developerTools.navigationGroup,
  children,
  className,
  clearLabel,
  description,
  extraActions,
  headerExtra,
  mainClassName,
  onClear,
  onReset,
  resetLabel,
  title,
  tour,
  variant = "top-header",
}: DeveloperToolLayoutProps) {
  const shouldReduceMotion = useReducedMotion();
  const actionProps: ActionButtonsProps = {
    clearLabel,
    extraActions,
    onClear,
    onReset,
    resetLabel,
    tour,
  };

  if (variant === "sidebar") {
    return (
      <SidebarLayout
        actionProps={actionProps}
        categoryHref={categoryHref}
        categoryLabel={categoryLabel}
        className={className}
        description={description}
        headerExtra={headerExtra}
        mainClassName={mainClassName}
        shouldReduceMotion={shouldReduceMotion}
        title={title}
      >
        {children}
      </SidebarLayout>
    );
  }

  return (
    <TopHeaderLayout
      actionProps={actionProps}
      categoryHref={categoryHref}
      categoryLabel={categoryLabel}
      className={className}
      description={description}
      headerExtra={headerExtra}
      mainClassName={mainClassName}
      shouldReduceMotion={shouldReduceMotion}
      title={title}
    >
      {children}
    </TopHeaderLayout>
  );
}
