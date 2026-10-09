# Browser RDP desktop

Administrators can open an RDP inventory entry and select **Open desktop**.
The desktop opens in a separate browser window. Click its display to send mouse
and keyboard input. The compact menubar groups Session, Desktop, and View actions.
Desktop sends Windows shortcuts for previous/next virtual desktop, Task View,
Show Desktop, Task Manager, and Ctrl+Alt+Delete directly to the remote server.
These actions require a connected session and the corresponding Windows feature;
the app cannot enumerate or rename Windows virtual desktops. Fullscreen and
Disconnect/Reconnect remain available as compact quick controls. Press Shift+Escape to release held keys and return focus to the
connection control. Touch input emulates a mouse.

The entry needs a stored username and password. USER accounts retain read-only
inventory access and cannot open the desktop route or obtain an RDP ticket.
Passwords remain on the backend. The browser sends only the selected entry ID,
viewport dimensions, and a single-use `server-rdp` ticket when connecting.

Before connecting, the app checks for other browser connections using the same
host, port, and Windows account on this backend instance. If one exists, it shows
Cancel and Continue. Continue acknowledges that Windows may disconnect the other
connection. If the active connections change before setup, reconnect to review
again. This check does not detect native RDP clients, hostname aliases, or sessions
on other backend instances. It does not force Windows to disconnect another user.

Closing the window or navigating away disconnects RDP. Reconnect obtains a fresh
ticket and creates a new connection. It does not log off the remote Windows user;
the Windows server controls whether an existing desktop session is resumed.
Established sessions have no fixed backend lifetime limit, with up to eight
connections per backend instance. The frontend lock overlay is disabled on the
desktop route. Closing the page, network failures, remote Windows policies, and
backend restarts can still end the connection. Audio, clipboard, printing, and
file uploads are outside this flow.

## Downloading files

In remote Windows File Explorer, open **This PC > Fleetime Downloads > Download**.
Copy a file into the special **Download** folder to receive it in your browser.
The browser saves it to its configured download location or asks where to save it.
The transfer notification reports bytes received and offers **Save file** for
60 seconds if the browser blocked the automatic download. Allow multiple downloads
for this site when the browser asks. Downloads work over HTTP as well as HTTPS.

Each file is limited to 100 MiB, with up to three simultaneous transfers.
Disconnecting interrupts unfinished transfers; reconnect and copy the file again.
Downloads use a session-specific redirected drive, which is cleaned up after
disconnect. Use **Copy**, rather than **Cut**, to preserve the original file.
Folders must be compressed into a ZIP file first. Copying a file into the drive's
root only stages it; the **Download** folder triggers the browser transfer.

This requires the matching backend changes and Windows policy permitting RDP
drive redirection. If **Fleetime Downloads** does not appear, reconnect after
updating the backend and check the policy and gateway storage permissions.

## Backend setup

Deploy the matching backend implementation with Guacamole 1.6.0. Its production
Compose file includes the `guacd` service on the backend's private Docker network.
The backend uses `GUACD_HOST=guacd` and `GUACD_PORT=4822`. The frontend does not
connect directly to guacd.

For local development, start the gateway from the backend repository:

```bash
mkdir -p /tmp/fleetime-rdp
RDP_DRIVE_UID=$(id -u) RDP_DRIVE_GID=$(id -g) docker compose -f docker-compose.rdp.yml up -d
```

Run the Java backend with its usual PostgreSQL and Redis services. Defaults use
`localhost:4822`. Point the frontend's `VITE_ENDPOINT_URL` at the backend and run
`bun run dev`.

The gateway must reach the Windows server's RDP port. Its network and DNS access
can differ from the browser or Docker host, especially for VPN-only servers.
NLA authentication and certificate verification are enabled. `DOMAIN\username`
and UPN usernames are supported. The backend also needs network access to the
RDP host to inspect its certificate before connecting.

An unapproved certificate opens a confirmation dialog with **Show certificate**,
**Cancel**, and **Continue**. Review the SHA-256 fingerprint, then Continue to
save that exact certificate for the inventory entry. Cancel stops the connection.
Future connections skip the prompt while the certificate matches; a changed
certificate prompts again. Editing the host, port, or access type clears trust.
Operator-configured pins remain authoritative and cannot be replaced here.
See `BROWSER_RDP.md` in the backend repository for configuration and API details.

## Frontend hosting

Vite and the existing Docker nginx proxy forward `/api/servers/desktop` WebSocket
upgrades. The desktop page is lazy loaded at `/servers/:serverId/desktop`.

For Vercel or hosting without a WebSocket proxy, set `VITE_SERVER_RDP_WS_URL` at
build time to the backend's TLS WebSocket endpoint, for example
`wss://backend.example.com/api/servers/desktop`. The backend must allow the
frontend origin in its existing WebSocket configuration. Never include a password
or ticket in the environment variable; the client adds a fresh ticket itself.

The frontend uses the npm-packaged Guacamole JavaScript client 1.5.0 with the
backend's 1.6.0 Guacamole protocol bridge. Supported inputs are keyboard, mouse,
display resizing, acknowledgments, and tunnel heartbeats.

## Manual validation

Using an administrator account and a disposable RDP entry:

1. Open the desktop and check its server name and address. For a new certificate,
   expand Show certificate and verify its fingerprint. Cancel must stop the
   connection. Reconnect and Continue must save approval; reconnecting again
   should skip the prompt. A changed certificate must prompt again.
2. Click the display, type, move the mouse, click, scroll, and drag a window by
   its title bar. Copy a small file into **Fleetime Downloads > Download**, check
   the downloaded filename and contents, and try **Save file** from the toast.
   Check an empty file, a filename with spaces/non-ASCII characters, the 100 MiB
   limit, and disconnecting during a transfer. Confirm folders require a ZIP.
3. Use Desktop > Task View and previous/next desktop with at least two Windows
   virtual desktops. Check Show Desktop, Task Manager, and Ctrl+Alt+Delete.
   Confirm actions affect the remote server and release modifiers afterward.
4. Press Shift+Escape and verify focus returns to the connection control.
5. Resize the window and toggle fullscreen. The display should fit the viewport,
   and supported RDP servers should update their desktop dimensions.
6. Disconnect and reconnect. Confirm a new ticket is acquired.
7. Check bad credentials, an untrusted certificate, an unavailable gateway, and
   an interrupted connection. Each should show a readable recovery message.
8. Verify a USER account cannot open the route or request an RDP ticket.

## References

- [Guacamole JavaScript client](https://guacamole.apache.org/doc/guacamole-common-js/)
- [Guacamole RDP configuration](https://guacamole.apache.org/doc/gug/configuring-guacamole.html#rdp)
