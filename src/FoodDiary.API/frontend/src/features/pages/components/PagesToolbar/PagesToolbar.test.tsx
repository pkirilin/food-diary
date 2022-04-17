import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { create } from 'src/test-utils';
import PagesToolbar from './PagesToolbar';

test('shows export dialog when "export to json" clicked', () => {
  const ui = create
    .component(<PagesToolbar></PagesToolbar>)
    .withReduxStore()
    .withMuiPickersUtils()
    .please();

  render(ui);
  userEvent.click(screen.getByTitle(/export pages/i));
  userEvent.click(screen.getByText(/export to json/i));

  const exportDialog = within(screen.getByRole('dialog'));
  expect(exportDialog.getByText(/export pages/i)).toBeInTheDocument();
  expect(exportDialog.getByText(/export to json/i)).toBeInTheDocument();
});

test('shows export dialog when "export to google docs" clicked', () => {
  const ui = create
    .component(<PagesToolbar></PagesToolbar>)
    .withReduxStore()
    .withMuiPickersUtils()
    .please();

  render(ui);
  userEvent.click(screen.getByTitle(/export pages/i));
  userEvent.click(screen.getByText(/export to google docs/i));

  const exportDialog = within(screen.getByRole('dialog'));
  expect(exportDialog.getByText(/export pages/i)).toBeInTheDocument();
  expect(exportDialog.getByText(/export to google docs/i)).toBeInTheDocument();
});
