import { LayoutGrid, List, Search } from "lucide-react";
import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type EndpointsSearchControlsProps = {
  onSearchChange?: (search: string) => void;
  searchPlaceholder?: string;
  onViewModeChange?: (viewMode: "grid" | "list") => void;
  viewMode?: "grid" | "list";
};

export function EndpointsSearchControls({
  onSearchChange,
  searchPlaceholder = "Cari endpoint...",
  onViewModeChange,
  viewMode,
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
      <div className="relative min-w-[220px] flex-1">
        <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
        />
      </div>
      {onViewModeChange && viewMode ? (
        <ToggleGroup
          aria-label="Pilih tampilan endpoint"
          onValueChange={handleViewModeChange}
          type="single"
          value={viewMode}
          variant="outline"
        >
          <ToggleGroupItem aria-label="Tampilan grid" value="grid">
            <LayoutGrid className="mr-2 h-4 w-4" />
            Grid
          </ToggleGroupItem>
          <ToggleGroupItem aria-label="Tampilan daftar" value="list">
            <List className="mr-2 h-4 w-4" />
            List
          </ToggleGroupItem>
        </ToggleGroup>
      ) : null}
    </div>
  );
}
