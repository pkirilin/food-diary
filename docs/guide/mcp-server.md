# MCP server

Food Diary can share your food logs and products with Claude, ChatBox, or any other compatible [MCP](https://modelcontextprotocol.io) client, so you can ask things like "what did I eat last week?" or "plan my meals for next week". Access is read-only: the client can look at your data but never change it.

The server is off by default. It lives at `/mcp` on your Food Diary domain, and you turn it on with the [MCP settings in the configuration reference](deployment.md#mcp-server).

## Two ways to connect

An MCP client connects in one of two ways. Both give the same read-only access, so use whichever your client supports.

- **Client ID and secret.** You choose a client ID and a secret, add them to the Food Diary configuration, and enter them in the client. Claude connects this way.
- **Client ID Metadata Document.** The client identifies itself with a URL that publishes its name and callback addresses. You configure nothing, and you approve every sign-in on a [consent page](#the-consent-page). ChatBox connects this way.

## Connecting with a client ID and secret: Claude

1. Run the app on a public HTTPS domain. Claude connects from Anthropic's servers rather than from your browser, so it cannot reach `localhost`. **Your server should be located in a [supported country and region](https://www.anthropic.com/supported-countries)**.
2. Choose a client ID and a client secret, e.g. `openssl rand -hex 32` for the secret.
3. Set the [MCP settings](deployment.md#mcp-server), including the `Mcp:Clients:0:*` entry, and restart the app. With the [Docker Compose setup](deployment.md#option-a-vps-with-docker-compose), uncomment the `Mcp__*` lines in `.env` and fill them in, then run `docker compose up -d`.
4. In Claude, [add a custom connector](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp) with the URL `<Mcp:BaseUrl>/mcp`, and enter the client ID and secret in its advanced settings.
5. Connect, and sign in with a Google account whose email is in `Auth:AllowedEmails`.

Any other client that accepts a client ID and secret connects the same way. Give each client its own entry at the next index, e.g. `Mcp:Clients:1`, with its own `ClientId`, `ClientSecret`, and the `RedirectUri` that client uses for its OAuth callback.

## Connecting with a Client ID Metadata Document: ChatBox

1. Set `Mcp:Enabled` and `Mcp:BaseUrl` (see [MCP settings](deployment.md#mcp-server)) and restart the app. No `Mcp:Clients` entry is needed. ChatBox connects from your computer, so the app must be reachable from it.
2. In ChatBox, add a remote MCP server with the URL `<Mcp:BaseUrl>/mcp`.
3. Sign in with a Google account whose email is in `Auth:AllowedEmails`.
4. Check ChatBox's details on the consent page and approve.

Any other client that supports Client ID Metadata Documents connects the same way. On every sign-in, Food Diary downloads the client's metadata document from its client ID URL, so the app needs outbound HTTPS access to the internet. It refuses documents on private or local network addresses. If the document is unreachable or invalid, the sign-in stops on an error page that says why.

### The consent page

After you sign in with Google, Food Diary shows which client is asking for access:

- its logo, or the first letter of its name when it has none;
- its name, and what it will be able to do: view your food logs and products, but not change them;
- the host it is identified by, i.e. the host of its client ID URL. Anyone can copy an app's name and logo, but not this host, so check it;
- the host it receives access on.

When the client receives access only on your own computer, as ChatBox does, the page also warns you. Approve only if you started the sign-in yourself.

**Approve** sends you back to the client, which then has access. **Deny** sends you back without access. The page asks on every sign-in, works once, and expires after 10 minutes. If it says the request has expired, start again from the client.

Clients connected with a client ID and secret skip this page, because you configured them yourself.

## Staying connected

A connected client stays connected as long as it keeps using the server. Each time it renews its access, it receives a new refresh token valid for another 30 days ([`Mcp:RefreshTokenLifetime`](deployment.md#mcp-server)). A client that goes unused for longer than that has to sign in again.

Each refresh token works only once. If the same refresh token is used twice, for example by someone who copied it, the server ends that connection and the client has to sign in again.

### Upgrading from 0.9.2 or earlier

Connections made with Food Diary 0.9.2 or earlier must sign in once after you upgrade. Their refresh tokens are no longer accepted, so the client asks you to sign in with Google again the next time it renews its access.
