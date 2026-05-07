# Recognize Note — Accuracy & Robustness Improvements

## Goal

Improve quality and accuracy of food recognition from images, fix known crash modes, and make the OpenAI model name configurable so future model migrations are config-only.

## In scope

- Switch the default OpenAI model and make the name configurable via `appsettings`.
- Rewrite system + user prompts to address known accuracy bugs.
- Replace the model response schema so it both expresses a "not a product" outcome and accepts numeric types the model actually emits.
- Map a "not a product" outcome to an HTTP 400 validation error.

## Out of scope

- Frontend changes. The existing API contract (`RecognizeNoteResponse`) is preserved.
- Cost optimisation beyond prompt brevity and a single model call.
- Live integration tests against the real OpenAI API.

## Behavioural cases

1. Image is a product label (full or partial nutrients): map and fill **every recognizable, visible** field. Leave non-recognizable optional fields at default (null). No guessing.
2. Image is a product photo without label: fill **every possible** field from the model's own knowledge. Guessing allowed.
3. Image(s) contain no product: API responds with HTTP 400 validation error.
4. Multiple images of the same product (e.g. label split across sides): same as case 1, merging information across images.
5. Multiple images of different products: keep the largest/most prominent product, ignore the rest. Do not ask the user.

## Known issues addressed

- Misses nutrients (and sometimes energy) that are clearly visible on labels — addressed by switching to a stronger model and an explicit per-rule prompt.
- Outputs energy for the entire package instead of per 100 g — addressed by an explicit per-100 g rule and conversion instruction in the prompt.
- Outputs energy in joules — addressed by an explicit kcal-only rule in both system and user prompts.
- Crash when the model returns a fractional value for `Calories` (an `int`) — addressed by changing the model schema field to `decimal?` and rounding once at the mapping boundary.
- Crash when the model returns a string (e.g. `"null"`) into a numeric field — addressed by an explicit "numbers must be numeric, never strings" rule in the system prompt and the discriminated schema below.

## Configuration

Extend `OpenAIOptions` (in `FoodDiary.Integrations.OpenAI`):

```csharp
public class OpenAIOptions
{
    public required string BaseUrl { get; init; }
    public required string ApiKey { get; init; }
    public required string Model { get; init; }
}
```

`DependencyInjectionExtensions.AddOpenAIIntegration` reads `Model` from `IOptions<OpenAIOptions>` and passes it to `GetChatClient(...)` instead of the hardcoded `"gpt-5-nano"` literal.

`appsettings.json` adds `Integrations:OpenAI:Model` with the chosen default (configurable per environment). README and CLAUDE.md sections that list OpenAI settings are updated to mention the new key.

## Schema

Replace `FoodItemOnTheImage` with a discriminated wrapper. `Calories` becomes `decimal?` to match what the model emits; rounding to int happens once during mapping. All other numeric fields remain nullable so unrecognized label values stay null in case 1.

```csharp
public enum RecognitionStatus { Recognized, NotAProduct }

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

Mapping (`MappingExtensions.ToRecognizeNoteItem`) rounds `Calories` to int via `Math.Round(value, MidpointRounding.AwayFromZero)` and returns `100` when null (existing default). Other nutrients keep the existing 2-dp rounding.

## Prompts

System prompt:

```
You analyze food images for a calorie tracker. Return strictly the JSON schema you are given. Numbers must be numeric (never strings, never "null"). All energy values are kilocalories (kcal), never joules.
```

User prompt (sent alongside the image parts):

```
Identify the food/product in the image(s) and fill the schema using these rules:

1. If no image contains food or a product, set status=NotAProduct and product=null.
2. If a nutrition label is visible, fill every field that is printed on the label. Leave unprinted optional fields null. Do not guess label values.
3. If only a product photo (no label) is shown, fill every field from your own knowledge of that product.
4. If multiple images show the same product (e.g. front + back of a label), merge information across them as one product.
5. If multiple images show different products, keep only the largest/most prominent one and ignore the rest.

All energy/nutrient values are per 100 g of product, not per package. Convert if the label only shows per-serving or per-package values. Calories are kilocalories (kcal). Keep product names in their original language; do not translate. Start the name with an uppercase letter.
```

## Handler flow

`RecognizeNoteCommandHandler.Handle`:

1. Filter `command.Files` to `image/*`. If empty, return `RecognizeNoteResult.NoImagesProvided()` (unchanged).
2. Build system + user `ChatMessage`s and call `chatClient.GetResponseAsync<RecognizeNoteModelResponse>(...)`.
3. If `TryGetResult` fails, log and return `RecognizeNoteResult.ModelResponseWasInvalid()` (unchanged).
4. If `Status == NotAProduct` or `Product is null`, return new `RecognizeNoteResult.NotAProductImage()` — a `Failure` carrying `Error.ValidationError("Uploaded image(s) do not contain a recognizable product")`. The existing controller-level error mapping turns this into HTTP 400; no new error variant or controller change needed.
5. Otherwise map `Product` to `RecognizeNoteItem` and return `Success`.

`CreateUserMessage` and `GetBytes` are unchanged.

## Error contract

| Outcome | Result | HTTP |
|---|---|---|
| No image files in upload | `NoImagesProvided` (existing) | 400 |
| Images present, none contain a product | `NotAProductImage` (new) | 400 |
| Model output couldn't be deserialized | `ModelResponseWasInvalid` (existing) | 500 |
| Recognized product | `Success` | 200 |

## Test plan

Unit tests in `FoodDiary.UnitTests`, mocking `IChatClient`:

- Empty/no-image-files input → `NoImagesProvided`.
- Model returns `Status=NotAProduct` → `Failure` carrying the not-a-product validation error.
- Model returns `Status=Recognized` with `Product=null` → same as above (defensive).
- Recognized product with all nutrients populated → mapped to `RecognizeNoteItem`; `CaloriesCost` is the rounded int of the decimal `Calories`.
- Recognized product with only `Calories` set → other nutrients are null; `Quantity` defaults to 100.
- `BrandName` set → product name in result is `"<Name> (<BrandName>)"`.
- Deserialization failure (`TryGetResult` returns false) → `ModelResponseWasInvalid`.

No live OpenAI calls in the test suite. Prompt-quality validation is done via manual smoke tests against the real model post-deploy.

## Risks

- The model occasionally misclassifies a real product image as `NotAProduct`. Mitigation: explicit rule wording. Acceptable failure mode — user can retake the photo.
- The new model may have different JSON-mode behaviour than `gpt-5-nano`. Mitigation: model name is now config, so a rollback is a config change.
