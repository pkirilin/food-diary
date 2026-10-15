# 05 — Verify ChatBox and Claude against a deployed server

**What to build:** Confirmation on a real deployment that both ways to connect work: ChatBox through CIMD and the consent page, and Claude through its configured client ID and secret.

**Blocked by:** 01 — Rotating refresh tokens for all MCP Clients; 04 — Consent page

**Status:** ready-for-human

- [ ] ChatBox adds the server with no `Mcp:Clients` entry, shows the consent page with its name, `chatboxai.app` and the localhost warning, and lists the tools after Approve
- [ ] ChatBox calls `get_food_logs` and `list_products` successfully
- [ ] ChatBox keeps working after its access token expires, which proves a rotated refresh
- [ ] Deny in ChatBox leaves it unconnected
- [ ] Claude, with its configured client ID and secret, reconnects once after the upgrade, sees no consent page, and calls a tool
- [ ] Claude still works after an access token refresh (re-check after 30 days to confirm that Claude stores rotated refresh tokens)
