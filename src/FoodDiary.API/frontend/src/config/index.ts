import config from '../features/__shared__/config';

export const { apiUrl: API_URL, googleClientId: GOOGLE_CLIENT_ID } = config;

export const AUTH_CHECK_INTERVAL = process.env.REACT_APP_TOKEN_CHECK_INTERVAL
  ? Number(process.env.REACT_APP_TOKEN_CHECK_INTERVAL)
  : 5000;
