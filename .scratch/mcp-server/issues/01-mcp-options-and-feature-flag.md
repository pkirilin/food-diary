# 01 — MCP options, feature flag and endpoint isolation

**What to build:** The API carries an `Mcp` configuration section and a flag that genuinely switches the feature off. With the flag off the MCP and OAuth paths do not exist and say so; with it on but misconfigured, the app refuses to start rather than failing later inside Claude's UI.

Nothing MCP-specific works yet — this is the foundation the rest mounts onto.

**Blocked by:** None — can start immediately

**Status:** open

- [ ] `ModelContextProtocol.AspNetCore` is added to `Directory.Packages.props` as a `PackageVersion` (central package management is in use) and referenced by `FoodDiary.API`
- [ ] A top-level `Mcp` section exists alongside `Auth` and `GoogleAuth`, bound to an options type in `FoodDiary.API/Mcp/`: `Enabled` (default `false`), `BaseUrl`, `Clients`, `AccessTokenLifetime` (`01:00:00`), `RefreshTokenLifetime` (`30.00:00:00`)
- [ ] `Clients` is an array of `{ ClientId, ClientSecret, RedirectUri }`. `appsettings.json` ships entry `0` with `RedirectUri` set to `https://claude.ai/api/mcp/auth_callback` and nothing else
- [ ] `ClientSecret` is never written to `appsettings.json` — user-secrets locally, `Mcp__Clients__0__ClientSecret` in Docker
- [ ] With `Enabled=true`, startup fails with a message naming the offending key or index when: `BaseUrl` is missing; `Clients` is empty; any entry has an empty `ClientId`, `ClientSecret` or `RedirectUri`; two entries share a `ClientId`; or a `RedirectUri` fails the same shape validation as `BaseUrl`
- [ ] Unit tests in `FoodDiary.UnitTests` cover the options validation, including the duplicate `ClientId` case — lookup is by `ClientId`, so a duplicate makes the authenticating client depend on configuration order
- [ ] With `Enabled=false`, `/mcp`, `/authorize`, `/token` and `/.well-known/*` return **404** from a terminal branch registered ahead of `UseSpa`. Verify by hand that they do not return `index.html` — not mapping them is not sufficient, the SPA catch-all answers them otherwise
- [ ] `dotnet build` and `dotnet test` pass
