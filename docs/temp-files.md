# Temporary file sharing

Open **Workspace → Temporary Files** (`/dashboard/temp-files`). Authenticated ADMIN and USER accounts can upload files, choose a 1-hour, 24-hour, or 7-day lifetime, copy public download links, and delete their own files. The list contains the signed-in account's active uploads. Files are downloaded as attachments. There is no upload-by-URL operation.

The screen uses the shared `DeveloperToolLayout`, shadcn fields, toggle group, buttons, grouped icon actions, tooltips, progress, dialog, and scroll area. It fills the dashboard workspace; long file lists scroll inside the list panel. File selection supports multiple files, uploaded sequentially with actual transfer progress and cancellation. Cancelling cannot retract a file already received by the backend; refresh the list to inspect it.

## Backend and storage

The backend owns persistence, expiry, quotas, and deletion. Its `TEMP_FILES.md` documents the full contract and environment variables. Default limits are 100 MiB per file, 1 GiB per account, and 100 stored files. The UI reads limits and usage from the backend.

Without Docker, files default to `./data/temp-files` relative to the backend's working directory. Docker uses a persistent named volume mounted at `/data/temp-files`. The link stops working immediately after deletion or expiry. Scheduled cleanup starts 10 seconds after backend startup and then runs every 60 seconds by default, processing up to 100 records per pass. Storage usage includes files waiting for cleanup.

## Deployment

File-transfer routes allow all origins by default. Authentication and file ownership checks still apply. An explicit origin allowlist can be configured with `TEMP_FILES_ALLOWED_ORIGINS` if needed.

Local Vite and Docker nginx use the existing same-origin `/api/` proxy. The nginx file-transfer routes allow 101 MiB requests and a 10-minute idle transfer timeout, with buffering disabled. Keep public file-path access logs disabled in outer proxies as well.

For a Vercel frontend, set `VITE_TEMP_FILES_URL=https://your-backend.example.com` at build time and use the backend’s default all-origin file-transfer CORS setting. This sends uploads and downloads directly to the backend. Vercel Functions have smaller [request/response payload limits](https://vercel.com/docs/functions/limitations#request-body-size) than this feature's default file limit. An HTTPS frontend requires an HTTPS transfer origin.

Leave `VITE_TEMP_FILES_URL` blank for the same-origin proxy. A localhost share URL works only on the same computer. Deploy the frontend/backend at reachable origins before sharing links with other users.

## Manual verification

Sign in as USER, upload a binary file, copy its link, and download it without a session. Compare bytes, choose each expiry, inspect progress, cancel a transfer, and remove a file after confirmation. Check that a different ordinary account cannot delete another account's file. Confirm an expired or revoked link returns 404 before byte cleanup, and usage drops after cleanup. Check oversized/empty files, quota exhaustion, backend unavailability, keyboard controls, and desktop/mobile layout. No automated test files or dependencies are required.

## Short share links

New uploads return links such as `https://your-host/api/f/Ab3xK9mQ2pRs.json`, with a 12-character random token and the original file extension when safe. Files without an extension use `/api/f/{token}`. Copy this URL into simulator responses when sharing a file. It returns bytes directly and retains the selected expiry. Existing long download URLs remain valid. The existing API proxies route `/api/f/` to the backend; it is a reserved download prefix.

Simulator endpoint creation, updates, and availability checks reject the file-download prefixes. The simulator catch-all returns 404 for unmatched paths or methods inside those prefixes, rather than resolving a simulated endpoint.

Temporary Files is a standalone Workspace feature, outside the developer-tool catalog. The old `/dashboard/developer-tools/temp-files` page redirects to `/dashboard/temp-files`. Its breadcrumb is Dashboard → Temporary Files, and its back link leads to Workspace overview.
