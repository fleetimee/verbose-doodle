# Visitor presence chat

Open the online-visitors drawer and choose a visitor's Chat action. Enter sends
a message; Shift+Enter inserts a newline. The composer accepts 500 characters and stays at a fixed compact height;
multiline content scrolls inside the input.
The sticker button opens the mascot pack in a scrollable picker.

Right-click a message for Message info and
Delete message. Info shows sender, recipient, sent time and read time when known;
the application does not infer a separate delivery timestamp. Clear chat removes
the entire selected conversation. Both deletion actions require confirmation and
permanently remove messages for both participants.

## Backend contract

The updated backend must be deployed alongside this frontend:

- `DELETE /api/dashboard/visits/chats/{messageId}?targetIp=...` deletes a message.
- `DELETE /api/dashboard/visits/chats?targetIp=...` clears a conversation.

Both endpoints require authentication, resolve the caller's IP server-side, and
restrict deletion to the conversation between that IP and `targetIp`. Responses
use the existing API envelope with `data.deleted_ids`, an array of deleted IDs.
An empty array means no matching messages were found.

After commit, both participants receive a `dashboard_chat_deleted` realtime
event with `sender_ip`, `recipient_ip`, and `deleted_ids`. Clients remove only
those IDs, preserving newer messages and pending sends. Existing history,
presence/unread queries and read receipts use the remaining stored messages.
