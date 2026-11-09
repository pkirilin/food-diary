# Coding Rules

## Self-Check Steps

- Run build and tests before finishing any coding task

## Comments

A comment must earn its place: **would a competent reader of this file get it wrong without the comment?** Write any comment you keep in **English**. Full rules: `CODING_STANDARDS.md`.

## API Contracts

- Public API contract types (request/response DTOs) that describe the **same** endpoint payload MUST share the **same name** across the backend and the frontend. E.g. `POST /products/nutrition/suggestions` uses `SuggestProductNutritionRequest` / `SuggestProductNutritionResponse` in both `src/backend` and `src/frontend`.
- When adding or renaming an endpoint contract, update both sides in the same change so the names never drift.

## Documentation

- ALWAYS keep @README.md and @CLAUDE.md up to date after: adding or changing env variables, upgrading Node.js, npm, or .NET to major versions
- DO NOT leave documentation in a state that contradicts the actual code behavior

## Troubleshooting

- Do not guess solutions blindly — investigate the root cause first.
