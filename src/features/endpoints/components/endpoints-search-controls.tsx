import { Search } from "lucide-react";
import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";

type EndpointsSearchControlsProps = {
  onSearchChange?: (search: string) => void;
  searchPlaceholder?: string;
};

export function EndpointsSearchControls({
  onSearchChange,
  searchPlaceholder = "Cari endpoint...",
}: EndpointsSearchControlsProps) {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(event.target.value);
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          onChange={handleSearchChange}
          placeholder={searchPlaceholder}
        />
      </div>
    </div>
  );
}
