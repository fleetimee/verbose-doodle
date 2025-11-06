"use client";

import { useControllableState } from "@radix-ui/react-use-controllable-state";
import {
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { CheckIcon, CopyIcon } from "lucide-react";
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
  SiCss3,
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
import {
  type BundledLanguage,
  type CodeOptionsMultipleThemes,
  codeToHtml,
} from "shiki";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type { BundledLanguage } from "shiki";

const filenameIconMap = {
  ".env": SiDotenv,
  "*.astro": SiAstro,
  "biome.json": SiBiome,
  ".bowerrc": SiBower,
  "bun.lockb": SiBun,
  "*.c": SiC,
  "*.cpp": SiCplusplus,
  ".circleci/config.yml": SiCircleci,
  "*.coffee": SiCoffeescript,
  "*.module.css": SiCssmodules,
  "*.css": SiCss3,
  "*.dart": SiDart,
  Dockerfile: SiDocker,
  "docusaurus.config.js": SiDocusaurus,
  ".editorconfig": SiEditorconfig,
  ".eslintrc": SiEslint,
  "eslint.config.*": SiEslint,
  "gatsby-config.*": SiGatsby,
  ".gitignore": SiGitignoredotio,
  "*.go": SiGo,
  "*.graphql": SiGraphql,
  "*.sh": SiGnubash,
  "Gruntfile.*": SiGrunt,
  "gulpfile.*": SiGulp,
  "*.hbs": SiHandlebarsdotjs,
  "*.html": SiHtml5,
  "*.js": SiJavascript,
  "*.json": SiJson,
  "*.test.js": SiJest,
  "*.less": SiLess,
  "*.md": SiMarkdown,
  "*.mdx": SiMdx,
  "mintlify.json": SiMintlify,
  "mocha.opts": SiMocha,
  "*.mustache": SiHandlebarsdotjs,
  "*.sql": SiMysql,
  "next.config.*": SiNextdotjs,
  "*.pl": SiPerl,
  "*.php": SiPhp,
  "postcss.config.*": SiPostcss,
  "prettier.config.*": SiPrettier,
  "*.prisma": SiPrisma,
  "*.pug": SiPug,
  "*.py": SiPython,
  "*.r": SiR,
  "*.rb": SiRuby,
  "*.jsx": SiReact,
  "*.tsx": SiReact,
  "readme.md": SiReadme,
  "*.rdb": SiRedis,
  "remix.config.*": SiRemix,
  "*.riv": SiRive,
  "rollup.config.*": SiRollupdotjs,
  "sanity.config.*": SiSanity,
  "*.sass": SiSass,
  "*.scss": SiSass,
  "*.sc": SiScala,
  "*.scala": SiScala,
  "sentry.client.config.*": SiSentry,
  "components.json": SiShadcnui,
  "storybook.config.*": SiStorybook,
  "stylelint.config.*": SiStylelint,
  ".sublime-settings": SiSublimetext,
  "*.svelte": SiSvelte,
  "*.svg": SiSvg,
  "*.swift": SiSwift,
  "tailwind.config.*": SiTailwindcss,
  "*.toml": SiToml,
  "*.ts": SiTypescript,
  "vercel.json": SiVercel,
  "vite.config.*": SiVite,
  "*.vue": SiVuedotjs,
  "*.wasm": SiWebassembly,
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

const highlight = (
  html: string,
  language?: BundledLanguage,
  themes?: CodeOptionsMultipleThemes["themes"]
) =>
  codeToHtml(html, {
    lang: language ?? "typescript",
    themes: themes ?? {
      light: "github-light",
      dark: "github-dark-default",
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
  value: undefined,
  onValueChange: undefined,
  data: [],
  lightTheme: "github-light-default",
  darkTheme: "github-dark-default",
  onLightThemeChange: () => {
    // Default no-op
  },
  onDarkThemeChange: () => {
    // Default no-op
  },
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
  const [value, onValueChange] = useControllableState({
    defaultProp: defaultValue ?? "",
    prop: controlledValue,
    onChange: controlledOnValueChange,
  });

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
        value,
        onValueChange,
        data,
        lightTheme,
        darkTheme,
        onLightThemeChange: setLightTheme,
        onDarkThemeChange: setDarkTheme,
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
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export const CodeBlockCopyButton = ({
  asChild,
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: CodeBlockCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { data, value } = useContext(CodeBlockContext);
  const code = data.find((item) => item.language === value)?.code;

  const copyToClipboard = () => {
    if (
      typeof window === "undefined" ||
      !navigator.clipboard.writeText ||
      !code
    ) {
      return;
    }

    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      onCopy?.();

      setTimeout(() => setIsCopied(false), timeout);
    }, onError);
  };

  if (asChild) {
    return cloneElement(children as ReactElement, {
      // @ts-expect-error - we know this is a button
      onClick: copyToClipboard,
    });
  }

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <Button
      className={cn("shrink-0", className)}
      onClick={copyToClipboard}
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
      light: lightTheme,
      dark: darkTheme,
    };

    highlight(children as string, language, effectiveThemes)
      .then(setHtml)
      // biome-ignore lint/suspicious/noConsole: "it's fine"
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
  { value: "andromeeda", label: "Andromeeda" },
  { value: "aurora-x", label: "Aurora X" },
  { value: "ayu-dark", label: "Ayu Dark" },
  { value: "catppuccin-frappe", label: "Catppuccin Frappé" },
  { value: "catppuccin-latte", label: "Catppuccin Latte" },
  { value: "catppuccin-macchiato", label: "Catppuccin Macchiato" },
  { value: "catppuccin-mocha", label: "Catppuccin Mocha" },
  { value: "dark-plus", label: "Dark Plus" },
  { value: "dracula", label: "Dracula Theme" },
  { value: "dracula-soft", label: "Dracula Theme Soft" },
  { value: "everforest-dark", label: "Everforest Dark" },
  { value: "everforest-light", label: "Everforest Light" },
  { value: "github-dark", label: "GitHub Dark" },
  { value: "github-dark-default", label: "GitHub Dark Default" },
  { value: "github-dark-dimmed", label: "GitHub Dark Dimmed" },
  { value: "github-dark-high-contrast", label: "GitHub Dark High Contrast" },
  { value: "github-light", label: "GitHub Light" },
  { value: "github-light-default", label: "GitHub Light Default" },
  { value: "github-light-high-contrast", label: "GitHub Light High Contrast" },
  { value: "gruvbox-dark-hard", label: "Gruvbox Dark Hard" },
  { value: "gruvbox-dark-medium", label: "Gruvbox Dark Medium" },
  { value: "gruvbox-dark-soft", label: "Gruvbox Dark Soft" },
  { value: "gruvbox-light-hard", label: "Gruvbox Light Hard" },
  { value: "gruvbox-light-medium", label: "Gruvbox Light Medium" },
  { value: "gruvbox-light-soft", label: "Gruvbox Light Soft" },
  { value: "houston", label: "Houston" },
  { value: "kanagawa-dragon", label: "Kanagawa Dragon" },
  { value: "kanagawa-lotus", label: "Kanagawa Lotus" },
  { value: "kanagawa-wave", label: "Kanagawa Wave" },
  { value: "laserwave", label: "LaserWave" },
  { value: "light-plus", label: "Light Plus" },
  { value: "material-theme", label: "Material Theme" },
  { value: "material-theme-darker", label: "Material Theme Darker" },
  { value: "material-theme-lighter", label: "Material Theme Lighter" },
  { value: "material-theme-ocean", label: "Material Theme Ocean" },
  { value: "material-theme-palenight", label: "Material Theme Palenight" },
  { value: "min-dark", label: "Min Dark" },
  { value: "min-light", label: "Min Light" },
  { value: "monokai", label: "Monokai" },
  { value: "night-owl", label: "Night Owl" },
  { value: "nord", label: "Nord" },
  { value: "one-dark-pro", label: "One Dark Pro" },
  { value: "one-light", label: "One Light" },
  { value: "plastic", label: "Plastic" },
  { value: "poimandres", label: "Poimandres" },
  { value: "red", label: "Red" },
  { value: "rose-pine", label: "Rosé Pine" },
  { value: "rose-pine-dawn", label: "Rosé Pine Dawn" },
  { value: "rose-pine-moon", label: "Rosé Pine Moon" },
  { value: "slack-dark", label: "Slack Dark" },
  { value: "slack-ochin", label: "Slack Ochin" },
  { value: "snazzy-light", label: "Snazzy Light" },
  { value: "solarized-dark", label: "Solarized Dark" },
  { value: "solarized-light", label: "Solarized Light" },
  { value: "synthwave-84", label: "Synthwave '84" },
  { value: "tokyo-night", label: "Tokyo Night" },
  { value: "vesper", label: "Vesper" },
  { value: "vitesse-black", label: "Vitesse Black" },
  { value: "vitesse-dark", label: "Vitesse Dark" },
  { value: "vitesse-light", label: "Vitesse Light" },
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
