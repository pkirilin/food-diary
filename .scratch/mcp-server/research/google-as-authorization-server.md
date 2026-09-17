# Research: can Google be the OAuth authorization server for the MCP server?

Date: 2026-09-11. All live fetches timestamped in [§9 Sources](#9-sources).

> **Location note.** `docs/agents/issue-tracker.md` defines `.scratch/<feature-slug>/` with `spec.md` +
> `issues/` and has no convention for research notes. `research/` is introduced here as a sibling of
> `issues/` because this file answers a question about the spec rather than tracking work against it.

---

## 1. Verdict

**The conclusion holds. The stated reason does not.**

Google cannot be the authorization server for `/mcp`, and the decision to make `FoodDiary.API` its own
authorization server survives. But the ADR and the spec both give as *the* reason a sentence that is
factually true and causally wrong:

> "its discovery document omits `offline_access` from `scopes_supported`, so Claude never requests a
> refresh token" — and then, in the ADR only: "The failure is in Google's metadata, not in our
> configuration, so there is nothing to fix on our side."

Every clause before the dash is verifiable and correct. The clause after it is false, and it is the one
that matters, because it implies a counterfactual that does not hold: **if Google added `offline_access`
to `scopes_supported` tomorrow, nothing would change.** Google does not issue refresh tokens in response
to the `offline_access` scope. It issues them in response to `access_type=offline`, a Google-specific
query parameter that is not in OAuth 2.1, not in OIDC, not in RFC 8707, and not emitted by any MCP
client. The failure is in Google's *authorization-endpoint contract*, not its metadata, and it is
unreachable from either side — we cannot inject a parameter into a request Claude builds.

The reason is also the *weakest* of the blockers. It describes a user-experience failure. The
**fatal** blocker, absent from both documents, is normative: RFC 8707 audience binding. A Google access
token's `aud` is the OAuth **client ID**, never a resource URI, so `FoodDiary.API` cannot satisfy
"MCP servers **MUST** only accept tokens specifically intended for themselves" — and because the app's
Google client is the same one the SPA logs in with, an `aud`-based check would accept the access token
already sitting in the user's own auth cookie. That is the token-passthrough anti-pattern the MCP
security document explicitly forbids.

Paste-ready replacement prose is in [§8](#8-suggested-adr--spec-amendments).

---

## 2. What actually makes Google issue a refresh token

### 2.1 The live discovery documents

Google serves **two** documents, and they are not identical. Both fetched 2026-09-11.

`https://accounts.google.com/.well-known/openid-configuration` (19:02:50Z), relevant fields verbatim:

```json
{
  "issuer": "https://accounts.google.com",
  "authorization_endpoint": "https://accounts.google.com/o/oauth2/v2/auth",
  "token_endpoint": "https://oauth2.googleapis.com/token",
  "scopes_supported": ["openid", "email", "profile"],
  "token_endpoint_auth_methods_supported": ["client_secret_post", "client_secret_basic"],
  "code_challenge_methods_supported": ["plain", "S256"],
  "grant_types_supported": [
    "authorization_code",
    "refresh_token",
    "urn:ietf:params:oauth:grant-type:device_code",
    "urn:ietf:params:oauth:grant-type:jwt-bearer"
  ],
  "authorization_response_iss_parameter_supported": true
}
```

`https://accounts.google.com/.well-known/oauth-authorization-server` (19:17:02Z) — **HTTP 200**, the
RFC 8414 path that MCP clients try *first*. Diffed against the OIDC document, it is the same document
with three fields added (`service_documentation`, `op_policy_uri`, `op_tos_uri`) and **one removed**:

```
only in openid-configuration: ['scopes_supported']
only in oauth-authorization-server: ['op_policy_uri', 'op_tos_uri', 'service_documentation']
registration_endpoint present: False
client_id_metadata_document_supported present: False
scopes_supported: None
```

Four things follow immediately:

- `grant_types_supported` **contains `refresh_token`**. Google is not claiming it cannot issue refresh
  tokens. It is advertising the grant. The repo owner's scepticism is well-founded on this point.
- `code_challenge_methods_supported` contains `S256`; `token_endpoint_auth_methods_supported` allows a
  client secret; `authorization_response_iss_parameter_supported` is `true`. Google satisfies every
  PKCE, client-auth and RFC 9207 requirement MCP imposes on an AS.
- There is **no `registration_endpoint`** (no RFC 7591 DCR) and **no
  `client_id_metadata_document_supported`** (no CIMD).
- The document an MCP client actually reads first — the RFC 8414 one — has **no `scopes_supported` at
  all**. The ADR's sentence is therefore an understatement: `offline_access` is not merely absent from
  the list; on the document that governs, the list is absent.

### 2.2 `offline_access` is not Google's mechanism — `access_type=offline` is

Google's own web-server OAuth guide, on `access_type`:

> "Set the value to `offline` if your application needs to refresh access tokens when the user is not
> present at the browser. […] This value instructs the Google authorization server to return a refresh
> token *and* an access token the first time that your application exchanges an authorization code for
> tokens."

and, unambiguously:

> "Note that the refresh token is only returned if your application set the `access_type` parameter to
> `offline` in the initial request to Google's authorization server."

The word `offline_access` **does not appear anywhere** on either Google identity page. Google's OpenID
Connect page enumerates the accepted authentication-URI parameters — `client_id`, `nonce`,
`response_type`, `redirect_uri`, `scope`, `state`, `access_type`, `claims`, `display`, `hd`,
`include_granted_scopes`, `login_hint`, `prompt`, `hl` — and constrains `scope` to:

> "The scope parameter must begin with the `openid` value and then include the `profile` value, the
> `email` value, or both."

`resource` is not on that list either. Neither is `offline_access` on any Google scope list: the
canonical scope reference is a fixed Google-published catalogue of `https://www.googleapis.com/auth/…`
strings for Google's own services, with no mechanism anywhere for an application to define a scope of
its own.

This is exactly what `access_type` is: a proprietary substitute for OIDC's `offline_access`. OIDC Core
1.0 §11 defines `offline_access` as **OPTIONAL** for an OP, and scopes it narrowly:

> "`offline_access` — OPTIONAL. This scope value requests that an OAuth 2.0 Refresh Token be issued that
> can be used to obtain an Access Token that grants access to the End-User's UserInfo Endpoint even when
> the End-User is not present (not logged in)."
>
> "The use of Refresh Tokens is not exclusive to the `offline_access` use case. The Authorization Server
> MAY grant Refresh Tokens in other contexts that are beyond the scope of this specification."

Google took the second sentence. It grants refresh tokens in a context beyond the scope of OIDC —
`access_type=offline` — and declines to implement the optional `offline_access` scope. That is
conformant, and it is also unusable by a standards-only client.

### 2.3 Could a standard OAuth 2.1 client ever get a Google refresh token?

**No.** A client that emits only spec-defined authorization parameters (`response_type`, `client_id`,
`redirect_uri`, `scope`, `state`, `code_challenge`, `code_challenge_method`, `resource`) never sends
`access_type`, and Google's documentation states the refresh token is returned **only** if
`access_type=offline` was set. The parameter originates in the client's authorization request, which the
resource server never touches — so there is no server-side configuration, in `FoodDiary.API` or
anywhere else, that can add it.

This is why the app's existing Google refresh token is not a counter-example. `Startup.cs` sets
`options.AccessType = "offline"` and `OnRedirectToAuthorizationEndpoint` forces
`prompt=select_account consent`. The app gets refresh tokens **because it is a Google-specific OAuth
client that deliberately emits Google-specific parameters.** Claude is not, and cannot be made into one.

> **Not settled from primary sources:** whether Google's authorization endpoint *errors* on
> `scope=…offline_access` or silently ignores it. A live probe
> (`accounts.google.com/o/oauth2/v2/auth?…&scope=openid email offline_access&resource=…`,
> 2026-09-11T19:13:37Z) returned `302` to
> `…/signin/oauth/error?authError=…` decoding to `invalid_client / The OAuth client was not found.` —
> Google validates `client_id` before `scope`, so the probe cannot reach scope validation without a real
> registered client. **This does not affect any conclusion**: whether ignored or rejected,
> `offline_access` does not produce a refresh token, because `access_type=offline` is the documented
> trigger. Settling it would require running one authorization request against a real Google client ID.

### 2.4 What happens when the token expires

Google Cloud's token-types reference:

> "User access tokens are opaque."
>
> "User access tokens automatically expire after one hour, but can be revoked earlier if needed."

So the ADR's "the connection dies roughly hourly" is correct. Claude's connector documentation says
"Claude refreshes tokens **reactively on a 401 response**, with a proactive refresh up to five minutes
before the stored expiry." With no refresh token stored, there is nothing to refresh and the connector
must re-run the full authorization flow. *(That last step is inference from the two facts, not a quoted
Anthropic statement — Anthropic's docs do not describe the no-refresh-token case explicitly.)*

One aside that vindicates the repo owner and is worth recording, because it would otherwise look like a
contradiction: Google normally expires refresh tokens after 7 days for apps whose consent screen is in
"Testing" — **except** for this app's exact scope set:

> "A Google Cloud Platform project with an OAuth consent screen configured for an external user type and
> a publishing status of 'Testing' is issued a refresh token expiring in 7 days, unless the only OAuth
> scopes requested are a subset of name, email address, and user profile."

`Startup.cs` requests `openid profile email` only, so the exemption applies and the existing refresh
token is long-lived. Adding a non-profile scope to the SPA's Google client in future would silently
introduce a 7-day expiry.

---

## 3. Every blocker, ranked

| # | Blocker | Verdict |
|---|---|---|
| 1 | Token audience cannot be bound to the MCP server | **Fatal — normative MUST** |
| 2 | No refresh token is obtainable by any MCP client | **Fatal in practice** |
| 3 | `food:read` cannot exist; the allowlist check has nowhere to live | **Fatal to the design** |
| 4 | `scopes_supported` absent from the RFC 8414 document | Aggravates #2; unfixable |
| 5 | Opaque tokens ⇒ a Google round-trip on every MCP request | Awkward; new failure mode |
| 6 | No DCR (`registration_endpoint` absent) | **Not a blocker** |
| 7 | No CIMD | Not a blocker |
| 8 | Redirect URI `https://claude.ai/api/mcp/auth_callback` | **Not a blocker** |

### 1. Audience binding — fatal

MCP 2026-07-28, `basic/authorization/security-considerations`:

> "MCP servers **MUST** only accept tokens specifically intended for themselves and **MUST** reject
> tokens that do not include them in the audience claim or otherwise verify that they are the intended
> recipient of the token."

and in `basic/authorization` (Token Handling):

> "MCP servers, acting in their role as an OAuth 2.1 resource server, **MUST** validate access tokens
> […] MCP servers **MUST** validate that access tokens were issued specifically for them as the intended
> audience, according to RFC 8707 Section 2."

RFC 8707 §2 puts the obligation on the AS: "The authorization server SHOULD audience-restrict issued
access tokens to the resource(s) indicated by the `resource` parameter." Google does not accept
`resource` (it is absent from the documented parameter list, §2.2), and Google's own reference states
what the audience actually is:

> `aud` (Audience): "The OAuth client that this token is for, identified by its OAuth client ID."

So the strongest audience check `FoodDiary.API` could perform is `aud == <our Google client ID>`. That
is not "issued for this MCP server" — it is "issued to this OAuth client", and **the SPA's browser login
uses the same client**. `Startup.cs` sets `SaveTokens = true`, so a Google access token with exactly
that `aud` is already stored in every signed-in user's auth cookie. Presenting it at `/mcp` would pass.
The MCP security best-practices document names this:

> "'Token passthrough' is an anti-pattern where an MCP server accepts tokens from an MCP client without
> validating that the tokens were properly issued *to the MCP server* […] **Audience validation
> failures.** When an MCP server doesn't verify that tokens were specifically intended for it […] it may
> accept tokens originally issued for other services. This breaks a fundamental OAuth security
> boundary."
>
> "MCP servers **MUST NOT** accept any tokens that were not explicitly issued for the MCP server."

**Is this "the confused deputy problem the spec's security section warns about"?** No — and the
distinction is worth keeping straight. The MCP confused deputy is specific: an *MCP proxy server* holding
a static client ID at a third-party AS, combined with DCR'd downstream clients and a consent cookie.
Google-as-AS has no proxy in the middle, so that attack shape does not apply. What applies is the
*sibling* failure in the same document — audience-validation failure and token passthrough. Citing
"confused deputy" here would be citing the wrong section.

The contrast that makes this concrete is Microsoft Entra, which Anthropic documents as a working
cross-host AS:

> "If your authorization server is Microsoft Entra ID, you must also register the MCP server URL as an
> Application ID URI on your Entra app registration, or the token request fails with `AADSTS9010010`."

Entra can be an MCP authorization server precisely because it lets you declare the resource so the token
carries a resource-specific `aud`. **Google has no equivalent of an Application ID URI.** That single
sentence is the cleanest statement of why Google is different from other IdPs people successfully
delegate to.

### 2. No refresh token — fatal in practice

Covered in §2. One hour, then a full re-authorization. On a personal diary that is a connector the user
re-approves several times a day.

### 3. Custom scopes and the allowlist — fatal to the design

Google's scope namespace is Google's own API surface: a fixed published catalogue of
`https://www.googleapis.com/auth/…` values plus `openid`/`profile`/`email`, with no documented facility
for an application to mint its own. `food:read` cannot be defined, so the spec's `scopes_supported:
["food:read"]` would have to become `["openid", "email", "profile"]` — scopes that say nothing about
diary access, granted to any Google account that completes the flow.

The second-order consequence is worse. With Google as AS there is no `/authorize` of ours, so
`Auth:AllowedEmails` has nowhere to be enforced at issuance time. It would have to move to the resource
server, per request, which means resolving the caller's email from an opaque token on every MCP call —
i.e. blocker 5.

### 4. `scopes_supported` missing from the RFC 8414 document

MCP clients try `/.well-known/oauth-authorization-server` **first** (MCP 2026-07-28,
`authorization-server-discovery`: for issuers without a path component, clients "**MUST** try: 1. OAuth
2.0 Authorization Server Metadata […] 2. OpenID Connect Discovery 1.0"). Google's RFC 8414 document omits
`scopes_supported` entirely (§2.1), so the `offline_access` gate in every MCP client fails on a missing
field rather than a missing list entry. Not independently fatal — it only makes #2 more certain.

### 5. Opaque tokens ⇒ a Google call per request — awkward, and a new outage mode

Google access tokens are documented as opaque. Validating one means calling
`https://oauth2.googleapis.com/tokeninfo?access_token=…` (live probe with a bogus token,
2026-09-11T19:09:32Z, returns `HTTP 400 {"error":"invalid_token","error_description":"Invalid Value"}`),
which returns `aud`, `azp`, `sub`, `scope`, `exp`, `expires_in`, `email`, `email_verified`. That is a
network round trip to Google inside every `/mcp` request, it is where the `Auth:AllowedEmails` check
would have to live, and it makes a Google outage an MCP outage. Contrast with the spec's chosen design,
where `IDataProtector.Unprotect` is a local CPU operation.

### 6. No Dynamic Client Registration — not a blocker

Google publishes no `registration_endpoint`. MCP 2026-07-28 `client-registration` gives a four-step
priority order ending in "4. **Prompt the user to enter the client information** if no other option is
available", and Anthropic supports exactly that:

> "When a user adds a custom connector by URL, the OAuth Client Secret field is **optional**. […]
> Supplying your own pre-registered client ID (and secret, if your server requires one) as static client
> credentials is a good option when you want a stable OAuth client per organization: it avoids dynamic
> client registration entirely."

So the ADR's reasoning about pre-registration is sound — and, as §7 shows, DCR is now *deprecated*
anyway. The absence of DCR at Google is genuinely not the problem.

### 7. No CIMD — not a blocker

Google advertises no `client_id_metadata_document_supported`. Anthropic: "Claude selects CIMD only when
your authorization server metadata advertises **both** `"client_id_metadata_document_supported": true`
**and** `"none"` in `token_endpoint_auth_methods_supported`. If either is missing, Claude falls back to
DCR." Google fails both conditions, and then fails DCR, and then falls through to manual credentials.
Which works.

### 8. Redirect URI — not a blocker

`https://claude.ai/api/mcp/auth_callback` clears every documented Google restriction: HTTPS; host is not
a raw IP; `.ai` is on the public suffix list; not `googleusercontent.com`; not a URL shortener; no
fragment; no path traversal; no wildcard or invalid percent-encoding. **Google does not require domain
ownership for a redirect URI**, so registering Anthropic's callback in our own Cloud project is
permitted. Anything asserting otherwise is wrong.

---

## 4. What MCP clients really send

Three different things are at stake and they disagree — which is the whole point of this section.

### 4.1 What the spec normatively requires (2026-07-28)

On the `resource` parameter, `basic/authorization`:

> "MCP clients **MUST** implement Resource Indicators for OAuth 2.0 as defined in RFC 8707 […] The
> `resource` parameter: 1. **MUST** be included in both authorization requests and token requests.
> 2. **MUST** identify the MCP server that the client intends to use the token with. 3. **MUST** use the
> canonical URI of the MCP server […]"
>
> "MCP clients **MUST** send this parameter regardless of whether authorization servers support it."

On refresh tokens — a section that **did not exist before this revision** (see §7):

> **MCP Clients** that desire refresh tokens:
> - **MUST** keep refresh tokens confidential in transit and storage […]
> - **SHOULD** include `refresh_token` in their `grant_types` client metadata
> - **MAY** add `offline_access` to the `scope` parameter of the authorization and token requests **when
>   the Authorization Server metadata contains it in `scopes_supported`**
> - **MUST NOT** assume refresh tokens will be issued; the AS retains discretion
>
> **MCP Servers** (Protected Resources) **SHOULD NOT** include `offline_access` in `WWW-Authenticate`
> scope or Protected Resource Metadata `scopes_supported`, as refresh tokens are not a resource
> requirement.

Note what this does and does not say. Requesting a refresh token is a **MAY**, gated on AS metadata, and
the spec explicitly warns the AS "retains discretion". Nothing in MCP requires an AS to issue refresh
tokens at all. So a strict reading is: Google is *conformant*; the connection just dies hourly.

### 4.2 What Claude's implementation does

From Anthropic's connector authentication page, verbatim:

> "Claude also appends `offline_access` when your authorization server metadata lists it in
> `scopes_supported`, to obtain a refresh token."

> "Claude includes a PKCE `code_challenge` with `code_challenge_method=S256` on every authorization
> request, regardless of which registration mechanism it uses."

> "To control which scopes Claude requests, include a `scope` parameter in the `WWW-Authenticate` header
> on your `401` response. If you don't, Claude requests the scopes your protected resource metadata
> advertises in `scopes_supported`."

> "Claude waits up to **10 seconds** for a response from your OAuth discovery, registration, and token
> endpoints, and up to **30 seconds** for refresh token requests."

> "A cross-host authorization server doesn't need anything special on its own. The `authorization_servers`
> field in your protected resource metadata tells Claude where the authorization server is, and Claude
> resolves it regardless of which host it points at."

> "The metadata's `authorization_servers` field must list your authorization server's issuer URL. If you
> list more than one, Claude uses the first entry and does not fall back to later entries."

> "that host must also be reachable from Anthropic's published egress range."

**This is the sentence that exonerates the ADR's observation and condemns its explanation.** The ADR
correctly describes Claude's gate. It then attributes the failure to that gate, when in fact clearing the
gate would change nothing at Google's end. Anthropic's docs say nothing about `access_type`, because no
MCP client has any reason to know it exists.

Everything the spec lists as required of an AS, Claude also requires, plus: the PRM `resource` field must
match the MCP URL exactly as typed, the AS host must be reachable from `160.79.104.0/21`, and
`/token` must parse `application/x-www-form-urlencoded`.

### 4.3 What the reference implementations send

**TypeScript SDK** (`packages/client/src/client/auth.ts`, `main`, 2527 lines, read 2026-09-11). The
`determineScope` function is the authority:

```ts
// Scope selection priority (MCP spec):
//   1. WWW-Authenticate header scope
//   2. PRM scopes_supported
//   3. clientMetadata.scope (SDK fallback)
//   4. Omit scope parameter
let effectiveScope = requestedScope || resourceMetadata?.scopes_supported?.join(' ') || clientMetadata.scope;

// SEP-2207: Append offline_access when the AS advertises it and the client
// supports the refresh_token grant. […]
if (
    effectiveScope &&
    authServerMetadata?.scopes_supported?.includes('offline_access') &&
    !effectiveScope.split(' ').includes('offline_access') &&
    clientMetadata.grant_types?.includes('refresh_token')
) {
    effectiveScope = `${effectiveScope} offline_access`;
}
```

and the authorization URL builder:

```ts
authorizationUrl.searchParams.set('response_type', AUTHORIZATION_CODE_RESPONSE_TYPE);
authorizationUrl.searchParams.set('client_id', clientInformation.client_id);
authorizationUrl.searchParams.set('code_challenge', codeChallenge);
authorizationUrl.searchParams.set('code_challenge_method', AUTHORIZATION_CODE_CHALLENGE_METHOD);
authorizationUrl.searchParams.set('redirect_uri', String(redirectUrl));
if (state)  authorizationUrl.searchParams.set('state', state);
if (scope)  authorizationUrl.searchParams.set('scope', scope);
if (scope?.split(' ').includes('offline_access')) {
    // […] set the prompt to "consent" to ensure the user is prompted to grant offline access
    authorizationUrl.searchParams.append('prompt', 'consent');
}
if (resource) authorizationUrl.searchParams.set('resource', resourceIndicatorToString(resource));
```

That is the complete parameter set. `access_type` never appears — `rg 'access_type'` over the file
returns nothing. Note also that the SDK sends `prompt=consent` alongside `offline_access`, satisfying
OIDC Core §11 — so even the "right" OIDC request shape reaches Google fully formed and still yields no
refresh token, because `access_type` is missing.

**C# SDK** (`ModelContextProtocol.Core/Authentication/ClientOAuthProvider.cs`, `main`, 1595 lines): same
picture. `AugmentScopeWithOfflineAccess` gated on the AS advertising it; `resource` set on the query
(line 768) and on token/refresh form bodies (lines 684, 816); `rg 'access_type'` returns **nothing**.

**MCP Inspector** 2.6.0 depends on `@modelcontextprotocol/client` 2.0.0 — it *is* the TypeScript SDK path
above, plus its own CIMD pre-registration gated on `client_id_metadata_document_supported`
(`clients/web/src/test/core/auth/cimd.test.ts`).

**VS Code / Copilot** implements the **2025-06-18** revision, and "first starts with a Dynamic Client
Registration (DCR) handshake and then falls back to a client-credentials workflow if the IdP does not
support DCR", with built-in support for GitHub and Microsoft Entra. Nothing about `access_type` there
either — and its built-in IdPs are exactly the two that can express a resource audience.

**Conclusion for §4:** across every client examined, the authorization request is composed only of
OAuth 2.1 + RFC 8707 + (conditionally) `offline_access`/`prompt=consent`. No client emits
`access_type`, and no client has a hook to make it do so.

---

## 5. Can `Startup.cs` L51–95 fix it?

**No, and not partially.** The three things that would have to change are all outside the process:

1. Google's discovery documents are served by Google.
2. `access_type=offline` must appear in the request **Claude** builds. `options.AccessType = "offline"`
   affects only the challenge URL that `GoogleHandler.BuildChallengeUrl` generates for the SPA's own
   browser login.
3. The `aud` of a Google token is decided by Google's token endpoint.

`AddGoogle` is a **relying-party** handler. It configures `FoodDiary.API` as a *client of* Google. There
is no option on it, or on any ASP.NET Core type, that makes anything an authorization server. See the
option-by-option table in §6.

### 5.1 The AS façade — what is unavoidable

This is what the ADR already proposes, and the quantification confirms it is small:

| Piece | Unavoidable? | Note |
|---|---|---|
| `GET /.well-known/oauth-authorization-server` | Yes | A static JSON literal built from `Mcp:BaseUrl`. MCP 2026-07-28: AS "**MUST** provide at least one of" RFC 8414 or OIDC discovery |
| `GET /.well-known/oauth-protected-resource` | Yes | Served by the C# SDK from `McpAuthenticationOptions.ResourceMetadata` — no hand-written code |
| `GET /authorize` | Yes | Cookie challenge + allowlist + `redirect_uri`/`client_id` validation + code mint + redirect with `iss` |
| `POST /token` | Yes | Two grants, PKCE S256 verification, client-secret check |
| Consent page | **No** | Auto-approve; ADR gives the reasoning |
| Client store / `POST /register` | **No** | One pre-registered client |
| Token signing keys | **No** | `IDataProtector`; key ring already persisted in `DataProtectionKeys` |
| Revocation store | **No** in v1 | ADR already records the cost |

Two endpoints, two static documents, one `IDataProtector` purpose pair. There is no smaller shape that
satisfies the MUSTs, because the audience-binding MUST can only be satisfied by an issuer that knows what
`https://<host>/mcp` means — which is us.

### 5.2 Reusing the Google cookie session at `/authorize` — confirmed sound

`Startup.cs` L52–66 sets `SameSite = SameSiteMode.Lax`, `SecurePolicy = Always`, `HttpOnly = true`.
Claude sends the user to `/authorize` as a **top-level GET navigation** from `claude.ai`. The cookie
specification (draft-ietf-httpbis-rfc6265bis §5.5.7):

> "If the value is `Lax`, the cookie will be sent with same-site requests, and with `cross-site`
> top-level navigations."

So the cookie arrives, `AuthenticateAsync(Cookie)` succeeds if the user is already signed into the SPA,
and `/authorize` needs no fresh Google consent. The spec's assumption holds. (`Strict` would have broken
it; `None` would have been unnecessary and worse.)

### 5.3 Reusing the already-stored Google refresh token — no

`SaveTokens = true` puts Google's refresh token in the cookie's `AuthenticationProperties`, and
`GetAuthStatusQueryHandler` already spends it. Handing it (or a Google access token derived from it) to
Claude is ruled out three ways: it is a credential for *Google's* APIs with `aud` = our client ID and
scopes `openid profile email`, so it authorizes nothing at `/mcp`; redeeming it requires our client
secret, which Claude does not have and must not get; and MCP 2026-07-28 forbids it outright — "If the MCP
server makes requests to upstream APIs […] The MCP server **MUST NOT** pass through the token it received
from the MCP client", with the inverse (handing an upstream token downstream) covered by "MCP servers
**MUST NOT** accept any tokens that were not explicitly issued for the MCP server".

The Google refresh token stays where it is, doing what it already does: keeping the SPA session alive.

### 5.4 OpenIddict — more machinery, not less

OpenIddict's own getting-started guide requires `OpenIddict.AspNetCore` **and**
`OpenIddict.EntityFrameworkCore`, a DbContext wired to its stores, **"`Add-Migration` and
`Update-Database`"** to create its tables, and registration of signing *and* encryption credentials
(`AddDevelopmentSigningCertificate()` / `AddDevelopmentEncryptionCertificate()`, with real certificates
in production). Against the spec's plan that is: a new migration and several new tables where the plan
has none, a certificate lifecycle where the plan reuses the existing `DataProtectionKeys` key ring, and a
new configuration vocabulary — in exchange for removing roughly two endpoint handlers. For a
single-client, single-user, two-grant authorization server, it is a net increase in surface.
(OpenIddict is unambiguously the right call the moment there is more than one client, or a consent UI, or
token revocation.)

---

## 6. `Microsoft.AspNetCore.Authentication.Google` scan

**Versions** (nuget.org flat container, 2026-09-11T19:06:50Z): 288 published; latest stable **10.0.12**;
prereleases through `11.0.0-rc.1.26425.128`.

**Repo state**: `src/backend/Directory.Packages.props` pins `Microsoft.AspNetCore.Authentication.Google`
at **10.0.10**, consistent with every other `10.0.10` pin in the file. Two patch versions behind stable.
Nothing in 10.0.11/10.0.12 bears on this question; upgrading is routine housekeeping, not a fix.

**Complete option surface** (source read from `dotnet/aspnetcore@main`,
`src/Security/Authentication/Google/src/`, cross-checked against `PublicAPI.Shipped.txt`):

| Member | Declared on | What it does | Can it affect the AS-metadata / audience / refresh-token problem? |
|---|---|---|---|
| `AccessType` | `GoogleOptions` | Emits `access_type` on **our** challenge URL | **No.** Applies to the SPA's login only. Claude builds its own authorization request |
| `AuthorizationEndpoint` | `OAuthOptions` | Where *we* send the user | No. Cannot alter what Google publishes |
| `TokenEndpoint` | `OAuthOptions` | Where *we* redeem a code | No |
| `UserInformationEndpoint` | `OAuthOptions` | Where *we* read the profile | No |
| `ClientId` / `ClientSecret` | `OAuthOptions` | Our RP credentials | No |
| `Scope` | `OAuthOptions` | Scopes on *our* request | No. Cannot create a `food:read` scope at Google |
| `UsePkce` (default `true`) | `OAuthOptions` | PKCE on *our* flow | No |
| `SaveTokens` | `RemoteAuthenticationOptions` | Stores Google tokens in the cookie | No — and see §5.3 |
| `ClaimActions` | `OAuthOptions` | Maps userinfo JSON → claims | No |
| `AdditionalAuthorizationParameters` | `OAuthOptions` | Extra params on *our* challenge | **No.** Same limitation as `AccessType`: our request, not Claude's |
| `StateDataFormat` | `OAuthOptions` | Protects our `state` | No |
| `CallbackPath` (`/signin-google`) | `RemoteAuthenticationOptions` | Our RP callback | No |
| `Events.OnRedirectToAuthorizationEndpoint` | `RemoteAuthenticationOptions` | Used at L79–90 to force `prompt` | **No.** Rewrites our redirect; Claude never passes through it |
| `Events.CreatingTicket` | `OAuthEvents` | Post-userinfo hook | No |
| `GoogleChallengeProperties.{AccessType, ApprovalPrompt, IncludeGrantedScopes, LoginHint, Prompt}` | — | Per-challenge overrides of the above | No, identically |
| `GoogleDefaults.{AuthorizationEndpoint, TokenEndpoint, UserInformationEndpoint, AuthenticationScheme, DisplayName}` | — | Constants | No |

`GoogleHandler` overrides exactly two methods — `BuildChallengeUrl` (composes *our* outbound request) and
`CreateTicketAsync` (calls userinfo, runs claim actions). There is no server-side issuance code path in
the package at all.

**First-party authorization-server primitive in .NET 10: none.** `dotnet/aspnetcore@main`
`src/Security/Authentication/` contains `BearerToken`, `Certificate`, `Cookies`, `Core`,
`DeviceBoundSessions`, `Facebook`, `Google`, `JwtBearer`, `MicrosoftAccount`, `Negotiate`, `OAuth`,
`OpenIdConnect`, `Twitter`, `WsFederation` — the area README describes every one as a *handler* (client
or token-validation side). The full Microsoft-owned `Microsoft.AspNetCore.Authentication.*` package list
on nuget.org is Abstractions, Core, Cookies, Certificate, Facebook, Google, JwtBearer,
MicrosoftAccount, Negotiate, OAuth, OpenIdConnect, Twitter, WsFederation, WsFederation, plus the retired
AzureAD/AzureADB2C UI packages. None issues tokens. The ASP.NET Core 10.0 release notes list passkeys
(WebAuthn/FIDO2 in Identity), auth/authz metrics, Identity metrics, and 401/403 instead of login
redirects for API endpoints — **no OAuth authorization server, no OpenID Provider**. (Also note
`Microsoft.AspNetCore.Authentication.BearerToken` is Identity's own opaque-token scheme for
`MapIdentityApi`, not an OAuth AS: it has no `/authorize`, no PKCE, no client registry, no discovery
document.)

**Verdict: prediction confirmed.** Nothing in the package, and nothing new in .NET 10, moves this.

---

## 7. What changed in spec 2026-07-28 that bears on this decision

The authorization spec was split from one `basic/authorization.mdx` into four files —
`index`, `authorization-server-discovery`, `client-registration`, `security-considerations` — and two
changes materially touch the ADR's rejected-options list.

### 7.1 DCR is deprecated; CIMD is the recommended default

From the 2026-07-28 changelog, under **Deprecated**:

> "Deprecate the OAuth 2.0 Dynamic Client Registration Protocol (RFC7591) as a client registration
> mechanism in favor of Client ID Metadata Documents […] It remains available for backwards
> compatibility with authorization servers that do not support Client ID Metadata Documents."

and in `basic/authorization`:

> "Authorization servers and MCP clients **SHOULD** support OAuth Client ID Metadata Documents […]"
>
> "Authorization servers and MCP clients **MAY** support the OAuth 2.0 Dynamic Client Registration
> Protocol […] Note that Dynamic Client Registration is deprecated […]"

`client-registration` also states the selection order — pre-registration **first**:

> "1. Use pre-registered client information for the server if the client has it available
>  2. Use Client ID Metadata Documents if the Authorization Server indicates that it supports them […]
>  3. Use Dynamic Client Registration as a fallback […]
>  4. Prompt the user to enter the client information if no other option is available"

**Effect on the ADR:** the "Considered options" entry for DCR is now understated in one direction and
overstated in another. DCR is not merely operationally awkward for a one-client server — it is
**deprecated by the specification**, with a twelve-month minimum deprecation window under the new feature
lifecycle policy. And the chosen option, pre-registration, is not a grudging deviation: it is **priority
1** in the spec's own ordering. The ADR should say so; it currently reads as if pre-registration were the
unconventional choice.

### 7.2 CIMD's SSRF objection is now the spec's own objection

The ADR rejects CIMD partly because "it requires the authorization server to fetch a URL supplied by the
caller, which is SSRF surface pointed at our own network." The 2026-07-28 security document now says the
same thing in its own voice:

> "When an authorization server supports Client ID Metadata Documents, the authorization server takes a
> URL as input from an unknown client and fetches that URL. A malicious client could use this to trigger
> the authorization server to make requests to arbitrary URLs, such as requests to private
> administration endpoints the authorization server has access to."

The other half of the ADR's CIMD objection — "forces a public client — PKCE only, no client secret" — is
slightly too strong. The spec says clients "**MAY** use `private_key_jwt` for client authentication […]
with appropriate JWKS configuration". Practically it makes no difference here: Anthropic gates CIMD on
the AS advertising `"none"` in `token_endpoint_auth_methods_supported`, so for Claude, CIMD *does* mean a
public client. Worth a parenthetical, not a rewrite.

### 7.3 `iss` in the authorization response

Already in the spec's metadata block and issue 02, and now explicitly required to be advertised:

> "MCP authorization servers **SHOULD** include the `iss` parameter in authorization responses, including
> **error responses** […] Authorization servers that include the `iss` parameter **MUST** advertise this
> by setting `authorization_response_iss_parameter_supported` to `true` in their metadata."
>
> "A future revision of this specification is expected to upgrade authorization server inclusion of `iss`
> from **SHOULD** to **MUST**."

One gap against issue 02: the checklist says "The authorization response carries `iss`" — the spec text
says *including error responses*. Worth adding to the ticket.

### 7.4 The refresh-token section is new

`offline_access` appears **0 times** in `2025-06-18/basic/authorization.mdx` and **0 times** in
`2025-11-25/basic/authorization.mdx`; it appears in 2026-07-28 only. The entire "Refresh Tokens" section
quoted in §4.1 is new in this revision. The ADR's premise was therefore drawn from Claude's
implementation behaviour rather than from the spec — which was correct at the time, and is now backed by
normative text. Worth knowing that this rule *post-dates* the decision rather than preceding it.

### 7.5 Non-authorization changes that touch the spec's other claims

Not this note's subject, but flagged because `spec.md` asserts them: 2026-07-28 **removes protocol-level
sessions and the `Mcp-Session-Id` header** and **removes the `initialize` handshake**, adding
`server/discover`. `spec.md`'s `HttpServerSessionMode.Stateless` choice is aligned with that direction;
the ComponentTests handshake case may need rechecking against whichever protocol version the C# SDK
implements.

---

## 8. Suggested ADR / spec amendments

### 8.1 `docs/adr/0003-oauth-authorization-server-in-api.md` — replace the "Google as the authorization server" option

Current:

> **Google as the authorization server.** This was the option we most wanted, since the app already signs
> in with Google and the allowlist already lives there. It does not work: Google's discovery document
> omits `offline_access` from `scopes_supported`, so Claude never requests a refresh token, and the
> connection dies roughly hourly with a fresh consent screen. The failure is in Google's metadata, not in
> our configuration, so there is nothing to fix on our side.

Replacement:

> **Google as the authorization server.** This was the option we most wanted, since the app already signs
> in with Google and the allowlist already lives there. Two independent facts rule it out, and neither is
> fixable from either side.
>
> The fatal one is audience binding. MCP requires a resource server to accept only tokens issued for
> itself, per RFC 8707. A Google access token's `aud` is the OAuth **client ID**, never a resource URI,
> and Google's authorization endpoint does not accept the `resource` parameter — so the strongest check
> we could perform is "issued to our Google client", which the SPA's own login already satisfies. The
> access token sitting in every signed-in user's auth cookie would pass. That is the token-passthrough
> anti-pattern the MCP security document forbids outright. Microsoft Entra can act as an MCP
> authorization server because an Application ID URI gives the token a resource-specific audience; Google
> has no equivalent.
>
> The second is refresh tokens. Google issues one only when the authorization request carries
> `access_type=offline` — a Google-specific parameter that is in no OAuth or OIDC specification and that
> no MCP client emits. Google does not implement the OIDC `offline_access` scope at all; it advertises
> only `openid`, `email` and `profile` in the OIDC document and omits `scopes_supported` entirely from
> the RFC 8414 document that clients read first. The parameter originates in the client's request, so no
> server-side configuration of ours can supply it. Google access tokens expire after one hour, so the
> connection would die hourly with a fresh consent screen.
>
> Two lesser problems follow from the same root: Google's scope namespace is its own API surface, so a
> `food:read` scope cannot exist, and with no `/authorize` of our own the `Auth:AllowedEmails` check
> would have to move to a `tokeninfo` call on every MCP request.
>
> None of this is a gap in Google's OAuth implementation — Google supports S256 PKCE, client secrets,
> `authorization_response_iss_parameter_supported`, and serves RFC 8414 metadata at the well-known path.
> It is an identity provider for Google's own APIs, and MCP needs an authorization server for ours.

### 8.2 `docs/adr/0003` — amend the DCR option (currently understates the spec's position)

Append to the **Dynamic Client Registration (RFC 7591)** paragraph:

> As of MCP specification revision 2026-07-28, DCR is additionally **deprecated** in favour of Client ID
> Metadata Documents, and pre-registration is priority 1 in the specification's own client-registration
> selection order — ahead of CIMD and DCR. The chosen path is the spec's preferred one, not a deviation
> from it.

### 8.3 `docs/adr/0003` — soften one clause in the CIMD option

Change "forces a public client — PKCE only, no client secret" to:

> forces a public client in practice — the specification permits `private_key_jwt`, but Claude selects
> CIMD only when the authorization server advertises `"none"` in `token_endpoint_auth_methods_supported`

### 8.4 `.scratch/mcp-server/spec.md` § Authorization — replace the opening sentence

Current:

> `FoodDiary.API` is both the authorization server and the resource server. Google **cannot** be the
> authorization server: its discovery document omits `offline_access` from `scopes_supported`, so Claude
> never requests a refresh token and the user re-consents every hour.

Replacement:

> `FoodDiary.API` is both the authorization server and the resource server. Google **cannot** be the
> authorization server: a Google access token's `aud` is the OAuth client ID rather than a resource URI,
> so the RFC 8707 audience binding that MCP requires is unsatisfiable, and Google issues refresh tokens
> only for the non-standard `access_type=offline` parameter that no MCP client sends — so the connection
> would also die hourly. See [ADR 0003](../../docs/adr/0003-oauth-authorization-server-in-api.md).

### 8.5 `.scratch/mcp-server/issues/02-oauth-authorization-server.md` — two checklist edits

Current:

> - [ ] The authorization response carries `iss` (RFC 9207), matching the metadata flag above

Replacement:

> - [ ] The authorization response carries `iss` (RFC 9207) **on success and on error responses**,
>   matching the metadata flag above

Current:

> - [ ] The `refresh_token` grant works and returns a new access token; without it the connection dies
>   hourly, which is the exact reason Google was rejected as the authorization server

Replacement:

> - [ ] The `refresh_token` grant works and returns a new access token; without it the connection dies
>   hourly, since Claude only refreshes reactively on a 401 and access tokens live one hour

---

## 9. Sources

All URLs fetched 2026-09-11 unless a different date is given; live-JSON fetches carry a UTC timestamp.

**Google (live)**

- `https://accounts.google.com/.well-known/openid-configuration` — 19:02:50Z
- `https://accounts.google.com/.well-known/oauth-authorization-server` — 19:17:02Z (HTTP 200; no `scopes_supported`)
- `https://oauth2.googleapis.com/tokeninfo?access_token=…` — 19:09:32Z (bogus token → `400 invalid_token`)
- `https://accounts.google.com/o/oauth2/v2/auth?…offline_access…&resource=…` — 19:13:37Z (302 → `invalid_client`; inconclusive for scope validation)

**Google (documentation)**

- `https://developers.google.com/identity/protocols/oauth2/web-server` — `access_type=offline`, `prompt`, redirect-URI rules
- `https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation` — full redirect-URI restrictions
- `https://developers.google.com/identity/openid-connect/openid-connect` — accepted auth-URI parameters, scope rule, `aud` of ID token
- `https://developers.google.com/identity/protocols/oauth2` — refresh-token expiry, Testing-status 7-day rule
- `https://developers.google.com/identity/protocols/oauth2/scopes` — the fixed Google scope catalogue
- `https://docs.cloud.google.com/docs/authentication/token-types` — "User access tokens are opaque", one-hour expiry, `tokeninfo` fields, `aud` = OAuth client ID

**MCP specification (raw from `modelcontextprotocol/modelcontextprotocol@main`)**

- `docs/specification/2026-07-28/basic/authorization/index.mdx`
- `docs/specification/2026-07-28/basic/authorization/authorization-server-discovery.mdx`
- `docs/specification/2026-07-28/basic/authorization/client-registration.mdx`
- `docs/specification/2026-07-28/basic/authorization/security-considerations.mdx`
- `docs/specification/2026-07-28/changelog.mdx`
- `docs/specification/2025-11-25/basic/authorization.mdx` and `docs/specification/2025-06-18/basic/authorization.mdx` — `offline_access` count 0 in both
- `https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices` — token passthrough, confused deputy

**Anthropic**

- `https://claude.com/docs/connectors/building/authentication` — `offline_access` gate, PKCE S256, scope selection, DCR/CIMD selection, custom-connector client ID/secret, callback URL, Entra Application ID URI note, 10s/30s timeouts, `160.79.104.0/21`

**Reference implementations**

- `modelcontextprotocol/typescript-sdk@main` `packages/client/src/client/auth.ts` (`determineScope`, authorization-URL builder, token request)
- `modelcontextprotocol/csharp-sdk@main` `src/ModelContextProtocol.Core/Authentication/ClientOAuthProvider.cs`; `src/ModelContextProtocol.AspNetCore/Authentication/McpAuthenticationOptions.cs`
- `modelcontextprotocol/inspector@main` `package.json` (depends on `@modelcontextprotocol/client` 2.0.0), `clients/web/src/test/core/auth/cimd.test.ts`
- `https://code.visualstudio.com/api/extension-guides/ai/mcp` — VS Code implements 2025-06-18; DCR-first

**.NET**

- `dotnet/aspnetcore@main` `src/Security/Authentication/Google/src/{GoogleOptions,GoogleHandler,GoogleChallengeProperties,GoogleDefaults}.cs`, `PublicAPI.Shipped.txt`
- `dotnet/aspnetcore@main` `src/Security/Authentication/OAuth/src/OAuthOptions.cs`, `src/Security/Authentication/README.md`
- `https://api.nuget.org/v3-flatcontainer/microsoft.aspnetcore.authentication.google/index.json` — 19:06:50Z; stable 10.0.12
- `https://azuresearch-usnc.nuget.org/query?q=Microsoft.AspNetCore.Authentication` — Microsoft-owned package list
- `https://learn.microsoft.com/en-us/aspnet/core/release-notes/aspnetcore-10.0` — no authorization-server primitive

**Standards**

- OIDC Core 1.0 incorporating errata set 2, §11 Offline Access — `https://openid.net/specs/openid-connect-core-1_0.html#OfflineAccess`
- RFC 8707 §2 — `https://www.rfc-editor.org/rfc/rfc8707.html`
- draft-ietf-httpbis-rfc6265bis-20 §5.5.7 (SameSite=Lax) — `https://www.ietf.org/archive/id/draft-ietf-httpbis-rfc6265bis-20.txt`

**Other**

- `https://documentation.openiddict.com/guides/getting-started/creating-your-own-server-instance` — required packages, EF stores, migrations, signing/encryption certificates

**Repo files consulted**

- `/Users/pkirilin/storage/repo/personal/food-diary/src/backend/src/FoodDiary.API/Startup.cs` L51–95
- `/Users/pkirilin/storage/repo/personal/food-diary/src/backend/Directory.Packages.props`
- `/Users/pkirilin/storage/repo/personal/food-diary/src/backend/src/FoodDiary.Application/Auth/GetStatus/GetAuthStatusQueryHandler.cs`
- `/Users/pkirilin/storage/repo/personal/food-diary/src/backend/src/FoodDiary.Constants/Constants.cs`
