# FoodDiary.API is its own OAuth authorization server

Status: accepted (2026-09-10)

Exposing the diary to Claude as a remote MCP connector puts a personal food log on the
public internet, so the `/mcp` endpoint needs authorization. `FoodDiary.API` implements a
minimal OAuth authorization server itself — `/authorize`, `/token`, and RFC 8414
discovery — alongside the resource server it already is, with a single pre-registered
client whose ID and secret are pasted into Claude's connector settings. Access and
refresh tokens are **opaque blobs produced by `IDataProtector`**, not JWTs.

Writing an authorization server is normally the wrong instinct. It is the right one here
only because a specific set of facts collapses the usual reasons not to, and those facts
are what this record exists to preserve.

## Considered options

**No authorization at all.** The original prototype went this way, and the leftover
middleware that 404s `/.well-known` so the SPA catch-all cannot swallow it is still in the
feature note. Rejected outright: it publishes years of personal health data to anyone who
finds the URL.

**A shared secret in the URL, or `static_headers`.** Secret-in-URL leaks through logs,
history and referrers. `static_headers` is a beta connector type entered by an
organisation admin, which is not a shape that fits a personal account, and it was never
verified to work for one.

**Google as the authorization server.** This was the option we most wanted, since the app
already signs in with Google and the allowlist already lives there. Two independent facts
rule it out, and neither is fixable from either side.

The fatal one is audience binding. MCP requires a resource server to accept only tokens
issued for itself, per RFC 8707. A Google access token's `aud` is the OAuth **client ID**,
never a resource URI, and Google's authorization endpoint does not accept the `resource`
parameter — so the strongest check we could perform is "issued to our Google client", which
the SPA's own login already satisfies. The access token sitting in every signed-in user's
auth cookie would pass. That is the token-passthrough anti-pattern the MCP security document
forbids outright. Microsoft Entra can act as an MCP authorization server because an
Application ID URI gives the token a resource-specific audience; Google has no equivalent.

The second is refresh tokens. Google issues one only when the authorization request carries
`access_type=offline` — a Google-specific parameter that is in no OAuth or OIDC
specification and that no MCP client emits. Google does not implement the OIDC
`offline_access` scope at all; it advertises only `openid`, `email` and `profile` in the
OIDC document and omits `scopes_supported` entirely from the RFC 8414 document that clients
read first. The parameter originates in the client's request, so no server-side
configuration of ours can supply it. Google access tokens expire after one hour, so the
connection would die hourly with a fresh consent screen.

Two lesser problems follow from the same root: Google's scope namespace is its own API
surface, so a `food:read` scope cannot exist, and with no `/authorize` of our own the
`Auth:AllowedEmails` check would have to move to a `tokeninfo` call on every MCP request.

None of this is a gap in Google's OAuth implementation — Google supports S256 PKCE, client
secrets, `authorization_response_iss_parameter_supported`, and serves RFC 8414 metadata at
the well-known path. It is an identity provider for Google's own APIs, and MCP needs an
authorization server for ours.

**A separate identity provider — Keycloak, Authentik, Zitadel.** Correct in the abstract
and the standard answer to "don't write an authorization server". Rejected because it adds
a container, a database and an upgrade obligation to a self-hosted app that currently runs
as one API plus one Postgres, and because it cuts directly against the effort to remove
commercial and operational dependencies from this deployment.

**Dynamic Client Registration (RFC 7591).** The default path for public connectors, and it
is what Claude uses when nothing else is offered. It needs an open `POST /register`
endpoint and somewhere to store the clients it creates, and it registers a fresh client on
every reconnection — unbounded rows for what is permanently one client. As of MCP
specification revision 2026-07-28 it is additionally **deprecated** in favour of Client ID
Metadata Documents, and pre-registration is priority 1 in the specification's own
client-registration selection order — ahead of CIMD and DCR. The chosen path is the spec's
preferred one, not a deviation from it.

**Client ID Metadata Documents.** Needs no registration endpoint, but forces a public
client in practice — the specification permits `private_key_jwt`, but Claude selects CIMD
only when the authorization server advertises `"none"` in
`token_endpoint_auth_methods_supported` — and requires the authorization server to fetch a
URL supplied by the caller, which is SSRF surface pointed at our own network.

## Consequences

Claude's custom connectors accept a user-supplied Client ID and Secret, which is what
makes the chosen path viable: pre-registration is one config value with no endpoint and
no store, and it is the only option of the three that permits a client secret. This works
because there is exactly one client and exactly one user. **If this ever serves more than
one person, that assumption breaks first** and DCR becomes the right answer.

Consent auto-approves once the Google cookie challenge and `Auth:AllowedEmails` both pass.
There is no consent page. The safety comes from validating `redirect_uri` against the one
pre-registered Claude callback and requiring PKCE S256, not from a button that the single
user would reflexively click.

Tokens are opaque because the authorization server and the resource server are the same
process. JWT exists so a *different* service can verify a token without calling the issuer;
with no second party, it buys nothing and costs a signing secret plus a rotation story.
`FoodDiaryContext` already implements `IDataProtectionKeyContext` and the `DataProtectionKeys`
table already persists the key ring across redeploys, so `IDataProtector` adds no storage,
no migration and no new secret. The MCP authorization specification mandates nothing about
token format — only `Authorization: Bearer` transport, server-side validation, and RFC 8707
audience binding — and RFC 6750 Bearer tokens are opaque to clients by definition.

The cost is revocation. Neither an opaque DataProtection token nor a JWT can be revoked
without a store, and rotating the key ring to invalidate tokens would also invalidate every
auth cookie, since they share it. The kill switch is `Mcp:Enabled=false` plus deleting the
connector in Claude, and access tokens live one hour. **A denylist is the first thing to add
if tokens ever need revoking individually.**

Authorization codes are stateless blobs, which cannot be single-use on their own. OAuth 2.1
requires that they are, so the code id also goes into `IMemoryCache` and is removed on first
exchange — no table, at the price of codes in flight during a redeploy failing inside a
60-second window.

The authorization server, the resource server and the SPA now share a process and a URL
space, so every OAuth and MCP path **must** be mapped ahead of `UseSpa`. The catch-all
otherwise answers discovery probes with `index.html` and clients hang instead of failing
cleanly. This is the single most likely way a future change breaks the connector.
