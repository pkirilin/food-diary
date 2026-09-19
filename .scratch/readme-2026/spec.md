# Spec: README 2026 — user-first README and split documentation

Status: ready-for-agent

## Problem Statement

The README serves two readers at once and serves neither well:

1. It does not say why anyone would use the app, what value it brings, or which problem it solves.
2. It does not explain, step by step and in plain English, how to get started. The only "Installation" section runs a `docker-compose.yml` that builds the image from source, uses development certificates, and only works on `https://localhost:8080`. The published Docker Hub image `pkirilin/food-diary` never appears in any install step.
3. Maintainer material — backend secrets, local dev setup, frontend `VITE_APP_*` variables, EF migrations, the release process — makes up most of the page and overwhelms a user.
4. Parts are outdated or wrong: `cat .env.example >> .env` appends instead of copying, commands use `docker-compose` (v1), `.env.example` lacks variables the README documents, and `amvera.yml` survives the move away from Amvera.

## Solution

A short, user-first README that answers "why", "how do I start", and links out for everything else. Detailed content moves into dedicated pages:

- user guides under `docs/guide/`
- maintainer guides flat in `docs/`
- a `CONTRIBUTING.md` that links the maintainer guides

A new `deploy/compose.yml` gives self-hosters a copy-paste setup that pulls the released image, with PostgreSQL and a Caddy reverse proxy that obtains a TLS certificate automatically. The root compose files, which only the e2e suite uses, move into `tests/`.

## User Stories

1. As a visitor, I want to learn in the first screen what the app is for and what it deliberately does not do, so that I can decide quickly whether it fits me.
2. As a visitor, I want to try a demo without installing anything, so that I can judge the app before committing to self-hosting.
3. As a visitor, I want to know upfront that I run my own copy and what that requires, so that I am not surprised half-way through setup.
4. As a self-hoster with a rented VPS, I want a compose file I can download and start, with HTTPS handled for me, so that I get from a blank server to a working app without assembling pieces myself.
5. As a self-hoster on a container platform, I want a checklist of what the app requires from any platform, so that I can deploy on the platform I already know.
6. As a self-hoster, I want short Google sign-in setup steps with the exact values to enter, and a link for details, so that the hardest step does not stop me.
7. As a self-hoster, I want one reference listing every configuration variable, MCP included, so that I never hunt across pages.
8. As a self-hoster, I want to know how to update the app and back up my data, so that owning my data does not mean risking it.
9. As a user, I want to understand what connecting Claude (or another MCP client) gives me and how to connect it, so that I can ask questions about what I ate.
10. As a contributor, I want a `CONTRIBUTING.md` that points to dev setup and the release process, so that maintainer detail does not clutter the user-facing README.

## Implementation Decisions

### Terminology

User-facing prose says **food log**, per `CONTEXT.md` (updated in this effort: Food Log is canonical, Note is the legacy name). Older UI text still says "note"; the docs do not mirror it.

### README.md

Sections, in order:

1. **Overview**
   - The pitch, drawn from `STRATEGY.md`:
     - instant daily calorie and macro totals, unlike paper
     - your data on your own server, with no subscription and no ads
     - only the essentials, plus AI photo logging and read-only access for MCP clients
   - The 2018 origin story, in one line.
   - A short "you run your own copy" statement: a server or container platform with Docker, a Google account for sign-in, and a domain with HTTPS for use outside `localhost`.
   - A **What it doesn't do** list. It replaces the vague "doesn't fully replace commercial apps" disclaimer:
     - No barcode scanning
     - No built-in food database — you build your own product list
     - No calorie or macro goals
     - No exercise or activity tracking
     - No syncing with fitness trackers
     - One person per install; no social or sharing features
     - No app-store app — install it from the browser as a PWA
2. **Quick start**
   - A "Try the demo" link: <https://pkirilin.github.io/food-diary/>.
   - Four short self-hosting steps, each linking into `docs/guide/deployment.md`:
     1. Get a VPS and a domain.
     2. Set up Google sign-in.
     3. Download `deploy/compose.yml` and `deploy/.env.example`, then fill in `.env`.
     4. Run `docker compose up -d`.
3. **Features** — the existing bullet list and the four existing screenshots in `docs/images/`, unchanged.
4. **MCP server** — a two-sentence summary linking to `docs/guide/mcp-server.md`.
5. **Self-hosting** — a link to `docs/guide/deployment.md`.
6. **Browser support** — the existing table, unchanged.
7. **Contributing** — a link to `CONTRIBUTING.md`. It replaces the Contacts section, and the email address is removed.
8. **License** — AGPLv3, plus a one-line **Credits** entry for the favicon that keeps what CC-BY 4.0 requires:
   - Twemoji `1f96c`
   - © 2020 Twitter, Inc and other contributors
   - a link to the source
   - CC-BY 4.0

The badges stay. The table of contents is dropped or reduced to match the shorter page.

### docs/guide/deployment.md

Sections, in order:

1. **What you need**
2. **Set up Google sign-in** — concise, high-level steps and a link to Google's documentation. Carry over the exact values: authorized JavaScript origin `https://<your-domain>`, redirect URI `https://<your-domain>/signin-google`.
3. **Option A: VPS with Docker Compose** — a walkthrough of `deploy/compose.yml`:
   1. Point the domain's DNS at the server.
   2. Download the two files.
   3. Copy `.env.example` to `.env` (with `cp`) and fill it in.
   4. Run `docker compose up -d`.
   5. Open `https://<your-domain>`.

   Note that anyone who already runs a reverse proxy can remove the Caddy service.
4. **Option B: container platform** — a platform-neutral requirements checklist, plus one sentence of non-exhaustive examples (e.g. Dokploy, Coolify, Render, Heroku). The checklist:
   - Run the `pkirilin/food-diary` image.
   - The container listens on port 8080. Set `ASPNETCORE_HTTP_PORTS` if the platform assigns its own port.
   - It needs a PostgreSQL database.
   - Migrations run automatically on container start, and the container exits non-zero if the database is unreachable.
   - HTTPS terminates in front of the app, with `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`.
   - Health checks are `/healthz/live` and `/healthz/ready`.
   - Set the variables from the configuration reference.
5. **Configuration reference** — **every** variable a self-hoster may set, in one table or grouped tables. Give each its configuration key, environment variable, default and description:
   - database: `ConnectionStrings:Default`
   - auth: `Auth:AllowedEmails:N`, `GoogleAuth:ClientId`, `GoogleAuth:ClientSecret`
   - OpenAI: `Integrations:OpenAI:BaseUrl`, `ApiKey`, `Model` (default from `appsettings.json`)
   - **all MCP variables** (the current README table moves here verbatim, including the note on adding `Mcp:Clients:1`)
   - hosting: `ASPNETCORE_FORWARDEDHEADERS_ENABLED`, `ASPNETCORE_HTTP_PORTS`
   - anything else in `appsettings.json` that is still read and worth overriding — verify each key is used before listing it

   Frontend `VITE_APP_*` variables are **not** listed here. They are baked in at build time, and the published image is built without them.
6. **Updating** — pull the new image and restart; migrations apply on start. Add one line on pinning a version tag instead of `latest`.
7. **Backups** — how to dump the PostgreSQL database from the compose setup, and a note that a PostgreSQL major-version upgrade requires dump and restore.

This page merges what the design discussion first proposed as `self-hosting.md`, `container-platforms.md` and `google-sign-in.md`.

### docs/guide/mcp-server.md

- Opens with two plain-English sentences on what MCP gives you, e.g. "ask Claude what you ate last week".
- The main section is **Connecting Claude**: the current README steps, carried over. They cover:
  - the public HTTPS domain requirement
  - the supported-countries note
  - choosing a client ID and secret
  - adding a custom connector with the URL `<Mcp:BaseUrl>/mcp`
  - signing in with an allowed Google account
- Notes that it works in every compatible MCP client, and that a non-Claude client needs its own client entry (`Mcp:Clients:1`, with that client's redirect URI).
- The variables are **not** duplicated. The page links to the MCP rows of the configuration reference in `deployment.md`.

### docs/development.md

The current README "Development" content, moved and corrected:

- prerequisites
- the local PostgreSQL container
- user-secrets
- migrations
- starting the API and the frontend
- the mocked-frontend setup
- the full `VITE_APP_*` table
- creating an EF migration

Keep "Navigate to `https://localhost:8080`" after `yarn start`. It is correct, because in Development the API forwards page requests to the Vite dev server on 5173. Add a short clarifying phrase saying so.

### docs/releasing.md

The current README "Releasing" section, moved as-is.

### CONTRIBUTING.md

- Links `docs/development.md` and `docs/releasing.md`.
- Says where to ask questions or report problems: GitHub Issues.
- Does **not** link `CONTEXT.md`, `docs/adr/`, `docs/agents/` or the `.scratch/` issue tracker. Those are for LLM agents, not human contributors.
- No GitHub Discussions and no issue templates.

### deploy/compose.yml and deploy/.env.example

- **`web`**
  - Image: `pkirilin/food-diary:latest`.
  - `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`.
  - Connection string pointing at the `db` service.
  - Auth, Google, OpenAI and MCP variables taken from `.env`.
  - OpenAI and MCP are optional. An unset optional variable must not break startup, so use defaults such as `${MCP_ENABLED:-false}`.
- **`db`**
  - Image: `postgres:15-alpine`, with a named volume for data.
  - A healthcheck, which `web` depends on.
- **`caddy`**
  - Reverse proxy to `web:8080` for `${DOMAIN}`, with automatic Let's Encrypt certificates.
  - Named volumes for Caddy's data and config.
  - Configured inline (e.g. `caddy reverse-proxy --from ... --to web:8080`) so self-hosters download only two files.
- **`deploy/.env.example`** lists every variable the compose file reads: domain, allowed email, Google client ID and secret, database password, OpenAI base URL/key/model, and MCP enabled/client ID/secret. Required and optional variables are clearly separated.

### Test infrastructure consolidation

The root `docker-compose.yml` is unused; CI runs `tests/docker-compose.yml`.

- Delete the root `docker-compose.yml` and root `.env.example`.
- Merge `docker-compose.base.yml` into a single `tests/compose.yml`, replacing `tests/docker-compose.yml`, and delete the base file.
- Move `certs/` to `tests/certs/` and update the volume path. `certs/` is referenced only by the compose base file.
- Keep the `postgres:15.1-alpine` pin in e2e.
- Update the path filters in `.github/workflows/build.yml` and `.github/workflows/deploy-demo.yml`, which currently match `docker-compose.*` and `certs/**`.
- Update `tests/README.md` to `docker compose`.

### Housekeeping

- Delete `amvera.yml`.
- `CLAUDE.md`:
  - The frontend section says "full env-var list in README"; point it to `docs/development.md`.
  - Browser support still points to the README section, which stays; verify.
  - The "Full stack" command block runs the root `docker-compose.yml`; replace it with `deploy/compose.yml`, or remove it.
  - Check the E2E Docker note.
- `docs/agents/writing-docs.md`: amend the "Do not assume a deployment platform" rule. A clearly non-exhaustive list of example platforms is allowed. The guide itself must stay platform-neutral.
- `CHANGELOG.md` `[Unreleased]`: add the new self-hosting compose file (`deploy/compose.yml`, which pulls the released image and uses Caddy for HTTPS), and note that the documentation was reorganized.

## Testing Decisions

- **`deploy/compose.yml`**
  - `docker compose -f deploy/compose.yml config` must validate with an `.env` copied from `deploy/.env.example`.
  - A full run with a real domain and Let's Encrypt cannot be automated; it is verified manually by the owner.
- **e2e consolidation**: the `e2e-tests` CI job must pass after the move to `tests/compose.yml` and `tests/certs/`. Running it locally requires Docker. Per `CLAUDE.md`, if Docker is unavailable, stop and ask.
- **Docs**
  - `markdownlint-cli2` passes (the repo has `.markdownlint-cli2.jsonc`).
  - Every relative link between README, `CONTRIBUTING.md` and `docs/` resolves.
  - No content from the current README is lost unless this spec drops it on purpose (the Contacts email, the verbose favicon block).

## Out of Scope

- New screenshots — the four existing images stay.
- GitHub Discussions and issue templates.
- Renaming `Note` to `FoodLog` in code or UI text. The glossary now prefers Food Log for new UI text; migrating legacy UI is separate work.
- Per-platform deployment guides.
- Changing the e2e PostgreSQL version.
- Any application code change.
