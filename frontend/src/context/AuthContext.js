import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const token = localStorage.getItem('neuronotes_token');
    const savedUser = localStorage.getItem('neuronotes_user');

    if (token && savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setTheme(parsedUser?.preferences?.theme || 'light');

      authAPI.getMe()
        .then((res) => {
          setUser(res.data.user);
          setTheme(res.data.user?.preferences?.theme || 'light');
        })
        .catch(() => {
          localStorage.removeItem('neuronotes_token');
          localStorage.removeItem('neuronotes_user');
          setUser(null);
          setTheme('light');
        })
        .finally(() => setLoading(false));
    } else {
      setTheme('light');
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user: nextUser } = res.data;
    localStorage.setItem('neuronotes_token', token);
    localStorage.setItem('neuronotes_user', JSON.stringify(nextUser));
    setUser(nextUser);
    setTheme(nextUser?.preferences?.theme || 'light');
    return nextUser;
  }, []);

  const register = useCallback(async (name, email, password, confirmPassword) => {
    const res = await authAPI.register({ name, email, password, confirmPassword });
    const { token, user: nextUser } = res.data;
    localStorage.setItem('neuronotes_token', token);
    localStorage.setItem('neuronotes_user', JSON.stringify(nextUser));
    setUser(nextUser);
    setTheme(nextUser?.preferences?.theme || 'light');
    return nextUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('neuronotes_token');
    localStorage.removeItem('neuronotes_user');
    setUser(null);
    setTheme('light');
  }, []);

  const updateUser = useCallback((updates) => {
    const updated = {
      ...user,
      ...updates,
      preferences: {
        ...(user?.preferences || {}),
        ...(updates?.preferences || {})
      }
    };

    setUser(updated);
    localStorage.setItem('neuronotes_user', JSON.stringify(updated));

    if (updated?.preferences?.theme) {
      setTheme(updated.preferences.theme);
    }
  }, [user]);

  const updateTheme = useCallback((nextTheme) => {
    setTheme(nextTheme);

    if (user) {
      const updated = {
        ...user,
        preferences: {
          ...(user.preferences || {}),
          theme: nextTheme
        }
      };

      setUser(updated);
      localStorage.setItem('neuronotes_user', JSON.stringify(updated));
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, theme, setTheme: updateTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
