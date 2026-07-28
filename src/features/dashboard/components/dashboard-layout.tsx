import {
  Add01Icon,
  Tick02Icon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React, { Suspense, useEffect, useState } from "react";
import { Link, Outlet, useLocation, useParams } from "react-router";
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
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ProtectedAction } from "@/features/auth/components/protected-action";
import { AddBillerSheet } from "@/features/billers/components/add-biller-sheet";
import { useCreateBiller } from "@/features/billers/hooks/use-create-biller";
import { useGetBillers } from "@/features/billers/hooks/use-get-billers";
import {
  DashboardNavigationProvider,
  useDashboardNavigation,
} from "@/features/dashboard/dashboard-navigation-context";
import { AddEndpointSheet } from "@/features/endpoints/components/add-endpoint-sheet";
import { HttpMethodBadge } from "@/features/endpoints/components/http-method-badge";
import { useEndpointCatalog } from "@/features/endpoints/hooks/use-endpoint-catalog";
import { useEndpointWorkspace } from "@/features/endpoints/hooks/use-endpoint-workspace";
import type { EndpointFormData } from "@/features/endpoints/schemas/endpoint-schema";
import type { HttpMethod } from "@/features/endpoints/types";
import { selectEndpointForBiller } from "@/features/endpoints/utils/endpoint-selection";
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
  const { createEndpoint: createEndpointMutation } = useEndpointCatalog();
  const { mutate: createEndpoint, isPending: isCreatingEndpoint } =
    createEndpointMutation;
  const { mutate: createBiller, isPending: isCreatingBiller } =
    useCreateBiller();
  const [initialBillerId, setInitialBillerId] = useState<number | undefined>();
  const [isAddEndpointOpen, setIsAddEndpointOpen] = useState(false);
  const [isAddBillerOpen, setIsAddBillerOpen] = useState(false);

  const handleOpenAddEndpoint = (billerId: number) => {
    setInitialBillerId(billerId);
    setIsAddEndpointOpen(true);
  };

  const handleAddEndpoint = (data: EndpointFormData) => {
    createEndpoint(data, {
      onSuccess: () => setIsAddEndpointOpen(false),
    });
  };

  const handleOpenAddBiller = () => setIsAddBillerOpen(true);

  const handleAddBiller = (billerName: string) => {
    createBiller(
      { billerName },
      { onSuccess: () => setIsAddBillerOpen(false) }
    );
  };

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
      label:
        endpoint?.billerName ??
        (endpoint?.billerId === undefined
          ? "Biller"
          : `Biller ID ${endpoint.billerId}`),
    });
  }

  const themeSwitcherValue =
    theme === "light" || theme === "dark" ? theme : undefined;

  return (
    <TourProvider closeable>
      <DashboardNavigationProvider>
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
                            item.isLast
                              ? "min-w-0 max-w-full"
                              : "hidden md:block"
                          }
                        >
                          <DashboardBreadcrumbContent
                            item={item}
                            onAddBiller={handleOpenAddBiller}
                            onAddEndpoint={handleOpenAddEndpoint}
                          />
                        </BreadcrumbItem>
                        {!item.isLast && (
                          <BreadcrumbSeparator className="hidden md:block" />
                        )}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
                {isEndpointDetail && endpointQuery.isFetching && (
                  <span
                    aria-label="Refreshing endpoint"
                    className="ml-2 inline-flex items-center gap-1.5 text-muted-foreground text-xs"
                    data-testid="endpoint-refresh-indicator"
                    role="status"
                  >
                    <span className="size-3 animate-spin rounded-full border-2 border-current border-r-transparent" />
                    <span className="hidden sm:inline">Refreshing</span>
                  </span>
                )}
                <div className="ml-auto">
                  <ThemeSwitcher
                    onChange={setTheme}
                    value={themeSwitcherValue}
                  />
                </div>
              </header>
              <main className="flex flex-1 flex-col gap-4 overflow-auto bg-background/70 p-4 md:p-6">
                <Suspense fallback={<DashboardPageFallback />}>
                  <Outlet />
                </Suspense>
              </main>
              {isAddEndpointOpen && (
                <ProtectedAction ability="canAddEndpoint">
                  <AddEndpointSheet
                    initialBillerId={initialBillerId}
                    isSubmitting={isCreatingEndpoint}
                    onOpenChange={setIsAddEndpointOpen}
                    onSubmit={handleAddEndpoint}
                    open
                    showTrigger={false}
                  />
                </ProtectedAction>
              )}
              {isAddBillerOpen && (
                <ProtectedAction ability="canAddBiller">
                  <AddBillerSheet
                    isSubmitting={isCreatingBiller}
                    onOpenChange={setIsAddBillerOpen}
                    onSubmit={handleAddBiller}
                    open
                    showTrigger={false}
                  />
                </ProtectedAction>
              )}
            </SidebarInset>
          </SidebarProvider>
          {isSocksRelayRoute ? null : <SocketBridgeFloatingStatus />}
        </SocketBridgeProvider>
      </DashboardNavigationProvider>
    </TourProvider>
  );
}

function DashboardBreadcrumbContent({
  item,
  onAddBiller,
  onAddEndpoint,
}: {
  readonly item: DashboardBreadcrumbItem;
  readonly onAddBiller: () => void;
  readonly onAddEndpoint: (billerId: number) => void;
}) {
  if (item.kind === "biller") {
    return (
      <BillerBreadcrumbSelector
        billerId={item.billerId}
        fallbackLabel={item.label}
        onAddBiller={onAddBiller}
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
        onAddEndpoint={onAddEndpoint}
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
  onAddBiller,
}: {
  readonly billerId?: number;
  readonly fallbackLabel: string;
  readonly onAddBiller: () => void;
}) {
  const [open, setOpen] = useState(false);
  const {
    endpointMutationPending,
    forgetEndpoint,
    getRememberedEndpoint,
    requestEndpointNavigation,
  } = useDashboardNavigation();
  const { data: billers = [], isPending: isLoadingBillers } = useGetBillers();
  const { endpoints: endpointQuery } = useEndpointCatalog();
  const { data: endpoints = [], isPending: isLoadingEndpoints } = endpointQuery;
  const billersWithEndpoints = billers.filter((biller) =>
    endpoints.some((endpoint) => endpoint.billerId === biller.id)
  );
  const currentBiller = billersWithEndpoints.find(
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

  const selectBiller = (nextBillerId: number) => {
    const billerEndpoints = endpoints.filter(
      (endpoint) => endpoint.billerId === nextBillerId
    );
    const rememberedEndpoint = getRememberedEndpoint(nextBillerId);
    const nextEndpoint = selectEndpointForBiller(
      endpoints,
      nextBillerId,
      rememberedEndpoint
    );

    if (
      rememberedEndpoint &&
      !billerEndpoints.some((endpoint) => endpoint.id === rememberedEndpoint)
    ) {
      forgetEndpoint(rememberedEndpoint);
    }

    if (nextBillerId !== billerId && nextEndpoint) {
      setOpen(false);
      requestEndpointNavigation(
        `/dashboard/endpoints/${encodeId(nextEndpoint.id)}`
      );
    }
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-label="Biller"
          className="h-8 max-w-48 justify-between border-transparent bg-transparent px-1.5 font-medium text-foreground shadow-none hover:bg-accent hover:text-accent-foreground"
          disabled={endpointMutationPending}
          role="combobox"
          type="button"
          variant="ghost"
        >
          <span className="truncate">{currentBiller.name}</span>
          <HugeiconsIcon
            aria-hidden="true"
            className="size-4 shrink-0 opacity-45"
            icon={UnfoldMoreIcon}
            strokeWidth={2}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(22rem,calc(100vw-2rem))] translate-y-2 overflow-hidden p-0"
        sideOffset={12}
      >
        <Command>
          <CommandInput
            aria-label="Search billers"
            className="h-11"
            placeholder="Search billers..."
          />
          <CommandList className="max-h-72 p-1">
            <CommandEmpty>No biller found.</CommandEmpty>
            <CommandGroup className="p-0">
              <ProtectedAction ability="canAddBiller">
                <CommandItem
                  className="min-h-10 border-border/60 border-b px-3 py-2 text-[0.95rem] text-primary"
                  onSelect={() => {
                    setOpen(false);
                    onAddBiller();
                  }}
                  value={messages.billers.addNewBiller}
                >
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                  <span>{messages.billers.addNewBiller}</span>
                </CommandItem>
              </ProtectedAction>
              {billersWithEndpoints.map((biller) => (
                <CommandItem
                  className="min-h-10 px-3 py-2 text-[0.95rem]"
                  key={biller.id}
                  onSelect={() => selectBiller(biller.id)}
                  value={`${biller.name} ${biller.id}`}
                >
                  <span className="truncate">{biller.name}</span>
                  <HugeiconsIcon
                    aria-hidden="true"
                    className={`ml-auto size-4 ${biller.id === billerId ? "opacity-100" : "opacity-0"}`}
                    icon={Tick02Icon}
                    strokeWidth={2}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function EndpointBreadcrumbSelector({
  billerId,
  endpointId,
  fallbackMethod,
  fallbackUrl,
  onAddEndpoint,
}: {
  readonly billerId?: number;
  readonly endpointId?: string;
  readonly fallbackMethod?: HttpMethod;
  readonly fallbackUrl?: string;
  readonly onAddEndpoint: (billerId: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const {
    endpointMutationPending,
    rememberEndpoint,
    requestEndpointNavigation,
  } = useDashboardNavigation();
  const { endpoints: endpointQuery } = useEndpointCatalog();
  const { data: endpoints = [], isPending: isLoadingEndpoints } = endpointQuery;
  const billerEndpoints = endpoints.filter(
    (endpoint) => endpoint.billerId === billerId
  );
  const currentEndpoint = billerEndpoints.find(
    (endpoint) => endpoint.id === endpointId
  );

  useEffect(() => {
    if (currentEndpoint) {
      rememberEndpoint({
        billerId: currentEndpoint.billerId,
        endpointId: currentEndpoint.id,
      });
    }
  }, [currentEndpoint, rememberEndpoint]);

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

  const selectEndpoint = (nextEndpointId: string) => {
    if (nextEndpointId !== currentEndpoint.id) {
      setOpen(false);
      requestEndpointNavigation(
        `/dashboard/endpoints/${encodeId(nextEndpointId)}`
      );
    }
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-label="Endpoint"
          className="h-8 max-w-[min(32rem,50vw)] justify-between border-transparent bg-transparent px-1.5 font-medium text-foreground shadow-none hover:bg-accent hover:text-accent-foreground"
          disabled={endpointMutationPending}
          role="combobox"
          type="button"
          variant="ghost"
        >
          <EndpointBreadcrumbLabel
            method={currentEndpoint.method}
            url={currentEndpoint.url}
          />
          <HugeiconsIcon
            aria-hidden="true"
            className="size-4 shrink-0 opacity-45"
            icon={UnfoldMoreIcon}
            strokeWidth={2}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(32rem,calc(100vw-2rem))] translate-y-2 overflow-hidden p-0"
        sideOffset={12}
      >
        <Command>
          <CommandInput
            aria-label="Search endpoints"
            className="h-11"
            placeholder="Search endpoints..."
          />
          <CommandList className="max-h-72 p-1">
            <CommandEmpty>No endpoint found.</CommandEmpty>
            <CommandGroup className="p-0">
              <ProtectedAction ability="canAddEndpoint">
                <CommandItem
                  className="min-h-10 border-border/60 border-b px-3 py-2 text-[0.95rem] text-primary"
                  onSelect={() => {
                    setOpen(false);
                    onAddEndpoint(currentEndpoint.billerId);
                  }}
                  value={messages.endpoints.addNewEndpoint}
                >
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={2} />
                  <span>{messages.endpoints.addNewEndpoint}</span>
                </CommandItem>
              </ProtectedAction>
              {billerEndpoints.map((endpoint) => (
                <CommandItem
                  className="min-h-10 px-3 py-2 text-[0.95rem]"
                  key={endpoint.id}
                  onSelect={() => selectEndpoint(endpoint.id)}
                  value={`${endpoint.method} ${endpoint.url}`}
                >
                  <HttpMethodBadge
                    className="shrink-0"
                    method={endpoint.method}
                    variant="text"
                  />
                  <span className="min-w-0 truncate">{endpoint.url}</span>
                  <HugeiconsIcon
                    aria-hidden="true"
                    className={`ml-auto size-4 ${endpoint.id === endpointId ? "opacity-100" : "opacity-0"}`}
                    icon={Tick02Icon}
                    strokeWidth={2}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DashboardPageFallback() {
  return <div className="min-h-[360px]" />;
}
