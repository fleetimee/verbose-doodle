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

The import UI accepts evidence JSON files below 1 MB. Active sessions may be
viewed and replayed, but only completed sessions have a final export.
