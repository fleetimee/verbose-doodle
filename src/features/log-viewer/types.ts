export const LOG_DATE_FORMATS = [
  "ddMMyyyy",
  "yyyy-MM-dd",
  "yyyyMMdd",
  "yyyy_MM_dd",
  "yyyy.MM.dd",
  "dd-MM-yyyy",
  "MM-dd-yyyy",
  "dd.MM.yyyy",
  "dd-MMM-yyyy",
  "yyyy-MM-dd_HH",
  "yyyy-MM-dd-HH",
  "yyyy-MM-dd_HH-mm",
  "yyyy-MM-dd_HH-mm-ss",
  "yyyy-MM-dd'T'HH-mm-ss",
  "yyyyMMddHH",
  "yyyyMMddHHmmss",
  "modified",
] as const;

export type LogDateFormat = (typeof LOG_DATE_FORMATS)[number];

export interface LogSourceRequest {
  basePath: string;
  dateFormat: LogDateFormat;
  domain: string;
  encoding: string;
  filenamePattern: string;
  folderPattern: string;
  host: string;
  name: string;
  password?: string;
  port: number;
  protocol: "SMB" | "SFTP";
  rotationOrder: "auto" | "ascending" | "descending";
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
  dateFormat: LogDateFormat;
  filenamePattern: string;
  folderPattern: string;
  matchedFiles: number;
  sampleFiles: string[];
  streams: string[];
}

export interface LogBrowseResult {
  compressedFiles: number;
  entries: { name: string; path: string; directory: boolean; size: number }[];
  layouts: DetectedLogLayout[];
  limited: boolean;
  path: string;
}
