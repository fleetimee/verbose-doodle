import type React from "react";
import { Link } from "react-router";
import {
  Binary,
  Code2,
  type HugeIcon,
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
import { NavMain, type NavMainItem } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { NavigationSearch } from "@/components/navigation-search";
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

type AppNavigationItem = NavMainItem & {
  readonly adminOnly?: boolean;
  readonly description?: string;
  readonly keywords?: readonly string[];
  readonly items?: (NonNullable<NavMainItem["items"]>[number] & {
    readonly description: string;
    readonly keywords?: readonly string[];
  })[];
};

type SecondaryNavigationItem = {
  readonly description: string;
  readonly icon: HugeIcon;
  readonly title: string;
  readonly url: string;
};

const data: {
  readonly navMain: AppNavigationItem[];
  readonly navSecondary: SecondaryNavigationItem[];
} = {
  navMain: [
    {
      groupLabel: "Workspace",
      icon: LayoutDashboard,
      description: "Review endpoint activity and workspace metrics.",
      title: "Overview",
      url: "/dashboard/overview",
    },
    {
      groupLabel: "Workspace",
      icon: Plug,
      description: "Configure billers, endpoints, and simulated responses.",
      title: "Endpoints",
      url: "/dashboard/endpoints",
    },
    {
      groupLabel: "Network Tools",
      icon: RadioTower,
      items: [
        {
          icon: MonitorUp,
          description: "Connect to a TCP server and exchange messages.",
          title: "TCP Client",
          url: "/dashboard/socket-test/tcp-client",
        },
        {
          icon: Server,
          description: "Listen for TCP connections and exchange messages.",
          title: "TCP Server",
          url: "/dashboard/socket-test/tcp-server",
        },
        {
          icon: Waves,
          description: "Send and receive UDP datagrams.",
          title: "UDP",
          url: "/dashboard/socket-test/udp",
        },
      ],
      description: "Test TCP and UDP connections.",
      title: "Socket Tester",
      url: "/dashboard/socket-tester",
    },
    {
      adminOnly: true,
      groupLabel: "Network Tools",
      icon: Route,
      items: [
        {
          icon: Plug,
          description: "Inspect REST API traffic through the relay.",
          title: "REST API",
          url: "/dashboard/socks-relay/rest-api",
        },
        {
          icon: Binary,
          description: "Inspect ISO 8583 messages through the relay.",
          title: "ISO 8583",
          url: "/dashboard/socks-relay/iso-8583",
        },
      ],
      description: "Monitor and inspect relayed network traffic.",
      title: "SOCKS Relay",
      url: "/dashboard/socks-relay",
    },
    {
      badge: String(DEVELOPER_TOOL_COUNT),
      exact: true,
      groupLabel: messages.developerTools.navigationGroup,
      icon: LayoutGrid,
      description: "Browse conversion, validation, and inspection tools.",
      title: messages.developerTools.catalogNavigation,
      url: "/dashboard/developer-tools",
    },
    {
      groupLabel: messages.developerTools.navigationGroup,
      icon: Binary,
      description: "Build, pack, parse, and inspect ISO 8583 messages.",
      title: "ISO 8583",
      items: [
        {
          description: messages.developerTools.iso8583ParserDescription,
          icon: Binary,
          keywords: [
            "ISO",
            "8583",
            "ISO 8583",
            "Parser",
            "ISO Parser",
            "Stream Parser",
            "Inspection",
            "Bitmaps",
            "MTI",
            "Hex",
            "Data Elements",
          ],
          title: "Parser",
          url: "/dashboard/developer-tools/iso8583-parser",
        },
        {
          description: messages.developerTools.iso8583GeneratorDescription,
          icon: Code2,
          keywords: [
            "ISO",
            "8583",
            "ISO 8583",
            "Generator",
            "Pack",
            "Build",
            "MTI",
            "Bitmaps",
            "Conversion",
          ],
          title: "Generator",
          url: "/dashboard/developer-tools/iso8583-generator",
        },
      ],
    },
    ...DEVELOPER_TOOL_CATEGORIES.map((category) => ({
      groupLabel: messages.developerTools.navigationGroup,
      icon: category.icon,
      items: category.tools
        .filter(
          (tool) =>
            tool.id !== "iso8583-parser" && tool.id !== "iso8583-generator"
        )
        .map((tool) => ({
          description: tool.searchDescription,
          icon: tool.icon,
          keywords: [
            ...tool.tags,
            ...tool.document.keywords,
            tool.name,
            tool.path,
          ],
          onPrefetch: tool.load,
          title: tool.name,
          url: getDeveloperToolHref(tool),
        })),
      title: category.name,
    })),
  ],
  navSecondary: [
    {
      icon: Info,
      description: "Learn about Fleetime Labs and its components.",
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

      const items = item.items?.map((subItem) => {
        let subPrefetch = subItem.onPrefetch;
        if (subItem.url === "/dashboard/developer-tools/iso8583-parser") {
          subPrefetch = () => {
            import("@/pages/dashboard/iso8583-parser");
          };
        } else if (
          subItem.url === "/dashboard/developer-tools/iso8583-generator"
        ) {
          subPrefetch = () => {
            import("@/pages/dashboard/iso8583-generator");
          };
        }
        return {
          ...subItem,
          onPrefetch: subPrefetch,
        };
      });

      return {
        ...item,
        items,
        onPrefetch,
      };
    });

  return (
    <Sidebar
      className="relative"
      collapsible="icon"
      variant="sidebar"
      {...props}
    >
      <SidebarHeader className="relative z-10 p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="h-14 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/45 px-2.5 shadow-xs group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none"
              render={<Link to="/dashboard/overview" />}
              size="lg"
            >
              <Logo
                className="size-9 shrink-0 group-data-[collapsible=icon]:size-8"
                size="sm"
                variant="icon"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">BPDDIY DevTools</span>
                <span className="truncate text-sidebar-foreground/65 text-xs">
                  Fleetime Labs
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavigationSearch
          items={[
            ...navMain,
            ...data.navSecondary.map((item) => ({
              ...item,
              groupLabel: "General",
            })),
          ]}
        />
      </SidebarHeader>
      <div
        aria-hidden="true"
        className="sidebar-mascot-backdrop hidden group-data-[collapsible=icon]:hidden md:block"
      >
        <img
          alt=""
          className="sidebar-mascot-image"
          decoding="async"
          height={1536}
          src="/brand/biller-operator-mascot.png"
          width={1024}
        />
      </div>
      <SidebarSeparator className="relative z-10" />
      <SidebarContent className="relative z-10 group-data-[collapsible=icon]:items-center">
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarSeparator className="relative z-10" />
      <SidebarFooter className="relative z-10 p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2">
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
