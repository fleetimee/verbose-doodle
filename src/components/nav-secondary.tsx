import type React from "react";
import { Link, useLocation } from "react-router";
import type { HugeIcon } from "@/components/hugeicons";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavSecondary({
  items,
  children,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: HugeIcon;
    onPrefetch?: () => void;
  }[];
  children?: React.ReactNode;
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const location = useLocation();

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive =
              location.pathname === item.url ||
              location.pathname.startsWith(`${item.url}/`);
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  className="rounded-lg text-sidebar-foreground/75"
                  isActive={isActive}
                  render={<Link onMouseEnter={item.onPrefetch} to={item.url} />}
                  size="sm"
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          {children}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
