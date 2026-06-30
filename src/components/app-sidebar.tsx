import {
  Info,
  LayoutDashboard,
  Plug,
  RadioTower,
  Server,
  Waves,
} from "lucide-react";
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
import { usePrefetchEndpoints } from "@/features/endpoints/hooks/use-prefetch-endpoints";
import { usePrefetchOverview } from "@/features/overview/hooks/use-prefetch-overview";

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/dashboard/overview",
      icon: LayoutDashboard,
      groupLabel: "Overview",
      badge: "Live",
    },
    {
      title: "Endpoints",
      url: "/dashboard/endpoints",
      icon: Plug,
      groupLabel: "Biller Simulator",
      badge: "API",
    },
    {
      title: "TCP Client",
      url: "/dashboard/socket-test/tcp-client",
      icon: RadioTower,
      groupLabel: "Socket Test",
    },
    {
      title: "TCP Server",
      url: "/dashboard/socket-test/tcp-server",
      icon: Server,
      groupLabel: "Socket Test",
    },
    {
      title: "UDP",
      url: "/dashboard/socket-test/udp",
      icon: Waves,
      groupLabel: "Socket Test",
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

  // Prefetch hooks for hover behavior
  const { prefetchOverview } = usePrefetchOverview();
  const { prefetchEndpoints } = usePrefetchEndpoints();

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

  const navMain = data.navMain.map((item) => {
    let onPrefetch: (() => void) | undefined;
    if (item.url === "/dashboard/overview") {
      onPrefetch = prefetchOverview;
    } else if (item.url === "/dashboard/endpoints") {
      onPrefetch = prefetchEndpoints;
    }

    return {
      ...item,
      onPrefetch,
    };
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
        <NavMain items={navMain} />
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
