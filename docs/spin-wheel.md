# Spin wheel sessions and evidence

Open **Workspace → Spin wheel** at `/dashboard/wheel`. Administrators create,
spin, and complete sessions. Authenticated users can inspect saved sessions,
replay results, and verify evidence files. Session links include the saved
session ID in the `session` query parameter.

Saved sessions open in a paginated grid with wheel previews rendered from their
locked entries and a visible session name. Creating a session returns to the grid;
select a wheel explicitly to open it. The workspace fits the viewport, with
contained scrolling for evidence and draw history.

## Rules and persistence

Creating a session permanently locks its title, ordered participant list, rules,
draw limit, and animation duration. Each eligible entry has equal probability.
Use 2–100 unique names, each no longer than 100 characters. The draw limit is
1–200 and the animation duration is 2–12 seconds.

- **Single draw** automatically completes after one result.
- **Remove winners** excludes previous winners and stops at the configured limit
  or when all entries have won, whichever comes first.
- **Allow repeat winners** keeps every entry eligible on every draw until the
  configured limit is reached.

Records live in PostgreSQL's `wheel_sessions` table. Existing Hibernate schema
management creates the table after the backend restarts. There are no edit,
reopen, or delete APIs. Completing a session seals it permanently, including
sessions completed before their maximum draw count.

## Drawing and replay

The backend chooses the winner with `SecureRandom`, records the exact eligible
entry indices, operator, timestamp, rotation angle, and duration, then commits
before returning the result. The wheel animation presents that saved outcome;
it does not choose another winner. The pointer and rotation use the same
recorded entry order for live animation and replay. Reduced-motion preferences
show the result without a full rotating animation.

A pessimistic database row lock serializes mutations. A server-side cooldown
requires a minimum interval equal to the recorded duration between new draws. Every
spin carries an idempotency UUID. A retry with the same UUID retrieves its
existing result rather than adding a draw. The frontend preserves an unresolved
request UUID locally so an interrupted request can be recovered after reload.

Select any draw in history to inspect its recorded wheel. Replay an individual
draw or the whole saved sequence. Replay never calls the spin endpoint and can
be stopped. A reload restores saved history, not an in-progress browser animation.

## Integrity and export

Each configuration, draw, completion seal, and current history checkpoint has a
SHA-256 digest and an HMAC-SHA256 signature. Draws include the previous digest.
The checkpoint binds session identity, draw count, the latest draw digest, and
the completion-seal digest. Verification also checks eligible entries, winner
membership, draw numbering, duplicate request IDs, draw limits, and whether the
recorded rotation actually lands on the recorded winner.

Complete the session before downloading its evidence JSON. Keep this file as an
external copy. **Verify evidence file** validates the signed chain and requires
an exact match with the saved, completed session, detecting altered or truncated
files and stale snapshots. Invalid sessions cannot be spun, replayed, or exported.
The export contains canonical signed JSON payloads and signatures, never the key.

This is **tamper-evident server evidence**, not a claim that administrators with
control of both the database and signing key are unable to forge records. It
also does not independently prove the server used unbiased randomness. Replaying
an entire previously valid database snapshot requires an external retained copy
or independent immutable audit anchor to detect. HMAC verification trusts the
server; the file is not a public-key signature that can be independently verified
offline.

## Signing key

Set a strong, stable `WHEEL_EVIDENCE_KEY` environment variable on the backend.
It resolves through `app.wheel.evidence-key`; development falls back to the
existing JWT secret. Use a dedicated random secret in production, restrict its
access, and preserve it across deployments and restores. Changing it invalidates
verification of existing evidence; this version does not implement key rotation.
Protect the database and backups as well. Never commit signing keys.

## API

All responses use the existing API envelope and `Cache-Control: no-store`.

| Method | Path | Access |
| --- | --- | --- |
| GET | `/api/wheel-sessions?page=0` | Authenticated |
| GET | `/api/wheel-sessions/{id}` | Authenticated |
| POST | `/api/wheel-sessions` | ADMIN |
| POST | `/api/wheel-sessions/{id}/spin` | ADMIN |
| POST | `/api/wheel-sessions/{id}/complete` | ADMIN |
| POST | `/api/wheel-sessions/verify` | Authenticated |

The interface verifies evidence using a pasted hash in the session Evidence tab.
Active sessions may be viewed and replayed, but only completed sessions have a
final export or a final hash. The file verification API remains available for
existing integrations.

## Compare an evidence hash

After completing a session, open its Evidence tab and use **Copy hash** to keep
its final SHA-256 fingerprint separately. Later, paste that hash into **Hash to
compare** for the same session and choose **Check integrity**. No file download
is required. The server re-reads the session, verifies all signatures and the
history chain, confirms it is sealed, then compares the signed checkpoint hash.
A mismatch or failed signature check cannot pass verification. Like file
verification, this trusts the server and its signing key; a retained hash is an
external comparison value, not independent proof of fairness.

`POST /api/wheel-sessions/{id}/verify-hash` accepts `{ "hash": "<64 hex characters>" }`
and returns `{ "verified": true | false }` inside the standard data envelope.
Authenticated users can verify; administrator access is not required.

## Share results with participants

After sealing a verified session, an administrator can open Evidence and choose
**Copy result link**. This explicitly enables an unlisted microsite at
`/wheel/results/<random-token>`; no login is required. The link reveals the
session title, participant names, results, draw times, replay timings, and final
fingerprint. It does not expose account names, request identifiers, signing
records, or administrative controls. Replays use only the saved results and
never create draws. The page starts with the original full wheel.

Sharing uses a random 256-bit bearer token, stored separately from signed
session evidence. **Disable result link** revokes future requests immediately;
creating another link after revocation generates a new token. Previously viewed
or copied results cannot be recalled. The API re-verifies integrity before
serving a shared result and rejects unsealed or invalid sessions. Responses use
`Cache-Control: no-store`; the microsite asks crawlers not to index it.

- `POST /api/wheel-sessions/{id}/share`: ADMIN; enables or retrieves the token.
- `DELETE /api/wheel-sessions/{id}/share`: ADMIN; revokes the token.
- `GET /api/public/wheels/{token}`: public, read-only result and replay data.

Restart the backend to apply the nullable, unique `share_token` column through
its existing Hibernate schema update. The frontend host must route the public
microsite path to the SPA, and participants must be able to reach the deployed
frontend and API.

## Winner announcement

Live draws, saved replays, and the participant microsite use the same winner
dialog after the wheel animation finishes. It shows the saved winner name and
draw number with a short confetti burst. Session replay pauses at every winner;
**Next draw** continues, while dismissing the dialog stops the sequence. Viewing
a result in history also opens its announcement. Reduced-motion preferences
suppress confetti, and announcements never create or change results.

When only one eligible entry remains, **Award remaining entry** saves that result
without a spin animation. The winner dialog explains that it was the only
remaining entry. Replays and shared results also skip this deterministic spin;
they still use the saved draw and preserve its evidence. The award is explicit,
so a session can still be sealed early rather than awarding everyone.

## Wheel settling motion

The visual spin decelerates, overshoots by at most 3 degrees, rolls back gently, and settles at the
exact saved angle. New draws place the landing safely inside the winning sector
near its boundary so a small rollback can cross the neighboring sector. The
winner is still chosen uniformly before the landing offset. Existing signed
records keep their original angles; their rollback is bounded to avoid a large
reversal. Replay and public results derive the same motion from the saved angle
and duration. Reduced-motion mode skips this animation.
