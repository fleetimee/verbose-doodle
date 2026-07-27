import { GridIcon, Menu01Icon, SearchIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { messages } from "@/lib/i18n";

type EndpointsSearchControlsProps = {
  onSearchChange?: (search: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
  onViewModeChange?: (viewMode: "grid" | "list") => void;
  viewMode?: "grid" | "list";
  searchId?: string;
  viewModeId?: string;
};

export function EndpointsSearchControls({
  onSearchChange,
  searchValue,
  searchPlaceholder = messages.endpoints.searchPlaceholder,
  onViewModeChange,
  viewMode,
  searchId,
  viewModeId,
}: EndpointsSearchControlsProps) {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(event.target.value);
  };

  const handleViewModeChange = (value: string[]) => {
    const nextValue = value[0];

    if (nextValue === "grid" || nextValue === "list") {
      onViewModeChange?.(nextValue);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[220px] flex-1" id={searchId}>
        <HugeiconsIcon
          className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          icon={SearchIcon}
          strokeWidth={2}
        />
        <Input
          className="pl-9"
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
          value={searchValue}
        />
      </div>
      {onViewModeChange && viewMode ? (
        <ToggleGroup
          aria-label={messages.endpoints.viewAriaLabel}
          id={viewModeId}
          onValueChange={handleViewModeChange}
          value={[viewMode]}
          variant="outline"
        >
          <ToggleGroupItem
            aria-label={messages.endpoints.gridViewAriaLabel}
            value="grid"
          >
            <HugeiconsIcon
              className="mr-2 h-4 w-4"
              icon={GridIcon}
              strokeWidth={2}
            />
            Grid
          </ToggleGroupItem>
          <ToggleGroupItem
            aria-label={messages.endpoints.listViewAriaLabel}
            value="list"
          >
            <HugeiconsIcon
              className="mr-2 h-4 w-4"
              icon={Menu01Icon}
              strokeWidth={2}
            />
            List
          </ToggleGroupItem>
        </ToggleGroup>
      ) : null}
    </div>
  );
}
