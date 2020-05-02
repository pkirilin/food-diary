export interface DataFetchState<E = string> {
  loading: boolean;
  loaded: boolean;
  error?: E;
}

export interface DataOperationState<E = string> {
  performing: boolean;
  message?: string;
  error?: E;
}
