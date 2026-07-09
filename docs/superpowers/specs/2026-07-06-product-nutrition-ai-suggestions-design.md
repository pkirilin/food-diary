# Product Form — AI Nutrition Suggestions

## Goal

Let the user fill a product's calories and nutrients per 100 g with one click, so they don't have to look values up manually. Two motivating problems:

1. Adding a new product means searching the internet for its calories/nutrients — slow and annoying.
2. Existing products have empty nutrient fields, which make the nutrition summary imprecise and trigger the "Some nutritional values are missing" alert.

The solution: an `AutoAwesomeIcon` "suggest" button on each nutrition input that asks the AI to estimate per-100 g values for the typed product name and fills the form.

## In scope

- New endpoint `POST /api/v1/products/nutrition/suggestions` — given a product name, returns estimated per-100 g calories + macros.
- New backend Application feature `Products/SuggestNutrition`, modelled on `Notes/Recognize`.
- Frontend: a suggest button on the 6 nutrition inputs (`calories`, `protein`, `fats`, `carbs`, `sugar`, `salt`), fill logic, loading/disabled states, and an error Snackbar.
- The feature lights up in **both** places `ProductForm` is used: the products page dialog (`ProductInputDialog`) and the inline create-product dialog in the note flow (`NoteInputDialog`).
- MSW mock for the demo build; backend unit + component tests; frontend component tests.

## Out of scope

- Sending the user's already-filled field values to the AI. The request carries **only the product name**; the AI estimates all six values from its own knowledge. Already-filled fields are preserved client-side by the fill rule.
- A "not a real food" status. If the model can't estimate a field it returns `null` for it; the endpoint stays a plain best-effort estimator.
- Batch/bulk fill across many products, persistence of suggestions, or per-field API calls (one call returns all six; the client decides what to apply).
- A global snackbar/notification system. The error toast is local to the form (see Frontend).

## Behavioural cases

The suggest button appears as an adornment on the 6 nutrition inputs only — not on `name`, `category`, or `defaultQuantity`.

**Gating:** the buttons are **disabled until `name` is valid** (trimmed length ≥ 3, matching `productSchema`). The AI needs a name, and this avoids pointless calls.

**Fill rule (unified):** one click calls the endpoint once and receives suggestions for all six fields. For each field `X`, apply its suggested value **iff** the suggestion for `X` is non-null **and** (`X` is empty **or** `X` is the field whose button was clicked).

Because `calories` is never empty (it defaults to `100` via `EMPTY_FORM_VALUES`), it only changes when you click **its own** button — the "literal rule" the user chose.

| You click… | calories (=100 default) | an empty macro | an already-filled macro |
|---|---|---|---|
| **calories** button | overwritten | filled | left as-is |
| an **empty macro** button | left at 100 | filled (incl. clicked) | left as-is |
| a **filled macro** button | left at 100 | filled | overwritten (clicked field only) |

Notes:

- "empty" for a macro means the current value is `null`. For `calories` it is never true.
- If the model returns `null` for a field, that field is skipped regardless of the rule.
- If **all six** suggestions are `null`, no field changes and an info Snackbar is shown ("Couldn't estimate nutrition for this product").

## API contract

`POST /api/v1/products/nutrition/suggestions`

Request:

```json
{ "name": "Cheddar cheese" }
```

Response (any field may be `null`; `calories` is a rounded int):

```json
{ "calories": 402, "protein": 25.0, "fats": 33.1, "carbs": 1.3, "sugar": 0.5, "salt": 1.8 }
```

| Outcome | Result | HTTP |
|---|---|---|
| Blank/whitespace name | `ValidationError` | 400 |
| Model output couldn't be deserialized | `InternalServerError` | 500 |
| Estimate produced (any/all fields may be null) | `Success` | 200 |

## Backend

New Application feature folder `FoodDiary.Application/Products/SuggestNutrition/`, mirroring `Notes/Recognize/`.

### Command & handler

```csharp
public record SuggestNutritionCommand(string Name);

public class SuggestNutritionCommandHandler(IChatClient chatClient, ILogger<SuggestNutritionCommandHandler> logger)
{
    public async Task<SuggestNutritionResult> Handle(SuggestNutritionCommand command, CancellationToken cancellationToken);
}
```

Flow:

1. If `command.Name` is blank/whitespace, return `SuggestNutritionResult.NameIsRequired()` (a `Failure` carrying `Error.ValidationError`).
2. Build system + user `ChatMessage`s and call `chatClient.GetResponseAsync<SuggestedNutrition>(...)`.
3. If `TryGetResult` fails, log the raw text and return `SuggestNutritionResult.ModelResponseWasInvalid()` (`InternalServerError`).
4. Otherwise map `SuggestedNutrition` to `SuggestNutritionResponse` and return `Success`.

### Model response schema

```csharp
public record SuggestedNutrition(
    [property: Description("Calories in kilocalories per 100 g. Never joules. Numeric only. Null only if you truly cannot estimate it.")]
    decimal? Calories = null,
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

### Response contract & mapping

```csharp
public record SuggestNutritionResponse(
    int? Calories,
    decimal? Protein,
    decimal? Fats,
    decimal? Carbs,
    decimal? Sugar,
    decimal? Salt);
```

Mapping clamps/rounds once at the boundary, matching `productSchema` ranges:

- `Calories`: `Math.Round(..., AwayFromZero)` to int, then clamp to `[1, 1000]`. `null` stays `null`.
- Macros: `Math.Round(value, 2)`, then clamp to `[0, 1000]`. `null` stays `null`.

### Result type

```csharp
public abstract record SuggestNutritionResult
{
    public sealed record Success(SuggestNutritionResponse Response) : SuggestNutritionResult;
    public sealed record Failure(Error Error) : SuggestNutritionResult;

    public static Failure NameIsRequired() => new(new Error.ValidationError("Product name is required"));
    public static Failure ModelResponseWasInvalid() => new(new Error.InternalServerError("Model response was invalid"));
}
```

### Prompts

System prompt (raw string literal):

```
You estimate nutrition facts for a calorie tracker. Return strictly the JSON schema you are given. Numbers must be numeric (never strings, never "null"). All energy values are kilocalories (kcal), never joules.
```

User prompt:

```
Estimate typical nutrition facts per 100 g for the product named "{Name}" from your own general knowledge of that product.

All energy/nutrient values are per 100 g. Calories are kilocalories (kcal), never joules. Provide calories and every nutrient you can reasonably estimate. Set a field to null only if you genuinely cannot estimate it.
```

`{Name}` is interpolated from the command.

### Controller & DI

- `ProductsController`: new action

  ```csharp
  [HttpPost("suggestions")]
  [ProducesResponseType((int)HttpStatusCode.OK)]
  [ProducesResponseType((int)HttpStatusCode.BadRequest)]
  public async Task<IActionResult> SuggestNutrition(
      [FromBody] SuggestNutritionRequestBody body,
      [FromServices] SuggestNutritionCommandHandler handler,
      CancellationToken cancellationToken)
  {
      var result = await handler.Handle(new SuggestNutritionCommand(body.Name), cancellationToken);
      return result switch
      {
          SuggestNutritionResult.Success s => Ok(s.Response),
          SuggestNutritionResult.Failure f => f.Error.ToActionResult(),
          _ => StatusCode(StatusCodes.Status500InternalServerError)
      };
  }
  ```

  `SuggestNutritionRequestBody { string Name }` is a small request DTO (API layer), consistent with the `[FromServices] handler` pattern already used by `GetProductById`.
- DI: add `services.AddScoped<SuggestNutritionCommandHandler>();` in `AddApplicationServices()` (`FoodDiary.Application/Extensions/ServiceCollectionExtensions.cs`), alongside `RecognizeNoteCommandHandler`.

## Frontend

All product-form changes live in `entities/product`, where `ProductForm` and the product API slice already are.

### API slice & contracts

- `entities/product/api/contracts.ts`: add

  ```ts
  export interface SuggestProductNutritionRequest { name: string; }
  export interface SuggestProductNutritionResponse {
    calories: number | null;
    protein: number | null;
    fats: number | null;
    carbs: number | null;
    sugar: number | null;
    salt: number | null;
  }
  ```

- `entities/product/api/productApi.ts`: add a `suggestNutrition` mutation → `POST /api/v1/products/nutrition/suggestions`. No cache tags (read-only estimate).

### Orchestration hook

`entities/product/lib/useSuggestNutrition.ts`: wraps `productApi.useSuggestNutritionMutation()`; exposes `suggest(name): Promise<SuggestProductNutritionResponse>` (unwraps; throws on error). Error parsing (`parseClientError`) happens in the form handler so it can drive the Snackbar.

### Shared adornment

`entities/product/ui/NutritionSuggestButton.tsx`: renders an `AutoAwesomeIcon` `IconButton`, or a `CircularProgress` spinner when that field is generating, or a disabled icon otherwise. Props: `onClick`, `generating`, `disabled`. Used by both the standalone `calories` `TextField` (inline in `ProductForm`) and `NutritionValueInput` (extended with `onSuggest` / `generating` / `disabled` props). This keeps the two input styles DRY and places the button consistently in the end adornment.

### ProductForm logic

`ProductForm` owns the interaction (it already holds `useForm`, so `getValues`/`setValue` are in scope):

- Local state `generatingField: NutritionValueType | null`. It doubles as the spinner location and the "clicked field" overwrite target. `isGenerating = generatingField !== null`.
- Local state for the error/info Snackbar message.
- `name` is observed via `useWatch`; suggest buttons are disabled when `name.trim().length < 3` or `isGenerating`.
- Click handler for field `F`:
  1. set `generatingField = F`.
  2. `await suggest(name)`.
  3. For each field `X` in `[calories, protein, fats, carbs, sugar, salt]`: if `response[X] != null` and (`getValues(X)` is empty **or** `X === F`), call `setValue(X, response[X], { shouldValidate: true, shouldDirty: true })`.
  4. If every `response[X]` is null, show the info Snackbar.
  5. On thrown error, `parseClientError` → show error Snackbar.
  6. `finally`: `generatingField = null`.
- While `isGenerating`, all inputs are disabled (`name`, `category`, `calories`, `defaultQuantity`, and the 5 macros), and all suggest buttons are disabled; the clicked field shows the spinner.

### Error/info Snackbar

No global snackbar exists today (the photo feature uses an inline `<Alert>`). Use a **local MUI `<Snackbar>` wrapping `<Alert>`** rendered by `ProductForm`:

- `<Alert severity="error">` for API failures — provides the error color, icon, and `role="alert"`, consistent with the existing `ImageUploadStep` error UI. A bare `<Snackbar message>` would render an unstyled neutral bar with no severity.
- `<Alert severity="info">` for the all-null "couldn't estimate" case.
- Auto-hide (~6s) and dismissable.

### Disabling the submit button (both dialogs)

The submit button lives in each dialog's `renderSubmit`, outside `ProductForm`. `ProductForm` gains an optional `onGeneratingChange(generating: boolean)` callback, invoked when generation starts/stops. `ProductInputDialog` and `NoteInputDialog` track it and disable their submit (and cancel) buttons while generating (combined with their existing `isLoading`).

### MSW mock

Add a handler in `tests/mockApi/products/products.handlers.ts` for `POST /api/v1/products/nutrition/suggestions` returning canned nutrition (some fields non-null, at least one null to exercise the skip path). Covers the demo build.

## Test plan

### Backend unit — `FoodDiary.UnitTests/Products/SuggestNutrition/SuggestNutritionCommandHandlerTests.cs`

Uses a fake `IChatClient` (as in `RecognizeNoteCommandHandlerTests`):

- Blank name → `Failure` / `ValidationError`.
- Valid JSON with all fields → `Success`; calories rounded to int and clamped, macros rounded to 2 dp.
- Calories out of range (e.g. `0` or `1500`) → clamped to `[1, 1000]`.
- Some fields null in model output → preserved as null in the response.
- Unparseable JSON → `Failure` / `InternalServerError`.

### Backend component — `FoodDiary.ComponentTests/Scenarios/Products/ProductsApiTests.cs`

Happy-path scenario `I_can_get_nutrition_suggestion()`, using the existing Mountebank OpenAI stub:

- New DSL in `ProductsApiContext.cs`: `Given_OpenAI_api_is_ready()`, `Given_OpenAI_api_can_suggest_nutrition(<builder>)`, `When_user_requests_nutrition_suggestion("Cheddar cheese")`, `Then_nutrition_suggestion_is(calories, protein, fats, carbs, sugar, salt)`.
- New builder `SuggestNutritionModelResponseBuilder` in `Dsl/Create.cs`, analogous to `RecognizeNoteModelResponseBuilder`, serialized into `OpenAIApi.SetupCompletionSuccess`.

(Per the new backend rule: every endpoint gets at least one happy-path component test.)

### Frontend — extend `ProductInputDialog.test.tsx` (+ fixture)

- Empty fields are filled after clicking a suggest button.
- Clicking a filled field's button overwrites that field only; other filled fields stay.
- Clicking a macro button leaves `calories` at its default; clicking the calories button overwrites it.
- Suggest buttons are disabled until `name` is valid.
- Inputs and submit are disabled while a suggestion is pending.
- API failure shows the error Snackbar.

## Documentation

The feature reuses the existing OpenAI integration and its env vars (`Integrations:OpenAI:*`), so no README/CLAUDE.md env changes are needed. Add the new `POST /api/v1/products/nutrition/suggestions` endpoint where the recognition endpoint is documented, if such a list exists.

## Risks

- The model may return implausible values for obscure or ambiguous names. Mitigation: values are clamped to schema ranges, and the user reviews/edits before saving.
- The model may return all-null for a valid product. Mitigation: info Snackbar; the user can still type values manually.
- Adding `onGeneratingChange` wiring touches two dialogs. Mitigation: the callback is optional; dialogs that don't pass it keep working unchanged.
