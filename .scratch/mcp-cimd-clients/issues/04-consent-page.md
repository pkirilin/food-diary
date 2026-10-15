# 04 — Consent page

**What to build:** When a CIMD MCP Client asks for access, the owner sees a Food Diary page with the MCP Client's logo, name and hosts and the sentence "**{client_name}** will be able to view your food logs and products, but not change them." When the MCP Client receives access only on the owner's computer, the page also shows a warning. Approve or Deny sends the owner back to the MCP Client. The page cannot be embedded in another site. The MCP guide presents client-secret and CIMD as two equal ways to connect. After this ticket ChatBox can connect.

See the spec's "Consent page (SPA)", "Anti-framing" and "Docs" sections.

**Blocked by:** 03 — Consent decision and public token exchange

**Status:** ready-for-agent

- [ ] A new top-level route outside the authenticated `_app` layout takes the consent request from validated search params, following the `post-login` route pattern; the page component is router-agnostic (ADR-0005)
- [ ] The page shows the logo (fixed size, `referrerpolicy="no-referrer"`, a letter fallback when the logo is missing or fails to load), client name, `client_id` host, redirect host and the access sentence
- [ ] The warning "This app receives access on this computer. Approve only if you started this sign-in." appears only when the localhost-only flag is set
- [ ] Approve and Deny call the submit endpoint and then navigate the whole window to the returned redirect URL
- [ ] An expired or already-decided consent request shows "this request has expired; start again from your MCP Client"
- [ ] RTK Query endpoints use the shared contract names; MSW handlers serve them in development and tests
- [ ] Every API response, including the SPA document, sends `Content-Security-Policy: frame-ancestors 'none'`, with a component scenario that asserts it
- [ ] Frontend tests: name, hosts and sentence render; logo fallback; warning only with the flag; Approve and Deny navigate to the returned URL; expired request message
- [ ] The page is checked in a browser with `yarn playwright-cli` against MSW
- [ ] `docs/guide/mcp-server.md` describes client-secret (Claude example) and CIMD (ChatBox example, no configuration) as equal options and describes the consent page
- [ ] Frontend lint, build and tests pass; backend build and tests pass
