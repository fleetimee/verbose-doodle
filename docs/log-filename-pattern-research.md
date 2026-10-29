# Log filename convention research

Researched 2026-10-29 against framework documentation and first-party source.
This is a convention inventory and implementation guidance, not a guarantee
that every filename below is currently supported by the viewer. Filenames are
user-configurable; no finite detector can infer every custom convention.

## Documented conventions

| Producer | Documented convention and representative filename | Implication |
| --- | --- | --- |
| Logback | Date token can be placed inside a name; size-and-time policies add an increasing integer: `mylog-2026-10-29.0.txt`, `mylog-2026-10-29.1.txt`. Hour/minute patterns and date folders are supported. | A rotation index is a separate component, not part of the stream. |
| Spring Boot / Logback | Default archive pattern is `${LOG_FILE}.%d{yyyy-MM-dd}.%i.gz`, yielding names such as `spring.log.2026-10-29.0.gz`. | Common archives are compressed even when the active file is plain text. |
| Log4j 2 | Official example `app.%d{yyyy-MM-dd}.%i.log`; integer formatting can be zero padded, such as `%03i`. | The user's `api-hrmis.2026-10-19.1.log` fits this naming family. |
| Python timed rotation | Date/time is appended to the original name using `%Y-%m-%d_%H-%M-%S` or a leading portion: `app.log.2026-10-29`, `app.log.2026-10-29_14-30-00`. | Support suffix dates and hour/minute/second precision. |
| Python size rotation | Active `app.log`, archives `app.log.1`, `app.log.2`. | These names have no filename date. Index `.1` is the newest archive. |
| logrotate | `dateext` defaults to `-%Y%m%d`, or `-%Y%m%d%H` for hourly rotation: `access.log-20261029`. `extension` / `addextension` can move the extension to the end, e.g. `access.1.log`. | Support date after an extension and index before or after it. Filename date can mean rollover date rather than event date. |
| Serilog file sink | Daily rolling appends a compact date to the stem: `log20261029.txt`. Size rotation adds `_001`, `_002`; both policies can be combined. | Date and stream need not have a separator; preserve zero-padded sequence values. |
| Winston daily rotate | Default name is `winston.log.%DATE%`; documented example uses `application-%DATE%.log` with `YYYY-MM-DD-HH`. Date format and gzip are configurable. | Prefix/suffix dates and hourly files are common. |
| PM2 / pm2-logrotate | Active files commonly use app name, output/error label, and process ID. Rotation source constructs `<stem>__<timestamp>.log`; default timestamp is `YYYY-MM-DD_HH-mm-ss`. | Repeated underscores and full timestamps must remain distinct from stream text. |
| nginx / rsyslog | nginx defaults to an undated `access.log` and delegates renaming to its operator before reopening. rsyslog can construct dynamic paths from configured templates. | These systems do not prescribe a universal dated filename convention. |

Sources for each row:

- [Logback rolling policies](https://logback.qos.ch/manual/appenders-rolling.html)
- [Spring Boot file rotation and property mappings](https://docs.spring.io/spring-boot/reference/features/logging.html#features.logging.file-rotation)
- [Log4j 2 rolling file appenders](https://logging.apache.org/log4j/2.x/manual/appenders/rolling-file.html)
- [Python rotating and timed handlers](https://docs.python.org/3/library/logging.handlers.html)
- [logrotate manual](https://man7.org/linux/man-pages/man8/logrotate.8.html)
- [Serilog file sink](https://github.com/serilog/serilog-sinks-file)
- [Winston daily rotate file](https://github.com/winstonjs/winston-daily-rotate-file)
- [PM2 log management](https://pm2.keymetrics.io/docs/usage/log-management/), [pm2-logrotate configuration](https://github.com/keymetrics/pm2-logrotate), and [filename construction source](https://github.com/keymetrics/pm2-logrotate/blob/master/app.js)
- [nginx access log configuration](https://nginx.org/en/docs/http/ngx_http_log_module.html), [nginx rotation procedure](https://nginx.org/en/docs/control.html#logs), and [rsyslog filename templates](https://docs.rsyslog.com/doc/configuration/templates.html#templates-for-dynamic-file-names)

## Ordering must be explicit

A numeric suffix does not always mean the same chronology. Logback size-and-time
archives increase the index within each period. Log4j 2's default `max` strategy
also assigns higher indexes to newer files, but its `min` strategy makes the
lowest index newest. Python size rotation renames `.1` to `.2`, making `.1` the
newest archive. These are documented behaviors, not distinctions recoverable
from a lone filename. [Logback](https://logback.qos.ch/manual/appenders-rolling.html),
[Log4j 2](https://logging.apache.org/log4j/2.x/manual/appenders/rolling-file.html#incrementing-file-indexes),
[Python](https://docs.python.org/3/library/logging.handlers.html#rotatingfilehandler).

Implementation recommendation: sort by parsed date/time, then numeric rotation
index rather than lexicographic filename (`2` before `10` when increasing).
Allow explicit index direction when supporting both policies. An active,
unnumbered file is not necessarily the earliest file in a numbered set.

## Suggested detection matrix

These are recommendations derived from the documented conventions above.
`{index}` denotes an integer rotation component; `{date}` may include time.
Preserve literal punctuation rather than treating it as a wildcard.

| Family | Examples | Candidate template |
| --- | --- | --- |
| Date first | `29102026_APP.log`, `2026-10-29_app.txt` | `{date}_{stream}.log` / `{date}_{stream}.txt` |
| Date inside | `app.2026-10-29.log`, `app-20261029.log` | `{stream}.{date}.log` / `{stream}-{date}.log` |
| Date after extension | `app.log.2026-10-29`, `access.log-20261029` | `{stream}.log.{date}` / `{stream}.log-{date}` |
| Date plus rotation | `api-hrmis.2026-10-19.1.log`, `app-2026-10-29_002.txt` | `{stream}.{date}.{index}.log` / `{stream}-{date}_{index}.txt` |
| Rotation after extension | `app.2026-10-29.log.2` | `{stream}.{date}.log.{index}` |
| Glued compact date | `log20261029.txt`, `log20261029_001.txt` | `{stream}{date}.txt` / `{stream}{date}_{index}.txt` |
| Hourly | `app-2026-10-29-14.log`, `access.log-2026102914` | `{stream}-{date}.log` / `{stream}.log-{date}` |
| Full timestamp | `app.log.2026-10-29_14-30-00`, `api-out__2026-10-29_14-30-00.log` | `{stream}.log.{date}` / `{stream}__{date}.log` |

At minimum preserve existing `ddMMyyyy`, `yyyy-MM-dd`, and `yyyyMMdd` date modes.
Useful additional modes are `yyyy-MM-dd-HH`, `yyyyMMddHH`, and
`yyyy-MM-dd_HH[-mm[-ss]]`. Formats without a full year/month/day cannot reliably
satisfy the viewer's day-range filtering. Ambiguous dates, such as `01-02-2026`,
need a selected format rather than silently guessing day-first or month-first.

## Separate names from readable data

Compression suffixes cannot be handled by filename matching alone. Log4j 2
supports several compression formats, while Logback, Winston, PM2, and logrotate
also support compression. A compressed byte offset is not a decoded text offset;
recognize such names only when the reader has matching decompression and paging
support, otherwise explain why they cannot be opened.
[Log4j 2 compression](https://logging.apache.org/log4j/2.x/manual/appenders/rolling-file.html#compressing-archived-files).

Undated active files, index-only archives, date-only filenames without a stream,
and nested directory conventions need explicit semantics: where the date and
stream come from, whether date filters apply, and how a mutable active file
relates to archives. Do not assign today's date to every undated archive or use
modification time as if it were the date of its log events.
