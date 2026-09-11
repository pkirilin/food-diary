# Research: is `Mcp:BaseUrl` necessary, or can a standard ASP.NET Core mechanism replace it?

Date: 2026-09-11. All live fetches timestamped in [§8 Sources](#8-sources).

> Scope: the `Mcp:BaseUrl` row of [`spec.md`](../spec.md) "Configuration" and the justification paragraph
> at the end of that section. Nothing here changes the authorization design recorded in
> [ADR 0003](../../../docs/adr/0003-oauth-authorization-server-in-api.md) or in
> [`google-as-authorization-server.md`](./google-as-authorization-server.md).

---

## 1. Verdict

**Keep `Mcp:BaseUrl`. Every clause of the spec's stated reason is true — but it is the weaker half of the
reason, and the spec is missing two things the value has to drive.**

Four load-bearing findings:

1. **The configuration cannot be eliminated, only relocated — and relocating it costs more.** Every
   "standard mechanism" candidate is a *host allowlist* or a *socket bind address*. None of them yields a
   URL. `AllowedHosts`, `ForwardedHeadersOptions.AllowedHosts` and `HostFilteringOptions.AllowedHosts` all
   carry no scheme, explicitly exclude the port, and explicitly permit `*` and `*.example.com` wildcards.
   RFC 8414 §2 requires `issuer` to be an https **URL**; RFC 9728 §1.2 requires the resource identifier to
   be an https **URL**. You cannot build one from a host allowlist. Making `Request.Host` trustworthy means
   writing the production hostname into *two* framework options plus a Traefik invariant that lives outside
   this repository — to replace one app option that fails loudly at startup.

2. **The decisive reason is not Host spoofing — it is that the resource server needs a constant to compare
   against.** The MCP authorization spec: servers "**MUST** validate that access tokens were issued
   specifically for them as the intended audience". "Them" is an identity the process has to know. The same
   constant is needed on the authorization-server side, to decide which `resource` values it is willing to
   mint tokens for at all (RFC 8707 §2 defines `invalid_target` for exactly that refusal). Both are
   comparisons against a stable identifier. The spec argues from metadata poisoning and never mentions this.

3. **`Mcp:BaseUrl` alone does not remove request derivation from the handshake.** The C# SDK builds the
   `WWW-Authenticate: Bearer resource_metadata="…"` URL from `Request.Scheme` + `Request.Host` unless
   `McpAuthenticationOptions.ResourceMetadataUri` is set to an **absolute** URI. Setting only
   `ResourceMetadata.Resource` from `Mcp:BaseUrl` leaves the pointer that starts the whole flow
   request-derived. Setting `ResourceMetadataUri` absolute also buys a free host/scheme pin on that
   endpoint, which the SDK implements itself.

4. **`resource` is `{Mcp:BaseUrl}/mcp`, not `{Mcp:BaseUrl}`, and the document then belongs at a different
   path than the spec's endpoint table lists.** Anthropic: the `resource` field "must match your MCP server
   URL exactly as the user enters it in Claude, **including any path component**". RFC 9728 §3.1: when the
   resource identifier has a path, the metadata lives at `/.well-known/oauth-protected-resource/<path>`.
   The spec's table lists only the root `/.well-known/oauth-protected-resource`.

Paste-ready amendment prose is in [§7.5](#75-suggested-spec-amendment).

---

## 2. The spec's justification, clause by clause

The paragraph under test (`spec.md`, "Configuration"):

> **`Mcp:BaseUrl` is explicit rather than derived from the request.** Dokploy sets
> `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`, which enables `XForwardedFor | XForwardedProto` — but **not**
> `XForwardedHost`. `Request.Host` therefore still comes from the raw `Host` header, and `appsettings.json`
> sets `"AllowedHosts": "*"`, so the app accepts any host. Deriving the RFC 9728 `resource` value from the
> request would let a forged `Host` header poison the metadata document.

### 2.1 "Dokploy sets `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`" — true operationally, absent from the repo

The variable appears in the Dokploy environment table in
[`.scratch/dokploy-migration/spec.md`](../../dokploy-migration/spec.md) ("Configuration and secrets"), marked
`variable`, value `true`, entered by hand in the Dokploy UI. That spec also records, deliberately, that
**"nothing in the repository describes the deployment"**. A repo-wide search for `FORWARDEDHEADERS` matches
nothing outside that scratch file — not `README.md`, not `CLAUDE.md`, not `docker-compose*.yml`, not the
`Dockerfile`. So the claim is true of the running deployment and unverifiable from code.

Local `docker-compose` does **not** set it: `docker-compose.base.yml` sets `ASPNETCORE_URLS=https://+:443`
and terminates TLS in Kestrel itself, with no proxy in front.

### 2.2 "enables `XForwardedFor | XForwardedProto` — but not `XForwardedHost`" — **true**, with an omission

`ConfigureWebHostDefaults`' own XML doc names the variable: *"adds the ForwardedHeaders middleware if
ASPNETCORE_FORWARDEDHEADERS_ENABLED=true"*
([`GenericHostBuilderExtensions.cs`](https://github.com/dotnet/aspnetcore/blob/431ea3d6f81262f1bdb79ab5e06ca40d38b6093a/src/DefaultBuilder/src/GenericHostBuilderExtensions.cs)).

The env-var name reaches configuration as the key `ForwardedHeaders_Enabled` because the web host builder
adds `configBuilder.AddEnvironmentVariables(prefix: "ASPNETCORE_")`
([`WebHostBuilderBase.cs`](https://github.com/dotnet/aspnetcore/blob/431ea3d6f81262f1bdb79ab5e06ca40d38b6093a/src/Hosting/Hosting/src/GenericHost/WebHostBuilderBase.cs)).

The flag's entire effect is this, verbatim
([`ForwardedHeadersOptionsSetup.cs`](https://github.com/dotnet/aspnetcore/blob/431ea3d6f81262f1bdb79ab5e06ca40d38b6093a/src/DefaultBuilder/src/ForwardedHeadersOptionsSetup.cs)):

```csharp
if (!string.Equals("true", _configuration["ForwardedHeaders_Enabled"], StringComparison.OrdinalIgnoreCase))
{
    return;
}

options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
// Only loopback proxies are allowed by default. Clear that restriction because forwarders are
// being enabled by explicit configuration.
options.KnownIPNetworks.Clear();
options.KnownProxies.Clear();
```

plus a matching gate on the middleware itself
([`ForwardedHeadersStartupFilter.cs`](https://github.com/dotnet/aspnetcore/blob/431ea3d6f81262f1bdb79ab5e06ca40d38b6093a/src/DefaultBuilder/src/ForwardedHeadersStartupFilter.cs)) — `app.UseForwardedHeaders()` runs
only under the same flag. Both are registered unconditionally in
[`WebHost.ConfigureWebDefaultsWorker`](https://github.com/dotnet/aspnetcore/blob/431ea3d6f81262f1bdb79ab5e06ca40d38b6093a/src/DefaultBuilder/src/WebHost.cs); the flag is checked at run time, not at registration.

So: `XForwardedHost` is **not** included. Confirmed.

**The omission the spec should carry:** the flag also *clears* `KnownProxies` and `KnownIPNetworks`. Their
defaults are a single entry each — `IPAddress.IPv6Loopback` and `new IPNetwork(IPAddress.Loopback, 8)`
([`ForwardedHeadersOptions.cs`](https://github.com/dotnet/aspnetcore/blob/431ea3d6f81262f1bdb79ab5e06ca40d38b6093a/src/Middleware/HttpOverrides/src/ForwardedHeadersOptions.cs),
[`DualIPNetworkList.cs`](https://github.com/dotnet/aspnetcore/blob/431ea3d6f81262f1bdb79ab5e06ca40d38b6093a/src/Middleware/HttpOverrides/src/DualIPNetworkList.cs)) — which is why the flag exists: Traefik reaches
the container across a Docker bridge network, not over loopback, so the default peer restriction would
reject its headers outright. The consequence is that in this deployment **there is no peer restriction on
who may set `X-Forwarded-*` at all**. That matters to §6, because it removes `KnownProxies` from the list of
things that could make a forwarded host trustworthy.

Defaults confirmed from the same file: `ForwardedHeaders` is an unassigned enum (`ForwardedHeaders.None`),
`ForwardLimit = 1`, `AllowedHosts = new List<string>()`.

### 2.3 "`Request.Host` therefore still comes from the raw `Host` header" — **true**, by omission

`ForwardedHeadersMiddleware` touches the host only inside `if (_options.ForwardedHeaders.HasFlag(ForwardedHeaders.XForwardedHost))`
([`ForwardedHeadersMiddleware.cs`](https://github.com/dotnet/aspnetcore/blob/431ea3d6f81262f1bdb79ab5e06ca40d38b6093a/src/Middleware/HttpOverrides/src/ForwardedHeadersMiddleware.cs)). With the flag absent, `Request.Host`
is whatever Kestrel parsed from the `Host` header.

### 2.4 "`appsettings.json` sets `AllowedHosts: "*"`, so the app accepts any host" — **true**

`src/backend/src/FoodDiary.API/appsettings.json` line 20: `"AllowedHosts": "*"`. The app never configures
`HostFilteringOptions`, so the default-builder fallback applies — it reads `Configuration["AllowedHosts"]`
and splits on `;`
([`WebHost.cs`](https://github.com/dotnet/aspnetcore/blob/431ea3d6f81262f1bdb79ab5e06ca40d38b6093a/src/DefaultBuilder/src/WebHost.cs)). `MiddlewareConfigurationManager.TryProcessHosts` treats a top-level `*`
as "disable filtering" and returns `AllowAnyNonEmptyHost = true`
([`MiddlewareConfigurationManager.cs`](https://github.com/dotnet/aspnetcore/blob/431ea3d6f81262f1bdb79ab5e06ca40d38b6093a/src/Middleware/HostFiltering/src/MiddlewareConfigurationManager.cs)).

Two structural facts worth recording alongside it, neither in the spec:

- **Host filtering runs *before* forwarded headers.** `GenericWebHostService` composes startup filters in
  reverse registration order (`foreach (var filter in Enumerable.Reverse(StartupFilters))`,
  [`GenericWebHostService.cs`](https://github.com/dotnet/aspnetcore/blob/431ea3d6f81262f1bdb79ab5e06ca40d38b6093a/src/Hosting/Hosting/src/GenericHost/GenericWebHostService.cs)), and `HostFilteringStartupFilter` is
  registered before `ForwardedHeadersStartupFilter`. The resulting pipeline is
  `UseHostFiltering` → `UseForwardedHeaders` → `Startup.Configure`.
- **`HostFilteringMiddleware` reads the raw header, not `Request.Host`:**
  `var host = context.Request.Headers.Host.ToString();`
  ([`HostFilteringMiddleware.cs`](https://github.com/dotnet/aspnetcore/blob/431ea3d6f81262f1bdb79ab5e06ca40d38b6093a/src/Middleware/HostFiltering/src/HostFilteringMiddleware.cs)).

Together: `AllowedHosts` from configuration can **never** validate an `X-Forwarded-Host` value. The two
allowlists are separate mechanisms guarding separate inputs, and a design that trusts a forwarded host needs
`ForwardedHeadersOptions.AllowedHosts` in addition to — not instead of — `AllowedHosts`.

### 2.5 "a forged `Host` header would poison the metadata document" — true of the app, incomplete as a threat

Inside the process, yes: with `AllowAnyNonEmptyHost` and no `XForwardedHost` processing, a request carrying
`Host: evil.example` reaches every handler with `Request.Host.Host == "evil.example"`, and any document built
from it would advertise `issuer`/`authorization_endpoint`/`resource` on the attacker's name.

What the spec does not say is what stands in front of that, and it matters for weighing the argument:
Traefik's `XForwarded` middleware **deletes every `X-Forwarded-*` header from an untrusted peer** and then
re-derives them — `if !x.insecure && !x.isTrustedIP(r.RemoteAddr) { DeleteXForwardedHeaders(r.Header) }`
([`forwarded_header.go`](https://github.com/traefik/traefik/blob/903e8a965795db5e750004ff74932983e269b85f/pkg/middlewares/forwardedheaders/forwarded_header.go)) — and Dokploy binds a domain to a Traefik router,
which normally means a `Host(...)` rule that simply does not match a forged name. **Neither of those is
verifiable from this repository**, by the dokploy spec's own admission, so neither can be relied on as a
control. The honest form of the argument is: *the app itself imposes no host constraint, and the constraint
that may exist lives in infrastructure this repo does not describe.*

---

## 3. Could a standard ASP.NET Core mechanism replace it?

| Candidate | What it actually is | Can it produce `https://host[:port]`? |
|---|---|---|
| `AllowedHosts` + `HostFilteringMiddleware` | Allowlist on the raw `Host` header | No — host only, port excluded, wildcards allowed |
| `ForwardedHeadersOptions.AllowedHosts` | Allowlist on `X-Forwarded-Host` | No — same shape |
| `ForwardedHeadersOptions.KnownProxies` / `KnownIPNetworks` | Peer-address allowlist | No — authenticates the *sender*, not the value |
| `ASPNETCORE_URLS` / `IServerAddressesFeature` | Socket bind addresses | No — `http://[::]:8080`, not a public origin |
| `LinkGenerator` / `IUrlHelper` | URL composition | No — needs a trusted `HostString` handed to it |
| MCP C# SDK defaults | Per-request derivation | Derives from `Request.Host` — see §4 |

### 3.1 The two allowlists are the same shape, and that shape is not a URL

`HostString.MatchesAny` is the matcher behind both. Its own remarks:

> The port on the given value is ignored. The patterns should not have ports. The patterns may be exact
> matches like "example.com", a top level wildcard "*" that matches all hosts, or a subdomain wildcard like
> "*.example.com" …

([`HostString.cs`](https://github.com/dotnet/aspnetcore/blob/431ea3d6f81262f1bdb79ab5e06ca40d38b6093a/src/Http/Http.Abstractions/src/HostString.cs)). `HostFilteringOptions.AllowedHosts` and
`ForwardedHeadersOptions.AllowedHosts` carry identical documentation, including *"Port numbers must be
excluded"* and *"A top level wildcard `*` allows all non-empty hosts"*, and Microsoft's own options table
repeats it verbatim (learn.microsoft.com, *Configure ASP.NET Core to work with proxy servers and load
balancers*).

Three consequences:

- **No scheme.** An allowlist cannot tell you `https` vs `http`. In this deployment `Request.Scheme` is
  recoverable from `X-Forwarded-Proto` — that is what the Dokploy flag is for — but only when forwarded
  headers are enabled, which is a deployment-time variable, not an application invariant.
- **No port.** A deployment on a non-443 port could not be named at all. (Not this deployment; a real
  limitation of the mechanism.)
- **No uniqueness.** `*` and `*.example.com` are first-class values. An allowlist with a wildcard, or with
  two entries, does not determine a single identifier — and nothing in either options class enforces
  "exactly one, non-wildcard". The invariant that would make derivation safe is a convention the framework
  never checks.

There is also an operational cost the spec would inherit: `AllowedHosts` gates the **whole app** with a 400,
so narrowing it to the production hostname needs a per-environment value — `docker-compose` reaches the app
as `localhost:8080`, and the Playwright suite runs against that same compose stack.

### 3.2 `KnownProxies` / `KnownIPNetworks` authenticate the peer, not the value

They decide *whether to read* `X-Forwarded-*`, never *what the value may be*. In this deployment they are
cleared by the Dokploy flag anyway (§2.2). And the value itself is not independent of the client:
Traefik populates `X-Forwarded-Host` from the inbound request's own `Host`
(`if xfHost := …Get(XForwardedHost); xfHost == "" && outreq.Host != "" { …Set(XForwardedHost, outreq.Host) }`,
[`forwarded_header.go`](https://github.com/traefik/traefik/blob/903e8a965795db5e750004ff74932983e269b85f/pkg/middlewares/forwardedheaders/forwarded_header.go)). **Enabling `XForwardedHost` therefore moves the same
client-controlled string into a different header; it does not make it trustworthy.** Trust has to come from
an allowlist (app side) or a `Host(...)` router rule (proxy side).

### 3.3 `ASPNETCORE_URLS` and `IServerAddressesFeature` are bind addresses

`IServerAddressesFeature` is documented as *"An `ICollection<string>` of addresses used by the server"*
([`IServerAddressesFeature.cs`](https://github.com/dotnet/aspnetcore/blob/431ea3d6f81262f1bdb79ab5e06ca40d38b6093a/src/Hosting/Server.Abstractions/src/Features/IServerAddressesFeature.cs)). In the Dokploy
deployment `ASPNETCORE_URLS` is deliberately unset and the `aspnet:10.0` base image binds `http://+:8080`
(`.scratch/dokploy-migration/spec.md`, "Networking and the reverse proxy"). Neither the bind address nor the
container port has any relationship to the public origin.

### 3.4 `LinkGenerator` hands the problem straight back

Both `GetUriByAddress` overloads carry this remark
([`LinkGenerator.cs`](https://github.com/dotnet/aspnetcore/blob/431ea3d6f81262f1bdb79ab5e06ca40d38b6093a/src/Http/Routing.Abstractions/src/LinkGenerator.cs)):

> The value of `host` should be a trusted value. Relying on the value of the current request can allow
> untrusted input to influence the resulting URI unless the `Host` header has been validated.

The `HttpContext` overload defaults `host` to `HttpRequest.Host`; the context-free overload requires a
`HostString` argument. So the framework's own absolute-URI generator either derives from `Request.Host` or
demands the trusted value be supplied — it is the question, not an answer to it.

---

## 4. What the MCP C# SDK does by default

Read at `modelcontextprotocol/csharp-sdk@cb3e6e8` (HEAD of `main`, 2026-09-09). The same file at tag
`v2.2.0` (latest release, 2026-08-13) is byte-identical in every respect below.

**There is a per-request derivation, and it is the default.** With `ResourceMetadataUri` unset,
`HandleDefaultResourceMetadataRequestAsync` serves `/.well-known/oauth-protected-resource/<suffix>` and
builds the `resource` value from the request
([`McpAuthenticationHandler.cs`](https://github.com/modelcontextprotocol/csharp-sdk/blob/cb3e6e87fe7d79fd6c324a06f2ad4743e5becf94/src/ModelContextProtocol.AspNetCore/Authentication/McpAuthenticationHandler.cs)):

```csharp
var scheme = Request.Scheme;
var host = Request.Host.Host;
var port = Request.Host.Port;
var path = $"{Request.PathBase}{resourceSuffix}".TrimEnd('/');
```

**An explicit `Resource` always wins.** `Options.ResourceMetadata?.Clone(derivedResource)` sets
`Resource = Resource ?? derivedResource`
([`ProtectedResourceMetadata.cs`](https://github.com/modelcontextprotocol/csharp-sdk/blob/cb3e6e87fe7d79fd6c324a06f2ad4743e5becf94/src/ModelContextProtocol.Core/Authentication/ProtectedResourceMetadata.cs)),
and the handler then repeats `resourceMetadata.Resource ??= derivedResource`.

**The `WWW-Authenticate` pointer is request-derived unless `ResourceMetadataUri` is absolute.**
`GetAbsoluteResourceMetadataUri()` returns the configured URI verbatim only when
`resourceMetadataUri.IsAbsoluteUri`; otherwise, and in the no-configuration case, it composes
`$"{Request.Scheme}://{Request.Host.ToUriComponent()}{Request.PathBase}…"`. The SDK's own tests pin this:
`Challenge_WithRelativeResourceMetadataUri_SetsAbsoluteUrl` expects `http://localhost:5000/.well-known/…`,
`Challenge_WithAbsoluteResourceMetadataUri_SetsConfiguredUrl` expects the configured string
([`McpAuthenticationHandlerTests.cs`](https://github.com/modelcontextprotocol/csharp-sdk/blob/cb3e6e87fe7d79fd6c324a06f2ad4743e5becf94/tests/ModelContextProtocol.AspNetCore.Tests/OAuth/McpAuthenticationHandlerTests.cs)).

**An absolute `ResourceMetadataUri` gets a host/scheme pin for free.** `IsConfiguredEndpointRequest` compares
`Request.Host.Host` and `Request.Scheme` against the configured URI and returns `false` (→ 404) plus a
warning on mismatch — `MetadataRequest_WithHostMismatch_LogsWarning` asserts exactly that. This is the one
standard-mechanism-shaped host pin in the whole stack, and it is scoped precisely to the document at risk.

**There is a hook for per-request computation.** `McpAuthenticationEvents.OnResourceMetadataRequest` takes a
`ResourceMetadataRequestContext` that derives from `HandleRequestContext<McpAuthenticationOptions>` and so
carries the full `HttpContext`
([`McpAuthenticationEvents.cs`](https://github.com/modelcontextprotocol/csharp-sdk/blob/cb3e6e87fe7d79fd6c324a06f2ad4743e5becf94/src/ModelContextProtocol.AspNetCore/Authentication/McpAuthenticationEvents.cs),
[`ResourceMetadataRequestContext.cs`](https://github.com/modelcontextprotocol/csharp-sdk/blob/cb3e6e87fe7d79fd6c324a06f2ad4743e5becf94/src/ModelContextProtocol.AspNetCore/Authentication/ResourceMetadataRequestContext.cs)).
So a request-derived document is not merely possible, it is supported API. The question is whether it is
*correct*, not whether it is *available*.

**The official sample uses a hard-coded constant for the audience.** `samples/ProtectedMcpServer/Program.cs`
declares `var serverUrl = "http://localhost:7071/";`, feeds it to `ValidAudience` with the comment *"Validate
that the audience matches the resource metadata as suggested in RFC 8707"*, and leaves
`ResourceMetadata.Resource` unset so the document derives. In other words the SDK's own reference wiring
already splits the two: derived document, configured audience.

**Confirmed for the spec:** `McpAuthenticationOptions`' constructor does set `ForwardAuthenticate = "Bearer"`
and `Events = new McpAuthenticationEvents()`
([`McpAuthenticationOptions.cs`](https://github.com/modelcontextprotocol/csharp-sdk/blob/cb3e6e87fe7d79fd6c324a06f2ad4743e5becf94/src/ModelContextProtocol.AspNetCore/Authentication/McpAuthenticationOptions.cs)).
`AddMcp` is a thin `AddScheme<McpAuthenticationOptions, McpAuthenticationHandler>` and adds no options
validation whatsoever.

---

## 5. What the specifications require

### 5.1 Both identifiers must be absolute https URLs

- RFC 8414 §2, `issuer`: *"REQUIRED. The authorization server's issuer identifier, which is a URL that uses
  the "https" scheme and has no query or fragment components."*
- RFC 9728 §1.2, Resource Identifier: *"a URL that uses the https scheme and has no fragment component. As
  specified in Section 2 of [RFC8707], it also SHOULD NOT include a query component…"*
- RFC 8707 §2, `resource`: *"Its value MUST be an absolute URI… The URI MUST NOT include a fragment
  component."*
- MCP 2026-07-28, *Canonical Server URI*: valid examples include `https://mcp.example.com/mcp`; invalid
  examples include `mcp.example.com` (missing scheme). Implementations *"SHOULD consistently use the form
  without the trailing slash"*.

### 5.2 The self-consistency rules do **not** forbid per-request derivation

RFC 8414 §3.3 and RFC 9728 §3.3 both say the returned value MUST be identical to the identifier the
well-known URL was constructed from. A document derived from `Request.Host` satisfies that trivially — the
client fetched it under exactly that host, so the echo always matches. **This is the trap**: derivation
cannot be ruled out by citing §3.3. It passes.

What §3.3 of RFC 9728 adds is the rule that actually constrains the value:

> If the protected resource metadata was retrieved from a URL returned by the protected resource via the
> `WWW-Authenticate` `resource_metadata` parameter, then the resource value returned MUST be identical to the
> URL that the client used to make the request to the resource server.

and §7.3 explains why (impersonation): the client *"MUST ensure that the resource identifier URL it is using
as the prefix for the metadata request exactly matches the value of the resource metadata parameter"*.

Anthropic states the same requirement operationally: *"The protected resource metadata document's `resource`
field must match your MCP server URL exactly as the user enters it in Claude, including any path component."*
(claude.com/docs/connectors/building/authentication). The same page confirms the other constraints the spec
records: `authorization_servers` — *"Claude uses the first entry and does not fall back to later entries"*;
the authorization server must serve RFC 8414 or OIDC discovery at its `/.well-known/` paths; 10 s discovery
/ registration / token timeouts and 30 s refresh; egress from `160.79.104.0/21`.

### 5.3 The rule that does force a configured constant

MCP 2026-07-28, *Access Token Usage → Token Requirements*:

> MCP servers **MUST** validate that access tokens were issued specifically for them as the intended
> audience, according to RFC 8707 Section 2.

and *Resource Parameter*: the `resource` parameter **MUST** be included in both authorization and token
requests and **MUST** identify the MCP server. RFC 8707 §2 gives the authorization server the
`invalid_target` error *"to indicate problems with the requested resource(s)"* and says the AS *"SHOULD
audience-restrict issued access tokens to the resource(s) indicated by the `resource` parameter"*.

In this design the same process plays both roles, so it must answer two questions:

1. At `POST /token`: *is the `resource` the client asked for one I serve?* Without a known self-identity the
   answer is "yes, whatever you asked for" — and the audience restriction becomes a no-op.
2. At `/mcp`: *is this token's audience me?* Same comparison, other side.

Both are equality checks against an identifier the process holds. That is what `Mcp:BaseUrl` is, and it is
why the requirement survives even if `Request.Host` were beyond reproach.

### 5.4 A correctness note the spec should absorb

If `resource` is `https://diary.example.com/mcp` (as §5.2 requires), then RFC 9728 §3.1 puts the document at:

```
GET /.well-known/oauth-protected-resource/mcp HTTP/1.1
Host: diary.example.com
```

not at the bare `/.well-known/oauth-protected-resource` the spec's endpoint table lists. The MCP discovery
document says clients probe the path-suffixed location first and the root second, and Anthropic's docs agree;
but a client that fetched the **root** document and applied RFC 9728 §3.3's first paragraph would derive the
identifier `https://diary.example.com` and reject a document claiming `https://diary.example.com/mcp`. The
SDK's default derivation gets this pairing right automatically. A hand-configured `ResourceMetadataUri` must
be set to the path-suffixed location to keep it right.

---

## 6. Relying on `Request.Host`: exactly what would have to change

### 6.1 The full change set

1. **`appsettings.json`** — replace `"AllowedHosts": "*"` with the production hostname, per environment:
   `"AllowedHosts": "diary.example.com"` in the Dokploy environment (as `AllowedHosts=diary.example.com`),
   and `localhost` for `docker-compose` and the Playwright suite. Ports must be omitted; the matcher drops
   them (§3.1).
2. **`Startup.ConfigureServices`** — opt into the forwarded host and constrain it:

   ```csharp
   services.Configure<ForwardedHeadersOptions>(options =>
   {
       options.ForwardedHeaders |= ForwardedHeaders.XForwardedHost;
       options.AllowedHosts.Add("diary.example.com");
   });
   ```

   `|=` rather than `=` is required to preserve `XForwardedFor | XForwardedProto`. This delegate runs *after*
   `ForwardedHeadersOptionsSetup`, because `ConfigureWebHostDefaults` calls
   `WebHost.ConfigureWebDefaults(webHostBuilder)` **before** `configure(webHostBuilder)` — i.e. before
   `UseStartup<Startup>` — and `IConfigureOptions<T>` instances are applied in DI registration order.
   *(Derived from the source cited in §2.2; not empirically tested against this repo.)*
   It also inherits the cleared `KnownProxies`/`KnownIPNetworks`, so `AllowedHosts` is the **only** thing
   standing between a forged `X-Forwarded-Host` and `Request.Host`.
3. **Proxy invariants, outside this repo.** Traefik's router for the app must be a `Host(...)` rule so that
   no other name routes to the container; `forwardedHeaders.insecure` must stay at its default `false` so
   that inbound `X-Forwarded-*` from clients is stripped; and the container's port must not also be
   published on the VPS's public interface, or the app is reachable bypassing Traefik entirely. **None of
   these is verifiable from this repository.**
4. **Middleware order** — already satisfied. `UseForwardedHeaders` is injected ahead of `Startup.Configure`
   by the startup filter (§2.4), so every MCP and OAuth endpoint sees the rewritten `Request.Host`.
5. **SDK wiring** — leave `ResourceMetadataUri` and `ResourceMetadata.Resource` unset so the derivation path
   in §4 is used, and hand-build the RFC 8414 document from `Request.Scheme` + `Request.Host` per request.

Net: two allowlist values (in two different options classes, guarding two different headers), one middleware
delegate, and one unwritten infrastructure contract — replacing one application config key whose absence
fails at startup with a named error.

### 6.2 The stable-identifier argument, and whether it settles the question

**It does not, on its own — and saying so honestly is better than over-claiming.**

The concern is real in shape: `issuer` and the RFC 8707 audience are bound into artefacts that outlive a
single request. A token minted at `POST /token` under one `Host` and presented at `/mcp` under another would
fail audience validation; an `iss` in the authorization response (the spec advertises
`authorization_response_iss_parameter_supported: true`, i.e. RFC 9207) would have to equal the `issuer` the
client discovered earlier.

But under the §6.1 change set that cannot happen: an allowlist with exactly one non-wildcard entry makes
`Request.Host` a constant, and a derived value that is provably constant is a constant. So per-request
derivation is not *inherently* disqualified by the stable-identifier property.

What the property does establish is the **failure mode**, and that is the decisive part:

- Neither `HostFilteringOptions.AllowedHosts` nor `ForwardedHeadersOptions.AllowedHosts` can express
  "exactly one host". Both document `*` and `*.example.com` as supported values (§3.1). The invariant that
  makes derivation safe is unenforced.
- The moment a second name is allowed — a Dokploy preview hostname, a `www.` alias, a bare IP added for
  debugging — the identity silently forks. Tokens minted under one name 401 under the other, and the
  symptom surfaces as an OAuth failure inside Claude's UI, which the spec itself already names as *"the
  worst place to debug it"*.
- The same change under `Mcp:BaseUrl` is inert: adding a hostname to a proxy or an allowlist does not change
  what the server calls itself.

So the verdict rests on §1's points 1 and 2 — the configuration cannot be eliminated, and the audience check
needs a constant — with the stable-identifier property supplying the argument for *where the failure lands*,
not for impossibility.

---

## 7. Recommendation

**Keep `Mcp:BaseUrl`.** Four amendments.

### 7.1 Say precisely what it builds

| Value | Built from `Mcp:BaseUrl = https://diary.example.com` |
|---|---|
| RFC 8414 `issuer` | `https://diary.example.com` |
| `authorization_endpoint` / `token_endpoint` | `…/authorize`, `…/token` |
| RFC 9728 `resource` | `https://diary.example.com/mcp` — **with the path** (§5.2) |
| RFC 9728 `authorization_servers[0]` | `https://diary.example.com` (equals `issuer`) |
| Token audience (RFC 8707) | `https://diary.example.com/mcp` — equals `resource` |
| PRM document location | `/.well-known/oauth-protected-resource/mcp` (§5.4) |

### 7.2 Pin the SDK explicitly — `ResourceMetadata.Resource` alone is not enough

```csharp
.AddMcp(options =>
{
    options.ResourceMetadataUri = new Uri($"{baseUrl}/.well-known/oauth-protected-resource/mcp");
    options.ResourceMetadata = new()
    {
        Resource = $"{baseUrl}/mcp",
        AuthorizationServers = { baseUrl },
        ScopesSupported = ["food:read"],
    };
});
```

Without the absolute `ResourceMetadataUri`, the `WWW-Authenticate` pointer that starts the entire flow is
built from `Request.Scheme` + `Request.Host` (§4) — the exact derivation the config key exists to avoid.
With it, the SDK additionally 404s metadata requests arriving under a different host or scheme, at no cost.

### 7.3 Extend the startup check from presence to shape

The spec already fails startup when `Mcp:BaseUrl` is missing. Also reject: a relative URI; a scheme other
than `https` (allow `http` only for `localhost`); a query or fragment component; a trailing slash. These are
RFC 8414 §2, RFC 9728 §1.2, RFC 8707 §2 and the MCP canonical-URI guidance respectively (§5.1). A
malformed value otherwise surfaces as a silent discovery mismatch inside Claude.

### 7.4 Narrow `AllowedHosts` anyway — as defence in depth, not as a replacement

Setting `AllowedHosts=diary.example.com` in the Dokploy environment costs one variable and makes a forged
`Host` a 400 before it reaches any handler. It is worth doing independently of MCP (it also protects the
existing Google OAuth redirect generation). It is **not** a substitute for `Mcp:BaseUrl`, and it should
**not** be paired with enabling `XForwardedHost` — that only relocates the client-controlled value (§3.2).

### 7.5 Suggested spec amendment

Replacement for the justification paragraph in "Configuration":

> **`Mcp:BaseUrl` is explicit rather than derived from the request.** The resource server has to answer "was
> this token issued for *me*?" (MCP 2026-07-28 requires it, per RFC 8707 §2) and the authorization server has
> to answer "is this `resource` one I serve?" — both are equality checks against an identifier the process
> holds, and there is no standard ASP.NET Core mechanism that supplies one. `AllowedHosts` and
> `ForwardedHeadersOptions.AllowedHosts` are host allowlists: no scheme, no port, and `*` is a legal value,
> so neither can produce the absolute `https` URL that RFC 8414 §2 and RFC 9728 §1.2 require. Deriving it
> from `Request.Host` would additionally be unsafe as deployed — `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`
> enables only `XForwardedFor | XForwardedProto`, and `appsettings.json` sets `"AllowedHosts": "*"`, so
> `Request.Host` is the unvalidated `Host` header.
>
> Because the SDK builds the `WWW-Authenticate: Bearer resource_metadata="…"` URL from `Request.Scheme` and
> `Request.Host` unless `McpAuthenticationOptions.ResourceMetadataUri` is an absolute URI, that option is set
> from `Mcp:BaseUrl` too — otherwise the pointer that starts the flow stays request-derived. Setting it also
> makes the SDK reject metadata requests arriving under any other host or scheme.

And in the endpoint table, `GET /.well-known/oauth-protected-resource` becomes
`GET /.well-known/oauth-protected-resource/mcp`, because `resource` carries the `/mcp` path (RFC 9728 §3.1).

### 7.6 What I could not verify

- Dokploy's generated Traefik router rule, its `forwardedHeaders` trust settings, and whether the container
  port is published on the VPS's public interface. Nothing in the repository describes the deployment — the
  dokploy migration spec records this as a deliberate outcome. Every claim in §2.5 and §6.1 step 3 about
  what stands in front of the app is therefore unverified.
- Whether any intermediary between Claude and Traefik caches `/.well-known/*` responses keyed on path alone,
  which is the mechanism that turns Host-header poisoning from a theoretical into an exploitable bug.
- The Traefik version Dokploy runs; the source cited is `master` at the SHA below.

---

## 8. Sources

All fetched 2026-09-11.

**ASP.NET Core source** — `dotnet/aspnetcore`, branch `release/10.0` @ `431ea3d6f81262f1bdb79ab5e06ca40d38b6093a`
(permalink form: `https://github.com/dotnet/aspnetcore/blob/431ea3d6f81262f1bdb79ab5e06ca40d38b6093a/<path>`)

- `src/DefaultBuilder/src/ForwardedHeadersOptionsSetup.cs` — the entire effect of `ForwardedHeaders_Enabled`
- `src/DefaultBuilder/src/ForwardedHeadersStartupFilter.cs` — the middleware gate
- `src/DefaultBuilder/src/HostFilteringStartupFilter.cs`
- `src/DefaultBuilder/src/WebHost.cs` — `ConfigureWebDefaultsWorker`, `AllowedHosts` fallback, filter registration order
- `src/DefaultBuilder/src/GenericHostBuilderExtensions.cs` — `ConfigureWebDefaults` runs before `configure`; XML doc names the env var
- `src/Hosting/Hosting/src/GenericHost/WebHostBuilderBase.cs` — `AddEnvironmentVariables(prefix: "ASPNETCORE_")`
- `src/Hosting/Hosting/src/GenericHost/GenericWebHostService.cs` — `Enumerable.Reverse(StartupFilters)`
- `src/Middleware/HttpOverrides/src/ForwardedHeadersOptions.cs` — defaults; `AllowedHosts` remarks
- `src/Middleware/HttpOverrides/src/DualIPNetworkList.cs` — default `KnownNetworks` = `127.0.0.1/8`
- `src/Middleware/HttpOverrides/src/ForwardedHeadersMiddleware.cs` — `XForwardedHost` gating, `AllowedHosts` check
- `src/Middleware/HttpOverrides/src/ForwardedHeadersExtensions.cs`
- `src/Middleware/HostFiltering/src/HostFilteringMiddleware.cs` — reads `Request.Headers.Host`
- `src/Middleware/HostFiltering/src/HostFilteringOptions.cs`
- `src/Middleware/HostFiltering/src/MiddlewareConfigurationManager.cs` — `*` disables filtering
- `src/Http/Http.Abstractions/src/HostString.cs` — `MatchesAny` remarks
- `src/Http/Routing.Abstractions/src/LinkGenerator.cs` — "should be a trusted value"
- `src/Hosting/Server.Abstractions/src/Features/IServerAddressesFeature.cs`

**ASP.NET Core documentation**

- `https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer` (source:
  `dotnet/AspNetCore.Docs@main` `aspnetcore/host-and-deploy/proxy-load-balancer.md`) — `ASPNETCORE_FORWARDEDHEADERS_ENABLED`
  warning ("doesn't enable features such as the `KnownProxies` option"), full `ForwardedHeadersOptions` table

**MCP C# SDK** — `modelcontextprotocol/csharp-sdk` @ `cb3e6e87fe7d79fd6c324a06f2ad4743e5becf94`
(`main`, committed 2026-09-09); handler re-checked at tag `v2.2.0` (released 2026-08-13) and found identical

- `src/ModelContextProtocol.AspNetCore/Authentication/McpAuthenticationHandler.cs`
- `src/ModelContextProtocol.AspNetCore/Authentication/McpAuthenticationOptions.cs`
- `src/ModelContextProtocol.AspNetCore/Authentication/McpAuthenticationEvents.cs`
- `src/ModelContextProtocol.AspNetCore/Authentication/ResourceMetadataRequestContext.cs`
- `src/ModelContextProtocol.AspNetCore/Authentication/McpAuthenticationExtensions.cs`
- `src/ModelContextProtocol.Core/Authentication/ProtectedResourceMetadata.cs`
- `tests/ModelContextProtocol.AspNetCore.Tests/OAuth/McpAuthenticationHandlerTests.cs`
- `samples/ProtectedMcpServer/Program.cs`

**Traefik** — `traefik/traefik` @ `903e8a965795db5e750004ff74932983e269b85f` (`master`)

- `pkg/middlewares/forwardedheaders/forwarded_header.go` — `DeleteXForwardedHeaders` for untrusted peers;
  `X-Forwarded-Host` set from `outreq.Host`
- `pkg/proxy/httputil/proxy.go` — `X-Forwarded-*` propagation

**Standards**

- RFC 9728 §1.2, §2, §3, §3.1, §3.3, §7.3 — `https://www.rfc-editor.org/rfc/rfc9728.txt`
- RFC 8414 §2, §3.3 — `https://www.rfc-editor.org/rfc/rfc8414.txt`
- RFC 8707 §2 — `https://www.rfc-editor.org/rfc/rfc8707.txt`
- MCP specification 2026-07-28, raw from `modelcontextprotocol/modelcontextprotocol@main`:
  `docs/specification/2026-07-28/basic/authorization/index.mdx` (Resource Parameter, Canonical Server URI,
  Token Requirements) and `.../authorization-server-discovery.mdx` (PRM discovery, RFC 8414 §3.3 validation)

**Anthropic**

- `https://claude.com/docs/connectors/building/authentication` — `resource` must match the MCP URL as typed
  including path; first `authorization_servers` entry wins; RFC 8414/OIDC discovery required; S256 PKCE;
  callback `https://claude.ai/api/mcp/auth_callback`; 10 s / 30 s timeouts; egress `160.79.104.0/21`

**Repo files consulted**

- `/Users/pkirilin/storage/repo/personal/food-diary/.scratch/mcp-server/spec.md`
- `/Users/pkirilin/storage/repo/personal/food-diary/.scratch/dokploy-migration/spec.md`
- `/Users/pkirilin/storage/repo/personal/food-diary/docs/adr/0003-oauth-authorization-server-in-api.md`
- `/Users/pkirilin/storage/repo/personal/food-diary/src/backend/src/FoodDiary.API/appsettings.json`
- `/Users/pkirilin/storage/repo/personal/food-diary/src/backend/src/FoodDiary.API/Startup.cs`
- `/Users/pkirilin/storage/repo/personal/food-diary/src/backend/src/FoodDiary.API/Program.cs`
- `/Users/pkirilin/storage/repo/personal/food-diary/docker-compose.yml`,
  `/Users/pkirilin/storage/repo/personal/food-diary/docker-compose.base.yml`,
  `/Users/pkirilin/storage/repo/personal/food-diary/Dockerfile`
