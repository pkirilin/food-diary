export interface DataFetchState<E = string> {
  loading: boolean;
  loaded: boolean;
  loadingMessage?: string;
  error?: E;
}

export interface DataOperationState<E = string> {
  performing: boolean;
  message?: string;
  error?: E;
}

export type OperationCompletionStatus = 'initial' | 'idle' | 'created' | 'updated' | 'deleted';
