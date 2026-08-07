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

  expect(screen.getByTestId('suggestion-skeleton')).toBeVisible();
  expect(screen.queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
});

test('should show the suggested values in an editable form', async () => {
  renderStep([createSuggestion()]);

  expect(await screen.findByRole('textbox', { name: /name/i })).toHaveValue('Oat granola');
  expect(screen.getByPlaceholderText(/calories/i)).toHaveValue('412');
  expect(screen.getByPlaceholderText(/default quantity/i)).toHaveValue('100');
  expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible();
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

test('should show a warning and no form when no food was found', async () => {
  renderStep([]);

  expect(await screen.findByText('No food found. Please try other images')).toBeVisible();
  expect(screen.queryByRole('textbox', { name: /name/i })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Open uploaded image preview 1' })).toBeVisible();
});
