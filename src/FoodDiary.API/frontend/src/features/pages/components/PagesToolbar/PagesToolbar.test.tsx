import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { create } from 'src/test-utils';
import PagesToolbar from './PagesToolbar';

test('shows export dialog when "export by filter parameters" clicked', () => {
  const ui = create
    .component(<PagesToolbar></PagesToolbar>)
    .withReduxStore()
    .withMuiPickersUtils()
    .please();

  render(ui);
  userEvent.click(screen.getByTitle('Export pages'));
  userEvent.click(screen.getByText('Export by filter parameters'));

  const exportDialog = screen.getByRole('dialog');
  expect(within(exportDialog).getByText(/export pages/i)).toBeInTheDocument();
});
