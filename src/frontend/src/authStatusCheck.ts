import { API_URL } from './config';
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
  let response: Response;

  do {
    response = await fetch(`${API_URL}/api/v1/auth/status`);

    if (response.ok) {
      store.dispatch(actions.signIn());
      return;
    }

    await sleep(waitInterval);

    retryCount++;
    waitInterval *= 2;
  } while (retryCount < 4);

  store.dispatch(actions.signOut());
};
