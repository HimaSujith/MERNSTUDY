import { createContext, useCallback, useEffect, useState } from 'react';
import { authApi } from '../api/auth.api';
import { setAccessToken, setOnAuthFailure } from '../api/axiosClient';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setOnAuthFailure(clearSession);
  }, [clearSession]);

  useEffect(() => {
    async function restoreSession() {
      try {
        const { accessToken } = await authApi.refresh();
        setAccessToken(accessToken);
        const me = await authApi.me();
        setUser(me);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, [clearSession]);

  const login = useCallback(async (email, password) => {
    const { accessToken, user: loggedInUser } = await authApi.login(email, password);
    setAccessToken(accessToken);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
