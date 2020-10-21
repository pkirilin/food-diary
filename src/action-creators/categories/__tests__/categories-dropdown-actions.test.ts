import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  CategoriesDropdownActionTypes,
  GetCategoryDropdownItemsActions,
  GetCategoryDropdownItemsDispatch,
} from '../../../action-types';
import { CategoryDropdownItem, CategoryDropdownSearchRequest } from '../../../models';
import * as categoriesApiClient from '../../../services/categories-api-client';
import { CategoriesDropdownState } from '../../../store';
import { getCategoryDropdownItems } from '../categories-dropdown-actions';

const mockStore = configureStore<CategoriesDropdownState, GetCategoryDropdownItemsDispatch>([thunk]);
const store = mockStore();

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
      const categoriesApiClientMock = jest.spyOn(categoriesApiClient, 'getCategoryDropdownItemsAsync');

      categoriesApiClientMock.mockResolvedValue({
        ...new Response(),
        ok: true,
        json: jest.fn().mockResolvedValue(categoryDropdownItems),
      });

      // Act
      await store.dispatch(action);

      // Assert
      expect(categoriesApiClientMock).toHaveBeenCalledWith(request);
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
      const categoriesApiClientMock = jest.spyOn(categoriesApiClient, 'getCategoryDropdownItemsAsync');

      categoriesApiClientMock.mockResolvedValue({
        ...new Response(),
        ok: false,
        status: -1,
      });

      // Act
      await store.dispatch(action);

      // Assert
      expect(categoriesApiClientMock).toHaveBeenCalledWith(request);
      expect(store.getActions()).toEqual(expectedActions);
    });

    test(`should dispatch '${CategoriesDropdownActionTypes.Request}', then '${CategoriesDropdownActionTypes.Error}' if server error occured`, async () => {
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
      const categoriesApiClientMock = jest.spyOn(categoriesApiClient, 'getCategoryDropdownItemsAsync');

      categoriesApiClientMock.mockRejectedValue(new Response());

      // Act
      await store.dispatch(action);

      // Assert
      expect(categoriesApiClientMock).toHaveBeenCalledWith(request);
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
