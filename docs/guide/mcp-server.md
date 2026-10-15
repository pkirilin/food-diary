# MCP server

Food Diary can share your food logs and products with Claude, or any other compatible [MCP](https://modelcontextprotocol.io) client, so you can ask things like "what did I eat last week?" or "plan my meals for next week". Access is read-only: the client can look at your data but never change it.

The server is off by default. It lives at `/mcp` on your Food Diary domain, and you turn it on with the [MCP settings in the configuration reference](deployment.md#mcp-server).

## Connecting Claude

1. Run the app on a public HTTPS domain. Claude connects from Anthropic's servers rather than from your browser, so it cannot reach `localhost`. **Your server should be located in a [supported country and region](https://www.anthropic.com/supported-countries)**.
2. Choose a client ID and a client secret, e.g. `openssl rand -hex 32` for the secret.
3. Set the [MCP settings](deployment.md#mcp-server) and restart the app. With the [Docker Compose setup](deployment.md#option-a-vps-with-docker-compose), uncomment the `Mcp__*` lines in `.env` and fill them in, then run `docker compose up -d`.
4. In Claude, [add a custom connector](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp) with the URL `<Mcp:BaseUrl>/mcp`, and enter the client ID and secret in its advanced settings.
5. Connect, and sign in with a Google account whose email is in `Auth:AllowedEmails`.

## Other MCP clients

Any MCP client that supports OAuth with a pre-registered client ID and secret can connect the same way. Give each client its own entry at the next index, e.g. `Mcp:Clients:1`, with its own `ClientId`, `ClientSecret`, and the `RedirectUri` that client uses for its OAuth callback.

## Staying connected

A connected client stays connected as long as it keeps using the server. Each time it renews its access, it receives a new refresh token valid for another 30 days ([`Mcp:RefreshTokenLifetime`](deployment.md#mcp-server)). A client that goes unused for longer than that has to sign in again.

Each refresh token works only once. If the same refresh token is used twice, for example by someone who copied it, the server ends that connection and the client has to sign in again.

### Upgrading from 0.9.2 or earlier

Connections made with Food Diary 0.9.2 or earlier must sign in once after you upgrade. Their refresh tokens are no longer accepted, so the client asks you to sign in with Google again the next time it renews its access.
