import { Action, ActionCreator } from 'redux';
import { PageCreateEdit, PageEditRequest, PagesExportRequest } from '../../models';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';

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
}

export interface CreatePageRequestAction extends Action<PagesOperationsActionTypes.CreateRequest> {
  type: PagesOperationsActionTypes.CreateRequest;
  page: PageCreateEdit;
  operationMessage: string;
}

export interface CreatePageSuccessAction extends Action<PagesOperationsActionTypes.CreateSuccess> {
  type: PagesOperationsActionTypes.CreateSuccess;
  createdPageId: number;
}

export interface CreatePageErrorAction extends Action<PagesOperationsActionTypes.CreateError> {
  type: PagesOperationsActionTypes.CreateError;
  error: string;
}

export interface EditPageRequestAction extends Action<PagesOperationsActionTypes.EditRequest> {
  type: PagesOperationsActionTypes.EditRequest;
  request: PageEditRequest;
  operationMessage: string;
}

export interface EditPageSuccessAction extends Action<PagesOperationsActionTypes.EditSuccess> {
  type: PagesOperationsActionTypes.EditSuccess;
}

export interface EditPageErrorAction extends Action<PagesOperationsActionTypes.EditError> {
  type: PagesOperationsActionTypes.EditError;
  error: string;
}

export interface DeletePagesRequestAction extends Action<PagesOperationsActionTypes.DeleteRequest> {
  type: PagesOperationsActionTypes.DeleteRequest;
  operationMessage: string;
}

export interface DeletePagesSuccessAction extends Action<PagesOperationsActionTypes.DeleteSuccess> {
  type: PagesOperationsActionTypes.DeleteSuccess;
}

export interface DeletePagesErrorAction extends Action<PagesOperationsActionTypes.DeleteError> {
  type: PagesOperationsActionTypes.DeleteError;
  error: string;
}

export interface ExportPagesRequestAction extends Action<PagesOperationsActionTypes.ExportRequest> {
  type: PagesOperationsActionTypes.ExportRequest;
  operationMessage: string;
}

export interface ExportPagesSuccessAction extends Action<PagesOperationsActionTypes.ExportSuccess> {
  type: PagesOperationsActionTypes.ExportSuccess;
  exportFile: Blob;
}

export interface ExportPagesErrorAction extends Action<PagesOperationsActionTypes.ExportError> {
  type: PagesOperationsActionTypes.ExportError;
  error: string;
}

export type CreatePageActions = CreatePageRequestAction | CreatePageSuccessAction | CreatePageErrorAction;

export type EditPageActions = EditPageRequestAction | EditPageSuccessAction | EditPageErrorAction;

export type DeletePagesActions = DeletePagesRequestAction | DeletePagesSuccessAction | DeletePagesErrorAction;

export type ExportPagesActions = ExportPagesRequestAction | ExportPagesSuccessAction | ExportPagesErrorAction;

export type PagesOperationsActions = CreatePageActions | EditPageActions | DeletePagesActions | ExportPagesActions;

export type CreatePageActionCreator = ActionCreator<
  ThunkAction<
    Promise<CreatePageSuccessAction | CreatePageErrorAction>,
    void,
    PageCreateEdit,
    CreatePageSuccessAction | CreatePageErrorAction
  >
>;

export type EditPageActionCreator = ActionCreator<
  ThunkAction<
    Promise<EditPageSuccessAction | EditPageErrorAction>,
    void,
    PageEditRequest,
    EditPageSuccessAction | EditPageErrorAction
  >
>;

export type DeletePagesActionCreator = ActionCreator<
  ThunkAction<
    Promise<DeletePagesSuccessAction | DeletePagesErrorAction>,
    void,
    number[],
    DeletePagesSuccessAction | DeletePagesErrorAction
  >
>;

export type ExportPagesActionCreator = ActionCreator<
  ThunkAction<
    Promise<ExportPagesSuccessAction | ExportPagesErrorAction>,
    void,
    PagesExportRequest,
    ExportPagesSuccessAction | ExportPagesErrorAction
  >
>;

export type CreatePageDispatch = ThunkDispatch<void, PageCreateEdit, CreatePageSuccessAction | CreatePageErrorAction>;

export type EditPageDispatch = ThunkDispatch<void, PageEditRequest, EditPageSuccessAction | EditPageErrorAction>;

export type DeletePagesDispatch = ThunkDispatch<void, number[], DeletePagesSuccessAction | DeletePagesErrorAction>;

export type ExportPagesDispatch = ThunkDispatch<
  void,
  PagesExportRequest,
  ExportPagesSuccessAction | ExportPagesErrorAction
>;

export type CreatePageDispatchProp = (page: PageCreateEdit) => Promise<CreatePageSuccessAction | CreatePageErrorAction>;

export type EditPageDispatchProp = (request: PageEditRequest) => Promise<EditPageSuccessAction | EditPageErrorAction>;

export type DeletePagesDispatchProp = (
  pagesIds: number[],
) => Promise<DeletePagesSuccessAction | DeletePagesErrorAction>;

export type ExportPagesDispatchProp = (
  request: PagesExportRequest,
) => Promise<ExportPagesSuccessAction | ExportPagesErrorAction>;

export type DeletePagesDispatchProp = (
  pagesIds: number[],
) => Promise<DeletePagesSuccessAction | DeletePagesErrorAction>;
