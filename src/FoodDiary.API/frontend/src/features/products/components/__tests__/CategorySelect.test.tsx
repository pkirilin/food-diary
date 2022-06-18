import { render, screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { create, server, rest, api } from 'src/test-utils';
import CategorySelect from '../CategorySelect';

function categorySelectWithoutValue() {
  return create
    .component(
      <CategorySelect
        label="Category"
        placeholder="Select a category"
        setValue={jest.fn()}
      ></CategorySelect>,
    )
    .withReduxStore()
    .please();
}

function categorySelectWithValue(value: string) {
  return create
    .component(
      <CategorySelect value={{ id: 1, name: value }} setValue={jest.fn()}></CategorySelect>,
    )
    .withReduxStore()
    .please();
}

test('shows all options after clicking on input', async () => {
  render(categorySelectWithoutValue());

  const input = screen.getByPlaceholderText(/select a category/i);
  await userEvent.click(input);
  await waitForElementToBeRemoved(screen.getByRole('progressbar'));

  expect(screen).toContainOptions('Bakery', 'Cereals', 'Dairy', 'Frozen Foods');
});

test('shows options matching input value', async () => {
  render(categorySelectWithoutValue());

  const input = screen.getByPlaceholderText(/select a category/i);
  await userEvent.click(input);
  await userEvent.type(input, 'ry');

  expect(screen).toContainOptions('Bakery', 'Dairy');
});

test('shows no options if input value does not match any existing option', async () => {
  render(categorySelectWithoutValue());

  const input = screen.getByPlaceholderText(/select a category/i);
  await userEvent.click(input);
  await userEvent.type(input, 'test');

  const options = screen.queryAllByRole('option');
  expect(options).toHaveLength(0);
});

test('shows no options after input closed', async () => {
  render(categorySelectWithoutValue());

  const input = screen.getByPlaceholderText(/select a category/i);
  await userEvent.click(input);
  await userEvent.type(input, 'frozen');
  await userEvent.click(screen.getByLabelText(/close/i));

  expect(screen.queryAllByRole('option')).toHaveLength(0);
});

test('shows no options after clicking on input if autocomplete has no options', async () => {
  server.use(
    rest.get(api('/api/v1/categories/autocomplete'), (req, res, ctx) => res(ctx.json([]))),
  );

  render(categorySelectWithoutValue());
  await userEvent.click(screen.getByPlaceholderText(/select a category/i));
  await waitForElementToBeRemoved(screen.getByRole('progressbar'));

  expect(screen).toContainEmptyOptions();
});

test('shows all options if closed with filtered options and then opened again', async () => {
  render(categorySelectWithoutValue());

  const input = screen.getByPlaceholderText(/select a category/i);
  await userEvent.click(input);
  await waitForElementToBeRemoved(screen.getByRole('progressbar'));
  await userEvent.type(input, 'ry');
  await userEvent.tab();
  await userEvent.click(input);

  expect(screen).toContainOptions('Bakery', 'Cereals', 'Dairy', 'Frozen Foods');
});

test('initializes selected value', async () => {
  render(categorySelectWithValue('Test category'));

  expect(screen.getByDisplayValue('Test category')).toBeInTheDocument();
});
