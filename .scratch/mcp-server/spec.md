# Spec: Read-only MCP server in FoodDiary.API

Status: ready-for-agent

Vocabulary: [CONTEXT.md](../../CONTEXT.md) — **food log**, **meal**, **product**, **category** are defined there and used with those exact meanings below.

Decision record: [docs/adr/0003-oauth-authorization-server-in-api.md](../../docs/adr/0003-oauth-authorization-server-in-api.md)

## Problem Statement

The diary holds years of what was eaten and a personal product catalogue with nutrition per 100 g, and none of it is reachable by a language model. Answering "analyse last week and tell me which products combine badly", "my stomach hurts, what did I eat", or "build me a week of meals from products I already have" means exporting data by hand every time.

The obvious shape — put an LLM in the backend and expose an "analyse my diet" endpoint — was rejected. It pays for inference twice, hard-codes one fixed analysis, and requires a redeploy to change the question. The reasoning belongs in the client that the user is already paying for.

So: expose the diary to Claude as an MCP server, and let Claude be the nutritionist.

## Solution

A **read-only** MCP server mounted inside the existing `FoodDiary.API` process at `/mcp` — not a separate deployment unit, not a separate `.csproj`. It is reached remotely over Streamable HTTP from Claude web and desktop, as a custom connector on the app's public domain, and is off unless `Mcp:Enabled` is set.

Two tools return data; one prompt packages the report the user asks for most. Every tool call goes through an existing `FoodDiary.Application` handler — the MCP layer never touches `FoodDiaryContext`, and the handlers do not know who is calling them.

Because the server is on the public internet and the diary is personal, it is protected by OAuth. `FoodDiary.API` acts as **both** the OAuth authorization server and the resource server, with an owner-configured set of pre-registered clients — one by default, whose ID and secret are pasted into Claude's custom-connector settings. The consent step reuses the Google sign-in the app already has.

## Domain contract

The MCP surface says **food log**, never "note". `Note` reads as a text memo to a language model; it stays the internal name in the database, entities and handlers.

One food log is **one product eaten in one meal on one date** — the same grain as one `Note` row. A meal is a grouping by `MealType`, derived in the response; there is no `Meal` entity and the nesting invents nothing.

### `get_food_logs(from, to)`

Backed by `GetNotesHistoryQueryHandler(From, To)` in `FoodDiary.Application`, which already returns notes over a date range with `Product` eager-loaded. **No new handler is required.**

```json
{
  "from": "2026-09-01",
  "to": "2026-09-07",
  "days": [
    {
      "date": "2026-09-01",
      "meals": [
        {
          "mealType": "Breakfast",
          "items": [
            {
              "product": { "id": 42, "name": "Oatmeal" },
              "quantity": 60,
              "calories": 220,
              "protein": 7.8,
              "fats": 4.2,
              "carbs": 36.0,
              "sugar": null,
              "salt": null
            }
          ]
        }
      ],
      "totals": {
        "calories": { "total": 1840, "coveredItems": 12, "totalItems": 12 },
        "protein": { "total": 82.4, "coveredItems": 9, "totalItems": 12 }
      }
    }
  ],
  "totals": {
    "calories": { "total": 12880, "dailyAverage": 1840.0, "coveredItems": 84, "totalItems": 84 },
    "protein": { "total": 576.8, "dailyAverage": 82.4, "coveredItems": 63, "totalItems": 84 }
  }
}
```

Rules that the shape exists to enforce:

- **Macros are computed for the quantity eaten**, not passed through as per-100 g values. The model should never do this arithmetic; it is the arithmetic it is worst at.
- **A missing macro is an explicit `null`.** Never omitted, never zero. `Protein`, `Fats`, `Carbs`, `Sugar` and `Salt` are `decimal?` on `Product` and are genuinely absent for some products.
- **Every total carries a coverage count**, so the model can say "based on 9 of 12 items" instead of reporting a total that silently dropped three products. `calories` is always fully covered because `CaloriesCost` is a non-nullable `int`; it carries the counts anyway so the model applies one uniform trust check rather than a special case.
- **Days with nothing logged appear**, with an empty `meals[]` and zero totals. Otherwise a skipped day is indistinguishable from a day outside the query, and "you skipped dinner three times" is a real signal.
- **Skipped days count toward `dailyAverage`.** Excluding them would make "average daily calories" quietly mean "average on days I remembered to log".
- **`mealType`** is the C# enum member name, verbatim — `Breakfast`, `SecondBreakfast`, `Lunch`, `AfternoonSnack`, `Dinner`. It is `MealType.ToString()`, so no converter and no mapping table stands between the enum and the wire. The same tokens appear in the `nutrition_report` template, so the model never sees two spellings for one meal.
- **`product`** is an object carrying `id` and `name`. `id` is present so the model can cross-reference `list_products`; the nesting matches `list_products`, where a product is also an object.
- **`product` carries no category.** `FindByDateRange` eager-loads `Product` and not `Product.Category`, so adding it would widen the query behind the existing REST history endpoint for something `product.id` plus `list_products` already answers.

**Range cap: 31 days.** A wider range returns an MCP **tool error** naming the limit and the span requested — "Requested 90 days; the maximum is 31. Split the range." — so the model chunks the request itself. Never a JSON-RPC protocol error, which would break the conversation instead of informing it, and never silent truncation.

### `list_products(pageNumber, pageSize, productName?)`

Backed by `GetProductsQueryHandler` in `FoodDiary.Application`, unchanged: it already pages, filters by name, eager-loads `Category` and returns `TotalProductsCount`.

```json
{
  "products": [
    {
      "id": 42,
      "name": "Oatmeal",
      "category": { "name": "Cereals" },
      "defaultQuantity": 100,
      "per100g": {
        "calories": 366, "protein": 13.0, "fats": 7.0,
        "carbs": 62.0, "sugar": null, "salt": null
      }
    }
  ],
  "pageNumber": 1,
  "pageSize": 100,
  "totalCount": 412
}
```

The handler's `CategoryId` filter is **not** exposed: it is an integer the model cannot guess, and exposing it would force a third `list_categories` tool into existence purely to make it usable. The category rides along on each product instead, so grouping happens client-side.

`category` is an object rather than a bare string so that a later field — a colour, a display order — is an addition rather than a breaking change to the shape. It carries `name` only today; `id` stays out for the same reason the filter does. It is never `null`: `Product.CategoryId` is a non-nullable `int`, so every product has exactly one category.

Nutrition here is nested under `per100g` deliberately. `get_food_logs` returns macros already scaled to the quantity eaten and this tool returns catalogue values; the nesting names the difference so the two can never be confused.

**`pageSize` cap: 100**, with an explicit error past it — the same rule as the range cap, for the same reason.

### Prompt: `nutrition_report`

One optional string argument, `period`, free text: "last week", "last 14 days", "2026-09-01 to 2026-09-07". MCP prompt arguments are strings only, so the template instructs Claude to resolve the phrase to concrete dates, default to the last 7 days when empty, and respect the 31-day cap.

Only this prompt ships. "Optimal ration" and "plan my week" take different criteria every time — a calorie range, a protein target, vitamins — so a fixed prompt is worse than typing the question.

## Authorization

`FoodDiary.API` is both the authorization server and the resource server. Google **cannot** be the authorization server: a Google access token's `aud` is the OAuth client ID rather than a resource URI, so the RFC 8707 audience binding that MCP requires is unsatisfiable, and Google issues refresh tokens only for the non-standard `access_type=offline` parameter that no MCP client sends — so the connection would also die hourly. See [ADR 0003](../../docs/adr/0003-oauth-authorization-server-in-api.md).

### Endpoints

| Path | Purpose |
|---|---|
| `GET /.well-known/oauth-protected-resource/mcp` | RFC 9728. Served by the SDK from `McpAuthenticationOptions.ResourceMetadata` |
| `GET /.well-known/oauth-authorization-server` | RFC 8414. Hand-written |
| `GET /authorize` | Challenges the existing Google cookie scheme, then checks `Auth:AllowedEmails` |
| `POST /token` | `application/x-www-form-urlencoded`. `authorization_code` and `refresh_token` grants |
| `/mcp` | `app.MapMcp()` |

All of these **must be mapped ahead of `UseSpa`**. The SPA catch-all otherwise answers discovery probes with `index.html`, and the client hangs rather than failing — the failure already recorded in the original feature note.

### Resource identity

`Mcp:BaseUrl` is the single source of every identifier the two roles compare against:

| Value | Built from `Mcp:BaseUrl = https://diary.example.com` |
|---|---|
| RFC 8414 `issuer` | `https://diary.example.com` |
| `authorization_endpoint` / `token_endpoint` | `…/authorize`, `…/token` |
| RFC 9728 `resource` | `https://diary.example.com/mcp` — **with the path** |
| RFC 9728 `authorization_servers[0]` | `https://diary.example.com`, equal to `issuer` |
| Token audience (RFC 8707) | `https://diary.example.com/mcp`, equal to `resource` |
| Protected-resource metadata location | `/.well-known/oauth-protected-resource/mcp` |

`resource` carries the `/mcp` path because Claude requires the field to match the MCP URL exactly as typed into the connector, path included. RFC 9728 §3.1 then puts the document at the path-suffixed well-known location, which is why the endpoint table above is not the bare `/.well-known/oauth-protected-resource`.

`McpAuthenticationOptions.ResourceMetadataUri` is therefore set to that absolute URL, not left to default:

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

Unless `ResourceMetadataUri` is absolute, the SDK builds the `WWW-Authenticate: Bearer resource_metadata="…"` pointer from `Request.Scheme` and `Request.Host` — so setting `ResourceMetadata.Resource` alone would leave the pointer that starts the whole flow request-derived. Absolute, it also makes the SDK reject metadata requests arriving under any other host or scheme.

### Authorization server metadata

```json
{
  "issuer": "<Mcp:BaseUrl>",
  "authorization_endpoint": "<Mcp:BaseUrl>/authorize",
  "token_endpoint": "<Mcp:BaseUrl>/token",
  "response_types_supported": ["code"],
  "grant_types_supported": ["authorization_code", "refresh_token"],
  "code_challenge_methods_supported": ["S256"],
  "token_endpoint_auth_methods_supported": ["client_secret_post"],
  "scopes_supported": ["food:read"],
  "authorization_response_iss_parameter_supported": true
}
```

The scope is `food:read` rather than a blanket `read`, so a future weight-only scope can be `weight:read` without renaming this one.

### Client registration

Pre-registered clients only. `Mcp:Clients` is an array; each entry carries `ClientId`, `ClientSecret` and `RedirectUri`. There is no `POST /register` and no client store — the array *is* the store, and only the owner can write to it.

`appsettings.json` ships entry `0` carrying the Claude connector's callback, `https://claude.ai/api/mcp/auth_callback`, and nothing else. That URL is a published constant of Anthropic's connector rather than a per-deployment choice or a secret, so shipping it means a self-hoster supplies two values instead of three and cannot mistype the one value that must match byte for byte. `ClientId` and `ClientSecret` come from the deployment, by index: `Mcp__Clients__0__ClientId`.

An array rather than three scalars because `RedirectUri` belongs to a client, not to the app — that is what OAuth client registration is — and once it is per-client, a second client is a config entry rather than a code change. The default remains exactly one.

Dynamic Client Registration would mean an open registration endpoint plus storage, and registers a fresh client on every reconnection. Client ID Metadata Documents need no endpoint but force a public client — PKCE only, no secret — and make the authorization server fetch a caller-supplied URL, which is SSRF surface. Both let a *caller* register itself; neither is what this array does.

### Consent

`/authorize` challenges the existing Google cookie scheme and checks `Auth:AllowedEmails`. Once that passes it **auto-approves** — mints the code and redirects. There is no consent page.

This is a deliberate deviation from the usual OAuth shape, and it is safe here for a specific reason: a client exists only because the owner put it in this app's own configuration, so **registration is the consent step**, and it happened before any request arrived. The `redirect_uri` is then validated for equality against the `RedirectUri` registered for the `client_id` in the request, and PKCE S256 is mandatory per client, so an intercepted code is useless without the verifier that never leaves the client. A consent button on a single-user app is a button the one user reflexively clicks.

A top-level `GET` redirect to `/authorize` carries the `SameSite=Lax` cookie correctly — verified against `FoodDiary.API/Startup.cs`.

### Authorization codes

An `IDataProtector` blob, 60-second lifetime, carrying `client_id`, `redirect_uri`, the PKCE `code_challenge`, `resource`, `scope` and the authenticated email — so PKCE verifies without a lookup.

OAuth 2.1 requires codes to be single-use, and a stateless blob can be replayed within its lifetime. The code's id therefore also goes into **`IMemoryCache`**, removed on first exchange. No table, no migration. A code in flight during a redeploy fails; that is a 60-second window on a personal app, and the user clicks Connect again.

### Tokens

**Opaque, issued via `IDataProtector`** — access and refresh tokens use different purpose strings.

The MCP authorization spec mandates nothing about token format. It requires `Authorization: Bearer`, never the query string; that the server validate the token; and that the token be audience-bound to the MCP URL per RFC 8707. Format is the server's business, and RFC 6750 Bearer tokens are opaque to clients by definition.

JWT's value is letting a *different* service verify a token without calling the issuer. Here the authorization server and the resource server are the same process, so that buys nothing and costs a new signing secret plus a rotation story. `FoodDiaryContext` already implements `IDataProtectionKeyContext` with a `DataProtectionKeys` table and `AddDataProtection().PersistKeysToDbContext(...)` is already wired in `InfrastructureExtensions.cs`, so the key ring already survives redeploys. Zero new storage, zero new secrets.

Lifetimes: **access 1 hour, refresh 30 days**. There is no revocation store in v1 — the kill switch is `Mcp:Enabled=false` plus deleting the connector in Claude. A denylist is worth adding only if this ever serves more than one person.

### Token validation

`McpAuthenticationOptions` defaults to `ForwardAuthenticate = "Bearer"`, so `AddMcp` delegates authentication to whatever scheme is registered under that name. The SDK samples use `AddJwtBearer`, but nothing requires it: a custom `AuthenticationHandler<AuthenticationSchemeOptions>` registered as `"Bearer"` calls `Unprotect`, checks expiry and audience, and builds the `ClaimsPrincipal`. `AddMcp` still serves the resource metadata document and the 401 challenge.

## Configuration

Top-level `Mcp` section, matching how `Auth`, `GoogleAuth` and `Integrations` already sit in `appsettings.json`.

| Key | Default | Notes |
|---|---|---|
| `Mcp:Enabled` | `false` | |
| `Mcp:BaseUrl` | — | Public origin, e.g. `https://diary.example.com` |
| `Mcp:Clients:N:ClientId` | — | At least one client required |
| `Mcp:Clients:N:ClientSecret` | — | User secret / env var, never `appsettings.json` |
| `Mcp:Clients:N:RedirectUri` | Claude callback at `N=0` | Shipped in `appsettings.json` for entry `0` |
| `Mcp:AccessTokenLifetime` | `01:00:00` | |
| `Mcp:RefreshTokenLifetime` | `30.00:00:00` | |

The route is fixed at `/mcp` and is not configurable.

**`Mcp:BaseUrl` is explicit rather than derived from the request.** The resource server has to answer "was this token issued for *me*?" — MCP requires it, per RFC 8707 §2 — and the authorization server has to answer "is this `resource` one I serve?". Both are equality checks against an identifier the process holds, and no standard ASP.NET Core mechanism supplies one: `AllowedHosts` and `ForwardedHeadersOptions.AllowedHosts` are host allowlists with no scheme, no port and `*` as a legal value, so neither can produce the absolute `https` URL that RFC 8414 §2 and RFC 9728 §1.2 require.

Deriving it from `Request.Host` would additionally be unsafe. `Request.Host` is client-controlled behind any reverse proxy that does not itself validate it, which is the default arrangement — and `appsettings.json` sets `"AllowedHosts": "*"`, so the app accepts any host. The app runs in whatever container-friendly environment the operator chose, so it cannot assume its proxy is stricter than that.

Enabling `XForwardedHost` does not fix it. A proxy typically populates `X-Forwarded-Host` from the inbound `Host`, so the setting only relocates the same client-controlled string. Host filtering also runs *ahead* of the forwarded-headers middleware and reads the raw `Host` header, so `AllowedHosts` can never validate `X-Forwarded-Host`.

See [research: `Mcp:BaseUrl` configuration](research/mcp-base-url-configuration.md).

**Enabled with `BaseUrl` missing, or with no usable client, fails at startup**, naming what is missing. The alternative surfaces as an opaque OAuth failure inside Claude's UI, which is the worst place to debug it.

The client array is validated for: at least one entry; non-empty `ClientId`, `ClientSecret` and `RedirectUri` on every entry; `ClientId` unique across entries; and `RedirectUri` shape-validated the way `BaseUrl` is. Errors name the offending index — `Mcp:Clients:0:ClientSecret is required`. The uniqueness check earns its place: lookup is by `ClientId`, so a duplicate makes which client authenticates depend on configuration ordering.

`Mcp:BaseUrl` is validated for shape as well as presence, failing startup on a relative URI, a scheme other than `https` (`http` allowed only for `localhost`), a query or fragment component, or a trailing slash — RFC 8414 §2, RFC 9728 §1.2, RFC 8707 §2 and the MCP canonical-URI guidance respectively. A malformed value otherwise surfaces as the same silent discovery mismatch.

**Disabled** means the MCP and OAuth endpoints are not mapped, *plus* a terminal branch ahead of `UseSpa` returning **404** for those paths. Not mapping alone is not enough — the SPA catch-all would answer them with `index.html`.

Docker env vars follow the existing `Section__Key` convention, with array entries by index as `Auth__AllowedEmails__0` already does: `Mcp__Enabled`, `Mcp__BaseUrl`, `Mcp__Clients__0__ClientId`, `Mcp__Clients__0__ClientSecret`.

Separately, `AllowedHosts` should be narrowed from `*` to the app's public host in the deployment environment. It is worth one variable independently of MCP — it also protects the existing Google OAuth redirect generation — and it makes a forged `Host` a 400 before it reaches any handler. It is defence in depth, not a substitute for `Mcp:BaseUrl`, and it must **not** be paired with enabling `XForwardedHost`.

## Layering

The MCP layer calls Application handlers and never `FoodDiaryContext`; handlers stay unaware of who calls them.

Both handlers it needs already exist and neither changes:

- `GetNotesHistoryQueryHandler(From, To)` → `INotesRepository.FindByDateRange`, which already does `.Where(n => n.Date >= from && n.Date <= to).Include(n => n.Product)`.
- `GetProductsQueryHandler(PageNumber, PageSize, ProductName?, CategoryId?)`.

All new code lives in `FoodDiary.API/Mcp/`, so everything the flag switches off is in one directory.

## Testing

The real logic is the mapping — grouping notes into `days[].meals[].items[]`, scaling macros to the quantity eaten, coverage counts, empty days, the two caps. It is pure and belongs in **`FoodDiary.UnitTests`**.

One **`FoodDiary.ComponentTests`** case covers the handshake: an unauthenticated call to `/mcp` returns 401 with `WWW-Authenticate: Bearer resource_metadata="…"`, and that document resolves.

Component tests need Docker via Testcontainers. Per `CLAUDE.md`, if Docker is unavailable, **stop and ask** — never skip the suite or substitute a non-Docker path.

## Out of scope

- **Write tools.** Read-only in v1.
- **MCP resources.** Tools and prompts only.
- **Weight logs.** Checked against all four use cases in the feature note: none needs body weight, because the calorie and protein targets are supplied by the user, not derived. This also leaves `GetWeightLogsHandler`'s existing layering violation untouched — real, but not this feature's problem.
- **Multi-tenancy.** Notes and products have no user ownership at all; `Auth:AllowedEmails` gates the whole app.
- **Server-side LLM analysis.**
- **CORS.** Anthropic's egress (`160.79.104.0/21`) is server-side, so connectors need no CORS. It matters only for browser-based debugging with MCP Inspector.
- **Demo mode interaction.** Demo mode is frontend-only — `VITE_APP_DEMO_MODE_ENABLED`, with no `DEMO_MODE` anywhere in `src/backend/`.

## Constraints verified

Claude connector requirements, from `https://claude.com/docs/connectors/building/authentication`:

- `401` + `WWW-Authenticate: Bearer resource_metadata="…"` starts the flow.
- The metadata `resource` field must match the MCP URL **exactly as typed into Claude**.
- `authorization_servers` — the first entry wins, with no fallback.
- The authorization server must serve RFC 8414 or OIDC discovery.
- PKCE **S256** required. Redirect URI is `https://claude.ai/api/mcp/auth_callback`.
- The token endpoint must accept `application/x-www-form-urlencoded`.
- Discovery, registration and token calls time out at **10s**; refresh at **30s**.

C# SDK (`/modelcontextprotocol/csharp-sdk`, official and actively maintained):

- `WithHttpTransport(o => o.SessionMode = HttpServerSessionMode.Stateless)` — sessions are stateless.
- `AddAuthentication(...).AddMcp(o => o.ResourceMetadata = …)` serves the protected-resource document.
- `AddAuthorizationFilters()` and `app.MapMcp()`.
- The package is **not yet in `Directory.Packages.props`**; central package management is in use, so add the `PackageVersion` there.

## Documentation

`README.md` and `CLAUDE.md` both list environment variables and must gain the `Mcp:*` keys — required by `.claude/rules/coding.md` whenever env vars change.
