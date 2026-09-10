# Dashboard activity integration

The frontend records a dashboard visit with `POST /api/dashboard/visits` when
an authenticated user enters a dashboard route. The backend must identify the
user from the bearer token and derive the client IP from the trusted request
connection or proxy headers. The request body is intentionally empty.

Every visit is persisted for audit history. To keep the UI quiet, the backend
broadcasts at most one notification for each `(user_id, ip_address)` pair per
five-minute cooldown. The cooldown is configurable with
`APP_DASHBOARD_VISIT_NOTIFICATION_COOLDOWN`. The browser that created the visit
suppresses its own notification, while other connected dashboard sessions still
receive it. A visit by the same account from another IP is a separate pair and
is broadcast normally. Loopback traffic is exempt from the cooldown so multiple
local sessions can be tested from one machine.

All authenticated dashboard users receive visit events through the existing
ticketed realtime flow:

- `POST /api/realtime/tickets` with `{ "audience": "dashboard-visits" }` (authenticated users)
- WebSocket `/api/dashboard/events?ticket=<ticket>`
- Event frame:

```json
{
  "type": "dashboard_visited",
  "payload": {
    "visit_id": "visit-123",
    "user_id": "user-42",
    "username": "alice",
    "role": "USER",
    "ip_address": "203.0.113.15",
    "visited_at": "2026-09-10T12:30:00Z"
  }
}
```

The backend should authorize the ticket audience for authenticated users, persist the visit
before publishing the event, and avoid trusting an IP supplied by the browser.
