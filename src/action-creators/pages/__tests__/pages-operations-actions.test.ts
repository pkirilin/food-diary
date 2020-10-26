import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  DeletePagesActions,
  EditPageActions,
  ExportPagesActions,
  GetDateForNewPageActions,
  ImportPagesActions,
  ModalActionTypes,
  OpenModalAction,
  PagesOperationsActions,
  PagesOperationsActionsDispatch,
  PagesOperationsActionTypes,
} from '../../../action-types';
import { ExportFormat, PageCreateEdit, PageEditRequest, PagesExportRequest } from '../../../models';
import { PagesOperationsState } from '../../../store';
import {
  createPage,
  editPage,
  deletePages,
  exportPages,
  importPages,
  getDateForNewPage,
} from '../pages-operations-actions';

const mockStore = configureStore<PagesOperationsState, PagesOperationsActionsDispatch>([thunk]);
const store = mockStore();

jest.mock('../../../services');
jest.mock('../../modal-actions');

const servicesMock = jest.requireMock('../../../services');
const modalActionsMock = jest.requireMock('../../modal-actions');

const createPageAsyncMock = servicesMock.createPageAsync as jest.Mock<Promise<Response>>;
const editPageAsyncMock = servicesMock.editPageAsync as jest.Mock<Promise<Response>>;
const deletePagesAsyncMock = servicesMock.deletePagesAsync as jest.Mock<Promise<Response>>;
const exportPagesAsyncMock = servicesMock.exportPagesAsync as jest.Mock<Promise<Response>>;
const importPagesAsyncMock = servicesMock.importPagesAsync as jest.Mock<Promise<Response>>;
const getDateForNewPageAsyncMock = servicesMock.getDateForNewPageAsync as jest.Mock<Promise<Response>>;
const openMessageModalMock = modalActionsMock.openMessageModal as jest.Mock<OpenModalAction>;

const fakeOpenModalAction: OpenModalAction = {
  type: ModalActionTypes.Open,
  title: 'Title',
  body: 'Body',
};

describe('pages operations action creators', () => {
  afterEach(() => {
    jest.clearAllMocks();
    store.clearActions();
  });

  describe('createPage', () => {
    test(`should dispatch '${PagesOperationsActionTypes.CreateSuccess}' after '${PagesOperationsActionTypes.CreateRequest}' if server response is ok`, async () => {
      // Arrange
      const page: PageCreateEdit = { date: '2020-10-26' };
      const action = createPage(page);
      const expectedActions: PagesOperationsActions[] = [
        {
          type: PagesOperationsActionTypes.CreateRequest,
          operationMessage: 'Creating page',
          page,
        },
        {
          type: PagesOperationsActionTypes.CreateSuccess,
          createdPageId: 5,
        },
      ];

      createPageAsyncMock.mockResolvedValue({
        ...new Response(),
        ok: true,
        text: jest.fn().mockResolvedValue('5'),
      });

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });

    test(`should dispatch '${ModalActionTypes.Open}' and '${PagesOperationsActionTypes.CreateError}' after '${PagesOperationsActionTypes.CreateRequest}' if server response is not ok`, async () => {
      // Arrange
      const page: PageCreateEdit = { date: '2020-10-26' };
      const action = createPage(page);
      const expectedActions: (PagesOperationsActions | OpenModalAction)[] = [
        {
          type: PagesOperationsActionTypes.CreateRequest,
          operationMessage: 'Creating page',
          page,
        },
        fakeOpenModalAction,
        {
          type: PagesOperationsActionTypes.CreateError,
          error: 'Failed to create page: unknown response code',
        },
      ];

      createPageAsyncMock.mockResolvedValue({
        ...new Response(),
        ok: false,
        status: -1,
      });

      openMessageModalMock.mockReturnValue(fakeOpenModalAction);

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });

    test(`should dispatch '${ModalActionTypes.Open}' and '${PagesOperationsActionTypes.CreateError}' after '${PagesOperationsActionTypes.CreateRequest}' if request failed`, async () => {
      // Arrange
      const page: PageCreateEdit = { date: '2020-10-26' };
      const action = createPage(page);
      const expectedActions: (PagesOperationsActions | OpenModalAction)[] = [
        {
          type: PagesOperationsActionTypes.CreateRequest,
          operationMessage: 'Creating page',
          page,
        },
        fakeOpenModalAction,
        {
          type: PagesOperationsActionTypes.CreateError,
          error: 'Failed to create page',
        },
      ];

      createPageAsyncMock.mockRejectedValue(new Response());

      openMessageModalMock.mockReturnValue(fakeOpenModalAction);

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('editPage', () => {
    test(`should dispatch '${PagesOperationsActionTypes.EditSuccess}' after '${PagesOperationsActionTypes.EditRequest}' if server response is ok`, async () => {
      // Arrange
      const request: PageEditRequest = { id: 1, page: { date: '2020-10-26' } };
      const action = editPage(request);
      const expectedActions: (EditPageActions | OpenModalAction)[] = [
        {
          type: PagesOperationsActionTypes.EditRequest,
          request,
          operationMessage: 'Updating page',
        },
        {
          type: PagesOperationsActionTypes.EditSuccess,
        },
      ];

      editPageAsyncMock.mockResolvedValue({
        ...new Response(),
        ok: true,
      });

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });

    test(`should dispatch '${ModalActionTypes.Open}' and '${PagesOperationsActionTypes.EditError}' after '${PagesOperationsActionTypes.EditRequest}' if server response is not ok`, async () => {
      // Arrange
      const request: PageEditRequest = { id: 1, page: { date: '2020-10-26' } };
      const action = editPage(request);
      const expectedActions: (EditPageActions | OpenModalAction)[] = [
        {
          type: PagesOperationsActionTypes.EditRequest,
          request,
          operationMessage: 'Updating page',
        },
        fakeOpenModalAction,
        {
          type: PagesOperationsActionTypes.EditError,
          error: 'Failed to update page: unknown response code',
        },
      ];

      editPageAsyncMock.mockResolvedValue({
        ...new Response(),
        ok: false,
        status: -1,
      });
      openMessageModalMock.mockReturnValue(fakeOpenModalAction);

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });

    test(`should dispatch '${ModalActionTypes.Open}' and '${PagesOperationsActionTypes.EditError}' after '${PagesOperationsActionTypes.EditRequest}' if request failed`, async () => {
      // Arrange
      const request: PageEditRequest = { id: 1, page: { date: '2020-10-26' } };
      const action = editPage(request);
      const expectedActions: (EditPageActions | OpenModalAction)[] = [
        {
          type: PagesOperationsActionTypes.EditRequest,
          request,
          operationMessage: 'Updating page',
        },
        fakeOpenModalAction,
        {
          type: PagesOperationsActionTypes.EditError,
          error: 'Failed to update page',
        },
      ];

      editPageAsyncMock.mockRejectedValue(new Response());
      openMessageModalMock.mockReturnValue(fakeOpenModalAction);

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('deletePages', () => {
    test(`should dispatch '${PagesOperationsActionTypes.DeleteSuccess}' after '${PagesOperationsActionTypes.DeleteRequest}' if server response is ok`, async () => {
      // Arrange
      const pageIds = [1, 2, 3];
      const action = deletePages(pageIds);
      const expectedActions: (DeletePagesActions | OpenModalAction)[] = [
        {
          type: PagesOperationsActionTypes.DeleteRequest,
          operationMessage: 'Deleting pages',
        },
        {
          type: PagesOperationsActionTypes.DeleteSuccess,
        },
      ];

      deletePagesAsyncMock.mockResolvedValue({
        ...new Response(),
        ok: true,
      });

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });

    test(`should dispatch '${ModalActionTypes.Open}' and '${PagesOperationsActionTypes.DeleteError}' after '${PagesOperationsActionTypes.DeleteRequest}' if server response is not ok`, async () => {
      // Arrange
      const pageIds = [1];
      const action = deletePages(pageIds);
      const expectedActions: (DeletePagesActions | OpenModalAction)[] = [
        {
          type: PagesOperationsActionTypes.DeleteRequest,
          operationMessage: 'Deleting page',
        },
        fakeOpenModalAction,
        {
          type: PagesOperationsActionTypes.DeleteError,
          error: 'Failed to delete selected page: unknown response code',
        },
      ];

      deletePagesAsyncMock.mockResolvedValue({
        ...new Response(),
        ok: false,
        status: -1,
      });
      openMessageModalMock.mockReturnValue(fakeOpenModalAction);

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });

    test(`should dispatch '${ModalActionTypes.Open}' and '${PagesOperationsActionTypes.DeleteError}' after '${PagesOperationsActionTypes.DeleteRequest}' if request failed`, async () => {
      // Arrange
      const pageIds = [1];
      const action = deletePages(pageIds);
      const expectedActions: (DeletePagesActions | OpenModalAction)[] = [
        {
          type: PagesOperationsActionTypes.DeleteRequest,
          operationMessage: 'Deleting page',
        },
        fakeOpenModalAction,
        {
          type: PagesOperationsActionTypes.DeleteError,
          error: 'Failed to delete selected page',
        },
      ];

      deletePagesAsyncMock.mockRejectedValue(new Response());
      openMessageModalMock.mockReturnValue(fakeOpenModalAction);

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('exportPages', () => {
    test(`should dispatch '${PagesOperationsActionTypes.ExportSuccess}' after '${PagesOperationsActionTypes.ExportRequest}' if server response is ok`, async () => {
      // Arrange
      const request: PagesExportRequest = {
        startDate: '2020-10-25',
        endDate: '2020-10-26',
        format: ExportFormat.Json,
      };
      const action = exportPages(request);
      const fakeExportFileBlob = new Blob();
      const expectedActions: ExportPagesActions[] = [
        {
          type: PagesOperationsActionTypes.ExportRequest,
          operationMessage: 'Exporting pages',
        },
        {
          type: PagesOperationsActionTypes.ExportSuccess,
          exportFile: fakeExportFileBlob,
        },
      ];

      exportPagesAsyncMock.mockResolvedValue({
        ...new Response(),
        ok: true,
        blob: jest.fn().mockResolvedValue(fakeExportFileBlob),
      });

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });

    test(`should dispatch '${ModalActionTypes.Open}' and '${PagesOperationsActionTypes.ExportError}' after '${PagesOperationsActionTypes.ExportRequest}' if server response is not ok`, async () => {
      // Arrange
      const request: PagesExportRequest = {
        startDate: '2020-10-25',
        endDate: '2020-10-26',
        format: ExportFormat.Json,
      };
      const action = exportPages(request);
      const expectedActions: (ExportPagesActions | OpenModalAction)[] = [
        {
          type: PagesOperationsActionTypes.ExportRequest,
          operationMessage: 'Exporting pages',
        },
        fakeOpenModalAction,
        {
          type: PagesOperationsActionTypes.ExportError,
          error: 'Failed to export pages: unknown response code',
        },
      ];

      exportPagesAsyncMock.mockResolvedValue({
        ...new Response(),
        ok: false,
        status: -1,
      });
      openMessageModalMock.mockReturnValue(fakeOpenModalAction);

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });

    test(`should dispatch '${ModalActionTypes.Open}' and '${PagesOperationsActionTypes.ExportError}' after '${PagesOperationsActionTypes.ExportRequest}' if request failed`, async () => {
      // Arrange
      const request: PagesExportRequest = {
        startDate: '2020-10-25',
        endDate: '2020-10-26',
        format: ExportFormat.Json,
      };
      const action = exportPages(request);
      const expectedActions: (ExportPagesActions | OpenModalAction)[] = [
        {
          type: PagesOperationsActionTypes.ExportRequest,
          operationMessage: 'Exporting pages',
        },
        fakeOpenModalAction,
        {
          type: PagesOperationsActionTypes.ExportError,
          error: 'Failed to export pages',
        },
      ];

      exportPagesAsyncMock.mockRejectedValue(new Response());
      openMessageModalMock.mockReturnValue(fakeOpenModalAction);

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('importPages', () => {
    test(`should dispatch '${PagesOperationsActionTypes.ImportSuccess}' after '${PagesOperationsActionTypes.ImportRequest}' if server response is ok`, async () => {
      // Arrange
      const fakeImportFile = new File([], 'test');
      const action = importPages(fakeImportFile);
      const expectedActions: ImportPagesActions[] = [
        {
          type: PagesOperationsActionTypes.ImportRequest,
          operationMessage: 'Importing pages',
        },
        {
          type: PagesOperationsActionTypes.ImportSuccess,
        },
      ];

      importPagesAsyncMock.mockResolvedValue({
        ...new Response(),
        ok: true,
      });

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });

    test(`should dispatch '${ModalActionTypes.Open}' and '${PagesOperationsActionTypes.ImportError}' after '${PagesOperationsActionTypes.ImportRequest}' if server response is not ok`, async () => {
      // Arrange
      const fakeImportFile = new File([], 'test');
      const action = importPages(fakeImportFile);
      const expectedActions: (ImportPagesActions | OpenModalAction)[] = [
        {
          type: PagesOperationsActionTypes.ImportRequest,
          operationMessage: 'Importing pages',
        },
        fakeOpenModalAction,
        {
          type: PagesOperationsActionTypes.ImportError,
          error: 'Failed to import pages: unknown response code',
        },
      ];

      importPagesAsyncMock.mockResolvedValue({
        ...new Response(),
        ok: false,
        status: -1,
      });
      openMessageModalMock.mockReturnValue(fakeOpenModalAction);

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });

    test(`should dispatch '${ModalActionTypes.Open}' and '${PagesOperationsActionTypes.ImportError}' after '${PagesOperationsActionTypes.ImportRequest}' if request failed`, async () => {
      // Arrange
      const fakeImportFile = new File([], 'test');
      const action = importPages(fakeImportFile);
      const expectedActions: (ImportPagesActions | OpenModalAction)[] = [
        {
          type: PagesOperationsActionTypes.ImportRequest,
          operationMessage: 'Importing pages',
        },
        fakeOpenModalAction,
        {
          type: PagesOperationsActionTypes.ImportError,
          error: 'Failed to import pages',
        },
      ];

      importPagesAsyncMock.mockRejectedValue(new Response());
      openMessageModalMock.mockReturnValue(fakeOpenModalAction);

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  describe('getDateForNewPage', () => {
    test(`should dispatch '${PagesOperationsActionTypes.DateForNewPageSuccess}' after '${PagesOperationsActionTypes.DateForNewPageRequest}' if server response is ok`, async () => {
      // Arrange
      const action = getDateForNewPage();
      const expectedActions: GetDateForNewPageActions[] = [
        {
          type: PagesOperationsActionTypes.DateForNewPageRequest,
          operationMessage: 'Getting date',
        },
        {
          type: PagesOperationsActionTypes.DateForNewPageSuccess,
          dateForNewPage: '2020-10-26',
        },
      ];

      getDateForNewPageAsyncMock.mockResolvedValue({
        ...new Response(),
        ok: true,
        text: jest.fn().mockResolvedValue('2020-10-26'),
      });

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });

    test(`should dispatch '${PagesOperationsActionTypes.DateForNewPageError}' after '${PagesOperationsActionTypes.DateForNewPageRequest}' if server response is not ok`, async () => {
      // Arrange
      const action = getDateForNewPage();
      const expectedActions: (GetDateForNewPageActions | OpenModalAction)[] = [
        {
          type: PagesOperationsActionTypes.DateForNewPageRequest,
          operationMessage: 'Getting date',
        },
        {
          type: PagesOperationsActionTypes.DateForNewPageError,
          error: 'Failed to get date for new page: unknown response code',
        },
      ];

      getDateForNewPageAsyncMock.mockResolvedValue({
        ...new Response(),
        ok: false,
        status: -1,
      });

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });

    test(`should dispatch '${PagesOperationsActionTypes.DateForNewPageError}' after '${PagesOperationsActionTypes.DateForNewPageRequest}' if request failed`, async () => {
      // Arrange
      const action = getDateForNewPage();
      const expectedActions: (GetDateForNewPageActions | OpenModalAction)[] = [
        {
          type: PagesOperationsActionTypes.DateForNewPageRequest,
          operationMessage: 'Getting date',
        },
        {
          type: PagesOperationsActionTypes.DateForNewPageError,
          error: 'Failed to get date for new page',
        },
      ];

      getDateForNewPageAsyncMock.mockRejectedValue(new Response());

      // Act
      await store.dispatch(action);

      // Assert
      expect(store.getActions()).toEqual(expectedActions);
    });
  });
});
