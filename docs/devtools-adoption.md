# Developer tool adoption

Reviewed 8 October 2026 against [DevTools](https://www.devtools.tools/), [product scope](../PRODUCT.md), the [developer tool registry](../src/features/developer-tools/catalog.ts), and existing endpoint utilities. These are feature recommendations for Fleetime Labs, not dependency recommendations. Ranking reflects the project's billing and integration workflows.

## Recommended order

| Rank | Tool idea and source | Why adopt it | Initial scope and overlap |
| --- | --- | --- | --- |
| 1 | JSON/text comparison, inspired by [Diff Checker](https://www.devtools.tools/diff-checker) | Compare expected billing responses with captured traffic and find changed amounts, status codes, or missing fields. | Two inputs, text mode, and structured JSON mode with field paths, added/removed/changed values, and an option to ignore object key order. DevTools provides text comparison; structured comparison is our proposed extension. Preserve array order by default. |
| 2 | [HMAC Generator](https://www.devtools.tools/hmac-generator) and hash calculation | Diagnose partner API signature mismatches without moving payloads and secrets to another site. | Start with HMAC-SHA-256, UTF-8 or hex inputs, hex/Base64 output, and expected signature comparison. Show the exact signed bytes. JWT already uses HMAC internally, but there is no general message-signing tool in the registry. Add other algorithms only for actual partner requirements. |
| 3 | [Base64 Toolbox](https://www.devtools.tools/base64) | Inspect encoded payloads and binary protocol data used by QRIS, JWT, and socket integrations. | UTF-8, hex, Base64, and Base64URL conversion with byte length and strict validation. Existing QRIS parsers accept hex/Base64, and number-base conversion handles numeric values. A general byte/text converter fills the gap. Defer image and Data URI features. |
| 4 | cURL import, inspired by [cURL to Code Converter](https://www.devtools.tools/curl-to-code-converter) | Reproduce a request copied from browser developer tools or supplied by a partner with less manual entry. | Import URL, method, repeated headers, and body into the existing endpoint request workspace. Preview before applying. Report unsupported flags and never execute pasted shell commands. Existing [code generation](../src/features/endpoints/utils/code-generator.ts) already exports cURL and several languages; extend that workflow. |
| 5 | [JSONPath Evaluator](https://www.devtools.tools/jsonpath-evaluator) | Extract bill references, nested error messages, and individual response fields from large payloads. | JSON input, expression, matched values and paths, count, and copy output. Keep expression evaluation separate from JavaScript execution. Consider an action from traffic logs after the standalone utility works. |
| 6 | [CSV to JSON](https://www.devtools.tools/csv-to-json) and JSON to CSV | Prepare batches of billing fixtures and inspect tabular partner samples. | Quoted CSV parsing, delimiter selection, headers, preview, and downloads. Keep identifiers and account numbers as strings by default; type inference must be explicit. Traffic logs already export CSV/JSON, so this adds fixture conversion rather than another log exporter. |
| 7 | [HTTP Header Parser](https://www.devtools.tools/http-header-parser) and [URL Parser](https://www.devtools.tools/url-parser) | Explain malformed content types, encoded query values, and mismatched request metadata. | Paste raw headers or a URL, preserve duplicate headers/query parameters, explain common fields, and copy normalized output. Prefer access from request and relay inspection over two unrelated navigation entries. |

The first release should contain comparison, HMAC, and byte encoding. cURL import is the next integration improvement. JSONPath and CSV conversion can follow when users need larger fixtures or deeper payload inspection.

## Existing coverage

The registry already has JSON Schema validation, JWT inspection, JSON/YAML conversion, date conversion, number-base conversion, cron parsing, retry/backoff calculation, schedule overlap checking, ISO 8583 generation/parsing, and QRIS tools. JWT utilities also sign and verify tokens and generate keys. Avoid adding separate JWT signer/validator, timestamp converter, cron parser, or JSON/YAML converter pages.

Biller Simulator already models mock endpoints and response templates. A separate [API Mock Server](https://www.devtools.tools/category/network-api-tools) would duplicate that purpose. An HTTP request builder and code exporter also overlap existing endpoint workflows.

## Defer

- XML/SOAP formatting until an actual biller integration requires it.
- Postman collection import/export until the supported mapping for billers, endpoints, authentication, and environment variables is defined.
- DNS, WHOIS, public IP, and live TLS lookups. These often need external services and are less useful for private office networks than tools tied to the existing server inventory.
- General design, lifestyle, financial calculators, AI playgrounds, and additional games. They do not improve billing integration validation.

## Implementation boundaries

Build equivalent workflows inside Fleetime Labs; the reviewed pages do not establish permission to copy their implementation. Keep conversion and inspection local to the browser. Do not persist raw payloads, signing keys, authorization headers, or imported credentials by default. Use the existing lazy-loaded registry, tool layout, translations, and design tokens. Preserve authentication and role restrictions when adding actions to operational modules.

The source pages establish advertised capabilities. The ranking and proposed scope are recommendations based on the repository's product needs, not measured usage. No feature implementation is included in this review.
