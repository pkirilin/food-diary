import { type SerializedError } from '@reduxjs/toolkit';
import { type FetchBaseQueryError } from '@reduxjs/toolkit/query';

interface ProblemDetails {
  title?: string;
  detail?: string;
}

interface ProblemDetailsError {
  data: ProblemDetails;
}

const isSerializedError = (error: unknown): error is SerializedError =>
  typeof error === 'object' && error != null && 'message' in error;

const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError =>
  typeof error === 'object' && error != null && 'status' in error;

const isProblemDetails = (value: unknown): value is ProblemDetails =>
  typeof value === 'object' && value !== null;

const isProblemDetailsError = (error: unknown): error is ProblemDetailsError =>
  isFetchBaseQueryError(error) && isProblemDetails(error.data);

const UNKNOWN_ERROR_TITLE = 'An error occurred';
const UNKNOWN_ERROR_MESSAGE = 'Something went wrong. Please try again later.';

export interface ClientError {
  title: string;
  message: string;
}

interface ValidationProblemDetailsError {
  data: { errors: Record<string, unknown> };
}

const isValidationProblemDetailsError = (error: unknown): error is ValidationProblemDetailsError =>
  isProblemDetailsError(error) &&
  'errors' in error.data &&
  typeof error.data.errors === 'object' &&
  error.data.errors !== null;

// ASP.NET Core model state keys keep the C# casing (`Name`), unlike the camelCase JSON properties
export const parseFieldValidationError = (error: unknown, field: string): string | null => {
  if (!isValidationProblemDetailsError(error)) {
    return null;
  }

  const fieldErrors = Object.entries(error.data.errors).find(
    ([key]) => key.toLowerCase() === field.toLowerCase(),
  )?.[1];

  if (!Array.isArray(fieldErrors)) {
    return null;
  }

  const [firstError] = fieldErrors as unknown[];
  return typeof firstError === 'string' ? firstError : null;
};

export const parseClientError = (error: unknown): ClientError => {
  if (isSerializedError(error)) {
    return {
      title: UNKNOWN_ERROR_TITLE,
      message: error.message ?? UNKNOWN_ERROR_MESSAGE,
    };
  }

  if (isProblemDetailsError(error)) {
    return {
      title: error.data.title ?? UNKNOWN_ERROR_TITLE,
      message: error.data.detail ?? UNKNOWN_ERROR_MESSAGE,
    };
  }

  return {
    title: UNKNOWN_ERROR_TITLE,
    message: UNKNOWN_ERROR_MESSAGE,
  };
};
