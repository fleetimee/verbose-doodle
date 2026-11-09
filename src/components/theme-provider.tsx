import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "dark" | "light" | "system";

export const COLOR_SCHEME_IDS = [
  "harbor-teal",
  "cobalt-bench",
  "copper-forge",
  "botanical-lab",
  "ultraviolet-relay",
  "crimson-signal",
  "catppuccin-frappe",
  "catppuccin-macchiato",
  "tokyo-night-storm",
  "nord-polar",
  "rose-pine-moon",
  "everforest-soft",
] as const;

export const STUDIO_COLOR_SCHEME_IDS = [
  "harbor-teal",
  "cobalt-bench",
  "copper-forge",
  "botanical-lab",
  "ultraviolet-relay",
  "crimson-signal",
] as const;

export const SOFT_DARK_COLOR_SCHEME_IDS = [
  "catppuccin-frappe",
  "catppuccin-macchiato",
  "tokyo-night-storm",
  "nord-polar",
  "rose-pine-moon",
  "everforest-soft",
] as const;

export type ColorScheme = (typeof COLOR_SCHEME_IDS)[number];

export const DEFAULT_COLOR_SCHEME: ColorScheme = "harbor-teal";

function isValidColorScheme(value: string | null): value is ColorScheme {
  if (value === null) {
    return false;
  }
  return COLOR_SCHEME_IDS.some((id) => id === value);
}

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  defaultColorScheme?: ColorScheme;
  storageKey?: string;
  colorSchemeStorageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorScheme: ColorScheme;
  setColorScheme: (colorScheme: ColorScheme) => void;
};

const initialState: ThemeProviderState = {
  setTheme: () => null,
  theme: "system",
  colorScheme: DEFAULT_COLOR_SCHEME,
  setColorScheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColorScheme = DEFAULT_COLOR_SCHEME,
  storageKey = "vite-ui-theme",
  colorSchemeStorageKey = "vite-ui-color-scheme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    // SAFETY: Stored values are selected from the Theme union before being persisted.
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const stored = localStorage.getItem(colorSchemeStorageKey);
    return isValidColorScheme(stored) ? stored : defaultColorScheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.dataset.colorScheme = colorScheme;
  }, [colorScheme]);

  const value = {
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
    theme,
    colorScheme,
    setColorScheme: (newColorScheme: ColorScheme) => {
      localStorage.setItem(colorSchemeStorageKey, newColorScheme);
      setColorScheme(newColorScheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
