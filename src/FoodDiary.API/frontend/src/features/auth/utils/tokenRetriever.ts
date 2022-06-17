import Cookies from 'js-cookie';
import { AuthResult } from '../models';

const TOKEN_KEY = 'food-diary-token';

export function saveToken({ accessToken, tokenExpirationDays }: AuthResult) {
  Cookies.set(TOKEN_KEY, accessToken, {
    expires: tokenExpirationDays,
  });
}

export function getToken() {
  return Cookies.get(TOKEN_KEY);
}
