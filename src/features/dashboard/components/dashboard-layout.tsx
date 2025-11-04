import React from "react";
import { Link, Outlet, useLocation, useParams } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { useTheme } from "@/components/theme-provider";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useGetEndpoint } from "@/features/endpoints/hooks/use-get-endpoint";
import { decodeId } from "@/lib/id-encoder";

const routeLabels: Record<string, string> = {
  overview: "Overview",
  endpoints: "Endpoints",
  users: "Users",
  settings: "Settings",
};

// Updated regex to match encoded IDs (base64 URL-safe characters)
const ENDPOINT_DETAIL_REGEX = /^\/dashboard\/endpoints\/([A-Za-z0-9_-]+)$/;

export function DashboardLayout() {
  const location = useLocation();
  const params = useParams();
  const { theme, setTheme } = useTheme();

  const isEndpointDetail = location.pathname.match(ENDPOINT_DETAIL_REGEX);
  const encodedId = isEndpointDetail ? params.id : undefined;

  // Decode the ID if we're on an endpoint detail page
  const decodedId = encodedId ? decodeId(encodedId) : undefined;

  const { data: endpoint } = useGetEndpoint(decodedId || "");

  const pathSegments = location.pathname
    .split("/")
    .filter((segment) => segment !== "");

  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
    let label =
      routeLabels[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);

    // If this segment is the encoded ID and we have endpoint data, show the endpoint URL
    if (isEndpointDetail && segment === encodedId && endpoint) {
      label = `${endpoint.method} ${endpoint.url}`;
    }

    const isLast = index === pathSegments.length - 1;

    return { label, href, isLast };
  });

  const themeSwitcherValue =
    theme === "light" || theme === "dark" ? theme : undefined;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
          <SidebarTrigger className="-ml-1" />
          <Separator
            className="mr-2 data-[orientation=vertical]:h-4"
            orientation="vertical"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbItems.map((item) => (
                <React.Fragment key={item.href}>
                  <BreadcrumbItem
                    className={item.isLast ? "" : "hidden md:block"}
                  >
                    {item.isLast ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={item.href}>{item.label}</Link>
                      </BreadcrumbLink>
                    )}
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
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
