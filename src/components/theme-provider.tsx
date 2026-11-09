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
  "dracula-classic",
  "gruvbox-material",
  "one-dark-pro",
  "kanagawa-wave",
  "ayu-mirage",
  "material-palenight",
  "solarized-precision",
  "monokai-pro",
  "christmas-noel",
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
  "dracula-classic",
  "gruvbox-material",
  "one-dark-pro",
  "kanagawa-wave",
  "ayu-mirage",
  "material-palenight",
  "solarized-precision",
  "monokai-pro",
] as const;

export const SEASONAL_COLOR_SCHEME_IDS = ["christmas-noel"] as const;

export type ColorScheme = (typeof COLOR_SCHEME_IDS)[number];

export const DEFAULT_COLOR_SCHEME: ColorScheme = "harbor-teal";

/**
 * Checks whether the given date falls within the Christmas seasonal window
 * (November 25 through January 15, inclusive, in local time).
 */
export function isChristmasSeason(date: Date = new Date()): boolean {
  const month = date.getMonth(); // 0 = Jan, 10 = Nov, 11 = Dec
  const day = date.getDate();

  if (month === 10) {
    return day >= 25;
  }
  if (month === 11) {
    return true;
  }
  if (month === 0) {
    return day <= 15;
  }
  return false;
}

/**
 * Resolves the active default color scheme, automatically switching to
 * `"christmas-noel"` between November 25 and January 15 when no user override
 * is stored.
 */
export function getDefaultColorScheme(date: Date = new Date()): ColorScheme {
  return isChristmasSeason(date) ? "christmas-noel" : DEFAULT_COLOR_SCHEME;
}

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
  resetColorScheme: () => void;
};

const initialState: ThemeProviderState = {
  setTheme: () => null,
  theme: "system",
  colorScheme: getDefaultColorScheme(),
  setColorScheme: () => null,
  resetColorScheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultColorScheme,
  storageKey = "vite-ui-theme",
  colorSchemeStorageKey = "vite-ui-color-scheme",
  ...props
}: ThemeProviderProps) {
  const resolvedDefaultScheme = defaultColorScheme ?? getDefaultColorScheme();

  const [theme, setTheme] = useState<Theme>(
    // SAFETY: Stored values are selected from the Theme union before being persisted.
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const stored = localStorage.getItem(colorSchemeStorageKey);
    return isValidColorScheme(stored) ? stored : resolvedDefaultScheme;
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
    resetColorScheme: () => {
      localStorage.removeItem(colorSchemeStorageKey);
      setColorScheme(defaultColorScheme ?? getDefaultColorScheme());
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
