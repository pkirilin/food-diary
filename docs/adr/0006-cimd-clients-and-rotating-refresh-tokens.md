# Accept CIMD clients with a live fetch; rotate refresh tokens

Status: accepted (2026-10-15)
Supersedes the Client ID Metadata Documents and public-client parts of ADR 0003.

ADR 0003 limited MCP Clients to an owner-configured set with a client secret. Some MCP
Clients cannot use that: ChatBox offers no way to enter a client ID, always registers as a
public client (`token_endpoint_auth_method: none`), and supports only Client ID Metadata
Documents (CIMD) or Dynamic Client Registration. The authorization server now also accepts
CIMD clients by fetching the metadata document at the `client_id` URL. Client-secret clients
in `Mcp:Clients` are unchanged, and the two are equal options: no configuration is needed to
use CIMD.

## Considered options

**Dynamic Client Registration.** Still rejected, for the reasons in ADR 0003: an open
`/register` endpoint, a new stored client on every reconnection, and deprecation in the MCP
specification in favour of CIMD.

**Pin CIMD clients in `Mcp:Clients` and never fetch.** No SSRF surface, no consent page,
and the "owner configures every client" model stays intact. Rejected because the owner must
then find and copy each client's redirect URI before it can connect. That is a setup step
the client-secret path does not have, and it is behaviour no other CIMD authorization server
has.

## Consequences

**Consent is now required for CIMD clients.** ADR 0003 approved automatically because a
client existed only when the owner had configured it. A `client_id` URL is chosen by whoever
builds the link, so a signed-in owner would otherwise grant access to any site with one
click. CIMD clients get a consent page on every sign-in, and client-secret clients still
approve automatically. The consent page is part of the SPA. It relies on the `SameSite=Lax`
auth cookie, a JSON-only approve endpoint and a protected, single-use consent request
instead of antiforgery tokens.

**The fetch happens only after sign-in.** Validating a CIMD client needs its document, so
`/authorize` signs the owner in and checks `Auth:AllowedEmails` before it fetches anything.
Only the owner can make the server send a request. The fetch follows the SSRF rules of the
CIMD draft: no redirects, no special-use IP addresses (checked at connect time), and at most
5 KB.

**Two SHOULDs are not followed.** The draft recommends caching metadata documents and
prefetching `logo_uri`. A single-user server sees about one `/authorize` per sign-in, so
a cache would add expiry and staleness bugs and save nothing. The logo is loaded by the
owner's browser instead of the server, so it adds no second server-side fetch.

**Refresh tokens rotate for every client, and that needs a store.** The MCP specification
requires rotation for public clients. Each refresh token is single-use and is recorded in
Postgres. A token presented a second time cancels its whole chain, so a stolen token ends
the next time either party refreshes. Each new token gets a fresh 30-day lifetime, so an
MCP Client that keeps refreshing never has to reconnect. This is the first table the
authorization server owns: ADR 0003's "no store" no longer holds for refresh tokens. It
still holds for authorization codes and access tokens.

**Existing connections reconnect once.** Refresh tokens issued before rotation carry no
chain, and they are rejected rather than migrated.
