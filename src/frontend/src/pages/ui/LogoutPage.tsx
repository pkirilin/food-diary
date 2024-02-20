import { redirect, type ActionFunction, redirectDocument } from 'react-router-dom';
import { API_URL, FAKE_AUTH_ENABLED } from '@/config';

export const action: ActionFunction = async () => {
  if (FAKE_AUTH_ENABLED) {
    const { usersService } = await import('@tests/mockApi/user');
    usersService.signOutById(1);
    return redirect('/login');
  }

  return redirectDocument(`${API_URL}/api/v1/auth/logout`);
};
