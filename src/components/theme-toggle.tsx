import { Moon, Sun } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "@/components/theme-provider";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleToggle = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";

    if (shouldReduceMotion || !document.startViewTransition) {
      setTheme(newTheme);
      return;
    }

    document.startViewTransition(() => {
      setTheme(newTheme);
    });
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 shadow-sm transition-shadow hover:shadow-md">
          <Sun
            className={cn(
              "h-4 w-4 transition-[color,transform] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none",
              isDark
                ? "scale-90 text-muted-foreground"
                : "scale-100 text-amber-500"
            )}
          />
          <Switch
            aria-label={messages.theme.toggleAriaLabel}
            checked={isDark}
            className="data-[state=checked]:bg-slate-950 data-[state=unchecked]:bg-amber-500"
            onCheckedChange={handleToggle}
          />
          <Moon
            className={cn(
              "h-4 w-4 transition-[color,transform] duration-200 ease-[var(--ease-out)] motion-reduce:transition-none",
              isDark
                ? "scale-100 text-blue-400"
                : "scale-90 text-muted-foreground"
            )}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{messages.theme.toggleTooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}
