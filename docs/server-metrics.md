# SSH server metrics

Administrators can open **Server Metrics** in the sidebar (`/dashboard/server-metrics`) to monitor saved Linux SSH
entries. The matching backend exposes `GET /api/servers/{id}/metrics`, restricted
to `ADMIN`. It uses the stored credentials; passwords never enter the metrics
response. No agent, database migration, or additional dependency is required.

## Setup

1. Deploy the matching frontend and Java backend changes.
2. Save a Linux server as an SSH inventory entry with a username and password.
3. Ensure the backend can reach its SSH port (22 unless configured otherwise).
4. Use **Open terminal** to review and approve an unknown host key. Metrics use
   the same `SSH_KNOWN_HOSTS` / `app.ssh.known-hosts` configuration and reject
   unknown or changed keys. See [browser SSH setup](browser-ssh.md).
5. Open **Server Metrics**. No terminal needs to remain connected.

The account needs a POSIX shell, `awk`, `cat`, `df`, `sleep`, `uname`, and read
access to `/proc/stat`, `/proc/meminfo`, `/proc/uptime`, `/proc/net/dev`, and
`/sys/block/*/stat`. No `sudo` is used. Restricted SFTP-only accounts, Windows,
and non-Linux systems are not supported by this collector.

## Measurements

| Value | Meaning |
| --- | --- |
| CPU | Busy time across all logical cores; idle and I/O wait count as idle. Guest counters are not counted twice. |
| Memory | `MemTotal - MemAvailable`; reclaimable cache is treated as available. |
| Disk | Used and total space on the root filesystem (`df -Pk /`), not all mounted filesystems combined. |
| Network | Receive/transmit byte rates summed across interfaces except loopback; virtual interfaces may double-count forwarded traffic. |
| Disk I/O | Read/write byte rates summed across whole block devices; loop, RAM, device-mapper, and software RAID devices are excluded to reduce double counting. This is throughput, not I/O utilization or latency. |
| Uptime | Time since boot from `/proc/uptime`. |

Each collection opens a short-lived SSH connection and executes a fixed,
read-only command with two samples one second apart. No inventory values are
inserted into the command. Network and I/O rates use the remote uptime interval.
The backend caches success and failure results for five seconds per entry,
invalidates them after inventory updates, and shares concurrent collection for
the same entry. Each backend instance allows eight concurrent collectors and
128 cached entries; inactive cache entries expire lazily after two minutes.
Connect and SSH read timeouts are five seconds; command completion waits at most
ten seconds. Clients waiting for an existing collection wait at most 15 seconds.

The view shows one SSH entry per host, preferring an entry with saved credentials,
and paginates the host list: six hosts on wide screens, four on narrower desktops, and one row on short desktop windows. Pages use normal vertical scrolling; mobile shows six hosts per page. Resizing resets pagination to the first page. Search applies to inventory metadata. Polling occurs
every five seconds while the view is mounted and the browser tab is visible;
collection time and caching can make samples further apart. **Pause updates**
stops new polls; an already-started backend collection may finish. Leaving the
view removes its polling queries. No historical samples or alerts are stored.

Failures display an explicit status without substituting zero measurements.
The collection timestamp remains visible when paused. **Refresh** invalidates
active inventory and metrics queries; it does not bypass the backend cache.

## Host and container detail pages

Server Metrics has one consolidated card per host. Each card combines CPU,
memory, disk, network, I/O and uptime with a compact Docker section showing
engine version, operating system, running/stopped/total containers, and image
count. Paused containers are called out when present. CPU cores and memory
capacity remain with host measurements; they are not duplicated as a separate
Docker server view. A host without Docker keeps its system metrics and an explicit
Docker availability message.

Click a host to navigate to `/dashboard/server-metrics/{serverId}`. The full
page shows its live overview and searchable container grid. Click a container
for `/dashboard/server-metrics/{serverId}/containers/{containerId}`. Both routes
are ADMIN-only, work on direct entry and reload, and provide explicit Back links.
There are no sheets or modals in this monitoring flow.

The workspace uses platform system typography, soft grouped surfaces, comfortable
spacing, and a sticky translucent search toolbar. Contrast/reduced-transparency
preferences make the toolbar opaque. Pages use normal document flow and responsive
card columns rather than viewport-height sheets. Keyboard-visible focus and
localized English/Indonesian messages remain available.

Summaries call `GET /api/servers/{id}/containers/summary`, a lightweight
`docker info` query. Container cards show name, short ID, CPU and memory gauges,
memory usage/limit, image, state, reported uptime/health, network receive/send
totals, and disk read/write totals. Network and disk figures are cumulative byte
totals, not rates. CPU may exceed 100% across cores: the ring caps at 100% while
its displayed value retains the measurement. Missing readings use an em dash.
Stopped containers do not imply live zero usage.

Running containers appear by default. **Include stopped** reveals a separate
section for other states, including paused or restarting containers. Search matches
name, image, full ID and ports locally. Container details show full ID, state,
executable path, image, creation time, networks and IP addresses, published/exposed
ports, and mounts with read/write access. The host terminal shortcut remains
independent. Container lifecycle and interactive shell controls are available to administrators as described below.

Host search, pagination and pause state use URL parameters. Container search and
Include stopped use separate parameters, carried through container-detail links
and Back to host. Back to hosts removes container-only filters. Browser history,
direct links and refresh retain the relevant filters; resizing resets an
incompatible host page to the first page. Page navigation follows the dashboard's
standard scroll-to-top behavior.

The list uses `GET /api/servers/{id}/containers`; individual details use
`GET /api/servers/{id}/containers/{containerId}`. All three endpoints require
ADMIN, use saved SSH credentials and known-host verification, and return
`Cache-Control: no-store`. Container IDs must be full 64-character lowercase
hexadecimal IDs before they can be included in a fixed inspect command. Inspect
requests select an explicit field list; environment variables, command arguments,
labels, and unfiltered inspect output are not returned.

The remote account needs Docker CLI on its noninteractive shell PATH and existing
access to `unix:///var/run/docker.sock`. The collector pins that local socket,
ignoring Docker contexts that may point elsewhere. Rootless/custom sockets,
other Portainer environments, and other Docker Swarm nodes are not aggregated.
Locally managed Portainer containers are included without Portainer credentials.
No permissions are changed, and no sudo or container mutations are performed.

A fixed `docker ps --all --no-trunc` command provides the list; a separate
`docker stats --no-stream --no-trunc` provides running-container usage. A stats
command failure leaves the list available with a warning. Docker missing,
unreachable/permission-denied Docker, deleted containers, SSH failures, and
oversized output have explicit statuses. Lists are limited to 500 containers;
each collection is capped at 1 MiB of output. Summary/list/detail caches each
have a five-second TTL, 128 slots, 15-second lock wait, two-minute lazy eviction,
and inventory revision invalidation. They share eight concurrent SSH collectors.

Summaries and host metrics poll for the visible hosts or active host detail page.
The host grid polls the list/stats collector. Container details poll both inspect
data and `/containers/{containerId}/stats`, which samples only that container.
All polling respects pause and browser visibility. Manual refresh may request one
update while paused; the backend cache still applies. In-flight work can finish
after navigating away. No historical data is stored.

## Manual validation

- Open Metrics as an administrator and compare CPU, memory, and root filesystem
  space with the same host's system tools. Compare rates over equivalent intervals.
- Verify collection timestamps advance, Pause stops updates after in-flight work
  completes, and Resume restarts them. Navigate back to Inventory and confirm polls
  stop. Repeat with the browser tab hidden.
- Search for a host and for a nonexistent value; check empty results and paging.
- Verify desktop/mobile layouts and English/Indonesian labels.
- Verify an unknown/changed host key, incorrect credentials, unreachable server,
  and a non-Linux SSH host produce readable statuses and no fake measurements.
- Confirm unauthenticated requests return 401 and USER requests return 403 from
  the metrics endpoint; metadata access remains available to USER accounts.

- Open a host with Docker and verify running/total counts, images, ports, health,
  CPU, and memory against `docker ps -a` and `docker stats --no-stream`.
- Toggle Include stopped, search by name/image/ID/port, and verify no-match and
  empty-Docker states. Stopped containers should show no live resource usage.
- Open host/container detail pages with pointer and keyboard; verify the terminal shortcut
  stays independent. Check responsive pages in both locales.
- Verify container polling stops when leaving its page, paused, or hidden; manual refresh
  remains available while paused. Check missing Docker, socket permissions, and
  list-without-stats failures without changing remote permissions.
- Confirm the container endpoint returns 401 without authentication and 403 for USER.

- Compare summary fields against `docker info` and selected-container fields
  against `docker inspect` without exposing environment variables or arguments.
- Verify detail-to-host Back retains search and Include stopped, and direct links
  and reload work for both routes. Remove a container outside the app and verify the explicit
  unavailable-detail state. Confirm there are no container management controls.

## Container controls and terminal

The detail action group visibly separates **Container shell** from the page-level
**Host SSH** action. Restart has a distinct icon and label; Refresh remains a
separate icon. All controls have localized accessible names and tooltips.

`POST /api/servers/{id}/containers/{containerId}/{action}` accepts only `start`,
`stop`, or `restart`. The request requires ADMIN and existing SSH credentials.
The backend checks a fresh Docker state: start accepts created/exited, while
stop/restart require running. Stop and Restart require confirmation identifying
the container and host; their Docker shutdown timeout is 10 seconds. Actions are
not cached or automatically retried. At most two mutations run alongside the
shared collector limit, with a 35-second SSH read timeout. Results invalidate the
host summary, list, inspect, and selected-container stats caches. Errors and
timeouts trigger a refresh; a failed response does not imply unchanged state.
Operation logs record actor, server/container IDs, action, and result.

**Container shell** opens `/servers/{serverId}/containers/{containerId}/terminal`
in a separate tab. The page checks the selected container, then uses a single-use
ADMIN `server-ssh` ticket at **`/api/servers/container-terminal`**. The connect
message requires `mode: "container"`, a full 64-character lowercase container ID,
and `shell: "sh"` or `"bash"`. The backend runs a fixed `docker exec -it` command
against the standard local Docker socket with the image's configured user. It
does not request a privileged or root override. Shells/images without the selected
executable, stopped containers, and Docker permission errors end explicitly.
There is no fallback to a host shell and host file transfers are disabled.
Terminal output/input, resize, host-key approval, heartbeats, disconnect, capacity
limits, and cleanup reuse the existing SSH terminal implementation.

For separately hosted WebSockets, set `VITE_SERVER_CONTAINER_WS_URL` to a URL ending
with `/container-terminal`. If only `VITE_SERVER_SSH_WS_URL` is configured and ends
in `/terminal`, the client derives the sibling `/container-terminal` endpoint.
Other override paths are rejected. Deploy the matching backend: older backends
should fail the new endpoint rather than interpreting container mode as host SSH.

Manual validation: use a disposable container to start, stop, restart, check
invalid-state and malformed input rejection, and verify sh/bash input/output.
Verify Stop/Restart cancel sends no POST, pending actions disable duplicates,
stopped containers show no live usage, and selected stats keep updating until
paused/hidden or leaving the page. Verify unauthenticated/USER requests cannot
mutate or obtain terminal tickets; ticketless WebSocket handshakes must fail.

## Container operating system

Container details include `operatingSystem`, taken from `PRETTY_NAME` in the
container’s `/etc/os-release` (falling back to `/usr/lib/os-release`) using a
fixed Docker exec command with the configured container user. Release contents
are parsed as data and never sourced as shell code. No benchmark scripts are
downloaded or executed. Stopped containers, images without `cat` or release
metadata, and denied exec access return null without hiding inspect details.
This is the container distribution, not the host operating system or kernel.
Deploy the matching backend to populate the frontend Operating system row.

## Container software detection

Container detail responses include nullable `installedSoftware`: an array of
common command names found on the configured container user's PATH. A fixed
`sh` script checks curl, wget, git, bash, python3, python, node, npm, java, php,
ruby, go, nginx, apache2, httpd, psql, mysql, redis-cli, and sqlite3 using
`command -v`. It does not launch those programs, install packages, or download
scripts. This is a curated tool check, not a full package inventory or version
report. An empty array means no checked tools were found; null means detection
was unavailable (including stopped containers or missing sh). Existing detail
polling and caching apply. Deploy the matching backend to populate the section.

## Live container logs

Container details automatically start streaming when opened and offer pause/resume controls. The read-only
`/api/servers/container-logs` WebSocket consumes a single-use ADMIN `server-ssh`
ticket and accepts only `connect` with `mode: "logs"`, server/container IDs,
and heartbeat `ping`. Container IDs retain full hexadecimal validation. Input,
resize, file operations, and terminal modes are rejected on this endpoint.
The fixed command uses the local Docker socket and `docker logs --follow
--timestamps --tail 200`; stdout and stderr are combined without a PTY.
Existing SSH credentials, known-host checks, capacity limits, and cleanup apply.
Unknown keys must first be reviewed through Host SSH; logs cannot approve keys.
No log archive is stored by the application.

The browser batches output every 150 ms, retains at most 200,000 characters,
and renders logs as plain text. Follow logs controls scrolling; Clear clears the
visible buffer. Pause stream, page-level pause, hiding the tab, and navigation
close the connection. Resume reloads the latest tail rather than promising
lossless delivery across disconnects. Ended/failed streams require a manual
restart. Unsupported Docker logging drivers surface an error. Existing container
or SSH WebSocket overrides derive the sibling `/container-logs` URL; proxies
must forward that endpoint too. Deploy/restart the matching backend.

Manual validation: stream a container writing stdout/stderr, verify timestamps
and new output, pause/resume, clear, disable Follow logs and scroll, hide the tab,
and navigate away. Verify stopped containers and unsupported logging drivers,
unknown/changed host keys, network failures, and buffer truncation. Confirm that
USER/ticketless requests fail and log sockets reject input/file/terminal commands.

## On-demand cleanup inspection

The host header has a compact Cleanup button. Its dialog requests ADMIN-only
`GET /api/servers/{id}/cleanup`, with `Cache-Control: no-store`. The backend uses
saved SSH credentials, known-host verification, and the existing bounded collector
pool/cache (five-second TTL). No background inspection polling occurs.

Fixed probes read root filesystem usage, the system-journal usage visible to the
SSH account, and Docker storage using the standard local socket. Journal and
Docker probes require `timeout`; their command limits are 5 seconds for journal,
5 seconds for Docker connectivity, and 12 seconds for Docker disk usage. Missing
tools, access failures, unsupported probes, and timeouts leave those values
unavailable rather than zero. The SSH read timeout is 30 seconds and the existing
1 MiB output cap applies. No sudo, file deletion, pruning, or downloads occur.

Docker's category sizes and reclaimable values retain their reported human units
and estimates; they are not summed or advertised as guaranteed savings. Counts
show active versus total resources. See [Docker system df](https://docs.docker.com/reference/cli/docker/system/df/).
Each report row offers Copy command with a command preview on hover or keyboard
focus. These are read-only inspection commands. Open Host SSH opens the existing
terminal in a separate tab; no command is
pre-filled or executed automatically. Deploy/restart the matching backend.

Manually verify Docker and journal available/unavailable cases, a host without
Docker or timeout, SSH failures, zero versus unknown sizes, dialog close during
collection, Refresh, and opening the correct host terminal. Unauthenticated and
USER requests must fail. The collector must never invoke prune or remove commands.
