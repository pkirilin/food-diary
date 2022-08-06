import { createContext } from 'react';

export type SignInOptions = {
  token: string;
  expiresAtUnixMilliseconds: number;
};

export type AuthContextValue = {
  isAuthenticated: boolean;
  signIn: (options: SignInOptions) => void;
  signOut: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const AuthContext = createContext<AuthContextValue>(null!);

export default AuthContext;
