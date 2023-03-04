import { createContext } from 'react';

export type SignInContext = {
  returnUrl?: string;
};

export type AuthContextValue = {
  isAuthenticated: boolean;
  signIn: (context: SignInContext) => void;
  signOut: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const AuthContext = createContext<AuthContextValue>(null!);

export default AuthContext;
