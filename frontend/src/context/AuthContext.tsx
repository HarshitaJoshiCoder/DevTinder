import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { DevUser } from '../types';

interface AuthContextValue {
  user: DevUser | null;
  token: string | null;
  isReady: boolean;
  login: (token: string, user: DevUser) => void;
  logout: () => void;
  updateUser: (user: DevUser) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<DevUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('devtinder_token');
    const storedUser = localStorage.getItem('devtinder_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsReady(true);
  }, []);

  function login(newToken: string, newUser: DevUser) {
    localStorage.setItem('devtinder_token', newToken);
    localStorage.setItem('devtinder_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem('devtinder_token');
    localStorage.removeItem('devtinder_user');
    setToken(null);
    setUser(null);
  }

  function updateUser(updated: DevUser) {
    localStorage.setItem('devtinder_user', JSON.stringify(updated));
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, token, isReady, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
