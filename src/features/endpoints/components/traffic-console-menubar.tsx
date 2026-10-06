import { useI18n } from "@/components/i18n-provider";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { TrafficLogSpreadsheetExport } from "@/features/endpoints/components/traffic-log-spreadsheet-export";
import type { EndpointTrafficLog } from "@/features/endpoints/types";

export function TrafficConsoleMenubar({
  autoRefresh,
  wrapLines,
  showTimestamps,
  onAutoRefreshChange,
  onWrapLinesChange,
  onTimestampsChange,
  onTextExport,
  onCsvExport,
  logs,
  isPending,
}: {
  readonly autoRefresh: boolean;
  readonly wrapLines: boolean;
  readonly showTimestamps: boolean;
  readonly onAutoRefreshChange: (value: boolean) => void;
  readonly onWrapLinesChange: (value: boolean) => void;
  readonly onTimestampsChange: (value: boolean) => void;
  readonly onTextExport: () => void;
  readonly onCsvExport: () => void;
  readonly logs: readonly EndpointTrafficLog[];
  readonly isPending: boolean;
}) {
  const { messages } = useI18n();
  return (
    <Menubar aria-label={messages.endpoints.globalConsole.title}>
      <MenubarMenu>
        <MenubarTrigger>{messages.endpoints.globalConsole.view}</MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarCheckboxItem
              checked={autoRefresh}
              onCheckedChange={onAutoRefreshChange}
            >
              {messages.endpoints.trafficLogsAutoRefreshLabel}
            </MenubarCheckboxItem>
            <MenubarCheckboxItem
              checked={wrapLines}
              onCheckedChange={onWrapLinesChange}
            >
              {messages.endpoints.trafficLogsWrapLinesLabel}
            </MenubarCheckboxItem>
            <MenubarCheckboxItem
              checked={showTimestamps}
              onCheckedChange={onTimestampsChange}
            >
              {messages.endpoints.trafficLogsDisplayTimestampsLabel}
            </MenubarCheckboxItem>
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>
          {messages.endpoints.globalConsole.export}
        </MenubarTrigger>
        <MenubarContent>
          <MenubarGroup>
            <MenubarItem
              disabled={isPending || logs.length === 0}
              onClick={onTextExport}
            >
              {messages.endpoints.globalConsole.textExport}
            </MenubarItem>
            <MenubarItem
              disabled={isPending || logs.length === 0}
              onClick={onCsvExport}
            >
              {messages.endpoints.trafficLogsCsvButton}
            </MenubarItem>
            <TrafficLogSpreadsheetExport
              asMenuItem
              endpointId="global"
              isPending={isPending}
              logs={logs}
            />
          </MenubarGroup>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
