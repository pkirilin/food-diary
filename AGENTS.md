# AGENTS.md

Guidance for coding agents working in this repository.

## Project overview

Food Diary is a self-hosted, lightweight web app for nutrition and weight tracking. The product strategy in `docs/agents/strategy.md` is "minimal, exact-fit tool" — when in doubt, prefer not adding features. Social/sharing features are explicitly out of scope.

## Repo layout

- `src/frontend/` — React 19 + TypeScript 5 SPA (Vite, MUI v9, Redux Toolkit + RTK Query, TanStack Router, react-hook-form + Zod). Uses **Feature-Sliced Design**: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`. Respect FSD import direction (upper layers may import from lower; never the reverse).
- `src/backend/` — .NET 10 solution (`FoodDiary.slnx`). Clean-architecture-ish projects.
- `src/backend/tests/` — `FoodDiary.UnitTests` and `FoodDiary.ComponentTests`.
- `tests/` — Playwright E2E suite (separate yarn project).
- `Dockerfile` — the published image. `deploy/compose.yml` — self-hosting setup (released image + PostgreSQL + Caddy). `tests/compose.yml` — full stack built from source, used by the E2E suite.
- `docs/guide/` — user docs (deployment, configuration reference, MCP). `docs/development.md` / `docs/releasing.md` — maintainer docs, linked from `CONTRIBUTING.md`. `docs/agents/` — agent docs: the per-area coding rules referenced below, browser verification, issue tracker, triage labels, domain docs, writing conventions, and the product strategy.
- `.mcp.json` and `opencode.json` — the same MCP servers registered for Claude Code and OpenCode; neither harness reads the other's file, so register every server in both. The mapping is mechanical: stdio → `type: "local"`, `command` + `args` merge into one `command` array, `${VAR}` env refs become `{env:VAR}`, and a remote API-key endpoint is Streamable HTTP with `oauth: false`.

The frontend and the E2E suite (`tests/`) are independent Yarn 4 projects (node-modules linker), each with its own lockfile.

## Common commands

### Frontend (`src/frontend/`)

Read `docs/agents/frontend.md` before changing or testing frontend code: where tests go, how to debug a failing one, and when a UI change needs browser verification (steps in `docs/agents/browser-verification.md`; the `chrome-devtools` MCP server, which needs Google Chrome installed).

For backend-less development, set `.env.local` with `VITE_APP_MSW_ENABLED=true`, `VITE_APP_FAKE_AUTH_ENABLED=true`, `VITE_APP_FAKE_AUTH_LOGIN_ON_INIT=true` (full env-var list in `docs/development.md`).

### Backend (`src/backend/`)

Read `docs/agents/backend.md` before backend work: string-literal and build-configuration conventions, and the component-test requirements for API endpoints and MCP tools.

```shell
dotnet run --project src/FoodDiary.Migrator    # apply migrations
dotnet run --project src/FoodDiary.API         # start API
dotnet test                                    # all tests
dotnet test tests/FoodDiary.UnitTests          # one project
dotnet test --filter "FullyQualifiedName~SomeTest"
```

New EF migration:

```shell
dotnet ef migrations add <Name> \
    -s src/backend/src/FoodDiary.API \
    -p src/backend/src/FoodDiary.Infrastructure \
    -o Migrations
```

Required user-secrets on `FoodDiary.API`: `Auth:AllowedEmails:0`, `ConnectionStrings:Default`, `GoogleAuth:ClientId`, `GoogleAuth:ClientSecret`, optional `Integrations:OpenAI:ApiKey` and `Integrations:OpenAI:Model` (overrides default). Enabling the MCP server locally (`Mcp:Enabled` = `true`) also requires `Mcp:BaseUrl` (`https://localhost:8080`). `Mcp:Clients:0:ClientId`, `Mcp:Clients:0:ClientSecret` and `Mcp:Clients:0:RedirectUri` are optional and needed only for a client-secret MCP client; MCP clients that use a Client ID Metadata Document need no entry. Startup fails naming whichever value is missing or malformed.

### Full stack

```shell
cd tests && docker compose up -d --build   # builds from source, uses tests/.env; app served at https://localhost:8080
```

### Tests requiring Docker

Backend component tests (`FoodDiary.ComponentTests`, via Testcontainers) and the E2E suite (`tests/`, via `tests/compose.yml`) require a running Docker daemon. **Before running either suite, if Docker isn't available, STOP and ask the user how to proceed** — never skip the tests or silently work around them (e.g. substituting a non-Docker path). Offer having them install and start Docker manually as one option.

## Architecture notes

- **Auth**: Google OAuth 2.0; backend gates access via `Auth:AllowedEmails` allowlist (this is a personal/self-hosted app, not multi-tenant). OAuth redirect URIs are `https://localhost:8080/signin-google` locally and `https://<your-domain>/signin-google` in production.
- **API client**: frontend calls backend through RTK Query slices under `entities/*/api` and `features/*/api`. Mocked via MSW when `VITE_APP_MSW_ENABLED=true`.
- **Database**: PostgreSQL via EF Core. The `FoodDiary.Migrator` console app — not the API — is responsible for applying migrations.
- **AI integrations**: `FoodDiary.Integrations.OpenAI` power the photo-based note recognition feature. Demo mode (`VITE_APP_DEMO_MODE_ENABLED`) only shows a warning on the login page; the demo build runs against the MSW mock API, so photo recognition returns the mock API's suggestion.
- **PWA**: `vite-plugin-pwa` + `workbox-*` produce the service worker; demo deploys to GitHub Pages.

## Frontend conventions

- ESLint 10 with flat config (`src/frontend/eslint.config.js`), composed from `@eslint/js` recommended, `typescript-eslint` at `recommendedTypeChecked`, and `@eslint-react` at `strict-typescript` (the sole source of React and hooks rules — see `docs/adr/0001-eslint-react-as-sole-react-linter.md`). Notable enabled rules: `@typescript-eslint/strict-boolean-expressions` (error — be explicit on null/undefined checks), `import-x/order` with alphabetized groups and `@/**` placed after `internal`, and `@stylistic/jsx-self-closing-comp`. testing-library and jest-dom rules apply to test files only. Prettier runs last, as a lint rule.
- Routes in `src/app/routes/` are flat files by default. A route that owns AppBar slots or route-only helpers (`-`-prefixed files) becomes a directory holding the route and those files. Two or more routes sharing a path prefix move into a directory for that prefix, with one directory per URL segment (`log/food/`, not `log.food/`). A directory's own route is `route.tsx`, or `index.tsx` if it is an index route, so route IDs don't change; other routes inside it stay flat files. `-` files at a directory's top level belong to its index route, or to its layout route when it has no index. The pathless `_app.tsx` layout stays a sibling of `_app/`.
- `src/frontend/src/app/routeTree.gen.ts` is generated by the TanStack Router plugin from `src/frontend/src/app/routes/` on every `yarn start`, `yarn build` and `yarn test`. Never edit it by hand, and commit it whenever it changes: CI fails when the committed tree is stale.
- Forms: react-hook-form + Zod resolver. UI: MUI v9 (`@mui/material`, `@mui/x-charts`, `@mui/x-date-pickers`). Dates: `date-fns` v3.
- TypeScript, target ES module, `@/*` path alias for `src/*`.
- Browser support: the `browserslist.production` field in `package.json` is the single source of truth — `vite.config.ts` derives `build.target` from it via `buildTargets.ts`. It is pinned to MUI v9's floors; see the README's Browser support section.

## When adding features

Check `docs/agents/strategy.md` first — the project deliberately stays small. Prefer modifying existing slices over introducing new abstractions, and don't add social or sharing functionality.

## Using CLI tools

- ⚠️ **ALWAYS** Use `rg` instead of `grep`, `fd` instead of `find`, `jaq` instead of `jq` (if available)
- ⚠️ **ALWAYS** Use JSON output when CLI supports it

## Commit messages

Commit on a feature branch — `main` receives commits only via PR merges.

Imperative subject, plain-English body explaining what changed and why. Leave
AI co-author trailers (`Co-authored-by: …`) out unless the user asks for one.

## Coding rules

Consult `docs/agents/coding.md` before finishing any coding task: it holds the self-check steps (run the build and tests), the comment rules, API contract naming across backend and frontend, and the documentation-update triggers.

## Agent skills

### Issue tracker

Issues and specs live as local markdown files under `.scratch/<feature-slug>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default role names (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`), recorded as `Status:` values in issue files. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Reference

- **Writing docs** — platform-neutral prose, and the rules for specs and tickets. See `docs/agents/writing-docs.md`.
- **Coding standards** — judgement rules applied at review. See `CODING_STANDARDS.md`.
