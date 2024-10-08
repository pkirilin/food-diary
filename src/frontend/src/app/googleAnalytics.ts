import ReactGA from 'react-ga4';
import { GOOGLE_ANALYTICS_MEASUREMENT_ID } from '@/shared/config';

export const initGoogleAnalytics = (): void => {
  ReactGA.initialize(GOOGLE_ANALYTICS_MEASUREMENT_ID);
};
