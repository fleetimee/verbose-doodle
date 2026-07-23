import { MoonIcon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { messages } from "@/lib/i18n";

export function ModeToggle() {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="outline">
          <HugeiconsIcon
            className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 opacity-100 transition-[opacity,transform] duration-[160ms] ease-[var(--ease-out)] motion-reduce:transition-none dark:-rotate-90 dark:scale-[0.92] dark:opacity-0"
            icon={Sun03Icon}
            strokeWidth={2}
          />
          <HugeiconsIcon
            className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-[0.92] opacity-0 transition-[opacity,transform] duration-[160ms] ease-[var(--ease-out)] motion-reduce:transition-none dark:rotate-0 dark:scale-100 dark:opacity-100"
            icon={MoonIcon}
            strokeWidth={2}
          />
          <span className="sr-only">{messages.theme.toggleAriaLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          {messages.theme.light}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          {messages.theme.dark}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          {messages.theme.system}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
