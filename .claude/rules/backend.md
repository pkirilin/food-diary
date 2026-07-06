---
paths:
  - '*.cs'
---

## String Literals

- Prefer C# raw string literals (`"""..."""`) over string concatenation (`"..." + "..."`) for multi-line strings such as prompts, SQL, or templates. Raw string literals preserve formatting without escape sequences and are easier to edit.

## Testing

- **Every API endpoint must have at least one happy-path component test** in `FoodDiary.ComponentTests` (`Scenarios/<Feature>/<Feature>ApiTests.cs`). When adding or changing an endpoint, add or extend the matching `*ApiTests` scenario using the existing Given/When/Then context DSL (stub external services like OpenAI via the Mountebank helpers). An endpoint is not complete until it has one.
