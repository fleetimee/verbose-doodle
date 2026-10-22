# SMB log viewer

Administrators can open **Workspace → Log viewer** at `/dashboard/logs`.
Each source has its own host, port, share, credentials, and path settings, so
additional Windows servers can be added independently.

## JavaCMSInterface pilot

The pilot source uses these settings:

| Setting | Value |
| --- | --- |
| Name | JavaCMSInterface |
| Host | 192.168.4.45 |
| Port | 445 |
| Share | C$ |
| Base folder | Simulator/EChannelInterface/JavaCMSInterface/log |
| Folder layout | yyyy/MM |
| Filename pattern | {date}_{stream}.log |
| Encoding | UTF-8 |
| Server timezone | Asia/Jakarta |

Credentials are entered in the source form and are never returned by the source
metadata interface. An empty password during an edit preserves the saved password.
Use an SMB account with read access to the configured share and folder.

The backend must be able to reach the server's SMB port. No operating-system SMB
mount is required. The browser communicates only with the authenticated backend.

## Browse and detect source settings

In **Add source** or **Configure source**, enter the host, port, share, and
credentials first, then select **Browse folders**. New sources can be browsed
before entering a name, filename pattern, or timezone. Existing saved credentials
can be reused only when the connection details are unchanged; otherwise enter the
password again.

Navigate folders, open the share root, move to the parent, or enter a relative
folder path. The browser shows folders and file metadata without opening or
changing log contents. Detection checks the selected folder and nearby numeric
year/month folders for valid `ddMMyyyy_TYPE.log` or `.txt` files (underscore or
hyphen separator). It offers flat, `MM`, or `yyyy/MM` configurations with matching
sample filenames and stream names. Selecting a year or month folder can also
suggest its log-root parent automatically.

**Use these settings** fills the base folder, folder layout, and filename pattern.
It also suggests a source name from the folder when the name is empty. Encoding
and timezone remain unchanged for manual review. Nothing is persisted until
**Save source** is selected.

Each request inspects at most 24 directories and 2000 entries per directory,
returns at most 500 entries for navigation, and limits automatic scanning to
recent date folders with an eight-second scan budget (individual SMB operations
also have connection/read timeouts). Access-restricted descendants are skipped;
a failure to open the requested folder is shown as an error. Partial results are
identified in the browser. Enter a more specific path to inspect omitted folders.

## Folder layouts

- **Year / month:** base `.../log`, layout `yyyy/MM` → `.../log/2026/10`.
- **Month only:** base `.../log/2026`, layout `MM` → `.../log/2026/10`.
- **No date folders:** base `.../log`, empty layout → files directly under `.../log`.

Use paths relative to the share, without a drive letter or UNC host prefix.
A missing date folder is skipped. A missing base folder, failed connection, or
permission failure is an error. Discovery visits only date folders within the
selected range; it does not recursively crawl the share.

`{date}` matches a strict `ddMMyyyy` filename date. `{stream}` matches the log type.
For JavaCMSInterface, `MSG_` is removed from the display name, giving APP, TRC,
SIG, VA, XLINK, CBS_SY, and CBS_KO. Daily files are ordered by filename date and
joined virtually; the Windows files are never modified.

## Reading and following

The initial view reads the latest chunk. **Load older** or scrolling to the top
loads earlier chunks and then previous daily files. **Jump to latest** returns to
the newest file. **Follow new entries** checks for appended bytes every three
seconds while the page is visible. Scrolling away from the bottom pauses follow.

Choose a start date and optionally an end date. The initial start is 30 days ago.
Leaving the end empty follows the current day in the configured server timezone,
including month and year transitions. Each request covers at most 366 days.
Stream discovery refreshes every 30 seconds; **Check source** refreshes it manually.

Reads are limited to 64 KiB per request, with at most 32 chunks retained by the
browser. Raw line breaks and multiline content are preserved. Streams are
separate; the viewer does not merge timestamps across different log types.
UTF-8, windows-1252, and ISO-8859-1 are supported. Change encoding if the producer
uses a different supported character set.

File identity and byte offsets are carried in opaque cursors. Replacement,
deletion, or truncation of the current file restarts the view and displays a
notice. Refresh after editing source settings to acquire new cursors. Late writes
to older daily files that the reader has already passed require reloading history.

## Persistence and deployment

Deploy the Java backend and frontend changes together. JPA creates `log_sources`
using the backend's existing `ddl-auto=update` configuration. Source configuration
is persisted in PostgreSQL; log contents remain on Windows.

Passwords use AES-GCM encryption. Set a stable `APP_LOG_VIEWER_CREDENTIAL_KEY` on
the backend for an independent encryption key; when absent, a namespaced key is
derived from the existing JWT secret. Configure the key before saving credentials.
Changing that key (or the JWT secret when using the fallback) requires re-entering
source passwords. Never commit credentials or keys to source control.

All `/api/log-sources` operations require ADMIN, including file reads.
Responses use `Cache-Control: no-store`.

| Method | Path | Purpose |
| --- | --- | --- |
| GET / POST | /api/log-sources | List / create sources |
| POST | /api/log-sources/browse | Browse a draft connection and detect log settings |
| PUT / DELETE | /api/log-sources/{id} | Update / remove source settings |
| POST | /api/log-sources/{id}/check | Check saved connection and discover files |
| GET | /api/log-sources/{id}/files | Discover files and stream names |
| GET | /api/log-sources/{id}/content | Read latest / older / forward chunks |

Discovery accepts optional ISO `from` and `to` dates. Content additionally accepts
`stream`, `direction` (`latest`, `older`, `forward`), and an opaque `cursor`.

### Reusing Server Inventory connections

In the source drawer, choose an optional Server Inventory entry to fill the host and username. SMB entries retain their port; other access types default to SMB port 445. Domain-prefixed usernames are split into domain and username. All connection fields can also be entered manually.

Saved inventory passwords are resolved on the backend for browsing and copied into the encrypted log source when saved; they are never sent to the browser. Entering a password overrides the inventory password. Changing the host, username, or domain clears the inventory credential selection. Later inventory password changes do not update existing log sources automatically; select the entry again and save to refresh it.

### Automatic share discovery

Selecting an inventory server with a saved password automatically enumerates SMB disk shares through the Windows Server Service (SRVSVC over IPC$), then checks which shares accept the connection. A single accessible share is filled automatically; multiple shares are offered in the editable Share name dropdown. Existing share names are preserved. For manually entered credentials, use **Discover shares** after completing the password.

Discovery uses the same backend-only credential resolution as folder browsing. It excludes printer and IPC shares, returns up to 100 accessible shares, and stops checking further shares after an eight-second scan budget (an individual SMB operation can take up to 15 seconds). A partial result is marked and is never auto-selected. If enumeration is restricted, enter a share name manually. Nothing is saved until **Save source**.

Backend share-discovery endpoint: `POST /api/log-sources/shares`, restricted to administrators. The backend must be restarted after installing the new DCE/RPC dependency.

### Error and recovery states

Source-list failures use a full workspace recovery state; catalog failures keep source controls and provide Retry and Configure source actions. Refresh failures preserve cached sources and logs. Error messages distinguish backend/network availability, database storage, Windows login, read permissions, missing shares or paths, and timeouts. The backend returns scoped `LOG_*` response codes and logs technical exceptions server-side. Unexpected failures use a safe generic message.

### ISO message highlighting

Expanded `[MTI]` and numbered field dump lines are highlighted automatically, preserving the exact text and whitespace. Hover field labels for standard field names; bitmap labels list active fields. Amounts use blue, dates amber, account fields purple, identifiers cyan, other values green, and non-`00` response codes red. Field labels and values share their category color in both packed and expanded views; MTIs are amber and bitmaps purple. Profile-specific field meanings may differ.

Timestamped `R`/`S` packed ISO lines highlight the MTI and primary/secondary bitmap. Packed field ranges are colored only when the following expanded dump matches every bitmap field and reconstructs the complete packed body without ambiguity, including variable-length prefixes. Missing, truncated, or incompatible dumps leave the packed body unchanged. No payload content is inserted as HTML.

The Add and Configure source drawers require a successful **Check connection** before enabling **Save source**. The check applies to the exact current settings; changing any setting invalidates it. Submitting the form with Enter follows the same guard.
