import { useLocation } from 'react-router-dom';
import { type NavigationState } from '../types';

export default function useReturnUrl(): string | undefined {
  const location = useLocation();
  const state = location.state as NavigationState;
  const returnUrl = state?.from?.pathname;
  return returnUrl;
}
