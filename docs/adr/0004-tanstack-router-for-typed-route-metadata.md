# The frontend routes with TanStack Router

Status: accepted (2026-10-05)

The frontend moves from React Router (Data Mode, hash router) to TanStack Router. The
goal is an AppBar that adapts to the current screen, with a burger on section roots and
a back arrow on nested screens. Each route declares its own AppBar, and a layout that
does not know which route is current reads it. TanStack Router is the only candidate
that types this per-route metadata for such a reader. Route `staticData` is an
interface the app augments, every route must supply it, and a discriminated union
narrows it, so the AppBar needs no type guard. Search params also become
schema-validated and typed, and hash history is kept, which the PWA and the GitHub
Pages demo depend on.

## Considered options

**React Router Data Mode, upgraded to v8.** This is the fallback if TanStack Router
causes problems. `handle` and `useMatches` work in Data Mode, but a reader that does not
know the current route gets `handle: unknown` in every React Router mode, so the guard
the AppBar uses today would stay.

**React Router Framework Mode.** Rejected. Its hydrated router hard-codes browser
history, so hash routing is not possible. Its SPA build writes `index.html` after
vite-plugin-pwa has built the precache list. It does not type `handle` for a reader
that does not know the current route either.

## Consequences

TanStack Router has no route actions, because it does not manage mutations. Login and
logout are plain functions in the auth feature, not form submissions to routes.

Research: [routing library comparison](../../.scratch/routes-instead-of-modals/research.md),
[migration research](../../.scratch/tanstack-router-migration/research.md).
