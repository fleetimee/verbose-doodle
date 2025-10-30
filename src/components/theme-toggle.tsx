import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleToggle = (checked: boolean) => {
    const newTheme = checked ? "dark" : "light";

    if (!document.startViewTransition) {
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
              "h-4 w-4 transition-all duration-300",
              isDark
                ? "scale-90 text-muted-foreground"
                : "scale-100 text-amber-500"
            )}
          />
          <Switch
            aria-label="Toggle theme"
            checked={isDark}
            className="data-[state=checked]:bg-slate-950 data-[state=unchecked]:bg-amber-500"
            onCheckedChange={handleToggle}
          />
          <Moon
            className={cn(
              "h-4 w-4 transition-all duration-300",
              isDark
                ? "scale-100 text-blue-400"
                : "scale-90 text-muted-foreground"
            )}
          />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Toggle light/dark mode</p>
      </TooltipContent>
    </Tooltip>
  );
}
