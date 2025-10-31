import {
  LayoutDashboard,
  LifeBuoy,
  Plug,
  Send,
  Settings,
  Users,
  Wallet,
} from "lucide-react";
import type React from "react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/context";

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/dashboard/overview",
      icon: LayoutDashboard,
    },
    {
      title: "Endpoints",
      url: "/dashboard/endpoints",
      icon: Plug,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: Users,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: Send,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { authState } = useAuth();

  // Construct user object for NavUser component
  const user = authState.user
    ? {
        name: authState.user.username,
        email: `${authState.user.role.toLowerCase()}@biller-simulator.local`,
        avatar: "", // No avatar for now, will show initials
      }
    : {
        name: "Guest",
        email: "guest@biller-simulator.local",
        avatar: "",
      };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Wallet className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    Biller Simulator JSON
                  </span>
                  <span className="truncate text-xs">BPDDIY</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary className="mt-auto" items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
