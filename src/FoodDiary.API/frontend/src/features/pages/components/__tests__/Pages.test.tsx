import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReactElement } from 'react';

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
        .please();
    });

    test('shows export menu on click', () => {
      render(ui);

      userEvent.click(screen.getByTitle('Export pages'));

      // TODO
      expect(false).toBeTruthy();
    });
  });
});
