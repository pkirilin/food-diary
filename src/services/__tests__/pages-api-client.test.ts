import { API_URL } from '../../config';
import { PageCreateEdit, PageEditRequest, PagesFilter, SortOrder } from '../../models';
import {
  createPageAsync,
  deletePagesAsync,
  editPageAsync,
  getDateForNewPageAsync,
  getPagesAsync,
} from '../pages-api-client';

const fetchMock = jest.fn();
global.fetch = fetchMock;

describe('pages api client', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPagesAsync', () => {
    const testData = [
      {
        filter: {
          startDate: '2020-10-27',
          endDate: '2020-10-28',
          sortOrder: SortOrder.Descending,
        } as PagesFilter,
        requestPath: '/v1/pages?sortOrder=1&startDate=2020-10-27&endDate=2020-10-28',
      },
      {
        filter: {
          sortOrder: SortOrder.Ascending,
        } as PagesFilter,
        requestPath: '/v1/pages?sortOrder=0',
      },
    ];

    testData.forEach(({ filter, requestPath }) => {
      test(`should GET pages with params: (sortOrder: ${filter.sortOrder}, startDate: ${filter.startDate}, endDate: ${filter.endDate}) on '${requestPath}'`, async () => {
        const options: RequestInit = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        };

        await getPagesAsync(filter);

        expect(fetchMock).toHaveBeenCalledWith(API_URL + requestPath, options);
      });
    });
  });

  describe('createPageAsync', () => {
    test(`should POST page on 'v1/pages'`, async () => {
      const page: PageCreateEdit = { date: '2020-10-28' };
      const options: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(page),
      };

      await createPageAsync(page);

      expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/v1/pages`, options);
    });
  });

  describe('editPageAsync', () => {
    test(`should PUT page with id = 1 on 'v1/pages/1'`, async () => {
      const page: PageCreateEdit = { date: '2020-10-28' };
      const request: PageEditRequest = {
        id: 1,
        page,
      };
      const options: RequestInit = {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(page),
      };

      await editPageAsync(request);

      expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/v1/pages/1`, options);
    });
  });

  describe('deletePagesAsync', () => {
    test(`should DELETE pages with id = 1 on 'v1/pages/batch'`, async () => {
      const pagesIds = [1, 2, 3];
      const options: RequestInit = {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pagesIds),
      };

      await deletePagesAsync(pagesIds);

      expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/v1/pages/batch`, options);
    });
  });

  describe('getDateForNewPageAsync', () => {
    test(`should GET page date on 'v1/pages/date'`, async () => {
      const options: RequestInit = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      await getDateForNewPageAsync();

      expect(fetchMock).toHaveBeenCalledWith(`${API_URL}/v1/pages/date`, options);
    });
  });
});
