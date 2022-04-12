import { ReactElement } from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { create } from 'src/test-utils';

import Pages from '../Pages';

let ui: ReactElement;

describe('Pages', () => {
  describe('table', () => {
    beforeEach(() => {
      ui = create
        .component(<Pages></Pages>)
        .withReduxStore()
        .withRouter()
        .please();
    });

    // TODO: fix this test, add waiting for spinner to disappear
    test('shows empty page items message if server has no data', () => {
      render(ui);

      expect(screen.getByText(/no pages found/i)).toBeInTheDocument();
    });

    test('shows page items if server has data', async () => {
      render(ui);

      await expect(screen).toContainPageItems('01.03.2022', '02.03.2022', '03.03.2022');
    });
  });

  describe('export', () => {
    beforeEach(() => {
      ui = create
        .component(<Pages></Pages>)
        .withReduxStore()
        .withRouter()
        .withMuiPickersUtils()
        .please();
    });

    test('exports pages to Google Docs by filter parameters', async () => {
      render(ui);

      userEvent.click(screen.getByTitle('Export pages'));
      userEvent.click(screen.getByText('Export by filter parameters'));

      const startDate = screen.getByLabelText(/export start date/i);
      userEvent.type(startDate, '01.01.2022');

      const endDate = screen.getByLabelText(/export end date/i);
      userEvent.type(endDate, '05.01.2022');

      const format = screen.getByLabelText(/export format/i);
      fireEvent.mouseDown(format);
      const formatListbox = within(screen.getByRole('listbox'));
      userEvent.click(formatListbox.getByText(/google docs/i));

      const actions = within(screen.getByLabelText(/export dialog actions/i));
      userEvent.click(actions.getByText(/export/i));
    });
  });
});
