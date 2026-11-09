# Coding standards

Judgement rules applied when reviewing a diff. Mechanical rules belong in the linter.

## Rebuilt flows

A change that rebuilds an existing flow keeps the old flow's user-visible behaviours, unless its spec marks them dropped. Compare the new screens against the code they replace.

## Redux state

Name and organize Redux state after the data it holds (e.g. `products`, never `productsTable`), so the UI that renders it can change without reshaping state. See the Redux style guide: [Organize State Structure Based on Data Types, Not Components](https://redux.js.org/style-guide/#organize-state-structure-based-on-data-types-not-components) and [Name State Slices Based On the Stored Data](https://redux.js.org/style-guide/#name-state-slices-based-on-the-stored-data).

## Comments

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
