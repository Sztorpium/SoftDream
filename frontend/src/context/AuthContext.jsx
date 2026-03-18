/*
 * AuthContext – global authentication state.
 *
 * Provides:
 *   - user     : { userId, username, email, role } | null
 *   - token    : string | null
 *   - isAdmin  : boolean
 *   - loading  : boolean
 *   - login()  : async (credentials) → void
 *   - register(): async (data) → void
 *   - logout() : void
 *
 * The JWT and the user profile returned by the API are stored together as a
 * single JSON object in localStorage under "softdream_auth".  Storing them
 * together (rather than as two separate keys) keeps the session data in one
 * place and makes a clean logout easy: remove one key.
 *
 * NOTE: Since the backend JWT only embeds the username claim (not userId /
 * email / role), the full user profile cannot be reconstructed from the token
 * alone without an extra /me round-trip.  We therefore persist it alongside
 * the token.  If you add a GET /api/users/me endpoint in the future you can
 * drop the stored profile and fetch it on mount instead.
 *
 * The useAuth hook is intentionally co-located with its provider.
 */

/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useState } from 'react';
import * as authApi from '../api/auth';

const AUTH_KEY = 'softdream_auth';

function loadAuth() {
  try {
    const stored = localStorage.getItem(AUTH_KEY);
    return stored ? JSON.parse(stored) : { token: null, user: null };
  } catch {
    return { token: null, user: null };
  }
}

function saveAuth(token, user) {
  if (token && user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify({ token, user }));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const initial = loadAuth();
  const [token,   setToken]   = useState(initial.token);
  const [user,    setUser]    = useState(initial.user);
  const [loading, setLoading] = useState(false);

  function applySession(response) {
    const u = {
      userId:   response.userId,
      username: response.username,
      email:    response.email,
      role:     response.role,
    };
    setToken(response.token);
    setUser(u);
    saveAuth(response.token, u);
  }

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      applySession(await authApi.login(credentials));
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    try {
      applySession(await authApi.register(data));
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  }, []);

  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, isAdmin, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
