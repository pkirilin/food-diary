# 02 — OAuth authorization server

**What to build:** `FoodDiary.API` can complete an OAuth authorization code flow with Claude as a pre-registered client, ending with an opaque access token and a refresh token. Signing in reuses the Google cookie scheme the app already has.

At the end of this ticket the flow works end to end but protects nothing yet — no endpoint checks the token.

See [spec.md](../spec.md) § Authorization and [ADR 0003](../../../docs/adr/0003-oauth-authorization-server-in-api.md) for why the API is its own authorization server and why the tokens are not JWTs.

**Blocked by:** 01

**Status:** open

- [ ] `GET /.well-known/oauth-authorization-server` serves RFC 8414 metadata built from `Mcp:BaseUrl`: `authorization_code` and `refresh_token` grants, `code` response type, `S256` only, `client_secret_post`, `scopes_supported: ["food:read"]`, `authorization_response_iss_parameter_supported: true`
- [ ] `GET /authorize` challenges the existing Google cookie scheme, then rejects any email absent from `Auth:AllowedEmails`
- [ ] `/authorize` validates `client_id` against `Mcp:ClientId` and `redirect_uri` against the one pre-registered Claude callback, `https://claude.ai/api/mcp/auth_callback`
- [ ] Once both checks pass it auto-approves — no consent page. The `redirect_uri` allowlist plus PKCE is what makes this safe; see ADR 0003
- [ ] The authorization response carries `iss` (RFC 9207) **on success and on error responses**, matching the metadata flag above
- [ ] The authorization code is an `IDataProtector` blob with a 60-second lifetime carrying `client_id`, `redirect_uri`, the PKCE `code_challenge`, `resource`, `scope` and the authenticated email
- [ ] The code id is recorded in `IMemoryCache` and removed on first exchange, so a code cannot be replayed within its lifetime
- [ ] `POST /token` accepts `application/x-www-form-urlencoded`, verifies PKCE S256 against the challenge in the code, verifies the client secret, and issues an opaque access token plus a refresh token — both `IDataProtector` blobs under distinct purpose strings
- [ ] The `refresh_token` grant works and returns a new access token; without it the connection dies hourly, since Claude only refreshes reactively on a 401 and access tokens live one hour
- [ ] All routes are mapped ahead of `UseSpa`
- [ ] The top-level `GET` redirect to `/authorize` carries the `SameSite=Lax` cookie — confirm against a real browser round trip, not only a test
- [ ] `dotnet build` and `dotnet test` pass
