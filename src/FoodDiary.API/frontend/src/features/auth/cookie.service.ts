import Cookies from 'js-cookie';
import { AuthResult } from './models';

const TOKEN_KEY = 'food-diary-token';

export function saveAccessToken({ accessToken }: AuthResult) {
  Cookies.set(TOKEN_KEY, accessToken, {
    // expires: 0,
  });
}

export function getAccessToken() {
  return Cookies.get(TOKEN_KEY);
}
