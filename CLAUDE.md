# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Food Diary is a self-hosted, lightweight web app for nutrition and weight tracking. The product strategy in `STRATEGY.md` is "minimal, exact-fit tool" — when in doubt, prefer not adding features. Social/sharing features are explicitly out of scope.

## Repo layout

- `src/frontend/` — React 18 + TypeScript SPA (Vite, MUI v6, Redux Toolkit + RTK Query, react-router v7, react-hook-form + Zod). Uses **Feature-Sliced Design**: `app/`, `pages/`, `widgets/`, `features/`, `entities/`, `shared/`. Respect FSD import direction (upper layers may import from lower; never the reverse).
- `src/backend/` — .NET 8 solution (`FoodDiary.sln`). Clean-architecture-ish projects.
- `src/backend/tests/` — `FoodDiary.UnitTests` and `FoodDiary.ComponentTests`.
- `tests/` — Playwright E2E suite (separate yarn project).
- `docker-compose.yml` / `Dockerfile` — full-stack local run.

The frontend and the two test projects are independent yarn (Berry, node-modules linker) workspaces — install/run yarn from inside each directory, not at repo root.

## Common commands

### Frontend (`src/frontend/`)

```shell
yarn start           # Vite dev server on http://localhost:5173
yarn build           # tsc + vite build
yarn test            # vitest (single-file: yarn test path/to/file.test.ts)
yarn lint            # eslint .
yarn lint:fix
yarn format / format:check
```

For backend-less development, set `.env.local` with `VITE_APP_MSW_ENABLED=true`, `VITE_APP_FAKE_AUTH_ENABLED=true`, `VITE_APP_FAKE_AUTH_LOGIN_ON_INIT=true` (full env-var list in README).

### Backend (`src/backend/`)

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

Required user-secrets on `FoodDiary.API`: `Auth:AllowedEmails:0`, `ConnectionStrings:Default`, optional `Integrations:OpenAI:ApiKey` and `Integrations:OpenAI:Model` (overrides default).

### E2E (`tests/`)

```shell
yarn test            # playwright test
yarn debug           # --debug
yarn codegen
```

### Full stack

```shell
docker-compose up -d   # uses .env (copy from .env.example); app served at https://localhost:8080
```

### Tests requiring Docker

Backend component tests (`FoodDiary.ComponentTests`, via Testcontainers) and the E2E suite (`tests/`, via docker-compose) require a running Docker daemon. **Before running either suite, if Docker isn't available, STOP and ask the user how to proceed** — never skip the tests or silently work around them (e.g. substituting a non-Docker path). Offer having them install and start Docker manually as one option.

## Architecture notes

- **Auth**: Google OAuth 2.0; backend gates access via `Auth:AllowedEmails` allowlist (this is a personal/self-hosted app, not multi-tenant). OAuth redirect URI is `https://localhost:8080/signin-google`.
- **API client**: frontend calls backend through RTK Query slices under `entities/*/api` and `features/*/api`. Mocked via MSW when `VITE_APP_MSW_ENABLED=true`.
- **Database**: PostgreSQL via EF Core. The `FoodDiary.Migrator` console app — not the API — is responsible for applying migrations.
- **AI integrations**: `FoodDiary.Integrations.OpenAI` power the photo-based note recognition feature. Demo mode (`VITE_APP_DEMO_MODE_ENABLED`) disables features that touch external integrations or the file system.
- **PWA**: `vite-plugin-pwa` + `workbox-*` produce the service worker; demo deploys to GitHub Pages.

## Frontend conventions

- ESLint extends `standard-with-typescript`; notable enabled rules: `@typescript-eslint/strict-boolean-expressions` (error — be explicit on null/undefined checks), `import/order` with alphabetized groups and `@/**` placed after `internal`. Function components must be arrow functions (`react/function-component-definition`).
- Forms: react-hook-form + Zod resolver. UI: MUI v6 (`@mui/material`, `@mui/lab`, `@mui/x-charts`, `@mui/x-date-pickers`). Dates: `date-fns` v3.
- TypeScript, target ES module, `@/*` path alias for `src/*`.

## When adding features

Check `STRATEGY.md` first — the project deliberately stays small. Prefer modifying existing slices over introducing new abstractions, and don't add social or sharing functionality.

## Using CLI tools

- ⚠️ **ALWAYS** Use `rg` instead of `grep`, `fd` instead of `find`, `jaq` instead of `jq` (if available)
- ⚠️ **ALWAYS** Use JSON output when CLI supports it. Pipe ALL JSON through `| toon` (if available)
