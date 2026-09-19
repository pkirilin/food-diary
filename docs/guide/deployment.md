# Deploying Food Diary

Food Diary ships as a single Docker image, [`pkirilin/food-diary`](https://hub.docker.com/r/pkirilin/food-diary), that needs a PostgreSQL database and HTTPS in front of it. This guide shows two ways to run it:

- [Option A](#option-a-vps-with-docker-compose): on a server you rent, with a ready-made Docker Compose file that also sets up the database and HTTPS for you.
- [Option B](#option-b-container-platform): on a container platform you already use.

## What you need

- **A place to run it.** Either a Linux server with [Docker](https://docs.docker.com/engine/install/) and the Compose plugin, such as a small rented VPS, or a container platform. The image is built for `linux/amd64` only, so ARM servers won't run it.
- **A domain name.** For Option A, create a DNS record pointing at your server. Google sign-in and the MCP server both need HTTPS on a real domain; plain `localhost` only works for a quick local try.
- **A Google account.** You sign in with it, and you use it to create the OAuth client below. Only the email addresses you list in `Auth__AllowedEmails__0`, `__1`, … can sign in.
- **Optional: an OpenAI API key**, or a key for any OpenAI-compatible API, to fill in products from a photo.

## Set up Google sign-in

Food Diary uses Google to sign you in, so you need your own OAuth client:

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and create a project, or pick an existing one.
2. Configure the OAuth consent screen. While the app is in testing, add your own Google account as a test user.
3. Create an OAuth client ID of type **Web application** with authorized redirect URI: `https://<your-domain>/signin-google`.
4. Copy the client ID and client secret. They go into `GoogleAuth__ClientId` and `GoogleAuth__ClientSecret`.

Google's own guide has the details: [Manage OAuth clients](https://support.google.com/cloud/answer/6158849).

## Option A: VPS with Docker Compose

[`deploy/compose.yml`](../../deploy/compose.yml) runs three containers:

- the app
- PostgreSQL, storing its data in a Docker volume
- [Caddy](https://caddyserver.com/), a reverse proxy that gets and renews a Let's Encrypt certificate for your domain automatically

1. Point your domain's DNS record at the server, and make sure ports 80 and 443 are open.
2. On the server, create a folder and download the two files:

   ```shell
   mkdir food-diary && cd food-diary
   curl -fsSLO https://raw.githubusercontent.com/pkirilin/food-diary/main/deploy/compose.yml
   curl -fsSLO https://raw.githubusercontent.com/pkirilin/food-diary/main/deploy/.env.example
   ```

3. Copy the example settings and fill them in. The required ones are at the top, and each is described in the [configuration reference](#configuration-reference):

   ```shell
   cp .env.example .env
   nano .env
   ```

4. Start everything:

   ```shell
   docker compose up -d
   ```

5. Open `https://<your-domain>` and sign in.

Already running a reverse proxy on the server? Delete the `caddy` service from `compose.yml`, publish the app's port by adding `ports: ["127.0.0.1:8080:8080"]` to the `web` service, and point your proxy at `http://127.0.0.1:8080`. Your proxy must set the `X-Forwarded-Proto` header.

## Option B: container platform

Food Diary runs on any platform that can run a Docker image, e.g. [Dokploy](https://dokploy.com/), [Coolify](https://coolify.io/), or [Amvera](https://amvera.ru/). The steps depend on your platform, but this is what the app needs from it:

- Run the `pkirilin/food-diary` image.
- The container listens on port 8080. If your platform assigns its own port, set `ASPNETCORE_HTTP_PORTS` to it.
- Provide a PostgreSQL database and set `ConnectionStrings__Default` to reach it.
- Database migrations run automatically every time the container starts. If the database is unreachable, the container exits with an error instead of starting.
- Terminate HTTPS in front of the app and set `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`, so the app knows it is served over HTTPS.
- Health checks: `/healthz/live` and `/healthz/ready` both answer `200` once the app is up.
- Set the required variables from the [configuration reference](#configuration-reference).

## Configuration reference

The app reads its settings from environment variables. Each variable's name is its configuration key with `:` replaced by `__`. For Option A, put them in `.env`; the compose file already sets `ConnectionStrings__Default`, `ASPNETCORE_FORWARDEDHEADERS_ENABLED` and `Mcp__BaseUrl` for you.

### Required

Configuration key           | Environment variable         | Description
----------------------------|------------------------------|---------------------------------------------------------------------------------------------------------------
`ConnectionStrings:Default` | `ConnectionStrings__Default` | PostgreSQL connection string, e.g. `User ID=postgres;Password=<password>;Host=<host>;Port=5432;Database=FoodDiary`
`Auth:AllowedEmails:0`      | `Auth__AllowedEmails__0`     | Google account email allowed to sign in. Add more at the next index: `Auth__AllowedEmails__1`, and so on
`GoogleAuth:ClientId`       | `GoogleAuth__ClientId`       | Client ID of your [Google OAuth client](#set-up-google-sign-in)
`GoogleAuth:ClientSecret`   | `GoogleAuth__ClientSecret`   | Client secret of your Google OAuth client

Option A also needs two variables that only the compose file reads:

Variable            | Description
--------------------|----------------------------------------------------------------------------------
`DOMAIN`            | Your domain without `https://`, e.g. `food.example.com`. Caddy gets the certificate for it
`POSTGRES_PASSWORD` | Password for the bundled database, e.g. generated with `openssl rand -hex 32`

### Hosting

Environment variable                  | Default | Description
--------------------------------------|---------|-------------------------------------------------------------------------------------------------------------
`ASPNETCORE_FORWARDEDHEADERS_ENABLED` | `false` | Set to `true` when HTTPS terminates at a reverse proxy in front of the app. Without it, the app builds an `http://` redirect URI and Google sign-in fails
`ASPNETCORE_HTTP_PORTS`               | `8080`  | Port the container listens on
`App__Logging__WriteLogsInJsonFormat` | `false` | Write logs as JSON instead of plain text, for log collectors that parse JSON

### AI food recognition

Optional. Without an API key, everything except filling in products from a photo works as usual.

Configuration key               | Environment variable            | Default                     | Description
--------------------------------|---------------------------------|-----------------------------|-----------------------------------------------------------------------
`Integrations:OpenAI:ApiKey`    | `Integrations__OpenAI__ApiKey`  | —                           | API key for OpenAI or an OpenAI-compatible API
`Integrations:OpenAI:BaseUrl`   | `Integrations__OpenAI__BaseUrl` | `https://api.openai.com/v1` | Override to use another OpenAI-compatible API
`Integrations:OpenAI:Model`     | `Integrations__OpenAI__Model`   | `gpt-5.4-mini`              | Model used to recognize food in photos. It must accept image input

### MCP server

Optional. See the [MCP server guide](mcp-server.md) for how to connect a client.

Configuration key            | Environment variable            | Default                                   | Description
-----------------------------|---------------------------------|-------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
`Mcp:Enabled`                | `Mcp__Enabled`                  | `false`                                   | Enables the MCP server and its OAuth endpoints. When `false`, `/mcp`, `/authorize`, `/token` and `/.well-known/*` return `404`
`Mcp:BaseUrl`                | `Mcp__BaseUrl`                  | —                                         | Public origin of the app, e.g. `https://food.example.com`: the connector URL without `/mcp`. Must use `https` (`http` is allowed only for `localhost`), with no path, query or trailing slash
`Mcp:Clients:0:ClientId`     | `Mcp__Clients__0__ClientId`     | —                                         | Client ID entered in the Claude connector
`Mcp:Clients:0:ClientSecret` | `Mcp__Clients__0__ClientSecret` | —                                         | Client secret entered in the Claude connector. Keep it out of source control
`Mcp:Clients:0:RedirectUri`  | `Mcp__Clients__0__RedirectUri`  | —                                         | OAuth callback of the client. For Claude, it is `https://claude.ai/api/mcp/auth_callback`
`Mcp:AccessTokenLifetime`    | `Mcp__AccessTokenLifetime`      | `01:00:00`                                | How long an access token is valid before Claude has to refresh it
`Mcp:RefreshTokenLifetime`   | `Mcp__RefreshTokenLifetime`     | `30.00:00:00`                             | How long a connection lasts, counted from when you connected. Refreshing does not extend it, so reconnect Claude once it expires

Another OAuth client goes at the next index, e.g. `Mcp:Clients:1`, with its own `ClientId`, `ClientSecret` and `RedirectUri`.

With `Mcp:Enabled` set, the app refuses to start while a required value is missing or malformed, and names the key.

## Updating

Database migrations run automatically on start, so updating is a pull and a restart. For Option A:

```shell
docker compose pull
docker compose up -d
```

`compose.yml` uses the `latest` tag. To stay on a specific version, replace `latest` with a tag from the [releases page](https://github.com/pkirilin/food-diary/releases), e.g. `pkirilin/food-diary:1.2.3`, and change it when you choose to update.

## Backups

All your data lives in the PostgreSQL database. For Option A, dump it to a file:

```shell
docker compose exec -T db pg_dump -U postgres -d FoodDiary > food-diary-$(date +%F).sql
```

Keep the file somewhere other than the server. To restore it into a fresh install, start only the database, load the dump, then start the rest:

```shell
docker compose up -d db
docker compose exec -T db psql -U postgres -d FoodDiary < food-diary-<date>.sql
docker compose up -d
```

The bundled database is PostgreSQL 15. Moving to a newer major version can't reuse the existing data volume: back up, switch the image, and restore into a fresh volume.
