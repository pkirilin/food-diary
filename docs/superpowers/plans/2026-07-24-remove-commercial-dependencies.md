# Remove AutoMapper, MediatR, FluentAssertions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Drop the three now-commercial packages (AutoMapper, MediatR, FluentAssertions) from the .NET backend by replacing them with hand-written mapping extensions, explicit command/query handlers, and the Apache-2.0 AwesomeAssertions fork — preserving every endpoint, contract, and response shape.

**Architecture:** MediatR `IRequest`/`IMediator` dispatch is replaced by plain handler classes (`Command`/`Query` record input + `Result` union output + `Handle(input, ct)` method), registered with `AddScoped<Handler>()` and injected per-action via `[FromServices]`, following the existing `FoodDiary.Application.Notes.{Create,Update}` pattern. Multi-step fetch-then-act orchestration that currently lives in controllers moves *into* the handlers. AutoMapper profiles are replaced by the `ToXxx()` extension methods that already exist in `FoodDiary.API/Mapping/`. FluentAssertions is swapped for the drop-in AwesomeAssertions fork.

**Tech Stack:** .NET 10, C# (nullable enabled), xUnit + Moq + AwesomeAssertions, EF Core (PostgreSQL), LightBDD component tests (Testcontainers).

## Global Constraints

Every task's requirements implicitly include these:

- **Working directory** for all `dotnet`/`git` commands is `src/backend/` (the solution root, `FoodDiary.slnx`).
- **Warnings are errors** (`TreatWarningsAsErrors`, only `NU1701` exempt). A leftover `using MediatR;` / `using AutoMapper;` after the package is gone becomes `CS0246` — a build failure. Remove now-unused usings as you edit each file.
- **Central package management**: package *versions* live only in `src/backend/Directory.Packages.props`; a `Version=` attribute on a `<PackageReference>` fails the build with `NU1008`. Reference packages without a version in csproj.
- **Behavior is preserved end-to-end** — no endpoint, contract, or response-shape change. The two exceptions, both intentional and called out in-place: (1) `DELETE /notes/batch` with an empty/no-match id list short-circuits to `Success` instead of throwing; (2) `Product` nutrition properties change from `init` to `set` (enables hand-written edit assignment; behavior-equivalent to the AutoMapper edit).
- **API contract types keep identical names across backend and frontend.** This change renames only *internal* Application types; the public `FoodDiary.Contracts.Products.CreateProductResponse(int Id)` is untouched.
- **Component tests require Docker** (Testcontainers). Before running `dotnet test` on `FoodDiary.ComponentTests` (or the full suite), confirm the Docker daemon is available. **If Docker is not available, STOP and ask the user how to proceed** — never skip the component tests or substitute a non-Docker path. `FoodDiary.UnitTests` needs no Docker.
- **New handlers keep using the same repositories the old handlers used** — v1 `IProductRepository` / `ICategoryRepository` / `INoteRepository` (from `FoodDiary.Domain.Repositories`), except `CreateProductCommandHandler`, which keeps the v2 `IProductsRepository` (`FoodDiary.Domain.Repositories.v2`) the current create handler already uses. This change removes MediatR, **not** the repository layer.
- **All new command/query/result records and handler classes are `public`** (Application types injected into the API project must be visible to it).

---

## File Structure

**Created — Application handlers** (one file per operation; `Command`/`Query` + `Result` + handler co-located):
- `src/FoodDiary.Application/Categories/Get/GetCategoriesQueryHandler.cs`
- `src/FoodDiary.Application/Categories/Create/CreateCategoryCommandHandler.cs`
- `src/FoodDiary.Application/Categories/Update/UpdateCategoryCommandHandler.cs`
- `src/FoodDiary.Application/Categories/Delete/DeleteCategoryCommandHandler.cs`
- `src/FoodDiary.Application/Products/Get/GetProductsQueryHandler.cs`
- `src/FoodDiary.Application/Products/Create/CreateProductCommandHandler.cs` (replaces `CreateProductRequestHandler.cs`)
- `src/FoodDiary.Application/Products/Update/UpdateProductCommandHandler.cs`
- `src/FoodDiary.Application/Products/Delete/DeleteProductCommandHandler.cs`
- `src/FoodDiary.Application/Products/Delete/DeleteProductsCommandHandler.cs`
- `src/FoodDiary.Application/Notes/Delete/DeleteNoteCommandHandler.cs`
- `src/FoodDiary.Application/Notes/Delete/DeleteNotesCommandHandler.cs`
- `src/FoodDiary.Application/Auth/GetStatus/GetAuthStatusQueryHandler.cs` (replaces `GetStatusRequestHandler.cs`)

**Created — unit tests:**
- `tests/FoodDiary.UnitTests/Categories/Create/CreateCategoryCommandHandlerTests.cs`
- `tests/FoodDiary.UnitTests/Categories/Update/UpdateCategoryCommandHandlerTests.cs`
- `tests/FoodDiary.UnitTests/Categories/Delete/DeleteCategoryCommandHandlerTests.cs`
- `tests/FoodDiary.UnitTests/Products/Create/CreateProductCommandHandlerTests.cs`
- `tests/FoodDiary.UnitTests/Products/Update/UpdateProductCommandHandlerTests.cs`
- `tests/FoodDiary.UnitTests/Products/Delete/DeleteProductCommandHandlerTests.cs`
- `tests/FoodDiary.UnitTests/Notes/Delete/DeleteNoteCommandHandlerTests.cs`
- `tests/FoodDiary.UnitTests/Notes/Delete/DeleteNotesCommandHandlerTests.cs`

**Modified:**
- `Directory.Packages.props` — FluentAssertions→AwesomeAssertions (Task 1); remove MediatR ×2 + AutoMapper.Extensions (Task 6)
- `tests/FoodDiary.UnitTests/FoodDiary.UnitTests.csproj`, `tests/FoodDiary.ComponentTests/FoodDiary.ComponentTests.csproj`, `tests/FoodDiary.ComponentTests/Usings.cs`, and 5 UnitTests files — namespace swap (Task 1)
- `src/FoodDiary.Application/Extensions/ServiceCollectionExtensions.cs` — add handler registrations (Tasks 2–5); drop `AddMediatR` (Task 6)
- `src/FoodDiary.API/Controllers/v1/CategoriesController.cs` (Task 2), `ProductsController.cs` (Task 3), `NotesController.cs` (Task 4), `AuthController.cs` (Task 5)
- `src/FoodDiary.Domain/Entities/Product.cs` — nutrition `init`→`set` (Task 3)
- `src/FoodDiary.API/Startup.cs` — drop `AddAutoMapper` (Task 6)
- `src/FoodDiary.API/FoodDiary.API.csproj`, `src/FoodDiary.Application/FoodDiary.Application.csproj` — drop package refs (Task 6)

**Deleted:** old `Requests/` + `Handlers/` files per feature (within each feature task), plus the shared `Abstractions/` (6), `AutoMapperProfile.cs`, and `Application/Models/ProductsSearchResult.cs` — full list in Tasks 2–6.

---

## Reference: verification commands

- Build (warnings-as-errors): `dotnet build`
- Unit tests only (no Docker): `dotnet test tests/FoodDiary.UnitTests`
- One unit test class: `dotnet test tests/FoodDiary.UnitTests --filter "FullyQualifiedName~CreateCategoryCommandHandlerTests"`
- Component tests (Docker required — confirm first): `dotnet test tests/FoodDiary.ComponentTests`
- Full suite: `dotnet test`

---

## Task 1: FluentAssertions → AwesomeAssertions

Isolated package + namespace swap. Lands first, independent of everything else.

**Files:**
- Modify: `Directory.Packages.props`
- Modify: `tests/FoodDiary.UnitTests/FoodDiary.UnitTests.csproj`
- Modify: `tests/FoodDiary.ComponentTests/FoodDiary.ComponentTests.csproj`
- Modify: `tests/FoodDiary.ComponentTests/Usings.cs`
- Modify: `tests/FoodDiary.UnitTests/Notes/Recognize/RecognizeNoteCommandHandlerTests.cs`
- Modify: `tests/FoodDiary.UnitTests/Notes/Recognize/SuggestNutritionMappingExtensionsTests.cs`
- Modify: `tests/FoodDiary.UnitTests/Products/SuggestNutrition/SuggestNutritionCommandHandlerTests.cs`
- Modify: `tests/FoodDiary.UnitTests/Utils/CaloriesCalculatorTests.cs`
- Modify: `tests/FoodDiary.UnitTests/Utils/NotesOrderCalculatorTests.cs`

**Interfaces:**
- Consumes: nothing.
- Produces: `AwesomeAssertions` namespace available to all test projects (later tasks' new unit tests `using AwesomeAssertions;`).

- [ ] **Step 1: Confirm the latest AwesomeAssertions stable version.**

Run: `curl -s "https://api.nuget.org/v3-flatcontainer/awesomeassertions/index.json" | tail -c 200`
Expected: a JSON version list ending in `"9.5.0"` (or newer). Use the highest stable `9.x` in the next step. This plan assumes **9.5.0**.

- [ ] **Step 2: Swap the package version in `Directory.Packages.props`.**

Replace:
```xml
    <PackageVersion Include="FluentAssertions" Version="6.12.2" />
```
with:
```xml
    <PackageVersion Include="AwesomeAssertions" Version="9.5.0" />
```

- [ ] **Step 3: Point both test csproj references at the new package.**

In `tests/FoodDiary.UnitTests/FoodDiary.UnitTests.csproj` and `tests/FoodDiary.ComponentTests/FoodDiary.ComponentTests.csproj`, change:
```xml
    <PackageReference Include="FluentAssertions" />
```
to:
```xml
    <PackageReference Include="AwesomeAssertions" />
```

- [ ] **Step 4: Rename the ComponentTests global using.**

In `tests/FoodDiary.ComponentTests/Usings.cs`, change `global using FluentAssertions;` to `global using AwesomeAssertions;`.

- [ ] **Step 5: Rename the 5 explicit usings in UnitTests.**

In each of these files change `using FluentAssertions;` to `using AwesomeAssertions;`:
- `tests/FoodDiary.UnitTests/Notes/Recognize/RecognizeNoteCommandHandlerTests.cs`
- `tests/FoodDiary.UnitTests/Notes/Recognize/SuggestNutritionMappingExtensionsTests.cs`
- `tests/FoodDiary.UnitTests/Products/SuggestNutrition/SuggestNutritionCommandHandlerTests.cs`
- `tests/FoodDiary.UnitTests/Utils/CaloriesCalculatorTests.cs`
- `tests/FoodDiary.UnitTests/Utils/NotesOrderCalculatorTests.cs`

`.Should()` call sites are unchanged — they resolve through the renamed usings.

- [ ] **Step 6: Build and run the unit tests.**

Run: `dotnet build && dotnet test tests/FoodDiary.UnitTests`
Expected: build succeeds; all UnitTests pass. If any FluentAssertions-6 → AwesomeAssertions-9 API drift surfaces (unlikely given the basic `.Should().Be/BeOfType/BeNull/ContainInOrder` usage), fix it in place.

- [ ] **Step 7: Verify no FluentAssertions references remain in tracked source.**

Run: `git grep -n "FluentAssertions" -- '*.cs' '*.csproj' '*.props'`
Expected: no matches.

- [ ] **Step 8: Commit.**

```bash
git add Directory.Packages.props tests/
git commit -m "Replace FluentAssertions with AwesomeAssertions"
```

---

## Task 2: Categories → command/query handlers

Replace the four MediatR-backed category endpoints with explicit handlers; the create/update name-conflict logic moves from the controller into the handlers.

**Files:**
- Create: `src/FoodDiary.Application/Categories/Get/GetCategoriesQueryHandler.cs`
- Create: `src/FoodDiary.Application/Categories/Create/CreateCategoryCommandHandler.cs`
- Create: `src/FoodDiary.Application/Categories/Update/UpdateCategoryCommandHandler.cs`
- Create: `src/FoodDiary.Application/Categories/Delete/DeleteCategoryCommandHandler.cs`
- Create: `tests/FoodDiary.UnitTests/Categories/Create/CreateCategoryCommandHandlerTests.cs`
- Create: `tests/FoodDiary.UnitTests/Categories/Update/UpdateCategoryCommandHandlerTests.cs`
- Create: `tests/FoodDiary.UnitTests/Categories/Delete/DeleteCategoryCommandHandlerTests.cs`
- Modify: `src/FoodDiary.Application/Extensions/ServiceCollectionExtensions.cs`
- Modify: `src/FoodDiary.API/Controllers/v1/CategoriesController.cs`
- Delete: `src/FoodDiary.Application/Categories/Requests/{CreateCategoryRequest,DeleteCategoryRequest,EditCategoryRequest,GetCategoriesByExactNameRequest,GetCategoriesRequest,GetCategoryByIdRequest}.cs`
- Delete: `src/FoodDiary.Application/Categories/Handlers/{CreateCategoryRequestHandler,DeleteCategoryRequestHandler,EditCategoryRequestHandler,GetCategoriesByExactNameRequestHandler,GetCategoriesRequestHandler,GetCategoryByIdRequestHandler}.cs`

**Interfaces:**
- Consumes: v1 `ICategoryRepository` (`GetByIdAsync`, `GetQueryWithoutTracking`, `GetByQueryAsync`, `LoadProducts`, `Add`, `Update`, `Remove`, `UnitOfWork.SaveChangesAsync`); existing `Category.ToCategoryItemDto()` in `FoodDiary.API/Mapping/CategoriesMapper.cs`; existing `ICategoriesService.GetAutocompleteItemsAsync`.
- Produces:
  - `GetCategoriesQuery()` → `GetCategoriesQueryResult(IReadOnlyCollection<Category> Categories)` via `GetCategoriesQueryHandler.Handle`
  - `CreateCategoryCommand(string Name)` → `CreateCategoryResult` = `Success(Category Category)` | `NameAlreadyExists` via `CreateCategoryCommandHandler.Handle`
  - `UpdateCategoryCommand(int Id, string Name)` → `UpdateCategoryResult` = `Success` | `NotFound` | `NameAlreadyExists` via `UpdateCategoryCommandHandler.Handle`
  - `DeleteCategoryCommand(int Id)` → `DeleteCategoryResult` = `Success` | `NotFound` via `DeleteCategoryCommandHandler.Handle`
  - DI: `services.AddCategories()`

- [ ] **Step 1: Write the failing `CreateCategoryCommandHandler` unit tests.**

Create `tests/FoodDiary.UnitTests/Categories/Create/CreateCategoryCommandHandlerTests.cs`:
```csharp
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AwesomeAssertions;
using FoodDiary.Application.Categories.Create;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Categories.Create;

public class CreateCategoryCommandHandlerTests
{
    private readonly Mock<ICategoryRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public CreateCategoryCommandHandlerTests()
    {
        _repository.Setup(r => r.UnitOfWork).Returns(_unitOfWork.Object);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
    }

    private void GivenCategories(params Category[] categories)
    {
        _repository.Setup(r => r.GetQueryWithoutTracking()).Returns(categories.AsQueryable());
        _repository
            .Setup(r => r.GetByQueryAsync(It.IsAny<IQueryable<Category>>(), It.IsAny<CancellationToken>()))
            .Returns((IQueryable<Category> q, CancellationToken _) => Task.FromResult(q.ToList()));
    }

    [Fact]
    public async Task Handle_NameAlreadyExists_ReturnsNameAlreadyExists()
    {
        GivenCategories(new Category { Name = "Dairy" });
        var handler = new CreateCategoryCommandHandler(_repository.Object);

        var result = await handler.Handle(new CreateCategoryCommand("Dairy"), CancellationToken.None);

        result.Should().BeOfType<CreateCategoryResult.NameAlreadyExists>();
        _repository.Verify(r => r.Add(It.IsAny<Category>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NewName_AddsAndReturnsSuccess()
    {
        GivenCategories();
        _repository.Setup(r => r.Add(It.IsAny<Category>())).Returns((Category c) => c);
        var handler = new CreateCategoryCommandHandler(_repository.Object);

        var result = await handler.Handle(new CreateCategoryCommand("Dairy"), CancellationToken.None);

        result.Should().BeOfType<CreateCategoryResult.Success>()
            .Which.Category.Name.Should().Be("Dairy");
        _repository.Verify(r => r.Add(It.Is<Category>(c => c.Name == "Dairy")), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
```

- [ ] **Step 2: Run the test to confirm it fails to compile (type not defined).**

Run: `dotnet test tests/FoodDiary.UnitTests --filter "FullyQualifiedName~CreateCategoryCommandHandlerTests"`
Expected: build error — `CreateCategoryCommand` / `CreateCategoryCommandHandler` / `CreateCategoryResult` do not exist.

- [ ] **Step 3: Implement `CreateCategoryCommandHandler`.**

Create `src/FoodDiary.Application/Categories/Create/CreateCategoryCommandHandler.cs`:
```csharp
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Application.Categories.Create;

public record CreateCategoryCommand(string Name);

public abstract record CreateCategoryResult
{
    public record Success(Category Category) : CreateCategoryResult;

    public record NameAlreadyExists : CreateCategoryResult;
}

public class CreateCategoryCommandHandler(ICategoryRepository categoryRepository)
{
    public async Task<CreateCategoryResult> Handle(CreateCategoryCommand command, CancellationToken cancellationToken)
    {
        var query = categoryRepository.GetQueryWithoutTracking().Where(c => c.Name == command.Name);
        var categoriesWithSameName = await categoryRepository.GetByQueryAsync(query, cancellationToken);

        if (categoriesWithSameName.Count > 0)
        {
            return new CreateCategoryResult.NameAlreadyExists();
        }

        var category = categoryRepository.Add(new Category { Name = command.Name });
        await categoryRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return new CreateCategoryResult.Success(category);
    }
}
```

- [ ] **Step 4: Run the test to confirm it passes.**

Run: `dotnet test tests/FoodDiary.UnitTests --filter "FullyQualifiedName~CreateCategoryCommandHandlerTests"`
Expected: 2 passed.

- [ ] **Step 5: Write the failing `UpdateCategoryCommandHandler` unit tests.**

Create `tests/FoodDiary.UnitTests/Categories/Update/UpdateCategoryCommandHandlerTests.cs`:
```csharp
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AwesomeAssertions;
using FoodDiary.Application.Categories.Update;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Categories.Update;

public class UpdateCategoryCommandHandlerTests
{
    private readonly Mock<ICategoryRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public UpdateCategoryCommandHandlerTests()
    {
        _repository.Setup(r => r.UnitOfWork).Returns(_unitOfWork.Object);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
    }

    private void GivenExistingCategory(Category? category)
    {
        _repository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(category!);
    }

    private void GivenCategoriesWithName(params Category[] categories)
    {
        _repository.Setup(r => r.GetQueryWithoutTracking()).Returns(categories.AsQueryable());
        _repository
            .Setup(r => r.GetByQueryAsync(It.IsAny<IQueryable<Category>>(), It.IsAny<CancellationToken>()))
            .Returns((IQueryable<Category> q, CancellationToken _) => Task.FromResult(q.ToList()));
    }

    [Fact]
    public async Task Handle_CategoryNotFound_ReturnsNotFound()
    {
        GivenExistingCategory(null);
        GivenCategoriesWithName();
        var handler = new UpdateCategoryCommandHandler(_repository.Object);

        var result = await handler.Handle(new UpdateCategoryCommand(1, "Dairy"), CancellationToken.None);

        result.Should().BeOfType<UpdateCategoryResult.NotFound>();
        _repository.Verify(r => r.Update(It.IsAny<Category>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NameChangedToExistingName_ReturnsNameAlreadyExists()
    {
        GivenExistingCategory(new Category { Id = 1, Name = "Dairy" });
        GivenCategoriesWithName(new Category { Id = 2, Name = "Frozen" });
        var handler = new UpdateCategoryCommandHandler(_repository.Object);

        var result = await handler.Handle(new UpdateCategoryCommand(1, "Frozen"), CancellationToken.None);

        result.Should().BeOfType<UpdateCategoryResult.NameAlreadyExists>();
        _repository.Verify(r => r.Update(It.IsAny<Category>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NameUnchanged_AllowedEvenWhenSameNameRowExists()
    {
        var existing = new Category { Id = 1, Name = "Dairy" };
        GivenExistingCategory(existing);
        GivenCategoriesWithName(new Category { Id = 1, Name = "Dairy" });
        var handler = new UpdateCategoryCommandHandler(_repository.Object);

        var result = await handler.Handle(new UpdateCategoryCommand(1, "Dairy"), CancellationToken.None);

        result.Should().BeOfType<UpdateCategoryResult.Success>();
        _repository.Verify(r => r.Update(existing), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_NameChangedToFreeName_UpdatesAndReturnsSuccess()
    {
        var existing = new Category { Id = 1, Name = "Dairy" };
        GivenExistingCategory(existing);
        GivenCategoriesWithName();
        var handler = new UpdateCategoryCommandHandler(_repository.Object);

        var result = await handler.Handle(new UpdateCategoryCommand(1, "Cheese"), CancellationToken.None);

        result.Should().BeOfType<UpdateCategoryResult.Success>();
        existing.Name.Should().Be("Cheese");
        _repository.Verify(r => r.Update(existing), Times.Once);
    }
}
```

- [ ] **Step 6: Run to confirm it fails to compile.**

Run: `dotnet test tests/FoodDiary.UnitTests --filter "FullyQualifiedName~UpdateCategoryCommandHandlerTests"`
Expected: build error — `UpdateCategoryCommand*` not defined.

- [ ] **Step 7: Implement `UpdateCategoryCommandHandler`.**

Create `src/FoodDiary.Application/Categories/Update/UpdateCategoryCommandHandler.cs`:
```csharp
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Application.Categories.Update;

public record UpdateCategoryCommand(int Id, string Name);

public abstract record UpdateCategoryResult
{
    public record Success : UpdateCategoryResult;

    public record NotFound : UpdateCategoryResult;

    public record NameAlreadyExists : UpdateCategoryResult;
}

public class UpdateCategoryCommandHandler(ICategoryRepository categoryRepository)
{
    public async Task<UpdateCategoryResult> Handle(UpdateCategoryCommand command, CancellationToken cancellationToken)
    {
        var category = await categoryRepository.GetByIdAsync(command.Id, cancellationToken);

        if (category is null)
        {
            return new UpdateCategoryResult.NotFound();
        }

        var query = categoryRepository.GetQueryWithoutTracking().Where(c => c.Name == command.Name);
        var categoriesWithSameName = await categoryRepository.GetByQueryAsync(query, cancellationToken);
        var nameChanged = category.Name != command.Name;

        if (nameChanged && categoriesWithSameName.Count > 0)
        {
            return new UpdateCategoryResult.NameAlreadyExists();
        }

        category.Name = command.Name;
        categoryRepository.Update(category);
        await categoryRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return new UpdateCategoryResult.Success();
    }
}
```

- [ ] **Step 8: Run to confirm it passes.**

Run: `dotnet test tests/FoodDiary.UnitTests --filter "FullyQualifiedName~UpdateCategoryCommandHandlerTests"`
Expected: 4 passed.

- [ ] **Step 9: Write the failing `DeleteCategoryCommandHandler` unit test.**

Create `tests/FoodDiary.UnitTests/Categories/Delete/DeleteCategoryCommandHandlerTests.cs`:
```csharp
using System.Threading;
using System.Threading.Tasks;
using AwesomeAssertions;
using FoodDiary.Application.Categories.Delete;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Categories.Delete;

public class DeleteCategoryCommandHandlerTests
{
    private readonly Mock<ICategoryRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public DeleteCategoryCommandHandlerTests()
    {
        _repository.Setup(r => r.UnitOfWork).Returns(_unitOfWork.Object);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
    }

    [Fact]
    public async Task Handle_CategoryNotFound_ReturnsNotFound()
    {
        _repository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Category)null!);
        var handler = new DeleteCategoryCommandHandler(_repository.Object);

        var result = await handler.Handle(new DeleteCategoryCommand(1), CancellationToken.None);

        result.Should().BeOfType<DeleteCategoryResult.NotFound>();
        _repository.Verify(r => r.Remove(It.IsAny<Category>()), Times.Never);
    }

    [Fact]
    public async Task Handle_CategoryExists_RemovesAndReturnsSuccess()
    {
        var category = new Category { Id = 1, Name = "Dairy" };
        _repository.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(category);
        var handler = new DeleteCategoryCommandHandler(_repository.Object);

        var result = await handler.Handle(new DeleteCategoryCommand(1), CancellationToken.None);

        result.Should().BeOfType<DeleteCategoryResult.Success>();
        _repository.Verify(r => r.Remove(category), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
```

- [ ] **Step 10: Run to confirm it fails to compile.**

Run: `dotnet test tests/FoodDiary.UnitTests --filter "FullyQualifiedName~DeleteCategoryCommandHandlerTests"`
Expected: build error — `DeleteCategoryCommand*` not defined.

- [ ] **Step 11: Implement `DeleteCategoryCommandHandler`.**

Create `src/FoodDiary.Application/Categories/Delete/DeleteCategoryCommandHandler.cs`:
```csharp
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Application.Categories.Delete;

public record DeleteCategoryCommand(int Id);

public abstract record DeleteCategoryResult
{
    public record Success : DeleteCategoryResult;

    public record NotFound : DeleteCategoryResult;
}

public class DeleteCategoryCommandHandler(ICategoryRepository categoryRepository)
{
    public async Task<DeleteCategoryResult> Handle(DeleteCategoryCommand command, CancellationToken cancellationToken)
    {
        var category = await categoryRepository.GetByIdAsync(command.Id, cancellationToken);

        if (category is null)
        {
            return new DeleteCategoryResult.NotFound();
        }

        categoryRepository.Remove(category);
        await categoryRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return new DeleteCategoryResult.Success();
    }
}
```

- [ ] **Step 12: Run to confirm it passes.**

Run: `dotnet test tests/FoodDiary.UnitTests --filter "FullyQualifiedName~DeleteCategoryCommandHandlerTests"`
Expected: 2 passed.

- [ ] **Step 13: Implement `GetCategoriesQueryHandler`** (no unit test — covered by the `I_can_retrieve_categories_list` component test).

Create `src/FoodDiary.Application/Categories/Get/GetCategoriesQueryHandler.cs`:
```csharp
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Application.Categories.Get;

public record GetCategoriesQuery;

public record GetCategoriesQueryResult(IReadOnlyCollection<Category> Categories);

public class GetCategoriesQueryHandler(ICategoryRepository categoryRepository)
{
    public async Task<GetCategoriesQueryResult> Handle(GetCategoriesQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = categoryRepository.GetQueryWithoutTracking();
        dbQuery = categoryRepository.LoadProducts(dbQuery);
        dbQuery = dbQuery.OrderBy(c => c.Name);

        var categories = await categoryRepository.GetByQueryAsync(dbQuery, cancellationToken);
        return new GetCategoriesQueryResult(categories);
    }
}
```

- [ ] **Step 14: Register the category handlers in Application DI.**

In `src/FoodDiary.Application/Extensions/ServiceCollectionExtensions.cs`, add the using directives:
```csharp
using FoodDiary.Application.Categories.Create;
using FoodDiary.Application.Categories.Delete;
using FoodDiary.Application.Categories.Get;
using FoodDiary.Application.Categories.Update;
```
Add `services.AddCategories();` to `AddApplicationDependencies` (leave `AddMediatR` in place — other controllers still use it), and add the method:
```csharp
    private static void AddCategories(this IServiceCollection services)
    {
        services.AddScoped<GetCategoriesQueryHandler>();
        services.AddScoped<CreateCategoryCommandHandler>();
        services.AddScoped<UpdateCategoryCommandHandler>();
        services.AddScoped<DeleteCategoryCommandHandler>();
    }
```

- [ ] **Step 15: Rewrite `CategoriesController`** to drop `IMapper`/`IMediator` and inject handlers per-action.

Replace the entire contents of `src/FoodDiary.API/Controllers/v1/CategoriesController.cs`:
```csharp
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Dtos;
using FoodDiary.API.Mapping;
using FoodDiary.Application.Categories.Create;
using FoodDiary.Application.Categories.Delete;
using FoodDiary.Application.Categories.Get;
using FoodDiary.Application.Categories.Update;
using FoodDiary.Application.Services.Categories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.API.Controllers.v1;

[ApiController]
[Route("api/v1/categories")]
[Authorize(Constants.AuthorizationPolicies.GoogleAllowedEmails)]
[ApiExplorerSettings(GroupName = "v1")]
public class CategoriesController : ControllerBase
{
    /// <summary>
    /// Gets all available categories ordered by name
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<CategoryItemDto>), (int)HttpStatusCode.OK)]
    public async Task<IActionResult> GetCategories(
        [FromServices] GetCategoriesQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(new GetCategoriesQuery(), cancellationToken);
        var categoriesListResponse = result.Categories.Select(c => c.ToCategoryItemDto());
        return Ok(categoriesListResponse);
    }

    /// <summary>
    /// Creates new category if category with the same name doesn't exist
    /// </summary>
    [HttpPost]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> CreateCategory(
        [FromBody] CategoryCreateEditRequest categoryData,
        [FromServices] CreateCategoryCommandHandler handler,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await handler.Handle(new CreateCategoryCommand(categoryData.Name), cancellationToken);

        switch (result)
        {
            case CreateCategoryResult.NameAlreadyExists:
                ModelState.AddModelError(nameof(categoryData.Name), $"Category with the name '{categoryData.Name}' already exists");
                return BadRequest(ModelState);
            case CreateCategoryResult.Success success:
                return Ok(success.Category.Id);
            default:
                return Conflict();
        }
    }

    /// <summary>
    /// Updates existing category if category with the same name doesn't exist
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> EditCategory(
        [FromRoute] int id,
        [FromBody] CategoryCreateEditRequest updatedCategoryData,
        [FromServices] UpdateCategoryCommandHandler handler,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var result = await handler.Handle(new UpdateCategoryCommand(id, updatedCategoryData.Name), cancellationToken);

        switch (result)
        {
            case UpdateCategoryResult.NotFound:
                return NotFound();
            case UpdateCategoryResult.NameAlreadyExists:
                ModelState.AddModelError(nameof(updatedCategoryData.Name), $"Category with the name '{updatedCategoryData.Name}' already exists");
                return BadRequest(ModelState);
            case UpdateCategoryResult.Success:
                return Ok();
            default:
                return Conflict();
        }
    }

    /// <summary>
    /// Deletes category by id
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> DeleteCategory(
        [FromRoute] int id,
        [FromServices] DeleteCategoryCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(new DeleteCategoryCommand(id), cancellationToken);

        return result switch
        {
            DeleteCategoryResult.NotFound => NotFound(),
            DeleteCategoryResult.Success => Ok(),
            _ => Conflict()
        };
    }

    [HttpGet("autocomplete")]
    public async Task<IActionResult> GetCategoriesForAutocomplete(
        [FromServices] ICategoriesService categoriesService,
        CancellationToken cancellationToken)
    {
        var categories = await categoriesService.GetAutocompleteItemsAsync(cancellationToken);
        return Ok(categories);
    }
}
```

- [ ] **Step 16: Delete the old MediatR category requests and handlers.**

```bash
git rm src/FoodDiary.Application/Categories/Requests/CreateCategoryRequest.cs \
       src/FoodDiary.Application/Categories/Requests/DeleteCategoryRequest.cs \
       src/FoodDiary.Application/Categories/Requests/EditCategoryRequest.cs \
       src/FoodDiary.Application/Categories/Requests/GetCategoriesByExactNameRequest.cs \
       src/FoodDiary.Application/Categories/Requests/GetCategoriesRequest.cs \
       src/FoodDiary.Application/Categories/Requests/GetCategoryByIdRequest.cs \
       src/FoodDiary.Application/Categories/Handlers/CreateCategoryRequestHandler.cs \
       src/FoodDiary.Application/Categories/Handlers/DeleteCategoryRequestHandler.cs \
       src/FoodDiary.Application/Categories/Handlers/EditCategoryRequestHandler.cs \
       src/FoodDiary.Application/Categories/Handlers/GetCategoriesByExactNameRequestHandler.cs \
       src/FoodDiary.Application/Categories/Handlers/GetCategoriesRequestHandler.cs \
       src/FoodDiary.Application/Categories/Handlers/GetCategoryByIdRequestHandler.cs
```

- [ ] **Step 17: Build and run the unit tests.**

Run: `dotnet build && dotnet test tests/FoodDiary.UnitTests`
Expected: build succeeds (warnings-as-errors clean); all UnitTests pass.

- [ ] **Step 18: Run the Categories component tests.**

First confirm Docker is available (`docker info`). If it is not, STOP and ask the user how to proceed.
Run: `dotnet test tests/FoodDiary.ComponentTests --filter "FullyQualifiedName~CategoriesApiTests"`
Expected: all Categories scenarios pass (create/update/delete/list/autocomplete).

- [ ] **Step 19: Commit.**

```bash
git add -A
git commit -m "Replace MediatR/AutoMapper for categories with command/query handlers"
```

---

## Task 3: Products → command/query handlers

Replace the MediatR-backed product endpoints. Consolidate the edit name-conflict + assignment logic into `UpdateProductCommand`, and rename the existing `CreateProductRequest`/`CreateProductResponse` to `CreateProductCommand`/`CreateProductResult` (removing the `CreateProductResponse` alias clash in the controller).

**Files:**
- Modify: `src/FoodDiary.Domain/Entities/Product.cs` (nutrition `init`→`set`)
- Create: `src/FoodDiary.Application/Products/Get/GetProductsQueryHandler.cs`
- Create: `src/FoodDiary.Application/Products/Create/CreateProductCommandHandler.cs` (replaces `CreateProductRequestHandler.cs`)
- Create: `src/FoodDiary.Application/Products/Update/UpdateProductCommandHandler.cs`
- Create: `src/FoodDiary.Application/Products/Delete/DeleteProductCommandHandler.cs`
- Create: `src/FoodDiary.Application/Products/Delete/DeleteProductsCommandHandler.cs`
- Create: `tests/FoodDiary.UnitTests/Products/Create/CreateProductCommandHandlerTests.cs`
- Create: `tests/FoodDiary.UnitTests/Products/Update/UpdateProductCommandHandlerTests.cs`
- Create: `tests/FoodDiary.UnitTests/Products/Delete/DeleteProductCommandHandlerTests.cs`
- Modify: `src/FoodDiary.Application/Extensions/ServiceCollectionExtensions.cs`
- Modify: `src/FoodDiary.API/Controllers/v1/ProductsController.cs`
- Delete: `src/FoodDiary.Application/Products/Create/CreateProductRequestHandler.cs`
- Delete: `src/FoodDiary.Application/Products/Requests/{DeleteProductRequest,DeleteProductsRequest,EditProductRequest,GetProductByIdRequest,GetProductsByExactNameRequest,GetProductsByIdsRequest,GetProductsRequest}.cs`
- Delete: `src/FoodDiary.Application/Products/Handlers/{DeleteProductRequestHandler,DeleteProductsRequestHandler,EditProductRequestHandler,GetProductByIdRequestHandler,GetProductsByExactNameRequestHandler,GetProductsByIdsRequestHandler,GetProductsRequestHandler}.cs`
- Delete: `src/FoodDiary.Application/Models/ProductsSearchResult.cs`

**Interfaces:**
- Consumes: v1 `IProductRepository` (`GetByIdAsync`, `GetQuery`, `GetQueryWithoutTracking`, `GetByQueryAsync`, `CountByQueryAsync`, `LoadCategory`, `Update`, `Remove`, `RemoveRange`, `UnitOfWork.SaveChangesAsync`); v2 `IProductsRepository` (`FindByExactName`, `Create`) for create only; existing `Product.ToProductItemDto()` (`API/Mapping/ProductsMapper.cs`) and `Product.ToCreateProductResponse()` (same file, returns `FoodDiary.Contracts.Products.CreateProductResponse`).
- Produces:
  - `GetProductsQuery(int PageNumber, int PageSize, string? ProductName, int? CategoryId)` → `GetProductsQueryResult(IReadOnlyCollection<Product> Products, int TotalProductsCount)`
  - `CreateProductCommand(string Name, int CaloriesCost, int DefaultQuantity, int CategoryId, decimal? Protein, decimal? Fats, decimal? Carbs, decimal? Sugar, decimal? Salt)` → `CreateProductResult` = `Success(Product Product)` | `ProductAlreadyExists`
  - `UpdateProductCommand(int Id, string Name, int CaloriesCost, int DefaultQuantity, int CategoryId, decimal? Protein, decimal? Fats, decimal? Carbs, decimal? Sugar, decimal? Salt)` → `UpdateProductResult` = `Success` | `NotFound` | `NameAlreadyExists`
  - `DeleteProductCommand(int Id)` → `DeleteProductResult` = `Success` | `NotFound`
  - `DeleteProductsCommand(IReadOnlyCollection<int> Ids)` → `DeleteProductsResult` = `Success`
  - DI: handlers registered inside the existing `AddProducts` method.

- [ ] **Step 1: Make `Product` nutrition properties settable.**

In `src/FoodDiary.Domain/Entities/Product.cs`, change the five nutrition properties from `init` to `set`:
```csharp
    public required decimal? Protein { get; set; }
    public required decimal? Fats { get; set; }
    public required decimal? Carbs { get; set; }
    public required decimal? Sugar { get; set; }
    public required decimal? Salt { get; set; }
```
(This lets `UpdateProductCommandHandler` assign them on the tracked entity — the AutoMapper edit path wrote them via reflection today, so this preserves behavior. Object initializers elsewhere are unaffected.)

- [ ] **Step 2: Write the failing `CreateProductCommandHandler` unit tests.**

Create `tests/FoodDiary.UnitTests/Products/Create/CreateProductCommandHandlerTests.cs`:
```csharp
using System.Threading;
using System.Threading.Tasks;
using AwesomeAssertions;
using FoodDiary.Application.Products.Create;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Products.Create;

public class CreateProductCommandHandlerTests
{
    private readonly Mock<IProductsRepository> _repository = new();

    private static CreateProductCommand Command(string name = "Chicken") =>
        new(name, 100, 100, 1, null, null, null, null, null);

    [Fact]
    public async Task Handle_ProductWithSameNameExists_ReturnsProductAlreadyExists()
    {
        _repository.Setup(r => r.FindByExactName("Chicken", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Product { Name = "Chicken", Protein = null, Fats = null, Carbs = null, Sugar = null, Salt = null });
        var handler = new CreateProductCommandHandler(_repository.Object);

        var result = await handler.Handle(Command(), CancellationToken.None);

        result.Should().BeOfType<CreateProductResult.ProductAlreadyExists>();
        _repository.Verify(r => r.Create(It.IsAny<Product>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NewName_CreatesAndReturnsSuccess()
    {
        _repository.Setup(r => r.FindByExactName("Chicken", It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product)null!);
        var handler = new CreateProductCommandHandler(_repository.Object);

        var result = await handler.Handle(Command(), CancellationToken.None);

        result.Should().BeOfType<CreateProductResult.Success>()
            .Which.Product.Name.Should().Be("Chicken");
        _repository.Verify(r => r.Create(It.Is<Product>(p => p.Name == "Chicken"), It.IsAny<CancellationToken>()), Times.Once);
    }
}
```

- [ ] **Step 3: Run to confirm it fails to compile.**

Run: `dotnet test tests/FoodDiary.UnitTests --filter "FullyQualifiedName~CreateProductCommandHandlerTests"`
Expected: build error — `CreateProductCommand*` not defined.

- [ ] **Step 4: Replace the create handler.**

Delete the old file and create the new one:
```bash
git rm src/FoodDiary.Application/Products/Create/CreateProductRequestHandler.cs
```
Create `src/FoodDiary.Application/Products/Create/CreateProductCommandHandler.cs`:
```csharp
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories.v2;

namespace FoodDiary.Application.Products.Create;

public record CreateProductCommand(
    string Name,
    int CaloriesCost,
    int DefaultQuantity,
    int CategoryId,
    decimal? Protein,
    decimal? Fats,
    decimal? Carbs,
    decimal? Sugar,
    decimal? Salt);

public abstract record CreateProductResult
{
    public record Success(Product Product) : CreateProductResult;

    public record ProductAlreadyExists : CreateProductResult;
}

public class CreateProductCommandHandler(IProductsRepository repository)
{
    public async Task<CreateProductResult> Handle(CreateProductCommand command, CancellationToken cancellationToken)
    {
        var productWithTheSameName = await repository.FindByExactName(command.Name, cancellationToken);

        if (productWithTheSameName is not null)
        {
            return new CreateProductResult.ProductAlreadyExists();
        }

        var product = new Product
        {
            Name = command.Name,
            CaloriesCost = command.CaloriesCost,
            DefaultQuantity = command.DefaultQuantity,
            CategoryId = command.CategoryId,
            Protein = command.Protein,
            Fats = command.Fats,
            Carbs = command.Carbs,
            Sugar = command.Sugar,
            Salt = command.Salt
        };

        await repository.Create(product, cancellationToken);
        return new CreateProductResult.Success(product);
    }
}
```

- [ ] **Step 5: Run to confirm the create tests pass.**

Run: `dotnet test tests/FoodDiary.UnitTests --filter "FullyQualifiedName~CreateProductCommandHandlerTests"`
Expected: 2 passed.

- [ ] **Step 6: Write the failing `UpdateProductCommandHandler` unit tests.**

Create `tests/FoodDiary.UnitTests/Products/Update/UpdateProductCommandHandlerTests.cs`:
```csharp
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AwesomeAssertions;
using FoodDiary.Application.Products.Update;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Products.Update;

public class UpdateProductCommandHandlerTests
{
    private readonly Mock<IProductRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public UpdateProductCommandHandlerTests()
    {
        _repository.Setup(r => r.UnitOfWork).Returns(_unitOfWork.Object);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
    }

    private static Product NewProduct(int id, string name) =>
        new() { Id = id, Name = name, Protein = null, Fats = null, Carbs = null, Sugar = null, Salt = null };

    private static UpdateProductCommand Command(int id, string name) =>
        new(id, name, 100, 100, 1, null, null, null, null, null);

    private void GivenExistingProduct(Product? product) =>
        _repository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync(product!);

    private void GivenProductsWithName(params Product[] products)
    {
        _repository.Setup(r => r.GetQueryWithoutTracking()).Returns(products.AsQueryable());
        _repository
            .Setup(r => r.GetByQueryAsync(It.IsAny<IQueryable<Product>>(), It.IsAny<CancellationToken>()))
            .Returns((IQueryable<Product> q, CancellationToken _) => Task.FromResult(q.ToList()));
    }

    [Fact]
    public async Task Handle_ProductNotFound_ReturnsNotFound()
    {
        GivenExistingProduct(null);
        GivenProductsWithName();
        var handler = new UpdateProductCommandHandler(_repository.Object);

        var result = await handler.Handle(Command(1, "Beef"), CancellationToken.None);

        result.Should().BeOfType<UpdateProductResult.NotFound>();
        _repository.Verify(r => r.Update(It.IsAny<Product>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NameChangedToExistingName_ReturnsNameAlreadyExists()
    {
        GivenExistingProduct(NewProduct(1, "Chicken"));
        GivenProductsWithName(NewProduct(2, "Beef"));
        var handler = new UpdateProductCommandHandler(_repository.Object);

        var result = await handler.Handle(Command(1, "Beef"), CancellationToken.None);

        result.Should().BeOfType<UpdateProductResult.NameAlreadyExists>();
        _repository.Verify(r => r.Update(It.IsAny<Product>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NameUnchanged_AllowedEvenWhenSameNameRowExists()
    {
        var existing = NewProduct(1, "Chicken");
        GivenExistingProduct(existing);
        GivenProductsWithName(NewProduct(1, "Chicken"));
        var handler = new UpdateProductCommandHandler(_repository.Object);

        var result = await handler.Handle(Command(1, "Chicken"), CancellationToken.None);

        result.Should().BeOfType<UpdateProductResult.Success>();
        _repository.Verify(r => r.Update(existing), Times.Once);
    }

    [Fact]
    public async Task Handle_NameChangedToFreeName_AssignsFieldsAndReturnsSuccess()
    {
        var existing = NewProduct(1, "Chicken");
        GivenExistingProduct(existing);
        GivenProductsWithName();
        var handler = new UpdateProductCommandHandler(_repository.Object);

        var result = await handler.Handle(
            new UpdateProductCommand(1, "Boiled chicken", 200, 150, 3, 1.1m, 2.2m, 3.3m, 4.4m, 5.5m),
            CancellationToken.None);

        result.Should().BeOfType<UpdateProductResult.Success>();
        existing.Name.Should().Be("Boiled chicken");
        existing.CaloriesCost.Should().Be(200);
        existing.CategoryId.Should().Be(3);
        existing.Protein.Should().Be(1.1m);
        existing.Salt.Should().Be(5.5m);
        _repository.Verify(r => r.Update(existing), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
```

- [ ] **Step 7: Run to confirm it fails to compile.**

Run: `dotnet test tests/FoodDiary.UnitTests --filter "FullyQualifiedName~UpdateProductCommandHandlerTests"`
Expected: build error — `UpdateProductCommand*` not defined.

- [ ] **Step 8: Implement `UpdateProductCommandHandler`.**

Create `src/FoodDiary.Application/Products/Update/UpdateProductCommandHandler.cs`:
```csharp
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Application.Products.Update;

public record UpdateProductCommand(
    int Id,
    string Name,
    int CaloriesCost,
    int DefaultQuantity,
    int CategoryId,
    decimal? Protein,
    decimal? Fats,
    decimal? Carbs,
    decimal? Sugar,
    decimal? Salt);

public abstract record UpdateProductResult
{
    public record Success : UpdateProductResult;

    public record NotFound : UpdateProductResult;

    public record NameAlreadyExists : UpdateProductResult;
}

public class UpdateProductCommandHandler(IProductRepository productRepository)
{
    public async Task<UpdateProductResult> Handle(UpdateProductCommand command, CancellationToken cancellationToken)
    {
        var product = await productRepository.GetByIdAsync(command.Id, cancellationToken);

        if (product is null)
        {
            return new UpdateProductResult.NotFound();
        }

        var query = productRepository.GetQueryWithoutTracking().Where(p => p.Name == command.Name);
        var productsWithSameName = await productRepository.GetByQueryAsync(query, cancellationToken);
        var nameChanged = product.Name != command.Name;

        if (nameChanged && productsWithSameName.Count > 0)
        {
            return new UpdateProductResult.NameAlreadyExists();
        }

        product.Name = command.Name;
        product.CaloriesCost = command.CaloriesCost;
        product.DefaultQuantity = command.DefaultQuantity;
        product.CategoryId = command.CategoryId;
        product.Protein = command.Protein;
        product.Fats = command.Fats;
        product.Carbs = command.Carbs;
        product.Sugar = command.Sugar;
        product.Salt = command.Salt;

        productRepository.Update(product);
        await productRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return new UpdateProductResult.Success();
    }
}
```

- [ ] **Step 9: Run to confirm the update tests pass.**

Run: `dotnet test tests/FoodDiary.UnitTests --filter "FullyQualifiedName~UpdateProductCommandHandlerTests"`
Expected: 4 passed.

- [ ] **Step 10: Write the failing `DeleteProductCommandHandler` unit test.**

Create `tests/FoodDiary.UnitTests/Products/Delete/DeleteProductCommandHandlerTests.cs`:
```csharp
using System.Threading;
using System.Threading.Tasks;
using AwesomeAssertions;
using FoodDiary.Application.Products.Delete;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Products.Delete;

public class DeleteProductCommandHandlerTests
{
    private readonly Mock<IProductRepository> _repository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public DeleteProductCommandHandlerTests()
    {
        _repository.Setup(r => r.UnitOfWork).Returns(_unitOfWork.Object);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
    }

    [Fact]
    public async Task Handle_ProductNotFound_ReturnsNotFound()
    {
        _repository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Product)null!);
        var handler = new DeleteProductCommandHandler(_repository.Object);

        var result = await handler.Handle(new DeleteProductCommand(1), CancellationToken.None);

        result.Should().BeOfType<DeleteProductResult.NotFound>();
        _repository.Verify(r => r.Remove(It.IsAny<Product>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ProductExists_RemovesAndReturnsSuccess()
    {
        var product = new Product { Id = 1, Name = "Milk", Protein = null, Fats = null, Carbs = null, Sugar = null, Salt = null };
        _repository.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(product);
        var handler = new DeleteProductCommandHandler(_repository.Object);

        var result = await handler.Handle(new DeleteProductCommand(1), CancellationToken.None);

        result.Should().BeOfType<DeleteProductResult.Success>();
        _repository.Verify(r => r.Remove(product), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
```

- [ ] **Step 11: Run to confirm it fails to compile.**

Run: `dotnet test tests/FoodDiary.UnitTests --filter "FullyQualifiedName~DeleteProductCommandHandlerTests"`
Expected: build error — `DeleteProductCommand*` not defined.

- [ ] **Step 12: Implement `DeleteProductCommandHandler`.**

Create `src/FoodDiary.Application/Products/Delete/DeleteProductCommandHandler.cs`:
```csharp
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Application.Products.Delete;

public record DeleteProductCommand(int Id);

public abstract record DeleteProductResult
{
    public record Success : DeleteProductResult;

    public record NotFound : DeleteProductResult;
}

public class DeleteProductCommandHandler(IProductRepository productRepository)
{
    public async Task<DeleteProductResult> Handle(DeleteProductCommand command, CancellationToken cancellationToken)
    {
        var product = await productRepository.GetByIdAsync(command.Id, cancellationToken);

        if (product is null)
        {
            return new DeleteProductResult.NotFound();
        }

        productRepository.Remove(product);
        await productRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return new DeleteProductResult.Success();
    }
}
```

- [ ] **Step 13: Run to confirm the delete tests pass.**

Run: `dotnet test tests/FoodDiary.UnitTests --filter "FullyQualifiedName~DeleteProductCommandHandlerTests"`
Expected: 2 passed.

- [ ] **Step 14: Implement `DeleteProductsCommandHandler`** (batch delete — no unit test; covered by `I_can_delete_multiple_products`).

Create `src/FoodDiary.Application/Products/Delete/DeleteProductsCommandHandler.cs`:
```csharp
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Application.Products.Delete;

public record DeleteProductsCommand(IReadOnlyCollection<int> Ids);

public abstract record DeleteProductsResult
{
    public record Success : DeleteProductsResult;
}

public class DeleteProductsCommandHandler(IProductRepository productRepository)
{
    public async Task<DeleteProductsResult> Handle(DeleteProductsCommand command, CancellationToken cancellationToken)
    {
        var query = productRepository.GetQuery().Where(p => command.Ids.Contains(p.Id));
        var products = await productRepository.GetByQueryAsync(query, cancellationToken);

        productRepository.RemoveRange(products);
        await productRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return new DeleteProductsResult.Success();
    }
}
```

- [ ] **Step 15: Implement `GetProductsQueryHandler`** (no unit test — covered by the products list/search component tests).

Create `src/FoodDiary.Application/Products/Get/GetProductsQueryHandler.cs`:
```csharp
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Repositories;

namespace FoodDiary.Application.Products.Get;

public record GetProductsQuery(int PageNumber, int PageSize, string? ProductName, int? CategoryId);

public record GetProductsQueryResult(IReadOnlyCollection<Product> Products, int TotalProductsCount);

public class GetProductsQueryHandler(IProductRepository productRepository)
{
    public async Task<GetProductsQueryResult> Handle(GetProductsQuery query, CancellationToken cancellationToken)
    {
        var dbQuery = productRepository.GetQueryWithoutTracking();

        if (!string.IsNullOrWhiteSpace(query.ProductName))
            dbQuery = dbQuery.Where(p => p.Name.ToLower().Contains(query.ProductName.ToLower()));
        if (query.CategoryId.HasValue)
            dbQuery = dbQuery.Where(p => p.CategoryId == query.CategoryId);

        var totalProductsCount = await productRepository.CountByQueryAsync(dbQuery, cancellationToken);

        dbQuery = productRepository.LoadCategory(dbQuery);
        dbQuery = dbQuery.OrderBy(p => p.Name)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize);

        var products = await productRepository.GetByQueryAsync(dbQuery, cancellationToken);

        return new GetProductsQueryResult(products, totalProductsCount);
    }
}
```

- [ ] **Step 16: Register the product handlers in Application DI.**

In `src/FoodDiary.Application/Extensions/ServiceCollectionExtensions.cs`, add usings:
```csharp
using FoodDiary.Application.Products.Create;
using FoodDiary.Application.Products.Delete;
using FoodDiary.Application.Products.Get;
using FoodDiary.Application.Products.Update;
```
and extend the existing `AddProducts` method so it reads:
```csharp
    private static void AddProducts(this IServiceCollection services)
    {
        services.AddScoped<SuggestNutritionCommandHandler>();
        services.AddScoped<GetProductsQueryHandler>();
        services.AddScoped<CreateProductCommandHandler>();
        services.AddScoped<UpdateProductCommandHandler>();
        services.AddScoped<DeleteProductCommandHandler>();
        services.AddScoped<DeleteProductsCommandHandler>();
    }
```

- [ ] **Step 17: Rewrite `ProductsController`** to drop `IMapper`/`IMediator` and the `CreateProductResponse` alias.

Replace the entire contents of `src/FoodDiary.API/Controllers/v1/ProductsController.cs`:
```csharp
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.API.Dtos;
using FoodDiary.API.Features.Products;
using FoodDiary.API.Features.Products.Extensions;
using FoodDiary.API.Mapping;
using FoodDiary.API.Requests;
using FoodDiary.Application.Products.Create;
using FoodDiary.Application.Products.Delete;
using FoodDiary.Application.Products.Get;
using FoodDiary.Application.Products.SuggestNutrition;
using FoodDiary.Application.Products.Update;
using FoodDiary.Contracts.Products;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.API.Controllers.v1;

[ApiController]
[Route("api/v1/products")]
[Authorize(Constants.AuthorizationPolicies.GoogleAllowedEmails)]
[ApiExplorerSettings(GroupName = "v1")]
public class ProductsController : ControllerBase
{
    /// <summary>
    /// Gets products list by specified parameters
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(ProductsSearchResultDto), (int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> GetProducts(
        [FromQuery] ProductsSearchRequest productsRequest,
        [FromServices] GetProductsQueryHandler handler,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var query = new GetProductsQuery(
            productsRequest.PageNumber,
            productsRequest.PageSize,
            productsRequest.ProductSearchName,
            productsRequest.CategoryId);

        var result = await handler.Handle(query, cancellationToken);

        var searchResultDto = new ProductsSearchResultDto
        {
            TotalProductsCount = result.TotalProductsCount,
            ProductItems = result.Products.Select(p => p.ToProductItemDto())
        };

        return Ok(searchResultDto);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetProductById(
        [FromRoute] int id,
        [FromServices] GetProductByIdHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(id, cancellationToken);

        return result switch
        {
            GetProductByIdHandlerResult.Success success => Ok(success.Product),
            GetProductByIdHandlerResult.NotFound => NotFound(),
            _ => StatusCode(StatusCodes.Status501NotImplemented)
        };
    }

    [HttpPost]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> CreateProduct(
        [FromBody] ProductCreateEditRequest productData,
        [FromServices] CreateProductCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var command = new CreateProductCommand(
            productData.Name,
            productData.CaloriesCost,
            productData.DefaultQuantity,
            productData.CategoryId,
            productData.Protein,
            productData.Fats,
            productData.Carbs,
            productData.Sugar,
            productData.Salt);

        var result = await handler.Handle(command, cancellationToken);

        switch (result)
        {
            case CreateProductResult.ProductAlreadyExists:
                return ProductAlreadyExists(productData);
            case CreateProductResult.Success success:
                return Ok(success.Product.ToCreateProductResponse());
            default:
                return Conflict();
        }
    }

    /// <summary>
    /// Updates existing product by specified id
    /// </summary>
    [HttpPut("{id}")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> EditProduct(
        [FromRoute] int id,
        [FromBody] ProductCreateEditRequest updatedProductData,
        [FromServices] UpdateProductCommandHandler handler,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var command = new UpdateProductCommand(
            id,
            updatedProductData.Name,
            updatedProductData.CaloriesCost,
            updatedProductData.DefaultQuantity,
            updatedProductData.CategoryId,
            updatedProductData.Protein,
            updatedProductData.Fats,
            updatedProductData.Carbs,
            updatedProductData.Sugar,
            updatedProductData.Salt);

        var result = await handler.Handle(command, cancellationToken);

        switch (result)
        {
            case UpdateProductResult.NotFound:
                return NotFound();
            case UpdateProductResult.NameAlreadyExists:
                ModelState.AddModelError(nameof(updatedProductData.Name), $"Product with the name '{updatedProductData.Name}' already exists");
                return BadRequest(ModelState);
            case UpdateProductResult.Success:
                return Ok();
            default:
                return Conflict();
        }
    }

    /// <summary>
    /// Deletes product by specified id
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> DeleteProduct(
        [FromRoute] int id,
        [FromServices] DeleteProductCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(new DeleteProductCommand(id), cancellationToken);

        return result switch
        {
            DeleteProductResult.NotFound => NotFound(),
            DeleteProductResult.Success => Ok(),
            _ => Conflict()
        };
    }

    /// <summary>
    /// Deletes products by specified ids
    /// </summary>
    [HttpDelete("batch")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> DeleteProducts(
        [FromBody] IEnumerable<int> ids,
        [FromServices] DeleteProductsCommandHandler handler,
        CancellationToken cancellationToken)
    {
        await handler.Handle(new DeleteProductsCommand(ids.ToList()), cancellationToken);
        return Ok();
    }

    [HttpGet("autocomplete")]
    public async Task<IActionResult> GetProductsForAutocomplete(
        [FromServices] SearchProductsHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(cancellationToken);
        return Ok(result.ToResponse());
    }

    [HttpPost("nutrition/suggestions")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> SuggestNutrition(
        [FromBody] SuggestProductNutritionRequest request,
        [FromServices] SuggestNutritionCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(new SuggestNutritionCommand(request.Name), cancellationToken);

        return result switch
        {
            SuggestNutritionResult.Success s => Ok(s.Response),
            SuggestNutritionResult.Failure f => f.Error.ToActionResult(),
            _ => StatusCode(StatusCodes.Status500InternalServerError)
        };
    }

    private IActionResult ProductAlreadyExists(ProductCreateEditRequest product)
    {
        ModelState.AddModelError(nameof(product.Name), $"Product with the name '{product.Name}' already exists");
        return BadRequest(ModelState);
    }
}
```

- [ ] **Step 18: Delete the old MediatR product requests, handlers, and the now-unused search-result model.**

```bash
git rm src/FoodDiary.Application/Products/Requests/DeleteProductRequest.cs \
       src/FoodDiary.Application/Products/Requests/DeleteProductsRequest.cs \
       src/FoodDiary.Application/Products/Requests/EditProductRequest.cs \
       src/FoodDiary.Application/Products/Requests/GetProductByIdRequest.cs \
       src/FoodDiary.Application/Products/Requests/GetProductsByExactNameRequest.cs \
       src/FoodDiary.Application/Products/Requests/GetProductsByIdsRequest.cs \
       src/FoodDiary.Application/Products/Requests/GetProductsRequest.cs \
       src/FoodDiary.Application/Products/Handlers/DeleteProductRequestHandler.cs \
       src/FoodDiary.Application/Products/Handlers/DeleteProductsRequestHandler.cs \
       src/FoodDiary.Application/Products/Handlers/EditProductRequestHandler.cs \
       src/FoodDiary.Application/Products/Handlers/GetProductByIdRequestHandler.cs \
       src/FoodDiary.Application/Products/Handlers/GetProductsByExactNameRequestHandler.cs \
       src/FoodDiary.Application/Products/Handlers/GetProductsByIdsRequestHandler.cs \
       src/FoodDiary.Application/Products/Handlers/GetProductsRequestHandler.cs \
       src/FoodDiary.Application/Models/ProductsSearchResult.cs
```

- [ ] **Step 19: Build and run the unit tests.**

Run: `dotnet build && dotnet test tests/FoodDiary.UnitTests`
Expected: build succeeds; all UnitTests pass.

- [ ] **Step 20: Run the Products component tests** (Docker required — confirm first; if unavailable, STOP and ask).

Run: `dotnet test tests/FoodDiary.ComponentTests --filter "FullyQualifiedName~ProductsApiTests"`
Expected: all Products scenarios pass (list/get/search/autocomplete/create/update/delete/batch-delete/nutrition).

- [ ] **Step 21: Commit.**

```bash
git add -A
git commit -m "Replace MediatR/AutoMapper for products with command/query handlers"
```

---

## Task 4: Notes delete → command handlers

Replace the two remaining MediatR usages in `NotesController` (the delete endpoints). The other notes endpoints already use the target pattern.

**Files:**
- Create: `src/FoodDiary.Application/Notes/Delete/DeleteNoteCommandHandler.cs`
- Create: `src/FoodDiary.Application/Notes/Delete/DeleteNotesCommandHandler.cs`
- Create: `tests/FoodDiary.UnitTests/Notes/Delete/DeleteNoteCommandHandlerTests.cs`
- Create: `tests/FoodDiary.UnitTests/Notes/Delete/DeleteNotesCommandHandlerTests.cs`
- Modify: `src/FoodDiary.Application/Extensions/ServiceCollectionExtensions.cs`
- Modify: `src/FoodDiary.API/Controllers/v1/NotesController.cs`
- Delete: `src/FoodDiary.Application/Notes/Requests/{DeleteNoteRequest,DeleteNotesRequest,EditNoteRequest,GetNoteByIdRequest,GetNotesByIdsRequest}.cs`
- Delete: `src/FoodDiary.Application/Notes/Handlers/{DeleteNoteRequestHandler,DeleteNotesRequestHandler,EditNoteRequestHandler,GetNoteByIdRequestHandler,GetNotesByIdsRequestHandler}.cs`

**Interfaces:**
- Consumes: v1 `INoteRepository` (`GetByIdAsync`, `GetQuery`, `GetByQueryAsync`, `Remove`, `RemoveRange`, `UnitOfWork.SaveChangesAsync`); `INotesOrderCalculator.RecalculateDisplayOrders`.
- Produces:
  - `DeleteNoteCommand(int Id)` → `DeleteNoteResult` = `Success` | `NotFound`
  - `DeleteNotesCommand(IReadOnlyCollection<int> Ids)` → `DeleteNotesResult` = `Success`
  - DI: handlers registered inside the existing `AddNotes` method.

- [ ] **Step 1: Write the failing `DeleteNoteCommandHandler` unit tests.**

Create `tests/FoodDiary.UnitTests/Notes/Delete/DeleteNoteCommandHandlerTests.cs`:
```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AwesomeAssertions;
using FoodDiary.Application.Notes.Delete;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Utils;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Notes.Delete;

public class DeleteNoteCommandHandlerTests
{
    private readonly Mock<INoteRepository> _repository = new();
    private readonly Mock<INotesOrderCalculator> _orderCalculator = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public DeleteNoteCommandHandlerTests()
    {
        _repository.Setup(r => r.UnitOfWork).Returns(_unitOfWork.Object);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
    }

    private void GivenNotes(params Note[] notes)
    {
        _repository.Setup(r => r.GetQuery()).Returns(notes.AsQueryable());
        _repository
            .Setup(r => r.GetByQueryAsync(It.IsAny<IQueryable<Note>>(), It.IsAny<CancellationToken>()))
            .Returns((IQueryable<Note> q, CancellationToken _) => Task.FromResult(q.ToList()));
    }

    [Fact]
    public async Task Handle_NoteNotFound_ReturnsNotFound()
    {
        _repository.Setup(r => r.GetByIdAsync(It.IsAny<int>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Note)null!);
        var handler = new DeleteNoteCommandHandler(_repository.Object, _orderCalculator.Object);

        var result = await handler.Handle(new DeleteNoteCommand(1), CancellationToken.None);

        result.Should().BeOfType<DeleteNoteResult.NotFound>();
        _repository.Verify(r => r.Remove(It.IsAny<Note>()), Times.Never);
        _orderCalculator.Verify(c => c.RecalculateDisplayOrders(It.IsAny<IEnumerable<Note>>(), It.IsAny<int>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NoteExists_RecalculatesRemainingOrdersRemovesAndReturnsSuccess()
    {
        var date = new DateOnly(2026, 7, 24);
        var target = new Note { Id = 1, Date = date, MealType = MealType.Breakfast };
        var sibling = new Note { Id = 2, Date = date, MealType = MealType.Breakfast };
        _repository.Setup(r => r.GetByIdAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(target);
        GivenNotes(target, sibling);
        var handler = new DeleteNoteCommandHandler(_repository.Object, _orderCalculator.Object);

        var result = await handler.Handle(new DeleteNoteCommand(1), CancellationToken.None);

        result.Should().BeOfType<DeleteNoteResult.Success>();
        _orderCalculator.Verify(
            c => c.RecalculateDisplayOrders(
                It.Is<IEnumerable<Note>>(notes => notes.Single().Id == 2),
                It.IsAny<int>()),
            Times.Once);
        _repository.Verify(r => r.Remove(target), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
```

- [ ] **Step 2: Run to confirm it fails to compile.**

Run: `dotnet test tests/FoodDiary.UnitTests --filter "FullyQualifiedName~DeleteNoteCommandHandlerTests"`
Expected: build error — `DeleteNoteCommand*` not defined.

- [ ] **Step 3: Implement `DeleteNoteCommandHandler`.**

Create `src/FoodDiary.Application/Notes/Delete/DeleteNoteCommandHandler.cs`:
```csharp
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Utils;

namespace FoodDiary.Application.Notes.Delete;

public record DeleteNoteCommand(int Id);

public abstract record DeleteNoteResult
{
    public record Success : DeleteNoteResult;

    public record NotFound : DeleteNoteResult;
}

public class DeleteNoteCommandHandler(INoteRepository noteRepository, INotesOrderCalculator notesOrderCalculator)
{
    public async Task<DeleteNoteResult> Handle(DeleteNoteCommand command, CancellationToken cancellationToken)
    {
        var note = await noteRepository.GetByIdAsync(command.Id, cancellationToken);

        if (note is null)
        {
            return new DeleteNoteResult.NotFound();
        }

        var remainingQuery = noteRepository.GetQuery()
            .Where(n => n.Date == note.Date)
            .Where(n => n.MealType == note.MealType)
            .Where(n => n.Id != note.Id);
        var remainingNotes = await noteRepository.GetByQueryAsync(remainingQuery, cancellationToken);

        notesOrderCalculator.RecalculateDisplayOrders(remainingNotes);

        noteRepository.Remove(note);
        await noteRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return new DeleteNoteResult.Success();
    }
}
```

- [ ] **Step 4: Run to confirm the tests pass.**

Run: `dotnet test tests/FoodDiary.UnitTests --filter "FullyQualifiedName~DeleteNoteCommandHandlerTests"`
Expected: 2 passed.

- [ ] **Step 5: Write the failing `DeleteNotesCommandHandler` unit tests** (covers the recalc path and the intentional empty short-circuit).

Create `tests/FoodDiary.UnitTests/Notes/Delete/DeleteNotesCommandHandlerTests.cs`:
```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AwesomeAssertions;
using FoodDiary.Application.Notes.Delete;
using FoodDiary.Domain.Abstractions;
using FoodDiary.Domain.Entities;
using FoodDiary.Domain.Enums;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Utils;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Notes.Delete;

public class DeleteNotesCommandHandlerTests
{
    private readonly Mock<INoteRepository> _repository = new();
    private readonly Mock<INotesOrderCalculator> _orderCalculator = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public DeleteNotesCommandHandlerTests()
    {
        _repository.Setup(r => r.UnitOfWork).Returns(_unitOfWork.Object);
        _unitOfWork.Setup(u => u.SaveChangesAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
    }

    private void GivenNotes(params Note[] notes)
    {
        _repository.Setup(r => r.GetQuery()).Returns(notes.AsQueryable());
        _repository
            .Setup(r => r.GetByQueryAsync(It.IsAny<IQueryable<Note>>(), It.IsAny<CancellationToken>()))
            .Returns((IQueryable<Note> q, CancellationToken _) => Task.FromResult(q.ToList()));
    }

    [Fact]
    public async Task Handle_MatchingNotes_RecalculatesRemainingOrdersRemovesAndReturnsSuccess()
    {
        var date = new DateOnly(2026, 7, 24);
        var delete1 = new Note { Id = 1, Date = date, MealType = MealType.Breakfast };
        var delete2 = new Note { Id = 2, Date = date, MealType = MealType.Breakfast };
        var remaining = new Note { Id = 3, Date = date, MealType = MealType.Breakfast };
        GivenNotes(delete1, delete2, remaining);
        var handler = new DeleteNotesCommandHandler(_repository.Object, _orderCalculator.Object);

        var result = await handler.Handle(new DeleteNotesCommand(new[] { 1, 2 }), CancellationToken.None);

        result.Should().BeOfType<DeleteNotesResult.Success>();
        _orderCalculator.Verify(
            c => c.RecalculateDisplayOrders(
                It.Is<IEnumerable<Note>>(notes => notes.Single().Id == 3),
                It.IsAny<int>()),
            Times.Once);
        _repository.Verify(r => r.RemoveRange(It.Is<IEnumerable<Note>>(notes => notes.Count() == 2)), Times.Once);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_NoMatchingNotes_ShortCircuitsToSuccessWithoutSideEffects()
    {
        GivenNotes();
        var handler = new DeleteNotesCommandHandler(_repository.Object, _orderCalculator.Object);

        var result = await handler.Handle(new DeleteNotesCommand(new[] { 99 }), CancellationToken.None);

        result.Should().BeOfType<DeleteNotesResult.Success>();
        _orderCalculator.Verify(c => c.RecalculateDisplayOrders(It.IsAny<IEnumerable<Note>>(), It.IsAny<int>()), Times.Never);
        _repository.Verify(r => r.RemoveRange(It.IsAny<IEnumerable<Note>>()), Times.Never);
        _unitOfWork.Verify(u => u.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
```

- [ ] **Step 6: Run to confirm it fails to compile.**

Run: `dotnet test tests/FoodDiary.UnitTests --filter "FullyQualifiedName~DeleteNotesCommandHandlerTests"`
Expected: build error — `DeleteNotesCommand*` not defined.

- [ ] **Step 7: Implement `DeleteNotesCommandHandler`.**

Create `src/FoodDiary.Application/Notes/Delete/DeleteNotesCommandHandler.cs`:
```csharp
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Domain.Repositories;
using FoodDiary.Domain.Utils;

namespace FoodDiary.Application.Notes.Delete;

public record DeleteNotesCommand(IReadOnlyCollection<int> Ids);

public abstract record DeleteNotesResult
{
    public record Success : DeleteNotesResult;
}

public class DeleteNotesCommandHandler(INoteRepository noteRepository, INotesOrderCalculator notesOrderCalculator)
{
    public async Task<DeleteNotesResult> Handle(DeleteNotesCommand command, CancellationToken cancellationToken)
    {
        var notesForDeleteQuery = noteRepository.GetQuery().Where(n => command.Ids.Contains(n.Id));
        var notesForDelete = await noteRepository.GetByQueryAsync(notesForDeleteQuery, cancellationToken);

        if (notesForDelete.Count == 0)
        {
            return new DeleteNotesResult.Success();
        }

        var notesForDeleteIds = notesForDelete.Select(n => n.Id).ToList();
        var date = notesForDelete[0].Date;
        var mealType = notesForDelete[0].MealType;

        var remainingQuery = noteRepository.GetQuery()
            .Where(n => n.Date == date)
            .Where(n => n.MealType == mealType)
            .Where(n => !notesForDeleteIds.Contains(n.Id));
        var remainingNotes = await noteRepository.GetByQueryAsync(remainingQuery, cancellationToken);

        notesOrderCalculator.RecalculateDisplayOrders(remainingNotes);

        noteRepository.RemoveRange(notesForDelete);
        await noteRepository.UnitOfWork.SaveChangesAsync(cancellationToken);
        return new DeleteNotesResult.Success();
    }
}
```

- [ ] **Step 8: Run to confirm the tests pass.**

Run: `dotnet test tests/FoodDiary.UnitTests --filter "FullyQualifiedName~DeleteNotesCommandHandlerTests"`
Expected: 2 passed.

- [ ] **Step 9: Register the note delete handlers in Application DI.**

In `src/FoodDiary.Application/Extensions/ServiceCollectionExtensions.cs`, add:
```csharp
using FoodDiary.Application.Notes.Delete;
```
and extend the existing `AddNotes` method so it reads:
```csharp
    private static void AddNotes(this IServiceCollection services)
    {
        services.AddScoped<GetNotesQueryHandler>();
        services.AddScoped<GetNotesHistoryQueryHandler>();
        services.AddScoped<CreateNoteCommandHandler>();
        services.AddScoped<UpdateNoteCommandHandler>();
        services.AddScoped<RecognizeNoteCommandHandler>();
        services.AddScoped<DeleteNoteCommandHandler>();
        services.AddScoped<DeleteNotesCommandHandler>();
    }
```

- [ ] **Step 10: Rewrite the delete actions in `NotesController`.**

In `src/FoodDiary.API/Controllers/v1/NotesController.cs`:

Remove the `_mediator` field and constructor, remove `using MediatR;` and `using FoodDiary.Application.Notes.Requests;`, and add `using FoodDiary.Application.Notes.Delete;`. The class declaration becomes:
```csharp
public class NotesController : ControllerBase
{
```
(no fields, no constructor — the other actions already receive their handlers via `[FromServices]`).

Replace the `DeleteNote` action:
```csharp
    /// <summary>
    /// Deletes note by id
    /// </summary>
    [HttpDelete("{id}")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.NotFound)]
    public async Task<IActionResult> DeleteNote(
        [FromRoute] int id,
        [FromServices] DeleteNoteCommandHandler handler,
        CancellationToken cancellationToken)
    {
        var result = await handler.Handle(new DeleteNoteCommand(id), cancellationToken);

        return result switch
        {
            DeleteNoteResult.NotFound => NotFound(),
            DeleteNoteResult.Success => Ok(),
            _ => Conflict()
        };
    }
```

Replace the `DeleteNotes` action:
```csharp
    /// <summary>
    /// Deletes many notes by specified ids
    /// </summary>
    [HttpDelete("batch")]
    [ProducesResponseType((int)HttpStatusCode.OK)]
    [ProducesResponseType((int)HttpStatusCode.BadRequest)]
    public async Task<IActionResult> DeleteNotes(
        [FromBody] IEnumerable<int> ids,
        [FromServices] DeleteNotesCommandHandler handler,
        CancellationToken cancellationToken)
    {
        await handler.Handle(new DeleteNotesCommand(ids.ToList()), cancellationToken);
        return Ok();
    }
```

Add `using System.Linq;` to the file (for `ids.ToList()`) if not already present.

- [ ] **Step 11: Delete the old MediatR note requests and handlers** (includes the dead `EditNoteRequest`/`EditNoteRequestHandler`).

```bash
git rm src/FoodDiary.Application/Notes/Requests/DeleteNoteRequest.cs \
       src/FoodDiary.Application/Notes/Requests/DeleteNotesRequest.cs \
       src/FoodDiary.Application/Notes/Requests/EditNoteRequest.cs \
       src/FoodDiary.Application/Notes/Requests/GetNoteByIdRequest.cs \
       src/FoodDiary.Application/Notes/Requests/GetNotesByIdsRequest.cs \
       src/FoodDiary.Application/Notes/Handlers/DeleteNoteRequestHandler.cs \
       src/FoodDiary.Application/Notes/Handlers/DeleteNotesRequestHandler.cs \
       src/FoodDiary.Application/Notes/Handlers/EditNoteRequestHandler.cs \
       src/FoodDiary.Application/Notes/Handlers/GetNoteByIdRequestHandler.cs \
       src/FoodDiary.Application/Notes/Handlers/GetNotesByIdsRequestHandler.cs
```

- [ ] **Step 12: Build and run the unit tests.**

Run: `dotnet build && dotnet test tests/FoodDiary.UnitTests`
Expected: build succeeds; all UnitTests pass.

- [ ] **Step 13: Run the Notes component tests** (Docker required — confirm first; if unavailable, STOP and ask).

Run: `dotnet test tests/FoodDiary.ComponentTests --filter "FullyQualifiedName~NotesApiTests"`
Expected: all Notes scenarios pass (including delete and batch-delete).

- [ ] **Step 14: Commit.**

```bash
git add -A
git commit -m "Replace MediatR for note deletion with command handlers"
```

---

## Task 5: Auth `GetStatus` → `GetAuthStatus` query handler

Rename the MediatR auth handler to a plain query handler and rewire `AuthController`. This removes the last controller dependency on MediatR (`ISender`).

**Files:**
- Create: `src/FoodDiary.Application/Auth/GetStatus/GetAuthStatusQueryHandler.cs`
- Modify: `src/FoodDiary.Application/Extensions/ServiceCollectionExtensions.cs`
- Modify: `src/FoodDiary.API/Controllers/v1/AuthController.cs`
- Delete: `src/FoodDiary.Application/Auth/GetStatus/GetStatusRequestHandler.cs`

**Interfaces:**
- Consumes: `TimeProvider`, `IHttpContextAccessor`, `IOAuthClient`, `ILogger<GetAuthStatusQueryHandler>` (unchanged from the old handler); `AuthenticateResult?` passed in the query; `FoodDiary.Contracts.Auth.GetAuthStatusResponse`.
- Produces:
  - `GetAuthStatusQuery(AuthenticateResult? AuthResult)` → `GetAuthStatusResult` = `Authenticated` | `NotAuthenticated` via `GetAuthStatusQueryHandler.Handle`
  - DI: `services.AddAuth()`

- [ ] **Step 1: Create the renamed query handler** (same logic as `GetStatusRequestHandler`, converted from `IRequestHandler` to a plain public class).

Create `src/FoodDiary.Application/Auth/GetStatus/GetAuthStatusQueryHandler.cs`:
```csharp
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace FoodDiary.Application.Auth.GetStatus;

public record GetAuthStatusQuery(AuthenticateResult? AuthResult);

public abstract record GetAuthStatusResult
{
    public record NotAuthenticated : GetAuthStatusResult;

    public record Authenticated : GetAuthStatusResult;
}

public class GetAuthStatusQueryHandler(
    TimeProvider timeProvider,
    IHttpContextAccessor httpContextAccessor,
    IOAuthClient oAuthClient,
    ILogger<GetAuthStatusQueryHandler> logger)
{
    public async Task<GetAuthStatusResult> Handle(GetAuthStatusQuery query, CancellationToken cancellationToken)
    {
        if (query.AuthResult is null ||
            !query.AuthResult.Succeeded ||
            !query.AuthResult.Properties.IssuedUtc.HasValue)
        {
            return new GetAuthStatusResult.NotAuthenticated();
        }

        var userEmail = query.AuthResult.Principal.FindFirst(Constants.ClaimTypes.Email)?.Value;
        logger.LogInformation("Checking access token for user {UserEmail}...", userEmail);

        if (!ExistingTokenExpired(query.AuthResult.Properties.IssuedUtc.Value))
        {
            logger.LogInformation("User {UserEmail} has been successfully authenticated", userEmail);
            return new GetAuthStatusResult.Authenticated();
        }

        logger.LogInformation("Access token for user {UserEmail} expired. Attempting to refresh token...", userEmail);

        var existingAccessToken = query.AuthResult.Properties.GetTokenValue(Constants.OpenIdConnectParameters.AccessToken);
        var existingRefreshToken = query.AuthResult.Properties.GetTokenValue(Constants.OpenIdConnectParameters.RefreshToken);

        if (string.IsNullOrWhiteSpace(existingAccessToken) || string.IsNullOrWhiteSpace(existingRefreshToken))
        {
            logger.LogInformation("Access and/or refresh tokens for user {UserEmail} were not found", userEmail);
            return await NotAuthenticated();
        }

        var refreshTokenResult = await oAuthClient.RefreshToken(existingRefreshToken, cancellationToken);

        if (refreshTokenResult is not RefreshTokenResult.Success refreshTokenResponse)
        {
            logger.LogInformation("Could not refresh token for user {UserEmail}", userEmail);
            return await NotAuthenticated();
        }

        logger.LogInformation(
            "Token for user {UserEmail} has been successfully refreshed. Trying to get user info...",
            userEmail);

        var userInfoResult = await oAuthClient.GetUserInfo(refreshTokenResponse.AccessToken, cancellationToken);

        if (userInfoResult is GetUserInfoResult.Error)
        {
            logger.LogInformation("Could not retrieve user info for {UserEmail}", userEmail);
            return await NotAuthenticated();
        }

        var tokens = CreateNewTokens(refreshTokenResponse, existingRefreshToken);

        return await AuthenticatedWithNewTokens(query.AuthResult, tokens, userEmail);
    }

    private bool ExistingTokenExpired(DateTimeOffset existingTokenIssuedOn)
    {
        var accessTokenExpirationDate = existingTokenIssuedOn + Constants.AuthenticationParameters.AccessTokenRefreshInterval;
        var currentDate = timeProvider.GetUtcNow();

        return currentDate > accessTokenExpirationDate;
    }

    private async Task<GetAuthStatusResult> NotAuthenticated()
    {
        await httpContextAccessor.HttpContext.SignOutAsync(Constants.AuthenticationSchemes.Cookie);
        return new GetAuthStatusResult.NotAuthenticated();
    }

    private async Task<GetAuthStatusResult> AuthenticatedWithNewTokens(
        AuthenticateResult authResult,
        IEnumerable<AuthenticationToken> tokens,
        string? userEmail)
    {
        authResult.Properties.StoreTokens(tokens);
        authResult.Properties.Items.Remove(".issued");
        authResult.Properties.Items.Remove(".expires");

        await httpContextAccessor.HttpContext.SignInAsync(
            Constants.AuthenticationSchemes.Cookie,
            authResult.Principal,
            authResult.Properties);

        logger.LogInformation("User {UserEmail} has been successfully authenticated", userEmail);

        return new GetAuthStatusResult.Authenticated();
    }

    private IEnumerable<AuthenticationToken> CreateNewTokens(
        RefreshTokenResult.Success refreshTokenResponse,
        string existingRefreshToken)
    {
        var expiresAt = timeProvider.GetUtcNow() + TimeSpan.FromSeconds(refreshTokenResponse.ExpiresIn);

        return
        [
            new AuthenticationToken
            {
                Name = Constants.OpenIdConnectParameters.AccessToken,
                Value = refreshTokenResponse.AccessToken
            },

            new AuthenticationToken
            {
                Name = Constants.OpenIdConnectParameters.IdToken,
                Value = refreshTokenResponse.IdToken
            },

            new AuthenticationToken
            {
                Name = Constants.OpenIdConnectParameters.RefreshToken,
                Value = existingRefreshToken
            },

            new AuthenticationToken
            {
                Name = Constants.OpenIdConnectParameters.TokenType,
                Value = refreshTokenResponse.TokenType
            },

            new AuthenticationToken
            {
                Name = Constants.OpenIdConnectParameters.ExpiresAt,
                Value = expiresAt.ToString("o", CultureInfo.InvariantCulture)
            }
        ];
    }
}
```

- [ ] **Step 2: Delete the old auth handler.**

```bash
git rm src/FoodDiary.Application/Auth/GetStatus/GetStatusRequestHandler.cs
```

- [ ] **Step 3: Register the auth handler in Application DI.**

In `src/FoodDiary.Application/Extensions/ServiceCollectionExtensions.cs`, add:
```csharp
using FoodDiary.Application.Auth.GetStatus;
```
add `services.AddAuth();` to `AddApplicationDependencies`, and add the method:
```csharp
    private static void AddAuth(this IServiceCollection services)
    {
        services.AddScoped<GetAuthStatusQueryHandler>();
    }
```

- [ ] **Step 4: Rewrite `AuthController`** to drop `ISender` and inject the handler.

Replace the entire contents of `src/FoodDiary.API/Controllers/v1/AuthController.cs`:
```csharp
using System;
using System.Threading;
using System.Threading.Tasks;
using FoodDiary.Application.Auth.GetStatus;
using FoodDiary.Contracts.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FoodDiary.API.Controllers.v1;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    [HttpGet("login")]
    public IActionResult Login([FromQuery] string? returnUrl)
    {
        var redirectUrl = Url.Action("LoginCallback", "Auth", new { returnUrl });

        var properties = new AuthenticationProperties
        {
            RedirectUri = redirectUrl,
            AllowRefresh = true
        };

        return Challenge(properties, Constants.AuthenticationSchemes.OAuthGoogle);
    }

    [HttpGet("login-callback")]
    public IActionResult LoginCallback(string returnUrl = "/")
    {
        return Redirect($"/#/post-login?returnUrl={Uri.EscapeDataString(returnUrl)}");
    }

    [HttpGet("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await HttpContext.SignOutAsync(Constants.AuthenticationSchemes.Cookie);
        return SignOut(Constants.AuthenticationSchemes.Cookie);
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetStatus(
        [FromServices] GetAuthStatusQueryHandler handler,
        CancellationToken cancellationToken)
    {
        var authResult = await HttpContext.AuthenticateAsync(Constants.AuthenticationSchemes.OAuthGoogle);
        var result = await handler.Handle(new GetAuthStatusQuery(authResult), cancellationToken);

        return result switch
        {
            GetAuthStatusResult.Authenticated => Ok(new GetAuthStatusResponse { IsAuthenticated = true }),
            _ => Ok(new GetAuthStatusResponse { IsAuthenticated = false })
        };
    }
}
```

- [ ] **Step 5: Build and run the unit tests.**

Run: `dotnet build && dotnet test tests/FoodDiary.UnitTests`
Expected: build succeeds; all UnitTests pass.

- [ ] **Step 6: Run the Auth component tests** (Docker required — confirm first; if unavailable, STOP and ask).

Run: `dotnet test tests/FoodDiary.ComponentTests --filter "FullyQualifiedName~AuthTests"`
Expected: all Auth scenarios pass.

- [ ] **Step 7: Commit.**

```bash
git add -A
git commit -m "Replace MediatR for auth status with query handler"
```

---

## Task 6: Remove dead abstractions, AutoMapper, MediatR, and DI wiring

At this point no controller uses `IMediator`/`ISender`/`IMapper` and every old feature request/handler is deleted. This task removes the last shared dead code, the AutoMapper profile + DI, the MediatR DI, and all three package references, then gates the whole solution.

**Files:**
- Delete: `src/FoodDiary.Application/Abstractions/{CreateEntityRequest,DeleteEntityRequest,DeleteManyEntitiesRequest,EditEntityRequest,GetEntitiesByIdsRequest,GetEntityByIdRequest}.cs`
- Delete: `src/FoodDiary.API/AutoMapperProfile.cs`
- Modify: `src/FoodDiary.Application/Extensions/ServiceCollectionExtensions.cs` (drop `AddMediatR` + unused usings)
- Modify: `src/FoodDiary.API/Startup.cs` (drop `AddAutoMapper` + `using System.Reflection;`)
- Modify: `src/FoodDiary.API/FoodDiary.API.csproj` (drop `MediatR`, `AutoMapper.Extensions.Microsoft.DependencyInjection`)
- Modify: `src/FoodDiary.Application/FoodDiary.Application.csproj` (drop `MediatR.Extensions.Microsoft.DependencyInjection`)
- Modify: `Directory.Packages.props` (drop `MediatR`, `MediatR.Extensions.Microsoft.DependencyInjection`, `AutoMapper.Extensions.Microsoft.DependencyInjection`)

**Interfaces:**
- Consumes: nothing new.
- Produces: a solution with zero references to MediatR, AutoMapper, or FluentAssertions.

- [ ] **Step 1: Delete the shared abstraction base classes and the AutoMapper profile.**

```bash
git rm src/FoodDiary.Application/Abstractions/CreateEntityRequest.cs \
       src/FoodDiary.Application/Abstractions/DeleteEntityRequest.cs \
       src/FoodDiary.Application/Abstractions/DeleteManyEntitiesRequest.cs \
       src/FoodDiary.Application/Abstractions/EditEntityRequest.cs \
       src/FoodDiary.Application/Abstractions/GetEntitiesByIdsRequest.cs \
       src/FoodDiary.Application/Abstractions/GetEntityByIdRequest.cs \
       src/FoodDiary.API/AutoMapperProfile.cs
```

- [ ] **Step 2: Remove `AddMediatR` and unused usings from the Application DI.**

In `src/FoodDiary.Application/Extensions/ServiceCollectionExtensions.cs`:
- delete the line `services.AddMediatR(Assembly.GetExecutingAssembly());`
- delete `using System.Reflection;` and `using MediatR;`
- keep `using System.Runtime.CompilerServices;` and the `[assembly:InternalsVisibleTo("FoodDiary.UnitTests")]` line.

After this the method body is:
```csharp
    public static void AddApplicationDependencies(this IServiceCollection services)
    {
        services.AddApplicationServices();
        services.AddNotes();
        services.AddProducts();
        services.AddCategories();
        services.AddAuth();
    }
```

- [ ] **Step 3: Remove `AddAutoMapper` from `Startup`.**

In `src/FoodDiary.API/Startup.cs`:
- delete the line `services.AddAutoMapper(Assembly.GetExecutingAssembly());`
- delete `using System.Reflection;` (its only use was that call).

- [ ] **Step 4: Remove the package references from the csproj files.**

In `src/FoodDiary.API/FoodDiary.API.csproj`, delete:
```xml
    <PackageReference Include="MediatR" />
```
and
```xml
    <PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" />
```

In `src/FoodDiary.Application/FoodDiary.Application.csproj`, delete:
```xml
    <PackageReference Include="MediatR.Extensions.Microsoft.DependencyInjection" />
```

- [ ] **Step 5: Remove the package versions from central package management.**

In `Directory.Packages.props`, delete these three lines:
```xml
    <PackageVersion Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="8.1.1" />
    <PackageVersion Include="MediatR" Version="10.0.1" />
    <PackageVersion Include="MediatR.Extensions.Microsoft.DependencyInjection" Version="10.0.1" />
```

- [ ] **Step 6: Verify no references to the removed libraries remain in tracked source.**

Run: `git grep -n -E "MediatR|AutoMapper|FluentAssertions|IMediator|ISender|IRequestHandler|IMapper" -- '*.cs' '*.csproj' '*.props'`
Expected: no matches. If any appear, remove them before continuing.

- [ ] **Step 7: Build the whole solution (warnings-as-errors).**

Run: `dotnet build`
Expected: build succeeds with no warnings/errors. A `CS0246` here means a leftover `using MediatR;`/`using AutoMapper;` — fix and rebuild.

- [ ] **Step 8: Run the full test suite** (Docker required for component tests — confirm first; if unavailable, STOP and ask).

Run: `dotnet test`
Expected: every UnitTests and ComponentTests scenario passes (all endpoints exercised — a missing `AddScoped<Handler>()` would surface here as a DI failure, not ship silently).

- [ ] **Step 9: Commit.**

```bash
git add -A
git commit -m "Remove MediatR and AutoMapper packages, DI, and dead abstractions"
```

---

## Self-Review

**Spec coverage** (design doc → task):
- Part 1 (FluentAssertions → AwesomeAssertions): Task 1 — package swap, both csproj, `Usings.cs`, 5 unit test files, version confirmation.
- Part 2 (AutoMapper → mapping extensions): the read-projection mappers `Product.ToProductItemDto()` / `Category.ToCategoryItemDto()` **already exist** in `API/Mapping/` and are wired into the rewritten controllers (Tasks 2–3); the in-place `_mapper.Map(dto, entity)` updates become field assignments in `Update{Product,Category}CommandHandler`; `_mapper.Map<Category>(dto)` on create becomes `new Category { Name }`; the dead `Category → CategoryAutocompleteItemDto` map and `AutoMapperProfile` are removed (Task 6). *(Deviation from spec text, which said to create the two `ToXxx()` extensions — they already existed; noted here and handled by reuse.)*
- Part 3 (MediatR → consolidated handlers): every endpoint in the design's mapping table has a task — Categories Get/Create/Update/Delete (Task 2), Products Get/Create/Update/Delete/Batch-delete (Task 3), Notes Delete/Batch-delete (Task 4), Auth status (Task 5). Behavior-preservation list honored: update name-conflict rule (`nameChanged && sameName.Any()`) tested in Tasks 2 & 3; create name-conflict tested; note-delete display-order recalculation tested (Task 4); single `SaveChanges` per command; `GET /products` always loads category + total count (Task 3 `GetProductsQueryHandler`). Intentional empty-batch short-circuit implemented and tested (Task 4).
- Part 4 (DI, controllers, removed artifacts): handler registrations grouped by feature across Tasks 2–5; `AddMediatR`/`AddAutoMapper` removed and all listed files deleted (Task 6); `CreateProductResponse` alias removed via the `CreateProductResult` rename (Task 3).
- Part 5 (Testing): new unit tests for all fallible branches (AlreadyExists / NotFound / NameAlreadyExists incl. name-unchanged / display-order recalc / empty short-circuit); component tests run per feature and full-suite gate in Task 6. `dotnet build` + `dotnet test` gates on every task.
- Out of scope respected: no repository v1→v2 migration, no minimal-API conversion, no contract/response changes, no README/CLAUDE.md changes.

**Placeholder scan:** none — every code step contains complete file content; every run step has an exact command and expected result.

**Type consistency:** result unions and handler names are used identically across tasks and controllers — `CreateCategoryResult.{Success,NameAlreadyExists}`, `UpdateCategoryResult.{Success,NotFound,NameAlreadyExists}`, `DeleteCategoryResult.{Success,NotFound}`, `CreateProductResult.{Success,ProductAlreadyExists}`, `UpdateProductResult.{Success,NotFound,NameAlreadyExists}`, `DeleteProductResult.{Success,NotFound}`, `DeleteProductsResult.Success`, `DeleteNoteResult.{Success,NotFound}`, `DeleteNotesResult.Success`, `GetAuthStatusResult.{Authenticated,NotAuthenticated}`. Repository choice is consistent: v1 everywhere except `CreateProductCommandHandler` (v2, matching the current create handler). DI method names (`AddNotes`/`AddProducts`/`AddCategories`/`AddAuth`) match their registration sites.

One deliberate scope addition surfaced during planning: `Product` nutrition properties change `init`→`set` (Task 3, Step 1) to allow the hand-written edit to assign them — behavior-equivalent to the AutoMapper edit path, which wrote those properties via reflection.
