'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (accessToken: string) => void;
  logout: () => void;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Au premier chargement, on restaure depuis localStorage
  useEffect(() => {
    const stored = localStorage.getItem('auth_token');
    if (stored) {
      setToken(stored);
      setIsAuthenticated(true);
    }
    setIsAuthLoading(false);
  }, []);

  const login = (accessToken: string) => {
    // stocke l'access token
    localStorage.setItem('auth_token', accessToken);
    document.cookie = `auth_token=${accessToken}; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
    setToken(accessToken);
    setIsAuthenticated(true);
    router.replace('/');
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    document.cookie = 'auth_token=; Path=/; SameSite=Lax; Max-Age=0';
    setToken(null);
    setIsAuthenticated(false);
    router.replace('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        login,
        logout,
        isAuthLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
