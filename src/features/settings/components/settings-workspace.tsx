import { motion, useReducedMotion } from "motion/react";
import { toast } from "sonner";
import {
  Check,
  Globe,
  Moon,
  RotateCcw,
  SlidersHorizontal,
  Sun,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import {
  type ColorScheme,
  DEFAULT_COLOR_SCHEME,
  SOFT_DARK_COLOR_SCHEME_IDS,
  STUDIO_COLOR_SCHEME_IDS,
  type Theme,
  useTheme,
} from "@/components/theme-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type AppLocale, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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

function SchemeSwatchPreview({
  schemeId,
  lightLabel,
  darkLabel,
}: {
  readonly schemeId: ColorScheme;
  readonly lightLabel: string;
  readonly darkLabel: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-2 gap-2 rounded-lg border border-border/60 bg-muted/25 p-2"
      data-scheme-swatch={schemeId}
    >
      <div className="scheme-swatch-bg-light flex flex-col gap-1.5 rounded-md border border-border/50 p-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
            {lightLabel}
          </span>
          <span className="scheme-swatch-primary-light size-2.5 rounded-full" />
        </div>
        <div className="scheme-swatch-surface-light flex items-center gap-1.5 rounded-sm border border-border/40 p-1.5">
          <span className="scheme-swatch-primary-light h-2 w-6 rounded-xs" />
          <span className="scheme-swatch-accent-light h-2 flex-1 rounded-xs" />
        </div>
      </div>

      <div className="scheme-swatch-bg-dark flex flex-col gap-1.5 rounded-md border border-border/50 p-2">
        <div className="flex items-center justify-between">
          <span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
            {darkLabel}
          </span>
          <span className="scheme-swatch-primary-dark size-2.5 rounded-full" />
        </div>
        <div className="scheme-swatch-surface-dark flex items-center gap-1.5 rounded-sm border border-border/40 p-1.5">
          <span className="scheme-swatch-primary-dark h-2 w-6 rounded-xs" />
          <span className="scheme-swatch-accent-dark h-2 flex-1 rounded-xs" />
        </div>
      </div>
    </div>
  );
}

function SchemeOptionCard({
  schemeId,
  selectedScheme,
  onSelect,
}: {
  readonly schemeId: ColorScheme;
  readonly selectedScheme: ColorScheme;
  readonly onSelect: (scheme: ColorScheme) => void;
}) {
  const copy = messages.theme.settings;
  const schemeCopy = copy.schemes[schemeId];
  const isSelected = selectedScheme === schemeId;
  const isDefault = schemeId === DEFAULT_COLOR_SCHEME;

  return (
    <button
      aria-pressed={isSelected}
      className={cn(
        "group relative flex cursor-pointer flex-col justify-between gap-3.5 rounded-xl border p-4 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected
          ? "border-primary bg-primary/5 shadow-xs"
          : "border-border/70 bg-card/70 hover:border-primary/40 hover:bg-card"
      )}
      data-scheme-swatch={schemeId}
      data-selected={isSelected}
      data-testid={`color-scheme-option-${schemeId}`}
      onClick={() => onSelect(schemeId)}
      type="button"
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="scheme-swatch-primary-adaptive size-4 shrink-0 rounded-full border border-border/50 shadow-2xs" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-foreground text-sm tracking-tight">
                  {schemeCopy.name}
                </span>
                {isDefault && (
                  <Badge radius="rounded" size="xs" variant="muted">
                    {copy.colorSchemeDefaultBadge}
                  </Badge>
                )}
              </div>
              <span className="font-mono text-muted-foreground text-xs">
                {schemeCopy.badge}
              </span>
            </div>
          </div>

          <div
            className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
              isSelected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/70 bg-background text-transparent group-hover:border-primary/40"
            )}
          >
            <Check className="size-3.5" />
          </div>
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed">
          {schemeCopy.description}
        </p>
      </div>

      <SchemeSwatchPreview
        darkLabel={copy.colorSchemeDarkPreview}
        lightLabel={copy.colorSchemeLightPreview}
        schemeId={schemeId}
      />
    </button>
  );
}

export function SettingsWorkspace() {
  const { locale, setLocale } = useI18n();
  const { theme, setTheme, colorScheme, setColorScheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const copy = messages.theme.settings;

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
    setColorScheme(DEFAULT_COLOR_SCHEME);
    toast.success(copy.resetSuccess);
  };

  const appearanceModes: {
    readonly id: Theme;
    readonly label: string;
    readonly description: string;
    readonly icon: typeof Sun;
  }[] = [
    {
      id: "light",
      label: messages.theme.light,
      description: copy.modeLightDesc,
      icon: Sun,
    },
    {
      id: "dark",
      label: messages.theme.dark,
      description: copy.modeDarkDesc,
      icon: Moon,
    },
    {
      id: "system",
      label: messages.theme.system,
      description: copy.modeSystemDesc,
      icon: SlidersHorizontal,
    },
  ];

  const languageOptions: {
    readonly id: AppLocale;
    readonly code: string;
    readonly label: string;
  }[] = [
    {
      id: "en-US",
      code: "EN-US",
      label: messages.common.languageEnglish,
    },
    {
      id: "id-ID",
      code: "ID-ID",
      label: messages.common.languageIndonesian,
    },
  ];

  return (
    <motion.div
      animate="visible"
      className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 pb-8"
      initial={shouldReduceMotion ? "visible" : "hidden"}
      variants={parentVariants}
    >
      <motion.header
        className="flex flex-col gap-3 border-border/60 border-b pb-5 sm:flex-row sm:items-center sm:justify-between"
        variants={childVariants}
      >
        <div className="space-y-1">
          <h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
            {copy.title}
          </h1>
          <p className="text-muted-foreground text-sm">{copy.description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            disabled={colorScheme === DEFAULT_COLOR_SCHEME}
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <motion.section
          className="flex flex-col gap-4"
          variants={childVariants}
        >
          <Card size="compact" variant="outline">
            <CardHeader size="compact" variant="subtle">
              <div className="flex items-center justify-between gap-2">
                <CardTitle size="sm">{copy.colorSchemeTitle}</CardTitle>
                <Badge mono size="sm" variant="primary-subtle">
                  {copy.schemes[colorScheme].name}
                </Badge>
              </div>
              <CardDescription size="xs">
                {copy.colorSchemeDescription}
              </CardDescription>
            </CardHeader>
            <CardContent size="compact">
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-foreground text-sm">
                        {copy.colorSchemeSoftDarkGroup}
                      </h2>
                      <Badge mono size="xs" variant="outline-primary">
                        {SOFT_DARK_COLOR_SCHEME_IDS.length}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {copy.colorSchemeSoftDarkGroupDesc}
                    </p>
                  </div>
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    {SOFT_DARK_COLOR_SCHEME_IDS.map((schemeId) => (
                      <SchemeOptionCard
                        key={schemeId}
                        onSelect={handleSelectColorScheme}
                        schemeId={schemeId}
                        selectedScheme={colorScheme}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-3 border-border/60 border-t pt-5">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h2 className="font-semibold text-foreground text-sm">
                        {copy.colorSchemeStudioGroup}
                      </h2>
                      <Badge mono size="xs" variant="muted">
                        {STUDIO_COLOR_SCHEME_IDS.length}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {copy.colorSchemeStudioGroupDesc}
                    </p>
                  </div>
                  <div className="grid gap-3.5 sm:grid-cols-2">
                    {STUDIO_COLOR_SCHEME_IDS.map((schemeId) => (
                      <SchemeOptionCard
                        key={schemeId}
                        onSelect={handleSelectColorScheme}
                        schemeId={schemeId}
                        selectedScheme={colorScheme}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.section>

        <motion.div className="flex flex-col gap-6" variants={childVariants}>
          <Card size="compact" variant="outline">
            <CardHeader size="compact" variant="subtle">
              <CardTitle size="sm">{copy.livePreviewTitle}</CardTitle>
              <CardDescription size="xs">
                {copy.livePreviewDescription}
              </CardDescription>
            </CardHeader>
            <CardContent size="compact">
              <div className="rounded-xl border border-border/80 bg-background p-4 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-border/60 border-b pb-3">
                  <div className="flex items-center gap-2">
                    <Badge mono radius="rounded" size="sm" variant="default">
                      POST
                    </Badge>
                    <span className="font-mono text-foreground text-xs">
                      /v1/biller/inquiry
                    </span>
                  </div>
                  <Badge mono size="sm" variant="success">
                    {copy.previewStatusOnline}
                  </Badge>
                </div>

                <div className="mt-3 space-y-2">
                  <p className="font-medium text-foreground text-xs">
                    {copy.previewSurfaceCard}
                  </p>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {copy.previewSurfaceText}
                  </p>
                </div>

                <div className="mt-3">
                  <Input
                    aria-label={copy.previewEndpointLabel}
                    readOnly
                    size="sm"
                    value={copy.previewEndpointLabel}
                    variant="mono"
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button size="sm" type="button" variant="default">
                    {copy.previewPrimaryAction}
                  </Button>
                  <Button size="sm" type="button" variant="outline">
                    {copy.previewSecondaryAction}
                  </Button>
                  <Badge mono size="sm" variant="primary-subtle">
                    {copy.schemes[colorScheme].badge}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card size="compact" variant="outline">
            <CardHeader size="compact" variant="subtle">
              <CardTitle size="sm">{copy.appearanceModeTitle}</CardTitle>
              <CardDescription size="xs">
                {copy.appearanceModeDescription}
              </CardDescription>
            </CardHeader>
            <CardContent size="compact">
              <div className="grid gap-2.5">
                {appearanceModes.map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = theme === mode.id;
                  return (
                    <button
                      aria-pressed={isSelected}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border/70 bg-card/60 hover:border-primary/40 hover:bg-card"
                      )}
                      key={mode.id}
                      onClick={() => handleSelectTheme(mode.id)}
                      type="button"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                            isSelected
                              ? "border-primary/40 bg-primary/15 text-primary"
                              : "border-border/60 bg-muted/40 text-muted-foreground"
                          )}
                        >
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm">
                            {mode.label}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {mode.description}
                          </div>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full border",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border/70 bg-background text-transparent"
                        )}
                      >
                        <Check className="size-3" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card size="compact" variant="outline">
            <CardHeader size="compact" variant="subtle">
              <CardTitle size="sm">{copy.languageTitle}</CardTitle>
              <CardDescription size="xs">
                {copy.languageDescription}
              </CardDescription>
            </CardHeader>
            <CardContent size="compact">
              <div className="grid gap-2.5 sm:grid-cols-2">
                {languageOptions.map((option) => {
                  const isSelected = locale === option.id;
                  return (
                    <button
                      aria-pressed={isSelected}
                      className={cn(
                        "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border/70 bg-card/60 hover:border-primary/40 hover:bg-card"
                      )}
                      key={option.id}
                      onClick={() => setLocale(option.id)}
                      type="button"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-lg border font-mono text-xs",
                            isSelected
                              ? "border-primary/40 bg-primary/15 text-primary"
                              : "border-border/60 bg-muted/40 text-muted-foreground"
                          )}
                        >
                          <Globe className="size-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-sm">
                            {option.label}
                          </div>
                          <div className="font-mono text-muted-foreground text-xs">
                            {option.code}
                          </div>
                        </div>
                      </div>
                      <div
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded-full border",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border/70 bg-background text-transparent"
                        )}
                      >
                        <Check className="size-3" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
