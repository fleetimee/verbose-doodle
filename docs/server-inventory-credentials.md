# Server inventory credentials

Research checked on 2026-10-05 to determine where RDP and FTP credentials belong
in the inventory entry form.

## Findings

- **RDP:** Username/password authentication is supported, but it is not the only
  option. Microsoft documents password, smart card, and Windows Hello for Business
  certificate authentication for supported configurations, plus Microsoft Entra
  authentication. See [Microsoft's remote connection documentation](https://learn.microsoft.com/en-us/windows/client-management/client-tools/connect-to-remote-aadj-pc)
  and [smart card sign-in for Remote Desktop Services](https://learn.microsoft.com/en-us/windows/security/identity-protection/smart-cards/smart-card-and-remote-desktop-services).
- **FTP:** The protocol defines `USER` for the username and `PASS` for its password.
  The server determines whether a password is needed to complete login. See
  [RFC 959, section 4.1.1](https://www.rfc-editor.org/rfc/rfc959.html#section-4.1.1).
- **Anonymous FTP:** Some servers provide an `anonymous` account, traditionally
  accepting a general string or email address as its password rather than a
  private account password. See [RFC 1635, “What is Anonymous FTP?”](https://www.rfc-editor.org/rfc/rfc1635.html).

## Form decision

Show username and password in the main form for RDP and FTP, alongside SSH,
instead of hiding them in Optional details. Keep both inventory fields optional,
as requested. Authentication requirements for connecting to a server do not
require the inventory to store those credentials; alternate authentication and
anonymous access also make mandatory stored passwords inappropriate.

This is a product decision informed by the sources above, not a protocol
requirement. Preserve the existing edit behavior: a blank password leaves the
stored password unchanged.
