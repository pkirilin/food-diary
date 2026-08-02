# Amvera migration — design

Date: 2026-07-30
Status: proposed

## Context

Food Diary's frontend and backend run on Yandex Cloud (YC) as a serverless
container. Three problems motivate the move:

1. **Region.** YC offers only Russia. The region suffers availability problems
   caused by local and foreign regulation, and it blocks planned work such as a
   Food Diary MCP server, since modern AI providers require access from other
   regions.
2. **Platform limits.** YC serverless containers reject large payloads, which
   breaks large image upload, and support Server-Sent Events only partially.
3. **Cost.** A minimum-configuration container with one provisioned instance
   costs roughly 650 RUB/month.

The database stays on Supabase and is out of scope.

## Goals

- Food Diary is hosted and reachable from a region outside Russia.
- Deploys are automated behind a single command.
- YC artifacts are gone from the repository.
- README documents self-hosting and the deployment procedure.

## Decision

Host the app on **Amvera Cloud, Warsaw region**, tariff **Начальный**
(0.5 GB RAM, 0.25 vCPU, 290 RUB/month).

Amvera **never builds the project**. The deployable artifact is the Docker image
already published to Docker Hub by `release.yml`. Amvera is configured with
`build.skip: yes` and `run.image`, so a deploy is a pull of an existing image.

All deploys run from the developer machine through `scripts/deploy.sh`. GitHub
Actions performs verification only and holds no deployment credentials.

### Why this shape

**Amvera over a self-hosted VPS.** A VPS in the Netherlands or Switzerland would
be cheaper (zero marginal cost, the server already exists), fully outside Russian
jurisdiction, and would put payload-size and SSE limits under our own control.
Amvera was chosen anyway for familiarity, developer-friendly deploys, and low
maintenance. The design keeps the escape hatch cheap: the deployable artifact is
a plain Docker image, so moving to the VPS later is a compose file plus a DNS
change, not a redesign.

**Prebuilt image over building on Amvera.** Amvera bills the build container at
the app's tariff and clones only what git tracks. Building this repo there means
running `dotnet publish` and `yarn build` on 0.25 vCPU on every deploy, paying
for a second instance while it runs. Skipping the build removes that cost
entirely and makes a deploy take seconds.

**Local `deploy.sh` over GitHub Actions.** Amvera's git remote authenticates with
the Amvera **account** username and password — there is no scoped deploy token.
Automating deploys from CI would mean storing full-account credentials in GitHub
secrets. Running deploys locally keeps those credentials in the developer's git
credential helper. The Amvera CLI is unusable from CI regardless: it forces an
interactive re-login after 24 hours of inactivity.

**Immutable image tags.** `amvera.yml` never references a moving tag. A moving
tag risks Amvera reusing a cached image and silently not updating, and it makes
the deployed version unknowable. `deploy.sh` resolves `latest` to a concrete
release tag before writing the config.

## Architecture

### Amvera project

A single Amvera application ("Приложение") in the Warsaw region. It is connected
to no external repository and has no webhook; its git repo is purely a push
target.

That repo contains exactly one file, which is all `build.skip` requires:

```yaml
build:
  skip: yes
run:
  image: pkirilin/food-diary:0.6.1
  containerPort: 8080
```

No `meta` section is needed — Amvera defaults to the docker environment.

The image is started with no `ASPNETCORE_URLS` override, so Kestrel listens on
plain HTTP on port 8080. Amvera's nginx ingress terminates TLS and forwards to
the access service on the default `servicePort` 80.

`scripts/deploy.sh` renders this file from `deploy/amvera.yml.template` and
pushes it as a **single-file orphan commit** to the Amvera remote's `master`
branch, force-pushing. Consequences:

- No source code is ever sent to Amvera, so the push is instant.
- The GitHub repository's history never churns with deploy tags.
- Force-pushing keeps the Amvera repo deterministic and avoids divergence from
  config commits that Amvera's web UI creates.

Pushing to the Amvera repo's `master` is what triggers their pipeline. With the
build skipped, it proceeds straight to deployment.

### Deploy flow

```
./scripts/deploy.sh                   # deploy newest published release
./scripts/deploy.sh --tag 0.6.0       # deploy a specific published tag (rollback)
./scripts/deploy.sh --build           # build HEAD, push <short-sha>, deploy it
./scripts/deploy.sh --registry ghcr   # with --build, push to ghcr.io instead
```

Default (no arguments) deploys the newest image already on Docker Hub and builds
nothing. Because `latest` is a moving tag, the script resolves it to a concrete
tag: it reads the digest behind `pkirilin/food-diary:latest` from Docker Hub's
public tags API and selects the named tag sharing that digest. If no named tag
matches, it falls back to a digest reference (`pkirilin/food-diary@sha256:...`).

Steps, in order:

1. **Preflight.** Docker daemon reachable; `amvera whoami` succeeds (otherwise
   instruct the user to run `amvera login`); working tree clean; `.env.amvera`
   present. Abort on any failure before touching remote state.
2. **Resolve the image reference** per the rules above, or build it when
   `--build` is passed: `docker buildx build --platform linux/amd64 --push`
   tagged with the short SHA of HEAD.
3. **Run database migrations** against Supabase using
   `FoodDiary.Migrator` with the connection string from `.env.amvera`.
4. **Sync environment variables** to Amvera via `amvera env` from `.env.amvera`.
5. **Render and push `amvera.yml`** as an orphan commit to the Amvera remote.
6. **Tail `amvera logs run`** so the outcome is visible without opening the UI.

Migrations run before the image reference is pushed, so the schema always leads
the code.

### Dockerfile cross-compilation

The development machine is arm64; Amvera runs amd64. Building with
`--platform linux/amd64` as the Dockerfile stands today would run `dotnet
publish` and `yarn install` under QEMU emulation, costing tens of minutes per
build.

The build stages become build-platform native, and only the runtime layer is
target-platform:

- `FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:10.0 AS backend`,
  with `ARG TARGETARCH` and `dotnet publish -a $TARGETARCH`.
- `FROM --platform=$BUILDPLATFORM node:24-alpine AS frontend` — the output is
  JavaScript, so it is architecture-neutral.
- The final `mcr.microsoft.com/dotnet/aspnet:10.0` stage stays on the target
  platform.

On amd64 runners this is a no-op, so `docker-compose`, the e2e suite, and
`release.yml` are unaffected.

### Configuration and secrets

Runtime configuration lives in Amvera environment variables and secrets, seeded
from a gitignored `.env.amvera` on the developer machine:

| Name | Kind |
|---|---|
| `Auth__AllowedEmails__0` | secret |
| `ConnectionStrings__Default` | secret |
| `GoogleAuth__ClientId` | secret |
| `GoogleAuth__ClientSecret` | secret |
| `Integrations__OpenAI__BaseUrl` | secret |
| `Integrations__OpenAI__ApiKey` | secret |
| `ASPNETCORE_FORWARDEDHEADERS_ENABLED` | variable, `true` |

### Protecting `.env.amvera`

`.env.amvera` holds the production database connection string, the Google OAuth
client secret, and the OpenAI API key in plaintext. It lives at the repository
root, so it must be unreachable to both git and coding agents.

**Git.** `.gitignore` gains an explicit `.env.amvera` entry. The existing `.env`
line does not cover it — that pattern matches only a file named exactly `.env`.
`scripts/deploy.sh` preflight asserts `git check-ignore -q .env.amvera` and
aborts if it fails, so an accidental `.gitignore` edit cannot quietly expose the
file across future deploys.

**Coding agents.** `.claude/settings.json` gains deny rules for the file. The
repo's `permissions.allow` list contains `Read(./**)`; `deny` takes precedence
over `allow`, so a deny entry is sufficient and no allow entry needs changing:

```jsonc
"deny": [
  "Read(./.env.amvera)",
  "Bash(cat .env.amvera:*)",
  "Bash(cat ./.env.amvera:*)"
]
```

The `Read` rule is the real boundary — it blocks the file tool and keeps the
file out of anything the agent indexes. The `Bash` entries are defence in depth
against the obvious shortcut only: shell deny rules match command strings, so
`grep`, `source`, `env -f`, or any other reader still gets through. Treat the
file as readable by any agent granted broad shell access, and do not paste its
contents into a conversation.

**The script itself.** `deploy.sh` loads the file into the environment in a
subshell, never echoes values, and keeps `set -x` off around the `amvera env`
calls so secrets do not reach the terminal, CI logs, or an agent transcript.
Preflight reports only whether each expected key is present, never its value.

Anyone wanting the secrets outside the repository entirely can point
`AMVERA_ENV_FILE` at another path; the repo-root default is what README
documents, matching the existing `.env` convention.

### HTTPS scheme behind the Amvera proxy

Amvera terminates TLS at its ingress and forwards plain HTTP to the container.
Without correction, Kestrel sees `http`, `UseHttpsRedirection` loops, and Google
OAuth generates `http://` redirect URIs.

The custom `App__ForwardHttpsSchemeManuallyForAllRequests` option is **removed**
in favour of the framework's own mechanism: `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`.
This is the documented way to forward the scheme behind non-IIS reverse proxies.
`Program.cs` already uses `Host.CreateDefaultBuilder(...).ConfigureWebHostDefaults(...)`,
which honours the variable by configuring `ForwardedHeadersOptions` with
`XForwardedFor | XForwardedProto`, clearing `KnownNetworks`/`KnownProxies`, and
registering a startup filter that runs `UseForwardedHeaders` ahead of every
middleware in `Startup.Configure`. No application code is needed.

It is strictly better than the option it replaces: the manual middleware forced
`Scheme = "https"` on *all* requests including local and health-check traffic,
and discarded the real client IP. Forwarded headers also populate
`RemoteIpAddress`, so Serilog request logs show the caller instead of the
ingress.

The trade-off is a dependency on Amvera's ingress actually sending
`X-Forwarded-Proto`. Amvera documents an "Ingress Controller" but not its header
behaviour; Kubernetes ingress-nginx, which that terminology implies, sets
`X-Forwarded-For/-Proto/-Host/-Port` and `X-Real-IP` unconditionally. This is an
inference, not a documented guarantee — see Risks.

Microsoft warns that this flag uses cloud defaults and does not restrict which
proxies are trusted. That is acceptable here: the container is reachable only
through Amvera's ingress, and no authorization decision depends on client IP.

Local development and `docker-compose` are unaffected — there Kestrel terminates
TLS itself (`ASPNETCORE_URLS=https://+:443`), so no forwarding is involved and
the variable is not set.

`App__Logging__WriteLogsInJsonFormat` is left at its `false` default — Amvera's
log viewer renders plain console output more readably than JSON.

Amvera applies variable changes only after a container restart, and does not
expose them during build. Neither constrains this design, since nothing is built
on Amvera.

### Domain and authentication

The app uses a subdomain of a domain the author already owns, rather than the
free `<project>.<user>.amvera.io`. The URL then belongs to the project, so a
later move to the VPS is a DNS change that does not invalidate Google OAuth
configuration, saved sessions, or installed PWAs.

Setup is a one-time manual step — Amvera exposes no CLI for domains:

1. Point an A record at the IP shown in the Amvera project settings.
2. Add the TXT record shown alongside it.
3. Confirm and attach the domain in the Amvera UI, then wait for the Let's
   Encrypt certificate.

The Google OAuth client must be updated in the same change: authorized
JavaScript origin `https://<app-domain>`, authorized redirect URI
`https://<app-domain>/signin-google`.

## Removals

Yandex Cloud artifacts to delete:

- `.github/workflows/deploy.yml` — the entire workflow.
- The `run-migrations`, `build-and-push-image`, and `deploy` jobs in
  `.github/workflows/build.yml`, leaving verification only (backend, frontend,
  e2e).
- `src/backend/src/FoodDiary.API/Logging/YandexCloudJsonFormatter.cs`.
- `AppOptions.LoggingOptions.UseYandexCloudLogsFormat` and its branch in
  `LoggerConfigurationExtensions.WriteToConsole`.
- The `UseYandexCloudLogsFormat` keys in `appsettings.json` and
  `appsettings.Development.json`.

Also removed, as superseded by `ASPNETCORE_FORWARDEDHEADERS_ENABLED`:

- `AppOptions.ForwardHttpsSchemeManuallyForAllRequests` and the
  scheme-rewriting middleware it guards in `Startup.Configure`.
- The `ForwardHttpsSchemeManuallyForAllRequests` keys in `appsettings.json` and
  `appsettings.Development.json`.

GitHub repository secrets left unused after this change, to be deleted manually:
`YC_CR_REGISTRY`, `YC_SA_JSON_CREDENTIALS`, `YC_FOLDER_ID`,
`YC_REVISION_SERVICE_ACCOUNT_ID`, `Migrator_DatabaseConnectionString`, and the
`YC_REVISION_SECRETS_ID` / `YC_REVISION_SECRETS_VERSION` variables.

Removing `run-migrations` from CI is deliberate. With deploys now manual, a CI
job migrating Supabase on every merge to `main` would change the production
schema at a moment unrelated to any deploy, leaving the running old code to meet
a new schema.

Deliberately kept: `Dockerfile` (modified for cross-compilation only),
`docker-compose.yml`, `docker-compose.base.yml`, `release.yml`, the Docker Hub
release tags, `deploy-demo.yml`, and the e2e suite.

## Documentation

README gains a **Deployment** section covering: one-time Amvera project setup
(region, tariff, git remote), `.env.amvera` and the variables above, the custom
domain records, the Google OAuth client update, and the `scripts/deploy.sh`
commands including rollback. There is no committed `.env.amvera.example` — the
same secrets are already illustrated by `.env.example`, and README's variable
table is the authoritative list of the Amvera key names. The existing Installation section, which documents
running the app locally through docker-compose, is unchanged.

CHANGELOG gains an entry under `[Unreleased]`.

## Risks and fallbacks

**Payload size and SSE remain unverified.** These are two of the three
motivations for the migration, and Amvera publishes no `client_max_body_size` or
SSE-buffering guarantees for its nginx ingress, which is not user-configurable.
Verifying them is out of scope for this change; if large uploads or note
recognition turn out to fail in normal use, the migration has not achieved its
goal and the VPS option is reopened.

**Amvera's ingress may not send `X-Forwarded-Proto`.** If it doesn't, the app
sees `http`, `UseHttpsRedirection` returns a redirect loop, and Google sign-in
fails on a `redirect_uri` mismatch. This surfaces immediately at acceptance
criterion 2, before any data is at stake. The fallback is to restore the
two-line scheme-forcing middleware from `Startup.Configure` — unconditionally,
not behind a configuration flag, since Amvera would then be the only deployment
target that needs it and `docker-compose` does not run behind a proxy.

**Начальный may be too small.** 0.5 GB and 0.25 vCPU is workable for ASP.NET
Core serving a SPA, but not roomy, and a slow first request after a restart is
expected. Amvera surfaces under-resourcing as opaque 502/503 responses. If those
appear, or if the container restarts under memory pressure, Начальный Плюс
(1 GB, 0.5 vCPU, 490 RUB/month) is still below the 650 RUB YC baseline. Tariff
changes are per-hour, so the experiment is cheap.

**Digest references may be unsupported.** The fallback path writes
`image@sha256:...` if no named tag matches `latest`'s digest. Amvera's docs only
show tag references. If a digest is rejected, the deploy fails visibly at the
Amvera build stage, and the fix is to pass `--tag` explicitly.

**Non-release tags on a public repository.** `--build` pushes `<short-sha>` tags
to the public `pkirilin/food-diary` Docker Hub repo, next to release tags.
`--registry ghcr` exists for when that becomes undesirable.

**Amvera remains a Russian company.** Servers are in Warsaw, but ООО "Амвера" is
Moscow-registered, so jurisdiction and billing stay Russian. Only the VPS option
resolves this, and it was consciously declined.

## Out of scope

- Migrating the database away from Supabase.
- Verifying large payload uploads and note recognition on Amvera.
- The Food Diary MCP server that motivated the region requirement.
- Any change to the demo deployment on GitHub Pages.
- Multi-instance scaling or zero-downtime deployment guarantees.

## Acceptance

1. `./scripts/deploy.sh` deploys the newest release to Amvera from a clean
   checkout and reports success.
2. The app is reachable over HTTPS at the custom domain, and Google sign-in
   completes.
3. `./scripts/deploy.sh --tag <previous>` rolls back.
4. `git grep -i yandex` and `git grep YC_` match nothing under `src/` or
   `.github/` (matches in `docs/` and `CHANGELOG.md` are expected).
5. README's Deployment section is sufficient to repeat the setup from scratch.
6. `dotnet test` and the frontend suite pass; `build.yml` is green.
7. `git check-ignore -q .env.amvera` succeeds, `git status` never lists the
   file, and `.claude/settings.json` denies reading it.
