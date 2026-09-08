import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  SearchIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import type { HugeIcon } from "@/components/hugeicons";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
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
  const { pathname } = useLocation();
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
  const currentResult = results
    .filter(
      (result) =>
        pathname === result.url || pathname.startsWith(`${result.url}/`)
    )
    .sort((a, b) => b.url.length - a.url.length)[0];

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
            className="navigation-search-trigger h-9"
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
        className="navigation-search-dialog"
        commandProps={{ defaultValue: currentResult?.url, key: String(open) }}
        description="Search all available modules and menus"
        onOpenChange={setOpen}
        open={open}
        title="Search modules and menus"
      >
        <CommandInput placeholder="Search modules and menus..." />
        <CommandList>
          <CommandEmpty>
            <HugeiconsIcon aria-hidden="true" icon={SearchIcon} />
            <p>No module or menu found.</p>
            <p className="navigation-search-empty-hint">
              Try a tool name or category, like JSON or Validation.
            </p>
          </CommandEmpty>
          {[...groups.entries()].map(([groupLabel, groupItems]) => (
            <CommandGroup heading={groupLabel} key={groupLabel}>
              {groupItems.map((item) => (
                <CommandItem
                  key={item.url}
                  keywords={[item.title, item.parentTitle ?? "", groupLabel]}
                  onSelect={() => selectResult(item.url)}
                  value={item.url}
                >
                  <item.icon aria-hidden="true" />
                  <span className="navigation-search-result">
                    <span className="navigation-search-title">
                      {item.title}
                    </span>
                    {item.parentTitle ? (
                      <span className="navigation-search-parent">
                        {item.parentTitle}
                      </span>
                    ) : null}
                  </span>
                  <HugeiconsIcon
                    aria-hidden="true"
                    className="navigation-search-arrow"
                    icon={ArrowRight01Icon}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
        <div className="navigation-search-footer">
          <span className="navigation-search-hint">
            <KbdGroup aria-label="Up and down arrow keys">
              <Kbd>
                <HugeiconsIcon icon={ArrowUp01Icon} />
              </Kbd>
              <Kbd>
                <HugeiconsIcon icon={ArrowDown01Icon} />
              </Kbd>
            </KbdGroup>
            Navigate
          </span>
          <span className="navigation-search-hint">
            <Kbd>Enter</Kbd>Open
          </span>
          <span className="navigation-search-hint ml-auto">
            <Kbd>Esc</Kbd>Close
          </span>
        </div>
      </CommandDialog>
    </>
  );
}
