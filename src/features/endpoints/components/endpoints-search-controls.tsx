import {
  GridIcon,
  GridTableIcon,
  Menu01Icon,
  SearchIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ChangeEvent, ReactNode } from "react";
import { ChevronDown } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { EndpointViewMode } from "@/features/endpoints/types";
import { messages } from "@/lib/i18n";

type EndpointsSearchControlsProps = {
  actions?: ReactNode;
  onSearchChange?: (search: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
  onViewModeChange?: (viewMode: EndpointViewMode) => void;
  viewMode?: EndpointViewMode;
  searchId?: string;
  viewModeId?: string;
};

export function EndpointsSearchControls({
  actions,
  onSearchChange,
  searchValue,
  searchPlaceholder = messages.endpoints.searchPlaceholder,
  onViewModeChange,
  viewMode,
  searchId,
  viewModeId,
}: EndpointsSearchControlsProps) {
  useI18n();
  const views = [
    {
      value: "table",
      label: messages.endpoints.table.title,
      icon: GridTableIcon,
    },
    { value: "grid", label: messages.endpoints.gridView, icon: GridIcon },
    { value: "list", label: messages.endpoints.listView, icon: Menu01Icon },
  ] as const;
  const selectedView =
    views.find((view) => view.value === viewMode) ?? views[0];
  const changeView = (value: string) => {
    if (value === "table" || value === "grid" || value === "list") {
      onViewModeChange?.(value);
    }
  };
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(event.target.value);
  };

  return (
    <div className="contents">
      <div className="relative min-w-44 flex-1 basis-52" id={searchId}>
        <HugeiconsIcon
          className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          icon={SearchIcon}
          strokeWidth={2}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Input
              aria-label={messages.endpoints.searchEndpointsAria}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              size="search-sm"
              value={searchValue}
            />
          </TooltipTrigger>
          <TooltipContent side="bottom">{searchPlaceholder}</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden h-6 shrink-0 sm:block">
          <Separator orientation="vertical" />
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              aria-label={`${messages.endpoints.viewAriaLabel}: ${selectedView.label}`}
              disabled={!onViewModeChange}
              id={viewModeId}
              size="sm"
              variant="outline"
            >
              <span aria-hidden="true" className="inline-grid size-4 shrink-0">
                {views.map((view) => (
                  <span
                    className="endpoint-view-choice [grid-area:1/1]"
                    data-selected={view.value === selectedView.value}
                    key={view.value}
                  >
                    <HugeiconsIcon icon={view.icon} strokeWidth={2} />
                  </span>
                ))}
              </span>
              <span className="inline-grid text-left">
                {views.map((view) => (
                  <span
                    aria-hidden={view.value !== selectedView.value}
                    className="endpoint-view-choice [grid-area:1/1]"
                    data-selected={view.value === selectedView.value}
                    key={view.value}
                  >
                    {view.label}
                  </span>
                ))}
              </span>
              <ChevronDown data-icon="inline-end" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" variant="endpoint-view">
            <DropdownMenuRadioGroup
              aria-label={messages.endpoints.viewAriaLabel}
              onValueChange={changeView}
              value={selectedView.value}
            >
              {views.map((view) => (
                <DropdownMenuRadioItem key={view.value} value={view.value}>
                  <HugeiconsIcon icon={view.icon} strokeWidth={2} />
                  {view.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">
          <div className="h-6 shrink-0">
            <Separator orientation="vertical" />
          </div>
          {actions}
        </div>
      )}
    </div>
  );
}
