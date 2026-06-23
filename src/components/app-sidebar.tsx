import { Info, LayoutDashboard, Plug, Users } from "lucide-react";
import type React from "react";
import { Link } from "react-router";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { SessionTimer } from "@/components/session-timer";
import { Logo } from "@/components/ui/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { useAuth } from "@/features/auth/context";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import { usePrefetchEndpoints } from "@/features/endpoints/hooks/use-prefetch-endpoints";
import { usePrefetchOverview } from "@/features/overview/hooks/use-prefetch-overview";
import { usePrefetchUsers } from "@/features/users/hooks/use-prefetch-users";

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/dashboard/overview",
      icon: LayoutDashboard,
      badge: "Live",
    },
    {
      title: "Endpoints",
      url: "/dashboard/endpoints",
      icon: Plug,
      badge: "API",
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: Users,
    },
  ],
  navSecondary: [
    {
      title: "About",
      url: "/about",
      icon: Info,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { authState } = useAuth();
  const { can } = usePermissions({ role: authState.user?.role });

  // Prefetch hooks for hover behavior
  const { prefetchOverview } = usePrefetchOverview();
  const { prefetchEndpoints } = usePrefetchEndpoints();
  const { prefetchUsers } = usePrefetchUsers();

  // Construct user object for NavUser component
  const user = authState.user
    ? {
        name: authState.user.username,
        email: `${authState.user.role.toLowerCase()}@fleetime-labs.local`,
        avatar: "", // No avatar for now, will show initials
      }
    : {
        name: "Guest",
        email: "guest@fleetime-labs.local",
        avatar: "",
      };

  // Map navigation items with prefetch handlers and filter based on permissions
  const filteredNavMain = data.navMain
    .map((item) => {
      // Add prefetch handler based on the route
      let onPrefetch: (() => void) | undefined;
      if (item.url === "/dashboard/overview") {
        onPrefetch = prefetchOverview;
      } else if (item.url === "/dashboard/endpoints") {
        onPrefetch = prefetchEndpoints;
      } else if (item.url === "/dashboard/users") {
        onPrefetch = prefetchUsers;
      }

      return {
        ...item,
        onPrefetch,
      };
    })
    .filter((item) => {
      // Users page requires canViewUsers permission
      if (item.url === "/dashboard/users") {
        return can("canViewUsers");
      }
      // All other pages are accessible to all authenticated users
      return true;
    });

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader className="p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="h-14 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/45 px-2.5 shadow-xs group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none"
              size="lg"
            >
              <Link to="/dashboard/overview">
                <div className="flex aspect-square size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm group-data-[collapsible=icon]:size-8">
                  <Logo
                    className="size-6 group-data-[collapsible=icon]:size-5"
                    size="sm"
                    theme="auto"
                    variant="icon"
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    BPDDIY DevTools
                  </span>
                  <span className="truncate text-sidebar-foreground/65 text-xs">
                    Fleetime Labs
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="group-data-[collapsible=icon]:items-center">
        <NavMain items={filteredNavMain} />
        <NavSecondary className="mt-auto" items={data.navSecondary}>
          <SessionTimer />
        </NavSecondary>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
