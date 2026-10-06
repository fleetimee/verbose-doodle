export const serversMessages = {
  exportExcel: "Excel (.xlsx)",
  exportDescription:
    "Export connection details and notes. Choose which entries to include.",
  exportScope: "Export scope",
  exportPage: "Current page",
  exportFiltered: "All matching entries",
  exportAll: "Entire inventory (ignore filters)",
  exportPasswords: "Include passwords",
  exporting: "Exporting…",
  exportDownload: "Download Excel",
  exportFailed: "Failed to export server inventory",
  title: "List Server",
  description:
    "Find server addresses, access accounts, and connection details.",
  documentTitle: "Server inventory",
  documentDescription: "Manage server access entries in Fleetime Labs.",
  navigationDescription: "Server addresses, accounts, and access details.",
  add: "Add entry",
  addTitle: "Add server entry",
  editTitle: "Edit server entry",
  formDescription:
    "Keep each access account separate, even when entries share a host.",
  name: "Name",
  accessType: "Access type",
  hostPort: "Host / port",
  expandHost: "Expand host {host}",
  collapseHost: "Collapse host {host}",
  hostGroup: "Host {host}",
  copyHostGroup: "Copy host {host}",
  groupedEntryCount: "{count} entries across {hosts} hosts",
  hostsPerPage: "Hosts per page",
  hostsCount: "{count} hosts",
  host: "Host",
  port: "Port",
  username: "Username",
  password: "Password",
  link: "Link",
  openWebUrl: "Open website for {name} in a new tab",
  previewWebUrl: "Preview website for {name}",
  openInNewTab: "Open in new tab",
  webPreviewHint:
    "If the preview is blank or blocked, open the website in a new tab.",
  url: "Web URL",
  databaseEngine: "Database engine",
  databaseName: "Database name",
  viewDetails: "View details",
  viewDetailsFor: "View details for {name}",
  notes: "Notes",
  transferTitle: "Connect with {type}",
  transferWindowsIntro:
    "Open WinSCP and choose New Site. Enter the connection settings below.",
  transferLinuxIntro:
    "Open FileZilla Client, choose File > Site Manager, then New site. Enter these settings.",
  transferMacIntro:
    "Open FileZilla Client on macOS, choose File > Site Manager, then New site. Enter these settings.",
  transferSftp:
    "Select SFTP as the protocol. SFTP transfers files over SSH; it is different from FTPS.",
  transferFtp: "Select FTP as the protocol.",
  transferFtps:
    "Enable FTP over TLS. Confirm with the administrator whether the server uses explicit or implicit TLS and which port to use.",
  transferPlainFtp:
    "This entry uses plain FTP, which does not encrypt credentials or files. Use it only on the intended trusted network.",
  transferAuthenticate:
    "Enter the server account password when prompted, then connect. Admins can reveal and copy the stored password above.",
  transferSftpVerify:
    "Verify the server host-key fingerprint with the administrator before accepting it. If using key authentication, select your private key in the client.",
  transferFtpsHint:
    "Explicit FTPS usually uses port 21; implicit FTPS usually uses 990. A saved port takes precedence. Verify certificate warnings with the administrator.",
  smbTitle: "Connect to a shared folder",
  smbShare: "Share name or folder path (optional)",
  smbSharePlaceholder: "e.g. shared/documents",
  smbShareHint:
    "Leave blank to browse available shares. This input is only used to build the connection path and is not saved.",
  smbCopyPath: "Copy SMB path",
  smbWindowsIntro:
    "Open File Explorer. Paste this path into the address bar and press Enter.",
  smbWindowsConnect:
    "Open the shared folder. To keep it as a drive, use This PC > Map network drive and enter the full share path.",
  smbLinuxIntro:
    "Open Files on GNOME or Dolphin on KDE. Paste this address into the location bar.",
  smbLinuxConnect:
    "In Files, you can also use Other Locations > Connect to Server. Connect, then select the shared folder if none was specified.",
  smbMacIntro:
    "In Finder, choose Go > Connect to Server, or press Command+K. Paste this server address.",
  smbMacConnect:
    "Select Connect, then Registered User. Choose a shared folder if none was specified.",
  smbAuthenticate:
    "Sign in with the server account and password shown above. Use the domain-qualified account if your administrator requires it. Admins can reveal and copy the stored password.",
  smbPortHint:
    "This entry has a nonstandard SMB port. These desktop paths use the standard SMB service on port 445; ask the administrator for the required client or network configuration.",
  rdpTitle: "Connect with RDP",
  rdpPlatform: "Your operating system",
  rdpWindowsIntro:
    "Open PowerShell and run this command to launch Remote Desktop Connection.",
  rdpWindowsConnect:
    "Select Connect. If asked for the computer address, use the host and port shown above.",
  rdpLinuxIntro:
    "Install and open Remmina with its RDP plugin. Use this server address.",
  rdpLinuxProfile:
    "Create a connection profile and select RDP as the protocol. Paste the address into Server.",
  rdpLinuxConnect:
    "Enter the username shown above, then select Connect. If no username is saved, ask the server administrator for your account.",
  rdpMacIntro:
    "Install Windows App from the Mac App Store, then open it. Use this PC address.",
  rdpMacProfile:
    "Select Add PC and paste the address into PC name. Leave credentials set to ask when required, or select your saved account.",
  rdpMacConnect: "Add the PC, then double-click its tile to connect.",
  rdpNetwork:
    "Connect to the server network or VPN if required. Remote Desktop must be enabled on the server.",
  rdpAuthenticate:
    "Sign in with the server account and password. Verify any certificate warning with the server administrator before continuing.",
  rdpCopyAddress: "Copy RDP address",
  rdpCopyCommand: "Copy RDP command",
  rdpReference: "Connection setup reference",
  databaseClient: "Database client",
  databaseCommandTab: "Command",
  databaseDataGripStart:
    "In DataGrip, open Data Sources and Drivers, select + then Data Source, and choose {engine}. Fill in these connection settings.",
  databaseDataGripFinish:
    "Download missing driver files if prompted, select Test Connection, then apply the settings.",
  databaseDBeaverStart:
    "In DBeaver, choose Database > New Database Connection, select {engine}, then enter these connection settings.",
  databaseDBeaverFinish:
    "Select Test Connection, download the driver if prompted, then select Finish.",
  databaseGuiCredentials:
    "Enter your account password in the client. Admins can reveal and copy the stored password above.",
  databaseGuiEngineHint:
    "Available fields depend on the driver. For Oracle, confirm whether the database name is a service name or SID. MongoDB authentication may require a separate authentication database. Some engines require a client edition or additional driver.",
  databaseCopyField: "Copy {field}",
  databaseTitle: "Connect to {engine}",
  databaseTitleGeneric: "Connect to database",
  databaseCommandIntro:
    "Run this command from a machine that has the database client installed.",
  databaseAddressIntro: "Use this address in your database client of choice.",
  databaseNetwork: "Connect to the server network or VPN if required.",
  databaseAuthenticate:
    "Enter the account password when prompted. It is not included in the command.",
  databaseCopyCommand: "Copy database command",
  databaseCopyAddress: "Copy database address",
  sshWindowsIntro:
    "Open PowerShell or Windows Terminal and run this command. If ssh is unavailable, install OpenSSH Client from Windows Optional features.",
  sshLinuxIntro:
    "Open your terminal and run this command. Install the OpenSSH client from your distribution’s package manager if needed.",
  sshMacIntro:
    "Open Terminal and run this command using the built-in SSH client.",
  sshTitle: "Connect with SSH",
  sshTerminal:
    "Open Terminal on macOS or Linux, or Git Bash / WSL on Windows, and run this command.",
  sshCopyCommand: "Copy SSH command",
  sshMissingUsername:
    "No username is saved. This command uses your local username. Add -l followed by the server account name if it differs.",
  sshNetwork: "Connect to the server network or VPN if required.",
  sshFingerprint:
    "On your first connection, verify the displayed host fingerprint with the server administrator before accepting it.",
  sshAuthenticate:
    "Enter your password when prompted, or use your configured SSH key. Password characters will not appear as you type.",
  sshReference: "OpenSSH command reference",
  detailsTitle: "Connection details",
  createdAt: "Created at",
  updatedAt: "Updated at",
  updated: "Updated",
  actions: "Actions",
  edit: "Edit entry",
  delete: "Delete entry",
  save: "Save entry",
  refresh: "Refresh",
  search: "Search name, host, account, or notes...",
  searchCompact: "Search servers...",
  allTypesCompact: "All types",
  allEnginesCompact: "All engines",
  clearFiltersCompact: "Clear",
  revealAllCompact: "Reveal passwords",
  filterEngine: "Filter by database engine",
  allEngines: "All database engines",
  filterType: "Filter by access type",
  allTypes: "All access types",
  fullscreen: "Fullscreen table",
  exitFullscreen: "Exit fullscreen",
  clearFilters: "Clear filters",
  chooseType: "Choose an access type",
  typeSearch: "Find or create an access type...",
  createType: 'Create "{type}"',
  typeDescription: "Choose an existing type or create your own.",
  namePlaceholder: "e.g. WINDOWS-DEV56",
  optionalFields: "Optional details",
  hostDescription:
    "Choose an existing host or enter a new IP address or hostname.",
  hostSearch: "Find or enter a host...",
  useHost: 'Use "{host}"',
  hostPlaceholder: "IP address or hostname",
  portPlaceholder: "Optional connection port",
  usernamePlaceholder: "Optional access account",
  urlPlaceholder: "https://example.internal",
  chooseEngine: "Choose a database engine",
  engineSearch: "Find or create a database engine...",
  createEngine: 'Create "{type}"',
  enginePlaceholder: "e.g. POSTGRESQL or SQLSERVER",
  databasePlaceholder: "Optional database name",
  notesPlaceholder: "Purpose, connection instructions, or other details",
  passwordPlaceholder: "Optional access password",
  keepPasswordPlaceholder: "Leave blank to keep the password",
  keepPasswordDescription:
    "Leave blank to preserve the stored password. Enter a value to replace it.",
  passwordDescription: "Enter the password for this access account.",
  removePassword: "Remove the stored password",
  showPassword: "Show typed password",
  hidePasswordFor: "Hide password for {name}",
  passwordRevealed: "Password revealed for {name}",
  passwordHidden: "Password hidden",
  hidePassword: "Hide password",
  passwordTitle: "Password for {name}",
  revealDescription:
    "Hidden after 30 seconds, when you close this dialog, or when you leave this tab.",
  revealFor: "Reveal password for {name}",
  revealAll: "Reveal all passwords",
  revealingPasswords: "Revealing passwords",
  revealAllError:
    "Some passwords could not be revealed. Turn the switch off and on to try again.",
  copyPasswordFor: "Copy password for {name}",
  passwordStored: "Password stored",
  copyPassword: "Copy password",
  copyHost: "Copy host for {name}",
  copyUsername: "Copy username for {name}",
  copied: "Copied to clipboard",
  copyFailed: "Could not copy. Select the value and copy it manually.",
  notSet: "Not set",
  retry: "Try again",
  emptyTitle: "No server entries yet",
  emptyDescription: "Add your first server or service access entry.",
  noMatches: "No matching entries",
  noMatchesDescription: "Try another search or clear the access-type filter.",
  entryCount: "{count} entries",
  pageCount: "Page {page} of {pages}",
  rowsPerPage: "Rows per page",
  rowsCount: "{count} rows",
  sortBy: "Sort by {column}",
  actionsFor: "Actions for {name}",
  required: "This field is required.",
  tooLong: "Use at most {max} characters.",
  invalidHost: "Enter an IP address or hostname without a port, URL, or path.",
  invalidPort: "Enter a whole number from 1 to 65535.",
  invalidUrl: "Enter an HTTP or HTTPS URL without embedded credentials.",
  createSuccess: "Server entry added",
  updateSuccess: "Server entry updated",
  deleteSuccess: "Server entry deleted",
  loadError: "Could not load server inventory",
  deleteTitle: "Delete this server entry?",
  deleteDescription:
    "Delete {name} at {host}? Its stored credential will also be deleted. This cannot be undone.",
} as const;
