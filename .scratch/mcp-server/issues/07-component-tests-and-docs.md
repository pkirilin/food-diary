# 07 — Component tests and documentation

**What to build:** Every tool and prompt is covered by a component test that drives a real MCP client, the OAuth handshake is covered by a test that fails if the SPA catch-all ever swallows the discovery endpoints again, and the new environment variables are documented.

The catch-all swallowing `/.well-known` is the single most likely way a future change silently breaks the connector — it was already hit once during prototyping.

Scenario list, the authentication constraint and the gap it leaves are in [spec.md](../spec.md) § Testing.

**Blocked by:** 04, 05, 06

**Status:** open

- [x] `Scenarios/Mcp/McpApiTests.cs` + `McpApiContext.cs` follow the existing Given/When/Then DSL and seed through `Create.Product` / `Create.Note` with `Given_products` / `Given_notes`
- [x] `appsettings.ComponentTests.json` sets `Mcp:Enabled`, `Mcp:BaseUrl` (`http://localhost`) and **overrides** `Mcp:Clients:0` — arrays merge by index, so the suite ends up with exactly one client, as production does
- [x] Case 1: `/authorize` → `/token` returns an access token and a refresh token. `AllowAutoRedirect = false`; read the code from the `Location` header
- [x] Cases 2–4: a real `McpClient` over `HttpClientTransport(options, Factory.CreateClient())` asserts `tools/list` contains both tools, `tools/call get_food_logs` and `tools/call list_products` return the seeded rows, and `prompts/list` + `prompts/get nutrition_report` resolve. Assert the wiring only — exhaustive shape assertions belong in `FoodDiary.UnitTests`
- [x] Case 5: an unauthenticated call to `/mcp` returns `401` with `WWW-Authenticate: Bearer resource_metadata="…"`, the URL resolves to a document rather than `index.html`, and its `resource` matches `{Mcp:BaseUrl}/mcp`
- [x] Case 6: with `Mcp:Enabled=false` those paths return `404`, not the SPA page
- [x] Case 7: exchanging one authorization code twice fails the second time
- [x] Cases 2–7 do **not** call `Given_authenticated_user()`. The fake auth resolves every scheme to the Google handler and makes `ChallengeAsync` a no-op, so calling it would make these cases pass against a broken token pipeline and a missing 401
- [x] The token service that cases 2–4 resolve from `Factory.Services` is `public`. Do not add `InternalsVisibleTo` to `FoodDiary.API`
- [x] `.claude/rules/backend.md`'s happy-path rule is extended to cover MCP tools and prompts
- [x] Component tests need Docker via Testcontainers. If Docker is unavailable, **stop and ask** — per `CLAUDE.md`, never skip the suite or substitute a non-Docker path
- [x] `README.md` gains the `Mcp:*` variables in its environment table, with the Docker spellings including `Mcp__Clients__0__ClientId` and `Mcp__Clients__0__ClientSecret`
- [x] `CLAUDE.md` gains the required user-secrets for a locally enabled MCP server, alongside the existing `Auth:AllowedEmails` and `ConnectionStrings:Default` entries
- [x] Documentation is checked against actual behaviour — `.claude/rules/coding.md` forbids leaving docs contradicting the code
- [ ] Connect the real connector from Claude once against the deployed instance and run one question end to end
- [x] `dotnet build` and `dotnet test` pass

## Comments

- Done in 02: the `appsettings.ComponentTests.json` override, case 1 and case 7 already live in `Scenarios/Mcp/McpApiTests.cs`, alongside the refresh grant, RFC 8414 metadata and error-redirect `iss` scenarios. Extend that file rather than re-adding them.
- Done in 03: case 5, plus `The_client_with_access_token_can_connect` — a real `McpClient` over `HttpClientTransport(options, Factory.CreateClient())` with a token minted through `McpTokenService`, which 04–06 can extend with `tools/list` and `prompts/list` — and a `403` scenario for a token whose email is no longer in `Auth:AllowedEmails`.
- Done in 04: the `get_food_logs` half of case 2 — `The_client_can_get_food_logs` seeds a note through `Given_notes`, lists tools with a real `McpClient` and calls the listed tool. `The_client_is_told_to_split_food_logs_range_wider_than_31_days` asserts the cap arrives as `isError`.
- Done in 05: the `list_products` half of case 2 — `The_client_can_list_products` seeds products through `Given_products` and calls the listed tool. Both tool scenarios assert through `Then_mcp_client_lists_tools` that `tools/list` holds exactly `get_food_logs` and `list_products`.
- Done in 06: case 4 — `The_client_can_get_nutrition_report_prompt` lists prompts with a real `McpClient`, asserts `prompts/list` holds exactly `nutrition_report`, and gets it with a `period`.
- Done in 07: case 6 is `The_client_cannot_find_mcp_server_when_it_is_disabled`, over `POST /mcp`, `GET` on both discovery documents, `GET /authorize` and `POST /token`. With `UseNotFoundForMcpAndOAuthPaths` removed, all five fail and the `GET`s come back `200` from the SPA catch-all.
- Done in 07: `README.md` had no backend environment table, so the `Mcp:*` keys and their Docker spellings went into a new "Connecting Claude" section, with the optional user-secrets added to the development setup. The development secrets block was also missing its closing code fence.
- Open: the end-to-end check against the deployed instance needs a person at Claude's connector settings. `docker-compose.base.yml` and `.env.example` still carry no `Mcp__*` entries (see 01).
