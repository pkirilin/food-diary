# Coding Rules

## Self-Check Steps

- Run build and tests before finishing any coding task

## Commenting Rules

- **Strictly avoid** comments that merely restate what the code already expresses through good naming. E.g: do NOT add JSDoc descriptions like `/** Check if X */` above a function named `checkX()` or `isXReady()`.
- Comments are justified ONLY for: non-obvious business logic, workarounds/hacks, complex algorithms, external constraints, or explaining "why" (not "what").
- If the code needs a comment to explain WHAT it does, refactor the code to be self-explanatory first.
- Prioritize clear naming of variables, methods, and classes over excessive comments.
- If a comment is truly needed, write it in **English**.

## Documentation

- ALWAYS keep @README.md and @CLAUDE.md up to date after: adding or changing env variables, upgrading Node.js, npm, or .NET to major versions
- DO NOT leave documentation in a state that contradicts the actual code behavior

## Troubleshooting

- When encountering errors, unexpected behavior, or unfamiliar problems, use **sequential-thinking MCP** to break down the issue systematically before attempting fixes.
- Combine sequential-thinking with web search to research error messages, library issues, or solution patterns.
- Do not guess solutions blindly — investigate the root cause first.
