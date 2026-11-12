---
paths:
  - '*.ts'
  - '*.tsx'
---

## Development Standards

### Architecture

- Always prioritize arrow function expressions (`const fn = () => {}`) over function definitions (`function fn() {}`). Exception: route components in `src/app/routes/` are function declarations placed below the route definition (`export const Route = createFileRoute(...)({ component: HistoryRoute })`, then `function HistoryRoute() {}`), following TanStack Router's idiom
- Redux holds validated values only. Input being typed, or input that failed validation, stays in its react-hook-form form; dispatch once the form validates.
- Custom hooks must not own UI-presentation concerns (alerts, snackbars, toasts, dialogs). Keep that state in the component and let the hook report outcomes through callbacks (e.g. `onError(message)`, `onInfo(message)`) that the component wires to its UI.
- Custom hooks must not depend on form library types or instances (e.g. react-hook-form's `UseFormGetValues`/`UseFormSetValue`, `control`). Pass narrow callbacks instead (e.g. `getName`, `getFieldValue`, `setFieldValue`) so the hook stays decoupled from the form layer.
- Every search-param change is a navigation: it re-runs `beforeLoad` for all matched routes. When state writes to the URL per keystroke, confirm the matched `beforeLoad`s send no requests on that navigation.
- A route's `onLeave` runs before its screen unmounts, so state it clears is still read by that screen.

### TypeScript Integration

- Use TypeScript interfaces for props, state, hooks, utils, and component definitions
- **Never use `any`. If type is unknown, use `unknown` with type guards instead**
- Do not use `React.<SomeType>`, always import `<SomeType>` from `react`

### React Component Definition Example

Use `FC<Props>` when the component accepts props, and bare `FC` when it does not.

```tsx
import { FC } from 'react';

interface Props {
  foo: string;
  bar: number;
}

export const SampleComponent: FC<Props> = ({ foo, bar }) => {
  return <div>SampleComponent</div>;
};

export const NoPropsComponent: FC = () => {
  return <div>NoPropsComponent</div>;
};
```

Props definition example:

```ts
interface Props {
  // properties go first
  foo: string;
  bar: number;
  // functions / callbacks go after properties
  onFooAction: () => void;
  onBarAction: () => void;
  // ❗ All props are required by default. Only make prop optional if it is not used by any existing component
  onBazAction?: () => void;
}
```

### Browser verification

Mandatory for any change that affects rendered UI or behavior (components, pages, hooks, routing, styles, MSW handlers). Behavior-neutral refactors, type-only changes, tests, config and docs are exempt; for an exempt refactor, state in the final report why it is behavior-neutral.

- Automated tests are still required whenever feasible. The browser check comes in addition to them.
- When a behavior cannot reasonably be covered by Vitest (layout, real-browser APIs, PWA/service worker, image decode, camera or file input), the browser check is the sole verification. Say so in the final report.
- Use the `chrome-devtools` MCP server from `.mcp.json`. If its tools are unavailable or it cannot start, stop and ask the user how to proceed. Never skip the check or substitute another browser tool.
- Start the app in MSW mode with `make start-frontend-msw` from the repo root, in the background. Leave `.env.local` untouched: it belongs to the developer. A second Vite start can delete the dependency cache of a server already running in `src/frontend`, so start the app only through this target.
- If the target reports port 5173 in use, reuse that server when `curl -s http://localhost:5173/src/shared/config.ts` shows `"VITE_APP_MSW_ENABLED": "true"`. Otherwise ask the developer how to proceed.
- Open <http://localhost:5173> with `new_page` and a new `isolatedContext` name for each check, so it starts with clean cookies, storage and service workers. The browser outlives a single check.
- Routes are hash-based: open `http://localhost:5173/#/<route>`. `emulate` reloads the page, so set the viewport before navigating to the flow.
- Device preferences live in localStorage (`src/shared/lib/devicePreferences.ts`), and a fresh context starts with them off. Set the ones the changed flow needs, then reload.
- File inputs: `upload_file` accepts repo paths only. Build a `File`, assign it to `input.files` through a `DataTransfer` in `evaluate_script`, and dispatch `change`. To hold or fail one request, wrap `window.fetch` in `navigate_page`'s `initScript`.
- Exercise the changed flow. Use `take_snapshot` to find elements to interact with; it is an accessibility-tree dump and cannot show how the page renders.
- After a navigation, `wait_for` a label the next step needs, spelled as the source writes it: `wait_for` matches DOM text case-sensitively, while the snapshot shows MUI button labels uppercased. The day page is ready once `Daily Nutrition Summary` appears. Its result is the page snapshot, so act on it instead of calling `take_snapshot`. Use `evaluate_script` for reading page state.
- Take a screenshot of every UI state the change affects (`take_screenshot` without `filePath`) and inspect it for broken layout, overflow, overlap and styling. Use `get_css_styles` to investigate anything that looks wrong.
- Check rendered UI at both a phone viewport (`390x844x3,mobile,touch`) and a desktop viewport (`1280x800x1`), set with `emulate`. A change that clearly affects only one layout may check just that one; say so in the final report. Emulation is not iOS Safari: on-screen keyboard and gesture behavior needs the iOS Simulator.
- Check `list_console_messages`. `ERR_CONNECTION_REFUSED` errors for `https://localhost:8080/api/v1/*` are the MSW-mode baseline; any other console error is a defect.
- Report in text only what you did and saw. Do not commit screenshots.
- When done, close the page with `close_page` and stop the dev server you started.
- MSW does not exercise the real backend. If the change touches an API contract, say that real-backend behavior is unverified.

### Testing

- Test a component's own rule in a colocated `<Component>.test.tsx` that renders it with `render` from `@tests/render`. Use `tests/*.test.tsx` with `renderApp` only for a flow that crosses routes. Both run against the mock API in `tests/mockApi/`, which the browser's MSW mode also uses; seed data is in `<entity>/<entity>.data.json`.
- Debug a failing test with `make test-frontend-quiet FILE=tests/app.test.tsx NAME='test name'` from the repo root (both variables are optional): it leaves the DOM dump out of the failure output. Confirm the failure message matches the symptom before repeating the run.
- **A green suite is not a clean suite.** Vitest's default reporter prints a test's `console.*` output and React warnings **only when that test fails** — a passing test's warnings are invisible, in both watch and `--run` mode. So warnings visible while a test is red silently vanish the moment it goes green, even though the defect causing them is still there. Verify with `yarn test --run --reporter=verbose` and treat any `stderr |` block as a defect to fix before finishing.
- Always give vitest mocks and assertion matchers explicit type arguments, so that a typo in a property name fails the build instead of silently failing at runtime
- Mocks: `vi.fn<SomeCallbackFn>()`, and helpers returning them typed as `Mock<SomeCallbackFn>` — never bare `vi.fn()` / `Mock`
- Matchers: `expect.objectContaining<Partial<T>>({ ... })`, `toStrictEqual<T>({ ... })`, including nested matchers

```ts
// BAD - the `defaultQuantitiy` typo compiles fine, the test just fails
const onSubmitProduct = vi.fn();

expect(onSubmitProduct).toHaveBeenCalledWith(
  expect.objectContaining({
    defaultQuantitiy: 100,
    category: expect.objectContaining({ name: 'Bakery' }),
  }),
);

// GOOD - the typo is a compile error
const onSubmitProduct = vi.fn<OnSubmitProductFn>();

expect(onSubmitProduct).toHaveBeenCalledWith(
  expect.objectContaining<Partial<ProductFormValues>>({
    defaultQuantity: 100,
    category: expect.objectContaining<Partial<SelectOption>>({ name: 'Bakery' }),
  }),
);
```

#### Never leave an async state update unflushed

When a component starts async work in an effect (`decode()`, a fetch, a timer), **every** test that renders it must await the settled state — including tests that assert on the pre-settle frame, and tests about something else entirely. A synchronous test body returns before the promise resolves, so the `setState` lands outside `act()` and React warns.

Awaiting the settled state is the fix, not `act(() => {})` padding. Where several tests need the same wait, extract one named helper so the intent survives.

```tsx
// BAD - asserts the first frame, then returns while decode() is still pending
test('should show the resized copy as soon as it is opened', () => {
  render(<ImageViewer opened src={ORIGINAL_SRC} fallbackSrc={FALLBACK_SRC} {...rest} />);
  expect(screen.getByAltText('Photo')).toHaveAttribute('src', FALLBACK_SRC);
});

// GOOD - the first frame is still the assertion, but the pending update is flushed in act()
test('should show the resized copy as soon as it is opened', async () => {
  render(<ImageViewer opened src={ORIGINAL_SRC} fallbackSrc={FALLBACK_SRC} {...rest} />);
  expect(screen.getByAltText('Photo')).toHaveAttribute('src', FALLBACK_SRC);
  await waitForOriginalToDecode();
});
```

#### Assert the logs on error-path tests

A test that deliberately drives a component into its `catch` branch makes that component's real `console.error` run, polluting the output and letting genuine warnings hide in the noise. Spy on it and assert the message — that silences the log and pins the behavior in one step.

```ts
const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
// ...
expect(consoleError).toHaveBeenCalledWith('Failed to upload images: ', expect.any(Error));
```
