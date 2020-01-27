export interface DataOperationState<TError = string> {
  performing: boolean;
  message?: string;
  error?: TError;
}
