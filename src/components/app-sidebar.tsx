import type React from "react";
import { Link } from "react-router";
import {
  Info,
  LayoutDashboard,
  LayoutGrid,
  Network,
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
} from "@/features/developer-tools/catalog";
import { useEndpointCatalog } from "@/features/endpoints/hooks/use-endpoint-catalog";
import { usePrefetchOverview } from "@/features/overview/hooks/use-prefetch-overview";
import { messages } from "@/lib/i18n";

const data = {
  navMain: [
    {
      title: "Overview",
      url: "/dashboard/overview",
      icon: LayoutDashboard,
      groupLabel: "Overview",
    },
    {
      title: "Endpoints",
      url: "/dashboard/endpoints",
      icon: Plug,
      groupLabel: "Biller Simulator",
    },
    {
      title: "Socket Test",
      icon: RadioTower,
      groupLabel: "Socket Test",
      items: [
        {
          title: "TCP Client",
          url: "/dashboard/socket-test/tcp-client",
          icon: RadioTower,
        },
        {
          title: "TCP Server",
          url: "/dashboard/socket-test/tcp-server",
          icon: Server,
        },
        {
          title: "UDP",
          url: "/dashboard/socket-test/udp",
          icon: Waves,
        },
      ],
    },
    {
      title: messages.developerTools.catalogNavigation,
      url: "/dashboard/developer-tools",
      icon: LayoutGrid,
      groupLabel: messages.developerTools.navigationGroup,
      badge: String(DEVELOPER_TOOL_COUNT),
      exact: true,
    },
    ...DEVELOPER_TOOL_CATEGORIES.map((category) => ({
      title: category.name,
      icon: category.icon,
      groupLabel: messages.developerTools.navigationGroup,
      items: category.tools.map((tool) => ({
        title: tool.name,
        url: tool.href,
        icon: tool.icon,
      })),
    })),
    {
      title: "Socks Relay",
      icon: Network,
      groupLabel: "Socks Relay",
      adminOnly: true,
      items: [
        {
          title: "REST API",
          url: "/dashboard/socks-relay/rest-api",
          icon: Route,
        },
        {
          title: "ISO 8583",
          url: "/dashboard/socks-relay/iso-8583",
          icon: Network,
        },
      ],
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
  const { snapshot } = useAuth();

  // Prefetch hooks for hover behavior
  const { prefetchOverview } = usePrefetchOverview();
  const { prefetchEndpoints } = useEndpointCatalog();

  // Construct user object for NavUser component
  const user = snapshot.user
    ? {
        name: snapshot.user.username,
        email: `${snapshot.user.role.toLowerCase()}@fleetime-labs.local`,
        avatar: "", // No avatar for now, will show initials
      }
    : {
        name: "Guest",
        email: "guest@fleetime-labs.local",
        avatar: "",
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
