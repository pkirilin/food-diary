/// <reference types="vite/client" />

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface ImportMetaEnv {
  readonly VITE_APP_MSW_ENABLED: string;
  readonly VITE_APP_AUTH_CHECK_INTERVAL: string;
}
