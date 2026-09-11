import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import type { HugeIcon } from "@/components/hugeicons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  formatOptionShortcut,
  matchesOptionShortcut,
} from "@/lib/keyboard-shortcuts";

export type NavMainSubItem = {
  title: string;
  url: string;
  icon: HugeIcon;
  onPrefetch?: () => void;
};

export type NavMainItem = {
  title: string;
  url?: string;
  icon: HugeIcon;
  groupLabel: string;
  badge?: string;
  exact?: boolean;
  isActive?: boolean;
  onPrefetch?: () => void;
  items?: NavMainSubItem[];
};

function findShortcutChild(
  event: KeyboardEvent,
  items: readonly NavMainSubItem[],
  shortcutKeys: readonly string[]
): NavMainSubItem | undefined {
  const childIndex = shortcutKeys.findIndex((shortcutKey) =>
    matchesOptionShortcut(event, shortcutKey)
  );
  return items[childIndex];
}

function getShortcutDestination({
  childShortcutKeys,
  event,
  item,
  open,
}: {
  childShortcutKeys: readonly string[];
  event: KeyboardEvent;
  item: NavMainItem;
  open: boolean;
}): string | undefined {
  const submenuItems = item.items ?? [];
  const child = open
    ? findShortcutChild(event, submenuItems, childShortcutKeys)
    : undefined;

  return child?.url;
}

function NavMenuItem({
  childShortcutKeys,
  item,
  currentPath,
  isAltHeld,
  shortcutKey,
}: {
  childShortcutKeys: readonly string[];
  item: NavMainItem;
  currentPath: string;
  isAltHeld: boolean;
  shortcutKey: string;
}) {
  const navigate = useNavigate();
  const { state, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed" && !isMobile;
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const isChildActive = item.items?.some(
    (subItem) =>
      currentPath === subItem.url || currentPath.startsWith(`${subItem.url}/`)
  );

  const [open, setOpen] = useState(Boolean(isChildActive));
  const submenuOpen = isCollapsed ? flyoutOpen : open;

  useEffect(() => {
    setFlyoutOpen(false);
  }, [currentPath, isCollapsed]);

  useEffect(() => {
    if (isChildActive) {
      setOpen(true);
    }
  }, [isChildActive]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const submenuItems = item.items ?? [];
      const destination = getShortcutDestination({
        childShortcutKeys,
        event,
        item,
        open: submenuOpen,
      });

      if (destination) {
        event.preventDefault();
        navigate(destination);
        setFlyoutOpen(false);
        return;
      }

      if (!matchesOptionShortcut(event, shortcutKey)) {
        return;
      }

      event.preventDefault();
      if (submenuItems.length > 0) {
        if (isCollapsed) {
          setFlyoutOpen((currentOpen) => !currentOpen);
        } else {
          setOpen((currentOpen) => !currentOpen);
        }
        return;
      }
      if (item.url) {
        navigate(item.url);
      }
    };

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [
    childShortcutKeys,
    item.items,
    item.url,
    navigate,
    submenuOpen,
    isCollapsed,
    shortcutKey,
  ]);

  if (!item.items || item.items.length === 0) {
    const isActive =
      currentPath === item.url ||
      (!item.exact && !!item.url && currentPath.startsWith(`${item.url}/`));

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          aria-keyshortcuts={`Alt+${shortcutKey.toUpperCase()}`}
          className="h-9 rounded-lg data-[active=true]:shadow-xs"
          isActive={isActive}
          render={
            item.url ? (
              <Link onMouseEnter={item.onPrefetch} to={item.url} />
            ) : undefined
          }
          tooltip={item.title}
        >
          <item.icon />
          <span>{item.title}</span>
        </SidebarMenuButton>
        {isAltHeld ? (
          <SidebarMenuBadge>
            <Kbd aria-hidden="true">
              {formatOptionShortcut(shortcutKey.toUpperCase())}
            </Kbd>
          </SidebarMenuBadge>
        ) : null}
        {!isAltHeld && item.badge ? (
          <SidebarMenuBadge className="text-sidebar-foreground/55">
            {item.badge}
          </SidebarMenuBadge>
        ) : null}
      </SidebarMenuItem>
    );
  }

  if (isCollapsed) {
    return (
      <SidebarMenuItem>
        <DropdownMenu onOpenChange={setFlyoutOpen} open={flyoutOpen}>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                aria-keyshortcuts={`Alt+${shortcutKey.toUpperCase()}`}
                aria-label={item.title}
                className="relative rounded-lg data-popup-open:bg-sidebar-accent data-[active=true]:shadow-xs"
                isActive={isChildActive}
                tooltip={flyoutOpen ? undefined : item.title}
              />
            }
          >
            <item.icon />
            <HugeiconsIcon
              aria-hidden="true"
              className="absolute right-0.5 bottom-0.5 size-2! text-sidebar-foreground/65"
              icon={ArrowRight01Icon}
              strokeWidth={2}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-64 max-w-[calc(100vw-2rem)] rounded-xl p-1.5 motion-reduce:transition-none"
            side="right"
            sideOffset={10}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="px-2 py-2 text-muted-foreground text-xs">
                {item.title}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {item.items.map((subItem, index) => {
                const isActive =
                  currentPath === subItem.url ||
                  currentPath.startsWith(`${subItem.url}/`);
                const childKey = childShortcutKeys[index];
                return (
                  <DropdownMenuItem
                    aria-current={isActive ? "page" : undefined}
                    aria-keyshortcuts={
                      childKey ? `Alt+${childKey.toUpperCase()}` : undefined
                    }
                    className="min-h-9 gap-2.5 rounded-lg aria-[current=page]:bg-sidebar-accent aria-[current=page]:font-medium aria-[current=page]:text-sidebar-accent-foreground"
                    key={subItem.url}
                    render={
                      <Link
                        onFocus={subItem.onPrefetch}
                        onMouseEnter={subItem.onPrefetch}
                        to={subItem.url}
                      />
                    }
                  >
                    <subItem.icon />
                    <span className="flex-1">{subItem.title}</span>
                    {isAltHeld && childKey ? (
                      <Kbd aria-hidden="true">
                        {formatOptionShortcut(childKey.toUpperCase())}
                      </Kbd>
                    ) : null}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible onOpenChange={setOpen} open={open}>
      <SidebarMenuItem>
        <CollapsibleTrigger
          className="group/collapsible-trigger"
          render={
            <SidebarMenuButton
              aria-keyshortcuts={`Alt+${shortcutKey.toUpperCase()}`}
              className="h-9 rounded-lg data-[active=true]:shadow-xs"
              isActive={isChildActive}
              tooltip={item.title}
            >
              <item.icon />
              <span>{item.title}</span>
              {isAltHeld ? (
                <span className="ml-auto flex shrink-0 gap-1">
                  <Kbd aria-hidden="true">
                    {formatOptionShortcut(shortcutKey.toUpperCase())}
                  </Kbd>
                </span>
              ) : null}
              <HugeiconsIcon
                className="size-4 transition-transform duration-200 group-data-[open]/collapsible-trigger:rotate-90"
                icon={ArrowRight01Icon}
                strokeWidth={2}
              />
            </SidebarMenuButton>
          }
        />
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem, subItemIndex) => {
              const isSubActive =
                currentPath === subItem.url ||
                currentPath.startsWith(`${subItem.url}/`);
              const childShortcutKey = childShortcutKeys[subItemIndex];
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
                    aria-keyshortcuts={
                      childShortcutKey
                        ? `Alt+${childShortcutKey.toUpperCase()}`
                        : undefined
                    }
                    isActive={isSubActive}
                    render={
                      <Link
                        onMouseEnter={subItem.onPrefetch}
                        to={subItem.url}
                      />
                    }
                    size="sm"
                  >
                    <subItem.icon />
                    <span>{subItem.title}</span>
                    {isAltHeld && childShortcutKey ? (
                      <Kbd aria-hidden="true" className="ml-auto">
                        {formatOptionShortcut(childShortcutKey.toUpperCase())}
                      </Kbd>
                    ) : null}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function NavMain({ items }: { items: NavMainItem[] }) {
  const location = useLocation();
  const [isAltHeld, setIsAltHeld] = useState(false);
  const shortcutAssignments = useMemo(() => {
    const usedKeys = new Set<string>();
    const findAvailableKey = (title: string) => {
      const availableKey = title
        .toLowerCase()
        .replaceAll(/[^a-z0-9]/g, "")
        .split("")
        .find((character) => !usedKeys.has(character));
      const fallbackKey = "1234567890abcdefghijklmnopqrstuvwxyz"
        .split("")
        .find((character) => !usedKeys.has(character));
      const shortcutKey = availableKey ?? fallbackKey ?? "0";
      usedKeys.add(shortcutKey);
      return shortcutKey;
    };
    const itemKeys = items.map((item) => findAvailableKey(item.title));
    const childKeys = items.map((item) =>
      (item.items ?? []).map((child) => findAvailableKey(child.title))
    );

    return { childKeys, itemKeys };
  }, [items]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Alt") {
        setIsAltHeld(true);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Alt") {
        setIsAltHeld(false);
      }
    };
    const hideShortcuts = () => setIsAltHeld(false);

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", hideShortcuts);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", hideShortcuts);
    };
  }, []);
  const groups = items.reduce<
    {
      label: string;
      items: NavMainItem[];
    }[]
  >((accumulator, item) => {
    const existingGroup = accumulator.find(
      (group) => group.label === item.groupLabel
    );

    if (existingGroup) {
      existingGroup.items.push(item);
      return accumulator;
    }

    accumulator.push({
      items: [item],
      label: item.groupLabel,
    });

    return accumulator;
  }, []);

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => {
              const itemIndex = items.indexOf(item);
              return (
                <NavMenuItem
                  childShortcutKeys={
                    shortcutAssignments.childKeys[itemIndex] ?? []
                  }
                  currentPath={location.pathname}
                  isAltHeld={isAltHeld}
                  item={item}
                  key={item.title}
                  shortcutKey={
                    shortcutAssignments.itemKeys[itemIndex] ??
                    String(itemIndex + 1)
                  }
                />
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
