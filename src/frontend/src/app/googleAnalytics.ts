import ReactGAImport from 'react-ga4';
import { GOOGLE_ANALYTICS_MEASUREMENT_ID } from '@/shared/config';

// react-ga4 is a CommonJS module; Vite's (Rolldown) node-style interop can wrap
// its default export one level too deep, leaving the real instance on `.default`.
const ReactGA = (ReactGAImport as { default?: typeof ReactGAImport }).default ?? ReactGAImport;

export const initGoogleAnalytics = (): void => {
  ReactGA.initialize(GOOGLE_ANALYTICS_MEASUREMENT_ID);
};
