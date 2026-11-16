import { AUTH_CHECK_INTERVAL, MSW_ENABLED } from '@/shared/config';

export const USE_FAKE_AUTH_DEV = import.meta.env.MODE === 'development' && MSW_ENABLED;

export const USE_FAKE_AUTH = import.meta.env.MODE === 'test';

export const AUTH_STATUS_MAX_AGE_SECONDS = AUTH_CHECK_INTERVAL / 1000;
