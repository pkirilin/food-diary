# 04 — TanStack tooling in place

**What to build:** TanStack Router's packages and Vite plugin are installed and configured. They generate a committed route tree from a minimal root route, while the app keeps running on React Router. All the tooling around the generated file works: lint, formatting, git, the editor and CI. The conventions also record how route components are written.

Context worth knowing before starting:
- **The generated route tree must be committed.** The build runs `tsc` before Vite, so `tsc` runs before the plugin can regenerate the file. The Docker build runs the same script.
- **The generator's output style differs from the repo's.** It writes no semicolons, while the repo's Prettier requires them, and it contains `as any`. Hence the file is ignored by both ESLint and Prettier.
- **The plugin writes temporary files** into a `.tanstack/` directory by default.
- **Route components follow TanStack's idiom:** a function declaration placed below the route definition. That conflicts with the repo-wide arrow-function convention, so the convention gains an exception for route files only. No lint rule enforces component style.

See the [spec](../spec.md), *Router setup* and *Lint, format, CI and conventions*, and the [research](../research.md), §4.4.

**Blocked by:** None — can start immediately

**Status:** resolved

- [x] The router, the Vite plugin and the router devtools are installed with caret ranges
- [x] The plugin is configured:
  - [x] it runs before the React plugin;
  - [x] file-based routing reads a routes directory inside the app layer;
  - [x] the generated tree is written beside that directory;
  - [x] automatic code splitting is on
- [x] A minimal root route exists so the generator has something to generate. Nothing mounts it yet
- [x] The generated route tree is committed, and is in ESLint's global ignores and Prettier's ignore list
- [x] The plugin's temporary directory is ignored by git
- [x] The tracked editor settings mark the generated file read-only and exclude it from search and file watching
- [x] Deleting the generated file and running the build or the tests regenerates it identically
- [x] CI fails after the frontend build when the generated route tree differs from the committed one. This is verified locally by running the CI step against a deliberately stale tree
- [x] `CLAUDE.md`'s frontend conventions and the frontend rules state the exception: route components in the routes directory are function declarations below the route definition, and everything else stays an arrow function
- [x] The app still runs on React Router, and ticket 01's tests pass unchanged
- [x] `yarn build`, `yarn lint`, `yarn format:check` and `yarn test --run --reporter=verbose` (no `stderr` blocks) all exit zero
