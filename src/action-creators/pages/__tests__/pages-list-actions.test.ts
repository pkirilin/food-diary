import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  GetPagesListActions,
  GetPagesListDispatch,
  PagesListActionTypes,
  SetEditableForPagesAction,
  SetSelectedForAllPagesAction,
  SetSelectedForPageAction,
} from '../../../action-types';
import { PageItem, PagesFilter, SortOrder } from '../../../models';
import { PagesListState } from '../../../store';
import { getPages, setEditableForPages, setSelectedForAllPages, setSelectedForPage } from '../pages-list-actions';

const mockStore = configureStore<PagesListState, GetPagesListDispatch>([thunk]);
const store = mockStore();

jest.mock('../../../services');

const servicesMock = jest.requireMock('../../../services');
const getPagesAsyncMock = servicesMock.getPagesAsync as jest.Mock<Promise<Response>>;

describe('pages list action creators', () => {
  describe('getPages', () => {
    afterEach(() => {
      jest.clearAllMocks();
      store.clearActions();
    });

    test(`should dispatch '${PagesListActionTypes.Success}' after '${PagesListActionTypes.Request}' if server response is ok`, async () => {
      // Arrange
      const filter: PagesFilter = { sortOrder: SortOrder.Ascending };
      const action = getPages(filter);
      const pageItems: PageItem[] = [
        {
          id: 1,
          date: '2020-10-25',
          countCalories: 123,
          countNotes: 10,
        },
        {
          id: 2,
          date: '2020-10-26',
          countCalories: 456,
          countNotes: 12,
        },
      ];
      const expectedActions: GetPagesListActions[] = [
        {
          type: PagesListActionTypes.Request,
          loadingMessage: 'Loading pages',
        },
        {
          type: PagesListActionTypes.Success,
          pages: pageItems,
        },
      ];

      getPagesAsyncMock.mockResolvedValue({
        ...new Response(),
        ok: true,
        json: jest.fn().mockResolvedValue(pageItems),
      });

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });

    test(`should dispatch '${PagesListActionTypes.Error}' after '${PagesListActionTypes.Request}' if server response is not ok`, async () => {
      // Arrange
      const filter: PagesFilter = { sortOrder: SortOrder.Ascending };
      const action = getPages(filter);
      const expectedActions: GetPagesListActions[] = [
        {
          type: PagesListActionTypes.Request,
          loadingMessage: 'Loading pages',
        },
        {
          type: PagesListActionTypes.Error,
          errorMessage: 'Failed to get pages list: unknown response code',
        },
      ];

      getPagesAsyncMock.mockResolvedValue({
        ...new Response(),
        ok: false,
        status: -1,
      });

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });

    test(`should dispatch '${PagesListActionTypes.Error}' after '${PagesListActionTypes.Request}' if server error occured`, async () => {
      // Arrange
      const filter: PagesFilter = { sortOrder: SortOrder.Ascending };
      const action = getPages(filter);
      const expectedActions: GetPagesListActions[] = [
        {
          type: PagesListActionTypes.Request,
          loadingMessage: 'Loading pages',
        },
        {
          type: PagesListActionTypes.Error,
          errorMessage: 'Failed to get pages list',
        },
      ];

      getPagesAsyncMock.mockRejectedValue(new Response());

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('setSelectedForPage', () => {
    test(`should return '${PagesListActionTypes.SetSelected}' action`, () => {
      const expectedAction: SetSelectedForPageAction = {
        type: PagesListActionTypes.SetSelected,
        selected: true,
        pageId: 1,
      };

      const action = setSelectedForPage(true, 1);

      expect(action).toMatchObject(expectedAction);
    });
  });

  describe('setSelectedForAllPages', () => {
    test(`should return '${PagesListActionTypes.SetSelectedAll}' action`, () => {
      const expectedAction: SetSelectedForAllPagesAction = {
        type: PagesListActionTypes.SetSelectedAll,
        selected: true,
      };

      const action = setSelectedForAllPages(true);

      expect(action).toMatchObject(expectedAction);
    });
  });

  describe('setEditableForPages', () => {
    test(`should return '${PagesListActionTypes.SetEditable}' action`, () => {
      const expectedAction: SetEditableForPagesAction = {
        type: PagesListActionTypes.SetEditable,
        editable: true,
        pagesIds: [1, 2, 3],
      };

      const action = setEditableForPages([1, 2, 3], true);

      expect(action).toMatchObject(expectedAction);
    });
  });
});
