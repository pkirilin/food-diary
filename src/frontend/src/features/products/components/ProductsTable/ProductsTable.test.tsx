import { screen, render } from '@testing-library/react';
import ProductsTable from './ProductsTable';

describe('when products are empty', () => {
  test('should show empty data message', async () => {
    render(
      <ProductsTable products={[]} isLoading={false} checkedIds={[]} onCheckedChange={vi.fn()} />,
    );

    expect(screen.getByText(/no products found/i));
  });
});
