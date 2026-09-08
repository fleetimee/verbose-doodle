import { SearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import type { HugeIcon } from "@/components/hugeicons";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd } from "@/components/ui/kbd";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { formatCommandShortcut } from "@/lib/keyboard-shortcuts";

export type SearchNavigationItem = {
  readonly groupLabel: string;
  readonly icon: HugeIcon;
  readonly items?: readonly {
    readonly icon: HugeIcon;
    readonly title: string;
    readonly url: string;
  }[];
  readonly title: string;
  readonly url?: string;
};

type SearchResult = {
  readonly groupLabel: string;
  readonly icon: HugeIcon;
  readonly parentTitle?: string;
  readonly title: string;
  readonly url: string;
};

export function NavigationSearch({
  items,
}: {
  readonly items: readonly SearchNavigationItem[];
}) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const results = useMemo(
    () =>
      items.flatMap<SearchResult>((item) => {
        const directResult = item.url
          ? [
              {
                groupLabel: item.groupLabel,
                icon: item.icon,
                title: item.title,
                url: item.url,
              },
            ]
          : [];
        const childResults = (item.items ?? []).map((child) => ({
          groupLabel: item.groupLabel,
          icon: child.icon,
          parentTitle: item.title,
          title: child.title,
          url: child.url,
        }));

        return [...directResult, ...childResults];
      }),
    [items]
  );
  const groups = useMemo(
    () =>
      results.reduce<Map<string, SearchResult[]>>((accumulator, result) => {
        const group = accumulator.get(result.groupLabel) ?? [];
        group.push(result);
        accumulator.set(result.groupLabel, group);
        return accumulator;
      }, new Map()),
    [results]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((currentOpen) => !currentOpen);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const selectResult = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            aria-label="Search modules and menus"
            className="h-9 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/35"
            onClick={() => setOpen(true)}
            tooltip="Search"
          >
            <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />
            <span>Search</span>
            <Kbd className="ml-auto group-data-[collapsible=icon]:hidden">
              {formatCommandShortcut()}
            </Kbd>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <CommandDialog
        description="Search all available modules and menus"
        onOpenChange={setOpen}
        open={open}
        title="Search modules and menus"
      >
        <CommandInput placeholder="Search modules and menus..." />
        <CommandList>
          <CommandEmpty>No module or menu found.</CommandEmpty>
          {[...groups.entries()].map(([groupLabel, groupItems]) => (
            <CommandGroup heading={groupLabel} key={groupLabel}>
              {groupItems.map((item) => (
                <CommandItem
                  key={item.url}
                  onSelect={() => selectResult(item.url)}
                  value={`${item.title} ${item.parentTitle ?? ""} ${groupLabel}`}
                >
                  <item.icon />
                  <span>{item.title}</span>
                  {item.parentTitle ? (
                    <span className="ml-auto text-muted-foreground text-xs">
                      {item.parentTitle}
                    </span>
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
