# Spec: CIMD MCP Clients and rotating refresh tokens

Status: ready-for-agent

Vocabulary: [GLOSSARY.md](../../GLOSSARY.md) — **MCP Client**, **Food Log**, **Product** are defined there and used with those exact meanings below.

Decision records: [ADR-0006](../../docs/adr/0006-cimd-clients-and-rotating-refresh-tokens.md) (this change) and [ADR-0003](../../docs/adr/0003-oauth-authorization-server-in-api.md) (the authorization server it amends).

Prior spec: [.scratch/mcp-server/spec.md](../mcp-server/spec.md).

## Problem Statement

The MCP server accepts only MCP Clients that the owner has configured in `Mcp:Clients` with a client ID, a client secret and a redirect URI, and whose settings let the owner type those values in. Many MCP Clients have no such setting. ChatBox, for example, refuses to add the server with "Incompatible auth server: does not support dynamic client registration": it can only identify itself with a Client ID Metadata Document (CIMD) or register itself dynamically, and it never holds a secret.

Separately, every MCP Client has to reconnect 30 days after it first signed in. A refresh never issues a new refresh token, so the one from the first sign-in expires on schedule however actively the MCP Client uses it.

## Solution

The authorization server accepts any MCP Client that identifies itself with a CIMD URL, with no configuration. On sign-in, the owner signs in with Google as today, the server fetches and validates the MCP Client's metadata document, and the owner sees a consent page that names the MCP Client and asks them to approve or deny access. Configured client-secret MCP Clients keep working exactly as today, without a consent page. The docs present the two ways as equal options; the owner uses whichever the MCP Client supports.

Every refresh now returns a new refresh token with a fresh 30-day lifetime, and each refresh token works once. An MCP Client that keeps refreshing never has to reconnect. A refresh token presented a second time cancels its whole chain, so a stolen token stops working the next time either party refreshes.

## User Stories

1. As a ChatBox user, I want to add my Food Diary MCP server in ChatBox, so that I can ask ChatBox about my Food Logs and Products.
2. As an owner using an MCP Client that supports CIMD, I want to connect it without editing server configuration, so that connecting is as easy as in any other MCP server.
3. As an owner, I want to sign in with my Google account before anything else happens, so that only I can start connecting an MCP Client.
4. As an owner, I want a consent page that shows the MCP Client's name, so that I know which app is asking for access.
5. As an owner, I want the consent page to show the MCP Client's logo when it has one, so that I recognise the app at a glance.
6. As an owner, I want a letter placeholder when the MCP Client has no logo or the logo fails to load, so that the page never shows a broken image.
7. As an owner, I want the consent page to show the host of the MCP Client's `client_id`, so that I can tell a real app from one that copies its name or logo.
8. As an owner, I want the consent page to show the host the MCP Client will receive access on, so that I know where my access goes.
9. As an owner, I want a warning when the MCP Client receives access only on my own computer, so that I approve only sign-ins that I started.
10. As an owner, I want the consent page to say "**{client_name}** will be able to view your food logs and products, but not change them.", so that I understand what I grant.
11. As an owner, I want to approve, so that the MCP Client gets access and continues its sign-in.
12. As an owner, I want to deny, so that the MCP Client gets no access and learns that I refused.
13. As an owner, I want the consent page on every CIMD sign-in, so that no approval is silently reused.
14. As an owner, I want a link from another site to be unable to approve on my behalf, so that one click never grants access without my decision.
15. As an owner, I want the consent page to be impossible to embed in another site, so that nobody can trick me into clicking Approve inside a disguised frame.
16. As an owner, I want a consent page that I opened but did not answer to stop working after a few minutes, so that a stale page cannot be used later.
17. As an owner, I want a consent decision to work only once, so that it cannot be replayed.
18. As an owner, I want a clear error page when an MCP Client's metadata document is unreachable or invalid, so that I know why the connection failed.
19. As an owner, I want my server to refuse to fetch metadata documents from addresses inside my network, so that a crafted link cannot use my server to reach my router, dashboards or cloud metadata.
20. As an owner, I want my server to refuse metadata documents that redirect, are larger than 5 KB, or take longer than 5 seconds, so that a hostile `client_id` cannot tie up or mislead my server.
21. As an owner, I want my server to refuse a metadata document whose `client_id` differs from its URL, so that one app cannot pose as another.
22. As an owner, I want my server to refuse a sign-in whose redirect URI is not listed in the MCP Client's metadata document, so that codes go only where the app said they would.
23. As an owner, I want my server to refuse redirect URIs that are neither `https` nor loopback `http`, so that custom-scheme impersonation is not possible.
24. As an owner, I want errors about a metadata document never to include the document's content, so that error pages do not leak what my server fetched.
25. As a Claude user with a configured client ID and secret, I want my connector to keep connecting without a consent page, so that nothing changes for me.
26. As an owner, I want any MCP Client that keeps refreshing to stay connected indefinitely, so that I do not reconnect every 30 days.
27. As an owner, I want a reused refresh token to cancel its whole chain, so that a stolen token stops working the next time either party refreshes.
28. As an owner, I want an MCP Client that was offline for more than 30 days to be asked to sign in again, so that abandoned connections end.
29. As an owner upgrading Food Diary, I want existing connections to need one fresh sign-in, so that every connection afterwards uses rotating refresh tokens.
30. As a self-hoster, I want MCP enabled with no `Mcp:Clients` entries to start successfully, so that I can use only CIMD MCP Clients.
31. As a self-hoster, I want existing `Mcp:Clients` configuration to keep working unchanged, so that upgrading needs no config edits.
32. As a self-hoster, I want the MCP guide to describe client-secret and CIMD as two equal ways to connect, so that I pick whichever my MCP Client supports.
33. As a self-hoster, I want the MCP guide to walk through connecting ChatBox, so that I have one complete CIMD example.
34. As an MCP Client developer, I want the authorization server metadata to advertise `client_id_metadata_document_supported` and the `none` token endpoint auth method, so that my client picks CIMD automatically.
35. As a CIMD MCP Client, I want to exchange my code and refresh tokens without a client secret, so that a public client can use the server.
36. As a CIMD MCP Client, I want a clear error when I send a client secret, so that I learn CIMD clients must be public.

## Implementation Decisions

### Client identification

- A `client_id` that matches a configured `Mcp:Clients` entry is a client-secret MCP Client, exactly as today. Configured entries take precedence over CIMD.
- Any other `client_id` that is a valid CIMD URL is a CIMD MCP Client. Valid means: `https` scheme, a path, no userinfo, no `.` or `..` path segments, no fragment. A query is allowed. Comparison is plain string comparison throughout.
- Anything else is refused as an unknown client, as today.
- CIMD MCP Clients are public: no secret, PKCE S256 required as for every client. A CIMD MCP Client that presents a `client_secret` at the token endpoint is refused with `invalid_client`.
- `Mcp:Clients` becomes optional: startup validation no longer requires at least one entry. Its per-entry rules are unchanged.
- CIMD is always on when `Mcp:Enabled` is true. There is no separate flag.

### Authorization server metadata

- Adds `client_id_metadata_document_supported: true`.
- `token_endpoint_auth_methods_supported` becomes `client_secret_post` and `none`.
- No `registration_endpoint`.

### Authorize flow for CIMD MCP Clients

The order changes for CIMD MCP Clients. Client-secret MCP Clients keep today's order: validate, then sign in, then approve automatically.

1. Sign in with Google and pass the `Auth:AllowedEmails` policy. A not-allowed account gets the plain-text 400, never a redirect, because the client is not yet validated.
2. Fetch the metadata document (see below).
3. Validate the document and the request:
   - The document is a JSON object with `client_id`, `client_name` and `redirect_uris`.
   - The document's `client_id` equals the fetched URL.
   - `token_endpoint_auth_method`, if present, is `none`. Any other value, including `private_key_jwt`, is refused.
   - Every accepted redirect URI is `https`, or `http` with host `localhost`, `127.0.0.1` or `[::1]`.
   - The request's `redirect_uri` is present and exactly equals one of the document's `redirect_uris`.
   - `response_type`, PKCE, scope and resource are validated as today.
4. Any failure in steps 2 and 3 is the existing `Refused` outcome: a plain-text 400 with a specific reason, never a redirect to the client. The reason never contains response content from the fetched document.
5. On success, redirect the browser to the SPA consent route with a **consent request** in the query string.

### Fetching the metadata document

- A dedicated HTTP client: no automatic redirects; only `200 OK` is success; reads at most 5 KB; 5-second timeout; no cookies.
- A connect-time address filter refuses every RFC 6890 special-use address: private, loopback, link-local, CGNAT, unspecified, multicast, documentation and benchmarking ranges, and the IPv6 equivalents, including IPv4-mapped IPv6 addresses. It is applied to the resolved address the socket connects to, so DNS rebinding cannot bypass it.
- The address filter is a replaceable service. Component tests replace it to reach the loopback test double. The CIMD draft allows this exception for testing only.
- No caching: fetched on every CIMD authorize request. `logo_uri` is never fetched by the server. Both depart from SHOULDs in the CIMD draft and are recorded in ADR-0006.

### Consent request

- An `IDataProtector`-protected payload holding the validated authorize request, the MCP Client's display details (name, `https` logo URL if any, `client_id` host, redirect URI host, whether every document redirect URI is loopback), the signed-in email, a unique ID and a 10-minute expiry.
- Single-use: its ID is recorded in `IMemoryCache` on issue and removed on the first decision, the same pattern as authorization codes.
- Valid only for the signed-in user whose email it holds.

### Consent API

Two endpoints in the MCP area of `FoodDiary.API`, mapped only when MCP is enabled and before the SPA fallback. Both need the Google auth cookie and the `GoogleAllowedEmails` policy. Contract names are shared by backend and frontend:

- `GetMcpConsentResponse`: returned for a consent request. Holds the client name, logo URL (nullable), `client_id` host, redirect URI host and a localhost-only flag. An expired, used, foreign or tampered consent request is an error response that the page shows as "this request has expired; start again from your MCP Client".
- `SubmitMcpConsentRequest` (consent request, approved: boolean) and `SubmitMcpConsentResponse` (redirect URL). Accepts only `application/json`, which forces a CORS preflight on cross-site calls, and the API allows no cross-origin requests. Approve issues an authorization code and returns the redirect to the client with `code`, `state` and `iss`. Deny returns the redirect with `error=access_denied`, `state` and `iss`.
- Together with the `SameSite=Lax` auth cookie and the protected single-use consent request, these replace antiforgery tokens.

### Consent page (SPA)

- A new top-level route outside the authenticated `_app` layout, with the consent request in validated search params, following the `post-login` route pattern. The page component is router-agnostic (ADR-0005).
- Shows the logo (fixed size, `referrerpolicy="no-referrer"`, falls back to the client name's first letter on a missing value or a load error), the client name, the `client_id` host, the redirect host, the access sentence "**{client_name}** will be able to view your food logs and products, but not change them.", and a warning when the localhost-only flag is set: "This app receives access on this computer. Approve only if you started this sign-in."
- Approve and Deny call the submit endpoint and then navigate the whole window to the returned redirect URL.
- RTK Query endpoints for both calls and MSW handlers for development and tests.

### Anti-framing

- Every response from `FoodDiary.API`, including the SPA document, sends `Content-Security-Policy: frame-ancestors 'none'`.

### Refresh tokens

- The refresh token payload gains a token ID and a chain ID. The authorization-code exchange starts a new chain.
- Every refresh, for every client, redeems the presented token and issues a new access token plus a new refresh token in the same chain, with a fresh 30-day lifetime from now.
- Refresh tokens in the pre-upgrade format (no token ID or chain ID) are refused with `invalid_grant`. There is no migration path.
- An Application-layer handler owns redemption, so MCP code in `FoodDiary.API` stays off the database (prior spec's rule). Its outcomes are: redeemed; already redeemed, which also cancels the chain; or chain already cancelled. The `/token` endpoint maps every outcome except "redeemed" to `invalid_grant`.
- Postgres stores redeemed token IDs (unique, so two concurrent redemptions of the same token cannot both succeed) and cancelled chain IDs, each with an expiry. A cancelled chain is kept until now plus the refresh token lifetime. Expired rows are deleted on later redemptions. This requires a new EF migration.
- Access tokens already issued from a cancelled chain stay valid until they expire (at most one hour). There is no access-token store.

### Docs

- `docs/guide/mcp-server.md`: two equal ways to connect, client secret (Claude as the example) and CIMD (ChatBox as the example, with no configuration). It also describes the consent page and that existing connections sign in once after upgrading.
- `docs/guide/deployment.md`: `Mcp:Clients` is optional and needed only for client-secret MCP Clients.
- `docs/development.md` and `CLAUDE.md`: MCP no longer needs `Mcp:Clients:0:*` to start locally.
- The release's CHANGELOG entry says that existing connections must sign in once.

## Testing Decisions

A good test drives the feature through its public surface (HTTP requests to the API, or user interactions with the rendered page) and asserts on what an MCP Client or the owner observes. It does not assert on internal types, payload formats or table rows.

- **Backend component tests**, extending the MCP scenarios (prior art: the MCP API tests and their scenario context, with `WebApplicationFactory`, Testcontainers Postgres, fake auth, and Mountebank as in the Google and OpenAI test doubles). Mountebank serves metadata documents, with the address filter replaced. Scenarios:
  - The metadata advertises CIMD and `none`.
  - The full CIMD path: authorize, consent request, approve, code, token without a secret, MCP call succeeds.
  - Deny redirects with `access_denied`.
  - Each refusal returns a plain-text 400: document 404, redirect, more than 5 KB, timeout, invalid JSON, missing fields, `client_id` mismatch, `redirect_uri` not listed, disallowed redirect scheme, non-`https` `client_id`, `private_key_jwt`.
  - A consent request is refused when expired, reused, tampered with, or submitted by another user.
  - A CIMD MCP Client presenting a secret gets `invalid_client`.
  - Rotation: the new refresh token works; reusing an old one cancels the chain, so the newest one also fails.
  - A refresh token in the pre-upgrade format is refused.
  - A client-secret MCP Client still approves automatically and gets rotation.
  - MCP enabled with no `Mcp:Clients` starts.
  - Responses carry `frame-ancestors 'none'`.
  - One scenario keeps the **real** address filter and uses `https://localhost/…` as `client_id`, and expects a 400. This proves the filter is wired in.
- **Backend unit tests**:
  - The address filter as a pure function: a table of addresses, each marked allowed or refused, covering every special-use range and the IPv4-mapped IPv6 forms.
  - CIMD `client_id` URL rules, next to the existing authorize-request validator tests.
  - Options validation for optional `Mcp:Clients`, extending the existing MCP options validation tests.
- **Frontend tests** (Vitest, MSW, the shared render helper; prior art: the products route tests):
  - The consent page shows the name, hosts and access sentence.
  - The logo falls back to a letter.
  - The localhost warning appears only with the flag.
  - Approve and Deny navigate to the returned URL.
  - An expired consent request shows the error message.
- No E2E changes. The E2E suite is a single sign-in test.

## Out of Scope

- Dynamic Client Registration.
- `private_key_jwt` and any other client authentication for CIMD MCP Clients.
- Caching metadata documents, and fetching or proxying logos on the server.
- Remembering consent between sign-ins, and a consent page for client-secret MCP Clients.
- Domain trust policies or allowlists for CIMD URLs.
- Custom-scheme redirect URIs and RFC 8252 any-port loopback matching.
- Revoking access tokens, and any UI to list or revoke connected MCP Clients.
- Migrating pre-upgrade refresh tokens.

## Further Notes

- ChatBox's facts, from its MCP OAuth provider source: `client_id` `https://chatboxai.app/.well-known/oauth-client`, redirect URI `http://127.0.0.1:1456/callback`, `token_endpoint_auth_method` `none`. It prefers CIMD when advertised and falls back to DCR. Check it end to end against a deployed server once the work is done.
- The owner confirmed that Claude keeps using the configured client ID and secret with the new metadata. Whether Claude stores rotated refresh tokens is verified after release: a Claude connection that survives past 30 days confirms it.
- The specs: CIMD draft-02 (§3 URL rules, §4 validation, §5 fetching, §8.6 SSRF, §8.7 size) and the MCP 2026-07-28 authorization security considerations (localhost warning, redirect host display, refresh rotation for public clients).
