import { LayoutGrid, List, Search } from "lucide-react";
import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { messages } from "@/lib/i18n";

type EndpointsSearchControlsProps = {
  onSearchChange?: (search: string) => void;
  searchPlaceholder?: string;
  onViewModeChange?: (viewMode: "grid" | "list") => void;
  viewMode?: "grid" | "list";
  searchId?: string;
  viewModeId?: string;
};

export function EndpointsSearchControls({
  onSearchChange,
  searchPlaceholder = messages.endpoints.searchPlaceholder,
  onViewModeChange,
  viewMode,
  searchId,
  viewModeId,
}: EndpointsSearchControlsProps) {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(event.target.value);
  };

  const handleViewModeChange = (value: string) => {
    if (value === "grid" || value === "list") {
      onViewModeChange?.(value);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px] flex-1" id={searchId}>
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
        />
      </div>
      {onViewModeChange && viewMode ? (
        <ToggleGroup
          aria-label={messages.endpoints.viewAriaLabel}
          id={viewModeId}
          onValueChange={handleViewModeChange}
          type="single"
          value={viewMode}
          variant="outline"
        >
          <ToggleGroupItem
            aria-label={messages.endpoints.gridViewAriaLabel}
            value="grid"
          >
            <LayoutGrid className="mr-2 h-4 w-4" />
            Grid
          </ToggleGroupItem>
          <ToggleGroupItem
            aria-label={messages.endpoints.listViewAriaLabel}
            value="list"
          >
            <List className="mr-2 h-4 w-4" />
            List
          </ToggleGroupItem>
        </ToggleGroup>
      ) : null}
    </div>
  );
}
