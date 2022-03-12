import { render, screen, waitFor } from '@testing-library/react';
import { create } from '../../../../test-utils';
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
      const fetchMock = jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(
          create
            .response()
            .withJsonData(
              create
                .pagesSearchResultModel()
                .withPageItem('2022-03-01')
                .withPageItem('2022-03-02')
                .withPageItem('2022-03-03')
                .please(),
            )
            .please(),
        );

      const ui = create
        .component(<Pages></Pages>)
        .withReduxStore()
        .withRouter()
        .please();

      render(ui);

      expect(fetchMock).toHaveBeenCalledTimes(1);
      await waitFor(async () => {
        expect(await screen.findByText('01.03.2022')).toBeInTheDocument();
        expect(await screen.findByText('02.03.2022')).toBeInTheDocument();
        expect(await screen.findByText('03.03.2022')).toBeInTheDocument();
      });
    });
  });
});
