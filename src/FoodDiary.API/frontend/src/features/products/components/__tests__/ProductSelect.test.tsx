import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { create, server, rest, api } from 'src/test-utils';
import ProductSelect from '../ProductSelect';

function productSelectWithoutValue() {
  return create
    .component(
      <ProductSelect label="Product" placeholder="Select a product" setValue={jest.fn()} />,
    )
    .withReduxStore()
    .please();
}

function productSelectWithValue(value: string) {
  return create
    .component(<ProductSelect value={{ id: 1, name: value }} setValue={jest.fn()} />)
    .withReduxStore()
    .please();
}

test('shows all options after clicking on input', async () => {
  render(productSelectWithoutValue());
  await userEvent.click(screen.getByPlaceholderText(/select a product/i));
  await waitForElementToBeRemoved(screen.getByRole('progressbar'));

  expect(screen).toContainOptions('Bread', 'Cheese', 'Eggs', 'Meat');
});

test('shows options matching input value', async () => {
  render(productSelectWithoutValue());
  await userEvent.click(screen.getByPlaceholderText(/select a product/i));
  await userEvent.type(screen.getByPlaceholderText(/select a product/i), 'ea');

  expect(screen).toContainOptions('Bread', 'Meat');
});

test('shows no options if input value does not match any existing option', async () => {
  render(productSelectWithoutValue());
  await userEvent.click(screen.getByPlaceholderText(/select a product/i));
  await userEvent.type(screen.getByPlaceholderText(/select a product/i), 'test');

  const options = screen.queryAllByRole('option');
  expect(options).toHaveLength(0);
});

test('shows no options after input closed', async () => {
  render(productSelectWithoutValue());
  await userEvent.click(screen.getByPlaceholderText(/select a product/i));
  await userEvent.type(screen.getByPlaceholderText(/select a product/i), 'ea');
  await userEvent.click(screen.getByLabelText(/close/i));

  expect(screen.queryAllByRole('option')).toHaveLength(0);
});

test('shows no options after clicking on input if autocomplete has no options', async () => {
  server.use(rest.get(api('/api/v1/products/autocomplete'), (req, res, ctx) => res(ctx.json([]))));

  render(productSelectWithoutValue());
  await userEvent.click(screen.getByPlaceholderText(/select a product/i));
  await waitForElementToBeRemoved(screen.getByRole('progressbar'));

  expect(screen).toContainEmptyOptions();
});

test('shows all options if closed with filtered options and then opened again', async () => {
  render(productSelectWithoutValue());
  const input = screen.getByPlaceholderText(/select a product/i);
  await userEvent.click(input);
  await waitForElementToBeRemoved(screen.getByRole('progressbar'));
  await userEvent.type(input, 'ea');
  await userEvent.tab();
  await userEvent.click(input);

  expect(screen).toContainOptions('Bread', 'Cheese', 'Eggs', 'Meat');
});

test('initializes selected value if it specified', () => {
  render(productSelectWithValue('Test product'));

  expect(screen.getByDisplayValue('Test product')).toBeInTheDocument();
});
