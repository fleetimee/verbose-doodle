import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import type { HugeIcon } from "@/components/hugeicons";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

type NavMainSubItem = {
  title: string;
  url: string;
  icon: HugeIcon;
  onPrefetch?: () => void;
};

type NavMainItem = {
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

function NavMenuItem({
  item,
  currentPath,
}: {
  item: NavMainItem;
  currentPath: string;
}) {
  const isChildActive = item.items?.some(
    (subItem) =>
      currentPath === subItem.url || currentPath.startsWith(`${subItem.url}/`)
  );

  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (isChildActive) {
      setOpen(true);
    }
  }, [isChildActive]);

  if (!item.items || item.items.length === 0) {
    const isActive =
      currentPath === item.url ||
      (!item.exact && !!item.url && currentPath.startsWith(`${item.url}/`));

    return (
      <SidebarMenuItem>
        <SidebarMenuButton
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
        {item.badge ? (
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
            <SidebarMenuButton tooltip={item.title}>
              <item.icon />
              <span>{item.title}</span>
              <HugeiconsIcon
                className="ml-auto size-4 transition-transform duration-200 group-data-[open]/collapsible-trigger:rotate-90"
                icon={ArrowRight01Icon}
                strokeWidth={2}
              />
            </SidebarMenuButton>
          }
        />
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items.map((subItem) => {
              const isSubActive =
                currentPath === subItem.url ||
                currentPath.startsWith(`${subItem.url}/`);
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton
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
      label: item.groupLabel,
      items: [item],
    });

    return accumulator;
  }, []);

  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => (
              <NavMenuItem
                currentPath={location.pathname}
                item={item}
                key={item.title}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
