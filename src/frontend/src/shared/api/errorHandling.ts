import { type FetchBaseQueryError } from '@reduxjs/toolkit/query';

export interface ProblemDetails {
  title: string;
  detail: string;
}

export interface ProblemDetailsError {
  data: ProblemDetails;
}

const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError =>
  typeof error === 'object' && error != null && 'status' in error;

const isProblemDetails = (value: unknown): value is ProblemDetails =>
  typeof value === 'object' && value !== null && 'title' in value && 'detail' in value;

export const isProblemDetailsError = (error: unknown): error is ProblemDetailsError =>
  isFetchBaseQueryError(error) && isProblemDetails(error.data);
