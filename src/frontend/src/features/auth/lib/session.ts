import { API_URL, FAKE_AUTH_ENABLED } from '@/shared/config';
import { authApi } from '../api';

export type NavigateToHref = (href: string) => void;

type AuthStatusUpdate = ReturnType<typeof authApi.util.upsertQueryData<'getStatus'>>;

export type DispatchAuthStatusUpdate = (update: AuthStatusUpdate) => PromiseLike<unknown>;

export const signIn = async (
  returnUrl: string,
  navigate: NavigateToHref,
  dispatch: DispatchAuthStatusUpdate,
): Promise<void> => {
  if (FAKE_AUTH_ENABLED) {
    const { usersService } = await import('@tests/mockApi/user');
    usersService.signInById(1);
    await dispatch(authApi.util.upsertQueryData('getStatus', {}, { isAuthenticated: true }));
    navigate(returnUrl);
    return;
  }

  window.location.assign(`${API_URL}/api/v1/auth/login?${new URLSearchParams({ returnUrl })}`);
};

export const signOut = async (
  navigate: NavigateToHref,
  dispatch: DispatchAuthStatusUpdate,
): Promise<void> => {
  if (FAKE_AUTH_ENABLED) {
    const { usersService } = await import('@tests/mockApi/user');
    usersService.signOutById(1);
    await dispatch(authApi.util.upsertQueryData('getStatus', {}, { isAuthenticated: false }));
    navigate('/login');
    return;
  }

  window.location.assign(`${API_URL}/api/v1/auth/logout`);
};
