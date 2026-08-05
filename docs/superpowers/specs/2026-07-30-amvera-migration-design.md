# Amvera migration — design

Date: 2026-07-30 (revised 2026-08-03)
Status: Completed — implemented on branch `amvera-deploy`; Tasks 1-3 done and
reviewed, Task 4 (live deployment) is manual follow-up work.

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
- A deploy is a single git command.
- YC artifacts are gone from the repository.
- Deployment adds no scripts, no CI credentials, and no local secret files.

## Decision

Host the app on **Amvera Cloud, Warsaw region**, tariff **Начальный**
(0.5 GB RAM, 0.25 vCPU, 290 RUB/month).

**Amvera builds the image from source.** Pushing to the Amvera repo's `master`
triggers a build from the repository's `Dockerfile`, then a container start. A
deploy is therefore:

```shell
git push amvera <current-branch>:master --force
```

GitHub Actions verifies only. It never builds an image, never migrates the
database, and holds no deployment credentials.

### Why this shape

**Amvera over a self-hosted VPS.** A VPS in the Netherlands or Switzerland would
be cheaper (zero marginal cost, the server already exists), fully outside Russian
jurisdiction, and would put payload-size and SSE limits under our own control.
Amvera was chosen anyway for familiarity, developer-friendly deploys, and low
maintenance. The escape hatch stays cheap: the deployable artifact is a plain
Docker image built from a `Dockerfile` that already works under `docker-compose`,
so moving to the VPS later is a compose file plus a DNS change.

**Building on Amvera over deploying a prebuilt image.** Amvera bills the build
container at the app's tariff, so building here costs a second instance-hour per
deploy and takes 5–20 minutes rather than seconds. That is accepted deliberately:
deploys are rare, the cost is small, and the alternative — resolving Docker Hub
tags, rendering config, and force-pushing an orphan commit from a local script —
is a script to maintain, a registry to depend on, and a deploy path that only
exists on one machine. Simplicity and maintainability win over cost and speed
for this project.

**Local git push over GitHub Actions.** Amvera's git remote authenticates with
the Amvera **account** username and password — there is no scoped deploy token.
Automating deploys from CI would mean storing full-account credentials in GitHub
secrets. Pushing from the developer machine keeps those credentials in the local
git credential helper.

**Configuration lives in the repository.** See the next section: this follows
from force-pushing, and it is the single most important constraint in this
design.

## Architecture

### Force push determines where configuration can live

Amvera's web UI has a configuration section. It does not store settings on the
platform — it *commits `amvera.yml` into the application's git repository*
("автоматически добавится в корень проекта, создав при этом новый коммит в гит
репозиторий"). Every deploy force-pushes our history over that repo, so any
UI-created configuration is deleted on the next deploy, silently reverting the
run command and the port.

Configuration therefore splits by durability:

| Setting | Where it lives | Survives force push |
|---|---|---|
| Run command, container port | `amvera.yml`, committed to this repo | yes |
| Environment variables, secrets | Amvera's own database / secret store | yes |
| Anything set in the UI's config section | Amvera's git repo | **no** |

**Standing operational rule: never use the Amvera UI's configuration section.**
Variables and secrets are entered in the UI, and that is fine — they are stored
outside git. Everything else goes through `amvera.yml`.

### `amvera.yml`

Committed at the repository root:

```yaml
run:
  command: /bin/sh
  args: -c "dotnet migrator/FoodDiary.Migrator.dll && exec dotnet FoodDiary.API.dll"
  containerPort: 8080
```

No `meta` section — Amvera defaults to the docker environment. No `build`
section — with `build.dockerfile` unset, Amvera searches `amvera/Dockerfile`,
`Dockerfile`, `docker/Dockerfile`, `deploy/Dockerfile`, and
`deployment/Dockerfile`, and finds ours at the root.

`containerPort` is mandatory rather than cosmetic: it defaults to **80**, the
`mcr.microsoft.com/dotnet/aspnet:10.0` image listens on **8080**, and `EXPOSE` is
not documented as honoured. Without this line the app builds, starts, and is
unreachable.

The image is started with no `ASPNETCORE_URLS` override, so Kestrel serves plain
HTTP on 8080. Amvera's nginx ingress terminates TLS and forwards to it.

### Dockerfile

One change: `ENTRYPOINT ["dotnet", "FoodDiary.API.dll"]` becomes
`CMD ["dotnet", "FoodDiary.API.dll"]`, so `run.command` in `amvera.yml`
overrides it. `run.command` corresponds to `ENTRYPOINT` and `run.args` to `CMD`.

Nothing else changes. `docker-compose.base.yml` already overrides `entrypoint:`
with its own cert-setup → migrator → API chain, so local runs and the e2e suite
are untouched, and `docker run` on the published Docker Hub image behaves exactly
as it does today.

No cross-compilation work is needed. Amvera builds on its own amd64
infrastructure, so the `$BUILDPLATFORM` / `-a $TARGETARCH` restructuring
considered earlier is dropped.

### Migrations

`run.args` runs the migrator before the API on every container start. The
migrator is already in the image at `migrator/FoodDiary.Migrator.dll`, and
`MigratorConfiguration` reads `ConnectionStrings:Default` from environment
variables — the same `ConnectionStrings__Default` secret the API uses. No
argument passing, no extra secret.

`MigrateAsync` is idempotent, so restarts are no-ops beyond a round trip to
Supabase. A failed migration returns a non-zero exit code and `&&` prevents the
API from starting, which is the correct outcome: the old code is not left
running against a half-migrated schema, and the failure is visible in the run
log.

This is why `run-migrations` is removed from CI rather than moved: with deploys
manual, a CI job migrating Supabase on every merge to `main` would change the
production schema at a moment unrelated to any deploy.

### Deploy flow

1. Merge to `main` as usual; `build.yml` verifies backend, frontend, and e2e.
2. `git push amvera main:master --force`.
3. Amvera builds from the `Dockerfile` (5–20 minutes), then starts the container:
   migrator first, API second.
4. Watch the build and run logs in the Amvera UI.

Rollback is the same command against an older commit:
`git push amvera <older-sha>:master --force`. It rebuilds rather than swapping a
prebuilt image, so it is slower than a tag change, but it needs no registry and
no tooling.

Initial deployment is manual: create the application in the UI, add the variables
and secrets, add the git remote, push. No Amvera CLI is required at any point.

### Configuration and secrets

Entered by hand in the Amvera UI. There is no `.env.amvera` and no committed
example file.

| Name | Kind |
|---|---|
| `Auth__AllowedEmails__0` | secret |
| `ConnectionStrings__Default` | secret |
| `GoogleAuth__ClientId` | secret |
| `GoogleAuth__ClientSecret` | secret |
| `Integrations__OpenAI__BaseUrl` | secret |
| `Integrations__OpenAI__ApiKey` | secret |
| `ASPNETCORE_FORWARDEDHEADERS_ENABLED` | variable, `true` |

Amvera applies variable changes only on container restart, and does not expose
them during build. Neither constrains this design: nothing in the frontend or
backend build reads an environment variable, as CI demonstrates by building the
same image on every push.

`App__Logging__WriteLogsInJsonFormat` is left at its `false` default — Amvera's
log viewer renders plain console output more readably than JSON.

### HTTPS scheme behind the Amvera proxy

Amvera terminates TLS at its ingress and forwards plain HTTP to the container.
Without correction, Kestrel sees `http`; `UseHttpsRedirection` has no HTTPS port
to redirect to (no `HttpsPort`, `HTTPS_PORT`, or `ANCM_HTTPS_PORT` is set), so it
logs `Failed to determine the https port for redirect` once and passes every
request through unchanged, while Google OAuth generates `http://` redirect URIs.

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

### Domain and authentication

The app uses a subdomain of a domain the author already owns, rather than the
free `<project>.<user>.amvera.io`. The URL then belongs to the project, so a
later move to the VPS is a DNS change that does not invalidate Google OAuth
configuration, saved sessions, or installed PWAs.

Setup is a one-time manual step:

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
  e2e), along with the now-unused `CR_REGISTRY`/`CR_REPOSITORY`/`IMAGE_TAG`
  workflow env block.
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

Deliberately not built, having been part of an earlier draft of this design:
`scripts/deploy.sh`, `deploy/amvera.yml.template`, a Docker Hub tag-resolution
library, a ghcr fallback registry, an Amvera CLI dependency, and `.env.amvera`
with its `.gitignore` and `.claude/settings.json` protections. Amvera building
from source removes the need for all of them.

Deliberately kept and unchanged: `Dockerfile` (except `ENTRYPOINT` → `CMD`),
`docker-compose.yml`, `docker-compose.base.yml`, `release.yml`, the Docker Hub
release tags, `deploy-demo.yml`, and the e2e suite.

## Documentation

README is not updated: it documents local installation and development, says
nothing about deployment or Yandex Cloud today, and this change gives it nothing
it must correct.

CHANGELOG gains one `### Removed` entry under `[Unreleased]` naming the two
deleted configuration options — `App__ForwardHttpsSchemeManuallyForAllRequests`
and `App__Logging__UseYandexCloudLogsFormat`. Amvera, Yandex Cloud, and
deployment are not mentioned.

## Risks and fallbacks

**`run.args` is a string, not an array.** Amvera documents args as passed
"обычной строкой, а не массивом" and does not specify how the string is split
into argv, so `-c "a && b"` is an assumption. If it is split naively on
whitespace, the container fails at start with a visible error in the run log. The
fallback is to commit a `docker-entrypoint.sh` containing the two commands and
set `run.command` to it with no args.

**The build may not fit in Начальный.** The build runs in an extra container
sized and billed at the app's tariff — 0.5 GB and 0.25 vCPU for `yarn install`,
`vite build`, and two `dotnet publish` runs. Amvera's own FAQ recommends building
on a higher tariff and downgrading afterwards. We start on Начальный anyway; if
the build OOMs, or sits in "build" status past an hour with no logs, move to
Начальный Плюс (1 GB, 0.5 vCPU, 490 RUB/month — still below the 650 RUB YC
baseline). Tariff changes are billed per hour, so the experiment is cheap.
Expect 5–20 minutes per build regardless.

**Configuring through the Amvera UI breaks the next deploy.** Covered above; it
is repeated here because the failure is silent and delayed — the deploy that
breaks it is not the one that shows the symptom.

**Начальный may be too small at runtime as well.** A slow first request after a
restart is expected, and Amvera surfaces under-resourcing as opaque 502/503
responses. Same fallback tariff.

**Amvera's ingress may not send `X-Forwarded-Proto`.** If it doesn't, the app
sees `http`; `UseHttpsRedirection` cannot find an HTTPS port on Amvera, so it
logs `Failed to determine the https port for redirect` once and passes the
request through rather than looping, and Google sign-in fails on a
`redirect_uri` mismatch. This surfaces immediately at acceptance criterion 3,
before any data is at stake. The fallback is to restore the two-line
scheme-forcing middleware in `Startup.Configure` — unconditionally, not behind a
configuration flag, since Amvera would then be the only deployment target that
needs it and `docker-compose` does not run behind a proxy.

**Payload size and SSE remain unverified.** These are two of the three
motivations for the migration, and Amvera publishes no `client_max_body_size` or
SSE-buffering guarantees for its nginx ingress, which is not user-configurable.
Verifying them is out of scope for this change; if large uploads or note
recognition turn out to fail in normal use, the migration has not achieved its
goal and the VPS option is reopened.

**Source code now goes to Amvera.** Deploys push the whole repository rather than
a single config file. The repository is public, so this changes what Amvera
stores, not what is exposed.

**Amvera remains a Russian company.** Servers are in Warsaw, but ООО "Амвера" is
Moscow-registered, so jurisdiction and billing stay Russian. Only the VPS option
resolves this, and it was consciously declined.

## Out of scope

- Migrating the database away from Supabase.
- Verifying large payload uploads and note recognition on Amvera.
- The Food Diary MCP server that motivated the region requirement.
- Any change to the demo deployment on GitHub Pages.
- Multi-instance scaling or zero-downtime deployment guarantees.
- Automating the initial Amvera project setup.

## Acceptance

1. `git push amvera <branch>:master --force` produces a green Amvera build and a
   running container.
2. The run log shows migrator output preceding API startup, and the Supabase
   schema is current.
3. The app is reachable over HTTPS at the custom domain, and Google sign-in
   completes.
4. Pushing an older commit to the Amvera remote rolls back.
5. `git grep -i yandex` and `git grep YC_` match nothing under `src/` or
   `.github/` (matches in `docs/` and in the CHANGELOG entry naming the removed
   option are expected).
6. `dotnet test` and the frontend suite pass; `build.yml` is green and contains
   verification jobs only.
