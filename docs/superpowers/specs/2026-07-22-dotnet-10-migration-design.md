# Migrate backend to .NET 10 — Design

**Date:** 2026-07-22
**Status:** Approved — not yet implemented. Target branch: `migrate-to-dotnet-10`.
**Source:** Obsidian vault note `Projects/Food Diary/Todos/Migrate to dotnet 10.md`.

## Goal

Move the backend solution from **.NET 8** to **.NET 10** (LTS). The migration
covers four things, per the source note:

1. Target-framework bump across **all** places (code, docs, rules, env,
   workflows, Docker).
2. Package versions bumped to the latest available versions compatible with
   .NET 10.
3. C# language version bumped to the latest available (C# 14).
4. Solution file migrated from `.sln` to the new `.slnx` format.

Backend only. The frontend and E2E JavaScript toolchains (already on Node 24)
are untouched.

## Background

The backend targets `net8.0` with `LangVersion` 12, pinned via SDK 8.0.x. The
local dev toolchain already has SDK **10.0.201** and the ASP.NET Core 10.0.5
runtime installed, so the whole migration (build, unit + component tests, and
the Docker image) can be verified locally on .NET 10.

Shared MSBuild settings live in `src/backend/Directory.Build.props` and package
versions in `src/backend/Directory.Packages.props` (central package
management), so the framework and language bumps are two lines and every package
version lives in one file.

### Licensing decision (the one judgment call)

Three heavily-used packages relicensed to **commercial** in their latest majors,
and the old DI-extension packages this repo uses are deprecated in newer majors:

| Package | Current | Last permissive (OSS) | Absolute latest |
|---|---|---|---|
| FluentAssertions | 6.12.2 | 7.x (Apache-2.0) | 8.10.0 (commercial) |
| MediatR | 10.0.1 | 12.5.0 (Apache-2.0) | 14.2.0 (commercial) |
| AutoMapper | 8.1.1 (DI-ext) | 14.x core (MIT) | 16.2.0 (commercial) |

**Decision (maintainer): skip the trio.** They stay at their current versions —
they build and run on `net10.0` unchanged. This avoids commercial licenses and
avoids the MediatR/AutoMapper DI-registration code changes that any modern major
would force (the old `*.Extensions.Microsoft.DependencyInjection` packages are
deprecated/removed upstream). Consistent with the project's "minimal, exact-fit"
strategy and the lowest-risk option.

## Scope of changes

### 1. Target framework & language — `Directory.Build.props`, `global.json`

| File | From | To |
|------|------|-----|
| `src/backend/Directory.Build.props` | `<TargetFramework>net8.0</TargetFramework>` | `net10.0` |
| `src/backend/Directory.Build.props` | `<LangVersion>12</LangVersion>` | `14` |
| `src/backend/global.json` | `"version": "8.0.0"` | `"10.0.100"` (keep `rollForward: latestFeature`, `allowPrerelease: false`) |

No individual `.csproj` sets `TargetFramework`; all 11 projects inherit from
`Directory.Build.props`.

### 2. Package bumps — `Directory.Packages.props`

Bump every **permissively-licensed** package to its latest stable version. Exact
patch numbers are resolved against nuget.org at implementation time (the targets
below reflect the latest stable as of 2026-07-22 and may tick up).

**Framework-aligned → 10.0.x (latest 10.0 patch):**

- `Microsoft.EntityFrameworkCore` (8.0.11 → 10.0.x)
- `Microsoft.EntityFrameworkCore.Design` (8.0.11 → 10.0.x)
- `Npgsql.EntityFrameworkCore.PostgreSQL` (8.0.11 → 10.0.x)
- `Microsoft.AspNetCore.Authentication.Google` (8.0.12 → 10.0.x)
- `Microsoft.AspNetCore.DataProtection.EntityFrameworkCore` (8.0.11 → 10.0.x)
- `Microsoft.AspNetCore.Mvc.Testing` (8.0.12 → 10.0.x)
- `Microsoft.AspNetCore.SpaServices.Extensions` (8.0.12 → 10.0.x)
- `Microsoft.Extensions.Configuration` + `.Abstractions` + `.EnvironmentVariables`
  + `.FileExtensions` + `.Json` + `.UserSecrets` (8.0.x → 10.0.x)
- `Microsoft.Extensions.DependencyInjection` + `.Abstractions` (9.0.3 → 10.0.x)
- `Microsoft.Extensions.Hosting.Abstractions` (8.0.1 → 10.0.x)
- `Microsoft.Extensions.Http` (8.0.1 → 10.0.x)
- `Microsoft.Extensions.Logging` + `.Console` (8.0.1 → 10.0.x)
- `Microsoft.Extensions.Options.ConfigurationExtensions` (8.0.0 → 10.0.x)
- `System.Text.Json` (9.0.3 → 10.0.x)
- `Serilog.AspNetCore` (8.0.3 → 10.0.x)

**Independently versioned → latest stable:**

- `Microsoft.Extensions.AI` + `.Abstractions` (9.7.1 → 10.8.1)
- `Microsoft.Extensions.AI.OpenAI` (9.7.1-preview → 10.8.1 — **drops the preview**)
- `Swashbuckle.AspNetCore` (6.5.0 → 10.2.x)
- `Testcontainers` + `Testcontainers.PostgreSql` (3.6.0 → 4.13.x)
- `xunit` (2.6.6 → 2.9.x — stays on v2)
- `xunit.runner.visualstudio` (2.5.8 → latest compatible)
- `Microsoft.NET.Test.Sdk` (17.8.0 → 18.8.x)
- `LightBDD.XUnit2` (3.7.0 → 3.12.x)
- `Polly.Core` (8.5.2 → 8.7.x)
- `JetBrains.Annotations` (2023.3.0 → latest)
- `coverlet.collector` (6.0.4 → latest 6.x)

**Unchanged — already latest / no newer release exists:**

- `AutoFixture` + `AutoFixture.Xunit2` (4.18.1 — v5 is preview-only, out of scope)
- `MbDotNet` (5.0.0)
- `Moq` (4.20.72)
- `System.ComponentModel.Annotations` (5.0.0)
- `Microsoft.AspNetCore.Authentication.Abstractions` (2.2.0 — final standalone
  version; superseded by the shared framework, no newer package)

**Held per the licensing decision (the trio):**

- `FluentAssertions` (6.12.2)
- `MediatR` + `MediatR.Extensions.Microsoft.DependencyInjection` (10.0.1)
- `AutoMapper.Extensions.Microsoft.DependencyInjection` (8.1.1)

MediatR and AutoMapper registration code (`AddMediatR(Assembly...)` in
`FoodDiary.Application/Extensions/ServiceCollectionExtensions.cs`,
`AddAutoMapper(Assembly...)` in `FoodDiary.API/Startup.cs`) is **unchanged**.

### 3. Solution format → `.slnx`

- Run `dotnet sln migrate` in `src/backend` to generate `FoodDiary.slnx` from
  `FoodDiary.sln`.
- `git rm src/backend/FoodDiary.sln` (only the `.sln` is git-tracked; the
  `FoodDiary.sln.DotSettings.user` Rider file is gitignored — left alone).
- Update the 3 `FoodDiary.sln` path references in `.vscode/tasks.json` →
  `FoodDiary.slnx`.
- CI needs no path change: `dotnet restore` / `dotnet build` run with
  `working-directory: src/backend` and no explicit solution path, so the CLI
  auto-resolves `FoodDiary.slnx`. The Dockerfile builds per-project (`.csproj`),
  not via the solution.

### 4. Docs, CI, editor config

| File | Change |
|------|--------|
| `Dockerfile` | `dotnet/sdk:8.0` → `sdk:10.0`; `dotnet/aspnet:8.0` → `aspnet:10.0` |
| `.github/workflows/build.yml` | 2× `dotnet-version: 8.0.405` → `'10.0'`; `dotnet-ef --version "8.*"` → `"10.*"` |
| `.github/workflows/deploy.yml` | 1× `dotnet-version: 8.0.405` → `'10.0'` |
| `.vscode/launch.json` | program path `bin/Debug/net8.0/` → `bin/Debug/net10.0/` |
| `CLAUDE.md` | ".NET 8 solution (`FoodDiary.sln`)" → ".NET 10 solution (`FoodDiary.slnx`)" |
| `README.md` | ".NET SDK … (8.0.0 or higher)" → "(10.0.0 or higher)" |

`.claude/rules/backend.md` needs **no change** — its build-configuration
guidance is version-agnostic and stays accurate.

Historical `docs/superpowers/**` specs/plans and `.superpowers/sdd/**` reports
are **not** rewritten — they record past state.

## Version-pinning decisions

- **Workflow SDK pin:** loose `'10.0'` (setup-dotnet resolves the latest 10.0.x),
  matching the low-maintenance pinning adopted in the Node-24 migration, rather
  than an exact patch.
- **`global.json`:** floor `10.0.100` with `rollForward: latestFeature` — mirrors
  the existing `8.0.0` + `latestFeature` pattern.
- **`LangVersion`:** explicit `14` (matching the current explicit `12`), rather
  than removing it and relying on the net10 default.

## Verification

Run locally on SDK 10.0.201 from `src/backend`:

- `dotnet build --configuration Release` — must be **0 warnings, 0 errors**
  (`TreatWarningsAsErrors` is on).
- `dotnet test tests/FoodDiary.UnitTests` — unit suite passes.
- `dotnet test tests/FoodDiary.ComponentTests` — component suite passes
  (Testcontainers spins up PostgreSQL; Mountebank stubs OpenAI).
- `dotnet ef migrations has-pending-model-changes -s src/FoodDiary.API -p src/FoodDiary.Infrastructure`
  — no pending model changes (mirrors the CI check).
- `docker build -t food-diary:net10-check .` from repo root — confirms the
  `sdk:10.0` / `aspnet:10.0` base images pull and the app publishes.

Full Playwright E2E runs in CI (needs the full stack up); not run locally.

## Risks & watch items

- **`TreatWarningsAsErrors` (primary risk).** Any new analyzer, obsolete-API, or
  nullable warning surfaced by the net10 SDK or C# 14 fails the build. The real
  work is resolving those, not the version edits. Only `NU1701` is exempted.
- **`NU19xx` security advisories are build-breaking.** If a bumped package pulls
  a flagged transitive dependency, pin around it (add an explicit
  `PackageVersion` for the transitive at a safe version). Documented in
  `.claude/rules/backend.md`.
- **Swashbuckle 6 → 10.** Large jump across `Microsoft.OpenApi` v2. Watch for
  `AddSwaggerGen` / `UseSwagger` / `UseSwaggerUI` API or generated-schema
  behavior changes; verified by build + component tests hitting Swagger.
- **Testcontainers 3 → 4.** Major bump; watch the container-builder API surface
  used in `FoodDiary.ComponentTests`.

## Out of scope

- Frontend / Node toolchain (already on Node 24).
- The trio bumps (FluentAssertions, MediatR, AutoMapper) — held per the
  licensing decision above.
- xunit v3 (separate package `xunit.v3`; a distinct migration).
- AutoFixture v5 (preview-only).
- Any behavioral/feature change — this is a framework + dependency migration only.
