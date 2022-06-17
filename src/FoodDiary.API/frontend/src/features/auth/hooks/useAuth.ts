import { useContext } from 'react';
import AuthContext, { AuthContextValue } from '../AuthContext';

export default function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
