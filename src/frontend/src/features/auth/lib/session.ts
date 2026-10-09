import { API_URL, FAKE_AUTH_ENABLED } from '@/shared/config';

export type NavigateToHref = (href: string) => void;

export const signIn = async (returnUrl: string, navigate: NavigateToHref): Promise<void> => {
  if (FAKE_AUTH_ENABLED) {
    const { usersService } = await import('@tests/mockApi/user');
    usersService.signInById(1);
    navigate(returnUrl);
    return;
  }

  window.location.assign(`${API_URL}/api/v1/auth/login?${new URLSearchParams({ returnUrl })}`);
};

export const signOut = async (navigate: NavigateToHref): Promise<void> => {
  if (FAKE_AUTH_ENABLED) {
    const { usersService } = await import('@tests/mockApi/user');
    usersService.signOutById(1);
    navigate('/login');
    return;
  }

  window.location.assign(`${API_URL}/api/v1/auth/logout`);
};
