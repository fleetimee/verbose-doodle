import { Globe02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  type AppLocale,
  getActiveLocale,
  getMessages,
  setActiveLocale,
} from "@/lib/i18n";

export type LanguageToggleProps = {
  onLocaleChange?: (locale: AppLocale) => void;
};

export function LanguageToggle({ onLocaleChange }: LanguageToggleProps) {
  let contextLocale: AppLocale | undefined;
  let contextMessages: ReturnType<typeof getMessages> | undefined;
  let contextSetLocale: ((locale: AppLocale) => void) | undefined;

  try {
    const i18n = useI18n();
    contextLocale = i18n.locale;
    contextMessages = i18n.messages;
    contextSetLocale = i18n.setLocale;
  } catch {
    // Fallback when rendered outside I18nProvider
  }

  const [fallbackLocale, setFallbackLocale] = useState<AppLocale>(() =>
    getActiveLocale()
  );

  const activeLocale = contextLocale ?? fallbackLocale;
  const activeMessages = contextMessages ?? getMessages(activeLocale);

  const toggleLocale = () => {
    const nextLocale: AppLocale = activeLocale === "en-US" ? "id-ID" : "en-US";
    if (contextSetLocale) {
      contextSetLocale(nextLocale);
    } else {
      setActiveLocale(nextLocale);
      setFallbackLocale(nextLocale);
    }
    if (onLocaleChange) {
      onLocaleChange(nextLocale);
    }
  };

  return (
    <Button onClick={toggleLocale} size="inline-sm" variant="link-muted">
      <HugeiconsIcon
        className="h-3 w-3 text-muted-foreground/70"
        icon={Globe02Icon}
        strokeWidth={2}
      />
      <span>
        {activeLocale === "en-US"
          ? activeMessages.common.languageEnglish
          : activeMessages.common.languageIndonesian}
      </span>
    </Button>
  );
}
