import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { fetchTableData, fetchTables } from "@/features/simulator-db/api";
import {
  extractErrorMessage,
  type TableDataPage,
  type TableMetadata,
} from "@/features/simulator-db/types";

type DataRequest = {
  tableName: string;
  page: number;
  size: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  search?: string;
};
export type DatabaseLoadReason =
  | "loadingData"
  | "searchingData"
  | "loadingPage"
  | "sortingData"
  | "refreshingData";

function getLoadReason(
  previous: DataRequest | null,
  next: DataRequest
): DatabaseLoadReason {
  if (!previous || previous.tableName !== next.tableName) {
    return "loadingData";
  }
  if (previous.search !== next.search) {
    return "searchingData";
  }
  if (previous.page !== next.page || previous.size !== next.size) {
    return "loadingPage";
  }
  if (previous.sortBy !== next.sortBy || previous.sortDir !== next.sortDir) {
    return "sortingData";
  }
  return "refreshingData";
}

export function useDatabaseData(
  selectedTable: string | null,
  setSelectedTable: Dispatch<SetStateAction<string | null>>
) {
  const [tables, setTables] = useState<TableMetadata[]>([]);
  const [storedData, setStoredData] = useState<TableDataPage | null>(null);
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [pendingData, setPendingData] = useState(false);
  const [tablesError, setTablesError] = useState<string | null>(null);
  const [failure, setFailure] = useState<{
    tableName: string;
    message: string;
  } | null>(null);
  const [loadingReason, setLoadingReason] =
    useState<DatabaseLoadReason>("loadingData");
  const tableRequestId = useRef(0);
  const dataRequestId = useRef(0);
  const lastRequest = useRef<DataRequest | null>(null);
  const activeRead = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      tableRequestId.current += 1;
      dataRequestId.current += 1;
      activeRead.current?.abort();
    },
    []
  );
  const loadTables = useCallback(async () => {
    const id = ++tableRequestId.current;
    setIsLoadingTables(true);
    setTablesError(null);
    try {
      const next = await fetchTables();
      if (id !== tableRequestId.current) {
        return;
      }
      setTables(next);
      setSelectedTable(
        (current) =>
          next.find((table) => table.name === current)?.name ??
          next[0]?.name ??
          null
      );
    } catch (cause: unknown) {
      if (id === tableRequestId.current) {
        setTablesError(extractErrorMessage(cause));
      }
    } finally {
      if (id === tableRequestId.current) {
        setIsLoadingTables(false);
      }
    }
  }, [setSelectedTable]);

  const loadTableDetails = useCallback(
    async (
      tableName: string,
      page: number,
      size: number,
      sortBy?: string,
      sortDir?: "asc" | "desc",
      search?: string
    ) => {
      const id = ++dataRequestId.current;
      activeRead.current?.abort();
      const controller = new AbortController();
      activeRead.current = controller;
      const request = { tableName, page, size, sortBy, sortDir, search };
      setLoadingReason(getLoadReason(lastRequest.current, request));
      lastRequest.current = request;
      setPendingData(true);
      setFailure(null);
      try {
        const next = await fetchTableData(
          tableName,
          page,
          size,
          sortBy,
          sortDir,
          search,
          controller.signal
        );
        if (id !== dataRequestId.current) {
          return;
        }
        setStoredData(next);
      } catch (cause: unknown) {
        if (id === dataRequestId.current && !controller.signal.aborted) {
          setFailure({ tableName, message: extractErrorMessage(cause) });
        }
      } finally {
        if (id === dataRequestId.current) {
          setPendingData(false);
        }
      }
    },
    []
  );

  const retryData = () => {
    const request = lastRequest.current;
    if (request) {
      loadTableDetails(
        request.tableName,
        request.page,
        request.size,
        request.sortBy,
        request.sortDir,
        request.search
      ).catch(() => undefined);
    }
  };
  const tableData = storedData?.tableName === selectedTable ? storedData : null;
  const dataError =
    failure?.tableName === selectedTable ? failure.message : null;
  const isLoadingData =
    pendingData || Boolean(selectedTable && !tableData && !dataError);
  return {
    tables,
    tableData,
    columns: tableData?.columns ?? [],
    isLoadingTables,
    isLoadingData,
    tablesError,
    dataError,
    loadingReason,
    loadTables,
    loadTableDetails,
    retryData,
  };
}
