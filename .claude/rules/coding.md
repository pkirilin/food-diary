# Coding Rules

## Self-Check Steps

- Run build and tests before finishing any coding task

## Commenting Rules

A comment must earn its place. Before writing one, it must pass this test: **would a competent reader of this file get it wrong without the comment?** If the answer is no, delete it.

- **Strictly avoid** comments that merely restate what the code already expresses through good naming. E.g: do NOT add JSDoc descriptions like `/** Check if X */` above a function named `checkX()` or `isXReady()`.
- If the code needs a comment to explain WHAT it does, refactor the code to be self-explanatory first.
- Prioritize clear naming of variables, methods, and classes over excessive comments.
- If a comment is truly needed, write it in **English**.

### Justified comments

Only these: constraints a reader cannot see from this file — external library contracts, architectural rules, workarounds/hacks — plus non-obvious business logic and complex algorithms.

```ts
// GOOD - RTK contract, invisible at the call site, and violating it throws at runtime
effect: (_action, { getState, getOriginalState }) => { ... }

// GOOD - FSD import direction; without this someone "fixes" it by importing RootState
interface ImagesListenerState { manageNote: ManageNoteState }
```

### Never write these

- **Justifications for the alternative you did NOT write.** Comment on the code that exists, not on the boolean/loop/abstraction you rejected. If the reader can see the shape works, they do not need it defended.
- **Narration of another module's internals.** A comment in file A describing how file B behaves is duplicated knowledge that goes stale the next time B changes. Keep behavioral claims in the file that owns the behavior — or in a test, which fails when it drifts.
- **Transcripts of a review discussion.** Trade-offs weighed, edge cases considered, gaps knowingly accepted ("X closes the retry gap; the loading gap is accepted") belong in the PR description or a design doc, never in the source. Code records what is, not how the team argued its way there.

```ts
// BAD - defends a rejected alternative; `failedSrc === src` already reads correctly
// Comparing against src rather than holding a boolean resets the fallback when src changes
const displayedSrc = failedSrc === src ? fallbackSrc : src;

// BAD - narrates another component + records an accepted gap from review
// Tracks whether a form is warranted, not whether one is actually mounted:
// ImageUploadStep still shows a skeleton while categories load...
formId: suggestions.at(0)?.product ? 'product-form' : null,
```

### After a review-fix cycle

Re-read every comment added during the fixes. Review pressure produces exactly the banned kinds above — the reviewer asked "why this way?", and the answer got committed as a comment instead of staying in the review thread. Delete those before finishing.

## API Contracts

- Public API contract types (request/response DTOs) that describe the **same** endpoint payload MUST share the **same name** across the backend and the frontend. E.g. `POST /products/nutrition/suggestions` uses `SuggestProductNutritionRequest` / `SuggestProductNutritionResponse` in both `src/backend` and `src/frontend`.
- When adding or renaming an endpoint contract, update both sides in the same change so the names never drift.

## Documentation

- ALWAYS keep @README.md and @CLAUDE.md up to date after: adding or changing env variables, upgrading Node.js, npm, or .NET to major versions
- DO NOT leave documentation in a state that contradicts the actual code behavior

## Troubleshooting

- When encountering errors, unexpected behavior, or unfamiliar problems, use **sequential-thinking MCP** to break down the issue systematically before attempting fixes.
- Combine sequential-thinking with web search to research error messages, library issues, or solution patterns.
- Do not guess solutions blindly — investigate the root cause first.
