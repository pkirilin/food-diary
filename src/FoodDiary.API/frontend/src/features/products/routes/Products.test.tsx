import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { render } from 'src/testing';
import { db } from 'src/testing/server/db';
import Products from './Products';

test('products are loaded into table', async () => {
  render(<Products />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));

  expect(screen.getByText(/bread/i));
  expect(screen.getByLabelText(/bread calories cost is 250/i));
  expect(screen.getByLabelText(/bread is in bakery category/i));
});

test('products table is showing message for empty data', async () => {
  db.product.deleteMany({ where: {} });
  render(<Products />);

  await waitForElementToBeRemoved(screen.queryByRole('progressbar'));

  expect(screen.getByText(/no products found/i));
});
