# Testcontainers for .NET v4 migration research

Research date: **2026-09-17**. Version claims verified against the NuGet flat-container API and the
GitHub releases of `testcontainers/testcontainers-dotnet` on that date. Where release notes were
vague, the claim was checked against the **source at the release tags** (shallow clones of `3.10.0`
and `4.15.0`) and against the **published `.nuspec`** files on nuget.org. No code in this repo was
changed, and nothing was built. Docker was not running on the research machine, so none of this
was checked by running the tests (see §6).

---

## 1. Bottom line

1. **Target: `4.15.0`** (released 2026-09-07, marked "Latest" on GitHub). It is the newest version
   on nuget.org for both `Testcontainers` and `Testcontainers.PostgreSql`. No 5.x or prerelease
   exists beyond it. There are 17 releases between 3.10.0 and 4.15.0: `4.0.0` … `4.8.1` … `4.15.0`.

2. **🔑 The only change that breaks this repo is a deprecation, and the repo's own build settings
   turn it into an error.** Starting with **4.10.0**, the parameterless constructors
   `new ContainerBuilder()` and `new PostgreSqlBuilder()` are `[Obsolete]`. They still exist and
   still work. But `src/backend/Directory.Build.props:7` sets `TreatWarningsAsErrors=true`, and
   `:8` exempts only `NU1701;NU190x`. **CS0618 is not exempt**, so both call sites fail the build:
   - `tests/FoodDiary.ComponentTests/Infrastructure/DataAccess/DatabaseFixture.cs:11-12`
   - `tests/FoodDiary.ComponentTests/Infrastructure/ExternalServices/ExternalServicesFixture.cs:11-12`

   The fix is two lines: move the image string from `.WithImage(...)` into the constructor.
   Both call sites already pin an explicit tag, so no image or behaviour changes.

3. **Nothing else in the release notes touches an API this repo calls.** The repo uses only
   `ContainerBuilder`, `WithImage`, `WithPortBinding(int, int)`, `Build`, `StartAsync`,
   `StopAsync`, `PostgreSqlBuilder.WithUsername/WithPassword/WithDatabase`, and
   `PostgreSqlContainer.GetConnectionString()`. No custom wait strategies, resource mappings, reuse,
   networks, image builds, or `IImage` usage. All of these are unchanged at `4.15.0`.

4. **The runtime changes are real but low-risk for this repo:** the wait strategy now defaults to
   `Running` mode (4.8.0), the Docker client moved to a fork (`Docker.DotNet.Enhanced`), the Docker
   Engine API is pinned to `1.44` by default (4.9.0), Ryuk is newer and runs privileged by default
   (4.1.0), and port bindings are no longer IPv4-only (4.2.0). See §3.

5. **No dependency conflicts with `Directory.Packages.props`.** 4.15.0 ships a `net10.0` asset and
   needs `Microsoft.Extensions.Logging.Abstractions >= 8.0.3`, which the repo's `10.0.10` stack
   already exceeds. `Testcontainers.Xunit` is optional and not needed (§4.3).

6. **Sizing: one small PR.** Change 2 package versions and 2 constructor calls, then run the
   component tests with Docker running.

---

## 2. Version reality check

| Fact | Value | Source |
|---|---|---|
| Latest `Testcontainers` | **4.15.0** | `https://api.nuget.org/v3-flatcontainer/testcontainers/index.json` (last entry) |
| Latest `Testcontainers.PostgreSql` | **4.15.0** | `https://api.nuget.org/v3-flatcontainer/testcontainers.postgresql/index.json` |
| 4.15.0 release date | 2026-09-07 | `gh release list -R testcontainers/testcontainers-dotnet` |
| 4.0.0 release date | 2024-11-01 | same |
| Current repo pin | `3.10.0` (2024-09-03) | `src/backend/Directory.Packages.props:43-44` |
| TFMs at 4.15.0 | `net8.0;net9.0;net10.0;netstandard2.0;netstandard2.1` | `src/Testcontainers/Testcontainers.csproj` @ tag `4.15.0`; nuspec has a `net10.0` group |
| TFMs at 3.10.0 | `net6.0;net8.0;netstandard2.0;netstandard2.1` | same file @ tag `3.10.0` |
| `net6.0` dropped / `net9.0` added | 4.1.0 (#1311) | release `4.1.0` |
| `net10.0` added | 4.9.0 (#1572) | release `4.9.0` |
| Migration guide on dotnet.testcontainers.org | **none exists**. The `docs/` tree at `4.15.0` has no migration page; the only guidance is the discussion comment cited in §3.1 | `rg -il migrat docs` @ `4.15.0` |

Repo's test project setup, for reference: `net10.0` (`src/backend/Directory.Build.props:3`), xUnit
`2.9.3` + `LightBDD.XUnit2`, one `ICollectionFixture<InfrastructureFixture>`
(`tests/FoodDiary.ComponentTests/BaseTest.cs:7-8`). Its `IAsyncLifetime.InitializeAsync/DisposeAsync`
(`Infrastructure/InfrastructureFixture.cs:42-50`) call `DatabaseFixture.Start/Stop` and
`ExternalServicesFixture.Start/Stop`, which wrap `StartAsync`/`StopAsync`. The containers are never
disposed with `DisposeAsync`. Ryuk cleans them up.

---

## 3. Breaking changes that affect this repo

### 3.1 Parameterless builder constructors are obsolete → CS0618 → build error ⚠️ (must fix)

**What changed.** 4.10.0 "feat: Require explicit container image when creating container builder
(#1584)". At tag `4.15.0`:

- `src/Testcontainers/Builders/ContainerBuilder.cs:39-41`:
  `[Obsolete("This parameterless constructor is obsolete and will be removed. Use the constructor with the image parameter instead: …")] public ContainerBuilder()`.
  New overloads are `ContainerBuilder(string image)` (`:54`) and `ContainerBuilder(IImage image)` (`:64`).
- `src/Testcontainers.PostgreSql/PostgreSqlBuilder.cs:31-33`: the same `[Obsolete]` on
  `public PostgreSqlBuilder()`, with `PostgreSqlBuilder(string image)` at `:48`. The constant
  `PostgreSqlImage` (`:7-8`) is also `[Obsolete]`. The repo doesn't reference it.
- At `3.10.0`, the default image was set in `PostgreSqlBuilder.Init()` via `.WithImage(PostgreSqlImage)`.
  At `4.15.0`, `Init()` no longer sets an image. The image comes only from the constructor or
  `WithImage`, and `ContainerBuilder<,,>.Validate()` guards `Image` as `NotNull`
  (`src/Testcontainers/Builders/ContainerBuilder`3.cs:503-504`).
- The maintainer's migration note ("Starting with release `4.10.0`, the parameterless container
  builder constructors will be obsolete…"):
  https://github.com/testcontainers/testcontainers-dotnet/discussions/1470#discussioncomment-15185721
- The 4.10.0 release notes ask users to pin the image version explicitly.

**Why it breaks here.** Chaining `.WithImage(...)` after the obsolete constructor would still run.
But the obsolete call triggers CS0618, and `Directory.Build.props:7-8` turns it into an error
because CS0618 is not in `WarningsNotAsErrors`.

**Call sites and the change:**

| File:line | Now | Change to |
|---|---|---|
| `src/backend/tests/FoodDiary.ComponentTests/Infrastructure/DataAccess/DatabaseFixture.cs:11-12` | `new PostgreSqlBuilder()` `.WithImage("postgres:15.1-alpine")` | `new PostgreSqlBuilder("postgres:15.1-alpine")` (delete the `WithImage` line) |
| `src/backend/tests/FoodDiary.ComponentTests/Infrastructure/ExternalServices/ExternalServicesFixture.cs:11-12` | `new ContainerBuilder()` `.WithImage("bbyars/mountebank:2.9.1")` | `new ContainerBuilder("bbyars/mountebank:2.9.1")` (delete the `WithImage` line) |

Both images are already pinned, so the behaviour is identical. Don't suppress CS0618. The
parameterless constructors are marked "will be removed".

### 3.2 Both packages must move together (binary compatibility)

4.7.0 notes: "isn't binary compatible due to necessary internal changes. Make sure to update all
related packages (Testcontainers modules) to the same version." The 4.15.0 nuspec for
`Testcontainers.PostgreSql` depends on `Testcontainers` `4.15.0` exactly. **Change:** bump
`src/backend/Directory.Packages.props:43` and `:44` together to `4.15.0`.

### 3.3 Behaviour changes that apply at runtime (no code change expected)

These change runtime behaviour on the repo's code paths. None needs a code change, but they're the
first suspects if the component tests fail after the bump.

| Change | Release / source | Effect on this repo |
|---|---|---|
| Wait strategies default to **`Running` mode**: if the container exits during startup, `ContainerNotRunningException` is thrown with the exit code and logs | 4.8.0 (#1550); https://dotnet.testcontainers.org/api/wait_strategies/ ("Wait strategy modes") | Both containers are long-running (Postgres, Mountebank). This is stricter but correct, and a crash now fails fast with logs instead of timing out. |
| Postgres readiness is still `pg_isready --host localhost --dbname <db> --username <user>`, and Init still sets `fsync=off`, `full_page_writes=off`, `synchronous_commit=off` | `PostgreSqlBuilder.cs` `Init()`/`WaitUntil` @ `3.10.0` vs `4.15.0` (identical apart from the image line and a new `WithConnectionStringProvider`) | No change. `GetConnectionString()` builds the same `Host;Port;Database;Username;Password` string (`PostgreSqlContainer.cs:23-32` @ `4.15.0`). |
| Docker client replaced by the Testcontainers fork `Docker.DotNet.Enhanced` (3.125.15 → **4.3.3**) | 4.1.0 notes + #1292; `Directory.Packages.props` @ `4.15.0` lines 8-9; nuspec | The repo doesn't reference `Docker.DotNet` directly (`rg Docker.DotNet src/backend` → none), so there's no conflict. |
| Docker Engine API **pinned to `1.44`** by default; override with `DOCKER_API_VERSION` env or `docker.api.version` property | 4.9.0 (#1576); 4.10.0 (#1609, Docker Engine v29 support); `src/Testcontainers/Configurations/AuthConfigs/DockerEndpointAuthenticationConfiguration.cs:16` @ `4.15.0` (`?? new Version(1, 44)`) | Works with Docker Engine ≥ 25 (API 1.44). 3.10.0 calls `CreateClient()` with no version (`src/Testcontainers/Clients/DockerApiClient.cs:140` @ `3.10.0`). See §6 for Docker v29 risk. |
| Ryuk (resource reaper) image `0.6.0` → `0.14.0` (digest-pinned); **privileged by default** | `ResourceReaper.cs:36` @ `3.10.0` vs `:41` @ `4.15.0`; 4.1.0 (#1313); `TestcontainersSettings.cs:71` @ `4.15.0` (`?? true`) | Fine on Docker Desktop and GitHub-hosted `ubuntu-22.04` runners. Could matter only on rootless/Podman hosts, where `TESTCONTAINERS_RYUK_CONTAINER_PRIVILEGED=false` is the override. |
| Port bindings no longer forced to IPv4 (`HostIP = 0.0.0.0` removed) | 4.2.0 (#1363); diff in `src/Testcontainers/Clients/ContainerConfigurationConverter.cs` | `ExternalServicesFixture.cs:13-15` binds fixed host ports 2525/4545/4646 and talks to `http://localhost:2525` (`:18-19`). Docker now publishes on both IPv4 and IPv6. This should be neutral or better for `localhost`, but the fixed ports need to be free on both stacks. |
| Throws when a Docker resource doesn't exist instead of silently ignoring it | 4.0.0 (#1254) | `StopAsync` still returns early if the container was never created (`DockerContainer.cs:671-674` @ `4.15.0`), so `InfrastructureFixture.DisposeAsync` after a failed start stays safe. |
| Output stream is detached before stop/remove | 4.15.0 (#1755) | Bug fix; the repo attaches no output consumers. |
| Transient image pull failures are retried | 4.15.0 (#1734) | Helps CI. |
| `UntilMessageIsLogged` reads logs since `CreatedTime` | 4.4.0 (#1384) | Not used here. |

---

## 4. Breaking changes that don't apply (checked)

### 4.1 Release-note "⚠️ Breaking Changes" entries, 4.0.0 → 4.15.0

| Release | Breaking entry | Why N/A |
|---|---|---|
| 4.0.0 | `IImage` properties aligned with Docker DSL (`Repository`/`Registry`/`Name` changed meaning); obsolete `DockerImage` overloads removed in 4.1.0 | Repo never uses `IImage`/`DockerImage` directly (`rg IImage\|DockerImage src/backend` → none). |
| 4.0.0 | MSSQL image bump; Azure SQL Edge module removed | Not used. |
| 4.7.0 | Kafka KRaft; "override enumerable builder values" (#1506) | Not used. The repo calls `WithPortBinding` three times with different ports, which is additive and not an override. |
| 4.8.0 | Reuse hash changed (#1554) | Reuse not used. |
| 4.8.0 | Startup callback overload adds a config generic parameter to `IContainerBuilder<,>` → `<,,>` (#1547) | Only matters for custom builder implementations; the repo has none. |
| 4.8.0 | `WithResourceMapping`/`CopyAsync` gain `uid`/`gid` optional params (#1531) | Not used. |
| 4.8.0 | `UntilPortIsAvailable(int)` removed (#1528). Replacements are `UntilInternalTcpPortIsAvailable` / `UntilExternalTcpPortIsAvailable` (`IWaitForContainerOS.cs:69,90` @ `4.15.0`) | Repo defines no wait strategies (`rg Wait\. src/backend/tests` → none). |
| 4.9.0 | KurrentDb module added (listed as breaking) | Not used. |
| 4.10.0 | Docker Engine v29 support; EventStoreDb module removed | EventStoreDb not used; Docker API: see §3.3. |
| 4.10.0 | Explicit image required | **Applies:** §3.1. |
| 4.11.0 | CosmosDb image → `vnext-preview` | Not used. |
| 4.12.0 | Section present but empty | — |
| 4.1.0–4.6.0, 4.8.1, 4.13.0–4.15.0 | No breaking section | — |

### 4.2 Other `[Obsolete]` APIs in 4.15.0 core + PostgreSql

`rg 'Obsolete\(' src/Testcontainers src/Testcontainers.PostgreSql` @ `4.15.0` also lists
`SocatBuilder()` / `SocatImage`, five `WithResourceMapping(...)` overloads
(`IContainerBuilder`2.cs:263,316,329,378,465`), and `TestcontainersSettings.ResourceReaperPublicHostPort`.
**None is referenced by the repo.**

### 4.3 Dependencies vs `src/backend/Directory.Packages.props`

| Dependency (4.15.0 nuspec, `net10.0` group) | Repo | Verdict |
|---|---|---|
| `Microsoft.Extensions.Logging.Abstractions >= 8.0.3` | `Microsoft.Extensions.Logging` `10.0.10` (brings Abstractions 10.x) | Satisfied |
| `Docker.DotNet.Enhanced` / `.X509` `4.3.3` | not referenced | No conflict |
| `SSH.NET` `2026.0.0` (bumped in 4.14.0 for an SSH.NET vulnerability) | not referenced | No conflict. 3.10.0 pulled `SSH.NET 2023.0.0` (`Directory.Packages.props` @ `3.10.0`), so upgrading also clears that transitive advisory. |
| `SharpZipLib` `1.4.2` | not referenced | Same as 3.10.0 |
| `Testcontainers.Xunit` (new in 4.1.0, #1165) | not referenced | **Optional.** Its 4.15.0 nuspec depends on `xunit.extensibility.execution 2.9.3`, which matches the repo's `xunit 2.9.3`. `Testcontainers.XunitV3` is for xUnit v3. Adopting either would mean replacing `InfrastructureFixture` with `ContainerFixture`/`DbContainerFixture`. That's out of scope for a version bump, and it would interact with the LightBDD collection setup. Not recommended as part of this migration. |

CPM transitive pinning isn't enabled in the repo, so new transitive packages don't need
`PackageVersion` entries.

---

## 5. Recommended migration steps

1. `src/backend/Directory.Packages.props:43-44`: `Testcontainers` and `Testcontainers.PostgreSql`
   → `4.15.0`, both in the same commit (§3.2).
2. `DatabaseFixture.cs:11-12`: `new PostgreSqlBuilder("postgres:15.1-alpine")`, and remove `.WithImage(...)`.
3. `ExternalServicesFixture.cs:11-12`: `new ContainerBuilder("bbyars/mountebank:2.9.1")`, and remove `.WithImage(...)`.
4. `dotnet build` in `src/backend`. Expect 0 CS0618. Any remaining CS0618 points to a Testcontainers
   usage this research missed.
5. **With Docker running** (CLAUDE.md: if Docker is unavailable, stop and ask), run
   `dotnet test tests/FoodDiary.ComponentTests` locally, then let CI run it on `ubuntu-22.04`
   (`.github/workflows/build.yml:37`).
6. Optional, separate change: bump the `postgres:15.1-alpine` image. It's unrelated to Testcontainers
   and shouldn't be bundled with this bump.

No README/CLAUDE.md update is required: no env vars, runtime, or SDK majors change.

---

## 6. Open questions / risks

1. **Not run.** Docker wasn't available on the research machine
   (`docker version` → cannot connect to `unix:///Users/pkirilin/.docker/run/docker.sock`), so the
   claim "compiles and passes after steps 1-3" is **unverified** by execution. It's inferred from
   source at `4.15.0`.
2. **Is 3.10.0 already broken on Docker Engine v29?** *Unverified.* The 4.9.0 notes say Engine v29
   "introduced breaking changes that affect Docker.DotNet and Testcontainers for .NET". 3.10.0
   creates its client without a pinned API version. I couldn't confirm from a primary source whether
   3.10.0 fails generically against v29. The linked issue #1575 is a module-specific (ServiceBus)
   failure on 4.8.1. If CI runners or Docker Desktop move to Engine v29, 4.10.0+ is the supported
   path either way.
3. **The Docker Engine version on the GitHub `ubuntu-22.04` runner** wasn't checked. With the
   default API pin `1.44`, Engine < 25 would be rejected. *Unverified* for the current runner image,
   but very unlikely in 2026.
4. **Fixed host ports + IPv6 publishing (4.2.0).** If something on the CI host or a developer
   machine holds 2525/4545/4646 on `::`, startup now fails where it didn't before. Low probability.
5. **Future removal.** The obsolete constructors are marked "will be removed", with no version
   announced. Doing §3.1 now avoids a forced change at that later major.

---

## 7. Sources

Primary, all accessed 2026-09-17:

- NuGet versions: https://api.nuget.org/v3-flatcontainer/testcontainers/index.json,
  https://api.nuget.org/v3-flatcontainer/testcontainers.postgresql/index.json
- NuGet nuspecs: https://api.nuget.org/v3-flatcontainer/testcontainers/4.15.0/testcontainers.nuspec,
  https://api.nuget.org/v3-flatcontainer/testcontainers.postgresql/4.15.0/testcontainers.postgresql.nuspec,
  https://api.nuget.org/v3-flatcontainer/testcontainers.xunit/4.15.0/testcontainers.xunit.nuspec
- Release notes (each read in full): https://github.com/testcontainers/testcontainers-dotnet/releases/tag/4.0.0,
  …/4.1.0, …/4.2.0, …/4.3.0, …/4.4.0, …/4.5.0, …/4.6.0, …/4.7.0, …/4.8.0, …/4.8.1, …/4.9.0,
  …/4.10.0, …/4.11.0, …/4.12.0, …/4.13.0, …/4.14.0, …/4.15.0
- Source @ tag `4.15.0` (https://github.com/testcontainers/testcontainers-dotnet/tree/4.15.0):
  `src/Testcontainers/Builders/ContainerBuilder.cs:39-68`;
  `src/Testcontainers.PostgreSql/PostgreSqlBuilder.cs:7-8,31-67,Init(),WaitUntil`;
  `src/Testcontainers.PostgreSql/PostgreSqlContainer.cs:23-32`;
  `src/Testcontainers/Builders/ContainerBuilder`3.cs:495-505`;
  `src/Testcontainers/Containers/DockerContainer.cs:667-695`;
  `src/Testcontainers/Configurations/AuthConfigs/DockerEndpointAuthenticationConfiguration.cs:16`;
  `src/Testcontainers/Configurations/TestcontainersSettings.cs:71`;
  `src/Testcontainers/Containers/ResourceReaper.cs:41`;
  `src/Testcontainers/Configurations/WaitStrategies/IWaitForContainerOS.cs:69,90`;
  `src/Testcontainers/Testcontainers.csproj`; `Directory.Packages.props`
- Source @ tag `3.10.0` (https://github.com/testcontainers/testcontainers-dotnet/tree/3.10.0):
  `src/Testcontainers.PostgreSql/PostgreSqlBuilder.cs` (parameterless ctor, `Init().WithImage(PostgreSqlImage)`);
  `src/Testcontainers/Clients/DockerApiClient.cs:140`; `src/Testcontainers/Containers/ResourceReaper.cs:36`;
  `src/Testcontainers/Configurations/WaitStrategies/IWaitForContainerOS.cs:66`;
  `src/Testcontainers/Testcontainers.csproj`; `Directory.Packages.props`
- Maintainer migration note: https://github.com/testcontainers/testcontainers-dotnet/discussions/1470#discussioncomment-15185721
- PRs: https://github.com/testcontainers/testcontainers-dotnet/pull/1363 (IPv4 binding),
  …/pull/1576 (API version config), …/pull/1609 (Engine v29), …/pull/1254 (missing resource);
  issue …/issues/1575
- Docs: https://dotnet.testcontainers.org/modules/postgres/ (constructor with image),
  https://dotnet.testcontainers.org/api/wait_strategies/ (wait strategy modes),
  https://dotnet.testcontainers.org/api/best_practices/,
  https://dotnet.testcontainers.org/test_frameworks/xunit_net/
- Repo: `src/backend/Directory.Packages.props:43-44`, `src/backend/Directory.Build.props:3,7-8`,
  `src/backend/tests/FoodDiary.ComponentTests/Infrastructure/DataAccess/DatabaseFixture.cs`,
  `.../Infrastructure/ExternalServices/ExternalServicesFixture.cs`,
  `.../Infrastructure/InfrastructureFixture.cs`, `.../BaseTest.cs`, `.github/workflows/build.yml:37`
