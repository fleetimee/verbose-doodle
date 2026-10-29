export interface LogSourceRequest {
  basePath: string;
  dateFormat: "ddMMyyyy" | "yyyy-MM-dd" | "yyyyMMdd";
  domain: string;
  encoding: string;
  filenamePattern: string;
  folderPattern: string;
  host: string;
  name: string;
  password?: string;
  port: number;
  protocol: "SMB" | "SFTP";
  serverEntryId?: string;
  shareName: string;
  timezone: string;
  username: string;
}

export interface LogSource
  extends Omit<LogSourceRequest, "password" | "serverEntryId"> {
  hasPassword: boolean;
  id: string;
  updatedAt: string;
}

export interface LogCatalog {
  files: { filename: string; date: string; stream: string; size: number }[];
  resolvedPath: string;
  streams: string[];
}

export interface LogSegment {
  date: string;
  filename: string;
  offset: number;
  text: string;
}

export interface LogPage {
  hasMore: boolean;
  hasOlder: boolean;
  nextCursor: string | null;
  olderCursor: string | null;
  reset: boolean;
  segments: LogSegment[];
}

export interface LogBrowseRequest {
  domain: string;
  host: string;
  password?: string;
  path: string;
  port: number;
  protocol: "SMB" | "SFTP";
  serverEntryId?: string;
  shareName: string;
  sourceId?: string;
  username: string;
}

export interface DetectedLogLayout {
  basePath: string;
  dateFormat: "ddMMyyyy" | "yyyy-MM-dd" | "yyyyMMdd";
  filenamePattern: string;
  folderPattern: string;
  matchedFiles: number;
  sampleFiles: string[];
  streams: string[];
}

export interface LogBrowseResult {
  entries: { name: string; path: string; directory: boolean; size: number }[];
  layouts: DetectedLogLayout[];
  limited: boolean;
  path: string;
}
