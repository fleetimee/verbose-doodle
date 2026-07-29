import {
  Add01Icon,
  ArrowUp01Icon,
  Tick02Icon,
  UnfoldMoreIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import React, { Suspense, useEffect, useRef, useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

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
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion() ?? false;

  useEffect(() => {
    const viewport = scrollViewportRef.current;
    if (!viewport) {
      return;
    }

    const updateHeaderScrollState = () => {
      setIsHeaderScrolled(viewport.scrollTop > 2);
      setShowScrollToTop(viewport.scrollTop > 600);
    };

    updateHeaderScrollState();
    viewport.addEventListener("scroll", updateHeaderScrollState, {
      passive: true,
    });

    return () =>
      viewport.removeEventListener("scroll", updateHeaderScrollState);
  }, []);

  const handleOpenAddEndpoint = (billerId: number) => {
    setInitialBillerId(billerId);
    setIsAddEndpointOpen(true);
  };

  const handleAddEndpoint = (data: EndpointFormData) => {
    createEndpoint(data, {
      onSuccess: () => setIsAddEndpointOpen(false),
    });
  };

  const handleOpenAddBiller = () => {
    setIsAddBillerOpen(true);
  };

  const handleAddBiller = (billerName: string) => {
    createBiller(
      { billerName },
      { onSuccess: () => setIsAddBillerOpen(false) }
    );
  };

  const handleScrollToTop = () => {
    scrollViewportRef.current?.scrollTo({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      top: 0,
    });
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
            <SidebarInset className="h-svh min-h-0 overflow-hidden border border-border/70 bg-card shadow-sm md:h-[calc(100svh-1rem)]">
              <ScrollArea
                className="[&>[data-slot=scroll-area-viewport]>[role=presentation]]:!min-w-0 h-full min-h-0 w-full"
                viewportRef={scrollViewportRef}
              >
                <header
                  className={cn(
                    "relative sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur after:pointer-events-none after:absolute after:inset-x-0 after:-bottom-2 after:h-2 after:bg-gradient-to-b after:from-foreground/10 after:to-transparent after:opacity-0 after:transition-opacity after:duration-200 after:ease-[var(--ease-out)] supports-backdrop-filter:bg-card/80 motion-reduce:after:duration-[10ms]",
                    isHeaderScrolled && "after:opacity-100"
                  )}
                >
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
                <main className="flex min-h-full min-w-0 flex-col gap-4 bg-background/70 p-4 md:p-6">
                  <Suspense fallback={<DashboardPageFallback />}>
                    <Outlet />
                  </Suspense>
                </main>
              </ScrollArea>
              <AnimatePresence initial={false}>
                {showScrollToTop && (
                  <motion.div
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="pointer-events-none fixed right-4 bottom-24 z-40"
                    exit={{ opacity: 0, scale: 0.9, y: 8 }}
                    initial={{ opacity: 0, scale: 0.9, y: 8 }}
                    transition={{
                      duration: shouldReduceMotion
                        ? MOTION_DURATION.instant
                        : MOTION_DURATION.press,
                      ease: MOTION_EASE.out,
                    }}
                  >
                    <Button
                      aria-label="Scroll to top"
                      className="pointer-events-auto size-10 rounded-full border-border/70 bg-background/95 shadow-lg backdrop-blur"
                      onClick={handleScrollToTop}
                      size="icon"
                      type="button"
                      variant="outline"
                    >
                      <HugeiconsIcon
                        aria-hidden="true"
                        icon={ArrowUp01Icon}
                        strokeWidth={2}
                      />
                      <span className="sr-only">Scroll to top</span>
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
              <ProtectedAction ability="canAddEndpoint">
                <AddEndpointSheet
                  initialBillerId={initialBillerId}
                  isSubmitting={isCreatingEndpoint}
                  onOpenChange={setIsAddEndpointOpen}
                  onSubmit={handleAddEndpoint}
                  open={isAddEndpointOpen}
                  showTrigger={false}
                />
              </ProtectedAction>
              <ProtectedAction ability="canAddBiller">
                <AddBillerSheet
                  isSubmitting={isCreatingBiller}
                  onOpenChange={setIsAddBillerOpen}
                  onSubmit={handleAddBiller}
                  open={isAddBillerOpen}
                  showTrigger={false}
                />
              </ProtectedAction>
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

function AnimatedBreadcrumbValue({
  children,
  value,
}: {
  readonly children?: React.ReactNode;
  readonly value: string;
}) {
  const shouldReduceMotion = useReducedMotion() ?? false;

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.span
        animate={{ opacity: 1 }}
        className={
          children ? "inline-flex min-w-0 max-w-full" : "min-w-0 truncate"
        }
        exit={{ opacity: 0 }}
        initial={{ opacity: shouldReduceMotion ? 0.85 : 0 }}
        key={value}
        transition={{
          duration: shouldReduceMotion
            ? MOTION_DURATION.instant
            : MOTION_DURATION.fast,
          ease: MOTION_EASE.out,
        }}
      >
        {children ?? value}
      </motion.span>
    </AnimatePresence>
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
  const pendingAddRef = useRef<number | null>(null);
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

  useEffect(
    () => () => {
      if (pendingAddRef.current !== null) {
        window.cancelAnimationFrame(pendingAddRef.current);
      }
    },
    []
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
          <AnimatedBreadcrumbValue value={currentBiller.name} />
          <HugeiconsIcon
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0 opacity-45 transition-transform duration-[150ms] ease-[var(--ease-out)] motion-reduce:duration-[10ms]",
              open && "rotate-180"
            )}
            icon={UnfoldMoreIcon}
            strokeWidth={2}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(22rem,calc(100vw-2rem))] overflow-hidden p-0"
        finalFocus={false}
        sideOffset={0}
      >
        <Command>
          <CommandInput
            aria-label="Search billers"
            className="h-11"
            placeholder="Search billers..."
          />
          <ScrollArea className="h-72 [&>[data-slot=scroll-area-scrollbar]]:opacity-100">
            <CommandList className="max-h-none overflow-visible p-1">
              <CommandEmpty>No biller found.</CommandEmpty>
              <CommandGroup className="p-0">
                <ProtectedAction ability="canAddBiller">
                  <CommandItem
                    className="min-h-10 border-border/60 border-b px-3 py-2 text-[0.95rem] text-primary"
                    onSelect={() => {
                      setOpen(false);
                      if (pendingAddRef.current !== null) {
                        window.cancelAnimationFrame(pendingAddRef.current);
                      }
                      pendingAddRef.current = window.requestAnimationFrame(
                        () => {
                          pendingAddRef.current = null;
                          onAddBiller();
                        }
                      );
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
          </ScrollArea>
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
  const pendingAddRef = useRef<number | null>(null);
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

  useEffect(
    () => () => {
      if (pendingAddRef.current !== null) {
        window.cancelAnimationFrame(pendingAddRef.current);
      }
    },
    []
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
          <AnimatedBreadcrumbValue
            value={`${currentEndpoint.id}:${currentEndpoint.method}:${currentEndpoint.url}`}
          >
            <EndpointBreadcrumbLabel
              method={currentEndpoint.method}
              url={currentEndpoint.url}
            />
          </AnimatedBreadcrumbValue>
          <HugeiconsIcon
            aria-hidden="true"
            className={cn(
              "size-4 shrink-0 opacity-45 transition-transform duration-[150ms] ease-[var(--ease-out)] motion-reduce:duration-[10ms]",
              open && "rotate-180"
            )}
            icon={UnfoldMoreIcon}
            strokeWidth={2}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[min(32rem,calc(100vw-2rem))] overflow-hidden p-0"
        finalFocus={false}
        sideOffset={0}
      >
        <Command>
          <CommandInput
            aria-label="Search endpoints"
            className="h-11"
            placeholder="Search endpoints..."
          />
          <ScrollArea className="h-72 [&>[data-slot=scroll-area-scrollbar]]:opacity-100">
            <CommandList className="max-h-none overflow-visible p-1">
              <CommandEmpty>No endpoint found.</CommandEmpty>
              <CommandGroup className="p-0">
                <ProtectedAction ability="canAddEndpoint">
                  <CommandItem
                    className="min-h-10 border-border/60 border-b px-3 py-2 text-[0.95rem] text-primary"
                    onSelect={() => {
                      setOpen(false);
                      if (pendingAddRef.current !== null) {
                        window.cancelAnimationFrame(pendingAddRef.current);
                      }
                      pendingAddRef.current = window.requestAnimationFrame(
                        () => {
                          pendingAddRef.current = null;
                          onAddEndpoint(currentEndpoint.billerId);
                        }
                      );
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
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function DashboardPageFallback() {
  return <div className="min-h-[360px]" />;
}
