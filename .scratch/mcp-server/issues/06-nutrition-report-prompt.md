# 06 — `nutrition_report` prompt

**What to build:** A slash command in Claude that produces a nutrition report over a period the user describes in their own words.

Only this prompt ships. "Optimal ration" and "plan my week" take different criteria every time — a calorie range, a protein target, vitamins — so a fixed prompt is worse than typing the question.

**Blocked by:** 04

**Status:** open

- [ ] The prompt is named `nutrition_report`, matching the `snake_case` of the tools
- [ ] It declares one optional string argument, `period` — MCP prompt arguments are strings only
- [ ] The template instructs the model to resolve the phrase to concrete dates ("last week", "last 14 days", "2026-09-01 to 2026-09-07"), default to the last 7 days when empty, and respect the 31-day cap
- [ ] The template asks for the analysis in the original feature note: which products combine well, which do not, why, and what to substitute
- [ ] It tells the model to qualify any total whose coverage count is short rather than reporting it flat
- [ ] `dotnet build` and `dotnet test` pass
