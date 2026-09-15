import {
  ArrowRight01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  Copy01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ReactElement } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Pen } from "@/components/hugeicons";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useEndpointCatalog } from "@/features/endpoints/hooks/use-endpoint-catalog";
import type { Endpoint } from "@/features/endpoints/types";
import { messages } from "@/lib/i18n";

type EndpointContextMenuProps = {
  canEdit: boolean;
  children: ReactElement;
  endpoint: Endpoint;
  onDelete: (endpoint: Endpoint) => void;
  onEdit: (endpoint: Endpoint) => void;
};

const TRAILING_SLASHES_PATTERN = /\/+$/;

export function EndpointContextMenu({
  canEdit,
  children,
  endpoint,
  onDelete,
  onEdit,
}: EndpointContextMenuProps) {
  const navigate = useNavigate();
  const { updateEndpoint } = useEndpointCatalog();

  if (!canEdit) {
    return children;
  }

  const handleCopyUrl = async () => {
    const baseUrl = (import.meta.env.VITE_ENDPOINT_URL || "").replace(
      TRAILING_SLASHES_PATTERN,
      ""
    );
    try {
      await navigator.clipboard.writeText(`${baseUrl}${endpoint.url}`);
      toast.success(messages.endpoints.copyUrlSuccess);
    } catch {
      toast.error(messages.endpoints.copyUrlFailed);
    }
  };

  const handleToggleEnabled = () => {
    updateEndpoint.mutate({
      changes: { enabled: endpoint.enabled === false },
      endpointSlug: endpoint.slug,
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52" variant="subtle">
        <ContextMenuItem
          onClick={() => navigate(`/dashboard/endpoints/${endpoint.slug}`)}
          size="compact"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
          {messages.endpoints.openEndpoint}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleToggleEnabled} size="compact">
          <HugeiconsIcon
            icon={
              endpoint.enabled === false ? CheckmarkCircle02Icon : Cancel01Icon
            }
            strokeWidth={2}
          />
          {endpoint.enabled === false
            ? messages.endpoints.enableEndpoint
            : messages.endpoints.disableEndpoint}
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCopyUrl} size="compact">
          <HugeiconsIcon icon={Copy01Icon} strokeWidth={2} />
          {messages.endpoints.copyUrl}
        </ContextMenuItem>
        <ContextMenuItem
          aria-label={messages.endpoints.editEndpointMenuItem}
          onClick={() => onEdit(endpoint)}
          size="compact"
        >
          <Pen />
          {messages.endpoints.editEndpointMenuItem}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          aria-label={messages.endpoints.deleteEndpointMenuItem}
          onClick={() => onDelete(endpoint)}
          size="compact"
          variant="destructive"
        >
          <HugeiconsIcon icon={Delete02Icon} strokeWidth={2} />
          {messages.endpoints.deleteEndpointMenuItem}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
