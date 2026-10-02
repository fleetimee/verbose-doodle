export interface ServerEntry {
  accessType: string;
  createdAt: string;
  databaseEngine: string | null;
  databaseName: string | null;
  hasPassword: boolean;
  host: string;
  id: string;
  name: string;
  notes: string | null;
  port: number | null;
  updatedAt: string;
  url: string | null;
  username: string | null;
}

export interface ServerEntryRequest {
  accessType: string;
  databaseEngine: string | null;
  databaseName: string | null;
  host: string;
  name: string;
  notes: string | null;
  password?: string;
  port: number | null;
  url: string | null;
  username: string | null;
}

export interface ServerInventoryQuery {
  accessType: string;
  databaseEngine: string;
  direction: "asc" | "desc";
  page: number;
  search: string;
  size: number;
  sortBy: string;
}

export interface ServerEntryPage {
  accessTypes: string[];
  databaseEngines: string[];
  page: number;
  servers: ServerEntry[];
  size: number;
  totalElements: number;
  totalHosts: number;
  totalPages: number;
}
