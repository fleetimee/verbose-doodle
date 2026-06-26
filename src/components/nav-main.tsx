import { ChevronRight, type LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    badge?: string;
    isActive?: boolean;
    onPrefetch?: () => void;
    items?: {
      title: string;
      url: string;
      onPrefetch?: () => void;
    }[];
  }[];
}) {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = Boolean(item.items?.length);
          const isItemActive =
            !hasSubItems &&
            (location.pathname === item.url ||
              location.pathname.startsWith(`${item.url}/`));
          const hasActiveSubItem = item.items?.some(
            (subItem) => location.pathname === subItem.url
          );
          const isActive = isItemActive || hasActiveSubItem;

          return (
            <Collapsible
              asChild
              defaultOpen={isActive || hasActiveSubItem}
              key={item.title}
            >
              <SidebarMenuItem>
                {hasSubItems ? (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      className="h-9 rounded-lg data-[active=true]:shadow-xs"
                      isActive={isItemActive}
                      onMouseEnter={item.onPrefetch}
                      tooltip={item.title}
                      type="button"
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                ) : (
                  <SidebarMenuButton
                    asChild
                    className="h-9 rounded-lg data-[active=true]:shadow-xs"
                    isActive={isActive}
                    tooltip={item.title}
                  >
                    <Link onMouseEnter={item.onPrefetch} to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
                {item.badge ? (
                  <SidebarMenuBadge className="text-sidebar-foreground/55">
                    {item.badge}
                  </SidebarMenuBadge>
                ) : null}
                {hasSubItems ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRight />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => {
                          const isSubItemActive =
                            location.pathname === subItem.url;
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isSubItemActive}
                              >
                                <Link
                                  onMouseEnter={subItem.onPrefetch}
                                  to={subItem.url}
                                >
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
