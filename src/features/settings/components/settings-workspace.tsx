import { Menu01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import {
  Check,
  Globe,
  Grid2X2,
  Moon,
  RotateCcw,
  SlidersHorizontal,
  Sun,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import {
  COLOR_SCHEME_IDS,
  type ColorScheme,
  getDefaultColorScheme,
  SEASONAL_COLOR_SCHEME_IDS,
  SOFT_DARK_COLOR_SCHEME_IDS,
  STUDIO_COLOR_SCHEME_IDS,
  type Theme,
  useTheme,
} from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { type AppLocale, formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type SchemeCategory = "all" | "soft-dark" | "studio" | "seasonal";
type SchemeView = "grid" | "list";

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

function isSoftDarkScheme(schemeId: ColorScheme): boolean {
  return SOFT_DARK_COLOR_SCHEME_IDS.some((id) => id === schemeId);
}

function isSeasonalScheme(schemeId: ColorScheme): boolean {
  return SEASONAL_COLOR_SCHEME_IDS.some((id) => id === schemeId);
}

function getSchemeCategoryLabel(
  schemeId: ColorScheme,
  copy: typeof messages.theme.settings
): string {
  if (isSeasonalScheme(schemeId)) {
    return copy.colorSchemeSeasonalFilter;
  }
  if (isSoftDarkScheme(schemeId)) {
    return copy.colorSchemeSoftDarkFilter;
  }
  return copy.colorSchemeStudioFilter;
}

function SchemeSwatchPills({
  schemeId,
  lightLabel,
  darkLabel,
  compact = false,
}: {
  readonly schemeId: ColorScheme;
  readonly lightLabel: string;
  readonly darkLabel: string;
  readonly compact?: boolean;
}) {
  if (compact) {
    return (
      <div
        aria-hidden="true"
        className="flex shrink-0 items-center gap-1.5"
        data-scheme-swatch={schemeId}
      >
        <div className="scheme-swatch-bg-light flex items-center gap-1 rounded-md border border-border/50 px-1.5 py-1">
          <span className="scheme-swatch-primary-light size-2 rounded-full" />
          <span className="scheme-swatch-surface-light h-2 w-4 rounded-xs border border-border/40" />
        </div>
        <div className="scheme-swatch-bg-dark flex items-center gap-1 rounded-md border border-border/50 px-1.5 py-1">
          <span className="scheme-swatch-primary-dark size-2 rounded-full" />
          <span className="scheme-swatch-surface-dark h-2 w-4 rounded-xs border border-border/40" />
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-2 gap-1.5"
      data-scheme-swatch={schemeId}
    >
      <div className="scheme-swatch-bg-light flex items-center justify-between gap-2 rounded-md border border-border/50 px-2 py-1">
        <span className="font-mono text-log text-muted-foreground uppercase tracking-wider">
          {lightLabel}
        </span>
        <div className="scheme-swatch-surface-light flex items-center gap-1 rounded-xs border border-border/40 px-1 py-0.5">
          <span className="scheme-swatch-primary-light size-2 rounded-full" />
          <span className="scheme-swatch-accent-light h-1.5 w-3.5 rounded-xs" />
        </div>
      </div>

      <div className="scheme-swatch-bg-dark flex items-center justify-between gap-2 rounded-md border border-border/50 px-2 py-1">
        <span className="font-mono text-log text-muted-foreground uppercase tracking-wider">
          {darkLabel}
        </span>
        <div className="scheme-swatch-surface-dark flex items-center gap-1 rounded-xs border border-border/40 px-1 py-0.5">
          <span className="scheme-swatch-primary-dark size-2 rounded-full" />
          <span className="scheme-swatch-accent-dark h-1.5 w-3.5 rounded-xs" />
        </div>
      </div>
    </div>
  );
}

function SchemeStatusBadges({
  isSeasonal,
  isDefault,
  snowLabel,
  defaultLabel,
}: {
  readonly isSeasonal: boolean;
  readonly isDefault: boolean;
  readonly snowLabel: string;
  readonly defaultLabel: string;
}) {
  return (
    <>
      {isSeasonal && (
        <Badge radius="rounded" size="xs" variant="primary-subtle">
          {snowLabel}
        </Badge>
      )}
      {isDefault && (
        <Badge radius="rounded" size="xs" variant="muted">
          {defaultLabel}
        </Badge>
      )}
    </>
  );
}

function SchemeCard({
  schemeId,
  selectedScheme,
  defaultScheme,
  view,
  onSelect,
}: {
  readonly schemeId: ColorScheme;
  readonly selectedScheme: ColorScheme;
  readonly defaultScheme: ColorScheme;
  readonly view: SchemeView;
  readonly onSelect: (scheme: ColorScheme) => void;
}) {
  useI18n();
  const shouldReduceMotion = useReducedMotion();
  const copy = messages.theme.settings;
  const schemeCopy = copy.schemes[schemeId];
  const isSelected = selectedScheme === schemeId;
  const isDefault = schemeId === defaultScheme;
  const isSeasonal = isSeasonalScheme(schemeId);
  const categoryLabel = getSchemeCategoryLabel(schemeId, copy);

  if (view === "list") {
    return (
      <motion.article
        className={cn(
          "group relative flex items-center justify-between gap-4 rounded-xl border px-4 py-2.5 transition-all duration-200",
          isSelected
            ? "border-primary/60 bg-primary/5 shadow-xs"
            : "border-border/60 bg-card/60 hover:border-primary/40 hover:bg-card hover:shadow-xs"
        )}
        data-scheme-swatch={schemeId}
        data-selected={isSelected}
        transition={{ damping: 30, stiffness: 400, type: "spring" }}
        variants={cardEntranceVariants}
        whileHover={shouldReduceMotion ? {} : { x: 2 }}
      >
        <div className="flex min-w-0 items-center gap-3.5">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200",
              isSelected
                ? "border-primary/40 bg-primary/15"
                : "border-border/60 bg-muted/40 group-hover:border-primary/30 group-hover:bg-primary/10"
            )}
          >
            <span className="scheme-swatch-primary-adaptive size-4 rounded-full border border-border/50 shadow-2xs" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={cn(
                  "truncate font-semibold text-sm tracking-tight transition-colors",
                  isSelected
                    ? "text-primary"
                    : "text-foreground group-hover:text-primary"
                )}
              >
                {schemeCopy.name}
              </h3>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-border/40 bg-muted/30 px-1.5 py-0.5 font-mono text-log text-muted-foreground uppercase tracking-wider">
                {categoryLabel}
              </span>
              <SchemeStatusBadges
                defaultLabel={copy.colorSchemeDefaultBadge}
                isDefault={isDefault}
                isSeasonal={isSeasonal}
                snowLabel={copy.colorSchemeSnowBadge}
              />
            </div>
            <p className="max-w-[75ch] truncate text-muted-foreground text-xs">
              {schemeCopy.description}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden font-mono text-muted-foreground/70 text-xs uppercase tracking-wider md:block">
            {schemeCopy.badge}
          </div>
          <SchemeSwatchPills
            compact
            darkLabel={copy.colorSchemeDarkPreview}
            lightLabel={copy.colorSchemeLightPreview}
            schemeId={schemeId}
          />
          <div
            className={cn(
              "flex size-7 items-center justify-center rounded-md border transition-all duration-200",
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-transparent text-muted-foreground/50 group-hover:border-border/60 group-hover:bg-muted/50 group-hover:text-foreground"
            )}
          >
            <Check className="size-3.5" />
          </div>
        </div>

        <button
          aria-label={schemeCopy.name}
          aria-pressed={isSelected}
          className="absolute inset-0 z-10 cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          data-testid={`color-scheme-option-${schemeId}`}
          onClick={() => onSelect(schemeId)}
          type="button"
        >
          <span className="sr-only">{schemeCopy.name}</span>
        </button>
      </motion.article>
    );
  }

  return (
    <motion.article
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-xl border p-3.5 transition-all duration-200",
        isSelected
          ? "border-primary/60 bg-primary/5 shadow-xs"
          : "border-border/60 bg-card/60 hover:border-primary/40 hover:bg-card hover:shadow-md"
      )}
      data-scheme-swatch={schemeId}
      data-selected={isSelected}
      transition={{ damping: 30, stiffness: 400, type: "spring" }}
      variants={cardEntranceVariants}
      whileHover={shouldReduceMotion ? {} : { scale: 1.01, y: -2 }}
      whileTap={shouldReduceMotion ? {} : { scale: 0.99 }}
    >
      <div>
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg border transition-colors duration-200",
                isSelected
                  ? "border-primary/40 bg-primary/15"
                  : "border-border/60 bg-muted/40 group-hover:border-primary/30 group-hover:bg-primary/10"
              )}
            >
              <span className="scheme-swatch-primary-adaptive size-3.5 rounded-full border border-border/50 shadow-2xs" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3
                  className={cn(
                    "truncate font-semibold text-sm tracking-tight transition-colors",
                    isSelected
                      ? "text-primary"
                      : "text-foreground group-hover:text-primary"
                  )}
                >
                  {schemeCopy.name}
                </h3>
                <SchemeStatusBadges
                  defaultLabel={copy.colorSchemeDefaultBadge}
                  isDefault={isDefault}
                  isSeasonal={isSeasonal}
                  snowLabel={copy.colorSchemeSnowBadge}
                />
              </div>
              <span className="block truncate font-mono text-muted-foreground text-xs">
                {schemeCopy.badge}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <span className="inline-flex items-center rounded-md border border-border/40 bg-muted/30 px-1.5 py-0.5 font-mono text-log text-muted-foreground uppercase tracking-wider">
              {categoryLabel}
            </span>
            <div
              className={cn(
                "flex size-6 items-center justify-center rounded-md border transition-all duration-200",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-transparent text-muted-foreground/40 group-hover:border-border/60 group-hover:bg-muted/50 group-hover:text-foreground"
              )}
            >
              <Check className="size-3.5" />
            </div>
          </div>
        </div>

        <p className="mt-2.5 line-clamp-2 text-muted-foreground text-xs leading-relaxed">
          {schemeCopy.description}
        </p>
      </div>

      <div className="mt-3 border-border/40 border-t pt-2.5">
        <SchemeSwatchPills
          darkLabel={copy.colorSchemeDarkPreview}
          lightLabel={copy.colorSchemeLightPreview}
          schemeId={schemeId}
        />
      </div>

      <button
        aria-label={schemeCopy.name}
        aria-pressed={isSelected}
        className="absolute inset-0 z-10 cursor-pointer rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        data-testid={`color-scheme-option-${schemeId}`}
        onClick={() => onSelect(schemeId)}
        type="button"
      >
        <span className="sr-only">{schemeCopy.name}</span>
      </button>
    </motion.article>
  );
}

function getVisibleSchemes(category: SchemeCategory): readonly ColorScheme[] {
  if (category === "soft-dark") {
    return SOFT_DARK_COLOR_SCHEME_IDS;
  }
  if (category === "studio") {
    return STUDIO_COLOR_SCHEME_IDS;
  }
  if (category === "seasonal") {
    return SEASONAL_COLOR_SCHEME_IDS;
  }
  return COLOR_SCHEME_IDS;
}

export function SettingsWorkspace() {
  const { locale, setLocale } = useI18n();
  const { theme, setTheme, colorScheme, setColorScheme, resetColorScheme } =
    useTheme();
  const shouldReduceMotion = useReducedMotion();
  const copy = messages.theme.settings;
  const defaultScheme = getDefaultColorScheme();

  const [selectedCategory, setSelectedCategory] =
    useLocalStorage<SchemeCategory>("settings-scheme-category", "all");
  const [view, setView] = useLocalStorage<SchemeView>(
    "settings-scheme-view-mode",
    "grid"
  );

  const activeCategory: SchemeCategory =
    selectedCategory === "soft-dark" ||
    selectedCategory === "studio" ||
    selectedCategory === "seasonal"
      ? selectedCategory
      : "all";
  const activeView: SchemeView = view === "list" ? "list" : "grid";

  const visibleSchemes = getVisibleSchemes(activeCategory);

  const handleSelectColorScheme = (nextScheme: ColorScheme) => {
    if (nextScheme === colorScheme) {
      return;
    }
    setColorScheme(nextScheme);
  };

  const handleSelectTheme = (nextTheme: Theme) => {
    if (nextTheme === theme) {
      return;
    }
    if (shouldReduceMotion || !document.startViewTransition) {
      setTheme(nextTheme);
      return;
    }
    document.startViewTransition(() => {
      setTheme(nextTheme);
    });
  };

  const handleResetDefaults = () => {
    resetColorScheme();
    toast.success(copy.resetSuccess);
  };

  const appearanceModes: {
    readonly id: Theme;
    readonly label: string;
    readonly icon: typeof Sun;
  }[] = [
    { id: "light", label: messages.theme.light, icon: Sun },
    { id: "dark", label: messages.theme.dark, icon: Moon },
    { id: "system", label: messages.theme.system, icon: SlidersHorizontal },
  ];

  const languageOptions: {
    readonly id: AppLocale;
    readonly code: string;
    readonly label: string;
  }[] = [
    { id: "en-US", code: "EN", label: messages.common.languageEnglish },
    { id: "id-ID", code: "ID", label: messages.common.languageIndonesian },
  ];

  return (
    <motion.div
      animate="visible"
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-5 pb-6"
      initial={shouldReduceMotion ? "visible" : "hidden"}
      variants={parentVariants}
    >
      <motion.header
        className="flex flex-col gap-3 border-border/60 border-b pb-4 lg:flex-row lg:items-center lg:justify-between"
        variants={childVariants}
      >
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
              {copy.title}
            </h1>
            <Badge mono size="sm" variant="primary-subtle">
              {copy.schemes[colorScheme].name}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{copy.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <fieldset
            aria-label={copy.appearanceModeTitle}
            className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/20 p-1"
          >
            {appearanceModes.map((mode) => {
              const Icon = mode.icon;
              const isSelected = theme === mode.id;
              return (
                <Button
                  aria-pressed={isSelected}
                  key={mode.id}
                  onClick={() => handleSelectTheme(mode.id)}
                  size="tab-sm"
                  type="button"
                  variant={isSelected ? "segment-active" : "ghost"}
                >
                  <Icon className="size-3.5" />
                  <span>{mode.label}</span>
                </Button>
              );
            })}
          </fieldset>

          <fieldset
            aria-label={copy.languageTitle}
            className="flex items-center gap-0.5 rounded-lg border border-border/50 bg-muted/20 p-1"
          >
            {languageOptions.map((option) => {
              const isSelected = locale === option.id;
              return (
                <Button
                  aria-label={option.label}
                  aria-pressed={isSelected}
                  key={option.id}
                  onClick={() => setLocale(option.id)}
                  size="tab-sm"
                  type="button"
                  variant={isSelected ? "segment-active" : "ghost"}
                >
                  <Globe className="size-3.5" />
                  <span>{option.code}</span>
                </Button>
              );
            })}
          </fieldset>

          <Button
            disabled={colorScheme === defaultScheme}
            onClick={handleResetDefaults}
            size="sm"
            type="button"
            variant="outline"
          >
            <RotateCcw data-icon="inline-start" />
            {copy.resetDefaults}
          </Button>
        </div>
      </motion.header>

      <motion.section
        aria-label={copy.colorSchemeTitle}
        className="flex flex-col gap-3 rounded-lg border border-border/50 bg-muted/20 p-1.5 sm:flex-row sm:items-center sm:justify-between"
        variants={childVariants}
      >
        <div className="flex flex-wrap items-center gap-1">
          <Button
            aria-pressed={activeCategory === "all"}
            onClick={() => setSelectedCategory("all")}
            size="tab-sm"
            type="button"
            variant={activeCategory === "all" ? "segment-active" : "ghost"}
          >
            {copy.colorSchemeAllFilter}
            <span
              aria-hidden="true"
              className="ml-1 font-mono text-xs opacity-60"
            >
              {COLOR_SCHEME_IDS.length}
            </span>
          </Button>
          <Button
            aria-pressed={activeCategory === "soft-dark"}
            onClick={() => setSelectedCategory("soft-dark")}
            size="tab-sm"
            type="button"
            variant={
              activeCategory === "soft-dark" ? "segment-active" : "ghost"
            }
          >
            {copy.colorSchemeSoftDarkFilter}
            <span
              aria-hidden="true"
              className="ml-1 font-mono text-xs opacity-60"
            >
              {SOFT_DARK_COLOR_SCHEME_IDS.length}
            </span>
          </Button>
          <Button
            aria-pressed={activeCategory === "studio"}
            onClick={() => setSelectedCategory("studio")}
            size="tab-sm"
            type="button"
            variant={activeCategory === "studio" ? "segment-active" : "ghost"}
          >
            {copy.colorSchemeStudioFilter}
            <span
              aria-hidden="true"
              className="ml-1 font-mono text-xs opacity-60"
            >
              {STUDIO_COLOR_SCHEME_IDS.length}
            </span>
          </Button>
          <Button
            aria-pressed={activeCategory === "seasonal"}
            onClick={() => setSelectedCategory("seasonal")}
            size="tab-sm"
            type="button"
            variant={activeCategory === "seasonal" ? "segment-active" : "ghost"}
          >
            {copy.colorSchemeSeasonalFilter}
            <span
              aria-hidden="true"
              className="ml-1 font-mono text-xs opacity-60"
            >
              {SEASONAL_COLOR_SCHEME_IDS.length}
            </span>
          </Button>
        </div>

        <div className="flex items-center justify-between gap-3 px-1 sm:justify-end">
          <span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
            {formatMessage(copy.colorSchemeShowingCount, {
              count: String(visibleSchemes.length),
            })}
          </span>
          <div className="flex items-center gap-0.5 border-border/50 border-l pl-2">
            <Button
              aria-label={copy.colorSchemeGridView}
              aria-pressed={activeView === "grid"}
              onClick={() => setView("grid")}
              size="icon-7"
              type="button"
              variant={activeView === "grid" ? "segment-active" : "ghost"}
            >
              <Grid2X2 className="size-3.5" />
            </Button>
            <Button
              aria-label={copy.colorSchemeListView}
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
        {visibleSchemes.map((schemeId) => (
          <SchemeCard
            defaultScheme={defaultScheme}
            key={schemeId}
            onSelect={handleSelectColorScheme}
            schemeId={schemeId}
            selectedScheme={colorScheme}
            view={activeView}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
