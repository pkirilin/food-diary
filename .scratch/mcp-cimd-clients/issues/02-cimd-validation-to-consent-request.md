# 02 — CIMD MCP Client validation up to the consent request

**What to build:** An MCP Client that identifies itself with a Client ID Metadata Document (CIMD) URL can start a sign-in with no server configuration. The authorization server advertises CIMD support. The owner signs in with Google first. Then the server fetches the MCP Client's metadata document under strict SSRF limits, validates it and the request, and redirects the browser to the SPA consent route with a protected consent request. Any failure shows a plain-text 400 with a specific reason and never redirects to the client. Client-secret MCP Clients behave exactly as before.

The consent route and its API come in later tickets. Until then a successful CIMD sign-in lands on a route that does not exist yet, and nothing approves automatically. Do not release between this ticket and 04.

See the spec's "Client identification", "Authorization server metadata", "Authorize flow for CIMD MCP Clients", "Fetching the metadata document" and "Consent request" sections.

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

- [ ] Authorization server metadata adds `client_id_metadata_document_supported: true`, and `token_endpoint_auth_methods_supported` is `client_secret_post` and `none`
- [ ] `Mcp:Clients` is optional: MCP enabled with no entries starts; per-entry rules are unchanged
- [ ] A configured `client_id` takes precedence; any other `client_id` is a CIMD MCP Client only if it is an `https` URL with a path, no userinfo, no `.`/`..` segments and no fragment (a query is allowed); anything else is refused as unknown
- [ ] For a CIMD MCP Client, `/authorize` signs in and checks `Auth:AllowedEmails` before fetching; a not-allowed account gets the plain-text 400
- [ ] The fetch uses a dedicated HTTP client: no automatic redirects, only `200 OK` succeeds, at most 5 KB read, 5-second timeout, no cookies, no caching
- [ ] A connect-time address filter refuses every RFC 6890 special-use address, including the IPv6 equivalents and IPv4-mapped IPv6 forms, and checks the address the socket actually connects to
- [ ] The address filter is a replaceable service; component tests replace it to reach Mountebank
- [ ] The document must be a JSON object with `client_id`, `client_name` and `redirect_uris`; its `client_id` must equal the URL; `token_endpoint_auth_method`, if present, must be `none`
- [ ] Accepted redirect URIs are `https`, or `http` on `localhost`, `127.0.0.1` or `[::1]`; the request's `redirect_uri` must be present and exactly equal one of the document's `redirect_uris`
- [ ] `response_type`, PKCE, scope and resource are validated as for client-secret MCP Clients
- [ ] Every refusal is a plain-text 400 with a specific reason that never includes fetched content
- [ ] Success redirects to the SPA consent route with an `IDataProtector`-protected consent request holding the validated request, display details (name, `https` logo URL or none, `client_id` host, redirect host, localhost-only flag), the signed-in email, a unique ID recorded in `IMemoryCache`, and a 10-minute expiry
- [ ] Unit tests: an address-filter table covering every special-use range and the IPv4-mapped forms; CIMD `client_id` URL rules; options validation with no `Mcp:Clients`
- [ ] Component scenarios (Mountebank serves the documents): metadata advertisement; the success redirect to the consent route; one 400 scenario per refusal (404, redirect, more than 5 KB, timeout, invalid JSON, missing fields, `client_id` mismatch, `redirect_uri` not listed, disallowed redirect scheme, `private_key_jwt`, non-`https` `client_id`); one scenario with the **real** address filter and `client_id` `https://localhost/…` expecting a 400
- [ ] `docs/guide/deployment.md`, `deploy/.env.example`, `docs/development.md` and `CLAUDE.md` describe `Mcp:Clients` as optional and needed only for client-secret MCP Clients
- [ ] Backend build and all backend tests pass
