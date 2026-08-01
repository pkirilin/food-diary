# Amvera Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move Food Diary hosting from Yandex Cloud serverless containers to Amvera Cloud (Warsaw), deployed from the developer machine by `scripts/deploy.sh` using the prebuilt Docker Hub image, and delete every Yandex Cloud artifact from the repo.

**Architecture:** Amvera never builds the project. `scripts/deploy.sh` resolves an already-published `pkirilin/food-diary` image tag (or builds one on demand), runs Supabase migrations, syncs environment variables through the Amvera CLI, and force-pushes a single-file orphan commit containing `amvera.yml` (`build.skip: yes` + `run.image`) to the Amvera git remote, which triggers a pull-and-run deploy. The backend drops its bespoke Yandex logging formatter and its manual HTTPS-scheme middleware in favour of ASP.NET Core's `ASPNETCORE_FORWARDEDHEADERS_ENABLED`. GitHub Actions keeps verification jobs only and holds no deployment credentials.

**Tech Stack:** Bash 3.2 (macOS default), Docker + buildx, Amvera CLI, .NET 10 / ASP.NET Core / Serilog, GitHub Actions, Docker Hub public tags API, `jq`.

## Global Constraints

- Docker image repository: `pkirilin/food-diary` (Docker Hub, public).
- Amvera tariff/region: Начальный (0.5 GB RAM, 0.25 vCPU), Warsaw.
- Container port: `8080`. No `ASPNETCORE_URLS` override in the Amvera deployment — Kestrel serves plain HTTP; Amvera's ingress terminates TLS.
- `amvera.yml` must always reference an **immutable** tag or digest — never `latest`.
- Secrets file: `.env.amvera` at repo root by default, overridable via `AMVERA_ENV_FILE`. Never committed, never echoed, never read by an agent.
- Amvera environment variables (exact names):
  - secrets: `Auth__AllowedEmails__0`, `ConnectionStrings__Default`, `GoogleAuth__ClientId`, `GoogleAuth__ClientSecret`, `Integrations__OpenAI__BaseUrl`, `Integrations__OpenAI__ApiKey`
  - variable: `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true`
- `App__Logging__WriteLogsInJsonFormat` stays at its `false` default in production.
- Deploy order is fixed: preflight → resolve/build image → migrate database → sync env vars → push `amvera.yml` → tail logs.
- Scripts are `bash`, `set -euo pipefail`, and must not use bash 4+ features (macOS ships bash 3.2). No `mapfile`, no associative arrays, no `${var,,}`.
- Deliberately kept and not to be touched: `docker-compose.yml`, `docker-compose.base.yml`, `.github/workflows/release.yml`, `.github/workflows/deploy-demo.yml`, `tests/` (e2e suite), Docker Hub release tags.
- Per repo rules: run builds and tests before finishing a task; comments only for "why", never restating code.

---

## File Structure

**Created:**

- `deploy/amvera.yml.template` — the Amvera config with an `__IMAGE__` placeholder. Single responsibility: the shape of what Amvera receives.
- `scripts/lib/dockerhub.sh` — sourceable, side-effect-free functions that turn `latest` into a concrete image reference against the Docker Hub tags API. Isolated so it can be unit-tested offline.
- `scripts/lib/dockerhub.test.sh` — offline test for the above, stubbing the HTTP call.
- `scripts/deploy.sh` — the deploy entry point: argument parsing, preflight, orchestration.
- `.env.amvera.example` — documented, committed template mirroring the existing `.env.example` convention.

**Modified:**

- `Dockerfile` — build stages become `$BUILDPLATFORM`-native; runtime stays target-platform.
- `.gitignore` — add `.env.amvera`.
- `.claude/settings.json` — deny rules for `.env.amvera`.
- `src/backend/src/FoodDiary.Configuration/AppOptions.cs` — drop two properties.
- `src/backend/src/FoodDiary.API/Logging/LoggerConfigurationExtensions.cs` — drop the Yandex branch.
- `src/backend/src/FoodDiary.API/Startup.cs:129-142` — drop the scheme-rewriting middleware and now-unused usings.
- `src/backend/src/FoodDiary.API/appsettings.json:33-39`, `appsettings.Development.json:14-20` — drop removed keys.
- `.github/workflows/build.yml` — delete `run-migrations`, `build-and-push-image`, `deploy` jobs and the `env:` block.
- `README.md` — new "Deployment" section + TOC entry.
- `CHANGELOG.md` — `[Unreleased]` entry.

**Deleted:**

- `.github/workflows/deploy.yml`
- `src/backend/src/FoodDiary.API/Logging/YandexCloudJsonFormatter.cs`

---

### Task 1: Dockerfile cross-compilation

The dev machine is arm64, Amvera runs amd64. Today `docker buildx build --platform linux/amd64` would run `dotnet publish` and `yarn install` under QEMU. Make the build stages native to the build platform and leave only the runtime layer on the target platform.

**Files:**

- Modify: `Dockerfile` (whole file)

**Interfaces:**

- Consumes: nothing.
- Produces: an image buildable with `docker buildx build --platform linux/amd64` on arm64 in minutes, not tens of minutes. Task 5's `--build` path depends on this.

- [ ] **Step 1: Read the current Dockerfile**

Run: `cat Dockerfile`

It should currently read:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend
WORKDIR /app
COPY src/backend .
RUN dotnet publish -c Release -o publish src/FoodDiary.API/FoodDiary.API.csproj
RUN dotnet publish -c Release -o publish/migrator src/FoodDiary.Migrator/FoodDiary.Migrator.csproj

FROM node:24-alpine AS frontend
WORKDIR /app
COPY src/frontend .
RUN yarn install
RUN yarn build

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=backend app/publish .
COPY --from=frontend app/dist frontend/dist
EXPOSE 8080
ENTRYPOINT ["dotnet", "FoodDiary.API.dll"]
```

- [ ] **Step 2: Rewrite it for cross-compilation**

`$BUILDPLATFORM` and `$TARGETARCH` are automatic build args provided by BuildKit; they need no `--build-arg`. `dotnet publish -a $TARGETARCH` makes the SDK emit binaries for the target architecture while the SDK itself runs natively. `TARGETARCH` values (`amd64`, `arm64`) are exactly the values `-a` accepts. The frontend stage emits JavaScript, so it needs no target awareness at all.

```dockerfile
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:10.0 AS backend
ARG TARGETARCH
WORKDIR /app
COPY src/backend .
RUN dotnet publish -c Release -a $TARGETARCH -o publish src/FoodDiary.API/FoodDiary.API.csproj
RUN dotnet publish -c Release -a $TARGETARCH -o publish/migrator src/FoodDiary.Migrator/FoodDiary.Migrator.csproj

FROM --platform=$BUILDPLATFORM node:24-alpine AS frontend
WORKDIR /app
COPY src/frontend .
RUN yarn install
RUN yarn build

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=backend app/publish .
COPY --from=frontend app/dist frontend/dist
EXPOSE 8080
ENTRYPOINT ["dotnet", "FoodDiary.API.dll"]
```

- [ ] **Step 3: Verify the native build still works**

Requires a running Docker daemon. If Docker is not available, **stop and ask the user how to proceed** — do not skip this step.

Run: `docker build -t food-diary:local-check .`
Expected: build succeeds, ending in `naming to docker.io/library/food-diary:local-check`.

- [ ] **Step 4: Verify the cross-build works and is not emulated**

Run:

```bash
time docker buildx build --platform linux/amd64 -t food-diary:amd64-check --load .
```

Expected: build succeeds. On an arm64 machine it should complete in single-digit minutes and the `dotnet publish` / `yarn install` steps must **not** be preceded by BuildKit falling back to emulation. Confirm the produced image is amd64:

```bash
docker image inspect food-diary:amd64-check --format '{{.Architecture}}'
```

Expected: `amd64`

- [ ] **Step 5: Verify the image actually runs**

Run:

```bash
docker run --rm --entrypoint ls food-diary:local-check -1 /app | head
```

Expected: lists `FoodDiary.API.dll`, `frontend`, `migrator`.

- [ ] **Step 6: Clean up the check images**

```bash
docker image rm food-diary:local-check food-diary:amd64-check
```

- [ ] **Step 7: Commit**

```bash
git add Dockerfile
git commit -m "build: cross-compile Dockerfile build stages for the build platform"
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

**Interfaces:**

- Consumes: nothing.
- Produces: `AppOptions` reduced to `{ Logging: { WriteLogsInJsonFormat: bool } }`. No other task references the removed members.

- [ ] **Step 1: Confirm the blast radius before editing**

Run:

```bash
git grep -n -i -E "yandex|ForwardHttpsSchemeManually" -- src .github
```

Expected: matches only in the six files above plus `.github/workflows/build.yml` and `.github/workflows/deploy.yml` (both handled in Task 6). If anything else appears — a test, a component-test fixture — handle it in this task too.

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

In `src/backend/src/FoodDiary.API/Logging/LoggerConfigurationExtensions.cs`, replace the `WriteToConsole` method body with a two-branch version and leave `Configure` untouched:

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

In `src/backend/src/FoodDiary.API/Startup.cs`, delete these lines (currently `Startup.cs:131-142`) — the whole `appOptions` local and the `if` block, keeping the `Configure` signature and everything from `if (env.IsDevelopment())` onward:

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

- [ ] **Step 6: Remove the usings that just went unused**

Those were `Startup.cs`'s only uses of `AppOptions` and `IOptions<>`. From the using block at the top of `src/backend/src/FoodDiary.API/Startup.cs`, delete:

```csharp
using FoodDiary.Configuration;
```

```csharp
using Microsoft.Extensions.Options;
```

Keep `using FoodDiary.Configuration.Extensions;` — `ConfigureCustomOptions` still needs it.

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

Run:

```bash
git grep -n -i -E "yandex|ForwardHttpsSchemeManually" -- src
```

Expected: no output.

- [ ] **Step 10: Build the backend**

Run:

```bash
cd src/backend && dotnet build --configuration Release
```

Expected: `Build succeeded`, 0 errors, 0 warnings about unused usings.

- [ ] **Step 11: Run the unit tests**

Run:

```bash
cd src/backend && dotnet test tests/FoodDiary.UnitTests
```

Expected: all tests pass.

- [ ] **Step 12: Run the component tests**

These need a Docker daemon (Testcontainers). If Docker is not available, **stop and ask the user how to proceed** — do not skip.

Run:

```bash
cd src/backend && dotnet test tests/FoodDiary.ComponentTests
```

Expected: all tests pass.

- [ ] **Step 13: Commit**

```bash
git add src/backend
git commit -m "refactor: drop Yandex Cloud log format and manual HTTPS scheme option"
```

---

### Task 3: Protect `.env.amvera` from git and from coding agents

`.env.amvera` will hold the production database connection string, the Google OAuth client secret, and the OpenAI API key in plaintext at the repo root. The existing `.gitignore` `.env` line matches only a file named exactly `.env`, so it does **not** cover this. Do this before the script exists, so the file is protected the moment anyone creates it.

**Files:**

- Modify: `.gitignore`
- Modify: `.claude/settings.json`
- Create: `.env.amvera.example`

**Interfaces:**

- Produces: `git check-ignore -q .env.amvera` succeeds — Task 5's preflight asserts exactly this. `.env.amvera.example` documents the key set that Task 5's preflight validates and Task 7's README describes.

- [ ] **Step 1: Write the failing check**

Create a scratch file so the ignore rule has something to match, then assert it is ignored:

```bash
touch .env.amvera
git check-ignore -q .env.amvera && echo IGNORED || echo "NOT IGNORED"
```

Expected: `NOT IGNORED`

- [ ] **Step 2: Add the ignore rule**

`.gitignore` becomes:

```gitignore
.DS_Store
.env
.env.amvera
!tests/.env
*.code-workspace
.claude/worktrees/
.superpowers/
```

Note `.env.amvera.example` is unaffected — the pattern matches that exact filename only.

- [ ] **Step 3: Re-run the check**

```bash
git check-ignore -q .env.amvera && echo IGNORED || echo "NOT IGNORED"
git status --porcelain | grep -F ".env.amvera" || echo "not listed by git status"
```

Expected: `IGNORED`, then `not listed by git status`.

- [ ] **Step 4: Confirm the example file is still trackable**

```bash
touch .env.amvera.example
git check-ignore -q .env.amvera.example && echo "WRONGLY IGNORED" || echo "trackable"
```

Expected: `trackable`

- [ ] **Step 5: Deny the file to coding agents**

`.claude/settings.json` already has `"Read(./**)"` in `permissions.allow`; `deny` takes precedence over `allow`, so adding deny entries is sufficient and nothing in `allow` changes. Add three entries to the existing `permissions.deny` array so it reads:

```json
    "deny": [
      "Read(./.env)",
      "Read(./.env.amvera)",
      "Bash(cat .env.amvera:*)",
      "Bash(cat ./.env.amvera:*)",
      "Read(./src/**/.env)",
      "Read(./src/frontend/**/.env.local)",
      "Read(./src/frontend/**/.env.*.local)",
      "Read(./secrets/**)"
    ],
```

The `Read` rule is the real boundary. The `Bash` entries are defence in depth against the obvious shortcut only — shell deny rules match command strings, so `grep`, `source`, or any other reader still gets through.

- [ ] **Step 6: Validate the settings file is still valid JSON**

```bash
jq empty .claude/settings.json && echo "valid json"
```

Expected: `valid json`

- [ ] **Step 7: Write `.env.amvera.example`**

Create `.env.amvera.example` with placeholder values only — this file **is** committed:

```dotenv
# Deployment secrets and configuration for Amvera. Copy to .env.amvera and fill in.
# .env.amvera is gitignored and must never be committed or pasted into a chat.

# Amvera git remote (Project settings -> Repository), e.g.
# https://git.amvera.ru/<amvera-user>/<amvera-project>
AMVERA_GIT_REMOTE=https://git.amvera.ru/<amvera-user>/<amvera-project>

# Synced to Amvera as secrets
Auth__AllowedEmails__0=<your_mail>@gmail.com
ConnectionStrings__Default=<supabase_postgres_connection_string>
GoogleAuth__ClientId=<your_google_client_id>
GoogleAuth__ClientSecret=<your_google_client_secret>
Integrations__OpenAI__BaseUrl=https://api.openai.com/v1
Integrations__OpenAI__ApiKey=<your_openai_api_key>

# Synced to Amvera as a plain variable
ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
```

- [ ] **Step 8: Remove the scratch file**

```bash
rm -f .env.amvera
```

- [ ] **Step 9: Commit**

```bash
git add .gitignore .claude/settings.json .env.amvera.example
git commit -m "chore: gitignore .env.amvera and deny it to coding agents"
```

---

### Task 4: Docker Hub tag resolution library

`amvera.yml` must never reference `latest` — a moving tag risks Amvera reusing a cached image and makes the deployed version unknowable. This task builds the pure function that turns `latest` into a concrete reference, isolated in its own file so it can be tested offline.

Resolution rule: read the digest behind `pkirilin/food-diary:latest` from Docker Hub's public tags API, then pick the named tag (excluding `latest`) sharing that digest. If several match, pick the highest by version sort. If none match, fall back to `pkirilin/food-diary@sha256:...`.

**Files:**

- Create: `scripts/lib/dockerhub.sh`
- Test: `scripts/lib/dockerhub.test.sh`

**Interfaces:**

- Consumes: nothing.
- Produces, for Task 5 to source:
  - `dockerhub_fetch_tags <repo>` — echoes the raw JSON of `https://hub.docker.com/v2/repositories/<repo>/tags?page_size=100`. Overridable by tests.
  - `dockerhub_resolve_latest <repo>` — echoes a full image reference string (`repo:tag` or `repo@sha256:...`) on stdout; returns 1 and writes a message to stderr if `latest` is absent or the response is unusable.

- [ ] **Step 1: Write the failing test**

Create `scripts/lib/dockerhub.test.sh`. It replaces `dockerhub_fetch_tags` with a fixture-returning stub, so it never touches the network:

```bash
#!/usr/bin/env bash
set -uo pipefail

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=./dockerhub.sh
. "$script_dir/dockerhub.sh"

failures=0

assert_eq() {
  local expected=$1 actual=$2 name=$3
  if [ "$expected" = "$actual" ]; then
    echo "ok   - $name"
  else
    echo "FAIL - $name"
    echo "       expected: $expected"
    echo "       actual:   $actual"
    failures=$((failures + 1))
  fi
}

fixture=''
dockerhub_fetch_tags() { printf '%s' "$fixture"; }

fixture='{"results":[
  {"name":"latest","digest":"sha256:aaa"},
  {"name":"0.6.1","digest":"sha256:aaa"},
  {"name":"0.6.0","digest":"sha256:bbb"}
]}'
assert_eq "pkirilin/food-diary:0.6.1" \
  "$(dockerhub_resolve_latest pkirilin/food-diary)" \
  "picks the named tag sharing latest's digest"

fixture='{"results":[
  {"name":"latest","digest":"sha256:aaa"},
  {"name":"0.9.0","digest":"sha256:aaa"},
  {"name":"0.10.0","digest":"sha256:aaa"}
]}'
assert_eq "pkirilin/food-diary:0.10.0" \
  "$(dockerhub_resolve_latest pkirilin/food-diary)" \
  "picks the highest version when several tags share the digest"

fixture='{"results":[
  {"name":"latest","digest":"sha256:aaa"},
  {"name":"0.6.0","digest":"sha256:bbb"}
]}'
assert_eq "pkirilin/food-diary@sha256:aaa" \
  "$(dockerhub_resolve_latest pkirilin/food-diary)" \
  "falls back to a digest reference when no named tag matches"

fixture='{"results":[
  {"name":"latest","digest":"","images":[{"digest":"sha256:ccc"}]},
  {"name":"0.6.1","digest":"","images":[{"digest":"sha256:ccc"}]}
]}'
assert_eq "pkirilin/food-diary:0.6.1" \
  "$(dockerhub_resolve_latest pkirilin/food-diary)" \
  "reads the digest from images[] when the tag-level digest is empty"

fixture='{"results":[{"name":"0.6.1","digest":"sha256:aaa"}]}'
out=$(dockerhub_resolve_latest pkirilin/food-diary 2>/dev/null)
rc=$?
assert_eq "1" "$rc" "fails when latest is absent"
assert_eq "" "$out" "prints nothing when latest is absent"

if [ "$failures" -gt 0 ]; then
  echo "$failures test(s) failed"
  exit 1
fi
echo "all tests passed"
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bash scripts/lib/dockerhub.test.sh`
Expected: FAIL — `scripts/lib/dockerhub.sh: No such file or directory`.

- [ ] **Step 3: Write the implementation**

Create `scripts/lib/dockerhub.sh`. It is a library: no `set -e`, no top-level side effects.

```bash
#!/usr/bin/env bash
# Resolves Docker Hub tags for deployment. Source this file; it runs nothing on its own.

dockerhub_fetch_tags() {
  local repo=$1
  curl -fsSL --connect-timeout 5 --max-time 20 \
    "https://hub.docker.com/v2/repositories/${repo}/tags?page_size=100"
}

dockerhub_resolve_latest() {
  local repo=$1
  local payload digest tag

  payload=$(dockerhub_fetch_tags "$repo") || {
    echo "Failed to query Docker Hub tags for $repo" >&2
    return 1
  }

  digest=$(printf '%s' "$payload" | jq -r '
    .results[]? | select(.name == "latest")
    | (.digest // "") as $d
    | if $d != "" then $d else (.images[0].digest // "") end
  ' | head -n 1)

  if [ -z "$digest" ] || [ "$digest" = "null" ]; then
    echo "Could not determine the digest behind ${repo}:latest" >&2
    return 1
  fi

  tag=$(printf '%s' "$payload" | jq -r --arg d "$digest" '
    .results[]?
    | select(.name != "latest")
    | select(((.digest // "") == $d) or ((.images[0].digest // "") == $d))
    | .name
  ' | sort -V | tail -n 1)

  if [ -n "$tag" ]; then
    printf '%s:%s' "$repo" "$tag"
  else
    printf '%s@%s' "$repo" "$digest"
  fi
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bash scripts/lib/dockerhub.test.sh`
Expected: six `ok -` lines, then `all tests passed`.

Note: `sort -V` is GNU-style version sort; macOS `sort` supports `-V` on Ventura and later. If it errors with `illegal option -- V`, install coreutils (`brew install coreutils`) and switch that pipeline to `gsort -V`.

- [ ] **Step 5: Verify it works against the real API**

```bash
bash -c '. scripts/lib/dockerhub.sh; dockerhub_resolve_latest pkirilin/food-diary'
```

Expected: something like `pkirilin/food-diary:0.6.1` — a concrete tag, never `:latest`.

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/dockerhub.sh scripts/lib/dockerhub.test.sh
git commit -m "feat: add Docker Hub latest-tag resolution helper"
```

---

### Task 5: The deploy script

The single command behind every deploy. Note that steps 1–4 below establish the CLI surface and preflight before any remote state is touched; the orchestration follows.

**Files:**

- Create: `deploy/amvera.yml.template`
- Create: `scripts/deploy.sh`
- Test: manual, via `--help` and preflight failure paths (the network- and CLI-touching parts are verified for real in Task 8)

**Interfaces:**

- Consumes: `dockerhub_resolve_latest` from `scripts/lib/dockerhub.sh` (Task 4); `git check-ignore -q .env.amvera` succeeding (Task 3); the amd64 cross-build from Task 1.
- Produces: `./scripts/deploy.sh [--tag <tag>] [--build] [--registry docker|ghcr] [--skip-migrations] [--help]`, and the orphan-commit push protocol that Task 7's README documents.

- [ ] **Step 1: Discover the real Amvera CLI syntax**

The spec names `amvera whoami`, `amvera env`, and `amvera logs run` but does not pin their flags, and the flags are what the script has to call. Establish them now, before writing the script:

```bash
amvera --help
amvera env --help
amvera logs --help
```

Record the exact subcommand for setting a single variable and for setting a secret. This plan assumes:

- `amvera env set <NAME> <VALUE>` for a plain variable
- `amvera env set <NAME> <VALUE> --secret` for a secret
- `amvera logs run` to tail runtime logs

If the actual CLI differs, adjust the two functions in Step 6 (`amvera_set_var` / `amvera_set_secret`) and nothing else — they are the only place the syntax appears. If the CLI has no non-interactive env command at all, make those two functions print the variable **names** (never values) with an instruction to enter them once in the Amvera UI, and note it in the README in Task 7.

- [ ] **Step 2: Create the Amvera config template**

Create `deploy/amvera.yml.template`. `__IMAGE__` is substituted with the resolved reference. No `meta` section is needed — Amvera defaults to the docker environment.

```yaml
build:
  skip: yes
run:
  image: __IMAGE__
  containerPort: 8080
```

- [ ] **Step 3: Write the script skeleton — argument parsing and usage**

Create `scripts/deploy.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

repo_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
# shellcheck source=./lib/dockerhub.sh
. "$repo_root/scripts/lib/dockerhub.sh"

IMAGE_REPO_DOCKER="pkirilin/food-diary"
IMAGE_REPO_GHCR="ghcr.io/pkirilin/food-diary"
ENV_FILE="${AMVERA_ENV_FILE:-$repo_root/.env.amvera}"
REQUIRED_ENV_KEYS="AMVERA_GIT_REMOTE Auth__AllowedEmails__0 ConnectionStrings__Default GoogleAuth__ClientId GoogleAuth__ClientSecret Integrations__OpenAI__BaseUrl Integrations__OpenAI__ApiKey ASPNETCORE_FORWARDEDHEADERS_ENABLED"
SECRET_ENV_KEYS="Auth__AllowedEmails__0 ConnectionStrings__Default GoogleAuth__ClientId GoogleAuth__ClientSecret Integrations__OpenAI__BaseUrl Integrations__OpenAI__ApiKey"
PLAIN_ENV_KEYS="ASPNETCORE_FORWARDEDHEADERS_ENABLED"

tag=""
do_build=false
registry="docker"
skip_migrations=false

usage() {
  cat <<'EOF'
Deploy Food Diary to Amvera.

Usage:
  ./scripts/deploy.sh                     Deploy the newest published release
  ./scripts/deploy.sh --tag 0.6.0         Deploy a specific published tag (rollback)
  ./scripts/deploy.sh --build             Build HEAD, push <short-sha>, deploy it
  ./scripts/deploy.sh --build --registry ghcr
                                          With --build, push to ghcr.io instead

Options:
  --tag <tag>          Deploy an existing published tag
  --build              Build and push the image from HEAD before deploying
  --registry <name>    docker (default) or ghcr; only meaningful with --build
  --skip-migrations    Do not run database migrations (use only when the schema is unchanged)
  -h, --help           Show this help
EOF
}

log() { printf '\n==> %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

while [ $# -gt 0 ]; do
  case "$1" in
    --tag) tag="${2:-}"; [ -n "$tag" ] || die "--tag requires a value"; shift 2 ;;
    --build) do_build=true; shift ;;
    --registry) registry="${2:-}"; shift 2 ;;
    --skip-migrations) skip_migrations=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) usage >&2; die "unknown argument: $1" ;;
  esac
done

[ "$registry" = "docker" ] || [ "$registry" = "ghcr" ] || die "--registry must be docker or ghcr"
if [ "$do_build" = true ] && [ -n "$tag" ]; then
  die "--build and --tag are mutually exclusive"
fi
```

- [ ] **Step 4: Add preflight**

Append to `scripts/deploy.sh`. Everything here runs before any remote state is touched, so a failure costs nothing. Note the env file is only ever loaded in a subshell (Step 6) and its values are never printed — preflight reports presence only.

```bash
preflight() {
  log "Preflight"

  command -v docker >/dev/null 2>&1 || die "docker not found on PATH"
  docker info >/dev/null 2>&1 || die "Docker daemon is not reachable; start Docker and retry"
  command -v jq >/dev/null 2>&1 || die "jq not found on PATH (brew install jq)"
  command -v git >/dev/null 2>&1 || die "git not found on PATH"
  command -v amvera >/dev/null 2>&1 || die "amvera CLI not found on PATH"

  amvera whoami >/dev/null 2>&1 || die "not logged in to Amvera; run: amvera login"

  [ -z "$(git -C "$repo_root" status --porcelain)" ] \
    || die "working tree is dirty; commit or stash before deploying"

  [ -f "$ENV_FILE" ] || die "$ENV_FILE not found; copy .env.amvera.example and fill it in"

  git -C "$repo_root" check-ignore -q .env.amvera \
    || die ".env.amvera is not gitignored — refusing to deploy. Restore the .gitignore entry."

  local missing=""
  local key
  for key in $REQUIRED_ENV_KEYS; do
    if ! grep -q "^${key}=" "$ENV_FILE"; then
      missing="$missing $key"
    fi
  done
  [ -z "$missing" ] || die "$ENV_FILE is missing keys:$missing"

  echo "  docker, jq, git, amvera: ok"
  echo "  amvera session: ok"
  echo "  working tree: clean"
  echo "  $ENV_FILE: present, all required keys set"
}
```

`grep -q "^${key}="` checks presence only — it never captures or echoes a value.

- [ ] **Step 5: Add image resolution and the build path**

Append to `scripts/deploy.sh`:

```bash
resolve_image() {
  if [ -n "$tag" ]; then
    printf '%s:%s' "$IMAGE_REPO_DOCKER" "$tag"
    return
  fi
  dockerhub_resolve_latest "$IMAGE_REPO_DOCKER"
}

build_image() {
  local repo short_sha reference
  if [ "$registry" = "ghcr" ]; then
    repo="$IMAGE_REPO_GHCR"
  else
    repo="$IMAGE_REPO_DOCKER"
  fi
  short_sha=$(git -C "$repo_root" rev-parse --short HEAD)
  reference="${repo}:${short_sha}"

  log "Building and pushing $reference (linux/amd64)" >&2
  docker buildx build \
    --platform linux/amd64 \
    --tag "$reference" \
    --push \
    "$repo_root" >&2

  printf '%s' "$reference"
}
```

`build_image` writes progress to stderr so that stdout carries only the reference.

- [ ] **Step 6: Add migrations and environment sync**

Append to `scripts/deploy.sh`. The env file is sourced inside a subshell in each function, so its values never leak into the parent shell, the terminal, or an agent transcript. `set -x` is never enabled here.

```bash
run_migrations() {
  if [ "$skip_migrations" = true ]; then
    log "Skipping database migrations (--skip-migrations)"
    return
  fi

  log "Running database migrations"
  (
    set -a
    # shellcheck disable=SC1090
    . "$ENV_FILE"
    set +a
    dotnet run --configuration Release \
      --project "$repo_root/src/backend/src/FoodDiary.Migrator/FoodDiary.Migrator.csproj" \
      "$ConnectionStrings__Default"
  ) || die "database migrations failed; nothing was deployed"
}

amvera_set_secret() { amvera env set "$1" "$2" --secret >/dev/null; }
amvera_set_var() { amvera env set "$1" "$2" >/dev/null; }

sync_env() {
  log "Syncing environment variables to Amvera"
  (
    set -a
    # shellcheck disable=SC1090
    . "$ENV_FILE"
    set +a
    for key in $SECRET_ENV_KEYS; do
      eval "value=\${$key}"
      amvera_set_secret "$key" "$value"
      echo "  $key: synced (secret)"
    done
    for key in $PLAIN_ENV_KEYS; do
      eval "value=\${$key}"
      amvera_set_var "$key" "$value"
      echo "  $key: synced"
    done
  ) || die "failed to sync environment variables"
}
```

Only key names are echoed, never values.

- [ ] **Step 7: Add the orphan-commit push**

Append to `scripts/deploy.sh`. Pushing to the Amvera repo's `master` is what triggers Amvera's pipeline; with the build skipped it goes straight to deployment. A single-file orphan commit means no source ever reaches Amvera, the GitHub repo's history never churns with deploy commits, and force-pushing keeps the Amvera repo deterministic despite the config commits Amvera's web UI creates.

```bash
push_amvera_config() {
  local image=$1 remote work_dir
  remote=$(grep '^AMVERA_GIT_REMOTE=' "$ENV_FILE" | head -n 1 | cut -d= -f2-)
  [ -n "$remote" ] || die "AMVERA_GIT_REMOTE is empty in $ENV_FILE"

  work_dir=$(mktemp -d)
  trap 'rm -rf "$work_dir"' RETURN

  sed "s|__IMAGE__|${image}|" "$repo_root/deploy/amvera.yml.template" > "$work_dir/amvera.yml"

  log "Pushing amvera.yml to Amvera"
  cat "$work_dir/amvera.yml"

  git -C "$work_dir" init -q -b master
  git -C "$work_dir" add amvera.yml
  git -C "$work_dir" -c user.name="food-diary-deploy" \
      -c user.email="deploy@food-diary.local" \
      commit -q -m "deploy $image"
  git -C "$work_dir" push -q --force "$remote" master:master \
    || die "push to Amvera failed; check your git credentials for $remote"
}
```

- [ ] **Step 8: Wire up `main`**

Append to `scripts/deploy.sh`. Migrations run before the image reference is pushed, so the schema always leads the code.

```bash
main() {
  preflight

  local image
  if [ "$do_build" = true ]; then
    image=$(build_image)
  else
    log "Resolving image reference"
    image=$(resolve_image) || die "could not resolve an image to deploy"
  fi
  echo "  image: $image"

  run_migrations
  sync_env
  push_amvera_config "$image"

  log "Deployed $image — tailing Amvera run logs (Ctrl-C to stop)"
  amvera logs run
}

main
```

- [ ] **Step 9: Make it executable and lint it**

```bash
chmod +x scripts/deploy.sh
bash -n scripts/deploy.sh && echo "syntax ok"
command -v shellcheck >/dev/null && shellcheck scripts/deploy.sh || echo "shellcheck not installed, skipping"
```

Expected: `syntax ok`, and shellcheck clean if installed.

- [ ] **Step 10: Verify `--help` and argument validation**

```bash
./scripts/deploy.sh --help
./scripts/deploy.sh --build --tag 0.6.0 || echo "rejected as expected"
./scripts/deploy.sh --registry nope || echo "rejected as expected"
./scripts/deploy.sh --bogus || echo "rejected as expected"
```

Expected: usage text for `--help` (exit 0); each of the other three prints an `error:` line and `rejected as expected`.

- [ ] **Step 11: Verify preflight refuses an unprotected env file**

This proves the guard from Task 3 is actually enforced:

```bash
touch .env.amvera
git -C . check-ignore -q .env.amvera && echo "still ignored (good)"
# temporarily neutralise the rule to prove the guard fires
sed -i '' '/^\.env\.amvera$/d' .gitignore
./scripts/deploy.sh || echo "aborted as expected"
git checkout .gitignore
rm -f .env.amvera
```

Expected: the run aborts with `.env.amvera is not gitignored — refusing to deploy` (or an earlier preflight failure such as a dirty tree — in that case re-run after stashing, since this specific assertion is the one under test).

- [ ] **Step 12: Verify template rendering**

```bash
sed 's|__IMAGE__|pkirilin/food-diary:0.6.1|' deploy/amvera.yml.template
```

Expected:

```yaml
build:
  skip: yes
run:
  image: pkirilin/food-diary:0.6.1
  containerPort: 8080
```

- [ ] **Step 13: Commit**

```bash
git add scripts/deploy.sh deploy/amvera.yml.template
git commit -m "feat: add Amvera deploy script"
```

---

### Task 6: Strip deployment out of CI

GitHub Actions becomes verification-only and holds no deployment credentials. Removing `run-migrations` from CI is deliberate: with deploys now manual, a CI job migrating Supabase on every merge to `main` would change the production schema at a moment unrelated to any deploy, leaving the running old code to meet a new schema.

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

Note: the README badge links to `build.yml` by filename, not by workflow name, so it keeps working.

- [ ] **Step 5: Verify the workflow is valid YAML with the expected jobs**

```bash
jq -n --rawfile _ .github/workflows/build.yml 'empty' 2>/dev/null || true
grep -n "^  [a-z-]*:$" .github/workflows/build.yml
```

Expected: exactly three job keys — `  backend:`, `  frontend:`, `  e2e-tests:`.

If `yq` is available, prefer a real parse:

```bash
command -v yq >/dev/null && yq '.jobs | keys' .github/workflows/build.yml
```

Expected: `["backend", "frontend", "e2e-tests"]`

- [ ] **Step 6: Verify no Yandex or YC references survive**

```bash
git grep -i yandex -- src .github || echo "clean"
git grep YC_ -- src .github || echo "clean"
```

Expected: `clean` twice.

- [ ] **Step 7: Commit**

```bash
git add .github
git commit -m "ci: remove Yandex Cloud deployment jobs and workflow"
```

---

### Task 7: Documentation

**Files:**

- Modify: `README.md` (TOC at lines 12-25; new section between `Managing database migrations` and `Releasing`)
- Modify: `CHANGELOG.md` (the `[Unreleased]` section)

**Interfaces:**

- Consumes: the CLI surface from Task 5, the env keys from Task 3.
- Produces: acceptance criterion 6 — the section must be sufficient to repeat the setup from scratch.

- [ ] **Step 1: Add the TOC entry**

In `README.md`, the table of contents list becomes:

```markdown
- [Features](#features)
- [Installation](#installation)
- [Development](#development)
  - [Setting up the entire app (Frontend and Backend)](#setting-up-the-entire-app-frontend-and-backend)
  - [Setting up Frontend with mocked auth and API](#setting-up-frontend-with-mocked-auth-and-api)
    - [Frontend environment variables](#frontend-environment-variables)
  - [Managing database migrations](#managing-database-migrations)
- [Deployment](#deployment)
- [Releasing](#releasing)
- [Contacts](#contacts)
- [Copyright](#copyright)
  - [Favicon](#favicon)
- [License](#license)
```

- [ ] **Step 2: Write the Deployment section**

Insert into `README.md` immediately before the `## Releasing` heading. Leave the existing Installation section (local docker-compose) untouched — it documents something different.

````markdown
## Deployment

The author's instance runs on [Amvera Cloud](https://amvera.ru) (Warsaw region,
tariff *Начальный*). Amvera does not build the project: it pulls an image that
the [Release workflow](.github/workflows/release.yml) has already published to
Docker Hub. Deploys run from a developer machine — CI holds no deployment
credentials.

### One-time setup

1. **Create the Amvera application.** In the Amvera console create a
   *Приложение* in the Warsaw region on the *Начальный* tariff. Connect it to
   no external repository and add no webhook — its git repo is only a push
   target. Copy the repository URL from the project's settings; it looks like
   `https://git.amvera.ru/<user>/<project>`.

2. **Install and log in to the Amvera CLI:**

   ```shell
   amvera login
   amvera whoami
   ```

3. **Create `.env.amvera`** at the repository root from the template:

   ```shell
   cp .env.amvera.example .env.amvera
   ```

   Fill in every value. The file is gitignored and holds production secrets in
   plaintext — never commit it, never paste its contents anywhere:

   | Name | Kind in Amvera |
   |---|---|
   | `AMVERA_GIT_REMOTE` | used locally by `deploy.sh`, not sent to Amvera |
   | `Auth__AllowedEmails__0` | secret |
   | `ConnectionStrings__Default` | secret |
   | `GoogleAuth__ClientId` | secret |
   | `GoogleAuth__ClientSecret` | secret |
   | `Integrations__OpenAI__BaseUrl` | secret |
   | `Integrations__OpenAI__ApiKey` | secret |
   | `ASPNETCORE_FORWARDEDHEADERS_ENABLED` | variable, `true` |

   `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true` is required: Amvera terminates
   TLS at its ingress and forwards plain HTTP, so without it Kestrel sees
   `http`, `UseHttpsRedirection` loops, and Google OAuth generates `http://`
   redirect URIs. Amvera applies variable changes only after a container
   restart.

   To keep the file outside the repository, put it anywhere and point
   `AMVERA_ENV_FILE` at it.

4. **Attach a custom domain.** Amvera exposes no CLI for domains, so this is
   manual and one-time. Using your own subdomain rather than the free
   `<project>.<user>.amvera.io` means the URL belongs to the project, so a
   later move to different hosting is a DNS change that does not invalidate
   Google OAuth configuration, saved sessions, or installed PWAs.

   1. Point an `A` record at the IP shown in the Amvera project settings.
   2. Add the `TXT` record shown alongside it.
   3. Confirm and attach the domain in the Amvera UI, then wait for the
      Let's Encrypt certificate to be issued.

5. **Update the Google OAuth client** for the production domain:

   - Authorized JavaScript origin: `https://<app-domain>`
   - Authorized redirect URI: `https://<app-domain>/signin-google`

### Deploying

```shell
./scripts/deploy.sh                   # deploy the newest published release
./scripts/deploy.sh --tag 0.6.0       # deploy a specific published tag (rollback)
./scripts/deploy.sh --build           # build HEAD, push <short-sha>, deploy it
./scripts/deploy.sh --build --registry ghcr   # push the built image to ghcr.io instead
```

With no arguments the script deploys the newest image already on Docker Hub and
builds nothing. Because `latest` is a moving tag — which would let Amvera reuse
a cached image and make the deployed version unknowable — the script resolves it
to a concrete tag before writing any config.

Each run, in order:

1. **Preflight** — Docker daemon reachable, `amvera whoami` succeeds, working
   tree clean, `.env.amvera` present, gitignored, and complete. Aborts before
   touching any remote state.
2. **Resolve the image**, or build and push it when `--build` is passed.
3. **Run database migrations** against the production database, so the schema
   always leads the code.
4. **Sync environment variables** to Amvera.
5. **Push `amvera.yml`** as a single-file orphan commit to the Amvera remote,
   which triggers the deploy.
6. **Tail `amvera logs run`** so the outcome is visible without opening the UI.

### Rolling back

```shell
./scripts/deploy.sh --tag <previous-version>
```

If the previous version's schema is compatible, add `--skip-migrations`.
Migrations are never reverted automatically.
````

- [ ] **Step 3: Verify the README lints**

```bash
npx markdownlint-cli2 README.md
```

Expected: no errors. (The repo's config is `.markdownlint-cli2.jsonc`.)

- [ ] **Step 4: Add the CHANGELOG entry**

In `CHANGELOG.md`, the `## [Unreleased]` section becomes:

```markdown
## [Unreleased]

### Changed

- Hosting moved from Yandex Cloud serverless containers to Amvera Cloud
  (Warsaw region). Deploys now run from a developer machine via
  `./scripts/deploy.sh`, which deploys an image already published to Docker Hub
  — see the new Deployment section in the README
- HTTPS scheme behind a reverse proxy is now handled by ASP.NET Core's
  `ASPNETCORE_FORWARDEDHEADERS_ENABLED` instead of a custom middleware, so
  request logs show the real client IP
- Dockerfile build stages now run natively on the build platform when
  cross-compiling, so amd64 images build in minutes on an arm64 machine

### Removed

- `App__ForwardHttpsSchemeManuallyForAllRequests` configuration option
- `App__Logging__UseYandexCloudLogsFormat` configuration option and the Yandex
  Cloud log formatter
- Deployment and migration jobs from CI — GitHub Actions now runs verification
  only
```

- [ ] **Step 5: Verify the CHANGELOG lints**

```bash
npx markdownlint-cli2 CHANGELOG.md
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add README.md CHANGELOG.md
git commit -m "docs: document Amvera deployment and record the migration"
```

---

### Task 8: Live acceptance

Everything up to here is verifiable offline. This task exercises the real deployment and is the only place the migration's three motivations are actually tested. It requires Amvera credentials, the custom domain, and a Docker daemon — run it interactively with the user.

**Files:** none — this is verification.

**Interfaces:**

- Consumes: every prior task.
- Produces: a confirmed-working deployment, or a decision to fall back.

- [ ] **Step 1: Confirm the full test suite is green**

```bash
cd src/backend && dotnet test
cd src/frontend && yarn lint && yarn build && yarn test
```

Expected: all pass. (Backend component tests need Docker; if unavailable, **stop and ask the user how to proceed**.)

- [ ] **Step 2: Confirm the repo is free of Yandex artifacts**

```bash
git grep -i yandex -- src .github || echo "clean"
git grep YC_ -- src .github || echo "clean"
git check-ignore -q .env.amvera && echo "env file protected"
git status --porcelain | grep -F ".env.amvera" || echo "env file not tracked"
```

Expected: `clean`, `clean`, `env file protected`, `env file not tracked`.

- [ ] **Step 3: Deploy the newest release**

```bash
./scripts/deploy.sh
```

Expected: preflight passes, a concrete tag is printed (never `latest`), migrations report success, env vars sync, the push succeeds, and `amvera logs run` shows the app starting on port 8080.

If the Amvera build stage rejects a `sha256:` digest reference, re-run with an explicit `--tag <version>` — the digest path is a fallback and Amvera's docs only show tag references.

- [ ] **Step 4: Verify HTTPS and Google sign-in**

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

Place it as the first statement in `Configure`, before `if (env.IsDevelopment())`.

- [ ] **Step 5: Verify large payloads and note recognition**

In the deployed app, upload a large photo and run note recognition.

Expected: the upload succeeds and recognition returns a result. Amvera publishes no `client_max_body_size` or SSE-buffering guarantee for its ingress, and the ingress is not user-configurable — **if this fails, the migration has not achieved its goal**; report it to the user, as it reopens the self-hosted VPS option.

- [ ] **Step 6: Verify rollback**

```bash
./scripts/deploy.sh --tag <previous-version> --skip-migrations
```

Expected: the previous version deploys and the app is reachable. Then redeploy the newest release with `./scripts/deploy.sh`.

- [ ] **Step 7: Watch for under-resourcing**

Exercise the app for a few minutes and watch `amvera logs run`.

Expected: no opaque 502/503 responses, no container restarts. A slow first request after a restart is expected on 0.5 GB / 0.25 vCPU. If restarts or 5xx appear, tell the user — *Начальный Плюс* (1 GB, 0.5 vCPU, 490 RUB/month) is still below the 650 RUB Yandex baseline, and tariff changes bill per hour.

- [ ] **Step 8: Confirm CI is green**

Push the branch and check the Build workflow.

Expected: `backend`, `frontend`, and `e2e-tests` all pass; no other jobs exist.

- [ ] **Step 9: Tell the user which GitHub secrets to delete**

These are now unused and must be removed manually in GitHub repository settings — the script cannot do it:

Secrets: `YC_CR_REGISTRY`, `YC_SA_JSON_CREDENTIALS`, `YC_FOLDER_ID`,
`YC_REVISION_SERVICE_ACCOUNT_ID`, `Migrator_DatabaseConnectionString`.
Variables: `YC_REVISION_SECRETS_ID`, `YC_REVISION_SECRETS_VERSION`.

Also remind them to decommission the Yandex Cloud serverless container itself so it stops billing.

---

## Out of scope

Per the design spec, this plan does **not** cover: migrating the database away from Supabase, the Food Diary MCP server, any change to the GitHub Pages demo deployment, or multi-instance / zero-downtime deployment guarantees.
