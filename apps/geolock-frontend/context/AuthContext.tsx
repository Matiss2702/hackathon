// context/AuthContext.tsx
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
  login: (token: string) => void;
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
    try {
      const stored = localStorage.getItem('auth_token');
      if (stored) {
        setToken(stored);
        setIsAuthenticated(true);
      } else {
        console.log('❌ Aucun token trouvé dans localStorage');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    console.log('🔐 login appelé avec token:', newToken.substring(0, 20) + '...');
    try {
      localStorage.setItem('auth_token', newToken);
      document.cookie = `auth_token=${newToken}; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`;
      setToken(newToken);
      setIsAuthenticated(true);
      console.log('✅ Login réussi, isAuthenticated =', true);
      router.replace('/');
    } catch (error) {
      console.error('Erreur lors du login:', error);
    }
  };

  const logout = () => {
    console.log('🔓 logout() appelé');
    try {
      localStorage.removeItem('auth_token');
      document.cookie = 'auth_token=; Path=/; SameSite=Lax; Max-Age=0';
      setToken(null);
      setIsAuthenticated(false);
      console.log('✅ Logout réussi, isAuthenticated =', false);
      router.replace('/login');
    } catch (error) {
      console.error('Erreur lors du logout:', error);
      router.replace('/login');
    }
  };

  return (
    <AuthContext.Provider value={{
      token,
      isAuthenticated,
      login,
      logout,
      isAuthLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};