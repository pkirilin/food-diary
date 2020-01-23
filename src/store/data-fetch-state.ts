export interface DataFetchState<TData, TError> {
  loading: boolean;
  loaded: boolean;
  data: TData;
  error?: TError;
}
