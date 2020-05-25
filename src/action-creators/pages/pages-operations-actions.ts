import { Dispatch } from 'redux';
import { PageCreateEdit, PageEditRequest, PagesExportRequest } from '../../models';
import {
  PagesOperationsActionTypes,
  CreatePageSuccessAction,
  CreatePageErrorAction,
  CreatePageRequestAction,
  EditPageSuccessAction,
  EditPageErrorAction,
  EditPageRequestAction,
  DeletePagesSuccessAction,
  DeletePagesErrorAction,
  DeletePagesRequestAction,
  CreatePageActionCreator,
  CreatePageActions,
  EditPageActionCreator,
  EditPageActions,
  DeletePagesActionCreator,
  DeletePagesActions,
  ExportPagesActionCreator,
  ExportPagesActions,
  ExportPagesSuccessAction,
  ExportPagesErrorAction,
  ExportPagesRequestAction,
  ImportPagesActionCreator,
  ImportPagesActions,
  ImportPagesRequestAction,
  ImportPagesSuccessAction,
  ImportPagesErrorAction,
  GetDateForNewPageActionCreator,
  GetDateForNewPageActions,
  GetDateForNewPageSuccessAction,
  GetDateForNewPageErrorAction,
  GetDateForNewPageRequestAction,
} from '../../action-types';
import {
  createPageAsync,
  deletePagesAsync,
  editPageAsync,
  exportPagesAsync,
  importPagesAsync,
  getDateForNewPageAsync,
} from '../../services';
import { readBadRequestResponseAsync } from '../../utils/bad-request-response-reader';

const createPageRequest = (page: PageCreateEdit, operationMessage: string): CreatePageRequestAction => {
  return {
    type: PagesOperationsActionTypes.CreateRequest,
    page,
    operationMessage,
  };
};

const createPageSuccess = (createdPageId: number): CreatePageSuccessAction => {
  return {
    type: PagesOperationsActionTypes.CreateSuccess,
    createdPageId,
  };
};

const createPageError = (error: string): CreatePageErrorAction => {
  return {
    type: PagesOperationsActionTypes.CreateError,
    error,
  };
};

const editPageRequest = (request: PageEditRequest, operationMessage: string): EditPageRequestAction => {
  return {
    type: PagesOperationsActionTypes.EditRequest,
    request,
    operationMessage,
  };
};

const editPageSuccess = (): EditPageSuccessAction => {
  return {
    type: PagesOperationsActionTypes.EditSuccess,
  };
};

const editPageError = (error: string): EditPageErrorAction => {
  return {
    type: PagesOperationsActionTypes.EditError,
    error,
  };
};

const deletePagesRequest = (operationMessage: string): DeletePagesRequestAction => {
  return {
    type: PagesOperationsActionTypes.DeleteRequest,
    operationMessage,
  };
};

const deletePagesSuccess = (): DeletePagesSuccessAction => {
  return {
    type: PagesOperationsActionTypes.DeleteSuccess,
  };
};

const deletePagesError = (error: string): DeletePagesErrorAction => {
  return {
    type: PagesOperationsActionTypes.DeleteError,
    error,
  };
};

const exportPagesRequest = (operationMessage: string): ExportPagesRequestAction => {
  return {
    type: PagesOperationsActionTypes.ExportRequest,
    operationMessage,
  };
};

const exportPagesSuccess = (exportFile: Blob): ExportPagesSuccessAction => {
  return {
    type: PagesOperationsActionTypes.ExportSuccess,
    exportFile,
  };
};

const exportPagesError = (error: string): ExportPagesErrorAction => {
  return {
    type: PagesOperationsActionTypes.ExportError,
    error,
  };
};

const importPagesRequest = (operationMessage: string): ImportPagesRequestAction => {
  return {
    type: PagesOperationsActionTypes.ImportRequest,
    operationMessage,
  };
};

const importPagesSuccess = (): ImportPagesSuccessAction => {
  return {
    type: PagesOperationsActionTypes.ImportSuccess,
  };
};

const importPagesError = (error: string): ImportPagesErrorAction => {
  return {
    type: PagesOperationsActionTypes.ImportError,
    error,
  };
};

const getDateForNewPageRequest = (operationMessage: string): GetDateForNewPageRequestAction => {
  return {
    type: PagesOperationsActionTypes.DateForNewPageRequest,
    operationMessage,
  };
};

const getDateForNewPageSuccess = (dateForNewPage: string): GetDateForNewPageSuccessAction => {
  return {
    type: PagesOperationsActionTypes.DateForNewPageSuccess,
    dateForNewPage,
  };
};

const getDateForNewPageError = (error?: string): GetDateForNewPageErrorAction => {
  return {
    type: PagesOperationsActionTypes.DateForNewPageError,
    error,
  };
};

enum PagesOperationsBaseErrorMessages {
  Create = 'Failed to create page',
  Edit = 'Failed to update page',
  Delete = 'Failed to delete selected',
  Export = 'Failed to export pages',
  Import = 'Failed to import pages',
  DateForNewPage = 'Failed to get date for new page',
}

export const createPage: CreatePageActionCreator = (page: PageCreateEdit) => {
  return async (dispatch: Dispatch<CreatePageActions>): Promise<CreatePageSuccessAction | CreatePageErrorAction> => {
    dispatch(createPageRequest(page, 'Creating page'));
    try {
      const response = await createPageAsync(page);

      if (response.ok) {
        const createdPageIdStr = await response.text();
        return dispatch(createPageSuccess(+createdPageIdStr));
      }

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          alert(`${PagesOperationsBaseErrorMessages.Create}: ${badRequestResponse}`);
          return dispatch(createPageError(`${PagesOperationsBaseErrorMessages.Create}: ${badRequestResponse}`));
        case 500:
          alert(`${PagesOperationsBaseErrorMessages.Create}: server error`);
          return dispatch(createPageError(`${PagesOperationsBaseErrorMessages.Create}: server error`));
        default:
          alert(`${PagesOperationsBaseErrorMessages.Create}: unknown response code`);
          return dispatch(createPageError(`${PagesOperationsBaseErrorMessages.Create}: unknown response code`));
      }
    } catch (error) {
      console.error(error);
      alert(PagesOperationsBaseErrorMessages.Create);
      return dispatch(createPageError(PagesOperationsBaseErrorMessages.Create));
    }
  };
};

export const editPage: EditPageActionCreator = (request: PageEditRequest) => {
  return async (dispatch: Dispatch<EditPageActions>): Promise<EditPageSuccessAction | EditPageErrorAction> => {
    dispatch(editPageRequest(request, 'Updating page'));
    try {
      const response = await editPageAsync(request);

      if (response.ok) {
        return dispatch(editPageSuccess());
      }

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          alert(`${PagesOperationsBaseErrorMessages.Edit}: ${badRequestResponse}`);
          return dispatch(editPageError(`${PagesOperationsBaseErrorMessages.Edit}: ${badRequestResponse}`));
        case 500:
          alert(`${PagesOperationsBaseErrorMessages.Edit}: server error`);
          return dispatch(editPageError(`${PagesOperationsBaseErrorMessages.Edit}: server error`));
        default:
          alert(`${PagesOperationsBaseErrorMessages.Edit}: unknown response code`);
          return dispatch(editPageError(`${PagesOperationsBaseErrorMessages.Edit}: unknown response code`));
      }
    } catch (error) {
      console.error(error);
      alert(PagesOperationsBaseErrorMessages.Edit);
      return dispatch(editPageError(PagesOperationsBaseErrorMessages.Edit));
    }
  };
};

export const deletePages: DeletePagesActionCreator = (pagesIds: number[]) => {
  return async (dispatch: Dispatch<DeletePagesActions>): Promise<DeletePagesSuccessAction | DeletePagesErrorAction> => {
    const messageSuffixForPage = pagesIds.length > 1 ? 'pages' : 'page';
    dispatch(deletePagesRequest(`Deleting ${messageSuffixForPage}`));
    try {
      const response = await deletePagesAsync(pagesIds);

      if (response.ok) {
        return dispatch(deletePagesSuccess());
      }

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          alert(`${PagesOperationsBaseErrorMessages.Delete} ${messageSuffixForPage}: ${badRequestResponse}`);
          return dispatch(
            deletePagesError(
              `${PagesOperationsBaseErrorMessages.Delete} ${messageSuffixForPage}: ${badRequestResponse}`,
            ),
          );
        case 500:
          alert(`${PagesOperationsBaseErrorMessages.Delete} ${messageSuffixForPage}: server error`);
          return dispatch(
            deletePagesError(`${PagesOperationsBaseErrorMessages.Delete} ${messageSuffixForPage}: server error`),
          );
        default:
          alert(`${PagesOperationsBaseErrorMessages.Delete} ${messageSuffixForPage}: unknown response code`);
          return dispatch(
            deletePagesError(
              `${PagesOperationsBaseErrorMessages.Delete} ${messageSuffixForPage}: unknown response code`,
            ),
          );
      }
    } catch (error) {
      console.error(error);
      alert(`${PagesOperationsBaseErrorMessages.Delete} ${messageSuffixForPage}`);
      return dispatch(deletePagesError(`${PagesOperationsBaseErrorMessages.Delete} ${messageSuffixForPage}`));
    }
  };
};

export const exportPages: ExportPagesActionCreator = (request: PagesExportRequest) => {
  return async (dispatch: Dispatch<ExportPagesActions>): Promise<ExportPagesSuccessAction | ExportPagesErrorAction> => {
    dispatch(exportPagesRequest('Exporting pages'));
    try {
      const response = await exportPagesAsync(request);

      if (response.ok) {
        const blob = await response.blob();
        return dispatch(exportPagesSuccess(blob));
      }

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          alert(`${PagesOperationsBaseErrorMessages.Export}: ${badRequestResponse}`);
          return dispatch(exportPagesError(`${PagesOperationsBaseErrorMessages.Export}: ${badRequestResponse}`));
        case 500:
          alert(`${PagesOperationsBaseErrorMessages.Export}: server error`);
          return dispatch(exportPagesError(`${PagesOperationsBaseErrorMessages.Export}: server error`));
        default:
          alert(`${PagesOperationsBaseErrorMessages.Export}: unknown response code`);
          return dispatch(exportPagesError(`${PagesOperationsBaseErrorMessages.Export}: unknown response code`));
      }
    } catch (error) {
      console.error(error);
      alert(PagesOperationsBaseErrorMessages.Export);
      return dispatch(exportPagesError(PagesOperationsBaseErrorMessages.Export));
    }
  };
};

export const importPages: ImportPagesActionCreator = (importFile: File) => {
  return async (dispatch: Dispatch<ImportPagesActions>): Promise<ImportPagesSuccessAction | ImportPagesErrorAction> => {
    dispatch(importPagesRequest('Importing pages'));
    try {
      const response = await importPagesAsync(importFile);

      if (response.ok) {
        return dispatch(importPagesSuccess());
      }

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          alert(`${PagesOperationsBaseErrorMessages.Import}: ${badRequestResponse}`);
          return dispatch(importPagesError(`${PagesOperationsBaseErrorMessages.Import}: ${badRequestResponse}`));
        case 500:
          alert(`${PagesOperationsBaseErrorMessages.Import}: server error`);
          return dispatch(importPagesError(`${PagesOperationsBaseErrorMessages.Import}: server error`));
        default:
          alert(`${PagesOperationsBaseErrorMessages.Import}: unknown response code`);
          return dispatch(importPagesError(`${PagesOperationsBaseErrorMessages.Import}: unknown response code`));
      }
    } catch (error) {
      console.error(error);
      alert(PagesOperationsBaseErrorMessages.Import);
      return dispatch(importPagesError(PagesOperationsBaseErrorMessages.Import));
    }
  };
};

export const getDateForNewPage: GetDateForNewPageActionCreator = () => {
  return async (
    dispatch: Dispatch<GetDateForNewPageActions>,
  ): Promise<GetDateForNewPageSuccessAction | GetDateForNewPageErrorAction> => {
    dispatch(getDateForNewPageRequest('Getting date'));
    try {
      const response = await getDateForNewPageAsync();

      if (response.ok) {
        const dateForNewPage = await response.text();
        return dispatch(getDateForNewPageSuccess(dateForNewPage));
      }

      switch (response.status) {
        case 500:
          return dispatch(getDateForNewPageError(`${PagesOperationsBaseErrorMessages.DateForNewPage}: server error`));
        default:
          return dispatch(
            getDateForNewPageError(`${PagesOperationsBaseErrorMessages.DateForNewPage}: unknown response code`),
          );
      }
    } catch (error) {
      return dispatch(getDateForNewPageError(PagesOperationsBaseErrorMessages.DateForNewPage));
    }
  };
};
