export const USE_FAKE_AUTH_DEV =
  import.meta.env.DEV && import.meta.env.VITE_APP_MSW_ENABLED === 'true';

export const USE_FAKE_AUTH = import.meta.env.MODE === 'test' || USE_FAKE_AUTH_DEV;
