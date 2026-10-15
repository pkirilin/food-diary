# 01 — Rotating refresh tokens for all MCP Clients

**What to build:** An MCP Client that keeps refreshing never has to reconnect. Every refresh returns a new access token and a new refresh token with a fresh 30-day lifetime, and each refresh token works once. If a refresh token comes back a second time, the server cancels its whole chain, so a stolen token stops working the next time either party refreshes. Refresh tokens issued before this change are refused, so existing connections sign in once after upgrading.

This applies to client-secret MCP Clients today and to CIMD MCP Clients once they exist. See the spec's "Refresh tokens" section and [ADR-0006](../../../docs/adr/0006-cimd-clients-and-rotating-refresh-tokens.md).

**Blocked by:** None — can start immediately

**Status:** resolved

- [x] The refresh token payload carries a token ID and a chain ID; the authorization-code exchange starts a new chain
- [x] A refresh response includes a new `refresh_token` in the same chain, valid for `RefreshTokenLifetime` from now
- [x] An Application-layer handler owns redemption, with three outcomes: redeemed; already redeemed (which also cancels the chain); chain already cancelled. MCP code in `FoodDiary.API` does not touch the database
- [x] Postgres stores redeemed token IDs (unique) and cancelled chain IDs, each with an expiry; a cancelled chain is kept until now plus the refresh token lifetime; expired rows are deleted on later redemptions; a new EF migration adds the tables
- [x] Two concurrent refreshes with the same token cannot both succeed
- [x] Every outcome except "redeemed" returns `invalid_grant`
- [x] A refresh token without a token ID or chain ID is refused with `invalid_grant`
- [x] Component scenarios: rotation returns a working new refresh token; reusing an old token cancels the chain, so the newest token also fails; a pre-upgrade refresh token is refused; a refresh token past its lifetime is refused
- [x] `docs/guide/mcp-server.md` says that existing connections must sign in once after upgrading to this version
- [x] Backend build and all backend tests pass
