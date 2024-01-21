export const API_URL = import.meta.env.VITE_APP_API_URL ?? '';

export const AUTH_CHECK_INTERVAL = import.meta.env.VITE_APP_AUTH_CHECK_INTERVAL
  ? Number(import.meta.env.VITE_APP_AUTH_CHECK_INTERVAL)
  : 3_600_000;

export const MSW_ENABLED = import.meta.env.VITE_APP_MSW_ENABLED === 'true';

export const DEMO_MODE_ENABLED =
  import.meta.env.MODE !== 'test' && import.meta.env.VITE_APP_DEMO_MODE_ENABLED === 'true';

export const FAKE_AUTH_ENABLED = import.meta.env.VITE_APP_FAKE_AUTH_ENABLED === 'true';
export const FAKE_AUTH_LOGIN_ON_INIT = import.meta.env.VITE_APP_FAKE_AUTH_LOGIN_ON_INIT === 'true';

export const GOOGLE_ANALYTICS_ENABLED =
  import.meta.env.VITE_APP_GOOGLE_ANALYTICS_ENABLED === 'true';

export const GOOGLE_ANALYTICS_MEASUREMENT_ID = import.meta.env
  .VITE_APP_GOOGLE_ANALYTICS_MEASUREMENT_ID;
