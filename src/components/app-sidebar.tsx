import type React from "react";
import { Link } from "react-router";
import {
  Binary,
  Info,
  LayoutDashboard,
  LayoutGrid,
  MonitorUp,
  Plug,
  RadioTower,
  Route,
  Server,
  Waves,
} from "@/components/hugeicons";
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
import {
  DEVELOPER_TOOL_CATEGORIES,
  DEVELOPER_TOOL_COUNT,
  getDeveloperToolHref,
} from "@/features/developer-tools/catalog";
import { useEndpointCatalog } from "@/features/endpoints/hooks/use-endpoint-catalog";
import { usePrefetchOverview } from "@/features/overview/hooks/use-prefetch-overview";
import { SocketBridgeStatus } from "@/features/socket-tester/components/socket-bridge-floating-status";
import { messages } from "@/lib/i18n";

const data = {
  navMain: [
    {
      groupLabel: "Workspace",
      icon: LayoutDashboard,
      title: "Overview",
      url: "/dashboard/overview",
    },
    {
      groupLabel: "Workspace",
      icon: Plug,
      title: "Endpoints",
      url: "/dashboard/endpoints",
    },
    {
      groupLabel: "Network Tools",
      icon: RadioTower,
      items: [
        {
          icon: MonitorUp,
          title: "TCP Client",
          url: "/dashboard/socket-test/tcp-client",
        },
        {
          icon: Server,
          title: "TCP Server",
          url: "/dashboard/socket-test/tcp-server",
        },
        {
          icon: Waves,
          title: "UDP",
          url: "/dashboard/socket-test/udp",
        },
      ],
      title: "Socket Tester",
    },
    {
      adminOnly: true,
      groupLabel: "Network Tools",
      icon: Route,
      items: [
        {
          icon: Plug,
          title: "REST API",
          url: "/dashboard/socks-relay/rest-api",
        },
        {
          icon: Binary,
          title: "ISO 8583",
          url: "/dashboard/socks-relay/iso-8583",
        },
      ],
      title: "SOCKS Relay",
    },
    {
      badge: String(DEVELOPER_TOOL_COUNT),
      exact: true,
      groupLabel: messages.developerTools.navigationGroup,
      icon: LayoutGrid,
      title: messages.developerTools.catalogNavigation,
      url: "/dashboard/developer-tools",
    },
    ...DEVELOPER_TOOL_CATEGORIES.map((category) => ({
      groupLabel: messages.developerTools.navigationGroup,
      icon: category.icon,
      items: category.tools.map((tool) => ({
        icon: tool.icon,
        title: tool.name,
        url: getDeveloperToolHref(tool),
      })),
      title: category.name,
    })),
  ],
  navSecondary: [
    {
      icon: Info,
      title: "About",
      url: "/about",
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { snapshot } = useAuth();

  // Prefetch hooks for hover behavior
  const { prefetchOverview } = usePrefetchOverview();
  const { prefetchEndpoints } = useEndpointCatalog();

  // Construct user object for NavUser component
  const user = snapshot.user
    ? {
        avatar: "", // No avatar for now, will show initials
        email: `${snapshot.user.role.toLowerCase()}@fleetime-labs.local`,
        name: snapshot.user.username,
      }
    : {
        avatar: "",
        email: "guest@fleetime-labs.local",
        name: "Guest",
      };

  const isAdmin = snapshot.user?.role === "ADMIN";
  const navMain = data.navMain
    .filter((item) => !item.adminOnly || isAdmin)
    .map((item) => {
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
              className="h-14 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/45 px-2.5 shadow-xs group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none"
              render={<Link to="/dashboard/overview" />}
              size="lg"
            >
              <div className="flex aspect-square size-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground shadow-sm group-data-[collapsible=icon]:size-8">
                <Logo
                  className="size-6 group-data-[collapsible=icon]:size-5"
                  size="sm"
                  theme="auto"
                  variant="icon"
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">BPDDIY DevTools</span>
                <span className="truncate text-sidebar-foreground/65 text-xs">
                  Fleetime Labs
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="group-data-[collapsible=icon]:items-center">
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
        <NavSecondary className="p-0" items={data.navSecondary}>
          <SessionTimer />
        </NavSecondary>
        <SocketBridgeStatus />
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
