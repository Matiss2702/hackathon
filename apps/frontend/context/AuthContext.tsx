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

  // Nouvelle fonction utilitaire pour lire le token depuis le cookie
  function getTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  // Initialisation du token directement depuis le cookie
  const [token, setToken] = useState<string | null>(() => getTokenFromCookie());
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!getTokenFromCookie());
  const [isAuthLoading, setIsAuthLoading] = useState(false); // plus besoin de loading asynchrone

  // Synchronisation du token si le cookie change (ex: login/logout dans un autre onglet)
  useEffect(() => {
    const interval = setInterval(() => {
      const cookieToken = getTokenFromCookie();
      setToken((prev) => {
        if (prev !== cookieToken) {
          setIsAuthenticated(!!cookieToken);
          return cookieToken;
        }
        return prev;
      });
    }, 1000); // vérifie toutes les secondes
    return () => clearInterval(interval);
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
