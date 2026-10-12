# Browser SSH terminal

Administrators can open an SSH inventory entry and select **Open terminal**.
The terminal opens in a separate browser window. It supports interactive commands,
terminal applications and resizing. The compact Session, Terminal, and View
menus provide disconnect/reconnect, copy selection, select all, local display
clearing, text sizing, and fullscreen. Clearing the local display does not run a
remote command. Changing text size resizes the PTY without reconnecting. Reconnect starts a
new shell; closing the window ends the connection. Established sessions have no
fixed backend lifetime limit, with at most 16 open terminal connections per backend
instance. The frontend lock overlay is disabled on the terminal route. Network
failures, remote SSH policies, and backend restarts can still end the connection.

The entry must have a stored username and password. Browser SSH currently uses
password authentication. Key-only and multi-step MFA logins still require a
local SSH client. USER accounts retain read-only inventory access.

## Backend setup

Deploy the matching backend implementation. It uses SSHJ to connect only to
saved SSH entries, with credentials read on the backend. Passwords are not sent
to the terminal window or included in URLs. The backend must reach each server's
SSH port, including any required office network or VPN.

Set `SSH_KNOWN_HOSTS` or `app.ssh.known-hosts` to an OpenSSH `known_hosts` file.
When empty, the backend uses `.ssh/known_hosts` in its process user's home.
Mount the SSH directory into the backend container with write access when deploying
with Docker. The backend creates a missing `known_hosts` file after the first
explicit host-key approval.
Verify each server fingerprint through a trusted channel before adding its host
key. Nonstandard ports use OpenSSH's `[host]:port` notation. Unknown keys require
fingerprint review and explicit administrator approval in the terminal. Changed
keys remain rejected; the application never automatically trusts or replaces keys.

Allow the frontend origin in the backend's existing `app.websocket.allowed-origins`
configuration. The terminal uses the existing Redis-backed, single-use realtime
tickets with the `server-ssh` audience. Only administrators can request them.
Tickets expire after the configured realtime ticket TTL and are consumed during
the WebSocket handshake. Missing, expired, reused, and wrong-audience tickets
are rejected.

## Frontend deployment

Vite and the existing Docker nginx proxy forward WebSocket upgrades for
`/api/servers/terminal`. No additional proxy route is needed.

When hosting on Vercel, set `VITE_SERVER_SSH_WS_URL` at build time to the backend's
public TLS WebSocket endpoint, for example
`wss://backend.example.com/api/servers/terminal`. Vercel's HTTP serverless proxy
cannot carry this long-lived terminal connection. The backend must have HTTPS/TLS
and allow the deployed frontend origin. Never include credentials or a ticket in
this environment variable; the client adds a short-lived ticket for each connection.

## Manual validation

With an administrator account and an SSH entry for a disposable server:

1. Open the terminal and confirm the host and username in its header.
2. Run `printf 'hello\n'`, then an interactive tool such as `top`.
3. Resize the window and verify the remote terminal size using `stty size`.
4. Disconnect, reconnect, and close the window; verify the remote session ends.
5. Try an incorrect password and an unknown or changed host key. Both must fail
   with a readable error; neither should disclose credentials.
6. Confirm a USER account cannot open the terminal route or obtain a `server-ssh`
   ticket. Confirm a consumed ticket cannot open another connection.

## File uploads and downloads

While connected, choose **Files > Upload file** or **Files > Download file**.
Uploads require a local file and an existing remote destination directory.
Downloads require the remote path of a regular file. Relative paths start in the
SFTP home directory, independently of the terminal's current directory; use an
absolute path when in doubt. Paths are passed to SFTP and never executed as shell
commands. The stored SSH account must have permission to read or write the path,
and the remote server must enable its SFTP subsystem. Transfers do not use `sudo`.

One transfer can run per terminal connection. Each file is limited to 100 MiB;
uploads have a cumulative 300 MiB session limit, including partial transfers.
Existing files are never overwritten. Uploaded files are created with owner-only
read/write permissions, subject to the remote server's permission handling.
Folders must be compressed into a ZIP first. The progress bar and **Files >
Cancel transfer** stop an in-flight transfer without closing the terminal.

Downloads use the browser's configured save location. The completion notification
also offers **Save file** for 60 seconds if automatic saving was blocked. Download
contents stay in browser memory until completion or interruption. Cancelled
uploads attempt to remove the partial remote file; a lost connection or a failed
cleanup can leave it behind. Check the destination before retrying. Disconnecting
ends active transfers, and reconnecting starts a new shell and a new upload budget.

Deploy both frontend and backend changes together, then reconnect. No additional
HTTP routes, proxy configuration, or credentials are required. Transfer errors,
such as a missing path, permission denial, or disabled SFTP, leave the shell open.

For manual verification, upload a disposable file, download it back, and compare
its contents. Repeat with an empty file and a file larger than one chunk. Check
existing filename rejection, invalid paths, directory downloads, cancellation,
and disconnect during upload. Confirm the terminal still accepts commands after
a transfer fails, and check both English and Indonesian controls.

## Two-pane SFTP file browser

Administrators can select **Open file browser** from an SSH or SFTP inventory
entry, or **Files > Open file browser** inside an SSH terminal. The standalone
route is `/servers/:serverId/files`. It uses the same administrator-only
`server-ssh` ticket, stored credentials, and host-key review, and connects without
starting a remote shell. SSH and SFTP entries both require a saved username and
password. SFTP credentials are shown in the inventory entry form.

The fullscreen browser has local files on the left and the remote directory on
the right. Choose local files or a folder first. Browser folder selection grants
access only to the selected files and their virtual folder tree; it does not
expose the rest of your computer or empty folders. Local files stay on your
computer until you upload them. Downloads use the browser's save location.

Both panes offer breadcrumbs, back/forward and parent-folder navigation, filename
filters, hidden-file visibility, and sortable name, modified date, size, and kind
columns. Remote entries also show permissions in octal. Select a folder and use
**Open folder**, double-click it, or press Enter to enter it. Select a local file
and **Upload file** to send it to the current remote folder; select a remote file
and **Download file** to save it. File double-click/Enter also starts its transfer.
Symlinks are labeled as links; opening a link attempts directory navigation, while
downloading follows it only if its target is a regular file.

Remote navigation and transfers run one operation at a time. Directory listings
show at most 1,000 entries, with a visible notice when truncated. Filters and
sorting apply to the loaded entries. Upload completion refreshes the current
remote folder. Browsing does not rename or delete remote files. All existing
transfer limits, permissions, cancellation, and no-overwrite behavior still apply.
Closing the standalone browser returns to inventory and disconnects; returning to
the terminal from its browser keeps that SSH session open. The file-browser route
shares the existing remote-session screen-lock exemption.

Manual browser checks: choose a disposable folder containing nested files,
navigate both panes, sort/filter and toggle hidden entries, upload to the current
remote folder, download back and compare contents. Check keyboard activation,
empty folders, invalid paths, symlinks, truncated listings, desktop/mobile layout,
and both languages. Verify wrong-password errors and host-key approval are
visible, and that reconnecting after a remote disconnect works.

## Confirming disconnects and leaving

SSH and standalone SFTP sessions show **Stay connected** and **Disconnect**
before a manual disconnect, or **Disconnect and leave** when returning to
inventory. Cancelling leaves the connection and transfers running. Already
disconnected sessions return immediately. Closing the file browser to return
to its SSH terminal keeps the connection open and does not require confirmation.

While connecting or connected, closing/reloading the tab or entering another
address requests the browser's standard leave-page warning. Browsers control the
wording, require prior interaction with the session page, and may suppress this
warning in some situations, including mobile lifecycle events. This warning does
not lock the address bar. In-app exit controls use the custom confirmation;
same-document browser history traversal is not intercepted.

Manual checks: decline and accept Disconnect and Back to inventory in SSH and
SFTP; check SFTP Escape/back confirms exit and keeps focus in the nested dialog.
Verify returning from the browser to SSH stays connected, and tab close/reload
shows the native warning after interacting with the page. Confirm no warning
remains after disconnection.
