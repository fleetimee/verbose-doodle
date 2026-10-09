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
