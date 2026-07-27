# NFC reader bridge

The bridge is a local Bun CLI for the NFC Reader Inspector. It binds only to
loopback, exposes a versioned WebSocket contract, and reports PC/SC/ACS reader
state without sending scan data through the remote backend.

## Standalone release binaries

Release builds use Bun's compile target matrix. The output contains the Bun
runtime, so users do not need to install Bun to run a packaged bridge.

```sh
bun run nfc-bridge:build
```

Artifacts are written to `dist/nfc-reader-bridge/`:

| Target | Artifact |
| --- | --- |
| Windows x64 | `nfc-reader-bridge-windows-x64.exe` |
| macOS x64 | `nfc-reader-bridge-macos-x64` |
| macOS arm64 | `nfc-reader-bridge-macos-arm64` |
| Linux x64 | `nfc-reader-bridge-linux-x64` |

Build one target when iterating:

```sh
bun tools/nfc-reader-bridge/release.ts build --target bun-darwin-arm64
```

The release manifest records the artifact target, bridge version, and protocol
version. Runtime smoke checks must run on a host matching the target because a
Windows or foreign-architecture executable cannot be started by the current
host:

```sh
bun run nfc-bridge:smoke
bun tools/nfc-reader-bridge/release.ts smoke --target bun-darwin-arm64
```

The smoke check starts the packaged binary on an ephemeral loopback port,
checks the versioned health response, opens the authenticated WebSocket
endpoint with the expected origin, and terminates the process cleanly. Run the
same command on native Windows x64, macOS x64, macOS arm64, and Linux x64
release hosts to complete the platform matrix.

## Host prerequisites

The binary does not install system services or reader drivers. Before using a
physical reader, install and start the host PC/SC support appropriate to the
operating system:

- Windows x64: enable the Smart Card service and install a compatible ACS
  ACR122U/CCID driver.
- macOS: use the available PC/SC service and install a vendor driver only when
  the connected reader requires one.
- Linux x64: install and start `pcscd`, `pcsc-lite`, the CCID driver, and any
  required udev permissions.

The bridge reports missing PC/SC support, missing readers, unsupported reader
models, reader removal, permission failures, and APDU/NDEF read failures as
actionable reader status messages. A host still needs compatible PC/SC support;
the CLI does not silently install or repair those system prerequisites.

The current native adapter uses a small Node PC/SC worker because the optional
native binding is not safe to load directly in every Bun runtime. Source runs
resolve `tools/nfc-reader-bridge/pcsc-node-helper.cjs`; packaged runs should
set `NFC_BRIDGE_PCSC_HELPER` to the helper path shipped with the release and
must have the host runtime required by that native binding. The bridge remains
usable for version, status, lifecycle, and protocol smoke checks when PC/SC is
unavailable, and it reports that condition instead of failing silently.

## Run from source

Set a local token and allow the origin serving the frontend:

```sh
export NFC_BRIDGE_TOKEN='choose-a-local-token'
export NFC_BRIDGE_ALLOWED_ORIGINS='http://localhost:5173,http://127.0.0.1:5173'
bun run nfc-bridge start
bun run nfc-bridge status
bun run nfc-bridge stop
```

The CLI also supports `version` and `help`. `version` reports both the bridge
release version and the WebSocket protocol version.

The browser tool uses `VITE_NFC_READER_BRIDGE_URL` (default
`ws://127.0.0.1:7788/ws`) and `VITE_NFC_READER_BRIDGE_TOKEN` for the same token.

The bridge defaults to loopback (`127.0.0.1`) and rejects unexpected browser
origins before the WebSocket upgrade. The session token is required for every
WebSocket connection.

When an ACS reader reports a tag-present event, the bridge reads the UID and
NDEF message through PC/SC APDUs, decodes NDEF Text Records when available, and
emits raw NDEF bytes as stable uppercase hexadecimal. Type 2 memory reads and
ISO 14443-4 Type 4 NDEF files are supported by the scan adapter; unsupported or
malformed data remains visible as a raw scan warning.
