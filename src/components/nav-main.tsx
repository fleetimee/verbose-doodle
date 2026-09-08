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
  const isChildActive = item.items?.some(
    (subItem) =>
      currentPath === subItem.url || currentPath.startsWith(`${subItem.url}/`)
  );

  const [open, setOpen] = useState(Boolean(isChildActive));

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
        open,
      });

      if (destination) {
        event.preventDefault();
        navigate(destination);
        return;
      }

      if (!matchesOptionShortcut(event, shortcutKey)) {
        return;
      }

      event.preventDefault();
      if (submenuItems.length > 0) {
        setOpen((currentOpen) => !currentOpen);
        return;
      }
      if (item.url) {
        navigate(item.url);
      }
    };

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, [childShortcutKeys, item.items, item.url, navigate, open, shortcutKey]);

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

  return (
    <Collapsible onOpenChange={setOpen} open={open}>
      <SidebarMenuItem>
        <CollapsibleTrigger
          className="group/collapsible-trigger"
          render={
            <SidebarMenuButton
              aria-keyshortcuts={`Alt+${shortcutKey.toUpperCase()}`}
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
