# Pages are router-agnostic; route files adapt them

Status: accepted (2026-10-05)

Pages in `src/pages`, and the features they compose, take plain props and callbacks and
never import the router. Route files in `src/app/routes` act as adapters. A route file
reads typed search params with `Route.useSearch()` and gives the page plain values,
such as the date whose Food Logs to show and a callback that moves to another date.
AppBar slot components are adapters too: they live next to their route file and pass
props to the feature they render. With this split, business logic can be tested without
a router, and the router can be replaced ([ADR-0004](0004-tanstack-router-for-typed-route-metadata.md)
records the current choice). Navigation widgets are the exception, because navigation
is their job. The drawer and the links in the history list use typed `Link` directly.

## Considered options

**Pages read route state themselves** (`getRouteApi('/_app/…').useSearch()`). TanStack's
docs show this pattern, and it needs less wiring. It was rejected because every page
would depend on route IDs and every page test would need a router.
