# Backend: Directory.Build.props + Central Package Management

**Date:** 2026-07-19
**Status:** Approved

## Goal

Make future upgrades cheap by centralizing build configuration for the 11-project
`FoodDiary.sln`:

- **Framework bumps** (net8.0 → net10.0) edit one `TargetFramework`, not eleven.
- **Package bumps** (e.g. `System.Text.Json`) edit one `PackageVersion`, not every
  csproj that references it.

## Current state

All 11 projects target `net8.0`. No two projects disagree on the version of any
package, so the Central Package Management (CPM) migration is a pure lift — no
version reconciliation required.

Build configuration has drifted:

| Property | Set in |
|---|---|
| `Nullable` | 8 of 11 (missing: Domain, Infrastructure, UnitTests) |
| `ImplicitUsings` | 5 of 11 |
| `LangVersion 12` | 5 of 11 (redundant — net8.0 already defaults to C# 12) |

Baseline build: **18 warnings, 0 errors.**

## Decisions

1. **Normalize all shared properties** solution-wide via `Directory.Build.props`,
   rather than preserving the existing drift.
2. **`TreatWarningsAsErrors`**, scoped to `CS*` only. `NU*` (NuGet advisories) and
   `SYSLIB*` (obsolete APIs) stay warnings — otherwise a future framework bump or a
   new CVE advisory on a transitive package becomes a hard build failure, working
   directly against the goal of cheap upgrades.
3. **Two PRs.** Nullable fixes land first, so the build-config migration is
   reviewable as a provable no-op.
4. **No `null!` anywhere.** Collections get `= []`; reference navigations become
   nullable.

## Empirical findings

Measured by applying the full design and building, then reverting.

**Enabling `Nullable` + `ImplicitUsings` solution-wide produces 0 errors** —
`ImplicitUsings` normalization is free.

**5 of the 18 baseline warnings disappear** once `Nullable` is enabled: the
`CS8632` cluster in `RecognizeNoteCommandHandlerTests` ("annotation used outside a
nullable context") is self-resolving.

**Nullable EF navigations do not change the database schema.** A migration
generated against the nullable-nav model came out **empty**, and
`FoodDiaryContextModelSnapshot.cs` was not modified. EF derives relationship
optionality from the FK property — `Product.CategoryId` and `Note.ProductId` are
non-nullable `int` — not from the navigation reference. API contracts are likewise
unaffected: nullability is a compile-time annotation, and serialized JSON is
unchanged.

**No lazy-loading proxies are configured** (`FoodDiaryContext` does not call
`UseLazyLoadingProxies`), so the `virtual` keywords on collection navigations are
vestigial and `= []` initializers are safe.

**`required` is already established here** — `Product.cs` uses
`required decimal? Protein` today, working with EF, AutoMapper, and AutoFixture.
Reflection-based construction bypasses `required`, which is enforced by the
compiler and by System.Text.Json, not at runtime by reflection.

**Total cost of the full design: 19 warnings + 1 error.**

## PR 1 — Nullable correctness (prep)

No build-configuration changes. Behavior-preserving.

### Property fixes by category

**`required`** — genuine required scalar data:

- `Product.Name`, `Category.Name`
- `ProductItemDto.Name`, `ProductItemDto.CategoryName`
- `CategoryItemDto.Name`
- `CategoryAutocompleteItemDto.Name`, `ProductAutocompleteItemDto.Name`
- `CategoryCreateEditRequest.Name`

`CategoryCreateEditRequest.Name` also carries `[Required]` DataAnnotations. Adding
the C# `required` keyword means System.Text.Json rejects a missing `Name` during
deserialization, before model binding — so the response becomes a generic
problem-details 400 instead of the "Category name is required" message. This is
accepted: enforcement matters more than the message text.

**`= []`** — collections:

- `Product.Notes`, `Category.Products`
- `ProductsSearchResultDto.ProductItems`
- `ProductsSearchResult.FoundProducts`
- `AuthOptions.AllowedEmails`

**`?`** — nullable:

- `Product.Category`, `Note.Product` (EF reference navigations — genuinely null
  when not `Include`d)
- `GetCategoriesRequest.CategoryNameFilter`, `GetProductsRequest.ProductName`
  (optional filters; both classes have parameterless constructors that never set
  them, so `required` would be a compile error)

### Consequential fixes

**Navigation dereferences → null-forgiving `!`** (4 sites). All are mapper code
running exclusively on `.Include(...)`-loaded entities. `AutoMapperProfile.cs:35`
sits inside an expression tree, which cannot contain `throw` expressions, so `!` is
the only option there; the rest follow for consistency.

- `AutoMapperProfile.cs:35` — `src.Category!.Name`
- `ProductsMapper.cs:16` — `product.Category!.Name`
- `ProductsMappingExtensions.cs:25` — `p.Category!.Name`
- `NotesMapper.cs:20` — `note.Product!`

**Repository signature corrections** (6 sites). The implementations currently
declare `Task<Product>` while the interfaces they satisfy declare `Task<Product?>` —
a real pre-existing contract mismatch, not merely a nullable-annotation artifact.

- `ProductsRepository.cs:11,13,16,18` — `FindById`, `FindByExactName`
- `NotesRepository.cs:38,40` — `FindById`

**Other**:

- `Repository.cs:39,74` — `CS8619`, `CS8603`
- `GoogleOAuthClient.cs:42,64` — `CS8603`

**ComponentTests** (6 sites):

- `Dsl/CategoryBuilder.cs:7` — **`CS9035` error**, the only compile error in the
  design: object initializer must now set the `required` `Category.Name`
- `Dsl/ProductBuilder.cs:22`, `Dsl/NoteRequestBodyBuilder.cs:30`,
  `Dsl/ProductCreateEditRequestBuilder.cs:36`,
  `Formatting/NoteFormatter.cs:23`,
  `Scenarios/Products/ProductsApiTests.cs:71`

### Resolved for free

- The 5 `CS8632` warnings in `RecognizeNoteCommandHandlerTests` vanish once
  `Nullable` is enabled.
- `ProductsController.cs:57` (`CS8601`) is resolved by making
  `GetProductsRequest.ProductName` nullable.

### Verification

- `dotnet build` with `-p:Nullable=enable -p:ImplicitUsings=enable`: 0 warnings,
  0 errors.
- `dotnet test tests/FoodDiary.UnitTests` and
  `dotnet test tests/FoodDiary.ComponentTests` pass.
- `dotnet ef migrations add Probe` produces an empty migration and leaves
  `FoodDiaryContextModelSnapshot.cs` unmodified; the probe is then removed.

## PR 2 — Build-configuration migration

### `src/backend/Directory.Build.props`

Placed alongside `FoodDiary.sln`; MSBuild's upward directory walk covers all 11
projects under `src/` and `tests/`.

```xml
<Project>
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <LangVersion>12</LangVersion>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <WarningsNotAsErrors>NU1701;NU1901;NU1902;NU1903;NU1904;$(WarningsNotAsErrors)</WarningsNotAsErrors>
  </PropertyGroup>
</Project>
```

### `src/backend/Directory.Packages.props`

`ManagePackageVersionsCentrally=true` plus one `PackageVersion` per package ID,
taking each version verbatim from the current csproj files.

### csproj changes

- Remove `TargetFramework`, `LangVersion`, `Nullable`, `ImplicitUsings` from all
  11 projects.
- Remove the `Version` attribute from every `PackageReference`. `PrivateAssets` and
  `IncludeAssets` metadata stays in the csproj — it is per-project, not per-version.
- Keep project-specific properties in place: `UserSecretsId` (API, Migrator),
  `OutputType` (Migrator), `RootNamespace` (Constants), `IsPackable` (both test
  projects).
- `FoodDiary.API.csproj`: replace the literal `bin\Debug\net8.0\FoodDiary.API.xml`
  with `bin\Debug\$(TargetFramework)\FoodDiary.API.xml` — a props file cannot reach
  a hardcoded path. Also collapse the duplicated `<DocumentationFile>` element,
  which is declared twice per configuration with the second silently winning.

### Verification

- `dotnet restore` resolves an identical package graph.
- `dotnet build`: 0 warnings, 0 errors.
- Both test projects pass.

## Out of scope

These hardcode `8.0` and cannot be reached by the props files. A future framework
bump still requires editing them by hand:

- `src/backend/global.json` — SDK version
- `Dockerfile` — `dotnet/sdk:8.0` and `dotnet/aspnet:8.0`
- `.github/workflows/build.yml` (×2) and `deploy.yml` (×1) — `dotnet-version: 8.0.405`

Consolidating these is worth doing separately; folding it in would expand this
change without serving its goal.
