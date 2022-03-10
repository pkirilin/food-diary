import { render, screen } from '@testing-library/react';
import { create } from '../../../../test-utils';
import { PagesSearchResult } from '../../models';
import Pages from '../Pages';

describe('Pages', () => {
  describe('when mounted', () => {
    test('should render empty page items message if server has no data', () => {
      const ui = create
        .component(<Pages></Pages>)
        .withReduxStore()
        .please();

      render(ui);

      expect(screen.getByTestId('empty-pages-text')).toBeInTheDocument();
    });

    test('should render page items if server has data', async () => {
      const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
        create
          .response()
          .withJsonData<PagesSearchResult>({
            totalPagesCount: 1,
            pageItems: [
              {
                id: 1,
                date: '2022-03-01',
                countNotes: 1,
                countCalories: 1000,
              },
            ],
          })
          .please(),
      );

      const ui = create
        .component(<Pages></Pages>)
        .withReduxStore()
        .withRouter()
        .please();

      render(ui);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(await screen.findByText(/01.03.2022/)).toBeInTheDocument();
    });
  });
});
