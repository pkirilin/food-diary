export interface DataFetchState<T = string> {
  loading: boolean;
  loaded: boolean;
  error?: T;
}
