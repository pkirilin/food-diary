# .NET 10 Backend Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the `src/backend` .NET solution from .NET 8 to .NET 10 (LTS) — framework, C# language version, permissively-licensed package versions, and the solution file format — with a clean Release build and green test suites.

**Architecture:** Framework and language are bumped once in `src/backend/Directory.Build.props` (all 11 projects inherit it); every package version lives in `src/backend/Directory.Packages.props` (central package management). The migration proceeds in reviewable slices — framework/SDK, then packages, then the `.slnx` format, then Docker/CI/docs — each ending in a verifiable build/test gate. It is a framework + dependency migration only; **no behavioral or feature change.**

**Tech Stack:** .NET 10 SDK 10.0.302, C# 14, EF Core 10, ASP.NET Core 10, xUnit v2, Testcontainers, PostgreSQL, Docker.

## Global Constraints

Copied verbatim from the spec — every task's requirements implicitly include these:

- **Backend only.** Frontend and E2E JavaScript toolchains (Node 24) are untouched.
- **Target framework:** `net10.0`. **`LangVersion`:** explicit `14`. **SDK pin:** `global.json` version `10.0.302`, `rollForward: latestFeature`, `allowPrerelease: false`. Workflow SDK pins: exact `10.0.302`.
- **No individual `.csproj` sets `TargetFramework` or `LangVersion`** — they inherit from `Directory.Build.props`. Do not add these to any csproj.
- **`TreatWarningsAsErrors` is on.** The Release build must be **0 warnings, 0 errors**. Any new analyzer / obsolete-API / nullable warning from the net10 SDK or C# 14 is a build failure that must be resolved, not suppressed. Only `NU1701` is exempted (already in `WarningsNotAsErrors`).
- **`NU19xx` NuGet security-advisory warnings are build-breaking** and are NOT exempted. If a bumped package pulls a flagged transitive dependency, pin around it by adding an explicit `<PackageVersion>` for the transitive at a safe version.
- **Central package management:** add/change versions only in `Directory.Packages.props`. A `Version` attribute on a `<PackageReference>` fails the build with `NU1008`. More than one NuGet source fails with `NU1507` — do not remove the `<clear />` in `src/backend/NuGet.config`.
- **The trio stays put** (licensing decision): `FluentAssertions` 6.12.2, `MediatR` + `MediatR.Extensions.Microsoft.DependencyInjection` 10.0.1, `AutoMapper.Extensions.Microsoft.DependencyInjection` 8.1.1. Their DI-registration code — `AddMediatR(Assembly.GetExecutingAssembly())` at `src/FoodDiary.Application/Extensions/ServiceCollectionExtensions.cs:21` and `AddAutoMapper(Assembly.GetExecutingAssembly())` at `src/FoodDiary.API/Startup.cs:129` — is **unchanged**.
- **Held to narrow scope, verified on net10.0:** `Swashbuckle.AspNetCore` 6.5.0, `Testcontainers` + `Testcontainers.PostgreSql` 3.6.0 — left at current versions.
- **Historical files are not rewritten:** EF migration snapshots under `src/FoodDiary.Infrastructure/Migrations/*.Designer.cs` (they carry a historical `"ProductVersion", "8.0.0"` annotation — leave it), `docs/superpowers/**`, and `.superpowers/sdd/**` record past state.
- **Docker gate:** the component tests (`FoodDiary.ComponentTests`, Testcontainers) and the image build need a running Docker daemon. **Before running either, if Docker isn't available, STOP and ask the user how to proceed** — never skip the tests or silently substitute a non-Docker path (per `CLAUDE.md`).
- **Docs stay truthful:** update `README.md` and `CLAUDE.md` in the same change as the framework bump (per `.claude/rules/coding.md`).

### Resolved package versions (as of 2026-07-22)

Concrete latest-stable versions were resolved against nuget.org and are baked into Task 2 below. They may tick up before execution. **Before editing `Directory.Packages.props`, re-resolve to confirm** (a version ticking up is fine; use the newer stable patch):

```bash
# From anywhere — prints the latest STABLE version of one package id.
pkg=Microsoft.EntityFrameworkCore
curl -s "https://api.nuget.org/v3-flatcontainer/$(echo "$pkg" | tr '[:upper:]' '[:lower:]')/index.json" \
  | python3 -c "import sys,json; vs=[v for v in json.load(sys.stdin)['versions'] if '-' not in v]; print(vs[-1])"
```

---

## File Structure

Files created, modified, or deleted by this migration:

| Path | Task | Responsibility |
|------|------|----------------|
| `src/backend/Directory.Build.props` | 1 | Shared TFM + `LangVersion` for all projects. |
| `src/backend/global.json` | 1 | SDK version pin. |
| `src/backend/Directory.Packages.props` | 2 | Central package versions. |
| `src/backend/FoodDiary.slnx` | 3 | New solution file (created). |
| `src/backend/FoodDiary.sln` | 3 | Old solution file (deleted). |
| `.vscode/tasks.json` | 3 | Editor build/publish/watch tasks — 3 solution path refs. |
| `Dockerfile` | 4 | SDK + ASP.NET base image tags. |
| `.github/workflows/build.yml` | 4 | CI SDK pin (×2) + `dotnet-ef` version. |
| `.github/workflows/deploy.yml` | 4 | Deploy-workflow SDK pin (×1). |
| `.vscode/launch.json` | 4 | Debugger program path (`net8.0` segment). |
| `CLAUDE.md` | 4 | ".NET 8 solution (`FoodDiary.sln`)" description. |
| `README.md` | 4 | .NET SDK prerequisite floor. |

**Not touched** (verified during planning): `.claude/rules/backend.md` (version-agnostic), `src/backend/NuGet.config` (keep `<clear />`), all `.csproj` files (inherit TFM/lang), EF `Migrations/*.Designer.cs` (historical), `FoodDiary.sln.DotSettings.user` (gitignored Rider file — left on disk).

---

## Task 1: Bump target framework, language version, and SDK pin

**Files:**
- Modify: `src/backend/Directory.Build.props:3-4`
- Modify: `src/backend/global.json:3`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: a solution whose 11 projects target `net10.0` / C# 14, pinned to SDK `10.0.302`. Task 2's restore/build runs against this framework.

- [ ] **Step 1: Bump TFM and LangVersion in `Directory.Build.props`**

Replace the full contents of `src/backend/Directory.Build.props` with:

```xml
<Project>
  <PropertyGroup>
    <TargetFramework>net10.0</TargetFramework>
    <LangVersion>14</LangVersion>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <WarningsNotAsErrors>NU1701;$(WarningsNotAsErrors)</WarningsNotAsErrors>
  </PropertyGroup>
</Project>
```

- [ ] **Step 2: Bump the SDK pin in `global.json`**

Replace the full contents of `src/backend/global.json` with:

```json
{
  "sdk": {
    "version": "10.0.302",
    "rollForward": "latestFeature",
    "allowPrerelease": false
  }
}
```

- [ ] **Step 3: Verify the SDK resolves to 10.0.302**

Run: `cd src/backend && dotnet --version`
Expected: `10.0.302`

- [ ] **Step 4: Build Release and confirm 0 warnings, 0 errors**

Run: `cd src/backend && dotnet build --configuration Release`
Expected: `Build succeeded.` with `0 Warning(s)` and `0 Error(s)`.

> This build still uses the current (net8/net9) package set — a net10.0 project may consume lower `netX.0` package assets, so restore/compile succeeds. The point of this gate is to surface **net10 SDK / C# 14 analyzer, obsolete-API, or nullable warnings on the existing source code**, which `TreatWarningsAsErrors` turns fatal. If any warning appears: resolve the underlying cause in code (use superpowers:systematic-debugging to diagnose the specific warning code before editing). Do not suppress it and do not add it to `WarningsNotAsErrors`. Re-run this step until it is `0 Warning(s), 0 Error(s)`.

- [ ] **Step 5: Commit**

```bash
git add src/backend/Directory.Build.props src/backend/global.json
git commit -m "Bump backend to net10.0 / C# 14 and pin SDK 10.0.302"
```

---

## Task 2: Bump NuGet package versions

**Files:**
- Modify: `src/backend/Directory.Packages.props` (full rewrite of the `<ItemGroup>` versions)

**Interfaces:**
- Consumes: `net10.0` / SDK 10.0.302 from Task 1.
- Produces: all permissively-licensed packages at their latest stable versions compatible with .NET 10; trio and held packages unchanged. Later tasks build/test against this dependency set.

- [ ] **Step 1: Re-resolve latest stable versions (confirm the table)**

Run the resolver from the "Resolved package versions" note above for any package you want to double-check. The versions below are the resolved latest-stable as of 2026-07-22; if a patch has ticked up, use the newer stable value.

- [ ] **Step 2: Replace `Directory.Packages.props` with the bumped versions**

Replace the full contents of `src/backend/Directory.Packages.props` with:

```xml
<Project>
  <PropertyGroup>
    <ManagePackageVersionsCentrally>true</ManagePackageVersionsCentrally>
  </PropertyGroup>
  <ItemGroup>
    <PackageVersion Include="AutoFixture" Version="4.18.1" />
    <PackageVersion Include="AutoFixture.Xunit2" Version="4.18.1" />
    <PackageVersion Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="8.1.1" />
    <PackageVersion Include="FluentAssertions" Version="6.12.2" />
    <PackageVersion Include="JetBrains.Annotations" Version="2026.2.0" />
    <PackageVersion Include="LightBDD.XUnit2" Version="3.12.1" />
    <PackageVersion Include="MbDotNet" Version="5.0.0" />
    <PackageVersion Include="MediatR" Version="10.0.1" />
    <PackageVersion Include="MediatR.Extensions.Microsoft.DependencyInjection" Version="10.0.1" />
    <PackageVersion Include="Microsoft.AspNetCore.Authentication.Abstractions" Version="2.2.0" />
    <PackageVersion Include="Microsoft.AspNetCore.Authentication.Google" Version="10.0.10" />
    <PackageVersion Include="Microsoft.AspNetCore.DataProtection.EntityFrameworkCore" Version="10.0.10" />
    <PackageVersion Include="Microsoft.AspNetCore.Mvc.Testing" Version="10.0.10" />
    <PackageVersion Include="Microsoft.AspNetCore.SpaServices.Extensions" Version="10.0.10" />
    <PackageVersion Include="Microsoft.EntityFrameworkCore" Version="10.0.10" />
    <PackageVersion Include="Microsoft.EntityFrameworkCore.Design" Version="10.0.10" />
    <PackageVersion Include="Microsoft.Extensions.AI" Version="10.8.1" />
    <PackageVersion Include="Microsoft.Extensions.AI.Abstractions" Version="10.8.1" />
    <PackageVersion Include="Microsoft.Extensions.AI.OpenAI" Version="10.8.1" />
    <PackageVersion Include="Microsoft.Extensions.Configuration" Version="10.0.10" />
    <PackageVersion Include="Microsoft.Extensions.Configuration.Abstractions" Version="10.0.10" />
    <PackageVersion Include="Microsoft.Extensions.Configuration.EnvironmentVariables" Version="10.0.10" />
    <PackageVersion Include="Microsoft.Extensions.Configuration.FileExtensions" Version="10.0.10" />
    <PackageVersion Include="Microsoft.Extensions.Configuration.Json" Version="10.0.10" />
    <PackageVersion Include="Microsoft.Extensions.Configuration.UserSecrets" Version="10.0.10" />
    <PackageVersion Include="Microsoft.Extensions.DependencyInjection" Version="10.0.10" />
    <PackageVersion Include="Microsoft.Extensions.DependencyInjection.Abstractions" Version="10.0.10" />
    <PackageVersion Include="Microsoft.Extensions.Hosting.Abstractions" Version="10.0.10" />
    <PackageVersion Include="Microsoft.Extensions.Http" Version="10.0.10" />
    <PackageVersion Include="Microsoft.Extensions.Logging" Version="10.0.10" />
    <PackageVersion Include="Microsoft.Extensions.Logging.Console" Version="10.0.10" />
    <PackageVersion Include="Microsoft.Extensions.Options.ConfigurationExtensions" Version="10.0.10" />
    <PackageVersion Include="Microsoft.NET.Test.Sdk" Version="18.8.1" />
    <PackageVersion Include="Moq" Version="4.20.72" />
    <PackageVersion Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="10.0.3" />
    <PackageVersion Include="Polly.Core" Version="8.7.0" />
    <PackageVersion Include="Serilog.AspNetCore" Version="10.0.0" />
    <PackageVersion Include="Swashbuckle.AspNetCore" Version="6.5.0" />
    <PackageVersion Include="System.ComponentModel.Annotations" Version="5.0.0" />
    <PackageVersion Include="System.Text.Json" Version="10.0.10" />
    <PackageVersion Include="Testcontainers" Version="3.6.0" />
    <PackageVersion Include="Testcontainers.PostgreSql" Version="3.6.0" />
    <PackageVersion Include="coverlet.collector" Version="10.0.1" />
    <PackageVersion Include="xunit" Version="2.9.3" />
    <PackageVersion Include="xunit.runner.visualstudio" Version="3.1.5" />
  </ItemGroup>
</Project>
```

> **Both testing packages take the latest stable — one major beyond the spec's stated targets; approved by the maintainer (2026-07-22) to bump to the newest available:**
> - `coverlet.collector` → **10.0.1**. The spec said "latest 6.x", but coverlet has since published 8.x and 10.x stable; 10.0.1 is the true latest. Fallback if it misbehaves: **6.0.4**.
> - `xunit.runner.visualstudio` → **3.1.5**. The current is 2.5.8 (v2-era). The 3.x unified runner supports xUnit v2 2.x test projects (we stay on `xunit` 2.9.3). Fallback if `dotnet test` can't discover the v2 tests: **2.8.2** (latest 2.x).

- [ ] **Step 3: Restore and check for advisory / config warnings**

Run: `cd src/backend && dotnet restore`
Expected: `Restored ...` for every project, no `NU1507`, no `NU1008`, and **no `NU19xx`** security-advisory warnings.

> If an `NU19xx` warning names a flagged **transitive** package, add an explicit `<PackageVersion Include="<transitive-id>" Version="<safe-version>" />` line to `Directory.Packages.props` at the safe version, then re-run restore. (This is the documented pin-around from `.claude/rules/backend.md`.)

- [ ] **Step 4: Build Release and confirm 0 warnings, 0 errors**

Run: `cd src/backend && dotnet build --configuration Release --no-restore`
Expected: `Build succeeded.` with `0 Warning(s)` and `0 Error(s)`.

> New package majors can introduce `[Obsolete]` APIs or analyzers that `TreatWarningsAsErrors` turns fatal. Resolve each in code (superpowers:systematic-debugging) until clean.

- [ ] **Step 5: Run the unit test suite**

Run: `cd src/backend && dotnet test tests/FoodDiary.UnitTests --no-restore`
Expected: `Passed!` — all unit tests pass, 0 failed.

- [ ] **Step 6: Docker gate — check the daemon before component tests**

Run: `docker info`
- If it **fails** (daemon not running / not installed): **STOP.** Ask the user how to proceed — offer having them start/install Docker, and treat skipping the component tests as needing their explicit approval. Do not silently skip or substitute a non-Docker path.
- If it **succeeds**: continue to Step 7.

- [ ] **Step 7: Run the component test suite**

Run: `cd src/backend && dotnet test tests/FoodDiary.ComponentTests --no-restore`
Expected: `Passed!` — all component tests pass (Testcontainers spins up `postgres`, Mountebank stubs OpenAI), 0 failed.

- [ ] **Step 8: Confirm no pending EF model changes**

Ensure the EF tool is available, then run the CI check (the EF Core version bump must not have drifted the model):

```bash
cd src/backend
dotnet tool install --global dotnet-ef --version "10.*" 2>/dev/null || dotnet tool update --global dotnet-ef --version "10.*"
dotnet ef migrations has-pending-model-changes -s src/FoodDiary.API -p src/FoodDiary.Infrastructure
```

Expected: `No changes have been made to the model since the last migration.` (exit code 0).

> If it reports pending changes, EF Core 10 changed a default convention for this model. Do not hand-edit snapshots — investigate the specific difference (superpowers:systematic-debugging) and surface it to the maintainer before proceeding; a new migration may be warranted. The spec expects this check to pass clean. The historical `"ProductVersion", "8.0.0"` strings in `Migrations/*.Designer.cs` are EF-generated history and are **not** a model change — leave them.

- [ ] **Step 9: Commit**

```bash
git add src/backend/Directory.Packages.props
git commit -m "Bump backend packages to latest net10-compatible versions"
```

---

## Task 3: Migrate the solution file to `.slnx`

**Files:**
- Create: `src/backend/FoodDiary.slnx`
- Delete: `src/backend/FoodDiary.sln`
- Modify: `.vscode/tasks.json:10`, `.vscode/tasks.json:22`, `.vscode/tasks.json:36`

**Interfaces:**
- Consumes: the built solution from Task 2.
- Produces: `FoodDiary.slnx` as the single solution file. `dotnet` CLI auto-resolves it (no explicit path in CI); editor tasks reference it by name.

- [ ] **Step 1: Generate `FoodDiary.slnx` from the existing `.sln`**

Run: `cd src/backend && dotnet sln FoodDiary.sln migrate`
Expected: `.slnx file ... FoodDiary.slnx generated.` — a new `src/backend/FoodDiary.slnx` exists alongside the old `.sln`.

- [ ] **Step 2: Delete the old `.sln` (git-tracked)**

Run: `git rm src/backend/FoodDiary.sln`
Expected: `rm 'src/backend/FoodDiary.sln'`. (The gitignored `FoodDiary.sln.DotSettings.user` stays on disk — leave it.)

- [ ] **Step 3: Point the VS Code tasks at `FoodDiary.slnx`**

In `.vscode/tasks.json`, replace all three occurrences of the solution path. Change each:

`"${workspaceFolder}/src/backend/FoodDiary.sln"` → `"${workspaceFolder}/src/backend/FoodDiary.slnx"`

They appear in the `build` task (line 10), the `publish` task (line 22), and the `watch` task (line 36).

- [ ] **Step 4: Verify the CLI auto-resolves the single `.slnx` and builds**

```bash
cd src/backend
ls FoodDiary.sln FoodDiary.slnx 2>&1   # FoodDiary.sln must be gone; FoodDiary.slnx present
dotnet build --configuration Release
```

Expected: `ls` reports `FoodDiary.sln: No such file or directory` and lists `FoodDiary.slnx`; the build (with no solution path passed, exactly as CI runs it) is `Build succeeded.`, `0 Warning(s)`, `0 Error(s)`.

- [ ] **Step 5: Commit**

```bash
git add src/backend/FoodDiary.slnx .vscode/tasks.json
git commit -m "Migrate backend solution to .slnx format"
```

---

## Task 4: Update Docker, CI, editor config, and docs

**Files:**
- Modify: `Dockerfile:1`, `Dockerfile:13`
- Modify: `.github/workflows/build.yml:30`, `:37`, `:106`
- Modify: `.github/workflows/deploy.yml:19`
- Modify: `.vscode/launch.json:13`
- Modify: `CLAUDE.md:12`
- Modify: `README.md:89`

**Interfaces:**
- Consumes: the net10 solution and `.slnx` from Tasks 1–3.
- Produces: Docker images, CI, debugger, and docs all referencing .NET 10 / `FoodDiary.slnx`.

- [ ] **Step 1: Bump the Docker base images**

In `Dockerfile`:
- Line 1: `FROM mcr.microsoft.com/dotnet/sdk:8.0 AS backend` → `FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend`
- Line 13: `FROM mcr.microsoft.com/dotnet/aspnet:8.0` → `FROM mcr.microsoft.com/dotnet/aspnet:10.0`

- [ ] **Step 2: Bump the CI SDK pins and `dotnet-ef` version in `build.yml`**

In `.github/workflows/build.yml`:
- Line 30: `dotnet-version: 8.0.405` → `dotnet-version: 10.0.302`
- Line 37: `dotnet tool install --global dotnet-ef --version "8.*"` → `dotnet tool install --global dotnet-ef --version "10.*"`
- Line 106: `dotnet-version: 8.0.405` → `dotnet-version: 10.0.302`

- [ ] **Step 3: Bump the deploy-workflow SDK pin**

In `.github/workflows/deploy.yml`:
- Line 19: `dotnet-version: 8.0.405` → `dotnet-version: 10.0.302`

- [ ] **Step 4: Fix the debugger program path**

In `.vscode/launch.json` line 13:
`"${workspaceFolder}/src/backend/src/FoodDiary.API/bin/Debug/net8.0/FoodDiary.API.dll"` → `.../bin/Debug/net10.0/FoodDiary.API.dll`

- [ ] **Step 5: Update `CLAUDE.md`**

Line 12: `- \`src/backend/\` — .NET 8 solution (\`FoodDiary.sln\`). Clean-architecture-ish projects.`
→ `- \`src/backend/\` — .NET 10 solution (\`FoodDiary.slnx\`). Clean-architecture-ish projects.`

- [ ] **Step 6: Update `README.md`**

Line 89: `- [.NET SDK](https://dotnet.microsoft.com/en-us/download) (8.0.0 or higher)`
→ `- [.NET SDK](https://dotnet.microsoft.com/en-us/download) (10.0.0 or higher)`

- [ ] **Step 7: Sweep for stray references**

Run (should print nothing — historical EF snapshots and `docs/superpowers/**` are intentionally excluded):

```bash
cd /Users/pkirilin/storage/repo/personal/food-diary
rg -n --hidden -g '!**/node_modules/**' -g '!**/bin/**' -g '!**/obj/**' \
   -g '!docs/superpowers/**' -g '!.superpowers/**' -g '!**/*.user' \
   -g '!src/backend/src/FoodDiary.Infrastructure/Migrations/**' \
   'net8\.0|dotnet/(sdk|aspnet):8\.0|8\.0\.405|FoodDiary\.sln\b|dotnet-ef.*"8\.\*"'
```

Expected: no output.

- [ ] **Step 8: Validate the workflow YAML and JSON parse**

```bash
cd /Users/pkirilin/storage/repo/personal/food-diary
python3 -c "import json;[json.load(open(f)) for f in ['.vscode/launch.json','.vscode/tasks.json']];print('json ok')"
python3 -c "import sys;sys.exit(0)"  # yaml lint is optional; workflows are validated by GitHub on push
```

Expected: `json ok`.

- [ ] **Step 9: Commit**

```bash
git add Dockerfile .github/workflows/build.yml .github/workflows/deploy.yml \
        .vscode/launch.json CLAUDE.md README.md
git commit -m "Point Docker, CI, debugger, and docs at .NET 10"
```

---

## Task 5: Full verification (acceptance gate)

Runs the spec's complete Verification checklist end-to-end on the finished migration. No source edits — this is the final green gate before the branch is done. If Docker was skipped earlier, this task's Docker steps carry the same gate.

**Files:** none (verification only).

**Interfaces:**
- Consumes: the fully migrated branch from Tasks 1–4.
- Produces: evidence that the migration is complete and correct.

- [ ] **Step 1: Docker gate**

Run: `docker info`
- If it fails: **STOP** and ask the user (as in Task 2 Step 6). Steps 4 and 6 below need Docker.
- If it succeeds: continue.

- [ ] **Step 2: Clean Release build**

Run: `cd src/backend && dotnet build --configuration Release`
Expected: `Build succeeded.`, `0 Warning(s)`, `0 Error(s)`.

- [ ] **Step 3: Unit tests**

Run: `cd src/backend && dotnet test tests/FoodDiary.UnitTests`
Expected: `Passed!`, 0 failed.

- [ ] **Step 4: Component tests (Docker)**

Run: `cd src/backend && dotnet test tests/FoodDiary.ComponentTests`
Expected: `Passed!`, 0 failed.

- [ ] **Step 5: No pending EF model changes**

Run: `cd src/backend && dotnet ef migrations has-pending-model-changes -s src/FoodDiary.API -p src/FoodDiary.Infrastructure`
Expected: `No changes have been made to the model since the last migration.`

- [ ] **Step 6: Docker image builds (Docker)**

Run: `cd /Users/pkirilin/storage/repo/personal/food-diary && docker build -t food-diary:net10-check .`
Expected: build completes successfully — the `sdk:10.0` / `aspnet:10.0` base images pull and the app publishes. (Full Playwright E2E runs in CI, not locally.)

- [ ] **Step 7: Confirm a clean tree**

Run: `git status`
Expected: nothing to commit, working tree clean (all changes committed across Tasks 1–4).

---

## Self-Review

**Spec coverage** — every spec section maps to a task:

| Spec section | Covered by |
|---|---|
| §1 Target framework & language (`Directory.Build.props`, `global.json`) | Task 1 |
| §2 Package bumps (`Directory.Packages.props`) — framework-aligned, independently-versioned, unchanged, held, trio | Task 2 (with resolved versions; trio & held kept per Global Constraints) |
| §2 Compatibility verification (Swashbuckle, Testcontainers held) | Held at current versions in Task 2 (`6.5.0`, `3.6.0`) |
| §3 Solution format → `.slnx` (migrate, `git rm`, tasks.json, CI auto-resolve) | Task 3 |
| §4 Docs/CI/editor (Dockerfile, build.yml, deploy.yml, launch.json, CLAUDE.md, README.md) | Task 4 |
| Verification (build, unit, component, ef check, docker build) | Tasks 2, 4, and consolidated in Task 5 |
| Risks (`TreatWarningsAsErrors`, `NU19xx`) | Global Constraints + Task 1 Step 4, Task 2 Steps 3–4 |
| Out of scope (frontend, trio, Swashbuckle/Testcontainers bumps, xunit v3, AutoFixture v5) | Excluded — Global Constraints + Task 2 held/unchanged lists |

**Placeholder scan:** package versions are concrete resolved values (not "10.0.x"); `NU19xx` handling names the exact pin-around mechanism; build/test steps have exact commands and expected output. The one genuinely unknowable element — which specific analyzer/obsolete warnings the net10 SDK / new package majors surface — is handled as a gate ("resolve until 0 warnings" via systematic-debugging), not a fake implementation, because the warnings cannot be enumerated before running the build.

**Version consistency:** `10.0.302` (SDK) is identical in `global.json`, both workflows, and the `dotnet --version` check. Framework-aligned packages are uniformly `10.0.10`; `FoodDiary.slnx` / `FoodDiary.sln` names are used consistently across Tasks 3–4 and the sweep. The trio (`6.12.2`, `10.0.1`, `8.1.1`) and held packages (`6.5.0`, `3.6.0`) match the Global Constraints in Task 2's file.
