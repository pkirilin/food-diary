# Browser verification

Steps for the browser check that `.claude/rules/frontend.md` makes mandatory for UI and behavior changes.

- Automated tests are still required whenever feasible. The browser check comes in addition to them.
- When a behavior cannot reasonably be covered by Vitest (layout, real-browser APIs, PWA/service worker, image decode, camera or file input), the browser check is the sole verification. Say so in the final report.
- Use the `chrome-devtools` MCP server from `.mcp.json`. If its tools are unavailable or it cannot start, stop and ask the user how to proceed. Never skip the check or substitute another browser tool.
- Start the app in MSW mode with `make start-frontend-msw` from the repo root, in the background. Leave `.env.local` untouched: it belongs to the developer. A second Vite start can delete the dependency cache of a server already running in `src/frontend`, so start the app only through this target.
- If the target reports port 5173 in use, reuse that server when `curl -s http://localhost:5173/src/shared/config.ts` shows `"VITE_APP_MSW_ENABLED": "true"`. Otherwise ask the developer how to proceed.
- Open <http://localhost:5173> with `new_page` and a new `isolatedContext` name for each check, so it starts with clean cookies, storage and service workers. The browser outlives a single check.
- Routes are hash-based: open `http://localhost:5173/#/<route>`. `emulate` reloads the page, so set the viewport before navigating to the flow. The reload also resets the mock API's data, so redo any edits after it.
- Enter the multi-item flow through **Add <meal>** on the day page. Its `/log/food/*` routes redirect to the day page when no Meal Draft has been started.
- Device preferences live in localStorage (`src/shared/lib/devicePreferences.ts`), and a fresh context starts with them off. Set the ones the changed flow needs with `evaluate_script`: `localStorage.setItem(...)`, then `location.reload()`. `navigate_page`'s `initScript` runs only on a new document, so it misses a hash-only navigation such as `/` → `/#/`.
- File inputs: `upload_file` accepts repo paths only. Build a `File`, assign it to `input.files` through a `DataTransfer` in `evaluate_script`, and dispatch `change`. To hold or fail one request, wrap `window.fetch` in `navigate_page`'s `initScript`.
- Exercise the changed flow. Use `take_snapshot` to find elements to interact with; it is an accessibility-tree dump and cannot show how the page renders.
- After a navigation, `wait_for` a label the next step needs, spelled as the source writes it: `wait_for` matches DOM text case-sensitively, while the snapshot shows MUI button labels uppercased. The day page is ready once `Daily Nutrition Summary` appears. Its result is the page snapshot, so act on it instead of calling `take_snapshot`. Use `evaluate_script` for reading page state.
- Take a screenshot of every UI state the change affects (`take_screenshot` without `filePath`) and inspect it for broken layout, overflow, overlap and styling. Use `get_css_styles` to investigate anything that looks wrong.
- Check rendered UI at both a phone viewport (`390x844x3,mobile,touch`) and a desktop viewport (`1280x800x1`), set with `emulate`. A change that clearly affects only one layout may check just that one; say so in the final report. Emulation is not iOS Safari: on-screen keyboard and gesture behavior needs the iOS Simulator.
- Check `list_console_messages`. `ERR_CONNECTION_REFUSED` errors for `https://localhost:8080/api/v1/*` are the MSW-mode baseline; any other console error is a defect.
- Report in text only what you did and saw. Do not commit screenshots.
- When done, close the page with `close_page` and stop the dev server you started.
- MSW does not exercise the real backend. If the change touches an API contract, say that real-backend behavior is unverified.
