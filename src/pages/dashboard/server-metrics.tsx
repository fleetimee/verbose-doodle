import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import { RefreshCw, Server } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ServerMetricsPanel } from "@/features/server-inventory/components/server-metrics";
import { serverInventoryKeys } from "@/features/server-inventory/hooks/use-server-inventory";
import { useDocumentMeta } from "@/hooks/use-document-meta";

export function ServerMetricsPage() {
  const { messages } = useI18n();
  const copy = messages.servers.metrics;
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const refresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: serverInventoryKeys.all,
      });
    } finally {
      setRefreshing(false);
    }
  };
  useDocumentMeta({ title: copy.documentTitle, description: copy.description });

  return (
    <div className="server-monitor-workspace mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-4 pb-4 lg:min-h-0 lg:flex-1">
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-xl tracking-tight">{copy.title}</h1>
          <p className="max-w-prose text-muted-foreground text-sm">
            {copy.description}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            render={<Link to="/dashboard/servers" />}
            size="sm"
            variant="outline"
          >
            <Server data-icon="inline-start" />
            {copy.inventory}
          </Button>
          <Button
            disabled={refreshing}
            onClick={refresh}
            size="sm"
            variant="outline"
          >
            {refreshing ? (
              <Spinner data-icon="inline-start" />
            ) : (
              <RefreshCw data-icon="inline-start" />
            )}
            {messages.servers.refresh}
          </Button>
        </div>
      </div>
      <ServerMetricsPanel />
    </div>
  );
}
