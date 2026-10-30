export const logViewerMessages = {
  openInNewTab: "Open source in new tab",
  backToWorkspace: "Back to workspace",
  sourceNotFound: "Log source not found",
  sourceNotFoundHint:
    "This source may have been deleted. Return to the workspace to choose another source.",
  sourceActions: "Source actions",
  connectionConnected: "Connected",
  connectionConnecting: "Connecting…",

  rotationOrder: "Rotation index order",
  rotationAuto: "Automatic",
  rotationAscending: "Larger indexes are newer",
  rotationDescending: "Smaller indexes are newer",
  modifiedDate: "File modification date",
  dateFormatHint:
    "For filenames without {date}, use the file modification date. It filters files by last modification, not the dates of individual log entries. Ambiguous dates need the correct day/month order.",
  browseCompressed:
    "{count} compressed archives found. Compressed files are listed but cannot be read or used for automatic source settings.",
  dateFormat: "Filename date format",
  protocol: "Connection type",
  sftpPathHint:
    "Absolute path on the SSH server, for example /var/log/myapp. Browse from / to find the log folder.",
  errorHostKey:
    "Trust this server’s SSH host key using the Server Inventory terminal or file browser first. If its key changed, verify it before reconnecting.",
  errorSftp:
    "The server could not complete the SFTP request. Check that SFTP is enabled and the account can read the log folder.",
  expandViewer: "Expand to window",
  restoreViewer: "Restore window size (Esc)",
  exportTxt: "Export logs (.txt)",
  exportFilteredTxt: "Export matching lines (.txt)",
  enterFullscreen: "Fullscreen log viewer",
  exitFullscreen: "Exit fullscreen (Esc)",
  fullscreenFailed:
    "Unable to open fullscreen. Check your browser permissions and try again.",
  toolbar: "Log toolbar",
  searchSources: "Find source by name, IP, or protocol…",
  noSourcesFound: "No matching log sources.",
  searchLogs: "Search…",
  filterMatches: "Match only",
  filterMatchesHint:
    "Show only matching log entries, or uncheck to show all logs with matches highlighted in yellow.",
  noSearchMatches: "No matching log entries in loaded logs.",
  previousMatch: "Previous match (Shift+Enter)",
  nextMatch: "Next match (Enter)",
  clearSearch: "Clear search",
  searchScope: "Searches loaded logs only. Load older to search more.",
  searchLimited: "Showing the first 2,000 matches. Refine your search.",
  searchUnsupported: "Search highlighting requires a newer browser.",
  checkRequired:
    "Check the connection successfully before saving. Any settings change requires a new check.",
  isoMti: "ISO message type (MTI)",
  isoBitmap: "ISO bitmap",
  isoBits: "Present fields",
  isoField: "ISO field",
  isoCustomField: "Profile-specific field",
  wordWrap: "Word wrap",
  timezoneDefaultHint:
    "New sources default to your browser timezone. Choose the timezone used by the server if it differs.",
  checkConnection: "Check connection",
  checkSuccess:
    "Connection verified. The base folder is readable. Nothing has been saved.",
  errorAuth:
    "The server rejected the login. Check the username, password, and SMB domain if applicable in Configure source.",
  errorAccess:
    "This account cannot read the log folder or SMB share. Check its read permissions.",
  errorShare:
    "The share was not found. Discover shares again or enter the correct share name.",
  errorPath:
    "The log folder or file was not found. Browse the folder and review the saved path.",
  errorConnect:
    "Cannot reach the server. Check its host, port, and network connection.",
  errorTimeout:
    "The server took too long to respond. Check its availability, then retry.",
  errorStorage:
    "Saved sources are temporarily unavailable. Check the backend database connection, then reload sources.",
  errorBackend:
    "The log service could not complete this request. Check the backend is running and review its logs, then retry.",
  errorCredentials:
    "The saved password could not be read. Enter the password again and save the source.",
  errorSourceMissing:
    "This source no longer exists. Reload the source list to continue.",
  errorValidation:
    "Some settings are missing or invalid. Review the host, login, share, and file settings.",
  errorSmb:
    "The Windows server could not complete the request. Check the connection and source settings.",
  errorOffline:
    "Cannot connect to the backend. Check that the service is running and your network is connected.",
  sourcesErrorTitle: "Sources unavailable",
  catalogErrorTitle: "Unable to open this source",
  sourcesErrorHint:
    "Your saved sources will appear here when the connection is restored.",
  catalogErrorHint: "Review the connection settings or try again.",
  reloadSources: "Reload sources",
  retrying: "Reconnecting…",
  errorDetails: "What happened",
  cachedLogs: "Previously loaded logs are still available.",
  sharesDiscover: "Discover shares",
  sharesLoading: "Discovering shares…",
  sharesChoose: "Choose a discovered share or type its name",
  sharesHint:
    "Shares are discovered automatically for saved credentials. With a manual password, choose Discover shares. A single accessible share is selected automatically.",
  sharesEmpty:
    "No accessible disk shares found. You can still enter a share name manually.",
  sharesLimited:
    "Discovery reached its limit. Choose a listed share or type another name.",
  sharesFailed:
    "Share discovery failed. You can enter the share name manually.",
  inventoryEmpty:
    "No servers found. Enter the connection details manually below.",
  inventoryServer: "Server Inventory (optional)",
  inventoryChoose: "Choose a saved server or enter details below",
  inventorySearch: "Search name, host, or username…",
  inventoryManual: "Enter connection manually",
  inventoryHint:
    "Choose a saved SSH entry for SFTP or RDP entry for SMB, or enter a host manually. SMB uses port 445, not the RDP port.",
  inventoryPassword:
    "Saved inventory password will be used. Enter a password here to override it.",
  inventoryLoading: "Loading servers…",
  inventoryMore: "Load more servers",
  browseShareRequired:
    "Enter a share name above (for example C$ or AppLogs) to browse folders.",
  browseBack: "Back to previous folder",
  browseForward: "Forward to next folder",
  browseBreadcrumb: "Folder location",
  browseSearch: "Search this folder",
  browseSearchPlaceholder: "Filter folders and files by name…",
  browseSearchScope: "Search filters the listed entries in this folder only.",
  browseNoMatches: "No folders or files match your search.",
  browseDialogDescription:
    "Navigate folders and apply detected log settings. Browsing is read-only.",
  browse: "Browse folders",
  closeBrowser: "Close browser",
  browsePrerequisite:
    "Enter the host, username, and password first; SMB also requires a share. Re-enter the password if connection details have changed.",
  browsePath: "Folder within the share",
  browseRoot: "Share root",
  browseParent: "Parent folder",
  browseGo: "Open folder",
  browseRefresh: "Refresh folder",
  browseLoading: "Browsing and detecting log settings…",
  browseError: "Unable to browse this folder",
  browseEmpty: "This folder is empty.",
  browseFiles: "Folders & files",
  browseDetected: "Detected log settings",
  browseNoDetection:
    "No supported log filename patterns found here. Open a log folder or its year/month parent, or enter settings manually.",
  browseApply: "Use these settings",
  browseApplied:
    "Folder and filename settings applied. Review the timezone and encoding before saving.",
  browseLimited:
    "Some folders or files were not inspected because of access restrictions or scan limits. Open a more specific folder to inspect more.",
  browseSamples: "Matching examples",
  browseMatched: "files inspected",
  browseNote:
    "Browsing is read-only. Nothing is saved until you save the source.",
  browseFolder: "Folder",
  browseDetectionHint:
    "Detected from filenames and date folders. Encoding and timezone are kept unchanged.",

  fieldHelpLabel: "Help for {field}",
  fieldHelpExamples: "Examples & accepted values",
  fieldHelp: {
    rotationOrder: {
      placeholder: "Choose rotation order",
      description:
        "Controls numeric {index} order within each date/time. Logback and Log4j’s usual dated rotation increment toward newer files. Python/logrotate numbered backups usually make .1 newest. Automatic uses ascending for dated names and descending for undated names; override it to match the producer.",
      examples:
        "Ascending: app.2026-10-29.1.log → app.2026-10-29.10.log\nDescending: app.log.10 → app.log.2 → app.log.1",
    },
    dateFormat: {
      placeholder: "Choose a filename date format",
      description:
        "How {date} is written in filenames, including an optional hour, minute, or second. For undated files choose file modification date. Detection offers both day/month orders when ambiguous; choose the one used by your application.",
      examples:
        "ddMMyyyy: 29102026\nyyyy-MM-dd: 2026-10-29\nyyyyMMdd: 20261029",
    },
    name: {
      placeholder: "e.g. JavaCMSInterface",
      description:
        "A display name for this saved source. It does not need to match a folder or service. Up to 150 characters.",
      examples: "JavaCMSInterface\nPayment gateway logs",
    },
    host: {
      placeholder: "e.g. 192.168.4.45",
      description:
        "The server IP address or hostname reachable from the backend. Enter only the host, without a protocol prefix or folder path.",
      examples: "192.168.4.45\nwindows-logs.example",
    },
    port: {
      placeholder: "445",
      description:
        "The server port: usually 445 for SMB or 22 for SFTP/SSH. Any whole number from 1 to 65535 is accepted.",
      examples: "445 (SMB)\n22 (SFTP)",
    },
    shareName: {
      placeholder: "e.g. C$ or AppLogs",
      description:
        "The SMB share name, not a drive path. C$ refers to the C: administrative share when your account has access. A dedicated share can use its own name.",
      examples: "C$\nAppLogs",
    },
    basePath: {
      placeholder: "e.g. Simulator/EChannelInterface/JavaCMSInterface/log",
      description:
        "For SMB, use a path relative to the share, or leave empty for its root. For SFTP, use an absolute path such as /var/log/myapp. Parent (..) segments are not accepted.",
      examples:
        "For C$:\nSimulator/EChannelInterface/JavaCMSInterface/log\n\nFor a share pointing directly to the log folder:\nLeave empty",
    },
    folderPattern: {
      placeholder: "Choose a folder layout",
      description:
        "Select how date folders sit below the base folder. No date folders reads files directly from the base folder. Missing date folders are skipped.",
      examples:
        "Year / month: yyyy/MM → 2026/10\nMonth only: MM → 10\nNo date folders: base folder only",
    },
    filenamePattern: {
      placeholder: "e.g. {date}_{stream}.log",
      description:
        "Use {stream} for the log name, {date} for the selected date/time format, and optional {index} for a numeric rotation. Each token may appear once; fixed filenames and date-only filenames are also supported. Without {date}, choose file modification date. {stream} groups files by log type; an MSG_ prefix is removed from the displayed stream name. Do not include folders or wildcard characters.",
      examples:
        "Pattern: {date}_{stream}.log\nMatches: 22102026_APP.log\nMatches: 22102026_MSG_VA.log\nMatches: 22102026_MSG_CBS_KO.log\nPattern: {stream}.log.{date} (yyyy-MM-dd)\nMatches: api-request.log.2026-10-29\nPattern: {stream}.{date}.{index}.log\nMatches: api-hrmis.2026-10-19.1.log\nUndated: {stream}.log.{index} (file modification date)",
    },
    username: {
      placeholder: "e.g. log-reader",
      description:
        "The server account used to authenticate. It must be able to read the log folder and files. For SMB domain accounts, enter the domain separately.",
      examples: "log-reader\nAdministrator",
    },
    domain: {
      placeholder: "Leave empty for a local account",
      description:
        "Optional authentication domain. Leave empty for a local account, or enter the Windows domain required by your server.",
      examples: "Empty: local account\nCORP: domain account",
    },
    password: {
      placeholder: "Enter the server account password",
      description:
        "Use the password for the server account above. It is required for a new source, encrypted when stored, and never returned in source metadata. When editing, leave empty to keep the existing password.",
      examples:
        "New source: account password required\nExisting source: blank keeps saved password",
    },
    encoding: {
      placeholder: "Choose the log file encoding",
      description:
        "Match the text encoding used by the application writing the logs. UTF-8 is the default. If characters look incorrect, select the encoding used by that application.",
      examples: "UTF-8\nwindows-1252\nISO-8859-1",
    },
    timezone: {
      placeholder: "e.g. Asia/Jakarta",
      description:
        "The server timezone used to determine today and resolve date folders when following logs. This does not rewrite timestamps inside the log text.",
      examples: "Asia/Jakarta\nAsia/Makassar\nUTC",
    },
  },
  fontSize: "Log font size",
  decreaseFont: "Decrease log font size",
  increaseFont: "Increase log font size",
  resetFont: "Reset log font size to 10px",
  fontSizeChanged: "Log font size: {size}px",
  fontSizeReset: "Log font size reset to {size}px",

  connectionErrorHint:
    "Check the server connection or source settings, then try again.",
  readOnly: "Read-only",
  connectionTitle: "Source & date range",
  sourceHint: "Choose where to read and how far back to look.",
  connectionGroup: "Connection",
  connectionDescription: "Connect through SMB or SFTP over SSH.",
  filesGroup: "Log files",
  filesDescription:
    "Tell the viewer how folders and daily files are organized.",
  credentialsGroup: "Authentication",
  credentialsDescription:
    "Credentials stay on the backend and are encrypted at rest.",
  preferencesGroup: "Reading preferences",
  preferencesDescription:
    "Match the encoding and timezone used by the log producer.",
  formDescription: "Save an independent connection for this log source.",
  streamHint: "Files, joined chronologically by stream.",
  live: "Live",
  today: "Today · follows new logs",
  useToday: "Follow today",
  checking: "Checking source…",
  unavailable: "Connection unavailable",

  title: "Log viewer",
  description:
    "Read continuous SMB or SFTP log streams across daily files and month folders.",
  add: "Add source",
  edit: "Configure source",
  cancel: "Cancel",
  save: "Save source",
  saving: "Saving…",
  name: "Source name",
  host: "Host",
  port: "Port",
  shareName: "Share name",
  basePath: "Base folder",
  folderPattern: "Folder layout",
  filenamePattern: "Filename pattern",
  username: "Username",
  domain: "Domain (optional)",
  password: "Password",
  keepPassword: "Leave blank to keep the saved password",
  encoding: "Text encoding",
  timezone: "Server timezone",
  flat: "No date folders",
  yearMonth: "Year / month (yyyy/MM)",
  month: "Month only (MM)",
  patternHint:
    "Tokens: {stream} groups log types, {date} matches the selected date/time format, and {index} matches a numeric rotation. Compressed archives are not readable.",
  pathHint:
    "Relative to the share. For C$, start with Simulator, without C:\\.",
  emptyTitle: "Connect your first log source",
  emptyDescription:
    "Add a server connection and log folder, then save to discover streams.",
  source: "Log source",
  from: "From date",
  to: "To date (optional)",
  rangeHint:
    "Leave the end date empty to follow today in the server timezone. Maximum range: 366 days.",
  refresh: "Check source",
  streams: "Log streams",
  noFiles: "No matching logs in this date range.",
  noFilesHint:
    "Check the folder layout, filename pattern, or choose an earlier start date.",
  loading: "Reading logs…",
  loadingOlder: "Loading older logs…",
  older: "Load older",
  latest: "Jump to latest",
  follow: "Follow new entries",
  paused: "Paused",
  reset:
    "The log was replaced or truncated. The view restarted at the latest content.",
  error: "Unable to read logs",
  retry: "Retry",
  delete: "Delete source",
  deleteTitle: "Delete this log source?",
  deleteDescription:
    "This removes the saved connection settings. The files on the server are preserved.",
  deleted: "Log source deleted",
  saved: "Log source saved",
  connected: "Source reachable",
  fileCount: "matching files",
  bufferHint:
    "Older content is unloaded as the stream grows. Load older to read it again.",
  content: "Log content",
  preset: "JavaCMSInterface preset",
  chooseSource: "Choose a source",
} as const;
