import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, isReady } = useAuth();

  if (!isReady) return null; // avoid a login flash while localStorage is read
  if (!token) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
