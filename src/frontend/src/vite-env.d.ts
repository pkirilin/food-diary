/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly VITE_APP_MSW_ENABLED: string;
  readonly VITE_APP_FAKE_AUTH_ENABLED: string;
  readonly VITE_APP_FAKE_AUTH_LOGIN_ON_INIT: string;
  readonly VITE_APP_AUTH_CHECK_INTERVAL: string;
  readonly VITE_APP_DEMO_MODE_ENABLED: string;
  readonly VITE_APP_API_URL: string;
  readonly VITE_APP_GOOGLE_ANALYTICS_ENABLED: string;
  readonly VITE_APP_GOOGLE_ANALYTICS_MEASUREMENT_ID: string;
  readonly VITE_APP_MOCK_API_RESPONSE_DELAY: string;
}
