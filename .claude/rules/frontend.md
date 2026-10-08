---
paths:
  - '*.ts'
  - '*.tsx'
---

## Development Standards

### Architecture

- Use functional components with hooks as the primary pattern
- Implement component composition over inheritance
- Organize components, hooks, and functions using feature-sliced design (FSD) approach
- Separate presentational and container components clearly
- Use custom hooks for reusable stateful logic
- Implement proper component hierarchies with clear data flow
- Always prioritize arrow function expressions (`const fn = () => {}`) over function definitions (`function fn() {}`). Exception: route components in `src/app/routes/` are function declarations placed below the route definition (`export const Route = createFileRoute(...)({ component: HistoryRoute })`, then `function HistoryRoute() {}`), following TanStack Router's idiom
- Custom hooks must not own UI-presentation concerns (alerts, snackbars, toasts, dialogs). Keep that state in the component and let the hook report outcomes through callbacks (e.g. `onError(message)`, `onInfo(message)`) that the component wires to its UI.
- Custom hooks must not depend on form library types or instances (e.g. react-hook-form's `UseFormGetValues`/`UseFormSetValue`, `control`). Pass narrow callbacks instead (e.g. `getName`, `getFieldValue`, `setFieldValue`) so the hook stays decoupled from the form layer.

### TypeScript Integration

- Use TypeScript interfaces for props, state, hooks, utils, and component definitions
- **Never use `any`. If type is unknown, use `unknown` with type guards instead**
- Define proper types for event handlers and refs
- Leverage React's built-in types (`React.FC`, `React.ComponentProps`, etc.)
- Do not use `React.<SomeType>`, always import `<SomeType>` from `react`
- Create union types for component variants and states

### Component Design

- Follow the single responsibility principle for components
- Use descriptive and consistent naming conventions
- Implement proper prop validation with TypeScript
- Design components to be testable and reusable
- Keep components small and focused on a single concern
- Use composition patterns (render props, children as functions)

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
- Use the `playwright-cli`. Check playwright-cli --help for available commands. Run every command as `yarn playwright-cli <command>` from `src/frontend` — never a global install. The shell's working directory persists between calls, so check it first (`pwd`) and `cd` only if it isn't already `src/frontend`. If the browser is missing, run `make setup-frontend` from the repo root.
- Start the app from `src/frontend` in MSW mode with inline env vars. `.env.local` belongs to the developer; do not edit it:

```shell
VITE_APP_MSW_ENABLED=true VITE_APP_FAKE_AUTH_ENABLED=true VITE_APP_FAKE_AUTH_LOGIN_ON_INIT=true yarn start
```

- Open <http://localhost:5173>, exercise the changed flow, and check `yarn playwright-cli console`. `ERR_CONNECTION_REFUSED` errors for `https://localhost:8080/api/v1/*` are the MSW-mode baseline; any other console error is a defect.
- Report in text only what you did and saw. Do not commit screenshots.
- Stop the dev server and close the browser (`yarn playwright-cli close`) when done.
- MSW does not exercise the real backend. If the change touches an API contract, say that real-backend behavior is unverified.

### Testing

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
