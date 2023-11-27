import { MSW_ENABLED } from 'src/config';

export const USE_FAKE_AUTH_DEV = import.meta.env.MODE === 'development' && MSW_ENABLED;

export const USE_FAKE_AUTH = import.meta.env.MODE === 'test';
