import type React from "react";
import { useMemo } from "react";
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
import { useI18n } from "@/components/i18n-provider";
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

type SidebarData = {
  readonly navMain: AppNavigationItem[];
  readonly navSecondary: SecondaryNavigationItem[];
};

function getSidebarData(messages: import("@/lib/i18n").Messages): SidebarData {
  return {
    navMain: [
      {
        groupLabel: messages.common.navWorkspace,
        icon: LayoutDashboard,
        description: messages.common.navOverviewDesc,
        title: messages.common.navOverview,
        url: "/dashboard/overview",
      },
      {
        groupLabel: messages.common.navWorkspace,
        icon: Plug,
        description: messages.common.navEndpointsDesc,
        title: messages.common.navEndpoints,
        url: "/dashboard/endpoints",
      },
      {
        groupLabel: messages.common.navNetworkTools,
        icon: RadioTower,
        items: [
          {
            icon: MonitorUp,
            description: messages.common.navTcpClientDesc,
            title: messages.common.navTcpClient,
            url: "/dashboard/socket-test/tcp-client",
          },
          {
            icon: Server,
            description: messages.common.navTcpServerDesc,
            title: messages.common.navTcpServer,
            url: "/dashboard/socket-test/tcp-server",
          },
          {
            icon: Waves,
            description: messages.common.navUdpDesc,
            title: messages.common.navUdp,
            url: "/dashboard/socket-test/udp",
          },
        ],
        description: messages.common.navSocketTesterDesc,
        title: messages.common.navSocketTester,
        url: "/dashboard/socket-tester",
      },
      {
        adminOnly: true,
        groupLabel: messages.common.navNetworkTools,
        icon: Route,
        items: [
          {
            icon: Plug,
            description: messages.common.navRestApiDesc,
            title: messages.common.navRestApi,
            url: "/dashboard/socks-relay/rest-api",
          },
          {
            icon: Binary,
            description: messages.common.navIso8583Desc,
            title: messages.common.navIso8583,
            url: "/dashboard/socks-relay/iso-8583",
          },
        ],
        description: messages.common.navSocksRelayDesc,
        title: messages.common.navSocksRelay,
        url: "/dashboard/socks-relay",
      },
      {
        badge: String(DEVELOPER_TOOL_COUNT),
        exact: true,
        groupLabel: messages.developerTools.navigationGroup,
        icon: LayoutGrid,
        description: messages.developerTools.description,
        title: messages.developerTools.catalogNavigation,
        url: "/dashboard/developer-tools",
      },
      {
        groupLabel: messages.developerTools.navigationGroup,
        icon: Binary,
        description: messages.developerTools.iso8583NavigationDescription,
        title: messages.common.navIso8583,
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
            title: messages.developerTools.iso8583ParserLabel,
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
            title: messages.developerTools.iso8583GeneratorLabel,
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
      })).filter((category) => category.items.length > 0),
      {
        groupLabel: messages.common.navFun,
        icon: Waves,
        title: messages.common.navFunGames,
        items: [
          {
            icon: Waves,
            description: messages.common.fallLineDescription,
            title: messages.common.fallLineTitle,
            url: "/dashboard/games/fall-line",
          },
          {
            icon: LayoutGrid,
            description: messages.common.terrabrowserDescription,
            title: messages.common.terrabrowserTitle,
            url: "/dashboard/games/terrabrowser",
          },
          {
            icon: Route,
            description: messages.common.ponpokoKartDescription,
            title: messages.common.ponpokoKartTitle,
            url: "/dashboard/games/ponpoko-kart",
          },
          {
            icon: Waves,
            description: messages.common.emberwakeDescription,
            title: messages.common.emberwakeTitle,
            url: "/dashboard/games/emberwake",
          },
          {
            icon: LayoutGrid,
            description: messages.common.buildYourTownDescription,
            title: messages.common.buildYourTownTitle,
            url: "/dashboard/games/build-your-town",
          },
          {
            icon: LayoutGrid,
            description: messages.common.chess3dDescription,
            title: messages.common.chess3dTitle,
            url: "/dashboard/games/chess-3d",
          },
          {
            icon: Route,
            description: messages.common.novaLancerDescription,
            title: messages.common.novaLancerTitle,
            url: "/dashboard/games/nova-lancer",
          },
          {
            icon: Route,
            description: messages.common.sunbreakDescription,
            title: messages.common.sunbreakTitle,
            url: "/dashboard/games/sunbreak",
          },
        ],
      },
    ],
    navSecondary: [
      {
        icon: Info,
        description: messages.common.navAboutDesc,
        title: messages.common.navAbout,
        url: "/about",
      },
    ],
  };
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { snapshot } = useAuth();
  const { messages } = useI18n();
  const data = useMemo(() => getSidebarData(messages), [messages]);

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
        name: messages.common.guest,
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
      <SidebarHeader className="relative z-10" variant="compact">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link to="/dashboard/overview" />}
              size="lg"
              variant="brand"
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
              groupLabel: messages.common.navGeneral,
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
      <SidebarFooter className="relative z-10" variant="compact">
        <NavSecondary items={data.navSecondary}>
          <SessionTimer />
        </NavSecondary>
        <SocketBridgeStatus />
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
