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
- Always prioitize arrow function expressions (`const fn = () => {}`) over function definitions (`function fn() {}`)
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
