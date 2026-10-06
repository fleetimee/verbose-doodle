import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function LanguageSwitcher() {
  const { locale, messages, setLocale } = useI18n();
  const english = locale === "en-US";
  const label = english
    ? messages.common.languageIndonesian
    : messages.common.languageEnglish;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            aria-label={label}
            onClick={() => setLocale(english ? "id-ID" : "en-US")}
            size="icon-sm"
            variant="ghost"
          />
        }
      >
        {english ? "EN" : "ID"}
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}
