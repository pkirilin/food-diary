# 01 — MCP options, feature flag and endpoint isolation

**What to build:** The API carries an `Mcp` configuration section and a flag that genuinely switches the feature off. With the flag off the MCP and OAuth paths do not exist and say so; with it on but misconfigured, the app refuses to start rather than failing later inside Claude's UI.

Nothing MCP-specific works yet — this is the foundation the rest mounts onto.

**Blocked by:** None — can start immediately

**Status:** open

- [ ] `ModelContextProtocol.AspNetCore` is added to `Directory.Packages.props` as a `PackageVersion` (central package management is in use) and referenced by `FoodDiary.API`
- [ ] A top-level `Mcp` section exists alongside `Auth` and `GoogleAuth`, bound to an options type in `FoodDiary.API/Mcp/`: `Enabled` (default `false`), `BaseUrl`, `ClientId`, `ClientSecret`, `AccessTokenLifetime` (`01:00:00`), `RefreshTokenLifetime` (`30.00:00:00`)
- [ ] `ClientSecret` is never written to `appsettings.json` — user-secrets locally, `Mcp__ClientSecret` in Docker
- [ ] With `Enabled=true` and any of `BaseUrl`, `ClientId` or `ClientSecret` missing, startup fails with a message naming the missing keys
- [ ] With `Enabled=false`, `/mcp`, `/authorize`, `/token` and `/.well-known/*` return **404** from a terminal branch registered ahead of `UseSpa`. Verify by hand that they do not return `index.html` — not mapping them is not sufficient, the SPA catch-all answers them otherwise
- [ ] `dotnet build` and `dotnet test` pass
