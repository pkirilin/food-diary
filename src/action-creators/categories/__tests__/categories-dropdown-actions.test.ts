import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  CategoriesDropdownActionTypes,
  GetCategoryDropdownItemsActions,
  GetCategoryDropdownItemsDispatch,
} from '../../../action-types';
import { CategoryDropdownItem, CategoryDropdownSearchRequest } from '../../../models';
import { CategoriesDropdownState } from '../../../store';
import { getCategoryDropdownItems } from '../categories-dropdown-actions';

const mockStore = configureStore<CategoriesDropdownState, GetCategoryDropdownItemsDispatch>([thunk]);
const store = mockStore();

jest.mock('../../../services');

const servicesMockObject = jest.requireMock('../../../services');

const getCategoryDropdownItemsAsyncMock = servicesMockObject.getCategoryDropdownItemsAsync as jest.Mock<
  Promise<Response>
>;

describe('categories dropdown actions', () => {
  describe('getCategoryDropdownItems', () => {
    afterEach(() => {
      jest.clearAllMocks();
      store.clearActions();
    });

    test(`should dispatch '${CategoriesDropdownActionTypes.Request}', then '${CategoriesDropdownActionTypes.Success}' if server response is ok`, async () => {
      // Arrange
      const request: CategoryDropdownSearchRequest = {
        categoryNameFilter: 'test',
      };
      const action = getCategoryDropdownItems(request);
      const categoryDropdownItems: CategoryDropdownItem[] = [
        {
          id: 1,
          name: 'Category 1',
        },
        {
          id: 2,
          name: 'Category 2',
        },
      ];
      const expectedActions: GetCategoryDropdownItemsActions[] = [
        {
          type: CategoriesDropdownActionTypes.Request,
          loadingMessage: 'Loading categories',
        },
        {
          type: CategoriesDropdownActionTypes.Success,
          categoryDropdownItems,
        },
      ];

      getCategoryDropdownItemsAsyncMock.mockResolvedValue({
        ...new Response(),
        ok: true,
        json: jest.fn().mockResolvedValue(categoryDropdownItems),
      });

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });

    test(`should dispatch '${CategoriesDropdownActionTypes.Request}', then '${CategoriesDropdownActionTypes.Error}' if server response is not ok`, async () => {
      // Arrange
      const request: CategoryDropdownSearchRequest = {
        categoryNameFilter: 'test',
      };
      const action = getCategoryDropdownItems(request);
      const expectedActions: GetCategoryDropdownItemsActions[] = [
        {
          type: CategoriesDropdownActionTypes.Request,
          loadingMessage: 'Loading categories',
        },
        {
          type: CategoriesDropdownActionTypes.Error,
          error: 'Failed to get categories: unknown response code',
        },
      ];

      getCategoryDropdownItemsAsyncMock.mockResolvedValue({
        ...new Response(),
        ok: false,
        status: -1,
      });

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });

    test(`should dispatch '${CategoriesDropdownActionTypes.Request}', then '${CategoriesDropdownActionTypes.Error}' if request failed`, async () => {
      // Arrange
      const request: CategoryDropdownSearchRequest = {
        categoryNameFilter: 'test',
      };
      const action = getCategoryDropdownItems(request);
      const expectedActions: GetCategoryDropdownItemsActions[] = [
        {
          type: CategoriesDropdownActionTypes.Request,
          loadingMessage: 'Loading categories',
        },
        {
          type: CategoriesDropdownActionTypes.Error,
          error: 'Failed to get categories',
        },
      ];

      getCategoryDropdownItemsAsyncMock.mockRejectedValue(new Response());

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
