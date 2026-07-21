---
paths:
  - '*.cs'
  - '*.csproj'
  - '**/Directory.Build.props'
  - '**/Directory.Packages.props'
---

## String Literals

- Prefer C# raw string literals (`"""..."""`) over string concatenation (`"..." + "..."`) for multi-line strings such as prompts, SQL, or templates. Raw string literals preserve formatting without escape sequences and are easier to edit.

### Build configuration

Shared MSBuild settings live in `src/backend/Directory.Build.props` — target framework, language version, nullable, and warning policy. Do not set these in individual csproj files. Bumping the target framework is a one-line edit there (plus `global.json`, the `Dockerfile`, and the `dotnet-version` entries in `.github/workflows/`, which MSBuild cannot reach).

Package versions are centrally managed in `src/backend/Directory.Packages.props`. To add a package: add a `<PackageVersion Include="..." Version="..." />` there, then reference it **without a version** in the consuming csproj:

```xml
<PackageReference Include="SomePackage" />
```

A `Version` attribute on a `PackageReference` fails the build with `NU1008`.

Compiler warnings are errors (`TreatWarningsAsErrors`). NuGet advisory warnings (`NU19xx`) are deliberately left as warnings so a new CVE on a transitive package does not block the build.

`src/backend/NuGet.config` pins the solution to a single package source with `<clear />`. Central package management raises `NU1507` (build-breaking here too) when more than one source is configured without package source mapping; without `<clear />`, the source list merges with a developer's global `~/.nuget/NuGet/NuGet.Config`, so restore broke locally for anyone with an extra feed while CI (a clean runner) stayed green. Do not remove the `<clear />`.

## Testing

- **Every API endpoint must have at least one happy-path component test** in `FoodDiary.ComponentTests` (`Scenarios/<Feature>/<Feature>ApiTests.cs`). When adding or changing an endpoint, add or extend the matching `*ApiTests` scenario using the existing Given/When/Then context DSL (stub external services like OpenAI via the Mountebank helpers). An endpoint is not complete until it has one.
