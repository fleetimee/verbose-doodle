import {
  KeyboardIcon,
  MoreHorizontalCircle01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { KeyboardShortcutsDrawer } from "@/components/keyboard-shortcuts-drawer";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LockScreenButton } from "@/features/auth/components/screen-lock";
import { useIsMobile } from "@/hooks/use-mobile";

export function HeaderActions({
  theme,
  onThemeChange,
}: {
  theme?: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
}) {
  const { messages } = useI18n();
  const mobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    if (!mobile) {
      setOpen(false);
    }
  }, [mobile]);

  return (
    <>
      <div className="hidden items-center gap-1 md:flex">
        <LockScreenButton />
        <KeyboardShortcutsDrawer />
        <LanguageSwitcher />
        <ThemeSwitcher onChange={onThemeChange} value={theme} />
      </div>
      <div className="md:hidden">
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger
            render={
              <Button
                aria-label={messages.common.more}
                size="icon-sm"
                variant="ghost"
              />
            }
          >
            <HugeiconsIcon icon={MoreHorizontalCircle01Icon} strokeWidth={2} />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64" size="none">
            <div className="grid gap-1 p-2">
              <div className="flex min-h-10 items-center justify-between gap-3 px-2">
                <span className="text-sm">{messages.auth.lockScreen}</span>
                <LockScreenButton />
              </div>
              <Button
                className="w-full justify-start"
                onClick={() => {
                  setOpen(false);
                  setShortcutsOpen(true);
                }}
                variant="ghost"
              >
                <HugeiconsIcon
                  data-icon="inline-start"
                  icon={KeyboardIcon}
                  strokeWidth={2}
                />
                {messages.common.keyboardShortcuts.title}
              </Button>
              <div className="flex min-h-10 items-center justify-between gap-3 px-2">
                <span className="text-sm">
                  {messages.common.headerLanguage}
                </span>
                <LanguageSwitcher />
              </div>
              <div className="flex min-h-10 items-center justify-between gap-3 px-2">
                <span className="text-sm">
                  {messages.common.headerAppearance}
                </span>
                <ThemeSwitcher onChange={onThemeChange} value={theme} />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <KeyboardShortcutsDrawer
        hideTrigger
        onOpenChange={setShortcutsOpen}
        open={shortcutsOpen}
      />
    </>
  );
}
