# Recognize Note Improvements — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve image-based food recognition accuracy, fix known crash modes, and make the OpenAI model name configurable.

**Architecture:** Single LLM call with a discriminated structured-output schema (`Recognized` vs `NotAProduct`). Numeric crash modes fixed by changing `Calories` to `decimal?` in the model schema and rounding once at the mapping boundary. Model name is read from `IOptions<OpenAIOptions>` instead of being hardcoded.

**Tech Stack:** .NET 8, `Microsoft.Extensions.AI`, `OpenAI` SDK, xUnit + Moq + FluentAssertions.

**Spec:** `docs/superpowers/specs/2026-05-07-recognize-note-improvements-design.md`

---

## File map

- Modify: `src/backend/src/FoodDiary.Integrations.OpenAI/OpenAIOptions.cs` — add `Model`.
- Modify: `src/backend/src/FoodDiary.Integrations.OpenAI/Extensions/DependencyInjectionExtensions.cs` — read `Model` from options.
- Modify: `src/backend/src/FoodDiary.API/appsettings.json` — add default model.
- Modify: `src/backend/src/FoodDiary.API/appsettings.Development.json` — add dev model if it overrides OpenAI section (verify first).
- Replace: `src/backend/src/FoodDiary.Application/Notes/Recognize/FoodItemOnTheImage.cs` → `RecognizeNoteModelResponse.cs` containing `RecognitionStatus`, `RecognizeNoteModelResponse`, `RecognizedProduct`.
- Modify: `src/backend/src/FoodDiary.Application/Notes/Recognize/RecognizeNoteContracts.cs` — update `MappingExtensions.ToRecognizeNoteItem` to consume `RecognizedProduct` and round decimal `Calories` to int.
- Modify: `src/backend/src/FoodDiary.Application/Notes/Recognize/RecognizeNoteResult.cs` — add `NotAProductImage()` helper.
- Modify: `src/backend/src/FoodDiary.Application/Notes/Recognize/RecognizeNoteCommandHandler.cs` — new prompts, new schema generic, status branching.
- Create: `src/backend/tests/FoodDiary.UnitTests/Notes/Recognize/MappingExtensionsTests.cs`.
- Create: `src/backend/tests/FoodDiary.UnitTests/Notes/Recognize/RecognizeNoteCommandHandlerTests.cs`.
- Modify: `README.md` and `CLAUDE.md` — mention `Integrations:OpenAI:Model`.

---

## Task 1: Make OpenAI model name configurable

**Files:**
- Modify: `src/backend/src/FoodDiary.Integrations.OpenAI/OpenAIOptions.cs`
- Modify: `src/backend/src/FoodDiary.Integrations.OpenAI/Extensions/DependencyInjectionExtensions.cs`
- Modify: `src/backend/src/FoodDiary.API/appsettings.json`

- [ ] **Step 1: Add `Model` to `OpenAIOptions`**

Replace the body of `OpenAIOptions.cs`:

```csharp
using System.Diagnostics.CodeAnalysis;

namespace FoodDiary.Integrations.OpenAI;

[SuppressMessage("ReSharper", "InconsistentNaming")]
public class OpenAIOptions
{
    public required string BaseUrl { get; init; }
    public required string ApiKey { get; init; }
    public required string Model { get; init; }
}
```

- [ ] **Step 2: Read `Model` from options in DI**

In `DependencyInjectionExtensions.cs`, inside `AddOpenAIIntegration`, change the `AddChatClient` registration so `GetChatClient` uses `options.Model` instead of the hardcoded `"gpt-5-nano"`:

```csharp
services.AddChatClient(provider =>
{
    var options = provider.GetRequiredService<IOptions<OpenAIOptions>>().Value;
    return provider.GetRequiredService<OpenAIClient>()
        .GetChatClient(options.Model)
        .AsIChatClient()
        .AsBuilder()
        .UseLogging(provider.GetRequiredService<ILoggerFactory>())
        .Build();
});
```

- [ ] **Step 3: Add default model to `appsettings.json`**

In `src/backend/src/FoodDiary.API/appsettings.json`, change the `Integrations.OpenAI` section to:

```json
"Integrations": {
  "OpenAI": {
    "BaseUrl": "https://api.openai.com/v1",
    "ApiKey": "<secrets>",
    "Model": "gpt-5-mini"
  }
}
```

- [ ] **Step 4: Build the backend**

Run: `dotnet build src/backend/FoodDiary.sln`
Expected: build succeeds with no errors related to `OpenAIOptions`.

- [ ] **Step 5: Commit**

```bash
git add src/backend/src/FoodDiary.Integrations.OpenAI src/backend/src/FoodDiary.API/appsettings.json
git commit -m "Make OpenAI model name configurable via appsettings"
```

---

## Task 2: Introduce new model response schema

**Files:**
- Delete: `src/backend/src/FoodDiary.Application/Notes/Recognize/FoodItemOnTheImage.cs`
- Create: `src/backend/src/FoodDiary.Application/Notes/Recognize/RecognizeNoteModelResponse.cs`

- [ ] **Step 1: Create new schema file**

Create `RecognizeNoteModelResponse.cs` with:

```csharp
using System.ComponentModel;

namespace FoodDiary.Application.Notes.Recognize;

public enum RecognitionStatus
{
    Recognized,
    NotAProduct
}

public record RecognizeNoteModelResponse(
    [property: Description("Recognized when at least one product/food is visible; NotAProduct when no food/product is on any image.")]
    RecognitionStatus Status,
    [property: Description("The recognized product. Required when Status is Recognized; null otherwise.")]
    RecognizedProduct? Product = null);

public record RecognizedProduct(
    [property: Description("Product name. Start with uppercase. Keep original language from the label, do not translate.")]
    string Name,
    [property: Description("Product quantity in grams. Default 100 when unknown.")]
    int? Quantity = null,
    [property: Description("Calories in kilocalories per 100 g. Never joules. Numeric only.")]
    decimal? Calories = null,
    [property: Description("Brand name from the label, if visible.")]
    string? BrandName = null,
    [property: Description("Protein in grams per 100 g.")]
    decimal? Protein = null,
    [property: Description("Fats in grams per 100 g.")]
    decimal? Fats = null,
    [property: Description("Carbohydrates in grams per 100 g.")]
    decimal? Carbs = null,
    [property: Description("Sugar in grams per 100 g.")]
    decimal? Sugar = null,
    [property: Description("Salt in grams per 100 g.")]
    decimal? Salt = null);
```

- [ ] **Step 2: Delete the old schema file**

Run: `rm src/backend/src/FoodDiary.Application/Notes/Recognize/FoodItemOnTheImage.cs`

The build will fail at this point because `MappingExtensions.ToRecognizeNoteItem` and the handler still reference `FoodItemOnTheImage`. Tasks 3 and 4 fix that. Do not commit yet.

---

## Task 3: Update mapping to consume `RecognizedProduct`

**Files:**
- Modify: `src/backend/src/FoodDiary.Application/Notes/Recognize/RecognizeNoteContracts.cs`
- Create: `src/backend/tests/FoodDiary.UnitTests/Notes/Recognize/MappingExtensionsTests.cs`

- [ ] **Step 1: Write failing tests for the mapping**

Create `src/backend/tests/FoodDiary.UnitTests/Notes/Recognize/MappingExtensionsTests.cs`:

```csharp
using FluentAssertions;
using FoodDiary.Application.Notes.Recognize;
using Xunit;

namespace FoodDiary.UnitTests.Notes.Recognize;

public class MappingExtensionsTests
{
    [Fact]
    public void ToRecognizeNoteItem_AllFieldsPopulated_MapsAndRoundsCalories()
    {
        var product = new RecognizedProduct(
            Name: "Bread",
            Quantity: 200,
            Calories: 257.6m,
            BrandName: "Acme",
            Protein: 8.123m,
            Fats: 2.5m,
            Carbs: 48.456m,
            Sugar: 3.2m,
            Salt: 0.5m);

        var result = product.ToRecognizeNoteItem();

        result.Quantity.Should().Be(200);
        result.Product.Name.Should().Be("Bread (Acme)");
        result.Product.CaloriesCost.Should().Be(258);
        result.Product.Protein.Should().Be(8.12m);
        result.Product.Fats.Should().Be(2.50m);
        result.Product.Carbs.Should().Be(48.46m);
        result.Product.Sugar.Should().Be(3.20m);
        result.Product.Salt.Should().Be(0.50m);
    }

    [Fact]
    public void ToRecognizeNoteItem_OnlyName_AppliesDefaults()
    {
        var product = new RecognizedProduct(Name: "Apple");

        var result = product.ToRecognizeNoteItem();

        result.Quantity.Should().Be(100);
        result.Product.Name.Should().Be("Apple");
        result.Product.CaloriesCost.Should().Be(100);
        result.Product.Protein.Should().BeNull();
        result.Product.Fats.Should().BeNull();
        result.Product.Carbs.Should().BeNull();
        result.Product.Sugar.Should().BeNull();
        result.Product.Salt.Should().BeNull();
    }

    [Fact]
    public void ToRecognizeNoteItem_BlankBrandName_OmitsBrandSuffix()
    {
        var product = new RecognizedProduct(Name: "Apple", BrandName: "   ");

        var result = product.ToRecognizeNoteItem();

        result.Product.Name.Should().Be("Apple");
    }

    [Fact]
    public void ToRecognizeNoteItem_FractionalCaloriesHalfwayUp_RoundsAwayFromZero()
    {
        var product = new RecognizedProduct(Name: "X", Calories: 0.5m);

        var result = product.ToRecognizeNoteItem();

        result.Product.CaloriesCost.Should().Be(1);
    }
}
```

- [ ] **Step 2: Run tests to verify they fail (compile error is fine — old type is gone)**

Run: `dotnet test src/backend/tests/FoodDiary.UnitTests --filter "FullyQualifiedName~MappingExtensionsTests"`
Expected: Build/test fails because `ToRecognizeNoteItem` does not accept `RecognizedProduct` yet.

- [ ] **Step 3: Update `MappingExtensions` in `RecognizeNoteContracts.cs`**

Replace the `MappingExtensions` class in `RecognizeNoteContracts.cs` (file path: `src/backend/src/FoodDiary.Application/Notes/Recognize/RecognizeNoteContracts.cs`):

```csharp
public static class MappingExtensions
{
    public static RecognizeNoteItem ToRecognizeNoteItem(this RecognizedProduct product)
    {
        return new RecognizeNoteItem(
            Product: new RecognizeProductItem(
                Name: string.IsNullOrWhiteSpace(product.BrandName)
                    ? product.Name
                    : $"{product.Name} ({product.BrandName})",
                CaloriesCost: product.Calories.HasValue
                    ? (int)Math.Round(product.Calories.Value, MidpointRounding.AwayFromZero)
                    : 100,
                Protein: product.Protein.ToRoundedNutritionQuantity(),
                Fats: product.Fats.ToRoundedNutritionQuantity(),
                Carbs: product.Carbs.ToRoundedNutritionQuantity(),
                Sugar: product.Sugar.ToRoundedNutritionQuantity(),
                Salt: product.Salt.ToRoundedNutritionQuantity()),
            Quantity: product.Quantity ?? 100);
    }

    private static decimal? ToRoundedNutritionQuantity(this decimal? value) =>
        value.HasValue ? Math.Round(value.GetValueOrDefault(), 2) : null;
}
```

(Keep the `using System;` import; add it if missing.)

- [ ] **Step 4: Run mapping tests, expect pass**

Run: `dotnet test src/backend/tests/FoodDiary.UnitTests --filter "FullyQualifiedName~MappingExtensionsTests"`
Expected: 4 tests pass.

The handler still does not compile because it references `FoodItemOnTheImage`. Task 5 fixes that. Do not commit yet — Task 4 adds the result helper that Task 5 depends on.

---

## Task 4: Add `NotAProductImage` result helper

**Files:**
- Modify: `src/backend/src/FoodDiary.Application/Notes/Recognize/RecognizeNoteResult.cs`

- [ ] **Step 1: Add the helper**

In `RecognizeNoteResult.cs`, add a new static factory method next to the existing helpers:

```csharp
public static Failure NotAProductImage() =>
    new(new Error.ValidationError("Uploaded image(s) do not contain a recognizable product"));
```

The full file should now contain `NoImagesProvided`, `NotAProductImage`, and `ModelResponseWasInvalid`.

- [ ] **Step 2: Build**

Run: `dotnet build src/backend/src/FoodDiary.Application`
Expected: builds (the handler still won't, but the Application project's contract types do).

---

## Task 5: Update handler — new prompts, schema generic, status branching, and unit tests

**Files:**
- Modify: `src/backend/src/FoodDiary.Application/Notes/Recognize/RecognizeNoteCommandHandler.cs`
- Create: `src/backend/tests/FoodDiary.UnitTests/Notes/Recognize/RecognizeNoteCommandHandlerTests.cs`

- [ ] **Step 1: Write failing handler tests**

Create `src/backend/tests/FoodDiary.UnitTests/Notes/Recognize/RecognizeNoteCommandHandlerTests.cs`:

```csharp
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using FluentAssertions;
using FoodDiary.Application.Notes.Recognize;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using Xunit;

namespace FoodDiary.UnitTests.Notes.Recognize;

public class RecognizeNoteCommandHandlerTests
{
    [Fact]
    public async Task Handle_NoImageFiles_ReturnsNoImagesProvided()
    {
        var handler = CreateHandler(out _);
        var command = new RecognizeNoteCommand(new List<IFormFile>
        {
            CreateFile("note.txt", "text/plain")
        });

        var result = await handler.Handle(command, CancellationToken.None);

        result.Should().BeOfType<RecognizeNoteResult.Failure>()
            .Which.Error.Should().BeOfType<Error.ValidationError>();
    }

    [Fact]
    public async Task Handle_StatusNotAProduct_ReturnsValidationFailure()
    {
        var handler = CreateHandler(out var chatClient);
        SetupChatJson(chatClient, """{"Status":"NotAProduct","Product":null}""");

        var result = await handler.Handle(SingleImageCommand(), CancellationToken.None);

        result.Should().BeOfType<RecognizeNoteResult.Failure>()
            .Which.Error.Should().BeOfType<Error.ValidationError>()
            .Which.Message.Should().Contain("recognizable product");
    }

    [Fact]
    public async Task Handle_StatusRecognizedButProductNull_ReturnsValidationFailure()
    {
        var handler = CreateHandler(out var chatClient);
        SetupChatJson(chatClient, """{"Status":"Recognized","Product":null}""");

        var result = await handler.Handle(SingleImageCommand(), CancellationToken.None);

        result.Should().BeOfType<RecognizeNoteResult.Failure>()
            .Which.Error.Should().BeOfType<Error.ValidationError>();
    }

    [Fact]
    public async Task Handle_RecognizedProduct_MapsToSuccess()
    {
        var handler = CreateHandler(out var chatClient);
        SetupChatJson(chatClient, """
            {
              "Status": "Recognized",
              "Product": {
                "Name": "Bread",
                "Quantity": 200,
                "Calories": 257.6,
                "BrandName": "Acme",
                "Protein": 8.1,
                "Fats": 2.5,
                "Carbs": 48.4,
                "Sugar": 3.2,
                "Salt": 0.5
              }
            }
            """);

        var result = await handler.Handle(SingleImageCommand(), CancellationToken.None);

        var success = result.Should().BeOfType<RecognizeNoteResult.Success>().Subject;
        success.Response.Notes.Should().HaveCount(1);
        success.Response.Notes[0].Quantity.Should().Be(200);
        success.Response.Notes[0].Product.CaloriesCost.Should().Be(258);
        success.Response.Notes[0].Product.Name.Should().Be("Bread (Acme)");
    }

    [Fact]
    public async Task Handle_ModelReturnsUnparseableJson_ReturnsModelResponseWasInvalid()
    {
        var handler = CreateHandler(out var chatClient);
        SetupChatJson(chatClient, "not json");

        var result = await handler.Handle(SingleImageCommand(), CancellationToken.None);

        result.Should().BeOfType<RecognizeNoteResult.Failure>()
            .Which.Error.Should().BeOfType<Error.InternalServerError>();
    }

    private static RecognizeNoteCommand SingleImageCommand() =>
        new(new List<IFormFile> { CreateFile("a.jpg", "image/jpeg") });

    private static IFormFile CreateFile(string name, string contentType)
    {
        var bytes = Encoding.UTF8.GetBytes("fake");
        var stream = new MemoryStream(bytes);
        return new FormFile(stream, 0, bytes.Length, name, name)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType
        };
    }

    private static RecognizeNoteCommandHandler CreateHandler(out Mock<IChatClient> chatClient)
    {
        chatClient = new Mock<IChatClient>();
        return new RecognizeNoteCommandHandler(
            chatClient.Object,
            NullLogger<RecognizeNoteCommandHandler>.Instance);
    }

    private static void SetupChatJson(Mock<IChatClient> chatClient, string json)
    {
        var response = new ChatResponse(new ChatMessage(ChatRole.Assistant, json));
        chatClient
            .Setup(c => c.GetResponseAsync(
                It.IsAny<IEnumerable<ChatMessage>>(),
                It.IsAny<ChatOptions?>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(response);
    }
}
```

> Note: `GetResponseAsync<T>` is an extension that calls the underlying `IChatClient.GetResponseAsync(messages, ChatOptions, ct)` and then deserializes the assistant message text. Returning JSON in the assistant message exercises the real deserialization path.

- [ ] **Step 2: Replace handler body**

Replace the body of `RecognizeNoteCommandHandler.cs` with:

```csharp
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.AI;
using Microsoft.Extensions.Logging;

namespace FoodDiary.Application.Notes.Recognize;

public record RecognizeNoteCommand(IReadOnlyList<IFormFile> Files);

public class RecognizeNoteCommandHandler(IChatClient chatClient, ILogger<RecognizeNoteCommandHandler> logger)
{
    private const string SystemPrompt =
        "You analyze food images for a calorie tracker. Return strictly the JSON schema you are given. " +
        "Numbers must be numeric (never strings, never \"null\"). " +
        "All energy values are kilocalories (kcal), never joules.";

    private const string UserPrompt =
        "Identify the food/product in the image(s) and fill the schema using these rules:\n" +
        "1. If no image contains food or a product, set status=NotAProduct and product=null.\n" +
        "2. If a nutrition label is visible, fill every field that is printed on the label. Leave unprinted optional fields null. Do not guess label values.\n" +
        "3. If only a product photo (no label) is shown, fill every field from your own knowledge of that product.\n" +
        "4. If multiple images show the same product (e.g. front + back of a label), merge information across them as one product.\n" +
        "5. If multiple images show different products, keep only the largest/most prominent one and ignore the rest.\n\n" +
        "All energy/nutrient values are per 100 g of product, not per package. Convert if the label only shows per-serving or per-package values. " +
        "Calories are kilocalories (kcal). Keep product names in their original language; do not translate. Start the name with an uppercase letter.";

    public async Task<RecognizeNoteResult> Handle(RecognizeNoteCommand command, CancellationToken cancellationToken)
    {
        var images = command.Files
            .Where(file => file.ContentType.StartsWith("image/"))
            .ToList()
            .AsReadOnly();

        if (images.Count == 0)
        {
            return RecognizeNoteResult.NoImagesProvided();
        }

        var systemMessage = new ChatMessage(ChatRole.System, SystemPrompt);
        var userMessage = await CreateUserMessage(images, cancellationToken);

        var chatResponse = await chatClient.GetResponseAsync<RecognizeNoteModelResponse>(
            messages: [systemMessage, userMessage],
            cancellationToken: cancellationToken);

        if (!chatResponse.TryGetResult(out var modelResponse))
        {
            logger.LogError("Could not deserialize model response {ModelResponse}", chatResponse.Text);
            return RecognizeNoteResult.ModelResponseWasInvalid();
        }

        logger.LogInformation("Deserialized model response: {ModelResponse}", chatResponse.Text);

        if (modelResponse.Status == RecognitionStatus.NotAProduct || modelResponse.Product is null)
        {
            return RecognizeNoteResult.NotAProductImage();
        }

        return new RecognizeNoteResult.Success(
            new RecognizeNoteResponse([modelResponse.Product.ToRecognizeNoteItem()]));
    }

    private static async Task<ChatMessage> CreateUserMessage(
        IReadOnlyCollection<IFormFile> images,
        CancellationToken cancellationToken)
    {
        var imageTasks = images.Select(image => GetBytes(image, cancellationToken));
        var imageBytes = await Task.WhenAll(imageTasks);

        var imageContents = images
            .Zip(imageBytes, (image, data) => new DataContent(data, image.ContentType))
            .ToList();

        return new ChatMessage(
            role: ChatRole.User,
            contents: [..imageContents, new TextContent(UserPrompt)]);
    }

    private static async Task<byte[]> GetBytes(IFormFile file, CancellationToken cancellationToken)
    {
        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream, cancellationToken);
        return memoryStream.ToArray();
    }
}
```

- [ ] **Step 3: Run unit tests**

Run: `dotnet test src/backend/tests/FoodDiary.UnitTests`
Expected: all tests pass, including the 5 new handler tests and 4 mapping tests. If `Moq` cannot mock `IChatClient.GetResponseAsync` because the real method signature differs, switch the test setup to a hand-rolled `FakeChatClient : IChatClient` that returns the canned `ChatResponse` from its `GetResponseAsync` override and throws from the streaming/metadata members.

- [ ] **Step 4: Build the whole solution**

Run: `dotnet build src/backend/FoodDiary.sln`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add src/backend/src/FoodDiary.Application/Notes/Recognize \
        src/backend/tests/FoodDiary.UnitTests/Notes
git commit -m "Rework note recognition: discriminated schema, decimal calories, NotAProduct branch"
```

---

## Task 6: Update docs

**Files:**
- Modify: `README.md`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Update README**

Find the section that lists OpenAI-related configuration (search for `Integrations:OpenAI` or `Integrations.OpenAI` in `README.md`). Add a bullet for `Integrations:OpenAI:Model` describing it as the OpenAI model used for note recognition (e.g. `gpt-5-mini`). Keep wording consistent with the existing entries.

- [ ] **Step 2: Update CLAUDE.md**

In `CLAUDE.md`, the "Required user-secrets on `FoodDiary.API`" line currently lists `Auth:AllowedEmails:0`, `ConnectionStrings:Default`, optional `Integrations:OpenAI:ApiKey`. Update the OpenAI line to: `optional Integrations:OpenAI:ApiKey and Integrations:OpenAI:Model (overrides default)`.

- [ ] **Step 3: Commit**

```bash
git add README.md CLAUDE.md
git commit -m "Document Integrations:OpenAI:Model setting"
```

---

## Task 7: Final verification

- [ ] **Step 1: Build whole solution**

Run: `dotnet build src/backend/FoodDiary.sln`
Expected: success, no warnings introduced.

- [ ] **Step 2: Run all backend tests**

Run: `dotnet test src/backend/FoodDiary.sln`
Expected: all tests pass.

- [ ] **Step 3: Manual smoke test (out of scope for automated tests — note in PR description)**

Start the API locally with a real `Integrations:OpenAI:ApiKey` and `Model` set, upload three classes of images (label, photo without label, non-product), and confirm:
- Label image fills nutrients correctly and energy is per 100 g in kcal.
- Photo-only image fills all fields from model knowledge.
- Non-product image returns HTTP 400 with the not-a-product message.

---

## Self-review notes

- Spec coverage: configuration (Task 1), schema (Task 2), mapping incl. decimal→int rounding (Task 3), error contract (Task 4), handler + prompts (Task 5), docs (Task 6). All five behavioural cases are encoded in the prompt; tests cover the not-a-product, recognized, and parse-failure branches.
- Type consistency: `RecognizedProduct`, `RecognizeNoteModelResponse`, `RecognitionStatus` referenced identically across Tasks 2, 3, 5.
- The Moq-on-`IChatClient` setup has a documented fallback to a hand-rolled fake in case the interface signature varies between `Microsoft.Extensions.AI` versions.
