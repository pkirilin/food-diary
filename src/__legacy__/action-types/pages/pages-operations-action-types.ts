import { PageCreateEdit, PageEditRequest, PagesExportRequest } from '../../models';
import { ThunkDispatch } from 'redux-thunk';
import { ThunkHelperAllActions, ThunkHelperResultActions } from '../../helpers';

export enum PagesOperationsActionTypes {
  CreateRequest = 'PAGES_OPERATIONS__CREATE_REQUEST',
  CreateSuccess = 'PAGES_OPERATIONS__CREATE_SUCCESS',
  CreateError = 'PAGES_OPERATIONS__CREATE_ERROR',

  EditRequest = 'PAGES_OPERATIONS__EDIT_REQUEST',
  EditSuccess = 'PAGES_OPERATIONS__EDIT_SUCCESS',
  EditError = 'PAGES_OPERATIONS__EDIT_ERROR',

  DeleteRequest = 'PAGES_OPERATIONS__DELETE_REQUEST',
  DeleteSuccess = 'PAGES_OPERATIONS__DELETE_SUCCESS',
  DeleteError = 'PAGES_OPERATIONS__DELETE_ERROR',

  ExportRequest = 'PAGES_OPERATIONS__EXPORT_REQUEST',
  ExportSuccess = 'PAGES_OPERATIONS__EXPORT_SUCCESS',
  ExportError = 'PAGES_OPERATIONS__EXPORT_ERROR',

  ImportRequest = 'PAGES_OPERATIONS__IMPORT_REQUEST',
  ImportSuccess = 'PAGES_OPERATIONS__IMPORT_SUCCESS',
  ImportError = 'PAGES_OPERATIONS__IMPORT_ERROR',

  DateForNewPageRequest = 'PAGES_OPERATIONS__DATE_FOR_NEW_PAGE_REQUEST',
  DateForNewPageSuccess = 'PAGES_OPERATIONS__DATE_FOR_NEW_PAGE_SUCCESS',
  DateForNewPageError = 'PAGES_OPERATIONS__DATE_FOR_NEW_PAGE_ERROR',
}

export type CreatePageActions = ThunkHelperAllActions<
  PagesOperationsActionTypes.CreateRequest,
  PagesOperationsActionTypes.CreateSuccess,
  PagesOperationsActionTypes.CreateError,
  number,
  PageCreateEdit
>;

export type EditPageActions = ThunkHelperAllActions<
  PagesOperationsActionTypes.EditRequest,
  PagesOperationsActionTypes.EditSuccess,
  PagesOperationsActionTypes.EditError,
  {},
  PageEditRequest
>;

export type DeletePagesActions = ThunkHelperAllActions<
  PagesOperationsActionTypes.DeleteRequest,
  PagesOperationsActionTypes.DeleteSuccess,
  PagesOperationsActionTypes.DeleteError,
  {},
  number[]
>;

export type ExportPagesActions = ThunkHelperAllActions<
  PagesOperationsActionTypes.ExportRequest,
  PagesOperationsActionTypes.ExportSuccess,
  PagesOperationsActionTypes.ExportError,
  Blob,
  PagesExportRequest
>;

export type ImportPagesActions = ThunkHelperAllActions<
  PagesOperationsActionTypes.ImportRequest,
  PagesOperationsActionTypes.ImportSuccess,
  PagesOperationsActionTypes.ImportError,
  {},
  File
>;

export type GetDateForNewPageActions = ThunkHelperAllActions<
  PagesOperationsActionTypes.DateForNewPageRequest,
  PagesOperationsActionTypes.DateForNewPageSuccess,
  PagesOperationsActionTypes.DateForNewPageError,
  string
>;

export type CreatePageResultActions = ThunkHelperResultActions<
  PagesOperationsActionTypes.CreateSuccess,
  PagesOperationsActionTypes.CreateError,
  number,
  PageCreateEdit
>;

export type EditPageResultActions = ThunkHelperResultActions<
  PagesOperationsActionTypes.EditSuccess,
  PagesOperationsActionTypes.EditError,
  {},
  PageEditRequest
>;

export type DeletePagesResultActions = ThunkHelperResultActions<
  PagesOperationsActionTypes.DeleteSuccess,
  PagesOperationsActionTypes.DeleteError,
  {},
  number[]
>;

export type ExportPagesResultActions = ThunkHelperResultActions<
  PagesOperationsActionTypes.ExportSuccess,
  PagesOperationsActionTypes.ExportError,
  Blob,
  PagesExportRequest
>;

export type ImportPagesResultActions = ThunkHelperResultActions<
  PagesOperationsActionTypes.ImportSuccess,
  PagesOperationsActionTypes.ImportError,
  {},
  File
>;

export type GetDateForNewPageResultActions = ThunkHelperResultActions<
  PagesOperationsActionTypes.DateForNewPageSuccess,
  PagesOperationsActionTypes.DateForNewPageError,
  string
>;

export type PagesOperationsActions =
  | CreatePageActions
  | EditPageActions
  | DeletePagesActions
  | ExportPagesActions
  | ImportPagesActions
  | GetDateForNewPageActions;

export type CreatePageDispatch = ThunkDispatch<number, PageCreateEdit, CreatePageActions>;

export type EditPageDispatch = ThunkDispatch<{}, PageEditRequest, EditPageActions>;

export type DeletePagesDispatch = ThunkDispatch<{}, number[], DeletePagesActions>;

export type ExportPagesDispatch = ThunkDispatch<Blob, PagesExportRequest, ExportPagesActions>;

export type ImportPagesDispatch = ThunkDispatch<{}, File, ImportPagesActions>;

export type GetDateForNewPageDispatch = ThunkDispatch<string, {}, GetDateForNewPageActions>;

export type PagesOperationsActionsDispatch = CreatePageDispatch &
  EditPageDispatch &
  DeletePagesDispatch &
  ExportPagesDispatch &
  ImportPagesDispatch &
  GetDateForNewPageDispatch;

export type CreatePageDispatchProp = (page: PageCreateEdit) => Promise<CreatePageActions>;

export type EditPageDispatchProp = (request: PageEditRequest) => Promise<EditPageActions>;

export type DeletePagesDispatchProp = (pagesIds: number[]) => Promise<DeletePagesActions>;

export type ExportPagesDispatchProp = (request: PagesExportRequest) => Promise<ExportPagesActions>;

export type ImportPagesDispatchProp = (importFile: File) => Promise<ImportPagesActions>;

export type GetDateForNewPageDispatchProp = () => Promise<GetDateForNewPageActions>;
