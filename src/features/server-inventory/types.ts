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

export interface ServerMetrics {
  collectedAt: string | null;
  cores: number | null;
  cpuPercent: number | null;
  diskReadBytesPerSecond: number | null;
  diskTotalBytes: number | null;
  diskUsedBytes: number | null;
  diskWriteBytesPerSecond: number | null;
  memoryTotalBytes: number | null;
  memoryUsedBytes: number | null;
  networkReceiveBytesPerSecond: number | null;
  networkTransmitBytesPerSecond: number | null;
  status: string;
  uptimeSeconds: number | null;
}

export interface ServerContainer {
  blockIo: string | null;
  cpuPercent: number | null;
  id: string;
  image: string;
  memoryPercent: number | null;
  memoryUsage: string | null;
  name: string;
  networkIo: string | null;
  networks: string;
  ports: string;
  state: string;
  status: string;
}

export interface ServerContainers {
  collectedAt: string | null;
  containers: ServerContainer[];
  statsAvailable: boolean;
  status: string;
}

export interface ServerContainerSummary {
  collectedAt: string | null;
  cores: number | null;
  images: number | null;
  memoryTotalBytes: number | null;
  operatingSystem: string | null;
  paused: number | null;
  running: number | null;
  status: string;
  stopped: number | null;
  total: number | null;
  version: string | null;
}

export interface ServerContainerDetail {
  collectedAt: string | null;
  created: string | null;
  id: string | null;
  image: string | null;
  mounts: {
    destination: string;
    source: string;
    type: string;
    writable: boolean;
  }[];
  name: string | null;
  networks: { ipv4: string; ipv6: string; name: string }[];
  path: string | null;
  ports: {
    containerPort: string;
    hostIp: string | null;
    hostPort: string | null;
  }[];
  state: string | null;
  status: string;
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
  lastDefinitionUpdate: string | null;
  page: number;
  servers: ServerEntry[];
  size: number;
  totalElements: number;
  totalHosts: number;
  totalPages: number;
}
