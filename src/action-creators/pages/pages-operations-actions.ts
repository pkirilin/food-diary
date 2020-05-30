import { Dispatch } from 'redux';
import { PageCreateEdit, PageEditRequest, PagesExportRequest, ErrorReason } from '../../models';
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
  OpenModalAction,
} from '../../action-types';
import {
  createPageAsync,
  deletePagesAsync,
  editPageAsync,
  exportPagesAsync,
  importPagesAsync,
  getDateForNewPageAsync,
} from '../../services';
import { readBadRequestResponseAsync } from '../../utils';
import { openMessageModal } from '../modal-actions';

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

enum PagesOperationsErrorMessages {
  Create = 'Failed to create page',
  Edit = 'Failed to update page',
  Delete = 'Failed to delete selected',
  Export = 'Failed to export pages',
  Import = 'Failed to import pages',
  DateForNewPage = 'Failed to get date for new page',
}

export const createPage: CreatePageActionCreator = (page: PageCreateEdit) => {
  return async (
    dispatch: Dispatch<CreatePageActions | OpenModalAction>,
  ): Promise<CreatePageSuccessAction | CreatePageErrorAction> => {
    dispatch(createPageRequest(page, 'Creating page'));
    try {
      const response = await createPageAsync(page);

      if (response.ok) {
        const createdPageIdStr = await response.text();
        return dispatch(createPageSuccess(+createdPageIdStr));
      }

      let errorMessage = `${PagesOperationsErrorMessages.Create}`;

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          errorMessage += `: ${badRequestResponse}`;
          break;
        case 500:
          errorMessage += `: ${ErrorReason.ServerError}`;
          break;
        default:
          errorMessage += `: ${ErrorReason.UnknownResponseCode}`;
          break;
      }

      dispatch(openMessageModal('Error', errorMessage));
      return dispatch(createPageError(errorMessage));
    } catch (error) {
      dispatch(openMessageModal('Error', PagesOperationsErrorMessages.Create));
      return dispatch(createPageError(PagesOperationsErrorMessages.Create));
    }
  };
};

export const editPage: EditPageActionCreator = (request: PageEditRequest) => {
  return async (
    dispatch: Dispatch<EditPageActions | OpenModalAction>,
  ): Promise<EditPageSuccessAction | EditPageErrorAction> => {
    dispatch(editPageRequest(request, 'Updating page'));
    try {
      const response = await editPageAsync(request);

      if (response.ok) {
        return dispatch(editPageSuccess());
      }

      let errorMessage = `${PagesOperationsErrorMessages.Edit}`;

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          errorMessage += `: ${badRequestResponse}`;
          break;
        case 500:
          errorMessage += `: ${ErrorReason.ServerError}`;
          break;
        default:
          errorMessage += `: ${ErrorReason.UnknownResponseCode}`;
          break;
      }

      dispatch(openMessageModal('Error', errorMessage));
      return dispatch(editPageError(errorMessage));
    } catch (error) {
      dispatch(openMessageModal('Error', PagesOperationsErrorMessages.Edit));
      return dispatch(editPageError(PagesOperationsErrorMessages.Edit));
    }
  };
};

export const deletePages: DeletePagesActionCreator = (pagesIds: number[]) => {
  return async (
    dispatch: Dispatch<DeletePagesActions | OpenModalAction>,
  ): Promise<DeletePagesSuccessAction | DeletePagesErrorAction> => {
    const messageSuffixForPage = pagesIds.length > 1 ? 'pages' : 'page';
    dispatch(deletePagesRequest(`Deleting ${messageSuffixForPage}`));
    try {
      const response = await deletePagesAsync(pagesIds);

      if (response.ok) {
        return dispatch(deletePagesSuccess());
      }

      let errorMessage = `${PagesOperationsErrorMessages.Delete} ${messageSuffixForPage}`;

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          errorMessage += `: ${badRequestResponse}`;
          break;
        case 500:
          errorMessage += `: ${ErrorReason.ServerError}`;
          break;
        default:
          errorMessage += `: ${ErrorReason.UnknownResponseCode}`;
          break;
      }

      dispatch(openMessageModal('Error', errorMessage));
      return dispatch(deletePagesError(errorMessage));
    } catch (error) {
      dispatch(openMessageModal('Error', `${PagesOperationsErrorMessages.Delete} ${messageSuffixForPage}`));
      return dispatch(deletePagesError(`${PagesOperationsErrorMessages.Delete} ${messageSuffixForPage}`));
    }
  };
};

export const exportPages: ExportPagesActionCreator = (request: PagesExportRequest) => {
  return async (
    dispatch: Dispatch<ExportPagesActions | OpenModalAction>,
  ): Promise<ExportPagesSuccessAction | ExportPagesErrorAction> => {
    dispatch(exportPagesRequest('Exporting pages'));
    try {
      const response = await exportPagesAsync(request);

      if (response.ok) {
        const blob = await response.blob();
        return dispatch(exportPagesSuccess(blob));
      }

      let errorMessage = `${PagesOperationsErrorMessages.Export}`;

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          errorMessage += `: ${badRequestResponse}`;
          break;
        case 500:
          errorMessage += `: ${ErrorReason.ServerError}`;
          break;
        default:
          errorMessage += `: ${ErrorReason.UnknownResponseCode}`;
          break;
      }

      dispatch(openMessageModal('Error', errorMessage));
      return dispatch(exportPagesError(errorMessage));
    } catch (error) {
      dispatch(openMessageModal('Error', PagesOperationsErrorMessages.Export));
      return dispatch(exportPagesError(PagesOperationsErrorMessages.Export));
    }
  };
};

export const importPages: ImportPagesActionCreator = (importFile: File) => {
  return async (
    dispatch: Dispatch<ImportPagesActions | OpenModalAction>,
  ): Promise<ImportPagesSuccessAction | ImportPagesErrorAction> => {
    dispatch(importPagesRequest('Importing pages'));
    try {
      const response = await importPagesAsync(importFile);

      if (response.ok) {
        return dispatch(importPagesSuccess());
      }

      let errorMessage = `${PagesOperationsErrorMessages.Import}`;

      switch (response.status) {
        case 400:
          const badRequestResponse = await readBadRequestResponseAsync(response);
          errorMessage += `: ${badRequestResponse}`;
          break;
        case 500:
          errorMessage += `: ${ErrorReason.ServerError}`;
          break;
        default:
          errorMessage += `: ${ErrorReason.UnknownResponseCode}`;
          break;
      }

      dispatch(openMessageModal('Error', errorMessage));
      return dispatch(importPagesError(errorMessage));
    } catch (error) {
      dispatch(openMessageModal('Error', PagesOperationsErrorMessages.Import));
      return dispatch(importPagesError(PagesOperationsErrorMessages.Import));
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

      let errorMessage = `${PagesOperationsErrorMessages.DateForNewPage}`;

      switch (response.status) {
        case 500:
          errorMessage += `: ${ErrorReason.ServerError}`;
          break;
        default:
          errorMessage += `: ${ErrorReason.UnknownResponseCode}`;
          break;
      }

      return dispatch(getDateForNewPageError(errorMessage));
    } catch (error) {
      return dispatch(getDateForNewPageError(PagesOperationsErrorMessages.DateForNewPage));
    }
  };
};
