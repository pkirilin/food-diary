import Cookies from 'js-cookie';

const TOKEN_KEY = 'food-diary-token';

type SaveTokenOptions = {
  token: string;
  expiresAtUnixMilliseconds: number;
};

export const saveToken: (options: SaveTokenOptions) => void = ({
  token,
  expiresAtUnixMilliseconds,
}) => {
  Cookies.set(TOKEN_KEY, token, {
    expires: new Date(expiresAtUnixMilliseconds),
  });
};

export const getToken: () => string | undefined = () => {
  return Cookies.get(TOKEN_KEY);
};

export const removeToken: () => void = () => {
  Cookies.remove(TOKEN_KEY);
};
