# 03 — Consent decision and public token exchange

**What to build:** The owner's consent decision completes a CIMD sign-in. The API returns a consent request's display details and accepts the owner's decision. Approve returns a redirect to the MCP Client with an authorization code. Deny returns a redirect with `access_denied`. The CIMD MCP Client then exchanges the code at `/token` without a client secret, as a public client, and reaches the MCP tools. After this ticket the full CIMD path works end to end in component tests that call the consent API directly.

See the spec's "Consent request" and "Consent API" sections.

**Blocked by:** 02 — CIMD MCP Client validation up to the consent request

**Status:** ready-for-agent

- [ ] `GetMcpConsentResponse` returns the client name, logo URL (nullable), `client_id` host, redirect host and the localhost-only flag for a consent request
- [ ] `SubmitMcpConsentRequest` (consent request, approved) returns `SubmitMcpConsentResponse` (redirect URL); it accepts only `application/json`
- [ ] Both endpoints need the Google auth cookie and the `GoogleAllowedEmails` policy, exist only when MCP is enabled, and are mapped before the SPA fallback
- [ ] A consent request is refused when expired, already decided, tampered with, or presented by a user other than the one it was issued to
- [ ] Approve issues an authorization code for the CIMD MCP Client and returns the redirect with `code`, `state` and `iss`
- [ ] Deny returns the redirect with `error=access_denied`, `state` and `iss`
- [ ] `/token` accepts a CIMD MCP Client with no client secret (PKCE still required) and refuses one that sends a `client_secret` with `invalid_client`
- [ ] A CIMD MCP Client gets rotating refresh tokens like any other client
- [ ] Component scenarios: the full CIMD path from authorize through consent approve, code exchange and an MCP tool call; deny; each consent-request refusal; secret sent by a CIMD MCP Client; a client-secret MCP Client still approves automatically
- [ ] Backend build and all backend tests pass
