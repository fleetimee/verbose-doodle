import { KeyboardIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { getSidebarData } from "@/components/app-sidebar";
import { useI18n } from "@/components/i18n-provider";
import { getNavigationShortcuts } from "@/components/nav-main";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Kbd } from "@/components/ui/kbd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/features/auth/context";
import { formatOptionShortcut, isMacPlatform } from "@/lib/keyboard-shortcuts";

export function KeyboardShortcutsDrawer({
  open,
  onOpenChange,
  hideTrigger = false,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
} = {}) {
  const { messages } = useI18n();
  const { snapshot } = useAuth();
  const copy = messages.common.keyboardShortcuts;
  const admin = snapshot.user?.role === "ADMIN";
  const items = getSidebarData(messages).navMain.filter(
    (item) => !item.adminOnly || admin
  );
  const assignments = getNavigationShortcuts(items);
  const modifier = isMacPlatform() ? "⌘" : "Ctrl";
  const workspace = [
    [copy.search, `${modifier} + K`],
    [copy.sidebar, `${modifier} + B`],
    ...(admin ? [[copy.console, "Ctrl + `"]] : []),
    [copy.close, "Esc"],
  ];
  const contextual = [
    [copy.tools, `${modifier} + Enter`],
    [copy.send, "Enter"],
    [copy.newline, "Shift + Enter"],
    [copy.commands, "/"],
    [copy.commandSelect, "Enter / Tab"],
    [copy.commandMove, "↑ / ↓"],
    [copy.resize, "↑ / ↓"],
    [copy.resizeLarge, "Shift + ↑ / ↓"],
    [copy.bounds, "Home / End"],
    [copy.tour, "← / →"],
    [copy.rename, "Enter / Esc"],
    [copy.unlock, "Enter"],
  ];

  return (
    <Drawer direction="right" onOpenChange={onOpenChange} open={open}>
      {!hideTrigger && (
        <DrawerTrigger asChild>
          <Button
            aria-label={copy.title}
            size="icon-sm"
            title={copy.title}
            variant="ghost"
          >
            <HugeiconsIcon icon={KeyboardIcon} strokeWidth={2} />
          </Button>
        </DrawerTrigger>
      )}
      <DrawerContent showSwipeHandle={false}>
        <DrawerHeader>
          <DrawerTitle>{copy.title}</DrawerTitle>
          <DrawerDescription>{copy.description}</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-6 px-4 pb-4">
            <ShortcutSection rows={workspace} title={copy.workspace} />
            <section className="space-y-3">
              <h3 className="font-medium text-sm">{copy.navigation}</h3>
              <p className="text-muted-foreground text-xs">
                {copy.navigationHint}
              </p>
              <dl className="divide-y">
                {items.map((item, index) => (
                  <div key={item.title}>
                    <ShortcutRow
                      label={item.title}
                      shortcut={formatOptionShortcut(
                        assignments.itemKeys[index].toUpperCase()
                      )}
                    />
                    {item.items?.map((child, childIndex) => (
                      <div className="pl-3" key={child.url}>
                        <ShortcutRow
                          label={child.title}
                          shortcut={formatOptionShortcut(
                            assignments.childKeys[index][
                              childIndex
                            ].toUpperCase()
                          )}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </dl>
            </section>
            <ShortcutSection rows={contextual} title={copy.context} />
            <p className="text-muted-foreground text-xs">{copy.other}</p>
          </div>
        </ScrollArea>
        <DrawerFooter variant="bordered">
          <DrawerClose asChild>
            <Button variant="outline">{messages.common.close}</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ShortcutSection({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <section className="space-y-3">
      <h3 className="font-medium text-sm">{title}</h3>
      <dl className="divide-y">
        {rows.map(([label, shortcut]) => (
          <ShortcutRow key={label} label={label} shortcut={shortcut} />
        ))}
      </dl>
    </section>
  );
}

function ShortcutRow({ label, shortcut }: { label: string; shortcut: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <dt className="text-sm">{label}</dt>
      <dd className="shrink-0">
        <Kbd>{shortcut}</Kbd>
      </dd>
    </div>
  );
}
