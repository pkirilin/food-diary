# Review AI Suggestions — Inline Editing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the "Review AI suggestions" screen an editable product form with the photos above it, remove the separate Accept step, and drop the now-redundant image viewer footer.

**Architecture:** The `image-upload` screen keeps its identity but renders `entities/product`'s `ProductForm`, prefilled from the AI suggestion, instead of a read-only card. Because the dialog's submit button lives outside the step, `ImageUploadScreenState` carries a nullable `formId` that the `activeScreen` selector computes from the recognition result; `NoteInputDialog` keys its submit button off that. No reducer changes.

**Tech Stack:** React 18 + TypeScript, MUI v6, Redux Toolkit, react-hook-form + Zod, Vitest + React Testing Library (jsdom), MSW.

## Global Constraints

- All work happens in `src/frontend/`. Run `yarn` commands from that directory, never the repo root.
- Feature-Sliced Design import direction: `features/manageNote` may import from `entities/*` and `shared/*`; never the reverse. `shared/ui/ImageViewer` must stay free of nutrition knowledge.
- ESLint `@typescript-eslint/strict-boolean-expressions` is an **error** — be explicit on null/undefined checks.
- `import/order` with alphabetized groups, `@/**` placed after `internal` (so: external packages, `react`, `@/...`, then relative imports).
- Function components must be arrow functions typed `FC<Props>` (`FC` bare when there are no props).
- All component props are required by default. Only make a prop optional if no existing component uses it.
- No comment may restate what the code already says. Comments only for non-obvious "why".
- `ImageUploadScreenState.formId` is typed **`'product-form' | null`** — required and nullable, not optional.
- Verification for every task: `yarn test`, and `yarn build` + `yarn lint` at the end of the plan.
- Reference spec: `docs/superpowers/specs/2026-08-07-review-ai-suggestions-inline-edit-design.md`.

---

### Task 1: Remove the footer from `shared/ui/ImageViewer`

**Files:**
- Modify: `src/frontend/src/shared/ui/ImageViewer/ImageViewer.tsx`
- Test: `src/frontend/src/shared/ui/ImageViewer/ImageViewer.test.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `ImageViewer` with props `{ src: string; fallbackSrc: string; alt: string; opened: boolean; onClose: () => void }` — the `footer: ReactNode` prop is gone. Task 2 consumes this.

- [ ] **Step 1: Rewrite the test file against the new prop set**

This is a removal, so the "failing test" is the test file updated to the API we want. Replace the entire contents of `src/frontend/src/shared/ui/ImageViewer/ImageViewer.test.tsx` with:

```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImageViewer } from './ImageViewer';

const ORIGINAL_SRC = 'blob:original';
const FALLBACK_SRC = 'data:image/jpeg;base64,resized';

test('should show nothing when closed', () => {
  render(
    <ImageViewer
      opened={false}
      src={ORIGINAL_SRC}
      fallbackSrc={FALLBACK_SRC}
      alt="Photo"
      onClose={vi.fn()}
    />,
  );

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('should expose the dialog with an accessible name', () => {
  render(
    <ImageViewer
      opened
      src={ORIGINAL_SRC}
      fallbackSrc={FALLBACK_SRC}
      alt="Photo"
      onClose={vi.fn()}
    />,
  );

  expect(screen.getByRole('dialog', { name: 'Photo' })).toBeVisible();
});

test('should show the image when opened', () => {
  render(
    <ImageViewer
      opened
      src={ORIGINAL_SRC}
      fallbackSrc={FALLBACK_SRC}
      alt="Photo"
      onClose={vi.fn()}
    />,
  );

  expect(screen.getByAltText('Photo')).toHaveAttribute('src', ORIGINAL_SRC);
});

test('should fall back to the resized copy when the original fails to load', () => {
  render(
    <ImageViewer
      opened
      src={ORIGINAL_SRC}
      fallbackSrc={FALLBACK_SRC}
      alt="Photo"
      onClose={vi.fn()}
    />,
  );

  const image = screen.getByAltText('Photo');
  fireEvent.error(image);

  expect(image).toHaveAttribute('src', FALLBACK_SRC);
});

test('should close on close button click', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();

  render(
    <ImageViewer
      opened
      src={ORIGINAL_SRC}
      fallbackSrc={FALLBACK_SRC}
      alt="Photo"
      onClose={onClose}
    />,
  );

  await user.click(screen.getByRole('button', { name: 'Close image viewer' }));

  expect(onClose).toHaveBeenCalled();
});
```

The two dropped tests are `should show the footer expanded and allow collapsing it` and `should show no footer bar when there is no footer` — both describe behaviour that no longer exists.

- [ ] **Step 2: Run the test to verify it fails**

Removing a required prop is a type-level break, not a runtime one, so the red comes from the compiler rather than the runner. Vitest does not typecheck.

Run: `cd src/frontend && yarn build`
Expected: FAIL with `Property 'footer' is missing in type … but required in type 'Props'`, pointing at `ImageViewer.test.tsx`.

Run: `cd src/frontend && yarn test src/shared/ui/ImageViewer/ImageViewer.test.tsx --run`
Expected: PASS — the 5 remaining tests never exercised the footer. This is the expected asymmetry; the compiler is the gate for this task.

- [ ] **Step 3: Remove the footer from the component**

Replace the entire contents of `src/frontend/src/shared/ui/ImageViewer/ImageViewer.tsx` with:

```tsx
import CloseIcon from '@mui/icons-material/Close';
import { Box, Dialog, IconButton } from '@mui/material';
import { useState, type FC } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

interface Props {
  src: string;
  fallbackSrc: string;
  alt: string;
  opened: boolean;
  onClose: () => void;
}

export const ImageViewer: FC<Props> = ({ src, fallbackSrc, alt, opened, onClose }) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  // Comparing against src rather than holding a boolean resets the fallback when src changes
  const displayedSrc = failedSrc === src ? fallbackSrc : src;

  return (
    <Dialog
      open={opened}
      onClose={onClose}
      fullScreen
      slotProps={{ paper: { 'aria-label': alt, sx: { backgroundColor: 'common.black' } } }}
    >
      <Box sx={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
        <TransformWrapper
          minScale={1}
          maxScale={8}
          centerOnInit
          doubleClick={{ mode: 'toggle', step: 3 }}
          wheel={{ step: 0.2 }}
        >
          <TransformComponent
            wrapperStyle={{ width: '100%', height: '100%' }}
            contentStyle={{ width: '100%', height: '100%' }}
          >
            <Box
              component="img"
              src={displayedSrc}
              alt={alt}
              onError={() => setFailedSrc(src)}
              sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </TransformComponent>
        </TransformWrapper>
        <IconButton
          aria-label="Close image viewer"
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: theme => theme.spacing(1),
            right: theme => theme.spacing(1),
            zIndex: 1,
            color: 'common.white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
    </Dialog>
  );
};
```

Removed: the `footer` prop, `footerExpanded` state, the translucent bottom bar with `env(safe-area-inset-bottom)` padding, the `Collapse`, the chevron `IconButton`, and the `Collapse` / `ExpandLessIcon` / `ExpandMoreIcon` / `ReactNode` imports.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `cd src/frontend && yarn test src/shared/ui/ImageViewer/ImageViewer.test.tsx --run`
Expected: PASS, 5 tests.

`src/features/manageNote/ui/ImagePreviewList.tsx` still passes `footer` and will not compile yet — that is Task 2. Do not fix it here.

- [ ] **Step 5: Commit**

```bash
cd /Users/pkirilin/storage/repo/personal/food-diary
git add src/frontend/src/shared/ui/ImageViewer
git commit -m "$(cat <<'EOF'
refactor(shared-ui): drop the ImageViewer footer slot

The suggested values become editable on the review screen, so the
read-only overlay duplicated them and covered part of the label.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Remove the `footer` prop from `ImagePreviewList`

**Files:**
- Modify: `src/frontend/src/features/manageNote/ui/ImagePreviewList.tsx`
- Modify: `src/frontend/src/features/manageNote/ui/ImageUploadStep.tsx` (the two `<ImagePreviewList …>` call sites)
- Test: `src/frontend/src/features/manageNote/ui/ImagePreviewList.test.tsx`

**Interfaces:**
- Consumes: `ImageViewer` without a `footer` prop (Task 1).
- Produces: `ImagePreviewList` with props `{ images: Image[] }`. Task 6 consumes this.

- [ ] **Step 1: Rewrite the test file against the new prop set**

Replace the entire contents of `src/frontend/src/features/manageNote/ui/ImagePreviewList.test.tsx` with:

```tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Image } from '../model';
import { ImagePreviewList } from './ImagePreviewList';

const createImage = (name: string): Image => ({
  id: `id-${name}`,
  name,
  base64: `data:image/jpeg;base64,${name}`,
  originalUrl: `blob:original-${name}`,
});

test('should show one button per image', () => {
  render(<ImagePreviewList images={[createImage('a'), createImage('b')]} />);

  expect(screen.getByRole('button', { name: 'Open uploaded image preview 1' })).toBeVisible();
  expect(screen.getByRole('button', { name: 'Open uploaded image preview 2' })).toBeVisible();
});

test('should open the original image and not the resized copy', async () => {
  const user = userEvent.setup();
  const image = createImage('a');

  render(<ImagePreviewList images={[image]} />);
  await user.click(screen.getByRole('button', { name: 'Open uploaded image preview 1' }));

  const viewerImage = within(screen.getByRole('dialog')).getByAltText('Uploaded image preview 1');

  expect(viewerImage).toHaveAttribute('src', image.originalUrl);
  expect(viewerImage).not.toHaveAttribute('src', image.base64);
});

test('should open the second image when its thumbnail tapped', async () => {
  const user = userEvent.setup();
  const imageA = createImage('a');
  const imageB = createImage('b');

  render(<ImagePreviewList images={[imageA, imageB]} />);
  await user.click(screen.getByRole('button', { name: 'Open uploaded image preview 2' }));

  const viewerImage = within(screen.getByRole('dialog')).getByAltText('Uploaded image preview 2');

  expect(viewerImage).toHaveAttribute('src', imageB.originalUrl);
});

test('should dismiss the viewer on close', async () => {
  const user = userEvent.setup();

  render(<ImagePreviewList images={[createImage('a')]} />);
  await user.click(screen.getByRole('button', { name: 'Open uploaded image preview 1' }));
  await user.click(screen.getByRole('button', { name: 'Close image viewer' }));

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
```

The two dropped tests are `should show the footer inside the opened viewer` and `should open the viewer when there is no footer`.

- [ ] **Step 2: Run the test to verify it fails**

As in Task 1, the gate is the compiler: the test file no longer passes the still-required `footer`, and `ImagePreviewList` still forwards it to an `ImageViewer` that no longer declares it.

Run: `cd src/frontend && yarn build`
Expected: FAIL with two errors — `Property 'footer' is missing` at the `ImagePreviewList` usages in the test file, and `Property 'footer' does not exist on type 'IntrinsicAttributes & Props'` at the `ImageViewer` usage in `ImagePreviewList.tsx`.

Run: `cd src/frontend && yarn test src/features/manageNote/ui/ImagePreviewList.test.tsx --run`
Expected: PASS — an undefined `footer` is simply ignored downstream.

- [ ] **Step 3: Remove the prop from the component**

Replace the entire contents of `src/frontend/src/features/manageNote/ui/ImagePreviewList.tsx` with:

```tsx
import { Box, ButtonBase } from '@mui/material';
import { useState, type FC } from 'react';
import { ImageViewer } from '@/shared/ui';
import { type Image } from '../model';

interface Props {
  images: Image[];
}

export const ImagePreviewList: FC<Props> = ({ images }) => {
  const [openedImage, setOpenedImage] = useState<Image | null>(null);

  return (
    <>
      <Box display="flex" gap={2} flexWrap="wrap">
        {images.map((image, index) => (
          <ButtonBase
            key={image.id}
            aria-label={`Open uploaded image preview ${index + 1}`}
            onClick={() => setOpenedImage(image)}
            sx={{ width: 128, height: 128, borderRadius: 2 }}
          >
            <Box
              component="img"
              src={image.base64}
              alt=""
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 2,
              }}
            />
          </ButtonBase>
        ))}
      </Box>
      {openedImage !== null && (
        <ImageViewer
          opened
          src={openedImage.originalUrl}
          fallbackSrc={openedImage.base64}
          alt={`Uploaded image preview ${images.indexOf(openedImage) + 1}`}
          onClose={() => setOpenedImage(null)}
        />
      )}
    </>
  );
};
```

- [ ] **Step 4: Update the two call sites in `ImageUploadStep`**

In `src/frontend/src/features/manageNote/ui/ImageUploadStep.tsx`, change the "no food found" branch:

```tsx
<ImagePreviewList images={images} footer={null} />
```

to:

```tsx
<ImagePreviewList images={images} />
```

and the success branch:

```tsx
<ImagePreviewList images={images} footer={<SuggestedProductCard suggestion={suggestion} />} />
```

to:

```tsx
<ImagePreviewList images={images} />
```

The standalone `<SuggestedProductCard suggestion={suggestion} />` below it stays for now — Task 6 removes it — so the `SuggestedProductCard` import is still used and must not be deleted here.

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd src/frontend && yarn test --run`
Expected: PASS, whole suite.

Run: `cd src/frontend && yarn build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
cd /Users/pkirilin/storage/repo/personal/food-diary
git add src/frontend/src/features/manageNote/ui/ImagePreviewList.tsx \
        src/frontend/src/features/manageNote/ui/ImagePreviewList.test.tsx \
        src/frontend/src/features/manageNote/ui/ImageUploadStep.tsx
git commit -m "$(cat <<'EOF'
refactor(manage-note): drop the footer prop from ImagePreviewList

Follows the ImageViewer footer removal; the list is again a plain
grid of thumbnails that open the viewer.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Give the image-upload screen a `formId`

**Files:**
- Modify: `src/frontend/src/features/manageNote/model/types.ts`
- Modify: `src/frontend/src/features/manageNote/model/manageNoteSlice.ts`
- Test: `src/frontend/src/features/manageNote/model/manageNoteSlice.test.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `ImageUploadScreenState = { type: 'image-upload'; formId: 'product-form' | null; images: Image[] }`, with `formId` set to `'product-form'` exactly when `noteRecognition.suggestions.at(0)?.product` exists. Task 6 consumes this from `NoteInputDialog`.

This task changes no rendering. It only teaches the screen state whether a form is mounted, which the dialog needs because its submit button lives outside the step.

- [ ] **Step 1: Fix the `create.state` test helper so overrides are honoured**

In `src/frontend/src/features/manageNote/model/manageNoteSlice.test.ts`, the helper currently drops everything except `note`:

```ts
  state: ({ note }: Partial<ManageNoteState>): ManageNoteState => ({
    ...initialState,
    note,
  }),
```

Replace it with:

```ts
  state: (overrides: Partial<ManageNoteState>): ManageNoteState => ({
    ...initialState,
    ...overrides,
  }),
```

This is a prerequisite, not a drive-by: the new tests below set `images` and `noteRecognition`, which the old helper silently discarded. It also makes the existing `actions.productDraftSaved` test meaningful — that test passes `images` and `noteRecognition` today and asserts they end up empty, which passed only because they were never set.

- [ ] **Step 2: Write the failing tests**

Add these two tests inside the existing `describe('selectors.activeScreen', …)` block in the same file:

```ts
  test('should show image-upload screen without a form when nothing was recognized', () => {
    const manageNote = create.state({
      note: create.note(),
      images: [create.image('foo.jpg')],
    });

    const activeScreen = manageNoteSlice.selectors.activeScreen({ manageNote });

    expect(activeScreen).toMatchObject({ type: 'image-upload', formId: null });
  });

  test('should show image-upload screen with the product form when a product was recognized', () => {
    const manageNote = create.state({
      note: create.note(),
      images: [create.image('foo.jpg')],
      noteRecognition: create.noteRecognitionWithSuggestions('Oat granola'),
    });

    const activeScreen = manageNoteSlice.selectors.activeScreen({ manageNote });

    expect(activeScreen).toMatchObject({ type: 'image-upload', formId: 'product-form' });
  });
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `cd src/frontend && yarn test src/features/manageNote/model/manageNoteSlice.test.ts --run`
Expected: FAIL — both new tests report the received object has no `formId` property.

- [ ] **Step 4: Add `formId` to the screen state type**

In `src/frontend/src/features/manageNote/model/types.ts`, replace:

```ts
interface ImageUploadScreenState {
  type: 'image-upload';
  images: Image[];
}
```

with:

```ts
interface ImageUploadScreenState {
  type: 'image-upload';
  formId: 'product-form' | null;
  images: Image[];
}
```

- [ ] **Step 5: Compute `formId` in the `activeScreen` selector**

In `src/frontend/src/features/manageNote/model/manageNoteSlice.ts`, replace the whole `activeScreen` selector with:

```ts
    activeScreen: createSelector(
      [
        (state: ManageNoteState) => state.note,
        (state: ManageNoteState) => state.product,
        (state: ManageNoteState) => state.images,
        (state: ManageNoteState) => state.noteRecognition.suggestions,
      ],
      (note, product, images, suggestions): ManageNoteScreenState => {
        if (product) {
          return {
            type: 'product-input',
            formId: 'product-form',
            product,
          };
        }

        if (images.length > 0) {
          return {
            type: 'image-upload',
            formId: suggestions.at(0)?.product ? 'product-form' : null,
            images,
          };
        }

        if (!note?.product) {
          return { type: 'product-search' };
        }

        return {
          type: 'note-input',
          formId: 'note-form',
          note,
        };
      },
    ),
```

Only the fourth input selector and the `image-upload` return value are new; everything else is unchanged.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `cd src/frontend && yarn test src/features/manageNote/model/manageNoteSlice.test.ts --run`
Expected: PASS, all tests in the file.

Run: `cd src/frontend && yarn test --run`
Expected: PASS, whole suite.

- [ ] **Step 7: Commit**

```bash
cd /Users/pkirilin/storage/repo/personal/food-diary
git add src/frontend/src/features/manageNote/model
git commit -m "$(cat <<'EOF'
feat(manage-note): expose a form id on the image upload screen

The note dialog renders the submit button outside the active step, so
the screen state has to say whether a form is currently mounted.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Add an `autoFocus` prop to `ProductForm`

**Files:**
- Modify: `src/frontend/src/entities/product/ui/ProductForm.tsx`
- Modify: `src/frontend/src/features/manageNote/ui/NoteInputDialog.tsx`
- Modify: `src/frontend/src/features/product/addEdit/ui/ProductInputDialog/ProductInputDialog.tsx`
- Create: `src/frontend/src/entities/product/ui/ProductForm.test.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `ProductForm` props gain a required `autoFocus: boolean` controlling focus on the Name field. Task 6 passes `autoFocus={false}`.

The review screen exists to look at a photo. Focusing the Name field on arrival pops the mobile keyboard over it, so that screen needs to opt out.

- [ ] **Step 1: Write the failing tests**

Create `src/frontend/src/entities/product/ui/ProductForm.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { RootProvider } from '@/app/RootProvider';
import { configureStore } from '@/app/store';
import { type ProductFormValues } from '../model';
import { ProductForm } from './ProductForm';

const defaultValues: ProductFormValues = {
  name: 'Oat granola',
  defaultQuantity: 100,
  category: { id: 1, name: 'Cereals' },
  calories: 412,
  protein: null,
  fats: null,
  carbs: null,
  sugar: null,
  salt: null,
};

const renderForm = (autoFocus: boolean): void => {
  render(
    <RootProvider store={configureStore()}>
      <ProductForm
        formId="product-form"
        autoFocus={autoFocus}
        defaultValues={defaultValues}
        categories={[]}
        categoriesLoading={false}
        onSubmit={vi.fn()}
      />
    </RootProvider>,
  );
};

test('should focus the name field when autoFocus enabled', () => {
  renderForm(true);

  expect(screen.getByRole('textbox', { name: /name/i })).toHaveFocus();
});

test('should not focus the name field when autoFocus disabled', () => {
  renderForm(false);

  expect(screen.getByRole('textbox', { name: /name/i })).not.toHaveFocus();
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd src/frontend && yarn test src/entities/product/ui/ProductForm.test.tsx --run`
Expected: FAIL — `autoFocus` is not a known prop, and the second test fails because the Name field is focused unconditionally.

- [ ] **Step 3: Add the prop to `ProductForm`**

In `src/frontend/src/entities/product/ui/ProductForm.tsx`, add `autoFocus` to the `Props` interface after `categoriesLoading` (properties before callbacks):

```ts
interface Props {
  formId: string;
  defaultValues: ProductFormValues;
  categories: SelectOption[];
  categoriesLoading: boolean;
  autoFocus: boolean;
  onSubmit: OnSubmitProductFn;
  onNutritionSuggestingChange?: (nutritionSuggesting: boolean) => void;
}
```

Add it to the destructured parameter list:

```tsx
export const ProductForm: FC<Props> = ({
  formId,
  defaultValues,
  categories,
  categoriesLoading,
  autoFocus,
  onSubmit,
  onNutritionSuggestingChange,
}) => {
```

And in the `name` `Controller`, change the hardcoded flag:

```tsx
          <TextField
            {...field}
            fullWidth
            autoFocus
```

to:

```tsx
          <TextField
            {...field}
            fullWidth
            autoFocus={autoFocus}
```

- [ ] **Step 4: Update both existing call sites to keep today's behaviour**

In `src/frontend/src/features/manageNote/ui/NoteInputDialog.tsx`, the `product-input` case:

```tsx
          <ProductForm
            formId={activeScreen.formId}
            autoFocus
            defaultValues={activeScreen.product}
            categories={categories}
            categoriesLoading={categoriesLoading}
            onSubmit={handleSubmitProduct}
          />
```

In `src/frontend/src/features/product/addEdit/ui/ProductInputDialog/ProductInputDialog.tsx`:

```tsx
        <ProductForm
          formId="product-input-form"
          autoFocus
          defaultValues={productFormValues}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onSubmit={onSubmit}
          onNutritionSuggestingChange={setIsNutritionSuggesting}
        />
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `cd src/frontend && yarn test src/entities/product/ui/ProductForm.test.tsx --run`
Expected: PASS, 2 tests.

Run: `cd src/frontend && yarn test --run`
Expected: PASS, whole suite — in particular `ProductInputDialog.test.tsx`, whose behaviour is unchanged.

- [ ] **Step 6: Commit**

```bash
cd /Users/pkirilin/storage/repo/personal/food-diary
git add src/frontend/src/entities/product/ui/ProductForm.tsx \
        src/frontend/src/entities/product/ui/ProductForm.test.tsx \
        src/frontend/src/features/manageNote/ui/NoteInputDialog.tsx \
        src/frontend/src/features/product/addEdit/ui/ProductInputDialog/ProductInputDialog.tsx
git commit -m "$(cat <<'EOF'
feat(product): let callers opt out of focusing the product name field

The AI review screen is about looking at a photo; focusing the name
field there would pop the mobile keyboard over it.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Reshape the loading skeleton to match the product form

**Files:**
- Create: `src/frontend/src/features/manageNote/ui/SuggestionSkeleton.tsx`
- Delete: `src/frontend/src/features/manageNote/ui/SuggestedProductCardSkeleton.tsx`
- Modify: `src/frontend/src/features/manageNote/ui/ImageUploadStep.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `SuggestionSkeleton: FC` — a no-props placeholder shaped like `ProductForm`. Task 6 renders it in two places.

This is a presentational refactor with no behavioural test of its own; its use is asserted in Task 6's `ImageUploadStep` tests. Verification here is the compiler, the linter and the existing suite.

- [ ] **Step 1: Create the reshaped skeleton**

Create `src/frontend/src/features/manageNote/ui/SuggestionSkeleton.tsx`:

```tsx
import { Grid2, Skeleton, Stack } from '@mui/material';
import { type FC } from 'react';

export const SuggestionSkeleton: FC = () => (
  <Stack spacing={2}>
    <Skeleton variant="rounded" height={56} />
    <Skeleton variant="rounded" height={56} />
    <Grid2 container spacing={2}>
      <Grid2 size={6}>
        <Skeleton variant="rounded" height={56} />
      </Grid2>
      <Grid2 size={6}>
        <Skeleton variant="rounded" height={56} />
      </Grid2>
    </Grid2>
    <Skeleton variant="rounded" height={48} />
  </Stack>
);
```

The five blocks stand in for the Name field, the Category field, the Calories / Default quantity row (same `Grid2 size={6}` split `ProductForm` uses), and the Nutrition accordion summary — so the placeholder and the real form take comparable height and the screen does not jump when the form mounts.

- [ ] **Step 2: Delete the old skeleton**

```bash
cd /Users/pkirilin/storage/repo/personal/food-diary
git rm src/frontend/src/features/manageNote/ui/SuggestedProductCardSkeleton.tsx
```

- [ ] **Step 3: Update `ImageUploadStep` to use it**

In `src/frontend/src/features/manageNote/ui/ImageUploadStep.tsx`, replace the import:

```tsx
import { SuggestedProductCardSkeleton } from './SuggestedProductCardSkeleton';
```

with:

```tsx
import { SuggestionSkeleton } from './SuggestionSkeleton';
```

and in the `isLoading` branch, replace `<SuggestedProductCardSkeleton />` with `<SuggestionSkeleton />`.

- [ ] **Step 4: Verify nothing else referenced the old name**

Run: `cd /Users/pkirilin/storage/repo/personal/food-diary && grep -rn "SuggestedProductCardSkeleton" src/frontend/src`
Expected: no output.

Run: `cd src/frontend && yarn build && yarn lint && yarn test --run`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/pkirilin/storage/repo/personal/food-diary
git add src/frontend/src/features/manageNote/ui/SuggestionSkeleton.tsx \
        src/frontend/src/features/manageNote/ui/SuggestedProductCardSkeleton.tsx \
        src/frontend/src/features/manageNote/ui/ImageUploadStep.tsx
git commit -m "$(cat <<'EOF'
refactor(manage-note): shape the recognition skeleton like the product form

The review screen is about to render a form rather than a card, so the
placeholder should reserve the same space.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Render the editable product form on the review screen

**Files:**
- Modify: `src/frontend/src/features/manageNote/ui/ImageUploadStep.tsx`
- Modify: `src/frontend/src/features/manageNote/ui/NoteInputDialog.tsx`
- Delete: `src/frontend/src/features/manageNote/ui/SuggestedProductCard.tsx`
- Test: `src/frontend/src/features/manageNote/ui/ImageUploadStep.test.tsx` (new)

**Interfaces:**
- Consumes: `ImagePreviewList` props `{ images }` (Task 2); `ImageUploadScreenState.formId: 'product-form' | null` (Task 3); `ProductForm` prop `autoFocus: boolean` (Task 4); `SuggestionSkeleton: FC` (Task 5).
- Produces: `ImageUploadStep` props `{ images: Image[]; onSubmitProduct: OnSubmitProductFn }`, where `OnSubmitProductFn` is `(product: productModel.ProductFormValues) => Promise<void>` exported from `@/entities/product`. Final task of the feature.

- [ ] **Step 1: Write the failing tests**

Create `src/frontend/src/features/manageNote/ui/ImageUploadStep.test.tsx`:

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Mock } from 'vitest';
import { RootProvider } from '@/app/RootProvider';
import { configureStore } from '@/app/store';
import { type RecognizeNoteItem } from '@/entities/note';
import { actions, type Image } from '../model';
import { ImageUploadStep } from './ImageUploadStep';

const createImage = (name: string): Image => ({
  id: `id-${name}`,
  name,
  base64: `data:image/jpeg;base64,${name}`,
  originalUrl: `blob:original-${name}`,
});

const createSuggestion = (): RecognizeNoteItem => ({
  product: {
    name: 'Oat granola',
    caloriesCost: 412,
    protein: 8.1,
    fats: 12.4,
    carbs: 61,
    sugar: 0.1,
    salt: 0.1,
  },
  quantity: 100,
});

const renderStep = (suggestions: RecognizeNoteItem[]): Mock => {
  const store = configureStore();
  const images = [createImage('a')];
  const onSubmitProduct = vi.fn();

  store.dispatch(actions.imagesUploaded(images));
  store.dispatch(actions.noteRecognitionSucceded({ notes: suggestions }));

  render(
    <RootProvider store={store}>
      <ImageUploadStep images={images} onSubmitProduct={onSubmitProduct} />
      <button type="submit" form="product-form">
        Add
      </button>
    </RootProvider>,
  );

  return onSubmitProduct;
};

test('should show a skeleton instead of the form while categories are loading', () => {
  renderStep([createSuggestion()]);

  expect(screen.queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
});

test('should show the suggested values in an editable form', async () => {
  renderStep([createSuggestion()]);

  expect(await screen.findByRole('textbox', { name: /name/i })).toHaveValue('Oat granola');
  expect(screen.getByPlaceholderText(/calories/i)).toHaveValue('412');
  expect(screen.getByPlaceholderText(/default quantity/i)).toHaveValue('100');
});

test('should submit the corrected values', async () => {
  const user = userEvent.setup();
  const onSubmitProduct = renderStep([createSuggestion()]);

  await screen.findByRole('textbox', { name: /name/i });
  await user.clear(screen.getByPlaceholderText(/calories/i));
  await user.type(screen.getByPlaceholderText(/calories/i), '380');
  await user.click(screen.getByRole('button', { name: 'Add' }));

  await waitFor(() => {
    expect(onSubmitProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Oat granola',
        calories: 380,
        defaultQuantity: 100,
        category: expect.objectContaining({ name: 'Bakery' }),
      }),
    );
  });
});

test('should re-run recognition on retry', async () => {
  const user = userEvent.setup();
  renderStep([createSuggestion()]);

  await user.click(screen.getByRole('button', { name: 'Retry' }));

  expect(await screen.findByText('Analyzing Images...')).toBeVisible();
});

test('should show a warning and no form when no food was found', async () => {
  renderStep([]);

  expect(await screen.findByText('No food found. Please try other images')).toBeVisible();
  expect(screen.queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Open uploaded image preview 1' })).toBeVisible();
});
```

Notes for whoever runs this:
- The standalone `<button type="submit" form="product-form">` stands in for the dialog's submit button, which really does live outside the form — the same arrangement `ProductInputDialog` already relies on.
- `'Bakery'` is the expected default category because the MSW category autocomplete returns the seeded categories sorted by name ascending, and the form defaults to `categories.at(0)`.
- The first test asserts synchronously, before the delayed MSW categories response resolves, which is exactly the window the skeleton covers.

- [ ] **Step 2: Run the tests to verify they fail**

Run: `cd src/frontend && yarn test src/features/manageNote/ui/ImageUploadStep.test.tsx --run`
Expected: FAIL — `ImageUploadStep` does not accept `onSubmitProduct`, renders no form, and still shows an Accept button.

- [ ] **Step 3: Rewrite `ImageUploadStep`**

Replace the entire contents of `src/frontend/src/features/manageNote/ui/ImageUploadStep.tsx` with:

```tsx
import RefreshIcon from '@mui/icons-material/Refresh';
import { Alert, AlertTitle, LinearProgress, Stack, Typography } from '@mui/material';
import { type FC } from 'react';
import { useAppSelector } from '@/app/store';
import { categoryLib } from '@/entities/category';
import { type RecognizeNoteItem } from '@/entities/note';
import { ProductForm, type OnSubmitProductFn, type productModel } from '@/entities/product';
import { type SelectOption } from '@/shared/types';
import { Button } from '@/shared/ui';
import { useRecognizeNotes } from '../lib/useRecognizeNotes';
import { type Image } from '../model';
import { ImagePreviewList } from './ImagePreviewList';
import { SuggestionSkeleton } from './SuggestionSkeleton';

interface Props {
  images: Image[];
  onSubmitProduct: OnSubmitProductFn;
}

const toProductFormValues = (
  { product, quantity }: RecognizeNoteItem,
  category: SelectOption | null,
): productModel.ProductFormValues => ({
  name: product.name.trim(),
  defaultQuantity: quantity,
  category,
  calories: product.caloriesCost,
  protein: product.protein,
  fats: product.fats,
  carbs: product.carbs,
  sugar: product.sugar,
  salt: product.salt,
});

export const ImageUploadStep: FC<Props> = ({ images, onSubmitProduct }) => {
  const recognizeNotes = useRecognizeNotes();
  const isSubmitting = useAppSelector(state => state.manageNote.isSubmitting);
  const { categories, categoriesLoading } = categoryLib.useCategoriesForSelect();

  const { suggestions, isLoading, error } = useAppSelector(
    state => state.manageNote.noteRecognition,
  );

  if (isLoading) {
    return (
      <Stack spacing={3}>
        <Typography variant="h6" component="h2">
          Analyzing Images...
        </Typography>
        <LinearProgress />
        <SuggestionSkeleton />
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            disabled={isSubmitting}
            onClick={() => recognizeNotes(images)}
          >
            Retry
          </Button>
        }
      >
        <AlertTitle>{error.title}</AlertTitle>
        {error.message}
      </Alert>
    );
  }

  const suggestion = suggestions.at(0);

  if (!suggestion?.product) {
    return (
      <Stack spacing={3}>
        <ImagePreviewList images={images} />
        <Alert severity="warning">No food found. Please try other images</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h6" component="h2">
        Review AI suggestions
      </Typography>
      <ImagePreviewList images={images} />
      {categoriesLoading ? (
        <SuggestionSkeleton />
      ) : (
        <ProductForm
          formId="product-form"
          autoFocus={false}
          defaultValues={toProductFormValues(suggestion, categories.at(0) ?? null)}
          categories={categories}
          categoriesLoading={categoriesLoading}
          onSubmit={onSubmitProduct}
        />
      )}
      <Button
        startIcon={<RefreshIcon />}
        variant="outlined"
        fullWidth
        disabled={isSubmitting}
        onClick={() => recognizeNotes(images)}
      >
        Retry
      </Button>
    </Stack>
  );
};
```

Gone from this file: `CheckIcon`, `useAppDispatch`, the `actions` import, the `SuggestedProductCard` import and both of its usages, and the Accept `Button` with its `productDraftCreated` dispatch — that object literal now lives in `toProductFormValues`.

The `categoriesLoading` gate is load-bearing, not decoration: `useForm({ defaultValues })` reads its defaults once at mount, so mounting the form before the category list arrives would bake `category: null` in permanently.

- [ ] **Step 4: Wire the dialog to the new step and to `formId`**

In `src/frontend/src/features/manageNote/ui/NoteInputDialog.tsx`, replace:

```ts
  const inputScreenActive =
    activeScreen.type === 'note-input' || activeScreen.type === 'product-input';

  const activeFormId = inputScreenActive ? activeScreen.formId : undefined;
```

with:

```ts
  const activeFormId = 'formId' in activeScreen ? activeScreen.formId : null;
```

Replace the `image-upload` case in `renderContent`:

```tsx
      case 'image-upload':
        return <ImageUploadStep images={activeScreen.images} />;
```

with:

```tsx
      case 'image-upload':
        return (
          <ImageUploadStep images={activeScreen.images} onSubmitProduct={handleSubmitProduct} />
        );
```

And update the submit button:

```tsx
      renderSubmit={props => (
        <Button
          {...props}
          type="submit"
          form={activeFormId ?? undefined}
          disabled={activeFormId === null || submitDisabled}
          loading={isSubmitting}
        >
          {submitText}
        </Button>
      )}
```

`handleSubmitProduct` is already in scope — `NoteInputDialog` calls `useSubmitProduct(date)` today for the `product-input` branch, and the same handler now serves both. That keeps `date` out of `ImageUploadStep`.

- [ ] **Step 5: Delete the read-only card**

```bash
cd /Users/pkirilin/storage/repo/personal/food-diary
git rm src/frontend/src/features/manageNote/ui/SuggestedProductCard.tsx
```

Run: `cd /Users/pkirilin/storage/repo/personal/food-diary && grep -rn "SuggestedProductCard" src/frontend/src`
Expected: no output.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `cd src/frontend && yarn test src/features/manageNote/ui/ImageUploadStep.test.tsx --run`
Expected: PASS, 5 tests.

Run: `cd src/frontend && yarn test --run`
Expected: PASS, whole suite.

- [ ] **Step 7: Commit**

```bash
cd /Users/pkirilin/storage/repo/personal/food-diary
git add src/frontend/src/features/manageNote/ui
git commit -m "$(cat <<'EOF'
feat(manage-note): edit AI suggestions on the review screen

The review screen now renders the product form prefilled from the
suggestion, so a wrong value is corrected where it is spotted with the
photo one tap away. The separate Accept step is gone.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Full verification

**Files:** none — this task only runs checks and fixes whatever they surface.

**Interfaces:**
- Consumes: everything from Tasks 1–6.
- Produces: a branch that builds, lints and tests clean.

- [ ] **Step 1: Build**

Run: `cd src/frontend && yarn build`
Expected: PASS, no TypeScript errors.

- [ ] **Step 2: Lint**

Run: `cd src/frontend && yarn lint`
Expected: PASS, no errors. If `import/order` complains in a rewritten file, run `yarn lint:fix` and re-check.

- [ ] **Step 3: Format check**

Run: `cd src/frontend && yarn format:check`
Expected: PASS. If it fails, run `yarn format` and amend the last commit.

- [ ] **Step 4: Full test suite**

Run: `cd src/frontend && yarn test --run`
Expected: PASS, every file.

- [ ] **Step 5: Confirm the dead code is gone**

Run:
```bash
cd /Users/pkirilin/storage/repo/personal/food-diary
grep -rn "SuggestedProductCard\|footer=" src/frontend/src/features/manageNote src/frontend/src/shared/ui/ImageViewer
```
Expected: no output.

- [ ] **Step 6: Manual smoke check (optional, needs the dev server)**

Run: `cd src/frontend && yarn start` with `.env.local` set to `VITE_APP_MSW_ENABLED=true`, `VITE_APP_FAKE_AUTH_ENABLED=true`, `VITE_APP_FAKE_AUTH_LOGIN_ON_INIT=true`.

Walk the flow: add a note → upload a photo → confirm the review screen shows the editable form with thumbnails above it and no Accept button → tap a thumbnail and confirm the viewer opens with no footer bar → correct a value → press Add → confirm you land on the note form.

- [ ] **Step 7: Commit any fixes**

Only if steps 1–5 required changes:

```bash
cd /Users/pkirilin/storage/repo/personal/food-diary
git add -A src/frontend
git commit -m "$(cat <<'EOF'
chore(frontend): fix lint and formatting after the review screen rework

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
EOF
)"
```

No README.md or CLAUDE.md updates are needed: no env vars, Node/npm or .NET versions change.

---

## Spec coverage

| Spec requirement | Task |
|---|---|
| `ImageUploadStep` renders `ProductForm` prefilled from the suggestion | 6 |
| Accept button removed; dialog submit drives the product form | 6 |
| `ImageViewer` loses `footer` and the collapse affordance | 1 |
| `ImagePreviewList` loses `footer` | 2 |
| `SuggestedProductCard` deleted | 6 |
| Skeleton renamed and reshaped to the form layout | 5 |
| `ImageUploadScreenState.formId: 'product-form' \| null` + selector | 3 |
| `NoteInputDialog` keys submit off `activeFormId` | 6 |
| `ProductForm` gains `autoFocus` | 4 |
| Mount-time defaults guarded by the `categoriesLoading` gate | 6 |
| Test updates: ImageViewer / ImagePreviewList / slice / new ImageUploadStep | 1, 2, 3, 6 |
| `yarn build`, `yarn test`, `yarn lint` | 7 |
