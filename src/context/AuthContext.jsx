import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { api, setAccessToken, onTokenRefresh } from '../lib/api.js';

/**
 * @typedef {{ id: string, username: string, email: string }} AuthUser
 * @typedef {{ user: AuthUser|null, accessToken: string|null, isAuthenticated: boolean, isLoading: boolean }} AuthState
 */

const AuthContext = createContext(null);

/**
 * AuthProvider — manages authentication state globally.
 *
 * On mount: attempts a silent refresh to restore session from HttpOnly cookie.
 * Exposes: login, register, logout, and the current user/token state.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(/** @type {AuthUser|null} */ (null));
  const [accessToken, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true during initial silent refresh
  const refreshedRef = useRef(false);

  // Keep the api module's token in sync whenever our state changes.
  useEffect(() => {
    setAccessToken(accessToken);
  }, [accessToken]);

  // Register the callback that the api interceptor calls after an auto-refresh.
  useEffect(() => {
    onTokenRefresh((data) => {
      if (data) {
        setToken(data.accessToken);
        setUser(data.user);
      } else {
        // Refresh failed — clear state.
        setToken(null);
        setUser(null);
      }
    });
  }, []);

  // Silent refresh on mount — restores session from the HttpOnly cookie.
  useEffect(() => {
    if (refreshedRef.current) return;
    refreshedRef.current = true;

    api
      .post('/api/auth/refresh')
      .then((res) => {
        setToken(res.data.accessToken);
        setUser(res.data.user);
      })
      .catch(() => {
        // No valid cookie — user is logged out; that's fine.
      })
      .finally(() => setIsLoading(false));
  }, []);

  /** login — authenticates with email/password and stores the token. */
  const login = useCallback(async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    setToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  /** register — creates account, auto-logs-in, and stores the token. */
  const register = useCallback(async (username, email, password) => {
    const res = await api.post('/api/auth/register', { username, email, password });
    setToken(res.data.accessToken);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  /** logout — revokes refresh token (server-side) and clears local state. */
  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
    } catch {
      // Best-effort — clear local state regardless.
    }
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,
    accessToken,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** @returns {{ user: AuthUser|null, accessToken: string|null, isAuthenticated: boolean, isLoading: boolean, login: Function, register: Function, logout: Function }} */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
