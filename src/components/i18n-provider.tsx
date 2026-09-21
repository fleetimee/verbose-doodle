import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type AppLocale,
  getActiveLocale,
  getMessages,
  type Messages,
  setActiveLocale as persistLocale,
} from "@/lib/i18n";

type I18nContextType = {
  locale: AppLocale;
  messages: Messages;
  setLocale: (locale: AppLocale) => void;
};

const I18nContext = createContext<I18nContextType | null>(null);

export type I18nProviderProps = {
  children: ReactNode;
  defaultLocale?: AppLocale;
};

export function I18nProvider({ children, defaultLocale }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<AppLocale>(() => {
    if (defaultLocale) {
      return defaultLocale;
    }
    return getActiveLocale();
  });

  const setLocale = useCallback((nextLocale: AppLocale) => {
    persistLocale(nextLocale);
    setLocaleState(nextLocale);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  useEffect(() => {
    const handleLocaleChange = (event: Event) => {
      // SAFETY: The application dispatches this event with an AppLocale detail.
      const customEvent = event as CustomEvent<AppLocale>;
      if (customEvent.detail && customEvent.detail !== locale) {
        setLocaleState(customEvent.detail);
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === "app-locale" &&
        (event.newValue === "en-US" || event.newValue === "id-ID")
      ) {
        setLocaleState(event.newValue);
      }
    };

    window.addEventListener("app-locale-change", handleLocaleChange);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("app-locale-change", handleLocaleChange);
      window.removeEventListener("storage", handleStorage);
    };
  }, [locale]);

  const messages = useMemo(() => getMessages(locale), [locale]);

  const value = useMemo(
    () => ({ locale, messages, setLocale }),
    [locale, messages, setLocale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      locale: getActiveLocale(),
      messages: getMessages(),
      setLocale: persistLocale,
    };
  }
  return context;
}
