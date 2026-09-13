# 03 — Mount `/mcp` and validate tokens

**What to build:** `/mcp` exists, speaks Streamable HTTP, and rejects anything without a valid token in the way that makes Claude start the OAuth flow rather than give up.

The server has no tools yet — this ticket is the transport and the guard.

**Blocked by:** 02

**Status:** resolved

- [x] `AddMcpServer().WithHttpTransport(o => o.SessionMode = HttpServerSessionMode.Stateless)` and `app.MapMcp()`, mapped ahead of `UseSpa`
- [x] A custom `AuthenticationHandler<AuthenticationSchemeOptions>` is registered under the scheme name `"Bearer"`. It `Unprotect`s the opaque access token, checks expiry and audience, and builds the `ClaimsPrincipal`. `McpAuthenticationOptions` defaults to `ForwardAuthenticate = "Bearer"`, so `AddMcp` delegates to it — the SDK samples use `AddJwtBearer` but nothing requires it
- [x] `.AddMcp(o => o.ResourceMetadata = …)` serves `/.well-known/oauth-protected-resource/mcp` with `AuthorizationServers` set to `Mcp:BaseUrl` and `ScopesSupported: ["food:read"]`
- [x] The metadata `resource` field is `{Mcp:BaseUrl}/mcp` — it must match the URL as typed into Claude exactly
- [x] An unauthenticated call to `/mcp` returns `401` with `WWW-Authenticate: Bearer resource_metadata="…"` and `scope="food:read"`, and that URL resolves
- [x] `AddAuthorizationFilters()` is registered and `/mcp` requires the authenticated principal
- [x] `dotnet build` and `dotnet test` pass

## Comments

- The SDK's `McpAuthenticationHandler` (2.2.0, and `main` at the time) writes only `Bearer resource_metadata="…"` and has no hook for `scope`. On the user's call, the `"Bearer"` handler (`McpAccessTokenHandler`) owns the challenge too: `AddMcp` sets `ForwardChallenge = "Bearer"`, and the SDK handler only serves the metadata document. The spec's § Token validation says so.
- On the user's call, the `/mcp` authorization policy re-checks the token's email against `Auth:AllowedEmails` on every request — `403` for an email no longer allowed, once the app restarts with the new configuration. This closes the allowlist half of 02's open comment; refresh-token rotation stays open there.
- Open, inherited: `RequireClaim` with an empty value list accepts any email, and `Auth:AllowedEmails` ships as `[]` with no startup check. The existing `GoogleAllowedEmails` policy guarding the whole app and `/authorize` has the same hole, so an unconfigured allowlist admits every Google account everywhere, `/mcp` included. Decide whether startup should fail on an empty allowlist.
- The metadata document lives at the path-suffixed `/.well-known/oauth-protected-resource/mcp` per spec § Resource identity, not the bare path this ticket first named.
- The MCP server, the `"Bearer"` and `McpAuth` schemes and the policy are registered only when `Mcp:Enabled` is set. The SDK's metadata handler runs inside `UseAuthentication` on every request, so registering it while disabled would serve the document regardless of endpoint mapping.
- Unit tests (`McpTokenServiceTests`) cover `ValidateAccessToken`: valid before expiry, invalid at expiry, another resource, a refresh token presented as an access token, and malformed input. Component tests pulled forward from 07: spec case 5 (401 + header + resolvable metadata), a real `McpClient` completing `initialize` with a minted token, and the `403` for a non-allowlisted email. None call `Given_authenticated_user()`.
