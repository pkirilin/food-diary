# Inspecting Element Attributes

When the snapshot doesn't show an element's `id`, `class`, `data-*` attributes, or other DOM properties, use `eval` to inspect them.

## Examples

```bash
yarn playwright-cli snapshot
# snapshot shows a button as e7 but doesn't reveal its id or data attributes

# get the element's id
yarn playwright-cli eval "el => el.id" e7

# get all CSS classes
yarn playwright-cli eval "el => el.className" e7

# get a specific attribute
yarn playwright-cli eval "el => el.getAttribute('data-testid')" e7
yarn playwright-cli eval "el => el.getAttribute('aria-label')" e7

# get a computed style property
yarn playwright-cli eval "el => getComputedStyle(el).display" e7
```
