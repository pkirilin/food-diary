import { API_URL } from './config';
import { type GetAuthStatusResponse } from './features/auth';
import { actions } from './features/auth/store';
import { type AppStore } from './store';

const sleep = async (timeout: number): Promise<void> => {
  await new Promise(resolve => {
    setTimeout(() => {
      resolve({});
    }, timeout);
  });
};

export const initAuthUserState = async (store: AppStore): Promise<void> => {
  let retryCount = 0;
  let waitInterval = 5000;

  do {
    try {
      const response = await fetch(`${API_URL}/api/v1/auth/status`, { credentials: 'include' });
      const user = (await response.json()) as GetAuthStatusResponse;

      if (user.isAuthenticated) {
        store.dispatch(actions.signIn());
      } else {
        store.dispatch(actions.signOut());
      }

      return;
    } catch (err) {
      await sleep(waitInterval);
      retryCount++;
      waitInterval *= 2;
    }
  } while (retryCount < 4);
};
