import { screen } from '@testing-library/react';
import { render } from 'src/testing';
import Pages from './Pages';

test('pages are loaded into table', async () => {
  render(<Pages />);

  expect(screen).toContainPageItems('01.01.2022');
});

test('pages table is showing message for empty data', async () => {
  render(<Pages />);

  expect(screen.getByText(/no pages found/i));
});
