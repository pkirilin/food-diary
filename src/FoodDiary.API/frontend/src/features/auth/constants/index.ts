export const USE_FAKE_AUTH_DEV =
  process.env.NODE_ENV === 'development' && process.env.REACT_APP_MSW_ENABLED === 'true';

export const USE_FAKE_AUTH = process.env.NODE_ENV === 'test' || USE_FAKE_AUTH_DEV;
