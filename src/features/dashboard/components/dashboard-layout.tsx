import { Outlet } from "react-router";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
          </div>
          <div className="flex flex-1 items-center justify-between">
            <h1 className="font-semibold text-lg">Dashboard</h1>
            {/* Add breadcrumbs, search, or other header items here */}
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
