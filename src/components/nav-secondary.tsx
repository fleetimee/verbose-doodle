import type { LucideIcon } from "lucide-react";
import type React from "react";
import { Link, useLocation } from "react-router";
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
    icon: LucideIcon;
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
                <SidebarMenuButton asChild isActive={isActive} size="sm">
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
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
