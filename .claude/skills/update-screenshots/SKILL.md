---
name: update-screenshots
description: Retake the README feature screenshots in docs/images after UI changes so they show the current app. Use when README screenshots are stale, or after changing a screen shown in the README (day page, weight page, AI suggestions)
---

# Update README Screenshots

## Overview

Retakes the four feature screenshots embedded in the README's `<table>` so they
show the current UI. All shots come from the app running in MSW mode against the
seeded mock data — no real backend, no Google sign-in.

Unlike browser verification, the PNGs in `docs/images/` are the deliverable:
this skill overwrites them and leaves them uncommitted for the user to review.
The never-commit-screenshots rule of `docs/agents/browser-verification.md` does
not apply here.

## The shots

| File | Page | Emulate (`width x height x dpr`) | State |
| --- | --- | --- | --- |
| `docs/images/nutrition-tracking.png` | `/#/` | `393x852x3,mobile,touch` | Day page on the seed date |
| `docs/images/nutrition-tracking-desktop.png` | `/#/` | `1280x800x2` | Same page, desktop width |
| `docs/images/ai-suggestions.png` | `/#/log/food/recognition` | `393x852x3,mobile,touch` | Both pudding photos picked, canned suggestion shown |
| `docs/images/weight-tracking.png` | real backend | mobile, 393×852@3 | The user's real weight data — see below |

The seed date is fixed: in MSW mode the day page opens on `2023-10-19`
(`getDefaultDate` in `src/app/routes/_app/index.tsx`). The dates are
intentional — the shots must stay deterministic, so never navigate to another
date.

The weight shot is the exception: it shows the user's real weight logs, not
the mock. The mock's weight data is pinned to January 2022, while the weight
page always loads the last three months, so MSW renders that page empty. When
the weight UI changes, ask the user for the shot — do not fake it.

## Workflow

### 1. Prerequisites and scope

- `git status` must be clean apart from shots already retaken in this run.
- Ask the user **which shots** to retake (a UI change usually touches one
  screen). Offer all four as the default. **Stop and wait.**

### 2. Start the app and attach the browser

Start the app in MSW mode with `make start-frontend-msw` from the repo root, in
the background. Leave `.env.local` untouched. If port 5173 is in use, reuse
that server when `curl -s http://localhost:5173/src/shared/config.ts` shows
`"VITE_APP_MSW_ENABLED": "true"`; otherwise ask the user.

Drive the browser through the `chrome-devtools` MCP server from `.mcp.json`. If
its tools are unavailable in the current harness, stop and ask the user how to
proceed — in OpenCode, `opencode mcp add chrome-devtools -- npx
chrome-devtools-mcp@latest --isolated --headless --no-usage-statistics
--no-performance-crux` connects it without a restart. Follow
`docs/agents/browser-verification.md` for the driving conventions: fresh
`isolatedContext` per run, hash-based routes, `emulate` before navigating (it
reloads the page and resets the mock data), `wait_for` text spelled as the
source writes it, and closing the page when done.

### 3. Capture each shot

Per shot, in order: `emulate` the viewport from the table on the open page,
`new_page` into a fresh `isolatedContext`, navigate to the page, `wait_for`
its completion text (`Daily Nutrition Summary` on the day page) **and** the
header date `Thu, 19 Oct 2023` — the day switcher populates its text a beat
after the summary data arrives, and a shot taken earlier shows an empty green
pill — then `take_screenshot` with `filePath` set to the table's file path.
The shot is viewport-sized at the emulated DPR — 1179×2556 for mobile,
2560×1600 for desktop. Do not use full-page mode: the README table expects
viewport shots.

Emulating reloads the page and resets the mock data, so capture one shot per
emulation and never carry in-app state across shots.

### 4. Capture the AI-suggestions shot

The camera button's file input is `aria-hidden`, so it never appears in
`take_snapshot`; per `docs/agents/browser-verification.md`, feed it through a
`DataTransfer` in `evaluate_script`:

1. Copy the skill's photos into the dev server's public dir:
   `cp .claude/skills/update-screenshots/assets/chocolate-pudding-*.jpg
   src/frontend/public/`. Vite serves them at `/chocolate-pudding-top.jpg` and
   `/chocolate-pudding-back.jpg`.
2. Navigate: `/#/` → tap **Add breakfast** → the food search screen.
3. In `evaluate_script`, `fetch` both URLs, build two `File`s **whose names
   contain "pudding"**, assign them through a `DataTransfer` to
   `input[type="file"][name="images"]`, and dispatch `change`. The app then
   navigates itself to the recognition screen.
4. `wait_for` `Review AI suggestions`. The mock derives the suggestion from the
   file names (`tests/mockApi/notes/notes.handlers.ts`): a name containing
   "pudding" returns the canned *High Protein Chocolate pudding (Ehrmann)* —
   80 kcal, 200 g, protein 10, fats 1.5, carbs 6, sugar 4, salt 0.1. Any other
   name gets random values; retake if the form shows them.
5. Delete the two temp files from `src/frontend/public/`.

### 5. Verify

- Check each PNG's pixel dimensions against the table (`sips -g pixelWidth -g
  pixelHeight`), and read each PNG: expected content, no overlap or stale UI
  (e.g. missing-nutrition marks are the ⚠ icon, not the old dot).
- `list_console_messages`: `ERR_CONNECTION_REFUSED` for `https://localhost:8080/api/v1/*`
  is the MSW-mode baseline; anything else is a defect.
- `git status` shows only the retaken PNGs (plus skill-internal changes from
  the current run). README.md needs no edits: paths and alt texts stay valid.
- If `tests/mockApi` was changed for a shot, run the frontend tests
  (`make test-frontend`) before finishing.

### 6. Wrap up

Close the page with `close_page`. Stop the dev server with `make
stop-frontend` only if this run started it. Report what was retaken and leave
the PNGs uncommitted for review; commit only when the user asks.

## Edge cases

| Situation | Behavior |
| --- | --- |
| `chrome-devtools` tools unavailable | Stop and ask, per `docs/agents/browser-verification.md` |
| Recognition form shows a file name or random values | The `File` names lacked "pudding" — redo step 4 |
| Day page shows today's date, not 2023-10-19 | MSW is off — the app must run via `make start-frontend-msw` |
| Port 5173 server lacks MSW | Ask the user; never start a second Vite yourself |
| The weight UI changed | Ask the user for the shot — MSW cannot produce it |
| UI change removed or renamed a shot's screen | Ask the user whether to update the README table and this skill's manifest |
