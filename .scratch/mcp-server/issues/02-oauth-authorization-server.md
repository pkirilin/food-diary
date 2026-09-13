# 02 — OAuth authorization server

**What to build:** `FoodDiary.API` can complete an OAuth authorization code flow with a pre-registered client, ending with an opaque access token and a refresh token. Signing in reuses the Google cookie scheme the app already has.

At the end of this ticket the flow works end to end but protects nothing yet — no endpoint checks the token.

See [spec.md](../spec.md) § Authorization and [ADR 0003](../../../docs/adr/0003-oauth-authorization-server-in-api.md) for why the API is its own authorization server and why the tokens are not JWTs.

**Blocked by:** 01

**Status:** resolved

- [x] `GET /.well-known/oauth-authorization-server` serves RFC 8414 metadata built from `Mcp:BaseUrl`: `authorization_code` and `refresh_token` grants, `code` response type, `S256` only, `client_secret_post`, `scopes_supported: ["food:read"]`, `authorization_response_iss_parameter_supported: true`
- [x] `GET /authorize` challenges the existing Google cookie scheme, then rejects any email absent from `Auth:AllowedEmails`
- [x] `/authorize` looks the request's `client_id` up in `Mcp:Clients` and compares `redirect_uri` for equality against that entry's `RedirectUri`. An unknown `client_id` or a mismatched `redirect_uri` is refused
- [x] Once both checks pass it auto-approves — no consent page. A client exists only because the owner configured it, so registration is the consent step; the `redirect_uri` equality check plus PKCE is what remains. See ADR 0003
- [x] Unit tests cover the `redirect_uri` mismatch and the unknown `client_id` refusals
- [x] The authorization response carries `iss` (RFC 9207) **on success and on error responses**, matching the metadata flag above
- [x] The authorization code is an `IDataProtector` blob with a 60-second lifetime carrying `client_id`, `redirect_uri`, the PKCE `code_challenge`, `resource`, `scope` and the authenticated email
- [x] The code id is recorded in `IMemoryCache` and removed on first exchange, so a code cannot be replayed within its lifetime
- [x] `POST /token` accepts `application/x-www-form-urlencoded`, verifies PKCE S256 against the challenge in the code, verifies the client secret against the entry for that `client_id`, and issues an opaque access token plus a refresh token — both `IDataProtector` blobs under distinct purpose strings
- [x] The `refresh_token` grant works and returns a new access token; without it the connection dies hourly, since Claude only refreshes reactively on a 401 and access tokens live one hour
- [x] All routes are mapped ahead of `UseSpa`
- [x] The top-level `GET` redirect to `/authorize` carries the `SameSite=Lax` cookie — confirm against a real browser round trip, not only a test
- [x] `dotnet build` and `dotnet test` pass

## Comments

- Component tests were pulled forward from 07 on the user's call, because `.claude/rules/backend.md` requires a happy-path component test per endpoint. `Scenarios/Mcp/McpApiTests.cs` covers spec case 1 (`/authorize` → `/token`) and case 7 (code replay), plus the refresh grant, the RFC 8414 document, and `iss` + `state` on an error redirect. `appsettings.ComponentTests.json` enables `Mcp` and overrides `Mcp:Clients:0`. Case 7 mints its code through `McpTokenService`, without `Given_authenticated_user()`, as 07 requires.
- The terminal 404 branch from 01 is now registered whether or not `Mcp:Enabled` is set. With MCP on, unmapped probes such as `/.well-known/openid-configuration`, and `/.well-known/oauth-protected-resource/mcp` until 03 lands, get a 404 instead of `index.html`. The spec's § Configuration says so.
- Browser round trip, verified 2026-09-13 in a real browser against `dotnet run` on `https://localhost:8080` with real Google sign-in. A page on `http://127.0.0.1:8765` linked cross-site to `/authorize`. The first click went Google → `/signin-google` → `/authorize` → callback. The second click, already signed in, went `/authorize` → callback with no Google hop, so the `SameSite=Lax` cookie rides the cross-site top-level `GET`. Against the real server, the code exchange returned 200 with `Cache-Control: no-store`, the replay 400 `invalid_grant`, and the refresh 200. The PWA service worker registers no navigation fallback, so it does not intercept `/authorize`.
- Leniencies: `resource` may be omitted at `/authorize` and defaults to `{Mcp:BaseUrl}/mcp`, the only resource served. `redirect_uri` and `resource` at `/token` are checked only when present, since OAuth 2.1 drops `redirect_uri` from the token request. An omitted `scope` means `food:read`.
- Open: the refresh grant returns a new access token only, not a new refresh token. The refresh token keeps the 30-day expiry it was issued with, so the connector must be reconnected 30 days after Connect however often it is used. Refresh also does not re-check `Auth:AllowedEmails`: an email removed from the allowlist keeps refreshing until that expiry, or until `Mcp:Enabled=false`. Decide whether to rotate refresh tokens and whether refresh or token validation (03) should re-check the allowlist.
  - Allowlist resolved in 03: the `/mcp` authorization policy re-checks `Auth:AllowedEmails` on every request, so a removed email gets `403` at `/mcp` once the app restarts with the new configuration. Refresh-token rotation is still open.
