# Backend Central Package Management Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Centralize build configuration for the 11-project `FoodDiary.sln` into `Directory.Build.props` and `Directory.Packages.props`, so future framework and package upgrades edit one file instead of eleven.

**Architecture:** Two phases. Phase 1 (Tasks 1–5) fixes nullable-reference correctness across the solution, so that Phase 2 can enable `Nullable` and `TreatWarningsAsErrors` solution-wide without a wall of errors. Phase 2 (Tasks 6–8) introduces the two props files and strips the now-redundant properties and version attributes from every csproj. Phase 1 is behavior-preserving; Phase 2 is a build-configuration no-op.

**Tech Stack:** .NET 8, C# 12, EF Core 8 (PostgreSQL/Npgsql), MediatR 10, AutoMapper, xUnit + LightBDD + Testcontainers.

## Global Constraints

- All work happens in `src/backend/`. Run all `dotnet` commands from that directory.
- Target framework stays `net8.0` throughout. This plan does **not** bump .NET.
- No package versions change. The migration is version-neutral: 45 packages, 0 version conflicts.
- **Never introduce `null!`.** Collections use `= []`; reference navigations become nullable.
- Database schema must not change. Any generated probe migration must come out empty.
- API response contracts must not change (serialized JSON stays identical).
- The one accepted behavior change is `CategoryCreateEditRequest.Name` becoming `required`: a request missing `Name` now returns a generic problem-details 400 instead of the DataAnnotations message `"Category name is required"`. This was explicitly approved.
- Existing xUnit/LightBDD tests are the regression net.

## A note on TDD

This plan deliberately does not follow write-failing-test-first. No new behavior is being added — every change is a type-annotation or build-configuration change. The acceptance signal is the **compiler warning count** plus the **existing test suite**, not new tests. Each task therefore states its expected before/after warning set as the gate. Writing new tests here would test the C# compiler, not this codebase.

## Baseline facts (verified)

- Baseline build: **18 warnings, 0 errors**.
- With `Nullable`+`ImplicitUsings` forced on and no code changes: **37 warnings, 0 errors** (5 baseline `CS8632` warnings self-resolve, 19 new appear).
- With the full Phase 1 design applied: **19 warnings + 1 error** remain to clear.
- 45 packages, **0 version conflicts** across all 11 projects.

## File Structure

**Phase 1 — created:** none. All modifications.

| File | Responsibility in this change |
|---|---|
| `src/FoodDiary.Domain/Entities/{Product,Category,Note}.cs` | `required` scalars, `= []` collections, nullable navigations |
| `src/FoodDiary.API/AutoMapperProfile.cs`, `Mapping/{ProductsMapper,NotesMapper}.cs`, `Features/Products/Extensions/ProductsMappingExtensions.cs` | Null-forgiving on `Include`-guaranteed navigations |
| `src/FoodDiary.API/Dtos/*.cs`, `Requests/CategoryCreateEditRequest.cs`, `src/FoodDiary.Contracts/**` | `required` scalars, `= []` collections |
| `src/FoodDiary.Application/{Categories,Products}/Requests/*.cs`, `Models/ProductsSearchResult.cs` | Nullable optional filters, `= []` collections |
| `src/FoodDiary.Configuration/AuthOptions.cs` | `= []` collection |
| `src/FoodDiary.Infrastructure/Repositories/v2/*.cs`, `Repository.cs`, `Integrations/Google/GoogleOAuthClient.cs` | Correct nullable return contracts |
| `tests/FoodDiary.ComponentTests/**` | Fallout from entity annotations |

**Phase 2 — created:**

| File | Responsibility |
|---|---|
| `src/backend/Directory.Build.props` | Shared MSBuild properties for all 11 projects |
| `src/backend/Directory.Packages.props` | Single source of truth for all 45 package versions |

---

## Task 1: Domain entities and their consumers

This task is atomic — annotating the entities immediately produces a hard compile error (`CS9035`) in `CategoryBuilder`, so entity changes and all consumer fixes must land together or the build is broken.

**Files:**
- Modify: `src/FoodDiary.Domain/Entities/Product.cs`
- Modify: `src/FoodDiary.Domain/Entities/Category.cs`
- Modify: `src/FoodDiary.Domain/Entities/Note.cs`
- Modify: `src/FoodDiary.API/AutoMapperProfile.cs:35`
- Modify: `src/FoodDiary.API/Mapping/ProductsMapper.cs:16`
- Modify: `src/FoodDiary.API/Mapping/NotesMapper.cs:20`
- Modify: `src/FoodDiary.API/Features/Products/Extensions/ProductsMappingExtensions.cs:25`
- Modify: `tests/FoodDiary.ComponentTests/Dsl/CategoryBuilder.cs`
- Modify: `tests/FoodDiary.ComponentTests/Dsl/ProductBuilder.cs`
- Modify: `tests/FoodDiary.ComponentTests/Dsl/NoteRequestBodyBuilder.cs:30`
- Modify: `tests/FoodDiary.ComponentTests/Dsl/ProductCreateEditRequestBuilder.cs:36`
- Modify: `tests/FoodDiary.ComponentTests/Formatting/NoteFormatter.cs:23`
- Modify: `tests/FoodDiary.ComponentTests/Scenarios/Products/ProductsApiTests.cs:71`

**Interfaces:**
- Consumes: nothing (first task).
- Produces: `Product.Name` and `Category.Name` become `required string`. `Product.Category` becomes `Category?`, `Note.Product` becomes `Product?`. `Product.Notes` and `Category.Products` default to `[]`. Later tasks and all test builders must construct `Product`/`Category` with `Name` set in the object initializer.

- [ ] **Step 1: Annotate `Product.cs`**

Replace these three property declarations in `src/FoodDiary.Domain/Entities/Product.cs`:

```csharp
    public required string Name { get; set; }
```
(was `public string Name { get; set; }`, line 15)

```csharp
    public Category? Category { get; set; }
```
(was `public Category Category { get; set; }`, line 32)

```csharp
    public virtual ICollection<Note> Notes { get; set; } = [];
```
(was `public virtual ICollection<Note> Notes { get; set; }`, line 34)

- [ ] **Step 2: Annotate `Category.cs`**

In `src/FoodDiary.Domain/Entities/Category.cs`:

```csharp
    public required string Name { get; set; }
```
(was `public string Name { get; set; }`, line 15)

```csharp
    public virtual ICollection<Product> Products { get; set; } = [];
```
(was `public virtual ICollection<Product> Products { get; set; }`, line 17)

- [ ] **Step 3: Annotate `Note.cs`**

In `src/FoodDiary.Domain/Entities/Note.cs`, line 15:

```csharp
    public Product? Product { get; set; }
```

- [ ] **Step 4: Fix the four navigation dereferences in `FoodDiary.API`**

Each of these strings is unique in the codebase — a plain find-and-replace is safe.

`src/FoodDiary.API/AutoMapperProfile.cs:35` — this one sits inside an expression tree, which cannot contain `throw` expressions, so `!` is the only available option:
```csharp
                o => o.MapFrom(src => src.Category!.Name));
```

`src/FoodDiary.API/Mapping/ProductsMapper.cs:16`:
```csharp
        CategoryName = product.Category!.Name,
```

`src/FoodDiary.API/Mapping/NotesMapper.cs:20`:
```csharp
        Product: note.Product!.ToGetNotesResponse());
```

`src/FoodDiary.API/Features/Products/Extensions/ProductsMappingExtensions.cs:25`:
```csharp
                Name = p.Category!.Name
```

- [ ] **Step 5: Fix `CategoryBuilder.cs` (the `CS9035` compile error)**

The field initializer currently runs before the constructor body, so `Name` is not set at construction time. Move the whole initializer into the constructor. Replace lines 7–16 of `tests/FoodDiary.ComponentTests/Dsl/CategoryBuilder.cs`:

```csharp
    private readonly Category _category;

    public CategoryBuilder(string? name)
    {
        _category = new Category
        {
            Id = Random.Shared.Next(),
            Name = string.IsNullOrWhiteSpace(name) ? $"TestCategory-{Guid.NewGuid()}" : name,
            Products = new List<Product>()
        };
    }
```

Leave `Please()`, `From()`, and `WithName()` (lines 18–31) unchanged.

- [ ] **Step 6: Fix `ProductBuilder.cs`**

`Product.Name` is now non-nullable, so the backing field must be too. It is already always assigned a non-null value — the compiler narrows `name` to non-null in the false branch of `IsNullOrWhiteSpace`. In `tests/FoodDiary.ComponentTests/Dsl/ProductBuilder.cs:8`:

```csharp
    private string _name = string.IsNullOrWhiteSpace(name) ? $"TestProduct-{Guid.NewGuid()}" : name;
```

Line 11 (`private Category? _category = ...`) already matches the new nullable `Product.Category` and needs no change.

- [ ] **Step 7: Fix the remaining three ComponentTests dereferences**

`tests/FoodDiary.ComponentTests/Dsl/NoteRequestBodyBuilder.cs:30`:
```csharp
        _productId = note.Product!.Id;
```

`tests/FoodDiary.ComponentTests/Dsl/ProductCreateEditRequestBuilder.cs:36`:
```csharp
        _categoryId = product.Category!.Id;
```

`tests/FoodDiary.ComponentTests/Formatting/NoteFormatter.cs:23`:
```csharp
        var productName = note.Product!.Name;
```

- [ ] **Step 8: Fix `ProductsApiTests.cs:71`**

`Given_categories` takes `params Category[]`, and `chicken.Category` is now `Category?`:

```csharp
            c => c.Given_categories(chicken.Category!),
```

- [ ] **Step 9: Verify the build**

Run: `dotnet build FoodDiary.sln --no-incremental -p:Nullable=enable -p:ImplicitUsings=enable`

Expected: **0 errors.** Warnings remain (Tasks 2–4 clear them), but none of these should appear any more:
- `CS9035` in `CategoryBuilder.cs`
- `CS8602`/`CS8604` in `AutoMapperProfile.cs`, `ProductsMapper.cs`, `NotesMapper.cs`, `ProductsMappingExtensions.cs`
- `CS8601`/`CS8602`/`CS8604` in `ProductBuilder.cs`, `NoteRequestBodyBuilder.cs`, `ProductCreateEditRequestBuilder.cs`, `NoteFormatter.cs`, `ProductsApiTests.cs`

- [ ] **Step 10: Confirm no schema drift**

This is the critical guard on making navigations nullable. Run:

```bash
dotnet ef migrations add ProbeSchemaDrift -s src/FoodDiary.API -p src/FoodDiary.Infrastructure -o Migrations
```

Open the generated `src/FoodDiary.Infrastructure/Migrations/*_ProbeSchemaDrift.cs`. Both `Up` and `Down` **must be empty**. Also confirm `git status` shows `FoodDiaryContextModelSnapshot.cs` as unmodified.

If either check fails, stop — the entity changes altered the EF model and the design assumption is wrong.

Then delete the two generated files (`dotnet ef migrations remove` needs a live database, so remove them directly):

```bash
rm src/FoodDiary.Infrastructure/Migrations/*_ProbeSchemaDrift.cs \
   src/FoodDiary.Infrastructure/Migrations/*_ProbeSchemaDrift.Designer.cs
```

- [ ] **Step 11: Run the tests**

```bash
dotnet test tests/FoodDiary.UnitTests
dotnet test tests/FoodDiary.ComponentTests
```

Expected: all pass. ComponentTests needs Docker running (Testcontainers).

- [ ] **Step 12: Commit**

```bash
git add src/FoodDiary.Domain src/FoodDiary.API tests/FoodDiary.ComponentTests
git commit -m "Annotate domain entities for nullable reference types

Marks Name as required on Product and Category, defaults collection
navigations to [], and makes reference navigations nullable to reflect
that they are only populated by an explicit Include.

Verified schema-neutral: a probe migration generates empty and the model
snapshot is unchanged, because EF derives relationship optionality from
the non-nullable FK properties rather than the navigations."
```

---

## Task 2: DTOs, contracts, and options

**Files:**
- Modify: `src/FoodDiary.API/Dtos/ProductItemDto.cs:7,15`
- Modify: `src/FoodDiary.API/Dtos/CategoryItemDto.cs:7`
- Modify: `src/FoodDiary.API/Dtos/ProductsSearchResultDto.cs:9`
- Modify: `src/FoodDiary.API/Requests/CategoryCreateEditRequest.cs:9`
- Modify: `src/FoodDiary.Contracts/Categories/CategoryAutocompleteItemDto.cs:7`
- Modify: `src/FoodDiary.Contracts/Products/ProductAutocompleteItemDto.cs:10`
- Modify: `src/FoodDiary.Application/Models/ProductsSearchResult.cs:8`
- Modify: `src/FoodDiary.Configuration/AuthOptions.cs:5`

**Interfaces:**
- Consumes: nothing from Task 1 — these types are independent.
- Produces: the listed DTO `Name`/`CategoryName` properties become `required string`. Collection properties default to `[]`. No signature changes.

`required` is safe with AutoMapper and AutoFixture: both construct via reflection, which bypasses `required` (it is enforced by the compiler and by System.Text.Json). `ProductItemDto` already carries `required decimal? Protein` today and maps correctly, which proves the pattern.

- [ ] **Step 1: Mark required scalars**

`src/FoodDiary.API/Dtos/ProductItemDto.cs` lines 7 and 15:
```csharp
    public required string Name { get; init; }
```
```csharp
    public required string CategoryName { get; init; }
```

`src/FoodDiary.API/Dtos/CategoryItemDto.cs:7`:
```csharp
    public required string Name { get; set; }
```

`src/FoodDiary.Contracts/Categories/CategoryAutocompleteItemDto.cs:7`:
```csharp
    public required string Name { get; set; }
```

`src/FoodDiary.Contracts/Products/ProductAutocompleteItemDto.cs:10`:
```csharp
    public required string Name { get; init; }
```

- [ ] **Step 2: Mark `CategoryCreateEditRequest.Name` required**

`src/FoodDiary.API/Requests/CategoryCreateEditRequest.cs:9` — keep both existing DataAnnotations attributes:

```csharp
    [Required(ErrorMessage = "Category name is required")]
    [StringLength(64, MinimumLength = 4, ErrorMessage = "Category name must be between 4 and 64 characters")]
    public required string Name { get; set; }
```

This is the one approved behavior change: System.Text.Json now rejects a body missing `Name` during deserialization, producing a generic 400 rather than the `[Required]` message. The `StringLength` rule still applies normally to present values.

- [ ] **Step 3: Default collections to `[]`**

`src/FoodDiary.API/Dtos/ProductsSearchResultDto.cs:9`:
```csharp
    public IEnumerable<ProductItemDto> ProductItems { get; set; } = [];
```

`src/FoodDiary.Application/Models/ProductsSearchResult.cs:8`:
```csharp
    public List<Product> FoundProducts { get; set; } = [];
```

`src/FoodDiary.Configuration/AuthOptions.cs:5`:
```csharp
    public IEnumerable<string> AllowedEmails { get; set; } = [];
```

`AuthOptions` is bound via `IOptions<T>`, which requires a parameterless constructor — this is exactly why it gets `= []` rather than `required`.

- [ ] **Step 4: Verify the build**

Run: `dotnet build FoodDiary.sln --no-incremental -p:Nullable=enable -p:ImplicitUsings=enable`

Expected: 0 errors, and no `CS8618` warnings remain in any of the eight files above.

- [ ] **Step 5: Run the tests**

```bash
dotnet test tests/FoodDiary.UnitTests
dotnet test tests/FoodDiary.ComponentTests
```

Expected: all pass. Pay attention to any ComponentTests scenario asserting on the category-creation validation message — if one fails on the error *body* for a missing `Name`, update it to expect a 400 without the DataAnnotations message text, per the approved behavior change.

- [ ] **Step 6: Commit**

```bash
git add src/FoodDiary.API src/FoodDiary.Contracts src/FoodDiary.Application src/FoodDiary.Configuration
git commit -m "Annotate DTOs and options for nullable reference types

Marks genuinely-required DTO scalars as required and defaults collection
properties to empty rather than null.

CategoryCreateEditRequest.Name becomes required, so System.Text.Json now
rejects a missing name at deserialization. The response for that case
changes from the DataAnnotations message to a generic 400."
```

---

## Task 3: Optional request filters

**Files:**
- Modify: `src/FoodDiary.Application/Categories/Requests/GetCategoriesRequest.cs:9`
- Modify: `src/FoodDiary.Application/Products/Requests/GetProductsRequest.cs:12`

**Interfaces:**
- Consumes: nothing from Tasks 1–2.
- Produces: `GetCategoriesRequest.CategoryNameFilter` and `GetProductsRequest.ProductName` become `string?`.

These are search filters, and both classes have parameterless constructors that never assign them — `required` would be a compile error. Nullable is the correct annotation.

- [ ] **Step 1: Make both filters nullable**

`src/FoodDiary.Application/Categories/Requests/GetCategoriesRequest.cs:9`:
```csharp
    public string? CategoryNameFilter { get; set; }
```

`src/FoodDiary.Application/Products/Requests/GetProductsRequest.cs:12`:
```csharp
    public string? ProductName { get; set; }
```

- [ ] **Step 2: Verify the build**

Run: `dotnet build FoodDiary.sln --no-incremental -p:Nullable=enable -p:ImplicitUsings=enable`

Expected: 0 errors. Two specific outcomes:
- The `CS8618` warnings for both properties are gone.
- The pre-existing `CS8601` at `src/FoodDiary.API/Controllers/v1/ProductsController.cs:57` is **also gone** — it was assigning a nullable source into the previously non-nullable `ProductName`.

The handlers at `GetCategoriesRequestHandler.cs:27` and `GetProductsRequestHandler.cs:27` dereference these filters inside a LINQ lambda. Verified: the compiler's flow analysis handles this correctly through the `IsNullOrWhiteSpace` guard and **no warning is produced**. Do not add null-forgiving operators or hoist locals there — no change is needed in either handler.

- [ ] **Step 3: Run the tests**

```bash
dotnet test tests/FoodDiary.UnitTests
dotnet test tests/FoodDiary.ComponentTests
```

Expected: all pass.

- [ ] **Step 4: Commit**

```bash
git add src/FoodDiary.Application
git commit -m "Make optional search filters nullable

CategoryNameFilter and ProductName are optional filters that the
parameterless constructors never assign. Annotating them nullable also
resolves the pre-existing null-assignment warning in ProductsController."
```

---

## Task 4: Repository and OAuth client nullable contracts

The repository fixes here correct a genuine pre-existing defect: the v2 implementations declare non-nullable returns while the interfaces they satisfy declare nullable ones.

**Files:**
- Modify: `src/FoodDiary.Infrastructure/Repositories/v2/ProductsRepository.cs:11,16`
- Modify: `src/FoodDiary.Infrastructure/Repositories/v2/NotesRepository.cs:38`
- Modify: `src/FoodDiary.Infrastructure/Repository.cs:39,74`
- Modify: `src/FoodDiary.Infrastructure/Integrations/Google/GoogleOAuthClient.cs:42,64`

**Interfaces:**
- Consumes: nothing from Tasks 1–3.
- Produces: `ProductsRepository.FindById` → `Task<Product?>`, `ProductsRepository.FindByExactName` → `Task<Product?>`, `NotesRepository.FindById` → `Task<Note?>`. These now match `IProductsRepository` and `INotesRepository`, which already declare nullable returns and are unchanged.

- [ ] **Step 1: Correct the v2 repository signatures**

`src/FoodDiary.Domain/Repositories/v2/IProductsRepository.cs` and `INotesRepository.cs` already declare `Task<Product?>` / `Task<Note?>`. **Do not modify the interfaces** — only the implementations, which currently under-report nullability.

`src/FoodDiary.Infrastructure/Repositories/v2/ProductsRepository.cs`, lines 11 and 16:
```csharp
    public async Task<Product?> FindById(int id, CancellationToken cancellationToken)
```
```csharp
    public Task<Product?> FindByExactName(string name, CancellationToken cancellationToken)
```

`src/FoodDiary.Infrastructure/Repositories/v2/NotesRepository.cs`, line 38:
```csharp
    public async Task<Note?> FindById(int id, CancellationToken cancellationToken)
```

- [ ] **Step 2: Fix `Repository.cs`**

Line 39 — `DbSet.FindAsync` genuinely returns null for a missing id, but `IRepository<TEntity>.GetByIdAsync` declares `Task<TEntity>`. Propagating `TEntity?` through that interface would cascade into three MediatR handlers, their `IRequest<T>` response types, and five controller call sites — well beyond this plan's scope. This is legacy v1 surface; the v2 repositories above are where correct nullable contracts live. Use the null-forgiving operator and leave the v1 contract alone:

```csharp
        return TargetDbSet.FindAsync(new object[] { id }, cancellationToken).AsTask()!;
```

Line 74 — the guard on line 72 already threw if the cast would fail, so `as` is the wrong operator here. A direct cast is both warning-free and more honest:

```csharp
            return (IUnitOfWork)_context;
```

- [ ] **Step 3: Fix `GoogleOAuthClient.cs`**

`ReadFromJsonAsync<T>` returns `T?`, so a malformed or empty response body currently yields a null that propagates to callers. Returning the existing error case is more correct than suppressing the warning.

Line 42 (end of the refresh-token method):
```csharp
        return content ?? new RefreshTokenResult.Error();
```

Line 64 (end of `GetUserInfo`):
```csharp
        return content ?? new GetUserInfoResult.Error();
```

- [ ] **Step 4: Verify the build is completely clean**

This is the final Phase 1 code task, so the build must now be spotless:

Run: `dotnet build FoodDiary.sln --no-incremental -p:Nullable=enable -p:ImplicitUsings=enable`

Expected: **0 warnings, 0 errors.**

If any warning remains, it belongs to one of Tasks 1–3 and should be fixed in the task that owns that file.

- [ ] **Step 5: Run the tests**

```bash
dotnet test tests/FoodDiary.UnitTests
dotnet test tests/FoodDiary.ComponentTests
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add src/FoodDiary.Infrastructure
git commit -m "Correct nullable return contracts in repositories and OAuth client

The v2 repository implementations declared non-nullable returns while the
interfaces they implement declare nullable ones. Aligns the implementations
with their contracts.

GoogleOAuthClient now falls back to its error result when a response body
fails to deserialize, instead of returning null."
```

---

## Task 5: Phase 1 verification gate

No code changes. This task exists so a reviewer can confirm Phase 1 achieved its goal before any build configuration changes, and so Phase 2 starts from a known-clean baseline.

**Files:** none modified.

**Interfaces:**
- Consumes: the completed state of Tasks 1–4.
- Produces: a verified-clean baseline for Task 6.

- [ ] **Step 1: Confirm the normalized build is clean**

```bash
dotnet build FoodDiary.sln --no-incremental -p:Nullable=enable -p:ImplicitUsings=enable
```

Expected: **0 warnings, 0 errors.**

- [ ] **Step 2: Confirm the un-normalized build**

```bash
dotnet build FoodDiary.sln --no-incremental
```

Expected: **0 errors**, and the only remaining warnings are the 5 `CS8632` in `tests/FoodDiary.UnitTests/Notes/Recognize/RecognizeNoteCommandHandlerTests.cs` ("annotation for nullable reference types should only be used in code within a `#nullable` annotations context").

These are expected and must **not** be fixed here. They exist precisely because `FoodDiary.UnitTests` does not yet enable `Nullable`, and they resolve themselves in Task 6 when `Directory.Build.props` turns it on solution-wide. Down from 18 baseline warnings, this confirms Phase 1 cleared the other 13.

- [ ] **Step 3: Confirm no schema drift one final time**

```bash
dotnet ef migrations add ProbeFinal -s src/FoodDiary.API -p src/FoodDiary.Infrastructure -o Migrations
```

Confirm `Up` and `Down` are empty and `FoodDiaryContextModelSnapshot.cs` is unmodified, then remove the generated files:

```bash
rm src/FoodDiary.Infrastructure/Migrations/*_ProbeFinal.cs \
   src/FoodDiary.Infrastructure/Migrations/*_ProbeFinal.Designer.cs
```

- [ ] **Step 4: Run the full suite**

```bash
dotnet test tests/FoodDiary.UnitTests
dotnet test tests/FoodDiary.ComponentTests
```

Expected: all pass.

- [ ] **Step 5: Capture the package baseline for Task 7**

Record the resolved package graph so Task 7 can prove CPM did not change it:

```bash
dotnet restore FoodDiary.sln
find . -name project.assets.json -path '*/obj/*' -exec grep -ho '"[^"]*/[0-9][^"]*": {' {} \; \
  | sort -u > /tmp/packages-before.txt
wc -l < /tmp/packages-before.txt
```

Keep `/tmp/packages-before.txt` — Task 7 diffs against it.

---

## Task 6: Directory.Build.props

**Files:**
- Create: `src/backend/Directory.Build.props`
- Modify: all 11 csproj files (remove the now-centralized properties)
- Modify: `src/FoodDiary.API/FoodDiary.API.csproj` (documentation-file cleanup)

**Interfaces:**
- Consumes: the clean baseline from Task 5.
- Produces: `TargetFramework`, `LangVersion`, `Nullable`, `ImplicitUsings`, and warning policy are set once, solution-wide. Task 7 adds package centralization on top.

- [ ] **Step 1: Create `src/backend/Directory.Build.props`**

Placed next to `FoodDiary.sln`; MSBuild walks up from each project, so this covers all 11 projects under `src/` and `tests/`.

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

`WarningsNotAsErrors` is deliberate: NuGet advisory and compatibility warnings stay warnings so that a future framework bump or a newly-published CVE on a transitive package does not hard-block the build. Compiler (`CS*`) warnings are errors.

- [ ] **Step 2: Remove the centralized properties from all 11 csproj files**

Delete every `<TargetFramework>`, `<LangVersion>`, `<Nullable>`, and `<ImplicitUsings>` element from:

```
src/FoodDiary.API/FoodDiary.API.csproj
src/FoodDiary.Application/FoodDiary.Application.csproj
src/FoodDiary.Configuration/FoodDiary.Configuration.csproj
src/FoodDiary.Constants/FoodDiary.Constants.csproj
src/FoodDiary.Contracts/FoodDiary.Contracts.csproj
src/FoodDiary.Domain/FoodDiary.Domain.csproj
src/FoodDiary.Infrastructure/FoodDiary.Infrastructure.csproj
src/FoodDiary.Integrations.OpenAI/FoodDiary.Integrations.OpenAI.csproj
src/FoodDiary.Migrator/FoodDiary.Migrator.csproj
tests/FoodDiary.ComponentTests/FoodDiary.ComponentTests.csproj
tests/FoodDiary.UnitTests/FoodDiary.UnitTests.csproj
```

**Keep** these project-specific properties where they already appear:
- `UserSecretsId` — API, Migrator
- `OutputType` — Migrator
- `RootNamespace` — Constants
- `IsPackable` — both test projects

If removing the properties leaves an empty `<PropertyGroup></PropertyGroup>`, delete the element entirely. `FoodDiary.Constants.csproj` and `FoodDiary.Domain.csproj` may end up with no `PropertyGroup` at all — that is fine.

- [ ] **Step 3: Fix the documentation-file configuration in `FoodDiary.API.csproj`**

The two configuration-conditioned `PropertyGroup`s each declare `<DocumentationFile>` twice, so the first value is silently discarded, and both hardcode `net8.0` in a path that no props file can reach. Replace both blocks with a single unconditioned group:

```xml
  <!--Xml docs are located in bin and project folders for correct work in both debug and container-->
  <PropertyGroup>
    <DocumentationFile>FoodDiary.API.xml</DocumentationFile>
    <NoWarn>1701;1702;1591</NoWarn>
  </PropertyGroup>
```

The removed `bin\Debug\net8.0\FoodDiary.API.xml` value was the dead one — it was overwritten by the plain `FoodDiary.API.xml` line immediately after it in both Debug and Release, so this preserves the effective behavior while dropping the hardcoded framework moniker. The build already copies the XML into `bin` alongside the assembly.

- [ ] **Step 4: Verify the build**

```bash
dotnet build FoodDiary.sln --no-incremental
```

Expected: **0 warnings, 0 errors.** Because `TreatWarningsAsErrors` is now active, any `CS*` warning fails the build outright.

- [ ] **Step 5: Confirm the properties actually applied**

Guard against a props file that is silently not being picked up:

```bash
dotnet msbuild src/FoodDiary.Domain/FoodDiary.Domain.csproj -getProperty:TargetFramework -getProperty:Nullable -getProperty:ImplicitUsings
```

Expected: `net8.0`, `enable`, `enable`. `FoodDiary.Domain` is the right probe because it previously set none of these.

- [ ] **Step 6: Run the tests**

```bash
dotnet test tests/FoodDiary.UnitTests
dotnet test tests/FoodDiary.ComponentTests
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/backend/Directory.Build.props src/backend/src src/backend/tests
git commit -m "Centralize shared MSBuild properties in Directory.Build.props

Target framework, language version, and nullable settings now live in one
file instead of eleven, so a framework bump edits a single line.

Enables TreatWarningsAsErrors for compiler warnings while leaving NuGet
advisory warnings as warnings, so a future framework bump or a new CVE on a
transitive package does not hard-block the build.

Also drops a hardcoded net8.0 path and a duplicated DocumentationFile
element from the API project."
```

---

## Task 7: Directory.Packages.props

Central Package Management is all-or-nothing per solution: with `ManagePackageVersionsCentrally` enabled, any surviving `Version` attribute raises `NU1008`. Creating the file and stripping all 45 version attributes must therefore land together.

**Files:**
- Create: `src/backend/Directory.Packages.props`
- Modify: the 9 csproj files that contain `PackageReference` elements (all except `FoodDiary.Constants`, which has none)

**Interfaces:**
- Consumes: `Directory.Build.props` from Task 6.
- Produces: all package versions centralized. Adding a package now requires a `PackageVersion` entry here plus a version-less `PackageReference` in the consuming project.

- [ ] **Step 1: Create `src/backend/Directory.Packages.props`**

Verified complete and conflict-free: 45 packages, 0 version disagreements across the solution. Versions are copied verbatim from the current csproj files — nothing is upgraded here.

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
    <PackageVersion Include="JetBrains.Annotations" Version="2023.3.0" />
    <PackageVersion Include="LightBDD.XUnit2" Version="3.7.0" />
    <PackageVersion Include="MbDotNet" Version="5.0.0" />
    <PackageVersion Include="MediatR" Version="10.0.1" />
    <PackageVersion Include="MediatR.Extensions.Microsoft.DependencyInjection" Version="10.0.1" />
    <PackageVersion Include="Microsoft.AspNetCore.Authentication.Abstractions" Version="2.2.0" />
    <PackageVersion Include="Microsoft.AspNetCore.Authentication.Google" Version="8.0.12" />
    <PackageVersion Include="Microsoft.AspNetCore.DataProtection.EntityFrameworkCore" Version="8.0.11" />
    <PackageVersion Include="Microsoft.AspNetCore.Mvc.Testing" Version="8.0.12" />
    <PackageVersion Include="Microsoft.AspNetCore.SpaServices.Extensions" Version="8.0.12" />
    <PackageVersion Include="Microsoft.EntityFrameworkCore" Version="8.0.11" />
    <PackageVersion Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.11" />
    <PackageVersion Include="Microsoft.Extensions.AI" Version="9.7.1" />
    <PackageVersion Include="Microsoft.Extensions.AI.Abstractions" Version="9.7.1" />
    <PackageVersion Include="Microsoft.Extensions.AI.OpenAI" Version="9.7.1-preview.1.25365.4" />
    <PackageVersion Include="Microsoft.Extensions.Configuration" Version="8.0.0" />
    <PackageVersion Include="Microsoft.Extensions.Configuration.Abstractions" Version="8.0.0" />
    <PackageVersion Include="Microsoft.Extensions.Configuration.EnvironmentVariables" Version="8.0.0" />
    <PackageVersion Include="Microsoft.Extensions.Configuration.FileExtensions" Version="8.0.1" />
    <PackageVersion Include="Microsoft.Extensions.Configuration.Json" Version="8.0.1" />
    <PackageVersion Include="Microsoft.Extensions.Configuration.UserSecrets" Version="8.0.1" />
    <PackageVersion Include="Microsoft.Extensions.DependencyInjection" Version="9.0.3" />
    <PackageVersion Include="Microsoft.Extensions.DependencyInjection.Abstractions" Version="9.0.3" />
    <PackageVersion Include="Microsoft.Extensions.Hosting.Abstractions" Version="8.0.1" />
    <PackageVersion Include="Microsoft.Extensions.Http" Version="8.0.1" />
    <PackageVersion Include="Microsoft.Extensions.Logging" Version="8.0.1" />
    <PackageVersion Include="Microsoft.Extensions.Logging.Console" Version="8.0.1" />
    <PackageVersion Include="Microsoft.Extensions.Options.ConfigurationExtensions" Version="8.0.0" />
    <PackageVersion Include="Microsoft.NET.Test.Sdk" Version="17.8.0" />
    <PackageVersion Include="Moq" Version="4.20.72" />
    <PackageVersion Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.11" />
    <PackageVersion Include="Polly.Core" Version="8.5.2" />
    <PackageVersion Include="Serilog.AspNetCore" Version="8.0.3" />
    <PackageVersion Include="Swashbuckle.AspNetCore" Version="6.5.0" />
    <PackageVersion Include="System.ComponentModel.Annotations" Version="5.0.0" />
    <PackageVersion Include="System.Text.Json" Version="9.0.3" />
    <PackageVersion Include="Testcontainers" Version="3.6.0" />
    <PackageVersion Include="Testcontainers.PostgreSql" Version="3.6.0" />
    <PackageVersion Include="coverlet.collector" Version="6.0.4" />
    <PackageVersion Include="xunit" Version="2.6.6" />
    <PackageVersion Include="xunit.runner.visualstudio" Version="2.5.8" />
  </ItemGroup>
</Project>
```

- [ ] **Step 2: Strip every `Version` attribute from every `PackageReference`**

In all 9 csproj files containing package references, remove only the `Version="..."` attribute, keeping `Include` and all child metadata.

Self-closing references become:
```xml
    <PackageReference Include="MediatR" />
```

References with child metadata keep it — this metadata is per-project, not per-version, and must **not** move into `Directory.Packages.props`:
```xml
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design">
      <PrivateAssets>all</PrivateAssets>
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
    </PackageReference>
```

Verify none were missed:
```bash
grep -rn 'PackageReference.*Version=' src tests
```
Expected: **no output.**

- [ ] **Step 3: Restore and confirm the package graph is unchanged**

This is the proof that the migration is a true no-op:

```bash
dotnet restore FoodDiary.sln
find . -name project.assets.json -path '*/obj/*' -exec grep -ho '"[^"]*/[0-9][^"]*": {' {} \; \
  | sort -u > /tmp/packages-after.txt
diff /tmp/packages-before.txt /tmp/packages-after.txt && echo "IDENTICAL PACKAGE GRAPH"
```

Expected: `IDENTICAL PACKAGE GRAPH`. Any difference means a version was transcribed incorrectly — fix it before continuing.

- [ ] **Step 4: Verify the build**

```bash
dotnet build FoodDiary.sln --no-incremental
```

Expected: **0 warnings, 0 errors.** In particular, no `NU1008` (a `Version` attribute survived somewhere).

- [ ] **Step 5: Run the tests**

```bash
dotnet test tests/FoodDiary.UnitTests
dotnet test tests/FoodDiary.ComponentTests
```

Expected: all pass.

- [ ] **Step 6: Verify the Docker build still works**

The Dockerfile runs `dotnet publish` from `src/backend`, so it must pick up both new props files:

```bash
docker build -t fooddiary-cpm-check .
```

Run from the repository root. Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add src/backend/Directory.Packages.props src/backend/src src/backend/tests
git commit -m "Adopt central package management for the backend solution

All 45 package versions now live in Directory.Packages.props, so bumping a
package shared across projects edits one line instead of one per consumer.

Version-neutral: the resolved package graph is byte-identical before and
after, verified by diffing project.assets.json across all projects."
```

---

## Task 8: Document the conventions

Required by `.claude/rules/coding.md`: documentation must not contradict actual build behavior. A contributor adding a package will otherwise hit `NU1008` with no explanation.

**Files:**
- Modify: `CLAUDE.md` (repository root)
- Modify: `README.md` (repository root) — only if it documents backend build or dependency steps

**Interfaces:**
- Consumes: the completed state of Tasks 6–7.
- Produces: documentation matching the new build configuration.

- [ ] **Step 1: Read the current backend documentation**

```bash
grep -n "backend\|dotnet\|csproj\|package" CLAUDE.md README.md
```

Identify the "Backend" section of `CLAUDE.md` and any backend dependency instructions in `README.md`.

- [ ] **Step 2: Add a build-configuration subsection to `CLAUDE.md`**

Add to the backend portion of `CLAUDE.md`, adapting the surrounding heading level and tone to match the existing document:

```markdown
### Build configuration

Shared MSBuild settings live in `src/backend/Directory.Build.props` — target
framework, language version, nullable, and warning policy. Do not set these in
individual csproj files. Bumping the target framework is a one-line edit there
(plus `global.json`, the `Dockerfile`, and the `dotnet-version` entries in
`.github/workflows/`, which MSBuild cannot reach).

Package versions are centrally managed in `src/backend/Directory.Packages.props`.
To add a package: add a `<PackageVersion Include="..." Version="..." />` there,
then reference it **without a version** in the consuming csproj:

    <PackageReference Include="SomePackage" />

A `Version` attribute on a `PackageReference` fails the build with `NU1008`.

Compiler warnings are errors (`TreatWarningsAsErrors`). NuGet advisory warnings
(`NU19xx`) are deliberately left as warnings so a new CVE on a transitive
package does not block the build.
```

- [ ] **Step 3: Update `README.md` if needed**

Only if `README.md` documents adding backend dependencies or the backend build. If it does not mention these, make no change — do not invent a section.

- [ ] **Step 4: Verify the documented `NU1008` claim**

Do not document build behavior you have not observed. Temporarily reintroduce a version attribute in `src/FoodDiary.Infrastructure/FoodDiary.Infrastructure.csproj`:

```xml
    <PackageReference Include="Microsoft.EntityFrameworkCore" Version="8.0.11" />
```

Then run:

```bash
dotnet restore FoodDiary.sln
```

Expected: restore fails with `NU1008`. If it does not, correct the claim in `CLAUDE.md` to match what actually happens.

Revert the attribute and confirm a clean restore:

```bash
dotnet restore FoodDiary.sln
git diff --exit-code src/FoodDiary.Infrastructure/FoodDiary.Infrastructure.csproj
```

Expected: restore succeeds and `git diff` reports no changes.

- [ ] **Step 5: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "Document central package management conventions

Records where shared MSBuild properties and package versions live, and how to
add a package without tripping NU1008."
```

---

## Definition of done

- [ ] `dotnet build FoodDiary.sln --no-incremental` → 0 warnings, 0 errors
- [ ] `dotnet test tests/FoodDiary.UnitTests` → all pass
- [ ] `dotnet test tests/FoodDiary.ComponentTests` → all pass
- [ ] Resolved package graph identical to the pre-migration baseline
- [ ] A probe EF migration generates empty; `FoodDiaryContextModelSnapshot.cs` unchanged
- [ ] `docker build` succeeds
- [ ] No `null!` anywhere in the diff — `grep -rn 'null!' src/backend/src src/backend/tests` returns only pre-existing occurrences, if any
- [ ] `grep -rn 'PackageReference.*Version=' src/backend` returns nothing
- [ ] Changing `<TargetFramework>` in `Directory.Build.props` alone retargets all 11 projects

## Known limitations

A framework bump still requires editing four things the props files cannot reach:

- `src/backend/global.json` — SDK version
- `Dockerfile` — `mcr.microsoft.com/dotnet/sdk:8.0` and `mcr.microsoft.com/dotnet/aspnet:8.0`
- `.github/workflows/build.yml` — two `dotnet-version: 8.0.405` entries
- `.github/workflows/deploy.yml` — one `dotnet-version: 8.0.405` entry

This is out of scope by decision, not oversight. Consolidating them (for example, deriving the CI version from `global.json` via `actions/setup-dotnet`'s `global-json-file` input) is worth a follow-up.
