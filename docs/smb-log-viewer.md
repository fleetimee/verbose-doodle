# SMB and SFTP log viewer

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

## Linux / Unix sources through SFTP

Choose **SFTP / SSH** in **Add source**, or select an SSH/SFTP Server Inventory
entry. Use the SSH host and port (usually `22`), username, password, and an
absolute base folder such as `/var/log/myapp`. Share and Domain apply only to SMB.
Inventory passwords can be reused without exposing them to the browser.

SFTP must be enabled on the server, and the account needs read access to the log
files and permission to list/traverse their folders. No mount or remote shell
command is used. Password authentication is supported; private-key login is not
part of this source form.

Before connecting, trust the server's SSH host key through the existing Server
Inventory terminal or file browser, or provision it in the backend's
`app.ssh.known-hosts` file. Unknown and changed keys are rejected.

**Browse folders** works before saving: open `/`, navigate into folders, move to
the parent, refresh, or enter an absolute path. Layout detection and **Use these
settings** work for the same dated filenames and flat/month/year-month layouts
as SMB. Browsing is read-only and skips symbolic links and special files. Select
**Check connection**, then **Save source** after reviewing the detected settings.

Existing sources and requests without `protocol` remain SMB. New requests and
responses include `protocol: "SMB" | "SFTP"` and `dateFormat`. Deploy the backend with the frontend;
Hibernate adds nullable `log_sources.protocol`, `log_sources.date_format`, and
`log_sources.rotation_order` columns;
old null values are interpreted as SMB, `ddMMyyyy`, and automatic rotation order.

SFTP follows appended bytes and detects truncation or a missing current file.
The SFTP attributes do not provide a stable file identity: replacing a file with
one of equal or greater size at the same path may require **Jump to latest**.

## Browse and detect source settings

In **Add source** or **Configure source**, enter the host, port, share, and
credentials first, then select **Browse folders**. New sources can be browsed
before entering a name, filename pattern, or timezone. Existing saved credentials
can be reused only when the connection details are unchanged; otherwise enter the
password again.

The browser opens in a dialog above the source form. Navigate through clickable
breadcrumbs, use Back/Forward history, open the root or parent, refresh, or enter
a folder path (relative for SMB, absolute for SFTP). Search filters the listed
folder/file names in the current folder; it does not recursively search the
server or search file contents. Detection continues to inspect the current
folder regardless of the name filter. Moving to another folder clears search.
Closing the browser retains the source draft, and **Use these settings** fills
the draft and closes the browser without saving the source. The browser shows folders and file metadata without opening or
changing log contents. Detection checks the selected folder and nearby numeric
year/month folders for dated `.log` or `.txt` files. Supported filename dates are `ddMMyyyy`,
`yyyy-MM-dd`, and `yyyyMMdd`, plus the additional formats listed below, before,
after, or attached to the stream name. For example,
`29102026_APP.log`, `api-request.log.2026-10-29`, and `app-20261029.log`. It offers flat, `MM`, or `yyyy/MM` configurations with matching
sample filenames and stream names. Selecting a year or month folder can also
suggest its log-root parent automatically.

**Use these settings** fills the base folder, folder layout, filename pattern,
and filename date format.
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

`{date}` matches the selected filename date/time format. Existing sources
default to `ddMMyyyy`. `{stream}`
matches the log type and may contain letters, digits, spaces, dots, underscores,
and hyphens.

For Linux-style rolling logs such as `api-request.log.2026-10-29`, detection
suggests `{stream}.log.{date}` with date format `yyyy-MM-dd`; files such as
`api-response.log.2026-10-29` become a separate stream under the same settings.
For `api-request-2026-10-29.log`, it suggests `{stream}-{date}.log`. Invalid dates
are ignored. Detection is derived from filenames, not log contents. Undated files use file modification dates, and numbered files use `{index}` as
described below. Compressed archives are listed but not readable.
For JavaCMSInterface, `MSG_` is removed from the display name, giving APP, TRC,
SIG, VA, XLINK, CBS_SY, and CBS_KO. Daily files are ordered by filename date and
joined virtually; remote files are never modified.

## Additional filename conventions

Detection and reading share the same parser for SMB and SFTP. The parser derives
settings from filename structure rather than guessing from a product name.
See [official-source research](log-filename-pattern-research.md) for framework
examples and ordering caveats.

| Example | Detected template | Date format |
| --- | --- | --- |
| `log-2026-10-09.php` | `{stream}-{date}.php` | `yyyy-MM-dd` |
| `api-hrmis.2026-10-19.1.log` | `{stream}.{date}.{index}.log` | `yyyy-MM-dd` |
| `app-2026-10-29_002.txt` | `{stream}-{date}_{index}.txt` | `yyyy-MM-dd` |
| `app.2026-10-29.log.10` | `{stream}.{date}.log.{index}` | `yyyy-MM-dd` |
| `app.log.2026-10-29.1` | `{stream}.log.{date}.{index}` | `yyyy-MM-dd` |
| `app.1.2026-10-29.log` | `{stream}.{index}.{date}.log` | `yyyy-MM-dd` |
| `app20261029_001.log` | `{stream}{date}_{index}.log` | `yyyyMMdd` |
| `api-out__2026-10-29_14-30-00.log` | `{stream}__{date}.log` | `yyyy-MM-dd_HH-mm-ss` |
| `app.log.2026-10-29_14` | `{stream}.log.{date}` | `yyyy-MM-dd_HH` |
| `access.log-2026102914` | `{stream}.log-{date}` | `yyyyMMddHH` |
| `messages-20261029` | `{stream}-{date}` | `yyyyMMdd` |
| `2026-10-29.2.log` | `{date}.{index}.log` | `yyyy-MM-dd`; stream `LOG` |
| `app.log.1` | `{stream}.log.{index}` | File modification date |
| `app.2.log` | `{stream}.{index}.log` | File modification date |
| `app.log` | `{stream}.log` | File modification date |
| `syslog.1` | `syslog.{index}` | File modification date; stream `LOG` |

The usual `.log`, `.txt`, `.out`, `.json`, `.jsonl`, `.ndjson`, and `.php` extensions are
recognized. PHP log files are read as plain text; no PHP code is executed.
Extensionless dated files and the conventional undated system names
`syslog`, `messages`, `secure`, `maillog`, `kern`, and `auth` are also detected.
A literal filename may be entered manually. Each of `{date}`, `{stream}`, and
`{index}` may appear at most once; names without `{stream}` use one `LOG` stream.
Each detected layout covers its exact literal punctuation and token positions;
active and archive names with different structures require separate settings.

Date formats include `ddMMyyyy`, `yyyyMMdd`, `yyyy-MM-dd`, `yyyy_MM_dd`,
`yyyy.MM.dd`, `dd-MM-yyyy`, `MM-dd-yyyy`, `dd.MM.yyyy`, and English `dd-MMM-yyyy`.
Time-bearing choices are `yyyy-MM-dd_HH`, `yyyy-MM-dd-HH`,
`yyyy-MM-dd_HH-mm`, `yyyy-MM-dd_HH-mm-ss`, `yyyy-MM-dd'T'HH-mm-ss`,
`yyyyMMddHH`, and `yyyyMMddHHmmss`. Dates and times are validated strictly.
Ambiguous day/month orders and hour-versus-index suffixes are offered as separate
candidates. Review the samples and date format; the detector cannot know the
producer's configuration from an ambiguous name.

`{index}` matches up to 18 digits, including zero padding. Files sort by date,
then filename time, then numeric rotation index (`2` before `10` when ascending).
**Rotation index order** can be Automatic, larger indexes newer, or smaller
indexes newer. Automatic assumes ascending for dated names (typical Logback and
Log4j default) and descending for undated numbered backups (typical Python and
logrotate). Set the direction explicitly for another rotation policy.

Without `{date}`, choose **File modification date**. Date filters then select
whole files by the last-modified date in the configured server timezone; they do
not filter individual log-entry timestamps. Copying or touching a file may
change its date classification. Undated archives still sort by their selected
modification date before rotation order.

Compressed `.gz`, `.zip`, `.bz2`, `.xz`, `.zst`, `.zstd`, and `.lz4` archives are
counted with a notice and are excluded from detection and reading. Their byte
offsets cannot be paged as uncompressed text. Missing-year dates, custom tokens,
and arbitrary producer-specific filename rules are not inferred automatically;
this is a documented set of common conventions, not universal filename support.

## Reading and following

The initial view reads the latest chunk from the newest nonempty file in the
selected stream and date range. Empty trailing files are skipped until they
receive content; following continues across them as new data arrives. Each
file’s filename and date stay visible in a sticky header while its content is
on screen. **Load older** or scrolling to the top
loads earlier chunks and then previous daily files. A status strip at the top
of the log viewport shows when older history is loading, while the loaded
content and scroll position are retained. **Jump to latest** returns to
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

### Finding text in loaded logs

The compact log toolbar includes a case-insensitive literal search, current/total match count, previous/next buttons, and clear action. Enter advances to the next match; Shift+Enter goes back; Escape clears the query. Search pauses live following. Turning Live back on or jumping to the latest logs clears search. Load older to extend the searchable buffer; search does not query unloaded server files.

Highlights preserve the existing ISO syntax spans and can cross adjacent chunks of the same file. They do not cross file boundaries. Navigation is limited to the first 2,000 matches. Modern browsers use the CSS Custom Highlight API; older browsers show an availability hint. The stylesheet optimizer may warn about the standard `::highlight()` selector; production output retains those rules.

### Fullscreen viewing

The toolbar's **Open source in new tab** action opens a dedicated
`/logs/{sourceId}` page without dashboard navigation. It preserves the selected
source, stream, and date range. Stream and date changes update that tab's URL,
so refreshing or bookmarking it restores the same view. An empty end date
continues to follow today. Source changes navigate within the dedicated tab;
they do not change the source selected in other open viewers. **Back to
workspace** returns to the dashboard log viewer. The dedicated page requires
the same administrator access as the dashboard. Deleted or unknown sources
show an unavailable state rather than opening a different source.

The log toolbar fullscreen button expands the viewer panel using browser fullscreen, hiding the source settings and dashboard chrome. Stream tabs, search, wrapping, font size, and live controls remain available. The exit button or Escape restores the normal view and source settings. The viewer remains mounted so the log buffer, stream selection, and search are retained. Fullscreen is disabled when unsupported by the browser.
