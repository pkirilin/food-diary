import { useMemo } from 'react';
import { type ProductFormServerErrors } from '@/entities/product';
import { type ClientError, parseClientError, parseFieldValidationError } from '@/shared/api';

interface ProductFormErrors {
  serverErrors: ProductFormServerErrors;
  formError: ClientError | null;
}

export const useProductFormErrors = (isError: boolean, error: unknown): ProductFormErrors => {
  const serverErrors = useMemo<ProductFormServerErrors>(
    () => ({ name: parseFieldValidationError(error, 'name') }),
    [error],
  );

  const formError = isError && serverErrors.name === null ? parseClientError(error) : null;

  return { serverErrors, formError };
};
