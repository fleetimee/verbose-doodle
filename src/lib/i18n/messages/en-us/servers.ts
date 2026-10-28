export const serversMessages = {
  cleanup: {
    filesPartial: "Some files could not be listed.",
    loadMoreFolders: "Show more folders",
    loadMoreFiles: "Load more files",
    folderSizeUnknown: "Size unknown",
    foldersLoading: "Scanning subfolders…",
    largestFolders: "Folders by disk usage",
    foldersScope:
      "Expand folders to browse files and subfolders. Files load 100 at a time. Sizes depend on scan limits and SSH permissions.",
    foldersPartial: "Partial sizes — some usage may be missing.",
    foldersUnavailable: "Scan unavailable. Retry or inspect in SSH.",
    foldersEmpty: "No files or subfolders found.",

    copyCleanupCommand: "Copy cleanup command",
    diskCleanup:
      "Inspect large directories first, then choose files or application-specific cleanup. There is no general disk prune command.",
    journalCleanup:
      "Cleanup rotates the journal and deletes archived logs older than 14 days. Requires journal management permission; runs without a confirmation prompt.",
    imagesCleanup:
      "Cleanup removes all images unused by any container, including tagged images. They may need downloading or rebuilding later. Docker asks for confirmation.",
    containersCleanup:
      "Cleanup deletes all stopped containers and their writable data. Docker asks for confirmation.",
    volumesCleanup:
      "Cleanup deletes unused anonymous volumes and their data. Named volumes are kept on Docker Engine 23+. Review the Docker confirmation prompt before proceeding.",
    buildCacheCleanup:
      "Cleanup removes all unused build cache. Future builds may take longer. Docker asks for confirmation.",

    copyCommand: "Copy inspection command",
    button: "Cleanup",
    title: "Cleanup review",
    description: "Inspect storage use before deciding what to remove.",
    scope:
      "Commands are copied, not run. Cleanup deletes data when executed in SSH. Reclaimable space is an estimate.",
    journal: "System journal",
    journalHint: "Usage visible to the saved SSH account.",
    diskUsage: "{used} of {total} used · {free} free",
    pressure:
      "Disk usage is 75% or higher; review large directories and retention.",
    images: "Images",
    containers: "Containers",
    volumes: "Local volumes",
    buildCache: "Build cache",
    used: "{size} used",
    reclaimable: "{size} reclaimable",
    counts: "{active} active of {total}",
    unavailable:
      "Storage inspection is unavailable. Check SSH access and retry.",
    dockerUnavailable: "Docker storage could not be inspected on this host.",
    missing: "Not available",
    loading: "Inspecting storage…",
    ssh: "Open Host SSH",
    sshHint: "Opens the host terminal in a new tab for manual inspection.",
    refresh: "Refresh inspection",
  },
  containers: {
    logsTitle: "Container logs",
    logsIdle: "Start streaming to view container output.",
    logsConnecting: "Connecting to log stream…",
    logsLive: "Live · following container output",
    logsEnded: "Log stream ended. Pause and start again to reconnect.",
    logsFailed:
      "Logs are unavailable. Check the container and its Docker logging driver.",
    logsFollow: "Follow logs",
    logsClear: "Clear",
    logsPause: "Pause stream",
    logsStart: "Start streaming",
    logsEmpty: "No log output to display.",
    logsHint:
      "Shows the last 200 log lines, then streams new output with timestamps. Keeps the latest 200,000 characters. Pausing or hiding this tab disconnects the stream; resuming reloads the latest logs.",

    installedSoftware: "Installed software",
    softwareDescription: "Common tools available on the container user’s PATH.",
    softwareEmpty: "None of the common tools checked were detected.",
    softwareUnavailable:
      "Software detection is unavailable. The container must be running with a working sh shell.",
    hostTerminal: "Host SSH",
    liveMetrics: "Live resource usage",
    stoppedMetrics:
      "Live usage is unavailable while this container is stopped.",
    start: "Start container",
    stop: "Stop container",
    restart: "Restart container",
    exec: "Container shell",
    stopTitle: "Stop this container?",
    restartTitle: "Restart this container?",
    stopDescription:
      "Stop {name} on {host}? Active connections will be interrupted. Docker allows 10 seconds for shutdown before forcing it to stop.",
    restartDescription:
      "Restart {name} on {host}? Active connections will be interrupted. Docker allows 10 seconds for shutdown before starting it again.",
    actionWorking: "Applying…",
    actionSuccess: "Container action completed",
    invalidState:
      "The container state does not allow this action. Refresh its details and try again.",
    actionFailed:
      "The container action failed or timed out. Refresh its state before trying again.",
    managementHint:
      "Start is available for stopped containers. Stop, restart, and terminal are available while running.",
    execFailed:
      "Could not run the container shell. Check that the container is running, Docker is accessible, and /bin/sh or /bin/bash exists. Host shell access is never used as a fallback.",
    shell: "Container shell",
    backToContainer: "Back to container",
    terminalEnded:
      "Container shell session ended. Reconnect to open another shell.",
    terminalHelp:
      "Commands run inside the selected container as its configured user. Exit or disconnect ends this shell session; the container keeps running. No host file browser is available.",
    hostDetails: "Host details",
    hostDetailDescription: "Live system metrics and containers, together.",
    backToHosts: "Back to hosts",
    backToHost: "Back to host",
    view: "Server view",
    serversTitle: "Container servers",
    hostMetrics: "Host metrics",
    stopped: "Stopped",
    total: "Total",
    coreCount: "{count} cores",
    images: "Images",
    pausedCount: "{count} paused",
    openContainer: "View container {name}",
    networkTotal: "Net total",
    ioTotal: "I/O total",
    detailTitle: "Container details",
    serverContainers: "Containers · {name}",
    backToContainers: "Back to containers",
    otherStates: "Other containers",
    autoRefresh: "Updates every 5 seconds",
    containerName: "Name",
    containerId: "Container ID",
    path: "Executable path",
    image: "Image",
    created: "Created",
    networks: "Networks / IP addresses",
    mounts: "Volume binds / mounts",
    noAddress: "No assigned IP address",
    notPublished: "Not published",
    readWrite: "Read / write",
    readOnly: "Read only",
    basicInfo: "Basic info",
    noNetworks: "No networks attached.",
    noPorts: "No exposed ports or published mappings.",
    noMounts: "No volume binds or mounts.",
    refreshDetails: "Refresh details",
    readOnlyDetails: "Live, read-only container details.",
    notFound:
      "This container is no longer available. Return to the container list and refresh.",
    openDetails: "View server details for {name}",
    overview: "Server overview",
    title: "Docker containers",
    description: "Live containers on this server.",
    count: "{running} running · {total} total",
    refresh: "Refresh containers",
    loading: "Loading containers…",
    search: "Search containers…",
    includeStopped: "Include stopped",
    name: "Name / image",
    state: "State",
    ports: "Ports",
    credentialsRequired:
      "Save an SSH username and password to list containers.",
    notInstalled:
      "Docker CLI is not installed or is unavailable to this SSH account.",
    dockerUnavailable:
      "Cannot reach Docker on this server. Check that Docker is running and this SSH account can access /var/run/docker.sock, then refresh.",
    collectionFailed:
      "Could not list containers. Check Docker access using the terminal, then refresh.",
    limitExceeded:
      "Container output exceeds the collector limit (500 containers or 1 MiB). Use the terminal or Portainer to inspect this host.",
    statsUnavailable:
      "Container resource usage is unavailable. The container list is still shown; refresh to retry usage collection.",
    empty: "No matching containers",
    emptyDescription:
      "Try another search or include stopped containers. This server may not have any containers yet.",
    scope:
      "Read-only monitoring through SSH, refreshed every 5 seconds while this page is active. Includes Portainer-managed containers on this host’s standard Docker socket; other Portainer environments are not included. CPU can exceed 100% across cores. Network and I/O figures are cumulative totals, not transfer rates. No history is stored.",
    states: {
      created: "Created",
      restarting: "Restarting",
      running: "Running",
      removing: "Removing",
      paused: "Paused",
      exited: "Exited",
      dead: "Dead",
    },
  },
  metrics: {
    totalCapacity: "/{total}",
    terminalFor: "Open terminal for {name}",
    title: "Server Metrics",
    documentTitle: "Server metrics | Fleetime Labs",
    details: "Measurement details",
    inventory: "Inventory",
    description: "Live system metrics and Docker, organized by host.",
    scope:
      "One SSH account per host. Memory excludes reclaimable cache; disk usage is for /. Network totals exclude loopback and may include virtual interfaces. I/O sums whole block devices, excluding loop, RAM, device-mapper, and RAID devices. No history is stored.",
    search: "Search SSH servers…",
    pause: "Pause updates",
    resume: "Resume updates",
    paused: "Paused",
    live: "Live",
    unavailable: "Unavailable",
    collecting: "Loading metrics…",
    cpu: "CPU",
    memory: "Memory",
    disk: "Disk (/)",
    network: "Network",
    io: "Disk I/O",
    receive: "Receive",
    transmit: "Send",
    read: "Read",
    write: "Write",
    cores: "{count} cores",
    uptime: "Uptime {days}d {hours}h",
    uptimeUnavailable: "Uptime unavailable",
    uptimeLabel: "Uptime",
    specSystem: "System",
    specProcessor: "Processor",
    specResources: "Resources",
    specTitle: "Server specification",
    specDescription: "System details reported over SSH.",
    specOs: "Operating system",
    specKernel: "Kernel",
    specArch: "Architecture",
    specHostname: "Hostname",
    specCpu: "CPU",
    specAes: "AES-NI",
    specVirt: "Virtualization",
    specVm: "Virtual machine",
    specBare: "Bare metal",
    specSwap: "Swap",
    specLoad: "Load average",
    specYes: "Enabled",
    specNo: "Disabled",
    specNone: "None",
    updated: "Collected {time}",
    hostKeyRequired:
      "Open the terminal and review this server’s SSH host key before collecting metrics. If already trusted, check the backend known_hosts configuration.",
    collectionFailed:
      "Could not read server metrics. Check access to /proc, /sys, and df, then resume updates.",
    unsupported: "Metrics currently support Linux over SSH only.",
    busy: "The metrics collector is busy. Collection will retry on the next refresh.",
    empty: "No matching SSH servers",
    emptyDescription:
      "Add a Linux SSH entry with a stored username and password, or change your search.",
    previous: "Previous",
    next: "Next",
  },
  sessionExitTitle: "Disconnect from {server}?",
  sessionExitDescription:
    "This will end your connection and interrupt any active file transfers. The remote server controls whether your desktop or processes keep running.",
  sessionKeepConnected: "Stay connected",
  sessionDisconnectAndLeave: "Disconnect and leave",

  rdpTakeoverNotificationTitle: "RDP session taken over: {name}",
  rdpDisconnectDialogTitle: "Remote desktop disconnected",
  rdpSessionTakenOver:
    "Another connection ended your RDP session. You can reconnect, but doing so may disconnect the other connection.",
  rdpSessionForcedClosed:
    "The remote server forcibly closed your RDP session. Reconnect to try again.",
  rdpDisconnectUnexpected:
    "Your RDP connection ended unexpectedly. Another connection, the network, or the remote server may have ended it. Reconnect to try again.",

  sftpBrowserTitle: "SFTP file browser",
  sftpOpenBrowser: "Open file browser",
  sftpBackToTerminal: "Back to terminal",
  sftpLocal: "Local",
  sftpSelectedFiles: "Selected files",
  sftpChooseFiles: "Choose files",
  sftpChooseFolder: "Choose folder",
  sftpLocalHint:
    "Local files stay on your computer until uploaded. Choose files or a folder to browse. Downloads use your browser's save location.",
  sftpLocalEmpty:
    "Choose local files or a folder to get started. Folder selection lists files and their folders; empty folders are not included.",
  sftpEmptyDirectory: "This directory is empty.",
  sftpNoMatches: "No files match your filter.",
  sftpLoading: "Loading directory...",
  sftpListFailed:
    "Could not list this directory. Check the path, account permissions, and SFTP support, then refresh.",
  sftpNotDirectory:
    "This path is not a directory. Enter a folder path or download the file instead.",
  sftpModified: "Date modified",
  sftpSize: "Size",
  sftpKind: "Kind",
  sftpFolder: "Folder",
  sftpFile: "File",
  sftpSymlink: "Link",
  sftpOther: "Other",
  sftpBack: "Back",
  sftpForward: "Forward",
  sftpUp: "Parent directory",
  sftpRefresh: "Refresh directory",
  sftpPath: "Path",
  sftpFilter: "Filter files",
  sftpHidden: "Hidden files",
  sftpOpenFolder: "Open folder",
  sftpItems: "items",
  sftpTruncated: "Showing the first 1,000 entries.",
  sftpInteractionHint:
    "Select a file, then Upload or Download. Double-click a folder to open it.",
  sftpLimitHint:
    "One transfer at a time. 100 MiB per file. Existing files are never overwritten.",

  sshFilesMenu: "Files",
  sshUploadAction: "Upload file",
  sshDownloadAction: "Download file",
  sshCancelTransfer: "Cancel transfer",
  sshCancellingTransfer: "Cancelling transfer...",
  sshUploadDirectory: "Remote directory",
  sshDownloadPath: "Remote file path",
  sshUploadFile: "Local file",
  sshTransferDescription:
    "Transfer one file at a time, up to 100 MiB. Compress folders into a ZIP first.",
  sshUploadHint:
    "Use an existing directory. Relative paths start in the SFTP home directory, independently of the shell. Existing files are never overwritten.",
  sshDownloadHint:
    "Enter the path of a regular file. Relative paths start in the SFTP home directory. Downloads use your browser's save location.",
  sshTransferFailed:
    "Transfer failed. Check the path, account permissions, and that the server supports SFTP.",
  sshTransferExists:
    "The remote file already exists. Rename the local file or choose another directory.",
  sshTransferLimit:
    "Transfer limit reached. Each file must be at most 100 MiB, with up to 300 MiB uploaded per SSH session.",
  sshTransferNotFile:
    "This path is not a regular file. Compress folders into a ZIP first.",
  sshTransferChanged:
    "The remote file changed during download. Try again after it stops changing.",
  sshTransferTimeout: "Transfer timed out. Check the connection and try again.",
  sshTransferBusy:
    "A transfer is already running. Wait for it to finish and try again.",
  sshTransferCancelled:
    "Transfer cancelled. An interrupted upload may leave a partial file; check the remote directory.",
  sshTransferInterrupted:
    "Transfer interrupted by disconnection. Check for a partial upload before retrying.",
  sshUploadReady: "File uploaded",
  sshDownloadReady: "File ready to save",
  sshUploading: "Uploading",
  sshDownloading: "Downloading",

  sshMenuLabel: "SSH terminal controls",
  sshSessionMenu: "Session",
  sshTerminalMenu: "Terminal",
  sshCredentialsMenu: "Credentials",
  sshPasteServerPassword: "Paste saved password",
  sshPasteOtherServerPassword: "From other server",
  sshPasswordSent: "Password entered",
  sshPastePasswordFailed: "Could not retrieve saved password",
  sshNoSavedPassword: "No saved password available",
  sshSudoPromptDetected: "Saved credentials",
  sshDismissPopup: "Dismiss",
  sshViewMenu: "View",
  sshCopySelection: "Copy selection",
  sshSelectAll: "Select all",
  sshClearDisplay: "Clear display and scrollback",
  sshLargerText: "Larger text",
  sshSmallerText: "Smaller text",
  sshResetTextSize: "Reset text size",
  sshFullscreen: "Fullscreen terminal",
  sshExitFullscreen: "Exit fullscreen",
  sshFullscreenFailed: "Could not change fullscreen mode. Try again.",
  sshSelectionCopied: "Selection copied",
  sshSelectionCopyFailed: "Could not copy the selection",
  sshTerminalHelp:
    "Closing this window disconnects SSH. Reconnect starts a new shell.",

  rdpMenuLabel: "Remote desktop controls",
  rdpSessionMenu: "Session",
  rdpDesktopMenu: "Desktop",
  rdpViewMenu: "View",
  rdpPreviousDesktop: "Previous desktop",
  rdpNextDesktop: "Next desktop",
  rdpTaskView: "Task View",
  rdpShowDesktop: "Show desktop",
  rdpTaskManager: "Task Manager",

  rdpSessionWarningTitle: "This RDP account is already in use",
  rdpSessionWarningDescription:
    "Another browser connection through this backend is using this server and Windows account. Continuing may disconnect that connection, depending on Windows settings. Do you want to continue?",
  rdpSessionChanged:
    "Another connection started while you were connecting. Reconnect to review the session warning.",

  rdpCertificateTitle: "Trust this server certificate?",
  rdpCertificateWarning:
    "This certificate has not been trusted for this server. Your connection may not be secure. Continue only if you recognize this server and certificate.",
  rdpCertificateChanged:
    "The server certificate has changed. Review its fingerprint before continuing.",
  rdpCertificateSubject: "Subject",
  rdpCertificateIssuer: "Issuer",
  rdpCertificateValidity: "Valid from / until",
  rdpCertificatePrevious: "Previously trusted fingerprint",
  rdpCertificateManaged:
    "Certificate trust is managed by the operator. Contact your administrator to update the configured fingerprint.",
  rdpCertificateTrustFailed:
    "Could not trust the certificate. Reconnect to check whether it changed, then try again.",
  rdpCertificateCancel: "Cancel",
  rdpCertificateContinue: "Continue",
  rdpCertificateSaving: "Trusting certificate…",
  rdpShowCertificate: "Show certificate",

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
  lastDefinitionUpdate: "Last definition update",
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
  sshCapacityExceeded:
    "The backend terminal limit has been reached. Disconnect another terminal or try again later.",
  sshOpenTerminal: "Open terminal",
  sshPopupBlocked: "Allow pop-ups for this site, then open the terminal again.",
  sshBrowserIntro:
    "Open an interactive SSH terminal in a new window. The backend connects using the stored credentials.",
  sshCredentialsRequired:
    "Save a username and password in this SSH entry to use the browser terminal.",
  sshConnecting: "Connecting…",
  sshConnected: "Connected",
  sshDisconnected: "Disconnected",
  sshDisconnect: "Disconnect",
  sshReconnect: "Reconnect",
  sshBackToInventory: "Server inventory",
  sshLoading: "Loading server…",
  sshLoadFailed:
    "Could not load this server. Return to the inventory and try again.",
  sshConnectionFailed:
    "Could not connect. Check the server address, port, and backend network access, then reconnect.",
  sshAuthFailed:
    "SSH authentication failed. Check the stored username and password, then reconnect.",
  sshHostKeyTitle: "Trust this SSH server?",
  sshHostKeyDescription:
    "This server is not trusted yet. Compare its SHA-256 fingerprint with the server administrator before approving. Approval saves this key on the backend and continues the connection. This request expires after 90 seconds.",
  sshHostKeyAlgorithm: "Key algorithm",
  sshHostKeyFingerprint: "SHA-256 fingerprint",
  sshHostKeyTrust: "Trust key and connect",
  sshHostKeySaving: "Saving key and connecting…",
  sshHostKeyCancel: "Cancel connection",
  sshKnownHostsWriteFailed:
    "Could not save the host key. Ask an administrator to make the backend SSH directory writable, then reconnect.",
  sshHostKeyApprovalExpired:
    "Host key approval expired. Reconnect to review the fingerprint again.",
  sshKnownHostsMissing:
    "The backend known_hosts file is missing. Ask an administrator to configure it, then reconnect.",
  sshHostKeyRejected:
    "The server host key was rejected or has changed. Ask an administrator to verify it and update the backend known_hosts file.",
  sshSessionEnded: "The SSH session ended. Reconnect to start a new shell.",
  sshOutputOverflow:
    "Terminal output exceeded the buffer limit. Reconnect to start a new shell.",
  rdpOpenDesktop: "Open desktop",
  rdpBrowserIntro:
    "Open an interactive remote desktop in a new window using the stored credentials.",
  rdpCredentialsRequired:
    "Save a username and password in this RDP entry to use the browser desktop.",
  rdpDesktopTitle: "Remote desktop",
  rdpConnecting: "Connecting to desktop…",
  rdpConnected: "Connected",
  rdpDisconnected: "Disconnected",
  rdpConnectionFailed:
    "Could not connect to the desktop. Check that the RDP gateway is running, can reach the server, and trusts its certificate.",
  rdpAuthFailed:
    "Authentication failed. Check your app session and the stored RDP username and password, then reconnect.",
  rdpInvalidEntry:
    "The RDP connection settings are invalid. Check this inventory entry and reconnect.",
  rdpCapacityExceeded:
    "The backend desktop limit has been reached. Disconnect another desktop or try again later.",
  rdpSessionExpired:
    "The desktop session expired. Reconnect to start another connection.",
  rdpSessionEnded: "The desktop connection ended. Reconnect to open it again.",
  rdpUnstable: "The desktop connection is responding slowly.",
  rdpCopyClipboard: "Copy remote clipboard",
  rdpDesktopHelp:
    "Click the desktop to control it. Press Shift+Escape to return to the controls. Use Files > Upload files to send files to Windows. To download a file, copy it into This PC > Fleetime Downloads > Download in Windows. Closing this window disconnects RDP.",
  rdpFilesMenu: "Files",
  rdpUploadAction: "Upload files…",
  rdpUploadCancel: "Cancel uploads",
  rdpUploadSending: "Uploading file…",
  rdpUploadReady:
    "File uploaded to Fleetime Downloads. Copy it to a Windows folder before disconnecting.",
  rdpUploadCancelled:
    "Uploads cancelled. A partial file may remain in Fleetime Downloads; delete it before retrying.",
  rdpUploadInterrupted:
    "Upload interrupted. Reconnect and select the file again.",
  rdpUploadFailed:
    "Could not upload the file. Check drive space and the filename, then try again.",
  rdpUploadLimit:
    "Upload limit reached. Use files up to 100 MiB, select at most 10 files, and upload up to 300 MiB per session.",
  rdpDownloadReceiving: "Receiving file…",
  rdpDownloadReady: "File ready. Check your browser downloads.",
  rdpDownloadSave: "Save file",
  rdpDownloadFailed:
    "Could not download the file. Copy it into the Download folder again.",
  rdpDownloadInterrupted:
    "File transfer interrupted. Reconnect and copy the file into the Download folder again.",
  rdpDownloadLimit:
    "Download limit reached. Use files up to 100 MiB and transfer no more than three at once.",
  rdpCtrlAltDelete: "Send Ctrl+Alt+Delete",
  rdpFullscreen: "Fullscreen desktop",
  rdpExitFullscreen: "Exit fullscreen",
  rdpFullscreenFailed:
    "Fullscreen could not be opened. Try again using the fullscreen button.",
  rdpKeyboardLabel: "Remote desktop keyboard input",
  rdpDesktopLoading: "Waiting for the remote desktop…",
} as const;
