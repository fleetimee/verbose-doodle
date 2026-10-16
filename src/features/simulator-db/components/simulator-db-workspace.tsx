import { GridTableIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Code2, Database } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataGrid } from "@/features/simulator-db/components/data-grid";
import { DatabaseExplorer } from "@/features/simulator-db/components/database-explorer";
import { QueryConsole } from "@/features/simulator-db/components/query-console";
import { TableStructure } from "@/features/simulator-db/components/table-structure";
import { useDatabaseData } from "@/features/simulator-db/hooks/use-database-data";
import { useIsMobile } from "@/hooks/use-mobile";

export function SimulatorDbWorkspace() {
  const {
    messages: { simulatorDb: m },
  } = useI18n();
  const isMobile = useIsMobile();
  const [editState, setEditState] = useState<"idle" | "editing" | "saving">(
    "idle"
  );
  const canLeaveEdit = () => {
    if (editState !== "saving") {
      return true;
    }
    toast.info(m.finishEdit);
    return false;
  };
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const {
    tables,
    tableData,
    columns,
    isLoadingTables,
    isLoadingData,
    tablesError,
    dataError,
    loadingReason,
    loadTables,
    loadTableDetails,
    retryData,
  } = useDatabaseData(selectedTable, setSelectedTable);
  const previousTable = useRef<string | null>(null);
  const [activeTab, setActiveTab] = useState<"data" | "console" | "structure">(
    "data"
  );

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadTables().catch(() => undefined);
  }, [loadTables]);

  useEffect(() => {
    if (selectedTable && previousTable.current !== selectedTable) {
      previousTable.current = selectedTable;
      setPage(0);
      setSortBy(undefined);
      setSortDir("asc");
      setSearchQuery("");
      loadTableDetails(selectedTable, 0, size, undefined, "asc", "").catch(
        () => undefined
      );
    }
  }, [selectedTable, size, loadTableDetails]);

  const handleSelectTable = (name: string) => {
    if (!canLeaveEdit()) {
      return;
    }
    setSelectedTable(name);
    setSearchQuery("");
    setActiveTab("data");
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (selectedTable) {
      loadTableDetails(
        selectedTable,
        newPage,
        size,
        sortBy,
        sortDir,
        searchQuery
      ).catch(() => undefined);
    }
  };

  const handleSizeChange = (newSize: number) => {
    setSize(newSize);
    setPage(0);
    if (selectedTable) {
      loadTableDetails(
        selectedTable,
        0,
        newSize,
        sortBy,
        sortDir,
        searchQuery
      ).catch(() => undefined);
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(0);
    if (selectedTable) {
      loadTableDetails(selectedTable, 0, size, sortBy, sortDir, query).catch(
        () => undefined
      );
    }
  };

  const handleSortChange = (column: string) => {
    let nextDir: "asc" | "desc" = "asc";
    if (sortBy === column) {
      nextDir = sortDir === "asc" ? "desc" : "asc";
    }
    setSortBy(column);
    setSortDir(nextDir);
    if (selectedTable) {
      loadTableDetails(
        selectedTable,
        page,
        size,
        column,
        nextDir,
        searchQuery
      ).catch(() => undefined);
    }
  };

  const handleRefreshData = () => {
    if (selectedTable) {
      loadTableDetails(
        selectedTable,
        page,
        size,
        sortBy,
        sortDir,
        searchQuery
      ).catch(() => undefined);
    }
  };

  const handleMutationSuccess = (isNewRow: boolean) => {
    if (!selectedTable) {
      return;
    }
    if (isNewRow) {
      const currentTotal = tableData?.totalRows ?? 0;
      const nextTotal = currentTotal + 1;
      const lastPage = Math.max(0, Math.ceil(nextTotal / size) - 1);
      setSearchQuery("");
      setPage(lastPage);
      setSortBy(undefined);
      setSortDir("asc");
      loadTableDetails(
        selectedTable,
        lastPage,
        size,
        undefined,
        "asc",
        ""
      ).catch(() => undefined);
    } else {
      loadTableDetails(
        selectedTable,
        page,
        size,
        sortBy,
        sortDir,
        searchQuery
      ).catch(() => undefined);
    }
  };

  const connectionStatus =
    isLoadingTables || isLoadingData ? m.loading : m.ready;

  return (
    <div className="database-studio flex min-h-0 min-w-0 flex-1 overflow-hidden bg-background">
      <ResizablePanelGroup direction={isMobile ? "vertical" : "horizontal"}>
        {/* Left Panel: Database Explorer (DataGrip Sidebar) */}
        <ResizablePanel
          defaultSize={isMobile ? "22%" : "220px"}
          maxSize="40%"
          minSize={isMobile ? "100px" : "160px"}
        >
          <DatabaseExplorer
            isLoading={isLoadingTables}
            onOpenTable={(name, tab) => {
              if (!canLeaveEdit()) {
                return;
              }
              setSelectedTable(name);
              setActiveTab(tab);
            }}
            onRefresh={loadTables}
            onSelectTable={handleSelectTable}
            selectedTable={selectedTable}
            tables={tables}
            tablesError={tablesError}
          />
        </ResizablePanel>
        <ResizableHandle aria-label={m.resizeExplorer} />

        {/* Right Panel: Workspace Tabs (Data, Console, Structure) */}
        <ResizablePanel minSize={isMobile ? "40%" : "240px"}>
          <Tabs
            className="flex h-full min-h-0 flex-col"
            onValueChange={(val) => {
              if (!canLeaveEdit()) {
                return;
              }
              if (val === "data" || val === "console" || val === "structure") {
                setActiveTab(val);
              }
            }}
            value={activeTab}
            variant="flush"
          >
            {/* DataGrip Tab Bar */}
            <div className="database-toolbar flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                {selectedTable && (
                  <div className="flex items-center gap-1.5 font-mono font-semibold text-foreground text-xs">
                    <HugeiconsIcon
                      className="size-3.5 text-primary"
                      icon={GridTableIcon}
                    />
                    <span className="max-w-48 truncate" title={selectedTable}>
                      {selectedTable}
                    </span>
                    {tableData && (
                      <Badge className="ml-1" size="xs" variant="outline">
                        {tableData.totalRows.toLocaleString()} rows
                      </Badge>
                    )}
                  </div>
                )}

                <TabsList size="xs" variant="subtle">
                  <TabsTrigger size="sm" value="data">
                    <HugeiconsIcon icon={GridTableIcon} />
                    <span>{m.data}</span>
                  </TabsTrigger>
                  <TabsTrigger size="sm" value="console">
                    <Code2 className="size-3" />
                    <span>{m.console}</span>
                  </TabsTrigger>
                  <TabsTrigger size="sm" value="structure">
                    <Database className="size-3" />
                    <span>{m.structure}</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-muted-foreground text-xs">
                  {tablesError || dataError ? m.unavailable : connectionStatus}
                </span>
              </div>
            </div>

            {/* Tab 1: Table Data Grid */}
            <TabsContent
              className="min-h-0 flex-1 overflow-hidden"
              value="data"
            >
              <DataGrid
                currentSortBy={sortBy}
                currentSortDir={sortDir}
                data={tableData}
                error={selectedTable ? dataError : tablesError}
                isLoading={isLoadingData || (!selectedTable && isLoadingTables)}
                key={selectedTable}
                loadingLabel={m[loadingReason]}
                onEditStateChange={setEditState}
                onMutationSuccess={handleMutationSuccess}
                onPageChange={handlePageChange}
                onRefresh={handleRefreshData}
                onRetry={
                  selectedTable
                    ? retryData
                    : () => {
                        loadTables().catch(() => undefined);
                      }
                }
                onSearchChange={handleSearchChange}
                onSizeChange={handleSizeChange}
                onSortChange={handleSortChange}
                searchQuery={searchQuery}
              />
            </TabsContent>

            {/* Tab 2: Query Console */}
            <TabsContent
              className="min-h-0 flex-1 overflow-hidden"
              value="console"
            >
              <QueryConsole selectedTable={selectedTable} tables={tables} />
            </TabsContent>

            {/* Tab 3: Table Structure & DDL */}
            <TabsContent
              className="min-h-0 flex-1 overflow-hidden"
              value="structure"
            >
              <TableStructure
                columns={columns}
                error={dataError}
                isLoading={isLoadingData}
                onRetry={retryData}
                tableName={selectedTable}
              />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
