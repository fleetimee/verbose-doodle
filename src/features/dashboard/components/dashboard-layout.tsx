import React, { Suspense } from "react";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { useTheme } from "@/components/theme-provider";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { TourProvider } from "@/components/tour";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useGetBillers } from "@/features/billers/hooks/use-get-billers";
import { HttpMethodBadge } from "@/features/endpoints/components/http-method-badge";
import { useEndpointCatalog } from "@/features/endpoints/hooks/use-endpoint-catalog";
import { useEndpointWorkspace } from "@/features/endpoints/hooks/use-endpoint-workspace";
import type { HttpMethod } from "@/features/endpoints/types";
import { SocketBridgeFloatingStatus } from "@/features/socket-tester/components/socket-bridge-floating-status";
import { SocketBridgeProvider } from "@/features/socket-tester/context/socket-bridge-context";
import { messages } from "@/lib/i18n";
import { decodeId, encodeId } from "@/lib/id-encoder";

const routeLabels: Record<string, string> = {
  overview: "Overview",
  endpoints: "Endpoints",
  "socks-relay": "Socks Relay",
  "rest-api": "REST API",
  "iso-8583": "ISO 8583",
  "socket-test": "SocketTest",
  "socket-tester": "Socket Tester",
  "tcp-client": "TCP Client",
  "tcp-server": "TCP Server",
  udp: "UDP",
  users: "Users",
  settings: "Settings",
  "developer-tools": messages.developerTools.navigationGroup,
  "json-schema-validator": messages.jsonSchemaValidator.title,
  "cron-parser": messages.cronParser.title,
  "number-base-converter": messages.numberBaseConverter.title,
  "date-converter": messages.dateConverter.title,
  "jwt-inspector": messages.jwtInspector.title,
};

// Updated regex to match encoded IDs (base64 URL-safe characters)
const ENDPOINT_DETAIL_REGEX = /^\/dashboard\/endpoints\/([A-Za-z0-9_-]+)$/;

type DashboardBreadcrumbItem = {
  readonly billerId?: number;
  readonly href: string;
  readonly isLast: boolean;
  readonly isNavigable: boolean;
  readonly kind?: "biller" | "endpoint";
  readonly label: string;
  readonly method?: HttpMethod;
  readonly endpointId?: string;
  readonly url?: string;
};

export function DashboardLayout() {
  const location = useLocation();
  const params = useParams();
  const { theme, setTheme } = useTheme();
  const isSocksRelayRoute = location.pathname.startsWith(
    "/dashboard/socks-relay"
  );

  const isEndpointDetail = location.pathname.match(ENDPOINT_DETAIL_REGEX);
  const encodedId = isEndpointDetail ? params.id : undefined;

  // Decode the ID if we're on an endpoint detail page
  const decodedId = encodedId ? decodeId(encodedId) : undefined;

  const { endpoint: endpointQuery } = useEndpointWorkspace(decodedId || "");
  const { data: endpoint } = endpointQuery;

  const pathSegments = location.pathname
    .split("/")
    .filter((segment) => segment !== "");

  const breadcrumbItems: DashboardBreadcrumbItem[] = pathSegments.map(
    (segment, index) => {
      const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
      let label =
        routeLabels[segment] ||
        segment.charAt(0).toUpperCase() + segment.slice(1);
      let method: HttpMethod | undefined;
      let billerId: number | undefined;
      let endpointId: string | undefined;
      let kind: DashboardBreadcrumbItem["kind"];
      let url: string | undefined;

      // If this segment is the encoded ID and we have endpoint data, show the endpoint URL
      if (isEndpointDetail && segment === encodedId && endpoint) {
        label = `${endpoint.method} ${endpoint.url}`;
        billerId = endpoint.billerId;
        endpointId = endpoint.id;
        kind = "endpoint";
        method = endpoint.method;
        url = endpoint.url;
      }

      const isLast = index === pathSegments.length - 1;
      const isNavigable = segment !== "socket-test";

      return {
        billerId,
        endpointId,
        href,
        isLast,
        isNavigable,
        kind,
        label,
        method,
        url,
      };
    }
  );

  const endpointBreadcrumbIndex = breadcrumbItems.findIndex(
    (item) => item.label === "Endpoints"
  );

  if (isEndpointDetail && endpointBreadcrumbIndex !== -1) {
    breadcrumbItems.splice(endpointBreadcrumbIndex + 1, 0, {
      billerId: endpoint?.billerId,
      href: "/dashboard/endpoints",
      isLast: false,
      isNavigable: false,
      kind: "biller",
      label: endpoint?.billerName ?? "Biller",
    });
  }

  const themeSwitcherValue =
    theme === "light" || theme === "dark" ? theme : undefined;

  return (
    <TourProvider closeable>
      <SocketBridgeProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset className="overflow-hidden border border-border/70 bg-card shadow-sm">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur supports-backdrop-filter:bg-card/80">
              <SidebarTrigger className="-ml-1 rounded-md" />
              <Separator
                className="mr-2 data-[orientation=vertical]:h-4"
                orientation="vertical"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbItems.map((item, index) => (
                    <React.Fragment
                      key={`${item.href}-${item.kind ?? "route"}-${index}`}
                    >
                      <BreadcrumbItem
                        className={
                          item.isLast ? "min-w-0 max-w-full" : "hidden md:block"
                        }
                      >
                        <DashboardBreadcrumbContent item={item} />
                      </BreadcrumbItem>
                      {!item.isLast && (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                    </React.Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
              <div className="ml-auto">
                <ThemeSwitcher onChange={setTheme} value={themeSwitcherValue} />
              </div>
            </header>
            <main className="flex flex-1 flex-col gap-4 overflow-auto bg-background/70 p-4 md:p-6">
              <Suspense fallback={<DashboardPageFallback />}>
                <Outlet />
              </Suspense>
            </main>
          </SidebarInset>
        </SidebarProvider>
        {isSocksRelayRoute ? null : <SocketBridgeFloatingStatus />}
      </SocketBridgeProvider>
    </TourProvider>
  );
}

function DashboardBreadcrumbContent({
  item,
}: {
  readonly item: DashboardBreadcrumbItem;
}) {
  if (item.kind === "biller") {
    return (
      <BillerBreadcrumbSelector
        billerId={item.billerId}
        fallbackLabel={item.label}
      />
    );
  }

  if (item.kind === "endpoint") {
    return (
      <EndpointBreadcrumbSelector
        billerId={item.billerId}
        endpointId={item.endpointId}
        fallbackMethod={item.method}
        fallbackUrl={item.url}
      />
    );
  }

  if (item.isLast) {
    return (
      <BreadcrumbPage>
        {item.method && item.url ? (
          <EndpointBreadcrumbLabel method={item.method} url={item.url} />
        ) : (
          item.label
        )}
      </BreadcrumbPage>
    );
  }

  if (item.isNavigable) {
    return (
      <BreadcrumbLink render={<Link to={item.href} />}>
        {item.label}
      </BreadcrumbLink>
    );
  }

  return <span className="text-muted-foreground">{item.label}</span>;
}

function EndpointBreadcrumbLabel({
  method,
  url,
}: {
  readonly method: HttpMethod;
  readonly url: string;
}) {
  return (
    <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
      <HttpMethodBadge className="shrink-0" method={method} variant="text" />
      <span className="min-w-0 truncate">{url}</span>
    </span>
  );
}

function BillerBreadcrumbSelector({
  billerId,
  fallbackLabel,
}: {
  readonly billerId?: number;
  readonly fallbackLabel: string;
}) {
  const navigate = useNavigate();
  const { data: billers = [], isPending: isLoadingBillers } = useGetBillers();
  const { endpoints: endpointQuery } = useEndpointCatalog();
  const { data: endpoints = [], isPending: isLoadingEndpoints } = endpointQuery;
  const billersWithResponses = billers.filter((biller) =>
    endpoints.some(
      (endpoint) =>
        endpoint.billerId === biller.id && endpoint.responses.length > 0
    )
  );
  const currentBiller = billersWithResponses.find(
    (biller) => biller.id === billerId
  );

  if (
    isLoadingBillers ||
    isLoadingEndpoints ||
    billerId === undefined ||
    !currentBiller
  ) {
    return <span className="text-muted-foreground">{fallbackLabel}</span>;
  }

  return (
    <Select
      onValueChange={(value) => {
        const nextBillerId = Number(value);
        const firstEndpoint = endpoints.find(
          (endpoint) => endpoint.billerId === nextBillerId
        );

        if (
          Number.isSafeInteger(nextBillerId) &&
          nextBillerId !== billerId &&
          firstEndpoint
        ) {
          navigate(`/dashboard/endpoints/${encodeId(firstEndpoint.id)}`);
        }
      }}
      value={String(billerId)}
    >
      <SelectTrigger
        aria-label="Biller"
        className="h-8 max-w-48 border-transparent bg-transparent px-1.5 font-medium text-foreground shadow-none hover:bg-accent hover:text-accent-foreground"
      >
        <SelectValue>{currentBiller.name}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {billersWithResponses.map((biller) => (
          <SelectItem key={biller.id} value={String(biller.id)}>
            {biller.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function EndpointBreadcrumbSelector({
  billerId,
  endpointId,
  fallbackMethod,
  fallbackUrl,
}: {
  readonly billerId?: number;
  readonly endpointId?: string;
  readonly fallbackMethod?: HttpMethod;
  readonly fallbackUrl?: string;
}) {
  const navigate = useNavigate();
  const { endpoints: endpointQuery } = useEndpointCatalog();
  const { data: endpoints = [], isPending: isLoadingEndpoints } = endpointQuery;
  const billerEndpoints = endpoints.filter(
    (endpoint) => endpoint.billerId === billerId
  );
  const currentEndpoint = billerEndpoints.find(
    (endpoint) => endpoint.id === endpointId
  );

  if (
    isLoadingEndpoints ||
    !currentEndpoint ||
    !fallbackMethod ||
    !fallbackUrl
  ) {
    return (
      <BreadcrumbPage>
        {fallbackMethod && fallbackUrl ? (
          <EndpointBreadcrumbLabel method={fallbackMethod} url={fallbackUrl} />
        ) : (
          "Endpoint"
        )}
      </BreadcrumbPage>
    );
  }

  return (
    <Select
      onValueChange={(value) => {
        if (value && value !== currentEndpoint.id) {
          navigate(`/dashboard/endpoints/${encodeId(value)}`);
        }
      }}
      value={currentEndpoint.id}
    >
      <SelectTrigger
        aria-label="Endpoint"
        className="h-8 max-w-[min(32rem,50vw)] border-transparent bg-transparent px-1.5 font-medium text-foreground shadow-none hover:bg-accent hover:text-accent-foreground"
      >
        <SelectValue>
          <EndpointBreadcrumbLabel
            method={currentEndpoint.method}
            url={currentEndpoint.url}
          />
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {billerEndpoints.map((endpoint) => (
          <SelectItem key={endpoint.id} value={endpoint.id}>
            {endpoint.method} {endpoint.url}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function DashboardPageFallback() {
  return <div className="min-h-[360px]" />;
}
