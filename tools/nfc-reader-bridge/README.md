# NFC reader bridge

The bridge is a local Bun CLI for the NFC Reader Inspector. It binds to loopback, exposes a versioned WebSocket health and scan contract, and reports PC/SC/ACS reader state without sending scan data through the remote backend.

## Run

Set a local token and allow the origin serving the frontend:

```sh
export NFC_BRIDGE_TOKEN='choose-a-local-token'
export NFC_BRIDGE_ALLOWED_ORIGINS='http://localhost:5173,http://127.0.0.1:5173'
bun run nfc-bridge start
bun run nfc-bridge status
bun run nfc-bridge stop
```

The browser tool uses `VITE_NFC_READER_BRIDGE_URL` (default `ws://127.0.0.1:7788/ws`) and `VITE_NFC_READER_BRIDGE_TOKEN` for the same token.

The `@pokusew/pcsclite` optional dependency is a native PC/SC binding. On a fresh Bun install, approve its `node-gyp rebuild` lifecycle script with `bun pm trust`, then install the platform PC/SC service/driver. The bridge reports a typed actionable `pcsc-unavailable` state when that prerequisite is missing.

Because Bun cannot safely load this native addon on every runtime, the bridge keeps the addon in a small Node PC/SC worker. Set `NFC_BRIDGE_PCSC_HELPER` when running a compiled binary from outside the repository; source runs resolve `tools/nfc-reader-bridge/pcsc-node-helper.cjs` automatically.

When an ACS reader reports a tag-present event, the bridge reads the UID and NDEF message through PC/SC APDUs, decodes NDEF Text Records when available, and emits the raw NDEF bytes as stable uppercase hexadecimal. Type 2 memory reads and ISO 14443-4 Type 4 NDEF files are supported by the initial scan adapter; unsupported or malformed data remains visible as a raw scan warning.
