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
