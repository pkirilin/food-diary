import Cookies from 'js-cookie';

const TOKEN_KEY = 'food-diary-token';

type SaveTokenOptions = {
  token: string;
  expiresAtUnixMilliseconds: number;
};

export function saveToken({ token, expiresAtUnixMilliseconds }: SaveTokenOptions) {
  Cookies.set(TOKEN_KEY, token, {
    expires: new Date(expiresAtUnixMilliseconds),
  });
}

export function getToken() {
  return Cookies.get(TOKEN_KEY);
}
