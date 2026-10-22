export const logViewerMessages = {
  checkConnection: "Check connection",
  checkSuccess:
    "Connection verified. The share and base folder are readable. Nothing has been saved.",
  errorAuth:
    "Windows rejected the login. Check the username, domain, and password in Configure source.",
  errorAccess:
    "This Windows account cannot read the share or folder. Check its read permissions.",
  errorShare:
    "The share was not found. Discover shares again or enter the correct share name.",
  errorPath:
    "The log folder or file was not found. Browse the folder and review the saved path.",
  errorConnect:
    "Cannot reach the Windows server. Check its host, SMB port, and network connection.",
  errorTimeout:
    "The server took too long to respond. Check its availability, then retry.",
  errorStorage:
    "Saved sources are temporarily unavailable. Check the backend database connection, then reload sources.",
  errorBackend:
    "The log service could not complete this request. Check the backend is running and review its logs, then retry.",
  errorCredentials:
    "The saved SMB password could not be read. Enter the password again and save the source.",
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
    "Type a host or choose a saved server to fill its login. Non-SMB entries use port 445.",
  inventoryPassword:
    "Saved inventory password will be used. Enter a password here to override it.",
  inventoryLoading: "Loading servers…",
  inventoryMore: "Load more servers",
  browseShareRequired:
    "Enter a share name above (for example C$ or AppLogs) to browse folders.",
  browse: "Browse folders",
  closeBrowser: "Close browser",
  browsePrerequisite:
    "Enter the host, share, username, and password first. Re-enter the password if connection details have changed.",
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
    "No supported dated log files found here. Open a log folder or its year/month parent, or enter settings manually.",
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
    name: {
      placeholder: "e.g. JavaCMSInterface",
      description:
        "A display name for this saved source. It does not need to match a Windows folder or service. Up to 150 characters.",
      examples: "JavaCMSInterface\nPayment gateway logs",
    },
    host: {
      placeholder: "e.g. 192.168.4.45",
      description:
        "The Windows server IP address or hostname reachable from the backend. Enter only the host, without smb://, a share name, or a folder path.",
      examples: "192.168.4.45\nwindows-logs.example",
    },
    port: {
      placeholder: "445",
      description:
        "The SMB listening port on that server. Usually 445; any whole number from 1 to 65535 is accepted.",
      examples: "445",
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
        "The log folder relative to the share. Use / or backslash separators, without a drive letter, host prefix, or parent (..) segments. Leave empty if logs are at the share root.",
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
        "Include exactly one {date} and one {stream}. {date} is an eight-digit ddMMyyyy date. {stream} groups files by log type; an MSG_ prefix is removed from the displayed stream name. Do not include folders or wildcard characters.",
      examples:
        "Pattern: {date}_{stream}.log\nMatches: 22102026_APP.log\nMatches: 22102026_MSG_VA.log\nMatches: 22102026_MSG_CBS_KO.log",
    },
    username: {
      placeholder: "e.g. log-reader",
      description:
        "The Windows account used to authenticate to SMB. It must be able to read the share and log files. If the account belongs to a domain, enter that domain in the separate Domain field.",
      examples: "log-reader\nAdministrator",
    },
    domain: {
      placeholder: "Leave empty for a local account",
      description:
        "Optional authentication domain. Leave empty for a local account, or enter the Windows domain required by your server.",
      examples: "Empty: local account\nCORP: domain account",
    },
    password: {
      placeholder: "Enter the SMB account password",
      description:
        "Use the password for the Windows account above. It is required for a new source, encrypted when stored, and never returned in source metadata. When editing, leave empty to keep the existing password.",
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

  connectionErrorHint:
    "Check the server connection or source settings, then try again.",
  readOnly: "Read-only",
  connectionTitle: "Source & date range",
  sourceHint: "Choose where to read and how far back to look.",
  connectionGroup: "Connection",
  connectionDescription: "Connect to a Windows share on any server.",
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
  streamHint: "Daily files, joined chronologically by stream.",
  live: "Live",
  today: "Today · follows new logs",
  useToday: "Follow today",
  checking: "Checking source…",
  unavailable: "Connection unavailable",

  title: "Log viewer",
  description:
    "Read continuous SMB log streams across daily files and month folders.",
  add: "Add source",
  edit: "Configure source",
  cancel: "Cancel",
  save: "Save source",
  saving: "Saving…",
  name: "Source name",
  host: "Host",
  port: "SMB port",
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
    "{date} matches ddMMyyyy; {stream} matches APP, MSG_VA, MSG_CBS_KO, and other types.",
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
