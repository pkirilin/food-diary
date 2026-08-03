# Amvera Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Food Diary hosting from Yandex Cloud serverless containers to Amvera Cloud (Warsaw), where a deploy is `git push amvera <branch>:master --force` and nothing else, and delete every Yandex Cloud artifact from the repo.

**Architecture:** Amvera builds the image itself from the repository's `Dockerfile` on every push to its `master`. A committed `amvera.yml` carries the run command (migrator, then API) and `containerPort: 8080`; it lives in the repo because Amvera's UI stores configuration as a commit in the app's git repo, which every force push destroys. Environment variables and secrets are entered by hand in the Amvera UI — they live in Amvera's own store and survive force pushes. The backend drops its bespoke Yandex logging formatter and its manual HTTPS-scheme middleware in favour of ASP.NET Core's `ASPNETCORE_FORWARDEDHEADERS_ENABLED`. GitHub Actions keeps verification jobs only and holds no deployment credentials.

**Tech Stack:** Docker, .NET 10 / ASP.NET Core / Serilog / EF Core, GitHub Actions, Amvera Cloud (docker environment), git.

## Global Constraints

- Amvera tariff/region: Начальный (0.5 GB RAM, 0.25 vCPU, 290 RUB/month), Warsaw.
- Container port: `8080`. No `ASPNETCORE_URLS` override in the Amvera deployment — Kestrel serves plain HTTP; Amvera's ingress terminates TLS.
- `amvera.yml` is committed at the **repository root** and is the only durable place for run configuration. **Never use the Amvera UI's configuration section** — it commits `amvera.yml` into Amvera's git repo, and the next force push silently deletes it.
- Amvera environment variables, entered manually in the UI (exact names):
  - secrets: `Auth__AllowedEmails__0`, `ConnectionStrings__Default`, `GoogleAuth__ClientId`, `GoogleAuth__ClientSecret`, `Integrations__OpenAI__BaseUrl`, `Integrations__OpenAI__ApiKey`
  - variable: `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`
- There is no `.env.amvera`, no `scripts/deploy.sh`, no Amvera CLI, and no registry dependency. Do not create them.
- `App__Logging__WriteLogsInJsonFormat` stays at its `false` default in production.
- README is **not** updated. CHANGELOG gains exactly one `### Removed` entry naming the two deleted configuration options, with no mention of Amvera, Yandex Cloud, or deployment.
- Deliberately kept and not to be touched: `docker-compose.yml`, `docker-compose.base.yml`, `.github/workflows/release.yml`, `.github/workflows/deploy-demo.yml`, `tests/` (e2e suite), Docker Hub release tags.
- Per repo rules: run builds and tests before finishing a task; comments only for "why", never restating code.
- Backend component tests and the e2e suite need a running Docker daemon. If Docker is unavailable, **stop and ask the user how to proceed** — never skip or substitute.

---

## File Structure

**Created:**

- `amvera.yml` — repository root. Single responsibility: tell Amvera how to start the built image (run command, container port). It is the deployment contract, and the only file in the repo that Amvera reads as configuration.

**Modified:**

- `Dockerfile` — `ENTRYPOINT` becomes `CMD` so `amvera.yml`'s `run.command` overrides it. Nothing else.
- `src/backend/src/FoodDiary.Configuration/AppOptions.cs` — drop two properties.
- `src/backend/src/FoodDiary.API/Logging/LoggerConfigurationExtensions.cs` — drop the Yandex branch.
- `src/backend/src/FoodDiary.API/Startup.cs` — drop the scheme-rewriting middleware (lines 131-142) and the two usings it was the only consumer of.
- `src/backend/src/FoodDiary.API/appsettings.json` — drop removed keys from the `App` section.
- `src/backend/src/FoodDiary.API/appsettings.Development.json` — same.
- `.github/workflows/build.yml` — delete the `env:` block and the `run-migrations`, `build-and-push-image`, `deploy` jobs; rename the workflow.
- `CHANGELOG.md` — `[Unreleased]` entry.

**Deleted:**

- `.github/workflows/deploy.yml`
- `src/backend/src/FoodDiary.API/Logging/YandexCloudJsonFormatter.cs`

---

### Task 1: The Amvera deployment contract

Create `amvera.yml` and make the Dockerfile overridable by it. This is the whole deploy mechanism: Amvera finds the root `Dockerfile` on its own (no `build` section needed), builds it, then starts the container with `run.command` + `run.args` in place of the image's `ENTRYPOINT`/`CMD`.

Two things here are load-bearing and easy to get wrong:

- `containerPort` defaults to **80**. The `mcr.microsoft.com/dotnet/aspnet:10.0` image listens on **8080**, and `EXPOSE` is not documented as honoured. Omit the line and the app builds, starts, and is unreachable.
- `run.command` corresponds to Docker's `ENTRYPOINT` and `run.args` to `CMD`. An image `ENTRYPOINT` would fight the override, so the Dockerfile must use `CMD` only.

**Files:**

- Create: `amvera.yml`
- Modify: `Dockerfile` (last line)

**Interfaces:**

- Consumes: nothing.
- Produces: a container whose start sequence is `dotnet migrator/FoodDiary.Migrator.dll && exec dotnet FoodDiary.API.dll`, listening on `8080`. Task 4 verifies this on the real platform.

- [ ] **Step 1: Confirm the Dockerfile's current last line**

Run: `tail -n 3 Dockerfile`

Expected:

```dockerfile
COPY --from=frontend app/dist frontend/dist
EXPOSE 8080
ENTRYPOINT ["dotnet", "FoodDiary.API.dll"]
```

- [ ] **Step 2: Change `ENTRYPOINT` to `CMD`**

In `Dockerfile`, replace the last line:

```dockerfile
CMD ["dotnet", "FoodDiary.API.dll"]
```

Leave every other line untouched. `docker-compose.base.yml` overrides `entrypoint:` explicitly, so local runs and the e2e suite are unaffected; `docker run` on the published image still starts the API, because with no `ENTRYPOINT` the `CMD` becomes the command.

- [ ] **Step 3: Create `amvera.yml`**

Create `amvera.yml` at the repository root with exactly this content:

```yaml
run:
  command: /bin/sh
  args: -c "dotnet migrator/FoodDiary.Migrator.dll && exec dotnet FoodDiary.API.dll"
  containerPort: 8080
```

No `meta` section — Amvera defaults to the docker environment. No `build` section — with `build.dockerfile` unset, Amvera searches `amvera/Dockerfile`, `Dockerfile`, `docker/Dockerfile`, `deploy/Dockerfile`, `deployment/Dockerfile`, and finds ours at the root.

The migrator needs no arguments: `MigratorConfiguration` calls `AddEnvironmentVariables()`, so it picks up the same `ConnectionStrings__Default` secret the API uses.

- [ ] **Step 4: Verify the YAML parses and says what it should**

```bash
python3 -c "import yaml,sys; print(yaml.safe_load(open('amvera.yml')))"
```

Expected, on one line:

```
{'run': {'command': '/bin/sh', 'args': '-c "dotnet migrator/FoodDiary.Migrator.dll && exec dotnet FoodDiary.API.dll"', 'containerPort': 8080}}
```

The point of this check is that `args` is a **single string**, not a list, and that the inner quotes survive parsing.

If this fails with `ModuleNotFoundError: No module named 'yaml'`, use `yq` instead — `command -v yq || brew install yq`, then `yq -o=json '.' amvera.yml` — and confirm the same three fields with `args` as a JSON string.

- [ ] **Step 5: Build the image**

Requires a running Docker daemon. If Docker is not available, **stop and ask the user how to proceed**.

```bash
docker build -t food-diary:amvera-check .
```

Expected: build succeeds, ending in `naming to docker.io/library/food-diary:amvera-check`.

- [ ] **Step 6: Verify the failure semantics of the chain**

With no database reachable, the migrator must fail and `&&` must stop the API from starting. This is the behaviour the design relies on to avoid old code meeting a half-migrated schema.

```bash
docker run --rm --entrypoint /bin/sh food-diary:amvera-check \
  -c "dotnet migrator/FoodDiary.Migrator.dll && exec dotnet FoodDiary.API.dll" \
  ; echo "exit code: $?"
```

Expected: migrator logs `Error while applying migrations` (connection refused), **no** `Now listening on:` line appears, and the exit code is non-zero.

- [ ] **Step 7: Verify the happy path against a real database**

Start the compose database, then run the image against it with the same command Amvera will use.

```bash
docker compose up -d db
docker network ls | grep food-diary
```

Note the network name from the second command (expected: `food-diary_default`) and use it below:

```bash
docker run --rm --name fd-amvera-check \
  --network food-diary_default \
  -p 8081:8080 \
  -e "ConnectionStrings__Default=User ID=postgres;Password=postgres;Host=db;Port=8090;Database=FoodDiary" \
  -e Auth__AllowedEmails__0=check@example.com \
  -e GoogleAuth__ClientId=check-client-id \
  -e GoogleAuth__ClientSecret=check-client-secret \
  --entrypoint /bin/sh food-diary:amvera-check \
  -c "dotnet migrator/FoodDiary.Migrator.dll && exec dotnet FoodDiary.API.dll"
```

Expected, in this order: migrator output showing migrations applied (or none pending), then `Now listening on: http://[::]:8080`. A warning about `UseHttpsRedirection` not finding an HTTPS port is expected here and harmless — Amvera terminates TLS at its ingress.

In a second terminal:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:8081/healthz/live
```

Expected: `200`

- [ ] **Step 8: Tear down the check**

```bash
docker stop fd-amvera-check 2>/dev/null || true
docker compose down
docker image rm food-diary:amvera-check
```

- [ ] **Step 9: Confirm compose is still intact**

The image change must not have disturbed the local stack, which overrides `entrypoint:` itself.

```bash
grep -n "entrypoint" -A 6 docker-compose.base.yml
```

Expected: the existing `/bin/bash -c` chain with `update-ca-certificates`, `dotnet migrator/FoodDiary.Migrator.dll`, and `dotnet FoodDiary.API.dll` — unchanged by this task.

- [ ] **Step 10: Commit**

```bash
git add amvera.yml Dockerfile
git commit -m "feat: add Amvera deployment config"
```

---

### Task 2: Remove Yandex Cloud logging and the manual HTTPS-scheme option

Both the Yandex JSON log formatter and the `ForwardHttpsSchemeManuallyForAllRequests` middleware exist only to serve the Yandex deployment. The scheme problem is solved instead by `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`, which `Host.CreateDefaultBuilder(...).ConfigureWebHostDefaults(...)` honours with no application code: it configures `ForwardedHeadersOptions` with `XForwardedFor | XForwardedProto`, clears `KnownNetworks`/`KnownProxies`, and registers a startup filter running `UseForwardedHeaders` before every middleware in `Startup.Configure`.

**Files:**

- Delete: `src/backend/src/FoodDiary.API/Logging/YandexCloudJsonFormatter.cs`
- Modify: `src/backend/src/FoodDiary.Configuration/AppOptions.cs`
- Modify: `src/backend/src/FoodDiary.API/Logging/LoggerConfigurationExtensions.cs`
- Modify: `src/backend/src/FoodDiary.API/Startup.cs`
- Modify: `src/backend/src/FoodDiary.API/appsettings.json`
- Modify: `src/backend/src/FoodDiary.API/appsettings.Development.json`
- Modify: `CHANGELOG.md`

**Interfaces:**

- Consumes: nothing.
- Produces: `AppOptions` reduced to `{ Logging: { WriteLogsInJsonFormat: bool } }`. No other task references the removed members.

- [ ] **Step 1: Confirm the blast radius before editing**

```bash
git grep -n -i -E "yandex|ForwardHttpsSchemeManually" -- src .github
```

Expected: matches only in the six source files above plus `.github/workflows/build.yml` and `.github/workflows/deploy.yml` (both handled in Task 3). If anything else appears — a test, a component-test fixture — handle it in this task too.

- [ ] **Step 2: Delete the formatter**

```bash
git rm src/backend/src/FoodDiary.API/Logging/YandexCloudJsonFormatter.cs
```

- [ ] **Step 3: Trim `AppOptions`**

`src/backend/src/FoodDiary.Configuration/AppOptions.cs` becomes:

```csharp
using System.Diagnostics.CodeAnalysis;

namespace FoodDiary.Configuration;

public class AppOptions
{
    public required LoggingOptions Logging { get; init; }

    [SuppressMessage("ReSharper", "UnusedAutoPropertyAccessor.Global")]
    public class LoggingOptions
    {
        public bool WriteLogsInJsonFormat { get; init; }
    }
}
```

- [ ] **Step 4: Simplify the logger configuration**

In `src/backend/src/FoodDiary.API/Logging/LoggerConfigurationExtensions.cs`, replace the `WriteToConsole` method body with this two-branch version. Leave `Configure` and the using block untouched — `JsonFormatter` is still used:

```csharp
    private static void WriteToConsole(this LoggerConfiguration loggerConfiguration, AppOptions appOptions)
    {
        if (appOptions.Logging.WriteLogsInJsonFormat)
        {
            loggerConfiguration.WriteTo.Console(new JsonFormatter());
            return;
        }

        loggerConfiguration.WriteTo.Console();
    }
```

- [ ] **Step 5: Remove the scheme-rewriting middleware from `Startup.Configure`**

In `src/backend/src/FoodDiary.API/Startup.cs`, delete lines 131-142 — the `appOptions` local and the whole `if` block. Keep the `Configure` signature and everything from `if (env.IsDevelopment())` onward. The lines to delete are:

```csharp
        var appOptions = app.ApplicationServices.GetRequiredService<IOptions<AppOptions>>().Value;
        
        if (appOptions.ForwardHttpsSchemeManuallyForAllRequests)
        {
            // Used to keep HTTPS scheme in OAuth redirects when load balancer does not set X-Forwarded-Proto
            // https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer?view=aspnetcore-8.0#when-it-isnt-possible-to-add-forwarded-headers-and-all-requests-are-secure
            app.Use((context, next) =>
            {
                context.Request.Scheme = "https";
                return next(context);
            });
        }
        
```

After the edit, `Configure` must begin:

```csharp
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        if (env.IsDevelopment())
```

- [ ] **Step 6: Remove the two usings that just went unused**

That block was `Startup.cs`'s only use of `AppOptions` and `IOptions<>`. From the using block at the top of `src/backend/src/FoodDiary.API/Startup.cs`, delete:

```csharp
using FoodDiary.Configuration;
```

```csharp
using Microsoft.Extensions.Options;
```

Keep `using FoodDiary.Configuration.Extensions;` — `ConfigureCustomOptions` still needs it. Keep `using Microsoft.Extensions.Configuration;` — it is a different namespace and still in use.

- [ ] **Step 7: Drop the keys from `appsettings.json`**

In `src/backend/src/FoodDiary.API/appsettings.json`, the `"App"` section becomes:

```json
  "App": {
    "Logging": {
      "WriteLogsInJsonFormat": false
    }
  },
```

- [ ] **Step 8: Drop the keys from `appsettings.Development.json`**

In `src/backend/src/FoodDiary.API/appsettings.Development.json`, the `"App"` section becomes:

```json
  "App": {
    "Logging": {
      "WriteLogsInJsonFormat": false
    }
  }
```

- [ ] **Step 9: Verify nothing references the removed members**

```bash
git grep -n -i -E "yandex|ForwardHttpsSchemeManually" -- src
```

Expected: no output.

- [ ] **Step 10: Verify both settings files are still valid JSON**

```bash
python3 -m json.tool src/backend/src/FoodDiary.API/appsettings.json > /dev/null && echo "appsettings.json ok"
python3 -m json.tool src/backend/src/FoodDiary.API/appsettings.Development.json > /dev/null && echo "appsettings.Development.json ok"
```

Expected: both `ok` lines.

- [ ] **Step 11: Build the backend**

```bash
cd src/backend && dotnet build --configuration Release
```

Expected: `Build succeeded`, 0 errors, 0 warnings. Warnings are errors in this repo, so an unused using would fail the build here.

- [ ] **Step 12: Run the unit tests**

```bash
cd src/backend && dotnet test tests/FoodDiary.UnitTests
```

Expected: all tests pass.

- [ ] **Step 13: Run the component tests**

These need a Docker daemon (Testcontainers). If Docker is not available, **stop and ask the user how to proceed** — do not skip.

```bash
cd src/backend && dotnet test tests/FoodDiary.ComponentTests
```

Expected: all tests pass.

- [ ] **Step 14: Add the CHANGELOG entry**

These two options were user-visible configuration, so their removal is recorded. Amvera, Yandex Cloud, and deployment are deliberately **not** mentioned. In `CHANGELOG.md`, the `## [Unreleased]` section becomes:

```markdown
## [Unreleased]

### Removed

- `App__ForwardHttpsSchemeManuallyForAllRequests` configuration option — the HTTPS
  scheme behind a reverse proxy is now handled by ASP.NET Core's
  `ASPNETCORE_FORWARDEDHEADERS_ENABLED`
- `App__Logging__UseYandexCloudLogsFormat` configuration option and its log formatter
```

- [ ] **Step 15: Verify the CHANGELOG lints**

```bash
npx markdownlint-cli2 CHANGELOG.md
```

Expected: no errors. (The repo's config is `.markdownlint-cli2.jsonc`.)

- [ ] **Step 16: Commit**

```bash
git add src/backend CHANGELOG.md
git commit -m "refactor: drop Yandex Cloud log format and manual HTTPS scheme option"
```

---

### Task 3: Strip deployment out of CI

GitHub Actions becomes verification-only and holds no deployment credentials. Removing `run-migrations` from CI is deliberate: with deploys now manual, a CI job migrating Supabase on every merge to `main` would change the production schema at a moment unrelated to any deploy, leaving the running old code to meet a new schema. Migrations now run in the container at start, per Task 1.

**Files:**

- Delete: `.github/workflows/deploy.yml`
- Modify: `.github/workflows/build.yml`

**Interfaces:**

- Consumes: nothing.
- Produces: a `build.yml` whose jobs are exactly `backend`, `frontend`, `e2e-tests`.

- [ ] **Step 1: Delete the Yandex deploy workflow**

```bash
git rm .github/workflows/deploy.yml
```

- [ ] **Step 2: Remove the `env:` block from `build.yml`**

Those three variables exist only for the Yandex registry. Delete from `.github/workflows/build.yml`:

```yaml
env:
  CR_REGISTRY: ${{ secrets.YC_CR_REGISTRY }}
  CR_REPOSITORY: food-diary
  IMAGE_TAG: ${{ github.sha }}
```

- [ ] **Step 3: Delete the three deployment jobs**

Delete everything in `.github/workflows/build.yml` from the line `  run-migrations:` to the end of the file. The file must now end with the `e2e-tests` job's last step:

```yaml
    - name: Stop containers
      if: always()
      run: docker compose down
```

- [ ] **Step 4: Rename the workflow**

It no longer deploys. Change the first line of `.github/workflows/build.yml`:

```yaml
name: Build
```

The README badge links to `build.yml` by filename, not by workflow name, so it keeps working and README needs no edit.

- [ ] **Step 5: Verify the workflow parses and has exactly the expected jobs**

```bash
python3 -c "import yaml; print(list(yaml.safe_load(open('.github/workflows/build.yml'))['jobs'].keys()))"
```

Expected: `['backend', 'frontend', 'e2e-tests']`

If PyYAML is unavailable, use `yq '.jobs | keys' .github/workflows/build.yml` (expects `["backend", "frontend", "e2e-tests"]`), or fall back to `grep -n "^  [a-z-]*:$" .github/workflows/build.yml`, which must list exactly those three job keys.

- [ ] **Step 6: Verify no deployment leftovers survive**

```bash
git grep -i yandex -- src .github || echo "clean"
git grep YC_ -- src .github || echo "clean"
git grep -n "Migrator_DatabaseConnectionString" -- .github || echo "clean"
```

Expected: `clean` three times.

- [ ] **Step 7: Commit**

```bash
git add .github
git commit -m "ci: remove Yandex Cloud deployment jobs and workflow"
```

---

### Task 4: Live acceptance

Everything up to here is verifiable offline. This task performs the real migration: it needs an Amvera account, DNS control over the app's domain, and access to the Google Cloud console. Run it interactively with the user — several steps are UI work only they can do.

**Files:** none — this is setup and verification.

**Interfaces:**

- Consumes: every prior task.
- Produces: a running deployment, or a decision to fall back.

- [ ] **Step 1: Confirm the full test suite is green**

```bash
cd src/backend && dotnet test
cd src/frontend && yarn lint && yarn build && yarn test
```

Expected: all pass. (Backend component tests need Docker; if unavailable, **stop and ask the user how to proceed**.)

- [ ] **Step 2: Have the user create the Amvera application**

In the Amvera console: create a *Приложение* in the **Warsaw** region on the **Начальный** tariff. Connect it to no external repository and add no webhook — its git repo is only a push target. Copy the repository URL from the project's settings; it looks like `https://git.amvera.ru/<user>/<project>`.

**Tell the user explicitly: do not touch the UI's Конфигурация section, now or ever.** Amvera writes `amvera.yml` into the app's git repo from there, and the next force push deletes it — silently reverting the run command and the port. All run configuration comes from the committed `amvera.yml` instead.

- [ ] **Step 3: Have the user enter the variables and secrets**

In the Amvera UI's variables/secrets section (this one is safe — it is stored in Amvera's own database and secret store, not in git):

| Name | Kind | Value |
|---|---|---|
| `Auth__AllowedEmails__0` | secret | the allowed Google account address |
| `ConnectionStrings__Default` | secret | the Supabase connection string |
| `GoogleAuth__ClientId` | secret | from the Google OAuth client |
| `GoogleAuth__ClientSecret` | secret | from the Google OAuth client |
| `Integrations__OpenAI__BaseUrl` | secret | the OpenAI-compatible API base URL |
| `Integrations__OpenAI__ApiKey` | secret | the OpenAI API key |
| `ASPNETCORE_FORWARDEDHEADERS_ENABLED` | variable | `true` |

`ASPNETCORE_FORWARDEDHEADERS_ENABLED=true` is required: Amvera terminates TLS at its ingress and forwards plain HTTP, so without it Kestrel sees `http`, `UseHttpsRedirection` loops, and Google OAuth generates `http://` redirect URIs. Amvera applies variable changes only on container restart.

Do not ask the user to paste any of these values into the conversation.

- [ ] **Step 4: Add the git remote**

```bash
git remote add amvera https://git.amvera.ru/<user>/<project>
git remote -v
```

Expected: an `amvera` remote listed for fetch and push. Authentication is the Amvera **account** username and password — let the credential helper store it on the first push.

- [ ] **Step 5: Deploy**

```bash
git push amvera "$(git branch --show-current)":master --force
```

Expected: the push succeeds and Amvera starts a build. Watch it in the UI's build log.

Expect **5–20 minutes**. If the build sits with no logs for over an hour, or dies partway through `yarn install` / `vite build` / `dotnet publish`, it has run out of resources: tell the user to switch the tariff to **Начальный Плюс** (1 GB, 0.5 vCPU, 490 RUB/month — still below the 650 RUB Yandex baseline) and rebuild. Tariff changes bill per hour, so this is cheap to try.

- [ ] **Step 6: Verify the start sequence in the run log**

Open the run log in the Amvera UI.

Expected, in this order: migrator output showing migrations applied, then `Now listening on: http://[::]:8080`.

**If the container fails immediately with a command-not-found or argument error**, Amvera did not split the `run.args` string the way a shell would. This is the known risk in the design. Fall back to a committed entrypoint script:

Create `docker-entrypoint.sh` at the repo root:

```bash
#!/bin/sh
set -e
dotnet migrator/FoodDiary.Migrator.dll
exec dotnet FoodDiary.API.dll
```

Add to `Dockerfile`, immediately before the `CMD` line:

```dockerfile
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh
```

Replace `amvera.yml`'s `run` section with:

```yaml
run:
  command: /app/docker-entrypoint.sh
  containerPort: 8080
```

Then commit and re-push. Note that `.dockerignore` does not exclude root-level shell scripts, so the `COPY` will find it.

**If the app builds and starts but is unreachable**, check that `containerPort: 8080` actually made it into the deployed `amvera.yml` — a UI configuration commit overwriting it is the likely cause.

- [ ] **Step 7: Have the user attach the custom domain**

Amvera exposes no CLI for domains, so this is manual and one-time. Using a subdomain of a domain the author already owns — rather than the free `<project>.<user>.amvera.io` — means the URL belongs to the project, so a later move to different hosting is a DNS change that does not invalidate Google OAuth configuration, saved sessions, or installed PWAs.

1. Point an `A` record at the IP shown in the Amvera project settings.
2. Add the `TXT` record shown alongside it.
3. Confirm and attach the domain in the Amvera UI, then wait for the Let's Encrypt certificate to be issued.

- [ ] **Step 8: Have the user update the Google OAuth client**

In the Google Cloud console, for the existing OAuth client:

- Authorized JavaScript origin: `https://<app-domain>`
- Authorized redirect URI: `https://<app-domain>/signin-google`

- [ ] **Step 9: Verify HTTPS and Google sign-in**

Open `https://<app-domain>` in a browser and sign in with Google.

Expected: the page loads over HTTPS with a valid certificate and sign-in completes.

**If sign-in fails with a `redirect_uri` mismatch, or the app returns a redirect loop**, Amvera's ingress is not sending `X-Forwarded-Proto`. The fallback is to restore the scheme-forcing middleware in `Startup.Configure` — unconditionally, not behind a configuration flag, since Amvera would then be the only deployment target needing it and `docker-compose` does not run behind a proxy:

```csharp
        // Amvera's ingress terminates TLS but does not send X-Forwarded-Proto,
        // so OAuth redirects would otherwise be generated with the http scheme
        app.Use((context, next) =>
        {
            context.Request.Scheme = "https";
            return next(context);
        });
```

Place it as the first statement in `Configure`, before `if (env.IsDevelopment())`, then commit and re-deploy.

- [ ] **Step 10: Verify data and migrations**

Sign in and confirm existing notes, products, and weight logs are present — this is the same Supabase database the Yandex deployment used, so nothing should have changed.

Expected: the app shows the user's real data, and the run log's migrator output reported success rather than a skipped or failed run.

- [ ] **Step 11: Verify rollback**

```bash
git push amvera <previous-commit-sha>:master --force
```

Expected: Amvera rebuilds that commit and serves it. Then redeploy the current branch:

```bash
git push amvera "$(git branch --show-current)":master --force
```

Note that rollback rebuilds rather than swapping a prebuilt image, so it costs another 5–20 minutes. Migrations are never reverted automatically.

- [ ] **Step 12: Watch for under-resourcing**

Exercise the app for a few minutes — open several days, add a note, view charts — while watching the run log.

Expected: no opaque 502/503 responses, no container restarts. A slow first request after a restart is expected on 0.5 GB / 0.25 vCPU. If restarts or 5xx appear, recommend Начальный Плюс.

- [ ] **Step 13: Confirm CI is green**

Push the branch to GitHub and check the Build workflow.

Expected: `backend`, `frontend`, and `e2e-tests` all pass; no other jobs exist.

- [ ] **Step 14: Tell the user what to decommission manually**

None of this can be scripted from here:

- GitHub repository **secrets** to delete: `YC_CR_REGISTRY`, `YC_SA_JSON_CREDENTIALS`, `YC_FOLDER_ID`, `YC_REVISION_SERVICE_ACCOUNT_ID`, `Migrator_DatabaseConnectionString`.
- GitHub repository **variables** to delete: `YC_REVISION_SECRETS_ID`, `YC_REVISION_SECRETS_VERSION`.
- The Yandex Cloud serverless container itself, plus its container registry images and Lockbox secrets, so they stop billing.
- The old DNS record pointing at Yandex, once the Amvera deployment is confirmed good.

---

## Out of scope

Per the design spec, this plan does **not** cover: migrating the database away from Supabase, verifying large payload uploads and note recognition on Amvera, the Food Diary MCP server, any change to the GitHub Pages demo deployment, multi-instance or zero-downtime deployment guarantees, or automating the initial Amvera project setup.
