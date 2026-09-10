# 07 — Handshake component test and documentation

**What to build:** The OAuth handshake is covered by a test that fails if the SPA catch-all ever swallows the discovery endpoints again, and the new environment variables are documented.

The catch-all swallowing `/.well-known` is the single most likely way a future change silently breaks the connector — it was already hit once during prototyping.

**Blocked by:** 04, 05, 06

**Status:** open

- [ ] A `FoodDiary.ComponentTests` case asserts that an unauthenticated call to `/mcp` returns `401` with `WWW-Authenticate: Bearer resource_metadata="…"`, that the URL resolves to a document rather than `index.html`, and that its `resource` matches `{Mcp:BaseUrl}/mcp`
- [ ] A case asserts that with `Mcp:Enabled=false` those paths return `404`, not the SPA page
- [ ] Component tests need Docker via Testcontainers. If Docker is unavailable, **stop and ask** — per `CLAUDE.md`, never skip the suite or substitute a non-Docker path
- [ ] `README.md` gains the `Mcp:*` variables in its environment table, with the Docker `Mcp__Key` spellings
- [ ] `CLAUDE.md` gains the required user-secrets for a locally enabled MCP server, alongside the existing `Auth:AllowedEmails` and `ConnectionStrings:Default` entries
- [ ] Documentation is checked against actual behaviour — `.claude/rules/coding.md` forbids leaving docs contradicting the code
- [ ] Connect the real connector from Claude once against the deployed instance and run one question end to end
- [ ] `dotnet build` and `dotnet test` pass
