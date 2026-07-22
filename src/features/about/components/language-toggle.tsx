import { GlobeIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { type AppLocale, getActiveLocale, setActiveLocale } from "@/lib/i18n";

export type LanguageToggleProps = {
  onLocaleChange?: (locale: AppLocale) => void;
};

export function LanguageToggle({ onLocaleChange }: LanguageToggleProps) {
  const [activeLocale, setLocalState] = useState<AppLocale>(() =>
    getActiveLocale()
  );

  const toggleLocale = () => {
    const nextLocale: AppLocale = activeLocale === "en-US" ? "id-ID" : "en-US";
    setActiveLocale(nextLocale);
    setLocalState(nextLocale);
    if (onLocaleChange) {
      onLocaleChange(nextLocale);
    }
  };

  return (
    <Button
      className="flex items-center gap-2 font-medium text-xs shadow-2xs"
      onClick={toggleLocale}
      size="sm"
      variant="outline"
    >
      <GlobeIcon className="h-3.5 w-3.5 text-primary" />
      <span>
        {activeLocale === "en-US"
          ? "English (en-US)"
          : "Bahasa Indonesia (id-ID)"}
      </span>
    </Button>
  );
}
