import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

let sharedSocket: Socket | null = null;

/**
 * Returns a single shared Socket.io connection for the current session.
 * Kept outside component state so navigating between pages (Discover ->
 * Matches -> Chat) doesn't reconnect on every route change.
 */
export function useSocket() {
  const { token } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    if (!sharedSocket) {
      sharedSocket = io(import.meta.env.VITE_SOCKET_URL, {
        auth: { token },
        autoConnect: true,
      });
    }
    socketRef.current = sharedSocket;

    return () => {
      // Intentionally not disconnecting here - other mounted pages may still
      // need the same socket. Full teardown happens on logout instead.
    };
  }, [token]);

  return socketRef.current;
}

export function disconnectSocket() {
  sharedSocket?.disconnect();
  sharedSocket = null;
}
