# 07 — Component tests and documentation

**What to build:** Every tool and prompt is covered by a component test that drives a real MCP client, the OAuth handshake is covered by a test that fails if the SPA catch-all ever swallows the discovery endpoints again, and the new environment variables are documented.

The catch-all swallowing `/.well-known` is the single most likely way a future change silently breaks the connector — it was already hit once during prototyping.

Scenario list, the authentication constraint and the gap it leaves are in [spec.md](../spec.md) § Testing.

**Blocked by:** 04, 05, 06

**Status:** open

- [ ] `Scenarios/Mcp/McpApiTests.cs` + `McpApiContext.cs` follow the existing Given/When/Then DSL and seed through `Create.Product` / `Create.Note` with `Given_products` / `Given_notes`
- [ ] `appsettings.ComponentTests.json` sets `Mcp:Enabled`, `Mcp:BaseUrl` (`http://localhost`) and **overrides** `Mcp:Clients:0` — arrays merge by index, so the suite ends up with exactly one client, as production does
- [ ] Case 1: `/authorize` → `/token` returns an access token and a refresh token. `AllowAutoRedirect = false`; read the code from the `Location` header
- [ ] Cases 2–4: a real `McpClient` over `HttpClientTransport(options, Factory.CreateClient())` asserts `tools/list` contains both tools, `tools/call get_food_logs` and `tools/call list_products` return the seeded rows, and `prompts/list` + `prompts/get nutrition_report` resolve. Assert the wiring only — exhaustive shape assertions belong in `FoodDiary.UnitTests`
- [ ] Case 5: an unauthenticated call to `/mcp` returns `401` with `WWW-Authenticate: Bearer resource_metadata="…"`, the URL resolves to a document rather than `index.html`, and its `resource` matches `{Mcp:BaseUrl}/mcp`
- [ ] Case 6: with `Mcp:Enabled=false` those paths return `404`, not the SPA page
- [ ] Case 7: exchanging one authorization code twice fails the second time
- [ ] Cases 2–7 do **not** call `Given_authenticated_user()`. The fake auth resolves every scheme to the Google handler and makes `ChallengeAsync` a no-op, so calling it would make these cases pass against a broken token pipeline and a missing 401
- [ ] The token service that cases 2–4 resolve from `Factory.Services` is `public`. Do not add `InternalsVisibleTo` to `FoodDiary.API`
- [ ] `.claude/rules/backend.md`'s happy-path rule is extended to cover MCP tools and prompts
- [ ] Component tests need Docker via Testcontainers. If Docker is unavailable, **stop and ask** — per `CLAUDE.md`, never skip the suite or substitute a non-Docker path
- [ ] `README.md` gains the `Mcp:*` variables in its environment table, with the Docker spellings including `Mcp__Clients__0__ClientId` and `Mcp__Clients__0__ClientSecret`
- [ ] `CLAUDE.md` gains the required user-secrets for a locally enabled MCP server, alongside the existing `Auth:AllowedEmails` and `ConnectionStrings:Default` entries
- [ ] Documentation is checked against actual behaviour — `.claude/rules/coding.md` forbids leaving docs contradicting the code
- [ ] Connect the real connector from Claude once against the deployed instance and run one question end to end
- [ ] `dotnet build` and `dotnet test` pass
