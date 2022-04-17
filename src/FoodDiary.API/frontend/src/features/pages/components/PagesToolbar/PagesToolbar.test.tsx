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

  const exportDialog = screen.getByRole('dialog');
  expect(within(exportDialog).getByText(/export pages/i)).toBeInTheDocument();
  expect(within(exportDialog).getByLabelText(/format/i)).toBeInTheDocument();
  expect(within(exportDialog).getByDisplayValue(/json/i)).toBeInTheDocument();
});
