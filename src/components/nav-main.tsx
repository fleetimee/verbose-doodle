import type { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavMainItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  groupLabel: string;
  badge?: string;
  isActive?: boolean;
  onPrefetch?: () => void;
};

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
            {group.items.map((item) => {
              const isActive =
                location.pathname === item.url ||
                location.pathname.startsWith(`${item.url}/`);

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className="h-9 rounded-lg data-[active=true]:shadow-xs"
                    isActive={isActive}
                    render={
                      <Link onMouseEnter={item.onPrefetch} to={item.url} />
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
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
