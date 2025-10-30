import React from "react";
import { Outlet, useLocation } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
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

// Map routes to breadcrumb labels
const routeLabels: Record<string, string> = {
  overview: "Overview",
  billing: "Billing",
  scenarios: "Scenarios",
  settings: "Settings",
};

export function DashboardLayout() {
  const location = useLocation();

  // Parse the current path to generate breadcrumbs
  const pathSegments = location.pathname
    .split("/")
    .filter((segment) => segment !== "");

  // Generate breadcrumb items
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
    const label =
      routeLabels[segment] ||
      segment.charAt(0).toUpperCase() + segment.slice(1);
    const isLast = index === pathSegments.length - 1;

    return { label, href, isLast };
  });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
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
                      <BreadcrumbLink href={item.href}>
                        {item.label}
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
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
