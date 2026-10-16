import { useCallback, useEffect, useState } from "react";
import { Code2, Database, Table } from "@/components/hugeicons";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  fetchColumns,
  fetchTableData,
  fetchTables,
} from "@/features/simulator-db/api";
import { DataGrid } from "@/features/simulator-db/components/data-grid";
import { DatabaseExplorer } from "@/features/simulator-db/components/database-explorer";
import { QueryConsole } from "@/features/simulator-db/components/query-console";
import { TableStructure } from "@/features/simulator-db/components/table-structure";
import {
  type ColumnMetadata,
  extractErrorMessage,
  type TableDataPage,
  type TableMetadata,
} from "@/features/simulator-db/types";

export function SimulatorDbWorkspace() {
  const [tables, setTables] = useState<TableMetadata[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<TableDataPage | null>(null);
  const [columns, setColumns] = useState<ColumnMetadata[]>([]);
  const [activeTab, setActiveTab] = useState<"data" | "console" | "structure">(
    "data"
  );

  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(50);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

  // Load all tables
  const loadTables = useCallback(async () => {
    setIsLoadingTables(true);
    setError(null);
    try {
      const data = await fetchTables();
      setTables(data);
      if (data.length > 0 && !selectedTable) {
        setSelectedTable(data[0].name);
      }
    } catch (cause: unknown) {
      setError(extractErrorMessage(cause));
    } finally {
      setIsLoadingTables(false);
    }
  }, [selectedTable]);

  useEffect(() => {
    loadTables().catch(() => undefined);
  }, [loadTables]);

  // Load table data and columns when selected table or pagination changes
  const loadTableDetails = useCallback(
    async (
      tableName: string,
      targetPage: number,
      targetSize: number,
      sBy?: string,
      sDir?: "asc" | "desc",
      search?: string
    ) => {
      setIsLoadingData(true);
      setError(null);
      try {
        const [cols, dataPage] = await Promise.all([
          fetchColumns(tableName),
          fetchTableData(tableName, targetPage, targetSize, sBy, sDir, search),
        ]);
        setColumns(cols);
        setTableData(dataPage);
      } catch (cause: unknown) {
        setError(extractErrorMessage(cause));
      } finally {
        setIsLoadingData(false);
      }
    },
    []
  );

  useEffect(() => {
    if (selectedTable) {
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
    setSelectedTable(name);
    setSearchQuery("");
    if (activeTab === "structure") {
      setActiveTab("data");
    }
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
      loadTables().catch(() => undefined);
    }
  };

  const handleMutationSuccess = (isNewRow: boolean) => {
    loadTables().catch(() => undefined);
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

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-lg border bg-background shadow-sm">
      {/* Left Panel: Database Explorer (DataGrip Sidebar) */}
      <div className="w-64 shrink-0">
        <DatabaseExplorer
          isLoading={isLoadingTables}
          onRefresh={loadTables}
          onSelectTable={handleSelectTable}
          selectedTable={selectedTable}
          tables={tables}
        />
      </div>

      {/* Right Panel: Workspace Tabs (Data, Console, Structure) */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Tabs
          className="flex h-full flex-col"
          onValueChange={(val) => {
            if (val === "data" || val === "console" || val === "structure") {
              setActiveTab(val);
            }
          }}
          value={activeTab}
        >
          {/* DataGrip Tab Bar */}
          <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-1">
            <div className="flex items-center gap-3 overflow-hidden">
              {selectedTable && (
                <div className="flex items-center gap-1.5 font-mono font-semibold text-foreground text-xs">
                  <Table className="size-3.5 text-primary" />
                  <span>{selectedTable}</span>
                  {tableData && (
                    <Badge className="ml-1" size="xs" variant="outline">
                      {tableData.totalRows.toLocaleString()} rows
                    </Badge>
                  )}
                </div>
              )}

              <TabsList size="xs" variant="subtle">
                <TabsTrigger size="sm" value="data">
                  <Table className="size-3" />
                  <span>Data</span>
                </TabsTrigger>
                <TabsTrigger size="sm" value="console">
                  <Code2 className="size-3" />
                  <span>Console</span>
                </TabsTrigger>
                <TabsTrigger size="sm" value="structure">
                  <Database className="size-3" />
                  <span>Structure</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                <span className="size-1.5 rounded-full bg-success" />
                Connected
              </span>
            </div>
          </div>

          {/* Global Error Notice if any */}
          {error && (
            <div className="border-destructive/20 border-b bg-destructive/10 px-3 py-1.5 text-destructive text-xs">
              <strong>Connection Error:</strong> {error}
            </div>
          )}

          {/* Tab 1: Table Data Grid */}
          <TabsContent className="flex-1 overflow-hidden" value="data">
            <DataGrid
              currentSortBy={sortBy}
              currentSortDir={sortDir}
              data={tableData}
              isLoading={isLoadingData}
              onMutationSuccess={handleMutationSuccess}
              onPageChange={handlePageChange}
              onRefresh={handleRefreshData}
              onSearchChange={handleSearchChange}
              onSizeChange={handleSizeChange}
              onSortChange={handleSortChange}
              searchQuery={searchQuery}
            />
          </TabsContent>

          {/* Tab 2: Query Console */}
          <TabsContent className="flex-1 overflow-hidden" value="console">
            <QueryConsole selectedTable={selectedTable} tables={tables} />
          </TabsContent>

          {/* Tab 3: Table Structure & DDL */}
          <TabsContent className="flex-1 overflow-hidden" value="structure">
            <TableStructure columns={columns} tableName={selectedTable} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
