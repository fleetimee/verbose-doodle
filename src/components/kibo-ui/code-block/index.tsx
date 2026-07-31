"use client";

import { useControlled } from "@base-ui/utils/useControlled";
import { motion } from "motion/react";
import type {
  ComponentProps,
  HTMLAttributes,
  ReactElement,
  ReactNode,
} from "react";
import {
  cloneElement,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { IconType } from "react-icons";
import {
  SiAstro,
  SiBiome,
  SiBower,
  SiBun,
  SiC,
  SiCircleci,
  SiCoffeescript,
  SiCplusplus,
  SiCss,
  SiCssmodules,
  SiDart,
  SiDocker,
  SiDocusaurus,
  SiDotenv,
  SiEditorconfig,
  SiEslint,
  SiGatsby,
  SiGitignoredotio,
  SiGnubash,
  SiGo,
  SiGraphql,
  SiGrunt,
  SiGulp,
  SiHandlebarsdotjs,
  SiHtml5,
  SiJavascript,
  SiJest,
  SiJson,
  SiLess,
  SiMarkdown,
  SiMdx,
  SiMintlify,
  SiMocha,
  SiMysql,
  SiNextdotjs,
  SiPerl,
  SiPhp,
  SiPostcss,
  SiPrettier,
  SiPrisma,
  SiPug,
  SiPython,
  SiR,
  SiReact,
  SiReadme,
  SiRedis,
  SiRemix,
  SiRive,
  SiRollupdotjs,
  SiRuby,
  SiSanity,
  SiSass,
  SiScala,
  SiSentry,
  SiShadcnui,
  SiStorybook,
  SiStylelint,
  SiSublimetext,
  SiSvelte,
  SiSvg,
  SiSwift,
  SiTailwindcss,
  SiToml,
  SiTypescript,
  SiVercel,
  SiVite,
  SiVuedotjs,
  SiWebassembly,
} from "react-icons/si";
import type { BundledLanguage, CodeOptionsMultipleThemes } from "shiki";
import { toast } from "sonner";
import { CheckIcon, CopyIcon } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { copyToClipboard } from "@/lib/clipboard";
import { cn } from "@/lib/utils";

export type { BundledLanguage } from "shiki";

const filenameIconMap = {
  ".bowerrc": SiBower,
  ".circleci/config.yml": SiCircleci,
  ".editorconfig": SiEditorconfig,
  ".env": SiDotenv,
  ".eslintrc": SiEslint,
  ".gitignore": SiGitignoredotio,
  ".sublime-settings": SiSublimetext,
  "*.astro": SiAstro,
  "*.c": SiC,
  "*.coffee": SiCoffeescript,
  "*.cpp": SiCplusplus,
  "*.css": SiCss,
  "*.dart": SiDart,
  "*.go": SiGo,
  "*.graphql": SiGraphql,
  "*.hbs": SiHandlebarsdotjs,
  "*.html": SiHtml5,
  "*.js": SiJavascript,
  "*.json": SiJson,
  "*.jsx": SiReact,
  "*.less": SiLess,
  "*.md": SiMarkdown,
  "*.mdx": SiMdx,
  "*.module.css": SiCssmodules,
  "*.mustache": SiHandlebarsdotjs,
  "*.php": SiPhp,
  "*.pl": SiPerl,
  "*.prisma": SiPrisma,
  "*.pug": SiPug,
  "*.py": SiPython,
  "*.r": SiR,
  "*.rb": SiRuby,
  "*.rdb": SiRedis,
  "*.riv": SiRive,
  "*.sass": SiSass,
  "*.sc": SiScala,
  "*.scala": SiScala,
  "*.scss": SiSass,
  "*.sh": SiGnubash,
  "*.sql": SiMysql,
  "*.svelte": SiSvelte,
  "*.svg": SiSvg,
  "*.swift": SiSwift,
  "*.test.js": SiJest,
  "*.toml": SiToml,
  "*.ts": SiTypescript,
  "*.tsx": SiReact,
  "*.vue": SiVuedotjs,
  "*.wasm": SiWebassembly,
  "biome.json": SiBiome,
  "bun.lockb": SiBun,
  "components.json": SiShadcnui,
  Dockerfile: SiDocker,
  "docusaurus.config.js": SiDocusaurus,
  "eslint.config.*": SiEslint,
  "Gruntfile.*": SiGrunt,
  "gatsby-config.*": SiGatsby,
  "gulpfile.*": SiGulp,
  "mintlify.json": SiMintlify,
  "mocha.opts": SiMocha,
  "next.config.*": SiNextdotjs,
  "postcss.config.*": SiPostcss,
  "prettier.config.*": SiPrettier,
  "readme.md": SiReadme,
  "remix.config.*": SiRemix,
  "rollup.config.*": SiRollupdotjs,
  "sanity.config.*": SiSanity,
  "sentry.client.config.*": SiSentry,
  "storybook.config.*": SiStorybook,
  "stylelint.config.*": SiStylelint,
  "tailwind.config.*": SiTailwindcss,
  "vercel.json": SiVercel,
  "vite.config.*": SiVite,
};

const lineNumberClassNames = cn(
  "[&_code]:[counter-reset:line]",
  "[&_code]:[counter-increment:line_0]",
  "[&_.line]:before:content-[counter(line)]",
  "[&_.line]:before:inline-block",
  "[&_.line]:before:[counter-increment:line]",
  "[&_.line]:before:w-4",
  "[&_.line]:before:mr-4",
  "[&_.line]:before:text-[13px]",
  "[&_.line]:before:text-right",
  "[&_.line]:before:text-muted-foreground/50",
  "[&_.line]:before:font-mono",
  "[&_.line]:before:select-none"
);

const darkModeClassNames = cn(
  "dark:[&_.shiki]:!text-[var(--shiki-dark)]",
  // "dark:[&_.shiki]:!bg-[var(--shiki-dark-bg)]",
  "dark:[&_.shiki]:![font-style:var(--shiki-dark-font-style)]",
  "dark:[&_.shiki]:![font-weight:var(--shiki-dark-font-weight)]",
  "dark:[&_.shiki]:![text-decoration:var(--shiki-dark-text-decoration)]",
  "dark:[&_.shiki_span]:!text-[var(--shiki-dark)]",
  "dark:[&_.shiki_span]:![font-style:var(--shiki-dark-font-style)]",
  "dark:[&_.shiki_span]:![font-weight:var(--shiki-dark-font-weight)]",
  "dark:[&_.shiki_span]:![text-decoration:var(--shiki-dark-text-decoration)]"
);

const lineHighlightClassNames = cn(
  "[&_.line.highlighted]:bg-blue-50",
  "[&_.line.highlighted]:after:bg-blue-500",
  "[&_.line.highlighted]:after:absolute",
  "[&_.line.highlighted]:after:left-0",
  "[&_.line.highlighted]:after:top-0",
  "[&_.line.highlighted]:after:bottom-0",
  "[&_.line.highlighted]:after:w-0.5",
  "dark:[&_.line.highlighted]:!bg-blue-500/10"
);

const lineDiffClassNames = cn(
  "[&_.line.diff]:after:absolute",
  "[&_.line.diff]:after:left-0",
  "[&_.line.diff]:after:top-0",
  "[&_.line.diff]:after:bottom-0",
  "[&_.line.diff]:after:w-0.5",
  "[&_.line.diff.add]:bg-emerald-50",
  "[&_.line.diff.add]:after:bg-emerald-500",
  "[&_.line.diff.remove]:bg-rose-50",
  "[&_.line.diff.remove]:after:bg-rose-500",
  "dark:[&_.line.diff.add]:!bg-emerald-500/10",
  "dark:[&_.line.diff.remove]:!bg-rose-500/10"
);

const lineFocusedClassNames = cn(
  "[&_code:has(.focused)_.line]:blur-[2px]",
  "[&_code:has(.focused)_.line.focused]:blur-none"
);

const wordHighlightClassNames = cn(
  "[&_.highlighted-word]:bg-blue-50",
  "dark:[&_.highlighted-word]:!bg-blue-500/10"
);

const codeBlockClassName = cn(
  "mt-0 bg-background text-sm",
  "[&_pre]:py-4",
  // "[&_.shiki]:!bg-[var(--shiki-bg)]",
  "[&_.shiki]:!bg-transparent",
  "[&_code]:w-full",
  "[&_code]:grid",
  "[&_code]:overflow-x-auto",
  "[&_code]:bg-transparent",
  "[&_.line]:px-4",
  "[&_.line]:w-full",
  "[&_.line]:relative"
);

const highlight = async (
  html: string,
  language?: BundledLanguage,
  themes?: CodeOptionsMultipleThemes["themes"]
) => {
  const [
    { codeToHtml },
    {
      transformerNotationDiff,
      transformerNotationErrorLevel,
      transformerNotationFocus,
      transformerNotationHighlight,
      transformerNotationWordHighlight,
    },
  ] = await Promise.all([import("shiki"), import("@shikijs/transformers")]);

  return codeToHtml(html, {
    lang: language ?? "typescript",
    themes: themes ?? {
      dark: "github-dark-default",
      light: "github-light",
    },
    transformers: [
      transformerNotationDiff({
        matchAlgorithm: "v3",
      }),
      transformerNotationHighlight({
        matchAlgorithm: "v3",
      }),
      transformerNotationWordHighlight({
        matchAlgorithm: "v3",
      }),
      transformerNotationFocus({
        matchAlgorithm: "v3",
      }),
      transformerNotationErrorLevel({
        matchAlgorithm: "v3",
      }),
    ],
  });
};

type CodeBlockData = {
  language: string;
  filename: string;
  code: string;
};

type CodeBlockContextType = {
  value: string | undefined;
  onValueChange: ((value: string) => void) | undefined;
  data: CodeBlockData[];
  lightTheme: string;
  darkTheme: string;
  onLightThemeChange: (theme: string) => void;
  onDarkThemeChange: (theme: string) => void;
};

const CodeBlockContext = createContext<CodeBlockContextType>({
  darkTheme: "github-dark-default",
  data: [],
  lightTheme: "github-light-default",
  onDarkThemeChange: () => {
    // Default no-op
  },
  onLightThemeChange: () => {
    // Default no-op
  },
  onValueChange: undefined,
  value: undefined,
});

export type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  data: CodeBlockData[];
  defaultLightTheme?: string;
  defaultDarkTheme?: string;
  storageKey?: string;
};

export const CodeBlock = ({
  value: controlledValue,
  onValueChange: controlledOnValueChange,
  defaultValue,
  className,
  data,
  defaultLightTheme = "github-light-default",
  defaultDarkTheme = "github-dark-default",
  storageKey = "codeblock-themes",
  ...props
}: CodeBlockProps) => {
  const [value, setValue] = useControlled({
    controlled: controlledValue,
    default: defaultValue ?? "",
    name: "CodeBlock",
  });
  const onValueChange = useCallback(
    (nextValue: string) => {
      setValue(nextValue);
      controlledOnValueChange?.(nextValue);
    },
    [controlledOnValueChange, setValue]
  );

  // Initialize themes from localStorage if available
  const [lightTheme, setLightThemeState] = useState(() => {
    if (typeof window === "undefined") {
      return defaultLightTheme;
    }
    const stored = localStorage.getItem(`${storageKey}-light`);
    return stored ?? defaultLightTheme;
  });

  const [darkTheme, setDarkThemeState] = useState(() => {
    if (typeof window === "undefined") {
      return defaultDarkTheme;
    }
    const stored = localStorage.getItem(`${storageKey}-dark`);
    return stored ?? defaultDarkTheme;
  });

  // Wrapper functions to save to localStorage
  const setLightTheme = (theme: string) => {
    setLightThemeState(theme);
    if (typeof window !== "undefined") {
      localStorage.setItem(`${storageKey}-light`, theme);
    }
  };

  const setDarkTheme = (theme: string) => {
    setDarkThemeState(theme);
    if (typeof window !== "undefined") {
      localStorage.setItem(`${storageKey}-dark`, theme);
    }
  };

  return (
    <CodeBlockContext.Provider
      value={{
        darkTheme,
        data,
        lightTheme,
        onDarkThemeChange: setDarkTheme,
        onLightThemeChange: setLightTheme,
        onValueChange,
        value,
      }}
    >
      <div
        className={cn("size-full overflow-hidden rounded-md border", className)}
        {...props}
      />
    </CodeBlockContext.Provider>
  );
};

export type CodeBlockHeaderProps = HTMLAttributes<HTMLDivElement>;

export const CodeBlockHeader = ({
  className,
  ...props
}: CodeBlockHeaderProps) => (
  <div
    className={cn(
      "flex flex-row items-center border-b bg-secondary p-1",
      className
    )}
    {...props}
  />
);

export type CodeBlockFilesProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  children: (item: CodeBlockData) => ReactNode;
};

export const CodeBlockFiles = ({
  className,
  children,
  ...props
}: CodeBlockFilesProps) => {
  const { data } = useContext(CodeBlockContext);

  return (
    <div
      className={cn("flex grow flex-row items-center gap-2", className)}
      {...props}
    >
      {data.map(children)}
    </div>
  );
};

export type CodeBlockFilenameProps = HTMLAttributes<HTMLDivElement> & {
  icon?: IconType;
  value?: string;
};

export const CodeBlockFilename = ({
  className,
  icon,
  value,
  children,
  ...props
}: CodeBlockFilenameProps) => {
  const { value: activeValue } = useContext(CodeBlockContext);
  const defaultIcon = Object.entries(filenameIconMap).find(([pattern]) => {
    const regex = new RegExp(
      `^${pattern.replace(/\\/g, "\\\\").replace(/\./g, "\\.").replace(/\*/g, ".*")}$`
    );
    return regex.test(children as string);
  })?.[1];
  const Icon = icon ?? defaultIcon;

  if (value !== activeValue) {
    return null;
  }

  return (
    <div
      className="flex items-center gap-2 bg-secondary px-4 py-1.5 text-muted-foreground text-xs"
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 shrink-0" />}
      <span className="flex-1 truncate">{children}</span>
    </div>
  );
};

export type CodeBlockSelectProps = ComponentProps<typeof Select>;

export const CodeBlockSelect = (props: CodeBlockSelectProps) => {
  const { value, onValueChange } = useContext(CodeBlockContext);

  return <Select onValueChange={onValueChange} value={value} {...props} />;
};

export type CodeBlockSelectTriggerProps = ComponentProps<typeof SelectTrigger>;

export const CodeBlockSelectTrigger = ({
  className,
  ...props
}: CodeBlockSelectTriggerProps) => (
  <SelectTrigger
    className={cn(
      "w-fit border-none text-muted-foreground text-xs shadow-none",
      className
    )}
    {...props}
  />
);

export type CodeBlockSelectValueProps = ComponentProps<typeof SelectValue>;

export const CodeBlockSelectValue = (props: CodeBlockSelectValueProps) => (
  <SelectValue {...props} />
);

export type CodeBlockSelectContentProps = Omit<
  ComponentProps<typeof SelectContent>,
  "children"
> & {
  children: (item: CodeBlockData) => ReactNode;
};

export const CodeBlockSelectContent = ({
  children,
  ...props
}: CodeBlockSelectContentProps) => {
  const { data } = useContext(CodeBlockContext);

  return <SelectContent {...props}>{data.map(children)}</SelectContent>;
};

export type CodeBlockSelectItemProps = ComponentProps<typeof SelectItem>;

export const CodeBlockSelectItem = ({
  className,
  ...props
}: CodeBlockSelectItemProps) => (
  <SelectItem className={cn("text-sm", className)} {...props} />
);

export type CodeBlockCopyButtonProps = ComponentProps<typeof Button> & {
  asChild?: boolean;
  onCopy?: () => void;
  onError?: (error: Error) => void;
  text?: string;
  timeout?: number;
};

export const CodeBlockCopyButton = ({
  asChild,
  onCopy,
  onError,
  text,
  timeout = 2000,
  children,
  className,
  ...props
}: CodeBlockCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { data, value } = useContext(CodeBlockContext);
  const selectedItem = data.find((item) => item.language === value);
  const fallbackItem = data.length === 1 ? data[0] : undefined;
  const code = text ?? selectedItem?.code ?? fallbackItem?.code;

  const handleCopyToClipboard = async () => {
    if (typeof window === "undefined" || !code) {
      return;
    }

    try {
      const copied = await copyToClipboard(code);
      if (!copied) {
        toast.error("Unable to copy code");
        return;
      }

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      setIsCopied(true);
      onCopy?.();
      toast.success("Code copied to clipboard");

      setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error("Copy failed"));
      toast.error("Unable to copy code");
    }
  };

  if (asChild) {
    return cloneElement(children as ReactElement, {
      // @ts-expect-error - we know this is a button
      onClick: handleCopyToClipboard,
    });
  }

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <Button
      className={cn("shrink-0", className)}
      onClick={handleCopyToClipboard}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <Icon className="text-muted-foreground" size={14} />}
    </Button>
  );
};

type CodeBlockFallbackProps = HTMLAttributes<HTMLDivElement>;

const CodeBlockFallback = ({ children, ...props }: CodeBlockFallbackProps) => (
  <div {...props}>
    <pre className="w-full whitespace-pre-wrap">
      <code className="whitespace-pre-wrap break-all">
        {children
          ?.toString()
          .split("\n")
          .map((line, i) => (
            <span className="line break-all" key={i}>
              {line}
            </span>
          ))}
      </code>
    </pre>
  </div>
);

export type CodeBlockBodyProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  children: (item: CodeBlockData) => ReactNode;
};

export const CodeBlockBody = ({ children, ...props }: CodeBlockBodyProps) => {
  const { data } = useContext(CodeBlockContext);

  return <div {...props}>{data.map(children)}</div>;
};

export type CodeBlockItemProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
  lineNumbers?: boolean;
};

export const CodeBlockItem = ({
  children,
  lineNumbers = true,
  className,
  value,
  ...props
}: CodeBlockItemProps) => {
  const { value: activeValue } = useContext(CodeBlockContext);

  if (value !== activeValue) {
    return null;
  }

  return (
    <div
      className={cn(
        codeBlockClassName,
        lineHighlightClassNames,
        lineDiffClassNames,
        lineFocusedClassNames,
        wordHighlightClassNames,
        darkModeClassNames,
        lineNumbers && lineNumberClassNames,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export type CodeBlockContentProps = HTMLAttributes<HTMLDivElement> & {
  themes?: CodeOptionsMultipleThemes["themes"];
  language?: BundledLanguage;
  syntaxHighlighting?: boolean;
  children: string;
};

export const CodeBlockContent = ({
  children,
  themes,
  language,
  syntaxHighlighting = true,
  onDrag,
  onDragEnd,
  onDragStart,
  onAnimationStart,
  onAnimationEnd,
  onAnimationIteration,
  ...props
}: CodeBlockContentProps) => {
  const [html, setHtml] = useState<string | null>(null);
  const { lightTheme, darkTheme } = useContext(CodeBlockContext);

  // Create a unique key based on themes to trigger animation
  const themeKey = `${lightTheme}-${darkTheme}`;

  useEffect(() => {
    if (!syntaxHighlighting) {
      return;
    }

    const effectiveThemes = themes ?? {
      dark: darkTheme,
      light: lightTheme,
    };

    highlight(children as string, language, effectiveThemes)
      .then(setHtml)
      .catch(console.error);
  }, [children, themes, syntaxHighlighting, language, lightTheme, darkTheme]);

  if (!(syntaxHighlighting && html)) {
    return <CodeBlockFallback>{children}</CodeBlockFallback>;
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      // biome-ignore lint/security/noDangerouslySetInnerHtml: "Kinda how Shiki works"
      dangerouslySetInnerHTML={{ __html: html }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={themeKey}
      transition={{ duration: 0.15, ease: "easeInOut" }}
      {...props}
    />
  );
};

// Available Shiki bundled themes
export const SHIKI_THEMES = [
  { label: "Andromeeda", value: "andromeeda" },
  { label: "Aurora X", value: "aurora-x" },
  { label: "Ayu Dark", value: "ayu-dark" },
  { label: "Catppuccin Frappé", value: "catppuccin-frappe" },
  { label: "Catppuccin Latte", value: "catppuccin-latte" },
  { label: "Catppuccin Macchiato", value: "catppuccin-macchiato" },
  { label: "Catppuccin Mocha", value: "catppuccin-mocha" },
  { label: "Dark Plus", value: "dark-plus" },
  { label: "Dracula Theme", value: "dracula" },
  { label: "Dracula Theme Soft", value: "dracula-soft" },
  { label: "Everforest Dark", value: "everforest-dark" },
  { label: "Everforest Light", value: "everforest-light" },
  { label: "GitHub Dark", value: "github-dark" },
  { label: "GitHub Dark Default", value: "github-dark-default" },
  { label: "GitHub Dark Dimmed", value: "github-dark-dimmed" },
  { label: "GitHub Dark High Contrast", value: "github-dark-high-contrast" },
  { label: "GitHub Light", value: "github-light" },
  { label: "GitHub Light Default", value: "github-light-default" },
  { label: "GitHub Light High Contrast", value: "github-light-high-contrast" },
  { label: "Gruvbox Dark Hard", value: "gruvbox-dark-hard" },
  { label: "Gruvbox Dark Medium", value: "gruvbox-dark-medium" },
  { label: "Gruvbox Dark Soft", value: "gruvbox-dark-soft" },
  { label: "Gruvbox Light Hard", value: "gruvbox-light-hard" },
  { label: "Gruvbox Light Medium", value: "gruvbox-light-medium" },
  { label: "Gruvbox Light Soft", value: "gruvbox-light-soft" },
  { label: "Houston", value: "houston" },
  { label: "Kanagawa Dragon", value: "kanagawa-dragon" },
  { label: "Kanagawa Lotus", value: "kanagawa-lotus" },
  { label: "Kanagawa Wave", value: "kanagawa-wave" },
  { label: "LaserWave", value: "laserwave" },
  { label: "Light Plus", value: "light-plus" },
  { label: "Material Theme", value: "material-theme" },
  { label: "Material Theme Darker", value: "material-theme-darker" },
  { label: "Material Theme Lighter", value: "material-theme-lighter" },
  { label: "Material Theme Ocean", value: "material-theme-ocean" },
  { label: "Material Theme Palenight", value: "material-theme-palenight" },
  { label: "Min Dark", value: "min-dark" },
  { label: "Min Light", value: "min-light" },
  { label: "Monokai", value: "monokai" },
  { label: "Night Owl", value: "night-owl" },
  { label: "Nord", value: "nord" },
  { label: "One Dark Pro", value: "one-dark-pro" },
  { label: "One Light", value: "one-light" },
  { label: "Plastic", value: "plastic" },
  { label: "Poimandres", value: "poimandres" },
  { label: "Red", value: "red" },
  { label: "Rosé Pine", value: "rose-pine" },
  { label: "Rosé Pine Dawn", value: "rose-pine-dawn" },
  { label: "Rosé Pine Moon", value: "rose-pine-moon" },
  { label: "Slack Dark", value: "slack-dark" },
  { label: "Slack Ochin", value: "slack-ochin" },
  { label: "Snazzy Light", value: "snazzy-light" },
  { label: "Solarized Dark", value: "solarized-dark" },
  { label: "Solarized Light", value: "solarized-light" },
  { label: "Synthwave '84", value: "synthwave-84" },
  { label: "Tokyo Night", value: "tokyo-night" },
  { label: "Vesper", value: "vesper" },
  { label: "Vitesse Black", value: "vitesse-black" },
  { label: "Vitesse Dark", value: "vitesse-dark" },
  { label: "Vitesse Light", value: "vitesse-light" },
] as const;

export type CodeBlockThemeSelectorProps = {
  mode: "light" | "dark";
  className?: string;
};

export const CodeBlockThemeSelector = ({
  mode,
  className,
}: CodeBlockThemeSelectorProps) => {
  const { lightTheme, darkTheme, onLightThemeChange, onDarkThemeChange } =
    useContext(CodeBlockContext);

  const currentTheme = mode === "light" ? lightTheme : darkTheme;
  const onChange = mode === "light" ? onLightThemeChange : onDarkThemeChange;

  return (
    <Select onValueChange={onChange} value={currentTheme}>
      <SelectTrigger
        className={cn(
          "w-fit border-none text-muted-foreground text-xs shadow-none",
          className
        )}
      >
        <SelectValue
          placeholder={`${mode === "light" ? "Light" : "Dark"} Theme`}
        />
      </SelectTrigger>
      <SelectContent>
        {SHIKI_THEMES.map((theme) => (
          <SelectItem className="text-sm" key={theme.value} value={theme.value}>
            {theme.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
