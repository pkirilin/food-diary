import { type GetAuthStatusResponse, authApi } from '../api';

interface UseAuthResult {
  status: GetAuthStatusResponse;
}

export const useAuth = (): UseAuthResult => {
  const status = authApi.useGetStatusQuery(
    {},
    {
      selectFromResult: ({ data }) => data ?? { isAuthenticated: false },
    },
  );

  return { status };
};
