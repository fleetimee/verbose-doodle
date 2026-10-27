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
independent. Container lifecycle actions and container exec remain outside scope.

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
Container stats poll only on the host detail page; inspect data polls only on the
container detail page.
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
