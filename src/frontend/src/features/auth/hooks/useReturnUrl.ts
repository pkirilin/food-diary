import { useLocation } from 'react-router-dom';
import { type NavigationState } from '../types';

export const useReturnUrl = (): string | undefined => {
  const location = useLocation();
  const state = location.state as NavigationState;
  const returnUrl = state?.from?.pathname;
  return returnUrl;
};
