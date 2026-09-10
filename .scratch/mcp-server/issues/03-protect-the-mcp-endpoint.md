# 03 — Mount `/mcp` and validate tokens

**What to build:** `/mcp` exists, speaks Streamable HTTP, and rejects anything without a valid token in the way that makes Claude start the OAuth flow rather than give up.

The server has no tools yet — this ticket is the transport and the guard.

**Blocked by:** 02

**Status:** open

- [ ] `AddMcpServer().WithHttpTransport(o => o.SessionMode = HttpServerSessionMode.Stateless)` and `app.MapMcp()`, mapped ahead of `UseSpa`
- [ ] A custom `AuthenticationHandler<AuthenticationSchemeOptions>` is registered under the scheme name `"Bearer"`. It `Unprotect`s the opaque access token, checks expiry and audience, and builds the `ClaimsPrincipal`. `McpAuthenticationOptions` defaults to `ForwardAuthenticate = "Bearer"`, so `AddMcp` delegates to it — the SDK samples use `AddJwtBearer` but nothing requires it
- [ ] `.AddMcp(o => o.ResourceMetadata = …)` serves `/.well-known/oauth-protected-resource` with `AuthorizationServers` set to `Mcp:BaseUrl` and `ScopesSupported: ["food:read"]`
- [ ] The metadata `resource` field is `{Mcp:BaseUrl}/mcp` — it must match the URL as typed into Claude exactly
- [ ] An unauthenticated call to `/mcp` returns `401` with `WWW-Authenticate: Bearer resource_metadata="…"` and `scope="food:read"`, and that URL resolves
- [ ] `AddAuthorizationFilters()` is registered and `/mcp` requires the authenticated principal
- [ ] `dotnet build` and `dotnet test` pass
