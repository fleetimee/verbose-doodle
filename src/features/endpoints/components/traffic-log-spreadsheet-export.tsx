import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { EndpointTrafficLog } from "@/features/endpoints/types";
import { downloadTrafficLogSpreadsheet } from "@/features/endpoints/utils/traffic-log-spreadsheet";
import { messages } from "@/lib/i18n";

export function TrafficLogSpreadsheetExport({
  endpointId,
  isPending,
  logs,
}: {
  readonly endpointId: string;
  readonly isPending: boolean;
  readonly logs: readonly EndpointTrafficLog[];
}) {
  const [isExportingSpreadsheet, setIsExportingSpreadsheet] = useState(false);
  const handleSpreadsheetDownload = async () => {
    setIsExportingSpreadsheet(true);
    try {
      await downloadTrafficLogSpreadsheet(logs, endpointId);
    } catch {
      toast.error(messages.endpoints.trafficLogsDownloadFailed);
    } finally {
      setIsExportingSpreadsheet(false);
    }
  };

  return (
    <Button
      disabled={logs.length === 0 || isExportingSpreadsheet || isPending}
      onClick={handleSpreadsheetDownload}
      size="sm"
      title={messages.endpoints.trafficLogsSpreadsheetScope}
      type="button"
      variant="subtle"
    >
      {messages.endpoints.trafficLogsExcelButton}
    </Button>
  );
}
