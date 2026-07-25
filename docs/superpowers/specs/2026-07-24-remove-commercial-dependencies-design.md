# Remove AutoMapper, MediatR, and FluentAssertions

**Date:** 2026-07-24
**Branch:** `remove-commercial-dependencies`

## Motivation

AutoMapper, MediatR, and FluentAssertions have moved to commercial licensing. This
project is open source, so the goal is to drop all three:

- **Fewer dependencies.** Remove the packages and their transitive weight.
- **Fix the AutoMapper CVE by removal.** No package, no CVE.
- **More explicit code.** Prefer build-time checks over runtime resolution/failures:
  explicit handler classes and hand-written mappings instead of reflection-driven
  dispatch and object mapping.

Behavior is preserved end-to-end: no endpoint, contract, or response shape changes.

## Chosen approach

Each of the three replacements follows a pattern that already exists in the codebase:

- **AutoMapper → hand-written mapping extensions** in the established `ToXxx()` style
  (`ProductsMappingExtensions`, `CategoriesServiceMapper`, `SuggestNutritionMappingExtensions`).
- **MediatR → cohesive command/query handlers**, following
  `FoodDiary.Application.Notes.{Create,Get,Update,Recognize}`: a `Command`/`Query`
  record + a `Result` union for fallible operations + a plain handler class with
  `Handle(input, ct)`, registered with `AddScoped<Handler>()` and injected into
  controller actions via `[FromServices]`. The multi-step orchestration currently in
  controllers moves **into** the handlers (the "consolidate" option, not a mechanical
  1:1 swap).
- **FluentAssertions → AwesomeAssertions** (latest v9+), a community Apache-2.0 fork.
  v9+ renames the namespace `FluentAssertions` → `AwesomeAssertions`.

Naming follows the Notes example: `Query`/`Command` inputs, `Result` unions,
`...QueryHandler`/`...CommandHandler` classes.

## Part 1 — FluentAssertions → AwesomeAssertions

Isolated from the rest; can land first.

- `src/backend/Directory.Packages.props`: replace
  `<PackageVersion Include="FluentAssertions" Version="6.12.2" />` with
  `<PackageVersion Include="AwesomeAssertions" Version="9.5.0" />` (latest stable at time
  of writing; confirm/bump when implementing).
- `tests/FoodDiary.UnitTests/FoodDiary.UnitTests.csproj` and
  `tests/FoodDiary.ComponentTests/FoodDiary.ComponentTests.csproj`: change
  `<PackageReference Include="FluentAssertions" />` → `AwesomeAssertions`.
- Namespace rename (v9+):
  - `tests/FoodDiary.ComponentTests/Usings.cs`: `global using FluentAssertions;` →
    `global using AwesomeAssertions;`
  - The 5 UnitTests files with an explicit `using FluentAssertions;`:
    `Notes/Recognize/RecognizeNoteCommandHandlerTests.cs`,
    `Notes/Recognize/SuggestNutritionMappingExtensionsTests.cs`,
    `Utils/NotesOrderCalculatorTests.cs`, `Utils/CaloriesCalculatorTests.cs`,
    `Products/SuggestNutrition/SuggestNutritionCommandHandlerTests.cs`.
  - `.Should()` call sites are unchanged (they resolve through the usings).

The API surface is otherwise identical. Any minor FluentAssertions 6 → v9 (FA8-based)
differences will surface at build/test time and be fixed in place.

## Part 2 — AutoMapper → mapping extensions

Consolidation (Part 3) absorbs most AutoMapper usage:

- The two in-place `_mapper.Map(dto, entity)` updates become field assignments inside
  `UpdateProductCommand` / `UpdateCategoryCommand` handlers.
- `_mapper.Map<Category>(dto)` on create becomes `new Category { ... }` inside
  `CreateCategoryCommand`.
- The `CreateMap<Category, CategoryAutocompleteItemDto>()` mapping is already **dead**
  (autocomplete uses the hand-written `ToCategoryAutocompleteItemDto()`), so it is
  simply removed.

That leaves two read-projection mappings, written as `ToXxx()` extensions in the API
layer (where the DTOs live):

- `Product.ToProductItemDto()` → `ProductItemDto` with `CategoryName = Category.Name`.
- `Category.ToCategoryItemDto()` → `CategoryItemDto` with `CountProducts = Products.Count`.

Placement: alongside existing API mapping extensions (e.g. a `CategoriesMappingExtensions`
mirroring `ProductsMappingExtensions`, or added to the existing file). Then delete
`src/FoodDiary.API/AutoMapperProfile.cs` and remove `services.AddAutoMapper(...)` from
`Startup.cs`.

## Part 3 — MediatR → consolidated command/query handlers

### Endpoint → handler mapping

| Endpoint | New handler (namespace) | Result union |
|---|---|---|
| `GET /categories` | `GetCategoriesQuery` (`Categories.Get`) | returns entities; controller maps via `ToCategoryItemDto()` |
| `POST /categories` | `CreateCategoryCommand` (`Categories.Create`) | `Success(Category)` / `NameAlreadyExists` |
| `PUT /categories/{id}` | `UpdateCategoryCommand` (`Categories.Update`) | `Success` / `NotFound` / `NameAlreadyExists` |
| `DELETE /categories/{id}` | `DeleteCategoryCommand` (`Categories.Delete`) | `Success` / `NotFound` |
| `GET /products` | `GetProductsQuery` (`Products.Get`) | returns entities + total count; controller maps via `ToProductItemDto()` |
| `POST /products` | `CreateProductCommand` (rename of existing `CreateProductRequest`) | `CreateProductResult`: `Success(Product)` / `ProductAlreadyExists` |
| `PUT /products/{id}` | `UpdateProductCommand` (`Products.Update`) | `Success` / `NotFound` / `NameAlreadyExists` |
| `DELETE /products/{id}` | `DeleteProductCommand` (`Products.Delete`) | `Success` / `NotFound` |
| `DELETE /products/batch` | `DeleteProductsCommand` (`Products.Delete`) | `Success` |
| `DELETE /notes/{id}` | `DeleteNoteCommand` (`Notes.Delete`) | `Success` / `NotFound` |
| `DELETE /notes/batch` | `DeleteNotesCommand` (`Notes.Delete`) | `Success` |
| `GET /auth/status` | `GetAuthStatusQuery` + `GetAuthStatusQueryHandler` (rename of `GetStatusRequest`/handler) | existing `Authenticated` / `NotAuthenticated` union (renamed `GetAuthStatusResult`) |

**Unchanged — already the target pattern:**
`GET /notes`, `GET /notes/history`, `POST /notes`, `PUT /notes/{id}`,
`POST /notes/recognitions`, `GET /products/{id}`, `GET /products/autocomplete`,
`POST /products/nutrition/suggestions`, `GET /categories/autocomplete`.

### Handler structure

- Command/Query input records and their `Result` unions are co-located with the
  handler (one file per operation, matching Notes' `CreateNoteCommandHandler.cs`).
- Handlers keep using the **same repositories** the old handlers used — v1
  `IProductRepository` / `ICategoryRepository` / `INoteRepository` (methods:
  `GetByIdAsync`, `GetQuery`, `GetQueryWithoutTracking`, `GetByQueryAsync`, `Add`,
  `Update`, `Remove`, `RemoveRange`, `UnitOfWork.SaveChangesAsync`,
  `CountByQueryAsync`, `LoadCategory`, `LoadProducts`). This change removes MediatR,
  **not** the repository layer.
- Fetch-then-act flows that controllers used to orchestrate (get-by-id → check →
  edit/delete) now happen inside the corresponding command handler.

### Behavior to preserve exactly

- **Update name-conflict rule:** reject only when the name *changed* AND another row
  already has that name (current logic:
  `productHasChanges && productsWithTheSameName.Any()`). Same for categories.
- **Create name-conflict rule:** reject when a row with that exact name exists.
- **Note-delete display-order recalculation:** `DeleteNoteCommand` and
  `DeleteNotesCommand` must fetch the target note(s), recalculate display orders of the
  remaining notes in the same `(Date, MealType)` group via `INotesOrderCalculator`, then
  remove — exactly as `DeleteNoteRequestHandler` / `DeleteNotesRequestHandler` do today.
- **Single `SaveChanges` per command.**
- **`GET /products` flags:** the controller always sets `LoadCategory = true` and
  `CalculateTotalProductsCount = true`; the consolidated handler preserves that.

### Intentional edge-case change

`DELETE /notes/batch` with an empty id list currently throws
`InvalidOperationException` (`.First()` on an empty sequence inside
`DeleteNotesRequestHandler`). `DeleteNotesCommand` will short-circuit to `Success`
(no-op) when no matching notes are found. This is a safe improvement, explicitly
called out here.

## Part 4 — DI, controllers, removed artifacts

### Dependency injection

- Remove `services.AddMediatR(...)` (in `Application/Extensions/ServiceCollectionExtensions.cs`)
  and `services.AddAutoMapper(...)` (in `Startup.cs`).
- Register every new handler explicitly with `AddScoped<Handler>()`, grouped by feature:
  extend `AddNotes` / `AddProducts`, add `AddCategories` and `AddAuth`.

### Controllers

- `ProductsController`, `CategoriesController`: drop `IMapper`, `IMediator`, and their
  constructors; inject handlers per-action via `[FromServices]`; map with the `ToXxx()`
  extensions.
- `NotesController`: drop `IMediator` (only the delete endpoints still used it); inject
  `DeleteNoteCommandHandler` / `DeleteNotesCommandHandler`.
- `AuthController`: drop `ISender`; inject `GetAuthStatusQueryHandler`.
- Remove the `using CreateProductResponse = FoodDiary.Application.Products.Create.CreateProductResponse;`
  alias in `ProductsController` — renaming the Application union to `CreateProductResult`
  removes the clash with `FoodDiary.Contracts.Products.CreateProductResponse`.

### Files to delete

- `src/FoodDiary.Application/Abstractions/` — all 6 base request classes
  (`GetEntityByIdRequest`, `CreateEntityRequest`, `EditEntityRequest`,
  `DeleteEntityRequest`, `DeleteManyEntitiesRequest`, `GetEntitiesByIdsRequest`).
- `src/FoodDiary.Application/{Products,Categories,Notes}/Requests/` and
  `.../Handlers/` files that are consolidated into the new command/query handlers.
- `src/FoodDiary.Application/Notes/Requests/EditNoteRequest.cs` and
  `Notes/Handlers/EditNoteRequestHandler.cs` — **dead code** (the Update endpoint
  already uses `UpdateNoteCommandHandler`).
- `src/FoodDiary.API/AutoMapperProfile.cs`.
- Package versions/references for `MediatR`, `MediatR.Extensions.Microsoft.DependencyInjection`,
  `AutoMapper.Extensions.Microsoft.DependencyInjection`, and `FluentAssertions`.

## Part 5 — Testing

- **Component tests** (`FoodDiary.ComponentTests`) — one happy-path per endpoint per the
  project rule — are the primary safety net for the consolidation and must stay green.
  They require Docker (Testcontainers); confirm Docker availability before running, and
  stop and ask if it is unavailable.
- **New unit tests** for the fallible command handlers, covering the branch outcomes now
  first-class in the Application layer:
  - `CreateProductCommand` / `CreateCategoryCommand`: `AlreadyExists` branch.
  - `UpdateProductCommand` / `UpdateCategoryCommand`: `NotFound` and `NameAlreadyExists`
    branches (including the "name unchanged → allowed even if a same-name row exists"
    case).
  - `DeleteProductCommand` / `DeleteCategoryCommand` / `DeleteNoteCommand`: `NotFound`
    branch.
  - `DeleteNoteCommand` / `DeleteNotesCommand`: display-order recalculation invoked.
- **Gate:** `dotnet build` (warnings-as-errors) and `dotnet test` both green.

## Risks

- **FluentAssertions 6 → AwesomeAssertions v9 (FA8-based) API drift.** Low risk given the
  basic assertions used; caught at build/test time.
- **Behavior regressions in consolidated handlers.** Mitigated by preserving repository
  calls verbatim, the explicit behavior-preservation list above, and component-test
  coverage.
- **DI registration gaps.** With MediatR's assembly scan gone, a missing
  `AddScoped<Handler>()` becomes a startup/DI failure. Component tests exercise every
  endpoint, so a missing registration fails a test rather than shipping.

## Out of scope

- Repository v1 → v2 migration.
- Controller → minimal-API conversion.
- Any endpoint, contract, or response-shape changes.
- `README.md` / `CLAUDE.md` changes (no env vars, tooling, or major-version changes).
